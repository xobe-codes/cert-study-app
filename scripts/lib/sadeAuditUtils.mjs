/** Shared SADE distractor audit — used by health registry, CI audit, and gold candidate queue. */
import {
  scoreAnswerReview,
  validateQuestionAnswerReview,
} from '../../src/answerReview/answerReviewQuality.js'
import { stemAnchorScore } from '../../src/answerReview/stemAnchoredDistractor.js'

export const SADE_QUARANTINE_MIN = 2
export const SADE_NEEDS_FIX_MIN = 3
export const SADE_STEM_ANCHOR_MIN = 2

export function auditSadeQuestion(q) {
  const scored = scoreAnswerReview(q)
  const incorrect = q.answerReview?.incorrect || []
  const stemAnchors = incorrect.map(item => ({
    choiceIndex: item.choiceIndex,
    score: stemAnchorScore(q, item),
  }))
  const stemAnchorMin = stemAnchors.length
    ? Math.min(...stemAnchors.map(i => i.score))
    : 0

  return {
    id: q.id || 'no-id',
    min: scored.min,
    avg: scored.avg,
    fallbackCount: scored.fallbackCount,
    duplicateTexts: scored.duplicateTexts,
    stemAnchorMin,
    weakStemAnchors: stemAnchors.filter(i => i.score < SADE_STEM_ANCHOR_MIN),
    validationErrors: validateQuestionAnswerReview(q),
  }
}

/** Map SADE audit to Question Health status + reason rows (most severe wins). */
export function sadeHealthPatch(audit) {
  const reasons = []
  let status = null

  if (audit.fallbackCount > 0) {
    status = 'quarantined'
    reasons.push({
      code: 'sade_fallback',
      source: 'sade_audit',
      severity: 'critical',
      detail: `${audit.fallbackCount} generic/fallback distractor slot(s)`,
    })
  }
  if (audit.min < SADE_QUARANTINE_MIN) {
    status = 'quarantined'
    reasons.push({
      code: 'sade_distractor_min',
      source: 'sade_audit',
      severity: 'critical',
      detail: `distractor min score ${audit.min} (quarantine < ${SADE_QUARANTINE_MIN})`,
    })
  } else if (audit.min < SADE_NEEDS_FIX_MIN) {
    status = status || 'needs_fix'
    reasons.push({
      code: 'sade_distractor_min',
      source: 'sade_audit',
      severity: 'high',
      detail: `distractor min score ${audit.min} (needs fix < ${SADE_NEEDS_FIX_MIN})`,
    })
  }
  if (audit.stemAnchorMin < SADE_STEM_ANCHOR_MIN) {
    status = status || 'needs_fix'
    reasons.push({
      code: 'sade_stem_anchor',
      source: 'sade_audit',
      severity: 'medium',
      detail: `weak stem anchor (min=${audit.stemAnchorMin})`,
    })
  }
  for (const msg of audit.validationErrors) {
    status = status || 'needs_fix'
    reasons.push({
      code: 'answer_voice',
      source: 'ci',
      severity: 'medium',
      detail: msg,
    })
  }

  return { status, reasons, audit }
}

export function summarizeSadeAudits(audits) {
  const belowQuarantine = audits.filter(a => a.min < SADE_QUARANTINE_MIN || a.fallbackCount > 0)
  const belowNeedsFix = audits.filter(a => a.min < SADE_NEEDS_FIX_MIN && a.min >= SADE_QUARANTINE_MIN)
  const weakAnchor = audits.filter(a => a.stemAnchorMin < SADE_STEM_ANCHOR_MIN)
  const mins = audits.map(a => a.min)
  const avgs = audits.map(a => a.avg)

  return {
    totalQuestions: audits.length,
    quarantineCandidates: belowQuarantine.length,
    needsFixCandidates: belowNeedsFix.length,
    weakStemAnchor: weakAnchor.length,
    avgMin: mins.length ? mins.reduce((a, b) => a + b, 0) / mins.length : 0,
    avgAvg: avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : 0,
    totalFallbackSlots: audits.reduce((n, a) => n + (a.fallbackCount || 0), 0),
  }
}
