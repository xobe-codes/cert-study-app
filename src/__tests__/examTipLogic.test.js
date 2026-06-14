import { describe, it, expect } from 'vitest'
import {
  examTipFor,
  isGenericExamTip,
  resolvePrimaryCkuExamTip,
  GENERIC_EXAM_TIP_RE,
} from '../answerReview/examTipLogic.js'

const MAC_Q = {
  id: '1.5-c-q1',
  question: 'When a switch learns a MAC address, which address does it record?',
  choices: ['Destination MAC', 'Source MAC', 'Both', 'Neither'],
  correctIndex: 1,
  explanation: 'Switches learn from the SOURCE MAC on the ingress port.',
  concept: 'mac learning',
}

const NAT_Q = {
  id: 'nat-q1',
  question: 'Which NAT type uses overload on a single public IP?',
  choices: ['Static NAT', 'Dynamic NAT', 'PAT', 'NAT64'],
  correctIndex: 2,
  explanation: 'PAT (overload) maps many inside hosts to one outside IP using unique ports.',
  concept: 'pat overload',
}

const ORDERING_Q = {
  id: 'order-q1',
  type: 'ordering',
  question: 'Put these cable installation steps in the correct order.',
  orderItems: ['Measure', 'Cut', 'Terminate', 'Test'],
  concept: 'cabling workflow',
}

const FLOOD_Q = {
  question: 'Unknown unicast destination — what does the switch do?',
  concept: 'flooding',
  ckuIds: ['CKU-FRAME-FLOODING'],
}

describe('examTipLogic', () => {
  it('flags generic template tips', () => {
    expect(isGenericExamTip('Eliminate answers that describe a different protocol, port, or command.')).toBe(true)
    expect(isGenericExamTip('')).toBe(true)
    expect(isGenericExamTip(null)).toBe(true)
    expect(isGenericExamTip('Switches learn source MACs on ingress — not destination.')).toBe(false)
    expect(GENERIC_EXAM_TIP_RE.length).toBeGreaterThan(0)
  })

  it('builds stem-aware MAC learning tip', () => {
    const tip = examTipFor(MAC_Q)
    expect(tip).toMatch(/source MAC/i)
    expect(tip).toMatch(/destination MAC/i)
    expect(isGenericExamTip(tip)).toBe(false)
  })

  it('builds concept-aware PAT tip', () => {
    const tip = examTipFor(NAT_Q)
    expect(tip).toMatch(/overload|PAT/i)
    expect(isGenericExamTip(tip)).toBe(false)
  })

  it('builds type-aware ordering tip', () => {
    const tip = examTipFor(ORDERING_Q)
    expect(tip).toMatch(/ordering|sequence/i)
    expect(isGenericExamTip(tip)).toBe(false)
  })

  it('resolvePrimaryCkuExamTip uses CKU trap index when present', () => {
    const tip = resolvePrimaryCkuExamTip(FLOOD_Q)
    expect(tip).toMatch(/^On the exam:/)
    expect(isGenericExamTip(tip)).toBe(false)
  })

  it('returns null CKU tip when no traps linked', () => {
    expect(resolvePrimaryCkuExamTip({ ckuIds: [] })).toBeNull()
    expect(resolvePrimaryCkuExamTip({ ckuIds: ['UNKNOWN-CKU'] })).toBeNull()
  })
})
