/**
 * WB-0 / WB-3 — Weak batch builder + next-beat handoff (compose-only spine).
 * Batch = ≤3 objective IDs; rank misses → trap debt → baseline weak → low mastery.
 */
import { DOMAINS } from '../../data/ccnaDomains.js'
import { buildStudyObjectiveHandoff } from '../../study/studyObjectiveHandoff.js'
import { isTrapOwned } from './trapOwnership.js'

export const WEAK_BATCH_SIZE = 3

function masteryScore(entry) {
  if (!entry) return 0
  if (typeof entry.masteryScore === 'number') return entry.masteryScore
  if (entry.status === 'mastered') return 100
  if (entry.status === 'in_progress') return 40
  return 0
}

function isFluent(entry) {
  if (!entry) return false
  if (entry.status === 'mastered') return true
  return masteryScore(entry) >= 85
}

/**
 * @returns {{
 *   domainId: string,
 *   objectiveIds: string[],
 *   batchIndex: number,
 *   batchCount: number,
 *   label: string,
 *   openTrapCount: number,
 *   reasons: Record<string, string>,
 * }}
 */
export function buildWeakBatch({
  domain,
  baselineSummary = null,
  missed = [],
  progress = {},
  rankedTraps = [],
  ownership = {},
  batchIndex = 0,
} = {}) {
  const domainId = domain?.id || null
  const objs = domain?.objectives || []
  if (!domainId || !objs.length) {
    return emptyBatch(domainId)
  }

  const objIdSet = new Set(objs.map(o => o.id))
  const weakSet = new Set(
    (baselineSummary?.weakObjectives || []).map(w => (typeof w === 'string' ? w : w?.id)).filter(Boolean),
  )
  const notCheckedSet = new Set(
    (baselineSummary?.notCheckedObjectives || []).map(w => (typeof w === 'string' ? w : w?.id)).filter(Boolean),
  )

  const missCountByObj = {}
  for (const m of missed || []) {
    const oid = m?.objectiveId
    if (!objIdSet.has(oid)) continue
    missCountByObj[oid] = (missCountByObj[oid] || 0) + 1
  }

  const trapDebtByObj = {}
  let openTrapCount = 0
  for (const t of rankedTraps || []) {
    const owned = t.owned ?? isTrapOwned(ownership, t.id)
    if (owned) continue
    openTrapCount += 1
    const oid = t.objectiveId
    if (oid && objIdSet.has(oid)) {
      trapDebtByObj[oid] = (trapDebtByObj[oid] || 0) + 1
    }
  }

  const ranked = objs.map(o => {
    const entry = progress[o.id]
    const fluent = isFluent(entry)
    const misses = missCountByObj[o.id] || 0
    const traps = trapDebtByObj[o.id] || 0
    const baselineWeak = weakSet.has(o.id)
    const notChecked = notCheckedSet.has(o.id)
    const mastery = masteryScore(entry)
    let score = 0
    const reasons = []
    if (fluent) {
      score = -1000
      reasons.push('fluent')
    } else {
      if (misses > 0) { score += misses * 10; reasons.push('misses') }
      if (traps > 0) { score += traps * 6; reasons.push('traps') }
      if (baselineWeak) { score += 8; reasons.push('baseline') }
      if (notChecked) { score += 3; reasons.push('unchecked') }
      if (mastery < 70) { score += Math.max(0, 70 - mastery) / 10; reasons.push('mastery') }
      if (score === 0 && (!entry || entry.status === 'unseen')) {
        score += 1
        reasons.push('unseen')
      }
    }
    return { id: o.id, score, reasons, fluent }
  })
    .filter(r => !r.fluent && r.score > 0)
    .sort((a, b) => b.score - a.score || String(a.id).localeCompare(String(b.id)))

  const allIds = ranked.map(r => r.id)
  const batchCount = Math.max(1, Math.ceil(allIds.length / WEAK_BATCH_SIZE) || 1)
  const safeIndex = Math.min(Math.max(0, batchIndex), Math.max(0, batchCount - 1))
  const start = safeIndex * WEAK_BATCH_SIZE
  const objectiveIds = allIds.slice(start, start + WEAK_BATCH_SIZE)
  const reasonMap = Object.fromEntries(ranked.map(r => [r.id, r.reasons[0] || 'study']))

  // Open traps that touch this batch (for beat resolution)
  const batchTrapCount = (rankedTraps || []).filter(t => {
    const owned = t.owned ?? isTrapOwned(ownership, t.id)
    if (owned) return false
    return !t.objectiveId || objectiveIds.includes(t.objectiveId)
  }).length

  return {
    domainId,
    objectiveIds,
    batchIndex: safeIndex,
    batchCount: allIds.length === 0 ? 0 : batchCount,
    totalWeak: allIds.length,
    label: formatBatchLabel(safeIndex, allIds.length === 0 ? 0 : batchCount, objectiveIds),
    openTrapCount: batchTrapCount || (objectiveIds.length ? openTrapCount : 0),
    reasons: reasonMap,
  }
}

function emptyBatch(domainId) {
  return {
    domainId,
    objectiveIds: [],
    batchIndex: 0,
    batchCount: 0,
    totalWeak: 0,
    label: 'No weak batch',
    openTrapCount: 0,
    reasons: {},
  }
}

export function formatBatchLabel(batchIndex, batchCount, objectiveIds = []) {
  if (!objectiveIds.length) return 'No weak batch'
  const ids = objectiveIds.join(', ')
  if (!batchCount || batchCount <= 1) return `Batch · ${ids}`
  return `Batch ${batchIndex + 1} of ${batchCount} · ${ids}`
}

/**
 * Resolve the single next beat for a domain workspace.
 * @returns {{ beat: string, label: string, objectiveId?: string|null, objectiveIds?: string[] }}
 */
export function resolveNextBeat({
  batch,
  hasBaseline = true,
  missCount = 0,
  passReady = false,
} = {}) {
  if (hasBaseline === false) {
    return { beat: 'baseline', label: 'Set baseline map', objectiveIds: [] }
  }
  if (missCount >= 3) {
    return {
      beat: 'fix_misses',
      label: `Fix misses (${missCount})`,
      objectiveIds: batch?.objectiveIds || [],
    }
  }
  const ids = batch?.objectiveIds || []
  if (!ids.length) {
    if (passReady) {
      return { beat: 'pass_full', label: 'Domain Pass — prove domain', objectiveIds: [] }
    }
    return { beat: 'practice', label: 'Practice domain', objectiveIds: [] }
  }
  if ((batch?.openTrapCount || 0) > 0 && ids.length) {
    // Prefer review first if reasons are mostly baseline/unseen; traps after prove.
    // Spec: Own traps before flood — but Review first if never opened.
    // Default order: review → prove → traps → flood. nextBeat is only the *current* step;
    // callers advance by completing actions. For first paint, start at review.
  }
  return {
    beat: 'review',
    label: `Study · ${ids[0]}`,
    objectiveId: ids[0],
    objectiveIds: ids,
  }
}

/**
 * Advance suggestion after a beat (UI can override with explicit buttons).
 */
export function suggestFollowingBeat(currentBeat, batch) {
  const ids = batch?.objectiveIds || []
  if (!ids.length) return { beat: 'practice', label: 'Practice domain', objectiveIds: [] }
  const openTraps = batch?.openTrapCount || 0
  switch (currentBeat) {
    case 'review':
      return { beat: 'prove', label: `Practice batch · ${ids.join(', ')}`, objectiveId: ids[0], objectiveIds: ids }
    case 'prove':
      if (openTraps > 0) {
        return { beat: 'traps', label: `Own traps (${openTraps})`, objectiveIds: ids }
      }
      return { beat: 'flood', label: `Pass Focus · ${ids.join(', ')}`, objectiveIds: ids }
    case 'traps':
      return { beat: 'flood', label: `Pass Focus · ${ids.join(', ')}`, objectiveIds: ids }
    case 'flood':
      return {
        beat: 'review',
        label: batch.batchIndex + 1 < batch.batchCount
          ? `Next batch (${batch.batchIndex + 2} of ${batch.batchCount})`
          : 'Batch clear — Domain Pass when ready',
        objectiveIds: ids,
      }
    default:
      return resolveNextBeat({ batch, hasBaseline: true })
  }
}

/**
 * Home / workspace glance: Now · Pulse · Aim
 */
export function buildProgressGlance({
  batch = null,
  nextBeat = null,
  stickyMissCount = 0,
  openTrapCount = 0,
  domainPassPassed = 0,
  domainPassTotal = 6,
  weakestDomainName = null,
} = {}) {
  const now = nextBeat?.label
    || (batch?.objectiveIds?.length ? batch.label : 'Pick a domain · set a batch')
  const pulseParts = []
  if (stickyMissCount > 0) pulseParts.push(`${stickyMissCount} sticky miss${stickyMissCount === 1 ? '' : 'es'}`)
  if (openTrapCount > 0) pulseParts.push(`${openTrapCount} open trap${openTrapCount === 1 ? '' : 's'}`)
  if (batch?.objectiveIds?.length) pulseParts.push(batch.label)
  const pulse = pulseParts.slice(0, 3).join(' · ') || 'No open debt — keep mapping'
  const aim = weakestDomainName
    ? `Pass ${domainPassPassed}/${domainPassTotal} · focus ${weakestDomainName}`
    : `Domain Pass ${domainPassPassed}/${domainPassTotal}`
  return { now, pulse, aim, batch, nextBeat }
}

/**
 * Run a beat via existing navigation handlers (WB-0 handoff).
 */
export function runWeakBatchBeat(beatInfo, handlers = {}) {
  const beat = beatInfo?.beat
  const ids = beatInfo?.objectiveIds || []
  const oid = beatInfo?.objectiveId || ids[0]
  switch (beat) {
    case 'baseline':
      handlers.onOpenDomainPlacement?.({ domainId: handlers.domainId, expandOnReturn: true })
      return
    case 'fix_misses':
      handlers.onOpenMockExam?.({ domainId: handlers.domainId, mode: 'bankburn', missOnly: true })
      return
    case 'review': {
      const handoff = buildStudyObjectiveHandoff(oid, { tab: 'Study' })
      if (handoff) handlers.onSelectObjective?.(handoff)
      return
    }
    case 'prove': {
      const handoff = buildStudyObjectiveHandoff(oid, { tab: 'Practice' })
      if (handoff) handlers.onSelectObjective?.({ ...handoff, __sessionSize: 5 })
      return
    }
    case 'traps':
      handlers.onOpenTrapDrill?.({
        domainId: handlers.domainId,
        objectiveId: oid,
      })
      return
    case 'flood':
      handlers.onOpenDomainPass?.({
        domainId: handlers.domainId,
        focusObjectiveIds: ids,
      })
      return
    case 'pass_full':
      handlers.onOpenDomainPass?.({ domainId: handlers.domainId })
      return
    default:
      handlers.practiceDomain?.()
  }
}

/** Pick first domain with weak signal for home Lessons / glance. */
export function pickActiveBatchDomain({
  openDomainId = null,
  placementRecords = {},
  missed = [],
  progress = {},
} = {}) {
  if (openDomainId) {
    const d = DOMAINS.find(x => x.id === openDomainId)
    if (d) return d
  }
  for (const domain of DOMAINS) {
    const last = placementRecords?.[domain.id]?.lastAttempt
    const weak = last?.objectiveProfiles
      ? Object.entries(last.objectiveProfiles).filter(([, p]) => p?.status === 'weak').map(([id]) => id)
      : []
    const missHit = (missed || []).some(m => domain.objectives.some(o => o.id === m?.objectiveId))
    if (weak.length || missHit) return domain
    const low = domain.objectives.some(o => {
      const e = progress[o.id]
      return e && e.status !== 'mastered' && masteryScore(e) < 70
    })
    if (low) return domain
  }
  return DOMAINS[0] || null
}
