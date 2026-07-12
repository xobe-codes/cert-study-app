import React, { useEffect, useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { STORAGE_KEYS } from '../storageKeys.js'
import { clearAnswerFluency, loadAnswerFluency } from '../features/study/answerFluency.js'

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silver, letterSpacing: 0.5, marginBottom: 8, marginTop: 4 }}>
      {children}
    </div>
  )
}

/** WB-8 — builder-only tools (local events + fluency wipe). */
export default function DevSettingsPanel({ onMessage }) {
  const [events, setEvents] = useState([])
  const [fluencySummary, setFluencySummary] = useState('')

  async function refresh() {
    const raw = (await window.storage?.getItem(STORAGE_KEYS.events)) || []
    const list = Array.isArray(raw) ? raw.slice(-40).reverse() : []
    setEvents(list)
    const flu = await loadAnswerFluency()
    const objCount = Object.keys(flu.objectives || {}).length
    const qCount = Object.keys(flu.questions || {}).length
    setFluencySummary(`${objCount} objectives · ${qCount} questions sampled`)
  }

  useEffect(() => { refresh() }, [])

  async function exportEvents() {
    const raw = (await window.storage?.getItem(STORAGE_KEYS.events)) || []
    const blob = new Blob([JSON.stringify(raw, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ccna-events-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    onMessage?.('Exported event log')
  }

  async function wipeFluency() {
    await clearAnswerFluency()
    await refresh()
    onMessage?.('Cleared fluency samples')
  }

  return (
    <div id="settings-dev">
      <SectionLabel>DEV / BUILDER</SectionLabel>
      <p style={{ ...styles.small, marginBottom: 10, lineHeight: 1.45 }}>
        Local study telemetry for improving the Weak Batch loop. Not a learner feature.
      </p>
      <div style={{ ...styles.small, marginBottom: 8, color: COLORS.sky }}>Fluency store: {fluencySummary || '—'}</div>
      <button type="button" style={{ ...styles.secondaryBtn, textAlign: 'left', marginBottom: 8 }} onClick={exportEvents}>
        Export event log (JSON)
      </button>
      <button type="button" style={{ ...styles.secondaryBtn, textAlign: 'left', marginBottom: 8 }} onClick={wipeFluency}>
        Clear fluency samples
      </button>
      <button type="button" style={{ ...styles.secondaryBtn, textAlign: 'left', marginBottom: 10 }} onClick={refresh}>
        Refresh preview
      </button>
      <div style={{
        maxHeight: 180,
        overflow: 'auto',
        padding: 8,
        borderRadius: 8,
        border: `1px solid ${COLORS.border}`,
        background: COLORS.surface,
        fontSize: 'var(--ccna-type-micro)',
        color: COLORS.silverMid,
        lineHeight: 1.4,
        marginBottom: 16,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      }}>
        {events.length === 0 && <div>No events yet.</div>}
        {events.map((e, i) => (
          <div key={`${e.at}-${i}`} style={{ marginBottom: 6 }}>
            {new Date(e.at).toLocaleTimeString()} · {e.type}
            {e.unknown ? ' · IDK' : ''}
            {e.latencyMs != null ? ` · ${e.latencyMs}ms` : ''}
            {e.fluency ? ` · ${e.fluency}` : ''}
            {e.objectiveId ? ` · ${e.objectiveId}` : ''}
          </div>
        ))}
      </div>
    </div>
  )
}
