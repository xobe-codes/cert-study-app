/**
 * Vitest setup — register the skill-questions module so lazy getters used by
 * ccnaCurated / commandSyntaxQuiz / questionBankCount resolve in unit tests
 * the same way bootstrap does in the browser.
 */
import * as skillQuestions from '../data/ccnaSkillQuestions.js'
import { setSkillQuestionsModule } from '../data/skillQuestionsRegistry.js'

setSkillQuestionsModule(skillQuestions)
