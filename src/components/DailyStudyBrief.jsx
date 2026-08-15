import React, { useEffect, useState } from 'react'
import { COLORS } from '../ui/appTheme.js'
import { STORAGE_KEYS } from '../storageKeys.js'

/** Phase 4: Daily study brief - morning summary with recommendations. */
export default function DailyStudyBrief({ onDismiss }) {
  const [brief, setBrief] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const checkBrief = async () => {
      const lastShown = await window.storage?.getItem('_daily_brief_shown')
      const today = new Date().toDateString()
      if (lastShown === today || dismissed) return

      const all = (await window.storage?.getItem(STORAGE_KEYS.studyPerformance)) || []
      const yesterday = Date.now() - 24 * 60 * 60 * 1000
      const yesterdayEvents = all.filter(e => e.timestamp > yesterday && e.timestamp < Date.now())

      if (yesterdayEvents.length < 5) return

      const wrong = yesterdayEvents.filter(e => !e.correct).length
      const objectives = [...new Set(yesterdayEvents.map(e => e.objective))]
      const weak = objectives.filter(
        obj => yesterdayEvents.filter(e => e.objective === obj && !e.correct).length >= 2
      ).slice(0, 3)

      const avgTime = Math.round(
        yesterdayEvents.reduce((s, e) => s + (e.timeMs || 0), 0) / yesterdayEvents.length
      )

      setBrief({
        sessionCount: yesterdayEvents.length,
        wrongCount: wrong,
        weakObjectives: weak,
        avgTimeMs: avgTime,
      })

      await window.storage?.setItem('_daily_brief_shown', today)
    }

    checkBrief()
  }, [dismissed])

  if (!brief || dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    if (onDismiss) onDismiss()
  }

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        border: '1px solid ' + COLORS.border,
        background: COLORS.surface,
        fontSize: 'var(--ccna-type-xs)',
        color: COLORS.silver,
        lineHeight: 1.6,
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: 'var(--ccna-type-sm)', color: COLORS.sky }}>
          📋 TODAY'S STUDY BRIEF
        </h3>
        <button
          type='button'
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: COLORS.silverMid,
            cursor: 'pointer',
            fontSize: '18px',
            padding: 0,
            minWidth: 'auto',
            minHeight: 'auto',
          }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid ' + COLORS.border }}>
        <div style={{ marginBottom: 6, color: COLORS.silverMid }}>
          Yesterday: <strong style={{ color: COLORS.silver }}>{brief.sessionCount} questions</strong> · Pace <strong style={{ color: COLORS.silver }}>{Math.round(brief.avgTimeMs / 1000)}s/q</strong>
        </div>
        <div style={{ color: COLORS.silverMid }}>
          Accuracy: <strong style={{ color: COLORS.silver }}>{Math.round(((brief.sessionCount - brief.wrongCount) / brief.sessionCount) * 100)}%</strong> ({brief.wrongCount} wrong)
        </div>
      </div>

      {brief.weakObjectives.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 600, color: COLORS.rose, marginBottom: 6 }}>
            ⚠️ WEAK FROM YESTERDAY
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {brief.weakObjectives.map(obj => (
              <div
                key={obj}
                style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  background: COLORS.roseDim,
                  fontSize: 'var(--ccna-type-micro)',
                  color: COLORS.rose,
                  fontWeight: 600,
                }}
              >
                {obj}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: 'var(--ccna-type-micro)', color: COLORS.silverMid, fontStyle: 'italic' }}>
        Recommendation: Drill weak anchors first, then mock on mastered domains.
      </div>
    </div>
  )
}
