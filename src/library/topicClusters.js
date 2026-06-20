/** CCNA topic families — expand queries to related terms and protocols. */

export const TOPIC_CLUSTERS = [
  {
    id: 'aaa',
    label: 'AAA protocols',
    primaryTermId: 'term-aaa',
    aliases: [
      'aaa', 'aaa protocol', 'aaa protocols', 'aaa servers', 'aaa server',
      'authentication authorization accounting', 'tacacs radius',
    ],
    memberTermIds: ['term-aaa', 'term-tacacs-plus', 'term-radius'],
    objectiveIds: ['5.4', '5.7'],
  },
  {
    id: 'routing-protocols',
    label: 'Routing protocols',
    primaryTermId: 'term-ospf',
    aliases: [
      'routing protocol', 'routing protocols', 'igp', 'interior gateway protocol',
      'dynamic routing protocol', 'dynamic routing protocols',
    ],
    memberTermIds: ['term-ospf', 'term-ospfv2', 'term-eigrp', 'term-rip', 'term-bgp', 'term-static-route'],
    objectiveIds: ['3.1', '3.4'],
  },
  {
    id: 'nat',
    label: 'NAT types',
    primaryTermId: 'term-nat',
    aliases: ['nat', 'nat types', 'network address translation', 'nat pat'],
    memberTermIds: ['term-nat', 'term-pat', 'term-static-nat', 'term-inside-local-global'],
    objectiveIds: ['5.1', '5.2'],
  },
  {
    id: 'wireless-security',
    label: 'Wireless security',
    primaryTermId: 'term-wpa2',
    aliases: ['wireless security', 'wlan security', 'wifi security', 'wpa wpa2'],
    memberTermIds: ['term-wpa2', 'term-wpa2-psk', 'term-ssh'],
    objectiveIds: ['5.8', '5.9'],
  },
  {
    id: 'discovery-protocols',
    label: 'Layer 2 discovery protocols',
    primaryTermId: 'term-cdp',
    aliases: ['discovery protocol', 'discovery protocols', 'layer 2 discovery', 'neighbor discovery'],
    memberTermIds: ['term-cdp', 'term-lldp'],
    objectiveIds: ['2.3'],
  },
  {
    id: 'etherchannel',
    label: 'EtherChannel protocols',
    primaryTermId: 'term-etherchannel',
    aliases: ['etherchannel', 'link aggregation', 'port channel', 'port-channel'],
    memberTermIds: ['term-etherchannel', 'term-lacp', 'term-pagp'],
    objectiveIds: ['2.2'],
  },
  {
    id: 'stp',
    label: 'Spanning Tree protocols',
    primaryTermId: 'term-stp',
    aliases: ['spanning tree', 'stp', 'spanning tree protocol', 'loop prevention switching'],
    memberTermIds: ['term-stp', 'term-rstp', 'term-portfast', 'term-bpdu-guard'],
    objectiveIds: ['2.1'],
  },
  {
    id: 'vlan-switching',
    label: 'VLAN and trunking',
    primaryTermId: 'term-vlan',
    aliases: ['vlan trunk', 'vlan and trunk', 'switching vlan', '802.1q trunk'],
    memberTermIds: ['term-vlan', 'term-trunk', 'term-native-vlan', 'term-dtp'],
    objectiveIds: ['2.1', '2.2'],
  },
  {
    id: 'acl',
    label: 'Access control lists',
    primaryTermId: 'term-acl',
    aliases: ['acl', 'acls', 'access list', 'access lists', 'access control list'],
    memberTermIds: ['term-acl', 'term-extended-acl', 'term-wildcard-mask'],
    objectiveIds: ['5.5'],
  },
  {
    id: 'network-services',
    label: 'Network services',
    primaryTermId: 'term-dhcp',
    aliases: [
      'network services', 'infrastructure services', 'dhcp dns ntp',
      'management services', 'ip services',
    ],
    memberTermIds: ['term-dhcp', 'term-dns', 'term-ntp', 'term-snmp', 'term-syslog'],
    objectiveIds: ['4.2', '4.3', '4.4', '4.5'],
  },
  {
    id: 'wireless-architecture',
    label: 'Wireless architecture',
    primaryTermId: 'term-wlc',
    aliases: ['wireless architecture', 'wlan architecture', 'lightweight ap', 'autonomous ap'],
    memberTermIds: ['term-wlc', 'term-ap-modes', 'term-ssid'],
    objectiveIds: ['2.6', '2.7', '2.8'],
  },
  {
    id: 'automation',
    label: 'Network automation',
    primaryTermId: 'term-sdn',
    aliases: ['network automation', 'controller based', 'sdn automation', 'programmability'],
    memberTermIds: ['term-sdn', 'term-rest-api', 'term-json'],
    objectiveIds: ['6.1', '6.2', '6.5', '6.6'],
  },
]

function norm(s) {
  return String(s || '').toLowerCase().trim().replace(/\s+/g, ' ')
}

/** Filler words stripped before token scoring — keeps "AAA protocols" → AAA cluster. */
export const QUERY_STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'what', 'how', 'does', 'do', 'explain', 'describe',
  'compare', 'difference', 'between', 'vs', 'versus', 'and', 'or', 'for', 'in', 'on',
  'protocol', 'protocols', 'type', 'types', 'method', 'methods', 'concept', 'concepts',
  'overview', 'fundamentals', 'basics', 'example', 'examples', 'mean', 'meaning',
  'ccna', 'cisco', 'network', 'networking', 'device', 'devices',
])

export function queryTokens(query) {
  return norm(query).split(/\s+/).filter(w => w.length > 1 && !QUERY_STOPWORDS.has(w))
}

export function resolveTopicCluster(query) {
  const q = norm(query)
  if (!q) return null

  let best = null
  let bestLen = 0

  for (const cluster of TOPIC_CLUSTERS) {
    for (const alias of cluster.aliases) {
      const a = norm(alias)
      if (q === a || q.includes(a) || a.includes(q)) {
        if (a.length >= bestLen) {
          best = cluster
          bestLen = a.length
        }
      }
    }
  }

  if (best) return best

  const tokens = queryTokens(q)
  if (!tokens.length) return null

  for (const cluster of TOPIC_CLUSTERS) {
    const head = norm(cluster.aliases[0])
    const headToken = head.split(/\s+/)[0]
    if (tokens.includes(headToken) || tokens.some(t => head.startsWith(t) || t.startsWith(headToken))) {
      return cluster
    }
  }

  return null
}

export function clusterMemberChunkId(registryTermId) {
  return `term:dict:${registryTermId}`
}
