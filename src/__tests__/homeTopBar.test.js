import { describe, it, expect } from 'vitest'
import {
  streakLastLabel,
  formatStreakLine,
  buildProgressChipLabels,
} from '../home/homeTopBarUtils.js'

describe('streakLastLabel', () => {
  it('returns Today for today', () => {
    const today = new Date().toISOString().slice(0, 10)
    expect(streakLastLabel(today)).toBe('Today')
  })

  it('returns Yesterday for yesterday', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    expect(streakLastLabel(yesterday)).toBe('Yesterday')
  })

  it('returns null for older dates', () => {
    expect(streakLastLabel('2020-01-01')).toBeNull()
    expect(streakLastLabel(null)).toBeNull()
  })
})

describe('formatStreakLine', () => {
  it('returns null when streak is zero or missing', () => {
    expect(formatStreakLine({ count: 0 })).toBeNull()
    expect(formatStreakLine(null)).toBeNull()
  })

  it('formats streak with last-studied label', () => {
    const today = new Date().toISOString().slice(0, 10)
    expect(formatStreakLine({ count: 7, lastStudyDate: today })).toBe('🔥 7-day streak · Last: Today')
  })

  it('omits last label when date is not today or yesterday', () => {
    expect(formatStreakLine({ count: 3, lastStudyDate: '2020-06-01' })).toBe('🔥 3-day streak')
  })

  it('does not include cheer text', () => {
    const line = formatStreakLine({ count: 30, lastStudyDate: '2020-06-01' })
    expect(line).not.toMatch(/fire|legendary|momentum|unstoppable/i)
  })
})

describe('buildProgressChipLabels', () => {
  it('builds mastered, in progress, and not started chips', () => {
    const chips = buildProgressChipLabels({ mastered: 24, inProgress: 18, total: 53 })
    expect(chips.map(c => c.label)).toEqual(['24 mastered', '18 in progress', '11 not started'])
  })

  it('appends offline chip when offlineReady has items', () => {
    const chips = buildProgressChipLabels({ mastered: 1, inProgress: 2, total: 10 }, 4)
    expect(chips.map(c => c.label)).toContain('⤓ 4 offline')
  })

  it('skips offline chip when size is zero', () => {
    const chips = buildProgressChipLabels({ mastered: 0, inProgress: 0, total: 53 }, 0)
    expect(chips).toHaveLength(3)
  })
})
