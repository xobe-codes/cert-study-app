/**
 * Spec 5 — Trap ownership + ranking by miss × baseline-weak × recent CKU.
 */
import { STORAGE_KEYS } from '../../storageKeys.js'

async function loadOwned() {
  try {
    const raw = await window.storage.getItem(STORAGE_KEYS.trapOwnership)
    return raw && typeof raw === 'object' ? raw : {}
  } catch {
    return {}
  }
}

async function saveOwned(store) {
  await window.storage.setItem(STORAGE_KEYS.trapOwnership, store && typeof store === 'object' ? store : {})
}

export async function loadTrapOwnership() {
  return loadOwned()
}

export async function markTrapOwned(trapId) {
  if (!trapId) return
  const store = await loadOwned()
  store[trapId] = Date.now()
  await saveOwned(store)
  return store
}

export async function clearTrapOwned(trapId) {
  if (!trapId) return
  const store = await loadOwned()
  delete store[trapId]
  await saveOwned(store)
  return store
}

export function isTrapOwned(ownershipStore, trapId) {
  return !!(ownershipStore && trapId && ownershipStore[trapId])
}

/**
 * Rank trap cards for a domain.
 * @param {Array<{ id: string, objectiveId?: string, ckuId?: string, label?: string }>} traps
 * @param {{ missFreqByTrap?: Record<string, number>, weakObjectiveIds?: string[], recentWrongCkuIds?: string[], ownership?: object }} ctx
 */
export function rankDomainTraps(traps, ctx = {}) {
  const {
    missFreqByTrap = {},
    weakObjectiveIds = [],
    recentWrongCkuIds = [],
    ownership = {},
  } = ctx
  const weak = new Set(weakObjectiveIds)
  const wrongCku = new Set(recentWrongCkuIds)

  return [...(traps || [])]
    .map(t => {
      const id = t.id || t.trapId
      const miss = missFreqByTrap[id] || missFreqByTrap[t.label] || 0
      const weakBoost = weak.has(t.objectiveId) ? 2 : 0
      const ckuBoost = (t.ckuId && wrongCku.has(t.ckuId)) ? 2 : 0
      const owned = isTrapOwned(ownership, id)
      const score = owned ? -1000 : (miss * 3 + weakBoost + ckuBoost)
      return { ...t, id, owned, rankScore: score }
    })
    .sort((a, b) => b.rankScore - a.rankScore || String(a.id).localeCompare(String(b.id)))
}

/** Top N unowned traps for Pass/Mock debrief deep-links. */
export function topUnownedTraps(ranked, n = 3) {
  return (ranked || []).filter(t => !t.owned).slice(0, n)
}
