import React from 'react'

/** Sun/moon toggle — uses `.app-chrome-theme` from appShell.css tokens. */
export default function ThemeToggleButton({ theme, onToggle, className = '' }) {
  if (!onToggle || !theme) return null
  const toLight = theme === 'dark'
  return (
    <button
      type="button"
      className={`app-chrome-theme ${className}`.trim()}
      aria-label={toLight ? 'Switch to light theme' : 'Switch to dark theme'}
      title={toLight ? 'Light mode' : 'Dark mode'}
      onClick={onToggle}
    >
      {toLight ? '☀️' : '🌙'}
    </button>
  )
}
