import { describe, it, expect, beforeAll } from 'vitest'
import { preloadCleanBank } from '../data/cleanQuestionAdapter.js'
import { PLACEMENT_QUESTION_COUNT, placementReadyBand } from '../features/domainPlacement/domainPlacementConfig.js'
import { getPlacementBlueprint, placementDomainIds } from '../features/domainPlacement/placementBlueprints.js'
import { buildPlacementPool } from '../features/domainPlacement/buildPlacementPool.js'
import { computePlacementReport } from '../features/domainPlacement/computePlacementReport.js'
import { computePlacementDelta } from '../features/domainPlacement/computePlacementDelta.js'
import { pickPlacementCta } from '../features/domainPlacement/pickPlacementCta.js'
import { shouldSuggestPlacement } from '../features/domainPlacement/domainPlacementStorage.js'
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

describe('shouldSuggestPlacement', () => {
  it('suggests when never taken or stale/low', () => {
    expect(shouldSuggestPlacement(null)).toBe(true)
    expect(shouldSuggestPlacement({ lastAttempt: { at: Date.now() - 20 * 24 * 60 * 60 * 1000, pct: 90 } })).toBe(true)
    expect(shouldSuggestPlacement({ lastAttempt: { at: Date.now(), pct: 55 } })).toBe(true)
    expect(shouldSuggestPlacement({ lastAttempt: { at: Date.now(), pct: 85 } })).toBe(false)
  })
})
