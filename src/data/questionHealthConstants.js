/** Question Health Registry — statuses and structured flag reasons. */

export const QUESTION_HEALTH_STATUS = {
  ok: 'ok',
  needsFix: 'needs_fix',
  quarantined: 'quarantined',
  resolved: 'resolved',
}

export const FLAG_REASONS = [
  { id: 'wrong_key', label: 'Wrong answer key' },
  { id: 'ambiguous', label: 'Ambiguous stem' },
  { id: 'two_valid', label: 'Two valid answers' },
  { id: 'outdated_ios', label: 'Outdated IOS/command' },
  { id: 'typo', label: 'Typo or grammar' },
]

export const FLAG_REASON_IDS = new Set(FLAG_REASONS.map(r => r.id))

export const AUTO_FLAG_REASONS = {
  validation: 'validation_failed',
  answerVoice: 'answer_voice_low',
  missingReview: 'missing_answer_review',
  wrongKeyCluster: 'heuristic_wrong_key_cluster',
  easyLapse: 'heuristic_easy_lapse',
}

/** Learner flags at or above this count → auto-quarantine on next registry build. */
export const LEARNER_QUARANTINE_THRESHOLD = 3
