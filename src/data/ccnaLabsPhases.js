/* Phases 1–4 labs — port security, NAT, SVI, STP edge, IPv6, OSPF default, wireless, LLDP, SNMP, EtherChannel variants. */

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

function tsLab(id, title, objectiveId, domainId, scenario, tasks, requiredCommands, mistakes) {
  return {
    id, title, domainId, objectiveId, ckuIds: ['CKU-TROUBLESHOOTING'],
    labType: 'troubleshooting', difficulty: 'intermediate', estimatedTimeMinutes: 15,
    tools: ['Packet Tracer', 'GNS3'], examRelevance: 'core', scenario,
    learningGoals: ['Use show commands to isolate fault', 'Apply minimal fix commands'],
    topologyId: `TOPO-${id}`, prerequisites: [],
    tasks, verificationCommands: ['show running-config'],
    successCriteria: ['Symptom resolved after fix commands entered'],
    failureCriteria: ['Fix applied on wrong interface or VLAN'],
    commonMistakes: mistakes,
    source: { name: LAB_SOURCES.blueprint, chapter: 'Troubleshooting', confidence: 0.9 },
    metadata: { version: '1', status: 'validated', confidence: 0.9 },
  }
}

function tsBundle(lab, nodes, links, fixCmd) {
  const topo = { id: lab.topologyId, title: lab.title, objectiveId: lab.objectiveId, nodes, links }
  const validator = { labId: lab.id, requiredCommands: fixCmd, verificationChecks: [{ id: 'v1', device: fixCmd[0]?.device || 'R1', command: 'show running-config', expectedResult: 'Fix applied', passCondition: 'fixed' }] }
  const diagram = mkDiagram(`DIAG-${lab.id}`, lab.title, lab.objectiveId,
    [{ id: 'bad', label: 'Fault', type: 'process', x: 30, y: 50, status: 'error' }, { id: 'fix', label: 'Fixed', type: 'process', x: 70, y: 50, status: 'highlighted' }],
    [{ id: 'd1', source: 'bad', target: 'fix', status: 'forwarding' }])
  return { lab, topology: topo, validator, diagram, packetFlows: mkFlows(`FLOW-${lab.id}`, 'Fix fault', `DIAG-${lab.id}`, ['CKU-TROUBLESHOOTING'], [
    { id: 's1', order: 1, title: 'Symptom', action: scenarioShort(lab.scenario), successState: 'failed' },
    { id: 's2', order: 2, title: 'Fix', action: 'Correct configuration restores service', successState: 'forwarded' },
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

const LAB_TS_WLAN = tsLab('LAB-TS-WLAN-VLAN', 'Troubleshoot WLAN Wrong VLAN Mapping', '3.6', 'access',
  'Symptom: Wireless clients associate to CORP_WIFI but receive 192.168.10.x instead of 192.168.20.x. WLC dynamic interface for the WLAN points to VLAN10 — change interface mapping to VLAN20 (192.168.20.1/24).',
  [
    { id: 't1', order: 1, title: 'Check client subnet', device: 'WLC1', instruction: 'show client detail — client on wrong 192.168.10.x subnet.', expectedCommands: ['show client summary'] },
    { id: 't2', order: 2, title: 'Fix WLAN interface', device: 'WLC1', instruction: 'Map WLAN CORP_WIFI to VLAN20 interface.', expectedCommands: ['wlan CORP_WIFI', 'interface vlan 20'] },
    { id: 't3', order: 3, title: 'Verify', device: 'WLC1', instruction: 'Confirm new clients get 192.168.20.x.', expectedCommands: ['show wlan summary'] },
  ],
  [{ device: 'WLC1', command: 'interface vlan 20' }],
  ['Mapping SSID to management VLAN instead of user VLAN'])

const TS_WLAN = tsBundle(LAB_TS_WLAN,
  [{ id: 'wlc', label: 'WLC wrong VLAN', type: 'router', x: 50, y: 40, status: 'error' }, { id: 'cli', label: 'Client .10.x', type: 'pc', x: 50, y: 75 }],
  [{ id: 'l1', source: 'wlc', target: 'cli', status: 'blocked' }],
  [{ device: 'WLC1', command: 'interface vlan 20' }])

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

export const PHASE_LAB_BUNDLES = [
  PORT_SECURITY, EXTENDED_ACL_BUILD, STATIC_NAT, INTERVLAN_SVI,
  STP_PORTFAST, IPV6_STATIC, OSPF_DEFAULT,
  WLAN_SSID, TS_WLAN,
  MAC_FORWARD_15, WLAN_SEC_58, WPA2_PSK_59, VPN_TYPES_510, SEGMENT_511,
  LLDP, SNMP, PAGP_EC, L3_EC,
]
