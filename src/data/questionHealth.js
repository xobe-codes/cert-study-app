import { isQuestionExcluded, getQuestionHealthEntry, listNeedsFixEntries } from './questionHealthRegistry.js'

export { getQuestionHealthEntry, listNeedsFixEntries, isQuestionExcluded }

/** Soft-quarantine ids from Content Health Process (client-side, not registry). */
let localQuarantineIds = new Set()

export function getLocalQuarantineIds() {
  return localQuarantineIds
}

export function setLocalQuarantineIds(ids) {
  localQuarantineIds = new Set((ids || []).filter(Boolean))
  return localQuarantineIds
}

export function isLocallyQuarantined(questionId) {
  return !!(questionId && localQuarantineIds.has(questionId))
}

export function isQuestionSoftExcluded(questionId) {
  return isQuestionExcluded(questionId) || isLocallyQuarantined(questionId)
}

/** Drop quarantined / needs_fix / locally soft-quarantined questions from a quiz pool. */
export function filterHealthyQuestions(questions) {
  if (!Array.isArray(questions)) return []
  return questions.filter(q => !q?.id || !isQuestionSoftExcluded(q.id))
}

export function countExcludedQuestions(questions) {
  if (!Array.isArray(questions)) return 0
  return questions.filter(q => q?.id && isQuestionSoftExcluded(q.id)).length
}
