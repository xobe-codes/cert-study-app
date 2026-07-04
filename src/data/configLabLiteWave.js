/**
 * Lab-lite overrides for high-traffic config labs — interpret-only show verification.
 * Applied in getLab() so phase bundles stay as advanced reference in source.
 */
import {
  CLI_VLAN_TRUNK_21_SHOW_OUTPUT,
  CLI_OSPF_SINGLE_34_SHOW_OUTPUT,
  CLI_NAT_41_SHOW_OUTPUT,
  CLI_PORTSEC_56_SHOW_OUTPUT,
  CLI_ACL_CONFIG_55_SHOW_OUTPUT,
  CLI_DHCP_POOL_43_SHOW_OUTPUT,
} from '../lab/cliEngine.js'

export const CONFIG_LAB_LITE_IDS = new Set([
  'LAB-INTERVLAN-SVI',
  'LAB-OSPF-DEFAULT',
  'LAB-STATIC-NAT',
  'LAB-PORT-SECURITY',
  'LAB-EXTENDED-ACL-BUILD',
  'LAB-DHCP-DNS-FLOW',
  'LAB-ACL-CONFIG',
])

const LITE_TASKS = {
  'LAB-INTERVLAN-SVI': [
    { id: 't1', order: 1, title: 'VLANs', device: 'SW1', instruction: 'Confirm VLAN 10 and 20 exist and access ports are assigned.', expectedCommands: ['show vlan brief'] },
    { id: 't2', order: 2, title: 'SVI gateways', device: 'SW1', instruction: 'Verify VLAN 10/20 SVIs are up/up with correct gateways.', expectedCommands: ['show ip interface brief'] },
    { id: 't3', order: 3, title: 'Inter-VLAN routes', device: 'SW1', instruction: 'Confirm connected routes for both VLAN subnets.', expectedCommands: ['show ip route'] },
  ],
  'LAB-OSPF-DEFAULT': [
    { id: 't1', order: 1, title: 'OSPF neighbors', device: 'R2', instruction: 'Verify full adjacency with R1 in area 0.', expectedCommands: ['show ip ospf neighbor'] },
    { id: 't2', order: 2, title: 'Default route', device: 'R2', instruction: 'Confirm O*E2 default 0.0.0.0/0 learned from R1.', expectedCommands: ['show ip route ospf'] },
    { id: 't3', order: 3, title: 'Protocols', device: 'R1', instruction: 'Verify default-information originate is configured on R1.', expectedCommands: ['show ip protocols'] },
  ],
  'LAB-STATIC-NAT': [
    { id: 't1', order: 1, title: 'NAT translations', device: 'R1', instruction: 'After traffic, inside local should map to inside global.', expectedCommands: ['show ip nat translations'] },
    { id: 't2', order: 2, title: 'NAT statistics', device: 'R1', instruction: 'Confirm inside/outside hits on correct interfaces.', expectedCommands: ['show ip nat statistics'] },
  ],
  'LAB-PORT-SECURITY': [
    { id: 't1', order: 1, title: 'Port-security status', device: 'SW1', instruction: 'Verify port-security enabled, max 1, sticky MAC on Fa0/5.', expectedCommands: ['show port-security interface fa0/5'] },
    { id: 't2', order: 2, title: 'Secure addresses', device: 'SW1', instruction: 'Confirm sticky secure MAC learned.', expectedCommands: ['show port-security'] },
  ],
  'LAB-EXTENDED-ACL-BUILD': [
    { id: 't1', order: 1, title: 'ACL entries', device: 'R1', instruction: 'Read WEB_ONLY — permit tcp 80/443, deny ip, implicit deny.', expectedCommands: ['show access-lists WEB_ONLY'] },
    { id: 't2', order: 2, title: 'ACL applied', device: 'R1', instruction: 'Confirm WEB_ONLY inbound on Gi0/0 (office-facing).', expectedCommands: ['show ip interface gi0/0'] },
  ],
  'LAB-DHCP-DNS-FLOW': [
    { id: 't1', order: 1, title: 'DHCP bindings', device: 'R1', instruction: 'Verify client received address from pool with option 3 gateway.', expectedCommands: ['show ip dhcp binding'] },
    { id: 't2', order: 2, title: 'DHCP pool', device: 'R1', instruction: 'Confirm pool network and excluded addresses.', expectedCommands: ['show running-config | section dhcp'] },
  ],
  'LAB-ACL-CONFIG': [
    { id: 't1', order: 1, title: 'Standard ACL', device: 'R1', instruction: 'Verify ACL 10 denies blocked host, permits others.', expectedCommands: ['show access-lists'] },
    { id: 't2', order: 2, title: 'Extended ACL', device: 'R1', instruction: 'Confirm extended ACL on Gi0/2 outbound.', expectedCommands: ['show ip interface gi0/2'] },
  ],
}

const CLI_OUTPUT = {
  'LAB-INTERVLAN-SVI': CLI_VLAN_TRUNK_21_SHOW_OUTPUT,
  'LAB-OSPF-DEFAULT': CLI_OSPF_SINGLE_34_SHOW_OUTPUT,
  'LAB-STATIC-NAT': CLI_NAT_41_SHOW_OUTPUT,
  'LAB-PORT-SECURITY': CLI_PORTSEC_56_SHOW_OUTPUT,
  'LAB-EXTENDED-ACL-BUILD': CLI_ACL_CONFIG_55_SHOW_OUTPUT,
  'LAB-DHCP-DNS-FLOW': CLI_DHCP_POOL_43_SHOW_OUTPUT,
  'LAB-ACL-CONFIG': CLI_ACL_CONFIG_55_SHOW_OUTPUT,
}

export function applyConfigLabLite(bundle) {
  if (!bundle?.lab?.id || !CONFIG_LAB_LITE_IDS.has(bundle.lab.id)) return bundle
  const tasks = LITE_TASKS[bundle.lab.id]
  if (!tasks) return bundle
  const lab = {
    ...bundle.lab,
    interpretOnly: true,
    title: bundle.lab.title.replace(/^Configure/, 'Verify'),
    scenario: `${bundle.lab.scenario} Configuration is pre-loaded — use show commands to verify each objective without typing config.`,
    learningGoals: [
      'Read IOS show output to confirm correct configuration',
      ...(bundle.lab.learningGoals || []).slice(0, 2),
    ],
    tasks,
    cliShowOutput: CLI_OUTPUT[bundle.lab.id] || bundle.lab.cliShowOutput,
  }
  const requiredCommands = tasks.flatMap(t =>
    (t.expectedCommands || []).map(command => ({ device: t.device, command })),
  )
  return {
    ...bundle,
    lab,
    validator: {
      ...bundle.validator,
      labId: lab.id,
      requiredCommands,
    },
  }
}
