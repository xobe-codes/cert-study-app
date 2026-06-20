import { describe, it, expect } from 'vitest'
import {
  countSentences,
  resolveBigTakeaway,
  explanationBodyFromReading,
  validateReadingExplanation,
  EXPLANATION_PILOT_IDS,
} from '../lesson/explanationFormat.js'
import { getCurated } from '../data/ccnaCurated.js'
import { EXPLANATION_PILOT_PATCHES } from '../data/explanationPilotPatches.js'

describe('explanationFormat', () => {
  it('counts sentences in prose', () => {
    expect(countSentences('One. Two! Three?')).toBe(3)
  })

  it('prefers authored bigTakeaway', () => {
    expect(resolveBigTakeaway({ bigTakeaway: 'Remember LPM first.', keyPoints: ['Other'] })).toBe('Remember LPM first.')
  })

  it('reads tier body for curated explanation', () => {
    const body = explanationBodyFromReading({
      tiers: { intermediate: 'Short plain text.' },
    }, 'intermediate')
    expect(body).toBe('Short plain text.')
  })

  it('validates pilot 4.2 NTP reading after merge protects supplement', () => {
    const curated = getCurated('4.2')
    const errs = validateReadingExplanation(curated.reading, '4.2')
    expect(errs).toEqual([])
    expect(curated.reading.tiers.examReady).not.toMatch(/Exam Topic/i)
  })

  it('validates authored explanation pilot patches', () => {
    const allErrors = []
    for (const [id, patch] of Object.entries(EXPLANATION_PILOT_PATCHES)) {
      const reading = { tiers: patch.tiers, bigTakeaway: patch.bigTakeaway }
      allErrors.push(...validateReadingExplanation(reading, id))
    }
    expect(allErrors).toEqual([])
  })

  it('legacy pilot objectives pass format check at runtime', () => {
    const legacy = ['3.2', '4.1', '4.2', '4.3']
    const allErrors = []
    for (const id of legacy) {
      expect(EXPLANATION_PILOT_IDS.has(id)).toBe(true)
      const curated = getCurated(id)
      allErrors.push(...validateReadingExplanation(curated?.reading, id))
    }
    expect(allErrors).toEqual([])
  })
})
