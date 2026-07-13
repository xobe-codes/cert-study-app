import regeneratedExplanations from '../answerReview/regeneratedExplanations.json'

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
