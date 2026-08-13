/**
 * Pure geometry for curated topology diagrams.
 *
 * Node glyphs are rectangles centred on a projected point, so projecting data
 * coordinates across the full canvas width leaves half a node box hanging off
 * each edge. Both helpers here work in canvas pixels rather than the 0–100
 * authoring space, which is what keeps nodes and their labels inside the frame.
 */

/** Monospace advance ratio — node/link text renders in ui-monospace. */
export const MONO_ADVANCE = 0.6

/** How many monospace characters fit in a pixel width at a given font size. */
export function diagramLabelCharBudget(maxWidthPx, fontSize) {
  if (!(maxWidthPx > 0) || !(fontSize > 0)) return 1
  return Math.max(1, Math.floor(maxWidthPx / (fontSize * MONO_ADVANCE)))
}

function greedyWrap(words, budget) {
  const lines = []
  let cur = ''
  for (const raw of words) {
    let word = raw
    while (word.length > budget) {
      if (cur) { lines.push(cur); cur = '' }
      lines.push(word.slice(0, budget))
      word = word.slice(budget)
    }
    if (!word) continue
    const next = cur ? `${cur} ${word}` : word
    if (next.length <= budget) cur = next
    else { if (cur) lines.push(cur); cur = word }
  }
  if (cur) lines.push(cur)
  return lines
}

/**
 * Wrap a node label to the pixel width actually available inside its box.
 * Splitting on character count alone (the previous behaviour) overflowed the
 * box whenever the font grew or the box shrank — i.e. on phones.
 */
export function fitDiagramLabel(text, { maxWidthPx, fontSize, maxLines = 2 } = {}) {
  const budget = diagramLabelCharBudget(maxWidthPx, fontSize)
  const s = String(text ?? '').trim()
  if (!s) return ['']
  const lines = greedyWrap(s.split(/\s+/), budget)
  if (lines.length <= maxLines) return lines
  const kept = lines.slice(0, maxLines)
  const last = kept[maxLines - 1]
  kept[maxLines - 1] = last.length >= budget
    ? `${last.slice(0, Math.max(1, budget - 1))}…`
    : `${last}…`
  return kept
}

/**
 * Project authoring coordinates onto the canvas so that every node box stays
 * fully inside it. The usable band is inset by half a node box plus a margin;
 * a degenerate axis (all nodes on one line) centres instead of dividing by zero.
 */
export function projectDiagramNodes({ nodes, W, H, nodeW, nodeH, margin = 4 }) {
  const xs = (nodes || []).map(n => n.x)
  const ys = (nodes || []).map(n => n.y)
  const minX = xs.length ? Math.min(...xs) : 0
  const maxX = xs.length ? Math.max(...xs) : 0
  const minY = ys.length ? Math.min(...ys) : 0
  const maxY = ys.length ? Math.max(...ys) : 0

  const halfW = nodeW / 2 + margin
  const halfH = nodeH / 2 + margin
  // Never let the band invert on a canvas too small for one node box.
  const left = Math.min(halfW, W / 2)
  const right = Math.max(W - halfW, W / 2)
  const top = Math.min(halfH, H / 2)
  const bottom = Math.max(H - halfH, H / 2)

  const spread = (v, min, max, lo, hi) => (max - min < 1e-6 ? (lo + hi) / 2 : lo + ((v - min) / (max - min)) * (hi - lo))

  return {
    toX: v => spread(v, minX, maxX, left, right),
    toY: v => spread(v, minY, maxY, top, bottom),
    bounds: { left, right, top, bottom },
  }
}

/**
 * Shrink the node box until same-row neighbours stop colliding.
 *
 * Most packs lay 4–6 devices out in a horizontal chain. At the authored box
 * width those boxes are wider than a phone canvas can hold, so they overlapped
 * and hid each other's labels. Two passes: the first measures gaps at the
 * current width, the second re-measures against the wider band the shrink
 * frees up, so we do not narrow more than necessary.
 */
export function fitNodeBoxWidth({ nodes, W, H, nodeW, nodeH, minWidth = 64, gutter = 6, passes = 2 }) {
  if (!nodes?.length || nodes.length < 2) return nodeW
  let width = nodeW
  for (let pass = 0; pass < passes; pass++) {
    const { toX, toY } = projectDiagramNodes({ nodes, W, H, nodeW: width, nodeH })
    let minGap = Infinity
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        // Only nodes sharing a row can collide horizontally.
        if (Math.abs(toY(nodes[i].y) - toY(nodes[j].y)) >= nodeH) continue
        minGap = Math.min(minGap, Math.abs(toX(nodes[i].x) - toX(nodes[j].x)))
      }
    }
    if (!Number.isFinite(minGap)) return width
    width = Math.max(minWidth, Math.min(nodeW, minGap - gutter))
  }
  return width
}

/** Keep a link-label chip inside the canvas after its stagger offset. */
export function clampLinkLabelY(y, chipHeight, H) {
  const maxY = Math.max(0, H - chipHeight)
  return Math.min(Math.max(0, y), maxY)
}
