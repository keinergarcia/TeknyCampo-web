import pg from 'pg';
import { existsSync } from 'fs';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida. Ejecutar:');
  console.error('   $env:DATABASE_URL="postgresql://..." ; node tests/admin-experiencia-entities-crud.mjs');
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
// PARTE 1: EXPERIENCE ITEMS
// ================================================================

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
// 2. VERIFY TABLE AND RLS EXIST — experience_items
// ================================================================
console.log('\n📋 Tabla experience_items y RLS');
const tableCheck1 = await query(
  `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'experience_items'`
);
assert('Tabla experience_items existe', tableCheck1.rows.length === 1);

await assertRow('RLS está habilitado en experience_items',
  `SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'experience_items'`,
  [], { relrowsecurity: true });

// ================================================================
// 3. COUNT SEED DATA — experience_items
// ================================================================
console.log('\n📊 Datos iniciales — experience_items');
const countExp = await query(`SELECT COUNT(*)::int as count FROM experience_items`);
assert('Seed data existe (>= 6 items)', countExp.rows[0].count >= 6);
console.log(`   → ${countExp.rows[0].count} items de experiencia en BD`);

// ================================================================
// 4. TEST PAGINATION — experience_items
// ================================================================
console.log('\n📄 Paginación server-side — experience_items');
const totalExp = (await query(`SELECT COUNT(*)::int as count FROM experience_items`)).rows[0].count;

const page1Exp = await query(`SELECT * FROM experience_items ORDER BY order_index ASC LIMIT 3 OFFSET 0`);
const page2Exp = await query(`SELECT * FROM experience_items ORDER BY order_index ASC LIMIT 3 OFFSET 3`);
assert('Página 1 devuelve 3 registros', page1Exp.rows.length === 3);
assert('Página 2 tiene contenido (no se solapa con pág 1)',
  page2Exp.rows.length > 0 && page1Exp.rows[0].id !== page2Exp.rows[0].id);
assert('LIMIT se aplica en servidor', page1Exp.rows.length <= 3);

// ================================================================
// 5. TEST SEARCH — experience_items (text ILIKE)
// ================================================================
console.log('\n🔍 Búsqueda server-side — experience_items');
const searchExp = await query(`SELECT * FROM experience_items WHERE text ILIKE $1`, ['%agro%']);
assert('Búsqueda ILIKE encuentra "agro"', searchExp.rows.length >= 2);
assert('Resultado contiene el término buscado',
  searchExp.rows[0].text.toLowerCase().includes('agro'));

const emptySearchExp = await query(`SELECT * FROM experience_items WHERE text ILIKE $1`, ['%xyznotexist%']);
assert('Búsqueda sin resultados devuelve 0 filas', emptySearchExp.rows.length === 0);

// ================================================================
// 6. TEST SORTING — experience_items
// ================================================================
console.log('\n🔢 Ordenamiento server-side — experience_items');
const ascExp = await query(`SELECT * FROM experience_items ORDER BY text ASC`);
const descExp = await query(`SELECT * FROM experience_items ORDER BY text DESC`);
assert('Orden ASC vs DESC son distintos', ascExp.rows[0].id !== descExp.rows[0].id);
assert('ASC: primero alfabético', ascExp.rows[0].text <= ascExp.rows[1].text);
assert('DESC: primero alfabético inverso', descExp.rows[0].text >= descExp.rows[1].text);

// ================================================================
// 7. TEST CREATE — experience_items
// ================================================================
console.log('\n✏️ CREATE — Insertar nuevo item de experiencia');
const newExpId = '00000000-0000-0000-0000-000000000010';
const insertExp = await query(
  `INSERT INTO experience_items (id, text, order_index, active)
   VALUES ($1, $2, $3, $4) RETURNING id, text, active`,
  [newExpId, 'Item de prueba', 99, true]
);
assert('INSERT devuelve el registro creado', insertExp.rows.length === 1);
assertRow('Campos del item creado correctos',
  `SELECT id, text, active FROM experience_items WHERE id = $1`,
  [newExpId], { id: newExpId, text: 'Item de prueba', active: true });

// ================================================================
// 8. TEST READ — experience_items
// ================================================================
console.log('\n📖 READ — Leer item por ID');
const readExp = await query(`SELECT * FROM experience_items WHERE id = $1`, [newExpId]);
assert('SELECT por ID encuentra el registro', readExp.rows.length === 1);
assert('Texto coincide', readExp.rows[0].text === 'Item de prueba');

// ================================================================
// 9. TEST UPDATE — experience_items
// ================================================================
console.log('\n📝 UPDATE — Actualizar item');
const updateExp = await query(
  `UPDATE experience_items SET text = $1, order_index = $2 WHERE id = $3 RETURNING id, text, order_index`,
  ['Item actualizado', 50, newExpId]
);
assert('UPDATE devuelve el registro actualizado', updateExp.rows.length === 1);
assert('Texto actualizado', updateExp.rows[0].text === 'Item actualizado');
assert('order_index actualizado a 50', updateExp.rows[0].order_index === 50);

const verifyExp = await query(`SELECT text FROM experience_items WHERE id = $1`, [newExpId]);
assert('UPDATE persiste en BD', verifyExp.rows[0].text === 'Item actualizado');

// ================================================================
// 10. TEST TOGGLE — experience_items
// ================================================================
console.log('\n🔄 TOGGLE — Activar/Desactivar');
await query(`UPDATE experience_items SET active = false WHERE id = $1`, [newExpId]);
const afterDeactExp = await query(`SELECT active FROM experience_items WHERE id = $1`, [newExpId]);
assert('Desactivar: active = false', afterDeactExp.rows[0].active === false);

await query(`UPDATE experience_items SET active = true WHERE id = $1`, [newExpId]);
const afterActExp = await query(`SELECT active FROM experience_items WHERE id = $1`, [newExpId]);
assert('Activar: active = true', afterActExp.rows[0].active === true);

await query(`UPDATE experience_items SET active = false WHERE id = $1`, [newExpId]);
await query(`UPDATE experience_items SET active = true WHERE id = $1`, [newExpId]);
const finalExp = await query(`SELECT active FROM experience_items WHERE id = $1`, [newExpId]);
assert('Doble toggle (off→on) termina activo', finalExp.rows[0].active === true);

// ================================================================
// 11. TEST DELETE — experience_items
// ================================================================
console.log('\n🗑️ DELETE — Eliminar item');
const delExp = await query(`DELETE FROM experience_items WHERE id = $1 RETURNING id`, [newExpId]);
assert('DELETE devuelve el ID eliminado', delExp.rows.length === 1);
assert('ID eliminado coincide', delExp.rows[0].id === newExpId);

const afterDelExp = await query(`SELECT * FROM experience_items WHERE id = $1`, [newExpId]);
assert('Registro ya no existe después de DELETE', afterDelExp.rows.length === 0);

// ================================================================
// 12. TEST RLS POLICIES — experience_items
// ================================================================
console.log('\n🔒 Políticas RLS — experience_items');

const policiesExp = await query(`
  SELECT policyname, permissive, roles, cmd, qual, with_check
  FROM pg_policies
  WHERE tablename = 'experience_items'
  ORDER BY policyname
`);
assert('Hay políticas RLS definidas (>= 4)', policiesExp.rows.length >= 4);

const pnExp = policiesExp.rows.map(r => r.policyname).sort();
assert('Tiene public_read_experience_items', pnExp.includes('public_read_experience_items'));
assert('Tiene admin_insert_experience_items', pnExp.includes('admin_insert_experience_items'));
assert('Tiene admin_update_experience_items', pnExp.includes('admin_update_experience_items'));
assert('Tiene admin_delete_experience_items', pnExp.includes('admin_delete_experience_items'));

const readPolExp = policiesExp.rows.find(r => r.policyname === 'public_read_experience_items');
const qualExp = (readPolExp?.qual ?? '').toLowerCase();
assert('public_read_experience_items filtra active=true',
  qualExp.includes('active') && qualExp.includes('true'));

const insPolExp = policiesExp.rows.find(r => r.policyname === 'admin_insert_experience_items');
const insChkExp = (insPolExp?.with_check ?? '').toLowerCase();
assert('admin_insert_experience_items usa is_admin()', insChkExp.includes('is_admin'));

for (const name of ['admin_update_experience_items', 'admin_delete_experience_items']) {
  const pol = policiesExp.rows.find(r => r.policyname === name);
  const ql = (pol?.qual ?? '').toLowerCase();
  assert(`${name} usa is_admin()`, ql.includes('is_admin'));
}

// ================================================================
// 13. TEST PUBLIC READ (active=true) — experience_items
// ================================================================
console.log('\n🌐 Lectura pública — active=true (experience_items)');
const allExp = (await query(`SELECT COUNT(*)::int as count FROM experience_items`)).rows[0].count;
const activeExp = (await query(`SELECT COUNT(*)::int as count FROM experience_items WHERE active = true`)).rows[0].count;
console.log(`   → ${allExp} totales, ${activeExp} activos`);
assert('activeCount <= allCount', activeExp <= allExp);

const tempExpId = (await query(`SELECT id FROM experience_items WHERE active = true LIMIT 1`)).rows[0].id;
await query(`UPDATE experience_items SET active = false WHERE id = $1`, [tempExpId]);
const afterDeactExpC = (await query(`SELECT COUNT(*)::int as count FROM experience_items WHERE active = true`)).rows[0].count;
await query(`UPDATE experience_items SET active = true WHERE id = $1`, [tempExpId]);
const afterReactExpC = (await query(`SELECT COUNT(*)::int as count FROM experience_items WHERE active = true`)).rows[0].count;

assert('Desactivar reduce conteo de activos (decrementa 1)', afterDeactExpC === activeExp - 1);
assert('Reactivar restaura conteo original', afterReactExpC === activeExp);

// ================================================================
// 14. TEST CHECK CONSTRAINTS — experience_items
// ================================================================
console.log('\n⚠️  Restricciones — experience_items');
await assertError('text NULL es rechazado',
  `INSERT INTO experience_items (id, text, order_index) VALUES ($1, NULL, 0)`,
  ['00000000-0000-0000-0000-000000000099']);

// ================================================================
// 15. TEST NO REGRESSION — seed experience_items intacto
// ================================================================
console.log('\n🔄 Regresiones — seed experience_items');
const seedItems = await query(`SELECT text, order_index FROM experience_items ORDER BY order_index ASC`);
const texts = seedItems.rows.map(r => r.text);
assert('"Experiencia en proyectos agropecuarios" existe (orden 0)', texts[0] === 'Experiencia en proyectos agropecuarios');
assert('"Acompanamiento tecnico especializado" existe (orden 1)', texts[1] === 'Acompanamiento tecnico especializado');
assert('"Soluciones integrales para el campo" existe (orden 2)', texts[2] === 'Soluciones integrales para el campo');
assert('"Cumplimiento y responsabilidad" existe (orden 3)', texts[3] === 'Cumplimiento y responsabilidad');
assert('"Innovacion y tecnologia aplicada al agro" existe (orden 4)', texts[4] === 'Innovacion y tecnologia aplicada al agro');
assert('"Compromiso con las comunidades rurales" existe (orden 5)', texts[5] === 'Compromiso con las comunidades rurales');

// ================================================================
// PARTE 2: ENTITIES
// ================================================================

// ================================================================
// 16. VERIFY TABLE AND RLS EXIST — entities
// ================================================================
console.log('\n📋 Tabla entities y RLS');
const tableCheck2 = await query(
  `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'entities'`
);
assert('Tabla entities existe', tableCheck2.rows.length === 1);

await assertRow('RLS está habilitado en entities',
  `SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'entities'`,
  [], { relrowsecurity: true });

// ================================================================
// 17. COUNT SEED DATA — entities
// ================================================================
console.log('\n📊 Datos iniciales — entities');
const countEnt = await query(`SELECT COUNT(*)::int as count FROM entities`);
assert('Seed data existe (>= 6 entidades)', countEnt.rows[0].count >= 6);
console.log(`   → ${countEnt.rows[0].count} entidades en BD`);

// ================================================================
// 18. TEST PAGINATION — entities
// ================================================================
console.log('\n📄 Paginación server-side — entities');
const totalEnt = (await query(`SELECT COUNT(*)::int as count FROM entities`)).rows[0].count;

const page1Ent = await query(`SELECT * FROM entities ORDER BY order_index ASC LIMIT 3 OFFSET 0`);
const page2Ent = await query(`SELECT * FROM entities ORDER BY order_index ASC LIMIT 3 OFFSET 3`);
assert('Página 1 devuelve 3 registros', page1Ent.rows.length === 3);
assert('Página 2 tiene contenido (no se solapa con pág 1)',
  page2Ent.rows.length > 0 && page1Ent.rows[0].id !== page2Ent.rows[0].id);
assert('LIMIT se aplica en servidor', page1Ent.rows.length <= 3);

// ================================================================
// 19. TEST SEARCH — entities (name ILIKE)
// ================================================================
console.log('\n🔍 Búsqueda server-side — entities');
const searchEnt = await query(`SELECT * FROM entities WHERE name ILIKE $1`, ['%aprasef%']);
assert('Búsqueda ILIKE encuentra "APRASEF"', searchEnt.rows.length >= 1);

const emptySearchEnt = await query(`SELECT * FROM entities WHERE name ILIKE $1`, ['%xyznotexist%']);
assert('Búsqueda sin resultados devuelve 0 filas', emptySearchEnt.rows.length === 0);

// ================================================================
// 20. TEST SORTING — entities
// ================================================================
console.log('\n🔢 Ordenamiento server-side — entities');
const ascEnt = await query(`SELECT * FROM entities ORDER BY name ASC`);
const descEnt = await query(`SELECT * FROM entities ORDER BY name DESC`);
assert('Orden ASC vs DESC son distintos', ascEnt.rows[0].id !== descEnt.rows[0].id);
assert('ASC: primero alfabético', ascEnt.rows[0].name <= ascEnt.rows[1].name);
assert('DESC: primero alfabético inverso', descEnt.rows[0].name >= descEnt.rows[1].name);

// ================================================================
// 21. TEST CREATE — entities
// ================================================================
console.log('\n✏️ CREATE — Insertar nueva entidad');
const newEntId = '00000000-0000-0000-0000-000000000020';
const insertEnt = await query(
  `INSERT INTO entities (id, name, full_name, description, icon_name, order_index, active)
   VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, active`,
  [newEntId, 'Entidad Test', 'Entidad de Prueba SA', 'Descripción de prueba', 'Building2', 99, true]
);
assert('INSERT devuelve el registro creado', insertEnt.rows.length === 1);
assertRow('Campos de entidad creada correctos',
  `SELECT id, name, active FROM entities WHERE id = $1`,
  [newEntId], { id: newEntId, name: 'Entidad Test', active: true });

// ================================================================
// 22. TEST READ — entities
// ================================================================
console.log('\n📖 READ — Leer entidad por ID');
const readEnt = await query(`SELECT * FROM entities WHERE id = $1`, [newEntId]);
assert('SELECT por ID encuentra el registro', readEnt.rows.length === 1);
assert('Nombre coincide: "Entidad Test"', readEnt.rows[0].name === 'Entidad Test');
assert('full_name coincide', readEnt.rows[0].full_name === 'Entidad de Prueba SA');
assert('description coincide', readEnt.rows[0].description === 'Descripción de prueba');

// ================================================================
// 23. TEST UPDATE — entities
// ================================================================
console.log('\n📝 UPDATE — Actualizar entidad');
const updateEnt = await query(
  `UPDATE entities SET name = $1, full_name = $2, description = $3, order_index = $4 WHERE id = $5 RETURNING id, name, full_name, order_index`,
  ['Entidad Actualizada', 'Entidad Actualizada SA', 'Descripción actualizada', 50, newEntId]
);
assert('UPDATE devuelve el registro actualizado', updateEnt.rows.length === 1);
assert('Nombre actualizado', updateEnt.rows[0].name === 'Entidad Actualizada');
assert('full_name actualizado', updateEnt.rows[0].full_name === 'Entidad Actualizada SA');
assert('order_index actualizado a 50', updateEnt.rows[0].order_index === 50);

const verifyEnt = await query(`SELECT name FROM entities WHERE id = $1`, [newEntId]);
assert('UPDATE persiste en BD', verifyEnt.rows[0].name === 'Entidad Actualizada');

// ================================================================
// 24. TEST TOGGLE — entities
// ================================================================
console.log('\n🔄 TOGGLE — Activar/Desactivar');
await query(`UPDATE entities SET active = false WHERE id = $1`, [newEntId]);
const afterDeactEnt = await query(`SELECT active FROM entities WHERE id = $1`, [newEntId]);
assert('Desactivar: active = false', afterDeactEnt.rows[0].active === false);

await query(`UPDATE entities SET active = true WHERE id = $1`, [newEntId]);
const afterActEnt = await query(`SELECT active FROM entities WHERE id = $1`, [newEntId]);
assert('Activar: active = true', afterActEnt.rows[0].active === true);

await query(`UPDATE entities SET active = false WHERE id = $1`, [newEntId]);
await query(`UPDATE entities SET active = true WHERE id = $1`, [newEntId]);
const finalEnt = await query(`SELECT active FROM entities WHERE id = $1`, [newEntId]);
assert('Doble toggle (off→on) termina activo', finalEnt.rows[0].active === true);

// ================================================================
// 25. TEST DELETE — entities
// ================================================================
console.log('\n🗑️ DELETE — Eliminar entidad');
const delEnt = await query(`DELETE FROM entities WHERE id = $1 RETURNING id`, [newEntId]);
assert('DELETE devuelve el ID eliminado', delEnt.rows.length === 1);
assert('ID eliminado coincide', delEnt.rows[0].id === newEntId);

const afterDelEnt = await query(`SELECT * FROM entities WHERE id = $1`, [newEntId]);
assert('Registro ya no existe después de DELETE', afterDelEnt.rows.length === 0);

// ================================================================
// 26. TEST RLS POLICIES — entities
// ================================================================
console.log('\n🔒 Políticas RLS — entities');

const policiesEnt = await query(`
  SELECT policyname, permissive, roles, cmd, qual, with_check
  FROM pg_policies
  WHERE tablename = 'entities'
  ORDER BY policyname
`);
assert('Hay políticas RLS definidas (>= 4)', policiesEnt.rows.length >= 4);

const pnEnt = policiesEnt.rows.map(r => r.policyname).sort();
assert('Tiene public_read_entities', pnEnt.includes('public_read_entities'));
assert('Tiene admin_insert_entities', pnEnt.includes('admin_insert_entities'));
assert('Tiene admin_update_entities', pnEnt.includes('admin_update_entities'));
assert('Tiene admin_delete_entities', pnEnt.includes('admin_delete_entities'));

const readPolEnt = policiesEnt.rows.find(r => r.policyname === 'public_read_entities');
const qualEnt = (readPolEnt?.qual ?? '').toLowerCase();
assert('public_read_entities filtra active=true',
  qualEnt.includes('active') && qualEnt.includes('true'));

const insPolEnt = policiesEnt.rows.find(r => r.policyname === 'admin_insert_entities');
const insChkEnt = (insPolEnt?.with_check ?? '').toLowerCase();
assert('admin_insert_entities usa is_admin()', insChkEnt.includes('is_admin'));

for (const name of ['admin_update_entities', 'admin_delete_entities']) {
  const pol = policiesEnt.rows.find(r => r.policyname === name);
  const ql = (pol?.qual ?? '').toLowerCase();
  assert(`${name} usa is_admin()`, ql.includes('is_admin'));
}

// ================================================================
// 27. TEST PUBLIC READ (active=true) — entities
// ================================================================
console.log('\n🌐 Lectura pública — active=true (entities)');
const allEnt = (await query(`SELECT COUNT(*)::int as count FROM entities`)).rows[0].count;
const activeEnt = (await query(`SELECT COUNT(*)::int as count FROM entities WHERE active = true`)).rows[0].count;
console.log(`   → ${allEnt} totales, ${activeEnt} activos`);
assert('activeCount <= allCount', activeEnt <= allEnt);

const tempEntId = (await query(`SELECT id FROM entities WHERE active = true LIMIT 1`)).rows[0].id;
await query(`UPDATE entities SET active = false WHERE id = $1`, [tempEntId]);
const afterDeactEntC = (await query(`SELECT COUNT(*)::int as count FROM entities WHERE active = true`)).rows[0].count;
await query(`UPDATE entities SET active = true WHERE id = $1`, [tempEntId]);
const afterReactEntC = (await query(`SELECT COUNT(*)::int as count FROM entities WHERE active = true`)).rows[0].count;

assert('Desactivar reduce conteo de activos (decrementa 1)', afterDeactEntC === activeEnt - 1);
assert('Reactivar restaura conteo original', afterReactEntC === activeEnt);

// ================================================================
// 28. TEST CHECK CONSTRAINTS — entities
// ================================================================
console.log('\n⚠️  Restricciones — entities');
await assertError('name NULL es rechazado',
  `INSERT INTO entities (id, name, full_name, description) VALUES ($1, NULL, 'Full', 'Desc')`,
  ['00000000-0000-0000-0000-000000000098']);

await assertError('full_name NULL es rechazado',
  `INSERT INTO entities (id, name, full_name, description) VALUES ($1, 'Name', NULL, 'Desc')`,
  ['00000000-0000-0000-0000-000000000097']);

await assertError('description NULL es rechazado',
  `INSERT INTO entities (id, name, full_name, description) VALUES ($1, 'Name', 'Full', NULL)`,
  ['00000000-0000-0000-0000-000000000096']);

// ================================================================
// 29. TEST NO REGRESSION — seed entities intacto
// ================================================================
console.log('\n🔄 Regresiones — seed entities');
const seedEnts = await query(`SELECT name, order_index FROM entities ORDER BY order_index ASC`);
const names = seedEnts.rows.map(r => r.name);
assert('"APRASEF" existe (orden 0)', names[0] === 'APRASEF');
assert('"Universidad Francisco de Paula Santander Ocana" existe (orden 1)', names[1] === 'Universidad Francisco de Paula Santander Ocana');
assert('"Alcaldia Municipal de Hacari" existe (orden 2)', names[2] === 'Alcaldia Municipal de Hacari');
assert('"Asociacion de Municipios del Catatumbo" existe (orden 3)', names[3] === 'Asociacion de Municipios del Catatumbo');
assert('"Alianza Fiduciaria S.A." existe (orden 4)', names[4] === 'Alianza Fiduciaria S.A.');
assert('"Camara de Comercio de Ocana" existe (orden 5)', names[5] === 'Camara de Comercio de Ocana');

// ================================================================
// 30. VERIFY FRONTEND FILES INTEGRITY
// ================================================================
console.log('\n📁 Archivos del módulo — integridad');
const moduleFiles = [
  'src/lib/admin/experiencia.ts',
  'src/lib/admin/entities.ts',
  'src/hooks/admin/useExperiencia.ts',
  'src/hooks/admin/useEntities.ts',
  'src/pages/admin/Experience/ExperienceList.tsx',
  'src/pages/admin/Experience/ExperienceForm.tsx',
  'src/pages/admin/Entities/EntityList.tsx',
  'src/pages/admin/Entities/EntityForm.tsx',
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
