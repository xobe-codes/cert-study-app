import { describe, it, expect, beforeEach } from 'vitest'
import {
  setSkillQuestionsModule,
  getSkillQuestionsLazy,
  allSkillQuestionsLazy,
} from '../data/skillQuestionsRegistry.js'
import * as skillQuestions from '../data/ccnaSkillQuestions.js'

describe('skillQuestionsRegistry', () => {
  beforeEach(() => {
    setSkillQuestionsModule(skillQuestions)
  })

  it('returns skill questions after module registration', () => {
    expect(allSkillQuestionsLazy().length).toBeGreaterThan(50)
    expect(getSkillQuestionsLazy('4.1').length).toBeGreaterThan(0)
  })

  it('falls back to empty before registration', () => {
    setSkillQuestionsModule({
      getSkillQuestions: () => [],
      allSkillQuestions: () => [],
    })
    expect(allSkillQuestionsLazy()).toEqual([])
    expect(getSkillQuestionsLazy('1.1')).toEqual([])
    setSkillQuestionsModule(skillQuestions)
  })
})
