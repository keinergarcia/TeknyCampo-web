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
// 1. getNews() — SELECT active + published
// ================================================================
console.log('\nNews - SELECT público\n');

const { data: news, error: newsErr } = await anonClient
  .from('news')
  .select('id, title, slug, excerpt, content, category, author, image_url, featured, published_at, active, created_at')
  .eq('active', true)
  .not('published_at', 'is', null)
  .order('published_at', { ascending: false });

assert('NEWS: SELECT sin errores', !newsErr, newsErr?.message);
assert('NEWS: al menos 1 registro publicado', (news?.length ?? 0) >= 1, `count=${news?.length}`);
assert('NEWS: todos active=true', news?.every(n => n.active === true) ?? false);
assert('NEWS: ningun published_at es null', news?.every(n => n.published_at !== null) ?? false);

// Validate order
const sorted = [...(news ?? [])].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
let orderOk = true;
for (let i = 0; i < (news?.length ?? 0); i++) {
  if (news[i].id !== sorted[i].id) { orderOk = false; break; }
}
assert('NEWS: ordenado por published_at DESC', orderOk);

// Validate seed data
const titles = (news ?? []).map(n => n.title);
assert('NEWS: seed "Tekny Campo participa en proyectos de desarrollo rural en el Catatumbo" intacto',
  titles.some(t => t.includes('Catatumbo')),
  `No se encontro titulo con Catatumbo`);

// ================================================================
// 2. Drafts excluded (published_at IS NULL)
// ================================================================
console.log('\nDrafts\n');

const { data: drafts } = await anonClient
  .from('news')
  .select('id, title, published_at')
  .eq('active', true)
  .is('published_at', null);
assert('NEWS: drafts (published_at=null) no visibles al publico',
  drafts === null || drafts.length === 0,
  `drafts visibles: ${drafts?.length}`);

// ================================================================
// 3. Inactive excluded
// ================================================================
console.log('\nInactivos\n');

const { data: inactive } = await anonClient
  .from('news')
  .select('id, active')
  .eq('active', false);
const inactivePublic = (inactive ?? []).filter(i => i.active === false);
assert('NEWS: inactivos no visibles via active filter',
  inactivePublic.length === 0,
  `inactivos encontrados: ${inactivePublic.length}`);

// ================================================================
// 4. Featured field
// ================================================================
console.log('\nFeatured\n');

const { data: featuredNews } = await anonClient
  .from('news')
  .select('id, title, featured')
  .eq('active', true)
  .not('published_at', 'is', null)
  .eq('featured', true);

assert('NEWS: al menos 1 noticia destacada (featured=true)',
  (featuredNews?.length ?? 0) >= 1,
  `featured count: ${featuredNews?.length}`);

// ================================================================
// 5. RLS — Anon cannot INSERT/UPDATE/DELETE
// ================================================================
console.log('\nSeguridad RLS\n');

const { error: insErr } = await anonClient.from('news').insert({ title: 'Anon', slug: 'anon', excerpt: 'Test', content: 'Test', category: 'Test', author: 'Anon' });
assert('NEWS: INSERT bloqueado para anon', insErr !== null, insErr?.message?.slice(0, 60));

const firstId = news?.[0]?.id;
const firstOrigTitle = news?.[0]?.title;
if (firstId) {
  const { error: updErr } = await anonClient.from('news').update({ title: 'Hacked' }).eq('id', firstId).select();
  const isUpdBlocked = updErr !== null;
  const { data: nAfter } = await anonClient.from('news').select('title').eq('id', firstId).single();
  const titleUnchanged = nAfter?.title === firstOrigTitle;
  assert('NEWS: UPDATE bloqueado para anon', isUpdBlocked || titleUnchanged,
    `updErr=${updErr?.message?.slice(0,30)} | titleChanged=${nAfter?.title} !== ${firstOrigTitle}`);

  const { error: delErr } = await anonClient.from('news').delete().eq('id', firstId).select();
  const isDelBlocked = delErr !== null;
  const { data: nExists } = await anonClient.from('news').select('id').eq('id', firstId).single();
  assert('NEWS: DELETE bloqueado para anon', isDelBlocked || nExists !== null,
    `delErr=${delErr?.message?.slice(0,30)} | deleted=${nExists === null}`);
} else {
  assert('NEWS: SKIP — no hay ID para test RLS mutation', false, 'No se pudieron obtener noticias');
}

// ================================================================
// 6. Field completeness — all required fields present
// ================================================================
console.log('\nIntegridad de datos\n');

assert('NEWS: todos tienen id', news?.every(n => n.id) ?? false);
assert('NEWS: todos tienen title', news?.every(n => n.title) ?? false);
assert('NEWS: todos tienen excerpt', news?.every(n => n.excerpt) ?? false);
assert('NEWS: todos tienen content', news?.every(n => n.content) ?? false);
assert('NEWS: todos tienen category', news?.every(n => n.category) ?? false);
assert('NEWS: todos tienen author', news?.every(n => n.author) ?? false);
assert('NEWS: todos tienen published_at', news?.every(n => n.published_at) ?? false);
const hasImageOrNull = news?.every(n => n.image_url === null || typeof n.image_url === 'string') ?? false;
assert('NEWS: image_url es string o null', hasImageOrNull);

// ================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`FASE A3 (Noticias): ${passed} ${String.fromCodePoint(0x2705)} | ${failed} ${String.fromCodePoint(0x274C)} | ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

process.exit(failed > 0 ? 1 : 0);
