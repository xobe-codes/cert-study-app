import { describe, it, expect } from 'vitest'
import {
  buildEngagementProgressPatch,
  buildEngagementScore,
  getEngagementSources,
  ENGAGEMENT_KINDS,
} from '../features/progress/masteryEngagement.js'
import { computeMastery, masteryScoreSessions } from '../netUtils.js'

describe('masteryEngagement', () => {
  it('merges quiz and engagement into mastery sessions', () => {
    const entry = {
      quizScores: [{ score: 4, total: 5, date: 1 }],
      engagementScores: [{ kind: ENGAGEMENT_KINDS.LAB, score: 8, total: 8, date: 2 }],
    }
    expect(masteryScoreSessions(entry)).toHaveLength(2)
    const { score } = computeMastery(entry)
    expect(score).toBeGreaterThan(0.7)
  })

  it('records lab completion toward read checklist flags', () => {
    const patch = buildEngagementProgressPatch({}, {
      kind: ENGAGEMENT_KINDS.LAB,
      correct: 5,
      total: 5,
    })
    expect(patch.labCompleted).toBe(true)
    expect(patch.engagementScores).toHaveLength(1)
    expect(patch.masteryScore).toBeGreaterThan(0.8)
  })

  it('lists activity sources for UI', () => {
    const sources = getEngagementSources({
      quizScores: [{ score: 1, total: 1, date: 1 }],
      engagementScores: [buildEngagementScore({ kind: ENGAGEMENT_KINDS.TRAP_DRILL, correct: 2, total: 3 })],
    })
    expect(sources).toEqual(expect.arrayContaining(['Quiz', 'Trap drill']))
  })
})
