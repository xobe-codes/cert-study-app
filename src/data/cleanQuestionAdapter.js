/**
 * Clean question bank adapter — Domain 4 pilot.
 *
 * Timing: enable CLEAN_BANK_ENABLED only after validate:clean-bank passes.
 * Legacy ccnaQuestionImports.js remains the fallback (no one-step replacement).
 */
import { CLEAN_QUESTIONS_DOMAIN_4 } from './ccnaCleanQuestionsDomain4.js'
import { IMPORTED_QUESTIONS } from './ccnaQuestionImports.js'

/** Set true after clean bank is validated and ready for students. */
export const CLEAN_BANK_ENABLED = true

const DOMAIN_4_IDS = new Set(['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.9'])

export function hasCleanBank(objectiveId) {
  return CLEAN_BANK_ENABLED
    && DOMAIN_4_IDS.has(objectiveId)
    && Array.isArray(CLEAN_QUESTIONS_DOMAIN_4[objectiveId])
    && CLEAN_QUESTIONS_DOMAIN_4[objectiveId].length > 0
}

/** Clean bank for Domain 4 when enabled; otherwise legacy imports (not hand-curated). */
export function getImportedOrCleanQuestions(objectiveId) {
  if (hasCleanBank(objectiveId)) {
    return CLEAN_QUESTIONS_DOMAIN_4[objectiveId]
  }
  return IMPORTED_QUESTIONS[objectiveId] || []
}

export function getCleanBankStats() {
  if (!CLEAN_BANK_ENABLED) return { enabled: false, objectives: 0, questions: 0 }
  let questions = 0
  for (const id of DOMAIN_4_IDS) {
    questions += CLEAN_QUESTIONS_DOMAIN_4[id]?.length || 0
  }
  return { enabled: true, objectives: DOMAIN_4_IDS.size, questions }
}
