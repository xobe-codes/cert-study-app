import React, { useEffect, useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { detectWeakAnchorsThisSession, isNudgeSnoozed, snoozeNudge } from '../features/analytics/studyPerformanceTracking.js'

/** Phase 2: Sticky weak anchor banner - appears when concept missed 2x. */
export default function WeakAnchorFlashCard({ onDrill, objective }) {
  const [weakAnchor, setWeakAnchor] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const checkWeak = async () => {
      if (isNudgeSnoozed() || !objective) return
      const weak = await detectWeakAnchorsThisSession()
      if (weak && weak.reason === 'multiple_wrong' && weak.count >= 2) {
        setWeakAnchor(weak)
        setVisible(true)
      }
    }
    checkWeak()
  }, [objective])

  if (!visible || !weakAnchor) return null

  const handleDrill = () => {
    setVisible(false)
    if (onDrill) onDrill(weakAnchor.objective)
  }

  const handleDismiss = () => {
    snoozeNudge()
    setVisible(false)
  }

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: 12,
        borderRadius: 0,
        border: '2px solid ' + COLORS.rose,
        borderLeft: '6px solid ' + COLORS.rose,
        background: COLORS.roseDim,
        fontSize: 'var(--ccna-type-xs)',
        color: COLORS.silver,
        lineHeight: 1.5,
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: COLORS.rose, marginBottom: 4 }}>
            🎯 WEAK ANCHOR DETECTED
          </div>
          <div style={{ marginBottom: 6, color: COLORS.silverMid }}>
            You have missed {weakAnchor.count}x on {weakAnchor.objective}. This anchor appears in related questions too.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type='button'
              onClick={handleDrill}
              style={{ ...styles.primaryBtn, minHeight: 32, fontSize: 'var(--ccna-type-xs)', padding: '6px 12px' }}
            >
              ✓ Drill it
            </button>
            <button
              type='button'
              onClick={handleDismiss}
              style={{
                ...styles.secondaryBtn,
                minHeight: 32,
                fontSize: 'var(--ccna-type-xs)',
                padding: '6px 12px',
              }}
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
