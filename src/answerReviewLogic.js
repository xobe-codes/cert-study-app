/**
 * Choice-specific wrong-answer explanations (static, no API).
 * Used at build time and runtime when stored reviews are low quality.
 */
import {
  isFallbackExplanation,
  isGenericTrap,
} from './answerReview/answerReviewQuality.js'
import {
  resolveWrongChoice,
  resolveTrapLabel,
  resolveStemAnchored,
} from './answerReview/ckuTrapLibrary.js'
import { buildStemAnchoredIncorrect } from './answerReview/stemAnchoredDistractor.js'
import { goldAnswerReviewFor } from './answerReview/goldAnswerReviews.js'
import { examTipFor, isGenericExamTip } from './answerReview/examTipLogic.js'
import { sanitizeAnswerText } from './lib/voiceProse.js'

export { examTipFor, isGenericExamTip } from './answerReview/examTipLogic.js'

function ctx(q) {
  const question = (q.question || '').toLowerCase()
  const concept = (q.concept || '').toLowerCase()
  const expl = (q.explanation || '').toLowerCase()
  const correct = q.choices?.[q.correctIndex] || ''
  const correctLower = correct.toLowerCase()
  return { question, concept, expl, correct, correctLower, blob: `${question} ${concept} ${expl} ${correctLower}` }
}

function wrongChoice(q, choiceIndex) {
  return q.choices?.[choiceIndex] || ''
}

function ensureDistinctExplanations(q, incorrect) {
  const usedExpl = new Map()
  const usedWhy = new Map()
  return incorrect.map(item => {
    let { explanation, misconceptionTested, whatItDoes, whyWrongHere } = item
    const regen = () => buildStemAnchoredIncorrect({ q, choiceIndex: item.choiceIndex })
    if (usedExpl.has(explanation)) {
      const sade = regen()
      explanation = sade.explanation
      whatItDoes = sade.whatItDoes
      whyWrongHere = sade.whyWrongHere
      misconceptionTested = sade.misconceptionTested || inferTrapForChoice(q, item.choiceIndex)
    }
    if (whyWrongHere && usedWhy.has(whyWrongHere)) {
      const wrong = q.choices?.[item.choiceIndex] || ''
      whyWrongHere = `${whyWrongHere} Picking **${wrong}** misses the exact behavior this stem tests.`
    }
    usedExpl.set(explanation, item.choiceIndex)
    if (whyWrongHere) usedWhy.set(whyWrongHere, item.choiceIndex)
    return { ...item, explanation, misconceptionTested, whatItDoes, whyWrongHere }
  })
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
  const correct = q.choices?.[q.correctIndex] || ''
  if (!wrong) {
    return { choiceIndex, explanation: 'This option does not fit the scenario.', misconceptionTested: '' }
  }
  if (wrong === correct) {
    const dupIndices = (q.choices || []).map((c, i) => (c === correct ? i : -1)).filter(i => i >= 0)
    if (dupIndices.length > 1 && choiceIndex !== q.correctIndex) {
      const letter = String.fromCharCode(65 + q.correctIndex)
      return {
        choiceIndex,
        explanation: `**${wrong}** matches the keyed correct syntax, but the scored answer is choice ${letter} — duplicate identical options are distractors.`,
        misconceptionTested: 'Selecting a duplicate correct-looking option when only one letter is keyed',
        whatItDoes: `**${wrong}** repeats the same CLI string as the marked correct answer.`,
        whyWrongHere: `Only choice ${letter} is scored correct when two options show the same command — match the keyed letter, not the duplicate line.`,
      }
    }
    return { choiceIndex, explanation: 'This is the correct answer, not a distractor.', misconceptionTested: '' }
  }

  const sade = buildStemAnchoredIncorrect({ q, choiceIndex })
  const resolved = resolveWrongChoice(q, choiceIndex)
  const useResolved = resolved?.explanation && !isFallbackExplanation(resolved.explanation)
  return {
    choiceIndex,
    explanation: useResolved ? resolved.explanation : sade.explanation,
    whatItDoes: sade.whatItDoes,
    whyWrongHere: sade.whyWrongHere,
    misconceptionTested: (useResolved ? resolved.trap : sade.misconceptionTested)
      || inferTrapForChoice(q, choiceIndex),
  }
}

/** Build a teachable explanation for one wrong choice. */
export function buildWrongExplanation(q, choiceIndex) {
  return buildWrongChoiceItem(q, choiceIndex).explanation
}
export { isFallbackExplanation, isFallbackExplanation as isGenericWrongExplanation } from './answerReview/answerReviewQuality.js'
export {
  scoreAnswerReview,
  validateQuestionAnswerReview,
  tierQuestion,
} from './answerReview/answerReviewQuality.js'

export function generateAnswerReview(q) {
  if (!Array.isArray(q.choices) || typeof q.correctIndex !== 'number') return null

  const gold = goldAnswerReviewFor(q.id)
  if (gold) {
    const examTip = gold.examTip && !isGenericExamTip(gold.examTip) ? gold.examTip : examTipFor(q)
    const incorrect = (gold.incorrect || []).map(item => {
      const sade = buildStemAnchoredIncorrect({ q, choiceIndex: item.choiceIndex })
      return {
        ...item,
        whatItDoes: item.whatItDoes || sade.whatItDoes,
        whyWrongHere: item.whyWrongHere || sade.whyWrongHere,
      }
    })
    return { ...gold, examTip, incorrect: ensureDistinctExplanations(q, incorrect) }
  }

  const correctExpl = (q.explanation || '').trim()
    || `The correct answer is "${q.choices[q.correctIndex]}".`

  const needsReview = !q.explanation?.trim() || q.needsExplanationReview

  const incorrect = q.choices
    .map((_, choiceIndex) => {
      if (choiceIndex === q.correctIndex) return null
      const item = buildWrongChoiceItem(q, choiceIndex)
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
  const lowQuality = !stored || isFallbackExplanation(stored)
  if (!lowQuality) {
    return {
      choiceIndex: item.choiceIndex,
      explanation: stored,
      whatItDoes: item.whatItDoes,
      whyWrongHere: item.whyWrongHere,
      misconceptionTested: isGenericTrap(storedTrap)
        ? inferTrapForChoice(q, item.choiceIndex)
        : storedTrap,
      needsExplanationReview: item.needsExplanationReview,
    }
  }
  const rebuilt = buildWrongChoiceItem(q, item.choiceIndex)
  return {
    choiceIndex: item.choiceIndex,
    explanation: rebuilt.explanation,
    whatItDoes: rebuilt.whatItDoes,
    whyWrongHere: rebuilt.whyWrongHere,
    misconceptionTested: rebuilt.misconceptionTested || inferTrapForChoice(q, item.choiceIndex),
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
  }
  const next = { ...q, answerReview: polished, explanation: sanitizeAnswerText(q.explanation) }
  delete next.needsExplanationReview
  return next
}
