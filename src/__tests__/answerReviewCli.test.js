import { describe, it, expect } from 'vitest'
import { isCliQuestion, gradeQuestion } from '../questionUtils.js'

// Minimal render check via gradeQuestion + label paths used in AnswerReview
describe('AnswerReview CLI paths', () => {
  const cliQ = {
    type: 'cli',
    question: 'Create VLAN 20',
    answers: ['vlan 20'],
    explanation: 'Global config: vlan <id>.',
  }

  it('grades shorthand CLI answers for review reveal', () => {
    expect(isCliQuestion(cliQ)).toBe(true)
    expect(gradeQuestion(cliQ, 'vlan 20')).toBe(true)
    expect(gradeQuestion(cliQ, 'vlan 99')).toBe(false)
  })
})
