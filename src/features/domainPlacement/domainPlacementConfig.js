/** Domain placement — fixed blueprint per domain, comparable scores, delta debrief. */

import { isPlacementDomain, placementDomainIds } from './placementBlueprints.js'

export const PLACEMENT_QUESTION_COUNT = 15

/** Trap-only pulse after domain test-out. */
export const PLACEMENT_MAINTENANCE_TRAP_COUNT = 3

export const PLACEMENT_STALE_MS = 14 * 24 * 60 * 60 * 1000

export { isPlacementDomain, placementDomainIds }

export function placementReadyBand(pct) {
  if (pct >= 80) return { label: 'Strong', accent: 'mint' }
  if (pct >= 65) return { label: 'Building', accent: 'amber' }
  return { label: 'Needs work', accent: 'rose' }
}
