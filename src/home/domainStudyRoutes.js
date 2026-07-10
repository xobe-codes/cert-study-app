import { DOMAINS } from '../data/ccnaDomains.js'
import { labsForDomain } from '../data/labModules.js'
import { isPlacementDomain } from '../features/domainPlacement/placementBlueprints.js'

/** Per-domain study stack metadata for home accordion + debrief CTAs. */
export function getDomainStudyMeta(domainId) {
  const domain = DOMAINS.find(d => d.id === domainId)
  if (!domain) return { labCount: 0, hasPlacement: false, domainNumber: null, domain: null }
  const domainNumber = parseInt(domain.objectives[0]?.id?.split('.')?.[0], 10) || null
  return {
    labCount: labsForDomain(domainId).length,
    hasPlacement: isPlacementDomain(domainId),
    domainNumber,
    domain,
  }
}

/** Map of domainId → { labCount, hasPlacement } for all CCNA domains. */
export function buildDomainStudyRoutes() {
  return Object.fromEntries(
    DOMAINS.map(d => {
      const { labCount, hasPlacement } = getDomainStudyMeta(d.id)
      return [d.id, { labCount, hasPlacement }]
    }),
  )
}

/** First objective to open for domain-scoped Practice handoff. */
export function pickDomainPracticeObjective(domain, { placementRecord, baselineSummary, progress } = {}) {
  const weakFromBaseline = baselineSummary?.weakObjectives?.[0]
  if (weakFromBaseline) return weakFromBaseline.id

  const weakFromProfile = domain.objectives.find(
    o => placementRecord?.lastAttempt?.objectiveProfiles?.[o.id]?.status === 'weak',
  )
  if (weakFromProfile) return weakFromProfile.id

  const notMastered = domain.objectives.find(o => progress?.[o.id]?.status !== 'mastered')
  if (notMastered) return notMastered.id

  return domain.objectives[0]?.id || null
}
