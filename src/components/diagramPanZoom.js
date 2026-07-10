/**
 * Pure pan/zoom math for topology expand modal.
 * Scale clamped [MIN_SCALE, MAX_SCALE]; pan only meaningful when scale > 1.
 */

export const DIAGRAM_MIN_SCALE = 1
export const DIAGRAM_MAX_SCALE = 3

export function clampDiagramScale(scale) {
  const s = Number(scale)
  if (!Number.isFinite(s)) return DIAGRAM_MIN_SCALE
  return Math.min(DIAGRAM_MAX_SCALE, Math.max(DIAGRAM_MIN_SCALE, s))
}

export function createDiagramPanZoomState() {
  return { scale: DIAGRAM_MIN_SCALE, x: 0, y: 0 }
}

/** Apply pinch: newScale around focal point (client coords relative to container). */
export function applyPinchZoom(state, { scale, focalX = 0, focalY = 0 } = {}) {
  const prev = state?.scale ?? DIAGRAM_MIN_SCALE
  const next = clampDiagramScale(scale)
  if (next === prev) return { ...createDiagramPanZoomState(), ...state, scale: next }
  const x = state?.x ?? 0
  const y = state?.y ?? 0
  // Keep focal point stable: world point under finger stays put
  const wx = (focalX - x) / prev
  const wy = (focalY - y) / prev
  return {
    scale: next,
    x: focalX - wx * next,
    y: focalY - wy * next,
  }
}

export function applyPan(state, { dx = 0, dy = 0 } = {}) {
  const scale = clampDiagramScale(state?.scale ?? DIAGRAM_MIN_SCALE)
  if (scale <= DIAGRAM_MIN_SCALE) {
    return { scale: DIAGRAM_MIN_SCALE, x: 0, y: 0 }
  }
  return {
    scale,
    x: (state?.x ?? 0) + dx,
    y: (state?.y ?? 0) + dy,
  }
}

export function resetDiagramPanZoom() {
  return createDiagramPanZoomState()
}

export function diagramTransformStyle({ scale = 1, x = 0, y = 0 } = {}) {
  const s = clampDiagramScale(scale)
  return {
    transform: `translate(${x}px, ${y}px) scale(${s})`,
    transformOrigin: '0 0',
  }
}
