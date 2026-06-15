/** Detect low-quality / template wrong-answer explanations. */
import { isGenericExamTip } from './examTipLogic.js'

export const FALLBACK_EXPLANATION_RE = [
  /is incorrect because the scenario requires:/i,
  /describes a different mechanism than this question tests/i,
  /contradicts the expected behavior/i,
  /does not satisfy what the question asks/i,
  /is a plausible guess but does not explain the symptom/i,
  /doesn't fit the scenario above/i,
  /see the correct-answer explanation for why/i,
  /does not answer .+ in this stem/i,
]

export const GENERIC_TRAP_RE = /^Picking a familiar term without matching the exact behavior tested$/i

export function isFallbackExplanation(text) {
  if (!text || typeof text !== 'string') return true
  return FALLBACK_EXPLANATION_RE.some(re => re.test(text))
}

export function isGenericWrongExplanation(text) {
  return isFallbackExplanation(text)
}

export function isGenericTrap(label) {
  if (!label) return true
  return GENERIC_TRAP_RE.test(label.trim())
}

export { isGenericExamTip, GENERIC_EXAM_TIP_RE } from './examTipLogic.js'

/** Score one distractor explanation 0–4. */
export function scoreDistractorExplanation(q, choiceIndex, text, trap) {
  if (!text) return 0
  let score = 0
  const wrong = q.choices?.[choiceIndex] || ''
  const wrongSnippet = wrong.slice(0, Math.min(20, wrong.length)).toLowerCase()

  if (wrongSnippet && text.toLowerCase().includes(wrongSnippet.slice(0, 8))) score += 1
  if (!isFallbackExplanation(text)) score += 1
  if (text.length >= 60 && !/the right idea:/i.test(text)) score += 1
  if (trap && !isGenericTrap(trap)) score += 1

  const siblings = (q.answerReview?.incorrect || [])
    .filter(i => i.choiceIndex !== choiceIndex)
    .map(i => i.explanation)
  if (!siblings.includes(text)) score += 1

  return Math.min(4, score)
}

export function scoreAnswerReview(q) {
  const incorrect = q.answerReview?.incorrect || []
  if (!incorrect.length) return { avg: 0, min: 0, items: [] }
  const items = incorrect.map(item => ({
    choiceIndex: item.choiceIndex,
    score: scoreDistractorExplanation(q, item.choiceIndex, item.explanation, item.misconceptionTested),
    fallback: isFallbackExplanation(item.explanation),
    genericTrap: isGenericTrap(item.misconceptionTested),
  }))
  const scores = items.map(i => i.score)
  return {
    avg: scores.reduce((a, b) => a + b, 0) / scores.length,
    min: Math.min(...scores),
    items,
    fallbackCount: items.filter(i => i.fallback).length,
    duplicateTexts: new Set(incorrect.map(i => i.explanation)).size < incorrect.length,
  }
}

export function validateQuestionAnswerReview(q) {
  const errors = []
  const where = `${q.id || 'no-id'}`
  const ar = q.answerReview
  if (!ar?.incorrect?.length) {
    errors.push(`${where}: missing answerReview.incorrect`)
    return errors
  }
  const texts = ar.incorrect.map(i => i.explanation)
  if (new Set(texts).size < texts.length) {
    errors.push(`${where}: duplicate distractor explanations`)
  }
  for (const item of ar.incorrect) {
    if (isFallbackExplanation(item.explanation)) {
      errors.push(`${where}: fallback explanation for choice ${item.choiceIndex}`)
    }
    if (isGenericTrap(item.misconceptionTested)) {
      errors.push(`${where}: generic trap for choice ${item.choiceIndex}`)
    }
  }
  if (isGenericExamTip(ar.examTip)) {
    errors.push(`${where}: generic examTip`)
  }
  const { min, avg } = scoreAnswerReview(q)
  if (min < 3) errors.push(`${where}: distractor quality below threshold (min=${min}, avg=${avg.toFixed(1)})`)
  return errors
}

export function tierQuestion(q) {
  if (q.type === 'ordering') return 'C'
  if (q.type === 'troubleshooting' || q.type === 'scenario') return 'B'
  if ((q.ckuIds || []).length > 0) return 'A'
  return 'B'
}
