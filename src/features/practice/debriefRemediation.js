/**
 * Post-reveal remediation actions from trap family + domain context.
 */
import { WILDCARD_BRIDGE_DOMAIN_IDS } from './trapStreak.js'

const WILDCARD_TRAP_RE = /wildcard|access.?list|\bacl\b|ospf.*mask|subnet mask as wildcard|mask.*wildcard|wildcard.*mask/i

/**
 * @param {{ trapLabel?: string, domainId?: string, objectiveId?: string, ckuId?: string }} opts
 * @returns {{ kind: 'trapDrill'|'wildcard', label: string, prefill?: object }[]}
 */
export function familyRemediationActions({ trapLabel, domainId, objectiveId, ckuId } = {}) {
  const actions = []
  const trap = typeof trapLabel === 'string' ? trapLabel.trim() : ''
  const cku = typeof ckuId === 'string' ? ckuId.trim() : ''

  if (trap || cku) {
    actions.push({
      kind: 'trapDrill',
      label: 'Trap drill →',
      prefill: {
        ...(trap ? { trapLabel: trap } : {}),
        ...(cku ? { ckuId: cku } : {}),
        ...(objectiveId ? { objectiveId } : {}),
      },
    })
  }

  const domainBridge = WILDCARD_BRIDGE_DOMAIN_IDS.includes(domainId)
  const trapWantsWildcard = trap && WILDCARD_TRAP_RE.test(trap)
  if (trapWantsWildcard || (domainBridge && trap && /acl|ospf|mask|wildcard/i.test(trap))) {
    actions.push({
      kind: 'wildcard',
      label: 'Wildcard drill →',
      prefill: objectiveId ? { objectiveId } : undefined,
    })
  }

  return actions
}
