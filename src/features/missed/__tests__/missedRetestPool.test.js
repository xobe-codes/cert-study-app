import { describe, it, expect } from 'vitest'
import {
  MISSED_RETEST_CLEAR_CAP,
  MISSED_RETEST_PROVE_UNLOCK_MAX,
  dedupeMissedByQuestionId,
  buildMissedRetestPool,
} from '../missedRetestPool.js'

const DAY_MS = 24 * 60 * 60 * 1000
// Anchor well within a single local calendar day, away from midnight boundaries,
// so date-math in the tests can't accidentally cross a day edge.
const BASE = new Date(2024, 0, 10, 12, 0, 0, 0).getTime()

function mkMissed({ questionId, id, addedAt, misconceptionTested, objectiveId = '1.1', selectedIndex }) {
  return {
    ...(questionId !== undefined ? { questionId } : {}),
    ...(id !== undefined ? { id } : {}),
    addedAt,
    misconceptionTested,
    objectiveId,
    ...(selectedIndex !== undefined ? { selectedIndex } : {}),
  }
}

describe('constants', () => {
  it('exposes the spec caps', () => {
    expect(MISSED_RETEST_CLEAR_CAP).toBe(15)
    expect(MISSED_RETEST_PROVE_UNLOCK_MAX).toBe(30)
  })
})

describe('dedupeMissedByQuestionId', () => {
  it('keeps the most recent occurrence when a question appears 2+ times', () => {
    const missed = [
      mkMissed({ questionId: 'q1', addedAt: BASE, selectedIndex: 0 }),
      mkMissed({ questionId: 'q1', addedAt: BASE + 5000, selectedIndex: 2 }),
      mkMissed({ questionId: 'q1', addedAt: BASE + 1000, selectedIndex: 1 }),
    ]
    const result = dedupeMissedByQuestionId(missed)
    expect(result).toHaveLength(1)
    expect(result[0].addedAt).toBe(BASE + 5000)
    expect(result[0].selectedIndex).toBe(2)
  })

  it('falls back to id when questionId is absent', () => {
    const missed = [
      mkMissed({ id: 'legacy1', addedAt: BASE }),
      mkMissed({ id: 'legacy1', addedAt: BASE + 2000 }),
    ]
    const result = dedupeMissedByQuestionId(missed)
    expect(result).toHaveLength(1)
    expect(result[0].addedAt).toBe(BASE + 2000)
  })

  it('leaves distinct questions untouched', () => {
    const missed = [
      mkMissed({ questionId: 'q1', addedAt: BASE }),
      mkMissed({ questionId: 'q2', addedAt: BASE + 1000 }),
    ]
    expect(dedupeMissedByQuestionId(missed)).toHaveLength(2)
  })

  it('handles an empty array without throwing', () => {
    expect(dedupeMissedByQuestionId([])).toEqual([])
    expect(dedupeMissedByQuestionId(undefined)).toEqual([])
  })
})

describe('buildMissedRetestPool ordering', () => {
  it('orders oldest-missed-first by addedAt', () => {
    const missed = [
      mkMissed({ questionId: 'q3', addedAt: BASE + 20 * DAY_MS }),
      mkMissed({ questionId: 'q1', addedAt: BASE }),
      mkMissed({ questionId: 'q2', addedAt: BASE + 10 * DAY_MS }),
    ]
    const pool = buildMissedRetestPool({ missed, shuffle: arr => [...arr] })
    expect(pool.map(m => m.questionId)).toEqual(['q1', 'q2', 'q3'])
  })

  it('shuffles within same-day tiers but keeps day-groups ascending', () => {
    const sameDayA = [
      mkMissed({ questionId: 'a1', addedAt: BASE }),
      mkMissed({ questionId: 'a2', addedAt: BASE + 1000 }),
      mkMissed({ questionId: 'a3', addedAt: BASE + 2000 }),
    ]
    const sameDayB = [
      mkMissed({ questionId: 'b1', addedAt: BASE + 5 * DAY_MS }),
      mkMissed({ questionId: 'b2', addedAt: BASE + 5 * DAY_MS + 1000 }),
    ]
    const missed = [...sameDayA, ...sameDayB]
    // Reverse each tier so we can prove shuffle is actually invoked per-tier.
    const reverseShuffle = arr => [...arr].reverse()
    const pool = buildMissedRetestPool({ missed, shuffle: reverseShuffle })
    expect(pool.map(m => m.questionId)).toEqual(['a3', 'a2', 'a1', 'b2', 'b1'])
  })
})

describe('buildMissedRetestPool capping', () => {
  it('truncates to count', () => {
    const missed = Array.from({ length: 20 }, (_, i) =>
      mkMissed({ questionId: `q${i}`, addedAt: BASE + i * DAY_MS }),
    )
    const pool = buildMissedRetestPool({ missed, count: MISSED_RETEST_CLEAR_CAP, shuffle: arr => [...arr] })
    expect(pool).toHaveLength(MISSED_RETEST_CLEAR_CAP)
    expect(pool.map(m => m.questionId)).toEqual(
      Array.from({ length: MISSED_RETEST_CLEAR_CAP }, (_, i) => `q${i}`),
    )
  })

  it('applies no cap when count is null', () => {
    const missed = Array.from({ length: 40 }, (_, i) =>
      mkMissed({ questionId: `q${i}`, addedAt: BASE + i * DAY_MS }),
    )
    const pool = buildMissedRetestPool({ missed, count: null, shuffle: arr => [...arr] })
    expect(pool).toHaveLength(40)
  })

  it('applies no cap when count is undefined and mode is not clear', () => {
    const missed = Array.from({ length: 5 }, (_, i) =>
      mkMissed({ questionId: `q${i}`, addedAt: BASE + i * DAY_MS }),
    )
    const pool = buildMissedRetestPool({ missed, mode: 'prove', shuffle: arr => [...arr] })
    expect(pool).toHaveLength(5)
  })
})

describe('buildMissedRetestPool trapFilter', () => {
  it('scopes to one trap group via groupMissedByTrap', () => {
    const missed = [
      mkMissed({ questionId: 'q1', addedAt: BASE, misconceptionTested: 'VLAN trunking confusion' }),
      mkMissed({ questionId: 'q2', addedAt: BASE + DAY_MS, misconceptionTested: 'VLAN trunking confusion' }),
      mkMissed({ questionId: 'q3', addedAt: BASE + 2 * DAY_MS, misconceptionTested: 'Subnet mask math slip' }),
    ]
    const pool = buildMissedRetestPool({
      missed,
      trapFilter: 'VLAN trunking confusion',
      shuffle: arr => [...arr],
    })
    expect(pool.map(m => m.questionId).sort()).toEqual(['q1', 'q2'])
  })

  it('returns empty when the trap label matches nothing', () => {
    const missed = [
      mkMissed({ questionId: 'q1', addedAt: BASE, misconceptionTested: 'VLAN trunking confusion' }),
    ]
    const pool = buildMissedRetestPool({ missed, trapFilter: 'Nonexistent trap', shuffle: arr => [...arr] })
    expect(pool).toEqual([])
  })
})

describe('buildMissedRetestPool empty input', () => {
  it('returns an empty pool without throwing', () => {
    expect(buildMissedRetestPool({ missed: [] })).toEqual([])
    expect(buildMissedRetestPool({ missed: undefined })).toEqual([])
    expect(buildMissedRetestPool({})).toEqual([])
  })
})
