/**
 * Vitest setup — register the skill-questions module so lazy getters used by
 * ccnaCurated / commandSyntaxQuiz / questionBankCount resolve in unit tests
 * the same way bootstrap does in the browser.
 */
import * as skillQuestions from '../data/ccnaSkillQuestions.js'
import { setSkillQuestionsModule } from '../data/skillQuestionsRegistry.js'

setSkillQuestionsModule(skillQuestions)

// Gold answer reviews load on demand in the browser (they ride along with the
// question-bank preload). Tests exercise the resolution chain synchronously, so
// install the registry up front to keep them representative of a warm app.
import { GOLD_ANSWER_REVIEWS } from '../answerReview/goldAnswerReviewsData.js'
import { setGoldAnswerReviewsRegistry } from '../answerReview/goldAnswerReviews.js'

setGoldAnswerReviewsRegistry(GOLD_ANSWER_REVIEWS)
