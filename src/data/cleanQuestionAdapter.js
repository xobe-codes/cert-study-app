/**
 * Clean question bank adapter — lazy-loads the large questions module on first use.
 */
import { CLEAN_BANK_OBJECTIVES } from './ccnaCleanBankMeta.js'
import { IMPORTED_QUESTIONS } from './ccnaQuestionImports.js'

export const CLEAN_BANK_ENABLED = true

let cleanModule = null
let loadPromise = null

/** Preload the clean-questions chunk (call before quiz/mock). */
export function preloadCleanBank() {
  if (cleanModule) return Promise.resolve(cleanModule)
  if (!loadPromise) {
    loadPromise = import('./ccnaCleanQuestions.js').then(m => {
      cleanModule = m
      return m
    })
  }
  return loadPromise
}

export function isCleanBankLoaded() {
  return !!cleanModule
}

export function hasCleanBank(objectiveId) {
  return CLEAN_BANK_ENABLED
    && CLEAN_BANK_OBJECTIVES.has(objectiveId)
    && cleanModule
    && Array.isArray(cleanModule.CLEAN_QUESTIONS[objectiveId])
    && cleanModule.CLEAN_QUESTIONS[objectiveId].length > 0
}

/** Clean bank when loaded and available; legacy imports as fallback. */
export function getImportedOrCleanQuestions(objectiveId) {
  if (hasCleanBank(objectiveId)) {
    return cleanModule.CLEAN_QUESTIONS[objectiveId]
  }
  return IMPORTED_QUESTIONS[objectiveId] || []
}

export function getCleanBankStats() {
  if (!CLEAN_BANK_ENABLED) return { enabled: false, objectives: 0, questions: 0, loaded: false }
  if (!cleanModule) {
    return { enabled: true, objectives: CLEAN_BANK_OBJECTIVES.size, questions: 0, loaded: false }
  }
  let questions = 0
  for (const id of CLEAN_BANK_OBJECTIVES) {
    questions += cleanModule.CLEAN_QUESTIONS[id]?.length || 0
  }
  return { enabled: true, objectives: CLEAN_BANK_OBJECTIVES.size, questions, loaded: true }
}

/** Objectives still served from legacy ccnaQuestionImports.js */
export function getLegacyImportObjectives() {
  const legacy = Object.keys(IMPORTED_QUESTIONS).filter(id => !CLEAN_BANK_OBJECTIVES.has(id))
  if (!cleanModule) return legacy
  return legacy.filter(id => !hasCleanBank(id))
}

export { CLEAN_BANK_OBJECTIVES }
