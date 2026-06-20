import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AppErrorBoundary from './components/AppErrorBoundary.jsx'

// --- window.storage polyfill (localStorage-backed) ---
// Provides an async key/value store so the app can run standalone
// without a host environment that supplies window.storage natively.
if (!window.storage) {
  window.storage = {
    async getItem(key) {
      const raw = localStorage.getItem(key)
      if (raw === null) return null
      try {
        return JSON.parse(raw)
      } catch {
        return raw
      }
    },
    async setItem(key, value) {
      localStorage.setItem(key, JSON.stringify(value))
    },
    async removeItem(key) {
      localStorage.removeItem(key)
    },
  }
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
