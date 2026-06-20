/** Global search + ranking for Command Hub. */

function norm(s) {
  return String(s || '').toLowerCase().trim()
}

function scoreToken(text, query) {
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

function bestScore(query, ...fields) {
  return Math.max(0, ...fields.map(f => scoreToken(f, query)))
}

function inDomain(objectiveIds, domainFilter, objectives) {
  if (domainFilter === 'all') return true
  return objectiveIds.some(oid => {
    const o = objectives.find(x => x.id === oid)
    return o?.domainId === domainFilter
  })
}

/**
 * @param {import('./commandIndex.js').ReturnType<typeof import('./commandIndex.js').buildCommandIndex>} index
 */
export function searchCommandsGlobal(index, query, {
  domainFilter = 'all',
  categoryFilter = 'all',
  deviceFilter = 'all',
  limit = 40,
} = {}) {
  const q = norm(query)
  if (!q) return { clusters: [], commands: [], workflows: [] }

  const tagClusters = new Map()
  for (const cmd of index.commands) {
    if (!inDomain(cmd.objectiveIds, domainFilter, index.objectives)) continue
    if (categoryFilter !== 'all' && cmd.category !== categoryFilter) continue
    if (deviceFilter !== 'all' && cmd.device !== deviceFilter && cmd.device !== 'any') continue
    const score = Math.max(
      bestScore(q, cmd.command),
      ...(cmd.aliases || []).map(a => scoreToken(a, q)),
      scoreToken(cmd.searchText, q),
      ...(cmd.tags || []).map(t => scoreToken(t, q)),
    )
    if (score <= 0) continue
    for (const tag of cmd.tags || ['general']) {
      const prev = tagClusters.get(tag) || { tag, score: 0, commandIds: [] }
      prev.score = Math.max(prev.score, score)
      if (!prev.commandIds.includes(cmd.id)) prev.commandIds.push(cmd.id)
      tagClusters.set(tag, prev)
    }
  }

  const clusters = [...tagClusters.values()]
    .filter(c => c.score >= 45 && c.commandIds.length >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(c => ({
      type: 'cluster',
      tag: c.tag,
      score: c.score,
      commandIds: c.commandIds.slice(0, 12),
    }))

  const commands = index.commands
    .map(cmd => {
      const score = Math.max(
        bestScore(q, cmd.command),
        ...(cmd.aliases || []).map(a => scoreToken(a, q)),
        scoreToken(cmd.searchText, q),
      )
      if (score <= 0) return null
      if (!inDomain(cmd.objectiveIds, domainFilter, index.objectives)) return null
      if (categoryFilter !== 'all' && cmd.category !== categoryFilter) return null
      if (deviceFilter !== 'all' && cmd.device !== deviceFilter && cmd.device !== 'any') return null
      return { type: 'command', score, command: cmd }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  const workflows = (index.workflows || [])
    .map(wf => {
      const score = Math.max(
        bestScore(q, wf.title),
        bestScore(q, wf.description),
        ...(wf.tags || []).map(t => scoreToken(t, q)),
        ...(wf.steps || []).map(s => scoreToken(s.commandText, q)),
      )
      if (score <= 0) return null
      if (!wf.objectiveIds.some(oid => inDomain([oid], domainFilter, index.objectives))) return null
      return { type: 'workflow', score, workflow: wf }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)

  return { clusters, commands, workflows }
}

export function filterCommands(index, {
  domainFilter = 'all',
  categoryFilter = 'all',
  deviceFilter = 'all',
  tagFilter = null,
  sort = 'alpha',
} = {}) {
  let list = index.commands.filter(cmd => {
    if (!inDomain(cmd.objectiveIds, domainFilter, index.objectives)) return false
    if (categoryFilter !== 'all' && cmd.category !== categoryFilter) return false
    if (deviceFilter !== 'all' && cmd.device !== deviceFilter && cmd.device !== 'any') return false
    if (tagFilter && !(cmd.tags || []).includes(tagFilter)) return false
    return true
  })

  if (sort === 'alpha') list = [...list].sort((a, b) => a.command.localeCompare(b.command))
  else if (sort === 'category') list = [...list].sort((a, b) => a.category.localeCompare(b.category) || a.command.localeCompare(b.command))
  else if (sort === 'mode') list = [...list].sort((a, b) => a.mode.localeCompare(b.mode) || a.command.localeCompare(b.command))

  return list
}
