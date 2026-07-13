import React, { useState } from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import { DOMAINS } from '../../data/ccnaDomains.js'

/**
 * WeakAreasCompact: Show top 3 weak objectives with miss counts
 *
 * Replaces the "Weak topics — Study first" section which showed
 * every single weak objective as an individual button (overwhelming).
 *
 * Shows:
 * - Top 3 weak areas ranked by miss frequency
 * - Miss count for context
 * - Single action button to study them
 * - "See all" link if more than 3 weak areas
 */
export default function WeakAreasCompact({
  domainId,
  weakObjectiveIds = [],
  responses = {},
  questions = [],
  onSelectObjective,
}) {
  const [showAll, setShowAll] = useState(false)

  if (!weakObjectiveIds.length || !onSelectObjective) {
    return null
  }

  // Calculate miss count per objective
  const domain = DOMAINS.find(d => d.id === domainId)
  const missCountByObjective = {}

  weakObjectiveIds.forEach(oid => {
    missCountByObjective[oid] = 0
  })

  // Count misses from responses
  questions.forEach((q, idx) => {
    if (!weakObjectiveIds.includes(q.objectiveId)) return
    const selected = responses[idx]
    if (selected !== undefined && !isCorrectResponse(q, selected)) {
      missCountByObjective[q.objectiveId] = (missCountByObjective[q.objectiveId] || 0) + 1
    }
  })

  // Sort by miss count descending
  const sorted = [...weakObjectiveIds].sort(
    (a, b) => (missCountByObjective[b] || 0) - (missCountByObjective[a] || 0)
  )

  const displayed = showAll ? sorted : sorted.slice(0, 3)
  const hasMore = sorted.length > 3 && !showAll

  return (
    <div
      style={{
        ...styles.card,
        marginBottom: 8,
        border: `1px solid ${COLORS.roseBorder}`,
        background: COLORS.roseDim,
      }}
    >
      <div
        style={{
          fontSize: 'var(--ccna-type-xs)',
          fontWeight: 700,
          color: COLORS.rose,
          marginBottom: 8,
          letterSpacing: 0.3,
        }}
      >
        Weak areas ({displayed.length} of {sorted.length})
      </div>

      {/* Compact list view */}
      <div style={{ marginBottom: 12 }}>
        {displayed.map(oid => {
          const obj = domain?.objectives.find(o => o.id === oid)
          const missCount = missCountByObjective[oid] || 0
          return (
            <div
              key={oid}
              style={{
                fontSize: 'var(--ccna-type-sm)',
                color: COLORS.text,
                marginBottom: 4,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontWeight: 600 }}>• {oid}</span>
                {obj?.title && (
                  <span style={{ color: COLORS.silverMid, marginLeft: 8 }}>
                    — {obj.title}
                  </span>
                )}
              </div>
              {missCount > 0 && (
                <span style={{ color: COLORS.rose, fontSize: 'var(--ccna-type-xs)' }}>
                  {missCount} miss{missCount === 1 ? '' : 'es'}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Show all toggle */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          style={{
            background: 'transparent',
            border: 'none',
            color: COLORS.rose,
            cursor: 'pointer',
            fontSize: 'var(--ccna-type-xs)',
            fontWeight: 600,
            padding: 0,
            marginBottom: 8,
          }}
        >
          See all {sorted.length} weak areas →
        </button>
      )}

      {/* Action buttons */}
      <button
        type="button"
        style={{
          ...styles.secondaryBtn,
          width: '100%',
          textAlign: 'center',
          fontSize: 'var(--ccna-type-sm)',
          marginBottom: 0,
          marginTop: hasMore || showAll ? 4 : 0,
          background: COLORS.rose,
          borderColor: COLORS.rose,
          color: '#fff',
          fontWeight: 600,
        }}
        onClick={() => {
          onSelectObjective({
            ...{ id: sorted[0] },
            __mode: 'domainPassWeakStudy',
            __weakObjectiveIds: sorted,
          })
        }}
      >
        Study weak areas
      </button>
    </div>
  )
}

// Helper: Check if response is correct
function isCorrectResponse(question, selected) {
  if (!question) return false
  const correct = question.correctChoice
  if (typeof selected === 'number') {
    return selected === correct
  }
  if (Array.isArray(selected)) {
    const correctSet = new Set(Array.isArray(correct) ? correct : [correct])
    return selected.length === correctSet.size && selected.every(s => correctSet.has(s))
  }
  return false
}
