/**
 * Stem- and CKU-aware exam tips for quiz answer review.
 */
import { CKU_TRAP_INDEX } from './ckuTrapIndex.js'

export const GENERIC_EXAM_TIP_RE = [
  /eliminate answers that describe a different protocol, port, or command/i,
]

const STEM_TIPS = [
  { re: /mac address table|cam table|learn.*mac|source mac/i, tip: 'Learning records the **source MAC on the ingress port**; forwarding looks up the **destination MAC** — don\'t swap them.' },
  { re: /unknown|not in the (mac )?table|flood/i, tip: 'Unknown unicast → **flood** within the VLAN (except ingress). Known unicast → **one egress port**.' },
  { re: /administrative distance|\bad\b/i, tip: 'AD picks the **route source** for the same prefix; **longest match** still wins first.' },
  { re: /longest prefix|more specific/i, tip: 'Longest prefix match happens **before** AD — a /32 beats a /24 even from a “worse” protocol.' },
  { re: /ospf neighbor|adjacency|full state/i, tip: 'OSPF neighbors need matching **area, hello/dead, subnet/mask, and auth** — one mismatch blocks FULL.' },
  { re: /inside local|inside global|outside|nat|pat|overload/i, tip: 'Mark **inside/outside** first. PAT = many inside hosts sharing one **outside global** with unique ports.' },
  { re: /dhcp|dora|discover|offer/i, tip: 'DHCP is **DORA** — match the message name to the step the stem describes.' },
  { re: /default gateway|host cannot reach/i, tip: 'Local L2 works but remote fails? Check the host **default gateway** before blaming routing protocols.' },
  { re: /vlan|trunk|native vlan|802\.1q/i, tip: 'Access = one VLAN; trunk tags frames. **Native VLAN** must match on both ends or you get silent mis-forwarding.' },
  { re: /stp|spanning tree|root bridge|blocking/i, tip: 'STP blocks **redundant paths**, not user traffic on the forwarding port — know root vs designated vs blocked.' },
  { re: /acl|access.?list|wildcard/i, tip: '**First match wins** + implicit deny. Standard = source only near **destination**; extended near **source**.' },
  { re: /syslog|severity/i, tip: 'Lower syslog number = **more severe** (0 emergency … 7 debug).' },
  { re: /tacacs|radius|aaa/i, tip: 'AuthN = who you are · AuthZ = what you may do · Accounting = what you did. TACACS+ = TCP/49; RADIUS = UDP/1812/1813.' },
  { re: /wireless|wpa|802\.11/i, tip: 'Match **band, range, and standard** to the scenario — WEP is never the right modern answer.' },
  { re: /ssh|telnet|remote management/i, tip: 'Cleartext **Telnet** fails security stems — SSH is the management answer.' },
  { re: /subnet|vlsm|cidr|mask/i, tip: 'Find the **interesting octet** (not 0 or 255) and apply the **block size** there — not always the 4th octet.' },
  { re: /ipv6|link-local|fe80|slaac|eui-64/i, tip: 'Link-local **fe80::/10** is automatic; global unicast needs SLAAC, DHCPv6, or static config.' },
  { re: /hsrp|vrrp|fhrp|virtual (ip|mac)/i, tip: 'FHRP gives hosts one **virtual default gateway** — track Active/Standby (HSRP) vs master/backup (VRRP).' },
  { re: /etherchannel|port-channel|lacp|pagp/i, tip: 'EtherChannel is one logical link to STP — **LACP (802.3ad)** is standards-based; PAgP is Cisco-proprietary.' },
  { re: /cloud|meraki|dna center|controller/i, tip: 'Cloud management = **central dashboard** across sites; on-prem DNA Center keeps control **inside your network**.' },
  { re: /port security|dhcp snooping|dai|storm/i, tip: 'L2 security features need correct **trusted vs untrusted** port roles — wrong trust breaks the feature.' },
  { re: /api|rest|json|ansible|terraform|sdn/i, tip: 'Automation stems test **which tool/API** fits — don\'t swap controller, playbook, and southbound API roles.' },
]

const CONCEPT_TIPS = {
  nat: 'NAT/PAT stems trap you on **inside vs outside** and **local vs global** — label the addresses before picking.',
  pat: 'Keyword **overload** → PAT. One public IP, many inside hosts, unique source ports.',
  dhcp: 'DHCP stems often test **DORA order** or **relay (ip helper-address)** — read who sends which message.',
  ospf: 'OSPF items love **neighbor requirements** and **DR/BDR on multi-access** segments.',
  static: 'Static routes: **next-hop** needs recursive lookup; **exit-interface** is common on point-to-point links.',
  acl: 'ACL traps: **rule order**, **wildcard masks**, and **placement** (standard vs extended).',
  stp: 'STP traps mix **port roles** with **forwarding behavior** — blocking is not “drop all traffic.”',
  syslog: 'Syslog: **lower number = worse**. Severity 0 is emergencies.',
  dns: 'Forward = name→IP; reverse = IP→name (PTR).',
  hsrp: 'HSRP: **Active** forwards; **Standby** listens. Virtual IP/MAC is what hosts use.',
  vlan: 'VLAN = broadcast domain; routing between VLANs needs an **L3 device** (router or SVI).',
  'mac learning': 'Switches **learn source MACs**; they **forward on destination MAC**.',
  wireless: 'Pick **WPA2/WPA3**, correct **band**, and AP/controller role — not WEP.',
  aaa: 'AAA order: Authentication → Authorization → Accounting.',
  automation: 'Separate **management plane** (API/controller) from **data plane** (forwarding).',
}

function firstSentence(text) {
  const t = String(text || '').trim()
  if (!t) return ''
  const m = t.match(/^[^.!?]+[.!?]?/)
  return m ? m[0].trim() : t.slice(0, 100)
}

export function isGenericExamTip(text) {
  if (!text || typeof text !== 'string') return true
  return GENERIC_EXAM_TIP_RE.some(re => re.test(text))
}

/** Best exam-trap line from linked CKUs. */
export function resolvePrimaryCkuExamTip(q) {
  for (const ckuId of q.ckuIds || []) {
    const traps = CKU_TRAP_INDEX[ckuId] || []
    const pick = traps.find(t => t.source === 'examTrap') || traps[0]
    if (!pick) continue
    const trap = pick.trap.replace(/\.$/, '')
    const fix = pick.correction.replace(/\.$/, '')
    return `On the exam: ${trap} — ${fix}`
  }
  return null
}

function stemExamTip(q) {
  const blob = `${q.question || ''} ${q.concept || ''} ${q.explanation || ''}`.toLowerCase()
  for (const { re, tip } of STEM_TIPS) {
    if (re.test(blob)) return tip
  }
  return null
}

function conceptExamTip(q) {
  const c = (q.concept || '').toLowerCase()
  for (const [key, tip] of Object.entries(CONCEPT_TIPS)) {
    if (c.includes(key)) return tip
  }
  return null
}

function typeExamTip(q) {
  if (q.type === 'ordering') {
    return 'Ordering items? Cisco tests **process sequence** — map each step to the scenario before dragging.'
  }
  if (q.type === 'troubleshooting') {
    const hook = firstSentence(q.explanation)
    return hook
      ? `Troubleshooting stem: work **bottom-up** (L1 → L2 → L3). Here the fix hinges on: ${hook}`
      : 'Troubleshooting stems: verify **physical/link** before routing protocol internals.'
  }
  if (q.type === 'true-false' || (q.choices?.length === 2 && /true|false/i.test((q.choices[0] || '') + (q.choices[1] || '')))) {
    return 'True/false traps flip one word — match the **exact fact** in the stem, not a similar concept.'
  }
  return null
}

function scenarioExamTip(q) {
  const concept = q.concept || 'this topic'
  const hook = firstSentence(q.explanation)
  if (!hook) return null
  return `This stem tests **${concept}** — exam distractors swap similar terms; anchor on: ${hook}`
}

/** Build a question-specific exam tip (no generic fallback). */
export function examTipFor(q) {
  return resolvePrimaryCkuExamTip(q)
    || stemExamTip(q)
    || conceptExamTip(q)
    || typeExamTip(q)
    || scenarioExamTip(q)
    || `Re-read the stem constraint for **${q.concept || q.objectiveId || 'this objective'}** before picking a familiar-sounding wrong term.`
}
