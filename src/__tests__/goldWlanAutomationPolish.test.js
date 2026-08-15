import { describe, it, expect } from 'vitest'
import { GOLD_ANSWER_REVIEWS } from '../answerReview/goldAnswerReviewsData.js'
import { WLAN_AUTOMATION_POLISH_GOLD } from '../answerReview/goldAnswerReviewsWlanAutomationPolish.js'

describe('goldAnswerReviewsWlanAutomationPolish', () => {
  it('polishes 8 high-traffic WLAN/automation stems', () => {
    expect(Object.keys(WLAN_AUTOMATION_POLISH_GOLD)).toHaveLength(8)
  })

  it('wires polish entries into GOLD_ANSWER_REVIEWS', () => {
    for (const id of Object.keys(WLAN_AUTOMATION_POLISH_GOLD)) {
      expect(GOLD_ANSWER_REVIEWS[id]?.examTip, id).toBeTruthy()
      expect(GOLD_ANSWER_REVIEWS[id]?.incorrect?.length, id).toBe(3)
    }
  })
})
