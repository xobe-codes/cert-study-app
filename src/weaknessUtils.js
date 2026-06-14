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

export function computeTrapWeakness(missed = []) {
  const counts = {}
  for (const m of missed) {
    const traps = m.answerReview?.incorrect
      ?.filter(i => i.choiceIndex === m.selectedIndex && i.misconceptionTested)
      ?.map(i => i.misconceptionTested) || []
    for (const t of traps) {
      counts[t] = (counts[t] || 0) + 1
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([trap, count]) => ({ trap, count }))
}
