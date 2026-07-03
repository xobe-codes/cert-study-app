/** Content depth wave 7 — supplemental MC for objectives not yet in waves 3–6. */

export const CONTENT_DEPTH_WAVE7_PATCHES = {
  '2.1': {
    questions: [{
      id: '2.1-w7-q1', concept: 'collision domain', type: 'definition', difficulty: 'easy',
      question: 'Which device traditionally separates collision domains on a shared Ethernet segment?',
      choices: ['Switch (per-port)', 'Hub (shared bus)', 'Repeater (amplifies only)', 'Patch panel'],
      correctIndex: 0,
      explanation: 'Each switch port is its own collision domain — hubs repeat to all ports in one domain.',
      ckuIds: ['CKU-COLLISION'],
    }],
  },
  '2.2': {
    questions: [{
      id: '2.2-w7-q1', concept: 'duplex mismatch', type: 'troubleshooting', difficulty: 'medium',
      question: 'A link shows excessive collisions and late collisions. Most likely cause?',
      choices: ['Speed/duplex mismatch between switch and host', 'Wrong VLAN on access port', 'Missing default route', 'OSPF area mismatch'],
      correctIndex: 0,
      explanation: 'Half/full duplex mismatch causes collisions and poor throughput — verify both ends with show interfaces.',
      ckuIds: ['CKU-DUPLEX'],
    }],
  },
  '2.5': {
    questions: [{
      id: '2.5-w7-q1', concept: 'stp root', type: 'application', difficulty: 'medium',
      question: 'Which command makes a switch the preferred STP root for VLAN 10?',
      choices: ['spanning-tree vlan 10 root primary', 'spanning-tree mode rapid-pvst vlan 10', 'vlan 10 priority 0', 'stp vlan 10 enable root'],
      correctIndex: 0,
      explanation: 'root primary lowers priority toward 0 for that VLAN — root secondary is backup, not forced winner.',
      ckuIds: ['CKU-STP-ROOT'],
    }],
  },
  '3.1': {
    questions: [{
      id: '3.1-w7-q1', concept: 'connected route', type: 'definition', difficulty: 'easy',
      question: 'A directly connected network appears in the routing table with which letter code?',
      choices: ['C (connected)', 'S (static)', 'O (OSPF)', 'R (RIP)'],
      correctIndex: 0,
      explanation: 'C = connected interface up with IP; S/O/R are learned routes from static or protocols.',
      ckuIds: ['CKU-ROUTING-TABLE'],
    }],
  },
  '3.4': {
    questions: [{
      id: '3.4-w7-q1', concept: 'ospf network type', type: 'scenario', difficulty: 'medium',
      question: 'OSPF on a point-to-point serial link defaults to which network type?',
      choices: ['Point-to-point (no DR election)', 'Broadcast (DR/BDR election)', 'Non-broadcast (manual neighbors)', 'Point-to-multipoint'],
      correctIndex: 0,
      explanation: 'Serial P2P links skip DR/BDR — broadcast/multi-access LANs elect DR unless changed.',
      ckuIds: ['CKU-OSPF-NETWORK'],
    }],
  },
  '4.1': {
    questions: [{
      id: '4.1-w7-q1', concept: 'nat overload', type: 'application', difficulty: 'medium',
      question: 'Which keyword enables PAT (many inside hosts → one outside IP)?',
      choices: ['overload on ip nat inside source', 'pat enable on interface', 'ip nat pool dynamic', 'nat translation always-on'],
      correctIndex: 0,
      explanation: 'PAT uses overload with an ACL — maps multiple inside IPs to one outside address with port translation.',
      ckuIds: ['CKU-NAT-PAT'],
    }],
  },
  '5.5': {
    questions: [{
      id: '5.5-w7-q1', concept: 'acl placement', type: 'scenario', difficulty: 'medium',
      question: 'To filter traffic FROM subnet 10.1.1.0/24 entering a router, apply the ACL:',
      choices: ['Inbound on the interface where packets arrive', 'Outbound on the destination interface only', 'Globally in config mode', 'On the switch SVI only'],
      correctIndex: 0,
      explanation: 'Extended ACLs filter closest to source — inbound on the ingress interface for traffic leaving 10.1.1.0.',
      ckuIds: ['CKU-ACL-PLACEMENT'],
    }],
  },
}
