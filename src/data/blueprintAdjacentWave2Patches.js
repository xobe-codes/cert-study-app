/**
 * Blueprint-adjacent Wave 2 — remaining high-value operational foundations.
 * Depth cap: recognize / explain / troubleshoot-lite. No deep configuration.
 */

export const BLUEPRINT_ADJACENT_WAVE2_PATCHES = {
  '1.5': {
    reading: {
      related: [
        'Blueprint-adjacent: IGMP manages IPv4 multicast group membership between hosts and a router; IGMP snooping lets a switch listen to those messages and forward multicast only to ports with interested receivers.',
      ],
      commonMistakes: [
        'Blueprint-adjacent: Treating IGMP snooping as a routing protocol — it is a Layer 2 switch optimization based on observed Layer 3 membership messages.',
      ],
    },
    examTraps: [{
      id: '1.5-ba2-t1',
      trap: 'A switch should flood every multicast frame forever, just like an unknown unicast.',
      correction: '**Blueprint-adjacent:** IGMP snooping learns receiver-facing ports and constrains multicast flooding within the VLAN.',
      ckuIds: ['CKU-MAC-FORWARDING'],
    }],
    flashcards: [{
      id: '1.5-ba2-f1',
      ckuId: 'CKU-MAC-FORWARDING',
      front: 'Blueprint-adjacent: IGMP vs IGMP snooping?',
      back: 'IGMP = host/router multicast membership. IGMP snooping = switch observes membership and limits multicast to interested ports.',
    }],
    questions: [
      {
        id: '1.5-ba2-q1',
        concept: 'igmp snooping',
        type: 'definition',
        difficulty: 'medium',
        question: 'What is the primary benefit of IGMP snooping on a Layer 2 switch?',
        choices: [
          'Forward multicast only toward ports with interested receivers',
          'Elect an OSPF designated router',
          'Encrypt multicast with IPsec',
          'Assign multicast hosts addresses through DHCP',
        ],
        correctIndex: 0,
        explanation: 'The switch observes IGMP membership and avoids flooding multicast to every VLAN port.',
        ckuIds: ['CKU-MAC-FORWARDING'],
      },
      {
        id: '1.5-ba2-q2',
        concept: 'igmp role',
        type: 'definition',
        difficulty: 'easy',
        question: 'Which devices exchange IGMP membership messages?',
        choices: [
          'Multicast receivers and their local multicast router',
          'Only STP root bridges',
          'DHCP clients and DNS servers',
          'OSPF ABRs in different areas',
        ],
        correctIndex: 0,
        explanation: 'Hosts report multicast group membership to a local router using IGMP.',
        ckuIds: ['CKU-MAC-FORWARDING'],
      },
    ],
  },

  '2.7': {
    reading: {
      related: [
        'Blueprint-adjacent: PoE budget is the switch-wide power pool shared by APs, phones, and cameras; insufficient budget can prevent boot or force reduced AP radio capability.',
        'Blueprint-adjacent: LLDP-MED lets endpoints advertise capabilities and negotiate items such as voice VLAN and power requirements; it extends LLDP for media endpoints.',
      ],
      commonMistakes: [
        'Blueprint-adjacent: Checking only whether a port supports PoE — the entire switch or stack can still exhaust its available power budget.',
      ],
    },
    examTraps: [{
      id: '2.7-ba2-t1',
      trap: 'If an AP link is up, its PoE power allocation must be sufficient for every radio feature.',
      correction: '**Blueprint-adjacent:** An AP may boot in a reduced-power state; verify the switch budget and negotiated power via CDP/LLDP.',
      ckuIds: ['CKU-POE'],
    }],
    flashcards: [
      {
        id: '2.7-ba2-f1',
        ckuId: 'CKU-POE',
        front: 'Blueprint-adjacent: why check total PoE budget?',
        back: 'Per-port capability is not enough—the switch/stack must have enough shared watts for all APs, phones, and cameras.',
      },
      {
        id: '2.7-ba2-f2',
        ckuId: 'CKU-LLDP-MED',
        front: 'What does LLDP-MED add?',
        back: '**Blueprint-adjacent:** Media-endpoint details such as voice VLAN, device capabilities, location, and power negotiation.',
      },
    ],
    questions: [
      {
        id: '2.7-ba2-q1',
        concept: 'poe budget',
        type: 'scenario',
        difficulty: 'medium',
        question: 'Several new APs fail to power on although each access port supports PoE+. What should be checked next?',
        choices: [
          'The switch or stack total available PoE budget',
          'The OSPF router ID',
          'The trunk native VLAN only',
          'The DNS TTL',
        ],
        correctIndex: 0,
        explanation: 'A shared PoE budget can be exhausted even when individual ports support the required standard.',
        ckuIds: ['CKU-POE'],
      },
      {
        id: '2.7-ba2-q2',
        concept: 'lldp med',
        type: 'definition',
        difficulty: 'medium',
        question: 'Which blueprint-adjacent protocol extension commonly advertises voice VLAN and endpoint power details?',
        choices: ['LLDP-MED', 'RIPng', 'HSRP', 'SPAN'],
        correctIndex: 0,
        explanation: 'LLDP-MED extends LLDP for media endpoints such as IP phones.',
        ckuIds: ['CKU-LLDP-MED'],
      },
    ],
  },

  '3.2': {
    reading: {
      related: [
        'Blueprint-adjacent: Policy-based routing (PBR) can override ordinary destination-based forwarding for selected traffic by matching policy and setting a next hop; normal longest-prefix routing remains the default.',
      ],
      commonMistakes: [
        'Blueprint-adjacent: Assuming PBR changes the routing table — it applies a policy to matching packets rather than installing a more-specific route.',
      ],
    },
    examTraps: [{
      id: '3.2-ba2-t1',
      trap: 'Policy-based routing is just another name for longest-prefix match.',
      correction: '**Blueprint-adjacent:** Normal routing chooses by destination prefix; PBR first matches policy (often source/application) and can set a different next hop.',
      ckuIds: ['CKU-FORWARDING-DECISION'],
    }],
    flashcards: [{
      id: '3.2-ba2-f1',
      ckuId: 'CKU-FORWARDING-DECISION',
      front: 'Blueprint-adjacent: normal routing vs PBR?',
      back: 'Normal = destination/longest prefix. PBR = selected traffic matches a policy that can override the next hop.',
    }],
    questions: [
      {
        id: '3.2-ba2-q1',
        concept: 'policy based routing',
        type: 'definition',
        difficulty: 'medium',
        question: 'What makes policy-based routing different from normal destination-based forwarding?',
        choices: [
          'It can select a next hop based on matched policy such as source traffic',
          'It disables the routing table permanently',
          'It prevents Layer 2 loops with BPDUs',
          'It assigns IP addresses to clients',
        ],
        correctIndex: 0,
        explanation: 'PBR applies policy to selected packets before ordinary destination-based forwarding.',
        ckuIds: ['CKU-FORWARDING-DECISION'],
      },
      {
        id: '3.2-ba2-q2',
        concept: 'pbr fallback',
        type: 'scenario',
        difficulty: 'medium',
        question: 'Traffic does not match any configured PBR policy. What normally happens?',
        choices: [
          'The router uses its normal routing-table forwarding decision',
          'The packet is always dropped',
          'STP selects a root port',
          'The source host becomes the next hop',
        ],
        correctIndex: 0,
        explanation: 'Unmatched traffic follows normal destination-based routing unless another explicit action applies.',
        ckuIds: ['CKU-FORWARDING-DECISION'],
      },
    ],
  },

  '5.6': {
    reading: {
      related: [
        'Blueprint-adjacent: Storm control rate-limits broadcast, multicast, or unknown-unicast traffic on a switch port to contain Layer 2 storms; it complements STP and port security but does not replace either.',
      ],
      commonMistakes: [
        'Blueprint-adjacent: Treating storm control as loop prevention — it limits traffic impact, while STP removes redundant forwarding paths.',
      ],
    },
    examTraps: [{
      id: '5.6-ba2-t1',
      trap: 'Storm control and port security solve the same threat.',
      correction: '**Blueprint-adjacent:** Storm control limits excessive traffic rates; port security limits learned/allowed source MAC addresses.',
      ckuIds: ['CKU-PORT-SECURITY'],
    }],
    flashcards: [{
      id: '5.6-ba2-f1',
      ckuId: 'CKU-PORT-SECURITY',
      front: 'Blueprint-adjacent: storm control purpose?',
      back: 'Limit broadcast/multicast/unknown-unicast rates on a port so a Layer 2 storm cannot consume the entire segment.',
    }],
    questions: [
      {
        id: '5.6-ba2-q1',
        concept: 'storm control',
        type: 'definition',
        difficulty: 'easy',
        question: 'Which switch feature limits excessive broadcast or multicast traffic on a port?',
        choices: ['Storm control', 'OSPF passive-interface', 'NTP authentication', 'NAT overload'],
        correctIndex: 0,
        explanation: 'Storm control applies rate thresholds to selected Layer 2 traffic classes.',
        ckuIds: ['CKU-PORT-SECURITY'],
      },
      {
        id: '5.6-ba2-q2',
        concept: 'storm control contrast',
        type: 'definition',
        difficulty: 'medium',
        question: 'How does storm control differ from STP?',
        choices: [
          'Storm control limits traffic volume; STP blocks redundant Layer 2 paths',
          'Storm control elects the root; STP limits broadcast rates',
          'Both configure IPsec tunnels',
          'Both authenticate users with RADIUS',
        ],
        correctIndex: 0,
        explanation: 'Storm control contains traffic impact; STP prevents forwarding loops.',
        ckuIds: ['CKU-PORT-SECURITY'],
      },
    ],
  },

  '5.7': {
    reading: {
      related: [
        'Blueprint-adjacent: Network Access Control (NAC) can evaluate endpoint identity and posture before admission, then permit, deny, quarantine, or place the device in a remediation network.',
        'Blueprint-adjacent: 802.1X proves identity; NAC policy can additionally check device health/compliance and assign authorization results.',
      ],
      commonMistakes: [
        'Blueprint-adjacent: Assuming successful authentication guarantees full network access — authorization/posture may still place a device in quarantine.',
      ],
    },
    examTraps: [{
      id: '5.7-ba2-t1',
      trap: 'NAC posture assessment and authentication are identical decisions.',
      correction: '**Blueprint-adjacent:** Authentication proves identity; posture checks device compliance, and authorization decides the resulting access/quarantine.',
      ckuIds: ['CKU-AAA'],
    }],
    flashcards: [{
      id: '5.7-ba2-f1',
      ckuId: 'CKU-AAA',
      front: 'Blueprint-adjacent: NAC posture flow?',
      back: 'Identify/authenticate → assess device compliance → authorize normal, restricted, quarantine, or remediation access.',
    }],
    questions: [
      {
        id: '5.7-ba2-q1',
        concept: 'nac posture',
        type: 'scenario',
        difficulty: 'medium',
        question: 'A user authenticates successfully, but the endpoint lacks required patches. What NAC action is most appropriate?',
        choices: [
          'Quarantine or remediation access until compliant',
          'Make the endpoint the STP root',
          'Advertise a default route with OSPF',
          'Disable all RADIUS accounting',
        ],
        correctIndex: 0,
        explanation: 'NAC can separate identity success from device-posture authorization.',
        ckuIds: ['CKU-AAA'],
      },
      {
        id: '5.7-ba2-q2',
        concept: 'authentication vs posture',
        type: 'definition',
        difficulty: 'medium',
        question: 'Which statement correctly distinguishes authentication from NAC posture?',
        choices: [
          'Authentication verifies identity; posture evaluates endpoint compliance',
          'Authentication checks software patches; posture elects a gateway',
          'Both only count switch MAC addresses',
          'Posture replaces authorization and accounting',
        ],
        correctIndex: 0,
        explanation: 'Identity and endpoint-health checks are related but distinct controls.',
        ckuIds: ['CKU-AAA'],
      },
    ],
  },

  '6.3': {
    reading: {
      related: [
        'Blueprint-adjacent: Model-driven streaming telemetry sends subscribed operational data continuously or on change, unlike periodic SNMP polling.',
        'Blueprint-adjacent: gNMI is a gRPC-based interface commonly paired with YANG models for Get/Set/Subscribe operations; recognize the model and subscription behavior, not vendor-specific configuration.',
      ],
      commonMistakes: [
        'Blueprint-adjacent: Treating streaming telemetry as repeated REST GET polling — subscriptions push updates after setup.',
      ],
    },
    examTraps: [{
      id: '6.3-ba2-t1',
      trap: 'gNMI is only a replacement syntax for CLI show commands.',
      correction: '**Blueprint-adjacent:** gNMI is a model-driven gRPC interface supporting Get, Set, and Subscribe—especially continuous telemetry subscriptions.',
      ckuIds: ['CKU-SDN'],
    }],
    flashcards: [
      {
        id: '6.3-ba2-f1',
        ckuId: 'CKU-SDN',
        front: 'Blueprint-adjacent: polling vs streaming telemetry?',
        back: 'Polling repeatedly asks for state; streaming establishes a subscription and pushes periodic/on-change updates.',
      },
      {
        id: '6.3-ba2-f2',
        ckuId: 'CKU-SDN',
        front: 'What is gNMI used for?',
        back: '**Blueprint-adjacent:** Model-driven Get/Set/Subscribe operations over gRPC, often using YANG-modeled data.',
      },
    ],
    questions: [
      {
        id: '6.3-ba2-q1',
        concept: 'streaming telemetry',
        type: 'definition',
        difficulty: 'medium',
        question: 'What primarily distinguishes model-driven streaming telemetry from traditional periodic SNMP polling?',
        choices: [
          'A subscription pushes periodic or on-change updates',
          'It requires a console cable for every update',
          'It blocks Layer 2 loops',
          'It only transfers startup-config files',
        ],
        correctIndex: 0,
        explanation: 'Streaming establishes a subscription rather than requiring the collector to repeatedly poll.',
        ckuIds: ['CKU-SDN'],
      },
      {
        id: '6.3-ba2-q2',
        concept: 'gnmi',
        type: 'definition',
        difficulty: 'medium',
        question: 'Which operation is strongly associated with gNMI telemetry?',
        choices: ['Subscribe', 'STP root election', 'DHCP DORA', 'NAT overload'],
        correctIndex: 0,
        explanation: 'gNMI supports Get, Set, and Subscribe over gRPC.',
        ckuIds: ['CKU-SDN'],
      },
    ],
  },
}
