import React, { useMemo } from 'react'
import { DOMAINS } from '../../data/ccnaDomains.js'
import { COLORS, styles } from '../../ui/appTheme.js'
import { placementReadyBand } from './domainPlacementConfig.js'
import { classifyObjectiveBaseline } from './domainBaselineProfile.js'
import DomainBaselineStatusPill from './DomainBaselineStatusPill.jsx'

export function objectiveRows(byObjective) {
  return Object.entries(byObjective || {})
    .map(([id, stats]) => ({
      id,
      correct: stats.correct || 0,
      total: stats.total || 0,
      pct: stats.total ? Math.round((stats.correct / stats.total) * 100) : 0,
    }))
    .sort((a, b) => a.pct - b.pct || a.id.localeCompare(b.id))
}

/** Full-domain rows — sampled objectives plus not-checked placeholders. */
export function domainBaselineRows({ domainId, byObjective, objectiveProfiles }) {
  const domain = DOMAINS.find(d => d.id === domainId)
  if (!domain) return objectiveRows(byObjective)

  return domain.objectives.map(obj => {
    const profile = objectiveProfiles?.[obj.id]
    const stats = byObjective?.[obj.id]
    const pct = profile?.pct ?? (stats?.total ? Math.round((stats.correct / stats.total) * 100) : null)
    const status = profile?.status ?? classifyObjectiveBaseline({ stats, trapMissed: profile?.trapMissed })
    return {
      id: obj.id,
      title: obj.title,
      correct: stats?.correct || 0,
      total: stats?.total || 0,
      pct,
      status,
    }
  }).sort((a, b) => {
    const order = { weak: 0, building: 1, not_checked: 2, strong: 3 }
    const da = order[a.status] ?? 2
    const db = order[b.status] ?? 2
    if (da !== db) return da - db
    if (a.pct != null && b.pct != null) return a.pct - b.pct
    return a.id.localeCompare(b.id)
  })
}

/** Per-objective baseline map for placement debrief + domain panel. */
export default function DomainPlacementObjectiveBreakdown({
  domainId,
  byObjective,
  previousByObjective,
  objectiveProfiles,
  onStudyObjective,
  showAllObjectives = false,
}) {
  const rows = useMemo(() => {
    if (showAllObjectives && domainId) {
      return domainBaselineRows({ domainId, byObjective, objectiveProfiles })
    }
    return objectiveRows(byObjective).map(r => ({ ...r, status: r.pct >= 80 ? 'strong' : r.pct < 65 ? 'weak' : 'building' }))
  }, [byObjective, domainId, objectiveProfiles, showAllObjectives])

  if (!rows.length) return null

  return (
    <div className="ccna-placement-objectives" style={{ ...styles.card, marginBottom: 8 }}>
      <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.sky, marginBottom: 8 }}>
        Baseline map
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        <DomainBaselineStatusPill status="strong" />
        <DomainBaselineStatusPill status="weak" />
        <DomainBaselineStatusPill status="building" />
        <DomainBaselineStatusPill status="not_checked" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map(row => {
          const band = row.pct != null ? placementReadyBand(row.pct) : null
          const prev = previousByObjective?.[row.id]
          const prevPct = prev?.total ? Math.round((prev.correct / prev.total) * 100) : null
          const delta = prevPct != null && row.pct != null ? row.pct - prevPct : null
          const isWeak = row.status === 'weak'
          const isStrong = row.status === 'strong'
          const notChecked = row.status === 'not_checked'

          return (
            <div
              key={row.id}
              className="ccna-placement-objective-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexWrap: 'wrap',
                fontSize: 'var(--ccna-type-xs)',
                color: COLORS.silver,
                padding: isWeak ? '8px 10px' : 0,
                borderRadius: isWeak ? 8 : 0,
                background: isWeak ? COLORS.roseDim : 'transparent',
                border: isWeak ? `1px solid ${COLORS.roseBorder}` : 'none',
              }}
            >
              <DomainBaselineStatusPill status={row.status} compact />
              <span style={{ width: 36, flexShrink: 0, fontWeight: 600, color: band ? COLORS[band.accent] : COLORS.silverMid }}>
                {row.id}
              </span>
              {!notChecked && (
                <div style={{ flex: 1, minWidth: 72, height: 6, borderRadius: 999, background: COLORS.surface, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.max(row.pct || 0, 4)}%`,
                      borderRadius: 999,
                      background: band ? COLORS[band.accent] : COLORS.silverDim,
                      transition: 'width .25s ease',
                    }}
                  />
                </div>
              )}
              {notChecked ? (
                <span style={{ flex: 1, minWidth: 0, color: COLORS.silverMid }}>Skipped in sprint</span>
              ) : (
                <>
                  <span style={{ flexShrink: 0, minWidth: 40, textAlign: 'right', color: band ? COLORS[band.accent] : COLORS.silver, fontWeight: 600 }}>
                    {row.pct}%
                  </span>
                  <span style={{ flexShrink: 0, minWidth: 36, textAlign: 'right', color: COLORS.silverMid }}>
                    {row.correct}/{row.total}
                  </span>
                </>
              )}
              {delta != null && delta !== 0 && (
                <span style={{ flexShrink: 0, minWidth: 32, textAlign: 'right', color: delta > 0 ? COLORS.mint : COLORS.rose, fontWeight: 600 }}>
                  {delta > 0 ? '+' : ''}{delta}
                </span>
              )}
              {isWeak && onStudyObjective && (
                <button
                  type="button"
                  className="ccna-hover"
                  aria-label={`Study objective ${row.id}`}
                  onClick={() => onStudyObjective(row.id)}
                  style={{
                    ...styles.secondaryBtn,
                    flexShrink: 0,
                    marginBottom: 0,
                    marginLeft: 'auto',
                    fontSize: 'var(--ccna-type-xs)',
                    padding: '6px 10px',
                    minHeight: 32,
                  }}
                >
                  Study
                </button>
              )}
              {isStrong && (
                <span style={{ marginLeft: 'auto', flexShrink: 0, color: COLORS.mint, fontWeight: 600 }}>
                  Complete
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
