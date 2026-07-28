/** Content depth wave 9 — second supplemental MC for remaining 30 single-question objectives. */

export const CONTENT_DEPTH_WAVE9_PATCHES = {
  '1.1': {
    questions: [{
      id: '1.1-w9-q1', concept: 'encapsulation', type: 'definition', difficulty: 'easy',
      question: 'When a web request leaves a PC, which PDU is created at Layer 4?',
      choices: ['TCP segment (or UDP datagram)', 'IP packet', 'Ethernet frame', 'HTTP message only'],
      correctIndex: 0,
      explanation: 'Encapsulation order: L4 segment → L3 packet → L2 frame. HTTP is L7 payload inside the segment.',
      ckuIds: ['CKU-OSI'],
    }],
  },
  '1.2': {
    questions: [{
      id: '1.2-w9-q1', concept: 'access layer', type: 'definition', difficulty: 'easy',
      question: 'The access layer in a three-tier campus design primarily connects:',
      choices: ['End-user devices to the network', 'Core routers to WAN providers', 'Distribution switches to each other only', 'DNS servers to the Internet'],
      correctIndex: 0,
      explanation: 'Access = user/device attachment. Distribution aggregates access; core provides high-speed backbone.',
      ckuIds: ['CKU-TOPOLOGY'],
    }],
  },
  '1.3': {
    questions: [{
      id: '1.3-w9-q1', concept: 'copper categories', type: 'compare', difficulty: 'medium',
      question: 'Which copper cable category supports 1 Gbps to 100 meters on structured cabling?',
      choices: ['Cat 5e or higher', 'Cat 3', 'Coaxial RG-59', 'Twinax only'],
      correctIndex: 0,
      explanation: 'Cat 5e/6/6a support Gigabit Ethernet at standard distances — Cat 3 is legacy 10 Mbps.',
      ckuIds: ['CKU-CABLING'],
    }],
  },
  '1.4': {
    questions: [{
      id: '1.4-w9-q1', concept: 'interface status', type: 'troubleshooting', difficulty: 'medium',
      question: 'A port shows administratively down/down. What is the most likely cause?',
      choices: ['Interface was manually shut down', 'Cable unplugged at far end', 'STP blocking', 'Wrong VLAN assignment'],
      correctIndex: 0,
      explanation: 'admin down = `shutdown` configured. Physical unplug is usually down/down without "administratively".',
      ckuIds: ['CKU-INTERFACE'],
    }],
  },
  '1.5': {
    questions: [{
      id: '1.5-w9-q1', concept: 'tcp handshake', type: 'definition', difficulty: 'medium',
      question: 'How many packets are exchanged in a successful TCP three-way handshake?',
      choices: ['3 (SYN, SYN-ACK, ACK)', '2 (SYN, ACK)', '4 (SYN, ACK, SYN, ACK)', '1 (combined SYN-ACK only)'],
      correctIndex: 0,
      explanation: 'TCP setup: client SYN → server SYN-ACK → client ACK. Then data transfer begins.',
      ckuIds: ['CKU-TCP-UDP'],
    }],
  },
  '1.7': {
    questions: [{
      id: '1.7-w9-q1', concept: 'apiPA', type: 'definition', difficulty: 'easy',
      question: 'A host self-assigns 169.254.x.x. This indicates:',
      choices: ['APIPA — no DHCP server responded', 'Static IP misconfiguration', 'Class A public address', 'IPv6 link-local only'],
      correctIndex: 0,
      explanation: '169.254.0.0/16 is APIPA (link-local IPv4 fallback) when DHCP fails — host still has L2 connectivity.',
      ckuIds: ['CKU-IPV4'],
    }],
  },
  '1.10': {
    questions: [{
      id: '1.10-w9-q1', concept: 'traceroute', type: 'application', difficulty: 'medium',
      question: 'Traceroute discovers the path to a destination primarily by manipulating:',
      choices: ['IP TTL values and ICMP time-exceeded replies', 'ARP requests on each hop', 'TCP port scans', 'DNS recursive queries'],
      correctIndex: 0,
      explanation: 'Each hop decrements TTL; when TTL hits 0, router sends ICMP time-exceeded — traceroute maps the path.',
      ckuIds: ['CKU-IP-SERVICES'],
    }],
  },
  '1.11': {
    questions: [{
      id: '1.11-w9-q1', concept: 'channel width', type: 'definition', difficulty: 'medium',
      question: 'Increasing channel width on a WLAN (e.g. 20 MHz → 40 MHz) typically:',
      choices: ['Raises throughput but reduces non-overlapping channel options', 'Lowers throughput and increases range', 'Disables 5 GHz operation', 'Requires wired backhaul only'],
      correctIndex: 0,
      explanation: 'Wider channels = more bandwidth but fewer non-overlapping channels in the band — plan carefully in dense deployments.',
      ckuIds: ['CKU-WLAN'],
    }],
  },
  '1.12': {
    questions: [{
      id: '1.12-w9-q1', concept: 'containers', type: 'definition', difficulty: 'easy',
      question: 'A container compared to a VM typically:',
      choices: ['Shares the host OS kernel — lighter weight', 'Includes a full guest OS per instance', 'Cannot use virtual networking', 'Replaces physical switches entirely'],
      correctIndex: 0,
      explanation: 'Containers share the host kernel (namespaces/cgroups) — VMs emulate full hardware with separate OS instances.',
      ckuIds: ['CKU-VIRTUALIZATION'],
    }],
  },
  '2.1': {
    questions: [{
      id: '2.1-w9-q1', concept: 'broadcast domain', type: 'definition', difficulty: 'easy',
      question: 'Which device separates broadcast domains by default?',
      choices: ['Router (and L3 switch with SVIs)', 'Unmanaged hub', 'Layer 2 switch', 'Repeater'],
      correctIndex: 0,
      explanation: 'Routers (L3) do not forward broadcasts — each interface is a separate broadcast domain. L2 switches extend one domain.',
      ckuIds: ['CKU-SWITCHING'],
    }],
  },
  '2.2': {
    questions: [{
      id: '2.2-w9-q1', concept: 'auto-mdix', type: 'definition', difficulty: 'easy',
      question: 'Auto-MDIX on a switch port automatically:',
      choices: ['Detects and adjusts for straight-through vs crossover cabling', 'Assigns VLAN membership', 'Elects STP root bridge', 'Negotiates EtherChannel bundles'],
      correctIndex: 0,
      explanation: 'Auto-MDIX swaps transmit/receive pairs as needed — modern gear often works with either cable type on access ports.',
      ckuIds: ['CKU-ETHERNET'],
    }],
  },
  '2.5': {
    questions: [{
      id: '2.5-w9-q1', concept: 'stp priority', type: 'application', difficulty: 'medium',
      question: 'Lowering a switch spanning-tree priority value makes it:',
      choices: ['More likely to become the root bridge', 'Less likely to become root', 'Disable PortFast automatically', 'Remove all blocked ports'],
      correctIndex: 0,
      explanation: 'Lowest bridge priority wins root election (default 32768) — use `spanning-tree vlan X priority <value>`.',
      ckuIds: ['CKU-STP'],
    }],
  },
  '2.6': {
    questions: [{
      id: '2.6-w9-q1', concept: 'flexconnect', type: 'compare', difficulty: 'medium',
      question: 'FlexConnect local switching allows an AP to:',
      choices: ['Switch client traffic locally without tunneling all data to the WLC', 'Replace the WLC entirely for control traffic', 'Disable CAPWAP permanently', 'Run OSPF on the AP radio'],
      correctIndex: 0,
      explanation: 'FlexConnect = local data switching at branch APs; control still uses CAPWAP to WLC — reduces WAN hairpinning.',
      ckuIds: ['CKU-WLC'],
    }],
  },
  '4.4': {
    questions: [{
      id: '4.4-w9-q1', concept: 'snmp', type: 'definition', difficulty: 'easy',
      question: 'SNMP is primarily used for:',
      choices: ['Network monitoring and management polling', 'Encrypting user login sessions', 'Assigning IP addresses', 'Spanning-tree root election'],
      correctIndex: 0,
      explanation: 'SNMP polls/traps device stats (CPU, interfaces, errors) — SSH secures management; DHCP assigns IPs.',
      ckuIds: ['CKU-MANAGEMENT'],
    }],
  },
  '3.1': {
    questions: [{
      id: '3.1-w9-q1', concept: 'ad comparison', type: 'scenario', difficulty: 'medium',
      question: 'A router has an OSPF route (AD 110) and EIGRP route (AD 90) to the same prefix. Which is installed?',
      choices: ['EIGRP — lower AD wins', 'OSPF — higher metric is better', 'Both — load balancing only', 'Neither — admin must choose'],
      correctIndex: 0,
      explanation: 'When multiple sources offer the same prefix, lowest AD wins — EIGRP 90 beats OSPF 110. Metric compares paths within one protocol.',
      ckuIds: ['CKU-ROUTING-TABLE'],
    }],
  },
  '3.2': {
    questions: [{
      id: '3.2-w9-q1', concept: 'longest prefix', type: 'scenario', difficulty: 'medium',
      question: 'Routes exist: 10.0.0.0/8 via A and 10.1.0.0/16 via B. Packet to 10.1.5.20 uses:',
      choices: ['Via B — /16 is longest match', 'Via A — /8 is shorter', 'Load-balanced across both', 'Dropped — ambiguous'],
      correctIndex: 0,
      explanation: 'Longest prefix match: 10.1.5.20 fits 10.1.0.0/16 more specifically than 10.0.0.0/8.',
      ckuIds: ['CKU-FORWARDING'],
    }],
  },
  '3.4': {
    questions: [{
      id: '3.4-w9-q1', concept: 'dr election', type: 'scenario', difficulty: 'medium',
      question: 'On a multi-access OSPF segment, which router becomes DR?',
      choices: ['Highest OSPF interface priority (tie-break: highest RID)', 'Lowest IP address on the segment', 'First router to boot', 'ABR with most areas'],
      correctIndex: 0,
      explanation: 'DR/BDR election: highest priority wins (default 1); tie-breaker is highest router ID. Set priority 0 to never be DR.',
      ckuIds: ['CKU-OSPF'],
    }],
  },
  '4.1': {
    questions: [{
      id: '4.1-w9-q1', concept: 'nat terms', type: 'definition', difficulty: 'easy',
      question: 'In NAT terminology, the "inside local" address is:',
      choices: ['The private IP as seen on the inside network', 'The public IP on the Internet', 'The router loopback', 'The DHCP server address'],
      correctIndex: 0,
      explanation: 'Inside local = actual private IP on LAN | Inside global = public representation | Outside = remote side addresses.',
      ckuIds: ['CKU-NAT'],
    }],
  },
  '4.9': {
    questions: [{
      id: '4.9-w9-q1', concept: 'syslog severity', type: 'definition', difficulty: 'medium',
      question: 'Which syslog severity level means "immediate action needed"?',
      choices: ['1 (Alert)', '5 (Notice)', '6 (Informational)', '7 (Debug)'],
      correctIndex: 0,
      explanation: 'Severity 0=emergency, 1=alert, 2=critical, 3=error, 4=warning, 5=notice, 6=info, 7=debug — lower = more urgent.',
      ckuIds: ['CKU-SYSLOG'],
    }],
  },
  '5.3': {
    questions: [{
      id: '5.3-w9-q1', concept: 'port security sticky', type: 'application', difficulty: 'medium',
      question: 'Sticky MAC learning on port security:',
      choices: ['Dynamically learns and saves MACs to running-config', 'Requires static MAC entries only', 'Disables BPDU Guard', 'Opens all VLANs on the port'],
      correctIndex: 0,
      explanation: 'Sticky learns the first MAC(s) seen and can persist them — combine with violation shutdown for access port hardening.',
      ckuIds: ['CKU-PORT-SECURITY'],
    }],
  },
  '5.5': {
    questions: [{
      id: '5.5-w9-q1', concept: 'extended acl', type: 'application', difficulty: 'medium',
      question: 'Which ACL type can filter by source AND destination IP plus port numbers?',
      choices: ['Extended numbered or named ACL', 'Standard numbered ACL only', 'MAC ACL on Layer 2 only', 'VLAN map without routing'],
      correctIndex: 0,
      explanation: 'Extended ACLs match src/dst IP, protocol, and ports — standard ACLs match source IP only.',
      ckuIds: ['CKU-ACL'],
    }],
  },
  '5.6': {
    questions: [{
      id: '5.6-w9-q1', concept: 'radius vs tacacs', type: 'compare', difficulty: 'medium',
      question: 'RADIUS is commonly used for WLAN 802.1X because it:',
      choices: ['Is an open IETF standard supported by many vendors', 'Encrypts the entire AAA packet like TACACS+', 'Only works on Cisco devices', 'Replaces the need for certificates'],
      correctIndex: 0,
      explanation: 'RADIUS = open standard, widely used for network access (Wi-Fi, VPN). TACACS+ = Cisco, full packet encryption, common for device admin AAA.',
      ckuIds: ['CKU-AAA'],
    }],
  },
  '5.8': {
    questions: [{
      id: '5.8-w9-q1', concept: 'wpa2 enterprise', type: 'compare', difficulty: 'medium',
      question: 'WPA2-Enterprise differs from WPA2-Personal by using:',
      choices: ['Per-user 802.1X authentication via RADIUS', 'A single shared PSK for all users', 'Open authentication only', 'WEP keys'],
      correctIndex: 0,
      explanation: 'Enterprise = 802.1X + unique credentials per user. Personal = one PSK shared by everyone on the SSID.',
      ckuIds: ['CKU-WLAN-SECURITY'],
    }],
  },
  '5.9': {
    questions: [{
      id: '5.9-w9-q1', concept: 'rogue ap', type: 'troubleshooting', difficulty: 'medium',
      question: 'Users connect to an unauthorized AP broadcasting the corporate SSID. This is called a:',
      choices: ['Rogue AP (evil twin risk)', 'FlexConnect AP', 'Mesh root AP', 'Lightweight AP in local mode'],
      correctIndex: 0,
      explanation: 'Rogue/evil-twin APs mimic legitimate SSIDs — WLC rogue detection and 802.1X mitigate unauthorized associations.',
      ckuIds: ['CKU-WLAN-SECURITY'],
    }],
  },
  '5.10': {
    questions: [{
      id: '5.10-w9-q1', concept: 'ipsec phases', type: 'definition', difficulty: 'medium',
      question: 'IKE Phase 1 in IPsec establishes:',
      choices: ['A secure channel to negotiate Phase 2 parameters', 'Direct user file transfers', 'OSPF adjacency over the tunnel', 'DHCP relay across sites'],
      correctIndex: 0,
      explanation: 'IKE Phase 1 = ISAKMP SA (authenticate peers, agree keys). Phase 2 = IPsec SAs for actual data encryption.',
      ckuIds: ['CKU-VPN'],
    }],
  },
  '5.11': {
    questions: [{
      id: '5.11-w9-q1', concept: 'least privilege', type: 'definition', difficulty: 'easy',
      question: 'The principle of least privilege means users receive:',
      choices: ['Only the minimum access needed for their role', 'Full admin rights for convenience', 'Identical access to all VLANs', 'No authentication on internal networks'],
      correctIndex: 0,
      explanation: 'Least privilege limits blast radius — pair with role-based access, segmentation, and AAA for zero-trust alignment.',
      ckuIds: ['CKU-SECURITY-PROGRAM'],
    }],
  },
  '6.1': {
    questions: [{
      id: '6.1-w9-q1', concept: 'ansible inventory', type: 'definition', difficulty: 'easy',
      question: 'In Ansible, the inventory file defines:',
      choices: ['Target hosts and groups playbooks run against', 'IOS feature licenses', 'STP root priorities', 'WLAN SSID names'],
      correctIndex: 0,
      explanation: 'Inventory lists devices (by IP/hostname) in groups — playbooks reference groups to push config agentlessly over SSH.',
      ckuIds: ['CKU-AUTOMATION'],
    }],
  },
  '6.2': {
    questions: [{
      id: '6.2-w9-q1', concept: 'control plane', type: 'definition', difficulty: 'medium',
      question: 'The SDN control plane is responsible for:',
      choices: ['Building routing/forwarding decisions and programming devices', 'Physically forwarding frames at wire speed only', 'Terminating Wi-Fi client associations', 'Printing shipping labels'],
      correctIndex: 0,
      explanation: 'Control plane = routing protocols, topology, policy decisions. Data plane = actual packet forwarding using installed tables.',
      ckuIds: ['CKU-SDN'],
    }],
  },
  '6.3': {
    questions: [{
      id: '6.3-w9-q1', concept: 'northbound api', type: 'definition', difficulty: 'medium',
      question: 'A northbound API on an SDN controller is used by:',
      choices: ['Applications and orchestration tools above the controller', 'Switch ASICs only', 'End-user web browsers on guest VLAN', 'DHCP clients'],
      correctIndex: 0,
      explanation: 'Northbound = apps → controller (REST). Southbound = controller → devices (OpenFlow, NETCONF, etc.).',
      ckuIds: ['CKU-SDN'],
    }],
  },
  '6.4': {
    questions: [{
      id: '6.4-w9-q1', concept: 'assurance', type: 'definition', difficulty: 'easy',
      question: 'DNA Center Assurance primarily provides:',
      choices: ['Health scores and proactive issue detection from telemetry', 'Replacement of all CLI configuration', 'Free public Wi-Fi for guests', 'Automatic CCNA certification'],
      correctIndex: 0,
      explanation: 'Assurance collects device/client telemetry for troubleshooting and trend analysis — complements design and provisioning workflows.',
      ckuIds: ['CKU-DNA'],
    }],
  },
}
