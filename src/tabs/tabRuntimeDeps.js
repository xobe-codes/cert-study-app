/**
 * Shared runtime deps for Study/Practice tabs — breaks circular imports with App.jsx.
 */
export {
  askClaudeJSON, MODEL, MODELS, AiBudgetWarning,
} from '../ai/claudeClient.jsx'

export {
  EXPLAIN_CACHE_KEY, EXPLAIN_PROMPT_SYSTEM, EXPLAIN_SCHEMA,
  PREASSESS_CACHE_KEY, PREASSESS_PROMPT_SYSTEM, PREASSESS_SCHEMA,
} from './studyConstants.js'

export { QUIZ_BANK_MIN } from '../quiz/quizBankStorage.js'
export {
  loadQuizBank, saveQuizBank, mergeIntoBank, recordQuizResult,
  enableSectionReview, loadDueQuestions, seedTestedOutReview,
} from '../quiz/quizBankStorage.js'

export { logEvent } from '../eventLog.js'
export { haptic, celebrate, Skeleton } from '../ui/feedbackHelpers.jsx'
