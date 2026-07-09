import { describe, it, expect } from 'vitest'
import {
  buildChoicePermutation,
  buildChoicePermutationForChoices,
  invertChoicePermutation,
  applyChoicePermutationToQuestion,
  remapAnswerReviewForDisplay,
  choicePermutationForQuestion,
  isMcMetaChoice,
  partitionMcChoiceIndices,
  shuffleMcQuestionForDisplay,
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

const META_SAMPLE = {
  id: 'meta-q1',
  question: 'Which are valid STP port roles?',
  choices: ['Root', 'Designated', 'Alternate', 'All of the above'],
  correctIndex: 3,
}

describe('mcChoiceShuffle', () => {
  it('isMcMetaChoice detects exam meta distractors', () => {
    expect(isMcMetaChoice('All of the above')).toBe(true)
    expect(isMcMetaChoice('All of the above.')).toBe(true)
    expect(isMcMetaChoice('none of the above')).toBe(true)
    expect(isMcMetaChoice('Both A and B')).toBe(true)
    expect(isMcMetaChoice('A and C only')).toBe(true)
    expect(isMcMetaChoice('Both source and destination')).toBe(false)
    expect(isMcMetaChoice('Source MAC')).toBe(false)
  })

  it('pins meta choices to the bottom while shuffling regular choices', () => {
    const choices = ['Root', 'Designated', 'Alternate', 'All of the above']
    const { regular, meta } = partitionMcChoiceIndices(choices)
    expect(regular).toEqual([0, 1, 2])
    expect(meta).toEqual([3])

    let call = 0
    const rng = () => {
      call++
      return call === 1 ? 0.99 : 0
    }
    const perm = buildChoicePermutationForChoices(choices, rng)
    expect(perm.slice(-1)).toEqual([3])
    expect(perm.slice(0, 3).sort()).toEqual([0, 1, 2])
  })

  it('keeps multiple meta options in stable order at the bottom', () => {
    const choices = ['A', 'B', 'Both A and B', 'None of the above']
    const perm = buildChoicePermutationForChoices(choices, () => 0)
    expect(perm.slice(-2)).toEqual([2, 3])
  })

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

  it('grading invariant holds when meta answer is pinned at bottom', () => {
    const perm = choicePermutationForQuestion(META_SAMPLE, 99)
    const display = applyChoicePermutationToQuestion(META_SAMPLE, perm)
    const displayCorrect = invertChoicePermutation(perm)[META_SAMPLE.correctIndex]
    expect(perm[perm.length - 1]).toBe(3)
    expect(display.choices[displayCorrect]).toBe('All of the above')
    expect(gradeQuestion(display, displayCorrect)).toBe(true)
    expect(gradeQuestion(META_SAMPLE, META_SAMPLE.correctIndex)).toBe(true)
  })

  it('canonical index maps to same choice text after shuffle', () => {
    const perm = choicePermutationForQuestion(SAMPLE, 42)
    const display = applyChoicePermutationToQuestion(SAMPLE, perm)
    for (let canonical = 0; canonical < SAMPLE.choices.length; canonical++) {
      const displayIdx = invertChoicePermutation(perm)[canonical]
      expect(display.choices[displayIdx]).toBe(SAMPLE.choices[canonical])
    }
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

  it('permutation is a bijection on choice indices', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const perm = choicePermutationForQuestion(SAMPLE, seed)
      expect(perm.sort()).toEqual([0, 1, 2, 3])
      expect(new Set(perm).size).toBe(perm.length)
    }
    const metaPerm = choicePermutationForQuestion(META_SAMPLE, 77)
    expect(metaPerm.sort()).toEqual([0, 1, 2, 3])
    expect(metaPerm[metaPerm.length - 1]).toBe(3)
  })

  it('debrief display letters match on-screen positions after shuffle', () => {
    const { permutation, inverse } = shuffleMcQuestionForDisplay(SAMPLE, { seed: 42 })
    const displayLetter = canonicalIdx => String.fromCharCode(65 + inverse[canonicalIdx])
    expect(displayLetter(SAMPLE.correctIndex)).toBe(
      String.fromCharCode(65 + permutation.indexOf(SAMPLE.correctIndex)),
    )
    for (const item of SAMPLE.answerReview.incorrect) {
      expect(displayLetter(item.choiceIndex)).toBe(
        String.fromCharCode(65 + inverse[item.choiceIndex]),
      )
    }
  })

  it('pins meta choices for every seeded permutation', () => {
    const choices = ['Root', 'Designated', 'Alternate', 'All of the above']
    for (let seed = 0; seed < 100; seed++) {
      const perm = buildChoicePermutationForChoices(choices, () => ((seed * 17 + 3) % 97) / 97)
      expect(perm.slice(-1)).toEqual([3])
    }
  })
})
