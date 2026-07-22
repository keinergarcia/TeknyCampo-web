import pg from 'pg';
import { existsSync } from 'fs';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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
console.log('🔷 MÓDULO 8 — Configuración del Sitio / SQL directas');
console.log('='.repeat(50));

// 1. DATABASE CONNECTION
console.log('\n📡 Conexión');
try {
  const r = await query('SELECT version()');
  assert('Conexión exitosa', r.rows.length === 1, r.rows[0].version.slice(0, 60));
} catch (e) { assert('Conexión exitosa', false, e.message); }

// 2. TABLES EXIST + RLS
console.log('\n📋 Tablas');
for (const t of ['site_config', 'contact_info', 'social_links', 'contact_messages']) {
  const c = await query(`SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1`, [t]);
  assert(`Tabla ${t} existe`, c.rows.length === 1);
  const rls = await query(`SELECT relrowsecurity FROM pg_class WHERE relname=$1`, [t]);
  assert(`RLS en ${t}`, rls.rows[0]?.relrowsecurity === true);
}

// 3. SEED DATA — site_config
console.log('\n📊 Seeds');
const sc = await query(`SELECT id, site_name, rate_limit_contact_seconds FROM site_config WHERE id=1`);
assert('site_config fila única existe', sc.rows.length === 1);
assert('rate_limit_contact_seconds default', sc.rows[0].rate_limit_contact_seconds === 60);

const ci = await query(`SELECT COUNT(*)::int as c FROM contact_info`);
assert('contact_info seeds >= 4', ci.rows[0].c >= 4);

const sl = await query(`SELECT COUNT(*)::int as c FROM social_links`);
assert('social_links 3 plataformas', sl.rows[0].c === 3);

// 4. PAGINATION — contact_info
console.log('\n📄 Paginación');
const p1 = await query(`SELECT * FROM contact_info ORDER BY order_index ASC LIMIT 2 OFFSET 0`);
const p2 = await query(`SELECT * FROM contact_info ORDER BY order_index ASC LIMIT 2 OFFSET 2`);
assert('Página 1 devuelve 2', p1.rows.length === 2);
assert('Página 2 no se solapa', p2.rows.length > 0 && p1.rows[0].id !== p2.rows[0].id);

// 5. SEARCH — contact_info
console.log('\n🔍 Búsqueda');
const sr = await query(`SELECT * FROM contact_info WHERE label ILIKE $1`, ['%telefono%']);
assert('ILIKE encuentra label', sr.rows.length >= 1);
const es = await query(`SELECT * FROM contact_info WHERE value ILIKE $1`, ['%xyznotexist%']);
assert('Sin resultados = 0', es.rows.length === 0);

// 6. SORT — contact_info
console.log('\n🔢 Ordenamiento');
const asc = await query(`SELECT * FROM contact_info ORDER BY label ASC`);
const desc = await query(`SELECT * FROM contact_info ORDER BY label DESC`);
assert('ASC vs DESC distintos', asc.rows[0].id !== desc.rows[0].id);

// 7. CONTACT_INFO CRUD
console.log('\n✏️ CRUD contact_info');
const C1 = 'cccccccc-cccc-cccc-cccc-cccccccccc01';
await query(`INSERT INTO contact_info (id,label,value,icon_name,order_index,active) VALUES ($1,$2,$3,$4,$5,$6)`,
  [C1, 'Test Label', 'Test Value', 'Star', 50, true]);
assertRow('INSERT', `SELECT id,label,value FROM contact_info WHERE id=$1`, [C1], { label: 'Test Label', value: 'Test Value' });

const ru = await query(`SELECT * FROM contact_info WHERE id=$1`, [C1]);
assert('SELECT: label', ru.rows[0].label === 'Test Label');
assert('SELECT: value', ru.rows[0].value === 'Test Value');
assert('SELECT: icon_name', ru.rows[0].icon_name === 'Star');
assert('SELECT: order_index', ru.rows[0].order_index === 50);
assert('SELECT: active=true', ru.rows[0].active === true);

const up = await query(`UPDATE contact_info SET label=$1,order_index=$2 WHERE id=$3 RETURNING label,order_index`,
  ['Updated Label', 25, C1]);
assert('UPDATE label', up.rows[0].label === 'Updated Label');
assert('UPDATE order_index', up.rows[0].order_index === 25);

await query(`UPDATE contact_info SET active=false WHERE id=$1`, [C1]);
const off = await query(`SELECT active FROM contact_info WHERE id=$1`, [C1]);
assert('TOGGLE off', off.rows[0].active === false);
await query(`UPDATE contact_info SET active=true WHERE id=$1`, [C1]);
const on = await query(`SELECT active FROM contact_info WHERE id=$1`, [C1]);
assert('TOGGLE on', on.rows[0].active === true);

const dl = await query(`DELETE FROM contact_info WHERE id=$1 RETURNING id`, [C1]);
assert('DELETE', dl.rows.length === 1);
const ad = await query(`SELECT id FROM contact_info WHERE id=$1`, [C1]);
assert('DELETE verificado', ad.rows.length === 0);

// 8. NOT NULL — contact_info
console.log('\n⚠️  NOT NULL contact_info');
await assertError('label NULL', `INSERT INTO contact_info (id,label,value) VALUES ($1,NULL,'v')`, ['cccccccc-cccc-cccc-cccc-cccccccccc02']);
await assertError('value NULL', `INSERT INTO contact_info (id,label,value) VALUES ($1,'l',NULL)`, ['cccccccc-cccc-cccc-cccc-cccccccccc03']);

// 9. SITE_CONFIG — update
console.log('\n📝 SiteConfig UPDATE');
const scUp = await query(`UPDATE site_config SET site_name=$1,rate_limit_contact_seconds=$2 WHERE id=1 RETURNING site_name,rate_limit_contact_seconds`,
  ['Test Site', 120]);
assert('UPDATE site_name', scUp.rows[0].site_name === 'Test Site');
assert('UPDATE rate_limit', scUp.rows[0].rate_limit_contact_seconds === 120);
await query(`UPDATE site_config SET site_name='Tekny Campo',rate_limit_contact_seconds=60 WHERE id=1`);
const scRestore = await query(`SELECT site_name,rate_limit_contact_seconds FROM site_config WHERE id=1`);
assert('Restaurado', scRestore.rows[0].site_name === 'Tekny Campo' && scRestore.rows[0].rate_limit_contact_seconds === 60);

// 10. SOCIAL_LINKS — update + toggle
console.log('\n📝 SocialLinks UPDATE');
const fb = await query(`SELECT id,platform,url,active FROM social_links WHERE platform='facebook'`);
const fbId = fb.rows[0].id;
const slUp = await query(`UPDATE social_links SET url=$1 WHERE id=$2 RETURNING url`, ['https://fb.com/test', fbId]);
assert('UPDATE url', slUp.rows[0].url === 'https://fb.com/test');
await query(`UPDATE social_links SET active=false WHERE id=$1`, [fbId]);
const slOff = await query(`SELECT active FROM social_links WHERE id=$1`, [fbId]);
assert('TOGGLE off', slOff.rows[0].active === false);
await query(`UPDATE social_links SET active=true WHERE id=$1`, [fbId]);
const slOn = await query(`SELECT active FROM social_links WHERE id=$1`, [fbId]);
assert('TOGGLE on', slOn.rows[0].active === true);
await query(`UPDATE social_links SET url='#',active=false WHERE id=$1`, [fbId]);

// 11. CONTACT_MESSAGES — readonly management
console.log('\n✏️ ContactMessages');
const M1 = 'dddddddd-dddd-dddd-dddd-dddddddddd01';
const M2 = 'dddddddd-dddd-dddd-dddd-dddddddddd02';

await query(`INSERT INTO contact_messages (id,nombre,email,asunto,mensaje) VALUES ($1,$2,$3,$4,$5)`,
  [M1, 'Test Msg', 'msg@test.com', 'Asunto Test', 'Mensaje de prueba']);
assertRow('INSERT', `SELECT id,nombre,asunto FROM contact_messages WHERE id=$1`, [M1],
  { nombre: 'Test Msg', asunto: 'Asunto Test' });

const rm = await query(`SELECT * FROM contact_messages WHERE id=$1`, [M1]);
assert('SELECT: nombre', rm.rows[0].nombre === 'Test Msg');
assert('SELECT: email', rm.rows[0].email === 'msg@test.com');
assert('SELECT: asunto', rm.rows[0].asunto === 'Asunto Test');
assert('SELECT: mensaje', rm.rows[0].mensaje === 'Mensaje de prueba');
assert('SELECT: read=false', rm.rows[0].read === false);

await query(`UPDATE contact_messages SET read=true WHERE id=$1`, [M1]);
const rdOn = await query(`SELECT read FROM contact_messages WHERE id=$1`, [M1]);
assert('Marcar leído', rdOn.rows[0].read === true);

await query(`UPDATE contact_messages SET read=false WHERE id=$1`, [M1]);
const rdOff = await query(`SELECT read FROM contact_messages WHERE id=$1`, [M1]);
assert('Marcar no leído', rdOff.rows[0].read === false);

// Mensaje length constraint
console.log('\n⚠️  Constraints messages');
const longMsg = 'x'.repeat(5001);
await assertError('Mensaje > 5000 chars',
  `INSERT INTO contact_messages (id,nombre,email,asunto,mensaje) VALUES ($1,$2,$3,$4,$5)`,
  [M2, 'Test', 't@t.com', 'Asunto', longMsg]);

await assertError('Email inválido',
  `INSERT INTO contact_messages (id,nombre,email,asunto,mensaje) VALUES ($1,$2,$3,$4,$5)`,
  ['dddddddd-dddd-dddd-dddd-dddddddddd03', 'Test', 'invalido', 'Asunto', 'Msg']);

await assertError('nombre NULL',
  `INSERT INTO contact_messages (id,nombre,email,asunto,mensaje) VALUES ($1,NULL,$2,$3,$4)`,
  ['dddddddd-dddd-dddd-dddd-dddddddddd04', 'e@t.com', 'Asunto', 'Msg']);

// DELETE
const dlM = await query(`DELETE FROM contact_messages WHERE id=$1 RETURNING id`, [M1]);
assert('DELETE message', dlM.rows.length === 1);

// 12. RLS POLICIES
console.log('\n🔒 Políticas RLS');
for (const [table, policies] of [
  ['site_config', ['public_read_site_config', 'admin_update_site_config']],
  ['contact_info', ['public_read_contact_info', 'admin_insert_contact_info', 'admin_update_contact_info', 'admin_delete_contact_info']],
  ['social_links', ['public_read_social_links', 'admin_insert_social_links', 'admin_update_social_links', 'admin_delete_social_links']],
  ['contact_messages', ['admin_select_contact_messages', 'public_insert_contact_messages', 'admin_update_contact_messages', 'admin_delete_contact_messages']],
]) {
  for (const p of policies) {
    const pol = await query(`SELECT policyname FROM pg_policies WHERE tablename=$1 AND policyname=$2`, [table, p]);
    assert(`${p} existe`, pol.rows.length === 1);
  }
}

// Verify public_read_* filter active=true
const readCiPol = await query(`SELECT qual FROM pg_policies WHERE tablename='contact_info' AND policyname='public_read_contact_info'`);
assert('public_read_contact_info filtra active=true',
  (readCiPol.rows[0]?.qual ?? '').toLowerCase().includes('active = true'));

const readSlPol = await query(`SELECT qual FROM pg_policies WHERE tablename='social_links' AND policyname='public_read_social_links'`);
assert('public_read_social_links filtra active=true',
  (readSlPol.rows[0]?.qual ?? '').toLowerCase().includes('active = true'));

const readScPol = await query(`SELECT qual FROM pg_policies WHERE tablename='site_config' AND policyname='public_read_site_config'`);
assert('public_read_site_config permite todo (true)',
  (readScPol.rows[0]?.qual ?? '').toLowerCase().includes('true'));

const insCmPol = await query(`SELECT with_check FROM pg_policies WHERE tablename='contact_messages' AND policyname='public_insert_contact_messages'`);
assert('public_insert_contact_messages WITH CHECK true',
  (insCmPol.rows[0]?.with_check ?? '').toLowerCase().includes('true'));

// 13. SEEDS PRESERVED
console.log('\n🔄 Regresiones — seeds');
const seeds = await query(`SELECT label, order_index FROM contact_info WHERE active=true ORDER BY order_index ASC`);
assert('"Telefono" en seeds (orden 0)', seeds.rows[0]?.label?.toLowerCase() === 'telefono');
assert('"Correo electronico" en seeds (orden 1)', seeds.rows[1]?.label?.toLowerCase() === 'correo electronico');
assert('"Ubicacion" en seeds (orden 2)', seeds.rows[2]?.label?.toLowerCase() === 'ubicacion');

// 14. FILES INTEGRITY
console.log('\n📁 Archivos del módulo');
for (const f of [
  'src/lib/admin/config.ts', 'src/hooks/admin/useConfig.ts',
  'src/pages/admin/SiteConfig/SiteConfigPage.tsx',
  'src/pages/admin/ContactInfo/ContactInfoList.tsx', 'src/pages/admin/ContactInfo/ContactInfoForm.tsx',
  'src/pages/admin/SocialLinks/SocialLinkList.tsx',
  'src/pages/admin/Messages/MessageList.tsx', 'src/pages/admin/Messages/MessageDetail.tsx',
]) {
  assert(`Archivo ${f} existe`, existsSync(f));
}

// ================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`RESULTADOS: ${passed} ✅  |  ${failed} ❌  |  ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);
await pool.end();
process.exit(failed > 0 ? 1 : 0);
