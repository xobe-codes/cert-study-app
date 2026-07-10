import { describe, expect, it } from 'vitest'
import { diagramNeedsExpand } from '../components/CuratedDiagram.jsx'
import {
  diagramFontSizes,
  shouldShowLinkLabel,
  diagramCanvasSize,
} from '../components/diagramDeviceIcons.jsx'
import {
  applyPan,
  applyPinchZoom,
  clampDiagramScale,
  createDiagramPanZoomState,
  resetDiagramPanZoom,
} from '../components/diagramPanZoom.js'

describe('diagramNeedsExpand', () => {
  it('skips expand for simple 3-node diagrams without labels', () => {
    expect(diagramNeedsExpand({
      nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      links: [{ id: 'l1', source: 'a', target: 'b' }],
    })).toBe(false)
  })

  it('requires expand when a link has a label', () => {
    expect(diagramNeedsExpand({
      nodes: [{ id: 'a' }, { id: 'b' }],
      links: [{ id: 'l1', source: 'a', target: 'b', label: 'area 0' }],
    })).toBe(true)
  })

  it('requires expand when there are more than three nodes', () => {
    expect(diagramNeedsExpand({
      nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
      links: [],
    })).toBe(true)
  })

  it('requires expand when annotations are present', () => {
    expect(diagramNeedsExpand({
      nodes: [{ id: 'a' }, { id: 'b' }],
      links: [],
      annotations: ['One note'],
    })).toBe(true)
  })
})

describe('diagramFontSizes (iPhone floors)', () => {
  it('keeps mobile preview node text ≥10', () => {
    expect(diagramFontSizes({ expanded: false, compact: false, isPreview: true, isMobile: true, density: 4 }).node).toBeGreaterThanOrEqual(10)
  })

  it('keeps mobile expanded node text ≥11', () => {
    expect(diagramFontSizes({ expanded: true, compact: false, isPreview: false, isMobile: true, density: 6 }).node).toBeGreaterThanOrEqual(11)
  })
})

describe('shouldShowLinkLabel', () => {
  it('shows all labels in full detail', () => {
    expect(shouldShowLinkLabel({ label: 'Gi0/0' }, { detail: 'full', linkCount: 9 })).toBe(true)
  })

  it('shows blocked labels in preview', () => {
    expect(shouldShowLinkLabel({ label: 'alt', status: 'blocked' }, { detail: 'preview', linkCount: 9 })).toBe(true)
  })

  it('shows labels when few links', () => {
    expect(shouldShowLinkLabel({ label: 'cost 10' }, { detail: 'preview', linkCount: 2 })).toBe(true)
  })
})

describe('diagramCanvasSize', () => {
  it('uses wider canvas in landscape mobile', () => {
    const port = diagramCanvasSize({ expanded: true, isMobile: true, isLandscape: false, spanX: 80, spanY: 60 })
    const land = diagramCanvasSize({ expanded: true, isMobile: true, isLandscape: true, spanX: 80, spanY: 60 })
    expect(land.W).toBeGreaterThan(port.W)
  })
})

describe('diagramPanZoom', () => {
  it('clamps scale', () => {
    expect(clampDiagramScale(0.5)).toBe(1)
    expect(clampDiagramScale(9)).toBe(3)
  })

  it('resets to identity', () => {
    expect(resetDiagramPanZoom()).toEqual(createDiagramPanZoomState())
  })

  it('pans only when zoomed', () => {
    const z = applyPinchZoom(createDiagramPanZoomState(), { scale: 2, focalX: 100, focalY: 100 })
    const panned = applyPan(z, { dx: 10, dy: -5 })
    expect(panned.x).not.toBe(z.x)
    expect(applyPan(createDiagramPanZoomState(), { dx: 10, dy: 10 })).toEqual(createDiagramPanZoomState())
  })
})
