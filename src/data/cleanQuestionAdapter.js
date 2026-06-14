/**
 * Clean question bank adapter — replaces ccnaQuestionImports.js objective-by-objective.
 */
import { CLEAN_QUESTIONS, CLEAN_BANK_OBJECTIVES } from './ccnaCleanQuestions.js'
import { IMPORTED_QUESTIONS } from './ccnaQuestionImports.js'

export const CLEAN_BANK_ENABLED = true

export function hasCleanBank(objectiveId) {
  return CLEAN_BANK_ENABLED
    && CLEAN_BANK_OBJECTIVES.has(objectiveId)
    && Array.isArray(CLEAN_QUESTIONS[objectiveId])
    && CLEAN_QUESTIONS[objectiveId].length > 0
}

/** Clean bank when available; legacy imports only for objectives not yet migrated. */
export function getImportedOrCleanQuestions(objectiveId) {
  if (hasCleanBank(objectiveId)) {
    return CLEAN_QUESTIONS[objectiveId]
  }
  return IMPORTED_QUESTIONS[objectiveId] || []
}

export function getCleanBankStats() {
  if (!CLEAN_BANK_ENABLED) return { enabled: false, objectives: 0, questions: 0 }
  let questions = 0
  for (const id of CLEAN_BANK_OBJECTIVES) {
    questions += CLEAN_QUESTIONS[id]?.length || 0
  }
  return { enabled: true, objectives: CLEAN_BANK_OBJECTIVES.size, questions }
}

/** Objectives still served from legacy ccnaQuestionImports.js */
export function getLegacyImportObjectives() {
  return Object.keys(IMPORTED_QUESTIONS).filter(id => !hasCleanBank(id))
}
