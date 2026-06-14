import { describe, it, expect } from 'vitest'
import {
  isOrderingQuestion,
  isMcQuestion,
  gradeQuestion,
  correctAnswerLabel,
  inferSkill,
  computeBankMix,
  normalizeQuestionForBank,
  shuffleArrayCopy,
  randomizeQuestionOrder,
  SKILL_LABEL,
} from '../questionUtils.js'

const orderingQ = {
  type: 'ordering',
  skill: 'implement',
  question: 'Order VLAN steps',
  orderItems: ['vlan 10', 'interface fa0/1', 'switchport access vlan 10'],
  explanation: 'Create VLAN first.',
}

const mcQ = {
  type: 'troubleshooting',
  skill: 'troubleshoot',
  question: 'Why no adjacency?',
  choices: ['Area mismatch', 'Duplicate RID', 'Shutdown', 'No default route'],
  correctIndex: 0,
  explanation: 'Areas must match.',
}

describe('isOrderingQuestion', () => {
  it('returns true for valid ordering questions', () => {
    expect(isOrderingQuestion(orderingQ)).toBe(true)
  })
  it('returns false when type is ordering but orderItems missing', () => {
    expect(isOrderingQuestion({ type: 'ordering', orderItems: null })).toBe(false)
  })
  it('returns false when fewer than 3 items', () => {
    expect(isOrderingQuestion({ type: 'ordering', orderItems: ['a', 'b'] })).toBe(false)
  })
  it('returns false for MC questions', () => {
    expect(isOrderingQuestion(mcQ)).toBe(false)
  })
})

describe('isMcQuestion', () => {
  it('returns true for standard MC', () => {
    expect(isMcQuestion(mcQ)).toBe(true)
  })
  it('returns false for ordering', () => {
    expect(isMcQuestion(orderingQ)).toBe(false)
  })
  it('returns false when choices missing', () => {
    expect(isMcQuestion({ correctIndex: 0 })).toBe(false)
  })
})

describe('gradeQuestion', () => {
  it('grades MC correct answer', () => {
    expect(gradeQuestion(mcQ, 0)).toBe(true)
    expect(gradeQuestion(mcQ, 1)).toBe(false)
  })
  it('grades ordering with exact sequence', () => {
    expect(gradeQuestion(orderingQ, orderingQ.orderItems)).toBe(true)
    expect(gradeQuestion(orderingQ, { order: orderingQ.orderItems })).toBe(true)
  })
  it('fails ordering on wrong sequence', () => {
    const wrong = [...orderingQ.orderItems].reverse()
    expect(gradeQuestion(orderingQ, wrong)).toBe(false)
  })
  it('fails ordering when length mismatches', () => {
    expect(gradeQuestion(orderingQ, orderingQ.orderItems.slice(0, 2))).toBe(false)
  })
})

describe('correctAnswerLabel', () => {
  it('formats ordering sequence', () => {
    const label = correctAnswerLabel(orderingQ)
    expect(label).toContain('1.')
    expect(label).toContain('→')
  })
  it('returns MC choice text', () => {
    expect(correctAnswerLabel(mcQ)).toBe('Area mismatch')
  })
})

describe('inferSkill', () => {
  it('uses explicit skill when set', () => {
    expect(inferSkill({ skill: 'design' })).toBe('design')
  })
  it('infers troubleshoot from troubleshooting type', () => {
    expect(inferSkill({ type: 'troubleshooting' })).toBe('troubleshoot')
  })
  it('infers implement from ordering type', () => {
    expect(inferSkill({ type: 'ordering' })).toBe('implement')
  })
  it('maps all SKILL_LABEL keys', () => {
    Object.keys(SKILL_LABEL).forEach(k => expect(inferSkill({ skill: k })).toBe(k))
  })
})

describe('computeBankMix', () => {
  it('counts types and skills', () => {
    const mix = computeBankMix([orderingQ, mcQ, mcQ])
    expect(mix.total).toBe(3)
    expect(mix.types.ordering).toBe(1)
    expect(mix.types.troubleshooting).toBe(2)
    expect(mix.skills.implement).toBe(1)
    expect(mix.skills.troubleshoot).toBe(2)
  })
})

describe('normalizeQuestionForBank', () => {
  it('preserves orderItems for ordering questions', () => {
    const n = normalizeQuestionForBank(orderingQ, '2.1', 0)
    expect(n.orderItems).toEqual(orderingQ.orderItems)
    expect(n.skill).toBe('implement')
    expect(n.id).toBe('2.1-skill-0')
  })
  it('preserves choices for MC questions', () => {
    const n = normalizeQuestionForBank({ ...mcQ, id: 'custom-id' }, '3.4', 1)
    expect(n.choices).toEqual(mcQ.choices)
    expect(n.correctIndex).toBe(0)
    expect(n.id).toBe('custom-id')
  })
})

describe('shuffleArrayCopy', () => {
  it('returns same length without mutating source', () => {
    const src = ['a', 'b', 'c', 'd']
    const copy = [...src]
    const out = shuffleArrayCopy(src)
    expect(out).toHaveLength(4)
    expect(src).toEqual(copy)
    expect(out.sort().join()).toBe(src.sort().join())
  })
})

describe('randomizeQuestionOrder', () => {
  it('shuffles question lists without mutating input', () => {
    const src = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const copy = [...src]
    const out = randomizeQuestionOrder(src)
    expect(out).toHaveLength(3)
    expect(src).toEqual(copy)
    expect(out.map(q => q.id).sort().join()).toBe('a,b,c')
  })
})
