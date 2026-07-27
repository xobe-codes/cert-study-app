import { STORAGE_KEYS } from '../../storageKeys.js'
import {
  DOMAIN_PASS_TOTAL_DOMAINS,
  countDomainsPassed,
  evaluateDomainPass,
  isDomainPassPassed,
} from './domainPassConfig.js'
import { isDuplicateMissedEntry } from '../../missed/missedDisplay.js'

const MAX_FOCUS_ATTEMPTS = 20

const KEY = STORAGE_KEYS.domainPass
const PREFS_KEY = '_prefs'

async function loadRawStore() {
  try {
    const raw = await window.storage.getItem(KEY)
    return raw && typeof raw === 'object' ? raw : {}
  } catch {
    return {}
  }
}

async function saveRawStore(store) {
  await window.storage.setItem(KEY, store)
}

export async function loadDomainPassState() {
  const raw = await loadRawStore()
  const prefs = raw[PREFS_KEY] || {}
  const domains = { ...raw }
  delete domains[PREFS_KEY]
  return {
    prefs: { timerEnabled: prefs.timerEnabled !== false },
    domains,
  }
}

export async function loadDomainPassRecords() {
  const { domains } = await loadDomainPassState()
  return domains
}

/** Alias for hub/session components. */
export const loadDomainRecords = loadDomainPassRecords

export function getDomainRecord(records, domainId) {
  return records?.[domainId] || null
}

export async function loadTimerEnabled() {
  const { prefs } = await loadDomainPassState()
  return prefs.timerEnabled !== false
}

export async function setTimerEnabled(enabled) {
  const store = await loadRawStore()
  store[PREFS_KEY] = { ...(store[PREFS_KEY] || {}), timerEnabled: !!enabled }
  await saveRawStore(store)
}

/**
 * Merge and persist a domain pass attempt.
 * Once passed, a domain stays passed; bestPct tracks the high-water mark.
 */
export async function saveDomainPassRecord(domainId, {
  passed,
  bestPct,
  lastAt,
  weakObjectives,
  attempts,
  skippedQuestionIds,
}) {
  const store = await loadRawStore()
  const prefs = store[PREFS_KEY]
  const records = { ...store }
  delete records[PREFS_KEY]
  const prev = records[domainId] || {}
  const next = {
    passed: Boolean(passed || prev.passed),
    bestPct: Math.max(prev.bestPct ?? 0, bestPct ?? 0),
    lastAt: lastAt ?? Date.now(),
    weakObjectives: Array.isArray(weakObjectives) ? weakObjectives : (prev.weakObjectives || []),
    attempts: attempts ?? (typeof prev.attempts === 'number' ? prev.attempts + 1 : 1),
    skippedQuestionIds: skippedQuestionIds !== undefined
      ? (Array.isArray(skippedQuestionIds) ? skippedQuestionIds : [])
      : (prev.skippedQuestionIds || []),
  }
  records[domainId] = next
  if (prefs) records[PREFS_KEY] = prefs
  await saveRawStore(records)
  return next
}

/** High-level save from session results — scores attempt and updates weak objectives. */
export async function saveDomainPassAttempt(domainId, {
  correct,
  total,
  weakObjectiveIds = [],
  skippedQuestionIds,
}) {
  const { passed, pct } = evaluateDomainPass({ correct, total })
  const record = await saveDomainPassRecord(domainId, {
    passed,
    bestPct: pct,
    lastAt: Date.now(),
    weakObjectives: weakObjectiveIds,
    skippedQuestionIds,
  })
  return { record, pct, passed }
}

/** Focus pass attempt — separate history; does not overwrite full domain pass record. */
export async function saveDomainPassFocusAttempt(domainId, {
  correct,
  total,
  objectiveIds = [],
  weakObjectiveIds = [],
  skippedQuestionIds,
}) {
  const store = await loadRawStore()
  const prefs = store[PREFS_KEY]
  const records = { ...store }
  delete records[PREFS_KEY]
  const prev = records[domainId] || {}
  const safeTotal = Math.max(0, total ?? 0)
  const safeCorrect = Math.min(Math.max(0, correct ?? 0), safeTotal)
  const pct = safeTotal > 0 ? Math.round((safeCorrect / safeTotal) * 100) : 0
  const attempt = {
    at: Date.now(),
    pct,
    passed: isDomainPassPassed(pct),
    correct: safeCorrect,
    total: safeTotal,
    objectiveIds: Array.isArray(objectiveIds) ? objectiveIds : [],
    weakObjectives: Array.isArray(weakObjectiveIds) ? weakObjectiveIds : [],
  }
  const focusAttempts = [...(prev.focusAttempts || []), attempt].slice(-MAX_FOCUS_ATTEMPTS)
  const next = {
    ...prev,
    focusAttempts,
    skippedQuestionIds: skippedQuestionIds !== undefined
      ? (Array.isArray(skippedQuestionIds) ? skippedQuestionIds : [])
      : (prev.skippedQuestionIds || []),
  }
  records[domainId] = next
  if (prefs) records[PREFS_KEY] = prefs
  await saveRawStore(records)
  return { record: next, pct, passed: attempt.passed }
}

export function getDomainPassSummary(records) {
  const safe = records && typeof records === 'object' ? records : {}
  return {
    passedCount: countDomainsPassed(safe),
    total: DOMAIN_PASS_TOTAL_DOMAINS,
    byDomain: { ...safe },
  }
}

export function countPassedDomains(records, domains) {
  if (!domains?.length) return countDomainsPassed(records)
  return domains.filter(d => records?.[d.id]?.passed).length
}

export async function appendMissedEntry(entry) {
  const missed = (await window.storage.getItem(STORAGE_KEYS.missed)) || []
  if (!isDuplicateMissedEntry(missed, entry)) {
    await window.storage.setItem(STORAGE_KEYS.missed, [...missed, entry])
  }
}

export async function loadDomainPassCelebrated() {
  try {
    return Boolean(await window.storage.getItem(STORAGE_KEYS.domainPassCelebrated))
  } catch {
    return false
  }
}

export async function saveDomainPassCelebrated(value = true) {
  await window.storage.setItem(STORAGE_KEYS.domainPassCelebrated, Boolean(value))
}
