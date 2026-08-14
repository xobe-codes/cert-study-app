import { STORAGE_KEYS } from '../../storageKeys.js'

/** Track quiz interactions for real-time weak anchor detection. */
export async function logQuizInteraction(questionId, objective, correct, timeMs, confidence) {
  const event = {
    type: 'quiz_submitted',
    questionId,
    objective,
    correct,
    timeMs,
    confidence, // 'easy' | 'medium' | 'hard'
    sessionId: getSessionId(),
    timestamp: Date.now(),
  }

  const history = (await window.storage?.getItem(STORAGE_KEYS.studyPerformance)) || []
  history.push(event)
  // Keep last 500 interactions
  if (history.length > 500) history.shift()
  await window.storage?.setItem(STORAGE_KEYS.studyPerformance, history)
  return event
}

/** Get session-local interaction history (for nudges). */
export async function getSessionInteractions() {
  const sessionId = getSessionId()
  const all = (await window.storage?.getItem(STORAGE_KEYS.studyPerformance)) || []
  return all.filter(e => e.sessionId === sessionId)
}

/** Detect weak anchors in current session. */
export async function detectWeakAnchorsThisSession() {
  const interactions = await getSessionInteractions()
  const retryMap = new Map() // objective -> retry count
  const wrongMap = new Map() // objective -> wrong count

  interactions.forEach(e => {
    if (!e.correct) {
      wrongMap.set(e.objective, (wrongMap.get(e.objective) || 0) + 1)
    }

    // Track retries on same question
    if (!e.correct) {
      retryMap.set(e.objective, (retryMap.get(e.objective) || 0) + 1)
    }
  })

  const weak = []
  // Weak if 2+ wrong in session OR 3+ retries
  for (const [obj, count] of wrongMap) {
    if (count >= 2) weak.push({ objective: obj, reason: 'multiple_wrong', count })
  }
  for (const [obj, retries] of retryMap) {
    if (retries >= 3 && !weak.find(w => w.objective === obj)) {
      weak.push({ objective: obj, reason: 'multiple_retries', count: retries })
    }
  }

  return weak.length > 0 ? weak[weak.length - 1] : null
}

/** Get session insights for recap strip. */
export async function getSessionInsights() {
  const interactions = await getSessionInteractions()
  if (interactions.length === 0) return null

  const total = interactions.length
  const correct = interactions.filter(e => e.correct).length
  const accuracy = Math.round((correct / total) * 100)
  const avgTimeMs = Math.round(
    interactions.reduce((s, e) => s + (e.timeMs || 0), 0) / total
  )

  const confidenceRatings = interactions.filter(e => e.confidence)
  const confidenceGaps = []
  confidenceRatings.forEach(e => {
    if (e.confidence === 'easy' && !e.correct) {
      confidenceGaps.push({ id: e.questionId, rated: 'easy', wrong: true })
    }
  })

  // Pace comparison: if we have baseline
  const baseline = await getBaselinePace()
  const paceVsBaseline = baseline
    ? Math.round(((avgTimeMs - baseline) / baseline) * 100)
    : null

  return {
    total,
    correct,
    accuracy,
    avgTimeMs,
    paceVsBaseline, // ±0% if on pace
    confidenceGaps: confidenceGaps.length > 0 ? confidenceGaps : null,
    sessionId: getSessionId(),
  }
}

/** Get average time per question baseline from last 7 days. */
async function getBaselinePace() {
  const all = (await window.storage?.getItem(STORAGE_KEYS.studyPerformance)) || []
  const week = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recent = all.filter(e => e.timestamp > week)
  if (recent.length < 10) return null
  return Math.round(recent.reduce((s, e) => s + (e.timeMs || 0), 0) / recent.length)
}

/** Should show nudge? (every 3rd interaction or after 2 wrong in a row). */
export async function shouldShowNudge() {
  const interactions = await getSessionInteractions()
  if (interactions.length < 3) return false
  if (interactions.length % 3 === 0) return true

  // 2 wrong in a row
  const last2 = interactions.slice(-2)
  if (last2.length === 2 && last2.every(e => !e.correct)) return true

  return false
}

/** Get learner's session ID (consistent per study session). */
function getSessionId() {
  let id = window.sessionStorage?.getItem('_study_session_id')
  if (!id) {
    id = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9)
    window.sessionStorage?.setItem('_study_session_id', id)
  }
  return id
}

/** Dismiss nudge for this session (snooze 30 min). */
export function snoozeNudge() {
  const sessionId = getSessionId()
  window.sessionStorage?.setItem(`_nudge_snoozed_${sessionId}`, Date.now() + 30 * 60 * 1000)
}

/** Check if nudge is snoozed. */
export function isNudgeSnoozed() {
  const sessionId = getSessionId()
  const until = window.sessionStorage?.getItem(`_nudge_snoozed_${sessionId}`)
  if (!until) return false
  return Date.now() < parseInt(until)
}
