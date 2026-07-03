import { describe, it, expect } from 'vitest'
import { EXTENDED_LAB_BUNDLES } from '../data/ccnaLabsExtended.js'
import { getLab, labsForObjective } from '../data/ccnaLabs.js'

const NEW_LAB_IDS = [
  'LAB-OSPF-ADJ-34',
  'LAB-ACL-CONFIG-55',
  'LAB-PORTSEC-56',
  'LAB-DHCP-POOL-43',
  'LAB-SNMP-CONFIG-44',
  'LAB-TFTP-CONFIG-49',
]

function bundleFor(labId) {
  return EXTENDED_LAB_BUNDLES.find(b => b.lab?.id === labId)
}

describe('ccnaLabsExtended routing switching security gaps', () => {
  for (const labId of NEW_LAB_IDS) {
    it(`EXTENDED_LAB_BUNDLES includes ${labId}`, () => {
      expect(bundleFor(labId)).toBeTruthy()
    })

    it(`${labId} validator has requiredCommands`, () => {
      const bundle = bundleFor(labId)
      expect(bundle?.validator?.labId).toBe(labId)
      expect(Array.isArray(bundle?.validator?.requiredCommands)).toBe(true)
      expect(bundle.validator.requiredCommands.length).toBeGreaterThan(0)
      for (const rc of bundle.validator.requiredCommands) {
        expect(rc.device).toBeTruthy()
        expect(rc.command).toBeTruthy()
      }
    })

    it(`getLab resolves ${labId}`, () => {
      const resolved = getLab(labId)
      expect(resolved?.lab?.id).toBe(labId)
      expect(resolved?.validator?.requiredCommands?.length).toBeGreaterThan(0)
    })
  }

  it('objective 3.4 includes OSPF adjacency config lab', () => {
    const ids = labsForObjective('3.4').map(l => l.id)
    expect(ids).toContain('LAB-OSPF-ADJ-34')
    expect(getLab('LAB-OSPF-ADJ-34')?.lab.objectiveId).toBe('3.4')
  })

  it('objective 5.5 includes extended ACL config lab', () => {
    const ids = labsForObjective('5.5').map(l => l.id)
    expect(ids).toContain('LAB-ACL-CONFIG-55')
    expect(getLab('LAB-ACL-CONFIG-55')?.lab.objectiveId).toBe('5.5')
  })

  it('objective 5.6 includes port security config lab', () => {
    const ids = labsForObjective('5.6').map(l => l.id)
    expect(ids).toContain('LAB-PORTSEC-56')
    expect(getLab('LAB-PORTSEC-56')?.lab.objectiveId).toBe('5.6')
  })

  it('objective 4.3 includes DHCP pool config lab', () => {
    const ids = labsForObjective('4.3').map(l => l.id)
    expect(ids).toContain('LAB-DHCP-POOL-43')
    expect(getLab('LAB-DHCP-POOL-43')?.lab.objectiveId).toBe('4.3')
  })

  it('objective 4.4 includes SNMP config lab', () => {
    const ids = labsForObjective('4.4').map(l => l.id)
    expect(ids).toContain('LAB-SNMP-CONFIG-44')
  })

  it('objective 4.9 includes TFTP backup lab', () => {
    const ids = labsForObjective('4.9').map(l => l.id)
    expect(ids).toContain('LAB-TFTP-CONFIG-49')
  })
})
