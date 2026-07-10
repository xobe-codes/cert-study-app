/**
 * Shared AnswerReview props so Practice / Mock / Review / Focus share the same
 * miss → family → remediation debrief contract.
 */
import { applyAnswerReviewToQuestion } from '../answerReviewLogic.js'
import { domainIdFromObjectiveId } from '../features/domainPass/domainQuestionExposure.js'

export function enrichQuestionForReview(q) {
  if (!q) return q
  return applyAnswerReviewToQuestion(q)
}

export function answerReviewSessionProps({
  q,
  selected,
  cliAnswer,
  orderAnswer,
  objectiveId,
  domainId,
  hideExamTip = false,
  showQuestionFlag = false,
  onOpenLab,
  onOpenTrapDrill,
  onOpenSubnet,
} = {}) {
  const enriched = enrichQuestionForReview(q)
  const oid = objectiveId || enriched?.objectiveId
  const did = domainId || (oid ? domainIdFromObjectiveId(oid) : undefined)
  return {
    q: enriched,
    selected,
    cliAnswer,
    orderAnswer,
    objectiveId: oid,
    domainId: did,
    hideExamTip,
    showQuestionFlag,
    onOpenLab,
    onOpenTrapDrill,
    onOpenSubnet,
  }
}
