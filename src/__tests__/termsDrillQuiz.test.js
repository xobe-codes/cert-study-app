import { describe, expect, it } from 'vitest'
import { buildPickDefinitionItems, buildFlashItems, buildTypeTermItems } from '../terms/termsDrillQuiz.js'

const CARDS = [
  { id: 'a', term: 'Certificates', definition: 'DEF-802.1X-COPY' },
  { id: 'b', term: '802.1x', definition: 'DEF-802.1X-COPY' },
  { id: 'c', term: 'VLAN', definition: 'DEF-VLAN' },
  { id: 'd', term: 'STP', definition: 'DEF-STP' },
  { id: 'e', term: 'OSPF', definition: 'DEF-OSPF' },
]

describe('buildPickDefinitionItems', () => {
  it('never offers a distractor with the same definition text as the correct choice', () => {
    // Certificates and 802.1x share a definition (a content-authoring
    // duplicate, real in the shipped bank at one point). If Certificates
    // is quizzed and 802.1x is picked as a distractor, both buttons render
    // identical text and choices.indexOf() can silently flag the wrong one.
    for (let i = 0; i < 50; i++) {
      const items = buildPickDefinitionItems(CARDS, CARDS.length)
      for (const item of items) {
        const seen = new Set()
        for (const choice of item.choices) {
          expect(seen.has(choice)).toBe(false)
          seen.add(choice)
        }
        expect(item.choices[item.correctIndex]).toBe(item.card.definition)
      }
    }
  })

  it('skips a card entirely rather than risk an ambiguous choice set when too few distinct distractors exist', () => {
    const allSame = [
      { id: 'x', term: 'X', definition: 'SAME' },
      { id: 'y', term: 'Y', definition: 'SAME' },
      { id: 'z', term: 'Z', definition: 'SAME' },
    ]
    expect(buildPickDefinitionItems(allSame, 3)).toEqual([])
  })
})

describe('other terms drill builders are unaffected', () => {
  it('buildFlashItems still returns all requested cards', () => {
    expect(buildFlashItems(CARDS, 3)).toHaveLength(3)
  })

  it('buildTypeTermItems still returns all requested cards', () => {
    expect(buildTypeTermItems(CARDS, 3)).toHaveLength(3)
  })
})
