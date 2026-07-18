/**
 * Blueprint-adjacent Wave 1 — recognition/explain foundations that support
 * Cisco's "other related topics may also appear" exam language.
 * Depth cap: recognize / explain / troubleshoot-lite. No obsolete configure drills.
 */

export const BLUEPRINT_ADJACENT_WAVE1_PATCHES = {
  '1.4': {
    reading: {
      related: [
        'Blueprint-adjacent: MTU / PMTUD / TCP MSS — when small pings work but large transfers fail, look for path MTU black holes and fragmentation issues, not only duplex/CRC.',
      ],
      commonMistakes: [
        'Blueprint-adjacent: Assuming every oversized packet is silently fragmented end-to-end — many paths drop DF packets, so PMTUD or MSS clamping matters.',
      ],
    },
    examTraps: [
      {
        id: '1.4-ba-t1',
        trap: 'If ping works, the path MTU must be fine for all traffic.',
        correction: '**Blueprint-adjacent:** Small ICMP may succeed while large TCP fails when PMTUD is broken or MSS is too high for the path.',
        ckuIds: ['CKU-INTERFACE-STATUS'],
      },
    ],
    flashcards: [
      {
        id: '1.4-ba-f1',
        ckuId: 'CKU-INTERFACE-STATUS',
        front: 'Blueprint-adjacent: what does PMTUD do?',
        back: 'Path MTU Discovery finds the smallest MTU along a path so hosts can avoid black-holed large packets (especially with DF set).',
      },
    ],
    questions: [
      {
        id: '1.4-ba-q1',
        concept: 'pmtud',
        type: 'scenario',
        difficulty: 'medium',
        question: 'Small pings succeed across a WAN, but large file transfers stall. Which blueprint-adjacent cause is most likely?',
        choices: [
          'Path MTU / fragmentation black hole',
          'STP root bridge election failure',
          'Missing OSPF process ID',
          'Wrong DNS server only',
        ],
        correctIndex: 0,
        explanation: 'When small packets work and large ones fail, suspect MTU/PMTUD or MSS issues along the path.',
        ckuIds: ['CKU-INTERFACE-STATUS'],
      },
    ],
  },

  '1.10': {
    reading: {
      related: [
        'Blueprint-adjacent: ARP lifecycle — hosts resolve IP→MAC with ARP requests/replies, cache the mapping, and may use gratuitous ARP for duplicate-IP detection or failover announcements.',
      ],
      commonMistakes: [
        'Blueprint-adjacent: Blaming “routing” when the local ARP cache is stale or a duplicate IP is poisoning the gateway MAC.',
      ],
    },
    examTraps: [
      {
        id: '1.10-ba-t1',
        trap: 'ARP only matters on the first hop; later hops reuse the same MAC.',
        correction: '**Blueprint-adjacent:** Each L2 segment resolves next-hop MAC locally. Routers rewrite L2 headers hop by hop.',
        ckuIds: ['CKU-CLIENT-IP'],
      },
    ],
    flashcards: [
      {
        id: '1.10-ba-f1',
        ckuId: 'CKU-CLIENT-IP',
        front: 'Blueprint-adjacent: what is gratuitous ARP used for?',
        back: 'Announce or refresh an IP→MAC binding (failover/duplicate detection) without waiting for a normal ARP request.',
      },
    ],
    questions: [
      {
        id: '1.10-ba-q1',
        concept: 'arp cache',
        type: 'definition',
        difficulty: 'easy',
        question: 'What does a host ARP cache store?',
        choices: [
          'IP address to MAC address mappings for local-segment delivery',
          'OSPF neighbor router IDs',
          'DNS A records for the Internet',
          'VLAN trunk allowed lists',
        ],
        correctIndex: 0,
        explanation: 'ARP maps IPv4 addresses to MAC addresses on the local broadcast domain.',
        ckuIds: ['CKU-CLIENT-IP'],
      },
    ],
  },

  '2.2': {
    reading: {
      related: [
        'Blueprint-adjacent: VTP — Cisco VLAN Trunking Protocol can propagate VLAN databases; a higher revision number can overwrite your VLAN list if a switch with stale VLANs is introduced.',
      ],
      commonMistakes: [
        'Blueprint-adjacent: Treating VTP as required for trunks — 802.1Q trunks work without VTP; VTP only syncs VLAN definitions.',
      ],
    },
    examTraps: [
      {
        id: '2.2-ba-t1',
        trap: 'Connecting any switch is safe because VTP never overwrites local VLANs.',
        correction: '**Blueprint-adjacent:** A higher VTP revision can wipe/replace the VLAN database — verify domain/mode/revision before attaching lab switches.',
        ckuIds: ['CKU-TRUNKING'],
      },
    ],
    flashcards: [
      {
        id: '2.2-ba-f1',
        ckuId: 'CKU-TRUNKING',
        front: 'Blueprint-adjacent: VTP revision risk?',
        back: 'A switch with a higher revision can overwrite VLAN definitions across the VTP domain — dangerous in labs and production.',
      },
    ],
    questions: [
      {
        id: '2.2-ba-q1',
        concept: 'vtp revision',
        type: 'scenario',
        difficulty: 'medium',
        question: 'A lab switch with an old VLAN list but higher VTP revision joins the domain. What is the blueprint-adjacent risk?',
        choices: [
          'It can overwrite the domain VLAN database',
          'It disables all 802.1Q trunks automatically',
          'It converts OSPF into RIP',
          'It forces PortFast on every uplink',
        ],
        correctIndex: 0,
        explanation: 'VTP syncs by revision number — higher revision wins, even if the content is wrong.',
        ckuIds: ['CKU-TRUNKING'],
      },
    ],
  },

  '2.5': {
    reading: {
      related: [
        'Blueprint-adjacent: Root Guard / Loop Guard — complete STP edge protection after PortFast + BPDU Guard (Root Guard blocks superior BPDUs on designated ports; Loop Guard prevents alternate/root ports from becoming designated when BPDUs stop).',
        'Blueprint-adjacent: STP vs routing loops — STP is Layer 2 only. Layer 3 loop damage is limited by TTL; DV protocols use split horizon/poison/hold-down; OSPF uses LSDB+SPF; EIGRP uses DUAL feasibility.',
      ],
      commonMistakes: [
        'Blueprint-adjacent: Saying “STP uses split horizon” — split horizon is a distance-vector routing update rule, not an STP mechanism.',
      ],
    },
    examTraps: [
      {
        id: '2.5-ba-t1',
        trap: 'STP prevents IP routing loops with split horizon.',
        correction: '**Blueprint-adjacent:** STP blocks Layer 2 switching loops. Routing loops are handled by TTL and routing-protocol logic (DV tricks or SPF/DUAL), not STP.',
        ckuIds: ['CKU-STP'],
      },
      {
        id: '2.5-ba-t2',
        trap: 'PortFast + BPDU Guard are the only STP protection features worth knowing.',
        correction: '**Blueprint-adjacent:** Also recognize Root Guard (block superior BPDUs) and Loop Guard (prevent unexpected transition when BPDUs stop).',
        ckuIds: ['CKU-STP'],
      },
    ],
    flashcards: [
      {
        id: '2.5-ba-f1',
        ckuId: 'CKU-STP',
        front: 'Blueprint-adjacent: Root Guard purpose?',
        back: 'Prevents a port from accepting a superior BPDU and becoming a new root path — keeps the intended root bridge.',
      },
      {
        id: '2.5-ba-f2',
        ckuId: 'CKU-STP',
        front: 'Does STP prevent routing loops?',
        back: 'No. STP is Layer 2 only. Routing loops are limited by TTL and routing-protocol loop prevention (DV or SPF/DUAL).',
      },
    ],
    questions: [
      {
        id: '2.5-ba-q1',
        concept: 'stp vs routing loops',
        type: 'definition',
        difficulty: 'easy',
        question: 'Which statement is true about STP and routing loops?',
        choices: [
          'STP prevents Layer 2 loops; routing loops are handled by L3 mechanisms',
          'STP uses split horizon to stop OSPF loops',
          'STP replaces TTL on IP packets',
          'STP elects the OSPF DR on each VLAN',
        ],
        correctIndex: 0,
        explanation: 'STP is a Layer 2 topology protocol. IP routing loops are a Layer 3 concern.',
        ckuIds: ['CKU-STP'],
      },
    ],
  },

  '3.1': {
    reading: {
      related: [
        'Blueprint-adjacent: Distance-vector loop prevention — split horizon (do not advertise a route back out the interface learned on), route poisoning/poison reverse (advertise unreachable / metric ∞), count-to-infinity risk, and hold-down timers (ignore worse updates briefly).',
        'Blueprint-adjacent: EIGRP feasible successor — backup next hop stored in the topology table when advertised distance < feasible distance (DUAL). Recognition only; not a CCNA configure objective.',
        'Blueprint-adjacent: OSPF does NOT rely on split horizon — it stays loop-free because routers share a topology (LSDB) and each runs SPF.',
      ],
      keyPoints: [
        'Blueprint-adjacent: RIP/EIGRP codes and AD are recognition topics; DV loop tricks explain why those protocols need update rules OSPF does not use.',
      ],
      commonMistakes: [
        'Blueprint-adjacent: Claiming OSPF uses split horizon for loop prevention — OSPF uses LSDB + SPF.',
        'Blueprint-adjacent: Treating EIGRP feasible successor as something you must configure like OSPF network statements — recognition only on CCNA.',
      ],
    },
    examTraps: [
      {
        id: '3.1-ba-t1',
        trap: 'Split horizon is an OSPF SPF feature.',
        correction: '**Blueprint-adjacent:** Split horizon is a classic distance-vector update rule. OSPF prevents loops with a shared LSDB and SPF calculation.',
        ckuIds: ['CKU-ROUTING-TABLE'],
      },
      {
        id: '3.1-ba-t2',
        trap: 'Poison reverse means the route is deleted silently with no update.',
        correction: '**Blueprint-adjacent:** Poison reverse / route poisoning advertises the destination as unreachable (e.g., RIP metric 16) so neighbors drop it faster.',
        ckuIds: ['CKU-ROUTING-TABLE'],
      },
      {
        id: '3.1-ba-t3',
        trap: 'EIGRP feasible successors are always installed in the routing table.',
        correction: '**Blueprint-adjacent:** The successor is in the RIB; a feasible successor stays in the topology table until needed (if RD < FD).',
        ckuIds: ['CKU-ROUTING-TABLE'],
      },
    ],
    flashcards: [
      {
        id: '3.1-ba-f1',
        ckuId: 'CKU-ROUTING-TABLE',
        front: 'What is split horizon?',
        back: '**Blueprint-adjacent:** A distance-vector rule: do not advertise a route back out the same interface you learned it on, reducing routing loops.',
      },
      {
        id: '3.1-ba-f2',
        ckuId: 'CKU-ROUTING-TABLE',
        front: 'What problem does count-to-infinity describe?',
        back: '**Blueprint-adjacent:** In DV protocols, a looped update can keep increasing metric until infinity — poison reverse/hold-down help contain it.',
      },
      {
        id: '3.1-ba-f3',
        ckuId: 'CKU-ROUTING-TABLE',
        front: 'EIGRP feasible successor condition?',
        back: '**Blueprint-adjacent:** Advertised/reported distance of the backup path must be less than the feasible distance of the successor (RD < FD).',
      },
      {
        id: '3.1-ba-f4',
        ckuId: 'CKU-ROUTING-TABLE',
        front: 'Does OSPF use split horizon?',
        back: '**Blueprint-adjacent:** No as its primary loop prevention. OSPF floods topology (LSAs), builds an LSDB, and runs SPF.',
      },
    ],
    questions: [
      {
        id: '3.1-ba-q1',
        concept: 'split horizon',
        type: 'definition',
        difficulty: 'medium',
        question: 'What does split horizon do in a distance-vector routing protocol?',
        choices: [
          'Prevents advertising a route back out the interface it was learned on',
          'Elects the OSPF designated router on a LAN',
          'Blocks Layer 2 loops with BPDUs',
          'Increases administrative distance for floating statics',
        ],
        correctIndex: 0,
        explanation: 'Split horizon stops a router from echoing a learned route back toward the neighbor that advertised it.',
        ckuIds: ['CKU-ROUTING-TABLE'],
      },
      {
        id: '3.1-ba-q2',
        concept: 'poison reverse',
        type: 'definition',
        difficulty: 'medium',
        question: 'In RIP-style distance-vector behavior, advertising a network with metric 16 most nearly means:',
        choices: [
          'The destination is unreachable (route poisoning)',
          'The route is preferred over OSPF',
          'The path has exactly 16 equal-cost next hops',
          'Split horizon is disabled permanently',
        ],
        correctIndex: 0,
        explanation: 'RIP’s infinity is 16 — advertising metric 16 poisons the route as unreachable.',
        ckuIds: ['CKU-ROUTING-TABLE'],
      },
      {
        id: '3.1-ba-q3',
        concept: 'ospf vs split horizon',
        type: 'definition',
        difficulty: 'medium',
        question: 'How does OSPF primarily remain loop-free compared with classic distance-vector protocols?',
        choices: [
          'Shared link-state database and SPF calculation',
          'Split horizon on every interface',
          'Hold-down timers on every LSA',
          'Poison reverse with metric 16',
        ],
        correctIndex: 0,
        explanation: 'OSPF routers compute paths from a common topology database; they do not rely on split horizon the way DV protocols do.',
        ckuIds: ['CKU-ROUTING-TABLE', 'CKU-OSPF'],
      },
      {
        id: '3.1-ba-q4',
        concept: 'feasible successor',
        type: 'definition',
        difficulty: 'medium',
        question: 'In EIGRP, a feasible successor is best described as:',
        choices: [
          'A loop-free backup next hop that meets the feasibility condition (RD < FD)',
          'Any OSPF neighbor in FULL state',
          'A floating static with AD 1',
          'The DR on a multi-access segment',
        ],
        correctIndex: 0,
        explanation: 'EIGRP stores qualifying backups in the topology table using DUAL’s feasibility condition.',
        ckuIds: ['CKU-ROUTING-TABLE'],
      },
    ],
  },

  '3.4': {
    reading: {
      related: [
        'Blueprint-adjacent: OSPF vs DV loop prevention — OSPF remains loop-free because routers share topology (LSDB) and each runs SPF; DV protocols need split horizon, poisoning, and hold-downs.',
        'Blueprint-adjacent: Route redistribution — routes do not cross protocol boundaries automatically; an ASBR/redistribution point is required (recognition only on CCNA).',
        'Blueprint-adjacent: OSPFv3 recognition — IPv6 OSPF uses link-local neighbor relationships; process/interface enabling differs from OSPFv2, but CCNA configure-and-verify focus remains OSPFv2.',
      ],
      commonMistakes: [
        'Blueprint-adjacent: Expecting OSPF to use split horizon like RIP — wrong mechanism family.',
      ],
    },
    examTraps: [
      {
        id: '3.4-ba-t1',
        trap: 'OSPF prevents loops primarily with split horizon and hold-down timers.',
        correction: '**Blueprint-adjacent:** OSPF uses synchronized LSDBs and SPF. Split horizon/hold-downs are classic DV tools.',
        ckuIds: ['CKU-OSPF'],
      },
      {
        id: '3.4-ba-t2',
        trap: 'If OSPF and EIGRP both run, routes automatically appear in both databases.',
        correction: '**Blueprint-adjacent:** Redistribution/ASBR behavior is required to move routes between protocols — it is not automatic.',
        ckuIds: ['CKU-OSPF'],
      },
    ],
    flashcards: [
      {
        id: '3.4-ba-f1',
        ckuId: 'CKU-OSPF',
        front: 'Why can OSPF skip classic split horizon?',
        back: '**Blueprint-adjacent:** Each router computes a shortest-path tree from a shared topology database instead of trusting second-hand DV vectors.',
      },
      {
        id: '3.4-ba-f2',
        ckuId: 'CKU-OSPF',
        front: 'What is route redistribution (recognition)?',
        back: '**Blueprint-adjacent:** Manually/conditionally injecting routes from one protocol/domain into another — not automatic just because both run.',
      },
    ],
    questions: [
      {
        id: '3.4-ba-q1',
        concept: 'ospf loop free',
        type: 'definition',
        difficulty: 'medium',
        question: 'Which mechanism best explains OSPF loop prevention versus RIP-style distance vector?',
        choices: [
          'Identical LSDBs and SPF trees instead of split-horizon update rules',
          'Advertising metric 16 on every interface',
          'Blocking BPDUs on access ports',
          'Using AD 120 for all OSPF routes',
        ],
        correctIndex: 0,
        explanation: 'OSPF’s topology + SPF model replaces classic DV loop-prevention tricks.',
        ckuIds: ['CKU-OSPF'],
      },
    ],
  },

  '4.4': {
    reading: {
      related: [
        'Blueprint-adjacent: NetFlow vs SNMP vs syslog — NetFlow/flow records show who talked to whom; SNMP polls device metrics; syslog logs events/messages.',
        'Blueprint-adjacent: IP SLA / object tracking — synthetic probes can watch reachability and influence failover (static/FHRP) when a path dies.',
        'Blueprint-adjacent: SPAN/RSPAN — copy traffic from a source port/VLAN to a capture destination for packet analysis.',
      ],
      commonMistakes: [
        'Blueprint-adjacent: Treating syslog as traffic accounting — syslog is event logging, not flow telemetry.',
      ],
    },
    examTraps: [
      {
        id: '4.4-ba-t1',
        trap: 'SNMP traps and NetFlow records are the same telemetry.',
        correction: '**Blueprint-adjacent:** SNMP exposes managed objects/alerts; NetFlow exports conversation/flow statistics.',
        ckuIds: ['CKU-SNMP'],
      },
    ],
    flashcards: [
      {
        id: '4.4-ba-f1',
        ckuId: 'CKU-SNMP',
        front: 'NetFlow vs SNMP in one line?',
        back: '**Blueprint-adjacent:** NetFlow = traffic flows; SNMP = device/MIB metrics and traps; syslog = log messages.',
      },
      {
        id: '4.4-ba-f2',
        ckuId: 'CKU-SNMP',
        front: 'What is IP SLA used for (recognition)?',
        back: '**Blueprint-adjacent:** Generate probes (latency/reachability) and optionally track objects for failover decisions.',
      },
    ],
    questions: [
      {
        id: '4.4-ba-q1',
        concept: 'netflow vs snmp',
        type: 'definition',
        difficulty: 'easy',
        question: 'Which monitoring tool is designed primarily to report traffic conversation/flow statistics?',
        choices: ['NetFlow', 'Syslog severity 5 only', 'CDP', 'STP'],
        correctIndex: 0,
        explanation: 'NetFlow (and similar flow exporters) summarize who talked to whom and how much.',
        ckuIds: ['CKU-SNMP'],
      },
    ],
  },

  '5.10': {
    reading: {
      related: [
        'Blueprint-adjacent: PKI trust chain — a certificate is trusted when signed by a known CA (or intermediate) that your device trusts; check identity, validity period, and revocation where supported.',
        'Blueprint-adjacent: MACsec vs IPsec — MACsec protects hop-by-hop on a link (L2); IPsec protects routed/tunneled traffic (L3 VPN).',
      ],
      commonMistakes: [
        'Blueprint-adjacent: Assuming any certificate presented by a peer is trusted without a CA/trust anchor.',
      ],
    },
    examTraps: [
      {
        id: '5.10-ba-t1',
        trap: 'A certificate is valid simply because it is encrypted.',
        correction: '**Blueprint-adjacent:** Trust requires a valid chain to a trusted CA, matching identity, and a current validity period — encryption alone is not trust.',
        ckuIds: ['CKU-VPN'],
      },
    ],
    flashcards: [
      {
        id: '5.10-ba-f1',
        ckuId: 'CKU-VPN',
        front: 'What makes a device trust a peer certificate?',
        back: '**Blueprint-adjacent:** A valid chain to a trusted CA/trust anchor, plus identity and lifetime checks.',
      },
      {
        id: '5.10-ba-f2',
        ckuId: 'CKU-VPN',
        front: 'MACsec vs IPsec?',
        back: '**Blueprint-adjacent:** MACsec = link/L2 hop protection; IPsec = L3/tunneled protection for site-to-site or remote access.',
      },
    ],
    questions: [
      {
        id: '5.10-ba-q1',
        concept: 'pki trust',
        type: 'definition',
        difficulty: 'medium',
        question: 'In a PKI trust model, a client trusts a server certificate primarily because:',
        choices: [
          'It chains to a trusted certificate authority and passes validity checks',
          'It uses a longer passphrase than WPA2-PSK',
          'STP Root Guard is enabled',
          'The VLAN ID matches the native VLAN',
        ],
        correctIndex: 0,
        explanation: 'Certificates are trusted through a CA chain and validation checks, not by unrelated L2 features.',
        ckuIds: ['CKU-VPN'],
      },
    ],
  },

  '6.1': {
    reading: {
      related: [
        'Blueprint-adjacent: CI/CD for network changes — lint/test → peer review → deploy → verify → rollback path.',
        'Blueprint-adjacent: Git as source of truth — commit desired config, review diffs, and roll back by reverting to a known good commit (concepts, not Git mastery).',
      ],
      commonMistakes: [
        'Blueprint-adjacent: Treating automation as “paste CLI faster” with no test/verify/rollback stage.',
      ],
    },
    examTraps: [
      {
        id: '6.1-ba-t1',
        trap: 'Network CI/CD means skipping verification because the script already ran.',
        correction: '**Blueprint-adjacent:** Pipeline value is test + controlled deploy + post-change verify/rollback — not blind push.',
        ckuIds: ['CKU-AUTOMATION'],
      },
    ],
    flashcards: [
      {
        id: '6.1-ba-f1',
        ckuId: 'CKU-AUTOMATION',
        front: 'Network CI/CD stages (recognition)?',
        back: '**Blueprint-adjacent:** Validate → approve/review → deploy → verify → rollback if needed.',
      },
      {
        id: '6.1-ba-f2',
        ckuId: 'CKU-AUTOMATION',
        front: 'Why keep network intent in Git?',
        back: '**Blueprint-adjacent:** Diff/review history and fast rollback to a known-good configuration state.',
      },
    ],
    questions: [
      {
        id: '6.1-ba-q1',
        concept: 'network cicd',
        type: 'definition',
        difficulty: 'easy',
        question: 'Which sequence best matches a blueprint-adjacent network CI/CD mindset?',
        choices: [
          'Test/review, deploy, verify, rollback if needed',
          'Deploy first, document never, ignore errors',
          'Disable monitoring during every change',
          'Replace Git with CDP neighbor tables',
        ],
        correctIndex: 0,
        explanation: 'Automation still needs validation, controlled rollout, verification, and rollback.',
        ckuIds: ['CKU-AUTOMATION'],
      },
    ],
  },
}
