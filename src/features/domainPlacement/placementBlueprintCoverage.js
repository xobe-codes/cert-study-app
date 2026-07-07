import { DOMAINS } from '../../data/ccnaDomains.js'
import { PLACEMENT_QUESTION_COUNT } from './domainPlacementConfig.js'
import { getPlacementBlueprint, placementDomainIds } from './placementBlueprints.js'

/** Every domain objective must appear at least once in the baseline blueprint. */
export function auditPlacementBlueprintCoverage(domainId) {
  const domain = DOMAINS.find(d => d.id === domainId)
  const blueprint = getPlacementBlueprint(domainId)
  const errors = []

  if (!domain) errors.push('unknown domain')
  if (!blueprint) errors.push('missing blueprint')

  const objectiveIds = (domain?.objectives || []).map(o => o.id)
  const items = blueprint?.items || []
  const sampled = new Set(items.map(i => i.objectiveId))
  const missing = objectiveIds.filter(id => !sampled.has(id))

  if (items.length !== PLACEMENT_QUESTION_COUNT) {
    errors.push(`expected ${PLACEMENT_QUESTION_COUNT} items, got ${items.length}`)
  }
  if (missing.length) errors.push(`missing objectives: ${missing.join(', ')}`)

  const dupIds = []
  const seen = new Set()
  for (const item of items) {
    if (!item.id) errors.push('item missing id')
    else if (seen.has(item.id)) dupIds.push(item.id)
    else seen.add(item.id)
  }
  if (dupIds.length) errors.push(`duplicate stem ids: ${dupIds.join(', ')}`)

  return {
    ok: errors.length === 0 && missing.length === 0,
    domainId,
    objectiveCount: objectiveIds.length,
    sampledCount: sampled.size,
    missing,
    errors,
  }
}

export function validateAllPlacementBlueprintCoverage() {
  return placementDomainIds()
    .map(auditPlacementBlueprintCoverage)
    .filter(r => !r.ok)
}

export function baselineBlueprintIsStale(lastAttempt, domainId) {
  const blueprint = getPlacementBlueprint(domainId)
  if (!lastAttempt || !blueprint) return false
  return (lastAttempt.blueprintVersion || 1) < blueprint.version
}
