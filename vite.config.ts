import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

const BASE_PATH = (process.env.VITE_BASE_PATH || '/').replace(/\/?$/, '/');

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      includePublic: true,
      png: { quality: 80, progressive: true },
      jpg: { quality: 80, progressive: true },
      jpeg: { quality: 80, progressive: true },
      webp: { quality: 80, lossless: false },
      avif: { quality: 60 },
    }),
  ],
  base: BASE_PATH,
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
