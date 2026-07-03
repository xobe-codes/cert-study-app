import { useEffect } from 'react'

/** Cmd/Ctrl+K opens global search when chrome overlays are closed. */
export function useGlobalSearchHotkey({ enabled, blocked, onOpen }) {
  useEffect(() => {
    if (!enabled) return undefined
    function onKey(e) {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'k') return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return
      e.preventDefault()
      if (!blocked) onOpen?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled, blocked, onOpen])
}
