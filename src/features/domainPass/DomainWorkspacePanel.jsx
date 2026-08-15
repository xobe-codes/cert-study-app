import React, { useEffect, useMemo, useState } from 'react'
import { COLORS } from '../../ui/appTheme.js'
import { getCuratedQuestions } from '../../data/ccnaCurated.js'
import { isChoiceQuestion } from '../../questionUtils.js'
import { buildStudyObjectiveHandoff } from '../../study/studyObjectiveHandoff.js'
import {
  loadDomainQuestionExposure,
  getDomainSeenMap,
  getExposureStats,
} from './domainQuestionExposure.js'
import { collectDomainQuestionIds } from './buildDomainPassPool.js'
import { buildDomainActionPlan } from './domainBaselineActionPlan.js'
import { getTrapDrillCkusForDomain } from '../trapDrill/trapDrillQuestions.js'
import {
  loadTrapOwnership,
  rankDomainTraps,
} from './trapOwnership.js'
import { buildWeakBatch } from './weakBatch.js'
import { loadAnswerFluency } from '../study/answerFluency.js'
import FocusedLessonBank from '../../components/FocusedLessonBank.jsx'

function getMc(oid) {
  return getCuratedQuestions(oid).filter(isChoiceQuestion)
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
  studyMeta,
  onSelectObjective,
  onOpenLabs,
  onOpenTermsHub,
}) {
  const [unseenCount, setUnseenCount] = useState(0)
  const [ownership, setOwnership] = useState({})
  const [fluencyStore, setFluencyStore] = useState(null)

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
      } catch {
        if (!cancelled) {
          setUnseenCount(0)
        }
      }
    })()
    loadTrapOwnership().then(s => { if (!cancelled) setOwnership(s || {}) }).catch(() => {})
    return () => { cancelled = true }
  }, [domain])

  return (
    <div className="domain-workspace" style={{ marginTop: 12, borderTop: `1px solid ${COLORS.border}`, paddingTop: 10 }}>
      {/* Replace cluttered "Now" section with efficient FocusedLessonBank */}
      {batch.objectiveIds.length > 0 && (
        <FocusedLessonBank
          nextObjectives={batch.objectiveIds}
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
