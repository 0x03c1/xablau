import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import App from '../src/App.jsx';

export function mount(container) {
  const root = createRoot(container);
  act(() => {
    root.render(<App />);
  });
  return root;
}

export { act };
