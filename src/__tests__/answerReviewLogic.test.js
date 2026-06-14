import { describe, it, expect } from 'vitest'
import {
  buildWrongExplanation,
  inferTrapForChoice,
  isGenericWrongExplanation,
  generateAnswerReview,
  resolveIncorrectItem,
} from '../answerReviewLogic.js'
import { isFallbackExplanation, scoreAnswerReview } from '../answerReview/answerReviewQuality.js'

const MAC_Q = {
  id: '1.5-c-q1',
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

const FLOOD_Q = {
  id: '1.5-c-q3',
  question: 'What does a switch do with a frame whose destination MAC is NOT in its MAC address table?',
  choices: [
    'Drops it',
    'Sends it back to the source',
    'Floods it out all ports in the VLAN except the source port',
    'Sends it to the default gateway',
  ],
  correctIndex: 2,
  explanation: 'Unknown unicast frames are flooded out every port in the same VLAN except the ingress port.',
  concept: 'flooding',
  ckuIds: ['CKU-FRAME-FLOODING'],
}

describe('answerReviewLogic', () => {
  it('detects fallback template explanations', () => {
    expect(isGenericWrongExplanation('"X" is incorrect because the scenario requires: foo')).toBe(true)
    expect(isGenericWrongExplanation('**Drops it** describes a different mechanism than this question tests.')).toBe(true)
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

  it('gold + generator produce distinct flooding distractors without fallback', () => {
    const ar = generateAnswerReview(FLOOD_Q)
    const texts = ar.incorrect.map(i => i.explanation)
    expect(new Set(texts).size).toBe(3)
    texts.forEach(t => expect(isFallbackExplanation(t)).toBe(false))
    expect(scoreAnswerReview({ ...FLOOD_Q, answerReview: ar }).min).toBeGreaterThanOrEqual(3)
  })

  it('assigns choice-specific traps for MAC learning', () => {
    expect(inferTrapForChoice(MAC_Q, 0)).toMatch(/source MAC.*destination MAC/i)
    expect(inferTrapForChoice(MAC_Q, 3)).toMatch(/layer 3|layer 2/i)
  })

  it('resolveIncorrectItem upgrades fallback stored text at runtime', () => {
    const generic = {
      choiceIndex: 0,
      explanation: '**Drops it** describes a different mechanism than this question tests. The right idea: flood.',
      misconceptionTested: 'Picking a familiar term',
    }
    const resolved = resolveIncorrectItem(FLOOD_Q, generic)
    expect(isFallbackExplanation(resolved.explanation)).toBe(false)
    expect(resolved.explanation).toMatch(/drop|flood/i)
  })

  it('generateAnswerReview covers each wrong choice', () => {
    const ar = generateAnswerReview(MAC_Q)
    expect(ar.incorrect).toHaveLength(3)
    const texts = ar.incorrect.map(i => i.explanation)
    expect(new Set(texts).size).toBe(3)
  })
})
