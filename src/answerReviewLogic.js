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
import { goldAnswerReviewFor } from './answerReview/goldAnswerReviews.js'
import { examTipFor, isGenericExamTip } from './answerReview/examTipLogic.js'

export { examTipFor, isGenericExamTip } from './answerReview/examTipLogic.js'

function firstSentence(text) {
  const t = String(text || '').trim()
  if (!t) return ''
  const m = t.match(/^[^.!?]+[.!?]?/)
  return m ? m[0].trim() : t.slice(0, 140)
}

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
  const used = new Map()
  return incorrect.map(item => {
    let { explanation, misconceptionTested } = item
    if (used.has(explanation)) {
      const wrong = wrongChoice(q, item.choiceIndex)
      const fact = (q.explanation || '').split(/[.!?]/)[0]?.trim()
      explanation = `**${wrong}** is not the behavior described here. ${fact}.`
      misconceptionTested = inferTrapForChoice(q, item.choiceIndex)
    }
    used.set(explanation, item.choiceIndex)
    return { ...item, explanation, misconceptionTested }
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

  const anchored = resolveStemAnchored(wrong, q)
  return anchored.trap
}

/** Build a teachable explanation for one wrong choice. */
export function buildWrongExplanation(q, choiceIndex) {
  const wrong = wrongChoice(q, choiceIndex)
  const correct = q.choices?.[q.correctIndex] || ''
  const correctExpl = (q.explanation || '').trim() || `The correct answer is "${correct}".`
  if (!wrong) return 'This option does not fit the scenario.'
  if (wrong === correct) return 'This is the correct answer, not a distractor.'

  const resolved = resolveWrongChoice(q, choiceIndex)
  if (resolved?.explanation) return resolved.explanation

  const w = wrong.toLowerCase()
  const { blob, correctLower, question, expl } = ctx(q)

  // --- MAC learning ---
  if (/mac|cam|learn|source mac|destination mac/i.test(blob)) {
    if (/destination/.test(w) && !/source/.test(w)) {
      return 'Switches learn from the **source** MAC on the ingress port. The destination MAC is used later to look up where to forward the frame — it is not what gets recorded during learning.'
    }
    if (/both/.test(w) || (/source/.test(w) && /destination/.test(w))) {
      return 'The CAM table stores **source** MAC-to-port mappings. Destination MACs are not learned as table entries on arrival.'
    }
    if (/ip address|only ip|neither|layer 3/i.test(w)) {
      return 'MAC learning is a **Layer 2** process. Switches read Ethernet frame addresses, not IP headers, when populating the MAC address table.'
    }
  }

  // --- Switch forwarding ---
  if (/switch|frame|flood|forward|mac address table/i.test(blob)) {
    if (/flood|all ports/i.test(w) && /forward|mapped|unicast|only the/i.test(correctLower)) {
      return 'Flooding happens for **unknown** unicast destinations. When the destination MAC is already mapped in the table, the switch forwards out that port only.'
    }
    if (/broadcast/i.test(w) && /forward|mapped|unicast|only the/i.test(correctLower)) {
      return 'Broadcast frames are flooded by destination, but this stem is about a **known unicast** MAC — the switch forwards out the single mapped port, not a VLAN-wide flood.'
    }
    if (/drop|discard|filter/i.test(w) && /forward|flood/i.test(correctLower)) {
      return 'The switch should **forward** or **flood** the frame — not drop it — when handling normal unknown/known unicast behavior in this scenario.'
    }
    if (/forward/i.test(w) && /flood/i.test(correctLower)) {
      return 'When the destination MAC is **not** in the table, the switch floods — it does not forward to a single known port.'
    }
    if (/same port|filter|does not forward/i.test(correctLower) && /forward|flood|different port/i.test(w)) {
      return 'If source and destination map to the **same ingress port**, the switch filters the frame — there is no need to send it out again.'
    }
  }

  // --- Router vs switch tables ---
  if (/routing table/i.test(w) && /mac|cam|switch|frame|layer 2/i.test(blob)) {
    return '**Routing tables** are for Layer 3 routers. Switches forward frames using a **MAC address (CAM) table**.'
  }
  if (/mac address table|cam table/i.test(w) && /routing|router|ip route|default gateway|layer 3/i.test(blob)) {
    return 'Routers forward packets using a **routing table** and IP prefixes, not a switch MAC/CAM table.'
  }

  // --- Layer pickers ---
  const layerWrong = w.match(/layer\s*([127])/i)
  if (layerWrong) {
    const n = layerWrong[1]
    if (/layer\s*3|router|ip address|routing/i.test(blob) && n !== '3') {
      return `**${wrong}** is the wrong OSI layer here. The stem tests **Layer 3** behavior — routers forward based on IP addresses and routing tables.`
    }
    if (/layer\s*2|switch|mac|frame|ethernet/i.test(blob) && !/layer\s*3|router/i.test(blob) && n !== '2') {
      return `**${wrong}** is the wrong OSI layer here. The stem tests **Layer 2** behavior — switches forward frames using MAC addresses.`
    }
  }

  // --- True / False ---
  if ((q.choices?.length === 2) && (/^true$/i.test(w.trim()) || /^false$/i.test(w.trim()))) {
    const fact = firstSentence(correctExpl)
    return `This statement is **${wrong.trim()}**, but the tested fact is: ${fact}`
  }

  // --- Troubleshooting scenarios ---
  if (question.includes('troubleshoot') || q.type === 'troubleshooting') {
    return `**${wrong}** is a plausible symptom fix but does not match the most likely root cause here: ${firstSentence(correctExpl)}`
  }

  return resolveStemAnchored(wrong, q).explanation
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
    return { ...gold, examTip }
  }

  const correctExpl = (q.explanation || '').trim()
    || `The correct answer is "${q.choices[q.correctIndex]}".`

  const needsReview = !q.explanation?.trim() || q.needsExplanationReview

  const incorrect = q.choices
    .map((_, choiceIndex) => {
      if (choiceIndex === q.correctIndex) return null
      return {
        choiceIndex,
        explanation: buildWrongExplanation(q, choiceIndex),
        misconceptionTested: inferTrapForChoice(q, choiceIndex),
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
      misconceptionTested: isGenericTrap(storedTrap)
        ? inferTrapForChoice(q, item.choiceIndex)
        : storedTrap,
      needsExplanationReview: item.needsExplanationReview,
    }
  }
  return {
    choiceIndex: item.choiceIndex,
    explanation: buildWrongExplanation(q, item.choiceIndex),
    misconceptionTested: inferTrapForChoice(q, item.choiceIndex),
  }
}

export function applyAnswerReviewToQuestion(q) {
  const answerReview = generateAnswerReview(q)
  if (!answerReview) return q
  const next = { ...q, answerReview }
  delete next.needsExplanationReview
  return next
}
