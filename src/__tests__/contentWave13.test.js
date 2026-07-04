import { describe, it, expect } from 'vitest'
import { applyContentEnrichment } from '../data/contentEnrichmentPatches.js'
import { TIER_B_TRAP_WAVE13_PATCHES } from '../data/tierBTrapWave13Patches.js'
import { READING_COMMANDS_WAVE2_PATCHES } from '../data/readingCommandsWave2Patches.js'
import { CONTENT_DEPTH_WAVE11_PATCHES } from '../data/contentDepthWave11Patches.js'

describe('contentWave13', () => {
  it('trap wave 13 covers remaining objectives at 3 traps', () => {
    expect(Object.keys(TIER_B_TRAP_WAVE13_PATCHES).length).toBeGreaterThanOrEqual(18)
  })

  it('adds trap for 5.11 zone-pair misconception', () => {
    const enriched = applyContentEnrichment({ examTraps: [], flashcards: [], commands: [] }, '5.11')
    expect(enriched.examTraps?.some(t => t.id === '5.11-w13-t1')).toBe(true)
  })

  it('reading commands wave 2 adds CLI blocks for 4.6', () => {
    expect(READING_COMMANDS_WAVE2_PATCHES['4.6']?.commands?.length).toBeGreaterThanOrEqual(2)
    const enriched = applyContentEnrichment({ commands: [] }, '4.6')
    expect(enriched.commands?.length).toBeGreaterThanOrEqual(2)
  })

  it('depth wave 11 adds flashcard for 5.4', () => {
    expect(CONTENT_DEPTH_WAVE11_PATCHES['5.4']?.flashcards?.length).toBe(1)
    const enriched = applyContentEnrichment({ flashcards: [] }, '5.4')
    expect(enriched.flashcards?.some(f => f.id === '5.4-w11-f1')).toBe(true)
  })
})
