/** Engineer-view wave 3 — +1 verify command for verify-heavy objectives (2 cmds → 3+). */

export const FACTORY_ENGINEER_VIEW_WAVE3_SUPPLEMENTS = {
  '2.1': {
    verifyCommands: [
      { command: 'show interfaces switchport', purpose: 'Confirms access vs trunk mode and access VLAN on end ports.' },
    ],
  },
  '2.2': {
    verifyCommands: [
      { command: 'show spanning-tree vlan 1', purpose: 'STP state on trunk uplinks — blocking port explains one-way VLAN traffic.' },
    ],
  },
  '2.3': {
    verifyCommands: [
      { command: 'show cdp entry *', purpose: 'Detailed neighbor capabilities, platform, and IP — beyond the summary table.' },
    ],
  },
  '2.4': {
    verifyCommands: [
      { command: 'show etherchannel detail', purpose: 'Per-member link state, protocol, and load-balance hash method.' },
    ],
  },
  '2.5': {
    verifyCommands: [
      { command: 'show spanning-tree root', purpose: 'Which switch is root per VLAN — confirms election and root port path.' },
    ],
  },
  '3.1': {
    verifyCommands: [
      { command: 'show ip route static', purpose: 'Isolates static and default routes (S/S*) from dynamic entries in the full table.' },
    ],
  },
  '3.2': {
    verifyCommands: [
      { command: 'show ip route 192.168.2.0', purpose: 'Prefix lookup — confirms longest-match winner and [AD/metric] for that destination.' },
    ],
  },
  '3.4': {
    verifyCommands: [
      { command: 'show ip ospf interface brief', purpose: 'Which interfaces run OSPF, area, and cost — catches passive or wrong area on links.' },
    ],
  },
  '4.2': {
    verifyCommands: [
      { command: 'show ntp status', purpose: 'Clock synchronized flag and stratum — confirms NTP vs manual clock set.' },
    ],
  },
  '4.6': {
    verifyCommands: [
      { command: 'show running-config | include helper', purpose: 'Which client-facing interfaces relay DHCP broadcasts to the server.' },
    ],
  },
  '4.8': {
    verifyCommands: [
      { command: 'show running-config | section line vty', purpose: 'transport input ssh and login local on VTY — telnet disabled check.' },
    ],
  },
  '5.5': {
    verifyCommands: [
      { command: 'show access-lists', purpose: 'ACE order, hit counts, and implicit deny — read top-down before changing ACLs.' },
    ],
  },
  '5.6': {
    verifyCommands: [
      { command: 'show ip arp inspection', purpose: 'DAI status per VLAN — confirms snooping bindings back ARP validation.' },
    ],
  },
}
