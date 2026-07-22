import pg from 'pg';
import { existsSync } from 'fs';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida. Ejecutar:');
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
// 2. VERIFY TABLE AND RLS
// ================================================================
console.log('\n📋 Tabla trainings y RLS');
const tableCheck = await query(
  `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='trainings'`
);
assert('Tabla trainings existe', tableCheck.rows.length === 1);

await assertRow('RLS habilitado',
  `SELECT relname, relrowsecurity FROM pg_class WHERE relname='trainings'`, [], { relrowsecurity: true });

// ================================================================
// 3. COUNT — should be empty (no seed data)
// ================================================================
console.log('\n📊 Datos iniciales');
const count0 = (await query(`SELECT COUNT(*)::int as c FROM trainings`)).rows[0].c;
assert('Tabla vacía inicialmente', count0 === 0);
console.log(`   → ${count0} registros`);

// ================================================================
// 4. PAGINATION (empty table)
// ================================================================
console.log('\n📄 Paginación (tabla vacía)');
const page1 = await query(`SELECT * FROM trainings ORDER BY order_index ASC LIMIT 3 OFFSET 0`);
assert('Página 1 devuelve 0 registros', page1.rows.length === 0);

// ================================================================
// 5. SEARCH (empty table)
// ================================================================
console.log('\n🔍 Búsqueda (tabla vacía)');
const emptySearch = await query(`SELECT * FROM trainings WHERE title ILIKE $1`, ['%test%']);
assert('Búsqueda devuelve 0 filas', emptySearch.rows.length === 0);

// ================================================================
// 6. SORTING (empty table)
// ================================================================
console.log('\n🔢 Ordenamiento (tabla vacía)');
const sorted = await query(`SELECT * FROM trainings ORDER BY title ASC`);
assert('Orden ASC devuelve 0 filas', sorted.rows.length === 0);

// ================================================================
// 7. CREATE — with all fields
// ================================================================
console.log('\n✏️ CREATE — Insertar capacitación completa');
const trId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const trId2 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab';
const testCurriculum = JSON.stringify([
  { title: 'Módulo 1: Introducción', duration: '2 horas', topics: ['Tema 1', 'Tema 2'] },
  { title: 'Módulo 2: Práctica', duration: '4 horas', topics: ['Tema 3'] },
]);
const testReqs = '{ "Tener conocimientos básicos", "Mayor de edad" }';

const insertResult = await query(
  `INSERT INTO trainings (id, title, description, content, instructor, modality, duration, schedule, location,
    start_date, end_date, price, max_participants, curriculum, requirements, certificate, featured, image_url, brochure_url, order_index, active)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15::text[],$16,$17,$18,$19,$20,$21)
   RETURNING id, title, active`,
  [trId, 'Capacitación de Prueba', 'Descripción completa de prueba', 'Contenido extendido',
   'Instructor Test', 'presencial', '4 semanas', 'Sábados 8am-12pm', 'Ocaña',
   '2026-08-01', '2026-08-28', 250000.00, 20,
   testCurriculum, testReqs, true, true,
   'trainings/aaaa/img.jpg', 'documents/trainings/aaaa/doc.pdf', 10, true]
);
assert('INSERT devuelve registro', insertResult.rows.length === 1);
assert('Campos correctos', insertResult.rows[0].title === 'Capacitación de Prueba' && insertResult.rows[0].active === true);

// ================================================================
// 8. CREATE — minimal fields (nullables omitted)
// ================================================================
console.log('\n📝 CREATE — campos mínimos');
const trMinId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const minResult = await query(
  `INSERT INTO trainings (id, title, description, modality) VALUES ($1,$2,$3,$4) RETURNING id, title`,
  [trMinId, 'Mínima', 'Desc mínima', 'virtual']
);
assert('INSERT mínimos devuelve registro', minResult.rows.length === 1);

// Second row for sorting tests
const trSortId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc';
const sortResult = await query(
  `INSERT INTO trainings (id, title, description, modality) VALUES ($1,$2,$3,$4) RETURNING id, title`,
  [trSortId, 'Zeta Training', 'Desc zeta', 'hibrida']
);
assert('INSERT sorting devuelve registro', sortResult.rows.length === 1);

// ================================================================
// 9. READ
// ================================================================
console.log('\n📖 READ');
const readResult = await query(`SELECT * FROM trainings WHERE id = $1`, [trId]);
assert('SELECT por ID encuentra registro', readResult.rows.length === 1);
assert('title coincide', readResult.rows[0].title === 'Capacitación de Prueba');
assert('modality coincide', readResult.rows[0].modality === 'presencial');
assert('price coincide', Number(readResult.rows[0].price) === 250000);
assert('certificate=true', readResult.rows[0].certificate === true);
assert('featured=true', readResult.rows[0].featured === true);
assert('curriculum JSONB no nulo', readResult.rows[0].curriculum !== null);
assert('curriculum tiene 2 módulos', readResult.rows[0].curriculum.length === 2);
assert('requirements tiene 2 items', readResult.rows[0].requirements.length === 2);
assert('start_date coincide', readResult.rows[0].start_date.toISOString().startsWith('2026-08-01'));
assert('end_date coincide', readResult.rows[0].end_date.toISOString().startsWith('2026-08-28'));
assert('image_url coincide', readResult.rows[0].image_url === 'trainings/aaaa/img.jpg');
assert('brochure_url coincide', readResult.rows[0].brochure_url === 'documents/trainings/aaaa/doc.pdf');

// ================================================================
// 10. UPDATE — all fields
// ================================================================
console.log('\n📝 UPDATE');
const upd = await query(
  `UPDATE trainings SET title=$1, description=$2, price=$3, modality=$4, active=$5 WHERE id=$6 RETURNING title, price, modality, active`,
  ['Actualizada', 'Desc actualizada', 350000.50, 'hibrida', false, trId]
);
assert('UPDATE devuelve registro', upd.rows.length === 1);
assert('title actualizado', upd.rows[0].title === 'Actualizada');
assert('price actualizado', Number(upd.rows[0].price) === 350000.50);
assert('modality actualizado', upd.rows[0].modality === 'hibrida');
assert('active=false', upd.rows[0].active === false);

const verifyUpd = await query(`SELECT title FROM trainings WHERE id=$1`, [trId]);
assert('UPDATE persiste', verifyUpd.rows[0].title === 'Actualizada');

// ================================================================
// 11. UPDATE — reemplazo de image_url y brochure_url
// ================================================================
console.log('\n🖼️  Reemplazo de image_url y brochure_url');
const imgUpd = await query(
  `UPDATE trainings SET image_url=$1 WHERE id=$2 RETURNING image_url`,
  ['trainings/aaaa/image-v2.jpg', trId]
);
assert('image_url reemplazado', imgUpd.rows[0].image_url === 'trainings/aaaa/image-v2.jpg');

const docUpd = await query(
  `UPDATE trainings SET brochure_url=$1 WHERE id=$2 RETURNING brochure_url`,
  ['documents/trainings/aaaa/brochure-v2.pdf', trId]
);
assert('brochure_url reemplazado', docUpd.rows[0].brochure_url === 'documents/trainings/aaaa/brochure-v2.pdf');

// ================================================================
// 12. UPDATE — volver image_url y brochure_url a NULL
// ================================================================
console.log('\n🔙 Retorno a NULL');
await query(`UPDATE trainings SET image_url=NULL, brochure_url=NULL WHERE id=$1`, [trId]);
const nullImg = await query(`SELECT image_url, brochure_url FROM trainings WHERE id=$1`, [trId]);
assert('image_url puede volver a NULL', nullImg.rows[0].image_url === null);
assert('brochure_url puede volver a NULL', nullImg.rows[0].brochure_url === null);

// ================================================================
// 13. TOGGLE active
// ================================================================
console.log('\n🔄 TOGGLE active');
await query(`UPDATE trainings SET active=true WHERE id=$1`, [trId]);
const on1 = await query(`SELECT active FROM trainings WHERE id=$1`, [trId]);
assert('Activar: true', on1.rows[0].active === true);

await query(`UPDATE trainings SET active=false WHERE id=$1`, [trId]);
const off1 = await query(`SELECT active FROM trainings WHERE id=$1`, [trId]);
assert('Desactivar: false', off1.rows[0].active === false);

await query(`UPDATE trainings SET active=true WHERE id=$1`, [trId]);
const on2 = await query(`SELECT active FROM trainings WHERE id=$1`, [trId]);
assert('Doble toggle termina true', on2.rows[0].active === true);

// ================================================================
// 14. TOGGLE featured
// ================================================================
console.log('\n⭐ TOGGLE featured');
await query(`UPDATE trainings SET featured=true WHERE id=$1`, [trId]);
const featOn = await query(`SELECT featured FROM trainings WHERE id=$1`, [trId]);
assert('featured=true', featOn.rows[0].featured === true);

await query(`UPDATE trainings SET featured=false WHERE id=$1`, [trId]);
const featOff = await query(`SELECT featured FROM trainings WHERE id=$1`, [trId]);
assert('featured=false', featOff.rows[0].featured === false);

// ================================================================
// 15. DELETE
// ================================================================
console.log('\n🗑️ DELETE');
const delMin = await query(`DELETE FROM trainings WHERE id=$1 RETURNING id`, [trMinId]);
assert('DELETE devuelve ID', delMin.rows.length === 1);
assert('ID coincide', delMin.rows[0].id === trMinId);

const aftDel = await query(`SELECT * FROM trainings WHERE id=$1`, [trMinId]);
assert('Registro ya no existe', aftDel.rows.length === 0);

// ================================================================
// 16. PAGINATION (with data)
// ================================================================
console.log('\n📄 Paginación (con datos)');
const total = (await query(`SELECT COUNT(*)::int as c FROM trainings`)).rows[0].c;
const p1 = await query(`SELECT * FROM trainings ORDER BY order_index ASC LIMIT 3 OFFSET 0`);
assert(`Página 1 devuelve hasta 3 (total=${total})`, p1.rows.length <= 3);

// ================================================================
// 17. SEARCH ILIKE title + description
// ================================================================
console.log('\n🔍 Búsqueda ILIKE');
const sr1 = await query(`SELECT * FROM trainings WHERE title ILIKE $1`, ['%actualizada%']);
assert('Búsqueda title encuentra', sr1.rows.length >= 1);

const sr2 = await query(`SELECT * FROM trainings WHERE title ILIKE $1`, ['%zeta%']);
assert('Búsqueda title (Zeta) encuentra', sr2.rows.length >= 1);

const sr3 = await query(`SELECT * FROM trainings WHERE title ILIKE $1`, ['%xyznotexist%']);
assert('Búsqueda sin resultados', sr3.rows.length === 0);

// ================================================================
// 18. SORTING
// ================================================================
console.log('\n🔢 Ordenamiento');
const asc = await query(`SELECT * FROM trainings ORDER BY title ASC`);
const desc = await query(`SELECT * FROM trainings ORDER BY title DESC`);
assert('ASC vs DESC distintos', asc.rows[0].id !== desc.rows[0].id);
assert('ASC es alfabético', asc.rows[0].title <= asc.rows[1].title);
assert('DESC es inverso', desc.rows[0].title >= desc.rows[1].title);

// ================================================================
// 19. RLS POLICIES
// ================================================================
console.log('\n🔒 Políticas RLS');
const policies = await query(`
  SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename='trainings' ORDER BY policyname
`);
assert('>= 4 políticas', policies.rows.length >= 4);
const names = policies.rows.map(r => r.policyname).sort();
assert('public_read_trainings', names.includes('public_read_trainings'));
assert('admin_insert_trainings', names.includes('admin_insert_trainings'));
assert('admin_update_trainings', names.includes('admin_update_trainings'));
assert('admin_delete_trainings', names.includes('admin_delete_trainings'));

const readPol = policies.rows.find(r => r.policyname === 'public_read_trainings');
const rq = (readPol?.qual ?? '').toLowerCase();
assert('public_read filtra active=true', rq.includes('active = true'));

for (const name of ['admin_insert_trainings', 'admin_update_trainings', 'admin_delete_trainings']) {
  const p = policies.rows.find(r => r.policyname === name);
  const q = ((name === 'admin_insert_trainings' ? p?.with_check : p?.qual) ?? '').toLowerCase();
  assert(`${name} usa is_admin()`, q.includes('is_admin'));
}

// ================================================================
// 20. PUBLIC READ — solo active=true
// ================================================================
console.log('\n🌐 Lectura pública');
const allC = (await query(`SELECT COUNT(*)::int as c FROM trainings`)).rows[0].c;
const actC = (await query(`SELECT COUNT(*)::int as c FROM trainings WHERE active=true`)).rows[0].c;
assert('activos <= totales', actC <= allC);

// ================================================================
// 21. CHECK CONSTRAINTS
// ================================================================
console.log('\n⚠️  Restricciones');
await assertError('title NULL rechazado',
  `INSERT INTO trainings (id, title, description, modality) VALUES ($1,NULL,'Desc','presencial')`,
  ['cccccccc-cccc-cccc-cccc-cccccccccccc']);

await assertError('modality inválido rechazado',
  `INSERT INTO trainings (id, title, description, modality) VALUES ($1,'Test','Desc','remota')`,
  ['cccccccc-cccc-cccc-cccc-cccccccccccd']);

await assertError('end_date < start_date rechazado',
  `INSERT INTO trainings (id, title, description, modality, start_date, end_date) VALUES ($1,'Test','Desc','presencial','2026-09-01','2026-08-01')`,
  ['cccccccc-cccc-cccc-cccc-ccccccccccce']);

// UPDATE de fechas con end < start también debe fallar
await assertError('UPDATE end_date < start_date rechazado',
  `UPDATE trainings SET end_date=$1 WHERE id=$2`,
  ['2026-01-01', trId]);

// ================================================================
// 22. CURRICULUM y REQUIREMENTS — types
// ================================================================
console.log('\n📦 Tipos JSONB y TEXT[]');
const trTypesId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const emptyCurriculum = '[]';
const emptyReqs = '{}';
await query(
  `INSERT INTO trainings (id, title, description, modality, curriculum, requirements)
   VALUES ($1,$2,$3,$4,$5::jsonb,$6::text[])`,
  [trTypesId, 'Types Test', 'Desc types', 'hibrida', emptyCurriculum, emptyReqs]
);
assert('curriculum vacío permitido', true);

const tyCheck = await query(`SELECT curriculum, requirements FROM trainings WHERE id=$1`, [trTypesId]);
assert('curriculum vacío es array', Array.isArray(tyCheck.rows[0].curriculum));
assert('requirements vacío es array', Array.isArray(tyCheck.rows[0].requirements));

const manyReqs = '{ "Req 1", "Req 2", "Req 3", "Req 4", "Req 5" }';
await query(`UPDATE trainings SET requirements=$1::text[] WHERE id=$2`, [manyReqs, trTypesId]);
const reqCheck = await query(`SELECT requirements FROM trainings WHERE id=$1`, [trTypesId]);
assert('5 requisitos guardados', reqCheck.rows[0].requirements.length === 5);

// ================================================================
// 23. price=NULL, max_participants=NULL
// ================================================================
console.log('\n💰 Campos nulos');
const trNullId = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
await query(
  `INSERT INTO trainings (id, title, description, modality, price, max_participants)
   VALUES ($1,$2,$3,$4,NULL,NULL)`,
  [trNullId, 'Null Test', 'Precio nulo', 'virtual']
);
const nullCheck = await query(`SELECT price, max_participants FROM trainings WHERE id=$1`, [trNullId]);
assert('price puede ser NULL', nullCheck.rows[0].price === null);
assert('max_participants puede ser NULL', nullCheck.rows[0].max_participants === null);

// ================================================================
// 24. CLEANUP
// ================================================================
console.log('\n🧹 Cleanup');
await query(`DELETE FROM trainings WHERE id IN ($1,$2,$3,$4,$5)`, [trId, trMinId, trSortId, trTypesId, trNullId]);
const fin = (await query(`SELECT COUNT(*)::int as c FROM trainings`)).rows[0].c;
assert('Tabla vuelve a 0 registros', fin === 0);

// ================================================================
// 25. FILE INTEGRITY
// ================================================================
console.log('\n📁 Archivos del módulo');
const files = [
  'src/lib/admin/trainings.ts',
  'src/hooks/admin/useTrainings.ts',
  'src/pages/admin/Trainings/TrainingList.tsx',
  'src/pages/admin/Trainings/TrainingForm.tsx',
];
for (const f of files) assert(`Archivo ${f} existe`, existsSync(f));

// ================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`RESULTADOS: ${passed} ✅  |  ${failed} ❌  |  ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

await pool.end();
process.exit(failed > 0 ? 1 : 0);
