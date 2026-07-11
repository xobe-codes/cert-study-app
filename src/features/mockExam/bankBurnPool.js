import { isChoiceQuestion } from '../../questionUtils.js'
import {
  getDomainSeenMap,
  getExposureStats,
} from '../domainPass/domainQuestionExposure.js'
import { buildExposureAwarePool } from '../domainPass/buildExposureAwarePool.js'

function questionId(q) {
  return q?.id ?? q?.questionId
}

function dedupeById(questions) {
  const seen = new Set()
  const out = []
  for (const q of questions || []) {
    const id = questionId(q)
    if (id != null) {
      if (seen.has(id)) continue
      seen.add(id)
    }
    out.push(q)
  }
  return out
}

/** All MC questions across the given domains, tagged with objectiveId + domainId. */
export function collectBankQuestions(domains, getMcQuestions) {
  return dedupeById(
    (domains || []).flatMap(domain =>
      (domain.objectives || []).flatMap(o =>
        getMcQuestions(o.id)
          .filter(isChoiceQuestion)
          .map(q => ({ ...q, objectiveId: q.objectiveId || o.id, domainId: domain.id })),
      ),
    ),
  )
}

/**
 * Per-domain bank coverage snapshot: { [domainId]: { bankCount, seenCount } }.
 */
export function computeBankCoverage(domains, getMcQuestions, exposureStore) {
  const coverage = {}
  for (const domain of domains || []) {
    const ids = []
    const seen = new Set()
    for (const o of domain.objectives || []) {
      for (const q of getMcQuestions(o.id)) {
        if (!isChoiceQuestion(q)) continue
        const id = questionId(q)
        if (id == null || seen.has(id)) continue
        seen.add(id)
        ids.push(id)
      }
    }
    const seenById = getDomainSeenMap(exposureStore, domain.id)
    const stats = getExposureStats(domain.id, ids, seenById)
    coverage[domain.id] = { bankCount: ids.length, seenCount: stats.seenCount }
  }
  return coverage
}

/** Miss-retry ids scoped to the given domains (most recent miss first, deduped). */
export function collectMissRetryIds(missed, domains) {
  const objectiveIds = new Set(
    (domains || []).flatMap(d => (d.objectives || []).map(o => o.id)),
  )
  const seen = new Set()
  const ids = []
  for (let i = (missed || []).length - 1; i >= 0; i--) {
    const m = missed[i]
    if (!m || !objectiveIds.has(m.objectiveId)) continue
    const id = m.id ?? m.questionId
    if (id == null || seen.has(id)) continue
    seen.add(id)
    ids.push(id)
  }
  return ids
}

/**
 * Flatten per-domain seen maps into a single seenById for multi-domain pools.
 * Prefers the most recent timestamp if a question appears in multiple domains.
 */
function mergeSeenById(domains, exposureStore) {
  const merged = {}
  for (const domain of domains || []) {
    const map = getDomainSeenMap(exposureStore, domain.id)
    for (const [id, ts] of Object.entries(map)) {
      if (merged[id] == null || ts > merged[id]) merged[id] = ts
    }
  }
  return merged
}

/**
 * Bank burn picker — Spec 1 shared exposure contract via buildExposureAwarePool.
 * missOnly: queue exclusively from missed bank (Fix misses).
 */
export function buildBankBurnPool({
  domains,
  getMcQuestions,
  exposureStore,
  missed = [],
  count,
  shuffle,
  missOnly = false,
  missRetryIds: missRetryIdsOverride = null,
}) {
  const bank = collectBankQuestions(domains, getMcQuestions)
  const missRetryIds = missRetryIdsOverride != null
    ? missRetryIdsOverride
    : collectMissRetryIds(missed, domains)

  let candidates = bank
  if (missOnly) {
    const missSet = new Set(missRetryIds)
    candidates = bank.filter(q => missSet.has(questionId(q)))
    if (!candidates.length) return []
  }

  const seenById = mergeSeenById(domains, exposureStore)
  return buildExposureAwarePool({
    candidates,
    seenById,
    missRetryIds,
    count: count ?? candidates.length,
    shuffle,
  })
}

/** Exam-ish timing for Domain sim: 2 minutes per question. */
export function domainSimDurationSec(questionCount) {
  return Math.max(1, Number(questionCount) || 0) * 120
}
