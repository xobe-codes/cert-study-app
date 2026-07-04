import { STORAGE_KEYS } from '../../storageKeys.js'

const KEY = STORAGE_KEYS.domainPlacement

async function loadStore() {
  try {
    const raw = await window.storage.getItem(KEY)
    return raw && typeof raw === 'object' ? raw : {}
  } catch {
    return {}
  }
}

async function saveStore(store) {
  await window.storage.setItem(KEY, store)
}

export async function loadPlacementRecord(domainId) {
  const store = await loadStore()
  return store[domainId] || null
}

export async function loadAllPlacementRecords() {
  return loadStore()
}

export async function savePlacementAttempt(domainId, attempt) {
  const store = await loadStore()
  const prev = store[domainId]?.lastAttempt || null
  const history = store[domainId]?.history || []
  const nextHistory = prev ? [...history, prev].slice(-5) : history

  const record = {
    lastAttempt: attempt,
    previousAttempt: prev,
    history: nextHistory,
    attempts: (store[domainId]?.attempts || 0) + 1,
  }

  store[domainId] = record
  await saveStore(store)
  return record
}

export function shouldSuggestPlacement(record, now = Date.now()) {
  if (!record?.lastAttempt) return true
  const age = now - (record.lastAttempt.at || 0)
  if (age > 14 * 24 * 60 * 60 * 1000) return true
  return record.lastAttempt.pct < 70
}
