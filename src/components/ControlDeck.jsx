import { MODES } from '../data/modes.js';

export default function ControlDeck({
  mode,
  onModeChange,
  onDraw,
  onCancel,
  isRunning,
  phase,
  disabled,
  noRepeat,
  drawnCount,
  total,
  everyoneDrawn,
  onResetDrawn,
  teaser,
}) {
  return (
    <div className="deck">
      <div className="deck__modes" role="radiogroup" aria-label="Modo do sorteio">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={mode === item.id}
            className="deck__mode"
            data-active={mode === item.id}
            onClick={() => onModeChange(item.id)}
            disabled={isRunning}
            title={item.tagline}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.name}
          </button>
        ))}
      </div>

      <div className="deck__main">
        {isRunning ? (
          <button type="button" className="btn btn--stop" onClick={onCancel}>
            Parar sorteio
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--draw"
            onClick={onDraw}
            disabled={disabled}
            data-phase={phase}
          >
            <span className="btn__label">{everyoneDrawn ? 'Todo mundo já participou' : 'SORTEAR'}</span>
            <span className="btn__hint">{everyoneDrawn ? 'reinicie o rodízio' : 'ou aperte espaço'}</span>
          </button>
        )}
      </div>

      <div className="deck__status">
        {noRepeat ? (
          <p className="deck__counter">
            <strong>
              {drawnCount} de {total}
            </strong>{' '}
            já participaram
          </p>
        ) : (
          <p className="deck__counter deck__counter--dim">{total} na roda</p>
        )}
        {everyoneDrawn ? (
          <button type="button" className="chip chip--bright" onClick={onResetDrawn}>
            🔄 Reiniciar sorteios
          </button>
        ) : null}
        {teaser ? <p className="deck__teaser">{teaser}</p> : null}
      </div>
    </div>
  );
}
