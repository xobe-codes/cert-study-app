import { isQuestionExcluded, getQuestionHealthEntry, listNeedsFixEntries } from './questionHealthRegistry.js'

export { getQuestionHealthEntry, listNeedsFixEntries, isQuestionExcluded }

/** Soft-quarantine ids from Content Health Process (client-side, not registry). */
let localQuarantineIds = new Set()

// Retired source questions stay excluded even when an older local quiz bank
// still contains them. Keep this independent of the generated health registry
// so content-source retirements do not require a broad registry rebuild.
export const RETIRED_QUESTION_IDS = new Set([
  'obj-2.8-source-q001',
  'obj-2.8-source-q002',
  'obj-2.8-source-q003',
  'obj-2.8-source-q004',
  'obj-2.8-source-q005',
  'obj-2.8-source-q006',
  'obj-2.8-source-q007',
  'obj-2.8-source-q008',
  'obj-2.8-source-q009',
  'obj-2.8-source-q010',
])

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
  return RETIRED_QUESTION_IDS.has(questionId) || isQuestionExcluded(questionId) || isLocallyQuarantined(questionId)
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
