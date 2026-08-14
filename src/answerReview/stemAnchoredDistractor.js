/**
 * Stem-Anchored Distractor Engine (SADE) — choice-specific wrong-answer reviews
 * anchored to stem hooks, correct answer contrast, and distractor text.
 */
import { correctChoiceText } from '../questionUtils.js'

const STOP_WORDS = new Set([
  'which', 'what', 'when', 'where', 'that', 'this', 'with', 'from', 'does', 'have',
  'been', 'will', 'would', 'should', 'could', 'they', 'their', 'there', 'than', 'then',
  'into', 'also', 'most', 'likely', 'following', 'correct', 'answer', 'question',
  'scenario', 'best', 'select', 'choose', 'given', 'based', 'about', 'after', 'before',
  'during', 'each', 'other', 'only', 'same', 'such', 'these', 'those', 'using', 'used',
])

const TECH_PATTERNS = [
  /\b(?:802\.11[a-z0-9-]*)\b/gi,
  /\b(?:ospf|eigrp|rip|bgp|dhcp|dns|nat|pat|stp|vlan|svi|acl|snmp|ntp|syslog|tcp|udp|icmp|arp|mac|cam|wpa2|wpa3|ssh|telnet)\b/gi,
  /\blayer\s*[123]\b/gi,
  /\b(?:source|destination)\s+mac\b/gi,
  /\b(?:routing|mac address|forwarding|flooding|trunk|access)\s+table\b/gi,
  /\b(?:default gateway|inter-vlan|unknown unicast|designated router)\b/gi,
  /\b(?:inside local|inside global|outside local|outside global)\b/gi,
]

export function normalize(text) {
  return String(text || '').replace(/\*\*/g, '').trim()
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w))
}

function pickStemPhrase(question) {
  const q = String(question || '')
  const quoted = q.match(/"([^"]{4,60})"|'([^']{4,60})'/)
  if (quoted) return (quoted[1] || quoted[2]).trim()
  const clause = q.match(/(?:when|if|after|because|whose|where)\s+([^?.!]{8,80})/i)
  if (clause) return clause[1].trim().replace(/\s+/g, ' ')
  return ''
}

/** Extract keywords/phrases that anchor explanations to this question. */
export function extractStemHooks(question, explanation, concept) {
  const hooks = new Set()
  const add = (value) => {
    const v = String(value || '').replace(/\*\*/g, '').trim()
    if (!v || v.length < 3) return
    hooks.add(v)
  }

  if (concept) add(concept)

  const expl = String(explanation || '').trim()
  if (expl) {
    add(expl.split(/[.!?]/).filter(Boolean)[0]?.trim())
    for (const m of expl.matchAll(/\*\*([^*]+)\*\*/g)) add(m[1])
  }

  const stemPhrase = pickStemPhrase(question)
  if (stemPhrase) add(stemPhrase)

  for (const re of TECH_PATTERNS) {
    re.lastIndex = 0
    for (const m of String(question || '').matchAll(re)) add(m[0])
    re.lastIndex = 0
    for (const m of expl.matchAll(re)) add(m[0])
  }

  for (const w of tokenize(`${question} ${expl}`)) {
    if (w.length >= 5) add(w)
  }

  return [...hooks].slice(0, 8)
}

export function hookPhrase(hooks, fallback) {
  if (!hooks.length) return fallback
  const preferred = hooks.find(h => h.length >= 8 && h.length <= 72)
  return preferred || hooks[0] || fallback
}

export function isStpPortStateSequence(text) {
  const t = String(text || '')
  return /discarding|blocking|listening|learning|forwarding/i.test(t) && /,/.test(t)
}

export function mentionsBothMacAddresses(text) {
  const w = String(text || '').toLowerCase()
  if (/\bboth sides\b/i.test(w)) return false
  return /\bboth\b/.test(w) || (/source/.test(w) && /destination/.test(w))
}

export function impliesDropOrDiscard(text) {
  const w = String(text || '')
  if (isStpPortStateSequence(w)) return false
  return /drop|discard/i.test(w)
}


function inferMisconception({ wrong, correct, hooks, blob }) {
  const w = wrong.toLowerCase()
  const c = correct.toLowerCase()

  if (impliesDropOrDiscard(w) && /flood/i.test(c)) return 'Assuming unknown destination means drop/filter'
  if (/back to the source|echo/i.test(w)) return 'Confusing switch behavior with ping/reply thinking'
  if (/default gateway/i.test(w)) return 'Applying default-gateway logic to a Layer 2 switch decision'
  if (/destination/.test(w) && !/source/.test(w) && /source|learn/i.test(blob)) {
    return 'Confusing source MAC (learning) with destination MAC (forwarding lookup)'
  }
  if (mentionsBothMacAddresses(w)) {
    return 'Assuming both MAC addresses are learned into the CAM table'
  }
  if (/ip address|only ip|neither/i.test(w) && /mac|layer 2|frame|switch/i.test(blob)) {
    return 'Applying Layer 3 (IP) behavior to a Layer 2 switch process'
  }
  if (/routing table/i.test(w) && /mac|cam|switch|frame/i.test(blob)) {
    return 'Using router behavior (routing table) on a switch question'
  }
  if (/mac address table|cam/i.test(w) && /routing|router|layer 3/i.test(blob)) {
    return 'Using switch/L2 forwarding behavior on a router question'
  }
  if (/flood|all ports/i.test(w) && /forward|mapped|unicast/i.test(c)) {
    return 'Choosing flood behavior when the destination is already in the MAC table'
  }

  const hook = hooks[0] || 'the stem constraint'
  return `Applying "${normalize(wrong).slice(0, 36)}" without matching ${hook}`
}


/** Build structured stem-anchored review for one wrong choice. */
/**
 * Choice text used inside a generated sentence. Trailing sentence punctuation
 * is stripped because every template continues the clause after it — without
 * this, an authored choice ending in a period splices two sentences together.
 */
function clause(text) {
  return normalize(text).replace(/[.!?;:,]+$/, '')
}

/**
 * The hundreds of topic-specific templates in contrastWithCorrect/
 * buildWhatItDoes account for the large majority of this module's size, so
 * they live in a lazily-loaded sibling (stemAnchoredTemplates.js) instead of
 * the eager bundle. cleanQuestionAdapter.preloadCleanBank() awaits this
 * alongside the question bank and gold reviews, so by the time a learner can
 * reach a question, the templates are already resident — this fallback path
 * exists only for the (should-be-unreachable) case of a caller that renders
 * before that preload resolves, e.g. a script that forgot to await it.
 */
let templatesModule = null
let templatesLoadPromise = null

export function loadStemAnchoredTemplates() {
  if (templatesModule) return Promise.resolve(templatesModule)
  if (!templatesLoadPromise) {
    templatesLoadPromise = import('./stemAnchoredTemplates.js')
      .then((mod) => {
        templatesModule = mod
        return mod
      })
      .catch((err) => {
        templatesLoadPromise = null
        throw err
      })
  }
  return templatesLoadPromise
}

export function isStemAnchoredTemplatesLoaded() {
  return templatesModule !== null
}

/** Test seam — lets suites install the templates synchronously. */
export function setStemAnchoredTemplatesModule(mod) {
  templatesModule = mod
  templatesLoadPromise = mod ? Promise.resolve(mod) : null
}

function fallbackWhatItDoes(choice, hook) {
  return `**${choice}** points to a related idea, but not the specific behavior or value required for ${hook}.`
}

function fallbackContrastWithCorrect(wrong, correct, hook) {
  return `**${correct}** is the keyed result for ${hook}. **${wrong}** would produce a different result.`
}

export function buildStemAnchoredIncorrect({ q, choiceIndex }) {
  const wrong = clause(q.choices?.[choiceIndex] || '')
  const correct = clause(correctChoiceText(q))
  const fact = (q.explanation || '').trim()
  const hooks = extractStemHooks(q.question, q.explanation, q.concept)
  const blob = `${q.question || ''} ${q.concept || ''} ${fact} ${correct}`.toLowerCase()

  if (!wrong || wrong === correct) {
    return {
      whatItDoes: '',
      whyWrongHere: '',
      misconceptionTested: '',
      explanation: wrong === correct ? 'This is the correct answer, not a distractor.' : 'This option does not fit the scenario.',
    }
  }

  const hook = hookPhrase(hooks, 'the scenario constraint')
  const whatItDoes = templatesModule
    ? templatesModule.buildWhatItDoes(wrong, hooks, blob)
    : fallbackWhatItDoes(wrong, hook)
  const whyWrongHere = templatesModule
    ? templatesModule.contrastWithCorrect({ wrong, correct, hooks, fact, blob })
    : fallbackContrastWithCorrect(wrong, correct, hook)
  const misconceptionTested = inferMisconception({ wrong, correct, hooks, blob })
  const explanation = `${whatItDoes} ${whyWrongHere}`.trim()

  return { whatItDoes, whyWrongHere, misconceptionTested, explanation }
}

/** Score how well an item anchors to stem hooks (0–6). */
export function stemAnchorScore(q, item) {
  const hooks = extractStemHooks(q.question, q.explanation, q.concept)
  if (!hooks.length) return item?.whatItDoes && item?.whyWrongHere ? 3 : 1

  const text = [item?.whatItDoes, item?.whyWrongHere, item?.explanation]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  let matched = 0
  for (const hook of hooks) {
    const h = hook.toLowerCase()
    if (h.length >= 4 && text.includes(h.slice(0, Math.min(h.length, 12)))) matched++
  }

  let score = Math.min(4, matched)
  if (item?.whatItDoes && item?.whyWrongHere) score += 2
  return Math.min(6, score)
}
