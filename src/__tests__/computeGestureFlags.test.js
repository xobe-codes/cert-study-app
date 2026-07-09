import { describe, it, expect } from 'vitest'
import { computeGestureFlags } from '../features/navigation/useAppNavigation.js'

describe('computeGestureFlags', () => {
  it('enables PTR on home when scrollable and no overlays', () => {
    const flags = computeGestureFlags({
      view: 'home',
      returnToView: 'home',
      routeScrolls: true,
      chromeOverlayOpen: false,
      blockers: {},
    })
    expect(flags.canPullRefresh).toBe(true)
    expect(flags.canEdgeBack).toBe(false)
  })

  it('disables edge back on home and lab', () => {
    expect(computeGestureFlags({
      view: 'home',
      returnToView: 'home',
      routeScrolls: true,
    }).canEdgeBack).toBe(false)

    expect(computeGestureFlags({
      view: 'lab',
      returnToView: 'labs',
      routeScrolls: true,
    }).canEdgeBack).toBe(false)
  })

  it('enables edge back when navigation stack has depth', () => {
    const flags = computeGestureFlags({
      view: 'objective',
      returnToView: 'home',
      routeScrolls: false,
      chromeOverlayOpen: false,
      blockers: {},
    })
    expect(flags.canEdgeBack).toBe(true)
    expect(flags.canPullRefresh).toBe(false)
  })

  it('respects chrome overlays and dynamic blockers', () => {
    expect(computeGestureFlags({
      view: 'labs',
      returnToView: 'home',
      routeScrolls: true,
      chromeOverlayOpen: true,
    }).canPullRefresh).toBe(false)

    expect(computeGestureFlags({
      view: 'mock',
      returnToView: 'home',
      routeScrolls: true,
      blockers: { edgeBack: true },
    }).canEdgeBack).toBe(false)
  })
})
