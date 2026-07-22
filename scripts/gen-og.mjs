import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const w = 1200, h = 630;

const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#15803d" />
      <stop offset="100%" stop-color="#065f46" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)" />
  <text x="60" y="200" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="white">Tekny Campo</text>
  <text x="60" y="270" font-family="Arial, sans-serif" font-size="28" fill="#a7f3d0">Soluciones Agropecuarias</text>
  <text x="60" y="400" font-family="Arial, sans-serif" font-size="20" fill="#d1fae5">Innovaci\u00f3n y desarrollo sostenible para el campo</text>
  <line x1="60" y1="480" x2="1140" y2="480" stroke="#a7f3d0" stroke-width="2" opacity="0.3" />
  <text x="60" y="520" font-family="Arial, sans-serif" font-size="14" fill="#6ee7b7" opacity="0.7">teknycampo.com</text>
</svg>`;

sharp(Buffer.from(svg))
  .resize(w, h)
  .jpeg({ quality: 90 })
  .toFile(resolve(__dirname, '..', 'public', 'og-image.jpg'))
  .then(() => console.log('OG image created successfully'))
  .catch(e => console.error(e));
