import { buildExposureAwarePool } from '../features/domainPass/buildExposureAwarePool.js'
import { ensureCliInReviewSet, pickReviewSet } from '../lesson/quizCoverage.js'

/** Pick a Practice session set with exposure awareness + CLI density guarantee. */
export function pickQuizSessionSet({
  banked,
  sessionSize,
  accuracy = null,
  ckuIds = [],
  preferUnseenIds = null,
  exposurePool = null,
}) {
  let set = []
  if (exposurePool) {
    set = buildExposureAwarePool({
      candidates: banked,
      seenById: exposurePool.seenById,
      exposureById: exposurePool.exposureById,
      missRetryIds: exposurePool.missRetryIds,
      count: sessionSize,
    })
  }
  if (!set.length) {
    set = pickReviewSet(banked, accuracy, sessionSize, { ckuIds, preferUnseenIds })
  } else {
    set = ensureCliInReviewSet(set, banked, sessionSize)
  }
  return set
}
