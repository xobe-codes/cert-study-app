import { describe, it, expect } from 'vitest'
import { DOMAINS } from '../data/ccnaDomains.js'
import {
  classifyObjectiveBaseline,
  buildObjectiveProfiles,
  buildDomainBaselineSummary,
  computeDomainBaselineStatus,
  countTestedOutDomains,
  BASELINE_STATUS,
} from '../features/domainPlacement/domainBaselineProfile.js'

const security = DOMAINS.find(d => d.id === 'security')

describe('domainBaselineProfile', () => {
  it('classifies strong when >=80% and no trap miss', () => {
    expect(classifyObjectiveBaseline({ stats: { correct: 2, total: 2 }, trapMissed: false }))
      .toBe(BASELINE_STATUS.STRONG)
  })

  it('classifies weak when trap missed even at high pct', () => {
    expect(classifyObjectiveBaseline({ stats: { correct: 2, total: 2 }, trapMissed: true }))
      .toBe(BASELINE_STATUS.WEAK)
  })

  it('classifies weak below 65%', () => {
    expect(classifyObjectiveBaseline({ stats: { correct: 0, total: 2 }, trapMissed: false }))
      .toBe(BASELINE_STATUS.WEAK)
  })

  it('classifies building between thresholds', () => {
    expect(classifyObjectiveBaseline({ stats: { correct: 7, total: 10 }, trapMissed: false }))
      .toBe(BASELINE_STATUS.BUILDING)
  })

  it('marks domain tested out at 80%+ with few trap misses', () => {
    expect(computeDomainBaselineStatus({ pct: 84, trapMissCount: 1, hasAttempt: true }))
      .toBe('tested_out')
    expect(computeDomainBaselineStatus({ pct: 84, trapMissCount: 3, hasAttempt: true }))
      .toBe('building')
  })

  it('builds full domain summary with not-checked objectives', () => {
    const summary = buildDomainBaselineSummary({
      domain: security,
      lastAttempt: {
        pct: 73,
        byObjective: {
          '5.1': { correct: 2, total: 2 },
          '5.3': { correct: 0, total: 2 },
        },
        trapMisses: [{ objectiveId: '5.3', trap: 'ACL direction' }],
      },
    })
    expect(summary.strongObjectives).toContain('5.1')
    expect(summary.weakObjectives).toContain('5.3')
    expect(summary.notCheckedObjectives.length).toBeGreaterThan(0)
    expect(summary.testedOut).toBe(false)
  })

  it('counts tested-out domains from storage records', () => {
    const records = {
      security: { lastAttempt: { testedOut: true } },
      access: { lastAttempt: { testedOut: false } },
    }
    expect(countTestedOutDomains(records, ['security', 'access', 'fundamentals'])).toBe(1)
  })

  it('buildObjectiveProfiles covers every domain objective', () => {
    const ids = security.objectives.map(o => o.id)
    const profiles = buildObjectiveProfiles({
      objectiveIds: ids,
      byObjective: { '5.1': { correct: 1, total: 1 } },
      trapMissObjectiveIds: new Set(),
    })
    expect(Object.keys(profiles)).toHaveLength(ids.length)
    expect(profiles['5.1'].status).toBe(BASELINE_STATUS.STRONG)
    expect(profiles[ids.find(id => id !== '5.1')].status).toBe(BASELINE_STATUS.NOT_CHECKED)
  })
})
