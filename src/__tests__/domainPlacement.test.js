import { describe, it, expect, beforeAll } from 'vitest'
import { preloadCleanBank } from '../data/cleanQuestionAdapter.js'
import { PLACEMENT_QUESTION_COUNT, placementReadyBand } from '../features/domainPlacement/domainPlacementConfig.js'
import { getPlacementBlueprint, placementDomainIds } from '../features/domainPlacement/placementBlueprints.js'
import { buildPlacementPool } from '../features/domainPlacement/buildPlacementPool.js'
import { computePlacementReport } from '../features/domainPlacement/computePlacementReport.js'
import { computePlacementDelta } from '../features/domainPlacement/computePlacementDelta.js'
import { pickPlacementCta } from '../features/domainPlacement/pickPlacementCta.js'
import { shouldSuggestPlacement } from '../features/domainPlacement/domainPlacementStorage.js'
import {
  computeWeakObjectivesFromPlacement,
  orderPlacementBlueprintItems,
} from '../features/domainPlacement/placementAdaptiveRetake.js'
import { gradeQuestion } from '../questionUtils.js'

beforeAll(async () => {
  await preloadCleanBank()
})

describe('domainPlacementConfig', () => {
  it('all six domains have 15-question blueprints', () => {
    expect(placementDomainIds()).toHaveLength(6)
    expect(PLACEMENT_QUESTION_COUNT).toBe(15)
    expect(placementReadyBand(80).label).toBe('Strong')
    expect(placementReadyBand(50).accent).toBe('rose')
  })
})

describe('placement blueprint + pool', () => {
  it('loads fixed blueprints for every CCNA domain', () => {
    for (const domainId of placementDomainIds()) {
      const bp = getPlacementBlueprint(domainId)
      expect(bp).toBeTruthy()
      expect(bp.items).toHaveLength(15)

      const pool = buildPlacementPool(domainId)
      expect(pool.questions).toHaveLength(15)
      expect(pool.blueprintVersion).toBe(1)
      expect(Object.keys(pool.trapByQuestionId).length).toBe(15)
    }
  })

  it('rejects unknown domains', () => {
    expect(getPlacementBlueprint('unknown')).toBeNull()
    expect(() => buildPlacementPool('unknown')).toThrow(/not available/i)
  })

  it('sprint mode filters to weak and unsampled objectives', () => {
    const pool = buildPlacementPool('security', {
      mode: 'sprint',
      sprintObjectiveIds: ['5.1', '5.3', '5.5'],
      weakObjectiveIds: ['5.3', '5.5'],
    })
    expect(pool.mode).toBe('sprint')
    expect(pool.questions.length).toBeGreaterThan(0)
    expect(pool.questions.length).toBeLessThanOrEqual(15)
    const objectiveIds = new Set(pool.questions.map(q => q.objectiveId))
    expect(objectiveIds.has('5.1') || objectiveIds.has('5.3')).toBe(true)
    expect(objectiveIds.has('5.8')).toBe(false)
  })
})

describe('computePlacementReport', () => {
  it('scores overall, traps, and weakest objective', () => {
    const pool = buildPlacementPool('security')
    const responses = {}
    pool.questions.forEach((q, idx) => {
      responses[idx] = q.correctIndex ?? 0
    })
    const report = computePlacementReport({
      questions: pool.questions,
      responses,
      trapByQuestionId: pool.trapByQuestionId,
    })
    expect(report.pct).toBe(100)
    expect(report.trapPct).toBe(100)
    expect(report.weakestObjective).toBeTruthy()
    expect(report.wrongQuestions).toHaveLength(0)
  })

  it('tracks trap misses and wrong questions', () => {
    const pool = buildPlacementPool('access')
    const q = pool.questions[0]
    const wrongIdx = q.choices.findIndex((_, i) => !gradeQuestion(q, i))
    const responses = { 0: wrongIdx }
    const report = computePlacementReport({
      questions: [q],
      responses,
      trapByQuestionId: { [q.id]: true },
    })
    expect(report.correct).toBe(0)
    expect(report.trapMisses.length).toBeGreaterThan(0)
    expect(report.wrongQuestions[0].questionId).toBe(q.id)
  })
})

describe('computePlacementDelta', () => {
  it('compares objective and overall deltas', () => {
    const delta = computePlacementDelta(
      {
        at: Date.now(),
        pct: 80,
        trapPct: 70,
        byObjective: { '5.1': { correct: 2, total: 2 }, '5.2': { correct: 0, total: 2 } },
      },
      {
        at: Date.now() - 7 * 24 * 60 * 60 * 1000,
        pct: 60,
        trapPct: 50,
        byObjective: { '5.1': { correct: 1, total: 2 }, '5.2': { correct: 1, total: 2 } },
      },
    )
    expect(delta.pctDelta).toBe(20)
    expect(delta.trapPctDelta).toBe(20)
    expect(delta.improvedObjectives.length).toBeGreaterThan(0)
    expect(delta.slippedObjectives.length).toBeGreaterThan(0)
  })
})

describe('pickPlacementCta', () => {
  it('prefers trap drill when trap misses exist', () => {
    const pool = buildPlacementPool('connectivity')
    const q = pool.questions.find(item => pool.trapByQuestionId[item.id])
    const wrongIdx = q.choices.findIndex((_, i) => !gradeQuestion(q, i))
    const report = computePlacementReport({
      questions: [q],
      responses: { 0: wrongIdx },
      trapByQuestionId: { [q.id]: true },
    })
    const cta = pickPlacementCta(report)
    expect(cta?.kind).toMatch(/trapDrill|study|lab/)
    expect(cta?.label).toBeTruthy()
  })
})

describe('placement adaptive retake', () => {
  it('computes weak objectives from prior attempt stats', () => {
    const weak = computeWeakObjectivesFromPlacement({
      '5.1': { correct: 2, total: 2 },
      '5.2': { correct: 0, total: 2 },
      '5.3': { correct: 1, total: 2 },
    })
    expect(weak).toContain('5.2')
    expect(weak).toContain('5.3')
    expect(weak).not.toContain('5.1')
    expect(weak[0]).toBe('5.2')
  })

  it('front-loads weak blueprint items on adaptive retake', () => {
    const items = [
      { id: 'a', objectiveId: '1.1' },
      { id: 'b', objectiveId: '1.2' },
      { id: 'c', objectiveId: '1.3' },
      { id: 'd', objectiveId: '1.1' },
      { id: 'e', objectiveId: '1.2' },
    ]
    const ordered = orderPlacementBlueprintItems(items, {
      weakObjectiveIds: ['1.2'],
      shuffle: arr => arr,
    })
    const weakIdx = ordered.findIndex(i => i.objectiveId === '1.2')
    const otherIdx = ordered.findIndex(i => i.objectiveId === '1.3')
    expect(weakIdx).toBeLessThan(otherIdx)
    expect(ordered.map(i => i.id).sort()).toEqual(items.map(i => i.id).sort())
  })

  it('builds adaptive pool with same stems as baseline', () => {
    const baseline = buildPlacementPool('fundamentals')
    const adaptive = buildPlacementPool('fundamentals', { weakObjectiveIds: ['1.1', '1.2'] })
    expect(adaptive.mode).toBe('adaptive')
    expect(adaptive.questions).toHaveLength(15)
    expect(adaptive.questions.map(q => q.id).sort()).toEqual(baseline.questions.map(q => q.id).sort())
    expect(adaptive.questions[0].objectiveId).toMatch(/^1\.(1|2)$/)
  })

  it('builds maintenance pool with trap stems only', () => {
    const pool = buildPlacementPool('security', { mode: 'maintenance' })
    expect(pool.mode).toBe('maintenance')
    expect(pool.questions).toHaveLength(3)
    expect(Object.values(pool.trapByQuestionId).filter(Boolean).length).toBeGreaterThan(0)
  })
})

describe('shouldSuggestPlacement', () => {
  it('suggests when never taken or stale/low', () => {
    expect(shouldSuggestPlacement(null)).toBe(true)
    expect(shouldSuggestPlacement({ lastAttempt: { at: Date.now() - 20 * 24 * 60 * 60 * 1000, pct: 90 } })).toBe(true)
    expect(shouldSuggestPlacement({ lastAttempt: { at: Date.now(), pct: 55 } })).toBe(true)
    expect(shouldSuggestPlacement({ lastAttempt: { at: Date.now(), pct: 85 } })).toBe(false)
  })
})

describe('placement objective breakdown', () => {
  it('sorts objectives weakest-first for debrief rows', async () => {
    const { default: DomainPlacementObjectiveBreakdown } = await import('../features/domainPlacement/DomainPlacementObjectiveBreakdown.jsx')
    const { renderToStaticMarkup } = await import('react-dom/server')
    const React = await import('react')
    const html = renderToStaticMarkup(
      React.createElement(DomainPlacementObjectiveBreakdown, {
        domainId: 'security',
        byObjective: { '5.1': { correct: 0, total: 2 }, '5.2': { correct: 2, total: 2 } },
        previousByObjective: { '5.1': { correct: 1, total: 2 } },
        onStudyObjective: () => {},
        showAllObjectives: true,
      }),
    )
    expect(html).toContain('Baseline map')
    expect(html).toContain('Study')
    expect(html).toContain('5.1')
    expect(html.indexOf('5.1')).toBeLessThan(html.indexOf('5.2'))
  })

  it('exports objectiveRows weakest-first', async () => {
    const { objectiveRows } = await import('../features/domainPlacement/DomainPlacementObjectiveBreakdown.jsx')
    const rows = objectiveRows({ '5.2': { correct: 2, total: 2 }, '5.1': { correct: 0, total: 2 } })
    expect(rows[0].id).toBe('5.1')
    expect(rows[0].pct).toBe(0)
  })
})
