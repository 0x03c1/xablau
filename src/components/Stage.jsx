import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { PHASES } from '../hooks/useDraw.js';
import { chaosNoise, hackerLog, rocketLog } from '../data/phrases.js';
import { pickRandom, randomFloat } from '../utils/random.js';
import Confetti from './Confetti.jsx';

const CHAOS_EMOJIS = ['🎲', '🔥', '🚀', '👀', '💥', '🤖', '🎯', '⚡', '🍀', '🧠', '🎉', '😳'];

/** Faixa de lampadas do modo game show. */
const Bulbs = memo(function Bulbs({ count = 18 }) {
  return (
    <div className="bulbs" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="bulbs__item" style={{ '--i': i }} />
      ))}
    </div>
  );
});

/** Log do modo hacker: linhas surgem conforme o sorteio avanca. */
function HackerLog({ phase, progress }) {
  const lines = useMemo(() => hackerLog, []);
  const visible = phase === PHASES.IDLE ? 0 : Math.min(lines.length, Math.ceil(progress * lines.length) + 1);
  return (
    <ul className="terminal__log" aria-hidden="true">
      {lines.slice(0, visible).map((line) => (
        <li key={line}>
          <span className="terminal__prompt">$</span> {line}
        </li>
      ))}
    </ul>
  );
}

/** Nomes espalhados pela tela no modo caos. */
function ChaosField({ pool, active }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!active || pool.length === 0) {
      setItems([]);
      return undefined;
    }
    const build = () =>
      Array.from({ length: Math.min(14, Math.max(6, pool.length)) }, (_, i) => ({
        key: `${i}-${Date.now()}`,
        text: randomFloat() > 0.45 ? (pickRandom(pool)?.label ?? '') : pickRandom(CHAOS_EMOJIS),
        top: 6 + randomFloat() * 80,
        left: 4 + randomFloat() * 88,
        rotate: -22 + randomFloat() * 44,
        scale: 0.7 + randomFloat() * 0.9,
        delay: randomFloat() * 0.6,
      }));
    setItems(build());
    const id = setInterval(() => setItems(build()), 900);
    return () => clearInterval(id);
  }, [active, pool]);

  return (
    <div className="chaos-field" aria-hidden="true">
      {items.map((item) => (
        <span
          key={item.key}
          className="chaos-field__item"
          style={{
            top: `${item.top}%`,
            left: `${item.left}%`,
            '--rot': `${item.rotate}deg`,
            '--scale': item.scale,
            animationDelay: `${item.delay}s`,
          }}
        >
          {item.text}
        </span>
      ))}
    </div>
  );
}

function ReelItem({ item, phase }) {
  if (!item) {
    return <span className="reel__placeholder">{phase === PHASES.HUSH ? '· · ·' : '?'}</span>;
  }
  return (
    <span className="reel__value">
      {item.emoji ? <span className="reel__emoji">{item.emoji}</span> : null}
      <span className="reel__text">{item.body}</span>
    </span>
  );
}

export default function Stage({
  mode,
  phase,
  display,
  message,
  winner,
  progress,
  pool,
  totalParticipants,
  settings,
  calmMotion,
  idleHint,
  onDrawAgain,
}) {
  const running = phase !== PHASES.IDLE && phase !== PHASES.RESULT;
  const liveRef = useRef(null);

  const modeLabel = useMemo(() => {
    if (phase === PHASES.IDLE) return idleHint;
    if (mode === 'hacker') return phase === PHASES.RESULT ? '> TARGET SELECTED' : '> SCANNING...';
    if (mode === 'rocket') return phase === PHASES.RESULT ? 'ALVO CAPTURADO' : pickRandom(rocketLog);
    if (mode === 'chaos' && phase === PHASES.HUSH) return 'Ok. Chega.';
    return message;
  }, [mode, phase, message, idleHint]);

  return (
    <section
      className="stage"
      data-mode={mode}
      data-phase={phase}
      data-calm={calmMotion ? 'true' : 'false'}
      aria-label="Area de sorteio"
    >
      <div className="stage__backdrop" aria-hidden="true">
        <div className="stage__glow" style={{ '--intensity': running ? 0.4 + progress * 0.6 : 0.25 }} />
        {mode === 'gameshow' ? <Bulbs /> : null}
        {mode === 'rocket' ? <div className="starfield" /> : null}
        {mode === 'chaos' ? <ChaosField pool={pool} active={running && !calmMotion} /> : null}
      </div>

      {settings.confetti && phase === PHASES.RESULT ? <Confetti calm={calmMotion} /> : null}

      <div className="stage__inner">
        {mode === 'hacker' ? (
          <div className="terminal__chrome" aria-hidden="true">
            <span /> <span /> <span />
            <p>quem_sera --sortear --entropy=crypto</p>
          </div>
        ) : null}

        {phase === PHASES.RESULT && winner ? (
          <div className="winner" role="group" aria-label="Resultado do sorteio">
            <p className="winner__crown" aria-hidden="true">
              {mode === 'rocket' ? '🚀' : mode === 'hacker' ? '⌁' : '👑'}
            </p>
            <p className="winner__kicker">{mode === 'hacker' ? 'TARGET SELECTED' : 'É VOCÊ!'}</p>
            <p className="winner__name">
              {winner.emoji ? <span className="winner__emoji">{winner.emoji}</span> : null}
              <span>{winner.body}</span>
            </p>
            {message ? <p className="winner__joke">{message}</p> : null}
            <button type="button" className="btn btn--ghost winner__again" onClick={onDrawAgain}>
              Sortear de novo
            </button>
          </div>
        ) : (
          <div className="reel" data-running={running ? 'true' : 'false'}>
            {mode === 'hacker' ? <HackerLog phase={phase} progress={progress} /> : null}
            <div className="reel__window">
              {phase === PHASES.IDLE ? (
                <p className="reel__idle">
                  <span aria-hidden="true">🎲</span>
                  <span>{totalParticipants > 0 ? 'Tudo pronto' : 'Lista vazia'}</span>
                </p>
              ) : (
                <ReelItem item={display} phase={phase} />
              )}
            </div>
            <p className="stage__message" ref={liveRef}>
              {modeLabel}
            </p>
            <div className="stage__progress" aria-hidden="true">
              <span style={{ transform: `scaleX(${running ? progress : 0})` }} />
            </div>
          </div>
        )}
      </div>

      <p className="visually-hidden" role="status" aria-live="polite">
        {phase === PHASES.RESULT && winner ? `Sorteado: ${winner.label}` : ''}
      </p>
    </section>
  );
}
