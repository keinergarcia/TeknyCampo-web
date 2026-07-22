const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');
const DB_HOST = 'aws-0-ca-central-1.pooler.supabase.com';
const DB_PORT = 5432;
const DB_USER = 'postgres.idhlrviiekttjwsnvyda';
const DB_PASS = 'Keiner1091593201';
const DB_NAME = 'postgres';

const migrationOrder = [
  '001_extensions.sql',
  '002_admin_profiles.sql',
  '003_services.sql',
  '004_experience.sql',
  '005_news.sql',
  '006_trainings.sql',
  '007_jobs.sql',
  '008_contact.sql',
  '009_config.sql',
  '010_functions.sql',
  '011_triggers.sql',
  '012_rls.sql',
  '013_storage_policies.sql',
];

const results = [];
let client;

async function connect() {
  client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASS,
    ssl: { rejectUnauthorized: false },
    statement_timeout: 60000,
    connectionTimeoutMillis: 15000,
  });
  await client.connect();
  console.log('✅ Conectado a PostgreSQL (Supabase)');
}

async function executeMigration(fileName) {
  const filePath = path.join(MIGRATIONS_DIR, fileName);
  const sql = fs.readFileSync(filePath, 'utf-8');
  const startTime = Date.now();

  console.log(`\n▶ Ejecutando: ${fileName}`);
  console.log(`  Tamaño: ${(sql.length / 1024).toFixed(1)} KB`);

  try {
    await client.query(sql);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`  ✅ Completada en ${elapsed}s`);
    return { fileName, status: 'ok', elapsed: `${elapsed}s`, error: null };
  } catch (err) {
    console.error(`  ❌ ERROR: ${err.message}`);
    return { fileName, status: 'error', elapsed: null, error: err.message, sql: sql.substring(0, 500) };
  }
}

async function verifyObjects() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  AUDITORIA FINAL DE BASE DE DATOS');
  console.log('═══════════════════════════════════════════\n');

  const queries = {
    'Tablas': `SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT LIKE '\\_%' ORDER BY tablename`,
    'Columnas': `SELECT table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name NOT LIKE '\\_%' ORDER BY table_name, ordinal_position`,
    'Indices': `SELECT indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND tablename NOT LIKE '\\_%' ORDER BY indexname`,
    'Check Constraints': `SELECT conrelid::regclass AS table_name, conname AS constraint_name, pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE contype = 'c' AND connamespace = 'public'::regnamespace ORDER BY conname`,
    'Foreign Keys': `SELECT conrelid::regclass AS table_name, conname AS constraint_name, pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE contype = 'f' AND connamespace = 'public'::regnamespace ORDER BY conname`,
    'Funciones': `SELECT proname, prosrc FROM pg_proc WHERE pronamespace = 'public'::regnamespace AND proname NOT LIKE '\\_%' ORDER BY proname`,
    'Triggers': `SELECT trigger_name, event_manipulation, event_object_table FROM information_schema.triggers WHERE trigger_schema='public' ORDER BY trigger_name`,
    'Buckets Storage': `SELECT id, name, public FROM storage.buckets ORDER BY name`,
  };

  const audit = {};

  for (const [label, query] of Object.entries(queries)) {
    try {
      const res = await client.query(query);
      console.log(`  ${label}: ${res.rows.length} encontrados`);
      audit[label] = res.rows;
    } catch (err) {
      // Storage queries might fail if schema not accessible
      if (label === 'Buckets Storage') {
        console.log(`  ${label}: (no se pudo consultar - se verifica via API)`);
        audit[label] = [];
      } else {
        console.log(`  ❌ ${label}: ERROR - ${err.message}`);
        audit[label] = [];
      }
    }
  }

  // Seed verification
  const tablesWithSeeds = ['services', 'entities', 'experience_items', 'news', 'jobs', 'benefits', 'contact_info', 'hero_stats', 'about_sections', 'why_choose_us', 'social_links'];
  console.log('\n  --- Seeds ---');
  audit.seeds = {};
  for (const table of tablesWithSeeds) {
    try {
      const res = await client.query(`SELECT COUNT(*)::int AS count FROM "${table}"`);
      audit.seeds[table] = res.rows[0].count;
      const count = res.rows[0].count;
      const symbol = count > 0 ? '✅' : '⚠️';
      console.log(`  ${symbol} ${table}: ${count} registros`);
    } catch (err) {
      console.log(`  ❌ ${table}: ERROR - ${err.message}`);
      audit.seeds[table] = null;
    }
  }

  return audit;
}

async function main() {
  try {
    await connect();

    console.log('\n═══════════════════════════════════════════');
    console.log('  EJECUCION DE MIGRACIONES');
    console.log('═══════════════════════════════════════════\n');

    for (const file of migrationOrder) {
      if (!fs.existsSync(path.join(MIGRATIONS_DIR, file))) {
        console.log(`\n⚠ Archivo no encontrado: ${file} - saltando`);
        results.push({ fileName: file, status: 'not_found', error: 'File not found' });
        continue;
      }
      const result = await executeMigration(file);
      results.push(result);

      if (result.status === 'error') {
        console.log('\n═══════════════════════════════════════════');
        console.log('  ❌ MIGRACION FALLIDA - DETENIDO');
        console.log('═══════════════════════════════════════════');
        console.log(`  Archivo: ${result.fileName}`);
        console.log(`  Error:   ${result.error}`);
        console.log('  SQL preview:', result.sql.substring(0, 300) + '...');
        console.log('\n  No se ejecutaran las migraciones restantes.');
        console.log('  Esperando instrucciones para continuar.\n');
        process.exit(1);
      }
    }

    console.log('\n═══════════════════════════════════════════');
    console.log('  ✅ TODAS LAS MIGRACIONES COMPLETADAS');
    console.log('═══════════════════════════════════════════\n');

    // Verify all objects
    const audit = await verifyObjects();

    console.log('\n═══════════════════════════════════════════');
    console.log('  RESUMEN FINAL');
    console.log('═══════════════════════════════════════════\n');
    console.log(`  Total migraciones: ${results.length}`);
    console.log(`  Exitosas: ${results.filter(r => r.status === 'ok').length}`);
    console.log(`  Fallidas: ${results.filter(r => r.status === 'error').length}`);

    return { results, audit };

  } catch (err) {
    console.error('\n❌ Error fatal:', err.message);
    process.exit(1);
  } finally {
    if (client) await client.end();
    console.log('\n🔌 Conexion cerrada.');
  }
}

main();
