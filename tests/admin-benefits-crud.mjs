import pg from 'pg';
import { existsSync } from 'fs';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida. Ejecutar:');
  console.error('   $env:DATABASE_URL="postgresql://..." ; node tests/admin-benefits-crud.mjs');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function query(text, params) {
  const client = await pool.connect();
  try { return await client.query(text, params); }
  finally { client.release(); }
}

let passed = 0;
let failed = 0;

function assert(label, condition, detail = '') {
  if (condition) { console.log(`  ✅ ${label}`); passed++; }
  else { console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`); failed++; }
}

async function assertError(label, sql, params) {
  try {
    await query(sql, params);
    assert(label, false, 'Se esperaba un error pero la consulta se ejecutó sin errores');
  } catch (e) {
    assert(label, true, `Error esperado: ${e.message.slice(0, 100)}`);
  }
}

async function assertRow(label, sql, params, checks) {
  try {
    const result = await query(sql, params);
    if (result.rows.length === 0) { assert(label, false, 'No se encontraron filas'); return; }
    const row = result.rows[0];
    const allOk = Object.entries(checks).every(([key, value]) => row[key] === value);
    assert(label, allOk, JSON.stringify({ actual: row, expected: checks }));
  } catch (e) { assert(label, false, e.message); }
}

// ================================================================
// 1. DATABASE CONNECTION
// ================================================================
console.log('\n📡 Conexión a base de datos');
try {
  const result = await query('SELECT version()');
  assert('Conexión exitosa', result.rows.length === 1, result.rows[0].version.slice(0, 60));
} catch (e) {
  assert('Conexión exitosa', false, e.message);
}

// ================================================================
// 2. VERIFY TABLE AND RLS EXIST
// ================================================================
console.log('\n📋 Tabla benefits y RLS');
const tableCheck = await query(
  `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'benefits'`
);
assert('Tabla benefits existe', tableCheck.rows.length === 1);

await assertRow('RLS está habilitado en benefits',
  `SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'benefits'`,
  [], { relrowsecurity: true });

// ================================================================
// 3. COUNT SEED DATA
// ================================================================
console.log('\n📊 Datos iniciales');
const countResult = await query(`SELECT COUNT(*)::int as count FROM benefits`);
assert('Seed data existe (>= 4 beneficios)', countResult.rows[0].count >= 4);
console.log(`   → ${countResult.rows[0].count} beneficios en BD`);

// ================================================================
// 4. TEST PAGINATION — server-side
// ================================================================
console.log('\n📄 Paginación server-side');
const total = (await query(`SELECT COUNT(*)::int as count FROM benefits`)).rows[0].count;

const page1 = await query(`SELECT * FROM benefits ORDER BY order_index ASC LIMIT 2 OFFSET 0`);
const page2 = await query(`SELECT * FROM benefits ORDER BY order_index ASC LIMIT 2 OFFSET 2`);
assert('Página 1 devuelve 2 registros', page1.rows.length === 2);
assert('Página 2 tiene contenido (no se solapa)',
  page2.rows.length > 0 && page1.rows[0].id !== page2.rows[0].id);
assert('LIMIT se aplica en servidor', page1.rows.length <= 2);

// ================================================================
// 5. TEST SEARCH — server-side ILIKE
// ================================================================
console.log('\n🔍 Búsqueda server-side');
const searchResult = await query(`SELECT * FROM benefits WHERE title ILIKE $1`, ['%colaborativo%']);
assert('Búsqueda ILIKE encuentra beneficios', searchResult.rows.length >= 1);
assert('Resultado contiene término buscado',
  searchResult.rows[0].title.toLowerCase().includes('colaborativo'));

const emptySearch = await query(`SELECT * FROM benefits WHERE title ILIKE $1`, ['%xyznotexist%']);
assert('Búsqueda sin resultados devuelve 0 filas', emptySearch.rows.length === 0);

// Search by description
const descSearch = await query(`SELECT * FROM benefits WHERE description ILIKE $1`, ['%capacitaciones%']);
assert('Búsqueda ILIKE en description encuentra', descSearch.rows.length >= 1);

// ================================================================
// 6. TEST SORTING — server-side
// ================================================================
console.log('\n🔢 Ordenamiento server-side');
const ascResult = await query(`SELECT * FROM benefits ORDER BY title ASC`);
const descResult = await query(`SELECT * FROM benefits ORDER BY title DESC`);
assert('Orden ASC vs DESC son distintos', ascResult.rows[0].id !== descResult.rows[0].id);
assert('ASC: primero alfabético', ascResult.rows[0].title <= ascResult.rows[1].title);
assert('DESC: primero alfabético inverso', descResult.rows[0].title >= descResult.rows[1].title);

// ================================================================
// 7. TEST CREATE (INSERT)
// ================================================================
console.log('\n✏️ CREATE — Insertar nuevo beneficio');
const newId = '00000000-0000-0000-0000-0000000000b1';
const insertResult = await query(
  `INSERT INTO benefits (id, title, description, icon_name, order_index, active)
   VALUES ($1, $2, $3, $4, $5, $6)
   RETURNING id, title, active`,
  [newId, 'Beneficio de Prueba', 'Descripción de prueba', 'Star', 99, true]
);
assert('INSERT devuelve registro', insertResult.rows.length === 1);
assertRow('Campos correctos',
  `SELECT id, title, active FROM benefits WHERE id = $1`,
  [newId], { id: newId, title: 'Beneficio de Prueba', active: true });

// ================================================================
// 8. TEST READ
// ================================================================
console.log('\n📖 READ');
const readResult = await query(`SELECT * FROM benefits WHERE id = $1`, [newId]);
assert('SELECT por ID encuentra registro', readResult.rows.length === 1);
assert('Título coincide', readResult.rows[0].title === 'Beneficio de Prueba');
assert('Descripción coincide', readResult.rows[0].description === 'Descripción de prueba');
assert('icon_name coincide', readResult.rows[0].icon_name === 'Star');
assert('order_index coincide', readResult.rows[0].order_index === 99);
assert('active = true', readResult.rows[0].active === true);

// ================================================================
// 9. TEST UPDATE
// ================================================================
console.log('\n📝 UPDATE');
const updateResult = await query(
  `UPDATE benefits SET title = $1, description = $2, icon_name = $3, order_index = $4 WHERE id = $5 RETURNING id, title, description, icon_name, order_index`,
  ['Beneficio Actualizado', 'Desc actualizada', 'Heart', 50, newId]
);
assert('UPDATE devuelve registro', updateResult.rows.length === 1);
assert('Título actualizado', updateResult.rows[0].title === 'Beneficio Actualizado');
assert('Descripción actualizada', updateResult.rows[0].description === 'Desc actualizada');
assert('icon_name actualizado', updateResult.rows[0].icon_name === 'Heart');
assert('order_index actualizado a 50', updateResult.rows[0].order_index === 50);

const verifyUpdate = await query(`SELECT title FROM benefits WHERE id = $1`, [newId]);
assert('UPDATE persiste en BD', verifyUpdate.rows[0].title === 'Beneficio Actualizado');

// ================================================================
// 10. TEST TOGGLE (active/inactive)
// ================================================================
console.log('\n🔄 TOGGLE');
await query(`UPDATE benefits SET active = false WHERE id = $1`, [newId]);
const off = await query(`SELECT active FROM benefits WHERE id = $1`, [newId]);
assert('Desactivar: false', off.rows[0].active === false);

await query(`UPDATE benefits SET active = true WHERE id = $1`, [newId]);
const on = await query(`SELECT active FROM benefits WHERE id = $1`, [newId]);
assert('Activar: true', on.rows[0].active === true);

await query(`UPDATE benefits SET active = false WHERE id = $1`, [newId]);
await query(`UPDATE benefits SET active = true WHERE id = $1`, [newId]);
const finalToggle = await query(`SELECT active FROM benefits WHERE id = $1`, [newId]);
assert('Doble toggle termina activo', finalToggle.rows[0].active === true);

// ================================================================
// 11. TEST DELETE
// ================================================================
console.log('\n🗑️ DELETE');
const deleteResult = await query(`DELETE FROM benefits WHERE id = $1 RETURNING id`, [newId]);
assert('DELETE devuelve ID', deleteResult.rows.length === 1);
assert('ID coincide', deleteResult.rows[0].id === newId);

const afterDelete = await query(`SELECT * FROM benefits WHERE id = $1`, [newId]);
assert('Registro ya no existe', afterDelete.rows.length === 0);

// ================================================================
// 12. TEST RLS POLICIES
// ================================================================
console.log('\n🔒 Políticas RLS');
const policies = await query(`
  SELECT policyname, permissive, roles, cmd, qual, with_check
  FROM pg_policies
  WHERE tablename = 'benefits'
  ORDER BY policyname
`);
assert('>= 4 políticas', policies.rows.length >= 4);

const policyNames = policies.rows.map(r => r.policyname).sort();
assert('public_read_benefits', policyNames.includes('public_read_benefits'));
assert('admin_insert_benefits', policyNames.includes('admin_insert_benefits'));
assert('admin_update_benefits', policyNames.includes('admin_update_benefits'));
assert('admin_delete_benefits', policyNames.includes('admin_delete_benefits'));

const readPol = policies.rows.find(r => r.policyname === 'public_read_benefits');
assert('public_read filtra active=true',
  (readPol?.qual ?? '').toLowerCase().includes('active = true'));

for (const name of ['admin_insert_benefits', 'admin_update_benefits', 'admin_delete_benefits']) {
  const p = policies.rows.find(r => r.policyname === name);
  const q = ((name === 'admin_insert_benefits' ? p?.with_check : p?.qual) ?? '').toLowerCase();
  assert(`${name} usa is_admin()`, q.includes('is_admin'));
}

// ================================================================
// 13. TEST PUBLIC READ (only active=true)
// ================================================================
console.log('\n🌐 Lectura pública — solo active=true');
const allCount = (await query(`SELECT COUNT(*)::int as count FROM benefits`)).rows[0].count;

// Ensure clean state: all seeds active
await query(`UPDATE benefits SET active = true`);
const activeCount = (await query(`SELECT COUNT(*)::int as count FROM benefits WHERE active = true`)).rows[0].count;
assert('activos <= totales', activeCount <= allCount);

// Toggle one seed and verify
const firstSeedId = (await query(`SELECT id FROM benefits WHERE active = true LIMIT 1`)).rows[0].id;
await query(`UPDATE benefits SET active = false WHERE id = $1`, [firstSeedId]);
const afterDeact = (await query(`SELECT COUNT(*)::int as count FROM benefits WHERE active = true`)).rows[0].count;
assert('Desactivar reduce conteo activos en 1', afterDeact === activeCount - 1);

await query(`UPDATE benefits SET active = true WHERE id = $1`, [firstSeedId]);
const afterReact = (await query(`SELECT COUNT(*)::int as count FROM benefits WHERE active = true`)).rows[0].count;
assert('Reactivar restaura conteo original', afterReact === activeCount);

// ================================================================
// 14. TEST NO REGRESION — seed data intact
// ================================================================
console.log('\n🔄 Regresiones — datos seed originales');
const seedBenefits = await query(`SELECT title, order_index FROM benefits ORDER BY order_index ASC`);
const titles = seedBenefits.rows.map(r => r.title);
const indices = seedBenefits.rows.map(r => r.order_index);
assert('"Ambiente colaborativo" existe (orden 0)', titles[0] === 'Ambiente colaborativo' && indices[0] === 0);
assert('"Desarrollo profesional" existe (orden 1)', titles[1] === 'Desarrollo profesional' && indices[1] === 1);
assert('"Crecimiento" existe (orden 2)', titles[2] === 'Crecimiento' && indices[2] === 2);
assert('"Bienestar" existe (orden 3)', titles[3] === 'Bienestar' && indices[3] === 3);

// ================================================================
// 15. TEST NOT NULL CONSTRAINTS
// ================================================================
console.log('\n⚠️  Restricciones NOT NULL');
await assertError('title NULL es rechazado',
  `INSERT INTO benefits (id, title, description, icon_name, order_index) VALUES ($1,NULL,'Test','Users',0)`,
  ['00000000-0000-0000-0000-0000000000b2']);

await assertError('description NULL es rechazado',
  `INSERT INTO benefits (id, title, description, icon_name, order_index) VALUES ($1,'Test',NULL,'Users',0)`,
  ['00000000-0000-0000-0000-0000000000b3']);

// ================================================================
// 16. VERIFY FRONTEND FILES INTEGRITY
// ================================================================
console.log('\n📁 Archivos del módulo');
const moduleFiles = [
  'src/lib/admin/benefits.ts',
  'src/hooks/admin/useBenefits.ts',
  'src/pages/admin/Benefits/BenefitList.tsx',
  'src/pages/admin/Benefits/BenefitForm.tsx',
];
for (const f of moduleFiles) {
  assert(`Archivo ${f} existe`, existsSync(f));
}

// ================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`RESULTADOS: ${passed} ✅  |  ${failed} ❌  |  ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

await pool.end();
process.exit(failed > 0 ? 1 : 0);
