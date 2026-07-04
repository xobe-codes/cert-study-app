import { describe, it, expect } from 'vitest'
import { applyContentEnrichment } from '../data/contentEnrichmentPatches.js'
import { TIER_B_TRAP_WAVE12_PATCHES } from '../data/tierBTrapWave12Patches.js'
import { READING_COMMANDS_WAVE1_PATCHES } from '../data/readingCommandsWave1Patches.js'
import { CONTENT_DEPTH_WAVE10_PATCHES } from '../data/contentDepthWave10Patches.js'

describe('contentWave12', () => {
  it('trap wave 12 covers 12 objectives at 3 traps', () => {
    expect(Object.keys(TIER_B_TRAP_WAVE12_PATCHES)).toHaveLength(12)
  })

  it('adds trap for 4.2 NTP stratum misconception', () => {
    const enriched = applyContentEnrichment({ examTraps: [], flashcards: [], commands: [] }, '4.2')
    expect(enriched.examTraps?.some(t => t.id === '4.2-w12-t1')).toBe(true)
  })

  it('reading commands wave adds CLI blocks for 4.3', () => {
    expect(READING_COMMANDS_WAVE1_PATCHES['4.3']?.commands?.length).toBeGreaterThanOrEqual(3)
    const enriched = applyContentEnrichment({ commands: [] }, '4.3')
    expect(enriched.commands?.length).toBeGreaterThanOrEqual(3)
  })

  it('depth wave 10 adds flashcards for 3.5', () => {
    expect(CONTENT_DEPTH_WAVE10_PATCHES['3.5']?.flashcards?.length).toBe(1)
    const enriched = applyContentEnrichment({ flashcards: [] }, '3.5')
    expect(enriched.flashcards?.some(f => f.id === '3.5-w10-f1')).toBe(true)
  })
})
