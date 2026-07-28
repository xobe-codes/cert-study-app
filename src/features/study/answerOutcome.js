/**
 * WB-1 / WB-2 — answer outcome helpers (unknown + silent latency).
 */
import { logEvent } from '../../eventLog.js'
import { ALL_OBJECTIVES } from '../../data/ccnaDomains.js'
import { recordAnswerSample, FLUENCY } from './answerFluency.js'

/** Soft MC fluency band (ms). Tunable later via Dev. */
export const FLUENCY_FAST_MS = 45_000
export const FLUENCY_SLOW_MS = 60_000

export function takeLatencyMs(shownAt) {
  if (!shownAt || typeof shownAt !== 'number') return null
  return Math.max(0, Date.now() - shownAt)
}

/**
 * @returns {'fluent'|'fragile'|'sticky'}
 */
export function classifyFluency({ correct, unknown = false, latencyMs = null, missStreak = 0 } = {}) {
  if (unknown || !correct) return FLUENCY.sticky
  if (missStreak >= 2) return FLUENCY.sticky
  if (latencyMs != null && latencyMs > FLUENCY_SLOW_MS) return FLUENCY.fragile
  if (latencyMs != null && latencyMs <= FLUENCY_FAST_MS) return FLUENCY.fluent
  return FLUENCY.fragile
}

/**
 * Shared post-answer bookkeeping for practice paths.
 */
export async function recordAnswerOutcome({
  objectiveId,
  questionId,
  correct,
  unknown = false,
  latencyMs = null,
  selectedIndex = undefined,
  selectedIndexes = undefined,
  responseType = 'mc',
  surface = 'practice',
} = {}) {
  const tag = classifyFluency({ correct, unknown, latencyMs })
  const domainId = ALL_OBJECTIVES.find(objective => objective.id === objectiveId)?.domainId
  logEvent('user_answered_question', {
    schemaVersion: 2,
    surface,
    responseType,
    domainId,
    objectiveId,
    questionId,
    correct: !!correct,
    unknown: !!unknown,
    latencyMs: latencyMs ?? undefined,
    fluency: tag,
    selectedIndex,
    selectedIndexes,
  })
  if (questionId || objectiveId) {
    await recordAnswerSample({
      questionId,
      objectiveId,
      correct: !!correct,
      unknown: !!unknown,
      latencyMs,
      tag,
    })
  }
  return tag
}

export function unknownMissExtra(selectedIndexOrIndexes) {
  if (Array.isArray(selectedIndexOrIndexes)) {
    return { selectedIndexes: [], outcome: 'unknown' }
  }
  return { selectedIndex: null, outcome: 'unknown' }
}
