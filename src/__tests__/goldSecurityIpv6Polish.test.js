import { describe, it, expect } from 'vitest'
import { GOLD_ANSWER_REVIEWS } from '../answerReview/goldAnswerReviews.js'
import { SECURITY_IPV6_POLISH_GOLD } from '../answerReview/goldAnswerReviewsSecurityIpv6Polish.js'

describe('goldAnswerReviewsSecurityIpv6Polish', () => {
  it('polishes security, IPv6, routing, and automation stems', () => {
    expect(Object.keys(SECURITY_IPV6_POLISH_GOLD)).toHaveLength(11)
  })

  it('wires polish entries into GOLD_ANSWER_REVIEWS', () => {
    for (const id of Object.keys(SECURITY_IPV6_POLISH_GOLD)) {
      expect(GOLD_ANSWER_REVIEWS[id]?.examTip, id).toBeTruthy()
      expect(GOLD_ANSWER_REVIEWS[id]?.incorrect?.length, id).toBe(3)
    }
  })
})
