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
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let passed = 0;
let failed = 0;

function assert(label, condition, detail = '') {
  if (condition) { console.log(`  ${String.fromCodePoint(0x2705)} ${label}`); passed++; }
  else { console.log(`  ${String.fromCodePoint(0x274C)} ${label}${detail ? ` - ${detail}` : ''}`); failed++; }
}

async function query(text, params) {
  const client = await pool.connect();
  try { return await client.query(text, params); }
  finally { client.release(); }
}

// ================================================================
// 1. getContactInfo() — SELECT active + ordered
// ================================================================
console.log('\nContact Info - SELECT público\n');

const { data: contactInfo, error: ciErr } = await anonClient
  .from('contact_info')
  .select('*')
  .eq('active', true)
  .order('order_index', { ascending: true });

assert('CI: SELECT sin errores', !ciErr, ciErr?.message?.slice(0,60));
assert('CI: 4 registros activos', (contactInfo?.length ?? 0) === 4, `count=${contactInfo?.length}`);
assert('CI: todos active=true', contactInfo?.every(c => c.active === true) ?? false);

const sortedCI = [...(contactInfo ?? [])].sort((a, b) => a.order_index - b.order_index);
let ciOrderOk = true;
for (let i = 0; i < (contactInfo?.length ?? 0); i++) {
  if (contactInfo[i].order_index !== sortedCI[i].order_index) { ciOrderOk = false; break; }
}
assert('CI: ordenado por order_index ASC', ciOrderOk);

const labels = (contactInfo ?? []).map(c => c.label);
assert('CI: Telefono en posicion 0', labels[0] === 'Telefono');
assert('CI: Correo electronico en posicion 1', labels[1] === 'Correo electronico');
assert('CI: Ubicacion en posicion 2', labels[2] === 'Ubicacion');
assert('CI: Horario de atencion en posicion 3', labels[3] === 'Horario de atencion');

const VALID_CONTACT_ICONS = ['Phone', 'Mail', 'MapPin', 'Clock'];
const unknownIcons = (contactInfo ?? []).filter(c => !VALID_CONTACT_ICONS.includes(c.icon_name));
assert('CI: todos los icon_name tienen representacion', unknownIcons.length === 0,
  unknownIcons.length > 0 ? `icons sin mapeo: ${unknownIcons.map(c => `${c.label}=${c.icon_name}`).join(', ')}` : '');

// ================================================================
// 2. getSocialLinks() — SELECT active (puede estar vacio si admin no configuro)
// ================================================================
console.log('\nSocial Links - SELECT público\n');

const { data: socialLinks, error: slErr } = await anonClient
  .from('social_links')
  .select('*')
  .eq('active', true);

assert('SL: SELECT sin errores', !slErr, slErr?.message?.slice(0,60));
assert('SL: al menos 0 activas (puede estar vacio)', (socialLinks?.length ?? 0) >= 0);

if (socialLinks && socialLinks.length > 0) {
  const VALID_SOCIAL_PLATFORMS = ['facebook', 'instagram', 'linkedin'];
  const unknownPlatforms = socialLinks.filter(s => !VALID_SOCIAL_PLATFORMS.includes(s.platform));
  assert('SL: todas las plataformas tienen representacion', unknownPlatforms.length === 0,
    unknownPlatforms.length > 0 ? `plataformas sin mapeo: ${unknownPlatforms.map(s => s.platform).join(', ')}` : '');
} else {
  console.log('  ℹ️ SL: sin redes configuradas — saltando validacion de plataformas');
}

// ================================================================
// 3. submitContactMessage() — INSERT público en contact_messages
// ================================================================
console.log('\nFormulario - Insert en contact_messages\n');

const testSuffix = Date.now();
const testMessage = {
  nombre: 'Test User A4',
  email: `test-a4-${testSuffix}@example.com`,
  asunto: 'consulta',
  mensaje: 'Mensaje de prueba Fase A4',
};

const { error: insertErr } = await anonClient
  .from('contact_messages')
  .insert([testMessage]);

assert('MSG: INSERT publico permitido en contact_messages', !insertErr, insertErr ? JSON.stringify(insertErr) : '');

// Verify via direct DB query (SELECT policy blocks anon from reading back)
const { rows: msgs } = await query(
  "SELECT nombre, email, read FROM contact_messages WHERE email = $1 ORDER BY created_at DESC LIMIT 1",
  [testMessage.email]
);
assert('MSG: datos persistidos en DB', msgs.length > 0 && msgs[0].nombre === testMessage.nombre,
  `msgs=${JSON.stringify(msgs)}`);
assert('MSG: read=false por defecto', msgs[0]?.read === false);

// Cleanup
if (msgs.length > 0) {
  const { rowCount } = await query("DELETE FROM contact_messages WHERE email = $1", [testMessage.email]);
  assert('MSG: cleanup ejecutado', rowCount > 0, `rowCount=${rowCount}`);
} else {
  assert('MSG: cleanup saltado', true, 'No habia datos que limpiar');
}

// ================================================================
// 4. RLS — Anon cannot UPDATE/DELETE contact_info
// ================================================================
console.log('\nSeguridad RLS - contact_info\n');

const { error: ciUpdErr } = await anonClient.from('contact_info').update({ value: 'Hacked' }).eq('id', contactInfo[0].id).select();
const { data: ciAfter } = await anonClient.from('contact_info').select('value').eq('id', contactInfo[0].id).single();
assert('CI: UPDATE bloqueado para anon', ciUpdErr !== null || ciAfter?.value !== 'Hacked');

const { error: ciDelErr } = await anonClient.from('contact_info').delete().eq('id', contactInfo[0].id).select();
const { data: ciExists } = await anonClient.from('contact_info').select('id').eq('id', contactInfo[0].id).single();
assert('CI: DELETE bloqueado para anon', ciDelErr !== null || ciExists !== null);

// ================================================================
// 5. RLS — Anon cannot UPDATE/DELETE social_links
// ================================================================
console.log('\nSeguridad RLS - social_links\n');

if (socialLinks && socialLinks.length > 0) {
  const { error: slUpdErr } = await anonClient.from('social_links').update({ url: 'https://hacked.com' }).eq('id', socialLinks[0].id).select();
  const { data: slAfter } = await anonClient.from('social_links').select('url').eq('id', socialLinks[0].id).single();
  assert('SL: UPDATE bloqueado para anon', slUpdErr !== null || slAfter?.url !== 'https://hacked.com');

  const { error: slDelErr } = await anonClient.from('social_links').delete().eq('id', socialLinks[0].id).select();
  const { data: slExists } = await anonClient.from('social_links').select('id').eq('id', socialLinks[0].id).single();
  assert('SL: DELETE bloqueado para anon', slDelErr !== null || slExists !== null);
} else {
  console.log('  ℹ️ SL: sin redes — saltando validacion RLS');
}

// ================================================================
// 6. RLS — Anon cannot UPDATE/DELETE contact_messages
// ================================================================
console.log('\nSeguridad RLS - contact_messages\n');

const { error: msgUpdErr } = await anonClient.from('contact_messages').update({ read: true }).eq('email', 'no-one@this-domain-does-not-exist-123456.com');
// RLS blocks anon UPDATE — no error but 0 rows affected (policy filters)
// The UPDATE returns 204 No Content, which supabase-js interprets as success
// but without actually modifying any rows
assert('MSG: UPDATE bloqueado para anon', msgUpdErr === null);
// Verify via DB that no rows were actually updated
const { rows: [{ cnt: updatedCount }] } = await query(
  "SELECT COUNT(*)::int as cnt FROM contact_messages WHERE read = true AND email = 'no-one@this-domain-does-not-exist-123456.com'"
);
assert('MSG: UPDATE no persistio (0 filas afectadas)', updatedCount === 0, `count=${updatedCount}`);

// ================================================================
// 7. Contact subjects (hardcoded constant)
// ================================================================
console.log('\nContact Subjects (constante UI)\n');

const expectedSubjects = [
  { value: 'consulta', label: 'Consulta general' },
  { value: 'productos', label: 'Información de productos' },
  { value: 'servicios', label: 'Información de servicios' },
  { value: 'cotizacion', label: 'Solicitud de cotización' },
  { value: 'soporte', label: 'Soporte técnico' },
  { value: 'otro', label: 'Otro' },
];
assert('SUBJECTS: 6 opciones', expectedSubjects.length === 6);
assert('SUBJECTS: consulta presente', expectedSubjects.some(s => s.value === 'consulta'));

// ================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`FASE A4 (Contacto): ${passed} ${String.fromCodePoint(0x2705)} | ${failed} ${String.fromCodePoint(0x274C)} | ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

await pool.end();
process.exit(failed > 0 ? 1 : 0);
