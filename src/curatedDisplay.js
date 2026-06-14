import { getCurated, getCuratedQuestions } from './data/ccnaCurated.js'

const DIFF_RANK = { easy: 0, medium: 1, hard: 2 }

/** Pill accent for quiz-style difficulty labels (matches QuestionMeta). */
export function difficultyAccent(difficulty) {
  if (difficulty === 'hard') return 'amber'
  if (difficulty === 'medium') return 'sky'
  if (difficulty === 'easy') return 'mint'
  return 'silver'
}

function summarizeDifficulty(questions) {
  const tagged = (questions || []).filter(q => q?.difficulty && DIFF_RANK[q.difficulty] != null)
  if (!tagged.length) return null
  return tagged.reduce((hardest, q) => (
    DIFF_RANK[q.difficulty] > DIFF_RANK[hardest] ? q.difficulty : hardest
  ), 'easy')
}

/** Hardest tagged question difficulty for an objective's curated pool. */
export function getObjectiveDifficulty(objectiveId) {
  return summarizeDifficulty(getCuratedQuestions(objectiveId))
}

/** Hardest tagged question difficulty for a CKU / sub-objective within an objective. */
export function getCkuDifficulty(objectiveId, ckuId) {
  const qs = getCuratedQuestions(objectiveId).filter(q => q.ckuIds?.includes(ckuId))
  return summarizeDifficulty(qs) || getObjectiveDifficulty(objectiveId)
}

/** Short reading preview for mastered objectives (plain text, no markdown). */
export function getCuratedPreview(objectiveId, { maxLen = 110 } = {}) {
  const data = getCurated(objectiveId)
  const reading = data?.reading
  if (!reading) return null
  const raw = reading.definition
    || reading.keyPoints?.[0]
    || reading.tiers?.beginner
    || ''
  const plain = String(raw).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim()
  if (!plain) return null
  if (plain.length <= maxLen) return plain
  return `${plain.slice(0, maxLen - 1)}…`
}
