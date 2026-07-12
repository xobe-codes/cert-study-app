/**
 * WB-7 — seed Weak Batch / Study handoff from Fix Next, Missed, Mock debrief.
 */
import { DOMAINS } from '../../data/ccnaDomains.js'
import { buildStudyObjectiveHandoff } from '../../study/studyObjectiveHandoff.js'
import { buildWeakBatch } from '../domainPass/weakBatch.js'
import { buildDomainBaselineSummary } from '../domainPlacement/domainBaselineProfile.js'

export function domainForObjectiveId(objectiveId) {
  return DOMAINS.find(d => d.objectives.some(o => o.id === objectiveId)) || null
}

/**
 * Open Study on batch #1 for an objective's domain (or the objective itself).
 */
export function handoffStudyFromWeakSignal(objectiveId, {
  missed = [],
  placementRecords = {},
  progress = {},
  fluencyStore = null,
  onSelectObjective,
  onOpenDomain,
} = {}) {
  const domain = domainForObjectiveId(objectiveId)
  if (!domain) {
    const handoff = buildStudyObjectiveHandoff(objectiveId, { tab: 'Study' })
    if (handoff) onSelectObjective?.(handoff)
    return
  }
  const baselineSummary = buildDomainBaselineSummary({
    domain,
    lastAttempt: placementRecords?.[domain.id]?.lastAttempt,
  })
  const batch = buildWeakBatch({
    domain,
    baselineSummary,
    missed,
    progress,
    fluencyStore,
  })
  const prefer = batch.objectiveIds.includes(objectiveId)
    ? objectiveId
    : (batch.objectiveIds[0] || objectiveId)
  const handoff = buildStudyObjectiveHandoff(prefer, { tab: 'Study' })
  if (handoff) onSelectObjective?.(handoff)
  else onOpenDomain?.(domain.id)
}

/**
 * Pass Focus flood for a domain's current weak batch.
 */
export function handoffPassFocusBatch(domainId, {
  missed = [],
  placementRecords = {},
  progress = {},
  fluencyStore = null,
  onOpenDomainPass,
} = {}) {
  const domain = DOMAINS.find(d => d.id === domainId)
  if (!domain || !onOpenDomainPass) return
  const baselineSummary = buildDomainBaselineSummary({
    domain,
    lastAttempt: placementRecords?.[domain.id]?.lastAttempt,
  })
  const batch = buildWeakBatch({ domain, baselineSummary, missed, progress, fluencyStore })
  if (batch.objectiveIds.length) {
    onOpenDomainPass({ domainId, focusObjectiveIds: batch.objectiveIds })
  } else {
    onOpenDomainPass({ domainId })
  }
}
