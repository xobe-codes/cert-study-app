/**
 * Curated Command Sprint packs — short type-in sessions without a full lab.
 * Items resolve from COMMAND_DRILLS via commandSprintQuiz.js.
 */

export const COMMAND_SPRINT_PACKS = [
  {
    id: 'sprint-fundamentals-show',
    title: 'Fundamentals · show / verify',
    blurb: 'Interface and MAC table verify commands — exam-style type-in.',
    domainId: 'fundamentals',
    objectiveIds: ['1.1', '1.4', '1.5'],
    count: 6,
    preferCategory: 'verify',
  },
  {
    id: 'sprint-vlan-access',
    title: 'VLANs & access ports',
    blurb: 'Create VLANs and set access ports — mode-aware config sprint.',
    domainId: 'access',
    objectiveIds: ['2.1', '2.2'],
    count: 8,
    labId: 'LAB-VLAN-TRUNK',
  },
  {
    id: 'sprint-trunking',
    title: 'Trunking & EtherChannel',
    blurb: 'Trunk mode and channel-group commands without the full topology.',
    domainId: 'access',
    objectiveIds: ['2.2', '2.3'],
    count: 7,
    labId: 'LAB-VLAN-TRUNK',
  },
  {
    id: 'sprint-stp',
    title: 'STP & wireless edge',
    blurb: 'PortFast / BPDU Guard and related edge commands — lab optional.',
    domainId: 'access',
    objectiveIds: ['2.4', '2.7'],
    count: 5,
    labId: 'LAB-STP-PORTFAST',
  },
  {
    id: 'sprint-static-route',
    title: 'Static routes',
    blurb: 'ip route and verify — no multi-router lab required.',
    domainId: 'connectivity',
    objectiveIds: ['3.3'],
    count: 6,
  },
  {
    id: 'sprint-ospf',
    title: 'OSPF single-area',
    blurb: 'network statements and show ip ospf neighbor — CLI proof first.',
    domainId: 'connectivity',
    objectiveIds: ['3.4'],
    count: 8,
    labId: 'LAB-OSPF-SINGLE-AREA',
  },
  {
    id: 'sprint-nat-pat',
    title: 'NAT / PAT',
    blurb: 'Inside source and overload — type the commands, lab optional.',
    domainId: 'services',
    objectiveIds: ['4.1'],
    count: 7,
    labId: 'LAB-NAT-PAT',
  },
  {
    id: 'sprint-ssh',
    title: 'SSH remote access',
    blurb: 'Line vty and crypto key steps as type-in recall.',
    domainId: 'services',
    objectiveIds: ['4.8'],
    count: 6,
    labId: 'LAB-SSH-ACCESS',
  },
  {
    id: 'sprint-acl',
    title: 'IPv4 ACLs',
    blurb: 'Standard/extended ACE syntax — first-match mindset.',
    domainId: 'security',
    objectiveIds: ['5.5'],
    count: 7,
  },
  {
    id: 'sprint-port-security',
    title: 'Port security',
    blurb: 'switchport port-security family without the full switch lab.',
    domainId: 'security',
    objectiveIds: ['5.6', '5.3'],
    count: 6,
  },
  {
    id: 'sprint-wlan-security',
    title: 'WLAN & device security CLI',
    blurb: 'Wireless and device-hardening commands from the security drills.',
    domainId: 'security',
    objectiveIds: ['5.9', '5.3'],
    count: 5,
  },
  {
    id: 'sprint-auto-ops',
    title: 'Automation ops & controllers',
    blurb: 'IaC playbook verify and controller inventory — type-in without the full lab.',
    domainId: 'automation',
    objectiveIds: ['6.1', '6.2'],
    count: 6,
    labId: 'LAB-AUTO-MGMT-61',
  },
  {
    id: 'sprint-sdn-api',
    title: 'SDN architecture & REST APIs',
    blurb: 'Northbound/southbound, DNA Center, and REST show commands.',
    domainId: 'automation',
    objectiveIds: ['6.3', '6.4', '6.5'],
    count: 7,
    labId: 'LAB-AUTO-SDN-63',
  },
  {
    id: 'sprint-json-ansible',
    title: 'JSON & Ansible playbooks',
    blurb: 'JSON payloads and Ansible inventory/playbook verify commands.',
    domainId: 'automation',
    objectiveIds: ['6.6'],
    count: 5,
    labId: 'LAB-AUTO-JSON-66',
  },
]

export function getSprintPack(packId) {
  return COMMAND_SPRINT_PACKS.find(p => p.id === packId) || null
}

export function listSprintPacks({ domainId } = {}) {
  if (!domainId || domainId === 'all') return [...COMMAND_SPRINT_PACKS]
  return COMMAND_SPRINT_PACKS.filter(p => p.domainId === domainId)
}

export function labIdForSprintPack(packId) {
  return getSprintPack(packId)?.labId || null
}
