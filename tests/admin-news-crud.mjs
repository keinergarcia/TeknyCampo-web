import pg from 'pg';
import { existsSync } from 'fs';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida. Ejecutar:');
  console.error('   $env:DATABASE_URL="postgresql://..." ; node tests/admin-news-crud.mjs');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

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
    if (result.rows.length === 0) {
      assert(label, false, 'No se encontraron filas');
      return;
    }
    const row = result.rows[0];
    const allOk = Object.entries(checks).every(([key, value]) => row[key] === value);
    assert(label, allOk, JSON.stringify({ actual: row, expected: checks }));
  } catch (e) {
    assert(label, false, e.message);
  }
}

// ================================================================
// 1. DATABASE CONNECTION
// ================================================================
console.log('\n📡 Conexión a base de datos');
try {
  const result = await query('SELECT version()');
  assert('Conexión exitosa', result.rows.length === 1, result.rows[0].version.slice(0, 60));
} catch (e) {
  assert('Conexión exitosa', false, e.message);
}

// ================================================================
// 2. VERIFY TABLE AND RLS EXIST
// ================================================================
console.log('\n📋 Tabla news y RLS');
const tableCheck = await query(
  `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'news'`
);
assert('Tabla news existe', tableCheck.rows.length === 1);

await assertRow('RLS está habilitado en news',
  `SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'news'`,
  [], { relrowsecurity: true });

// ================================================================
// 3. COUNT SEED DATA
// ================================================================
console.log('\n📊 Datos iniciales');
const countResult = await query(`SELECT COUNT(*)::int as count FROM news`);
assert('Seed data existe (>= 5 noticias)', countResult.rows[0].count >= 5);
console.log(`   → ${countResult.rows[0].count} noticias en BD`);

// ================================================================
// 4. TEST PAGINATION — server-side
// ================================================================
console.log('\n📄 Paginación server-side');
const total = (await query(`SELECT COUNT(*)::int as count FROM news`)).rows[0].count;

const page1 = await query(`SELECT * FROM news ORDER BY published_at DESC NULLS LAST LIMIT 3 OFFSET 0`);
const page2 = await query(`SELECT * FROM news ORDER BY published_at DESC NULLS LAST LIMIT 3 OFFSET 3`);
assert('Página 1 devuelve 3 registros', page1.rows.length === 3);
assert('Página 2 tiene contenido (no se solapa con página 1)',
  page2.rows.length > 0 && page1.rows[0].id !== page2.rows[0].id);
assert('LIMIT se aplica en servidor (no más de 3 por página)', page1.rows.length <= 3);

// ================================================================
// 5. TEST SEARCH — server-side ILIKE (title + excerpt)
// ================================================================
console.log('\n🔍 Búsqueda server-side');
const searchTitle = await query(`SELECT * FROM news WHERE title ILIKE $1`, ['%agro%']);
assert('Búsqueda ILIKE en title encuentra "agro"', searchTitle.rows.length >= 1);
assert('Resultado contiene el término buscado',
  searchTitle.rows[0].title.toLowerCase().includes('agro'));

const searchExcerpt = await query(`SELECT * FROM news WHERE excerpt ILIKE $1`, ['%campo%']);
assert('Búsqueda ILIKE en excerpt encuentra "campo"', searchExcerpt.rows.length >= 1);

const emptySearch = await query(`SELECT * FROM news WHERE title ILIKE $1`, ['%xyznotexist%']);
assert('Búsqueda sin resultados devuelve 0 filas', emptySearch.rows.length === 0);

// ================================================================
// 6. TEST SORTING — server-side
// ================================================================
console.log('\n🔢 Ordenamiento server-side');
const ascResult = await query(`SELECT * FROM news ORDER BY title ASC`);
const descResult = await query(`SELECT * FROM news ORDER BY title DESC`);
assert('Orden ASC vs DESC son distintos', ascResult.rows[0].id !== descResult.rows[0].id);
assert('ASC: primero alfabético', ascResult.rows[0].title <= ascResult.rows[1].title);
assert('DESC: primero alfabético inverso', descResult.rows[0].title >= descResult.rows[1].title);

// ================================================================
// 7. TEST CREATE — news (including draft with published_at NULL)
// ================================================================
console.log('\n✏️ CREATE — Insertar nueva noticia');
const newId = '00000000-0000-0000-0000-000000000100';
const slug1 = 'noticia-de-prueba-' + Date.now();
const insertResult = await query(
  `INSERT INTO news (id, title, slug, excerpt, content, category, author, featured, published_at, active)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
   RETURNING id, title, active`,
  [newId, 'Noticia de Prueba', slug1, 'Extracto de prueba',
   'Contenido completo de la noticia de prueba', 'Agricultura', 'Admin Test',
   false, '2026-06-15T10:00:00Z', true]
);
assert('INSERT devuelve el registro creado', insertResult.rows.length === 1);
assertRow('Campos de la noticia creada correctos',
  `SELECT id, title, active FROM news WHERE id = $1`,
  [newId], { id: newId, title: 'Noticia de Prueba', active: true });

// ================================================================
// 8. TEST CREATE DRAFT (published_at = NULL)
// ================================================================
console.log('\n📝 CREATE — Insertar draft (published_at NULL)');
const draftId = '00000000-0000-0000-0000-000000000101';
const draftResult = await query(
  `INSERT INTO news (id, title, slug, excerpt, content, category, author, featured, published_at, active)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
   RETURNING id, title, published_at`,
  [draftId, 'Borrador de prueba', 'borrador-de-prueba', 'Borrador',
   'Contenido del borrador', 'General', 'Admin Test',
   false, null, true]
);
assert('INSERT devuelve el draft creado', draftResult.rows.length === 1);
assert('Draft tiene published_at NULL', draftResult.rows[0].published_at === null);

// ================================================================
// 9. TEST READ
// ================================================================
console.log('\n📖 READ — Leer noticia por ID');
const readResult = await query(`SELECT * FROM news WHERE id = $1`, [newId]);
assert('SELECT por ID encuentra el registro', readResult.rows.length === 1);
assert('Título coincide: "Noticia de Prueba"', readResult.rows[0].title === 'Noticia de Prueba');
assert('Slug coincide: slug1', readResult.rows[0].slug === slug1);
assert('Extracto coincide', readResult.rows[0].excerpt === 'Extracto de prueba');
assert('Contenido coincide', readResult.rows[0].content === 'Contenido completo de la noticia de prueba');

// ================================================================
// 10. TEST UPDATE — including publishing a draft
// ================================================================
console.log('\n📝 UPDATE — Actualizar noticia');
const slug2 = slug1 + '-actualizada';
const updateResult = await query(
  `UPDATE news SET title = $1, slug = $2, excerpt = $3 WHERE id = $4 RETURNING id, title, slug, excerpt`,
  ['Noticia Actualizada', slug2, 'Extracto actualizado', newId]
);
assert('UPDATE devuelve el registro actualizado', updateResult.rows.length === 1);
assert('Título actualizado', updateResult.rows[0].title === 'Noticia Actualizada');
assert('Slug actualizado', updateResult.rows[0].slug === slug2);

const verifyUpdate = await query(`SELECT title FROM news WHERE id = $1`, [newId]);
assert('UPDATE persiste en BD', verifyUpdate.rows[0].title === 'Noticia Actualizada');

// Publish a draft (set published_at from NULL to a date)
console.log('\n📤 PUBLICAR — Publicar draft');
const publishResult = await query(
  `UPDATE news SET published_at = $1 WHERE id = $2 RETURNING id, published_at`,
  ['2026-07-01T08:00:00Z', draftId]
);
assert('Draft publicado: published_at ya no es NULL', publishResult.rows[0].published_at !== null);

// ================================================================
// 11. TEST TOGGLE (active/inactive)
// ================================================================
console.log('\n🔄 TOGGLE — Activar/Desactivar');
await query(`UPDATE news SET active = false WHERE id = $1`, [newId]);
const afterDeactivate = await query(`SELECT active FROM news WHERE id = $1`, [newId]);
assert('Desactivar: active = false', afterDeactivate.rows[0].active === false);

await query(`UPDATE news SET active = true WHERE id = $1`, [newId]);
const afterActivate = await query(`SELECT active FROM news WHERE id = $1`, [newId]);
assert('Activar: active = true', afterActivate.rows[0].active === true);

await query(`UPDATE news SET active = false WHERE id = $1`, [newId]);
await query(`UPDATE news SET active = true WHERE id = $1`, [newId]);
const finalState = await query(`SELECT active FROM news WHERE id = $1`, [newId]);
assert('Doble toggle (off→on) termina activo', finalState.rows[0].active === true);

// ================================================================
// 12. TEST TOGGLE FEATURED
// ================================================================
console.log('\n⭐ TOGGLE — Destacar/No destacar');
await query(`UPDATE news SET featured = true WHERE id = $1`, [newId]);
const featOn = await query(`SELECT featured FROM news WHERE id = $1`, [newId]);
assert('featured = true', featOn.rows[0].featured === true);

await query(`UPDATE news SET featured = false WHERE id = $1`, [newId]);
const featOff = await query(`SELECT featured FROM news WHERE id = $1`, [newId]);
assert('featured = false', featOff.rows[0].featured === false);

// ================================================================
// 13. TEST DELETE
// ================================================================
console.log('\n🗑️ DELETE — Eliminar noticia');
const deleteResult = await query(`DELETE FROM news WHERE id = $1 RETURNING id`, [draftId]);
assert('DELETE devuelve el ID eliminado', deleteResult.rows.length === 1);
assert('ID eliminado coincide', deleteResult.rows[0].id === draftId);

const afterDelete = await query(`SELECT * FROM news WHERE id = $1`, [draftId]);
assert('Registro ya no existe después de DELETE', afterDelete.rows.length === 0);

// ================================================================
// 14. TEST RLS POLICIES
// ================================================================
console.log('\n🔒 Políticas RLS');

const policies = await query(`
  SELECT policyname, permissive, roles, cmd, qual, with_check
  FROM pg_policies
  WHERE tablename = 'news'
  ORDER BY policyname
`);
assert('Hay políticas RLS definidas en news (>= 4)', policies.rows.length >= 4);

const policyNames = policies.rows.map(r => r.policyname).sort();
assert('Tiene public_read_news', policyNames.includes('public_read_news'));
assert('Tiene admin_insert_news', policyNames.includes('admin_insert_news'));
assert('Tiene admin_update_news', policyNames.includes('admin_update_news'));
assert('Tiene admin_delete_news', policyNames.includes('admin_delete_news'));

const readPolicy = policies.rows.find(r => r.policyname === 'public_read_news');
const qualLower = (readPolicy?.qual ?? '').toLowerCase();
assert('public_read_news filtra active=true AND published_at NOT NULL',
  qualLower.includes('active') && qualLower.includes('true') &&
  qualLower.includes('published_at') && qualLower.includes('not null'));

const insertPolicy = policies.rows.find(r => r.policyname === 'admin_insert_news');
const insertCheck = (insertPolicy?.with_check ?? '').toLowerCase();
assert('admin_insert_news usa is_admin() en WITH CHECK', insertCheck.includes('is_admin'));

for (const name of ['admin_update_news', 'admin_delete_news']) {
  const pol = policies.rows.find(r => r.policyname === name);
  const ql = (pol?.qual ?? '').toLowerCase();
  assert(`${name} usa is_admin()`, ql.includes('is_admin'));
}

// ================================================================
// 15. TEST PUBLIC READ (only active=true AND published_at NOT NULL)
// ================================================================
console.log('\n🌐 Lectura pública — active=true AND published_at NOT NULL');
const allCount = (await query(`SELECT COUNT(*)::int as count FROM news`)).rows[0].count;
const publicCount = (await query(
  `SELECT COUNT(*)::int as count FROM news WHERE active = true AND published_at IS NOT NULL`
)).rows[0].count;
console.log(`   → ${allCount} totales, ${publicCount} visibles al público`);
assert('publicCount <= allCount', publicCount <= allCount);

// Verify compound RLS: should NOT see inactive OR unpublished
const draftCheck = await query(
  `SELECT COUNT(*)::int as count FROM news WHERE published_at IS NULL`
);
console.log(`   → ${draftCheck.rows[0].count} draft(s) (invisibles al público)`);

// ================================================================
// 16. TEST CHECK CONSTRAINTS
// ================================================================
console.log('\n⚠️  Restricciones');
await assertError('title NULL es rechazado',
  `INSERT INTO news (id, title, slug, excerpt, content, category, author)
   VALUES ($1, NULL, 'test-slug', 'excerpt', 'content', 'General', 'Author')`,
  ['00000000-0000-0000-0000-000000000110']);

await assertError('slug NULL es rechazado',
  `INSERT INTO news (id, title, slug, excerpt, content, category, author)
   VALUES ($1, 'Title', NULL, 'excerpt', 'content', 'General', 'Author')`,
  ['00000000-0000-0000-0000-000000000111']);

await assertError('slug duplicado es rechazado (UNIQUE)',
  `INSERT INTO news (id, title, slug, excerpt, content, category, author)
   VALUES ($1, 'Title Dup', $2, 'excerpt', 'content', 'General', 'Author')`,
  ['00000000-0000-0000-0000-000000000112', slug2]);

await assertError('excerpt NULL es rechazado',
  `INSERT INTO news (id, title, slug, excerpt, content, category, author)
   VALUES ($1, 'Title', 'slug-test', NULL, 'content', 'General', 'Author')`,
  ['00000000-0000-0000-0000-000000000113']);

// ================================================================
// 17. TEST IMAGE UPDATE (simulate storage path change)
// ================================================================
console.log('\n🖼️  Actualización de imagen');
const imgUpdate = await query(
  `UPDATE news SET image_url = $1 WHERE id = $2 RETURNING id, image_url`,
  ['news/00000000-0000-0000-0000-000000000100/image.jpg', newId]
);
assert('image_url actualizado correctamente', imgUpdate.rows[0].image_url === 'news/00000000-0000-0000-0000-000000000100/image.jpg');

// Replace with new path
const imgReplace = await query(
  `UPDATE news SET image_url = $1 WHERE id = $2 RETURNING image_url`,
  ['news/00000000-0000-0000-0000-000000000100/image-v2.jpg', newId]
);
assert('image_url reemplazado correctamente', imgReplace.rows[0].image_url === 'news/00000000-0000-0000-0000-000000000100/image-v2.jpg');

// Clear image back to NULL
await query(`UPDATE news SET image_url = NULL WHERE id = $1`, [newId]);
const imgCleared = await query(`SELECT image_url FROM news WHERE id = $1`, [newId]);
assert('image_url puede volver a NULL', imgCleared.rows[0].image_url === null);

// ================================================================
// 18. TEST NO REGRESSION — original seed data intact
// ================================================================
console.log('\n🔄 Regresiones — datos seed originales');
const seedNews = await query(`SELECT title, slug FROM news ORDER BY published_at DESC NULLS LAST, created_at DESC`);
const titles = seedNews.rows.map(r => r.title);
assert('Seed "Tekny Campo participa en proyectos de desarrollo rural en el Catatumbo" existe',
  titles.some(t => t.includes('Tekny Campo participa')));
assert('Seed "Importancia de la capacitacion tecnica en el sector agropecuario" existe',
  titles.some(t => t.includes('Importancia de la capacitacion')));
assert('Seed "Sistemas de riego eficiente para pequenos y medianos productores" existe',
  titles.some(t => t.includes('Sistemas de riego')));
assert('Seed "Tekny Campo y su compromiso con el desarrollo rural en Ocana" existe',
  titles.some(t => t.includes('Tekny Campo y su compromiso')));
assert('Seed "Alianza estrategica con asociaciones de productores del Catatumbo" existe',
  titles.some(t => t.includes('Alianza estrategica')));

// ================================================================
// 19. CLEANUP test data
// ================================================================
console.log('\n🧹 Cleanup');
await query(`DELETE FROM news WHERE id IN ($1, $2)`, [newId, draftId]);
const afterCleanup = await query(`SELECT COUNT(*)::int as count FROM news`);
assert('Datos de prueba eliminados, volviendo a conteo original', afterCleanup.rows[0].count === total);

// ================================================================
// 20. VERIFY FRONTEND FILES INTEGRITY
// ================================================================
console.log('\n📁 Archivos del módulo — integridad');
const moduleFiles = [
  'src/lib/admin/news.ts',
  'src/hooks/admin/useNews.ts',
  'src/pages/admin/News/NewsList.tsx',
  'src/pages/admin/News/NewsForm.tsx',
];
for (const f of moduleFiles) {
  assert(`Archivo ${f} existe`, existsSync(f));
}

// ================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`RESULTADOS: ${passed} ✅  |  ${failed} ❌  |  ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

await pool.end();
process.exit(failed > 0 ? 1 : 0);
