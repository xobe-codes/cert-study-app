import {
  isCliQuestion,
  isOrderingQuestion,
  isMcQuestion,
  isMultiQuestion,
  multiCorrectIndexes,
  correctAnswerLabel,
} from '../questionUtils.js'

/** Stable index into the persisted missed bank (enriched trap copies may differ by reference). */
export function findMissedBankIndex(missed, entry) {
  if (!Array.isArray(missed) || !entry) return -1
  const byRef = missed.indexOf(entry)
  if (byRef >= 0) return byRef
  if (entry.questionId) {
    const byId = missed.findIndex(m => m.questionId === entry.questionId)
    if (byId >= 0) return byId
  }
  const q = String(entry.question || '').trim()
  const oid = entry.objectiveId
  return missed.findIndex(m => m.objectiveId === oid && String(m.question || '').trim() === q)
}

/**
 * Rows for Missed Review answer list.
 * MC uses choices; CLI/ordering use the correct-answer label so `.map` never runs on undefined.
 */
export function missedReviewOptionRows(m) {
  if (!m) return []
  if (Array.isArray(m.choices) && m.choices.length > 0) {
    const correctSet = isMultiQuestion(m)
      ? new Set(multiCorrectIndexes(m))
      : null
    return m.choices.map((text, ci) => ({
      text: String(text ?? ''),
      isAnswer: correctSet ? correctSet.has(ci) : ci === m.correctIndex,
    }))
  }
  if (isCliQuestion(m) || isOrderingQuestion(m) || isMcQuestion(m) || isMultiQuestion(m)) {
    const label = correctAnswerLabel(m)
    return label ? [{ text: label, isAnswer: true }] : []
  }
  const fallback = correctAnswerLabel(m)
  return fallback ? [{ text: fallback, isAnswer: true }] : []
}

export function missedUserAttemptLabel(m) {
  if (!m) return null
  if (isCliQuestion(m) && m.cliAnswer != null && String(m.cliAnswer).trim()) {
    return `Your command: ${String(m.cliAnswer).trim()}`
  }
  if (isOrderingQuestion(m) && Array.isArray(m.orderAnswer) && m.orderAnswer.length) {
    return `Your order: ${m.orderAnswer.map((s, i) => `${i + 1}. ${s}`).join(' → ')}`
  }
  if (Array.isArray(m.selectedIndexes) && Array.isArray(m.choices)) {
    const labels = m.selectedIndexes
      .filter(i => typeof i === 'number' && m.choices[i] != null)
      .map(i => m.choices[i])
    if (labels.length) return `Your answers: ${labels.join('; ')}`
  }
  if (Array.isArray(m.choices) && typeof m.selectedIndex === 'number' && m.choices[m.selectedIndex] != null) {
    return `Your answer: ${m.choices[m.selectedIndex]}`
  }
  return null
}
