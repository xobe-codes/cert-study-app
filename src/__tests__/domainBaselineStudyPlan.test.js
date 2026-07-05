import { describe, it, expect } from 'vitest'
import {
  getNextUncheckedBaselineDomain,
  collectBaselineWeakObjectives,
  pickBaselineAwareStudyNext,
  getSprintObjectiveIdsForDomain,
} from '../features/domainPlacement/domainBaselineStudyPlan.js'
import { DOMAINS } from '../data/ccnaDomains.js'

describe('domainBaselineStudyPlan', () => {
  it('finds next unchecked domain in blueprint order', () => {
    const records = { fundamentals: { lastAttempt: { at: 1, pct: 70 } } }
    const next = getNextUncheckedBaselineDomain(records)
    expect(next?.id).toBe('access')
  })

  it('collects weak objectives across domains', () => {
    const records = {
      security: { lastAttempt: { weakObjectives: ['5.3', '5.5'] } },
      access: { lastAttempt: { weakObjectives: ['2.1'] } },
    }
    expect(collectBaselineWeakObjectives(records)).toEqual(['2.1', '5.3', '5.5'])
  })

  it('prioritizes baseline setup in study next when incomplete', () => {
    const next = pickBaselineAwareStudyNext({ placementRecords: {}, dueCount: 0 })
    expect(next?.kind).toBe('baseline')
    expect(next?.domainId).toBe('fundamentals')
  })

  it('suggests weak objective study when baselines exist', () => {
    const records = Object.fromEntries(
      ['fundamentals', 'access', 'connectivity', 'services', 'security', 'automation'].map(id => [
        id,
        { lastAttempt: { at: 1, pct: 75, weakObjectives: id === 'security' ? ['5.3'] : [] } },
      ]),
    )
    const next = pickBaselineAwareStudyNext({ placementRecords: records, dueCount: 0 })
    expect(next?.kind).toBe('baselineWeak')
    expect(next?.objective?.id).toBe('5.3')
  })

  it('returns sprint targets excluding strong-only domains', () => {
    const domain = DOMAINS.find(d => d.id === 'security')
    const record = {
      lastAttempt: {
        pct: 72,
        byObjective: { '5.1': { correct: 2, total: 2 }, '5.3': { correct: 0, total: 2 } },
        trapMisses: [{ objectiveId: '5.3' }],
      },
    }
    const ids = getSprintObjectiveIdsForDomain(domain, record)
    expect(ids).toContain('5.3')
    expect(ids.length).toBeGreaterThan(1)
  })
})
