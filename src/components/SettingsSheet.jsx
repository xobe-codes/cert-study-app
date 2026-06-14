import React, { useEffect, useRef, useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { MIN_QUIZ_SESSION_SIZE, MAX_QUIZ_SESSION_SIZE } from '../quizSessionConfig.js'
import { KEYBOARD_SHORTCUTS } from '../ui/keyboardShortcuts.js'

const MODAL_Z = 300

function useFocusTrap(containerRef) {
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const focusable = el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()
    function onKey(e) {
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

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silver, letterSpacing: 0.5, marginBottom: 8, marginTop: 4 }}>
      {children}
    </div>
  )
}

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ marginTop: 3, accentColor: COLORS.brandGlow }} />
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, fontWeight: 600 }}>{label}</span>
        {hint && <span style={{ display: 'block', fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginTop: 2, lineHeight: 1.4 }}>{hint}</span>}
      </span>
    </label>
  )
}

export default function SettingsSheet({
  onClose,
  theme,
  onToggleTheme,
  examDate,
  onSaveExamDate,
  onClearExamDate,
  quizSessionSize,
  onQuizSessionSizeChange,
  socraticDefault,
  onSocraticDefaultChange,
  reduceMotion,
  onReduceMotionChange,
  onReplayPlacement,
  onShowTour,
  onOpenSync,
  onOpenExport,
  onImportPick,
  onClearTutorChat,
  onClearAiCaches,
  onResetProgress,
  offlineReadyCount,
  objectiveCount,
  cleanBankObjectives,
  cleanBankQuestions,
  appVersion,
}) {
  const dialogRef = useRef(null)
  const [examInput, setExamInput] = useState(examDate || '')
  const [quizSizeInput, setQuizSizeInput] = useState(String(quizSessionSize))
  const [resetStep, setResetStep] = useState(0)
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')

  useFocusTrap(dialogRef)

  useEffect(() => { setExamInput(examDate || '') }, [examDate])
  useEffect(() => { setQuizSizeInput(String(quizSessionSize)) }, [quizSessionSize])

  async function runAction(label, fn) {
    setBusy(label)
    setMsg('')
    try {
      await fn()
      setMsg(`${label} ✓`)
    } catch {
      setMsg(`Could not ${label.toLowerCase()}.`)
    } finally {
      setBusy('')
      setTimeout(() => setMsg(''), 2500)
    }
  }

  function handleResetClick() {
    if (resetStep === 0) { setResetStep(1); return }
    runAction('Reset progress', async () => {
      await onResetProgress()
      setResetStep(0)
    })
  }

  return (
    <div
      ref={dialogRef}
      className="ccna-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: MODAL_Z, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        className="ccna-sheet"
        style={{ ...styles.card, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px 16px 0 0', marginBottom: 0, paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
        onClick={e => e.stopPropagation()}
      >
        <h2 id="settings-modal-title" style={styles.h2}>Settings</h2>
        <p style={{ ...styles.small, marginBottom: 16 }}>Preferences, data, and study options.</p>

        <SectionLabel>APPEARANCE</SectionLabel>
        <ToggleRow
          label="Use dark theme"
          hint="Switch between dark and light appearance."
          checked={theme === 'dark'}
          onChange={() => onToggleTheme()}
        />
        <ToggleRow
          label="Reduce motion"
          hint="Minimize animations if movement is distracting."
          checked={reduceMotion}
          onChange={onReduceMotionChange}
        />

        <SectionLabel>STUDY</SectionLabel>
        <div style={{ ...styles.small, marginBottom: 6 }}>Target exam date</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <input
            type="date"
            value={examInput}
            onChange={e => setExamInput(e.target.value)}
            style={{ flex: 1, minWidth: 140, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '8px 10px', color: COLORS.silver, fontFamily: 'inherit', fontSize: 'var(--ccna-type-sm)' }}
          />
          <button type="button" style={{ ...styles.primaryBtn, flex: 0, width: 'auto', padding: '0 14px' }} onClick={() => onSaveExamDate(examInput)}>Save</button>
          {examDate && (
            <button type="button" style={{ ...styles.secondaryBtn, flex: 0, width: 'auto', padding: '0 14px' }} onClick={() => { onClearExamDate(); setExamInput('') }}>Clear</button>
          )}
        </div>
        <div style={{ ...styles.small, marginBottom: 6 }}>Default quiz session size</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
          <input
            type="number"
            min={MIN_QUIZ_SESSION_SIZE}
            max={MAX_QUIZ_SESSION_SIZE}
            value={quizSizeInput}
            onChange={e => setQuizSizeInput(e.target.value)}
            style={{ width: 72, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '8px 10px', color: COLORS.silver, fontFamily: 'inherit', fontSize: 'var(--ccna-type-sm)' }}
          />
          <button type="button" style={{ ...styles.secondaryBtn, flex: 0, width: 'auto', padding: '0 14px' }} onClick={() => onQuizSessionSizeChange(quizSizeInput)}>Save default</button>
          <span style={{ ...styles.small, flex: 1 }}>{MIN_QUIZ_SESSION_SIZE}–{MAX_QUIZ_SESSION_SIZE} questions</span>
        </div>
        <button type="button" style={{ ...styles.secondaryBtn, textAlign: 'left', marginBottom: 8 }} onClick={() => { onClose(); onReplayPlacement() }}>
          Replay placement check
        </button>
        <button type="button" style={{ ...styles.secondaryBtn, textAlign: 'left', marginBottom: 16 }} onClick={() => { onClose(); onShowTour() }}>
          Show app tour again
        </button>

        <SectionLabel>AI</SectionLabel>
        <ToggleRow
          label="Socratic mode by default"
          hint="Start Explain tab with guiding questions when AI is available."
          checked={socraticDefault}
          onChange={onSocraticDefaultChange}
        />
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <button type="button" style={{ ...styles.secondaryBtn, flex: 1 }} disabled={!!busy} onClick={() => runAction('Clear tutor chat', onClearTutorChat)}>Clear tutor chat</button>
          <button type="button" style={{ ...styles.secondaryBtn, flex: 1 }} disabled={!!busy} onClick={() => runAction('Clear AI caches', onClearAiCaches)}>Clear AI caches</button>
        </div>

        <SectionLabel>DATA</SectionLabel>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <button type="button" style={{ ...styles.secondaryBtn, flex: 1 }} onClick={() => { onClose(); onOpenSync() }}>☁ Sync</button>
          <button type="button" style={{ ...styles.secondaryBtn, flex: 1 }} onClick={() => { onClose(); onOpenExport() }}>Export</button>
          <button type="button" style={{ ...styles.secondaryBtn, flex: 1 }} onClick={onImportPick}>Import</button>
        </div>
        <p style={{ ...styles.small, marginBottom: 8 }}>
          {offlineReadyCount} objective{offlineReadyCount === 1 ? '' : 's'} fully offline-ready (cached AI assets).
        </p>
        <button
          type="button"
          style={{ ...styles.secondaryBtn, marginBottom: 16, borderColor: resetStep ? COLORS.roseBorder : COLORS.border, color: resetStep ? COLORS.rose : COLORS.silver }}
          disabled={!!busy}
          onClick={handleResetClick}
        >
          {resetStep ? 'Tap again to confirm — erase all progress' : 'Reset all study progress…'}
        </button>

        <SectionLabel>KEYBOARD</SectionLabel>
        <ul style={{ margin: '0 0 16px', paddingLeft: 18, fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.6 }}>
          {KEYBOARD_SHORTCUTS.map(s => (
            <li key={s.keys}><strong style={{ color: COLORS.silver }}>{s.keys}</strong> — {s.action}</li>
          ))}
        </ul>

        <SectionLabel>ABOUT</SectionLabel>
        <p style={{ ...styles.small, marginBottom: 16, lineHeight: 1.5 }}>
          CCNA 200-301 Study Tool v{appVersion}<br />
          {objectiveCount} exam objectives · {cleanBankObjectives} with curated banks · {cleanBankQuestions > 0 ? `${cleanBankQuestions} bundled questions` : 'bundled questions load on first quiz'}<br />
          Most lessons work offline — bundled · instant.
        </p>

        {msg && <div style={{ ...styles.small, color: COLORS.mint, marginBottom: 8 }}>{msg}</div>}
        <button type="button" style={{ ...styles.secondaryBtn, background: 'none', border: 'none', color: COLORS.silverMid }} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
