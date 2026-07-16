import {
  domainIdFromObjectiveId,
  getDomainSeenMap,
  getDomainExposureMap,
  getExposureStats,
  loadDomainQuestionExposure,
  recordExposureOutcome,
} from '../features/domainPass/domainQuestionExposure.js'

/** Grade-time exposure write for Practice sessions. */
export function recordPracticeExposure(objectiveId, questionId, correct) {
  if (!questionId) return
  const domainId = domainIdFromObjectiveId(objectiveId)
  if (!domainId) return
  recordExposureOutcome(domainId, questionId, { seen: true, correct: !!correct }).catch(() => {})
}

/** Load domain exposure pool + prefer-unseen set for Practice session start. */
export async function loadPracticeExposurePool(objectiveId, banked, missed = []) {
  const domainId = domainIdFromObjectiveId(objectiveId)
  if (!domainId) return { exposurePool: null, preferUnseenIds: null }

  const exposureStore = await loadDomainQuestionExposure()
  const seenMap = getDomainSeenMap(exposureStore, domainId)
  const exposureById = getDomainExposureMap(exposureStore, domainId)
  const missRetryIds = (missed || [])
    .filter(m => domainIdFromObjectiveId(m?.objectiveId) === domainId)
    .map(m => m.id ?? m.questionId)
    .filter(Boolean)
  const exposurePool = { seenById: seenMap, exposureById, missRetryIds }
  const stats = getExposureStats(domainId, banked.map(q => q.id).filter(Boolean), seenMap)
  const preferUnseenIds = stats.unseen.length ? new Set(stats.unseen) : null
  return { exposurePool, preferUnseenIds }
}
