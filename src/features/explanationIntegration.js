import regeneratedExplanations from '../answerReview/regeneratedExplanations.json' with { type: 'json' }
import {
  isFallbackExplanation,
  isTemplateWhyWrongHere,
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
  return true
}

/** Per-choice regen lookup for generateAnswerReview merge. */
export function regenIncorrectFor(questionId, choiceIndex) {
  const regen = regeneratedExplanations[questionId]
  if (!regen?.incorrect) return null
  const raw = regen.incorrect.find(exp => exp.choiceIndex === choiceIndex)
  if (!raw) return null
  const mapped = mapRegenToIncorrectItem(raw)
  return regenItemPassesQuality(mapped) ? mapped : null
}

/**
 * Apply 99-spec regenerated explanations to quiz questions.
 * Merges high-quality wrong-answer explanations into question data at render time.
 */
export function applyRegenExplanations(question, questionId) {
  if (!question || !regeneratedExplanations[questionId]) {
    return question
  }

  const regen = regeneratedExplanations[questionId]
  if (!regen.incorrect) return question

  return {
    ...question,
    explanations: regen.incorrect.map(exp => ({
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
export function getChoiceExplanation(questionId, choiceIndex) {
  const regen = regeneratedExplanations[questionId]
  if (!regen?.incorrect) return null

  return regen.incorrect.find(exp => exp.choiceIndex === choiceIndex)
}

/**
 * Check if a question has regenerated explanations.
 */
export function hasRegenExplanations(questionId) {
  return !!regeneratedExplanations[questionId]?.incorrect
}

/**
 * Get stats on regenerated explanations coverage.
 */
export function getRegenStats() {
  return {
    totalQuestionsRegen: Object.keys(regeneratedExplanations).length,
    totalChoicesRegen: Object.values(regeneratedExplanations).reduce(
      (sum, item) => sum + (item.incorrect?.length || 0),
      0
    ),
  }
}
