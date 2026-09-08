import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base relativa: o build funciona em netlify.app, em subpastas e ate aberto do disco.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
});
