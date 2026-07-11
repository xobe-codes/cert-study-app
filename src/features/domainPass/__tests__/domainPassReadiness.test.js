import { describe, it, expect } from 'vitest'
import { suggestDomainPassNextAction } from '../domainPassReadiness.js'
import { placementDomainIds } from '../../domainPlacement/placementBlueprints.js'

const PLACEMENT_ID = placementDomainIds()[0]

describe('suggestDomainPassNextAction', () => {
  it('gates on baseline for placement domains', () => {
    expect(suggestDomainPassNextAction({ domainId: PLACEMENT_ID, hasBaseline: false }))
      .toBe('Set baseline first')
  })

  it('prefers weak-topic study on retake', () => {
    expect(suggestDomainPassNextAction({
      domainId: PLACEMENT_ID, hasBaseline: true, status: 'retake', weakCount: 2,
    })).toBe('Study 2 weak topics, then retake')
  })

  it('suggests pulse on retake with no weak map', () => {
    expect(suggestDomainPassNextAction({
      domainId: PLACEMENT_ID, hasBaseline: true, status: 'retake', weakCount: 0,
    })).toBe('Pulse traps, then retake')
  })

  it('suggests bank burn when unseen remain', () => {
    expect(suggestDomainPassNextAction({
      domainId: PLACEMENT_ID, hasBaseline: true, status: 'not_started', unseenCount: 12,
    })).toBe('Burn bank — 12 unseen')
  })

  it('suggests maintenance after pass with full coverage', () => {
    expect(suggestDomainPassNextAction({
      domainId: PLACEMENT_ID, hasBaseline: true, status: 'passed', unseenCount: 0,
    })).toBe('Maintain — pulse traps')
  })

  it('defaults to taking the pass', () => {
    expect(suggestDomainPassNextAction({
      domainId: PLACEMENT_ID, hasBaseline: true, status: 'not_started', unseenCount: 0,
    })).toBe('Take the pass')
  })
})
