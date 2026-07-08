/** Pull-to-refresh gesture constants and pure helpers (unit-tested). */

export const PTR_THRESHOLD = 72
export const PTR_MAX_PULL = 120
export const PTR_LOCK_ANGLE_DEG = 28

export function applyPullResistance(rawDelta) {
  if (rawDelta <= 0) return 0
  return Math.min(PTR_MAX_PULL, rawDelta * 0.45)
}

export function pullProgress(distance, threshold = PTR_THRESHOLD) {
  if (distance <= 0) return 0
  return Math.min(1, distance / threshold)
}

export function shouldTriggerRefresh(distance, threshold = PTR_THRESHOLD) {
  return distance >= threshold
}

/** Prefer vertical pulls — ignore obvious horizontal pans (carousels). */
export function isVerticalPull(dx, dy) {
  const ax = Math.abs(dx)
  const ay = Math.abs(dy)
  if (ay < 8) return false
  if (ax < 8) return true
  const angle = (Math.atan2(ay, ax) * 180) / Math.PI
  return angle >= PTR_LOCK_ANGLE_DEG
}

export function ptrPhaseLabel(phase) {
  if (phase === 'refreshing') return 'Refreshing study data'
  if (phase === 'pulling') return 'Release to refresh'
  if (phase === 'done') return 'Updated'
  return 'Pull down to refresh'
}

/** Skip PTR when the gesture starts on buttons, links, or quiz controls. */
export function isInteractivePointerTarget(el) {
  if (!el || typeof el !== 'object') return false
  if (typeof document !== 'undefined' && el === document.body) return false
  const tag = el.tagName
  if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'LABEL') {
    return true
  }
  const role = el.getAttribute?.('role')
  if (role === 'button' || role === 'radio' || role === 'tab' || role === 'checkbox' || role === 'switch') {
    return true
  }
  return Boolean(el.closest?.('button, a, input, textarea, select, label, [role="button"], [role="radio"], [role="tab"], [role="checkbox"]'))
}
