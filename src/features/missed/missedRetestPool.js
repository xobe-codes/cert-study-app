/**
 * Missed Retest — pure pool-building logic (mirrors bankBurnPool.js house style).
 * No React, no storage access: dedupe → optional trap-scope → order → cap.
 */
import { groupMissedByTrap } from '../../missed/missedTrapGroups.js'
import { shuffleArrayCopy } from '../../questionUtils.js'

/** Sibling to REVIEW_SESSION_CAP — "Clear queue" never shows more than this at once. */
export const MISSED_RETEST_CLEAR_CAP = 15
/** "Prove it" unlocks once the deduped missed bank shrinks to this size or smaller. */
export const MISSED_RETEST_PROVE_UNLOCK_MAX = 30

function questionId(m) {
  return m?.questionId ?? m?.id
}

function dayKey(ts) {
  const d = new Date(typeof ts === 'number' ? ts : 0)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

/** Shuffle within contiguous same-day runs of an addedAt-ascending-sorted list. */
function shuffleWithinDayTiers(sortedByAddedAt, shuf) {
  const tiers = []
  let lastKey = null
  for (const m of sortedByAddedAt) {
    const key = dayKey(m.addedAt)
    if (key !== lastKey || !tiers.length) {
      tiers.push([])
      lastKey = key
    }
    tiers[tiers.length - 1].push(m)
  }
  return tiers.flatMap(tier => shuf(tier))
}

/**
 * Dedupe missed-bank entries by questionId (fallback id), keeping the most
 * recent occurrence (higher addedAt wins). Entries with no id never collide.
 */
export function dedupeMissedByQuestionId(missed) {
  const byKey = new Map()
  const order = []
  let anonSeq = 0
  for (const m of missed || []) {
    if (!m) continue
    const id = questionId(m)
    const key = id != null ? `id:${id}` : `anon:${anonSeq++}`
    if (!byKey.has(key)) order.push(key)
    const existing = byKey.get(key)
    if (!existing || (m.addedAt || 0) >= (existing.addedAt || 0)) {
      byKey.set(key, m)
    }
  }
  return order.map(key => byKey.get(key))
}

/**
 * Build an ordered, capped pool for a retest session.
 * - dedupes first (dedupeMissedByQuestionId)
 * - optionally scopes to a single trap (trapFilter) via groupMissedByTrap
 * - orders oldest-missed-first (addedAt ascending), shuffled within same-day recency tiers
 * - caps to `count` (null/undefined = no cap — used by 'prove' mode's "all")
 *
 * `mode` is accepted for interface-contract parity with the spec; when `count`
 * is left undefined (not explicitly null) and mode === 'clear', it defaults to
 * MISSED_RETEST_CLEAR_CAP as a convenience. Passing count explicitly (including
 * null) always wins.
 */
export function buildMissedRetestPool({ missed, mode, trapFilter, count, shuffle } = {}) {
  const shuf = typeof shuffle === 'function' ? shuffle : shuffleArrayCopy
  const deduped = dedupeMissedByQuestionId(missed)
  if (!deduped.length) return []

  let pool = deduped
  if (trapFilter) {
    const groups = groupMissedByTrap(deduped)
    pool = groups.find(g => g.trap === trapFilter)?.items || []
  }
  if (!pool.length) return []

  const sorted = [...pool].sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0))
  const ordered = shuffleWithinDayTiers(sorted, shuf)

  const effectiveCount = count === undefined && mode === 'clear' ? MISSED_RETEST_CLEAR_CAP : count
  if (effectiveCount == null) return ordered
  const cap = Math.max(0, Number(effectiveCount) || 0)
  return ordered.slice(0, cap)
}
