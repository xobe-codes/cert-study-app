/** Engineer-view wave 4 — +1 verify command for remaining thin objectives (2 → 3+). */

export const FACTORY_ENGINEER_VIEW_WAVE4_SUPPLEMENTS = {
  '1.1': {
    verifyCommands: [
      { command: 'show version', purpose: 'Platform, IOS image, and uptime — confirms device role before deep troubleshooting.' },
    ],
  },
  '1.2': {
    verifyCommands: [
      { command: 'show spanning-tree summary', purpose: 'Root bridge and port counts — validates redundancy in layered campus designs.' },
    ],
  },
  '1.3': {
    verifyCommands: [
      { command: 'show controllers ethernetController 0', purpose: 'Physical layer status — cable/SFP errors before blaming VLAN or routing.' },
    ],
  },
  '1.4': {
    verifyCommands: [
      { command: 'show running-config interface gi0/1', purpose: 'Configured speed/duplex/shutdown — compare to show interfaces counters.' },
    ],
  },
  '1.5': {
    verifyCommands: [
      { command: 'show vlan brief', purpose: 'VLAN membership on ports — unknown unicast flooding often wrong VLAN assignment.' },
    ],
  },
  '1.6': {
    verifyCommands: [
      { command: 'show ip route connected', purpose: 'Which subnets the device owns — validates mask math against configured interfaces.' },
    ],
  },
  '1.7': {
    verifyCommands: [
      { command: 'show ip interface brief', purpose: 'Which interfaces use RFC 1918 space — edge NAT placement check.' },
    ],
  },
  '1.8': {
    verifyCommands: [
      { command: 'show ipv6 dhcp interface', purpose: 'SLAAC/DHCPv6 client state — global address missing vs link-local only.' },
    ],
  },
  '1.9': {
    verifyCommands: [
      { command: 'show ipv6 route summary', purpose: 'Installed global vs link-local routes — scope mistakes show up here first.' },
    ],
  },
  '1.10': {
    verifyCommands: [
      { command: 'show arp', purpose: 'Resolved MAC for default gateway — L2 break when IP config looks correct.' },
    ],
  },
  '1.11': {
    verifyCommands: [
      { command: 'show wireless ap summary', purpose: 'AP count, model, and join state — RF issues vs infrastructure join failures.' },
    ],
  },
  '1.12': {
    verifyCommands: [
      { command: 'show ip interface brief', purpose: 'Hypervisor uplink L3 — VM port groups must map to real switch VLANs.' },
    ],
  },
  '2.6': {
    verifyCommands: [
      { command: 'show wlan summary', purpose: 'SSID/WLAN policy on WLC — lightweight APs inherit config from controller.' },
    ],
  },
  '2.7': {
    verifyCommands: [
      { command: 'show vlan brief', purpose: 'Management vs client VLAN IDs on AP uplink — trunk allowed list check.' },
    ],
  },
  '2.8': {
    verifyCommands: [
      { command: 'show client summary', purpose: 'Associated clients, VLAN, and encryption — post-association L3 failures.' },
    ],
  },
  '4.1': {
    verifyCommands: [
      { command: 'show ip nat statistics', purpose: 'Inside/outside interface labels and hit counts — NAT not working without correct sides.' },
    ],
  },
  '4.3': {
    verifyCommands: [
      { command: 'show ip dhcp relay information', purpose: 'Which interfaces relay DHCP — option 82 and helper-address verify.' },
    ],
  },
  '4.4': {
    verifyCommands: [
      { command: 'show snmp user', purpose: 'SNMPv3 users and auth/priv — v2c community is clear-text exam trap.' },
    ],
  },
  '4.5': {
    verifyCommands: [
      { command: 'show logging history', purpose: 'Recent buffered messages — confirms severity filter and local capture.' },
    ],
  },
  '4.7': {
    verifyCommands: [
      { command: 'show queueing interface gi0/1', purpose: 'Queue depth and drops — marking without queuing policy does nothing.' },
    ],
  },
  '4.9': {
    verifyCommands: [
      { command: 'show bootflash:', purpose: 'IOS image files and free space — copy fails if filesystem is full.' },
    ],
  },
  '4.10': {
    verifyCommands: [
      { command: 'show license status', purpose: 'Smart Licensing and DNA feature entitlement — cloud vs local CLI coexistence.' },
    ],
  },
  '5.1': {
    verifyCommands: [
      { command: 'show run | include access-list', purpose: 'Where ACLs are defined — map controls to CIA triad when triaging.' },
    ],
  },
  '5.2': {
    verifyCommands: [
      { command: 'show archive log config all', purpose: 'Config change history — governance and rollback in security programs.' },
    ],
  },
  '5.3': {
    verifyCommands: [
      { command: 'show users', purpose: 'Active console/VTY sessions — unexpected logins during hardening review.' },
    ],
  },
  '5.4': {
    verifyCommands: [
      { command: 'show aaa method-lists', purpose: 'Authentication/authorization/accounting order — local fallback vs TACACS+.' },
    ],
  },
  '5.7': {
    verifyCommands: [
      { command: 'show privilege', purpose: 'Current privilege level — authorization failure vs authentication failure.' },
    ],
  },
  '5.8': {
    verifyCommands: [
      { command: 'show wlan security summary', purpose: 'WPA2/WPA3 and 802.1X policy per WLAN — enterprise vs PSK mismatch.' },
    ],
  },
  '5.9': {
    verifyCommands: [
      { command: 'show wlan summary', purpose: 'SSID-to-VLAN mapping — WPA2-PSK clients on wrong subnet after associate.' },
    ],
  },
  '5.10': {
    verifyCommands: [
      { command: 'show crypto map', purpose: 'IPsec policy and interesting traffic ACL — phase 2 up but no flows.' },
    ],
  },
  '5.11': {
    verifyCommands: [
      { command: 'show ip access-groups', purpose: 'Which ACLs are applied inbound/outbound per interface — segmentation enforcement.' },
    ],
  },
  '6.1': {
    verifyCommands: [
      { command: 'show archive config', purpose: 'Saved config snapshots — automation rollback and drift detection baseline.' },
    ],
  },
  '6.2': {
    verifyCommands: [
      { command: 'show license feature', purpose: 'Controller/SDN features enabled — traditional IOS vs overlay coexistence.' },
    ],
  },
  '6.3': {
    verifyCommands: [
      { command: 'show openflow controller', purpose: 'Southbound controller association — SDN control vs data plane separation.' },
    ],
  },
  '6.4': {
    verifyCommands: [
      { command: 'show pnp summary', purpose: 'DNA Center PnP/ZTP state — device stuck in provisioning vs onboarded.' },
    ],
  },
  '6.5': {
    verifyCommands: [
      { command: 'show restconf', purpose: 'RESTCONF/YANG API enabled — northbound automation vs legacy Telnet.' },
    ],
  },
  '6.6': {
    verifyCommands: [
      { command: 'show archive config incremental-list', purpose: 'Config change deltas — Ansible/Puppet desired-state vs running config.' },
    ],
  },
}
