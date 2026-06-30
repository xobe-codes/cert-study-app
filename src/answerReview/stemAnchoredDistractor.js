/**
 * Stem-Anchored Distractor Engine (SADE) — choice-specific wrong-answer reviews
 * anchored to stem hooks, correct answer contrast, and distractor text.
 */

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

function normalize(text) {
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

function hookPhrase(hooks, fallback) {
  if (!hooks.length) return fallback
  const preferred = hooks.find(h => h.length >= 8 && h.length <= 72)
  return preferred || hooks[0] || fallback
}

function isStpPortStateSequence(text) {
  const t = String(text || '')
  return /discarding|blocking|listening|learning|forwarding/i.test(t) && /,/.test(t)
}

function mentionsBothMacAddresses(text) {
  const w = String(text || '').toLowerCase()
  if (/\bboth sides\b/i.test(w)) return false
  return /\bboth\b/.test(w) || (/source/.test(w) && /destination/.test(w))
}

function impliesDropOrDiscard(text) {
  const w = String(text || '')
  if (isStpPortStateSequence(w)) return false
  return /drop|discard/i.test(w)
}

function contrastWithCorrect({ wrong, correct, hooks, fact }) {
  const hook = hookPhrase(hooks, fact.split(/[.!?]/)[0]?.trim() || 'the scenario constraint')
  const w = wrong.toLowerCase()
  const c = correct.toLowerCase()

  if (impliesDropOrDiscard(w) && /flood|forward/i.test(c)) {
    return `In this stem (${hook}), the switch should **${correct}** — not discard traffic for unknown or normal unicast handling.`
  }
  if (/flood|broadcast|all ports/i.test(w) && /forward|mapped|only the|single port/i.test(c)) {
    return `Here (${hook}), the destination is handled with **${correct}** because flooding is for unknown destinations, not known mapped MACs.`
  }
  if (/default gateway|router only/i.test(w) && /switch|flood|mac|frame|vlan/i.test(hook.toLowerCase())) {
    return `This stem tests Layer 2 behavior (${hook}). **${correct}** applies locally — default-gateway forwarding is for inter-subnet routing, not this decision.`
  }
  if (/destination/.test(w) && !/source/.test(w) && /source|learn/i.test(c + ' ' + hook.toLowerCase())) {
    return `The stem asks what gets **learned** (${hook}). Switches record the **source MAC** on ingress — destination MAC is for lookup, not learning.`
  }
  if (mentionsBothMacAddresses(w)) {
    return `CAM learning stores one mapping per arrival (${hook}): **${correct}** — not both addresses as table entries.`
  }
  if (/ip address|only ip|neither|layer 3/i.test(w) && /mac|frame|switch|layer 2/i.test(hook.toLowerCase())) {
    return `This is a Layer 2 process (${hook}). **${correct}** uses Ethernet addresses — not IP headers.`
  }
  if (/routing table/i.test(w) && /mac|cam|switch|frame/i.test(hook.toLowerCase())) {
    return `Routers use routing tables; this stem is about switch forwarding (${hook}). **${correct}** is the right table/process here.`
  }
  if (/mac address table|cam/i.test(w) && /routing|router|ip route|layer 3/i.test(hook.toLowerCase())) {
    return `The stem targets router behavior (${hook}). **${correct}** uses IP routing — not a switch CAM table.`
  }
  if (isStpPortStateSequence(w)) {
    return `For this RSTP/STP scenario (${hook}), the valid transition order is **${correct}** — **${wrong}** inserts blocking/listening states or wrong ordering.`
  }

  return `Given ${hook}, **${correct}** matches the tested behavior — **${wrong}** applies a different mechanism.`
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

function buildWhatItDoes(wrong, hooks) {
  const choice = normalize(wrong)
  const w = choice.toLowerCase()
  const hook = hookPhrase(hooks, 'this scenario')

  if (impliesDropOrDiscard(w)) {
    return `**${choice}** implies the device should discard the frame instead of forwarding or flooding it.`
  }
  if (isStpPortStateSequence(choice)) {
    return `**${choice}** lists an RSTP/STP port-state transition order that does not match the default sequence tested here.`
  }
  if (/flood|all ports|broadcast/i.test(w)) {
    return `**${choice}** describes flooding the frame to multiple ports in the VLAN.`
  }
  if (/default gateway/i.test(w)) {
    return `**${choice}** sends the decision to a router/default gateway rather than handling it at Layer 2.`
  }
  if (/destination mac/i.test(w)) {
    return `**${choice}** treats the destination MAC as the address recorded during learning.`
  }
  if (/both source and destination|both.*mac/i.test(w)) {
    return `**${choice}** claims the switch learns both source and destination MACs into the CAM table.`
  }
  if (/ip address|only ip|neither/i.test(w)) {
    return `**${choice}** shifts the answer to IP/Layer 3 addressing instead of Ethernet MAC learning.`
  }
  if (/routing table/i.test(w)) {
    return `**${choice}** relies on a router routing table rather than switch MAC/CAM forwarding.`
  }
  if (/mac address table|cam table/i.test(w)) {
    return `**${choice}** expects router forwarding to use a MAC/CAM table lookup.`
  }
  if (/^true$|^false$/i.test(w.trim())) {
    return `**${choice}** states the opposite of the tested fact about ${hookPhrase(hooks, 'this topic')}.`
  }

  return `**${choice}** describes a mechanism that could sound plausible for ${hookPhrase(hooks, 'similar topics')}.`
}

/** Build structured stem-anchored review for one wrong choice. */
export function buildStemAnchoredIncorrect({ q, choiceIndex }) {
  const wrong = q.choices?.[choiceIndex] || ''
  const correct = q.choices?.[q.correctIndex] || ''
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

  const whatItDoes = buildWhatItDoes(wrong, hooks)
  const whyWrongHere = contrastWithCorrect({ wrong, correct, hooks, fact })
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
