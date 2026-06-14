import { DOMAIN_4_KB } from './ccnaKnowledgeBaseDomain4.js'

const DOMAIN_1 = new Set(['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '1.10', '1.11', '1.12'])
const DOMAIN_2 = new Set(['2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8'])
const DOMAIN_3 = new Set(['3.1', '3.2', '3.3', '3.4', '3.5', '3.6'])
const DOMAIN_4 = new Set(['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.9', '4.10'])
const DOMAIN_5 = new Set(['5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7', '5.8', '5.9', '5.10', '5.11'])
const DOMAIN_6 = new Set(['6.1', '6.2', '6.3', '6.4', '6.5', '6.6'])

const KB_OBJECTIVES = new Set(
  (DOMAIN_4_KB.objectives || []).map(o => o.objectiveId).filter(Boolean),
)

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

function trapsForDomain(domainSet) {
  return (DOMAIN_4_KB.examTraps || []).filter(t => domainSet.has(t.objectiveId))
}

export function getAllDomain4ExamTraps() {
  return trapsForDomain(DOMAIN_4)
}

export function getAllDomain3ExamTraps() {
  return trapsForDomain(DOMAIN_3)
}

export function getAllDomain5ExamTraps() {
  return trapsForDomain(DOMAIN_5)
}

export function getAllExamTraps() {
  return DOMAIN_4_KB.examTraps || []
}

export function getDomain4Commands() {
  return (DOMAIN_4_KB.commandBank || []).filter(c => DOMAIN_4.has(c.objectiveId))
}

export function getDomain3Commands() {
  return (DOMAIN_4_KB.commandBank || []).filter(c => DOMAIN_3.has(c.objectiveId))
}
