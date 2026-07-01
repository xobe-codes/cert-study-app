/** Gold reviews — Batch 2: scenario/troubleshooting across domains 1–6. */
export const BATCH2_GOLD = {
  '1.1-c-q7': {
    correct: {
      choiceIndex: 1,
      explanation: 'Off-subnet traffic is sent to the configured default gateway — a router or L3 switch SVI — not to the access switch alone.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'The access switch forwards within the VLAN but does not route to remote subnets — the PC must ARP for its default gateway first.',
        misconceptionTested: 'Expecting the access switch to route inter-subnet traffic',
      },
      {
        choiceIndex: 2,
        explanation: 'The WLC manages wireless APs — it is not the first hop for a wired PC sending traffic to a remote subnet.',
        misconceptionTested: 'Dragging wireless controller into wired routing path',
      },
      {
        choiceIndex: 3,
        explanation: 'DNS resolves names to IPs — it is not in the Layer 3 forwarding path for packets already addressed to a remote subnet.',
        misconceptionTested: 'Confusing name resolution with default-gateway forwarding',
      },
    ],
    examTip: 'Same subnet → direct ARP. **Remote subnet → default gateway** first.',
  },
  '1.10-c-q2': {
    correct: {
      choiceIndex: 1,
      explanation: 'Same-subnet ping works but off-subnet fails — the default gateway is missing, wrong, or unreachable.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'DNS is not used for ping by IP address — same-subnet success proves Layer 2/3 local forwarding works; the break is at the gateway for remote targets.',
        misconceptionTested: 'Blaming DNS when pinging IP addresses directly',
      },
      {
        choiceIndex: 2,
        explanation: 'Wrong VLAN would typically break same-subnet communication too — here local /24 works, pointing to gateway or upstream routing.',
        misconceptionTested: 'Suspecting VLAN when only off-subnet fails',
      },
      {
        choiceIndex: 3,
        explanation: 'WPA3 is a wireless security protocol — it does not explain why same-subnet ICMP succeeds but Internet ping fails.',
        misconceptionTested: 'Dragging wireless security into IP routing troubleshooting',
      },
    ],
    examTip: 'Local works, remote fails → check **default gateway** before DNS or VLAN.',
  },
  '1.10-c-q5': {
    correct: {
      choiceIndex: 1,
      explanation: '169.254.x.x is APIPA — DHCP failed. Verify the DHCP server, relay (ip helper-address), and VLAN reachability.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'OSPF neighbors are irrelevant on an end host — APIPA means the PC never received a DHCP offer.',
        misconceptionTested: 'Checking routing protocol tables on a host DHCP failure',
      },
      {
        choiceIndex: 2,
        explanation: 'Fiber type affects physical link — APIPA appears when Layer 2 works but DHCP does not respond.',
        misconceptionTested: 'Suspecting physical media when DHCP is the root cause',
      },
      {
        choiceIndex: 3,
        explanation: 'VTP manages VLAN propagation between switches — a host with APIPA needs DHCP service, not VTP domain checks first.',
        misconceptionTested: 'Checking VTP before DHCP on an APIPA address',
      },
    ],
    examTip: '**169.254.x.x = no DHCP** — verify server, relay, and VLAN before anything else.',
  },
  '1.10-c-q6': {
    correct: {
      choiceIndex: 1,
      explanation: 'Ping gateway first (local L3), then a known public IP (end-to-end without DNS), then a hostname (DNS layer).',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Starting with a hostname tests DNS immediately — you cannot isolate whether failure is gateway, routing, or DNS.',
        misconceptionTested: 'Testing DNS before confirming gateway and routing',
      },
      {
        choiceIndex: 2,
        explanation: 'Broadcast and multicast pings are not a standard Internet troubleshooting sequence — use gateway → public IP → FQDN.',
        misconceptionTested: 'Using non-standard ICMP targets for layered isolation',
      },
      {
        choiceIndex: 3,
        explanation: 'Loopback-only tests local stack — it never validates default gateway or upstream connectivity.',
        misconceptionTested: 'Stopping at loopback when Internet path is the goal',
      },
    ],
    examTip: 'Layered ping: **gateway → public IP → hostname** to isolate L3 vs DNS.',
  },
  '1.10-c-q8': {
    correct: {
      choiceIndex: 0,
      explanation: 'Duplicate IP addresses cause ARP conflicts — hosts fight over the same IP and connectivity becomes intermittent.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Correct DNS does not produce ARP warnings — duplicate IPs trigger gratuitous ARP and flaky Layer 2 resolution.',
        misconceptionTested: 'Blaming DNS for ARP-layer conflict symptoms',
      },
      {
        choiceIndex: 2,
        explanation: 'Full-duplex on both ends is normal — it does not cause ARP conflict messages or intermittent loss.',
        misconceptionTested: 'Suspecting duplex mismatch when ARP points to duplicate IP',
      },
      {
        choiceIndex: 3,
        explanation: 'A valid DHCP lease assigns one unique address — duplicate IP usually means static overlap or rogue DHCP, not a healthy lease.',
        misconceptionTested: 'Assuming DHCP success when ARP warnings indicate conflict',
      },
    ],
    examTip: 'ARP warnings + flaky connectivity → suspect **duplicate IP** on the segment.',
  },
  '2.1-c-q6': {
    correct: {
      choiceIndex: 1,
      explanation: 'Voice VLAN plus data VLAN on one access port separates PC traffic (untagged data VLAN) from phone signaling/media (tagged voice VLAN).',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Cisco supports data + voice VLAN on a single access port — the phone acts as a mini-switch for the PC.',
        misconceptionTested: 'Believing one port cannot carry two VLAN types',
      },
      {
        choiceIndex: 2,
        explanation: 'The PC connects to the phone on an access port — the switch port is access with voice VLAN, not a trunk to the phone in the classic design.',
        misconceptionTested: 'Calling the switch-to-phone link a trunk when it is access + voice VLAN',
      },
      {
        choiceIndex: 3,
        explanation: 'Port security limits MAC addresses — it does not separate voice and data traffic types on a shared port.',
        misconceptionTested: 'Using port security where voice/data VLAN separation is required',
      },
    ],
    examTip: 'Phone + PC on one port → **data VLAN (untagged) + voice VLAN (tagged)**.',
  },
  '2.2-c-q3': {
    correct: {
      choiceIndex: 2,
      explanation: 'Native VLAN frames cross an 802.1Q trunk untagged — all other VLANs are tagged with their VLAN ID.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Double-tagging (Q-in-Q) is a provider technique — standard native VLAN traffic is sent with no 802.1Q tag.',
        misconceptionTested: 'Applying Q-in-Q to standard native VLAN behavior',
      },
      {
        choiceIndex: 1,
        explanation: 'Tagged frames carry an 802.1Q header — only non-native VLANs are tagged on a trunk.',
        misconceptionTested: 'Tagging native VLAN traffic like all other VLANs',
      },
      {
        choiceIndex: 3,
        explanation: 'Native VLAN traffic is forwarded normally — it is not dropped for lacking a tag.',
        misconceptionTested: 'Assuming untagged native VLAN frames are discarded',
      },
    ],
    examTip: 'Trunk rule: **native VLAN = untagged**; all others tagged. Match native VLAN both ends.',
  },
  '2.2-c-q4': {
    correct: {
      choiceIndex: 1,
      explanation: 'Native VLAN mismatch puts each switch\'s untagged traffic into the peer\'s native VLAN — traffic can leak between VLANs and CDP reports the error.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Trunk speed is negotiated separately — native VLAN mismatch affects which VLAN receives untagged frames, not link speed.',
        misconceptionTested: 'Confusing VLAN mismatch with speed/duplex issues',
      },
      {
        choiceIndex: 2,
        explanation: 'Tagged VLANs still work on a mismatched native VLAN trunk — the problem is untagged traffic landing in the wrong VLAN, not a total trunk shutdown.',
        misconceptionTested: 'Expecting all VLANs to fail when only native is mismatched',
      },
      {
        choiceIndex: 3,
        explanation: 'CDP logs `%CDP-4-NATIVE_VLAN_MISMATCH` because the misconfiguration has real forwarding impact — it is not cosmetic.',
        misconceptionTested: 'Treating native VLAN mismatch as harmless warning',
      },
    ],
    examTip: 'Native VLAN mismatch → **untagged traffic bleeds** into wrong VLAN. Fix both ends.',
  },
  'obj-2.4-source-q012': {
    correct: {
      choiceIndex: 2,
      explanation: 'Passive + active on both sides forms an LACP (802.3ad) EtherChannel — passive waits, active initiates.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'PAgP uses desirable/auto keywords — LACP uses active/passive. This pairing is LACP, not PAgP.',
        misconceptionTested: 'Labeling LACP active/passive as PAgP',
      },
      {
        choiceIndex: 1,
        explanation: 'Passive + active is a valid LACP combination — passive + passive would fail to negotiate.',
        misconceptionTested: 'Believing active/passive cannot form a channel',
      },
      {
        choiceIndex: 3,
        explanation: 'EtherChannel is the feature name — the question asks which protocol negotiates; LACP (802.3ad) is the answer for active/passive.',
        misconceptionTested: 'Answering generic EtherChannel when LACP protocol is required',
      },
    ],
    examTip: 'LACP: **active/passive** or **active/active**. PAgP: **desirable/auto**.',
  },
  '2.5-c-q3': {
    correct: {
      choiceIndex: 2,
      explanation: 'Default STP bridge priority is 32768 — lower numeric value wins root election (often set in increments of 4096).',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Priority 0 is the minimum (best) but not the default — Cisco ships switches at 32768 unless changed.',
        misconceptionTested: 'Confusing best possible priority with factory default',
      },
      {
        choiceIndex: 1,
        explanation: '4096 is a common increment when lowering priority — the default starting value is 32768.',
        misconceptionTested: 'Using common increment step as default priority',
      },
      {
        choiceIndex: 3,
        explanation: '65535 exceeds the valid STP priority range (0–61440 in multiples of 4096) — default is 32768.',
        misconceptionTested: 'Picking max 16-bit value instead of Cisco default',
      },
    ],
    examTip: 'Default STP priority = **32768**. Lower wins. Adjust in steps of **4096**.',
  },
  '3.2-c-q7': {
    correct: {
      choiceIndex: 1,
      explanation: 'Within one OSPF process, the lower cost route (10) is installed — metric breaks ties for the same prefix from the same protocol.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Higher OSPF cost is less preferred — cost 20 loses to cost 10 for the same prefix.',
        misconceptionTested: 'Selecting higher metric within one OSPF process',
      },
      {
        choiceIndex: 2,
        explanation: 'ECMP requires equal metrics — cost 10 and 20 are not equal, so only the lower-cost path is installed.',
        misconceptionTested: 'Expecting load balance across unequal OSPF costs',
      },
      {
        choiceIndex: 3,
        explanation: 'Both routes are OSPF (same AD 110) — AD only differs between routing sources, not between two OSPF paths to one prefix.',
        misconceptionTested: 'Invoking AD when comparing metrics within one protocol',
      },
    ],
    examTip: 'Same protocol, same prefix → **lower metric wins**. ECMP needs **equal** metrics.',
  },
  '3.2-c-q8': {
    correct: {
      choiceIndex: 1,
      explanation: '172.16.4.9 matches 172.16.0.0/16 — longest prefix match picks /16 over the less-specific 0.0.0.0/0 default.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Default route 0.0.0.0/0 matches everything but is the least specific — /16 is a longer match and wins forwarding.',
        misconceptionTested: 'Preferring default route over more specific prefix',
      },
      {
        choiceIndex: 2,
        explanation: 'AD breaks ties between different sources to the same prefix — here both routes exist and LPM at forward time picks /16.',
        misconceptionTested: 'Using AD instead of longest prefix match at forward time',
      },
      {
        choiceIndex: 3,
        explanation: 'A matching /16 route exists — the packet is forwarded via R2, not dropped.',
        misconceptionTested: 'Assuming drop when both default and specific routes exist',
      },
    ],
    examTip: 'Forwarding: **longest prefix match** beats default route every time.',
  },
  '3.2-c-q11': {
    correct: {
      choiceIndex: 0,
      explanation: 'A plain static route has AD 1, which beats OSPF AD 110 — the static is always preferred. Use floating static with higher AD (e.g. 130) for backup-only behavior.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'OSPF metric is irrelevant here — the static wins because AD 1 < 110, not because of OSPF cost.',
        misconceptionTested: 'Blaming OSPF metric when AD causes static preference',
      },
      {
        choiceIndex: 2,
        explanation: '/8 mask matches 10.0.0.0/8 correctly — the problem is administrative distance, not subnet mask.',
        misconceptionTested: 'Suspecting mask error when AD is the issue',
      },
      {
        choiceIndex: 3,
        explanation: 'Default routes are a prefix length issue — this is a static vs OSPF AD competition for 10.0.0.0/8.',
        misconceptionTested: 'Dragging default-route logic into floating-static AD trap',
      },
    ],
    examTip: 'Backup static only when primary fails → set **higher AD** than the primary (floating static).',
  },
  'obj-3.1-source-q018': {
    correct: {
      choiceIndex: 2,
      explanation: 'EIGRP supports unequal-cost load balancing and uses composite metrics tuned for varied link bandwidths — ideal for mixed-speed enterprise networks.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'RIPv1 is classful, limited to 15 hops, and ignores bandwidth — it cannot optimize across varied link speeds.',
        misconceptionTested: 'Choosing legacy classful RIP for heterogeneous bandwidth',
      },
      {
        choiceIndex: 1,
        explanation: 'RIPv2 adds VLSM but still uses hop count only — it does not factor bandwidth the way EIGRP\'s composite metric does.',
        misconceptionTested: 'Expecting RIPv2 to optimize for bandwidth differences',
      },
      {
        choiceIndex: 3,
        explanation: 'BGP is an exterior path-vector protocol for inter-AS routing — not the IGP choice for internal varied-bandwidth optimization.',
        misconceptionTested: 'Selecting BGP for internal enterprise IGP scenario',
      },
    ],
    examTip: 'Varied bandwidths inside one AS → **EIGRP** (composite metric). RIP = hop count only.',
  },
  '3.1-q2': {
    correct: {
      choiceIndex: 1,
      explanation: 'IOS shows [AD/metric] — 110 is OSPF\'s administrative distance; 20 is the OSPF cost (metric).',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'The metric is the second number (20) — 110 is AD, not the OSPF cost.',
        misconceptionTested: 'Swapping AD and metric in bracket notation',
      },
      {
        choiceIndex: 2,
        explanation: 'OSPF cost is the metric (20 here) — 110 is the well-known AD value for OSPF routes.',
        misconceptionTested: 'Identifying cost where AD belongs in [AD/metric]',
      },
      {
        choiceIndex: 3,
        explanation: 'Hop count is RIP\'s metric — OSPF uses cost based on bandwidth; 110 is AD in the bracket format.',
        misconceptionTested: 'Applying RIP hop-count thinking to OSPF route display',
      },
    ],
    examTip: 'Route table `[110/20]` → **110 = AD**, **20 = metric**. Always read left first.',
  },
  '4.1-c-q4': {
    correct: {
      choiceIndex: 1,
      explanation: 'NAT requires `ip nat inside` and `ip nat outside` on the correct interfaces — without these tags, translation never occurs.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'A default route helps reach the Internet but does not enable NAT — inside/outside interface designation is mandatory.',
        misconceptionTested: 'Adding default route when NAT direction tags are missing',
      },
      {
        choiceIndex: 2,
        explanation: 'Loopbacks are not required for basic NAT — the missing inside/outside labels prevent any translation.',
        misconceptionTested: 'Creating loopback instead of labeling NAT interfaces',
      },
      {
        choiceIndex: 3,
        explanation: 'DNS resolves names — NAT operates on IP headers and needs inside/outside interface roles defined first.',
        misconceptionTested: 'Checking DNS when NAT interface roles are unset',
      },
    ],
    examTip: 'NAT broken? First check **`ip nat inside` / `ip nat outside`** on the right interfaces.',
  },
  '4.1-q1': {
    correct: {
      choiceIndex: 2,
      explanation: 'NAT translates private RFC 1918 addresses to public addresses so internal hosts can reach the Internet.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'CIDR is efficient address allocation notation — it does not translate private addresses for Internet access.',
        misconceptionTested: 'Equating CIDR with address translation',
      },
      {
        choiceIndex: 1,
        explanation: 'Classful addressing is obsolete — RFC 1918 private space still needs NAT (or proxy) to reach public Internet.',
        misconceptionTested: 'Expecting classful rules to enable Internet from private space',
      },
      {
        choiceIndex: 3,
        explanation: 'VPN encrypts/tunnels traffic — the question asks how RFC 1918 hosts reach the Internet, which is NAT/PAT.',
        misconceptionTested: 'Choosing VPN when NAT is the standard exam answer',
      },
    ],
    examTip: 'Private RFC 1918 → Internet = **NAT/PAT**. Label inside/outside first.',
  },
  'obj-4.1-source-q009': {
    correct: {
      choiceIndex: 1,
      explanation: 'Dynamic NAT uses an ACL to identify which inside local addresses are permitted to be translated outbound.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'The ACL for dynamic NAT matches inside sources going out — it does not permit inbound connections from outside global addresses.',
        misconceptionTested: 'Reversing NAT ACL direction (inbound vs outbound)',
      },
      {
        choiceIndex: 2,
        explanation: 'Outside local addresses are how outsiders appear inside — dynamic NAT ACLs match inside local sources, not outside local.',
        misconceptionTested: 'Confusing outside local with inside local in NAT ACL',
      },
      {
        choiceIndex: 3,
        explanation: 'Inside global is the translated public face — the ACL selects inside local hosts before translation occurs.',
        misconceptionTested: 'Matching inside global instead of inside local pre-translation',
      },
    ],
    examTip: 'Dynamic NAT ACL → match **inside local** sources allowed to translate outbound.',
  },
  '4.10-legacy-q003': {
    correct: {
      choiceIndex: 1,
      explanation: 'Cloud-managed APs usually keep forwarding locally (data plane) but lose dashboard management, config push, and analytics until WAN returns.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Clients typically stay connected — local forwarding continues; only cloud management/control is interrupted.',
        misconceptionTested: 'Assuming total wireless outage when cloud link drops',
      },
      {
        choiceIndex: 2,
        explanation: 'APs do not factory-reset on WAN loss — they run last-known config and resume cloud sync when connectivity returns.',
        misconceptionTested: 'Expecting automatic factory reset on management outage',
      },
      {
        choiceIndex: 3,
        explanation: 'Wired switch forwarding is independent — the scenario describes cloud AP management loss, not wired data-plane failure.',
        misconceptionTested: 'Extending AP management outage to wired switching',
      },
    ],
    examTip: 'Cloud WAN down → **local forwarding continues**; management/analytics pause.',
  },
  'obj-5.1-source-q003': {
    correct: {
      choiceIndex: 2,
      explanation: 'IPS (Intrusion Prevention System) detects and actively blocks malicious traffic inline — prevention, not just detection.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Honeypots decoy attackers for analysis — they do not inline-prevent intrusions across the production network.',
        misconceptionTested: 'Confusing honeypot decoy with inline prevention',
      },
      {
        choiceIndex: 1,
        explanation: 'IDS detects and alerts but does not block inline — IPS adds active prevention on the traffic path.',
        misconceptionTested: 'Selecting detect-only IDS when prevention is required',
      },
      {
        choiceIndex: 3,
        explanation: 'HIDS monitors a single host — the question asks about network-level intrusion prevention.',
        misconceptionTested: 'Choosing host-based detection for network prevention question',
      },
    ],
    examTip: '**IDS = detect/alert**. **IPS = detect + block inline**.',
  },
  'obj-5.1-source-q012': {
    correct: {
      choiceIndex: 0,
      explanation: 'Perimeter ACLs can deny packets with source addresses that should not arrive from outside (anti-spoofing / BCP 38 style filtering).',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'IDS detects suspicious activity — it does not filter spoofed source IPs at the perimeter like an ACL can.',
        misconceptionTested: 'Using IDS where ingress ACL filtering is needed',
      },
      {
        choiceIndex: 2,
        explanation: 'SSL/TLS encrypts application traffic — it does not validate or block spoofed IP source addresses at the edge.',
        misconceptionTested: 'Expecting SSL to prevent IP spoofing',
      },
      {
        choiceIndex: 3,
        explanation: 'HIDS protects individual hosts — spoofing at the perimeter requires ingress filtering on the border router/firewall.',
        misconceptionTested: 'Relying on host IDS for perimeter anti-spoofing',
      },
    ],
    examTip: 'Block spoofed internal sources at the edge with **ingress ACLs** (deny impossible source IPs).',
  },
  'obj-5.5-source-q004': {
    correct: {
      choiceIndex: 2,
      explanation: 'Without a route to the remote tunnel endpoint (203.0.113.2), the GRE tunnel cannot come up — the underlay must be reachable first.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'The comment explicitly states no route to the remote endpoint — GRE requires reachable tunnel destination in the routing table.',
        misconceptionTested: 'Ignoring missing underlay route to tunnel endpoint',
      },
      {
        choiceIndex: 1,
        explanation: 'The destination IP may be correct — the failure is that no routing entry reaches that network, making the tunnel unroutable.',
        misconceptionTested: 'Blaming wrong destination when underlay routing is missing',
      },
      {
        choiceIndex: 3,
        explanation: 'Serial interfaces on different subnets is normal for a point-to-point WAN — the issue is no route to 203.0.113.0/peer endpoint.',
        misconceptionTested: 'Flagging P2P addressing when underlay route is absent',
      },
    ],
    examTip: 'GRE tunnel up requires **reachable tunnel destination** in routing table (underlay first).',
  },
  'obj-6.3-source-q020': {
    correct: {
      choiceIndex: 3,
      explanation: 'ACLs enforce forwarding policy — configuring them affects the control plane that programs what the data plane allows.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Management plane covers device administration (SSH, SNMP) — ACL configuration defines traffic policy, which is control plane.',
        misconceptionTested: 'Equating ACL policy with device management plane',
      },
      {
        choiceIndex: 1,
        explanation: '"Configuration plane" is not a standard Cisco three-plane term — ACLs belong to control plane policy.',
        misconceptionTested: 'Inventing non-standard plane name for ACL config',
      },
      {
        choiceIndex: 2,
        explanation: 'Data plane forwards packets — you configure ACL rules (control plane) that the data plane then enforces.',
        misconceptionTested: 'Confusing policy configuration with packet forwarding plane',
      },
    ],
    examTip: 'Three planes: **data** = forward, **control** = routing/ACL policy, **management** = admin access.',
  },
  'obj-6.4-source-q003': {
    correct: {
      choiceIndex: 2,
      explanation: 'DNA Center Assurance dashboard shows network health, client experience, and proactive issue detection across the fabric.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Design is for topology and site hierarchy planning — health monitoring lives in Assurance.',
        misconceptionTested: 'Using Design section for operational health view',
      },
      {
        choiceIndex: 1,
        explanation: 'Policy configures group-based access and segmentation — Assurance reports health and performance.',
        misconceptionTested: 'Confusing policy configuration with health dashboard',
      },
      {
        choiceIndex: 3,
        explanation: 'Platform covers system settings and integrations — not the primary network health overview.',
        misconceptionTested: 'Selecting platform admin for network health monitoring',
      },
    ],
    examTip: 'DNA Center: **Assurance** = health/clients/issues. **Design** = topology. **Policy** = segmentation.',
  },
  'obj-6.4-source-q006': {
    correct: {
      choiceIndex: 2,
      explanation: 'DNA Command Runner executes CLI templates across many devices — fastest way to push OSPF area config to a device group.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'IP-based access control is a security feature — not a bulk configuration tool for OSPF areas.',
        misconceptionTested: 'Using access control feature for routing configuration',
      },
      {
        choiceIndex: 1,
        explanation: 'Python/API scripting is powerful but Command Runner is the built-in DNA Center method for quick multi-device CLI pushes.',
        misconceptionTested: 'Defaulting to Python when Command Runner is the exam shortcut',
      },
      {
        choiceIndex: 3,
        explanation: 'Inventory lists devices — it does not execute configuration. Command Runner applies templates at scale.',
        misconceptionTested: 'Expecting Inventory to push config without Command Runner',
      },
    ],
    examTip: 'Bulk CLI on many routers in DNA Center → **Command Runner** templates.',
  },
}
