import { describe, it, expect } from 'vitest'
import { BATCH33_GOLD } from '../answerReview/goldAnswerReviewsBatch33.js'
import { goldAnswerReviewFor } from '../answerReview/goldAnswerReviews.js'
import { isFallbackExplanation, isTemplateWhyWrongHere } from '../answerReview/answerReviewQuality.js'

describe('goldAnswerReviewsBatch33', () => {
  it('polishes 40 remaining short/high-traffic debriefs', () => {
    expect(Object.keys(BATCH33_GOLD).length).toBe(40)
  })

  it('registers each id in GOLD_ANSWER_REVIEWS', () => {
    for (const id of Object.keys(BATCH33_GOLD)) {
      expect(goldAnswerReviewFor(id), id).toBeTruthy()
      expect(goldAnswerReviewFor(id)).toEqual(BATCH33_GOLD[id])
    }
  })

  it('keeps incorrect explanations stem-specific and non-template', () => {
    for (const [id, gold] of Object.entries(BATCH33_GOLD)) {
      expect(gold.correct?.explanation?.length, id).toBeGreaterThanOrEqual(40)
      expect(gold.examTip?.length, id).toBeGreaterThanOrEqual(20)
      for (const item of gold.incorrect || []) {
        expect(item.explanation.length, `${id}:${item.choiceIndex}`).toBeGreaterThanOrEqual(55)
        expect(isFallbackExplanation(item.explanation), `${id}:${item.choiceIndex}`).toBe(false)
        expect(isTemplateWhyWrongHere(item.explanation), `${id}:${item.choiceIndex}`).toBe(false)
        expect(item.misconceptionTested, `${id}:${item.choiceIndex}`).toBeTruthy()
      }
    }
  })
})
