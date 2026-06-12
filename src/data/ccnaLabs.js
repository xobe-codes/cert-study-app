/* =========================================================================
   CURATED CCNA LABS — static, source-grounded multi-device labs (Lab Engine
   v2). Phase 21 + Pilot B (Dynamic ARP Inspection with DHCP Snooping).

   Each lab carries a topology, an ordered task list, a deterministic validator
   (required commands + verification + failure checks), success/failure
   criteria, and common mistakes. No AI is used to run or check a lab — command
   checking is local string matching, exactly like the CLI Drill simulator.

   Content is original/paraphrased from the cited lab source (no verbatim
   copying). CLI command syntax is factual Cisco IOS.

   @typedef {{ id:string, label:string, type:string, x:number, y:number, ip?:string, note?:string }} LabNode
   ========================================================================= */

export const LAB_SOURCES = {
  workbook: 'CCNA in 60 Days — Lab Workbook (Browning)',
  blueprint: 'Cisco CCNA 200-301 v1.1 Exam Topics',
}

/* -------------------------------------------------------------------------
   LAB: Dynamic ARP Inspection with DHCP Snooping
   Maps to Domain 5.0 / Objective 5.6 (Layer 2 security features).
   ------------------------------------------------------------------------- */
const LAB_DAI = {
  id: 'LAB-DAI-DHCP-SNOOPING',
  title: 'Configure Dynamic ARP Inspection with DHCP Snooping',
  domainId: 'security',
  objectiveId: '5.6',
  ckuIds: ['CKU-DYNAMIC-ARP-INSPECTION', 'CKU-DHCP-SNOOPING', 'CKU-ARP', 'CKU-LAYER-2-SECURITY'],
  labType: 'guided',
  difficulty: 'advanced',
  estimatedTimeMinutes: 20,
  tools: ['Packet Tracer', 'GNS3', 'CML'],
  examRelevance: 'core',
  scenario: 'SW1 must protect the LAN from forged ARP traffic. You will enable DHCP Snooping first so the switch builds a trusted IP-to-MAC binding table, then turn on Dynamic ARP Inspection (DAI) so valid DHCP clients are allowed while an attacker using a static IP (no snooping binding) is blocked.',
  learningGoals: [
    'Explain why DAI depends on the DHCP Snooping binding table.',
    'Configure DHCP Snooping globally, per-VLAN, and trust the server-facing port.',
    'Enable DAI on a VLAN and trust the correct ports.',
    'Verify that a static-IP attacker with no binding is dropped.',
  ],
  topologyId: 'TOPO-DAI',
  prerequisites: ['CKU-ARP', 'CKU-DHCP'],

  tasks: [
    { id: 't1', order: 1, title: 'Hostname & router IP', device: 'R1', instruction: 'Set R1’s hostname and configure Gi0/0 with 192.168.10.254/24 (the gateway hosts will use).',
      expectedCommands: ['interface gi0/0', 'ip address 192.168.10.254 255.255.255.0', 'no shutdown'] },
    { id: 't2', order: 2, title: 'DHCP pool on R1', device: 'R1', instruction: 'Create a DHCP pool so valid clients receive an address (this is what populates the snooping binding table).',
      expectedCommands: ['ip dhcp pool mypool', 'network 192.168.10.0 255.255.255.0'] },
    { id: 't3', order: 3, title: 'Access ports on SW1', device: 'SW1', instruction: 'Set SW1 ports Gi0/0 (attacker), Gi0/1 (valid PC), and Gi0/2 (to R1) as access ports in VLAN 1.',
      expectedCommands: ['interface gi0/0', 'switchport mode access', 'interface gi0/1', 'interface gi0/2'] },
    { id: 't4', order: 4, title: 'Enable DHCP Snooping', device: 'SW1', instruction: 'Enable DHCP Snooping globally and on VLAN 1, then TRUST only the server-facing uplink Gi0/2.',
      expectedCommands: ['ip dhcp snooping', 'ip dhcp snooping vlan 1', 'interface gi0/2', 'ip dhcp snooping trust'] },
    { id: 't5', order: 5, title: 'Enable Dynamic ARP Inspection', device: 'SW1', instruction: 'Enable DAI on VLAN 1 and trust the uplink Gi0/2 (and the valid host port Gi0/1) so only the attacker port stays untrusted.',
      expectedCommands: ['ip arp inspection vlan 1', 'interface gi0/2', 'ip arp inspection trust', 'interface gi0/1', 'ip arp inspection trust'] },
    { id: 't6', order: 6, title: 'Attacker test', device: 'Attacker', instruction: 'Assign the attacker a STATIC 192.168.10.2/24 (no DHCP, so no snooping binding) and ping the gateway — it must fail.',
      expectedCommands: ['ping 192.168.10.254'] },
  ],

  verificationCommands: [
    'show ip dhcp binding',
    'show ip dhcp snooping binding',
    'show ip arp inspection',
    'show ip arp inspection interfaces',
    'show logging',
  ],
  successCriteria: [
    'The valid PC receives a DHCP address from R1.',
    'The valid PC can ping 192.168.10.254.',
    'SW1 shows a DHCP Snooping binding for the valid PC.',
    'DAI is active on VLAN 1.',
    'The attacker (static IP) cannot ping 192.168.10.254.',
    'SW1 logs invalid/denied ARP entries for the attacker port.',
  ],
  failureCriteria: [
    'DAI enabled before DHCP Snooping has a working binding table → valid hosts dropped too.',
    'DHCP Snooping not enabled on the VLAN → no bindings, everything fails DAI.',
    'Attacker-facing port trusted → forged ARP is allowed through.',
    'All ports trusted → DAI does nothing.',
  ],
  commonMistakes: [
    'Trusting the attacker-facing port (Gi0/0) — it must stay untrusted.',
    'Forgetting `ip dhcp snooping vlan 1`, so no bindings are built.',
    'Enabling DAI before DHCP Snooping is actually issuing leases.',
    'Expecting a static-IP host to pass DAI without a binding or an ARP ACL.',
    'Trusting every port, which disables the protection.',
  ],
  source: { name: LAB_SOURCES.workbook, chapter: 'Dynamic ARP Inspection (DAI)', confidence: 0.95 },
  metadata: { version: '1', status: 'validated', confidence: 0.95 },
}

const TOPO_DAI = {
  id: 'TOPO-DAI',
  title: 'DAI topology',
  objectiveId: '5.6',
  nodes: [
    { id: 'att', label: 'Attacker .2 (static)', type: 'attacker', x: 18, y: 22, note: 'untrusted' },
    { id: 'pc', label: 'Valid PC (DHCP)', type: 'pc', x: 18, y: 78 },
    { id: 'sw', label: 'SW1 (VLAN 1)', type: 'switch', x: 52, y: 50 },
    { id: 'r1', label: 'R1 .254 /24', type: 'router', x: 86, y: 50 },
  ],
  links: [
    { id: 'k1', source: 'att', target: 'sw', label: 'Gi0/0 untrusted', linkType: 'access', status: 'blocked' },
    { id: 'k2', source: 'pc', target: 'sw', label: 'Gi0/1 DAI-trust', linkType: 'access' },
    { id: 'k3', source: 'sw', target: 'r1', label: 'Gi0/2 snoop+DAI trust', linkType: 'access', status: 'forwarding' },
  ],
  notes: ['VLAN 1 used throughout.', 'Only the uplink (and valid host) ports are trusted; the attacker port is untrusted.'],
}

const VALIDATOR_DAI = {
  labId: 'LAB-DAI-DHCP-SNOOPING',
  // Deterministic check: each required command, normalised, that the learner
  // must enter for the lab to be considered complete.
  requiredCommands: [
    { device: 'R1', command: 'ip dhcp pool mypool' },
    { device: 'R1', command: 'network 192.168.10.0 255.255.255.0' },
    { device: 'SW1', command: 'switchport mode access' },
    { device: 'SW1', command: 'ip dhcp snooping' },
    { device: 'SW1', command: 'ip dhcp snooping vlan 1' },
    { device: 'SW1', command: 'ip dhcp snooping trust' },
    { device: 'SW1', command: 'ip arp inspection vlan 1' },
    { device: 'SW1', command: 'ip arp inspection trust' },
  ],
  verificationChecks: [
    { id: 'v1', device: 'R1', command: 'show ip dhcp binding', expectedResult: 'Valid PC’s leased IP/MAC appears.', passCondition: 'binding present' },
    { id: 'v2', device: 'SW1', command: 'show ip dhcp snooping binding', expectedResult: 'IP-MAC-port binding for the valid PC on Gi0/1.', passCondition: 'binding present' },
    { id: 'v3', device: 'SW1', command: 'show ip arp inspection', expectedResult: 'DAI enabled on VLAN 1; untrusted ports listed.', passCondition: 'DAI active' },
  ],
  failureChecks: [
    { id: 'f1', device: 'Attacker', command: 'ping 192.168.10.254', expectedFailure: 'Ping fails (request timed out).', reason: 'No DHCP snooping binding exists for the static IP, so DAI drops its ARP.' },
    { id: 'f2', device: 'SW1', command: 'show logging', expectedFailure: 'Invalid ARP log entries on the attacker port.', reason: 'DAI logs and drops the forged ARP packets.' },
  ],
}

const DIAGRAM_DAI = {
  id: 'DIAG-DAI-blocked',
  title: 'DAI drops the static-IP attacker',
  type: 'troubleshooting',
  ckuIds: ['CKU-DYNAMIC-ARP-INSPECTION', 'CKU-DHCP-SNOOPING'],
  nodes: [
    { id: 'att', label: 'Attacker .2 (no binding)', type: 'process', x: 20, y: 25, status: 'error' },
    { id: 'sw', label: 'SW1 checks binding table', type: 'switch', x: 55, y: 25 },
    { id: 'drop', label: 'ARP dropped + logged', type: 'process', x: 55, y: 80, status: 'error' },
    { id: 'r1', label: 'R1 .254 (never reached)', type: 'router', x: 88, y: 25 },
  ],
  links: [
    { id: 'd1', source: 'att', target: 'sw', label: 'forged ARP', status: 'normal' },
    { id: 'd2', source: 'sw', target: 'drop', label: 'no match', status: 'dropped' },
    { id: 'd3', source: 'sw', target: 'r1', label: 'blocked', status: 'blocked' },
  ],
  annotations: ['The attacker’s static .2 has no DHCP Snooping binding.', 'DAI compares the ARP against the binding table, finds no match, and drops + logs it.'],
  sourceRefs: [{ sourceName: LAB_SOURCES.workbook, chapter: 'DAI', confidence: 0.9 }],
}

const FLOWS_DAI = [
  {
    id: 'FLOW-DAI-valid', title: 'Valid ARP is forwarded', ckuIds: ['CKU-DHCP-SNOOPING', 'CKU-DYNAMIC-ARP-INSPECTION'], diagramId: 'DIAG-DAI-blocked',
    steps: [
      { id: 's1', order: 1, title: 'DHCP lease', action: 'Valid PC gets 192.168.10.x via DHCP through the trusted uplink.', successState: 'learned' },
      { id: 's2', order: 2, title: 'Binding stored', action: 'DHCP Snooping records IP-MAC-port in the binding table.', successState: 'learned' },
      { id: 's3', order: 3, title: 'ARP check', action: 'PC’s ARP matches its binding, so DAI permits it.', successState: 'matched' },
      { id: 's4', order: 4, title: 'Forward', action: 'ARP is forwarded; the PC reaches the gateway.', successState: 'forwarded' },
    ],
  },
  {
    id: 'FLOW-DAI-invalid', title: 'Forged ARP is dropped', ckuIds: ['CKU-DYNAMIC-ARP-INSPECTION'], diagramId: 'DIAG-DAI-blocked',
    steps: [
      { id: 's1', order: 1, title: 'Static IP', action: 'Attacker sets a static 192.168.10.2 — no DHCP, no binding.', successState: 'failed' },
      { id: 's2', order: 2, title: 'ARP sent', action: 'Attacker sends ARP on the untrusted port.', successState: 'failed' },
      { id: 's3', order: 3, title: 'No binding', action: 'DAI finds no matching binding in the snooping table.', successState: 'dropped' },
      { id: 's4', order: 4, title: 'Drop + log', action: 'Switch drops the ARP and logs an invalid-ARP entry.', successState: 'dropped' },
    ],
  },
]

const DAI = { lab: LAB_DAI, topology: TOPO_DAI, validator: VALIDATOR_DAI, diagram: DIAGRAM_DAI, packetFlows: FLOWS_DAI }

/* -------------------------------------------------------------------------
   LAB: VLANs and 802.1Q Trunking between two switches
   Maps to Domain 2.0 / Objective 2.1 (VLANs); also touches 2.2 (trunking).
   ------------------------------------------------------------------------- */
const LAB_VLAN_TRUNK = {
  id: 'LAB-VLAN-TRUNK',
  title: 'Configure VLANs, Access Ports, and an 802.1Q Trunk',
  domainId: 'access',
  objectiveId: '2.1',
  ckuIds: ['CKU-VLAN', 'CKU-ACCESS-PORT', 'CKU-TRUNKING', 'CKU-NATIVE-VLAN'],
  labType: 'guided',
  difficulty: 'beginner',
  estimatedTimeMinutes: 15,
  tools: ['Packet Tracer', 'GNS3', 'CML'],
  examRelevance: 'core',
  scenario: 'SW1 and SW2 each host PCs in two departments — Sales (VLAN 10) and Engineering (VLAN 20). You will create both VLANs on each switch, assign access ports, and configure the link between SW1 and SW2 as an 802.1Q trunk so VLAN 10 and 20 traffic can both cross between switches.',
  learningGoals: [
    'Create VLANs and assign descriptive names.',
    'Assign access ports to the correct VLAN with switchport mode access.',
    'Configure a trunk port and verify the native VLAN matches on both ends.',
    'Verify VLAN membership and trunk status.',
  ],
  topologyId: 'TOPO-VLAN-TRUNK',
  prerequisites: ['CKU-MAC-ADDRESS-TABLE'],

  tasks: [
    { id: 't1', order: 1, title: 'Create VLANs on SW1', device: 'SW1', instruction: 'Create VLAN 10 (name Sales) and VLAN 20 (name Engineering) on SW1.',
      expectedCommands: ['vlan 10', 'name Sales', 'vlan 20', 'name Engineering'] },
    { id: 't2', order: 2, title: 'Create VLANs on SW2', device: 'SW2', instruction: 'Create the same two VLANs (10 Sales, 20 Engineering) on SW2.',
      expectedCommands: ['vlan 10', 'name Sales', 'vlan 20', 'name Engineering'] },
    { id: 't3', order: 3, title: 'Assign access ports on SW1', device: 'SW1', instruction: 'Set Gi0/1 as an access port in VLAN 10 (PC1) and Gi0/2 as an access port in VLAN 20 (PC2).',
      expectedCommands: ['interface gi0/1', 'switchport mode access', 'switchport access vlan 10', 'interface gi0/2', 'switchport access vlan 20'] },
    { id: 't4', order: 4, title: 'Assign access port on SW2', device: 'SW2', instruction: 'Set Gi0/1 as an access port in VLAN 10 (PC3).',
      expectedCommands: ['interface gi0/1', 'switchport mode access', 'switchport access vlan 10'] },
    { id: 't5', order: 5, title: 'Configure the trunk on SW1', device: 'SW1', instruction: 'Configure Gi0/3 (link to SW2) as an 802.1Q trunk carrying VLANs 10 and 20, with the default native VLAN 1.',
      expectedCommands: ['interface gi0/3', 'switchport trunk encapsulation dot1q', 'switchport mode trunk', 'switchport trunk allowed vlan 10,20'] },
    { id: 't6', order: 6, title: 'Configure the trunk on SW2', device: 'SW2', instruction: 'Configure Gi0/3 (link to SW1) as a matching 802.1Q trunk carrying VLANs 10 and 20.',
      expectedCommands: ['interface gi0/3', 'switchport trunk encapsulation dot1q', 'switchport mode trunk', 'switchport trunk allowed vlan 10,20'] },
  ],

  verificationCommands: [
    'show vlan brief',
    'show interfaces trunk',
    'show interfaces gi0/3 switchport',
  ],
  successCriteria: [
    'show vlan brief lists VLAN 10 (Sales) and VLAN 20 (Engineering) with the correct access ports.',
    'show interfaces trunk shows Gi0/3 as a trunk on both switches, allowing VLANs 10 and 20.',
    'PC1 (VLAN 10 on SW1) can ping PC3 (VLAN 10 on SW2) across the trunk.',
    'The native VLAN (1) matches on both ends of the trunk — no mismatch warning.',
  ],
  failureCriteria: [
    'Forgetting to add the VLAN to the trunk allowed list → that VLAN\'s traffic is dropped at the trunk.',
    'Mismatched native VLANs on the two trunk ports → native VLAN mismatch error/log.',
    'Leaving Gi0/3 in access mode → only one VLAN crosses, others are blocked.',
    'Assigning an access port to a VLAN that was never created → port goes into an inactive VLAN.',
  ],
  commonMistakes: [
    'Typing `switchport access vlan 10` without first creating VLAN 10 — works, but the VLAN shows as "inactive" until created.',
    'Forgetting `switchport trunk encapsulation dot1q` on switches that support multiple encapsulations (ISL legacy).',
    'Leaving the allowed-VLAN list at its default (all VLANs) when the design calls for restricting it.',
    'Mismatching the native VLAN between the two ends of a trunk.',
  ],
  source: { name: LAB_SOURCES.workbook, chapter: 'VLANs and Trunking', confidence: 0.95 },
  metadata: { version: '1', status: 'validated', confidence: 0.95 },
}

const TOPO_VLAN_TRUNK = {
  id: 'TOPO-VLAN-TRUNK',
  title: 'VLAN + trunk topology',
  objectiveId: '2.1',
  nodes: [
    { id: 'pc1', label: 'PC1 (VLAN 10)', type: 'pc', x: 10, y: 25 },
    { id: 'pc2', label: 'PC2 (VLAN 20)', type: 'pc', x: 10, y: 75 },
    { id: 'sw1', label: 'SW1', type: 'switch', x: 38, y: 50 },
    { id: 'sw2', label: 'SW2', type: 'switch', x: 72, y: 50 },
    { id: 'pc3', label: 'PC3 (VLAN 10)', type: 'pc', x: 95, y: 50 },
  ],
  links: [
    { id: 'k1', source: 'pc1', target: 'sw1', label: 'Gi0/1 access VLAN 10' },
    { id: 'k2', source: 'pc2', target: 'sw1', label: 'Gi0/2 access VLAN 20' },
    { id: 'k3', source: 'sw1', target: 'sw2', label: 'Gi0/3 trunk (10,20)', linkType: 'trunk', status: 'forwarding' },
    { id: 'k4', source: 'sw2', target: 'pc3', label: 'Gi0/1 access VLAN 10' },
  ],
  notes: ['VLAN 10 = Sales, VLAN 20 = Engineering.', 'Only the trunk (Gi0/3 on each switch) carries tagged frames.'],
}

const VALIDATOR_VLAN_TRUNK = {
  labId: 'LAB-VLAN-TRUNK',
  requiredCommands: [
    { device: 'SW1', command: 'vlan 10' },
    { device: 'SW1', command: 'vlan 20' },
    { device: 'SW1', command: 'switchport access vlan 10' },
    { device: 'SW1', command: 'switchport access vlan 20' },
    { device: 'SW1', command: 'switchport mode trunk' },
    { device: 'SW1', command: 'switchport trunk allowed vlan 10,20' },
    { device: 'SW2', command: 'vlan 10' },
    { device: 'SW2', command: 'switchport access vlan 10' },
    { device: 'SW2', command: 'switchport mode trunk' },
    { device: 'SW2', command: 'switchport trunk allowed vlan 10,20' },
  ],
  verificationChecks: [
    { id: 'v1', device: 'SW1', command: 'show vlan brief', expectedResult: 'VLAN 10 (Sales) and VLAN 20 (Engineering) listed with Gi0/1 and Gi0/2 respectively.', passCondition: 'VLANs active with correct ports' },
    { id: 'v2', device: 'SW1', command: 'show interfaces trunk', expectedResult: 'Gi0/3 listed as a trunk, allowed VLANs 10,20.', passCondition: 'trunk active' },
    { id: 'v3', device: 'PC1', command: 'ping <PC3-IP>', expectedResult: 'Ping succeeds — both in VLAN 10, reachable across the trunk.', passCondition: 'ping success' },
  ],
  failureChecks: [
    { id: 'f1', device: 'SW1', command: 'show interfaces trunk', expectedFailure: 'VLAN 20 missing from the allowed list', reason: 'If `switchport trunk allowed vlan` excludes 20, VLAN 20 traffic cannot cross the trunk.' },
  ],
}

const DIAGRAM_VLAN_TRUNK = {
  id: 'DIAG-VLAN-TRUNK',
  title: 'Tagged vs untagged frames across the trunk',
  type: 'topology',
  ckuIds: ['CKU-TRUNKING', 'CKU-NATIVE-VLAN'],
  nodes: [
    { id: 'pc1', label: 'PC1 (VLAN 10)', type: 'pc', x: 10, y: 30 },
    { id: 'sw1', label: 'SW1', type: 'switch', x: 38, y: 50 },
    { id: 'trunk', label: '802.1Q trunk — tag VLAN 10', type: 'process', x: 55, y: 50, status: 'highlighted' },
    { id: 'sw2', label: 'SW2', type: 'switch', x: 72, y: 50 },
    { id: 'pc3', label: 'PC3 (VLAN 10)', type: 'pc', x: 95, y: 50 },
  ],
  links: [
    { id: 'd1', source: 'pc1', target: 'sw1', label: 'untagged' },
    { id: 'd2', source: 'sw1', target: 'trunk', status: 'forwarding' },
    { id: 'd3', source: 'trunk', target: 'sw2', status: 'forwarding' },
    { id: 'd4', source: 'sw2', target: 'pc3', label: 'untagged' },
  ],
  annotations: ['SW1 adds an 802.1Q tag (VLAN 10) before sending the frame across the trunk.', 'SW2 strips the tag before delivering the frame to PC3, which never sees tags.'],
  sourceRefs: [{ sourceName: LAB_SOURCES.workbook, chapter: 'Trunking', confidence: 0.9 }],
}

const FLOWS_VLAN_TRUNK = [
  {
    id: 'FLOW-VLAN-TRUNK-same', title: 'Same-VLAN frame crosses the trunk', ckuIds: ['CKU-VLAN', 'CKU-TRUNKING'], diagramId: 'DIAG-VLAN-TRUNK',
    steps: [
      { id: 's1', order: 1, title: 'Frame from PC1', action: 'PC1 (VLAN 10) sends an untagged frame to SW1.', successState: 'forwarded' },
      { id: 's2', order: 2, title: 'Tag added', action: 'SW1 tags the frame with VLAN 10 and sends it out the Gi0/3 trunk.', successState: 'modified' },
      { id: 's3', order: 3, title: 'Tag read', action: 'SW2 reads the VLAN 10 tag and looks up its VLAN 10 MAC table.', successState: 'matched' },
      { id: 's4', order: 4, title: 'Untagged to PC3', action: 'SW2 strips the tag and forwards the untagged frame out the Gi0/1 access port to PC3.', successState: 'forwarded' },
    ],
  },
  {
    id: 'FLOW-VLAN-TRUNK-blocked', title: 'VLAN not in the allowed list is dropped', ckuIds: ['CKU-TRUNKING'], diagramId: 'DIAG-VLAN-TRUNK',
    steps: [
      { id: 's1', order: 1, title: 'Frame from VLAN 20', action: 'PC2 (VLAN 20) sends a frame to SW1.', successState: 'forwarded' },
      { id: 's2', order: 2, title: 'Tag added', action: 'SW1 tags it VLAN 20.', successState: 'modified' },
      { id: 's3', order: 3, title: 'Allowed-list check', action: 'If VLAN 20 is not in `switchport trunk allowed vlan` on Gi0/3, the frame is dropped at the trunk.', successState: 'dropped' },
    ],
  },
]

const VLAN_TRUNK = { lab: LAB_VLAN_TRUNK, topology: TOPO_VLAN_TRUNK, validator: VALIDATOR_VLAN_TRUNK, diagram: DIAGRAM_VLAN_TRUNK, packetFlows: FLOWS_VLAN_TRUNK }

/* -------------------------------------------------------------------------
   LAB: Single-Area OSPFv2 between two routers
   Maps to Domain 3.0 / Objective 3.4 (OSPFv2).
   ------------------------------------------------------------------------- */
const LAB_OSPF = {
  id: 'LAB-OSPF-SINGLE-AREA',
  title: 'Configure Single-Area OSPFv2 Between Two Routers',
  domainId: 'connectivity',
  objectiveId: '3.4',
  ckuIds: ['CKU-OSPF', 'CKU-OSPF-NEIGHBOR', 'CKU-OSPF-COST'],
  labType: 'guided',
  difficulty: 'intermediate',
  estimatedTimeMinutes: 18,
  tools: ['Packet Tracer', 'GNS3', 'CML'],
  examRelevance: 'core',
  scenario: 'R1 and R2 are connected via a point-to-point link and each have a LAN behind them. You will configure IP addressing, enable OSPFv2 in area 0 on both routers, and verify the neighbor adjacency forms and both LANs appear in each router\'s routing table.',
  learningGoals: [
    'Configure interface IP addressing for a point-to-point link and a LAN.',
    'Enable OSPFv2 with a router ID and area 0 network statements.',
    'Verify OSPF neighbor adjacency (state FULL).',
    'Verify OSPF routes appear in the routing table with AD 110.',
  ],
  topologyId: 'TOPO-OSPF',
  prerequisites: ['CKU-ROUTING-TABLE'],

  tasks: [
    { id: 't1', order: 1, title: 'Addressing on R1', device: 'R1', instruction: 'Configure R1: Gi0/0 = 10.0.12.1/30 (link to R2), Gi0/1 = 10.0.1.1/24 (LAN1). Bring both interfaces up.',
      expectedCommands: ['interface gi0/0', 'ip address 10.0.12.1 255.255.255.252', 'no shutdown', 'interface gi0/1', 'ip address 10.0.1.1 255.255.255.0'] },
    { id: 't2', order: 2, title: 'Addressing on R2', device: 'R2', instruction: 'Configure R2: Gi0/0 = 10.0.12.2/30 (link to R1), Gi0/1 = 10.0.2.1/24 (LAN2). Bring both interfaces up.',
      expectedCommands: ['interface gi0/0', 'ip address 10.0.12.2 255.255.255.252', 'no shutdown', 'interface gi0/1', 'ip address 10.0.2.1 255.255.255.0'] },
    { id: 't3', order: 3, title: 'Enable OSPF on R1', device: 'R1', instruction: 'Start OSPF process 1 with router-id 1.1.1.1, and advertise both R1 networks into area 0.',
      expectedCommands: ['router ospf 1', 'router-id 1.1.1.1', 'network 10.0.12.0 0.0.0.3 area 0', 'network 10.0.1.0 0.0.0.255 area 0'] },
    { id: 't4', order: 4, title: 'Enable OSPF on R2', device: 'R2', instruction: 'Start OSPF process 1 with router-id 2.2.2.2, and advertise both R2 networks into area 0.',
      expectedCommands: ['router ospf 1', 'router-id 2.2.2.2', 'network 10.0.12.0 0.0.0.3 area 0', 'network 10.0.2.0 0.0.0.255 area 0'] },
    { id: 't5', order: 5, title: 'Verify adjacency', device: 'R1', instruction: 'Confirm R1 and R2 have formed a FULL OSPF neighbor adjacency.',
      expectedCommands: ['show ip ospf neighbor'] },
    { id: 't6', order: 6, title: 'Verify routes', device: 'R1', instruction: 'Confirm R1\'s routing table contains an OSPF (O) route to R2\'s LAN (10.0.2.0/24).',
      expectedCommands: ['show ip route ospf'] },
  ],

  verificationCommands: [
    'show ip ospf neighbor',
    'show ip route ospf',
    'show ip protocols',
    'show ip ospf interface brief',
  ],
  successCriteria: [
    'show ip ospf neighbor shows R2 (or R1) in state FULL.',
    'show ip route ospf on R1 shows O 10.0.2.0/24 via 10.0.12.2.',
    'show ip route ospf on R2 shows O 10.0.1.0/24 via 10.0.12.1.',
    'Routes show administrative distance 110 (O).',
    'A PC on LAN1 can ping a PC on LAN2.',
  ],
  failureCriteria: [
    'Mismatched area numbers on the two ends of a link → neighbors never form.',
    'Wrong wildcard mask on the network statement → the link or LAN is not advertised.',
    'Mismatched hello/dead timers → adjacency stuck in a non-FULL state.',
    'Interface left administratively down (`shutdown`) → no adjacency at all.',
  ],
  commonMistakes: [
    'Using a subnet mask instead of a wildcard mask in the `network` command.',
    'Forgetting `no shutdown` on newly configured interfaces.',
    'Putting the two ends of the same link in different OSPF areas.',
    'Expecting routes to appear before the neighbor adjacency reaches FULL.',
  ],
  source: { name: LAB_SOURCES.workbook, chapter: 'OSPFv2 Single Area', confidence: 0.95 },
  metadata: { version: '1', status: 'validated', confidence: 0.95 },
}

const TOPO_OSPF = {
  id: 'TOPO-OSPF',
  title: 'Single-area OSPF topology',
  objectiveId: '3.4',
  nodes: [
    { id: 'lan1', label: 'LAN1 10.0.1.0/24', type: 'subnet', x: 8, y: 50 },
    { id: 'r1', label: 'R1 (RID 1.1.1.1)', type: 'router', x: 35, y: 50 },
    { id: 'link', label: '10.0.12.0/30 — Area 0', type: 'process', x: 60, y: 30 },
    { id: 'r2', label: 'R2 (RID 2.2.2.2)', type: 'router', x: 85, y: 50 },
    { id: 'lan2', label: 'LAN2 10.0.2.0/24', type: 'subnet', x: 100, y: 50 },
  ],
  links: [
    { id: 'k1', source: 'lan1', target: 'r1', label: 'Gi0/1' },
    { id: 'k2', source: 'r1', target: 'r2', label: 'Gi0/0 <-> Gi0/0', status: 'forwarding' },
    { id: 'k3', source: 'r2', target: 'lan2', label: 'Gi0/1' },
  ],
  notes: ['Both routers are in OSPF area 0 (single-area design).', 'Wildcard masks: /30 = 0.0.0.3, /24 = 0.0.0.255.'],
}

const VALIDATOR_OSPF = {
  labId: 'LAB-OSPF-SINGLE-AREA',
  requiredCommands: [
    { device: 'R1', command: 'ip address 10.0.12.1 255.255.255.252' },
    { device: 'R1', command: 'ip address 10.0.1.1 255.255.255.0' },
    { device: 'R1', command: 'router ospf 1' },
    { device: 'R1', command: 'network 10.0.12.0 0.0.0.3 area 0' },
    { device: 'R1', command: 'network 10.0.1.0 0.0.0.255 area 0' },
    { device: 'R2', command: 'ip address 10.0.12.2 255.255.255.252' },
    { device: 'R2', command: 'ip address 10.0.2.1 255.255.255.0' },
    { device: 'R2', command: 'router ospf 1' },
    { device: 'R2', command: 'network 10.0.12.0 0.0.0.3 area 0' },
    { device: 'R2', command: 'network 10.0.2.0 0.0.0.255 area 0' },
  ],
  verificationChecks: [
    { id: 'v1', device: 'R1', command: 'show ip ospf neighbor', expectedResult: 'Neighbor 2.2.2.2 in state FULL.', passCondition: 'neighbor FULL' },
    { id: 'v2', device: 'R1', command: 'show ip route ospf', expectedResult: 'O 10.0.2.0/24 [110/...] via 10.0.12.2', passCondition: 'OSPF route present' },
    { id: 'v3', device: 'R2', command: 'show ip route ospf', expectedResult: 'O 10.0.1.0/24 [110/...] via 10.0.12.1', passCondition: 'OSPF route present' },
  ],
  failureChecks: [
    { id: 'f1', device: 'R1', command: 'show ip ospf neighbor', expectedFailure: 'No neighbors listed', reason: 'Mismatched area, wildcard mask, or a shutdown interface prevents the adjacency from forming.' },
  ],
}

const DIAGRAM_OSPF = {
  id: 'DIAG-OSPF-adjacency',
  title: 'OSPF neighbor adjacency and route exchange',
  type: 'process',
  ckuIds: ['CKU-OSPF-NEIGHBOR', 'CKU-OSPF'],
  nodes: [
    { id: 'r1', label: 'R1 — Down', type: 'router', x: 18, y: 50 },
    { id: 'hello', label: 'Hello (area, timers match)', type: 'process', x: 50, y: 22, status: 'highlighted' },
    { id: 'lsdb', label: 'Exchange LSDB → FULL', type: 'process', x: 50, y: 78 },
    { id: 'r2', label: 'R2 — Down', type: 'router', x: 82, y: 50 },
  ],
  links: [
    { id: 'd1', source: 'r1', target: 'hello', status: 'forwarding' }, { id: 'd2', source: 'hello', target: 'r2' },
    { id: 'd3', source: 'r2', target: 'lsdb' }, { id: 'd4', source: 'lsdb', target: 'r1', status: 'forwarding' },
  ],
  annotations: ['Both routers must agree on area, subnet/mask, and hello/dead timers to become neighbors.', 'After LSDB exchange, the adjacency reaches FULL and SPF computes routes.'],
  sourceRefs: [{ sourceName: LAB_SOURCES.workbook, chapter: 'OSPF Adjacency', confidence: 0.9 }],
}

const FLOWS_OSPF = [
  {
    id: 'FLOW-OSPF-adjacency', title: 'Forming an OSPF adjacency', ckuIds: ['CKU-OSPF-NEIGHBOR'], diagramId: 'DIAG-OSPF-adjacency',
    steps: [
      { id: 's1', order: 1, title: 'Hello', action: 'R1 and R2 send Hello packets out the shared link.', successState: 'forwarded' },
      { id: 's2', order: 2, title: 'Parameter check', action: 'Each checks the other\'s area ID, subnet/mask, and hello/dead timers match.', successState: 'matched' },
      { id: 's3', order: 3, title: 'Database exchange', action: 'Routers exchange link-state databases (LSDB).', successState: 'learned' },
      { id: 's4', order: 4, title: 'FULL', action: 'Adjacency reaches FULL; SPF runs and routes are installed.', successState: 'matched' },
    ],
  },
  {
    id: 'FLOW-OSPF-route', title: 'Reaching the remote LAN', ckuIds: ['CKU-OSPF', 'CKU-OSPF-COST'], diagramId: 'DIAG-OSPF-adjacency',
    steps: [
      { id: 's1', order: 1, title: 'LSA advertised', action: 'R2 advertises 10.0.2.0/24 via an LSA.', successState: 'learned' },
      { id: 's2', order: 2, title: 'SPF run', action: 'R1 runs SPF and computes the lowest-cost path to 10.0.2.0/24 via R2.', successState: 'matched' },
      { id: 's3', order: 3, title: 'Route installed', action: 'R1 installs O 10.0.2.0/24 [110/cost] via 10.0.12.2.', successState: 'forwarded' },
    ],
  },
]

const OSPF = { lab: LAB_OSPF, topology: TOPO_OSPF, validator: VALIDATOR_OSPF, diagram: DIAGRAM_OSPF, packetFlows: FLOWS_OSPF }

/* -------------------------------------------------------------------------
   LAB: NAT Overload (PAT) for Internet Access
   Maps to Domain 4.0 / Objective 4.1 (NAT).
   ------------------------------------------------------------------------- */
const LAB_NAT = {
  id: 'LAB-NAT-PAT',
  title: 'Configure NAT Overload (PAT) for Internet Access',
  domainId: 'services',
  objectiveId: '4.1',
  ckuIds: ['CKU-NAT', 'CKU-PAT', 'CKU-NAT-TERMS'],
  labType: 'guided',
  difficulty: 'intermediate',
  estimatedTimeMinutes: 15,
  tools: ['Packet Tracer', 'GNS3', 'CML'],
  examRelevance: 'core',
  scenario: 'R1 connects a private LAN (192.168.1.0/24) to the internet via its Gi0/0 outside interface (203.0.113.1/30). You will mark the inside/outside interfaces, define which inside addresses are allowed to be translated, and configure PAT so every inside host shares the single outside IP.',
  learningGoals: [
    'Mark interfaces as NAT inside vs outside.',
    'Write a standard ACL describing the inside addresses to translate.',
    'Configure NAT overload (PAT) referencing the ACL and outside interface.',
    'Verify active translations with show ip nat translations.',
  ],
  topologyId: 'TOPO-NAT',
  prerequisites: ['CKU-PRIVATE-IPV4'],

  tasks: [
    { id: 't1', order: 1, title: 'Addressing', device: 'R1', instruction: 'Configure Gi0/1 (inside) = 192.168.1.1/24 and Gi0/0 (outside) = 203.0.113.1/30. Bring both up.',
      expectedCommands: ['interface gi0/1', 'ip address 192.168.1.1 255.255.255.0', 'no shutdown', 'interface gi0/0', 'ip address 203.0.113.1 255.255.255.252'] },
    { id: 't2', order: 2, title: 'Mark inside/outside', device: 'R1', instruction: 'Mark Gi0/1 as the NAT inside interface and Gi0/0 as the NAT outside interface.',
      expectedCommands: ['interface gi0/1', 'ip nat inside', 'interface gi0/0', 'ip nat outside'] },
    { id: 't3', order: 3, title: 'Define inside addresses', device: 'R1', instruction: 'Create standard ACL 1 permitting the 192.168.1.0/24 network — this defines which addresses get translated.',
      expectedCommands: ['access-list 1 permit 192.168.1.0 0.0.0.255'] },
    { id: 't4', order: 4, title: 'Enable PAT', device: 'R1', instruction: 'Configure NAT overload (PAT) so ACL 1 traffic is translated to the Gi0/0 outside IP with port-level multiplexing.',
      expectedCommands: ['ip nat inside source list 1 interface gi0/0 overload'] },
    { id: 't5', order: 5, title: 'Generate and verify traffic', device: 'PC1', instruction: 'From an inside host (192.168.1.10), ping an outside address, then verify the translation table on R1.',
      expectedCommands: ['ping 198.51.100.1'] },
  ],

  verificationCommands: [
    'show ip nat translations',
    'show ip nat statistics',
    'show running-config | include nat',
  ],
  successCriteria: [
    'show ip nat translations shows 192.168.1.10:xxxxx translated to 203.0.113.1:xxxxx after the ping.',
    'The outside host receives traffic only from 203.0.113.1 — never sees the 192.168.1.x address.',
    'Multiple inside hosts can be active at once, each using a different source port on 203.0.113.1.',
    'show ip nat statistics shows hits incrementing for the overload translation.',
  ],
  failureCriteria: [
    'ACL written too narrow (e.g. host instead of /24) → only one inside host can be translated.',
    'Interfaces not marked inside/outside → "translation failed" — no inside/outside interfaces.',
    'Using `ip nat inside source static` instead of `list ... overload` → only one-to-one mapping, no port sharing.',
    'ACL with an implicit deny that blocks the real inside subnet → traffic not translated, dropped outbound.',
  ],
  commonMistakes: [
    'Forgetting `overload`, which limits NAT to one inside host per outside IP (no PAT).',
    'Marking both interfaces as "inside" or both as "outside".',
    'Writing the ACL wildcard mask backwards (e.g. 255.255.255.0 instead of 0.0.0.255).',
    'Expecting `show ip nat translations` to show entries before any traffic has been sent.',
  ],
  source: { name: LAB_SOURCES.workbook, chapter: 'NAT Overload (PAT)', confidence: 0.95 },
  metadata: { version: '1', status: 'validated', confidence: 0.95 },
}

const TOPO_NAT = {
  id: 'TOPO-NAT',
  title: 'PAT topology',
  objectiveId: '4.1',
  nodes: [
    { id: 'pc1', label: 'PC1 192.168.1.10', type: 'pc', x: 10, y: 50 },
    { id: 'r1', label: 'R1 — NAT overload', type: 'router', x: 45, y: 50, status: 'highlighted' },
    { id: 'isp', label: 'ISP 198.51.100.1', type: 'server', x: 85, y: 50 },
  ],
  links: [
    { id: 'k1', source: 'pc1', target: 'r1', label: 'Gi0/1 inside 192.168.1.1/24' },
    { id: 'k2', source: 'r1', target: 'isp', label: 'Gi0/0 outside 203.0.113.1/30', status: 'forwarding' },
  ],
  notes: ['All inside hosts share the single outside address 203.0.113.1, distinguished by source port.'],
}

const VALIDATOR_NAT = {
  labId: 'LAB-NAT-PAT',
  requiredCommands: [
    { device: 'R1', command: 'ip address 192.168.1.1 255.255.255.0' },
    { device: 'R1', command: 'ip address 203.0.113.1 255.255.255.252' },
    { device: 'R1', command: 'ip nat inside' },
    { device: 'R1', command: 'ip nat outside' },
    { device: 'R1', command: 'access-list 1 permit 192.168.1.0 0.0.0.255' },
    { device: 'R1', command: 'ip nat inside source list 1 interface gi0/0 overload' },
  ],
  verificationChecks: [
    { id: 'v1', device: 'R1', command: 'show ip nat translations', expectedResult: '192.168.1.10:xxxxx <-> 203.0.113.1:xxxxx entry appears after traffic.', passCondition: 'translation present' },
    { id: 'v2', device: 'R1', command: 'show ip nat statistics', expectedResult: 'Hits counter > 0 for the dynamic overload translation.', passCondition: 'hits > 0' },
  ],
  failureChecks: [
    { id: 'f1', device: 'R1', command: 'show ip nat translations', expectedFailure: 'No entries after a ping from PC1', reason: 'Missing `ip nat inside`/`outside` markers or a too-narrow ACL prevents translation.' },
  ],
}

const DIAGRAM_NAT = {
  id: 'DIAG-NAT-pat',
  title: 'PAT translation table',
  type: 'process',
  ckuIds: ['CKU-PAT', 'CKU-NAT-TERMS'],
  nodes: [
    { id: 'pc1', label: 'Inside local 192.168.1.10:1500', type: 'pc', x: 12, y: 30 },
    { id: 'pc2', label: 'Inside local 192.168.1.11:1500', type: 'pc', x: 12, y: 75 },
    { id: 'nat', label: 'R1 PAT table', type: 'router', x: 50, y: 50, status: 'highlighted' },
    { id: 'isp', label: 'Inside global 203.0.113.1', type: 'server', x: 88, y: 50 },
  ],
  links: [
    { id: 'd1', source: 'pc1', target: 'nat', label: ':1500 -> :40001', status: 'forwarding' },
    { id: 'd2', source: 'pc2', target: 'nat', label: ':1500 -> :40002', status: 'forwarding' },
    { id: 'd3', source: 'nat', target: 'isp', status: 'forwarding' },
  ],
  annotations: ['Both hosts share 203.0.113.1, distinguished by source port.', 'Inside local -> inside global translation tracked per port.'],
  sourceRefs: [{ sourceName: LAB_SOURCES.workbook, chapter: 'PAT', confidence: 0.9 }],
}

const FLOWS_NAT = [
  {
    id: 'FLOW-NAT-pat', title: 'PAT translation', ckuIds: ['CKU-PAT'], diagramId: 'DIAG-NAT-pat',
    steps: [
      { id: 's1', order: 1, title: 'Packet out', action: 'PC1 sends to 198.51.100.1 with source 192.168.1.10:1500.', successState: 'forwarded' },
      { id: 's2', order: 2, title: 'Translate', action: 'R1 rewrites the source to 203.0.113.1:40001 and records the mapping.', successState: 'modified' },
      { id: 's3', order: 3, title: 'Reply', action: 'The ISP host replies to 203.0.113.1:40001.', successState: 'matched' },
      { id: 's4', order: 4, title: 'Reverse', action: 'R1 maps the reply back to 192.168.1.10:1500 and forwards it to PC1.', successState: 'forwarded' },
    ],
  },
]

const NAT = { lab: LAB_NAT, topology: TOPO_NAT, validator: VALIDATOR_NAT, diagram: DIAGRAM_NAT, packetFlows: FLOWS_NAT }

/* -------------------------------------------------------------------------
   REGISTRY + LOADERS
   ------------------------------------------------------------------------- */
const LABS = { [DAI.lab.id]: DAI, [VLAN_TRUNK.lab.id]: VLAN_TRUNK, [OSPF.lab.id]: OSPF, [NAT.lab.id]: NAT }

export const allLabs = () => Object.values(LABS).map(x => x.lab)
export function getLab(labId) { return LABS[labId] || null }
export function labsForObjective(objectiveId) { return Object.values(LABS).filter(x => x.lab.objectiveId === objectiveId).map(x => x.lab) }
// Labs grouped by domainId, for the Labs hub.
export function labsByDomain() {
  const out = {}
  for (const { lab } of Object.values(LABS)) (out[lab.domainId] ||= []).push(lab)
  return out
}

// Normalise a CLI line for deterministic matching (lowercase, collapse spaces,
// drop the leading device/mode prompt if present).
export function normalizeCliLine(line) {
  return String(line || '').toLowerCase().replace(/^[^#>]*[#>]/, '').replace(/\s+/g, ' ').trim()
}
// Given the set of normalised commands a learner has entered, return which
// required commands are satisfied (substring match, order-independent).
export function labProgress(labId, enteredNormalized) {
  const v = LABS[labId]?.validator
  if (!v) return { done: [], total: 0, complete: false }
  const entered = new Set(enteredNormalized)
  const has = (cmd) => [...entered].some(e => e.includes(normalizeCliLine(cmd)))
  const done = v.requiredCommands.filter(rc => has(rc.command))
  return { done, total: v.requiredCommands.length, complete: done.length === v.requiredCommands.length }
}

/* -------------------------------------------------------------------------
   VALIDATOR — lab data definition-of-done.
   ------------------------------------------------------------------------- */
export function validateLabs() {
  const errors = []
  const ids = new Set()
  const dup = (id, where) => { if (!id) errors.push(`${where}: missing id`); else if (ids.has(id)) errors.push(`duplicate id ${id} (${where})`); else ids.add(id) }
  for (const { lab, topology, validator, diagram, packetFlows } of Object.values(LABS)) {
    dup(lab.id, 'lab')
    if (!lab.objectiveId) errors.push(`lab ${lab.id}: no objectiveId`)
    if (!lab.ckuIds?.length) errors.push(`lab ${lab.id}: no CKUs`)
    if (!lab.tasks?.length) errors.push(`lab ${lab.id}: no tasks`)
    lab.tasks.forEach((t, i) => { if (t.order !== i + 1) errors.push(`lab ${lab.id}: tasks not ordered at ${t.id}`); if (!t.instruction) errors.push(`lab ${lab.id}: task ${t.id} empty instruction`) })
    if (!lab.successCriteria?.length) errors.push(`lab ${lab.id}: no success criteria`)
    if (!lab.commonMistakes?.length) errors.push(`lab ${lab.id}: no common mistakes`)
    if (!lab.source?.name) errors.push(`lab ${lab.id}: no source`)
    if (!topology) errors.push(`lab ${lab.id}: missing topology`)
    else { dup(topology.id, 'topology'); if (!topology.nodes?.length || !topology.links?.length) errors.push(`topology ${topology.id}: needs nodes and links`)
      topology.links.forEach(l => { const ns = new Set(topology.nodes.map(n => n.id)); if (!ns.has(l.source) || !ns.has(l.target)) errors.push(`topology ${topology.id}: link ${l.id} bad node ref`) }) }
    if (!validator) errors.push(`lab ${lab.id}: missing validator`)
    else { if (!validator.requiredCommands?.length) errors.push(`validator ${lab.id}: no required commands`); if (!validator.verificationChecks?.length) errors.push(`validator ${lab.id}: no verification checks`) }
    if (!diagram?.nodes?.length || !diagram?.links?.length) errors.push(`lab ${lab.id}: diagram needs nodes and links`)
    if (!packetFlows?.length) errors.push(`lab ${lab.id}: no packet flows`)
    packetFlows?.forEach(pf => { dup(pf.id, 'packetFlow'); pf.steps.forEach((s, i) => { if (s.order !== i + 1) errors.push(`flow ${pf.id}: steps not ordered`) }) })
  }
  return { ok: errors.length === 0, errors }
}
