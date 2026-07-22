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
// 1. about_sections — SELECT público
// ================================================================
console.log('\n=== about_sections ===\n');

const { data: sections, error: secErr } = await anonClient
  .from('about_sections')
  .select('id, section_key, title, content, order_index, active')
  .eq('active', true)
  .order('order_index', { ascending: true });

assert('ABOUT: SELECT sin errores', !secErr, secErr?.message?.slice(0, 60));
assert('ABOUT: 5 registros activos', (sections?.length ?? 0) === 5, `count=${sections?.length}`);
assert('ABOUT: todos active=true', sections?.every(s => s.active === true) ?? false);

// Verify order
const sorted = [...(sections ?? [])].sort((a, b) => a.order_index - b.order_index);
let orderOk = true;
for (let i = 0; i < (sections?.length ?? 0); i++) {
  if (sections[i].order_index !== sorted[i].order_index) { orderOk = false; break; }
}
assert('ABOUT: ordenado por order_index ASC', orderOk);

// Seed section keys
const keys = (sections ?? []).map(s => s.section_key);
assert('ABOUT: section_key historia OK', keys[0] === 'historia');
assert('ABOUT: section_key mision OK', keys[1] === 'mision');
assert('ABOUT: section_key vision OK', keys[2] === 'vision');
assert('ABOUT: section_key objetivos OK', keys[3] === 'objetivos');
assert('ABOUT: section_key valores OK', keys[4] === 'valores');

// Seed titles
const titles = (sections ?? []).map(s => s.title);
assert('ABOUT: title "Historia"', titles[0] === 'Historia');
assert('ABOUT: title "Mision"', titles[1] === 'Mision');
assert('ABOUT: title "Vision"', titles[2] === 'Vision');
assert('ABOUT: title "Objetivo General"', titles[3] === 'Objetivo General');
assert('ABOUT: title "Valores Corporativos"', titles[4] === 'Valores Corporativos');

// Content validation
assert('ABOUT: historia content no vacio', sections[0].content.length > 0);
assert('ABOUT: valores content con separadores', sections[4].content.includes('\n'), 'valores no tiene \\n');

// RLS — anon cannot INSERT/UPDATE/DELETE
console.log('\n--- Seguridad RLS about_sections ---\n');

const { error: insErr } = await anonClient.from('about_sections').insert({ section_key: 'test', title: 'T', content: 'C' });
assert('ABOUT: INSERT bloqueado', insErr !== null, insErr?.message?.slice(0, 60));

const firstId = sections?.[0]?.id;
if (firstId) {
  const { error: updErr } = await anonClient.from('about_sections').update({ title: 'Changed' }).eq('id', firstId).select();
  const { data: aAfter } = await anonClient.from('about_sections').select('title').eq('id', firstId).single();
  assert('ABOUT: UPDATE bloqueado', updErr !== null || aAfter?.title !== 'Changed');

  const { error: delErr } = await anonClient.from('about_sections').delete().eq('id', firstId).select();
  const { data: aExists } = await anonClient.from('about_sections').select('id').eq('id', firstId).single();
  assert('ABOUT: DELETE bloqueado', delErr !== null || aExists !== null);
} else {
  assert('ABOUT: SKIP RLS mutation tests', false, 'No hay ID');
}

// Inactive excluded
const { data: inactiveS } = await anonClient
  .from('about_sections')
  .select('id')
  .eq('active', false);
assert('ABOUT: inactivos no visibles', (inactiveS?.length ?? 0) === 0);

// ================================================================
// 2. why_choose_us — SELECT público
// ================================================================
console.log('\n=== why_choose_us ===\n');

const { data: whyItems, error: whyErr } = await anonClient
  .from('why_choose_us')
  .select('id, icon_name, title, description, order_index, active')
  .eq('active', true)
  .order('order_index', { ascending: true });

assert('WHY: SELECT sin errores', !whyErr, whyErr?.message?.slice(0, 60));
assert('WHY: 4 registros activos', (whyItems?.length ?? 0) === 4, `count=${whyItems?.length}`);
assert('WHY: todos active=true', whyItems?.every(w => w.active === true) ?? false);

// Verify order
const whySorted = [...(whyItems ?? [])].sort((a, b) => a.order_index - b.order_index);
let whyOrderOk = true;
for (let i = 0; i < (whyItems?.length ?? 0); i++) {
  if (whyItems[i].order_index !== whySorted[i].order_index) { whyOrderOk = false; break; }
}
assert('WHY: ordenado por order_index ASC', whyOrderOk);

// Seed titles and icons
const whyTitles = (whyItems ?? []).map(w => w.title);
assert('WHY: Experiencia Comprobada', whyTitles[0] === 'Experiencia Comprobada');
assert('WHY: Acompanamiento Tecnico', whyTitles[1] === 'Acompanamiento Tecnico');
assert('WHY: Soluciones Integrales', whyTitles[2] === 'Soluciones Integrales');
assert('WHY: Compromiso Rural', whyTitles[3] === 'Compromiso Rural');

const whyIcons = (whyItems ?? []).map(w => w.icon_name);
assert('WHY: icon Award', whyIcons[0] === 'Award');
assert('WHY: icon Users', whyIcons[1] === 'Users');
assert('WHY: icon TrendingUp', whyIcons[2] === 'TrendingUp');
assert('WHY: icon Heart', whyIcons[3] === 'Heart');

// Seed descriptions
assert('WHY: desc 0', whyItems[0].description === 'Proyectos ejecutados con exito');
assert('WHY: desc 1', whyItems[1].description === 'Asesoria especializada permanente');
assert('WHY: desc 2', whyItems[2].description === 'Todo para tu produccion');
assert('WHY: desc 3', whyItems[3].description === 'Pasion por el campo colombiano');

// RLS — anon cannot INSERT/UPDATE/DELETE
console.log('\n--- Seguridad RLS why_choose_us ---\n');

const { error: whyInsErr } = await anonClient.from('why_choose_us').insert({ title: 'T', description: 'D' });
assert('WHY: INSERT bloqueado', whyInsErr !== null, whyInsErr?.message?.slice(0, 60));

const whyFirstId = whyItems?.[0]?.id;
if (whyFirstId) {
  const { error: whyUpdErr } = await anonClient.from('why_choose_us').update({ title: 'Changed' }).eq('id', whyFirstId).select();
  const { data: wAfter } = await anonClient.from('why_choose_us').select('title').eq('id', whyFirstId).single();
  assert('WHY: UPDATE bloqueado', whyUpdErr !== null || wAfter?.title !== 'Changed');

  const { error: whyDelErr } = await anonClient.from('why_choose_us').delete().eq('id', whyFirstId).select();
  const { data: wExists } = await anonClient.from('why_choose_us').select('id').eq('id', whyFirstId).single();
  assert('WHY: DELETE bloqueado', whyDelErr !== null || wExists !== null);
} else {
  assert('WHY: SKIP RLS mutation tests', false, 'No hay ID');
}

// Inactive excluded
const { data: whyInactive } = await anonClient
  .from('why_choose_us')
  .select('id')
  .eq('active', false);
assert('WHY: inactivos no visibles', (whyInactive?.length ?? 0) === 0);

// ================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`FASE A6 (About): ${passed} ${String.fromCodePoint(0x2705)} | ${failed} ${String.fromCodePoint(0x274C)} | ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

process.exit(failed > 0 ? 1 : 0);
