import { logEvent } from '../eventLog.js'
import { primaryLessonAnchor } from './lessonAnchors.js'

const PENDING_KEY = 'ccna_pending_lesson_remediation_v1'
let pendingToken = null

export function beginLessonRemediation({ questionId, objectiveId, domainId, ckuIds = [], surface = 'practice' } = {}) {
  const token = {
    questionId,
    objectiveId,
    domainId,
    ckuIds,
    surface,
    lessonAnchor: primaryLessonAnchor(objectiveId, ckuIds),
    openedAt: Date.now(),
  }
  pendingToken = token
  try { window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(token)) } catch { /* optional resume hint */ }
  logEvent('user_opened_lesson_remediation', token)
  return token
}

export function consumeLessonRemediation(objectiveId) {
  try {
    const raw = window.sessionStorage?.getItem(PENDING_KEY)
    const token = raw ? JSON.parse(raw) : pendingToken
    if (!token) return null
    if (token.objectiveId !== objectiveId) return null
    window.sessionStorage?.removeItem(PENDING_KEY)
    pendingToken = null
    return token
  } catch {
    if (!pendingToken || pendingToken.objectiveId !== objectiveId) return null
    const token = pendingToken
    pendingToken = null
    return token
  }
}
