import { describe, it, expect } from 'vitest'
import {
  dottedMaskFromPrefix,
  usableHostsForPrefix,
  blockSizeForPrefix,
  expandFamily,
  expandFamiliesToObjectiveMap,
  countExpandedQuestions,
} from '../data/parametric/parametricEngine.js'
import { CCNA_PARAMETRIC_FAMILIES } from '../data/parametric/ccnaParametricFamilies.js'
import { FACTORY_PARAMETRIC_WAVE1_QUESTIONS } from '../data/factoryParametricWave1Questions.js'
import { getEnrichmentPatchQuestions } from '../data/contentEnrichmentPatches.js'
import { getCuratedQuestions } from '../data/ccnaCurated.js'
import { isMcQuestion } from '../questionUtils.js'

describe('parametricEngine math', () => {
  it('computes usable hosts and masks', () => {
    expect(usableHostsForPrefix(24)).toBe(254)
    expect(usableHostsForPrefix(26)).toBe(62)
    expect(usableHostsForPrefix(30)).toBe(2)
    expect(blockSizeForPrefix(27)).toBe(32)
    expect(dottedMaskFromPrefix(28)).toBe('255.255.255.240')
    expect(dottedMaskFromPrefix(24)).toBe('255.255.255.0')
  })
})

describe('parametric wave 1', () => {
  const map = FACTORY_PARAMETRIC_WAVE1_QUESTIONS
  const total = countExpandedQuestions(map)

  it('expands a substantial bank-wide set', () => {
    expect(total).toBeGreaterThanOrEqual(100)
    expect(Object.keys(map).length).toBeGreaterThanOrEqual(15)
  })

  it('covers multiple domains (objectives across 1–6)', () => {
    const domains = new Set(Object.keys(map).map(id => id.split('.')[0]))
    expect(domains.has('1')).toBe(true)
    expect(domains.has('2')).toBe(true)
    expect(domains.has('3')).toBe(true)
    expect(domains.has('4')).toBe(true)
    expect(domains.has('5')).toBe(true)
    expect(domains.has('6')).toBe(true)
  })

  it('emits valid MC shapes with unique ids', () => {
    const ids = new Set()
    for (const [oid, list] of Object.entries(map)) {
      for (const q of list) {
        expect(isMcQuestion(q), `${oid} ${q.id}`).toBe(true)
        expect(q.explanation?.length).toBeGreaterThan(20)
        expect(q.parametricFamily).toBeTruthy()
        expect(ids.has(q.id), `duplicate ${q.id}`).toBe(false)
        ids.add(q.id)
      }
    }
  })

  it('includes full /24–/30 usable-host sweep', () => {
    const hosts = (map['1.6'] || []).filter(q => q.id.includes('param-hosts'))
    expect(hosts.map(q => q.id).sort()).toEqual([
      'obj-1.6-param-hosts-24',
      'obj-1.6-param-hosts-25',
      'obj-1.6-param-hosts-26',
      'obj-1.6-param-hosts-27',
      'obj-1.6-param-hosts-28',
      'obj-1.6-param-hosts-29',
      'obj-1.6-param-hosts-30',
    ])
    const q26 = hosts.find(q => q.id.endsWith('-26'))
    expect(q26.choices[q26.correctIndex]).toBe('62')
  })

  it('merges into enrichment + curated pools', () => {
    const enrich = getEnrichmentPatchQuestions('1.6')
    expect(enrich.some(q => q.id?.startsWith('obj-1.6-param-'))).toBe(true)
    const curated = getCuratedQuestions('1.6')
    expect(curated.some(q => q.id?.startsWith('obj-1.6-param-'))).toBe(true)
  })

  it('expandFamily respects skip', () => {
    const qs = expandFamily({
      id: 't',
      idPrefix: 't',
      objectiveId: '1.1',
      parameters: [{ n: 1 }, { n: 2 }],
      skip: p => p.n === 2,
      build: ({ n }) => ({
        question: `Q${n}?`,
        choices: ['a', 'b', 'c', 'd'],
        correctIndex: 0,
        explanation: 'Because the correct choice is a for this parametric unit test.',
      }),
    })
    expect(qs).toHaveLength(1)
  })

  it('family list expands via helper', () => {
    const m = expandFamiliesToObjectiveMap(CCNA_PARAMETRIC_FAMILIES)
    expect(countExpandedQuestions(m)).toBe(total)
  })
})
