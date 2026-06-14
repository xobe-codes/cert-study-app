/**
 * Source bank file map — mirrors convertQuestionBank.mjs crosswalk.
 * Grouped by CCNA domain for domain-by-domain clean bank builds.
 */

export const OSPF_34_EXCLUDE = new Set([
  'obj-3.4-source-q007', 'obj-3.4-source-q008', 'obj-3.4-source-q009', 'obj-3.4-source-q011',
  'obj-3.4-source-q038', 'obj-3.4-source-q039', 'obj-3.4-source-q040', 'obj-3.4-source-q043',
  'obj-3.4-source-q044', 'obj-3.4-source-q045', 'obj-3.4-source-q059', 'obj-3.4-source-q062',
])

export const SOURCE_BANK_FOLDERS = [
  'domain2-rest-2.3-to-2.9-validation',
  'domain3-ip-connectivity-validation',
  'domain4-ip-services-validation',
  'domain5-domain6-validation',
]

/** @type {Record<string, { domain: number, name: string, objectives: string[] }>} */
export const DOMAIN_META = {
  2: { domain: 2, name: 'Network Access', objectives: ['2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8'] },
  3: { domain: 3, name: 'IP Connectivity', objectives: ['3.1', '3.2', '3.3', '3.4', '3.5'] },
  4: { domain: 4, name: 'IP Services', objectives: ['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.9'] },
  5: { domain: 5, name: 'Security Fundamentals', objectives: ['5.1', '5.2', '5.3', '5.5', '5.6', '5.7', '5.8', '5.9', '5.10'] },
  6: { domain: 6, name: 'Automation & Programmability', objectives: ['6.1', '6.2', '6.3', '6.4', '6.5', '6.6'] },
}

export const DOMAIN_1_OBJECTIVES = ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '1.10', '1.11', '1.12']

/** @type {{ qbId: string, appId: string, file: string, domain: number, exclude?: string[], curatedPrimary?: boolean }[]} */
export const SOURCE_FILES = [
  // Domain 2
  { domain: 2, qbId: '2.3', appId: '2.3', file: 'domain2-rest-2.3-to-2.9-validation/objective-2.3-layer-2-discovery-protocols-source-questions.json' },
  { domain: 2, qbId: '2.4', appId: '2.4', file: 'domain2-rest-2.3-to-2.9-validation/objective-2.4-etherchannel-lacp-source-questions.json' },
  { domain: 2, qbId: '2.5', appId: '2.5', file: 'domain2-rest-2.3-to-2.9-validation/objective-2.5-rapid-pvst-stp-basics-source-questions.json' },
  { domain: 2, qbId: '2.6', appId: '2.6', file: 'domain2-rest-2.3-to-2.9-validation/objective-2.6-cisco-wireless-architectures-ap-modes-source-questions.json' },
  { domain: 2, qbId: '2.7', appId: '2.7', file: 'domain2-rest-2.3-to-2.9-validation/objective-2.7-wlan-physical-infrastructure-connections-source-questions.json' },
  { domain: 2, qbId: '2.8', appId: '2.8', file: 'domain2-rest-2.3-to-2.9-validation/objective-2.8-ap-wlc-management-access-source-questions.json' },
  { domain: 2, qbId: '2.9', appId: '2.8', file: 'domain2-rest-2.3-to-2.9-validation/objective-2.9-wlan-operational-parameters-source-questions.json' },
  // Domain 3
  { domain: 3, qbId: '3.1', appId: '3.1', file: 'domain3-ip-connectivity-validation/objective-3.1-routing-table-components-source-questions.json' },
  { domain: 3, qbId: '3.2', appId: '3.2', file: 'domain3-ip-connectivity-validation/objective-3.2-router-forwarding-decision-source-questions.json' },
  { domain: 3, qbId: '3.3', appId: '3.3', file: 'domain3-ip-connectivity-validation/objective-3.3-static-routing-ipv4-ipv6-source-questions.json' },
  {
    domain: 3, qbId: '3.4', appId: '3.4',
    file: 'domain3-ip-connectivity-validation/objective-3.4-single-area-ospfv2-source-questions.json',
    exclude: [...OSPF_34_EXCLUDE],
  },
  { domain: 3, qbId: '3.5', appId: '3.5', file: 'domain3-ip-connectivity-validation/objective-3.5-first-hop-redundancy-protocols-source-questions.json' },
  // Domain 4
  { domain: 4, qbId: '4.1', appId: '4.1', file: 'domain4-ip-services-validation/objective-4.1-nat-inside-source-source-questions.json', curatedPrimary: true },
  { domain: 4, qbId: '4.2', appId: '4.2', file: 'domain4-ip-services-validation/objective-4.2-ntp-client-server-source-questions.json' },
  { domain: 4, qbId: '4.3', appId: '4.3', file: 'domain4-ip-services-validation/objective-4.3-dhcp-dns-roles-source-questions.json' },
  { domain: 4, qbId: '4.4', appId: '4.4', file: 'domain4-ip-services-validation/objective-4.4-snmp-network-operations-source-questions.json' },
  { domain: 4, qbId: '4.5', appId: '4.5', file: 'domain4-ip-services-validation/objective-4.5-syslog-features-source-questions.json' },
  { domain: 4, qbId: '4.6', appId: '4.6', file: 'domain4-ip-services-validation/objective-4.6-dhcp-client-relay-source-questions.json' },
  { domain: 4, qbId: '4.7', appId: '4.7', file: 'domain4-ip-services-validation/objective-4.7-qos-phb-source-questions.json' },
  { domain: 4, qbId: '4.8', appId: '4.8', file: 'domain4-ip-services-validation/objective-4.8-ssh-remote-access-source-questions.json' },
  { domain: 4, qbId: '4.9', appId: '4.9', file: 'domain4-ip-services-validation/objective-4.9-tftp-ftp-source-questions.json' },
  // Domain 5
  { domain: 5, qbId: '5.1', appId: '5.1', file: 'domain5-domain6-validation/objective-5.1-key-security-concepts-source-questions.json' },
  { domain: 5, qbId: '5.2', appId: '5.2', file: 'domain5-domain6-validation/objective-5.2-security-program-elements-source-questions.json' },
  { domain: 5, qbId: '5.3', appId: '5.3', file: 'domain5-domain6-validation/objective-5.3-local-device-access-control-source-questions.json' },
  { domain: 5, qbId: '5.4', appId: '5.3', file: 'domain5-domain6-validation/objective-5.4-security-password-policies-source-questions.json' },
  { domain: 5, qbId: '5.5', appId: '5.10', file: 'domain5-domain6-validation/objective-5.5-vpn-remote-access-site-to-site-source-questions.json' },
  { domain: 5, qbId: '5.6', appId: '5.5', file: 'domain5-domain6-validation/objective-5.6-access-control-lists-source-questions.json' },
  { domain: 5, qbId: '5.7', appId: '5.6', file: 'domain5-domain6-validation/objective-5.7-layer-2-security-features-source-questions.json' },
  { domain: 5, qbId: '5.8', appId: '5.7', file: 'domain5-domain6-validation/objective-5.8-aaa-concepts-source-questions.json' },
  { domain: 5, qbId: '5.9', appId: '5.8', file: 'domain5-domain6-validation/objective-5.9-wireless-security-protocols-source-questions.json' },
  { domain: 5, qbId: '5.10', appId: '5.9', file: 'domain5-domain6-validation/objective-5.10-wlc-gui-wpa2-psk-source-questions.json' },
  // Domain 6
  { domain: 6, qbId: '6.1', appId: '6.1', file: 'domain5-domain6-validation/objective-6.1-automation-impacts-network-management-source-questions.json' },
  { domain: 6, qbId: '6.2', appId: '6.2', file: 'domain5-domain6-validation/objective-6.2-traditional-vs-controller-based-source-questions.json' },
  { domain: 6, qbId: '6.3', appId: '6.3', file: 'domain5-domain6-validation/objective-6.3-controller-based-sdn-architectures-source-questions.json' },
  { domain: 6, qbId: '6.4', appId: '6.4', file: 'domain5-domain6-validation/objective-6.4-traditional-vs-dna-center-management-source-questions.json' },
  { domain: 6, qbId: '6.5', appId: '6.5', file: 'domain5-domain6-validation/objective-6.5-rest-api-characteristics-source-questions.json' },
  { domain: 6, qbId: '6.6', appId: '6.6', file: 'domain5-domain6-validation/objective-6.6-configuration-management-mechanisms-source-questions.json' },
  { domain: 6, qbId: '6.7', appId: '6.6', file: 'domain5-domain6-validation/objective-6.7-json-encoded-data-source-questions.json' },
]

export function filesForDomain(domainNum) {
  return SOURCE_FILES.filter(f => f.domain === domainNum)
}

export function allImportObjectiveIds() {
  const ids = new Set()
  for (const f of SOURCE_FILES) ids.add(f.appId)
  return [...ids].sort()
}
