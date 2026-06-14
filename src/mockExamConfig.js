/** Mock exam sizing and domain-weighted allocation. */
export const MOCK_EXAM_QUESTION_COUNT = 30
export const MOCK_EXAM_DURATION_MIN = 120
/** Max AI-generated questions per mock attempt (static bank preferred). */
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
