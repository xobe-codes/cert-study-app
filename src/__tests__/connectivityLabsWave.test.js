import { describe, it, expect } from 'vitest'
import { labsForObjective, getLab } from '../data/ccnaLabs.js'

describe('labs_connectivity_wave', () => {
  it('objective 3.2 has route forwarding verify lab', () => {
    const ids = labsForObjective('3.2').map(l => l.id)
    expect(ids).toContain('LAB-ROUTE-FORWARD-32')
    expect(getLab('LAB-ROUTE-FORWARD-32')?.lab.objectiveId).toBe('3.2')
  })

  it('objective 3.4 has OSPF verify lab in extended bundle', () => {
    const ids = labsForObjective('3.4').map(l => l.id)
    expect(ids).toContain('LAB-OSPF-VERIFY-34')
    expect(ids).toContain('LAB-OSPF-SINGLE-AREA')
  })

  it('objective 3.5 has HSRP config and verify labs', () => {
    const ids = labsForObjective('3.5').map(l => l.id)
    expect(ids).toContain('LAB-HSRP-GATEWAY')
    expect(ids).toContain('LAB-HSRP-VERIFY-35')
  })
})
