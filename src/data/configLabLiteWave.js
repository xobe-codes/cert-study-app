/**
 * Lab-lite overrides for high-traffic config labs — interpret-only show verification.
 * Applied in getLab() so phase bundles stay as advanced reference in source.
 */
import {
  CLI_VLAN_TRUNK_21_SHOW_OUTPUT,
  CLI_NAT_41_SHOW_OUTPUT,
  CLI_ACL_CONFIG_55_SHOW_OUTPUT,
  CLI_DHCP_POOL_43_SHOW_OUTPUT,
  CLI_STP_PORTFAST_25_SHOW_OUTPUT,
  CLI_FLOATING_STATIC_33_SHOW_OUTPUT,
  CLI_SSH_53_SHOW_OUTPUT,
  CLI_SNMP_44_SHOW_OUTPUT,
  CLI_EC_24_SHOW_OUTPUT,
  CLI_LLDP_23_SHOW_OUTPUT,
  CLI_DAI_56_SHOW_OUTPUT,
  CLI_SUBNET_16_SHOW_OUTPUT,
  CLI_DHCP_SNOOP_27_SHOW_OUTPUT,
  CLI_WIRELESS_ARCH_26_SHOW_OUTPUT,
  CLI_IPV6_STATIC_33_SHOW_OUTPUT,
  CLI_WLAN_SSID_28_SHOW_OUTPUT,
  CLI_MAC_FORWARD_15_SHOW_OUTPUT,
  CLI_WPA2_PSK_59_SHOW_OUTPUT,
  CLI_L3_EC_24_SHOW_OUTPUT,
  CLI_IPV6_ADDR_18_SHOW_OUTPUT,
  CLI_TFTP_BACKUP_49_SHOW_OUTPUT,
} from '../lab/cliEngine.js'

export const CONFIG_LAB_LITE_IDS = new Set([
  'LAB-INTERVLAN-SVI',
  'LAB-STATIC-NAT',
  'LAB-DHCP-DNS-FLOW',
  'LAB-STP-PORTFAST',
  'LAB-SNMP',
  'LAB-ETHERCHANNEL-PAGP',
  'LAB-D22-22',
  'LAB-LLDP',
  'LAB-DAI-DHCP-SNOOPING',
  'LAB-IPV4-SUBNETTING',
  'LAB-DHCP-SNOOP-27',
  'LAB-WIRELESS-ARCH',
  'LAB-IPV6-STATIC',
  'LAB-WLAN-SSID',
  'LAB-MAC-FORWARD-15',
  'LAB-WPA2-PSK-59',
  'LAB-L3-ETHERCHANNEL',
  'LAB-D11-18',
  'LAB-D49-49',
])

const LITE_TASKS = {
  'LAB-INTERVLAN-SVI': [
    { id: 't1', order: 1, title: 'VLANs', device: 'SW1', instruction: 'Confirm VLAN 10 and 20 exist and access ports are assigned.', expectedCommands: ['show vlan brief'] },
    { id: 't2', order: 2, title: 'SVI gateways', device: 'SW1', instruction: 'Verify VLAN 10/20 SVIs are up/up with correct gateways.', expectedCommands: ['show ip interface brief'] },
    { id: 't3', order: 3, title: 'Inter-VLAN routes', device: 'SW1', instruction: 'Confirm connected routes for both VLAN subnets.', expectedCommands: ['show ip route'] },
  ],
  'LAB-STATIC-NAT': [
    { id: 't1', order: 1, title: 'NAT translations', device: 'R1', instruction: 'After traffic, inside local should map to inside global.', expectedCommands: ['show ip nat translations'] },
    { id: 't2', order: 2, title: 'NAT statistics', device: 'R1', instruction: 'Confirm inside/outside hits on correct interfaces.', expectedCommands: ['show ip nat statistics'] },
    { id: 't3', order: 3, title: 'Raw config', device: 'R1', instruction: 'Run show running-config | include nat — confirms the static mapping and inside/outside roles are saved to config, not just visible in the live translation table.', expectedCommands: ['show running-config | include nat'] },
  ],
  'LAB-DHCP-DNS-FLOW': [
    { id: 't1', order: 1, title: 'DHCP bindings', device: 'R1', instruction: 'Verify client received address from pool with option 3 gateway.', expectedCommands: ['show ip dhcp binding'] },
    { id: 't2', order: 2, title: 'DHCP pool', device: 'R1', instruction: 'Confirm pool network and excluded addresses.', expectedCommands: ['show running-config | section dhcp'] },
    { id: 't3', order: 3, title: 'Pool operational state', device: 'R1', instruction: 'Run show ip dhcp pool — the leased/available address counts confirm the pool is actively serving clients, not just configured correctly.', expectedCommands: ['show ip dhcp pool'] },
  ],
  'LAB-ACL-CONFIG': [
    { id: 't1', order: 1, title: 'Standard ACL', device: 'R1', instruction: 'Verify ACL 10 denies blocked host, permits others.', expectedCommands: ['show access-lists'] },
    { id: 't2', order: 2, title: 'Extended ACL', device: 'R1', instruction: 'Confirm extended ACL on Gi0/2 outbound.', expectedCommands: ['show ip interface gi0/2'] },
  ],
  'LAB-STP-PORTFAST': [
    { id: 't1', order: 1, title: 'PortFast', device: 'SW1', instruction: 'Confirm PortFast on Fa0/1 access port.', expectedCommands: ['show spanning-tree interface fa0/1 portfast'] },
    { id: 't2', order: 2, title: 'BPDU Guard', device: 'SW1', instruction: 'Verify BPDU Guard enabled on the edge port.', expectedCommands: ['show running-config | include portfast'] },
    { id: 't3', order: 3, title: 'Port state', device: 'SW1', instruction: 'Run show spanning-tree interface fa0/1 — confirms the port is already forwarding and BPDU guard is active, not just present in the config.', expectedCommands: ['show spanning-tree interface fa0/1'] },
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
    { id: 't3', order: 3, title: 'Raw config', device: 'R1', instruction: 'Run show running-config | include snmp — confirms the community string and trap host are saved to the config, matching what the operational commands reported.', expectedCommands: ['show running-config | include snmp'] },
  ],
  'LAB-ETHERCHANNEL-PAGP': [
    { id: 't1', order: 1, title: 'EtherChannel summary', device: 'SW1', instruction: 'Confirm Po2 bundled with member ports up.', expectedCommands: ['show etherchannel summary'] },
    { id: 't2', order: 2, title: 'Member config', device: 'SW1', instruction: 'Verify channel-group mode desirable on trunks.', expectedCommands: ['show running-config | section interface'] },
    { id: 't3', order: 3, title: 'Protocol confirmation', device: 'SW1', instruction: 'Run show etherchannel port-channel — confirms PAgP specifically negotiated the bundle, matching the desirable mode configured.', expectedCommands: ['show etherchannel port-channel'] },
  ],
  'LAB-D22-22': [
    { id: 't1', order: 1, title: 'Trunk status', device: 'SW1', instruction: 'Confirm 802.1Q trunk up with allowed VLANs.', expectedCommands: ['show interfaces trunk'] },
    { id: 't2', order: 2, title: 'VLANs', device: 'SW1', instruction: 'Verify VLANs carried on the trunk.', expectedCommands: ['show vlan brief'] },
    { id: 't3', order: 3, title: 'Native VLAN detail', device: 'SW1', instruction: 'Run show interfaces gi0/1 switchport — confirms the native VLAN 99 setting specifically, which the trunk summary table only shows in a compact column.', expectedCommands: ['show interfaces gi0/1 switchport'] },
  ],
  'LAB-LLDP': [
    { id: 't1', order: 1, title: 'LLDP neighbors', device: 'SW1', instruction: 'Confirm LLDP discovers SW2 on Gi0/1.', expectedCommands: ['show lldp neighbors'] },
    { id: 't2', order: 2, title: 'CDP disabled', device: 'SW1', instruction: 'Verify CDP is off and LLDP is running.', expectedCommands: ['show running-config | include cdp'] },
    { id: 't3', order: 3, title: 'Neighbor detail', device: 'SW1', instruction: 'Run show lldp neighbors detail — full detail confirms the neighbor\'s exact port and capabilities, not just that a neighbor exists.', expectedCommands: ['show lldp neighbors detail'] },
  ],
  'LAB-DAI-DHCP-SNOOPING': [
    { id: 't1', order: 1, title: 'DHCP snooping', device: 'SW1', instruction: 'Confirm snooping enabled on VLAN 1 with bindings.', expectedCommands: ['show ip dhcp snooping binding'] },
    { id: 't2', order: 2, title: 'DAI status', device: 'SW1', instruction: 'Verify Dynamic ARP Inspection active on VLAN 1.', expectedCommands: ['show ip arp inspection vlan 1'] },
    { id: 't3', order: 3, title: 'Server-side lease', device: 'SW1', instruction: 'Run show ip dhcp binding — cross-checks the DHCP server\'s own lease table against the snooping binding table DAI relies on to validate ARP.', expectedCommands: ['show ip dhcp binding'] },
  ],
  'LAB-IPV4-SUBNETTING': [
    { id: 't1', order: 1, title: 'Connected routes', device: 'R1', instruction: 'Verify /26 and /27 connected routes from router-on-a-stick subinterfaces.', expectedCommands: ['show ip route'] },
    { id: 't2', order: 2, title: 'Subinterface IPs', device: 'R1', instruction: 'Confirm Gi0/0.10 and Gi0/0.20 are up/up with correct masks.', expectedCommands: ['show ip interface brief'] },
    { id: 't3', order: 3, title: 'Trunk VLANs', device: 'SW1', instruction: 'Verify trunk carries VLANs 10 and 20 to the router.', expectedCommands: ['show interfaces trunk'] },
  ],
  'LAB-DHCP-SNOOP-27': [
    { id: 't1', order: 1, title: 'Snooping status', device: 'SW1', instruction: 'Confirm DHCP snooping enabled and uplink Gi0/1 trusted.', expectedCommands: ['show ip dhcp snooping'] },
    { id: 't2', order: 2, title: 'Bindings', device: 'SW1', instruction: 'Verify legitimate DHCP bindings on access ports.', expectedCommands: ['show ip dhcp snooping binding'] },
    { id: 't3', order: 3, title: 'Raw config', device: 'SW1', instruction: 'Run show running-config | include ip dhcp snooping — confirms the trust setting is saved to config, not just active in the current session.', expectedCommands: ['show running-config | include ip dhcp snooping'] },
  ],
  'LAB-WIRELESS-ARCH': [
    { id: 't1', order: 1, title: 'AP join state', device: 'WLC1', instruction: 'Confirm all lightweight APs show Joined in CAPWAP mode.', expectedCommands: ['show ap summary'] },
    { id: 't2', order: 2, title: 'Client associations', device: 'WLC1', instruction: 'Read client MAC, AP, WLAN, and VLAN from WLC summary.', expectedCommands: ['show wireless client summary'] },
    { id: 't3', order: 3, title: 'CAPWAP tunnels', device: 'WLC1', instruction: 'Verify control (UDP 5246) and data (UDP 5247) channels are UP.', expectedCommands: ['show capwap detail'] },
  ],
  'LAB-IPV6-STATIC': [
    { id: 't1', order: 1, title: 'Static route', device: 'R1', instruction: 'Confirm static route to remote /64 via next-hop.', expectedCommands: ['show ipv6 route static'] },
    { id: 't2', order: 2, title: 'Interface addresses', device: 'R1', instruction: 'Verify global unicast on the point-to-point link.', expectedCommands: ['show ipv6 interface brief'] },
    { id: 't3', order: 3, title: 'Full routing table', device: 'R1', instruction: 'Run show ipv6 route — seeing the static route alongside the connected /64 confirms it installed correctly relative to the rest of the table, not in isolation.', expectedCommands: ['show ipv6 route'] },
  ],
  'LAB-WLAN-SSID': [
    { id: 't1', order: 1, title: 'WLAN policy', device: 'WLC1', instruction: 'Confirm CORP_WIFI enabled with WPA2-PSK and AES.', expectedCommands: ['show wlan summary'] },
    { id: 't2', order: 2, title: 'AP registration', device: 'WLC1', instruction: 'Verify lightweight APs joined to WLC.', expectedCommands: ['show ap summary'] },
    { id: 't3', order: 3, title: 'WLAN detail', device: 'WLC1', instruction: 'Run show wlan CORP_WIFI — the per-WLAN detail confirms the exact security policy and VLAN mapping the summary table only implies.', expectedCommands: ['show wlan CORP_WIFI'] },
  ],
  'LAB-MAC-FORWARD-15': [
    { id: 't1', order: 1, title: 'MAC table', device: 'SW1', instruction: 'Read dynamic and static CAM entries on VLAN 10.', expectedCommands: ['show mac address-table'] },
    { id: 't2', order: 2, title: 'Dynamic entries', device: 'SW1', instruction: 'Confirm learned source MACs after host traffic.', expectedCommands: ['show mac address-table dynamic'] },
    { id: 't3', order: 3, title: 'Entry counts', device: 'SW1', instruction: 'Verify static server MAC and aging timer effect.', expectedCommands: ['show mac address-table count'] },
  ],
  'LAB-WPA2-PSK-59': [
    { id: 't1', order: 1, title: 'WLAN summary', device: 'WLC1', instruction: 'Confirm GUEST_WIFI enabled with WPA2-PSK + AES.', expectedCommands: ['show wlan summary'] },
    { id: 't2', order: 2, title: 'WLAN detail', device: 'WLC1', instruction: 'Verify PSK security and VLAN 30 interface mapping.', expectedCommands: ['show wlan GUEST_WIFI'] },
    { id: 't3', order: 3, title: 'Client association', device: 'WLC1', instruction: 'Run show client summary — confirms a real client is associated and getting an IP on VLAN 30, not just that the WLAN config looks correct.', expectedCommands: ['show client summary'] },
  ],
  'LAB-L3-ETHERCHANNEL': [
    { id: 't1', order: 1, title: 'L3 bundle', device: 'R1', instruction: 'Confirm routed Po1 (RU) with LACP members up.', expectedCommands: ['show etherchannel summary'] },
    { id: 't2', order: 2, title: 'Po1 addressing', device: 'R1', instruction: 'Verify IP on Port-channel1, not physical members.', expectedCommands: ['show ip interface brief'] },
    { id: 't3', order: 3, title: 'Raw config', device: 'R1', instruction: 'Run show running-config interface port-channel 1 — confirms the IP is configured on the logical Po1 interface itself, not accidentally left on a physical member.', expectedCommands: ['show running-config interface port-channel 1'] },
  ],
  'LAB-D11-18': [
    { id: 't1', order: 1, title: 'IPv6 interfaces', device: 'R1', instruction: 'Confirm global /64 and link-local on Gi0/0.', expectedCommands: ['show ipv6 interface brief'] },
    { id: 't2', order: 2, title: 'Address detail', device: 'R1', instruction: 'Read full GUA and FE80:: addresses on the LAN interface.', expectedCommands: ['show ipv6 interface gi0/0'] },
    { id: 't3', order: 3, title: 'Routing table', device: 'R1', instruction: 'Run show ipv6 route connected — confirms the /64 is not just assigned to the interface but actually installed for forwarding.', expectedCommands: ['show ipv6 route connected'] },
  ],
  'LAB-D49-49': [
    { id: 't1', order: 1, title: 'Flash contents', device: 'R1', instruction: 'List IOS image files stored on flash.', expectedCommands: ['show flash:'] },
    { id: 't2', order: 2, title: 'File systems', device: 'R1', instruction: 'Confirm flash filesystem and image path for backup verification.', expectedCommands: ['show file systems'] },
    { id: 't3', order: 3, title: 'Running image confirmation', device: 'R1', instruction: 'Run show version — confirms the exact IOS image filename actually running matches the one sitting in flash before starting the TFTP backup.', expectedCommands: ['show version'] },
  ],
}

const CLI_OUTPUT = {
  'LAB-INTERVLAN-SVI': CLI_VLAN_TRUNK_21_SHOW_OUTPUT,
  'LAB-STATIC-NAT': CLI_NAT_41_SHOW_OUTPUT,
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
  'LAB-IPV4-SUBNETTING': CLI_SUBNET_16_SHOW_OUTPUT,
  'LAB-DHCP-SNOOP-27': CLI_DHCP_SNOOP_27_SHOW_OUTPUT,
  'LAB-WIRELESS-ARCH': CLI_WIRELESS_ARCH_26_SHOW_OUTPUT,
  'LAB-IPV6-STATIC': CLI_IPV6_STATIC_33_SHOW_OUTPUT,
  'LAB-WLAN-SSID': CLI_WLAN_SSID_28_SHOW_OUTPUT,
  'LAB-MAC-FORWARD-15': CLI_MAC_FORWARD_15_SHOW_OUTPUT,
  'LAB-WPA2-PSK-59': CLI_WPA2_PSK_59_SHOW_OUTPUT,
  'LAB-L3-ETHERCHANNEL': CLI_L3_EC_24_SHOW_OUTPUT,
  'LAB-D11-18': CLI_IPV6_ADDR_18_SHOW_OUTPUT,
  'LAB-D49-49': CLI_TFTP_BACKUP_49_SHOW_OUTPUT,
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
