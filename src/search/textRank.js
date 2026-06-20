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

/** Score across full query and individual tokens — handles "AAA protocols" → AAA. */
export function scoreQuery(query, ...fields) {
  const q = norm(query)
  if (!q) return 0

  const full = bestScore(q, ...fields)
  const tokens = q.split(/\s+/).filter(w => w.length > 1)
  if (!tokens.length) return full

  let tokenSum = 0
  let matched = 0
  let maxToken = 0
  for (const tok of tokens) {
    const s = bestScore(tok, ...fields)
    maxToken = Math.max(maxToken, s)
    if (s > 0) {
      tokenSum += s
      matched += 1
    }
  }

  const perToken = matched ? tokenSum / matched : 0
  return Math.max(full, perToken, maxToken >= 80 ? maxToken : maxToken * 0.9)
}

export function hasTokenMatch(query, ...fields) {
  const q = norm(query)
  if (!q) return false
  if (bestScore(q, ...fields) > 0) return true
  return q.split(/\s+/).some(tok => tok.length > 1 && bestScore(tok, ...fields) >= 45)
}

export function inDomain(objectiveIds, domainFilter, objectives) {
  if (domainFilter === 'all') return true
  return (objectiveIds || []).some(oid => {
    const o = objectives.find(x => x.id === oid)
    return o?.domainId === domainFilter
  })
}
