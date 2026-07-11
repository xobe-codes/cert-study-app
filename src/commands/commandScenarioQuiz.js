/**
 * Spec 12 — lightweight command scenario quiz (verify next step).
 */

export const COMMAND_SCENARIOS = [
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
]

export function scenariosForDomain(domainId) {
  if (!domainId || domainId === 'all') return [...COMMAND_SCENARIOS]
  return COMMAND_SCENARIOS.filter(s => s.domainId === domainId)
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
