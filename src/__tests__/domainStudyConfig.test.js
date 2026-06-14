import { describe, it, expect, beforeAll } from 'vitest'
import {
  buildDomainStudyPool,
  countDomainStudyPool,
  resolveSelectedDomains,
  validateDomainStudyStart,
} from '../domainStudyConfig.js'
import { preloadCleanBank } from '../data/cleanQuestionAdapter.js'
import { getCuratedQuestions } from '../data/ccnaCurated.js'
import { isMcQuestion } from '../questionUtils.js'

const DOMAINS = [
  { id: 'fundamentals', objectives: [{ id: '1.1' }, { id: '1.6' }] },
  { id: 'access', objectives: [{ id: '2.1' }, { id: '2.5' }] },
  { id: 'connectivity', objectives: [{ id: '3.2' }, { id: '3.4' }] },
  { id: 'services', objectives: [{ id: '4.1' }, { id: '4.3' }] },
  { id: 'security', objectives: [{ id: '5.5' }, { id: '5.6' }] },
  { id: 'automation', objectives: [{ id: '6.2' }, { id: '6.3' }] },
]

describe('domainStudyConfig', () => {
  beforeAll(async () => {
    await preloadCleanBank()
  })

  const getMc = id => getCuratedQuestions(id).filter(isMcQuestion)

  it('resolveSelectedDomains preserves order and filters by id', () => {
    const picked = resolveSelectedDomains(DOMAINS, ['security', 'fundamentals'])
    expect(picked.map(d => d.id)).toEqual(['fundamentals', 'security'])
  })

  it('countDomainStudyPool sums MC questions for one domain', () => {
    const single = resolveSelectedDomains(DOMAINS, ['fundamentals'])
    const count = countDomainStudyPool(single, getMc)
    expect(count).toBe(getMc('1.1').length + getMc('1.6').length)
    expect(count).toBeGreaterThan(0)
  })

  it('countDomainStudyPool unions multiple domains', () => {
    const multi = resolveSelectedDomains(DOMAINS, ['fundamentals', 'access'])
    const singleFund = countDomainStudyPool(resolveSelectedDomains(DOMAINS, ['fundamentals']), getMc)
    const singleAccess = countDomainStudyPool(resolveSelectedDomains(DOMAINS, ['access']), getMc)
    expect(countDomainStudyPool(multi, getMc)).toBe(singleFund + singleAccess)
  })

  it('buildDomainStudyPool only draws from selected domains', () => {
    const selected = resolveSelectedDomains(DOMAINS, ['fundamentals', 'security'])
    const pool = buildDomainStudyPool(selected, getMc, 8, arr => [...arr])
    expect(pool).toHaveLength(8)
    expect(pool.every(q => isMcQuestion(q))).toBe(true)
    const allowedPrefixes = new Set(['1.', '5.'])
    expect(pool.every(q => [...allowedPrefixes].some(p => (q.objectiveId || '').startsWith(p)))).toBe(true)
  })

  it('validateDomainStudyStart rejects empty selection', () => {
    const result = validateDomainStudyStart([], DOMAINS, getMc, 10)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/at least one domain/i)
  })

  it('validateDomainStudyStart rejects session size larger than pool', () => {
    const selected = resolveSelectedDomains(DOMAINS, ['services'])
    const poolSize = countDomainStudyPool(selected, getMc)
    const result = validateDomainStudyStart(['services'], DOMAINS, getMc, poolSize + 100)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/only \d+ question/i)
  })
})
