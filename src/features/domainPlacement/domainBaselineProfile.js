/** Per-objective + domain-level baseline from a placement attempt. */

export const BASELINE_STRONG_PCT = 80
export const BASELINE_WEAK_PCT = 65
export const DOMAIN_TEST_OUT_PCT = 80
export const DOMAIN_TEST_OUT_MAX_TRAP_MISSES = 2

export const BASELINE_STATUS = {
  STRONG: 'strong',
  WEAK: 'weak',
  BUILDING: 'building',
  NOT_CHECKED: 'not_checked',
}

export const BASELINE_STATUS_META = {
  strong: { label: 'Strong', symbol: '✓', accent: 'mint' },
  weak: { label: 'Weak', symbol: '!', accent: 'rose' },
  building: { label: 'Building', symbol: '◐', accent: 'amber' },
  not_checked: { label: 'Not checked', symbol: '○', accent: 'silver' },
}

/** Classify one objective from placement stats + trap miss on that CKU. */
export function classifyObjectiveBaseline({ stats, trapMissed = false }) {
  if (!stats?.total) return BASELINE_STATUS.NOT_CHECKED
  const pct = Math.round((stats.correct / stats.total) * 100)
  if (trapMissed || pct < BASELINE_WEAK_PCT) return BASELINE_STATUS.WEAK
  if (pct >= BASELINE_STRONG_PCT) return BASELINE_STATUS.STRONG
  return BASELINE_STATUS.BUILDING
}

export function buildObjectiveProfiles({ objectiveIds, byObjective, trapMissObjectiveIds = new Set() }) {
  const profiles = {}
  for (const id of objectiveIds) {
    const stats = byObjective?.[id]
    const trapMissed = trapMissObjectiveIds.has(id)
    const status = classifyObjectiveBaseline({ stats, trapMissed })
    profiles[id] = {
      status,
      pct: stats?.total ? Math.round((stats.correct / stats.total) * 100) : null,
      correct: stats?.correct || 0,
      total: stats?.total || 0,
      trapMissed,
    }
  }
  return profiles
}

/** Whole-domain status after a placement check. */
export function computeDomainBaselineStatus({ pct, trapMissCount = 0, hasAttempt = true }) {
  if (!hasAttempt) return 'not_started'
  if (pct >= DOMAIN_TEST_OUT_PCT && trapMissCount <= DOMAIN_TEST_OUT_MAX_TRAP_MISSES) {
    return 'tested_out'
  }
  if (pct >= BASELINE_WEAK_PCT) return 'building'
  return 'needs_work'
}

export function domainBaselineBand(domainStatus) {
  switch (domainStatus) {
    case 'tested_out':
      return { label: 'Tested out', accent: 'mint' }
    case 'building':
      return { label: 'Building', accent: 'amber' }
    case 'needs_work':
      return { label: 'Needs work', accent: 'rose' }
    default:
      return { label: 'Set baseline', accent: 'sky' }
  }
}

/** Full baseline summary for debrief + home domain panel. */
export function buildDomainBaselineSummary({ domain, lastAttempt }) {
  const objectiveIds = (domain?.objectives || []).map(o => o.id)
  if (!lastAttempt) {
    return {
      domainStatus: 'not_started',
      testedOut: false,
      pct: null,
      objectiveProfiles: {},
      strongObjectives: [],
      weakObjectives: [],
      buildingObjectives: [],
      notCheckedObjectives: objectiveIds,
      trapMissCount: 0,
    }
  }

  const trapMissObjectiveIds = new Set(
    (lastAttempt.trapMisses || []).map(t => t.objectiveId).filter(Boolean),
  )
  const objectiveProfiles = buildObjectiveProfiles({
    objectiveIds,
    byObjective: lastAttempt.byObjective,
    trapMissObjectiveIds,
  })

  const strongObjectives = []
  const weakObjectives = []
  const buildingObjectives = []
  const notCheckedObjectives = []

  for (const id of objectiveIds) {
    const status = objectiveProfiles[id]?.status
    if (status === BASELINE_STATUS.STRONG) strongObjectives.push(id)
    else if (status === BASELINE_STATUS.WEAK) weakObjectives.push(id)
    else if (status === BASELINE_STATUS.BUILDING) buildingObjectives.push(id)
    else notCheckedObjectives.push(id)
  }

  const trapMissCount = lastAttempt.trapMisses?.length ?? 0
  const domainStatus = computeDomainBaselineStatus({
    pct: lastAttempt.pct,
    trapMissCount,
    hasAttempt: true,
  })

  return {
    domainStatus,
    testedOut: domainStatus === 'tested_out',
    pct: lastAttempt.pct,
    objectiveProfiles,
    strongObjectives,
    weakObjectives,
    buildingObjectives,
    notCheckedObjectives,
    trapMissCount,
  }
}

export function countTestedOutDomains(records, domainIds) {
  if (!records || !domainIds?.length) return 0
  return domainIds.filter(id => records[id]?.lastAttempt?.testedOut).length
}
