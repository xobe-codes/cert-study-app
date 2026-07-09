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
 * Question ids with no answer in this session (Next without answer, finish early, timer expiry).
 */
export function computeSkippedQuestionIds(questions, responses) {
  const ids = []
  for (let idx = 0; idx < (questions || []).length; idx++) {
    const q = questions[idx]
    const id = q?.id ?? q?.questionId
    if (id == null) continue
    if (responseForIndex(responses, idx) == null) ids.push(id)
  }
  return ids
}

/**
 * Merge prior carryover with this session: drop answered ids, append new skips, dedupe (prev order first).
 */
export function mergeCarryoverSkipped(prevIds = [], questions, responses) {
  const answeredIds = new Set()
  for (let idx = 0; idx < (questions || []).length; idx++) {
    const q = questions[idx]
    const id = q?.id ?? q?.questionId
    if (id == null) continue
    if (responseForIndex(responses, idx) != null) answeredIds.add(id)
  }

  const merged = []
  const seen = new Set()
  for (const id of prevIds || []) {
    if (answeredIds.has(id)) continue
    if (seen.has(id)) continue
    seen.add(id)
    merged.push(id)
  }
  for (const id of computeSkippedQuestionIds(questions, responses)) {
    if (seen.has(id)) continue
    seen.add(id)
    merged.push(id)
  }
  return merged
}

/**
 * Build a blueprint-sized pool for one domain.
 * Adaptive retake: 60% from weak objectives, 40% from the rest when weakObjectiveIds is non-empty.
 * Carryover skips from prior passes are reserved first in the pool.
 */
export function buildDomainPassPool({
  domain,
  getMcQuestions,
  shuffle,
  weakObjectiveIds = [],
  missedQuestions = [],
  skippedQuestionIds = [],
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

  const carryoverQuestions = dedupeById(
    (skippedQuestionIds || [])
      .map(id => findMcById(domain, getMcQuestions, id))
      .filter(Boolean)
      .filter(q => !filterSet || filterSet.has(q.objectiveId)),
  ).filter(isMcQuestion)

  const carryoverIds = new Set(carryoverQuestions.map(q => q.id ?? q.questionId))
  const poolExcludingCarryover = pool.filter(q => !carryoverIds.has(q.id ?? q.questionId))

  const carryoverSlice = carryoverQuestions.slice(0, count)
  const remaining = Math.max(0, count - carryoverSlice.length)

  if (remaining === 0) {
    return carryoverSlice
  }

  const weakSet = new Set(weakObjectiveIds || [])

  if (weakSet.size === 0) {
    return [
      ...carryoverSlice,
      ...shuf(poolExcludingCarryover).slice(0, Math.min(remaining, poolExcludingCarryover.length)),
    ]
  }

  const weakPool = poolExcludingCarryover.filter(q => weakSet.has(q.objectiveId))
  const otherPool = poolExcludingCarryover.filter(q => !weakSet.has(q.objectiveId))
  const weakCount = Math.min(Math.round(remaining * 0.6), weakPool.length)
  const otherCount = Math.min(remaining - weakCount, otherPool.length)
  const picked = dedupeById([
    ...shuf(weakPool).slice(0, weakCount),
    ...shuf(otherPool).slice(0, otherCount),
  ]).filter(isMcQuestion)

  return [
    ...carryoverSlice,
    ...shuf(picked).slice(0, Math.min(remaining, picked.length)),
  ]
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
