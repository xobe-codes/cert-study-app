/** Content depth wave 4 — one supplemental MC per Tier B objective not covered in wave 3. */

export const CONTENT_DEPTH_WAVE4_PATCHES = {
  '1.2': {
    questions: [{
      id: '1.2-w4-q1', concept: 'collapsed core', type: 'definition', difficulty: 'medium',
      question: 'A two-tier campus design merges which traditional tiers?',
      choices: ['Access and distribution', 'Distribution and core', 'Core and WAN edge', 'Spine and leaf'],
      correctIndex: 1,
      explanation: 'Collapsed core combines distribution and core for smaller sites — access still connects end devices.',
      ckuIds: ['CKU-CAMPUS-TIER'],
    }],
  },
  '1.3': {
    questions: [{
      id: '1.3-w4-q1', concept: 'fiber sm mm', type: 'compare', difficulty: 'medium',
      question: 'Which fiber type is typically yellow jacketed and used for long-distance laser links?',
      choices: ['Single-mode', 'Multimode OM1', 'Copper Cat5e', 'Coaxial'],
      correctIndex: 0,
      explanation: 'Single-mode fiber (often yellow) uses a smaller core and laser for km-scale runs.',
      ckuIds: ['CKU-FIBER'],
    }],
  },
  '1.7': {
    questions: [{
      id: '1.7-w4-q1', concept: 'private ipv4', type: 'definition', difficulty: 'easy',
      question: 'Which address range is private per RFC 1918?',
      choices: ['10.0.0.0/8', '8.8.8.0/24', '203.0.113.0/24', '169.254.0.0/16'],
      correctIndex: 0,
      explanation: '10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16 are RFC 1918 private ranges.',
      ckuIds: ['CKU-RFC1918'],
    }],
  },
  '1.10': {
    questions: [{
      id: '1.10-w4-q1', concept: 'ping icmp', type: 'application', difficulty: 'easy',
      question: 'A successful ping to 10.1.1.1 confirms at minimum:',
      choices: ['Reachability to that IP at Layer 3', 'DNS resolution works', 'HTTP server is up', 'OSPF is converged'],
      correctIndex: 0,
      explanation: 'Ping tests ICMP reachability — it does not verify DNS, application services, or routing protocol state.',
      ckuIds: ['CKU-PING-TRACE'],
    }],
  },
  '1.11': {
    questions: [{
      id: '1.11-w4-q1', concept: 'wifi bands', type: 'compare', difficulty: 'medium',
      question: '2.4 GHz vs 5 GHz on the same SSID — which is usually true?',
      choices: ['2.4 GHz penetrates walls better; 5 GHz offers more non-overlapping channels', '5 GHz always has longer range than 2.4 GHz', '2.4 GHz has no interference sources', 'Bands share identical throughput'],
      correctIndex: 0,
      explanation: '2.4 GHz reaches farther through obstacles; 5 GHz has more channels and typically higher throughput at shorter range.',
      ckuIds: ['CKU-WIFI-BANDS'],
    }],
  },
  '2.6': {
    questions: [{
      id: '2.6-w4-q1', concept: 'capwap', type: 'definition', difficulty: 'medium',
      question: 'Lightweight APs tunnel control and data to a WLC using:',
      choices: ['CAPWAP', 'BGP', 'VTP', 'LACP'],
      correctIndex: 0,
      explanation: 'CAPWAP (UDP 5246 control, 5247 data) connects lightweight APs to the wireless LAN controller.',
      ckuIds: ['CKU-WLAN-ARCH'],
    }],
  },
  '3.3': {
    questions: [{
      id: '3.3-w4-q1', concept: 'floating static', type: 'scenario', difficulty: 'medium',
      question: 'A backup static route should be installed only when OSPF fails. How is it configured?',
      choices: ['Same prefix with higher administrative distance', 'Lower metric than OSPF', 'Default route only', 'ip route without a next-hop'],
      correctIndex: 0,
      explanation: 'Floating static routes use a higher AD (e.g. 130) so they stay inactive while the lower-AD dynamic route is present.',
      ckuIds: ['CKU-FLOATING-STATIC'],
    }],
  },
  '4.3': {
    questions: [{
      id: '4.3-w4-q1', concept: 'dhcp dora', type: 'definition', difficulty: 'easy',
      question: 'In DHCP DORA, which message does the server send after Discover?',
      choices: ['Offer', 'Acknowledge', 'Request', 'Release'],
      correctIndex: 0,
      explanation: 'DORA: Discover (client) → Offer (server) → Request (client) → Acknowledge (server).',
      ckuIds: ['CKU-DHCP'],
    }],
  },
  '4.4': {
    questions: [{
      id: '4.4-w4-q1', concept: 'snmp trap', type: 'compare', difficulty: 'medium',
      question: 'SNMP TRAP differs from SNMP GET because:',
      choices: ['TRAP is agent-initiated; GET is manager-initiated', 'TRAP uses TCP only', 'GET is always encrypted', 'TRAP requires SNMPv3 only'],
      correctIndex: 0,
      explanation: 'GET/GET-NEXT are polls from the manager; TRAP/INFORM are unsolicited alerts from the agent.',
      ckuIds: ['CKU-SNMP'],
    }],
  },
  '4.5': {
    questions: [{
      id: '4.5-w4-q1', concept: 'syslog severity', type: 'definition', difficulty: 'easy',
      question: 'Syslog severity level 3 corresponds to:',
      choices: ['Error conditions', 'Debug messages', 'Emergency', 'Informational'],
      correctIndex: 0,
      explanation: 'Severity 0 = emergency through 7 = debug — level 3 is error conditions.',
      ckuIds: ['CKU-SYSLOG'],
    }],
  },
  '4.9': {
    questions: [{
      id: '4.9-w4-q1', concept: 'tftp copy', type: 'application', difficulty: 'medium',
      question: 'Which IOS command uploads running-config to TFTP server 192.168.1.10?',
      choices: ['copy running-config tftp://192.168.1.10/running.cfg', 'copy tftp running-config', 'archive upload tftp', 'write memory tftp'],
      correctIndex: 0,
      explanation: 'Source first, destination second — `copy running-config tftp:` pushes the config to the server.',
      ckuIds: ['CKU-TFTP-FTP'],
    }],
  },
  '4.10': {
    questions: [{
      id: '4.10-w4-q1', concept: 'intent networking', type: 'definition', difficulty: 'medium',
      question: 'Intent-based networking means the operator:',
      choices: ['Declares desired outcome; controller translates to device config', 'Configures each device manually only', 'Disables all APIs', 'Removes CLI from devices'],
      correctIndex: 0,
      explanation: 'Intent-based systems map business intent to network policy — DNA Center is a CCNA example.',
      ckuIds: ['CKU-MGMT-CLOUD'],
    }],
  },
  '5.1': {
    questions: [{
      id: '5.1-w4-q1', concept: 'worm malware', type: 'definition', difficulty: 'medium',
      question: 'Which malware type self-replicates across networks without attaching to a host file?',
      choices: ['Worm', 'Virus', 'Trojan', 'Spyware only'],
      correctIndex: 0,
      explanation: 'Worms propagate independently; viruses need a host file and user action to spread.',
      ckuIds: ['CKU-COMMON-THREATS'],
    }],
  },
  '5.2': {
    questions: [{
      id: '5.2-w4-q1', concept: 'security program', type: 'definition', difficulty: 'easy',
      question: 'A security program includes people, process, and:',
      choices: ['Technology', 'Spanning tree', 'NAT overload', 'EtherChannel'],
      correctIndex: 0,
      explanation: 'Effective programs layer training and policy (people/process) with technical controls.',
      ckuIds: ['CKU-SECURITY-PROGRAM'],
    }],
  },
  '5.8': {
    questions: [{
      id: '5.8-w4-q1', concept: 'wpa3 sae', type: 'compare', difficulty: 'medium',
      question: 'WPA3-Personal improves on WPA2-PSK primarily through:',
      choices: ['SAE (Simultaneous Authentication of Equals) key exchange', 'WEP compatibility', 'Open authentication', 'Removing passphrases'],
      correctIndex: 0,
      explanation: 'WPA3 uses SAE for stronger key exchange against offline dictionary attacks.',
      ckuIds: ['CKU-WLAN-SEC'],
    }],
  },
}
