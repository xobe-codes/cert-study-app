import React, { useEffect, useState } from 'react'
import { COLORS } from '../ui/appTheme.js'
import { getSessionInsights } from '../features/analytics/studyPerformanceTracking.js'

/** Session recap strip: shows real-time insights under "Your Progress". */
export default function SessionRecapStrip() {
  const [insights, setInsights] = useState(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await getSessionInsights()
      setInsights(data)
    }, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  if (!insights || insights.total < 3) return null

  const paceEmoji = insights.paceVsBaseline
    ? insights.paceVsBaseline > 20
      ? '🐢'
      : insights.paceVsBaseline < -10
        ? '⚡'
        : '✓'
    : '✓'

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 8,
        border: `1px solid ${COLORS.border}`,
        background: COLORS.surface,
        fontSize: 'var(--ccna-type-xs)',
        color: COLORS.silverMid,
        lineHeight: 1.6,
      }}
    >
      <button
        type='button'
        onClick={() => setCollapsed(!collapsed)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          textAlign: 'left',
          color: COLORS.silver,
          fontWeight: 600,
          fontSize: 'var(--ccna-type-xs)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: collapsed ? 0 : 10,
        }}
      >
        <span>TODAY'S INSIGHTS</span>
        <span style={{ fontSize: 12 }}>{collapsed ? '+' : '−'}</span>
      </button>

      {!collapsed && (
        <div style={{ paddingLeft: 0 }}>
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>Accuracy: {insights.accuracy}%</span>
            <span>{insights.correct}/{insights.total} correct</span>
          </div>

          {insights.paceVsBaseline !== null && (
            <div style={{ marginBottom: 8 }}>
              {paceEmoji} Pace: {Math.abs(insights.paceVsBaseline)}%{' '}
              {insights.paceVsBaseline > 0 ? 'slower' : 'faster'} than your baseline
            </div>
          )}

          {insights.confidenceGaps && insights.confidenceGaps.length > 0 && (
            <div style={{ padding: 8, background: COLORS.roseDim, borderRadius: 4, marginTop: 8 }}>
              <div style={{ fontWeight: 600, color: COLORS.rose, marginBottom: 4 }}>
                ⚠️ Confidence gap detected
              </div>
              <div style={{ fontSize: 'var(--ccna-type-micro)', color: COLORS.silverMid }}>
                You rated {insights.confidenceGaps.length} Q{insights.confidenceGaps.length > 1 ? 's' : ''} as "easy" but got{' '}
                {insights.confidenceGaps.length > 1 ? 'them' : 'it'} wrong. Recalibrate your confidence.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
