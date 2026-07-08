import { describe, it, expect } from 'vitest'
import { WAVE16_SKILL_DESIGN_GOLD } from '../answerReview/goldAnswerReviewsWave16.js'
import { goldAnswerReviewFor } from '../answerReview/goldAnswerReviews.js'

const WAVE16_IDS = Object.keys(WAVE16_SKILL_DESIGN_GOLD)

describe('goldAnswerReviewsWave16', () => {
  it('covers 15–25 skill/design stems with structured debrief fields', () => {
    expect(WAVE16_IDS.length).toBeGreaterThanOrEqual(15)
    expect(WAVE16_IDS.length).toBeLessThanOrEqual(25)
  })

  it('each entry has correct, 3+ incorrect with whatItDoes/whyWrongHere, and examTip', () => {
    for (const id of WAVE16_IDS) {
      const gold = goldAnswerReviewFor(id)
      expect(gold, id).toBeTruthy()
      expect(gold.correct?.choiceIndex, id).toBeTypeOf('number')
      expect(gold.correct?.explanation, id).toBeTruthy()
      expect(gold.incorrect?.length, id).toBeGreaterThanOrEqual(3)
      expect(gold.examTip, id).toBeTruthy()

      for (const item of gold.incorrect) {
        expect(item.whatItDoes, `${id} choice ${item.choiceIndex}`).toBeTruthy()
        expect(item.whyWrongHere, `${id} choice ${item.choiceIndex}`).toBeTruthy()
        expect(item.misconceptionTested, `${id} choice ${item.choiceIndex}`).toBeTruthy()
        expect(item.explanation, `${id} choice ${item.choiceIndex}`).toBeTruthy()
      }
    }
  })

  it('overrides wave15 entries with structured fields for overlapping IDs', () => {
    const overlap = WAVE16_IDS.filter(id => id in WAVE16_SKILL_DESIGN_GOLD && goldAnswerReviewFor(id))
    expect(overlap.length).toBeGreaterThan(0)
    for (const id of overlap) {
      const gold = goldAnswerReviewFor(id)
      expect(gold.incorrect.every(i => i.whatItDoes && i.whyWrongHere), id).toBe(true)
    }
  })
})
