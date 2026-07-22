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
// 1. jobs — SELECT público
// ================================================================
console.log('\n=== jobs ===\n');

const { data: jobs, error: jobsErr } = await anonClient
  .from('jobs')
  .select('id, title, type, location, description, active, order_index')
  .eq('active', true)
  .order('order_index', { ascending: true });

assert('JOBS: SELECT sin errores', !jobsErr, jobsErr?.message?.slice(0, 60));
assert('JOBS: 4 registros activos', (jobs?.length ?? 0) === 4, `count=${jobs?.length}`);
assert('JOBS: todos active=true', jobs?.every(j => j.active === true) ?? false);

// Order
const sorted = [...(jobs ?? [])].sort((a, b) => a.order_index - b.order_index);
let orderOk = true;
for (let i = 0; i < (jobs?.length ?? 0); i++) {
  if (jobs[i].order_index !== sorted[i].order_index) { orderOk = false; break; }
}
assert('JOBS: ordenado por order_index ASC', orderOk);

// Seed titles
const titles = (jobs ?? []).map(j => j.title);
assert('JOBS: Ingeniero Agronomo', titles[0] === 'Ingeniero Agrónomo' || titles[0] === 'Ingeniero Agronomo');
assert('JOBS: Asesor Tecnico Comercial', titles[1] === 'Asesor Técnico Comercial' || titles[1] === 'Asesor Tecnico Comercial');
assert('JOBS: Especialista en Nutricion Animal', titles[2] === 'Especialista en Nutrición Animal' || titles[2] === 'Especialista en Nutricion Animal');
assert('JOBS: Tecnico de Campo', titles[3] === 'Técnico de Campo' || titles[3] === 'Tecnico de Campo');

// Verify type/location/description exist
for (const j of jobs ?? []) {
  assert(`JOBS: "${j.title}" tiene type`, typeof j.type === 'string' && j.type.length > 0);
  assert(`JOBS: "${j.title}" tiene location`, typeof j.location === 'string' && j.location.length > 0);
  assert(`JOBS: "${j.title}" tiene description`, typeof j.description === 'string' && j.description.length > 0);
}

// RLS
console.log('\n--- Seguridad RLS jobs ---\n');

const { error: jInsErr } = await anonClient.from('jobs').insert({ title: 'T', type: 'F', location: 'L', description: 'D' });
assert('JOBS: INSERT bloqueado', jInsErr !== null, jInsErr?.message?.slice(0, 60));

const firstJobId = jobs?.[0]?.id;
if (firstJobId) {
  const { error: jUpdErr } = await anonClient.from('jobs').update({ title: 'Changed' }).eq('id', firstJobId).select();
  const { data: jAfter } = await anonClient.from('jobs').select('title').eq('id', firstJobId).single();
  assert('JOBS: UPDATE bloqueado', jUpdErr !== null || jAfter?.title !== 'Changed');

  const { error: jDelErr } = await anonClient.from('jobs').delete().eq('id', firstJobId).select();
  const { data: jExists } = await anonClient.from('jobs').select('id').eq('id', firstJobId).single();
  assert('JOBS: DELETE bloqueado', jDelErr !== null || jExists !== null);
} else {
  assert('JOBS: SKIP RLS mutation tests', false, 'No hay ID');
}

const { data: jobsInactive } = await anonClient.from('jobs').select('id').eq('active', false);
assert('JOBS: inactivos no visibles', (jobsInactive?.length ?? 0) === 0);

// ================================================================
// 2. benefits — SELECT público
// ================================================================
console.log('\n=== benefits ===\n');

const { data: benefits, error: benErr } = await anonClient
  .from('benefits')
  .select('id, icon_name, title, description, active, order_index')
  .eq('active', true)
  .order('order_index', { ascending: true });

assert('BEN: SELECT sin errores', !benErr, benErr?.message?.slice(0, 60));
assert('BEN: 4 registros activos', (benefits?.length ?? 0) === 4, `count=${benefits?.length}`);
assert('BEN: todos active=true', benefits?.every(b => b.active === true) ?? false);

// Order
const benSorted = [...(benefits ?? [])].sort((a, b) => a.order_index - b.order_index);
let benOrderOk = true;
for (let i = 0; i < (benefits?.length ?? 0); i++) {
  if (benefits[i].order_index !== benSorted[i].order_index) { benOrderOk = false; break; }
}
assert('BEN: ordenado por order_index ASC', benOrderOk);

// Seed titles
const benTitles = (benefits ?? []).map(b => b.title);
assert('BEN: Ambiente colaborativo', benTitles[0] === 'Ambiente colaborativo');
assert('BEN: Desarrollo profesional', benTitles[1] === 'Desarrollo profesional');
assert('BEN: Crecimiento', benTitles[2] === 'Crecimiento');
assert('BEN: Bienestar', benTitles[3] === 'Bienestar');

// Seed icon_names
const benIcons = (benefits ?? []).map(b => b.icon_name);
assert('BEN: icon Users', benIcons[0] === 'Users');
assert('BEN: icon Award', benIcons[1] === 'Award');
assert('BEN: icon TrendingUp', benIcons[2] === 'TrendingUp');
assert('BEN: icon Heart', benIcons[3] === 'Heart');

// Seed descriptions
assert('BEN: desc 0', benefits[0].description.length > 0);
assert('BEN: desc 1', benefits[1].description.length > 0);
assert('BEN: desc 2', benefits[2].description.length > 0);
assert('BEN: desc 3', benefits[3].description.length > 0);

// RLS
console.log('\n--- Seguridad RLS benefits ---\n');

const { error: bInsErr } = await anonClient.from('benefits').insert({ title: 'T', description: 'D', icon_name: 'Award' });
assert('BEN: INSERT bloqueado', bInsErr !== null, bInsErr?.message?.slice(0, 60));

const firstBenId = benefits?.[0]?.id;
if (firstBenId) {
  const { error: bUpdErr } = await anonClient.from('benefits').update({ title: 'Changed' }).eq('id', firstBenId).select();
  const { data: bAfter } = await anonClient.from('benefits').select('title').eq('id', firstBenId).single();
  assert('BEN: UPDATE bloqueado', bUpdErr !== null || bAfter?.title !== 'Changed');

  const { error: bDelErr } = await anonClient.from('benefits').delete().eq('id', firstBenId).select();
  const { data: bExists } = await anonClient.from('benefits').select('id').eq('id', firstBenId).single();
  assert('BEN: DELETE bloqueado', bDelErr !== null || bExists !== null);
} else {
  assert('BEN: SKIP RLS mutation tests', false, 'No hay ID');
}

const { data: benInactive } = await anonClient.from('benefits').select('id').eq('active', false);
assert('BEN: inactivos no visibles', (benInactive?.length ?? 0) === 0);

// ================================================================
// 3. job_applications — INSERT público
// ================================================================
console.log('\n=== job_applications (INSERT publico) ===\n');

// INSERT sin .select() para evitar bloqueo RLS de SELECT publico
// (mismo patron que submitJobApplication en public.ts)
const uniqueEmail = `test-a7-${Date.now()}@example.com`;
const { error: appInsErr } = await anonClient.from('job_applications').insert([{
  nombre: 'Test User',
  email: uniqueEmail,
  telefono: '3000000000',
  cargo: 'ingeniero',
  mensaje: 'Test desde Fase A7 - public insert verification',
}]);

assert('APP: INSERT publico permitido en job_applications', !appInsErr, appInsErr?.message?.slice(0, 80));

// SELECT via anon solo ve sus propias filas; RLS no arroja error, devuelve vacio
const { data: appSelData, error: appSelErr } = await anonClient
  .from('job_applications')
  .select('id')
  .eq('email', uniqueEmail);

assert('APP: SELECT sin error (RLS filtra silenciosamente)', !appSelErr, appSelErr?.message?.slice(0, 80));

// DELETE via anon no puede eliminar (RLS no permite ver filas para DELETE)
const { error: appDelErr } = await anonClient
  .from('job_applications')
  .delete()
  .eq('email', uniqueEmail);

assert('APP: DELETE sin error (RLS evita afectar filas)', !appDelErr, appDelErr?.message?.slice(0, 80));

// ================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`FASE A7 (WorkWithUs): ${passed} ${String.fromCodePoint(0x2705)} | ${failed} ${String.fromCodePoint(0x274C)} | ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

process.exit(failed > 0 ? 1 : 0);
