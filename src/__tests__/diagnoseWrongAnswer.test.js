import { describe, it, expect } from 'vitest'
import { diagnoseWrongAnswer } from '../answerReview/diagnoseWrongAnswer.js'

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
  ckuIds: ['CKU-MAC-LEARNING'],
}

const MULTI_Q = {
  id: '1.5-c-multi1',
  type: 'multi',
  question: 'Which of the following are true of switch MAC learning? (Select two)',
  choices: [
    'Switches learn the source MAC of incoming frames',
    'Switches learn the destination MAC of incoming frames',
    'Switches flood unknown-unicast frames',
    'Switches route between VLANs by default',
  ],
  correctIndexes: [0, 2],
  explanation: 'Switches learn source MACs and flood unknown-unicast frames.',
  concept: 'mac learning',
}

const ORDER_Q = {
  id: '1.5-c-order1',
  type: 'ordering',
  question: 'Put the switch boot sequence in order.',
  orderItems: ['POST', 'Load bootloader', 'Load IOS', 'Load startup-config'],
}

const CLI_Q = {
  id: '1.5-c-cli1',
  type: 'cli',
  question: 'Enter the command to assign an IP address to an interface.',
  answers: ['ip address 10.0.0.1 255.255.255.0'],
}

describe('diagnoseWrongAnswer', () => {
  it('returns null for a correct MC answer', () => {
    expect(diagnoseWrongAnswer({ question: MAC_Q, submittedAnswer: 1, gradeResult: true })).toBeNull()
  })

  it('returns null when gradeResult is a rich object marked correct', () => {
    expect(diagnoseWrongAnswer({ question: MAC_Q, submittedAnswer: 1, gradeResult: { correct: true } })).toBeNull()
  })

  it('diagnoses a wrong MC choice using the existing answer-review resolution chain', () => {
    const d = diagnoseWrongAnswer({ question: MAC_Q, submittedAnswer: 0, gradeResult: false })
    expect(d).toBeTruthy()
    expect(d.schemaVersion).toBe(1)
    expect(d.errorClass).toBe('concept-confusion')
    expect(typeof d.misconceptionLabel).toBe('string')
    expect(d.misconceptionLabel.length).toBeGreaterThan(0)
    expect(d.ckuIds).toEqual(['CKU-MAC-LEARNING'])
    expect(['explicit-diagnostic', 'generated-fallback']).toContain(d.source)
  })

  it('does not crash and returns a limited diagnosis when metadata is absent', () => {
    const bare = { id: 'bare-1', question: 'Pick one.', choices: ['A', 'B'], correctIndex: 0 }
    const d = diagnoseWrongAnswer({ question: bare, submittedAnswer: 1, gradeResult: false })
    expect(d).toBeTruthy()
    expect(d.schemaVersion).toBe(1)
  })

  it('handles missing/unknown question shape without throwing', () => {
    expect(diagnoseWrongAnswer({ question: null, submittedAnswer: 1, gradeResult: false })).toBeNull()
    expect(diagnoseWrongAnswer({ question: {}, submittedAnswer: 1, gradeResult: false })).toBeNull()
  })

  it('distinguishes selected-wrong from omitted-correct on multi-select', () => {
    const d = diagnoseWrongAnswer({ question: MULTI_Q, submittedAnswer: [0, 1], gradeResult: false })
    expect(d).toBeTruthy()
    expect(d.selectedWrongChoiceIndexes).toEqual([1])
    expect(d.omittedCorrectChoiceIndexes).toEqual([2])
    expect(d.errorClass).toBe('mixed-selection')
  })

  it('classifies a pure omission (no wrong picks) as incomplete-selection', () => {
    const d = diagnoseWrongAnswer({ question: MULTI_Q, submittedAnswer: [0], gradeResult: false })
    expect(d.errorClass).toBe('incomplete-selection')
    expect(d.selectedWrongChoiceIndexes).toEqual([])
    expect(d.omittedCorrectChoiceIndexes).toEqual([2])
  })

  it('classifies a pure false-positive selection', () => {
    const d = diagnoseWrongAnswer({ question: MULTI_Q, submittedAnswer: [0, 2, 1], gradeResult: false })
    expect(d.errorClass).toBe('false-positive-selection')
    expect(d.selectedWrongChoiceIndexes).toEqual([1])
    expect(d.omittedCorrectChoiceIndexes).toEqual([])
  })

  it('identifies the first invalid transition on an ordering miss', () => {
    const given = ['POST', 'Load IOS', 'Load bootloader', 'Load startup-config']
    const d = diagnoseWrongAnswer({ question: ORDER_Q, submittedAnswer: given, gradeResult: false })
    expect(d.errorClass).toBe('sequence-error')
    expect(d.firstInvalidStep).toBe(2)
    expect(d.misconceptionLabel).toMatch(/Step 2/)
  })

  it('handles ordering answers wrapped in an {order} object', () => {
    const given = { order: ['Load bootloader', 'POST', 'Load IOS', 'Load startup-config'] }
    const d = diagnoseWrongAnswer({ question: ORDER_Q, submittedAnswer: given, gradeResult: false })
    expect(d.firstInvalidStep).toBe(1)
  })

  it('returns a clearly-labeled limited diagnosis for CLI misses (grader is pass/fail only)', () => {
    const d = diagnoseWrongAnswer({ question: CLI_Q, submittedAnswer: 'ip addr 10.0.0.1 255.255.255.0', gradeResult: false })
    expect(d.errorClass).toBe('cli-mismatch')
    expect(d.source).toBe('limited')
    expect(d.misconceptionLabel).toBeNull()
  })

  it('never throws when optional fields are missing from a multi question', () => {
    const bareMulti = { id: 'm2', type: 'multi', choices: ['a', 'b', 'c'], correctIndexes: [0, 1] }
    expect(() => diagnoseWrongAnswer({ question: bareMulti, submittedAnswer: [2], gradeResult: false })).not.toThrow()
  })
})
