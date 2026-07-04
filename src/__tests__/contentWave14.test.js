import { describe, it, expect } from 'vitest'
import { applyContentEnrichment } from '../data/contentEnrichmentPatches.js'
import { TIER_B_TRAP_WAVE14_PATCHES } from '../data/tierBTrapWave14Patches.js'

describe('contentWave14', () => {
  it('trap wave 14 covers 38 objectives at trap floor', () => {
    expect(Object.keys(TIER_B_TRAP_WAVE14_PATCHES)).toHaveLength(38)
  })

  it('adds fifth trap for 2.4 EtherChannel', () => {
    const enriched = applyContentEnrichment({ examTraps: [] }, '2.4')
    expect(enriched.examTraps?.some(t => t.id === '2.4-w14-t1')).toBe(true)
    expect(enriched.examTraps?.length).toBeGreaterThanOrEqual(5)
  })

  it('adds fifth trap for 3.6 troubleshooting', () => {
    const enriched = applyContentEnrichment({ examTraps: [] }, '3.6')
    expect(enriched.examTraps?.some(t => t.id === '3.6-w14-t1')).toBe(true)
  })
})
