import React, { useEffect, useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { getContentHealthStatus } from '../quiz/contentHealthProcess.js'
import { STORAGE_KEYS } from '../storageKeys.js'

/**
 * Premium Home strip — flagged / ready-to-process counts → Settings Content Health.
 */
export default function ContentHealthHomeStrip({
  premiumUnlocked = false,
  onOpenSettings,
}) {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    if (!premiumUnlocked) return undefined
    let cancelled = false
    getContentHealthStatus().then(s => {
      if (!cancelled) setStatus(s)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [premiumUnlocked])

  if (!premiumUnlocked || !status) return null
  const pending = (status.localPending || 0)
  const ready = status.readyToProcess || 0
  const remote = status.remoteFlaggedQuestions || 0
  if (pending === 0 && ready === 0 && remote === 0 && !status.localQuarantineCount) return null

  async function openHealth() {
    try {
      await window.storage?.setItem(STORAGE_KEYS.settingsFocusSection, 'settings-content-health')
    } catch { /* ignore */ }
    onOpenSettings?.()
  }

  return (
    <button
      type="button"
      className="ccna-hover"
      onClick={openHealth}
      style={{
        ...styles.secondaryBtn,
        width: '100%',
        marginBottom: 12,
        textAlign: 'left',
        borderColor: ready > 0 ? COLORS.amberBorder : COLORS.border,
        background: ready > 0 ? COLORS.amberDim : COLORS.surface,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 'var(--ccna-type-sm)', color: ready > 0 ? COLORS.amber : COLORS.silver, marginBottom: 2 }}>
        Content Health
      </div>
      <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.4 }}>
        {pending} local flag{pending === 1 ? '' : 's'}
        {remote > 0 ? ` · ${remote} remote` : ''}
        {ready > 0 ? ` · ${ready} ready to process` : ''}
        {status.localQuarantineCount > 0 ? ` · ${status.localQuarantineCount} quarantined` : ''}
        {' →'}
      </div>
    </button>
  )
}
