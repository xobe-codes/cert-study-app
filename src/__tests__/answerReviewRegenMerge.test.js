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
import regeneratedExplanations from '../answerReview/regeneratedExplanations.json'
import { CLEAN_QUESTIONS as DOMAIN_6_QUESTIONS } from '../data/cleanQuestions/domain-6.js'

const authoredRegen = regeneratedExplanations['1.1-c-q1'].incorrect

describe('generateAnswerReview regen merge', () => {
  beforeEach(() => {
    mockGoldFor.mockReset()
    mockGoldFor.mockReturnValue(undefined)
  })

  it('uses regen over template clean-bank when gold is absent', () => {
    mockGoldFor.mockReturnValue(null)
    expect(goldAnswerReviewFor('1.1-c-q1')).toBeNull()
    const q = {
      id: '1.1-c-q1',
      regeneratedIncorrect: authoredRegen,
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
    expect(regenIncorrectFor(q, 0)?.whyWrongHere).toMatch(/primarily operates|Layer 3 header/i)
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
      regeneratedIncorrect: authoredRegen,
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

  it('rejects legacy-template regen data instead of applying it verbatim', () => {
    mockGoldFor.mockReturnValue(null)
    const q = Object.values(DOMAIN_6_QUESTIONS)
      .flat()
      .find(item => item.id === 'obj-6.6-source-q018')
    expect(q?.regeneratedIncorrect).toHaveLength(q.choices.length - 1)

    const raw = q.regeneratedIncorrect[0]
    const review = generateAnswerReview(q)
    const applied = review.incorrect.find(item => item.choiceIndex === raw.choiceIndex)

    // This fixture's regen-ledger entry is legacy "matches the required
    // behavior" boilerplate — and it's also factually wrong (it references
    // "JSON" as the keyed answer when this question's correct choice is
    // "Python"). The quality gate must reject it rather than apply it as-is.
    expect(raw.whyWrongHere).toMatch(/matches the required behavior/)
    expect(applied.whyWrongHere).not.toBe(raw.whyWrongHere)
    expect(applied.whyWrongHere).not.toMatch(/matches the required behavior/)
  })
})
