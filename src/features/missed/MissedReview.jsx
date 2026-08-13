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
import { QuizQuestionStem, CliModeBanner } from '../../components/QuizQuestionChrome.jsx'
import { handoffStudyFromWeakSignal } from '../study/batchHandoff.js'
import { MISSED_RETEST_PROVE_UNLOCK_MAX, dedupeMissedByQuestionId } from './missedRetestPool.js'

function normalizeQuestionText(q) {
  return (q || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

export default function MissedReview({
  missed,
  onBack,
  onRemove,
  onOpenExamTraps,
  onOpenTrapDrill,
  onOpenLab,
  onSelectObjective,
  onStartRetest,
  placementRecords = {},
  progress = {},
}) {
  // Stable reference so the useMemo hooks below that depend on `bank` don't
  // recompute every render — `missed` is falsy between loads, and a fresh []
  // literal on every render would defeat their memoization entirely.
  const bank = useMemo(() => (Array.isArray(missed) ? missed : []), [missed])
  // MISSED_RETEST_PROVE_UNLOCK_MAX's contract is "once the deduped missed
  // bank shrinks to this size" — the raw bank can hold two rows for one
  // question (write-time dedup only blocks a duplicate when questionId AND
  // objectiveId both match; the same question re-recorded under a second
  // objectiveId isn't caught), so gating on bank.length could keep "Prove
  // it" locked past the point its own threshold says it should unlock.
  // PracticeRoutes.jsx already computes the equivalent quantity this way.
  const proveItGateCount = useMemo(() => dedupeMissedByQuestionId(bank).length, [bank])
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
      {onStartRetest && (
        <div style={{ ...styles.card, marginBottom: 14, padding: 12 }}>
          <div style={{ ...styles.small, fontWeight: 700, marginBottom: 8 }}>Retest{trapFilter ? ` — ${trapFilter}` : ''}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button
              type="button"
              style={{ ...styles.primaryBtn, flex: '1 1 auto', marginBottom: 0 }}
              onClick={() => onStartRetest('clear', trapFilter)}
            >
              Clear queue →
            </button>
            <button
              type="button"
              style={{
                ...styles.secondaryBtn,
                flex: '1 1 auto',
                marginBottom: 0,
                opacity: proveItGateCount > MISSED_RETEST_PROVE_UNLOCK_MAX ? 0.55 : 1,
              }}
              disabled={proveItGateCount > MISSED_RETEST_PROVE_UNLOCK_MAX}
              title={proveItGateCount > MISSED_RETEST_PROVE_UNLOCK_MAX
                ? `Unlocks once your missed bank is ${MISSED_RETEST_PROVE_UNLOCK_MAX} or fewer (currently ${proveItGateCount})`
                : undefined}
              onClick={() => onStartRetest('prove', trapFilter)}
            >
              Prove it →
            </button>
          </div>
          {proveItGateCount > MISSED_RETEST_PROVE_UNLOCK_MAX && (
            <div style={{ ...styles.small, marginTop: 8, color: COLORS.silverMid }}>
              Prove it unlocks at {MISSED_RETEST_PROVE_UNLOCK_MAX} or fewer missed — clear the queue a few times to get there.
            </div>
          )}
        </div>
      )}
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
            {(m.type === 'cli' || m.cliPrompt) && <div style={{ marginTop: 8 }}><CliModeBanner question={m} compact /></div>}
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
                <StemReplayCTA questionId={m.questionId} objectiveId={m.objectiveId} ckuIds={m.ckuIds} trapId={m.diagnosis?.trapId} onOpenLab={onOpenLab} />
                {onSelectObjective && m.objectiveId && (
                  <button
                    type="button"
                    style={{ ...styles.primaryBtn, marginTop: 8 }}
                    onClick={() => handoffStudyFromWeakSignal(m.objectiveId, {
                      missed: bank,
                      placementRecords,
                      progress,
                      onSelectObjective,
                    })}
                  >
                    Study weak batch →
                  </button>
                )}
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
