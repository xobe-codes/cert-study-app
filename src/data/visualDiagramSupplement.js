/**
 * Curated visual diagrams + Domain 6 packs + Domains 1–5 pack merges.
 */
import { DIAGRAMS as D1, COMPARE as C1, TRAPS as T1, FLOWS as F1 } from './visualPacks/domain1Fundamentals.js'
import { DIAGRAMS as D2, COMPARE as C2, TRAPS as T2, FLOWS as F2 } from './visualPacks/domain2Access.js'
import { DIAGRAMS as D3, COMPARE as C3, TRAPS as T3, FLOWS as F3 } from './visualPacks/domain3Connectivity.js'
import { DIAGRAMS as D4, COMPARE as C4, TRAPS as T4, FLOWS as F4 } from './visualPacks/domain4Services.js'
import { DIAGRAMS as D5, COMPARE as C5, TRAPS as T5, FLOWS as F5 } from './visualPacks/domain5Security.js'
import { SRC, topo, flow } from './visualPacks/packHelpers.js'
import { ALL_OBJECTIVES } from './ccnaDomains.js'

const SRC_FLOW = SRC

/** Domain 6 — gold-standard packs (kept inline for continuity). */
const D6_DIAGRAMS = {
  '6.1': topo('DIAG-6.1-auto', 'Automation ops loop', [
    { id: 'intent', label: 'Intent / change', type: 'process', x: 15, y: 30 },
    { id: 'auto', label: 'Automation (API/script)', shortLabel: 'Auto', type: 'process', x: 45, y: 30, status: 'highlighted' },
    { id: 'dev', label: 'Devices', type: 'switch', x: 75, y: 30 },
    { id: 'verify', label: 'Verify / audit', type: 'server', x: 45, y: 70, status: 'highlighted' },
    { id: 'cli', label: 'One-off CLI', type: 'pc', x: 15, y: 70, status: 'dropped' },
  ], [
    { id: 'l1', source: 'intent', target: 'auto', label: 'encode once' },
    { id: 'l2', source: 'auto', target: 'dev', label: 'push / API' },
    { id: 'l3', source: 'dev', target: 'verify', label: 'state check' },
    { id: 'l4', source: 'verify', target: 'auto', label: 'remediate' },
    { id: 'l5', source: 'cli', target: 'dev', label: 'snowflake risk', status: 'dropped' },
  ], ['Automation = consistent, repeatable, auditable changes', 'Trap: automation does not remove the need to verify']),

  '6.2': topo('DIAG-6.2-sdn', 'Traditional vs controller-based', [
    { id: 'eng', label: 'Engineer', type: 'pc', x: 12, y: 25 },
    { id: 'swA', label: 'SW-A CLI', shortLabel: 'SW-A', type: 'switch', x: 35, y: 25 },
    { id: 'swB', label: 'SW-B CLI', shortLabel: 'SW-B', type: 'switch', x: 58, y: 25 },
    { id: 'swC', label: 'SW-C CLI', shortLabel: 'SW-C', type: 'switch', x: 81, y: 25 },
    { id: 'ctrl', label: 'Controller', type: 'server', x: 50, y: 60, status: 'highlighted' },
    { id: 'fab1', label: 'SW1', shortLabel: 'SW1', type: 'switch', x: 28, y: 85 },
    { id: 'fab2', label: 'SW2', shortLabel: 'SW2', type: 'switch', x: 50, y: 85 },
    { id: 'fab3', label: 'SW3', shortLabel: 'SW3', type: 'switch', x: 72, y: 85 },
  ], [
    { id: 't1', source: 'eng', target: 'swA', label: 'per-box' },
    { id: 't2', source: 'eng', target: 'swB', label: 'per-box' },
    { id: 't3', source: 'eng', target: 'swC', label: 'per-box' },
    { id: 'c1', source: 'ctrl', target: 'fab1', label: 'policy' },
    { id: 'c2', source: 'ctrl', target: 'fab2', label: 'policy' },
    { id: 'c3', source: 'ctrl', target: 'fab3', label: 'policy' },
    { id: 'd1', source: 'fab1', target: 'fab2', label: 'data plane', status: 'forwarding' },
  ], ['Traditional: control plane on each device; controller-based: centralized policy', 'Trap: data plane still forwards on the devices — SDN does not remove forwarding']),

  '6.3': topo('DIAG-6.3-sdn-api', 'SDN architecture planes', [
    { id: 'app', label: 'Apps / orchestration', shortLabel: 'Apps', type: 'pc', x: 50, y: 12 },
    { id: 'nbi', label: 'Northbound API (REST)', shortLabel: 'NBI', type: 'process', x: 50, y: 32, status: 'highlighted' },
    { id: 'ctrl', label: 'SDN Controller', type: 'server', x: 50, y: 52, status: 'highlighted' },
    { id: 'sbi', label: 'Southbound (NETCONF/OF)', shortLabel: 'SBI', type: 'process', x: 50, y: 72 },
    { id: 'dev', label: 'Network devices', type: 'router', x: 50, y: 90 },
  ], [
    { id: 'l1', source: 'app', target: 'nbi', label: 'intent' },
    { id: 'l2', source: 'nbi', target: 'ctrl', label: '' },
    { id: 'l3', source: 'ctrl', target: 'sbi', label: 'program' },
    { id: 'l4', source: 'sbi', target: 'dev', label: 'config / flows' },
  ], ['NBI = apps→controller; SBI = controller→devices', 'Trap: confusing northbound with southbound on the exam']),

  '6.4': topo('DIAG-6.4-dna', 'Cisco DNA Center closed loop', [
    { id: 'design', label: 'Design', type: 'process', x: 18, y: 30 },
    { id: 'policy', label: 'Policy', type: 'process', x: 40, y: 18, status: 'highlighted' },
    { id: 'prov', label: 'Provision', type: 'process', x: 62, y: 18 },
    { id: 'assure', label: 'Assurance', type: 'server', x: 82, y: 35, status: 'highlighted' },
    { id: 'campus', label: 'Campus fabric', type: 'switch', x: 50, y: 70 },
    { id: 'nms', label: 'Legacy NMS/CLI', type: 'pc', x: 18, y: 70, status: 'dropped' },
  ], [
    { id: 'l1', source: 'design', target: 'policy', label: '' },
    { id: 'l2', source: 'policy', target: 'prov', label: 'intent' },
    { id: 'l3', source: 'prov', target: 'campus', label: 'push' },
    { id: 'l4', source: 'campus', target: 'assure', label: 'telemetry' },
    { id: 'l5', source: 'assure', target: 'policy', label: 'remediate' },
    { id: 'l6', source: 'nms', target: 'campus', label: 'poll / hop', status: 'dropped' },
  ], ['DNA Center: design → policy → provision → assurance (closed loop)', 'Trap: DNA Center is not “just another SNMP NMS” — it drives intent + assurance']),

  '6.5': topo('DIAG-6.5-rest', 'REST API request anatomy', [
    { id: 'client', label: 'API client', type: 'pc', x: 12, y: 50 },
    { id: 'method', label: 'GET/POST…', shortLabel: 'Verb', type: 'highlight', x: 32, y: 35, status: 'highlighted' },
    { id: 'uri', label: '/api/v1/…', shortLabel: 'URI', type: 'process', x: 52, y: 35 },
    { id: 'hdr', label: 'Headers + auth', shortLabel: 'Hdr', type: 'process', x: 42, y: 65 },
    { id: 'body', label: 'JSON body', shortLabel: 'Body', type: 'process', x: 62, y: 65 },
    { id: 'api', label: 'REST API', type: 'server', x: 85, y: 50, status: 'highlighted' },
  ], [
    { id: 'l1', source: 'client', target: 'method', label: '' },
    { id: 'l2', source: 'method', target: 'uri', label: 'resource' },
    { id: 'l3', source: 'client', target: 'hdr', label: '' },
    { id: 'l4', source: 'uri', target: 'api', label: 'HTTPS' },
    { id: 'l5', source: 'body', target: 'api', label: 'POST/PUT' },
    { id: 'l6', source: 'api', target: 'client', label: '2xx / 4xx', status: 'forwarding' },
  ], ['REST: client–server, stateless, resource URI, HTTP verbs, JSON common', 'Trap: GET should not change state; POST creates; PUT/PATCH update']),

  '6.6': topo('DIAG-6.6-json-cm', 'JSON + config management path', [
    { id: 'json', label: '{ "vlan": 10 }', shortLabel: 'JSON', type: 'process', x: 18, y: 35, status: 'highlighted' },
    { id: 'tool', label: 'Ansible / Puppet / Chef', shortLabel: 'CM', type: 'server', x: 50, y: 35, status: 'highlighted' },
    { id: 'inv', label: 'Inventory', type: 'process', x: 50, y: 65 },
    { id: 'dev', label: 'Network devices', type: 'router', x: 82, y: 50 },
  ], [
    { id: 'l1', source: 'json', target: 'tool', label: 'data model' },
    { id: 'l2', source: 'inv', target: 'tool', label: 'targets' },
    { id: 'l3', source: 'tool', target: 'dev', label: 'push / agent' },
  ], ['JSON = objects/arrays/types for APIs and templates', 'Trap: Ansible is typically agentless (SSH/API); Puppet/Chef often agent-based']),
}

const D6_COMPARE = {
  '6.1': { type: 'comparison', title: 'Manual CLI vs automation', left: { label: 'Manual CLI', points: ['Per-device typing — slow at scale', 'Easy to create snowflake configs', 'Hard to audit “what changed”', 'Human error on every box'] }, right: { label: 'Automation', points: ['Encode once → apply many', 'Consistent templates / IaC', 'Versioned + reviewable changes', 'Still must verify after push'] } },
  '6.2': { type: 'comparison', title: 'Traditional vs controller-based', left: { label: 'Traditional', points: ['Control plane on each device', 'Engineer configures box-by-box', 'Policy drift across campus', 'Troubleshooting is per-hop CLI'] }, right: { label: 'Controller-based', points: ['Centralized policy / control', 'Devices still forward (data plane)', 'Southbound programs the fabric', 'Ops focus shifts to intent + health'] } },
  '6.3': { type: 'layer_stack', title: 'SDN stack (top → bottom)', layers: [{ label: 'Applications / orchestration', note: 'Intent, workflows, dashboards' }, { label: 'Northbound API', note: 'Usually REST — apps talk to controller' }, { label: 'SDN controller', note: 'Central brain — policy & topology view' }, { label: 'Southbound API', note: 'NETCONF, OpenFlow, device APIs' }, { label: 'Network devices (data plane)', note: 'Still forward frames/packets' }] },
  '6.4': { type: 'comparison', title: 'Traditional campus mgmt vs DNA Center', left: { label: 'Traditional campus', points: ['CLI + classic NMS polling', 'Manual templates / scripts', 'Reactive break/fix', 'Limited end-to-end assurance'] }, right: { label: 'Cisco DNA Center', points: ['Design / Policy / Provision / Assurance', 'Intent-based campus workflows', 'Telemetry-driven closed loop', 'Fabric + client health visibility'] } },
  '6.5': { type: 'comparison', title: 'HTTP verbs ↔ CRUD (REST)', left: { label: 'HTTP method', points: ['GET — read', 'POST — create', 'PUT/PATCH — update', 'DELETE — remove'] }, right: { label: 'Exam traps', points: ['Stateless: each request carries what it needs', 'URI identifies the resource', 'JSON body common on write', 'Status codes: 2xx ok, 4xx client, 5xx server'] } },
  '6.6': { type: 'comparison', title: 'Config tools at a glance', left: { label: 'Ansible', points: ['Usually agentless (SSH/API)', 'Playbooks + inventory', 'Push model from control node', 'YAML playbooks; JSON/YAML data'] }, right: { label: 'Puppet / Chef', points: ['Often agent on the node', 'Desired-state / pull common', 'Strong for servers; also used in netops', 'Still consume structured data (JSON/YAML)'] } },
}

const D6_TRAPS = {
  '6.1': ['Automation without verify still ships bad config — faster.', '“Set and forget” is not the goal; closed-loop check is.'],
  '6.2': ['Controller-based ≠ no data plane on switches.', 'Central policy does not mean every packet goes through the controller.'],
  '6.3': ['Northbound = apps→controller; southbound = controller→devices.', 'Overlay/underlay questions: underlay still needs IP reachability.'],
  '6.4': ['DNA Center assurance is more than SNMP graphs — client/path health.', 'Do not equate DNA Center with “only wireless” — campus fabric too.'],
  '6.5': ['REST is not a Cisco CLI — it is an API style over HTTP.', 'Idempotent GET should not mutate; watch POST vs PUT on the exam.'],
  '6.6': ['JSON types: object {}, array [], string, number, boolean, null.', 'Ansible agentless vs Puppet/Chef agent is a classic compare item.'],
}

const D6_FLOWS = {
  '6.1': flow('FLOW-6.1-auto', 'Safe automated change', ['CKU-AUTOMATION'], [['Encode intent', 'Capture the change in a playbook/template — not a one-off CLI paste.'], ['Target inventory', 'Select the device group; dry-run or check mode when available.'], ['Push / API apply', 'Automation applies the same change across targets.'], ['Verify', 'Show/run tests or assurance checks — do not assume success.']]),
  '6.2': flow('FLOW-6.2-ctrl', 'Controller programs the fabric', ['CKU-SDN-TRAD'], [['Policy at controller', 'Operator defines intent once at the controller.'], ['Southbound push', 'Controller programs devices via SBI.'], ['Data plane forwards', 'Switches/routers still forward user traffic locally.']]),
  '6.3': flow('FLOW-6.3-planes', 'Request through SDN planes', ['CKU-SDN-ARCH'], [['App calls NBI', 'Orchestration sends REST intent to the controller.'], ['Controller decides', 'Controller translates intent to device actions.'], ['SBI to devices', 'NETCONF/OpenFlow/API updates device state.']]),
  '6.4': flow('FLOW-6.4-dna', 'DNA Center closed loop', ['CKU-DNA'], [['Design & policy', 'Model site, SSID, and access policy in DNA Center.'], ['Provision', 'Push config/image/fabric settings to campus devices.'], ['Assurance', 'Telemetry shows client/path health; remediate from insights.']]),
  '6.5': flow('FLOW-6.5-rest', 'One REST call', ['CKU-REST'], [['Build request', 'Choose method + URI; add auth headers; optional JSON body.'], ['Send over HTTPS', 'Stateless call — server does not rely on prior session state.'], ['Read status + body', 'Interpret 2xx/4xx/5xx and parse JSON response.']]),
  '6.6': flow('FLOW-6.6-cm', 'From JSON to device config', ['CKU-JSON-ANSIBLE'], [['Structured data', 'JSON/YAML holds VLAN, IP, and interface facts.'], ['CM tool renders', 'Ansible/Puppet/Chef maps data → desired config.'], ['Apply to inventory', 'Push (Ansible) or agent pull (Puppet/Chef) to devices.']]),
}

export const VISUAL_DIAGRAMS = { ...D1, ...D2, ...D3, ...D4, ...D5, ...D6_DIAGRAMS }
export const VISUAL_COMPARE = { ...C1, ...C2, ...C3, ...C4, ...C5, ...D6_COMPARE }
export const VISUAL_TRAP_CALLOUTS = { ...T1, ...T2, ...T3, ...T4, ...T5, ...D6_TRAPS }
export const VISUAL_FLOWS = { ...F1, ...F2, ...F3, ...F4, ...F5, ...D6_FLOWS }

export const DOMAIN6_VISUAL_OBJECTIVES = ['6.1', '6.2', '6.3', '6.4', '6.5', '6.6']

export const ALL_VISUAL_OBJECTIVES = ALL_OBJECTIVES.map(o => o.id)

function coverageForIds(ids) {
  const missing = []
  for (const id of ids) {
    const gaps = []
    if (!VISUAL_DIAGRAMS[id]?.nodes?.length) gaps.push('diagram')
    if (!VISUAL_COMPARE[id]) gaps.push('compare')
    if (!VISUAL_TRAP_CALLOUTS[id]?.length) gaps.push('traps')
    if (!VISUAL_FLOWS[id]?.steps?.length) gaps.push('flow')
    if (gaps.length) missing.push({ id, gaps })
  }
  return {
    ok: missing.length === 0,
    total: ids.length,
    covered: ids.length - missing.length,
    missing,
  }
}

export function getDomain6VisualCoverage() {
  return coverageForIds(DOMAIN6_VISUAL_OBJECTIVES)
}

/** Bank-wide visual pack coverage (all exam objectives). */
export function getAllDomainVisualCoverage() {
  return coverageForIds(ALL_VISUAL_OBJECTIVES)
}

export { SRC_FLOW }
