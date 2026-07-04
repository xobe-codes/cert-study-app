/**
 * Config vs interpret-only lab tiering — 25 labs require IOS config entry;
 * high-traffic objectives also ship interpret-only alternates for exam prep.
 */

/** @type {Set<string>} */
export const CONFIG_LAB_IDS = new Set([
  'LAB-DAI-DHCP-SNOOPING',
  'LAB-STATIC-FLOATING',
  'LAB-SSH-ACCESS',
  'LAB-ACL-CONFIG',
  'LAB-IPV4-SUBNETTING',
  'LAB-DHCP-SNOOP-27',
  'LAB-WIRELESS-ARCH',
  'LAB-DHCP-DNS-FLOW',
  'LAB-PORT-SECURITY',
  'LAB-EXTENDED-ACL-BUILD',
  'LAB-STATIC-NAT',
  'LAB-INTERVLAN-SVI',
  'LAB-STP-PORTFAST',
  'LAB-IPV6-STATIC',
  'LAB-OSPF-DEFAULT',
  'LAB-WLAN-SSID',
  'LAB-MAC-FORWARD-15',
  'LAB-WPA2-PSK-59',
  'LAB-LLDP',
  'LAB-SNMP',
  'LAB-ETHERCHANNEL-PAGP',
  'LAB-L3-ETHERCHANNEL',
  'LAB-D11-18',
  'LAB-D22-22',
  'LAB-D49-49',
])

/** Preferred interpret-only alternate for stem-replay / exam-prep paths. */
export const INTERPRET_ALTERNATE_BY_CONFIG = {
  'LAB-EXTENDED-ACL-BUILD': 'LAB-TS-ACL-PLACEMENT',
  'LAB-ACL-CONFIG': 'LAB-ACL-CONFIG-55',
  'LAB-STATIC-NAT': 'LAB-NAT-PAT',
  'LAB-OSPF-DEFAULT': 'LAB-OSPF-SINGLE-AREA',
  'LAB-INTERVLAN-SVI': 'LAB-VLAN-TRUNK',
  'LAB-PORT-SECURITY': 'LAB-PORTSEC-56',
  'LAB-DAI-DHCP-SNOOPING': 'LAB-PORTSEC-56',
  'LAB-DHCP-DNS-FLOW': 'LAB-DHCP-RELAY',
  'LAB-STP-PORTFAST': 'LAB-STP-ROOT',
  'LAB-ETHERCHANNEL-PAGP': 'LAB-ETHERCHANNEL',
  'LAB-L3-ETHERCHANNEL': 'LAB-ETHERCHANNEL',
  'LAB-SNMP': 'LAB-SNMP-CONFIG-44',
  'LAB-D49-49': 'LAB-TFTP-CONFIG-49',
  'LAB-DHCP-SNOOP-27': 'LAB-D27-27',
}

export function isConfigLab(labOrId) {
  const id = typeof labOrId === 'string' ? labOrId : labOrId?.id
  if (!id) return false
  if (labOrId?.interpretOnly) return false
  return CONFIG_LAB_IDS.has(id)
}

export function getInterpretAlternate(labId) {
  return INTERPRET_ALTERNATE_BY_CONFIG[labId] || null
}

export function labTierLabel(lab) {
  if (lab?.interpretOnly) return 'interpret'
  if (isConfigLab(lab)) return 'config-advanced'
  return 'guided'
}
