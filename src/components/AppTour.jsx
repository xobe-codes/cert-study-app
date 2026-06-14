import React, { useRef, useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { APP_TOUR_STEPS } from '../ui/appTourSteps.js'

const MODAL_Z = 310

function useFocusTrap(containerRef) {
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const focusable = el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()
    function onKey(e) {
      if (e.key === 'Escape') return
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else if (document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [containerRef])
}

export default function AppTour({ onComplete, onSkip }) {
  const dialogRef = useRef(null)
  const [index, setIndex] = useState(0)
  useFocusTrap(dialogRef)

  const step = APP_TOUR_STEPS[index]
  const last = index >= APP_TOUR_STEPS.length - 1

  function next() {
    if (last) onComplete()
    else setIndex(i => i + 1)
  }

  return (
    <div
      ref={dialogRef}
      className="ccna-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-tour-title"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: MODAL_Z, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div
        className="ccna-sheet"
        style={{ ...styles.card, width: '100%', maxWidth: 420, margin: 0, borderRadius: 16 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 8 }}>
          Step {index + 1} of {APP_TOUR_STEPS.length}
        </div>
        <h2 id="app-tour-title" style={{ ...styles.h2, marginBottom: 8 }}>{step.title}</h2>
        <p style={{ fontSize: 'var(--ccna-type-md)', lineHeight: 1.55, color: COLORS.silver, marginBottom: 16 }}>{step.body}</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {APP_TOUR_STEPS.map((s, i) => (
            <div
              key={s.id}
              aria-hidden
              style={{
                flex: 1,
                height: 4,
                borderRadius: 999,
                background: i <= index ? COLORS.brandGlow : COLORS.border,
                opacity: i <= index ? 1 : 0.45,
              }}
            />
          ))}
        </div>
        <button type="button" style={styles.primaryBtn} onClick={next}>{last ? 'Get started' : 'Next'}</button>
        <button type="button" style={{ ...styles.secondaryBtn, marginTop: 8, background: 'none', border: 'none', color: COLORS.silverMid }} onClick={onSkip}>
          Skip tour
        </button>
      </div>
    </div>
  )
}
