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
import {
  formatBankCoverageMeter,
  countNewThisWeek,
} from './buildExposureAwarePool.js'
import { buildDomainStudyHealth, formatStudyHealthStrip } from './domainStudyHealth.js'
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
import { homeBodySm } from '../../home/homeUi.js'

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
 * Spec 7 Domain Workspace body — plan CTA, coverage, lessons rail, ranked traps, modes.
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
  const [coverageLine, setCoverageLine] = useState(null)
  const [healthLine, setHealthLine] = useState(null)
  const [unseenCount, setUnseenCount] = useState(0)
  const [ownership, setOwnership] = useState({})

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
        setCoverageLine(formatBankCoverageMeter({
          bankCount: ids.length,
          seenCount: stats.seenCount,
          newThisWeek: countNewThisWeek(seenById),
        }))
        const health = buildDomainStudyHealth({
          domainId: domain.id,
          allQuestionIds: ids,
          exposureStore: store,
        })
        setHealthLine(formatStudyHealthStrip(health))
      } catch {
        if (!cancelled) {
          setCoverageLine(null)
          setHealthLine(null)
          setUnseenCount(0)
        }
      }
    })()
    loadTrapOwnership().then(s => { if (!cancelled) setOwnership(s || {}) }).catch(() => {})
    return () => { cancelled = true }
  }, [domain])

  function runPrimaryCta() {
    switch (actionPlan.primaryCta) {
      case 'baseline':
        onOpenDomainPlacement?.({ domainId: domain.id, expandOnReturn: true })
        break
      case 'fix_misses':
        onOpenMockExam?.({ domainId: domain.id, mode: 'bankburn', missOnly: true })
        break
      case 'study': {
        const oid = actionPlan.nextLessons[0] || domain.objectives[0]?.id
        const handoff = buildStudyObjectiveHandoff(oid, { tab: 'Study' })
        if (handoff) onSelectObjective(handoff)
        break
      }
      case 'pass':
        onOpenDomainPass?.({ domainId: domain.id })
        break
      case 'burn':
        onOpenMockExam?.({ domainId: domain.id, mode: 'bankburn' })
        break
      default:
        practiceDomain?.()
    }
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

  return (
    <div className="domain-workspace" style={{ marginTop: 12, borderTop: `1px solid ${COLORS.border}`, paddingTop: 10 }}>
      <div style={{ ...homeBodySm, fontWeight: 700, marginBottom: 4, color: COLORS.silverMid, letterSpacing: 0.3 }}>
        Plan
      </div>
      <div style={{ ...homeBodySm, marginBottom: 8, color: COLORS.silverMid }} aria-label="Domain readiness">
        {readinessLine}
      </div>
      {coverageLine && (
        <div style={{ ...homeBodySm, marginBottom: 4, color: COLORS.mint }} aria-label="Bank coverage">
          {coverageLine}
        </div>
      )}
      {healthLine && (
        <div style={{ ...homeBodySm, marginBottom: 8, color: COLORS.silverMid }} aria-label="Study health">
          {healthLine}
        </div>
      )}
      <button
        type="button"
        className="ccna-hover"
        style={{
          ...modeBtn,
          borderColor: COLORS.skyBorder,
          background: COLORS.skyDim,
          color: COLORS.sky,
          fontWeight: 700,
        }}
        onClick={runPrimaryCta}
      >
        {actionPlan.primaryLabel} →
      </button>

      <div style={{ ...homeBodySm, fontWeight: 700, margin: '12px 0 6px', color: COLORS.silverMid, letterSpacing: 0.3 }}>
        Lessons
      </div>
      {continueLesson && (
        <button
          type="button"
          className="ccna-hover"
          style={{ ...modeBtn, opacity: 0.95 }}
          onClick={() => {
            const handoff = buildStudyObjectiveHandoff(continueLesson.id, { tab: 'Study' })
            if (handoff) onSelectObjective(handoff)
          }}
        >
          Continue lesson · {continueLesson.id}
        </button>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
        {lessonsRail.slice(0, 4).map(row => (
          <div
            key={row.objective.id}
            style={{
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: '8px 10px',
            }}
          >
            <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: COLORS.silver, marginBottom: 6 }}>
              {row.objective.id} · {row.reason}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <button
                type="button"
                className="ccna-hover"
                style={{ ...modeBtn, marginBottom: 0, flex: '1 1 80px' }}
                onClick={() => {
                  const handoff = buildStudyObjectiveHandoff(row.objective.id, { tab: 'Study' })
                  if (handoff) onSelectObjective(handoff)
                }}
              >
                Study
              </button>
              <button
                type="button"
                className="ccna-hover"
                style={{ ...modeBtn, marginBottom: 0, flex: '1 1 80px' }}
                onClick={() => openProve5(row.objective.id)}
              >
                5Q prove
              </button>
              {row.hasLab && onOpenLabs && (
                <button
                  type="button"
                  className="ccna-hover"
                  style={{ ...modeBtn, marginBottom: 0, flex: '1 1 80px' }}
                  onClick={() => onOpenLabs({ domainId: domain.id, objectiveId: row.objective.id })}
                >
                  Lab
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {rankedTraps.length > 0 && (
        <>
          <div style={{ ...homeBodySm, fontWeight: 700, margin: '4px 0 6px', color: COLORS.silverMid, letterSpacing: 0.3 }}>
            Traps (unowned first)
          </div>
          {rankedTraps.map(t => (
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
                title={t.owned ? 'Mark unowned' : 'Mark owned'}
                onClick={() => toggleOwned(t.id)}
                style={{
                  ...modeBtn,
                  marginBottom: 0,
                  flex: '0 0 auto',
                  padding: '6px 10px',
                  borderColor: t.owned ? COLORS.mintBorder : COLORS.border,
                  color: t.owned ? COLORS.mint : COLORS.silverMid,
                }}
              >
                {t.owned ? 'Owned ✓' : 'Own'}
              </button>
            </div>
          ))}
        </>
      )}

      <div style={{ ...homeBodySm, fontWeight: 700, margin: '12px 0 6px', color: COLORS.silverMid, letterSpacing: 0.3 }}>
        Modes
      </div>
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
          Domain Pass — {passBadge}
        </button>
      )}
      {onOpenTrapDrill && (
        <button type="button" className="ccna-hover" style={{ ...modeBtn, opacity: 0.92 }} onClick={() => onOpenTrapDrill({ domainId: domain.id })}>
          Trap Drill
        </button>
      )}
      {onOpenTermsHub && (
        <button type="button" className="ccna-hover" style={{ ...modeBtn, opacity: 0.92 }} onClick={() => onOpenTermsHub({ domainId: domain.id })}>
          Terms Hub
        </button>
      )}
      {onOpenCommandHub && (
        <button type="button" className="ccna-hover" style={{ ...modeBtn, opacity: 0.92 }} onClick={() => onOpenCommandHub({ domainId: domain.id, tab: 'commands' })}>
          Commands
        </button>
      )}
      {onOpenCommandHub && (
        <button type="button" className="ccna-hover" style={{ ...modeBtn, opacity: 0.92 }} onClick={() => onOpenCommandHub({ domainId: domain.id, tab: 'sprint' })}>
          Command Sprint
        </button>
      )}
      <button type="button" className="ccna-hover" style={{ ...modeBtn, opacity: 0.92 }} onClick={practiceDomain}>
        Practice domain
      </button>
      {onOpenMockExam && (
        <button
          type="button"
          className="ccna-hover"
          style={{ ...modeBtn, opacity: 0.92 }}
          onClick={() => onOpenMockExam({ domainId: domain.id, mode: 'bankburn' })}
        >
          Burn bank in Mock →
        </button>
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
      {onOpenLabs && studyMeta.labCount > 0 && (
        <button type="button" className="ccna-hover" style={{ ...modeBtn, marginBottom: 0, opacity: 0.92 }} onClick={() => onOpenLabs({ domainId: domain.id })}>
          Domain labs ({studyMeta.labCount})
        </button>
      )}
    </div>
  )
}
