import {
  isFallbackExplanation,
  isTemplateWhyWrongHere,
  hasSplicedProse,
} from '../answerReview/answerReviewQuality.js'

/** Map regen JSON fields → runtime answerReview.incorrect[] shape. */
export function mapRegenToIncorrectItem(regenItem) {
  if (!regenItem || regenItem.choiceIndex == null) return null

  const parts = [regenItem.whyItSeems, regenItem.contrast].filter(Boolean)
  const whatItDoes = parts.join(' ').trim() || undefined
  const whyWrongHere = regenItem.whyWrongHere?.trim() || undefined
  const explanation = whyWrongHere
    || (regenItem.memoryAnchor ? `${whyWrongHere || ''} ${regenItem.memoryAnchor}`.trim() : '')
    || undefined

  return {
    choiceIndex: regenItem.choiceIndex,
    whyWrongHere,
    whatItDoes,
    misconceptionTested: regenItem.misconceptionReason?.trim() || undefined,
    explanation,
  }
}

function regenItemPassesQuality(item) {
  if (!item?.whyWrongHere || isTemplateWhyWrongHere(item.whyWrongHere)) return false
  if (item.whatItDoes && isFallbackExplanation(item.whatItDoes)) return false
  if (hasSplicedProse(item)) return false
  return true
}

/**
 * Per-choice regen lookup for generateAnswerReview merge.
 * Regen travels with the lazy-loaded clean-bank question so the 99-spec corpus
 * stays in per-domain chunks instead of inflating the startup core bundle.
 */
export function regenIncorrectFor(question, choiceIndex) {
  const incorrect = question?.regeneratedIncorrect
  if (!Array.isArray(incorrect)) return null
  const raw = incorrect.find(exp => exp.choiceIndex === choiceIndex)
  if (!raw) return null
  const mapped = mapRegenToIncorrectItem(raw)
  return regenItemPassesQuality(mapped) ? mapped : null
}

/**
 * Apply 99-spec regenerated explanations to quiz questions.
 * Merges high-quality wrong-answer explanations into question data at render time.
 */
export function applyRegenExplanations(question) {
  if (!question || !Array.isArray(question.regeneratedIncorrect)) return question

  return {
    ...question,
    explanations: question.regeneratedIncorrect.map(exp => ({
      ...exp,
      // Map choiceIndex to the actual choice text
      choice: question.choices?.[exp.choiceIndex],
    })),
  }
}

/**
 * Get 99-spec explanation for a specific choice.
 * Used in ExplainMistake and wrong-answer reveal flows.
 */
export function getChoiceExplanation(question, choiceIndex) {
  if (!Array.isArray(question?.regeneratedIncorrect)) return null
  return question.regeneratedIncorrect.find(exp => exp.choiceIndex === choiceIndex)
}

/**
 * Check if a question has regenerated explanations.
 */
export function hasRegenExplanations(question) {
  return Array.isArray(question?.regeneratedIncorrect)
    && question.regeneratedIncorrect.length > 0
}

/**
 * Get stats on regenerated explanations coverage.
 */
export function getRegenStats(questions = []) {
  return {
    totalQuestionsRegen: questions.filter(hasRegenExplanations).length,
    totalChoicesRegen: questions.reduce(
      (sum, question) => sum + (question.regeneratedIncorrect?.length || 0),
      0,
    ),
  }
}
