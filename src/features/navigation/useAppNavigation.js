import { useState, useEffect, useCallback, useRef } from 'react'
import { DOMAINS } from '../../data/ccnaDomains.js'
import { STORAGE_KEYS, TRAP_DRILL_PREFILL_EVENT, PLACEMENT_BASELINE_REFRESH_EVENT } from '../../storageKeys.js'
import { loadDomainPassRecords, countPassedDomains } from '../domainPass/domainPassStorage.js'
import { loadAllPlacementRecords, countPlacementBaselines } from '../domainPlacement/domainPlacementStorage.js'
import { countTestedOutDomains } from '../domainPlacement/domainBaselineProfile.js'
import { placementDomainIds } from '../domainPlacement/placementBlueprints.js'
import { parseAppHash, syncAppHash } from '../../routing/appHashRouting.js'
import { bumpSessionStudy } from '../../home/sessionRecap.js'

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
  const [activeDomainPlacementId, setActiveDomainPlacementId] = useState(null)
  const [domainPassPassedCount, setDomainPassPassedCount] = useState(0)
  const [domainPassRecords, setDomainPassRecords] = useState({})
  const [placementBaselineCount, setPlacementBaselineCount] = useState(0)
  const [placementTestedOutCount, setPlacementTestedOutCount] = useState(0)
  const [placementRecords, setPlacementRecords] = useState({})
  const [placementSessionMode, setPlacementSessionMode] = useState(null)
  const [mockDomainPrefill, setMockDomainPrefill] = useState(null)
  const [selectedObjective, setSelectedObjective] = useState(null)
  const [openDomain, setOpenDomain] = useState(null)
  const [selectedLab, setSelectedLab] = useState(null)
  const [labReturn, setLabReturn] = useState('labs')
  const mainRef = useRef(null)
  const homeScrollRef = useRef(0)
  const prevViewRef = useRef('home')
  const placementExpandOnReturnRef = useRef(null)

  const openLab = useCallback((labId, from = 'labs') => {
    setSelectedLab(labId)
    setLabReturn(from)
    setView('lab')
  }, [])

  const selectObjective = useCallback((obj) => {
    setReturnToView(view)
    bumpSessionStudy('objective', obj.id)
    setSelectedObjective(obj)
    setView('objective')
  }, [view])

  const navigateTo = useCallback((nextView) => {
    setReturnToView(view)
    setView(nextView)
  }, [view])

  const openExamTraps = useCallback((prefill) => {
    setExamTrapPrefill(prefill || null)
    setReturnToView(view)
    setView('examtraps')
  }, [view])

  const openTrapDrill = useCallback((prefill) => {
    setTrapDrillPrefill(prefill || null)
    setReturnToView(view)
    setView('trapdrill')
  }, [view])

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
    setActiveDomainPassId(opts?.domainId || null)
    setReturnToView(view)
    setView('domainpass')
  }, [view])

  const openDomainPlacement = useCallback((opts) => {
    setActiveDomainPlacementId(opts?.domainId || null)
    setPlacementSessionMode(opts?.placementMode || null)
    placementExpandOnReturnRef.current = opts?.expandOnReturn ? (opts?.domainId || null) : null
    setReturnToView(view)
    setView('domainplacement')
  }, [view])

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
    setMockDomainPrefill(opts?.domainId || null)
    setReturnToView(view)
    setView('mock')
  }, [view])

  const clearExamTrapPrefill = useCallback(() => setExamTrapPrefill(null), [])
  const clearTrapDrillPrefill = useCallback(() => setTrapDrillPrefill(null), [])

  const consumeTrapDrillPrefill = useCallback(async () => {
    const raw = await window.storage.getItem(STORAGE_KEYS.trapDrillPrefill)
    if (!raw) return
    await window.storage.removeItem(STORAGE_KEYS.trapDrillPrefill)
    setTrapDrillPrefill(raw)
  }, [])

  const goBack = useCallback(() => {
    setView(returnToView)
  }, [returnToView])

  const routeScrolls = view !== 'objective' && view !== 'tutor' && view !== 'mockinterview'
  const compactTopChrome = view === 'objective' || view === 'tutor' || view === 'mockinterview'
  const showNavBack = view !== 'home' && view !== 'onboarding' && view !== 'objective'
  const objectiveBackLabel = returnToView === 'home' ? 'Topics' : 'Back'

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
    selectObjective,
    navigateTo,
    openExamTraps,
    openTrapDrill,
    openDomainPass,
    openDomainPlacement,
    exitDomainPlacement,
    openMockExam,
    clearExamTrapPrefill,
    clearTrapDrillPrefill,
    consumeTrapDrillPrefill,
    refreshDomainPassCount,
    refreshPlacementBaselineCount,
    goBack,
    routeScrolls,
    compactTopChrome,
    showNavBack,
    objectiveBackLabel,
  }
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
  } = nav

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
    syncAppHash(view, selectedObjective)
  }, [loaded, view, selectedObjective])

  useEffect(() => {
    if (!loaded) return
    function onHashChange() {
      const route = parseAppHash()
      if (route?.objective) {
        setReturnToView('home')
        setSelectedObjective(route.objective)
        setView('objective')
      } else if (route?.view) {
        setSelectedObjective(null)
        setReturnToView('home')
        setView(route.view)
      } else {
        setReturnToView('home')
        setView('home')
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [loaded, setView, setReturnToView, setSelectedObjective])

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
