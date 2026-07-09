import { describe, it, expect } from 'vitest'
import { buildRouteGestures } from '../features/shell/routeGestures.js'

describe('buildRouteGestures', () => {
  it('wires onEdgeBack for RouteShell', () => {
    const goBack = () => {}
    const gestures = buildRouteGestures({
      refreshApp: async () => {},
      goBack,
      canPullRefresh: true,
      canEdgeBack: true,
      chromeOverlayOpen: false,
      gestureBlocks: { pull: false, edge: false },
      reduceMotion: false,
    })
    expect(gestures.edgeBack.onEdgeBack).toBe(goBack)
    expect(gestures.edgeBack.enabled).toBe(true)
  })
})
