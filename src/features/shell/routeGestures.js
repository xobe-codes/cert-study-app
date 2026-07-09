/** Pull-to-refresh + edge-back props for AppLoadedShell (keeps App.jsx slim). */
export function buildRouteGestures({
  refreshApp,
  goBack,
  canPullRefresh,
  canEdgeBack,
  chromeOverlayOpen,
  gestureBlocks,
  reduceMotion,
}) {
  return {
    pullRefresh: {
      onRefresh: refreshApp,
      enabled: canPullRefresh && !chromeOverlayOpen && !gestureBlocks.pull,
      reduceMotion,
    },
    edgeBack: {
      onEdgeBack: goBack,
      enabled: canEdgeBack && !chromeOverlayOpen && !gestureBlocks.edge,
      reduceMotion,
    },
  }
}
