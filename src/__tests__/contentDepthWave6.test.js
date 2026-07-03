import { describe, it, expect } from 'vitest'
import { CONTENT_DEPTH_WAVE6_PATCHES } from '../data/contentDepthWave6Patches.js'
import { TIER_B_TRAP_WAVE6_PATCHES } from '../data/tierBTrapWave6Patches.js'
import { getEnrichmentPatchQuestions, applyContentEnrichment } from '../data/contentEnrichmentPatches.js'

describe('contentDepthWave6', () => {
  it('has 12 wave-6 depth objectives', () => {
    expect(Object.keys(CONTENT_DEPTH_WAVE6_PATCHES).length).toBe(12)
  })

  it('each wave-6 question has four choices', () => {
    for (const patch of Object.values(CONTENT_DEPTH_WAVE6_PATCHES)) {
      const q = patch.questions[0]
      expect(q.choices).toHaveLength(4)
      expect(q.correctIndex).toBeGreaterThanOrEqual(0)
      expect(q.correctIndex).toBeLessThan(4)
    }
  })

  it('trap wave 6 adds trap and flashcard per objective', () => {
    expect(Object.keys(TIER_B_TRAP_WAVE6_PATCHES).length).toBe(10)
    for (const patch of Object.values(TIER_B_TRAP_WAVE6_PATCHES)) {
      expect(patch.examTraps).toHaveLength(1)
      expect(patch.flashcards).toHaveLength(1)
    }
  })

  it('merges wave 6 into enrichment', () => {
    const qs = getEnrichmentPatchQuestions('1.1')
    expect(qs.some(q => q.id === '1.1-w6-q1')).toBe(true)
    const enriched = applyContentEnrichment({ examTraps: [], flashcards: [], questions: [] }, '1.1')
    expect(enriched.examTraps.some(t => t.id === '1.1-w6-t1')).toBe(true)
  })
})
