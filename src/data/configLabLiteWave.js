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
  CLI_STP_PORTFAST_25_SHOW_OUTPUT,
  CLI_FLOATING_STATIC_33_SHOW_OUTPUT,
  CLI_SSH_53_SHOW_OUTPUT,
  CLI_SNMP_44_SHOW_OUTPUT,
  CLI_EC_24_SHOW_OUTPUT,
  CLI_LLDP_23_SHOW_OUTPUT,
  CLI_DAI_56_SHOW_OUTPUT,
} from '../lab/cliEngine.js'

export const CONFIG_LAB_LITE_IDS = new Set([
  'LAB-INTERVLAN-SVI',
  'LAB-OSPF-DEFAULT',
  'LAB-STATIC-NAT',
  'LAB-PORT-SECURITY',
  'LAB-EXTENDED-ACL-BUILD',
  'LAB-DHCP-DNS-FLOW',
  'LAB-ACL-CONFIG',
  'LAB-STP-PORTFAST',
  'LAB-STATIC-FLOATING',
  'LAB-SSH-ACCESS',
  'LAB-SNMP',
  'LAB-ETHERCHANNEL-PAGP',
  'LAB-D22-22',
  'LAB-LLDP',
  'LAB-DAI-DHCP-SNOOPING',
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
  'LAB-STP-PORTFAST': [
    { id: 't1', order: 1, title: 'PortFast', device: 'SW1', instruction: 'Confirm PortFast on Fa0/1 access port.', expectedCommands: ['show spanning-tree interface fa0/1 portfast'] },
    { id: 't2', order: 2, title: 'BPDU Guard', device: 'SW1', instruction: 'Verify BPDU Guard enabled on the edge port.', expectedCommands: ['show running-config | include portfast'] },
  ],
  'LAB-STATIC-FLOATING': [
    { id: 't1', order: 1, title: 'Primary static', device: 'R1', instruction: 'Confirm active static to 10.0.2.0/24 via primary next-hop (AD 1).', expectedCommands: ['show ip route static'] },
    { id: 't2', order: 2, title: 'Floating backup', device: 'R1', instruction: 'Verify floating static exists with AD 5 on backup path.', expectedCommands: ['show running-config | include ip route'] },
  ],
  'LAB-SSH-ACCESS': [
    { id: 't1', order: 1, title: 'SSH service', device: 'R1', instruction: 'Confirm SSH v2 enabled with RSA keys.', expectedCommands: ['show ip ssh'] },
    { id: 't2', order: 2, title: 'VTY restriction', device: 'R1', instruction: 'Verify VTY lines allow SSH only with local login.', expectedCommands: ['show running-config | section line vty'] },
  ],
  'LAB-SNMP': [
    { id: 't1', order: 1, title: 'RO community', device: 'R1', instruction: 'Confirm read-only SNMP community configured.', expectedCommands: ['show snmp community'] },
    { id: 't2', order: 2, title: 'Trap host', device: 'R1', instruction: 'Verify trap destination and SNMP settings.', expectedCommands: ['show snmp'] },
  ],
  'LAB-ETHERCHANNEL-PAGP': [
    { id: 't1', order: 1, title: 'EtherChannel summary', device: 'SW1', instruction: 'Confirm Po2 bundled with member ports up.', expectedCommands: ['show etherchannel summary'] },
    { id: 't2', order: 2, title: 'Member config', device: 'SW1', instruction: 'Verify channel-group mode desirable on trunks.', expectedCommands: ['show running-config | section interface'] },
  ],
  'LAB-D22-22': [
    { id: 't1', order: 1, title: 'Trunk status', device: 'SW1', instruction: 'Confirm 802.1Q trunk up with allowed VLANs.', expectedCommands: ['show interfaces trunk'] },
    { id: 't2', order: 2, title: 'VLANs', device: 'SW1', instruction: 'Verify VLANs carried on the trunk.', expectedCommands: ['show vlan brief'] },
  ],
  'LAB-LLDP': [
    { id: 't1', order: 1, title: 'LLDP neighbors', device: 'SW1', instruction: 'Confirm LLDP discovers SW2 on Gi0/1.', expectedCommands: ['show lldp neighbors'] },
    { id: 't2', order: 2, title: 'CDP disabled', device: 'SW1', instruction: 'Verify CDP is off and LLDP is running.', expectedCommands: ['show running-config | include cdp'] },
  ],
  'LAB-DAI-DHCP-SNOOPING': [
    { id: 't1', order: 1, title: 'DHCP snooping', device: 'SW1', instruction: 'Confirm snooping enabled on VLAN 1 with bindings.', expectedCommands: ['show ip dhcp snooping binding'] },
    { id: 't2', order: 2, title: 'DAI status', device: 'SW1', instruction: 'Verify Dynamic ARP Inspection active on VLAN 1.', expectedCommands: ['show ip arp inspection vlan 1'] },
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
  'LAB-STP-PORTFAST': CLI_STP_PORTFAST_25_SHOW_OUTPUT,
  'LAB-STATIC-FLOATING': CLI_FLOATING_STATIC_33_SHOW_OUTPUT,
  'LAB-SSH-ACCESS': CLI_SSH_53_SHOW_OUTPUT,
  'LAB-SNMP': CLI_SNMP_44_SHOW_OUTPUT,
  'LAB-ETHERCHANNEL-PAGP': CLI_EC_24_SHOW_OUTPUT,
  'LAB-D22-22': CLI_VLAN_TRUNK_21_SHOW_OUTPUT,
  'LAB-LLDP': CLI_LLDP_23_SHOW_OUTPUT,
  'LAB-DAI-DHCP-SNOOPING': CLI_DAI_56_SHOW_OUTPUT,
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
