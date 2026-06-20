/** Multi-step CCNA config/verify recipes for Command Hub. */

export const COMMAND_WORKFLOWS = [
  {
    id: 'wf-vlan-access',
    title: 'VLAN access port',
    description: 'Create a VLAN and assign an access port — the most common switching config sequence on CCNA.',
    objectiveIds: ['2.1'],
    tags: ['switching', 'vlan'],
    steps: [
      { order: 1, label: 'Enter global config', commandText: 'configure terminal', mode: 'privileged EXEC' },
      { order: 2, label: 'Create VLAN', commandText: 'vlan 10', mode: 'global config' },
      { order: 3, label: 'Name VLAN (optional)', commandText: 'name SALES', mode: 'config-vlan' },
      { order: 4, label: 'Enter interface', commandText: 'interface fa0/5', mode: 'global config' },
      { order: 5, label: 'Set access mode', commandText: 'switchport mode access', mode: 'interface config' },
      { order: 6, label: 'Assign VLAN', commandText: 'switchport access vlan 10', mode: 'interface config' },
      { order: 7, label: 'Verify', commandText: 'show vlan brief', mode: 'privileged EXEC', commandMatch: 'show vlan brief' },
    ],
  },
  {
    id: 'wf-ospf-single-area',
    title: 'Single-area OSPFv2',
    description: 'Enable OSPF process 1, advertise networks into area 0, and verify adjacency.',
    objectiveIds: ['3.4'],
    tags: ['routing', 'ospf'],
    steps: [
      { order: 1, label: 'Global config', commandText: 'configure terminal', mode: 'privileged EXEC' },
      { order: 2, label: 'Enter OSPF', commandText: 'router ospf 1', mode: 'global config', commandMatch: 'router ospf 1' },
      { order: 3, label: 'Set router ID', commandText: 'router-id 1.1.1.1', mode: 'router config', commandMatch: 'router-id' },
      { order: 4, label: 'Advertise network', commandText: 'network 10.0.0.0 0.0.0.255 area 0', mode: 'router config', commandMatch: 'network' },
      { order: 5, label: 'Verify neighbors', commandText: 'show ip ospf neighbor', mode: 'privileged EXEC', commandMatch: 'show ip ospf neighbor' },
      { order: 6, label: 'Verify routes', commandText: 'show ip route ospf', mode: 'privileged EXEC', commandMatch: 'show ip route ospf' },
    ],
  },
  {
    id: 'wf-nat-pat',
    title: 'NAT overload (PAT)',
    description: 'Mark inside/outside interfaces, configure PAT with overload, and verify translations.',
    objectiveIds: ['4.1'],
    tags: ['nat', 'services'],
    steps: [
      { order: 1, label: 'Inside interface', commandText: 'interface gi0/1', mode: 'global config' },
      { order: 2, label: 'Mark inside', commandText: 'ip nat inside', mode: 'interface config', commandMatch: 'ip nat inside' },
      { order: 3, label: 'Outside interface', commandText: 'interface gi0/0', mode: 'global config' },
      { order: 4, label: 'Mark outside', commandText: 'ip nat outside', mode: 'interface config', commandMatch: 'ip nat outside' },
      { order: 5, label: 'Configure PAT', commandText: 'ip nat inside source list 1 interface gi0/0 overload', mode: 'global config', commandMatch: 'ip nat inside source' },
      { order: 6, label: 'Verify translations', commandText: 'show ip nat translations', mode: 'privileged EXEC', commandMatch: 'show ip nat translations' },
    ],
  },
  {
    id: 'wf-ssh-hardening',
    title: 'SSH remote access',
    description: 'Generate keys, create local user, restrict vty to SSH — standard CCNA device hardening.',
    objectiveIds: ['4.8', '5.3'],
    tags: ['security', 'management'],
    steps: [
      { order: 1, label: 'Domain name (for keys)', commandText: 'ip domain-name ccna.local', mode: 'global config', commandMatch: 'ip domain-name' },
      { order: 2, label: 'Generate RSA keys', commandText: 'crypto key generate rsa modulus 2048', mode: 'global config', commandMatch: 'crypto key generate rsa' },
      { order: 3, label: 'Local admin user', commandText: 'username admin secret Cisco123!', mode: 'global config', commandMatch: 'username' },
      { order: 4, label: 'Enter vty lines', commandText: 'line vty 0 15', mode: 'global config' },
      { order: 5, label: 'SSH only', commandText: 'transport input ssh', mode: 'config-line', commandMatch: 'transport input ssh' },
      { order: 6, label: 'Local login', commandText: 'login local', mode: 'config-line', commandMatch: 'login local' },
      { order: 7, label: 'Verify SSH', commandText: 'show ip ssh', mode: 'privileged EXEC', commandMatch: 'show ip ssh' },
    ],
  },
  {
    id: 'wf-portfast-bpduguard',
    title: 'PortFast + BPDU Guard',
    description: 'Secure access-port STP edge configuration — common CCNA security + switching combo.',
    objectiveIds: ['2.5', '5.6'],
    tags: ['switching', 'stp', 'security'],
    steps: [
      { order: 1, label: 'Enter interface', commandText: 'interface fa0/1', mode: 'global config' },
      { order: 2, label: 'Access mode', commandText: 'switchport mode access', mode: 'interface config', commandMatch: 'switchport mode access' },
      { order: 3, label: 'PortFast', commandText: 'spanning-tree portfast', mode: 'interface config', commandMatch: 'spanning-tree portfast' },
      { order: 4, label: 'BPDU Guard', commandText: 'spanning-tree bpduguard enable', mode: 'interface config', commandMatch: 'spanning-tree bpduguard' },
      { order: 5, label: 'Verify STP', commandText: 'show spanning-tree interface fa0/1 portfast', mode: 'privileged EXEC', commandMatch: 'show spanning-tree' },
    ],
  },
]

export const COMMAND_PRESETS = [
  { id: 'preset-routing-verify', label: 'Routing verify', tags: ['routing'], category: 'verify' },
  { id: 'preset-switching-config', label: 'Switching config', tags: ['switching'], category: 'config' },
  { id: 'preset-security-acl', label: 'Security & ACLs', tags: ['security', 'acl'], category: null },
  { id: 'preset-nat-services', label: 'NAT & services', tags: ['nat', 'services', 'dhcp'], category: null },
  { id: 'preset-troubleshoot', label: 'Troubleshooting', tags: ['troubleshooting'], category: 'verify' },
]

export const CATEGORY_LABEL = {
  verify: 'Show / verify',
  config: 'Configure',
  clear: 'Clear',
  debug: 'Debug',
  host: 'Host tools',
}

export const MODE_LABEL = {
  'user EXEC': 'User EXEC (>)',
  'privileged EXEC': 'Privileged EXEC (#)',
  'global config': 'Global config',
  'interface config': 'Interface config',
  'router config': 'Router config',
  'config-line': 'Line config',
  'config-vlan': 'VLAN config',
}

export const DEVICE_LABEL = {
  router: 'Router',
  switch: 'Switch',
  'l3-switch': 'L3 switch',
  wlc: 'WLC',
  host: 'Host PC',
  any: 'Any device',
}

export const EXAM_WEIGHT_LABEL = {
  'must-config': 'Must configure',
  'must-verify': 'Must verify',
  reference: 'Reference',
}
