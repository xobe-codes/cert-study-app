import { useCallback, useEffect, useRef, useState } from 'react'
import {
  applyPan,
  applyPinchZoom,
  createDiagramPanZoomState,
  diagramTransformStyle,
  resetDiagramPanZoom,
  DIAGRAM_MIN_SCALE,
} from '../components/diagramPanZoom.js'

function touchDistance(a, b) {
  const dx = a.clientX - b.clientX
  const dy = a.clientY - b.clientY
  return Math.hypot(dx, dy)
}

function touchMidpoint(a, b, rect) {
  return {
    focalX: (a.clientX + b.clientX) / 2 - rect.left,
    focalY: (a.clientY + b.clientY) / 2 - rect.top,
  }
}

/**
 * Touch pinch/pan for diagram canvas. Double-tap or reset() restores identity.
 */
export function useDiagramPanZoom({ enabled = true } = {}) {
  const [state, setState] = useState(createDiagramPanZoomState)
  const stateRef = useRef(state)
  // Touch handlers below are native-event callbacks, not part of render, so
  // they read stateRef rather than closing over `state` directly. The mirror
  // is written in an effect (runs after commit, before any touch can fire)
  // instead of the render body, which is not the right place for it.
  useEffect(() => {
    stateRef.current = state
  }, [state])
  const gesture = useRef({ mode: null, startDist: 0, startScale: 1, lastX: 0, lastY: 0, lastTap: 0 })

  const reset = useCallback(() => {
    setState(resetDiagramPanZoom())
  }, [])

  const onTouchStart = useCallback((e) => {
    if (!enabled) return
    const g = gesture.current
    const cur = stateRef.current
    if (e.touches.length === 2) {
      g.mode = 'pinch'
      g.startDist = touchDistance(e.touches[0], e.touches[1]) || 1
      g.startScale = cur.scale
      return
    }
    if (e.touches.length === 1) {
      const now = Date.now()
      if (now - g.lastTap < 280) {
        reset()
        g.lastTap = 0
        g.mode = null
        return
      }
      g.lastTap = now
      if (cur.scale > DIAGRAM_MIN_SCALE) {
        g.mode = 'pan'
        g.lastX = e.touches[0].clientX
        g.lastY = e.touches[0].clientY
      } else {
        g.mode = null
      }
    }
  }, [enabled, reset])

  const onTouchMove = useCallback((e) => {
    if (!enabled) return
    const g = gesture.current
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()

    if (g.mode === 'pinch' && e.touches.length === 2) {
      e.preventDefault()
      const dist = touchDistance(e.touches[0], e.touches[1]) || 1
      const nextScale = g.startScale * (dist / g.startDist)
      const { focalX, focalY } = touchMidpoint(e.touches[0], e.touches[1], rect)
      setState(prev => applyPinchZoom(prev, { scale: nextScale, focalX, focalY }))
      return
    }
    if (g.mode === 'pan' && e.touches.length === 1) {
      e.preventDefault()
      const t = e.touches[0]
      const dx = t.clientX - g.lastX
      const dy = t.clientY - g.lastY
      g.lastX = t.clientX
      g.lastY = t.clientY
      setState(prev => applyPan(prev, { dx, dy }))
    }
  }, [enabled])

  const onTouchEnd = useCallback(() => {
    gesture.current.mode = null
  }, [])

  return {
    state,
    reset,
    style: diagramTransformStyle(state),
    handlers: enabled
      ? { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: onTouchEnd }
      : {},
    zoomed: state.scale > DIAGRAM_MIN_SCALE + 0.01,
  }
}
