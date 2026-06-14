import { SHELVED_BANK } from './ccnaShelvedQuestions.js'

/** Prepare shelved question for quiz (add answerReview if missing). */
export function prepareShelvedQuestion(q, generateReview) {
  if (q.answerReview) return q
  const review = generateReview?.(q)
  return review ? { ...q, answerReview: review } : q
}

export function getShelvedStats() {
  return SHELVED_BANK.stats
}

export function getShelvedPool(filter = 'all') {
  if (filter === 'exhibit') return SHELVED_BANK.exhibitDependent
  if (filter === 'out-of-scope') return SHELVED_BANK.outOfScope
  return [...SHELVED_BANK.exhibitDependent, ...SHELVED_BANK.outOfScope]
}

export function getShelvedByObjective(objectiveId) {
  return SHELVED_BANK.byObjective[objectiveId] || []
}

export function isApprovedForPromotion(questionId) {
  return SHELVED_BANK.approvedPromotions.some(a => a.id === questionId)
}

export function getPromoteHint(q) {
  return q.promoteHint || (q.reason === 'exhibit-dependent'
    ? 'Add inline exhibit in exhibitConverters.mjs → npm run promote:shelved'
    : 'Add to approved-promotions.json → npm run promote:shelved')
}
