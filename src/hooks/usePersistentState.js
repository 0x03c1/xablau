import { useEffect, useRef, useState } from 'react';
import { loadState, saveState } from '../utils/storage.js';

/** useState com carga inicial segura e gravacao automatica no localStorage. */
export function usePersistentState(key, initialValue, sanitize) {
  const [value, setValue] = useState(() => {
    const stored = loadState(key, initialValue);
    return sanitize ? sanitize(stored, initialValue) : stored;
  });

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    saveState(key, value);
  }, [key, value]);

  return [value, setValue];
}
