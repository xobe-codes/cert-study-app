import { describe, it, expect, beforeAll } from 'vitest'
import {
  MOCK_EXAM_QUESTION_COUNT,
  staticMockExamReady,
  buildStaticMockExamPool,
  buildMockExamDomainCounts,
  buildBlueprintWeightedPool,
  sampleAdaptiveQuestions,
} from '../mockExamConfig.js'
import { preloadCleanBank } from '../data/cleanQuestionAdapter.js'
import { getCuratedQuestions } from '../data/ccnaCurated.js'
import { isMcQuestion } from '../questionUtils.js'

// Minimal domain shape matching App.jsx DOMAINS entries
const DOMAINS = [
  { id: 'fundamentals', weight: 20, objectives: [{ id: '1.1' }, { id: '1.6' }] },
  { id: 'access', weight: 20, objectives: [{ id: '2.1' }, { id: '2.5' }] },
  { id: 'connectivity', weight: 25, objectives: [{ id: '3.2' }, { id: '3.4' }] },
  { id: 'services', weight: 10, objectives: [{ id: '4.1' }, { id: '4.3' }] },
  { id: 'security', weight: 15, objectives: [{ id: '5.5' }, { id: '5.6' }] },
  { id: 'automation', weight: 10, objectives: [{ id: '6.2' }, { id: '6.3' }] },
]

describe('mockExamConfig', () => {
  beforeAll(async () => {
    await preloadCleanBank()
  })

  it('buildMockExamDomainCounts sums to question count', () => {
    const counts = buildMockExamDomainCounts(DOMAINS, MOCK_EXAM_QUESTION_COUNT)
    const total = counts.reduce((n, c) => n + c.count, 0)
    expect(total).toBe(MOCK_EXAM_QUESTION_COUNT)
  })

  it('static mock exam is ready with full clean bank', () => {
    const getMc = id => getCuratedQuestions(id).filter(isMcQuestion)
    expect(staticMockExamReady(DOMAINS, getMc)).toBe(true)
  })

  it('buildStaticMockExamPool returns weighted question count', () => {
    const getMc = id => getCuratedQuestions(id).filter(isMcQuestion)
    const pool = buildStaticMockExamPool(DOMAINS, getMc, arr => [...arr])
    expect(pool.length).toBe(MOCK_EXAM_QUESTION_COUNT)
    expect(pool.every(q => isMcQuestion(q))).toBe(true)
  })

  it('sampleAdaptiveQuestions favors weak CKU overlap', () => {
    const questions = [
      { id: 'a', ckuIds: ['CKU-ACL'], question: 'a' },
      { id: 'b', ckuIds: ['CKU-VLAN'], question: 'b' },
      { id: 'c', ckuIds: ['CKU-ACL', 'CKU-NAT'], question: 'c' },
      { id: 'd', ckuIds: ['CKU-OSPF'], question: 'd' },
    ]
    const weakHits = new Set()
    for (let i = 0; i < 40; i++) {
      sampleAdaptiveQuestions(questions, ['CKU-ACL'], 2, arr => [...arr]).forEach(q => weakHits.add(q.id))
    }
    expect(weakHits.has('a') || weakHits.has('c')).toBe(true)
    const picked = sampleAdaptiveQuestions(questions, [], 2, arr => [...arr])
    expect(picked.length).toBe(2)
  })

  it('buildBlueprintWeightedPool preserves domain count and favors weak CKUs', () => {
    const getMc = id => getCuratedQuestions(id).filter(isMcQuestion)
    const pool = buildBlueprintWeightedPool(DOMAINS, getMc, ['CKU-ACL'], arr => [...arr])
    expect(pool.length).toBe(MOCK_EXAM_QUESTION_COUNT)
    expect(pool.every(q => isMcQuestion(q))).toBe(true)
    const staticPool = buildStaticMockExamPool(DOMAINS, getMc, arr => [...arr])
    expect(staticPool.length).toBe(MOCK_EXAM_QUESTION_COUNT)
  })
})
