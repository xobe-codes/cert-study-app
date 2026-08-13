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
  if (/hop count/i.test(w) && /link-state|ospf|distance-vector|metric/i.test(b)) {
    return `Link-state protocols (${hook}) use a cost-based metric built from interface characteristics, not hop count alone — **${correct}** is the actual distinguishing trait; **${wrong}** describes distance-vector routing like RIP.`
  }
  if (/small amount of (?:resources|cpu|ram)|less (?:cpu|ram|memory)|requires only/i.test(w) && /link-state|ospf/i.test(b)) {
    return `Maintaining a full topology database and running SPF costs more memory and CPU than distance-vector routing, not less — **${correct}** is the real link-state trait; **${wrong}** overstates its efficiency.`
  }
  if (/\bcidr\b|\bvlsm\b/i.test(w) && /link-state|ospf|advantage/i.test(b)) {
    return `Both link-state and modern classless distance-vector protocols support CIDR/VLSM, so it isn't link-state-specific — **${correct}** is the trait unique to link-state operation that this stem asks for; **${wrong}** names a shared, non-distinguishing feature.`
  }
  if (/share (?:the )?topology database (?:among|with) all routers|link-state database of all routers/i.test(w) && /link-state|ospf|topology/i.test(b)) {
    return `Link-state routers don't share one literal database instance — each router builds and maintains its own topology database from flooded LSAs, which is what **${correct}** describes; **${wrong}** implies a single shared copy.`
  }
  if (/lowest cost|highest cost/i.test(w) && /longest|prefix|overlapping/i.test(`${c} ${hook.toLowerCase()}`)) {
    return `Overlapping prefixes are resolved by longest prefix match first, before any metric or cost comparison — **${correct}** is that rule; **${wrong}** jumps straight to a metric that never gets evaluated here.`
  }
  if (/(?:highest|lowest) ad\b/i.test(w) && /longest|prefix|overlapping/i.test(`${c} ${hook.toLowerCase()}`)) {
    return `Administrative distance only breaks ties between routes to the exact same prefix — when prefix lengths differ, **${correct}** (longest match) is chosen before AD is ever compared; **${wrong}** applies the wrong tiebreaker.`
  }
  if (/highest ad\b/i.test(w) && /lowest ad|lower ad/i.test(c)) {
    return `Routers prefer the route with the lowest administrative distance (the most trustworthy source), not the highest — **${correct}** states the rule correctly; **${wrong}** reverses it.`
  }
  if (/dynamic routing|distance-vector routing|link-state routing/i.test(w) && /static rout/i.test(c) && /administrator intervention|manual/i.test(b)) {
    return `**${correct}** is configured and maintained manually by an administrator — **${wrong}** is a routing method that updates itself automatically, the opposite of what this stem describes.`
  }
  if (/static rout|directly connected/i.test(w) && /dynamic rout/i.test(c) && /no administrator intervention|automatically/i.test(b)) {
    return `**${correct}** reconverges on its own when a route fails — **${wrong}** either needs manual reconfiguration (static) or only ever describes locally attached networks (connected), neither of which self-heals.`
  }
  if (/dynamic route|ospf route|rip route|eigrp route/i.test(w) && /default route/i.test(c) && /routing table|marked|s\*/i.test(b)) {
    return `The **S\\*** code marks a static default route — the asterisk flags it as a candidate default — **${correct}** matches that code; **${wrong}** names a route type carried by a different table code.`
  }
  if (/ad of 0/i.test(w) && /ad of 1\b/i.test(c)) {
    return `AD 0 is reserved for directly connected interfaces, not static routes — a manually configured static route defaults to **${correct}**; **${wrong}** is the connected-route value.`
  }
  if (/ad of \d+/i.test(w) && /ad of 1\b/i.test(c)) {
    return `A static route's default administrative distance is **${correct}** — **${wrong}** states a different AD value that doesn't match the Cisco default.`
  }
  if (/^(?:0|1|20|90|100|110|120|170|200|255)$/.test(w.trim()) && /administrative distance|\bad\b/i.test(b)) {
    return `Administrative distance values are fixed per source (connected = 0, static = 1, eBGP = 20, EIGRP = 90, OSPF = 110, RIP = 120, iBGP = 200, unusable = 255) — **${correct}** matches the source in this stem; **${wrong}** is another protocol's or route type's AD.`
  }
  if (/proxy arp/i.test(w) && /vrrp|glbp|hsrp/i.test(c)) {
    return `Proxy ARP is a separate Layer 2 mechanism, not a first-hop redundancy protocol — **${correct}** is the FHRP this stem actually asks for; **${wrong}** answers a different question.`
  }
  if (/0c07/i.test(w) && /hsrp|mac address/i.test(b)) {
    return `In the virtual MAC 0000.0c07.acXX, only the last byte encodes the HSRP group number — 0c07 is the fixed HSRP vendor prefix, not the group — **${correct}** is the group; **${wrong}** points at the fixed prefix instead.`
  }
  if (/^\d{2,3}$/.test(w.trim()) && /hsrp|priority/i.test(b) && !/\bad\b|administrative distance/i.test(b)) {
    return `HSRP's default priority is **${correct}** — **${wrong}** states a different value; only a priority you explicitly configure above the default wins an election.`
  }
  if (/^egp$/i.test(w.trim()) && /^ospf$/i.test(c.trim())) {
    return `OSPF is the nonproprietary interior gateway protocol this stem asks about — **${correct}** is that protocol; EGP is an obsolete exterior routing protocol, not an IGP choice here.`
  }
  if (/^autonomous system router$/i.test(w.trim()) && /^autonomous system boundary router$/i.test(c.trim())) {
    return `The router that redistributes routes between OSPF and an outside routing domain is the **ASBR** (Autonomous System Boundary Router) — **${correct}** is that full term; **${wrong}** drops "boundary," which isn't standard OSPF terminology.`
  }
  if (/^autonomous system routers?$|^autonomous system boundary routers?$/i.test(w.trim()) && /^area border routers?$/i.test(c.trim())) {
    return `Routers that sit between two OSPF areas are **Area Border Routers (ABRs)** — **${correct}** is that term; **${wrong}** names a different OSPF router role (the ASBR, which connects to an external domain, not between two internal areas).`
  }
  if (/ospf is a distance-vector protocol|ospf performs default auto-summarization/i.test(w) && /ospf updates are event triggered/i.test(c)) {
    return `OSPF is a link-state protocol that sends triggered (event-driven) updates and does not auto-summarize by default — **${correct}** states that correctly; **${wrong}** describes a distance-vector trait (like RIP/EIGRP), not OSPF's actual behavior.`
  }
  if (/^the highest mac address configured on the router$/i.test(w.trim()) && /^the highest ip address configured on the router$/i.test(c.trim())) {
    return `A Cisco router's OSPF Router ID defaults to its highest active IP address (loopback preferred, else physical interface) — **${correct}** is that rule; **${wrong}** substitutes MAC address, which OSPF RID selection doesn't use.`
  }
  if (/two routers participating in ospf routing|two routers that share the same as number/i.test(w) && /a routed interface added to the ospf process/i.test(c)) {
    return `An OSPF **link** is a routed interface enabled for OSPF, not a relationship between two routers (that's a neighbor/adjacency) — **${correct}** is that definition; **${wrong}** describes a neighbor relationship instead of the interface-level link.`
  }
  if (/^the topological database$/i.test(w.trim()) && /^the neighborship database$/i.test(c.trim()) && /hello packets/i.test(b)) {
    return `Routers discovered via Hello packet exchange are tracked in the neighborship (neighbor) database — the topological (LSDB) database instead holds the full link-state advertisements describing the network graph — **${correct}** is the Hello-based table this stem asks about; **${wrong}** is a different OSPF data structure.`
  }
  if (/used in routing to determine the destination network|the router uses its subnet mask when routing a packet|checks the subnet mask on the packet/i.test(w) && /used by the host to determine the destination network/i.test(c)) {
    return `The sending **host** ANDs its own subnet mask with the destination IP to decide whether the destination is local or needs a gateway — a router doesn't use the sender's mask, and packets don't carry a subnet mask field at all — **${correct}** states that correctly; **${wrong}** misassigns the mask's use to the router or the packet itself.`
  }
  if (/^igmp$|^rarp$|^icmp$/i.test(w.trim()) && /^arp$/i.test(c.trim()) && /mac address for the frame/i.test(b)) {
    return `ARP resolves an IP address to a MAC address for local delivery — **${correct}** is that protocol; **${wrong}** is a different protocol (multicast group management, reverse address resolution, or diagnostics) that doesn't do IP-to-MAC lookup.`
  }
  if (/source mac address is changed to the original source mac address|all of the above/i.test(w) && /packet.s ttl is decremented/i.test(c)) {
    return `Each router hop decrements the IP TTL by 1 (and rewrites the Layer 2 source/destination MACs to itself and the next hop, not back to the original sender) — **${correct}** states the TTL behavior correctly; **${wrong}** either restores the original source MAC (routers don't do that) or overclaims with "all of the above."`
  }
  if (/process switching|fast switching|intelligent packet forwarding/i.test(w) && /cisco express forwarding/i.test(c)) {
    return `CEF (Cisco Express Forwarding) is the current default forwarding method on Cisco routers, using a pre-built FIB/adjacency table instead of per-packet or per-flow lookups — **${correct}** is that method; **${wrong}** names an older or made-up forwarding method Cisco routers don't use by default anymore.`
  }
  if (/^ip routing$|^packet hopping$/i.test(w.trim()) && /^frame rewrite$/i.test(c.trim())) {
    return `Rewriting the Layer 2 header (source/destination MAC) at each hop is called **frame rewrite** — **${correct}** is that term; **${wrong}** either names the Layer 3 process (routing) or isn't a real networking term.`
  }
  if (/access control lists?|layer 2 asics?|route tables?|frame filters?/i.test(w + c) && /qos|classify/i.test(b)) {
    return `QoS classification (${hook}) uses ACLs (or protocol/NBAR matching) to identify traffic — **${correct}** is that mechanism; **${wrong}** is not how routers classify packets for QoS.`
  }
  if (/^bandwidth$|^delay$|^loss$/i.test(w.trim()) && /^jitter$/i.test(c.trim()) && /consecutive packet/i.test(b)) {
    return `Jitter is specifically the variation in packet-to-packet arrival timing — **${correct}** is that measurement; **${wrong}** measures a different QoS metric (capacity, one-way latency, or drops) that doesn't describe timing variation.`
  }
  if (/layer 3 field|present from end to end|is 6 bits/i.test(w) && /only present in 802\.1q frames/i.test(c)) {
    return `CoS is a 3-bit field carried only inside an 802.1Q trunk tag, so it exists only on tagged Layer 2 links, not end-to-end and not at Layer 3 — **${correct}** states that scope correctly; **${wrong}** either misstates its layer, its persistence, or its bit width (that's DSCP's 6 bits, not CoS's 3).`
  }
  if (/^bandwidth$|^delay$|^jitter$/i.test(w.trim()) && /^loss$/i.test(c.trim()) && /discarded due to congestion/i.test(b)) {
    return `Loss is specifically the measurement of packets dropped from a congested queue — **${correct}** is that metric; **${wrong}** measures a different QoS dimension (capacity, one-way latency, or timing variation) that isn't about discarded packets.`
  }
  if (/dscp af 4[013]|dscp af 11|dscp af 00/i.test(w) && /dscp ef 46/i.test(c)) {
    return `DSCP **EF (Expedited Forwarding, value 46)** is the highest-priority marking, reserved for voice-like low-latency traffic — **${correct}** is that marking; **${wrong}** is an Assured Forwarding class, which ranks below EF regardless of its drop precedence.`
  }
  if (/^cbwfq$|^fifo$|^cir$/i.test(w.trim()) && /^llq$/i.test(c.trim()) && /priority over all other queues/i.test(b)) {
    return `LLQ (Low Latency Queuing) is the strict-priority queue serviced first, ahead of every other queue in the scheduler — **${correct}** is that queue; **${wrong}** is a different queuing method or an unrelated QoS term (CIR is a policing/shaping rate, not a queue type).`
  }
  if (/^llq$|^cbwfq$|^fifo$/i.test(w.trim()) && /^policing$/i.test(c.trim()) && /queue starvation/i.test(b)) {
    return `Policing prevents any one flow from monopolizing bandwidth (and starving other queues) by dropping or remarking excess traffic at the edge — **${correct}** is that method; **${wrong}** names a queuing mechanism, not the traffic-conditioning method that combats starvation.`
  }
  if (/cause jitter|adhere to the speed/i.test(w) && /holds packets in the queue over the configured bit rate to cause delay/i.test(c)) {
    return `Shaping buffers (holds) excess packets and releases them later, which adds delay — it doesn't specifically target jitter and it doesn't "slow" packets, it queues them — **${correct}** states that correctly; **${wrong}** either names the wrong side effect or blurs shaping with policing's rate-limiting behavior.`
  }
  if (/^llq$|^fifo$|^pq$/i.test(w.trim()) && /^cbwfq$/i.test(c.trim()) && /round-robin scheduler/i.test(b)) {
    return `CBWFQ (Class-Based Weighted Fair Queuing) services its class queues in a weighted round-robin fashion — **${correct}** is that method; **${wrong}** is a different queuing method (strict priority, first-in-first-out, or priority queuing) that doesn't round-robin.`
  }
  if (/holds packets in the queue over the configured bit rate to cause delay|holds packets in the queue over the configured bit rate to cause jitter|slows packets in the queue over the configured bit rate/i.test(w) && /drops packets over the configured bit rate to cause loss/i.test(c)) {
    return `Policing enforces a rate by **dropping** (or remarking) packets over the limit immediately — it doesn't queue/hold them the way shaping does — **${correct}** states that correctly; **${wrong}** describes shaping's buffering behavior instead of policing's drop behavior.`
  }
  if (/help police lan applications|help police wan applications|maintain a contracted burst rate/i.test(w) && /maintain a contracted cir/i.test(c)) {
    return `Policing exists to enforce the **committed information rate (CIR)** a customer contracted for — **${correct}** is that reason; **${wrong}** either names the wrong traffic scope or the wrong contracted metric (burst size, not CIR).`
  }
  if (/^af31 marked traffic has a better queue than af41 marked traffic$/i.test(w.trim()) && /^af41 marked traffic has a better queue than af31 marked traffic$/i.test(c.trim())) {
    return `Within Assured Forwarding, a higher class number gets better queuing treatment — AF4x outranks AF3x — **${correct}** states that correctly; **${wrong}** reverses the class-number priority order.`
  }
  if (/logging (?:server|debugging)\s*\d*|log-level/i.test(w) && /logging trap/i.test(c)) {
    return `The syslog severity sent to a remote server is set with \`logging trap <level>\` — **${correct}** is the real command syntax; **${wrong}** is not valid IOS syslog configuration.`
  }
  if (/logging timestamps log datetime|logging timestamps datetime|service datetime timestamps/i.test(w) && /service timestamps log datetime/i.test(c)) {
    return `The command is \`service timestamps log datetime\`, in that exact keyword order — **${correct}** has the right syntax; **${wrong}** reorders the keywords or uses \`logging\` instead of \`service\`, which IOS won't accept.`
  }
  if (/config-line\)#logging level \d|config\)#logging console 7/i.test(w) && /config\)#logging console 0/i.test(c)) {
    return `The command is \`logging console <level>\`, entered in global config mode — **${correct}** has the right mode, keyword, and level; **${wrong}** either uses a keyword IOS doesn't have (\`logging level\`) at the wrong mode, or a different severity number.`
  }
  if (/config\)#logging 1$|config\)#logging buffered 2|config\)#logging 2$/i.test(w) && /config\)#logging buffered 1/i.test(c)) {
    return `Storing logs in RAM requires the \`buffered\` keyword plus a severity level — **${correct}** has the right keyword and level; **${wrong}** either drops \`buffered\` or specifies a different severity number.`
  }
  if (/^show commands$|^show log$|^show buffer$/i.test(w.trim()) && /^show history$/i.test(c.trim())) {
    return `\`show history\` lists the commands you've typed in this session — **${correct}** is that command; **${wrong}** is not a real IOS command or shows something else (message logs, not command history).`
  }
  if (/^informational \(6\)$|^warnings \(4\)$|^debugging \(7\)$/i.test(w.trim()) && /^notifications \(5\)$/i.test(c.trim())) {
    return `This stem's syslog excerpt keys to severity level 5 (Notifications) — **${correct}** matches that level/name pairing; **${wrong}** names a different severity level than what the excerpt shows.`
  }
  if (/^show cpu$|^show cpu-stats$|^show environment cpu$/i.test(w.trim()) && /^show processes$/i.test(c.trim())) {
    return `\`show processes\` is the IOS command that reports CPU utilization (per-process and overall) — **${correct}** is that command; **${wrong}** is not a real IOS command for this.`
  }
  if (/config\)#logging internal|config\)#logging ram|config\)#logging console/i.test(w) && /config\)#logging buffered/i.test(c)) {
    return `Directing logs to the router's internal (RAM) buffer uses the \`logging buffered\` command — **${correct}** is that command; **${wrong}** either invents a keyword IOS doesn't have or sends logs somewhere else (the console line, not RAM).`
  }
  if (/^tty$|^nvram$/i.test(w.trim()) && /^console$/i.test(c.trim()) && /default destination/i.test(b)) {
    return `Cisco devices send syslog messages to the **console** line by default, before any other destination is configured — **${correct}** is that default; **${wrong}** names a destination or storage type that isn't the out-of-the-box default.`
  }
  if (/^notification \(5\)$|^informational \(6\)$|^warning \(4\)$/i.test(w.trim()) && /^debugging \(7\)$/i.test(c.trim()) && /default level/i.test(b)) {
    return `The default syslog facility logging level is **Debugging (7)** — the least restrictive level, logging everything — **${correct}** is that default; **${wrong}** names a more restrictive level that isn't the out-of-the-box default.`
  }
  if (/ntp (?:server|clock source|trusted)/i.test(w) && /ntp master/i.test(c)) {
    return `\`ntp master\` tells the device to trust and advertise its own internal clock — **${correct}** is that command; **${wrong}** either points to an external time source or isn't a real IOS NTP command.`
  }
  if (/^show ntp$|^show time$|^show time source$/i.test(w.trim()) && /^show clock detail$/i.test(c.trim())) {
    return `\`show clock detail\` reports whether the clock is authoritative (NTP-synced) or not — **${correct}** is that command; **${wrong}** is not a real IOS command for checking NTP sync state.`
  }
  if (/^show clock detail$|^show ntp detail$|^show ntp skew$/i.test(w.trim()) && /^show ntp associations detail$/i.test(c.trim())) {
    return `\`show ntp associations detail\` reports per-server sync details (offset, delay, reachability) — **${correct}** is that command; **${wrong}** either checks local clock authority, not server association, or isn't a real IOS command.`
  }
  if (/^show ntp$|^debug ntp messages$/i.test(w.trim()) && /^debug ntp packets$/i.test(c.trim())) {
    return `\`debug ntp packets\` shows the actual NTP packet exchange with the server, confirming a reply is received — **${correct}** is that command; **${wrong}** either shows static state with no live packet exchange, or isn't the right debug keyword.`
  }
  if (/configure all devices as master servers/i.test(w) && /always configure the time source to a dns address/i.test(c)) {
    return `Using a DNS name (rather than a hardcoded IP) for the NTP source is best practice, since it survives the server's IP changing — **${correct}** states that practice; **${wrong}** would create multiple unsynchronized authoritative clocks instead of a consistent time hierarchy.`
  }
  if (/^show ntp$|^debug ntp drift$/i.test(w.trim()) && /^show ntp status$/i.test(c.trim())) {
    return `\`show ntp status\` reports the clock's offset and drift from its NTP source — **${correct}** is that command; **${wrong}** either isn't a complete/real command or isn't how drift is checked.`
  }
  if (/clock timezone pacific|timezone pacific|timezone pst -8/i.test(w) && /clock timezone pst -8 0/i.test(c)) {
    return `The full syntax is \`clock timezone <name> <hour-offset> <minute-offset>\` — **${correct}** has the complete syntax; **${wrong}** drops the \`clock\` keyword, uses a name IOS doesn't recognize, or omits the numeric offset.`
  }
  if (/^tunnel interface$|^ntp interface$/i.test(w.trim()) && /^loopback interface$/i.test(c.trim())) {
    return `A loopback interface never goes down as long as the device is up, making it the resilient source for NTP even if a physical interface fails — **${correct}** is that interface type; **${wrong}** either depends on other infrastructure (tunnel) or isn't a real interface type.`
  }
  if (/ntp loopback 0|ntp master loopback 0|ntp clock loopback 0/i.test(w) && /ntp source loopback 0/i.test(c)) {
    return `The command to source NTP packets from an interface is \`ntp source <interface>\` — **${correct}** has the right keyword; **${wrong}** drops \`source\` or substitutes a different (wrong) keyword.`
  }
  if (/config\)#clock set|^router#clock \d/i.test(w) && /^router#clock set 2:24:00 1 august 2019$/i.test(c.trim())) {
    return `\`clock set\` is a privileged EXEC command (not global config) with syntax \`clock set hh:mm:ss day month year\` — **${correct}** has the right mode, keyword, and date order; **${wrong}** either runs it from config mode, drops the \`set\` keyword, or reorders day/month.`
  }
  if (/reversed to another dns server|without asking another dns server/i.test(w) && /resolution of an ip address to fqdn/i.test(c)) {
    return `A reverse lookup resolves an IP address back to a hostname (FQDN) via a PTR record — **${correct}** states that definition; **${wrong}** describes DNS server iteration, not what a reverse lookup is.`
  }
  if (/\ba record\b/i.test(w) && /\bptr record\b/i.test(c)) {
    return `The **PTR** record maps an IPv4 address to an FQDN (reverse DNS) — **${correct}** is the right record type; **${wrong}** (the A record) does the opposite, mapping a name to an address.`
  }
  if (/^the cname record$|^the aaaa record$/i.test(w.trim()) && /^the ptr record$/i.test(c.trim())) {
    return `The **PTR** record is what maps an IPv4 address back to an FQDN — **${correct}** is that record type; **${wrong}** either aliases one name to another (CNAME) or holds an IPv6 address (AAAA), neither of which does address-to-name mapping.`
  }
  if (/^the dns zone$|^the host header$|^the hostname ptr record$/i.test(w.trim()) && /^the dns domain name$/i.test(c.trim())) {
    return `A device appends its configured DNS **domain name** to unqualified hostname queries before resolving them — **${correct}** is that suffix; **${wrong}** names a different DNS concept that isn't the appended suffix.`
  }
  if (/^dns$|^ptr records$|^llmnr$/i.test(w.trim()) && /^static hostname entries$/i.test(c.trim()) && /most secure method/i.test(b)) {
    return `A locally configured static hostname entry can't be spoofed or poisoned the way a network-based lookup can — **${correct}** is that most-secure method; **${wrong}** all rely on network resolution, which introduces an attack surface static entries don't have.`
  }
  if (/^the cname record$|^the ptr record$|^the aaaa record$/i.test(w.trim()) && /^the a record$/i.test(c.trim())) {
    return `The **A** record holds a hostname's IPv4 address — **${correct}** is that record type; **${wrong}** either aliases a name (CNAME), maps address-to-name (PTR), or holds an IPv6 address (AAAA), not an IPv4 address.`
  }
  if (/^soa$/i.test(w.trim()) && /^ttl$/i.test(c.trim()) && /dns cache/i.test(b)) {
    return `The record's **TTL (Time To Live)** value is what limits how long it stays cached — **${correct}** is that field; **${wrong}** (SOA) holds zone-administration data, not a per-record cache expiry.`
  }
  if (/^default of 5 minutes$/i.test(w.trim()) && /^ttl$/i.test(c.trim())) {
    return `Cache duration is controlled by the record's **TTL** value, which the zone administrator sets per record — **${correct}** is that mechanism; **${wrong}** assumes a fixed universal timeout that doesn't actually exist in DNS.`
  }
  if (/^layer 3 unicast$/i.test(w.trim()) && /^layer 3 broadcast$/i.test(c.trim()) && /initially acquire/i.test(b)) {
    return `A DHCP client has no IP address yet, so its initial DHCPDISCOVER must go out as a Layer 3 **broadcast** — it has no server address to unicast to — **${correct}** is that method; **${wrong}** isn't possible before the client has an address.`
  }
  if (/one-quarter of the lease|seven-eighths of the lease|end of the lease/i.test(w) && /one-half of the lease/i.test(c)) {
    return `A DHCP client sends its renewal request (T1 timer) at **50% (one-half)** of the lease duration — **${correct}** is that point; **${wrong}** states a different fraction that doesn't match the T1 default.`
  }
  if (/dhcp uses multicasting between the client and server|the dhcp lease is negotiated between client and server/i.test(w) && /dhcp client is responsible for maintaining the life cycle/i.test(c)) {
    return `The **client** — not the server — tracks and renews its own lease timers throughout the address's life cycle — **${correct}** states that correctly; **${wrong}** either names the wrong transport (DHCP uses broadcast/unicast, not multicast) or misplaces where lease tracking happens.`
  }
  if (/^rarp$/i.test(w.trim()) && /^udp$/i.test(c.trim()) && /transport protocol/i.test(b)) {
    return `DHCP runs over **UDP** (ports 67/68) — **${correct}** is that transport; **${wrong}** (RARP) is a separate, unrelated Layer 2/3 address-resolution protocol, not DHCP's transport.`
  }
  if (/the dhcp server will halt/i.test(w) && /the ip address is removed from the dhcp pool/i.test(c)) {
    return `On detecting a duplicate address (via gratuitous ARP/ping), the DHCP server pulls that address from its available pool rather than shutting itself down — **${correct}** states that correctly; **${wrong}** overstates the impact — one conflict doesn't halt the whole DHCP service.`
  }
  if (/\bcidr\b|classful addressing|\bvpn\b/i.test(w) && /\bnat\b/i.test(c) && /rfc 1918|internet requests|private address/i.test(b)) {
    return `NAT is what translates private RFC 1918 addresses to routable public addresses — **${correct}** is that mechanism; **${wrong}** is a different addressing or tunneling concept that doesn't translate addresses.`
  }
  if (/setting the (?:time and date|key strength|key repository)/i.test(w) && /hostname and domain name/i.test(c) && /ssh|encryption keys/i.test(b)) {
    return `SSH key generation on IOS requires a hostname and domain name (used to build the key's identity) — **${correct}** is that prerequisite; **${wrong}** is not required before \`crypto key generate rsa\` succeeds.`
  }
  if (/snmp version [12]\w*/i.test(w) && /snmp version 3/i.test(c)) {
    return `Only SNMPv3 adds user-based authentication and encryption — SNMPv1/v2c/v2e send community strings in cleartext — **${correct}** is the secure version; **${wrong}** lacks that protection.`
  }
  if (/archive tftp|copy server:/i.test(w) && /copy tftp/i.test(c)) {
    return `Restoring a config from a TFTP server uses \`copy tftp: running-config\` — **${correct}** is the real command; **${wrong}** uses the wrong keyword or source alias.`
  }
  if (/copy tftp ios/i.test(w) && /copy tftp flash/i.test(c)) {
    return `An IOS image upgrade is copied into **flash**, not to a made-up "ios" destination — **${correct}** is the real command; **${wrong}** invents a destination keyword IOS doesn't use.`
  }
  if (/\bciaddr\b|\bsiaddr\b|\bchaddr\b/i.test(w) && /\bgiaddr\b/i.test(c)) {
    return `**GIADDR** is the relay agent's field the DHCP server uses to pick the right scope — **${correct}** is that field; **${wrong}** is a different DHCP header field (client, server, or hardware address) with a different job.`
  }
  if (/vlan traversal|denial of service/i.test(w) && /double tagging/i.test(c) && /native vlan/i.test(b)) {
    return `Double tagging exploits the native VLAN by stacking two 802.1Q tags so the outer tag is stripped at the first trunk, letting the inner tag reach a second VLAN — **${correct}** is that attack; **${wrong}** names a different (or nonspecific) attack category.`
  }
  if (/dhcp (?:snooping )?trust/i.test(w) && /ip dhcp snooping trust/i.test(c)) {
    return `The trusted-port command is \`ip dhcp snooping trust\`, entered in interface config mode — **${correct}** has the right keyword and mode; **${wrong}** either drops the \`ip\` keyword or applies it at the wrong configuration level.`
  }
  if (/show interface|show security/i.test(w) && /show port-security/i.test(c)) {
    return `\`show port-security\` is the diagnostic command for port-security state and violations — **${correct}** is that command; **${wrong}** either shows unrelated interface stats or isn't a real IOS command.`
  }
  if (/dynamic vlans?|\bacls?\b|vlan pruning|wired equivalent privacy|static mac addresses/i.test(w) && /^port security$/i.test(c) && /plugging|access point|rogue|unauthorized device/i.test(b)) {
    return `Port security is what limits which MAC addresses may send traffic on an access port, stopping an unauthorized device from being plugged in — **${correct}** is that control; **${wrong}** solves a different problem (VLAN assignment, traffic filtering, or wireless encryption).`
  }
  if (/switchport port-security(?! maximum)/i.test(w) && /switchport port-security/i.test(c) && /config\)#/i.test(w) && !/config-if\)#/i.test(w)) {
    return `\`switchport port-security\` is entered in interface config mode (\`config-if\`), not global config — **${correct}** has the right mode prefix; **${wrong}** applies the command one level too high.`
  }
  if (/port-security enable/i.test(w) && /switchport port-security/i.test(c)) {
    return `The enabling command is \`switchport port-security\` — there's no separate \`port-security enable\` keyword — **${correct}** is the real syntax; **${wrong}** invents a command IOS doesn't have.`
  }
  if (/^2 mac addresses$|^0 mac addresses$|^10 mac addresses$/i.test(w) && /^1 mac address$/i.test(c) && !/voip|voice vlan/i.test(b)) {
    return `Port security defaults to allowing exactly **1** MAC address per port until you raise the maximum — **${correct}** is that default; **${wrong}** states a different count.`
  }
  if (/^1 mac address$|^0 mac addresses$|^10 mac addresses$/i.test(w) && /^2 mac addresses$/i.test(c) && /voip|voice vlan/i.test(b)) {
    return `A port carrying both a VoIP phone (voice VLAN) and a PC needs **2** learned MAC addresses, one per device — **${correct}** is that count; **${wrong}** doesn't account for both the phone and the PC behind it.`
  }
  if (/^layer 0$|^layer 1$/i.test(w) && /^layer 2$/i.test(c) && /port security/i.test(b)) {
    return `Port security filters by MAC address, a Layer 2 (data link) construct — **${correct}** is the right layer; **${wrong}** names a layer that doesn't have MAC addressing (Layer 1 is physical signaling; "Layer 0" isn't part of the OSI model).`
  }
  if (/to allow or disallow vlans|to prevent unauthorized access by users/i.test(w) && /prevent unauthorized access by mac address/i.test(c)) {
    return `Port security's job is filtering by **MAC address**, not VLAN membership or user identity — **${correct}** states that scope correctly; **${wrong}** describes a different control (VLAN assignment or 802.1X user authentication).`
  }
  if (/mobile environments|higher amount of memory|admin intervention to reset/i.test(w) && /works best in static environments/i.test(c)) {
    return `Port security works best where the same devices stay plugged into the same ports — a static environment — **${correct}** states that correctly; **${wrong}** overstates a resource cost or operational burden port security doesn't inherently have.`
  }
  if (/no switchport dynamic|no dynamic/i.test(w) && /nonnegotiate/i.test(c)) {
    return `A dynamic (DTP-negotiating) port must first be locked to access mode and told to stop negotiating (\`switchport mode access\` + \`switchport nonnegotiate\`) before port security will accept — **${correct}** includes that step; **${wrong}** invents a \`no switchport/no dynamic\` command IOS doesn't have.`
  }
  if (/switchport mode access\s*switchport port-security(?!\s*nonnegotiate)/i.test(w.replace(/\s+/g, ' ')) && /nonnegotiate/i.test(c)) {
    return `Without \`switchport nonnegotiate\`, the port keeps sending DTP frames and IOS still rejects port security on a dynamic port — **${correct}** includes that missing step; **${wrong}** skips it.`
  }
  if (/switchport maximum \d|port-security maximum \d/i.test(w) && /switchport port-security maximum \d/i.test(c)) {
    return `The full command keyword is \`switchport port-security maximum <n>\` — **${correct}** has the complete syntax; **${wrong}** drops part of the required keyword chain.`
  }
  if (/1 to 100\b|100 to 199|100 to 200/i.test(w) && /1 to 99/i.test(c)) {
    return `Standard ACLs use numbers 1–99 (and 1300–1999 expanded) — **${correct}** is the right range; **${wrong}** either overlaps the extended-ACL range (100–199) or shifts the boundary by one.`
  }
  if (/^1 to 99$/i.test(w.trim()) && /^100 to 199$/i.test(c.trim())) {
    return `Extended ACLs use numbers 100–199 (and 2000–2699 expanded) — **${correct}** is the right range; **${wrong}** is the standard-ACL range instead.`
  }
  if (/^log all$|^end of acl marker$/i.test(w) && /deny any any/i.test(c)) {
    return `Every ACL ends with an implicit **deny any any** even if you don't type it — **${correct}** is that rule; **${wrong}** isn't a real automatic ACL behavior.`
  }
  if (/last matching condition is the action taken|if no matching rule exists, they are allowed|implicit allow/i.test(w) && /until a match is made/i.test(c)) {
    return `ACLs process top-down and stop at the first match — there's no "last match wins" and no implicit allow (the implicit rule is deny) — **${correct}** states that correctly; **${wrong}** reverses the matching order or the implicit action.`
  }
  if (/more secure|more specific rules|blocking of applications/i.test(w) && /less processing overhead/i.test(c) && /standard acl/i.test(b)) {
    return `A standard ACL's advantage is that matching only on source address is cheap to evaluate — **${correct}** is that advantage; **${wrong}** actually describes what extended ACLs do better (more specific matching, app/port blocking), not a standard-ACL strength.`
  }
  if (/^1000 to 1999$|^1100 to 1299$|^2000 to 2699$/i.test(w.trim()) && /^1300 to 1999$/i.test(c.trim())) {
    return `The expanded standard-ACL range is 1300–1999 — **${correct}** is that range; **${wrong}** overlaps the extended-ACL numbering instead.`
  }
  if (/defining the broadcast address|defining no addresses|defining the network address/i.test(w) && /defining all addresses/i.test(c) && /wildcard/i.test(b)) {
    return `A wildcard mask of 255.255.255.255 with address 0.0.0.0 matches every bit as "don't care" — that's the \`any\` keyword, matching all addresses — **${correct}** is that meaning; **${wrong}** misreads the wildcard as excluding or narrowing addresses instead.`
  }
  if (/^standard$|^dynamic$|^expanded$/i.test(w.trim()) && /^extended$/i.test(c.trim()) && /filter an application/i.test(b)) {
    return `Filtering by application/port requires matching on more than source address, which only an extended ACL can do — **${correct}** is that type; **${wrong}** either can't match ports (standard) or isn't a real ACL type (expanded) here.`
  }
  if (/^1000 to 1999$|^1100 to 1299$|^1300 to 1999$/i.test(w.trim()) && /^2000 to 2699$/i.test(c.trim())) {
    return `The expanded extended-ACL range is 2000–2699 — **${correct}** is that range; **${wrong}** is a different (standard-ACL or overlapping) range.`
  }
  if (/^standard$|^dynamic$|^extended$/i.test(w.trim()) && /^named$/i.test(c.trim()) && /removing a single entry/i.test(b)) {
    return `Only a named ACL lets you delete one line without recreating the whole list — numbered ACLs (standard/extended) require removing and rebuilding — **${correct}** is that type; **${wrong}** doesn't support single-entry removal this way.`
  }
  if (/^standard$|^extended$|^named$/i.test(w.trim()) && /^dynamic$/i.test(c.trim()) && /successfully logged into/i.test(b)) {
    return `Lock-and-key (dynamic) ACLs open a port only after the user authenticates — **${correct}** is that type; **${wrong}** is a static ACL type that doesn't react to a login event.`
  }
  if (/source address and source port/i.test(w) && /only the source address/i.test(c)) {
    return `A standard ACL can only match on source address — it has no visibility into port numbers — **${correct}** states that limit correctly; **${wrong}** adds a port-matching capability only extended ACLs have.`
  }
  if (/password enable|(?:^|#)enable \S+!?$|secret enable/i.test(w) && /enable secret/i.test(c)) {
    return `The command keyword order is \`enable secret <password>\` — **${correct}** has the right syntax; **${wrong}** reorders or drops the \`secret\` keyword, which IOS won't accept.`
  }
  if (/interface vlan/i.test(w) && /line vty/i.test(c) && /login password|telnet/i.test(b)) {
    return `A Telnet/SSH login password is set under the VTY lines, not an interface — **${correct}** is the right configuration context; **${wrong}** configures an SVI, which has nothing to do with line passwords.`
  }
  if (/line console|line aux/i.test(w) && /line vty/i.test(c) && /telnet/i.test(b)) {
    return `Telnet/SSH sessions terminate on the VTY lines, not console or aux — **${correct}** is the right line type; **${wrong}** configures a local-access line that has nothing to do with remote Telnet logins.`
  }
  if (/originally entered the wrong password|contains a special character|too long and has been truncated/i.test(w) && /enable secret password is set to something else/i.test(c)) {
    return `\`enable secret\` always overrides \`enable password\` when both are configured — the router is checking a different (secret) password than the one just set — **${correct}** is that precedence rule; **${wrong}** blames user error or password formatting that isn't the actual cause.`
  }
  if (/set password.*request login|login password\b.*password/i.test(w.replace(/\s+/g, ' ')) && /password.*login/i.test(c.replace(/\s+/g, ' '))) {
    return `A line needs \`password <pw>\` then \`login\` on separate lines — **${correct}** has the right two-command sequence; **${wrong}** invents keywords (\`set\`, \`request\`) or reorders them into a syntax IOS rejects.`
  }
  if (/the enable secret is not set|the enable password is not set|line is administratively down/i.test(w) && /line login password is not set/i.test(c)) {
    return `"Password required, but none set" means \`login\` is configured on the VTY line with no \`password\` set — it's unrelated to the enable password/secret — **${correct}** is the actual cause; **${wrong}** points at a different (and here, irrelevant) setting.`
  }
  if (/config-line\)#version 2|config-ssh\)#version 2|config\)#ssh version 2/i.test(w) && /config\)#ip ssh version 2/i.test(c)) {
    return `SSH version is set globally with \`ip ssh version 2\` in global config — there's no per-line or \`config-ssh\` mode for it, and the \`ip\` keyword is required — **${correct}** has the right mode and syntax; **${wrong}** applies it in the wrong context or drops \`ip\`.`
  }
  if (/ssh allows for file copy|easier to create acls/i.test(w) && /ssh is encrypted/i.test(c) && /telnet/i.test(b)) {
    return `The reason to replace Telnet with SSH is that SSH encrypts the session (Telnet sends everything, including passwords, in cleartext) — **${correct}** is that reason; **${wrong}** names a true-but-irrelevant SSH feature that isn't why it replaces Telnet.`
  }
  if (/time and date need to be corrected|dns server is not configured|no host record/i.test(w) && /key strength needs to be 768 bits or higher/i.test(c)) {
    return `SSHv2 specifically requires an RSA key of at least 768 bits — a shorter key (the IOS default) blocks v2 even though the keys already exist — **${correct}** is the actual blocker; **${wrong}** names a prerequisite for *generating* keys in the first place, which has already happened here.`
  }
  if (/config\)#account |config\)#user \S+ |config\)#user-account /i.test(w) && /config\)#username \S+ password/i.test(c)) {
    return `The local-user command is \`username <name> password <pw>\` as a single line — **${correct}** has the right keyword and form; **${wrong}** invents a different keyword or mode (\`account\`, \`user\`, \`user-account\`) IOS doesn't have.`
  }
  if (/generate crypto key rsa|crypto generate key rsa|^router#crypto key generate rsa/i.test(w) && /config\)#crypto key generate rsa/i.test(c)) {
    return `The command is \`crypto key generate rsa\`, in that exact keyword order, from global config mode — **${correct}** has both the right order and the right mode; **${wrong}** reorders the keywords or runs it from the wrong prompt.`
  }
  if (/config\)#exec-timeout 0$|config-line\)#timeout 0 0|no exec-timeout/i.test(w) && /config-line\)#exec-timeout 0 0/i.test(c)) {
    return `Disabling the idle timeout takes both minutes and seconds set to \`0 0\`, entered in line config mode with the exact keyword \`exec-timeout\` — **${correct}** has that complete syntax; **${wrong}** is missing an argument, uses the wrong keyword, or applies it at the wrong level.`
  }
  if (/^console 0$/i.test(w) && /^vty 0$/i.test(c) && /show users/i.test(b)) {
    return `\`show users\` lists active sessions by line type — a remote Telnet/SSH session shows as **VTY**, not Console (which is the local physical port) — **${correct}** is the right line type; **${wrong}** names the local-access line instead.`
  }
  if (/gre uses ipsec|gre uses a protocol of|gre provides per-packet authentication/i.test(w) && /packet-in-packet encapsulation/i.test(c)) {
    return `GRE's job is packet-in-packet encapsulation — it doesn't provide encryption or authentication on its own (that's IPsec's role), and its IP protocol number is 47, not 57 — **${correct}** is the accurate GRE fact; **${wrong}** states something GRE doesn't actually do.`
  }
  if (/^ppp$|\bl2tp\b|^ipsec$|^ssl$/i.test(w) && /^gre$/i.test(c) && /tunnel protocol/i.test(b)) {
    return `This stem is asking specifically about the trait this stem attributes to GRE — **${correct}** matches what it's asking about; **${wrong}** is a different tunnel-related protocol that doesn't fit this stem's specific claim.`
  }
  if (/^protocol 4$|^protocol 43$|^protocol 57$/i.test(w.trim()) && /^protocol 47$/i.test(c.trim())) {
    return `GRE is IP protocol number **47** — **${correct}** is that number; **${wrong}** is a different (and here, incorrect) protocol number.`
  }
  if (/^mtu 1492$|^mtu 1500$|^mtu 1528$/i.test(w.trim()) && /^mtu 1476$/i.test(c.trim())) {
    return `A GRE tunnel's default MTU is **1476** bytes — 24 bytes smaller than a standard 1500-byte Ethernet MTU to leave room for the GRE/IP encapsulation header — **${correct}** is that value; **${wrong}** doesn't account for that overhead correctly.`
  }
  if (/^two hops$|^four hops$|^zero hops$/i.test(w.trim()) && /^one hop$/i.test(c.trim())) {
    return `A GRE tunnel makes the underlying multi-hop path look like a single logical hop to routing protocols — **${correct}** is that count; **${wrong}** counts the physical path instead of the tunnel abstraction.`
  }
  if (/^hsrp$|^arp$|^gre$/i.test(w.trim()) && /^nhrp$/i.test(c.trim()) && /dmvpn/i.test(b)) {
    return `NHRP is what DMVPN spokes use to resolve the NBMA (real) address behind a tunnel address — **${correct}** is that protocol; **${wrong}** is a different protocol that doesn't do NBMA-to-tunnel resolution.`
  }
  if (/point-to-point|full-mesh|dual-homed/i.test(w) && /hub-and-spoke/i.test(c) && /dmvpn/i.test(b)) {
    return `DMVPN's classic topology is hub-and-spoke (spokes register with a hub, though spoke-to-spoke tunnels can form dynamically) — **${correct}** is that topology; **${wrong}** describes a different logical layout DMVPN isn't built around.`
  }
  if (/^authentication$|^anti-replay$|^confidentiality$/i.test(w.trim()) && /^data integrity$/i.test(c.trim()) && /tampered/i.test(b)) {
    return `Detecting whether a packet was altered in transit is data integrity, verified via a hash/HMAC — **${correct}** is that benefit; **${wrong}** is a different VPN security property (verifying identity, blocking replayed packets, or hiding content) that doesn't detect tampering.`
  }
  if (/catalyst switches|cisco routers|policy-based routing/i.test(w) && /cisco ftd/i.test(c) && /vpn tunnels between sites/i.test(b)) {
    return `This stem asks specifically about the Cisco platform it names for site-to-site VPN — **${correct}** matches what it's asking about; **${wrong}** is a different Cisco technology that isn't the one keyed here.`
  }
  if (/^dmz$|^internal$|^trusted$/i.test(w) && /^perimeter$/i.test(c)) {
    return `The perimeter is the network's outward-facing edge, outside the firewall — **${correct}** is that term; **${wrong}** names a related but different security zone (the DMZ, the trusted internal network, etc.).`
  }
  if (/^authenticator$|^aaa server$|^radius server$/i.test(w) && /^supplicant$/i.test(c) && /802\.1x/i.test(b)) {
    return `In 802.1X, the **supplicant** is the end device presenting credentials — the authenticator (switch/AP) forwards them, and the AAA/RADIUS server validates them — **${correct}** is the credential-sender; **${wrong}** names a different role in the same exchange.`
  }
  if (/creation of a psk|192-bit key strength/i.test(w) && /radius\/eap|802\.1x/i.test(c) && /wpa2-enterprise/i.test(b)) {
    return `WPA2-Enterprise authenticates each user through 802.1X/RADIUS/EAP rather than a shared secret — **${correct}** is that requirement; **${wrong}** describes WPA2-Personal (PSK) or WPA3 (192-bit suite), not the Enterprise requirement this stem asks about.`
  }
  if (/^aes$/i.test(w) && /^mic$/i.test(c) && /replay|integrity|alter/i.test(b)) {
    return `The **Message Integrity Check (MIC)** is what detects tampering and replay of WPA frames — AES is the encryption cipher, a separate function — **${correct}** is the integrity mechanism; **${wrong}** names the encryption algorithm instead.`
  }
  if (/anti-?malware software|antivirus software|certificates/i.test(w) && /^training$/i.test(c) && /phishing/i.test(b)) {
    return `Phishing targets human judgment, so user **training** (recognizing suspicious emails) is the actual defense this stem asks for — **${correct}** is that control; **${wrong}** is a technical control that doesn't stop a user from being socially engineered.`
  }
  if (/^certificate$|^smart card$|^license$/i.test(w) && /^token$/i.test(c) && /medical data|sensitive|multi-?factor|second factor/i.test(b)) {
    return `**${correct}** matches the specific second-factor mechanism this stem is asking about — **${wrong}** is a different (though related) credential/authentication artifact, not the one keyed here.`
  }
  if (/three tier|collapsed core|san fabric/i.test(w) && /spine\/leaf/i.test(c) && /controller-based|architecture/i.test(b)) {
    return `Controller-based (SDN) fabrics use a Spine/Leaf (CLOS) topology for predictable, non-blocking paths — **${correct}** is that architecture; **${wrong}** names a different (often legacy three-tier) design.`
  }
  if (/leaf switches connect to other leaf|one spine switch per network|spine switches provide access to hosts/i.test(w) && /leaf.*never connect.*leaf.*only spine/i.test(c)) {
    return `In Spine/Leaf, every Leaf connects only to Spine switches — Leaf-to-Leaf and Spine-to-Spine links don't exist, and hosts attach to Leaf switches, not Spine — **${correct}** states that rule; **${wrong}** breaks it.`
  }
  if (/leaf to leaf to spine|spine to leaf to spine|^leaf to leaf$/i.test(w) && /leaf to spine to leaf/i.test(c)) {
    return `Traffic between two hosts always goes Leaf → Spine → Leaf, never directly Leaf-to-Leaf — **${correct}** is that path; **${wrong}** routes through a hop this topology doesn't have.`
  }
  if (/apic-em|opendaylight|sd-wan|prime infrastructure|open ?sdn|open ?stack/i.test(w) && /cisco aci/i.test(c) && /data center/i.test(b)) {
    return `Cisco ACI is Cisco's data-center-focused SDN solution — **${correct}** matches that scope; **${wrong}** is a different Cisco or open-source SDN offering built for a different use case.`
  }
  if (/apic-em|prime infrastructure|opendaylight/i.test(w) && /sd-wan/i.test(c) && /branch|remote office/i.test(b)) {
    return `Cisco SD-WAN is the solution built for secure branch/remote-office connectivity to applications — **${correct}** matches that use case; **${wrong}** targets a different deployment (data center, network management, or open-source controller).`
  }
  if (/spine\/leaf|\bclos\b|\bsdn\b/i.test(w) && /^campus$/i.test(c) && /distribution layer/i.test(b)) {
    return `The classic three-tier Campus model is the one with a distribution layer — Spine/Leaf and CLOS are two-tier data-center designs without one — **${correct}** is the campus model; **${wrong}** names a different architecture.`
  }
  if (/opensdn|openstack|opendaylight/i.test(w) && /^apic-em$/i.test(c) && /enterprise connectivity|sdn controller/i.test(b)) {
    return `APIC-EM is Cisco's SDN controller for enterprise networks — **${correct}** is that product; **${wrong}** is an open-source or unrelated controller platform.`
  }
  if (/data plane|management plane|switch plane/i.test(w) && /control plane/i.test(c) && /spanning tree|\bstp\b/i.test(b)) {
    return `STP builds its topology by exchanging BPDUs, which is control-plane work — **${correct}** is the right plane; **${wrong}** names the plane that forwards traffic or handles device management instead.`
  }
  if (/data plane|control plane/i.test(w) && /management plane/i.test(c) && /syslog/i.test(b)) {
    return `Syslog message delivery is device administration, which runs on the management plane — **${correct}** is that plane; **${wrong}** names the plane that forwards traffic or builds routing/switching state instead.`
  }
  if (/^4 hops$|^5 hops$/i.test(w.trim()) && /^3 hops$/i.test(c.trim()) && /fabric switching/i.test(b)) {
    return `Spine/Leaf fabrics cap the path at 3 hops (leaf-spine-leaf, or leaf-spine-spine-leaf in some designs) — **${correct}** is that maximum; **${wrong}** states a different hop count.`
  }
  if (/^overlay$|^tunnel$|^leaf$/i.test(w.trim()) && /^underlay$/i.test(c.trim()) && /\bmtu\b/i.test(b)) {
    return `The underlay is the physical/IP transport whose links you size the MTU on (to absorb overlay encapsulation overhead) — **${correct}** is that layer; **${wrong}** names the logical/virtual layer built on top of it instead.`
  }
  if (/^management plane$|^configuration plane$|^data plane$/i.test(w.trim()) && /^control plane$/i.test(c.trim()) && /web interface|acls/i.test(b)) {
    return `This stem keys **${correct}** as the plane affected here — **${wrong}** names a different plane (forwarding traffic, or device administration) than the one this stem asks about.`
  }
  if (/^vxlan$|^vlan$|^ecmp$/i.test(w.trim()) && /^dmvpn$/i.test(c.trim()) && /remote offices|wan technology/i.test(b)) {
    return `DMVPN is the WAN overlay technology for connecting remote-office sites over the Internet — **${correct}** is that technology; **${wrong}** is a different overlay/tunneling or load-balancing mechanism, not a WAN-site-interconnect tool.`
  }
  if (/^ecmp$|^dmvpn$|^eigrp$/i.test(w.trim()) && /^vxlan$/i.test(c.trim()) && /layer 2 traffic over a layer 3/i.test(b)) {
    return `VXLAN is the protocol that tunnels Layer 2 frames inside Layer 3 UDP packets, extending a VLAN across a routed network — **${correct}** is that protocol; **${wrong}** is a different tunneling, routing, or load-spreading mechanism that doesn't encapsulate L2 over L3.`
  }
  if (/^cdp$|^icmp$|^vtp$/i.test(w.trim()) && /^snmp$/i.test(c.trim()) && /management plane/i.test(b)) {
    return `SNMP is the classic management-plane protocol (device monitoring/administration) — **${correct}** is that protocol; **${wrong}** is a control-plane (VTP) or diagnostic (ICMP, CDP) protocol instead.`
  }
  if (/^ospf$|^mpls$|^clos$/i.test(w.trim()) && /^ecmp$/i.test(c.trim()) && /next-hop packet forwarding/i.test(b)) {
    return `ECMP (Equal-Cost Multi-Path) is the forwarding mechanism that spreads traffic across multiple equal-cost next hops in SDN fabrics — **${correct}** is that mechanism; **${wrong}** is a routing protocol, label-switching technology, or topology name, not the forwarding mechanism itself.`
  }
  if (/network management station|software-defined networking|centralized logging/i.test(w) && /configuration management/i.test(c) && /ansible|chef|puppet/i.test(b)) {
    return `Ansible, Chef, and Puppet all perform configuration management — pushing and enforcing consistent device configs — **${correct}** is that function; **${wrong}** names a different network-operations category.`
  }
  if (/cisco dna center|^chef$|^puppet$/i.test(w) && /^ansible$/i.test(c) && /yaml/i.test(b)) {
    return `Ansible is the configuration-management tool that uses YAML playbooks — **${correct}** is that tool; **${wrong}** either uses a different language (Chef/Puppet use Ruby-based DSLs) or isn't a config-management tool at all.`
  }
  if (/^playbook$|^settings$|^modules$/i.test(w.trim()) && /^inventory$/i.test(c.trim()) && /ansible/i.test(b)) {
    return `Ansible's inventory file is what lists hosts/groups and their connection details — **${correct}** is that component; **${wrong}** is a different Ansible piece (the task list, config, or code library) that doesn't hold connection info.`
  }
  if (/^agent$|^class$|^module$/i.test(w.trim()) && /^manifest$/i.test(c.trim()) && /puppet/i.test(b)) {
    return `A Puppet manifest (.pp file) is where the desired configuration state is declared — **${correct}** is that component; **${wrong}** is a different Puppet piece (the daemon, a reusable manifest group, or a packaged bundle) that doesn't itself hold the configuration.`
  }
  if (/^cookbook$|^crock pot$|^chef node$/i.test(w.trim()) && /^recipe$/i.test(c.trim()) && /chef/i.test(b)) {
    return `A Chef recipe is the file with the actual instructions to configure a node — **${correct}** is that component; **${wrong}** is a different Chef concept (a collection of recipes, an unrelated term, or the managed host itself).`
  }
  if (/^chef-client$|^chef workstation$|^knife$/i.test(w.trim()) && /^ohai$/i.test(c.trim()) && /chef/i.test(b)) {
    return `Ohai is the Chef component that gathers system state (attributes) and reports it to the server — **${correct}** is that component; **${wrong}** is a different Chef piece (the agent process, the admin workstation, or the CLI tool) that doesn't itself collect system facts.`
  }
  if (/^ansible_settings$|^ansible_connection$|^\/etc\/ansible\/hosts$/i.test(w.trim()) && /^ansible_config$/i.test(c.trim())) {
    return `The environment variable Ansible checks for its settings-file location is ANSIBLE_CONFIG — **${correct}** is that variable; **${wrong}** is a different (or made-up) variable/path name.`
  }
  if (/^man$|^cat$|^ad-hoc$/i.test(w.trim()) && /^ansible-doc$/i.test(c.trim())) {
    return `\`ansible-doc\` is the command that shows detailed module documentation inside Ansible — **${correct}** is that command; **${wrong}** is a generic shell command or a different Ansible feature, not the docs command.`
  }
  if (/^knife interface$|^ansible_playbook command$|^ansible tower$/i.test(w.trim()) && /^ad-hoc interface$/i.test(c.trim())) {
    return `The ad-hoc interface runs a single Ansible command against hosts without writing a playbook — **${correct}** is that tool; **${wrong}** is a Chef tool, the normal playbook runner, or the paid orchestration platform — none of which is the no-playbook quick-command tool.`
  }
  if (/^resource$|^class$|^module$/i.test(w.trim()) && /^facts$/i.test(c.trim()) && /puppet/i.test(b)) {
    return `Puppet facts are the global variables holding node-specific information (gathered by Facter) — **${correct}** is that term; **${wrong}** is a different Puppet building block (a managed item, a reusable manifest group, or a packaged bundle).`
  }
  if (/^chef workstation$|^chef node$|^chef-client$/i.test(w.trim()) && /^bookshelf$/i.test(c.trim()) && /cookbook/i.test(b)) {
    return `A finished Cookbook is uploaded to the Bookshelf on the Chef Server — **${correct}** is that destination; **${wrong}** is a different Chef component (the admin machine, the managed host, or the local agent), not where cookbooks are stored.`
  }
  if (/^ansible$/i.test(w.trim()) && /^ansible tower$/i.test(c.trim()) && /central management|rbac/i.test(b)) {
    return `Central management, scheduling, and RBAC on top of plain Ansible is what Ansible Tower adds — **${correct}** is that product; **${wrong}** (plain Ansible/AWX core) doesn't include that management layer by itself.`
  }
  if (/^python$/i.test(w.trim()) && /^ansible$/i.test(c.trim()) && /easy configuration of cisco network devices/i.test(b)) {
    return `**${correct}** is the configuration-management tool with built-in Cisco IOS modules for easy device config — **${wrong}** is the language Ansible modules happen to be written in, not the config-management tool itself.`
  }
  if (/storage of the bookshelf|storage of the configuration of chef|client-side agent/i.test(w) && /cli utility for the management of chef/i.test(c)) {
    return `Knife is the command-line tool admins use to manage a Chef deployment — **${correct}** is that function; **${wrong}** misassigns Knife's job to storage or the client-side agent (chef-client), which are separate components.`
  }
  if (/iaas helps maintain configuration|prevents drift with ntp|requires per-host licensing/i.test(w) && /iac solutions prevent drift with idempotence/i.test(c)) {
    return `Idempotence — applying the same config repeatedly yields the same result — is what lets Infrastructure as Code prevent configuration drift — **${correct}** states that correctly; **${wrong}** confuses IaC with a different service model (IaaS), an unrelated protocol (NTP), or a licensing claim that isn't the defining trait.`
  }
  if (/^yaml$|^csv$|^xml$/i.test(w.trim()) && /^python$/i.test(c.trim()) && /custom ansible module/i.test(b)) {
    return `Custom Ansible modules are written in Python — playbooks (not modules) are YAML — **${correct}** is that language; **${wrong}** is a data/markup format, not a module-authoring language.`
  }
  if (/user interface layout|source code of the device|data storage of the device/i.test(w) && /api reference/i.test(c) && /automation script|controlled with/i.test(b)) {
    return `The API reference documents exactly what an API exposes and how to call it — **${correct}** is what you'd research; **${wrong}** isn't something an automation script interacts with directly.`
  }
  if (/^cli$|^syslog$|^ssh$/i.test(w) && /^snmp$/i.test(c) && /retrieves information|act similar to an api/i.test(b)) {
    return `SNMP exposes a structured, machine-queryable interface similar to an API — **${correct}** fits that role; **${wrong}** is a human-oriented (CLI) or one-way/transport (Syslog, SSH) mechanism, not a programmatic query interface.`
  }
  if (/^syslog$|^ssh$/i.test(w) && /^netconf$/i.test(c) && /replacement for snmp/i.test(b)) {
    return `NETCONF (RFC 6241) is the protocol built to replace SNMP for configuration management — **${correct}** is that protocol; **${wrong}** is a different management/transport protocol that isn't SNMP's replacement.`
  }
  if (/^snmp$/i.test(w) && /^netconf$/i.test(c) && /yang data model/i.test(b)) {
    return `NETCONF is the protocol that structures its config data with the YANG model — **${correct}** is that protocol; **${wrong}** (SNMP) uses MIBs/OIDs instead, not YANG.`
  }
  if (/^snmp$|^syslog$/i.test(w) && /^restconf$/i.test(c) && /https transport/i.test(b)) {
    return `RESTCONF is the protocol that runs over HTTPS for programmatic config/retrieval — **${correct}** is that protocol; **${wrong}** doesn't use HTTPS as its transport.`
  }
  if (/^snmp$|^sntp$|^soap$/i.test(w) && /^http$/i.test(c) && /rest apis/i.test(b)) {
    return `REST APIs are built on HTTP (using its verbs — GET/POST/PUT/DELETE) — **${correct}** is that protocol; **${wrong}** is a different protocol not used as REST's transport.`
  }
  if (/pass the username and password in every request|send a get to the api for an auth token|create a public private key pair/i.test(w) && /send a post to the api for an authentication token/i.test(c)) {
    return `DNA Center's REST API is authenticated by POSTing credentials once to get a short-lived token, then reusing that token — **${correct}** is that flow; **${wrong}** either resends credentials on every call or uses the wrong HTTP verb/mechanism.`
  }
  if (/^memory cleanup$|^data encoding$/i.test(w) && /^data actions$/i.test(c) && /crud/i.test(b)) {
    return `CRUD (Create, Read, Update, Delete) names the four basic data actions an API exposes — **${correct}** is that category; **${wrong}** is unrelated to what CRUD stands for.`
  }
  if (/^ad integrated$|^ssl$|^pass-through$/i.test(w) && /^basic$/i.test(c) && /token requests? to the cisco dna center/i.test(b)) {
    return `DNA Center token requests use HTTP **Basic** authentication (a Base64-encoded username:password header) — **${correct}** is that method; **${wrong}** names a different authentication mechanism DNA Center doesn't use for this call.`
  }
  if (/add it as a variable named x-auth-token|pass the token in the uri/i.test(w) && /place it in the header/i.test(c)) {
    return `The token is sent back as an **X-Auth-Token** HTTP header on subsequent requests, not embedded in the URI or kept only as a local script variable — **${correct}** is that placement; **${wrong}** doesn't actually transmit the token to the server correctly.`
  }
  if (/^ssl$|^aaa$|^basic$/i.test(w.trim()) && /^base64$/i.test(c.trim()) && /x-auth-token/i.test(b)) {
    return `The credentials are Base64-encoded before being sent for the token request — **${correct}** is that encoding; **${wrong}** names a different mechanism (a protocol or auth scheme), not the encoding itself.`
  }
  if (/^openflow$|^snmp$/i.test(w) && /^restconf$/i.test(c) && /yang data model/i.test(b) && /configure a cisco switch/i.test(b)) {
    return `RESTCONF is the HTTP-based API that operates on a device's YANG-modeled configuration — **${correct}** is that API; **${wrong}** either isn't YANG-based (SNMP) or isn't a Cisco config API here (OpenFlow, a southbound flow-table protocol).`
  }
  if (/format your response correctly|authenticate to the device first|nothing; this code means ok/i.test(w) && /restart the rest-based service/i.test(c)) {
    return `HTTP 500 is a **server**-side error — the fix is on the server (restart the REST service), not something wrong with your request formatting or authentication — **${correct}** is that fix; **${wrong}** treats it as a client-side problem, which 500 specifically isn't.`
  }
  if (/northbound interface|eastbound interface/i.test(w) && /southbound interface/i.test(c) && /restconf/i.test(b)) {
    return `RESTCONF talks device-to-controller, which is the **southbound** interface — northbound is controller-to-application, and eastbound isn't a standard SDN interface direction — **${correct}** is that direction; **${wrong}** names the wrong side of the controller.`
  }
  if (/openflow|cisco prime infrastructure|cisco sd-wan/i.test(w) && /cisco dna center/i.test(c) && /apic-em/i.test(b)) {
    return `Cisco DNA Center is the direct replacement for APIC-EM — **${correct}** is that product; **${wrong}** is a different Cisco platform or protocol that doesn't replace APIC-EM.`
  }
  if (/^ssh$/i.test(w) && /^openflow$/i.test(c) && /dna discovery|not used/i.test(b)) {
    return `DNA Center's discovery process reads device inventory over SSH/SNMP/NETCONF, not OpenFlow — **${correct}** is the protocol it does NOT use; **${wrong}** is one it does use, so it doesn't fit this "which is not used" stem.`
  }
  if (/^https$|^netconf$/i.test(w) && /^openflow$/i.test(c) && /dna discovery|not used/i.test(b)) {
    return `DNA Center's discovery process reads device inventory over HTTPS/NETCONF/SSH/SNMP, not OpenFlow (a southbound flow-table protocol, not a discovery/read protocol) — **${correct}** is the one it does NOT use; **${wrong}** is one it does use, so it doesn't fit this "which is not used" stem.`
  }
  if (/^design$|^policy$|^provision$|^assurance$|^platform$/i.test(w.trim()) && /^design$|^policy$|^provision$|^assurance$|^platform$/i.test(c.trim()) && /cisco dna center/i.test(b)) {
    const DNA_SECTION_ROLE = {
      design: 'defining the network hierarchy, sites, and configuration templates before anything is deployed',
      policy: 'defining group-based access, application, and IP-based policies enforced across the fabric',
      provision: 'deploying and viewing the connectivity/inventory of devices at a site',
      assurance: 'monitoring overall network and client health after deployment',
      platform: 'exposing the APIs (and API documentation) for programmatic/scripted integration',
    }
    const role = DNA_SECTION_ROLE[correct.trim().toLowerCase()]
    if (role) {
      return `In Cisco DNA Center, **${correct}** is the section for ${role} — that's what this stem asks about; **${wrong}** is a different section of the GUI with a different job.`
    }
  }
  if (/ip-based access control|group-based access control|^assurance$/i.test(w) && /plug and play/i.test(c) && /template and apply standard configuration/i.test(b)) {
    return `Plug and Play is the DNA Center feature for pushing a standard configuration template (DNS/NTP/AAA servers) to devices as they onboard — **${correct}** is that feature; **${wrong}** is a different DNA Center capability (access policy or health monitoring) that doesn't template device config.`
  }
  if (/ip-based access control|^python$|^inventory$/i.test(w) && /dna command runner/i.test(c) && /ospf area/i.test(b)) {
    return `Command Runner is the DNA Center tool for pushing the same CLI command(s) to many devices at once — **${correct}** is that tool; **${wrong}** is a different DNA Center capability, an access-control feature, or a scripting language, not the built-in bulk-CLI tool.`
  }
  if (/easy-qos|system 360|cisco ise/i.test(w) && /sd-access/i.test(c) && /fabric of the underlay and overlay/i.test(b)) {
    return `SD-Access is the DNA Center feature that automates fabric provisioning across the underlay and overlay — **${correct}** is that feature; **${wrong}** is a different DNA Center/Cisco capability (QoS automation, dashboarding, or identity services) that doesn't automate the fabric itself.`
  }
  if (/client coverage heat maps|client triangulation support|application health/i.test(w) && /device configuration backup/i.test(c) && /prime infrastructure/i.test(b)) {
    return `Device configuration backup/archival is a legacy Prime Infrastructure feature DNA Center doesn't carry forward the same way — **${correct}** is that gap; **${wrong}** is a wireless/assurance capability DNA Center actually does provide (via Assurance), so it doesn't fit this "cannot provide" stem.`
  }
  if (/^definition$|^lists$|^keys$/i.test(w) && /^mapping$/i.test(c) && /yaml/i.test(b)) {
    return `YAML's key-value pair construct is called a mapping — **${correct}** is the right term; **${wrong}** names a different YAML element (a list/sequence, or just a bare key).`
  }
  if (/hashbang preprocessor/i.test(w) && /three dashes/i.test(c) && /yaml/i.test(b)) {
    return `A YAML file/document starts with three dashes (---) — **${correct}** is that marker; **${wrong}** describes a shebang line, which is a shell-script convention, not YAML's.`
  }
  if (/curly brackets|square brackets/i.test(w) && /three dashes/i.test(c) && /yaml file/i.test(b)) {
    return `A YAML file/document starts with three dashes (---) — **${correct}** is that marker; **${wrong}** describes JSON's bracket delimiters, not YAML's.`
  }
  if (/^yaml$|^json$|^csv$/i.test(w.trim()) && /^xml$/i.test(c.trim()) && /resembles html/i.test(b)) {
    return `XML shares HTML's angle-bracket tag syntax (both descend from SGML) — **${correct}** is that format; **${wrong}** uses a different structuring style (indentation, braces, or delimited text), not tags.`
  }
  if (/^json$|^xml$|^csv$/i.test(w.trim()) && /^yaml$/i.test(c.trim()) && /structured by white ?space/i.test(b)) {
    return `YAML uses indentation (whitespace) to express structure instead of brackets or tags — **${correct}** is that format; **${wrong}** structures data with braces, angle brackets, or delimiters instead.`
  }
  if (/^three dashes$|^a square bracket$|^a double quote$/i.test(w.trim()) && /^a curly bracket$/i.test(c.trim()) && /json file/i.test(b)) {
    return `A JSON document/object begins with a curly bracket \`{\` — **${correct}** is that marker; **${wrong}** is either YAML's marker (three dashes) or a JSON character that isn't the opening one.`
  }
  if (/the value that follows the square bracket is the value|the value is after the matching square bracket|the value is unknown/i.test(w) && /several key-value pairs/i.test(c) && /json file/i.test(b)) {
    return `A square bracket after a key in JSON means the value is an **array** — multiple values under that one key, not a single value — **${correct}** states that correctly; **${wrong}** treats the array marker as if it pointed to one specific value.`
  }
  if (/values can be used that contain spaces|multiple values for a particular key|read line by line for every value/i.test(w) && /hierarchical structure allows for programmability/i.test(c) && /json.*csv|csv.*json/i.test(b)) {
    return `JSON's real advantage over CSV is its nested/hierarchical structure, which programs can walk directly — **${correct}** is that advantage; **${wrong}** names a minor formatting detail that isn't JSON's defining strength over CSV.`
  }
  if (/^csv$/i.test(w.trim()) && /^json$/i.test(c.trim()) && /rest-based api/i.test(b) && /dna center/i.test(b)) {
    return `REST APIs (including DNA Center's) return structured responses as **JSON** — **${correct}** is that format; **${wrong}** is a flat tabular format REST APIs don't typically return.`
  }
  if (/decreased problems|increased throughput|increased complexity/i.test(w) && /increased security/i.test(c) && /controller-based networking/i.test(b) && /benefit/i.test(b)) {
    return `Centralizing policy and visibility in a controller is what improves security posture — **${correct}** is the benefit this stem asks for; **${wrong}** is a plausible-sounding claim controller-based networking doesn't specifically guarantee.`
  }
  if (/always in the form of hardware appliances/i.test(w) && /logically centralized control plane/i.test(c)) {
    return `Controller-based networking's defining trait is a logically centralized control plane — it's commonly software, not a hardware requirement — **${correct}** states that correctly; **${wrong}** claims a hardware requirement that doesn't exist.`
  }
  if (/increase the possibility for misconfiguration|decrease problems from the new configuration|allow you to do less work/i.test(w) && /outcome that can be reproduced/i.test(c)) {
    return `Automation's core value is repeatability — the same script produces the same result every time — **${correct}** is that reason; **${wrong}** is a plausible-sounding side effect, not the actual reason to automate.`
  }
  if (/copy and paste scripts built in notepad\+\+/i.test(w) && /python script/i.test(c) && /20 routers|configure each/i.test(b)) {
    return `A Python script run against many devices programmatically is the scalable, repeatable approach — **${correct}** is that method; **${wrong}** is still manual, error-prone copy-paste, just with extra steps.`
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
  if (/hop count/i.test(w) && about(/link-state|ospf|distance-vector|metric/i)) {
    return `**${choice}** treats hop count as the deciding routing metric.`
  }
  if (/small amount of (?:resources|cpu|ram)|less (?:cpu|ram|memory)|requires only/i.test(w) && about(/link-state|ospf/i)) {
    return `**${choice}** claims link-state routing needs only minimal CPU/RAM.`
  }
  if (/\bcidr\b|\bvlsm\b/i.test(w) && about(/link-state|ospf|advantage/i)) {
    return `**${choice}** cites classless addressing (CIDR/VLSM) support as the advantage.`
  }
  if (/share (?:the )?topology database (?:among|with) all routers|link-state database of all routers/i.test(w) && about(/link-state|ospf|topology/i)) {
    return `**${choice}** describes one topology database shared across all routers.`
  }
  if (/lowest cost|highest cost/i.test(w) && about(/longest|prefix|overlapping|route selected/i)) {
    return `**${choice}** picks a route based on metric/cost.`
  }
  if (/(?:highest|lowest) ad\b/i.test(w)) {
    return `**${choice}** picks a route based on administrative distance.`
  }
  if (/dynamic routing|distance-vector routing|link-state routing/i.test(w) && about(/administrator intervention|manual|static rout/i)) {
    return `**${choice}** names a routing method that reconverges automatically.`
  }
  if (/static rout|directly connected/i.test(w) && about(/no administrator intervention|automatically|dynamic rout/i)) {
    return `**${choice}** names a route type that is either manually configured or only ever locally attached.`
  }
  if (/dynamic route|ospf route|rip route|eigrp route/i.test(w) && about(/default route|routing table|marked|s\*/i)) {
    return `**${choice}** names a dynamically learned route type.`
  }
  if (/proxy arp/i.test(w) && about(/vrrp|glbp|hsrp|fhrp|first.?hop|gateway/i)) {
    return `**${choice}** names Proxy ARP, a Layer 2 mechanism rather than a first-hop redundancy protocol.`
  }
  if (/0c07/i.test(w) && about(/hsrp|mac address/i)) {
    return `**${choice}** points at the fixed HSRP virtual-MAC vendor prefix instead of the group field.`
  }
  if (/^\d{1,3}$/.test(w.trim()) && about(/administrative distance|\bad\b/i)) {
    return `**${choice}** states a specific administrative-distance number.`
  }
  if (/^\d{2,3}$/.test(w.trim()) && about(/hsrp|priority/i)) {
    return `**${choice}** states a specific HSRP priority value.`
  }
  if (/^egp$/i.test(w.trim()) && about(/interior gateway|nonproprietary|administrative unit/i)) {
    return `**${choice}** names an obsolete exterior routing protocol, not an interior gateway protocol.`
  }
  if (/^autonomous system router$/i.test(w.trim()) && about(/ospf hierarchy|asbr/i)) {
    return `**${choice}** drops "boundary" from the OSPF router-role term.`
  }
  if (/^autonomous system routers?$|^autonomous system boundary routers?$/i.test(w.trim()) && about(/multi-area|area border/i)) {
    return `**${choice}** names a different OSPF router role than the one connecting two internal areas.`
  }
  if (/ospf is a distance-vector protocol|ospf performs default auto-summarization/i.test(w) && about(/ospf/i)) {
    return `**${choice}** describes a distance-vector trait, not OSPF's actual link-state behavior.`
  }
  if (/^the highest mac address configured on the router$/i.test(w.trim()) && about(/router id|\brid\b/i)) {
    return `**${choice}** substitutes MAC address for the IP address OSPF RID selection actually uses.`
  }
  if (/two routers participating in ospf routing|two routers that share the same as number/i.test(w) && about(/ospf link/i)) {
    return `**${choice}** describes a neighbor relationship, not the interface-level OSPF link.`
  }
  if (/^the topological database$/i.test(w.trim()) && about(/hello packets|neighborship/i)) {
    return `**${choice}** names the LSDB, not the Hello-based neighbor table this stem asks about.`
  }
  if (/used in routing to determine the destination network|the router uses its subnet mask when routing a packet|checks the subnet mask on the packet/i.test(w) && about(/subnet mask/i)) {
    return `**${choice}** misassigns the subnet mask's use to the router or the packet itself instead of the sending host.`
  }
  if (/^igmp$|^rarp$|^icmp$/i.test(w.trim()) && about(/mac address for the frame/i)) {
    return `**${choice}** names a protocol that doesn't do IP-to-MAC address resolution.`
  }
  if (/source mac address is changed to the original source mac address|all of the above/i.test(w) && about(/moves through a router|packet.s ttl/i)) {
    return `**${choice}** either restores the original sender's MAC (routers don't) or overclaims with "all of the above."`
  }
  if (/process switching|fast switching|intelligent packet forwarding/i.test(w) && about(/cisco express forwarding|packet forwarding/i)) {
    return `**${choice}** names an older or made-up forwarding method, not Cisco's current default.`
  }
  if (/^ip routing$|^packet hopping$/i.test(w.trim()) && about(/frame rewrite|layer 2/i)) {
    return `**${choice}** names the Layer 3 process or a non-standard term, not the Layer 2 rewrite this stem asks about.`
  }
  if (/layer 2 asics?|route tables?|frame filters?/i.test(w) && about(/qos|classify/i)) {
    return `**${choice}** names a mechanism that isn't how routers classify traffic for QoS.`
  }
  if (/^bandwidth$|^delay$|^loss$/i.test(w.trim()) && about(/jitter|consecutive packet/i)) {
    return `**${choice}** names a different QoS metric than packet-to-packet timing variation.`
  }
  if (/layer 3 field|present from end to end|is 6 bits/i.test(w) && about(/class of service|802\.1q/i)) {
    return `**${choice}** misstates the CoS field's layer, persistence, or bit width.`
  }
  if (/^bandwidth$|^delay$|^jitter$/i.test(w.trim()) && about(/loss|discarded due to congestion/i)) {
    return `**${choice}** names a different QoS dimension than dropped packets.`
  }
  if (/dscp af 4[013]|dscp af 11|dscp af 00/i.test(w) && about(/dscp ef|highest priority/i)) {
    return `**${choice}** names an Assured Forwarding class, which ranks below EF.`
  }
  if (/^cbwfq$|^fifo$|^cir$/i.test(w.trim()) && about(/llq|priority over all other queues/i)) {
    return `**${choice}** names a different queuing method or an unrelated QoS term, not the strict-priority queue.`
  }
  if (/^llq$|^cbwfq$|^fifo$/i.test(w.trim()) && about(/policing|queue starvation/i)) {
    return `**${choice}** names a queuing mechanism, not the traffic-conditioning method that combats starvation.`
  }
  if (/cause jitter|adhere to the speed/i.test(w) && about(/shaping/i)) {
    return `**${choice}** names the wrong side effect or blurs shaping with policing.`
  }
  if (/^llq$|^fifo$|^pq$/i.test(w.trim()) && about(/cbwfq|round-robin scheduler/i)) {
    return `**${choice}** names a different queuing method that doesn't round-robin.`
  }
  if (/holds packets in the queue over the configured bit rate to cause delay|holds packets in the queue over the configured bit rate to cause jitter|slows packets in the queue over the configured bit rate/i.test(w) && about(/policing/i)) {
    return `**${choice}** describes shaping's buffering behavior instead of policing's drop behavior.`
  }
  if (/help police lan applications|help police wan applications|maintain a contracted burst rate/i.test(w) && about(/policing|contracted cir/i)) {
    return `**${choice}** names the wrong traffic scope or the wrong contracted metric.`
  }
  if (/^af31 marked traffic has a better queue than af41 marked traffic$/i.test(w.trim()) && about(/assured forwarding|af4|af3/i)) {
    return `**${choice}** reverses the Assured Forwarding class-number priority order.`
  }
  if (/logging (?:server|debugging)\s*\d*|log-level/i.test(w) && about(/syslog|logging|trap/i)) {
    return `**${choice}** uses invalid or mismatched IOS syslog command syntax.`
  }
  if (/logging timestamps log datetime|logging timestamps datetime|service datetime timestamps/i.test(w) && about(/timestamps|syslog/i)) {
    return `**${choice}** reorders the timestamp command's keywords or uses the wrong verb.`
  }
  if (/config-line\)#logging level \d|config\)#logging console 7/i.test(w) && about(/console logging|severity/i)) {
    return `**${choice}** uses the wrong config mode, keyword, or severity number for console logging.`
  }
  if (/config\)#logging 1$|config\)#logging buffered 2|config\)#logging 2$/i.test(w) && about(/logging buffered|ram/i)) {
    return `**${choice}** drops the \`buffered\` keyword or specifies the wrong severity number.`
  }
  if (/^show commands$|^show log$|^show buffer$/i.test(w.trim()) && about(/show history|previously entered/i)) {
    return `**${choice}** is not a real IOS command or shows a different kind of log, not command history.`
  }
  if (/^informational \(6\)$|^warnings \(4\)$|^debugging \(7\)$/i.test(w.trim()) && about(/notifications|syslog configuration/i)) {
    return `**${choice}** names a different syslog severity level than the one the excerpt keys to.`
  }
  if (/^show cpu$|^show cpu-stats$|^show environment cpu$/i.test(w.trim()) && about(/cpu utilization/i)) {
    return `**${choice}** is not a real IOS command for checking CPU utilization.`
  }
  if (/config\)#logging internal|config\)#logging ram|config\)#logging console/i.test(w) && about(/logging buffered|internal log space/i)) {
    return `**${choice}** invents a keyword IOS doesn't have or directs logs to a different destination than RAM.`
  }
  if (/^tty$|^nvram$/i.test(w.trim()) && about(/default destination|syslog messages/i)) {
    return `**${choice}** names a destination or storage type that isn't the default syslog target.`
  }
  if (/^notification \(5\)$|^informational \(6\)$|^warning \(4\)$/i.test(w.trim()) && about(/default level|facility logging/i)) {
    return `**${choice}** names a more restrictive severity level than the actual default.`
  }
  if (/ntp (?:server|clock source|trusted)/i.test(w) && about(/\bntp\b/i)) {
    return `**${choice}** names a different (or non-existent) NTP configuration command.`
  }
  if (/^show ntp$|^show time$|^show time source$/i.test(w.trim()) && about(/show clock detail|ntp sync/i)) {
    return `**${choice}** is not a real IOS command for checking NTP sync state.`
  }
  if (/^show clock detail$|^show ntp detail$|^show ntp skew$/i.test(w.trim()) && about(/ntp associations/i)) {
    return `**${choice}** checks local clock authority or isn't a real command, not the per-server association details.`
  }
  if (/^show ntp$|^debug ntp messages$/i.test(w.trim()) && about(/debug ntp packets/i)) {
    return `**${choice}** shows static state or uses the wrong debug keyword, not a live packet exchange.`
  }
  if (/configure all devices as master servers/i.test(w) && about(/ntp best practice|time source/i)) {
    return `**${choice}** would create multiple unsynchronized authoritative clocks instead of a consistent hierarchy.`
  }
  if (/^show ntp$|^debug ntp drift$/i.test(w.trim()) && about(/ntp status|time drift/i)) {
    return `**${choice}** isn't a complete/real command or isn't how drift is actually checked.`
  }
  if (/clock timezone pacific|timezone pacific|timezone pst -8/i.test(w) && about(/clock timezone/i)) {
    return `**${choice}** drops the \`clock\` keyword, uses an unrecognized name, or omits the numeric offset.`
  }
  if (/^tunnel interface$|^ntp interface$/i.test(w.trim()) && about(/loopback|ntp resilien/i)) {
    return `**${choice}** depends on other infrastructure or isn't a real interface type.`
  }
  if (/ntp loopback 0|ntp master loopback 0|ntp clock loopback 0/i.test(w) && about(/ntp source/i)) {
    return `**${choice}** drops the \`source\` keyword or substitutes the wrong one.`
  }
  if (/config\)#clock set|^router#clock \d/i.test(w) && about(/clock set/i)) {
    return `**${choice}** runs the command from the wrong mode, drops the \`set\` keyword, or reorders day/month.`
  }
  if (/reversed to another dns server|without asking another dns server/i.test(w) && about(/dns|reverse lookup/i)) {
    return `**${choice}** describes DNS server behavior rather than what a reverse lookup actually is.`
  }
  if (/\ba record\b/i.test(w) && about(/dns|record|ptr/i)) {
    return `**${choice}** names the A record, which maps a name to an address — the opposite direction.`
  }
  if (/^the cname record$|^the aaaa record$/i.test(w.trim()) && about(/ptr record/i)) {
    return `**${choice}** aliases a name or holds an IPv6 address, not the address-to-name mapping this stem asks about.`
  }
  if (/^the dns zone$|^the host header$|^the hostname ptr record$/i.test(w.trim()) && about(/hostname queries|dns resolution/i)) {
    return `**${choice}** names a different DNS concept than the appended suffix.`
  }
  if (/^dns$|^ptr records$|^llmnr$/i.test(w.trim()) && about(/most secure|name resolution/i)) {
    return `**${choice}** relies on network resolution, which introduces an attack surface static entries don't have.`
  }
  if (/^the cname record$|^the ptr record$|^the aaaa record$/i.test(w.trim()) && about(/holds the ipv4/i)) {
    return `**${choice}** doesn't hold an IPv4 address the way an A record does.`
  }
  if (/^soa$/i.test(w.trim()) && about(/dns cache|ttl/i)) {
    return `**${choice}** holds zone-administration data, not a per-record cache expiry.`
  }
  if (/^default of 5 minutes$/i.test(w.trim()) && about(/dns cache|ttl/i)) {
    return `**${choice}** assumes a fixed universal timeout that doesn't actually exist in DNS.`
  }
  if (/^layer 3 unicast$/i.test(w.trim()) && about(/dhcp|acquire an ip address/i)) {
    return `**${choice}** isn't possible before the client has an IP address to unicast from.`
  }
  if (/one-quarter of the lease|seven-eighths of the lease|end of the lease/i.test(w) && about(/dhcp lease|renewal/i)) {
    return `**${choice}** states a fraction that doesn't match the DHCP T1 renewal default.`
  }
  if (/dhcp uses multicasting between the client and server|the dhcp lease is negotiated between client and server/i.test(w) && about(/dhcp process/i)) {
    return `**${choice}** names the wrong transport or misplaces where lease tracking happens.`
  }
  if (/^rarp$/i.test(w.trim()) && about(/dhcp|transport protocol/i)) {
    return `**${choice}** is a separate address-resolution protocol, not DHCP's transport.`
  }
  if (/the dhcp server will halt/i.test(w) && about(/duplicate ip address/i)) {
    return `**${choice}** overstates the impact of one address conflict.`
  }
  if (/\bcidr\b|classful addressing|\bvpn\b/i.test(w) && about(/nat|rfc 1918|private address/i)) {
    return `**${choice}** names a different addressing or tunneling concept, not address translation.`
  }
  if (/setting the (?:time and date|key strength|key repository)/i.test(w) && about(/ssh|encryption keys/i)) {
    return `**${choice}** names a setting that isn't required before SSH key generation.`
  }
  if (/snmp version [12]\w*/i.test(w) && about(/snmp/i)) {
    return `**${choice}** names an SNMP version that only supports cleartext community strings.`
  }
  if (/archive tftp|copy server:/i.test(w) && about(/tftp|restore|configuration/i)) {
    return `**${choice}** uses the wrong command keyword or source alias for a TFTP config restore.`
  }
  if (/copy tftp ios/i.test(w) && about(/tftp|ios|upgrade|flash/i)) {
    return `**${choice}** invents a destination keyword IOS doesn't use for an image copy.`
  }
  if (/\bciaddr\b|\bsiaddr\b|\bchaddr\b/i.test(w) && about(/dhcp|giaddr|relay/i)) {
    return `**${choice}** names a different DHCP header field than the relay-agent address.`
  }
  if (/vlan traversal|denial of service/i.test(w) && about(/native vlan|double tagging|vlan attack/i)) {
    return `**${choice}** names a different Layer 2 attack category than the native-VLAN double-tagging exploit.`
  }
  if (/dhcp (?:snooping )?trust/i.test(w) && about(/dhcp snooping/i)) {
    return `**${choice}** uses the wrong keyword or configuration mode for the DHCP snooping trust command.`
  }
  if (/show interface|show security/i.test(w) && about(/port-security|port security/i)) {
    return `**${choice}** names a different (or non-existent) diagnostic command than \`show port-security\`.`
  }
  if (/dynamic vlans?|\bacls?\b|vlan pruning|wired equivalent privacy|static mac addresses/i.test(w) && about(/port security|plugging|access point|rogue/i)) {
    return `**${choice}** names a control that solves a different problem than restricting which MAC addresses may use an access port.`
  }
  if (/switchport port-security(?! maximum)/i.test(w) && about(/port security/i) && /config\)#/i.test(w) && !/config-if\)#/i.test(w)) {
    return `**${choice}** applies the port-security command at global config mode instead of the interface.`
  }
  if (/port-security enable/i.test(w) && about(/port security/i)) {
    return `**${choice}** invents a \`port-security enable\` keyword IOS doesn't have.`
  }
  if (/^\d+ mac addresses?$/i.test(w.trim()) && about(/port security|maximum/i)) {
    return `**${choice}** states a specific default MAC-address maximum for port security.`
  }
  if (/^layer 0$|^layer 1$/i.test(w) && about(/port security/i)) {
    return `**${choice}** names an OSI layer without MAC addressing.`
  }
  if (/to allow or disallow vlans|to prevent unauthorized access by users/i.test(w) && about(/port security/i)) {
    return `**${choice}** describes a different control than MAC-address filtering.`
  }
  if (/mobile environments|higher amount of memory|admin intervention to reset/i.test(w) && about(/port security/i)) {
    return `**${choice}** overstates a cost or misdescribes the environment port security fits best.`
  }
  if (/no switchport dynamic|no dynamic/i.test(w) && about(/dynamic port|nonnegotiate|port-security/i)) {
    return `**${choice}** invents an IOS command that doesn't exist for clearing a dynamic port.`
  }
  if (/switchport maximum \d|port-security maximum \d/i.test(w) && about(/port security|maximum/i)) {
    return `**${choice}** drops part of the required \`switchport port-security maximum\` keyword chain.`
  }
  if (/1 to 100\b|100 to 199|100 to 200/i.test(w) && about(/access list|acl|standard/i)) {
    return `**${choice}** states a numeric range that overlaps or misstates the standard-ACL boundary.`
  }
  if (/^1 to 99$/i.test(w.trim()) && about(/extended acl|access list/i)) {
    return `**${choice}** states the standard-ACL range instead of the extended-ACL range this stem asks about.`
  }
  if (/^log all$|^end of acl marker$/i.test(w) && about(/acl/i)) {
    return `**${choice}** names something that isn't a real automatic ACL end-of-list behavior.`
  }
  if (/last matching condition is the action taken|if no matching rule exists, they are allowed|implicit allow/i.test(w) && about(/access list|acl/i)) {
    return `**${choice}** reverses ACL matching order or the implicit deny at the end of the list.`
  }
  if (/more secure|more specific rules|blocking of applications/i.test(w) && about(/standard acl/i)) {
    return `**${choice}** describes an extended-ACL strength, not a standard-ACL advantage.`
  }
  if (/^1000 to 1999$|^1100 to 1299$|^2000 to 2699$/i.test(w.trim()) && about(/standard access list|expanded/i)) {
    return `**${choice}** states a range that overlaps the extended-ACL numbering rather than the standard-ACL expanded range.`
  }
  if (/defining the broadcast address|defining no addresses|defining the network address/i.test(w) && about(/wildcard/i)) {
    return `**${choice}** misreads a fully-wildcarded ACL rule as excluding or narrowing addresses instead of matching all of them.`
  }
  if (/^standard$|^dynamic$|^expanded$/i.test(w.trim()) && about(/filter an application|extended acl/i)) {
    return `**${choice}** names an ACL type that can't match on application/port the way this stem needs.`
  }
  if (/^1000 to 1999$|^1100 to 1299$|^1300 to 1999$/i.test(w.trim()) && about(/extended access list|expanded/i)) {
    return `**${choice}** states a range that doesn't match the extended-ACL expanded numbering.`
  }
  if (/^standard$|^dynamic$|^extended$/i.test(w.trim()) && about(/named acl|removing a single entry/i)) {
    return `**${choice}** names a numbered ACL type that can't remove a single entry without rebuilding the list.`
  }
  if (/^standard$|^extended$|^named$/i.test(w.trim()) && about(/dynamic acl|successfully logged into/i)) {
    return `**${choice}** names a static ACL type that doesn't react to a login event.`
  }
  if (/source address and source port/i.test(w) && about(/standard acl|access list/i)) {
    return `**${choice}** adds port-matching to a standard ACL, which only extended ACLs can do.`
  }
  if (/password enable|(?:^|#)enable \S+!?$|secret enable/i.test(w) && about(/enable secret|enable password/i)) {
    return `**${choice}** reorders or drops a required keyword in the enable-secret command.`
  }
  if (/interface vlan/i.test(w) && about(/line vty|telnet|login password/i)) {
    return `**${choice}** configures an SVI rather than the VTY lines a login password needs.`
  }
  if (/line console|line aux/i.test(w) && about(/line vty|telnet/i)) {
    return `**${choice}** configures a local-access line, not the VTY lines Telnet/SSH sessions use.`
  }
  if (/originally entered the wrong password|contains a special character|too long and has been truncated/i.test(w) && about(/enable secret|enable password/i)) {
    return `**${choice}** blames user error or password formatting rather than enable-secret/enable-password precedence.`
  }
  if (/set password.*request login|login password\b.*password/i.test(w.replace(/\s+/g, ' ')) && about(/line password|login|vty/i)) {
    return `**${choice}** invents keywords or reorders them into line-password syntax IOS rejects.`
  }
  if (/the enable secret is not set|the enable password is not set|line is administratively down/i.test(w) && about(/login password|vty|telnet/i)) {
    return `**${choice}** points at a setting unrelated to the actual "password required, but none set" cause.`
  }
  if (/config-line\)#version 2|config-ssh\)#version 2|config\)#ssh version 2/i.test(w) && about(/ssh version|ip ssh/i)) {
    return `**${choice}** applies the SSH version command in the wrong mode or drops the required \`ip\` keyword.`
  }
  if (/ssh allows for file copy|easier to create acls/i.test(w) && about(/ssh|telnet/i)) {
    return `**${choice}** names a true SSH feature that isn't the reason it replaces Telnet.`
  }
  if (/time and date need to be corrected|dns server is not configured|no host record/i.test(w) && about(/ssh|key strength|encryption keys/i)) {
    return `**${choice}** names a prerequisite for generating SSH keys, not for enabling SSHv2 once keys already exist.`
  }
  if (/config\)#account |config\)#user \S+ |config\)#user-account /i.test(w) && about(/username|local user|ssh access/i)) {
    return `**${choice}** invents a keyword or mode IOS doesn't use for creating a local user.`
  }
  if (/generate crypto key rsa|crypto generate key rsa|^router#crypto key generate rsa/i.test(w) && about(/crypto key|encryption keys/i)) {
    return `**${choice}** reorders the crypto-key keywords or runs the command from the wrong prompt.`
  }
  if (/config\)#exec-timeout 0$|config-line\)#timeout 0 0|no exec-timeout/i.test(w) && about(/exec-timeout|idle|timeout/i)) {
    return `**${choice}** is missing an argument, uses the wrong keyword, or applies exec-timeout at the wrong level.`
  }
  if (/^console 0$/i.test(w) && about(/show users|vty/i)) {
    return `**${choice}** names the local console line instead of a remote VTY session.`
  }
  if (/gre uses ipsec|gre uses a protocol of|gre provides per-packet authentication/i.test(w) && about(/gre|tunnel/i)) {
    return `**${choice}** attributes encryption, authentication, or a protocol number to GRE that it doesn't actually have.`
  }
  if (/^ppp$|\bl2tp\b|^ipsec$|^ssl$/i.test(w) && about(/gre|tunnel protocol/i)) {
    return `**${choice}** names a different tunnel-related protocol than the one this stem asks about.`
  }
  if (/^protocol 4$|^protocol 43$|^protocol 57$/i.test(w.trim()) && about(/gre/i)) {
    return `**${choice}** states an IP protocol number other than GRE's actual 47.`
  }
  if (/^mtu 149\d$|^mtu 1500$|^mtu 1528$/i.test(w.trim()) && about(/gre|tunnel/i)) {
    return `**${choice}** states an MTU that doesn't account for the GRE header's 24-byte overhead.`
  }
  if (/^two hops$|^four hops$|^zero hops$/i.test(w.trim()) && about(/gre|tunnel/i)) {
    return `**${choice}** counts the underlying physical path instead of the tunnel's single logical hop.`
  }
  if (/^hsrp$|^arp$/i.test(w.trim()) && about(/dmvpn|nhrp/i)) {
    return `**${choice}** names a different protocol that doesn't resolve NBMA-to-tunnel addresses.`
  }
  if (/point-to-point|full-mesh|dual-homed/i.test(w) && about(/dmvpn/i)) {
    return `**${choice}** names a topology DMVPN isn't built around.`
  }
  if (/^authentication$|^anti-replay$|^confidentiality$/i.test(w.trim()) && about(/data integrity|tampered/i)) {
    return `**${choice}** names a different VPN security property that doesn't detect tampering.`
  }
  if (/catalyst switches|cisco routers|policy-based routing/i.test(w) && about(/cisco ftd|vpn tunnels/i)) {
    return `**${choice}** names a different Cisco technology than the one this stem asks about.`
  }
  if (/^dmz$|^internal$|^trusted$/i.test(w) && about(/perimeter|firewall|security zone/i)) {
    return `**${choice}** names a different network security zone than the outward-facing perimeter.`
  }
  if (/^authenticator$|^aaa server$|^radius server$/i.test(w) && about(/802\.1x|supplicant/i)) {
    return `**${choice}** names a different role in the 802.1X exchange than the credential-sending device.`
  }
  if (/creation of a psk|192-bit key strength/i.test(w) && about(/wpa2-enterprise|wpa3|802\.1x/i)) {
    return `**${choice}** describes a WPA2-Personal or WPA3 trait, not the WPA2-Enterprise requirement this stem asks about.`
  }
  if (/^aes$/i.test(w) && about(/mic|integrity|replay/i)) {
    return `**${choice}** names the encryption cipher, not the integrity-check mechanism this stem asks about.`
  }
  if (/anti-?malware software|antivirus software|certificates/i.test(w) && about(/phishing|social engineering/i)) {
    return `**${choice}** names a technical control that doesn't address the human-judgment gap phishing exploits.`
  }
  if (/^certificate$|^smart card$|^license$/i.test(w) && about(/token|multi-?factor|second factor/i)) {
    return `**${choice}** names a different (though related) authentication artifact than the one keyed here.`
  }
  if (/three tier|collapsed core|san fabric/i.test(w) && about(/spine\/leaf|controller-based|architecture/i)) {
    return `**${choice}** names a different (often legacy) network architecture than Spine/Leaf.`
  }
  if (/leaf switches connect to other leaf|one spine switch per network|spine switches provide access to hosts/i.test(w) && about(/spine\/leaf/i)) {
    return `**${choice}** misstates a Spine/Leaf topology rule (leaf-to-leaf links, spine count, or host attachment).`
  }
  if (/leaf to leaf to spine|spine to leaf to spine|^leaf to leaf$/i.test(w) && about(/spine\/leaf/i)) {
    return `**${choice}** routes traffic through a hop the Spine/Leaf topology doesn't have.`
  }
  if (/apic-em|opendaylight|sd-wan|prime infrastructure|open ?sdn|open ?stack/i.test(w) && about(/cisco aci|data center|sdn solution/i)) {
    return `**${choice}** names a different Cisco or open-source SDN offering built for a different use case.`
  }
  if (/spine\/leaf|\bclos\b|\bsdn\b/i.test(w) && about(/campus|distribution layer/i)) {
    return `**${choice}** names a two-tier data-center design, not the three-tier campus model with a distribution layer.`
  }
  if (/data plane|management plane|switch plane|control plane|configuration plane/i.test(w) && about(/spanning tree|\bstp\b|syslog|network plane|web interface|acls/i)) {
    return `**${choice}** names a network plane that doesn't match the function this stem describes.`
  }
  if (/^4 hops$|^5 hops$/i.test(w.trim()) && about(/fabric switching|hop count/i)) {
    return `**${choice}** states a hop count higher than a Spine/Leaf fabric's maximum path length.`
  }
  if (/^overlay$|^tunnel$|^leaf$/i.test(w.trim()) && about(/underlay|\bmtu\b/i)) {
    return `**${choice}** names the logical/virtual layer, not the physical underlay this MTU setting applies to.`
  }
  if (/^vxlan$|^vlan$|^ecmp$/i.test(w.trim()) && about(/dmvpn|remote offices/i)) {
    return `**${choice}** names a different overlay/tunneling or load-balancing mechanism, not the WAN site-interconnect technology.`
  }
  if (/^ecmp$|^dmvpn$|^eigrp$/i.test(w.trim()) && about(/vxlan|layer 2 traffic over a layer 3/i)) {
    return `**${choice}** doesn't tunnel Layer 2 frames inside Layer 3 the way VXLAN does.`
  }
  if (/^cdp$|^icmp$|^vtp$/i.test(w.trim()) && about(/snmp|management plane/i)) {
    return `**${choice}** names a control-plane or diagnostic protocol, not a management-plane one.`
  }
  if (/^ospf$|^mpls$|^clos$/i.test(w.trim()) && about(/ecmp|next-hop packet forwarding/i)) {
    return `**${choice}** names a routing protocol, label technology, or topology name, not the ECMP forwarding mechanism.`
  }
  if (/network management station|software-defined networking|centralized logging/i.test(w) && about(/ansible|chef|puppet|configuration management/i)) {
    return `**${choice}** names a different network-operations category than configuration management.`
  }
  if (/cisco dna center|^chef$|^puppet$/i.test(w) && about(/ansible|yaml/i)) {
    return `**${choice}** names a tool that doesn't use YAML playbooks the way Ansible does.`
  }
  if (/^playbook$|^settings$|^modules$/i.test(w.trim()) && about(/inventory|ansible/i)) {
    return `**${choice}** names a different Ansible component than the one holding connection details.`
  }
  if (/^agent$|^class$|^module$/i.test(w.trim()) && about(/manifest|puppet/i)) {
    return `**${choice}** names a different Puppet building block than the manifest.`
  }
  if (/^cookbook$|^crock pot$|^chef node$/i.test(w.trim()) && about(/recipe|chef/i)) {
    return `**${choice}** names a different Chef concept than the recipe file itself.`
  }
  if (/^chef-client$|^chef workstation$|^knife$/i.test(w.trim()) && about(/ohai|chef/i)) {
    return `**${choice}** names a different Chef component than the one that collects system state.`
  }
  if (/^ansible_settings$|^ansible_connection$|^\/etc\/ansible\/hosts$/i.test(w.trim()) && about(/ansible_config/i)) {
    return `**${choice}** names a different (or made-up) variable/path name.`
  }
  if (/^man$|^cat$|^ad-hoc$/i.test(w.trim()) && about(/ansible-doc/i)) {
    return `**${choice}** names a generic shell command or different feature, not Ansible's docs command.`
  }
  if (/^knife interface$|^ansible_playbook command$|^ansible tower$/i.test(w.trim()) && about(/ad-hoc interface/i)) {
    return `**${choice}** names a different tool than the no-playbook quick-command interface.`
  }
  if (/^resource$|^class$|^module$/i.test(w.trim()) && about(/facts|puppet/i)) {
    return `**${choice}** names a different Puppet building block than the global node-info variables.`
  }
  if (/^chef workstation$|^chef node$|^chef-client$/i.test(w.trim()) && about(/bookshelf|cookbook/i)) {
    return `**${choice}** names a different Chef component, not where cookbooks are stored.`
  }
  if (/^ansible$/i.test(w.trim()) && about(/ansible tower|rbac|central management/i)) {
    return `**${choice}** names plain Ansible, which doesn't include the RBAC/central-management layer this stem asks about.`
  }
  if (/^python$/i.test(w.trim()) && about(/easy configuration of cisco network devices/i)) {
    return `**${choice}** names the language Ansible modules are written in, not the config-management tool itself.`
  }
  if (/storage of the bookshelf|storage of the configuration of chef|client-side agent/i.test(w) && about(/knife|cli utility/i)) {
    return `**${choice}** misassigns Knife's job to storage or the client-side agent instead.`
  }
  if (/iaas helps maintain configuration|prevents drift with ntp|requires per-host licensing/i.test(w) && about(/idempotence|configuration drift|iac/i)) {
    return `**${choice}** confuses configuration management with a different service model, protocol, or licensing claim.`
  }
  if (/^yaml$|^csv$|^xml$/i.test(w.trim()) && about(/custom ansible module/i)) {
    return `**${choice}** names a data/markup format, not the language Ansible modules are written in.`
  }
  if (/user interface layout|source code of the device|data storage of the device/i.test(w) && about(/api reference|automation script/i)) {
    return `**${choice}** isn't something an automation script interacts with directly.`
  }
  if (/^cli$|^syslog$/i.test(w) && about(/snmp|automation script|retrieves information/i)) {
    return `**${choice}** names a human-oriented or one-way mechanism, not a structured, machine-queryable interface.`
  }
  if (/^syslog$|^ssh$/i.test(w) && about(/netconf|yang|replacement for snmp/i)) {
    return `**${choice}** names a different management/transport protocol than NETCONF.`
  }
  if (/^snmp$/i.test(w) && about(/netconf|yang data model/i)) {
    return `**${choice}** uses MIBs/OIDs, not the YANG data model this stem asks about.`
  }
  if (/^snmp$|^syslog$/i.test(w) && about(/restconf|https transport/i)) {
    return `**${choice}** doesn't use HTTPS as its transport the way RESTCONF does.`
  }
  if (/^snmp$|^sntp$|^soap$/i.test(w) && about(/rest apis|http/i)) {
    return `**${choice}** names a protocol that isn't REST's actual HTTP transport.`
  }
  if (/pass the username and password in every request|send a get to the api for an auth token|create a public private key pair/i.test(w) && about(/authentication token|dna center/i)) {
    return `**${choice}** either resends credentials repeatedly or uses the wrong verb/mechanism for token-based auth.`
  }
  if (/^memory cleanup$|^data encoding$/i.test(w) && about(/crud/i)) {
    return `**${choice}** is unrelated to what CRUD actually stands for.`
  }
  if (/^ad integrated$|^ssl$|^pass-through$/i.test(w) && about(/basic authentication|token requests|dna center/i)) {
    return `**${choice}** names an authentication mechanism DNA Center doesn't use for this token request.`
  }
  if (/add it as a variable named x-auth-token|pass the token in the uri/i.test(w) && about(/x-auth-token|header/i)) {
    return `**${choice}** doesn't actually transmit the token to the server correctly.`
  }
  if (/^ssl$|^aaa$|^basic$/i.test(w.trim()) && about(/base64|x-auth-token/i)) {
    return `**${choice}** names a different mechanism than the Base64 encoding used here.`
  }
  if (/^openflow$/i.test(w) && about(/restconf|yang data model/i)) {
    return `**${choice}** is a southbound flow-table protocol, not a YANG-based config API.`
  }
  if (/format your response correctly|authenticate to the device first|nothing; this code means ok/i.test(w) && about(/500 status code|rest-based service/i)) {
    return `**${choice}** treats a server-side (500) error as if it were a client-side problem.`
  }
  if (/northbound interface|eastbound interface/i.test(w) && about(/restconf|southbound/i)) {
    return `**${choice}** names the wrong side of the SDN controller for a device-facing RESTCONF call.`
  }
  if (/openflow|cisco prime infrastructure|cisco sd-wan|^ssh$|^https$|^netconf$/i.test(w) && about(/cisco dna center|apic-em|dna discovery/i)) {
    return `**${choice}** names a different Cisco platform or a protocol DNA Center's discovery process handles differently.`
  }
  if (/^design$|^policy$|^provision$|^assurance$|^platform$/i.test(w.trim()) && about(/cisco dna center/i)) {
    return `**${choice}** names a different DNA Center GUI section than the one this stem asks about.`
  }
  if (/ip-based access control|group-based access control/i.test(w) && about(/plug and play|dna command runner|dna center/i)) {
    return `**${choice}** names a DNA Center access-policy feature, not the one this stem asks about.`
  }
  if (/easy-qos|system 360|cisco ise/i.test(w) && about(/sd-access|fabric/i)) {
    return `**${choice}** names a different DNA Center/Cisco capability than fabric automation.`
  }
  if (/client coverage heat maps|client triangulation support|application health/i.test(w) && about(/prime infrastructure|device configuration backup/i)) {
    return `**${choice}** names a capability DNA Center's Assurance already provides, not the gap this stem asks about.`
  }
  if (/^definition$|^lists$|^keys$|hashbang preprocessor/i.test(w) && about(/yaml/i)) {
    return `**${choice}** names a different YAML element or file-marker convention.`
  }
  if (/curly brackets|square brackets/i.test(w) && about(/yaml file/i)) {
    return `**${choice}** describes JSON's bracket delimiters, not YAML's three-dash marker.`
  }
  if (/^yaml$|^json$|^csv$/i.test(w.trim()) && about(/resembles html|structured by white ?space/i)) {
    return `**${choice}** names a data format that structures itself differently than the one this stem asks about.`
  }
  if (/^three dashes$|^a square bracket$|^a double quote$/i.test(w.trim()) && about(/json file/i)) {
    return `**${choice}** names YAML's marker or a non-opening JSON character, not JSON's opening curly bracket.`
  }
  if (/the value that follows the square bracket is the value|the value is after the matching square bracket|the value is unknown/i.test(w) && about(/json file/i)) {
    return `**${choice}** misreads a JSON array marker as pointing to one specific value.`
  }
  if (/values can be used that contain spaces|multiple values for a particular key|read line by line for every value/i.test(w) && about(/json|csv/i)) {
    return `**${choice}** names a minor formatting detail, not JSON's real hierarchical advantage over CSV.`
  }
  if (/^csv$/i.test(w.trim()) && about(/rest-based api|dna center/i)) {
    return `**${choice}** names a flat tabular format REST APIs don't typically return.`
  }
  if (/decreased problems|increased throughput|increased complexity|always in the form of hardware appliances/i.test(w) && about(/controller-based networking/i)) {
    return `**${choice}** makes a claim controller-based networking doesn't specifically guarantee.`
  }
  if (/increase the possibility for misconfiguration|decrease problems from the new configuration|allow you to do less work|copy and paste scripts built in notepad\+\+/i.test(w) && about(/automate|automation/i)) {
    return `**${choice}** names a plausible-sounding but incorrect reason or method for automating device configuration.`
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
