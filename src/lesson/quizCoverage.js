import { randomizeQuestionOrder } from '../questionUtils.js'
import { getCurated, getCuratedQuestions, curatedObjectiveIds } from '../data/ccnaCurated.js'
import { confidencePickScore } from '../quiz/confidenceScheduler.js'

export function getObjectiveCkuIds(objectiveId) {
  const curated = getCurated(objectiveId)
  return (curated?.ckus || []).map(c => c.id).filter(Boolean)
}

/** How many CKUs have at least one banked question tagged to them. */
export function computeCkuCoverage(objectiveId, bankedQuestions) {
  const allCkuIds = getObjectiveCkuIds(objectiveId)
  if (!allCkuIds.length) return null

  const covered = new Set()
  const pool = bankedQuestions?.length ? bankedQuestions : getCuratedQuestions(objectiveId)
  for (const q of pool) {
    for (const id of q.ckuIds || []) {
      if (allCkuIds.includes(id)) covered.add(id)
    }
  }
  const uncovered = allCkuIds.filter(id => !covered.has(id))
  return {
    total: allCkuIds.length,
    covered: covered.size,
    uncovered,
    ratio: allCkuIds.length ? covered.size / allCkuIds.length : 1,
  }
}

function questionPriority(q) {
  return confidencePickScore(q)
}

function ckuAttemptWeight(banked, ckuId) {
  let w = 0
  for (const q of banked) {
    if (!q.ckuIds?.includes(ckuId)) continue
    w += q.attempts?.length || 0
  }
  return w
}

/**
 * Session picker with CKU coverage bias: under-tested CKUs get a slot first,
 * then confidence-weighted review priority fills the rest.
 * Optional preferUnseenIds lightly boosts never-seen bank ids (exposure).
 */
export function pickReviewSet(banked, accuracy = null, sessionSize = 5, { ckuIds = [], preferUnseenIds = null } = {}) {
  const limit = Math.min(Math.max(1, sessionSize), banked.length)
  const unseen = preferUnseenIds instanceof Set
    ? preferUnseenIds
    : (Array.isArray(preferUnseenIds) ? new Set(preferUnseenIds) : null)
  const diffBias = accuracy == null ? {}
    : accuracy >= 0.8 ? { easy: 0.35, medium: 0, hard: -0.35 }
    : accuracy < 0.5 ? { easy: -0.35, medium: 0, hard: 0.35 }
    : {}
  // Prefer CLI recall lightly when present so Practice feels in-lesson (not a separate tool).
  const typeBias = { troubleshooting: -0.45, ordering: -0.35, cli: -0.4 }

  const score = (q, ckuBoost = 0) => (
    questionPriority(q)
    + (diffBias[q.difficulty] ?? 0)
    + (typeBias[q.type] ?? 0)
    + ckuBoost
    + (unseen?.has(q.id) ? -0.35 : 0)
  )

  const selected = []
  const usedIds = new Set()

  const underTestedCkus = [...new Set(ckuIds)]
    .sort((a, b) => ckuAttemptWeight(banked, a) - ckuAttemptWeight(banked, b))

  for (const ckuId of underTestedCkus) {
    if (selected.length >= limit) break
    const candidates = banked.filter(q => !usedIds.has(q.id) && q.ckuIds?.includes(ckuId))
    if (!candidates.length) continue
    const best = [...candidates]
      .map(q => ({ q, s: score(q, -0.6) + Math.random() * 0.01 }))
      .sort((a, b) => a.s - b.s)[0].q
    selected.push(best)
    usedIds.add(best.id)
  }

  const remaining = banked.filter(q => !usedIds.has(q.id))
  const fill = [...remaining]
    .map(q => ({ q, s: score(q) + Math.random() * 0.01 }))
    .sort((a, b) => a.s - b.s)
    .slice(0, limit - selected.length)
    .map(x => x.q)

  return ensureCliInReviewSet(randomizeQuestionOrder([...selected, ...fill]), banked, limit)
}

/**
 * Guarantee ~1 CLI type-in per 4–5 Practice questions when the bank has them.
 * Pure rearrange — no new question types or corpus.
 */
export function ensureCliInReviewSet(set, banked, sessionSize = 5) {
  const out = Array.isArray(set) ? [...set] : []
  if (!out.length || !banked?.length) return out
  const cliBank = banked.filter(q => q?.type === 'cli' && (q.answers?.length || q.answer))
  if (!cliBank.length) return out
  const want = Math.min(Math.max(1, Math.ceil(sessionSize / 4)), cliBank.length, out.length)
  const have = out.filter(q => q?.type === 'cli').length
  if (have >= want) return out
  const used = new Set(out.map(q => q.id).filter(Boolean))
  const extras = cliBank.filter(q => !used.has(q.id))
  let need = want - have
  for (let i = out.length - 1; i >= 0 && need > 0 && extras.length; i--) {
    if (out[i]?.type === 'cli') continue
    const next = extras.shift()
    if (!next) break
    out[i] = next
    need -= 1
  }
  return out
}

/** Build-time coverage check — every CKU should have >=1 curated question. */
export function validateCuratedCkuCoverage() {
  const errors = []
  for (const objectiveId of curatedObjectiveIds) {
    const coverage = computeCkuCoverage(objectiveId, getCuratedQuestions(objectiveId))
    if (!coverage) continue
    for (const ckuId of coverage.uncovered) {
      errors.push(`${objectiveId}: CKU ${ckuId} has no quiz questions`)
    }
  }
  return { ok: errors.length === 0, errors }
}
