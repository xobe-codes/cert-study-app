import { describe, it, expect, beforeAll } from 'vitest'
import { buildTopicIndex, resolveCkuIdsFromConcepts, TOPIC_PRESETS } from '../topic/topicIndex.js'
import { CCNA_TERM_REGISTRY } from '../topic/ccnaTermRegistry.js'
import { searchTopicsGlobal, dictionaryEntriesForDomain } from '../topic/topicSearch.js'
import { estimateTopicFocusQuestions } from '../topic/topicFocusQuiz.js'
import { preloadCleanBank } from '../data/cleanQuestionAdapter.js'

describe('topic focus', () => {
  beforeAll(async () => {
    await preloadCleanBank()
  })

  it('builds a non-empty concept index from curated packs', () => {
    const { objectives, concepts, conceptById, dictionary, termRegistry } = buildTopicIndex()
    expect(objectives.length).toBeGreaterThan(50)
    expect(concepts.length).toBeGreaterThan(100)
    expect(conceptById.size).toBe(concepts.length)
    expect(dictionary.length).toBeGreaterThan(CCNA_TERM_REGISTRY.length)
    expect(termRegistry.length).toBe(CCNA_TERM_REGISTRY.length)
  })

  it('resolves CKU ids from glossary and cku concepts', () => {
    const index = buildTopicIndex()
    const glossary = index.concepts.find(c => c.kind === 'glossary' && c.ckuIds?.length)
    expect(glossary).toBeTruthy()
    const ckus = resolveCkuIdsFromConcepts([glossary.id], index)
    expect(ckus.size).toBeGreaterThan(0)
  })

  it('estimates questions for routing preset', () => {
    const preset = TOPIC_PRESETS.find(p => p.id === 'preset-routing')
    const count = estimateTopicFocusQuestions(preset.objectiveIds, [])
    expect(count).toBeGreaterThan(10)
  })

  it('narrows pool when specific concepts are selected', () => {
    const index = buildTopicIndex()
    const obj = '3.2'
    const full = estimateTopicFocusQuestions([obj], [], index)
    const concept = index.concepts.find(c => c.objectiveId === obj && c.kind === 'glossary')
    expect(concept).toBeTruthy()
    const narrow = estimateTopicFocusQuestions([], [concept.id], index)
    expect(narrow).toBeGreaterThan(0)
    expect(narrow).toBeLessThanOrEqual(full)
  })

  it('finds EIGRP via global search and registry', () => {
    const index = buildTopicIndex()
    const eigrp = index.termRegistry.find(t => t.term === 'EIGRP')
    expect(eigrp).toBeTruthy()
    expect(eigrp.definition).toMatch(/DUAL|AD 90|route code D/i)
    expect(eigrp.relatedConceptIds.length).toBeGreaterThan(0)

    const results = searchTopicsGlobal(index, 'eigrp')
    expect(results.clusters.some(c => c.term.term === 'EIGRP')).toBe(true)
    expect(results.dictionary.some(d => d.entry.term === 'EIGRP')).toBe(true)
  })

  it('stores full definitions on concepts (not truncated previews)', () => {
    const index = buildTopicIndex()
    const cku = index.concepts.find(c => c.kind === 'cku' && c.definition && c.definition.length > 130)
    expect(cku).toBeTruthy()
    expect(cku.detail.length).toBeLessThanOrEqual(120)
    expect(cku.definition.length).toBeGreaterThan(cku.detail.length)
  })

  it('dictionary includes registry terms with full definitions', () => {
    const index = buildTopicIndex()
    const entry = index.dictionary.find(d => d.term === 'OSPF')
    expect(entry).toBeTruthy()
    expect(entry.source).toBe('registry')
    expect(entry.definition.length).toBeGreaterThan(80)
    expect(dictionaryEntriesForDomain(index, 'all').some(d => d.term === 'VLAN')).toBe(true)
  })
})
