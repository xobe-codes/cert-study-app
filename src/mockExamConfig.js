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
