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
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) { console.error('❌ Faltan credenciales'); process.exit(1); }

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
// 1. ANONYMOUS
// ================================================================
console.log('\n👤 ANÓNIMO — vía supabase-js\n');

const { data: trainings, error: selErr } = await anonClient
  .from('trainings').select('id, title, active').limit(10);
assert('SELECT: puede leer trainings', !selErr && trainings !== null, selErr?.message);

const allActive = trainings.every(s => s.active === true);
assert('SELECT: solo devuelve active=true', allActive);

const { data: inactiveAttempt } = await anonClient
  .from('trainings').select('id, active').eq('active', false).limit(5);
assert('SELECT: no puede filtrar inactivos', inactiveAttempt?.length === 0);

await assertAnonBlocked('INSERT: rechazado',
  () => anonClient.from('trainings').insert({ title: 'Anon', description: 'Test', modality: 'presencial' })
);
await assertAnonBlocked('UPDATE: rechazado',
  () => anonClient.from('trainings').update({ title: 'Hacked' }).eq('id', trainings[0]?.id || '000')
);
await assertAnonBlocked('DELETE: rechazado',
  () => anonClient.from('trainings').delete().eq('id', trainings[0]?.id || '000')
);

// ================================================================
// 2. ADMIN (via pg)
// ================================================================
console.log('\n👑 ADMIN — vía pg\n');

const { rows: [{ is_admin }] } = await query(`SELECT is_admin()`);
assert('is_admin() existe y ejecutable', is_admin === false || is_admin === true);

const { rows: policies } = await query(`
  SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename='trainings' ORDER BY policyname
`);
const insPol = policies.find(p => p.policyname === 'admin_insert_trainings');
assert('admin_insert: WITH CHECK is_admin()',
  (insPol?.with_check ?? '').toLowerCase().includes('is_admin'));
const updPol = policies.find(p => p.policyname === 'admin_update_trainings');
assert('admin_update: USING is_admin()',
  (updPol?.qual ?? '').toLowerCase().includes('is_admin'));
const delPol = policies.find(p => p.policyname === 'admin_delete_trainings');
assert('admin_delete: USING is_admin()',
  (delPol?.qual ?? '').toLowerCase().includes('is_admin'));
const readPol = policies.find(p => p.policyname === 'public_read_trainings');
assert('public_read: USING active=true',
  (readPol?.qual ?? '').toLowerCase().includes('active = true'));

// CRUD
console.log('\n   CRUD vía SQL\n');
const T1 = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
const T2 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1';

// CREATE full
const { rows: [c1] } = await query(
  `INSERT INTO trainings (id,title,description,modality,price,curriculum,requirements,image_url,brochure_url,start_date,end_date,featured,certificate,order_index)
   VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::text[],$8,$9,$10,$11,$12,$13,$14) RETURNING id,title`,
  [T1, 'Integration Test', 'Desc int', 'presencial', null,
   JSON.stringify([{title:'M1', duration:'2h', topics:['T1']}]),
   '{ "Req1" }', 'trainings/ffff/img.jpg', 'documents/trainings/ffff/doc.pdf',
   '2026-08-01', '2026-08-28', true, false, 5]
);
assert('INSERT: capacitación creada', c1.title === 'Integration Test');

// CREATE minimal
const { rows: [min] } = await query(
  `INSERT INTO trainings (id,title,description,modality) VALUES ($1,$2,$3,$4) RETURNING id,title`,
  [T2, 'Min', 'Min desc', 'virtual']
);
assert('INSERT mínima: creada', min.title === 'Min');

// READ
const { rows: [r1] } = await query(`SELECT * FROM trainings WHERE id=$1`, [T1]);
assert('SELECT: lectura por ID', r1.title === 'Integration Test');
assert('curriculum JSONB correcto', Array.isArray(r1.curriculum) && r1.curriculum.length === 1);
assert('requirements TEXT[] correcto', Array.isArray(r1.requirements) && r1.requirements.length === 1);
assert('image_url coincide', r1.image_url === 'trainings/ffff/img.jpg');
assert('brochure_url coincide', r1.brochure_url === 'documents/trainings/ffff/doc.pdf');
assert('featured=true', r1.featured === true);
assert('certificate=false', r1.certificate === false);

// UPDATE
const { rows: [u1] } = await query(
  `UPDATE trainings SET title=$1, price=$2, modality=$3 WHERE id=$4 RETURNING title, price, modality`,
  ['Updated Int', 150000.00, 'hibrida', T1]
);
assert('UPDATE: título actualizado', u1.title === 'Updated Int');
assert('UPDATE: price actualizado', Number(u1.price) === 150000);
assert('UPDATE: modality actualizado', u1.modality === 'hibrida');

// TOGGLE off
await query(`UPDATE trainings SET active=false WHERE id=$1`, [T1]);
const { rows: [{ active: off }] } = await query(`SELECT active FROM trainings WHERE id=$1`, [T1]);
assert('TOGGLE: active=false', off === false);

// TOGGLE on
await query(`UPDATE trainings SET active=true WHERE id=$1`, [T1]);
const { rows: [{ active: on }] } = await query(`SELECT active FROM trainings WHERE id=$1`, [T1]);
assert('TOGGLE: active=true', on === true);

// DELETE
const { rows: [d1] } = await query(`DELETE FROM trainings WHERE id=$1 RETURNING id`, [T2]);
assert('DELETE: eliminado', d1.id === T2);
const { rows: ad } = await query(`SELECT id FROM trainings WHERE id=$1`, [T2]);
assert('DELETE: verificado', ad.length === 0);

// ================================================================
// 3. CLEANUP
// ================================================================
console.log('\n🧹 Cleanup');
await query(`DELETE FROM trainings WHERE id=$1`, [T1]);
const fin = (await query(`SELECT COUNT(*)::int as c FROM trainings`)).rows[0].c;
assert('Tabla vacía al final', fin === 0);

// ================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`INTEGRACIÓN: ${passed} ✅  |  ${failed} ❌  |  ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

await pool.end();
process.exit(failed > 0 ? 1 : 0);
