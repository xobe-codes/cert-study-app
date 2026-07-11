/**
 * Shared exposure-aware question picker (Spec 1).
 * Mix target: 60% unseen · 25% stale · 15% miss-retry.
 * Soft floor: if unseen ≥ UNSEEN_SOFT_FLOOR, at most 1 recent in the pool.
 */
import {
  EXPOSURE_TIERS,
  pickExposureTier,
} from './domainQuestionExposure.js'

export const EXPOSURE_MIX = { unseen: 0.6, stale: 0.25, missRetry: 0.15 }
export const UNSEEN_SOFT_FLOOR = 10

function qid(q) {
  return q?.id ?? q?.questionId
}

function asSet(ids) {
  if (ids instanceof Set) return ids
  return new Set(Array.isArray(ids) ? ids.filter(Boolean) : [])
}

/**
 * Bucket candidates by exposure tier (+ miss-retry among recent).
 * @returns {{ unseen: any[], stale: any[], missRetry: any[], recent: any[], unseenCount: number }}
 */
export function bucketByExposure(candidates, { seenById = {}, missRetryIds = [], now = Date.now() } = {}) {
  const missSet = asSet(missRetryIds)
  const unseen = []
  const stale = []
  const missRetry = []
  const recent = []
  for (const q of candidates || []) {
    const id = qid(q)
    if (id == null) continue
    const tier = pickExposureTier(id, { seenAt: seenById[id], now })
    if (tier === EXPOSURE_TIERS.UNSEEN) unseen.push(q)
    else if (tier === EXPOSURE_TIERS.STALE) stale.push(q)
    else if (missSet.has(id)) missRetry.push(q)
    else recent.push(q)
  }
  return { unseen, stale, missRetry, recent, unseenCount: unseen.length }
}

/**
 * Pick a session pool with the Spec 1 mix + soft floor.
 * Spillover order after targets: unseen → stale → miss-retry → recent.
 */
export function buildExposureAwarePool({
  candidates,
  seenById = {},
  missRetryIds = [],
  count,
  shuffle,
  now = Date.now(),
  softFloor = UNSEEN_SOFT_FLOOR,
} = {}) {
  const shuf = shuffle || (arr => [...arr])
  const list = Array.isArray(candidates) ? candidates : []
  const cap = Math.max(0, Math.min(count ?? list.length, list.length))
  if (!cap) return []

  const { unseen, stale, missRetry, recent, unseenCount } = bucketByExposure(list, {
    seenById,
    missRetryIds,
    now,
  })

  const targetUnseen = Math.round(cap * EXPOSURE_MIX.unseen)
  const targetStale = Math.round(cap * EXPOSURE_MIX.stale)
  const targetMiss = Math.max(0, cap - targetUnseen - targetStale)

  const maxRecent = unseenCount >= softFloor ? 1 : cap
  const used = new Set()
  const out = []

  function take(pool, n) {
    if (n <= 0) return
    for (const q of shuf(pool)) {
      if (out.length >= cap) return
      if (n <= 0) return
      const id = qid(q)
      if (id != null && used.has(id)) continue
      if (id != null) used.add(id)
      out.push(q)
      n -= 1
    }
  }

  take(unseen, targetUnseen)
  take(stale, targetStale)
  take(missRetry, targetMiss)

  // Spillover — prefer bank burn order; cap recent when soft floor applies
  let recentBudget = maxRecent
  const spill = [...unseen, ...stale, ...missRetry, ...recent]
  for (const q of shuf(spill)) {
    if (out.length >= cap) break
    const id = qid(q)
    if (id != null && used.has(id)) continue
    const isRecentPlain = recent.includes(q)
    if (isRecentPlain) {
      if (recentBudget <= 0) continue
      recentBudget -= 1
    }
    if (id != null) used.add(id)
    out.push(q)
  }

  return out.slice(0, cap)
}

/**
 * Coverage meter line: "Bank coverage 128/214 · 12 new this week"
 */
export function formatBankCoverageMeter({ bankCount, seenCount, newThisWeek = 0 }) {
  const bank = Math.max(0, Number(bankCount) || 0)
  const seen = Math.max(0, Math.min(bank, Number(seenCount) || 0))
  const neu = Math.max(0, Number(newThisWeek) || 0)
  return `Bank coverage ${seen}/${bank} · ${neu} new this week`
}

/** Count ids whose lastSeenAt falls within the last 7 days. */
export function countNewThisWeek(seenById = {}, now = Date.now()) {
  const weekMs = 7 * 24 * 60 * 60 * 1000
  let n = 0
  for (const ts of Object.values(seenById || {})) {
    if (typeof ts === 'number' && now - ts <= weekMs) n += 1
  }
  return n
}
