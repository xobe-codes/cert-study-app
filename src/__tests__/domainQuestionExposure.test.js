import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  EXPOSURE_TIERS,
  STALE_DAYS_MS,
  pickExposureTier,
  getExposureStats,
  recordSeen,
  loadDomainQuestionExposure,
  domainIdFromObjectiveId,
} from '../features/domainPass/domainQuestionExposure.js'
import { buildDomainPassPool } from '../features/domainPass/buildDomainPassPool.js'

const mockDomain = {
  id: 'fundamentals',
  weight: 20,
  objectives: [
    { id: '1.1' },
    { id: '1.2' },
    { id: '1.3' },
    { id: '1.4' },
  ],
}

function makeMc(id, objectiveId) {
  return {
    id,
    objectiveId,
    question: `Q ${id}?`,
    choices: ['a', 'b', 'c', 'd'],
    correctIndex: 0,
    ckuIds: ['cku1'],
  }
}

function buildGetMc() {
  const bank = {
    '1.1': ['1.1-a', '1.1-b', '1.1-c'].map(id => makeMc(id, '1.1')),
    '1.2': ['1.2-a', '1.2-b', '1.2-c'].map(id => makeMc(id, '1.2')),
    '1.3': ['1.3-a', '1.3-b', '1.3-c'].map(id => makeMc(id, '1.3')),
    '1.4': ['1.4-a', '1.4-b', '1.4-c'].map(id => makeMc(id, '1.4')),
  }
  return id => bank[id] || []
}

describe('domainQuestionExposure', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      storage: {
        _data: {},
        async getItem(k) { return this._data[k] ?? null },
        async setItem(k, v) { this._data[k] = v },
      },
    })
  })

  it('pickExposureTier classifies unseen, stale, and recent', () => {
    const now = Date.now()
    expect(pickExposureTier('q1', {})).toBe(EXPOSURE_TIERS.UNSEEN)
    expect(pickExposureTier('q2', { seenAt: now - STALE_DAYS_MS - 1, now })).toBe(EXPOSURE_TIERS.STALE)
    expect(pickExposureTier('q3', { seenAt: now - 1000, now })).toBe(EXPOSURE_TIERS.RECENT)
  })

  it('getExposureStats buckets ids and counts seen', () => {
    const now = Date.now()
    const seenById = {
      'a': now - 1000,
      'b': now - STALE_DAYS_MS - 1,
    }
    const stats = getExposureStats('fundamentals', ['a', 'b', 'c'], seenById)
    expect(stats.unseen).toEqual(['c'])
    expect(stats.stale).toEqual(['b'])
    expect(stats.recent).toEqual(['a'])
    expect(stats.seenCount).toBe(2)
  })

  it('recordSeen persists per-domain timestamps', async () => {
    await recordSeen('fundamentals', ['1.1-a', '1.2-b'])
    const store = await loadDomainQuestionExposure()
    expect(store.fundamentals['1.1-a']).toBeTypeOf('number')
    expect(store.fundamentals['1.2-b']).toBeTypeOf('number')
  })

  it('domainIdFromObjectiveId derives domain from objective prefix', () => {
    expect(domainIdFromObjectiveId('3.4')).toBe('connectivity')
  })
})

describe('buildDomainPassPool exposure tiers', () => {
  const getMc = buildGetMc()
  const allIds = mockDomain.objectives.flatMap(o => getMc(o.id).map(q => q.id))

  function exposureFromSeen(seenById) {
    return getExposureStats('fundamentals', allIds, seenById)
  }

  it('prioritizes unseen questions when exposure stats are provided', () => {
    const now = Date.now()
    const seenById = Object.fromEntries(allIds.slice(0, 8).map(id => [id, now - 1000]))
    const exposureStats = exposureFromSeen(seenById)

    const legacyPool = buildDomainPassPool({
      domain: mockDomain,
      getMcQuestions: getMc,
      shuffle: arr => [...arr],
      questionCount: 8,
      exposureStats: null,
    })
    const exposedPool = buildDomainPassPool({
      domain: mockDomain,
      getMcQuestions: getMc,
      shuffle: arr => [...arr],
      questionCount: 8,
      exposureStats,
    })

    const countUnseen = pool => pool.filter(q => !seenById[q.id]).length
    expect(countUnseen(exposedPool)).toBeGreaterThan(countUnseen(legacyPool))
    expect(countUnseen(exposedPool)).toBeGreaterThanOrEqual(3)
  })

  it('includes stale questions in the pool mix', () => {
    const now = Date.now()
    const seenById = Object.fromEntries(
      allIds.map(id => [id, now - STALE_DAYS_MS - 1000]),
    )
    seenById['1.1-a'] = now - 1000

    const pool = buildDomainPassPool({
      domain: mockDomain,
      getMcQuestions: getMc,
      shuffle: arr => [...arr],
      questionCount: 10,
      exposureStats: exposureFromSeen(seenById),
    })

    const stalePicked = pool.filter(q => seenById[q.id] && now - seenById[q.id] > STALE_DAYS_MS)
    expect(stalePicked.length).toBeGreaterThan(0)
  })

  it('caps at maxPerObjective per pass for full domain mode', () => {
    const pool = buildDomainPassPool({
      domain: mockDomain,
      getMcQuestions: getMc,
      shuffle: arr => [...arr],
      questionCount: 12,
      exposureStats: exposureFromSeen({}),
      maxPerObjective: 2,
    })

    const byObjective = {}
    for (const q of pool) {
      byObjective[q.objectiveId] = (byObjective[q.objectiveId] || 0) + 1
    }
    expect(Object.values(byObjective).every(count => count <= 2)).toBe(true)
  })

  it('does not apply objective cap in focus mode', () => {
    const pool = buildDomainPassPool({
      domain: mockDomain,
      getMcQuestions: getMc,
      shuffle: arr => [...arr],
      objectiveFilter: ['1.1'],
      questionCount: 6,
      exposureStats: exposureFromSeen({}),
      maxPerObjective: 2,
    })

    const fromOneOne = pool.filter(q => q.objectiveId === '1.1')
    expect(fromOneOne.length).toBe(3)
    expect(pool.length).toBe(3)
  })

  it('keeps carryover skipped ids first', () => {
    const pool = buildDomainPassPool({
      domain: mockDomain,
      getMcQuestions: getMc,
      shuffle: arr => [...arr],
      skippedQuestionIds: ['1.2-b'],
      questionCount: 4,
      exposureStats: exposureFromSeen({}),
    })
    expect(pool[0].id).toBe('1.2-b')
    expect(new Set(pool.map(q => q.id)).size).toBe(pool.length)
  })

  it('has no duplicate question ids in one pass', () => {
    const pool = buildDomainPassPool({
      domain: mockDomain,
      getMcQuestions: getMc,
      shuffle: arr => [...arr],
      questionCount: 10,
      weakObjectiveIds: ['1.1', '1.2'],
      exposureStats: exposureFromSeen({}),
    })
    const ids = pool.map(q => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
