import { DOMAIN_PASS_PASS_PCT, domainPassQuestionCount, domainPassFocusQuestionCount } from './domainPassConfig.js'
import { isMcQuestion } from '../../questionUtils.js'
import { EXPOSURE_TIERS } from './domainQuestionExposure.js'

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

function questionId(q) {
  return q?.id ?? q?.questionId
}

function collectDomainQuestions(domain, getMcQuestions) {
  return (domain?.objectives || []).flatMap(o =>
    getMcQuestions(o.id).map(q => ({ ...q, objectiveId: q.objectiveId || o.id })),
  )
}

/** All MC question ids in a domain bank (deduped). */
export function collectDomainQuestionIds(domain, getMcQuestions) {
  const seen = new Set()
  const ids = []
  for (const q of collectDomainQuestions(domain, getMcQuestions)) {
    if (!isMcQuestion(q)) continue
    const id = questionId(q)
    if (id == null || seen.has(id)) continue
    seen.add(id)
    ids.push(id)
  }
  return ids
}

function findMcById(domain, getMcQuestions, qid) {
  if (!qid) return null
  for (const obj of domain?.objectives || []) {
    const found = getMcQuestions(obj.id).find(q => q.id === qid)
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
  const qid = entry.id ?? entry.questionId
  const hydrated = findMcById(domain, getMcQuestions, qid)
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
    const id = questionId(q)
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
    const id = questionId(q)
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

function tierForQuestion(q, exposureStats) {
  const id = questionId(q)
  if (!exposureStats || id == null) return EXPOSURE_TIERS.UNSEEN
  if (exposureStats.unseen?.includes(id)) return EXPOSURE_TIERS.UNSEEN
  if (exposureStats.stale?.includes(id)) return EXPOSURE_TIERS.STALE
  return EXPOSURE_TIERS.RECENT
}

function pickWithSpread({
  candidates,
  count,
  shuf,
  usedIds,
  objectiveCounts,
  maxPerObjective,
}) {
  if (count <= 0 || !candidates?.length) return []
  const picked = []
  for (const q of shuf(candidates)) {
    if (picked.length >= count) break
    const id = questionId(q)
    if (id != null && usedIds.has(id)) continue
    const oid = q.objectiveId
    if (maxPerObjective != null && oid && (objectiveCounts[oid] || 0) >= maxPerObjective) continue
    picked.push(q)
    if (id != null) usedIds.add(id)
    if (oid) objectiveCounts[oid] = (objectiveCounts[oid] || 0) + 1
  }
  return picked
}

function fillLegacyRemainder({
  remaining,
  poolExcludingCarryover,
  weakSet,
  shuf,
  usedIds,
  objectiveCounts,
  maxPerObjective,
}) {
  const available = poolExcludingCarryover.filter(q => {
    const id = questionId(q)
    return id == null || !usedIds.has(id)
  })

  if (weakSet.size === 0) {
    return pickWithSpread({
      candidates: available,
      count: remaining,
      shuf,
      usedIds,
      objectiveCounts,
      maxPerObjective,
    })
  }

  const weakPool = available.filter(q => weakSet.has(q.objectiveId))
  const otherPool = available.filter(q => !weakSet.has(q.objectiveId))
  const weakCount = Math.min(Math.round(remaining * 0.6), weakPool.length)
  const otherCount = Math.min(remaining - weakCount, otherPool.length)
  return [
    ...pickWithSpread({
      candidates: weakPool,
      count: weakCount,
      shuf,
      usedIds,
      objectiveCounts,
      maxPerObjective,
    }),
    ...pickWithSpread({
      candidates: otherPool,
      count: otherCount,
      shuf,
      usedIds,
      objectiveCounts,
      maxPerObjective,
    }),
  ]
}

function fillExposureRemainder({
  remaining,
  poolExcludingCarryover,
  exposureStats,
  weakSet,
  shuf,
  usedIds,
  objectiveCounts,
  maxPerObjective,
}) {
  const available = poolExcludingCarryover.filter(q => {
    const id = questionId(q)
    return id == null || !usedIds.has(id)
  })

  const unseenPool = available.filter(q => tierForQuestion(q, exposureStats) === EXPOSURE_TIERS.UNSEEN)
  const stalePool = available.filter(q => tierForQuestion(q, exposureStats) === EXPOSURE_TIERS.STALE)
  const recentPool = available.filter(q => tierForQuestion(q, exposureStats) === EXPOSURE_TIERS.RECENT)

  const targetUnseen = Math.round(remaining * 0.6)
  const targetStale = Math.round(remaining * 0.3)
  const targetWeak = Math.max(0, remaining - targetUnseen - targetStale)

  const picked = []

  picked.push(...pickWithSpread({
    candidates: unseenPool,
    count: targetUnseen,
    shuf,
    usedIds,
    objectiveCounts,
    maxPerObjective,
  }))

  picked.push(...pickWithSpread({
    candidates: stalePool,
    count: targetStale,
    shuf,
    usedIds,
    objectiveCounts,
    maxPerObjective,
  }))

  const stillNeed = Math.max(0, remaining - picked.length)
  const weakBudget = Math.min(targetWeak, stillNeed)

  if (weakBudget > 0 && weakSet.size > 0) {
    const weakCandidates = available.filter(q => {
      const id = questionId(q)
      return weakSet.has(q.objectiveId) && (id == null || !usedIds.has(id))
    })
    const otherCandidates = available.filter(q => {
      const id = questionId(q)
      return !weakSet.has(q.objectiveId) && (id == null || !usedIds.has(id))
    })
    const weakCount = Math.min(Math.round(weakBudget * 0.6), weakCandidates.length)
    const otherCount = Math.min(weakBudget - weakCount, otherCandidates.length)

    picked.push(...pickWithSpread({
      candidates: weakCandidates,
      count: weakCount,
      shuf,
      usedIds,
      objectiveCounts,
      maxPerObjective,
    }))
    picked.push(...pickWithSpread({
      candidates: otherCandidates,
      count: otherCount,
      shuf,
      usedIds,
      objectiveCounts,
      maxPerObjective,
    }))
  } else if (weakBudget > 0) {
    picked.push(...pickWithSpread({
      candidates: [...unseenPool, ...stalePool, ...recentPool].filter(q => {
        const id = questionId(q)
        return id == null || !usedIds.has(id)
      }),
      count: weakBudget,
      shuf,
      usedIds,
      objectiveCounts,
      maxPerObjective,
    }))
  }

  const slotsLeft = Math.max(0, remaining - picked.length)
  if (slotsLeft > 0) {
    const spillOrder = [
      ...unseenPool,
      ...stalePool,
      ...recentPool,
      ...available,
    ]
    picked.push(...pickWithSpread({
      candidates: spillOrder,
      count: slotsLeft,
      shuf,
      usedIds,
      objectiveCounts,
      maxPerObjective,
    }))
  }

  return picked
}

/**
 * Build a blueprint-sized pool for one domain.
 * Carryover skips are reserved first; remainder uses exposure tiers when exposureStats is set.
 * Adaptive retake: 60% unseen, 30% stale, ~10% weak-objective (60/40 within weak slot).
 * Without exposureStats, falls back to legacy 60/40 weak split for the full remainder.
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
  exposureStats = null,
  maxPerObjective = 2,
}) {
  const shuf = shuffle || (arr => [...arr])
  const domainObjectiveIds = new Set((domain.objectives || []).map(o => o.id))
  const filterSet = Array.isArray(objectiveFilter) && objectiveFilter.length
    ? new Set(objectiveFilter.filter(id => domainObjectiveIds.has(id)))
    : null
  const spreadCap = filterSet?.size ? null : maxPerObjective

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

  const carryoverIds = new Set(carryoverQuestions.map(q => questionId(q)))
  const poolExcludingCarryover = pool.filter(q => !carryoverIds.has(questionId(q)))

  const carryoverSlice = carryoverQuestions.slice(0, count)
  const remaining = Math.max(0, count - carryoverSlice.length)

  if (remaining === 0) {
    return carryoverSlice
  }

  const weakSet = new Set(weakObjectiveIds || [])
  const usedIds = new Set(carryoverSlice.map(q => questionId(q)).filter(id => id != null))
  const objectiveCounts = {}
  for (const q of carryoverSlice) {
    if (q.objectiveId) objectiveCounts[q.objectiveId] = (objectiveCounts[q.objectiveId] || 0) + 1
  }

  const remainderPicked = exposureStats
    ? fillExposureRemainder({
      remaining,
      poolExcludingCarryover,
      exposureStats,
      weakSet,
      shuf,
      usedIds,
      objectiveCounts,
      maxPerObjective: spreadCap,
    })
    : fillLegacyRemainder({
      remaining,
      poolExcludingCarryover,
      weakSet,
      shuf,
      usedIds,
      objectiveCounts,
      maxPerObjective: spreadCap,
    })

  return dedupeById([...carryoverSlice, ...remainderPicked]).filter(isMcQuestion).slice(0, count)
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
