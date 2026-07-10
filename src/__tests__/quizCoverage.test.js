import { describe, it, expect } from 'vitest'
import { computeCkuCoverage, pickReviewSet, getObjectiveCkuIds } from '../lesson/quizCoverage.js'

describe('quizCoverage', () => {
  it('reports CKU coverage for 3.2', () => {
    const ckuIds = getObjectiveCkuIds('3.2')
    expect(ckuIds.length).toBe(4)
    const coverage = computeCkuCoverage('3.2', null)
    expect(coverage.total).toBe(4)
    expect(coverage.covered).toBe(4)
    expect(coverage.uncovered).toEqual([])
  })

  it('prioritizes under-tested CKUs in session pick', () => {
    const banked = [
      { id: 'q1', ckuIds: ['CKU-A'], attempts: [{ correct: true, at: 1 }], ratings: [], difficulty: 'easy', type: 'definition' },
      { id: 'q2', ckuIds: ['CKU-B'], attempts: [], ratings: [], difficulty: 'medium', type: 'scenario' },
      { id: 'q3', ckuIds: ['CKU-C'], attempts: [], ratings: [], difficulty: 'hard', type: 'application' },
    ]
    const set = pickReviewSet(banked, null, 2, { ckuIds: ['CKU-A', 'CKU-B', 'CKU-C'] })
    expect(set).toHaveLength(2)
    const ids = new Set(set.map(q => q.id))
    expect(ids.has('q2') || ids.has('q3')).toBe(true)
  })

  it('confidence weights prefer need-practice over easy+correct', () => {
    const banked = [
      {
        id: 'easy-q',
        ckuIds: ['CKU-A'],
        attempts: [{ correct: true, at: 1 }],
        ratings: [{ value: 'easy', at: 1 }],
        difficulty: 'easy',
        type: 'definition',
      },
      {
        id: 'practice-q',
        ckuIds: ['CKU-A'],
        attempts: [{ correct: true, at: 1 }],
        ratings: [{ value: 'practice', at: 1 }],
        difficulty: 'easy',
        type: 'definition',
      },
    ]
    const picks = []
    for (let i = 0; i < 20; i++) {
      picks.push(pickReviewSet(banked, null, 1, { ckuIds: ['CKU-A'] })[0].id)
    }
    expect(picks.filter(id => id === 'practice-q').length).toBeGreaterThan(picks.filter(id => id === 'easy-q').length)
  })
})
