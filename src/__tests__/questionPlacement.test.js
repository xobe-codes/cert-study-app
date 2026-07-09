import { describe, it, expect } from 'vitest'
import {
  isIosOrderingQuestion,
  isSyntaxCoachQuestion,
  isCommandDrillQuestion,
  looksLikeIosStep,
} from '../commands/questionPlacement.js'
import { allSkillQuestions } from '../data/ccnaSkillQuestions.js'
import { buildDrillQuizItems } from '../commands/commandDrillQuiz.js'

describe('question placement matrix', () => {
  it('detects IOS-like ordering steps', () => {
    expect(looksLikeIosStep('vlan 20')).toBe(true)
    expect(looksLikeIosStep('interface gi0/1')).toBe(true)
    expect(looksLikeIosStep('Authentication — verify username/password')).toBe(false)
  })

  it('marks IOS ordering skill questions as syntax-coach eligible', () => {
    const iosOrder = allSkillQuestions().filter(isIosOrderingQuestion)
    expect(iosOrder.length).toBeGreaterThan(5)
    expect(iosOrder.every(isSyntaxCoachQuestion)).toBe(true)
  })

  it('keeps command drills separate from syntax coach types', () => {
    const drills = buildDrillQuizItems()
    expect(drills.every(isCommandDrillQuestion)).toBe(true)
    expect(drills.some(isSyntaxCoachQuestion)).toBe(false)
  })
})
