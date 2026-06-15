import { STORAGE_KEYS } from '../storageKeys.js'
import { normalizeQuestionForBank } from '../questionUtils.js'

export const QUIZ_BANK_MIN = 5

const DAY_MS = 86400000
const SRS_LADDER = [2, 7, 14, 30, 60]

function normalizeQuestionText(q) {
  return (q || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function nextSrs(prev, correct) {
  const s = prev || { reps: 0, lapses: 0 }
  let reps = s.reps || 0
  let lapses = s.lapses || 0
  if (correct) reps += 1
  else { reps = 0; lapses += 1 }
  const intervalIndex = Math.min(Math.max(reps - 1, 0), SRS_LADDER.length - 1)
  const interval = SRS_LADDER[intervalIndex]
  return { interval, reps, lapses, intervalIndex, due: Date.now() + interval * DAY_MS }
}

export async function loadQuizBank() {
  return (await window.storage.getItem(STORAGE_KEYS.quizBank)) || {}
}

export async function saveQuizBank(bank) {
  await window.storage.setItem(STORAGE_KEYS.quizBank, bank)
}

export function mergeIntoBank(bank, objectiveId, questions) {
  const existing = bank[objectiveId] || []
  const seen = new Set(existing.map(q => normalizeQuestionText(q.question)))
  let counter = existing.length
  const added = questions
    .filter(q => q && q.question && !seen.has(normalizeQuestionText(q.question)))
    .map(q => normalizeQuestionForBank(q, objectiveId, counter++))
  bank[objectiveId] = [...existing, ...added]
  return bank
}

export async function recordQuizResult(objectiveId, questionId, { correct, rating, schedule = true } = {}) {
  const bank = await loadQuizBank()
  const list = bank[objectiveId]
  if (!list) return
  const q = list.find(x => x.id === questionId)
  if (!q) return
  if (typeof correct === 'boolean') {
    q.attempts.push({ correct, at: Date.now() })
    if (schedule) q.srs = nextSrs(q.srs, correct)
  }
  if (rating) q.ratings.push({ value: rating, at: Date.now() })
  await saveQuizBank(bank)
}

export async function enableSectionReview(objectiveId) {
  const bank = await loadQuizBank()
  const list = bank[objectiveId]
  if (!list) return
  let changed = false
  list.forEach(q => {
    if ((q.attempts?.length || 0) > 0 && !q.srs) {
      q.srs = nextSrs(undefined, q.attempts[q.attempts.length - 1].correct)
      changed = true
    }
  })
  if (changed) await saveQuizBank(bank)
}

/** Stub — full interleaved review queue lives in App.jsx for home/review flows. */
export async function loadDueQuestions() {
  return []
}

export async function seedTestedOutReview(objectiveId, questions) {
  let bank = await loadQuizBank()
  bank = mergeIntoBank(bank, objectiveId, questions)
  const now = Date.now()
  const incoming = new Set(questions.map(q => normalizeQuestionText(q.question)))
  bank[objectiveId].forEach(q => {
    if (incoming.has(normalizeQuestionText(q.question)) && (q.attempts?.length || 0) === 0) {
      q.attempts = [{ correct: true, at: now }]
      q.srs = { interval: SRS_LADDER[1], reps: 2, lapses: 0, intervalIndex: 1, due: now + SRS_LADDER[1] * DAY_MS }
    }
  })
  await saveQuizBank(bank)
}
