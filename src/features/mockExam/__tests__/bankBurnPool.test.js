import { describe, it, expect } from 'vitest'
import {
  buildBankBurnPool,
  collectBankQuestions,
  collectMissRetryIds,
  computeBankCoverage,
  domainSimDurationSec,
} from '../bankBurnPool.js'
import { STALE_DAYS_MS } from '../../domainPass/domainQuestionExposure.js'

const NOW = Date.now()
const RECENT_TS = NOW - 60_000
const STALE_TS = NOW - STALE_DAYS_MS - 60_000

function mkQuestion(id, objectiveId) {
  return {
    id,
    objectiveId,
    question: `Stem ${id}`,
    choices: ['a', 'b', 'c', 'd'],
    correctIndex: 0,
  }
}

const DOMAIN_A = {
  id: 'net-fund',
  objectives: [{ id: '1.1' }, { id: '1.2' }],
}
const DOMAIN_B = {
  id: 'access',
  objectives: [{ id: '2.1' }],
}

const BANK = {
  '1.1': [mkQuestion('q1', '1.1'), mkQuestion('q2', '1.1')],
  '1.2': [mkQuestion('q3', '1.2'), mkQuestion('q4', '1.2')],
  '2.1': [mkQuestion('q5', '2.1'), mkQuestion('q6', '2.1')],
}
const getMc = (oid) => BANK[oid] || []

describe('collectBankQuestions', () => {
  it('tags questions with domainId and dedupes', () => {
    const qs = collectBankQuestions([DOMAIN_A, DOMAIN_B], getMc)
    expect(qs).toHaveLength(6)
    expect(qs.find(q => q.id === 'q5').domainId).toBe('access')
  })
})

describe('buildBankBurnPool ordering', () => {
  it('prefers unseen over stale over recent', () => {
    const exposureStore = {
      'net-fund': { q1: STALE_TS, q2: RECENT_TS },
    }
    const pool = buildBankBurnPool({
      domains: [DOMAIN_A],
      getMcQuestions: getMc,
      exposureStore,
      count: 4,
    })
    const ids = pool.map(q => q.id)
    // q3, q4 unseen first; q1 stale next; q2 recent last
    expect(ids.slice(0, 2).sort()).toEqual(['q3', 'q4'])
    expect(ids[2]).toBe('q1')
    expect(ids[3]).toBe('q2')
  })

  it('never recycles recent while unseen remain', () => {
    const exposureStore = { 'net-fund': { q1: RECENT_TS } }
    const pool = buildBankBurnPool({
      domains: [DOMAIN_A],
      getMcQuestions: getMc,
      exposureStore,
      count: 3,
    })
    expect(pool.map(q => q.id)).not.toContain('q1')
  })

  it('ranks recent misses above plain recent questions', () => {
    const exposureStore = {
      'net-fund': { q1: RECENT_TS, q2: RECENT_TS, q3: RECENT_TS, q4: RECENT_TS },
    }
    const missed = [{ id: 'q2', objectiveId: '1.1' }]
    const pool = buildBankBurnPool({
      domains: [DOMAIN_A],
      getMcQuestions: getMc,
      exposureStore,
      missed,
      count: 2,
    })
    expect(pool[0].id).toBe('q2')
  })

  it('missOnly builds queue from the missed bank only', () => {
    const missed = [
      { id: 'q1', objectiveId: '1.1' },
      { id: 'q5', objectiveId: '2.1' }, // outside domain A
    ]
    const pool = buildBankBurnPool({
      domains: [DOMAIN_A],
      getMcQuestions: getMc,
      exposureStore: {},
      missed,
      missOnly: true,
    })
    expect(pool.map(q => q.id)).toEqual(['q1'])
  })

  it('missOnly with no domain misses returns empty', () => {
    const pool = buildBankBurnPool({
      domains: [DOMAIN_B],
      getMcQuestions: getMc,
      exposureStore: {},
      missed: [{ id: 'q1', objectiveId: '1.1' }],
      missOnly: true,
    })
    expect(pool).toEqual([])
  })

  it('caps at count and at pool size', () => {
    const pool = buildBankBurnPool({
      domains: [DOMAIN_A, DOMAIN_B],
      getMcQuestions: getMc,
      exposureStore: {},
      count: 100,
    })
    expect(pool).toHaveLength(6)
  })
})

describe('collectMissRetryIds', () => {
  it('scopes to domain objectives, most recent first, deduped', () => {
    const missed = [
      { id: 'q1', objectiveId: '1.1' },
      { id: 'q5', objectiveId: '2.1' },
      { id: 'q3', objectiveId: '1.2' },
      { id: 'q1', objectiveId: '1.1' },
    ]
    expect(collectMissRetryIds(missed, [DOMAIN_A])).toEqual(['q1', 'q3'])
  })
})

describe('computeBankCoverage', () => {
  it('reports per-domain bank and seen counts', () => {
    const exposureStore = {
      'net-fund': { q1: RECENT_TS, q3: STALE_TS },
    }
    const coverage = computeBankCoverage([DOMAIN_A, DOMAIN_B], getMc, exposureStore)
    expect(coverage['net-fund']).toEqual({ bankCount: 4, seenCount: 2 })
    expect(coverage['access']).toEqual({ bankCount: 2, seenCount: 0 })
  })
})

describe('domainSimDurationSec', () => {
  it('allots 2 minutes per question', () => {
    expect(domainSimDurationSec(10)).toBe(1200)
  })
})
