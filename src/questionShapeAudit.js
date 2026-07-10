import { isMcQuestion, isOrderingQuestion, isCliQuestion, isMultiQuestion, multiCorrectIndexes } from './questionUtils.js'

/** Human-readable issues when question type does not match answer shape. */
export function auditQuestionShape(q) {
  const issues = []
  const stem = String(q?.question || '').trim()
  if (!stem) issues.push('empty-stem')

  const ordering = isOrderingQuestion(q)
  const cli = isCliQuestion(q)
  const multi = isMultiQuestion(q)
  const hasOrderItems = Array.isArray(q?.orderItems) && q.orderItems.length >= 3
  const hasChoices = Array.isArray(q?.choices) && q.choices.length > 0
  const mc = isMcQuestion(q)

  if (q?.type === 'cli') {
    if (!cli) issues.push('cli-missing-answers')
    if (hasChoices) issues.push('cli-has-choices')
    if (hasOrderItems) issues.push('cli-has-orderItems')
  } else if (cli) {
    if (q?.type !== 'cli') issues.push('cli-answers-without-cli-type')
  }

  if (q?.type === 'ordering') {
    if (!hasOrderItems) issues.push('ordering-missing-orderItems')
    if (hasChoices) issues.push('ordering-has-choices')
  } else if (ordering) {
    if (q?.type !== 'ordering') issues.push('orderItems-without-ordering-type')
  }

  if (multi) {
    if (q.choices.length < 3) issues.push('multi-too-few-choices')
    const idxs = multiCorrectIndexes(q)
    if (idxs.length < 2) issues.push('multi-too-few-correct')
    if (idxs.some(i => i < 0 || i >= q.choices.length)) issues.push('multi-bad-correctIndexes')
    const blankChoices = q.choices.filter(c => !String(c ?? '').trim()).length
    if (blankChoices) issues.push(`multi-blank-choice-text:${blankChoices}`)
  } else if (mc) {
    if (q.choices.length < 2) issues.push('mc-too-few-choices')
    if (q.correctIndex < 0 || q.correctIndex >= q.choices.length) issues.push('mc-bad-correctIndex')
    const blankChoices = q.choices.filter(c => !String(c ?? '').trim()).length
    if (blankChoices) issues.push(`mc-blank-choice-text:${blankChoices}`)
    if (q.type === 'true-false' && q.choices.length !== 2) issues.push('true-false-not-two-choices')
  } else if (!ordering && !cli) {
    if (!hasChoices && !hasOrderItems) issues.push('unplayable-no-answers')
    else if (hasChoices && !mc) issues.push('choices-not-valid-mc')
  }

  return issues
}

/** MC questions safe for Domain Pass / mock MC-only surfaces. */
export function isPlayableMcQuestion(q) {
  return auditQuestionShape(q).length === 0 && isMcQuestion(q)
}

/** Single- or multi-choice questions safe for Domain Pass / mock choice pools. */
export function isPlayableChoiceQuestion(q) {
  return auditQuestionShape(q).length === 0 && (isMcQuestion(q) || isMultiQuestion(q))
}
