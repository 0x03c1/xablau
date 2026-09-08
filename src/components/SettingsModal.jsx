import Modal from './Modal.jsx';
import Switch from './Switch.jsx';
import { THEMES } from '../data/themes.js';
import { MODES } from '../data/modes.js';
import { DURATIONS } from '../data/defaults.js';

export default function SettingsModal({ open, onClose, settings, onChange, onResetDrawn, drawnCount }) {
  const set = (patch) => onChange({ ...settings, ...patch });

  return (
    <Modal open={open} title="Configurações" subtitle="Tudo fica salvo neste navegador." onClose={onClose} size="lg">
      <div className="settings">
        <fieldset className="settings__group">
          <legend>Tipo de sorteio</legend>
          <div className="segmented" role="radiogroup" aria-label="Tipo de sorteio">
            <button
              type="button"
              role="radio"
              aria-checked={settings.format === 'single'}
              className="segmented__item"
              data-active={settings.format === 'single'}
              onClick={() => set({ format: 'single' })}
            >
              Vencedor único
              <small>um nome por vez</small>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={settings.format === 'ranking'}
              className="segmented__item"
              data-active={settings.format === 'ranking'}
              onClick={() => set({ format: 'ranking' })}
            >
              Classificação
              <small>um lugar por vez</small>
            </button>
          </div>
        </fieldset>

        <fieldset className="settings__group">
          <legend>Experiência</legend>
          <Switch
            id="cfg-som"
            label="Som"
            hint="Efeitos gerados no navegador, sem arquivos externos."
            checked={settings.sound}
            onChange={(v) => set({ sound: v })}
          />
          <Switch
            id="cfg-suspense"
            label="Modo suspense"
            hint="Desacelera o sorteio e cria os quase vencedores."
            checked={settings.suspense}
            onChange={(v) => set({ suspense: v })}
          />
          <Switch id="cfg-confete" label="Confetes" checked={settings.confetti} onChange={(v) => set({ confetti: v })} />
          <Switch
            id="cfg-frases"
            label="Frases engraçadas"
            checked={settings.jokes}
            onChange={(v) => set({ jokes: v })}
          />
          <Switch
            id="cfg-motion"
            label="Reduzir animações"
            hint="Também é ativado automaticamente pela preferência do sistema."
            checked={settings.reduceMotion}
            onChange={(v) => set({ reduceMotion: v })}
          />
        </fieldset>

        <fieldset className="settings__group">
          <legend>Duração do sorteio</legend>
          <div className="segmented" role="radiogroup" aria-label="Duração do sorteio">
            {Object.entries(DURATIONS).map(([key, value]) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={settings.duration === key}
                className="segmented__item"
                data-active={settings.duration === key}
                onClick={() => set({ duration: key })}
              >
                {value.label}
                <small>{(value.reel / 1000).toFixed(0)}s</small>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="settings__group">
          <legend>Modo do sorteio</legend>
          <div className="mode-grid">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className="mode-card"
                data-active={settings.mode === mode.id}
                aria-pressed={settings.mode === mode.id}
                onClick={() => set({ mode: mode.id })}
              >
                <span aria-hidden="true">{mode.icon}</span>
                <strong>{mode.name}</strong>
                <small>{mode.tagline}</small>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="settings__group">
          <legend>Tema visual</legend>
          <div className="theme-grid">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                className="theme-card"
                data-active={settings.theme === theme.id}
                aria-pressed={settings.theme === theme.id}
                onClick={() => set({ theme: theme.id })}
              >
                <span className="theme-card__swatch" aria-hidden="true">
                  {theme.swatch.map((color) => (
                    <i key={color} style={{ background: color }} />
                  ))}
                </span>
                {theme.name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="settings__group">
          <legend>Rodízio</legend>
          <Switch
            id="cfg-norepeat"
            label="Não repetir vencedores"
            hint="Cada pessoa só volta ao sorteio quando todo mundo tiver participado."
            checked={settings.noRepeat}
            onChange={(v) => set({ noRepeat: v })}
          />
          <button type="button" className="btn btn--ghost" onClick={onResetDrawn} disabled={drawnCount === 0}>
            🔄 Reiniciar sorteios ({drawnCount})
          </button>
        </fieldset>
      </div>
    </Modal>
  );
}
