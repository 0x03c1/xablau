import { useEffect } from 'react';

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(onDismiss, toast.duration || 3600);
    return () => clearTimeout(id);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="toast" data-tone={toast.tone || 'info'} role="status" aria-live="polite">
      <p>{toast.text}</p>
      <button type="button" className="toast__close" onClick={onDismiss} aria-label="Fechar aviso">
        ×
      </button>
    </div>
  );
}
