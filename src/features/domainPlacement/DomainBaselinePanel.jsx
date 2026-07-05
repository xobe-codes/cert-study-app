import React, { useMemo } from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import { homeBodySm, homeSectionLabel } from '../../home/homeUi.js'
import { PLACEMENT_QUESTION_COUNT } from './domainPlacementConfig.js'
import { buildDomainBaselineSummary, domainBaselineBand } from './domainBaselineProfile.js'
import DomainBaselineStatusPill from './DomainBaselineStatusPill.jsx'
import { isPlacementDomain } from './placementBlueprints.js'

function formatDate(ts) {
  if (!ts) return null
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function ObjectiveBaselineRow({ objective, profile, onStudyObjective, highlight }) {
  const status = profile?.status || 'not_checked'
  const isWeak = status === 'weak'

  return (
    <div
      className={`ccna-domain-baseline-row${highlight ? ' ccna-domain-baseline-row--weak' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: isWeak ? '8px 10px' : '6px 0',
        borderRadius: isWeak ? 8 : 0,
        background: isWeak ? COLORS.roseDim : 'transparent',
        border: isWeak ? `1px solid ${COLORS.roseBorder}` : 'none',
        marginBottom: isWeak ? 6 : 0,
      }}
    >
      <DomainBaselineStatusPill status={status} compact />
      <span
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 'var(--ccna-type-xs)',
          color: isWeak ? COLORS.silver : COLORS.silverMid,
          fontWeight: isWeak ? 600 : 400,
          lineHeight: 1.35,
        }}
      >
        {objective.id} {objective.title}
        {profile?.pct != null && (
          <span style={{ color: COLORS.silverMid, fontWeight: 500 }}> · {profile.pct}%</span>
        )}
      </span>
      {isWeak && onStudyObjective && (
        <button
          type="button"
          className="ccna-hover"
          aria-label={`Study ${objective.id}`}
          onClick={() => onStudyObjective(objective.id)}
          style={{
            ...styles.secondaryBtn,
            flexShrink: 0,
            marginBottom: 0,
            fontSize: 'var(--ccna-type-xs)',
            padding: '6px 10px',
            minHeight: 32,
          }}
        >
          Study
        </button>
      )}
    </div>
  )
}

/** Domain accordion baseline block — status, CTA, strong/weak map. */
export default function DomainBaselinePanel({
  domain,
  record,
  onCheckLevel,
  onStudyObjective,
  onOpenDomainPass,
}) {
  const summary = useMemo(
    () => buildDomainBaselineSummary({ domain, lastAttempt: record?.lastAttempt }),
    [domain, record],
  )

  if (!isPlacementDomain(domain.id)) return null

  const last = record?.lastAttempt
  const band = domainBaselineBand(summary.domainStatus)
  const hasBaseline = Boolean(last)
  const sprintAvailable = hasBaseline && !summary.testedOut
    && (summary.weakObjectives.length + summary.notCheckedObjectives.length) < domain.objectives.length
  const ctaLabel = !hasBaseline
    ? 'Set baseline'
    : summary.testedOut
      ? 'Refresh check'
      : sprintAvailable
        ? 'Sprint update'
        : 'Update baseline'

  const weakObjs = domain.objectives.filter(o => summary.weakObjectives.includes(o.id))
  const buildingObjs = domain.objectives.filter(o => summary.buildingObjectives.includes(o.id))
  const strongObjs = domain.objectives.filter(o => summary.strongObjectives.includes(o.id))
  const uncheckedObjs = domain.objectives.filter(o => summary.notCheckedObjectives.includes(o.id))

  return (
    <div
      className="ccna-domain-baseline-panel"
      style={{
        marginBottom: 10,
        padding: 12,
        borderRadius: 10,
        border: `1px solid ${COLORS.skyBorder}`,
        background: COLORS.skyDim,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <div>
          <div style={homeSectionLabel(COLORS.sky)}>YOUR BASELINE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {hasBaseline ? (
              <>
                <span style={{ fontSize: 'var(--ccna-type-lg)', fontWeight: 700, color: COLORS[band.accent] }}>
                  {summary.pct}%
                </span>
                <span style={styles.pill(band.accent)}>{band.label}</span>
              </>
            ) : (
              <span style={{ ...homeBodySm, margin: 0 }}>
                {PLACEMENT_QUESTION_COUNT}-question check — maps strong vs weak subsections
              </span>
            )}
          </div>
          {hasBaseline && (
            <div style={{ ...homeBodySm, margin: '6px 0 0', color: COLORS.silverMid }}>
              {formatDate(last.at)}
              {summary.strongObjectives.length > 0 && ` · ${summary.strongObjectives.length} strong`}
              {summary.weakObjectives.length > 0 && ` · ${summary.weakObjectives.length} weak`}
              {summary.notCheckedObjectives.length > 0 && ` · ${summary.notCheckedObjectives.length} not sampled`}
            </div>
          )}
        </div>
        <button
          type="button"
          className="ccna-hover"
          style={{
            ...styles.primaryBtn,
            marginBottom: 0,
            flexShrink: 0,
            fontSize: 'var(--ccna-type-xs)',
            padding: '10px 14px',
            minHeight: 40,
          }}
          onClick={() => onCheckLevel?.(domain.id)}
        >
          {ctaLabel} →
        </button>
      </div>

      {summary.testedOut && onOpenDomainPass && (
        <div style={{ marginBottom: 10 }}>
          <button
            type="button"
            className="ccna-hover"
            style={{ ...styles.secondaryBtn, marginBottom: 0, width: '100%', fontSize: 'var(--ccna-type-xs)' }}
            onClick={() => onOpenDomainPass({ domainId: domain.id })}
          >
            Ready for Domain Pass? →
          </button>
        </div>
      )}

      {hasBaseline && (
        <div className="ccna-domain-baseline-map" style={{ borderTop: `1px solid ${COLORS.skyBorder}`, paddingTop: 10 }}>
          {weakObjs.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 'var(--ccna-type-micro)', fontWeight: 700, color: COLORS.rose, marginBottom: 6, letterSpacing: 0.4 }}>
                FOCUS HERE
              </div>
              {weakObjs.map(o => (
                <ObjectiveBaselineRow
                  key={o.id}
                  objective={o}
                  profile={summary.objectiveProfiles[o.id]}
                  onStudyObjective={onStudyObjective}
                  highlight
                />
              ))}
            </div>
          )}

          {buildingObjs.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 'var(--ccna-type-micro)', fontWeight: 700, color: COLORS.amber, marginBottom: 4 }}>
                BUILDING
              </div>
              {buildingObjs.map(o => (
                <ObjectiveBaselineRow
                  key={o.id}
                  objective={o}
                  profile={summary.objectiveProfiles[o.id]}
                />
              ))}
            </div>
          )}

          {strongObjs.length > 0 && (
            <div style={{ marginBottom: uncheckedObjs.length ? 8 : 0 }}>
              <div style={{ fontSize: 'var(--ccna-type-micro)', fontWeight: 700, color: COLORS.mint, marginBottom: 4 }}>
                STRONG — COMPLETE FOR ROUTING
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {strongObjs.map(o => (
                  <DomainBaselineStatusPill key={o.id} status="strong" compact showLabel={false} />
                ))}
                <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.6 }}>
                  {strongObjs.map(o => o.id).join(', ')}
                </span>
              </div>
            </div>
          )}

          {uncheckedObjs.length > 0 && (
            <div>
              <div style={{ fontSize: 'var(--ccna-type-micro)', fontWeight: 700, color: COLORS.silverMid, marginBottom: 4 }}>
                NOT SAMPLED IN BASELINE
              </div>
              <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.45 }}>
                {uncheckedObjs.map(o => o.id).join(', ')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
