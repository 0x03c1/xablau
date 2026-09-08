import { getSecureRandomIndex } from './random.js';

// Um ou mais pictogramas no inicio do texto (com ZWJ, tom de pele e seletor de variacao).
const LEADING_EMOJI =
  /^((?:\p{Extended_Pictographic})(?:\uFE0F|\u200D\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*\s*)+/u;

let counter = 0;

export function createId() {
  counter += 1;
  return `p_${Date.now().toString(36)}_${counter}_${getSecureRandomIndex(100000)}`;
}

/** Separa o emoji inicial do restante. O label mantem sempre o texto completo. */
export function splitEmoji(raw) {
  const text = String(raw).trim();
  const match = text.match(LEADING_EMOJI);
  if (!match) return { emoji: '', body: text };
  const emoji = match[0].trim();
  const body = text.slice(match[0].length).trim();
  return body ? { emoji, body } : { emoji: '', body: text };
}

export function createParticipant(raw) {
  const label = String(raw).replace(/\s+/g, ' ').trim();
  if (!label) return null;
  const { emoji, body } = splitEmoji(label);
  return {
    id: createId(),
    label,
    emoji,
    body: body || label,
    createdAt: Date.now(),
  };
}

/** Cada linha vira um participante. Linhas vazias e repetidos exatos sao ignorados. */
export function parseList(text, existing = []) {
  const seen = new Set(existing.map((p) => p.label.toLowerCase()));
  const added = [];
  let duplicates = 0;

  String(text)
    .split(/\r?\n|;/)
    .forEach((line) => {
      const participant = createParticipant(line);
      if (!participant) return;
      const key = participant.label.toLowerCase();
      if (seen.has(key)) {
        duplicates += 1;
        return;
      }
      seen.add(key);
      added.push(participant);
    });

  return { added, duplicates };
}

/** Participantes ainda elegiveis quando "nao repetir vencedores" esta ligado. */
export function eligibleParticipants(participants, drawnIds, noRepeat) {
  if (!noRepeat) return participants;
  const drawn = new Set(drawnIds);
  return participants.filter((p) => !drawn.has(p.id));
}
