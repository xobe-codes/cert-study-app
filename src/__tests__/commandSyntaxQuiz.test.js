import { describe, it, expect } from 'vitest'
import { buildCommandIndex } from '../commands/commandIndex.js'
import { SYNTAX_TIP_GROUPS, filterSyntaxTips } from '../commands/commandSyntaxTips.js'
import {
  buildDrillQuizItems,
  buildSyntaxQuizSession,
  gradeSyntaxQuestion,
  syntaxSessionSummary,
} from '../commands/commandSyntaxQuiz.js'

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

  it('builds drill-backed quiz items from COMMAND_DRILLS', () => {
    const items = buildDrillQuizItems()
    expect(items.length).toBeGreaterThan(40)
    expect(items.some(i => i.prompt.includes('OSPF'))).toBe(true)
  })

  it('builds a 10-question session with mixed types', () => {
    const index = buildCommandIndex()
    const session = buildSyntaxQuizSession(index, { count: 10, seed: 99 })
    expect(session).toHaveLength(10)
    expect(session.some(q => q.type === 'type_command')).toBe(true)
    expect(session.some(q => q.type === 'pick_mode')).toBe(true)
  })

  it('grades shorthand interface answers', () => {
    const q = {
      type: 'type_command',
      answers: ['interface gigabitethernet0/1', 'interface gi0/1'],
      displayAnswer: 'interface gi0/1',
    }
    expect(gradeSyntaxQuestion(q, 'int gi0/1')).toBe(true)
    expect(gradeSyntaxQuestion(q, 'interface GigabitEthernet0/1')).toBe(true)
  })

  it('grades conf t and no shut abbreviations', () => {
    const conf = { type: 'type_command', answers: ['configure terminal'], displayAnswer: 'configure terminal' }
    const shut = { type: 'type_command', answers: ['no shutdown'], displayAnswer: 'no shutdown' }
    expect(gradeSyntaxQuestion(conf, 'conf t')).toBe(true)
    expect(gradeSyntaxQuestion(shut, 'no shut')).toBe(true)
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

  it('summarizes session score', () => {
    const summary = syntaxSessionSummary([
      { correct: true },
      { correct: false },
      { correct: true },
    ])
    expect(summary).toEqual({ total: 3, correct: 2, pct: 67 })
  })
})
