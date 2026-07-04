/* Extended CCNA labs — guided config gaps + troubleshooting scenarios. */

import { CLI_ROUTE_31_SHOW_OUTPUT, CLI_ROUTE_32_SHOW_OUTPUT, CLI_OSPF_VERIFY_34_SHOW_OUTPUT, CLI_OSPF_ADJ_34_SHOW_OUTPUT, CLI_HSRP_VERIFY_35_SHOW_OUTPUT, CLI_HSRP_GATEWAY_35_SHOW_OUTPUT, CLI_ACL_CONFIG_55_SHOW_OUTPUT, CLI_PORTSEC_56_SHOW_OUTPUT, CLI_NTP_42_SHOW_OUTPUT, CLI_DHCP_POOL_43_SHOW_OUTPUT, CLI_SNMP_44_SHOW_OUTPUT, CLI_SYSLOG_45_SHOW_OUTPUT, CLI_TFTP_49_SHOW_OUTPUT, CLI_STP_25_SHOW_OUTPUT, CLI_ACCESS_53_SHOW_OUTPUT, CLI_SSH_53_SHOW_OUTPUT } from '../lab/cliEngine.js'

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
  interpretOnly: true,
  difficulty: 'intermediate',
  estimatedTimeMinutes: 12,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'R1 and R2 already share a LAN with HSRP group 1 — virtual IP 192.168.1.1, R1 Active (priority 150 + preempt), R2 Standby. Read the pre-loaded Gi0/0 config and verify roles without changing configuration.',
  learningGoals: ['Read standby ip, priority, and preempt in running-config', 'Confirm Active/Standby from show standby brief', 'Explain virtual IP vs physical interface address'],
  topologyId: 'TOPO-HSRP',
  prerequisites: ['CKU-IP-ADDRESSING'],
  tasks: [
    { id: 't1', order: 1, title: 'Read HSRP config on R1', device: 'R1', instruction: 'Run show running-config | section interface gi0/0 — find standby 1 ip 192.168.1.1, priority 150, and preempt.',
      expectedCommands: ['show running-config | section interface gi0/0'] },
    { id: 't2', order: 2, title: 'Verify Active role', device: 'R1', instruction: 'Run show standby brief — R1 Gi0/0 group 1 should be Active with virtual IP 192.168.1.1.',
      expectedCommands: ['show standby brief'] },
    { id: 't3', order: 3, title: 'Preempt and priority', device: 'R1', instruction: 'Run show standby — confirm priority 150, preempt enabled, and Standby router 192.168.1.3.',
      expectedCommands: ['show standby'] },
  ],
  verificationCommands: ['show running-config | section interface gi0/0', 'show standby brief', 'show standby'],
  successCriteria: ['running-config shows standby 1 ip, priority 150, preempt on R1 Gi0/0', 'R1 shows Active state for group 1', 'Virtual IP 192.168.1.1 matches config and brief output'],
  failureCriteria: ['Missing preempt on R1 — R1 may not reclaim Active after recovery', 'Mismatched group or virtual IP between routers'],
  commonMistakes: ['Forgetting preempt on the higher-priority router', 'Different standby group numbers on each router', 'Virtual IP not in the same subnet as physical interfaces'],
  source: { name: LAB_SOURCES.blueprint, chapter: '3.5 HSRP', confidence: 0.9 },
  metadata: { version: '1', status: 'validated', confidence: 0.9 },
  cliShowOutput: CLI_HSRP_GATEWAY_35_SHOW_OUTPUT,
}
const TOPO_HSRP = { id: 'TOPO-HSRP', title: 'HSRP dual-router LAN', objectiveId: '3.5',
  nodes: [{ id: 'r1', label: 'R1 Active .2', type: 'router', x: 30, y: 40 }, { id: 'r2', label: 'R2 Standby .3', type: 'router', x: 70, y: 40 }, { id: 'pc', label: 'LAN hosts GW .1', type: 'pc', x: 50, y: 80 }],
  links: [{ id: 'l1', source: 'r1', target: 'pc', label: 'Gi0/0', status: 'forwarding' }, { id: 'l2', source: 'r2', target: 'pc', label: 'Gi0/0', status: 'forwarding' }] }
const VALIDATOR_HSRP = { labId: 'LAB-HSRP-GATEWAY', requiredCommands: [
  { device: 'R1', command: 'show running-config | section interface gi0/0' },
  { device: 'R1', command: 'show standby brief' },
  { device: 'R1', command: 'show standby' },
], verificationChecks: [{ id: 'v1', device: 'R1', command: 'show standby brief', expectedResult: 'R1 Active, virtual IP 192.168.1.1', passCondition: 'roles correct' }] }
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

/* ---- DHCP snooping (2.7) ---- */
const LAB_DHCP_SNOOP = {
  id: 'LAB-DHCP-SNOOP-27',
  title: 'Enable DHCP Snooping on Access Switch',
  domainId: 'access',
  objectiveId: '2.7',
  ckuIds: ['CKU-DHCP-SNOOPING'],
  labType: 'guided',
  difficulty: 'intermediate',
  estimatedTimeMinutes: 12,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'SW1 connects trusted uplink Gi0/1 to the distribution switch and untrusted access ports. Enable DHCP snooping globally, trust the uplink, and verify bindings.',
  learningGoals: ['Enable ip dhcp snooping', 'Mark trusted vs untrusted ports', 'Verify bindings with show ip dhcp snooping'],
  topologyId: 'TOPO-DHCP-SNOOP',
  prerequisites: ['CKU-VLAN-BASIC'],
  tasks: [
    { id: 't1', order: 1, title: 'Enable globally', device: 'SW1', instruction: 'Turn on DHCP snooping for the switch.',
      expectedCommands: ['ip dhcp snooping'] },
    { id: 't2', order: 2, title: 'Trust uplink', device: 'SW1', instruction: 'On Gi0/1 (uplink), configure as trusted.',
      expectedCommands: ['interface gi0/1', 'ip dhcp snooping trust'] },
    { id: 't3', order: 3, title: 'Verify', device: 'SW1', instruction: 'Confirm snooping is active and uplink is trusted.',
      expectedCommands: ['show ip dhcp snooping'] },
  ],
  verificationCommands: ['show ip dhcp snooping', 'show ip dhcp snooping binding'],
  successCriteria: ['DHCP snooping enabled', 'Uplink Gi0/1 trusted', 'Rogue server offers blocked on access ports'],
  failureCriteria: ['Trusting access ports allows rogue DHCP', 'Snooping not enabled globally'],
  commonMistakes: ['Trusting user access ports', 'Forgetting global ip dhcp snooping', 'Not enabling snooping on the client VLAN'],
  source: { name: LAB_SOURCES.blueprint, chapter: '2.7 DHCP snooping', confidence: 0.9 },
  metadata: { version: '1', status: 'validated', confidence: 0.9 },
}
const TOPO_DHCP_SNOOP = { id: 'TOPO-DHCP-SNOOP', title: 'DHCP snooping access', objectiveId: '2.7',
  nodes: [{ id: 'dist', label: 'Dist switch', type: 'switch', x: 50, y: 20 }, { id: 'sw1', label: 'SW1 access', type: 'switch', x: 50, y: 55 }, { id: 'pc', label: 'Client', type: 'pc', x: 50, y: 85 }],
  links: [{ id: 'l1', source: 'dist', target: 'sw1', label: 'trusted uplink', status: 'forwarding' }, { id: 'l2', source: 'sw1', target: 'pc', label: 'untrusted', status: 'forwarding' }] }
const VALIDATOR_DHCP_SNOOP = { labId: 'LAB-DHCP-SNOOP-27', requiredCommands: [
  { device: 'SW1', command: 'ip dhcp snooping' }, { device: 'SW1', command: 'ip dhcp snooping trust' },
], verificationChecks: [{ id: 'v1', device: 'SW1', command: 'show ip dhcp snooping', expectedResult: 'DHCP snooping is enabled', passCondition: 'enabled' }] }
const DHCP_SNOOP_27 = { lab: LAB_DHCP_SNOOP, topology: TOPO_DHCP_SNOOP, validator: VALIDATOR_DHCP_SNOOP,
  diagram: mkDiagram('DIAG-DHCP-SNOOP', 'Trusted uplink vs untrusted access', '2.7',
    [{ id: 'srv', label: 'Legit DHCP', type: 'server', x: 50, y: 15 }, { id: 'sw', label: 'SW1 snooping', type: 'switch', x: 50, y: 50, status: 'highlighted' }, { id: 'rogue', label: 'Rogue DHCP', type: 'pc', x: 20, y: 80, status: 'error' }],
    [{ id: 'd1', source: 'srv', target: 'sw', status: 'forwarding' }, { id: 'd2', source: 'rogue', target: 'sw', label: 'blocked', status: 'blocked' }]),
  packetFlows: mkFlows('FLOW-DHCP-SNOOP', 'Snooping filters rogue offers', 'DIAG-DHCP-SNOOP', ['CKU-DHCP-SNOOPING'], [
    { id: 's1', order: 1, title: 'Enable', action: 'Global ip dhcp snooping + trusted uplink', successState: 'matched' },
    { id: 's2', order: 2, title: 'Block', action: 'DHCP server messages on untrusted ports dropped', successState: 'blocked' },
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
  interpretOnly: true,
  difficulty: 'beginner',
  estimatedTimeMinutes: 8,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'SW1 is pre-configured as the primary root bridge for VLAN 1 in a three-switch triangle. Read the spanning-tree config and verify root election without changing configuration.',
  learningGoals: [
    'Read spanning-tree vlan 1 root primary in running-config',
    'Confirm This bridge is the root on SW1',
    'Verify SW2 lists SW1 as the root bridge ID',
  ],
  topologyId: 'TOPO-STP',
  prerequisites: ['CKU-VLAN'],
  tasks: [
    { id: 't1', order: 1, title: 'Read root config', device: 'SW1', instruction: 'Run show running-config | include spanning-tree — find vlan 1 root primary on SW1.',
      expectedCommands: ['show running-config | include spanning-tree'] },
    { id: 't2', order: 2, title: 'Verify root on SW1', device: 'SW1', instruction: 'Run show spanning-tree vlan 1 — confirm This bridge is the root.',
      expectedCommands: ['show spanning-tree vlan 1'] },
    { id: 't3', order: 3, title: 'Root ID summary', device: 'SW1', instruction: 'Run show spanning-tree root — review root bridge ID and cost for VLAN 1.',
      expectedCommands: ['show spanning-tree root'] },
  ],
  verificationCommands: ['show spanning-tree vlan 1', 'show spanning-tree root'],
  successCriteria: ['SW1 Bridge ID is root for VLAN 1', 'SW2/ SW3 list SW1 as root'],
  failureCriteria: ['Root not set — lowest MAC may win unpredictably'],
  commonMistakes: ['Confusing port priority with bridge priority', 'Setting root on wrong VLAN'],
  source: { name: LAB_SOURCES.blueprint, chapter: '2.5 STP', confidence: 0.85 },
  metadata: { version: '1', status: 'validated', confidence: 0.85 },
  cliShowOutput: CLI_STP_25_SHOW_OUTPUT,
}
const TOPO_STP = { id: 'TOPO-STP', title: 'STP triangle', objectiveId: '2.5',
  nodes: [{ id: 'sw1', label: 'SW1 (root)', type: 'switch', x: 50, y: 20 }, { id: 'sw2', label: 'SW2', type: 'switch', x: 20, y: 75 }, { id: 'sw3', label: 'SW3', type: 'switch', x: 80, y: 75 }],
  links: [{ id: 'l1', source: 'sw1', target: 'sw2', status: 'forwarding' }, { id: 'l2', source: 'sw1', target: 'sw3', status: 'forwarding' }, { id: 'l3', source: 'sw2', target: 'sw3', status: 'blocked' }] }
const VALIDATOR_STP = { labId: 'LAB-STP-ROOT', requiredCommands: [
  { device: 'SW1', command: 'show running-config | include spanning-tree' },
  { device: 'SW1', command: 'show spanning-tree vlan 1' },
  { device: 'SW1', command: 'show spanning-tree root' },
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
  interpretOnly: true,
  difficulty: 'beginner',
  estimatedTimeMinutes: 8,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'R1 is pre-configured with encrypted enable secret, local user admin, and login local on the console line. Read and verify the access-control settings.',
  learningGoals: [
    'Confirm enable secret (not cleartext password) in running-config',
    'Verify username admin privilege 15 with secret',
    'Confirm login local on line con 0',
  ],
  topologyId: 'TOPO-ACCESS',
  prerequisites: [],
  tasks: [
    { id: 't1', order: 1, title: 'Local user database', device: 'R1', instruction: 'Run show running-config | section username — find admin privilege 15 secret.',
      expectedCommands: ['show running-config | section username'] },
    { id: 't2', order: 2, title: 'Console login method', device: 'R1', instruction: 'Run show running-config | section line con — confirm login local.',
      expectedCommands: ['show running-config | section line con'] },
    { id: 't3', order: 3, title: 'Enable protection', device: 'R1', instruction: 'Run show running-config | include enable — confirm enable secret is configured.',
      expectedCommands: ['show running-config | include enable'] },
  ],
  verificationCommands: ['show running-config | section line con', 'show running-config | include enable'],
  successCriteria: ['enable secret present (not cleartext password)', 'Console uses login local'],
  failureCriteria: ['Plaintext enable password only — insecure'],
  commonMistakes: ['Using enable password instead of enable secret', 'login without local when using username'],
  source: { name: LAB_SOURCES.blueprint, chapter: '5.3 Device access', confidence: 0.9 },
  metadata: { version: '1', status: 'validated', confidence: 0.9 },
  cliShowOutput: CLI_ACCESS_53_SHOW_OUTPUT,
}
const TOPO_ACCESS = { id: 'TOPO-ACCESS', title: 'Console access', objectiveId: '5.3',
  nodes: [{ id: 'pc', label: 'Console', type: 'pc', x: 30, y: 50 }, { id: 'r1', label: 'R1', type: 'router', x: 70, y: 50 }],
  links: [{ id: 'l1', source: 'pc', target: 'r1', label: 'console', status: 'forwarding' }] }
const VALIDATOR_ACCESS = { labId: 'LAB-DEVICE-ACCESS', requiredCommands: [
  { device: 'R1', command: 'show running-config | section username' },
  { device: 'R1', command: 'show running-config | section line con' },
  { device: 'R1', command: 'show running-config | include enable' },
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
  interpretOnly: true,
  difficulty: 'beginner',
  estimatedTimeMinutes: 8,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'R2 is pre-configured as an NTP client pointing at server 203.0.113.1. Verify clock synchronization and peer associations without changing configuration.',
  learningGoals: [
    'Read ntp server reference in running-config',
    'Confirm Clock is synchronized in show ntp status',
    'Interpret stratum and reference in show ntp associations',
  ],
  topologyId: 'TOPO-NTP',
  prerequisites: [],
  tasks: [
    { id: 't1', order: 1, title: 'NTP server config', device: 'R2', instruction: 'Run show running-config | include ntp — find ntp server 203.0.113.1.',
      expectedCommands: ['show running-config | include ntp'] },
    { id: 't2', order: 2, title: 'Sync status', device: 'R2', instruction: 'Run show ntp status — confirm Clock is synchronized and note stratum.',
      expectedCommands: ['show ntp status'] },
    { id: 't3', order: 3, title: 'Peer associations', device: 'R2', instruction: 'Run show ntp associations — verify *~ marks the selected sys.peer.',
      expectedCommands: ['show ntp associations'] },
  ],
  verificationCommands: ['show ntp status', 'show ntp associations'],
  successCriteria: ['Clock is synchronized to 203.0.113.1', 'Stratum is reasonable (not 16 unsynchronized)'],
  failureCriteria: ['No route to server — stays unsynchronized'],
  commonMistakes: ['Expecting sync immediately in lab sim — may take a minute', 'Wrong server IP'],
  source: { name: LAB_SOURCES.blueprint, chapter: '4.2 NTP', confidence: 0.85 },
  metadata: { version: '1', status: 'validated', confidence: 0.85 },
  cliShowOutput: CLI_NTP_42_SHOW_OUTPUT,
}
const TOPO_NTP = { id: 'TOPO-NTP', title: 'NTP client', objectiveId: '4.2',
  nodes: [{ id: 'r2', label: 'R2 client', type: 'router', x: 35, y: 50 }, { id: 'srv', label: 'NTP 203.0.113.1', type: 'server', x: 75, y: 50 }],
  links: [{ id: 'l1', source: 'r2', target: 'srv', label: 'UDP/123', status: 'forwarding' }] }
const VALIDATOR_NTP = { labId: 'LAB-NTP-CLIENT', requiredCommands: [
  { device: 'R2', command: 'show running-config | include ntp' },
  { device: 'R2', command: 'show ntp status' },
  { device: 'R2', command: 'show ntp associations' },
], verificationChecks: [{ id: 'v1', device: 'R2', command: 'show ntp status', expectedResult: 'Clock is synchronized', passCondition: 'synced' }] }
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
  interpretOnly: true,
  difficulty: 'beginner',
  estimatedTimeMinutes: 8,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'supplemental',
  scenario: 'R1 is pre-configured to forward logs to syslog server 192.168.1.100 at informational trap level with datetime timestamps. Verify remote logging without changing configuration.',
  learningGoals: [
    'Read logging host and trap level in running-config',
    'Confirm service timestamps log datetime msec',
    'Verify remote host in show logging',
  ],
  topologyId: 'TOPO-SYSLOG',
  prerequisites: [],
  tasks: [
    { id: 't1', order: 1, title: 'Logging config', device: 'R1', instruction: 'Run show running-config | include logging — find logging host 192.168.1.100 and trap informational.',
      expectedCommands: ['show running-config | include logging'] },
    { id: 't2', order: 2, title: 'Remote logging state', device: 'R1', instruction: 'Run show logging — confirm Logging to 192.168.1.100 udp port 514.',
      expectedCommands: ['show logging'] },
  ],
  verificationCommands: ['show logging'],
  successCriteria: ['logging host 192.168.1.100 present', 'Trap level informational'],
  failureCriteria: ['No logging host — logs stay console-only'],
  commonMistakes: ['Confusing logging console vs logging host', 'Trap level too restrictive (errors only)'],
  source: { name: LAB_SOURCES.blueprint, chapter: '4.5 Syslog', confidence: 0.85 },
  metadata: { version: '1', status: 'validated', confidence: 0.85 },
  cliShowOutput: CLI_SYSLOG_45_SHOW_OUTPUT,
}
const TOPO_SYSLOG = { id: 'TOPO-SYSLOG', title: 'Remote syslog', objectiveId: '4.5',
  nodes: [{ id: 'r1', label: 'R1-CORE', type: 'router', x: 30, y: 50 }, { id: 'sys', label: 'Syslog .100', type: 'server', x: 75, y: 50 }],
  links: [{ id: 'l1', source: 'r1', target: 'sys', label: 'UDP/514', status: 'forwarding' }] }
const VALIDATOR_SYSLOG = { labId: 'LAB-SYSLOG-REMOTE', requiredCommands: [
  { device: 'R1', command: 'show running-config | include logging' },
  { device: 'R1', command: 'show logging' },
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

/* ---- Wireless Architecture (2.6) ---- */
const LAB_WIRELESS_26 = {
  id: 'LAB-WIRELESS-ARCH',
  title: 'Verify WLC and Lightweight AP Deployment',
  domainId: 'access',
  objectiveId: '2.6',
  ckuIds: ['CKU-WLC', 'CKU-AP-MODES'],
  labType: 'guided',
  difficulty: 'beginner',
  estimatedTimeMinutes: 12,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'A Wireless LAN Controller (WLC1) manages three Lightweight APs over CAPWAP tunnels. Read WLC show output to identify AP operational modes, verify client associations, and trace CAPWAP control/data channels. Lightweight APs hold no local config — all policy lives on the WLC.',
  learningGoals: [
    'Distinguish Lightweight (CAPWAP-managed) from Autonomous (standalone IOS) AP operation',
    'Identify CAPWAP control plane (UDP 5246) and data plane (UDP 5247)',
    'Read show ap summary to verify AP join state',
    'Verify wireless client associations with show wireless client summary',
  ],
  topologyId: 'TOPO-WIRELESS-26',
  prerequisites: ['CKU-VLAN'],
  tasks: [
    {
      id: 't1', order: 1,
      title: 'View AP registrations',
      device: 'WLC1',
      instruction: 'Run show ap summary. Confirm all three APs show "Joined" state, their model, IP address, and operating mode (Local). A Lightweight AP in Local mode tunnels all client traffic back to the WLC via CAPWAP — it cannot forward independently.',
      expectedCommands: ['show ap summary'],
    },
    {
      id: 't2', order: 2,
      title: 'Check client associations',
      device: 'WLC1',
      instruction: 'Run show wireless client summary. Note each client MAC, the AP it is associated to, WLAN ID, and 802.11 protocol. The WLC tracks all clients centrally — Lightweight APs relay this information via CAPWAP.',
      expectedCommands: ['show wireless client summary'],
    },
    {
      id: 't3', order: 3,
      title: 'Inspect CAPWAP tunnels',
      device: 'WLC1',
      instruction: 'Run show capwap detail. Verify the control channel (UDP 5246) and data channel (UDP 5247) are UP for each AP. DTLS encrypts control messages; data encryption is optional per WLAN policy.',
      expectedCommands: ['show capwap detail'],
    },
  ],
  verificationCommands: ['show ap summary', 'show wireless client summary', 'show capwap detail'],
  successCriteria: [
    'All APs show Joined state in show ap summary',
    'Client MACs appear with correct AP and WLAN associations',
    'CAPWAP control (UDP 5246) and data (UDP 5247) channels show UP',
  ],
  failureCriteria: [
    'AP shows Discovering — CAPWAP tunnel not established; check IP reachability and that UDP 5246/5247 is not blocked',
    'No clients listed — SSID misconfigured or management VLAN not trunked to AP switch port',
  ],
  commonMistakes: [
    'Confusing Lightweight AP (no local config, CAPWAP-dependent) with Autonomous AP (runs IOS locally)',
    'Thinking CAPWAP uses TCP — control uses UDP 5246, data uses UDP 5247',
    'Expecting AP to operate if WLC is unreachable — Lightweight APs cannot forward without WLC',
  ],
  source: { name: LAB_SOURCES.blueprint, chapter: '2.6 Wireless architectures and AP modes', confidence: 0.9 },
  metadata: { version: '1', status: 'validated', confidence: 0.9 },
}
const TOPO_WIRELESS_26 = {
  id: 'TOPO-WIRELESS-26',
  title: 'WLC + Lightweight AP topology',
  objectiveId: '2.6',
  nodes: [
    { id: 'wlc', label: 'WLC1', type: 'server', x: 50, y: 15 },
    { id: 'sw', label: 'SW1 (trunk)', type: 'switch', x: 50, y: 42 },
    { id: 'ap1', label: 'AP-Floor1\n(Local)', type: 'router', x: 15, y: 75 },
    { id: 'ap2', label: 'AP-Floor2\n(Local)', type: 'router', x: 50, y: 75 },
    { id: 'ap3', label: 'AP-Conf\n(Local)', type: 'router', x: 85, y: 75 },
  ],
  links: [
    { id: 'l1', source: 'wlc', target: 'sw', label: 'mgmt VLAN', status: 'forwarding' },
    { id: 'l2', source: 'sw', target: 'ap1', label: 'CAPWAP', status: 'forwarding' },
    { id: 'l3', source: 'sw', target: 'ap2', label: 'CAPWAP', status: 'forwarding' },
    { id: 'l4', source: 'sw', target: 'ap3', label: 'CAPWAP', status: 'forwarding' },
  ],
}
const VALIDATOR_WIRELESS_26 = {
  labId: 'LAB-WIRELESS-ARCH',
  requiredCommands: [
    { device: 'WLC1', command: 'show ap summary' },
    { device: 'WLC1', command: 'show wireless client summary' },
    { device: 'WLC1', command: 'show capwap detail' },
  ],
  verificationChecks: [
    { id: 'v1', device: 'WLC1', command: 'show ap summary', expectedResult: 'AP-Floor1 Joined', passCondition: 'APs registered' },
    { id: 'v2', device: 'WLC1', command: 'show capwap detail', expectedResult: 'UP', passCondition: 'CAPWAP active' },
  ],
}
const DIAGRAM_WIRELESS_26 = mkDiagram(
  'DIAG-WIRELESS-26',
  'Lightweight AP CAPWAP architecture',
  '2.6',
  [
    { id: 'wlc', label: 'WLC\n(policy, auth)', type: 'server', x: 50, y: 15, status: 'highlighted' },
    { id: 'cap', label: 'CAPWAP\nControl UDP/5246\nData UDP/5247', type: 'process', x: 50, y: 45 },
    { id: 'ap', label: 'Lightweight AP\n(no local config)', type: 'router', x: 20, y: 78 },
    { id: 'client', label: 'Wi-Fi Client', type: 'pc', x: 80, y: 78 },
  ],
  [
    { id: 'd1', source: 'wlc', target: 'cap', status: 'forwarding' },
    { id: 'd2', source: 'cap', target: 'ap', status: 'forwarding' },
    { id: 'd3', source: 'ap', target: 'client', label: '802.11', status: 'forwarding' },
  ],
  [{ id: 'a1', x: 50, y: 93, text: 'Autonomous AP: IOS config lives on AP. Lightweight: config lives on WLC.' }],
)
const WIRELESS_26 = {
  lab: LAB_WIRELESS_26,
  topology: TOPO_WIRELESS_26,
  validator: VALIDATOR_WIRELESS_26,
  diagram: DIAGRAM_WIRELESS_26,
  packetFlows: mkFlows('FLOW-WIRELESS-26', 'Client frames tunneled to WLC', 'DIAG-WIRELESS-26', ['CKU-WLC', 'CKU-AP-MODES'], [
    { id: 's1', order: 1, title: 'Association', action: 'Client sends 802.11 probe/auth/assoc to Lightweight AP', successState: 'forwarded' },
    { id: 's2', order: 2, title: 'CAPWAP encap', action: 'AP wraps client frame in CAPWAP data (UDP 5247) and sends to WLC', successState: 'modified' },
    { id: 's3', order: 3, title: 'WLC policy', action: 'WLC applies VLAN, QoS, and security policy before forwarding to wired network', successState: 'forwarded' },
  ]),
}

/* ---- DHCP and DNS roles (4.3) ---- */
const LAB_DHCP_DNS_43 = {
  id: 'LAB-DHCP-DNS-FLOW',
  title: 'Verify DHCP Negotiation and DNS Resolution',
  domainId: 'ip_services',
  objectiveId: '4.3',
  ckuIds: ['CKU-DHCP', 'CKU-DNS'],
  labType: 'guided',
  difficulty: 'beginner',
  estimatedTimeMinutes: 12,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'R1 acts as DHCP server and DNS forwarder for the 192.168.1.0/24 LAN. Two PCs have already completed the DORA exchange and hold active leases. Read DHCP pool and binding output to verify addresses were assigned correctly, then inspect the host table to confirm DNS name-to-IP mappings.',
  learningGoals: [
    'Read show ip dhcp pool to see pool range, utilization, and lease time',
    'Read show ip dhcp binding to confirm client IP and MAC associations',
    'Read show hosts to verify DNS hostname-to-IP mappings',
    'Trace the four-step DORA exchange: Discover → Offer → Request → Ack',
  ],
  topologyId: 'TOPO-DHCP-DNS-43',
  prerequisites: ['CKU-IP-ADDRESSING'],
  tasks: [
    {
      id: 't1', order: 1,
      title: 'Inspect the DHCP pool configuration',
      device: 'R1',
      instruction: 'Run show ip dhcp pool. Read the pool name, network/mask, default-router, DNS server, and lease time. The "Leased addresses" count shows how many IPs from the pool are currently in use.',
      expectedCommands: ['show ip dhcp pool'],
    },
    {
      id: 't2', order: 2,
      title: 'Review current DHCP bindings',
      device: 'R1',
      instruction: 'Run show ip dhcp binding. Each row maps a client hardware address (MAC) to an assigned IP and lease expiry time. Automatic bindings were created by the DORA handshake; Manual bindings use ip dhcp pool / host.',
      expectedCommands: ['show ip dhcp binding'],
    },
    {
      id: 't3', order: 3,
      title: 'Check the DNS host table',
      device: 'R1',
      instruction: 'Run show hosts. Review cached hostname-to-IP mappings. Entries marked "perm" were statically added with ip host; "temp" entries were learned via DNS lookup. The default domain and name servers used for resolution are also shown.',
      expectedCommands: ['show hosts'],
    },
  ],
  verificationCommands: ['show ip dhcp pool', 'show ip dhcp binding', 'show hosts'],
  successCriteria: [
    'Pool shows correct network and default-router',
    'Two automatic bindings present for LAN clients',
    'show hosts lists at least one hostname mapping',
  ],
  failureCriteria: [
    'Empty binding table — client DHCPDISCOVER never reached the server',
    'Pool shows exhausted — check ip dhcp excluded-address range',
  ],
  commonMistakes: [
    'Omitting ip dhcp excluded-address for the gateway — server may assign the router IP to a client',
    'Expecting show hosts to populate without a name-server or ip host config',
    'Confusing DORA steps: Discover and Request are client broadcasts; Offer and Ack are server replies',
  ],
  source: { name: LAB_SOURCES.blueprint, chapter: '4.3 Explain the role of DHCP and DNS', confidence: 0.9 },
  metadata: { version: '1', status: 'validated', confidence: 0.9 },
}
const TOPO_DHCP_DNS_43 = {
  id: 'TOPO-DHCP-DNS-43',
  title: 'DHCP server and DNS forwarder on R1',
  objectiveId: '4.3',
  nodes: [
    { id: 'r1', label: 'R1\nDHCP + DNS fwd', type: 'router', x: 50, y: 20 },
    { id: 'pc1', label: 'PC1\n192.168.1.10', type: 'pc', x: 20, y: 72 },
    { id: 'pc2', label: 'PC2\n192.168.1.11', type: 'pc', x: 50, y: 72 },
    { id: 'dns', label: 'DNS Server\n8.8.8.8', type: 'server', x: 80, y: 72 },
  ],
  links: [
    { id: 'l1', source: 'r1', target: 'pc1', label: 'DORA', status: 'forwarding' },
    { id: 'l2', source: 'r1', target: 'pc2', label: 'DORA', status: 'forwarding' },
    { id: 'l3', source: 'r1', target: 'dns', label: 'forward', status: 'forwarding' },
  ],
}
const VALIDATOR_DHCP_DNS_43 = {
  labId: 'LAB-DHCP-DNS-FLOW',
  requiredCommands: [
    { device: 'R1', command: 'show ip dhcp pool' },
    { device: 'R1', command: 'show ip dhcp binding' },
    { device: 'R1', command: 'show hosts' },
  ],
  verificationChecks: [
    { id: 'v1', device: 'R1', command: 'show ip dhcp binding', expectedResult: '192.168.1.10 Automatic', passCondition: 'binding present' },
    { id: 'v2', device: 'R1', command: 'show hosts', expectedResult: 'gateway.ccna.lab', passCondition: 'host entry present' },
  ],
}
const DIAGRAM_DHCP_DNS_43 = mkDiagram(
  'DIAG-DHCP-DNS-43',
  'DHCP DORA and DNS lookup flow',
  '4.3',
  [
    { id: 'pc', label: 'PC\n(DHCP client)', type: 'pc', x: 10, y: 50 },
    { id: 'r1', label: 'R1\nDHCP server', type: 'router', x: 42, y: 50, status: 'highlighted' },
    { id: 'dns', label: 'DNS\n8.8.8.8', type: 'server', x: 78, y: 50 },
    { id: 'dora', label: 'DORA\nDiscover→Offer\nRequest→Ack', type: 'process', x: 25, y: 82 },
  ],
  [
    { id: 'd1', source: 'pc', target: 'r1', label: 'Discover (bcast)', status: 'forwarding' },
    { id: 'd2', source: 'r1', target: 'pc', label: 'Offer / Ack', status: 'forwarding' },
    { id: 'd3', source: 'r1', target: 'dns', label: 'forward DNS', status: 'forwarding' },
  ],
  [{ id: 'a1', x: 50, y: 93, text: 'DORA: Discover + Request = client broadcast. Offer + Ack = server reply.' }],
)
const DHCP_DNS_43 = {
  lab: LAB_DHCP_DNS_43,
  topology: TOPO_DHCP_DNS_43,
  validator: VALIDATOR_DHCP_DNS_43,
  diagram: DIAGRAM_DHCP_DNS_43,
  packetFlows: mkFlows('FLOW-DHCP-DNS-43', 'DORA exchange and DNS resolution', 'DIAG-DHCP-DNS-43', ['CKU-DHCP', 'CKU-DNS'], [
    { id: 's1', order: 1, title: 'Discover', action: 'PC broadcasts DHCPDISCOVER (src 0.0.0.0, dst 255.255.255.255)', successState: 'forwarded' },
    { id: 's2', order: 2, title: 'Offer', action: 'DHCP server unicasts DHCPOFFER with proposed IP, mask, GW, and DNS', successState: 'offered' },
    { id: 's3', order: 3, title: 'Request', action: 'PC broadcasts DHCPREQUEST confirming the offered lease', successState: 'forwarded' },
    { id: 's4', order: 4, title: 'Ack', action: 'Server sends DHCPACK — binding now active and logged in show ip dhcp binding', successState: 'forwarded' },
  ]),
}

/* ---- DHCP pool config (4.3) ---- */
const LAB_DHCP_POOL_43 = {
  id: 'LAB-DHCP-POOL-43',
  title: 'Configure a DHCP Address Pool',
  domainId: 'ip_services',
  objectiveId: '4.3',
  ckuIds: ['CKU-DHCP'],
  labType: 'guided',
  interpretOnly: true,
  difficulty: 'intermediate',
  estimatedTimeMinutes: 10,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'R1 is pre-configured with DHCP pool LAN10 for 192.168.10.0/24 — excluded static range, default-router, and dns-server. Read and verify pool settings without changing configuration.',
  learningGoals: [
    'Read ip dhcp pool and excluded-address in running-config',
    'Verify default-router and dns-server in show ip dhcp pool',
    'Confirm active lease in show ip dhcp binding',
  ],
  topologyId: 'TOPO-DHCP-POOL-43',
  prerequisites: [],
  tasks: [
    { id: 't1', order: 1, title: 'DHCP pool config', device: 'R1', instruction: 'Run show running-config | section dhcp — find pool LAN10, excluded-address, default-router, dns-server.',
      expectedCommands: ['show running-config | section dhcp'] },
    { id: 't2', order: 2, title: 'Pool options', device: 'R1', instruction: 'Run show ip dhcp pool — confirm network, default-router 192.168.10.1, DNS 8.8.8.8.',
      expectedCommands: ['show ip dhcp pool'] },
    { id: 't3', order: 3, title: 'Active bindings', device: 'R1', instruction: 'Run show ip dhcp binding — verify a client lease from pool LAN10.',
      expectedCommands: ['show ip dhcp binding'] },
  ],
  verificationCommands: ['show ip dhcp pool', 'show running-config | section dhcp'],
  successCriteria: ['Pool LAN10 shows network 192.168.10.0', 'default-router and dns-server present', 'Excluded range configured'],
  failureCriteria: ['Missing default-router — clients get IP but no gateway'],
  commonMistakes: ['Using ip helper-address instead of dhcp pool on the server', 'Forgetting excluded-address for gateway IP'],
  source: { name: LAB_SOURCES.blueprint, chapter: '4.3 Configure and verify DHCP client and server', confidence: 0.9 },
  metadata: { version: '1', status: 'validated', confidence: 0.9 },
  cliShowOutput: CLI_DHCP_POOL_43_SHOW_OUTPUT,
}
const TOPO_DHCP_POOL_43 = {
  id: 'TOPO-DHCP-POOL-43', title: 'R1 as DHCP server', objectiveId: '4.3',
  nodes: [{ id: 'pc', label: 'PC DHCP client', type: 'pc', x: 25, y: 50 }, { id: 'r1', label: 'R1 DHCP server', type: 'router', x: 75, y: 50 }],
  links: [{ id: 'l1', source: 'pc', target: 'r1', label: 'Gi0/0 192.168.10.0/24', status: 'forwarding' }],
}
const VALIDATOR_DHCP_POOL_43 = {
  labId: 'LAB-DHCP-POOL-43',
  requiredCommands: [
    { device: 'R1', command: 'show running-config | section dhcp' },
    { device: 'R1', command: 'show ip dhcp pool' },
    { device: 'R1', command: 'show ip dhcp binding' },
  ],
  verificationChecks: [{ id: 'v1', device: 'R1', command: 'show ip dhcp pool', expectedResult: 'LAN10', passCondition: 'pool configured' }],
}
const DHCP_POOL_43 = {
  lab: LAB_DHCP_POOL_43, topology: TOPO_DHCP_POOL_43, validator: VALIDATOR_DHCP_POOL_43,
  diagram: mkDiagram('DIAG-DHCP-POOL-43', 'DHCP pool options', '4.3',
    [{ id: 'r1', label: 'R1 pool LAN10', type: 'router', x: 35, y: 50 }, { id: 'opts', label: 'default-router\ndns-server', type: 'process', x: 65, y: 50, status: 'highlighted' }],
    [{ id: 'd1', source: 'r1', target: 'opts', status: 'forwarding' }]),
  packetFlows: mkFlows('FLOW-DHCP-POOL-43', 'Pool serves clients', 'DIAG-DHCP-POOL-43', ['CKU-DHCP'], [
    { id: 's1', order: 1, title: 'Offer', action: 'Pool LAN10 offers IP with gateway and DNS options', successState: 'offered' },
  ]),
}

/* ---- SNMP community config (4.4) ---- */
const LAB_SNMP_CONFIG_44 = {
  id: 'LAB-SNMP-CONFIG-44',
  title: 'Configure SNMPv2c Read-Only Community',
  domainId: 'services',
  objectiveId: '4.4',
  ckuIds: ['CKU-SNMP'],
  labType: 'guided',
  interpretOnly: true,
  difficulty: 'beginner',
  estimatedTimeMinutes: 8,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'R1 is pre-configured with SNMPv2c read-only community CCNAro, contact, and location strings. Verify the agent settings without changing configuration.',
  learningGoals: [
    'Read snmp-server community RO in running-config',
    'Confirm contact and location strings',
    'Verify community in show snmp community',
  ],
  topologyId: 'TOPO-SNMP-CONFIG-44',
  prerequisites: [],
  tasks: [
    { id: 't1', order: 1, title: 'SNMP config', device: 'R1', instruction: 'Run show running-config | include snmp — find community CCNAro RO, contact, location.',
      expectedCommands: ['show running-config | include snmp'] },
    { id: 't2', order: 2, title: 'Community table', device: 'R1', instruction: 'Run show snmp community — confirm CCNAro read-only community.',
      expectedCommands: ['show snmp community'] },
    { id: 't3', order: 3, title: 'Agent info', device: 'R1', instruction: 'Run show snmp — review contact and location inventory strings.',
      expectedCommands: ['show snmp'] },
  ],
  verificationCommands: ['show snmp community', 'show running-config | include snmp'],
  successCriteria: ['Community CCNAro RO present', 'Contact and location strings set'],
  failureCriteria: ['RW community when only polling needed — security risk'],
  commonMistakes: ['Using snmp-server host instead of community for basic polling setup', 'Confusing traps (agent→NMS) with GET polling'],
  source: { name: LAB_SOURCES.blueprint, chapter: '4.4 Configure and verify SNMP', confidence: 0.9 },
  metadata: { version: '1', status: 'validated', confidence: 0.9 },
  cliShowOutput: CLI_SNMP_44_SHOW_OUTPUT,
}
const TOPO_SNMP_CONFIG_44 = {
  id: 'TOPO-SNMP-CONFIG-44', title: 'SNMP polling', objectiveId: '4.4',
  nodes: [{ id: 'nms', label: 'NMS poller', type: 'server', x: 25, y: 50 }, { id: 'r1', label: 'R1 SNMP agent', type: 'router', x: 75, y: 50 }],
  links: [{ id: 'l1', source: 'nms', target: 'r1', label: 'UDP/161 GET', status: 'forwarding' }],
}
const VALIDATOR_SNMP_CONFIG_44 = {
  labId: 'LAB-SNMP-CONFIG-44',
  requiredCommands: [
    { device: 'R1', command: 'show running-config | include snmp' },
    { device: 'R1', command: 'show snmp community' },
    { device: 'R1', command: 'show snmp' },
  ],
  verificationChecks: [{ id: 'v1', device: 'R1', command: 'show snmp community', expectedResult: 'CCNAro', passCondition: 'ro community' }],
}
const SNMP_CONFIG_44 = {
  lab: LAB_SNMP_CONFIG_44, topology: TOPO_SNMP_CONFIG_44, validator: VALIDATOR_SNMP_CONFIG_44,
  diagram: mkDiagram('DIAG-SNMP-CONFIG-44', 'NMS polls RO community', '4.4',
    [{ id: 'nms', label: 'NMS', type: 'server', x: 20, y: 50 }, { id: 'snmp', label: 'CCNAro RO', type: 'process', x: 55, y: 50, status: 'highlighted' }, { id: 'r1', label: 'R1', type: 'router', x: 85, y: 50 }],
    [{ id: 'd1', source: 'nms', target: 'snmp', status: 'forwarding' }, { id: 'd2', source: 'snmp', target: 'r1', status: 'forwarding' }]),
  packetFlows: mkFlows('FLOW-SNMP-CONFIG-44', 'GET poll with RO community', 'DIAG-SNMP-CONFIG-44', ['CKU-SNMP'], [
    { id: 's1', order: 1, title: 'Poll', action: 'NMS sends SNMP GET with community CCNAro', successState: 'matched' },
  ]),
}

/* ---- TFTP backup (4.9) ---- */
const LAB_TFTP_CONFIG_49 = {
  id: 'LAB-TFTP-CONFIG-49',
  title: 'Backup Running Config via TFTP',
  domainId: 'services',
  objectiveId: '4.9',
  ckuIds: ['CKU-TFTP-FTP', 'CKU-COPY-TFTP-RUNNING-CONFIG'],
  labType: 'guided',
  interpretOnly: true,
  difficulty: 'beginner',
  estimatedTimeMinutes: 8,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'R1 has already backed up running-config to TFTP server 192.168.1.50 as r1-backup.cfg. Verify reachability and archive evidence without performing a new copy.',
  learningGoals: [
    'Confirm TFTP server reachability with ping',
    'Read archive evidence of saved configuration',
    'Interpret dir tftp: for backup filename',
  ],
  topologyId: 'TOPO-TFTP-CONFIG-49',
  prerequisites: [],
  tasks: [
    { id: 't1', order: 1, title: 'Server reachability', device: 'R1', instruction: 'Run ping 192.168.1.50 — confirm TFTP server is reachable.',
      expectedCommands: ['ping 192.168.1.50'] },
    { id: 't2', order: 2, title: 'Archive record', device: 'R1', instruction: 'Run show archive — confirm a saved archive configuration exists.',
      expectedCommands: ['show archive'] },
    { id: 't3', order: 3, title: 'TFTP file listing', device: 'R1', instruction: 'Run dir tftp: — verify r1-backup.cfg on the TFTP server.',
      expectedCommands: ['dir tftp:'] },
  ],
  verificationCommands: ['show flash:', 'dir tftp:'],
  successCriteria: ['Copy completes without error', 'TFTP server receives r1-backup.cfg'],
  failureCriteria: ['Reversed copy tftp: running-config — downloads instead of backup'],
  commonMistakes: ['copy tftp: running-config reverses direction (restore, not backup)', 'TFTP uses UDP/69 — no auth on untrusted networks'],
  source: { name: LAB_SOURCES.blueprint, chapter: '4.9 TFTP and FTP capabilities', confidence: 0.85 },
  metadata: { version: '1', status: 'validated', confidence: 0.85 },
  cliShowOutput: CLI_TFTP_49_SHOW_OUTPUT,
}
const TOPO_TFTP_CONFIG_49 = {
  id: 'TOPO-TFTP-CONFIG-49', title: 'TFTP backup', objectiveId: '4.9',
  nodes: [{ id: 'r1', label: 'R1', type: 'router', x: 30, y: 50 }, { id: 'tftp', label: 'TFTP .50', type: 'server', x: 75, y: 50 }],
  links: [{ id: 'l1', source: 'r1', target: 'tftp', label: 'UDP/69', status: 'forwarding' }],
}
const VALIDATOR_TFTP_CONFIG_49 = {
  labId: 'LAB-TFTP-CONFIG-49',
  requiredCommands: [
    { device: 'R1', command: 'ping 192.168.1.50' },
    { device: 'R1', command: 'show archive' },
    { device: 'R1', command: 'dir tftp:' },
  ],
  verificationChecks: [{ id: 'v1', device: 'R1', command: 'ping 192.168.1.50', expectedResult: 'Success rate', passCondition: 'server reachable' }],
}
const TFTP_CONFIG_49 = {
  lab: LAB_TFTP_CONFIG_49, topology: TOPO_TFTP_CONFIG_49, validator: VALIDATOR_TFTP_CONFIG_49,
  diagram: mkDiagram('DIAG-TFTP-CONFIG-49', 'Config backup to TFTP', '4.9',
    [{ id: 'r1', label: 'running-config', type: 'router', x: 25, y: 50 }, { id: 'copy', label: 'copy run tftp:', type: 'process', x: 55, y: 50, status: 'highlighted' }, { id: 'srv', label: 'TFTP server', type: 'server', x: 85, y: 50 }],
    [{ id: 'd1', source: 'r1', target: 'copy', status: 'forwarding' }, { id: 'd2', source: 'copy', target: 'srv', status: 'forwarding' }]),
  packetFlows: mkFlows('FLOW-TFTP-CONFIG-49', 'Upload config file', 'DIAG-TFTP-CONFIG-49', ['CKU-TFTP-FTP'], [
    { id: 's1', order: 1, title: 'Backup', action: 'Running-config copied to TFTP server via UDP/69', successState: 'forwarded' },
  ]),
}

/* ---- SSH VTY access (5.3) ---- */
const LAB_SSH_VTY = {
  id: 'LAB-SSH-VTY',
  title: 'Configure and Verify SSH Access on VTY Lines',
  domainId: 'security',
  objectiveId: '5.3',
  ckuIds: ['CKU-SSH', 'CKU-LOCAL-AUTH'],
  labType: 'guided',
  interpretOnly: true,
  difficulty: 'beginner',
  estimatedTimeMinutes: 10,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'R1 is pre-configured for SSH v2-only VTY access with transport input ssh and login local. Verify SSH is enabled and review VTY line settings without changing configuration.',
  learningGoals: [
    'Confirm transport input ssh on VTY lines',
    'Verify SSH Enabled - version 2.0 in show ip ssh',
    'Read active VTY sessions with show users',
  ],
  topologyId: 'TOPO-SSH-VTY',
  prerequisites: ['CKU-LOCAL-AUTH'],
  tasks: [
    { id: 't1', order: 1, title: 'VTY line config', device: 'R1', instruction: 'Run show running-config | section line vty — find transport input ssh and login local.',
      expectedCommands: ['show running-config | section line vty'] },
    { id: 't2', order: 2, title: 'SSH version', device: 'R1', instruction: 'Run show ip ssh — confirm SSH Enabled - version 2.0.',
      expectedCommands: ['show ip ssh'] },
    { id: 't3', order: 3, title: 'Active sessions', device: 'R1', instruction: 'Run show users — view VTY connections and source IP.',
      expectedCommands: ['show users'] },
  ],
  verificationCommands: ['show ip ssh', 'show users', 'show running-config | section line vty'],
  successCriteria: [
    'show ip ssh shows SSH Enabled - version 2.0',
    'VTY lines show transport input ssh and login local in running-config',
    'Telnet connection attempt is refused — only SSH accepted on TCP/22',
  ],
  failureCriteria: [
    'transport input all or telnet left — Telnet still accepted (insecure)',
    'No login local — VTY authentication misconfigured',
  ],
  commonMistakes: [
    'Applying transport input ssh to line con 0 — console does not use SSH',
    'RSA modulus 512 — SSH v2 requires minimum 768 bits; 1024 is the CCNA standard',
    'Using login instead of login local — no username prompt',
  ],
  source: { name: LAB_SOURCES.blueprint, chapter: '5.3 Configure and verify device access control', confidence: 0.9 },
  metadata: { version: '1', status: 'validated', confidence: 0.9 },
  cliShowOutput: CLI_SSH_53_SHOW_OUTPUT,
}
const TOPO_SSH_VTY = {
  id: 'TOPO-SSH-VTY',
  title: 'SSH VTY access topology',
  objectiveId: '5.3',
  nodes: [
    { id: 'admin', label: 'Admin PC\n192.168.1.100', type: 'pc', x: 20, y: 50 },
    { id: 'r1', label: 'R1\nSSH only (TCP/22)', type: 'router', x: 72, y: 50 },
  ],
  links: [
    { id: 'l1', source: 'admin', target: 'r1', label: 'SSH TCP/22', status: 'forwarding' },
  ],
}
const VALIDATOR_SSH_VTY = {
  labId: 'LAB-SSH-VTY',
  requiredCommands: [
    { device: 'R1', command: 'show running-config | section line vty' },
    { device: 'R1', command: 'show ip ssh' },
    { device: 'R1', command: 'show users' },
  ],
  verificationChecks: [
    { id: 'v1', device: 'R1', command: 'show ip ssh', expectedResult: 'SSH Enabled - version 2.0', passCondition: 'ssh v2 enabled' },
    { id: 'v2', device: 'R1', command: 'show users', expectedResult: 'vty 0   admin', passCondition: 'ssh session active' },
  ],
}
const DIAGRAM_SSH_VTY = mkDiagram(
  'DIAG-SSH-VTY',
  'SSH VTY authentication flow',
  '5.3',
  [
    { id: 'admin', label: 'Admin\nssh -l admin R1', type: 'pc', x: 12, y: 50 },
    { id: 'tcp22', label: 'TCP/22\nSSH v2', type: 'process', x: 38, y: 50 },
    { id: 'vty', label: 'VTY 0-4\ntransport input ssh\nlogin local', type: 'process', x: 65, y: 50 },
    { id: 'db', label: 'Local DB\nadmin secret', type: 'process', x: 65, y: 80 },
    { id: 'r1', label: 'R1 priv#', type: 'router', x: 88, y: 50 },
  ],
  [
    { id: 'd1', source: 'admin', target: 'tcp22', status: 'forwarding' },
    { id: 'd2', source: 'tcp22', target: 'vty', status: 'forwarding' },
    { id: 'd3', source: 'vty', target: 'db', status: 'forwarding' },
    { id: 'd4', source: 'vty', target: 'r1', status: 'forwarding' },
  ],
  [{ id: 'a1', x: 50, y: 93, text: 'transport input ssh blocks Telnet. login local requires username + secret.' }],
)
const DEVICE_ACCESS_53 = {
  lab: LAB_SSH_VTY,
  topology: TOPO_SSH_VTY,
  validator: VALIDATOR_SSH_VTY,
  diagram: DIAGRAM_SSH_VTY,
  packetFlows: mkFlows('FLOW-SSH-VTY', 'SSH session establishment', 'DIAG-SSH-VTY', ['CKU-SSH', 'CKU-LOCAL-AUTH'], [
    { id: 's1', order: 1, title: 'TCP/22 connect', action: 'Admin PC initiates SSH connection to R1 on TCP port 22', successState: 'forwarded' },
    { id: 's2', order: 2, title: 'Key exchange', action: 'RSA key negotiated; session encrypted with derived symmetric key', successState: 'matched' },
    { id: 's3', order: 3, title: 'Auth', action: 'VTY prompts for username/password — checked against local database', successState: 'matched' },
    { id: 's4', order: 4, title: 'Session open', action: 'Authenticated user enters user EXEC; enable secret grants privileged access', successState: 'forwarded' },
  ]),
}

/* ---- Extended ACL placement (5.5) ---- */
const LAB_ACL_CONFIG_55 = {
  id: 'LAB-ACL-CONFIG-55',
  title: 'Configure Extended ACL Placement and Rules',
  domainId: 'security',
  objectiveId: '5.5',
  ckuIds: ['CKU-EXTENDED-ACL', 'CKU-ACL-PLACEMENT', 'CKU-WILDCARD-MASK'],
  labType: 'guided',
  interpretOnly: true,
  difficulty: 'intermediate',
  estimatedTimeMinutes: 10,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'R1 is pre-configured with extended ACL SALES_TO_SRV on Sales LAN 192.168.10.0/24 (Gi0/0). Sales may reach servers 10.1.1.0/24 on HTTP (TCP/80) only. Read the ACL and verify inbound placement on the source-facing interface.',
  learningGoals: [
    'Read extended ACL permit/deny order from show access-lists',
    'Confirm inbound application on Gi0/0 (near source)',
    'Interpret wildcard masks 0.0.0.255 for /24 subnets',
    'Understand implicit deny after explicit rules',
  ],
  topologyId: 'TOPO-ACL-CONFIG-55',
  prerequisites: ['CKU-WILDCARD-MASK'],
  tasks: [
    { id: 't1', order: 1, title: 'Read ACL definition', device: 'R1', instruction: 'Run show running-config | section access-list — find SALES_TO_SRV permit tcp eq 80 and deny ip lines.',
      expectedCommands: ['show running-config | section access-list'] },
    { id: 't2', order: 2, title: 'ACL hit counters', device: 'R1', instruction: 'Run show access-lists — confirm permit tcp … eq 80 and deny ip entries with match counts.',
      expectedCommands: ['show access-lists'] },
    { id: 't3', order: 3, title: 'Inbound placement', device: 'R1', instruction: 'Run show ip interface gi0/0 — confirm SALES_TO_SRV is the inbound access list on the Sales LAN interface.',
      expectedCommands: ['show ip interface gi0/0'] },
  ],
  verificationCommands: ['show access-lists', 'show ip interface gi0/0', 'show running-config | section access-list'],
  successCriteria: [
    'HTTP (tcp/80) from 192.168.10.0/24 to 10.1.1.0/24 permitted',
    'Other IP traffic from sales to servers denied by explicit deny',
    'ACL applied inbound on Gi0/0 (source-facing)',
    'show access-lists shows match counters on permit and deny lines',
  ],
  failureCriteria: [
    'ACL applied outbound on Gi0/1 — wrong direction for source filtering',
    'Subnet mask used instead of wildcard — matches wrong addresses',
    'Missing explicit deny — implicit deny still drops, but exam expects ordered rules',
  ],
  commonMistakes: [
    'Placing extended ACL on destination interface outbound — extended ACLs go near source',
    'Confusing subnet mask with wildcard mask (0.0.0.255 for /24)',
    'Using eq 443 when scenario requires only HTTP port 80',
    'Applying ACL outbound on Gi0/0 instead of inbound',
  ],
  source: { name: LAB_SOURCES.blueprint, chapter: '5.5 Extended ACL placement', confidence: 0.9 },
  metadata: { version: '1', status: 'validated', confidence: 0.9 },
  cliShowOutput: CLI_ACL_CONFIG_55_SHOW_OUTPUT,
}
const TOPO_ACL_CONFIG_55 = { id: 'TOPO-ACL-CONFIG-55', title: 'Extended ACL source placement', objectiveId: '5.5',
  nodes: [{ id: 'sales', label: 'Sales 192.168.10.0/24', type: 'pc', x: 15, y: 50 }, { id: 'r1', label: 'R1', type: 'router', x: 50, y: 50 }, { id: 'srv', label: 'Servers 10.1.1.0/24', type: 'server', x: 85, y: 50 }],
  links: [{ id: 'l1', source: 'sales', target: 'r1', label: 'Gi0/0 SALES_TO_SRV in', status: 'forwarding' }, { id: 'l2', source: 'r1', target: 'srv', label: 'Gi0/1 tcp/80 only', status: 'forwarding' }] }
const VALIDATOR_ACL_CONFIG_55 = { labId: 'LAB-ACL-CONFIG-55', requiredCommands: [
  { device: 'R1', command: 'show running-config | section access-list' },
  { device: 'R1', command: 'show access-lists' },
  { device: 'R1', command: 'show ip interface gi0/0' },
], verificationChecks: [
  { id: 'v1', device: 'R1', command: 'show access-lists', expectedResult: 'SALES_TO_SRV permit tcp eq 80', passCondition: 'extended ACL present' },
  { id: 'v2', device: 'R1', command: 'show ip interface gi0/0', expectedResult: 'Inbound access list SALES_TO_SRV', passCondition: 'inbound on source' },
] }
const ACL_CONFIG_55 = { lab: LAB_ACL_CONFIG_55, topology: TOPO_ACL_CONFIG_55, validator: VALIDATOR_ACL_CONFIG_55,
  diagram: mkDiagram('DIAG-ACL-CONFIG-55', 'Extended ACL near source', '5.5',
    [{ id: 'src', label: 'Sales LAN', type: 'pc', x: 12, y: 50 }, { id: 'acl', label: 'SALES_TO_SRV\ninbound Gi0/0', type: 'process', x: 38, y: 50, status: 'highlighted' }, { id: 'r1', label: 'R1', type: 'router', x: 55, y: 50 }, { id: 'dst', label: 'Server subnet', type: 'server', x: 88, y: 50 }],
    [{ id: 'd1', source: 'src', target: 'acl', status: 'forwarding' }, { id: 'd2', source: 'acl', target: 'r1', status: 'forwarding' }, { id: 'd3', source: 'r1', target: 'dst', label: 'permit :80', status: 'forwarding' }]),
  packetFlows: mkFlows('FLOW-ACL-CONFIG-55', 'HTTP permitted, other IP denied', 'DIAG-ACL-CONFIG-55', ['CKU-EXTENDED-ACL', 'CKU-ACL-PLACEMENT'], [
    { id: 's1', order: 1, title: 'Inbound check', action: 'Sales packet enters Gi0/0 — SALES_TO_SRV evaluated inbound', successState: 'matched' },
    { id: 's2', order: 2, title: 'Permit HTTP', action: 'tcp dst-port 80 matches permit line — forwarded to servers', successState: 'forwarded' },
    { id: 's3', order: 3, title: 'Deny other', action: 'Telnet/ICMP hits deny ip line — dropped before Gi0/1', successState: 'dropped' },
  ]) }

/* ---- Port security (5.6) ---- */
const LAB_PORTSEC_56 = {
  id: 'LAB-PORTSEC-56',
  title: 'Configure Port Security on an Access Port',
  domainId: 'security',
  objectiveId: '5.6',
  ckuIds: ['CKU-PORT-SECURITY'],
  labType: 'guided',
  interpretOnly: true,
  difficulty: 'beginner',
  estimatedTimeMinutes: 8,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'SW1 Gi0/1 is pre-configured as an access port with port security — maximum 1 MAC, violation shutdown. Read the running config and verify the port-security state without changing configuration.',
  learningGoals: [
    'Read switchport port-security settings in running-config',
    'Verify Port Security enabled with Max Addresses 1',
    'Confirm violation mode Shutdown on the access port',
    'Use show port-security for secure MAC count',
  ],
  topologyId: 'TOPO-PORTSEC-56',
  prerequisites: ['CKU-VLAN-BASIC'],
  tasks: [
    { id: 't1', order: 1, title: 'Read port-security config', device: 'SW1', instruction: 'Run show running-config interface gi0/1 — find switchport mode access, port-security, maximum 1, violation shutdown.',
      expectedCommands: ['show running-config interface gi0/1'] },
    { id: 't2', order: 2, title: 'Interface port-security state', device: 'SW1', instruction: 'Run show port-security interface gi0/1 — confirm Port Security enabled, Max Addresses 1, Violation Mode Shutdown.',
      expectedCommands: ['show port-security interface gi0/1'] },
    { id: 't3', order: 3, title: 'Secure MAC table', device: 'SW1', instruction: 'Run show port-security — verify one secure MAC learned on Gi0/1.',
      expectedCommands: ['show port-security'] },
  ],
  verificationCommands: ['show port-security', 'show port-security interface gi0/1', 'show interfaces status err-disabled'],
  successCriteria: [
    'Port security enabled on Gi0/1 access port',
    'Maximum 1 secure MAC address configured',
    'Violation mode is Shutdown',
    'Second MAC causes err-disabled state',
  ],
  failureCriteria: [
    'Port security on trunk — not supported for typical exam scenarios',
    'Maximum 0 or unset — feature ineffective',
    'Violation protect/restrict when shutdown required',
  ],
  commonMistakes: [
    'Applying port security to a trunk port',
    'Forgetting switchport mode access first',
    'Not knowing recovery: shutdown / no shutdown after err-disable',
    'Confusing violation modes: protect (drop), restrict (drop+log), shutdown (err-disable)',
  ],
  source: { name: LAB_SOURCES.blueprint, chapter: '5.6 Port security', confidence: 0.9 },
  metadata: { version: '1', status: 'validated', confidence: 0.9 },
  cliShowOutput: CLI_PORTSEC_56_SHOW_OUTPUT,
}
const TOPO_PORTSEC_56 = { id: 'TOPO-PORTSEC-56', title: 'Port security access port', objectiveId: '5.6',
  nodes: [{ id: 'sw1', label: 'SW1', type: 'switch', x: 50, y: 40 }, { id: 'pc', label: 'Workstation', type: 'pc', x: 50, y: 75 }, { id: 'rogue', label: 'Rogue MAC', type: 'attacker', x: 20, y: 75, status: 'error' }],
  links: [{ id: 'l1', source: 'sw1', target: 'pc', label: 'Gi0/1 max 1', status: 'forwarding' }, { id: 'l2', source: 'rogue', target: 'sw1', label: 'violation', status: 'blocked' }] }
const VALIDATOR_PORTSEC_56 = { labId: 'LAB-PORTSEC-56', requiredCommands: [
  { device: 'SW1', command: 'show running-config interface gi0/1' },
  { device: 'SW1', command: 'show port-security interface gi0/1' },
  { device: 'SW1', command: 'show port-security' },
], verificationChecks: [
  { id: 'v1', device: 'SW1', command: 'show port-security interface gi0/1', expectedResult: 'Port Security: Enabled', passCondition: 'port security active' },
] }
const PORTSEC_56 = { lab: LAB_PORTSEC_56, topology: TOPO_PORTSEC_56, validator: VALIDATOR_PORTSEC_56,
  diagram: mkDiagram('DIAG-PORTSEC-56', 'One MAC, shutdown on violation', '5.6',
    [{ id: 'sw', label: 'SW1 Gi0/1', type: 'switch', x: 50, y: 45, status: 'highlighted' }, { id: 'ok', label: '1st MAC\nlearned', type: 'pc', x: 30, y: 75 }, { id: 'bad', label: '2nd MAC\nerr-disable', type: 'attacker', x: 70, y: 75, status: 'error' }],
    [{ id: 'd1', source: 'ok', target: 'sw', status: 'forwarding' }, { id: 'd2', source: 'bad', target: 'sw', label: 'shutdown', status: 'blocked' }]),
  packetFlows: mkFlows('FLOW-PORTSEC-56', 'Second MAC triggers shutdown', 'DIAG-PORTSEC-56', ['CKU-PORT-SECURITY'], [
    { id: 's1', order: 1, title: 'Learn MAC', action: 'First workstation MAC learned — count 1 of 1', successState: 'matched' },
    { id: 's2', order: 2, title: 'Violation', action: 'Second MAC exceeds maximum — port err-disabled', successState: 'blocked' },
    { id: 's3', order: 3, title: 'Recovery', action: 'Admin runs shutdown/no shutdown to re-enable port', successState: 'noted' },
  ]) }

/* ---- Routing table interpret (3.1) ---- */
const LAB_ROUTE_TABLE_31 = {
  id: 'LAB-ROUTE-TABLE-31',
  title: 'Interpret an IPv4 Routing Table',
  domainId: 'connectivity',
  objectiveId: '3.1',
  ckuIds: ['CKU-ROUTE-SOURCE-CODES', 'CKU-AD', 'CKU-STATIC-ROUTE'],
  labType: 'guided',
  interpretOnly: true,
  difficulty: 'beginner',
  estimatedTimeMinutes: 10,
  tools: ['Packet Tracer', 'GNS3', 'CML'],
  examRelevance: 'core',
  scenario: 'R1 is pre-configured with connected (C), local (L), OSPF (O), and static default (S*) routes. Interpret the routing table — read source codes, [AD/metric] brackets, next-hop IPs, and filtered show commands.',
  learningGoals: [
    'Read source codes: C (connected), L (local /32), S (static), O (OSPF).',
    'Decode [AD/metric] — e.g. [110/20] is OSPF AD 110, cost 20.',
    'Use show ip route ospf and show ip route connected to filter the table.',
    'Look up a specific prefix descriptor block.',
  ],
  topologyId: 'TOPO-ROUTE-TABLE-31',
  prerequisites: ['CKU-IP-ADDRESSING'],
  tasks: [
    { id: 't1', order: 1, title: 'Full routing table', device: 'R1',
      instruction: 'Run show ip route — read C, L, S*, O entries and gateway of last resort.',
      expectedCommands: ['show ip route'] },
    { id: 't2', order: 2, title: 'OSPF routes only', device: 'R1',
      instruction: 'Run show ip route ospf — confirm [110/20] on the OSPF line.',
      expectedCommands: ['show ip route ospf'] },
    { id: 't3', order: 3, title: 'Connected routes only', device: 'R1',
      instruction: 'Run show ip route connected — see C and L entries without AD/metric brackets.',
      expectedCommands: ['show ip route connected'] },
    { id: 't4', order: 4, title: 'Prefix lookup', device: 'R1',
      instruction: 'Run show ip route 10.0.2.0 — read the full descriptor block for that prefix.',
      expectedCommands: ['show ip route 10.0.2.0'] },
  ],
  verificationCommands: ['show ip route', 'show ip route ospf', 'show ip route connected'],
  successCriteria: [
    'Full table shows C (connected), S* (default static), O (OSPF) entries',
    'OSPF route 10.0.2.0/24 has [110/20] — AD 110, OSPF cost 20',
    'S* 0.0.0.0/0 via 203.0.113.1 is listed as gateway of last resort',
    'Connected entries have no AD/metric bracket',
    'Descriptor block for 10.0.2.0 shows distance 110 and metric 20',
  ],
  failureCriteria: [
    'If show ip route shows only C/L — OSPF adjacency not established',
    'If no S* entry — default static route missing from R1',
  ],
  commonMistakes: [
    'Reading [AD/metric] as [metric/AD] — administrative distance is always first',
    'Confusing C (connected network) with L (local /32 host route for the interface IP)',
    'Thinking a lower AD means worse — lower AD = more trusted; S AD=1 beats O AD=110',
  ],
  source: { name: LAB_SOURCES.blueprint, chapter: '3.1 Interpret routing table components', confidence: 0.93 },
  metadata: { version: '1', status: 'validated', confidence: 0.93 },
  cliShowOutput: CLI_ROUTE_31_SHOW_OUTPUT,
}
const TOPO_ROUTE_TABLE_31 = {
  id: 'TOPO-ROUTE-TABLE-31',
  title: 'R1 with C / S* / O routes',
  objectiveId: '3.1',
  nodes: [
    { id: 'r1', label: 'R1 (interpret table)', type: 'router', x: 48, y: 30 },
    { id: 'pc1', label: 'PC1\n192.168.1.0/24', type: 'pc', x: 10, y: 72 },
    { id: 'r2', label: 'R2\nOSPF peer', type: 'router', x: 85, y: 72 },
    { id: 'isp', label: 'ISP / default\n0.0.0.0/0', type: 'cloud', x: 48, y: 78 },
  ],
  links: [
    { id: 'l1', source: 'r1', target: 'pc1', label: 'Gi0/0 .1', status: 'forwarding' },
    { id: 'l2', source: 'r1', target: 'r2', label: 'Gi0/1 10.0.0.0/30', status: 'forwarding' },
    { id: 'l3', source: 'r1', target: 'isp', label: 'S* via 10.0.0.1', status: 'forwarding' },
  ],
}
const VALIDATOR_ROUTE_TABLE_31 = {
  labId: 'LAB-ROUTE-TABLE-31',
  requiredCommands: [
    { device: 'R1', command: 'show ip route' },
    { device: 'R1', command: 'show ip route ospf' },
    { device: 'R1', command: 'show ip route connected' },
    { device: 'R1', command: 'show ip route 10.0.2.0' },
  ],
  verificationChecks: [
    { id: 'v1', device: 'R1', command: 'show ip route', expectedResult: 'O 10.0.2.0/24 [110/20]', passCondition: 'OSPF route present with correct AD 110 and metric 20' },
    { id: 'v2', device: 'R1', command: 'show ip route ospf', expectedResult: 'O 10.0.2.0/24 [110/20]', passCondition: 'OSPF filter returns the learned route' },
    { id: 'v3', device: 'R1', command: 'show ip route connected', expectedResult: 'C 10.0.1.0/24 is directly connected', passCondition: 'Connected routes present' },
  ],
}
const DIAGRAM_ROUTE_TABLE_31 = mkDiagram(
  'DIAG-ROUTE-TABLE-31',
  'Routing table source codes',
  '3.1',
  [
    { id: 'c', label: 'C — Connected\n(no AD bracket)', type: 'process', x: 15, y: 55, status: 'highlighted' },
    { id: 's', label: 'S* — Static default\n[1/0]', type: 'process', x: 40, y: 55 },
    { id: 'o', label: 'O — OSPF\n[110/20]', type: 'process', x: 65, y: 55 },
    { id: 'r1', label: 'R1\nRouting Table', type: 'router', x: 40, y: 20 },
  ],
  [
    { id: 'd1', source: 'r1', target: 'c', status: 'forwarding' },
    { id: 'd2', source: 'r1', target: 's', status: 'forwarding' },
    { id: 'd3', source: 'r1', target: 'o', status: 'forwarding' },
  ],
  [{ id: 'a1', x: 65, y: 85, text: 'Lower AD = more trusted. Longest prefix always wins first.' }],
)
const FLOWS_ROUTE_TABLE_31 = mkFlows(
  'FLOW-ROUTE-TABLE-31',
  'Reading one routing table line',
  'DIAG-ROUTE-TABLE-31',
  ['CKU-ROUTE-SOURCE-CODES', 'CKU-AD'],
  [
    { id: 's1', order: 1, title: 'Source code', action: 'O = OSPF. Other common codes: C = connected, L = local /32, S = static, D = EIGRP, R = RIP.', successState: 'noted' },
    { id: 's2', order: 2, title: 'Destination prefix', action: '192.168.2.0/24 — the network the router can reach via this entry.', successState: 'noted' },
    { id: 's3', order: 3, title: '[AD/metric] bracket', action: '[110/20] — AD 110 (OSPF trustworthiness), metric 20 (OSPF cost). Lower AD wins between protocols; lower metric wins within OSPF.', successState: 'noted' },
    { id: 's4', order: 4, title: 'Next-hop and exit interface', action: 'via 10.0.0.2 is where the packet goes next. GigabitEthernet0/1 is the outbound interface on this router.', successState: 'forwarded' },
  ],
)
const ROUTE_TABLE_31 = {
  lab: LAB_ROUTE_TABLE_31,
  topology: TOPO_ROUTE_TABLE_31,
  validator: VALIDATOR_ROUTE_TABLE_31,
  diagram: DIAGRAM_ROUTE_TABLE_31,
  packetFlows: FLOWS_ROUTE_TABLE_31,
}

/* ---- Router forwarding decision (3.2) ---- */
const LAB_ROUTE_FORWARD_32 = {
  id: 'LAB-ROUTE-FORWARD-32',
  title: 'Verify Router Forwarding Decisions',
  domainId: 'connectivity',
  objectiveId: '3.2',
  ckuIds: ['CKU-LONGEST-PREFIX-MATCH', 'CKU-ROUTING-TABLE'],
  labType: 'guided',
  interpretOnly: true,
  difficulty: 'intermediate',
  estimatedTimeMinutes: 12,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'R1 is pre-configured with connected, static, and OSPF routes. A packet to 192.168.2.50 must match the most specific route (192.168.2.0/24 OSPF), not the summary static 172.16.0.0/16 or default route. Configuration is already loaded — run show commands and explain the forwarding decision.',
  learningGoals: [
    'Read source codes (C, L, S, O) and [AD/metric] brackets',
    'Apply longest-prefix-match for a host destination',
    'Compare administrative distance when multiple protocols exist',
  ],
  topologyId: 'TOPO-ROUTE-FORWARD-32',
  prerequisites: ['CKU-IP-ADDRESSING'],
  tasks: [
    { id: 't1', order: 1, title: 'Full routing table', device: 'R1', instruction: 'Enter privileged EXEC and run show ip route. Note connected LAN 192.168.1.0/24, OSPF 192.168.2.0/24 [110/20], static 172.16.0.0/16, and default route S*.',
      expectedCommands: ['enable', 'show ip route'] },
    { id: 't2', order: 2, title: 'Longest match lookup', device: 'R1', instruction: 'Run show ip route 192.168.2.0 to confirm the /24 OSPF entry wins over broader statics for hosts in that subnet.',
      expectedCommands: ['show ip route 192.168.2.0'] },
    { id: 't3', order: 3, title: 'Filter OSPF routes', device: 'R1', instruction: 'Run show ip route ospf — verify AD 110 and next-hop 10.0.0.2 for the learned LAN.',
      expectedCommands: ['show ip route ospf'] },
    { id: 't4', order: 4, title: 'Static routes only', device: 'R1', instruction: 'Run show ip route static — confirm the /16 summary exists but does not override the more specific OSPF /24 for 192.168.2.x.',
      expectedCommands: ['show ip route static'] },
  ],
  verificationCommands: ['show ip route', 'show ip route 192.168.2.0', 'show ip route ospf'],
  successCriteria: [
    '192.168.2.0/24 is selected via OSPF (AD 110) for destinations in that subnet',
    'Connected /24 on Gi0/0 is used for local 192.168.1.x traffic',
    'Default route S* does not override more specific prefixes',
  ],
  failureCriteria: [
    'Choosing the static /16 for a 192.168.2.x host — violates longest prefix match',
    'Ignoring [AD/metric] when comparing O vs S for the same prefix length',
  ],
  commonMistakes: [
    'Assuming the default route always wins',
    'Confusing wildcard masks with subnet masks when reading network statements',
    'Picking lowest metric across different prefix lengths instead of longest match first',
  ],
  source: { name: LAB_SOURCES.blueprint, chapter: '3.2 Forwarding decision', confidence: 0.9 },
  metadata: { version: '1', status: 'validated', confidence: 0.9 },
  cliShowOutput: CLI_ROUTE_32_SHOW_OUTPUT,
}
const TOPO_ROUTE_FORWARD_32 = { id: 'TOPO-ROUTE-FORWARD-32', title: 'R1 multi-route lookup', objectiveId: '3.2',
  nodes: [{ id: 'r1', label: 'R1', type: 'router', x: 50, y: 40 }, { id: 'lan1', label: 'LAN1 .1.0/24', type: 'pc', x: 20, y: 75 }, { id: 'r2', label: 'R2 OSPF peer', type: 'router', x: 80, y: 75 }],
  links: [{ id: 'l1', source: 'r1', target: 'lan1', status: 'forwarding' }, { id: 'l2', source: 'r1', target: 'r2', label: '10.0.0.0/30', status: 'forwarding' }] }
const VALIDATOR_ROUTE_FORWARD_32 = { labId: 'LAB-ROUTE-FORWARD-32', requiredCommands: [
  { device: 'R1', command: 'show ip route' },
  { device: 'R1', command: 'show ip route 192.168.2.0' },
  { device: 'R1', command: 'show ip route ospf' },
], verificationChecks: [
  { id: 'v1', device: 'R1', command: 'show ip route 192.168.2.0', expectedResult: 'Known via ospf 1, distance 110', passCondition: 'OSPF /24 selected for lookup' },
] }
const ROUTE_FORWARD_32 = { lab: LAB_ROUTE_FORWARD_32, topology: TOPO_ROUTE_FORWARD_32, validator: VALIDATOR_ROUTE_FORWARD_32,
  diagram: mkDiagram('DIAG-ROUTE-FORWARD-32', 'Longest prefix match', '3.2',
    [{ id: 'host', label: 'Host 192.168.2.50', type: 'pc', x: 15, y: 50 }, { id: 'r1', label: 'R1 LPM lookup', type: 'router', x: 50, y: 50, status: 'highlighted' }, { id: 'ospf', label: 'O 192.168.2.0/24', type: 'process', x: 85, y: 30 }],
    [{ id: 'd1', source: 'host', target: 'r1', status: 'forwarding' }, { id: 'd2', source: 'r1', target: 'ospf', status: 'forwarding' }]),
  packetFlows: mkFlows('FLOW-ROUTE-FORWARD-32', 'LPM selects /24 OSPF', 'DIAG-ROUTE-FORWARD-32', ['CKU-LONGEST-PREFIX-MATCH'], [
    { id: 's1', order: 1, title: 'Lookup', action: 'R1 compares prefix lengths — /24 OSPF beats /16 static and default', successState: 'noted' },
    { id: 's2', order: 2, title: 'Forward', action: 'Packet exits Gi0/1 toward next-hop 10.0.0.2', successState: 'forwarded' },
  ]) }

/* ---- OSPF verify (3.4) ---- */
const LAB_OSPF_VERIFY_34 = {
  id: 'LAB-OSPF-VERIFY-34',
  title: 'Verify Single-Area OSPFv2 Adjacency and Routes',
  domainId: 'connectivity',
  objectiveId: '3.4',
  ckuIds: ['CKU-OSPF', 'CKU-OSPF-NEIGHBOR'],
  labType: 'guided',
  interpretOnly: true,
  difficulty: 'intermediate',
  estimatedTimeMinutes: 10,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'R1 and R2 are already configured with OSPFv2 in area 0 on 10.0.12.0/30 and each LAN. OSPF is pre-loaded — verify neighbor FULL state, OSPF routes in the table, and AD 110 on learned prefixes.',
  learningGoals: [
    'Confirm OSPF neighbor state FULL with show ip ospf neighbor',
    'Filter OSPF routes with show ip route ospf',
    'Read AD 110 and OSPF cost from the routing table',
  ],
  topologyId: 'TOPO-OSPF-VERIFY-34',
  prerequisites: ['CKU-OSPF'],
  tasks: [
    { id: 't1', order: 1, title: 'Neighbor table', device: 'R1', instruction: 'Run show ip ospf neighbor — confirm R2 (2.2.2.2) is FULL on the point-to-point link.',
      expectedCommands: ['show ip ospf neighbor'] },
    { id: 't2', order: 2, title: 'OSPF routes on R1', device: 'R1', instruction: 'Run show ip route ospf — verify O 10.0.2.0/24 [110/20] via 10.0.12.2.',
      expectedCommands: ['show ip route ospf'] },
    { id: 't3', order: 3, title: 'OSPF interfaces', device: 'R1', instruction: 'Run show ip ospf interface brief — confirm Gi0/0 is in area 0 with a neighbor; Gi0/1 LAN is passive (no neighbor expected).',
      expectedCommands: ['show ip ospf interface brief'] },
    { id: 't4', order: 4, title: 'Protocol summary', device: 'R1', instruction: 'Run show ip protocols — confirm OSPF process 1 and area 0 network statements.',
      expectedCommands: ['show ip protocols'] },
  ],
  verificationCommands: ['show ip ospf neighbor', 'show ip route ospf', 'show ip ospf interface brief', 'show ip protocols'],
  successCriteria: [
    'Neighbor state FULL on both ends of 10.0.12.0/30',
    'Each router learns the remote LAN via O with AD 110',
    'show ip protocols lists OSPF 1 with area 0',
  ],
  failureCriteria: [
    'Neighbor stuck in INIT/2-WAY — area or subnet mismatch',
    'No O routes — network statement wildcard wrong or interface down',
  ],
  commonMistakes: [
    'Checking full table without show ip route ospf filter',
    'Expecting EIGRP AD 90 instead of OSPF AD 110',
    'Verifying only one router — both must exchange routes',
  ],
  source: { name: LAB_SOURCES.blueprint, chapter: '3.4 OSPFv2 verify', confidence: 0.9 },
  metadata: { version: '1', status: 'validated', confidence: 0.9 },
  cliShowOutput: CLI_OSPF_VERIFY_34_SHOW_OUTPUT,
}
const TOPO_OSPF_VERIFY_34 = { id: 'TOPO-OSPF-VERIFY-34', title: 'OSPF area 0 verify', objectiveId: '3.4',
  nodes: [{ id: 'r1', label: 'R1 1.1.1.1', type: 'router', x: 30, y: 45 }, { id: 'r2', label: 'R2 2.2.2.2', type: 'router', x: 70, y: 45 }, { id: 'lan1', label: '10.0.1.0/24', type: 'pc', x: 15, y: 80 }, { id: 'lan2', label: '10.0.2.0/24', type: 'pc', x: 85, y: 80 }],
  links: [{ id: 'l1', source: 'r1', target: 'r2', label: '10.0.12.0/30', status: 'forwarding' }, { id: 'l2', source: 'r1', target: 'lan1', status: 'forwarding' }, { id: 'l3', source: 'r2', target: 'lan2', status: 'forwarding' }] }
const VALIDATOR_OSPF_VERIFY_34 = { labId: 'LAB-OSPF-VERIFY-34', requiredCommands: [
  { device: 'R1', command: 'show ip ospf neighbor' },
  { device: 'R1', command: 'show ip route ospf' },
  { device: 'R1', command: 'show ip ospf interface brief' },
  { device: 'R1', command: 'show ip protocols' },
], verificationChecks: [
  { id: 'v1', device: 'R1', command: 'show ip ospf neighbor', expectedResult: 'FULL', passCondition: 'adjacency up' },
] }
const OSPF_VERIFY_34 = { lab: LAB_OSPF_VERIFY_34, topology: TOPO_OSPF_VERIFY_34, validator: VALIDATOR_OSPF_VERIFY_34,
  diagram: mkDiagram('DIAG-OSPF-VERIFY-34', 'OSPF FULL adjacency', '3.4',
    [{ id: 'r1', label: 'R1', type: 'router', x: 25, y: 50 }, { id: 'r2', label: 'R2', type: 'router', x: 75, y: 50, status: 'highlighted' }],
    [{ id: 'd1', source: 'r1', target: 'r2', label: 'area 0', status: 'forwarding' }]),
  packetFlows: mkFlows('FLOW-OSPF-VERIFY-34', 'LSAs exchanged in area 0', 'DIAG-OSPF-VERIFY-34', ['CKU-OSPF'], [
    { id: 's1', order: 1, title: 'Hello', action: 'R1/R2 form FULL on 10.0.12.0/30', successState: 'noted' },
    { id: 's2', order: 2, title: 'Install routes', action: 'Each router adds O routes for remote LAN', successState: 'forwarded' },
  ]) }

/* ---- OSPF adjacency config (3.4) — network statement + passive-interface trap ---- */
const LAB_OSPF_ADJ_34 = {
  id: 'LAB-OSPF-ADJ-34',
  title: 'Configure OSPFv2 Neighbor Adjacency and Passive Interfaces',
  domainId: 'connectivity',
  objectiveId: '3.4',
  ckuIds: ['CKU-OSPF', 'CKU-OSPF-NEIGHBOR'],
  labType: 'guided',
  interpretOnly: true,
  difficulty: 'intermediate',
  estimatedTimeMinutes: 12,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'R1 and R2 are pre-configured with OSPFv2 in area 0 on 10.0.12.0/30. Each LAN access port (Gi0/1) is passive — hellos suppressed toward hosts. Verify passive-interface settings, FULL adjacency on the link only, and remote LAN routes.',
  learningGoals: [
    'Confirm passive-interface on LAN ports via show ip protocols',
    'Read Gi0/1 as OSPF-enabled but 0/0 neighbors on show ip ospf interface brief',
    'Verify FULL adjacency only on the inter-router Gi0/0 link',
    'Confirm remote LAN routes via show ip route ospf',
  ],
  topologyId: 'TOPO-OSPF-ADJ-34',
  prerequisites: ['CKU-OSPF'],
  tasks: [
    { id: 't1', order: 1, title: 'Passive interfaces', device: 'R1', instruction: 'Run show ip protocols — confirm GigabitEthernet0/1 is listed under Passive Interface(s).',
      expectedCommands: ['show ip protocols'] },
    { id: 't2', order: 2, title: 'OSPF interface roles', device: 'R1', instruction: 'Run show ip ospf interface brief — Gi0/0 has neighbor 1/1; Gi0/1 shows 0/0 neighbors (passive LAN).',
      expectedCommands: ['show ip ospf interface brief'] },
    { id: 't3', order: 3, title: 'Verify adjacency', device: 'R1', instruction: 'Run show ip ospf neighbor — R2 (2.2.2.2) should be FULL on Gi0/0 only.',
      expectedCommands: ['show ip ospf neighbor'] },
    { id: 't4', order: 4, title: 'Verify OSPF routes', device: 'R1', instruction: 'Run show ip route ospf — confirm O 10.0.2.0/24 via 10.0.12.2 with AD 110.',
      expectedCommands: ['show ip route ospf'] },
  ],
  verificationCommands: ['show ip ospf neighbor', 'show ip route ospf', 'show ip protocols', 'show ip ospf interface brief'],
  successCriteria: [
    'FULL adjacency between R1 and R2 on 10.0.12.0/30',
    'No OSPF neighbor on passive LAN interfaces',
    'Each router learns the remote LAN via O with AD 110',
    'show ip protocols lists passive-interface Gi0/1',
  ],
  failureCriteria: [
    'Subnet mask instead of wildcard in network statement — link or LAN not advertised',
    'Missing passive-interface on LAN — hellos sent to hosts; exam trap',
    'Mismatched area numbers — adjacency never reaches FULL',
  ],
  commonMistakes: [
    'Using subnet mask 255.255.255.252 instead of wildcard 0.0.0.3 in network command',
    'Forgetting passive-interface on access LAN — OSPF sends hellos to PCs',
    'Passive-interface on Gi0/0 — kills the only adjacency to R2',
    'Expecting routes before neighbor state reaches FULL',
  ],
  source: { name: LAB_SOURCES.blueprint, chapter: '3.4 OSPFv2 adjacency', confidence: 0.9 },
  metadata: { version: '1', status: 'validated', confidence: 0.9 },
  cliShowOutput: CLI_OSPF_ADJ_34_SHOW_OUTPUT,
}
const TOPO_OSPF_ADJ_34 = { id: 'TOPO-OSPF-ADJ-34', title: 'OSPF adjacency + passive LAN', objectiveId: '3.4',
  nodes: [{ id: 'r1', label: 'R1 1.1.1.1', type: 'router', x: 30, y: 45 }, { id: 'r2', label: 'R2 2.2.2.2', type: 'router', x: 70, y: 45 }, { id: 'lan1', label: 'LAN1 passive', type: 'pc', x: 15, y: 80 }, { id: 'lan2', label: 'LAN2 passive', type: 'pc', x: 85, y: 80 }],
  links: [{ id: 'l1', source: 'r1', target: 'r2', label: '10.0.12.0/30 area 0', status: 'forwarding' }, { id: 'l2', source: 'r1', target: 'lan1', label: 'passive Gi0/1', status: 'forwarding' }, { id: 'l3', source: 'r2', target: 'lan2', label: 'passive Gi0/1', status: 'forwarding' }] }
const VALIDATOR_OSPF_ADJ_34 = { labId: 'LAB-OSPF-ADJ-34', requiredCommands: [
  { device: 'R1', command: 'show ip protocols' },
  { device: 'R1', command: 'show ip ospf interface brief' },
  { device: 'R1', command: 'show ip ospf neighbor' },
  { device: 'R1', command: 'show ip route ospf' },
], verificationChecks: [
  { id: 'v1', device: 'R1', command: 'show ip ospf neighbor', expectedResult: 'FULL', passCondition: 'adjacency up on link only' },
  { id: 'v2', device: 'R1', command: 'show ip protocols', expectedResult: 'Passive Interface(s): GigabitEthernet0/1', passCondition: 'passive LAN listed' },
] }
const OSPF_ADJ_34 = { lab: LAB_OSPF_ADJ_34, topology: TOPO_OSPF_ADJ_34, validator: VALIDATOR_OSPF_ADJ_34,
  diagram: mkDiagram('DIAG-OSPF-ADJ-34', 'Passive LAN vs active link', '3.4',
    [{ id: 'r1', label: 'R1', type: 'router', x: 25, y: 50 }, { id: 'link', label: 'Hellos\nGi0/0', type: 'process', x: 50, y: 35, status: 'highlighted' }, { id: 'r2', label: 'R2', type: 'router', x: 75, y: 50 }, { id: 'lan', label: 'LAN\nno hellos', type: 'pc', x: 25, y: 80 }],
    [{ id: 'd1', source: 'r1', target: 'link', status: 'forwarding' }, { id: 'd2', source: 'link', target: 'r2', status: 'forwarding' }, { id: 'd3', source: 'r1', target: 'lan', label: 'passive', status: 'blocked' }]),
  packetFlows: mkFlows('FLOW-OSPF-ADJ-34', 'Hellos only on router link', 'DIAG-OSPF-ADJ-34', ['CKU-OSPF', 'CKU-OSPF-NEIGHBOR'], [
    { id: 's1', order: 1, title: 'Network statements', action: 'Wildcard masks include link /30 and LAN /24 in area 0', successState: 'matched' },
    { id: 's2', order: 2, title: 'Passive LAN', action: 'passive-interface Gi0/1 suppresses hellos toward hosts', successState: 'noted' },
    { id: 's3', order: 3, title: 'FULL adjacency', action: 'R1 and R2 exchange hellos on Gi0/0 and reach FULL', successState: 'forwarded' },
  ]) }

/* ---- HSRP verify (3.5) ---- */
const LAB_HSRP_VERIFY_35 = {
  id: 'LAB-HSRP-VERIFY-35',
  title: 'Verify HSRP Active and Standby Roles',
  domainId: 'connectivity',
  objectiveId: '3.5',
  ckuIds: ['CKU-HSRP'],
  labType: 'guided',
  interpretOnly: true,
  difficulty: 'beginner',
  estimatedTimeMinutes: 8,
  tools: ['Packet Tracer', 'GNS3'],
  examRelevance: 'core',
  scenario: 'R1 and R2 are configured with HSRP group 1 virtual IP 192.168.1.1/24 on Gi0/0. R1 should be Active (priority 150, preempt); R2 Standby. HSRP is pre-loaded — verify roles and virtual IP without changing configuration.',
  learningGoals: [
    'Read Active/Standby state from show standby brief',
    'Confirm virtual IP and group number match on both routers',
    'Explain preempt and priority from show output',
  ],
  topologyId: 'TOPO-HSRP-VERIFY-35',
  prerequisites: ['CKU-HSRP'],
  tasks: [
    { id: 't1', order: 1, title: 'HSRP summary on R1', device: 'R1', instruction: 'Run show standby brief — R1 Gi0/0 group 1 should be Active with virtual IP 192.168.1.1.',
      expectedCommands: ['show standby brief'] },
    { id: 't2', order: 2, title: 'HSRP detail on R1', device: 'R1', instruction: 'Run show standby — confirm priority 150 and preempt enabled (P flag).',
      expectedCommands: ['show standby'] },
    { id: 't3', order: 3, title: 'Physical vs virtual IP', device: 'R1', instruction: 'Run show ip interface brief — physical Gi0/0 is 192.168.1.2; hosts use virtual 192.168.1.1 as default gateway.',
      expectedCommands: ['show ip interface brief'] },
  ],
  verificationCommands: ['show standby brief', 'show standby', 'show ip interface brief'],
  successCriteria: [
    'R1 Active, R2 Standby for group 1',
    'Virtual IP 192.168.1.1 on both routers',
    'R1 priority 150 with preempt',
  ],
  failureCriteria: [
    'Both routers Active — group/IP mismatch',
    'R2 Active when R1 is up — missing preempt or lower priority on R1',
  ],
  commonMistakes: [
    'Checking physical IP instead of virtual IP for default gateway',
    'Different HSRP group numbers on each router',
    'Forgetting preempt on the intended active router',
  ],
  source: { name: LAB_SOURCES.blueprint, chapter: '3.5 HSRP verify', confidence: 0.9 },
  metadata: { version: '1', status: 'validated', confidence: 0.9 },
  cliShowOutput: CLI_HSRP_VERIFY_35_SHOW_OUTPUT,
}
const TOPO_HSRP_VERIFY_35 = { id: 'TOPO-HSRP-VERIFY-35', title: 'HSRP verify topology', objectiveId: '3.5',
  nodes: [{ id: 'r1', label: 'R1 Active', type: 'router', x: 30, y: 40 }, { id: 'r2', label: 'R2 Standby', type: 'router', x: 70, y: 40 }, { id: 'pc', label: 'GW 192.168.1.1', type: 'pc', x: 50, y: 80 }],
  links: [{ id: 'l1', source: 'r1', target: 'pc', status: 'forwarding' }, { id: 'l2', source: 'r2', target: 'pc', status: 'forwarding' }] }
const VALIDATOR_HSRP_VERIFY_35 = { labId: 'LAB-HSRP-VERIFY-35', requiredCommands: [
  { device: 'R1', command: 'show standby brief' },
  { device: 'R1', command: 'show standby' },
  { device: 'R1', command: 'show ip interface brief' },
], verificationChecks: [
  { id: 'v1', device: 'R1', command: 'show standby brief', expectedResult: 'Active', passCondition: 'R1 is active gateway' },
] }
const HSRP_VERIFY_35 = { lab: LAB_HSRP_VERIFY_35, topology: TOPO_HSRP_VERIFY_35, validator: VALIDATOR_HSRP_VERIFY_35,
  diagram: DIAGRAM_HSRP,
  packetFlows: HSRP.packetFlows,
}

/* =========================================================================
   ROUTING TROUBLESHOOT — static next-hop unreachable (3.6)
   ========================================================================= */
const LAB_TS_STATIC_NH = tsLab('LAB-TS-STATIC-NH', 'Troubleshoot Static Route with Unreachable Next-Hop', '3.6', 'connectivity',
  'Symptom: Branch PC cannot reach 172.16.50.0/24. `show running-config` lists `ip route 172.16.50.0 255.255.255.0 10.0.12.99` but `show ip route` has no S entry — next-hop 10.0.12.99 is not reachable on the 10.0.12.0/30 link (R2 is 10.0.12.2). Fix the static route next-hop to 10.0.12.2.',
  [
    { id: 't1', order: 1, title: 'Confirm symptom', device: 'R1', instruction: 'Run show ip route 172.16.50.0 — route not installed. Run show ip route static — empty or missing entry.',
      expectedCommands: ['show ip route 172.16.50.0', 'show ip route static'] },
    { id: 't2', order: 2, title: 'Find bad next-hop', device: 'R1', instruction: 'Run show running-config | include ip route — note next-hop 10.0.12.99. Run show ip interface brief — Gi0/1 is 10.0.12.1/30; only .2 is reachable.',
      expectedCommands: ['show running-config | include ip route', 'show ip interface brief'] },
    { id: 't3', order: 3, title: 'Fix static route', device: 'R1', instruction: 'Remove the bad route and add ip route 172.16.50.0 255.255.255.0 10.0.12.2.',
      expectedCommands: ['no ip route 172.16.50.0 255.255.255.0 10.0.12.99', 'ip route 172.16.50.0 255.255.255.0 10.0.12.2'] },
    { id: 't4', order: 4, title: 'Verify install', device: 'R1', instruction: 'Confirm S entry appears in the routing table.',
      expectedCommands: ['show ip route static'] },
  ],
  [{ device: 'R1', command: 'ip route 172.16.50.0 255.255.255.0 10.0.12.2' }],
  ['show ip route static', 'show running-config | include ip route'],
  ['Changing OSPF instead of fixing static next-hop', 'Assuming config in running-config always installs into RIB'])

const TS_STATIC_NH = tsBundle(LAB_TS_STATIC_NH,
  [{ id: 'r1', label: 'R1 bad static NH', type: 'router', x: 40, y: 50, status: 'error' }, { id: 'r2', label: 'R2 .12.2', type: 'router', x: 75, y: 50 }, { id: 'lan', label: '172.16.50.0/24', type: 'pc', x: 75, y: 80 }],
  [{ id: 'l1', source: 'r1', target: 'r2', label: '10.0.12.0/30', status: 'blocked' }, { id: 'l2', source: 'r2', target: 'lan', status: 'forwarding' }],
  [{ device: 'R1', command: 'ip route 172.16.50.0 255.255.255.0 10.0.12.2' }])

/* =========================================================================
   AUTOMATION DOMAIN — interpret-only lab-lite (6.1–6.6)
   Static show output only — no live API. Works via lab.cliShowOutput in LabView.
   ========================================================================= */
function autoInterpretBundle(lab, cliShowOutput, topoNodes, topoLinks, diagramNodes, diagramLinks, flowSteps, verifyChecks) {
  const topo = { id: lab.topologyId, title: lab.title, objectiveId: lab.objectiveId, nodes: topoNodes, links: topoLinks }
  const validator = {
    labId: lab.id,
    requiredCommands: lab.tasks.flatMap(t => (t.expectedCommands || []).filter(c => c !== 'enable').map(c => ({ device: t.device, command: c }))),
    verificationChecks: verifyChecks,
  }
  const diagram = mkDiagram(`DIAG-${lab.id}`, lab.title, lab.objectiveId, diagramNodes, diagramLinks)
  return {
    lab: { ...lab, cliShowOutput },
    topology: topo,
    validator,
    diagram,
    packetFlows: mkFlows(`FLOW-${lab.id}`, lab.title, `DIAG-${lab.id}`, lab.ckuIds, flowSteps),
  }
}

function autoLabBase(id, title, objectiveId, ckuIds, chapter, scenario, goals, mistakes) {
  return {
    id, title, domainId: 'automation', objectiveId, ckuIds,
    labType: 'guided', interpretOnly: true,
    difficulty: 'beginner', estimatedTimeMinutes: 10,
    tools: ['Ansible', 'Postman', 'DNA Center'],
    examRelevance: 'core', scenario, learningGoals: goals,
    topologyId: `TOPO-${id}`, prerequisites: [],
    commonMistakes: mistakes,
    source: { name: LAB_SOURCES.blueprint, chapter, confidence: 0.9 },
    metadata: { version: '1', status: 'validated', confidence: 0.9 },
  }
}

/* ---- 6.1 Automation impact ---- */
const CLI_AUTO_MGMT_61 = {
  'show automation summary': `Automation Operations Dashboard (static snapshot)
────────────────────────────────────────────────────
Deployment model     Manual CLI (baseline)  →  Ansible playbook
Devices touched      48 edge switches
Last manual change   4h 12m (per-device login, copy/paste errors)
Last playbook run    6m 04s (parallel, idempotent)
Config drift events  0 after last playbook (desired state enforced)
Human error rate     Manual: 3.2%  |  Automated: 0.1%
Version control      Git repo: network-config/main  (Infrastructure as Code)`,
  'show automation playbook log': `PLAY [Push VLAN 20 access template to branch switches] ***********************

TASK [Ensure VLAN 20 exists] **************************************************
ok: [SW-BR01]  ok: [SW-BR02]  ok: [SW-BR03]  ... (48 hosts)

TASK [Apply access port template to Fa0/5-24] *********************************
changed: [SW-BR12]  changed: [SW-BR19]
ok: [all others — already compliant]

PLAY RECAP ********************************************************************
48 hosts ok, 2 changed, 0 failed, 0 unreachable`,
  'show automation diff': `--- running-config (SW-BR12 Fa0/8)     +++ desired-state (template)
-switchport access vlan 10              +switchport access vlan 20
+description Sales access               +description Sales access

Note: Playbook reapplies template until device matches desired state (idempotent).`,
}

const LAB_AUTO_MGMT_61 = autoLabBase(
  'LAB-AUTO-MGMT-61', 'Interpret Automation Impact on Network Operations', '6.1', ['CKU-AUTOMATION'],
  '6.1 Automation impact',
  'Your team replaced box-by-box CLI VLAN changes with an Ansible playbook stored in Git. The automation console is pre-loaded — read the summary, playbook log, and config diff to explain why automation scales expert knowledge and reduces human error (Infrastructure as Code).',
  ['Compare manual CLI vs playbook deployment time', 'Explain idempotent desired-state enforcement', 'Identify Git/version control as Infrastructure as Code'],
  ['Assuming automation removes need for networking fundamentals', 'Thinking scripts guarantee zero outages without validation windows'],
)

const AUTO_MGMT_61 = autoInterpretBundle(
  {
    ...LAB_AUTO_MGMT_61,
    tasks: [
      { id: 't1', order: 1, title: 'Automation summary', device: 'AUTO', instruction: 'Run show automation summary — note parallel deployment time vs manual per-device CLI and the drift/error comparison.',
        expectedCommands: ['enable', 'show automation summary'] },
      { id: 't2', order: 2, title: 'Playbook execution log', device: 'AUTO', instruction: 'Run show automation playbook log — confirm idempotent ok/changed counts across 48 hosts.',
        expectedCommands: ['show automation playbook log'] },
      { id: 't3', order: 3, title: 'Config drift diff', device: 'AUTO', instruction: 'Run show automation diff — read how desired-state template corrects VLAN mismatch on SW-BR12.',
        expectedCommands: ['show automation diff'] },
    ],
    verificationCommands: ['show automation summary', 'show automation playbook log', 'show automation diff'],
    successCriteria: ['Playbook completed in minutes vs hours of manual CLI', 'Idempotent replay shows ok on compliant devices', 'Git-backed templates define desired state'],
    failureCriteria: ['Claiming automation eliminates need for design/troubleshooting skills'],
    commonMistakes: LAB_AUTO_MGMT_61.commonMistakes,
  },
  CLI_AUTO_MGMT_61,
  [{ id: 'git', label: 'Git repo', type: 'server', x: 20, y: 40 }, { id: 'auto', label: 'Ansible', type: 'process', x: 50, y: 40, status: 'highlighted' }, { id: 'sw', label: '48 switches', type: 'switch', x: 80, y: 40 }],
  [{ id: 'l1', source: 'git', target: 'auto', status: 'forwarding' }, { id: 'l2', source: 'auto', target: 'sw', status: 'forwarding' }],
  [{ id: 'manual', label: 'Manual CLI\n(per device)', type: 'process', x: 25, y: 55 }, { id: 'play', label: 'Playbook\n(parallel)', type: 'process', x: 75, y: 55, status: 'highlighted' }],
  [{ id: 'd1', source: 'manual', target: 'play', status: 'forwarding' }],
  [
    { id: 's1', order: 1, title: 'Define intent', action: 'Engineer commits VLAN template to Git (Infrastructure as Code)', successState: 'noted' },
    { id: 's2', order: 2, title: 'Push state', action: 'Ansible applies desired config to all switches in parallel', successState: 'forwarded' },
    { id: 's3', order: 3, title: 'Verify drift', action: 'Diff shows any device still out of compliance', successState: 'noted' },
  ],
  [
    { id: 'v1', device: 'AUTO', command: 'show automation summary', expectedResult: 'Playbook 6m vs manual 4h+', passCondition: 'automation faster with lower error rate' },
    { id: 'v2', device: 'AUTO', command: 'show automation playbook log', expectedResult: '48 hosts ok, idempotent', passCondition: 'parallel playbook success' },
  ],
)

/* ---- 6.2 Traditional vs controller-based ---- */
const CLI_AUTO_CTRL_62 = {
  'show network mode': `Network Management Model Report
────────────────────────────────
Traditional (distributed):
  - Each router/switch runs its own control plane (OSPF, STP, ACL logic)
  - Engineer SSH/Telnet to each device CLI individually
  - No central policy view; config drift common

Controller-based (centralized):
  - SDN controller holds control-plane decisions (DNA Center, APIC-EM)
  - Devices retain data plane (forwarding at line rate)
  - Policy pushed via southbound APIs (NETCONF/REST) — not box-by-box CLI`,
  'show controller devices': `Controller Inventory (DNA Center)
Device ID    Hostname      Role           Reachability  Config Source
────────────────────────────────────────────────────────────────────
dev-001      CORE-R1       Border Router  REACHABLE     Controller
dev-002      DIST-SW1      Distribution   REACHABLE     Controller
dev-003      ACCESS-SW12   Access         REACHABLE     Controller

Managed devices: 3   |   CLI-only (unmanaged): 0`,
  'show controller policy': `Intent Policy: Branch-QoS-Voice
Status: COMPLIANT (verified 2m ago)
Applied to: 3 devices via NETCONF push
Traditional equivalent: 3 separate CLI sessions, manual copy/paste`,
}

const LAB_AUTO_CTRL_62 = autoLabBase(
  'LAB-AUTO-CTRL-62', 'Compare Traditional and Controller-Based Networking', '6.2', ['CKU-SDN-TRAD'],
  '6.2 Traditional vs controller-based',
  'DNA Center manages three campus devices centrally. Read show output comparing distributed CLI management with controller-based policy push — control plane centralized, data plane remains on devices.',
  ['Contrast distributed control plane vs centralized controller', 'Identify southbound push vs per-device CLI', 'Explain data plane stays on switches/routers'],
  ['Thinking SDN removes all intelligence from switches — data plane still forwards locally', 'Confusing management plane SSH with southbound NETCONF/REST'],
)

const AUTO_CTRL_62 = autoInterpretBundle(
  {
    ...LAB_AUTO_CTRL_62,
    tasks: [
      { id: 't1', order: 1, title: 'Network mode comparison', device: 'CTRL', instruction: 'Run show network mode — list differences between traditional distributed control and controller-based centralized policy.',
        expectedCommands: ['enable', 'show network mode'] },
      { id: 't2', order: 2, title: 'Controller inventory', device: 'CTRL', instruction: 'Run show controller devices — confirm all devices are controller-managed with REACHABLE status.',
        expectedCommands: ['show controller devices'] },
      { id: 't3', order: 3, title: 'Centralized policy', device: 'CTRL', instruction: 'Run show controller policy — note single intent applied to multiple devices vs manual CLI sessions.',
        expectedCommands: ['show controller policy'] },
    ],
    verificationCommands: ['show network mode', 'show controller devices', 'show controller policy'],
    successCriteria: ['Control plane centralized on controller', 'Data plane forwarding stays on devices', 'Policy pushed to 3 devices from one intent'],
    failureCriteria: ['Expecting OpenFlow to replace all IOS forwarding on every CCNA device'],
    commonMistakes: LAB_AUTO_CTRL_62.commonMistakes,
  },
  CLI_AUTO_CTRL_62,
  [{ id: 'ctrl', label: 'Controller', type: 'server', x: 50, y: 20, status: 'highlighted' }, { id: 'r1', label: 'R1', type: 'router', x: 25, y: 70 }, { id: 'sw1', label: 'SW1', type: 'switch', x: 50, y: 70 }, { id: 'sw2', label: 'SW2', type: 'switch', x: 75, y: 70 }],
  [{ id: 'l1', source: 'ctrl', target: 'r1', label: 'southbound', status: 'forwarding' }, { id: 'l2', source: 'ctrl', target: 'sw1', status: 'forwarding' }, { id: 'l3', source: 'ctrl', target: 'sw2', status: 'forwarding' }],
  [{ id: 'trad', label: 'Traditional\nCLI each box', type: 'process', x: 25, y: 50 }, { id: 'sdn', label: 'Controller\npolicy push', type: 'process', x: 75, y: 50, status: 'highlighted' }],
  [{ id: 'd1', source: 'trad', target: 'sdn', status: 'forwarding' }],
  [
    { id: 's1', order: 1, title: 'Traditional', action: 'Each device decides OSPF/STP/ACL independently via local CLI', successState: 'noted' },
    { id: 's2', order: 2, title: 'Controller', action: 'Controller computes policy, pushes to devices via southbound API', successState: 'forwarded' },
    { id: 's3', order: 3, title: 'Forward', action: 'Devices still switch/route packets at line rate (data plane)', successState: 'noted' },
  ],
  [
    { id: 'v1', device: 'CTRL', command: 'show network mode', expectedResult: 'Centralized control, distributed data plane', passCondition: 'SDN model understood' },
    { id: 'v2', device: 'CTRL', command: 'show controller policy', expectedResult: 'COMPLIANT on 3 devices', passCondition: 'intent-based push' },
  ],
)

/* ---- 6.3 SDN architecture ---- */
const CLI_AUTO_SDN_63 = {
  'show sdn architecture': `SDN Architectural Planes
──────────────────────────
Application / Orchestration (above controller)
    ↑ Northbound APIs (REST/JSON) — apps talk TO controller
    │
SDN Controller (control plane centralized)
    ↓ Southbound APIs — controller talks TO devices
        NETCONF, RESTCONF, OpenFlow, SNMP, CLI
Network Devices (data plane distributed — forward packets)`,
  'show sdn northbound': `Northbound API Endpoints (REST/JSON)
Base URL: https://controller.local/api/v1

GET  /topology           — graph of nodes/links for apps
GET  /policies           — read intent policies
POST /policies           — create new intent
GET  /telemetry/flows    — analytics for assurance apps

Used by: DNA Center GUI, custom Python scripts, ITSM integrations`,
  'show sdn southbound': `Southbound Device Sessions
Device        Protocol    State      Last Push
────────────────────────────────────────────────
CORE-R1       NETCONF     connected  00:02:11 ago
DIST-SW1      NETCONF     connected  00:02:09 ago
ACCESS-SW12   RESTCONF    connected  00:02:15 ago

Note: Southbound = controller → device. Northbound = app → controller.`,
}

const LAB_AUTO_SDN_63 = autoLabBase(
  'LAB-AUTO-SDN-63', 'Interpret SDN Control and Data Plane Architecture', '6.3', ['CKU-SDN-ARCH'],
  '6.3 SDN architectures',
  'An SDN controller exposes northbound REST APIs to orchestration apps and uses southbound NETCONF/RESTCONF to program devices. Read the architecture summary and API listings — no live controller connection.',
  ['Map northbound vs southbound API direction', 'Place control plane on controller, data plane on devices', 'Name common southbound protocols (NETCONF, RESTCONF)'],
  ['Reversing northbound/southbound direction', 'Assuming OpenFlow is the only southbound option on CCNA'],
)

const AUTO_SDN_63 = autoInterpretBundle(
  {
    ...LAB_AUTO_SDN_63,
    tasks: [
      { id: 't1', order: 1, title: 'SDN planes', device: 'CTRL', instruction: 'Run show sdn architecture — identify where control plane lives vs where packets are forwarded.',
        expectedCommands: ['enable', 'show sdn architecture'] },
      { id: 't2', order: 2, title: 'Northbound APIs', device: 'CTRL', instruction: 'Run show sdn northbound — these REST endpoints face applications above the controller.',
        expectedCommands: ['show sdn northbound'] },
      { id: 't3', order: 3, title: 'Southbound sessions', device: 'CTRL', instruction: 'Run show sdn southbound — controller pushes config to devices via NETCONF/RESTCONF.',
        expectedCommands: ['show sdn southbound'] },
    ],
    verificationCommands: ['show sdn architecture', 'show sdn northbound', 'show sdn southbound'],
    successCriteria: ['Northbound = app→controller REST', 'Southbound = controller→device NETCONF/RESTCONF', 'Data plane remains on network devices'],
    failureCriteria: ['Placing data plane on controller — it stays distributed on devices'],
    commonMistakes: LAB_AUTO_SDN_63.commonMistakes,
  },
  CLI_AUTO_SDN_63,
  [{ id: 'app', label: 'Orchestration app', type: 'pc', x: 50, y: 10 }, { id: 'ctrl', label: 'SDN Controller', type: 'server', x: 50, y: 45, status: 'highlighted' }, { id: 'dev', label: 'IOS devices', type: 'router', x: 50, y: 80 }],
  [{ id: 'l1', source: 'app', target: 'ctrl', label: 'northbound REST', status: 'forwarding' }, { id: 'l2', source: 'ctrl', target: 'dev', label: 'southbound NETCONF', status: 'forwarding' }],
  [{ id: 'nb', label: 'Northbound\n(app → ctrl)', type: 'process', x: 30, y: 50, status: 'highlighted' }, { id: 'sb', label: 'Southbound\n(ctrl → device)', type: 'process', x: 70, y: 50 }],
  [{ id: 'd1', source: 'nb', target: 'sb', status: 'forwarding' }],
  [
    { id: 's1', order: 1, title: 'Northbound', action: 'GUI/Python calls REST on controller to declare intent', successState: 'noted' },
    { id: 's2', order: 2, title: 'Southbound', action: 'Controller translates intent into device-specific NETCONF config', successState: 'forwarded' },
    { id: 's3', order: 3, title: 'Forward', action: 'Switch/router data plane forwards frames/packets locally', successState: 'noted' },
  ],
  [
    { id: 'v1', device: 'CTRL', command: 'show sdn architecture', expectedResult: 'Control centralized, data distributed', passCondition: 'plane separation' },
    { id: 'v2', device: 'CTRL', command: 'show sdn southbound', expectedResult: 'NETCONF connected', passCondition: 'southbound push' },
  ],
)

/* ---- 6.4 DNA Center ---- */
const CLI_AUTO_DNA_64 = {
  'show dna inventory': `Cisco DNA Center — Device Inventory
Site: Branch-East    Total devices: 12
────────────────────────────────────────────────────────
Hostname     Model          SW Version   Reachability
ACCESS-SW01  C9300-48P      17.9.4       REACHABLE
ACCESS-SW02  C9300-24P      17.9.4       REACHABLE
BR-RTR01     ISR4331        17.9.4       REACHABLE
...
Image golden standard: 17.9.4 (2 devices pending upgrade)`,
  'show dna assurance health': `Assurance — Client Health (last 24h)
Overall score: 92/100

Top issue: DHCP latency on VLAN 20 (3 clients affected)
Root cause hint: helper-address missing on DIST-SW1 SVI (see ticket INC-4421)
Wireless RF score: 88  |  Wired connectivity: 96`,
  'show dna provision status': `Provisioning Workflow: Branch-Onboarding
Status: SUCCEEDED
Steps completed:
  [✓] Discover devices via CDP/LLDP
  [✓] Assign to site Branch-East
  [✓] Push day-zero config template (SSH, SNMP, VLANs)
  [✓] Verify intent compliance

Traditional equivalent: 12 manual CLI onboarding sessions`,
}

const LAB_AUTO_DNA_64 = autoLabBase(
  'LAB-AUTO-DNA-64', 'Compare DNA Center with Traditional Campus Management', '6.4', ['CKU-DNA'],
  '6.4 DNA Center vs traditional',
  'DNA Center provides centralized design, provisioning, assurance, and image management for a 12-device branch. Read inventory, assurance health, and provisioning workflow output — contrast with box-by-box CLI onboarding.',
  ['Identify DNA Center pillars: design, provision, assure, automate', 'Read assurance health scores and root-cause hints', 'Contrast template provisioning vs manual CLI onboarding'],
  ['Expecting DNA Center to replace all CLI troubleshooting on exam', 'Confusing assurance telemetry with southbound config push'],
)

const AUTO_DNA_64 = autoInterpretBundle(
  {
    ...LAB_AUTO_DNA_64,
    tasks: [
      { id: 't1', order: 1, title: 'Device inventory', device: 'DNA', instruction: 'Run show dna inventory — note centralized view of models, software versions, and reachability.',
        expectedCommands: ['enable', 'show dna inventory'] },
      { id: 't2', order: 2, title: 'Assurance health', device: 'DNA', instruction: 'Run show dna assurance health — read overall score and AI-driven root-cause hint.',
        expectedCommands: ['show dna assurance health'] },
      { id: 't3', order: 3, title: 'Provisioning workflow', device: 'DNA', instruction: 'Run show dna provision status — compare automated onboarding template vs 12 manual CLI sessions.',
        expectedCommands: ['show dna provision status'] },
    ],
    verificationCommands: ['show dna inventory', 'show dna assurance health', 'show dna provision status'],
    successCriteria: ['12 devices managed from one dashboard', 'Assurance score with actionable root cause', 'Template provisioning succeeded'],
    failureCriteria: ['Assuming DNA Center eliminates need for IOS show commands on devices'],
    commonMistakes: LAB_AUTO_DNA_64.commonMistakes,
  },
  CLI_AUTO_DNA_64,
  [{ id: 'dna', label: 'DNA Center', type: 'server', x: 50, y: 25, status: 'highlighted' }, { id: 'site', label: 'Branch-East\n12 devices', type: 'switch', x: 50, y: 75 }],
  [{ id: 'l1', source: 'dna', target: 'site', label: 'intent', status: 'forwarding' }],
  [{ id: 'cli', label: 'Traditional\n12× CLI', type: 'process', x: 25, y: 55 }, { id: 'dnaP', label: 'DNA template\nprovision', type: 'process', x: 75, y: 55, status: 'highlighted' }],
  [{ id: 'd1', source: 'cli', target: 'dnaP', status: 'forwarding' }],
  [
    { id: 's1', order: 1, title: 'Design', action: 'Admin declares site intent in DNA Center GUI', successState: 'noted' },
    { id: 's2', order: 2, title: 'Provision', action: 'Template pushes day-zero config to discovered devices', successState: 'forwarded' },
    { id: 's3', order: 3, title: 'Assure', action: 'Telemetry feeds health score and root-cause analysis', successState: 'noted' },
  ],
  [
    { id: 'v1', device: 'DNA', command: 'show dna inventory', expectedResult: '12 devices REACHABLE', passCondition: 'centralized inventory' },
    { id: 'v2', device: 'DNA', command: 'show dna assurance health', expectedResult: 'Score 92 with root cause', passCondition: 'assurance analytics' },
  ],
)

/* ---- 6.5 REST APIs ---- */
const CLI_AUTO_REST_65 = {
  'show rest get /dna/intent/api/v1/network-device': `HTTP/1.1 200 OK
Content-Type: application/json
Date: Tue, 30 Jun 2026 14:22:01 GMT

{
  "response": [
    {
      "id": "a1b2c3d4-1111-2222-3333-444455556666",
      "hostname": "CORE-R1",
      "managementIpAddress": "10.10.1.1",
      "role": "BORDER ROUTER",
      "reachabilityStatus": "Reachable"
    }
  ]
}`,
  'show rest methods': `REST HTTP Methods (CRUD mapping)
─────────────────────────────────
GET     — retrieve resource (read-only, safe)
POST    — create new resource
PUT     — replace entire resource
PATCH   — partial update
DELETE  — remove resource

Stateless: each request carries auth + all needed context; server stores no client session.`,
  'show rest response codes': `Common HTTP Status Codes
──────────────────────────
200 OK           — GET succeeded, body contains resource
201 Created      — POST created new resource
204 No Content   — DELETE succeeded, empty body
400 Bad Request  — malformed JSON or missing field
401 Unauthorized — missing/invalid token
404 Not Found    — URL resource does not exist
500 Server Error — controller internal failure`,
}

const LAB_AUTO_REST_65 = autoLabBase(
  'LAB-AUTO-REST-65', 'Interpret REST API Responses and HTTP Methods', '6.5', ['CKU-REST'],
  '6.5 REST-based APIs',
  'A DNA Center REST GET for network devices returned HTTP 200 with a JSON body. Read the static response, HTTP method reference, and status code list — typical northbound API interaction with no live call.',
  ['Map GET/POST/PUT/DELETE to CRUD operations', 'Read JSON key-value fields in a 200 response', 'Match HTTP status codes 200/201/400/401/404/500 to situations'],
  ['Thinking REST requires SOAP/XML on CCNA — JSON is standard', 'Assuming 401 means server down — it means auth failure'],
)

const AUTO_REST_65 = autoInterpretBundle(
  {
    ...LAB_AUTO_REST_65,
    tasks: [
      { id: 't1', order: 1, title: 'GET device list', device: 'API', instruction: 'Run show rest get /dna/intent/api/v1/network-device — read HTTP 200, Content-Type application/json, and hostname/reachability fields.',
        expectedCommands: ['enable', 'show rest get /dna/intent/api/v1/network-device'] },
      { id: 't2', order: 2, title: 'HTTP methods', device: 'API', instruction: 'Run show rest methods — match GET to retrieve and POST to create.',
        expectedCommands: ['show rest methods'] },
      { id: 't3', order: 3, title: 'Status codes', device: 'API', instruction: 'Run show rest response codes — know 401 Unauthorized vs 404 Not Found vs 500 Server Error.',
        expectedCommands: ['show rest response codes'] },
    ],
    verificationCommands: ['show rest get /dna/intent/api/v1/network-device', 'show rest methods', 'show rest response codes'],
    successCriteria: ['200 OK with JSON array of devices', 'GET is read-only retrieve', '401 = auth failure, 404 = bad URL'],
    failureCriteria: ['Confusing PUT (full replace) with PATCH (partial update)'],
    commonMistakes: LAB_AUTO_REST_65.commonMistakes,
  },
  CLI_AUTO_REST_65,
  [{ id: 'app', label: 'Python script', type: 'pc', x: 25, y: 50 }, { id: 'api', label: 'REST API', type: 'server', x: 55, y: 50, status: 'highlighted' }, { id: 'ctrl', label: 'Controller', type: 'server', x: 85, y: 50 }],
  [{ id: 'l1', source: 'app', target: 'api', label: 'GET + JSON', status: 'forwarding' }, { id: 'l2', source: 'api', target: 'ctrl', status: 'forwarding' }],
  [{ id: 'get', label: 'GET /devices\n200 JSON', type: 'process', x: 50, y: 70, status: 'highlighted' }],
  [],
  [
    { id: 's1', order: 1, title: 'Request', action: 'Client sends HTTP GET with Authorization header to resource URL', successState: 'noted' },
    { id: 's2', order: 2, title: 'Response', action: 'Server returns 200 OK and JSON payload — stateless, no session stored', successState: 'noted' },
    { id: 's3', order: 3, title: 'Parse', action: 'App reads hostname, managementIpAddress, reachabilityStatus keys', successState: 'forwarded' },
  ],
  [
    { id: 'v1', device: 'API', command: 'show rest get /dna/intent/api/v1/network-device', expectedResult: '200 OK JSON device list', passCondition: 'REST GET response parsed' },
    { id: 'v2', device: 'API', command: 'show rest response codes', expectedResult: '401 Unauthorized = auth', passCondition: 'status codes known' },
  ],
)

/* ---- 6.6 JSON and config management ---- */
const CLI_AUTO_JSON_66 = {
  'show json payload': `Sample API JSON (device interface status)
{
  "interface": "GigabitEthernet0/0",
  "adminStatus": "up",
  "operStatus": "up",
  "ipAddress": "192.168.1.1",
  "vlan": null,
  "errors": []
}

JSON rules: keys in double quotes, strings quoted, numbers bare,
arrays [ ], objects { }, null/boolean literals allowed.`,
  'show ansible playbook': `PLAYBOOK: deploy-snmp.yml (YAML — Ansible playbooks)
──────────────────────────────────────────────────────
- name: Configure SNMP on routers
  hosts: routers
  connection: network_cli
  tasks:
    - name: Ensure SNMP community
      cisco.ios.ios_config:
        lines:
          - snmp-server community PUBLIC RO
          - snmp-server location Branch-East

Agentless: Ansible uses SSH; no agent on IOS devices.`,
  'show ansible inventory': `INVENTORY: inventory.yml
────────────────────────
all:
  children:
    routers:
      hosts:
        BR-RTR01:
          ansible_host: 10.10.1.1
    switches:
      hosts:
        ACCESS-SW01:
          ansible_host: 10.10.2.1

Puppet/Chef contrast: agent-based pull model (device checks in to master).`,
}

const LAB_AUTO_JSON_66 = autoLabBase(
  'LAB-AUTO-JSON-66', 'Interpret JSON Payloads and Ansible Playbooks', '6.6', ['CKU-JSON-ANSIBLE'],
  '6.6 JSON and config management',
  'Network automation exchanges JSON over REST and uses Ansible YAML playbooks for desired-state config. Read a sample JSON interface payload, an SNMP playbook snippet, and inventory — compare Ansible (agentless SSH) with agent-based Puppet/Chef.',
  ['Parse JSON key-value pairs and null/array syntax', 'Read Ansible playbook structure (hosts, tasks, modules)', 'Contrast agentless Ansible vs agent-based Puppet/Chef'],
  ['Using single quotes in JSON — keys/strings require double quotes', 'Thinking Ansible requires an agent on Cisco IOS'],
)

const AUTO_JSON_66 = autoInterpretBundle(
  {
    ...LAB_AUTO_JSON_66,
    tasks: [
      { id: 't1', order: 1, title: 'JSON interface payload', device: 'API', instruction: 'Run show json payload — identify adminStatus, operStatus, and ipAddress keys.',
        expectedCommands: ['enable', 'show json payload'] },
      { id: 't2', order: 2, title: 'Ansible playbook', device: 'AUTO', instruction: 'Run show ansible playbook — note YAML list structure, hosts group, and ios_config module (agentless SSH).',
        expectedCommands: ['show ansible playbook'] },
      { id: 't3', order: 3, title: 'Inventory and tools', device: 'AUTO', instruction: 'Run show ansible inventory — compare agentless Ansible SSH model with Puppet/Chef pull agents noted in output.',
        expectedCommands: ['show ansible inventory'] },
    ],
    verificationCommands: ['show json payload', 'show ansible playbook', 'show ansible inventory'],
    successCriteria: ['JSON keys parsed correctly', 'Playbook targets routers group via SSH', 'Ansible agentless vs Puppet/Chef agent-based understood'],
    failureCriteria: ['Confusing YAML playbook syntax with JSON API payload'],
    commonMistakes: LAB_AUTO_JSON_66.commonMistakes,
  },
  CLI_AUTO_JSON_66,
  [{ id: 'api', label: 'REST JSON', type: 'server', x: 30, y: 45 }, { id: 'ans', label: 'Ansible', type: 'process', x: 70, y: 45, status: 'highlighted' }, { id: 'dev', label: 'IOS devices', type: 'router', x: 70, y: 75 }],
  [{ id: 'l1', source: 'ans', target: 'dev', label: 'SSH', status: 'forwarding' }, { id: 'l2', source: 'api', target: 'dev', label: 'telemetry JSON', status: 'forwarding' }],
  [{ id: 'json', label: 'JSON\nkey-value', type: 'process', x: 30, y: 70, status: 'highlighted' }, { id: 'yaml', label: 'YAML\nplaybook', type: 'process', x: 70, y: 70 }],
  [{ id: 'd1', source: 'json', target: 'yaml', status: 'forwarding' }],
  [
    { id: 's1', order: 1, title: 'JSON', action: 'API returns {"adminStatus":"up"} for assurance apps', successState: 'noted' },
    { id: 's2', order: 2, title: 'Playbook', action: 'Ansible applies ios_config lines over SSH to all routers', successState: 'forwarded' },
    { id: 's3', order: 3, title: 'Contrast', action: 'Puppet/Chef agents pull from master — different model than Ansible', successState: 'noted' },
  ],
  [
    { id: 'v1', device: 'API', command: 'show json payload', expectedResult: 'adminStatus up, ipAddress set', passCondition: 'JSON parsed' },
    { id: 'v2', device: 'AUTO', command: 'show ansible playbook', expectedResult: 'ios_config over network_cli', passCondition: 'agentless playbook' },
  ],
)

export const EXTENDED_LAB_BUNDLES = [
  HSRP, HSRP_VERIFY_35, ROUTE_FORWARD_32, OSPF_VERIFY_34, OSPF_ADJ_34,
  DHCP_RELAY, DHCP_SNOOP_27, ETHERCHANNEL, STP, DEVICE_ACCESS, NTP, AAA, SYSLOG,
  TS_OSPF, TS_TRUNK, TS_IF, TS_ACL, TS_ROUTE, TS_DHCP, TS_HSRP, TS_MASK, TS_STATIC_NH,
  WIRELESS_26, DHCP_DNS_43, DHCP_POOL_43, SNMP_CONFIG_44, TFTP_CONFIG_49,
  DEVICE_ACCESS_53, ACL_CONFIG_55, PORTSEC_56, ROUTE_TABLE_31,
  AUTO_MGMT_61, AUTO_CTRL_62, AUTO_SDN_63, AUTO_DNA_64, AUTO_REST_65, AUTO_JSON_66,
]
