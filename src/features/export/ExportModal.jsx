import React, { useState, useEffect, useMemo, useRef } from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import { STATIC_COPY } from '../../ui/staticContentCopy.js'
import { STORAGE_KEYS } from '../../storageKeys.js'
import { EXPLAIN_CACHE_KEY } from '../../tabs/studyConstants.js'
import { MODAL_Z } from '../../ui/modalConstants.js'
import { useFocusTrap } from '../../ui/useFocusTrap.js'
import { buildLearnerSummary } from '../../home/learnerHome.js'
import { todayStr } from '../../home/sessionUtils.js'
import { loadQuizBank } from '../../quiz/quizBankStorage.js'
import { loadCliStats } from '../../lab/cliStatsStorage.js'
import { loadOfflineDetail } from './offlineDetail.js'
import { REPORTS } from './exportReports.js'
import { importCcnaJsonFromFile } from './importCcnaJson.js'
import Spinner from '../../components/Spinner.jsx'

const TERMS_CACHE_KEY = 'ccna_terms_cache_v1'

export default function ExportModal({ progress, missed, streak, onImport, onClose }) {
  const [ctx, setCtx] = useState(null)
  const [selected, setSelected] = useState('progress')
  const [copied, setCopied] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const fileRef = useRef(null)
  const dialogRef = useRef(null)
  useFocusTrap(dialogRef)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const result = await importCcnaJsonFromFile(file, onImport)
      setImportMsg(result.message)
    } catch {
      setImportMsg('Could not read that file (must be a valid JSON export).')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [summary, quizBank, cliStats, events, offlineDetail, explainCache, termsCache, visualCache] = await Promise.all([
        buildLearnerSummary(progress, missed || []),
        loadQuizBank(),
        loadCliStats(),
        window.storage.getItem(STORAGE_KEYS.events),
        loadOfflineDetail(),
        window.storage.getItem(EXPLAIN_CACHE_KEY),
        window.storage.getItem(TERMS_CACHE_KEY),
        window.storage.getItem(STORAGE_KEYS.visualCache),
      ])
      if (!cancelled) setCtx({
        progress, missed: missed || [], streak, summary, quizBank, cliStats,
        events: events || [], offlineDetail,
        explainCache: explainCache || {}, termsCache: termsCache || {}, visualCache: visualCache || {},
      })
    })()
    return () => { cancelled = true }
  }, [progress, missed, streak])

  const report = REPORTS.find(r => r.key === selected)
  const text = useMemo(() => (ctx ? report.build(ctx) : ''), [ctx, report])

  async function copy() {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { setCopied(false) }
  }
  function download() {
    const blob = new Blob([text], { type: report.ext === 'json' ? 'application/json' : 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ccna-${report.key}-${todayStr()}.${report.ext}`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div ref={dialogRef} className="ccna-overlay" role="dialog" aria-modal="true" aria-labelledby="export-modal-title" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: MODAL_Z, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div className="ccna-sheet" style={{ ...styles.card, marginBottom: 0, paddingBottom: 'calc(var(--ccna-safe-bottom) + 16px)' }} onClick={e => e.stopPropagation()}>
        <h2 id="export-modal-title" style={styles.h2}>Export Reports</h2>
        <p style={{ ...styles.small, marginBottom: 12 }}>All reports are {STATIC_COPY.reports}.</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {REPORTS.map(r => {
            const active = r.key === selected
            return (
              <button
                key={r.key}
                onClick={() => setSelected(r.key)}
                title={r.desc}
                style={{
                  flex: '1 1 auto', minHeight: 40, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                background: active ? COLORS.brandDim : COLORS.surface,
                border: `1px solid ${active ? COLORS.brandGlow : COLORS.border}`,
                color: active ? COLORS.brandGlow : COLORS.silverMid,
                  fontSize: 'var(--ccna-type-xs)', fontWeight: 600, padding: '8px 10px', whiteSpace: 'nowrap',
                }}
              >{r.label}</button>
            )
          })}
        </div>

        <div style={{ ...styles.small, marginBottom: 6, color: COLORS.silverMid }}>{report.desc}</div>
        {!ctx ? (
          <Spinner label="Building report..." />
        ) : (
          <textarea
            readOnly
            value={text}
            style={{ ...styles.input, height: 260, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 'var(--ccna-type-xs)', resize: 'vertical', whiteSpace: 'pre' }}
          />
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button style={styles.primaryBtn} onClick={copy} disabled={!ctx}>{copied ? 'Copied!' : 'Copy'}</button>
          <button style={styles.secondaryBtn} onClick={download} disabled={!ctx}>Download .{report.ext}</button>
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 14, paddingTop: 12 }}>
          <div style={{ ...styles.small, marginBottom: 6 }}>Restore from a backup — import a “Raw Data (JSON)” export. Your current data is merged in, never overwritten.</div>
          <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={handleFile} />
          <button style={styles.secondaryBtn} onClick={() => fileRef.current?.click()}>Import data (.json)</button>
          {importMsg && <div style={{ ...styles.small, marginTop: 6, color: importMsg.includes('✓') ? COLORS.mint : COLORS.rose }}>{importMsg}</div>}
        </div>

        <button style={{ ...styles.secondaryBtn, marginTop: 12, background: 'none', border: 'none', color: COLORS.silverMid }} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
