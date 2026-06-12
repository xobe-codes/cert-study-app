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
   REGISTRY + LOADERS
   ------------------------------------------------------------------------- */
const LABS = { [DAI.lab.id]: DAI }

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
