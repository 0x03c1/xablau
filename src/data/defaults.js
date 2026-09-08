import { DEFAULT_MODE } from './modes.js';
import { DEFAULT_THEME } from './themes.js';

export const STORAGE_KEYS = {
  participants: 'participants',
  history: 'history',
  settings: 'settings',
  drawn: 'drawn',
  drawCount: 'drawCount',
};

export const DEFAULT_SETTINGS = {
  sound: true,
  format: 'single', // single (um vencedor) | ranking (classificacao completa)
  duration: 'normal', // rapido | normal | epico
  suspense: true,
  confetti: true,
  jokes: true,
  noRepeat: false,
  reduceMotion: false,
  theme: DEFAULT_THEME,
  mode: DEFAULT_MODE,
};

export const DURATIONS = {
  rapido: { label: 'Rapido', prepare: 600, reel: 3200, hush: 450 },
  normal: { label: 'Normal', prepare: 900, reel: 6200, hush: 700 },
  epico: { label: 'Epico', prepare: 1300, reel: 10500, hush: 1000 },
};

export const SAMPLE_PARTICIPANTS = [
  'Ana',
  'Bruno',
  'Carlos',
  'Daniela',
  '👨‍💻 Lucas',
  '🚀 Grupo A',
  '42',
];
