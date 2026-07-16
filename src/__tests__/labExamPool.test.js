import { describe, it, expect } from 'vitest'
import { getLab } from '../data/ccnaLabs.js'
import {
  QUICK_LAB_EXAM_STATIONS,
  QUICK_LAB_EXAM_MINUTES,
  LAB_EXAM_PASS_PCT,
  buildQuickLabExamStations,
  scoreLabStation,
  aggregateLabExamScore,
} from '../features/labExam/quickLabExamPool.js'

describe('quickLabExamPool constants', () => {
  it('exposes the quick exam defaults', () => {
    expect(QUICK_LAB_EXAM_STATIONS).toHaveLength(6)
    expect(QUICK_LAB_EXAM_MINUTES).toBe(25)
    expect(LAB_EXAM_PASS_PCT).toBe(70)
  })
})

describe('buildQuickLabExamStations', () => {
  it('returns metadata for valid labs only', () => {
    const stations = buildQuickLabExamStations(getLab)
    expect(stations.length).toBe(QUICK_LAB_EXAM_STATIONS.length)
    for (const s of stations) {
      expect(s.labId).toBeTruthy()
      expect(s.objectiveId).toBeTruthy()
      expect(s.title).toBeTruthy()
      expect(s.domainId).toBeTruthy()
    }
  })

  it('skips missing lab ids from injected getLab', () => {
    const mockGetLab = (labId) => {
      if (labId === 'LAB-NAT-PAT') {
        return { lab: { objectiveId: '4.1', title: 'NAT PAT', domainId: 'ip-services' } }
      }
      return null
    }
    const stations = buildQuickLabExamStations(mockGetLab)
    expect(stations).toEqual([{
      labId: 'LAB-NAT-PAT',
      objectiveId: '4.1',
      title: 'NAT PAT',
      domainId: 'ip-services',
    }])
  })
})

describe('scoreLabStation', () => {
  it('returns 100 when complete', () => {
    expect(scoreLabStation({ done: ['a'], total: 3, complete: true })).toBe(100)
  })

  it('returns partial percent from done/total', () => {
    expect(scoreLabStation({ done: ['a', 'b'], total: 4, complete: false })).toBe(50)
  })

  it('returns 0 when nothing done', () => {
    expect(scoreLabStation({ done: [], total: 5, complete: false })).toBe(0)
    expect(scoreLabStation({ done: [], total: 0, complete: false })).toBe(0)
  })
})

describe('aggregateLabExamScore', () => {
  it('averages station scores and marks pass at 70%', () => {
    const result = aggregateLabExamScore([100, 80, 60, 40])
    expect(result.pct).toBe(70)
    expect(result.pass).toBe(true)
    expect(result.stationScores).toEqual([100, 80, 60, 40])
  })

  it('marks fail below 70%', () => {
    const result = aggregateLabExamScore([100, 50, 0])
    expect(result.pct).toBe(50)
    expect(result.pass).toBe(false)
  })

  it('handles empty input', () => {
    expect(aggregateLabExamScore([])).toEqual({ pct: 0, pass: false, stationScores: [] })
  })
})
