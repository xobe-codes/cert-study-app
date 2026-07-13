import React from 'react'
import { COLORS, styles } from '../ui/appTheme.js'

/**
 * Post-Practice Secondary Tools (Option B)
 *
 * Appears after user completes practice session. Offers contextual access to:
 * - Trap Drill (master problem areas)
 * - Domain Pass (full domain assessment)
 * - Mock Exam (realistic full-length test)
 *
 * Rationale: Tools appear when user knows what to work on, not anticipatorily
 * upfront. Keeps domain view clean while providing easy access when needed.
 */
export default function PostPracticeSecondaryTools({
  objectiveId = null,
  domainId = null,
  score = 0,        // 0-100
  onOpenTrapDrill,
  onOpenDomainPass,
  onOpenMockExam,
}) {
  if (!onOpenTrapDrill && !onOpenDomainPass && !onOpenMockExam) {
    return null
  }

  const toolBtn = {
    ...styles.secondaryBtn,
    width: '100%',
    textAlign: 'left',
    fontSize: 'var(--ccna-type-sm)',
    padding: '8px 10px',
    marginBottom: 6,
  }

  // Only show if they didn't master it (score < 90%)
  const showTools = score < 90

  if (!showTools) {
    return null
  }

  return (
    <div style={{
      ...styles.card,
      marginTop: 8,
      marginBottom: 8,
      border: `1px solid ${COLORS.mintBorder}`,
      background: COLORS.mintDim,
    }}>
      <div style={{
        fontSize: 'var(--ccna-type-xs)',
        fontWeight: 700,
        color: COLORS.mint,
        marginBottom: 8,
        letterSpacing: 0.3,
      }}>
        Want more practice?
      </div>

      {onOpenTrapDrill && (
        <button
          type="button"
          style={toolBtn}
          onClick={() => onOpenTrapDrill?.({ objectiveId, domainId })}
        >
          Trap Drill → Master problem areas
        </button>
      )}

      {onOpenDomainPass && (
        <button
          type="button"
          style={toolBtn}
          onClick={() => onOpenDomainPass?.({ domainId, focusObjectiveIds: objectiveId ? [objectiveId] : [] })}
        >
          Domain Pass → Prove mastery
        </button>
      )}

      {onOpenMockExam && (
        <button
          type="button"
          style={{ ...toolBtn, marginBottom: 0 }}
          onClick={() => onOpenMockExam?.({ domainId, mode: 'bankburn' })}
        >
          Mock Exam → Full assessment
        </button>
      )}
    </div>
  )
}
