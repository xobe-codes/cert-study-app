import { describe, it, expect, beforeAll } from 'vitest'
import { buildTopicIndex, resolveCkuIdsFromConcepts, TOPIC_PRESETS } from '../topic/topicIndex.js'
import { estimateTopicFocusQuestions } from '../topic/topicFocusQuiz.js'
import { preloadCleanBank } from '../data/cleanQuestionAdapter.js'

describe('topic focus', () => {
  beforeAll(async () => {
    await preloadCleanBank()
  })

  it('builds a non-empty concept index from curated packs', () => {
    const { objectives, concepts, conceptById } = buildTopicIndex()
    expect(objectives.length).toBeGreaterThan(50)
    expect(concepts.length).toBeGreaterThan(100)
    expect(conceptById.size).toBe(concepts.length)
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
})
