import { isQuestionExcluded, getQuestionHealthEntry, listNeedsFixEntries } from './questionHealthRegistry.js'

export { getQuestionHealthEntry, listNeedsFixEntries, isQuestionExcluded }

/** Drop quarantined / needs_fix questions from a quiz pool. */
export function filterHealthyQuestions(questions) {
  if (!Array.isArray(questions)) return []
  return questions.filter(q => !q?.id || !isQuestionExcluded(q.id))
}

export function countExcludedQuestions(questions) {
  if (!Array.isArray(questions)) return 0
  return questions.filter(q => q?.id && isQuestionExcluded(q.id)).length
}
