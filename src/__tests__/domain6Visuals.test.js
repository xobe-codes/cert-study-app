import { describe, it, expect } from 'vitest'
import {
  VISUAL_DIAGRAMS,
  DOMAIN6_VISUAL_OBJECTIVES,
  getDomain6VisualCoverage,
  getAllDomainVisualCoverage,
  ALL_VISUAL_OBJECTIVES,
} from '../data/visualDiagramSupplement.js'
import { getCurated } from '../data/ccnaCurated.js'
import { pickResumeStudyObjective, resumeStudyHandoff, pickDomainLessonObjective } from '../home/resumeStudy.js'
import { DOMAINS } from '../data/ccnaDomains.js'
import { parseAppHash } from '../routing/appHashRouting.js'

describe('all-domain visual packs', () => {
  it('covers every exam objective with diagram + compare + traps + flow', () => {
    const coverage = getAllDomainVisualCoverage()
    expect(coverage.ok, JSON.stringify(coverage.missing)).toBe(true)
    expect(coverage.covered).toBe(53)
  })

  it('keeps Domain 6 gold packs', () => {
    expect(getDomain6VisualCoverage().ok).toBe(true)
    for (const id of DOMAIN6_VISUAL_OBJECTIVES) {
      expect(VISUAL_DIAGRAMS[id].nodes.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('getCurated merges packs for sample objectives across domains', () => {
    for (const id of ['1.6', '2.5', '3.2', '4.1', '5.5', '6.4']) {
      const c = getCurated(id)
      expect(c.diagram?.nodes?.length, id).toBeGreaterThanOrEqual(3)
      expect(c.visualCompare, id).toBeTruthy()
      expect(c.visualTraps?.length, id).toBeGreaterThanOrEqual(2)
      expect(c.packetFlow?.steps?.length, id).toBeGreaterThanOrEqual(3)
    }
  })

  it('lists all objective ids', () => {
    expect(ALL_VISUAL_OBJECTIVES).toHaveLength(53)
  })
})

describe('lesson access helpers', () => {
  it('resumeStudyHandoff picks latest lastSeen into Study', () => {
    const handoff = resumeStudyHandoff({
      '1.1': { lastSeen: 100 },
      '3.2': { lastSeen: 500 },
      '2.1': { lastSeen: 200 },
    })
    expect(handoff.id).toBe('3.2')
    expect(handoff.__initialTab).toBe('Study')
  })

  it('pickResumeStudyObjective returns null when empty', () => {
    expect(pickResumeStudyObjective({})).toBeNull()
  })

  it('pickDomainLessonObjective opens Study', () => {
    const handoff = pickDomainLessonObjective(DOMAINS[0], {})
    expect(handoff.__initialTab).toBe('Study')
    expect(handoff.id).toBe(DOMAINS[0].objectives[0].id)
  })

  it('parseAppHash supports #/study/:id alias', () => {
    globalThis.window = {
      location: { hash: '#/study/3.2', pathname: '/', search: '' },
      history: { replaceState() {} },
    }
    const route = parseAppHash()
    expect(route?.view).toBe('objective')
    expect(route?.objective?.id).toBe('3.2')
    expect(route?.objective?.__initialTab).toBe('Study')
  })
})
