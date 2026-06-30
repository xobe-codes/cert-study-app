import { STORAGE_KEYS } from '../storageKeys.js'
import { FLAG_REASON_IDS } from '../data/questionHealthConstants.js'
import { logEvent } from '../eventLog.js'

const API = '/api/question-health'

async function loadLocalQueue() {
  return (await window.storage.getItem(STORAGE_KEYS.questionHealthFlags)) || []
}

async function saveLocalQueue(queue) {
  await window.storage.setItem(STORAGE_KEYS.questionHealthFlags, queue)
}

/** Structured learner flag — queues locally and POSTs when online. */
export async function submitQuestionFlag({
  questionId,
  objectiveId,
  reason,
  choiceIndex = null,
  trapId = null,
  source = 'learner',
} = {}) {
  if (!questionId || !objectiveId || !FLAG_REASON_IDS.has(reason)) {
    return { ok: false, error: 'invalid_flag' }
  }

  const entry = {
    questionId,
    objectiveId,
    reason,
    choiceIndex,
    trapId,
    source,
    at: Date.now(),
  }

  const queue = await loadLocalQueue()
  queue.push(entry)
  await saveLocalQueue(queue.slice(-200))
  logEvent('user_flagged_question', { questionId, objectiveId, reason, source })

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(entry),
    })
    if (res.ok) {
      return { ok: true, synced: true }
    }
    return { ok: true, synced: false, status: res.status }
  } catch {
    return { ok: true, synced: false, offline: true }
  }
}

/** Flush queued flags after reconnect (best-effort). */
export async function flushQuestionFlagQueue() {
  const queue = await loadLocalQueue()
  if (!queue.length) return 0
  let sent = 0
  const remaining = []
  for (const entry of queue) {
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(entry),
      })
      if (res.ok) sent += 1
      else remaining.push(entry)
    } catch {
      remaining.push(entry)
      break
    }
  }
  await saveLocalQueue(remaining)
  return sent
}
