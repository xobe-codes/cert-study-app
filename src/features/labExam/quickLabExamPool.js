export const QUICK_LAB_EXAM_STATIONS = [
  'LAB-31-ROUTE-INTERPRET',
  'LAB-OSPF-VERIFY-34',
  'LAB-VLAN-TRUNK',
  'LAB-NAT-PAT',
  'LAB-ACL-CONFIG-55',
  'LAB-SYSLOG-REMOTE',
]

export const QUICK_LAB_EXAM_MINUTES = 25
export const FULL_LAB_EXAM_MINUTES = 55
export const DOMAIN_LAB_EXAM_MINUTES = 30
export const LAB_EXAM_PASS_PCT = 70

export const FULL_LAB_EXAM_STATIONS = [
  'LAB-VLAN-TRUNK',
  'LAB-31-ROUTE-INTERPRET',
  'LAB-STATIC-FLOATING',
  'LAB-OSPF-DEFAULT',
  'LAB-OSPF-VERIFY-34',
  'LAB-NAT-PAT',
  'LAB-SYSLOG-REMOTE',
  'LAB-SSH-ACCESS',
  'LAB-ACL-CONFIG',
  'LAB-PORT-SECURITY',
  'LAB-TS-OSPF-AREA',
  'LAB-TS-NATIVE-VLAN',
]

export const DOMAIN_LAB_EXAM_POOLS = {
  fundamentals: [
    'LAB-IPV4-SUBNETTING',
    'LAB-MAC-FORWARD-15',
    'LAB-D11-14',
    'LAB-D11-18',
    'LAB-D11-110',
    'LAB-D11-12',
  ],
  access: [
    'LAB-VLAN-TRUNK',
    'LAB-ETHERCHANNEL',
    'LAB-STP-ROOT',
    'LAB-WIRELESS-ARCH',
    'LAB-DHCP-SNOOP-27',
    'LAB-WLAN-SSID',
  ],
  connectivity: [
    'LAB-31-ROUTE-INTERPRET',
    'LAB-STATIC-FLOATING',
    'LAB-OSPF-DEFAULT',
    'LAB-OSPF-VERIFY-34',
    'LAB-TS-OSPF-AREA',
    'LAB-TS-STATIC-NH',
  ],
  services: [
    'LAB-NAT-PAT',
    'LAB-SSH-ACCESS',
    'LAB-DHCP-RELAY',
    'LAB-NTP-CLIENT',
    'LAB-SYSLOG-REMOTE',
    'LAB-SNMP-CONFIG-44',
  ],
  security: [
    'LAB-ACL-CONFIG',
    'LAB-PORT-SECURITY',
    'LAB-DEVICE-ACCESS',
    'LAB-AAA-LOCAL',
    'LAB-DAI-DHCP-SNOOPING',
    'LAB-WLAN-SEC-58',
  ],
  automation: [
    'LAB-AUTO-MGMT-61',
    'LAB-AUTO-CTRL-62',
    'LAB-AUTO-SDN-63',
    'LAB-AUTO-DNA-64',
    'LAB-AUTO-REST-65',
    'LAB-AUTO-JSON-66',
  ],
}

export const LAB_EXAM_MODES = {
  quick: { label: 'Quick', minutes: QUICK_LAB_EXAM_MINUTES, description: 'Weekly mixed-domain skills check' },
  full: { label: 'Full', minutes: FULL_LAB_EXAM_MINUTES, description: '12-station exam rehearsal' },
  domain: { label: 'Domain', minutes: DOMAIN_LAB_EXAM_MINUTES, description: 'Six stations from one domain' },
}

export const LAB_EXAM_DOMAIN_LABELS = {
  fundamentals: 'Network Fundamentals',
  access: 'Network Access',
  connectivity: 'IP Connectivity',
  services: 'IP Services',
  security: 'Security Fundamentals',
  automation: 'Automation & Programmability',
}

function stationIdsForMode(mode, domainId) {
  if (mode === 'full') return FULL_LAB_EXAM_STATIONS
  if (mode === 'domain') return DOMAIN_LAB_EXAM_POOLS[domainId] || []
  return QUICK_LAB_EXAM_STATIONS
}

/** @returns {Array<{ labId: string, objectiveId: string, title: string, domainId: string }>} */
export function buildLabExamStations({ mode = 'quick', domainId = 'access', getLabFn }) {
  return stationIdsForMode(mode, domainId).flatMap((labId) => {
    const bundle = getLabFn(labId)
    if (!bundle?.lab) return []
    const { lab } = bundle
    return [{
      labId,
      objectiveId: lab.objectiveId,
      title: lab.title,
      domainId: lab.domainId,
    }]
  })
}

/** @returns {Array<{ labId: string, objectiveId: string, title: string, domainId: string }>} */
export function buildQuickLabExamStations(getLabFn) {
  return buildLabExamStations({ mode: 'quick', getLabFn })
}

/** @param {{ done: unknown[], total: number, complete: boolean }} labProgressResult */
export function scoreLabStation(labProgressResult) {
  const { done = [], total = 0, complete = false } = labProgressResult || {}
  if (complete) return 100
  if (!total) return 0
  return Math.round((done.length / total) * 100)
}

/** @param {number[]} stationScores */
export function aggregateLabExamScore(stationScores) {
  const scores = (stationScores || []).filter(n => typeof n === 'number' && !Number.isNaN(n))
  if (!scores.length) {
    return { pct: 0, pass: false, stationScores: [] }
  }
  const pct = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  return {
    pct,
    pass: pct >= LAB_EXAM_PASS_PCT,
    stationScores: scores,
  }
}
