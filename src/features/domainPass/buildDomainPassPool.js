import { DOMAIN_PASS_PASS_PCT, domainPassQuestionCount } from './domainPassConfig.js'

function dedupeById(questions) {
  const seen = new Set()
  const out = []
  for (const q of questions || []) {
    const id = q.id ?? q.questionId
    if (id != null) {
      if (seen.has(id)) continue
      seen.add(id)
    }
    out.push(q)
  }
  return out
}

function collectDomainQuestions(domain, getMcQuestions) {
  return (domain?.objectives || []).flatMap(o =>
    getMcQuestions(o.id).map(q => ({ ...q, objectiveId: q.objectiveId || o.id })),
  )
}

function responseForIndex(responses, idx) {
  if (responses == null) return undefined
  if (Array.isArray(responses)) return responses[idx]
  return responses[idx] ?? responses[String(idx)]
}

function isCorrectResponse(question, selected) {
  if (selected == null) return false
  return selected === question.correctIndex
}

/**
 * Build a blueprint-sized pool for one domain.
 * Adaptive retake: 60% from weak objectives, 40% from the rest when weakObjectiveIds is non-empty.
 */
export function buildDomainPassPool({
  domain,
  getMcQuestions,
  shuffle,
  weakObjectiveIds = [],
  missedQuestions = [],
}) {
  const count = domainPassQuestionCount(domain)
  const shuf = shuffle || (arr => [...arr])
  let pool = collectDomainQuestions(domain, getMcQuestions)

  if (missedQuestions?.length) {
    const objectiveIds = new Set((domain.objectives || []).map(o => o.id))
    const domainMissed = missedQuestions.filter(m => objectiveIds.has(m.objectiveId))
    pool = dedupeById([...pool, ...domainMissed])
  }

  pool = dedupeById(pool)
  const weakSet = new Set(weakObjectiveIds || [])

  if (weakSet.size === 0) {
    return shuf(pool).slice(0, Math.min(count, pool.length))
  }

  const weakPool = pool.filter(q => weakSet.has(q.objectiveId))
  const otherPool = pool.filter(q => !weakSet.has(q.objectiveId))
  const weakCount = Math.min(Math.round(count * 0.6), weakPool.length)
  const otherCount = Math.min(count - weakCount, otherPool.length)
  const picked = dedupeById([
    ...shuf(weakPool).slice(0, weakCount),
    ...shuf(otherPool).slice(0, otherCount),
  ])

  return shuf(picked).slice(0, Math.min(count, picked.length))
}

/** Objective ids where the user missed at least one question in the session. */
export function computeWeakObjectivesFromResponses(questions, responses, passPctThreshold = DOMAIN_PASS_PASS_PCT) {
  const stats = {}
  for (let idx = 0; idx < (questions || []).length; idx++) {
    const q = questions[idx]
    const oid = q?.objectiveId
    if (!oid) continue
    if (!stats[oid]) stats[oid] = { correct: 0, total: 0 }
    stats[oid].total += 1
    const selected = responseForIndex(responses, idx)
    if (selected != null && isCorrectResponse(q, selected)) stats[oid].correct += 1
  }

  return Object.entries(stats)
    .filter(([, { correct, total }]) => {
      if (correct < total) return true
      const pct = total > 0 ? (correct / total) * 100 : 0
      return pct < passPctThreshold
    })
    .map(([oid]) => oid)
}
