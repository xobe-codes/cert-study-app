import { describe, expect, it } from 'vitest'
import { getCurated, getCuratedQuestions } from '../data/ccnaCurated.js'
import { BLUEPRINT_ADJACENT_WAVE2_PATCHES } from '../data/blueprintAdjacentWave2Patches.js'
import { CCNA_TERM_REGISTRY } from '../topic/ccnaTermRegistry.js'

describe('blueprintAdjacentWave2', () => {
  it('covers the six remaining priority objectives', () => {
    expect(Object.keys(BLUEPRINT_ADJACENT_WAVE2_PATCHES).sort()).toEqual(
      ['1.5', '2.7', '3.2', '5.6', '5.7', '6.3'].sort(),
    )
    for (const patch of Object.values(BLUEPRINT_ADJACENT_WAVE2_PATCHES)) {
      expect(patch.questions).toHaveLength(2)
      expect(patch.examTraps.length).toBeGreaterThan(0)
      expect(patch.flashcards.length).toBeGreaterThan(0)
    }
  })

  it('merges adjacent Study content and supplemental questions', () => {
    const multicast = getCurated('1.5')
    expect(multicast.reading.related.join(' ')).toMatch(/IGMP snooping/i)
    expect(multicast.examTraps.map(item => item.id)).toContain('1.5-ba2-t1')

    const telemetry = getCurated('6.3')
    expect(telemetry.reading.related.join(' ')).toMatch(/gNMI/i)
    expect(telemetry.flashcards.map(item => item.id)).toContain('6.3-ba2-f2')

    const questionIds = getCuratedQuestions('5.7').map(item => item.id)
    expect(questionIds).toEqual(expect.arrayContaining(['5.7-ba2-q1', '5.7-ba2-q2']))
  })

  it('registers Wave 2 terms for global search', () => {
    const ids = CCNA_TERM_REGISTRY.map(term => term.id)
    expect(ids).toEqual(expect.arrayContaining([
      'term-igmp-snooping',
      'term-poe-budget',
      'term-lldp-med',
      'term-policy-based-routing',
      'term-storm-control',
      'term-nac-posture',
      'term-gnmi',
    ]))
  })
})
