/** Runtime flags to pause PTR / edge-back during quiz reveal, mock exam, CLI, etc. */

const blocks = { pull: false, edge: false }
const listeners = new Set()

export function getMobileGestureBlocks() {
  return { ...blocks }
}

export function setMobileGestureBlocks(patch) {
  if (patch.pull != null) blocks.pull = Boolean(patch.pull)
  if (patch.edge != null) blocks.edge = Boolean(patch.edge)
  listeners.forEach((fn) => fn(getMobileGestureBlocks()))
}

export function subscribeMobileGestureBlocks(fn) {
  listeners.add(fn)
  fn(getMobileGestureBlocks())
  return () => listeners.delete(fn)
}
