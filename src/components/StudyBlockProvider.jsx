import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { STORAGE_KEYS } from '../storageKeys.js'
import { DEFAULT_STUDY_BLOCK_MODE, STUDY_BLOCK_MODES } from '../studyBlock/studyBlockConfig.js'
import {
  createIdleState,
  dismissCompleteCard,
  hydrateStudyBlock,
  pauseBlock,
  resumeBlock,
  serializeStudyBlock,
  skipBreak,
  startBlock,
  stopBlock,
  tickBlock,
} from '../studyBlock/studyBlockLogic.js'

const StudyBlockContext = createContext(null)

export function useStudyBlock() {
  const ctx = useContext(StudyBlockContext)
  if (!ctx) throw new Error('useStudyBlock must be used within StudyBlockProvider')
  return ctx
}

export function useStudyBlockOptional() {
  return useContext(StudyBlockContext)
}

export default function StudyBlockProvider({ children, onFocusBlockCompleted }) {
  const [state, setState] = useState(createIdleState)
  const [hydrated, setHydrated] = useState(false)
  const creditedRef = useRef(new Set())

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const raw = await window.storage.getItem(STORAGE_KEYS.studyBlock)
      if (!cancelled) {
        setState(hydrateStudyBlock(raw))
        setHydrated(true)
      }
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.storage.setItem(STORAGE_KEYS.studyBlock, serializeStudyBlock(state))
  }, [state, hydrated])

  useEffect(() => {
    if (!hydrated) return undefined
    const id = setInterval(() => {
      setState(prev => tickBlock(prev, Date.now()))
    }, 1000)
    return () => clearInterval(id)
  }, [hydrated])

  useEffect(() => {
    if (!hydrated) return undefined
    const onVisibility = () => {
      if (!document.hidden) return
      setState(prev => {
        if (prev.status === 'focus' || prev.status === 'break') {
          return pauseBlock(prev, 'hidden', Date.now())
        }
        return prev
      })
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [hydrated])

  useEffect(() => {
    if (!state.showCompleteCard || !state.lastCompletedObjectiveId) return undefined
    const token = `${state.lastCompletedObjectiveId}-${state.cycleIndex}-${state.updatedAt}`
    if (creditedRef.current.has(token)) return undefined
    creditedRef.current.add(token)
    onFocusBlockCompleted?.()
    return undefined
  }, [state.showCompleteCard, state.lastCompletedObjectiveId, state.cycleIndex, state.updatedAt, onFocusBlockCompleted])

  const start = useCallback((objectiveId, mode) => {
    setState(prev => startBlock(prev, { objectiveId, mode: mode || prev.mode || DEFAULT_STUDY_BLOCK_MODE }))
  }, [])

  const pause = useCallback(() => {
    setState(prev => pauseBlock(prev, 'user', Date.now()))
  }, [])

  const resume = useCallback(() => {
    setState(prev => resumeBlock(prev, Date.now()))
  }, [])

  const stop = useCallback(() => {
    setState(prev => stopBlock(prev, Date.now()))
  }, [])

  const dismissComplete = useCallback(() => {
    setState(prev => dismissCompleteCard(prev, Date.now()))
  }, [])

  const skipBreakPhase = useCallback(() => {
    setState(prev => skipBreak(prev, Date.now()))
  }, [])

  const setMode = useCallback((modeId) => {
    if (!STUDY_BLOCK_MODES[modeId]) return
    setState(prev => (prev.status === 'idle' ? { ...prev, mode: modeId } : prev))
  }, [])

  const continueOnObjective = useCallback((objectiveId) => {
    setState(prev => ({ ...prev, objectiveId, showCompleteCard: false }))
  }, [])

  const isActive = state.status === 'focus' || state.status === 'break' || state.status === 'paused'

  const value = {
    state,
    hydrated,
    isActive,
    modes: STUDY_BLOCK_MODES,
    start,
    pause,
    resume,
    stop,
    dismissComplete,
    skipBreakPhase,
    setMode,
    continueOnObjective,
  }

  return (
    <StudyBlockContext.Provider value={value}>
      {children}
    </StudyBlockContext.Provider>
  )
}
