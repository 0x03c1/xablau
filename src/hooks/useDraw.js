import { useCallback, useEffect, useRef, useState } from 'react';
import { getSecureRandomIndex, pickDifferent, pickRandom, secureShuffle } from '../utils/random.js';
import { DURATIONS } from '../data/defaults.js';
import {
  afterDraw,
  afterRanking,
  prepare as preparePhrases,
  shuffling,
  suspense as suspensePhrases,
} from '../data/phrases.js';

export const PHASES = {
  IDLE: 'idle',
  PREPARE: 'prepare',
  SHUFFLE: 'shuffle',
  SUSPENSE: 'suspense',
  HUSH: 'hush',
  RESULT: 'result',
};

/**
 * Intervalos entre trocas de nome: comecam rapidos e desaceleram.
 * O total se aproxima da duracao pedida sem depender de framerate.
 */
function buildTicks(totalMs, calm) {
  const min = calm ? 220 : 45;
  const max = calm ? 620 : 430;
  const ticks = [];
  let elapsed = 0;
  let guard = 0;
  while (elapsed < totalMs && guard < 400) {
    const p = Math.min(elapsed / totalMs, 1);
    const interval = min + (max - min) * p ** 2.4;
    ticks.push(interval);
    elapsed += interval;
    guard += 1;
  }
  return ticks;
}

/**
 * A escolha real acontece no primeiro instante de start(), com
 * crypto.getRandomValues. A animacao apenas encena um resultado ja definido.
 */
export function useDraw({ settings, calmMotion, audio, onWinner }) {
  const [phase, setPhase] = useState(PHASES.IDLE);
  const [display, setDisplay] = useState(null);
  const [message, setMessage] = useState('');
  const [winner, setWinner] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [progress, setProgress] = useState(0);
  const timers = useRef([]);
  const runningRef = useRef(false);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const schedule = useCallback((fn, delay) => {
    timers.current.push(setTimeout(fn, delay));
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    runningRef.current = false;
    setPhase(PHASES.IDLE);
    setDisplay(null);
    setWinner(null);
    setRanking(null);
    setMessage('');
    setProgress(0);
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const start = useCallback(
    (pool, options = {}) => {
      if (runningRef.current) return false;
      if (!Array.isArray(pool) || pool.length === 0) return false;

      clearTimers();
      runningRef.current = true;

      // 1. Sorteio real, antes de qualquer animacao.
      // No modo classificacao a ordem inteira e sorteada de uma vez; o
      // primeiro colocado e quem a animacao revela no fim.
      const isRanking = Boolean(options.ranking);
      const order = isRanking ? secureShuffle(pool) : null;
      const chosen = isRanking ? order[0] : pool[getSecureRandomIndex(pool.length)];

      setWinner(null);
      setRanking(null);
      setDisplay(null);
      setProgress(0);
      setPhase(PHASES.PREPARE);
      setMessage(pickRandom(preparePhrases));
      audio.play('start');

      const timing = DURATIONS[settings.duration] || DURATIONS.normal;
      const suspenseOn = settings.suspense && !calmMotion;
      const prepareMs = calmMotion ? 400 : timing.prepare;
      const reelMs = suspenseOn ? timing.reel : Math.round(timing.reel * 0.4);
      const hushMs = suspenseOn ? timing.hush : 260;

      const ticks = buildTicks(reelMs, calmMotion);
      const total = ticks.length;
      // Momentos em que o vencedor aparece e escapa: os "quase la".
      const teases = new Set([Math.floor(total * 0.58), Math.floor(total * 0.84)]);

      let elapsed = prepareMs;
      ticks.forEach((interval, i) => {
        elapsed += interval;
        const p = total > 1 ? i / (total - 1) : 1;
        schedule(() => {
          setProgress(p);
          const nextPhase = p < 0.55 ? PHASES.SHUFFLE : PHASES.SUSPENSE;
          setPhase(nextPhase);
          const item = teases.has(i) ? chosen : pickDifferent(pool, chosen.id) || chosen;
          setDisplay(item);
          audio.play('tick', 320 + p * 900);
          if (i % 7 === 0) {
            setMessage(pickRandom(nextPhase === PHASES.SHUFFLE ? shuffling : suspensePhrases));
          }
          if (suspenseOn && teases.has(i)) audio.play('suspense');
        }, elapsed);
      });

      const hushAt = elapsed + 160;
      schedule(() => {
        setPhase(PHASES.HUSH);
        setDisplay(null);
        setMessage('');
        audio.play('hush');
      }, hushAt);

      schedule(() => {
        runningRef.current = false;
        setPhase(PHASES.RESULT);
        setWinner(chosen);
        if (isRanking) setRanking(order);
        setDisplay(chosen);
        setMessage(settings.jokes ? pickRandom(isRanking ? afterRanking : afterDraw) : '');
        setProgress(1);
        audio.play('win');
        onWinner(chosen, order);
      }, hushAt + hushMs);

      return true;
    },
    [audio, calmMotion, clearTimers, onWinner, schedule, settings.duration, settings.jokes, settings.suspense],
  );

  return {
    phase,
    display,
    message,
    winner,
    ranking,
    progress,
    start,
    reset,
    isRunning: phase !== PHASES.IDLE && phase !== PHASES.RESULT,
    isIdle: phase === PHASES.IDLE,
  };
}
