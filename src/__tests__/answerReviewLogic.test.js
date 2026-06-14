import { describe, it, expect } from 'vitest'
import {
  buildWrongExplanation,
  inferTrapForChoice,
  isGenericWrongExplanation,
  generateAnswerReview,
  resolveIncorrectItem,
} from '../answerReviewLogic.js'

const MAC_Q = {
  question: 'When a switch learns a MAC address, which address does it record — source or destination?',
  choices: [
    'Destination MAC of the frame',
    'Source MAC of the frame',
    'Both source and destination',
    'Neither — only IP addresses',
  ],
  correctIndex: 1,
  explanation: 'Switches learn by reading the SOURCE MAC address and the port it arrived on.',
  concept: 'mac learning',
}

describe('answerReviewLogic', () => {
  it('detects generic template explanations', () => {
    expect(isGenericWrongExplanation('"X" is incorrect because the scenario requires: foo')).toBe(true)
    expect(isGenericWrongExplanation('Switches learn from source MAC on ingress.')).toBe(false)
  })

  it('builds distinct wrong explanations for MAC learning distractors', () => {
    const a = buildWrongExplanation(MAC_Q, 0)
    const c = buildWrongExplanation(MAC_Q, 2)
    const d = buildWrongExplanation(MAC_Q, 3)
    expect(a).toMatch(/source/i)
    expect(a).toMatch(/destination/i)
    expect(c).toMatch(/source/i)
    expect(d).toMatch(/layer 2|ip/i)
    expect(a).not.toMatch(/scenario requires/)
    expect(a).not.toBe(c)
    expect(c).not.toBe(d)
  })

  it('assigns choice-specific traps for MAC learning', () => {
    expect(inferTrapForChoice(MAC_Q, 0)).toMatch(/source MAC.*destination MAC/i)
    expect(inferTrapForChoice(MAC_Q, 3)).toMatch(/layer 3|layer 2/i)
  })

  it('resolveIncorrectItem upgrades generic stored text at runtime', () => {
    const generic = {
      choiceIndex: 0,
      explanation: '"Destination MAC of the frame" is incorrect because the scenario requires: Switches learn by reading the SOURCE MAC address and the port it arrived on.',
      misconceptionTested: 'Picking a familiar term',
    }
    const resolved = resolveIncorrectItem(MAC_Q, generic)
    expect(isGenericWrongExplanation(resolved.explanation)).toBe(false)
    expect(resolved.explanation).toMatch(/source/i)
  })

  it('generateAnswerReview covers each wrong choice', () => {
    const ar = generateAnswerReview(MAC_Q)
    expect(ar.incorrect).toHaveLength(3)
    const texts = ar.incorrect.map(i => i.explanation)
    expect(new Set(texts).size).toBe(3)
  })
})
