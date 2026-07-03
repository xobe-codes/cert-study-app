import { describe, it, expect } from 'vitest'
import { TIER_B_TRAP_WAVE11_PATCHES } from '../data/tierBTrapWave11Patches.js'
import { applyContentEnrichment } from '../data/contentEnrichmentPatches.js'

describe('tierBTrapWave11', () => {
  it('covers CDP/EtherChannel/WLC objectives 2.3–2.8', () => {
    expect(Object.keys(TIER_B_TRAP_WAVE11_PATCHES)).toEqual([
      '2.3', '2.4', '2.5', '2.6', '2.7', '2.8',
    ])
    for (const patch of Object.values(TIER_B_TRAP_WAVE11_PATCHES)) {
      expect(patch.examTraps?.length).toBe(1)
      expect(patch.flashcards?.length).toBe(1)
    }
  })

  it('merges wave 11 traps for CDP 2.3', () => {
    const enriched = applyContentEnrichment({ examTraps: [], flashcards: [] }, '2.3')
    expect(enriched.examTraps?.some((t) => t.id === '2.3-w11-t1')).toBe(true)
    expect(enriched.flashcards?.some((f) => f.id === '2.3-w11-f1')).toBe(true)
  })

  it('brings 2.3 to at least 4 exam traps with factory + prior waves', () => {
    const enriched = applyContentEnrichment({ examTraps: [], flashcards: [] }, '2.3')
    expect(enriched.examTraps?.length).toBeGreaterThanOrEqual(4)
  })
})
