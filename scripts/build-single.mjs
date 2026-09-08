/**
 * Gera uma versao de arquivo unico (dist-single/quem-sera.html).
 * JS, CSS e fontes ficam embutidos: da para abrir com dois cliques,
 * copiar para um pendrive e usar em qualquer computador sem internet.
 *
 * Uso: npm run build:single
 */
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync, rmSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'dist-single';
rmSync(OUT, { recursive: true, force: true });

await build({
  base: './',
  plugins: [react()],
  logLevel: 'warn',
  build: {
    outDir: `${OUT}/tmp`,
    assetsInlineLimit: 20_000_000, // fontes viram base64
    cssCodeSplit: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});

const tmp = `${OUT}/tmp`;
let html = readFileSync(join(tmp, 'index.html'), 'utf8');
const assets = readdirSync(join(tmp, 'assets'));

const js = assets.find((f) => f.endsWith('.js'));
const css = assets.find((f) => f.endsWith('.css'));

if (css) {
  const code = readFileSync(join(tmp, 'assets', css), 'utf8');
  // funcao como substituto: evita que $& do codigo seja lido como padrao
  html = html.replace(/<link[^>]+rel="stylesheet"[^>]*>/, () => `<style>${code}</style>`);
}
if (js) {
  const code = readFileSync(join(tmp, 'assets', js), 'utf8').replace(/<\/script>/g, '<\\/script>');
  html = html.replace(/<script[^>]*src="[^"]+"[^>]*><\/script>/, () => `<script type="module">${code}</script>`);
}
// favicon externo nao existe no arquivo unico
html = html.replace(/<link rel="icon"[^>]*>/, () => '');

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'quem-sera.html'), html);
rmSync(tmp, { recursive: true, force: true });

const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`Pronto: ${OUT}/quem-sera.html (${kb} kB, tudo embutido)`);
