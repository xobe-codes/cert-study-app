/**
 * Convert exhibit-dependent questions to inline text exhibits.
 */

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

const EXHIBIT_HANDLERS = [
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
  for (const h of EXHIBIT_HANDLERS) {
    if (h.match(q)) return h.convert(q)
  }
  return null
}

export function isConvertibleExhibit(question, objectiveId) {
  return !!tryConvertExhibit(question, objectiveId)
}
