/** Mock exam sizing and domain-weighted allocation. */
export const MOCK_EXAM_QUESTION_COUNT = 30
export const MOCK_EXAM_DURATION_MIN = 120
/** Max AI-generated questions per mock attempt when hybrid mode is enabled. */
export const MOCK_EXAM_AI_CAP = 8

export function buildMockExamDomainCounts(domains, questionCount = MOCK_EXAM_QUESTION_COUNT) {
  const counts = []
  let allocated = 0
  domains.forEach((domain, idx) => {
    let count
    if (idx === domains.length - 1) {
      count = questionCount - allocated
    } else {
      count = Math.round((domain.weight / 100) * questionCount)
      allocated += count
    }
    counts.push({ domain, count })
  })
  return counts
}

/** True when every domain has enough MC questions to fill its weighted slot. */
export function staticMockExamReady(domains, getMcQuestions, questionCount = MOCK_EXAM_QUESTION_COUNT) {
  return buildMockExamDomainCounts(domains, questionCount).every(({ domain, count }) => {
    const poolSize = domain.objectives.reduce((n, o) => n + getMcQuestions(o.id).length, 0)
    return poolSize >= count
  })
}

/** Build a full mock exam from the static bank only (no API). */
export function buildStaticMockExamPool(domains, getMcQuestions, shuffle, questionCount = MOCK_EXAM_QUESTION_COUNT) {
  const all = []
  for (const { domain, count } of buildMockExamDomainCounts(domains, questionCount)) {
    const staticPool = shuffle(
      domain.objectives.flatMap(o => getMcQuestions(o.id).map(q => ({ ...q, objectiveId: o.id }))),
    )
    all.push(...staticPool.slice(0, count))
  }
  return shuffle(all)
}

/**
 * Weighted sample favoring questions whose ckuIds overlap weakCkuIds.
 * Each weak CKU match adds +3 to weight (base 1). No replacement.
 */
export function sampleAdaptiveQuestions(questions, weakCkuIds, count, shuffle = arr => [...arr]) {
  const pool = shuffle(questions || [])
  const n = Math.min(count, pool.length)
  if (n === 0) return []
  const weak = new Set(weakCkuIds || [])
  if (weak.size === 0) return pool.slice(0, n)

  const weighted = pool.map(q => {
    const ids = q.ckuIds || []
    const overlap = ids.filter(id => weak.has(id)).length
    return { q, weight: 1 + overlap * 3 }
  })

  const picked = []
  const remaining = [...weighted]
  while (picked.length < n && remaining.length) {
    const total = remaining.reduce((s, w) => s + w.weight, 0)
    let roll = Math.random() * total
    let idx = 0
    for (; idx < remaining.length; idx++) {
      roll -= remaining[idx].weight
      if (roll <= 0) break
    }
    const chosen = remaining.splice(Math.min(idx, remaining.length - 1), 1)[0]
    picked.push(chosen.q)
  }
  return picked
}

/**
 * Full mock exam pool: CCNA blueprint domain weights, with optional weak-CKU
 * weighting applied within each domain slice.
 */
export function buildBlueprintWeightedPool(domains, getMcQuestions, weakCkuIds, shuffle, questionCount = MOCK_EXAM_QUESTION_COUNT) {
  const weak = weakCkuIds || []
  const all = []
  for (const { domain, count } of buildMockExamDomainCounts(domains, questionCount)) {
    const domainPool = domain.objectives.flatMap(o =>
      getMcQuestions(o.id).map(q => ({ ...q, objectiveId: o.id })),
    )
    const slice = weak.length
      ? sampleAdaptiveQuestions(domainPool, weak, count, shuffle)
      : shuffle(domainPool).slice(0, count)
    all.push(...slice)
  }
  return shuffle(all)
}
