import { useMemo, useState } from 'react'
import { isChoiceQuestion } from '../questionUtils.js'
import { choicePermutationForQuestion, applyChoicePermutationToQuestion, invertChoicePermutation } from '../mcChoiceShuffle.js'

/**
 * Per-question random choice order (stable while the same question is on screen).
 * Parent keeps canonical indices for selected / gradeQuestion / AnswerReview.
 *
 * The roll is held in state, not a ref: mutating a ref during render is not
 * safe under concurrent rendering, where the permutation used to lay out the
 * choices could differ from the one committed — which would mis-map the click.
 * Re-rolling via setState during render is React's supported pattern for
 * adjusting state when a prop changes.
 */
export function useMcChoiceShuffle(q, { enabled = true } = {}) {
  const key = q?.id ?? q?.question ?? ''
  const [roll, setRoll] = useState(() => ({ key, seed: Math.random() }))
  if (roll.key !== key) setRoll({ key, seed: Math.random() })
  const seed = roll.key === key ? roll.seed : 0

  return useMemo(() => {
    if (!enabled || !isChoiceQuestion(q)) {
      const n = q?.choices?.length ?? 0
      const identity = Array.from({ length: n }, (_, i) => i)
      return {
        enabled: false,
        permutation: identity,
        inverse: identity,
        displayQ: q,
        toCanonicalIndex: i => i,
        toDisplayIndex: i => i,
      }
    }

    const permutation = choicePermutationForQuestion(q, seed * 0xffffffff)
    const inverse = invertChoicePermutation(permutation)
    const displayQ = applyChoicePermutationToQuestion(q, permutation)

    return {
      enabled: true,
      permutation,
      inverse,
      displayQ,
      toCanonicalIndex: displayIdx => permutation[displayIdx],
      toDisplayIndex: canonicalIdx => inverse[canonicalIdx],
    }
  }, [enabled, q, seed])
}
