import { describe, it, expect } from 'vitest'
import {
  maskFromCidr,
  octetsToIp,
  wildcardFromMask,
  wildcardFromCidr,
  maskFromWildcard,
  cidrFromWildcard,
  ipMatchesWildcard,
  generateWildcardProblem,
} from '../netUtils.js'

describe('wildcardFromMask / wildcardFromCidr', () => {
  it('inverts /24 mask to 0.0.0.255', () => {
    expect(wildcardFromCidr(24)).toBe('0.0.0.255')
    expect(wildcardFromMask(maskFromCidr(24))).toBe('0.0.0.255')
    expect(wildcardFromMask('255.255.255.0')).toBe('0.0.0.255')
  })

  it('handles /27, /16, /8, /30', () => {
    expect(wildcardFromCidr(27)).toBe('0.0.0.31')
    expect(wildcardFromCidr(16)).toBe('0.0.255.255')
    expect(wildcardFromCidr(8)).toBe('0.255.255.255')
    expect(wildcardFromCidr(30)).toBe('0.0.0.3')
  })

  it('handles /12 (0.15.255.255)', () => {
    expect(wildcardFromCidr(12)).toBe('0.15.255.255')
    expect(wildcardFromMask('255.240.0.0')).toBe('0.15.255.255')
  })
})

describe('maskFromWildcard / cidrFromWildcard', () => {
  it('round-trips dotted wildcard to mask and cidr', () => {
    expect(octetsToIp(maskFromWildcard('0.0.0.255'))).toBe('255.255.255.0')
    expect(cidrFromWildcard('0.0.0.255')).toBe(24)
    expect(cidrFromWildcard([0, 0, 0, 15])).toBe(28)
    expect(octetsToIp(maskFromWildcard([0, 15, 255, 255]))).toBe('255.240.0.0')
  })

  it('round-trips cidr → wildcard → cidr for common prefixes', () => {
    for (const cidr of [8, 12, 16, 24, 25, 27, 28, 30]) {
      expect(cidrFromWildcard(wildcardFromCidr(cidr))).toBe(cidr)
    }
  })
})

describe('ipMatchesWildcard', () => {
  it('matches hosts in a /24 ACL range', () => {
    expect(ipMatchesWildcard('192.168.1.50', '0.0.0.255', '192.168.1.0')).toBe(true)
    expect(ipMatchesWildcard('192.168.2.50', '0.0.0.255', '192.168.1.0')).toBe(false)
  })

  it('exact host match with 0.0.0.0', () => {
    expect(ipMatchesWildcard('10.0.0.1', '0.0.0.0', '10.0.0.1')).toBe(true)
    expect(ipMatchesWildcard('10.0.0.2', '0.0.0.0', '10.0.0.1')).toBe(false)
  })

  it('matches /27 care bits only', () => {
    expect(ipMatchesWildcard('10.1.1.20', '0.0.0.31', '10.1.1.0')).toBe(true)
    expect(ipMatchesWildcard('10.1.1.40', '0.0.0.31', '10.1.1.0')).toBe(false)
  })
})

describe('generateWildcardProblem', () => {
  it('always returns type wildcard with a known kind and steps', () => {
    for (let i = 0; i < 40; i++) {
      const p = generateWildcardProblem()
      expect(p.type).toBe('wildcard')
      expect(['mask-to-wildcard', 'wildcard-to-cidr', 'match-check']).toContain(p.kind)
      expect(p.steps.length).toBeGreaterThanOrEqual(2)
      expect(p.answer).toBeTruthy()
      expect(p.wildcard).toBe(wildcardFromCidr(p.cidr))
    }
  })

  it('mask-to-wildcard answer equals inverse of given mask/cidr', () => {
    const samples = []
    for (let i = 0; i < 80 && samples.length < 5; i++) {
      const p = generateWildcardProblem()
      if (p.kind === 'mask-to-wildcard') samples.push(p)
    }
    expect(samples.length).toBeGreaterThan(0)
    for (const p of samples) {
      expect(p.answer).toBe(wildcardFromCidr(p.cidr))
      expect(p.answer).toBe(wildcardFromMask(p.mask))
    }
  })

  it('wildcard-to-cidr answer matches cidr or mask', () => {
    const samples = []
    for (let i = 0; i < 80 && samples.length < 5; i++) {
      const p = generateWildcardProblem()
      if (p.kind === 'wildcard-to-cidr') samples.push(p)
    }
    expect(samples.length).toBeGreaterThan(0)
    for (const p of samples) {
      expect(cidrFromWildcard(p.wildcard)).toBe(p.cidr)
      if (p.acceptCidr) {
        expect(p.answer).toBe(`/${p.cidr}`)
      } else {
        expect(p.answer).toBe(p.mask)
      }
    }
  })

  it('match-check answer agrees with ipMatchesWildcard', () => {
    const samples = []
    for (let i = 0; i < 100 && samples.length < 10; i++) {
      const p = generateWildcardProblem()
      if (p.kind === 'match-check') samples.push(p)
    }
    expect(samples.length).toBeGreaterThan(0)
    for (const p of samples) {
      const expected = ipMatchesWildcard(p.ip, p.wildcard, p.network)
      expect(p.matches).toBe(expected)
      expect(p.answer).toBe(expected ? 'yes' : 'no')
    }
  })
})
