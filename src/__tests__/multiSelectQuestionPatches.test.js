import { describe, it, expect } from 'vitest'
import { MULTI_SELECT_QUESTION_PATCHES } from '../data/multiSelectQuestionPatches.js'
import { isMultiQuestion, gradeQuestion } from '../questionUtils.js'
import { getEnrichmentPatchQuestions } from '../data/contentEnrichmentPatches.js'

describe('multiSelectQuestionPatches', () => {
  it('ships at least one multi question per domain 1–6', () => {
    const domains = new Set(
      Object.keys(MULTI_SELECT_QUESTION_PATCHES).map(id => id.split('.')[0]),
    )
    expect([...domains].sort()).toEqual(['1', '2', '3', '4', '5', '6'])
  })

  it('every patch question is a valid multi and grades exact-set', () => {
    for (const [oid, patch] of Object.entries(MULTI_SELECT_QUESTION_PATCHES)) {
      for (const q of patch.questions || []) {
        expect(isMultiQuestion(q), `${oid} ${q.id}`).toBe(true)
        expect(gradeQuestion(q, q.correctIndexes)).toBe(true)
        expect(gradeQuestion(q, q.correctIndexes.slice(0, 1))).toBe(false)
        const fromEnrichment = getEnrichmentPatchQuestions(oid).some(eq => eq.id === q.id)
        expect(fromEnrichment, `${q.id} wired into enrichment`).toBe(true)
      }
    }
  })
})
