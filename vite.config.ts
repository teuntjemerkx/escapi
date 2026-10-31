import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// EEN_BESTAND=1 (scripts/maak-artifact.mjs): alles in één script. Anders (website) worden zware delen,
// zoals de HDRI-opnames, pas geladen als een wereld ze nodig heeft.
const eenBestand = process.env.EEN_BESTAND === '1';

export default defineConfig({
  base: './',
  plugins: [react()],
  // Meerdere werelden worden tegelijk gebouwd: een fout in één wereld mag het scherm niet blokkeren.
  server: { hmr: { overlay: false } },
  build: { chunkSizeWarningLimit: 6000, assetsInlineLimit: 100000000, rollupOptions: { output: eenBestand ? { inlineDynamicImports: true } : {} } },
});
