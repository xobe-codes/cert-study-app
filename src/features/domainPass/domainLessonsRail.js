/**
 * Spec 4 — Lessons rail sorted for domain workspace.
 */

function masteryScore(progressEntry) {
  if (!progressEntry) return 0
  if (typeof progressEntry.masteryScore === 'number') return progressEntry.masteryScore
  if (progressEntry.status === 'mastered') return 100
  if (progressEntry.status === 'in_progress') return 40
  return 0
}

/**
 * Sort domain objectives: baseline weak → low mastery → unseen bank (no lastSeen).
 * @returns {Array<{ objective, reason, hasLab }>}
 */
export function buildDomainLessonsRail({
  domain,
  progress = {},
  baselineSummary = null,
  labsByObjective = {},
} = {}) {
  const objs = domain?.objectives || []
  const weakSet = new Set(
    (baselineSummary?.weakObjectives || []).map(w => (typeof w === 'string' ? w : w?.id)).filter(Boolean),
  )

  const rows = objs.map(objective => {
    const entry = progress[objective.id]
    const unseen = !entry?.lastSeen && entry?.status !== 'mastered' && entry?.status !== 'in_progress'
    const weak = weakSet.has(objective.id)
    const score = masteryScore(entry)
    let reason = 'Study'
    if (weak) reason = 'Baseline weak'
    else if (unseen) reason = 'Unseen'
    else if (score < 70) reason = 'Low mastery'
    return {
      objective,
      reason,
      weak,
      unseen,
      masteryScore: score,
      hasLab: !!(labsByObjective[objective.id]?.length),
      labs: labsByObjective[objective.id] || [],
    }
  })

  rows.sort((a, b) => {
    if (a.weak !== b.weak) return a.weak ? -1 : 1
    if (a.masteryScore !== b.masteryScore) return a.masteryScore - b.masteryScore
    if (a.unseen !== b.unseen) return a.unseen ? -1 : 1
    return String(a.objective.id).localeCompare(String(b.objective.id))
  })

  return rows
}

/** Continue-lesson hint: last-opened objective in domain if any. */
export function pickContinueLesson(domain, progress = {}) {
  let best = null
  let bestTs = 0
  for (const o of domain?.objectives || []) {
    const ts = progress[o.id]?.lastSeen || 0
    if (ts > bestTs) {
      bestTs = ts
      best = o
    }
  }
  return best
}
