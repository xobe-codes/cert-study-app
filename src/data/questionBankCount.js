/**
 * Sync question counts — shared by audit scanner, coverage tests, and UI helpers.
 * Uses lightweight CLEAN_BANK_COUNTS meta (no lazy-load required for counts).
 */
import { CLEAN_BANK_OBJECTIVES, CLEAN_BANK_COUNTS } from './ccnaCleanBankMeta.js'
import { getSkillQuestions } from './ccnaSkillQuestions.js'

function cleanQuestionCount(objectiveId) {
  if (!CLEAN_BANK_OBJECTIVES.has(objectiveId)) return 0
  const fromMeta = CLEAN_BANK_COUNTS[objectiveId]
  return typeof fromMeta === 'number' ? fromMeta : 0
}

/** Total quiz items for an objective (clean bank + skill). */
export function countObjectiveQuestions(objectiveId) {
  return cleanQuestionCount(objectiveId) + getSkillQuestions(objectiveId).length
}

/** True when the compiled bank lists questions for this objective. */
export function hasCompiledCleanBank(objectiveId) {
  return cleanQuestionCount(objectiveId) > 0
}
