import { useState, useCallback, useEffect, useRef } from 'react'
import { STORAGE_KEYS } from '../../storageKeys.js'
import {
  generateSyncCode,
  loadSyncBundle,
  saveSyncBundle,
  mergeSyncData,
  pullSync,
  pushSync,
} from './syncMerge.js'
import { importCcnaJsonFromFile } from '../export/importCcnaJson.js'

/** Cross-device sync + Raw Data import merge — extracted from App.jsx (P8). */
export function useAppSync({ loaded, setProgress, setMissed, setStreak, refreshOffline }) {
  const [syncCode, setSyncCode] = useState(null)
  const [lastSynced, setLastSynced] = useState(null)
  const [syncBusy, setSyncBusy] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const importFileRef = useRef(null)
  const autoSyncedRef = useRef(false)

  useEffect(() => {
    if (!loaded) return undefined
    let cancelled = false
    ;(async () => {
      const [code, last] = await Promise.all([
        window.storage.getItem(STORAGE_KEYS.syncCode),
        window.storage.getItem(STORAGE_KEYS.syncLast),
      ])
      if (!cancelled) {
        setSyncCode(code || null)
        setLastSynced(last || null)
      }
    })()
    return () => { cancelled = true }
  }, [loaded])

  const doSync = useCallback(async (code) => {
    const useCode = code || syncCode
    if (!useCode) return
    setSyncBusy(true)
    setSyncMsg('Syncing…')
    try {
      const local = await loadSyncBundle()
      const remote = await pullSync(useCode)
      const merged = mergeSyncData(local, remote || {})
      await saveSyncBundle(merged)
      setProgress(merged.progress)
      setMissed(merged.missed)
      setStreak(merged.streak)
      await pushSync(useCode, merged)
      const now = Date.now()
      await window.storage.setItem(STORAGE_KEYS.syncLast, now)
      setLastSynced(now)
      await refreshOffline()
      setSyncMsg('Synced ✓')
    } catch (e) {
      setSyncMsg(/failed to fetch/i.test(e.message)
        ? 'Could not reach the sync server (works on the deployed site only).'
        : e.message)
    } finally {
      setSyncBusy(false)
    }
  }, [syncCode, refreshOffline, setProgress, setMissed, setStreak])

  const handleGenerateSync = useCallback(async () => {
    const code = generateSyncCode()
    await window.storage.setItem(STORAGE_KEYS.syncCode, code)
    setSyncCode(code)
    doSync(code)
  }, [doSync])

  const handleLinkSync = useCallback(async (code) => {
    await window.storage.setItem(STORAGE_KEYS.syncCode, code)
    setSyncCode(code)
    doSync(code)
  }, [doSync])

  const handleUnlinkSync = useCallback(async () => {
    await window.storage.removeItem(STORAGE_KEYS.syncCode)
    setSyncCode(null)
    setLastSynced(null)
    setSyncMsg('')
  }, [])

  const handleImport = useCallback(async (incoming) => {
    const local = await loadSyncBundle()
    const merged = mergeSyncData(local, incoming || {})
    await saveSyncBundle(merged)
    setProgress(merged.progress)
    setMissed(merged.missed)
    setStreak(merged.streak)
    await refreshOffline()
  }, [refreshOffline, setProgress, setMissed, setStreak])

  const handleImportFile = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importCcnaJsonFromFile(file, handleImport)
    } catch {
      // invalid JSON — user can retry via Export modal for feedback
    } finally {
      if (importFileRef.current) importFileRef.current.value = ''
    }
  }, [handleImport])

  const pickImportFile = useCallback(() => { importFileRef.current?.click() }, [])

  useEffect(() => {
    if (!loaded || !syncCode || autoSyncedRef.current) return
    autoSyncedRef.current = true
    doSync(syncCode)
  }, [loaded, syncCode, doSync])

  return {
    syncCode,
    lastSynced,
    syncBusy,
    syncMsg,
    importFileRef,
    doSync,
    handleGenerateSync,
    handleLinkSync,
    handleUnlinkSync,
    handleImport,
    handleImportFile,
    pickImportFile,
  }
}
