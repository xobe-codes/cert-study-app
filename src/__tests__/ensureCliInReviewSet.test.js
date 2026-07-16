import { describe, it, expect } from 'vitest'
import { ensureCliInReviewSet } from '../lesson/quizCoverage.js'

describe('ensureCliInReviewSet', () => {
  const bank = [
    { id: 'm1', type: 'definition' },
    { id: 'm2', type: 'scenario' },
    { id: 'm3', type: 'definition' },
    { id: 'm4', type: 'scenario' },
    { id: 'c1', type: 'cli', answers: ['enable'] },
    { id: 'c2', type: 'cli', answers: ['show ip route'] },
  ]

  it('injects CLI when set has none and bank has CLI', () => {
    const set = bank.slice(0, 4)
    const next = ensureCliInReviewSet(set, bank, 4)
    expect(next.some(q => q.type === 'cli')).toBe(true)
    expect(next).toHaveLength(4)
  })

  it('no-ops when bank has no CLI', () => {
    const set = bank.slice(0, 4)
    const next = ensureCliInReviewSet(set, bank.slice(0, 4), 4)
    expect(next.every(q => q.type !== 'cli')).toBe(true)
  })

  it('keeps existing CLI density when already satisfied', () => {
    const set = [bank[0], bank[4], bank[1], bank[2]]
    const next = ensureCliInReviewSet(set, bank, 4)
    expect(next.filter(q => q.type === 'cli').length).toBeGreaterThanOrEqual(1)
  })
})
