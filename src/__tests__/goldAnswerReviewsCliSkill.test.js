import { describe, it, expect } from 'vitest'
import { CLI_SKILL_GOLD, goldCliReviewFor } from '../answerReview/goldAnswerReviewsCliSkill.js'
import { buildCliSkillQuestions } from '../data/cliSkillQuestions.js'

describe('goldAnswerReviewsCliSkill', () => {
  it('covers every CLI skill question with explanation and exam tip', () => {
    const ids = Object.values(buildCliSkillQuestions()).flat().map(q => q.id)
    expect(ids.length).toBeGreaterThan(0)
    for (const id of ids) {
      const gold = goldCliReviewFor(id)
      expect(gold?.explanation, id).toBeTruthy()
      expect(gold?.examTip, id).toBeTruthy()
    }
    expect(Object.keys(CLI_SKILL_GOLD)).toHaveLength(ids.length)
  })
})
