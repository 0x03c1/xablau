const MEDALS = ['🥇', '🥈', '🥉'];

export default function HistoryPanel({ history, onClear }) {
  return (
    <section className="panel panel--history" aria-labelledby="historico-titulo">
      <div className="panel__head">
        <h2 id="historico-titulo">🏆 Histórico</h2>
        {history.length > 0 ? (
          <button type="button" className="link-btn" onClick={onClear}>
            Limpar
          </button>
        ) : null}
      </div>

      {history.length === 0 ? (
        <p className="empty__hint">Os últimos sorteados aparecem aqui.</p>
      ) : (
        <ol className="history">
          {history.map((item, index) => (
            <li key={item.at + item.id} className="history__item">
              <span className="history__medal" aria-hidden="true">
                {MEDALS[index] || `${index + 1}.`}
              </span>
              <span className="history__label">{item.label}</span>
              <time className="history__time" dateTime={new Date(item.at).toISOString()}>
                {new Date(item.at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
