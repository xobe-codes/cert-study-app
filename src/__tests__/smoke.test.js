import { describe, it, expect } from 'vitest'
import {
  maskFromCidr,
  octetsToIp,
  ipToOctets,
  shuffleArray,
  generateSubnetProblem,
  generateVLSMProblem,
  computeMastery,
  expandIPv6,
  compressIPv6,
} from '../netUtils.js'

// ---------------------------------------------------------------------------
// maskFromCidr / octetsToIp / ipToOctets
// ---------------------------------------------------------------------------
describe('maskFromCidr', () => {
  it('produces 255.255.255.0 for /24', () => {
    expect(octetsToIp(maskFromCidr(24))).toBe('255.255.255.0')
  })
  it('produces 255.255.255.128 for /25', () => {
    expect(octetsToIp(maskFromCidr(25))).toBe('255.255.255.128')
  })
  it('produces 255.0.0.0 for /8', () => {
    expect(octetsToIp(maskFromCidr(8))).toBe('255.0.0.0')
  })
  it('produces 255.255.255.252 for /30', () => {
    expect(octetsToIp(maskFromCidr(30))).toBe('255.255.255.252')
  })
  it('returns an array of 4 octets 0–255', () => {
    const mask = maskFromCidr(20)
    expect(mask).toHaveLength(4)
    mask.forEach(o => {
      expect(o).toBeGreaterThanOrEqual(0)
      expect(o).toBeLessThanOrEqual(255)
    })
  })
})

describe('ipToOctets / octetsToIp roundtrip', () => {
  it('converts 192.168.1.10 to array and back', () => {
    const ip = '192.168.1.10'
    expect(octetsToIp(ipToOctets(ip))).toBe(ip)
  })
})

// ---------------------------------------------------------------------------
// shuffleArray
// ---------------------------------------------------------------------------
describe('shuffleArray', () => {
  it('returns a new array of the same length', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = shuffleArray(arr)
    expect(result).toHaveLength(arr.length)
    expect(result).not.toBe(arr)
  })
  it('contains the same elements as the original', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const result = shuffleArray(arr)
    expect(result.sort((a, b) => a - b)).toEqual(arr.sort((a, b) => a - b))
  })
  it('does not mutate the original array', () => {
    const arr = [1, 2, 3]
    const original = [...arr]
    shuffleArray(arr)
    expect(arr).toEqual(original)
  })
})

// ---------------------------------------------------------------------------
// generateSubnetProblem
// ---------------------------------------------------------------------------
describe('generateSubnetProblem', () => {
  it('returns type "subnet"', () => {
    const p = generateSubnetProblem()
    expect(p.type).toBe('subnet')
  })
  it('returns all required fields', () => {
    const p = generateSubnetProblem()
    expect(p).toHaveProperty('ip')
    expect(p).toHaveProperty('cidr')
    expect(p).toHaveProperty('mask')
    expect(p).toHaveProperty('network')
    expect(p).toHaveProperty('broadcast')
    expect(p).toHaveProperty('usableHosts')
    expect(p).toHaveProperty('steps')
  })
  it('usableHosts matches 2^hostBits - 2', () => {
    const p = generateSubnetProblem()
    const hostBits = 32 - p.cidr
    const expected = Math.max(Math.pow(2, hostBits) - 2, 0)
    expect(p.usableHosts).toBe(expected)
  })
  it('cidr is in range 2–30', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateSubnetProblem()
      expect(p.cidr).toBeGreaterThanOrEqual(2)
      expect(p.cidr).toBeLessThanOrEqual(30)
    }
  })
  it('network address last octet is aligned to the block size', () => {
    const p = generateSubnetProblem()
    const netOctets = ipToOctets(p.network)
    const idx = p.blockSizeOctetIndex
    expect(netOctets[idx] % p.blockSize).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// generateVLSMProblem
// ---------------------------------------------------------------------------
describe('generateVLSMProblem', () => {
  it('returns type "vlsm"', () => {
    const p = generateVLSMProblem()
    expect(p.type).toBe('vlsm')
  })
  it('returns 3 or 4 requirements', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateVLSMProblem()
      expect(p.requirements.length).toBeGreaterThanOrEqual(3)
      expect(p.requirements.length).toBeLessThanOrEqual(4)
    }
  })
  it('allocations count matches sorted requirements', () => {
    const p = generateVLSMProblem()
    expect(p.allocations).toHaveLength(p.requirements.length)
  })
  it('each allocation fits its hostsNeeded within usableHosts', () => {
    const p = generateVLSMProblem()
    p.allocations.forEach(a => {
      expect(a.usableHosts).toBeGreaterThanOrEqual(a.hostsNeeded)
    })
  })
  it('baseNetwork ends in /24', () => {
    const p = generateVLSMProblem()
    expect(p.baseNetwork).toMatch(/\/24$/)
  })
})

// ---------------------------------------------------------------------------
// computeMastery
// ---------------------------------------------------------------------------
describe('computeMastery', () => {
  it('returns score 0 and mastered false for null entry', () => {
    expect(computeMastery(null)).toEqual({ score: 0, mastered: false })
  })
  it('returns score 0 for empty quizScores', () => {
    expect(computeMastery({ quizScores: [] })).toEqual({ score: 0, mastered: false })
  })
  it('returns mastered:true for high accuracy + strong confidence + session ≥3', () => {
    const entry = {
      quizScores: [{ score: 5, total: 5 }, { score: 5, total: 5 }, { score: 4, total: 5 }],
      confidenceRatings: ['easy', 'easy'],
    }
    const { score, mastered } = computeMastery(entry)
    expect(mastered).toBe(true)
    expect(score).toBeGreaterThan(0.8)
  })
  it('returns mastered:false for low accuracy', () => {
    const entry = {
      quizScores: [{ score: 2, total: 10 }],
      confidenceRatings: ['easy'],
    }
    const { mastered } = computeMastery(entry)
    expect(mastered).toBe(false)
  })
  it('score is in 0–1 range', () => {
    const entry = {
      quizScores: [{ score: 3, total: 5 }],
      confidenceRatings: ['medium'],
    }
    const { score } = computeMastery(entry)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(1)
  })
  it('only uses last 3 quiz sessions (recency weighting)', () => {
    const high = { score: 5, total: 5 }
    const low = { score: 0, total: 5 }
    const entry = {
      // First 5 are old and low — last 3 are perfect
      quizScores: [low, low, low, low, low, high, high, high],
      confidenceRatings: ['easy'],
    }
    const { score } = computeMastery(entry)
    // Recent 3 are all perfect, so acc = 1.0
    expect(score).toBeGreaterThan(0.8)
  })
})

// ---------------------------------------------------------------------------
// expandIPv6 / compressIPv6
// ---------------------------------------------------------------------------
describe('expandIPv6', () => {
  it('expands a fully specified address', () => {
    expect(expandIPv6('2001:0db8:0000:0000:0000:0000:0000:0001'))
      .toBe('2001:0db8:0000:0000:0000:0000:0000:0001')
  })
  it('expands :: shorthand (loopback)', () => {
    expect(expandIPv6('::1')).toBe('0000:0000:0000:0000:0000:0000:0000:0001')
  })
  it('expands :: alone (all-zeros)', () => {
    expect(expandIPv6('::')).toBe('0000:0000:0000:0000:0000:0000:0000:0000')
  })
  it('expands 2001:db8:: prefix', () => {
    expect(expandIPv6('2001:db8::')).toBe('2001:0db8:0000:0000:0000:0000:0000:0000')
  })
  it('pads short groups to 4 hex digits', () => {
    const expanded = expandIPv6('2001:db8::1')
    expanded.split(':').forEach(g => expect(g).toHaveLength(4))
  })
  it('produces exactly 8 groups', () => {
    const expanded = expandIPv6('fe80::1')
    expect(expanded.split(':')).toHaveLength(8)
  })
})

describe('compressIPv6', () => {
  it('compresses loopback', () => {
    expect(compressIPv6('0000:0000:0000:0000:0000:0000:0000:0001')).toBe('::1')
  })
  it('compresses all-zeros', () => {
    expect(compressIPv6('0000:0000:0000:0000:0000:0000:0000:0000')).toBe('::')
  })
  it('removes leading zeros within groups', () => {
    const result = compressIPv6('2001:0db8:0000:0000:0000:0000:0000:0001')
    expect(result).toContain('2001')
    expect(result).toContain('db8')
    expect(result).not.toContain('0db8')
  })
  it('expand→compress roundtrip for a typical address', () => {
    const original = '2001:db8::1'
    const roundTripped = compressIPv6(expandIPv6(original).toLowerCase())
    expect(roundTripped).toBe(original)
  })
  it('expand→compress roundtrip for fe80::1', () => {
    const roundTripped = compressIPv6(expandIPv6('fe80::1').toLowerCase())
    expect(roundTripped).toBe('fe80::1')
  })
})
