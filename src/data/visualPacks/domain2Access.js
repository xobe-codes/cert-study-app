import { topo, compare, stack, flow } from './packHelpers.js'

export const DIAGRAMS = {
  '2.1': topo('DIAG-2.1-vlan', 'VLAN broadcast domains', [
    { id: 'sw', label: 'Switch', type: 'switch', x: 50, y: 35, status: 'highlighted' },
    { id: 'v10', label: 'VLAN 10', type: 'subnet', x: 20, y: 70 },
    { id: 'v20', label: 'VLAN 20', type: 'subnet', x: 80, y: 70 },
    { id: 'r', label: 'L3 / SVI', type: 'router', x: 50, y: 15 },
  ], [
    { id: 'l1', source: 'sw', target: 'v10', label: 'access' },
    { id: 'l2', source: 'sw', target: 'v20', label: 'access' },
    { id: 'l3', source: 'v10', target: 'r', label: 'inter-VLAN' },
    { id: 'l4', source: 'v20', target: 'r', label: '' },
  ], ['Same VLAN = same broadcast domain', 'Inter-VLAN needs L3 (router-on-a-stick or SVI)']),

  '2.2': topo('DIAG-2.2-trunk', '802.1Q trunk', [
    { id: 'sw1', label: 'SW1', type: 'switch', x: 20, y: 50 },
    { id: 'tr', label: 'Trunk tagged', shortLabel: 'Trunk', type: 'process', x: 50, y: 50, status: 'highlighted' },
    { id: 'sw2', label: 'SW2', type: 'switch', x: 80, y: 50 },
    { id: 'nat', label: 'Native VLAN', type: 'highlight', x: 50, y: 25 },
  ], [
    { id: 'l1', source: 'sw1', target: 'tr', label: 'VLAN 10,20' },
    { id: 'l2', source: 'tr', target: 'sw2', label: '' },
    { id: 'l3', source: 'nat', target: 'tr', label: 'untagged' },
  ], ['One link carries many VLANs with tags', 'Trap: native VLAN must match both ends']),

  '2.3': topo('DIAG-2.3-cdp-lldp', 'L2 discovery', [
    { id: 'sw', label: 'Switch', type: 'switch', x: 30, y: 50 },
    { id: 'r', label: 'Router', type: 'router', x: 70, y: 50 },
    { id: 'cdp', label: 'CDP', type: 'highlight', x: 50, y: 25, status: 'highlighted' },
    { id: 'lldp', label: 'LLDP', type: 'process', x: 50, y: 75 },
  ], [
    { id: 'l1', source: 'sw', target: 'cdp', label: 'Cisco' },
    { id: 'l2', source: 'cdp', target: 'r', label: 'neighbors' },
    { id: 'l3', source: 'sw', target: 'lldp', label: 'IEEE' },
    { id: 'l4', source: 'lldp', target: 'r', label: '' },
  ], ['CDP Cisco-proprietary; LLDP standards-based', 'Trap: discovery ≠ routing adjacency']),

  '2.4': topo('DIAG-2.4-po', 'EtherChannel (LACP)', [
    { id: 'sw1', label: 'SW1', type: 'switch', x: 20, y: 50 },
    { id: 'po', label: 'Po1 LACP', shortLabel: 'Po1', type: 'process', x: 50, y: 50, status: 'highlighted' },
    { id: 'sw2', label: 'SW2', type: 'switch', x: 80, y: 50 },
    { id: 'm', label: 'Member links', type: 'highlight', x: 50, y: 25 },
  ], [
    { id: 'l1', source: 'sw1', target: 'po', label: '2+ links' },
    { id: 'l2', source: 'po', target: 'sw2', label: 'one logical' },
    { id: 'l3', source: 'm', target: 'po', label: 'same speed/duplex' },
  ], ['Bundle links into one logical port-channel', 'Trap: mismatched config = suspend / not form']),

  '2.5': topo('DIAG-2.5-stp', 'STP loop prevention', [
    { id: 'root', label: 'Root', type: 'switch', x: 50, y: 15, status: 'highlighted' },
    { id: 'sw1', label: 'SW1', type: 'switch', x: 25, y: 55 },
    { id: 'sw2', label: 'SW2', type: 'switch', x: 75, y: 55 },
    { id: 'blk', label: 'Blocked', type: 'highlight', x: 50, y: 85 },
  ], [
    { id: 'l1', source: 'root', target: 'sw1', label: 'FWD' },
    { id: 'l2', source: 'root', target: 'sw2', label: 'FWD' },
    { id: 'l3', source: 'sw1', target: 'sw2', label: 'BLK', status: 'blocked', priority: true },
    { id: 'l4', source: 'blk', target: 'sw1', label: '' },
  ], ['One redundant path blocked to prevent loops', 'Root bridge elected by lowest bridge ID']),

  '2.6': topo('DIAG-2.6-wireless', 'Centralized vs autonomous AP', [
    { id: 'ap', label: 'Lightweight AP', shortLabel: 'AP', type: 'cloud', x: 25, y: 55 },
    { id: 'wlc', label: 'WLC', type: 'server', x: 55, y: 30, status: 'highlighted' },
    { id: 'sw', label: 'Switch', type: 'switch', x: 55, y: 70 },
    { id: 'auto', label: 'Autonomous AP', type: 'cloud', x: 85, y: 55, status: 'dropped' },
  ], [
    { id: 'l1', source: 'ap', target: 'sw', label: 'CAPWAP' },
    { id: 'l2', source: 'sw', target: 'wlc', label: 'control' },
    { id: 'l3', source: 'auto', target: 'sw', label: 'local config', status: 'dropped' },
  ], ['Lightweight AP + WLC = centralized; autonomous is local', 'Trap: CAPWAP tunnels control/data to WLC path']),

  '2.7': topo('DIAG-2.7-wlan-phys', 'WLAN physical connections', [
    { id: 'ap', label: 'AP', type: 'cloud', x: 20, y: 40 },
    { id: 'poe', label: 'PoE switch', type: 'switch', x: 50, y: 40, status: 'highlighted' },
    { id: 'wlc', label: 'WLC', type: 'server', x: 80, y: 40 },
    { id: 'pwr', label: 'Power / data', type: 'process', x: 50, y: 70 },
  ], [
    { id: 'l1', source: 'ap', target: 'poe', label: 'Ethernet+PoE' },
    { id: 'l2', source: 'poe', target: 'wlc', label: 'campus' },
    { id: 'l3', source: 'pwr', target: 'poe', label: '' },
  ], ['AP usually powered by PoE from access switch', 'Trap: insufficient PoE budget = AP won’t boot']),

  '2.8': topo('DIAG-2.8-wlan-client', 'WLAN client path', [
    { id: 'cli', label: 'Client', type: 'pc', x: 12, y: 50 },
    { id: 'ap', label: 'AP', type: 'cloud', x: 35, y: 50 },
    { id: 'wlc', label: 'WLC', type: 'server', x: 58, y: 30, status: 'highlighted' },
    { id: 'vlan', label: 'User VLAN', type: 'subnet', x: 80, y: 50 },
  ], [
    { id: 'l1', source: 'cli', target: 'ap', label: 'SSID' },
    { id: 'l2', source: 'ap', target: 'wlc', label: 'CAPWAP' },
    { id: 'l3', source: 'wlc', target: 'vlan', label: 'WLAN→VLAN' },
  ], ['SSID maps to VLAN; client gets IP on that VLAN', 'Trap: wrong WLAN-VLAN map = wrong DHCP scope']),
}

export const COMPARE = {
  '2.1': compare('Access vs trunk', 'Access port', ['One VLAN', 'Untagged to host', 'End devices'], 'Trunk port', ['Many VLANs', '802.1Q tags', 'Switch-switch']),
  '2.2': compare('Trunk pitfalls', 'Must match', ['Allowed VLANs', 'Native VLAN', 'Encapsulation'], 'Symptoms', ['VLAN missing', 'Native mismatch leak', 'STP weirdness']),
  '2.3': compare('CDP vs LLDP', 'CDP', ['Cisco default', 'show cdp neighbors'], 'LLDP', ['Multi-vendor', 'show lldp neighbors']),
  '2.4': compare('EtherChannel', 'LACP', ['Standards', 'active/passive'], 'PAgP', ['Cisco', 'auto/desirable']),
  '2.5': stack('STP roles', [
    { label: 'Root bridge', note: 'Lowest bridge ID' },
    { label: 'Root port', note: 'Best path to root on non-root' },
    { label: 'Designated port', note: 'Forwards on a segment' },
    { label: 'Blocking', note: 'Breaks the loop' },
  ]),
  '2.6': compare('AP modes', 'Lightweight + WLC', ['Central policy', 'CAPWAP', 'Easy scale'], 'Autonomous', ['Local config', 'Harder fleet mgmt', 'Standalone']),
  '2.7': compare('AP power', 'PoE', ['Power+data one cable', 'Switch budget'], 'Local power', ['Brick/injector', 'When PoE short']),
  '2.8': compare('Client join', 'Need', ['SSID+security', 'AP reachability', 'DHCP on VLAN'], 'Fails if', ['Wrong PSK', 'VLAN map wrong', 'DHCP missing']),
}

export const TRAPS = {
  '2.1': ['Hosts in different VLANs cannot talk at L2 alone.', 'VLAN 1 as “default” is not a security strategy.'],
  '2.2': ['DTP can surprise you — prefer static trunk/access.', 'Native VLAN mismatch is a classic security/ops trap.'],
  '2.3': ['Disabling CDP on Internet-facing ports is common hardening.', 'Neighbor info is not a substitute for LLDP on mixed gear.'],
  '2.4': ['All members need same speed/duplex/VLAN mode.', 'On/on without negotiation can work but is brittle.'],
  '2.5': ['Root primary is configured with priority — not “closest to Internet.”', 'PortFast is for access ports — not trunks blindly.'],
  '2.6': ['FlexConnect/local switching is a variant — know centralized first.', 'WLC failure impacts lightweight APs depending on mode.'],
  '2.7': ['PoE class/budget math matters in design questions.', 'AP uplink is usually access or trunk with management + user VLANs.'],
  '2.8': ['AAA/PSK is WLAN security — separate from VLAN mapping.', 'Client isolation is a WLC/AP feature, not STP.'],
}

export const FLOWS = {
  '2.1': flow('FLOW-2.1-vlan', 'Same-VLAN frame', ['CKU-VLAN'], [['Ingress access', 'Untagged frame enters VLAN.'], ['Switch lookup', 'MAC table in that VLAN.'], ['Egress', 'Out access port same VLAN.']]),
  '2.2': flow('FLOW-2.2-trunk', 'Tagged across trunk', ['CKU-TRUNK'], [['Tag on egress', '802.1Q VLAN ID.'], ['Across link', 'Multiple VLANs share cable.'], ['Untag on access', 'Host sees untagged.']]),
  '2.3': flow('FLOW-2.3-disc', 'Discover neighbor', ['CKU-CDP'], [['Enable protocol', 'CDP/LLDP on.'], ['Exchange TLVs', 'ID, port, platform.'], ['Verify', 'show neighbors.']]),
  '2.4': flow('FLOW-2.4-lacp', 'Form Port-Channel', ['CKU-EC'], [['Match members', 'Speed/duplex/mode.'], ['Negotiate LACP', 'Bundle up.'], ['Verify Po', 'One logical interface.']]),
  '2.5': flow('FLOW-2.5-stp', 'STP converge', ['CKU-STP'], [['Elect root', 'Lowest BID.'], ['Choose ports', 'RP/DP/BLK.'], ['Forward/block', 'Loop-free active topology.']]),
  '2.6': flow('FLOW-2.6-capwap', 'AP joins WLC', ['CKU-WLC'], [['AP boots', 'Gets IP.'], ['Discover WLC', 'CAPWAP tunnel.'], ['Download config', 'SSIDs/policy.']]),
  '2.7': flow('FLOW-2.7-phys', 'Install AP', ['CKU-WLAN-PHYS'], [['Cable to PoE', 'Data+power.'], ['Uplink path', 'To WLC/campus.'], ['Verify AP up', 'Power + CAPWAP.']]),
  '2.8': flow('FLOW-2.8-join', 'Client connects', ['CKU-WLAN-CLIENT'], [['Associate', 'SSID + auth.'], ['Get IP', 'DHCP on mapped VLAN.'], ['Pass traffic', 'Through AP/WLC path.']]),
}
