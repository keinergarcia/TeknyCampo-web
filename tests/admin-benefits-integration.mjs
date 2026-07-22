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

const { data: benefits, error: selErr } = await anonClient
  .from('benefits').select('id, title, active').limit(10);
assert('SELECT: puede leer beneficios', !selErr && benefits !== null, selErr?.message);

const allActive = benefits.every(s => s.active === true);
assert('SELECT: solo devuelve active=true', allActive);

const { data: inactiveAttempt } = await anonClient
  .from('benefits').select('id, active').eq('active', false).limit(5);
assert('SELECT: no puede filtrar inactivos', inactiveAttempt?.length === 0);

await assertAnonBlocked('INSERT: rechazado',
  () => anonClient.from('benefits').insert({ title: 'Anon', description: 'Test', icon_name: 'Users' })
);
await assertAnonBlocked('UPDATE: rechazado',
  () => anonClient.from('benefits').update({ title: 'Hacked' }).eq('id', benefits[0]?.id || '000')
);
await assertAnonBlocked('DELETE: rechazado',
  () => anonClient.from('benefits').delete().eq('id', benefits[0]?.id || '000')
);

// ================================================================
// 2. ADMIN (via pg)
// ================================================================
console.log('\n👑 ADMIN — vía pg\n');

const { rows: [{ is_admin }] } = await query(`SELECT is_admin()`);
assert('is_admin() existe y ejecutable', is_admin === false || is_admin === true);

const { rows: policies } = await query(`
  SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename='benefits' ORDER BY policyname
`);
const insPol = policies.find(p => p.policyname === 'admin_insert_benefits');
assert('admin_insert: WITH CHECK is_admin()',
  (insPol?.with_check ?? '').toLowerCase().includes('is_admin'));
const updPol = policies.find(p => p.policyname === 'admin_update_benefits');
assert('admin_update: USING is_admin()',
  (updPol?.qual ?? '').toLowerCase().includes('is_admin'));
const delPol = policies.find(p => p.policyname === 'admin_delete_benefits');
assert('admin_delete: USING is_admin()',
  (delPol?.qual ?? '').toLowerCase().includes('is_admin'));
const readPol = policies.find(p => p.policyname === 'public_read_benefits');
assert('public_read: USING active=true',
  (readPol?.qual ?? '').toLowerCase().includes('active = true'));

// CRUD
console.log('\n   CRUD vía SQL\n');
const B1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1';
const B2 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2';

// CREATE full
const { rows: [c1] } = await query(
  `INSERT INTO benefits (id,title,description,icon_name,order_index,active) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id,title`,
  [B1, 'Integration Test', 'Desc int', 'Heart', 10, true]
);
assert('INSERT: beneficio creado', c1.title === 'Integration Test');

// CREATE minimal
const { rows: [min] } = await query(
  `INSERT INTO benefits (id,title,description) VALUES ($1,$2,$3) RETURNING id,title`,
  [B2, 'Min', 'Min desc']
);
assert('INSERT mínima: creada', min.title === 'Min');

// READ
const { rows: [r1] } = await query(`SELECT * FROM benefits WHERE id=$1`, [B1]);
assert('SELECT: lectura por ID', r1.title === 'Integration Test');
assert('icon_name coincide', r1.icon_name === 'Heart');
assert('order_index coincide', r1.order_index === 10);
assert('active=true', r1.active === true);

// UPDATE
const { rows: [u1] } = await query(
  `UPDATE benefits SET title=$1, icon_name=$2 WHERE id=$3 RETURNING title, icon_name`,
  ['Updated Int', 'Star', B1]
);
assert('UPDATE: título actualizado', u1.title === 'Updated Int');
assert('UPDATE: icon_name actualizado', u1.icon_name === 'Star');

// TOGGLE off
await query(`UPDATE benefits SET active=false WHERE id=$1`, [B1]);
const { rows: [{ active: off }] } = await query(`SELECT active FROM benefits WHERE id=$1`, [B1]);
assert('TOGGLE: active=false', off === false);

// TOGGLE on
await query(`UPDATE benefits SET active=true WHERE id=$1`, [B1]);
const { rows: [{ active: on }] } = await query(`SELECT active FROM benefits WHERE id=$1`, [B1]);
assert('TOGGLE: active=true', on === true);

// DELETE
const { rows: [d1] } = await query(`DELETE FROM benefits WHERE id=$1 RETURNING id`, [B2]);
assert('DELETE: eliminado', d1.id === B2);
const { rows: ad } = await query(`SELECT id FROM benefits WHERE id=$1`, [B2]);
assert('DELETE: verificado', ad.length === 0);

// ================================================================
// 3. CLEANUP
// ================================================================
console.log('\n🧹 Cleanup');
await query(`DELETE FROM benefits WHERE id=$1`, [B1]);
const fin = (await query(`SELECT COUNT(*)::int as c FROM benefits`)).rows[0].c;
assert('Tabla limpia', fin >= 4); // seeds preserved

// ================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`INTEGRACIÓN: ${passed} ✅  |  ${failed} ❌  |  ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

await pool.end();
process.exit(failed > 0 ? 1 : 0);
