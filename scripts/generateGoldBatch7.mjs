/**
 * Hand-authored gold batch 7 — fundamentals/routing/security domains 1, 3, 5.
 * Run: node scripts/generateGoldBatch7.mjs
 */
import { writeFileSync } from 'fs'

/** Hand-authored gold reviews keyed by question id. */
const HAND = {
  'obj-1.1-depth-wave4-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'Each switch port is its own collision domain; hubs share one collision domain across all ports.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'A hub repeats every frame to all ports — all connected devices share a single collision domain, unlike a switch.',
        misconceptionTested: 'Believing hubs isolate collision domains per port',
      },
      {
        choiceIndex: 2,
        explanation: 'Repeaters regenerate signals but do not segment collision domains — they extend one shared collision domain.',
        misconceptionTested: 'Expecting repeaters to create per-port collision domains',
      },
      {
        choiceIndex: 3,
        explanation: 'A WLC manages wireless APs — wired collision-domain segmentation on Ethernet switch ports is a Layer 2 switch function.',
        misconceptionTested: 'Assigning collision-domain role to wireless controller',
      },
    ],
    examTip: 'Switch port = **one collision domain**; hub = **one domain for all ports**.',
  },
  'obj-1.4-depth-wave4-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'Runts/giants point to framing errors — bad cable, speed/duplex mismatch, or damaged NIC.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'OSPF area mismatch affects routing adjacency — giant and runt counters are Layer 1/2 framing errors from cable or duplex issues.',
        misconceptionTested: 'Blaming OSPF area for interface giant/runt counters',
      },
      {
        choiceIndex: 2,
        explanation: 'Missing default route affects remote reachability — it does not cause runt or giant frames on a single interface.',
        misconceptionTested: 'Linking default route absence to L1 framing errors',
      },
      {
        choiceIndex: 3,
        explanation: 'VLAN naming is logical segmentation — giant/runt errors indicate physical layer or duplex mismatch on the wire.',
        misconceptionTested: 'Using VLAN name typo to explain framing errors',
      },
    ],
    examTip: 'Giants/runts climbing → **cable, speed/duplex, NIC** before routing.',
  },
  'obj-1.3-depth-wave4-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'Like-to-like devices (switch-to-switch) need crossover unless auto-MDIX negotiates it.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Straight-through is for unlike devices (PC-to-switch) — with auto-MDIX off, switch-to-switch needs crossover pinout.',
        misconceptionTested: 'Using straight-through for switch-to-switch without MDIX',
      },
      {
        choiceIndex: 2,
        explanation: 'Console rollover cables are for serial management ports — not Ethernet switch interconnects.',
        misconceptionTested: 'Confusing console cable with Ethernet interconnect',
      },
      {
        choiceIndex: 3,
        explanation: 'Fiber may be valid in some designs but the CCNA stem asks for copper cable type with MDIX disabled — crossover is the classic answer.',
        misconceptionTested: 'Jumping to fiber when copper crossover is specified',
      },
    ],
    examTip: 'Switch↔switch, MDIX off → **crossover** (or enable auto-MDIX).',
  },
  'obj-1.10-depth-wave4-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'tracert sends probes with increasing TTL to map each router along the path.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'ipconfig /all shows local IP configuration — it does not trace hop-by-hop Layer 3 path to a destination.',
        misconceptionTested: 'Using ipconfig for path tracing',
      },
      {
        choiceIndex: 2,
        explanation: 'arp -a lists local Layer 2 neighbor mappings — it does not reveal each router hop along a remote path.',
        misconceptionTested: 'Confusing ARP table with route tracing',
      },
      {
        choiceIndex: 3,
        explanation: 'nslookup resolves DNS names — path tracing requires tracert (Windows) or traceroute on other platforms.',
        misconceptionTested: 'Using DNS lookup instead of tracert',
      },
    ],
    examTip: 'Hop-by-hop path from Windows PC → **`tracert`**.',
  },
  'obj-1.11-depth-wave4-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'RSSI near −70 dBm or lower is marginal; −50 to −60 dBm is typically strong.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '−72 dBm is weak/marginal, not excellent — expect reduced throughput and possible drops until placement or power improves.',
        misconceptionTested: 'Treating −72 dBm as strong signal',
      },
      {
        choiceIndex: 2,
        explanation: 'RSSI is measured in negative dBm — −72 dBm is a valid reading indicating weak received signal.',
        misconceptionTested: 'Believing RSSI must be positive',
      },
      {
        choiceIndex: 3,
        explanation: 'SNR compares signal to noise floor — RSSI measures received power alone; they are related but distinct metrics.',
        misconceptionTested: 'Equating RSSI with SNR as identical',
      },
    ],
    examTip: 'RSSI **−50 to −60 dBm** strong; **near −70 dBm or lower** = weak.',
  },
  'obj-1.7-depth-wave4-q1': {
    correct: {
      choiceIndex: 1,
      explanation: '172.16.0.0/12 spans 172.16.0.0 through 172.31.255.255 — not just 172.16.0.0/16.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '172.16.0.0/16 covers only 172.16.x.x — RFC 1918 private 172.x range extends through 172.31.x.x, which needs /12.',
        misconceptionTested: 'Using /16 when full 172.16–172.31 block is needed',
      },
      {
        choiceIndex: 2,
        explanation: '172.0.0.0/8 is far larger than the RFC 1918 172.16–172.31 private block — only 172.16.0.0/12 matches that range.',
        misconceptionTested: 'Oversizing to /8 for RFC 1918 172 block',
      },
      {
        choiceIndex: 3,
        explanation: '172.31.0.0/16 covers only the 172.31 subnet — the full private range starts at 172.16 and requires /12.',
        misconceptionTested: 'Selecting last /16 only instead of full 172.16–172.31',
      },
    ],
    examTip: 'RFC 1918 **172.16–172.31** = **`172.16.0.0/12`**.',
  },
  '3.6-legacy-q002': {
    correct: {
      choiceIndex: 0,
      explanation: 'A next-hop (recursive) static route requires the router to look up the routing table again to determine which interface reaches the next-hop IP.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'ARP resolves next-hop MAC on the local segment — the router first needs a recursive route lookup to know which interface reaches the next-hop IP.',
        misconceptionTested: 'Skipping recursive lookup and ARPing destination host',
      },
      {
        choiceIndex: 2,
        explanation: 'DNS resolves hostnames — static route forwarding to a next-hop IP uses routing table recursion, not DNS.',
        misconceptionTested: 'Using DNS lookup for next-hop static routes',
      },
      {
        choiceIndex: 3,
        explanation: 'Next-hop static routes are not immediately forwardable — IOS must resolve which egress interface reaches the next-hop address.',
        misconceptionTested: 'Believing next-hop routes forward without lookup',
      },
    ],
    examTip: 'Static via **next-hop IP** → recursive lookup for **egress interface**.',
  },
  '3.6-legacy-q003': {
    correct: {
      choiceIndex: 1,
      explanation: 'A static route depends on its exit interface (or a reachable next hop) being up. If the interface goes down, the route is removed from the routing table until reachability is restored.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'IOS removes unreachable static routes from the table — it does not leave them installed as inactive entries when the exit interface is down.',
        misconceptionTested: 'Expecting inactive static routes to remain installed',
      },
      {
        choiceIndex: 2,
        explanation: 'Default routes are configured separately — a down exit interface does not auto-replace a static with a default route.',
        misconceptionTested: 'Believing default route auto-replaces failed static',
      },
      {
        choiceIndex: 3,
        explanation: 'IOS withdraws the route when the exit path fails — it does not keep a silent broken route that appears active.',
        misconceptionTested: 'Thinking static stays active while interface is down',
      },
    ],
    examTip: 'Exit interface down → static route **removed** until path returns.',
  },
  '3.6-legacy-q004': {
    correct: {
      choiceIndex: 1,
      explanation: 'Local-subnet connectivity working but remote connectivity failing is the classic symptom of a missing or incorrect default gateway.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'DNS affects name resolution — ping to remote IP addresses fails without DNS involvement when the default gateway is missing.',
        misconceptionTested: 'Blaming DNS for remote IP unreachable with local OK',
      },
      {
        choiceIndex: 2,
        explanation: 'Wrong VLAN would typically break local subnet communication too — local ping OK with remote failure points to gateway/default route on the host.',
        misconceptionTested: 'Choosing VLAN mismatch when local subnet works',
      },
      {
        choiceIndex: 3,
        explanation: 'Duplicate IP often causes intermittent local issues — classic remote-only failure with correct mask is missing default gateway.',
        misconceptionTested: 'Selecting duplicate IP over missing gateway',
      },
    ],
    examTip: 'Local subnet OK, remote fails → **default gateway** on host.',
  },
  '3.6-legacy-q009': {
    correct: {
      choiceIndex: 1,
      explanation: 'A default route being present in the table does not guarantee end-to-end reachability. Common remaining causes are an unreachable next hop or missing NAT/PAT translation for internal private addresses.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '0.0.0.0/0 is the correct mask for a default route — the issue is next-hop reachability or missing NAT, not the mask value.',
        misconceptionTested: 'Believing default route needs /32 mask',
      },
      {
        choiceIndex: 2,
        explanation: 'Edge routers commonly use default routes — the problem is usually unreachable next-hop or no NAT for private hosts.',
        misconceptionTested: 'Claiming default routes unsupported on edge routers',
      },
      {
        choiceIndex: 3,
        explanation: 'Static default routes work without OSPF redistribution — verify next-hop reachability and NAT for internet access.',
        misconceptionTested: 'Requiring OSPF redistribution for static default',
      },
    ],
    examTip: 'Default route in table but no internet → **next-hop up + NAT**.',
  },
  '3.6-legacy-q010': {
    correct: {
      choiceIndex: 1,
      explanation: 'show ip ospf neighbor shows the state of OSPF adjacencies (e.g., FULL). If R1 and R2 have not formed a FULL adjacency, R1 will not receive R2 routes.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'show ip route ospf lists learned routes — if adjacency never formed, this shows nothing useful for confirming neighbor state.',
        misconceptionTested: 'Checking OSPF routes before confirming neighbor adjacency',
      },
      {
        choiceIndex: 2,
        explanation: 'show ip interface brief shows up/down status — it does not confirm OSPF neighbor FULL state on a link.',
        misconceptionTested: 'Using interface brief instead of OSPF neighbor table',
      },
      {
        choiceIndex: 3,
        explanation: 'show vlan brief is Layer 2 switching — OSPF neighbor verification requires show ip ospf neighbor.',
        misconceptionTested: 'Checking VLAN brief for OSPF adjacency',
      },
    ],
    examTip: 'Missing OSPF routes → **`show ip ospf neighbor`** for FULL state.',
  },
  'obj-3.5-depth-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'Active router forwards; Standby listens and takes over if Active fails.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Standby monitors the Active router and assumes the virtual IP only when Active fails — it does not forward traffic in normal operation.',
        misconceptionTested: 'Believing Standby forwards traffic normally',
      },
      {
        choiceIndex: 2,
        explanation: 'Listen state is not the HSRP role that forwards for the virtual IP — Active handles forwarding.',
        misconceptionTested: 'Confusing Listen state with forwarding role',
      },
      {
        choiceIndex: 3,
        explanation: 'Disabled is not an operational HSRP forwarding role — Active router carries traffic for the virtual IP.',
        misconceptionTested: 'Selecting disabled as HSRP forwarder',
      },
    ],
    examTip: 'HSRP **Active** forwards; **Standby** takes over on failure.',
  },
  'obj-3.5-depth-q3': {
    correct: {
      choiceIndex: 1,
      explanation: 'Preempt lets the highest-priority router become Active when available.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Without preempt, a lower-priority router that became Active may stay Active — preempt allows higher priority to reclaim the role.',
        misconceptionTested: 'Believing lower priority holds Active forever with preempt',
      },
      {
        choiceIndex: 2,
        explanation: 'Only one router is Active per HSRP group — preempt controls role reclamation, not multiple simultaneous Active routers.',
        misconceptionTested: 'Expecting virtual IP on multiple Active groups',
      },
      {
        choiceIndex: 3,
        explanation: 'Preempt enables priority-based Active election — it does not disable standby election.',
        misconceptionTested: 'Thinking preempt disables standby election',
      },
    ],
    examTip: 'HSRP **preempt** = higher priority **reclaims Active** when back.',
  },
  'obj-5.6-depth-q1': {
    correct: {
      choiceIndex: 2,
      explanation: 'Shutdown mode err-disables the interface on violation.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Protect drops offending traffic silently — it does not err-disable the port like shutdown mode.',
        misconceptionTested: 'Choosing Protect for err-disable behavior',
      },
      {
        choiceIndex: 1,
        explanation: 'Restrict drops traffic and logs/snmp traps — shutdown mode goes further and err-disables the interface.',
        misconceptionTested: 'Confusing Restrict with err-disable shutdown mode',
      },
      {
        choiceIndex: 3,
        explanation: 'Permit all is not a violation mode — shutdown err-disables the port when unauthorized MACs appear.',
        misconceptionTested: 'Selecting permit-all as violation response',
      },
    ],
    examTip: 'Port security **shutdown** mode → **err-disable** on violation.',
  },
  'obj-5.6-depth-q3': {
    correct: {
      choiceIndex: 1,
      explanation: 'DAI validates ARP against DHCP snooping bindings on untrusted ports.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'MAC address table tracks learned hardware addresses — DAI specifically validates ARP against DHCP snooping binding entries.',
        misconceptionTested: 'Using CAM table alone for DAI validation',
      },
      {
        choiceIndex: 2,
        explanation: 'OSPF LSDB stores routing topology — DAI depends on DHCP snooping bindings to verify IP-to-MAC mappings.',
        misconceptionTested: 'Linking OSPF LSDB to ARP inspection',
      },
      {
        choiceIndex: 3,
        explanation: 'NAT translation table maps inside/outside addresses — DAI uses DHCP snooping binding table for ARP validation.',
        misconceptionTested: 'Confusing NAT table with DAI binding source',
      },
    ],
    examTip: 'DAI on untrusted ports → validate ARP vs **DHCP snooping bindings**.',
  },
  'obj-5.8-depth-q3': {
    correct: {
      choiceIndex: 1,
      explanation: 'WEP IV reuse makes it unsuitable for any production WLAN.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'WEP is not rejected for speed — it is cryptographically broken and cracked in minutes, making it unsuitable for production.',
        misconceptionTested: 'Believing WEP is slow rather than insecure',
      },
      {
        choiceIndex: 2,
        explanation: 'WEP predates WPA3 — the issue is broken encryption, not WPA3 hardware requirement.',
        misconceptionTested: 'Claiming WEP requires WPA3 hardware',
      },
      {
        choiceIndex: 3,
        explanation: 'WEP uses RC4, not AES — the security failure is cryptographic weakness, not AES disablement.',
        misconceptionTested: 'Thinking WEP disables AES as the main problem',
      },
    ],
    examTip: '**WEP** = broken IV reuse — use **WPA2-AES / WPA3**.',
  },
  'obj-5.8-depth-q4': {
    correct: {
      choiceIndex: 1,
      explanation: 'Enterprise mode uses 802.1X with RADIUS — distinct from WPA2-PSK.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Shared PSK is personal WPA2 mode — enterprise 802.1X authenticates each user via a RADIUS server.',
        misconceptionTested: 'Using PSK for enterprise per-user authentication',
      },
      {
        choiceIndex: 2,
        explanation: 'SNMP community manages network devices — WLAN user authentication uses 802.1X with RADIUS.',
        misconceptionTested: 'Confusing SNMP community with WLAN auth',
      },
      {
        choiceIndex: 3,
        explanation: 'Static WEP keys are obsolete — enterprise WLAN uses 802.1X/EAP with RADIUS for per-user credentials.',
        misconceptionTested: 'Choosing static WEP for enterprise WLAN',
      },
    ],
    examTip: 'Enterprise WLAN → **802.1X + RADIUS** (not shared PSK).',
  },
  'obj-5.4-depth-q3': {
    correct: {
      choiceIndex: 1,
      explanation: 'TACACS+ can authorize each CLI command; RADIUS is coarser.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'RADIUS combines auth and authorization in one flow — per-command CLI authorization on IOS is a TACACS+ strength.',
        misconceptionTested: 'Expecting per-command authZ from RADIUS only',
      },
      {
        choiceIndex: 2,
        explanation: 'SNMPv2c polls device MIBs — it does not provide per-command IOS authorization.',
        misconceptionTested: 'Using SNMP for CLI command authorization',
      },
      {
        choiceIndex: 3,
        explanation: 'CDP discovers neighbors — AAA per-command authorization requires TACACS+.',
        misconceptionTested: 'Selecting CDP for command-level authorization',
      },
    ],
    examTip: 'Per-command IOS authZ → **TACACS+** (AAA separated).',
  },
  '5.4-legacy-q005': {
    correct: {
      choiceIndex: 0,
      explanation: 'aaa new-model is the global configuration command that enables the AAA access-control model on the device.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'ip aaa enable is not valid IOS syntax — AAA begins with aaa new-model before authentication/authorization lines.',
        misconceptionTested: 'Inventing ip aaa enable as AAA prerequisite',
      },
      {
        choiceIndex: 2,
        explanation: 'service aaa does not exist as the AAA enabler — use aaa new-model in global configuration.',
        misconceptionTested: 'Using service aaa instead of aaa new-model',
      },
      {
        choiceIndex: 3,
        explanation: 'aaa start is not the IOS command — aaa new-model must be configured before any aaa authentication lines take effect.',
        misconceptionTested: 'Choosing aaa start as AAA enabler',
      },
    ],
    examTip: 'Before any AAA lines → **`aaa new-model`** in global config.',
  },
  '5.11-legacy-q001': {
    correct: {
      choiceIndex: 1,
      explanation: 'Segmentation divides a network into smaller zones with controlled boundaries, restricting lateral movement after compromise.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Segmentation controls blast radius — it does not increase total bandwidth available to every device.',
        misconceptionTested: 'Choosing bandwidth gain as primary segmentation benefit',
      },
      {
        choiceIndex: 2,
        explanation: 'Segmentation complements firewalls — it does not eliminate the need for policy enforcement between zones.',
        misconceptionTested: 'Believing segmentation removes firewall need',
      },
      {
        choiceIndex: 3,
        explanation: 'VLANs segment broadcast domains but do not automatically encrypt traffic — encryption requires explicit protocols.',
        misconceptionTested: 'Expecting automatic encryption from segmentation',
      },
    ],
    examTip: 'Segmentation limits **lateral movement** after breach.',
  },
  '5.11-legacy-q007': {
    correct: {
      choiceIndex: 1,
      explanation: 'Zero trust rejects trusted-inside/untrusted-outside — every access request is verified regardless of network location.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Zero trust explicitly denies implicit internal trust — location inside the perimeter does not grant automatic access.',
        misconceptionTested: 'Trusting all internal devices by default',
      },
      {
        choiceIndex: 2,
        explanation: 'Zero trust increases verification — it does not remove authentication for internal traffic.',
        misconceptionTested: 'Believing zero trust means no internal authentication',
      },
      {
        choiceIndex: 3,
        explanation: 'Zero trust applies to wired and wireless — it is a security model for all access, not wireless-only.',
        misconceptionTested: 'Limiting zero trust to wireless networks',
      },
    ],
    examTip: 'Zero trust = **verify every request** — no implicit LAN trust.',
  },
  'obj-5.10-depth-q3': {
    correct: {
      choiceIndex: 1,
      explanation: 'ESP encrypts and authenticates packet payload.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Routing updates use routing protocols — ESP provides confidentiality and integrity for IPsec tunnel payloads.',
        misconceptionTested: 'Expecting ESP to carry only routing updates',
      },
      {
        choiceIndex: 2,
        explanation: 'DHCP relay forwards broadcasts — ESP is an IPsec protocol for encrypting tunneled traffic.',
        misconceptionTested: 'Confusing ESP with DHCP relay',
      },
      {
        choiceIndex: 3,
        explanation: 'VLAN tagging is Layer 2 — ESP operates at Layer 3 for IPsec payload protection.',
        misconceptionTested: 'Assigning VLAN tagging role to ESP',
      },
    ],
    examTip: 'IPsec **ESP** = **encrypt + authenticate** payload.',
  },
  'obj-5.10-depth-q7': {
    correct: {
      choiceIndex: 1,
      explanation: 'GRE wraps packets; add IPsec for confidentiality/integrity.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'GRE provides encapsulation only — it does not encrypt traffic without pairing with IPsec.',
        misconceptionTested: 'Believing GRE encrypts by default',
      },
      {
        choiceIndex: 2,
        explanation: 'DHCP snooping is a Layer 2 security feature — GRE tunneling is unrelated to DHCP attack mitigation.',
        misconceptionTested: 'Linking GRE to DHCP snooping',
      },
      {
        choiceIndex: 3,
        explanation: 'AAA handles authentication — GRE does not automatically configure AAA; pair GRE with IPsec for encryption.',
        misconceptionTested: 'Expecting GRE to enable automatic AAA',
      },
    ],
    examTip: 'GRE alone = **tunnel only** — add **IPsec** for encryption.',
  },
  'obj-5.3-depth-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'enable secret stores a hashed password; enable password is reversible.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'enable password stores plaintext or weakly encoded secrets visible in config — enable secret uses MD5/SHA hashing.',
        misconceptionTested: 'Preferring enable password over enable secret',
      },
      {
        choiceIndex: 2,
        explanation: 'password enable plain is not standard IOS syntax — enable secret is the secure enable password command.',
        misconceptionTested: 'Inventing password enable plain syntax',
      },
      {
        choiceIndex: 3,
        explanation: 'service password-recovery aids console recovery — it does not replace enable secret for privileged mode protection.',
        misconceptionTested: 'Using password-recovery instead of enable secret',
      },
    ],
    examTip: 'Privileged password → **`enable secret`** (hashed, not plaintext).',
  },
  'obj-5.11-depth-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'Segmentation requires L3 controls between VLANs.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'VLANs segment broadcast domains at Layer 2 — they do not encrypt traffic without additional protocols.',
        misconceptionTested: 'Believing VLANs automatically encrypt traffic',
      },
      {
        choiceIndex: 2,
        explanation: 'Firewalls enforce policy between zones — VLANs alone do not replace firewall or ACL controls.',
        misconceptionTested: 'Thinking VLANs replace firewalls',
      },
      {
        choiceIndex: 3,
        explanation: 'Inter-VLAN routing is often required for communication — VLANs do not disable routing; security needs ACLs/firewalls at boundaries.',
        misconceptionTested: 'Claiming VLANs disable inter-VLAN routing for security',
      },
    ],
    examTip: 'VLANs ≠ security alone — add **ACLs/firewall** between zones.',
  },
}

const BATCH7_IDS = Object.keys(HAND)
if (BATCH7_IDS.length !== 25) {
  console.error(`Expected 25 entries, got ${BATCH7_IDS.length}`)
  process.exit(1)
}

const lines = [
  '/** Gold reviews — Batch 7: fundamentals/routing/security domains 1, 3, 5. */',
  'export const BATCH7_GOLD = {',
]
for (const [id, rev] of Object.entries(HAND)) {
  lines.push(`  '${id}': ${JSON.stringify(rev, null, 2).replace(/\n/g, '\n  ')},`)
}
lines.push('}', '')

writeFileSync('src/answerReview/goldAnswerReviewsBatch7.js', lines.join('\n'))
console.error(`Wrote ${BATCH7_IDS.length} entries to goldAnswerReviewsBatch7.js`)
console.log(BATCH7_IDS.join('\n'))
