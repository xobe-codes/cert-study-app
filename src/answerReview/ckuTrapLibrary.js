/**
 * Choice-specific wrong-answer resolvers — CKU traps, devices, numbers, protocols.
 */
import { CKU_TRAP_INDEX } from './ckuTrapIndex.js'

const DEVICE_ROLES = [
  { re: /\bhub\b/i, role: 'A hub is a Layer 1 repeater — it does not learn MACs, segment broadcasts, or route between VLANs.', trap: 'Treating a hub like a switch or router' },
  { re: /\brepeater\b/i, role: 'A repeater only regenerates bits at Layer 1; it does not make forwarding decisions.', trap: 'Expecting Layer 1 gear to segment or route traffic' },
  { re: /\bcable modem\b/i, role: 'A cable modem connects a site to an ISP WAN — it is not an enterprise LAN switch or router for VLANs.', trap: 'Using WAN CPE where LAN switching/routing is required' },
  { re: /\bwireless lan controller only\b|\bwlc only\b/i, role: 'A WLC manages APs and WLAN policy — it does not replace a Layer 3 switch for inter-VLAN routing at line rate.', trap: 'Expecting a WLAN controller to do L3 inter-VLAN routing' },
  { re: /\baccess point only\b|\bstandalone ap\b/i, role: 'An AP bridges wireless to wired; inter-VLAN routing still needs a router or L3 switch.', trap: 'Using an AP as the inter-VLAN router' },
  { re: /\blayer 2 switch only\b|\bl2 switch only\b/i, role: 'A pure Layer 2 switch switches frames within VLANs but does not route between VLAN subnets without SVIs.', trap: 'Expecting L2-only switching to route between VLANs' },
  { re: /\brouter only\b/i, role: 'Routers route between IP networks; they are not the tool for MAC learning or VLAN access-port assignment.', trap: 'Using a router where switch/L2 behavior is required' },
  { re: /\bbridge\b/i, role: 'A legacy bridge operates at Layer 2 but modern CCNA scenarios expect a switch for MAC learning and VLANs.', trap: 'Picking legacy bridge terminology instead of switch behavior' },
  { re: /\bfirewall\b/i, role: 'Firewalls filter/policy traffic — they are not the default answer for basic L2 forwarding or VLAN trunk setup unless the stem is security-focused.', trap: 'Defaulting to firewall when the stem tests switching or routing mechanics' },
  { re: /\bspanning tree\b|\bstp\b/i, role: 'STP prevents Layer 2 loops — it does not provide inter-VLAN routing, MAC learning rules, or replace trunk configuration.', trap: 'Choosing STP when the question asks for forwarding, routing, or VLAN data plane behavior' },
  { re: /\betherchannel\b|\bport-channel\b/i, role: 'EtherChannel bundles links for bandwidth/redundancy — it is not inter-VLAN routing, MAC learning, or unknown-unicast flooding.', trap: 'Dragging link-aggregation into an unrelated L2/L3 behavior question' },
  { re: /\bport mirroring\b|\bspan\b/i, role: 'Port mirroring copies traffic for analysis — it does not change how frames are forwarded or routed.', trap: 'Confusing monitoring features with forwarding/routing behavior' },
]

const CHOICE_KEYWORD_RULES = [
  { wrongRe: /\bdrops?\b|\bdiscard/i, stemRe: /unknown|not in|mac address table/i, expl: 'Switches do not drop unknown unicast by default — they **flood** within the VLAN so the destination can be learned.', trap: 'Assuming unknown destination means drop/filter' },
  { wrongRe: /back to the source|echo/i, stemRe: /switch|frame|mac/i, expl: 'Ethernet switches do not echo frames back to the sender — unknown destinations are **flooded**, not returned.', trap: 'Confusing switch behavior with ping/reply thinking' },
  { wrongRe: /default gateway/i, stemRe: /switch|mac|frame|vlan/i, correctRe: /flood|forward|filter|mac/i, expl: 'Default-gateway forwarding is a **router** job for inter-subnet traffic, not how a switch handles an unknown MAC in the same VLAN.', trap: 'Applying default-gateway logic to a Layer 2 switch decision' },
  { wrongRe: /arp request/i, stemRe: /switch|forward|mac/i, expl: 'A switch forwards frames using MAC addresses — it does not originate ARP on behalf of every unknown unicast frame arrival.', trap: 'Expecting the switch to ARP before forwarding at Layer 2' },
  { wrongRe: /shutdown|err-disabled|blocking/i, stemRe: /forward|flood/i, expl: 'Blocking/shutdown describes STP port states or admin action — not the normal data-plane action for a received unicast frame.', trap: 'Mixing STP/admin port states with forwarding behavior' },
  { wrongRe: /inside local|inside global|outside local|outside global/i, stemRe: /nat|pat|translation/i, expl: 'NAT address types are fixed definitions — match the stem to the exact address role (who translates, who is local vs global).', trap: 'Swapping inside/outside or local/global NAT roles' },
  { wrongRe: /discover|offer|request|acknowledge/i, stemRe: /dhcp/i, expl: 'DHCP DORA order matters — identify which message the stem describes before picking a step.', trap: 'Misordering or mislabeling DHCP messages' },
  { wrongRe: /2\.4\s*ghz|5\s*ghz|6\s*ghz/i, stemRe: /wifi|wireless|802\.11/i, expl: 'Match band/channel choice to the scenario — overlap, range, and standard compatibility drive the right answer.', trap: 'Picking a band without matching range, overlap, or standard requirements' },
  { wrongRe: /wep\b/i, stemRe: /wireless|wifi|wpa|security/i, expl: 'WEP is deprecated and insecure — CCNA expects WPA2/WPA3 for real deployments.', trap: 'Choosing WEP for compatibility' },
  { wrongRe: /telnet\b/i, stemRe: /ssh|remote|secure|management/i, expl: 'Telnet sends credentials in cleartext — SSH is required for secure device management.', trap: 'Picking Telnet when secure management is required' },
  { wrongRe: /standard acl|extended acl/i, stemRe: /acl|access.?list/i, expl: 'Standard ACLs match source only and belong near the destination; extended ACLs match source/dest/protocol/port and belong near the source.', trap: 'Confusing standard vs extended ACL placement or match fields' },
  { wrongRe: /backup|bdr|dr\b/i, stemRe: /ospf|designated/i, expl: 'OSPF DR/BDR rules apply per multi-access segment — check network type and priority before assuming election results.', trap: 'Misapplying OSPF DR/BDR election rules' },
  { wrongRe: /eigrp|rip|bgp/i, stemRe: /ospf/i, expl: 'This question tests **OSPF** behavior — other IGPs use different metrics, messages, and configuration.', trap: 'Applying another routing protocol\'s rules to an OSPF question' },
  { wrongRe: /json|yaml|xml|rest|ansible|terraform|python/i, stemRe: /automation|controller|api|sdn/i, expl: 'Automation questions hinge on the tool/API named in the stem — do not swap REST, Ansible, or controller roles.', trap: 'Swapping automation tools or API styles' },
]

function tokenOverlap(a, b) {
  const ta = new Set(String(a).toLowerCase().split(/\W+/).filter(w => w.length > 3))
  const tb = new Set(String(b).toLowerCase().split(/\W+/).filter(w => w.length > 3))
  let n = 0
  for (const t of ta) if (tb.has(t)) n++
  return n
}

export function resolveFromCkuTraps(q, wrong) {
  const ids = q.ckuIds || []
  let best = null
  let bestScore = 0
  for (const ckuId of ids) {
    for (const entry of CKU_TRAP_INDEX[ckuId] || []) {
      const score = tokenOverlap(wrong, entry.trap) + tokenOverlap(wrong, entry.correction) * 0.5
      if (score > bestScore) {
        bestScore = score
        best = entry
      }
    }
  }
  if (best && bestScore >= 1) {
    return {
      explanation: `**${wrong}** reflects a common trap: ${best.trap} ${best.correction}`.trim(),
      trap: best.trap.replace(/\.$/, ''),
    }
  }
  return null
}

export function resolveDeviceMismatch(wrong) {
  for (const d of DEVICE_ROLES) {
    if (d.re.test(wrong)) {
      return { explanation: `**${wrong}** is the wrong device role here. ${d.role}`, trap: d.trap }
    }
  }
  return null
}

export function resolveKeywordRule(q, wrong) {
  const stem = q.question || ''
  const correct = q.choices?.[q.correctIndex] || ''
  for (const rule of CHOICE_KEYWORD_RULES) {
    if (!rule.wrongRe.test(wrong)) continue
    if (rule.stemRe && !rule.stemRe.test(stem)) continue
    if (rule.correctRe && !rule.correctRe.test(correct + ' ' + (q.explanation || ''))) continue
    return { explanation: rule.expl, trap: rule.trap }
  }
  return null
}

export function resolveNumericContrast(wrong, correctExpl) {
  const wNums = wrong.match(/\d+/g)
  const eNums = correctExpl.match(/\d+/g)
  if (!wNums?.length || !eNums?.length) return null
  const w = wNums[0]
  const e = eNums.find(n => n !== w) || eNums[0]
  if (w === e) return null
  return {
    explanation: `**${wrong}** uses the wrong value. The tested fact calls for **${e}** — not ${w}.`,
    trap: `Memorizing ${w} instead of the correct ${e}`,
  }
}

export function resolveOppositeBoolean(wrong, correctExpl) {
  const wt = wrong.trim().toLowerCase()
  if (!/^(true|false)$/.test(wt)) return null
  const fact = correctExpl.split(/[.!?]/)[0]?.trim()
  return {
    explanation: `This statement is **${wrong.trim()}**, but the tested fact is: ${fact}.`,
    trap: 'Flipping the true/false fact without matching the scenario details',
  }
}

export function resolveStemAnchored(wrong, q) {
  const fact = (q.explanation || '').trim()
  const first = fact.split(/[.!?]/).filter(Boolean)[0]?.trim() || fact
  const choice = String(wrong).replace(/\*\*/g, '').trim()
  const lead = first ? `${choice} misses what this question tests. ${first}.` : `${choice} does not match the mechanism asked here.`

  return {
    explanation: lead,
    trap: `Selecting "${choice.slice(0, 40)}${choice.length > 40 ? '…' : ''}" without matching the scenario constraint`,
  }
}

export function resolveWrongChoice(q, choiceIndex) {
  const wrong = q.choices?.[choiceIndex] || ''
  if (!wrong) return null

  return resolveKeywordRule(q, wrong)
    || resolveFromCkuTraps(q, wrong)
    || resolveDeviceMismatch(wrong)
    || resolveNumericContrast(wrong, q.explanation || '')
    || resolveOppositeBoolean(wrong, q.explanation || '')
    || null
}

export function resolveTrapLabel(q, choiceIndex, resolvedTrap) {
  if (resolvedTrap) return resolvedTrap
  const wrong = (q.choices?.[choiceIndex] || '').toLowerCase()
  const fromCku = resolveFromCkuTraps(q, wrong)
  if (fromCku?.trap) return fromCku.trap
  const dev = resolveDeviceMismatch(wrong)
  if (dev?.trap) return dev.trap
  const kw = resolveKeywordRule(q, wrong)
  if (kw?.trap) return kw.trap
  return null
}
