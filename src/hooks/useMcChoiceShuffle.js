import { useMemo, useRef } from 'react'
import { isChoiceQuestion } from '../questionUtils.js'
import { choicePermutationForQuestion, applyChoicePermutationToQuestion, invertChoicePermutation } from '../mcChoiceShuffle.js'

/**
 * Per-question random choice order (stable while the same question is on screen).
 * Parent keeps canonical indices for selected / gradeQuestion / AnswerReview.
 */
export function useMcChoiceShuffle(q, { enabled = true } = {}) {
  const rollRef = useRef({ key: null, seed: 0 })

  const key = q?.id ?? q?.question ?? ''
  if (rollRef.current.key !== key) {
    rollRef.current = { key, seed: Math.random() }
  }

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

    const permutation = choicePermutationForQuestion(q, rollRef.current.seed * 0xffffffff)
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
  }, [enabled, q, rollRef.current.seed])
}
