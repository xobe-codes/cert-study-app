# Topology SVG 99+ (iPhone-first)

## Bar

Readable Cisco-like topologies on 390×844 and landscape: distinct device glyphs, ≥10–11px labels, pinch/pan in expand modal.

## Shipped

| Piece | Where |
|-------|--------|
| Device silhouettes | `diagramDeviceIcons.jsx` |
| Font / canvas clamps | `diagramFontSizes`, `diagramCanvasSize` |
| Link label rules | `shouldShowLinkLabel` |
| Pinch / pan / double-tap reset | `diagramPanZoom.js` + `useDiagramPanZoom` |
| Expand modal zoom canvas | `CuratedDiagram.jsx` |
| E2E | `diagram-iphone-smoke.spec.js` |

## Out of scope

Theme tokens · App.jsx routing · mass factory diagram content rewrite
