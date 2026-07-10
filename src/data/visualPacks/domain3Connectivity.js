import { topo, compare, stack, flow } from './packHelpers.js'

export const DIAGRAMS = {
  '3.1': topo('DIAG-3.1-route-line', 'Routing table entry', [
    { id: 'code', label: 'O', type: 'highlight', x: 12, y: 50, status: 'highlighted' },
    { id: 'pfx', label: '10.0.0.0/8', type: 'process', x: 35, y: 50 },
    { id: 'adm', label: '[110/20]', type: 'highlight', x: 60, y: 50 },
    { id: 'nh', label: 'via 10.1.1.1', type: 'process', x: 85, y: 50 },
  ], [
    { id: 'l1', source: 'code', target: 'pfx', label: 'source' },
    { id: 'l2', source: 'pfx', target: 'adm', label: 'AD/metric' },
    { id: 'l3', source: 'adm', target: 'nh', label: 'next-hop' },
  ], ['Code = protocol; [AD/metric]; via = next hop', 'Trap: AD compared across protocols; metric only within one']),

  '3.2': topo('DIAG-3.2-lpm', 'Longest prefix match', [
    { id: 'pkt', label: 'Dest 10.1.1.5', type: 'process', x: 12, y: 50, status: 'highlighted' },
    { id: 'r24', label: '10.1.1.0/24', type: 'subnet', x: 45, y: 30, status: 'highlighted' },
    { id: 'r16', label: '10.1.0.0/16', type: 'subnet', x: 45, y: 70 },
    { id: 'fwd', label: 'Use /24', type: 'router', x: 80, y: 50 },
  ], [
    { id: 'l1', source: 'pkt', target: 'r24', label: 'more specific' },
    { id: 'l2', source: 'r24', target: 'fwd', label: 'wins' },
    { id: 'l3', source: 'pkt', target: 'r16', label: 'also matches', status: 'dropped' },
  ], ['Longest match wins before AD/metric', 'Same prefix → AD; same AD → metric']),

  '3.3': topo('DIAG-3.3-static', 'Static & default routes', [
    { id: 'stub', label: 'Stub R1', type: 'router', x: 25, y: 50 },
    { id: 'isp', label: 'ISP / core', type: 'router', x: 70, y: 50, status: 'highlighted' },
    { id: 'def', label: '0.0.0.0/0', type: 'process', x: 50, y: 25 },
    { id: 'net', label: 'Remote net', type: 'subnet', x: 90, y: 50 },
  ], [
    { id: 'l1', source: 'stub', target: 'def', label: 'static default' },
    { id: 'l2', source: 'def', target: 'isp', label: 'next-hop' },
    { id: 'l3', source: 'isp', target: 'net', label: '' },
  ], ['Static = admin-defined; default = gateway of last resort', 'Trap: recursive lookup needs next-hop reachability']),

  '3.4': topo('DIAG-3.4-ospf', 'OSPFv2 single area 0', [
    { id: 'r1', label: 'R1', type: 'router', x: 20, y: 55 },
    { id: 'r2', label: 'R2 DR', type: 'router', x: 50, y: 30, status: 'highlighted' },
    { id: 'r3', label: 'R3', type: 'router', x: 80, y: 55 },
    { id: 'a0', label: 'Area 0', type: 'subnet', x: 50, y: 75 },
  ], [
    { id: 'l1', source: 'r1', target: 'r2', label: 'adj' },
    { id: 'l2', source: 'r2', target: 'r3', label: 'adj' },
    { id: 'l3', source: 'r1', target: 'a0', label: '' },
    { id: 'l4', source: 'r3', target: 'a0', label: '' },
  ], ['All routers in area 0 share LSDB', 'DR/BDR on multi-access; cost = reference/bandwidth']),

  '3.5': topo('DIAG-3.5-fhrp', 'HSRP active/standby', [
    { id: 'r1', label: 'Active', type: 'router', x: 30, y: 35, status: 'highlighted' },
    { id: 'r2', label: 'Standby', type: 'router', x: 70, y: 35 },
    { id: 'vip', label: 'Virtual IP', shortLabel: 'VIP', type: 'process', x: 50, y: 70, status: 'highlighted' },
    { id: 'pc', label: 'Hosts GW=VIP', type: 'pc', x: 50, y: 90 },
  ], [
    { id: 'l1', source: 'r1', target: 'vip', label: 'ARP reply' },
    { id: 'l2', source: 'r2', target: 'vip', label: 'monitor', status: 'dropped' },
    { id: 'l3', source: 'pc', target: 'vip', label: 'default GW' },
  ], ['Hosts use virtual IP/MAC; active forwards', 'Trap: preempt controls failback behavior']),

  '3.6': topo('DIAG-3.6-tshoot', 'Routing tshoot path', [
    { id: 'src', label: 'Source', type: 'pc', x: 12, y: 50 },
    { id: 'r1', label: 'R1', type: 'router', x: 35, y: 50 },
    { id: 'r2', label: 'R2', type: 'router', x: 60, y: 50, status: 'dropped' },
    { id: 'dst', label: 'Dest', type: 'server', x: 88, y: 50 },
  ], [
    { id: 'l1', source: 'src', target: 'r1', label: 'OK' },
    { id: 'l2', source: 'r1', target: 'r2', label: 'missing route?', status: 'dropped' },
    { id: 'l3', source: 'r2', target: 'dst', label: '' },
  ], ['Check L1/L2, then routing table, then ACL/policy', 'Trap: asymmetric return path looks like “one-way” ping']),
}

export const COMPARE = {
  '3.1': compare('Table fields', 'Prefix / mask', ['What matches', 'LPM first'], 'AD / metric / via', ['Trust vs cost', 'Where to send']),
  '3.2': stack('Forwarding order', [
    { label: '1. Longest prefix', note: 'Most specific match' },
    { label: '2. Administrative distance', note: 'Same prefix, different sources' },
    { label: '3. Metric', note: 'Same protocol only' },
  ]),
  '3.3': compare('Static types', 'Network static', ['Specific prefix', 'Predictable'], 'Default 0/0', ['Last resort', 'Stub edge common']),
  '3.4': compare('OSPF facts', 'Must know', ['Area 0 backbone', 'Router-ID', 'Cost'], 'Exam traps', ['Passive interface', 'Wildcard mask', 'Adjacent ≠ same cost']),
  '3.5': compare('HSRP roles', 'Active', ['Forwards', 'Answers ARP'], 'Standby', ['Ready backup', 'Takes over on fail']),
  '3.6': compare('Tshoot layers', 'Data plane', ['ping/traceroute', 'CEF/adjacency'], 'Control plane', ['Routes missing', 'Neighbor down']),
}

export const TRAPS = {
  '3.1': ['S* means candidate default — know codes.', 'Exit interface vs next-hop both appear on exams.'],
  '3.2': ['Never compare OSPF metric to EIGRP metric.', 'Equal-cost load balancing needs same prefix+AD+metric.'],
  '3.3': ['Floating static = higher AD backup.', 'IPv6 static uses different syntax but same ideas.'],
  '3.4': ['OSPF AD 110; directly connected 0; static 1.', 'Hello/dead timers must match for adjacency.'],
  '3.5': ['VIP is not the physical interface IP.', 'Priority + preempt decide who is active.'],
  '3.6': ['ACL on return path drops “successful” forward path.', 'Wrong VRF/table is an advanced trap — stick to RIB basics.'],
}

export const FLOWS = {
  '3.1': flow('FLOW-3.1-read', 'Read a route', ['CKU-RIB'], [['Find prefix', 'Does it match dest?'], ['Note AD/metric', 'Why installed?'], ['Next hop', 'Where forwarded?']]),
  '3.2': flow('FLOW-3.2-fwd', 'Pick best route', ['CKU-LPM'], [['Match candidates', 'All covering prefixes.'], ['Longest wins', 'If tie → AD.'], ['Then metric', 'Install & forward.']]),
  '3.3': flow('FLOW-3.3-static', 'Add static', ['CKU-STATIC'], [['Choose prefix', 'Or default.'], ['Set next-hop', 'Reachable.'], ['Verify RIB', 'ping remote.']]),
  '3.4': flow('FLOW-3.4-ospf', 'Bring up OSPF', ['CKU-OSPF'], [['Enable process', 'Router-ID.'], ['Network/interfaces', 'Area 0.'], ['Adj + routes', 'LSDB sync.']]),
  '3.5': flow('FLOW-3.5-hsrp', 'HSRP failover', ['CKU-HSRP'], [['Active owns VIP', 'Hosts ARP VIP.'], ['Active fails', 'Standby detects.'], ['New active', 'Traffic continues.']]),
  '3.6': flow('FLOW-3.6-ts', 'Isolate routing issue', ['CKU-TSHOOT'], [['Confirm L1/L2', 'Interfaces up.'], ['Check RIB', 'Expected route?'], ['Test path', 'ping/traceroute each hop.']]),
}
