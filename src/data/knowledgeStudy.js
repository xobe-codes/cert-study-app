import { DOMAIN_4_KB } from './ccnaKnowledgeBaseDomain4.js'

const DOMAIN_3 = new Set(['3.1', '3.2', '3.3', '3.4', '3.5'])
const DOMAIN_4 = new Set(['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.9'])
const KB_OBJECTIVES = new Set([...DOMAIN_3, ...DOMAIN_4])

export function hasKnowledgeBase(objectiveId) {
  return KB_OBJECTIVES.has(objectiveId)
}

export function getKnowledgeForObjective(objectiveId) {
  if (!KB_OBJECTIVES.has(objectiveId)) return null
  const objectives = DOMAIN_4_KB.objectives || []
  const objective = objectives.find(o => o.objectiveId === objectiveId) || null
  const ckuIds = new Set(objective?.ckuIds || [])
  return {
    objective,
    ckus: (DOMAIN_4_KB.ckus || []).filter(c => ckuIds.has(c.ckuId) || c.objectiveIds?.includes(objectiveId)),
    glossary: (DOMAIN_4_KB.glossary || []).filter(g => g.objectiveId === objectiveId || g.ckuIds?.some(id => ckuIds.has(id))),
    commands: (DOMAIN_4_KB.commandBank || []).filter(c => c.objectiveId === objectiveId || c.ckuIds?.some(id => ckuIds.has(id))),
    examTraps: (DOMAIN_4_KB.examTraps || []).filter(t => t.objectiveId === objectiveId),
    misconceptions: (DOMAIN_4_KB.misconceptions || []).filter(m => m.objectiveId === objectiveId),
  }
}

export function getAllDomain4ExamTraps() {
  return (DOMAIN_4_KB.examTraps || []).filter(t => DOMAIN_4.has(t.objectiveId))
}

export function getAllDomain3ExamTraps() {
  return (DOMAIN_4_KB.examTraps || []).filter(t => DOMAIN_3.has(t.objectiveId))
}

export function getDomain4Commands() {
  return (DOMAIN_4_KB.commandBank || []).filter(c => DOMAIN_4.has(c.objectiveId))
}

export function getDomain3Commands() {
  return (DOMAIN_4_KB.commandBank || []).filter(c => DOMAIN_3.has(c.objectiveId))
}
