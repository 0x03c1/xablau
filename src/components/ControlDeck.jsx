import { MODES } from '../data/modes.js';

const FORMATS = [
  { id: 'single', icon: '🎯', name: 'Vencedor', tagline: 'Sorteia um nome por vez.' },
  { id: 'ranking', icon: '🏁', name: 'Classificação', tagline: 'Um lugar por vez, do 1º ao último.' },
];

export default function ControlDeck({
  mode,
  onModeChange,
  format,
  onFormatChange,
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
  rankingCount,
  rankingComplete,
  onResetRanking,
  teaser,
}) {
  const ranking = format === 'ranking';
  const nextPlace = rankingCount + 1;

  let mainLabel = 'SORTEAR';
  let mainHint = 'ou aperte espaço';
  if (ranking) {
    mainLabel = rankingComplete ? 'Classificação completa' : 'SORTEAR';
    mainHint = rankingComplete ? 'reinicie abaixo' : `${nextPlace}º lugar`;
  } else if (everyoneDrawn) {
    mainLabel = 'Todo mundo já participou';
    mainHint = 'reinicie o rodízio';
  }

  return (
    <div className="deck">
      <div className="deck__left">
        <div className="deck__formats" role="radiogroup" aria-label="Tipo de sorteio">
          {FORMATS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={format === item.id}
              className="deck__mode"
              data-active={format === item.id}
              onClick={() => onFormatChange(item.id)}
              disabled={isRunning}
              title={item.tagline}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </div>

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
            <span className="btn__label">{mainLabel}</span>
            <span className="btn__hint">{mainHint}</span>
          </button>
        )}
      </div>

      <div className="deck__status">
        {ranking ? (
          <p className="deck__counter">
            <strong>
              {rankingCount} de {total}
            </strong>{' '}
            {rankingCount === 1 ? 'posição definida' : 'posições definidas'}
          </p>
        ) : noRepeat ? (
          <p className="deck__counter">
            <strong>
              {drawnCount} de {total}
            </strong>{' '}
            já participaram
          </p>
        ) : (
          <p className="deck__counter deck__counter--dim">{total} na roda</p>
        )}
        {ranking && rankingCount > 0 ? (
          <button type="button" className="chip chip--bright" onClick={onResetRanking}>
            🔄 Reiniciar classificação
          </button>
        ) : null}
        {!ranking && everyoneDrawn ? (
          <button type="button" className="chip chip--bright" onClick={onResetDrawn}>
            🔄 Reiniciar sorteios
          </button>
        ) : null}
        {teaser ? <p className="deck__teaser">{teaser}</p> : null}
      </div>
    </div>
  );
}
