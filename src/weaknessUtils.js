import { groupMissedByTrap } from './missed/missedTrapGroups.js'

/** Local weakness aggregation by CKU and exam-trap tags — no API. */

export function computeCkuWeakness(missed = []) {
  const counts = {}
  for (const m of missed) {
    const ids = m.ckuIds?.length ? m.ckuIds : (m.concept ? [`concept:${m.concept}`] : [])
    for (const id of ids) {
      counts[id] = (counts[id] || 0) + 1
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({ id, count }))
}

/** Same trap labels as Home/Focus missed review (groupMissedByTrap). */
export function computeTrapWeakness(missed = []) {
  return groupMissedByTrap(missed).map(({ trap, count }) => ({ trap, count }))
}
