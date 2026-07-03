import { describe, it, expect } from 'vitest'
import { CONTENT_DEPTH_WAVE4_PATCHES } from '../data/contentDepthWave4Patches.js'
import { TIER_B_TRAP_WAVE4_PATCHES } from '../data/tierBTrapWave4Patches.js'
import { getEnrichmentPatchQuestions, applyContentEnrichment } from '../data/contentEnrichmentPatches.js'

const WAVE3_KEYS = new Set([
  '2.3', '2.4', '2.7', '2.8', '3.5', '3.6', '4.2', '4.6', '4.7', '4.8',
  '5.3', '5.4', '5.6', '5.7', '5.9', '6.5', '6.6',
])

describe('contentDepthWave4Patches', () => {
  it('covers ~15 Tier B objectives not in wave 3', () => {
    const keys = Object.keys(CONTENT_DEPTH_WAVE4_PATCHES)
    expect(keys.length).toBeGreaterThanOrEqual(15)
    for (const key of keys) {
      expect(WAVE3_KEYS.has(key), `wave4 overlaps wave3: ${key}`).toBe(false)
    }
  })

  it('each patch has one MC question with four choices', () => {
    for (const [objectiveId, patch] of Object.entries(CONTENT_DEPTH_WAVE4_PATCHES)) {
      expect(patch.questions, objectiveId).toHaveLength(1)
      const q = patch.questions[0]
      expect(q.id).toBeTruthy()
      expect(q.choices, objectiveId).toHaveLength(4)
      expect(q.correctIndex).toBeGreaterThanOrEqual(0)
      expect(q.correctIndex).toBeLessThan(4)
      expect(q.explanation).toBeTruthy()
      expect(q.ckuIds?.length).toBeGreaterThan(0)
    }
  })

  it('merges wave4 questions via getEnrichmentPatchQuestions', () => {
    const qs = getEnrichmentPatchQuestions('3.3')
    expect(qs.some(q => q.id === '3.3-w4-q1')).toBe(true)
  })

  it('merges wave4 questions via applyContentEnrichment', () => {
    const enriched = applyContentEnrichment({ questions: [] }, '5.1')
    expect(enriched.questions.some(q => q.id === '5.1-w4-q1')).toBe(true)
  })
})

describe('tierBTrapWave4Patches', () => {
  it('covers ~10 objectives with +1 trap and +1 flashcard each', () => {
    const keys = Object.keys(TIER_B_TRAP_WAVE4_PATCHES)
    expect(keys.length).toBeGreaterThanOrEqual(10)
    for (const objectiveId of keys) {
      const patch = TIER_B_TRAP_WAVE4_PATCHES[objectiveId]
      expect(patch.examTraps, objectiveId).toHaveLength(1)
      expect(patch.flashcards, objectiveId).toHaveLength(1)
      expect(patch.examTraps[0].trap).toBeTruthy()
      expect(patch.examTraps[0].correction).toBeTruthy()
      expect(patch.flashcards[0].front).toBeTruthy()
      expect(patch.flashcards[0].back).toBeTruthy()
    }
  })

  it('merges trap wave4 via applyContentEnrichment', () => {
    const enriched = applyContentEnrichment({ examTraps: [], flashcards: [] }, '2.3')
    expect(enriched.examTraps.some(t => t.id === '2.3-w4-t3')).toBe(true)
    expect(enriched.flashcards.some(f => f.id === '2.3-w4-f3')).toBe(true)
  })
})
