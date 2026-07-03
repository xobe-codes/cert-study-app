/** Content depth wave 5 — supplemental MC for Tier B objectives not in waves 3–4 or WLAN wave. */

export const CONTENT_DEPTH_WAVE5_PATCHES = {
  '1.4': {
    questions: [{
      id: '1.4-w5-q1', concept: 'interface errors', type: 'scenario', difficulty: 'medium',
      question: 'A switch port shows high CRC errors. First troubleshooting step?',
      choices: ['Check cable/SFP and duplex on both ends', 'Reconfigure OSPF area', 'Add a static default route', 'Disable spanning tree'],
      correctIndex: 0,
      explanation: 'CRC/input errors point to physical layer — cable, SFP, or duplex mismatch before routing protocols.',
      ckuIds: ['CKU-INTERFACE-ERRORS'],
    }],
  },
  '1.12': {
    questions: [{
      id: '1.12-w5-q1', concept: 'virtualization', type: 'definition', difficulty: 'easy',
      question: 'Network virtualization on a hypervisor host primarily provides:',
      choices: ['Virtual switches/routers decoupled from physical topology', 'Faster copper throughput', 'Elimination of VLANs', 'Automatic OSPF on VMs'],
      correctIndex: 0,
      explanation: 'Virtual network functions run on hypervisors — logical L2/L3 separate from underlying hardware.',
      ckuIds: ['CKU-VIRTUALIZATION'],
    }],
  },
  '5.10': {
    questions: [{
      id: '5.10-w5-q1', concept: 'site-to-site vpn', type: 'compare', difficulty: 'medium',
      question: 'Site-to-site IPsec VPN typically terminates on:',
      choices: ['WAN edge routers or firewalls at each site', 'Every access switch', 'DNS servers only', 'DHCP relay agents'],
      correctIndex: 0,
      explanation: 'Head-end devices at each site build the tunnel — not access-layer switches.',
      ckuIds: ['CKU-VPN'],
    }],
  },
  '5.11': {
    questions: [{
      id: '5.11-w5-q1', concept: 'segmentation', type: 'application', difficulty: 'medium',
      question: 'Micro-segmentation in a zero-trust model most often uses:',
      choices: ['Granular ACLs/firewall policies between segments', 'Single flat VLAN for simplicity', 'Disabling routing between VLANs only', 'Open guest Wi-Fi'],
      correctIndex: 0,
      explanation: 'Zero trust enforces least privilege per segment — ACLs/firewall between zones, not flat networks.',
      ckuIds: ['CKU-SEGMENTATION'],
    }],
  },
  '6.1': {
    questions: [{
      id: '6.1-w5-q1', concept: 'ansible playbook', type: 'definition', difficulty: 'easy',
      question: 'An Ansible playbook is best described as:',
      choices: ['Ordered list of tasks in YAML applied to inventory hosts', 'Binary IOS image file', 'SNMP MIB database', 'STP BPDU capture'],
      correctIndex: 0,
      explanation: 'Playbooks declare desired tasks in YAML — Ansible pushes them agentlessly over SSH.',
      ckuIds: ['CKU-AUTOMATION'],
    }],
  },
  '6.2': {
    questions: [{
      id: '6.2-w5-q1', concept: 'control data plane', type: 'definition', difficulty: 'medium',
      question: 'In SDN, the data plane is responsible for:',
      choices: ['Forwarding packets based on installed forwarding tables', 'Running BGP route reflectors only', 'Storing user passwords', 'DHCP lease assignment'],
      correctIndex: 0,
      explanation: 'Data plane = fast forwarding on switches/routers; control plane programs those tables.',
      ckuIds: ['CKU-SDN-TRAD'],
    }],
  },
  '6.3': {
    questions: [{
      id: '6.3-w5-q1', concept: 'southbound api', type: 'definition', difficulty: 'medium',
      question: 'A southbound API on an SDN controller communicates with:',
      choices: ['Network devices (switches/routers)', 'End-user web browsers only', 'DNS root servers', 'Cable modems'],
      correctIndex: 0,
      explanation: 'Southbound = controller to devices (NETCONF, OpenFlow, CLI); northbound = apps to controller.',
      ckuIds: ['CKU-SDN-ARCH'],
    }],
  },
  '6.4': {
    questions: [{
      id: '6.4-w5-q1', concept: 'dna center', type: 'definition', difficulty: 'easy',
      question: 'Cisco DNA Center is primarily used for:',
      choices: ['Campus design, provisioning, and assurance automation', 'Replacing all Layer 2 switching', 'Generating WPA2 passphrases', 'OSPF area planning only'],
      correctIndex: 0,
      explanation: 'DNA Center orchestrates campus intent — design, deploy, monitor — not a replacement for all L2.',
      ckuIds: ['CKU-DNA'],
    }],
  },
  '2.7': {
    questions: [{
      id: '2.7-w5-q1', concept: 'dai', type: 'scenario', difficulty: 'medium',
      question: 'Dynamic ARP Inspection (DAI) depends on which feature being enabled first?',
      choices: ['DHCP snooping', 'OSPF', 'HSRP', 'EtherChannel'],
      correctIndex: 0,
      explanation: 'DAI uses the DHCP snooping binding table to validate ARP replies on untrusted ports.',
      ckuIds: ['CKU-DHCP-SNOOPING'],
    }],
  },
  '4.10': {
    questions: [{
      id: '4.10-w5-q1', concept: 'cloud management', type: 'compare', difficulty: 'medium',
      question: 'Cloud-based network management (e.g. Meraki dashboard) differs from box-by-box CLI because:',
      choices: ['Centralized policy and monitoring across many sites', 'It removes the need for IP addressing', 'Devices cannot use VLANs', 'SNMP is forbidden'],
      correctIndex: 0,
      explanation: 'Cloud controllers centralize config and visibility — underlay still uses normal L2/L3.',
      ckuIds: ['CKU-CLOUD-MGMT'],
    }],
  },
  '3.3': {
    questions: [{
      id: '3.3-w5-q1', concept: 'floating static', type: 'application', difficulty: 'medium',
      question: 'A floating static route is used to:',
      choices: ['Provide backup path when primary route fails (higher AD)', 'Load-balance per packet always', 'Replace OSPF entirely', 'Assign DHCP options'],
      correctIndex: 0,
      explanation: 'Floating static has higher AD — installs only when preferred route disappears.',
      ckuIds: ['CKU-STATIC-ROUTE'],
    }],
  },
  '4.4': {
    questions: [{
      id: '4.4-w5-q1', concept: 'snmp trap', type: 'definition', difficulty: 'easy',
      question: 'SNMP traps are:',
      choices: ['Asynchronous alerts sent from agent to manager', 'Synchronous TCP downloads of IOS images', 'DHCP discover messages', 'OSPF LSAs'],
      correctIndex: 0,
      explanation: 'Traps/ informs push events to the NMS — unlike polled GET requests.',
      ckuIds: ['CKU-SNMP'],
    }],
  },
  '4.5': {
    questions: [{
      id: '4.5-w5-q1', concept: 'syslog facility', type: 'definition', difficulty: 'medium',
      question: 'Syslog facility LOCAL7 on a Cisco router typically maps to:',
      choices: ['Locally defined / user-level messages', 'Kernel panic only', 'DNS queries', 'BGP keepalives'],
      correctIndex: 0,
      explanation: 'LOCAL0–LOCAL7 are locally significant facilities — often used for user/app logging.',
      ckuIds: ['CKU-SYSLOG'],
    }],
  },
  '5.4': {
    questions: [{
      id: '5.4-w5-q1', concept: 'tacacs vs radius', type: 'compare', difficulty: 'medium',
      question: 'TACACS+ is often preferred over RADIUS for device administration because:',
      choices: ['It separates authentication, authorization, and accounting (AAA) more granularly for CLI', 'It encrypts only the password field', 'It uses UDP exclusively', 'It replaces SSH'],
      correctIndex: 0,
      explanation: 'TACACS+ encrypts the whole session and splits AAA — common for router/switch login.',
      ckuIds: ['CKU-AAA'],
    }],
  },
  '6.6': {
    questions: [{
      id: '6.6-w5-q1', concept: 'json null', type: 'definition', difficulty: 'easy',
      question: 'In JSON, a key with no value is represented as:',
      choices: ['null', 'undefined', 'void', 'N/A string only'],
      correctIndex: 0,
      explanation: 'JSON uses `null` for absent values — `undefined` is not valid JSON.',
      ckuIds: ['CKU-JSON-ANSIBLE'],
    }],
  },
}
