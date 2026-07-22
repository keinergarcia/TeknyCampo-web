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
const H1 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01';
const W1 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02';

// ================================================================
// 1. ANONYMOUS — vía supabase-js
// ================================================================
console.log('\n👤 ANÓNIMO — vía supabase-js\n');

// --- hero_stats ---
console.log('   hero_stats');
let { data: hData, error: hErr } = await anonClient
  .from('hero_stats').select('id, value, label, active').limit(10);
assert('SELECT: puede leer hero_stats', !hErr && hData !== null, hErr?.message);
let allActive = hData.every(s => s.active === true);
assert('SELECT: solo devuelve active=true', allActive);

let { data: hInactive } = await anonClient
  .from('hero_stats').select('id, active').eq('active', false).limit(5);
assert('SELECT: no puede filtrar inactivos', hInactive?.length === 0);

await assertAnonBlocked('INSERT: rechazado',
  () => anonClient.from('hero_stats').insert({ value: '1+', label: 'Test' }));
await assertAnonBlocked('UPDATE: rechazado',
  () => anonClient.from('hero_stats').update({ value: 'X' }).eq('id', hData[0]?.id || '000'));
await assertAnonBlocked('DELETE: rechazado',
  () => anonClient.from('hero_stats').delete().eq('id', hData[0]?.id || '000'));

// --- about_sections ---
console.log('   about_sections');
let { data: aData, error: aErr } = await anonClient
  .from('about_sections').select('id, section_key, title, active').limit(10);
assert('SELECT: puede leer about_sections', !aErr && aData !== null, aErr?.message);
allActive = aData.every(s => s.active === true);
assert('SELECT: solo devuelve active=true', allActive);

await assertAnonBlocked('INSERT: rechazado',
  () => anonClient.from('about_sections').insert({ section_key: 'historia', title: 'X', content: 'Y' }));
await assertAnonBlocked('UPDATE: rechazado',
  () => anonClient.from('about_sections').update({ title: 'X' }).eq('id', aData[0]?.id || '000'));
await assertAnonBlocked('DELETE: rechazado',
  () => anonClient.from('about_sections').delete().eq('id', aData[0]?.id || '000'));

// --- why_choose_us ---
console.log('   why_choose_us');
let { data: wData, error: wErr } = await anonClient
  .from('why_choose_us').select('id, title, active').limit(10);
assert('SELECT: puede leer why_choose_us', !wErr && wData !== null, wErr?.message);
allActive = wData.every(s => s.active === true);
assert('SELECT: solo devuelve active=true', allActive);

let { data: wInactive } = await anonClient
  .from('why_choose_us').select('id, active').eq('active', false).limit(5);
assert('SELECT: no puede filtrar inactivos', wInactive?.length === 0);

await assertAnonBlocked('INSERT: rechazado',
  () => anonClient.from('why_choose_us').insert({ title: 'Test', description: 'D' }));
await assertAnonBlocked('UPDATE: rechazado',
  () => anonClient.from('why_choose_us').update({ title: 'X' }).eq('id', wData[0]?.id || '000'));
await assertAnonBlocked('DELETE: rechazado',
  () => anonClient.from('why_choose_us').delete().eq('id', wData[0]?.id || '000'));

// ================================================================
// 2. ADMIN — vía pg
// ================================================================
console.log('\n👑 ADMIN — vía pg\n');

const { rows: [{ is_admin }] } = await query('SELECT is_admin()');
assert('is_admin() existe y ejecutable', is_admin === false || is_admin === true);

// --- Policy verification ---
for (const tbl of ['hero_stats', 'about_sections', 'why_choose_us']) {
  console.log(`   Políticas — ${tbl}`);
  const pol = await query(
    `SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename=$1 ORDER BY policyname`, [tbl]);
  const prefix = tbl;

  const insPol = pol.rows.find(p => p.policyname === `admin_insert_${prefix}`);
  assert(`admin_insert_${prefix}: WITH CHECK is_admin()`,
    (insPol?.with_check ?? '').toLowerCase().includes('is_admin'));

  const updPol = pol.rows.find(p => p.policyname === `admin_update_${prefix}`);
  assert(`admin_update_${prefix}: USING is_admin()`,
    (updPol?.qual ?? '').toLowerCase().includes('is_admin'));

  const delPol = pol.rows.find(p => p.policyname === `admin_delete_${prefix}`);
  assert(`admin_delete_${prefix}: USING is_admin()`,
    (delPol?.qual ?? '').toLowerCase().includes('is_admin'));

  const readPol = pol.rows.find(p => p.policyname === `public_read_${prefix}`);
  assert(`public_read_${prefix}: USING active=true`,
    (readPol?.qual ?? '').toLowerCase().includes('active = true'));
}

// --- CRUD hero_stats ---
console.log('\n   CRUD hero_stats');
let { rows: [cH] } = await query(
  `INSERT INTO hero_stats (id, value, label, order_index, active) VALUES ($1,$2,$3,$4,$5) RETURNING id, value`,
  [H1, '99+', 'Integration Test', 10, true]);
assert('INSERT hero_stats creado', cH.value === '99+');

let { rows: [rH] } = await query(`SELECT * FROM hero_stats WHERE id=$1`, [H1]);
assert('SELECT hero_stats por ID', rH.label === 'Integration Test');
assert('order_index coincide', rH.order_index === 10);
assert('active=true', rH.active === true);

let { rows: [uH] } = await query(
  `UPDATE hero_stats SET value=$1, label=$2 WHERE id=$3 RETURNING label`,
  ['200+', 'Updated Int', H1]);
assert('UPDATE hero_stats título', uH.label === 'Updated Int');

await query(`UPDATE hero_stats SET active=false WHERE id=$1`, [H1]);
let { rows: [{ active: hOff }] } = await query('SELECT active FROM hero_stats WHERE id=$1', [H1]);
assert('TOGGLE hero_stats: false', hOff === false);
await query(`UPDATE hero_stats SET active=true WHERE id=$1`, [H1]);
let { rows: [{ active: hOn }] } = await query('SELECT active FROM hero_stats WHERE id=$1', [H1]);
assert('TOGGLE hero_stats: true', hOn === true);

let { rows: [dH] } = await query(`DELETE FROM hero_stats WHERE id=$1 RETURNING id`, [H1]);
assert('DELETE hero_stats', dH.id === H1);

// --- CRUD why_choose_us ---
console.log('   CRUD why_choose_us');
let { rows: [cW] } = await query(
  `INSERT INTO why_choose_us (id, icon_name, title, description, order_index) VALUES ($1,$2,$3,$4,$5) RETURNING id, title`,
  [W1, 'Award', 'Razón Test', 'Desc integración', 5]);
assert('INSERT why_choose_us creado', cW.title === 'Razón Test');

let { rows: [rW] } = await query(`SELECT * FROM why_choose_us WHERE id=$1`, [W1]);
assert('SELECT why_choose_us por ID', rW.icon_name === 'Award');
assert('description coincide', rW.description === 'Desc integración');
assert('order_index=5', rW.order_index === 5);

let { rows: [uW] } = await query(
  `UPDATE why_choose_us SET title=$1, icon_name=$2 WHERE id=$3 RETURNING title, icon_name`,
  ['Updated Test', 'Heart', W1]);
assert('UPDATE why_choose_us', uW.title === 'Updated Test');

await query(`UPDATE why_choose_us SET active=false WHERE id=$1`, [W1]);
let { rows: [{ active: wOff }] } = await query('SELECT active FROM why_choose_us WHERE id=$1', [W1]);
assert('TOGGLE why_choose_us: false', wOff === false);
await query(`UPDATE why_choose_us SET active=true WHERE id=$1`, [W1]);
let { rows: [{ active: wOn }] } = await query('SELECT active FROM why_choose_us WHERE id=$1', [W1]);
assert('TOGGLE why_choose_us: true', wOn === true);

let { rows: [dW] } = await query(`DELETE FROM why_choose_us WHERE id=$1 RETURNING id`, [W1]);
assert('DELETE why_choose_us', dW.id === W1);

// --- about_sections: update + toggle ---
console.log('   about_sections');
const aId = (await query("SELECT id FROM about_sections WHERE section_key='vision'")).rows[0].id;

let { rows: [uA] } = await query(
  `UPDATE about_sections SET title=$1 WHERE id=$2 RETURNING title`, ['Visión Actualizada', aId]);
assert('UPDATE about_sections title', uA.title === 'Visión Actualizada');
uA = (await query(`UPDATE about_sections SET title='Vision' WHERE id=$1 RETURNING title`, [aId])).rows[0];
assert('UPDATE about_sections restaurado', uA.title === 'Vision');

await query(`UPDATE about_sections SET active=false WHERE id=$1`, [aId]);
let { rows: [{ active: aOff }] } = await query('SELECT active FROM about_sections WHERE id=$1', [aId]);
assert('TOGGLE about_sections: false', aOff === false);
await query(`UPDATE about_sections SET active=true WHERE id=$1`, [aId]);
let { rows: [{ active: aOn }] } = await query('SELECT active FROM about_sections WHERE id=$1', [aId]);
assert('TOGGLE about_sections: true', aOn === true);

// ================================================================
// 3. CLEANUP
// ================================================================
console.log('\n🧹 Cleanup');
let fin = (await query('SELECT COUNT(*)::int as c FROM hero_stats')).rows[0].c;
assert('hero_stats seeds preserved', fin >= 3);
fin = (await query('SELECT COUNT(*)::int as c FROM about_sections')).rows[0].c;
assert('about_sections seeds preserved (5)', fin === 5);
fin = (await query('SELECT COUNT(*)::int as c FROM why_choose_us')).rows[0].c;
assert('why_choose_us seeds preserved', fin >= 4);

// ================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`INTEGRACIÓN: ${passed} ✅  |  ${failed} ❌  |  ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

await pool.end();
process.exit(failed > 0 ? 1 : 0);
