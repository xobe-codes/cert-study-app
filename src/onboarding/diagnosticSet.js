import { ALL_OBJECTIVES } from '../data/ccnaDomains.js'
import { hasCuratedQuestions, getCuratedQuestions } from '../data/ccnaCurated.js'
import { isOrderingQuestion, isMcQuestion, randomizeQuestionOrder } from '../questionUtils.js'

export const DIAGNOSTIC_CAP = 18
export const DIAGNOSTIC_PER_OBJ = 2
export const DIAGNOSTIC_SKILL_MIN = 5

/** Placement check only uses questions we can render and grade safely. */
export function isValidDiagnosticQuestion(q) {
  if (!q?.objectiveId) return false
  return isOrderingQuestion(q) || isMcQuestion(q)
}

export async function buildDiagnosticSet() {
  const { allSkillQuestions } = await import('../data/ccnaSkillQuestions.js')
  const skillPool = allSkillQuestions().filter(isValidDiagnosticQuestion)
  const mcPool = []
  for (const obj of ALL_OBJECTIVES) {
    if (!hasCuratedQuestions(obj.id)) continue
    getCuratedQuestions(obj.id)
      .filter(isMcQuestion)
      .slice(0, DIAGNOSTIC_PER_OBJ)
      .forEach(q => mcPool.push({ ...q, objectiveId: obj.id }))
  }
  const skillPick = randomizeQuestionOrder(skillPool).slice(0, DIAGNOSTIC_SKILL_MIN)
  const seen = new Set(skillPick.map(q => q.id || q.question))
  const mcPick = randomizeQuestionOrder(mcPool.filter(q => !seen.has(q.id || q.question)))
    .slice(0, Math.max(0, DIAGNOSTIC_CAP - skillPick.length))
  return randomizeQuestionOrder([...skillPick, ...mcPick])
    .filter(isValidDiagnosticQuestion)
    .slice(0, DIAGNOSTIC_CAP)
}
