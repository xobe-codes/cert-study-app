import { describe, it, expect } from 'vitest'
import { COMMAND_SPRINT_PACKS, getSprintPack, listSprintPacks, labIdForSprintPack } from '../commands/commandSprintPacks.js'
import {
  buildSprintSession,
  gradeSprintQuestion,
  sprintSessionSummary,
  sprintPackAvailability,
} from '../commands/commandSprintQuiz.js'

describe('commandSprintPacks', () => {
  it('covers domains 1–6 with curated packs', () => {
    const domains = new Set(COMMAND_SPRINT_PACKS.map(p => p.domainId))
    expect(domains.has('fundamentals')).toBe(true)
    expect(domains.has('access')).toBe(true)
    expect(domains.has('connectivity')).toBe(true)
    expect(domains.has('services')).toBe(true)
    expect(domains.has('security')).toBe(true)
    expect(domains.has('automation')).toBe(true)
  })

  it('filters packs by domain', () => {
    const access = listSprintPacks({ domainId: 'access' })
    expect(access.length).toBeGreaterThan(0)
    expect(access.every(p => p.domainId === 'access')).toBe(true)
  })

  it('maps pack ids to optional labs', () => {
    expect(labIdForSprintPack('sprint-ospf')).toBe('LAB-OSPF-SINGLE-AREA')
    expect(labIdForSprintPack('sprint-acl')).toBeNull()
  })
})

describe('commandSprintQuiz', () => {
  it('builds a non-empty session for every ready pack', () => {
    const ready = sprintPackAvailability()
    expect(ready.length).toBeGreaterThanOrEqual(8)
    for (const pack of ready) {
      const session = buildSprintSession(pack)
      expect(session.length, pack.id).toBeGreaterThanOrEqual(2)
      expect(session.every(q => q.type === 'type_command')).toBe(true)
      expect(session.every(q => q.sprintPackId === pack.id)).toBe(true)
    }
  })

  it('grades shorthand answers on sprint items', () => {
    const pack = getSprintPack('sprint-static-route')
    const session = buildSprintSession(pack)
    expect(session.length).toBeGreaterThan(0)
    const q = session[0]
    expect(gradeSprintQuestion(q, q.displayAnswer)).toBe(true)
    expect(gradeSprintQuestion(q, 'not-a-real-command-xyz')).toBe(false)
  })

  it('summarizes session results', () => {
    expect(sprintSessionSummary([{ correct: true }, { correct: false }, { correct: true }])).toEqual({
      total: 3,
      correct: 2,
      pct: 67,
    })
  })

  it('keeps stable objective order by default', () => {
    const session = buildSprintSession('sprint-vlan-access')
    const oids = session.map(q => q.objectiveId)
    const sorted = [...oids].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    expect(oids).toEqual(sorted)
  })
})
