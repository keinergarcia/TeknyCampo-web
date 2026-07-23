import sharp from 'sharp';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const QUALITY = 80;
const EXCLUDE = ['favicon.png'];

const { globSync } = await import('glob');

async function convertFile(filePath) {
  const outPath = filePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  if (EXCLUDE.some((e) => filePath.endsWith(e))) return;
  try {
    const buffer = readFileSync(filePath);
    const webp = await sharp(buffer).webp({ quality: QUALITY }).toBuffer();
    writeFileSync(outPath, webp);
    console.log(`✓ ${filePath} → ${outPath}`);
  } catch (err) {
    console.error(`✗ ${filePath}: ${err.message}`);
  }
}

const dirs = [
  join(ROOT, 'src', 'assets', 'images'),
  join(ROOT, 'public'),
];

for (const dir of dirs) {
  if (!existsSync(dir)) continue;
  const files = globSync('**/*.{png,jpg,jpeg}', { cwd: dir, dot: false });
  for (const f of files) {
    await convertFile(join(dir, f));
  }
}

console.log('Done.');
