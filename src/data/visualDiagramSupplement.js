/** Rich static diagrams for Visual tab — top high-weight objectives. */
const SRC = [{ sourceName: 'Cisco CCNA 200-301 v1.1 Exam Topics', confidence: 1 }]

function topo(id, title, nodes, links, annotations = []) {
  return { id, title, type: 'topology', nodes, links, annotations, sourceRefs: SRC }
}

export const VISUAL_DIAGRAMS = {
  '1.6': topo('DIAG-1.6-subnet', 'IPv4 Subnetting (/24 split)', [
    { id: 'net', label: '192.168.1.0/24', type: 'subnet', x: 50, y: 20 },
    { id: 's1', label: '/26 net .0', type: 'subnet', x: 20, y: 55 },
    { id: 's2', label: '/26 net .64', type: 'subnet', x: 50, y: 55 },
    { id: 's3', label: '/26 net .128', type: 'subnet', x: 80, y: 55 },
  ], [
    { id: 'l1', source: 'net', target: 's1', label: 'borrow 2 bits' },
    { id: 'l2', source: 'net', target: 's2', label: '' },
    { id: 'l3', source: 'net', target: 's3', label: '' },
  ], ['Block size = 256 − mask octet', '4 subnets × 62 hosts each from /24']),

  '2.1': topo('DIAG-2.1-vlan', 'VLAN broadcast domains', [
    { id: 'sw', label: 'Switch', shortLabel: 'SW', type: 'switch', x: 50, y: 40 },
    { id: 'v10', label: 'VLAN 10 Sales', type: 'subnet', x: 20, y: 75 },
    { id: 'v20', label: 'VLAN 20 Eng', type: 'subnet', x: 80, y: 75 },
  ], [
    { id: 'l1', source: 'sw', target: 'v10', label: 'access ports' },
    { id: 'l2', source: 'sw', target: 'v20', label: 'access ports' },
  ], ['Same VLAN = same broadcast domain', 'Inter-VLAN routing needs L3']),

  '2.5': topo('DIAG-2.5-stp', 'STP loop prevention', [
    { id: 'root', label: 'Root Bridge', shortLabel: 'Root', type: 'switch', x: 50, y: 15, status: 'highlighted' },
    { id: 'sw1', label: 'SW1', shortLabel: 'SW1', type: 'switch', x: 25, y: 55 },
    { id: 'sw2', label: 'SW2', shortLabel: 'SW2', type: 'switch', x: 75, y: 55 },
  ], [
    { id: 'l1', source: 'root', target: 'sw1', label: 'forwarding' },
    { id: 'l2', source: 'root', target: 'sw2', label: 'forwarding' },
    { id: 'l3', source: 'sw1', target: 'sw2', label: 'blocked', status: 'blocked', priority: true },
  ], ['One redundant link blocked to prevent loop']),

  '3.1': topo('DIAG-3.1-route-line', 'Routing table entry', [
    { id: 'code', label: 'O', type: 'highlight', x: 10, y: 50 },
    { id: 'pfx', label: '10.0.0.0/8', type: 'process', x: 35, y: 50 },
    { id: 'adm', label: '[110/20]', type: 'highlight', x: 60, y: 50 },
    { id: 'nh', label: 'via 10.1.1.1', type: 'process', x: 85, y: 50 },
  ], [
    { id: 'l1', source: 'code', target: 'pfx', label: '' },
    { id: 'l2', source: 'pfx', target: 'adm', label: '' },
    { id: 'l3', source: 'adm', target: 'nh', label: '' },
  ]),

  '3.4': topo('DIAG-3.4-ospf', 'OSPF single area 0', [
    { id: 'r1', label: 'R1', type: 'router', x: 20, y: 50 },
    { id: 'r2', label: 'R2 (DR)', type: 'router', x: 50, y: 30, status: 'highlighted' },
    { id: 'r3', label: 'R3', type: 'router', x: 80, y: 50 },
  ], [
    { id: 'l1', source: 'r1', target: 'r2', label: 'area 0' },
    { id: 'l2', source: 'r2', target: 'r3', label: 'area 0' },
  ], ['All routers in area 0 share LSDB']),

  '4.1': topo('DIAG-4.1-nat', 'NAT/PAT topology', [
    { id: 'pc', label: 'Inside local 192.168.1.10', type: 'pc', x: 15, y: 50 },
    { id: 'r', label: 'Router NAT', type: 'router', x: 50, y: 50, status: 'highlighted' },
    { id: 'web', label: 'Outside 198.51.100.1', type: 'server', x: 85, y: 50 },
  ], [
    { id: 'l1', source: 'pc', target: 'r', label: 'inside' },
    { id: 'l2', source: 'r', target: 'web', label: 'outside PAT' },
  ]),

  '5.5': topo('DIAG-5.5-acl', 'ACL placement', [
    { id: 'src', label: 'Source net', type: 'pc', x: 15, y: 50 },
    { id: 'r', label: 'Router ACL', type: 'router', x: 50, y: 50 },
    { id: 'dst', label: 'Destination', type: 'server', x: 85, y: 50 },
  ], [
    { id: 'l1', source: 'src', target: 'r', label: 'ext ACL @ source', priority: true },
    { id: 'l2', source: 'r', target: 'dst', label: 'filter' },
  ], ['Extended ACL: place close to source']),

  '3.3': topo('DIAG-3.3-static', 'Static default route', [
    { id: 'edge', label: 'Stub router', type: 'router', x: 30, y: 50 },
    { id: 'isp', label: 'ISP', type: 'router', x: 70, y: 50 },
  ], [
    { id: 'l1', source: 'edge', target: 'isp', label: '0.0.0.0/0 → next-hop' },
  ]),

  '2.4': topo('DIAG-2.4-po', 'EtherChannel Port-channel', [
    { id: 'sw1', label: 'SW1', shortLabel: 'SW1', type: 'switch', x: 25, y: 50 },
    { id: 'po', label: 'Po1 (LACP)', shortLabel: 'Po1', type: 'process', x: 50, y: 50, status: 'highlighted' },
    { id: 'sw2', label: 'SW2', shortLabel: 'SW2', type: 'switch', x: 75, y: 50 },
  ], [
    { id: 'l1', source: 'sw1', target: 'po', label: '2+ links' },
    { id: 'l2', source: 'po', target: 'sw2', label: '' },
  ]),

  '5.6': topo('DIAG-5.6-portsec', 'Port security on access port', [
    { id: 'host', label: 'PC MAC', type: 'pc', x: 20, y: 50 },
    { id: 'port', label: 'Gi0/1 access', shortLabel: 'Gi0/1', type: 'switch', x: 50, y: 50, status: 'highlighted' },
    { id: 'rogue', label: 'Rogue MAC', type: 'pc', x: 80, y: 50, status: 'dropped' },
  ], [
    { id: 'l1', source: 'host', target: 'port', label: 'sticky learned' },
    { id: 'l2', source: 'rogue', target: 'port', label: 'violation shutdown', status: 'dropped' },
  ]),

  '1.1': topo('DIAG-1.1-components', 'End-to-end network path', [
    { id: 'pc', label: 'End host', type: 'pc', x: 12, y: 50 },
    { id: 'sw', label: 'L2 Switch', shortLabel: 'SW', type: 'switch', x: 35, y: 50 },
    { id: 'r', label: 'L3 Router', type: 'router', x: 58, y: 50, status: 'highlighted' },
    { id: 'srv', label: 'Server', type: 'server', x: 85, y: 50 },
  ], [
    { id: 'l1', source: 'pc', target: 'sw', label: 'access' },
    { id: 'l2', source: 'sw', target: 'r', label: 'default gateway' },
    { id: 'l3', source: 'r', target: 'srv', label: 'routed' },
  ], ['Switches forward within LAN; routers forward between subnets']),

  '1.8': topo('DIAG-1.8-ipv6', 'IPv6 /64 prefix on a link', [
    { id: 'r', label: 'Router Gi0/0', type: 'router', x: 35, y: 50 },
    { id: 'lan', label: '2001:db8:1::/64', type: 'subnet', x: 65, y: 50, status: 'highlighted' },
  ], [
    { id: 'l1', source: 'r', target: 'lan', label: 'on-link /64' },
  ], ['Typical LAN uses /64; host uses SLAAC or DHCPv6']),

  '2.2': topo('DIAG-2.2-trunk', '802.1Q trunk tagging', [
    { id: 'sw1', label: 'SW1', type: 'router', x: 25, y: 50 },
    { id: 'trunk', label: 'Trunk (tagged)', shortLabel: 'Trunk', type: 'process', x: 50, y: 50, status: 'highlighted' },
    { id: 'sw2', label: 'SW2', type: 'router', x: 75, y: 50 },
  ], [
    { id: 'l1', source: 'sw1', target: 'trunk', label: 'VLAN 10,20 tags' },
    { id: 'l2', source: 'trunk', target: 'sw2', label: '' },
  ], ['Native VLAN untagged on trunk; match both ends']),

  '2.6': topo('DIAG-2.6-wireless', 'Centralized wireless', [
    { id: 'ap', label: 'Lightweight AP', shortLabel: 'AP', type: 'cloud', x: 20, y: 55 },
    { id: 'wlc', label: 'WLC', type: 'server', x: 50, y: 30, status: 'highlighted' },
    { id: 'sw', label: 'Switch', shortLabel: 'SW', type: 'switch', x: 50, y: 70 },
    { id: 'client', label: 'Wi-Fi client', type: 'pc', x: 80, y: 55 },
  ], [
    { id: 'l1', source: 'ap', target: 'sw', label: 'CAPWAP tunnel' },
    { id: 'l2', source: 'sw', target: 'wlc', label: 'management' },
    { id: 'l3', source: 'client', target: 'ap', label: 'SSID' },
  ]),

  '3.2': topo('DIAG-3.2-lpm', 'Longest prefix match', [
    { id: 'pkt', label: 'Dest 10.1.1.5', shortLabel: 'Pkt', type: 'process', x: 15, y: 50, status: 'highlighted' },
    { id: 'r24', label: '10.1.1.0/24', type: 'subnet', x: 45, y: 35, status: 'highlighted' },
    { id: 'r16', label: '10.1.0.0/16', type: 'subnet', x: 45, y: 65 },
    { id: 'fwd', label: 'Forward /24', type: 'process', x: 80, y: 50 },
  ], [
    { id: 'l1', source: 'pkt', target: 'r24', label: 'more specific wins' },
    { id: 'l2', source: 'r24', target: 'fwd', label: '' },
  ]),

  '3.5': topo('DIAG-3.5-fhrp', 'HSRP active/standby', [
    { id: 'r1', label: 'R1 Active', type: 'router', x: 30, y: 40, status: 'highlighted' },
    { id: 'r2', label: 'R2 Standby', type: 'router', x: 70, y: 40 },
    { id: 'vip', label: 'VIP .1', shortLabel: 'VIP', type: 'process', x: 50, y: 70, status: 'highlighted' },
  ], [
    { id: 'l1', source: 'r1', target: 'vip', label: 'responds ARP' },
    { id: 'l2', source: 'r2', target: 'vip', label: 'monitors', status: 'dropped' },
  ], ['Default gateway is virtual; preempt controls failback']),

  '4.3': topo('DIAG-4.3-dhcp', 'DHCP DORA flow', [
    { id: 'client', label: 'DHCP client', type: 'pc', x: 15, y: 50 },
    { id: 'server', label: 'DHCP server', type: 'server', x: 85, y: 50, status: 'highlighted' },
  ], [
    { id: 'l1', source: 'client', target: 'server', label: 'Discover → Offer → Request → ACK' },
  ]),

  '4.8': topo('DIAG-4.8-ssh', 'Secure management plane', [
    { id: 'admin', label: 'Admin PC', type: 'pc', x: 15, y: 50 },
    { id: 'r', label: 'Router VTY', type: 'router', x: 50, y: 50, status: 'highlighted' },
    { id: 'tel', label: 'Telnet (insecure)', type: 'pc', x: 85, y: 35, status: 'dropped' },
  ], [
    { id: 'l1', source: 'admin', target: 'r', label: 'SSH TCP 22' },
    { id: 'l2', source: 'tel', target: 'r', label: 'blocked', status: 'dropped' },
  ]),

  '5.1': topo('DIAG-5.1-security', 'Defense layers on a LAN', [
    { id: 'user', label: 'User VLAN', type: 'pc', x: 15, y: 50 },
    { id: 'fw', label: 'ACL / policy', shortLabel: 'ACL', type: 'firewall', x: 45, y: 50, status: 'highlighted' },
    { id: 'srv', label: 'Server zone', type: 'server', x: 75, y: 50 },
  ], [
    { id: 'l1', source: 'user', target: 'fw', label: 'filter' },
    { id: 'l2', source: 'fw', target: 'srv', label: 'permit deny' },
  ], ['Confidentiality, integrity, availability at each hop']),

  '5.9': topo('DIAG-5.9-wpa2', 'WPA2-PSK WLAN flow', [
    { id: 'client', label: 'Wi-Fi client', type: 'pc', x: 15, y: 55 },
    { id: 'ap', label: 'Lightweight AP', shortLabel: 'AP', type: 'cloud', x: 40, y: 55 },
    { id: 'wlc', label: 'WLC (WLAN + PSK)', type: 'server', x: 65, y: 35, status: 'highlighted' },
    { id: 'vlan', label: 'Employee VLAN', type: 'subnet', x: 85, y: 55 },
  ], [
    { id: 'l1', source: 'client', target: 'ap', label: 'SSID + PSK' },
    { id: 'l2', source: 'ap', target: 'wlc', label: '4-way handshake' },
    { id: 'l3', source: 'wlc', target: 'vlan', label: 'WLAN → VLAN map' },
  ], ['WPA2-AES + PSK; map SSID to VLAN for correct IP scope']),

  // —— Domain 6 Automation & Programmability (exam-grade visuals) ——
  '6.1': topo('DIAG-6.1-auto', 'Automation ops loop', [
    { id: 'intent', label: 'Intent / change', type: 'process', x: 15, y: 30 },
    { id: 'auto', label: 'Automation (API/script)', shortLabel: 'Auto', type: 'process', x: 45, y: 30, status: 'highlighted' },
    { id: 'dev', label: 'Devices', type: 'switch', x: 75, y: 30 },
    { id: 'verify', label: 'Verify / audit', type: 'server', x: 45, y: 70, status: 'highlighted' },
    { id: 'cli', label: 'One-off CLI', type: 'pc', x: 15, y: 70, status: 'dropped' },
  ], [
    { id: 'l1', source: 'intent', target: 'auto', label: 'encode once' },
    { id: 'l2', source: 'auto', target: 'dev', label: 'push / API' },
    { id: 'l3', source: 'dev', target: 'verify', label: 'state check' },
    { id: 'l4', source: 'verify', target: 'auto', label: 'remediate' },
    { id: 'l5', source: 'cli', target: 'dev', label: 'snowflake risk', status: 'dropped' },
  ], [
    'Automation = consistent, repeatable, auditable changes',
    'Trap: automation does not remove the need to verify',
  ]),

  '6.2': topo('DIAG-6.2-sdn', 'Traditional vs controller-based', [
    { id: 'eng', label: 'Engineer', type: 'pc', x: 12, y: 25 },
    { id: 'swA', label: 'SW-A CLI', shortLabel: 'SW-A', type: 'switch', x: 35, y: 25 },
    { id: 'swB', label: 'SW-B CLI', shortLabel: 'SW-B', type: 'switch', x: 58, y: 25 },
    { id: 'swC', label: 'SW-C CLI', shortLabel: 'SW-C', type: 'switch', x: 81, y: 25 },
    { id: 'ctrl', label: 'Controller', type: 'server', x: 50, y: 60, status: 'highlighted' },
    { id: 'fab1', label: 'SW1', shortLabel: 'SW1', type: 'switch', x: 28, y: 85 },
    { id: 'fab2', label: 'SW2', shortLabel: 'SW2', type: 'switch', x: 50, y: 85 },
    { id: 'fab3', label: 'SW3', shortLabel: 'SW3', type: 'switch', x: 72, y: 85 },
  ], [
    { id: 't1', source: 'eng', target: 'swA', label: 'per-box' },
    { id: 't2', source: 'eng', target: 'swB', label: 'per-box' },
    { id: 't3', source: 'eng', target: 'swC', label: 'per-box' },
    { id: 'c1', source: 'ctrl', target: 'fab1', label: 'policy' },
    { id: 'c2', source: 'ctrl', target: 'fab2', label: 'policy' },
    { id: 'c3', source: 'ctrl', target: 'fab3', label: 'policy' },
    { id: 'd1', source: 'fab1', target: 'fab2', label: 'data plane', status: 'forwarding' },
  ], [
    'Traditional: control plane on each device; controller-based: centralized policy',
    'Trap: data plane still forwards on the devices — SDN does not remove forwarding',
  ]),

  '6.3': topo('DIAG-6.3-sdn-api', 'SDN architecture planes', [
    { id: 'app', label: 'Apps / orchestration', shortLabel: 'Apps', type: 'pc', x: 50, y: 12 },
    { id: 'nbi', label: 'Northbound API (REST)', shortLabel: 'NBI', type: 'process', x: 50, y: 32, status: 'highlighted' },
    { id: 'ctrl', label: 'SDN Controller', type: 'server', x: 50, y: 52, status: 'highlighted' },
    { id: 'sbi', label: 'Southbound (NETCONF/OF)', shortLabel: 'SBI', type: 'process', x: 50, y: 72 },
    { id: 'dev', label: 'Network devices', type: 'router', x: 50, y: 90 },
  ], [
    { id: 'l1', source: 'app', target: 'nbi', label: 'intent' },
    { id: 'l2', source: 'nbi', target: 'ctrl', label: '' },
    { id: 'l3', source: 'ctrl', target: 'sbi', label: 'program' },
    { id: 'l4', source: 'sbi', target: 'dev', label: 'config / flows' },
  ], [
    'NBI = apps→controller; SBI = controller→devices',
    'Trap: confusing northbound with southbound on the exam',
  ]),

  '6.4': topo('DIAG-6.4-dna', 'Cisco DNA Center closed loop', [
    { id: 'design', label: 'Design', type: 'process', x: 18, y: 30 },
    { id: 'policy', label: 'Policy', type: 'process', x: 40, y: 18, status: 'highlighted' },
    { id: 'prov', label: 'Provision', type: 'process', x: 62, y: 18 },
    { id: 'assure', label: 'Assurance', type: 'server', x: 82, y: 35, status: 'highlighted' },
    { id: 'campus', label: 'Campus fabric', type: 'switch', x: 50, y: 70 },
    { id: 'nms', label: 'Legacy NMS/CLI', type: 'pc', x: 18, y: 70, status: 'dropped' },
  ], [
    { id: 'l1', source: 'design', target: 'policy', label: '' },
    { id: 'l2', source: 'policy', target: 'prov', label: 'intent' },
    { id: 'l3', source: 'prov', target: 'campus', label: 'push' },
    { id: 'l4', source: 'campus', target: 'assure', label: 'telemetry' },
    { id: 'l5', source: 'assure', target: 'policy', label: 'remediate' },
    { id: 'l6', source: 'nms', target: 'campus', label: 'poll / hop', status: 'dropped' },
  ], [
    'DNA Center: design → policy → provision → assurance (closed loop)',
    'Trap: DNA Center is not “just another SNMP NMS” — it drives intent + assurance',
  ]),

  '6.5': topo('DIAG-6.5-rest', 'REST API request anatomy', [
    { id: 'client', label: 'API client', type: 'pc', x: 12, y: 50 },
    { id: 'method', label: 'GET/POST…', shortLabel: 'Verb', type: 'highlight', x: 32, y: 35, status: 'highlighted' },
    { id: 'uri', label: '/api/v1/…', shortLabel: 'URI', type: 'process', x: 52, y: 35 },
    { id: 'hdr', label: 'Headers + auth', shortLabel: 'Hdr', type: 'process', x: 42, y: 65 },
    { id: 'body', label: 'JSON body', shortLabel: 'Body', type: 'process', x: 62, y: 65 },
    { id: 'api', label: 'REST API', type: 'server', x: 85, y: 50, status: 'highlighted' },
  ], [
    { id: 'l1', source: 'client', target: 'method', label: '' },
    { id: 'l2', source: 'method', target: 'uri', label: 'resource' },
    { id: 'l3', source: 'client', target: 'hdr', label: '' },
    { id: 'l4', source: 'uri', target: 'api', label: 'HTTPS' },
    { id: 'l5', source: 'body', target: 'api', label: 'POST/PUT' },
    { id: 'l6', source: 'api', target: 'client', label: '2xx / 4xx', status: 'forwarding' },
  ], [
    'REST: client–server, stateless, resource URI, HTTP verbs, JSON common',
    'Trap: GET should not change state; POST creates; PUT/PATCH update',
  ]),

  '6.6': topo('DIAG-6.6-json-cm', 'JSON + config management path', [
    { id: 'json', label: '{ "vlan": 10 }', shortLabel: 'JSON', type: 'process', x: 18, y: 35, status: 'highlighted' },
    { id: 'tool', label: 'Ansible / Puppet / Chef', shortLabel: 'CM', type: 'server', x: 50, y: 35, status: 'highlighted' },
    { id: 'inv', label: 'Inventory', type: 'process', x: 50, y: 65 },
    { id: 'dev', label: 'Network devices', type: 'router', x: 82, y: 50 },
  ], [
    { id: 'l1', source: 'json', target: 'tool', label: 'data model' },
    { id: 'l2', source: 'inv', target: 'tool', label: 'targets' },
    { id: 'l3', source: 'tool', target: 'dev', label: 'push / agent' },
  ], [
    'JSON = objects/arrays/types for APIs and templates',
    'Trap: Ansible is typically agentless (SSH/API); Puppet/Chef often agent-based',
  ]),
}

const SRC_FLOW = SRC

/** Side-by-side / stack compare panels for Visual + Study (Domain 6+). */
export const VISUAL_COMPARE = {
  '6.1': {
    type: 'comparison',
    title: 'Manual CLI vs automation',
    left: {
      label: 'Manual CLI',
      points: [
        'Per-device typing — slow at scale',
        'Easy to create snowflake configs',
        'Hard to audit “what changed”',
        'Human error on every box',
      ],
    },
    right: {
      label: 'Automation',
      points: [
        'Encode once → apply many',
        'Consistent templates / IaC',
        'Versioned + reviewable changes',
        'Still must verify after push',
      ],
    },
  },
  '6.2': {
    type: 'comparison',
    title: 'Traditional vs controller-based',
    left: {
      label: 'Traditional',
      points: [
        'Control plane on each device',
        'Engineer configures box-by-box',
        'Policy drift across campus',
        'Troubleshooting is per-hop CLI',
      ],
    },
    right: {
      label: 'Controller-based',
      points: [
        'Centralized policy / control',
        'Devices still forward (data plane)',
        'Southbound programs the fabric',
        'Ops focus shifts to intent + health',
      ],
    },
  },
  '6.3': {
    type: 'layer_stack',
    title: 'SDN stack (top → bottom)',
    layers: [
      { label: 'Applications / orchestration', note: 'Intent, workflows, dashboards' },
      { label: 'Northbound API', note: 'Usually REST — apps talk to controller' },
      { label: 'SDN controller', note: 'Central brain — policy & topology view' },
      { label: 'Southbound API', note: 'NETCONF, OpenFlow, device APIs' },
      { label: 'Network devices (data plane)', note: 'Still forward frames/packets' },
    ],
  },
  '6.4': {
    type: 'comparison',
    title: 'Traditional campus mgmt vs DNA Center',
    left: {
      label: 'Traditional campus',
      points: [
        'CLI + classic NMS polling',
        'Manual templates / scripts',
        'Reactive break/fix',
        'Limited end-to-end assurance',
      ],
    },
    right: {
      label: 'Cisco DNA Center',
      points: [
        'Design / Policy / Provision / Assurance',
        'Intent-based campus workflows',
        'Telemetry-driven closed loop',
        'Fabric + client health visibility',
      ],
    },
  },
  '6.5': {
    type: 'comparison',
    title: 'HTTP verbs ↔ CRUD (REST)',
    left: {
      label: 'HTTP method',
      points: ['GET — read', 'POST — create', 'PUT/PATCH — update', 'DELETE — remove'],
    },
    right: {
      label: 'Exam traps',
      points: [
        'Stateless: each request carries what it needs',
        'URI identifies the resource',
        'JSON body common on write',
        'Status codes: 2xx ok, 4xx client, 5xx server',
      ],
    },
  },
  '6.6': {
    type: 'comparison',
    title: 'Config tools at a glance',
    left: {
      label: 'Ansible',
      points: [
        'Usually agentless (SSH/API)',
        'Playbooks + inventory',
        'Push model from control node',
        'YAML playbooks; JSON/YAML data',
      ],
    },
    right: {
      label: 'Puppet / Chef',
      points: [
        'Often agent on the node',
        'Desired-state / pull common',
        'Strong for servers; also used in netops',
        'Still consume structured data (JSON/YAML)',
      ],
    },
  },
}

/** Short exam-trap callouts shown under the diagram. */
export const VISUAL_TRAP_CALLOUTS = {
  '6.1': [
    'Automation without verify still ships bad config — faster.',
    '“Set and forget” is not the goal; closed-loop check is.',
  ],
  '6.2': [
    'Controller-based ≠ no data plane on switches.',
    'Central policy does not mean every packet goes through the controller.',
  ],
  '6.3': [
    'Northbound = apps→controller; southbound = controller→devices.',
    'Overlay/underlay questions: underlay still needs IP reachability.',
  ],
  '6.4': [
    'DNA Center assurance is more than SNMP graphs — client/path health.',
    'Do not equate DNA Center with “only wireless” — campus fabric too.',
  ],
  '6.5': [
    'REST is not a Cisco CLI — it is an API style over HTTP.',
    'Idempotent GET should not mutate; watch POST vs PUT on the exam.',
  ],
  '6.6': [
    'JSON types: object {}, array [], string, number, boolean, null.',
    'Ansible agentless vs Puppet/Chef agent is a classic compare item.',
  ],
}

/** Stronger packet/process flows for Domain 6 (replace thin shell stubs). */
export const VISUAL_FLOWS = {
  '6.1': {
    id: 'FLOW-6.1-auto',
    title: 'Safe automated change',
    ckuIds: ['CKU-AUTOMATION'],
    steps: [
      { id: 's1', order: 1, title: 'Encode intent', action: 'Capture the change in a playbook/template — not a one-off CLI paste.', successState: 'ready' },
      { id: 's2', order: 2, title: 'Target inventory', action: 'Select the device group; dry-run or check mode when available.', successState: 'scoped' },
      { id: 's3', order: 3, title: 'Push / API apply', action: 'Automation applies the same change across targets.', successState: 'applied' },
      { id: 's4', order: 4, title: 'Verify', action: 'Show/run tests or assurance checks — do not assume success.', successState: 'verified' },
    ],
    sourceRefs: SRC_FLOW,
  },
  '6.2': {
    id: 'FLOW-6.2-ctrl',
    title: 'Controller programs the fabric',
    ckuIds: ['CKU-SDN-TRAD'],
    steps: [
      { id: 's1', order: 1, title: 'Policy at controller', action: 'Operator defines intent once at the controller.', successState: 'policy' },
      { id: 's2', order: 2, title: 'Southbound push', action: 'Controller programs devices via SBI.', successState: 'programmed' },
      { id: 's3', order: 3, title: 'Data plane forwards', action: 'Switches/routers still forward user traffic locally.', successState: 'forwarding' },
    ],
    sourceRefs: SRC_FLOW,
  },
  '6.3': {
    id: 'FLOW-6.3-planes',
    title: 'Request through SDN planes',
    ckuIds: ['CKU-SDN-ARCH'],
    steps: [
      { id: 's1', order: 1, title: 'App calls NBI', action: 'Orchestration sends REST intent to the controller.', successState: 'nbi' },
      { id: 's2', order: 2, title: 'Controller decides', action: 'Controller translates intent to device actions.', successState: 'decide' },
      { id: 's3', order: 3, title: 'SBI to devices', action: 'NETCONF/OpenFlow/API updates device state.', successState: 'sbi' },
    ],
    sourceRefs: SRC_FLOW,
  },
  '6.4': {
    id: 'FLOW-6.4-dna',
    title: 'DNA Center closed loop',
    ckuIds: ['CKU-DNA'],
    steps: [
      { id: 's1', order: 1, title: 'Design & policy', action: 'Model site, SSID, and access policy in DNA Center.', successState: 'designed' },
      { id: 's2', order: 2, title: 'Provision', action: 'Push config/image/fabric settings to campus devices.', successState: 'provisioned' },
      { id: 's3', order: 3, title: 'Assurance', action: 'Telemetry shows client/path health; remediate from insights.', successState: 'assured' },
    ],
    sourceRefs: SRC_FLOW,
  },
  '6.5': {
    id: 'FLOW-6.5-rest',
    title: 'One REST call',
    ckuIds: ['CKU-REST'],
    steps: [
      { id: 's1', order: 1, title: 'Build request', action: 'Choose method + URI; add auth headers; optional JSON body.', successState: 'built' },
      { id: 's2', order: 2, title: 'Send over HTTPS', action: 'Stateless call — server does not rely on prior session state.', successState: 'sent' },
      { id: 's3', order: 3, title: 'Read status + body', action: 'Interpret 2xx/4xx/5xx and parse JSON response.', successState: 'done' },
    ],
    sourceRefs: SRC_FLOW,
  },
  '6.6': {
    id: 'FLOW-6.6-cm',
    title: 'From JSON to device config',
    ckuIds: ['CKU-JSON-ANSIBLE'],
    steps: [
      { id: 's1', order: 1, title: 'Structured data', action: 'JSON/YAML holds VLAN, IP, and interface facts.', successState: 'data' },
      { id: 's2', order: 2, title: 'CM tool renders', action: 'Ansible/Puppet/Chef maps data → desired config.', successState: 'rendered' },
      { id: 's3', order: 3, title: 'Apply to inventory', action: 'Push (Ansible) or agent pull (Puppet/Chef) to devices.', successState: 'applied' },
    ],
    sourceRefs: SRC_FLOW,
  },
}

/** Domain 6 objective ids that must ship a full visual pack. */
export const DOMAIN6_VISUAL_OBJECTIVES = ['6.1', '6.2', '6.3', '6.4', '6.5', '6.6']

export function getDomain6VisualCoverage() {
  const missing = []
  for (const id of DOMAIN6_VISUAL_OBJECTIVES) {
    const gaps = []
    if (!VISUAL_DIAGRAMS[id]?.nodes?.length) gaps.push('diagram')
    if (!VISUAL_COMPARE[id]) gaps.push('compare')
    if (!VISUAL_TRAP_CALLOUTS[id]?.length) gaps.push('traps')
    if (!VISUAL_FLOWS[id]?.steps?.length) gaps.push('flow')
    if (gaps.length) missing.push({ id, gaps })
  }
  return {
    ok: missing.length === 0,
    total: DOMAIN6_VISUAL_OBJECTIVES.length,
    covered: DOMAIN6_VISUAL_OBJECTIVES.length - missing.length,
    missing,
  }
}
