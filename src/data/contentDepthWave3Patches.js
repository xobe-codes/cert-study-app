/** Content depth wave 3 — one supplemental MC per objective still at 7 questions. */

export const CONTENT_DEPTH_WAVE3_PATCHES = {
  '2.3': {
    questions: [{
      id: '2.3-w3-q1', concept: 'lldp cdp', type: 'compare', difficulty: 'medium',
      question: 'Which discovery protocol is industry-standard and vendor-neutral?',
      choices: ['LLDP', 'CDP', 'DTP', 'VTP'],
      correctIndex: 0,
      explanation: 'LLDP (802.1AB) is vendor-neutral; CDP is Cisco-proprietary.',
      ckuIds: ['CKU-LLDP-CDP'],
    }],
  },
  '2.4': {
    questions: [{
      id: '2.4-w3-q1', concept: 'lacp pagp', type: 'definition', difficulty: 'easy',
      question: 'Which EtherChannel protocol is IEEE-standard?',
      choices: ['LACP (802.3ad)', 'PAgP', 'DTP', 'VTP'],
      correctIndex: 0,
      explanation: 'LACP is the open standard; PAgP is Cisco-proprietary.',
      ckuIds: ['CKU-ETHERCHANNEL'],
    }],
  },
  '2.7': {
    questions: [{
      id: '2.7-w3-q1', concept: 'dhcp snooping', type: 'scenario', difficulty: 'medium',
      question: 'Untrusted access ports should use DHCP snooping to:',
      choices: ['Block rogue DHCP offers from user ports', 'Replace DNS servers', 'Disable ARP', 'Encrypt DHCP payloads'],
      correctIndex: 0,
      explanation: 'Snooping drops DHCP server messages on untrusted ports — stops rogue gateways.',
      ckuIds: ['CKU-DHCP-SNOOPING'],
    }],
  },
  '2.8': {
    questions: [{
      id: '2.8-w3-q1', concept: 'wlan bands', type: 'definition', difficulty: 'easy',
      question: 'Which band typically offers more non-overlapping channels but shorter range?',
      choices: ['5 GHz', '2.4 GHz', '900 MHz', '6 GHz only on all APs'],
      correctIndex: 0,
      explanation: '5 GHz has more channels and higher throughput; 2.4 GHz penetrates farther.',
      ckuIds: ['CKU-WLAN-CLIENT'],
    }],
  },
  '3.5': {
    questions: [{
      id: '3.5-w3-q1', concept: 'hsrp priority', type: 'application', difficulty: 'medium',
      question: 'Default HSRP priority on Cisco routers is:',
      choices: ['100', '255', '1', '50'],
      correctIndex: 0,
      explanation: 'Default HSRP priority is 100; higher value wins Active role.',
      ckuIds: ['CKU-HSRP'],
    }],
  },
  '3.6': {
    questions: [{
      id: '3.6-w3-q1', concept: 'nat overload', type: 'definition', difficulty: 'easy',
      question: 'PAT (NAT overload) maps many inside hosts to:',
      choices: ['One outside IP using unique source ports', 'Unique public IPs per host always', 'MAC addresses only', 'IPv6 link-local addresses'],
      correctIndex: 0,
      explanation: 'Overload reuses one outside address with different TCP/UDP ports.',
      ckuIds: ['CKU-NAT-PAT'],
    }],
  },
  '4.2': {
    questions: [{
      id: '4.2-w3-q1', concept: 'ntp stratum', type: 'definition', difficulty: 'medium',
      question: 'Lower NTP stratum number means:',
      choices: ['Closer to the reference clock (more authoritative)', 'Worse time sync', 'Manual clock only', 'Unsynchronized'],
      correctIndex: 0,
      explanation: 'Stratum 1 is closest to the source; each hop increments stratum.',
      ckuIds: ['CKU-NTP'],
    }],
  },
  '4.6': {
    questions: [{
      id: '4.6-w3-q1', concept: 'syslog severity', type: 'definition', difficulty: 'easy',
      question: 'Which syslog severity is most urgent?',
      choices: ['Emergency (0)', 'Informational (6)', 'Debug (7)', 'Notice (5)'],
      correctIndex: 0,
      explanation: 'Severity 0 = emergency; lower number = more critical.',
      ckuIds: ['CKU-SYSLOG'],
    }],
  },
  '4.4': {
    questions: [{
      id: '4.7-w3-q1', concept: 'snmp versions', type: 'compare', difficulty: 'medium',
      question: 'Which SNMP version provides encryption and authentication?',
      choices: ['SNMPv3', 'SNMPv1', 'SNMPv2c community only', 'CDP'],
      correctIndex: 0,
      explanation: 'SNMPv3 adds auth and privacy; v1/v2c use community strings in cleartext.',
      ckuIds: ['CKU-SNMP'],
    }, {
      id: '4.8-w3-q1', concept: 'netflow', type: 'definition', difficulty: 'easy',
      question: 'NetFlow primarily collects:',
      choices: ['Flow records (who talked to whom, ports, bytes)', 'MAC address tables', 'Spanning-tree BPDUs', 'DHCP leases only'],
      correctIndex: 0,
      explanation: 'NetFlow exports metadata about traffic flows for analysis and capacity planning.',
      ckuIds: ['CKU-NETFLOW'],
    }],
  },
  '5.3': {
    questions: [{
      id: '5.3-w3-q1', concept: 'port security', type: 'application', difficulty: 'medium',
      question: 'After port-security violation shutdown, recovery requires:',
      choices: ['`shutdown` then `no shutdown` on the interface', 'Reload the switch only', 'Delete VLAN 1', 'Disable STP'],
      correctIndex: 0,
      explanation: 'Err-disabled ports need manual interface bounce after fixing the violation.',
      ckuIds: ['CKU-PORT-SECURITY'],
    }],
  },
  '5.4': {
    questions: [{
      id: '5.4-w3-q1', concept: 'bpdu guard', type: 'scenario', difficulty: 'medium',
      question: 'BPDU Guard on an access port is intended to:',
      choices: ['Shut the port if a BPDU is received', 'Speed up STP convergence', 'Enable routing on the port', 'Allow extra switches on the access layer'],
      correctIndex: 0,
      explanation: 'Access ports should not receive BPDUs — Guard err-disables rogue switch connections.',
      ckuIds: ['CKU-BPDU-GUARD'],
    }],
  },
  '5.6': {
    questions: [{
      id: '5.6-w3-q1', concept: 'aaa', type: 'definition', difficulty: 'easy',
      question: 'AAA stands for:',
      choices: ['Authentication, Authorization, Accounting', 'Access, Audit, Accounting', 'ARP, ACL, Authentication', 'Automatic Address Assignment'],
      correctIndex: 0,
      explanation: 'AAA frameworks verify identity, permit actions, and log activity.',
      ckuIds: ['CKU-AAA'],
    }],
  },
  '5.7': {
    questions: [{
      id: '5.7-w3-q1', concept: 'acl placement', type: 'application', difficulty: 'medium',
      question: 'Standard ACLs should be placed:',
      choices: ['Close to the destination', 'Close to the source', 'Only on loopbacks', 'On DNS servers'],
      correctIndex: 0,
      explanation: 'Standard ACLs match source only — place near destination so return traffic is not filtered wrongly.',
      ckuIds: ['CKU-ACL-STANDARD'],
    }],
  },
  '5.9': {
    questions: [{
      id: '5.9-w3-q1', concept: 'wlan vlan', type: 'scenario', difficulty: 'medium',
      question: 'WLAN clients get wrong IP subnet after associating. First check:',
      choices: ['WLAN-to-VLAN mapping on the controller/AP', 'OSPF process ID', 'Spanning-tree root', 'NAT overload pool'],
      correctIndex: 0,
      explanation: 'SSID must map to the correct VLAN interface for DHCP scope.',
      ckuIds: ['CKU-WPA2-PSK'],
    }],
  },
  '6.5': {
    questions: [{
      id: '6.5-w3-q1', concept: 'json yaml', type: 'definition', difficulty: 'easy',
      question: 'Which data format is most common in REST API request bodies for network automation?',
      choices: ['JSON', 'Binary STP BPDUs', 'NetBIOS frames', 'Raw MAC tables'],
      correctIndex: 0,
      explanation: 'REST APIs typically exchange JSON over HTTPS.',
      ckuIds: ['CKU-REST-API'],
    }],
  },
  '6.6': {
    questions: [{
      id: '6.6-w3-q1', concept: 'ansible', type: 'definition', difficulty: 'easy',
      question: 'Ansible playbooks are primarily written in:',
      choices: ['YAML', 'C++', 'Assembly', 'STP BPDU format'],
      correctIndex: 0,
      explanation: 'Ansible uses YAML playbooks to describe automation tasks.',
      ckuIds: ['CKU-ANSIBLE'],
    }],
  },
}
