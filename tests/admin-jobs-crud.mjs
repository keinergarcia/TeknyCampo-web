import pg from 'pg';
import { existsSync } from 'fs';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida. Ejecutar:');
  console.error('   $env:DATABASE_URL="postgresql://..." ; node tests/admin-jobs-crud.mjs');
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
console.log('🔷 MÓDULO 7 — Trabaja con Nosotros (Jobs + Applications)');
console.log('Tests de SQL directo');
console.log('='.repeat(50));

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
// 2. VERIFY TABLES AND RLS
// ================================================================
console.log('\n📋 Tablas jobs y job_applications');
const jobTableCheck = await query(
  `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'jobs'`
);
assert('Tabla jobs existe', jobTableCheck.rows.length === 1);

const appTableCheck = await query(
  `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'job_applications'`
);
assert('Tabla job_applications existe', appTableCheck.rows.length === 1);

await assertRow('RLS habilitado en jobs',
  `SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'jobs'`,
  [], { relrowsecurity: true });

await assertRow('RLS habilitado en job_applications',
  `SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'job_applications'`,
  [], { relrowsecurity: true });

// ================================================================
// 3. COUNT SEED DATA
// ================================================================
console.log('\n📊 Datos iniciales');
const jobCount = (await query(`SELECT COUNT(*)::int as count FROM jobs`)).rows[0].count;
assert('Seed jobs existe (>= 4 vacantes)', jobCount >= 4);
console.log(`   → ${jobCount} vacantes en BD`);

// ================================================================
// 4. TEST PAGINATION — server-side
// ================================================================
console.log('\n📄 Paginación server-side — jobs');
const totalJobs = (await query(`SELECT COUNT(*)::int as count FROM jobs`)).rows[0].count;

const page1 = await query(`SELECT * FROM jobs ORDER BY order_index ASC LIMIT 2 OFFSET 0`);
const page2 = await query(`SELECT * FROM jobs ORDER BY order_index ASC LIMIT 2 OFFSET 2`);
assert('Página 1 devuelve 2 registros', page1.rows.length === 2);
assert('Página 2 tiene contenido (no se solapa)',
  page2.rows.length > 0 && page1.rows[0].id !== page2.rows[0].id);
assert('LIMIT se aplica en servidor', page1.rows.length <= 2);

// ================================================================
// 5. TEST SEARCH — server-side ILIKE
// ================================================================
console.log('\n🔍 Búsqueda server-side — jobs');
const searchResult = await query(`SELECT * FROM jobs WHERE title ILIKE $1`, ['%agronomo%']);
assert('Búsqueda ILIKE encuentra vacantes', searchResult.rows.length >= 1);
assert('Resultado contiene término buscado',
  searchResult.rows[0].title.toLowerCase().includes('agronomo'));

const emptySearch = await query(`SELECT * FROM jobs WHERE title ILIKE $1`, ['%xyznotexist%']);
assert('Búsqueda sin resultados devuelve 0 filas', emptySearch.rows.length === 0);

const locSearch = await query(`SELECT * FROM jobs WHERE location ILIKE $1`, ['%oca%']);
assert('Búsqueda ILIKE en location encuentra', locSearch.rows.length >= 1);

// ================================================================
// 6. TEST SORTING — server-side
// ================================================================
console.log('\n🔢 Ordenamiento server-side — jobs');
const ascResult = await query(`SELECT * FROM jobs ORDER BY title ASC`);
const descResult = await query(`SELECT * FROM jobs ORDER BY title DESC`);
assert('Orden ASC vs DESC son distintos', ascResult.rows[0].id !== descResult.rows[0].id);
assert('ASC: primero alfabético', ascResult.rows[0].title <= ascResult.rows[1].title);
assert('DESC: primero alfabético inverso', descResult.rows[0].title >= descResult.rows[1].title);

// ================================================================
// 7. TEST CREATE (INSERT) — Jobs
// ================================================================
console.log('\n✏️ CREATE — Insertar nueva vacante');
const newJobId = '00000000-0000-0000-0000-00000000a001';
const insertJob = await query(
  `INSERT INTO jobs (id, title, type, location, description, order_index, active)
   VALUES ($1, $2, $3, $4, $5, $6, $7)
   RETURNING id, title, active`,
  [newJobId, 'Vacante de Prueba', 'Tiempo completo', 'Bogotá', 'Descripción de prueba', 99, true]
);
assert('INSERT devuelve registro', insertJob.rows.length === 1);
assertRow('Campos correctos',
  `SELECT id, title, type, location, active FROM jobs WHERE id = $1`,
  [newJobId], { id: newJobId, title: 'Vacante de Prueba', type: 'Tiempo completo', location: 'Bogotá', active: true });

// ================================================================
// 8. TEST READ — Jobs
// ================================================================
console.log('\n📖 READ — Jobs');
const readJob = await query(`SELECT * FROM jobs WHERE id = $1`, [newJobId]);
assert('SELECT por ID encuentra registro', readJob.rows.length === 1);
assert('Título coincide', readJob.rows[0].title === 'Vacante de Prueba');
assert('Tipo coincide', readJob.rows[0].type === 'Tiempo completo');
assert('Ubicación coincide', readJob.rows[0].location === 'Bogotá');
assert('Descripción coincide', readJob.rows[0].description === 'Descripción de prueba');
assert('order_index coincide', readJob.rows[0].order_index === 99);
assert('active = true', readJob.rows[0].active === true);

// ================================================================
// 9. TEST UPDATE — Jobs
// ================================================================
console.log('\n📝 UPDATE — Jobs');
const updateJob = await query(
  `UPDATE jobs SET title = $1, type = $2, location = $3, description = $4, order_index = $5 WHERE id = $6 RETURNING id, title, description, order_index`,
  ['Vacante Actualizada', 'Medio tiempo', 'Medellín', 'Desc actualizada', 50, newJobId]
);
assert('UPDATE devuelve registro', updateJob.rows.length === 1);
assert('Título actualizado', updateJob.rows[0].title === 'Vacante Actualizada');
assert('order_index actualizado a 50', updateJob.rows[0].order_index === 50);

const verifyJobUpdate = await query(`SELECT title, type FROM jobs WHERE id = $1`, [newJobId]);
assert('UPDATE persiste en BD', verifyJobUpdate.rows[0].title === 'Vacante Actualizada');
assert('Tipo actualizado', verifyJobUpdate.rows[0].type === 'Medio tiempo');

// ================================================================
// 10. TEST TOGGLE — Jobs (active/inactive)
// ================================================================
console.log('\n🔄 TOGGLE — Jobs');
await query(`UPDATE jobs SET active = false WHERE id = $1`, [newJobId]);
const off = await query(`SELECT active FROM jobs WHERE id = $1`, [newJobId]);
assert('Desactivar: false', off.rows[0].active === false);

await query(`UPDATE jobs SET active = true WHERE id = $1`, [newJobId]);
const on = await query(`SELECT active FROM jobs WHERE id = $1`, [newJobId]);
assert('Activar: true', on.rows[0].active === true);

// ================================================================
// 11. TEST DELETE — Jobs
// ================================================================
console.log('\n🗑️ DELETE — Jobs');
const deleteJob = await query(`DELETE FROM jobs WHERE id = $1 RETURNING id`, [newJobId]);
assert('DELETE devuelve ID', deleteJob.rows.length === 1);
assert('ID coincide', deleteJob.rows[0].id === newJobId);

const afterDelete = await query(`SELECT * FROM jobs WHERE id = $1`, [newJobId]);
assert('Registro ya no existe', afterDelete.rows.length === 0);

// ================================================================
// 12. TEST RLS POLICIES — Jobs
// ================================================================
console.log('\n🔒 Políticas RLS — jobs');
const jobPolicies = await query(`
  SELECT policyname, permissive, roles, cmd, qual, with_check
  FROM pg_policies
  WHERE tablename = 'jobs'
  ORDER BY policyname
`);
assert('>= 4 políticas en jobs', jobPolicies.rows.length >= 4);

const jpNames = jobPolicies.rows.map(r => r.policyname).sort();
assert('public_read_jobs existe', jpNames.includes('public_read_jobs'));
assert('admin_insert_jobs existe', jpNames.includes('admin_insert_jobs'));
assert('admin_update_jobs existe', jpNames.includes('admin_update_jobs'));
assert('admin_delete_jobs existe', jpNames.includes('admin_delete_jobs'));

const readJobPol = jobPolicies.rows.find(r => r.policyname === 'public_read_jobs');
assert('public_read_jobs filtra active=true',
  (readJobPol?.qual ?? '').toLowerCase().includes('active = true'));

for (const name of ['admin_insert_jobs', 'admin_update_jobs', 'admin_delete_jobs']) {
  const p = jobPolicies.rows.find(r => r.policyname === name);
  const q = ((name === 'admin_insert_jobs' ? p?.with_check : p?.qual) ?? '').toLowerCase();
  assert(`${name} usa is_admin()`, q.includes('is_admin'));
}

// ================================================================
// 13. TEST PUBLIC READ — Jobs (only active=true)
// ================================================================
console.log('\n🌐 Lectura pública — Jobs solo active=true');
await query(`UPDATE jobs SET active = true`);
const allActiveJobs = (await query(`SELECT COUNT(*)::int as count FROM jobs WHERE active = true`)).rows[0].count;

// Toggle one seed to inactive
const firstJobId = (await query(`SELECT id FROM jobs WHERE active = true LIMIT 1`)).rows[0].id;
await query(`UPDATE jobs SET active = false WHERE id = $1`, [firstJobId]);
const afterDeact = (await query(`SELECT COUNT(*)::int as count FROM jobs WHERE active = true`)).rows[0].count;
assert('Desactivar reduce conteo activos en 1', afterDeact === allActiveJobs - 1);

await query(`UPDATE jobs SET active = true WHERE id = $1`, [firstJobId]);
const afterReact = (await query(`SELECT COUNT(*)::int as count FROM jobs WHERE active = true`)).rows[0].count;
assert('Reactivar restaura conteo original', afterReact === allActiveJobs);

// ================================================================
// 14. TEST NO REGRESION — seed data intact
// ================================================================
console.log('\n🔄 Regresiones — datos seed jobs');
const seedJobs = await query(`SELECT title, order_index FROM jobs ORDER BY order_index ASC`);
const jtitles = seedJobs.rows.map(r => r.title);
const jindices = seedJobs.rows.map(r => r.order_index);
assert('"Ingeniero Agronomo" existe (orden 0)', jtitles[0] === 'Ingeniero Agronomo' && jindices[0] === 0);
assert('"Asesor Tecnico Comercial" existe (orden 1)', jtitles[1] === 'Asesor Tecnico Comercial' && jindices[1] === 1);

// ================================================================
// 15. TEST NOT NULL CONSTRAINTS — Jobs
// ================================================================
console.log('\n⚠️  Restricciones NOT NULL — Jobs');
await assertError('title NULL es rechazado',
  `INSERT INTO jobs (id, title, type, location, description) VALUES ($1,NULL,'Tipo','Lugar','Desc')`,
  ['00000000-0000-0000-0000-00000000a002']);

await assertError('type NULL es rechazado',
  `INSERT INTO jobs (id, title, type, location, description) VALUES ($1,'Test',NULL,'Lugar','Desc')`,
  ['00000000-0000-0000-0000-00000000a003']);

await assertError('location NULL es rechazado',
  `INSERT INTO jobs (id, title, type, location, description) VALUES ($1,'Test','Tipo',NULL,'Desc')`,
  ['00000000-0000-0000-0000-00000000a004']);

// ================================================================
// 16. JOB APPLICATIONS — CREATE
// ================================================================
console.log('\n✏️ CREATE — Insertar postulación');
const newAppId = '00000000-0000-0000-0000-00000000b001';
const insertApp = await query(
  `INSERT INTO job_applications (id, nombre, email, telefono, cargo, mensaje, status)
   VALUES ($1, $2, $3, $4, $5, $6, $7)
   RETURNING id, nombre, status`,
  [newAppId, 'Juan Pérez', 'juan@test.com', '3001234567', 'Ingeniero Agrónomo', 'Me interesa la vacante', 'pendiente']
);
assert('INSERT devuelve registro', insertApp.rows.length === 1);
assertRow('Campos correctos',
  `SELECT id, nombre, email, status FROM job_applications WHERE id = $1`,
  [newAppId], { id: newAppId, nombre: 'Juan Pérez', email: 'juan@test.com', status: 'pendiente' });

// ================================================================
// 17. JOB APPLICATIONS — READ
// ================================================================
console.log('\n📖 READ — Postulaciones');
const readApp = await query(`SELECT * FROM job_applications WHERE id = $1`, [newAppId]);
assert('SELECT por ID encuentra registro', readApp.rows.length === 1);
assert('nombre coincide', readApp.rows[0].nombre === 'Juan Pérez');
assert('email coincide', readApp.rows[0].email === 'juan@test.com');
assert('telefono coincide', readApp.rows[0].telefono === '3001234567');
assert('cargo coincide', readApp.rows[0].cargo === 'Ingeniero Agrónomo');
assert('mensaje coincide', readApp.rows[0].mensaje === 'Me interesa la vacante');
assert('status default = pendiente', readApp.rows[0].status === 'pendiente');
assert('cv_url es null', readApp.rows[0].cv_url === null);
assert('notes es null', readApp.rows[0].notes === null);

// ================================================================
// 18. JOB APPLICATIONS — UPDATE status + notes
// ================================================================
console.log('\n📝 UPDATE — Postulaciones');
const updateApp = await query(
  `UPDATE job_applications SET status = $1, notes = $2 WHERE id = $3 RETURNING id, status, notes`,
  ['revisado', 'Contactar para entrevista', newAppId]
);
assert('UPDATE devuelve registro', updateApp.rows.length === 1);
assert('Status actualizado a revisado', updateApp.rows[0].status === 'revisado');
assert('Notes guardado', updateApp.rows[0].notes === 'Contactar para entrevista');

const cntResult = await query(`UPDATE job_applications SET status = $1 WHERE id = $2 RETURNING status`, ['contactado', newAppId]);
assert('Status: contactado', cntResult.rows[0].status === 'contactado');

const rchResult = await query(`UPDATE job_applications SET status = $1 WHERE id = $2 RETURNING status`, ['rechazado', newAppId]);
assert('Status: rechazado', rchResult.rows[0].status === 'rechazado');

const ctrResult = await query(`UPDATE job_applications SET status = $1 WHERE id = $2 RETURNING status`, ['contratado', newAppId]);
assert('Status: contratado', ctrResult.rows[0].status === 'contratado');

const persistUpdate = await query(`SELECT status, notes FROM job_applications WHERE id = $1`, [newAppId]);
assert('UPDATE persiste en BD', persistUpdate.rows[0].status === 'contratado');
assert('Notes persiste en BD', persistUpdate.rows[0].notes === 'Contactar para entrevista');

// ================================================================
// 19. JOB APPLICATIONS — Status CHECK constraint
// ================================================================
console.log('\n⚠️  CHECK constraint — status');
await assertError('Status inválido es rechazado',
  `UPDATE job_applications SET status = $1 WHERE id = $2`,
  ['inexistente', newAppId]);
await assertError('Status inválido en INSERT es rechazado',
  `INSERT INTO job_applications (id, nombre, email, telefono, cargo, status) VALUES ($1,$2,$3,$4,$5,$6)`,
  ['00000000-0000-0000-0000-00000000b002', 'Test', 'test@test.com', '300', 'Cargo', 'invalido']);

// ================================================================
// 20. JOB APPLICATIONS — NOT NULL constraints
// ================================================================
console.log('\n⚠️  NOT NULL constraints — Postulaciones');
await assertError('nombre NULL es rechazado',
  `INSERT INTO job_applications (id, nombre, email, telefono, cargo) VALUES ($1,NULL,$2,$3,$4)`,
  ['00000000-0000-0000-0000-00000000b003', 'e@t.com', '300', 'Cargo']);
await assertError('email NULL es rechazado',
  `INSERT INTO job_applications (id, nombre, email, telefono, cargo) VALUES ($1,$2,NULL,$3,$4)`,
  ['00000000-0000-0000-0000-00000000b004', 'Test', '300', 'Cargo']);
await assertError('telefono NULL es rechazado',
  `INSERT INTO job_applications (id, nombre, email, telefono, cargo) VALUES ($1,$2,$3,NULL,$4)`,
  ['00000000-0000-0000-0000-00000000b005', 'Test', 'e@t.com', 'Cargo']);

// ================================================================
// 21. JOB APPLICATIONS — Email format constraint
// ================================================================
console.log('\n⚠️  CHECK constraint — email formato');
await assertError('Email inválido es rechazado',
  `INSERT INTO job_applications (id, nombre, email, telefono, cargo) VALUES ($1,$2,$3,$4,$5)`,
  ['00000000-0000-0000-0000-00000000b006', 'Test', 'email-invalido', '300', 'Cargo']);

// ================================================================
// 22. JOB APPLICATIONS — Mensaje length constraint
// ================================================================
console.log('\n⚠️  CHECK constraint — mensaje length');
const longMsg = 'x'.repeat(5001);
await assertError('Mensaje > 5000 chars es rechazado',
  `INSERT INTO job_applications (id, nombre, email, telefono, cargo, mensaje) VALUES ($1,$2,$3,$4,$5,$6)`,
  ['00000000-0000-0000-0000-00000000b007', 'Test', 'e@t.com', '300', 'Cargo', longMsg]);

// ================================================================
// 23. JOB APPLICATIONS — cv_url update
// ================================================================
console.log('\n💾 CV_URL update');
const cvResult = await query(
  `UPDATE job_applications SET cv_url = $1 WHERE id = $2 RETURNING cv_url`,
  ['applications/test/cv.pdf', newAppId]
);
assert('cv_url se actualiza correctamente', cvResult.rows[0].cv_url === 'applications/test/cv.pdf');

const clearCv = await query(
  `UPDATE job_applications SET cv_url = NULL WHERE id = $1 RETURNING cv_url`,
  [newAppId]
);
assert('cv_url puede volver a NULL', clearCv.rows[0].cv_url === null);

// ================================================================
// 24. JOB APPLICATIONS — DELETE
// ================================================================
console.log('\n🗑️ DELETE — Postulaciones');
const deleteApp = await query(`DELETE FROM job_applications WHERE id = $1 RETURNING id`, [newAppId]);
assert('DELETE devuelve ID', deleteApp.rows.length === 1);
assert('ID coincide', deleteApp.rows[0].id === newAppId);

const afterDelApp = await query(`SELECT * FROM job_applications WHERE id = $1`, [newAppId]);
assert('Registro ya no existe', afterDelApp.rows.length === 0);

// ================================================================
// 25. TEST RLS POLICIES — job_applications
// ================================================================
console.log('\n🔒 Políticas RLS — job_applications');
const appPolicies = await query(`
  SELECT policyname, permissive, roles, cmd, qual, with_check
  FROM pg_policies
  WHERE tablename = 'job_applications'
  ORDER BY policyname
`);
assert('>= 4 políticas en job_applications', appPolicies.rows.length >= 4);

const apNames = appPolicies.rows.map(r => r.policyname).sort();
assert('public_insert_job_applications existe', apNames.includes('public_insert_job_applications'));
assert('admin_select_job_applications existe', apNames.includes('admin_select_job_applications'));
assert('admin_update_job_applications existe', apNames.includes('admin_update_job_applications'));
assert('admin_delete_job_applications existe', apNames.includes('admin_delete_job_applications'));

const insertPublicPol = appPolicies.rows.find(r => r.policyname === 'public_insert_job_applications');
assert('public_insert permite a todos (WITH CHECK true)',
  (insertPublicPol?.with_check ?? '').toLowerCase().includes('true'));

for (const name of ['admin_select_job_applications', 'admin_update_job_applications', 'admin_delete_job_applications']) {
  const p = appPolicies.rows.find(r => r.policyname === name);
  const q = ((name.includes('insert') ? p?.with_check : p?.qual) ?? '').toLowerCase();
  assert(`${name} usa is_admin()`, q.includes('is_admin'));
}

// ================================================================
// 26. VERIFY FRONTEND FILES INTEGRITY
// ================================================================
console.log('\n📁 Archivos del módulo');
const moduleFiles = [
  'src/lib/admin/jobs.ts',
  'src/hooks/admin/useJobs.ts',
  'src/pages/admin/Jobs/JobList.tsx',
  'src/pages/admin/Jobs/JobForm.tsx',
  'src/pages/admin/Applications/ApplicationList.tsx',
  'src/pages/admin/Applications/ApplicationForm.tsx',
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
