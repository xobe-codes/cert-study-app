import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  DOMAIN_PASS_PASS_PCT,
  domainPassQuestionCount,
  domainPassFocusQuestionCount,
  domainPassDurationSec,
  isDomainPassPassed,
  domainPassStatus,
  domainPassBadgeLabel,
  sortDomainPassHubDomains,
  evaluateDomainPass,
} from '../features/domainPass/domainPassConfig.js'
import { buildDomainPassPool, computeWeakObjectivesFromResponses } from '../features/domainPass/buildDomainPassPool.js'
import { countPassedDomains } from '../features/domainPass/domainPassStorage.js'

const mockDomain = {
  id: 'fundamentals',
  weight: 20,
  objectives: [{ id: '1.1' }, { id: '1.2' }],
}

describe('domainPassConfig', () => {
  it('uses weight-scaled question counts with a floor', () => {
    expect(domainPassQuestionCount(mockDomain)).toBeGreaterThanOrEqual(12)
    expect(domainPassQuestionCount({ ...mockDomain, weight: 25 })).toBeGreaterThan(
      domainPassQuestionCount(mockDomain),
    )
  })

  it('pass threshold is 80%', () => {
    expect(DOMAIN_PASS_PASS_PCT).toBe(80)
    expect(isDomainPassPassed(80)).toBe(true)
    expect(isDomainPassPassed(79)).toBe(false)
    expect(evaluateDomainPass({ correct: 8, total: 10 }).passed).toBe(true)
    expect(evaluateDomainPass({ correct: 7, total: 10 }).passed).toBe(false)
  })

  it('focus question count scales with selected objectives', () => {
    expect(domainPassFocusQuestionCount(1)).toBe(6)
    expect(domainPassFocusQuestionCount(3, 7)).toBe(7)
  })

  it('timer duration scales with question count when enabled', () => {
    const sec = domainPassDurationSec(mockDomain, true)
    expect(sec).toBeGreaterThan(0)
    expect(domainPassDurationSec(mockDomain, false)).toBe(0)
  })

  it('status and badge labels', () => {
    expect(domainPassStatus(null)).toBe('not_started')
    expect(domainPassBadgeLabel('not_started')).toBe('Not started')
    expect(domainPassStatus({ attempts: 1, passed: false, lastAt: Date.now() })).toBe('retake')
    expect(domainPassStatus({ attempts: 1, passed: true, lastAt: Date.now() })).toBe('passed')
    expect(domainPassBadgeLabel('passed')).toBe('✓ Passed')
  })

  it('sortDomainPassHubDomains orders no-baseline first, then lowest pass %, then D1→D6', () => {
    const domains = [
      { id: 'security', objectives: [{ id: '5.1' }] },
      { id: 'fundamentals', objectives: [{ id: '1.1' }] },
      { id: 'access', objectives: [{ id: '2.1' }] },
    ]
    const placementRecords = {
      security: { lastAttempt: { pct: 70 } },
      fundamentals: { lastAttempt: { pct: 85 } },
    }
    const passRecords = {
      security: { bestPct: 55 },
      fundamentals: { bestPct: 90 },
      access: { bestPct: 40 },
    }
    const sorted = sortDomainPassHubDomains(domains, { placementRecords, passRecords })
    expect(sorted.map(d => d.id)).toEqual(['access', 'security', 'fundamentals'])
  })
})

describe('buildDomainPassPool', () => {
  const getMc = (id) => [
    { id: `${id}-a`, objectiveId: id, question: 'Q?', choices: ['a', 'b'], correctIndex: 0, ckuIds: ['cku1'] },
    { id: `${id}-b`, objectiveId: id, question: 'Q2?', choices: ['a', 'b'], correctIndex: 1 },
  ]

  it('builds a non-empty pool for a domain', () => {
    const pool = buildDomainPassPool({
      domain: mockDomain,
      getMcQuestions: getMc,
      shuffle: a => [...a],
    })
    expect(pool.length).toBeGreaterThan(0)
    expect(pool.every(q => q.objectiveId.startsWith('1.'))).toBe(true)
  })

  it('computeWeakObjectivesFromResponses flags missed objectives', () => {
    const questions = [
      { objectiveId: '1.1', correctIndex: 0 },
      { objectiveId: '1.2', correctIndex: 1 },
    ]
    const weak = computeWeakObjectivesFromResponses(questions, { 0: 1, 1: 1 })
    expect(weak).toContain('1.1')
    expect(weak).not.toContain('1.2')
  })

  it('excludes unplayable missed stems from the pool', () => {
    const pool = buildDomainPassPool({
      domain: mockDomain,
      getMcQuestions: getMc,
      shuffle: a => [...a],
      missedQuestions: [
        { objectiveId: '1.1', questionId: 'ghost', question: 'No choices here' },
        { objectiveId: '1.1', question: 'Ordering only', type: 'ordering', orderItems: ['a', 'b', 'c'] },
      ],
    })
    expect(pool.every(q => Array.isArray(q.choices) && q.choices.length >= 2)).toBe(true)
  })

  it('filters pool to selected objectives for focus pass', () => {
    const pool = buildDomainPassPool({
      domain: mockDomain,
      getMcQuestions: getMc,
      shuffle: a => [...a],
      objectiveFilter: ['1.1'],
    })
    expect(pool.every(q => q.objectiveId === '1.1')).toBe(true)
    expect(pool.length).toBeLessThanOrEqual(6)
  })
})

describe('countPassedDomains', () => {
  it('counts domains with passed flag', () => {
    const domains = [{ id: 'a' }, { id: 'b' }]
    const records = { a: { passed: true }, b: { passed: false, attempts: 1 } }
    expect(countPassedDomains(records, domains)).toBe(1)
  })
})

describe('domainPassCelebrated storage', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      storage: {
        _data: {},
        async getItem(k) { return this._data[k] ?? null },
        async setItem(k, v) { this._data[k] = v },
      },
    })
  })

  it('defaults celebrated to false and persists true', async () => {
    const { loadDomainPassCelebrated, saveDomainPassCelebrated } = await import('../features/domainPass/domainPassStorage.js')
    expect(await loadDomainPassCelebrated()).toBe(false)
    await saveDomainPassCelebrated(true)
    expect(await loadDomainPassCelebrated()).toBe(true)
  })

  it('saveDomainPassFocusAttempt appends without overwriting full pass record', async () => {
    const { saveDomainPassRecord, saveDomainPassFocusAttempt, loadDomainPassRecords } = await import('../features/domainPass/domainPassStorage.js')
    await saveDomainPassRecord('fundamentals', { passed: true, bestPct: 90, lastAt: Date.now(), weakObjectives: ['1.1'] })
    await saveDomainPassFocusAttempt('fundamentals', { correct: 4, total: 6, objectiveIds: ['1.1'], weakObjectiveIds: ['1.2'] })
    const records = await loadDomainPassRecords()
    expect(records.fundamentals.passed).toBe(true)
    expect(records.fundamentals.bestPct).toBe(90)
    expect(records.fundamentals.focusAttempts).toHaveLength(1)
  })
})
