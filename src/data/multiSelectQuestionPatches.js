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
  '1.4': {
    questions: [
      multiQ({
        id: '1.4-multi-cabling',
        objectiveId: '1.4',
        concept: 'cabling and interfaces',
        question: 'Which statements correctly describe Ethernet copper and fiber at the CCNA level? (Choose 2.) Select all that apply.',
        choices: [
          'Straight-through UTP commonly connects unlike devices (PC↔switch, router↔switch)',
          'Fiber links are immune to EMI and support longer distances than copper',
          'Crossover cable is always required between a PC and a modern auto-MDIX switch',
          'Multimode fiber is preferred for WAN spans of hundreds of kilometers',
        ],
        correctIndexes: [0, 1],
        explanation: 'Unlike devices use straight-through; fiber resists EMI and goes farther. Auto-MDIX makes crossover rare for PC↔switch. Multimode is for shorter campus runs; single-mode for long haul.',
        examTip: 'Straight-through for unlike devices; fiber = EMI + distance; auto-MDIX often removes crossover needs.',
        incorrect: [
          [2, 'Modern switches with auto-MDIX usually work with straight-through to PCs.', 'Requiring crossover for every PC↔switch link'],
          [3, 'Long WAN spans use single-mode fiber; multimode is shorter reach.', 'Using multimode for long-haul WAN'],
        ],
      }),
    ],
  },
  '2.1': {
    questions: [
      multiQ({
        id: '2.1-multi-vlan-svi',
        objectiveId: '2.1',
        concept: 'vlans and svi',
        skill: 'implement',
        question: 'Which statements about VLANs and SVIs on a multilayer switch are true? (Choose 2.) Select all that apply.',
        choices: [
          'An SVI (interface VLAN x) provides a Layer 3 gateway for that VLAN',
          'Access ports belong to one VLAN and do not carry 802.1Q tags by default',
          'Creating VLAN 20 automatically assigns every unused port to VLAN 20',
          'SVIs only work if the switch is in transparent VTP mode',
        ],
        correctIndexes: [0, 1],
        explanation: 'SVIs are the L3 interface for a VLAN; access ports are untagged single-VLAN. Creating a VLAN does not auto-assign ports. VTP mode is unrelated to whether SVIs can exist.',
        examTip: 'VLAN = broadcast domain; SVI = gateway for that VLAN; access = one VLAN, no tag.',
        incorrect: [
          [2, 'Ports stay in their configured VLAN (often VLAN 1) until you assign them.', 'Assuming new VLANs auto-claim ports'],
          [3, 'SVIs work regardless of VTP mode; VTP is about VLAN database sync.', 'Tying SVIs to VTP transparent'],
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
  '3.1': {
    questions: [
      multiQ({
        id: '3.1-multi-routing-table',
        objectiveId: '3.1',
        concept: 'routing table',
        question: 'Which codes or facts correctly describe a Cisco IPv4 routing table? (Choose 2.) Select all that apply.',
        choices: [
          'C marks a directly connected network',
          'S marks a static route',
          'O always means the route was learned via BGP',
          'Gateway of last resort is never shown for a default route',
        ],
        correctIndexes: [0, 1],
        explanation: 'C = connected, S = static. O is OSPF (not BGP — that is B). A default route often appears as the gateway of last resort.',
        examTip: 'Memorize codes: C connected, S static, O OSPF, B BGP, D EIGRP.',
        incorrect: [
          [2, 'O is OSPF; BGP uses code B.', 'Confusing OSPF O with BGP'],
          [3, 'Default routes commonly install as gateway of last resort.', 'Denying gateway of last resort for defaults'],
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
  '3.3': {
    questions: [
      multiQ({
        id: '3.3-multi-static-route',
        objectiveId: '3.3',
        concept: 'static routing',
        skill: 'implement',
        question: 'Which statements about IPv4 static routes on Cisco IOS are true? (Choose 2.) Select all that apply.',
        choices: [
          'ip route network mask next-hop installs a static route to that prefix',
          'A floating static uses a higher AD so it backs up a dynamic route',
          'Static routes always override connected routes regardless of prefix length',
          'You must disable OSPF globally before any static route will install',
        ],
        correctIndexes: [0, 1],
        explanation: 'Standard static syntax uses network/mask/next-hop (or exit interface). Floating statics raise AD above the primary protocol. Connected routes still win on equal/more-specific prefixes; OSPF need not be disabled.',
        examTip: 'Floating static = higher AD backup. Longest match still beats AD.',
        incorrect: [
          [2, 'Longest match and connected prefixes still matter — statics do not blindly trump everything.', 'Assuming static always wins over connected'],
          [3, 'Static and dynamic protocols can coexist; floating statics are the backup pattern.', 'Requiring OSPF off for statics'],
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
  '4.3': {
    questions: [
      multiQ({
        id: '4.3-multi-dhcp',
        objectiveId: '4.3',
        concept: 'dhcp and dns',
        question: 'Which statements correctly describe DHCP and DNS roles in an enterprise LAN? (Choose 2.) Select all that apply.',
        choices: [
          'DHCP assigns IP address, mask, default gateway, and often DNS servers',
          'DNS resolves hostnames to IP addresses for clients and apps',
          'DHCP replaces the need for a default gateway on every host',
          'DNS servers assign IP addresses instead of DHCP',
        ],
        correctIndexes: [0, 1],
        explanation: 'DHCP leases addressing parameters including gateway and DNS options. DNS does name→IP resolution. DHCP does not remove the gateway concept; DNS does not assign addresses.',
        examTip: 'DHCP = lease addressing; DNS = names. Do not swap their jobs.',
        incorrect: [
          [2, 'Hosts still need a default gateway; DHCP often provides it as option 3.', 'Thinking DHCP eliminates gateways'],
          [3, 'DNS resolves names; address assignment is DHCP’s role.', 'Swapping DNS and DHCP functions'],
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
  '5.6': {
    questions: [
      multiQ({
        id: '5.6-multi-port-sec',
        objectiveId: '5.6',
        concept: 'port security',
        skill: 'implement',
        question: 'Which statements correctly describe switchport port-security? (Choose 2.) Select all that apply.',
        choices: [
          'It limits how many MAC addresses can be learned on an access port',
          'Violation modes include shutdown, restrict, and protect',
          'It is configured on trunk ports to replace 802.1Q tagging',
          'Sticky learning permanently disables the CAM table on the switch',
        ],
        correctIndexes: [0, 1],
        explanation: 'Port security caps MACs on a port and defines violation action. It is typically on access ports, not a trunk/tagging replacement. Sticky learning saves learned MACs to running-config — it does not disable the CAM table.',
        examTip: 'Port-sec = MAC limit + violation action; usually access ports.',
        incorrect: [
          [2, 'Port security is not a substitute for trunk tagging; trunks carry multiple VLANs.', 'Replacing trunks with port security'],
          [3, 'Sticky learning stores MACs in running-config; the CAM table still operates.', 'Thinking sticky disables CAM'],
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
  '6.2': {
    questions: [
      multiQ({
        id: '6.2-multi-controller',
        objectiveId: '6.2',
        concept: 'controller vs traditional',
        question: 'Which statements correctly contrast controller-based and traditional networking? (Choose 2.) Select all that apply.',
        choices: [
          'Traditional networks distribute control plane logic on each device',
          'Controller-based designs centralize policy and often expose northbound APIs',
          'Controllers always remove the data plane from every switch',
          'Traditional CLI means no routing protocols can ever run',
        ],
        correctIndexes: [0, 1],
        explanation: 'Traditional = per-device control plane; controllers centralize policy/APIs. The data plane still forwards on devices. Traditional networks run OSPF/EIGRP/etc. via CLI.',
        examTip: 'Controller = centralized control/policy; data plane stays on boxes.',
        incorrect: [
          [2, 'Data plane forwarding remains on network devices under controller models.', 'Thinking controllers erase the data plane'],
          [3, 'Traditional CLI networks commonly run dynamic routing protocols.', 'Claiming CLI forbids routing protocols'],
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
  '6.5': {
    questions: [
      multiQ({
        id: '6.5-multi-rest-methods',
        objectiveId: '6.5',
        concept: 'rest http methods',
        question: 'Which HTTP methods are correctly paired with common REST API intent? (Choose 2.) Select all that apply.',
        choices: [
          'GET retrieves a resource without changing server state',
          'DELETE removes a resource identified by the URI',
          'GET always creates a new resource on the controller',
          'PUT is identical to GET and never modifies data',
        ],
        correctIndexes: [0, 1],
        explanation: 'GET is safe/read; DELETE removes. Creating is typically POST (or PUT for replace); PUT modifies/replaces and is not a read-only twin of GET.',
        examTip: 'CRUD map: POST create, GET read, PUT/PATCH update, DELETE remove.',
        incorrect: [
          [2, 'GET reads; creation uses POST (or PUT for full replace).', 'Using GET to create resources'],
          [3, 'PUT replaces/updates a resource; it is not a read-only GET alias.', 'Equating PUT with GET'],
        ],
      }),
    ],
  },
}
