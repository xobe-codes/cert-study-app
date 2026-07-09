import { describe, it, expect } from 'vitest'
import { computeCkuWeakness, resolveCkuWeakAction } from '../weaknessUtils.js'

describe('resolveCkuWeakAction', () => {
  it('routes CKU-* ids to trap drill by ckuId', () => {
    expect(resolveCkuWeakAction('CKU-ACL', [])).toEqual({
      kind: 'trapDrill',
      payload: { ckuId: 'CKU-ACL' },
    })
  })

  it('routes concept ids to study when missed item has objectiveId', () => {
    const missed = [{ concept: 'vlan', objectiveId: '2.1' }]
    expect(resolveCkuWeakAction('concept:vlan', missed)).toEqual({
      kind: 'study',
      payload: { objectiveId: '2.1' },
    })
  })

  it('falls back to trap drill for concept ids without objective', () => {
    const missed = [{ concept: 'stp', misconceptionTested: 'Root bridge confusion' }]
    expect(resolveCkuWeakAction('concept:stp', missed)).toEqual({
      kind: 'trapDrill',
      payload: { trapLabel: 'Root bridge confusion' },
    })
  })
})

describe('computeCkuWeakness', () => {
  it('aggregates ckuIds and concept fallbacks', () => {
    const rows = computeCkuWeakness([
      { ckuIds: ['CKU-VLAN'], concept: 'vlan' },
      { concept: 'vlan' },
    ])
    expect(rows.find(r => r.id === 'CKU-VLAN')?.count).toBe(1)
    expect(rows.find(r => r.id === 'concept:vlan')?.count).toBe(1)
  })
})
