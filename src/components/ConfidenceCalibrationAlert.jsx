import React, { useEffect, useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { getSessionInsights } from '../features/analytics/studyPerformanceTracking.js'

/** Phase 3: Confidence calibration alert - accuracy doesn't match rating. */
export default function ConfidenceCalibrationAlert({ onDismiss }) {
  const [alert, setAlert] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const checkCalibration = async () => {
      const insights = await getSessionInsights()
      if (!insights || dismissed) return

      if (insights.confidenceGaps && insights.confidenceGaps.length >= 2) {
        setAlert({
          gapCount: insights.confidenceGaps.length,
          accuracy: insights.accuracy,
        })
      }
    }

    const interval = setInterval(checkCalibration, 10000)
    checkCalibration()
    return () => clearInterval(interval)
  }, [dismissed])

  if (!alert || dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    if (onDismiss) onDismiss()
  }

  return (
    <div
      style={{
        padding: 12,
        marginBottom: 12,
        borderRadius: 8,
        border: '1px solid ' + COLORS.skyBorder,
        background: COLORS.skyDim,
        fontSize: 'var(--ccna-type-xs)',
        color: COLORS.silver,
        lineHeight: 1.5,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: COLORS.sky, marginBottom: 6 }}>
            📊 CONFIDENCE GAP
          </div>
          <div style={{ marginBottom: 8, color: COLORS.silverMid }}>
            You rated {alert.gapCount} question{alert.gapCount > 1 ? 's' : ''} as easy but got {alert.gapCount > 1 ? 'them' : 'it'} wrong ({alert.accuracy}% accuracy this session).
          </div>
          <div style={{ fontSize: 'var(--ccna-type-micro)', color: COLORS.silverMid }}>
            Your confidence is higher than your actual performance. Review those concepts.
          </div>
        </div>
        <button
          type='button'
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: COLORS.silverMid,
            cursor: 'pointer',
            fontSize: '20px',
            padding: 0,
            minWidth: 'auto',
            minHeight: 'auto',
          }}
        >
          ×
        </button>
      </div>
    </div>
  )
}
