import { useCallback, useEffect, useRef, useState } from 'react'
import {
  applyPullResistance,
  PTR_THRESHOLD,
  shouldTriggerRefresh,
  isVerticalPull,
  isPtrBlockedPointerTarget,
} from './pullToRefreshLogic.js'

/**
 * Pull-to-refresh for a scroll container ref (pointer events — touch + mouse).
 * Only activates at scrollTop === 0 and when enabled.
 */
/**
 * Pull-to-refresh for a scroll container ref (pointer events — touch + mouse).
 * Only activates at scrollTop === 0 and when enabled.
 */
export function usePullToRefresh({
  scrollEl,
  onRefresh,
  enabled = true,
  reduceMotion = false,
  onHaptic,
}) {
  const [phase, setPhase] = useState('idle')
  const [pull, setPull] = useState(0)
  const pullRef = useRef(0)
  const phaseRef = useRef('idle')
  const trackingRef = useRef(false)
  const startRef = useRef({ x: 0, y: 0 })
  const lockedRef = useRef(false)
  const activePointerRef = useRef(null)

  const setPhaseSafe = useCallback((next) => {
    phaseRef.current = next
    setPhase(next)
  }, [])

  const setPullSafe = useCallback((next) => {
    pullRef.current = next
    setPull(next)
  }, [])

  const runRefresh = useCallback(async () => {
    if (!onRefresh || phaseRef.current === 'refreshing') return
    setPhaseSafe('refreshing')
    setPullSafe(reduceMotion ? 0 : PTR_THRESHOLD * 0.55)
    onHaptic?.(10)
    try {
      await onRefresh()
      setPhaseSafe('done')
      onHaptic?.(8)
      setTimeout(() => {
        if (phaseRef.current === 'done') {
          setPhaseSafe('idle')
          setPullSafe(0)
        }
      }, reduceMotion ? 200 : 650)
    } catch {
      setPhaseSafe('idle')
      setPullSafe(0)
    }
  }, [onRefresh, onHaptic, reduceMotion, setPhaseSafe, setPullSafe])

  useEffect(() => {
    const el = scrollEl
    if (!el || !enabled || !onRefresh) return undefined

    function resetTracking() {
      trackingRef.current = false
      lockedRef.current = false
      activePointerRef.current = null
    }

    function onPointerDown(e) {
      if (phaseRef.current === 'refreshing') return
      if (e.pointerType === 'mouse' && e.button !== 0) return
      if (isPtrBlockedPointerTarget(e.target)) return
      if (el.scrollTop > 1) return
      activePointerRef.current = e.pointerId
      startRef.current = { x: e.clientX, y: e.clientY }
      trackingRef.current = true
      lockedRef.current = false
      try { el.setPointerCapture(e.pointerId) } catch { /* unsupported */ }
    }

    function onPointerMove(e) {
      if (!trackingRef.current || phaseRef.current === 'refreshing') return
      if (activePointerRef.current !== e.pointerId) return
      const dx = e.clientX - startRef.current.x
      const dy = e.clientY - startRef.current.y
      if (!lockedRef.current) {
        if (!isVerticalPull(dx, dy)) {
          if (Math.abs(dx) > 12 || Math.abs(dy) > 12) resetTracking()
          return
        }
        lockedRef.current = true
      }
      if (dy <= 0 || el.scrollTop > 1) {
        setPullSafe(0)
        if (el.scrollTop > 1) resetTracking()
        return
      }
      if (e.cancelable) e.preventDefault()
      const distance = applyPullResistance(dy)
      setPhaseSafe(distance > 4 ? 'pulling' : 'idle')
      setPullSafe(distance)
    }

    function onPointerUp(e) {
      if (!trackingRef.current || activePointerRef.current !== e.pointerId) return
      const distance = pullRef.current
      try { el.releasePointerCapture(e.pointerId) } catch { /* unsupported */ }
      resetTracking()
      if (shouldTriggerRefresh(distance)) {
        runRefresh()
        return
      }
      setPhaseSafe('idle')
      setPullSafe(0)
    }

    el.addEventListener('pointerdown', onPointerDown, { passive: true })
    el.addEventListener('pointermove', onPointerMove, { passive: false })
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointercancel', onPointerUp)
    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointercancel', onPointerUp)
    }
  }, [scrollEl, enabled, onRefresh, runRefresh, setPhaseSafe, setPullSafe])

  return {
    phase,
    pull,
    pullTransform: enabled && pull > 0 && phase !== 'refreshing'
      ? pull
      : (phase === 'refreshing' && !reduceMotion ? PTR_THRESHOLD * 0.55 : 0),
  }
}
