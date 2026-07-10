import { describe, it, expect, vi } from 'vitest'
import {
  applyParsedHashRoute,
  clearViewNestedState,
  resetHubSessionState,
  shouldPreserveNestedOnNavigate,
  studyModeOpts,
  STUDY_HUB_VIEWS,
} from '../features/navigation/studyModeNavigation.js'
import { matchExamTraps } from '../ExamTrapStudyMode.jsx'

describe('studyModeNavigation', () => {
  it('lists all primary study hub views', () => {
    expect(STUDY_HUB_VIEWS.has('labs')).toBe(true)
    expect(STUDY_HUB_VIEWS.has('topicfocus')).toBe(true)
    expect(STUDY_HUB_VIEWS.has('domainpass')).toBe(true)
    expect(STUDY_HUB_VIEWS.has('lab')).toBe(false)
  })

  it('preserves Domain Pass nested state for trap drill and Command Hub', () => {
    expect(shouldPreserveNestedOnNavigate('domainpass', 'trapdrill')).toBe(true)
    expect(shouldPreserveNestedOnNavigate('domainpass', 'commandhub')).toBe(true)
    expect(shouldPreserveNestedOnNavigate('domainpass', 'labs')).toBe(true)
    expect(shouldPreserveNestedOnNavigate('domainpass', 'subnet')).toBe(true)
    expect(shouldPreserveNestedOnNavigate('domainpass', 'mock')).toBe(true)
    expect(shouldPreserveNestedOnNavigate('domainpass', 'home')).toBe(false)
    expect(shouldPreserveNestedOnNavigate('domainplacement', 'topicfocussession')).toBe(true)
    expect(shouldPreserveNestedOnNavigate('home', 'trapdrill')).toBe(false)
  })

  it('applyParsedHashRoute opens hub views with session state cleared', () => {
    const setView = vi.fn()
    const setReturnToView = vi.fn()
    const setActiveDomainPassId = vi.fn()
    const setDomainPassFocusPickerId = vi.fn()
    const setDomainPassFocusConfig = vi.fn()
    const setSelectedObjective = vi.fn()
    applyParsedHashRoute({ view: 'domainpass' }, {
      setView,
      setReturnToView,
      setActiveDomainPassId,
      setDomainPassFocusPickerId,
      setDomainPassFocusConfig,
      setSelectedObjective,
    })
    expect(setActiveDomainPassId).toHaveBeenCalledWith(null)
    expect(setDomainPassFocusPickerId).toHaveBeenCalledWith(null)
    expect(setView).toHaveBeenCalledWith('domainpass')
    expect(setReturnToView).toHaveBeenCalledWith('home')
  })

  it('applyParsedHashRoute restores objective deep links', () => {
    const obj = { id: '1.1', title: 'Test' }
    const setView = vi.fn()
    const setSelectedObjective = vi.fn()
    applyParsedHashRoute({ view: 'objective', objective: obj }, {
      setView,
      setSelectedObjective,
      setReturnToView: vi.fn(),
    })
    expect(setSelectedObjective).toHaveBeenCalledWith(obj)
    expect(setView).toHaveBeenCalledWith('objective')
  })

  it('clearViewNestedState clears lab and domain pass session', () => {
    const api = {
      setSelectedLab: vi.fn(),
      setActiveDomainPassId: vi.fn(),
      setActiveDomainPlacementId: vi.fn(),
      setPlacementSessionMode: vi.fn(),
    }
    clearViewNestedState('lab', api)
    expect(api.setSelectedLab).toHaveBeenCalledWith(null)
    clearViewNestedState('domainpass', api)
    expect(api.setActiveDomainPassId).toHaveBeenCalledWith(null)
  })

  it('resetHubSessionState clears topic focus config on hub entry', () => {
    const setTopicFocusConfig = vi.fn()
    resetHubSessionState('topicfocus', { setTopicFocusConfig })
    expect(setTopicFocusConfig).toHaveBeenCalledWith(null)
  })

  it('studyModeOpts ignores React click events', () => {
    const clickEvent = { preventDefault: () => {}, nativeEvent: {} }
    expect(studyModeOpts(clickEvent)).toBeNull()
    expect(studyModeOpts({ domainId: '3' })).toEqual({ domainId: '3' })
  })

  it('matchExamTraps tolerates null filter', () => {
    expect(matchExamTraps([{ id: 't1', trap: 'test' }], null)).toEqual([])
  })
})
