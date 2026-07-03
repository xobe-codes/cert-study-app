import { describe, it, expect } from 'vitest'
import { BATCH28_GOLD } from '../answerReview/goldAnswerReviewsBatch28.js'

describe('goldAnswerReviewsBatch28', () => {
  it('has 50 hand-authored entries', () => {
    expect(Object.keys(BATCH28_GOLD).length).toBe(50)
  })
})
