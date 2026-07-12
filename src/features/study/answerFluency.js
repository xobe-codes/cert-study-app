/**
 * WB-2 — persist fluency samples for batch ranking (leave-behind fluent).
 */
import { STORAGE_KEYS } from '../../storageKeys.js'

export const FLUENCY = {
  fluent: 'fluent',
  fragile: 'fragile',
  sticky: 'sticky',
}

async function loadStore() {
  try {
    const raw = await window.storage?.getItem(STORAGE_KEYS.answerFluency)
    return raw && typeof raw === 'object' ? raw : { questions: {}, objectives: {} }
  } catch {
    return { questions: {}, objectives: {} }
  }
}

async function saveStore(store) {
  await window.storage?.setItem(STORAGE_KEYS.answerFluency, store)
}

/**
 * Record one answer sample.
 */
export async function recordAnswerSample({
  questionId,
  objectiveId,
  correct,
  unknown = false,
  latencyMs = null,
  tag = FLUENCY.fragile,
} = {}) {
  const store = await loadStore()
  if (!store.questions) store.questions = {}
  if (!store.objectives) store.objectives = {}

  if (questionId) {
    const q = store.questions[questionId] || { misses: 0, unknowns: 0, latencies: [], lastTag: null }
    if (unknown || !correct) q.misses = (q.misses || 0) + 1
    if (unknown) q.unknowns = (q.unknowns || 0) + 1
    if (typeof latencyMs === 'number') {
      q.latencies = [...(q.latencies || []).slice(-9), latencyMs]
    }
    q.lastTag = tag
    q.updatedAt = Date.now()
    store.questions[questionId] = q
  }

  if (objectiveId) {
    const o = store.objectives[objectiveId] || { fluent: 0, fragile: 0, sticky: 0, lastTag: null }
    if (tag === FLUENCY.fluent) o.fluent = (o.fluent || 0) + 1
    else if (tag === FLUENCY.sticky) o.sticky = (o.sticky || 0) + 1
    else o.fragile = (o.fragile || 0) + 1
    o.lastTag = tag
    o.updatedAt = Date.now()
    store.objectives[objectiveId] = o
  }

  await saveStore(store)
  return store
}

export async function loadAnswerFluency() {
  return loadStore()
}

/** Sync-friendly: objective is fluent if last tags lean fluent and sticky is low. */
export function objectiveFluencyFromStore(store, objectiveId) {
  const o = store?.objectives?.[objectiveId]
  if (!o) return null
  if (o.lastTag === FLUENCY.sticky || (o.sticky || 0) >= 2) return FLUENCY.sticky
  if (o.lastTag === FLUENCY.fluent && (o.sticky || 0) === 0) return FLUENCY.fluent
  if (o.lastTag === FLUENCY.fragile) return FLUENCY.fragile
  return o.lastTag || null
}

export function isObjectiveFluentInStore(store, objectiveId) {
  return objectiveFluencyFromStore(store, objectiveId) === FLUENCY.fluent
}

export async function clearAnswerFluency() {
  await saveStore({ questions: {}, objectives: {} })
}
