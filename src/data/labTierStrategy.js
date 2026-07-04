/**
 * Config vs interpret-only lab tiering — all former typing labs ship as lab-lite verify paths.
 * High-traffic objectives also ship interpret-only alternates for exam prep / stem-replay.
 */

/** @type {Set<string>} */
export const CONFIG_LAB_IDS = new Set([])

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
  'LAB-IPV4-SUBNETTING': 'LAB-VLAN-TRUNK',
  'LAB-IPV6-STATIC': 'LAB-31-ROUTE-INTERPRET',
  'LAB-WLAN-SSID': 'LAB-WLAN-SEC-58',
  'LAB-WPA2-PSK-59': 'LAB-WLAN-SEC-58',
  'LAB-WIRELESS-ARCH': 'LAB-WLAN-SEC-58',
  'LAB-MAC-FORWARD-15': 'LAB-D11-11',
  'LAB-D11-18': 'LAB-D11-19',
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
