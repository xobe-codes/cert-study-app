/**
 * Offline answerReview generator — no API. Produces static teachable reviews.
 */

const TRAP_HINTS = {
  nat: 'Confusing inside local, inside global, and outside addresses',
  pat: 'Mixing up PAT/overload with static or dynamic NAT',
  dhcp: 'Confusing DHCP roles (server vs relay vs client)',
  dns: 'Reversing forward vs reverse DNS lookup',
  snmp: 'Mixing SNMP versions or trap vs inform behavior',
  syslog: 'Syslog severity numbering (lower number = more severe)',
  ntp: 'Confusing NTP stratum direction or client/server role',
  ospf: 'OSPF neighbor requirements or DR/BDR election rules',
  static: 'Static route next-hop vs exit-interface behavior',
  acl: 'Standard vs extended ACL placement or wildcard masks',
  default: 'Picking a familiar term without matching the exact behavior tested',
}

function inferTrap(q, choiceIndex) {
  const concept = (q.concept || '').toLowerCase()
  for (const [key, trap] of Object.entries(TRAP_HINTS)) {
    if (concept.includes(key)) return trap
  }
  const wrong = q.choices?.[choiceIndex] || ''
  if (/show|debug|ip nat|ip route|ip ospf|access-list|vlan|standby/i.test(wrong)) {
    return 'Choosing a plausible command that does not solve this specific scenario'
  }
  return TRAP_HINTS.default
}

function buildWrongExplanation(q, choiceIndex, correctExpl) {
  const wrong = q.choices[choiceIndex]
  const correct = q.choices[q.correctIndex]
  if (!wrong) return 'This option does not fit the scenario.'
  if (wrong === correct) return 'This is the correct answer, not a distractor.'
  const short = correctExpl.length > 120 ? correctExpl.slice(0, 120) + '…' : correctExpl
  return `"${wrong}" is incorrect because the scenario requires: ${short}`
}

function examTipFor(q) {
  const c = (q.concept || '').toLowerCase()
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
        explanation: buildWrongExplanation(q, choiceIndex, correctExpl),
        misconceptionTested: inferTrap(q, choiceIndex),
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

export function applyAnswerReviewToQuestion(q) {
  if (q.answerReview) return q
  const answerReview = generateAnswerReview(q)
  if (!answerReview) return q
  const next = { ...q, answerReview }
  delete next.needsExplanationReview
  return next
}
