import React, { useEffect, useRef, useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { MIN_QUIZ_SESSION_SIZE, MAX_QUIZ_SESSION_SIZE } from '../quizSessionConfig.js'
import { KEYBOARD_SHORTCUTS } from '../ui/keyboardShortcuts.js'
import { PremiumSettingsCard } from './PremiumPreview.jsx'

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

const SECTION_LINKS = [
  { id: 'settings-appearance', label: 'Appearance' },
  { id: 'settings-study', label: 'Study' },
  { id: 'settings-ai', label: 'AI' },
  { id: 'settings-data', label: 'Data' },
  { id: 'settings-about', label: 'About' },
]

export default function SettingsSheet({
  onClose,
  theme,
  onToggleTheme,
  examDate,
  onSaveExamDate,
  onClearExamDate,
  quizSessionSize,
  onQuizSessionSizeChange,
  reduceMotion,
  onReduceMotionChange,
  examMode,
  onExamModeChange,
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
  cleanBankGenericExamTips,
  appVersion,
  onDonatePreview,
}) {
  const dialogRef = useRef(null)
  const sheetRef = useRef(null)
  const touchStartY = useRef(null)
  const [dragY, setDragY] = useState(0)
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

  function jumpTo(id) {
    sheetRef.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function onTouchStart(e) {
    touchStartY.current = e.touches[0].clientY
    setDragY(0)
  }

  function onTouchMove(e) {
    if (touchStartY.current == null) return
    const dy = e.touches[0].clientY - touchStartY.current
    if (dy > 0) setDragY(dy)
  }

  function onTouchEnd() {
    if (dragY > 90) onClose()
    touchStartY.current = null
    setDragY(0)
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
        ref={sheetRef}
        className="ccna-sheet"
        style={{
          ...styles.card,
          width: '100%',
          maxWidth: 640,
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '16px 16px 0 0',
          marginBottom: 0,
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: dragY ? 'none' : 'transform .25s ease',
        }}
        onClick={e => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div style={{ width: 40, height: 4, borderRadius: 999, background: COLORS.border, margin: '0 auto 12px' }} aria-hidden />
        <h2 id="settings-modal-title" style={styles.h2}>Settings</h2>
        <p style={{ ...styles.small, marginBottom: 10 }}>Preferences, data, and study options.</p>
        <div className="settings-section-nav" style={{ position: 'sticky', top: 0, zIndex: 2, display: 'flex', gap: 6, flexWrap: 'wrap', padding: '8px 0 12px', marginBottom: 4, background: COLORS.card, borderBottom: `1px solid ${COLORS.border}` }}>
          {SECTION_LINKS.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => jumpTo(s.id)}
              style={{ ...styles.secondaryBtn, flex: '0 0 auto', width: 'auto', minHeight: 36, padding: '4px 10px', fontSize: 'var(--ccna-type-xs)', marginBottom: 0 }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div id="settings-appearance">
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
        <ToggleRow
          label="Exam mode (quiz)"
          hint="Hide exam tips until the session ends — tips appear as a debrief."
          checked={examMode}
          onChange={onExamModeChange}
        />

        </div>

        <div id="settings-study">
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

        <PremiumSettingsCard onDonatePreview={onDonatePreview} />
        </div>

        <div id="settings-ai">
        <SectionLabel>AI</SectionLabel>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <button type="button" style={{ ...styles.secondaryBtn, flex: 1 }} disabled={!!busy} onClick={() => runAction('Clear tutor chat', onClearTutorChat)}>Clear tutor chat</button>
          <button type="button" style={{ ...styles.secondaryBtn, flex: 1 }} disabled={!!busy} onClick={() => runAction('Clear AI caches', onClearAiCaches)}>Clear AI caches</button>
        </div>

        </div>

        <div id="settings-data">
        <SectionLabel>DATA</SectionLabel>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <button type="button" style={{ ...styles.secondaryBtn, flex: 1 }} onClick={() => { onClose(); onOpenSync() }}>☁ Sync</button>
          <button type="button" style={{ ...styles.secondaryBtn, flex: 1 }} onClick={() => { onClose(); onOpenExport() }}>Export</button>
          <button type="button" style={{ ...styles.secondaryBtn, flex: 1 }} onClick={onImportPick}>Import</button>
        </div>
        <p style={{ ...styles.small, marginBottom: 8 }}>
          {offlineReadyCount} AI-generated pack{offlineReadyCount === 1 ? '' : 's'} cached for offline use.
        </p>
        <button
          type="button"
          style={{ ...styles.secondaryBtn, marginBottom: 16, borderColor: resetStep ? COLORS.roseBorder : COLORS.border, color: resetStep ? COLORS.rose : COLORS.silver }}
          disabled={!!busy}
          onClick={handleResetClick}
        >
          {resetStep ? 'Tap again to confirm — erase all progress' : 'Reset all study progress…'}
        </button>
        </div>

        <SectionLabel>KEYBOARD</SectionLabel>
        <ul style={{ margin: '0 0 16px', paddingLeft: 18, fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.6 }}>
          {KEYBOARD_SHORTCUTS.map(s => (
            <li key={s.keys}><strong style={{ color: COLORS.silver }}>{s.keys}</strong> — {s.action}</li>
          ))}
        </ul>

        <div id="settings-about">
        <SectionLabel>ABOUT</SectionLabel>
        <p style={{ ...styles.small, marginBottom: 8, lineHeight: 1.5, color: COLORS.sky }}>
          📱 iPhone/iPad: tap Share → Add to Home Screen for a full-screen app icon.
        </p>
        <p style={{ ...styles.small, marginBottom: 16, lineHeight: 1.5 }}>
          CCNA 200-301 Study Tool v{appVersion}<br />
          {objectiveCount} exam objectives · {cleanBankObjectives} with curated banks · {cleanBankQuestions > 0 ? `${cleanBankQuestions} bundled questions` : 'bundled questions load on first quiz'}
          {cleanBankQuestions > 0 && cleanBankGenericExamTips != null && (
            <> · {cleanBankGenericExamTips === 0 ? 'all exam tips curated' : `${cleanBankGenericExamTips} generic exam tip${cleanBankGenericExamTips === 1 ? '' : 's'}`}</>
          )}
          <br />
          Most lessons work offline — curated content ships in the app.
        </p>
        </div>

        {msg && <div style={{ ...styles.small, color: COLORS.mint, marginBottom: 8 }}>{msg}</div>}
        <button type="button" style={{ ...styles.secondaryBtn, background: 'none', border: 'none', color: COLORS.silverMid }} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
