import React, { useCallback, useEffect, useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { PREMIUM_FEATURES, PREMIUM_COMING_SOON_LABEL } from '../premium/premiumFeatures.js'
import {
  getContentHealthStatus,
  loadContentHealthAiEnabled,
  saveContentHealthAiEnabled,
  processFlaggedQuestions,
  loadContentHealthLastProcess,
} from '../quiz/contentHealthProcess.js'
import { flushQuestionFlagQueue } from '../quiz/questionHealthClient.js'
import { LEARNER_QUARANTINE_THRESHOLD } from '../data/questionHealthConstants.js'

function ToggleRow({ label, hint, checked, onChange, disabled }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.55 : 1 }}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={e => onChange(e.target.checked)}
        style={{ marginTop: 3, accentColor: COLORS.brandGlow }}
      />
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, fontWeight: 600 }}>{label}</span>
        {hint && <span style={{ display: 'block', fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginTop: 2, lineHeight: 1.4 }}>{hint}</span>}
      </span>
    </label>
  )
}

function formatLastProcess(last) {
  if (!last?.at) return null
  const when = new Date(last.at).toLocaleString()
  return last.message || `Last run ${when}`
}

/**
 * Settings → Content Health — manual Process push + optional AI drafts.
 * Never auto-publishes to the clean bank.
 */
export default function ContentHealthSettings({
  premiumUnlocked = false,
  onPremiumBlocked,
  apiOnline = true,
}) {
  const [aiEnabled, setAiEnabled] = useState(false)
  const [status, setStatus] = useState(null)
  const [last, setLast] = useState(null)
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')

  const refresh = useCallback(async () => {
    const [s, ai, lp] = await Promise.all([
      getContentHealthStatus(),
      loadContentHealthAiEnabled(),
      loadContentHealthLastProcess(),
    ])
    setStatus(s)
    setAiEnabled(ai)
    setLast(lp)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  async function onToggleAi(on) {
    if (on && !premiumUnlocked) {
      onPremiumBlocked?.(PREMIUM_FEATURES.content_health_ai, 'content_health_settings')
      return
    }
    setAiEnabled(await saveContentHealthAiEnabled(on))
  }

  async function run(label, fn) {
    setBusy(label)
    setMsg('')
    try {
      const result = await fn()
      setMsg(typeof result === 'string' ? result : (result?.message || `${label} ✓`))
      await refresh()
    } catch {
      setMsg(`Could not ${label.toLowerCase()}.`)
    } finally {
      setBusy('')
      setTimeout(() => setMsg(''), 5000)
    }
  }

  const pending = (status?.localPending || 0) + (status?.remoteFlaggedQuestions || 0)
  const ready = status?.readyToProcess || 0
  const canProcess = premiumUnlocked && !busy && (pending > 0 || ready > 0)

  return (
    <div id="settings-content-health" style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silver, letterSpacing: 0.5, marginBottom: 8, marginTop: 4 }}>
        CONTENT HEALTH
      </div>
      <p style={{ ...styles.small, marginBottom: 10, lineHeight: 1.45 }}>
        Flagged questions stay in a review queue. Process soft-quarantines hot items (≥{LEARNER_QUARANTINE_THRESHOLD} flags) and stages fix drafts — the clean bank is never auto-updated.
      </p>
      <div style={{ ...styles.small, marginBottom: 12, padding: '8px 10px', borderRadius: 8, background: COLORS.surface, border: `1px solid ${COLORS.border}`, lineHeight: 1.45 }}>
        <strong style={{ color: COLORS.silver }}>{status?.localPending ?? '…'}</strong> local pending
        {' · '}
        <strong style={{ color: COLORS.silver }}>{status?.remoteFlaggedQuestions ?? '…'}</strong> remote flagged
        {' · '}
        <strong style={{ color: COLORS.amber }}>{ready}</strong> ready to process
        {status?.localQuarantineCount > 0 && (
          <> · <strong style={{ color: COLORS.rose }}>{status.localQuarantineCount}</strong> soft-quarantined</>
        )}
      </div>

      <ToggleRow
        label="Content Health AI drafts"
        hint={premiumUnlocked
          ? 'When on, Process may ask AI for fix drafts (staging only). Off = quarantine/export only.'
          : `${PREMIUM_COMING_SOON_LABEL} — unlock to enable AI drafts on Process.`}
        checked={aiEnabled && premiumUnlocked}
        disabled={!premiumUnlocked}
        onChange={onToggleAi}
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <button
          type="button"
          style={{ ...styles.secondaryBtn, flex: 1 }}
          disabled={!!busy || !apiOnline}
          onClick={() => run('Sync flags', async () => {
            const n = await flushQuestionFlagQueue()
            return n ? `Synced ${n} flag(s).` : 'No pending flags to sync (or offline).'
          })}
        >
          Sync flags
        </button>
        <button
          type="button"
          style={{ ...styles.primaryBtn, flex: 1 }}
          disabled={!canProcess}
          onClick={() => {
            if (!premiumUnlocked) {
              onPremiumBlocked?.(PREMIUM_FEATURES.content_health_ai, 'content_health_process')
              return
            }
            run('Process flagged', () => processFlaggedQuestions({
              premiumUnlocked,
              aiEnabled: aiEnabled && premiumUnlocked,
            }))
          }}
        >
          Process flagged now
        </button>
      </div>
      {!premiumUnlocked && (
        <p style={{ ...styles.small, marginBottom: 8, color: COLORS.silverMid }}>
          Process is a premium Content Health action. Free users can still flag questions.
        </p>
      )}
      {(msg || formatLastProcess(last)) && (
        <p style={{ ...styles.small, marginBottom: 0, color: msg ? COLORS.mint : COLORS.silverMid, lineHeight: 1.45 }}>
          {msg || formatLastProcess(last)}
        </p>
      )}
    </div>
  )
}
