import { ALL_OBJECTIVES, DOMAINS } from '../data/ccnaDomains.js'

/**
 * Pick the objective with the most recent progress.lastSeen for Resume Study.
 * @returns {{ objective, domainId, domainName, accent, lastSeen } | null}
 */
export function pickResumeStudyObjective(progress = {}) {
  let best = null
  let bestTs = 0
  for (const o of ALL_OBJECTIVES) {
    const ts = progress[o.id]?.lastSeen
    if (!ts || ts <= bestTs) continue
    const domain = DOMAINS.find(d => d.objectives.some(x => x.id === o.id))
    if (!domain) continue
    bestTs = ts
    best = {
      objective: o,
      domainId: domain.id,
      domainName: domain.name,
      accent: domain.accent,
      lastSeen: ts,
    }
  }
  return best
}

/** Handoff object for selectObjective → Study tab. */
export function resumeStudyHandoff(progress) {
  const pick = pickResumeStudyObjective(progress)
  if (!pick) return null
  return {
    ...pick.objective,
    domainId: pick.domainId,
    domainName: pick.domainName,
    accent: pick.accent,
    __initialTab: 'Study',
  }
}

/** First unseen (or first) objective in a domain — Lessons browse entry. */
export function pickDomainLessonObjective(domain, progress = {}) {
  if (!domain?.objectives?.length) return null
  const unseen = domain.objectives.find(o => !progress[o.id]?.lastSeen && progress[o.id]?.status !== 'mastered')
  const target = unseen || domain.objectives[0]
  return {
    ...target,
    domainId: domain.id,
    domainName: domain.name,
    accent: domain.accent,
    __initialTab: 'Study',
  }
}
