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

function contrastWithCorrect({ wrong, correct, hooks, fact, blob }) {
  const hook = hookPhrase(hooks, fact.split(/[.!?]/)[0]?.trim() || 'the scenario constraint')
  const w = wrong.toLowerCase()
  const c = correct.toLowerCase()
  const b = String(blob || '').toLowerCase()

  if (impliesDropOrDiscard(w) && /flood|forward/i.test(c)) {
    return `In this stem (${hook}), the switch should **${correct}** — not discard traffic for unknown or normal unicast handling.`
  }
  if (/back to the source|echo/i.test(w) && /flood|forward/i.test(c)) {
    return `Ethernet switching (${hook}) does not echo frames to the sender — **${correct}** is how unknown destinations are handled.`
  }
  if (/flood|broadcast|all ports/i.test(w) && /forward|mapped|only the|single port/i.test(c)) {
    return `Here (${hook}), the destination is handled with **${correct}** because flooding is for unknown destinations, not known mapped MACs.`
  }
  if (/default gateway|router only/i.test(w) && /switch|flood|mac|frame|vlan/i.test(hook.toLowerCase() + b)) {
    return `This stem tests Layer 2 behavior (${hook}). **${correct}** applies locally — default-gateway forwarding is for inter-subnet routing, not this decision.`
  }
  if (/destination/.test(w) && !/source/.test(w) && /source|learn/i.test(c + ' ' + hook.toLowerCase())) {
    return `The stem asks what gets **learned** (${hook}). Switches record the **source MAC** on ingress — destination MAC is for lookup, not learning.`
  }
  if (mentionsBothMacAddresses(w)) {
    return `CAM learning stores one mapping per arrival (${hook}): **${correct}** — not both addresses as table entries.`
  }
  if (/ip address|only ip|neither|layer 3/i.test(w) && /mac|frame|switch|layer 2/i.test(hook.toLowerCase() + b)) {
    return `This is a Layer 2 process (${hook}). **${correct}** uses Ethernet addresses — not IP headers.`
  }
  if (/routing table/i.test(w) && /mac|cam|switch|frame/i.test(hook.toLowerCase() + b)) {
    return `Routers use routing tables; this stem is about switch forwarding (${hook}). **${correct}** is the right table/process here.`
  }
  if (/mac address table|cam/i.test(w) && /routing|router|ip route|layer 3/i.test(hook.toLowerCase() + b)) {
    return `The stem targets router behavior (${hook}). **${correct}** uses IP routing — not a switch CAM table.`
  }
  if (isStpPortStateSequence(w)) {
    return `For this RSTP/STP scenario (${hook}), the valid transition order is **${correct}** — **${wrong}** inserts blocking/listening states or wrong ordering.`
  }
  if (/access port|untagged|native vlan/i.test(w) && /trunk|802\.1q|tagged/i.test(c + b)) {
    return `Trunk vs access (${hook}): **${correct}** carries VLAN tags on inter-switch links — **${wrong}** describes access-port behavior.`
  }
  if (/trunk|802\.1q|tagged/i.test(w) && /access|untagged/i.test(c + b)) {
    return `This stem (${hook}) targets access-port behavior — **${correct}** is correct; **${wrong}** applies trunk tagging where a single VLAN is expected.`
  }
  if (/inside local|inside global|outside local|outside global/i.test(w) && /nat|pat|translation/i.test(b)) {
    return `NAT address roles (${hook}) are fixed — **${correct}** matches the stem's inside/outside and local/global pairing; **${wrong}** swaps roles.`
  }
  if (/overload|pat|port translation/i.test(w) && /static nat|one-to-one/i.test(c + b)) {
    return `NAT type (${hook}): **${correct}** fits the stem — **${wrong}** describes PAT/overload when the question tests a different translation style.`
  }
  if (/discover|offer|request|acknowledge|nak/i.test(w) && /dhcp/i.test(b)) {
    return `DHCP message order (${hook}): **${correct}** is the step this stem describes — **${wrong}** is another DORA phase.`
  }
  if (/relay|ip helper|giaddr/i.test(w) && /dhcp server|scope|pool/i.test(c + b)) {
    return `DHCP roles (${hook}): **${correct}** matches who acts in this scenario — **${wrong}** confuses relay/helper with server or client duties.`
  }
  if (/standard acl|extended acl|access-list \d+/i.test(w) && /acl|access.?list/i.test(b)) {
    return `ACL placement/match (${hook}): **${correct}** uses the right ACL type and position — **${wrong}** mismatches standard vs extended rules.`
  }
  if (/permit any|deny any|wildcard/i.test(w) && /acl|access.?list/i.test(b)) {
    return `ACL syntax (${hook}): **${correct}** matches the required match fields — **${wrong}** uses the wrong wildcard or match scope.`
  }
  if (/ssid|mac filter|port security/i.test(w) && /wpa|wireless|802\.11|wifi|wlan/i.test(b)) {
    return `WLAN security (${hook}): **${correct}** provides the admission control the stem requires — **${wrong}** does not authenticate and protect the wireless join.`
  }
  if (/wep\b|tkip\b|open authentication/i.test(w) && /wpa|wireless|802\.11|wifi/i.test(b)) {
    return `WLAN security (${hook}): **${correct}** meets the security requirement — **${wrong}** is deprecated or too weak for the scenario.`
  }
  if (/2\.4\s*ghz|5\s*ghz|6\s*ghz|channel width/i.test(w) && /wireless|wifi|802\.11|wlan/i.test(b)) {
    return `Wireless band/channel (${hook}): **${correct}** fits range, overlap, and standard needs — **${wrong}** picks the wrong band or channel plan.`
  }
  if (/\bwlc\b|lightweight ap|capwap/i.test(w) && /autonomous|standalone ap/i.test(c + b)) {
    return `WLAN architecture (${hook}): **${correct}** matches the deployment model — **${wrong}** mixes controller-based and standalone AP roles.`
  }
  if (/\bdr\b|\bbdr\b|designated router|backup designated/i.test(w) && /ospf/i.test(b)) {
    return `OSPF DR/BDR (${hook}): **${correct}** follows election rules on this segment — **${wrong}** misstates who becomes DR/BDR or when.`
  }
  if (/eigrp|rip|bgp|isis/i.test(w) && /ospf/i.test(b)) {
    return `This stem tests **OSPF** (${hook}) — **${correct}** is protocol-specific; **${wrong}** applies another IGP's behavior.`
  }
  if (/area \d+|stub|nssa|backbone/i.test(w) && /ospf/i.test(b)) {
    return `OSPF area rules (${hook}): **${correct}** satisfies area type and connectivity — **${wrong}** violates area/backbone constraints.`
  }
  if (/json|yaml|xml|rest|ansible|terraform|netconf|gnmi|python/i.test(w) && /automation|controller|api|sdn/i.test(b)) {
    return `Automation tooling (${hook}): **${correct}** matches the API or tool named in the stem — **${wrong}** swaps REST, NETCONF, or orchestration roles.`
  }
  if (/telnet\b/i.test(w) && /ssh|secure|management/i.test(b)) {
    return `Device management (${hook}): **${correct}** protects credentials in transit — **${wrong}** uses cleartext remote access.`
  }
  if (/arp request|gratuitous arp/i.test(w) && /switch|mac|frame|forward/i.test(b)) {
    return `Layer 2 forwarding (${hook}): **${correct}** handles the frame — switches do not substitute **${wrong}** for normal MAC lookup/flood behavior.`
  }
  if (/show (?:ip|mac|vlan|cdp|ospf|run)|display/i.test(w) && /show|verify|display|troubleshoot/i.test(b)) {
    return `Verification command (${hook}): **${correct}** inspects the right table or state — **${wrong}** shows unrelated information.`
  }
  if (/\/\d{1,3}|ipv6|slaac|fe80|link-local/i.test(w) && /ipv6|prefix|address/i.test(b)) {
    return `IPv6 addressing (${hook}): **${correct}** matches prefix, shortening, or assignment rules — **${wrong}** breaks IPv6 syntax or prefix length.`
  }
  if (/tcp\b|udp\b|icmp\b|port \d+/i.test(w) && /tcp|udp|transport|port|socket/i.test(b)) {
    return `Transport protocol (${hook}): **${correct}** matches reliability, ports, or connection behavior — **${wrong}** picks the wrong L4 protocol or port role.`
  }
  if (/ffff\.ffff\.ffff|broadcast mac|multicast/i.test(w) && /broadcast|mac|frame/i.test(b)) {
    return `Ethernet addressing (${hook}): **${correct}** is the broadcast/multicast form this stem expects — **${wrong}** uses the wrong MAC pattern.`
  }
  if (/\bhub\b/i.test(w) && /switch|mac|forward|flood/i.test(b)) {
    return `Switch vs hub (${hook}): **${correct}** segments or selectively forwards — a hub repeats every frame to all ports.`
  }
  if (/aging|timer|\d+\s*seconds/i.test(w) && /aging|mac|timer|timeout/i.test(b)) {
    return `MAC aging (${hook}): **${correct}** is the default or configured timer — **${wrong}** states the wrong timeout value or behavior.`
  }
  if (/svi|inter-vlan|vlan interface|router-on-a-stick/i.test(w) && /vlan|subnet|inter/i.test(b)) {
    return `Inter-VLAN routing (${hook}): **${correct}** provides L3 between VLANs — **${wrong}** leaves traffic unrouted or uses the wrong L3 interface.`
  }
  if (/snmp v1|snmp v2|trap|inform|community/i.test(w) && /snmp/i.test(b)) {
    return `SNMP (${hook}): **${correct}** matches version, trap/inform, or security — **${wrong}** mixes SNMPv2/v3 features or trap types.`
  }
  if (/severity|facility|syslog/i.test(w) && /syslog/i.test(b)) {
    return `Syslog (${hook}): **${correct}** reflects severity or facility rules — **${wrong}** reverses severity numbering or mislabels the level.`
  }
  if (/static route|ip route/i.test(w) && /floating|default route|next-hop|exit interface/i.test(b)) {
    return `Static routing (${hook}): **${correct}** uses the right next-hop or exit interface — **${wrong}** misconfigures recursive or floating static behavior.`
  }
  if (/wildcard|0\.0\.0\.|255\.255\.|\/\d{1,2}/i.test(w) && /acl|ospf|mask|subnet|wildcard/i.test(b)) {
    return `Mask/wildcard (${hook}): **${correct}** uses the mask style this stem requires — **${wrong}** confuses subnet mask with ACL/OSPF wildcard bits.`
  }
  if (/standard acl|extended acl|access-list|access list/i.test(w + ' ' + c) && /acl|access.?list|filter/i.test(b)) {
    return `ACL type/placement (${hook}): **${correct}** matches match fields and placement — **${wrong}** mixes standard vs extended rules or position.`
  }
  if (/root bridge|root port|designated|alternate|blocked|discarding/i.test(w) && /stp|rstp|spanning/i.test(b)) {
    return `STP roles (${hook}): **${correct}** is the role/state this topology elects — **${wrong}** swaps root, designated, or blocked behavior.`
  }
  if (/native vlan|access port|trunk/i.test(w) && /vlan|802\.1q|trunk|access/i.test(b)) {
    return `VLAN tagging (${hook}): **${correct}** matches access vs trunk/native behavior — **${wrong}** applies the wrong tagging model.`
  }
  if (/shutdown|restrict|protect|violation/i.test(w) && /port.?security|sticky|mac/i.test(b)) {
    return `Port security (${hook}): **${correct}** is the violation mode or learning rule tested — **${wrong}** picks a different violation action.`
  }
  if (/lacp|pagp|mode on|etherchannel|port-channel/i.test(w) && /etherchannel|lacp|pagp|bundle|channel/i.test(b)) {
    return `EtherChannel (${hook}): **${correct}** matches negotiation mode — **${wrong}** mixes LACP, PAgP, or static on.`
  }
  if (/hsrp|vrrp|glbp|standby|virtual ip|priority/i.test(w) && /hsrp|vrrp|glbp|fhrp|first.?hop|gateway/i.test(b)) {
    return `FHRP (${hook}): **${correct}** matches the protocol and failover behavior — **${wrong}** swaps HSRP/VRRP/GLBP roles or timers.`
  }
  if (/neighbor|adjacency|hello|dead interval|area/i.test(w) && /ospf/i.test(b)) {
    return `OSPF adjacency (${hook}): **${correct}** satisfies neighbor requirements — **${wrong}** breaks area, timers, or network type matching.`
  }
  if (/discover|offer|request|ack|relay|helper/i.test(w) && /dhcp/i.test(b)) {
    return `DHCP (${hook}): **${correct}** is the message or role this stem describes — **${wrong}** is a different DORA step or relay/server mix-up.`
  }

  const factText = normalize(fact)
  let evidence = factText.slice(0, 180)
  if (evidence && evidence.length < factText.length) evidence = `${evidence.replace(/[\s.,;:]+$/, '')}…`
  else if (evidence && !/[.!?…]$/.test(evidence)) evidence = `${evidence}.`
  if (!evidence) evidence = `${correct} is the keyed result for ${hook}.`
  return `The explanation establishes: **${evidence}** Therefore **${correct}** fits the tested condition, while **${wrong}** would produce a different routing or protocol result.`
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

function buildWhatItDoes(wrong, hooks, blob) {
  // Templates below continue the sentence after the choice, so a choice that
  // already ends in punctuation would splice ("...at the router. applies ...").
  const choice = normalize(wrong).replace(/[.!?;:,]+$/, '')
  const w = choice.toLowerCase()
  const hook = hookPhrase(hooks, 'this scenario')
  const b = String(blob || '').toLowerCase()
  // Topic-specific copy must only fire on questions about that topic.
  const about = re => re.test(b)

  if (impliesDropOrDiscard(w)) {
    return `**${choice}** implies the device should discard the frame instead of forwarding or flooding it.`
  }
  if (/back to the source|echo/i.test(w)) {
    return `**${choice}** implies the switch returns the frame to the sender instead of flooding or forwarding it.`
  }
  if (isStpPortStateSequence(choice)) {
    return `**${choice}** lists an RSTP/STP port-state transition order that does not match the default sequence tested here.`
  }
  if (/ssid.*broadcast|broadcast.*ssid/i.test(w) && /wpa|wireless|802\.11|wifi|wlan/i.test(b)) {
    return `**${choice}** hides the network name from ordinary discovery, but it does not authenticate clients or encrypt their traffic.`
  }
  if (/flood|all ports|broadcast/i.test(w) && /switch|frame|mac|cam|vlan|layer 2|ethernet/i.test(b)) {
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
  if (/access port|untagged/i.test(w)) {
    return `**${choice}** treats the port as a single-VLAN access link without 802.1Q tagging.`
  }
  if (/trunk|802\.1q|tagged/i.test(w)) {
    return `**${choice}** expects VLAN tags on a link that should behave as access-only in this stem.`
  }
  if (/inside local|inside global|outside local|outside global/i.test(w)) {
    return `**${choice}** assigns a specific NAT address role (inside/outside, local/global) that may not match the stem.`
  }
  if (/\boverload\b|\bpat\b|\bport address\b/i.test(w) && about(/nat|pat\b|translat|inside (?:local|global)|outside (?:local|global)/i)) {
    return `**${choice}** implies many-inside-to-few-outside PAT/overload translation.`
  }
  if (/\bdiscover\b|\boffer\b|\brequest\b|\backnowledge\b|\bnak\b/i.test(w) && about(/dhcp|dora|lease|ip helper/i)) {
    return `**${choice}** names a DHCP DORA message step that may not be the phase described in the stem.`
  }
  if (/\brelay\b|\bip helper\b|\bgiaddr\b/i.test(w) && about(/dhcp|lease|broadcast forward/i)) {
    return `**${choice}** forwards DHCP broadcasts toward a remote server rather than acting as the DHCP server itself.`
  }
  if (/standard acl|extended acl|access-list \d+/i.test(w) && about(/acl|access-list|access list|permit|deny|filter/i)) {
    return `**${choice}** applies an ACL type (standard vs extended) or number range that may not match placement rules here.`
  }
  if (/\bwep\b|\btkip\b|open authentication/i.test(w) && about(/wpa|wireless|wlan|802\.11|wifi|ssid|security/i)) {
    return `**${choice}** selects a weak or deprecated WLAN security option.`
  }
  if (/2\.4\s*ghz|5\s*ghz|6\s*ghz|channel width/i.test(w) && about(/wireless|wlan|802\.11|wifi|band|channel|rf/i)) {
    return `**${choice}** picks a wireless band or channel plan that may not fit range, overlap, or standard requirements.`
  }
  if (/\bwlc\b|lightweight ap|capwap/i.test(w) && about(/wireless|wlan|access point|\bap\b|802\.11|wifi/i)) {
    return `**${choice}** assumes a centralized WLC/CAPWAP architecture rather than standalone AP operation.`
  }
  if (/\bdr\b|\bbdr\b|designated router|backup designated/i.test(w) && about(/ospf|adjacency|election|multiaccess|broadcast segment/i)) {
    return `**${choice}** states an OSPF DR/BDR election outcome or role that may not apply on this segment.`
  }
  if (/\beigrp\b|\brip\b|\bbgp\b|\bis-?is\b/i.test(w) && about(/ospf|routing protocol|route|adjacency|lsa|area \d/i)) {
    return `**${choice}** applies another routing protocol's behavior instead of OSPF-specific rules.`
  }
  if (/\bjson\b|\byaml\b|\bxml\b|\brest\b|\bansible\b|\bterraform\b|\bnetconf\b|\bgnmi\b|\bpython\b/i.test(w) && about(/automation|api|controller|sdn|programmab|orchestrat|payload|script/i)) {
    return `**${choice}** names an automation tool, data format, or API style that may not match the stem's orchestration model.`
  }
  if (/\btelnet\b/i.test(w) && about(/remote|management|ssh|access|secure|line vty/i)) {
    return `**${choice}** uses cleartext Telnet for remote device management.`
  }
  if (/arp request|gratuitous arp/i.test(w) && about(/arp|mac|layer 2|frame|switch/i)) {
    return `**${choice}** expects the switch to originate ARP instead of forwarding based on MAC lookup.`
  }
  if (/show (?:ip|mac|vlan|cdp|ospf|run)|display/i.test(w)) {
    return `**${choice}** is a verification command that inspects a different table or feature than the stem asks about.`
  }
  if (/\/\d{1,3}|\bipv6\b|\bslaac\b|fe80|link-local/i.test(w) && about(/ipv6|prefix|address|subnet|slaac|eui-64/i)) {
    return `**${choice}** states an IPv6 address, prefix length, or assignment method that may not follow shortening rules.`
  }
  if (/\btcp\b|\budp\b|\bicmp\b|port \d+/i.test(w) && about(/transport|tcp|udp|icmp|port|segment|handshake|reliab/i)) {
    return `**${choice}** names a transport protocol or port behavior that may not match reliability or connection requirements.`
  }
  if (/ffff\.ffff\.ffff|broadcast mac|\bmulticast\b/i.test(w) && about(/mac|frame|ethernet|layer 2|broadcast|multicast/i)) {
    return `**${choice}** gives a broadcast or multicast MAC pattern that may not be the all-ones form tested here.`
  }
  if (/\bhub\b/i.test(w) && about(/switch|collision|frame|forward|ethernet|layer 2/i)) {
    return `**${choice}** treats a hub's repeat-all-ports behavior as equivalent to selective switch forwarding.`
  }
  if (/\baging\b|\btimer\b|\d+\s*seconds/i.test(w) && about(/aging|timer|mac|cam|table|hold|dead|hello/i)) {
    return `**${choice}** states a MAC aging timer or timeout value that may not match the default or configured setting.`
  }
  if (/\bsvi\b|inter-vlan|vlan interface|router-on-a-stick/i.test(w) && about(/vlan|inter-vlan|routing|layer 3|svi|subinterface/i)) {
    return `**${choice}** describes an inter-VLAN routing approach (SVI or router-on-a-stick) that may not fit this topology.`
  }
  if (/snmp\s*v[123]|\btrap\b|\binform\b|\bcommunity\b/i.test(w) && about(/snmp|monitor|management|trap|mib/i)) {
    return `**${choice}** mixes SNMP version, trap/inform, or community/security features.`
  }
  if (/\bseverity\b|\bfacility\b|\bsyslog\b/i.test(w) && about(/syslog|logging|severity|facility|log level/i)) {
    return `**${choice}** assigns a syslog severity or facility level that may reverse the lower-number-is-more-severe rule.`
  }
  if (/static route|ip route/i.test(w) && about(/route|routing|next-hop|next hop|gateway|forward/i)) {
    return `**${choice}** configures static routing with a next-hop or exit interface that may not satisfy recursive lookup here.`
  }
  if (/^true$|^false$/i.test(w.trim())) {
    return `**${choice}** states the opposite of the tested fact about ${hookPhrase(hooks, 'this topic')}.`
  }
  if (/^\d+$/.test(w.trim()) || /\d+\s*(?:seconds?|ms|mbps|ghz|mhz)/i.test(w)) {
    return `**${choice}** gives a numeric value (timer, prefix, or rate) that may not match the fact tested in ${hook}.`
  }

  return `**${choice}** points to a related idea, but not the specific behavior or value required for ${hook}.`
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

  const whatItDoes = buildWhatItDoes(wrong, hooks, blob)
  const whyWrongHere = contrastWithCorrect({ wrong, correct, hooks, fact, blob })
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
