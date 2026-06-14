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
    { id: 'sw', label: 'Switch', type: 'router', x: 50, y: 40 },
    { id: 'v10', label: 'VLAN 10 Sales', type: 'subnet', x: 20, y: 75 },
    { id: 'v20', label: 'VLAN 20 Eng', type: 'subnet', x: 80, y: 75 },
  ], [
    { id: 'l1', source: 'sw', target: 'v10', label: 'access ports' },
    { id: 'l2', source: 'sw', target: 'v20', label: 'access ports' },
  ], ['Same VLAN = same broadcast domain', 'Inter-VLAN routing needs L3']),

  '2.5': topo('DIAG-2.5-stp', 'STP loop prevention', [
    { id: 'root', label: 'Root Bridge', type: 'highlight', x: 50, y: 15 },
    { id: 'sw1', label: 'SW1', type: 'router', x: 25, y: 55 },
    { id: 'sw2', label: 'SW2', type: 'router', x: 75, y: 55 },
  ], [
    { id: 'l1', source: 'root', target: 'sw1', label: 'forwarding' },
    { id: 'l2', source: 'root', target: 'sw2', label: 'forwarding' },
    { id: 'l3', source: 'sw1', target: 'sw2', label: 'blocked', status: 'dropped' },
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
    { id: 'l1', source: 'src', target: 'r', label: 'extended ACL near source' },
    { id: 'l2', source: 'r', target: 'dst', label: 'filter' },
  ], ['Extended ACL: place close to source']),

  '3.3': topo('DIAG-3.3-static', 'Static default route', [
    { id: 'edge', label: 'Stub router', type: 'router', x: 30, y: 50 },
    { id: 'isp', label: 'ISP', type: 'router', x: 70, y: 50 },
  ], [
    { id: 'l1', source: 'edge', target: 'isp', label: '0.0.0.0/0 → next-hop' },
  ]),

  '2.4': topo('DIAG-2.4-po', 'EtherChannel Port-channel', [
    { id: 'sw1', label: 'SW1', type: 'router', x: 25, y: 50 },
    { id: 'po', label: 'Po1 (LACP)', type: 'highlight', x: 50, y: 50 },
    { id: 'sw2', label: 'SW2', type: 'router', x: 75, y: 50 },
  ], [
    { id: 'l1', source: 'sw1', target: 'po', label: '2+ links' },
    { id: 'l2', source: 'po', target: 'sw2', label: '' },
  ]),

  '5.6': topo('DIAG-5.6-portsec', 'Port security on access port', [
    { id: 'host', label: 'PC MAC', type: 'pc', x: 20, y: 50 },
    { id: 'port', label: 'Gi0/1 access', type: 'router', x: 50, y: 50, status: 'highlighted' },
    { id: 'rogue', label: 'Rogue MAC', type: 'pc', x: 80, y: 50, status: 'dropped' },
  ], [
    { id: 'l1', source: 'host', target: 'port', label: 'sticky learned' },
    { id: 'l2', source: 'rogue', target: 'port', label: 'violation shutdown', status: 'dropped' },
  ]),

  '1.1': topo('DIAG-1.1-components', 'End-to-end network path', [
    { id: 'pc', label: 'End host', type: 'pc', x: 12, y: 50 },
    { id: 'sw', label: 'L2 Switch', type: 'router', x: 35, y: 50 },
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
    { id: 'trunk', label: 'Trunk (tagged)', type: 'highlight', x: 50, y: 50 },
    { id: 'sw2', label: 'SW2', type: 'router', x: 75, y: 50 },
  ], [
    { id: 'l1', source: 'sw1', target: 'trunk', label: 'VLAN 10,20 tags' },
    { id: 'l2', source: 'trunk', target: 'sw2', label: '' },
  ], ['Native VLAN untagged on trunk; match both ends']),

  '2.6': topo('DIAG-2.6-wireless', 'Centralized wireless', [
    { id: 'ap', label: 'Lightweight AP', type: 'router', x: 20, y: 55 },
    { id: 'wlc', label: 'WLC', type: 'server', x: 50, y: 30, status: 'highlighted' },
    { id: 'sw', label: 'Switch', type: 'router', x: 50, y: 70 },
    { id: 'client', label: 'Wi-Fi client', type: 'pc', x: 80, y: 55 },
  ], [
    { id: 'l1', source: 'ap', target: 'sw', label: 'CAPWAP tunnel' },
    { id: 'l2', source: 'sw', target: 'wlc', label: 'management' },
    { id: 'l3', source: 'client', target: 'ap', label: 'SSID' },
  ]),

  '3.2': topo('DIAG-3.2-lpm', 'Longest prefix match', [
    { id: 'pkt', label: 'Dest 10.1.1.5', type: 'highlight', x: 15, y: 50 },
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
    { id: 'vip', label: 'VIP .1', type: 'highlight', x: 50, y: 70 },
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
    { id: 'fw', label: 'ACL / policy', type: 'router', x: 45, y: 50, status: 'highlighted' },
    { id: 'srv', label: 'Server zone', type: 'server', x: 75, y: 50 },
  ], [
    { id: 'l1', source: 'user', target: 'fw', label: 'filter' },
    { id: 'l2', source: 'fw', target: 'srv', label: 'permit deny' },
  ], ['Confidentiality, integrity, availability at each hop']),

  '6.2': topo('DIAG-6.2-sdn', 'SDN control vs data plane', [
    { id: 'ctrl', label: 'SDN Controller', type: 'server', x: 50, y: 20, status: 'highlighted' },
    { id: 'sw1', label: 'Switch', type: 'router', x: 25, y: 65 },
    { id: 'sw2', label: 'Switch', type: 'router', x: 75, y: 65 },
  ], [
    { id: 'l1', source: 'ctrl', target: 'sw1', label: 'southbound API' },
    { id: 'l2', source: 'ctrl', target: 'sw2', label: 'southbound API' },
    { id: 'l3', source: 'sw1', target: 'sw2', label: 'data plane', status: 'forwarding' },
  ], ['Controller programs forwarding; switches forward traffic']),
}
