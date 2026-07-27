/**
 * Hand-authored gold batch 10 — Network Access, IP Services, Security domains 2, 4, 5.
 * Run: node scripts/generateGoldBatch10.mjs
 */
import { writeFileSync } from 'fs'

/** Hand-authored gold reviews keyed by question id. */
const HAND = {
  'obj-2.2-depth-wave4-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'On platforms that support ISL, you must set `switchport trunk encapsulation dot1q` before forcing 802.1Q trunk mode.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '`switchport mode trunk` sets trunk behavior but does not select 802.1Q encapsulation on dual-protocol switches — dot1q must be configured first.',
        misconceptionTested: 'Assuming trunk mode alone selects 802.1Q encapsulation',
      },
      {
        choiceIndex: 2,
        explanation: '`vlan dot1q enable` is not valid IOS trunk-encapsulation syntax — use `switchport trunk encapsulation dot1q`.',
        misconceptionTested: 'Inventing vlan dot1q enable command',
      },
      {
        choiceIndex: 3,
        explanation: '`trunk protocol ieee` is not Cisco switch syntax — IEEE 802.1Q is enabled with `switchport trunk encapsulation dot1q`.',
        misconceptionTested: 'Using generic trunk protocol keyword instead of dot1q',
      },
    ],
    examTip: '802.1Q trunk setup: **`switchport trunk encapsulation dot1q`** → then **`switchport mode trunk`**.',
  },
  'obj-2.3-depth-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'CDP default timers are advertisement every 60 seconds and hold-time 180 seconds (three missed updates).',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '30 s / 90 s is not the CDP default — Cisco IOS uses 60 s advertisements and 180 s hold-time.',
        misconceptionTested: 'Confusing CDP timers with LLDP 30 s interval',
      },
      {
        choiceIndex: 2,
        explanation: '120 s / 360 s doubles the real defaults — memorize **60 s / 180 s** for stock CDP.',
        misconceptionTested: 'Doubling CDP default timer values',
      },
      {
        choiceIndex: 3,
        explanation: '10 s / 30 s is far too aggressive for default CDP — hold-time is 180 s, not 30 s.',
        misconceptionTested: 'Selecting sub-minute CDP defaults',
      },
    ],
    examTip: 'CDP defaults: **advertise 60 s**, **hold-time 180 s** (3× the interval).',
  },
  'obj-2.3-depth-q2': {
    correct: {
      choiceIndex: 1,
      explanation: '`lldp run` in global configuration enables IEEE 802.1AB Link Layer Discovery Protocol on the switch.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '`lldp enable` is not the global IOS command — neighbor discovery is turned on with `lldp run`.',
        misconceptionTested: 'Using lldp enable instead of lldp run',
      },
      {
        choiceIndex: 2,
        explanation: '`cdp run` enables Cisco Discovery Protocol — LLDP is a separate IEEE standard enabled with `lldp run`.',
        misconceptionTested: 'Enabling CDP when LLDP is required',
      },
      {
        choiceIndex: 3,
        explanation: '`no cdp run` disables CDP globally — it does not enable LLDP for multivendor neighbor discovery.',
        misconceptionTested: 'Disabling CDP as substitute for enabling LLDP',
      },
    ],
    examTip: 'LLDP globally → **`lldp run`**; per-interface TX control → **`no lldp transmit`**.',
  },
  'obj-2.3-source-q008': {
    correct: {
      choiceIndex: 1,
      explanation: 'LLDP-MED for non-Cisco phones requires global `lldp run` from configuration mode so the switch can negotiate power and capabilities.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Global configuration uses `(config)#` — `Switch#lldp run` is not valid privileged-exec syntax for enabling LLDP.',
        misconceptionTested: 'Running lldp run from privileged exec instead of config mode',
      },
      {
        choiceIndex: 2,
        explanation: '`lldp enable` is not the standard global IOS command — use `lldp run` in configuration mode.',
        misconceptionTested: 'Substituting lldp enable for lldp run',
      },
      {
        choiceIndex: 3,
        explanation: 'LLDP must be configured from global configuration mode — privileged exec `#` prompt cannot enable `lldp run`.',
        misconceptionTested: 'Attempting global LLDP enable from exec mode',
      },
    ],
    examTip: 'PoE + multivendor phones → **`lldp run`** globally for **LLDP-MED** power negotiation.',
  },
  'obj-2.3-source-q010': {
    correct: {
      choiceIndex: 0,
      explanation: 'LLDP sends neighbor advertisements every 30 seconds by default — faster than CDP\'s 60-second interval.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '60 seconds is the default CDP advertisement interval — LLDP defaults to 30 seconds.',
        misconceptionTested: 'Applying CDP 60 s default to LLDP',
      },
      {
        choiceIndex: 2,
        explanation: '90 seconds is not the LLDP default advertisement timer — stock IOS uses 30 seconds.',
        misconceptionTested: 'Selecting tripled LLDP interval',
      },
      {
        choiceIndex: 3,
        explanation: '120 seconds is the LLDP holdtime default, not the transmit interval — advertisements go out every 30 s.',
        misconceptionTested: 'Confusing LLDP holdtime with advertisement interval',
      },
    ],
    examTip: 'LLDP timers: **TX every 30 s**; **holdtime 120 s** — do not swap with CDP 60/180.',
  },
  'obj-2.3-source-q011': {
    correct: {
      choiceIndex: 1,
      explanation: '`no lldp transmit` on the interface stops outgoing LLDP advertisements on that port while leaving LLDP active elsewhere.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '`no lldp` is not valid per-interface syntax — suppress outbound LLDP with `no lldp transmit`.',
        misconceptionTested: 'Using blanket no lldp on interface',
      },
      {
        choiceIndex: 2,
        explanation: '`no lldp receive` blocks inbound LLDP processing — the stem asks to stop sending advertisements outbound.',
        misconceptionTested: 'Disabling receive when transmit must be stopped',
      },
      {
        choiceIndex: 3,
        explanation: '`no lldp enable` is not standard IOS interface syntax — use `no lldp transmit` to stop outbound ads.',
        misconceptionTested: 'Inventing no lldp enable interface command',
      },
    ],
    examTip: 'Stop LLDP **outbound only** on one port → **`no lldp transmit`** under the interface.',
  },
  'obj-2.3-source-q012': {
    correct: {
      choiceIndex: 3,
      explanation: 'LLDP neighbor entries expire after a default holdtime of 120 seconds if no fresh advertisement is received.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '30 seconds is the LLDP **advertisement** interval — holdtime before aging a neighbor is 120 seconds.',
        misconceptionTested: 'Equating LLDP TX interval with holdtime',
      },
      {
        choiceIndex: 1,
        explanation: '60 seconds is CDP\'s advertisement default — LLDP holdtime is 120 seconds.',
        misconceptionTested: 'Using CDP timer for LLDP holdtime',
      },
      {
        choiceIndex: 2,
        explanation: '90 seconds is not the LLDP holdtime default — Cisco IOS uses 120 seconds for neighbor entry aging.',
        misconceptionTested: 'Selecting non-default LLDP holdtime value',
      },
    ],
    examTip: 'LLDP holdtime default = **120 s**; advertisements every **30 s**.',
  },
  'obj-2.3-source-q013': {
    correct: {
      choiceIndex: 2,
      explanation: 'The Interface field shows the local port receiving CDP (Gi0/2 on this switch) — it connects to the neighbor\'s Port ID (Gi0/1 on SwitchB).',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Holdtime (162 sec) is time remaining before the entry ages — not when the last advertisement was seen.',
        misconceptionTested: 'Reading holdtime as last-seen timestamp',
      },
      {
        choiceIndex: 1,
        explanation: 'Port ID lists the neighbor\'s outgoing interface (Gi0/1 on SwitchB) — the local Interface field is Gi0/2 facing SwitchB.',
        misconceptionTested: 'Swapping local Interface with neighbor Port ID',
      },
      {
        choiceIndex: 3,
        explanation: 'Entry address shows SwitchB management IP 192.168.1.2 — 192.168.1.1 is not listed in this CDP detail output.',
        misconceptionTested: 'Inventing neighbor IP not shown in CDP output',
      },
    ],
    examTip: 'CDP detail: **Interface** = local port; **Port ID** = neighbor\'s port facing you.',
  },
  'obj-2.3-source-q014': {
    correct: {
      choiceIndex: 3,
      explanation: '`no cdp enable` on the ISP-facing interface stops CDP advertisements on that link only — CDP remains active on other ports.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '`cdp disable` is not valid global syntax — per-interface suppression uses `no cdp enable` under the interface.',
        misconceptionTested: 'Using invented cdp disable global command',
      },
      {
        choiceIndex: 1,
        explanation: '`no cdp` is incomplete interface syntax — the command to stop CDP on one port is `no cdp enable`.',
        misconceptionTested: 'Using no cdp instead of no cdp enable',
      },
      {
        choiceIndex: 2,
        explanation: '`no cdp disable` would re-enable CDP if disable were set — it does not selectively stop advertisements to the ISP.',
        misconceptionTested: 'Negating disable instead of disabling CDP on interface',
      },
    ],
    examTip: 'Hide switch capabilities from one link → **`no cdp enable`** on that interface only.',
  },
  'obj-4.1-source-q001': {
    correct: {
      choiceIndex: 2,
      explanation: 'NAT translates private RFC 1918 addresses to routable public addresses so inside hosts can reach the Internet.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'CIDR is an addressing/aggregation scheme — it does not translate private addresses for Internet egress.',
        misconceptionTested: 'Expecting CIDR to provide private-to-public translation',
      },
      {
        choiceIndex: 1,
        explanation: 'Classful addressing is a legacy model — RFC 1918 hosts still need NAT (or similar) to reach the public Internet.',
        misconceptionTested: 'Believing classful rules alone enable Internet use of RFC 1918',
      },
      {
        choiceIndex: 3,
        explanation: 'VPNs tunnel traffic between sites — they do not by themselves translate RFC 1918 hosts to public Internet addresses.',
        misconceptionTested: 'Substituting VPN for address translation to the Internet',
      },
    ],
    examTip: 'RFC 1918 → Internet egress needs **NAT** (or carrier-grade NAT) to a **public** address.',
  },
  'obj-4.1-source-q002': {
    correct: {
      choiceIndex: 0,
      explanation: 'Inside local is the private address as configured on the host inside the network — Host A at 192.168.1.2.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '192.168.1.1 is the inside router interface — inside local refers to the end host address before translation.',
        misconceptionTested: 'Labeling inside router interface as inside local host',
      },
      {
        choiceIndex: 2,
        explanation: '179.43.44.1 is the inside global address on the WAN interface — inside local stays private (192.168.1.x).',
        misconceptionTested: 'Confusing inside global WAN address with inside local',
      },
      {
        choiceIndex: 3,
        explanation: '198.23.53.3 is an outside global Internet server — inside local addresses live on the private LAN.',
        misconceptionTested: 'Selecting outside global address for inside local question',
      },
    ],
    examTip: 'NAT quadrants: **inside local** = private host IP **before** translation.',
  },
  'obj-4.1-source-q003': {
    correct: {
      choiceIndex: 2,
      explanation: 'Inside global is the public address representing an inside host to the outside world — here 179.43.44.1 on Router A S0/0.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '192.168.1.2 is Host A\'s inside local address — inside global is the routable address seen outside the NAT domain.',
        misconceptionTested: 'Equating inside local host with inside global',
      },
      {
        choiceIndex: 1,
        explanation: '192.168.1.1 is the inside LAN gateway — inside global is the translated/public representation, not the private gateway.',
        misconceptionTested: 'Choosing inside LAN gateway as inside global',
      },
      {
        choiceIndex: 3,
        explanation: '198.23.53.3 is an outside global destination on the Internet — inside global belongs to the enterprise NAT side.',
        misconceptionTested: 'Selecting outside global server for inside global slot',
      },
    ],
    examTip: '**Inside global** = public address outsiders see for an **inside** host.',
  },
  'obj-4.1-source-q004': {
    correct: {
      choiceIndex: 3,
      explanation: 'Outside global is the Internet-routable address of the remote server as seen by the inside network — 198.23.53.3.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '192.168.1.2 is an inside local host — outside global addresses belong to destinations outside the NAT domain.',
        misconceptionTested: 'Labeling inside local host as outside global',
      },
      {
        choiceIndex: 1,
        explanation: '192.168.1.1 is the inside router LAN interface — it is not the outside global web server address.',
        misconceptionTested: 'Confusing inside gateway with outside global destination',
      },
      {
        choiceIndex: 2,
        explanation: '179.43.44.1 is the enterprise inside global on the WAN — outside global is the remote Internet server IP.',
        misconceptionTested: 'Mixing inside global WAN with outside global destination',
      },
    ],
    examTip: '**Outside global** = remote host\'s **public** IP as your network sees it.',
  },
  'obj-4.1-source-q005': {
    correct: {
      choiceIndex: 0,
      explanation: '`show ip nat translations` displays active NAT translation entries — inside/outside local and global address mappings.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '`show nat translations` omits the required `ip` keyword — Cisco IOS uses `show ip nat translations`.',
        misconceptionTested: 'Dropping ip keyword from show nat command',
      },
      {
        choiceIndex: 2,
        explanation: '`debug ip nat translations` floods real-time events — use `show ip nat translations` for the current translation table.',
        misconceptionTested: 'Using debug instead of show for translation table',
      },
      {
        choiceIndex: 3,
        explanation: '`show translations nat` reverses the IOS syntax — the valid command is `show ip nat translations`.',
        misconceptionTested: 'Reordering show ip nat keywords',
      },
    ],
    examTip: 'Active NAT mappings → **`show ip nat translations`** (not debug).',
  },
  'obj-4.1-source-q006': {
    correct: {
      choiceIndex: 3,
      explanation: '`show ip nat statistics` summarizes translation counts, hits/misses, and NAT configuration overview — not every individual entry.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '`show ip nat translations` lists each active translation — statistics gives aggregate counters and summary data.',
        misconceptionTested: 'Using translations table for overview statistics',
      },
      {
        choiceIndex: 1,
        explanation: '`show ip nat summary` is not standard IOS syntax — overview statistics use `show ip nat statistics`.',
        misconceptionTested: 'Inventing show ip nat summary command',
      },
      {
        choiceIndex: 2,
        explanation: '`show ip nat status` is not the overview command — use `show ip nat statistics` for hit counts and totals.',
        misconceptionTested: 'Selecting nonexistent show ip nat status',
      },
    ],
    examTip: 'NAT **overview/counters** → **`show ip nat statistics`**; per-entry table → **`show ip nat translations`**.',
  },
  'obj-4.1-source-q007': {
    correct: {
      choiceIndex: 0,
      explanation: 'Static NAT uses `ip nat inside source static <inside-local> <inside-global>` — mapping 192.168.1.3 to 179.43.44.1.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Valid static NAT requires the `ip nat` prefix and `inside` keyword — `nat source static` alone is incomplete IOS syntax.',
        misconceptionTested: 'Omitting ip nat inside keywords from static NAT',
      },
      {
        choiceIndex: 2,
        explanation: '`ip nat static` is not the full command form — Cisco uses `ip nat inside source static <local> <global>`.',
        misconceptionTested: 'Using shortened ip nat static syntax',
      },
      {
        choiceIndex: 3,
        explanation: '`ip nat source static` drops the required `inside` keyword — static mappings need `ip nat inside source static`.',
        misconceptionTested: 'Missing inside keyword in static NAT command',
      },
    ],
    examTip: 'Static NAT: **`ip nat inside source static <private> <public>`**.',
  },
  'obj-4.1-source-q008': {
    correct: {
      choiceIndex: 2,
      explanation: 'Pool for 179.43.44.0/28: `ip nat pool EntPool 179.43.44.1 179.43.44.15 netmask 255.255.255.240` — /28 netmask matches the owned block.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'NAT pool syntax uses host address ranges, not CIDR slash notation — `ip nat pool Name start end netmask`.',
        misconceptionTested: 'Using CIDR notation inside ip nat pool command',
      },
      {
        choiceIndex: 1,
        explanation: '`ip pool` is not NAT pool syntax, and `255.255.255.0` is a /24 mask — not /28 (`255.255.255.240`).',
        misconceptionTested: 'Using ip pool instead of ip nat pool',
      },
      {
        choiceIndex: 3,
        explanation: 'Netmask `255.255.255.0` is /24 — the owned block is /28 (`255.255.255.240`).',
        misconceptionTested: 'Mismatched pool range and mask',
      },
    ],
    examTip: 'Dynamic NAT pool: **`ip nat pool <name> <first> <last> netmask <mask>`** — mask must match the owned prefix.',
  },
  'obj-5.1-source-q001': {
    correct: {
      choiceIndex: 1,
      explanation: 'The perimeter is the network edge outside the corporate firewall — the untrusted external boundary facing the Internet.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'DMZ is a screened subnet between internal and external networks — perimeter describes the broader outside edge.',
        misconceptionTested: 'Equating DMZ subnet with entire outside perimeter',
      },
      {
        choiceIndex: 2,
        explanation: 'Internal networks sit behind the firewall — perimeter is outside the protected corporate boundary.',
        misconceptionTested: 'Labeling internal network as outside perimeter',
      },
      {
        choiceIndex: 3,
        explanation: 'Trusted network refers to protected inside zones — perimeter is the untrusted outside of the firewall.',
        misconceptionTested: 'Confusing trusted zone with external perimeter',
      },
    ],
    examTip: '**Perimeter** = untrusted **outside** edge; **DMZ** = semi-trusted zone **between** inside and outside.',
  },
  'obj-5.1-source-q002': {
    correct: {
      choiceIndex: 0,
      explanation: 'A DMZ (demilitarized zone) hosts Internet-facing servers yet sits behind firewall policy — accessible but segmented from the internal LAN.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Perimeter describes the external boundary broadly — DMZ is the specific screened subnet for public-facing services.',
        misconceptionTested: 'Using perimeter label for DMZ screened subnet',
      },
      {
        choiceIndex: 2,
        explanation: 'Internal networks are not Internet-accessible by design — DMZ is deliberately reachable from outside with controls.',
        misconceptionTested: 'Calling protected internal LAN a DMZ',
      },
      {
        choiceIndex: 3,
        explanation: 'Trusted network is the protected inside — DMZ is less trusted than internal but more exposed than the core LAN.',
        misconceptionTested: 'Equating trusted internal with DMZ',
      },
    ],
    examTip: '**DMZ** = Internet-reachable **but firewall-screened** servers (web, mail, DNS).',
  },
  'obj-5.1-source-q004': {
    correct: {
      choiceIndex: 0,
      explanation: 'Trusted network means the protected internal corporate LAN behind the firewall — highest trust zone for users and data.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'The Internet is untrusted external space — trusted network is inside the security perimeter.',
        misconceptionTested: 'Calling the Internet a trusted network',
      },
      {
        choiceIndex: 2,
        explanation: 'DMZ is semi-trusted for public services — trusted network is the private internal zone with stricter access.',
        misconceptionTested: 'Labeling DMZ as fully trusted internal',
      },
      {
        choiceIndex: 3,
        explanation: 'SSL encrypts sessions — trust zone naming is about network segmentation, not transport encryption alone.',
        misconceptionTested: 'Defining trusted network by SSL presence',
      },
    ],
    examTip: 'Firewall zones: **trusted = internal LAN**; **DMZ = semi-trusted**; **outside = Internet**.',
  },
  'obj-5.1-source-q005': {
    correct: {
      choiceIndex: 1,
      explanation: 'Distributed denial of service (DDoS) floods a target from many coordinated Internet sources — overwhelming services at scale.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Single-source DoS can overwhelm a service — DDoS specifically involves **multiple distributed** attack sources.',
        misconceptionTested: 'Selecting single-source DoS for distributed attack stem',
      },
      {
        choiceIndex: 2,
        explanation: 'IP spoofing falsifies source addresses — it may aid attacks but does not by itself describe multi-source traffic floods.',
        misconceptionTested: 'Equating spoofing with distributed flood attack',
      },
      {
        choiceIndex: 3,
        explanation: 'Session hijacking takes over an established session — DDoS is volumetric flooding from many hosts.',
        misconceptionTested: 'Confusing session hijack with DDoS flood',
      },
    ],
    examTip: '**DDoS** = many sources; **DoS** = one source — both aim to exhaust availability.',
  },
  'obj-5.1-source-q006': {
    correct: {
      choiceIndex: 1,
      explanation: 'An IDS (Intrusion Detection System) monitors traffic and alerts on suspicious activity — detection without inline blocking.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Honeypots lure attackers into decoy systems — they do not broadly detect intrusions across production traffic like an IDS.',
        misconceptionTested: 'Expecting honeypots to serve as network IDS',
      },
      {
        choiceIndex: 2,
        explanation: 'IPS detects **and** can block inline — the stem asks for detection; IDS is the classic detect-and-alert role.',
        misconceptionTested: 'Choosing IPS when only detection is asked',
      },
      {
        choiceIndex: 3,
        explanation: 'HIDS is host-based IDS on endpoints — the question targets network intrusion **detection** (IDS generically).',
        misconceptionTested: 'Narrowing to host IDS when network IDS fits',
      },
    ],
    examTip: '**IDS** = detect + alert; **IPS** = detect + **inline prevent**.',
  },
  'obj-5.1-source-q007': {
    correct: {
      choiceIndex: 3,
      explanation: 'Blocking ICMP echo request/reply at the perimeter stops ping responses used in ping-sweep reconnaissance.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'HIDS on endpoints does not stop perimeter ping sweeps — block ICMP at the edge to hide live hosts from sweep tools.',
        misconceptionTested: 'Relying on host IDS to stop ping sweeps',
      },
      {
        choiceIndex: 1,
        explanation: 'Network IDS may detect sweeps after they occur — preventing echo replies at the firewall stops the scan technique.',
        misconceptionTested: 'Expecting NIDS alone to prevent ping sweeps',
      },
      {
        choiceIndex: 2,
        explanation: 'RFC 1918 blocking filters private ranges — ping sweeps use ICMP echo to discover responsive hosts, not RFC 1918 rules.',
        misconceptionTested: 'Blocking RFC 1918 as ping sweep countermeasure',
      },
    ],
    examTip: 'Stop ping sweeps at the edge → **deny ICMP echo** (type 8/0) on the **perimeter**.',
  },
  'obj-5.1-source-q008': {
    correct: {
      choiceIndex: 2,
      explanation: 'An IPS (Intrusion Prevention System) can drop malicious traffic inline — actively mitigating denial-of-service floods.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Honeypots divert attackers to decoys — they do not inline-mitigate volumetric DoS against production services.',
        misconceptionTested: 'Using honeypots for DoS mitigation',
      },
      {
        choiceIndex: 1,
        explanation: 'IDS detects and alerts but typically does not block — IPS provides inline prevention against DoS traffic.',
        misconceptionTested: 'Expecting IDS to mitigate DoS inline',
      },
      {
        choiceIndex: 3,
        explanation: 'HIDS protects individual hosts — network IPS at the perimeter is positioned to drop flood traffic before it hits servers.',
        misconceptionTested: 'Choosing host IDS for network DoS mitigation',
      },
    ],
    examTip: 'Mitigate floods inline → **IPS** (or dedicated anti-DDoS) at the **perimeter**.',
  },
  'obj-5.1-source-q009': {
    correct: {
      choiceIndex: 2,
      explanation: 'IP address spoofing sends packets with a forged source address — impersonating another host to bypass trust or filters.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'DoS floods exhaust resources — spoofing falsifies identity rather than primarily overwhelming bandwidth.',
        misconceptionTested: 'Selecting DoS for identity impersonation attack',
      },
      {
        choiceIndex: 1,
        explanation: 'DDoS uses many sources to flood a target — spoofing is about false source identity, not distributed volume alone.',
        misconceptionTested: 'Confusing DDoS flood with address spoofing',
      },
      {
        choiceIndex: 3,
        explanation: 'Session hijacking steals an established TCP session — spoofing forges source IPs in new packets.',
        misconceptionTested: 'Equating session hijack with IP spoofing',
      },
    ],
    examTip: '**Spoofing** = fake **source identity**; **hijacking** = take over an **existing session**.',
  },
}

const BATCH10_IDS = Object.keys(HAND)
if (BATCH10_IDS.length !== 25) {
  console.error(`Expected 25 entries, got ${BATCH10_IDS.length}`)
  process.exit(1)
}

const lines = [
  '/** Gold reviews — Batch 10: Network Access, IP Services, Security domains 2, 4, 5. */',
  'export const BATCH10_GOLD = {',
]
for (const [id, rev] of Object.entries(HAND)) {
  lines.push(`  '${id}': ${JSON.stringify(rev, null, 2).replace(/\n/g, '\n  ')},`)
}
lines.push('}', '')

writeFileSync('src/answerReview/goldAnswerReviewsBatch10.js', lines.join('\n'))
console.error(`Wrote ${BATCH10_IDS.length} entries to goldAnswerReviewsBatch10.js`)
console.log(BATCH10_IDS.join('\n'))
