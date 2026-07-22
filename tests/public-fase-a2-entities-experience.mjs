import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';

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

// ================================================================
// 1. getEntities() via supabase-js
// ================================================================
console.log('\nEntities (getEntities)\n');

// SELECT active entities ordered by order_index
const { data: entities, error: entErr } = await anonClient
  .from('entities')
  .select('id, name, full_name, description, icon_name, order_index, active')
  .eq('active', true)
  .order('order_index', { ascending: true });

assert('ENT: SELECT sin errores', !entErr, entErr?.message);
assert('ENT: al menos 6 registros activos', (entities?.length ?? 0) >= 6, `count=${entities?.length}`);
assert('ENT: todos active=true', entities?.every(e => e.active === true) ?? false);

// Validate order_index
const sortedEntities = [...(entities ?? [])].sort((a, b) => a.order_index - b.order_index);
let orderOk = true;
for (let i = 0; i < (entities?.length ?? 0); i++) {
  if (entities[i].order_index !== sortedEntities[i].order_index) { orderOk = false; break; }
}
assert('ENT: ordenado por order_index ASC', orderOk);

// Validate seed data
const names = (entities ?? []).map(e => e.name);
assert('ENT: APRASEF en posicion 0', names[0] === 'APRASEF');
assert('ENT: Universidad Francisco de Paula Santander Ocana en posicion 1', names[1] === 'Universidad Francisco de Paula Santander Ocana');
assert('ENT: Alcaldia Municipal de Hacari en posicion 2', names[2] === 'Alcaldia Municipal de Hacari');
assert('ENT: Asociacion de Municipios del Catatumbo en posicion 3', names[3] === 'Asociacion de Municipios del Catatumbo');
assert('ENT: Alianza Fiduciaria S.A. en posicion 4', names[4] === 'Alianza Fiduciaria S.A.');
assert('ENT: Camara de Comercio de Ocana en posicion 5', names[5] === 'Camara de Comercio de Ocana');

// Validate icon_name values are in ICON_MAP
const VALID_ICONS = ['Wheat', 'Sprout', 'Beef', 'GraduationCap', 'Leaf', 'Trees', 'Droplets', 'Sun', 'Users', 'Landmark', 'Building', 'ScrollText', 'Building2'];
const unknownIcons = (entities ?? []).filter(e => !VALID_ICONS.includes(e.icon_name));
assert('ENT: todos los icon_name tienen representacion en ICON_MAP', unknownIcons.length === 0,
  unknownIcons.length > 0 ? `iconos sin mapeo: ${unknownIcons.map(e => `${e.name}=${e.icon_name}`).join(', ')}` : '');

// Validate no inactive entities leak
const { data: inactiveEnt, error: inactErr } = await anonClient
  .from('entities')
  .select('id, active')
  .eq('active', false);
assert('ENT: no hay entidades inactivas en respuesta publica', !inactErr && (inactiveEnt?.length ?? 0) === 0,
  `inactivos encontrados: ${inactiveEnt?.length}`);

// ================================================================
// 2. Anon INSERT/UPDATE/DELETE blocked
// ================================================================
console.log('\nSeguridad RLS\n');

const { error: insErr } = await anonClient.from('entities').insert({ name: 'Anon', full_name: 'Anon SA', description: 'Test' });
assert('ENT: INSERT bloqueado para anon', insErr !== null, insErr?.message?.slice(0, 60));

const firstId = entities?.[0]?.id;
const firstOrigName = entities?.[0]?.name;
if (firstId) {
  const { error: updErr } = await anonClient.from('entities').update({ name: 'Hacked' }).eq('id', firstId).select();
  const isUpdBlocked = updErr !== null;
  // Verify name was NOT changed (RLS protection)
  const { data: entAfter } = await anonClient.from('entities').select('name').eq('id', firstId).single();
  const nameUnchanged = entAfter?.name === firstOrigName;
  assert('ENT: UPDATE bloqueado para anon', isUpdBlocked || nameUnchanged,
    `updErr=${updErr?.message?.slice(0,30)} | nameChanged=${entAfter?.name} !== ${firstOrigName}`);

  const { error: delErr } = await anonClient.from('entities').delete().eq('id', firstId).select();
  const isDelBlocked = delErr !== null;
  const { data: entExists } = await anonClient.from('entities').select('id').eq('id', firstId).single();
  assert('ENT: DELETE bloqueado para anon', isDelBlocked || entExists !== null,
    `delErr=${delErr?.message?.slice(0,30)} | deleted=${entExists === null}`);
} else {
  assert('ENT: SKIP — no hay ID para test RLS mutation', false, 'No se pudieron obtener entidades');
}

// ================================================================
// 3. getExperienceItems() via supabase-js
// ================================================================
console.log('\nExperience Items (getExperienceItems)\n');

const { data: expItems, error: expErr } = await anonClient
  .from('experience_items')
  .select('id, text, order_index, active')
  .eq('active', true)
  .order('order_index', { ascending: true });

assert('EXP: SELECT sin errores', !expErr, expErr?.message);
assert('EXP: al menos 6 registros activos', (expItems?.length ?? 0) >= 6, `count=${expItems?.length}`);
assert('EXP: todos active=true', expItems?.every(e => e.active === true) ?? false);

// Validate order_index
const sortedExp = [...(expItems ?? [])].sort((a, b) => a.order_index - b.order_index);
let expOrderOk = true;
for (let i = 0; i < (expItems?.length ?? 0); i++) {
  if (expItems[i].order_index !== sortedExp[i].order_index) { expOrderOk = false; break; }
}
assert('EXP: ordenado por order_index ASC', expOrderOk);

// Validate seed data
const texts = (expItems ?? []).map(e => e.text);
assert('EXP: seed text 0 intacto', texts[0] === 'Experiencia en proyectos agropecuarios');
assert('EXP: seed text 1 intacto', texts[1] === 'Acompanamiento tecnico especializado');
assert('EXP: seed text 2 intacto', texts[2] === 'Soluciones integrales para el campo');
assert('EXP: seed text 3 intacto', texts[3] === 'Cumplimiento y responsabilidad');
assert('EXP: seed text 4 intacto', texts[4] === 'Innovacion y tecnologia aplicada al agro');
assert('EXP: seed text 5 intacto', texts[5] === 'Compromiso con las comunidades rurales');

// ================================================================
// 4. Anon RLS for experience_items
// ================================================================
const { error: expInsErr } = await anonClient.from('experience_items').insert({ text: 'Anon test', order_index: 999 });
assert('EXP: INSERT bloqueado para anon', expInsErr !== null, expInsErr?.message?.slice(0, 60));

const firstExpId = expItems?.[0]?.id;
const firstExpOrigText = expItems?.[0]?.text;
if (firstExpId) {
  const { error: expUpdErr } = await anonClient.from('experience_items').update({ text: 'Hacked' }).eq('id', firstExpId).select();
  const isExpUpdBlocked = expUpdErr !== null;
  const { data: expAfter } = await anonClient.from('experience_items').select('text').eq('id', firstExpId).single();
  const textUnchanged = expAfter?.text === firstExpOrigText;
  assert('EXP: UPDATE bloqueado para anon', isExpUpdBlocked || textUnchanged,
    `updErr=${expUpdErr?.message?.slice(0,30)} | textChanged=${expAfter?.text} !== ${firstExpOrigText}`);

  const { error: expDelErr } = await anonClient.from('experience_items').delete().eq('id', firstExpId).select();
  const isExpDelBlocked = expDelErr !== null;
  const { data: expExists } = await anonClient.from('experience_items').select('id').eq('id', firstExpId).single();
  assert('EXP: DELETE bloqueado para anon', isExpDelBlocked || expExists !== null,
    `delErr=${expDelErr?.message?.slice(0,30)} | deleted=${expExists === null}`);
} else {
  assert('EXP: SKIP — no hay ID para test RLS mutation', false, 'No se pudieron obtener experience items');
}

// ================================================================
// 5. Icon mapping verification (simulates getEntities)
// ================================================================
console.log('\nMapeo de iconos\n');

const iconMapping = {
  'Building2': 'function', 'GraduationCap': 'function', 'Landmark': 'function',
  'Users': 'function', 'Building': 'function', 'ScrollText': 'function',
};
const iconCount = (entities ?? []).reduce((acc, e) => { acc[e.icon_name] = (acc[e.icon_name] || 0) + 1; return acc; }, {});
for (const [iconName, count] of Object.entries(iconCount)) {
  assert(`ICON: "${iconName}" usado por ${count} entidad(es)`, iconName in iconMapping, `icono desconocido: ${iconName}`);
}

// ================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`FASE A2 (Producto/Entidades/Exp): ${passed} ${String.fromCodePoint(0x2705)} | ${failed} ${String.fromCodePoint(0x274C)} | ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

process.exit(failed > 0 ? 1 : 0);
