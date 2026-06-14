/**
 * Offline answerReview generator — re-exports shared logic for build scripts.
 */
export {
  generateAnswerReview,
  applyAnswerReviewToQuestion,
  buildWrongExplanation,
  inferTrapForChoice,
  isGenericWrongExplanation,
} from '../../src/answerReviewLogic.js'
