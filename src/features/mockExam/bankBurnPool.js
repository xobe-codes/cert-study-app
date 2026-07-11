import { isChoiceQuestion } from '../../questionUtils.js'
import {
  EXPOSURE_TIERS,
  getDomainSeenMap,
  getExposureStats,
  pickExposureTier,
} from '../domainPass/domainQuestionExposure.js'

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
 * Used to show the coverage delta at the end of a Bank burn session.
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
 * Bank burn picker — the shared exposure contract:
 * prefer UNSEEN, then STALE, then MISS-RETRY; never recycle RECENT while
 * unseen or stale questions remain. Recent questions are spillover only.
 *
 * missOnly builds the queue exclusively from the caller's missed bank
 * (Fix misses flow); exposure ordering still applies within that queue.
 */
export function buildBankBurnPool({
  domains,
  getMcQuestions,
  exposureStore,
  missed = [],
  count,
  shuffle,
  missOnly = false,
}) {
  const shuf = shuffle || (arr => [...arr])
  const bank = collectBankQuestions(domains, getMcQuestions)
  const missRetryIds = new Set(collectMissRetryIds(missed, domains))

  let candidates = bank
  if (missOnly) {
    candidates = bank.filter(q => missRetryIds.has(questionId(q)))
    if (!candidates.length) return []
  }

  const now = Date.now()
  const seenAtFor = (q) => {
    const seenById = getDomainSeenMap(exposureStore, q.domainId)
    return seenById[questionId(q)]
  }

  const unseen = []
  const stale = []
  const recentMissRetry = []
  const recent = []
  for (const q of candidates) {
    const tier = pickExposureTier(questionId(q), { seenAt: seenAtFor(q), now })
    if (tier === EXPOSURE_TIERS.UNSEEN) unseen.push(q)
    else if (tier === EXPOSURE_TIERS.STALE) stale.push(q)
    else if (missRetryIds.has(questionId(q))) recentMissRetry.push(q)
    else recent.push(q)
  }

  // Priority order: unseen → stale → miss-retry → recent (spillover only).
  const ordered = [
    ...shuf(unseen),
    ...shuf(stale),
    ...shuf(recentMissRetry),
    ...shuf(recent),
  ]
  const cap = Math.max(0, Math.min(count ?? ordered.length, ordered.length))
  return ordered.slice(0, cap)
}

/** Exam-ish timing for Domain sim: 2 minutes per question. */
export function domainSimDurationSec(questionCount) {
  return Math.max(1, Number(questionCount) || 0) * 120
}
