/**
 * Spec 14 — phone inline diagram contract (≤430px).
 */

export const PHONE_VIEWPORT_MAX = 430
export const PHONE_MAX_NODES = 5

export function isPhoneViewport(width) {
  const w = Number(width)
  if (!Number.isFinite(w)) return false
  return w <= PHONE_VIEWPORT_MAX
}

export function diagramNeedsExpand(diagram) {
  const nodes = diagram?.nodes?.length || 0
  const links = diagram?.links || []
  const hasLinkLabels = links.some(l => l?.label)
  const annotations = diagram?.annotations?.length || 0
  return nodes > 3 || hasLinkLabels || annotations > 0
}

/**
 * Pick a simplified inline diagram for phone when dense.
 * Keeps first ≤5 nodes and links that only connect kept nodes.
 */
export function pickPhoneInlineDiagram(diagram) {
  if (!diagram || typeof diagram !== 'object') return diagram
  const nodes = Array.isArray(diagram.nodes) ? diagram.nodes : []
  if (nodes.length <= PHONE_MAX_NODES && !diagramNeedsExpand(diagram)) {
    return { ...diagram, isPhoneSimplified: false }
  }
  const kept = nodes.slice(0, PHONE_MAX_NODES)
  const keptIds = new Set(kept.map(n => n.id))
  const links = (diagram.links || []).filter(l => keptIds.has(l.from) && keptIds.has(l.to))
  return {
    ...diagram,
    nodes: kept.map(n => ({
      ...n,
      label: String(n.label || n.id || '').slice(0, 14),
    })),
    links,
    annotations: [],
    isPhoneSimplified: true,
    fullNodeCount: nodes.length,
  }
}

/** 3-line caption from diagram metadata (no invented CCNA facts). */
export function diagramCaption(diagram) {
  if (!diagram) return null
  const lookingAt = diagram.captionLookingAt
    || diagram.title
    || diagram.caption
    || 'Topology for this objective'
  const whatMatters = diagram.captionWhatMatters
    || diagram.subtitle
    || (diagram.isPhoneSimplified
      ? `Simplified view (${diagram.fullNodeCount || diagram.nodes?.length || 0} nodes total — expand for full)`
      : 'Focus on labeled devices and links')
  const examTrap = diagram.captionExamTrap
    || diagram.examTrap
    || 'Expand the full diagram before assuming missing nodes'
  return {
    lookingAt: String(lookingAt).trim(),
    whatMatters: String(whatMatters).trim(),
    examTrap: String(examTrap).trim(),
  }
}
