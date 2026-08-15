import React, { useState } from 'react'
import { DOMAINS } from '../../data/ccnaDomains.js'
import { COLORS, styles } from '../../ui/appTheme.js'
import StudyModeHeader from '../../components/StudyModeHeader.jsx'
import MockExamDebriefActions from '../mockExam/MockExamDebriefActions.jsx'
import { getDomainStudyMeta } from '../../home/domainStudyRoutes.js'
import { buildDomainPassWeakStudyHandoff } from './domainPassWeakStudy.js'
import WeakAreasCompact from './WeakAreasCompact.jsx'
import ResultsNextAction from './ResultsNextAction.jsx'
import { stashDomainPassDebriefResume, clearDomainPassDebriefResume } from './domainPassDebriefResume.js'
import { isDomainPassPassed } from './domainPassConfig.js'
import { computeWeakObjectivesFromResponses } from './buildDomainPassPool.js'
import { shouldShowWildcardBridge } from '../practice/trapStreak.js'
import { isPlacementDomain } from '../domainPlacement/placementBlueprints.js'

/** The `phase === 'done'` results screen for DomainPassSession.jsx — extracted for ≤900L maintainability. */
export default function DomainPassResultsScreen({
  report,
  questions,
  responses,
  domainId,
  domain,
  isFocusSession,
  focusObjectiveIds,
  missed,
  onExit,
  onOpenMock,
  onOpenTrapDrill,
  onOpenLab,
  onOpenLabs,
  onOpenCommandHub,
  onOpenSubnet,
  onSelectObjective,
  onStartFocus,
  onOpenPlacementPulse,
  onRetake,
}) {
  const [showMoreTools, setShowMoreTools] = useState(false)

  const pct = report.total > 0 ? Math.round((report.correct / report.total) * 100) : 0
  const passed = isDomainPassPassed(pct)
  const skippedCount = report.total - Object.keys(responses).length
  const wrongCount = report.total - report.correct - skippedCount

  const weakObjectiveIds = computeWeakObjectivesFromResponses(questions, responses)
  const domainMeta = getDomainStudyMeta(domainId)
  const showTrapCta = Boolean(onOpenTrapDrill)
  const showLabsCta = domainMeta.labCount > 0 && Boolean(onOpenLabs)
  const showCommandHubCta = Boolean(onOpenCommandHub)
  const showWildcardCta = shouldShowWildcardBridge(domainId, onOpenSubnet)
  const showPlacementPulseCta = isPlacementDomain(domainId) && Boolean(onOpenPlacementPulse)
  const showDomainActions = showTrapCta || showLabsCta || showCommandHubCta || showWildcardCta || showPlacementPulseCta
  const topWeakId = weakObjectiveIds[0] || null

  function stashDebriefResume() {
    if (!report || !questions.length) return
    stashDomainPassDebriefResume(domainId, { report, questions, responses })
  }

  function openWeakStudy(objectiveId) {
    if (!onSelectObjective) return
    stashDebriefResume()
    const handoff = buildDomainPassWeakStudyHandoff(domain, objectiveId)
    if (handoff) onSelectObjective(handoff)
  }

  function handleExit() {
    clearDomainPassDebriefResume()
    onExit?.()
  }

  function handleRetake() {
    clearDomainPassDebriefResume()
    onRetake()
  }

  const domainActionBtn = {
    ...styles.secondaryBtn,
    width: '100%',
    textAlign: 'left',
    fontSize: 'var(--ccna-type-sm)',
    padding: '8px 10px',
    marginBottom: 4,
  }

  return (
    <div>
      <StudyModeHeader
        title={isFocusSession ? `${domain.name} — Focus results` : `${domain.name} — Results`}
        onBack={handleExit}
        backLabel="Domain Pass"
      />
      {isFocusSession && (
        <div style={{ ...styles.card, marginBottom: 8, border: `1px solid ${COLORS.skyBorder}`, background: COLORS.skyDim }}>
          <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.sky, fontWeight: 600, lineHeight: 1.45 }}>
            Focus practice — does not replace full domain pass
          </div>
          {focusObjectiveIds?.length > 0 && (
            <div style={{ ...styles.small, marginTop: 6, marginBottom: 0 }}>
              Topics: {focusObjectiveIds.join(', ')}
            </div>
          )}
        </div>
      )}
      <div style={styles.card}>
        <div style={{ fontSize: 'var(--ccna-type-display)', fontWeight: 700, color: passed ? COLORS.mint : COLORS.rose }}>
          {pct}%
        </div>
        <div style={{ ...styles.pill(passed ? 'mint' : 'rose'), display: 'inline-block', marginTop: 8, marginBottom: 8 }}>
          {passed ? 'PASS' : 'FAIL'}
        </div>
        <div style={styles.small}>{report.correct} / {report.total} correct</div>
        <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.mint }}>✓ {report.correct} correct</span>
          {wrongCount > 0 && <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.rose }}>✗ {wrongCount} incorrect</span>}
          {skippedCount > 0 && <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.amber }}>— {skippedCount} skipped</span>}
        </div>
        {skippedCount > 0 && (
          <div style={{ ...styles.small, marginTop: 8, marginBottom: 0, color: COLORS.amber }}>
            Skipped questions are queued for your next pass.
          </div>
        )}
      </div>
      {/* Clean weak areas display (top 3 only) */}
      <WeakAreasCompact
        domainId={domainId}
        weakObjectiveIds={weakObjectiveIds}
        responses={responses}
        questions={questions}
        onSelectObjective={onSelectObjective}
      />

      {/* Smart next action based on pass/fail */}
      <ResultsNextAction
        passed={passed}
        pct={pct}
        weakObjectiveIds={weakObjectiveIds}
        topWeakId={topWeakId}
        onNextDomain={null}
        onStudyWeak={weakObjectiveIds.length > 0 && onSelectObjective ? () => {
          const handoff = buildDomainPassWeakStudyHandoff(domain, weakObjectiveIds[0])
          if (handoff) {
            stashDebriefResume()
            onSelectObjective(handoff)
          }
        } : undefined}
        onRetake={() => handleRetake()}
        isFocusSession={isFocusSession}
      />
      <MockExamDebriefActions
        report={report}
        questions={questions}
        responses={responses}
        domains={DOMAINS}
        missed={missed}
        onOpenTrapDrill={onOpenTrapDrill ? (prefill) => {
          stashDebriefResume()
          onOpenTrapDrill(prefill)
        } : undefined}
        onOpenLab={onOpenLab ? (labId) => {
          stashDebriefResume()
          onOpenLab(labId)
        } : undefined}
        onStudyDomain={() => openWeakStudy(topWeakId)}
        onSelectObjective={onSelectObjective ? (handoffOrId) => {
          const oid = typeof handoffOrId === 'object' ? handoffOrId?.id : handoffOrId
          openWeakStudy(oid)
        } : undefined}
        onOpenDomainPass={onStartFocus ? (opts) => {
          stashDebriefResume()
          onStartFocus({
            domainId: opts?.domainId || domainId,
            objectiveIds: opts?.focusObjectiveIds || opts?.objectiveIds,
          })
        } : undefined}
      />
      {/* Collapsible secondary tools */}
      {showDomainActions && (
        <div style={{ ...styles.card, marginBottom: 8 }}>
          <button
            type="button"
            onClick={() => setShowMoreTools(!showMoreTools)}
            style={{
              width: '100%',
              textAlign: 'left',
              background: 'transparent',
              border: 'none',
              color: COLORS.text,
              cursor: 'pointer',
              fontSize: 'var(--ccna-type-sm)',
              fontWeight: 600,
              padding: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            More options
            <span style={{ fontSize: 'var(--ccna-type-xs)' }}>
              {showMoreTools ? '▼' : '▶'}
            </span>
          </button>

          {showMoreTools && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {showTrapCta && (
                <button
                  type="button"
                  style={domainActionBtn}
                  onClick={() => {
                    stashDebriefResume()
                    onOpenTrapDrill({ domainId })
                  }}
                >
                  Trap drill (this domain) →
                </button>
              )}
              {showLabsCta && (
                <button
                  type="button"
                  style={domainActionBtn}
                  onClick={() => {
                    stashDebriefResume()
                    onOpenLabs({ domainId })
                  }}
                >
                  Domain labs ({domainMeta.labCount}) →
                </button>
              )}
              {showCommandHubCta && (
                <button
                  type="button"
                  style={domainActionBtn}
                  onClick={() => {
                    stashDebriefResume()
                    onOpenCommandHub({ domainId, tab: 'sprint' })
                  }}
                >
                  Command Hub →
                </button>
              )}
              {showWildcardCta && (
                <button
                  type="button"
                  style={domainActionBtn}
                  onClick={() => {
                    stashDebriefResume()
                    onOpenSubnet()
                  }}
                >
                  Subnetting Wildcard (ACL/OSPF) →
                </button>
              )}
              {showPlacementPulseCta && (
                <button
                  type="button"
                  style={{ ...domainActionBtn, marginBottom: 0 }}
                  onClick={() => {
                    stashDebriefResume()
                    onOpenPlacementPulse(domainId)
                  }}
                >
                  Recheck placement level →
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {isFocusSession && weakObjectiveIds.length > 0 && onStartFocus && (
        <button
          type="button"
          style={{ ...styles.secondaryBtn, marginBottom: 8 }}
          onClick={() => onStartFocus({ domainId, objectiveIds: weakObjectiveIds })}
        >
          Focus these topics ({weakObjectiveIds.join(', ')}) →
        </button>
      )}
      {!isFocusSession && onOpenMock && (
        <button
          type="button"
          style={{ ...styles.secondaryBtn, marginBottom: 8 }}
          onClick={() => {
            stashDebriefResume()
            onOpenMock({ domainId })
          }}
        >
          Take domain mock
        </button>
      )}
      <button type="button" style={styles.primaryBtn} onClick={handleRetake}>
        {isFocusSession ? 'Retake focus pass' : 'Retake domain pass'}
      </button>
      <button type="button" style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={handleExit}>Back to domains</button>
    </div>
  )
}
