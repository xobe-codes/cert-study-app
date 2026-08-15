import { describe, it, expect } from 'vitest'
import {
  nextSrs,
  applyConfidenceToSrs,
  confidencePickScore,
  confidenceDuePriority,
  shouldForceReview,
  confidenceFeedbackCopy,
  SRS_LADDER,
  RELEARN_INTERVAL,
  ladderCapForLapses,
  nextSrsFromCorrect,
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

describe('lapse handling', () => {
  const days = srs => Math.round((srs.due - Date.now()) / 86400000)

  it('schedules a missed question sooner than a newly learned one', () => {
    const wrong = nextSrsFromCorrect(undefined, false)
    const right = nextSrsFromCorrect(undefined, true)
    expect(days(wrong)).toBe(RELEARN_INTERVAL)
    expect(days(right)).toBe(SRS_LADDER[0])
    expect(wrong.interval).toBeLessThan(right.interval)
  })

  it('drops a mature item to the relearning step when missed', () => {
    const mature = { interval: 60, reps: 5, lapses: 0, intervalIndex: 4, due: Date.now() }
    const missed = nextSrsFromCorrect(mature, false)
    expect(missed.interval).toBe(RELEARN_INTERVAL)
    expect(missed.lapses).toBe(1)
    expect(missed.reps).toBe(0)
  })

  it('counts every miss so repeat lapses accumulate', () => {
    let srs
    for (let i = 0; i < 3; i++) srs = nextSrsFromCorrect(srs, false)
    expect(srs.lapses).toBe(3)
    expect(srs.interval).toBe(RELEARN_INTERVAL)
  })

  it('caps the ladder for lapsed items so they never reach the longest interval', () => {
    expect(ladderCapForLapses(0)).toBe(SRS_LADDER.length - 1)
    expect(ladderCapForLapses(1)).toBe(SRS_LADDER.length - 2)
    expect(ladderCapForLapses(2)).toBe(SRS_LADDER.length - 3)
    expect(ladderCapForLapses(9)).toBe(SRS_LADDER.length - 3)

    let clean, lapsed = { reps: 0, lapses: 3 }
    for (let i = 0; i < 6; i++) {
      clean = nextSrsFromCorrect(clean, true)
      lapsed = nextSrsFromCorrect(lapsed, true)
    }
    expect(clean.interval).toBe(60)
    expect(lapsed.interval).toBe(14)
  })

  it('keeps easy + correct inside the lapse ceiling', () => {
    const srs = nextSrs({ interval: 14, reps: 3, lapses: 3, intervalIndex: 2, due: Date.now() }, true, 'easy')
    expect(srs.interval).toBeLessThanOrEqual(14)
  })

  it('leaves the clean-history ladder unchanged', () => {
    let srs
    const seen = []
    for (let i = 0; i < 6; i++) { srs = nextSrsFromCorrect(srs, true); seen.push(srs.interval) }
    expect(seen).toEqual([2, 7, 14, 30, 60, 60])
  })
})
