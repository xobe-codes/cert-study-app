const CORE_CONFIG_OVERRIDES = {
  'LAB-VLAN-TRUNK': {
    scenario: 'Build VLANs 10 (Sales) and 20 (Engineering), place access ports in the correct broadcast domains, configure Gi0/3 as an 802.1Q trunk between SW1 and SW2, then verify end-to-end VLAN carriage.',
    learningGoals: [
      'Create and name VLANs on both switches',
      'Assign access ports to VLAN 10 and VLAN 20',
      'Configure and restrict an 802.1Q trunk',
      'Verify VLAN membership, native VLAN, and allowed VLANs',
    ],
    tasks: [
      {
        id: 't1',
        order: 1,
        title: 'Create VLANs on SW1',
        device: 'SW1',
        instruction: 'Create VLAN 10 named Sales and VLAN 20 named Engineering.',
        expectedCommands: ['vlan 10', 'name Sales', 'vlan 20', 'name Engineering'],
      },
      {
        id: 't2',
        order: 2,
        title: 'Assign SW1 access ports',
        device: 'SW1',
        instruction: 'Make Gi0/1 an access port in VLAN 10 and Gi0/2 an access port in VLAN 20.',
        expectedCommands: ['interface gi0/1', 'switchport mode access', 'switchport access vlan 10', 'interface gi0/2', 'switchport access vlan 20'],
      },
      {
        id: 't3',
        order: 3,
        title: 'Configure the SW1 trunk',
        device: 'SW1',
        instruction: 'Configure Gi0/3 as a static trunk carrying only VLANs 10 and 20.',
        expectedCommands: ['interface gi0/3', 'switchport mode trunk', 'switchport trunk allowed vlan 10,20'],
      },
      {
        id: 't4',
        order: 4,
        title: 'Configure SW2',
        device: 'SW2',
        instruction: 'Create VLANs 10 and 20, place Gi0/1 in VLAN 10, and configure Gi0/3 as the matching trunk.',
        expectedCommands: ['vlan 10', 'name Sales', 'vlan 20', 'name Engineering', 'interface gi0/1', 'switchport mode access', 'switchport access vlan 10', 'interface gi0/3', 'switchport mode trunk', 'switchport trunk allowed vlan 10,20'],
      },
      {
        id: 't5',
        order: 5,
        title: 'Verify VLAN and trunk state',
        device: 'SW1',
        instruction: 'Verify the access-port assignments and confirm Gi0/3 carries VLANs 10 and 20.',
        expectedCommands: ['show vlan brief', 'show interfaces trunk', 'show interfaces gi0/3 switchport'],
      },
    ],
  },
}

export const CORE_CONFIG_LAB_IDS = new Set([
  'LAB-VLAN-TRUNK',
  'LAB-STATIC-FLOATING',
  'LAB-OSPF-DEFAULT',
  'LAB-SSH-ACCESS',
  'LAB-ACL-CONFIG',
  'LAB-PORT-SECURITY',
])

export function applyCoreConfigLabWave(bundle) {
  const labId = bundle?.lab?.id
  const override = CORE_CONFIG_OVERRIDES[labId]
  if (!override) return bundle
  const lab = {
    ...bundle.lab,
    ...override,
    interpretOnly: false,
    estimatedTimeMinutes: 18,
  }
  return {
    ...bundle,
    lab,
    validator: {
      ...bundle.validator,
      labId,
      requiredCommands: lab.tasks.flatMap(task =>
        task.expectedCommands.map(command => ({ device: task.device, command })),
      ),
    },
  }
}
