/**
 * Pure, session-agnostic wrong-answer diagnosis.
 * Reuses the existing answer-review resolution chain (gold → regen → clean-bank → SADE)
 * and existing grading/type helpers — never recalculates correctness, SRS, exposure, or mastery.
 * No storage writes, no UI, no live AI calls. Safe to call from any session after grading.
 */
import { applyAnswerReviewToQuestion } from '../answerReviewLogic.js'
import {
  isMcQuestion, isMultiQuestion, isOrderingQuestion, isCliQuestion,
  multiCorrectIndexes, normalizeSelectedIndexes,
} from '../questionUtils.js'
import { cliStringsEquivalent } from '../lab/cliGrading.js'

const SCHEMA_VERSION = 1

function slugify(label) {
  const s = String(label || '').trim().toLowerCase()
  if (!s) return null
  return s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || null
}

function isCorrectResult(gradeResult) {
  if (typeof gradeResult === 'boolean') return gradeResult
  if (gradeResult && typeof gradeResult === 'object' && 'correct' in gradeResult) return Boolean(gradeResult.correct)
  return Boolean(gradeResult)
}

function baseDiagnosis({ errorClass, misconceptionLabel, trapFamily, ckuIds, source }) {
  return {
    schemaVersion: SCHEMA_VERSION,
    errorClass,
    misconceptionId: slugify(trapFamily || misconceptionLabel),
    misconceptionLabel: misconceptionLabel || null,
    trapFamily: trapFamily || null,
    ckuIds: ckuIds?.length ? ckuIds : undefined,
    source,
  }
}

function diagnoseMc(question, submittedAnswer) {
  const reviewed = applyAnswerReviewToQuestion(question)
  const item = reviewed.answerReview?.incorrect?.find(i => i.choiceIndex === submittedAnswer)
  if (!item) {
    return baseDiagnosis({
      errorClass: 'wrong-choice-selected',
      misconceptionLabel: null,
      trapFamily: null,
      ckuIds: question.ckuIds,
      source: 'limited',
    })
  }
  return baseDiagnosis({
    errorClass: 'concept-confusion',
    misconceptionLabel: item.misconceptionTested || item.whyWrongHere || null,
    trapFamily: item.misconceptionTested || null,
    ckuIds: question.ckuIds,
    source: item.genericDebrief ? 'generated-fallback' : 'explicit-diagnostic',
  })
}

function diagnoseMulti(question, submittedAnswer) {
  const correct = new Set(multiCorrectIndexes(question))
  const selected = new Set(normalizeSelectedIndexes(submittedAnswer))
  const extraWrong = [...selected].filter(i => !correct.has(i)).sort((a, b) => a - b)
  const missedCorrect = [...correct].filter(i => !selected.has(i)).sort((a, b) => a - b)

  const reviewed = applyAnswerReviewToQuestion(question)
  const incorrectByIndex = new Map((reviewed.answerReview?.incorrect || []).map(i => [i.choiceIndex, i]))
  const firstWrongItem = extraWrong.map(i => incorrectByIndex.get(i)).find(Boolean)

  let errorClass = 'mixed-selection'
  if (extraWrong.length && !missedCorrect.length) errorClass = 'false-positive-selection'
  else if (!extraWrong.length && missedCorrect.length) errorClass = 'incomplete-selection'

  const misconceptionLabel = firstWrongItem?.misconceptionTested
    || (missedCorrect.length && !extraWrong.length
      ? 'Selected a partial-correct subset — some required options were left unchecked'
      : null)

  return {
    ...baseDiagnosis({
      errorClass,
      misconceptionLabel,
      trapFamily: firstWrongItem?.misconceptionTested || null,
      ckuIds: question.ckuIds,
      source: firstWrongItem ? (firstWrongItem.genericDebrief ? 'generated-fallback' : 'explicit-diagnostic') : 'limited',
    }),
    selectedWrongChoiceIndexes: extraWrong,
    omittedCorrectChoiceIndexes: missedCorrect,
  }
}

function diagnoseOrdering(question, submittedAnswer) {
  const expected = question.orderItems || []
  const given = submittedAnswer?.order || submittedAnswer || []
  const alts = question.orderAccept || []
  let firstMismatch = null
  for (let i = 0; i < expected.length; i++) {
    const got = given[i]
    if (!cliStringsEquivalent(got, expected[i], alts[i])) {
      firstMismatch = { step: i + 1, expected: expected[i], got: got ?? null }
      break
    }
  }
  return {
    ...baseDiagnosis({
      errorClass: 'sequence-error',
      misconceptionLabel: firstMismatch
        ? `Step ${firstMismatch.step} broke the required sequence: expected "${firstMismatch.expected}"${firstMismatch.got ? `, entered "${firstMismatch.got}"` : ' but the step was missing'}.`
        : null,
      trapFamily: 'sequence-order',
      ckuIds: question.ckuIds,
      source: firstMismatch ? 'explicit-diagnostic' : 'limited',
    }),
    firstInvalidStep: firstMismatch?.step ?? null,
  }
}

function diagnoseCli() {
  // The canonical CLI grader (gradeCliAnswerList) is pass/fail only — no wrong-mode/
  // wrong-keyword classification exists yet. Report a clearly-labeled limited diagnosis
  // rather than inventing certainty the grader doesn't provide.
  return baseDiagnosis({
    errorClass: 'cli-mismatch',
    misconceptionLabel: null,
    trapFamily: null,
    ckuIds: undefined,
    source: 'limited',
  })
}

/**
 * diagnoseWrongAnswer({ question, submittedAnswer, gradeResult })
 * Returns null for correct answers. Never throws on missing optional metadata.
 */
export function diagnoseWrongAnswer({ question, submittedAnswer, gradeResult }) {
  if (!question || isCorrectResult(gradeResult)) return null
  try {
    if (isMultiQuestion(question)) return diagnoseMulti(question, submittedAnswer)
    if (isOrderingQuestion(question)) return diagnoseOrdering(question, submittedAnswer)
    if (isCliQuestion(question)) return diagnoseCli(question, submittedAnswer)
    if (isMcQuestion(question)) return diagnoseMc(question, submittedAnswer)
    return null
  } catch {
    return null
  }
}
