import { describe, it, expect } from 'vitest'
import { validateCleanQuestion, shelvedRecord } from '../../scripts/lib/cleanBankUtils.mjs'

function multiFixture(overrides = {}) {
  return {
    id: '2.1-multi-vlan-svi',
    type: 'multi',
    question: 'Which statements about VLANs and SVIs are true? (Choose 2.)',
    choices: [
      'An SVI is a Layer 3 gateway for a VLAN',
      'Access ports belong to one VLAN',
      'Creating a VLAN auto-assigns every port',
      'SVIs require VTP transparent mode',
    ],
    correctIndexes: [0, 1],
    explanation: 'SVI = L3 for VLAN; access = one VLAN.',
    answerReview: {
      correct: { choiceIndex: 0, explanation: 'SVI = L3 for VLAN; access = one VLAN.' },
      incorrect: [
        { choiceIndex: 2, explanation: 'Ports are not auto-assigned.', misconceptionTested: 'auto-assign' },
        { choiceIndex: 3, explanation: 'VTP mode unrelated.', misconceptionTested: 'vtp' },
      ],
      examTip: 'VLAN + SVI pairing.',
    },
    ...overrides,
  }
}

describe('validateCleanQuestion multi support', () => {
  it('accepts a valid multi question without correctIndex', () => {
    expect(validateCleanQuestion(multiFixture(), '2.1')).toEqual([])
  })

  it('rejects multi with fewer than two correctIndexes', () => {
    const errors = validateCleanQuestion(multiFixture({ correctIndexes: [0] }), '2.1')
    expect(errors.some(e => /correctIndexes length >= 2/.test(e))).toBe(true)
  })

  it('rejects multi with out-of-range or duplicate indexes', () => {
    const oob = validateCleanQuestion(multiFixture({ correctIndexes: [0, 9] }), '2.1')
    expect(oob.some(e => /invalid correctIndexes/.test(e))).toBe(true)
    const dup = validateCleanQuestion(multiFixture({ correctIndexes: [0, 0] }), '2.1')
    expect(dup.some(e => /duplicate correctIndexes/.test(e))).toBe(true)
  })

  it('requires answerReview incorrect for every non-correct choice', () => {
    const errors = validateCleanQuestion(
      multiFixture({
        answerReview: {
          correct: { choiceIndex: 0, explanation: 'ok' },
          incorrect: [{ choiceIndex: 2, explanation: 'only one wrong' }],
        },
      }),
      '2.1',
    )
    expect(errors.some(e => /missing incorrect for choiceIndex 3/.test(e))).toBe(true)
  })

  it('shelvedRecord includes correctIndexes when present', () => {
    const rec = shelvedRecord(multiFixture(), '2.1', 'review')
    expect(rec.correctIndexes).toEqual([0, 1])
  })
})
