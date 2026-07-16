import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGoldFor = vi.hoisted(() => vi.fn())

vi.mock('../answerReview/goldAnswerReviews.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    goldAnswerReviewFor: (...args) => mockGoldFor(...args),
  }
})

import { generateAnswerReview } from '../answerReviewLogic.js'
import { goldAnswerReviewFor } from '../answerReview/goldAnswerReviews.js'
import { regenIncorrectFor } from '../features/explanationIntegration.js'

describe('generateAnswerReview regen merge', () => {
  beforeEach(() => {
    mockGoldFor.mockReset()
    mockGoldFor.mockReturnValue(undefined)
  })

  it('uses regen over template clean-bank when gold is absent', () => {
    mockGoldFor.mockReturnValue(null)
    expect(goldAnswerReviewFor('1.1-c-q1')).toBeNull()
    expect(regenIncorrectFor('1.1-c-q1', 0)?.whyWrongHere).toMatch(/primarily operates|Layer 3 header/i)
    const q = {
      id: '1.1-c-q1',
      question: 'At which OSI layer does a router primarily operate?',
      choices: ['Layer 1', 'Layer 2', 'Layer 3', 'Layer 7'],
      correctIndex: 2,
      explanation: 'Routers forward packets based on IP addresses — Layer 3.',
      answerReview: {
        incorrect: [{
          choiceIndex: 0,
          explanation: 'Layer 1 handles bits on the wire.',
          whyWrongHere: 'For "router layer", Layer 3 satisfies what this question tests — Layer 1 does not.',
          whatItDoes: 'Layer 1 points to a related idea, but not the specific behavior or value required for router layer.',
        }],
      },
    }
    const ar = generateAnswerReview(q)
    const item = ar.incorrect.find(i => i.choiceIndex === 0)
    expect(item.whyWrongHere).toMatch(/primarily operates|Layer 3 header/i)
    expect(item.whyWrongHere).not.toMatch(/For "router layer"/)
  })

  it('uses regen when gold exists but lacks SADE-quality fields', () => {
    mockGoldFor.mockReturnValue({
      correct: { choiceIndex: 2, explanation: 'Gold correct expl.' },
      incorrect: [{
        choiceIndex: 0,
        explanation: 'Layer 1 handles bits on the wire.',
        misconceptionTested: 'Confusing physical signaling with routing',
      }],
      examTip: 'Gold tip',
    })
    const q = {
      id: '1.1-c-q1',
      question: 'At which OSI layer does a router primarily operate?',
      choices: ['Layer 1', 'Layer 2', 'Layer 3', 'Layer 7'],
      correctIndex: 2,
      explanation: 'Routers forward packets based on IP addresses — Layer 3.',
    }
    const ar = generateAnswerReview(q)
    const item = ar.incorrect.find(i => i.choiceIndex === 0)
    expect(item.whyWrongHere).toMatch(/primarily operates|Layer 3 header/i)
    expect(item.explanation).toMatch(/Layer 1 handles bits/)
  })
})
