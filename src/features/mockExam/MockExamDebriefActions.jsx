import React from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import { getStemReplayLab } from '../stemReplay/stemReplayLabs.js'
import { resolveTrapDrillCku } from '../trapDrill/trapDrillQuestions.js'

/** Post-mock CTAs — weak domains, trap drill, and stem-replay lab from first miss. */
export default function MockExamDebriefActions({
  report,
  questions,
  responses,
  domains,
  onOpenTrapDrill,
  onOpenLab,
  onStudyDomain,
}) {
  if (!report) return null

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

  if (!weakDomains.length && !trapCku && !stemReplay) return null

  return (
    <div style={{ ...styles.card, marginBottom: 12, border: `1px solid ${COLORS.skyBorder}`, background: COLORS.skyDim }}>
      <h2 style={{ ...styles.h2, color: COLORS.sky, marginBottom: 8 }}>Next steps</h2>
      <p style={{ ...styles.small, marginBottom: 10, color: COLORS.silver }}>
        Target your weakest areas from this session.
      </p>
      {weakDomains.map(d => (
        <button
          key={d.id}
          type="button"
          style={{ ...styles.secondaryBtn, marginBottom: 8, width: '100%', textAlign: 'left' }}
          onClick={() => onStudyDomain?.(d.id)}
        >
          Study {d.name} — {d.correct}/{d.total} ({d.pct}%)
        </button>
      ))}
      {trapCku && onOpenTrapDrill && (
        <button
          type="button"
          style={{ ...styles.secondaryBtn, marginBottom: 8, width: '100%', textAlign: 'left' }}
          onClick={() => onOpenTrapDrill(trapCku.ckuId)}
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
