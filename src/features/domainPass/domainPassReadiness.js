import { isPlacementDomain } from '../domainPlacement/placementBlueprints.js'

/**
 * One-line suggested next action for a Domain Pass hub card.
 * Priority: baseline gate → weak-topic study → unseen bank → prove → maintain.
 */
export function suggestDomainPassNextAction({
  domainId,
  status = 'not_started',
  hasBaseline = false,
  weakCount = 0,
  unseenCount = 0,
}) {
  if (isPlacementDomain(domainId) && !hasBaseline) return 'Set baseline first'
  if (status === 'retake' && weakCount > 0) return `Study ${weakCount} weak topic${weakCount === 1 ? '' : 's'}, then retake`
  if (status === 'retake') return 'Pulse traps, then retake'
  if (status === 'passed' && unseenCount > 0) return `Burn bank — ${unseenCount} unseen`
  if (status === 'passed') return 'Maintain — pulse traps'
  if (unseenCount > 0) return `Burn bank — ${unseenCount} unseen`
  return 'Take the pass'
}
