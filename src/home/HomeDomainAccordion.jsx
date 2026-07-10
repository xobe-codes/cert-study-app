import React, { useState, useEffect } from 'react'
import { DOMAINS } from '../data/ccnaDomains.js'
import { COLORS, accentColors, styles } from '../ui/appTheme.js'
import { hasCuratedReading, hasCuratedQuestions } from '../data/ccnaCurated.js'
import { isCuratedPack } from '../curatedDisplay.js'
import CuratedStaticBadge from '../components/CuratedStaticBadge.jsx'
import OverflowMarquee from '../components/OverflowMarquee.jsx'
import StatusDot from '../components/StatusDot.jsx'
import DomainBaselinePanel from '../features/domainPlacement/DomainBaselinePanel.jsx'
import { buildDomainBaselineSummary, domainBaselineBand } from '../features/domainPlacement/domainBaselineProfile.js'
import { isPlacementDomain } from '../features/domainPlacement/placementBlueprints.js'
import { DomainBaselineStatusMark } from '../features/domainPlacement/DomainBaselineStatusPill.jsx'
import { buildStudyObjectiveHandoff } from '../study/studyObjectiveHandoff.js'
import { domainPassStatus, domainPassBadgeLabel } from '../features/domainPass/domainPassConfig.js'
import { DOMAIN_LAYER_LEGEND, domainDisplayTitle } from '../features/domainPlacement/domainLearningCopy.js'
import { getDomainStudyMeta, pickDomainPracticeObjective } from './domainStudyRoutes.js'
import { buildDomainReadinessLine } from './domainReadiness.js'
import { labsForDomain } from '../data/labModules.js'
import { loadLabDone } from '../lab/labStorage.js'
import {
  HOME_SECTION_GAP,
  homeCard,
  homePill,
  homeBodySm,
} from './homeUi.js'

/**
 * Home screen domain accordion — baseline pills, pass badge, objective list.
 */
export default function HomeDomainAccordion({
  progress,
  placementRecords = {},
  domainPassRecords = {},
  openDomain,
  offlineReady,
  onOpenDomain,
  onSelectObjective,
  onOpenLabs,
  onOpenDomainPlacement,
  onOpenDomainPass,
  onOpenTrapDrill,
  onOpenCommandHub,
}) {
  const [showStrongObjectives, setShowStrongObjectives] = useState({})
  const [labDoneIds, setLabDoneIds] = useState([])

  useEffect(() => {
    let cancelled = false
    loadLabDone().then((ids) => {
      if (!cancelled) setLabDoneIds(Array.isArray(ids) ? ids : [])
    }).catch(() => {
      if (!cancelled) setLabDoneIds([])
    })
    return () => { cancelled = true }
  }, [])

  return (
    <div role="group" aria-label="Course domains">
      {DOMAINS.map(domain => {
        const isOpen = openDomain === domain.id
        const objs = domain.objectives
        const masteredCount = objs.filter(o => progress[o.id]?.status === 'mastered').length
        const accent = accentColors(domain.accent)
        const placementRecord = placementRecords[domain.id]
        const baselineSummary = isPlacementDomain(domain.id)
          ? buildDomainBaselineSummary({ domain, lastAttempt: placementRecord?.lastAttempt })
          : null
        const baselineBand = baselineSummary ? domainBaselineBand(baselineSummary.domainStatus) : null

        function studyObjective(objectiveOrId) {
          if (objectiveOrId?.id && objectiveOrId?.domainId) {
            onSelectObjective(objectiveOrId)
            return
          }
          const handoff = buildStudyObjectiveHandoff(objectiveOrId, { tab: 'Practice' })
          if (handoff) onSelectObjective(handoff)
        }

        const passRecord = domainPassRecords[domain.id]
        const passStatus = domainPassStatus(passRecord)
        const passBadge = domainPassBadgeLabel(passStatus)
        const passBadgeAccent = passStatus === 'passed' ? 'mint' : passStatus === 'retake' ? 'amber' : 'silver'
        const studyMeta = getDomainStudyMeta(domain.id)
        const domainLabs = labsForDomain(domain.id)
        const labDoneCount = domainLabs.filter(l => labDoneIds.includes(l.id)).length
        const readinessLine = buildDomainReadinessLine({
          domainId: domain.id,
          placementRecord,
          passRecord,
          labDone: labDoneCount,
          labTotal: studyMeta.labCount,
        })

        function practiceDomain() {
          if (studyMeta.hasPlacement && !placementRecord?.lastAttempt && onOpenDomainPlacement) {
            onOpenDomainPlacement({ domainId: domain.id, expandOnReturn: true })
            return
          }
          const objectiveId = pickDomainPracticeObjective(domain, { placementRecord, baselineSummary, progress })
          if (!objectiveId) return
          const handoff = buildStudyObjectiveHandoff(objectiveId, { tab: 'Practice' })
          if (handoff) onSelectObjective(handoff)
        }

        const studyModeBtn = {
          ...styles.secondaryBtn,
          width: '100%',
          marginBottom: 6,
          minHeight: 40,
          fontSize: 'var(--ccna-type-xs)',
          textAlign: 'left',
        }

        return (
          <div key={domain.id} className="ccna-hover" style={homeCard({ marginBottom: HOME_SECTION_GAP })}>
            <button
              onClick={() => onOpenDomain(isOpen ? null : domain.id)}
              aria-expanded={isOpen}
              aria-controls={`domain-panel-${domain.id}`}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', background: 'none', border: 'none', color: COLORS.silver, cursor: 'pointer', minHeight: 44, padding: 0, textAlign: 'left', gap: 8 }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ccna-home-domain-header">
                  <div className="ccna-home-domain-title" style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, lineHeight: 1.35 }}>{domainDisplayTitle(domain)}</div>
                  <span className="ccna-home-domain-pill" style={homePill(domain.accent)}>{domain.weight}% exam weight</span>
                  {baselineBand && (
                    <span className="ccna-home-domain-pill" style={homePill(baselineBand.accent)}>
                      {baselineSummary.testedOut ? '✓ Tested out' : `${baselineSummary.pct}% ${baselineBand.label}`}
                    </span>
                  )}
                  <span className="ccna-home-domain-pill" style={homePill(passBadgeAccent)}>Pass: {passBadge}</span>
                </div>
                <div style={{ ...homeBodySm, marginBottom: 6 }}>
                  {masteredCount}/{objs.length} studied
                  {placementRecord?.lastAttempt ? (
                    <>
                      {' · '}
                      {objs.length - baselineSummary.notCheckedObjectives.length}/{objs.length} mapped
                      {baselineSummary.strongObjectives.length > 0 && ` · ${baselineSummary.strongObjectives.length} strong`}
                      {baselineSummary.weakObjectives.length > 0 && ` · ${baselineSummary.weakObjectives.length} weak`}
                    </>
                  ) : isPlacementDomain(domain.id) ? (
                    <> · {objs.length} subsections · set baseline</>
                  ) : null}
                </div>
                <div className="ccna-home-domain-legend" style={{ ...homeBodySm, marginBottom: 6, color: COLORS.silverMid, fontSize: 'var(--ccna-type-micro)' }}>
                  {DOMAIN_LAYER_LEGEND}
                </div>
                <div style={{ width: '100%', height: 6, borderRadius: 999, background: COLORS.surface, overflow: 'hidden' }}>
                  <div style={{ width: `${domain.weight}%`, height: '100%', borderRadius: 999, background: COLORS.surface, position: 'relative', display: 'inline-block' }}>
                    <div style={{ width: `${Math.round(masteredCount / objs.length * 100)}%`, height: '100%', borderRadius: 999, background: accent.text }} />
                  </div>
                  <div style={{ display: 'inline-block', width: `${100 - domain.weight}%`, height: '100%', background: COLORS.border, borderRadius: 999 }} />
                </div>
              </div>
              <span className="ccna-home-domain-pill" style={{ ...homePill(domain.accent), flexShrink: 0, minWidth: 32, textAlign: 'center' }}>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div id={`domain-panel-${domain.id}`} className="domain-accordion-panel" role="region" aria-label={`${domain.name} objectives`} style={{ marginTop: 10, borderTop: `1px solid ${COLORS.border}`, paddingTop: 8 }}>
                {isPlacementDomain(domain.id) && onOpenDomainPlacement && (
                  <DomainBaselinePanel
                    domain={domain}
                    record={placementRecord}
                    onCheckLevel={(domainId, opts) => onOpenDomainPlacement({
                      domainId,
                      expandOnReturn: true,
                      placementMode: opts?.placementMode,
                    })}
                    onStudyObjective={studyObjective}
                    onOpenDomainPass={onOpenDomainPass}
                  />
                )}
                {(() => {
                  const strongObjs = baselineSummary?.testedOut
                    ? objs.filter(o => placementRecord?.lastAttempt?.objectiveProfiles?.[o.id]?.status === 'strong')
                    : []
                  const hideStrong = baselineSummary?.testedOut && !showStrongObjectives[domain.id]
                  const visibleObjs = hideStrong
                    ? objs.filter(o => placementRecord?.lastAttempt?.objectiveProfiles?.[o.id]?.status !== 'strong')
                    : objs
                  return (
                    <>
                      {visibleObjs.map(o => {
                        const status = progress[o.id]?.status || 'unseen'
                        const baselineStatus = placementRecord?.lastAttempt?.objectiveProfiles?.[o.id]?.status
                        const studyHandoff = {
                          ...o,
                          domainId: domain.id,
                          domainName: domain.name,
                          accent: domain.accent,
                          __initialTab: 'Study',
                        }
                        const practiceHandoff = buildStudyObjectiveHandoff(o.id, { tab: 'Practice' })
                          || { ...studyHandoff, __initialTab: 'Practice' }
                        return (
                          <div
                            key={o.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              width: '100%',
                              minWidth: 0,
                              background: baselineStatus === 'weak' ? COLORS.roseDim : 'none',
                              border: baselineStatus === 'weak' ? `1px solid ${COLORS.roseBorder}` : 'none',
                              borderRadius: baselineStatus === 'weak' ? 8 : 0,
                              padding: baselineStatus === 'weak' ? '6px 8px' : '4px 0',
                              marginBottom: baselineStatus === 'weak' ? 6 : 0,
                              borderBottom: baselineStatus === 'weak' ? 'none' : `1px solid ${COLORS.border}`,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => onSelectObjective(studyHandoff)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0,
                                background: 'none', border: 'none', color: COLORS.silver, cursor: 'pointer',
                                minHeight: 44, padding: '4px 0', textAlign: 'left',
                              }}
                            >
                              {baselineStatus ? (
                                <DomainBaselineStatusMark status={baselineStatus} />
                              ) : (
                                <StatusDot status={status} />
                              )}
                              <OverflowMarquee
                                text={`${o.id} ${o.title}`}
                                style={{ fontSize: 'var(--ccna-type-sm)' }}
                              />
                              {(hasCuratedReading(o.id) || hasCuratedQuestions(o.id)) && (
                                <CuratedStaticBadge objectiveId={o.id} fontSize={9} />
                              )}
                              {offlineReady?.has(o.id) && !isCuratedPack(o.id) && (
                                <span style={{ color: COLORS.mint, fontSize: 'var(--ccna-type-sm)', marginLeft: 4, flexShrink: 0 }}>⤓</span>
                              )}
                            </button>
                            <button
                              type="button"
                              className="ccna-hover"
                              aria-label={`Practice ${o.id}`}
                              onClick={() => onSelectObjective(practiceHandoff)}
                              style={{
                                ...styles.secondaryBtn,
                                flex: '0 0 auto',
                                width: 'auto',
                                minHeight: 36,
                                padding: '4px 10px',
                                fontSize: 'var(--ccna-type-xs)',
                                marginBottom: 0,
                              }}
                            >
                              Practice
                            </button>
                          </div>
                        )
                      })}
                      {hideStrong && strongObjs.length > 0 && (
                        <button
                          type="button"
                          className="ccna-hover"
                          onClick={() => setShowStrongObjectives(s => ({ ...s, [domain.id]: true }))}
                          style={{
                            ...styles.secondaryBtn,
                            width: '100%',
                            marginTop: 4,
                            marginBottom: 0,
                            fontSize: 'var(--ccna-type-xs)',
                            minHeight: 40,
                          }}
                        >
                          Show {strongObjs.length} strong (complete)
                        </button>
                      )}
                    </>
                  )
                })()}
                <div className="domain-study-modes" style={{ marginTop: 12, borderTop: `1px solid ${COLORS.border}`, paddingTop: 10 }}>
                  <div style={{ ...homeBodySm, fontWeight: 700, marginBottom: 4, color: COLORS.silverMid, letterSpacing: 0.3 }}>
                    Study modes
                  </div>
                  <div style={{ ...homeBodySm, marginBottom: 8, color: COLORS.silverMid }} aria-label="Domain readiness">
                    {readinessLine}
                  </div>
                  <button
                    type="button"
                    className="ccna-hover"
                    style={{
                      ...studyModeBtn,
                      borderColor: COLORS.skyBorder,
                      background: COLORS.skyDim,
                      color: COLORS.sky,
                      fontWeight: 700,
                    }}
                    onClick={() => {
                      const handoff = {
                        ...objs[0],
                        domainId: domain.id,
                        domainName: domain.name,
                        accent: domain.accent,
                        __initialTab: 'Study',
                      }
                      const firstUnseen = objs.find(o => !progress[o.id]?.lastSeen)
                      onSelectObjective(firstUnseen
                        ? { ...firstUnseen, domainId: domain.id, domainName: domain.name, accent: domain.accent, __initialTab: 'Study' }
                        : handoff)
                    }}
                  >
                    Lessons — open Study
                  </button>
                  {onOpenDomainPass && (
                    <button
                      type="button"
                      className="ccna-hover"
                      style={{
                        ...studyModeBtn,
                        borderColor: COLORS.mintBorder,
                        background: COLORS.mintDim,
                        color: COLORS.mint,
                        fontWeight: 700,
                      }}
                      onClick={() => onOpenDomainPass({ domainId: domain.id })}
                    >
                      Domain Pass — {passBadge}
                    </button>
                  )}
                  {onOpenTrapDrill && (
                    <button type="button" className="ccna-hover" style={{ ...studyModeBtn, opacity: 0.92 }} onClick={() => onOpenTrapDrill({ domainId: domain.id })}>
                      Trap Drill
                    </button>
                  )}
                  {onOpenCommandHub && (
                    <button type="button" className="ccna-hover" style={{ ...studyModeBtn, opacity: 0.92 }} onClick={() => onOpenCommandHub({ domainId: domain.id })}>
                      Command Hub
                    </button>
                  )}
                  <button type="button" className="ccna-hover" style={{ ...studyModeBtn, opacity: 0.92 }} onClick={practiceDomain}>
                    Practice domain
                  </button>
                  {onOpenLabs && studyMeta.labCount > 0 && (
                    <button type="button" className="ccna-hover" style={{ ...studyModeBtn, marginBottom: 0, opacity: 0.92 }} onClick={() => onOpenLabs({ domainId: domain.id })}>
                      🧪 Domain labs ({studyMeta.labCount})
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
