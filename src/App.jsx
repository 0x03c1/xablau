import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import Stage from './components/Stage.jsx';
import ControlDeck from './components/ControlDeck.jsx';
import ParticipantsPanel from './components/ParticipantsPanel.jsx';
import HistoryPanel from './components/HistoryPanel.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import HelpModal from './components/HelpModal.jsx';
import PasteModal from './components/PasteModal.jsx';
import Toast from './components/Toast.jsx';
import { usePersistentState } from './hooks/usePersistentState.js';
import { useReducedMotion } from './hooks/useReducedMotion.js';
import { useAudio } from './hooks/useAudio.js';
import { useFullscreen } from './hooks/useFullscreen.js';
import { PHASES, useDraw } from './hooks/useDraw.js';
import { DEFAULT_SETTINGS, SAMPLE_PARTICIPANTS, STORAGE_KEYS } from './data/defaults.js';
import { MODES } from './data/modes.js';
import { beforeDraw, emptyState, milestones } from './data/phrases.js';
import { createParticipant, eligibleParticipants, parseList } from './utils/participants.js';
import { pickRandom, secureShuffle } from './utils/random.js';
import { clearState } from './utils/storage.js';

const HISTORY_LIMIT = 12;
const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

function sanitizeParticipants(stored) {
  if (!Array.isArray(stored)) return [];
  return stored
    .filter((item) => item && typeof item.label === 'string')
    .map((item) => ({
      id: String(item.id ?? `p_${Math.random().toString(36).slice(2)}`),
      label: item.label,
      emoji: typeof item.emoji === 'string' ? item.emoji : '',
      body: typeof item.body === 'string' && item.body ? item.body : item.label,
      createdAt: Number(item.createdAt) || Date.now(),
    }));
}

function sanitizeSettings(stored) {
  if (!stored || typeof stored !== 'object') return DEFAULT_SETTINGS;
  const merged = { ...DEFAULT_SETTINGS, ...stored };
  if (!MODES.some((m) => m.id === merged.mode)) merged.mode = DEFAULT_SETTINGS.mode;
  return merged;
}

export default function App() {
  const [participants, setParticipants] = usePersistentState(
    STORAGE_KEYS.participants,
    [],
    sanitizeParticipants,
  );
  const [history, setHistory] = usePersistentState(STORAGE_KEYS.history, [], (v) => (Array.isArray(v) ? v : []));
  const [settings, setSettings] = usePersistentState(STORAGE_KEYS.settings, DEFAULT_SETTINGS, sanitizeSettings);
  const [drawnIds, setDrawnIds] = usePersistentState(STORAGE_KEYS.drawn, [], (v) => (Array.isArray(v) ? v : []));
  const [drawCount, setDrawCount] = usePersistentState(STORAGE_KEYS.drawCount, 0, (v) => Number(v) || 0);

  const [toast, setToast] = useState(null);
  const [openModal, setOpenModal] = useState(null); // 'settings' | 'help' | 'paste'
  const [secret, setSecret] = useState(false);
  const [teaser, setTeaser] = useState(() => pickRandom(beforeDraw));
  const konamiIndex = useRef(0);

  const systemReduced = useReducedMotion();
  const calmMotion = systemReduced || settings.reduceMotion;
  const audio = useAudio(settings.sound);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

  const notify = useCallback((text, tone = 'info') => setToast({ text, tone, id: Date.now() }), []);

  const validIds = useMemo(() => new Set(participants.map((p) => p.id)), [participants]);
  const activeDrawn = useMemo(() => drawnIds.filter((id) => validIds.has(id)), [drawnIds, validIds]);
  const pool = useMemo(
    () => eligibleParticipants(participants, activeDrawn, settings.noRepeat),
    [participants, activeDrawn, settings.noRepeat],
  );
  const everyoneDrawn = settings.noRepeat && participants.length > 0 && pool.length === 0;

  const handleWinner = useCallback(
    (chosen) => {
      setHistory((prev) => [{ id: chosen.id, label: chosen.label, at: Date.now() }, ...prev].slice(0, HISTORY_LIMIT));
      setDrawnIds((prev) => (prev.includes(chosen.id) ? prev : [...prev, chosen.id]));
      setDrawCount((prev) => {
        const next = prev + 1;
        const milestone = milestones[next];
        if (milestone) setTimeout(() => notify(milestone, 'party'), 1400);
        return next;
      });
      setTeaser(pickRandom(beforeDraw));
    },
    [notify, setDrawCount, setDrawnIds, setHistory],
  );

  const draw = useDraw({ settings, calmMotion, audio, onWinner: handleWinner });

  const startDraw = useCallback(() => {
    audio.unlock();
    if (draw.isRunning) return;
    if (participants.length === 0) {
      audio.play('error');
      notify(pickRandom(emptyState), 'warn');
      return;
    }
    if (pool.length === 0) {
      audio.play('error');
      notify('🎉 TODO MUNDO PARTICIPOU! Reinicie o rodízio para começar de novo.', 'party');
      return;
    }
    draw.start(pool);
  }, [audio, draw, notify, participants.length, pool]);

  const addParticipant = useCallback(
    (raw) => {
      const participant = createParticipant(raw);
      if (!participant) return false;
      const exists = participants.some((p) => p.label.toLowerCase() === participant.label.toLowerCase());
      if (exists) {
        notify(`${participant.body} já está na lista.`, 'warn');
        return false;
      }
      setParticipants((prev) => [...prev, participant]);
      audio.play('click');
      return true;
    },
    [audio, notify, participants, setParticipants],
  );

  const removeParticipant = useCallback(
    (id) => {
      setParticipants((prev) => prev.filter((p) => p.id !== id));
      setDrawnIds((prev) => prev.filter((drawnId) => drawnId !== id));
    },
    [setDrawnIds, setParticipants],
  );

  const importList = useCallback(
    (text) => {
      const { added, duplicates } = parseList(text, participants);
      if (added.length === 0) {
        notify(duplicates > 0 ? 'Todo mundo dessa lista já estava aqui.' : 'Nenhuma linha válida para importar.', 'warn');
        return;
      }
      setParticipants((prev) => [...prev, ...added]);
      setOpenModal(null);
      audio.play('click');
      notify(
        `${added.length} ${added.length === 1 ? 'participante adicionado' : 'participantes adicionados'}` +
          (duplicates > 0 ? ` (${duplicates} repetido${duplicates === 1 ? '' : 's'} ignorado${duplicates === 1 ? '' : 's'})` : ''),
        'ok',
      );
    },
    [audio, notify, participants, setParticipants],
  );

  const shuffleList = useCallback(() => {
    if (participants.length < 2) return;
    setParticipants((prev) => secureShuffle(prev));
    audio.play('click');
    notify('Lista embaralhada. Isso não escolhe ninguém, só troca a ordem.', 'ok');
  }, [audio, notify, participants.length, setParticipants]);

  const clearAll = useCallback(() => {
    setParticipants([]);
    setDrawnIds([]);
    draw.reset();
    notify('Lista zerada.', 'ok');
  }, [draw, notify, setDrawnIds, setParticipants]);

  const loadSample = useCallback(() => {
    const { added } = parseList(SAMPLE_PARTICIPANTS.join('\n'), []);
    setParticipants(added);
    notify('Turma de exemplo carregada. Já dá para sortear.', 'ok');
  }, [notify, setParticipants]);

  const resetDrawn = useCallback(() => {
    setDrawnIds([]);
    notify('Rodízio reiniciado. Todo mundo volta para o sorteio.', 'ok');
  }, [notify, setDrawnIds]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    clearState(STORAGE_KEYS.history);
    notify('Histórico limpo.', 'ok');
  }, [notify, setHistory]);

  const cycleMode = useCallback(() => {
    const index = MODES.findIndex((m) => m.id === settings.mode);
    const next = MODES[(index + 1) % MODES.length];
    setSettings((prev) => ({ ...prev, mode: next.id }));
    notify(`Modo ${next.name}. ${next.tagline}`, 'ok');
  }, [notify, setSettings, settings.mode]);

  // Atalhos de teclado e o codigo secreto.
  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      const konamiKey = KONAMI[konamiIndex.current];
      if (event.key === konamiKey || event.key.toLowerCase() === konamiKey) {
        konamiIndex.current += 1;
        if (konamiIndex.current === KONAMI.length) {
          konamiIndex.current = 0;
          setSecret((prev) => {
            const next = !prev;
            audio.play(next ? 'secret' : 'click');
            notify(next ? '🕹️ Modo arcade secreto ligado. Ninguém precisa saber.' : 'Modo secreto desligado.', 'party');
            return next;
          });
        }
      } else {
        konamiIndex.current = event.key === KONAMI[0] ? 1 : 0;
      }

      if (typing || openModal) {
        if (event.key === 'Escape' && !openModal) draw.reset();
        return;
      }

      switch (event.key.toLowerCase()) {
        case ' ':
          event.preventDefault();
          startDraw();
          break;
        case 'f':
          audio.unlock();
          toggleFullscreen();
          break;
        case 'r':
          shuffleList();
          break;
        case 's':
          setSettings((prev) => {
            notify(prev.sound ? 'Som desligado.' : 'Som ligado.', 'ok');
            return { ...prev, sound: !prev.sound };
          });
          break;
        case 'm':
          cycleMode();
          break;
        case 'escape':
          draw.reset();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [audio, cycleMode, draw, notify, openModal, setSettings, shuffleList, startDraw, toggleFullscreen]);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  const idleHint = settings.jokes ? teaser : 'Pronto quando você estiver.';

  return (
    <div
      className="app"
      data-theme={settings.theme}
      data-fullscreen={isFullscreen ? 'true' : 'false'}
      data-secret={secret ? 'true' : 'false'}
      data-calm={calmMotion ? 'true' : 'false'}
      data-drawing={draw.isRunning ? 'true' : 'false'}
    >
      <Header
        secret={secret}
        isFullscreen={isFullscreen}
        onOpenHelp={() => setOpenModal('help')}
        onOpenSettings={() => setOpenModal('settings')}
        onToggleFullscreen={() => {
          audio.unlock();
          toggleFullscreen();
        }}
      />

      <main className="layout">
        <div className="layout__stage">
          <Stage
            mode={settings.mode}
            phase={draw.phase}
            display={draw.display}
            message={draw.message}
            winner={draw.winner}
            progress={draw.progress}
            pool={pool}
            totalParticipants={participants.length}
            settings={settings}
            calmMotion={calmMotion}
            idleHint={idleHint}
            onDrawAgain={startDraw}
          />

          <ControlDeck
            mode={settings.mode}
            onModeChange={(id) => setSettings((prev) => ({ ...prev, mode: id }))}
            onDraw={startDraw}
            onCancel={draw.reset}
            isRunning={draw.isRunning}
            phase={draw.phase}
            disabled={participants.length === 0 || everyoneDrawn}
            noRepeat={settings.noRepeat}
            drawnCount={activeDrawn.length}
            total={participants.length}
            everyoneDrawn={everyoneDrawn}
            onResetDrawn={resetDrawn}
            teaser={draw.phase === PHASES.IDLE && settings.jokes ? teaser : ''}
          />
        </div>

        <aside className="layout__rail" aria-label="Turma e histórico">
          <ParticipantsPanel
            participants={participants}
            drawnIds={activeDrawn}
            noRepeat={settings.noRepeat}
            onAdd={addParticipant}
            onRemove={removeParticipant}
            onShuffle={shuffleList}
            onOpenPaste={() => setOpenModal('paste')}
            onClearAll={clearAll}
            onLoadSample={loadSample}
          />
          <HistoryPanel history={history} onClear={clearHistory} />
        </aside>
      </main>

      <SettingsModal
        open={openModal === 'settings'}
        onClose={() => setOpenModal(null)}
        settings={settings}
        onChange={setSettings}
        onResetDrawn={resetDrawn}
        drawnCount={activeDrawn.length}
      />
      <HelpModal open={openModal === 'help'} onClose={() => setOpenModal(null)} />
      <PasteModal open={openModal === 'paste'} onClose={() => setOpenModal(null)} onConfirm={importList} />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
