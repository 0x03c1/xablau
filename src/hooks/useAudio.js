import { useCallback, useEffect, useRef } from 'react';

/**
 * Efeitos sonoros sinteticos via Web Audio API. Nenhum arquivo externo.
 * O contexto so e criado depois de uma interacao do usuario, como exigem
 * as politicas de autoplay dos navegadores.
 */
export function useAudio(enabled) {
  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const ensureContext = useCallback(() => {
    if (!enabledRef.current) return null;
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    if (!ctxRef.current) {
      try {
        ctxRef.current = new AudioCtx();
        const master = ctxRef.current.createGain();
        master.gain.value = 0.22;
        master.connect(ctxRef.current.destination);
        masterRef.current = master;
      } catch {
        return null;
      }
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }, []);

  const tone = useCallback(
    ({ freq = 440, duration = 0.12, type = 'sine', gain = 0.5, delay = 0, glideTo = null }) => {
      const ctx = ensureContext();
      if (!ctx || !masterRef.current) return;
      const start = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, start + duration);
      env.gain.setValueAtTime(0.0001, start);
      env.gain.exponentialRampToValueAtTime(gain, start + 0.012);
      env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(env);
      env.connect(masterRef.current);
      osc.start(start);
      osc.stop(start + duration + 0.05);
    },
    [ensureContext],
  );

  const noise = useCallback(
    (duration = 0.25, gain = 0.12) => {
      const ctx = ensureContext();
      if (!ctx || !masterRef.current) return;
      const frames = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < frames; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
      }
      const source = ctx.createBufferSource();
      const env = ctx.createGain();
      env.gain.value = gain;
      source.buffer = buffer;
      source.connect(env);
      env.connect(masterRef.current);
      source.start();
    },
    [ensureContext],
  );

  const play = useCallback(
    (name, param) => {
      if (!enabledRef.current) return;
      switch (name) {
        case 'start':
          tone({ freq: 180, glideTo: 720, duration: 0.5, type: 'sawtooth', gain: 0.28 });
          tone({ freq: 90, glideTo: 360, duration: 0.5, type: 'square', gain: 0.12 });
          break;
        case 'tick':
          tone({ freq: param || 480, duration: 0.05, type: 'square', gain: 0.16 });
          break;
        case 'suspense':
          tone({ freq: 110, glideTo: 96, duration: 0.6, type: 'triangle', gain: 0.2 });
          break;
        case 'hush':
          tone({ freq: 70, duration: 0.5, type: 'sine', gain: 0.25 });
          break;
        case 'win':
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
            tone({ freq, duration: 0.32, type: 'triangle', gain: 0.42, delay: i * 0.09 });
          });
          tone({ freq: 1318.5, duration: 0.9, type: 'sine', gain: 0.22, delay: 0.42 });
          noise(0.5, 0.06);
          break;
        case 'click':
          tone({ freq: 660, duration: 0.05, type: 'sine', gain: 0.2 });
          break;
        case 'error':
          tone({ freq: 220, duration: 0.16, type: 'square', gain: 0.22 });
          tone({ freq: 165, duration: 0.22, type: 'square', gain: 0.22, delay: 0.14 });
          break;
        case 'secret':
          [392, 523.25, 659.25, 880, 1174.7].forEach((freq, i) => {
            tone({ freq, duration: 0.2, type: 'square', gain: 0.3, delay: i * 0.07 });
          });
          break;
        default:
          break;
      }
    },
    [tone, noise],
  );

  useEffect(
    () => () => {
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
    },
    [],
  );

  return { play, unlock: ensureContext };
}
