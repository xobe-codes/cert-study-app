import { describe, it, expect } from 'vitest'
import { computeCkuWeakness, resolveCkuWeakAction, resolveTrapWeakAction } from '../weaknessUtils.js'
import { resolveTrapDrillCku } from '../features/trapDrill/trapDrillQuestions.js'

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

describe('resolveTrapWeakAction', () => {
  it('routes resolvable trap labels to trap drill with ckuId', () => {
    const trapLabel = 'Configure `ip helper-address` on the DHCP server interface.'
    const resolved = resolveTrapDrillCku({ trapLabel })
    expect(resolveTrapWeakAction(trapLabel, [])).toEqual({
      kind: 'trapDrill',
      payload: { ckuId: resolved.ckuId, trapLabel: resolved.trapLabel },
    })
  })

  it('falls back to study when trap is in missed bank with objectiveId', () => {
    const trap = 'Unresolvable custom trap label'
    const missed = [{ misconceptionTested: trap, objectiveId: '3.2' }]
    expect(resolveTrapWeakAction(trap, missed)).toEqual({
      kind: 'study',
      payload: { objectiveId: '3.2' },
    })
  })

  it('falls back to exam traps when trap cannot be drilled or studied', () => {
    const trap = 'Totally unknown trap'
    expect(resolveTrapWeakAction(trap, [])).toEqual({
      kind: 'examTraps',
      payload: { trapLabel: trap },
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
