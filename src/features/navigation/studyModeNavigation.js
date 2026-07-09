import { STORAGE_KEYS } from '../../storageKeys.js'

/** Ignore React synthetic events when handlers are wired as onClick={fn}. */
export function studyModeOpts(opts) {
  if (!opts || typeof opts !== 'object') return null
  if (typeof opts.preventDefault === 'function' && opts.nativeEvent) return null
  return opts
}

/** Top-level routes that should always open at hub/picker, not mid-session. */
export const STUDY_HUB_VIEWS = new Set([
  'domainpass',
  'domainplacement',
  'topicfocus',
  'labs',
  'mock',
  'focus',
  'missed',
  'review',
  'examtraps',
  'trapdrill',
  'commandhub',
  'studylens',
  'subnet',
  'routing',
  'extrastudy',
  'metrics',
  'stats',
  'mockinterview',
])

/** Reset nested session state when landing on a hub via hash or home-grid navigation. */
export function resetHubSessionState(view, api) {
  if (view === 'domainpass') {
    api.setActiveDomainPassId?.(null)
    api.setDomainPassFocusPickerId?.(null)
    api.setDomainPassFocusConfig?.(null)
  }
  if (view === 'domainplacement') {
    api.setActiveDomainPlacementId?.(null)
    api.setPlacementSessionMode?.(null)
  }
  if (view === 'topicfocus') api.setTopicFocusConfig?.(null)
}

/** Clear nested state when leaving a view (back button or switching modes). */
export function clearViewNestedState(exitingView, api) {
  if (exitingView === 'lab') api.setSelectedLab?.(null)
  if (exitingView === 'topicfocussession') api.setTopicFocusConfig?.(null)
  if (exitingView === 'domainpass') {
    api.setActiveDomainPassId?.(null)
    api.setDomainPassFocusPickerId?.(null)
    api.setDomainPassFocusConfig?.(null)
  }
  if (exitingView === 'domainplacement') {
    api.setActiveDomainPlacementId?.(null)
    api.setPlacementSessionMode?.(null)
  }
  if (exitingView === 'mock') api.setMockDomainPrefill?.(null)
  if (exitingView === 'examtraps') api.setExamTrapPrefill?.(null)
  if (exitingView === 'trapdrill') api.setTrapDrillPrefill?.(null)
}

export function clearAllNestedState(api) {
  api.setSelectedLab?.(null)
  api.setTopicFocusConfig?.(null)
  api.setActiveDomainPassId?.(null)
  api.setDomainPassFocusPickerId?.(null)
  api.setDomainPassFocusConfig?.(null)
  api.setActiveDomainPlacementId?.(null)
  api.setPlacementSessionMode?.(null)
  api.setMockDomainPrefill?.(null)
  api.setExamTrapPrefill?.(null)
  api.setTrapDrillPrefill?.(null)
  api.setSelectedObjective?.(null)
}

/** Apply a parsed hash route to navigation state. */
export function applyParsedHashRoute(route, api) {
  if (!route) {
    api.setReturnToView?.('home')
    clearAllNestedState(api)
    api.setView?.('home')
    return
  }
  if (route.objective) {
    api.setReturnToView?.('home')
    api.setSelectedObjective?.(route.objective)
    api.setView?.('objective')
    return
  }
  if (route.view) {
    api.setSelectedObjective?.(null)
    api.setReturnToView?.('home')
    if (route.labsDomainId) {
      api.setLabsDomainPrefill?.(route.labsDomainId)
      window.storage?.setItem(STORAGE_KEYS.labsDomainFilter, route.labsDomainId)
    }
    if (STUDY_HUB_VIEWS.has(route.view)) resetHubSessionState(route.view, api)
    api.setView?.(route.view)
  }
}
