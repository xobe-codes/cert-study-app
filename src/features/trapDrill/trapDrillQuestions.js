/** Curated trap-drill MC — 3 questions per top trap CKU (15 total). */

export const TRAP_DRILL_CKUS = [
  {
    ckuId: 'CKU-ACL',
    trapLabel: 'Forgetting the implicit deny.',
    objectiveId: '5.5',
  },
  {
    ckuId: 'CKU-SUBNETTING',
    trapLabel: 'Forgetting the "− 2" in the host formula.',
    objectiveId: '1.6',
  },
  {
    ckuId: 'CKU-ADMINISTRATIVE-DISTANCE',
    trapLabel: 'Assuming the lowest AD route always wins.',
    objectiveId: '3.2',
  },
  {
    ckuId: 'CKU-NATIVE-VLAN',
    trapLabel: 'Mismatched native VLANs.',
    objectiveId: '2.2',
  },
  {
    ckuId: 'CKU-OSPF',
    trapLabel: 'Using a subnet mask in the network statement.',
    objectiveId: '3.4',
  },
]

const QUESTIONS = [
  // CKU-ACL (3)
  {
    id: 'trap-acl-1',
    ckuId: 'CKU-ACL',
    trapLabel: 'Forgetting the implicit deny.',
    objectiveId: '5.5',
    question: 'An ACL ends with `permit tcp any any eq 443`. What happens to UDP/53 traffic?',
    choices: [
      'It is permitted because TCP was allowed',
      'It is denied by the implicit deny any at the end',
      'It is permitted until the ACL is applied to an interface',
      'It depends on the routing table',
    ],
    correctIndex: 1,
    explanation: 'Every ACL has an implicit deny any — traffic that does not match a permit is dropped.',
    type: 'scenario',
    concept: 'acl',
  },
  {
    id: 'trap-acl-2',
    ckuId: 'CKU-ACL',
    trapLabel: 'Misordering rules.',
    objectiveId: '5.5',
    question: 'Which ACL line order correctly blocks 10.1.1.0/24 but permits all other 10.0.0.0/8?',
    choices: [
      'deny 10.0.0.0 0.255.255.255 → permit 10.1.1.0 0.0.0.255',
      'deny 10.1.1.0 0.0.0.255 → permit 10.0.0.0 0.255.255.255',
      'permit 10.0.0.0 0.255.255.255 → deny 10.1.1.0 0.0.0.255',
      'permit any → deny 10.1.1.0 0.0.0.255',
    ],
    correctIndex: 1,
    explanation: 'First match wins — put the specific deny before the broad permit.',
    type: 'application',
    concept: 'acl',
  },
  {
    id: 'trap-acl-3',
    ckuId: 'CKU-ACL',
    trapLabel: 'Forgetting the implicit deny.',
    objectiveId: '5.5',
    question: 'You configure only `deny host 192.168.1.50`. What is the effect on other hosts?',
    choices: [
      'All other hosts are permitted explicitly',
      'All other hosts are denied by implicit deny any',
      'The ACL is invalid until a permit is added',
      'Only inbound traffic is affected',
    ],
    correctIndex: 1,
    explanation: 'A single deny still leaves the implicit deny any — you must add permit statements for allowed traffic.',
    type: 'scenario',
    concept: 'acl',
  },
  // CKU-SUBNETTING (3)
  {
    id: 'trap-sub-1',
    ckuId: 'CKU-SUBNETTING',
    trapLabel: 'Forgetting the "− 2" in the host formula.',
    objectiveId: '1.6',
    question: 'How many usable host addresses exist in a /26 subnet?',
    choices: ['64', '62', '32', '30'],
    correctIndex: 1,
    explanation: '6 host bits → 2^6 = 64 total, minus network and broadcast = 62 usable hosts.',
    type: 'application',
    concept: 'subnetting',
  },
  {
    id: 'trap-sub-2',
    ckuId: 'CKU-SUBNETTING',
    trapLabel: 'Confusing subnets (2^b) with hosts (2^h − 2).',
    objectiveId: '1.6',
    question: 'You borrow 3 bits for subnets in a /24. How many subnets and usable hosts per subnet?',
    choices: [
      '8 subnets, 32 hosts each',
      '8 subnets, 30 hosts each',
      '6 subnets, 32 hosts each',
      '6 subnets, 30 hosts each',
    ],
    correctIndex: 1,
    explanation: '3 borrowed bits → 2^3 = 8 subnets; 5 host bits remain → 2^5 − 2 = 30 usable hosts.',
    type: 'application',
    concept: 'subnetting',
  },
  {
    id: 'trap-sub-3',
    ckuId: 'CKU-SUBNETTING',
    trapLabel: 'Forgetting the "− 2" in the host formula.',
    objectiveId: '1.6',
    question: 'A /30 link is needed between two routers. How many usable addresses does it provide?',
    choices: ['4', '2', '1', '0'],
    correctIndex: 1,
    explanation: '/30 has 2 host bits → 4 total addresses minus network and broadcast = 2 usable (one per router).',
    type: 'definition',
    concept: 'subnetting',
  },
  // CKU-ADMINISTRATIVE-DISTANCE (3)
  {
    id: 'trap-ad-1',
    ckuId: 'CKU-ADMINISTRATIVE-DISTANCE',
    trapLabel: 'Assuming the lowest AD route always wins.',
    objectiveId: '3.2',
    question: 'A router has 10.0.0.0/8 via OSPF (AD 110) and 10.1.0.0/16 via static (AD 1). Which route is used for 10.1.5.10?',
    choices: [
      'The static /16 because AD 1 is lower',
      'The OSPF /8 because it was learned first',
      'The more specific /16 static route regardless of comparing to /8',
      'Both are installed and load-balanced',
    ],
    correctIndex: 2,
    explanation: 'Longest-prefix match decides first — /16 beats /8 even if the /8 has lower AD.',
    type: 'scenario',
    concept: 'routing',
  },
  {
    id: 'trap-ad-2',
    ckuId: 'CKU-ADMINISTRATIVE-DISTANCE',
    trapLabel: 'Forgetting AD 255 behavior.',
    objectiveId: '3.2',
    question: 'What happens to a route learned with administrative distance 255?',
    choices: [
      'It becomes the backup floating static',
      'It is installed with lowest priority',
      'It is considered unusable and not installed',
      'It is used only when no other route exists',
    ],
    correctIndex: 2,
    explanation: 'AD 255 marks a route as invalid — it never enters the routing table.',
    type: 'definition',
    concept: 'routing',
  },
  {
    id: 'trap-ad-3',
    ckuId: 'CKU-ADMINISTRATIVE-DISTANCE',
    trapLabel: 'Assuming the lowest AD route always wins.',
    objectiveId: '3.2',
    question: 'Two routes to 172.16.0.0/16 exist: EIGRP (AD 90) and OSPF (AD 110). Which is installed?',
    choices: [
      'OSPF because it has a lower metric',
      'EIGRP because AD 90 beats AD 110 for the same prefix',
      'Both are installed for ECMP',
      'Neither — AD must match to compare',
    ],
    correctIndex: 1,
    explanation: 'For the same prefix, lower AD wins — EIGRP (90) is preferred over OSPF (110).',
    type: 'scenario',
    concept: 'routing',
  },
  // CKU-NATIVE-VLAN (3)
  {
    id: 'trap-nvlan-1',
    ckuId: 'CKU-NATIVE-VLAN',
    trapLabel: 'Mismatched native VLANs.',
    objectiveId: '2.2',
    question: 'Switch A trunk native VLAN is 1; Switch B native VLAN is 99. What does CDP report?',
    choices: [
      'Nothing — trunks always work',
      'Native VLAN mismatch warning',
      'VTP domain error',
      'STP root inconsistency only',
    ],
    correctIndex: 1,
    explanation: 'Mismatched native VLANs trigger a CDP warning and can cause traffic leaks between VLANs.',
    type: 'troubleshooting',
    concept: 'vlan',
  },
  {
    id: 'trap-nvlan-2',
    ckuId: 'CKU-NATIVE-VLAN',
    trapLabel: 'Thinking all VLANs are tagged.',
    objectiveId: '2.2',
    question: 'On an 802.1Q trunk, which VLAN frames are sent untagged?',
    choices: [
      'All VLANs except VLAN 1',
      'Only the native VLAN',
      'Every VLAN above 100',
      'None — 802.1Q always tags',
    ],
    correctIndex: 1,
    explanation: 'The native VLAN is the only VLAN sent without an 802.1Q tag on a trunk.',
    type: 'definition',
    concept: 'vlan',
  },
  {
    id: 'trap-nvlan-3',
    ckuId: 'CKU-NATIVE-VLAN',
    trapLabel: 'Mismatched native VLANs.',
    objectiveId: '2.2',
    question: 'Best practice for native VLAN on a trunk to an untrusted switch?',
    choices: [
      'Leave it as VLAN 1',
      'Match VLAN 1 on both sides',
      'Change native VLAN to an unused VLAN and verify both ends match',
      'Disable the native VLAN with switchport trunk native vlan tag',
    ],
    correctIndex: 2,
    explanation: 'Move native VLAN off VLAN 1 and ensure both trunk ends use the same native VLAN ID.',
    type: 'application',
    concept: 'vlan',
  },
  // CKU-OSPF (3)
  {
    id: 'trap-ospf-1',
    ckuId: 'CKU-OSPF',
    trapLabel: 'Using a subnet mask in the network statement.',
    objectiveId: '3.4',
    question: 'Which OSPF network statement enables 192.168.10.0/24 on area 0?',
    choices: [
      'network 192.168.10.0 255.255.255.0 area 0',
      'network 192.168.10.0 0.0.0.255 area 0',
      'network 192.168.10.0/24 area 0',
      'network 192.168.10.0 0.255.255.255 area 0',
    ],
    correctIndex: 1,
    explanation: 'OSPF network statements use wildcard masks — /24 is 0.0.0.255, not a subnet mask.',
    type: 'application',
    concept: 'ospf',
  },
  {
    id: 'trap-ospf-2',
    ckuId: 'CKU-OSPF',
    trapLabel: 'Expecting DR/BDR on point-to-point links.',
    objectiveId: '3.4',
    question: 'On a serial point-to-point OSPF link, how many DR/BDR are elected?',
    choices: ['Two — one DR and one BDR', 'One DR only', 'None — DR/BDR are not elected', 'Depends on priority only'],
    correctIndex: 2,
    explanation: 'Point-to-point links skip DR/BDR election — only multi-access segments elect them.',
    type: 'definition',
    concept: 'ospf',
  },
  {
    id: 'trap-ospf-3',
    ckuId: 'CKU-OSPF',
    trapLabel: 'Using a subnet mask in the network statement.',
    objectiveId: '3.4',
    question: 'To match all interfaces in 10.0.0.0/8 for OSPF area 1, which wildcard is correct?',
    choices: ['255.0.0.0', '0.255.255.255', '255.255.255.0', '0.0.0.255'],
    correctIndex: 1,
    explanation: 'Wildcard 0.255.255.255 matches any address in 10.0.0.0/8 for the OSPF network command.',
    type: 'application',
    concept: 'ospf',
  },
]

function norm(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Resolve trap label or CKU id to a trap-drill CKU entry. */
export function resolveTrapDrillCku({ trapLabel, ckuId } = {}) {
  if (ckuId) {
    const byId = TRAP_DRILL_CKUS.find(c => c.ckuId === ckuId)
    if (byId) return byId
  }
  if (!trapLabel) return null
  const label = norm(trapLabel)
  const exact = TRAP_DRILL_CKUS.find(c => norm(c.trapLabel) === label)
  if (exact) return exact
  return TRAP_DRILL_CKUS.find(c => {
    const t = norm(c.trapLabel)
    return t.includes(label) || label.includes(t)
  }) || null
}

/** Questions for one trap CKU, or all if no filter. */
export function getTrapDrillQuestions({ trapLabel, ckuId } = {}) {
  const resolved = resolveTrapDrillCku({ trapLabel, ckuId })
  if (resolved) {
    return QUESTIONS.filter(q => q.ckuId === resolved.ckuId)
  }
  if (trapLabel || ckuId) return []
  return [...QUESTIONS]
}

export function getAllTrapDrillQuestions() {
  return [...QUESTIONS]
}
