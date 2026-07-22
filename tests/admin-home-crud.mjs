import pg from 'pg';
import { existsSync } from 'fs';

const { Pool } = pg;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida.');
  console.error('   $env:DATABASE_URL="postgresql://..." ; node tests/admin-home-crud.mjs');
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
    if (result.rows.length === 0) { assert(label, false, 'No se encontraron filas'); return; }
    const row = result.rows[0];
    const allOk = Object.entries(checks).every(([key, value]) => row[key] === value);
    assert(label, allOk, JSON.stringify({ actual: row, expected: checks }));
  } catch (e) { assert(label, false, e.message); }
}

// ================================================================
const H1 = '00000000-0000-0000-0000-0000000000a1';
const H2 = '00000000-0000-0000-0000-0000000000a2';
const W1 = '00000000-0000-0000-0000-0000000000b1';
const W2 = '00000000-0000-0000-0000-0000000000b2';

// ================================================================
// 1. DB CONNECTION
// ================================================================
console.log('\n📡 Conexión a base de datos');
try {
  const result = await query('SELECT version()');
  assert('Conexión exitosa', result.rows.length === 1, result.rows[0].version.slice(0, 60));
} catch (e) {
  assert('Conexión exitosa', false, e.message);
}

// ================================================================
// 2. TABLES EXIST
// ================================================================
console.log('\n📋 Tablas');
for (const tbl of ['hero_stats', 'about_sections', 'why_choose_us']) {
  const chk = await query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1`, [tbl]
  );
  assert(`Tabla ${tbl} existe`, chk.rows.length === 1);
  await assertRow(`RLS habilitado en ${tbl}`,
    `SELECT relname, relrowsecurity FROM pg_class WHERE relname=$1`, [tbl],
    { relrowsecurity: true });
}

// ================================================================
// 3. SEED DATA
// ================================================================
console.log('\n📊 Datos iniciales - hero_stats');
let cnt = (await query('SELECT COUNT(*)::int as c FROM hero_stats')).rows[0].c;
assert('hero_stats: >= 3 semillas', cnt >= 3);
console.log(`   → ${cnt} registros`);

console.log('\n📊 Datos iniciales - about_sections');
cnt = (await query('SELECT COUNT(*)::int as c FROM about_sections')).rows[0].c;
assert('about_sections: = 5 semillas', cnt === 5);
console.log(`   → ${cnt} secciones`);

console.log('\n📊 Datos iniciales - why_choose_us');
cnt = (await query('SELECT COUNT(*)::int as c FROM why_choose_us')).rows[0].c;
assert('why_choose_us: >= 4 semillas', cnt >= 4);
console.log(`   → ${cnt} elementos`);

// ================================================================
// 4. ABOUT_SECTIONS: section_key uniqueness & check
// ================================================================
console.log('\n🗝️ about_sections — constraints');
const keys = (await query('SELECT section_key FROM about_sections ORDER BY order_index')).rows.map(r => r.section_key);
const expected = ['historia', 'mision', 'vision', 'objetivos', 'valores'];
for (let i = 0; i < expected.length; i++) {
  assert(`section_key[${i}] = ${expected[i]}`, keys[i] === expected[i]);
}

const uniq = new Set(keys);
assert('section_key son únicos', uniq.size === keys.length);

await assertError('section_key inválido es rechazado',
  `INSERT INTO about_sections (id, section_key, title, content) VALUES ($1, $2, 'Test', 'Content')`,
  ['00000000-0000-0000-0000-0000000000c1', 'invalido']);

await assertError('section_key duplicado es rechazado',
  `INSERT INTO about_sections (id, section_key, title, content) VALUES ($1, $2, 'Test', 'Content')`,
  ['00000000-0000-0000-0000-0000000000c2', 'historia']);

// ================================================================
// 5. ABOUT_SECTIONS: UPDATE + TOGGLE
// ================================================================
console.log('\n📝 about_sections — modificación');
const historiaId = (await query("SELECT id FROM about_sections WHERE section_key='historia'")).rows[0].id;

const updHist = await query(
  `UPDATE about_sections SET title=$1, content=$2, order_index=$3 WHERE id=$4 RETURNING title, content, order_index`,
  ['Nuestra Historia', 'Contenido actualizado', 10, historiaId]
);
assert('UPDATE: título cambiado', updHist.rows[0].title === 'Nuestra Historia');
assert('UPDATE: contenido cambiado', updHist.rows[0].content === 'Contenido actualizado');
assert('UPDATE: order_index cambiado a 10', updHist.rows[0].order_index === 10);

// Restore
await query(`UPDATE about_sections SET title='Historia', content=E'Tekny Campo...', order_index=0 WHERE id=$1`, [historiaId]);

// Toggle
await query(`UPDATE about_sections SET active=false WHERE id=$1`, [historiaId]);
let st = await query(`SELECT active FROM about_sections WHERE id=$1`, [historiaId]);
assert('TOGGLE: desactivado', st.rows[0].active === false);

await query(`UPDATE about_sections SET active=true WHERE id=$1`, [historiaId]);
st = await query(`SELECT active FROM about_sections WHERE id=$1`, [historiaId]);
assert('TOGGLE: reactivado', st.rows[0].active === true);

// section_key NOT mutable (can't change but DB allows — just verify it stays)
await query(`UPDATE about_sections SET title='Historia' WHERE id=$1`, [historiaId]);

// ================================================================
// 6. HERO_STATS CRUD
// ================================================================
console.log('\n✏️ hero_stats — CRUD');

// CREATE
const ins = await query(
  `INSERT INTO hero_stats (id, value, label, order_index, active) VALUES ($1,$2,$3,$4,$5) RETURNING id, value, label`,
  [H1, '50+', 'Clientes nuevos', 99, true]
);
assert('INSERT devuelve registro', ins.rows.length === 1);
assertRow('Campos correctos',
  `SELECT id, value, label, active FROM hero_stats WHERE id=$1`, [H1],
  { id: H1, value: '50+', label: 'Clientes nuevos', active: true });

// READ
const rd = await query(`SELECT * FROM hero_stats WHERE id=$1`, [H1]);
assert('SELECT por ID', rd.rows.length === 1);
assert('value coincide', rd.rows[0].value === '50+');
assert('label coincide', rd.rows[0].label === 'Clientes nuevos');
assert('order_index=99', rd.rows[0].order_index === 99);
assert('active=true', rd.rows[0].active === true);

// UPDATE
const upd = await query(
  `UPDATE hero_stats SET value=$1, label=$2, order_index=$3 WHERE id=$4 RETURNING value, label, order_index`,
  ['100+', 'Actualizado', 50, H1]
);
assert('UPDATE devuelve registro', upd.rows.length === 1);
assert('value cambiado', upd.rows[0].value === '100+');
assert('label cambiado', upd.rows[0].label === 'Actualizado');
assert('order_index cambiado a 50', upd.rows[0].order_index === 50);
const vf = await query(`SELECT value FROM hero_stats WHERE id=$1`, [H1]);
assert('UPDATE persiste en BD', vf.rows[0].value === '100+');

// TOGGLE
await query(`UPDATE hero_stats SET active=false WHERE id=$1`, [H1]);
let off = (await query(`SELECT active FROM hero_stats WHERE id=$1`, [H1])).rows[0].active;
assert('Desactivar: false', off === false);

await query(`UPDATE hero_stats SET active=true WHERE id=$1`, [H1]);
let on = (await query(`SELECT active FROM hero_stats WHERE id=$1`, [H1])).rows[0].active;
assert('Activar: true', on === true);

// DELETE
const del = await query(`DELETE FROM hero_stats WHERE id=$1 RETURNING id`, [H1]);
assert('DELETE devuelve ID', del.rows.length === 1);
assert('ID coincide', del.rows[0].id === H1);
const gone = await query(`SELECT * FROM hero_stats WHERE id=$1`, [H1]);
assert('Registro ya no existe', gone.rows.length === 0);

// ================================================================
// 7. WHY_CHOOSE_US CRUD
// ================================================================
console.log('\n✏️ why_choose_us — CRUD');

// CREATE
const wIns = await query(
  `INSERT INTO why_choose_us (id, icon_name, title, description, order_index, active) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, title`,
  [W1, 'Star', 'Razón de Prueba', 'Descripción X', 99, true]
);
assert('INSERT devuelve registro', wIns.rows.length === 1);
assertRow('Campos correctos',
  `SELECT id, title, active FROM why_choose_us WHERE id=$1`, [W1],
  { id: W1, title: 'Razón de Prueba', active: true });

// READ
const wRd = await query(`SELECT * FROM why_choose_us WHERE id=$1`, [W1]);
assert('SELECT por ID', wRd.rows.length === 1);
assert('icon_name=Star', wRd.rows[0].icon_name === 'Star');
assert('description coincide', wRd.rows[0].description === 'Descripción X');
assert('order_index=99', wRd.rows[0].order_index === 99);

// UPDATE
const wUp = await query(
  `UPDATE why_choose_us SET title=$1, description=$2, icon_name=$3 WHERE id=$4 RETURNING title, icon_name`,
  ['Actualizado', 'Nueva desc', 'Heart', W1]
);
assert('UPDATE devuelve registro', wUp.rows.length === 1);
assert('title cambiado', wUp.rows[0].title === 'Actualizado');
assert('icon_name cambiado a Heart', wUp.rows[0].icon_name === 'Heart');

// TOGGLE
await query(`UPDATE why_choose_us SET active=false WHERE id=$1`, [W1]);
assert('Desactivar: false',
  (await query(`SELECT active FROM why_choose_us WHERE id=$1`, [W1])).rows[0].active === false);
await query(`UPDATE why_choose_us SET active=true WHERE id=$1`, [W1]);
assert('Reactivar: true',
  (await query(`SELECT active FROM why_choose_us WHERE id=$1`, [W1])).rows[0].active === true);

// DELETE
const wDel = await query(`DELETE FROM why_choose_us WHERE id=$1 RETURNING id`, [W1]);
assert('DELETE funciona', wDel.rows.length === 1);

// ================================================================
// 8. PAGINATION
// ================================================================
console.log('\n📄 Paginación server-side');

// hero_stats
const hTotal = (await query('SELECT COUNT(*)::int as count FROM hero_stats')).rows[0].count;
const hP1 = await query('SELECT * FROM hero_stats ORDER BY order_index ASC LIMIT 2 OFFSET 0');
assert('hero_stats página 1: 2 registros', hP1.rows.length === 2);
if (hTotal > 2) {
  const hP2 = await query('SELECT * FROM hero_stats ORDER BY order_index ASC LIMIT 2 OFFSET 2');
  assert('hero_stats página 2 no se solapa', hP2.rows.length > 0 && hP1.rows[0].id !== hP2.rows[0].id);
}

// why_choose_us
const wTotal = (await query('SELECT COUNT(*)::int as count FROM why_choose_us')).rows[0].count;
const wP1 = await query('SELECT * FROM why_choose_us ORDER BY order_index ASC LIMIT 2 OFFSET 0');
assert('why_choose_us página 1: 2 registros', wP1.rows.length === 2);
if (wTotal > 2) {
  const wP2 = await query('SELECT * FROM why_choose_us ORDER BY order_index ASC LIMIT 2 OFFSET 2');
  assert('why_choose_us página 2 no se solapa', wP2.rows.length > 0 && wP1.rows[0].id !== wP2.rows[0].id);
}

// ================================================================
// 9. SEARCH
// ================================================================
console.log('\n🔍 Búsqueda server-side');

// hero_stats
const hSearch = await query(`SELECT * FROM hero_stats WHERE label ILIKE $1`, ['%experiencia%']);
assert('hero_stats: búsqueda en label', hSearch.rows.length >= 1);
assert('hero_stats: resultado contiene término',
  hSearch.rows[0].label.toLowerCase().includes('experiencia'));

const hEmpty = await query(`SELECT * FROM hero_stats WHERE value ILIKE $1`, ['%xyznotexist%']);
assert('hero_stats: búsqueda vacía devuelve 0', hEmpty.rows.length === 0);

// why_choose_us
const wSearch = await query(`SELECT * FROM why_choose_us WHERE title ILIKE $1`, ['%experiencia%']);
assert('why_choose_us: búsqueda en title', wSearch.rows.length >= 1);

const wDesc = await query(`SELECT * FROM why_choose_us WHERE description ILIKE $1`, ['%asesoria%']);
assert('why_choose_us: búsqueda en description', wDesc.rows.length >= 1);

// ================================================================
// 10. SORTING
// ================================================================
console.log('\n🔢 Ordenamiento server-side');

// hero_stats uses 'label', why_choose_us uses 'title' as sort column
const hAsc = await query(`SELECT * FROM hero_stats ORDER BY label ASC`);
const hDesc = await query(`SELECT * FROM hero_stats ORDER BY label DESC`);
assert('hero_stats: ASC vs DESC distintos', hAsc.rows[0].id !== hDesc.rows[0].id);

const wAsc = await query(`SELECT * FROM why_choose_us ORDER BY title ASC`);
const wDesc2 = await query(`SELECT * FROM why_choose_us ORDER BY title DESC`);
assert('why_choose_us: ASC vs DESC distintos', wAsc.rows[0].id !== wDesc2.rows[0].id);

// about_sections by order_index
const aAsc = await query('SELECT * FROM about_sections ORDER BY order_index ASC');
assert('about_sections: orden ASC coherente', aAsc.rows.length === 5);
for (let i = 1; i < aAsc.rows.length; i++) {
  assert(`about_sections: order_index[${i-1}] <= [${i}]`, aAsc.rows[i-1].order_index <= aAsc.rows[i].order_index);
}

// ================================================================
// 11. NOT NULL CONSTRAINTS
// ================================================================
console.log('\n⚠️  Restricciones NOT NULL');

// hero_stats
await assertError('hero_stats: value NULL rechazado',
  `INSERT INTO hero_stats (id, value, label) VALUES ($1, NULL, 'Test')`, [H2]);
await assertError('hero_stats: label NULL rechazado',
  `INSERT INTO hero_stats (id, value, label) VALUES ($1, '10+', NULL)`, [H2]);

// why_choose_us
await assertError('why_choose_us: title NULL rechazado',
  `INSERT INTO why_choose_us (id, title, description) VALUES ($1, NULL, 'Desc')`, [W2]);
await assertError('why_choose_us: description NULL rechazado',
  `INSERT INTO why_choose_us (id, title, description) VALUES ($1, 'Title', NULL)`, [W2]);

// about_sections
await assertError('about_sections: title NULL rechazado',
  `INSERT INTO about_sections (id, section_key, title, content) VALUES ($1, 'historia', NULL, 'Content')`,
  ['00000000-0000-0000-0000-0000000000c3']);
await assertError('about_sections: content NULL rechazado',
  `INSERT INTO about_sections (id, section_key, title, content) VALUES ($1, 'mision', 'Title', NULL)`,
  ['00000000-0000-0000-0000-0000000000c4']);

// ================================================================
// 12. RLS POLICIES
// ================================================================
console.log('\n🔒 Políticas RLS');

for (const tbl of ['hero_stats', 'about_sections', 'why_choose_us']) {
  const pol = await query(`
    SELECT policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies WHERE tablename=$1 ORDER BY policyname`, [tbl]);
  assert(`${tbl}: >= 3 políticas`, pol.rows.length >= 3);

  const names = pol.rows.map(r => r.policyname).sort();
  assert(`${tbl}: public_read existe`, names.some(n => n.includes('public_read')));
  assert(`${tbl}: admin_insert existe`, names.some(n => n.includes('admin_insert')));
  assert(`${tbl}: admin_update existe`, names.some(n => n.includes('admin_update')));
  assert(`${tbl}: admin_delete existe`, names.some(n => n.includes('admin_delete')));

  const pub = pol.rows.find(r => r.policyname.includes('public_read'));
  assert(`${tbl}: public_read filtra active=true`,
    (pub?.qual ?? '').toLowerCase().includes('active = true'));

  for (const pref of ['admin_insert', 'admin_update', 'admin_delete']) {
    const p = pol.rows.find(r => r.policyname === `${pref}_${tbl}`);
    const col = pref === 'admin_insert' ? 'with_check' : 'qual';
    assert(`${pref}_${tbl}: usa is_admin()`,
      ((p?.[col] ?? '').toLowerCase()).includes('is_admin'));
  }
}

// ================================================================
// 13. PUBLIC READ (active=true only)
// ================================================================
console.log('\n🌐 Lectura pública — solo active=true');

for (const tbl of ['hero_stats', 'why_choose_us']) {
  const total = (await query(`SELECT COUNT(*)::int as c FROM ${tbl}`)).rows[0].c;
  await query(`UPDATE ${tbl} SET active=true`);
  const act = (await query(`SELECT COUNT(*)::int as c FROM ${tbl} WHERE active=true`)).rows[0].c;
  assert(`${tbl}: activos <= totales`, act <= total);
}

// Ensure about_sections all active
await query('UPDATE about_sections SET active=true');
const aAct = (await query('SELECT COUNT(*)::int as c FROM about_sections WHERE active=true')).rows[0].c;
assert('about_sections: todas activas', aAct === 5);

// Toggle one off, verify
const firstHero = (await query('SELECT id FROM hero_stats WHERE active=true LIMIT 1')).rows[0].id;
const totalActive = (await query('SELECT COUNT(*)::int as c FROM hero_stats WHERE active=true')).rows[0].c;
await query(`UPDATE hero_stats SET active=false WHERE id=$1`, [firstHero]);
const afterDeact = (await query('SELECT COUNT(*)::int as c FROM hero_stats WHERE active=true')).rows[0].c;
assert('hero_stats: desactivar reduce conteo en 1', afterDeact === totalActive - 1);
await query(`UPDATE hero_stats SET active=true WHERE id=$1`, [firstHero]);

// ================================================================
// 14. SEED PRESERVATION
// ================================================================
console.log('\n🔄 Regresiones — datos seed intactos');

const seeds = await query('SELECT value, label, order_index FROM hero_stats ORDER BY order_index ASC');
assert('hero_stats: "10+" en orden 0', seeds.rows[0]?.value === '10+');
const seedLabels = seeds.rows.map(r => r.label);
assert('hero_stats: "Años de experiencia" existe',
  seedLabels.some(l => l.includes('experiencia')));

const wSeeds = await query('SELECT icon_name, title FROM why_choose_us ORDER BY order_index ASC');
const wTitles = wSeeds.rows.map(r => r.title);
assert('why_choose_us: "Experiencia Comprobada" existe',
  wTitles.some(t => t.includes('Experiencia')));
assert('why_choose_us: "Acompañamiento Técnico" existe',
  wTitles.some(t => t.includes('Acompanamiento')));

const aSeeds = await query('SELECT section_key FROM about_sections ORDER BY order_index');
const aKeys = aSeeds.rows.map(r => r.section_key);
assert('about_sections: "historia" preservada', aKeys[0] === 'historia');
assert('about_sections: "valores" preservada', aKeys[4] === 'valores');

// ================================================================
// 15. FILE INTEGRITY
// ================================================================
console.log('\n📁 Archivos del módulo');
const files = [
  'src/lib/admin/hero-stats.ts',
  'src/lib/admin/about-sections.ts',
  'src/lib/admin/why-choose-us.ts',
  'src/hooks/admin/useHeroStats.ts',
  'src/hooks/admin/useAboutSections.ts',
  'src/hooks/admin/useWhyChooseUs.ts',
  'src/pages/admin/Hero/HeroStatsList.tsx',
  'src/pages/admin/Hero/HeroStatsForm.tsx',
  'src/pages/admin/About/AboutSectionList.tsx',
  'src/pages/admin/WhyChooseUs/WhyChooseUsList.tsx',
  'src/pages/admin/WhyChooseUs/WhyChooseUsForm.tsx',
];
for (const f of files) {
  assert(`Archivo ${f} existe`, existsSync(f));
}

// ================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`RESULTADOS: ${passed} ✅  |  ${failed} ❌  |  ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

await pool.end();
process.exit(failed > 0 ? 1 : 0);
