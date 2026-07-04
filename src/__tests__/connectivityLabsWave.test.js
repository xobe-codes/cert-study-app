import { describe, it, expect } from 'vitest'
import { labsForObjective, getLab } from '../data/ccnaLabs.js'

describe('labs_connectivity_wave', () => {
  it('objective 3.2 has route forwarding verify lab-lite', () => {
    const ids = labsForObjective('3.2').map(l => l.id)
    expect(ids).toContain('LAB-ROUTE-FORWARD-32')
    const lab = getLab('LAB-ROUTE-FORWARD-32')?.lab
    expect(lab?.objectiveId).toBe('3.2')
    expect(lab?.interpretOnly).toBe(true)
    expect(lab?.cliShowOutput).toBeTruthy()
  })

  it('objective 3.4 has OSPF verify and adjacency lab-lite in extended bundle', () => {
    const ids = labsForObjective('3.4').map(l => l.id)
    expect(ids).toContain('LAB-OSPF-VERIFY-34')
    expect(ids).toContain('LAB-OSPF-ADJ-34')
    expect(ids).toContain('LAB-OSPF-SINGLE-AREA')
    for (const labId of ['LAB-OSPF-VERIFY-34', 'LAB-OSPF-ADJ-34', 'LAB-OSPF-SINGLE-AREA']) {
      const lab = getLab(labId)?.lab
      expect(lab?.interpretOnly).toBe(true)
      expect(lab?.cliShowOutput).toBeTruthy()
    }
  })

  it('objective 3.5 has HSRP config and verify labs', () => {
    const ids = labsForObjective('3.5').map(l => l.id)
    expect(ids).toContain('LAB-HSRP-GATEWAY')
    expect(ids).toContain('LAB-HSRP-VERIFY-35')
    for (const labId of ['LAB-HSRP-GATEWAY', 'LAB-HSRP-VERIFY-35']) {
      const lab = getLab(labId)?.lab
      expect(lab?.interpretOnly).toBe(true)
      expect(lab?.cliShowOutput).toBeTruthy()
    }
  })

  it('objective 5.5 and 5.6 have security lab-lite in extended bundle', () => {
    for (const [objId, labId] of [['5.5', 'LAB-ACL-CONFIG-55'], ['5.6', 'LAB-PORTSEC-56']]) {
      const ids = labsForObjective(objId).map(l => l.id)
      expect(ids).toContain(labId)
      const lab = getLab(labId)?.lab
      expect(lab?.objectiveId).toBe(objId)
      expect(lab?.interpretOnly).toBe(true)
      expect(lab?.cliShowOutput).toBeTruthy()
    }
  })
})
