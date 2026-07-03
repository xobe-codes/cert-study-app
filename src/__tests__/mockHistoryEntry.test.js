import { describe, it, expect } from 'vitest'
import { buildMockHistoryEntry } from '../features/mockExam/mockHistoryEntry.js'

describe('mockHistoryEntry', () => {
  const questions = [
    { id: 'q1', objectiveId: '3.5', correctIndex: 0 },
    { id: 'q2', objectiveId: '3.5', correctIndex: 1 },
    { id: 'q3', objectiveId: '5.5', correctIndex: 2 },
  ]

  it('records weak domain and objectives from misses', () => {
    const entry = buildMockHistoryEntry({
      correct: 1,
      total: 3,
      questions,
      responses: { 0: 0, 1: 0, 2: 0 },
      byDomain: {
        access: { name: 'Network Access', correct: 1, total: 2 },
        security: { name: 'Security Fundamentals', correct: 0, total: 1 },
      },
    })
    expect(entry.pct).toBe(33)
    expect(entry.weakDomainId).toBe('security')
    expect(entry.weakObjectiveIds).toContain('3.5')
    expect(entry.weakObjectiveIds[0]).toBe('3.5')
  })
})
