import React, { useState, useEffect } from 'react'
import { COLORS, styles, accentColors } from '../ui/appTheme.js'
import { hasCuratedReading } from '../data/ccnaCurated.js'
import {
  shouldSuggestStudyFirst,
  shouldSuggestRefreshStudy,
  resolveCoachStatus,
  isStudyCoachDismissedToday,
  dismissStudyCoachToday,
} from './studyCoach.js'

/**
 * Soft Study-first (unseen) or Refresh-Study (already studied) banner.
 * Dismissible for the rest of today — never blocks Practice.
 */
export default function StudyCoachBanner({
  objectiveId,
  progressEntry,
  onGoStudy,
  compact = false,
}) {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const d = await isStudyCoachDismissedToday(objectiveId)
      if (!cancelled) setDismissed(d)
    })()
    return () => { cancelled = true }
  }, [objectiveId])

  const hasReading = hasCuratedReading(objectiveId)
  const status = resolveCoachStatus(progressEntry)
  const showFirst = shouldSuggestStudyFirst({ status, hasReading, dismissed })
  const showRefresh = !showFirst && shouldSuggestRefreshStudy({ status, hasReading, dismissed })

  if (!showFirst && !showRefresh) return null

  async function dismiss() {
    setDismissed(true)
    await dismissStudyCoachToday(objectiveId)
  }

  const c = accentColors(showFirst ? 'sky' : 'purple')

  return (
    <div
      role="status"
      style={{
        position: 'relative',
        marginBottom: compact ? 8 : 10,
        padding: compact ? '8px 36px 8px 10px' : '10px 40px 10px 12px',
        borderRadius: 10,
        border: `1px solid ${c.border}`,
        background: c.dim,
      }}
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss for today"
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          background: 'none',
          border: 'none',
          color: COLORS.silverMid,
          fontSize: 'var(--ccna-type-lg)',
          cursor: 'pointer',
          lineHeight: 1,
          padding: 0,
          minWidth: 44,
          minHeight: 44,
        }}
      >
        ×
      </button>
      <p style={{
        margin: 0,
        fontSize: 'var(--ccna-type-sm)',
        color: COLORS.silver,
        lineHeight: 1.4,
        fontWeight: 600,
      }}>
        {showFirst
          ? 'Read Study first (2 min) — then Practice.'
          : 'Optional: Refresh Study (2 min) before more Practice.'}
      </p>
      {onGoStudy && (
        <button
          type="button"
          className="ccna-hover"
          onClick={onGoStudy}
          style={{
            ...styles.secondaryBtn,
            width: 'auto',
            marginTop: 8,
            marginBottom: 0,
            fontSize: 'var(--ccna-type-xs)',
            padding: '6px 12px',
            minHeight: 44,
            color: c.text,
            border: `1px solid ${c.border}`,
          }}
        >
          {showFirst ? 'Open Study →' : 'Refresh Study →'}
        </button>
      )}
    </div>
  )
}
