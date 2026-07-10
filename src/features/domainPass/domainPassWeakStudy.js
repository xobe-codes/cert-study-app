import { buildStudyObjectiveHandoff } from '../../study/studyObjectiveHandoff.js'

/** Study-tab handoff for a Domain Pass weak objective (with domain chrome). */
export function buildDomainPassWeakStudyHandoff(domain, objectiveId) {
  if (!domain || !objectiveId) return null
  const handoff = buildStudyObjectiveHandoff(objectiveId, { tab: 'Study' })
  if (!handoff) return null
  return {
    ...handoff,
    domainId: domain.id,
    domainName: domain.name,
    accent: domain.accent,
  }
}
