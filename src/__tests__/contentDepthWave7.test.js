import { describe, it, expect } from 'vitest'
import { CONTENT_DEPTH_WAVE7_PATCHES } from '../data/contentDepthWave7Patches.js'
import { TIER_B_TRAP_WAVE7_PATCHES } from '../data/tierBTrapWave7Patches.js'
import { getEnrichmentPatchQuestions, applyContentEnrichment } from '../data/contentEnrichmentPatches.js'

describe('contentDepthWave7', () => {
  it('covers all objectives missing from waves 3–6', () => {
    expect(Object.keys(CONTENT_DEPTH_WAVE7_PATCHES).sort()).toEqual(
      ['2.1', '2.2', '2.5', '3.1', '3.4', '4.1', '5.5'].sort(),
    )
  })

  it('each wave-7 objective has one supplemental MC', () => {
    for (const patch of Object.values(CONTENT_DEPTH_WAVE7_PATCHES)) {
      expect(patch.questions?.length).toBe(1)
    }
  })

  it('merges wave-7 questions into enrichment', () => {
    const qs = getEnrichmentPatchQuestions('3.4')
    expect(qs.some(q => q.id === '3.4-w7-q1')).toBe(true)
  })
})

describe('tierBTrapWave7', () => {
  it('has 10 trap wave objectives', () => {
    expect(Object.keys(TIER_B_TRAP_WAVE7_PATCHES).length).toBe(10)
  })

  it('merges traps and flashcards for 5.5', () => {
    const enriched = applyContentEnrichment({ examTraps: [], flashcards: [] }, '5.5')
    expect(enriched.examTraps?.some(t => t.id === '5.5-w7-t1')).toBe(true)
    expect(enriched.flashcards?.some(f => f.id === '5.5-w7-f1')).toBe(true)
  })
})
