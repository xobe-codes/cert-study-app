import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
