import { ALL_OBJECTIVES } from '../data/ccnaDomains.js'

/** Open an objective from weak-area / baseline flows with Practice tab + domain context. */
export function buildStudyObjectiveHandoff(objectiveId, { tab = 'Practice' } = {}) {
  const obj = ALL_OBJECTIVES.find(o => o.id === objectiveId)
  if (!obj) return null
  return { ...obj, __initialTab: tab }
}
