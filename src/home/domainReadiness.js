import { domainPassStatus } from '../features/domainPass/domainPassConfig.js'
import { isPlacementDomain } from '../features/domainPlacement/placementBlueprints.js'

/**
 * Compact domain readiness recipe for home accordion open panel.
 * e.g. "Baseline · Pass · Labs 2/5"
 */
export function buildDomainReadinessLine({
  domainId,
  placementRecord,
  passRecord,
  labDone = 0,
  labTotal = 0,
} = {}) {
  const hasPlacement = isPlacementDomain(domainId)
  const hasBaseline = Boolean(placementRecord?.lastAttempt)
  const baseline = !hasPlacement ? '—' : hasBaseline ? 'Baseline' : 'No baseline'

  const status = domainPassStatus(passRecord)
  const pass = status === 'passed' ? 'Pass' : status === 'retake' ? 'Retake' : 'No pass'

  const safeDone = Math.max(0, Number(labDone) || 0)
  const safeTotal = Math.max(0, Number(labTotal) || 0)
  const labs = `Labs ${Math.min(safeDone, safeTotal)}/${safeTotal}`

  return `${baseline} · ${pass} · ${labs}`
}
