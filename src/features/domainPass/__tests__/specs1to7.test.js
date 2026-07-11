import { describe, it, expect } from 'vitest'
import {
  buildExposureAwarePool,
  formatBankCoverageMeter,
  countNewThisWeek,
  UNSEEN_SOFT_FLOOR,
  EXPOSURE_MIX,
} from '../buildExposureAwarePool.js'
import { STALE_DAYS_MS } from '../domainQuestionExposure.js'
import { buildMissDrillQueue, formatMissStudyNextLine } from '../missDrillQueue.js'
import { buildDomainLessonsRail } from '../domainLessonsRail.js'
import { rankDomainTraps, topUnownedTraps, isTrapOwned } from '../trapOwnership.js'
import { buildDomainActionPlan, remapObjectiveFilter } from '../domainBaselineActionPlan.js'
import { buildDomainSessionSummary } from '../domainProgressBus.js'
import { resolveTrapDomainNumber, getTrapDrillCkusForDomain } from '../../trapDrill/trapDrillQuestions.js'

const NOW = Date.now()
const RECENT = NOW - 60_000
const STALE = NOW - STALE_DAYS_MS - 60_000

function q(id) {
  return { id, question: id, choices: ['a', 'b'], correctIndex: 0 }
}

describe('buildExposureAwarePool Spec 1', () => {
  it('targets ~60/25/15 mix and prefers unseen', () => {
    const candidates = Array.from({ length: 20 }, (_, i) => q(`q${i}`))
    const seenById = {}
    for (let i = 0; i < 8; i++) seenById[`q${i}`] = i < 4 ? STALE : RECENT
    const missRetryIds = ['q4', 'q5']
    const pool = buildExposureAwarePool({
      candidates,
      seenById,
      missRetryIds,
      count: 10,
      shuffle: a => a,
      now: NOW,
    })
    expect(pool).toHaveLength(10)
    const ids = pool.map(x => x.id)
    // Unseen q8–q19 should dominate early slots
    expect(ids.slice(0, 6).every(id => Number(id.slice(1)) >= 8)).toBe(true)
  })

  it('soft floor: at most 1 recent when unseen ≥ floor', () => {
    const candidates = Array.from({ length: UNSEEN_SOFT_FLOOR + 5 }, (_, i) => q(`q${i}`))
    const seenById = { q0: RECENT, q1: RECENT, q2: RECENT }
    const pool = buildExposureAwarePool({
      candidates,
      seenById,
      count: 8,
      shuffle: a => a,
      now: NOW,
      softFloor: UNSEEN_SOFT_FLOOR,
    })
    const recentCount = pool.filter(x => ['q0', 'q1', 'q2'].includes(x.id)).length
    expect(recentCount).toBeLessThanOrEqual(1)
  })

  it('formats coverage meter', () => {
    expect(formatBankCoverageMeter({ bankCount: 214, seenCount: 128, newThisWeek: 12 }))
      .toBe('Bank coverage 128/214 · 12 new this week')
    expect(countNewThisWeek({ a: NOW - 1000, b: NOW - 8 * 86400000 }, NOW)).toBe(1)
  })

  it('exports mix constants', () => {
    expect(EXPOSURE_MIX.unseen).toBe(0.6)
  })
})

describe('missDrillQueue Spec 3', () => {
  it('builds domain miss queue with CKU siblings', () => {
    const domains = [{ id: 'access', objectives: [{ id: '2.1' }, { id: '2.2' }] }]
    const missed = [
      { id: 'm1', objectiveId: '2.1', ckuIds: ['CKU-A'] },
      { id: 'm2', objectiveId: '1.1', ckuIds: ['CKU-X'] },
    ]
    const bankByObjective = {
      '2.1': [
        { id: 'm1', ckuIds: ['CKU-A'] },
        { id: 'sib', ckuIds: ['CKU-A'] },
        { id: 'other', ckuIds: ['CKU-B'] },
      ],
    }
    const ids = buildMissDrillQueue({
      missed,
      domainId: 'access',
      domains,
      bankByObjective,
      size: 10,
    })
    expect(ids[0]).toBe('m1')
    expect(ids).toContain('sib')
    expect(ids).not.toContain('m2')
  })

  it('formats study next line', () => {
    expect(formatMissStudyNextLine('Access', 9)).toBe('Access · 9 misses · Fix now')
  })
})

describe('domainLessonsRail Spec 4', () => {
  it('sorts weak then low mastery then unseen', () => {
    const domain = {
      id: 'access',
      objectives: [
        { id: '2.1', title: 'A' },
        { id: '2.2', title: 'B' },
        { id: '2.3', title: 'C' },
      ],
    }
    const rail = buildDomainLessonsRail({
      domain,
      progress: {
        '2.1': { masteryScore: 90, status: 'in_progress', lastSeen: 1 },
        '2.2': { masteryScore: 20, status: 'in_progress', lastSeen: 1 },
      },
      baselineSummary: { weakObjectives: ['2.3'] },
    })
    expect(rail.map(r => r.objective.id)).toEqual(['2.3', '2.2', '2.1'])
  })
})

describe('trapOwnership Spec 5', () => {
  it('ranks unowned traps first and respects ownership', () => {
    const ranked = rankDomainTraps(
      [
        { id: 't1', objectiveId: '2.1', ckuId: 'CKU-A' },
        { id: 't2', objectiveId: '2.2', ckuId: 'CKU-B' },
      ],
      {
        missFreqByTrap: { t2: 5 },
        weakObjectiveIds: ['2.2'],
        ownership: { t2: Date.now() },
      },
    )
    expect(ranked[0].id).toBe('t1')
    expect(isTrapOwned({ t2: 1 }, 't2')).toBe(true)
    expect(topUnownedTraps(ranked, 1)[0].id).toBe('t1')
  })

  it('resolves domain slug to trap number', () => {
    expect(resolveTrapDomainNumber('access')).toBe('2')
    expect(getTrapDrillCkusForDomain('access').length).toBeGreaterThan(0)
  })
})

describe('domainBaselineActionPlan Spec 6', () => {
  it('primary CTA prefers fix misses then study weak', () => {
    const plan = buildDomainActionPlan({
      baselineSummary: {
        domainStatus: 'needs_work',
        weakObjectives: ['2.1'],
        strongObjectives: ['2.2'],
        notCheckedObjectives: [],
      },
      missCount: 5,
      unseenCount: 3,
      hasPlacement: true,
    })
    expect(plan.primaryCta).toBe('fix_misses')
    expect(remapObjectiveFilter(plan)).toEqual(['2.1'])
  })
})

describe('domainProgressBus Spec 2', () => {
  it('builds session summary', () => {
    const s = buildDomainSessionSummary({
      domainId: 'access',
      results: [
        { objectiveId: '2.1', correct: true },
        { objectiveId: '2.2', correct: false },
      ],
      coverageBefore: { seenCount: 10 },
      coverageAfter: { seenCount: 12 },
    })
    expect(s.objectivesTouched).toEqual(['2.1', '2.2'])
    expect(s.bankBurnDelta).toBe(2)
    expect(s.pct).toBe(50)
  })
})
