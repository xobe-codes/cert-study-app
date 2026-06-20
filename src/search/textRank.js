/** Shared lexical ranking for Topic, Command, and Library search. */

export function norm(s) {
  return String(s || '').toLowerCase().trim()
}

export function scoreToken(text, query) {
  const t = norm(text)
  const q = norm(query)
  if (!q || !t) return 0
  if (t === q) return 100
  if (t.startsWith(q)) return 80
  if (t.includes(q)) return 50
  const words = q.split(/\s+/).filter(Boolean)
  if (words.length > 1 && words.every(w => t.includes(w))) return 45
  return 0
}

export function bestScore(query, ...fields) {
  return Math.max(0, ...fields.map(f => scoreToken(f, query)))
}

export function inDomain(objectiveIds, domainFilter, objectives) {
  if (domainFilter === 'all') return true
  return (objectiveIds || []).some(oid => {
    const o = objectives.find(x => x.id === oid)
    return o?.domainId === domainFilter
  })
}
