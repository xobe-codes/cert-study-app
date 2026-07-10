/**
 * Session trap-family streak — count wrong answers by trap label (preferred) or CKU.
 * Used in Practice to surface a remediation CTA after ≥2 misses in the same family.
 */

export const TRAP_STREAK_THRESHOLD = 2

/** Stable family key for a miss. Prefers trap label; falls back to CKU. */
export function trapFamilyKey({ trapLabel, ckuId } = {}) {
  const trap = typeof trapLabel === 'string' ? trapLabel.trim() : ''
  if (trap) return `trap:${trap}`
  const cku = typeof ckuId === 'string' ? ckuId.trim() : ''
  if (cku) return `cku:${cku}`
  return null
}

export function createTrapStreakState() {
  return { counts: Object.create(null) }
}

/** Count for a family in the current session state. */
export function getTrapStreakCount(state, miss = {}) {
  const key = trapFamilyKey(miss)
  if (!key || !state?.counts) return 0
  return state.counts[key] || 0
}

/**
 * Record a wrong answer against its trap family.
 * Returns updated state plus whether the streak CTA should show (≥ threshold).
 */
export function recordTrapMiss(state, miss = {}, { threshold = TRAP_STREAK_THRESHOLD } = {}) {
  const key = trapFamilyKey(miss)
  const base = state?.counts ? state : createTrapStreakState()
  if (!key) {
    return {
      state: base,
      key: null,
      count: 0,
      shouldPrompt: false,
      trapLabel: miss.trapLabel || null,
      ckuId: miss.ckuId || null,
    }
  }
  const count = (base.counts[key] || 0) + 1
  const next = { counts: { ...base.counts, [key]: count } }
  return {
    state: next,
    key,
    count,
    shouldPrompt: count >= threshold,
    trapLabel: miss.trapLabel || null,
    ckuId: miss.ckuId || null,
  }
}

export function shouldShowTrapStreakCta(state, miss = {}, threshold = TRAP_STREAK_THRESHOLD) {
  return getTrapStreakCount(state, miss) >= threshold
}

/** Domains where Subnetting Wildcard practice is a useful remediation bridge. */
export const WILDCARD_BRIDGE_DOMAIN_IDS = Object.freeze(['connectivity', 'security'])

export function shouldShowWildcardBridge(domainId, onOpenSubnet) {
  return Boolean(onOpenSubnet) && WILDCARD_BRIDGE_DOMAIN_IDS.includes(domainId)
}
