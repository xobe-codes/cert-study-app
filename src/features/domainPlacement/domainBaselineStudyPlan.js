import { DOMAINS } from '../../data/ccnaDomains.js'
import { ALL_OBJECTIVES } from '../../data/ccnaDomains.js'
import { placementDomainIds } from './placementBlueprints.js'
import { buildDomainBaselineSummary } from './domainBaselineProfile.js'
import { getNextStaleBaselineDomain } from './placementBlueprintCoverage.js'

/** First placement-enabled domain without a baseline attempt. */
export function getNextUncheckedBaselineDomain(records = {}) {
  for (const domainId of placementDomainIds()) {
    if (!records[domainId]?.lastAttempt) {
      return DOMAINS.find(d => d.id === domainId) || null
    }
  }
  return null
}

/** All weak objective ids across baselined domains (deduped, domain order). */
export function collectBaselineWeakObjectives(records = {}) {
  const ids = []
  const seen = new Set()
  for (const domainId of placementDomainIds()) {
    const weak = records[domainId]?.lastAttempt?.weakObjectives || []
    for (const id of weak) {
      if (seen.has(id)) continue
      seen.add(id)
      ids.push(id)
    }
  }
  return ids
}

/** Sprint pool targets: weak + any still-unchecked (e.g. pre-v2 baselines); strong subsections skipped. */
export function getSprintObjectiveIdsForDomain(domain, record) {
  if (!domain || !record?.lastAttempt) return []
  const summary = buildDomainBaselineSummary({ domain, lastAttempt: record.lastAttempt })
  return [...summary.weakObjectives, ...summary.notCheckedObjectives]
}

export function resolveBaselineObjective(objectiveId) {
  return ALL_OBJECTIVES.find(o => o.id === objectiveId) || null
}

/**
 * Study-next priority when baselines incomplete or weak areas exist.
 * Returns null to fall through to generic pickStudyNext.
 */
export function pickBaselineAwareStudyNext({ placementRecords = {}, dueCount = 0 }) {
  if (dueCount > 0) return null

  const nextDomain = getNextUncheckedBaselineDomain(placementRecords)
  if (nextDomain) {
    return {
      kind: 'baseline',
      accent: 'sky',
      shortTitle: `Set baseline — ${nextDomain.name} (~15 min)`,
      domainId: nextDomain.id,
    }
  }

  const staleDomain = getNextStaleBaselineDomain(placementRecords)
  if (staleDomain) {
    return {
      kind: 'baselineRemap',
      accent: 'amber',
      shortTitle: `Full remap — ${staleDomain.name} (every subsection)`,
      domainId: staleDomain.id,
    }
  }

  const weakIds = collectBaselineWeakObjectives(placementRecords)
  if (weakIds.length) {
    const obj = resolveBaselineObjective(weakIds[0])
    if (obj) {
      return {
        kind: 'baselineWeak',
        accent: 'rose',
        shortTitle: `Baseline focus — ${obj.id} ${obj.title}`,
        objective: obj,
        tab: 'Explain',
      }
    }
  }

  return null
}
