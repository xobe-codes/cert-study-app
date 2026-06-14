import { describe, it, expect } from 'vitest'
import { buildComboStatsSeries, computeReadinessPct } from '../stats/statsSeries.js'

describe('statsSeries', () => {
  it('computes readiness from progress', () => {
    const progress = {
      '1.1': {
        status: 'in_progress',
        quizScores: [{ score: 4, total: 5, date: Date.now() }],
        confidenceRatings: ['medium'],
      },
    }
    const pct = computeReadinessPct(progress)
    expect(pct).toBeGreaterThan(0)
    expect(pct).toBeLessThanOrEqual(100)
  })

  it('builds combo series with bars and line points', () => {
    const now = Date.now()
    const progress = {
      '1.1': {
        quizScores: [{ score: 3, total: 5, date: now }],
        confidenceRatings: ['medium'],
      },
    }
    const events = [{ type: 'user_answered_question', at: now }]
    const mockHistory = [{ date: now, pct: 72, correct: 36, total: 50 }]
    const series = buildComboStatsSeries({ progress, events, mockHistory, rangeId: '7d' })
    expect(series.points.length).toBeGreaterThan(0)
    expect(series.summary.totalQuestions).toBeGreaterThan(0)
    expect(series.summary.readiness).toBeGreaterThan(0)
    const today = series.points[series.points.length - 1]
    expect(today.bar).toBeGreaterThan(0)
    expect(today.line).not.toBeNull()
    expect(today.mock).toBe(72)
  })
})
