import { describe, it, expect } from 'vitest'
import { applyContentEnrichment } from '../data/contentEnrichmentPatches.js'
import { TIER_B_TRAP_WAVE15_PATCHES } from '../data/tierBTrapWave15Patches.js'

describe('contentWave15', () => {
  it('trap wave 15 covers 43 objectives at 5 traps', () => {
    expect(Object.keys(TIER_B_TRAP_WAVE15_PATCHES)).toHaveLength(43)
  })

  it('adds sixth trap for 3.1 routing', () => {
    const enriched = applyContentEnrichment({ examTraps: [] }, '3.1')
    expect(enriched.examTraps?.some(t => t.id === '3.1-w15-t1')).toBe(true)
  })

  it('adds sixth trap for 5.8 ACL types', () => {
    const enriched = applyContentEnrichment({ examTraps: [] }, '5.8')
    expect(enriched.examTraps?.some(t => t.id === '5.8-w15-t1')).toBe(true)
  })
})
