import { DOMAINS } from '../../data/ccnaDomains.js'
import { getCuratedQuestions } from '../../data/ccnaCurated.js'
import { applyAnswerReviewToQuestion } from '../../answerReviewLogic.js'
import { isMcQuestion } from '../../questionUtils.js'
import { getPlacementBlueprint } from './placementBlueprints.js'
import {
  computeWeakObjectivesFromPlacement,
  orderPlacementBlueprintItems,
} from './placementAdaptiveRetake.js'
import { PLACEMENT_QUESTION_COUNT } from './domainPlacementConfig.js'

function findQuestionInDomain(domain, questionId) {
  for (const obj of domain.objectives) {
    const q = getCuratedQuestions(obj.id).find(item => item.id === questionId)
    if (q) return q
  }
  return null
}

function materializeItems(domain, items, trapByQuestionId) {
  const questions = []
  const traps = { ...trapByQuestionId }
  for (const item of items) {
    const raw = findQuestionInDomain(domain, item.id)
    if (!raw || !isMcQuestion(raw)) {
      throw new Error(`Placement question missing: ${item.id}`)
    }
    const enriched = applyAnswerReviewToQuestion({ ...raw, objectiveId: item.objectiveId || raw.objectiveId })
    questions.push(enriched)
    traps[item.id] = Boolean(item.trap)
  }
  return { questions, trapByQuestionId: traps }
}

/**
 * Load fixed blueprint questions for a domain placement session.
 * mode: baseline | adaptive | sprint
 */
export function buildPlacementPool(domainId, {
  weakObjectiveIds = [],
  sprintObjectiveIds = [],
  mode: requestedMode,
  shuffle,
} = {}) {
  const blueprint = getPlacementBlueprint(domainId)
  if (!blueprint) throw new Error('Placement not available for this domain yet.')

  const domain = DOMAINS.find(d => d.id === domainId)
  if (!domain) throw new Error('Unknown domain.')

  const weakIds = weakObjectiveIds?.length ? weakObjectiveIds : []
  let items = [...(blueprint.items || [])]
  let mode = requestedMode || (weakIds.length ? 'adaptive' : 'baseline')

  if (mode === 'sprint' && sprintObjectiveIds?.length) {
    const sprintSet = new Set(sprintObjectiveIds)
    const filtered = items.filter(i => sprintSet.has(i.objectiveId))
    if (filtered.length) items = filtered
  }

  const orderedItems = orderPlacementBlueprintItems(items, {
    weakObjectiveIds: mode === 'sprint' ? weakIds : weakIds,
    shuffle,
  }).slice(0, PLACEMENT_QUESTION_COUNT)

  const { questions, trapByQuestionId } = materializeItems(domain, orderedItems, {})

  if (mode === 'adaptive' && !weakIds.length) mode = 'baseline'

  return {
    questions,
    blueprintVersion: blueprint.version,
    trapByQuestionId,
    mode,
    weakObjectiveIds: mode === 'adaptive' || mode === 'sprint' ? weakIds : [],
    sprintObjectiveIds: mode === 'sprint' ? sprintObjectiveIds : [],
  }
}

export { computeWeakObjectivesFromPlacement }
