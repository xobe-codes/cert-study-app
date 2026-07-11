import React, { useMemo } from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import OverflowMarquee from '../../components/OverflowMarquee.jsx'
import { homeBodySm } from '../../home/homeUi.js'
import HomeSectionLabel from '../../home/HomeSectionLabel.jsx'
import { PLACEMENT_QUESTION_COUNT, PLACEMENT_MAINTENANCE_TRAP_COUNT } from './domainPlacementConfig.js'
import { buildDomainBaselineSummary, domainBaselineBand } from './domainBaselineProfile.js'
import { baselineBlueprintIsStale } from './placementBlueprintCoverage.js'
import DomainBaselineStatusPill from './DomainBaselineStatusPill.jsx'
import { isPlacementDomain } from './placementBlueprints.js'
import { auditPlacementBlueprintCoverage } from './placementBlueprintCoverage.js'
import { buildStudyObjectiveHandoff } from '../../study/studyObjectiveHandoff.js'
import { DOMAIN_LEARNING_TAGLINE } from './domainLearningCopy.js'

function formatDate(ts) {
  if (!ts) return null
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function ObjectiveBaselineRow({ objective, profile, onStudyObjective, highlight }) {
  const status = profile?.status || 'not_checked'
  const isWeak = status === 'weak'
  const isBuilding = status === 'building'
  const isActionable = (isWeak || isBuilding) && onStudyObjective

  function handleClick() {
    if (!isActionable) return
    if (isBuilding) {
      const handoff = buildStudyObjectiveHandoff(objective.id, { tab: 'Quiz' })
      onStudyObjective(handoff || objective.id)
      return
    }
    const handoff = buildStudyObjectiveHandoff(objective.id, { tab: 'Study' })
    onStudyObjective(handoff || objective.id)
  }

  const rowAccent = isWeak
    ? { bg: COLORS.roseDim, border: COLORS.roseBorder, idColor: COLORS.rose, ctaColor: COLORS.rose, cta: 'Study →' }
    : isBuilding
      ? { bg: COLORS.amberDim, border: COLORS.amberBorder, idColor: COLORS.amber, ctaColor: COLORS.amber, cta: 'Quiz →' }
      : null

  return (
    <button
      type="button"
      className={`ccna-domain-baseline-row${highlight ? ' ccna-domain-baseline-row--weak' : ''}${isBuilding ? ' ccna-domain-baseline-row--building' : ''}`}
      disabled={!isActionable}
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        textAlign: 'left',
        fontFamily: 'inherit',
        padding: rowAccent ? '10px 12px' : '6px 0',
        borderRadius: rowAccent ? 10 : 0,
        background: rowAccent?.bg || 'transparent',
        border: rowAccent ? `1px solid ${rowAccent.border}` : 'none',
        marginBottom: rowAccent ? 8 : 0,
        cursor: isActionable ? 'pointer' : 'default',
      }}
    >
      <DomainBaselineStatusPill status={status} compact />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0 }}>
          <span style={{ flexShrink: 0, fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: rowAccent?.idColor || COLORS.silverMid }}>
            {objective.id}
          </span>
          <OverflowMarquee
            text={objective.title}
            style={{ fontSize: 'var(--ccna-type-xs)', color: rowAccent ? COLORS.silver : COLORS.silverMid, fontWeight: rowAccent ? 600 : 400 }}
          />
        </div>
        {profile?.pct != null && (
          <div style={{ fontSize: 'var(--ccna-type-micro)', color: COLORS.silverMid, marginTop: 2 }}>
            {profile.pct}% on baseline check
          </div>
        )}
      </div>
      {rowAccent && (
        <span style={{ flexShrink: 0, color: rowAccent.ctaColor, fontWeight: 700, fontSize: 'var(--ccna-type-xs)' }}>
          {rowAccent.cta}
        </span>
      )}
    </button>
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
  const blueprintStale = hasBaseline && baselineBlueprintIsStale(last, domain.id)
  const coverage = auditPlacementBlueprintCoverage(domain.id)
  const mappedCount = hasBaseline
    ? domain.objectives.length - summary.notCheckedObjectives.length
    : 0
  const sprintAvailable = hasBaseline && !summary.testedOut
    && (summary.weakObjectives.length + summary.notCheckedObjectives.length) < domain.objectives.length
  const ctaLabel = !hasBaseline
    ? 'Set baseline'
    : blueprintStale
      ? 'Full remap'
      : summary.testedOut
        ? null
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
          <HomeSectionLabel color={COLORS.sky}>YOUR BASELINE</HomeSectionLabel>
          <div style={{ ...homeBodySm, margin: '0 0 6px', color: COLORS.silverMid, lineHeight: 1.4 }}>
            {DOMAIN_LEARNING_TAGLINE}
          </div>
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
                {PLACEMENT_QUESTION_COUNT}-question check — all {coverage.objectiveCount} subsections sampled
              </span>
            )}
          </div>
          {hasBaseline && (
            <div style={{ ...homeBodySm, margin: '6px 0 0', color: COLORS.silverMid }}>
              {formatDate(last.at)}
              {mappedCount > 0 && ` · ${mappedCount}/${domain.objectives.length} subsections mapped`}
              {summary.strongObjectives.length > 0 && ` · ${summary.strongObjectives.length} strong`}
              {summary.weakObjectives.length > 0 && ` · ${summary.weakObjectives.length} weak`}
              {summary.notCheckedObjectives.length > 0 && ` · ${summary.notCheckedObjectives.length} skipped (sprint)`}
            </div>
          )}
        </div>
        {summary.testedOut ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, minWidth: 140, maxWidth: 200 }}>
            {blueprintStale && (
              <div>
                <button
                  type="button"
                  className="ccna-hover"
                  style={{
                    ...styles.primaryBtn,
                    marginBottom: 0,
                    width: '100%',
                    fontSize: 'var(--ccna-type-xs)',
                    padding: '10px 14px',
                    minHeight: 40,
                  }}
                  onClick={() => onCheckLevel?.(domain.id)}
                >
                  Full remap ({PLACEMENT_QUESTION_COUNT} Q) →
                </button>
                <div style={{ fontSize: 'var(--ccna-type-micro)', color: COLORS.silverMid, marginTop: 3, lineHeight: 1.35 }}>
                  Blueprint changed — rebuilds the whole map
                </div>
              </div>
            )}
            <div>
              <button
                type="button"
                className="ccna-hover"
                style={{
                  ...styles.primaryBtn,
                  marginBottom: 0,
                  width: '100%',
                  fontSize: 'var(--ccna-type-xs)',
                  padding: '10px 14px',
                  minHeight: 40,
                }}
                onClick={() => onCheckLevel?.(domain.id, { placementMode: 'maintenance' })}
              >
                Pulse ({PLACEMENT_MAINTENANCE_TRAP_COUNT} traps) →
              </button>
              <div style={{ fontSize: 'var(--ccna-type-micro)', color: COLORS.silverMid, marginTop: 3, lineHeight: 1.35 }}>
                Quick trap check — keeps your map as-is
              </div>
            </div>
            <div>
              <button
                type="button"
                className="ccna-hover"
                style={{
                  ...styles.secondaryBtn,
                  marginBottom: 0,
                  width: '100%',
                  fontSize: 'var(--ccna-type-xs)',
                  padding: '8px 12px',
                  minHeight: 36,
                }}
                onClick={() => onCheckLevel?.(domain.id)}
              >
                Refresh map ({PLACEMENT_QUESTION_COUNT} Q) →
              </button>
              <div style={{ fontSize: 'var(--ccna-type-micro)', color: COLORS.silverMid, marginTop: 3, lineHeight: 1.35 }}>
                Full resample — rewrites your strong/weak map
              </div>
            </div>
          </div>
        ) : (
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
              ...(blueprintStale ? { borderColor: COLORS.amberBorder, background: COLORS.amberDim } : {}),
            }}
            onClick={() => onCheckLevel?.(domain.id)}
          >
            {ctaLabel} →
          </button>
        )}
      </div>

      {blueprintStale && (
        <div style={{ ...homeBodySm, margin: '0 0 10px', color: COLORS.amber, lineHeight: 1.45 }}>
          Updated baseline map — retake for full subsection coverage (new objectives added).
        </div>
      )}

      {summary.testedOut && onOpenDomainPass && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ ...homeBodySm, margin: '0 0 8px', color: COLORS.mint, lineHeight: 1.45 }}>
            Baseline tested out — subsections mapped. Domain Pass is the timed exam gate when you are ready.
          </div>
          <button
            type="button"
            className="ccna-hover"
            style={{ ...styles.secondaryBtn, marginBottom: 0, width: '100%', fontSize: 'var(--ccna-type-xs)' }}
            onClick={() => onOpenDomainPass({ domainId: domain.id })}
          >
            Start Domain Pass →
          </button>
        </div>
      )}

      {hasBaseline && (
        <div className="ccna-domain-baseline-map" style={{ borderTop: `1px solid ${COLORS.skyBorder}`, paddingTop: 10 }}>
          {weakObjs.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 'var(--ccna-type-micro)', fontWeight: 700, color: COLORS.rose, marginBottom: 8, letterSpacing: 0.4 }}>
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
                  onStudyObjective={onStudyObjective}
                />
              ))}
            </div>
          )}

          {strongObjs.length > 0 && !summary.testedOut && (
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
                SKIPPED IN SPRINT (STRONG SUBSECTIONS)
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
