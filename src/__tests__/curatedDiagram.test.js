import { describe, expect, it } from 'vitest'
import { diagramNeedsExpand } from '../components/CuratedDiagram.jsx'

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
