import React, { useEffect, useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { detectWeakAnchorsThisSession, shouldShowNudge, snoozeNudge, isNudgeSnoozed } from '../features/analytics/studyPerformanceTracking.js'

/** Real-time nudge: appears after every 3rd question or 2 wrong in a row. */
export default function InlineStudyNudge({ onDrill, objective }) {
  const [weakAnchor, setWeakAnchor] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const checkNudge = async () => {
      if (isNudgeSnoozed() || weakAnchor) return
      const should = await shouldShowNudge()
      if (should) {
        const weak = await detectWeakAnchorsThisSession()
        if (weak) {
          setWeakAnchor(weak)
          setVisible(true)
        }
      }
    }
    checkNudge()
  }, [objective, weakAnchor])

  if (!visible || !weakAnchor) return null

  const handleDrill = () => {
    setVisible(false)
    if (onDrill) onDrill(weakAnchor.objective)
  }

  const handleSnooze = () => {
    snoozeNudge()
    setVisible(false)
  }

  return (
    <div
      style={{
        padding: 12,
        marginTop: 12,
        borderRadius: 8,
        border: `1px solid ${COLORS.roseBorder}`,
        background: COLORS.roseDim,
        fontSize: 'var(--ccna-type-xs)',
        color: COLORS.silver,
        lineHeight: 1.5,
      }}
    >
      <div style={{ fontWeight: 600, color: COLORS.rose, marginBottom: 6 }}>
        ⚠️ Weak on {weakAnchor.objective} · {weakAnchor.reason === 'multiple_retries' ? `${weakAnchor.count} retries` : `${weakAnchor.count} wrong`}
      </div>
      <div style={{ marginBottom: 10, color: COLORS.silverMid }}>
        You're struggling with this objective. Drill it now to anchor the concepts?
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type='button'
          onClick={handleDrill}
          style={{ ...styles.primaryBtn, flex: 1, minHeight: 36, fontSize: 'var(--ccna-type-xs)' }}
        >
          Drill {weakAnchor.objective}
        </button>
        <button
          type='button'
          onClick={handleSnooze}
          style={{
            ...styles.secondaryBtn,
            flex: 1,
            minHeight: 36,
            fontSize: 'var(--ccna-type-xs)',
          }}
        >
          Not now
        </button>
      </div>
    </div>
  )
}
