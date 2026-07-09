import { DOMAIN_PASS_PASS_PCT, domainPassQuestionCount, domainPassFocusQuestionCount } from './domainPassConfig.js'
import { isMcQuestion } from '../../questionUtils.js'

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

function findMcById(domain, getMcQuestions, questionId) {
  if (!questionId) return null
  for (const obj of domain?.objectives || []) {
    const found = getMcQuestions(obj.id).find(q => q.id === questionId)
    if (found && isMcQuestion(found)) {
      return { ...found, objectiveId: found.objectiveId || obj.id }
    }
  }
  return null
}

/** Resolve missed/partial entries to full MC stems from the curated bank. */
export function hydrateMcQuestion(entry, domain, getMcQuestions) {
  if (!entry) return null
  if (isMcQuestion(entry)) return { ...entry, objectiveId: entry.objectiveId }
  const questionId = entry.id ?? entry.questionId
  const hydrated = findMcById(domain, getMcQuestions, questionId)
  if (!hydrated) return null
  return { ...hydrated, objectiveId: entry.objectiveId || hydrated.objectiveId }
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
  objectiveFilter = null,
  questionCount = null,
}) {
  const shuf = shuffle || (arr => [...arr])
  const domainObjectiveIds = new Set((domain.objectives || []).map(o => o.id))
  const filterSet = Array.isArray(objectiveFilter) && objectiveFilter.length
    ? new Set(objectiveFilter.filter(id => domainObjectiveIds.has(id)))
    : null

  let pool = collectDomainQuestions(domain, getMcQuestions).filter(isMcQuestion)
  if (filterSet?.size) {
    pool = pool.filter(q => filterSet.has(q.objectiveId))
  }

  const count = questionCount ?? (
    filterSet?.size
      ? domainPassFocusQuestionCount(filterSet.size, pool.length)
      : domainPassQuestionCount(domain)
  )

  if (missedQuestions?.length) {
    const domainMissed = missedQuestions
      .filter(m => domainObjectiveIds.has(m.objectiveId) && (!filterSet || filterSet.has(m.objectiveId)))
      .map(m => hydrateMcQuestion(m, domain, getMcQuestions))
      .filter(Boolean)
    pool = dedupeById([...pool, ...domainMissed]).filter(isMcQuestion)
  } else {
    pool = dedupeById(pool).filter(isMcQuestion)
  }

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
  ]).filter(isMcQuestion)

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
