import { describe, it, expect } from 'vitest'
import { filterHealthyQuestions, countExcludedQuestions } from '../data/questionHealth.js'
import { isQuestionExcluded, EXCLUDED_QUESTION_IDS } from '../data/questionHealthRegistry.js'
import { FLAG_REASON_IDS, LEARNER_QUARANTINE_THRESHOLD } from '../data/questionHealthConstants.js'

describe('question_health_registry', () => {
  it('exports exclusion set and filter helper', () => {
    expect(EXCLUDED_QUESTION_IDS).toBeInstanceOf(Set)
    const qs = [{ id: 'a' }, { id: 'b' }]
    const filtered = filterHealthyQuestions(qs)
    expect(filtered.length).toBeLessThanOrEqual(qs.length)
  })

  it('filterHealthyQuestions removes excluded ids', () => {
    const excluded = [...EXCLUDED_QUESTION_IDS][0]
    if (!excluded) return
    const qs = [{ id: excluded, question: 'x' }, { id: 'healthy-id', question: 'y' }]
    expect(filterHealthyQuestions(qs)).toEqual([{ id: 'healthy-id', question: 'y' }])
    expect(countExcludedQuestions(qs)).toBe(1)
    expect(isQuestionExcluded(excluded)).toBe(true)
  })

  it('defines structured flag reasons', () => {
    expect(FLAG_REASON_IDS.has('wrong_key')).toBe(true)
    expect(FLAG_REASON_IDS.has('ambiguous')).toBe(true)
    expect(FLAG_REASON_IDS.has('bad_display')).toBe(true)
    expect(LEARNER_QUARANTINE_THRESHOLD).toBeGreaterThan(1)
  })
})
