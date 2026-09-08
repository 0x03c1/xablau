import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import { webcrypto } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const results = [];
const check = (name, condition, extra = '') => {
  results.push({ name, ok: Boolean(condition), extra });
  console.log(`${condition ? 'PASS' : 'FALHOU'}  ${name}${extra ? ` -> ${extra}` : ''}`);
};

// 1. Empacota App.jsx para CommonJS, sem CSS envolvido.
const bundle = await build({
  entryPoints: ['test/entry.jsx'],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  jsx: 'automatic',
  write: false,
  logLevel: 'error',
  define: { 'process.env.NODE_ENV': '"development"' },
});
writeFileSync('test/bundle.cjs', bundle.outputFiles[0].text);

// 2. Ambiente de navegador simulado.
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'https://quemsera.test/',
  pretendToBeVisual: true,
});
const { window } = dom;
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
Object.defineProperty(window, 'crypto', { value: webcrypto });

globalThis.window = window;
globalThis.document = window.document;
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true });
globalThis.HTMLElement = window.HTMLElement;
globalThis.HTMLInputElement = window.HTMLInputElement;
globalThis.Event = window.Event;
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Duracao curta para o teste nao demorar.
window.localStorage.setItem(
  'quemsera:settings',
  JSON.stringify({ sound: false, duration: 'rapido', suspense: true, confetti: false, jokes: true, noRepeat: false, reduceMotion: false, theme: 'neon', mode: 'gameshow' }),
);

const require = createRequire(import.meta.url);
const { mount, act } = require('./bundle.cjs');

const root = mount(window.document.getElementById('root'));
const $ = (sel) => window.document.querySelector(sel);
const $$ = (sel) => [...window.document.querySelectorAll(sel)];
const text = () => window.document.body.textContent;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const click = async (el) => {
  await act(async () => {
    el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  });
};

const type = async (input, value) => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  await act(async () => {
    setter.call(input, value);
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
  });
};

// --- Estado inicial ---------------------------------------------------------
check('A aplicacao renderiza o cabecalho', text().includes('QUEM SERÁ?'));
check('Mostra o estado vazio', text().includes('Ninguém na lista ainda'));
const drawBtn = () => $('.btn--draw');
check('Botao SORTEAR comeca desabilitado sem participantes', drawBtn().disabled);

// --- Cadastro ---------------------------------------------------------------
const input = $('#novo-participante');
for (const name of ['Ana', 'Bruno', '🚀 Grupo A']) {
  await type(input, name);
  await click($('.adder .btn--solid'));
}
check('Tres participantes cadastrados', $$('.cards .card').length === 3, `${$$('.cards .card').length} cards`);
check('Emoji separado do texto', $$('.card__label').some((el) => el.textContent === 'Grupo A'));

await type(input, 'Ana');
await click($('.adder .btn--solid'));
check('Nome repetido e recusado', $$('.cards .card').length === 3 && text().includes('já está na lista'));

// --- Colar lista ------------------------------------------------------------
await click($('.panel__tools .chip'));
const textarea = $('#lista-colada');
const setTextarea = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
await act(async () => {
  setTextarea.call(textarea, 'Carlos\n\nDaniela\n  \nAna\n42');
  textarea.dispatchEvent(new window.Event('input', { bubbles: true }));
});
await click([...$$('.modal__foot-actions .btn')].pop());
check('Lista colada ignora vazias e repetidas', $$('.cards .card').length === 6, `${$$('.cards .card').length} cards`);

// --- Sorteio ----------------------------------------------------------------
check('Botao SORTEAR habilitado com participantes', !drawBtn().disabled);
await click(drawBtn());
check('Entra em modo suspense', $('.stage').dataset.phase !== 'idle', $('.stage').dataset.phase);

await act(async () => {
  await sleep(5200);
});
const winnerEl = $('.winner__name');
check('Vencedor revelado', Boolean(winnerEl), winnerEl?.textContent);
check('Fase final e resultado', $('.stage').dataset.phase === 'result');
check('Historico registrou o vencedor', $$('.history__item').length === 1);
check(
  'Historico persistido no localStorage',
  JSON.parse(window.localStorage.getItem('quemsera:history') || '[]').length === 1,
);
check(
  'Participantes persistidos no localStorage',
  JSON.parse(window.localStorage.getItem('quemsera:participants') || '[]').length === 6,
);

// --- Nao repetir vencedores -------------------------------------------------
await act(async () => {
  window.localStorage.setItem(
    'quemsera:settings',
    JSON.stringify({ sound: false, duration: 'rapido', suspense: false, confetti: false, jokes: true, noRepeat: true, reduceMotion: true, theme: 'neon', mode: 'hacker' }),
  );
});
root.unmount();
const root2 = mount(window.document.getElementById('root'));
check('Estado recarregado do localStorage', $$('.cards .card').length === 6);
check('Contador de rodizio aparece', /1 de 6/.test(text()), $('.deck__counter')?.textContent.trim());
check('Modo hacker aplicado', $('.stage').dataset.mode === 'hacker');

const seen = new Set();
for (let i = 0; i < 5; i += 1) {
  await click(drawBtn());
  await act(async () => {
    await sleep(2600);
  });
  const name = $('.winner__name')?.textContent;
  if (name) seen.add(name);
}
check('Cinco sorteios sem repetir ninguem', seen.size === 5, [...seen].join(', '));
const allDrawn = $$('.card[data-drawn="true"]').length;
check('Todos marcados como ja sorteados', allDrawn === 6, `${allDrawn} de 6`);
check('Avisa que todo mundo participou', /Todo mundo já participou/.test(text()));
check('Botao de sorteio bloqueado no fim do rodizio', drawBtn().disabled);

await click($('.chip--bright'));
check('Reiniciar rodizio libera todo mundo', !drawBtn().disabled && $$('.card[data-drawn="true"]').length === 0);

// --- Remocao e limpeza ------------------------------------------------------
await click($('.card__remove'));
check('Remocao funciona', $$('.cards .card').length === 5);

root2.unmount();

// --- Classificacao: um lugar por vez -------------------------------------
window.localStorage.setItem(
  'quemsera:settings',
  JSON.stringify({ sound: false, format: 'ranking', duration: 'rapido', suspense: false, confetti: false, jokes: true, noRepeat: false, reduceMotion: true, theme: 'neon', mode: 'gameshow' }),
);
window.localStorage.setItem('quemsera:drawn', '[]');
window.localStorage.setItem('quemsera:ranking', '[]');
window.localStorage.setItem('quemsera:history', '[]');
const root3 = mount(window.document.getElementById('root'));
check('Botao mostra o proximo lugar a sortear', /1º lugar/.test($('.btn--draw')?.textContent || ''), $('.btn--draw')?.textContent);

for (let place = 1; place <= 5; place += 1) {
  await click(drawBtn());
  await act(async () => {
    await sleep(2600);
  });
  const rows = $$('.ranking__row');
  check(`Classificacao acumula ${place} lugar(es)`, rows.length === place, `${rows.length} linhas`);
}

const finalRows = $$('.ranking__row').map((el) => el.textContent);
check('Posicoes numeradas de 1o a 5o, sem medalhas', finalRows.every((t, i) => t.includes(`${i + 1}º`)) && !finalRows.join('').includes('🥇'));
check('Classificacao completa desabilita o botao', drawBtn().disabled);
check('Botao avisa que a classificacao terminou', /completa/i.test(drawBtn().textContent));

const lastHistory = JSON.parse(window.localStorage.getItem('quemsera:history') || '[]')[0];
check(
  'Historico guarda a classificacao inteira ao terminar',
  Array.isArray(lastHistory?.order) && lastHistory.order.length === 5,
  `${lastHistory?.order?.length} nomes`,
);
check('Historico mostra a classificacao no painel', $$('.history__ranking li').length === 5);

await click($('.chip--bright'));
check('Reiniciar classificacao limpa a lista', $$('.ranking__row').length === 0 && !drawBtn().disabled);

root3.unmount();
check('Unmount nao lanca erro', true);

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} verificacoes passaram.`);
process.exit(failed.length === 0 ? 0 : 1);
