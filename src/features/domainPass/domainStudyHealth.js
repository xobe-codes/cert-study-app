/**
 * Spec 8 — local-first domain study health (coverage + recycle signal).
 */
import {
  getDomainSeenMap,
  getExposureStats,
  STALE_DAYS_MS,
} from './domainQuestionExposure.js'
import { countNewThisWeek } from './buildExposureAwarePool.js'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

/**
 * @returns {{
 *   coveragePct: number,
 *   seenCount: number,
 *   bankCount: number,
 *   newThisWeek: number,
 *   repeatRate7d: number,
 *   topRecycledIds: string[],
 * }}
 */
export function buildDomainStudyHealth({
  domainId,
  allQuestionIds = [],
  exposureStore = {},
  now = Date.now(),
} = {}) {
  const ids = Array.isArray(allQuestionIds) ? allQuestionIds.filter(Boolean) : []
  const seenById = getDomainSeenMap(exposureStore, domainId)
  const stats = getExposureStats(domainId, ids, seenById)
  const bankCount = ids.length
  const seenCount = stats.seenCount
  const coveragePct = bankCount ? Math.round((seenCount / bankCount) * 100) : 0
  const newThisWeek = countNewThisWeek(seenById, now)

  // Soft repeat signal: RECENT tier share of seen (recently re-touched).
  const recent = stats.recent?.length || 0
  const repeatRate7d = seenCount ? Math.round((recent / seenCount) * 100) : 0

  // Top recycled ≈ most recently seen (proxy without multi-hit ledger).
  const topRecycledIds = Object.entries(seenById)
    .filter(([, ts]) => typeof ts === 'number' && now - ts <= WEEK_MS)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id)

  return {
    coveragePct,
    seenCount,
    bankCount,
    newThisWeek,
    repeatRate7d,
    topRecycledIds,
    staleDays: STALE_DAYS_MS / DAY_MS,
  }
}

const DAY_MS = 24 * 60 * 60 * 1000

export function formatStudyHealthStrip(health) {
  if (!health) return ''
  const top = (health.topRecycledIds || []).slice(0, 3).join(', ') || '—'
  return `Coverage ${health.coveragePct}% · repeat ${health.repeatRate7d}% · top recycled: ${top}`
}
