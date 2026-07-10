import { describe, it, expect } from 'vitest'
import { CLI_SKILL_GOLD, goldCliReviewFor } from '../answerReview/goldAnswerReviewsCliSkill.js'
import { buildCliSkillQuestions } from '../data/cliSkillQuestions.js'

describe('goldAnswerReviewsCliSkill', () => {
  it('covers every CLI skill question with explanation and exam tip', () => {
    const qs = Object.values(buildCliSkillQuestions()).flat()
    expect(qs.length).toBeGreaterThan(40)
    for (const q of qs) {
      const gold = goldCliReviewFor(q.id, q)
      expect(gold?.explanation, q.id).toBeTruthy()
      expect(gold?.examTip, q.id).toBeTruthy()
    }
    expect(Object.keys(CLI_SKILL_GOLD).length).toBeGreaterThanOrEqual(20)
  })
})
