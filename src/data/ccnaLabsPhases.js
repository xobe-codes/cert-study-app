/* Phases 1–4 labs — port security, NAT, SVI, STP edge, IPv6, OSPF default, wireless, LLDP, SNMP, EtherChannel variants. */

import { CLI_TS_SHOW_OUTPUT } from '../lab/cliEngine.js'

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

function guidedBundle(lab, topoNodes, topoLinks, requiredCommands, verifyCmd, verifyExpect, diagramNodes, diagramLinks, flowSteps, ckuIds = ['CKU-TROUBLESHOOTING']) {
  const topo = { id: lab.topologyId, title: lab.title, objectiveId: lab.objectiveId, nodes: topoNodes, links: topoLinks }
  const validator = {
    labId: lab.id,
    requiredCommands,
    verificationChecks: [{ id: 'v1', device: requiredCommands[0]?.device || 'R1', command: verifyCmd, expectedResult: verifyExpect, passCondition: 'ok' }],
  }
  const diagram = mkDiagram(`DIAG-${lab.id}`, lab.title, lab.objectiveId, diagramNodes, diagramLinks)
  const packetFlows = mkFlows(`FLOW-${lab.id}`, lab.title, `DIAG-${lab.id}`, lab.ckuIds || ckuIds, flowSteps)
  return { lab, topology: topo, validator, diagram, packetFlows }
}

function mkGuided(opts) {
  const lab = {
    id: opts.id,
    title: opts.title,
    domainId: opts.domainId,
    objectiveId: opts.objectiveId,
    ckuIds: opts.ckuIds,
    labType: 'guided',
    difficulty: opts.difficulty || 'intermediate',
    estimatedTimeMinutes: opts.minutes || 15,
    tools: ['Packet Tracer', 'GNS3'],
    examRelevance: 'core',
    scenario: opts.scenario,
    learningGoals: opts.goals,
    topologyId: `TOPO-${opts.id}`,
    prerequisites: opts.prerequisites || [],
    tasks: opts.tasks,
    verificationCommands: opts.verify || [],
    successCriteria: opts.success,
    failureCriteria: opts.failure || ['Misconfigured interface or wrong VLAN'],
    commonMistakes: opts.mistakes,
    source: { name: LAB_SOURCES.blueprint, chapter: opts.chapter, confidence: 0.9 },
    metadata: { version: '1', status: 'validated', confidence: 0.9 },
  }
  return guidedBundle(
    lab, opts.topoNodes, opts.topoLinks, opts.required, opts.verifyCmd, opts.verifyExpect,
    opts.diagNodes, opts.diagLinks, opts.flowSteps,
  )
}

/** Teach-first interpret lab — static cliShowOutput, no live API. */
function mkInterpretGuided(opts) {
  const lab = {
    id: opts.id,
    title: opts.title,
    domainId: opts.domainId,
    objectiveId: opts.objectiveId,
    ckuIds: opts.ckuIds,
    labType: 'guided',
    interpretOnly: true,
    cliShowOutput: opts.cliShowOutput,
    difficulty: opts.difficulty || 'beginner',
    estimatedTimeMinutes: opts.minutes || 10,
    tools: ['Packet Tracer', 'GNS3'],
    examRelevance: 'core',
    scenario: opts.scenario,
    learningGoals: opts.goals,
    topologyId: `TOPO-${opts.id}`,
    prerequisites: opts.prerequisites || [],
    tasks: opts.tasks,
    verificationCommands: opts.verify || [],
    successCriteria: opts.success,
    failureCriteria: opts.failure || ['Misread show output or reversed protocol comparison'],
    commonMistakes: opts.mistakes,
    source: { name: LAB_SOURCES.blueprint, chapter: opts.chapter, confidence: 0.9 },
    metadata: { version: '1', status: 'validated', confidence: 0.9 },
  }
  const topo = { id: lab.topologyId, title: lab.title, objectiveId: lab.objectiveId, nodes: opts.topoNodes, links: opts.topoLinks }
  const validator = {
    labId: lab.id,
    requiredCommands: opts.required,
    verificationChecks: opts.verificationChecks || [{ id: 'v1', device: opts.required[0]?.device || 'WLC1', command: opts.verifyCmd, expectedResult: opts.verifyExpect, passCondition: 'ok' }],
  }
  const diagram = mkDiagram(`DIAG-${lab.id}`, lab.title, lab.objectiveId, opts.diagNodes, opts.diagLinks)
  return {
    lab,
    topology: topo,
    validator,
    diagram,
    packetFlows: mkFlows(`FLOW-${lab.id}`, lab.title, `DIAG-${lab.id}`, lab.ckuIds, opts.flowSteps),
  }
}

function tsLab(id, title, objectiveId, domainId, scenario, tasks, requiredCommands, verify, mistakes) {
  return {
    id, title, domainId, objectiveId, ckuIds: ['CKU-TROUBLESHOOTING'],
    labType: 'troubleshooting', interpretOnly: true, difficulty: 'intermediate', estimatedTimeMinutes: 12,
    tools: ['Packet Tracer', 'GNS3'], examRelevance: 'core', scenario,
    learningGoals: ['Use show commands to isolate fault', 'Interpret misconfiguration from CLI output'],
    topologyId: `TOPO-${id}`, prerequisites: [],
    tasks, verificationCommands: verify || ['show running-config'],
    successCriteria: ['Root cause identified from show command output'],
    failureCriteria: ['Misread show output — wrong layer diagnosed'],
    commonMistakes: mistakes,
    source: { name: LAB_SOURCES.blueprint, chapter: 'Troubleshooting', confidence: 0.9 },
    metadata: { version: '1', status: 'validated', confidence: 0.9 },
    cliShowOutput: CLI_TS_SHOW_OUTPUT,
  }
}

function tsBundle(lab, nodes, links, verifyCmds) {
  const topo = { id: lab.topologyId, title: lab.title, objectiveId: lab.objectiveId, nodes, links }
  const validator = {
    labId: lab.id,
    requiredCommands: verifyCmds,
    verificationChecks: verifyCmds.map((c, i) => ({
      id: `v${i + 1}`, device: c.device, command: c.command,
      expectedResult: 'Root cause visible in output', passCondition: 'diagnosed',
    })),
  }
  const diagram = mkDiagram(`DIAG-${lab.id}`, lab.title, lab.objectiveId,
    [{ id: 'bad', label: 'Fault', type: 'process', x: 30, y: 50, status: 'error' }, { id: 'fix', label: 'Diagnose', type: 'process', x: 70, y: 50, status: 'highlighted' }],
    [{ id: 'd1', source: 'bad', target: 'fix', status: 'forwarding' }])
  return { lab, topology: topo, validator, diagram, packetFlows: mkFlows(`FLOW-${lab.id}`, 'Isolate fault', `DIAG-${lab.id}`, ['CKU-TROUBLESHOOTING'], [
    { id: 's1', order: 1, title: 'Symptom', action: scenarioShort(lab.scenario), successState: 'failed' },
    { id: 's2', order: 2, title: 'Diagnose', action: 'Show commands reveal root cause', successState: 'learned' },
  ]) }
}

function scenarioShort(s) { return (s || '').slice(0, 90) }

/* ---- Phase 1 ---- */

const PORT_SECURITY = mkGuided({
  id: 'LAB-PORT-SECURITY', title: 'Configure Port Security on an Access Port', domainId: 'security', objectiveId: '5.6',
  ckuIds: ['CKU-PORT-SECURITY', 'CKU-LAYER-2-SECURITY'],
  chapter: '5.6 Port Security', minutes: 14,
  scenario: 'SW1 Fa0/5 connects a single corporate PC. Limit the port to one MAC address, enable sticky learning, and set violation mode to shutdown.',
  goals: ['switchport port-security maximum', 'sticky MAC learning', 'violation shutdown'],
  tasks: [
    { id: 't1', order: 1, title: 'Access VLAN', device: 'SW1', instruction: 'Set Fa0/5 as access port in VLAN 10.', expectedCommands: ['interface fa0/5', 'switchport mode access', 'switchport access vlan 10'] },
    { id: 't2', order: 2, title: 'Enable port-security', device: 'SW1', instruction: 'Enable port-security with max 1 MAC and sticky.', expectedCommands: ['switchport port-security', 'switchport port-security maximum 1', 'switchport port-security mac-address sticky'] },
    { id: 't3', order: 3, title: 'Violation mode', device: 'SW1', instruction: 'Set violation mode to shutdown (err-disable the port).', expectedCommands: ['switchport port-security violation shutdown'] },
    { id: 't4', order: 4, title: 'Verify', device: 'SW1', instruction: 'Confirm port-security is active on Fa0/5.', expectedCommands: ['show port-security interface fa0/5'] },
  ],
  required: [
    { device: 'SW1', command: 'switchport port-security' },
    { device: 'SW1', command: 'switchport port-security maximum 1' },
    { device: 'SW1', command: 'switchport port-security mac-address sticky' },
    { device: 'SW1', command: 'switchport port-security violation shutdown' },
  ],
  verify: ['show port-security', 'show port-security interface fa0/5'],
  verifyCmd: 'show port-security interface fa0/5', verifyExpect: 'Port Security: Enabled',
  success: ['Port-security enabled on Fa0/5', 'Maximum 1 sticky MAC', 'Violation mode shutdown'],
  mistakes: ['Port-security on a trunk port', 'Forgetting sticky — MAC table clears on reload', 'restrict mode vs shutdown confusion'],
  topoNodes: [{ id: 'sw1', label: 'SW1', type: 'switch', x: 50, y: 40 }, { id: 'pc', label: 'PC', type: 'pc', x: 50, y: 75 }],
  topoLinks: [{ id: 'l1', source: 'sw1', target: 'pc', label: 'Fa0/5', status: 'forwarding' }],
  diagNodes: [{ id: 'sw', label: 'SW1 Fa0/5', type: 'switch', x: 40, y: 50 }, { id: 'mac', label: '1 sticky MAC', type: 'process', x: 70, y: 50, status: 'highlighted' }],
  diagLinks: [{ id: 'd1', source: 'sw', target: 'mac', status: 'forwarding' }],
  flowSteps: [
    { id: 's1', order: 1, title: 'Learn', action: 'First host MAC learned as sticky secure address', successState: 'learned' },
    { id: 's2', order: 2, title: 'Violate', action: 'Second MAC triggers shutdown violation', successState: 'dropped' },
  ],
})

const EXTENDED_ACL_BUILD = mkGuided({
  id: 'LAB-EXTENDED-ACL-BUILD', title: 'Build and Apply an Extended Named ACL', domainId: 'security', objectiveId: '5.5',
  ckuIds: ['CKU-EXTENDED-ACL', 'CKU-ACL-PLACEMENT'],
  chapter: '5.5 Extended ACL', minutes: 16,
  scenario: 'R1 connects office 192.168.1.0/24 (Gi0/0) to servers 10.0.0.0/24 (Gi0/1). Create named ACL WEB_ONLY permitting HTTP/HTTPS from office to servers, deny other office-to-server IP, apply inbound on Gi0/0.',
  goals: ['ip access-list extended', 'permit tcp eq 80/443', 'Apply extended ACL near source'],
  tasks: [
    { id: 't1', order: 1, title: 'Create ACL', device: 'R1', instruction: 'Create extended ACL WEB_ONLY with permit tcp 80 and 443 from office to servers.', expectedCommands: ['ip access-list extended WEB_ONLY', 'permit tcp 192.168.1.0 0.0.0.255 10.0.0.0 0.0.0.255 eq 80', 'permit tcp 192.168.1.0 0.0.0.255 10.0.0.0 0.0.0.255 eq 443'] },
    { id: 't2', order: 2, title: 'Explicit deny', device: 'R1', instruction: 'Add deny ip from office to server subnet, then end ACL.', expectedCommands: ['deny ip 192.168.1.0 0.0.0.255 10.0.0.0 0.0.0.255'] },
    { id: 't3', order: 3, title: 'Apply inbound', device: 'R1', instruction: 'Apply WEB_ONLY inbound on Gi0/0 (office-facing).', expectedCommands: ['interface gi0/0', 'ip access-group WEB_ONLY in'] },
    { id: 't4', order: 4, title: 'Verify', device: 'R1', instruction: 'Show ACL entries and hit counts.', expectedCommands: ['show access-lists WEB_ONLY'] },
  ],
  required: [
    { device: 'R1', command: 'ip access-list extended WEB_ONLY' },
    { device: 'R1', command: 'permit tcp 192.168.1.0 0.0.0.255 10.0.0.0 0.0.0.255 eq 80' },
    { device: 'R1', command: 'ip access-group WEB_ONLY in' },
  ],
  verify: ['show access-lists', 'show ip interface gi0/0'],
  verifyCmd: 'show access-lists WEB_ONLY', verifyExpect: 'WEB_ONLY',
  success: ['HTTP/HTTPS permitted office→servers', 'ACL applied inbound Gi0/0'],
  mistakes: ['Subnet mask instead of wildcard', 'Applying outbound on server interface for source filtering', 'Missing deny — relies only on implicit deny for wrong protocols'],
  topoNodes: [{ id: 'pc', label: 'Office', type: 'pc', x: 20, y: 50 }, { id: 'r1', label: 'R1', type: 'router', x: 50, y: 50 }, { id: 'srv', label: 'Servers', type: 'server', x: 80, y: 50 }],
  topoLinks: [{ id: 'l1', source: 'pc', target: 'r1', label: 'Gi0/0 in', status: 'forwarding' }, { id: 'l2', source: 'r1', target: 'srv', label: 'Gi0/1', status: 'forwarding' }],
  diagNodes: [{ id: 'src', label: 'Office', type: 'pc', x: 20, y: 50 }, { id: 'acl', label: 'WEB_ONLY in', type: 'process', x: 50, y: 50, status: 'highlighted' }, { id: 'dst', label: 'Servers', type: 'server', x: 80, y: 50 }],
  diagLinks: [{ id: 'd1', source: 'src', target: 'acl', status: 'forwarded' }, { id: 'd2', source: 'acl', target: 'dst', status: 'forwarded' }],
  flowSteps: [
    { id: 's1', order: 1, title: 'Match permit', action: 'TCP 80/443 matches first permit lines', successState: 'matched' },
    { id: 's2', order: 2, title: 'Deny other', action: 'Other IP traffic hits explicit deny', successState: 'dropped' },
  ],
})

const STATIC_NAT = mkGuided({
  id: 'LAB-STATIC-NAT', title: 'Configure Static NAT for a Server', domainId: 'services', objectiveId: '4.1',
  ckuIds: ['CKU-NAT', 'CKU-STATIC-NAT'],
  chapter: '4.1 Static NAT', minutes: 14,
  scenario: 'Internal web server 192.168.1.10 must be reachable from the Internet as 203.0.113.10. R1 Gi0/1 is inside (LAN), Gi0/0 is outside (ISP). Configure static NAT and verify translations.',
  goals: ['ip nat inside/outside', 'ip nat inside source static', 'Verify with show ip nat translations'],
  tasks: [
    { id: 't1', order: 1, title: 'Mark interfaces', device: 'R1', instruction: 'Gi0/1 inside, Gi0/0 outside.', expectedCommands: ['interface gi0/1', 'ip nat inside', 'interface gi0/0', 'ip nat outside'] },
    { id: 't2', order: 2, title: 'Static mapping', device: 'R1', instruction: 'Map inside 192.168.1.10 to outside 203.0.113.10 statically.', expectedCommands: ['ip nat inside source static 192.168.1.10 203.0.113.10'] },
    { id: 't3', order: 3, title: 'Verify', device: 'R1', instruction: 'Generate traffic and show translations.', expectedCommands: ['show ip nat translations'] },
  ],
  required: [
    { device: 'R1', command: 'ip nat inside' },
    { device: 'R1', command: 'ip nat outside' },
    { device: 'R1', command: 'ip nat inside source static 192.168.1.10 203.0.113.10' },
  ],
  verify: ['show ip nat translations', 'show ip nat statistics'],
  verifyCmd: 'show ip nat translations', verifyExpect: '192.168.1.10',
  success: ['Static translation appears after traffic', 'Inside/outside correctly marked'],
  mistakes: ['Reversed inside/outside interfaces', 'Using dynamic overload instead of static for 1:1 server publish'],
  topoNodes: [{ id: 'srv', label: 'Server .10', type: 'server', x: 20, y: 50 }, { id: 'r1', label: 'R1 NAT', type: 'router', x: 50, y: 50 }, { id: 'inet', label: 'Internet', type: 'cloud', x: 80, y: 50 }],
  topoLinks: [{ id: 'l1', source: 'srv', target: 'r1', status: 'forwarding' }, { id: 'l2', source: 'r1', target: 'inet', status: 'forwarded' }],
  diagNodes: [{ id: 'in', label: '192.168.1.10', type: 'server', x: 25, y: 50 }, { id: 'nat', label: 'Static NAT', type: 'process', x: 50, y: 50 }, { id: 'out', label: '203.0.113.10', type: 'cloud', x: 75, y: 50 }],
  diagLinks: [{ id: 'd1', source: 'in', target: 'nat', status: 'forwarded' }, { id: 'd2', source: 'nat', target: 'out', status: 'forwarded' }],
  flowSteps: [
    { id: 's1', order: 1, title: 'Inbound', action: 'Internet host connects to 203.0.113.10', successState: 'forwarded' },
    { id: 's2', order: 2, title: 'Translate', action: 'R1 maps to 192.168.1.10', successState: 'modified' },
  ],
})

const INTERVLAN_SVI = mkGuided({
  id: 'LAB-INTERVLAN-SVI', title: 'Inter-VLAN Routing with SVIs on a Layer 3 Switch', domainId: 'access', objectiveId: '2.1',
  ckuIds: ['CKU-VLAN', 'CKU-SVI', 'CKU-INTER-VLAN'],
  chapter: '2.1 Inter-VLAN SVI', minutes: 18,
  scenario: 'SW1 is a Layer 3 switch. VLAN 10 (Sales) and VLAN 20 (Eng) need routing between them. Create VLANs, access ports, SVI gateways 192.168.10.1/24 and 192.168.20.1/24, and enable ip routing.',
  goals: ['interface vlan 10/20', 'ip routing on switch', 'Verify routes between VLANs'],
  tasks: [
    { id: 't1', order: 1, title: 'Create VLANs', device: 'SW1', instruction: 'Create VLAN 10 and VLAN 20.', expectedCommands: ['vlan 10', 'vlan 20'] },
    { id: 't2', order: 2, title: 'Access ports', device: 'SW1', instruction: 'Fa0/1 access VLAN 10, Fa0/2 access VLAN 20.', expectedCommands: ['interface fa0/1', 'switchport access vlan 10', 'interface fa0/2', 'switchport access vlan 20'] },
    { id: 't3', order: 3, title: 'SVI gateways', device: 'SW1', instruction: 'Configure VLAN 10 SVI 192.168.10.1/24 and VLAN 20 SVI 192.168.20.1/24.', expectedCommands: ['interface vlan 10', 'ip address 192.168.10.1 255.255.255.0', 'interface vlan 20', 'ip address 192.168.20.1 255.255.255.0'] },
    { id: 't4', order: 4, title: 'Enable routing', device: 'SW1', instruction: 'Enable ip routing globally.', expectedCommands: ['ip routing'] },
    { id: 't5', order: 5, title: 'Verify', device: 'SW1', instruction: 'Confirm both SVIs are up/up and routes exist.', expectedCommands: ['show ip route', 'show ip interface brief'] },
  ],
  required: [
    { device: 'SW1', command: 'interface vlan 10' },
    { device: 'SW1', command: 'ip address 192.168.10.1 255.255.255.0' },
    { device: 'SW1', command: 'interface vlan 20' },
    { device: 'SW1', command: 'ip routing' },
  ],
  verify: ['show ip route', 'show ip interface brief'],
  verifyCmd: 'show ip route', verifyExpect: 'C 192.168.10.0',
  success: ['Both SVIs up', 'Hosts in VLAN 10 can reach VLAN 20 via L3 switch'],
  mistakes: ['Forgetting ip routing — SVIs exist but no inter-VLAN forward', 'SVI shutdown because VLAN has no active ports'],
  topoNodes: [{ id: 'sw1', label: 'L3 SW1', type: 'switch', x: 50, y: 35 }, { id: 'pc10', label: 'VLAN 10', type: 'pc', x: 25, y: 75 }, { id: 'pc20', label: 'VLAN 20', type: 'pc', x: 75, y: 75 }],
  topoLinks: [{ id: 'l1', source: 'sw1', target: 'pc10', status: 'forwarding' }, { id: 'l2', source: 'sw1', target: 'pc20', status: 'forwarding' }],
  diagNodes: [{ id: 'v10', label: 'SVI .10.1', type: 'process', x: 30, y: 40 }, { id: 'l3', label: 'ip routing', type: 'router', x: 50, y: 50, status: 'highlighted' }, { id: 'v20', label: 'SVI .20.1', type: 'process', x: 70, y: 40 }],
  diagLinks: [{ id: 'd1', source: 'v10', target: 'l3', status: 'forwarded' }, { id: 'd2', source: 'l3', target: 'v20', status: 'forwarded' }],
  flowSteps: [
    { id: 's1', order: 1, title: 'PC10 → gateway', action: 'Frame to VLAN 10 SVI MAC', successState: 'forwarded' },
    { id: 's2', order: 2, title: 'Route', action: 'SW1 routes between SVIs to VLAN 20', successState: 'forwarded' },
  ],
})

/* ---- Phase 2 ---- */

const STP_PORTFAST = mkGuided({
  id: 'LAB-STP-PORTFAST', title: 'Enable PortFast and BPDU Guard on Access Ports', domainId: 'access', objectiveId: '2.5',
  ckuIds: ['CKU-STP', 'CKU-PORTFAST'],
  chapter: '2.5 STP edge', minutes: 12,
  scenario: 'SW1 connects end hosts on Fa0/1–3. Enable PortFast on access ports and BPDU Guard to protect against rogue switches plugged into user ports.',
  goals: ['spanning-tree portfast', 'spanning-tree bpduguard enable', 'Apply only on host-facing ports'],
  tasks: [
    { id: 't1', order: 1, title: 'Access mode', device: 'SW1', instruction: 'Set Fa0/1 as access port in VLAN 10.', expectedCommands: ['interface fa0/1', 'switchport mode access', 'switchport access vlan 10'] },
    { id: 't2', order: 2, title: 'PortFast', device: 'SW1', instruction: 'Enable PortFast on Fa0/1.', expectedCommands: ['spanning-tree portfast'] },
    { id: 't3', order: 3, title: 'BPDU Guard', device: 'SW1', instruction: 'Enable BPDU Guard on the same port.', expectedCommands: ['spanning-tree bpduguard enable'] },
    { id: 't4', order: 4, title: 'Verify', device: 'SW1', instruction: 'Confirm PortFast edge status.', expectedCommands: ['show spanning-tree interface fa0/1 portfast'] },
  ],
  required: [
    { device: 'SW1', command: 'spanning-tree portfast' },
    { device: 'SW1', command: 'spanning-tree bpduguard enable' },
  ],
  verify: ['show spanning-tree interface fa0/1 portfast'],
  verifyCmd: 'show spanning-tree interface fa0/1 portfast', verifyExpect: 'PortFast is enabled',
  success: ['PortFast enabled on access port', 'BPDU Guard enabled'],
  mistakes: ['PortFast on trunk/uplink — can cause loops', 'BPDU Guard on uplink to core'],
  topoNodes: [{ id: 'sw1', label: 'SW1', type: 'switch', x: 50, y: 40 }, { id: 'pc', label: 'Host', type: 'pc', x: 50, y: 75 }],
  topoLinks: [{ id: 'l1', source: 'sw1', target: 'pc', label: 'Fa0/1 edge', status: 'forwarding' }],
  diagNodes: [{ id: 'edge', label: 'PortFast', type: 'process', x: 40, y: 50 }, { id: 'guard', label: 'BPDU Guard', type: 'process', x: 65, y: 50, status: 'highlighted' }],
  diagLinks: [{ id: 'd1', source: 'edge', target: 'guard', status: 'forwarding' }],
  flowSteps: [
    { id: 's1', order: 1, title: 'Fast forward', action: 'Host port skips listening/learning delay', successState: 'forwarded' },
    { id: 's2', order: 2, title: 'BPDU received', action: 'Rogue switch BPDU triggers err-disable', successState: 'dropped' },
  ],
})

const IPV6_STATIC = mkGuided({
  id: 'LAB-IPV6-STATIC', title: 'Configure IPv6 Addressing and Static Routes', domainId: 'connectivity', objectiveId: '3.3',
  ckuIds: ['CKU-IPV6-STATIC-ROUTE', 'CKU-IPV6-ADDRESSING'],
  chapter: '3.3 IPv6 static', minutes: 15,
  scenario: 'R1 connects to R2 on 2001:db8:12::/64. R2 has LAN 2001:db8:20::/64. Enable IPv6 routing on both routers, assign interface addresses, and add static routes so R1 reaches the remote LAN.',
  goals: ['ipv6 unicast-routing', 'ipv6 address on interfaces', 'ipv6 route static'],
  tasks: [
    { id: 't1', order: 1, title: 'Enable IPv6 routing R1', device: 'R1', instruction: 'Enable ipv6 unicast-routing on R1.', expectedCommands: ['ipv6 unicast-routing'] },
    { id: 't2', order: 2, title: 'R1 link address', device: 'R1', instruction: 'Gi0/0 2001:db8:12::1/64.', expectedCommands: ['interface gi0/0', 'ipv6 address 2001:db8:12::1/64', 'no shutdown'] },
    { id: 't3', order: 3, title: 'Static to remote LAN', device: 'R1', instruction: 'ipv6 route 2001:db8:20::/64 via 2001:db8:12::2.', expectedCommands: ['ipv6 route 2001:db8:20::/64 2001:db8:12::2'] },
    { id: 't4', order: 4, title: 'Verify', device: 'R1', instruction: 'Show IPv6 route table.', expectedCommands: ['show ipv6 route static'] },
  ],
  required: [
    { device: 'R1', command: 'ipv6 unicast-routing' },
    { device: 'R1', command: 'ipv6 address 2001:db8:12::1/64' },
    { device: 'R1', command: 'ipv6 route 2001:db8:20::/64 2001:db8:12::2' },
  ],
  verify: ['show ipv6 route', 'show ipv6 interface brief'],
  verifyCmd: 'show ipv6 route', verifyExpect: '2001:db8:20::/64',
  success: ['IPv6 static route installed', 'Reachability to remote /64'],
  mistakes: ['Forgetting ipv6 unicast-routing', 'Using link-local as static next-hop without understanding scope'],
  topoNodes: [{ id: 'r1', label: 'R1', type: 'router', x: 30, y: 50 }, { id: 'r2', label: 'R2', type: 'router', x: 70, y: 50 }],
  topoLinks: [{ id: 'l1', source: 'r1', target: 'r2', label: '2001:db8:12::/64', status: 'forwarding' }],
  diagNodes: [{ id: 'r1', label: 'R1', type: 'router', x: 30, y: 50 }, { id: 'rt', label: 'S ::/64 via ::2', type: 'process', x: 55, y: 50, status: 'highlighted' }, { id: 'lan', label: 'db8:20::/64', type: 'cloud', x: 80, y: 50 }],
  diagLinks: [{ id: 'd1', source: 'r1', target: 'rt', status: 'matched' }, { id: 'd2', source: 'rt', target: 'lan', status: 'forwarded' }],
  flowSteps: [
    { id: 's1', order: 1, title: 'Lookup', action: 'Longest match for 2001:db8:20::/64', successState: 'matched' },
    { id: 's2', order: 2, title: 'Forward', action: 'Packet sent to next-hop 2001:db8:12::2', successState: 'forwarded' },
  ],
})

const OSPF_DEFAULT = mkGuided({
  id: 'LAB-OSPF-DEFAULT', title: 'Advertise a Default Route with OSPF', domainId: 'connectivity', objectiveId: '3.4',
  ckuIds: ['CKU-OSPF', 'CKU-DEFAULT-ROUTE'],
  chapter: '3.4 OSPF default originate', minutes: 16,
  scenario: 'R1 is the edge router with Internet default via 203.0.113.1. R2 is internal. Configure OSPF on both, then originate default route from R1 into OSPF area 0 so R2 learns 0.0.0.0/0.',
  goals: ['router ospf', 'default-information originate', 'Verify O E2 default on R2'],
  tasks: [
    { id: 't1', order: 1, title: 'Default static R1', device: 'R1', instruction: 'Add default route to ISP.', expectedCommands: ['ip route 0.0.0.0 0.0.0.0 203.0.113.1'] },
    { id: 't2', order: 2, title: 'OSPF R1', device: 'R1', instruction: 'Enable OSPF 1, advertise LAN and link into area 0.', expectedCommands: ['router ospf 1', 'network 10.0.12.0 0.0.0.3 area 0'] },
    { id: 't3', order: 3, title: 'Originate default', device: 'R1', instruction: 'Inside OSPF, default-information originate.', expectedCommands: ['default-information originate'] },
    { id: 't4', order: 4, title: 'OSPF R2', device: 'R2', instruction: 'Enable OSPF on R2 for shared link and LAN.', expectedCommands: ['router ospf 1', 'network 10.0.12.0 0.0.0.3 area 0', 'network 10.0.2.0 0.0.0.255 area 0'] },
    { id: 't5', order: 5, title: 'Verify R2', device: 'R2', instruction: 'Confirm O*E2 default in routing table.', expectedCommands: ['show ip route ospf'] },
  ],
  required: [
    { device: 'R1', command: 'ip route 0.0.0.0 0.0.0.0 203.0.113.1' },
    { device: 'R1', command: 'default-information originate' },
    { device: 'R2', command: 'router ospf 1' },
  ],
  verify: ['show ip route', 'show ip ospf neighbor'],
  verifyCmd: 'show ip route', verifyExpect: '0.0.0.0/0',
  success: ['R2 receives OSPF external default', 'R1 originates only with existing default/static'],
  mistakes: ['originate without default route present', 'Area mismatch prevents learning default'],
  topoNodes: [{ id: 'r2', label: 'R2 internal', type: 'router', x: 25, y: 50 }, { id: 'r1', label: 'R1 edge', type: 'router', x: 55, y: 50 }, { id: 'isp', label: 'ISP', type: 'cloud', x: 85, y: 50 }],
  topoLinks: [{ id: 'l1', source: 'r2', target: 'r1', status: 'forwarding' }, { id: 'l2', source: 'r1', target: 'isp', status: 'forwarding' }],
  diagNodes: [{ id: 'def', label: 'Static 0.0.0.0/0', type: 'process', x: 55, y: 30 }, { id: 'ospf', label: 'default-information originate', type: 'process', x: 55, y: 55, status: 'highlighted' }, { id: 'r2', label: 'R2 O*E2', type: 'router', x: 25, y: 55 }],
  diagLinks: [{ id: 'd1', source: 'def', target: 'ospf', status: 'forwarded' }, { id: 'd2', source: 'ospf', target: 'r2', status: 'forwarded' }],
  flowSteps: [
    { id: 's1', order: 1, title: 'Edge default', action: 'R1 has static default to ISP', successState: 'matched' },
    { id: 's2', order: 2, title: 'Redistribute', action: 'OSPF advertises default into area 0', successState: 'learned' },
  ],
})

/* ---- Phase 3 ---- */

const WLAN_SSID = mkGuided({
  id: 'LAB-WLAN-SSID', title: 'Configure a WPA2-Personal WLAN on a WLC', domainId: 'access', objectiveId: '2.8',
  ckuIds: ['CKU-WLAN', 'CKU-WLC'],
  chapter: '2.8 WLAN on WLC', minutes: 18,
  scenario: 'WLC1 manages lightweight APs. Create WLAN CORP_WIFI on VLAN 20, map to dynamic interface 192.168.20.1/24, enable WPA2-PSK AES, and verify AP joins.',
  goals: ['WLAN SSID + security policy', 'Dynamic interface VLAN mapping', 'Verify AP association'],
  tasks: [
    { id: 't1', order: 1, title: 'Dynamic interface', device: 'WLC1', instruction: 'Create dynamic interface VLAN20 with IP 192.168.20.1/24 gateway 192.168.20.1.', expectedCommands: ['interface vlan 20', 'ip address 192.168.20.1 255.255.255.0'] },
    { id: 't2', order: 2, title: 'Create WLAN', device: 'WLC1', instruction: 'Create WLAN CORP_WIFI, SSID CORP_WIFI, status enabled.', expectedCommands: ['wlan CORP_WIFI', 'ssid CORP_WIFI'] },
    { id: 't3', order: 3, title: 'Security WPA2', device: 'WLC1', instruction: 'Set layer2 security WPA2-PSK AES with passphrase.', expectedCommands: ['security wpa akm psk', 'security wpa wpa2 ciphers aes'] },
    { id: 't4', order: 4, title: 'Map interface', device: 'WLC1', instruction: 'Bind WLAN to VLAN20 interface.', expectedCommands: ['interface vlan 20'] },
    { id: 't5', order: 5, title: 'Verify AP', device: 'WLC1', instruction: 'Show AP summary and WLAN status.', expectedCommands: ['show ap summary', 'show wlan summary'] },
  ],
  required: [
    { device: 'WLC1', command: 'wlan CORP_WIFI' },
    { device: 'WLC1', command: 'ssid CORP_WIFI' },
    { device: 'WLC1', command: 'security wpa akm psk' },
  ],
  verify: ['show wlan summary', 'show ap summary'],
  verifyCmd: 'show wlan summary', verifyExpect: 'CORP_WIFI',
  success: ['WLAN enabled with WPA2', 'AP registered to WLC', 'Clients get VLAN 20 addresses'],
  mistakes: ['WLAN mapped to wrong dynamic interface', 'Open authentication left enabled'],
  topoNodes: [{ id: 'wlc', label: 'WLC1', type: 'router', x: 40, y: 35 }, { id: 'ap', label: 'LWAP', type: 'switch', x: 70, y: 50 }, { id: 'client', label: 'Wi-Fi client', type: 'pc', x: 70, y: 75 }],
  topoLinks: [{ id: 'l1', source: 'wlc', target: 'ap', label: 'CAPWAP', status: 'forwarding' }, { id: 'l2', source: 'ap', target: 'client', status: 'forwarding' }],
  diagNodes: [{ id: 'wlc', label: 'WLC', type: 'router', x: 35, y: 45 }, { id: 'wlan', label: 'CORP_WIFI', type: 'process', x: 55, y: 45, status: 'highlighted' }, { id: 'vlan', label: 'VLAN 20', type: 'subnet', x: 75, y: 45 }],
  diagLinks: [{ id: 'd1', source: 'wlc', target: 'wlan', status: 'forwarded' }, { id: 'd2', source: 'wlan', target: 'vlan', status: 'forwarded' }],
  flowSteps: [
    { id: 's1', order: 1, title: 'Join', action: 'AP registers to WLC via CAPWAP', successState: 'matched' },
    { id: 's2', order: 2, title: 'Associate', action: 'Client associates to CORP_WIFI SSID', successState: 'forwarded' },
  ],
})

const LAB_TS_WLAN = tsLab('LAB-TS-WLAN-VLAN', 'Troubleshoot WLAN Wrong VLAN Mapping', '3.6', 'connectivity',
  'Symptom: Wireless clients associate to CORP_WIFI but receive 192.168.10.x instead of 192.168.20.x. Use WLC show commands to identify wrong VLAN interface mapping.',
  [
    { id: 't1', order: 1, title: 'Client subnet', device: 'WLC1', instruction: 'Run show client summary — clients on wrong 192.168.10.x subnet.',
      expectedCommands: ['show client summary'] },
    { id: 't2', order: 2, title: 'WLAN mapping', device: 'WLC1', instruction: 'Run show wlan summary — CORP_WIFI mapped to VLAN10 interface instead of VLAN20.',
      expectedCommands: ['show wlan summary'] },
    { id: 't3', order: 3, title: 'Root cause', device: 'WLC1', instruction: 'Diagnosis: WLAN dynamic interface points to VLAN10 — clients get 10.x addresses.',
      expectedCommands: ['show wlan summary'] },
  ],
  [],
  ['show client summary', 'show wlan summary'],
  ['Mapping SSID to management VLAN instead of user VLAN'])

const TS_WLAN = tsBundle(LAB_TS_WLAN,
  [{ id: 'wlc', label: 'WLC wrong VLAN', type: 'router', x: 50, y: 40, status: 'error' }, { id: 'cli', label: 'Client .10.x', type: 'pc', x: 50, y: 75 }],
  [{ id: 'l1', source: 'wlc', target: 'cli', status: 'blocked' }],
  [{ device: 'WLC1', command: 'show client summary' }, { device: 'WLC1', command: 'show wlan summary' }])

/* ---- Phase 3 Wave — 1.5 MAC forwarding + 5.8–5.11 security ---- */

const MAC_FORWARD_15 = mkGuided({
  id: 'LAB-MAC-FORWARD-15',
  title: 'Observe Switch MAC Learning and Forwarding',
  domainId: 'fundamentals',
  objectiveId: '1.5',
  ckuIds: ['CKU-MAC-ADDRESS-TABLE', 'CKU-MAC-LEARNING', 'CKU-FRAME-FORWARDING'],
  chapter: '1.5 Switch forwarding',
  minutes: 8,
  difficulty: 'beginner',
  scenario: 'SW1 connects PC-A on Fa0/1 and PC-B on Fa0/2 in VLAN 10. Observe how the switch learns source MACs, forwards known unicast, and how you verify the CAM table with show commands.',
  goals: ['Read show mac address-table after traffic', 'Add a static MAC binding', 'Adjust aging timer from default 300s'],
  tasks: [
    { id: 't1', order: 1, title: 'Access ports', device: 'SW1', instruction: 'Set Fa0/1 and Fa0/2 as access ports in VLAN 10.', expectedCommands: ['interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'interface fa0/2', 'switchport access vlan 10'] },
    { id: 't2', order: 2, title: 'Baseline MAC table', device: 'SW1', instruction: 'Run show mac address-table — note dynamic entries appear after hosts send frames (source learning).', expectedCommands: ['show mac address-table'] },
    { id: 't3', order: 3, title: 'Static server MAC', device: 'SW1', instruction: 'Bind server MAC 0011.2233.4455 to Fa0/1 VLAN 10 — static entries never age out.', expectedCommands: ['mac address-table static 0011.2233.4455 vlan 10 interface fa0/1'] },
    { id: 't4', order: 4, title: 'Aging timer', device: 'SW1', instruction: 'Change global aging time to 600 seconds (default is 300).', expectedCommands: ['mac address-table aging-time 600'] },
    { id: 't5', order: 5, title: 'Verify', device: 'SW1', instruction: 'Confirm static and dynamic entries with show mac address-table dynamic and show mac address-table count.', expectedCommands: ['show mac address-table dynamic', 'show mac address-table count'] },
  ],
  required: [
    { device: 'SW1', command: 'switchport access vlan 10' },
    { device: 'SW1', command: 'show mac address-table' },
    { device: 'SW1', command: 'mac address-table static 0011.2233.4455 vlan 10 interface fa0/1' },
    { device: 'SW1', command: 'mac address-table aging-time 600' },
  ],
  verify: ['show mac address-table', 'show mac address-table dynamic', 'show mac address-table count'],
  verifyCmd: 'show mac address-table',
  verifyExpect: '0011.2233.4455',
  success: ['PC source MACs learned on correct ports', 'Static entry present for server MAC', 'Aging timer set to 600 seconds'],
  mistakes: ['Confusing source MAC (learned) with destination MAC (lookup)', 'Expecting ARP table on the switch — switches use MAC table only'],
  topoNodes: [{ id: 'sw1', label: 'SW1 VLAN 10', type: 'switch', x: 50, y: 45 }, { id: 'pca', label: 'PC-A Fa0/1', type: 'pc', x: 25, y: 75 }, { id: 'pcb', label: 'PC-B Fa0/2', type: 'pc', x: 75, y: 75 }],
  topoLinks: [{ id: 'l1', source: 'pca', target: 'sw1', status: 'forwarding' }, { id: 'l2', source: 'pcb', target: 'sw1', status: 'forwarding' }],
  diagNodes: [{ id: 'learn', label: 'Learn source MAC', type: 'process', x: 30, y: 40, status: 'highlighted' }, { id: 'sw', label: 'CAM table', type: 'switch', x: 50, y: 55 }, { id: 'fwd', label: 'Forward to dest port', type: 'process', x: 70, y: 40 }],
  diagLinks: [{ id: 'd1', source: 'learn', target: 'sw', status: 'forwarded' }, { id: 'd2', source: 'sw', target: 'fwd', status: 'forwarded' }],
  flowSteps: [
    { id: 's1', order: 1, title: 'Learn', action: 'Switch records source MAC + VLAN + ingress port', successState: 'learned' },
    { id: 's2', order: 2, title: 'Lookup', action: 'Destination MAC lookup — known unicast forwards to one port', successState: 'matched' },
    { id: 's3', order: 3, title: 'Flood', action: 'Unknown unicast or broadcast floods all VLAN ports except source', successState: 'forwarded' },
  ],
})

const CLI_WLAN_SEC_58 = {
  'show wireless security summary': `Wireless Security Protocol Summary (WLC1)
────────────────────────────────────────────────────────────
Protocol   Encryption   Status on WLANs        CCNA exam note
WEP        RC4          DEPRECATED — none        Never deploy; cracked
WPA        TKIP         DEPRECATED — legacy      Weak; avoid
WPA2       AES-CCMP     ACTIVE — 3 WLANs         Current minimum (Personal + Enterprise)
WPA3       AES-GCMP     ACTIVE — 1 WLAN          SAE replaces PSK 4-way; PMF mandatory

WPA2-Personal  = PSK passphrase (8–63 chars) + AES
WPA2-Enterprise = 802.1X/EAP + RADIUS per-user credentials + AES
WPA3-Personal  = SAE resists offline dictionary attacks`,
  'show wlan 1': `WLAN ID 1: CORP_WIFI
SSID ................ CORP_WIFI
Status .............. ENABLED
Layer 2 Security .... WPA2
Auth Key Mgmt ....... PSK
Cipher .............. AES-CCMP (CCMP)
PMF ................. Optional (WPA2)

WLAN ID 4: LEGACY_OPEN (disabled — do not use)
Layer 2 Security .... None — OPEN (security risk)`,
  'show wlan 4': `WLAN ID 4: LEGACY_OPEN
Status .............. DISABLED
Layer 2 Security .... None
Note: Open WLANs provide no confidentiality — exam expects WPA2-AES minimum.`,
}

const WLAN_SEC_58 = mkInterpretGuided({
  id: 'LAB-WLAN-SEC-58',
  title: 'Compare Wireless Security Protocols on a WLC',
  domainId: 'security',
  objectiveId: '5.8',
  ckuIds: ['CKU-WLAN-SEC'],
  chapter: '5.8 Wireless security protocols',
  minutes: 10,
  cliShowOutput: CLI_WLAN_SEC_58,
  scenario: 'WLC1 runs multiple WLANs with different security generations. Read static show output to rank WEP → WPA → WPA2 → WPA3 and explain why CCNA expects WPA2-AES (or WPA3) — never WEP or open WLANs in production.',
  goals: ['Rank WEP/WPA/WPA2/WPA3 by strength', 'Contrast WPA2-Personal (PSK) vs Enterprise (802.1X)', 'Identify AES-CCMP as WPA2 encryption standard'],
  tasks: [
    { id: 't1', order: 1, title: 'Security summary', device: 'WLC1', instruction: 'Run show wireless security summary — note which protocols are deprecated vs active and the WPA2/WPA3 exam expectations.', expectedCommands: ['enable', 'show wireless security summary'] },
    { id: 't2', order: 2, title: 'WPA2 WLAN detail', device: 'WLC1', instruction: 'Run show wlan 1 — confirm CORP_WIFI uses WPA2 + PSK + AES-CCMP (not TKIP or WEP).', expectedCommands: ['show wlan 1'] },
    { id: 't3', order: 3, title: 'Deprecated open WLAN', device: 'WLC1', instruction: 'Run show wlan 4 — explain why LEGACY_OPEN is disabled and unsuitable for production.', expectedCommands: ['show wlan 4'] },
  ],
  required: [
    { device: 'WLC1', command: 'show wireless security summary' },
    { device: 'WLC1', command: 'show wlan 1' },
    { device: 'WLC1', command: 'show wlan 4' },
  ],
  verify: ['show wireless security summary', 'show wlan 1', 'show wlan 4'],
  verifyCmd: 'show wireless security summary',
  verifyExpect: 'WPA2',
  verificationChecks: [
    { id: 'v1', device: 'WLC1', command: 'show wireless security summary', expectedResult: 'WEP/WPA deprecated; WPA2-AES active', passCondition: 'protocol ranking' },
    { id: 'v2', device: 'WLC1', command: 'show wlan 1', expectedResult: 'WPA2 PSK AES-CCMP', passCondition: 'WPA2 personal settings' },
  ],
  success: ['WEP and WPA marked deprecated', 'WPA2 uses AES-CCMP with PSK or 802.1X', 'Open WLAN identified as insecure'],
  mistakes: ['Choosing WEP or WPA-TKIP as acceptable', 'Confusing WPA3-SAE with removing passphrase requirement'],
  topoNodes: [{ id: 'wlc', label: 'WLC1', type: 'server', x: 50, y: 25 }, { id: 'wpa2', label: 'WPA2-AES', type: 'process', x: 30, y: 65, status: 'highlighted' }, { id: 'wep', label: 'WEP (deprecated)', type: 'process', x: 70, y: 65, status: 'error' }],
  topoLinks: [{ id: 'l1', source: 'wlc', target: 'wpa2', status: 'forwarding' }, { id: 'l2', source: 'wlc', target: 'wep', status: 'blocked' }],
  diagNodes: [{ id: 'wep', label: 'WEP — broken', type: 'process', x: 15, y: 55, status: 'error' }, { id: 'wpa2', label: 'WPA2-AES', type: 'process', x: 50, y: 55, status: 'highlighted' }, { id: 'wpa3', label: 'WPA3-SAE', type: 'process', x: 85, y: 55 }],
  diagLinks: [{ id: 'd1', source: 'wep', target: 'wpa2', label: 'upgrade', status: 'forwarded' }, { id: 'd2', source: 'wpa2', target: 'wpa3', status: 'forwarded' }],
  flowSteps: [
    { id: 's1', order: 1, title: 'Deprecated', action: 'WEP/WPA-TKIP must not be deployed — easily cracked', successState: 'noted' },
    { id: 's2', order: 2, title: 'WPA2', action: 'AES-CCMP encryption; Personal uses PSK, Enterprise uses 802.1X/RADIUS', successState: 'noted' },
    { id: 's3', order: 3, title: 'WPA3', action: 'SAE improves PSK exchange; PMF protects management frames', successState: 'noted' },
  ],
})

const WPA2_PSK_59 = mkGuided({
  id: 'LAB-WPA2-PSK-59',
  title: 'Configure a WPA2-PSK WLAN with AES on a WLC',
  domainId: 'security',
  objectiveId: '5.9',
  ckuIds: ['CKU-WPA2-PSK'],
  chapter: '5.9 WPA2-PSK WLAN',
  minutes: 15,
  scenario: 'WLC1 must offer guest Wi-Fi on VLAN 30 (192.168.30.0/24). Create WLAN GUEST_WIFI with WPA2-Personal, AES-CCMP cipher, PSK passphrase, and map the SSID to the VLAN 30 dynamic interface so clients receive the correct DHCP scope.',
  goals: ['Create WLAN/SSID with WPA2-PSK + AES', 'Map WLAN to VLAN dynamic interface', 'Verify with show wlan summary'],
  tasks: [
    { id: 't1', order: 1, title: 'Dynamic interface VLAN 30', device: 'WLC1', instruction: 'Create dynamic interface VLAN30 with IP 192.168.30.1/24 — this is the client gateway/subnet.', expectedCommands: ['interface vlan 30', 'ip address 192.168.30.1 255.255.255.0'] },
    { id: 't2', order: 2, title: 'Create WLAN', device: 'WLC1', instruction: 'Create WLAN GUEST_WIFI with SSID GUEST_WIFI and enable it.', expectedCommands: ['wlan GUEST_WIFI', 'ssid GUEST_WIFI'] },
    { id: 't3', order: 3, title: 'WPA2-PSK AES', device: 'WLC1', instruction: 'Set Layer 2 security to WPA2 with PSK and AES cipher (not TKIP). Use passphrase GuestPass123!.', expectedCommands: ['security wpa akm psk', 'security wpa wpa2 ciphers aes', 'security wpa psk GuestPass123!'] },
    { id: 't4', order: 4, title: 'Map to VLAN 30', device: 'WLC1', instruction: 'Bind GUEST_WIFI to the VLAN30 dynamic interface so clients get 192.168.30.x addresses.', expectedCommands: ['interface vlan 30'] },
    { id: 't5', order: 5, title: 'Verify', device: 'WLC1', instruction: 'Confirm WLAN is enabled with WPA2-PSK and correct interface mapping.', expectedCommands: ['show wlan summary', 'show wlan GUEST_WIFI'] },
  ],
  required: [
    { device: 'WLC1', command: 'wlan GUEST_WIFI' },
    { device: 'WLC1', command: 'security wpa akm psk' },
    { device: 'WLC1', command: 'security wpa wpa2 ciphers aes' },
    { device: 'WLC1', command: 'interface vlan 30' },
  ],
  verify: ['show wlan summary', 'show wlan GUEST_WIFI'],
  verifyCmd: 'show wlan summary',
  verifyExpect: 'GUEST_WIFI',
  success: ['WLAN enabled with WPA2-PSK and AES', 'SSID mapped to VLAN 30 interface', 'Clients receive 192.168.30.x DHCP scope'],
  mistakes: ['Using WPA2-TKIP instead of AES-CCMP', 'Forgetting WLAN-to-VLAN mapping — clients associate but get wrong subnet', 'PSK shorter than 8 characters'],
  topoNodes: [{ id: 'wlc', label: 'WLC1', type: 'router', x: 40, y: 35 }, { id: 'ap', label: 'LWAP', type: 'switch', x: 70, y: 50 }, { id: 'guest', label: 'Guest client', type: 'pc', x: 70, y: 75 }],
  topoLinks: [{ id: 'l1', source: 'wlc', target: 'ap', label: 'CAPWAP', status: 'forwarding' }, { id: 'l2', source: 'ap', target: 'guest', label: 'GUEST_WIFI', status: 'forwarding' }],
  diagNodes: [{ id: 'ssid', label: 'GUEST_WIFI', type: 'process', x: 45, y: 45, status: 'highlighted' }, { id: 'vlan', label: 'VLAN 30', type: 'subnet', x: 70, y: 45 }],
  diagLinks: [{ id: 'd1', source: 'ssid', target: 'vlan', status: 'forwarded' }],
  flowSteps: [
    { id: 's1', order: 1, title: 'Associate', action: 'Client selects GUEST_WIFI and enters PSK', successState: 'matched' },
    { id: 's2', order: 2, title: '4-way handshake', action: 'Unique per-session keys derived from shared passphrase', successState: 'forwarded' },
    { id: 's3', order: 3, title: 'VLAN map', action: 'WLC maps client to VLAN 30 for DHCP 192.168.30.x', successState: 'forwarded' },
  ],
})

const CLI_VPN_510 = {
  'show vpn sessiondb summary': `VPN Session Database Summary
────────────────────────────────────────────────────────────
Session Type          Active   Remote Peer / Client
Site-to-site IPsec    2        Branch-RTR ↔ HQ-RTR (permanent tunnel)
Remote-access SSL     14       AnyConnect clients → HQ headend
Remote-access IPsec   3        Legacy IPsec VPN clients

Site-to-site: connects two networks (gateway-to-gateway) — transparent to users.
Remote-access: connects individual users to corporate network (AnyConnect/SSL or IPsec client).`,
  'show crypto ipsec sa': `Crypto IPsec Security Associations
Interface: Tunnel0 (site-to-site to Branch)
  local  ident: 203.0.113.10/32
  remote ident: 198.51.100.20/32
  #pkts encrypt: 48201  #pkts decrypt: 47988
  transform: esp-aes 256 esp-sha256-hmac
  Status: ACTIVE (IKE Phase 2 up)

Interface: Virtual-Access2 (remote-access client)
  local  ident: 10.50.1.0/24 (pool)
  remote ident: user-jdoe
  transform: esp-aes 256 esp-sha256-hmac`,
  'show crypto isakmp sa': `ISAKMP Security Associations (Phase 1)
dst             src             state          conn id  slot
198.51.100.20   203.0.113.10    QM_IDLE        1        0   (site-to-site)
10.20.30.44     203.0.113.10    QM_IDLE        7        0   (remote-access)

IKE negotiates Phase 1 (ISAKMP SA); IPsec Phase 2 protects data traffic.`,
}

const VPN_TYPES_510 = mkInterpretGuided({
  id: 'LAB-VPN-TYPES-510',
  title: 'Differentiate Site-to-Site and Remote-Access VPNs',
  domainId: 'security',
  objectiveId: '5.10',
  ckuIds: ['CKU-VPN'],
  chapter: '5.10 VPN types',
  minutes: 10,
  cliShowOutput: CLI_VPN_510,
  scenario: 'HQ-RTR terminates both a permanent site-to-site IPsec tunnel to a branch and remote-access AnyConnect sessions. Read static show output to contrast gateway-to-gateway vs user VPN and identify IPsec Phase 1/2 roles.',
  goals: ['Contrast site-to-site vs remote-access VPN use cases', 'Read IPsec SA output for encryption/integrity transforms', 'Map IKE (Phase 1) to ISAKMP SA establishment'],
  tasks: [
    { id: 't1', order: 1, title: 'Session types', device: 'R1', instruction: 'Run show vpn sessiondb summary — count site-to-site vs remote-access sessions and who initiates each.', expectedCommands: ['enable', 'show vpn sessiondb summary'] },
    { id: 't2', order: 2, title: 'IPsec SAs', device: 'R1', instruction: 'Run show crypto ipsec sa — compare Tunnel0 (site-to-site) with Virtual-Access (remote client) SAs and note AES + SHA transforms.', expectedCommands: ['show crypto ipsec sa'] },
    { id: 't3', order: 3, title: 'IKE Phase 1', device: 'R1', instruction: 'Run show crypto isakmp sa — IKE negotiates Phase 1 before IPsec Phase 2 protects user data.', expectedCommands: ['show crypto isakmp sa'] },
  ],
  required: [
    { device: 'R1', command: 'show vpn sessiondb summary' },
    { device: 'R1', command: 'show crypto ipsec sa' },
    { device: 'R1', command: 'show crypto isakmp sa' },
  ],
  verify: ['show vpn sessiondb summary', 'show crypto ipsec sa', 'show crypto isakmp sa'],
  verifyCmd: 'show vpn sessiondb summary',
  verifyExpect: 'Site-to-site',
  verificationChecks: [
    { id: 'v1', device: 'R1', command: 'show vpn sessiondb summary', expectedResult: 'Site-to-site vs remote-access counts', passCondition: 'VPN type differentiation' },
    { id: 'v2', device: 'R1', command: 'show crypto ipsec sa', expectedResult: 'esp-aes esp-sha256 active SAs', passCondition: 'IPsec confidentiality + integrity' },
  ],
  success: ['Site-to-site connects networks; remote-access connects users', 'IPsec ESP provides encryption and authentication', 'IKE Phase 1 visible in ISAKMP SA table'],
  mistakes: ['Claiming IPsec only encrypts without integrity (ESP includes both)', 'Treating site-to-site and remote-access as identical deployment models'],
  topoNodes: [{ id: 'hq', label: 'HQ-RTR', type: 'router', x: 50, y: 30 }, { id: 'branch', label: 'Branch (site-to-site)', type: 'router', x: 20, y: 70 }, { id: 'user', label: 'Remote user (SSL/IPsec)', type: 'pc', x: 80, y: 70 }],
  topoLinks: [{ id: 'l1', source: 'hq', target: 'branch', label: 'IPsec tunnel', status: 'forwarding' }, { id: 'l2', source: 'user', target: 'hq', label: 'AnyConnect', status: 'forwarding' }],
  diagNodes: [{ id: 's2s', label: 'Site-to-site\nnetwork↔network', type: 'process', x: 30, y: 55, status: 'highlighted' }, { id: 'ra', label: 'Remote-access\nuser↔network', type: 'process', x: 70, y: 55 }],
  diagLinks: [{ id: 'd1', source: 's2s', target: 'ra', label: 'both use IPsec/SSL', status: 'forwarding' }],
  flowSteps: [
    { id: 's1', order: 1, title: 'Site-to-site', action: 'Branch and HQ routers build permanent encrypted tunnel — users unaware', successState: 'noted' },
    { id: 's2', order: 2, title: 'Remote-access', action: 'Individual client VPNs into HQ for corporate resources', successState: 'noted' },
    { id: 's3', order: 3, title: 'IPsec', action: 'IKE Phase 1 then ESP Phase 2 — AES encrypts, SHA authenticates', successState: 'noted' },
  ],
})

const CLI_SEGMENT_511 = {
  'show vlan brief': `VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
10   USERS                            active    Fa0/1-12
20   SERVERS                          active    Fa0/13-18
30   GUEST                            active    Fa0/19-24
99   MGMT                             active    Gi0/1

Note: VLANs segment L2 broadcast domains — routing/ACLs still required for L3 policy.`,
  'show zone security': `Zone Security Configuration
Zone name         Member interfaces
──────────────────────────────────────
INSIDE            Vlan10, Vlan20
OUTSIDE           Gi0/0
GUEST             Vlan30
DMZ               Vlan40 (web servers)

Default policy: traffic between zones denied unless explicitly permitted.`,
  'show zone-pair security': `Zone-pair Security Policies
Source Zone    Dest Zone     Policy type        Action
──────────────────────────────────────────────────────────
INSIDE         OUTSIDE       inspect ip         permit + stateful
GUEST          INSIDE        ACL GUEST-TO-INSIDE  deny (default)
GUEST          OUTSIDE       inspect ip         permit internet only
INSIDE         GUEST         —                  deny (no lateral)

Micro-segmentation: granular policy per zone/workload limits blast radius.`,
}

const SEGMENT_511 = mkInterpretGuided({
  id: 'LAB-SEGMENT-511',
  title: 'Interpret Network Segmentation and Zone Policies',
  domainId: 'security',
  objectiveId: '5.11',
  ckuIds: ['CKU-SEGMENTATION'],
  chapter: '5.11 Network segmentation',
  minutes: 10,
  cliShowOutput: CLI_SEGMENT_511,
  scenario: 'A campus firewall separates INSIDE, GUEST, OUTSIDE, and DMZ zones. VLANs alone are not enough — read show output to see how zone pairs and stateful inspection limit lateral movement between segments.',
  goals: ['Explain VLANs as L2 segmentation only', 'Read zone and zone-pair policies on an NGFW', 'Relate micro-segmentation to limiting blast radius'],
  tasks: [
    { id: 't1', order: 1, title: 'VLAN segments', device: 'FW1', instruction: 'Run show vlan brief — VLANs divide broadcast domains but do not alone enforce security between routed subnets.', expectedCommands: ['enable', 'show vlan brief'] },
    { id: 't2', order: 2, title: 'Security zones', device: 'FW1', instruction: 'Run show zone security — note which interfaces belong to INSIDE, GUEST, OUTSIDE, DMZ trust zones.', expectedCommands: ['show zone security'] },
    { id: 't3', order: 3, title: 'Zone-pair policy', device: 'FW1', instruction: 'Run show zone-pair security — GUEST→INSIDE is denied; INSIDE→OUTSIDE uses stateful inspect.', expectedCommands: ['show zone-pair security'] },
  ],
  required: [
    { device: 'FW1', command: 'show vlan brief' },
    { device: 'FW1', command: 'show zone security' },
    { device: 'FW1', command: 'show zone-pair security' },
  ],
  verify: ['show vlan brief', 'show zone security', 'show zone-pair security'],
  verifyCmd: 'show zone-pair security',
  verifyExpect: 'GUEST',
  verificationChecks: [
    { id: 'v1', device: 'FW1', command: 'show vlan brief', expectedResult: 'Separate VLANs for users/servers/guest', passCondition: 'L2 segmentation' },
    { id: 'v2', device: 'FW1', command: 'show zone-pair security', expectedResult: 'GUEST→INSIDE deny; INSIDE→OUTSIDE inspect', passCondition: 'zone policy' },
  ],
  success: ['VLANs segment L2; firewalls enforce L3/L4 policy between zones', 'Guest zone blocked from inside resources', 'Stateful inspect on inside-to-outside'],
  mistakes: ['Assuming VLANs alone stop routed attacks between subnets', 'Confusing micro-segmentation with one flat VLAN for all servers'],
  topoNodes: [{ id: 'fw', label: 'FW1 NGFW', type: 'router', x: 50, y: 40 }, { id: 'inside', label: 'INSIDE VLANs', type: 'switch', x: 25, y: 70 }, { id: 'guest', label: 'GUEST VLAN', type: 'pc', x: 75, y: 70 }],
  topoLinks: [{ id: 'l1', source: 'inside', target: 'fw', status: 'forwarding' }, { id: 'l2', source: 'guest', target: 'fw', label: 'deny→inside', status: 'blocked' }],
  diagNodes: [{ id: 'vlan', label: 'VLAN L2 boundary', type: 'subnet', x: 25, y: 50 }, { id: 'zone', label: 'Zone L3 policy', type: 'process', x: 75, y: 50, status: 'highlighted' }],
  diagLinks: [{ id: 'd1', source: 'vlan', target: 'zone', label: 'firewall required', status: 'forwarded' }],
  flowSteps: [
    { id: 's1', order: 1, title: 'Segment', action: 'VLANs/VRFs divide networks into smaller trust zones', successState: 'noted' },
    { id: 's2', order: 2, title: 'Policy', action: 'NGFW zone-pairs permit or deny inter-zone traffic', successState: 'noted' },
    { id: 's3', order: 3, title: 'Limit blast', action: 'Micro-segmentation restricts lateral movement after a breach', successState: 'noted' },
  ],
})

/* ---- Phase 4 ---- */

const LLDP = mkGuided({
  id: 'LAB-LLDP', title: 'Enable LLDP and Disable CDP', domainId: 'access', objectiveId: '2.3',
  ckuIds: ['CKU-LLDP', 'CKU-CDP'],
  chapter: '2.3 LLDP', minutes: 10,
  scenario: 'SW1 should use vendor-neutral LLDP instead of CDP. Disable CDP globally, enable LLDP, and verify neighbors on the trunk to SW2.',
  goals: ['no cdp run', 'lldp run', 'show lldp neighbors'],
  tasks: [
    { id: 't1', order: 1, title: 'Disable CDP', device: 'SW1', instruction: 'Turn off CDP globally.', expectedCommands: ['no cdp run'] },
    { id: 't2', order: 2, title: 'Enable LLDP', device: 'SW1', instruction: 'Enable LLDP globally.', expectedCommands: ['lldp run'] },
    { id: 't3', order: 3, title: 'Verify neighbors', device: 'SW1', instruction: 'Show LLDP neighbors.', expectedCommands: ['show lldp neighbors'] },
  ],
  required: [{ device: 'SW1', command: 'no cdp run' }, { device: 'SW1', command: 'lldp run' }],
  verify: ['show lldp neighbors'],
  verifyCmd: 'show lldp neighbors', verifyExpect: 'Device ID',
  success: ['LLDP neighbors visible', 'CDP disabled'],
  mistakes: ['Leaving both CDP and LLDP on without reason', 'LLDP not enabled on remote switch — one-way discovery'],
  topoNodes: [{ id: 'sw1', label: 'SW1', type: 'switch', x: 35, y: 50 }, { id: 'sw2', label: 'SW2', type: 'switch', x: 65, y: 50 }],
  topoLinks: [{ id: 'l1', source: 'sw1', target: 'sw2', label: 'trunk', status: 'forwarding' }],
  diagNodes: [{ id: 'sw1', label: 'SW1 LLDP', type: 'switch', x: 35, y: 50 }, { id: 'sw2', label: 'SW2', type: 'switch', x: 65, y: 50 }],
  diagLinks: [{ id: 'd1', source: 'sw1', target: 'sw2', label: 'LLDP', status: 'forwarding' }],
  flowSteps: [{ id: 's1', order: 1, title: 'Advertise', action: 'LLDP TLVs exchanged on link', successState: 'learned' }],
})

const SNMP = mkGuided({
  id: 'LAB-SNMP', title: 'Configure SNMPv2c Read-Only Community', domainId: 'services', objectiveId: '4.4',
  ckuIds: ['CKU-SNMP'],
  chapter: '4.4 SNMP', minutes: 10,
  scenario: 'Allow read-only SNMP polling from NMS 192.168.1.100 using community CCNAro with ACL restriction.',
  goals: ['snmp-server community RO', 'snmp-server host traps', 'Restrict with ACL'],
  tasks: [
    { id: 't1', order: 1, title: 'RO community', device: 'R1', instruction: 'snmp-server community CCNAro RO.', expectedCommands: ['snmp-server community CCNAro ro'] },
    { id: 't2', order: 2, title: 'Trap host', device: 'R1', instruction: 'Send traps to 192.168.1.100 version 2c CCNAro.', expectedCommands: ['snmp-server host 192.168.1.100 version 2c CCNAro'] },
    { id: 't3', order: 3, title: 'Location/contact', device: 'R1', instruction: 'Set snmp-server location and contact for inventory.', expectedCommands: ['snmp-server location HQ', 'snmp-server contact netops@example.com'] },
    { id: 't4', order: 4, title: 'Verify', device: 'R1', instruction: 'Show SNMP config.', expectedCommands: ['show snmp community'] },
  ],
  required: [
    { device: 'R1', command: 'snmp-server community CCNAro ro' },
    { device: 'R1', command: 'snmp-server host 192.168.1.100 version 2c CCNAro' },
  ],
  verify: ['show snmp', 'show snmp community'],
  verifyCmd: 'show snmp community', verifyExpect: 'CCNAro',
  success: ['RO community configured', 'Trap host points to NMS'],
  mistakes: ['RW community for polling only', 'SNMPv1 vs v2c host syntax confusion'],
  topoNodes: [{ id: 'r1', label: 'R1', type: 'router', x: 35, y: 50 }, { id: 'nms', label: 'NMS .100', type: 'server', x: 75, y: 50 }],
  topoLinks: [{ id: 'l1', source: 'r1', target: 'nms', label: 'UDP/161', status: 'forwarding' }],
  diagNodes: [{ id: 'r1', label: 'Agent', type: 'router', x: 35, y: 50 }, { id: 'nms', label: 'Manager', type: 'server', x: 75, y: 50 }],
  diagLinks: [{ id: 'd1', source: 'nms', target: 'r1', label: 'GET', status: 'forwarded' }],
  flowSteps: [
    { id: 's1', order: 1, title: 'Poll', action: 'NMS polls OID with RO community', successState: 'matched' },
    { id: 's2', order: 2, title: 'Trap', action: 'Device sends trap on link down', successState: 'forwarded' },
  ],
})

const PAGP_EC = mkGuided({
  id: 'LAB-ETHERCHANNEL-PAGP', title: 'Configure PAgP EtherChannel (Desirable Mode)', domainId: 'access', objectiveId: '2.4',
  ckuIds: ['CKU-ETHERCHANNEL'],
  chapter: '2.4 PAgP EtherChannel', minutes: 14,
  scenario: 'Bundle SW1 Gi0/1–2 to SW2 using Port-channel 2 with PAgP desirable on SW1 and auto on SW2.',
  goals: ['channel-group mode desirable', 'channel-group mode auto', 'Cisco proprietary PAgP'],
  tasks: [
    { id: 't1', order: 1, title: 'SW1 Gi0/1', device: 'SW1', instruction: 'Trunk + channel-group 2 mode desirable.', expectedCommands: ['interface gi0/1', 'switchport mode trunk', 'channel-group 2 mode desirable'] },
    { id: 't2', order: 2, title: 'SW1 Gi0/2', device: 'SW1', instruction: 'Add Gi0/2 to Po2 desirable.', expectedCommands: ['interface gi0/2', 'channel-group 2 mode desirable'] },
    { id: 't3', order: 3, title: 'SW2 Gi0/1', device: 'SW2', instruction: 'Trunk + channel-group 2 mode auto on SW2.', expectedCommands: ['interface gi0/1', 'channel-group 2 mode auto'] },
    { id: 't4', order: 4, title: 'SW2 Gi0/2', device: 'SW2', instruction: 'Gi0/2 channel-group 2 mode auto.', expectedCommands: ['interface gi0/2', 'channel-group 2 mode auto'] },
    { id: 't5', order: 5, title: 'Verify', device: 'SW1', instruction: 'show etherchannel summary — Po2 up.', expectedCommands: ['show etherchannel summary'] },
  ],
  required: [
    { device: 'SW1', command: 'channel-group 2 mode desirable' },
    { device: 'SW2', command: 'channel-group 2 mode auto' },
  ],
  verify: ['show etherchannel summary'],
  verifyCmd: 'show etherchannel summary', verifyExpect: 'Po2',
  success: ['Po2 bundled with PAgP', 'Both links active'],
  mistakes: ['Both sides desirable — works; both passive/auto — fails to form', 'Mixing LACP active with PAgP'],
  topoNodes: [{ id: 'sw1', label: 'SW1 desirable', type: 'switch', x: 30, y: 50 }, { id: 'sw2', label: 'SW2 auto', type: 'switch', x: 70, y: 50 }],
  topoLinks: [{ id: 'l1', source: 'sw1', target: 'sw2', label: 'Po2', status: 'forwarding' }],
  diagNodes: [{ id: 'sw1', label: 'desirable', type: 'switch', x: 35, y: 50 }, { id: 'sw2', label: 'auto', type: 'switch', x: 65, y: 50 }],
  diagLinks: [{ id: 'd1', source: 'sw1', target: 'sw2', label: 'PAgP', status: 'forwarding' }],
  flowSteps: [{ id: 's1', order: 1, title: 'Negotiate', action: 'PAgP forms Po2', successState: 'matched' }],
})

const L3_EC = mkGuided({
  id: 'LAB-L3-ETHERCHANNEL', title: 'Configure Layer 3 EtherChannel Between Routers', domainId: 'access', objectiveId: '2.4',
  ckuIds: ['CKU-ETHERCHANNEL', 'CKU-ROUTED-PORT'],
  chapter: '2.4 L3 EtherChannel', minutes: 16,
  scenario: 'R1 and R2 connect via Gi0/1 and Gi0/2. Build routed Port-channel 1 with LACP, assign 10.0.12.1/30 and .2/30, enable OSPF over the bundle.',
  goals: ['no switchport', 'channel-group mode active', 'IP on Port-channel'],
  tasks: [
    { id: 't1', order: 1, title: 'R1 Gi0/1 routed', device: 'R1', instruction: 'no switchport + channel-group 1 mode active on Gi0/1.', expectedCommands: ['interface gi0/1', 'no switchport', 'channel-group 1 mode active'] },
    { id: 't2', order: 2, title: 'R1 Gi0/2', device: 'R1', instruction: 'Add Gi0/2 to same bundle.', expectedCommands: ['interface gi0/2', 'no switchport', 'channel-group 1 mode active'] },
    { id: 't3', order: 3, title: 'R1 Po1 IP', device: 'R1', instruction: 'interface Port-channel 1 ip address 10.0.12.1 255.255.255.252.', expectedCommands: ['interface port-channel 1', 'ip address 10.0.12.1 255.255.255.252'] },
    { id: 't4', order: 4, title: 'R2 bundle', device: 'R2', instruction: 'Mirror L3 EtherChannel on R2 with .2/30 on Po1.', expectedCommands: ['interface gi0/1', 'no switchport', 'channel-group 1 mode active', 'interface port-channel 1', 'ip address 10.0.12.2 255.255.255.252'] },
    { id: 't5', order: 5, title: 'Verify', device: 'R1', instruction: 'show etherchannel summary and ping 10.0.12.2.', expectedCommands: ['show etherchannel summary', 'ping 10.0.12.2'] },
  ],
  required: [
    { device: 'R1', command: 'no switchport' },
    { device: 'R1', command: 'channel-group 1 mode active' },
    { device: 'R1', command: 'interface port-channel 1' },
    { device: 'R1', command: 'ip address 10.0.12.1 255.255.255.252' },
  ],
  verify: ['show etherchannel summary', 'show ip interface brief'],
  verifyCmd: 'show etherchannel summary', verifyExpect: 'Po1',
  success: ['Routed Po1 up with IP', 'Ping across bundle works'],
  mistakes: ['Forgetting no switchport on router ports', 'IP on physical member instead of Port-channel'],
  topoNodes: [{ id: 'r1', label: 'R1 Po1', type: 'router', x: 30, y: 50 }, { id: 'r2', label: 'R2 Po1', type: 'router', x: 70, y: 50 }],
  topoLinks: [{ id: 'l1', source: 'r1', target: 'r2', label: 'L3 Po1', status: 'forwarding' }],
  diagNodes: [{ id: 'po', label: 'Port-channel 1', type: 'process', x: 50, y: 45, status: 'highlighted' }, { id: 'ip', label: '10.0.12.0/30', type: 'subnet', x: 50, y: 65 }],
  diagLinks: [{ id: 'd1', source: 'po', target: 'ip', status: 'forwarded' }],
  flowSteps: [
    { id: 's1', order: 1, title: 'Bundle', action: 'LACP forms routed Po1', successState: 'matched' },
    { id: 's2', order: 2, title: 'Route', action: 'OSPF or static uses single logical interface', successState: 'forwarded' },
  ],
})

/* ---- Lab Wave 99+ — objectives without labs (1.1–1.4, 1.7–1.12, 2.2, 2.7, 4.7, 4.9, 4.10, 5.1, 5.2, 5.7) ---- */

const CLI_D11_11 = {
  'show ip route': `Codes: C - connected, S - static, R - RIP, O - OSPF
Gateway of last resort is 10.1.1.1 to network 0.0.0.0

C    192.168.10.0/24 is directly connected, GigabitEthernet0/0
L    192.168.10.1/32 is directly connected, GigabitEthernet0/0
O    10.20.0.0/16 [110/20] via 10.1.1.2, 00:05:12, GigabitEthernet0/1

Device role: R1 = Layer 3 router — routing table, default gateway for LANs.`,
  'show mac address-table': `Mac Address Table
Vlan    Mac Address       Type        Ports
----    -----------       ----        -----
  10    aaaa.bbbb.cccc    DYNAMIC     Fa0/5
  10    0011.2233.4455    STATIC      Fa0/1

Device role: SW1 = Layer 2 switch — forwards frames using MAC/CAM table within VLANs.`,
  'show wireless summary': `Number of APs........................ 12
Number of WLANs...................... 3
Global AP User Name................. admin

Device role: WLC1 = wireless LAN controller — centralizes lightweight AP config and policy.`,
}

const LAB_D11_11 = mkInterpretGuided({
  id: 'LAB-D11-11', title: 'Identify Network Components from Show Output', domainId: 'fundamentals', objectiveId: '1.1',
  ckuIds: ['CKU-ROUTER', 'CKU-SWITCH', 'CKU-FIREWALL', 'CKU-AP-WLAN'],
  chapter: '1.1 Network components', minutes: 10, cliShowOutput: CLI_D11_11,
  scenario: 'A branch site has R1 (router), SW1 (access switch), and WLC1 (wireless controller). Read static show output from each device type and map OSI layer and role: router = L3 inter-network, switch = L2 MAC forwarding, WLC = AP management.',
  goals: ['Match show ip route to router role', 'Match MAC table to L2 switch', 'Identify WLC as AP/controller manager'],
  tasks: [
    { id: 't1', order: 1, title: 'Router role', device: 'R1', instruction: 'Run show ip route — R1 forwards between subnets using a routing table (Layer 3).', expectedCommands: ['enable', 'show ip route'] },
    { id: 't2', order: 2, title: 'Switch role', device: 'SW1', instruction: 'Run show mac address-table — SW1 learns MACs and forwards frames within VLANs (Layer 2).', expectedCommands: ['show mac address-table'] },
    { id: 't3', order: 3, title: 'WLC role', device: 'WLC1', instruction: 'Run show wireless summary — WLC1 manages lightweight APs and WLAN policy.', expectedCommands: ['show wireless summary'] },
  ],
  required: [
    { device: 'R1', command: 'show ip route' },
    { device: 'SW1', command: 'show mac address-table' },
    { device: 'WLC1', command: 'show wireless summary' },
  ],
  verify: ['show ip route', 'show mac address-table', 'show wireless summary'],
  verifyCmd: 'show ip route', verifyExpect: 'directly connected',
  verificationChecks: [
    { id: 'v1', device: 'R1', command: 'show ip route', expectedResult: 'Routing table with connected and OSPF routes', passCondition: 'router L3 role' },
    { id: 'v2', device: 'SW1', command: 'show mac address-table', expectedResult: 'MAC-to-port mappings per VLAN', passCondition: 'switch L2 role' },
  ],
  success: ['Router identified by routing table', 'Switch identified by MAC table', 'WLC identified by AP/WLAN summary'],
  mistakes: ['Calling an AP a router', 'Expecting L2 switch to route between VLANs without L3 device'],
  topoNodes: [{ id: 'r1', label: 'R1 L3', type: 'router', x: 50, y: 20 }, { id: 'sw1', label: 'SW1 L2', type: 'switch', x: 30, y: 55 }, { id: 'wlc', label: 'WLC1', type: 'server', x: 70, y: 55 }],
  topoLinks: [{ id: 'l1', source: 'r1', target: 'sw1', status: 'forwarding' }, { id: 'l2', source: 'wlc', target: 'sw1', status: 'forwarding' }],
  diagNodes: [{ id: 'rtr', label: 'Router L3', type: 'router', x: 25, y: 50 }, { id: 'sw', label: 'Switch L2', type: 'switch', x: 50, y: 50, status: 'highlighted' }, { id: 'wlc', label: 'WLC/AP', type: 'server', x: 75, y: 50 }],
  diagLinks: [{ id: 'd1', source: 'rtr', target: 'sw', label: 'inter-VLAN', status: 'forwarded' }],
  flowSteps: [
    { id: 's1', order: 1, title: 'Router', action: 'R1 routes packets between subnets via routing table', successState: 'noted' },
    { id: 's2', order: 2, title: 'Switch', action: 'SW1 forwards frames using learned MAC addresses', successState: 'noted' },
    { id: 's3', order: 3, title: 'Controller', action: 'WLC pushes config to lightweight APs', successState: 'noted' },
  ],
})

const CLI_D11_12 = {
  'show cdp neighbors detail': `Device ID: SW-DIST-01
Entry address(es): 10.10.1.2
Platform: cisco C9300, Capabilities: Switch IGMP
Interface: GigabitEthernet0/1, Port ID (outgoing port): GigabitEthernet1/0/48
Holdtime : 179 sec

Topology note: Access SW-ACC-01 uplinks to Distribution SW-DIST-01 (three-tier campus).
Spine-leaf alternative: every leaf connects to every spine — no distribution tier.`,
  'show ip route summary': `Route Source    Networks
connected       4
static          2
ospf 1          18

WAN hub-spoke: branch routers use default route to HQ hub (cost-effective).
Full mesh: every site has direct links (redundant, expensive).`,
}

const LAB_D11_12 = mkInterpretGuided({
  id: 'LAB-D11-12', title: 'Interpret Campus and WAN Topology Architectures', domainId: 'fundamentals', objectiveId: '1.2',
  ckuIds: ['CKU-CAMPUS-TIER', 'CKU-SPINE-LEAF', 'CKU-WAN-TOPO', 'CKU-CLOUD-ONPREM'],
  chapter: '1.2 Topology architectures', minutes: 10, cliShowOutput: CLI_D11_12,
  scenario: 'Read CDP neighbor and routing summaries to identify three-tier campus (access→distribution→core), contrast spine-leaf data-center fabric, and recognize hub-and-spoke WAN vs full mesh.',
  goals: ['Identify access/distribution/core tiers', 'Contrast spine-leaf with three-tier', 'Recognize hub-spoke WAN routing'],
  tasks: [
    { id: 't1', order: 1, title: 'Campus tiers', device: 'SW1', instruction: 'Run show cdp neighbors detail — access switch uplinks to distribution layer.', expectedCommands: ['enable', 'show cdp neighbors detail'] },
    { id: 't2', order: 2, title: 'WAN routing pattern', device: 'R1', instruction: 'Run show ip route summary — branch sites often use static/default routes to a central hub.', expectedCommands: ['show ip route summary'] },
  ],
  required: [{ device: 'SW1', command: 'show cdp neighbors detail' }, { device: 'R1', command: 'show ip route summary' }],
  verify: ['show cdp neighbors detail', 'show ip route summary'],
  verifyCmd: 'show cdp neighbors detail', verifyExpect: 'SW-DIST',
  verificationChecks: [{ id: 'v1', device: 'SW1', command: 'show cdp neighbors detail', expectedResult: 'Access uplink to distribution switch', passCondition: 'campus tier' }],
  success: ['Three-tier access→distribution identified', 'Spine-leaf noted as DC alternative', 'Hub-spoke WAN pattern recognized'],
  mistakes: ['Confusing spine-leaf with three-tier campus', 'Assuming full mesh is default for all WANs'],
  topoNodes: [{ id: 'acc', label: 'Access', type: 'switch', x: 30, y: 70 }, { id: 'dist', label: 'Distribution', type: 'switch', x: 50, y: 45 }, { id: 'core', label: 'Core', type: 'router', x: 50, y: 20 }],
  topoLinks: [{ id: 'l1', source: 'acc', target: 'dist', status: 'forwarding' }, { id: 'l2', source: 'dist', target: 'core', status: 'forwarding' }],
  diagNodes: [{ id: 'tier', label: '3-tier campus', type: 'process', x: 35, y: 50, status: 'highlighted' }, { id: 'spine', label: 'Spine-leaf', type: 'process', x: 65, y: 50 }],
  diagLinks: [{ id: 'd1', source: 'tier', target: 'spine', label: 'vs DC fabric', status: 'forwarding' }],
  flowSteps: [
    { id: 's1', order: 1, title: 'Campus', action: 'Access connects endpoints; distribution aggregates; core provides high-speed backbone', successState: 'noted' },
    { id: 's2', order: 2, title: 'WAN', action: 'Hub-spoke routes all branches through central site; mesh connects every site directly', successState: 'noted' },
  ],
})

const CLI_D11_13 = {
  'show interfaces gi0/1': `GigabitEthernet0/1 is up, line protocol is up
  Hardware is Gigabit Ethernet, address is aaaa.bbbb.cccc
  Media type is 10/100/1000BaseTX (RJ-45 copper UTP Cat6)
  Full-duplex, 1000Mb/s
  Input flow-control is off, output flow-control is off`,
  'show interfaces gi0/2': `GigabitEthernet0/2 is up, line protocol is up
  Hardware is Gigabit Ethernet
  Media type is SFP 1000Base-LX (single-mode fiber, LC connector)
  Full-duplex, 1000Mb/s`,
  'show inventory': `NAME: "SFP-GE-L", DESCR: "1000BaseLX SFP transceiver"
PID: GLC-LH-SMD        , VID: V01  , SN: FNS12345678

Copper UTP: max ~100 m, RJ-45. Fiber SM: long distance (yellow), MM: shorter (orange/aqua).`,
}

const LAB_D11_13 = mkInterpretGuided({
  id: 'LAB-D11-13', title: 'Identify Physical Interface and Cabling Types', domainId: 'fundamentals', objectiveId: '1.3',
  ckuIds: ['CKU-UTP', 'CKU-FIBER', 'CKU-CABLE-TYPES', 'CKU-SFP'],
  chapter: '1.3 Physical interfaces and cabling', minutes: 10, cliShowOutput: CLI_D11_13,
  scenario: 'SW1 has Gi0/1 on copper UTP (RJ-45 Cat6) to an access switch and Gi0/2 on SFP fiber for a long uplink. Read show output to distinguish copper vs fiber, SM vs MM, and modular SFP transceivers.',
  goals: ['Read media type from show interfaces', 'Contrast UTP copper with SFP fiber', 'Identify SFP as hot-swappable transceiver'],
  tasks: [
    { id: 't1', order: 1, title: 'Copper port', device: 'SW1', instruction: 'Run show interfaces gi0/1 — note 1000BaseTX RJ-45 copper UTP.', expectedCommands: ['enable', 'show interfaces gi0/1'] },
    { id: 't2', order: 2, title: 'Fiber SFP port', device: 'SW1', instruction: 'Run show interfaces gi0/2 — SFP 1000Base-LX single-mode fiber with LC connector.', expectedCommands: ['show interfaces gi0/2'] },
    { id: 't3', order: 3, title: 'Transceiver inventory', device: 'SW1', instruction: 'Run show inventory — confirm modular SFP transceiver model.', expectedCommands: ['show inventory'] },
  ],
  required: [{ device: 'SW1', command: 'show interfaces gi0/1' }, { device: 'SW1', command: 'show interfaces gi0/2' }, { device: 'SW1', command: 'show inventory' }],
  verify: ['show interfaces gi0/1', 'show interfaces gi0/2', 'show inventory'],
  verifyCmd: 'show interfaces gi0/1', verifyExpect: 'BaseTX',
  verificationChecks: [
    { id: 'v1', device: 'SW1', command: 'show interfaces gi0/1', expectedResult: 'RJ-45 copper UTP', passCondition: 'copper media' },
    { id: 'v2', device: 'SW1', command: 'show interfaces gi0/2', expectedResult: 'SFP fiber LX single-mode', passCondition: 'fiber media' },
  ],
  success: ['Copper UTP identified on Gi0/1', 'SFP fiber identified on Gi0/2', 'SFP transceiver confirmed in inventory'],
  mistakes: ['Confusing straight-through vs crossover on modern auto-MDIX ports', 'Mixing single-mode (long) with multimode (short) fiber'],
  topoNodes: [{ id: 'sw1', label: 'SW1', type: 'switch', x: 50, y: 40 }, { id: 'copper', label: 'UTP Cat6', type: 'pc', x: 25, y: 70 }, { id: 'fiber', label: 'SM fiber', type: 'router', x: 75, y: 70 }],
  topoLinks: [{ id: 'l1', source: 'sw1', target: 'copper', label: 'Gi0/1', status: 'forwarding' }, { id: 'l2', source: 'sw1', target: 'fiber', label: 'Gi0/2 SFP', status: 'forwarding' }],
  diagNodes: [{ id: 'utp', label: 'Copper UTP', type: 'process', x: 30, y: 55 }, { id: 'sfp', label: 'SFP Fiber', type: 'process', x: 70, y: 55, status: 'highlighted' }],
  diagLinks: [{ id: 'd1', source: 'utp', target: 'sfp', label: 'media choice', status: 'forwarding' }],
  flowSteps: [{ id: 's1', order: 1, title: 'Copper', action: 'UTP RJ-45 for short LAN runs ≤100 m', successState: 'noted' }, { id: 's2', order: 2, title: 'Fiber', action: 'SFP transceivers enable fiber uplinks for distance', successState: 'noted' }],
})

const CLI_D11_14 = {
  'show interfaces gi0/5': `GigabitEthernet0/5 is up, line protocol is up (connected)
  Full-duplex, 1000Mb/s, media type is 10/100/1000BaseTX
  5 minute input rate 0 bits/sec, 0 packets/sec
  5 minute output rate 0 bits/sec, 0 packets/sec
     0 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored
     0 output errors, 0 collisions, 0 interface resets`,
  'show interfaces gi0/6': `GigabitEthernet0/6 is up, line protocol is up (connected)
  Half-duplex, 100Mb/s, media type is 10/100/1000BaseTX
     4821 input errors, 4800 CRC, 0 frame, 0 overrun, 0 ignored
     1205 output errors, 890 collisions, 0 interface resets

DIAGNOSIS: Duplex mismatch — remote end likely full-duplex 1000 while Gi0/6 forced half-duplex.`,
  'show interfaces gi0/6 status': `Port      Name               Status       Vlan       Duplex  Speed Type
Gi0/6                        connected    1          half    100   10/100/1000BaseTX`,
}

const LAB_D11_14 = mkInterpretGuided({
  id: 'LAB-D11-14', title: 'Diagnose Interface and Cable Issues from Counters', domainId: 'fundamentals', objectiveId: '1.4',
  ckuIds: ['CKU-IF-ERRORS', 'CKU-CRC', 'CKU-DUPLEX-MISMATCH', 'CKU-COLLISIONS'],
  chapter: '1.4 Interface and cable issues', minutes: 10, cliShowOutput: CLI_D11_14,
  scenario: 'Gi0/5 is healthy full-duplex 1000 Mb/s. Gi0/6 shows high CRC errors, collisions, and half-duplex — classic duplex mismatch. Read show interfaces output to isolate Layer 1 physical problems.',
  goals: ['Interpret CRC and collision counters', 'Identify duplex mismatch symptoms', 'Contrast healthy vs failing interface'],
  tasks: [
    { id: 't1', order: 1, title: 'Healthy interface', device: 'SW1', instruction: 'Run show interfaces gi0/5 — zero errors, full-duplex 1000 Mb/s baseline.', expectedCommands: ['enable', 'show interfaces gi0/5'] },
    { id: 't2', order: 2, title: 'Error counters', device: 'SW1', instruction: 'Run show interfaces gi0/6 — note CRC errors and collisions indicating duplex mismatch.', expectedCommands: ['show interfaces gi0/6'] },
    { id: 't3', order: 3, title: 'Duplex verify', device: 'SW1', instruction: 'Run show interfaces gi0/6 status — confirm half-duplex vs expected full-duplex.', expectedCommands: ['show interfaces gi0/6 status'] },
  ],
  required: [{ device: 'SW1', command: 'show interfaces gi0/5' }, { device: 'SW1', command: 'show interfaces gi0/6' }, { device: 'SW1', command: 'show interfaces gi0/6 status' }],
  verify: ['show interfaces gi0/5', 'show interfaces gi0/6', 'show interfaces gi0/6 status'],
  verifyCmd: 'show interfaces gi0/6', verifyExpect: 'CRC',
  verificationChecks: [{ id: 'v1', device: 'SW1', command: 'show interfaces gi0/6', expectedResult: 'High CRC + collisions on half-duplex', passCondition: 'duplex mismatch' }],
  success: ['Healthy port has zero CRC', 'Gi0/6 CRC/collisions traced to duplex mismatch', 'Fix: match speed/duplex both ends or use auto'],
  mistakes: ['Ignoring CRC as cable/EMI vs always blaming config', 'Leaving one side forced while other auto-negotiates'],
  topoNodes: [{ id: 'sw1', label: 'SW1', type: 'switch', x: 50, y: 40 }, { id: 'ok', label: 'Gi0/5 OK', type: 'pc', x: 25, y: 70 }, { id: 'bad', label: 'Gi0/6 mismatch', type: 'pc', x: 75, y: 70, status: 'error' }],
  topoLinks: [{ id: 'l1', source: 'sw1', target: 'ok', status: 'forwarding' }, { id: 'l2', source: 'sw1', target: 'bad', status: 'blocked' }],
  diagNodes: [{ id: 'crc', label: 'CRC errors', type: 'process', x: 40, y: 55, status: 'error' }, { id: 'fix', label: 'Match duplex', type: 'process', x: 65, y: 55, status: 'highlighted' }],
  diagLinks: [{ id: 'd1', source: 'crc', target: 'fix', status: 'forwarded' }],
  flowSteps: [{ id: 's1', order: 1, title: 'Symptom', action: 'CRC errors and collisions on half-duplex link', successState: 'noted' }, { id: 's2', order: 2, title: 'Fix', action: 'Align speed/duplex on both ends — prefer auto-auto', successState: 'noted' }],
})

const CLI_D11_17 = {
  'show ip route': `C    192.168.1.0/24 is directly connected, Vlan10
C    10.0.0.0/8 is directly connected, GigabitEthernet0/0
S    0.0.0.0/0 [1/0] via 203.0.113.1

RFC 1918 private ranges (NOT Internet-routable):
  10.0.0.0/8  |  172.16.0.0/12  |  192.168.0.0/16
10.0.0.0/8 above is private — requires NAT for Internet access.`,
  'show ip nat translations': `Pro  Inside global     Inside local       Outside local      Outside global
tcp  203.0.113.50:80   10.0.0.10:80       ---                ---

Inside local 10.0.0.10 (private RFC1918) translated to public 203.0.113.50.`,
}

const LAB_D11_17 = mkInterpretGuided({
  id: 'LAB-D11-17', title: 'Identify RFC 1918 Private IPv4 Addressing', domainId: 'fundamentals', objectiveId: '1.7',
  ckuIds: ['CKU-RFC1918', 'CKU-PUBLIC-PRIVATE', 'CKU-APIPA'],
  chapter: '1.7 Private IPv4 addressing', minutes: 10, cliShowOutput: CLI_D11_17,
  scenario: 'R1 uses 10.0.0.0/8 (RFC 1918 private) internally and NAT to reach the Internet. Read routing and NAT tables to distinguish private vs public addresses and explain why NAT is required.',
  goals: ['Recall RFC 1918 ranges 10/8, 172.16/12, 192.168/16', 'Contrast private inside-local with public inside-global', 'Recognize APIPA 169.254.x.x as DHCP failure indicator'],
  tasks: [
    { id: 't1', order: 1, title: 'Private routes', device: 'R1', instruction: 'Run show ip route — identify 10.0.0.0/8 as RFC 1918 private (not Internet-routable).', expectedCommands: ['enable', 'show ip route'] },
    { id: 't2', order: 2, title: 'NAT translation', device: 'R1', instruction: 'Run show ip nat translations — inside-local private address mapped to public global.', expectedCommands: ['show ip nat translations'] },
  ],
  required: [{ device: 'R1', command: 'show ip route' }, { device: 'R1', command: 'show ip nat translations' }],
  verify: ['show ip route', 'show ip nat translations'],
  verifyCmd: 'show ip route', verifyExpect: '10.0.0.0',
  verificationChecks: [{ id: 'v1', device: 'R1', command: 'show ip nat translations', expectedResult: '10.0.0.10 private → 203.0.113.50 public', passCondition: 'NAT private to public' }],
  success: ['RFC 1918 10/8 identified as private', 'NAT maps private to public for Internet', 'APIPA 169.254.x.x noted as DHCP failure'],
  mistakes: ['Routing private addresses on the public Internet without NAT', 'Confusing link-local APIPA with RFC 1918 private'],
  topoNodes: [{ id: 'r1', label: 'R1 NAT', type: 'router', x: 50, y: 40 }, { id: 'lan', label: '10.0.0.0/8 private', type: 'subnet', x: 25, y: 70 }, { id: 'wan', label: '203.0.113.x public', type: 'cloud', x: 75, y: 70 }],
  topoLinks: [{ id: 'l1', source: 'lan', target: 'r1', status: 'forwarding' }, { id: 'l2', source: 'r1', target: 'wan', label: 'NAT', status: 'forwarding' }],
  diagNodes: [{ id: 'priv', label: 'RFC1918 private', type: 'subnet', x: 30, y: 55 }, { id: 'pub', label: 'Public global', type: 'subnet', x: 70, y: 55, status: 'highlighted' }],
  diagLinks: [{ id: 'd1', source: 'priv', target: 'pub', label: 'NAT', status: 'forwarded' }],
  flowSteps: [{ id: 's1', order: 1, title: 'Private', action: 'RFC 1918 addresses reused inside organizations', successState: 'noted' }, { id: 's2', order: 2, title: 'NAT', action: 'NAT translates private to public at Internet edge', successState: 'noted' }],
})

const LAB_D11_18 = mkGuided({
  id: 'LAB-D11-18', title: 'Configure and Verify IPv6 Addressing on a Router', domainId: 'fundamentals', objectiveId: '1.8',
  ckuIds: ['CKU-IPV6-ADDRESSING', 'CKU-IPV6-SHORTENING', 'CKU-IPV6-SLAAC'],
  chapter: '1.8 IPv6 addressing', minutes: 12,
  scenario: 'R1 Gi0/0 connects the LAN with prefix 2001:db8:acad:1::/64. Enable IPv6 routing globally, assign 2001:db8:acad:1::1/64 on Gi0/0, and verify with show ipv6 interface brief.',
  goals: ['ipv6 unicast-routing globally', 'Assign /64 global unicast on interface', 'Verify with show ipv6 interface brief'],
  tasks: [
    { id: 't1', order: 1, title: 'Enable IPv6 routing', device: 'R1', instruction: 'Enable IPv6 unicast routing globally.', expectedCommands: ['ipv6 unicast-routing'] },
    { id: 't2', order: 2, title: 'Assign IPv6 address', device: 'R1', instruction: 'On Gi0/0 assign 2001:db8:acad:1::1/64.', expectedCommands: ['interface gi0/0', 'ipv6 address 2001:db8:acad:1::1/64', 'no shutdown'] },
    { id: 't3', order: 3, title: 'Verify', device: 'R1', instruction: 'Confirm global and link-local addresses on Gi0/0.', expectedCommands: ['show ipv6 interface brief'] },
  ],
  required: [{ device: 'R1', command: 'ipv6 unicast-routing' }, { device: 'R1', command: 'ipv6 address 2001:db8:acad:1::1/64' }],
  verify: ['show ipv6 interface brief', 'show ipv6 interface gi0/0'],
  verifyCmd: 'show ipv6 interface brief', verifyExpect: '2001:db8:acad:1::1',
  success: ['IPv6 routing enabled', 'Global /64 assigned on Gi0/0', 'Link-local FE80:: auto-assigned'],
  mistakes: ['Forgetting ipv6 unicast-routing', 'Using non-/64 prefix with SLAAC expectation'],
  topoNodes: [{ id: 'r1', label: 'R1', type: 'router', x: 50, y: 40 }, { id: 'lan', label: 'LAN /64', type: 'subnet', x: 50, y: 70 }],
  topoLinks: [{ id: 'l1', source: 'r1', target: 'lan', label: 'Gi0/0', status: 'forwarding' }],
  diagNodes: [{ id: 'gua', label: '2001:db8::/64 GUA', type: 'subnet', x: 40, y: 55, status: 'highlighted' }, { id: 'll', label: 'FE80:: link-local', type: 'process', x: 65, y: 55 }],
  diagLinks: [{ id: 'd1', source: 'gua', target: 'll', status: 'forwarded' }],
  flowSteps: [{ id: 's1', order: 1, title: 'Config', action: 'Router advertises /64 prefix for SLAAC', successState: 'matched' }, { id: 's2', order: 2, title: 'Verify', action: 'show ipv6 interface brief lists GUA + link-local', successState: 'forwarded' }],
})

const CLI_D11_19 = {
  'show ipv6 interface gi0/0': `GigabitEthernet0/0 is up, line protocol is up
  IPv6 is enabled, link-local address is FE80::1:1FF:FE00:1
  Global unicast address(es):
    2001:DB8:ACAD:1::1, subnet is 2001:DB8:ACAD:1::/64 [GUA — public routable 2000::/3]
  Joined group address(es):
    FF02::1  (all-nodes link-local multicast)
    FF02::2  (all-routers link-local multicast)

Address type summary:
  GUA 2000::/3 — public routable (like public IPv4)
  ULA FD00::/8 — private IPv6 (like RFC1918)
  Link-local FE80::/10 — on-link only, never routed
  Multicast FF00::/8 — replaces IPv4 broadcast`,
}

const LAB_D11_19 = mkInterpretGuided({
  id: 'LAB-D11-19', title: 'Compare IPv6 Address Types from Interface Output', domainId: 'fundamentals', objectiveId: '1.9',
  ckuIds: ['CKU-IPV6-GLOBAL-UNICAST', 'CKU-IPV6-UNIQUE-LOCAL', 'CKU-IPV6-LINK-LOCAL', 'CKU-IPV6-MULTICAST'],
  chapter: '1.9 IPv6 address types', minutes: 10, cliShowOutput: CLI_D11_19,
  scenario: 'R1 Gi0/0 shows global unicast (2001:db8::), link-local (FE80::), and joined multicast groups (FF02::1, FF02::2). Read output to classify GUA, ULA, link-local, and multicast — IPv6 has no broadcast.',
  goals: ['Classify GUA 2000::/3 vs ULA FD00::/8', 'Explain link-local FE80::/10 scope', 'Identify multicast FF02::1 and FF02::2'],
  tasks: [
    { id: 't1', order: 1, title: 'Address types', device: 'R1', instruction: 'Run show ipv6 interface gi0/0 — list GUA, link-local, and multicast groups.', expectedCommands: ['enable', 'show ipv6 interface gi0/0'] },
  ],
  required: [{ device: 'R1', command: 'show ipv6 interface gi0/0' }],
  verify: ['show ipv6 interface gi0/0'],
  verifyCmd: 'show ipv6 interface gi0/0', verifyExpect: 'FE80',
  verificationChecks: [
    { id: 'v1', device: 'R1', command: 'show ipv6 interface gi0/0', expectedResult: 'GUA 2001: + link-local FE80 + FF02 groups', passCondition: 'address type classification' },
  ],
  success: ['GUA in 2000::/3 identified', 'Link-local FE80 never routed off-link', 'Multicast replaces broadcast'],
  mistakes: ['Expecting IPv6 broadcast address', 'Routing link-local addresses off the local segment'],
  topoNodes: [{ id: 'lan', label: 'LAN hosts', type: 'subnet', x: 22, y: 55 }, { id: 'r1', label: 'R1 Gi0/0', type: 'router', x: 55, y: 45 }],
  topoLinks: [{ id: 'l1', source: 'lan', target: 'r1', label: 'Gi0/0', status: 'forwarding' }],
  diagNodes: [{ id: 'gua', label: 'GUA 2000::/3', type: 'subnet', x: 25, y: 55 }, { id: 'll', label: 'FE80::/10', type: 'process', x: 50, y: 55, status: 'highlighted' }, { id: 'mc', label: 'FF00::/8', type: 'process', x: 75, y: 55 }],
  diagLinks: [{ id: 'd1', source: 'gua', target: 'll', status: 'forwarding' }],
  flowSteps: [{ id: 's1', order: 1, title: 'Types', action: 'Every interface has link-local; GUA for routed traffic; multicast for groups', successState: 'noted' }],
})

const CLI_D11_110 = {
  'ipconfig /all': `Windows IP Configuration
   Host Name . . . . . . . . . . . . : PC-CORP-01
   IPv4 Address. . . . . . . . . . . : 192.168.10.45(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.10.1
   DHCP Server . . . . . . . . . . . : 192.168.10.1
   DNS Servers . . . . . . . . . . . : 192.168.10.1
   Physical Address. . . . . . . . . : A4-B1-C2-D3-E4-F5

Verify checklist: IP + mask + gateway + DNS from DHCP lease.`,
  'ping 8.8.8.8': `Pinging 8.8.8.8 with 32 bytes of data:
Reply from 8.8.8.8: bytes=32 time=12ms TTL=118
Ping OK — L3 routing and default gateway working.`,
  'ping www.example.com': `Ping request could not find host www.example.com.
DNS failure — IP works but name resolution broken (check DNS server setting).`,
}

const LAB_D11_110 = mkInterpretGuided({
  id: 'LAB-D11-110', title: 'Verify Client IP Parameters and Troubleshoot Connectivity', domainId: 'fundamentals', objectiveId: '1.10',
  ckuIds: ['CKU-IPCONFIG', 'CKU-PING-TRACE', 'CKU-DNS-GW-ISSUES'],
  chapter: '1.10 Client IP parameters', minutes: 10, cliShowOutput: CLI_D11_110,
  scenario: 'PC-CORP-01 received DHCP parameters. Read ipconfig /all output, then use ping to isolate gateway vs DNS issues — ping to 8.8.8.8 succeeds but hostname fails (DNS problem).',
  goals: ['Read ipconfig for IP/mask/gateway/DNS', 'Use ping IP vs ping name to isolate DNS', 'Identify wrong gateway symptom'],
  tasks: [
    { id: 't1', order: 1, title: 'Client parameters', device: 'PC1', instruction: 'Run ipconfig /all — note IPv4, mask, default gateway, DNS from DHCP.', expectedCommands: ['ipconfig /all'] },
    { id: 't2', order: 2, title: 'Ping IP', device: 'PC1', instruction: 'Ping 8.8.8.8 — confirms routing/gateway OK when reply received.', expectedCommands: ['ping 8.8.8.8'] },
    { id: 't3', order: 3, title: 'Ping name', device: 'PC1', instruction: 'Ping www.example.com fails — DNS resolution issue despite working IP connectivity.', expectedCommands: ['ping www.example.com'] },
  ],
  required: [{ device: 'PC1', command: 'ipconfig /all' }, { device: 'PC1', command: 'ping 8.8.8.8' }, { device: 'PC1', command: 'ping www.example.com' }],
  verify: ['ipconfig /all', 'ping 8.8.8.8', 'ping www.example.com'],
  verifyCmd: 'ipconfig /all', verifyExpect: 'Default Gateway',
  verificationChecks: [{ id: 'v1', device: 'PC1', command: 'ping www.example.com', expectedResult: 'Host not found — DNS failure', passCondition: 'DNS vs gateway isolation' }],
  success: ['ipconfig shows complete DHCP lease', 'Ping IP succeeds — gateway OK', 'Ping name fails — DNS misconfigured'],
  mistakes: ['Blaming gateway when only DNS fails', 'Ignoring duplicate IP or wrong subnet mask'],
  topoNodes: [{ id: 'pc', label: 'PC-CORP-01', type: 'pc', x: 30, y: 55 }, { id: 'gw', label: 'GW 192.168.10.1', type: 'router', x: 55, y: 40 }, { id: 'dns', label: 'DNS', type: 'server', x: 75, y: 55 }],
  topoLinks: [{ id: 'l1', source: 'pc', target: 'gw', status: 'forwarding' }, { id: 'l2', source: 'pc', target: 'dns', label: 'broken', status: 'blocked' }],
  diagNodes: [{ id: 'ip', label: 'Ping IP OK', type: 'process', x: 35, y: 70, status: 'highlighted' }, { id: 'name', label: 'Ping name FAIL', type: 'process', x: 65, y: 70, status: 'error' }],
  diagLinks: [{ id: 'd1', source: 'ip', target: 'name', label: 'DNS issue', status: 'forwarded' }],
  flowSteps: [{ id: 's1', order: 1, title: 'Verify params', action: 'ipconfig confirms IP, mask, gateway, DNS', successState: 'noted' }, { id: 's2', order: 2, title: 'Isolate', action: 'IP ping OK + name ping fail = DNS not gateway', successState: 'noted' }],
})

const CLI_D11_111 = {
  'show dot11 associations all-client': `802.11 Client Associations (AP-FLOOR2)
SSID          Band   Channel  RSSI   Width
CORP_WIFI     5 GHz  36       -58    80 MHz
CORP_WIFI     2.4GHz 6        -72    20 MHz

2.4 GHz: 3 non-overlapping channels (1, 6, 11) — longer range, more interference.
5 GHz: many channels, shorter range, higher throughput (802.11ac/ax).`,
  'show controllers dot11Radio 0': `Radio 0 (2.4 GHz): Channel 6, 20 MHz width, TX power 17 dBm
Radio 1 (5 GHz):   Channel 36, 80 MHz width, TX power 20 dBm

802.11 standards: n (Wi-Fi 4), ac (Wi-Fi 5), ax (Wi-Fi 6) — increasing speed/OFDMA.`,
}

const LAB_D11_111 = mkInterpretGuided({
  id: 'LAB-D11-111', title: 'Interpret Wireless RF Principles from AP Output', domainId: 'fundamentals', objectiveId: '1.11',
  ckuIds: ['CKU-WIFI-BANDS', 'CKU-80211-STANDARDS', 'CKU-WIFI-CHANNELS', 'CKU-WPA'],
  chapter: '1.11 Wireless principles', minutes: 10, cliShowOutput: CLI_D11_111,
  scenario: 'AP-FLOOR2 serves dual-band CORP_WIFI. Read show output to compare 2.4 vs 5 GHz bands, non-overlapping channels, channel width, RSSI signal strength, and 802.11 standards progression.',
  goals: ['Contrast 2.4 GHz vs 5 GHz trade-offs', 'Identify channels 1/6/11 on 2.4 GHz', 'Read RSSI and channel width impact'],
  tasks: [
    { id: 't1', order: 1, title: 'Client associations', device: 'AP1', instruction: 'Run show dot11 associations all-client — note band, channel, RSSI per client.', expectedCommands: ['enable', 'show dot11 associations all-client'] },
    { id: 't2', order: 2, title: 'Radio settings', device: 'AP1', instruction: 'Run show controllers dot11Radio 0 — compare 2.4 vs 5 GHz channel and width.', expectedCommands: ['show controllers dot11Radio 0'] },
  ],
  required: [{ device: 'AP1', command: 'show dot11 associations all-client' }, { device: 'AP1', command: 'show controllers dot11Radio 0' }],
  verify: ['show dot11 associations all-client', 'show controllers dot11Radio 0'],
  verifyCmd: 'show dot11 associations all-client', verifyExpect: '5 GHz',
  verificationChecks: [{ id: 'v1', device: 'AP1', command: 'show dot11 associations all-client', expectedResult: 'Dual-band with RSSI and channel width', passCondition: 'RF principles' }],
  success: ['2.4 GHz channels 1/6/11 noted', '5 GHz higher throughput with wider channels', 'RSSI measures signal strength'],
  mistakes: ['Overlapping 2.4 GHz channels causing co-channel interference', 'Expecting WEP as acceptable encryption'],
  topoNodes: [{ id: 'ap', label: 'AP dual-band', type: 'switch', x: 50, y: 40 }, { id: 'c24', label: '2.4 GHz ch6', type: 'pc', x: 30, y: 70 }, { id: 'c5', label: '5 GHz ch36', type: 'pc', x: 70, y: 70 }],
  topoLinks: [{ id: 'l1', source: 'ap', target: 'c24', status: 'forwarding' }, { id: 'l2', source: 'ap', target: 'c5', status: 'forwarding' }],
  diagNodes: [{ id: 'b24', label: '2.4 GHz range', type: 'process', x: 30, y: 55 }, { id: 'b5', label: '5 GHz speed', type: 'process', x: 70, y: 55, status: 'highlighted' }],
  diagLinks: [{ id: 'd1', source: 'b24', target: 'b5', label: 'dual-band', status: 'forwarding' }],
  flowSteps: [{ id: 's1', order: 1, title: 'Bands', action: '2.4 = range; 5 = speed and more channels', successState: 'noted' }],
})

const CLI_D11_112 = {
  'show vrf': `Name                             Default RD            Interfaces
  CORP                             65001:1               Gi0/0, Gi0/1
  GUEST                            65001:2               Gi0/2

VRF = virtual routing table — multiple isolated routing instances on one router.`,
  'show virtual-service list': `Virtual Service Name          Status    Package Name
  iosxe-k9_16.12.4              Running   UCS-KVM-IOSXE

Type 1 hypervisor (bare metal ESXi) runs VMs directly on hardware.
Containers share the host OS kernel — lighter than full VMs.`,
  'show platform software virtual-service': `NFV instance: vEdge-router-01 (virtual router function)
Replaces dedicated hardware appliance with software on x86 server.`,
}

const LAB_D11_112 = mkInterpretGuided({
  id: 'LAB-D11-112', title: 'Explain Virtualization Fundamentals from Platform Output', domainId: 'fundamentals', objectiveId: '1.12',
  ckuIds: ['CKU-HYPERVISOR', 'CKU-CONTAINERS', 'CKU-VRF', 'CKU-NFV'],
  chapter: '1.12 Virtualization fundamentals', minutes: 10, cliShowOutput: CLI_D11_112,
  scenario: 'A platform runs VRFs for tenant isolation, a virtual IOS-XE service, and NFV router functions. Read show output to contrast VMs (Type 1/2 hypervisor), containers, VRF-lite, and NFV.',
  goals: ['Explain VRF as logical router isolation', 'Contrast VM hypervisor vs containers', 'Describe NFV replacing hardware appliances'],
  tasks: [
    { id: 't1', order: 1, title: 'VRF instances', device: 'R1', instruction: 'Run show vrf — separate routing tables for CORP and GUEST tenants.', expectedCommands: ['enable', 'show vrf'] },
    { id: 't2', order: 2, title: 'Virtual service', device: 'R1', instruction: 'Run show virtual-service list — VM-based network service on hypervisor.', expectedCommands: ['show virtual-service list'] },
    { id: 't3', order: 3, title: 'NFV', device: 'R1', instruction: 'Run show platform software virtual-service — software router replaces dedicated appliance.', expectedCommands: ['show platform software virtual-service'] },
  ],
  required: [{ device: 'R1', command: 'show vrf' }, { device: 'R1', command: 'show virtual-service list' }, { device: 'R1', command: 'show platform software virtual-service' }],
  verify: ['show vrf', 'show virtual-service list', 'show platform software virtual-service'],
  verifyCmd: 'show vrf', verifyExpect: 'CORP',
  verificationChecks: [{ id: 'v1', device: 'R1', command: 'show vrf', expectedResult: 'Separate VRF routing tables', passCondition: 'VRF isolation' }],
  success: ['VRF provides L3 isolation on one device', 'VMs via hypervisor vs lighter containers', 'NFV virtualizes network functions'],
  mistakes: ['Confusing VRF with VLAN — VRF is L3 routing isolation', 'Treating containers as full VMs with separate kernels'],
  topoNodes: [{ id: 'r1', label: 'R1 VRF/NFV', type: 'router', x: 50, y: 40 }, { id: 'vm', label: 'Virtual IOS-XE', type: 'server', x: 30, y: 70 }, { id: 'ctr', label: 'Container app', type: 'process', x: 70, y: 70 }],
  topoLinks: [{ id: 'l1', source: 'r1', target: 'vm', status: 'forwarding' }],
  diagNodes: [{ id: 'vrf', label: 'VRF-lite', type: 'process', x: 35, y: 55, status: 'highlighted' }, { id: 'nfv', label: 'NFV vRouter', type: 'process', x: 65, y: 55 }],
  diagLinks: [{ id: 'd1', source: 'vrf', target: 'nfv', status: 'forwarded' }],
  flowSteps: [{ id: 's1', order: 1, title: 'Virtualize', action: 'VRF, VMs, containers, NFV reduce hardware sprawl', successState: 'noted' }],
})

const LAB_D22_22 = mkGuided({
  id: 'LAB-D22-22', title: 'Configure 802.1Q Trunk Between Switches', domainId: 'access', objectiveId: '2.2',
  ckuIds: ['CKU-TRUNKING', 'CKU-NATIVE-VLAN', 'CKU-DTP'],
  chapter: '2.2 Interswitch trunking', minutes: 14,
  scenario: 'SW1 and SW2 connect via Gi0/1. VLANs 10 and 20 must cross the link. Configure SW1 Gi0/1 as an 802.1Q trunk with native VLAN 99, allow VLANs 10 and 20 only, and disable DTP with switchport nonegotiate.',
  goals: ['switchport mode trunk', 'Set native VLAN 99', 'Prune allowed VLANs and disable DTP'],
  tasks: [
    { id: 't1', order: 1, title: 'Trunk mode', device: 'SW1', instruction: 'Configure Gi0/1 as 802.1Q trunk.', expectedCommands: ['interface gi0/1', 'switchport mode trunk'] },
    { id: 't2', order: 2, title: 'Native VLAN', device: 'SW1', instruction: 'Set native VLAN 99 (must match SW2).', expectedCommands: ['switchport trunk native vlan 99'] },
    { id: 't3', order: 3, title: 'Allowed VLANs', device: 'SW1', instruction: 'Allow only VLANs 10 and 20 on the trunk.', expectedCommands: ['switchport trunk allowed vlan 10,20'] },
    { id: 't4', order: 4, title: 'Disable DTP', device: 'SW1', instruction: 'Disable DTP auto-negotiation for security.', expectedCommands: ['switchport nonegotiate'] },
    { id: 't5', order: 5, title: 'Verify', device: 'SW1', instruction: 'Confirm trunk mode, native VLAN, and allowed list.', expectedCommands: ['show interfaces trunk'] },
  ],
  required: [
    { device: 'SW1', command: 'switchport mode trunk' },
    { device: 'SW1', command: 'switchport trunk native vlan 99' },
    { device: 'SW1', command: 'switchport trunk allowed vlan 10,20' },
    { device: 'SW1', command: 'switchport nonegotiate' },
  ],
  verify: ['show interfaces trunk', 'show interfaces gi0/1 switchport'],
  verifyCmd: 'show interfaces trunk', verifyExpect: 'trunking',
  success: ['Trunk carries VLANs 10 and 20', 'Native VLAN 99 matches both ends', 'DTP disabled'],
  mistakes: ['Native VLAN mismatch between switches', 'Leaving native VLAN as 1 (security risk)'],
  topoNodes: [{ id: 'sw1', label: 'SW1', type: 'switch', x: 35, y: 50 }, { id: 'sw2', label: 'SW2', type: 'switch', x: 65, y: 50 }],
  topoLinks: [{ id: 'l1', source: 'sw1', target: 'sw2', label: '802.1Q trunk', status: 'forwarding' }],
  diagNodes: [{ id: 'tag', label: '802.1Q tag', type: 'process', x: 50, y: 45, status: 'highlighted' }, { id: 'nv', label: 'Native VLAN 99 untagged', type: 'process', x: 50, y: 65 }],
  diagLinks: [{ id: 'd1', source: 'tag', target: 'nv', status: 'forwarded' }],
  flowSteps: [{ id: 's1', order: 1, title: 'Tag', action: '802.1Q inserts 4-byte VLAN ID on tagged VLANs', successState: 'matched' }, { id: 's2', order: 2, title: 'Native', action: 'Native VLAN 99 crosses untagged', successState: 'forwarded' }],
})

const CLI_D27_27 = {
  'show ap summary': `AP Name          Model       Ethernet IF   PoE Status   CAPWAP State
AP-F1-01         AIR-CAP2702I Gi0           Full (802.3at)  Registered
AP-F1-02         AIR-CAP2702I Gi0           Full (802.3at)  Registered

Physical: AP connects to access switch via Ethernet (PoE powers AP).
Control: AP builds CAPWAP tunnel to WLC over wired network.`,
  'show capwap client': `CAPWAP Client Status: RUN
  Primary WLC: 192.168.100.10 (WLC-HQ)
  Data tunnel: 192.168.100.11
  Control tunnel: 192.168.100.10

Antenna: omnidirectional for general coverage; directional for point-to-point.`,
  'show ap config general AP-F1-01': `AP Mode: Local (default — serves clients)
Ethernet Port: Gi0 trunk to SW-ACCESS (VLAN 100 AP-mgmt, VLAN 20 user)
PoE: IEEE 802.3at (25.5W) from switch`,
}

const LAB_D27_27 = mkInterpretGuided({
  id: 'LAB-D27-27', title: 'Interpret WLAN Physical Infrastructure Connections', domainId: 'access', objectiveId: '2.7',
  ckuIds: ['CKU-WLAN-PHYS'],
  chapter: '2.7 WLAN physical infrastructure', minutes: 10, cliShowOutput: CLI_D27_27,
  scenario: 'Lightweight APs connect to access switches via PoE Ethernet and register to WLC-HQ via CAPWAP. Read show output to trace physical cabling, PoE power, CAPWAP control/data tunnels, and antenna types.',
  goals: ['Map AP Ethernet + PoE to access switch', 'Explain CAPWAP tunnels to WLC', 'Contrast omnidirectional vs directional antennas'],
  tasks: [
    { id: 't1', order: 1, title: 'AP physical summary', device: 'WLC1', instruction: 'Run show ap summary — AP Ethernet port and PoE status from switch.', expectedCommands: ['enable', 'show ap summary'] },
    { id: 't2', order: 2, title: 'CAPWAP tunnels', device: 'AP1', instruction: 'Run show capwap client — control and data tunnels to WLC.', expectedCommands: ['show capwap client'] },
    { id: 't3', order: 3, title: 'AP port config', device: 'WLC1', instruction: 'Run show ap config general — trunk VLANs and PoE class.', expectedCommands: ['show ap config general AP-F1-01'] },
  ],
  required: [{ device: 'WLC1', command: 'show ap summary' }, { device: 'AP1', command: 'show capwap client' }, { device: 'WLC1', command: 'show ap config general AP-F1-01' }],
  verify: ['show ap summary', 'show capwap client', 'show ap config general AP-F1-01'],
  verifyCmd: 'show ap summary', verifyExpect: 'CAPWAP',
  verificationChecks: [{ id: 'v1', device: 'AP1', command: 'show capwap client', expectedResult: 'CAPWAP RUN to WLC', passCondition: 'WLAN physical path' }],
  success: ['AP powered via PoE from switch', 'CAPWAP control/data tunnels to WLC', 'Antenna type affects coverage pattern'],
  mistakes: ['Expecting AP to route like a router', 'Confusing CAPWAP with client Wi-Fi association'],
  topoNodes: [{ id: 'ap', label: 'Lightweight AP', type: 'switch', x: 30, y: 55 }, { id: 'sw', label: 'PoE switch', type: 'switch', x: 50, y: 40 }, { id: 'wlc', label: 'WLC-HQ', type: 'server', x: 75, y: 40 }],
  topoLinks: [{ id: 'l1', source: 'ap', target: 'sw', label: 'PoE Eth', status: 'forwarding' }, { id: 'l2', source: 'sw', target: 'wlc', label: 'CAPWAP', status: 'forwarding' }],
  diagNodes: [{ id: 'poe', label: 'PoE power', type: 'process', x: 35, y: 70 }, { id: 'cap', label: 'CAPWAP tunnel', type: 'process', x: 65, y: 70, status: 'highlighted' }],
  diagLinks: [{ id: 'd1', source: 'poe', target: 'cap', status: 'forwarded' }],
  flowSteps: [{ id: 's1', order: 1, title: 'Physical', action: 'AP connects via Ethernet trunk; switch provides PoE', successState: 'noted' }, { id: 's2', order: 2, title: 'Control', action: 'CAPWAP tunnels AP management to WLC', successState: 'noted' }],
})

const CLI_D47_47 = {
  'show policy-map interface gi0/0': `GigabitEthernet0/0

  Service-policy output: WAN-EDGE-QOS

    Class-map: VOICE (match dscp ef)
      priority percent 10
      Per-Hop Behavior: LLQ (Low Latency Queuing) — voice dequeued first

    Class-map: VIDEO (match dscp af41)
      bandwidth percent 30
      Per-Hop Behavior: CBWFQ — guaranteed bandwidth share

    Class-map: class-default
      fair-queue
      Per-Hop Behavior: WRED — drop probability rises as queue fills`,
  'show queueing interface gi0/0': `Queueing strategy: Class-based queueing
  DSCP trust: enabled on Gi0/0 (honor inbound markings at trust boundary)`,
}

const LAB_D47_47 = mkInterpretGuided({
  id: 'LAB-D47-47', title: 'Interpret QoS Per-Hop Behavior and Queuing', domainId: 'services', objectiveId: '4.7',
  ckuIds: ['CKU-QOS-PHB'],
  chapter: '4.7 QoS per-hop behavior', minutes: 10, cliShowOutput: CLI_D47_47,
  scenario: 'R1 WAN edge applies WAN-EDGE-QOS: voice gets LLQ priority, video gets CBWFQ bandwidth guarantee, default class uses WRED. Read show output to explain classification, marking (DSCP EF/AF41), and per-hop queuing behaviors.',
  goals: ['Explain LLQ for latency-sensitive voice', 'Describe CBWFQ bandwidth allocation', 'Relate WRED to congestion avoidance'],
  tasks: [
    { id: 't1', order: 1, title: 'Policy map', device: 'R1', instruction: 'Run show policy-map interface gi0/0 — identify LLQ, CBWFQ, WRED per class.', expectedCommands: ['enable', 'show policy-map interface gi0/0'] },
    { id: 't2', order: 2, title: 'Trust boundary', device: 'R1', instruction: 'Run show queueing interface gi0/0 — DSCP trust at WAN edge.', expectedCommands: ['show queueing interface gi0/0'] },
  ],
  required: [{ device: 'R1', command: 'show policy-map interface gi0/0' }, { device: 'R1', command: 'show queueing interface gi0/0' }],
  verify: ['show policy-map interface gi0/0', 'show queueing interface gi0/0'],
  verifyCmd: 'show policy-map interface gi0/0', verifyExpect: 'LLQ',
  verificationChecks: [{ id: 'v1', device: 'R1', command: 'show policy-map interface gi0/0', expectedResult: 'Voice LLQ + video CBWFQ + default WRED', passCondition: 'QoS PHB' }],
  success: ['Voice uses LLQ priority queue', 'Video gets guaranteed CBWFQ bandwidth', 'WRED drops proactively under congestion'],
  mistakes: ['Policing vs shaping confusion — shaping buffers, policing drops', 'Not marking traffic before trust boundary'],
  topoNodes: [{ id: 'r1', label: 'R1 WAN edge', type: 'router', x: 50, y: 40 }, { id: 'voice', label: 'Voice EF', type: 'pc', x: 25, y: 70 }, { id: 'data', label: 'Best-effort', type: 'pc', x: 75, y: 70 }],
  topoLinks: [{ id: 'l1', source: 'voice', target: 'r1', status: 'forwarding' }, { id: 'l2', source: 'data', target: 'r1', status: 'forwarding' }],
  diagNodes: [{ id: 'llq', label: 'LLQ voice', type: 'process', x: 30, y: 55, status: 'highlighted' }, { id: 'wred', label: 'WRED default', type: 'process', x: 70, y: 55 }],
  diagLinks: [{ id: 'd1', source: 'llq', target: 'wred', label: 'PHB', status: 'forwarding' }],
  flowSteps: [{ id: 's1', order: 1, title: 'Classify', action: 'Match DSCP EF for voice, AF41 for video', successState: 'noted' }, { id: 's2', order: 2, title: 'Queue', action: 'LLQ strict priority; CBWFQ bandwidth; WRED on default', successState: 'noted' }],
})

const LAB_D49_49 = mkGuided({
  id: 'LAB-D49-49', title: 'Backup IOS Image via TFTP', domainId: 'services', objectiveId: '4.9',
  ckuIds: ['CKU-TFTP-FTP'],
  chapter: '4.9 TFTP and FTP', minutes: 12,
  scenario: 'R1 needs a backup IOS image copied from TFTP server 192.168.1.100. TFTP uses UDP/69 (simple, no auth). Use copy tftp flash to download c2960-lanbasek9-mz.bin and verify with show flash.',
  goals: ['copy tftp flash for IOS backup', 'Know TFTP UDP/69 vs FTP TCP/20-21', 'Verify file on flash'],
  tasks: [
    { id: 't1', order: 1, title: 'Test reachability', device: 'R1', instruction: 'Ping TFTP server 192.168.1.100 before copy.', expectedCommands: ['ping 192.168.1.100'] },
    { id: 't2', order: 2, title: 'Copy from TFTP', device: 'R1', instruction: 'Copy IOS image from TFTP server to flash.', expectedCommands: ['copy tftp flash'] },
    { id: 't3', order: 3, title: 'Verify flash', device: 'R1', instruction: 'Confirm image file exists on flash.', expectedCommands: ['show flash:', 'dir flash:'] },
  ],
  required: [{ device: 'R1', command: 'copy tftp flash' }, { device: 'R1', command: 'show flash:' }],
  verify: ['show flash:', 'dir flash:'],
  verifyCmd: 'show flash:', verifyExpect: 'c2960',
  success: ['IOS image copied via TFTP UDP/69', 'File visible on flash', 'FTP noted as TCP/20-21 with optional auth'],
  mistakes: ['Using TFTP over WAN without reliability considerations', 'Expecting TFTP encryption — use SFTP/SCP for secure transfer'],
  topoNodes: [{ id: 'r1', label: 'R1', type: 'router', x: 35, y: 50 }, { id: 'tftp', label: 'TFTP :69', type: 'server', x: 70, y: 50 }],
  topoLinks: [{ id: 'l1', source: 'r1', target: 'tftp', label: 'UDP/69', status: 'forwarding' }],
  diagNodes: [{ id: 'tftp', label: 'TFTP simple', type: 'process', x: 35, y: 65 }, { id: 'ftp', label: 'FTP TCP 20/21', type: 'process', x: 65, y: 65 }],
  diagLinks: [{ id: 'd1', source: 'tftp', target: 'ftp', label: 'vs auth', status: 'forwarding' }],
  flowSteps: [{ id: 's1', order: 1, title: 'TFTP', action: 'UDP/69 simple file transfer for IOS/config backup', successState: 'matched' }],
})

const CLI_D410_410 = {
  'show license summary': `Local management: CLI on console/SSH, SNMP polling, on-prem NMS at 192.168.1.50
Smart License: CSL enabled — registration via HTTPS to Cisco cloud (optional).`,
  'show meraki dashboard status': `Cloud-managed (Meraki): Device reports to dashboard.meraki.com
  Status: Connected (last check-in 30 sec ago)
  Management: Zero-touch provisioning, centralized firmware, multi-site visibility

Local vs cloud:
  Local = direct CLI/SSH, on-prem controllers, full control offline
  Cloud = dashboard API, simplified ops, requires Internet + provider trust`,
}

const LAB_D410_410 = mkInterpretGuided({
  id: 'LAB-D410-410', title: 'Compare Local and Cloud Device Management', domainId: 'services', objectiveId: '4.10',
  ckuIds: ['CKU-MGMT-CLOUD'],
  chapter: '4.10 Local vs cloud management', minutes: 10, cliShowOutput: CLI_D410_410,
  scenario: 'Some devices use local CLI/SNMP management; others report to Meraki cloud dashboard. Read show output to contrast on-prem control (SSH, DNA Center) with cloud-managed simplicity and trade-offs.',
  goals: ['Contrast local CLI vs cloud dashboard', 'Identify cloud dependency on Internet', 'Recognize DNA Center and Meraki as management platforms'],
  tasks: [
    { id: 't1', order: 1, title: 'Local management', device: 'R1', instruction: 'Run show license summary — local CLI/SNMP and optional Smart Licensing cloud.', expectedCommands: ['enable', 'show license summary'] },
    { id: 't2', order: 2, title: 'Cloud dashboard', device: 'SW1', instruction: 'Run show meraki dashboard status — cloud-managed device check-in.', expectedCommands: ['show meraki dashboard status'] },
  ],
  required: [{ device: 'R1', command: 'show license summary' }, { device: 'SW1', command: 'show meraki dashboard status' }],
  verify: ['show license summary', 'show meraki dashboard status'],
  verifyCmd: 'show meraki dashboard status', verifyExpect: 'Connected',
  verificationChecks: [{ id: 'v1', device: 'SW1', command: 'show meraki dashboard status', expectedResult: 'Cloud dashboard connected', passCondition: 'cloud management' }],
  success: ['Local management works offline via CLI', 'Cloud simplifies multi-site ops', 'Cloud requires Internet and provider trust'],
  mistakes: ['Assuming cloud replaces all local CLI access', 'Ignoring data sovereignty with cloud management'],
  topoNodes: [{ id: 'local', label: 'On-prem CLI', type: 'router', x: 30, y: 50 }, { id: 'cloud', label: 'Cloud dashboard', type: 'cloud', x: 70, y: 50 }],
  topoLinks: [{ id: 'l1', source: 'local', target: 'cloud', label: 'hybrid', status: 'forwarding' }],
  diagNodes: [{ id: 'cli', label: 'SSH/CLI local', type: 'process', x: 35, y: 65, status: 'highlighted' }, { id: 'dash', label: 'Meraki/DNA cloud', type: 'process', x: 65, y: 65 }],
  diagLinks: [{ id: 'd1', source: 'cli', target: 'dash', status: 'forwarded' }],
  flowSteps: [{ id: 's1', order: 1, title: 'Local', action: 'Direct device CLI and on-prem NMS', successState: 'noted' }, { id: 's2', order: 2, title: 'Cloud', action: 'Centralized dashboard for fleet management', successState: 'noted' }],
})

const CLI_D51_51 = {
  'show logging | include SEC': `[SEC-6-IPACCESSLOGP: list PERMIT denied 10.1.1.50 -> 10.2.2.10]
Threat: reconnaissance scan blocked by ACL (confidentiality/integrity protection).`,
  'show ip ips statistics': `IPS Signature Hits:
  41200: TCP SYN Flood — 847 hits (DoS threat — availability impact)
  61503: Malware C2 beacon — 3 hits (confidentiality breach attempt)

CIA mapping:
  Confidentiality = encryption + access control (ACL deny)
  Integrity = hashing detects unauthorized changes
  Availability = DDoS mitigation, redundancy`,
}

const LAB_D51_51 = mkInterpretGuided({
  id: 'LAB-D51-51', title: 'Map Security Events to CIA Triad and Threat Types', domainId: 'security', objectiveId: '5.1',
  ckuIds: ['CKU-CIA-TRIAD', 'CKU-VULN-THREAT-EXPLOIT', 'CKU-COMMON-THREATS', 'CKU-MITIGATION-TECHNIQUES'],
  chapter: '5.1 Key security concepts', minutes: 10, cliShowOutput: CLI_D51_51,
  scenario: 'Security logs show ACL blocks, SYN flood IPS hits, and malware C2 signatures. Read output to map events to CIA triad elements, distinguish vulnerability/threat/exploit, and identify mitigation (defense in depth).',
  goals: ['Map ACL block to confidentiality', 'Map SYN flood to availability', 'Distinguish vulnerability vs threat vs exploit'],
  tasks: [
    { id: 't1', order: 1, title: 'ACL security log', device: 'R1', instruction: 'Run show logging — ACL deny protects confidentiality by blocking unauthorized access.', expectedCommands: ['enable', 'show logging | include SEC'] },
    { id: 't2', order: 2, title: 'IPS statistics', device: 'R1', instruction: 'Run show ip ips statistics — SYN flood (availability), malware C2 (confidentiality).', expectedCommands: ['show ip ips statistics'] },
  ],
  required: [{ device: 'R1', command: 'show logging | include SEC' }, { device: 'R1', command: 'show ip ips statistics' }],
  verify: ['show logging | include SEC', 'show ip ips statistics'],
  verifyCmd: 'show ip ips statistics', verifyExpect: 'SYN Flood',
  verificationChecks: [{ id: 'v1', device: 'R1', command: 'show ip ips statistics', expectedResult: 'DoS hits availability; malware hits confidentiality', passCondition: 'CIA mapping' }],
  success: ['CIA triad applied to log events', 'Vulnerability/threat/exploit distinguished', 'Defense in depth with ACL + IPS noted'],
  mistakes: ['Confusing integrity with confidentiality', 'Treating vulnerability alone as an active breach'],
  topoNodes: [{ id: 'att', label: 'Attacker', type: 'pc', x: 20, y: 55 }, { id: 'fw', label: 'R1 ACL/IPS', type: 'router', x: 50, y: 45 }, { id: 'srv', label: 'Server', type: 'server', x: 80, y: 55 }],
  topoLinks: [{ id: 'l1', source: 'att', target: 'fw', status: 'blocked' }, { id: 'l2', source: 'fw', target: 'srv', status: 'forwarding' }],
  diagNodes: [{ id: 'c', label: 'Confidentiality', type: 'process', x: 25, y: 70 }, { id: 'a', label: 'Availability', type: 'process', x: 50, y: 70, status: 'highlighted' }, { id: 'i', label: 'Integrity', type: 'process', x: 75, y: 70 }],
  diagLinks: [{ id: 'd1', source: 'c', target: 'a', label: 'CIA', status: 'forwarding' }],
  flowSteps: [{ id: 's1', order: 1, title: 'CIA', action: 'Map each threat to confidentiality, integrity, or availability', successState: 'noted' }],
})

const CLI_D52_52 = {
  'show policy-map type control subscriber': `Security program elements (beyond technology):
  1. User awareness training — phishing simulations, annual security education
  2. Physical access control — badge readers, server room locks, CCTV
  3. Incident response plan — detect, contain, eradicate, recover, lessons learned
  4. Risk assessment — identify assets, threats, vulnerabilities; prioritize remediation
  5. Acceptable use policy — define permitted user behavior on corporate systems`,
  'show run | include banner': `banner motd ^C
Authorized access only. Violators prosecuted. Report suspicious activity to security@corp.com.
^C
Policy communication supports user awareness program element.`,
}

const LAB_D52_52 = mkInterpretGuided({
  id: 'LAB-D52-52', title: 'Interpret Security Program Elements on a Device', domainId: 'security', objectiveId: '5.2',
  ckuIds: ['CKU-SECURITY-PROGRAM'],
  chapter: '5.2 Security program elements', minutes: 10, cliShowOutput: CLI_D52_52,
  scenario: 'Security is not only firewalls — programs include user training, physical access, incident response, and risk assessment. Read static policy output and login banner to identify non-technical program elements.',
  goals: ['List security program elements beyond technology', 'Relate login banner to user awareness', 'Explain incident response and risk assessment roles'],
  tasks: [
    { id: 't1', order: 1, title: 'Program elements', device: 'R1', instruction: 'Review security program checklist — training, physical access, IR, risk assessment, AUP.', expectedCommands: ['enable', 'show policy-map type control subscriber'] },
    { id: 't2', order: 2, title: 'User awareness banner', device: 'R1', instruction: 'Run show run | include banner — MOTD communicates acceptable use policy.', expectedCommands: ['show run | include banner'] },
  ],
  required: [{ device: 'R1', command: 'show policy-map type control subscriber' }, { device: 'R1', command: 'show run | include banner' }],
  verify: ['show policy-map type control subscriber', 'show run | include banner'],
  verifyCmd: 'show run | include banner', verifyExpect: 'banner motd',
  verificationChecks: [{ id: 'v1', device: 'R1', command: 'show policy-map type control subscriber', expectedResult: 'Training, physical, IR, risk assessment listed', passCondition: 'security program' }],
  success: ['User awareness training identified', 'Physical access control noted', 'Incident response and risk assessment understood'],
  mistakes: ['Assuming technology alone satisfies security program', 'Skipping physical security in layered defense'],
  topoNodes: [{ id: 'train', label: 'User training', type: 'pc', x: 25, y: 55 }, { id: 'phys', label: 'Badge access', type: 'process', x: 50, y: 55 }, { id: 'ir', label: 'Incident response', type: 'server', x: 75, y: 55 }],
  topoLinks: [{ id: 'l1', source: 'train', target: 'phys', status: 'forwarding' }],
  diagNodes: [
    { id: 'prog', label: 'Security program', type: 'process', x: 50, y: 30, status: 'highlighted' },
    { id: 'train', label: 'User training', type: 'pc', x: 25, y: 60 },
    { id: 'phys', label: 'Physical access', type: 'process', x: 50, y: 60 },
    { id: 'ir', label: 'Incident response', type: 'server', x: 75, y: 60 },
  ],
  diagLinks: [
    { id: 'd1', source: 'prog', target: 'train', status: 'forwarded' },
    { id: 'd2', source: 'train', target: 'phys', status: 'forwarded' },
    { id: 'd3', source: 'phys', target: 'ir', status: 'forwarded' },
  ],
  flowSteps: [{ id: 's1', order: 1, title: 'Program', action: 'People, process, and technology together form defense in depth', successState: 'noted' }],
})

const CLI_D57_57 = {
  'show aaa servers': `RADIUS server group ISE-GROUP:
  Server 1: 192.168.100.10:1812 auth, 1813 acct — UP
  Server 2: 192.168.100.11:1812 auth — UP

TACACS+ server group ACS-GROUP:
  Server 1: 192.168.100.20:49 — UP (admin AAA)

AAA framework:
  Authentication — WHO are you? (username/password, MFA)
  Authorization — WHAT may you do? (privilege level, command set)
  Accounting — WHAT did you do? (audit logs, session records)`,
  'show aaa user all': `User: netadmin
  Auth: TACACS+ (ACS-GROUP) — authenticated
  Author: priv 15 — full command authorization
  Acct: session logged — start/stop records sent to TACACS+`,
}

const LAB_D57_57 = mkInterpretGuided({
  id: 'LAB-D57-57', title: 'Compare AAA Authentication, Authorization, and Accounting', domainId: 'security', objectiveId: '5.7',
  ckuIds: ['CKU-AAA-CONCEPTS'],
  chapter: '5.7 AAA concepts', minutes: 10, cliShowOutput: CLI_D57_57,
  scenario: 'Network devices use RADIUS (ISE) for user network access and TACACS+ (ACS) for device admin AAA. Read show aaa output to distinguish authentication, authorization, and accounting — and map RADIUS vs TACACS+ roles.',
  goals: ['Define authentication vs authorization vs accounting', 'Map RADIUS to network access', 'Map TACACS+ to device admin AAA'],
  tasks: [
    { id: 't1', order: 1, title: 'AAA servers', device: 'R1', instruction: 'Run show aaa servers — RADIUS for user auth; TACACS+ for admin AAA.', expectedCommands: ['enable', 'show aaa servers'] },
    { id: 't2', order: 2, title: 'User AAA session', device: 'R1', instruction: 'Run show aaa user all — auth, author priv 15, acct logging for netadmin.', expectedCommands: ['show aaa user all'] },
  ],
  required: [{ device: 'R1', command: 'show aaa servers' }, { device: 'R1', command: 'show aaa user all' }],
  verify: ['show aaa servers', 'show aaa user all'],
  verifyCmd: 'show aaa servers', verifyExpect: 'RADIUS',
  verificationChecks: [
    { id: 'v1', device: 'R1', command: 'show aaa user all', expectedResult: 'Auth + author priv 15 + acct session log', passCondition: 'AAA three A\'s' },
  ],
  success: ['Authentication verifies identity', 'Authorization grants privilege level', 'Accounting logs session for audit'],
  mistakes: ['Using RADIUS for granular command authorization (TACACS+ job)', 'Confusing authorization with authentication'],
  topoNodes: [{ id: 'r1', label: 'R1', type: 'router', x: 40, y: 45 }, { id: 'rad', label: 'RADIUS ISE', type: 'server', x: 70, y: 30 }, { id: 'tac', label: 'TACACS+ ACS', type: 'server', x: 70, y: 65 }],
  topoLinks: [{ id: 'l1', source: 'r1', target: 'rad', label: 'user access', status: 'forwarding' }, { id: 'l2', source: 'r1', target: 'tac', label: 'admin AAA', status: 'forwarding' }],
  diagNodes: [{ id: 'auth', label: 'Authentication', type: 'process', x: 25, y: 60 }, { id: 'authz', label: 'Authorization', type: 'process', x: 50, y: 60, status: 'highlighted' }, { id: 'acct', label: 'Accounting', type: 'process', x: 75, y: 60 }],
  diagLinks: [{ id: 'd1', source: 'auth', target: 'authz', status: 'forwarded' }, { id: 'd2', source: 'authz', target: 'acct', status: 'forwarded' }],
  flowSteps: [
    { id: 's1', order: 1, title: 'Authn', action: 'Verify identity — who is connecting?', successState: 'noted' },
    { id: 's2', order: 2, title: 'Authz', action: 'Grant permissions — what commands allowed?', successState: 'noted' },
    { id: 's3', order: 3, title: 'Acct', action: 'Log session — audit trail for compliance', successState: 'noted' },
  ],
})

export const PHASE_LAB_BUNDLES = [
  PORT_SECURITY, EXTENDED_ACL_BUILD, STATIC_NAT, INTERVLAN_SVI,
  STP_PORTFAST, IPV6_STATIC, OSPF_DEFAULT,
  WLAN_SSID, TS_WLAN,
  MAC_FORWARD_15, WLAN_SEC_58, WPA2_PSK_59, VPN_TYPES_510, SEGMENT_511,
  LLDP, SNMP, PAGP_EC, L3_EC,
  LAB_D11_11, LAB_D11_12, LAB_D11_13, LAB_D11_14, LAB_D11_17, LAB_D11_18, LAB_D11_19,
  LAB_D11_110, LAB_D11_111, LAB_D11_112,
  LAB_D22_22, LAB_D27_27, LAB_D47_47, LAB_D49_49, LAB_D410_410,
  LAB_D51_51, LAB_D52_52, LAB_D57_57,
]
