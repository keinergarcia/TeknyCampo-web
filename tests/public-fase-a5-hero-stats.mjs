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
// 1. getHeroStats() — SELECT active + ordered
// ================================================================
console.log('\nHero Stats - SELECT público\n');

const { data: stats, error: statsErr } = await anonClient
  .from('hero_stats')
  .select('id, value, label, active, order_index')
  .eq('active', true)
  .order('order_index', { ascending: true });

assert('STATS: SELECT sin errores', !statsErr, statsErr?.message?.slice(0, 60));
assert('STATS: 3 registros activos', (stats?.length ?? 0) === 3, `count=${stats?.length}`);
assert('STATS: todos active=true', stats?.every(s => s.active === true) ?? false);

// Validate order_index
const sorted = [...(stats ?? [])].sort((a, b) => a.order_index - b.order_index);
let orderOk = true;
for (let i = 0; i < (stats?.length ?? 0); i++) {
  if (stats[i].order_index !== sorted[i].order_index) { orderOk = false; break; }
}
assert('STATS: ordenado por order_index ASC', orderOk);

// Validate seed values
const values = (stats ?? []).map(s => s.value);
assert('STATS: 10+ en posicion 0', values[0] === '10+', `actual=${values[0]}`);
assert('STATS: 200+ en posicion 1', values[1] === '200+', `actual=${values[1]}`);
assert('STATS: 100+ en posicion 2', values[2] === '100+', `actual=${values[2]}`);

const labels = (stats ?? []).map(s => s.label);
assert('STATS: Anos de experiencia en posicion 0', labels[0] === 'Anos de experiencia');
assert('STATS: Proyectos ejecutados en posicion 1', labels[1] === 'Proyectos ejecutados');
assert('STATS: Clientes satisfechos en posicion 2', labels[2] === 'Clientes satisfechos');

// Only value and label needed publicly (not id, active, timestamps)
for (const s of stats ?? []) {
  assert(`STATS: "${s.label}" tiene value`, typeof s.value === 'string' && s.value.length > 0);
  assert(`STATS: "${s.label}" tiene label`, typeof s.label === 'string' && s.label.length > 0);
}

// ================================================================
// 2. RLS — Anon cannot INSERT/UPDATE/DELETE
// ================================================================
console.log('\nSeguridad RLS\n');

const { error: insErr } = await anonClient.from('hero_stats').insert({ value: '999+', label: 'Test' });
assert('STATS: INSERT bloqueado para anon', insErr !== null, insErr?.message?.slice(0, 60));

const firstId = stats?.[0]?.id;
if (firstId) {
  const { error: updErr } = await anonClient.from('hero_stats').update({ value: '0' }).eq('id', firstId).select();
  const { data: sAfter } = await anonClient.from('hero_stats').select('value').eq('id', firstId).single();
  assert('STATS: UPDATE bloqueado para anon', updErr !== null || sAfter?.value !== '0');

  const { error: delErr } = await anonClient.from('hero_stats').delete().eq('id', firstId).select();
  const { data: sExists } = await anonClient.from('hero_stats').select('id').eq('id', firstId).single();
  assert('STATS: DELETE bloqueado para anon', delErr !== null || sExists !== null);
} else {
  assert('STATS: SKIP RLS mutation tests', false, 'No hay ID disponible');
}

// ================================================================
// 3. Inactive excluded
// ================================================================
console.log('\nFiltro inactivos\n');

const { data: inactive } = await anonClient
  .from('hero_stats')
  .select('id, active')
  .eq('active', false);
assert('STATS: inactivos no visibles al publico', (inactive?.length ?? 0) === 0,
  `inactivos encontrados: ${inactive?.length}`);

// ================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`FASE A5 (Hero Stats): ${passed} ${String.fromCodePoint(0x2705)} | ${failed} ${String.fromCodePoint(0x274C)} | ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

process.exit(failed > 0 ? 1 : 0);
