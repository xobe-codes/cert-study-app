import React from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import { placementReadyBand } from './domainPlacementConfig.js'
import { computePlacementDelta } from './computePlacementDelta.js'
import { pickPlacementCta } from './pickPlacementCta.js'

function formatDelta(n, suffix = '%') {
  if (n == null || Number.isNaN(n)) return '—'
  const sign = n > 0 ? '+' : ''
  return `${sign}${n}${suffix}`
}

export default function DomainPlacementDebrief({
  domainName,
  report,
  previousAttempt,
  onStudyObjective,
  onOpenTrapDrill,
  onOpenLab,
  onRetake,
  onExit,
}) {
  const band = placementReadyBand(report.pct)
  const delta = computePlacementDelta(
    { ...report, at: Date.now() },
    previousAttempt,
  )
  const cta = pickPlacementCta(report)

  function handleCta() {
    if (!cta) return
    if (cta.kind === 'study') onStudyObjective?.(cta.payload.objectiveId)
    else if (cta.kind === 'trapDrill') onOpenTrapDrill?.(cta.payload)
    else if (cta.kind === 'lab') onOpenLab?.(cta.payload.labId)
  }

  return (
    <div className="ccna-placement-debrief ccna-review-flow">
      <h2 style={styles.h2}>{domainName} placement</h2>

      <div style={styles.card}>
        <div style={{ fontSize: 'var(--ccna-type-display)', fontWeight: 700, color: COLORS[band.accent] }}>
          {report.pct}%
        </div>
        <div style={{ ...styles.pill(band.accent), display: 'inline-block', marginTop: 8, marginBottom: 8 }}>
          {band.label}
        </div>
        <div style={styles.small}>{report.correct} / {report.total} correct</div>
        {report.trapPct != null && (
          <div style={{ ...styles.small, marginTop: 6 }}>
            Trap resistance: {report.trapPct}% ({report.trapCorrect}/{report.trapTotal})
          </div>
        )}
      </div>

      {delta && (
        <div style={{ ...styles.card, marginBottom: 8 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.sky, marginBottom: 6 }}>
            Since last placement{delta.daysSince != null ? ` (${delta.daysSince}d ago)` : ''}
          </div>
          <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, lineHeight: 1.45 }}>
            Overall {formatDelta(delta.pctDelta)}
            {delta.trapPctDelta != null ? ` · Traps ${formatDelta(delta.trapPctDelta)}` : ''}
          </div>
          {delta.improvedObjectives?.length > 0 && (
            <div style={{ ...styles.small, marginTop: 6, color: COLORS.mint }}>
              Improved: {delta.improvedObjectives.map(d => `${d.objectiveId} ${formatDelta(d.delta)}`).join(' · ')}
            </div>
          )}
          {delta.slippedObjectives?.length > 0 && (
            <div style={{ ...styles.small, marginTop: 4, color: COLORS.rose }}>
              Slipped: {delta.slippedObjectives.map(d => `${d.objectiveId} ${formatDelta(d.delta)}`).join(' · ')}
            </div>
          )}
        </div>
      )}

      {report.trapMisses?.length > 0 && (
        <div style={{ ...styles.card, marginBottom: 8, borderColor: COLORS.amberBorder }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.amber, marginBottom: 6 }}>
            Trap patterns missed
          </div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 'var(--ccna-type-sm)', color: COLORS.silver }}>
            {report.trapMisses.slice(0, 3).map((t, i) => (
              <li key={`${t.questionId}-${i}`}>{t.trap}{t.objectiveId ? ` · ${t.objectiveId}` : ''}</li>
            ))}
          </ul>
        </div>
      )}

      {cta && (
        <button type="button" style={{ ...styles.primaryBtn, marginBottom: 8 }} onClick={handleCta}>
          {cta.label} →
        </button>
      )}
      <button type="button" style={{ ...styles.secondaryBtn, marginBottom: 8 }} onClick={onRetake}>
        Retake placement
      </button>
      <button type="button" style={styles.secondaryBtn} onClick={onExit}>
        Done
      </button>
    </div>
  )
}
