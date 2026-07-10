import { useState, useEffect, useCallback, useRef } from 'react'
import { DOMAINS } from '../../data/ccnaDomains.js'
import { STORAGE_KEYS, TRAP_DRILL_PREFILL_EVENT, PLACEMENT_BASELINE_REFRESH_EVENT, APP_REFRESH_EVENT } from '../../storageKeys.js'
import { loadDomainPassRecords, countPassedDomains } from '../domainPass/domainPassStorage.js'
import { loadAllPlacementRecords, countPlacementBaselines } from '../domainPlacement/domainPlacementStorage.js'
import { countTestedOutDomains } from '../domainPlacement/domainBaselineProfile.js'
import { placementDomainIds } from '../domainPlacement/placementBlueprints.js'
import { resolveTrapDrillCku } from '../trapDrill/trapDrillQuestions.js'
import { parseAppHash, syncAppHash } from '../../routing/appHashRouting.js'
import { bumpSessionStudy } from '../../home/sessionRecap.js'
import {
  applyParsedHashRoute,
  clearAllNestedState,
  clearViewNestedState,
  resetHubSessionState,
  shouldPreserveNestedOnNavigate,
  studyModeOpts,
  STUDY_HUB_VIEWS,
} from './studyModeNavigation.js'
import { peekAnyPlacementDebriefResume } from '../domainPlacement/placementDebriefResume.js'
import { peekAnyDomainPassDebriefResume } from '../domainPass/domainPassDebriefResume.js'

/**
 * View/routing state and navigation handlers — extracted from App.jsx.
 * Loaded-dependent effects run via AppNavigationLifecycle (rendered in App).
 */
export function useAppNavigation() {
  const [view, setView] = useState('home')
  const [returnToView, setReturnToView] = useState('home')
  const [topicFocusConfig, setTopicFocusConfig] = useState(null)
  const [examTrapPrefill, setExamTrapPrefill] = useState(null)
  const [trapDrillPrefill, setTrapDrillPrefill] = useState(null)
  const [activeDomainPassId, setActiveDomainPassId] = useState(null)
  const [domainPassFocusPickerId, setDomainPassFocusPickerId] = useState(null)
  const [domainPassFocusConfig, setDomainPassFocusConfig] = useState(null)
  const [activeDomainPlacementId, setActiveDomainPlacementId] = useState(null)
  const [domainPassPassedCount, setDomainPassPassedCount] = useState(0)
  const [domainPassRecords, setDomainPassRecords] = useState({})
  const [placementBaselineCount, setPlacementBaselineCount] = useState(0)
  const [placementTestedOutCount, setPlacementTestedOutCount] = useState(0)
  const [placementRecords, setPlacementRecords] = useState({})
  const [placementSessionMode, setPlacementSessionMode] = useState(null)
  const [mockDomainPrefill, setMockDomainPrefill] = useState(null)
  const [labsDomainPrefill, setLabsDomainPrefill] = useState(null)
  const [commandHubDomainPrefill, setCommandHubDomainPrefill] = useState(null)
  const [selectedObjective, setSelectedObjective] = useState(null)
  const [openDomain, setOpenDomain] = useState(null)
  const [selectedLab, setSelectedLab] = useState(null)
  const [labReturn, setLabReturn] = useState('labs')
  const mainRef = useRef(null)
  const homeScrollRef = useRef(0)
  const prevViewRef = useRef('home')
  const placementExpandOnReturnRef = useRef(null)

  const nestedApi = useRef(null)
  nestedApi.current = {
    setSelectedLab,
    setTopicFocusConfig,
    setActiveDomainPassId,
    setDomainPassFocusPickerId,
    setDomainPassFocusConfig,
    setActiveDomainPlacementId,
    setPlacementSessionMode,
    setMockDomainPrefill,
    setLabsDomainPrefill,
    setCommandHubDomainPrefill,
    setExamTrapPrefill,
    setTrapDrillPrefill,
    setSelectedObjective,
    setReturnToView,
    setView,
  }

  const openLab = useCallback((labId, from = 'labs') => {
    setSelectedLab(labId)
    setLabReturn(from)
    setReturnToView(view)
    setView('lab')
  }, [view])

  const selectObjective = useCallback((obj) => {
    setReturnToView(view)
    bumpSessionStudy('objective', obj.id)
    setSelectedObjective(obj)
    setView('objective')
  }, [view])

  /** Push a new top-level study mode (updates back stack). */
  const navigateTo = useCallback((nextView) => {
    if (nextView !== view) {
      if (!shouldPreserveNestedOnNavigate(view, nextView)) {
        clearViewNestedState(view, nestedApi.current)
      }
      if (STUDY_HUB_VIEWS.has(nextView)) resetHubSessionState(nextView, nestedApi.current)
    }
    setReturnToView(view)
    setView(nextView)
  }, [view])

  /** Replace view without changing the back stack (lab return paths, etc.). */
  const replaceView = useCallback((nextView) => {
    setView(nextView)
  }, [])

  const navigateHome = useCallback(() => {
    clearAllNestedState(nestedApi.current)
    setReturnToView('home')
    setView('home')
  }, [])

  const openExamTraps = useCallback((prefill) => {
    const safe = studyModeOpts(prefill)
    const trapPrefill = safe && (safe.trapId || safe.trapLabel || safe.domainId) ? safe : null
    setExamTrapPrefill(trapPrefill)
    navigateTo('examtraps')
  }, [navigateTo])

  const openTrapDrill = useCallback((prefill) => {
    const safe = studyModeOpts(prefill)
    const drillPrefill = safe && (safe.ckuId || safe.trapLabel || safe.objectiveId || safe.domainId) ? safe : null
    if (drillPrefill) {
      const resolved = resolveTrapDrillCku(drillPrefill)
      setTrapDrillPrefill(resolved
        ? { ...drillPrefill, ckuId: resolved.ckuId, trapLabel: resolved.trapLabel }
        : drillPrefill)
    } else {
      setTrapDrillPrefill(null)
    }
    navigateTo('trapdrill')
  }, [navigateTo])

  const refreshDomainPassCount = useCallback(async () => {
    const records = await loadDomainPassRecords()
    setDomainPassRecords(records)
    setDomainPassPassedCount(countPassedDomains(records, DOMAINS))
  }, [])

  const refreshPlacementBaselineCount = useCallback(async () => {
    const records = await loadAllPlacementRecords()
    const ids = placementDomainIds()
    setPlacementRecords(records || {})
    setPlacementBaselineCount(countPlacementBaselines(records, ids))
    setPlacementTestedOutCount(countTestedOutDomains(records, ids))
  }, [])

  const openDomainPass = useCallback((opts) => {
    const safe = studyModeOpts(opts)
    setActiveDomainPassId(safe?.domainId || null)
    navigateTo('domainpass')
  }, [navigateTo])

  const openDomainPlacement = useCallback((opts) => {
    const safe = studyModeOpts(opts)
    setActiveDomainPlacementId(safe?.domainId || null)
    setPlacementSessionMode(safe?.placementMode || null)
    placementExpandOnReturnRef.current = safe?.expandOnReturn ? (safe?.domainId || null) : null
    navigateTo('domainplacement')
  }, [navigateTo])

  const exitDomainPlacement = useCallback(() => {
    const expandId = placementExpandOnReturnRef.current
    setActiveDomainPlacementId(null)
    setPlacementSessionMode(null)
    placementExpandOnReturnRef.current = null
    if (expandId) {
      setOpenDomain(expandId)
      setReturnToView('home')
      setView('home')
      return
    }
    setView(returnToView)
  }, [returnToView])

  const openMockExam = useCallback((opts) => {
    const safe = studyModeOpts(opts)
    setMockDomainPrefill(safe?.domainId || null)
    navigateTo('mock')
  }, [navigateTo])

  const openLabs = useCallback((opts) => {
    const safe = studyModeOpts(opts)
    const domainId = safe?.domainId
    if (domainId) {
      setLabsDomainPrefill(domainId)
      window.storage?.setItem(STORAGE_KEYS.labsDomainFilter, domainId)
    }
    navigateTo('labs')
  }, [navigateTo])

  const openCommandHub = useCallback((opts) => {
    const safe = studyModeOpts(opts)
    const domainId = safe?.domainId
    if (domainId) {
      setCommandHubDomainPrefill(domainId)
      window.storage?.setItem(STORAGE_KEYS.commandHubDomainFilter, domainId)
    }
    navigateTo('commandhub')
  }, [navigateTo])

  const clearExamTrapPrefill = useCallback(() => setExamTrapPrefill(null), [])
  const clearTrapDrillPrefill = useCallback(() => setTrapDrillPrefill(null), [])

  const consumeTrapDrillPrefill = useCallback(async () => {
    const raw = await window.storage.getItem(STORAGE_KEYS.trapDrillPrefill)
    if (!raw) return
    await window.storage.removeItem(STORAGE_KEYS.trapDrillPrefill)
    setTrapDrillPrefill(raw)
  }, [])

  const goBack = useCallback(() => {
    if (view === 'topicfocussession' && returnToView === 'topicfocus') {
      setView('topicfocus')
      return
    }
    if (view === 'topicfocussession' && returnToView === 'domainplacement') {
      const domainId = topicFocusConfig?.returnToPlacementDebrief
        || peekAnyPlacementDebriefResume()?.domainId
      if (domainId) setActiveDomainPlacementId(domainId)
    }
    if (returnToView === 'domainpass') {
      const domainId = peekAnyDomainPassDebriefResume()?.domainId
      if (domainId) setActiveDomainPassId(domainId)
    }
    clearViewNestedState(view, nestedApi.current)
    setView(returnToView)
  }, [view, returnToView, topicFocusConfig])

  const exitLab = useCallback(() => {
    const dest = labReturn || 'labs'
    setSelectedLab(null)
    if (dest === 'objective') replaceView('objective')
    else if (dest === 'mock') replaceView('mock')
    else if (dest === 'domainpass') replaceView('domainpass')
    else if (dest === 'domainplacement') replaceView('domainplacement')
    else replaceView('labs')
  }, [labReturn, replaceView])

  const routeScrolls = view !== 'objective' && view !== 'tutor' && view !== 'mockinterview'
  const compactTopChrome = view === 'objective' || view === 'tutor' || view === 'mockinterview'
  const showNavBack = view !== 'home' && view !== 'onboarding' && view !== 'objective'
  const objectiveBackLabel = returnToView === 'home' ? 'Topics' : 'Back'

  const gestureFlags = computeGestureFlags({
    view,
    returnToView,
    routeScrolls,
    chromeOverlayOpen: false,
    blockers: { ptr: false, edgeBack: false },
  })

  return {
    view,
    setView,
    returnToView,
    setReturnToView,
    topicFocusConfig,
    setTopicFocusConfig,
    examTrapPrefill,
    trapDrillPrefill,
    activeDomainPassId,
    setActiveDomainPassId,
    domainPassFocusPickerId,
    setDomainPassFocusPickerId,
    domainPassFocusConfig,
    setDomainPassFocusConfig,
    activeDomainPlacementId,
    setActiveDomainPlacementId,
    placementSessionMode,
    domainPassPassedCount,
    domainPassRecords,
    placementBaselineCount,
    placementTestedOutCount,
    placementRecords,
    mockDomainPrefill,
    setMockDomainPrefill,
    labsDomainPrefill,
    setLabsDomainPrefill,
    commandHubDomainPrefill,
    setCommandHubDomainPrefill,
    selectedObjective,
    setSelectedObjective,
    openDomain,
    setOpenDomain,
    selectedLab,
    labReturn,
    openLab,
    mainRef,
    homeScrollRef,
    prevViewRef,
    nestedApi,
    selectObjective,
    navigateTo,
    replaceView,
    navigateHome,
    openExamTraps,
    openTrapDrill,
    openDomainPass,
    openDomainPlacement,
    exitDomainPlacement,
    openMockExam,
    openLabs,
    openCommandHub,
    clearExamTrapPrefill,
    clearTrapDrillPrefill,
    consumeTrapDrillPrefill,
    refreshDomainPassCount,
    refreshPlacementBaselineCount,
    goBack,
    exitLab,
    routeScrolls,
    compactTopChrome,
    showNavBack,
    objectiveBackLabel,
    canPullRefresh: gestureFlags.canPullRefresh,
    canEdgeBack: gestureFlags.canEdgeBack,
  }
}

const NO_EDGE_BACK_VIEWS = new Set(['home', 'onboarding', 'lab'])

/** Pure gesture enablement — chrome overlays and dynamic blockers merged in App.jsx. */
export function computeGestureFlags({
  view,
  returnToView,
  routeScrolls,
  chromeOverlayOpen = false,
  blockers = {},
}) {
  const ptrBlocked = Boolean(blockers.ptr)
  const edgeBackBlocked = Boolean(blockers.edgeBack)
  const hasStack = view !== returnToView

  const canEdgeBack = hasStack
    && !NO_EDGE_BACK_VIEWS.has(view)
    && !edgeBackBlocked

  const canPullRefresh = routeScrolls
    && view !== 'onboarding'
    && !chromeOverlayOpen
    && !ptrBlocked

  return { canPullRefresh, canEdgeBack }
}

/** Loaded-dependent navigation effects — render once inside App. */
export function AppNavigationLifecycle({
  nav,
  loaded,
  refreshDue,
}) {
  const {
    view,
    setView,
    setReturnToView,
    selectedObjective,
    setSelectedObjective,
    mainRef,
    homeScrollRef,
    prevViewRef,
    consumeTrapDrillPrefill,
    refreshDomainPassCount,
    refreshPlacementBaselineCount,
    setOpenDomain,
    nestedApi,
  } = nav

  const hashBootstrapped = useRef(false)

  useEffect(() => { if (view === 'home') refreshDue() }, [view, refreshDue])

  useEffect(() => {
    if (!loaded || view !== 'home') return undefined
    let cancelled = false
    ;(async () => {
      const handoff = await window.storage.getItem(STORAGE_KEYS.baselineHandoff)
      if (cancelled || !handoff?.domainId) return
      await window.storage.removeItem(STORAGE_KEYS.baselineHandoff)
      setOpenDomain(handoff.domainId)
    })()
    return () => { cancelled = true }
  }, [loaded, view, setOpenDomain])

  useEffect(() => {
    const prev = prevViewRef.current
    if (prev === 'home' && view !== 'home' && mainRef.current) {
      homeScrollRef.current = mainRef.current.scrollTop
    }
    if (view === 'home' && mainRef.current) {
      requestAnimationFrame(() => {
        if (mainRef.current) mainRef.current.scrollTop = homeScrollRef.current
      })
    }
    prevViewRef.current = view
  }, [view, mainRef, homeScrollRef, prevViewRef])

  useEffect(() => {
    if (!loaded) return
    syncAppHash(view, selectedObjective, nav.labsDomainPrefill)
  }, [loaded, view, selectedObjective, nav.labsDomainPrefill])

  useEffect(() => {
    if (!loaded || hashBootstrapped.current) return
    if (view === 'onboarding') return
    const route = parseAppHash()
    if (route) {
      applyParsedHashRoute(route, nestedApi.current)
      hashBootstrapped.current = true
    }
  }, [loaded, view, nestedApi])

  useEffect(() => {
    if (!loaded) return
    function onHashChange() {
      applyParsedHashRoute(parseAppHash(), nestedApi.current)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [loaded, nestedApi])

  useEffect(() => {
    if (!loaded) return
    const onPrefill = () => { consumeTrapDrillPrefill() }
    window.addEventListener(TRAP_DRILL_PREFILL_EVENT, onPrefill)
    return () => window.removeEventListener(TRAP_DRILL_PREFILL_EVENT, onPrefill)
  }, [loaded, consumeTrapDrillPrefill])

  useEffect(() => {
    if (!loaded || view !== 'trapdrill') return
    consumeTrapDrillPrefill()
  }, [loaded, view, consumeTrapDrillPrefill])

  useEffect(() => {
    if (!loaded) return
    const onAppRefresh = () => {
      refreshDomainPassCount()
      refreshPlacementBaselineCount()
    }
    window.addEventListener(APP_REFRESH_EVENT, onAppRefresh)
    return () => window.removeEventListener(APP_REFRESH_EVENT, onAppRefresh)
  }, [loaded, refreshDomainPassCount, refreshPlacementBaselineCount])

  useEffect(() => {
    if (!loaded) return
    const onPlacementSaved = () => { refreshPlacementBaselineCount() }
    window.addEventListener(PLACEMENT_BASELINE_REFRESH_EVENT, onPlacementSaved)
    return () => window.removeEventListener(PLACEMENT_BASELINE_REFRESH_EVENT, onPlacementSaved)
  }, [loaded, refreshPlacementBaselineCount])

  useEffect(() => {
    if (!loaded) return
    if (view !== 'home' && view !== 'domainpass' && view !== 'domainplacement') return
    refreshDomainPassCount()
    refreshPlacementBaselineCount()
  }, [loaded, view, refreshDomainPassCount, refreshPlacementBaselineCount])

  useEffect(() => {
    if (!loaded || view !== 'objective' || selectedObjective) return
    const route = parseAppHash()
    if (route?.objective) {
      setSelectedObjective(route.objective)
      setReturnToView('home')
      return
    }
    setView('home')
  }, [loaded, view, selectedObjective, setView, setReturnToView, setSelectedObjective])

  return null
}

/** Bottom-nav derived state from view + overlay flags. */
export function bottomNavState({ view, showSettings, showSearch, showNavBack }) {
  const active = showSettings ? 'more' : showSearch ? 'search' : view === 'home' ? 'home' : view === 'objective' ? 'home' : null
  const compact = view === 'objective'
  return { active, compact }
}
