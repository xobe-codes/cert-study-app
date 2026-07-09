import { describe, it, expect } from 'vitest'
import { buildCommandIndex } from '../commands/commandIndex.js'
import {
  buildDrillQuizItems,
  buildCommandDrillSession,
  gradeCommandDrillQuestion,
  drillSessionSummary,
} from '../commands/commandDrillQuiz.js'
import { isCommandDrillQuestion } from '../commands/questionPlacement.js'

describe('command drill quiz', () => {
  it('builds drill-backed items from COMMAND_DRILLS', () => {
    const items = buildDrillQuizItems()
    expect(items.length).toBeGreaterThan(40)
    expect(items.every(isCommandDrillQuestion)).toBe(true)
    expect(items.some(i => i.prompt.includes('OSPF'))).toBe(true)
  })

  it('builds a 10-question session with type_command only', () => {
    const index = buildCommandIndex()
    const session = buildCommandDrillSession(index, { count: 10, seed: 99 })
    expect(session).toHaveLength(10)
    expect(session.every(q => q.type === 'type_command')).toBe(true)
  })

  it('grades shorthand interface answers', () => {
    const q = {
      type: 'type_command',
      answers: ['interface gigabitethernet0/1', 'interface gi0/1'],
      displayAnswer: 'interface gi0/1',
    }
    expect(gradeCommandDrillQuestion(q, 'int gi0/1')).toBe(true)
    expect(gradeCommandDrillQuestion(q, 'interface GigabitEthernet0/1')).toBe(true)
  })

  it('grades conf t and no shut abbreviations', () => {
    const conf = { type: 'type_command', answers: ['configure terminal'], displayAnswer: 'configure terminal' }
    const shut = { type: 'type_command', answers: ['no shutdown'], displayAnswer: 'no shutdown' }
    expect(gradeCommandDrillQuestion(conf, 'conf t')).toBe(true)
    expect(gradeCommandDrillQuestion(shut, 'no shut')).toBe(true)
  })

  it('summarizes session score', () => {
    const summary = drillSessionSummary([
      { correct: true },
      { correct: false },
      { correct: true },
    ])
    expect(summary).toEqual({ total: 3, correct: 2, pct: 67 })
  })
})
