import { topo, compare, stack, flow } from './packHelpers.js'

export const DIAGRAMS = {
  '5.1': topo('DIAG-5.1-cia', 'CIA + threats', [
    { id: 'c', label: 'Confidentiality', type: 'process', x: 20, y: 30 },
    { id: 'i', label: 'Integrity', type: 'process', x: 50, y: 30 },
    { id: 'a', label: 'Availability', type: 'process', x: 80, y: 30 },
    { id: 'att', label: 'Attacker', type: 'pc', x: 50, y: 70, status: 'dropped' },
  ], [
    { id: 'l1', source: 'att', target: 'c', label: 'sniff', status: 'dropped' },
    { id: 'l2', source: 'att', target: 'i', label: 'alter', status: 'dropped' },
    { id: 'l3', source: 'att', target: 'a', label: 'DoS', status: 'dropped' },
  ], ['CIA triad anchors every security discussion', 'Trap: encryption alone is not integrity or availability']),

  '5.2': topo('DIAG-5.2-program', 'Security program elements', [
    { id: 'pol', label: 'Policy', type: 'process', x: 20, y: 40, status: 'highlighted' },
    { id: 'user', label: 'Users', type: 'pc', x: 50, y: 25 },
    { id: 'phys', label: 'Physical', type: 'server', x: 50, y: 55 },
    { id: 'inc', label: 'Incident response', type: 'highlight', x: 80, y: 40 },
  ], [
    { id: 'l1', source: 'pol', target: 'user', label: 'awareness' },
    { id: 'l2', source: 'pol', target: 'phys', label: 'controls' },
    { id: 'l3', source: 'pol', target: 'inc', label: 'playbooks' },
  ], ['Policy + awareness + physical + IR — not only firewalls', 'Trap: technical controls without policy still fail audits']),

  '5.3': topo('DIAG-5.3-access', 'Device access control', [
    { id: 'admin', label: 'Admin', type: 'pc', x: 15, y: 50 },
    { id: 'con', label: 'Console', type: 'process', x: 40, y: 30 },
    { id: 'vty', label: 'VTY SSH', type: 'process', x: 40, y: 70, status: 'highlighted' },
    { id: 'r', label: 'Device', type: 'router', x: 70, y: 50 },
  ], [
    { id: 'l1', source: 'admin', target: 'con', label: 'line con 0' },
    { id: 'l2', source: 'admin', target: 'vty', label: 'line vty' },
    { id: 'l3', source: 'con', target: 'r', label: 'password/AAA' },
    { id: 'l4', source: 'vty', target: 'r', label: '' },
  ], ['Protect console and VTY; prefer SSH + strong auth', 'Trap: login without password still a classic miss']),

  '5.4': topo('DIAG-5.4-aaa-servers', 'AAA with TACACS+/RADIUS', [
    { id: 'admin', label: 'Admin', type: 'pc', x: 12, y: 50 },
    { id: 'nas', label: 'NAS/device', type: 'router', x: 40, y: 50, status: 'highlighted' },
    { id: 'tac', label: 'TACACS+', type: 'server', x: 70, y: 30 },
    { id: 'rad', label: 'RADIUS', type: 'server', x: 70, y: 70 },
  ], [
    { id: 'l1', source: 'admin', target: 'nas', label: 'login' },
    { id: 'l2', source: 'nas', target: 'tac', label: 'device admin' },
    { id: 'l3', source: 'nas', target: 'rad', label: 'network access' },
  ], ['Device often uses TACACS+ for admin; RADIUS for 802.1X/VPN users', 'Trap: both do AAA but protocols/ports differ']),

  '5.5': topo('DIAG-5.5-acl', 'ACL placement', [
    { id: 'src', label: 'Source', type: 'pc', x: 12, y: 50 },
    { id: 'r', label: 'Router ACL', type: 'router', x: 45, y: 50, status: 'highlighted' },
    { id: 'dst', label: 'Destination', type: 'server', x: 80, y: 50 },
    { id: 'ext', label: 'Extended near source', type: 'highlight', x: 45, y: 25 },
  ], [
    { id: 'l1', source: 'src', target: 'r', label: 'filter', priority: true },
    { id: 'l2', source: 'r', target: 'dst', label: 'permit/deny' },
    { id: 'l3', source: 'ext', target: 'r', label: '' },
  ], ['Extended ACL close to source; standard near destination (classic rule)', 'Implicit deny at end — always']),

  '5.6': topo('DIAG-5.6-l2sec', 'L2 security features', [
    { id: 'host', label: 'PC', type: 'pc', x: 15, y: 40 },
    { id: 'port', label: 'Access port', type: 'switch', x: 45, y: 40, status: 'highlighted' },
    { id: 'rogue', label: 'Rogue', type: 'pc', x: 75, y: 25, status: 'dropped' },
    { id: 'dhcp', label: 'DHCP snooping', type: 'process', x: 45, y: 75 },
  ], [
    { id: 'l1', source: 'host', target: 'port', label: 'port-security' },
    { id: 'l2', source: 'rogue', target: 'port', label: 'violation', status: 'dropped' },
    { id: 'l3', source: 'dhcp', target: 'port', label: 'DAI/IP source' },
  ], ['Port-security, DHCP snooping, DAI protect the access edge', 'Trap: sticky MAC ≠ 802.1X by itself']),

  '5.7': topo('DIAG-5.7-aaa-compare', 'Authentication · Authorization · Accounting', [
    { id: 'authn', label: 'Authentication', type: 'process', x: 20, y: 50, status: 'highlighted' },
    { id: 'authz', label: 'Authorization', type: 'process', x: 50, y: 50 },
    { id: 'acct', label: 'Accounting', type: 'process', x: 80, y: 50 },
    { id: 'user', label: 'User/device', type: 'pc', x: 50, y: 25 },
  ], [
    { id: 'l1', source: 'user', target: 'authn', label: 'who' },
    { id: 'l2', source: 'authn', target: 'authz', label: 'what' },
    { id: 'l3', source: 'authz', target: 'acct', label: 'track' },
  ], ['AuthN who; AuthZ what; Accounting track', 'Trap: “AAA server” still maps to these three jobs']),

  '5.8': topo('DIAG-5.8-wlan-sec', 'Wireless security protocols', [
    { id: 'cli', label: 'Client', type: 'pc', x: 15, y: 50 },
    { id: 'wpa2', label: 'WPA2-AES', type: 'process', x: 45, y: 35, status: 'highlighted' },
    { id: 'wpa3', label: 'WPA3', type: 'process', x: 45, y: 65 },
    { id: 'ap', label: 'AP/WLC', type: 'cloud', x: 80, y: 50 },
  ], [
    { id: 'l1', source: 'cli', target: 'wpa2', label: 'PSK/802.1X' },
    { id: 'l2', source: 'wpa2', target: 'ap', label: '' },
    { id: 'l3', source: 'cli', target: 'wpa3', label: 'newer' },
  ], ['WPA2-AES common on CCNA; open/WEP are wrong answers', 'Trap: TKIP is legacy — prefer AES']),

  '5.9': topo('DIAG-5.9-wpa2', 'WPA2-PSK WLAN', [
    { id: 'cli', label: 'Client', type: 'pc', x: 12, y: 55 },
    { id: 'ap', label: 'AP', type: 'cloud', x: 38, y: 55 },
    { id: 'wlc', label: 'WLC PSK', type: 'server', x: 62, y: 35, status: 'highlighted' },
    { id: 'vlan', label: 'VLAN', type: 'subnet', x: 85, y: 55 },
  ], [
    { id: 'l1', source: 'cli', target: 'ap', label: 'SSID+PSK' },
    { id: 'l2', source: 'ap', target: 'wlc', label: '4-way' },
    { id: 'l3', source: 'wlc', target: 'vlan', label: 'map' },
  ], ['PSK shared secret; map WLAN to VLAN for IP', 'Trap: weak PSK = shared password risk']),

  '5.10': topo('DIAG-5.10-vpn', 'Site-to-site vs remote access', [
    { id: 'br', label: 'Branch', type: 'router', x: 15, y: 50 },
    { id: 'vpn', label: 'IPsec/TLS VPN', type: 'process', x: 50, y: 50, status: 'highlighted' },
    { id: 'hq', label: 'HQ', type: 'router', x: 85, y: 50 },
    { id: 'user', label: 'Remote user', type: 'pc', x: 50, y: 20 },
  ], [
    { id: 'l1', source: 'br', target: 'vpn', label: 'site-to-site' },
    { id: 'l2', source: 'vpn', target: 'hq', label: '' },
    { id: 'l3', source: 'user', target: 'vpn', label: 'remote access' },
  ], ['Site-to-site links networks; remote access links users', 'Trap: VPN encrypts path — still need auth']),

  '5.11': topo('DIAG-5.11-segment', 'Segmentation', [
    { id: 'user', label: 'User VLAN', type: 'pc', x: 15, y: 50 },
    { id: 'fw', label: 'FW / ACL', type: 'firewall', x: 45, y: 50, status: 'highlighted' },
    { id: 'srv', label: 'Server VLAN', type: 'server', x: 75, y: 50 },
    { id: 'dmz', label: 'DMZ', type: 'subnet', x: 45, y: 25 },
  ], [
    { id: 'l1', source: 'user', target: 'fw', label: 'policy' },
    { id: 'l2', source: 'fw', target: 'srv', label: 'least privilege' },
    { id: 'l3', source: 'fw', target: 'dmz', label: 'public apps' },
  ], ['VLANs + firewalls enforce trust zones', 'Trap: flat L2 is not segmentation']),
}

export const COMPARE = {
  '5.1': compare('Threats', 'Confidentiality', ['Sniffing', 'Encrypt'], 'Availability', ['DoS', 'Redundancy']),
  '5.2': compare('Program pieces', 'People/process', ['Policy', 'Training', 'IR'], 'Technology', ['Firewall', 'AAA', 'Encryption']),
  '5.3': compare('Lines', 'Console', ['Physical access', 'line con 0'], 'VTY', ['Remote', 'SSH + ACL']),
  '5.4': compare('TACACS+ vs RADIUS', 'TACACS+', ['TCP, command authz', 'Device admin'], 'RADIUS', ['UDP, network users', '802.1X/VPN']),
  '5.5': compare('ACL types', 'Standard', ['Source IP', 'Near dest'], 'Extended', ['Src/dst/port', 'Near source']),
  '5.6': stack('L2 toolkit', [
    { label: 'Port-security', note: 'Limit MACs / violation' },
    { label: 'DHCP snooping', note: 'Trust DHCP servers' },
    { label: 'DAI / IPSG', note: 'ARP/IP binding checks' },
  ]),
  '5.7': compare('AAA trio', 'Authentication', ['Identity proof'], 'Authorization', ['Permissions after login']),
  '5.8': compare('WLAN crypto', 'Use', ['WPA2-AES', 'WPA3'], 'Avoid', ['WEP', 'Open on corp']),
  '5.9': compare('PSK vs 802.1X', 'PSK', ['Shared key', 'Small/simple'], 'Enterprise', ['Per-user AAA', 'Scales']),
  '5.10': compare('VPN types', 'Site-to-site', ['Router-router', 'Always on'], 'Remote access', ['Client-gateway', 'User sessions']),
  '5.11': compare('Segmentation', 'L2 VLAN', ['Broadcast domain split'], 'L3/FW policy', ['Controlled east-west']),
}

export const TRAPS = {
  '5.1': ['Integrity ≠ confidentiality — hashing/signing vs secrecy.', 'Best effort availability still needs design (FHRP, etc.).'],
  '5.2': ['Physical security is on the blueprint — badges/locks.', 'Acceptable use policy is a program control.'],
  '5.3': ['enable secret vs password — know hashing difference idea.', 'aux line rarely used but exists.'],
  '5.4': ['RADIUS accounting common; TACACS+ encrypts full body.', 'Do not swap ports casually on the exam.'],
  '5.5': ['Order matters — first match wins.', 'Named vs numbered — both valid.'],
  '5.6': ['Violation shutdown needs recovery.', 'Untrusted ports for users; trusted for uplinks/DHCP server.'],
  '5.7': ['Accounting is not optional “logging only” — it’s AAA.', 'Local AAA vs server-based tradeoffs.'],
  '5.8': ['WPA2-Personal = PSK; Enterprise = 802.1X.', 'AES-CCMP is the WPA2 workhorse.'],
  '5.9': ['GUI WLAN wizard still maps SSID→VLAN→PSK.', 'Broadcast SSID off is obscurity — not real security.'],
  '5.10': ['IPsec vs SSL/TLS VPN — know remote-access flavor.', 'VPN does not replace endpoint security.'],
  '5.11': ['Microsegmentation is advanced — CCNA focuses VLAN/FW zones.', 'Same VLAN + no ACL = not segmented.'],
}

export const FLOWS = {
  '5.1': flow('FLOW-5.1-cia', 'Apply CIA', ['CKU-SEC'], [['Identify asset', 'What to protect.'], ['Map threat', 'C/I/A risk.'], ['Pick control', 'Encrypt/hash/redundant.']]),
  '5.2': flow('FLOW-5.2-prog', 'Security program', ['CKU-PROG'], [['Write policy', 'Rules of the road.'], ['Train users', 'Awareness.'], ['Respond', 'IR when it breaks.']]),
  '5.3': flow('FLOW-5.3-harden', 'Harden device access', ['CKU-ACCESS'], [['Set line passwords', 'con/vty.'], ['SSH only', 'Disable Telnet.'], ['Optional AAA', 'Central users.']]),
  '5.4': flow('FLOW-5.4-aaa', 'AAA login', ['CKU-AAA'], [['User authenticates', 'To NAS.'], ['NAS queries server', 'TACACS+/RADIUS.'], ['AuthZ + account', 'Commands/session.']]),
  '5.5': flow('FLOW-5.5-acl', 'Build ACL', ['CKU-ACL'], [['Define interesting traffic', 'Permit/deny.'], ['Place inbound/out', 'Correct interface.'], ['Test', 'Implicit deny check.']]),
  '5.6': flow('FLOW-5.6-portsec', 'Enable port-security', ['CKU-L2SEC'], [['Access mode', 'Not trunk.'], ['Max MAC + violation', 'Protect.'], ['Verify', 'show port-security.']]),
  '5.7': flow('FLOW-5.7-aaa-flow', 'AAA sequence', ['CKU-AAA'], [['Authenticate', 'Prove identity.'], ['Authorize', 'Grant rights.'], ['Account', 'Log activity.']]),
  '5.8': flow('FLOW-5.8-secure-wlan', 'Pick WLAN security', ['CKU-WPA'], [['Prefer WPA2/3 AES', 'Avoid WEP.'], ['PSK or 802.1X', 'Scale needs.'], ['Verify client', 'Connect + traffic.']]),
  '5.9': flow('FLOW-5.9-psk', 'Configure WPA2-PSK', ['CKU-WPA2'], [['Create WLAN', 'SSID.'], ['Set PSK AES', 'On WLC.'], ['Map VLAN', 'Client DHCP.']]),
  '5.10': flow('FLOW-5.10-vpn', 'Choose VPN', ['CKU-VPN'], [['Site or remote?', 'Topology.'], ['Tunnel + auth', 'IPsec/TLS.'], ['Interesting traffic', 'Encrypt what you mean.']]),
  '5.11': flow('FLOW-5.11-seg', 'Segment network', ['CKU-SEGMENT'], [['Split VLANs', 'Trust zones.'], ['L3/FW policy', 'Allow needed only.'], ['Verify paths', 'No accidental flat L2.']]),
}
