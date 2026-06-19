import { getCuratedQuestions } from '../data/ccnaCurated.js'
import { preloadCleanBank } from '../data/cleanQuestionAdapter.js'
import { randomizeQuestionOrder } from '../questionUtils.js'
import { getTopicIndex, resolveCkuIdsFromConcepts } from './topicIndex.js'

const DEFAULT_CAP = 30

function scopeObjectives(objectiveIds, conceptIds, index) {
  const explicit = new Set(objectiveIds || [])
  const fromConcepts = new Set()
  for (const cid of conceptIds || []) {
    const c = index.conceptById.get(cid)
    if (c?.objectiveId) fromConcepts.add(c.objectiveId)
  }
  if (explicit.size === 0 && fromConcepts.size > 0) return fromConcepts
  return new Set([...explicit, ...fromConcepts])
}

function questionMatches(q, { explicitObjectives, ckuFilter, useConceptFilter, objectiveId }) {
  const fromObjective = explicitObjectives.has(objectiveId)
  if (!useConceptFilter) return fromObjective
  const fromConcept = q.ckuIds?.some(k => ckuFilter.has(k))
  if (explicitObjectives.size === 0) return fromConcept
  return fromObjective || fromConcept
}

function collectFromBank(bank, objectiveIds, conceptIds, index) {
  const explicitObjectives = new Set(objectiveIds || [])
  const useConceptFilter = (conceptIds || []).length > 0
  const ckuFilter = resolveCkuIdsFromConcepts(conceptIds || [], index)
  const objScope = scopeObjectives(objectiveIds, conceptIds, index)
  const out = []
  const seen = new Set()

  for (const oid of objScope) {
    const qs = getCuratedQuestions(oid)
    const bankQs = (bank?.[oid] || []).map(q => ({ ...q, objectiveId: oid }))
    const merged = [...qs.map(q => ({ ...q, objectiveId: oid })), ...bankQs]

    for (const q of merged) {
      if (!q?.question && !q?.choices?.length) continue
      const key = q.id || `${oid}:${q.question?.slice(0, 40)}`
      if (seen.has(key)) continue
      if (!questionMatches(q, { explicitObjectives, ckuFilter, useConceptFilter, objectiveId: oid })) continue
      seen.add(key)
      out.push({ ...q, objectiveId: oid })
    }
  }
  return out
}

export function estimateTopicFocusQuestions(objectiveIds, conceptIds, index = getTopicIndex()) {
  return collectFromBank({}, objectiveIds, conceptIds, index).length
}

export async function buildTopicFocusQueue({ objectiveIds = [], conceptIds = [] }, { cap = DEFAULT_CAP, bank = null } = {}) {
  await preloadCleanBank()
  const index = getTopicIndex()
  const pool = collectFromBank(bank || {}, objectiveIds, conceptIds, index)
  if (pool.length === 0) return []
  return randomizeQuestionOrder(pool).slice(0, Math.max(1, cap))
}
