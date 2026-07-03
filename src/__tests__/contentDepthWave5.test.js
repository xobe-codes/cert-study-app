import { describe, it, expect } from 'vitest'
import { CONTENT_DEPTH_WAVE5_PATCHES } from '../data/contentDepthWave5Patches.js'
import { TIER_B_TRAP_WAVE5_PATCHES } from '../data/tierBTrapWave5Patches.js'
import { getEnrichmentPatchQuestions, applyContentEnrichment } from '../data/contentEnrichmentPatches.js'

describe('contentDepthWave5', () => {
  it('has 15 wave-5 depth objectives', () => {
    expect(Object.keys(CONTENT_DEPTH_WAVE5_PATCHES).length).toBe(15)
  })

  it('each wave-5 question has four choices', () => {
    for (const patch of Object.values(CONTENT_DEPTH_WAVE5_PATCHES)) {
      const q = patch.questions[0]
      expect(q.choices).toHaveLength(4)
      expect(q.correctIndex).toBeGreaterThanOrEqual(0)
      expect(q.correctIndex).toBeLessThan(4)
    }
  })

  it('trap wave 5 adds trap and flashcard per objective', () => {
    for (const patch of Object.values(TIER_B_TRAP_WAVE5_PATCHES)) {
      expect(patch.examTraps).toHaveLength(1)
      expect(patch.flashcards).toHaveLength(1)
    }
  })

  it('merges wave 5 into enrichment', () => {
    const qs = getEnrichmentPatchQuestions('5.10')
    expect(qs.some(q => q.id === '5.10-w5-q1')).toBe(true)
    const enriched = applyContentEnrichment({ examTraps: [], flashcards: [], questions: [] }, '5.10')
    expect(enriched.examTraps.some(t => t.id === '5.10-w5-t3')).toBe(true)
  })
})
