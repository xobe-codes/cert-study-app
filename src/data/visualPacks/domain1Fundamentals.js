import { topo, compare, stack, flow } from './packHelpers.js'

export const DIAGRAMS = {
  '1.1': topo('DIAG-1.1-components', 'End-to-end network path', [
    { id: 'pc', label: 'End host', type: 'pc', x: 10, y: 50 },
    { id: 'ap', label: 'AP', type: 'cloud', x: 28, y: 30 },
    { id: 'sw', label: 'L2 Switch', shortLabel: 'SW', type: 'switch', x: 40, y: 55 },
    { id: 'fw', label: 'Firewall', type: 'firewall', x: 58, y: 55, status: 'highlighted' },
    { id: 'r', label: 'Router', type: 'router', x: 75, y: 55 },
    { id: 'srv', label: 'Server', type: 'server', x: 90, y: 50 },
  ], [
    { id: 'l1', source: 'pc', target: 'sw', label: 'access' },
    { id: 'l2', source: 'ap', target: 'sw', label: 'CAPWAP/wired' },
    { id: 'l3', source: 'sw', target: 'fw', label: '' },
    { id: 'l4', source: 'fw', target: 'r', label: 'routed' },
    { id: 'l5', source: 'r', target: 'srv', label: '' },
  ], ['Switches forward within a LAN; routers forward between subnets', 'Controllers/APs centralize wireless — hosts still need L2/L3 path']),

  '1.2': topo('DIAG-1.2-topo', 'Campus tier vs WAN topologies', [
    { id: 'core', label: 'Core', type: 'router', x: 50, y: 20, status: 'highlighted' },
    { id: 'dist', label: 'Distribution', type: 'switch', x: 50, y: 45 },
    { id: 'acc', label: 'Access', type: 'switch', x: 50, y: 70 },
    { id: 'br', label: 'Branch', type: 'router', x: 85, y: 45 },
    { id: 'hq', label: 'HQ', type: 'router', x: 15, y: 45 },
  ], [
    { id: 'l1', source: 'core', target: 'dist', label: 'campus' },
    { id: 'l2', source: 'dist', target: 'acc', label: '' },
    { id: 'l3', source: 'hq', target: 'br', label: 'WAN/VPN' },
    { id: 'l4', source: 'core', target: 'hq', label: '' },
  ], ['3-tier campus: access–distribution–core', 'Trap: spine-leaf is data-center style — still know classic 3-tier for CCNA']),

  '1.3': topo('DIAG-1.3-cables', 'Copper vs fiber roles', [
    { id: 'pc', label: 'PC', type: 'pc', x: 12, y: 50 },
    { id: 'cu', label: 'UTP copper', shortLabel: 'Cu', type: 'process', x: 35, y: 35, status: 'highlighted' },
    { id: 'sw', label: 'Switch', type: 'switch', x: 55, y: 50 },
    { id: 'fib', label: 'Fiber', type: 'process', x: 75, y: 35, status: 'highlighted' },
    { id: 'r', label: 'Router/uplink', type: 'router', x: 90, y: 50 },
  ], [
    { id: 'l1', source: 'pc', target: 'cu', label: 'access' },
    { id: 'l2', source: 'cu', target: 'sw', label: '' },
    { id: 'l3', source: 'sw', target: 'fib', label: 'uplink' },
    { id: 'l4', source: 'fib', target: 'r', label: 'distance' },
  ], ['Copper for short access; fiber for distance/EMI', 'Trap: SFP media type must match fiber/copper module']),

  '1.4': topo('DIAG-1.4-cable-issues', 'Interface & cable faults', [
    { id: 'a', label: 'Device A', type: 'pc', x: 15, y: 50 },
    { id: 'link', label: 'Cable / SFP', shortLabel: 'Link', type: 'process', x: 50, y: 50, status: 'dropped' },
    { id: 'b', label: 'Device B', type: 'switch', x: 85, y: 50 },
    { id: 'led', label: 'err-disabled / down', type: 'highlight', x: 50, y: 25 },
  ], [
    { id: 'l1', source: 'a', target: 'link', label: 'CRC / duplex' },
    { id: 'l2', source: 'link', target: 'b', label: 'speed mismatch', status: 'dropped' },
    { id: 'l3', source: 'led', target: 'link', label: '' },
  ], ['Check speed/duplex, CRC, err-disable, wrong cable pinout', 'Trap: auto-MDIX helps copper; fiber still needs correct polarity/SFP']),

  '1.5': topo('DIAG-1.5-switch', 'MAC learn & forward', [
    { id: 'pca', label: 'PC-A', type: 'pc', x: 15, y: 30 },
    { id: 'pcb', label: 'PC-B', type: 'pc', x: 15, y: 70 },
    { id: 'sw', label: 'Switch', type: 'switch', x: 50, y: 50, status: 'highlighted' },
    { id: 'pcc', label: 'PC-C', type: 'pc', x: 85, y: 50 },
  ], [
    { id: 'l1', source: 'pca', target: 'sw', label: 'learn A' },
    { id: 'l2', source: 'sw', target: 'pcb', label: 'known unicast' },
    { id: 'l3', source: 'sw', target: 'pcc', label: 'flood unknown', status: 'dropped' },
  ], ['Learn source MAC on ingress port; forward/flood by dest MAC', 'Trap: switches do not rewrite MAC like routers rewrite L2']),

  '1.6': topo('DIAG-1.6-subnet', 'IPv4 /24 → /26 split', [
    { id: 'net', label: '192.168.1.0/24', type: 'subnet', x: 50, y: 18 },
    { id: 's1', label: '/26 .0', type: 'subnet', x: 18, y: 55, status: 'highlighted' },
    { id: 's2', label: '/26 .64', type: 'subnet', x: 50, y: 55 },
    { id: 's3', label: '/26 .128', type: 'subnet', x: 82, y: 55 },
    { id: 'note', label: 'block 64', type: 'highlight', x: 50, y: 85 },
  ], [
    { id: 'l1', source: 'net', target: 's1', label: 'borrow 2' },
    { id: 'l2', source: 'net', target: 's2', label: '' },
    { id: 'l3', source: 'net', target: 's3', label: '' },
  ], ['Block size = 256 − mask octet; usable = block − 2', 'Trap: network/broadcast are not usable host addresses']),

  '1.7': topo('DIAG-1.7-rfc1918', 'Private vs public IPv4', [
    { id: 'lan', label: '10/8 · 172.16/12 · 192.168/16', shortLabel: 'Private', type: 'subnet', x: 25, y: 50, status: 'highlighted' },
    { id: 'nat', label: 'NAT edge', type: 'router', x: 55, y: 50 },
    { id: 'pub', label: 'Public Internet', type: 'cloud', x: 85, y: 50 },
  ], [
    { id: 'l1', source: 'lan', target: 'nat', label: 'inside' },
    { id: 'l2', source: 'nat', target: 'pub', label: 'outside' },
  ], ['RFC1918 not routed on the public Internet', 'Trap: private ≠ “secure by itself” — still need ACL/firewall']),

  '1.8': topo('DIAG-1.8-ipv6', 'IPv6 /64 on a link', [
    { id: 'r', label: 'Router Gi0/0', type: 'router', x: 25, y: 50 },
    { id: 'lan', label: '2001:db8:1::/64', type: 'subnet', x: 55, y: 50, status: 'highlighted' },
    { id: 'h', label: 'Host (SLAAC/DHCPv6)', type: 'pc', x: 85, y: 50 },
  ], [
    { id: 'l1', source: 'r', target: 'lan', label: 'RA / on-link' },
    { id: 'l2', source: 'lan', target: 'h', label: 'IID' },
  ], ['Typical LAN uses /64; host forms IID via SLAAC or DHCPv6', 'Trap: /127 is point-to-point special case — not a LAN /64']),

  '1.9': topo('DIAG-1.9-v6types', 'IPv6 address types', [
    { id: 'gua', label: 'GUA 2000::/3', type: 'subnet', x: 20, y: 30, status: 'highlighted' },
    { id: 'ula', label: 'ULA fc00::/7', type: 'subnet', x: 50, y: 30 },
    { id: 'll', label: 'Link-local fe80::/10', type: 'process', x: 80, y: 30 },
    { id: 'm', label: 'Multicast ff00::/8', type: 'highlight', x: 50, y: 70 },
  ], [
    { id: 'l1', source: 'gua', target: 'm', label: 'no broadcast' },
    { id: 'l2', source: 'll', target: 'm', label: 'ND uses mcast' },
  ], ['No broadcast in IPv6 — multicast + ND instead', 'Trap: link-local is not globally routable']),

  '1.10': topo('DIAG-1.10-client-ip', 'Verify client IP params', [
    { id: 'os', label: 'Client OS', type: 'pc', x: 20, y: 50, status: 'highlighted' },
    { id: 'ip', label: 'IP / mask', type: 'process', x: 45, y: 30 },
    { id: 'gw', label: 'Default GW', type: 'router', x: 70, y: 30 },
    { id: 'dns', label: 'DNS', type: 'server', x: 70, y: 70 },
  ], [
    { id: 'l1', source: 'os', target: 'ip', label: 'ipconfig/ifconfig' },
    { id: 'l2', source: 'os', target: 'gw', label: 'same subnet?' },
    { id: 'l3', source: 'os', target: 'dns', label: 'resolve' },
  ], ['Verify address, mask, gateway, DNS on the client', 'Trap: wrong GW subnet = local OK, Internet fail']),

  '1.11': topo('DIAG-1.11-wifi', 'Wireless principles', [
    { id: 'cli', label: 'Client', type: 'pc', x: 15, y: 55 },
    { id: 'rf', label: 'RF / SSID', type: 'cloud', x: 40, y: 55, status: 'highlighted' },
    { id: 'ap', label: 'AP', type: 'cloud', x: 65, y: 55 },
    { id: 'sw', label: 'Switch', type: 'switch', x: 88, y: 55 },
  ], [
    { id: 'l1', source: 'cli', target: 'rf', label: 'associate' },
    { id: 'l2', source: 'rf', target: 'ap', label: '802.11' },
    { id: 'l3', source: 'ap', target: 'sw', label: 'SSID→VLAN' },
  ], ['SSID maps to VLAN; RF is half-duplex shared medium', 'Trap: channel/power issues look like “routing” problems']),

  '1.12': topo('DIAG-1.12-virt', 'Virtualization fundamentals', [
    { id: 'hw', label: 'Physical host', type: 'server', x: 20, y: 70 },
    { id: 'hyp', label: 'Hypervisor', type: 'process', x: 50, y: 50, status: 'highlighted' },
    { id: 'vm1', label: 'VM / vNIC', type: 'pc', x: 75, y: 30 },
    { id: 'vm2', label: 'VM / vSwitch', type: 'switch', x: 75, y: 70 },
  ], [
    { id: 'l1', source: 'hw', target: 'hyp', label: 'share CPU/RAM' },
    { id: 'l2', source: 'hyp', target: 'vm1', label: '' },
    { id: 'l3', source: 'hyp', target: 'vm2', label: 'vSwitch' },
  ], ['Hypervisor shares hardware; vSwitch bridges VMs', 'Trap: VM IP still needs correct VLAN/port-group like physical']),
}

export const COMPARE = {
  '1.1': compare('Device roles', 'L2 Switch', ['MAC learning/forwarding', 'Same subnet / VLAN', 'No IP rewrite'], 'Router / L3', ['Routes between subnets', 'Rewrites L2 each hop', 'Uses routing table']),
  '1.2': compare('Topology styles', '3-tier campus', ['Access / Dist / Core', 'Classic enterprise', 'Clear hierarchy'], 'WAN / branch', ['Hub-spoke or dual-homed', 'VPN/MPLS edge', 'Fewer tiers at site']),
  '1.3': compare('Media choice', 'Copper UTP', ['Cheap short runs', 'EMI sensitive', 'RJ-45 common'], 'Fiber', ['Long distance', 'EMI immune', 'Needs correct SFP']),
  '1.4': compare('Symptom → cause', 'Layer 1', ['Cable/SFP/power', 'CRC / runts', 'err-disable'], 'Layer 2/3 config', ['VLAN/trunk mismatch', 'IP/mask wrong', 'ACL drop']),
  '1.5': compare('Unknown vs known', 'Known unicast', ['Dest MAC in table', 'Out one port', 'No flood'], 'Unknown / broadcast', ['Flood VLAN', 'Learn on reply', 'ARP uses broadcast']),
  '1.6': compare('Subnet math', 'Remember', ['Block size', 'Network ID', 'Broadcast = last'], 'Exam traps', ['Off-by-one hosts', 'Wrong borrowed bits', 'Usable vs total']),
  '1.7': compare('Address space', 'Private (RFC1918)', ['10/8, 172.16/12, 192.168/16', 'Reuse OK inside', 'Needs NAT for Internet'], 'Public', ['Globally unique', 'ISP assigned', 'Routable']),
  '1.8': compare('IPv6 on a LAN', 'Prefix', ['Usually /64', 'On-link via RA', 'Router advertises'], 'Host address', ['SLAAC or DHCPv6', 'IID + prefix', 'Also has link-local']),
  '1.9': stack('IPv6 types (scan)', [
    { label: 'GUA', note: 'Global unicast — Internet routable' },
    { label: 'ULA', note: 'Unique local — site private' },
    { label: 'Link-local', note: 'fe80::/10 — on-link only' },
    { label: 'Multicast', note: 'ff00::/8 — replaces broadcast' },
  ]),
  '1.10': compare('Client checks', 'Must verify', ['IP + mask', 'Default gateway', 'DNS servers'], 'Common fails', ['GW off-subnet', 'APIPA 169.254', 'DNS only broken']),
  '1.11': compare('Wireless vs wired', 'Wireless', ['Shared RF', 'SSID identity', 'Roaming/AP'], 'Wired', ['Full duplex typical', 'Port = cable', 'PoE for AP']),
  '1.12': compare('Physical vs virtual', 'Physical NIC', ['Hardware port', 'Cable to switch'], 'vNIC / vSwitch', ['Port-group / VLAN', 'Still needs uplink']),
}

export const TRAPS = {
  '1.1': ['A switch does not route between VLANs without L3.', 'Firewall ≠ router-only — policy + zones matter.'],
  '1.2': ['Collapsed core still has access/dist roles logically.', 'Do not invent mesh where exam shows hub-spoke.'],
  '1.3': ['Wrong SFP = link down even if “fiber is plugged in.”', 'Crossover rarely needed with auto-MDIX — still know pinout.'],
  '1.4': ['Duplex mismatch = late collisions / poor throughput.', 'err-disable needs cause fix + recovery, not only shut/no shut forever.'],
  '1.5': ['Flooding is per-VLAN — not the whole switch.', 'Static MAC entries are rare on exam vs dynamic learning.'],
  '1.6': ['/30 has 2 usable hosts — point-to-point.', 'Host bits all 0/1 are network/broadcast.'],
  '1.7': ['CGNAT/public space confusion — know RFC1918 ranges cold.', 'Private addressing does not replace ACLs.'],
  '1.8': ['EUI-64 flips U/L bit — classic trap.', 'You can have multiple IPv6 addresses on one interface.'],
  '1.9': ['Anycast is one-to-nearest — not “broadcast.”', 'ff02::1 is all-nodes link-local multicast.'],
  '1.10': ['ipconfig /all shows DHCP vs static.', 'Default gateway must be in the same subnet.'],
  '1.11': ['2.4 vs 5 GHz trade coverage vs capacity.', 'SSID name alone does not equal security.'],
  '1.12': ['Type-1 vs Type-2 hypervisor — know bare-metal vs hosted idea.', 'vMotion/HA are ops topics — focus on vNIC/VLAN mapping for CCNA.'],
}

export const FLOWS = {
  '1.1': flow('FLOW-1.1-path', 'Packet across devices', ['CKU-COMPONENTS'], [['Host sends', 'Frame to default gateway MAC if off-subnet.'], ['Switch forwards', 'Uses MAC table within VLAN.'], ['Router hops', 'Routes to next subnet toward server.']]),
  '1.2': flow('FLOW-1.2-design', 'Pick a topology', ['CKU-TOPOLOGY'], [['Identify scale', 'Campus vs branch vs DC.'], ['Choose hierarchy', 'Access for users; core for speed.'], ['Add WAN edge', 'Connect sites with redundant links if required.']]),
  '1.3': flow('FLOW-1.3-media', 'Choose media', ['CKU-CABLING'], [['Distance/EMI', 'Long or noisy → fiber.'], ['Pick connector/SFP', 'Match both ends.'], ['Verify link', 'Speed/duplex/light levels.']]),
  '1.4': flow('FLOW-1.4-tshoot', 'Cable/interface tshoot', ['CKU-CABLE-ISSUE'], [['Check status', 'up/up vs down/down.'], ['Counters', 'CRC, input errors, err-disable.'], ['Swap/test', 'Cable, SFP, known-good port.']]),
  '1.5': flow('FLOW-1.5-mac', 'Frame decision', ['CKU-MAC'], [['Learn source', 'Bind MAC to ingress port.'], ['Lookup dest', 'Hit → forward; miss → flood.'], ['Age/update', 'Table entries time out unless refreshed.']]),
  '1.6': flow('FLOW-1.6-subnet', 'Subnet a range', ['CKU-SUBNET'], [['Need hosts/subnets', 'Decide borrowed bits.'], ['Compute block', 'List network IDs.'], ['Assign usable', 'First–last host; set mask.']]),
  '1.7': flow('FLOW-1.7-private', 'Use private space', ['CKU-PRIVATE'], [['Pick RFC1918', 'Size the LAN.'], ['NAT at edge', 'Translate for Internet.'], ['Filter still', 'ACL/firewall on egress.']]),
  '1.8': flow('FLOW-1.8-v6', 'Enable IPv6 LAN', ['CKU-IPV6'], [['Set /64 on router', 'Enable IPv6.'], ['RA/SLAAC or DHCP', 'Hosts get addresses.'], ['Verify', 'ping/nd neighbors.']]),
  '1.9': flow('FLOW-1.9-types', 'Identify address type', ['CKU-IPV6-TYPES'], [['Read prefix', '2000/fc/fe80/ff.'], ['Scope', 'Global vs link.'], ['Pick use', 'GUA for Internet; LL for on-link.']]),
  '1.10': flow('FLOW-1.10-verify', 'Verify client IP', ['CKU-CLIENT-IP'], [['Show IP config', 'OS tools.'], ['Ping GW', 'Local connectivity.'], ['Resolve DNS', 'Name to IP then Internet.']]),
  '1.11': flow('FLOW-1.11-wifi', 'Client joins WLAN', ['CKU-WIFI'], [['Discover SSID', 'Probe/beacon.'], ['Associate/auth', 'Open or secure.'], ['Get IP + VLAN', 'DHCP on mapped VLAN.']]),
  '1.12': flow('FLOW-1.12-virt', 'VM network path', ['CKU-VIRT'], [['vNIC to port-group', 'VLAN tag.'], ['vSwitch uplink', 'Physical NIC.'], ['External switch', 'Same as physical host traffic.']]),
}
