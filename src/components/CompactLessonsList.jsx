import React from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { homeBodySm } from '../home/homeUi.js'

/**
 * CompactLessonsList: Replace large lesson cards with efficient 1-line rows.
 *
 * Reduces space from 350px (4 lessons) to 200px while showing all lessons
 * at a glance + status badges + quick-jump buttons.
 *
 * Freed space: 150px = room for more content or Traps section visibility
 */
export default function CompactLessonsList({
  lessons = [],              // [{id, status, hasLab}, ...]
  nextObjectiveId = null,    // Highlight this one
  onStudy,                   // (objectiveId) => startStudy
  onQuickCheck,              // (objectiveId) => start5Q
  onOpenLab,                 // (objectiveId) => openCLILab
}) {
  if (!lessons || lessons.length === 0) return null

  const statusConfig = {
    unseen: { color: COLORS.silverMid, label: 'Unseen' },
    in_progress: { color: COLORS.amber, label: 'In Progress' },
    weak: { color: COLORS.rose, label: 'Weak' },
    mastered: { color: COLORS.mint, label: 'Mastered' },
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Header with lesson count */}
      <div style={{
        fontSize: 'var(--ccna-type-xs)',
        fontWeight: 700,
        color: COLORS.silverMid,
        letterSpacing: 0.3,
        marginBottom: 8,
      }}>
        LESSONS ({lessons.length})
      </div>

      {/* Compact lesson list */}
      <div style={{ border: `1px solid ${COLORS.cardBorder}`, borderRadius: 8, overflow: 'hidden' }}>
        {lessons.map((lesson, idx) => {
          const status = statusConfig[lesson.status] || statusConfig.unseen
          const isNext = lesson.id === nextObjectiveId

          return (
            <div
              key={lesson.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderBottom: idx < lessons.length - 1 ? `1px solid ${COLORS.cardBorder}` : 'none',
                minHeight: 44,
                background: isNext ? COLORS.skyDim : 'transparent',
                borderLeft: isNext ? `3px solid ${COLORS.sky}` : 'none',
                paddingLeft: isNext ? 9 : 12,
              }}
            >
              {/* Objective ID + Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span style={{
                  fontSize: 'var(--ccna-type-sm)',
                  fontWeight: 600,
                  color: isNext ? COLORS.sky : COLORS.text,
                }}>
                  {lesson.id}
                </span>
                <span style={{
                  fontSize: 'var(--ccna-type-xs)',
                  color: status.color,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}>
                  · {status.label}
                </span>
              </div>

              {/* Button cluster */}
              <div style={{
                display: 'flex',
                gap: 4,
                marginLeft: 8,
                flexShrink: 0,
              }}>
                <button
                  type="button"
                  onClick={() => onStudy?.(lesson.id)}
                  style={{
                    ...styles.secondaryBtn,
                    marginBottom: 0,
                    padding: '6px 10px',
                    fontSize: 'var(--ccna-type-micro)',
                    fontWeight: 600,
                    minHeight: 32,
                    background: COLORS.cardBg,
                    border: `1px solid ${COLORS.cardBorder}`,
                    cursor: 'pointer',
                    borderRadius: 4,
                  }}
                  title={`Study ${lesson.id}`}
                >
                  Study
                </button>
                <button
                  type="button"
                  onClick={() => onQuickCheck?.(lesson.id)}
                  style={{
                    ...styles.secondaryBtn,
                    marginBottom: 0,
                    padding: '6px 10px',
                    fontSize: 'var(--ccna-type-micro)',
                    fontWeight: 600,
                    minHeight: 32,
                    background: COLORS.cardBg,
                    border: `1px solid ${COLORS.cardBorder}`,
                    cursor: 'pointer',
                    borderRadius: 4,
                  }}
                  title={`Quick check (5Q) for ${lesson.id}`}
                >
                  5Q
                </button>
                {lesson.hasLab && (
                  <button
                    type="button"
                    onClick={() => onOpenLab?.(lesson.id)}
                    style={{
                      ...styles.secondaryBtn,
                      marginBottom: 0,
                      padding: '6px 10px',
                      fontSize: 'var(--ccna-type-micro)',
                      fontWeight: 600,
                      minHeight: 32,
                      background: COLORS.cardBg,
                      border: `1px solid ${COLORS.cardBorder}`,
                      cursor: 'pointer',
                      borderRadius: 4,
                    }}
                    title={`Lab for ${lesson.id}`}
                  >
                    Lab
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
