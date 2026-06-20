/** Global search + ranking for Topic Focus / CCNA Term Hub. */

import { norm, scoreToken, bestScore } from '../search/textRank.js'

export { norm, scoreToken, bestScore }

/**
 * @param {import('./topicIndex.js').TopicIndex} index
 * @param {string} query
 * @param {{ domainFilter?: string, limit?: number }} opts
 */
export function searchTopicsGlobal(index, query, { domainFilter = 'all', limit = 40 } = {}) {
  const q = norm(query)
  if (!q) return { clusters: [], objectives: [], dictionary: [], concepts: [] }

  const inDomain = (objectiveId) => {
    if (domainFilter === 'all') return true
    const o = index.objectives.find(x => x.id === objectiveId)
    return o?.domainId === domainFilter
  }

  const clusters = (index.termRegistry || [])
    .map(term => {
      const score = Math.max(
        bestScore(q, term.term),
        ...(term.aliases || []).map(a => scoreToken(a, q)),
        ...(term.tags || []).map(t => scoreToken(t, q)),
        scoreToken(term.definition, q),
      )
      return score > 0 ? { type: 'cluster', score, term } : null
    })
    .filter(Boolean)
    .filter(x => !x.term.objectiveIds?.length || x.term.objectiveIds.some(inDomain))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)

  const dictionary = (index.dictionary || [])
    .map(entry => {
      const score = Math.max(
        bestScore(q, entry.term),
        ...(entry.aliases || []).map(a => scoreToken(a, q)),
        scoreToken(entry.definition, q),
      )
      return score > 0 && entry.objectiveIds.some(inDomain) ? { type: 'dictionary', score, entry } : null
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  const objectives = index.objectives
    .map(o => {
      const score = Math.max(bestScore(q, o.id), bestScore(q, o.title))
      return score > 0 && inDomain(o.id) ? { type: 'objective', score, objective: o } : null
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15)

  const concepts = index.concepts
    .map(c => {
      const score = Math.max(
        bestScore(q, c.label),
        scoreToken(c.searchText, q),
        ...(c.tags || []).map(t => scoreToken(t, q)),
        ...(c.aliases || []).map(a => scoreToken(a, q)),
      )
      return score > 0 && inDomain(c.objectiveId) ? { type: 'concept', score, concept: c } : null
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return { clusters, dictionary, objectives, concepts }
}

export function dictionaryEntriesForDomain(index, domainFilter = 'all') {
  let list = index.dictionary || []
  if (domainFilter !== 'all') {
    list = list.filter(e => e.objectiveIds.some(oid => {
      const o = index.objectives.find(x => x.id === oid)
      return o?.domainId === domainFilter
    }))
  }
  return [...list].sort((a, b) => a.term.localeCompare(b.term))
}
