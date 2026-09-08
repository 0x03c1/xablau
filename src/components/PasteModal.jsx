import { useState } from 'react';
import Modal from './Modal.jsx';

export default function PasteModal({ open, onClose, onConfirm }) {
  const [text, setText] = useState('');
  const lines = text.split(/\r?\n|;/).filter((l) => l.trim().length > 0).length;

  const confirm = () => {
    onConfirm(text);
    setText('');
  };

  return (
    <Modal
      open={open}
      title="Colar lista"
      subtitle="Cada linha vira um participante. Linhas vazias e repetidos são ignorados."
      onClose={onClose}
    >
      <label className="visually-hidden" htmlFor="lista-colada">
        Lista de participantes
      </label>
      <textarea
        id="lista-colada"
        className="textarea"
        rows={10}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={'Ana\nBruno\nCarlos\n👨‍💻 Lucas\n🚀 Grupo A\n42'}
      />
      <div className="modal__foot">
        <span className="modal__hint">{lines} {lines === 1 ? 'linha válida' : 'linhas válidas'}</span>
        <div className="modal__foot-actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn--solid" onClick={confirm} disabled={lines === 0}>
            Adicionar {lines > 0 ? lines : ''}
          </button>
        </div>
      </div>
    </Modal>
  );
}
