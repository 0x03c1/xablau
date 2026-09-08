const MEDALS = ['🥇', '🥈', '🥉'];

function formatTime(at) {
  return new Date(at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

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
        <p className="empty__hint">Os últimos sorteios aparecem aqui.</p>
      ) : (
        <ol className="history">
          {history.map((item, index) =>
            Array.isArray(item.order) ? (
              <li key={item.at} className="history__item history__item--ranking">
                <span className="history__medal" aria-hidden="true">
                  🏁
                </span>
                <ol className="history__ranking">
                  {item.order.map((entry, pos) => (
                    <li key={entry.id}>
                      <b>{pos + 1}º</b> {entry.label}
                    </li>
                  ))}
                </ol>
                <time className="history__time" dateTime={new Date(item.at).toISOString()}>
                  {formatTime(item.at)}
                </time>
              </li>
            ) : (
              <li key={item.at + item.id} className="history__item">
                <span className="history__medal" aria-hidden="true">
                  {MEDALS[index] || `${index + 1}.`}
                </span>
                <span className="history__label">{item.label}</span>
                <time className="history__time" dateTime={new Date(item.at).toISOString()}>
                  {formatTime(item.at)}
                </time>
              </li>
            ),
          )}
        </ol>
      )}
    </section>
  );
}
