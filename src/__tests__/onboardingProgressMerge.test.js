import { describe, expect, it } from 'vitest'
import { mergeOnboardingResultsIntoProgress } from '../features/onboarding/onboardingProgressMerge.js'

describe('mergeOnboardingResultsIntoProgress', () => {
  it('records a quiz score and status for a fresh objective', () => {
    const next = mergeOnboardingResultsIntoProgress({}, { '1.1': { correct: 3, total: 5 } })
    expect(next['1.1'].quizScores).toHaveLength(1)
    expect(next['1.1'].quizScores[0]).toMatchObject({ score: 3, total: 5 })
    expect(next['1.1'].status).toBe('in_progress')
  })

  it('appends to existing quiz history rather than replacing it', () => {
    const prev = { '1.1': { status: 'in_progress', quizScores: [{ score: 3, total: 5, date: 1 }] } }
    const next = mergeOnboardingResultsIntoProgress(prev, { '1.1': { correct: 5, total: 5 } })
    expect(next['1.1'].quizScores).toHaveLength(2)
  })

  it('produces the same shape for a replay as a first pass — retaking must not be a no-op', () => {
    // This is the exact case that was silently skipped: useAppOnboarding used
    // to call setProgress only when !onboardingReplayRef.current, so a
    // replayed placement check discarded every answer while the completion
    // screen still told the learner their progress was saved.
    const firstPass = mergeOnboardingResultsIntoProgress({}, { '1.1': { correct: 5, total: 5 } })
    const replay = mergeOnboardingResultsIntoProgress({}, { '1.1': { correct: 5, total: 5 } })
    expect(replay['1.1'].quizScores).toHaveLength(1)
    expect(replay['1.1'].status).toBe(firstPass['1.1'].status)
  })

  it('leaves other objectives in progress untouched', () => {
    const prev = { '2.1': { status: 'mastered', quizScores: [{ score: 5, total: 5, date: 1 }] } }
    const next = mergeOnboardingResultsIntoProgress(prev, { '1.1': { correct: 5, total: 5 } })
    expect(next['2.1']).toBe(prev['2.1'])
  })

  it('handles an empty results object', () => {
    const prev = { '1.1': { status: 'mastered' } }
    expect(mergeOnboardingResultsIntoProgress(prev, {})).toEqual(prev)
  })
})
