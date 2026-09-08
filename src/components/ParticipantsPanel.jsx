import { useRef, useState } from 'react';

export default function ParticipantsPanel({
  participants,
  drawnIds,
  noRepeat,
  onAdd,
  onRemove,
  onShuffle,
  onOpenPaste,
  onClearAll,
  onLoadSample,
}) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  const submit = (event) => {
    event.preventDefault();
    const added = onAdd(value);
    if (added) setValue('');
    inputRef.current?.focus();
  };

  const drawn = new Set(drawnIds);

  return (
    <section className="panel" aria-labelledby="participantes-titulo">
      <div className="panel__head">
        <h2 id="participantes-titulo">Participantes</h2>
        <span className="panel__count">{participants.length}</span>
      </div>

      <form className="adder" onSubmit={submit}>
        <label className="visually-hidden" htmlFor="novo-participante">
          Novo participante
        </label>
        <input
          id="novo-participante"
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Digite um nome, número, emoji ou qualquer coisa..."
          autoComplete="off"
        />
        <button type="submit" className="btn btn--solid">
          + Adicionar
        </button>
      </form>

      <div className="panel__tools">
        <button type="button" className="chip" onClick={onOpenPaste}>
          📋 Colar lista
        </button>
        <button type="button" className="chip" onClick={onShuffle} disabled={participants.length < 2}>
          🔀 Embaralhar
        </button>
        <button type="button" className="chip chip--danger" onClick={onClearAll} disabled={participants.length === 0}>
          🧹 Limpar
        </button>
      </div>

      {participants.length === 0 ? (
        <div className="empty">
          <p>Ninguém na lista ainda.</p>
          <p className="empty__hint">Digite um nome acima, cole uma lista inteira ou comece com um exemplo.</p>
          <button type="button" className="btn btn--ghost" onClick={onLoadSample}>
            Usar lista de exemplo
          </button>
        </div>
      ) : (
        <ul className="cards">
          {participants.map((p) => {
            const already = noRepeat && drawn.has(p.id);
            return (
              <li key={p.id} className="card" data-drawn={already ? 'true' : 'false'}>
                <span className="card__mark" aria-hidden="true">
                  {p.emoji || (already ? '✓' : '•')}
                </span>
                <span className="card__label">{p.body}</span>
                {already ? <span className="card__badge">já saiu</span> : null}
                <button
                  type="button"
                  className="card__remove"
                  onClick={() => onRemove(p.id)}
                  aria-label={`Remover ${p.label}`}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
