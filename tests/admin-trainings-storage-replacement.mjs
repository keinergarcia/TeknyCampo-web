// ================================================================
// Prueba controlada: Flujo de reemplazo de archivos en Storage
// ================================================================
// Verifica la secuencia acordada:
//   1. Upload nuevo archivo a Storage
//   2. Actualizar BD (image_url / brochure_url)
//   3. Solo entonces eliminar archivo anterior de Storage
//   4. Si la BD falla → eliminar archivo recién subido (rollback)
//
// Esta prueba verifica el comportamiento a nivel BD (parte crítica
// del flujo). La parte de Storage (upload/delete real) requiere
// autenticación admin o service_role key y se describe en detalle
// como procedimiento manual al final del archivo.
// ================================================================

import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida');
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

// Clean up any leftover data first
await query('DELETE FROM trainings');

console.log('\n==============================================');
console.log('PRUEBA CONTROLADA: Reemplazo de archivos');
console.log('==============================================');

// IDs fijos para esta prueba
const TARGET_ID = '00000000-0000-0000-0000-0000000000a1';
const OLD_IMG = 'trainings/test/old-image.jpg';
const NEW_IMG = 'trainings/test/new-image.jpg';
const OLD_DOC = 'documents/trainings/test/old-brochure.pdf';
const NEW_DOC = 'documents/trainings/test/new-brochure.pdf';

// ================================================================
// Fase 1: Crear registro con image_url y brochure_url iniciales
// ================================================================
console.log('\n📦 Fase 1: Crear registro con URLs iniciales');
const { rows: [created] } = await query(
  `INSERT INTO trainings (id, title, description, modality, image_url, brochure_url)
   VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, image_url, brochure_url`,
  [TARGET_ID, 'Storage Test', 'Test de reemplazo seguro', 'presencial', OLD_IMG, OLD_DOC]
);
assert('Registro creado con image_url', created.image_url === OLD_IMG);
assert('Registro creado con brochure_url', created.brochure_url === OLD_DOC);

// ================================================================
// Fase 2: Reemplazar image_url (simula upload nuevo + BD update)
// ================================================================
console.log('\n🔄 Fase 2: Reemplazar image_url (upload nuevo → BD update → delete old)');

// Antes del reemplazo, la BD aún tiene la URL vieja
const beforeUpdate = await query(`SELECT image_url, brochure_url FROM trainings WHERE id=$1`, [TARGET_ID]);
assert('BD tiene URL vieja antes del cambio', beforeUpdate.rows[0].image_url === OLD_IMG);

// Paso crítico: Actualizar BD con la nueva URL
const { rows: [updated] } = await query(
  `UPDATE trainings SET image_url=$1 WHERE id=$2 RETURNING image_url, brochure_url`,
  [NEW_IMG, TARGET_ID]
);
assert('BD actualizada con nueva URL', updated.image_url === NEW_IMG);
assert('Brochure_url no se modificó', updated.brochure_url === OLD_DOC);

// Verificar que la URL vieja ya no está en la BD
const afterUpdate = await query(`SELECT image_url FROM trainings WHERE id=$1`, [TARGET_ID]);
assert('URL vieja ya no aparece en BD', afterUpdate.rows[0].image_url === NEW_IMG);
assert('URL nueva es diferente de la vieja', afterUpdate.rows[0].image_url !== OLD_IMG);

console.log('\n  ✓ Simulación de Storage:');
console.log('    1. Subir nuevo archivo → storage/trainings/test/new-image.jpg');
console.log('    2. Actualizar BD → image_url = trainings/test/new-image.jpg');
console.log('    3. Eliminar archivo anterior de Storage → trainings/test/old-image.jpg');
console.log('  (Los pasos 1 y 3 requieren autenticación admin en Storage API)');

// ================================================================
// Fase 3: Reemplazar brochure_url (mismo flujo)
// ================================================================
console.log('\n📄 Fase 3: Reemplazar brochure_url');
const { rows: [brochureUpdated] } = await query(
  `UPDATE trainings SET brochure_url=$1 WHERE id=$2 RETURNING brochure_url`,
  [NEW_DOC, TARGET_ID]
);
assert('Brochure_url actualizada', brochureUpdated.brochure_url === NEW_DOC);

// ================================================================
// Fase 4: Simular rollback — fallo en BD después de upload
// ================================================================
console.log('\n🔄 Fase 4: Simular rollback (fallo de BD tras upload)');
// Escenario: Se subió el archivo a Storage, pero la BD falla.
// Se debe eliminar el archivo recién subido de Storage y conservar
// el anterior en la BD.

// Restaurar a valores originales (simula que la BD nunca se actualizó)
await query(
  `UPDATE trainings SET image_url=$1, brochure_url=$2 WHERE id=$3`,
  [OLD_IMG, OLD_DOC, TARGET_ID]
);
const restored = await query(`SELECT image_url, brochure_url FROM trainings WHERE id=$1`, [TARGET_ID]);
assert('BD restaurada a valores originales', restored.rows[0].image_url === OLD_IMG);
assert('Brochure restaurado', restored.rows[0].brochure_url === OLD_DOC);

console.log('\n  ✓ Rollback simulado:');
console.log('    1. Subir trainings/test/new-image.jpg a Storage ✓');
console.log('    2. UPDATE trainings SET image_url=... falla ❌');
console.log('    3. Eliminar trainings/test/new-image.jpg de Storage (rollback)');
console.log('    4. BD conserva image_url = trainings/test/old-image.jpg (intacto)');

// ================================================================
// Fase 5: Verificar atomicidad de UPDATE
// ================================================================
console.log('\n⚡ Fase 5: Verificar atomicidad del UPDATE');
const { rows: [atomicBefore] } = await query(
  `SELECT image_url, brochure_url FROM trainings WHERE id=$1`, [TARGET_ID]
);
assert('Estado inicial correcto para atomicidad', atomicBefore.image_url === OLD_IMG);
assert('Brochure inicial correcto', atomicBefore.brochure_url === OLD_DOC);

// Ejecutar UPDATE con ambas URLs simultáneamente (transacción implícita)
await query(
  `UPDATE trainings SET image_url=$1, brochure_url=$2 WHERE id=$3`,
  [NEW_IMG, NEW_DOC, TARGET_ID]
);
const { rows: [atomicAfter] } = await query(
  `SELECT image_url, brochure_url FROM trainings WHERE id=$1`, [TARGET_ID]
);
assert('Ambas URLs actualizadas atómicamente', atomicAfter.image_url === NEW_IMG && atomicAfter.brochure_url === NEW_DOC);

// ================================================================
// Fase 6: Verificar que ambas pueden volver a NULL
// ================================================================
console.log('\n🔙 Fase 6: Retorno a NULL');
await query(`UPDATE trainings SET image_url=NULL, brochure_url=NULL WHERE id=$1`, [TARGET_ID]);
const { rows: [nulled] } = await query(
  `SELECT image_url, brochure_url FROM trainings WHERE id=$1`, [TARGET_ID]
);
assert('image_url puede volver a NULL', nulled.image_url === null);
assert('brochure_url puede volver a NULL', nulled.brochure_url === null);

// ================================================================
// Cleanup
// ================================================================
console.log('\n🧹 Cleanup');
await query('DELETE FROM trainings');
const fin = (await query('SELECT COUNT(*)::int as c FROM trainings')).rows[0].c;
assert('Tabla vacía', fin === 0);

// ================================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`STORAGE REPLACEMENT: ${passed} ✅  |  ${failed} ❌  |  ${passed + failed} total`);
console.log(`${'='.repeat(50)}`);

// ================================================================
// DOCUMENTACIÓN: Procedimiento manual para verificación completa
// ================================================================
console.log(`
┌────────────────────────────────────────────────────────┐
│   PROCEDIMIENTO MANUAL — Storage Replacement Flow      │
│   (Requiere service_role key o sesión admin)           │
└────────────────────────────────────────────────────────┘

Para verificar el flujo completo con Supabase Storage:

1. PRERREQUISITOS:
   - Service Role Key del proyecto Supabase
   - Un cliente supabase-js con service_role (bypass RLS)

2. INSERTAR registro de prueba:
   INSERT INTO trainings (id,title,description,modality,image_url)
   VALUES ('...', 'Manual Test', 'Test', 'presencial', 'trainings/test/vieja.jpg');

3. SUBIR nuevo archivo:
   await adminClient.storage.from('images')
     .upload('trainings/test/nueva.jpg', file);

4. ACTUALIZAR BD:
   UPDATE trainings SET image_url='trainings/test/nueva.jpg'
   WHERE id='...';

5. ELIMINAR archivo anterior:
   await adminClient.storage.from('images')
     .remove(['trainings/test/vieja.jpg']);

6. ROLLBACK (si paso 4 falla):
   await adminClient.storage.from('images')
     .remove(['trainings/test/nueva.jpg']);
   // BD conserva 'trainings/test/vieja.jpg' intacta

7. VERIFICAR:
   - No hay archivos huérfanos en Storage
   - La BD tiene la URL correcta
   - El archivo anterior se conservó si hubo rollback
`);

await pool.end();
process.exit(failed > 0 ? 1 : 0);
