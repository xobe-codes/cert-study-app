/** Content depth wave 8 — second supplemental MC for high-weight objectives with only 1 depth question. */

export const CONTENT_DEPTH_WAVE8_PATCHES = {
  '3.5': {
    questions: [{
      id: '3.5-w8-q1', concept: 'hsrp preempt', type: 'scenario', difficulty: 'medium',
      question: 'Router A (priority 110, preempt) reboots. Router B (priority 100) is Active. After A returns, who is Active?',
      choices: ['Router A — preempt reclaims Active from lower-priority peer', 'Router B — incumbent stays Active without clear', 'Both become Active until timers expire', 'Neither — HSRP requires manual failback'],
      correctIndex: 0,
      explanation: 'With preempt enabled, a router with higher priority automatically takes Active when it comes back online.',
      ckuIds: ['CKU-HSRP'],
    }],
  },
  '3.6': {
    questions: [{
      id: '3.6-w8-q1', concept: 'troubleshoot layers', type: 'scenario', difficulty: 'medium',
      question: 'PC cannot reach its default gateway. show ip interface brief shows the gateway interface up/up with correct IP. Next step?',
      choices: ['Check ARP table on the router for the PC MAC', 'Reload the router', 'Replace the cable', 'Delete all OSPF neighbors'],
      correctIndex: 0,
      explanation: 'Interface is up with correct IP → verify L2/ARP resolution next. Missing ARP = VLAN or switchport issue between PC and router.',
      ckuIds: ['CKU-TROUBLESHOOT'],
    }],
  },
  '1.6': {
    questions: [{
      id: '1.6-w8-q1', concept: 'vlsm', type: 'application', difficulty: 'medium',
      question: 'You need 50 hosts on one subnet. What is the smallest prefix that fits?',
      choices: ['/26 (62 usable hosts)', '/25 (126 usable hosts)', '/27 (30 usable hosts)', '/28 (14 usable hosts)'],
      correctIndex: 0,
      explanation: '/26 = 64 addresses − 2 (network + broadcast) = 62 usable — smallest that fits 50 hosts.',
      ckuIds: ['CKU-SUBNET'],
    }],
  },
  '1.8': {
    questions: [{
      id: '1.8-w8-q1', concept: 'ipv6 eui-64', type: 'definition', difficulty: 'medium',
      question: 'EUI-64 inserts which value into the middle of a 48-bit MAC to form a 64-bit interface ID?',
      choices: ['FF:FE', 'FF:FF', '00:00', 'FE:80'],
      correctIndex: 0,
      explanation: 'EUI-64 splits the MAC in half and inserts FF:FE, then flips the 7th bit (U/L) to form the IID.',
      ckuIds: ['CKU-IPV6-ADDR'],
    }],
  },
  '1.9': {
    questions: [{
      id: '1.9-w8-q1', concept: 'ipv6 multicast scope', type: 'definition', difficulty: 'medium',
      question: 'Which IPv6 multicast address reaches all routers on the link-local scope?',
      choices: ['ff02::2', 'ff02::1', 'fe80::1', '2001:db8::2'],
      correctIndex: 0,
      explanation: 'ff02::2 = all-routers link-local multicast; ff02::1 = all-nodes; fe80 = unicast link-local.',
      ckuIds: ['CKU-IPV6-TYPES'],
    }],
  },
  '4.6': {
    questions: [{
      id: '4.6-w8-q1', concept: 'dhcp relay', type: 'application', difficulty: 'medium',
      question: 'Clients on VLAN 20 cannot get DHCP addresses. Server is on a remote subnet. What is likely missing?',
      choices: ['ip helper-address on the VLAN 20 SVI pointing to the DHCP server', 'DHCP server on the same VLAN as clients', 'A static route from server to clients', 'Trunk between access switch and server'],
      correctIndex: 0,
      explanation: 'DHCP broadcasts don\'t cross routers — ip helper-address on the gateway interface relays to the remote server.',
      ckuIds: ['CKU-DHCP-RELAY'],
    }],
  },
  '4.7': {
    questions: [{
      id: '4.7-w8-q1', concept: 'qos phb', type: 'definition', difficulty: 'medium',
      question: 'In DiffServ QoS, which per-hop behavior provides the lowest-latency treatment for voice traffic?',
      choices: ['Expedited Forwarding (EF)', 'Assured Forwarding (AF)', 'Best Effort (BE)', 'Class Selector 1 (CS1)'],
      correctIndex: 0,
      explanation: 'EF = low loss, low latency, low jitter — designed for voice/video; AF provides tiered drop probability.',
      ckuIds: ['CKU-QOS'],
    }],
  },
  '4.8': {
    questions: [{
      id: '4.8-w8-q1', concept: 'ssh config', type: 'application', difficulty: 'medium',
      question: 'Which command sequence enables SSH version 2 on a Cisco router?',
      choices: ['hostname + domain-name + crypto key generate rsa + ip ssh version 2', 'ip ssh enable + ssh start', 'transport input ssh (alone)', 'line vty 0 4 + login ssh'],
      correctIndex: 0,
      explanation: 'SSH needs hostname, domain, RSA keys, then ip ssh version 2 — transport input ssh on VTY lines restricts access method.',
      ckuIds: ['CKU-SSH'],
    }],
  },
  '5.1': {
    questions: [{
      id: '5.1-w8-q1', concept: 'cia triad', type: 'definition', difficulty: 'easy',
      question: 'Which security principle ensures data has not been altered in transit?',
      choices: ['Integrity', 'Confidentiality', 'Availability', 'Authentication'],
      correctIndex: 0,
      explanation: 'Integrity = data unchanged (hashing/checksums); Confidentiality = only authorized can read; Availability = accessible when needed.',
      ckuIds: ['CKU-SECURITY-CONCEPTS'],
    }],
  },
  '5.2': {
    questions: [{
      id: '5.2-w8-q1', concept: 'security program', type: 'definition', difficulty: 'easy',
      question: 'A documented set of rules defining acceptable use of company IT resources is called a:',
      choices: ['Security policy', 'Firewall ACL', 'VLAN assignment', 'Routing protocol'],
      correctIndex: 0,
      explanation: 'Security policy = organizational document governing IT use, access, and incident response — not a technical config.',
      ckuIds: ['CKU-SECURITY-PROGRAM'],
    }],
  },
}
