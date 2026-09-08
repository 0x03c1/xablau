/**
 * Modos de sorteio.
 * Para criar um novo modo: adicione um item aqui e um caso em
 * components/stages/StageCanvas.jsx.
 */

export const MODES = [
  {
    id: 'gameshow',
    name: 'Game show',
    icon: '🎬',
    tagline: 'Luzes, suspense e uma revelacao exagerada.',
  },
  {
    id: 'hacker',
    name: 'Hacker',
    icon: '🖥️',
    tagline: 'Terminal, log rolando e alvo selecionado.',
  },
  {
    id: 'rocket',
    name: 'Foguete',
    icon: '🚀',
    tagline: 'Os nomes decolam ate um ser capturado.',
  },
  {
    id: 'chaos',
    name: 'Caos',
    icon: '🌀',
    tagline: 'Tudo ao mesmo tempo agora. Depois: ok, chega.',
  },
];

export const DEFAULT_MODE = 'gameshow';

export function getMode(id) {
  return MODES.find((m) => m.id === id) || MODES[0];
}
