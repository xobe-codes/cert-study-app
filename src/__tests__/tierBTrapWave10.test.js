import { describe, it, expect } from 'vitest'
import { TIER_B_TRAP_WAVE10_PATCHES } from '../data/tierBTrapWave10Patches.js'
import { applyContentEnrichment } from '../data/contentEnrichmentPatches.js'

describe('tierBTrapWave10', () => {
  it('adds trap + flashcard for weakest CKU objectives', () => {
    expect(Object.keys(TIER_B_TRAP_WAVE10_PATCHES)).toEqual(['3.5', '6.3', '6.4'])
    for (const patch of Object.values(TIER_B_TRAP_WAVE10_PATCHES)) {
      expect(patch.examTraps?.length).toBe(1)
      expect(patch.flashcards?.length).toBe(1)
    }
  })

  it('merges wave 10 traps for HSRP 3.5', () => {
    const enriched = applyContentEnrichment({ examTraps: [], flashcards: [] }, '3.5')
    expect(enriched.examTraps?.some((t) => t.id === '3.5-w10-t1')).toBe(true)
    expect(enriched.flashcards?.some((f) => f.id === '3.5-w10-f1')).toBe(true)
  })
})
