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

console.log('🔷 MÓDULO 8 — Integration Tests (Configuración del Sitio)');
console.log('='.repeat(50));

// ================================================================
// ANONYMOUS — site_config
// ================================================================
console.log('\n👤 ANÓNIMO — site_config\n');
const { data: sc, error: scErr } = await anonClient.from('site_config').select('site_name, tagline').single();
assert('SELECT site_config: lectura pública permitida', !scErr && sc?.site_name === 'Tekny Campo', scErr?.message);

await assertAnonBlocked('UPDATE site_config: rechazado',
  () => anonClient.from('site_config').update({ site_name: 'Hacked' }).eq('id', 1)
);

// ANONYMOUS — contact_info
console.log('\n👤 ANÓNIMO — contact_info\n');
const { data: ci, error: ciErr } = await anonClient.from('contact_info').select('id, label, active').limit(10);
assert('SELECT contact_info: permitido', !ciErr && ci !== null, ciErr?.message);
const allCiActive = ci.every(c => c.active === true);
assert('SELECT contact_info: solo active=true', allCiActive);

await assertAnonBlocked('INSERT contact_info: rechazado',
  () => anonClient.from('contact_info').insert({ label: 'Test', value: 'Test' })
);
await assertAnonBlocked('UPDATE contact_info: rechazado',
  () => anonClient.from('contact_info').update({ label: 'Hacked' }).eq('id', ci[0]?.id || '000')
);
await assertAnonBlocked('DELETE contact_info: rechazado',
  () => anonClient.from('contact_info').delete().eq('id', ci[0]?.id || '000')
);

// ANONYMOUS — social_links
console.log('\n👤 ANÓNIMO — social_links\n');
const { data: sl, error: slErr } = await anonClient.from('social_links').select('platform, active').limit(10);
assert('SELECT social_links: permitido', !slErr && sl !== null, slErr?.message);
const allSlActive = sl.every(s => s.active === true);
assert('SELECT social_links: solo active=true', allSlActive);

await assertAnonBlocked('UPDATE social_links: rechazado',
  () => anonClient.from('social_links').update({ url: 'https://evil.com' }).eq('id', sl[0]?.id || '000')
);

// ANONYMOUS — contact_messages (INSERT permitido, SELECT/UPDATE/DELETE bloqueado)
console.log('\n👤 ANÓNIMO — contact_messages\n');
const { error: insMsgErr } = await anonClient.from('contact_messages').insert({
  nombre: 'Anon User', email: 'anon-user@test.com', asunto: 'Test', mensaje: 'Test message'
});
assert('INSERT contact_messages: permitido (público)', !insMsgErr, insMsgErr?.message);

const { data: msSel, error: selMsErr } = await anonClient.from('contact_messages').select('id').limit(5);
assert('SELECT contact_messages: bloqueado', selMsErr !== null || msSel?.length === 0);

await assertAnonBlocked('UPDATE contact_messages: rechazado',
  () => anonClient.from('contact_messages').update({ read: true }).eq('id', '00000000-0000-0000-0000-000000000000')
);
await assertAnonBlocked('DELETE contact_messages: rechazado',
  () => anonClient.from('contact_messages').delete().eq('id', '00000000-0000-0000-0000-000000000000')
);

// Cleanup anon message
await query(`DELETE FROM contact_messages WHERE email = 'anon-user@test.com'`);

// ================================================================
// ADMIN (via pg)
// ================================================================
console.log('\n👑 ADMIN — vía pg\n');

const { rows: [{ is_admin }] } = await query(`SELECT is_admin()`);
assert('is_admin() existe', is_admin === false || is_admin === true);

// Policies verification
console.log('   Policies\n');
const tables = ['site_config', 'contact_info', 'social_links', 'contact_messages'];
for (const t of tables) {
  const pols = await query(`SELECT policyname FROM pg_policies WHERE tablename=$1 ORDER BY policyname`, [t]);
  assert(`Políticas en ${t} >= 1`, pols.rows.length >= 1);
}

// CRUD contact_info
console.log('\n   CRUD contact_info\n');
const C1 = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01';
await query(`INSERT INTO contact_info (id,label,value,icon_name,order_index,active) VALUES ($1,$2,$3,$4,$5,$6)`,
  [C1, 'Int Test', 'Int Value', 'Phone', 10, true]);
const cr1 = await query(`SELECT label,value FROM contact_info WHERE id=$1`, [C1]);
assert('CREATE: creado', cr1.rows[0].label === 'Int Test');

await query(`UPDATE contact_info SET label=$1 WHERE id=$2`, ['Int Updated', C1]);
const ur1 = await query(`SELECT label FROM contact_info WHERE id=$1`, [C1]);
assert('UPDATE: actualizado', ur1.rows[0].label === 'Int Updated');

await query(`UPDATE contact_info SET active=false WHERE id=$1`, [C1]);
const tr1 = await query(`SELECT active FROM contact_info WHERE id=$1`, [C1]);
assert('TOGGLE off', tr1.rows[0].active === false);

await query(`UPDATE contact_info SET active=true WHERE id=$1`, [C1]);
const tr2 = await query(`SELECT active FROM contact_info WHERE id=$1`, [C1]);
assert('TOGGLE on', tr2.rows[0].active === true);

await query(`DELETE FROM contact_info WHERE id=$1`, [C1]);
const dr1 = await query(`SELECT id FROM contact_info WHERE id=$1`, [C1]);
assert('DELETE: eliminado', dr1.rows.length === 0);

// CRUD site_config (singleton update)
console.log('\n   CRUD site_config\n');
await query(`UPDATE site_config SET site_name=$1, tagline=$2 WHERE id=1`, ['Test Int', 'Test tagline']);
const sc1 = await query(`SELECT site_name,tagline FROM site_config WHERE id=1`);
assert('UPDATE: site_name', sc1.rows[0].site_name === 'Test Int');
assert('UPDATE: tagline', sc1.rows[0].tagline === 'Test tagline');
// Restore
await query(`UPDATE site_config SET site_name='Tekny Campo', tagline='Tecnologia al servicio del campo' WHERE id=1`);
const sc2 = await query(`SELECT site_name FROM site_config WHERE id=1`);
assert('Restore: site_name', sc2.rows[0].site_name === 'Tekny Campo');

// CRUD messages (admin management)
console.log('\n   CRUD messages\n');
const M1 = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeea1';
await query(`INSERT INTO contact_messages (id,nombre,email,asunto,mensaje) VALUES ($1,$2,$3,$4,$5)`,
  [M1, 'Admin Msg', 'admin@test.com', 'Test', 'Body']);
const mr1 = await query(`SELECT nombre,asunto,read FROM contact_messages WHERE id=$1`, [M1]);
assert('CREATE message', mr1.rows[0].nombre === 'Admin Msg');
assert('read=false', mr1.rows[0].read === false);

await query(`UPDATE contact_messages SET read=true WHERE id=$1`, [M1]);
const mr2 = await query(`SELECT read FROM contact_messages WHERE id=$1`, [M1]);
assert('Mark as read', mr2.rows[0].read === true);

await query(`DELETE FROM contact_messages WHERE id=$1`, [M1]);
const mr3 = await query(`SELECT id FROM contact_messages WHERE id=$1`, [M1]);
assert('DELETE message', mr3.rows.length === 0);

// CRUD social_links
console.log('\n   CRUD social_links\n');
const ig = await query(`SELECT id,url FROM social_links WHERE platform='instagram'`);
const igId = ig.rows[0].id;
await query(`UPDATE social_links SET url=$1 WHERE id=$2`, ['https://instagram.com/test', igId]);
const sr1 = await query(`SELECT url FROM social_links WHERE id=$1`, [igId]);
assert('UPDATE url', sr1.rows[0].url === 'https://instagram.com/test');

await query(`UPDATE social_links SET active=false WHERE id=$1`, [igId]);
const sr2 = await query(`SELECT active FROM social_links WHERE id=$1`, [igId]);
assert('TOGGLE off', sr2.rows[0].active === false);

await query(`UPDATE social_links SET active=true WHERE id=$1`, [igId]);
const sr3 = await query(`SELECT active FROM social_links WHERE id=$1`, [igId]);
assert('TOGGLE on', sr3.rows[0].active === true);

// Restore
await query(`UPDATE social_links SET url='#',active=false WHERE id=$1`, [igId]);

// ================================================================
// CLEANUP
// ================================================================
console.log('\n🧹 Cleanup');
const fin = (await query(`SELECT COUNT(*)::int as c FROM contact_info WHERE label='Int Test'`)).rows[0].c;
assert('Sin registros de prueba en contact_info', fin === 0);

// ================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`INTEGRACIÓN: ${passed} ✅  |  ${failed} ❌  |  ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);
await pool.end();
process.exit(failed > 0 ? 1 : 0);
