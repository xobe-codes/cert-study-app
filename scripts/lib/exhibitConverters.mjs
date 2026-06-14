import { exhibitForQuestion } from './exhibitExhibits.mjs'

const NAT_TOPOLOGY = `NAT topology:
- Host A (inside local): 192.168.1.2 on LAN
- Router A Gi0/0 (192.168.1.1): ip nat inside
- Router A S0/0 (inside global): 179.43.44.1 — ip nat outside
- Internet → Web server (outside global): 198.23.53.3
- Internal web server inside local: 192.168.1.3 (static NAT to 179.43.44.1)
- Enterprise public pool: 179.43.44.0/28 (usable 179.43.44.2–179.43.44.15)
- Inside network: 192.168.1.0/24`

const SYSLOG_EXHIBIT = `Syslog configuration excerpt:
logging trap informational
logging host 192.168.1.100
! informational = severity level 6`

const DHCP_RELAY_EXHIBIT = `Network layout:
- Host A: 192.168.10.10/24 on VLAN 10 (no local DHCP server)
- Router R1 Gi0/0: 192.168.10.1 — needs ip helper-address toward remote DHCP
- Remote DHCP server: 10.0.0.5 on another subnet`

const ROUTING_TABLE_EXHIBIT = `Routing table excerpt:
O    192.168.10.0/24 [110/20] via 10.0.0.2, 00:05:00, GigabitEthernet0/0
Codes: C=connected, S=static, O=OSPF. Bracket shows [AD/metric].`

const RUNNING_CONFIG_EXHIBIT = `Running-config excerpt:
ip route 192.168.4.0 255.255.255.0 10.0.0.1
ip route 192.168.5.0 255.255.255.0 10.0.0.2
! Destination 192.168.4.85 matches 192.168.4.0/24 → next-hop 10.0.0.1`

const EXHIBIT_HANDLERS = [
  {
    match: q => /routing table/i.test(q.question || '') && /exhibit|following exhibit/i.test(q.question || ''),
    convert(q) {
      const stem = (q.question || '')
        .replace(/You review a routing table and see the entry in the following exhibit\.?\s*/i, '')
        .replace(/in the following exhibit/i, 'in the routing table below')
        .replace(/referenced source exhibit/i, 'routing table below')
      return { ...q, question: `${ROUTING_TABLE_EXHIBIT}\n\n${stem.trim()}`, exhibitConverted: true }
    },
  },
  {
    match: q => /running-config/i.test(q.question || '') && /exhibit/i.test(q.question || ''),
    convert(q) {
      const stem = (q.question || '').replace(/In the following exhibit is a copy of the running-config\.?\s*/i, '')
      return { ...q, question: `${RUNNING_CONFIG_EXHIBIT}\n\n${stem.trim()}`, exhibitConverted: true }
    },
  },
  {
    match: q => /^4\.1-q/.test(q.id || '') || (q.objectiveId === '4.1' && /inside local|inside global|outside global|static NAT|PAT|Port Address|NAT pool/i.test(q.question || '')),
    convert(q) {
      const stem = (q.question || '').replace(/Using the referenced source exhibit,?\s*/i, '')
      return { ...q, question: `${NAT_TOPOLOGY}\n\n${stem}`, exhibitConverted: true }
    },
  },
  {
    match: q => q.id === 'obj-4.5-source-q008' || /severity is being logged/i.test(q.question || ''),
    convert(q) {
      const stem = (q.question || '').replace(/referenced source exhibit/i, 'configuration below')
      return { ...q, question: `${SYSLOG_EXHIBIT}\n\n${stem}`, exhibitConverted: true }
    },
  },
  {
    match: q => q.id === 'obj-4.6-source-q005' || (/referenced source exhibit/i.test(q.question || '') && /DHCP/i.test(q.question || '')),
    convert(q) {
      const stem = (q.question || '').replace(/Using the referenced source exhibit,?\s*/i, '')
      return { ...q, question: `${DHCP_RELAY_EXHIBIT}\n\n${stem}`, exhibitConverted: true }
    },
  },
]

export function tryConvertExhibit(question, objectiveId) {
  const q = { ...question, objectiveId: question.objectiveId || objectiveId }
  const byId = exhibitForQuestion(q)
  if (byId) return byId
  for (const h of EXHIBIT_HANDLERS) {
    if (h.match(q)) return h.convert(q)
  }
  return null
}

export function isConvertibleExhibit(question, objectiveId) {
  return !!tryConvertExhibit(question, objectiveId)
}
