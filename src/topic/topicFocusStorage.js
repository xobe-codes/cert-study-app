import { STORAGE_KEYS } from '../storageKeys.js'

const SETS_KEY = STORAGE_KEYS.topicFocusSets
const PINS_KEY = STORAGE_KEYS.topicFocusPins

function uid() {
  return `tf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export async function loadFocusSets() {
  try {
    return (await window.storage.getItem(SETS_KEY)) || []
  } catch {
    return []
  }
}

export async function saveFocusSet({ name, objectiveIds, conceptIds }) {
  const sets = await loadFocusSets()
  const entry = {
    id: uid(),
    name: String(name || 'My focus').trim().slice(0, 60) || 'My focus',
    createdAt: Date.now(),
    objectiveIds: [...new Set(objectiveIds || [])],
    conceptIds: [...new Set(conceptIds || [])],
  }
  sets.unshift(entry)
  await window.storage.setItem(SETS_KEY, sets.slice(0, 20))
  return entry
}

export async function deleteFocusSet(id) {
  const sets = (await loadFocusSets()).filter(s => s.id !== id)
  await window.storage.setItem(SETS_KEY, sets)
  return sets
}

export async function loadPinnedConcepts() {
  try {
    return (await window.storage.getItem(PINS_KEY)) || []
  } catch {
    return []
  }
}

export async function togglePinnedConcept(conceptId) {
  const pins = await loadPinnedConcepts()
  const has = pins.includes(conceptId)
  const next = has ? pins.filter(p => p !== conceptId) : [...pins, conceptId]
  await window.storage.setItem(PINS_KEY, next)
  return next
}
