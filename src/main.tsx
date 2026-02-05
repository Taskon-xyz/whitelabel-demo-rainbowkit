import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/globals.css';

const normalizePathname = (pathname: string) => {
  const collapsed = pathname.replace(/\/{2,}/g, '/');
  if (collapsed.length <= 1) {
    return collapsed;
  }
  const trimmed = collapsed.replace(/\/+$/, '');
  return trimmed || '/';
};

// Mount the React SPA and enable client-side routing.
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

const normalizedPathname = normalizePathname(window.location.pathname);
if (normalizedPathname !== window.location.pathname) {
  window.history.replaceState(
    null,
    '',
    `${normalizedPathname}${window.location.search}${window.location.hash}`
  );
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
