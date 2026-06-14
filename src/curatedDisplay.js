import { CURATED_SOURCES, getCurated, getCuratedQuestions, hasCuratedReading } from './data/ccnaCurated.js'

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

const SOURCE_SHORT_NAMES = {
  [CURATED_SOURCES.blueprint]: 'Cisco exam blueprint',
  [CURATED_SOURCES.certVol1]: 'Odom Vol 1',
  [CURATED_SOURCES.jeremy]: "Jeremy's IT Lab",
}

/** Long source name → short learner-facing label. */
export function shortSourceLabel(sourceName) {
  if (SOURCE_SHORT_NAMES[sourceName]) return SOURCE_SHORT_NAMES[sourceName]
  if (/blueprint|exam topic/i.test(sourceName)) return 'Cisco exam blueprint'
  if (/Jeremy/i.test(sourceName)) return "Jeremy's IT Lab"
  if (/Odom|Official Cert Guide/i.test(sourceName)) return 'Odom Vol 1'
  return String(sourceName).replace(/ —.*$/, '').replace(/\s*\(.*\)$/, '').trim()
}

/** Exam topic + grounded-in sources — replaces raw source-name dumps in lesson headers. */
export function formatCuratedAttribution(sourceRefs, objectiveId) {
  const topic = objectiveId ? `CCNA 200-301 topic ${objectiveId}` : 'CCNA 200-301'
  const labels = [...new Set((sourceRefs || []).map(s => shortSourceLabel(s.sourceName)))]
  const materials = labels.filter(l => l !== 'Cisco exam blueprint')
  if (!materials.length) {
    return labels.includes('Cisco exam blueprint') ? `${topic} · Cisco exam blueprint` : topic
  }
  const joined = materials.length === 1
    ? materials[0]
    : `${materials.slice(0, -1).join(', ')} & ${materials[materials.length - 1]}`
  return `${topic} · from ${joined}`
}

/** What's included for this objective — lesson/quiz/flashcards + offline hint. */
export function getCuratedBundleLabel(objectiveId) {
  const data = getCurated(objectiveId)
  const parts = []
  if (hasCuratedReading(objectiveId)) parts.push('lesson')
  if (getCuratedQuestions(objectiveId).length > 0) parts.push('quiz')
  if (data?.flashcards?.length) parts.push('flashcards')
  if (!parts.length) return null
  return `${parts.join(' · ')} · offline`
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
