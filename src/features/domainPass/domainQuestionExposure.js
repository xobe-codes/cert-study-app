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
  CORRECT_RECENT: 'correctRecent',
}

/** Legacy number timestamps → normalized v1.1 entry. */
export function normalizeExposureEntry(raw) {
  if (raw == null) return null
  if (typeof raw === 'number') return { seenAt: raw }
  if (typeof raw === 'object' && typeof raw.seenAt === 'number') {
    const entry = { seenAt: raw.seenAt }
    if (raw.lastCorrectAt != null) entry.lastCorrectAt = raw.lastCorrectAt
    if (raw.correctCount != null) entry.correctCount = raw.correctCount
    return entry
  }
  return null
}

function normalizeByIdMap(byId = {}) {
  const out = {}
  for (const [id, raw] of Object.entries(byId || {})) {
    const entry = normalizeExposureEntry(raw)
    if (entry) out[id] = entry
  }
  return out
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

/** Per-domain map of questionId → normalized exposure entry. */
export function getDomainExposureMap(exposureStore, domainId) {
  const domain = exposureStore?.[domainId]
  if (!domain || typeof domain !== 'object') return {}
  return normalizeByIdMap(domain)
}

/** Per-domain map of questionId → lastSeenAt (ms). Backward-compat shim. */
export function getDomainSeenMap(exposureStore, domainId) {
  const entries = getDomainExposureMap(exposureStore, domainId)
  const out = {}
  for (const [id, entry] of Object.entries(entries)) {
    if (entry?.seenAt != null) out[id] = entry.seenAt
  }
  return out
}

/**
 * Classify one question id by exposure history.
 * @param {string} questionId
 * @param {{ seenAt?: number, lastCorrectAt?: number, entry?: object, now?: number, byId?: Record<string, number|object> }} stats
 * @returns {'unseen'|'stale'|'recent'|'correctRecent'}
 */
export function pickExposureTier(questionId, stats = {}) {
  const entry = stats.entry
    ?? (stats.byId?.[questionId] != null ? normalizeExposureEntry(stats.byId[questionId]) : null)
    ?? (stats.seenAt != null ? { seenAt: stats.seenAt, lastCorrectAt: stats.lastCorrectAt } : null)

  const seenAt = entry?.seenAt ?? stats.seenAt
  if (seenAt == null) return EXPOSURE_TIERS.UNSEEN

  const now = stats.now ?? Date.now()
  if (now - seenAt > STALE_DAYS_MS) return EXPOSURE_TIERS.STALE

  if (entry?.lastCorrectAt != null && now - entry.lastCorrectAt <= STALE_DAYS_MS) {
    return EXPOSURE_TIERS.CORRECT_RECENT
  }

  return EXPOSURE_TIERS.RECENT
}

/**
 * Bucket all domain question ids by exposure tier.
 * Accepts legacy number map or normalized entry map in byId.
 */
export function getExposureStats(domainId, allIds, byId = {}) {
  const safeIds = Array.isArray(allIds) ? allIds : []
  const normalized = normalizeByIdMap(byId)
  const now = Date.now()
  const unseen = []
  const stale = []
  const recent = []
  const correctRecent = []

  for (const id of safeIds) {
    if (id == null) continue
    const tier = pickExposureTier(id, { entry: normalized[id], now })
    if (tier === EXPOSURE_TIERS.UNSEEN) unseen.push(id)
    else if (tier === EXPOSURE_TIERS.STALE) stale.push(id)
    else if (tier === EXPOSURE_TIERS.CORRECT_RECENT) correctRecent.push(id)
    else recent.push(id)
  }

  return {
    unseen,
    stale,
    recent,
    correctRecent,
    seenCount: stale.length + recent.length + correctRecent.length,
    byId: normalized,
    domainId,
    now,
  }
}

/** Single write API for graded / seen outcomes. */
export async function recordExposureOutcome(domainId, questionId, { seen = true, correct = false } = {}) {
  if (!domainId || questionId == null) return null

  const store = await loadRawStore()
  const domain = { ...(store[domainId] || {}) }
  const now = Date.now()
  const prev = normalizeExposureEntry(domain[questionId]) || {}
  const next = { ...prev }

  if (seen) next.seenAt = now
  if (correct) {
    next.lastCorrectAt = now
    next.correctCount = (prev.correctCount || 0) + 1
  }

  domain[questionId] = next
  store[domainId] = domain
  await saveRawStore(store)
  return next
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
    const prev = normalizeExposureEntry(domainSeen[id]) || {}
    domainSeen[id] = { ...prev, seenAt: now }
  }
  store[domainId] = domainSeen
  await saveRawStore(store)
  return domainSeen
}
