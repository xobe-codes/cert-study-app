/**
 * Clean question bank adapter — lazy-loads per-domain question chunks on first use.
 */
import { CLEAN_BANK_OBJECTIVES } from './ccnaCleanBankMeta.js'
import { isGenericExamTip } from '../answerReview/examTipLogic.js'
import { loadGoldAnswerReviews } from '../answerReview/goldAnswerReviews.js'

export const CLEAN_BANK_ENABLED = true

const DOMAIN_LOADERS = {
  1: () => import('./cleanQuestions/domain-1.js'),
  2: () => import('./cleanQuestions/domain-2.js'),
  3: () => import('./cleanQuestions/domain-3.js'),
  4: () => import('./cleanQuestions/domain-4.js'),
  5: () => import('./cleanQuestions/domain-5.js'),
  6: () => import('./cleanQuestions/domain-6.js'),
}

const domainModules = {}
const domainPromises = {}
let cleanModule = null
let loadPromise = null

function objectiveDomain(objectiveId) {
  return Number(String(objectiveId).split('.')[0])
}

function mergeDomainModule(mod) {
  if (!cleanModule) cleanModule = { CLEAN_QUESTIONS: {} }
  Object.assign(cleanModule.CLEAN_QUESTIONS, mod.CLEAN_QUESTIONS)
}

function ensureDomainLoaded(domainNum) {
  if (domainModules[domainNum]) return Promise.resolve(domainModules[domainNum])
  const loader = DOMAIN_LOADERS[domainNum]
  if (!loader) return Promise.resolve(null)
  if (!domainPromises[domainNum]) {
    domainPromises[domainNum] = loader().then((mod) => {
      domainModules[domainNum] = mod
      mergeDomainModule(mod)
      return mod
    })
  }
  return domainPromises[domainNum]
}

function allDomainsLoaded() {
  return Object.keys(DOMAIN_LOADERS).every((d) => domainModules[Number(d)])
}

/** Preload every domain chunk (mock exam, placement, settings stats). */
export function preloadCleanBank() {
  if (cleanModule && allDomainsLoaded()) return Promise.resolve(cleanModule)
  if (!loadPromise) {
    loadPromise = Promise.all([
      ...Object.keys(DOMAIN_LOADERS).map((d) => ensureDomainLoaded(Number(d))),
      // Gold reviews ride along with the bank: they are only read once a
      // learner reveals an answer, which cannot happen before this resolves.
      loadGoldAnswerReviews().catch(() => null),
    ]).then(() => cleanModule)
  }
  return loadPromise
}

/** Preload only the domain that contains objectiveId (quiz / topic focus). */
export function preloadCleanBankForObjective(objectiveId) {
  return Promise.all([
    ensureDomainLoaded(objectiveDomain(objectiveId)),
    loadGoldAnswerReviews().catch(() => null),
  ]).then(() => cleanModule)
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

/** Clean bank when loaded; empty array if not yet loaded or unmigrated. */
export function getImportedOrCleanQuestions(objectiveId) {
  if (hasCleanBank(objectiveId)) {
    return cleanModule.CLEAN_QUESTIONS[objectiveId]
  }
  return []
}

export function getCleanBankStats() {
  if (!CLEAN_BANK_ENABLED) return { enabled: false, objectives: 0, questions: 0, loaded: false }
  if (!cleanModule) {
    return { enabled: true, objectives: CLEAN_BANK_OBJECTIVES.size, questions: 0, loaded: false }
  }
  let questions = 0
  let genericExamTips = 0
  for (const id of CLEAN_BANK_OBJECTIVES) {
    const qs = cleanModule.CLEAN_QUESTIONS[id] || []
    questions += qs.length
    for (const q of qs) {
      if (isGenericExamTip(q.answerReview?.examTip)) genericExamTips += 1
    }
  }
  return { enabled: true, objectives: CLEAN_BANK_OBJECTIVES.size, questions, loaded: true, genericExamTips }
}

/** Objectives not yet in clean bank (empty when fully migrated). */
export function getLegacyImportObjectives() {
  if (!cleanModule) return []
  return [...CLEAN_BANK_OBJECTIVES].filter(id => !hasCleanBank(id))
}

export { CLEAN_BANK_OBJECTIVES }
