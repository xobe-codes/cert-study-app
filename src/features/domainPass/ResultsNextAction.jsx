import React from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'

/**
 * ResultsNextAction: Clear, context-aware next action guidance
 *
 * Changes based on pass/fail:
 * - PASS: "Ready for next domain" → Next domain button
 * - FAIL: "Fix and retake" → Study weak areas button
 *
 * Consolidates the scattered "Fix next" and "Weak topics" logic
 * into a single, focused next action path.
 */
export default function ResultsNextAction({
  passed,
  pct,
  weakObjectiveIds = [],
  topWeakId = null,
  onNextDomain = null,
  onStudyWeak = null,
  onRetake = null,
  isFocusSession = false,
}) {
  if (!onNextDomain && !onStudyWeak && !onRetake) {
    return null
  }

  // PASS: Offer next domain or review
  if (passed) {
    return (
      <div style={{ ...styles.card, marginBottom: 8 }}>
        <div
          style={{
            fontSize: 'var(--ccna-type-sm)',
            fontWeight: 600,
            color: COLORS.mint,
            marginBottom: 12,
          }}
        >
          ✓ Domain mastered — Ready for next
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {onNextDomain && (
            <button
              type="button"
              style={{
                ...styles.primaryBtn,
                background: COLORS.mint,
                borderColor: COLORS.mint,
              }}
              onClick={onNextDomain}
            >
              Practice next domain →
            </button>
          )}
          {onRetake && (
            <button
              type="button"
              style={{ ...styles.secondaryBtn, marginBottom: 0 }}
              onClick={onRetake}
            >
              Review this domain
            </button>
          )}
        </div>
      </div>
    )
  }

  // FAIL: Clear path to remediation
  return (
    <div style={{ ...styles.card, marginBottom: 8 }}>
      <div
        style={{
          fontSize: 'var(--ccna-type-sm)',
          fontWeight: 600,
          color: COLORS.rose,
          marginBottom: 12,
        }}
      >
        {pct}% — Fix and retake
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {weakObjectiveIds.length > 0 && onStudyWeak ? (
          <button
            type="button"
            style={{
              ...styles.primaryBtn,
              background: COLORS.rose,
              borderColor: COLORS.rose,
            }}
            onClick={onStudyWeak}
          >
            Study {weakObjectiveIds.length} weak area{weakObjectiveIds.length === 1 ? '' : 's'}
          </button>
        ) : null}
        {onRetake && (
          <button
            type="button"
            style={{
              ...styles.secondaryBtn,
              marginBottom: 0,
              borderColor: COLORS.roseBorder,
            }}
            onClick={onRetake}
          >
            Retake this domain
          </button>
        )}
      </div>
    </div>
  )
}
