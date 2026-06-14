import { describe, it, expect } from 'vitest'
import {
  computeDefaultReadingTier,
  getReadingTier,
  readingTierHint,
  studyMetaToProgress,
  READING_TIER_KEYS,
} from '../lesson/readingTier.js'

describe('readingTier', () => {
  it('defaults tested-out learners to exam-ready', () => {
    expect(computeDefaultReadingTier({ testedOut: true })).toBe(READING_TIER_KEYS.examReady)
  })

  it('maps pre-assessment score bands to depth', () => {
    expect(computeDefaultReadingTier({ preAssessPct: 0.9 })).toBe(READING_TIER_KEYS.intermediate)
    expect(computeDefaultReadingTier({ preAssessPct: 0.7 })).toBe(READING_TIER_KEYS.intermediate)
    expect(computeDefaultReadingTier({ preAssessPct: 0.5 })).toBe(READING_TIER_KEYS.beginner)
  })

  it('prefers saved readingTier override', () => {
    expect(getReadingTier({ testedOut: true, readingTier: 'beginner' })).toBe('beginner')
  })

  it('hints for tested-out exam-ready view', () => {
    const hint = readingTierHint({ testedOut: true }, READING_TIER_KEYS.examReady)
    expect(hint?.type).toBe('testedOut')
    expect(hint?.showFullWalkthrough).toBe(true)
  })

  it('serializes study meta for progress', () => {
    expect(studyMetaToProgress({ direct: true })).toEqual({ studyPath: 'direct' })
    expect(studyMetaToProgress({ preAssessPct: 0.67 })).toEqual({
      preAssessPct: 0.67,
      studyPath: 'preassess',
    })
  })
})
