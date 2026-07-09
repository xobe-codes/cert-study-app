import { describe, it, expect } from 'vitest'
import { buildCommandIndex } from '../commands/commandIndex.js'
import { SYNTAX_TIP_GROUPS, filterSyntaxTips } from '../commands/commandSyntaxTips.js'
import {
  buildSyntaxOrderItems,
  buildSyntaxQuizSession,
  gradeSyntaxQuestion,
  syntaxSessionSummary,
} from '../commands/commandSyntaxQuiz.js'
import { isSyntaxCoachQuestion } from '../commands/questionPlacement.js'

describe('command syntax coach', () => {
  it('ships curated mnemonic tip groups across major topics', () => {
    expect(SYNTAX_TIP_GROUPS.length).toBeGreaterThanOrEqual(10)
    const categories = new Set(SYNTAX_TIP_GROUPS.map(t => t.category))
    expect(categories.has('modes')).toBe(true)
    expect(categories.has('verify')).toBe(true)
    expect(categories.has('security')).toBe(true)
  })

  it('filters tips by category', () => {
    const routing = filterSyntaxTips('routing')
    expect(routing.length).toBeGreaterThan(0)
    expect(routing.every(t => t.category === 'routing')).toBe(true)
  })

  it('builds IOS step-order items from skill bank', () => {
    const items = buildSyntaxOrderItems()
    expect(items.length).toBeGreaterThan(5)
    expect(items.every(q => q.type === 'order_steps')).toBe(true)
    expect(items.some(i => i.orderItems.some(s => /vlan|interface/i.test(s)))).toBe(true)
  })

  it('builds a 10-question syntax session without type_command', () => {
    const index = buildCommandIndex()
    const session = buildSyntaxQuizSession(index, { count: 10, seed: 99 })
    expect(session).toHaveLength(10)
    expect(session.every(isSyntaxCoachQuestion)).toBe(true)
    expect(session.some(q => q.type === 'pick_mode')).toBe(true)
    expect(session.some(q => q.type === 'order_steps')).toBe(true)
    expect(session.some(q => q.type === 'type_command')).toBe(false)
  })

  it('grades pick_mode questions', () => {
    const q = {
      type: 'pick_mode',
      answer: 'interface config',
      options: ['privileged EXEC', 'interface config', 'global config', 'router config'],
    }
    expect(gradeSyntaxQuestion(q, 'interface config')).toBe(true)
    expect(gradeSyntaxQuestion(q, 'global config')).toBe(false)
  })

  it('grades order_steps with CLI shorthand', () => {
    const q = {
      type: 'order_steps',
      orderItems: ['vlan 20', 'interface fa0/5', 'switchport mode access'],
    }
    expect(gradeSyntaxQuestion(q, ['vlan 20', 'interface fa0/5', 'switchport mode access'])).toBe(true)
    expect(gradeSyntaxQuestion(q, ['interface fa0/5', 'vlan 20', 'switchport mode access'])).toBe(false)
  })

  it('summarizes session score', () => {
    const summary = syntaxSessionSummary([
      { correct: true },
      { correct: false },
      { correct: true },
    ])
    expect(summary).toEqual({ total: 3, correct: 2, pct: 67 })
  })
})
