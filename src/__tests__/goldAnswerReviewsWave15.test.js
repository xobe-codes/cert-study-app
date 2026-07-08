import { describe, it, expect } from 'vitest'
import { WAVE15_SKILL_DESIGN_GOLD } from '../answerReview/goldAnswerReviewsWave15.js'
import { goldAnswerReviewFor } from '../answerReview/goldAnswerReviews.js'

describe('goldAnswerReviewsWave15', () => {
  it('covers the ten previously missing skill/design stems', () => {
    const ids = Object.keys(WAVE15_SKILL_DESIGN_GOLD)
    expect(ids).toHaveLength(10)
    for (const id of ids) {
      const gold = goldAnswerReviewFor(id)
      expect(gold?.correct?.explanation, id).toBeTruthy()
      expect(gold?.incorrect?.length, id).toBeGreaterThanOrEqual(3)
      expect(gold?.examTip, id).toBeTruthy()
    }
  })
})
