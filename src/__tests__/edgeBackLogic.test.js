import { describe, it, expect } from 'vitest'
import {
  isInEdgeBackZone,
  isHorizontalEdgeSwipe,
  shouldTriggerEdgeBack,
  applyEdgeBackResistance,
  isEdgeBackExcludedTarget,
  edgeBackProgress,
  EDGE_BACK_THRESHOLD_PX,
} from '../ui/edgeBackLogic.js'

describe('edgeBackLogic', () => {
  it('detects left edge zone', () => {
    expect(isInEdgeBackZone(10)).toBe(true)
    expect(isInEdgeBackZone(24)).toBe(true)
    expect(isInEdgeBackZone(40)).toBe(false)
    expect(isInEdgeBackZone(20, 44)).toBe(true)
    expect(isInEdgeBackZone(50, 44)).toBe(false)
  })

  it('prefers horizontal drags', () => {
    expect(isHorizontalEdgeSwipe(90, 10)).toBe(true)
    expect(isHorizontalEdgeSwipe(10, 90)).toBe(false)
  })

  it('triggers past threshold', () => {
    expect(shouldTriggerEdgeBack(79)).toBe(false)
    expect(shouldTriggerEdgeBack(80)).toBe(true)
  })

  it('applies drag resistance cap', () => {
    expect(applyEdgeBackResistance(200)).toBeLessThanOrEqual(140)
    expect(applyEdgeBackResistance(50)).toBeGreaterThan(0)
  })

  it('computes progress', () => {
    expect(edgeBackProgress(40, EDGE_BACK_THRESHOLD_PX)).toBeCloseTo(0.5, 1)
  })

  it('excludes terminal and horizontal scroll targets', () => {
    const inner = { closest: (sel) => (sel === '.cisco-terminal' ? {} : null) }
    expect(isEdgeBackExcludedTarget(inner)).toBe(true)
    const carousel = { closest: (sel) => (sel.includes('ccna-h-scroll') ? {} : null) }
    expect(isEdgeBackExcludedTarget(carousel)).toBe(true)
  })
})
