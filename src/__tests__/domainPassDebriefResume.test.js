import { describe, it, expect, beforeEach } from 'vitest'
import {
  stashDomainPassDebriefResume,
  peekDomainPassDebriefResume,
  peekAnyDomainPassDebriefResume,
  consumeDomainPassDebriefResume,
  clearDomainPassDebriefResume,
} from '../features/domainPass/domainPassDebriefResume.js'

describe('domainPassDebriefResume', () => {
  beforeEach(() => {
    const store = new Map()
    globalThis.window = {
      sessionStorage: {
        getItem(key) { return store.has(key) ? store.get(key) : null },
        setItem(key, value) { store.set(key, value) },
        removeItem(key) { store.delete(key) },
        clear() { store.clear() },
      },
    }
  })

  const sample = {
    report: { correct: 8, total: 12, byDomain: {}, trapDebrief: [] },
    questions: [{ id: '1.1-a', objectiveId: '1.1', correctIndex: 0 }],
    responses: { 0: 1 },
  }

  it('stashes and consumes debrief by domain', () => {
    stashDomainPassDebriefResume('fundamentals', sample)
    expect(peekDomainPassDebriefResume('fundamentals')?.report.correct).toBe(8)
    const consumed = consumeDomainPassDebriefResume('fundamentals')
    expect(consumed?.questions).toHaveLength(1)
    expect(consumed?.responses[0]).toBe(1)
    expect(peekDomainPassDebriefResume('fundamentals')).toBeNull()
  })

  it('ignores resume for a different domain', () => {
    stashDomainPassDebriefResume('fundamentals', sample)
    expect(consumeDomainPassDebriefResume('security')).toBeNull()
  })

  it('clear removes stash', () => {
    stashDomainPassDebriefResume('access', sample)
    clearDomainPassDebriefResume()
    expect(peekDomainPassDebriefResume('access')).toBeNull()
  })

  it('peekAny returns stashed debrief without domain filter', () => {
    stashDomainPassDebriefResume('security', sample)
    expect(peekAnyDomainPassDebriefResume()?.domainId).toBe('security')
  })

  it('requires report and questions', () => {
    stashDomainPassDebriefResume('fundamentals', { report: sample.report })
    expect(peekDomainPassDebriefResume('fundamentals')).toBeNull()
  })
})
