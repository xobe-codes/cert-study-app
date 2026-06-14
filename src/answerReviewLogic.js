/**
 * Choice-specific wrong-answer explanations (static, no API).
 * Used at build time and runtime when stored reviews are generic.
 */

const GENERIC_WRONG_RE = /is incorrect because the scenario requires:/i

export function isGenericWrongExplanation(text) {
  return !text || GENERIC_WRONG_RE.test(text)
}

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

/** Choice-specific misconception trap labels. */
export function inferTrapForChoice(q, choiceIndex) {
  const wrong = wrongChoice(q, choiceIndex).toLowerCase()
  const { blob, correctLower } = ctx(q)

  if (/both/.test(wrong) || (/source/.test(wrong) && /destination/.test(wrong))) {
    return 'Assuming both MAC addresses are learned into the CAM table'
  }
  if (/destination/.test(wrong) && !/source/.test(wrong)) {
    return 'Confusing source MAC (learning) with destination MAC (forwarding lookup)'
  }
  if (/ip address|only ip|neither/.test(wrong) && /mac|layer 2|frame|switch/i.test(blob)) {
    return 'Applying Layer 3 (IP) behavior to a Layer 2 switch process'
  }
  if (/routing table/.test(wrong) && /mac|cam|switch|frame/i.test(blob)) {
    return 'Using router behavior (routing table) on a switch question'
  }
  if (/mac address table|cam/.test(wrong) && /routing|router|ip route|layer 3/i.test(blob)) {
    return 'Using switch/L2 forwarding behavior on a router question'
  }
  if (/dns/.test(wrong) && !/dns/i.test(correctLower)) {
    return 'Dragging DNS into a question about a different service or layer'
  }
  if (/acl|access.?list/.test(wrong) && !/acl|access/i.test(correctLower + blob)) {
    return 'Defaulting to ACLs when the stem tests something else'
  }
  if (/spanning tree|stp|etherchannel|port mirroring|vlan/i.test(wrong)) {
    const snippet = correctLower.slice(0, 12).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (snippet && !new RegExp(snippet, 'i').test(blob)) {
      if (!correctLower.includes('vlan') && /vlan/.test(wrong)) return 'Picking VLAN switching when inter-VLAN routing or another feature is required'
    }
  }
  if (/layer\s*1\b/.test(wrong) && /layer\s*3|router|ip /i.test(blob)) return 'Choosing physical layer when the question is about network layer forwarding'
  if (/layer\s*2\b/.test(wrong) && /layer\s*3|router|ip route/i.test(blob)) return 'Choosing data link layer when the question is about network layer routing'
  if (/layer\s*7\b/.test(wrong) && /layer\s*[23]|switch|router|mac|ip /i.test(blob)) return 'Choosing application layer when the question is about L2/L3 mechanics'
  if (/flood|broadcast|all ports/i.test(wrong) && /forward|mapped port|unicast/i.test(correctLower)) {
    return 'Choosing flood behavior when the destination is already in the MAC table'
  }
  if (/drop|discard/i.test(wrong) && /forward/i.test(correctLower)) {
    return 'Choosing drop when the switch should forward to a known port'
  }
  if (/^true$/i.test(wrong.trim()) || /^false$/i.test(wrong.trim())) {
    return 'Flipping the true/false fact without matching the scenario details'
  }
  if (/show |debug |configure |ip route|access-list/i.test(wrong)) {
    return 'Choosing a plausible command that does not solve this specific scenario'
  }

  const concept = (q.concept || '').toLowerCase()
  for (const [key, trap] of Object.entries(CONCEPT_TRAPS)) {
    if (concept.includes(key)) return trap
  }
  return 'Picking a familiar term without matching the exact behavior tested'
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

/** Build a teachable explanation for one wrong choice. */
export function buildWrongExplanation(q, choiceIndex) {
  const wrong = wrongChoice(q, choiceIndex)
  const correct = q.choices?.[q.correctIndex] || ''
  const correctExpl = (q.explanation || '').trim() || `The correct answer is "${correct}".`
  if (!wrong) return 'This option does not fit the scenario.'
  if (wrong === correct) return 'This is the correct answer, not a distractor.'

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

  // --- Switch forwarding (flood vs forward vs filter) ---
  if (/switch|frame|flood|forward|mac address table/i.test(blob)) {
    if (/flood|all ports|broadcast/i.test(w) && /forward|mapped|unicast|only the/i.test(correctLower)) {
      return 'Flooding happens for **unknown** unicast destinations. When the destination MAC is already mapped in the table, the switch forwards out that port only.'
    }
    if (/drop|discard|filter/i.test(w) && /forward/i.test(correctLower)) {
      return 'The switch should **forward** the frame to the port recorded in the MAC table, not drop it, when the destination is known on another port.'
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

  // --- Contrast wrong label with correct answer text ---
  if (correct && wrong.length < 120) {
    const contrast = firstSentence(correctExpl)
    if (w.includes('not ') || /^no\b|^never\b|^cannot\b/i.test(w)) {
      return `**${wrong}** contradicts the expected behavior. ${contrast}`
    }
    if (correctLower && !correctLower.includes(w.slice(0, Math.min(12, w.length)))) {
      return `**${wrong}** describes a different mechanism than this question tests. The right idea: ${contrast}`
    }
  }

  // --- Scenario keyword mismatch ---
  if (question.includes('troubleshoot') || q.type === 'troubleshooting') {
    return `**${wrong}** is a plausible guess but does not explain the symptom in the stem. Most likely cause: ${firstSentence(correctExpl)}`
  }

  return `**${wrong}** does not satisfy what the question asks. ${firstSentence(correctExpl)}`
}

export function examTipFor(q) {
  const c = (q.concept || '').toLowerCase()
  const { blob } = ctx(q)
  if (c.includes('mac') || /mac learning|cam/i.test(blob)) {
    return 'Learning uses SOURCE MAC + ingress port. Forwarding uses DESTINATION MAC lookup.'
  }
  if (c.includes('pat') || c.includes('overload')) return 'Many hosts sharing one public IP → PAT/overload and the keyword "overload".'
  if (c.includes('nat')) return 'Mark inside/outside interfaces first — NAT does nothing without them.'
  if (c.includes('dhcp')) return 'Remember DORA: Discover, Offer, Request, Acknowledge.'
  if (c.includes('dns')) return 'Forward lookup = name→IP; reverse lookup = IP→name.'
  if (c.includes('syslog')) return 'Lower syslog severity number = more critical (emergencies = 0).'
  if (c.includes('ospf')) return 'OSPF neighbors need matching area, hello/dead timers, and subnet on the link.'
  if (c.includes('static')) return 'Next-hop static routes need a recursive lookup to find the exit interface.'
  return 'Eliminate answers that describe a different protocol, port, or command than the stem asks for.'
}

export function generateAnswerReview(q) {
  if (!Array.isArray(q.choices) || typeof q.correctIndex !== 'number') return null

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

  const review = {
    correct: { choiceIndex: q.correctIndex, explanation: correctExpl },
    incorrect,
    examTip: examTipFor(q),
  }

  if (q.concept?.includes('pat') || q.concept?.includes('overload')) {
    review.memoryHook = 'PAT = many tenants, one door — ports are the apartment numbers.'
  }

  return review
}

/** Prefer stored review unless it is the generic template; then rebuild. */
export function resolveIncorrectItem(q, item) {
  const stored = item?.explanation
  if (stored && !isGenericWrongExplanation(stored)) {
    return {
      choiceIndex: item.choiceIndex,
      explanation: stored,
      misconceptionTested: item.misconceptionTested || inferTrapForChoice(q, item.choiceIndex),
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
