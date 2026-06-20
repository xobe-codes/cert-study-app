import { STORAGE_KEYS } from '../storageKeys.js'

const LENS_CACHE_KEY = 'ccna_study_lens_cache_v1'
const CACHE_CAP = 40

export async function loadSynthesisCache(queryKey) {
  try {
    const cache = (await window.storage.getItem(LENS_CACHE_KEY)) || {}
    return cache[queryKey] || null
  } catch {
    return null
  }
}

export async function saveSynthesisCache(queryKey, answer) {
  try {
    const cache = (await window.storage.getItem(LENS_CACHE_KEY)) || {}
    cache[queryKey] = { answer, at: Date.now() }
    const keys = Object.keys(cache)
    if (keys.length > CACHE_CAP) {
      const sorted = keys.sort((a, b) => (cache[a].at || 0) - (cache[b].at || 0))
      for (const k of sorted.slice(0, keys.length - CACHE_CAP)) delete cache[k]
    }
    await window.storage.setItem(LENS_CACHE_KEY, cache)
  } catch {
    // cache must never break study flow
  }
}

export { LENS_CACHE_KEY }
