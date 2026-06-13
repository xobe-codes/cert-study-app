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

import { EXTENDED_LAB_BUNDLES } from './ccnaLabsExtended.js'
import { PHASE_LAB_BUNDLES } from './ccnaLabsPhases.js'

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
   LAB: Static Routing with a Floating Static Backup Route
   Maps to Domain 3.0 / Objective 3.3 (static routing).
   ------------------------------------------------------------------------- */
const LAB_STATIC = {
  id: 'LAB-STATIC-FLOATING',
  title: 'Configure Static Routes with a Floating Static Backup',
  domainId: 'connectivity',
  objectiveId: '3.3',
  ckuIds: ['CKU-STATIC-ROUTE', 'CKU-FLOATING-STATIC', 'CKU-DEFAULT-ROUTE'],
  labType: 'guided',
  difficulty: 'intermediate',
  estimatedTimeMinutes: 16,
  tools: ['Packet Tracer', 'GNS3', 'CML'],
  examRelevance: 'core',
  scenario: 'R1 and R2 each host a LAN and are connected by two links: a primary (Gi0/0) and a backup (Gi0/1). You will configure a normal static route over the primary link, and a FLOATING static route over the backup link with a higher administrative distance so it is only used if the primary link fails.',
  learningGoals: [
    'Configure a static route to a remote network via a next-hop IP.',
    'Configure a floating static route with a non-default administrative distance.',
    'Verify which route is preferred (lowest AD) in the routing table.',
    'Verify automatic failover to the floating static route when the primary link goes down.',
  ],
  topologyId: 'TOPO-STATIC',
  prerequisites: ['CKU-ROUTING-TABLE'],

  tasks: [
    { id: 't1', order: 1, title: 'Addressing on R1', device: 'R1', instruction: 'Configure R1: Gi0/2 = 10.0.1.1/24 (LAN1), Gi0/0 = 10.0.12.1/30 (primary link), Gi0/1 = 10.0.13.1/30 (backup link). Bring all up.',
      expectedCommands: ['interface gi0/2', 'ip address 10.0.1.1 255.255.255.0', 'no shutdown', 'interface gi0/0', 'ip address 10.0.12.1 255.255.255.252', 'interface gi0/1', 'ip address 10.0.13.1 255.255.255.252'] },
    { id: 't2', order: 2, title: 'Addressing on R2', device: 'R2', instruction: 'Configure R2: Gi0/2 = 10.0.2.1/24 (LAN2), Gi0/0 = 10.0.12.2/30 (primary link), Gi0/1 = 10.0.13.2/30 (backup link). Bring all up.',
      expectedCommands: ['interface gi0/2', 'ip address 10.0.2.1 255.255.255.0', 'no shutdown', 'interface gi0/0', 'ip address 10.0.12.2 255.255.255.252', 'interface gi0/1', 'ip address 10.0.13.2 255.255.255.252'] },
    { id: 't3', order: 3, title: 'Primary static route on R1', device: 'R1', instruction: 'Add a static route to LAN2 (10.0.2.0/24) via the primary link next-hop 10.0.12.2 (default AD 1).',
      expectedCommands: ['ip route 10.0.2.0 255.255.255.0 10.0.12.2'] },
    { id: 't4', order: 4, title: 'Floating static on R1', device: 'R1', instruction: 'Add a FLOATING static route to LAN2 via the backup link next-hop 10.0.13.2, with administrative distance 5 so it is only used if the primary route disappears.',
      expectedCommands: ['ip route 10.0.2.0 255.255.255.0 10.0.13.2 5'] },
    { id: 't5', order: 5, title: 'Primary + floating static on R2', device: 'R2', instruction: 'Mirror the routes on R2 toward LAN1 (10.0.1.0/24): primary via 10.0.12.1, floating via 10.0.13.1 with AD 5.',
      expectedCommands: ['ip route 10.0.1.0 255.255.255.0 10.0.12.1', 'ip route 10.0.1.0 255.255.255.0 10.0.13.1 5'] },
    { id: 't6', order: 6, title: 'Verify and test failover', device: 'R1', instruction: 'Confirm the primary route (AD 1) is installed and preferred. Then shut Gi0/0 and confirm the floating static (AD 5) is installed instead.',
      expectedCommands: ['show ip route static', 'interface gi0/0', 'shutdown'] },
  ],

  verificationCommands: [
    'show ip route static',
    'show ip route 10.0.2.0',
    'show running-config | include ip route',
  ],
  successCriteria: [
    'show ip route static on R1 shows S 10.0.2.0/24 [1/0] via 10.0.12.2 as the active route.',
    'The floating static (S 10.0.2.0/24 [5/0] via 10.0.13.2) exists but is NOT in the routing table while the primary is up.',
    'After `shutdown` on Gi0/0, the primary route disappears and the floating static (AD 5) is installed and becomes active.',
    'A PC on LAN1 can still reach LAN2 after the primary link fails (via the backup).',
  ],
  failureCriteria: [
    'Both static routes given the same AD → both attempt to install, causing load-balancing instead of backup-only behavior.',
    'Floating static AD lower than or equal to a dynamic routing protocol\'s AD → it could be preferred over a better dynamic route.',
    'Next-hop IP typo → route never installs (recursive lookup fails).',
    'Forgetting `no shutdown` on new interfaces → routes reference a down interface and never install.',
  ],
  commonMistakes: [
    'Forgetting the AD number entirely on the floating static — without it, AD defaults to 1, same as the primary, and both compete.',
    'Confusing AD 5 (a static route\'s floating distance) with OSPF\'s AD 110 — floating statics are usually given an AD lower than dynamic protocols but higher than the primary static (1).',
    'Testing failover without actually shutting the primary interface — the floating route never appears while the primary is reachable.',
    'Writing the destination network/mask incorrectly so the static route never matches the LAN2 traffic.',
  ],
  source: { name: LAB_SOURCES.workbook, chapter: 'Static Routing and Floating Statics', confidence: 0.95 },
  metadata: { version: '1', status: 'validated', confidence: 0.95 },
}

const TOPO_STATIC = {
  id: 'TOPO-STATIC',
  title: 'Static routing with primary + backup links',
  objectiveId: '3.3',
  nodes: [
    { id: 'lan1', label: 'LAN1 10.0.1.0/24', type: 'subnet', x: 8, y: 50 },
    { id: 'r1', label: 'R1', type: 'router', x: 35, y: 50 },
    { id: 'primary', label: 'Primary 10.0.12.0/30', type: 'process', x: 60, y: 25, status: 'forwarding' },
    { id: 'backup', label: 'Backup 10.0.13.0/30 (AD 5)', type: 'process', x: 60, y: 75 },
    { id: 'r2', label: 'R2', type: 'router', x: 85, y: 50 },
    { id: 'lan2', label: 'LAN2 10.0.2.0/24', type: 'subnet', x: 100, y: 50 },
  ],
  links: [
    { id: 'k1', source: 'lan1', target: 'r1', label: 'Gi0/2' },
    { id: 'k2', source: 'r1', target: 'primary', status: 'forwarding' },
    { id: 'k3', source: 'primary', target: 'r2', status: 'forwarding' },
    { id: 'k4', source: 'r1', target: 'backup' },
    { id: 'k5', source: 'backup', target: 'r2' },
    { id: 'k6', source: 'r2', target: 'lan2', label: 'Gi0/2' },
  ],
  notes: ['Primary static route has AD 1 (default) and is preferred.', 'Floating static (AD 5) is only installed if the primary route is removed.'],
}

const VALIDATOR_STATIC = {
  labId: 'LAB-STATIC-FLOATING',
  requiredCommands: [
    { device: 'R1', command: 'ip address 10.0.1.1 255.255.255.0' },
    { device: 'R1', command: 'ip address 10.0.12.1 255.255.255.252' },
    { device: 'R1', command: 'ip address 10.0.13.1 255.255.255.252' },
    { device: 'R1', command: 'ip route 10.0.2.0 255.255.255.0 10.0.12.2' },
    { device: 'R1', command: 'ip route 10.0.2.0 255.255.255.0 10.0.13.2 5' },
    { device: 'R2', command: 'ip address 10.0.2.1 255.255.255.0' },
    { device: 'R2', command: 'ip route 10.0.1.0 255.255.255.0 10.0.12.1' },
    { device: 'R2', command: 'ip route 10.0.1.0 255.255.255.0 10.0.13.1 5' },
  ],
  verificationChecks: [
    { id: 'v1', device: 'R1', command: 'show ip route static', expectedResult: 'S 10.0.2.0/24 [1/0] via 10.0.12.2 is active.', passCondition: 'primary static active' },
    { id: 'v2', device: 'R1', command: 'show ip route static', expectedResult: 'After shutting Gi0/0, S 10.0.2.0/24 [5/0] via 10.0.13.2 becomes active.', passCondition: 'floating static activates on failover' },
  ],
  failureChecks: [
    { id: 'f1', device: 'R1', command: 'show ip route static', expectedFailure: 'Floating static missing AD or shares AD 1 with the primary', reason: 'Both routes would attempt to install, causing unwanted load-balancing instead of backup-only behavior.' },
  ],
}

const DIAGRAM_STATIC = {
  id: 'DIAG-STATIC-failover',
  title: 'Floating static activates on primary failure',
  type: 'troubleshooting',
  ckuIds: ['CKU-FLOATING-STATIC', 'CKU-STATIC-ROUTE'],
  nodes: [
    { id: 'r1', label: 'R1', type: 'router', x: 15, y: 50 },
    { id: 'primary', label: 'Primary AD 1 — DOWN', type: 'process', x: 50, y: 22, status: 'error' },
    { id: 'backup', label: 'Floating AD 5 — now active', type: 'process', x: 50, y: 78, status: 'highlighted' },
    { id: 'r2', label: 'R2', type: 'router', x: 85, y: 50 },
  ],
  links: [
    { id: 'd1', source: 'r1', target: 'primary', status: 'dropped' }, { id: 'd2', source: 'primary', target: 'r2', status: 'dropped' },
    { id: 'd3', source: 'r1', target: 'backup', status: 'forwarding' }, { id: 'd4', source: 'backup', target: 'r2', status: 'forwarding' },
  ],
  annotations: ['When Gi0/0 (primary) goes down, R1 removes the AD-1 static route.', 'With no competing route, the AD-5 floating static is installed and traffic now flows over the backup link.'],
  sourceRefs: [{ sourceName: LAB_SOURCES.workbook, chapter: 'Floating Static Routes', confidence: 0.9 }],
}

const FLOWS_STATIC = [
  {
    id: 'FLOW-STATIC-normal', title: 'Primary static route preferred', ckuIds: ['CKU-STATIC-ROUTE'], diagramId: 'DIAG-STATIC-failover',
    steps: [
      { id: 's1', order: 1, title: 'Both routes configured', action: 'R1 has a primary static (AD 1) and a floating static (AD 5) to 10.0.2.0/24.', successState: 'learned' },
      { id: 's2', order: 2, title: 'Best AD wins', action: 'The router installs only the lowest-AD route — the primary (AD 1).', successState: 'matched' },
      { id: 's3', order: 3, title: 'Forward', action: 'Traffic to LAN2 is forwarded via 10.0.12.2 (primary).', successState: 'forwarded' },
    ],
  },
  {
    id: 'FLOW-STATIC-failover', title: 'Failover to the floating static', ckuIds: ['CKU-FLOATING-STATIC'], diagramId: 'DIAG-STATIC-failover',
    steps: [
      { id: 's1', order: 1, title: 'Primary link down', action: 'Gi0/0 is shut down (or fails); the AD-1 static route is removed from the table.', successState: 'dropped' },
      { id: 's2', order: 2, title: 'Floating static installed', action: 'With no AD-1 route present, the AD-5 floating static to 10.0.2.0/24 is installed.', successState: 'matched' },
      { id: 's3', order: 3, title: 'Forward via backup', action: 'Traffic to LAN2 now flows via 10.0.13.2 (backup link).', successState: 'forwarded' },
    ],
  },
]

const STATIC = { lab: LAB_STATIC, topology: TOPO_STATIC, validator: VALIDATOR_STATIC, diagram: DIAGRAM_STATIC, packetFlows: FLOWS_STATIC }

/* -------------------------------------------------------------------------
   LAB: Secure Remote Access with SSH
   Maps to Domain 4.0 / Objective 4.8 (configure/verify device access via SSH).
   ------------------------------------------------------------------------- */
const LAB_SSH = {
  id: 'LAB-SSH-ACCESS',
  title: 'Configure SSH for Secure Remote Device Access',
  domainId: 'services',
  objectiveId: '4.8',
  ckuIds: ['CKU-SSH', 'CKU-VTY-ACCESS', 'CKU-LOCAL-AUTH'],
  labType: 'guided',
  difficulty: 'beginner',
  estimatedTimeMinutes: 12,
  tools: ['Packet Tracer', 'GNS3', 'CML'],
  examRelevance: 'core',
  scenario: 'R1 is currently only manageable via the console. You will configure a hostname and domain name (required for RSA key generation), generate an SSH key pair, create a local administrator account, and restrict the VTY lines to SSH-only with local login — then verify an admin PC can SSH in but Telnet is refused.',
  learningGoals: [
    'Explain why a hostname and domain name are prerequisites for `crypto key generate rsa`.',
    'Generate an RSA key pair to enable SSH.',
    'Create a local user account and require local authentication on the VTY lines.',
    'Restrict VTY access to SSH only (`transport input ssh`).',
  ],
  topologyId: 'TOPO-SSH',
  prerequisites: ['CKU-ROUTING-TABLE'],

  tasks: [
    { id: 't1', order: 1, title: 'Hostname and domain', device: 'R1', instruction: 'Set the hostname to R1 and the domain name to ccna.local (required before generating RSA keys).',
      expectedCommands: ['hostname R1', 'ip domain-name ccna.local'] },
    { id: 't2', order: 2, title: 'Generate RSA keys', device: 'R1', instruction: 'Generate a 1024-bit RSA key pair, which automatically enables SSH.',
      expectedCommands: ['crypto key generate rsa'] },
    { id: 't3', order: 3, title: 'Local admin account', device: 'R1', instruction: 'Create a local user "admin" with privilege level 15 and a secret password.',
      expectedCommands: ['username admin privilege 15 secret', 'enable secret'] },
    { id: 't4', order: 4, title: 'Restrict VTY to SSH', device: 'R1', instruction: 'On the VTY lines (0 4), require local login and restrict the transport protocol to SSH only.',
      expectedCommands: ['line vty 0 4', 'login local', 'transport input ssh'] },
    { id: 't5', order: 5, title: 'Verify from the admin PC', device: 'PC1', instruction: 'SSH to R1 using the admin account, and confirm Telnet is refused.',
      expectedCommands: ['ssh -l admin 192.168.1.1'] },
  ],

  verificationCommands: [
    'show ip ssh',
    'show running-config | section line vty',
    'show users',
  ],
  successCriteria: [
    'show ip ssh shows SSH enabled (version 1.99 or 2) with an active RSA key.',
    'PC1 can SSH to R1 and authenticate with the local admin account.',
    'Attempting Telnet to R1 from PC1 is refused (transport input ssh only).',
    'show running-config | section line vty shows `login local` and `transport input ssh`.',
  ],
  failureCriteria: [
    'No domain name set before `crypto key generate rsa` → the command is rejected (no keys generated, SSH stays disabled).',
    'VTY lines left at `login` (no `local`) with no password set → access denied or "password required but none set" error.',
    '`transport input` left at default (all/telnet) → Telnet still works, defeating the purpose.',
    'Local user created without `privilege 15` → user can log in but cannot reach privileged EXEC without the enable secret.',
  ],
  commonMistakes: [
    'Forgetting `ip domain-name` before generating RSA keys — the crypto command silently fails without it.',
    'Using `login` instead of `login local` on the VTY lines — `login` alone expects a line password, not a username/password.',
    'Leaving `transport input telnet ssh` (the default) instead of restricting to `ssh` only.',
    'Setting the user password with `password` instead of `secret` — `secret` is hashed, `password` is reversible.',
  ],
  source: { name: LAB_SOURCES.workbook, chapter: 'Securing Remote Access with SSH', confidence: 0.95 },
  metadata: { version: '1', status: 'validated', confidence: 0.95 },
}

const TOPO_SSH = {
  id: 'TOPO-SSH',
  title: 'SSH management topology',
  objectiveId: '4.8',
  nodes: [
    { id: 'pc1', label: 'Admin PC 192.168.1.10', type: 'pc', x: 12, y: 50 },
    { id: 'r1', label: 'R1 192.168.1.1 — SSH only', type: 'router', x: 60, y: 50, status: 'highlighted' },
  ],
  links: [
    { id: 'k1', source: 'pc1', target: 'r1', label: 'SSH (TCP/22) allowed, Telnet (TCP/23) refused', status: 'forwarding' },
  ],
  notes: ['VTY 0 4 configured with `login local` + `transport input ssh`.'],
}

const VALIDATOR_SSH = {
  labId: 'LAB-SSH-ACCESS',
  requiredCommands: [
    { device: 'R1', command: 'hostname R1' },
    { device: 'R1', command: 'ip domain-name ccna.local' },
    { device: 'R1', command: 'crypto key generate rsa' },
    { device: 'R1', command: 'username admin privilege 15 secret' },
    { device: 'R1', command: 'line vty 0 4' },
    { device: 'R1', command: 'login local' },
    { device: 'R1', command: 'transport input ssh' },
  ],
  verificationChecks: [
    { id: 'v1', device: 'R1', command: 'show ip ssh', expectedResult: 'SSH enabled, RSA key present.', passCondition: 'ssh enabled' },
    { id: 'v2', device: 'PC1', command: 'ssh -l admin 192.168.1.1', expectedResult: 'SSH session opens, prompts for the admin secret.', passCondition: 'ssh connects' },
  ],
  failureChecks: [
    { id: 'f1', device: 'PC1', command: 'telnet 192.168.1.1', expectedFailure: 'Connection refused', reason: '`transport input ssh` removes Telnet access on the VTY lines.' },
  ],
}

const DIAGRAM_SSH = {
  id: 'DIAG-SSH-vty',
  title: 'SSH allowed, Telnet refused on VTY',
  type: 'process',
  ckuIds: ['CKU-SSH', 'CKU-VTY-ACCESS'],
  nodes: [
    { id: 'pc1', label: 'Admin PC', type: 'pc', x: 12, y: 50 },
    { id: 'ssh', label: 'SSH TCP/22 -> allowed', type: 'process', x: 50, y: 25, status: 'highlighted' },
    { id: 'telnet', label: 'Telnet TCP/23 -> refused', type: 'process', x: 50, y: 75, status: 'error' },
    { id: 'r1', label: 'R1 VTY 0 4', type: 'router', x: 85, y: 50 },
  ],
  links: [
    { id: 'd1', source: 'pc1', target: 'ssh', status: 'forwarding' }, { id: 'd2', source: 'ssh', target: 'r1', status: 'forwarding' },
    { id: 'd3', source: 'pc1', target: 'telnet', status: 'dropped' }, { id: 'd4', source: 'telnet', target: 'r1', status: 'dropped' },
  ],
  annotations: ['`transport input ssh` on VTY 0 4 permits only SSH.', '`login local` requires the locally configured username/secret.'],
  sourceRefs: [{ sourceName: LAB_SOURCES.workbook, chapter: 'SSH Access', confidence: 0.9 }],
}

const FLOWS_SSH = [
  {
    id: 'FLOW-SSH-connect', title: 'Admin connects via SSH', ckuIds: ['CKU-SSH', 'CKU-LOCAL-AUTH'], diagramId: 'DIAG-SSH-vty',
    steps: [
      { id: 's1', order: 1, title: 'SSH request', action: 'PC1 opens an SSH session to R1 on TCP/22.', successState: 'forwarded' },
      { id: 's2', order: 2, title: 'VTY accepts', action: 'VTY 0 4 has `transport input ssh` — the SSH session is accepted.', successState: 'matched' },
      { id: 's3', order: 3, title: 'Local login', action: '`login local` prompts for the admin username/secret and authenticates against the local database.', successState: 'matched' },
      { id: 's4', order: 4, title: 'Privileged access', action: 'Because admin has privilege 15, the session starts in privileged EXEC.', successState: 'forwarded' },
    ],
  },
  {
    id: 'FLOW-SSH-telnet-blocked', title: 'Telnet attempt is refused', ckuIds: ['CKU-VTY-ACCESS'], diagramId: 'DIAG-SSH-vty',
    steps: [
      { id: 's1', order: 1, title: 'Telnet request', action: 'PC1 attempts a Telnet session to R1 on TCP/23.', successState: 'failed' },
      { id: 's2', order: 2, title: 'Transport check', action: 'VTY 0 4 only allows `transport input ssh` — Telnet (TCP/23) is not permitted.', successState: 'dropped' },
      { id: 's3', order: 3, title: 'Connection refused', action: 'The router refuses the Telnet connection.', successState: 'dropped' },
    ],
  },
]

const SSH = { lab: LAB_SSH, topology: TOPO_SSH, validator: VALIDATOR_SSH, diagram: DIAGRAM_SSH, packetFlows: FLOWS_SSH }

/* -------------------------------------------------------------------------
   LAB: Standard and Extended ACL Configuration
   Maps to Domain 5.0 / Objective 5.5 (Access Control Lists).
   ------------------------------------------------------------------------- */
const LAB_ACL_DEF = {
  id: 'LAB-ACL-CONFIG',
  title: 'Configure Standard and Extended ACLs',
  domainId: 'security',
  objectiveId: '5.5',
  ckuIds: ['CKU-STANDARD-ACL', 'CKU-EXTENDED-ACL', 'CKU-WILDCARD-MASK', 'CKU-ACL-PLACEMENT'],
  labType: 'guided',
  difficulty: 'intermediate',
  estimatedTimeMinutes: 20,
  tools: ['Packet Tracer', 'GNS3', 'CML'],
  examRelevance: 'core',
  scenario: 'R1 connects an office subnet (192.168.1.0/24) to a server zone (10.0.0.0/24) and the internet. Configure a standard numbered ACL to block one host from the internet, then an extended named ACL to permit HTTP/HTTPS from the office to the servers while blocking all other office-to-server traffic.',
  learningGoals: [
    'Configure a standard numbered ACL and apply it close to the destination.',
    'Configure an extended named ACL and apply it close to the source.',
    'Understand wildcard masks and the implicit deny at the end of every ACL.',
    'Verify with show access-lists and show ip interface.',
  ],
  topologyId: 'TOPO-ACL',
  prerequisites: ['CKU-IP-ADDRESSING', 'CKU-WILDCARD-MASK'],
  tasks: [
    { id: 't1', order: 1, title: 'Configure interfaces', device: 'R1',
      instruction: 'Configure R1 Gi0/0 as 192.168.1.1/24 (office) and Gi0/1 as 10.0.0.1/24 (server zone). Bring both interfaces up.',
      expectedCommands: ['interface gi0/0', 'ip address 192.168.1.1 255.255.255.0', 'no shutdown', 'interface gi0/1', 'ip address 10.0.0.1 255.255.255.0', 'no shutdown'] },
    { id: 't2', order: 2, title: 'Standard ACL — block host 192.168.1.50 outbound', device: 'R1',
      instruction: 'Create standard ACL 10: deny 192.168.1.50, then permit 192.168.1.0/24. Apply OUTBOUND on Gi0/2 (internet-facing).',
      expectedCommands: ['access-list 10 deny host 192.168.1.50', 'access-list 10 permit 192.168.1.0 0.0.0.255', 'interface gi0/2', 'ip access-group 10 out'] },
    { id: 't3', order: 3, title: 'Named extended ACL', device: 'R1',
      instruction: 'Create named extended ACL OFFICE_TO_SERVERS: permit TCP from 192.168.1.0/24 to 10.0.0.0/24 on ports 80 and 443; deny ip from office to servers. Apply INBOUND on Gi0/0.',
      expectedCommands: ['ip access-list extended OFFICE_TO_SERVERS', 'permit tcp 192.168.1.0 0.0.0.255 10.0.0.0 0.0.0.255 eq 80', 'permit tcp 192.168.1.0 0.0.0.255 10.0.0.0 0.0.0.255 eq 443', 'deny ip 192.168.1.0 0.0.0.255 10.0.0.0 0.0.0.255', 'interface gi0/0', 'ip access-group OFFICE_TO_SERVERS in'] },
    { id: 't4', order: 4, title: 'Verify ACLs', device: 'R1',
      instruction: 'Verify both ACLs are configured and show hit counts.',
      expectedCommands: ['show access-lists', 'show ip interface gi0/0', 'show ip interface gi0/2'] },
  ],
  verificationCommands: ['show access-lists', 'show ip interface gi0/0', 'show ip interface gi0/2', 'show running-config | section access-list'],
  successCriteria: [
    'ACL 10 blocks only 192.168.1.50 from reaching the internet.',
    'Other 192.168.1.0/24 hosts can reach the internet.',
    'OFFICE_TO_SERVERS permits port 80 and 443 from office to servers.',
    'Non-HTTP/HTTPS traffic from office is blocked from server zone.',
    'show access-lists shows match counters incrementing on the correct entries.',
  ],
  failureCriteria: [
    'Standard ACL on Gi0/0 inbound — blocks more traffic than intended.',
    'Missing permit after deny — implicit deny drops all remaining traffic.',
    'Subnet mask used instead of wildcard mask — ACL matches wrong addresses.',
    'ACL applied on wrong interface or wrong direction.',
  ],
  commonMistakes: [
    'Confusing subnet mask with wildcard mask — wildcard is bitwise inverse (255 - mask octet).',
    'Placing standard ACL close to source — standard ACLs should go close to destination.',
    'Forgetting explicit permit after deny — implicit deny at end drops everything else.',
    'Wrong port keyword — eq 80=HTTP, eq 443=HTTPS, eq 23=Telnet, eq 22=SSH.',
  ],
  source: { name: LAB_SOURCES.blueprint, chapter: '5.5 Access Control Lists', confidence: 0.95 },
  metadata: { version: '1', status: 'validated', confidence: 0.95 },
}
const TOPO_ACL = {
  id: 'TOPO-ACL', title: 'ACL Lab topology', objectiveId: '5.5',
  nodes: [
    { id: 'pc1', label: 'Office PC .10', type: 'pc', x: 12, y: 25 },
    { id: 'blocked', label: 'Blocked PC .50', type: 'attacker', x: 12, y: 75 },
    { id: 'r1', label: 'R1', type: 'router', x: 50, y: 50 },
    { id: 'srv', label: 'Server 10.0.0.10', type: 'server', x: 80, y: 30 },
    { id: 'inet', label: 'Internet (Gi0/2)', type: 'cloud', x: 80, y: 70 },
  ],
  links: [
    { id: 'l1', source: 'pc1', target: 'r1', label: 'Gi0/0 OFFICE_TO_SERVERS in', status: 'forwarding' },
    { id: 'l2', source: 'blocked', target: 'r1', label: '', status: 'dropped' },
    { id: 'l3', source: 'r1', target: 'srv', label: 'Gi0/1 port 80/443 only', status: 'forwarding' },
    { id: 'l4', source: 'r1', target: 'inet', label: 'Gi0/2 ACL 10 out', status: 'forwarding' },
  ],
  annotations: ['ACL 10 blocks .50 outbound Gi0/2', 'OFFICE_TO_SERVERS on Gi0/0 inbound'],
}
const VALIDATOR_ACL = {
  labId: 'LAB-ACL-CONFIG',
  requiredCommands: [
    { device: 'R1', command: 'access-list 10 deny host 192.168.1.50' },
    { device: 'R1', command: 'access-list 10 permit 192.168.1.0 0.0.0.255' },
    { device: 'R1', command: 'ip access-group 10 out' },
    { device: 'R1', command: 'ip access-list extended OFFICE_TO_SERVERS' },
    { device: 'R1', command: 'permit tcp 192.168.1.0 0.0.0.255 10.0.0.0 0.0.0.255 eq 80' },
    { device: 'R1', command: 'permit tcp 192.168.1.0 0.0.0.255 10.0.0.0 0.0.0.255 eq 443' },
    { device: 'R1', command: 'ip access-group OFFICE_TO_SERVERS in' },
  ],
  verificationChecks: [
    { id: 'v1', device: 'R1', command: 'show access-lists', expectedResult: 'Both ACL 10 and OFFICE_TO_SERVERS listed with rules.', passCondition: 'access-list 10' },
    { id: 'v2', device: 'R1', command: 'show ip interface gi0/0', expectedResult: 'Inbound access list is OFFICE_TO_SERVERS.', passCondition: 'OFFICE_TO_SERVERS' },
  ],
  failureChecks: [
    { id: 'f1', device: 'PC1', command: 'telnet 10.0.0.10', expectedFailure: 'Connection refused', reason: 'Telnet (TCP/23) is not in the permitted ports in OFFICE_TO_SERVERS.' },
  ],
}
const DIAGRAM_ACL = {
  id: 'DIAG-ACL-placement', title: 'Standard vs Extended ACL Placement',
  type: 'process',
  ckuIds: ['CKU-STANDARD-ACL', 'CKU-EXTENDED-ACL'],
  nodes: [
    { id: 'src', label: 'Source (192.168.1.0/24)', type: 'pc', x: 10, y: 50 },
    { id: 'r1', label: 'R1', type: 'router', x: 50, y: 50 },
    { id: 'dst', label: 'Destination (10.0.0.0/24)', type: 'server', x: 90, y: 50 },
    { id: 'stdacl', label: 'Standard ACL near destination', type: 'process', x: 70, y: 25, status: 'highlighted' },
    { id: 'extacl', label: 'Extended ACL near source', type: 'process', x: 30, y: 75, status: 'highlighted' },
  ],
  links: [
    { id: 'd1', source: 'src', target: 'r1', status: 'forwarding' },
    { id: 'd2', source: 'r1', target: 'dst', status: 'forwarding' },
    { id: 'd3', source: 'stdacl', target: 'r1', label: 'applied inbound Gi0/1' },
    { id: 'd4', source: 'extacl', target: 'r1', label: 'applied inbound Gi0/0' },
  ],
  annotations: ['Standard ACL: source IP only — place near DESTINATION to avoid over-blocking', 'Extended ACL: src+dst+protocol+port — place near SOURCE to save bandwidth'],
  sourceRefs: [{ sourceName: LAB_SOURCES.blueprint, chapter: '5.5', confidence: 1 }],
}
const FLOWS_ACL = [
  {
    id: 'FLOW-ACL-http', title: 'HTTP traffic from office to server', ckuIds: ['CKU-EXTENDED-ACL'], diagramId: 'DIAG-ACL-placement',
    steps: [
      { id: 's1', order: 1, title: 'Packet arrives Gi0/0', action: 'PC sends HTTP request to 10.0.0.10. Packet arrives inbound on R1 Gi0/0.', successState: 'matched' },
      { id: 's2', order: 2, title: 'ACL checked', action: 'OFFICE_TO_SERVERS inbound. First matching rule: permit tcp ... eq 80. Match!', successState: 'matched' },
      { id: 's3', order: 3, title: 'Forwarded', action: 'Packet is permitted and forwarded out Gi0/1 to the server.', successState: 'forwarded' },
    ],
  },
]
const ACL = { lab: LAB_ACL_DEF, topology: TOPO_ACL, validator: VALIDATOR_ACL, diagram: DIAGRAM_ACL, packetFlows: FLOWS_ACL }

/* -------------------------------------------------------------------------
   LAB: IPv4 Subnetting and Router Interface Configuration
   Maps to Domain 1.0 / Objective 1.6 (IPv4 addressing and subnetting).
   ------------------------------------------------------------------------- */
const LAB_SUBNET_DEF = {
  id: 'LAB-IPV4-SUBNETTING',
  title: 'Subnet a Network and Configure Router Interfaces',
  domainId: 'fundamentals',
  objectiveId: '1.6',
  ckuIds: ['CKU-SUBNETTING', 'CKU-IP-ADDRESSING', 'CKU-CIDR'],
  labType: 'guided',
  difficulty: 'intermediate',
  estimatedTimeMinutes: 15,
  tools: ['Packet Tracer', 'GNS3', 'CML'],
  examRelevance: 'core',
  scenario: 'You have 192.168.10.0/24. Divide it: Subnet A needs 50 hosts (/26), Subnet B needs 30 hosts (/27). Assign the first usable address of each subnet to the router. Configure router-on-a-stick (subinterfaces) so hosts in both subnets can communicate through R1.',
  learningGoals: [
    'Calculate subnets using 2^n-2 >= required hosts.',
    'Assign network/broadcast/usable range for each subnet.',
    'Configure subinterfaces with dot1q encapsulation.',
    'Verify connectivity with ping across subnets.',
  ],
  topologyId: 'TOPO-SUBNET',
  prerequisites: ['CKU-BINARY-MATH', 'CKU-CIDR'],
  tasks: [
    { id: 't1', order: 1, title: 'Design subnets', device: 'Paper/notes',
      instruction: 'Using 192.168.10.0/24, design: Subnet A = /26 (64 addresses, 62 usable, .0-.63), Subnet B = /27 (32 addresses, 30 usable, .64-.95). Write down network address, mask, broadcast, and usable range for each.',
      expectedCommands: [] },
    { id: 't2', order: 2, title: 'Configure Gi0/0.10 for Subnet A', device: 'R1',
      instruction: 'Configure subinterface Gi0/0.10 with encapsulation dot1q VLAN 10 and 192.168.10.1/26.',
      expectedCommands: ['interface gi0/0.10', 'encapsulation dot1q 10', 'ip address 192.168.10.1 255.255.255.192'] },
    { id: 't3', order: 3, title: 'Configure Gi0/0.20 for Subnet B', device: 'R1',
      instruction: 'Configure subinterface Gi0/0.20 with encapsulation dot1q VLAN 20 and 192.168.10.65/27.',
      expectedCommands: ['interface gi0/0.20', 'encapsulation dot1q 20', 'ip address 192.168.10.65 255.255.255.224'] },
    { id: 't4', order: 4, title: 'Configure trunk on SW1', device: 'SW1',
      instruction: 'Set the port connecting to R1 as a trunk to allow VLANs 10 and 20.',
      expectedCommands: ['interface gi0/0', 'switchport mode trunk', 'switchport trunk allowed vlan 10,20'] },
    { id: 't5', order: 5, title: 'Verify', device: 'R1',
      instruction: 'Check the routing table for connected routes and test ping from Subnet A to Subnet B.',
      expectedCommands: ['show ip route', 'show ip interface brief'] },
  ],
  verificationCommands: ['show ip route', 'show ip interface brief', 'show interfaces gi0/0.10', 'show interfaces gi0/0.20'],
  successCriteria: [
    'Connected routes for both subnets in show ip route.',
    'Gi0/0.10 and Gi0/0.20 are up/up in show ip interface brief.',
    'A PC in Subnet A can ping a PC in Subnet B.',
    'Subnet A (/26): 192.168.10.0-192.168.10.63, usable .1-.62.',
    'Subnet B (/27): 192.168.10.64-192.168.10.95, usable .65-.94.',
  ],
  failureCriteria: [
    'Subinterface down — parent Gi0/0 may need no shutdown.',
    'Wrong encapsulation VLAN — must match VLAN on the switch port.',
    'Miscalculated subnet — wrong mask size leads to overlap.',
    'Trunk not configured on switch — subinterfaces drop tagged traffic.',
  ],
  commonMistakes: [
    'Forgetting to bring up the parent Gi0/0 — subinterfaces require the parent to be up.',
    'Using the network address instead of the first usable address on the router interface.',
    'Confusing /26 (64 addresses, 62 hosts) with /27 (32 addresses, 30 hosts).',
    'Forgetting encapsulation dot1q on the subinterface — required for router-on-a-stick.',
  ],
  source: { name: LAB_SOURCES.workbook, chapter: 'IPv4 Subnetting', confidence: 0.9 },
  metadata: { version: '1', status: 'validated', confidence: 0.9 },
}
const TOPO_SUBNET = {
  id: 'TOPO-SUBNET', title: 'Router-on-a-stick subnetting topology', objectiveId: '1.6',
  nodes: [
    { id: 'r1', label: 'R1 (router-on-a-stick)', type: 'router', x: 50, y: 10 },
    { id: 'sw1', label: 'SW1 (trunk)', type: 'switch', x: 50, y: 50 },
    { id: 'pc1', label: 'VLAN 10 PC (.1-.62)', type: 'pc', x: 20, y: 85 },
    { id: 'pc2', label: 'VLAN 20 PC (.65-.94)', type: 'pc', x: 80, y: 85 },
  ],
  links: [
    { id: 'l1', source: 'r1', target: 'sw1', label: 'Trunk Gi0/0', status: 'forwarding' },
    { id: 'l2', source: 'sw1', target: 'pc1', label: 'VLAN 10', status: 'forwarding' },
    { id: 'l3', source: 'sw1', target: 'pc2', label: 'VLAN 20', status: 'forwarding' },
  ],
  annotations: ['Gi0/0.10 192.168.10.1/26 (VLAN 10)', 'Gi0/0.20 192.168.10.65/27 (VLAN 20)'],
}
const VALIDATOR_SUBNET = {
  labId: 'LAB-IPV4-SUBNETTING',
  requiredCommands: [
    { device: 'R1', command: 'interface gi0/0.10' },
    { device: 'R1', command: 'encapsulation dot1q 10' },
    { device: 'R1', command: 'ip address 192.168.10.1 255.255.255.192' },
    { device: 'R1', command: 'interface gi0/0.20' },
    { device: 'R1', command: 'encapsulation dot1q 20' },
    { device: 'R1', command: 'ip address 192.168.10.65 255.255.255.224' },
    { device: 'SW1', command: 'switchport mode trunk' },
  ],
  verificationChecks: [
    { id: 'v1', device: 'R1', command: 'show ip route', expectedResult: 'Connected routes for 192.168.10.0/26 and 192.168.10.64/27.', passCondition: '192.168.10' },
    { id: 'v2', device: 'R1', command: 'show ip interface brief', expectedResult: 'Gi0/0.10 and Gi0/0.20 both up/up.', passCondition: 'up' },
  ],
  failureChecks: [
    { id: 'f1', device: 'R1', command: 'show interfaces gi0/0.10', expectedFailure: 'Encapsulation not set', reason: 'Missing encapsulation dot1q command on the subinterface.' },
  ],
}
const DIAGRAM_SUBNET = {
  id: 'DIAG-subnet-layout', title: 'Subnetting 192.168.10.0/24 into /26 and /27',
  type: 'table',
  ckuIds: ['CKU-SUBNETTING', 'CKU-CIDR'],
  nodes: [
    { id: 'block', label: '192.168.10.0/24 (256 addresses)', type: 'highlight', x: 50, y: 10 },
    { id: 's1', label: '/26: .0-.63 (62 hosts)', type: 'process', x: 20, y: 55, note: 'Sales VLAN 10' },
    { id: 's2', label: '/27: .64-.95 (30 hosts)', type: 'process', x: 55, y: 55, note: 'HR VLAN 20' },
    { id: 's3', label: '/30: .96-.99 (2 hosts)', type: 'process', x: 83, y: 55, note: 'P2P link' },
  ],
  links: [
    { id: 'l1', source: 'block', target: 's1', label: '' },
    { id: 'l2', source: 'block', target: 's2', label: '' },
    { id: 'l3', source: 'block', target: 's3', label: '' },
  ],
  annotations: ['/26: 64 addresses, 62 usable. /27: 32 addresses, 30 usable. /30: 4 addresses, 2 usable.'],
  sourceRefs: [{ sourceName: LAB_SOURCES.workbook, chapter: 'IPv4 Subnetting', confidence: 0.9 }],
}
const FLOWS_SUBNET = [
  {
    id: 'FLOW-SUBNET-routing', title: 'PC in VLAN 10 pings PC in VLAN 20', ckuIds: ['CKU-SUBNETTING'], diagramId: 'DIAG-subnet-layout',
    steps: [
      { id: 's1', order: 1, title: 'PC1 sends packet', action: 'PC1 (192.168.10.2/26) sends to 192.168.10.70. Default gateway is 192.168.10.1.', successState: 'forwarded' },
      { id: 's2', order: 2, title: 'SW1 trunks the frame', action: 'SW1 tags the frame VLAN 10 and sends up the trunk to R1 Gi0/0.10.', successState: 'forwarded' },
      { id: 's3', order: 3, title: 'Router routes between VLANs', action: 'R1 receives on Gi0/0.10, routes to 192.168.10.64/27, forwards out Gi0/0.20 tagged VLAN 20.', successState: 'forwarded' },
      { id: 's4', order: 4, title: 'Delivered to PC2', action: 'SW1 strips the VLAN 20 tag and delivers to PC2 (192.168.10.70).', successState: 'forwarded' },
    ],
  },
]
const SUBNET_LAB = { lab: LAB_SUBNET_DEF, topology: TOPO_SUBNET, validator: VALIDATOR_SUBNET, diagram: DIAGRAM_SUBNET, packetFlows: FLOWS_SUBNET }

/* -------------------------------------------------------------------------
   REGISTRY + LOADERS
   ------------------------------------------------------------------------- */
const CORE_LABS = { [DAI.lab.id]: DAI, [VLAN_TRUNK.lab.id]: VLAN_TRUNK, [OSPF.lab.id]: OSPF, [NAT.lab.id]: NAT, [STATIC.lab.id]: STATIC, [SSH.lab.id]: SSH, [ACL.lab.id]: ACL, [SUBNET_LAB.lab.id]: SUBNET_LAB }
const LABS = {
  ...CORE_LABS,
  ...Object.fromEntries(EXTENDED_LAB_BUNDLES.map(b => [b.lab.id, b])),
  ...Object.fromEntries(PHASE_LAB_BUNDLES.map(b => [b.lab.id, b])),
}

export const allLabs = () => Object.values(LABS).map(x => x.lab)
export function getLab(labId) { return LABS[labId] || null }
export function labsForObjective(objectiveId) { return Object.values(LABS).filter(x => x.lab.objectiveId === objectiveId).map(x => x.lab) }
export const troubleshootingLabs = () => allLabs().filter(l => l.labType === 'troubleshooting')
export const guidedLabs = () => allLabs().filter(l => l.labType !== 'troubleshooting')
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
