/**
 * Select-all-that-apply (multi) curated questions — exam-shaped stems, exact-set grading.
 * Merged via contentEnrichmentPatches → getCuratedQuestions.
 */

function multiQ({
  id, objectiveId, concept, skill = 'design', difficulty = 'medium',
  question, choices, correctIndexes, explanation, examTip, incorrect = [], ckuIds = [],
}) {
  return {
    id,
    type: 'multi',
    difficulty,
    skill,
    concept,
    question,
    choices,
    correctIndexes,
    explanation,
    ...(ckuIds.length ? { ckuIds } : {}),
    answerReview: {
      correct: { choiceIndex: correctIndexes[0], explanation },
      incorrect: incorrect.map(([choiceIndex, explanationText, misconceptionTested]) => ({
        choiceIndex,
        explanation: explanationText,
        misconceptionTested,
      })),
      ...(examTip ? { examTip } : {}),
    },
  }
}

export const MULTI_SELECT_QUESTION_PATCHES = {
  '1.5': {
    questions: [
      multiQ({
        id: '1.5-multi-bum',
        objectiveId: '1.5',
        concept: 'frame flooding',
        ckuIds: ['CKU-FRAME-FLOODING'],
        question: 'Which frame types does a Layer 2 switch flood out all ports in the VLAN except the ingress port? (Choose 3.) Select all that apply.',
        choices: [
          'Unknown unicast',
          'Broadcast',
          'Multicast',
          'Known unicast with a CAM hit',
        ],
        correctIndexes: [0, 1, 2],
        explanation: 'Switches flood BUM traffic — Broadcast, Unknown unicast, and Multicast — out every port in the VLAN except the source. A known unicast is forwarded only to the learned egress port.',
        examTip: 'Remember BUM: Broadcast, Unknown unicast, Multicast — not every frame is flooded.',
        incorrect: [
          [3, 'A known unicast hits the MAC address table and is forwarded to one port — it is not flooded.', 'Treating known unicast like BUM flooding'],
        ],
      }),
    ],
  },
  '1.9': {
    questions: [
      multiQ({
        id: '1.9-multi-v6-types',
        objectiveId: '1.9',
        concept: 'ipv6 address types',
        ckuIds: ['CKU-IPV6-MULTICAST', 'CKU-IPV6-LINK-LOCAL'],
        question: 'Which IPv6 address types are valid on a typical dual-stack host interface? (Choose 2.) Select all that apply.',
        choices: [
          'Link-local (FE80::/10)',
          'Global unicast (2000::/3)',
          'IPv4-style broadcast (255.255.255.255 mapped)',
          'Class D multicast as a unicast GUA',
        ],
        correctIndexes: [0, 1],
        explanation: 'Every IPv6 interface has a link-local address; hosts also commonly have a global unicast. IPv6 has no broadcast, and Class D is an IPv4 concept.',
        examTip: 'IPv6: link-local always; GUA for routed traffic; multicast replaces broadcast.',
        incorrect: [
          [2, 'IPv6 has no broadcast address — multicast (FF00::/8) replaces it.', 'Assuming IPv4 broadcast exists in IPv6'],
          [3, 'Class D is IPv4 multicast space, not an IPv6 unicast type.', 'Mixing IPv4 Class D with IPv6 GUA'],
        ],
      }),
    ],
  },
  '2.2': {
    questions: [
      multiQ({
        id: '2.2-multi-trunk',
        objectiveId: '2.2',
        concept: 'trunking',
        ckuIds: ['CKU-TRUNKING'],
        question: 'Which statements correctly describe an 802.1Q trunk between two switches? (Choose 2.) Select all that apply.',
        choices: [
          'It can carry multiple VLANs on one physical link',
          'Frames for non-native VLANs are tagged with a VLAN ID',
          'It can only carry the native VLAN untagged and nothing else',
          'Access ports are required on both ends of the trunk',
        ],
        correctIndexes: [0, 1],
        explanation: 'A trunk carries many VLANs; 802.1Q tags non-native VLAN frames. The native VLAN is typically untagged, but other VLANs still ride the same link. Access mode is for end hosts, not trunk ends.',
        examTip: 'Trunk = many VLANs + tags (except native). Access = one VLAN, no tag.',
        incorrect: [
          [2, 'Trunks carry many VLANs — native is usually untagged, but tagged VLANs still traverse the link.', 'Thinking trunks only carry the native VLAN'],
          [3, 'Trunk ends use switchport mode trunk (or dynamic), not access.', 'Confusing access and trunk port modes'],
        ],
      }),
    ],
  },
  '2.5': {
    questions: [
      multiQ({
        id: '2.5-multi-stp-roles',
        objectiveId: '2.5',
        concept: 'stp port roles',
        skill: 'troubleshoot',
        question: 'In classic STP/RSTP, which port roles can forward user frames in the steady state? (Choose 2.) Select all that apply.',
        choices: [
          'Root port',
          'Designated port',
          'Alternate port',
          'Backup port',
        ],
        correctIndexes: [0, 1],
        explanation: 'Root and designated ports forward. Alternate and backup ports are discarding/blocking backups and do not forward user traffic in the steady state.',
        examTip: 'Forwarding roles: root + designated. Alternate/backup = backup path, not forwarding.',
        incorrect: [
          [2, 'Alternate is a discarding backup to the root port — it does not forward.', 'Assuming alternate ports forward'],
          [3, 'Backup is a discarding backup to a designated port on a shared segment.', 'Assuming backup ports forward'],
        ],
      }),
    ],
  },
  '3.2': {
    questions: [
      multiQ({
        id: '3.2-multi-forward',
        objectiveId: '3.2',
        concept: 'forwarding decision',
        ckuIds: ['CKU-LONGEST-PREFIX-MATCH'],
        question: 'When multiple routes match a destination, which factors can influence which route a Cisco router installs/uses? (Choose 2.) Select all that apply.',
        choices: [
          'Longest prefix match (most specific route)',
          'Administrative distance when prefix lengths are equal',
          'Interface bandwidth alone, ignoring prefix length',
          'Alphabetically first next-hop IP',
        ],
        correctIndexes: [0, 1],
        explanation: 'Longest prefix wins first. Among equal-length prefixes, administrative distance (then metric) decides. Bandwidth alone or alphabetical next-hop is not the decision order.',
        examTip: 'Order: longest match → AD → metric. Never skip prefix length.',
        incorrect: [
          [2, 'Prefix length beats AD/metric — a /24 always beats a /16 for that destination.', 'Using bandwidth before longest match'],
          [3, 'Next-hop lexicographic order is not a routing decision criterion.', 'Inventing alphabetical next-hop tie-break'],
        ],
      }),
    ],
  },
  '3.4': {
    questions: [
      multiQ({
        id: '3.4-multi-ospf-adj',
        objectiveId: '3.4',
        concept: 'ospf adjacency',
        skill: 'troubleshoot',
        ckuIds: ['CKU-OSPF-NEIGHBOR'],
        question: 'Which parameters must match for two OSPF routers to form a full adjacency on a broadcast segment? (Choose 2.) Select all that apply.',
        choices: [
          'Area ID',
          'Hello and dead timers',
          'Router ID values (must be identical)',
          'Process ID numbers on both routers',
        ],
        correctIndexes: [0, 1],
        explanation: 'Area ID and Hello/Dead timers must match. Router IDs must be unique (not identical). OSPF process IDs are local and need not match.',
        examTip: 'Match area + timers; RIDs unique; process ID is local-only.',
        incorrect: [
          [2, 'Router IDs must be unique — identical RIDs break OSPF.', 'Thinking Router IDs must match'],
          [3, 'Process ID is locally significant and does not need to match the neighbor.', 'Requiring matching OSPF process IDs'],
        ],
      }),
    ],
  },
  '4.1': {
    questions: [
      multiQ({
        id: '4.1-multi-nat',
        objectiveId: '4.1',
        concept: 'nat types',
        ckuIds: ['CKU-PAT'],
        question: 'Which statements correctly describe PAT (NAT overload)? (Choose 2.) Select all that apply.',
        choices: [
          'Many inside hosts can share one (or few) public IP(s) using port numbers',
          'Translations are tracked by inside global IP plus L4 port',
          'Each inside host always needs its own dedicated public IP',
          'PAT only works with static one-to-one mappings',
        ],
        correctIndexes: [0, 1],
        explanation: 'PAT multiplexes many private hosts behind shared public IPs using ports. Static one-to-one is static NAT, not overload.',
        examTip: 'PAT = overload = ports. Static NAT = 1:1. Dynamic NAT = pool without ports.',
        incorrect: [
          [2, 'PAT exists specifically so many hosts share few public IPs.', 'Assuming every host needs a public IP'],
          [3, 'Static 1:1 is static NAT; PAT is dynamic overload with ports.', 'Confusing static NAT with PAT'],
        ],
      }),
    ],
  },
  '4.7': {
    questions: [
      multiQ({
        id: '4.7-multi-qos',
        objectiveId: '4.7',
        concept: 'qos marking',
        question: 'Which QoS concepts are Layer 3 / IP-related markings or behaviors? (Choose 2.) Select all that apply.',
        choices: [
          'DSCP in the IP header',
          'IP Precedence bits',
          '802.1p/CoS in the 802.1Q tag',
          'STP port priority',
        ],
        correctIndexes: [0, 1],
        explanation: 'DSCP and IP Precedence mark IP packets. CoS is Layer 2 (802.1Q). STP port priority is spanning-tree, not QoS marking.',
        examTip: 'L3 marks: DSCP / IPP. L2 mark: CoS. Do not mix with STP priority.',
        incorrect: [
          [2, 'CoS is in the Layer 2 802.1Q tag, not the IP header.', 'Calling CoS a Layer 3 mark'],
          [3, 'STP port priority affects root/designated election, not PHB marking.', 'Confusing STP priority with QoS'],
        ],
      }),
    ],
  },
  '5.5': {
    questions: [
      multiQ({
        id: '5.5-multi-acl',
        objectiveId: '5.5',
        concept: 'acl behavior',
        skill: 'implement',
        question: 'Which statements about Cisco IPv4 ACLs are true? (Choose 2.) Select all that apply.',
        choices: [
          'ACLs are evaluated top-down; first match wins',
          'An implicit deny any ends a standard/extended ACL',
          'Packets that match no ACE are permitted by default',
          'Named ACLs cannot use deny statements',
        ],
        correctIndexes: [0, 1],
        explanation: 'First-match wins; unmatched traffic hits the implicit deny. There is no implicit permit. Named ACLs support permit and deny.',
        examTip: 'Top-down, first hit, then implicit deny — order matters.',
        incorrect: [
          [2, 'Unmatched packets are denied by the implicit deny any.', 'Assuming implicit permit'],
          [3, 'Named ACLs support both permit and deny entries.', 'Thinking named ACLs are permit-only'],
        ],
      }),
    ],
  },
  '5.9': {
    questions: [
      multiQ({
        id: '5.9-multi-wpa',
        objectiveId: '5.9',
        concept: 'wireless security',
        question: 'Which components are part of enterprise WPA2/WPA3-Enterprise style WLAN security? (Choose 2.) Select all that apply.',
        choices: [
          '802.1X authentication',
          'EAP methods with a RADIUS/AAA server',
          'Open authentication with no encryption keys',
          'WEP shared-key as the primary cipher',
        ],
        correctIndexes: [0, 1],
        explanation: 'Enterprise WLAN security uses 802.1X + EAP against a RADIUS/AAA server. Open/WEP are not enterprise WPA2/WPA3 patterns.',
        examTip: 'Enterprise = 802.1X + EAP + RADIUS. Personal = PSK.',
        incorrect: [
          [2, 'Open auth without encryption is not WPA2/WPA3-Enterprise.', 'Confusing open WLAN with enterprise'],
          [3, 'WEP is obsolete and not used as the WPA2/WPA3 enterprise cipher suite.', 'Selecting WEP for modern enterprise WLAN'],
        ],
      }),
    ],
  },
  '6.1': {
    questions: [
      multiQ({
        id: '6.1-multi-ibn',
        objectiveId: '6.1',
        concept: 'automation concepts',
        question: 'Which ideas belong to intent-based / controller-led network automation? (Choose 2.) Select all that apply.',
        choices: [
          'Express desired outcome (intent) rather than only per-box CLI',
          'Controllers translate intent into device configurations',
          'Every change must be typed manually on each device forever',
          'SNMP polling replaces all northbound APIs',
        ],
        correctIndexes: [0, 1],
        explanation: 'IBN/controller models capture intent and push derived config. Manual-only forever and “SNMP replaces APIs” are not the model.',
        examTip: 'Intent → controller → devices. APIs (RESTCONF/NETCONF) are common northbound/southbound tools.',
        incorrect: [
          [2, 'Automation exists to reduce repetitive per-box CLI for policy changes.', 'Rejecting automation entirely'],
          [3, 'SNMP is monitoring/ops; modern automation leans on model-driven APIs.', 'Equating SNMP with intent APIs'],
        ],
      }),
    ],
  },
  '6.4': {
    questions: [
      multiQ({
        id: '6.4-multi-rest',
        objectiveId: '6.4',
        concept: 'rest apis',
        question: 'Which statements correctly describe REST-style network APIs? (Choose 2.) Select all that apply.',
        choices: [
          'They commonly use HTTP methods such as GET, POST, PUT, PATCH, DELETE',
          'JSON is a common data encoding for request/response bodies',
          'They require Telnet to the device console for every call',
          'REST calls always use binary SNMP traps as the payload',
        ],
        correctIndexes: [0, 1],
        explanation: 'REST APIs use HTTP verbs and often JSON (or XML). They do not require Telnet consoles, and SNMP traps are a different ops channel.',
        examTip: 'REST = HTTP + resource URLs + JSON/XML — not Telnet/SNMP trap payloads.',
        incorrect: [
          [2, 'REST is API-over-HTTP, not console Telnet.', 'Requiring Telnet for REST'],
          [3, 'SNMP traps are not REST payloads.', 'Mixing SNMP traps with REST bodies'],
        ],
      }),
    ],
  },
}
