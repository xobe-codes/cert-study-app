import { describe, expect, it } from 'vitest'
import { computeMastery, CONFIDENCE_WINDOW } from '../netUtils.js'

const quiz = (score, total, date) => ({ kind: 'quiz', score, total, date })
const lab = (score, total, date) => ({ kind: 'lab', score, total, date })

describe('mastery requires assessment evidence', () => {
  it('does not award mastery from engagement alone', () => {
    const entry = { engagementScores: [lab(5, 5, 1), lab(5, 5, 2), lab(5, 5, 3)] }
    expect(computeMastery(entry).mastered).toBe(false)
  })

  it('does not let engagement displace quiz history from the window', () => {
    // Three perfect labs after a weak quiz used to fill the 3-session window
    // and read as mastered.
    const entry = {
      quizScores: [{ score: 2, total: 10, date: 1 }],
      engagementScores: [lab(5, 5, 2), lab(5, 5, 3), lab(5, 5, 4)],
    }
    const { mastered, score } = computeMastery(entry)
    expect(mastered).toBe(false)
    expect(score).toBeLessThan(0.5)
  })

  it('still awards mastery on strong quiz evidence', () => {
    const entry = { quizScores: [quiz(9, 10, 1), quiz(9, 10, 2), quiz(10, 10, 3)] }
    expect(computeMastery(entry).mastered).toBe(true)
  })

  it('keeps mastery for a learner who quizzed well and then did labs', () => {
    const entry = {
      quizScores: [quiz(9, 10, 1), quiz(9, 10, 2), quiz(10, 10, 3)],
      engagementScores: [lab(5, 5, 4), lab(5, 5, 5), lab(5, 5, 6)],
    }
    expect(computeMastery(entry).mastered).toBe(true)
  })
})

describe('confidence no longer rewards skipping the control', () => {
  const strong = [quiz(9, 10, 1), quiz(9, 10, 2), quiz(9, 10, 3)]

  it('mirrors accuracy when the learner never rated', () => {
    const unrated = computeMastery({ quizScores: strong })
    const medium = computeMastery({ quizScores: strong, confidenceRatings: ['medium', 'medium'] })
    // Skipping used to score a flat 0.6 — the same as rating everything medium.
    expect(unrated.score).toBeGreaterThan(medium.score)
    expect(unrated.score).toBeCloseTo(0.9, 5)
  })

  it('an honest hard rating lowers the score but is recoverable', () => {
    const hard = computeMastery({ quizScores: strong, confidenceRatings: ['hard', 'hard'] })
    expect(hard.mastered).toBe(false)
    const recovered = computeMastery({
      quizScores: strong,
      confidenceRatings: ['hard', 'hard', ...Array(CONFIDENCE_WINDOW).fill('easy')],
    })
    expect(recovered.mastered).toBe(true)
  })

  it('only the most recent ratings count', () => {
    const entry = {
      quizScores: strong,
      confidenceRatings: [...Array(50).fill('hard'), ...Array(CONFIDENCE_WINDOW).fill('easy')],
    }
    expect(computeMastery(entry).mastered).toBe(true)
  })
})
