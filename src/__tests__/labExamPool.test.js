import { describe, it, expect } from 'vitest'
import { getLab } from '../data/ccnaLabs.js'
import {
  QUICK_LAB_EXAM_STATIONS,
  FULL_LAB_EXAM_STATIONS,
  DOMAIN_LAB_EXAM_POOLS,
  QUICK_LAB_EXAM_MINUTES,
  FULL_LAB_EXAM_MINUTES,
  DOMAIN_LAB_EXAM_MINUTES,
  LAB_EXAM_PASS_PCT,
  buildLabExamStations,
  buildQuickLabExamStations,
  scoreLabStation,
  aggregateLabExamScore,
} from '../features/labExam/quickLabExamPool.js'

describe('quickLabExamPool constants', () => {
  it('exposes the quick exam defaults', () => {
    expect(QUICK_LAB_EXAM_STATIONS).toHaveLength(6)
    expect(FULL_LAB_EXAM_STATIONS).toHaveLength(12)
    expect(QUICK_LAB_EXAM_MINUTES).toBe(25)
    expect(FULL_LAB_EXAM_MINUTES).toBe(55)
    expect(DOMAIN_LAB_EXAM_MINUTES).toBe(30)
    expect(LAB_EXAM_PASS_PCT).toBe(70)
  })

  it('builds the curated full exam and six-station domain exams', () => {
    const full = buildLabExamStations({ mode: 'full', getLabFn: getLab })
    expect(full).toHaveLength(FULL_LAB_EXAM_STATIONS.length)

    for (const [domainId, pool] of Object.entries(DOMAIN_LAB_EXAM_POOLS)) {
      const stations = buildLabExamStations({ mode: 'domain', domainId, getLabFn: getLab })
      expect(stations).toHaveLength(pool.length)
      expect(stations).toHaveLength(6)
      expect(stations.every(station => station.domainId === domainId)).toBe(true)
    }
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
