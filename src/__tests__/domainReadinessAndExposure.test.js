import { describe, it, expect } from 'vitest'
import { buildDomainReadinessLine } from '../home/domainReadiness.js'
import {
  isNearLabComplete,
  matchVerificationCommand,
  primaryVerifyPrompt,
} from '../lab/labVerifyCue.js'
import { domainIdFromObjectiveId } from '../features/domainPass/domainQuestionExposure.js'
import { pickReviewSet } from '../lesson/quizCoverage.js'

describe('domainIdFromObjectiveId', () => {
  it('maps objective prefix to domain id', () => {
    expect(domainIdFromObjectiveId('1.6')).toBe('fundamentals')
    expect(domainIdFromObjectiveId('2.4')).toBe('access')
    expect(domainIdFromObjectiveId('5.3')).toBe('security')
    expect(domainIdFromObjectiveId(null)).toBeNull()
  })
})

describe('buildDomainReadinessLine', () => {
  it('shows No baseline · No pass · Labs when empty', () => {
    expect(buildDomainReadinessLine({
      domainId: 'fundamentals',
      labDone: 0,
      labTotal: 4,
    })).toBe('No baseline · No pass · Labs 0/4')
  })

  it('shows Baseline · Pass · Labs n/m when ready', () => {
    expect(buildDomainReadinessLine({
      domainId: 'access',
      placementRecord: { lastAttempt: { pct: 80 } },
      passRecord: { passed: true, attempts: 1 },
      labDone: 2,
      labTotal: 5,
    })).toBe('Baseline · Pass · Labs 2/5')
  })

  it('shows Retake when pass attempted but not passed', () => {
    expect(buildDomainReadinessLine({
      domainId: 'automation',
      passRecord: { passed: false, attempts: [{ pct: 60 }], lastAt: 1 },
      labDone: 1,
      labTotal: 1,
    })).toBe('No baseline · Retake · Labs 1/1')
  })

  it('dashes baseline for unknown non-placement domain ids', () => {
    expect(buildDomainReadinessLine({
      domainId: 'capstone',
      labDone: 0,
      labTotal: 2,
    })).toBe('— · No pass · Labs 0/2')
  })
})

describe('labVerifyCue', () => {
  const checks = [
    { id: 'v1', device: 'R1', command: 'show ip interface brief', expectedResult: 'up/up' },
    { id: 'v2', device: 'SW1', command: 'show vlan brief', expectedResult: 'VLAN 10' },
  ]

  it('isNearLabComplete when one command left or done', () => {
    expect(isNearLabComplete(4, 5)).toBe(true)
    expect(isNearLabComplete(5, 5)).toBe(true)
    expect(isNearLabComplete(3, 5)).toBe(false)
    expect(isNearLabComplete(0, 0)).toBe(false)
  })

  it('primaryVerifyPrompt returns first check', () => {
    expect(primaryVerifyPrompt(checks)).toEqual({
      id: 'v1',
      device: 'R1',
      command: 'show ip interface brief',
      expectedResult: 'up/up',
    })
    expect(primaryVerifyPrompt([])).toBeNull()
  })

  it('matchVerificationCommand soft-matches normalized show commands', () => {
    expect(matchVerificationCommand('  Show IP Interface Brief ', checks)?.id).toBe('v1')
    expect(matchVerificationCommand('show vlan brief', checks)?.id).toBe('v2')
    expect(matchVerificationCommand('configure terminal', checks)).toBeNull()
  })
})

describe('pickReviewSet preferUnseenIds', () => {
  it('prefers unseen ids without changing session size', () => {
    const banked = [
      { id: 'seen-a', difficulty: 'easy', attempts: [{ correct: true }], ratings: [{ value: 'easy' }] },
      { id: 'seen-b', difficulty: 'easy', attempts: [{ correct: true }], ratings: [{ value: 'easy' }] },
      { id: 'unseen-1', difficulty: 'easy' },
      { id: 'unseen-2', difficulty: 'easy' },
      { id: 'unseen-3', difficulty: 'easy' },
    ]
    const set = pickReviewSet(banked, null, 3, {
      preferUnseenIds: new Set(['unseen-1', 'unseen-2', 'unseen-3']),
    })
    expect(set).toHaveLength(3)
    const unseenPicked = set.filter(q => String(q.id).startsWith('unseen')).length
    expect(unseenPicked).toBeGreaterThanOrEqual(2)
  })
})
