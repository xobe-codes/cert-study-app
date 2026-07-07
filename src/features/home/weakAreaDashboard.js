import { DOMAINS, ALL_OBJECTIVES } from '../../data/ccnaDomains.js'
import { groupMissedByTrap } from '../../missed/missedTrapGroups.js'
import { placementDomainIds } from '../domainPlacement/placementBlueprints.js'
import { shouldSuggestPlacement } from '../domainPlacement/domainPlacementStorage.js'
import { getStaleBaselineDomains } from '../domainPlacement/placementBlueprintCoverage.js'

/** Build actionable weak-area rows for the home dashboard. */
export function buildWeakAreaRows({ missed = [], readiness, domainPassRecords = {}, mockHistory = [], placementRecords = {} }) {
  const rows = []
  const seen = new Set()

  for (const domain of getStaleBaselineDomains(placementRecords)) {
    const key = `remap:${domain.id}`
    if (seen.has(key)) continue
    seen.add(key)
    rows.push({
      id: key,
      label: `${domain.name} — full remap (every subsection now sampled)`,
      badge: '↻',
      cta: 'Full remap',
      action: 'domainPlacement',
      payload: { domainId: domain.id, expandOnReturn: true },
    })
    if (rows.length >= 2) break
  }

  for (const domain of DOMAINS) {
    const weakObjs = placementRecords[domain.id]?.lastAttempt?.weakObjectives || []
    if (!weakObjs.length) continue
    const key = `baseline:${domain.id}:${weakObjs[0]}`
    if (seen.has(key)) continue
    seen.add(key)
    rows.push({
      id: key,
      label: `${domain.name} baseline — focus ${weakObjs.slice(0, 2).join(', ')}${weakObjs.length > 2 ? '…' : ''}`,
      badge: '!',
      cta: 'Study',
      action: 'study',
      payload: { objectiveId: weakObjs[0] },
    })
    if (rows.length >= 2) break
  }

  const trapGroups = groupMissedByTrap(missed).slice(0, 2)
  for (const g of trapGroups) {
    const key = `trap:${g.trap}`
    if (seen.has(key)) continue
    seen.add(key)
    rows.push({
      id: key,
      label: g.trap,
      badge: `${g.count}×`,
      cta: 'Trap drill',
      action: 'trapDrill',
      payload: { trapLabel: g.trap, objectiveId: g.items[0]?.objectiveId },
    })
  }

  for (const domainId of placementDomainIds()) {
    const record = placementRecords[domainId]
    if (!shouldSuggestPlacement(record)) continue
    const key = `placement:${domainId}`
    if (seen.has(key)) continue
    seen.add(key)
    const domain = DOMAINS.find(d => d.id === domainId)
    const last = record?.lastAttempt
    rows.push({
      id: key,
      label: last
        ? `${domain?.name || domainId} placement ${last.pct}% — recheck your level`
        : `${domain?.name || domainId} — establish placement baseline`,
      cta: 'Check level',
      action: 'domainPlacement',
      payload: { domainId },
    })
    break
  }

  const domainStats = readiness?.domainStats || []
  if (domainStats.length) {
    const weakest = [...domainStats].sort((a, b) => a.avg - b.avg)[0]
    if (weakest && weakest.avg < 0.85) {
      const key = `readiness:${weakest.id}`
      if (!seen.has(key)) {
        seen.add(key)
        rows.push({
          id: key,
          label: `${weakest.name} — ${Math.round(weakest.avg * 100)}% mastery`,
          cta: 'Domain pass',
          action: 'domainPass',
          payload: { domainId: weakest.id },
        })
      }
    }
  }

  const records = domainPassRecords && typeof domainPassRecords === 'object' ? domainPassRecords : {}
  for (const domain of DOMAINS) {
    const weakObjs = records[domain.id]?.weakObjectives || []
    if (!weakObjs.length) continue
    const key = `domainpass:${domain.id}`
    if (seen.has(key)) continue
    seen.add(key)
    rows.push({
      id: key,
      label: `${domain.name}: ${weakObjs.length} weak objective${weakObjs.length === 1 ? '' : 's'}`,
      cta: 'Open Study',
      action: 'study',
      payload: { objectiveId: weakObjs[0] },
    })
    break
  }

  if (mockHistory?.length) {
    const last = mockHistory[mockHistory.length - 1]
    if (last.pct < 70) {
      const domainId = last.weakDomainId
        || (domainStats.length ? [...domainStats].sort((a, b) => a.avg - b.avg)[0]?.id : null)
      if (domainId) {
        const domain = DOMAINS.find(d => d.id === domainId)
        const key = `mock:${domainId}`
        if (!seen.has(key)) {
          seen.add(key)
          const objHint = last.weakObjectiveIds?.[0]
          rows.push({
            id: key,
            label: objHint
              ? `Last mock ${last.pct}% — review ${objHint}`
              : `Last mock ${last.pct}% — focus ${domain?.name || domainId}`,
            cta: objHint ? 'Open Study' : 'Mock',
            action: objHint ? 'study' : 'mock',
            payload: objHint ? { objectiveId: objHint } : { domainId },
          })
        }
      }
      if (last.weakObjectiveIds?.length) {
        const key = 'mockinterview:last'
        if (!seen.has(key)) {
          seen.add(key)
          rows.push({
            id: key,
            label: `Verbal warm-up — mock weak spots (${last.weakObjectiveIds.slice(0, 2).join(', ')})`,
            cta: 'Interview',
            action: 'mockInterview',
            payload: { objectiveIds: last.weakObjectiveIds },
          })
        }
      }
    }
  }

  return rows.slice(0, 5)
}

export function resolveWeakAreaStudyObjective(objectiveId) {
  return ALL_OBJECTIVES.find(o => o.id === objectiveId) || null
}
