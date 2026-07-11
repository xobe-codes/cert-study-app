/**
 * Spec 2 — single graded-answer writer: engagement + exposure + optional miss.
 */
import { recordSeen, domainIdFromObjectiveId } from './domainQuestionExposure.js'

/**
 * @param {object} opts
 * @param {string} opts.objectiveId
 * @param {string} [opts.questionId]
 * @param {boolean} opts.correct
 * @param {string} opts.kind — ENGAGEMENT_KINDS value
 * @param {string} [opts.domainId]
 * @param {(objectiveId: string, activity: object) => any} [opts.recordEngagement]
 * @param {(entry: object) => void} [opts.handleMissed]
 * @param {object} [opts.missEntry] — full missed entry when !correct
 * @param {boolean} [opts.markExposure=true]
 */
export async function recordGradedAnswer({
  objectiveId,
  questionId,
  correct,
  kind,
  domainId,
  recordEngagement,
  handleMissed,
  missEntry,
  markExposure = true,
} = {}) {
  if (!objectiveId || !kind) return null

  const engagement = recordEngagement?.(objectiveId, {
    kind,
    correct: correct ? 1 : 0,
    total: 1,
    questionId: questionId || undefined,
  }) ?? null

  if (!correct && handleMissed && missEntry) {
    handleMissed(missEntry)
  }

  if (markExposure && questionId) {
    const dId = domainId || domainIdFromObjectiveId(objectiveId)
    if (dId) await recordSeen(dId, [questionId])
  }

  return {
    engagement,
    domainId: domainId || domainIdFromObjectiveId(objectiveId),
    questionId,
    correct: !!correct,
  }
}

/**
 * Spec 2 post-session domain summary for debrief cards.
 */
export function buildDomainSessionSummary({
  domainId,
  domainName,
  results = [],
  coverageBefore = null,
  coverageAfter = null,
  primaryCta = null,
} = {}) {
  const touched = new Set()
  let correct = 0
  for (const r of results) {
    if (r?.objectiveId) touched.add(r.objectiveId)
    if (r?.correct) correct += 1
  }
  const total = results.length
  const burnDelta = (coverageBefore != null && coverageAfter != null)
    ? Math.max(0, (coverageAfter.seenCount || 0) - (coverageBefore.seenCount || 0))
    : null

  return {
    domainId,
    domainName,
    objectivesTouched: [...touched],
    correct,
    total,
    pct: total ? Math.round((correct / total) * 100) : 0,
    bankBurnDelta: burnDelta,
    coverageAfter,
    primaryCta,
  }
}
