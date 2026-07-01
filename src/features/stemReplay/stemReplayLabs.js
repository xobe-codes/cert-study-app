import { getLab } from '../../data/ccnaLabs.js'

/** High-traffic practice question → hands-on lab replay. */
const STEM_REPLAY_MAP = {
  '5.5-c-q1': 'LAB-ACL-CONFIG',
  '4.1-c-q2': 'LAB-NAT-PAT',
  '2.2-c-q1': 'LAB-VLAN-TRUNK',
  '3.2-c-q1': 'LAB-31-ROUTE-INTERPRET',
  '2.5-c-q1': 'LAB-STP-ROOT',
  '2.1-c-q1': 'LAB-INTERVLAN-SVI',
  '3.4-c-q1': 'LAB-OSPF-DEFAULT',
  '3.3-q1': 'LAB-IPV6-STATIC',
  '1.5-c-q3': 'LAB-MAC-FORWARD-15',
  '5.5-c-q3': 'LAB-EXTENDED-ACL-BUILD',
  '4.1-c-q1': 'LAB-STATIC-NAT',
  '3.2-c-q2': 'LAB-STATIC-FLOATING',
  '1.10-c-q2': 'LAB-D11-110',
  'obj-2.3-source-q001': 'LAB-LLDP',
  'obj-2.8-source-q001': 'LAB-WLAN-SSID',
}

/** @returns {{ labId: string, lab: import('../../data/ccnaLabs.js').LabBundle['lab'] } | null} */
export function getStemReplayLab(questionId) {
  const labId = STEM_REPLAY_MAP[questionId]
  if (!labId) return null
  const bundle = getLab(labId)
  if (!bundle?.lab) return null
  return { labId, lab: bundle.lab }
}

export function hasStemReplayLab(questionId) {
  return Boolean(getStemReplayLab(questionId))
}

export function stemReplayMapSize() {
  return Object.keys(STEM_REPLAY_MAP).length
}
