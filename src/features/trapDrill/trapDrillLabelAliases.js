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

  // Factory-trap alignment (high-traffic objectives)
  'the switch with the highest bridge priority becomes the stp root.': 'CKU-STP-ROOT',
  'extended acls should be placed close to the destination.': 'CKU-EXTENDED-ACL',
  'vlans on a layer 2 switch route between each other automatically.': 'CKU-INTER-VLAN',
  'dhcp offer is sent by the client.': 'CKU-DHCP',
  'static nat is the best choice when many inside hosts share one public ip.': 'CKU-NAT-PAT',
}
