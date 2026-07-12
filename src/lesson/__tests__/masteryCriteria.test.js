import { describe, it, expect } from 'vitest'
import { getMasteryChecklist } from '../masteryCriteria.js'

function findRow(rows, id) {
  return rows.find(r => r.id === id)
}

describe('getMasteryChecklist', () => {
  it('shows practice met, confidence unmet, mastered unmet when accuracy is high but confidence is low', () => {
    const entry = {
      quizScores: [
        { score: 9, total: 10, date: 1 },
        { score: 9, total: 10, date: 2 },
        { score: 9, total: 10, date: 3 },
      ],
      confidenceRatings: ['hard', 'practice', 'hard'],
    }
    const rows = getMasteryChecklist(entry)

    const practice = findRow(rows, 'practice')
    const confidence = findRow(rows, 'confidence')
    const mastered = findRow(rows, 'mastered')

    expect(practice).toBeTruthy()
    expect(practice.met).toBe(true)

    expect(confidence).toBeTruthy()
    expect(confidence.met).toBe(false)

    expect(mastered).toBeTruthy()
    expect(mastered.met).toBe(false)
  })

  it('has no confidence row when there are no quiz/engagement scores yet', () => {
    const entry = {}
    const rows = getMasteryChecklist(entry)

    expect(findRow(rows, 'confidence')).toBeUndefined()
  })

  it('shows confidence met and mastered met with high accuracy, high confidence, and a full session', () => {
    const entry = {
      quizScores: [
        { score: 9, total: 10, date: 1 },
        { score: 9, total: 10, date: 2 },
        { score: 9, total: 10, date: 3 },
      ],
      confidenceRatings: ['easy', 'easy', 'easy'],
    }
    const rows = getMasteryChecklist(entry)

    const confidence = findRow(rows, 'confidence')
    const mastered = findRow(rows, 'mastered')

    expect(confidence).toBeTruthy()
    expect(confidence.met).toBe(true)

    expect(mastered).toBeTruthy()
    expect(mastered.met).toBe(true)
  })
})
