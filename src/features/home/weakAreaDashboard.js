import { DOMAINS, ALL_OBJECTIVES } from '../../data/ccnaDomains.js'
import { groupMissedByTrap } from '../../missed/missedTrapGroups.js'

/** Build actionable weak-area rows for the home dashboard. */
export function buildWeakAreaRows({ missed = [], readiness, domainPassRecords = {}, mockHistory = [] }) {
  const rows = []
  const seen = new Set()

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
