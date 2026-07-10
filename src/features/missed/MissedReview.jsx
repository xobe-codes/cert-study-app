import React, { useState, useMemo } from 'react'
import { randomizeQuestionOrder } from '../../questionUtils.js'
import { COLORS, styles } from '../../ui/appTheme.js'
import { groupMissedByTrap, getMissedTrapInfo, isActionableMissedTrap } from '../../missed/missedTrapGroups.js'
import {
  findMissedBankIndex,
  missedReviewOptionRows,
  missedUserAttemptLabel,
} from '../../missed/missedDisplay.js'
import OverflowMarquee from '../../components/OverflowMarquee.jsx'
import StemReplayCTA from '../stemReplay/StemReplayCTA.jsx'
import StudyModeHeader from '../../components/StudyModeHeader.jsx'
import { QuizQuestionStem } from '../../components/QuizQuestionChrome.jsx'

function normalizeQuestionText(q) {
  return (q || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

export default function MissedReview({ missed, onBack, onRemove, onOpenExamTraps, onOpenTrapDrill, onOpenLab }) {
  const bank = Array.isArray(missed) ? missed : []
  const [revealedIdx, setRevealedIdx] = useState(null)
  const [trapFilter, setTrapFilter] = useState(null)
  const trapGroups = useMemo(() => groupMissedByTrap(bank), [bank])
  const items = useMemo(() => {
    const pool = trapFilter
      ? (trapGroups.find(g => g.trap === trapFilter)?.items || [])
      : bank
    return randomizeQuestionOrder(pool)
  }, [bank, trapFilter, trapGroups])

  if (bank.length === 0) {
    return (
      <div>
        <StudyModeHeader
          title="Missed Questions"
          onBack={onBack}
          subtitle="No missed questions saved. Nice work — they'll show up here whenever you answer a quiz question incorrectly."
        />
      </div>
    )
  }

  return (
    <div className="ccna-review-flow">
      <StudyModeHeader
        title="Missed Questions"
        onBack={onBack}
        subtitle={`${bank.length} question${bank.length === 1 ? '' : 's'} saved for review.`}
      />
      {trapGroups.length > 1 && (
        <div style={{ ...styles.card, marginBottom: 14, padding: 12 }}>
          <div style={{ ...styles.small, fontWeight: 700, marginBottom: 8 }}>Trap patterns ({trapGroups.length})</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <button
              type="button"
              style={{ ...styles.pill(trapFilter ? 'silver' : 'mint'), fontSize: 'var(--ccna-type-xs)', cursor: 'pointer', border: 'none' }}
              onClick={() => setTrapFilter(null)}
            >
              All ({bank.length})
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
      {items.map((m, idx) => {
        const optionRows = missedReviewOptionRows(m)
        const attempt = revealedIdx === idx ? missedUserAttemptLabel(m) : null
        return (
          <div key={`${m.objectiveId}-${normalizeQuestionText(m.question)}-${idx}`} style={styles.card}>
            <div style={{ ...styles.small, marginBottom: 6 }}>{m.objectiveId}</div>
            <QuizQuestionStem text={m.question} />
            <div style={{ marginTop: 10 }}>
              {optionRows.map((row, ci) => {
                const reveal = revealedIdx === idx
                const highlight = reveal && row.isAnswer
                return (
                  <div key={ci} style={{
                    padding: '10px 12px', borderRadius: 10, marginBottom: 6, fontSize: 'var(--ccna-type-sm)',
                    background: highlight ? COLORS.mintDim : COLORS.surface,
                    border: `1px solid ${highlight ? COLORS.mintBorder : COLORS.border}`,
                    color: highlight ? COLORS.mint : COLORS.silver,
                  }}>
                    {row.text}
                  </div>
                )
              })}
            </div>
            {revealedIdx === idx ? (
              <div style={{ marginTop: 4 }}>
                {attempt && (
                  <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.rose, marginBottom: 8, lineHeight: 1.5 }}>{attempt}</div>
                )}
                <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid, marginBottom: 8, lineHeight: 1.5 }}>{m.explanation}</div>
                {(() => {
                  const { trap, domainId } = getMissedTrapInfo(m)
                  if (!isActionableMissedTrap(trap)) return null
                  if (!onOpenTrapDrill && !onOpenExamTraps) return null
                  const shortTrap = trap.length > 52 ? `${trap.slice(0, 50)}…` : trap
                  return (
                    <>
                      {onOpenTrapDrill && (
                        <button
                          type="button"
                          style={{
                            ...styles.primaryBtn,
                            marginTop: 8,
                            marginBottom: onOpenExamTraps ? 0 : 8,
                          }}
                          onClick={() => onOpenTrapDrill({ trapLabel: trap, objectiveId: m.objectiveId })}
                        >
                          Drill this trap →
                        </button>
                      )}
                      {onOpenExamTraps && (
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
                      )}
                    </>
                  )
                })()}
                <StemReplayCTA questionId={m.questionId} onOpenLab={onOpenLab} />
                <button
                  style={{ ...styles.secondaryBtn, marginTop: 8 }}
                  onClick={() => {
                    const bankIdx = findMissedBankIndex(bank, m)
                    if (bankIdx >= 0) onRemove(bankIdx)
                  }}
                >
                  Mark as reviewed (remove)
                </button>
              </div>
            ) : (
              <button style={{ ...styles.secondaryBtn, marginTop: 4 }} onClick={() => setRevealedIdx(idx)}>Show answer</button>
            )}
          </div>
        )
      })}
    </div>
  )
}
