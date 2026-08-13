import { STORAGE_KEYS } from './storageKeys.js'
import { LEARNING_EVENT_SCHEMA_VERSION, normalizeLearningEvent } from './features/metrics/learningMetrics.js'

export const EVENT_LOG_CAP = 5000
let eventSequence = 0

function nextEventId(at) {
  eventSequence += 1
  return `evt-${at}-${eventSequence}`
}

export async function logEvent(type, payload = {}) {
  try {
    const events = (await window.storage.getItem(STORAGE_KEYS.events)) || []
    const at = Date.now()
    const event = normalizeLearningEvent({
      eventId: payload.eventId || nextEventId(at),
      schemaVersion: payload.schemaVersion || LEARNING_EVENT_SCHEMA_VERSION,
      type,
      at,
      ...payload,
    })
    if (!events.some(existing => (existing.eventId || existing.id) === event.eventId)) events.push(event)
    const trimmed = events.length > EVENT_LOG_CAP ? events.slice(-EVENT_LOG_CAP) : events
    await window.storage.setItem(STORAGE_KEYS.events, trimmed)
    return event
  } catch {
    // logging must never break the study flow
    return null
  }
}
