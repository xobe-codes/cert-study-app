/**
 * Maps missed-bank fallbacks and factory-trap strings to trap-drill CKU ids.
 * Keys use the same norm() as resolveTrapDrillCku (lowercase, collapsed whitespace).
 */
export const TRAP_DRILL_LABEL_ALIASES = {
  // Missed-bank concept fallbacks (missedTrapGroups.js)
  'vlan confusion': 'CKU-INTER-VLAN',
  'stp confusion': 'CKU-STP-ROOT',
  'ospf confusion': 'CKU-OSPF',
  'nat confusion': 'CKU-NAT-PAT',
  'acl confusion': 'CKU-ACL',
  'dhcp confusion': 'CKU-DHCP',
  'subnetting confusion': 'CKU-SUBNETTING',
  'routing confusion': 'CKU-ADMINISTRATIVE-DISTANCE',
  'switching confusion': 'CKU-ARP',

  // Common weakness / misconception strings
  'root bridge confusion': 'CKU-STP-ROOT',
  'expecting a switch to route by ip': 'CKU-INTER-VLAN',
  'confusing physical signaling with routing': 'CKU-TCP-UDP',

  // SADE / inferTrapForChoice families
  'assuming unknown destination means drop/filter': 'CKU-ARP',
  'confusing switch behavior with ping/reply thinking': 'CKU-ARP',
  'applying default-gateway logic to a layer 2 switch decision': 'CKU-INTER-VLAN',
  'confusing source mac (learning) with destination mac (forwarding lookup)': 'CKU-ARP',
  'assuming both mac addresses are learned into the cam table': 'CKU-ARP',
  'applying layer 3 (ip) behavior to a layer 2 switch process': 'CKU-ARP',
  'using router behavior (routing table) on a switch question': 'CKU-ARP',
  'using switch/l2 forwarding behavior on a router question': 'CKU-ADMINISTRATIVE-DISTANCE',
  'choosing flood behavior when the destination is already in the mac table': 'CKU-ARP',
  'choosing drop when the switch should forward or flood': 'CKU-ARP',
  'confusing inside local, inside global, and outside addresses': 'CKU-NAT-PAT',
  'mixing up pat/overload with static or dynamic nat': 'CKU-NAT-PAT',
  'confusing dhcp server, relay agent, and client roles': 'CKU-DHCP',
  'standard vs extended acl placement or wildcard masks': 'CKU-ACL',
  'ospf neighbor requirements or dr/bdr election rules': 'CKU-OSPF',
  'confusing stp port roles (root, designated, blocked)': 'CKU-STP-ROOT',
  'confusing vlan tagging, trunking, and access ports': 'CKU-INTER-VLAN',
  'static route next-hop vs exit-interface behavior': 'CKU-ADMINISTRATIVE-DISTANCE',

  // CONCEPT_TRAPS from inferTrapForChoice (services + MAC)
  'reversing forward vs reverse dns lookup': 'CKU-DNS-RECORDS',
  'mixing snmp versions or trap vs inform behavior': 'CKU-SNMPv2',
  'misreading syslog severity (lower number = more severe)': 'CKU-SYSLOG',
  'confusing ntp stratum direction or client/server role': 'CKU-NTP-STRATUM',
  'confusing how switches learn source macs vs use destination macs': 'CKU-ARP',

  // Factory-trap alignment (high-traffic objectives)
  'the switch with the highest bridge priority becomes the stp root.': 'CKU-STP-ROOT',
  'extended acls should be placed close to the destination.': 'CKU-EXTENDED-ACL',
  'vlans on a layer 2 switch route between each other automatically.': 'CKU-INTER-VLAN',
  'dhcp offer is sent by the client.': 'CKU-DHCP',
  'static nat is the best choice when many inside hosts share one public ip.': 'CKU-NAT-PAT',
}
