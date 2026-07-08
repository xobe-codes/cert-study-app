import { describe, it, expect } from 'vitest'
import {
  buildChoicePermutation,
  invertChoicePermutation,
  applyChoicePermutationToQuestion,
  remapAnswerReviewForDisplay,
  choicePermutationForQuestion,
} from '../mcChoiceShuffle.js'
import { gradeQuestion } from '../questionUtils.js'

const SAMPLE = {
  id: '1.5-c-q1',
  question: 'When a switch learns a MAC, which address is recorded?',
  choices: ['Destination MAC', 'Source MAC', 'Both', 'Neither'],
  correctIndex: 1,
  answerReview: {
    correct: { choiceIndex: 1, explanation: 'Source MAC on ingress.' },
    incorrect: [
      { choiceIndex: 0, explanation: 'Destination is for lookup.' },
      { choiceIndex: 2, explanation: 'Not both.' },
      { choiceIndex: 3, explanation: 'Not IP only.' },
    ],
    examTip: 'Learn source, forward on destination.',
  },
}

describe('mcChoiceShuffle', () => {
  it('buildChoicePermutation is a valid shuffle', () => {
    const perm = buildChoicePermutation(4, () => 0)
    expect(perm.sort()).toEqual([0, 1, 2, 3])
  })

  it('invertChoicePermutation round-trips', () => {
    const perm = [2, 0, 3, 1]
    const inv = invertChoicePermutation(perm)
    expect(inv[perm[0]]).toBe(0)
    expect(perm[inv[1]]).toBe(1)
  })

  it('grading works via display index after shuffle', () => {
    const perm = [3, 1, 0, 2]
    const display = applyChoicePermutationToQuestion(SAMPLE, perm)
    const displayCorrect = invertChoicePermutation(perm)[SAMPLE.correctIndex]
    expect(gradeQuestion(display, displayCorrect)).toBe(true)
    const wrongDisplay = displayCorrect === 0 ? 1 : 0
    expect(gradeQuestion(display, wrongDisplay)).toBe(false)
  })

  it('remaps answerReview choice indices to display order', () => {
    const perm = [2, 3, 0, 1]
    const remapped = remapAnswerReviewForDisplay(SAMPLE.answerReview, perm)
    const inv = invertChoicePermutation(perm)
    expect(remapped.correct.choiceIndex).toBe(inv[1])
    expect(remapped.incorrect.map(i => i.choiceIndex).sort()).toEqual(
      SAMPLE.answerReview.incorrect.map(i => inv[i.choiceIndex]).sort(),
    )
  })

  it('choicePermutationForQuestion is deterministic for a seed', () => {
    const a = choicePermutationForQuestion(SAMPLE, 42)
    const b = choicePermutationForQuestion(SAMPLE, 42)
    expect(a).toEqual(b)
  })
})
