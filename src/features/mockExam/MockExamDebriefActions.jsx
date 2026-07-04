import React from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import { getStemReplayLab } from '../stemReplay/stemReplayLabs.js'
import { resolveTrapDrillCku } from '../trapDrill/trapDrillQuestions.js'

/** Post-mock CTAs — weak domains, trap drill, stem-replay lab, and objective deep-links. */
export default function MockExamDebriefActions({
  report,
  questions,
  responses,
  domains,
  onOpenTrapDrill,
  onOpenLab,
  onStudyDomain,
  onSelectObjective,
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

  const topTrap = report.trapDebrief?.[0]
  const trapCku = topTrap ? resolveTrapDrillCku({ trapLabel: topTrap.trap }) : null

  const firstWrongIdx = questions.findIndex((q, idx) => {
    const sel = responses[idx]
    return sel != null && sel !== q.correctIndex
  })
  const stemReplay = firstWrongIdx >= 0 ? getStemReplayLab(questions[firstWrongIdx]?.id) : null

  const weakDomainLabReplays = weakDomains.map(d => {
    const oid = weakestObjectiveInDomain(d.id)
    if (!oid) return null
    const wrongQ = questions.find((q, idx) => {
      if (q.objectiveId !== oid) return false
      const sel = responses[idx]
      return sel != null && sel !== q.correctIndex
    })
    const replay = wrongQ ? getStemReplayLab(wrongQ.id) : null
    return replay ? { domainId: d.id, ...replay } : null
  }).filter(Boolean)

  if (!weakDomains.length && !trapCku && !stemReplay && !weakDomainLabReplays.length) return null

  return (
    <div style={{ ...styles.card, marginBottom: 12, border: `1px solid ${COLORS.skyBorder}`, background: COLORS.skyDim }}>
      <h2 style={{ ...styles.h2, color: COLORS.sky, marginBottom: 8 }}>Next steps</h2>
      <p style={{ ...styles.small, marginBottom: 10, color: COLORS.silver }}>
        Target your weakest areas from this session.
      </p>
      {weakDomains.map(d => (
        <div key={d.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
          <button
            type="button"
            style={{ ...styles.secondaryBtn, width: '100%', textAlign: 'left' }}
            onClick={() => onStudyDomain?.(d.id)}
          >
            Study {d.name} — {d.correct}/{d.total} ({d.pct}%)
          </button>
          {onSelectObjective && (() => {
            const oid = weakestObjectiveInDomain(d.id)
            if (!oid) return null
            return (
              <button
                type="button"
                style={{ ...styles.secondaryBtn, width: '100%', textAlign: 'left', fontSize: 'var(--ccna-type-sm)' }}
                onClick={() => onSelectObjective(oid)}
              >
                Open weakest topic {oid} →
              </button>
            )
          })()}
          {(() => {
            const domainReplay = weakDomainLabReplays.find(r => r.domainId === d.id)
            if (!domainReplay || !onOpenLab) return null
            return (
              <button
                type="button"
                style={{ ...styles.secondaryBtn, width: '100%', textAlign: 'left', fontSize: 'var(--ccna-type-sm)' }}
                onClick={() => onOpenLab(domainReplay.labId)}
              >
                Lab for {d.name} → {domainReplay.lab.title}
              </button>
            )
          })()}
        </div>
      ))}
      {trapCku && onOpenTrapDrill && (
        <button
          type="button"
          style={{ ...styles.secondaryBtn, marginBottom: 8, width: '100%', textAlign: 'left' }}
          onClick={() => onOpenTrapDrill({ ckuId: trapCku.ckuId, trapLabel: trapCku.trapLabel })}
        >
          Trap drill → {trapCku.trapLabel.slice(0, 60)}
        </button>
      )}
      {stemReplay && onOpenLab && (
        <button
          type="button"
          style={{ ...styles.secondaryBtn, width: '100%', textAlign: 'left' }}
          onClick={() => onOpenLab(stemReplay.labId)}
        >
          Lab replay → {stemReplay.lab.title}
        </button>
      )}
    </div>
  )
}
