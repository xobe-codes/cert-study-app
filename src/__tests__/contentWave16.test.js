import { describe, it, expect } from 'vitest'
import { TIER_B_TRAP_WAVE16_PATCHES } from '../data/tierBTrapWave16Patches.js'
import { TIER_B_TRAP_WAVE17_PATCHES } from '../data/tierBTrapWave17Patches.js'
import { applyContentEnrichment } from '../data/contentEnrichmentPatches.js'
import { getCurated } from '../data/ccnaCurated.js'

describe('contentWave16', () => {
  it('wave 16 covers 48 objectives at 6 traps', () => {
    expect(Object.keys(TIER_B_TRAP_WAVE16_PATCHES)).toHaveLength(48)
  })

  it('raises 3.1 to at least 7 traps after wave 16', () => {
    const base = getCurated('3.1')
    const enriched = applyContentEnrichment({ examTraps: base?.examTraps || [] }, '3.1')
    expect(enriched.examTraps?.some(t => t.id === '3.1-w16-t1')).toBe(true)
    expect(enriched.examTraps?.length).toBeGreaterThanOrEqual(7)
  })
})

describe('contentWave17', () => {
  it('wave 17 covers all 53 objectives at 7 traps baseline', () => {
    expect(Object.keys(TIER_B_TRAP_WAVE17_PATCHES)).toHaveLength(53)
  })

  it('raises 5.5 to at least 8 traps after wave 17', () => {
    const base = getCurated('5.5')
    const enriched = applyContentEnrichment({ examTraps: base?.examTraps || [] }, '5.5')
    expect(enriched.examTraps?.some(t => t.id === '5.5-w17-t1')).toBe(true)
    expect(enriched.examTraps?.length).toBeGreaterThanOrEqual(8)
  })
})
