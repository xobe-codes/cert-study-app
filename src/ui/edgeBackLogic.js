/** Edge-swipe-back gesture constants and pure helpers (unit-tested). */

import { isInteractivePointerTarget } from './pullToRefreshLogic.js'

export const EDGE_ZONE_PX = 24
export const EDGE_BACK_THRESHOLD = 80
export const EDGE_BACK_THRESHOLD_PX = EDGE_BACK_THRESHOLD
export const EDGE_LOCK_ANGLE_DEG = 28

/** Left edge zone — optional safeLeft reserved for landscape inset layouts. */
export function isInEdgeBackZone(clientX, _safeLeft = 0) {
  return clientX >= 0 && clientX <= EDGE_ZONE_PX
}

export const isInEdgeZone = isInEdgeBackZone

/** Prefer horizontal swipes from the left edge — mirror of PTR angle lock. */
export function isHorizontalEdgeSwipe(dx, dy) {
  const ax = Math.abs(dx)
  const ay = Math.abs(dy)
  if (ax < 8) return false
  if (ay < 8) return true
  const angle = (Math.atan2(ax, ay) * 180) / Math.PI
  return angle >= EDGE_LOCK_ANGLE_DEG
}

export const isHorizontalSwipe = isHorizontalEdgeSwipe

export function applyEdgeBackResistance(rawDelta) {
  if (rawDelta <= 0) return 0
  return Math.min(140, rawDelta * 0.55)
}

export const applyEdgeDragResistance = applyEdgeBackResistance

export function shouldTriggerEdgeBack(dx, threshold = EDGE_BACK_THRESHOLD) {
  return dx >= threshold
}

export function edgeBackProgress(dx, threshold = EDGE_BACK_THRESHOLD) {
  if (dx <= 0) return 0
  return Math.min(1, dx / threshold)
}

/** Skip edge-back when the gesture starts on carousels or other horizontal pans. */
export function isHorizontalScrollContainer(el) {
  if (!el || typeof el.closest !== 'function') return false
  return Boolean(el.closest('.ccna-h-scroll, [data-horizontal-scroll="true"]'))
}

/** Skip PTR / edge-back when a Cisco CLI terminal input is focused or targeted. */
export function isTerminalPointerTarget(el) {
  if (!el || typeof el.closest !== 'function') return false
  if (el.closest('.cisco-terminal')) return true
  if (typeof document !== 'undefined') {
    const active = document.activeElement
    if (active?.closest?.('.cisco-terminal')) return true
  }
  return false
}

export function isEdgeBackExcludedTarget(el) {
  return isInteractivePointerTarget(el) || isHorizontalScrollContainer(el) || isTerminalPointerTarget(el)
}

export const shouldIgnoreEdgePointerTarget = isEdgeBackExcludedTarget
