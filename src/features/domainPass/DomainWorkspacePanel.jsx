import React, { useEffect, useMemo, useState } from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import { getCuratedQuestions } from '../../data/ccnaCurated.js'
import { isChoiceQuestion } from '../../questionUtils.js'
import { labsForDomain } from '../../data/labModules.js'
import { buildStudyObjectiveHandoff } from '../../study/studyObjectiveHandoff.js'
import {
  loadDomainQuestionExposure,
  getDomainSeenMap,
  getExposureStats,
} from './domainQuestionExposure.js'
import { buildDomainStudyHealth } from './domainStudyHealth.js'
import { collectDomainQuestionIds } from './buildDomainPassPool.js'
import { buildDomainLessonsRail, pickContinueLesson } from './domainLessonsRail.js'
import { buildDomainActionPlan } from './domainBaselineActionPlan.js'
import { getTrapDrillCkusForDomain } from '../trapDrill/trapDrillQuestions.js'
import {
  loadTrapOwnership,
  rankDomainTraps,
  markTrapOwned,
  clearTrapOwned,
  isTrapOwned,
} from './trapOwnership.js'
import {
  buildWeakBatch,
  suggestFollowingBeat,
  runWeakBatchBeat,
} from './weakBatch.js'
import { loadAnswerFluency } from '../study/answerFluency.js'
import { homeBodySm } from '../../home/homeUi.js'
import FocusedLessonBank from '../../components/FocusedLessonBank.jsx'
import CompactLessonsList from '../../components/CompactLessonsList.jsx'

function getMc(oid) {
  return getCuratedQuestions(oid).filter(isChoiceQuestion)
}

const modeBtn = {
  ...styles.secondaryBtn,
  width: '100%',
  marginBottom: 6,
  minHeight: 40,
  fontSize: 'var(--ccna-type-xs)',
  textAlign: 'left',
}

/**
 * Domain Workspace — book UI: Now + TOC lessons + demoted modes (WB-4 / WB-5).
 */
export default function DomainWorkspacePanel({
  domain,
  progress,
  baselineSummary,
  passRecord,
  missed = [],
  readinessLine,
  passBadge,
  studyMeta,
  onSelectObjective,
  onOpenDomainPlacement,
  onOpenDomainPass,
  onOpenTrapDrill,
  onOpenCommandHub,
  onOpenMockExam,
  onOpenLabs,
  onOpenTermsHub,
  practiceDomain,
}) {
  const [health, setHealth] = useState(null)
  const [unseenCount, setUnseenCount] = useState(0)
  const [ownership, setOwnership] = useState({})
  const [fluencyStore, setFluencyStore] = useState(null)
  const [beatStep, setBeatStep] = useState('review')
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadAnswerFluency().then(store => {
      if (!cancelled) setFluencyStore(store)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [domain.id])

  const domainMissCount = useMemo(() => {
    const ids = new Set((domain.objectives || []).map(o => o.id))
    return missed.filter(m => ids.has(m?.objectiveId)).length
  }, [domain, missed])

  const labsByObjective = useMemo(() => {
    const map = {}
    for (const lab of labsForDomain(domain.id) || []) {
      const oid = lab.objectiveId
      if (!oid) continue
      if (!map[oid]) map[oid] = []
      map[oid].push(lab)
    }
    return map
  }, [domain.id])

  const lessonsRail = useMemo(
    () => buildDomainLessonsRail({ domain, progress, baselineSummary, labsByObjective }),
    [domain, progress, baselineSummary, labsByObjective],
  )
  const continueLesson = useMemo(() => pickContinueLesson(domain, progress), [domain, progress])

  const actionPlan = useMemo(
    () => buildDomainActionPlan({
      baselineSummary,
      missCount: domainMissCount,
      unseenCount,
      passRecord,
      hasPlacement: studyMeta.hasPlacement,
    }),
    [baselineSummary, domainMissCount, unseenCount, passRecord, studyMeta.hasPlacement],
  )

  const rankedTraps = useMemo(() => {
    const traps = getTrapDrillCkusForDomain(domain.id).map(c => ({
      id: c.ckuId,
      ckuId: c.ckuId,
      label: c.trapLabel,
      objectiveId: c.objectiveId,
    }))
    const missFreqByTrap = {}
    for (const m of missed) {
      for (const cku of m.ckuIds || []) {
        missFreqByTrap[cku] = (missFreqByTrap[cku] || 0) + 1
      }
    }
    return rankDomainTraps(traps, {
      missFreqByTrap,
      weakObjectiveIds: actionPlan.weak,
      ownership,
    }).slice(0, 5)
  }, [domain.id, missed, actionPlan.weak, ownership])

  const batch = useMemo(
    () => buildWeakBatch({
      domain,
      baselineSummary,
      missed,
      progress,
      rankedTraps,
      ownership,
      fluencyStore,
    }),
    [domain, baselineSummary, missed, progress, rankedTraps, ownership, fluencyStore],
  )

  const targetObjectiveId = batch.objectiveIds[0] || continueLesson?.id

  const hasBaseline = !!(baselineSummary && baselineSummary.domainStatus !== 'not_started')

  const activeBeat = useMemo(() => {
    if (!hasBaseline && studyMeta.hasPlacement) {
      return { beat: 'baseline', label: 'Set baseline map', objectiveIds: [] }
    }
    if (domainMissCount >= 3) {
      return { beat: 'fix_misses', label: `Fix misses (${domainMissCount})`, objectiveIds: batch.objectiveIds }
    }
    if (!batch.objectiveIds.length) {
      if (actionPlan.primaryCta === 'pass') {
        return { beat: 'pass_full', label: 'Domain Pass — prove domain', objectiveIds: [] }
      }
      return { beat: 'practice', label: 'Practice domain', objectiveIds: [] }
    }
    if (beatStep === 'prove') return suggestFollowingBeat('review', batch)
    if (beatStep === 'traps') return suggestFollowingBeat('prove', batch)
    if (beatStep === 'flood') {
      return {
        beat: 'flood',
        label: `Pass Focus · ${batch.objectiveIds.join(', ')}`,
        objectiveIds: batch.objectiveIds,
      }
    }
    return {
      beat: 'review',
      label: `Study · ${batch.objectiveIds[0]}`,
      objectiveId: batch.objectiveIds[0],
      objectiveIds: batch.objectiveIds,
    }
  }, [hasBaseline, studyMeta.hasPlacement, domainMissCount, batch, actionPlan.primaryCta, beatStep])

  useEffect(() => {
    setBeatStep('review')
    setShowMore(false)
  }, [domain.id])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const store = await loadDomainQuestionExposure()
        const ids = collectDomainQuestionIds(domain, getMc)
        const seenById = getDomainSeenMap(store, domain.id)
        const stats = getExposureStats(domain.id, ids, seenById)
        if (cancelled) return
        setUnseenCount(stats.unseen.length)
        setHealth(buildDomainStudyHealth({
          domainId: domain.id,
          allQuestionIds: ids,
          exposureStore: store,
        }))
      } catch {
        if (!cancelled) {
          setHealth(null)
          setUnseenCount(0)
        }
      }
    })()
    loadTrapOwnership().then(s => { if (!cancelled) setOwnership(s || {}) }).catch(() => {})
    return () => { cancelled = true }
  }, [domain])

  const handlers = {
    domainId: domain.id,
    onSelectObjective,
    onOpenDomainPlacement,
    onOpenDomainPass,
    onOpenTrapDrill,
    onOpenMockExam,
    practiceDomain,
  }

  function runNow() {
    runWeakBatchBeat(activeBeat, handlers)
    if (activeBeat.beat === 'review') setBeatStep('prove')
    else if (activeBeat.beat === 'prove') setBeatStep(batch.openTrapCount > 0 ? 'traps' : 'flood')
    else if (activeBeat.beat === 'traps') setBeatStep('flood')
  }

  function openProve5(objectiveId) {
    const handoff = buildStudyObjectiveHandoff(objectiveId, { tab: 'Practice' })
    if (handoff) onSelectObjective({ ...handoff, __sessionSize: 5 })
  }

  async function toggleOwned(trapId) {
    if (isTrapOwned(ownership, trapId)) {
      const next = await clearTrapOwned(trapId)
      setOwnership(next || {})
    } else {
      const next = await markTrapOwned(trapId)
      setOwnership(next || { ...ownership, [trapId]: Date.now() })
    }
  }

  const follow = batch.objectiveIds.length ? suggestFollowingBeat(activeBeat.beat === 'practice' ? 'review' : activeBeat.beat, batch) : null

  return (
    <div className="domain-workspace" style={{ marginTop: 12, borderTop: `1px solid ${COLORS.border}`, paddingTop: 10 }}>
      {/* Replace cluttered "Now" section with efficient FocusedLessonBank */}
      {batch.objectiveIds.length > 0 && (
        <FocusedLessonBank
          nextObjectives={batch.objectiveIds}
          domainId={domain.id}
          onStudy={(objId) => {
            const handoff = buildStudyObjectiveHandoff(objId, { tab: 'Study' })
            if (handoff) onSelectObjective(handoff)
          }}
          onQuickCheck={(objId) => {
            const handoff = buildStudyObjectiveHandoff(objId, { tab: 'Practice' })
            if (handoff) onSelectObjective({ ...handoff, __sessionSize: 5 })
          }}
          onOpenLab={(objId) => {
            onOpenLabs?.({
              domainId: domain.id,
              objectiveId: objId,
            })
          }}
          onOpenTerms={(objId) => {
            onOpenTermsHub?.({
              domainId: domain.id,
              objectiveId: objId,
            })
          }}
          showDetailedMetrics={false}
        />
      )}

      {/* Compact lessons list: 1 line per lesson instead of 4+ line cards */}
      <CompactLessonsList
        lessons={lessonsRail.slice(0, 8).map(row => ({
          id: row.objective.id,
          status: row.reason.toLowerCase().replace(/\s+/g, '_'),
          hasLab: row.hasLab,
        }))}
        nextObjectiveId={batch.objectiveIds[0]}
        onStudy={(objId) => {
          const handoff = buildStudyObjectiveHandoff(objId, { tab: 'Study' })
          if (handoff) onSelectObjective(handoff)
        }}
        onQuickCheck={(objId) => openProve5(objId)}
        onOpenLab={(objId) => {
          onOpenLabs?.({ domainId: domain.id, objectiveId: objId })
        }}
      />

      {rankedTraps.length > 0 && (
        <>
          <div style={{ ...homeBodySm, fontWeight: 700, margin: '4px 0 6px', color: COLORS.silverMid, letterSpacing: 0.3 }}>
            Traps {batch.openTrapCount > 0 ? `(${batch.openTrapCount} open)` : ''}
          </div>
          <div style={{ ...homeBodySm, marginBottom: 6, color: COLORS.silverMid }}>
            Own = you've got this, stop surfacing it as a priority.
          </div>
          {rankedTraps.slice(0, 3).map(t => (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 6,
                opacity: t.owned ? 0.55 : 1,
              }}
            >
              <button
                type="button"
                className="ccna-hover"
                style={{ ...modeBtn, marginBottom: 0, flex: 1, textAlign: 'left' }}
                onClick={() => onOpenTrapDrill?.({ ckuId: t.ckuId, trapLabel: t.label, domainId: domain.id })}
              >
                {t.label}
              </button>
              <button
                type="button"
                aria-pressed={!!t.owned}
                className="ccna-hover"
                style={{
                  ...styles.secondaryBtn,
                  width: 'auto',
                  minHeight: 36,
                  padding: '4px 10px',
                  fontSize: 'var(--ccna-type-micro)',
                  marginBottom: 0,
                }}
                onClick={() => toggleOwned(t.id)}
              >
                {t.owned ? 'Owned ✓' : 'Own'}
              </button>
            </div>
          ))}
        </>
      )}

      <button
        type="button"
        className="ccna-hover"
        style={{ ...modeBtn, marginTop: 8, opacity: 0.9 }}
        onClick={() => setShowMore(v => !v)}
      >
        {showMore ? 'Hide more tools' : 'More tools'}
      </button>

      {showMore && (
        <div style={{ marginTop: 4 }}>
          {(onOpenDomainPass) && (
            <div style={{ ...homeBodySm, fontWeight: 700, margin: '8px 0 6px', color: COLORS.silverMid, letterSpacing: 0.3 }}>
              Prove mastery
            </div>
          )}
          {onOpenDomainPass && (
            <button
              type="button"
              className="ccna-hover"
              style={{
                ...modeBtn,
                borderColor: COLORS.mintBorder,
                background: COLORS.mintDim,
                color: COLORS.mint,
                fontWeight: 700,
              }}
              onClick={() => onOpenDomainPass({ domainId: domain.id })}
            >
              Full Domain Pass — {passBadge}
            </button>
          )}
          {batch.objectiveIds.length > 0 && onOpenDomainPass && (
            <button
              type="button"
              className="ccna-hover"
              style={{ ...modeBtn }}
              onClick={() => onOpenDomainPass({ domainId: domain.id, focusObjectiveIds: batch.objectiveIds })}
            >
              Pass Focus flood · {batch.objectiveIds.join(', ')}
            </button>
          )}

          {(onOpenMockExam || onOpenTrapDrill) && (
            <div style={{ ...homeBodySm, fontWeight: 700, margin: '8px 0 6px', color: COLORS.silverMid, letterSpacing: 0.3 }}>
              Fix weak spots
            </div>
          )}
          {onOpenMockExam && domainMissCount > 0 && (
            <button
              type="button"
              className="ccna-hover"
              style={{
                ...modeBtn,
                borderColor: COLORS.roseBorder,
                background: COLORS.roseDim,
                color: COLORS.rose,
                fontWeight: 700,
              }}
              onClick={() => onOpenMockExam({ domainId: domain.id, mode: 'bankburn', missOnly: true })}
            >
              Fix misses ({domainMissCount}) →
            </button>
          )}
          {onOpenTrapDrill && (
            <button type="button" className="ccna-hover" style={modeBtn} onClick={() => onOpenTrapDrill({ domainId: domain.id })}>
              Trap Drill (domain)
            </button>
          )}
          {onOpenMockExam && (
            <button
              type="button"
              className="ccna-hover"
              style={modeBtn}
              onClick={() => onOpenMockExam({ domainId: domain.id, mode: 'bankburn' })}
            >
              Burn bank in Mock →
            </button>
          )}

          <div style={{ ...homeBodySm, fontWeight: 700, margin: '8px 0 6px', color: COLORS.silverMid, letterSpacing: 0.3 }}>
            Reference
          </div>
          {onOpenTermsHub && (
            <button type="button" className="ccna-hover" style={modeBtn} onClick={() => onOpenTermsHub({ domainId: domain.id })}>
              Terms Hub
            </button>
          )}
          {onOpenCommandHub && (
            <button type="button" className="ccna-hover" style={modeBtn} onClick={() => onOpenCommandHub({ domainId: domain.id, tab: 'commands' })}>
              Commands
            </button>
          )}
          {onOpenCommandHub && (
            <button type="button" className="ccna-hover" style={modeBtn} onClick={() => onOpenCommandHub({ domainId: domain.id, tab: 'sprint' })}>
              Command Sprint
            </button>
          )}
          <button type="button" className="ccna-hover" style={modeBtn} onClick={practiceDomain}>
            Practice domain
          </button>
          {onOpenLabs && studyMeta.labCount > 0 && (
            <button type="button" className="ccna-hover" style={{ ...modeBtn, marginBottom: 0 }} onClick={() => onOpenLabs({ domainId: domain.id })}>
              Domain labs ({studyMeta.labCount})
            </button>
          )}
        </div>
      )}
    </div>
  )
}
