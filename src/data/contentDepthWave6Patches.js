/** Content depth wave 6 — supplemental MC for fundamentals + Tier B gaps not in waves 3–5. */

export const CONTENT_DEPTH_WAVE6_PATCHES = {
  '1.1': {
    questions: [{
      id: '1.1-w6-q1', concept: 'osi layers', type: 'definition', difficulty: 'easy',
      question: 'At which OSI layer does a router primarily operate?',
      choices: ['Layer 3 (Network)', 'Layer 2 (Data Link)', 'Layer 1 (Physical)', 'Layer 7 (Application)'],
      correctIndex: 0,
      explanation: 'Routers forward based on IP addresses — Layer 3. Switches are L2; hubs are L1.',
      ckuIds: ['CKU-OSI'],
    }],
  },
  '1.5': {
    questions: [{
      id: '1.5-w6-q1', concept: 'tcp vs udp', type: 'compare', difficulty: 'medium',
      question: 'Which traffic type is most appropriate for UDP rather than TCP?',
      choices: ['Real-time voice where occasional loss is acceptable', 'File transfer requiring reliable delivery', 'HTTPS web browsing', 'SMTP email'],
      correctIndex: 0,
      explanation: 'UDP suits latency-sensitive streams (VoIP) — TCP retransmits add delay; files need reliability.',
      ckuIds: ['CKU-TCP-UDP'],
    }],
  },
  '1.6': {
    questions: [{
      id: '1.6-w6-q1', concept: 'ipv6 address', type: 'definition', difficulty: 'easy',
      question: 'An IPv6 link-local address always begins with which prefix?',
      choices: ['fe80::/10', '2001::/16', 'ff00::/8', '169.254.0.0/16'],
      correctIndex: 0,
      explanation: 'fe80::/10 is link-local on every IPv6 interface — not routable off-segment.',
      ckuIds: ['CKU-IPV6'],
    }],
  },
  '1.8': {
    questions: [{
      id: '1.8-w6-q1', concept: 'wireless bands', type: 'definition', difficulty: 'easy',
      question: '2.4 GHz Wi-Fi compared to 5 GHz typically offers:',
      choices: ['Better range through walls but less channel capacity', 'Shorter range only — never used in enterprise', 'Higher max throughput on every channel', 'No overlap between channels'],
      correctIndex: 0,
      explanation: '2.4 GHz penetrates better but has fewer non-overlapping channels; 5 GHz is faster/shorter range.',
      ckuIds: ['CKU-WIRELESS-BANDS'],
    }],
  },
  '1.9': {
    questions: [{
      id: '1.9-w6-q1', concept: 'network architecture', type: 'definition', difficulty: 'easy',
      question: 'In a three-tier campus design, the distribution layer primarily:',
      choices: ['Aggregates access switches and enforces policy between access and core', 'Connects end hosts directly', 'Replaces all routing with flat switching', 'Hosts only DNS servers'],
      correctIndex: 0,
      explanation: 'Distribution aggregates access, provides inter-VLAN routing/policy — core handles high-speed backbone.',
      ckuIds: ['CKU-ARCHITECTURE'],
    }],
  },
  '2.3': {
    questions: [{
      id: '2.3-w6-q1', concept: 'mac learning', type: 'scenario', difficulty: 'medium',
      question: 'A switch floods a frame because the destination MAC is unknown. After delivery, the switch:',
      choices: ['Learns the source MAC on the ingress port', 'Clears the entire MAC table', 'Blocks the port permanently', 'Sends a DHCP discover'],
      correctIndex: 0,
      explanation: 'Learning records source MAC → ingress port; unknown unicast destinations trigger flooding.',
      ckuIds: ['CKU-MAC-TABLE'],
    }],
  },
  '2.4': {
    questions: [{
      id: '2.4-w6-q1', concept: 'vlan trunk', type: 'application', difficulty: 'medium',
      question: 'To carry VLANs 10 and 20 across a trunk, which command on Cisco IOS is required?',
      choices: ['switchport trunk allowed vlan 10,20', 'vlan 10,20 on the access port', 'ip route vlan 10', 'spanning-tree vlan 10 root'],
      correctIndex: 0,
      explanation: 'Trunk allowed VLAN list controls which VLAN tags cross the link — default may allow all or limited set.',
      ckuIds: ['CKU-VLAN-TRUNK'],
    }],
  },
  '3.2': {
    questions: [{
      id: '3.2-w6-q1', concept: 'static route', type: 'application', difficulty: 'medium',
      question: 'Which command adds a static route to 10.0.0.0/8 via next-hop 192.168.1.2?',
      choices: ['ip route 10.0.0.0 255.0.0.0 192.168.1.2', 'ip route 192.168.1.2 10.0.0.0 255.0.0.0', 'router static 10.0.0.0', 'ip default-gateway 10.0.0.0'],
      correctIndex: 0,
      explanation: 'IOS syntax: ip route <network> <mask> <next-hop>. Hosts use default-gateway, not ip route.',
      ckuIds: ['CKU-STATIC-ROUTE'],
    }],
  },
  '4.2': {
    questions: [{
      id: '4.2-w6-q1', concept: 'ntp stratum', type: 'definition', difficulty: 'easy',
      question: 'In NTP, a lower stratum number indicates:',
      choices: ['A clock closer to an authoritative time source', 'A completely unsynchronized device', 'Higher jitter tolerance only', 'Use of SNMP instead of NTP'],
      correctIndex: 0,
      explanation: 'Stratum 1 = reference clock; each hop adds stratum — lower is more authoritative.',
      ckuIds: ['CKU-NTP'],
    }],
  },
  '4.3': {
    questions: [{
      id: '4.3-w6-q1', concept: 'dhcp pool', type: 'application', difficulty: 'medium',
      question: 'Which DHCP pool command sets the default gateway option for clients?',
      choices: ['default-router 192.168.1.1', 'ip helper-address 192.168.1.1', 'dns-server 192.168.1.1', 'network 192.168.1.0'],
      correctIndex: 0,
      explanation: 'default-router sets option 3 (gateway); dns-server sets option 6; network defines the pool range.',
      ckuIds: ['CKU-DHCP'],
    }],
  },
  '5.7': {
    questions: [{
      id: '5.7-w6-q1', concept: 'wireless security', type: 'compare', difficulty: 'medium',
      question: 'WPA2-Personal secures wireless primarily with:',
      choices: ['PSK + AES (CCMP) encryption', 'Open authentication only', 'WEP shared key', 'MAC filtering alone'],
      correctIndex: 0,
      explanation: 'WPA2-Personal uses a pre-shared key with AES — CCNA still emphasizes WPA2 over WPA3 wording.',
      ckuIds: ['CKU-WLAN-SECURITY'],
    }],
  },
  '6.5': {
    questions: [{
      id: '6.5-w6-q1', concept: 'rest api', type: 'definition', difficulty: 'medium',
      question: 'A REST API GET request to /devices/interfaces typically:',
      choices: ['Retrieves interface data without changing device state', 'Deletes all interfaces', 'Encrypts the running config', 'Reboots the device'],
      correctIndex: 0,
      explanation: 'GET is read-only in REST — POST/PUT/PATCH modify; DELETE removes resources.',
      ckuIds: ['CKU-REST'],
    }],
  },
}
