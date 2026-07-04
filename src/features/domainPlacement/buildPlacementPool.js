import { DOMAINS } from '../../data/ccnaDomains.js'
import { getCuratedQuestions } from '../../data/ccnaCurated.js'
import { applyAnswerReviewToQuestion } from '../../answerReviewLogic.js'
import { isMcQuestion } from '../../questionUtils.js'
import { getPlacementBlueprint } from './placementBlueprints.js'
import {
  computeWeakObjectivesFromPlacement,
  orderPlacementBlueprintItems,
} from './placementAdaptiveRetake.js'

function findQuestionInDomain(domain, questionId) {
  for (const obj of domain.objectives) {
    const q = getCuratedQuestions(obj.id).find(item => item.id === questionId)
    if (q) return q
  }
  return null
}

/** Load fixed blueprint questions for a domain placement session. */
export function buildPlacementPool(domainId, { weakObjectiveIds = [], shuffle } = {}) {
  const blueprint = getPlacementBlueprint(domainId)
  if (!blueprint) throw new Error('Placement not available for this domain yet.')

  const domain = DOMAINS.find(d => d.id === domainId)
  if (!domain) throw new Error('Unknown domain.')

  const weakIds = weakObjectiveIds?.length
    ? weakObjectiveIds
    : []
  const orderedItems = orderPlacementBlueprintItems(blueprint.items, {
    weakObjectiveIds: weakIds,
    shuffle,
  })
  const adaptive = weakIds.length > 0

  const questions = []
  const trapByQuestionId = {}

  for (const item of orderedItems) {
    const raw = findQuestionInDomain(domain, item.id)
    if (!raw || !isMcQuestion(raw)) {
      throw new Error(`Placement question missing: ${item.id}`)
    }
    const enriched = applyAnswerReviewToQuestion({ ...raw, objectiveId: item.objectiveId || raw.objectiveId })
    questions.push(enriched)
    trapByQuestionId[item.id] = Boolean(item.trap)
  }

  return {
    questions,
    blueprintVersion: blueprint.version,
    trapByQuestionId,
    mode: adaptive ? 'adaptive' : 'baseline',
    weakObjectiveIds: adaptive ? weakIds : [],
  }
}

export { computeWeakObjectivesFromPlacement }
