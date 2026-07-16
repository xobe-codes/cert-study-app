import { useMemo } from 'react'
import { DOMAINS } from '../../data/ccnaDomains.js'

export function useObjectiveSiblings(objective) {
  return useMemo(() => {
    const domain = DOMAINS.find(d => d.id === objective.domainId)
    const siblings = domain
      ? domain.objectives.map(o => ({ ...o, domainId: domain.id, domainName: domain.name, accent: domain.accent }))
      : []
    const sibIdx = siblings.findIndex(o => o.id === objective.id)
    return {
      siblings,
      prevObj: sibIdx > 0 ? siblings[sibIdx - 1] : null,
      nextObj: sibIdx < siblings.length - 1 ? siblings[sibIdx + 1] : null,
    }
  }, [objective.domainId, objective.id])
}

export function useObjectiveToolItems(objectiveId, _commandDrills) {
  return useMemo(() => {
    const items = []
    // CLI Drill demoted: Practice mixes type:cli skill Qs; Hub + hash deep-link still work.
    if (objectiveId === '1.6') {
      items.push({ id: 'Subnetting', label: 'Subnetting', icon: '🧮' })
      items.push({ id: 'VLSM', label: 'VLSM', icon: '🧮' })
    }
    if (objectiveId === '1.8') items.push({ id: 'IPv6 Calc', label: 'IPv6 Calc', icon: '🔢' })
    if (objectiveId === '5.5' || objectiveId === '5.6') items.push({ id: 'ACL Calc', label: 'ACL Calc', icon: '🔒' })
    return items
  }, [objectiveId])
}
