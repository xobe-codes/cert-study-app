import { describe, it, expect } from 'vitest'
import { getCurated } from '../data/ccnaCurated.js'
import { BLUEPRINT_ADJACENT_WAVE1_PATCHES } from '../data/blueprintAdjacentWave1Patches.js'
import { CCNA_TERM_REGISTRY } from '../topic/ccnaTermRegistry.js'

describe('blueprintAdjacentWave1', () => {
  it('covers priority adjacent objectives with marked content', () => {
    expect(Object.keys(BLUEPRINT_ADJACENT_WAVE1_PATCHES).sort()).toEqual([
      '1.10', '1.4', '2.2', '2.5', '3.1', '3.4', '4.4', '5.10', '6.1',
    ].sort())
  })

  it('merges split-horizon teaching into objective 3.1 Study content', () => {
    const curated = getCurated('3.1')
    const related = curated?.reading?.related?.join(' ') || ''
    const traps = (curated?.examTraps || []).map(t => t.id)
    const cards = (curated?.flashcards || []).map(f => f.id)
    const questions = (curated?.questions || []).map(q => q.id)

    expect(related).toMatch(/split horizon/i)
    expect(related).toMatch(/Blueprint-adjacent/i)
    expect(traps).toContain('3.1-ba-t1')
    expect(cards).toContain('3.1-ba-f1')
    expect(questions).toContain('3.1-ba-q1')
  })

  it('registers blueprint-adjacent routing terms', () => {
    const ids = CCNA_TERM_REGISTRY.map(t => t.id)
    expect(ids).toEqual(expect.arrayContaining([
      'term-split-horizon',
      'term-poison-reverse',
      'term-count-to-infinity',
      'term-hold-down-timer',
      'term-feasible-successor',
    ]))
    const split = CCNA_TERM_REGISTRY.find(t => t.id === 'term-split-horizon')
    expect(split?.note).toMatch(/Blueprint-adjacent/i)
  })

  it('no longer claims OSPF split horizon in the 5.11 distractor', () => {
    const curated = getCurated('5.11')
    const q = (curated?.questions || []).find(item => item.id === 'obj-5.11-depth-q6')
    expect(q).toBeTruthy()
    expect(q.choices.join(' ')).not.toMatch(/OSPF split horizon/i)
  })
})
