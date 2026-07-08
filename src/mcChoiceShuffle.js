/** Shuffle MC choice display order while keeping canonical choiceIndex for grading/reviews. */

import { isMcQuestion } from './questionUtils.js'

/** Fisher–Yates permutation: result[displayIndex] = originalIndex */
export function buildChoicePermutation(length, rng = Math.random) {
  const perm = Array.from({ length }, (_, i) => i)
  for (let i = perm.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[perm[i], perm[j]] = [perm[j], perm[i]]
  }
  return perm
}

/** Map original choiceIndex → display row index. */
export function invertChoicePermutation(permutation) {
  const inverse = new Array(permutation.length)
  permutation.forEach((originalIdx, displayIdx) => {
    inverse[originalIdx] = displayIdx
  })
  return inverse
}

export function remapAnswerReviewForDisplay(answerReview, permutation) {
  if (!answerReview) return answerReview
  const inverse = invertChoicePermutation(permutation)
  return {
    ...answerReview,
    correct: answerReview.correct
      ? { ...answerReview.correct, choiceIndex: inverse[answerReview.correct.choiceIndex] }
      : answerReview.correct,
    incorrect: (answerReview.incorrect || []).map(item => ({
      ...item,
      choiceIndex: inverse[item.choiceIndex],
    })),
  }
}

/**
 * Build a display-facing MC question with shuffled choices and remapped indices.
 * @param {object} q — canonical question (grading/review use original via permutation)
 * @param {number[]} permutation — displayIndex → originalIndex
 */
export function applyChoicePermutationToQuestion(q, permutation) {
  if (!isMcQuestion(q) || !permutation?.length) return q
  const inverse = invertChoicePermutation(permutation)
  return {
    ...q,
    choices: permutation.map(i => q.choices[i]),
    correctIndex: inverse[q.correctIndex],
    ...(q.answerReview
      ? { answerReview: remapAnswerReviewForDisplay(q.answerReview, permutation) }
      : {}),
  }
}

/** Stable per-question shuffle (new order when question id changes). */
export function choicePermutationForQuestion(q, seed) {
  if (!isMcQuestion(q)) return null
  const len = q.choices.length
  if (len < 2) return Array.from({ length: len }, (_, i) => i)
  let state = (seed >>> 0) || 1
  const rng = () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
  return buildChoicePermutation(len, rng)
}

export function hashQuestionShuffleSeed(q) {
  const base = `${q?.id || ''}|${q?.question || ''}|${(q?.choices || []).join('\x1e')}`
  let h = 2166136261
  for (let i = 0; i < base.length; i++) {
    h ^= base.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function shuffleMcQuestionForDisplay(q, { seed } = {}) {
  if (!isMcQuestion(q)) {
    return { canonical: q, display: q, permutation: [], inverse: [] }
  }
  const permutation = choicePermutationForQuestion(q, seed ?? hashQuestionShuffleSeed(q))
  const inverse = invertChoicePermutation(permutation)
  const display = applyChoicePermutationToQuestion(q, permutation)
  return { canonical: q, display, permutation, inverse }
}
