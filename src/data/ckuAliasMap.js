/** Canonical CKU id aliases for lesson↔bank alignment (synonyms count as supported). */
export const CKU_ALIASES = {
  'CKU-LONGEST-MATCH': 'CKU-LONGEST-PREFIX-MATCH',
  'CKU-ADMIN-DISTANCE': 'CKU-ADMINISTRATIVE-DISTANCE',
  'CKU-STATIC-ROUTING': 'CKU-STATIC-ROUTE',
  'CKU-STATIC': 'CKU-STATIC-ROUTE',
  'CKU-OSPF': 'CKU-OSPFV2',
  'CKU-OSPF-V2': 'CKU-OSPFV2',
  'CKU-IPV6-STATIC': 'CKU-IPV6-STATIC-ROUTE',
  'CKU-DEFAULT': 'CKU-DEFAULT-ROUTE',
  'CKU-FLOATING-STATIC-ROUTE': 'CKU-FLOATING-STATIC',
  'CKU-PORT-SEC': 'CKU-PORT-SECURITY',
  'CKU-WLAN': 'CKU-WIRELESS-LAN',
  'CKU-SSID': 'CKU-WLAN-SSID',
  'CKU-NAT': 'CKU-NETWORK-ADDRESS-TRANSLATION',
  'CKU-PAT': 'CKU-PORT-ADDRESS-TRANSLATION',
  'CKU-ACL-EXTENDED': 'CKU-EXTENDED-ACL',
  'CKU-ACL-STANDARD': 'CKU-STANDARD-ACL',
  'CKU-DHCP': 'CKU-DYNAMIC-HOST-CONFIGURATION',
  'CKU-DNS': 'CKU-DOMAIN-NAME-SYSTEM',
  'CKU-NTP': 'CKU-NETWORK-TIME-PROTOCOL',
  'CKU-SSH-V2': 'CKU-SSH',
  'CKU-TELNET': 'CKU-REMOTE-ACCESS',
  'CKU-VPN-IPSEC': 'CKU-IPSEC',
  'CKU-REST': 'CKU-RESTCONF',
  'CKU-YANG-MODEL': 'CKU-YANG',
  'CKU-JSON-DATA': 'CKU-JSON',
  'CKU-XML-DATA': 'CKU-XML',
}

export function canonicalizeCkuId(id) {
  if (!id) return id
  let cur = id
  // Follow at most a few hops to avoid cycles
  for (let i = 0; i < 4; i++) {
    const next = CKU_ALIASES[cur]
    if (!next || next === cur) break
    cur = next
  }
  return cur
}
