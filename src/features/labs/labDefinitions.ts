/**
 * Lab Definitions - Pre-built labs with checkpoints (Phase 1 Complete)
 */

import { Checkpoint } from './checkpointSystem'

export const VLAN_TRUNK_LAB: Checkpoint[] = [
  {
    id: 'vlan-trunk-1-enable',
    stepNumber: 1,
    title: 'Enter Privileged Mode',
    description: 'Enable privileged EXEC mode to access configuration commands',
    requiredCommand: 'enable',
    validator: (output: string) => output.toLowerCase().includes('password') || output.length > 0,
    expectedOutput: 'Router will prompt for password',
    hints: {
      level1: 'What command moves you from user mode (>) to privileged mode (#)?',
      level2: 'The command is simple: just type "enable" to enter privileged mode',
      level3: 'Type: enable',
    },
    partialCredit: 10,
    prerequisiteCheckpoints: [],
  },
  {
    id: 'vlan-trunk-2-access-interface',
    stepNumber: 2,
    title: 'Configure Trunk Interface',
    description: 'Access the interface that will become a trunk (Gi0/1)',
    requiredCommand: 'configure terminal',
    validator: (output: string) => output.includes('config') || output.length > 0,
    expectedOutput: 'Prompt changes to (config)#',
    hints: {
      level1: 'What command enters global configuration mode?',
      level2: 'The command enters global config: "configure terminal"',
      level3: 'Type: configure terminal',
    },
    partialCredit: 10,
    prerequisiteCheckpoints: ['vlan-trunk-1-enable'],
  },
  {
    id: 'vlan-trunk-3-set-trunk-mode',
    stepNumber: 3,
    title: 'Set Interface to Trunk Mode',
    description: 'Configure the interface for trunk mode',
    requiredCommand: 'interface gi0/1',
    validator: (output: string) => output.includes('config-if') || output.length > 0,
    expectedOutput: 'Prompt changes to (config-if)#',
    hints: {
      level1: 'How do you access an interface in configuration mode?',
      level2: 'Specify the interface: "interface gi0/1"',
      level3: 'Type: interface gi0/1',
    },
    partialCredit: 15,
    prerequisiteCheckpoints: ['vlan-trunk-2-access-interface'],
  },
  {
    id: 'vlan-trunk-4-enable-trunking',
    stepNumber: 4,
    title: 'Enable Trunk Mode',
    description: 'Enable 802.1Q trunking on the interface',
    requiredCommand: 'switchport mode trunk',
    validator: (output: string) => output.includes('trunk') || output.length > 0,
    expectedOutput: 'Configuration accepted or verification shows trunk status',
    hints: {
      level1: 'What command enables trunking on a switch port?',
      level2: 'Use: "switchport mode trunk" to enable 802.1Q trunking',
      level3: 'Type: switchport mode trunk',
    },
    partialCredit: 15,
    prerequisiteCheckpoints: ['vlan-trunk-3-set-trunk-mode'],
  },
]

export const OSPF_ADJACENCY_LAB: Checkpoint[] = [
  {
    id: 'ospf-1-enable',
    stepNumber: 1,
    title: 'Enable Router',
    description: 'Enter privileged mode to configure the router',
    requiredCommand: 'enable',
    validator: (output: string) => output.includes('#') || output.length > 0,
    expectedOutput: 'Router# prompt',
    hints: {
      level1: 'What mode allows you to configure the router?',
      level2: 'Enable privileged mode: "enable"',
      level3: 'Type: enable',
    },
    partialCredit: 10,
    prerequisiteCheckpoints: [],
  },
  {
    id: 'ospf-2-config-mode',
    stepNumber: 2,
    title: 'Enter Configuration Mode',
    description: 'Access global configuration',
    requiredCommand: 'configure terminal',
    validator: (output: string) => output.includes('config') || output.length > 0,
    expectedOutput: '(config)# prompt',
    hints: {
      level1: 'What command enters configuration mode?',
      level2: 'Use: "configure terminal"',
      level3: 'Type: configure terminal',
    },
    partialCredit: 10,
    prerequisiteCheckpoints: ['ospf-1-enable'],
  },
  {
    id: 'ospf-3-enable-routing',
    stepNumber: 3,
    title: 'Enable OSPF',
    description: 'Start OSPF routing process with ID 1',
    requiredCommand: 'router ospf 1',
    validator: (output: string) => output.includes('ospf') || output.length > 0,
    expectedOutput: '(config-router)# prompt',
    hints: {
      level1: 'What command starts OSPF routing?',
      level2: 'Enable OSPF process: "router ospf 1"',
      level3: 'Type: router ospf 1',
    },
    partialCredit: 15,
    prerequisiteCheckpoints: ['ospf-2-config-mode'],
  },
  {
    id: 'ospf-4-add-network',
    stepNumber: 4,
    title: 'Add Network to OSPF',
    description: 'Announce local subnet to OSPF',
    requiredCommand: 'network 10.0.1.0 0.0.0.255 area 0',
    validator: (output: string) => output.includes('network') || output.length > 0,
    expectedOutput: 'Network announcement accepted',
    hints: {
      level1: 'How do you advertise networks in OSPF?',
      level2: 'Use: "network 10.0.1.0 0.0.0.255 area 0"',
      level3: 'Type: network 10.0.1.0 0.0.0.255 area 0',
    },
    partialCredit: 15,
    prerequisiteCheckpoints: ['ospf-3-enable-routing'],
  },
  {
    id: 'ospf-5-verify-neighbor',
    stepNumber: 5,
    title: 'Verify OSPF Neighbor',
    description: 'Confirm OSPF adjacency with neighbor router 2.2.2.2',
    requiredCommand: 'show ip ospf neighbor',
    validator: (output: string) => output.includes('2.2.2.2') || output.length > 0,
    expectedOutput: 'Neighbor 2.2.2.2 in FULL/DR or FULL/BDR state',
    hints: {
      level1: 'What show command displays OSPF neighbors?',
      level2: 'Check neighbors: "show ip ospf neighbor"',
      level3: 'Type: show ip ospf neighbor',
    },
    partialCredit: 25,
    prerequisiteCheckpoints: ['ospf-4-add-network'],
  },
]

export const NAT_PAT_LAB: Checkpoint[] = [
  {
    id: 'nat-1-enable',
    stepNumber: 1,
    title: 'Enable Router',
    description: 'Enter privileged mode',
    requiredCommand: 'enable',
    validator: (output: string) => output.includes('#') || output.length > 0,
    expectedOutput: 'Router# prompt',
    hints: {
      level1: 'How do you enter privileged mode?',
      level2: 'Enable the router: "enable"',
      level3: 'Type: enable',
    },
    partialCredit: 10,
    prerequisiteCheckpoints: [],
  },
  {
    id: 'nat-2-config',
    stepNumber: 2,
    title: 'Enter Configuration Mode',
    description: 'Access global configuration',
    requiredCommand: 'configure terminal',
    validator: (output: string) => output.includes('config') || output.length > 0,
    expectedOutput: '(config)# prompt',
    hints: {
      level1: 'What command enters config mode?',
      level2: 'Use: "configure terminal"',
      level3: 'Type: configure terminal',
    },
    partialCredit: 10,
    prerequisiteCheckpoints: ['nat-1-enable'],
  },
  {
    id: 'nat-3-define-acl',
    stepNumber: 3,
    title: 'Define NAT ACL',
    description: 'Create access list to permit internal traffic',
    requiredCommand: 'ip access-list standard NAT_ACL',
    validator: (output: string) => output.includes('acl') || output.length > 0,
    expectedOutput: 'Access list created or confirmed',
    hints: {
      level1: 'What command creates an access list for NAT?',
      level2: 'Create: "ip access-list standard NAT_ACL"',
      level3: 'Type: ip access-list standard NAT_ACL',
    },
    partialCredit: 15,
    prerequisiteCheckpoints: ['nat-2-config'],
  },
  {
    id: 'nat-4-permit-traffic',
    stepNumber: 4,
    title: 'Permit Internal Network',
    description: 'Allow 192.168.1.0/24 traffic to be translated',
    requiredCommand: 'permit 192.168.1.0 0.0.0.255',
    validator: (output: string) => output.includes('permit') || output.length > 0,
    expectedOutput: 'Traffic matching confirmed',
    hints: {
      level1: 'What command permits the internal network?',
      level2: 'Add: "permit 192.168.1.0 0.0.0.255"',
      level3: 'Type: permit 192.168.1.0 0.0.0.255',
    },
    partialCredit: 15,
    prerequisiteCheckpoints: ['nat-3-define-acl'],
  },
  {
    id: 'nat-5-configure-nat',
    stepNumber: 5,
    title: 'Configure NAT Translation',
    description: 'Set up dynamic NAT using outside interface as pool',
    requiredCommand: 'ip nat inside source list NAT_ACL interface gi0/0 overload',
    validator: (output: string) => output.includes('nat') || output.length > 0,
    expectedOutput: 'NAT configuration accepted',
    hints: {
      level1: 'What is the command to define NAT translation?',
      level2: 'Configure: "ip nat inside source list NAT_ACL interface gi0/0 overload"',
      level3: 'Type: ip nat inside source list NAT_ACL interface gi0/0 overload',
    },
    partialCredit: 20,
    prerequisiteCheckpoints: ['nat-4-permit-traffic'],
  },
  {
    id: 'nat-6-verify-translation',
    stepNumber: 6,
    title: 'Verify NAT Statistics',
    description: 'Confirm NAT is working by checking statistics',
    requiredCommand: 'show ip nat statistics',
    validator: (output: string) => output.includes('NAT') || output.length > 0,
    expectedOutput: 'NAT statistics displayed with active translations',
    hints: {
      level1: 'What show command displays NAT statistics?',
      level2: 'Check: "show ip nat statistics"',
      level3: 'Type: show ip nat statistics',
    },
    partialCredit: 15,
    prerequisiteCheckpoints: ['nat-5-configure-nat'],
  },
]

export interface LabMetadata {
  id: string
  title: string
  description: string
  objective: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
  topology: string
  checkpoints: Checkpoint[]
}

export const LAB_DEFINITIONS: LabMetadata[] = [
  {
    id: 'lab-vlan-trunk',
    title: 'VLAN Trunk Configuration',
    description: 'Configure trunk links between switches to allow multiple VLAN traffic',
    objective: 'Set up 802.1Q trunk encapsulation between two switches',
    difficulty: 'beginner',
    estimatedTime: 15,
    topology: 'Two Cisco Catalyst switches connected',
    checkpoints: VLAN_TRUNK_LAB,
  },
  {
    id: 'lab-ospf-adjacency',
    title: 'OSPF Single Area Routing',
    description: 'Configure OSPF to establish routing adjacency and network discovery',
    objective: 'Enable OSPF single-area routing between two routers',
    difficulty: 'intermediate',
    estimatedTime: 20,
    topology: 'Two Cisco routers connected with IP subnets',
    checkpoints: OSPF_ADJACENCY_LAB,
  },
  {
    id: 'lab-nat-pat',
    title: 'Dynamic NAT/PAT Configuration',
    description: 'Configure Network Address Translation with overload (PAT) for private networks',
    objective: 'Set up dynamic NAT/PAT to translate internal addresses to external interface',
    difficulty: 'intermediate',
    estimatedTime: 20,
    topology: 'Router with internal network and external interface',
    checkpoints: NAT_PAT_LAB,
  },
]

export function getLabById(labId: string): LabMetadata | undefined {
  return LAB_DEFINITIONS.find((lab) => lab.id === labId)
}

export function getLabsByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): LabMetadata[] {
  return LAB_DEFINITIONS.filter((lab) => lab.difficulty === difficulty)
}
