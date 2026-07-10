import { DOMAINS, ALL_OBJECTIVES } from '../../data/ccnaDomains.js'
import { groupMissedByTrap } from '../../missed/missedTrapGroups.js'
import { placementDomainIds } from '../domainPlacement/placementBlueprints.js'
import { shouldSuggestPlacement } from '../domainPlacement/domainPlacementStorage.js'
import { getStaleBaselineDomains } from '../domainPlacement/placementBlueprintCoverage.js'
import { domainNumberLabel } from '../domainPlacement/domainLearningCopy.js'

export const FIX_NEXT_CATEGORIES = {
  traps: 'Traps',
  domains: 'Domains',
  baseline: 'Baseline & placement',
  mock: 'Mock',
}

const CTA = {
  practice: 'Practice →',
  trapDrill: 'Trap drill →',
  domainPass: 'Domain pass →',
  checkLevel: 'Check level →',
  remapBaseline: 'Remap baseline →',
  mock: 'Mock →',
  interview: 'Interview →',
}

const KIND_PRIORITY = { remap: 0, checkLevel: 1, domainPass: 2, practice: 3 }

function weakObjectiveLabel(domain, objectiveIds) {
  const dn = domainNumberLabel(domain)
  const ids = objectiveIds.slice(0, 3)
  const suffix = objectiveIds.length > 3 ? '…' : ''
  return `${dn} · Weak: ${ids.join(', ')}${suffix}`
}

function pickBetterDomainCandidate(a, b, domain) {
  const pa = KIND_PRIORITY[a.kind] ?? 99
  const pb = KIND_PRIORITY[b.kind] ?? 99
  if (pa !== pb) return pa < pb ? a : b
  if (a.kind === 'practice' && b.kind === 'practice') {
    const idsA = a.objectiveIds || [a.payload?.objectiveId].filter(Boolean)
    const idsB = b.objectiveIds || [b.payload?.objectiveId].filter(Boolean)
    const combined = [...new Set([...idsA, ...idsB])]
    return {
      ...a,
      hasBaselineWeak: a.hasBaselineWeak || b.hasBaselineWeak,
      hasDomainPassWeak: a.hasDomainPassWeak || b.hasDomainPassWeak,
      objectiveIds: combined,
      label: weakObjectiveLabel(domain, combined),
      payload: { objectiveId: combined[0] },
      category: (a.hasBaselineWeak || b.hasBaselineWeak) ? 'baseline' : 'domains',
      why: a.why || b.why,
    }
  }
  return a
}

function tierForDomainRow(row) {
  if (row.kind === 'remap' || row.kind === 'checkLevel' || row.hasBaselineWeak) return 1
  if (row.hasDomainPassWeak || row.kind === 'practice') return 2
  if (row.kind === 'domainPass') return 4
  return 2
}

function buildTrapRows(missed) {
  return groupMissedByTrap(missed).slice(0, 2).map(g => ({
    id: `trap:${g.trap}`,
    category: 'traps',
    label: g.trap,
    badge: `${g.count}×`,
    why: g.count > 1 ? `${g.count} missed on this trap` : undefined,
    cta: CTA.trapDrill,
    action: 'trapDrill',
    payload: { trapLabel: g.trap, objectiveId: g.items[0]?.objectiveId },
  }))
}

function collectMergedDomainRows(placementRecords, domainPassRecords, readiness) {
  const domainMap = new Map()

  function addCandidate(domainId, candidate) {
    if (!domainMap.has(domainId)) domainMap.set(domainId, [])
    domainMap.get(domainId).push({ ...candidate, domainId })
  }

  for (const domain of getStaleBaselineDomains(placementRecords)) {
    addCandidate(domain.id, {
      kind: 'remap',
      category: 'baseline',
      label: `${domainNumberLabel(domain)} · Blueprint outdated`,
      why: 'Full remap samples every subsection',
      cta: CTA.remapBaseline,
      action: 'domainPlacement',
      payload: { domainId: domain.id, expandOnReturn: true },
      id: `remap:${domain.id}`,
    })
  }

  for (const domain of DOMAINS) {
    const weakObjs = placementRecords[domain.id]?.lastAttempt?.weakObjectives || []
    if (!weakObjs.length) continue
    addCandidate(domain.id, {
      kind: 'practice',
      category: 'baseline',
      hasBaselineWeak: true,
      objectiveIds: weakObjs,
      label: weakObjectiveLabel(domain, weakObjs),
      why: 'Baseline gaps',
      cta: CTA.practice,
      action: 'study',
      payload: { objectiveId: weakObjs[0] },
      id: `baseline:${domain.id}`,
    })
  }

  for (const domainId of placementDomainIds()) {
    const record = placementRecords[domainId]
    if (!shouldSuggestPlacement(record)) continue
    const domain = DOMAINS.find(d => d.id === domainId)
    const last = record?.lastAttempt
    addCandidate(domainId, {
      kind: 'checkLevel',
      category: 'baseline',
      label: last
        ? `${domainNumberLabel(domain)} · Placement ${last.pct}%`
        : `${domainNumberLabel(domain)} · No baseline yet`,
      why: last ? 'Recheck your level' : 'Establish placement baseline',
      cta: CTA.checkLevel,
      action: 'domainPlacement',
      payload: { domainId },
      id: `placement:${domainId}`,
    })
  }

  const passRecords = domainPassRecords && typeof domainPassRecords === 'object' ? domainPassRecords : {}
  for (const domain of DOMAINS) {
    const weakObjs = passRecords[domain.id]?.weakObjectives || []
    if (!weakObjs.length) continue
    addCandidate(domain.id, {
      kind: 'practice',
      category: 'domains',
      hasDomainPassWeak: true,
      objectiveIds: weakObjs,
      label: weakObjectiveLabel(domain, weakObjs),
      why: `${weakObjs.length} weak in domain pass`,
      cta: CTA.practice,
      action: 'study',
      payload: { objectiveId: weakObjs[0] },
      id: `domainpass:${domain.id}`,
    })
  }

  const domainStats = readiness?.domainStats || []
  for (const stat of domainStats) {
    if (stat.avg >= 0.85) continue
    const domain = DOMAINS.find(d => d.id === stat.id)
    addCandidate(stat.id, {
      kind: 'domainPass',
      category: 'domains',
      label: `${domainNumberLabel(domain)} · ${Math.round(stat.avg * 100)}% mastery`,
      why: 'Below exam-ready threshold',
      cta: CTA.domainPass,
      action: 'domainPass',
      payload: { domainId: stat.id },
      id: `readiness:${stat.id}`,
    })
  }

  const merged = []
  for (const [domainId, candidates] of domainMap) {
    const domain = DOMAINS.find(d => d.id === domainId)
    let winner = candidates[0]
    for (const c of candidates.slice(1)) {
      winner = pickBetterDomainCandidate(winner, c, domain)
    }
    merged.push(winner)
  }
  return merged
}

function buildMockRows(mockHistory, readiness) {
  const rows = []
  if (!mockHistory?.length) return rows

  const last = mockHistory[mockHistory.length - 1]
  if (last.pct >= 70) return rows

  const domainStats = readiness?.domainStats || []
  const domainId = last.weakDomainId
    || (domainStats.length ? [...domainStats].sort((a, b) => a.avg - b.avg)[0]?.id : null)

  if (domainId) {
    const domain = DOMAINS.find(d => d.id === domainId)
    const objHint = last.weakObjectiveIds?.[0]
    rows.push({
      id: `mock:${domainId}`,
      category: 'mock',
      label: objHint
        ? `Last mock ${last.pct}% · ${objHint}`
        : `Last mock ${last.pct}% · ${domainNumberLabel(domain) || domainId}`,
      why: 'Below 70% passing threshold',
      badge: `${last.pct}%`,
      cta: objHint ? CTA.practice : CTA.mock,
      action: objHint ? 'study' : 'mock',
      payload: objHint ? { objectiveId: objHint } : { domainId },
    })
  }

  if (last.weakObjectiveIds?.length) {
    rows.push({
      id: 'mockinterview:last',
      category: 'mock',
      label: `Verbal warm-up · ${last.weakObjectiveIds.slice(0, 2).join(', ')}`,
      why: 'Mock weak spots',
      cta: CTA.interview,
      action: 'mockInterview',
      payload: { objectiveIds: last.weakObjectiveIds },
    })
  }

  return rows
}

/** Build actionable Fix Next rows for the home dashboard. */
export function buildWeakAreaRows(
  { missed = [], readiness, domainPassRecords = {}, mockHistory = [], placementRecords = {} } = {},
  { limit } = {},
) {
  const traps = buildTrapRows(missed)
  const domainRows = collectMergedDomainRows(placementRecords, domainPassRecords, readiness)
  const mockRows = buildMockRows(mockHistory, readiness)

  const p1 = domainRows.filter(r => tierForDomainRow(r) === 1).slice(0, 1)
  const p2 = domainRows.filter(r => tierForDomainRow(r) === 2).slice(0, 1)
  const p3 = mockRows.slice(0, 1)
  const usedDomains = new Set([...p1, ...p2].map(r => r.domainId))
  const p4 = domainRows
    .filter(r => tierForDomainRow(r) === 4 && !usedDomains.has(r.domainId))
    .slice(0, 1)

  const all = [...traps, ...p1, ...p2, ...p3, ...p4, ...mockRows.slice(1)]

  if (limit != null) return all.slice(0, limit)
  return all
}

export function resolveWeakAreaStudyObjective(objectiveId) {
  return ALL_OBJECTIVES.find(o => o.id === objectiveId) || null
}
