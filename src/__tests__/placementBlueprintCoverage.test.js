import { describe, it, expect, beforeAll } from 'vitest'
import { preloadCleanBank } from '../data/cleanQuestionAdapter.js'
import { DOMAINS } from '../data/ccnaDomains.js'
import { buildPlacementPool } from '../features/domainPlacement/buildPlacementPool.js'
import { placementDomainIds } from '../features/domainPlacement/placementBlueprints.js'
import {
  auditPlacementBlueprintCoverage,
  validateAllPlacementBlueprintCoverage,
} from '../features/domainPlacement/placementBlueprintCoverage.js'
import { buildDomainBaselineSummary } from '../features/domainPlacement/domainBaselineProfile.js'
import { computePlacementReport } from '../features/domainPlacement/computePlacementReport.js'

beforeAll(async () => {
  await preloadCleanBank()
})

describe('placementBlueprintCoverage', () => {
  it('every domain blueprint samples all objectives', () => {
    expect(validateAllPlacementBlueprintCoverage()).toEqual([])
    for (const domainId of placementDomainIds()) {
      const audit = auditPlacementBlueprintCoverage(domainId)
      expect(audit.ok, `${domainId}: ${audit.errors.join('; ')}`).toBe(true)
      expect(audit.missing).toEqual([])
      const domain = DOMAINS.find(d => d.id === domainId)
      expect(audit.sampledCount).toBe(domain.objectives.length)
    }
  })

  it('baseline pool leaves no not_checked after a perfect first attempt', () => {
    for (const domain of DOMAINS.filter(d => placementDomainIds().includes(d.id))) {
      const pool = buildPlacementPool(domain.id)
      const responses = {}
      pool.questions.forEach((q, idx) => { responses[idx] = q.correctIndex })
      const report = computePlacementReport({
        questions: pool.questions,
        responses,
        trapByQuestionId: pool.trapByQuestionId,
      })
      const summary = buildDomainBaselineSummary({
        domain,
        lastAttempt: {
          ...report,
          at: Date.now(),
          trapMisses: report.trapMisses,
          byObjective: report.byObjective,
        },
      })
      expect(summary.notCheckedObjectives, domain.id).toEqual([])
    }
  })

  it('detects stale v1 baselines needing remap', async () => {
    const { getStaleBaselineDomains, getNextStaleBaselineDomain } = await import('../features/domainPlacement/placementBlueprintCoverage.js')
    const records = {
      fundamentals: { lastAttempt: { blueprintVersion: 1, pct: 80 } },
      services: { lastAttempt: { blueprintVersion: 1, pct: 75 } },
      security: { lastAttempt: { blueprintVersion: 1, pct: 82 } },
    }
    const stale = getStaleBaselineDomains(records)
    expect(stale.map(d => d.id)).toEqual(['fundamentals', 'services'])
    expect(getNextStaleBaselineDomain(records)?.id).toBe('fundamentals')
  })
})
