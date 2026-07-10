import { STORAGE_KEYS } from '../../storageKeys.js'
import { DOMAINS } from '../../data/ccnaDomains.js'

export const STALE_DAYS_MS = 14 * 24 * 60 * 60 * 1000

/** Map objective id prefix (e.g. "2.4") → domain id (e.g. "access"). */
export function domainIdFromObjectiveId(objectiveId, domains = DOMAINS) {
  const n = parseInt(String(objectiveId || '').split('.')[0], 10)
  if (!Number.isFinite(n) || n < 1) return null
  return domains[n - 1]?.id || null
}

export const EXPOSURE_TIERS = {
  UNSEEN: 'unseen',
  STALE: 'stale',
  RECENT: 'recent',
}

async function loadRawStore() {
  try {
    const raw = await window.storage.getItem(STORAGE_KEYS.domainQuestionExposure)
    return raw && typeof raw === 'object' ? raw : {}
  } catch {
    return {}
  }
}

async function saveRawStore(store) {
  await window.storage.setItem(STORAGE_KEYS.domainQuestionExposure, store)
}

export async function loadDomainQuestionExposure() {
  return loadRawStore()
}

export async function saveDomainQuestionExposure(store) {
  await saveRawStore(store && typeof store === 'object' ? store : {})
}

/** Per-domain map of questionId → lastSeenAt (ms). */
export function getDomainSeenMap(exposureStore, domainId) {
  const domain = exposureStore?.[domainId]
  return domain && typeof domain === 'object' ? domain : {}
}

/**
 * Classify one question id by exposure history.
 * @param {string} questionId
 * @param {{ seenAt?: number, now?: number }} stats
 * @returns {'unseen'|'stale'|'recent'}
 */
export function pickExposureTier(questionId, stats = {}) {
  const seenAt = stats.seenAt ?? stats.byId?.[questionId]
  if (seenAt == null) return EXPOSURE_TIERS.UNSEEN
  const now = stats.now ?? Date.now()
  if (now - seenAt > STALE_DAYS_MS) return EXPOSURE_TIERS.STALE
  return EXPOSURE_TIERS.RECENT
}

/**
 * Bucket all domain question ids by exposure tier.
 * @param {string} domainId
 * @param {string[]} allIds
 * @param {Record<string, number>} [seenById]
 * @returns {{ unseen: string[], stale: string[], recent: string[], seenCount: number, byId: Record<string, number> }}
 */
export function getExposureStats(domainId, allIds, seenById = {}) {
  const safeIds = Array.isArray(allIds) ? allIds : []
  const byId = seenById && typeof seenById === 'object' ? seenById : {}
  const now = Date.now()
  const unseen = []
  const stale = []
  const recent = []

  for (const id of safeIds) {
    if (id == null) continue
    const tier = pickExposureTier(id, { seenAt: byId[id], now })
    if (tier === EXPOSURE_TIERS.UNSEEN) unseen.push(id)
    else if (tier === EXPOSURE_TIERS.STALE) stale.push(id)
    else recent.push(id)
  }

  return {
    unseen,
    stale,
    recent,
    seenCount: stale.length + recent.length,
    byId,
    domainId,
    now,
  }
}

/** Mark question ids as seen for a domain (updates lastSeenAt). */
export async function recordSeen(domainId, questionIds) {
  if (!domainId) return
  const ids = (Array.isArray(questionIds) ? questionIds : [])
    .filter(id => id != null)
  if (!ids.length) return

  const store = await loadRawStore()
  const domainSeen = { ...(store[domainId] || {}) }
  const now = Date.now()
  for (const id of ids) {
    domainSeen[id] = now
  }
  store[domainId] = domainSeen
  await saveRawStore(store)
  return domainSeen
}
