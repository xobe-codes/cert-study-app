import { describe, it, expect } from 'vitest'
import { TIER_B_TRAP_WAVE21_PATCHES } from '../data/tierBTrapWave21Patches.js'
import { applyContentEnrichment } from '../data/contentEnrichmentPatches.js'
import { ALL_OBJECTIVES } from '../data/ccnaDomains.js'
import { getCurated } from '../data/ccnaCurated.js'

describe('tierBTrapWave21', () => {
  it('covers all 53 objectives with one trap each', () => {
    expect(Object.keys(TIER_B_TRAP_WAVE21_PATCHES)).toHaveLength(53)
    for (const obj of ALL_OBJECTIVES) {
      const patch = TIER_B_TRAP_WAVE21_PATCHES[obj.id]
      expect(patch?.examTraps?.length).toBe(1)
      expect(patch.examTraps[0].id).toBe(`${obj.id}-w21-t1`)
    }
  })

  it('merges into curated traps and raises avg beyond 11', () => {
    const counts = ALL_OBJECTIVES.map(o => (getCurated(o.id)?.examTraps || []).length)
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length
    expect(avg).toBeGreaterThanOrEqual(12)
    const enriched = applyContentEnrichment({ examTraps: [] }, '3.1')
    expect(enriched.examTraps?.some(t => t.id === '3.1-w21-t1')).toBe(true)
  })
})
