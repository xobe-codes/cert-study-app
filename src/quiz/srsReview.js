import { STORAGE_KEYS } from '../storageKeys.js'
import { computeMastery } from '../netUtils.js'
import { randomizeQuestionOrder } from '../questionUtils.js'
import { loadQuizBank, saveQuizBank, mergeIntoBank, recordQuizResult } from './quizBankStorage.js'
import { confidenceDuePriority, shouldForceReview } from './confidenceScheduler.js'

export const REVIEW_SESSION_CAP = 20

async function loadProgress() {
  return (await window.storage.getItem(STORAGE_KEYS.progress)) || {}
}

function normalizeQuestionText(q) {
  return (q || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Count banked questions due for SRS review right now (includes confidence pins). */
export async function countDueQuestions(now = Date.now()) {
  const bank = await loadQuizBank()
  let n = 0
  for (const objectiveId of Object.keys(bank)) {
    for (const q of bank[objectiveId]) {
      if (!q.srs || (q.attempts?.length || 0) === 0) continue
      const due = (q.srs.due ?? 0) <= now
      if (due || shouldForceReview(q, now)) n++
    }
  }
  return n
}

/** Interleaved due-question queue for Daily Review (cap 20 by default). */
export async function loadDueQuestions(limit = REVIEW_SESSION_CAP, now = Date.now()) {
  const bank = await loadQuizBank()
  const progress = await loadProgress()
  const examDate = await window.storage.getItem(STORAGE_KEYS.examDate)
  const daysToExam = examDate ? Math.ceil((new Date(examDate) - now) / 86400000) : 999
  const nearExam = daysToExam > 0 && daysToExam <= 30

  function hasDecliningAccuracy(objId) {
    const entry = progress[objId]
    if (!entry) return false
    const { score: masteryScore } = computeMastery(entry)
    if (masteryScore < 0.8) return false
    const scores = (entry.quizScores || []).slice(-3)
    if (scores.length < 3) return false
    const accs = scores.map(s => s.score / Math.max(s.total, 1))
    return accs[0] > accs[1] && accs[1] > accs[2]
  }

  const bySection = {}
  for (const objectiveId of Object.keys(bank)) {
    const declining = hasDecliningAccuracy(objectiveId)
    for (const q of bank[objectiveId]) {
      if (!q.srs || (q.attempts?.length || 0) === 0) continue
      const due = (q.srs.due ?? 0) <= now
      const forced = shouldForceReview(q, now)
      if (!due && !forced && !declining) continue
      const priority = confidenceDuePriority(q, { nearExam })
      ;(bySection[objectiveId] ||= []).push({
        ...q,
        objectiveId,
        dueAt: q.srs.due ?? 0,
        _priority: declining && !due && !forced ? priority + 0.5 : priority,
      })
    }
  }

  const queues = Object.values(bySection)
    .map(arr => arr.sort((a, b) => a._priority - b._priority || a.dueAt - b.dueAt))
    .sort(() => Math.random() - 0.5)
  const interleaved = []
  let added = true
  while (added && interleaved.length < limit) {
    added = false
    for (const queue of queues) {
      if (queue.length) {
        interleaved.push(queue.shift())
        added = true
        if (interleaved.length >= limit) break
      }
    }
  }
  return randomizeQuestionOrder(interleaved)
}

/**
 * Test/dev helper — seed questions due for review immediately.
 * Returns the banked question ids that were marked due.
 */
export async function seedDueReviewBank(objectiveId, questions, { dueAt = Date.now() } = {}) {
  let bank = await loadQuizBank()
  bank = mergeIntoBank(bank, objectiveId, questions)
  const incoming = new Set(questions.map(q => normalizeQuestionText(q.question)))
  const seededIds = []
  for (const q of bank[objectiveId]) {
    if (!incoming.has(normalizeQuestionText(q.question))) continue
    q.attempts = [{ correct: false, at: Date.now() }]
    q.srs = { interval: 2, reps: 1, lapses: 0, intervalIndex: 0, due: dueAt }
    seededIds.push(q.id)
  }
  await saveQuizBank(bank)
  return seededIds
}

export { recordQuizResult }
