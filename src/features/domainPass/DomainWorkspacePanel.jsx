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
import FocusedLessonBank from '../../components/FocusedLessonBank.jsx'

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

      {/* Option B: Clean domain entry point. Secondary tools (Traps, More tools)
          will appear after practice session in quiz debrief screen. */}
    </div>
  )
}
