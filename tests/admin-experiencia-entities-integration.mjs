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
// 1. ANONYMOUS — via supabase-js (integración real)
// ================================================================
console.log('\n👤 ANÓNIMO — vía supabase-js (integración real)\n');

// EXPERIENCE ITEMS
const { data: expItems, error: expErr } = await anonClient
  .from('experience_items').select('id, text, active').limit(10);
assert('EXP: puede leer experience_items activos', !expErr && expItems?.length >= 6, expErr?.message);

const allActiveExp = expItems.every(s => s.active === true);
assert('EXP: solo devuelve active=true', allActiveExp);

const { data: inactiveExp } = await anonClient
  .from('experience_items').select('id, active').eq('active', false).limit(5);
assert('EXP: no puede filtrar inactivos', inactiveExp?.length === 0);

await assertAnonBlocked('EXP: INSERT rechazado',
  () => anonClient.from('experience_items').insert({ text: 'Anon test', order_index: 999 })
);
await assertAnonBlocked('EXP: UPDATE rechazado',
  () => anonClient.from('experience_items').update({ text: 'Hacked' }).eq('id', expItems[0].id)
);
await assertAnonBlocked('EXP: DELETE rechazado',
  () => anonClient.from('experience_items').delete().eq('id', expItems[0].id)
);

// ENTITIES
const { data: ents, error: entErr } = await anonClient
  .from('entities').select('id, name, active').limit(10);
assert('ENT: puede leer entities activos', !entErr && ents?.length >= 6, entErr?.message);

const allActiveEnt = ents.every(s => s.active === true);
assert('ENT: solo devuelve active=true', allActiveEnt);

const { data: inactiveEnt } = await anonClient
  .from('entities').select('id, active').eq('active', false).limit(5);
assert('ENT: no puede filtrar inactivos', inactiveEnt?.length === 0);

await assertAnonBlocked('ENT: INSERT rechazado',
  () => anonClient.from('entities').insert({ name: 'Anon', full_name: 'Anon SA', description: 'Test' })
);
await assertAnonBlocked('ENT: UPDATE rechazado',
  () => anonClient.from('entities').update({ name: 'Hacked' }).eq('id', ents[0].id)
);
await assertAnonBlocked('ENT: DELETE rechazado',
  () => anonClient.from('entities').delete().eq('id', ents[0].id)
);

// ================================================================
// 2. ADMIN — via pg directo (CRUD verificado)
// ================================================================
console.log('\n👑 ADMIN — vía PostgreSQL (operaciones verificadas)\n');

// is_admin() function works
const { rows: [{ is_admin }] } = await query(`SELECT is_admin()`);
assert('is_admin() función existe y es ejecutable', is_admin === false || is_admin === true);

// Verify admin policies for experience_items
const { rows: polExp } = await query(`
  SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'experience_items' ORDER BY policyname
`);
const insPolExp = polExp.find(p => p.policyname === 'admin_insert_experience_items');
assert('admin_insert_experience_items: WITH CHECK is_admin()',
  (insPolExp?.with_check ?? '').toLowerCase().includes('is_admin'));

const updPolExp = polExp.find(p => p.policyname === 'admin_update_experience_items');
assert('admin_update_experience_items: USING is_admin()',
  (updPolExp?.qual ?? '').toLowerCase().includes('is_admin'));

const delPolExp = polExp.find(p => p.policyname === 'admin_delete_experience_items');
assert('admin_delete_experience_items: USING is_admin()',
  (delPolExp?.qual ?? '').toLowerCase().includes('is_admin'));

const readPolExp = polExp.find(p => p.policyname === 'public_read_experience_items');
assert('public_read_experience_items: USING active=true',
  (readPolExp?.qual ?? '').toLowerCase().includes('active = true'));

// Verify admin policies for entities
const { rows: polEnt } = await query(`
  SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'entities' ORDER BY policyname
`);
const insPolEnt = polEnt.find(p => p.policyname === 'admin_insert_entities');
assert('admin_insert_entities: WITH CHECK is_admin()',
  (insPolEnt?.with_check ?? '').toLowerCase().includes('is_admin'));

const updPolEnt = polEnt.find(p => p.policyname === 'admin_update_entities');
assert('admin_update_entities: USING is_admin()',
  (updPolEnt?.qual ?? '').toLowerCase().includes('is_admin'));

const delPolEnt = polEnt.find(p => p.policyname === 'admin_delete_entities');
assert('admin_delete_entities: USING is_admin()',
  (delPolEnt?.qual ?? '').toLowerCase().includes('is_admin'));

const readPolEnt = polEnt.find(p => p.policyname === 'public_read_entities');
assert('public_read_entities: USING active=true',
  (readPolEnt?.qual ?? '').toLowerCase().includes('active = true'));

// CRUD test — experience_items
console.log('\n   Prueba CRUD — experience_items\n');
const TEST_EXP_ID = '44444444-4444-4444-4444-444444444444';

const { rows: [expCreated] } = await query(
  `INSERT INTO experience_items (id, text, order_index, active)
   VALUES ($1,$2,$3,$4) RETURNING id, text`,
  [TEST_EXP_ID, 'Exp Integration Test', 50, true]
);
assert('EXP INSERT: item creado', expCreated.text === 'Exp Integration Test');

const { rows: [expRead] } = await query(`SELECT * FROM experience_items WHERE id = $1`, [TEST_EXP_ID]);
assert('EXP SELECT: lectura por ID', expRead.text === 'Exp Integration Test');

const { rows: [expUpdated] } = await query(
  `UPDATE experience_items SET text=$1 WHERE id=$2 RETURNING text`,
  ['Exp Updated', TEST_EXP_ID]
);
assert('EXP UPDATE: texto actualizado', expUpdated.text === 'Exp Updated');

await query(`UPDATE experience_items SET active=false WHERE id=$1`, [TEST_EXP_ID]);
const { rows: [{ active: offExp }] } = await query(`SELECT active FROM experience_items WHERE id=$1`, [TEST_EXP_ID]);
assert('EXP TOGGLE: active=false', offExp === false);

await query(`UPDATE experience_items SET active=true WHERE id=$1`, [TEST_EXP_ID]);
const { rows: [{ active: onExp }] } = await query(`SELECT active FROM experience_items WHERE id=$1`, [TEST_EXP_ID]);
assert('EXP TOGGLE: active=true', onExp === true);

const { rows: [expDeleted] } = await query(`DELETE FROM experience_items WHERE id=$1 RETURNING id`, [TEST_EXP_ID]);
assert('EXP DELETE: eliminado', expDeleted.id === TEST_EXP_ID);

const { rows: expAftDel } = await query(`SELECT id FROM experience_items WHERE id=$1`, [TEST_EXP_ID]);
assert('EXP DELETE: verificado', expAftDel.length === 0);

// CRUD test — entities
console.log('\n   Prueba CRUD — entities\n');
const TEST_ENT_ID = '55555555-5555-5555-5555-555555555555';

const { rows: [entCreated] } = await query(
  `INSERT INTO entities (id, name, full_name, description, icon_name, order_index, active)
   VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, name`,
  [TEST_ENT_ID, 'Ent Integration Test', 'Integration Test SA', 'Desc', 'Building2', 50, true]
);
assert('ENT INSERT: entidad creada', entCreated.name === 'Ent Integration Test');

const { rows: [entRead] } = await query(`SELECT * FROM entities WHERE id = $1`, [TEST_ENT_ID]);
assert('ENT SELECT: lectura por ID', entRead.name === 'Ent Integration Test' && entRead.full_name === 'Integration Test SA');

const { rows: [entUpdated] } = await query(
  `UPDATE entities SET name=$1 WHERE id=$2 RETURNING name`,
  ['Ent Updated', TEST_ENT_ID]
);
assert('ENT UPDATE: nombre actualizado', entUpdated.name === 'Ent Updated');

await query(`UPDATE entities SET active=false WHERE id=$1`, [TEST_ENT_ID]);
const { rows: [{ active: offEnt }] } = await query(`SELECT active FROM entities WHERE id=$1`, [TEST_ENT_ID]);
assert('ENT TOGGLE: active=false', offEnt === false);

await query(`UPDATE entities SET active=true WHERE id=$1`, [TEST_ENT_ID]);
const { rows: [{ active: onEnt }] } = await query(`SELECT active FROM entities WHERE id=$1`, [TEST_ENT_ID]);
assert('ENT TOGGLE: active=true', onEnt === true);

const { rows: [entDeleted] } = await query(`DELETE FROM entities WHERE id=$1 RETURNING id`, [TEST_ENT_ID]);
assert('ENT DELETE: eliminado', entDeleted.id === TEST_ENT_ID);

const { rows: entAftDel } = await query(`SELECT id FROM entities WHERE id=$1`, [TEST_ENT_ID]);
assert('ENT DELETE: verificado', entAftDel.length === 0);

// ================================================================
// 3. CLEANUP & VERIFICATION
// ================================================================
console.log('\n🧹 Cleanup y verificación de seeds\n');

await query(`DELETE FROM experience_items WHERE id = $1`, [TEST_EXP_ID]);
await query(`DELETE FROM entities WHERE id = $1`, [TEST_ENT_ID]);

// Seeds intact — experience_items
const { rows: seedsExp } = await query(`SELECT text FROM experience_items ORDER BY order_index ASC`);
const stExp = seedsExp.map(r => r.text);
assert('Seed exp "Experiencia en proyectos agropecuarios" intacto', stExp[0] === 'Experiencia en proyectos agropecuarios');
assert('Seed exp "Acompanamiento tecnico especializado" intacto', stExp[1] === 'Acompanamiento tecnico especializado');
assert('Seed exp "Soluciones integrales para el campo" intacto', stExp[2] === 'Soluciones integrales para el campo');
assert('Seed exp "Cumplimiento y responsabilidad" intacto', stExp[3] === 'Cumplimiento y responsabilidad');
assert('Seed exp "Innovacion y tecnologia aplicada al agro" intacto', stExp[4] === 'Innovacion y tecnologia aplicada al agro');
assert('Seed exp "Compromiso con las comunidades rurales" intacto', stExp[5] === 'Compromiso con las comunidades rurales');

// Seeds intact — entities
const { rows: seedsEnt } = await query(`SELECT name FROM entities ORDER BY order_index ASC`);
const stEnt = seedsEnt.map(r => r.name);
assert('Seed ent "APRASEF" intacto', stEnt[0] === 'APRASEF');
assert('Seed ent "Universidad Francisco de Paula Santander Ocana" intacto', stEnt[1] === 'Universidad Francisco de Paula Santander Ocana');
assert('Seed ent "Alcaldia Municipal de Hacari" intacto', stEnt[2] === 'Alcaldia Municipal de Hacari');
assert('Seed ent "Asociacion de Municipios del Catatumbo" intacto', stEnt[3] === 'Asociacion de Municipios del Catatumbo');
assert('Seed ent "Alianza Fiduciaria S.A." intacto', stEnt[4] === 'Alianza Fiduciaria S.A.');
assert('Seed ent "Camara de Comercio de Ocana" intacto', stEnt[5] === 'Camara de Comercio de Ocana');

// ================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`INTEGRACIÓN: ${passed} ✅  |  ${failed} ❌  |  ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

await pool.end();
process.exit(failed > 0 ? 1 : 0);
