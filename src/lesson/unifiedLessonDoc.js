/**
 * Spec 9 — merge Beginner / Intermediate / Exam-ready into one lesson document.
 * Spec 15 — spine fields for learn → retain order.
 */
import { READING_TIER_KEYS } from './readingTier.js'
import { explanationBodyFromReading, resolveBigTakeaway } from './explanationFormat.js'

function firstSentences(text, n = 2) {
  const cleaned = String(text || '').replace(/\*\*/g, '').trim()
  if (!cleaned) return ''
  const parts = cleaned.split(/(?<=[.!?])\s+/).filter(s => s.trim())
  return parts.slice(0, n).join(' ')
}

/**
 * @returns {{
 *   hook: string,
 *   plainEnglish: string,
 *   howItWorks: string,
 *   examEngineer: string,
 *   rememberThis: string[],
 *   dontConfuse: string[],
 *   terms: Array<{ term: string, detail: string }>,
 *   takeaway: string|null,
 * }}
 */
export function buildUnifiedLesson(curated, objective = null) {
  const reading = curated?.reading || {}
  const tiers = reading.tiers || {}
  const plainEnglish = (
    tiers[READING_TIER_KEYS.beginner]
    || reading.definition
    || tiers[READING_TIER_KEYS.intermediate]
    || explanationBodyFromReading(reading, READING_TIER_KEYS.beginner)
    || ''
  ).trim()
  const howItWorks = (
    tiers[READING_TIER_KEYS.intermediate]
    || reading.definition
    || plainEnglish
  ).trim()
  const examEngineer = (
    tiers[READING_TIER_KEYS.examReady]
    || reading.advanced
    || howItWorks
  ).trim()

  const takeaway = resolveBigTakeaway(reading)
  const hook = takeaway
    || firstSentences(plainEnglish, 2)
    || (objective?.title ? `Master ${objective.title} for the CCNA exam.` : '')

  const rememberThis = (reading.keyPoints || []).filter(Boolean).slice(0, 3)
  const dontConfuse = (reading.commonMistakes || []).filter(Boolean).slice(0, 4)
  const terms = (curated?.flashcards || []).slice(0, 8).map(f => ({
    term: f.front || f.term,
    detail: f.back || f.detail,
    id: f.id,
  })).filter(t => t.term && t.detail)

  return {
    hook,
    plainEnglish,
    howItWorks,
    examEngineer,
    rememberThis,
    dontConfuse,
    terms,
    takeaway,
    realWorld: reading.realWorld || '',
    related: reading.related || [],
  }
}

/** Progress patch when opening unified lesson. */
export function unifiedLessonProgressPatch() {
  return { readingTier: 'unified' }
}
