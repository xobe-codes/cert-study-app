import React, { useEffect, useRef, useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { STATIC_COPY } from '../ui/staticContentCopy.js'
import StudyBlockStrip from './StudyBlockStrip.jsx'

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input:not([type="hidden"]),select,[tabindex]:not([tabindex="-1"])'

export default function ObjectiveOverflowMenu({
  objective,
  prevObj,
  nextObj,
  onSelectSibling,
  objLabs,
  onOpenLab,
  isOffline,
  isPackaging,
  apiOnline,
  premiumUnlocked,
  onPackage,
  onPremiumBlocked,
  showOfflineAction,
  toolItems = [],
  onOpenTool,
  onToggleTheme,
  theme,
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const btnRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e) {
      if (menuRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return
      setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (!open || !menuRef.current) return
    const first = menuRef.current.querySelector(FOCUSABLE)
    first?.focus()
  }, [open])

  function pick(fn) {
    setOpen(false)
    fn?.()
  }

  return (
    <div className="objective-overflow" style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        type="button"
        className="objective-overflow-btn"
        aria-label="More options"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen(o => !o)}
      >
        ⋯
      </button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="objective-overflow-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            minWidth: 220,
            maxWidth: 280,
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            boxShadow: '0 12px 32px #00000055',
            zIndex: 140,
            padding: '8px 0',
          }}
        >
          <div style={{ padding: '6px 12px 10px', borderBottom: `1px solid ${COLORS.border}` }}>
            <StudyBlockStrip objectiveId={objective.id} />
          </div>
          {(prevObj || nextObj) && (
            <div role="group" aria-label="Sibling topics" style={{ display: 'flex', gap: 6, padding: '8px 12px', borderBottom: `1px solid ${COLORS.border}` }}>
              <button type="button" role="menuitem" className="objective-sibling-btn" style={{ flex: 1 }} disabled={!prevObj} onClick={() => pick(() => onSelectSibling?.(prevObj))}>
                ‹ {prevObj ? prevObj.id : '—'}
              </button>
              <button type="button" role="menuitem" className="objective-sibling-btn objective-sibling-btn--next" style={{ flex: 1 }} disabled={!nextObj} onClick={() => pick(() => onSelectSibling?.(nextObj))}>
                {nextObj ? nextObj.id : '—'} ›
              </button>
            </div>
          )}
          {showOfflineAction && (
            <div style={{ padding: '8px 12px', borderBottom: `1px solid ${COLORS.border}` }}>
              {isOffline ? (
                <span style={{ ...styles.pill('mint'), fontSize: 'var(--ccna-type-xs)' }}>⤓ Offline ready</span>
              ) : isPackaging ? (
                <span style={{ ...styles.pill('sky'), fontSize: 'var(--ccna-type-xs)' }}>Downloading…</span>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  className="objective-offline-btn"
                  style={{ width: '100%' }}
                  onClick={() => pick(() => {
                    if (premiumUnlocked) onPackage?.(objective)
                    else onPremiumBlocked?.('offline_pack', 'objective', { objectiveId: objective.id })
                  })}
                  disabled={!apiOnline && premiumUnlocked}
                >
                  {apiOnline ? '⤓ Save offline' : 'Offline only'}
                </button>
              )}
            </div>
          )}
          {objLabs.length > 0 && (
            <button
              type="button"
              role="menuitem"
              className="objective-overflow-item"
              onClick={() => pick(() => onOpenLab?.(objLabs[0].id))}
            >
              🧪 {objLabs.length === 1 ? objLabs[0].title : `${objLabs.length} labs`}
            </button>
          )}
          {toolItems.map(t => (
            <button
              key={t.id}
              type="button"
              role="menuitem"
              className="objective-overflow-item"
              onClick={() => pick(() => onOpenTool?.(t.id))}
            >
              {t.icon} {t.label}
            </button>
          ))}
          {onToggleTheme && (
            <button type="button" role="menuitem" className="objective-overflow-item" onClick={() => pick(onToggleTheme)}>
              {theme === 'dark' ? '☀️ Light theme' : '🌙 Dark theme'}
            </button>
          )}
          <div style={{ padding: '6px 12px 4px', fontSize: 'var(--ccna-type-micro)', color: COLORS.silverDim, borderTop: `1px solid ${COLORS.border}` }}>
            {STATIC_COPY.lab}
          </div>
        </div>
      )}
    </div>
  )
}
