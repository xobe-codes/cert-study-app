import { describe, expect, it } from 'vitest'
import {
  MONO_ADVANCE,
  clampLinkLabelY,
  diagramLabelCharBudget,
  fitDiagramLabel,
  fitNodeBoxWidth,
  projectDiagramNodes,
} from '../components/diagramLayout.js'
import { diagramCanvasSize, diagramFontSizes } from '../components/diagramDeviceIcons.jsx'
import * as d1 from '../data/visualPacks/domain1Fundamentals.js'
import * as d2 from '../data/visualPacks/domain2Access.js'
import * as d3 from '../data/visualPacks/domain3Connectivity.js'
import * as d4 from '../data/visualPacks/domain4Services.js'
import * as d5 from '../data/visualPacks/domain5Security.js'

function collectDiagrams() {
  const out = []
  const seen = new Set()
  const walk = (v) => {
    if (!v || typeof v !== 'object') return
    if (Array.isArray(v)) { v.forEach(walk); return }
    if (Array.isArray(v.nodes) && v.nodes.length) {
      const key = v.id || v.title
      if (!seen.has(key)) { seen.add(key); out.push(v) }
    }
    Object.values(v).forEach(walk)
  }
  ;[d1, d2, d3, d4, d5].forEach(walk)
  return out
}

/** Mirrors the layout block in CuratedDiagram's DiagramSvg. */
function layout(diagram, opts) {
  const { expanded, compact, isPreview, isMobile, isLandscape, containerWidth } = opts
  const nodes = diagram.nodes || []
  const xs = nodes.map(n => n.x), ys = nodes.map(n => n.y)
  const pad = 10
  const minX = Math.max(0, Math.min(...xs) - pad)
  const maxX = Math.min(100, Math.max(...xs) + pad)
  const minY = Math.max(0, Math.min(...ys) - pad)
  const maxY = Math.min(100, Math.max(...ys) + pad)
  const spanX = Math.max(28, maxX - minX)
  const spanY = Math.max(22, maxY - minY)
  const { W, H } = diagramCanvasSize({ expanded, compact, isPreview, isMobile, isLandscape, spanX, spanY, containerWidth })
  const density = nodes.length
  const fonts = diagramFontSizes({ expanded, compact, isPreview, isMobile, density })
  const nodeHint = Math.min(
    expanded ? (isMobile ? 128 : 136) : (isMobile ? 116 : 120),
    Math.max(84, (expanded ? 124 : 112) - density * 3),
    Math.max(56, W - 12),
  )
  const nodeH = expanded ? (isMobile ? 42 : 38) : (isMobile ? 38 : 34)
  const nodeW = fitNodeBoxWidth({ nodes, W, H, nodeW: nodeHint, nodeH })
  const { toX, toY } = projectDiagramNodes({ nodes, W, H, nodeW, nodeH })
  const iconSlot = fonts.icon + 10
  const labelWidth = Math.max(24, nodeW - iconSlot - 8)
  return { W, H, nodeW, nodeH, fonts, labelWidth, toX, toY, nodes }
}

const SCENARIOS = [
  { name: 'phone portrait inline', expanded: false, compact: false, isPreview: false, isMobile: true, isLandscape: false },
  { name: 'phone portrait expanded', expanded: true, compact: false, isPreview: false, isMobile: true, isLandscape: false },
  { name: 'phone landscape inline', expanded: false, compact: false, isPreview: false, isMobile: true, isLandscape: true },
  { name: 'phone preview', expanded: false, compact: true, isPreview: true, isMobile: true, isLandscape: false },
  { name: 'narrow phone (320 frame)', expanded: false, compact: false, isPreview: false, isMobile: true, isLandscape: false, containerWidth: 320 },
  { name: 'desktop inline', expanded: false, compact: false, isPreview: false, isMobile: false, isLandscape: false },
]

describe('diagramLabelCharBudget', () => {
  it('derives a character budget from pixel width and font size', () => {
    expect(diagramLabelCharBudget(60, 10)).toBe(Math.floor(60 / (10 * MONO_ADVANCE)))
  })

  it('never returns zero for degenerate input', () => {
    expect(diagramLabelCharBudget(0, 10)).toBe(1)
    expect(diagramLabelCharBudget(60, 0)).toBe(1)
    expect(diagramLabelCharBudget(NaN, NaN)).toBe(1)
  })
})

describe('fitDiagramLabel', () => {
  const opts = { maxWidthPx: 60, fontSize: 10, maxLines: 2 } // budget = 10 chars

  it('keeps a short label on one line', () => {
    expect(fitDiagramLabel('R1', opts)).toEqual(['R1'])
  })

  it('wraps on word boundaries within the budget', () => {
    const lines = fitDiagramLabel('Core Switch', opts)
    expect(lines).toEqual(['Core', 'Switch'])
  })

  it('never emits a line wider than the available box', () => {
    for (const label of ['Distribution Layer Switch Stack', 'supercalifragilisticexpialidocious', 'A B C D E F G H I J K']) {
      for (const line of fitDiagramLabel(label, opts)) {
        expect(line.length).toBeLessThanOrEqual(10)
      }
    }
  })

  it('ellipsizes rather than dropping content silently', () => {
    const lines = fitDiagramLabel('Distribution Layer Switch Stack', opts)
    expect(lines.length).toBe(2)
    expect(lines[lines.length - 1]).toMatch(/…$/)
  })

  it('hard-breaks a single word longer than the budget', () => {
    const lines = fitDiagramLabel('supercalifragilistic', opts)
    expect(lines[0].length).toBeLessThanOrEqual(10)
  })

  it('handles empty and nullish labels', () => {
    expect(fitDiagramLabel('', opts)).toEqual([''])
    expect(fitDiagramLabel(null, opts)).toEqual([''])
  })
})

describe('projectDiagramNodes', () => {
  const geom = { W: 360, H: 200, nodeW: 116, nodeH: 38 }

  it('insets the band by half a node box so edge nodes are not clipped', () => {
    const nodes = [{ id: 'a', x: 0, y: 0 }, { id: 'b', x: 100, y: 100 }]
    const { toX, toY } = projectDiagramNodes({ nodes, ...geom })
    expect(toX(0) - geom.nodeW / 2).toBeGreaterThanOrEqual(0)
    expect(toX(100) + geom.nodeW / 2).toBeLessThanOrEqual(geom.W)
    expect(toY(0) - geom.nodeH / 2).toBeGreaterThanOrEqual(0)
    expect(toY(100) + geom.nodeH / 2).toBeLessThanOrEqual(geom.H)
  })

  it('centres a degenerate axis instead of dividing by zero', () => {
    const nodes = [{ id: 'a', x: 50, y: 10 }, { id: 'b', x: 50, y: 90 }]
    const { toX } = projectDiagramNodes({ nodes, ...geom })
    expect(toX(50)).toBeCloseTo(geom.W / 2, 5)
    expect(Number.isFinite(toX(50))).toBe(true)
  })

  it('does not invert the band on a canvas narrower than one node box', () => {
    const nodes = [{ id: 'a', x: 0, y: 0 }, { id: 'b', x: 100, y: 100 }]
    const { bounds } = projectDiagramNodes({ nodes, W: 80, H: 40, nodeW: 116, nodeH: 38 })
    expect(bounds.left).toBeLessThanOrEqual(bounds.right)
    expect(bounds.top).toBeLessThanOrEqual(bounds.bottom)
  })
})

describe('fitNodeBoxWidth', () => {
  it('narrows the box so a same-row chain stops colliding', () => {
    const nodes = [0, 25, 50, 75, 100].map((x, i) => ({ id: `n${i}`, x, y: 50 }))
    const fitted = fitNodeBoxWidth({ nodes, W: 360, H: 200, nodeW: 116, nodeH: 38 })
    expect(fitted).toBeLessThan(116)
  })

  it('leaves a roomy layout alone', () => {
    const nodes = [{ id: 'a', x: 10, y: 10 }, { id: 'b', x: 90, y: 90 }]
    expect(fitNodeBoxWidth({ nodes, W: 360, H: 200, nodeW: 116, nodeH: 38 })).toBe(116)
  })

  it('ignores nodes on different rows', () => {
    const nodes = [{ id: 'a', x: 50, y: 0 }, { id: 'b', x: 50, y: 100 }]
    expect(fitNodeBoxWidth({ nodes, W: 360, H: 200, nodeW: 116, nodeH: 38 })).toBe(116)
  })

  it('respects the minimum width floor', () => {
    const nodes = Array.from({ length: 12 }, (_, i) => ({ id: `n${i}`, x: i * 9, y: 50 }))
    expect(fitNodeBoxWidth({ nodes, W: 360, H: 200, nodeW: 116, nodeH: 38, minWidth: 64 })).toBe(64)
  })
})

describe('clampLinkLabelY', () => {
  it('keeps the chip inside the canvas', () => {
    expect(clampLinkLabelY(-20, 16, 200)).toBe(0)
    expect(clampLinkLabelY(195, 16, 200)).toBe(184)
    expect(clampLinkLabelY(80, 16, 200)).toBe(80)
  })
})

describe('shipped diagram geometry', () => {
  const diagrams = collectDiagrams()

  it('has diagrams to check', () => {
    expect(diagrams.length).toBeGreaterThan(40)
  })

  for (const scenario of SCENARIOS) {
    it(`keeps every node box inside the canvas — ${scenario.name}`, () => {
      const clipped = []
      for (const d of diagrams) {
        const L = layout(d, scenario)
        for (const n of L.nodes) {
          const cx = L.toX(n.x), cy = L.toY(n.y)
          const over = Math.max(
            0,
            -(cx - L.nodeW / 2),
            (cx + L.nodeW / 2) - L.W,
            -(cy - L.nodeH / 2),
            (cy + L.nodeH / 2) - L.H,
          )
          if (over > 0.5) clipped.push(`${d.title}#${n.id} by ${Math.round(over)}px`)
        }
      }
      expect(clipped).toEqual([])
    })

    it(`keeps every node label inside its box — ${scenario.name}`, () => {
      const overflow = []
      for (const d of diagrams) {
        const L = layout(d, scenario)
        for (const n of L.nodes) {
          const lines = fitDiagramLabel(n.label, { maxWidthPx: L.labelWidth, fontSize: L.fonts.node, maxLines: 2 })
          for (const line of lines) {
            const w = line.length * L.fonts.node * MONO_ADVANCE
            if (w > L.labelWidth + 0.5) overflow.push(`${d.title}#${n.id}: "${line}"`)
          }
        }
      }
      expect(overflow).toEqual([])
    })
  }
})
