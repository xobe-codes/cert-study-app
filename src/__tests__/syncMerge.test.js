import { describe, it, expect } from 'vitest'
import {
  mergeProgress, mergeMissed, mergeQuizBank, mergeStreak, mergeSyncData,
} from '../features/sync/syncMerge.js'

describe('syncMerge', () => {
  it('mergeProgress unions quiz scores by date and keeps richer confidence', () => {
    const a = { '1.1': { quizScores: [{ date: 1, score: 3, total: 5 }], confidenceRatings: [{ value: 'hard', at: 1 }] } }
    const b = { '1.1': { quizScores: [{ date: 1, score: 4, total: 5 }, { date: 2, score: 5, total: 5 }], confidenceRatings: [] } }
    const out = mergeProgress(a, b)
    expect(out['1.1'].quizScores).toHaveLength(2)
    expect(out['1.1'].quizScores.find(s => s.date === 1).score).toBe(4)
  })

  it('mergeMissed dedupes by objectiveId + question text', () => {
    const a = [{ objectiveId: '2.1', question: 'Q1', addedAt: 1 }]
    const b = [{ objectiveId: '2.1', question: 'Q1', addedAt: 2 }, { objectiveId: '2.1', question: 'Q2', addedAt: 3 }]
    expect(mergeMissed(a, b)).toHaveLength(2)
  })

  it('mergeQuizBank keeps copy with more attempts', () => {
    const a = { '3.5': [{ question: 'Same?', attempts: [{ correct: false, at: 1 }] }] }
    const b = { '3.5': [{ question: 'Same?', attempts: [{ correct: true, at: 2 }, { correct: true, at: 3 }] }] }
    const out = mergeQuizBank(a, b)
    expect(out['3.5'][0].attempts).toHaveLength(2)
  })

  it('mergeStreak picks newer lastStudyDate', () => {
    expect(mergeStreak({ count: 2, lastStudyDate: '2026-01-01' }, { count: 1, lastStudyDate: '2026-06-01' }).lastStudyDate).toBe('2026-06-01')
  })

  it('mergeSyncData converges deterministically', () => {
    const local = { progress: {}, missed: [], quizBank: {}, cliStats: {}, streak: { count: 1, lastStudyDate: '2026-06-01' } }
    const remote = { progress: {}, missed: [], quizBank: {}, cliStats: {}, streak: { count: 3, lastStudyDate: '2026-06-02' } }
    const once = mergeSyncData(local, remote)
    const twice = mergeSyncData(once, remote)
    expect(twice).toEqual(once)
  })
})
