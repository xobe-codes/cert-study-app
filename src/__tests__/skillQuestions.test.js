import { describe, it, expect } from 'vitest'
import { allSkillQuestions, getSkillQuestions } from '../data/ccnaSkillQuestions.js'
import { isOrderingQuestion, isMcQuestion, inferSkill } from '../questionUtils.js'

const MIN_SKILL_QUESTIONS = 55
const MIN_OBJECTIVES_COVERED = 45

function validateQuestion(q) {
  expect(q.question).toBeTruthy()
  expect(q.explanation).toBeTruthy()
  expect(['easy', 'medium', 'hard']).toContain(q.difficulty)
  expect(['design', 'implement', 'troubleshoot']).toContain(q.skill || inferSkill(q))
  if (isOrderingQuestion(q)) {
    expect(q.orderItems.length).toBeGreaterThanOrEqual(3)
  } else if (isMcQuestion(q)) {
    expect(q.choices.length).toBeGreaterThanOrEqual(2)
    expect(q.correctIndex).toBeGreaterThanOrEqual(0)
    expect(q.correctIndex).toBeLessThan(q.choices.length)
  } else {
    throw new Error(`Invalid question shape: ${q.id}`)
  }
}

describe('skill question bank', () => {
  const all = allSkillQuestions()

  it(`has at least ${MIN_SKILL_QUESTIONS} questions`, () => {
    expect(all.length).toBeGreaterThanOrEqual(MIN_SKILL_QUESTIONS)
  })

  it(`covers at least ${MIN_OBJECTIVES_COVERED} objectives`, () => {
    const ids = new Set(all.map(q => q.objectiveId))
    expect(ids.size).toBeGreaterThanOrEqual(MIN_OBJECTIVES_COVERED)
  })

  it('has unique question ids', () => {
    const ids = all.map(q => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes design, implement, and troubleshoot skills', () => {
    const skills = new Set(all.map(q => q.skill || inferSkill(q)))
    expect(skills.has('design')).toBe(true)
    expect(skills.has('implement')).toBe(true)
    expect(skills.has('troubleshoot')).toBe(true)
  })

  it('includes ordering and troubleshooting types', () => {
    expect(all.some(isOrderingQuestion)).toBe(true)
    expect(all.some(q => q.type === 'troubleshooting')).toBe(true)
  })

  it('every question passes shape validation', () => {
    all.forEach(validateQuestion)
  })

  it('getSkillQuestions returns merged bank per objective', () => {
    const qs = getSkillQuestions('4.1')
    expect(qs.length).toBeGreaterThanOrEqual(2)
    qs.forEach(validateQuestion)
  })
})
