/**
 * Gold answer-review lookup.
 *
 * The data itself (~1.3MB of prose across 46 batches) lives in
 * goldAnswerReviewsData.js and is fetched on demand. It is needed only when a
 * learner reveals an answer, which always follows a question-bank load, so the
 * bank preload paths await it — see cleanQuestionAdapter. Until it resolves the
 * lookup returns null and the resolution chain falls through to regen /
 * clean-bank / SADE exactly as it does for a question with no gold entry.
 */

let registry = null
let loadPromise = null

export function loadGoldAnswerReviews() {
  if (registry) return Promise.resolve(registry)
  if (!loadPromise) {
    loadPromise = import('./goldAnswerReviewsData.js')
      .then((mod) => {
        registry = mod.GOLD_ANSWER_REVIEWS
        return registry
      })
      .catch((err) => {
        loadPromise = null
        throw err
      })
  }
  return loadPromise
}

export function isGoldAnswerReviewsLoaded() {
  return registry !== null
}

/** Test seam — lets suites install the data synchronously. */
export function setGoldAnswerReviewsRegistry(next) {
  registry = next
  loadPromise = next ? Promise.resolve(next) : null
}

export function goldAnswerReviewFor(questionId) {
  if (!registry) return null
  return registry[questionId] || null
}
