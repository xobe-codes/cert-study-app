import { describe, it, expect } from 'vitest'
import { countObjectiveQuestions } from '../data/questionBankCount.js'
import { getSkillQuestions } from '../data/ccnaSkillQuestions.js'
import { ALL_OBJECTIVES } from '../data/ccnaDomains.js'

describe('content_depth_wave2 acceptance', () => {
  it('every objective has ≥8 questions (clean bank + skill)', () => {
    const thin = ALL_OBJECTIVES
      .map(o => ({ id: o.id, count: countObjectiveQuestions(o.id) }))
      .filter(r => r.count < 8)
    expect(thin, `below 8: ${thin.map(t => `${t.id}:${t.count}`).join(', ')}`).toEqual([])
  })
})

describe('content_depth_35_hsrp acceptance', () => {
  it('objective 3.5 has ≥8 questions and ≥2 troubleshooting skill items', () => {
    expect(countObjectiveQuestions('3.5')).toBeGreaterThanOrEqual(8)
    expect(getSkillQuestions('3.5').filter(q => q.type === 'troubleshooting').length).toBeGreaterThanOrEqual(2)
  })
})

describe('questionBankCount sync helper', () => {
  it('matches loaded clean bank list length after preload', async () => {
    const { preloadCleanBank } = await import('../data/cleanQuestionAdapter.js')
    const { getCuratedQuestions } = await import('../data/ccnaCurated.js')
    await preloadCleanBank()
    for (const id of ['3.5', '5.9', '6.1']) {
      expect(countObjectiveQuestions(id)).toBe(getCuratedQuestions(id).length)
    }
  })
})
