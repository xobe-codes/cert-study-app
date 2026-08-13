/**
 * Choice-specific wrong-answer explanations (static, no API).
 * Used at build time and runtime when stored reviews are low quality.
 */
import {
  isFallbackExplanation,
  isGenericStructuredFeedback,
  isGenericTrap,
  isTemplateWhyWrongHere,
  hasSplicedProse,
} from './answerReview/answerReviewQuality.js'
import {
  resolveWrongChoice,
  resolveTrapLabel,
  resolveStemAnchored,
} from './answerReview/ckuTrapLibrary.js'
import { buildStemAnchoredIncorrect } from './answerReview/stemAnchoredDistractor.js'
import { goldAnswerReviewFor } from './answerReview/goldAnswerReviews.js'
import { examTipFor, isGenericExamTip } from './answerReview/examTipLogic.js'
import { regenIncorrectFor } from './features/explanationIntegration.js'
import { sanitizeAnswerText } from './lib/voiceProse.js'
import { isMultiQuestion, multiCorrectIndexes, correctChoiceText } from './questionUtils.js'

export { examTipFor, isGenericExamTip } from './answerReview/examTipLogic.js'

const CHOICE_HEADER_TRUNCATE = 80

/** Trim choice text for AnswerReview block titles (~80 chars). */
export function truncateChoiceLabel(text, maxLen = CHOICE_HEADER_TRUNCATE) {
  const s = String(text ?? '').replace(/\s+/g, ' ').trim()
  if (!s) return ''
  if (s.length <= maxLen) return s
  return `${s.slice(0, maxLen - 1)}…`
}

export function choiceLetterForIndex(index) {
  if (index == null || index < 0) return ''
  return String.fromCharCode(65 + index)
}

/** Post-reveal title when the learner picked this wrong MC option. */
export function formatYourWrongHeader(letter, choiceText) {
  const label = truncateChoiceLabel(choiceText)
  return label ? `YOUR ANSWER: ${letter} — ${label}` : `YOUR ANSWER: ${letter}`
}

/** Post-reveal title for other distractors (collapsed accordion). */
export function formatOtherWrongHeader(letter, choiceText) {
  const label = truncateChoiceLabel(choiceText)
  return label ? `WHY ${letter} IS WRONG — ${label}` : `WHY ${letter} IS WRONG`
}

function ctx(q) {
  const question = (q.question || '').toLowerCase()
  const concept = (q.concept || '').toLowerCase()
  const expl = (q.explanation || '').toLowerCase()
  const correct = correctChoiceText(q)
  const correctLower = correct.toLowerCase()
  return { question, concept, expl, correct, correctLower, blob: `${question} ${concept} ${expl} ${correctLower}` }
}

function wrongChoice(q, choiceIndex) {
  return q.choices?.[choiceIndex] || ''
}

function hasExplicitSadeFields(item) {
  return Boolean(item?.whatItDoes?.trim() && item?.whyWrongHere?.trim())
}

function mergeSadeFields(q, choiceIndex, item = {}, { respectExplicitBoth = false } = {}) {
  const sade = buildStemAnchoredIncorrect({ q, choiceIndex })
  const storedOk = hasExplicitSadeFields(item)
    && !isTemplateWhyWrongHere(item.whyWrongHere)
    && !isFallbackExplanation(item.whatItDoes)
    && !isTemplateWhyWrongHere(item.whatItDoes)
    && !isGenericStructuredFeedback(item.whyWrongHere)
    && !isGenericStructuredFeedback(item.whatItDoes)
  // Gold (or explicit) fields win only when they are not banned templates.
  if (respectExplicitBoth && storedOk) {
    return { whatItDoes: item.whatItDoes, whyWrongHere: item.whyWrongHere }
  }
  return { whatItDoes: sade.whatItDoes, whyWrongHere: sade.whyWrongHere }
}

function hasQualityDistractorFields(item) {
  return Boolean(
    item?.whyWrongHere
    && !isTemplateWhyWrongHere(item.whyWrongHere)
    && !isGenericStructuredFeedback(item.whyWrongHere)
    && item?.whatItDoes
    && !isFallbackExplanation(item.whatItDoes)
    && !isGenericStructuredFeedback(item.whatItDoes),
  )
}

function ensureDistinctExplanations(q, incorrect) {
  const usedExpl = new Map()
  const usedWhy = new Map()
  return incorrect.map(item => {
    let { explanation, misconceptionTested, whatItDoes, whyWrongHere } = item
    const regen = () => buildStemAnchoredIncorrect({ q, choiceIndex: item.choiceIndex })
    if (usedExpl.has(explanation) && !hasQualityDistractorFields(item)) {
      const sade = regen()
      explanation = sade.explanation
      whatItDoes = sade.whatItDoes
      whyWrongHere = sade.whyWrongHere
      misconceptionTested = sade.misconceptionTested || inferTrapForChoice(q, item.choiceIndex)
    } else if (usedExpl.has(explanation) && hasQualityDistractorFields(item)) {
      explanation = `${explanation} (choice ${choiceLetterForIndex(item.choiceIndex)})`
    }
    if (whyWrongHere && usedWhy.has(whyWrongHere)) {
      const wrong = q.choices?.[item.choiceIndex] || ''
      const correct = correctChoiceText(q)
      whyWrongHere = `Unlike **${correct}**, **${wrong}** fails the stem constraint that makes the keyed answer unique.`
    }
    usedExpl.set(explanation, item.choiceIndex)
    if (whyWrongHere) usedWhy.set(whyWrongHere, item.choiceIndex)
    return { ...item, explanation, misconceptionTested, whatItDoes, whyWrongHere }
  })
}

function bankIncorrectFor(q, choiceIndex) {
  const item = q.answerReview?.incorrect?.find(i => i.choiceIndex === choiceIndex)
  if (!item) return null
  const resolved = resolveIncorrectItem(q, item)
  if (resolved.genericDebrief || isTemplateWhyWrongHere(resolved.whyWrongHere)) return null
  if (isGenericStructuredFeedback(resolved.whyWrongHere) || isGenericStructuredFeedback(resolved.whatItDoes)) return null
  // Stored text can carry splices baked in by an older generator — regenerate
  // rather than teaching an unrelated topic's boilerplate.
  if (hasSplicedProse(resolved)) return null
  return resolved
}

/** Gold → regen → clean-bank → SADE precedence for one wrong choice. */
function resolveWrongChoiceForReview(q, choiceIndex, { fromGold = null } = {}) {
  if (fromGold) {
    const goldExplicit = hasExplicitSadeFields(fromGold)
      && !isTemplateWhyWrongHere(fromGold.whyWrongHere)
      && !isTemplateWhyWrongHere(fromGold.whatItDoes)
      && !isGenericStructuredFeedback(fromGold.whyWrongHere)
      && !isGenericStructuredFeedback(fromGold.whatItDoes)
      && !hasSplicedProse(fromGold)
      && fromGold.explanation
      && !isFallbackExplanation(fromGold.explanation)
    if (goldExplicit) {
      const { whatItDoes, whyWrongHere } = mergeSadeFields(q, choiceIndex, fromGold, { respectExplicitBoth: true })
      return { ...fromGold, whatItDoes, whyWrongHere }
    }
  }

  const fromRegen = regenIncorrectFor(q, choiceIndex)
  if (fromRegen) {
    return {
      ...fromRegen,
      explanation: fromGold?.explanation || fromRegen.explanation,
      misconceptionTested: fromGold?.misconceptionTested || fromRegen.misconceptionTested,
    }
  }

  const fromBank = bankIncorrectFor(q, choiceIndex)
  if (fromBank) {
    return {
      ...fromBank,
      explanation: fromGold?.explanation || fromBank.explanation,
      misconceptionTested: fromGold?.misconceptionTested || fromBank.misconceptionTested,
    }
  }

  const rebuilt = buildWrongChoiceItem(q, choiceIndex)
  if (fromGold?.explanation && !isFallbackExplanation(fromGold.explanation)) {
    return {
      ...rebuilt,
      explanation: fromGold.explanation,
      misconceptionTested: fromGold.misconceptionTested || rebuilt.misconceptionTested,
    }
  }
  return rebuilt
}

/** Choice-specific misconception trap labels. */
export function inferTrapForChoice(q, choiceIndex) {
  const wrong = wrongChoice(q, choiceIndex)
  const { blob, correctLower } = ctx(q)

  const fromLib = resolveTrapLabel(q, choiceIndex)
  if (fromLib) return fromLib

  if (/both/.test(wrong.toLowerCase()) || (/source/.test(wrong.toLowerCase()) && /destination/.test(wrong.toLowerCase()))) {
    return 'Assuming both MAC addresses are learned into the CAM table'
  }
  if (/destination/.test(wrong.toLowerCase()) && !/source/.test(wrong.toLowerCase())) {
    return 'Confusing source MAC (learning) with destination MAC (forwarding lookup)'
  }
  if (/ip address|only ip|neither/.test(wrong.toLowerCase()) && /mac|layer 2|frame|switch/i.test(blob)) {
    return 'Applying Layer 3 (IP) behavior to a Layer 2 switch process'
  }
  if (/routing table/.test(wrong.toLowerCase()) && /mac|cam|switch|frame/i.test(blob)) {
    return 'Using router behavior (routing table) on a switch question'
  }
  if (/mac address table|cam/.test(wrong.toLowerCase()) && /routing|router|ip route|layer 3/i.test(blob)) {
    return 'Using switch/L2 forwarding behavior on a router question'
  }
  if (/flood|broadcast|all ports/i.test(wrong.toLowerCase()) && /forward|mapped port|unicast/i.test(correctLower)) {
    return 'Choosing flood behavior when the destination is already in the MAC table'
  }
  if (/drop|discard/i.test(wrong.toLowerCase()) && /forward|flood/i.test(correctLower)) {
    return 'Choosing drop when the switch should forward or flood'
  }

  const CONCEPT_TRAPS = {
    nat: 'Confusing inside local, inside global, and outside addresses',
    pat: 'Mixing up PAT/overload with static or dynamic NAT',
    dhcp: 'Confusing DHCP server, relay agent, and client roles',
    dns: 'Reversing forward vs reverse DNS lookup',
    snmp: 'Mixing SNMP versions or trap vs inform behavior',
    syslog: 'Misreading syslog severity (lower number = more severe)',
    ntp: 'Confusing NTP stratum direction or client/server role',
    ospf: 'OSPF neighbor requirements or DR/BDR election rules',
    static: 'Static route next-hop vs exit-interface behavior',
    acl: 'Standard vs extended ACL placement or wildcard masks',
    'mac learning': 'Confusing how switches learn source MACs vs use destination MACs',
    stp: 'Confusing STP port roles (root, designated, blocked)',
    vlan: 'Confusing VLAN tagging, trunking, and access ports',
  }
  const concept = (q.concept || '').toLowerCase()
  for (const [key, trap] of Object.entries(CONCEPT_TRAPS)) {
    if (concept.includes(key)) return trap
  }

  const anchored = resolveStemAnchored(wrong, q, choiceIndex)
  return anchored.trap
}

/** Build structured wrong-choice review with SADE fields when available. */
export function buildWrongChoiceItem(q, choiceIndex) {
  const wrong = wrongChoice(q, choiceIndex)
  const correct = correctChoiceText(q)
  if (!wrong) {
    return { choiceIndex, explanation: 'This option does not fit the scenario.', misconceptionTested: '' }
  }
  if (wrong === correct) {
    const dupIndices = (q.choices || []).map((c, i) => (c === correct ? i : -1)).filter(i => i >= 0)
    if (dupIndices.length > 1 && choiceIndex !== q.correctIndex) {
      // No choice letters in this copy — display order is shuffled per render,
      // so a baked-in letter can point at a different option than the learner sees.
      return {
        choiceIndex,
        explanation: `**${wrong}** matches the keyed correct syntax, but only one of the identical options is scored — duplicate identical options are distractors.`,
        misconceptionTested: 'Selecting a duplicate correct-looking option when only one is keyed',
        whatItDoes: `**${wrong}** repeats the same CLI string as the marked correct answer.`,
        whyWrongHere: 'Only one option is scored correct when two show the same command — this duplicate is not the keyed one.',
      }
    }
    return { choiceIndex, explanation: 'This is the correct answer, not a distractor.', misconceptionTested: '' }
  }

  const sade = buildStemAnchoredIncorrect({ q, choiceIndex })
  const resolved = resolveWrongChoice(q, choiceIndex)
  const useResolved = resolved?.explanation && !isFallbackExplanation(resolved.explanation)
  const { whatItDoes, whyWrongHere } = mergeSadeFields(q, choiceIndex)
  return {
    choiceIndex,
    explanation: useResolved ? resolved.explanation : sade.explanation,
    whatItDoes,
    whyWrongHere,
    misconceptionTested: (useResolved ? resolved.trap : sade.misconceptionTested)
      || inferTrapForChoice(q, choiceIndex),
  }
}

/** Build a teachable explanation for one wrong choice. */
export function buildWrongExplanation(q, choiceIndex) {
  return buildWrongChoiceItem(q, choiceIndex).explanation
}
export { isFallbackExplanation, isFallbackExplanation as isGenericWrongExplanation } from './answerReview/answerReviewQuality.js'
export { isTemplateWhyWrongHere } from './answerReview/answerReviewQuality.js'
export {
  scoreAnswerReview,
  validateQuestionAnswerReview,
  tierQuestion,
} from './answerReview/answerReviewQuality.js'

export function generateAnswerReview(q) {
  if (isMultiQuestion(q)) {
    const correctSet = new Set(multiCorrectIndexes(q))
    const firstCorrect = multiCorrectIndexes(q)[0]
    const authored = q.answerReview || {}
    const incorrect = (authored.incorrect || [])
      .filter(item => item && !correctSet.has(item.choiceIndex))
    const missingWrong = q.choices
      .map((_, choiceIndex) => choiceIndex)
      .filter(i => !correctSet.has(i) && !incorrect.some(item => item.choiceIndex === i))
      .map(choiceIndex => ({
        choiceIndex,
        explanation: `This option is not part of the correct set.`,
        misconceptionTested: 'Selecting an incomplete or incorrect combination on a select-all question',
      }))
    return {
      correct: {
        choiceIndex: firstCorrect,
        explanation: authored.correct?.explanation || (q.explanation || '').trim()
          || `Correct selections: ${multiCorrectIndexes(q).map(i => String.fromCharCode(65 + i)).join(', ')}.`,
      },
      correctChoices: authored.correctChoices || multiCorrectIndexes(q).map(choiceIndex => ({
        choiceIndex,
        explanation: authored.correct?.explanation || q.explanation || '',
      })),
      incorrect: [...incorrect, ...missingWrong],
      examTip: authored.examTip && !isGenericExamTip(authored.examTip) ? authored.examTip : examTipFor(q),
      ...(authored.memoryHook ? { memoryHook: authored.memoryHook } : {}),
    }
  }

  if (!Array.isArray(q.choices) || typeof q.correctIndex !== 'number') return null

  const gold = goldAnswerReviewFor(q.id)
  if (gold) {
    const examTip = gold.examTip && !isGenericExamTip(gold.examTip) ? gold.examTip : examTipFor(q)
    const goldByChoice = new Map((gold.incorrect || []).map(item => [item.choiceIndex, item]))
    const goldCorrect = gold.correct?.choiceIndex === q.correctIndex ? gold.correct : null
    const correctExpl = goldCorrect?.explanation
      || (gold.correct?.explanation && gold.correct?.choiceIndex !== q.correctIndex
        ? gold.correct.explanation
        : null)
      || (q.explanation || '').trim()
      || `The correct answer is "${q.choices[q.correctIndex]}".`

    const incorrect = q.choices
      .map((_, choiceIndex) => {
        if (choiceIndex === q.correctIndex) return null
        const fromGold = goldByChoice.get(choiceIndex)
        return resolveWrongChoiceForReview(q, choiceIndex, { fromGold })
      })
      .filter(Boolean)

    return {
      ...gold,
      correct: { choiceIndex: q.correctIndex, explanation: correctExpl },
      examTip,
      incorrect: ensureDistinctExplanations(q, incorrect),
    }
  }

  const correctExpl = (q.explanation || '').trim()
    || `The correct answer is "${q.choices[q.correctIndex]}".`

  const needsReview = !q.explanation?.trim() || q.needsExplanationReview

  const incorrect = q.choices
    .map((_, choiceIndex) => {
      if (choiceIndex === q.correctIndex) return null
      const item = resolveWrongChoiceForReview(q, choiceIndex)
      return {
        ...item,
        ...(needsReview ? { needsExplanationReview: true } : {}),
      }
    })
    .filter(Boolean)

  const distinct = ensureDistinctExplanations(q, incorrect)

  return {
    correct: { choiceIndex: q.correctIndex, explanation: correctExpl },
    incorrect: distinct,
    examTip: examTipFor(q),
    ...(q.concept?.includes('pat') || q.concept?.includes('overload')
      ? { memoryHook: 'PAT = many tenants, one door — ports are the apartment numbers.' }
      : {}),
  }
}

/** Prefer stored review unless low quality; then rebuild. */
export function resolveIncorrectItem(q, item) {
  const stored = item?.explanation
  const storedTrap = item?.misconceptionTested
  const { whatItDoes, whyWrongHere } = mergeSadeFields(q, item.choiceIndex, item)
  const lowQuality = !stored
    || isFallbackExplanation(stored)
    || isTemplateWhyWrongHere(item?.whyWrongHere)
  if (!lowQuality) {
    return {
      choiceIndex: item.choiceIndex,
      explanation: stored,
      whatItDoes,
      whyWrongHere,
      misconceptionTested: isGenericTrap(storedTrap)
        ? inferTrapForChoice(q, item.choiceIndex)
        : storedTrap,
      needsExplanationReview: item.needsExplanationReview,
      genericDebrief: isTemplateWhyWrongHere(whyWrongHere) || isGenericStructuredFeedback(whyWrongHere),
    }
  }
  const rebuilt = buildWrongChoiceItem(q, item.choiceIndex)
  return {
    choiceIndex: item.choiceIndex,
    explanation: rebuilt.explanation,
    whatItDoes: rebuilt.whatItDoes,
    whyWrongHere: rebuilt.whyWrongHere,
    misconceptionTested: rebuilt.misconceptionTested || inferTrapForChoice(q, item.choiceIndex),
    genericDebrief: isTemplateWhyWrongHere(rebuilt.whyWrongHere),
  }
}

export function applyAnswerReviewToQuestion(q) {
  const answerReview = generateAnswerReview(q)
  if (!answerReview) return q
  const polished = {
    ...answerReview,
    correct: answerReview.correct
      ? { ...answerReview.correct, explanation: sanitizeAnswerText(answerReview.correct.explanation) }
      : answerReview.correct,
    examTip: sanitizeAnswerText(answerReview.examTip),
    incorrect: (answerReview.incorrect || []).map(item => ({
      ...item,
      explanation: sanitizeAnswerText(item.explanation),
      ...(item.whatItDoes ? { whatItDoes: sanitizeAnswerText(item.whatItDoes) } : {}),
      ...(item.whyWrongHere ? { whyWrongHere: sanitizeAnswerText(item.whyWrongHere) } : {}),
    })),
    ...(answerReview.correctChoices?.length
      ? {
          correctChoices: answerReview.correctChoices.map(item => ({
            ...item,
            explanation: sanitizeAnswerText(item.explanation),
          })),
        }
      : {}),
  }
  const next = { ...q, answerReview: polished, explanation: sanitizeAnswerText(q.explanation) }
  delete next.needsExplanationReview
  return next
}
