import { describe, it, expect } from 'vitest'
import {
  countSentences,
  resolveBigTakeaway,
  explanationBodyFromReading,
  validateReadingExplanation,
  EXPLANATION_PILOT_IDS,
} from '../lesson/explanationFormat.js'
import { getCurated } from '../data/ccnaCurated.js'

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

  it('validates pilot 4.2 NTP reading', () => {
    const curated = getCurated('4.2')
    const errs = validateReadingExplanation(curated.reading, '4.2', { pilotOnly: false })
    expect(errs).toEqual([])
  })

  it('validates all pilot objectives via getCurated', () => {
    const allErrors = []
    for (const id of EXPLANATION_PILOT_IDS) {
      const curated = getCurated(id)
      allErrors.push(...validateReadingExplanation(curated?.reading, id, { pilotOnly: false }))
    }
    expect(allErrors).toEqual([])
  })
})
