/* Extended CCNA labs — guided config gaps + troubleshooting scenarios. */

const LAB_SOURCES = {
  workbook: 'CCNA in 60 Days — Lab Workbook (Browning)',
  blueprint: 'Cisco CCNA 200-301 v1.1 Exam Topics',
}

function mkFlows(id, title, diagramId, ckuIds, steps) {
  return [{ id, title, ckuIds, diagramId, steps }]
}

function mkDiagram(id, title, objectiveId, nodes, links, annotations = []) {
  return { id, title, objectiveId, nodes, links, annotations }
}

/* ---- HSRP (3.5) ---- */
const LAB_HSRP = {
  id: 'LAB-HSRP-GATEWAY',
  title: 'Configure HSRP Gateway Redundancy',
  domainId: 'connectivity',
  objectiveId: '3.5',
  ckuIds: ['CKU-HSRP'],
  labType: 'guided',
  difficulty: 'intermediate',
  estimatedTimeMinutes: 18,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'Two routers share a LAN segment. R1 should be the active HSRP gateway (priority 150 + preempt); R2 is the standby (default priority 100). Virtual IP is 192.168.1.1/24 on Gi0/0.',
  learningGoals: ['Configure standby group virtual IP', 'Set priority and preempt', 'Verify active/standby roles'],
  topologyId: 'TOPO-HSRP',
  prerequisites: ['CKU-IP-ADDRESSING'],
  tasks: [
    { id: 't1', order: 1, title: 'Address R1 Gi0/0', device: 'R1', instruction: 'Configure Gi0/0 with 192.168.1.2/24 and bring it up.',
      expectedCommands: ['interface gi0/0', 'ip address 192.168.1.2 255.255.255.0', 'no shutdown'] },
    { id: 't2', order: 2, title: 'HSRP active on R1', device: 'R1', instruction: 'Enable HSRP group 1 with virtual IP 192.168.1.1, priority 150, and preempt.',
      expectedCommands: ['standby 1 ip 192.168.1.1', 'standby 1 priority 150', 'standby 1 preempt'] },
    { id: 't3', order: 3, title: 'Address R2 Gi0/0', device: 'R2', instruction: 'Configure Gi0/0 with 192.168.1.3/24 and bring it up.',
      expectedCommands: ['interface gi0/0', 'ip address 192.168.1.3 255.255.255.0', 'no shutdown'] },
    { id: 't4', order: 4, title: 'HSRP standby on R2', device: 'R2', instruction: 'Join HSRP group 1 with the same virtual IP 192.168.1.1 (default priority 100).',
      expectedCommands: ['standby 1 ip 192.168.1.1'] },
    { id: 't5', order: 5, title: 'Verify roles', device: 'R1', instruction: 'Confirm R1 is Active and R2 is Standby.',
      expectedCommands: ['show standby brief'] },
  ],
  verificationCommands: ['show standby brief', 'show standby'],
  successCriteria: ['R1 shows Active state for group 1', 'R2 shows Standby state', 'Virtual IP 192.168.1.1 is reachable by LAN hosts'],
  failureCriteria: ['Missing preempt on R1 — R1 may not reclaim Active after recovery', 'Mismatched group or virtual IP — no adjacency'],
  commonMistakes: ['Forgetting preempt on the higher-priority router', 'Different standby group numbers on each router', 'Virtual IP not in the same subnet as physical interfaces'],
  source: { name: LAB_SOURCES.blueprint, chapter: '3.5 HSRP', confidence: 0.9 },
  metadata: { version: '1', status: 'validated', confidence: 0.9 },
}
const TOPO_HSRP = { id: 'TOPO-HSRP', title: 'HSRP dual-router LAN', objectiveId: '3.5',
  nodes: [{ id: 'r1', label: 'R1 Active .2', type: 'router', x: 30, y: 40 }, { id: 'r2', label: 'R2 Standby .3', type: 'router', x: 70, y: 40 }, { id: 'pc', label: 'LAN hosts GW .1', type: 'pc', x: 50, y: 80 }],
  links: [{ id: 'l1', source: 'r1', target: 'pc', label: 'Gi0/0', status: 'forwarding' }, { id: 'l2', source: 'r2', target: 'pc', label: 'Gi0/0', status: 'forwarding' }] }
const VALIDATOR_HSRP = { labId: 'LAB-HSRP-GATEWAY', requiredCommands: [
  { device: 'R1', command: 'standby 1 ip 192.168.1.1' }, { device: 'R1', command: 'standby 1 priority 150' }, { device: 'R1', command: 'standby 1 preempt' },
  { device: 'R2', command: 'standby 1 ip 192.168.1.1' },
], verificationChecks: [{ id: 'v1', device: 'R1', command: 'show standby brief', expectedResult: 'R1 Active, R2 Standby', passCondition: 'roles correct' }] }
const DIAGRAM_HSRP = mkDiagram('DIAG-HSRP', 'HSRP active/standby', '3.5',
  [{ id: 'r1', label: 'R1 Active', type: 'router', x: 25, y: 50, status: 'highlighted' }, { id: 'vip', label: 'VIP .1', type: 'process', x: 50, y: 20 }, { id: 'r2', label: 'R2 Standby', type: 'router', x: 75, y: 50 }],
  [{ id: 'd1', source: 'r1', target: 'vip', status: 'forwarding' }, { id: 'd2', source: 'r2', target: 'vip', status: 'blocked' }])
const HSRP = { lab: LAB_HSRP, topology: TOPO_HSRP, validator: VALIDATOR_HSRP, diagram: DIAGRAM_HSRP,
  packetFlows: mkFlows('FLOW-HSRP', 'Traffic uses active router', 'DIAG-HSRP', ['CKU-HSRP'], [
    { id: 's1', order: 1, title: 'Host ARP', action: 'Host ARPs for default gateway 192.168.1.1', successState: 'forwarded' },
    { id: 's2', order: 2, title: 'Active forwards', action: 'R1 (Active) responds and forwards traffic', successState: 'forwarded' },
  ]) }

/* ---- DHCP relay (4.6) ---- */
const LAB_DHCP = {
  id: 'LAB-DHCP-RELAY',
  title: 'Configure DHCP Server and Relay Agent',
  domainId: 'services',
  objectiveId: '4.6',
  ckuIds: ['CKU-DHCP'],
  labType: 'guided',
  difficulty: 'intermediate',
  estimatedTimeMinutes: 15,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'R1 is the DHCP server on 10.0.0.0/24. Remote LAN 192.168.10.0/24 is behind R2. Configure a DHCP pool on R1 and `ip helper-address` on R2 so remote PCs receive addresses.',
  learningGoals: ['Create DHCP pool and excluded addresses', 'Configure helper-address on the client-facing interface', 'Verify bindings'],
  topologyId: 'TOPO-DHCP-RELAY',
  prerequisites: ['CKU-IP-ADDRESSING'],
  tasks: [
    { id: 't1', order: 1, title: 'R1 server interface', device: 'R1', instruction: 'Configure Gi0/0 as 10.0.0.1/24 and enable it.',
      expectedCommands: ['interface gi0/0', 'ip address 10.0.0.1 255.255.255.0', 'no shutdown'] },
    { id: 't2', order: 2, title: 'DHCP pool on R1', device: 'R1', instruction: 'Create pool REMOTE_LAN for 192.168.10.0/24 with default-router 192.168.10.1.',
      expectedCommands: ['ip dhcp pool REMOTE_LAN', 'network 192.168.10.0 255.255.255.0', 'default-router 192.168.10.1'] },
    { id: 't3', order: 3, title: 'R2 client subnet', device: 'R2', instruction: 'Configure Gi0/1 (LAN) as 192.168.10.1/24.',
      expectedCommands: ['interface gi0/1', 'ip address 192.168.10.1 255.255.255.0', 'no shutdown'] },
    { id: 't4', order: 4, title: 'Helper-address on R2', device: 'R2', instruction: 'On Gi0/1, add ip helper-address pointing to R1 (10.0.0.1) to relay DHCP broadcasts.',
      expectedCommands: ['ip helper-address 10.0.0.1'] },
    { id: 't5', order: 5, title: 'Verify', device: 'R1', instruction: 'Confirm DHCP bindings appear after a client requests an address.',
      expectedCommands: ['show ip dhcp binding'] },
  ],
  verificationCommands: ['show ip dhcp binding', 'show ip dhcp pool'],
  successCriteria: ['Remote PC receives 192.168.10.x address', 'Binding visible on R1', 'Default gateway is 192.168.10.1'],
  failureCriteria: ['Helper-address on wrong interface', 'Pool network does not match remote subnet'],
  commonMistakes: ['Placing helper-address on the server-facing interface instead of the client LAN', 'Forgetting default-router in the pool'],
  source: { name: LAB_SOURCES.workbook, chapter: 'DHCP Relay', confidence: 0.9 },
  metadata: { version: '1', status: 'validated', confidence: 0.9 },
}
const TOPO_DHCP = { id: 'TOPO-DHCP-RELAY', title: 'DHCP relay topology', objectiveId: '4.6',
  nodes: [{ id: 'r1', label: 'R1 DHCP server', type: 'router', x: 20, y: 50 }, { id: 'r2', label: 'R2 relay', type: 'router', x: 55, y: 50 }, { id: 'pc', label: 'Remote PC', type: 'pc', x: 85, y: 50 }],
  links: [{ id: 'l1', source: 'r1', target: 'r2', status: 'forwarding' }, { id: 'l2', source: 'r2', target: 'pc', label: 'helper-address', status: 'forwarding' }] }
const VALIDATOR_DHCP = { labId: 'LAB-DHCP-RELAY', requiredCommands: [
  { device: 'R1', command: 'ip dhcp pool REMOTE_LAN' }, { device: 'R1', command: 'network 192.168.10.0 255.255.255.0' },
  { device: 'R2', command: 'ip helper-address 10.0.0.1' },
], verificationChecks: [{ id: 'v1', device: 'R1', command: 'show ip dhcp binding', expectedResult: 'Lease for remote PC', passCondition: 'binding present' }] }
const DHCP_RELAY = { lab: LAB_DHCP, topology: TOPO_DHCP, validator: VALIDATOR_DHCP,
  diagram: mkDiagram('DIAG-DHCP-RELAY', 'DHCP broadcast relayed', '4.6',
    [{ id: 'pc', label: 'PC DHCP discover', type: 'pc', x: 15, y: 50 }, { id: 'r2', label: 'R2 unicast to server', type: 'router', x: 50, y: 50 }, { id: 'r1', label: 'R1 offers lease', type: 'router', x: 85, y: 50 }],
    [{ id: 'd1', source: 'pc', target: 'r2', status: 'forwarding' }, { id: 'd2', source: 'r2', target: 'r1', status: 'forwarding' }]),
  packetFlows: mkFlows('FLOW-DHCP-RELAY', 'Relay converts broadcast to unicast', 'DIAG-DHCP-RELAY', ['CKU-DHCP'], [
    { id: 's1', order: 1, title: 'Discover', action: 'PC sends DHCPDISCOVER broadcast on LAN', successState: 'forwarded' },
    { id: 's2', order: 2, title: 'Relay', action: 'R2 forwards unicast to 10.0.0.1 via helper-address', successState: 'modified' },
  ]) }

/* ---- EtherChannel (2.4) ---- */
const LAB_EC = {
  id: 'LAB-ETHERCHANNEL',
  title: 'Configure LACP EtherChannel Between Switches',
  domainId: 'access',
  objectiveId: '2.4',
  ckuIds: ['CKU-ETHERCHANNEL'],
  labType: 'guided',
  difficulty: 'intermediate',
  estimatedTimeMinutes: 15,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'SW1 and SW2 are connected via Gi0/1 and Gi0/2. Bundle both links into Port-channel 1 using LACP active mode for redundant trunk bandwidth.',
  learningGoals: ['Match channel-group mode on both sides', 'Verify Po1 in show etherchannel summary'],
  topologyId: 'TOPO-EC',
  prerequisites: ['CKU-TRUNKING'],
  tasks: [
    { id: 't1', order: 1, title: 'SW1 Gi0/1', device: 'SW1', instruction: 'Set Gi0/1 to trunk and add to channel-group 1 mode active.',
      expectedCommands: ['interface gi0/1', 'switchport mode trunk', 'channel-group 1 mode active'] },
    { id: 't2', order: 2, title: 'SW1 Gi0/2', device: 'SW1', instruction: 'Repeat on Gi0/2 for the second member link.',
      expectedCommands: ['interface gi0/2', 'channel-group 1 mode active'] },
    { id: 't3', order: 3, title: 'SW2 Gi0/1', device: 'SW2', instruction: 'Configure matching trunk + channel-group on SW2 Gi0/1.',
      expectedCommands: ['interface gi0/1', 'switchport mode trunk', 'channel-group 1 mode active'] },
    { id: 't4', order: 4, title: 'SW2 Gi0/2', device: 'SW2', instruction: 'Add Gi0/2 to the same channel-group on SW2.',
      expectedCommands: ['interface gi0/2', 'channel-group 1 mode active'] },
    { id: 't5', order: 5, title: 'Verify', device: 'SW1', instruction: 'Confirm Port-channel 1 is up with two active member ports.',
      expectedCommands: ['show etherchannel summary'] },
  ],
  verificationCommands: ['show etherchannel summary', 'show interfaces port-channel 1'],
  successCriteria: ['Po1 shows (SU) — bundled and in use', 'Two ports listed as active members'],
  failureCriteria: ['Mode mismatch (active vs passive on both sides may not form)', 'One side access, other trunk'],
  commonMistakes: ['Configuring channel-group on only one link', 'Mismatched channel-group number'],
  source: { name: LAB_SOURCES.blueprint, chapter: '2.4 EtherChannel', confidence: 0.9 },
  metadata: { version: '1', status: 'validated', confidence: 0.9 },
}
const TOPO_EC = { id: 'TOPO-EC', title: 'EtherChannel topology', objectiveId: '2.4',
  nodes: [{ id: 'sw1', label: 'SW1', type: 'switch', x: 30, y: 50 }, { id: 'sw2', label: 'SW2', type: 'switch', x: 70, y: 50 }],
  links: [{ id: 'l1', source: 'sw1', target: 'sw2', label: 'Gi0/1 Po1', status: 'forwarding' }, { id: 'l2', source: 'sw1', target: 'sw2', label: 'Gi0/2 Po1', status: 'forwarding' }] }
const VALIDATOR_EC = { labId: 'LAB-ETHERCHANNEL', requiredCommands: [
  { device: 'SW1', command: 'channel-group 1 mode active' }, { device: 'SW2', command: 'channel-group 1 mode active' },
], verificationChecks: [{ id: 'v1', device: 'SW1', command: 'show etherchannel summary', expectedResult: 'Po1 up with 2 ports', passCondition: 'bundle up' }] }
const ETHERCHANNEL = { lab: LAB_EC, topology: TOPO_EC, validator: VALIDATOR_EC,
  diagram: mkDiagram('DIAG-EC', 'Two links bundled', '2.4',
    [{ id: 'sw1', label: 'SW1 Po1', type: 'switch', x: 30, y: 50 }, { id: 'sw2', label: 'SW2 Po1', type: 'switch', x: 70, y: 50 }],
    [{ id: 'd1', source: 'sw1', target: 'sw2', label: 'LACP', status: 'forwarding' }]),
  packetFlows: mkFlows('FLOW-EC', 'Load shared across members', 'DIAG-EC', ['CKU-ETHERCHANNEL'], [
    { id: 's1', order: 1, title: 'Bundle', action: 'LACP negotiates Po1 across Gi0/1 and Gi0/2', successState: 'matched' },
  ]) }

/* ---- STP (2.5) ---- */
const LAB_STP = {
  id: 'LAB-STP-ROOT',
  title: 'Influence STP Root Bridge Election',
  domainId: 'access',
  objectiveId: '2.5',
  ckuIds: ['CKU-STP'],
  labType: 'guided',
  difficulty: 'beginner',
  estimatedTimeMinutes: 12,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'Three switches form a triangle. SW1 should become the root bridge for VLAN 1. Lower priority wins — set SW1 as primary root.',
  learningGoals: ['Use spanning-tree vlan root primary', 'Interpret show spanning-tree root'],
  topologyId: 'TOPO-STP',
  prerequisites: ['CKU-VLAN'],
  tasks: [
    { id: 't1', order: 1, title: 'Make SW1 root', device: 'SW1', instruction: 'Set SW1 as the primary root bridge for VLAN 1.',
      expectedCommands: ['spanning-tree vlan 1 root primary'] },
    { id: 't2', order: 2, title: 'Verify root on SW1', device: 'SW1', instruction: 'Confirm SW1 shows as the root bridge for VLAN 1.',
      expectedCommands: ['show spanning-tree vlan 1'] },
    { id: 't3', order: 3, title: 'Verify SW2 sees SW1 as root', device: 'SW2', instruction: 'On SW2, verify the root ID points to SW1.',
      expectedCommands: ['show spanning-tree root'] },
  ],
  verificationCommands: ['show spanning-tree vlan 1', 'show spanning-tree root'],
  successCriteria: ['SW1 Bridge ID is root for VLAN 1', 'SW2/ SW3 list SW1 as root'],
  failureCriteria: ['Root not set — lowest MAC may win unpredictably'],
  commonMistakes: ['Confusing port priority with bridge priority', 'Setting root on wrong VLAN'],
  source: { name: LAB_SOURCES.blueprint, chapter: '2.5 STP', confidence: 0.85 },
  metadata: { version: '1', status: 'validated', confidence: 0.85 },
}
const TOPO_STP = { id: 'TOPO-STP', title: 'STP triangle', objectiveId: '2.5',
  nodes: [{ id: 'sw1', label: 'SW1 (root)', type: 'switch', x: 50, y: 20 }, { id: 'sw2', label: 'SW2', type: 'switch', x: 20, y: 75 }, { id: 'sw3', label: 'SW3', type: 'switch', x: 80, y: 75 }],
  links: [{ id: 'l1', source: 'sw1', target: 'sw2', status: 'forwarding' }, { id: 'l2', source: 'sw1', target: 'sw3', status: 'forwarding' }, { id: 'l3', source: 'sw2', target: 'sw3', status: 'blocked' }] }
const VALIDATOR_STP = { labId: 'LAB-STP-ROOT', requiredCommands: [
  { device: 'SW1', command: 'spanning-tree vlan 1 root primary' },
], verificationChecks: [{ id: 'v1', device: 'SW1', command: 'show spanning-tree vlan 1', expectedResult: 'This bridge is the root', passCondition: 'root' }] }
const STP = { lab: LAB_STP, topology: TOPO_STP, validator: VALIDATOR_STP,
  diagram: mkDiagram('DIAG-STP', 'Root bridge election', '2.5',
    [{ id: 'root', label: 'SW1 Root', type: 'switch', x: 50, y: 25, status: 'highlighted' }, { id: 'sw2', label: 'SW2', type: 'switch', x: 25, y: 70 }, { id: 'sw3', label: 'SW3', type: 'switch', x: 75, y: 70 }],
    [{ id: 'd1', source: 'root', target: 'sw2', status: 'forwarding' }, { id: 'd2', source: 'sw2', target: 'sw3', label: 'blocking', status: 'blocked' }]),
  packetFlows: mkFlows('FLOW-STP', 'Root elected, blocking port chosen', 'DIAG-STP', ['CKU-STP'], [
    { id: 's1', order: 1, title: 'Election', action: 'Lowest bridge priority/MAC becomes root', successState: 'matched' },
  ]) }

/* ---- Device access (5.3) ---- */
const LAB_ACCESS = {
  id: 'LAB-DEVICE-ACCESS',
  title: 'Harden Device Access (Console and Enable)',
  domainId: 'security',
  objectiveId: '5.3',
  ckuIds: ['CKU-ENABLE-SECRET', 'CKU-LOCAL-AUTH'],
  labType: 'guided',
  difficulty: 'beginner',
  estimatedTimeMinutes: 10,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'Secure R1: set encrypted enable secret, create a local admin user, and require local login on the console line.',
  learningGoals: ['enable secret vs enable password', 'username privilege 15 secret', 'login local on line con 0'],
  topologyId: 'TOPO-ACCESS',
  prerequisites: [],
  tasks: [
    { id: 't1', order: 1, title: 'Enable secret', device: 'R1', instruction: 'Set the enable secret to ciscoenable (encrypted).',
      expectedCommands: ['enable secret ciscoenable'] },
    { id: 't2', order: 2, title: 'Local user', device: 'R1', instruction: 'Create username admin privilege 15 secret adminpass.',
      expectedCommands: ['username admin privilege 15 secret adminpass'] },
    { id: 't3', order: 3, title: 'Console login', device: 'R1', instruction: 'On line con 0, require login local.',
      expectedCommands: ['line con 0', 'login local'] },
    { id: 't4', order: 4, title: 'Verify config', device: 'R1', instruction: 'Review the running config for login settings.',
      expectedCommands: ['show running-config | section username'] },
  ],
  verificationCommands: ['show running-config | section line con', 'show running-config | include enable'],
  successCriteria: ['enable secret present (not cleartext password)', 'Console uses login local'],
  failureCriteria: ['Plaintext enable password only — insecure'],
  commonMistakes: ['Using enable password instead of enable secret', 'login without local when using username'],
  source: { name: LAB_SOURCES.blueprint, chapter: '5.3 Device access', confidence: 0.9 },
  metadata: { version: '1', status: 'validated', confidence: 0.9 },
}
const TOPO_ACCESS = { id: 'TOPO-ACCESS', title: 'Console access', objectiveId: '5.3',
  nodes: [{ id: 'pc', label: 'Console', type: 'pc', x: 30, y: 50 }, { id: 'r1', label: 'R1', type: 'router', x: 70, y: 50 }],
  links: [{ id: 'l1', source: 'pc', target: 'r1', label: 'console', status: 'forwarding' }] }
const VALIDATOR_ACCESS = { labId: 'LAB-DEVICE-ACCESS', requiredCommands: [
  { device: 'R1', command: 'enable secret ciscoenable' }, { device: 'R1', command: 'username admin privilege 15 secret adminpass' }, { device: 'R1', command: 'login local' },
], verificationChecks: [{ id: 'v1', device: 'R1', command: 'show running-config | section line con', expectedResult: 'login local', passCondition: 'secured' }] }
const DEVICE_ACCESS = { lab: LAB_ACCESS, topology: TOPO_ACCESS, validator: VALIDATOR_ACCESS,
  diagram: mkDiagram('DIAG-ACCESS', 'Local auth on console', '5.3',
    [{ id: 'user', label: 'admin', type: 'pc', x: 25, y: 50 }, { id: 'r1', label: 'login local', type: 'router', x: 75, y: 50 }],
    [{ id: 'd1', source: 'user', target: 'r1', status: 'forwarding' }]),
  packetFlows: mkFlows('FLOW-ACCESS', 'Local database auth', 'DIAG-ACCESS', ['CKU-LOCAL-AUTH'], [
    { id: 's1', order: 1, title: 'Login', action: 'Console prompts for username/secret', successState: 'matched' },
  ]) }

/* ---- NTP (4.2) ---- */
const LAB_NTP = {
  id: 'LAB-NTP-CLIENT',
  title: 'Configure NTP Client Synchronization',
  domainId: 'services',
  objectiveId: '4.2',
  ckuIds: ['CKU-NTP'],
  labType: 'guided',
  difficulty: 'beginner',
  estimatedTimeMinutes: 10,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'R2 must sync its clock to NTP server 203.0.113.1 (simulated upstream). Configure the client and verify synchronized status.',
  learningGoals: ['ntp server command', 'show ntp status / associations'],
  topologyId: 'TOPO-NTP',
  prerequisites: [],
  tasks: [
    { id: 't1', order: 1, title: 'NTP server reference', device: 'R2', instruction: 'Point R2 at NTP server 203.0.113.1.',
      expectedCommands: ['ntp server 203.0.113.1'] },
    { id: 't2', order: 2, title: 'Verify sync', device: 'R2', instruction: 'Check that clock is synchronized.',
      expectedCommands: ['show ntp status'] },
    { id: 't3', order: 3, title: 'Check associations', device: 'R2', instruction: 'View NTP peer associations.',
      expectedCommands: ['show ntp associations'] },
  ],
  verificationCommands: ['show ntp status', 'show ntp associations'],
  successCriteria: ['Clock is synchronized to 203.0.113.1', 'Stratum is reasonable (not 16 unsynchronized)'],
  failureCriteria: ['No route to server — stays unsynchronized'],
  commonMistakes: ['Expecting sync immediately in lab sim — may take a minute', 'Wrong server IP'],
  source: { name: LAB_SOURCES.blueprint, chapter: '4.2 NTP', confidence: 0.85 },
  metadata: { version: '1', status: 'validated', confidence: 0.85 },
}
const TOPO_NTP = { id: 'TOPO-NTP', title: 'NTP client', objectiveId: '4.2',
  nodes: [{ id: 'r2', label: 'R2 client', type: 'router', x: 35, y: 50 }, { id: 'srv', label: 'NTP 203.0.113.1', type: 'server', x: 75, y: 50 }],
  links: [{ id: 'l1', source: 'r2', target: 'srv', label: 'UDP/123', status: 'forwarding' }] }
const VALIDATOR_NTP = { labId: 'LAB-NTP-CLIENT', requiredCommands: [{ device: 'R2', command: 'ntp server 203.0.113.1' }],
  verificationChecks: [{ id: 'v1', device: 'R2', command: 'show ntp status', expectedResult: 'Clock is synchronized', passCondition: 'synced' }] }
const NTP = { lab: LAB_NTP, topology: TOPO_NTP, validator: VALIDATOR_NTP,
  diagram: mkDiagram('DIAG-NTP', 'Client syncs to server', '4.2',
    [{ id: 'r2', label: 'R2', type: 'router', x: 30, y: 50 }, { id: 'ntp', label: 'Stratum source', type: 'server', x: 70, y: 50 }],
    [{ id: 'd1', source: 'r2', target: 'ntp', status: 'forwarding' }]),
  packetFlows: mkFlows('FLOW-NTP', 'Clock sync', 'DIAG-NTP', ['CKU-NTP'], [
    { id: 's1', order: 1, title: 'Sync', action: 'R2 adjusts clock to server stratum', successState: 'matched' },
  ]) }

/* ---- AAA local (5.4) ---- */
const LAB_AAA = {
  id: 'LAB-AAA-LOCAL',
  title: 'Configure Local AAA Authentication',
  domainId: 'security',
  objectiveId: '5.4',
  ckuIds: ['CKU-AAA'],
  labType: 'guided',
  difficulty: 'intermediate',
  estimatedTimeMinutes: 12,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'Enable AAA new-model on R1 and use the local database for VTY login authentication (simplified alternative to TACACS+ when no server is available).',
  learningGoals: ['aaa new-model', 'aaa authentication login default local', 'Contrast with TACACS+ for centralized auth'],
  topologyId: 'TOPO-AAA',
  prerequisites: ['CKU-LOCAL-AUTH'],
  tasks: [
    { id: 't1', order: 1, title: 'Local user', device: 'R1', instruction: 'Create user netadmin privilege 15 secret NetPass123.',
      expectedCommands: ['username netadmin privilege 15 secret NetPass123'] },
    { id: 't2', order: 2, title: 'Enable AAA', device: 'R1', instruction: 'Enable AAA new model.',
      expectedCommands: ['aaa new-model'] },
    { id: 't3', order: 3, title: 'Login method list', device: 'R1', instruction: 'Set default login authentication to use the local database.',
      expectedCommands: ['aaa authentication login default local'] },
    { id: 't4', order: 4, title: 'VTY login', device: 'R1', instruction: 'Apply login authentication on VTY lines 0-4.',
      expectedCommands: ['line vty 0 4', 'login authentication default'] },
    { id: 't5', order: 5, title: 'Verify', device: 'R1', instruction: 'Show AAA configuration.',
      expectedCommands: ['show aaa user all'] },
  ],
  verificationCommands: ['show run | section aaa', 'show aaa user all'],
  successCriteria: ['AAA enabled', 'VTY uses login authentication default', 'Local user can authenticate'],
  failureCriteria: ['aaa new-model without login list — VTY may break'],
  commonMistakes: ['Forgetting username before switching to aaa authentication login default local'],
  source: { name: LAB_SOURCES.blueprint, chapter: '5.4 AAA', confidence: 0.85 },
  metadata: { version: '1', status: 'validated', confidence: 0.85 },
}
const TOPO_AAA = { id: 'TOPO-AAA', title: 'AAA local auth', objectiveId: '5.4',
  nodes: [{ id: 'pc', label: 'Admin PC', type: 'pc', x: 25, y: 50 }, { id: 'r1', label: 'R1 AAA local', type: 'router', x: 75, y: 50 }],
  links: [{ id: 'l1', source: 'pc', target: 'r1', status: 'forwarding' }] }
const VALIDATOR_AAA = { labId: 'LAB-AAA-LOCAL', requiredCommands: [
  { device: 'R1', command: 'aaa new-model' }, { device: 'R1', command: 'aaa authentication login default local' }, { device: 'R1', command: 'login authentication default' },
], verificationChecks: [{ id: 'v1', device: 'R1', command: 'show run | section aaa', expectedResult: 'aaa authentication login default local', passCondition: 'aaa on' }] }
const AAA = { lab: LAB_AAA, topology: TOPO_AAA, validator: VALIDATOR_AAA,
  diagram: mkDiagram('DIAG-AAA', 'Local AAA method list', '5.4',
    [{ id: 'pc', label: 'VTY login', type: 'pc', x: 25, y: 50 }, { id: 'aaa', label: 'default local', type: 'process', x: 55, y: 50 }, { id: 'r1', label: 'R1', type: 'router', x: 85, y: 50 }],
    [{ id: 'd1', source: 'pc', target: 'aaa', status: 'forwarding' }, { id: 'd2', source: 'aaa', target: 'r1', status: 'forwarding' }]),
  packetFlows: mkFlows('FLOW-AAA', 'VTY auth via local DB', 'DIAG-AAA', ['CKU-AAA'], [
    { id: 's1', order: 1, title: 'Auth', action: 'AAA delegates to local username database', successState: 'matched' },
  ]) }

/* ---- Syslog (4.5) ---- */
const LAB_SYSLOG = {
  id: 'LAB-SYSLOG-REMOTE',
  title: 'Configure Remote Syslog Logging',
  domainId: 'services',
  objectiveId: '4.5',
  ckuIds: ['CKU-SYSLOG'],
  labType: 'guided',
  difficulty: 'beginner',
  estimatedTimeMinutes: 10,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'supplemental',
  scenario: 'Send R1 logs to a syslog server at 192.168.1.100. Set logging trap informational and add a descriptive hostname for log clarity.',
  learningGoals: ['logging host', 'logging trap level', 'service timestamps log datetime msec'],
  topologyId: 'TOPO-SYSLOG',
  prerequisites: [],
  tasks: [
    { id: 't1', order: 1, title: 'Hostname', device: 'R1', instruction: 'Set hostname R1-CORE for identifiable logs.',
      expectedCommands: ['hostname R1-CORE'] },
    { id: 't2', order: 2, title: 'Timestamps', device: 'R1', instruction: 'Enable datetime timestamps on log messages.',
      expectedCommands: ['service timestamps log datetime msec'] },
    { id: 't3', order: 3, title: 'Syslog server', device: 'R1', instruction: 'Send logs to 192.168.1.100.',
      expectedCommands: ['logging host 192.168.1.100'] },
    { id: 't4', order: 4, title: 'Trap level', device: 'R1', instruction: 'Set trap level to informational (level 6).',
      expectedCommands: ['logging trap informational'] },
    { id: 't5', order: 5, title: 'Verify', device: 'R1', instruction: 'Confirm logging host is configured.',
      expectedCommands: ['show logging'] },
  ],
  verificationCommands: ['show logging'],
  successCriteria: ['logging host 192.168.1.100 present', 'Trap level informational'],
  failureCriteria: ['No logging host — logs stay console-only'],
  commonMistakes: ['Confusing logging console vs logging host', 'Trap level too restrictive (errors only)'],
  source: { name: LAB_SOURCES.blueprint, chapter: '4.5 Syslog', confidence: 0.85 },
  metadata: { version: '1', status: 'validated', confidence: 0.85 },
}
const TOPO_SYSLOG = { id: 'TOPO-SYSLOG', title: 'Remote syslog', objectiveId: '4.5',
  nodes: [{ id: 'r1', label: 'R1-CORE', type: 'router', x: 30, y: 50 }, { id: 'sys', label: 'Syslog .100', type: 'server', x: 75, y: 50 }],
  links: [{ id: 'l1', source: 'r1', target: 'sys', label: 'UDP/514', status: 'forwarding' }] }
const VALIDATOR_SYSLOG = { labId: 'LAB-SYSLOG-REMOTE', requiredCommands: [
  { device: 'R1', command: 'logging host 192.168.1.100' }, { device: 'R1', command: 'logging trap informational' },
], verificationChecks: [{ id: 'v1', device: 'R1', command: 'show logging', expectedResult: 'Host 192.168.1.100', passCondition: 'remote logging' }] }
const SYSLOG = { lab: LAB_SYSLOG, topology: TOPO_SYSLOG, validator: VALIDATOR_SYSLOG,
  diagram: mkDiagram('DIAG-SYSLOG', 'Logs forwarded to server', '4.5',
    [{ id: 'r1', label: 'R1', type: 'router', x: 30, y: 50 }, { id: 'sys', label: 'Collector', type: 'server', x: 75, y: 50 }],
    [{ id: 'd1', source: 'r1', target: 'sys', status: 'forwarding' }]),
  packetFlows: mkFlows('FLOW-SYSLOG', 'Trap sent to collector', 'DIAG-SYSLOG', ['CKU-SYSLOG'], [
    { id: 's1', order: 1, title: 'Event', action: 'Interface up/down generates syslog trap', successState: 'forwarded' },
  ]) }

/* =========================================================================
   TROUBLESHOOTING SCENARIOS (3.6 + cross-topic)
   ========================================================================= */
function tsLab(id, title, objectiveId, domainId, scenario, tasks, requiredCommands, verify, mistakes) {
  return {
    id, title, domainId, objectiveId, ckuIds: ['CKU-TROUBLESHOOTING'],
    labType: 'troubleshooting', difficulty: 'intermediate', estimatedTimeMinutes: 15,
    tools: ['Packet Tracer', 'GNS3'], examRelevance: 'core', scenario,
    learningGoals: ['Use show commands to isolate fault', 'Apply minimal fix commands'],
    topologyId: `TOPO-${id}`, prerequisites: [],
    tasks, verificationCommands: verify || ['show ip interface brief', 'show running-config'],
    successCriteria: ['Symptom resolved after fix commands entered'],
    failureCriteria: ['Fix applied on wrong interface or wrong direction'],
    commonMistakes: mistakes,
    source: { name: LAB_SOURCES.blueprint, chapter: '3.6 Troubleshooting', confidence: 0.9 },
    metadata: { version: '1', status: 'validated', confidence: 0.9 },
  }
}

const LAB_TS_OSPF = tsLab('LAB-TS-OSPF-AREA', 'Troubleshoot OSPF Area Mismatch', '3.6', 'connectivity',
  'Symptom: R1 and R2 are connected on 10.0.12.0/30 but `show ip ospf neighbor` shows no FULL adjacency. R2 was misconfigured with network 10.0.12.0 in area 1 instead of area 0. Fix R2 so both routers are in area 0.',
  [
    { id: 't1', order: 1, title: 'Gather data', device: 'R2', instruction: 'Run show ip ospf neighbor and show run | section router ospf to find the area mismatch.',
      expectedCommands: ['show ip ospf neighbor', 'show running-config | section router ospf'] },
    { id: 't2', order: 2, title: 'Fix area on R2', device: 'R2', instruction: 'Re-advertise 10.0.12.0/30 into area 0 (not area 1).',
      expectedCommands: ['router ospf 1', 'network 10.0.12.0 0.0.0.3 area 0'] },
    { id: 't3', order: 3, title: 'Verify adjacency', device: 'R1', instruction: 'Confirm FULL neighbor state.',
      expectedCommands: ['show ip ospf neighbor'] },
  ],
  [{ device: 'R2', command: 'network 10.0.12.0 0.0.0.3 area 0' }],
  ['show ip ospf neighbor'],
  ['Wildcard mask off by one bit', 'Network statement in wrong area'])

const LAB_TS_TRUNK = tsLab('LAB-TS-NATIVE-VLAN', 'Troubleshoot Native VLAN Mismatch', '3.6', 'connectivity',
  'Symptom: CDP reports native VLAN mismatch between SW1 and SW2 on the Gi0/1 trunk. SW1 uses native VLAN 1; SW2 was set to native VLAN 99. Align SW2 to VLAN 1.',
  [
    { id: 't1', order: 1, title: 'Inspect CDP', device: 'SW1', instruction: 'Use show cdp neighbors detail to read the native VLAN mismatch warning.',
      expectedCommands: ['show cdp neighbors detail'] },
    { id: 't2', order: 2, title: 'Fix SW2 native VLAN', device: 'SW2', instruction: 'On Gi0/1 trunk, set native VLAN back to 1 to match SW1.',
      expectedCommands: ['interface gi0/1', 'switchport trunk native vlan 1'] },
    { id: 't3', order: 3, title: 'Verify trunk', device: 'SW2', instruction: 'Confirm trunk encapsulation and native VLAN.',
      expectedCommands: ['show interfaces trunk'] },
  ],
  [{ device: 'SW2', command: 'switchport trunk native vlan 1' }],
  ['show interfaces trunk'],
  ['Changing allowed VLAN list instead of native VLAN'])

const LAB_TS_IF = tsLab('LAB-TS-SHUTDOWN-IF', 'Troubleshoot Shutdown Interface', '3.6', 'connectivity',
  'Symptom: PC1 cannot ping its gateway 192.168.1.1 on R1. `show ip interface brief` shows Gi0/0 administratively down. Bring the interface up.',
  [
    { id: 't1', order: 1, title: 'Identify down interface', device: 'R1', instruction: 'Run show ip interface brief — Gi0/0 is administratively down.',
      expectedCommands: ['show ip interface brief'] },
    { id: 't2', order: 2, title: 'Enable interface', device: 'R1', instruction: 'Enter interface Gi0/0 and issue no shutdown.',
      expectedCommands: ['interface gi0/0', 'no shutdown'] },
    { id: 't3', order: 3, title: 'Test connectivity', device: 'PC1', instruction: 'Ping the gateway 192.168.1.1.',
      expectedCommands: ['ping 192.168.1.1'] },
  ],
  [{ device: 'R1', command: 'no shutdown' }],
  ['show ip interface brief'],
  ['Fixing IP address when the issue is simply shutdown'])

const LAB_TS_ACL = tsLab('LAB-TS-ACL-PLACEMENT', 'Troubleshoot ACL Blocking Return Traffic', '3.6', 'security',
  'Symptom: Office PC can initiate ping to server 10.0.0.10 but gets no reply. An extended ACL OFFICE_TO_SERVERS on Gi0/0 IN permits icmp out but has an explicit deny ip any any at the end, blocking return traffic. Add permit ip any any after the icmp permit (before implicit deny) — or replace with permit ip 192.168.1.0 0.0.0.255 10.0.0.0 0.0.0.255.',
  [
    { id: 't1', order: 1, title: 'Inspect ACL hits', device: 'R1', instruction: 'show access-lists — note deny counters incrementing on return traffic.',
      expectedCommands: ['show access-lists'] },
    { id: 't2', order: 2, title: 'Fix ACL', device: 'R1', instruction: 'Inside OFFICE_TO_SERVERS, add: permit ip 192.168.1.0 0.0.0.255 10.0.0.0 0.0.0.255',
      expectedCommands: ['ip access-list extended OFFICE_TO_SERVERS', 'permit ip 192.168.1.0 0.0.0.255 10.0.0.0 0.0.0.255'] },
    { id: 't3', order: 3, title: 'Retest', device: 'PC1', instruction: 'Ping 10.0.0.10 again.',
      expectedCommands: ['ping 10.0.0.10'] },
  ],
  [{ device: 'R1', command: 'permit ip 192.168.1.0 0.0.0.255 10.0.0.0 0.0.0.255' }],
  ['show access-lists'],
  ['Moving ACL to wrong interface instead of fixing entries'])

const LAB_TS_ROUTE = tsLab('LAB-TS-MISSING-ROUTE', 'Troubleshoot Missing Default Route', '3.6', 'connectivity',
  'Symptom: R1 LAN hosts reach local subnets but cannot reach internet 198.51.100.1. R1 has no default route. Add ip route 0.0.0.0 0.0.0.0 203.0.113.1 on R1.',
  [
    { id: 't1', order: 1, title: 'Check routing table', device: 'R1', instruction: 'show ip route — no gateway of last resort.',
      expectedCommands: ['show ip route'] },
    { id: 't2', order: 2, title: 'Add default route', device: 'R1', instruction: 'Point default traffic to ISP next-hop 203.0.113.1.',
      expectedCommands: ['ip route 0.0.0.0 0.0.0.0 203.0.113.1'] },
    { id: 't3', order: 3, title: 'Verify', device: 'PC1', instruction: 'Ping internet host 198.51.100.1.',
      expectedCommands: ['ping 198.51.100.1'] },
  ],
  [{ device: 'R1', command: 'ip route 0.0.0.0 0.0.0.0 203.0.113.1' }],
  ['show ip route'],
  ['Static route to wrong next-hop'])

const LAB_TS_DHCP = tsLab('LAB-TS-DHCP-RELAY', 'Troubleshoot Missing DHCP Relay', '3.6', 'services',
  'Symptom: Remote PCs on R2 Gi0/1 (192.168.10.0/24) never receive DHCP addresses. R1 has a correct pool but R2 is missing helper-address. Add ip helper-address 10.0.0.1 on R2 Gi0/1.',
  [
    { id: 't1', order: 1, title: 'Verify no leases', device: 'R1', instruction: 'show ip dhcp binding — empty for remote subnet.',
      expectedCommands: ['show ip dhcp binding'] },
    { id: 't2', order: 2, title: 'Inspect R2', device: 'R2', instruction: 'show run interface gi0/1 — no helper-address.',
      expectedCommands: ['show running-config interface gi0/1'] },
    { id: 't3', order: 3, title: 'Add relay', device: 'R2', instruction: 'Configure ip helper-address 10.0.0.1 on Gi0/1.',
      expectedCommands: ['interface gi0/1', 'ip helper-address 10.0.0.1'] },
  ],
  [{ device: 'R2', command: 'ip helper-address 10.0.0.1' }],
  ['show ip dhcp binding'],
  ['Helper on server interface instead of client LAN'])

const LAB_TS_HSRP = tsLab('LAB-TS-HSRP-PRIORITY', 'Troubleshoot HSRP Active on Wrong Router', '3.6', 'connectivity',
  'Symptom: R2 (lower priority) is Active and R1 (intended primary) is Standby. R1 is missing preempt. On R1, add standby 1 preempt and standby 1 priority 150.',
  [
    { id: 't1', order: 1, title: 'Check standby roles', device: 'R1', instruction: 'show standby brief — R2 is Active unexpectedly.',
      expectedCommands: ['show standby brief'] },
    { id: 't2', order: 2, title: 'Fix R1 priority/preempt', device: 'R1', instruction: 'Set priority 150 and enable preempt on group 1.',
      expectedCommands: ['interface gi0/0', 'standby 1 priority 150', 'standby 1 preempt'] },
    { id: 't3', order: 3, title: 'Confirm failover', device: 'R1', instruction: 'Verify R1 becomes Active.',
      expectedCommands: ['show standby brief'] },
  ],
  [{ device: 'R1', command: 'standby 1 preempt' }, { device: 'R1', command: 'standby 1 priority 150' }],
  ['show standby brief'],
  ['Changing virtual IP instead of priority/preempt'])

const LAB_TS_MASK = tsLab('LAB-TS-WRONG-MASK', 'Troubleshoot Wrong Subnet Mask', '3.6', 'fundamentals',
  'Symptom: PC1 (192.168.1.10/24) cannot ping gateway 192.168.1.1. R1 Gi0/0 has wrong mask 255.255.255.128 — fix to 255.255.255.0.',
  [
    { id: 't1', order: 1, title: 'Inspect interface', device: 'R1', instruction: 'show ip interface gi0/0 — mask is /25 instead of /24.',
      expectedCommands: ['show ip interface gi0/0'] },
    { id: 't2', order: 2, title: 'Correct mask', device: 'R1', instruction: 'Reconfigure ip address 192.168.1.1 255.255.255.0.',
      expectedCommands: ['interface gi0/0', 'ip address 192.168.1.1 255.255.255.0'] },
    { id: 't3', order: 3, title: 'Test ping', device: 'PC1', instruction: 'Ping 192.168.1.1.',
      expectedCommands: ['ping 192.168.1.1'] },
  ],
  [{ device: 'R1', command: 'ip address 192.168.1.1 255.255.255.0' }],
  ['show ip interface gi0/0'],
  ['Changing PC mask when router mask is wrong'])

function tsBundle(lab, nodes, links, fixCmd) {
  const topo = { id: lab.topologyId, title: lab.title, objectiveId: lab.objectiveId, nodes, links }
  const validator = { labId: lab.id, requiredCommands: fixCmd, verificationChecks: [{ id: 'v1', device: 'R1', command: 'show ip interface brief', expectedResult: 'Symptom cleared', passCondition: 'fixed' }] }
  const diagram = mkDiagram(`DIAG-${lab.id}`, lab.title, lab.objectiveId,
    [{ id: 'bad', label: 'Fault', type: 'process', x: 30, y: 50, status: 'error' }, { id: 'fix', label: 'Fix applied', type: 'process', x: 70, y: 50, status: 'highlighted' }],
    [{ id: 'd1', source: 'bad', target: 'fix', status: 'forwarding' }])
  return { lab, topology: topo, validator: validator, diagram, packetFlows: mkFlows(`FLOW-${lab.id}`, 'Isolate and fix', `DIAG-${lab.id}`, ['CKU-TROUBLESHOOTING'], [
    { id: 's1', order: 1, title: 'Symptom', action: lab.scenario.slice(0, 80), successState: 'failed' },
    { id: 's2', order: 2, title: 'Fix', action: 'Correct command restores expected behavior', successState: 'forwarded' },
  ]) }
}

const TS_OSPF = tsBundle(LAB_TS_OSPF,
  [{ id: 'r1', label: 'R1 area 0', type: 'router', x: 30, y: 50 }, { id: 'r2', label: 'R2 area 1 (wrong)', type: 'router', x: 70, y: 50, status: 'error' }],
  [{ id: 'l1', source: 'r1', target: 'r2', status: 'blocked' }],
  [{ device: 'R2', command: 'network 10.0.12.0 0.0.0.3 area 0' }])

const TS_TRUNK = tsBundle(LAB_TS_TRUNK,
  [{ id: 'sw1', label: 'SW1 native 1', type: 'switch', x: 30, y: 50 }, { id: 'sw2', label: 'SW2 native 99', type: 'switch', x: 70, y: 50, status: 'error' }],
  [{ id: 'l1', source: 'sw1', target: 'sw2', status: 'blocked' }],
  [{ device: 'SW2', command: 'switchport trunk native vlan 1' }])

const TS_IF = tsBundle(LAB_TS_IF,
  [{ id: 'r1', label: 'R1 Gi0/0 down', type: 'router', x: 50, y: 30, status: 'error' }, { id: 'pc', label: 'PC1', type: 'pc', x: 50, y: 75 }],
  [{ id: 'l1', source: 'pc', target: 'r1', status: 'blocked' }],
  [{ device: 'R1', command: 'no shutdown' }])

const TS_ACL = tsBundle(LAB_TS_ACL,
  [{ id: 'pc', label: 'PC', type: 'pc', x: 20, y: 50 }, { id: 'r1', label: 'R1 ACL deny', type: 'router', x: 55, y: 50, status: 'error' }, { id: 'srv', label: 'Server', type: 'server', x: 85, y: 50 }],
  [{ id: 'l1', source: 'pc', target: 'r1', status: 'forwarding' }, { id: 'l2', source: 'r1', target: 'srv', status: 'blocked' }],
  [{ device: 'R1', command: 'permit ip 192.168.1.0 0.0.0.255 10.0.0.0 0.0.0.255' }])

const TS_ROUTE = tsBundle(LAB_TS_ROUTE,
  [{ id: 'r1', label: 'R1 no default', type: 'router', x: 40, y: 50, status: 'error' }, { id: 'isp', label: 'Internet', type: 'cloud', x: 80, y: 50 }],
  [{ id: 'l1', source: 'r1', target: 'isp', status: 'blocked' }],
  [{ device: 'R1', command: 'ip route 0.0.0.0 0.0.0.0 203.0.113.1' }])

const TS_DHCP = tsBundle(LAB_TS_DHCP,
  [{ id: 'r1', label: 'R1 DHCP server', type: 'router', x: 20, y: 50 }, { id: 'r2', label: 'R2 no relay', type: 'router', x: 55, y: 50, status: 'error' }, { id: 'pc', label: 'PC no IP', type: 'pc', x: 85, y: 50 }],
  [{ id: 'l1', source: 'r1', target: 'r2', status: 'forwarding' }, { id: 'l2', source: 'r2', target: 'pc', status: 'blocked' }],
  [{ device: 'R2', command: 'ip helper-address 10.0.0.1' }])

const TS_HSRP = tsBundle(LAB_TS_HSRP,
  [{ id: 'r1', label: 'R1 Standby', type: 'router', x: 30, y: 50 }, { id: 'r2', label: 'R2 Active', type: 'router', x: 70, y: 50, status: 'highlighted' }],
  [{ id: 'l1', source: 'r1', target: 'r2', label: 'VIP .1', status: 'forwarding' }],
  [{ device: 'R1', command: 'standby 1 preempt' }, { device: 'R1', command: 'standby 1 priority 150' }])

const TS_MASK = tsBundle(LAB_TS_MASK,
  [{ id: 'r1', label: 'R1 /25 wrong', type: 'router', x: 55, y: 40, status: 'error' }, { id: 'pc', label: 'PC /24', type: 'pc', x: 55, y: 75 }],
  [{ id: 'l1', source: 'pc', target: 'r1', status: 'blocked' }],
  [{ device: 'R1', command: 'ip address 192.168.1.1 255.255.255.0' }])

export const EXTENDED_LAB_BUNDLES = [
  HSRP, DHCP_RELAY, ETHERCHANNEL, STP, DEVICE_ACCESS, NTP, AAA, SYSLOG,
  TS_OSPF, TS_TRUNK, TS_IF, TS_ACL, TS_ROUTE, TS_DHCP, TS_HSRP, TS_MASK,
]
