import { useState, useCallback, useEffect, useRef } from 'react'
import { preloadCleanBank, getCleanBankStats } from '../../data/cleanQuestionAdapter.js'
import {
  loadExamDate,
  saveExamDate,
  clearExamDate,
  saveReduceMotion,
  clearTutorChat,
  clearAiCaches,
  resetStudyProgress,
  loadQuizSessionSizePref,
  saveQuizSessionSizePref,
  saveExamMode,
  loadExamMode,
} from '../../settings/settingsActions.js'

/**
 * Settings panel state and handlers — extracted from App.jsx.
 * Loads initial values on mount for use in routes (exam date countdown, exam mode).
 * Re-loads fresh values each time the settings panel opens.
 */
export function useAppSettings({
  showSettings,
  loaded,
  setProgress,
  setMissed,
  setStreak,
  setDueCount,
  refreshOffline,
}) {
  const [settingsExamDate, setSettingsExamDate] = useState(null)
  const [settingsQuizSize, setSettingsQuizSize] = useState(5)
  const [settingsReduceMotion, setSettingsReduceMotion] = useState(false)
  const [settingsExamMode, setSettingsExamMode] = useState(false)
  const [cleanBankStats, setCleanBankStats] = useState({ objectives: 0, questions: 0, genericExamTips: 0 })
  const initialLoadedRef = useRef(false)

  useEffect(() => {
    if (!loaded || initialLoadedRef.current) return
    initialLoadedRef.current = true
    ;(async () => {
      const [exam, examMode] = await Promise.all([loadExamDate(), loadExamMode()])
      setSettingsExamDate(exam)
      setSettingsExamMode(examMode)
    })()
  }, [loaded])

  useEffect(() => {
    if (!showSettings) return undefined
    let cancelled = false
    ;(async () => {
      const [exam, quiz, examMode] = await Promise.all([
        loadExamDate(),
        loadQuizSessionSizePref(),
        loadExamMode(),
      ])
      if (!cancelled) {
        setSettingsExamDate(exam)
        setSettingsQuizSize(quiz)
        setSettingsExamMode(examMode)
      }
      await preloadCleanBank()
      if (!cancelled) setCleanBankStats(getCleanBankStats())
    })()
    return () => { cancelled = true }
  }, [showSettings])

  const handleSaveExamDate = useCallback(async (iso) => {
    const saved = await saveExamDate(iso)
    setSettingsExamDate(saved)
  }, [])

  const handleClearExamDate = useCallback(async () => {
    await clearExamDate()
    setSettingsExamDate(null)
  }, [])

  const handleQuizSessionSizeChange = useCallback(async (size) => {
    const saved = await saveQuizSessionSizePref(size)
    setSettingsQuizSize(saved)
  }, [])

  const handleReduceMotionChange = useCallback(async (on) => {
    await saveReduceMotion(on)
    setSettingsReduceMotion(on)
  }, [])

  const handleExamModeChange = useCallback(async (on) => {
    await saveExamMode(on)
    setSettingsExamMode(on)
  }, [])

  const handleClearTutorChat = useCallback(() => clearTutorChat(), [])

  const handleClearAiCaches = useCallback(async () => {
    await clearAiCaches()
    await refreshOffline()
  }, [refreshOffline])

  const handleResetProgress = useCallback(async () => {
    await resetStudyProgress()
    setProgress({})
    setMissed([])
    setStreak({ count: 0, lastStudyDate: null })
    setDueCount(0)
    await refreshOffline()
  }, [refreshOffline, setProgress, setMissed, setStreak, setDueCount])

  return {
    settingsExamDate,
    settingsQuizSize,
    settingsReduceMotion,
    settingsExamMode,
    cleanBankStats,
    handleSaveExamDate,
    handleClearExamDate,
    handleQuizSessionSizeChange,
    handleReduceMotionChange,
    handleExamModeChange,
    handleClearTutorChat,
    handleClearAiCaches,
    handleResetProgress,
  }
}
