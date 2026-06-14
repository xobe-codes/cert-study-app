import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { COLORS, accentColors, styles } from '../ui/appTheme.js'
import { parseNavHintMessage, resolveNavHint } from '../ui/navHintConfig.js'
import { NavHintIcon } from './NavHintIcons.jsx'

const NavHintContext = createContext(null)

function NavHintToast({ hint, onDismiss }) {
  const c = accentColors(hint.accent)
  const parts = parseNavHintMessage(hint.message)

  return (
    <div className="nav-hint-layer" onClick={onDismiss} role="presentation">
      <div
        className="nav-hint-toast"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        onClick={e => e.stopPropagation()}
        style={{
          border: `1px solid ${c.border}`,
          background: `linear-gradient(135deg, ${c.dim} 0%, ${COLORS.card} 72%)`,
          boxShadow: '0 10px 32px #00000055',
        }}
      >
        <NavHintIcon name={hint.icon} accent={hint.accent} />
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.45, color: COLORS.silver, flex: 1 }}>
          {parts.map((part, i) => (
            part.bold
              ? <strong key={i} style={{ color: c.text, fontWeight: 700 }}>{part.text}</strong>
              : <span key={i}>{part.text}</span>
          ))}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss hint"
          style={{
            background: 'none',
            border: 'none',
            color: COLORS.silverMid,
            fontSize: 18,
            lineHeight: 1,
            cursor: 'pointer',
            padding: 4,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>
    </div>
  )
}

export function NavHintProvider({ children }) {
  const [hint, setHint] = useState(null)
  const timerRef = useRef(null)

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setHint(null)
  }, [])

  const showNavHint = useCallback((key, params = {}) => {
    const resolved = resolveNavHint(key, params)
    if (!resolved) return
    if (timerRef.current) clearTimeout(timerRef.current)
    setHint({ ...resolved, id: Date.now() })
    timerRef.current = setTimeout(() => setHint(null), 3200)
  }, [])

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return (
    <NavHintContext.Provider value={{ showNavHint, dismiss }}>
      {children}
      {hint && <NavHintToast key={hint.id} hint={hint} onDismiss={dismiss} />}
    </NavHintContext.Provider>
  )
}

export function useNavHint() {
  const ctx = useContext(NavHintContext)
  return ctx?.showNavHint ?? (() => {})
}
