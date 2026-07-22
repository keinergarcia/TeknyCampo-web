import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function loadEnvVar(name) {
  if (process.env[name]) return process.env[name];
  const envPath = '.env';
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith(name + '=')) return trimmed.slice(name.length + 1);
    }
  }
  return null;
}

const SUPABASE_URL = loadEnvVar('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = loadEnvVar('VITE_SUPABASE_ANON_KEY');
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) { console.error('Faltan credenciales'); process.exit(1); }

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let passed = 0;
let failed = 0;

async function query(text, params) {
  const client = await pool.connect();
  try { return await client.query(text, params); }
  finally { client.release(); }
}

function assert(label, condition, detail = '') {
  if (condition) { console.log(`  ✅ ${label}`); passed++; }
  else { console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`); failed++; }
}

async function assertAnonBlocked(label, fn) {
  try {
    const { error, data } = await fn();
    const blocked = error !== null || data === null || (Array.isArray(data) && data.length === 0);
    assert(label, blocked, `error=${error?.message?.slice(0,60)}`);
  } catch (e) { assert(label, false, `Excepción: ${e.message?.slice(0,100)}`); }
}

// ================================================================
console.log('🔷 MÓDULO 7 — Integration Tests (Jobs + Applications)');
console.log('='.repeat(50));

// ================================================================
// 1. ANONYMOUS — jobs
// ================================================================
console.log('\n👤 ANÓNIMO — vía supabase-js\n');

const { data: jobs, error: selErr } = await anonClient
  .from('jobs').select('id, title, active').limit(10);
assert('SELECT jobs: puede leer vacantes', !selErr && jobs !== null, selErr?.message);

const allActive = jobs.every(s => s.active === true);
assert('SELECT jobs: solo devuelve active=true', allActive);

const { data: inactiveJobs } = await anonClient
  .from('jobs').select('id, active').eq('active', false).limit(5);
assert('SELECT jobs: no puede filtrar inactivos', inactiveJobs?.length === 0);

await assertAnonBlocked('INSERT jobs: rechazado',
  () => anonClient.from('jobs').insert({ title: 'Anon', type: 'Full', location: 'Test', description: 'Test' })
);
await assertAnonBlocked('UPDATE jobs: rechazado',
  () => anonClient.from('jobs').update({ title: 'Hacked' }).eq('id', jobs[0]?.id || '000')
);
await assertAnonBlocked('DELETE jobs: rechazado',
  () => anonClient.from('jobs').delete().eq('id', jobs[0]?.id || '000')
);

// ================================================================
// 2. ANONYMOUS — job_applications
// ================================================================
console.log('\n👤 ANÓNIMO — Postulaciones\n');

// Public INSERT should be allowed (no .select() because anon can't read back)
const { error: insErr } = await anonClient
  .from('job_applications').insert({
    nombre: 'Test Anon',
    email: 'anon@test.com',
    telefono: '3001112233',
    cargo: 'Ingeniero',
    mensaje: 'Me interesa',
  });
assert('INSERT job_app: permitido (público)', !insErr, insErr?.message);

// Anonymous should NOT be able to SELECT job_applications
const { data: appsSel, error: selAppsErr } = await anonClient
  .from('job_applications').select('id').limit(5);
assert('SELECT job_app: bloqueado (admin_only)', selAppsErr !== null || appsSel?.length === 0);

// Anonymous should NOT be able to UPDATE
await assertAnonBlocked('UPDATE job_app: rechazado',
  () => anonClient.from('job_applications').update({ status: 'revisado' }).eq('id', '00000000-0000-0000-0000-000000000000')
);

// Anonymous should NOT be able to DELETE
await assertAnonBlocked('DELETE job_app: rechazado',
  () => anonClient.from('job_applications').delete().eq('id', '00000000-0000-0000-0000-000000000000')
);

// Cleanup: delete any test applications created by anon (via pg admin)
await query(`DELETE FROM job_applications WHERE email = 'anon@test.com'`);

// ================================================================
// 3. ADMIN (via pg)
// ================================================================
console.log('\n👑 ADMIN — vía pg\n');

const { rows: [{ is_admin }] } = await query(`SELECT is_admin()`);
assert('is_admin() existe y ejecutable', is_admin === false || is_admin === true);

// --- Policies verification ---
const { rows: jobPolicies } = await query(`
  SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename='jobs' ORDER BY policyname
`);
const jIns = jobPolicies.find(p => p.policyname === 'admin_insert_jobs');
assert('admin_insert_jobs: WITH CHECK is_admin()',
  (jIns?.with_check ?? '').toLowerCase().includes('is_admin'));
const jUpd = jobPolicies.find(p => p.policyname === 'admin_update_jobs');
assert('admin_update_jobs: USING is_admin()',
  (jUpd?.qual ?? '').toLowerCase().includes('is_admin'));
const jDel = jobPolicies.find(p => p.policyname === 'admin_delete_jobs');
assert('admin_delete_jobs: USING is_admin()',
  (jDel?.qual ?? '').toLowerCase().includes('is_admin'));
const jRead = jobPolicies.find(p => p.policyname === 'public_read_jobs');
assert('public_read_jobs: USING active=true',
  (jRead?.qual ?? '').toLowerCase().includes('active = true'));

const { rows: appPolicies } = await query(`
  SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename='job_applications' ORDER BY policyname
`);
const aSel = appPolicies.find(p => p.policyname === 'admin_select_job_applications');
assert('admin_select_job_applications: USING is_admin()',
  (aSel?.qual ?? '').toLowerCase().includes('is_admin'));
const aUpd = appPolicies.find(p => p.policyname === 'admin_update_job_applications');
assert('admin_update_job_applications: USING is_admin()',
  (aUpd?.qual ?? '').toLowerCase().includes('is_admin'));
const aDel = appPolicies.find(p => p.policyname === 'admin_delete_job_applications');
assert('admin_delete_job_applications: USING is_admin()',
  (aDel?.qual ?? '').toLowerCase().includes('is_admin'));
const aIns = appPolicies.find(p => p.policyname === 'public_insert_job_applications');
assert('public_insert_job_applications: WITH CHECK true',
  (aIns?.with_check ?? '').toLowerCase().includes('true'));

// --- CRUD Jobs ---
console.log('\n   CRUD Jobs vía SQL\n');
const J1 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01';
const J2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02';

// CREATE full
const { rows: [c1] } = await query(
  `INSERT INTO jobs (id,title,type,location,description,order_index,active) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id,title`,
  [J1, 'Integration Job', 'Tiempo completo', 'Bogotá', 'Desc test', 10, true]
);
assert('INSERT: vacante creada', c1.title === 'Integration Job');

// CREATE minimal
const { rows: [minJob] } = await query(
  `INSERT INTO jobs (id,title,type,location,description) VALUES ($1,$2,$3,$4,$5) RETURNING id,title`,
  [J2, 'Min Job', 'Medio tiempo', 'Medellín', 'Min desc']
);
assert('INSERT mínima: creada', minJob.title === 'Min Job');

// READ
const { rows: [r1] } = await query(`SELECT * FROM jobs WHERE id=$1`, [J1]);
assert('SELECT: lectura por ID', r1.title === 'Integration Job');
assert('type coincide', r1.type === 'Tiempo completo');
assert('location coincide', r1.location === 'Bogotá');
assert('order_index coincide', r1.order_index === 10);
assert('active=true', r1.active === true);

// UPDATE
const { rows: [u1] } = await query(
  `UPDATE jobs SET title=$1, type=$2, location=$3 WHERE id=$4 RETURNING title, type, location`,
  ['Updated Job', 'Por proyecto', 'Cúcuta', J1]
);
assert('UPDATE: título actualizado', u1.title === 'Updated Job');
assert('UPDATE: type actualizado', u1.type === 'Por proyecto');
assert('UPDATE: location actualizado', u1.location === 'Cúcuta');

// TOGGLE off
await query(`UPDATE jobs SET active=false WHERE id=$1`, [J1]);
const { rows: [{ active: off }] } = await query(`SELECT active FROM jobs WHERE id=$1`, [J1]);
assert('TOGGLE: active=false', off === false);

// TOGGLE on
await query(`UPDATE jobs SET active=true WHERE id=$1`, [J1]);
const { rows: [{ active: on }] } = await query(`SELECT active FROM jobs WHERE id=$1`, [J1]);
assert('TOGGLE: active=true', on === true);

// DELETE
const { rows: [d1] } = await query(`DELETE FROM jobs WHERE id=$1 RETURNING id`, [J2]);
assert('DELETE: eliminado', d1.id === J2);
const { rows: ad } = await query(`SELECT id FROM jobs WHERE id=$1`, [J2]);
assert('DELETE: verificado', ad.length === 0);

// --- CRUD Applications ---
console.log('\n   CRUD Applications vía SQL\n');
const A1 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbba001';
const A2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbba002';

// CREATE minimal
const { rows: [ca1] } = await query(
  `INSERT INTO job_applications (id,nombre,email,telefono,cargo) VALUES ($1,$2,$3,$4,$5) RETURNING id,nombre,status`,
  [A1, 'Admin Test', 'admin@test.com', '3009998877', 'Analista']
);
assert('INSERT app: creada', ca1.nombre === 'Admin Test');
assert('INSERT app: status default pendiente', ca1.status === 'pendiente');

// CREATE full
const { rows: [ca2] } = await query(
  `INSERT INTO job_applications (id,nombre,email,telefono,cargo,mensaje,cv_url,status,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id,nombre`,
  [A2, 'Full App', 'full@test.com', '300', 'Ingeniero', 'Mensaje de prueba', 'docs/cv.pdf', 'revisado', 'Nota admin']
);
assert('INSERT app full: creada', ca2.nombre === 'Full App');

// READ
const { rows: [ra1] } = await query(`SELECT * FROM job_applications WHERE id=$1`, [A1]);
assert('SELECT app: lectura por ID', ra1.nombre === 'Admin Test');
assert('email coincide', ra1.email === 'admin@test.com');
assert('telefono coincide', ra1.telefono === '3009998877');
assert('cargo coincide', ra1.cargo === 'Analista');
assert('cv_url es null', ra1.cv_url === null);

// UPDATE status through all states
await query(`UPDATE job_applications SET status='revisado' WHERE id=$1`, [A1]);
const { rows: [{ status: s1 }] } = await query(`SELECT status FROM job_applications WHERE id=$1`, [A1]);
assert('Status: revisado', s1 === 'revisado');

await query(`UPDATE job_applications SET status='contactado' WHERE id=$1`, [A1]);
const { rows: [{ status: s2 }] } = await query(`SELECT status FROM job_applications WHERE id=$1`, [A1]);
assert('Status: contactado', s2 === 'contactado');

await query(`UPDATE job_applications SET status='rechazado' WHERE id=$1`, [A1]);
const { rows: [{ status: s3 }] } = await query(`SELECT status FROM job_applications WHERE id=$1`, [A1]);
assert('Status: rechazado', s3 === 'rechazado');

await query(`UPDATE job_applications SET status='contratado' WHERE id=$1`, [A1]);
const { rows: [{ status: s4 }] } = await query(`SELECT status FROM job_applications WHERE id=$1`, [A1]);
assert('Status: contratado', s4 === 'contratado');

// UPDATE notes
await query(`UPDATE job_applications SET notes='Nota actualizada' WHERE id=$1`, [A1]);
const { rows: [{ notes: n1 }] } = await query(`SELECT notes FROM job_applications WHERE id=$1`, [A1]);
assert('UPDATE notes: actualizado', n1 === 'Nota actualizada');

// UPDATE cv_url
await query(`UPDATE job_applications SET cv_url='docs/new-cv.pdf' WHERE id=$1`, [A1]);
const { rows: [{ cv_url: cv }] } = await query(`SELECT cv_url FROM job_applications WHERE id=$1`, [A1]);
assert('UPDATE cv_url: actualizado', cv === 'docs/new-cv.pdf');

// DELETE
const { rows: [da1] } = await query(`DELETE FROM job_applications WHERE id=$1 RETURNING id`, [A2]);
assert('DELETE app: eliminado', da1.id === A2);
const { rows: ada } = await query(`SELECT id FROM job_applications WHERE id=$1`, [A2]);
assert('DELETE app: verificado', ada.length === 0);

// ================================================================
// 4. CLEANUP
// ================================================================
console.log('\n🧹 Cleanup');
await query(`DELETE FROM jobs WHERE id=$1`, [J1]);
await query(`DELETE FROM job_applications WHERE id=$1`, [A1]);
const finJobs = (await query(`SELECT COUNT(*)::int as c FROM jobs`)).rows[0].c;
assert('Jobs: seeds preservados', finJobs >= 4);
const { rows: [{ c: leftover }] } = await query(`SELECT COUNT(*)::int as c FROM job_applications WHERE email ~ 'test'`);
assert('Apps: sin registros de prueba', leftover === 0);

// ================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`INTEGRACIÓN: ${passed} ✅  |  ${failed} ❌  |  ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

await pool.end();
process.exit(failed > 0 ? 1 : 0);
