export default function Header({ onOpenSettings, onOpenHelp, onToggleFullscreen, isFullscreen, secret }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand__dice" aria-hidden="true">
          🎲
        </span>
        <div>
          <h1 className="brand__name" data-secret={secret ? 'true' : 'false'}>
            QUEM SERÁ?
          </h1>
          <p className="brand__tag">O destino da sala acaba de ser decidido.</p>
        </div>
      </div>

      <nav className="topbar__actions" aria-label="Acoes da aplicacao">
        <button type="button" className="btn btn--icon" onClick={onOpenHelp} aria-label="Ajuda e atalhos">
          <span aria-hidden="true">?</span>
        </button>
        <button type="button" className="btn btn--icon" onClick={onOpenSettings} aria-label="Configuracoes">
          <span aria-hidden="true">⚙</span>
        </button>
        <button
          type="button"
          className="btn btn--icon"
          onClick={onToggleFullscreen}
          aria-pressed={isFullscreen}
          aria-label={isFullscreen ? 'Sair da tela cheia' : 'Entrar em tela cheia'}
        >
          <span aria-hidden="true">⛶</span>
        </button>
      </nav>
    </header>
  );
}
