import { PLACEMENT_QUESTION_COUNT } from './domainPlacementConfig.js'

/** Objective ids missed or below 80% on a prior placement attempt. */
export function computeWeakObjectivesFromPlacement(byObjective) {
  if (!byObjective || typeof byObjective !== 'object') return []
  return Object.entries(byObjective)
    .map(([id, stats]) => {
      const total = stats?.total || 0
      const correct = stats?.correct || 0
      const pct = total > 0 ? correct / total : 0
      return { id, pct, missed: correct < total }
    })
    .filter(o => o.missed || o.pct < 0.8)
    .sort((a, b) => a.pct - b.pct)
    .map(o => o.id)
}

/**
 * Reorder fixed blueprint items for adaptive retake — same 15 stems, weak objectives first.
 * ~60% from weak objectives, ~40% from the rest (Domain Pass parity).
 */
export function orderPlacementBlueprintItems(items, { weakObjectiveIds = [], shuffle } = {}) {
  const count = items?.length || PLACEMENT_QUESTION_COUNT
  const weakSet = new Set(weakObjectiveIds || [])
  if (!weakSet.size) return [...(items || [])]

  const shuf = shuffle || (arr => [...arr])
  const weakItems = items.filter(i => weakSet.has(i.objectiveId))
  const otherItems = items.filter(i => !weakSet.has(i.objectiveId))

  const weakCount = Math.min(Math.round(count * 0.6), weakItems.length)
  let otherCount = Math.min(count - weakCount, otherItems.length)

  const picked = []
  const used = new Set()

  for (const item of shuf(weakItems).slice(0, weakCount)) {
    picked.push(item)
    used.add(item.id)
  }
  for (const item of shuf(otherItems).slice(0, otherCount)) {
    picked.push(item)
    used.add(item.id)
  }

  for (const item of shuf(items)) {
    if (picked.length >= count) break
    if (used.has(item.id)) continue
    picked.push(item)
    used.add(item.id)
  }

  const weakFront = picked.filter(i => weakSet.has(i.objectiveId))
  const otherBack = picked.filter(i => !weakSet.has(i.objectiveId))
  return [...shuf(weakFront), ...shuf(otherBack)].slice(0, count)
}
