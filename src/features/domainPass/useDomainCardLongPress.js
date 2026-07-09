import { useRef, useCallback } from 'react'

const LONG_PRESS_MS = 500

/** Fire callback after sustained press — used for focus-picker entry on domain cards. */
export function useDomainCardLongPress(onLongPress) {
  const timerRef = useRef(null)
  const firedRef = useRef(false)

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const onPointerDown = useCallback((domainId) => {
    firedRef.current = false
    cancel()
    timerRef.current = setTimeout(() => {
      firedRef.current = true
      onLongPress?.(domainId)
    }, LONG_PRESS_MS)
  }, [onLongPress, cancel])

  const onPointerUp = useCallback(() => {
    cancel()
    return firedRef.current
  }, [cancel])

  const onPointerLeave = cancel

  return { onPointerDown, onPointerUp, onPointerLeave }
}
