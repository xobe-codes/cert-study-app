import { STORAGE_KEYS } from '../storageKeys.js'
import { normalizeQuestionForBank } from '../questionUtils.js'
import { nextSrs, applyConfidenceToSrs, SRS_LADDER } from './confidenceScheduler.js'
import { filterHealthyQuestions } from '../data/questionHealth.js'

export const QUIZ_BANK_MIN = 5
export const MASTERY_GATE = 0.7

const DAY_MS = 86400000

function normalizeQuestionText(q) {
  return (q || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Dedup key for quiz bank merge (sync + import). */
export function quizQuestionKey(q) {
  return normalizeQuestionText(q?.question ?? q)
}

export async function loadQuizBank() {
  const stored = (await window.storage.getItem(STORAGE_KEYS.quizBank)) || {}
  return Object.fromEntries(
    Object.entries(stored).map(([objectiveId, questions]) => [
      objectiveId,
      filterHealthyQuestions(Array.isArray(questions) ? questions : []),
    ]),
  )
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

/** Replace a curated objective's stale content with its current canonical pool. */
export function reconcileCuratedBank(bank, objectiveId, questions) {
  const existing = bank[objectiveId] || []
  const byId = new Map(existing.filter(q => q?.id).map(q => [q.id, q]))
  const byText = new Map(existing.filter(q => q?.question).map(q => [quizQuestionKey(q), q]))
  bank[objectiveId] = questions.map((question, index) => {
    const normalized = normalizeQuestionForBank(question, objectiveId, index)
    const previous = byId.get(normalized.id) || byText.get(quizQuestionKey(normalized))
    if (!previous) return normalized
    return {
      ...normalized,
      attempts: previous.attempts || [],
      ratings: previous.ratings || [],
      ...(previous.srs ? { srs: previous.srs } : {}),
    }
  })
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
    if (schedule) q.srs = nextSrs(q.srs, correct, rating || null)
  }

  if (rating) {
    q.ratings.push({ value: rating, at: Date.now() })
    if (schedule) {
      const lastAttempt = q.attempts?.length ? q.attempts[q.attempts.length - 1] : null
      const lastCorrect = lastAttempt ? lastAttempt.correct : null
      if (q.srs) {
        q.srs = applyConfidenceToSrs(q.srs, rating, lastCorrect)
      } else if (lastCorrect != null) {
        q.srs = nextSrs(undefined, lastCorrect, rating)
      } else if (rating === 'practice') {
        q.srs = applyConfidenceToSrs(
          { interval: 0, reps: 0, lapses: 0, intervalIndex: 0, due: Date.now() },
          'practice',
          null,
        )
      }
    }
  }

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

export { nextSrs, applyConfidenceToSrs, SRS_LADDER }
