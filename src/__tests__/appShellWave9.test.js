import { describe, it, expect } from 'vitest'
import { TIER_B_TRAP_WAVE9_PATCHES } from '../data/tierBTrapWave9Patches.js'
import { applyContentEnrichment } from '../data/contentEnrichmentPatches.js'
import { ALL_OBJECTIVES } from '../data/ccnaDomains.js'
import { TIER_B_TRAP_WAVE4_PATCHES } from '../data/tierBTrapWave4Patches.js'
import { TIER_B_TRAP_WAVE5_PATCHES } from '../data/tierBTrapWave5Patches.js'
import { TIER_B_TRAP_WAVE6_PATCHES } from '../data/tierBTrapWave6Patches.js'
import { TIER_B_TRAP_WAVE7_PATCHES } from '../data/tierBTrapWave7Patches.js'
import { TIER_B_TRAP_WAVE8_PATCHES } from '../data/tierBTrapWave8Patches.js'
import { BATCH24_GOLD } from '../answerReview/goldAnswerReviewsBatch24.js'

describe('tierBTrapWave9', () => {
  it('covers all objectives missing from waves 4–8', () => {
    const covered = new Set([
      ...Object.keys(TIER_B_TRAP_WAVE4_PATCHES),
      ...Object.keys(TIER_B_TRAP_WAVE5_PATCHES),
      ...Object.keys(TIER_B_TRAP_WAVE6_PATCHES),
      ...Object.keys(TIER_B_TRAP_WAVE7_PATCHES),
      ...Object.keys(TIER_B_TRAP_WAVE8_PATCHES),
      ...Object.keys(TIER_B_TRAP_WAVE9_PATCHES),
    ])
    const missing = ALL_OBJECTIVES.map(o => o.id).filter(id => !covered.has(id))
    expect(missing).toEqual([])
    expect(Object.keys(TIER_B_TRAP_WAVE9_PATCHES).length).toBe(7)
  })

  it('merges traps for topology 1.2', () => {
    const enriched = applyContentEnrichment({ examTraps: [], flashcards: [] }, '1.2')
    expect(enriched.examTraps?.some(t => t.id === '1.2-w9-t1')).toBe(true)
  })
})

describe('goldAnswerReviewsBatch24', () => {
  it('has 25 hand-authored entries', () => {
    expect(Object.keys(BATCH24_GOLD).length).toBe(25)
  })
})
