import pg from 'pg';
import { existsSync } from 'fs';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida. Ejecutar:');
  console.error('   $env:DATABASE_URL="postgresql://..." ; node tests/admin-services-crud.mjs');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

let passed = 0;
let failed = 0;

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
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
    if (result.rows.length === 0) {
      assert(label, false, 'No se encontraron filas');
      return;
    }
    const row = result.rows[0];
    const allOk = Object.entries(checks).every(([key, value]) => row[key] === value);
    assert(label, allOk, JSON.stringify({ actual: row, expected: checks }));
  } catch (e) {
    assert(label, false, e.message);
  }
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
console.log('\n📋 Tabla services y RLS');
const tableCheck = await query(
  `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'services'`
);
assert('Tabla services existe', tableCheck.rows.length === 1);

await assertRow('RLS está habilitado en services',
  `SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'services'`,
  [], { relrowsecurity: true });

// ================================================================
// 3. COUNT SEED DATA
// ================================================================
console.log('\n📊 Datos iniciales');
const countResult = await query(`SELECT COUNT(*)::int as count FROM services`);
assert('Seed data existe (>= 4 servicios)', countResult.rows[0].count >= 4);
console.log(`   → ${countResult.rows[0].count} servicios en BD`);

// ================================================================
// 4. TEST PAGINATION — server-side
// ================================================================
console.log('\n📄 Paginación server-side');
const total = (await query(`SELECT COUNT(*)::int as count FROM services`)).rows[0].count;

const page1 = await query(`SELECT * FROM services ORDER BY order_index ASC LIMIT 2 OFFSET 0`);
const page2 = await query(`SELECT * FROM services ORDER BY order_index ASC LIMIT 2 OFFSET 2`);
assert('Página 1 devuelve 2 registros', page1.rows.length === 2);
assert('Página 2 tiene contenido (no se solapa con página 1)',
  page2.rows.length > 0 && page1.rows[0].id !== page2.rows[0].id);
assert('LIMIT se aplica en servidor (no más de 2 por página)', page1.rows.length <= 2);

// ================================================================
// 5. TEST SEARCH — server-side ILIKE
// ================================================================
console.log('\n🔍 Búsqueda server-side');
const searchResult = await query(`SELECT * FROM services WHERE title ILIKE $1`, ['%insumos%']);
assert('Búsqueda ILIKE encuentra "insumos"', searchResult.rows.length >= 1);
assert('Resultado contiene el término buscado',
  searchResult.rows[0].title.toLowerCase().includes('insumos'));

const emptySearch = await query(`SELECT * FROM services WHERE title ILIKE $1`, ['%xyznotexist%']);
assert('Búsqueda sin resultados devuelve 0 filas', emptySearch.rows.length === 0);

// ================================================================
// 6. TEST SORTING — server-side
// ================================================================
console.log('\n🔢 Ordenamiento server-side');
const ascResult = await query(`SELECT * FROM services ORDER BY title ASC`);
const descResult = await query(`SELECT * FROM services ORDER BY title DESC`);
assert('Orden ASC vs DESC son distintos', ascResult.rows[0].id !== descResult.rows[0].id);
assert('ASC: primero alfabético', ascResult.rows[0].title <= ascResult.rows[1].title);
assert('DESC: primero alfabético inverso', descResult.rows[0].title >= descResult.rows[1].title);

// ================================================================
// 7. TEST CREATE (INSERT)
// ================================================================
console.log('\n✏️ CREATE — Insertar nuevo servicio');
const newId = '00000000-0000-0000-0000-000000000001';
const insertResult = await query(
  `INSERT INTO services (id, title, description, features, icon_name, color_scheme, order_index, active)
   VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8)
   RETURNING id, title, active`,
  [newId, 'Servicio de Prueba', 'Descripción de prueba', '["Feature 1","Feature 2"]', 'Leaf', 'green', 99, true]
);
assert('INSERT devuelve el registro creado', insertResult.rows.length === 1);
assertRow('Campos del servicio creado correctos',
  `SELECT id, title, active FROM services WHERE id = $1`,
  [newId], { id: newId, title: 'Servicio de Prueba', active: true });

const featuresCheck = await query(`SELECT jsonb_typeof(features) as ftype FROM services WHERE id = $1`, [newId]);
assert('features es tipo JSONB array', featuresCheck.rows[0].ftype === 'array');

const featuresData = await query(`SELECT features FROM services WHERE id = $1`, [newId]);
assert('features contiene 2 elementos', featuresData.rows[0].features.length === 2);

// ================================================================
// 8. TEST READ
// ================================================================
console.log('\n📖 READ — Leer servicio por ID');
const readResult = await query(`SELECT * FROM services WHERE id = $1`, [newId]);
assert('SELECT por ID encuentra el registro', readResult.rows.length === 1);
assert('Título coincide: "Servicio de Prueba"', readResult.rows[0].title === 'Servicio de Prueba');
assert('Description coincide: "Descripción de prueba"', readResult.rows[0].description === 'Descripción de prueba');

// ================================================================
// 9. TEST UPDATE
// ================================================================
console.log('\n📝 UPDATE — Actualizar servicio');
const updateResult = await query(
  `UPDATE services SET title = $1, description = $2, order_index = $3 WHERE id = $4 RETURNING id, title, description, order_index`,
  ['Servicio Actualizado', 'Descripción actualizada', 50, newId]
);
assert('UPDATE devuelve el registro actualizado', updateResult.rows.length === 1);
assert('Título actualizado a "Servicio Actualizado"', updateResult.rows[0].title === 'Servicio Actualizado');
assert('Description actualizada', updateResult.rows[0].description === 'Descripción actualizada');
assert('order_index actualizado a 50', updateResult.rows[0].order_index === 50);

const verifyUpdate = await query(`SELECT title FROM services WHERE id = $1`, [newId]);
assert('UPDATE persiste en BD', verifyUpdate.rows[0].title === 'Servicio Actualizado');

// ================================================================
// 10. TEST TOGGLE (active/inactive)
// ================================================================
console.log('\n🔄 TOGGLE — Activar/Desactivar');
await query(`UPDATE services SET active = false WHERE id = $1`, [newId]);
const afterDeactivate = await query(`SELECT active FROM services WHERE id = $1`, [newId]);
assert('Desactivar: active = false', afterDeactivate.rows[0].active === false);

await query(`UPDATE services SET active = true WHERE id = $1`, [newId]);
const afterActivate = await query(`SELECT active FROM services WHERE id = $1`, [newId]);
assert('Activar: active = true', afterActivate.rows[0].active === true);

await query(`UPDATE services SET active = false WHERE id = $1`, [newId]);
await query(`UPDATE services SET active = true WHERE id = $1`, [newId]);
const finalState = await query(`SELECT active FROM services WHERE id = $1`, [newId]);
assert('Doble toggle (off→on) termina activo', finalState.rows[0].active === true);

// ================================================================
// 11. TEST DELETE
// ================================================================
console.log('\n🗑️ DELETE — Eliminar servicio');
const deleteResult = await query(`DELETE FROM services WHERE id = $1 RETURNING id`, [newId]);
assert('DELETE devuelve el ID eliminado', deleteResult.rows.length === 1);
assert('ID eliminado coincide', deleteResult.rows[0].id === newId);

const afterDelete = await query(`SELECT * FROM services WHERE id = $1`, [newId]);
assert('Registro ya no existe después de DELETE', afterDelete.rows.length === 0);

// ================================================================
// 12. TEST RLS POLICIES
// ================================================================
console.log('\n🔒 Políticas RLS');

const policies = await query(`
  SELECT policyname, permissive, roles, cmd, qual, with_check
  FROM pg_policies
  WHERE tablename = 'services'
  ORDER BY policyname
`);
assert('Hay políticas RLS definidas en services (>= 4)', policies.rows.length >= 4);

const policyNames = policies.rows.map(r => r.policyname).sort();
assert('Tiene public_read_services', policyNames.includes('public_read_services'));
assert('Tiene admin_insert_services', policyNames.includes('admin_insert_services'));
assert('Tiene admin_update_services', policyNames.includes('admin_update_services'));
assert('Tiene admin_delete_services', policyNames.includes('admin_delete_services'));

const readPolicy = policies.rows.find(r => r.policyname === 'public_read_services');
const qualLower = (readPolicy?.qual ?? '').toLowerCase();
assert('public_read_services filtra por active=true',
  qualLower.includes('active') && qualLower.includes('true'));

const insertPolicy = policies.rows.find(r => r.policyname === 'admin_insert_services');
const insertCheck = (insertPolicy?.with_check ?? '').toLowerCase();
assert('admin_insert_services usa is_admin() en WITH CHECK', insertCheck.includes('is_admin'));

for (const name of ['admin_update_services', 'admin_delete_services']) {
  const pol = policies.rows.find(r => r.policyname === name);
  const ql = (pol?.qual ?? '').toLowerCase();
  assert(`${name} usa is_admin()`, ql.includes('is_admin'));
}

// ================================================================
// 13. TEST PUBLIC READ (only active=true)
// ================================================================
console.log('\n🌐 Lectura pública — solo active=true');
const allCount = (await query(`SELECT COUNT(*)::int as count FROM services`)).rows[0].count;
const activeCount = (await query(`SELECT COUNT(*)::int as count FROM services WHERE active = true`)).rows[0].count;

console.log(`   → ${allCount} totales, ${activeCount} activos`);
assert('activeCount <= allCount', activeCount <= allCount);

const tempId = (await query(`SELECT id FROM services WHERE active = true LIMIT 1`)).rows[0].id;
await query(`UPDATE services SET active = false WHERE id = $1`, [tempId]);
const afterDeactCount = (await query(`SELECT COUNT(*)::int as count FROM services WHERE active = true`)).rows[0].count;
await query(`UPDATE services SET active = true WHERE id = $1`, [tempId]);
const afterReCount = (await query(`SELECT COUNT(*)::int as count FROM services WHERE active = true`)).rows[0].count;

assert('Desactivar reduce el conteo de activos (decrementa en 1)', afterDeactCount === activeCount - 1);
assert('Reactivar restaura el conteo original', afterReCount === activeCount);

// ================================================================
// 14. TEST CHECK CONSTRAINTS
// ================================================================
console.log('\n⚠️  Restricciones CHECK');
await assertError('color_scheme inválido es rechazado',
  `INSERT INTO services (title, description, features, icon_name, color_scheme, order_index)
   VALUES ('Test', 'Test', '[]'::jsonb, 'Wheat', 'invalid_color', 0)`,
  []);

await assertError('title NULL es rechazado',
  `INSERT INTO services (title, description, features, icon_name, color_scheme, order_index)
   VALUES (NULL, 'Test', '[]'::jsonb, 'Wheat', 'green', 0)`,
  []);

// ================================================================
// 15. TEST NO REGRESSION — original seed data intact
// ================================================================
console.log('\n🔄 Regresiones — datos seed originales');
const seedServices = await query(`SELECT title, order_index FROM services ORDER BY order_index ASC`);
const titles = seedServices.rows.map(r => r.title);
assert('Servicio "Insumos Agropecuarios" existe (orden 0)', titles[0] === 'Insumos Agropecuarios');
assert('Servicio "Soluciones Agricolas" existe (orden 1)', titles[1] === 'Soluciones Agricolas');
assert('Servicio "Soluciones Ganaderas" existe (orden 2)', titles[2] === 'Soluciones Ganaderas');
assert('Servicio "Capacitacion y Acompanamiento" existe (orden 3)', titles[3] === 'Capacitacion y Acompanamiento');

// ================================================================
// 16. VERIFY FRONTEND FILES INTEGRITY
// ================================================================
console.log('\n📁 Archivos del módulo — integridad');
const moduleFiles = [
  'src/lib/admin/services.ts',
  'src/hooks/admin/useServices.ts',
  'src/pages/admin/Services/ServiceList.tsx',
  'src/pages/admin/Services/ServiceForm.tsx',
];
for (const f of moduleFiles) {
  assert(`Archivo ${f} existe`, existsSync(f));
}

// ================================================================
// SUMMARY
// ================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`RESULTADOS: ${passed} ✅  |  ${failed} ❌  |  ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

await pool.end();
process.exit(failed > 0 ? 1 : 0);
