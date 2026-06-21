import { describe, it, expect, beforeAll } from 'vitest'
import { preloadCleanBank } from '../data/cleanQuestionAdapter.js'
import {
  buildDiagnosticSet,
  isValidDiagnosticQuestion,
  DIAGNOSTIC_CAP,
} from '../onboarding/diagnosticSet.js'
import { isMcQuestion, isOrderingQuestion } from '../questionUtils.js'

describe('placement diagnostic set', () => {
  beforeAll(async () => {
    await preloadCleanBank()
  })

  it('builds a non-empty mixed question set', async () => {
    const set = await buildDiagnosticSet()
    expect(set.length).toBeGreaterThan(0)
    expect(set.length).toBeLessThanOrEqual(DIAGNOSTIC_CAP)
  })

  it('every question is gradable and has an objectiveId', async () => {
    const set = await buildDiagnosticSet()
    for (const q of set) {
      expect(isValidDiagnosticQuestion(q)).toBe(true)
      expect(q.objectiveId).toBeTruthy()
      expect(isOrderingQuestion(q) || isMcQuestion(q)).toBe(true)
    }
  })

  it('includes at least one ordering question when available', async () => {
    const set = await buildDiagnosticSet()
    expect(set.some(isOrderingQuestion)).toBe(true)
  })
})
