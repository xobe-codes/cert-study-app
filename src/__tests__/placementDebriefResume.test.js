import { describe, it, expect, beforeEach } from 'vitest'
import {
  stashPlacementDebriefResume,
  peekPlacementDebriefResume,
  consumePlacementDebriefResume,
  clearPlacementDebriefResume,
} from '../features/domainPlacement/placementDebriefResume.js'
import { buildStudyObjectiveHandoff } from '../study/studyObjectiveHandoff.js'

describe('placementDebriefResume', () => {
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

  it('stashes and consumes debrief by domain', () => {
    stashPlacementDebriefResume('services', { report: { pct: 72 }, sessionMode: 'baseline' })
    expect(peekPlacementDebriefResume('services')?.report.pct).toBe(72)
    const consumed = consumePlacementDebriefResume('services')
    expect(consumed?.sessionMode).toBe('baseline')
    expect(peekPlacementDebriefResume('services')).toBeNull()
  })

  it('ignores resume for a different domain', () => {
    stashPlacementDebriefResume('services', { report: { pct: 72 } })
    expect(consumePlacementDebriefResume('fundamentals')).toBeNull()
  })

  it('clear removes stash', () => {
    stashPlacementDebriefResume('access', { report: { pct: 55 } })
    clearPlacementDebriefResume()
    expect(peekPlacementDebriefResume('access')).toBeNull()
  })
})

describe('buildStudyObjectiveHandoff', () => {
  it('returns objective with Practice tab', () => {
    const handoff = buildStudyObjectiveHandoff('1.5', { tab: 'Practice' })
    expect(handoff?.id).toBe('1.5')
    expect(handoff?.__initialTab).toBe('Practice')
    expect(handoff?.domainId).toBeTruthy()
  })
})
