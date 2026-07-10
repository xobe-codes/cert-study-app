import { describe, it, expect } from 'vitest'
import {
  nextSrs,
  applyConfidenceToSrs,
  confidencePickScore,
  confidenceDuePriority,
  shouldForceReview,
  confidenceFeedbackCopy,
  SRS_LADDER,
} from '../quiz/confidenceScheduler.js'

describe('confidenceScheduler', () => {
  it('easy + correct lengthens the interval past the base step', () => {
    const base = nextSrs(undefined, true, null)
    const withEasy = nextSrs(undefined, true, 'easy')
    expect(withEasy.interval).toBeGreaterThanOrEqual(base.interval)
    expect(withEasy.interval).toBeGreaterThanOrEqual(SRS_LADDER[1])
    expect(withEasy.confidencePin).toBe('easy')
  })

  it('practice pins due immediately', () => {
    const srs = nextSrs(undefined, true, 'practice')
    expect(srs.due).toBeLessThanOrEqual(Date.now() + 50)
    expect(srs.confidencePin).toBe('practice')
    expect(shouldForceReview({ srs, ratings: [{ value: 'practice', at: 1 }], attempts: [{ correct: true, at: 1 }] })).toBe(true)
  })

  it('easy + wrong keeps overconfident pin and short due', () => {
    const srs = applyConfidenceToSrs(
      { interval: 7, reps: 2, lapses: 1, intervalIndex: 1, due: Date.now() + 7 * 86400000 },
      'easy',
      false,
    )
    expect(srs.confidencePin).toBe('overconfident')
    expect(srs.due).toBeLessThanOrEqual(Date.now() + 50)
  })

  it('hard + correct keeps a short soft interval', () => {
    const srs = nextSrs(
      { interval: 30, reps: 4, lapses: 0, intervalIndex: 3, due: Date.now() },
      true,
      'hard',
    )
    expect(srs.interval).toBeLessThanOrEqual(SRS_LADDER[1])
    expect(srs.confidencePin).toBe('hard')
  })

  it('pick score ranks practice and wrong ahead of easy', () => {
    const wrong = confidencePickScore({ attempts: [{ correct: false, at: 1 }], ratings: [] })
    const practice = confidencePickScore({ attempts: [{ correct: true, at: 1 }], ratings: [{ value: 'practice', at: 1 }] })
    const easy = confidencePickScore({ attempts: [{ correct: true, at: 1 }], ratings: [{ value: 'easy', at: 1 }] })
    expect(wrong).toBeLessThan(easy)
    expect(practice).toBeLessThan(easy)
  })

  it('due priority puts practice before normal due', () => {
    const practice = confidenceDuePriority({
      ratings: [{ value: 'practice', at: 1 }],
      attempts: [{ correct: true, at: 1 }],
      srs: { confidencePin: 'practice' },
    })
    const normal = confidenceDuePriority({
      ratings: [{ value: 'medium', at: 1 }],
      attempts: [{ correct: true, at: 1 }],
      srs: {},
    })
    expect(practice).toBeLessThan(normal)
  })

  it('feedback copy covers main ratings', () => {
    expect(confidenceFeedbackCopy('practice', true)).toMatch(/Pinned/)
    expect(confidenceFeedbackCopy('easy', true)).toMatch(/less often/)
    expect(confidenceFeedbackCopy('easy', false)).toMatch(/close/)
  })
})
