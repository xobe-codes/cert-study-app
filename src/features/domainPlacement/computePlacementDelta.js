/** Compare current placement attempt to the prior saved attempt. */
export function computePlacementDelta(current, previous) {
  if (!current || !previous) return null

  const daysSince = previous.at
    ? Math.max(0, Math.round((current.at - previous.at) / (24 * 60 * 60 * 1000)))
    : null

  const objectiveDeltas = []
  const allIds = new Set([
    ...Object.keys(current.byObjective || {}),
    ...Object.keys(previous.byObjective || {}),
  ])

  for (const id of allIds) {
    const cur = current.byObjective?.[id]
    const prev = previous.byObjective?.[id]
    if (!cur?.total && !prev?.total) continue
    const curPct = cur?.total ? Math.round((cur.correct / cur.total) * 100) : null
    const prevPct = prev?.total ? Math.round((prev.correct / prev.total) * 100) : null
    if (curPct == null || prevPct == null) continue
    objectiveDeltas.push({ objectiveId: id, curPct, prevPct, delta: curPct - prevPct })
  }

  objectiveDeltas.sort((a, b) => a.delta - b.delta)

  return {
    pctDelta: current.pct - previous.pct,
    trapPctDelta: current.trapPct != null && previous.trapPct != null
      ? current.trapPct - previous.trapPct
      : null,
    daysSince,
    improvedObjectives: objectiveDeltas.filter(d => d.delta > 0).slice(-2).reverse(),
    slippedObjectives: objectiveDeltas.filter(d => d.delta < 0).slice(0, 2),
  }
}
