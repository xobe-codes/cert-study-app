import { useState, useCallback } from 'react'

/** Overlay panel state (export, sync, search, settings) — extracted from App.jsx. */
export function useAppChrome() {
  const [showExport, setShowExport] = useState(false)
  const [showSync, setShowSync] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const openExport = useCallback(() => setShowExport(true), [])
  const closeExport = useCallback(() => setShowExport(false), [])
  const openSync = useCallback(() => setShowSync(true), [])
  const closeSync = useCallback(() => setShowSync(false), [])
  const openSearch = useCallback(() => setShowSearch(true), [])
  const closeSearch = useCallback(() => setShowSearch(false), [])
  const openSettings = useCallback(() => setShowSettings(true), [])
  const closeSettings = useCallback(() => setShowSettings(false), [])

  const panelOverlayOpen = showExport || showSync || showSearch || showSettings
  const hotkeyBlocked = showExport || showSync || showSettings

  return {
    showExport,
    showSync,
    showSearch,
    showSettings,
    setShowExport,
    setShowSync,
    setShowSearch,
    setShowSettings,
    openExport,
    closeExport,
    openSync,
    closeSync,
    openSearch,
    closeSearch,
    openSettings,
    closeSettings,
    panelOverlayOpen,
    hotkeyBlocked,
  }
}
