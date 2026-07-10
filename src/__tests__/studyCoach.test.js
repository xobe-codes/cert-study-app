import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  shouldSuggestStudyFirst,
  shouldSuggestRefreshStudy,
  resolveCoachStatus,
  pickFailureMode,
  whyForFailureMode,
  pickCoachObjectiveNext,
  todayDateKey,
  isStudyCoachDismissedToday,
  dismissStudyCoachToday,
} from '../home/studyCoach.js'
import { pickStudyNext, generateLocalSuggestions } from '../home/learnerHome.js'
import { buildWeakAreaRows } from '../features/home/weakAreaDashboard.js'
import { STORAGE_KEYS } from '../storageKeys.js'

describe('shouldSuggestStudyFirst', () => {
  it('suggests for unseen with reading when not dismissed', () => {
    expect(shouldSuggestStudyFirst({ status: 'unseen', hasReading: true, dismissed: false })).toBe(true)
  })

  it('does not suggest when dismissed, no reading, or already studied', () => {
    expect(shouldSuggestStudyFirst({ status: 'unseen', hasReading: true, dismissed: true })).toBe(false)
    expect(shouldSuggestStudyFirst({ status: 'unseen', hasReading: false, dismissed: false })).toBe(false)
    expect(shouldSuggestStudyFirst({ status: 'in_progress', hasReading: true, dismissed: false })).toBe(false)
    expect(shouldSuggestStudyFirst({ status: 'mastered', hasReading: true, dismissed: false })).toBe(false)
  })
})

describe('shouldSuggestRefreshStudy', () => {
  it('suggests optional refresh for in_progress/mastered with reading', () => {
    expect(shouldSuggestRefreshStudy({ status: 'in_progress', hasReading: true, dismissed: false })).toBe(true)
    expect(shouldSuggestRefreshStudy({ status: 'mastered', hasReading: true, dismissed: false })).toBe(true)
  })

  it('does not suggest for unseen or dismissed', () => {
    expect(shouldSuggestRefreshStudy({ status: 'unseen', hasReading: true, dismissed: false })).toBe(false)
    expect(shouldSuggestRefreshStudy({ status: 'in_progress', hasReading: true, dismissed: true })).toBe(false)
  })
})

describe('resolveCoachStatus', () => {
  it('treats auto in_progress with no engagement as first-pass unseen', () => {
    expect(resolveCoachStatus({ status: 'in_progress' })).toBe('unseen')
    expect(resolveCoachStatus(null)).toBe('unseen')
  })

  it('keeps in_progress when study or practice engagement exists', () => {
    expect(resolveCoachStatus({ status: 'in_progress', studySectionsViewed: true })).toBe('in_progress')
    expect(resolveCoachStatus({ status: 'in_progress', quizScores: [{ score: 0.5, total: 5 }] })).toBe('in_progress')
    expect(resolveCoachStatus({ status: 'mastered', quizScores: [{ score: 1, total: 5 }] })).toBe('mastered')
  })
})

describe('pickFailureMode', () => {
  it('prioritizes retention → misconception → procedural → verification → application', () => {
    expect(pickFailureMode({ srsDue: true, trapCount: 5, passWeak: true })).toBe('retention')
    expect(pickFailureMode({ trapCount: 2, passWeak: true })).toBe('misconception')
    expect(pickFailureMode({ procedural: true, passWeak: true })).toBe('procedural')
    expect(pickFailureMode({ passWeak: true, labDone: false })).toBe('verification')
    expect(pickFailureMode({ passWeak: true, labDone: true })).toBe('application')
    expect(pickFailureMode({})).toBe(null)
  })
})

describe('whyForFailureMode', () => {
  it('returns remediation micro-lines', () => {
    expect(whyForFailureMode('misconception', { count: 3 })).toContain('Missed 3×')
    expect(whyForFailureMode('application')).toContain('Practice')
    expect(whyForFailureMode(null)).toBe(null)
  })
})

describe('pickCoachObjectiveNext / pickStudyNext', () => {
  const summary = {
    perObjective: [
      { id: '5.3', title: 'ACLs', status: 'in_progress', mastery: 0.4, hardCount: 0, attempts: 2, daysSince: 1, domainId: 'security' },
      { id: '2.1', title: 'VLANs', status: 'in_progress', mastery: 0.7, hardCount: 0, attempts: 3, daysSince: 1, domainId: 'access' },
      { id: '1.1', title: 'OSI', status: 'unseen', mastery: 0, hardCount: 0, attempts: 0, daysSince: null, domainId: 'fundamentals' },
    ],
    missedByObj: { '5.3': 3 },
    domainStats: [],
    recentTopics: [],
  }

  it('SRS due wins Study Next', () => {
    const next = pickStudyNext(summary, 4)
    expect(next.kind).toBe('review')
    expect(next.failureMode).toBe('retention')
    expect(next.why).toBeTruthy()
  })

  it('domain pass weak before high trap', () => {
    const next = pickCoachObjectiveNext(summary, {
      domainPassRecords: { security: { weakObjectives: ['5.3'] } },
    })
    expect(next.shortTitle).toContain('Pass weak')
    expect(next.tab).toBe('Study')
    expect(next.failureMode).toBe('application')
  })

  it('high trap when no domain-pass weak', () => {
    const next = pickCoachObjectiveNext(summary, { domainPassRecords: {} })
    expect(next.shortTitle).toContain('Trap focus')
    expect(next.tab).toBe('Practice')
    expect(next.why).toContain('3×')
  })

  it('almost-ready when no traps or pass weak', () => {
    const clean = {
      ...summary,
      missedByObj: {},
      perObjective: [
        { id: '2.1', title: 'VLANs', status: 'in_progress', mastery: 0.72, hardCount: 0, attempts: 3, daysSince: 1 },
      ],
    }
    const next = pickCoachObjectiveNext(clean, {})
    expect(next.shortTitle).toContain('Lock in')
    expect(next.tab).toBe('Practice')
  })
})

describe('generateLocalSuggestions post-study path', () => {
  it('routes weak active topics to Study first', () => {
    const cards = generateLocalSuggestions({
      perObjective: [
        { id: '3.1', title: 'IP', status: 'in_progress', mastery: 0.3, hardCount: 0, attempts: 2, daysSince: 1 },
      ],
      missedByObj: {},
    })
    expect(cards[0].tab).toBe('Study')
    expect(cards[0].why).toBeTruthy()
  })
})

describe('Fix Next why lines', () => {
  it('includes why micro-line on trap and domain-pass rows', () => {
    const rows = buildWeakAreaRows({
      missed: [
        { objectiveId: '5.5', misconceptionTested: 'Forgetting the implicit deny.' },
        { objectiveId: '5.5', misconceptionTested: 'Forgetting the implicit deny.' },
      ],
      readiness: { domainStats: [{ id: 'security', name: 'Security', avg: 0.4 }] },
      domainPassRecords: { security: { weakObjectives: ['5.3'] } },
      mockHistory: [],
      placementRecords: Object.fromEntries(
        ['fundamentals', 'access', 'connectivity', 'services', 'security', 'automation'].map(id => [
          id,
          { lastAttempt: { at: Date.now(), pct: 85, blueprintVersion: 2 } },
        ]),
      ),
    })
    expect(rows.every(r => r.why)).toBe(true)
    expect(rows.find(r => r.category === 'traps')?.why).toMatch(/Trap drill/i)
    expect(rows.find(r => r.failureMode === 'application')?.nextSteps).toContain('practice')
  })
})

describe('dismiss-today storage', () => {
  beforeEach(() => {
    const store = {}
    globalThis.window = {
      storage: {
        getItem: vi.fn(async (k) => store[k] ?? null),
        setItem: vi.fn(async (k, v) => { store[k] = v }),
      },
    }
  })

  it('remembers dismiss for today only', async () => {
    const now = Date.parse('2026-07-10T12:00:00Z')
    expect(await isStudyCoachDismissedToday('1.1', now)).toBe(false)
    await dismissStudyCoachToday('1.1', now)
    expect(await isStudyCoachDismissedToday('1.1', now)).toBe(true)
    expect(await isStudyCoachDismissedToday('1.1', Date.parse('2026-07-11T12:00:00Z'))).toBe(false)
    const map = await window.storage.getItem(STORAGE_KEYS.studyCoachDismissed)
    expect(map['1.1']).toBe(todayDateKey(now))
  })
})
