/**
 * Spec 12 — command scenario quiz (verify-next-step packs per domain).
 * Target: ≥3 scenarios per exam domain so domain-filtered sessions stay dense.
 */

export const COMMAND_SCENARIOS = [
  // —— Network Fundamentals ——
  {
    id: 'sc-mac-table',
    stem: 'A host’s frames aren’t forwarding after a move. First MAC-learning check?',
    objectiveId: '1.5',
    domainId: 'fundamentals',
    choices: [
      'show mac address-table',
      'show ip ospf neighbor',
      'show ip nat translations',
      'show access-lists',
    ],
    correctIndex: 0,
    why: 'Confirm the CAM entry (port/VLAN) before blaming L3.',
  },
  {
    id: 'sc-ipv4-if',
    stem: 'New IPv4 address configured but pings fail. First interface verify?',
    objectiveId: '1.6',
    domainId: 'fundamentals',
    choices: [
      'show ip interface brief',
      'show spanning-tree',
      'show vlan brief',
      'show etherchannel summary',
    ],
    correctIndex: 0,
    why: 'Confirm admin/line status and address before routing.',
  },
  {
    id: 'sc-ipv6-addr',
    stem: 'IPv6 neighbor can’t reach this router. First IPv6 interface check?',
    objectiveId: '1.8',
    domainId: 'fundamentals',
    choices: [
      'show ipv6 interface brief',
      'show ip route',
      'show cdp neighbors',
      'show standby',
    ],
    correctIndex: 0,
    why: 'Confirm IPv6 enabled and addresses present on the interface.',
  },
  {
    id: 'sc-cable',
    stem: 'Link light is dark after a cable change. First physical/status check?',
    objectiveId: '1.4',
    domainId: 'fundamentals',
    choices: [
      'show interfaces status',
      'show ip ospf database',
      'show ip nat statistics',
      'show running-config | include helper',
    ],
    correctIndex: 0,
    why: 'Status/duplex/speed and connected/notconnect surface cabling issues fast.',
  },

  // —— Network Access ——
  {
    id: 'sc-vlan-ping',
    stem: 'User can’t ping a host in VLAN 20 from VLAN 10. Which verify command do you run first on the SVI router?',
    objectiveId: '2.1',
    domainId: 'access',
    choices: [
      'show ip interface brief',
      'show spanning-tree',
      'show etherchannel summary',
      'show mac address-table',
    ],
    correctIndex: 0,
    why: 'Confirm the inter-VLAN SVI is up/up and has the expected address before chasing L2.',
  },
  {
    id: 'sc-trunk',
    stem: 'PC in VLAN 30 has no connectivity through a trunk uplink. First check on the switch?',
    objectiveId: '2.2',
    domainId: 'access',
    choices: [
      'show interfaces trunk',
      'show ip ospf database',
      'show ip dhcp binding',
      'show standby',
    ],
    correctIndex: 0,
    why: 'Confirm allowed VLANs and native VLAN on the trunk before L3.',
  },
  {
    id: 'sc-stp',
    stem: 'Unexpected switch is root bridge. First verify?',
    objectiveId: '2.5',
    domainId: 'access',
    choices: [
      'show spanning-tree',
      'show ip nat translations',
      'show ip dhcp binding',
      'show ip protocols',
    ],
    correctIndex: 0,
    why: 'Root ID / priority / path cost are in spanning-tree output.',
  },
  {
    id: 'sc-etherchannel',
    stem: 'Bundle isn’t aggregating after LACP config. First EtherChannel check?',
    objectiveId: '2.4',
    domainId: 'access',
    choices: [
      'show etherchannel summary',
      'show ip route',
      'show access-lists',
      'show ip nat translations',
    ],
    correctIndex: 0,
    why: 'Flags/protocol/ports in summary show negotiation and member health.',
  },
  {
    id: 'sc-cdp',
    stem: 'Need to confirm which neighbor is on Gi0/1. First discovery check?',
    objectiveId: '2.3',
    domainId: 'access',
    choices: [
      'show cdp neighbors',
      'show ip ospf neighbor',
      'show ip dhcp pool',
      'show standby brief',
    ],
    correctIndex: 0,
    why: 'CDP (or LLDP) identifies the device on that link.',
  },

  // —— IP Connectivity ——
  {
    id: 'sc-ospf-neighbor',
    stem: 'Two routers should form OSPF adjacency but don’t. Best first verify?',
    objectiveId: '3.4',
    domainId: 'connectivity',
    choices: [
      'show ip ospf neighbor',
      'show ip route rip',
      'show vlan brief',
      'show ip nat translations',
    ],
    correctIndex: 0,
    why: 'Neighbor state tells you if hellos/area/network type are even matching.',
  },
  {
    id: 'sc-hsrp',
    stem: 'Standby gateway isn’t taking over when the active fails. First HSRP verify?',
    objectiveId: '3.5',
    domainId: 'connectivity',
    choices: [
      'show standby',
      'show ip ospf interface',
      'show mac address-table',
      'show ip dhcp pool',
    ],
    correctIndex: 0,
    why: 'HSRP state/priority/preempt are visible in show standby.',
  },
  {
    id: 'sc-static',
    stem: 'Static route is configured but missing from the table. First verify?',
    objectiveId: '3.3',
    domainId: 'connectivity',
    choices: [
      'show ip route',
      'show vlan brief',
      'show access-lists',
      'show cdp neighbors detail',
    ],
    correctIndex: 0,
    why: 'Confirm the route installed (and AD/next-hop reachability symptoms).',
  },
  {
    id: 'sc-ospf-db',
    stem: 'OSPF neighbors are FULL but a prefix is missing. First LSDB check?',
    objectiveId: '3.4',
    domainId: 'connectivity',
    choices: [
      'show ip ospf database',
      'show vlan brief',
      'show spanning-tree root',
      'show etherchannel summary',
    ],
    correctIndex: 0,
    why: 'Confirm the LSA exists before blaming redistribution or filters.',
  },

  // —— IP Services ——
  {
    id: 'sc-nat',
    stem: 'Inside hosts can’t reach the Internet through NAT overload. First verify?',
    objectiveId: '4.1',
    domainId: 'services',
    choices: [
      'show ip nat translations',
      'show vlan brief',
      'show spanning-tree root',
      'show etherchannel summary',
    ],
    correctIndex: 0,
    why: 'Confirm translations are building before blaming routing.',
  },
  {
    id: 'sc-dhcp',
    stem: 'Client never gets an address from a remote DHCP server. First relay check?',
    objectiveId: '4.6',
    domainId: 'services',
    choices: [
      'show running-config | include helper',
      'show spanning-tree',
      'show etherchannel summary',
      'show ip ospf database',
    ],
    correctIndex: 0,
    why: 'Confirm ip helper-address on the client-facing SVI/interface.',
  },
  {
    id: 'sc-ntp',
    stem: 'Logs show wrong time across devices. First NTP verify?',
    objectiveId: '4.2',
    domainId: 'services',
    choices: [
      'show ntp status',
      'show vlan brief',
      'show access-lists',
      'show mac address-table',
    ],
    correctIndex: 0,
    why: 'Sync status and stratum tell you if the clock source is usable.',
  },
  {
    id: 'sc-snmp',
    stem: 'NMS isn’t polling this router. First SNMP check?',
    objectiveId: '4.4',
    domainId: 'services',
    choices: [
      'show snmp',
      'show ip ospf neighbor',
      'show spanning-tree',
      'show etherchannel summary',
    ],
    correctIndex: 0,
    why: 'Community/ACL and packet counters surface community or ACL blocks.',
  },

  // —— Security ——
  {
    id: 'sc-acl',
    stem: 'Traffic that should be denied is still reaching a server. First ACL verify?',
    objectiveId: '5.5',
    domainId: 'security',
    choices: [
      'show access-lists',
      'show ip route',
      'show cdp neighbors',
      'show ip protocols',
    ],
    correctIndex: 0,
    why: 'See hit counts and whether the ACL entries match the intended traffic.',
  },
  {
    id: 'sc-portsec',
    stem: 'A port went err-disabled after a new phone was plugged in. First check?',
    objectiveId: '5.6',
    domainId: 'security',
    choices: [
      'show port-security interface',
      'show ip route',
      'show ip nat statistics',
      'show ip ospf neighbor',
    ],
    correctIndex: 0,
    why: 'Port-security violation mode and secure MAC count explain the shutdown.',
  },
  {
    id: 'sc-dhcp-snooping',
    stem: 'Clients stopped getting DHCP after enabling snooping. First check?',
    objectiveId: '5.6',
    domainId: 'security',
    choices: [
      'show ip dhcp snooping',
      'show ip ospf database',
      'show ip nat translations',
      'show spanning-tree root',
    ],
    correctIndex: 0,
    why: 'Confirm trust state on uplinks and that snooping is active on the VLAN.',
  },
  {
    id: 'sc-ssh',
    stem: 'SSH to the switch fails but Telnet was disabled on purpose. First line check?',
    objectiveId: '5.3',
    domainId: 'security',
    choices: [
      'show ip ssh',
      'show vlan brief',
      'show etherchannel summary',
      'show mac address-table',
    ],
    correctIndex: 0,
    why: 'SSH version/keys/status must be ready before transport input ssh works.',
  },

  // —— Automation & Programmability ——
  {
    id: 'sc-restconf',
    stem: 'RESTCONF GET returns 401. First auth/capability check on the box?',
    objectiveId: '6.5',
    domainId: 'automation',
    choices: [
      'show restconf',
      'show vlan brief',
      'show spanning-tree',
      'show ip nat translations',
    ],
    correctIndex: 0,
    why: 'Confirm RESTCONF is enabled and reachable before blaming the client JSON.',
  },
  {
    id: 'sc-yang-model',
    stem: 'Automation push fails on an unknown leaf. First model discovery step?',
    objectiveId: '6.5',
    domainId: 'automation',
    choices: [
      'show yang-operational',
      'show ip route',
      'show access-lists',
      'show cdp neighbors',
    ],
    correctIndex: 0,
    why: 'Confirm the device exposes the expected YANG model/capability.',
  },
  {
    id: 'sc-json-config',
    stem: 'Ansible playbook applied but running config unchanged. Best first device verify?',
    objectiveId: '6.6',
    domainId: 'automation',
    choices: [
      'show running-config',
      'show spanning-tree root',
      'show etherchannel summary',
      'show mac address-table dynamic',
    ],
    correctIndex: 0,
    why: 'Confirm whether the intended lines landed before debugging the tool chain.',
  },
  {
    id: 'sc-controller',
    stem: 'Fabric edge lost controller connectivity. First underlay reachability check?',
    objectiveId: '6.3',
    domainId: 'automation',
    choices: [
      'show ip interface brief',
      'show vlan brief',
      'show access-lists',
      'show port-security',
    ],
    correctIndex: 0,
    why: 'Controller-based fabrics still need underlay IP reachability first.',
  },
]

const DOMAIN_IDS = [
  'fundamentals',
  'access',
  'connectivity',
  'services',
  'security',
  'automation',
]

/** Min scenarios expected per domain for dense filtered sessions. */
export const MIN_SCENARIOS_PER_DOMAIN = 3

export function scenariosForDomain(domainId) {
  if (!domainId || domainId === 'all') return [...COMMAND_SCENARIOS]
  return COMMAND_SCENARIOS.filter(s => s.domainId === domainId)
}

export function scenarioCoverageByDomain() {
  const out = Object.fromEntries(DOMAIN_IDS.map(id => [id, 0]))
  for (const s of COMMAND_SCENARIOS) {
    if (out[s.domainId] != null) out[s.domainId] += 1
  }
  return out
}

export function pickScenarioSession(domainId, count = 5) {
  const pool = scenariosForDomain(domainId)
  const copy = [...pool]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, Math.min(count, copy.length))
}

export function gradeScenario(scenario, choiceIndex) {
  return Number(choiceIndex) === Number(scenario?.correctIndex)
}
