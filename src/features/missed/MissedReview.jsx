import React, { useState, useMemo } from 'react'
import { randomizeQuestionOrder } from '../../questionUtils.js'
import { COLORS, styles } from '../../ui/appTheme.js'
import { groupMissedByTrap, getMissedTrapInfo, isActionableMissedTrap } from '../../missed/missedTrapGroups.js'
import OverflowMarquee from '../../components/OverflowMarquee.jsx'

function normalizeQuestionText(q) {
  return (q || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

export default function MissedReview({ missed, onBack, onRemove, onOpenExamTraps }) {
  const [revealedIdx, setRevealedIdx] = useState(null)
  const [trapFilter, setTrapFilter] = useState(null)
  const trapGroups = useMemo(() => groupMissedByTrap(missed), [missed])
  const items = useMemo(() => {
    const pool = trapFilter
      ? (trapGroups.find(g => g.trap === trapFilter)?.items || [])
      : missed
    return randomizeQuestionOrder(pool)
  }, [missed, trapFilter, trapGroups])

  if (missed.length === 0) {
    return (
      <div>
        <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <h1 style={styles.h1}>Missed Questions</h1>
        <p style={styles.small}>No missed questions saved. Nice work — they'll show up here whenever you answer a quiz question incorrectly.</p>
      </div>
    )
  }

  return (
    <div>
      <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <h1 style={styles.h1}>Missed Questions</h1>
      <p style={{ ...styles.small, marginBottom: 14 }}>{missed.length} question{missed.length === 1 ? '' : 's'} saved for review.</p>
      {trapGroups.length > 1 && (
        <div style={{ ...styles.card, marginBottom: 14, padding: 12 }}>
          <div style={{ ...styles.small, fontWeight: 700, marginBottom: 8 }}>Trap patterns ({trapGroups.length})</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <button
              type="button"
              style={{ ...styles.pill(trapFilter ? 'silver' : 'mint'), fontSize: 'var(--ccna-type-xs)', cursor: 'pointer', border: 'none' }}
              onClick={() => setTrapFilter(null)}
            >
              All ({missed.length})
            </button>
            {trapGroups.slice(0, 8).map(g => (
              <button
                key={g.trap}
                type="button"
                style={{ ...styles.pill(trapFilter === g.trap ? 'mint' : 'silver'), fontSize: 'var(--ccna-type-xs)', cursor: 'pointer', border: 'none', maxWidth: '100%' }}
                onClick={() => setTrapFilter(trapFilter === g.trap ? null : g.trap)}
                title={g.trap}
              >
                <OverflowMarquee text={`${g.trap} (${g.count})`} style={{ fontSize: 'var(--ccna-type-xs)' }} />
              </button>
            ))}
          </div>
        </div>
      )}
      {items.map((m, idx) => (
        <div key={`${m.objectiveId}-${normalizeQuestionText(m.question)}-${idx}`} style={styles.card}>
          <div style={{ ...styles.small, marginBottom: 6 }}>{m.objectiveId}</div>
          <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 10, lineHeight: 1.5 }}>{m.question}</div>
          {m.choices.map((c, ci) => {
            const isAnswer = ci === m.correctIndex
            const reveal = revealedIdx === idx
            return (
              <div key={ci} style={{
                padding: '10px 12px', borderRadius: 10, marginBottom: 6, fontSize: 'var(--ccna-type-sm)',
                background: reveal && isAnswer ? COLORS.mintDim : COLORS.surface,
                border: `1px solid ${reveal && isAnswer ? COLORS.mintBorder : COLORS.border}`,
                color: reveal && isAnswer ? COLORS.mint : COLORS.silver,
              }}>
                {c}
              </div>
            )
          })}
          {revealedIdx === idx ? (
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid, marginBottom: 8, lineHeight: 1.5 }}>{m.explanation}</div>
              {(() => {
                const { trap, domainId } = getMissedTrapInfo(m)
                if (!onOpenExamTraps || !isActionableMissedTrap(trap)) return null
                const shortTrap = trap.length > 52 ? `${trap.slice(0, 50)}…` : trap
                return (
                  <button
                    type="button"
                    style={{
                      ...styles.primaryBtn,
                      marginTop: 8,
                      marginBottom: 8,
                      background: COLORS.amberDim,
                      borderColor: COLORS.amberBorder,
                      color: COLORS.amber,
                    }}
                    onClick={() => onOpenExamTraps({ domainId, trapLabel: trap, objectiveId: m.objectiveId })}
                  >
                    Study exam trap: {shortTrap} →
                  </button>
                )
              })()}
              <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={() => onRemove(missed.indexOf(m))}>Mark as reviewed (remove)</button>
            </div>
          ) : (
            <button style={{ ...styles.secondaryBtn, marginTop: 4 }} onClick={() => setRevealedIdx(idx)}>Show answer</button>
          )}
        </div>
      ))}
    </div>
  )
}
