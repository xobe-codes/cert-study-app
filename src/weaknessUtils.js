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

/** Resolve a weak-CKU row tap into study or trap-drill action. */
export function resolveCkuWeakAction(id, missed = []) {
  if (id.startsWith('CKU-')) {
    return { kind: 'trapDrill', payload: { ckuId: id } }
  }
  if (id.startsWith('concept:')) {
    const concept = id.slice('concept:'.length)
    const missedItem = missed.find(m => m.concept === concept)
    if (missedItem?.objectiveId) {
      return { kind: 'study', payload: { objectiveId: missedItem.objectiveId } }
    }
    return { kind: 'trapDrill', payload: { trapLabel: missedItem?.misconceptionTested || concept } }
  }
  return { kind: 'trapDrill', payload: { ckuId: id } }
}
