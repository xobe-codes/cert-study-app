import { describe, it, expect } from 'vitest'
import {
  applyPullResistance,
  pullProgress,
  shouldTriggerRefresh,
  isVerticalPull,
  ptrPhaseLabel,
  isInteractivePointerTarget,
  PTR_THRESHOLD,
  PTR_MAX_PULL,
} from '../ui/pullToRefreshLogic.js'

describe('pullToRefreshLogic', () => {
  it('applies resistance and caps pull distance', () => {
    expect(applyPullResistance(0)).toBe(0)
    expect(applyPullResistance(200)).toBe(90)
    expect(applyPullResistance(300)).toBe(PTR_MAX_PULL)
    expect(applyPullResistance(100)).toBeLessThan(100)
  })

  it('computes progress toward refresh threshold', () => {
    expect(pullProgress(0)).toBe(0)
    expect(pullProgress(PTR_THRESHOLD / 2)).toBeCloseTo(0.5)
    expect(pullProgress(PTR_THRESHOLD)).toBe(1)
    expect(pullProgress(PTR_THRESHOLD * 2)).toBe(1)
  })

  it('triggers refresh at threshold', () => {
    expect(shouldTriggerRefresh(PTR_THRESHOLD - 1)).toBe(false)
    expect(shouldTriggerRefresh(PTR_THRESHOLD)).toBe(true)
  })

  it('prefers vertical pulls over horizontal pans', () => {
    expect(isVerticalPull(40, 10)).toBe(false)
    expect(isVerticalPull(4, 40)).toBe(true)
    expect(isVerticalPull(0, 20)).toBe(true)
  })

  it('exposes phase labels for screen readers', () => {
    expect(ptrPhaseLabel('idle')).toMatch(/pull down/i)
    expect(ptrPhaseLabel('refreshing')).toMatch(/refreshing/i)
    expect(ptrPhaseLabel('done')).toMatch(/updated/i)
  })

  it('ignores interactive pointer targets', () => {
    expect(isInteractivePointerTarget({ tagName: 'BUTTON', getAttribute: () => null })).toBe(true)
    expect(isInteractivePointerTarget({ tagName: 'DIV', getAttribute: () => null, closest: () => null })).toBe(false)
  })
})
