import { describe, it, expect } from 'vitest'
import { isBannedMechanismLanguage } from '../answerReview/answerReviewQuality.js'

describe('validateMechanismLanguage', () => {
  it('flags mechanism-template phrases', () => {
    expect(isBannedMechanismLanguage('Given static routing, A matches — B applies a different mechanism.')).toBe(true)
    expect(isBannedMechanismLanguage('**VLAN 10** describes a mechanism that could sound plausible for trunking.')).toBe(true)
    expect(isBannedMechanismLanguage('B is incorrect because the scenario requires: forwarding')).toBe(true)
  })

  it('allows stem-specific distractor prose', () => {
    expect(isBannedMechanismLanguage('Down means no Hellos received — not Full adjacency.')).toBe(false)
    expect(isBannedMechanismLanguage('Init sees Hellos but not bidirectional yet — not Full.')).toBe(false)
  })
})
