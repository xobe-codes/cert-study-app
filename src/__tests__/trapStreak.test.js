import { describe, it, expect } from 'vitest'
import {
  TRAP_STREAK_THRESHOLD,
  trapFamilyKey,
  createTrapStreakState,
  recordTrapMiss,
  getTrapStreakCount,
  shouldShowTrapStreakCta,
  shouldShowWildcardBridge,
  WILDCARD_BRIDGE_DOMAIN_IDS,
} from '../features/practice/trapStreak.js'

describe('trapFamilyKey', () => {
  it('prefers trap label over CKU', () => {
    expect(trapFamilyKey({ trapLabel: 'Implicit deny', ckuId: 'CKU-ACL' })).toBe('trap:Implicit deny')
  })

  it('falls back to CKU when trap label missing', () => {
    expect(trapFamilyKey({ ckuId: 'CKU-OSPF' })).toBe('cku:CKU-OSPF')
  })

  it('trims whitespace and returns null when empty', () => {
    expect(trapFamilyKey({ trapLabel: '  ' })).toBe(null)
    expect(trapFamilyKey({})).toBe(null)
    expect(trapFamilyKey({ trapLabel: '  Host wildcard  ' })).toBe('trap:Host wildcard')
  })
})

describe('recordTrapMiss / streak CTA', () => {
  it('does not prompt on first miss in a family', () => {
    let state = createTrapStreakState()
    const r1 = recordTrapMiss(state, { trapLabel: 'Implicit deny', ckuId: 'CKU-ACL' })
    expect(r1.count).toBe(1)
    expect(r1.shouldPrompt).toBe(false)
    expect(shouldShowTrapStreakCta(r1.state, { trapLabel: 'Implicit deny' })).toBe(false)
  })

  it('prompts on ≥2 misses in the same trap family', () => {
    let state = createTrapStreakState()
    state = recordTrapMiss(state, { trapLabel: 'Implicit deny' }).state
    const r2 = recordTrapMiss(state, { trapLabel: 'Implicit deny', ckuId: 'CKU-ACL' })
    expect(r2.count).toBe(TRAP_STREAK_THRESHOLD)
    expect(r2.shouldPrompt).toBe(true)
    expect(shouldShowTrapStreakCta(r2.state, { trapLabel: 'Implicit deny' })).toBe(true)
  })

  it('tracks separate families independently', () => {
    let state = createTrapStreakState()
    state = recordTrapMiss(state, { trapLabel: 'Implicit deny' }).state
    state = recordTrapMiss(state, { ckuId: 'CKU-OSPF' }).state
    expect(getTrapStreakCount(state, { trapLabel: 'Implicit deny' })).toBe(1)
    expect(getTrapStreakCount(state, { ckuId: 'CKU-OSPF' })).toBe(1)
    expect(shouldShowTrapStreakCta(state, { trapLabel: 'Implicit deny' })).toBe(false)

    state = recordTrapMiss(state, { trapLabel: 'Implicit deny' }).state
    expect(shouldShowTrapStreakCta(state, { trapLabel: 'Implicit deny' })).toBe(true)
    expect(shouldShowTrapStreakCta(state, { ckuId: 'CKU-OSPF' })).toBe(false)
  })

  it('ignores misses with no trap or CKU', () => {
    const r = recordTrapMiss(createTrapStreakState(), {})
    expect(r.key).toBe(null)
    expect(r.shouldPrompt).toBe(false)
    expect(Object.keys(r.state.counts)).toHaveLength(0)
  })
})

describe('shouldShowWildcardBridge', () => {
  it('lists connectivity and security', () => {
    expect(WILDCARD_BRIDGE_DOMAIN_IDS).toEqual(['connectivity', 'security'])
  })

  it('requires onOpenSubnet and a bridge domain', () => {
    const open = () => {}
    expect(shouldShowWildcardBridge('connectivity', open)).toBe(true)
    expect(shouldShowWildcardBridge('security', open)).toBe(true)
    expect(shouldShowWildcardBridge('fundamentals', open)).toBe(false)
    expect(shouldShowWildcardBridge('connectivity', null)).toBe(false)
  })
})
