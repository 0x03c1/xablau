import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const SITE_URL_IN_HTML = 'https://xablau.netlify.app';

/**
 * Mantem as tags Open Graph apontando para o endereco certo.
 * O index.html ja traz a URL de producao; em deploy preview do Netlify a
 * variavel DEPLOY_PRIME_URL (ou URL) tem um endereco diferente, entao trocamos.
 * Localmente da para forcar com SITE_URL=... npm run build.
 */
function socialMetaUrl() {
  const site = (process.env.SITE_URL || process.env.DEPLOY_PRIME_URL || process.env.URL || '').replace(/\/$/, '');
  return {
    name: 'social-meta-url',
    transformIndexHtml(html) {
      return site && site !== SITE_URL_IN_HTML ? html.split(SITE_URL_IN_HTML).join(site) : html;
    },
  };
}

// Base relativa: o build funciona em netlify.app, em subpastas e ate aberto do disco.
export default defineConfig({
  base: './',
  plugins: [react(), socialMetaUrl()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
});
