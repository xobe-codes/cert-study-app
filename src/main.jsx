import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AppErrorBoundary from './components/AppErrorBoundary.jsx'
import { createLocalStoragePolyfill } from './storage/localStoragePolyfill.js'

// --- window.storage polyfill (localStorage-backed) ---
// Provides an async key/value store so the app can run standalone
// without a host environment that supplies window.storage natively.
if (!window.storage) {
  window.storage = createLocalStoragePolyfill(window)
}

// Apply the saved theme synchronously before first paint to avoid a flash of
// the wrong theme. Falls back to the OS preference, then dark.
try {
  const raw = localStorage.getItem('ccna_theme_v1')
  const saved = raw ? JSON.parse(raw) : null
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
  document.documentElement.setAttribute('data-theme', saved || (prefersLight ? 'light' : 'dark'))
} catch {
  document.documentElement.setAttribute('data-theme', 'dark')
}

if (import.meta.env.DEV) {
  import('./e2eTestHooks.js').then(m => m.installE2eTestHooks())
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>,
)

// registerSW.js (injected by vite-plugin-pwa) handles SW registration.
// Purge legacy hand-written SW caches that could serve stale index.html shells.
if ('caches' in window) {
  caches.keys().then((keys) => {
    for (const key of keys) {
      if (key === 'ccna-curated-v3') caches.delete(key)
    }
  }).catch(() => {})
}
