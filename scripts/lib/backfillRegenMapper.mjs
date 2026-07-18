/**
 * Map runtime-applied answer reviews → regeneratedExplanations.json shape.
 * Used by scripts/backfillRegenFromRuntimeReviews.mjs (no network / no LLM).
 */
import {
  isBannedMechanismLanguage,
  isFallbackExplanation,
  isGenericTrap,
  isTemplateWhyWrongHere,
} from '../../src/answerReview/answerReviewQuality.js'
import { isGenericExamTip } from '../../src/answerReview/examTipLogic.js'
import { isMultiQuestion, multiCorrectIndexes } from '../../src/questionUtils.js'

export const MIN_FIELD_CHARS = 15

const REQUIRED_FIELDS = [
  'misconceptionReason',
  'whyItSeems',
  'whyWrongHere',
  'memoryAnchor',
  'contrast',
]

/** SADE filler that is not a useful whyItSeems (plausible-trap) sentence. */
const WEAK_WHAT_IT_DOES_RE = [
  /points to a related idea/i,
  /but not the specific behavior or value required/i,
  /describes a mechanism that could sound plausible/i,
]

function trimText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function isLongEnough(text) {
  return trimText(text).length >= MIN_FIELD_CHARS
}

function isUsableProse(text) {
  const t = trimText(text)
  if (!isLongEnough(t)) return false
  if (isBannedMechanismLanguage(t) || isTemplateWhyWrongHere(t) || isFallbackExplanation(t)) return false
  return true
}

function isMeaningfulWhatItDoes(text) {
  if (!isUsableProse(text)) return false
  return !WEAK_WHAT_IT_DOES_RE.some(re => re.test(text))
}

function firstSentence(text) {
  const t = trimText(text)
  if (!t) return ''
  const m = t.match(/^[^.!?]+[.!?]?/)
  return m ? trimText(m[0]) : t
}

function sentenceCount(text) {
  const t = trimText(text)
  if (!t) return 0
  return t.split(/(?<=[.!?])\s+/).filter(Boolean).length
}

/** Wrong-choice indexes for MC / multi (excludes every keyed correct index). */
export function wrongChoiceIndexes(q) {
  const n = Array.isArray(q?.choices) ? q.choices.length : 0
  if (n < 2) return []
  const correct = new Set(
    isMultiQuestion(q) ? multiCorrectIndexes(q) : [q.correctIndex],
  )
  return [...Array(n).keys()].filter(i => !correct.has(i))
}

export function keyedCorrectChoice(q) {
  if (isMultiQuestion(q)) {
    const idxs = multiCorrectIndexes(q)
    return idxs.map(i => q.choices?.[i]).filter(Boolean).join(' / ') || ''
  }
  return q.choices?.[q.correctIndex] || ''
}

function misconceptionReasonFor(q, item, wrong) {
  const trap = trimText(item?.misconceptionTested)
  if (isUsableProse(trap) && !isGenericTrap(trap)) return trap

  const correct = keyedCorrectChoice(q)
  if (trap && !isGenericTrap(trap)) {
    const expanded = `False belief that ${trap} — treating "${wrong}" as if it satisfied the stem instead of "${correct}".`
    if (isUsableProse(expanded)) return expanded
  }

  return `Believing "${wrong}" is correct when this stem actually requires "${correct}".`
}

function whyItSeemsFor(item, wrong) {
  const what = trimText(item?.whatItDoes)
  if (isMeaningfulWhatItDoes(what)) return what
  return `"${wrong}" looks tempting because it names a familiar related idea near this stem, so it feels like it could be the answer.`
}

function whyWrongHereFor(item) {
  const why = trimText(item?.whyWrongHere)
  if (isUsableProse(why)) return why

  const expl = trimText(item?.explanation)
  if (isUsableProse(expl)) return expl

  throw new Error('no usable whyWrongHere or explanation')
}

function memoryAnchorFor(q, wrong) {
  const tip = trimText(q?.answerReview?.examTip)
  if (
    tip
    && !isGenericExamTip(tip)
    && sentenceCount(tip) === 1
    && isUsableProse(tip)
  ) {
    return tip
  }

  const correct = keyedCorrectChoice(q)
  return `Remember: choose "${correct}" — not "${wrong}" — for what this stem actually tests.`
}

function contrastFor(q, item, wrong) {
  const correct = keyedCorrectChoice(q)
  const whyBit = firstSentence(item?.whyWrongHere || item?.explanation || '')
  const base = `Correct "${correct}" vs wrong "${wrong}"`
  const withWhy = whyBit && isUsableProse(`${base}: ${whyBit}`)
    ? `${base}: ${whyBit}`
    : `${base} — only the keyed choice matches the exact behavior this stem asks for.`
  if (!isUsableProse(withWhy)) {
    throw new Error('failed to build usable contrast')
  }
  return withWhy
}

/**
 * Build one regen incorrect[] entry from a runtime-applied distractor item.
 * @throws if a required field cannot be produced without banned language.
 */
export function mapDistractorToRegenFields(q, item) {
  const choiceIndex = item?.choiceIndex
  if (typeof choiceIndex !== 'number') {
    throw new Error('missing choiceIndex')
  }
  const wrong = trimText(q.choices?.[choiceIndex])
  if (!wrong) throw new Error(`empty choice text at index ${choiceIndex}`)

  const entry = {
    choiceIndex,
    misconceptionReason: misconceptionReasonFor(q, item, wrong),
    whyItSeems: whyItSeemsFor(item, wrong),
    whyWrongHere: whyWrongHereFor(item),
    memoryAnchor: memoryAnchorFor(q, wrong),
    contrast: contrastFor(q, item, wrong),
  }

  const fieldErrors = validateRegenEntryFields(entry)
  if (fieldErrors.length) {
    throw new Error(fieldErrors.join('; '))
  }
  return entry
}

export function validateRegenEntryFields(entry) {
  const errors = []
  for (const field of REQUIRED_FIELDS) {
    const value = trimText(entry?.[field])
    if (!isLongEnough(value)) {
      errors.push(`${field} empty or <${MIN_FIELD_CHARS} chars`)
      continue
    }
    if (isBannedMechanismLanguage(value) || isTemplateWhyWrongHere(value) || isFallbackExplanation(value)) {
      errors.push(`${field} has banned/template language`)
    }
  }
  return errors
}

/**
 * Validate a full question regen block against the clean-bank question.
 * @returns {string[]} error messages (empty = ok)
 */
export function validateRegenQuestionBlock(q, block) {
  const errors = []
  const where = q?.id || 'no-id'
  const expected = wrongChoiceIndexes(q)
  const incorrect = Array.isArray(block?.incorrect) ? block.incorrect : []
  const got = incorrect.map(i => i.choiceIndex).sort((a, b) => a - b)
  const exp = [...expected].sort((a, b) => a - b)

  if (got.length !== exp.length || got.some((v, i) => v !== exp[i])) {
    errors.push(`${where}: wrong-choice indexes [${got}] !== expected [${exp}]`)
  }

  const seen = new Set()
  for (const entry of incorrect) {
    if (seen.has(entry.choiceIndex)) {
      errors.push(`${where}: duplicate choiceIndex ${entry.choiceIndex}`)
    }
    seen.add(entry.choiceIndex)
    for (const msg of validateRegenEntryFields(entry)) {
      errors.push(`${where} choice ${entry.choiceIndex}: ${msg}`)
    }
  }
  return errors
}

/**
 * Map one applied question → { incorrect: [...] } regen block.
 */
export function buildRegenBlockFromApplied(q) {
  const expected = wrongChoiceIndexes(q)
  const byIndex = new Map(
    (q.answerReview?.incorrect || []).map(item => [item.choiceIndex, item]),
  )
  const incorrect = expected.map(choiceIndex => {
    const item = byIndex.get(choiceIndex)
    if (!item) {
      throw new Error(`${q.id}: applied review missing incorrect for choiceIndex ${choiceIndex}`)
    }
    return mapDistractorToRegenFields(q, item)
  })
  const block = { incorrect }
  const errors = validateRegenQuestionBlock(q, block)
  if (errors.length) {
    throw new Error(errors.join('\n'))
  }
  return block
}
