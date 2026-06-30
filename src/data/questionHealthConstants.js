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
  sadeFallback: 'sade_fallback_distractor',
  sadeDistractorMin: 'sade_distractor_min',
  sadeStemAnchor: 'sade_stem_anchor_weak',
  wrongKeyCluster: 'heuristic_wrong_key_cluster',
  easyLapse: 'heuristic_easy_lapse',
}

/** Learner flags at or above this count → auto-quarantine on next registry build. */
export const LEARNER_QUARANTINE_THRESHOLD = 3

export const SADE_REASON_LABELS = {
  sade_fallback: 'SADE: generic fallback distractor',
  sade_distractor_min: 'SADE: distractor score below threshold',
  sade_stem_anchor: 'SADE: weak stem anchor',
  answer_voice: 'Answer voice validation',
  validation: 'Clean bank validation',
  missing_answer_review: 'Missing answer review',
  learner_flags: 'Learner flags',
  manual: 'Manual override',
}
