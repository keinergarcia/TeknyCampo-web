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

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

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
  } catch (e) {
    assert(label, false, `Excepción: ${e.message?.slice(0,100)}`);
  }
}

// ================================================================
// 1. ANONYMOUS (via supabase-js — prueba de integración)
// ================================================================
console.log('\n👤 ANÓNIMO — vía supabase-js (integración real)\n');

const { data: services, error: selErr } = await anonClient
  .from('services').select('id, title, active').limit(5);
assert('SELECT: puede leer servicios activos', !selErr && services?.length >= 4, selErr?.message);

const allActive = services.every(s => s.active === true);
assert('SELECT: solo devuelve active=true', allActive);

const { data: inactiveAttempt } = await anonClient
  .from('services').select('id, active').eq('active', false).limit(5);
assert('SELECT: no puede filtrar inactivos', inactiveAttempt?.length === 0);

await assertAnonBlocked('INSERT: rechazado',
  () => anonClient.from('services').insert({
    title: 'Anon Test', description: 'Should fail', features: [],
    icon_name: 'Wheat', color_scheme: 'green', order_index: 999,
  })
);
await assertAnonBlocked('UPDATE: rechazado',
  () => anonClient.from('services').update({ title: 'Hacked' }).eq('id', services[0].id)
);
await assertAnonBlocked('DELETE: rechazado',
  () => anonClient.from('services').delete().eq('id', services[0].id)
);

// ================================================================
// 2. ADMIN (vía pg directo — operaciones verificadas)
// ================================================================
console.log('\n👑 ADMIN — vía PostgreSQL (operaciones verificadas)\n');

// is_admin() function works
const { rows: [{ is_admin }] } = await query(`SELECT is_admin()`);
// Note: is_admin() returns false when called directly (no auth context)
// This is expected — the function uses auth.uid() which is NULL in direct connections
// It returns true ONLY when called through Supabase with an authenticated admin session
assert('is_admin() función existe y es ejecutable', is_admin === false || is_admin === true);

// Verify admin policies grant access via is_admin() check structure
const { rows: policies } = await query(`
  SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'services' ORDER BY policyname
`);
const insertPolicy = policies.find(p => p.policyname === 'admin_insert_services');
assert('admin_insert_services: WITH CHECK is_admin()',
  (insertPolicy?.with_check ?? '').toLowerCase().includes('is_admin'));

const updatePolicy = policies.find(p => p.policyname === 'admin_update_services');
assert('admin_update_services: USING is_admin()',
  (updatePolicy?.qual ?? '').toLowerCase().includes('is_admin'));

const deletePolicy = policies.find(p => p.policyname === 'admin_delete_services');
assert('admin_delete_services: USING is_admin()',
  (deletePolicy?.qual ?? '').toLowerCase().includes('is_admin'));

const readPolicy = policies.find(p => p.policyname === 'public_read_services');
assert('public_read_services: USING active=true',
  (readPolicy?.qual ?? '').toLowerCase().includes('active = true'));

// CRUD test with test data (via pg, same SQL as frontend services)
console.log('\n   Prueba CRUD vía SQL (mismas consultas que lib/admin/services.ts)\n');
const TEST_SVC_ID = '33333333-3333-3333-3333-333333333333';

// CREATE
const { rows: [created] } = await query(
  `INSERT INTO services (id, title, description, features, icon_name, color_scheme, order_index, active)
   VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7,$8) RETURNING id,title`,
  [TEST_SVC_ID, 'Svc Integration Test', 'Desc', '["F1"]', 'Leaf', 'blue', 50, true]
);
assert('INSERT: servicio creado', created.title === 'Svc Integration Test');

// READ
const { rows: [read] } = await query(`SELECT * FROM services WHERE id = $1`, [TEST_SVC_ID]);
assert('SELECT: lectura por ID', read.title === 'Svc Integration Test' && read.description === 'Desc');

// UPDATE
const { rows: [updated] } = await query(
  `UPDATE services SET title=$1 WHERE id=$2 RETURNING title`,
  ['Svc Updated', TEST_SVC_ID]
);
assert('UPDATE: título actualizado', updated.title === 'Svc Updated');

// TOGGLE off
await query(`UPDATE services SET active=false WHERE id=$1`, [TEST_SVC_ID]);
const { rows: [{ active: off }] } = await query(`SELECT active FROM services WHERE id=$1`, [TEST_SVC_ID]);
assert('TOGGLE: active=false', off === false);

// TOGGLE on
await query(`UPDATE services SET active=true WHERE id=$1`, [TEST_SVC_ID]);
const { rows: [{ active: on }] } = await query(`SELECT active FROM services WHERE id=$1`, [TEST_SVC_ID]);
assert('TOGGLE: active=true', on === true);

// DELETE
const { rows: [deleted] } = await query(`DELETE FROM services WHERE id=$1 RETURNING id`, [TEST_SVC_ID]);
assert('DELETE: eliminado', deleted.id === TEST_SVC_ID);

const { rows: aftDel } = await query(`SELECT id FROM services WHERE id=$1`, [TEST_SVC_ID]);
assert('DELETE: verificado', aftDel.length === 0);

// ================================================================
// 3. CLEANUP & VERIFICATION
// ================================================================
console.log('\n🧹 Cleanup y verificación de seeds\n');

await query(`DELETE FROM services WHERE id = $1`, [TEST_SVC_ID]);

const { rows: seeds } = await query(`SELECT title FROM services ORDER BY order_index ASC`);
const st = seeds.map(r => r.title);
assert('Seed "Insumos Agropecuarios" intacto', st[0] === 'Insumos Agropecuarios');
assert('Seed "Soluciones Agricolas" intacto', st[1] === 'Soluciones Agricolas');
assert('Seed "Soluciones Ganaderas" intacto', st[2] === 'Soluciones Ganaderas');
assert('Seed "Capacitacion y Acompanamiento" intacto', st[3] === 'Capacitacion y Acompanamiento');

// ================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`INTEGRACIÓN: ${passed} ✅  |  ${failed} ❌  |  ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

await pool.end();
process.exit(failed > 0 ? 1 : 0);
