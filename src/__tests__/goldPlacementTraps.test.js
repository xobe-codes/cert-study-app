import { describe, it, expect } from 'vitest'
import { GOLD_ANSWER_REVIEWS } from '../answerReview/goldAnswerReviewsData.js'
import { PLACEMENT_TRAP_GOLD } from '../answerReview/goldAnswerReviewsPlacementTraps.js'
import { PLACEMENT_TRAP_GOLD_BATCH2 } from '../answerReview/goldAnswerReviewsPlacementTrapsBatch2.js'
import { PLACEMENT_TRAP_GOLD_BATCH3 } from '../answerReview/goldAnswerReviewsPlacementTrapsBatch3.js'
import { placementDomainIds, getPlacementBlueprint } from '../features/domainPlacement/placementBlueprints.js'

const ALL_PLACEMENT_TRAP_GOLD = { ...PLACEMENT_TRAP_GOLD, ...PLACEMENT_TRAP_GOLD_BATCH2, ...PLACEMENT_TRAP_GOLD_BATCH3 }

describe('goldAnswerReviewsPlacementTraps', () => {
  it('polishes every placement blueprint trap stem', () => {
    const trapIds = placementDomainIds().flatMap(domainId =>
      getPlacementBlueprint(domainId).items.filter(i => i.trap).map(i => i.id),
    )
    expect(trapIds).toHaveLength(49)
    expect(Object.keys(ALL_PLACEMENT_TRAP_GOLD)).toHaveLength(49)
    for (const id of trapIds) {
      expect(ALL_PLACEMENT_TRAP_GOLD[id], id).toBeTruthy()
    }
  })

  it('wires all placement trap gold into GOLD_ANSWER_REVIEWS', () => {
    for (const id of Object.keys(ALL_PLACEMENT_TRAP_GOLD)) {
      expect(GOLD_ANSWER_REVIEWS[id]?.examTip, id).toBeTruthy()
      expect(GOLD_ANSWER_REVIEWS[id]?.incorrect?.length, id).toBe(3)
    }
  })
})
