import { describe, it, expect } from 'vitest'
import {
  TRAP_DRILL_CKUS,
  getTrapDrillQuestions,
  getAllTrapDrillQuestions,
  resolveTrapDrillCku,
} from '../features/trapDrill/trapDrillQuestions.js'

describe('trapDrillQuestions', () => {
  it('defines 50 trap CKUs with 3 questions each (150 total)', () => {
    expect(TRAP_DRILL_CKUS).toHaveLength(50)
    expect(getAllTrapDrillQuestions()).toHaveLength(150)
  })

  it('returns 3 questions per CKU by id', () => {
    for (const cku of TRAP_DRILL_CKUS) {
      const qs = getTrapDrillQuestions({ ckuId: cku.ckuId })
      expect(qs, cku.ckuId).toHaveLength(3)
      expect(qs.every(q => q.ckuId === cku.ckuId)).toBe(true)
    }
  })

  it('resolves new factory-trap CKUs by trap label', () => {
    const dhcpRelay = resolveTrapDrillCku({ trapLabel: 'Configure `ip helper-address` on the DHCP server interface.' })
    expect(dhcpRelay?.ckuId).toBe('CKU-DHCP-RELAY')

    const hsrp = resolveTrapDrillCku({ ckuId: 'CKU-HSRP' })
    expect(hsrp?.objectiveId).toBe('3.5')
    expect(getTrapDrillQuestions({ ckuId: 'CKU-HSRP' })).toHaveLength(3)
  })

  it('includes exam-trap topics: DHCP relay, STP, NAT/PAT, HSRP, trunk', () => {
    const ids = TRAP_DRILL_CKUS.map(c => c.ckuId)
    expect(ids).toEqual(expect.arrayContaining([
      'CKU-DHCP-RELAY',
      'CKU-STP-ROOT',
      'CKU-NAT-PAT',
      'CKU-HSRP',
      'CKU-VLAN-TRUNK',
    ]))
  })

  it('includes expanded wave-2 trap topics: VTP, QoS trust, wildcard ACL', () => {
    const ids = TRAP_DRILL_CKUS.map(c => c.ckuId)
    expect(ids).toEqual(expect.arrayContaining([
      'CKU-VTP',
      'CKU-QoS-TRUST',
      'CKU-WILDCARD-ACL',
      'CKU-REST-API',
      'CKU-CONTROLLER',
    ]))
  })

  it('includes security/automation wave-3 trap topics: SSH, AAA, VPN, Ansible', () => {
    const ids = TRAP_DRILL_CKUS.map(c => c.ckuId)
    expect(ids).toEqual(expect.arrayContaining([
      'CKU-SSH',
      'CKU-AAA-SERVERS',
      'CKU-AAA-CONCEPTS',
      'CKU-VPN',
      'CKU-SEGMENTATION',
      'CKU-JSON-ANSIBLE',
      'CKU-DNA',
    ]))
  })

  it('includes domain-3 wave trap topics: floating static, passive-if, ECMP, OSPF neighbor', () => {
    const ids = TRAP_DRILL_CKUS.map(c => c.ckuId)
    expect(ids).toEqual(expect.arrayContaining([
      'CKU-FLOATING-STATIC',
      'CKU-PASSIVE-INTERFACE',
      'CKU-LOAD-BALANCING',
      'CKU-NETWORK-MASK',
      'CKU-OSPF-NEIGHBOR',
    ]))
    for (const ckuId of ['CKU-FLOATING-STATIC', 'CKU-PASSIVE-INTERFACE', 'CKU-LOAD-BALANCING']) {
      const qs = getTrapDrillQuestions({ ckuId })
      expect(qs, ckuId).toHaveLength(3)
      expect(qs.every(q => q.objectiveId.startsWith('3.'))).toBe(true)
    }
  })
})
