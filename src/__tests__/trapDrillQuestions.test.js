import { describe, it, expect } from 'vitest'
import {
  TRAP_DRILL_CKUS,
  getTrapDrillQuestions,
  getAllTrapDrillQuestions,
  resolveTrapDrillCku,
} from '../features/trapDrill/trapDrillQuestions.js'

describe('trapDrillQuestions', () => {
  it('defines 35 trap CKUs with 3 questions each (105 total)', () => {
    expect(TRAP_DRILL_CKUS).toHaveLength(35)
    expect(getAllTrapDrillQuestions()).toHaveLength(105)
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
})
