import { STORAGE_KEYS } from './storageKeys.js'

const EVENT_LOG_CAP = 600
export async function logEvent(type, payload = {}) {
  try {
    const events = (await window.storage.getItem(STORAGE_KEYS.events)) || []
    events.push({ type, at: Date.now(), ...payload })
    const trimmed = events.length > EVENT_LOG_CAP ? events.slice(-EVENT_LOG_CAP) : events
    await window.storage.setItem(STORAGE_KEYS.events, trimmed)
  } catch {
    // logging must never break the study flow
  }
}
