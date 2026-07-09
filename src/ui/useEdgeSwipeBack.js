import { useCallback, useEffect, useRef, useState } from 'react'
import {
  applyEdgeDragResistance,
  EDGE_BACK_THRESHOLD,
  isHorizontalSwipe,
  isInEdgeBackZone,
  isEdgeBackExcludedTarget,
  shouldTriggerEdgeBack,
} from './edgeBackLogic.js'

/**
 * Left-edge swipe to navigate back (pointer events — touch + mouse).
 */
export function useEdgeSwipeBack({
  scrollEl,
  onEdgeBack,
  enabled = true,
  reduceMotion = false,
  onHaptic,
}) {
  const [drag, setDrag] = useState(0)
  const dragRef = useRef(0)
  const trackingRef = useRef(false)
  const lockedRef = useRef(false)
  const startRef = useRef({ x: 0, y: 0 })
  const activePointerRef = useRef(null)

  const setDragSafe = useCallback((next) => {
    dragRef.current = next
    setDrag(next)
  }, [])

  const completeBack = useCallback(() => {
    onHaptic?.(6)
    setDragSafe(0)
    onEdgeBack?.()
  }, [onEdgeBack, onHaptic, setDragSafe])

  useEffect(() => {
    const el = scrollEl
    if (!el || !enabled || !onEdgeBack) return undefined

    function resetTracking() {
      trackingRef.current = false
      lockedRef.current = false
      activePointerRef.current = null
      setDragSafe(0)
    }

    function onPointerDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      if (!isInEdgeBackZone(e.clientX)) return
      if (isEdgeBackExcludedTarget(e.target)) return
      activePointerRef.current = e.pointerId
      startRef.current = { x: e.clientX, y: e.clientY }
      trackingRef.current = true
      lockedRef.current = false
      try { el.setPointerCapture(e.pointerId) } catch { /* unsupported */ }
    }

    function onPointerMove(e) {
      if (!trackingRef.current || activePointerRef.current !== e.pointerId) return
      const dx = e.clientX - startRef.current.x
      const dy = e.clientY - startRef.current.y
      if (!lockedRef.current) {
        if (!isHorizontalSwipe(dx, dy)) {
          if (Math.abs(dx) > 12 || Math.abs(dy) > 12) resetTracking()
          return
        }
        lockedRef.current = true
      }
      if (dx <= 0) {
        setDragSafe(0)
        return
      }
      if (e.cancelable) e.preventDefault()
      setDragSafe(applyEdgeDragResistance(dx))
    }

    function onPointerUp(e) {
      if (!trackingRef.current || activePointerRef.current !== e.pointerId) return
      const dx = e.clientX - startRef.current.x
      try { el.releasePointerCapture(e.pointerId) } catch { /* unsupported */ }
      resetTracking()
      if (shouldTriggerEdgeBack(dx)) {
        if (reduceMotion) {
          onEdgeBack?.()
          onHaptic?.(6)
          return
        }
        completeBack()
        return
      }
      setDragSafe(0)
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
  }, [scrollEl, enabled, onEdgeBack, completeBack, reduceMotion, onHaptic, setDragSafe])

  const edgeTransform = enabled && drag > 0 && !reduceMotion ? drag : 0

  return {
    drag,
    edgeTransform,
    edgeDragging: drag > 0,
  }
}
