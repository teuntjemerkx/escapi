import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  // Meerdere werelden worden tegelijk gebouwd: een fout in één wereld mag het scherm niet blokkeren.
  server: { hmr: { overlay: false } },
  build: { chunkSizeWarningLimit: 6000, assetsInlineLimit: 100000000, rollupOptions: { output: { inlineDynamicImports: true } } },
});
