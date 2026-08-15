/** Curated trap-drill MC — 3 questions per top trap CKU (180 total). */

import { TRAP_DRILL_LABEL_ALIASES } from './trapDrillLabelAliases.js'
import { DOMAINS } from '../../data/ccnaDomains.js'
import { TRAP_DRILL_QUESTIONS_PART1 } from './trapDrillQuestionsPart1.js'
import { TRAP_DRILL_QUESTIONS_PART2 } from './trapDrillQuestionsPart2.js'

export const TRAP_DRILL_CKUS = [
  {
    ckuId: 'CKU-ACL',
    trapLabel: 'Forgetting the implicit deny.',
    objectiveId: '5.5',
  },
  {
    ckuId: 'CKU-SUBNETTING',
    trapLabel: 'Forgetting the "− 2" in the host formula.',
    objectiveId: '1.6',
  },
  {
    ckuId: 'CKU-ADMINISTRATIVE-DISTANCE',
    trapLabel: 'Assuming the lowest AD route always wins.',
    objectiveId: '3.2',
  },
  {
    ckuId: 'CKU-NATIVE-VLAN',
    trapLabel: 'Mismatched native VLANs.',
    objectiveId: '2.2',
  },
  {
    ckuId: 'CKU-OSPF',
    trapLabel: 'Using a subnet mask in the network statement.',
    objectiveId: '3.4',
  },
  {
    ckuId: 'CKU-DHCP-RELAY',
    trapLabel: 'Configure `ip helper-address` on the DHCP server interface.',
    objectiveId: '4.6',
  },
  {
    ckuId: 'CKU-STP-ROOT',
    trapLabel: 'Assuming the highest bridge priority becomes root.',
    objectiveId: '2.5',
  },
  {
    ckuId: 'CKU-NAT-PAT',
    trapLabel: 'Using static NAT when many hosts share one public IP.',
    objectiveId: '4.1',
  },
  {
    ckuId: 'CKU-DEFAULT-GATEWAY',
    trapLabel: 'Installing a default route without a reachable next-hop.',
    objectiveId: '3.3',
  },
  {
    ckuId: 'CKU-VLAN-TRUNK',
    trapLabel: 'Describing access-port behavior on a trunk question.',
    objectiveId: '2.2',
  },
  {
    ckuId: 'CKU-HSRP',
    trapLabel: 'Expecting both HSRP routers to forward simultaneously.',
    objectiveId: '3.5',
  },
  {
    ckuId: 'CKU-DHCP',
    trapLabel: 'Thinking the client sends the DHCP Offer.',
    objectiveId: '4.3',
  },
  {
    ckuId: 'CKU-STATIC-ROUTE',
    trapLabel: 'Using a wildcard mask in a static route command.',
    objectiveId: '3.3',
  },
  {
    ckuId: 'CKU-INTER-VLAN',
    trapLabel: 'Expecting VLANs to route without a Layer 3 device.',
    objectiveId: '2.1',
  },
  {
    ckuId: 'CKU-PORT-SECURITY',
    trapLabel: 'Enabling port security without specifying violation action.',
    objectiveId: '5.6',
  },
  {
    ckuId: 'CKU-EIGRP',
    trapLabel: 'Comparing EIGRP and OSPF metrics directly.',
    objectiveId: '3.1',
  },
  {
    ckuId: 'CKU-PORTFAST',
    trapLabel: 'Enabling portfast on uplink or trunk ports.',
    objectiveId: '2.5',
  },
  {
    ckuId: 'CKU-TELNET-SSH',
    trapLabel: 'Using Telnet for secure remote management.',
    objectiveId: '5.2',
  },
  {
    ckuId: 'CKU-CDP-LLDP',
    trapLabel: 'Expecting CDP to work on non-Cisco devices.',
    objectiveId: '2.3',
  },
  {
    ckuId: 'CKU-ARP',
    trapLabel: 'Expecting ARP to resolve a remote host MAC address.',
    objectiveId: '1.5',
  },
  {
    ckuId: 'CKU-TCP-UDP',
    trapLabel: 'Choosing UDP when guaranteed delivery is required.',
    objectiveId: '1.5',
  },
  {
    ckuId: 'CKU-OSPF-AREA',
    trapLabel: 'Placing all OSPF routers outside area 0.',
    objectiveId: '3.4',
  },
  {
    ckuId: 'CKU-ETHERCHANNEL',
    trapLabel: 'Mixing different port speeds in one EtherChannel.',
    objectiveId: '2.4',
  },
  {
    ckuId: 'CKU-IPV6',
    trapLabel: 'Thinking IPv6 has no multicast — only broadcast.',
    objectiveId: '1.8',
  },
  {
    ckuId: 'CKU-WIFI',
    trapLabel: 'Expecting 5 GHz to penetrate walls better than 2.4 GHz.',
    objectiveId: '1.11',
  },
  {
    ckuId: 'CKU-VTP',
    trapLabel: 'Expecting VTP to assign IP addresses to VLANs.',
    objectiveId: '2.2',
  },
  {
    ckuId: 'CKU-BPDU-GUARD',
    trapLabel: 'Enabling BPDU Guard on trunk uplinks.',
    objectiveId: '2.5',
  },
  {
    ckuId: 'CKU-SNMPv2',
    trapLabel: 'Using SNMPv1 community strings for write access.',
    objectiveId: '4.4',
  },
  {
    ckuId: 'CKU-QoS-TRUST',
    trapLabel: 'Trusting DSCP on an access port facing end hosts.',
    objectiveId: '4.7',
  },
  {
    ckuId: 'CKU-WILDCARD-ACL',
    trapLabel: 'Using subnet mask syntax in a standard ACL.',
    objectiveId: '5.5',
  },
  {
    ckuId: 'CKU-VLAN-1',
    trapLabel: 'Deleting VLAN 1 because it is unused.',
    objectiveId: '2.1',
  },
  {
    ckuId: 'CKU-DUPLEX',
    trapLabel: 'Leaving one side half-duplex on a Gigabit link.',
    objectiveId: '1.4',
  },
  {
    ckuId: 'CKU-REST-API',
    trapLabel: 'Confusing northbound REST with southbound NETCONF.',
    objectiveId: '6.3',
  },
  {
    ckuId: 'CKU-CONTROLLER',
    trapLabel: 'Expecting each switch to keep independent control-plane policy in SDN.',
    objectiveId: '6.2',
  },
  {
    ckuId: 'CKU-SYSLOG',
    trapLabel: 'Setting all syslog messages to severity 7 (debug).',
    objectiveId: '4.5',
  },
  {
    ckuId: 'CKU-SSH',
    trapLabel: '`transport input ssh` works without generating RSA keys.',
    objectiveId: '4.8',
  },
  {
    ckuId: 'CKU-AAA-SERVERS',
    trapLabel: 'TACACS+ and RADIUS use the same port and protocol.',
    objectiveId: '5.4',
  },
  {
    ckuId: 'CKU-AAA-CONCEPTS',
    trapLabel: 'Authentication and authorization are the same AAA function.',
    objectiveId: '5.7',
  },
  {
    ckuId: 'CKU-WLAN-SEC',
    trapLabel: 'WEP is acceptable for enterprise WLAN security.',
    objectiveId: '5.8',
  },
  {
    ckuId: 'CKU-VPN',
    trapLabel: 'Site-to-site VPN and remote-access VPN are identical.',
    objectiveId: '5.10',
  },
  {
    ckuId: 'CKU-SEGMENTATION',
    trapLabel: 'VLANs alone provide complete security isolation.',
    objectiveId: '5.11',
  },
  {
    ckuId: 'CKU-SECURITY-PROGRAM',
    trapLabel: 'Deploying ACLs alone completes a security program.',
    objectiveId: '5.2',
  },
  {
    ckuId: 'CKU-PRIVILEGE-LEVELS',
    trapLabel: 'Use `enable password` instead of `enable secret`.',
    objectiveId: '5.3',
  },
  {
    ckuId: 'CKU-DNA',
    trapLabel: 'On-box CLI and DNA Center are mutually exclusive.',
    objectiveId: '6.4',
  },
  {
    ckuId: 'CKU-JSON-ANSIBLE',
    trapLabel: 'Thinking Ansible requires an agent on Cisco IOS.',
    objectiveId: '6.6',
  },
  {
    ckuId: 'CKU-FLOATING-STATIC',
    trapLabel: 'A floating static needs AD HIGHER than the dynamic protocol.',
    objectiveId: '3.3',
  },
  {
    ckuId: 'CKU-PASSIVE-INTERFACE',
    trapLabel: '`passive-interface` advertises a network but stops hellos.',
    objectiveId: '3.4',
  },
  {
    ckuId: 'CKU-LOAD-BALANCING',
    trapLabel: 'Assuming only the first equal-cost route is installed.',
    objectiveId: '3.6',
  },
  {
    ckuId: 'CKU-NETWORK-MASK',
    trapLabel: 'Using a subnet mask in the OSPF `network` command.',
    objectiveId: '3.4',
  },
  {
    ckuId: 'CKU-OSPF-NEIGHBOR',
    trapLabel: 'Expecting DR/BDR on point-to-point links.',
    objectiveId: '3.4',
  },
  {
    ckuId: 'CKU-DTP',
    trapLabel: 'Expecting DTP to negotiate when `switchport nonegotiate` is set.',
    objectiveId: '2.2',
  },
  {
    ckuId: 'CKU-FLEXCONNECT',
    trapLabel: 'Believing all WLAN traffic must switch centrally at the WLC.',
    objectiveId: '2.6',
  },
  {
    ckuId: 'CKU-WPA3',
    trapLabel: 'Choosing WPA3-Personal when enterprise 802.1X is required.',
    objectiveId: '2.8',
  },
  {
    ckuId: 'CKU-LACP-MODE',
    trapLabel: 'Mismatched LACP active/passive modes prevent channel formation.',
    objectiveId: '2.4',
  },
  {
    ckuId: 'CKU-ROOT-GUARD',
    trapLabel: 'Enabling Root Guard on the actual root bridge uplink.',
    objectiveId: '2.5',
  },
  {
    ckuId: 'CKU-CAPWAP',
    trapLabel: 'Confusing CAPWAP control and data tunnel ports.',
    objectiveId: '2.6',
  },
  {
    ckuId: 'CKU-DNS-RECORDS',
    trapLabel: 'Using an A record when reverse lookup is required.',
    objectiveId: '4.3',
  },
  {
    ckuId: 'CKU-NTP-STRATUM',
    trapLabel: 'Thinking stratum 1 means the local router is the reference clock.',
    objectiveId: '4.2',
  },
  {
    ckuId: 'CKU-EXTENDED-ACL',
    trapLabel: 'Placing extended ACLs close to the destination instead of the source.',
    objectiveId: '5.5',
  },
  {
    ckuId: 'CKU-DHCP-SNOOPING',
    trapLabel: 'Marking all access ports as DHCP snooping trusted.',
    objectiveId: '5.6',
  },
]

const QUESTIONS = [...TRAP_DRILL_QUESTIONS_PART1, ...TRAP_DRILL_QUESTIONS_PART2]

function norm(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Resolve trap label or CKU id to a trap-drill CKU entry. */
export function resolveTrapDrillCku({ trapLabel, ckuId } = {}) {
  if (ckuId) {
    const byId = TRAP_DRILL_CKUS.find(c => c.ckuId === ckuId)
    if (byId) return byId
  }
  if (!trapLabel) return null
  const label = norm(trapLabel)
  const aliasCkuId = TRAP_DRILL_LABEL_ALIASES[label]
  if (aliasCkuId) {
    const byAlias = TRAP_DRILL_CKUS.find(c => c.ckuId === aliasCkuId)
    if (byAlias) return byAlias
  }
  const exact = TRAP_DRILL_CKUS.find(c => norm(c.trapLabel) === label)
  if (exact) return exact
  return TRAP_DRILL_CKUS.find(c => {
    const t = norm(c.trapLabel)
    return t.includes(label) || label.includes(t)
  }) || null
}

/** Trap CKUs scoped to one CCNA exam domain (1–6 or slug like "access"). */
export function resolveTrapDomainNumber(domainId) {
  const d = String(domainId || '')
  if (!d) return ''
  if (/^[1-6]$/.test(d)) return d
  const fromSlug = DOMAINS.findIndex(x => x.id === d)
  if (fromSlug >= 0) return String(fromSlug + 1)
  const prefix = d.split('.')[0]
  if (/^[1-6]$/.test(prefix)) return prefix
  return d
}

export function getTrapDrillCkusForDomain(domainId) {
  const d = resolveTrapDomainNumber(domainId)
  if (!d) return []
  return TRAP_DRILL_CKUS.filter(c => String(c.objectiveId).startsWith(`${d}.`))
}

/** Questions for one trap CKU, one domain, or none when unscoped. */
export function getTrapDrillQuestions({ trapLabel, ckuId, domainId } = {}) {
  const resolved = resolveTrapDrillCku({ trapLabel, ckuId })
  if (resolved) {
    return QUESTIONS.filter(q => q.ckuId === resolved.ckuId)
  }
  if (domainId) {
    const ckuIds = new Set(getTrapDrillCkusForDomain(domainId).map(c => c.ckuId))
    return QUESTIONS.filter(q => ckuIds.has(q.ckuId))
  }
  if (trapLabel || ckuId) return []
  return []
}

export function getAllTrapDrillQuestions() {
  return [...QUESTIONS]
}
