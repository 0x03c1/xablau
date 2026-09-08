/**
 * Sorteio justo.
 *
 * getSecureRandomIndex usa crypto.getRandomValues com rejeicao de amostra,
 * o que elimina o vies do "modulo simples" (Math.random() % n) e mantem a
 * mesma probabilidade para todos os participantes.
 */

const MAX_UINT32 = 0xffffffff;

function cryptoObject() {
  return typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues
    ? globalThis.crypto
    : null;
}

export function getSecureRandomIndex(length) {
  const n = Math.floor(length);
  if (!Number.isFinite(n) || n <= 0) {
    throw new RangeError('getSecureRandomIndex precisa de um tamanho maior que zero.');
  }
  if (n === 1) return 0;

  const c = cryptoObject();
  if (!c) {
    // Navegador muito antigo ou contexto sem crypto: ainda sorteia, sem o mesmo rigor.
    return Math.floor(Math.random() * n);
  }

  // Maior multiplo de n que cabe no intervalo: valores acima disso sao descartados.
  const limit = Math.floor((MAX_UINT32 + 1) / n) * n;
  const buffer = new Uint32Array(1);
  let value;
  do {
    c.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);

  return value % n;
}

export function pickRandom(list) {
  if (!Array.isArray(list) || list.length === 0) return undefined;
  return list[getSecureRandomIndex(list.length)];
}

/** Fisher-Yates com indices seguros. Devolve um novo array. */
export function secureShuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = getSecureRandomIndex(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Sorteia um item diferente do atual, quando houver mais de uma opcao. */
export function pickDifferent(list, currentId) {
  if (!list || list.length === 0) return undefined;
  if (list.length === 1) return list[0];
  let candidate = pickRandom(list);
  let guard = 0;
  while (candidate && candidate.id === currentId && guard < 8) {
    candidate = pickRandom(list);
    guard += 1;
  }
  return candidate;
}

export function randomFloat() {
  const c = cryptoObject();
  if (!c) return Math.random();
  const buffer = new Uint32Array(1);
  c.getRandomValues(buffer);
  return buffer[0] / (MAX_UINT32 + 1);
}
