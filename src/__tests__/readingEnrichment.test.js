import { describe, it, expect } from 'vitest'
import {
  mergeKbReadingPatch,
  enrichReadingTiers,
  finalizeReading,
  isDraftKbTierText,
  isSubstantialAuthoredTiers,
  wordCount,
  shouldDefaultOpenRealWorld,
} from '../lesson/readingEnrichment.js'
import { getCurated, curatedObjectiveIds } from '../data/ccnaCurated.js'
import { KB_COMPILED_PATCHES } from '../data/kbCompiledPatches.js'

describe('reading enrichment', () => {
  it('detects draft KB tier template', () => {
    expect(isDraftKbTierText('Know the core behavior: VLANs segment broadcasts.')).toBe(true)
    expect(isDraftKbTierText('Exam Topic 4.2 — Configure and verify NTP')).toBe(true)
    expect(isDraftKbTierText('Longest prefix match picks the forwarding route.')).toBe(false)
  })

  it('protects substantial hand-authored tiers from KB overlay', () => {
    const base = {
      tiers: {
        beginner: 'When a packet arrives, the router finds routes that match the destination IP.',
        intermediate: 'Forwarding uses longest prefix match first — the most specific matching route wins.',
        examReady: 'On the exam, separate forwarding from installation: longest prefix match picks the path.',
      },
      keyPoints: ['Order: longest prefix match → AD → metric.'],
      bigTakeaway: 'Longest prefix match picks the forwarding route.',
    }
    const kb = KB_COMPILED_PATCHES['3.2']
    const merged = mergeKbReadingPatch(base, kb)
    expect(merged.tiers).toEqual(base.tiers)
    expect(merged.tiers.examReady).toContain('longest prefix match')
    expect(merged.tiers.examReady).not.toMatch(/Know the core behavior/i)
  })

  it('enriches thin factory tiers from CKUs and key points', () => {
    const pack = getCurated('5.9')
    const enriched = finalizeReading(pack.reading, pack)
    expect(wordCount(enriched.tiers.examReady)).toBeGreaterThan(40)
    expect(enriched.bigTakeaway).toBeTruthy()
  })

  it('getCurated restores flagship 3.2 exam-ready prose at runtime', () => {
    const curated = getCurated('3.2')
    expect(curated.reading.tiers.examReady).toMatch(/longest prefix match|forwarding/i)
    expect(curated.reading.tiers.examReady).not.toMatch(/Know the core behavior/i)
    expect(wordCount(curated.reading.tiers.examReady)).toBeGreaterThan(30)
  })

  it('getCurated enriches majority of objectives to minimum exam-ready depth', () => {
    let enriched = 0
    for (const oid of curatedObjectiveIds) {
      const c = getCurated(oid)
      if (wordCount(c?.reading?.tiers?.examReady) >= 40) enriched += 1
    }
    expect(enriched).toBeGreaterThan(45)
  })

  it('configure objectives default-open real-world section', () => {
    expect(shouldDefaultOpenRealWorld(getCurated('2.1'))).toBe(true)
    expect(shouldDefaultOpenRealWorld(getCurated('6.2'))).toBe(false)
  })

  it('getCurated 1.6 keeps subnetting bigTakeaway not KB OSI text', () => {
    const curated = getCurated('1.6')
    expect(curated.reading.bigTakeaway).toMatch(/block size|subnet|2\^h/i)
    expect(curated.reading.bigTakeaway).not.toMatch(/Layer 7/i)
  })

  it('adds engineer view on routing, switching, and wireless verify objectives', () => {
    for (const oid of ['3.2', '3.4', '4.1', '5.5', '2.2', '5.9']) {
      expect(getCurated(oid).engineerView?.verifyCommands?.length).toBeGreaterThan(0)
    }
  })
})
