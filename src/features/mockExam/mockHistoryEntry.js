import { DOMAINS } from '../../data/ccnaDomains.js'

/** Build a mock history entry with weak-domain and weak-objective metadata. */
export function buildMockHistoryEntry({ correct, total, questions, responses, byDomain }) {
  const pct = Math.round((correct / Math.max(total, 1)) * 100)
  const domainEntries = Object.entries(byDomain || {}).filter(([, v]) => v.total > 0)
  const weakest = domainEntries.length
    ? [...domainEntries].sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))[0]
    : null
  const wrongObjCounts = {}
  questions.forEach((q, idx) => {
    if (responses[idx] === q.correctIndex) return
    const oid = q.objectiveId
    if (oid) wrongObjCounts[oid] = (wrongObjCounts[oid] || 0) + 1
  })
  const weakObjectiveIds = Object.entries(wrongObjCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, 5)
  const weakDomainName = weakest ? (DOMAINS.find(d => d.id === weakest[0])?.name ?? weakest[0]) : null
  return {
    date: Date.now(),
    pct,
    correct,
    total,
    weakDomainId: weakest?.[0] ?? null,
    weakDomainName,
    weakObjectiveIds,
  }
}
