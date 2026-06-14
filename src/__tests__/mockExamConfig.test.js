import { describe, it, expect, beforeAll } from 'vitest'
import {
  MOCK_EXAM_QUESTION_COUNT,
  staticMockExamReady,
  buildStaticMockExamPool,
  buildMockExamDomainCounts,
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
})
