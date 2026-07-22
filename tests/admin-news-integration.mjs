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
// 1. ANONYMOUS (via supabase-js — prueba de integración)
// ================================================================
console.log('\n👤 ANÓNIMO — vía supabase-js (integración real)\n');

const { data: news, error: selErr } = await anonClient
  .from('news').select('id, title, active, published_at').limit(10);
assert('SELECT: puede leer noticias', !selErr && news?.length >= 5, selErr?.message);

const allPublicVisible = news.every(s => s.active === true && s.published_at !== null);
assert('SELECT: solo devuelve active=true AND published_at NOT NULL', allPublicVisible);

const { data: inactiveAttempt } = await anonClient
  .from('news').select('id, active').eq('active', false).limit(5);
assert('SELECT: no puede filtrar inactivos (RLS lo ignora)', inactiveAttempt?.length === 0);

const { data: draftAttempt } = await anonClient
  .from('news').select('id, published_at').is('published_at', null).limit(5);
assert('SELECT: no puede filtrar drafts (published_at IS NULL, RLS lo ignora)', draftAttempt?.length === 0);

await assertAnonBlocked('INSERT: rechazado',
  () => anonClient.from('news').insert({
    title: 'Anon Test', slug: 'anon-test', excerpt: 'Test',
    content: 'Test content', category: 'General', author: 'Hacker',
  })
);
await assertAnonBlocked('UPDATE: rechazado',
  () => anonClient.from('news').update({ title: 'Hacked' }).eq('id', news[0].id)
);
await assertAnonBlocked('DELETE: rechazado',
  () => anonClient.from('news').delete().eq('id', news[0].id)
);

// ================================================================
// 2. ADMIN (vía pg directo — operaciones verificadas)
// ================================================================
console.log('\n👑 ADMIN — vía PostgreSQL (operaciones verificadas)\n');

const { rows: [{ is_admin }] } = await query(`SELECT is_admin()`);
assert('is_admin() función existe y es ejecutable', is_admin === false || is_admin === true);

const { rows: policies } = await query(`
  SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'news' ORDER BY policyname
`);
const insertPolicy = policies.find(p => p.policyname === 'admin_insert_news');
assert('admin_insert_news: WITH CHECK is_admin()',
  (insertPolicy?.with_check ?? '').toLowerCase().includes('is_admin'));

const updatePolicy = policies.find(p => p.policyname === 'admin_update_news');
assert('admin_update_news: USING is_admin()',
  (updatePolicy?.qual ?? '').toLowerCase().includes('is_admin'));

const deletePolicy = policies.find(p => p.policyname === 'admin_delete_news');
assert('admin_delete_news: USING is_admin()',
  (deletePolicy?.qual ?? '').toLowerCase().includes('is_admin'));

const readPolicy = policies.find(p => p.policyname === 'public_read_news');
const readQual = (readPolicy?.qual ?? '').toLowerCase();
assert('public_read_news: USING active=true AND published_at NOT NULL',
  readQual.includes('active = true') && readQual.includes('published_at') && readQual.includes('not null'));

// CRUD test with test data
console.log('\n   Prueba CRUD vía SQL\n');
const TEST_NEWS_ID = '66666666-6666-6666-6666-666666666666';
const TEST_DRAFT_ID = '77777777-7777-7777-7777-777777777777';

// CREATE
const slugInt = 'news-integration-test-' + Date.now();
const { rows: [created] } = await query(
  `INSERT INTO news (id, title, slug, excerpt, content, category, author, featured, published_at, active)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id,title`,
  [TEST_NEWS_ID, 'News Integration Test', slugInt, 'Extracto',
   'Contenido completo', 'Tecnología', 'Admin', false, '2026-06-10T12:00:00Z', true]
);
assert('INSERT: noticia creada', created.title === 'News Integration Test');

// CREATE DRAFT
const slugDraft = 'draft-test-' + Date.now();
const { rows: [draftCreated] } = await query(
  `INSERT INTO news (id, title, slug, excerpt, content, category, author, featured, published_at, active)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id,title`,
  [TEST_DRAFT_ID, 'Draft Test', slugDraft, 'Draft excerpt',
   'Draft content', 'General', 'Admin', false, null, true]
);
assert('INSERT: draft creado (published_at=NULL)', draftCreated.title === 'Draft Test');

// READ
const { rows: [read] } = await query(`SELECT * FROM news WHERE id = $1`, [TEST_NEWS_ID]);
assert('SELECT: lectura por ID', read.title === 'News Integration Test' && read.slug === slugInt);

// UPDATE
const { rows: [updated] } = await query(
  `UPDATE news SET title=$1 WHERE id=$2 RETURNING title`,
  ['News Updated', TEST_NEWS_ID]
);
assert('UPDATE: título actualizado', updated.title === 'News Updated');

// PUBLISH DRAFT (update published_at from NULL to a date)
const { rows: [published] } = await query(
  `UPDATE news SET published_at=$1 WHERE id=$2 RETURNING published_at`,
  ['2026-07-15T10:00:00Z', TEST_DRAFT_ID]
);
assert('PUBLISH DRAFT: published_at ya no es NULL', published.published_at !== null);

// TOGGLE off
await query(`UPDATE news SET active=false WHERE id=$1`, [TEST_NEWS_ID]);
const { rows: [{ active: off }] } = await query(`SELECT active FROM news WHERE id=$1`, [TEST_NEWS_ID]);
assert('TOGGLE: active=false', off === false);

// TOGGLE on
await query(`UPDATE news SET active=true WHERE id=$1`, [TEST_NEWS_ID]);
const { rows: [{ active: on }] } = await query(`SELECT active FROM news WHERE id=$1`, [TEST_NEWS_ID]);
assert('TOGGLE: active=true', on === true);

// DELETE
const { rows: [deleted] } = await query(`DELETE FROM news WHERE id=$1 RETURNING id`, [TEST_NEWS_ID]);
assert('DELETE: eliminado', deleted.id === TEST_NEWS_ID);

const { rows: aftDel } = await query(`SELECT id FROM news WHERE id=$1`, [TEST_NEWS_ID]);
assert('DELETE: verificado', aftDel.length === 0);

// ================================================================
// 3. CLEANUP & VERIFICATION
// ================================================================
console.log('\n🧹 Cleanup y verificación de seeds\n');

await query(`DELETE FROM news WHERE id IN ($1, $2)`, [TEST_NEWS_ID, TEST_DRAFT_ID]);

const { rows: seedRows } = await query(`SELECT title, slug FROM news ORDER BY published_at DESC NULLS LAST, created_at DESC`);
const st = seedRows.map(r => r.title);
assert('Seed "Tekny Campo participa en proyectos..." intacto', st.some(t => t.includes('Tekny Campo participa')));
assert('Seed "Importancia de la capacitacion tecnica..." intacto', st.some(t => t.includes('Importancia de la capacitacion')));
assert('Seed "Sistemas de riego eficiente..." intacto', st.some(t => t.includes('Sistemas de riego')));
assert('Seed "Tekny Campo y su compromiso..." intacto', st.some(t => t.includes('Tekny Campo y su compromiso')));
assert('Seed "Alianza estrategica..." intacto', st.some(t => t.includes('Alianza estrategica')));

// ================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`INTEGRACIÓN: ${passed} ✅  |  ${failed} ❌  |  ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

await pool.end();
process.exit(failed > 0 ? 1 : 0);
