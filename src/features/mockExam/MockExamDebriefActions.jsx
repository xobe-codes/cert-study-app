import React from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import { getStemReplayLab } from '../stemReplay/stemReplayLabs.js'
import { resolveTrapDrillCku } from '../trapDrill/trapDrillQuestions.js'
import { handoffStudyFromWeakSignal, handoffPassFocusBatch } from '../study/batchHandoff.js'

function replayPriority(objectiveId) {
  if (!objectiveId) return 3
  if (objectiveId.startsWith('3.')) return 0
  if (objectiveId.startsWith('5.')) return 1
  return 2
}

function trapObjectiveId(trap) {
  return trap?.objectiveIds?.[0] || null
}

function openStudy(objectiveId, {
  missed,
  placementRecords,
  progress,
  onSelectObjective,
}) {
  if (!objectiveId || !onSelectObjective) return
  handoffStudyFromWeakSignal(objectiveId, {
    missed,
    placementRecords,
    progress,
    onSelectObjective,
  })
}

/** Post-mock CTAs — weak domains, trap drill, stem-replay lab, and objective deep-links. */
export default function MockExamDebriefActions({
  report,
  questions,
  responses,
  domains,
  missed = [],
  placementRecords = {},
  progress = {},
  onOpenTrapDrill,
  onOpenLab,
  onStudyDomain,
  onSelectObjective,
  onOpenDomainPass,
}) {
  if (!report) return null

  function weakestObjectiveInDomain(domainId) {
    const domain = domains.find(d => d.id === domainId)
    if (!domain) return null
    const stats = {}
    for (const o of domain.objectives) stats[o.id] = { correct: 0, total: 0 }
    questions.forEach((q, idx) => {
      const oid = q.objectiveId
      if (!oid || !stats[oid]) return
      stats[oid].total++
      if (responses[idx] === q.correctIndex) stats[oid].correct++
    })
    const ranked = Object.entries(stats)
      .filter(([, s]) => s.total > 0)
      .map(([id, s]) => ({ id, pct: s.correct / s.total }))
      .sort((a, b) => a.pct - b.pct)
    return ranked[0]?.id || domain.objectives[0]?.id
  }

  const weakDomains = domains
    .map(d => {
      const r = report.byDomain[d.id]
      if (!r || r.total < 2) return null
      const pct = Math.round((r.correct / r.total) * 100)
      return pct < 70 ? { ...d, pct, correct: r.correct, total: r.total } : null
    })
    .filter(Boolean)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3)

  const trapItems = (report.trapDebrief || []).slice(0, 4)

  const firstWrongIdx = questions.findIndex((q, idx) => {
    const sel = responses[idx]
    return sel != null && sel !== q.correctIndex
  })
  const firstWrong = firstWrongIdx >= 0 ? questions[firstWrongIdx] : null
  const stemReplay = firstWrong ? getStemReplayLab(firstWrong.id, firstWrong) : null

  const wrongStemReplays = questions
    .map((q, idx) => {
      const sel = responses[idx]
      if (sel == null || sel === q.correctIndex) return null
      const replay = getStemReplayLab(q.id, q)
      if (!replay) return null
      return { questionId: q.id, objectiveId: q.objectiveId, ...replay }
    })
    .filter(Boolean)
    .sort((a, b) => replayPriority(a.objectiveId) - replayPriority(b.objectiveId))
    .filter((item, idx, arr) => arr.findIndex(x => x.labId === item.labId) === idx)
    .slice(0, 4)

  const weakDomainLabReplays = weakDomains.map(d => {
    const oid = weakestObjectiveInDomain(d.id)
    if (!oid) return null
    const wrongQ = questions.find((q, idx) => {
      if (q.objectiveId !== oid) return false
      const sel = responses[idx]
      return sel != null && sel !== q.correctIndex
    })
    const replay = wrongQ ? getStemReplayLab(wrongQ.id, wrongQ) : null
    return replay ? { domainId: d.id, ...replay } : null
  }).filter(Boolean)

  if (!weakDomains.length && !trapItems.length && !stemReplay && !wrongStemReplays.length && !weakDomainLabReplays.length) return null

  const btnCompact = {
    ...styles.secondaryBtn,
    width: '100%',
    textAlign: 'left',
    fontSize: 'var(--ccna-type-sm)',
    padding: '8px 10px',
  }

  const studyCtx = { missed, placementRecords, progress, onSelectObjective }

  return (
    <div className="ccna-mock-debrief" style={{ ...styles.card, marginBottom: 8, border: `1px solid ${COLORS.skyBorder}`, background: COLORS.skyDim }}>
      <h2 className="ccna-mock-debrief__title" style={{ ...styles.h2, color: COLORS.sky, marginBottom: 4 }}>Next steps</h2>
      <p className="ccna-mock-debrief__lead" style={{ ...styles.small, marginBottom: 8, color: COLORS.silver }}>
        Target weak domains, exam traps, and hands-on verify labs from this session.
      </p>

      {trapItems.length > 0 && (
        <div className="ccna-trap-debrief" style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.amber, marginBottom: 6, letterSpacing: 0.3 }}>
            Trap patterns you missed
          </div>
          <ul className="ccna-trap-debrief__list" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {trapItems.map((t, i) => {
              const oid = trapObjectiveId(t)
              const trapCku = resolveTrapDrillCku({ trapLabel: t.trap })
              return (
                <li key={`${t.trap}-${i}`} className="ccna-trap-debrief__item" style={{ marginBottom: 6, padding: '8px 10px', borderRadius: 8, background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, lineHeight: 1.4 }}>
                    <strong>{t.trap}</strong>
                    <span style={{ color: COLORS.silverMid }}> — {t.count} miss{t.count === 1 ? '' : 'es'}</span>
                    {oid ? <span style={{ color: COLORS.silverMid }}> · {oid}</span> : null}
                  </div>
                  <div className="ccna-mock-debrief__actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                    {oid && onSelectObjective && (
                      <button type="button" style={{ ...btnCompact, width: 'auto', flex: '1 1 140px' }} onClick={() => openStudy(oid, studyCtx)}>
                        Study {oid} →
                      </button>
                    )}
                    {trapCku && onOpenTrapDrill && (
                      <button
                        type="button"
                        style={{ ...btnCompact, width: 'auto', flex: '1 1 140px', borderColor: COLORS.amberBorder, color: COLORS.amber }}
                        onClick={() => onOpenTrapDrill({ ckuId: trapCku.ckuId, trapLabel: trapCku.trapLabel })}
                      >
                        Drill trap →
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="ccna-mock-debrief__actions" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {weakDomains.map(d => (
          <div key={d.id} className="ccna-mock-debrief__domain" style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 4 }}>
            <button
              type="button"
              style={btnCompact}
              onClick={() => {
                const oid = weakestObjectiveInDomain(d.id)
                if (oid && onSelectObjective) openStudy(oid, studyCtx)
                else onStudyDomain?.(d.id)
              }}
            >
              Study {d.name} — {d.correct}/{d.total} ({d.pct}%)
            </button>
            {onOpenDomainPass && (
              <button
                type="button"
                style={{ ...btnCompact, borderColor: COLORS.purpleBorder, color: COLORS.purple }}
                onClick={() => handoffPassFocusBatch(d.id, {
                  missed,
                  placementRecords,
                  progress,
                  onOpenDomainPass,
                })}
              >
                Pass Focus · {d.name} →
              </button>
            )}
            {onSelectObjective && (() => {
              const oid = weakestObjectiveInDomain(d.id)
              if (!oid) return null
              return (
                <button type="button" style={btnCompact} onClick={() => openStudy(oid, studyCtx)}>
                  Weakest topic {oid} →
                </button>
              )
            })()}
            {(() => {
              const domainReplay = weakDomainLabReplays.find(r => r.domainId === d.id)
              if (!domainReplay || !onOpenLab) return null
              return (
                <button type="button" style={btnCompact} onClick={() => onOpenLab(domainReplay.labId)}>
                  Lab · {domainReplay.lab.title}
                </button>
              )
            })()}
          </div>
        ))}
      </div>

      {wrongStemReplays.length > 0 && onOpenLab && (
        <div className="ccna-mock-debrief__labs" style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
          {wrongStemReplays.map(replay => (
            <button
              key={`${replay.questionId}-${replay.labId}`}
              type="button"
              style={btnCompact}
              onClick={() => onOpenLab(replay.labId)}
            >
              Lab replay {replay.objectiveId ? `(${replay.objectiveId})` : ''} → {replay.lab.title}
            </button>
          ))}
        </div>
      )}
      {!wrongStemReplays.length && stemReplay && onOpenLab && (
        <button type="button" style={{ ...btnCompact, marginTop: 6 }} onClick={() => onOpenLab(stemReplay.labId)}>
          Lab replay → {stemReplay.lab.title}
        </button>
      )}
    </div>
  )
}
