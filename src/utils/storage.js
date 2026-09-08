/**
 * Persistencia tolerante a falhas.
 * Modo anonimo, storage cheio ou bloqueado nao podem quebrar a aplicacao.
 */

const PREFIX = 'quemsera:';
let available = null;

function isAvailable() {
  if (available !== null) return available;
  try {
    const probe = `${PREFIX}__probe__`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    available = true;
  } catch {
    available = false;
  }
  return available;
}

export function loadState(key, fallback) {
  if (!isAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch {
    return fallback;
  }
}

export function saveState(key, value) {
  if (!isAvailable()) return false;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function clearState(key) {
  if (!isAvailable()) return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* silencio proposital */
  }
}

export const storageAvailable = isAvailable;
