import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { COLORS, accentColors, styles } from '../ui/appTheme.js'

const MODAL_Z = 300
const FOCUSABLE_SELECTOR = 'a[href],button:not([disabled]),textarea,input:not([type="hidden"]),select,[tabindex]:not([tabindex="-1"])'

const DIAGRAM_NODE_COLOR = { router: 'mint', switch: 'purple', subnet: 'sky', process: 'amber', pc: 'sky', server: 'silver', firewall: 'rose', cloud: 'sky', attacker: 'rose', default: 'silver' }
const DIAGRAM_NODE_ICON = { router: 'R', switch: 'S', pc: 'PC', server: 'SV', cloud: '☁', firewall: 'FW', attacker: '!', process: '●', subnet: 'NET', default: '·' }
const TYPE_SHORT = { router: 'Router', switch: 'Switch', pc: 'PC', server: 'Server', subnet: 'Net', firewall: 'FW', cloud: 'Cloud', process: 'Step', attacker: 'Threat' }

function useCompactViewport(maxWidth = 900) {
  const [compact, setCompact] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(`(max-width: ${maxWidth}px)`).matches,
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`)
    const onChange = () => setCompact(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [maxWidth])

  return compact
}

function useFocusTrap(containerRef) {
  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    const previous = document.activeElement

    function focusables() {
      return [...root.querySelectorAll(FOCUSABLE_SELECTOR)].filter(el => !el.hasAttribute('disabled'))
    }

    const nodes = focusables()
    if (nodes.length) nodes[0].focus()
    else {
      root.tabIndex = -1
      root.focus()
    }

    function onKeyDown(e) {
      if (e.key !== 'Tab') return
      const list = focusables()
      if (!list.length) {
        e.preventDefault()
        return
      }
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    root.addEventListener('keydown', onKeyDown)
    return () => {
      root.removeEventListener('keydown', onKeyDown)
      if (previous?.focus) previous.focus()
    }
  }, [containerRef])
}

function splitDiagramLabel(text, max = 16) {
  const s = String(text || '')
  if (s.length <= max) return [s]
  const mid = Math.floor(s.length / 2)
  let split = s.lastIndexOf(' ', mid)
  if (split < 4) split = s.indexOf(' ', mid)
  if (split < 0) return [s.slice(0, max), s.slice(max)]
  return [s.slice(0, split), s.slice(split + 1)]
}

function diagramShortLabel(node) {
  if (node.shortLabel) return node.shortLabel
  const label = String(node.label || '').trim()
  if (label.length <= 14) return label
  const named = label.match(/^(R\d|SW\d|VLAN\s*\d+\S*|Area\s*\d+)/i)
  if (named) return named[0]
  if (TYPE_SHORT[node.type] && label.length > 16) return TYPE_SHORT[node.type]
  const first = label.split(/\s+/)[0]
  if (first.length >= 2 && first.length <= 14) return first
  return `${label.slice(0, 12)}…`
}

export function diagramNeedsExpand(diagram) {
  const nodes = diagram?.nodes || []
  const links = diagram?.links || []
  if (nodes.length > 3) return true
  if (links.some(l => l.label)) return true
  if ((diagram?.annotations || []).length > 0) return true
  const statuses = new Set(links.map(l => l.status).filter(Boolean))
  return statuses.size > 1
}

function diagramEdgePoint(cx, cy, hw, hh, tx, ty) {
  const dx = tx - cx, dy = ty - cy
  if (!dx && !dy) return { x: cx, y: cy }
  const scale = Math.min(hw / Math.abs(dx), hh / Math.abs(dy))
  return { x: cx + dx * scale, y: cy + dy * scale }
}

function linkStroke(status) {
  if (status === 'forwarding' || status === 'normal') return COLORS.mint
  if (status === 'blocked' || status === 'dropped') return COLORS.rose
  if (status === 'modified') return COLORS.sky
  return COLORS.silverDim
}

function DiagramLegend({ linkStatuses }) {
  if (linkStatuses.size <= 1) return null
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8, fontSize: 'var(--ccna-type-micro)', color: COLORS.silverMid }}>
      {linkStatuses.has('forwarding') && <span><span style={{ color: COLORS.mint }}>—</span> Forwarding</span>}
      {linkStatuses.has('blocked') && <span><span style={{ color: COLORS.rose }}>- -</span> Blocked</span>}
      {linkStatuses.has('dropped') && <span><span style={{ color: COLORS.rose }}>- -</span> Dropped</span>}
      {linkStatuses.has('modified') && <span><span style={{ color: COLORS.sky }}>—</span> Modified</span>}
    </div>
  )
}

function DiagramAnnotations({ annotations, visuallyHidden = false }) {
  if (!annotations?.length) return null
  const list = (
    <ul style={{ margin: visuallyHidden ? 0 : '8px 0 0', paddingLeft: 16, fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.45 }}>
      {annotations.map((a, i) => <li key={i}>{a}</li>)}
    </ul>
  )
  if (visuallyHidden) {
    return (
      <div style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        {list}
      </div>
    )
  }
  return list
}

function DiagramSvg({ diagram, detail, compact, expanded = false, isMobile = false }) {
  const uid = useId().replace(/:/g, '')
  const isPreview = detail === 'preview'
  const layout = useMemo(() => {
    const nodes = diagram?.nodes || []
    if (!nodes.length) return null
    const xs = nodes.map(n => n.x), ys = nodes.map(n => n.y)
    const pad = 10
    const minX = Math.max(0, Math.min(...xs) - pad)
    const maxX = Math.min(100, Math.max(...xs) + pad)
    const minY = Math.max(0, Math.min(...ys) - pad)
    const maxY = Math.min(100, Math.max(...ys) + pad)
    const spanX = Math.max(28, maxX - minX)
    const spanY = Math.max(22, maxY - minY)
    const W = expanded ? (isMobile ? 390 : 520) : (isMobile ? 340 : 360)
    const H = Math.round(W * (spanY / spanX) * 0.72)
    let clampH
    if (expanded) clampH = Math.min(Math.max(H, isMobile ? 260 : 200), isMobile ? 520 : 420)
    else if (compact || isPreview) clampH = Math.min(H, isMobile ? 240 : 150)
    else clampH = Math.min(Math.max(H, isMobile ? 160 : 130), isMobile ? 300 : 240)
    const density = nodes.length
    const nodeW = Math.min(expanded ? (isMobile ? 120 : 132) : (isMobile ? 108 : 118), Math.max(76, (expanded ? 116 : 108) - density * 4))
    const nodeH = expanded ? (isMobile ? 36 : 34) : (isMobile ? 32 : 30)
    const fontSize = expanded
      ? (isMobile ? 10 : 9)
      : (compact || isPreview)
        ? (isMobile ? 8.5 : 7.5)
        : density > 5 ? (isMobile ? 8.25 : 7.5) : (isMobile ? 9 : 8.25)
    const toX = v => ((v - minX) / spanX) * W
    const toY = v => ((v - minY) / spanY) * clampH
    const labelMax = isPreview
      ? (isMobile ? 16 : 12)
      : compact ? (isMobile ? 16 : 14) : expanded ? (isMobile ? 24 : 22) : (isMobile ? 20 : 18)
    const nodeMap = Object.fromEntries(nodes.map(n => {
      const text = isPreview ? diagramShortLabel(n) : n.label
      const lines = splitDiagramLabel(text, labelMax)
      return [n.id, { ...n, cx: toX(n.x), cy: toY(n.y), lines, hw: nodeW / 2, hh: nodeH / 2 }]
    }))
    return { W, H: clampH, nodeW, nodeH, fontSize, nodeMap, nodes }
  }, [diagram, compact, expanded, isPreview, isMobile])

  if (!layout) return null
  const { W, H, nodeW, nodeH, fontSize, nodeMap, nodes } = layout
  const nodeAt = id => nodeMap[id]
  const showLinkLabels = detail === 'full'
  const showGlow = detail === 'full'

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block', minHeight: H }}
      role="img"
      aria-label={diagram.title}
    >
      <defs>
        <marker id={`${uid}-fwd`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={COLORS.mint} />
        </marker>
        <marker id={`${uid}-blk`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={COLORS.rose} />
        </marker>
        {showGlow && (
          <filter id={`${uid}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="var(--ccna-bg)" floodOpacity="0.9" />
          </filter>
        )}
      </defs>
      <rect x="0" y="0" width={W} height={H} fill={COLORS.surface} rx="0" />

      {(diagram.links || []).map(l => {
        const a = nodeAt(l.source), b = nodeAt(l.target)
        if (!a || !b) return null
        const p1 = diagramEdgePoint(a.cx, a.cy, a.hw, a.hh, b.cx, b.cy)
        const p2 = diagramEdgePoint(b.cx, b.cy, b.hw, b.hh, a.cx, a.cy)
        const stroke = linkStroke(l.status)
        const dashed = l.status === 'dropped' || l.status === 'blocked'
        const showArrow = l.status === 'forwarding' || l.status === 'normal' || l.status === 'modified'
        const markerId = dashed ? `${uid}-blk` : `${uid}-fwd`
        const midX = (p1.x + p2.x) / 2, midY = (p1.y + p2.y) / 2
        const labelShort = l.label && l.label.length > 28 ? `${l.label.slice(0, 26)}…` : l.label
        return (
          <g key={l.id}>
            <line
              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={stroke} strokeWidth={isPreview ? 1.5 : 2}
              strokeDasharray={dashed ? '5 4' : undefined} strokeLinecap="round"
              markerEnd={showArrow ? `url(#${markerId})` : undefined}
              opacity={dashed ? 0.85 : 1}
            />
            {labelShort && showLinkLabels && (
              <g>
                <rect x={midX - 52} y={midY - 16} width={104} height={12} rx="4" fill={COLORS.bg} opacity="0.92" />
                <text x={midX} y={midY - 7} fontSize={expanded ? 7.5 : 6.5} fill={COLORS.silverMid} textAnchor="middle">{labelShort}</text>
              </g>
            )}
          </g>
        )
      })}

      {nodes.map(n => {
        const nd = nodeMap[n.id]
        const accent = n.status === 'error' ? 'rose' : n.status === 'highlighted' ? 'mint' : DIAGRAM_NODE_COLOR[n.type] || DIAGRAM_NODE_COLOR.default
        const c = accentColors(accent)
        const icon = DIAGRAM_NODE_ICON[n.type] || DIAGRAM_NODE_ICON.default
        const textX = nd.cx + 8
        const lineH = fontSize + 2
        const textY = nd.lines.length > 1 ? nd.cy - lineH / 2 + 2 : nd.cy + 3
        return (
          <g key={n.id} filter={showGlow ? `url(#${uid}-glow)` : undefined}>
            <rect
              x={nd.cx - nodeW / 2} y={nd.cy - nodeH / 2} width={nodeW} height={nodeH} rx="8"
              fill={c.dim} stroke={c.text}
              strokeWidth={n.status === 'highlighted' || n.status === 'error' ? 2 : 1}
            />
            <circle cx={nd.cx - nodeW / 2 + 11} cy={nd.cy} r="7" fill={COLORS.bg} stroke={c.border} strokeWidth="1" />
            <text x={nd.cx - nodeW / 2 + 11} y={nd.cy + (icon.length > 1 ? 2.5 : 3.5)} fontSize={icon.length > 1 ? 5 : 7} fill={c.text} textAnchor="middle" fontWeight="700" fontFamily="ui-monospace, Menlo, monospace">{icon}</text>
            {nd.lines.map((line, i) => (
              <text
                key={i} x={textX} y={textY + i * lineH}
                fontSize={fontSize} fill={c.text} textAnchor="middle"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              >{line}</text>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

function DiagramCard({ diagram, detail, compact, expandable, onExpand, showTitle = true, ariaExpanded = false, isMobile = false }) {
  const linkStatuses = new Set((diagram.links || []).map(l => l.status).filter(Boolean))
  const isPreview = detail === 'preview'
  const maxHeight = isMobile
    ? (isPreview ? (compact ? 260 : 280) : compact ? 240 : 320)
    : (isPreview ? (compact ? 148 : 200) : compact ? 168 : 260)

  const canvas = (
    <div
      className="curated-diagram-canvas"
      style={{
        width: '100%',
        maxWidth: '100%',
        maxHeight,
        ...(isMobile ? { minHeight: isPreview ? 220 : 180, height: maxHeight } : { aspectRatio: '5 / 3' }),
        borderRadius: 10,
        overflow: 'hidden',
        background: COLORS.surface,
        border: `1px solid ${expandable ? COLORS.skyBorder : COLORS.border}`,
        position: 'relative',
      }}
    >
      <DiagramSvg diagram={diagram} detail={detail} compact={compact} isMobile={isMobile} />
      {expandable && !isMobile && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', right: 8, bottom: 8, display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 'var(--ccna-type-micro)', fontWeight: 600, color: COLORS.sky,
            background: COLORS.skyDim, border: `1px solid ${COLORS.skyBorder}`, borderRadius: 6, padding: '3px 7px',
            pointerEvents: 'none',
          }}
        >
          <span>↗</span><span>View full</span>
        </div>
      )}
    </div>
  )

  const showPreviewAnnotations = isPreview && isMobile && (diagram.annotations?.length > 0)

  const body = (
    <>
      {showTitle && !compact && (
        <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid, marginBottom: 8, letterSpacing: 0.4 }}>
          🗺️ {diagram.title.toUpperCase()}
        </div>
      )}
      {expandable && !isMobile ? (
        <button
          type="button"
          onClick={onExpand}
          aria-expanded={ariaExpanded}
          aria-label={`View full diagram: ${diagram.title}`}
          style={{
            display: 'block', width: '100%', padding: 0, margin: 0, border: 'none', background: 'none',
            cursor: 'pointer', borderRadius: 10, textAlign: 'left',
          }}
        >
          {canvas}
        </button>
      ) : (
        <div
          role={expandable ? 'button' : undefined}
          tabIndex={expandable ? 0 : undefined}
          onClick={expandable ? onExpand : undefined}
          onKeyDown={expandable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onExpand?.() } } : undefined}
          aria-label={expandable ? `View full diagram: ${diagram.title}` : undefined}
          style={expandable ? { cursor: 'pointer' } : undefined}
        >
          {canvas}
        </div>
      )}
      {expandable && isMobile && (
        <button
          type="button"
          className="curated-diagram-expand-btn"
          onClick={onExpand}
          aria-expanded={ariaExpanded}
          aria-label={`View full diagram: ${diagram.title}`}
          style={{
            ...styles.secondaryBtn,
            width: '100%',
            minHeight: 44,
            marginTop: 10,
            borderColor: COLORS.skyBorder,
            background: COLORS.skyDim,
            color: COLORS.sky,
            fontWeight: 600,
          }}
        >
          View full diagram ↗
        </button>
      )}
      {detail === 'full' && <DiagramLegend linkStatuses={linkStatuses} />}
      {detail === 'full' && <DiagramAnnotations annotations={diagram.annotations} />}
      {showPreviewAnnotations && <DiagramAnnotations annotations={diagram.annotations} />}
      {isPreview && !showPreviewAnnotations && <DiagramAnnotations annotations={diagram.annotations} visuallyHidden />}
    </>
  )

  return (
    <div className="curated-diagram-card" style={{ ...styles.card, padding: compact ? 10 : 12, overflow: 'hidden', position: 'relative', maxWidth: '100%' }}>
      {body}
    </div>
  )
}

function DiagramExpandModal({ diagram, onClose, isMobile = false }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  useFocusTrap(dialogRef)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const linkStatuses = new Set((diagram.links || []).map(l => l.status).filter(Boolean))

  return (
    <div
      ref={dialogRef}
      className="ccna-overlay curated-diagram-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diagram-modal-title"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: MODAL_Z,
        display: 'flex',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'center',
        padding: isMobile ? 0 : '16px',
        paddingTop: isMobile ? 0 : 'max(16px, env(safe-area-inset-top))',
        paddingBottom: isMobile ? 0 : 'max(16px, env(safe-area-inset-bottom))',
      }}
      onClick={onClose}
    >
      <div
        className="curated-diagram-modal-panel"
        style={{
          ...styles.card,
          width: '100%',
          maxWidth: isMobile ? '100%' : 680,
          maxHeight: isMobile ? '100%' : 'min(88vh, 720px)',
          height: isMobile ? '100%' : 'auto',
          overflowY: isMobile ? 'hidden' : 'auto',
          padding: isMobile ? 0 : 16,
          margin: 0,
          borderRadius: isMobile ? 0 : undefined,
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="curated-diagram-modal-header"
          style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
            padding: isMobile ? 'max(12px, env(safe-area-inset-top)) 16px 10px' : '0 0 10px',
            flexShrink: 0,
          }}
        >
          <h2 id="diagram-modal-title" style={{ ...styles.h2, margin: 0, fontSize: 'var(--ccna-type-md)', lineHeight: 1.35, paddingRight: 8 }}>
            🗺️ {diagram.title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close diagram"
            style={{ ...styles.secondaryBtn, padding: '10px 14px', minHeight: 44, minWidth: 44, flexShrink: 0 }}
          >
            ✕
          </button>
        </div>
        <div
          className="curated-diagram-modal-body"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: isMobile ? '0 12px' : 0,
          }}
        >
          <div style={{ width: '100%', minHeight: isMobile ? 280 : 220, maxHeight: isMobile ? 'none' : 'min(70vh, 480px)' }}>
            <DiagramSvg diagram={diagram} detail="full" expanded isMobile={isMobile} />
          </div>
          <div style={{ padding: isMobile ? '12px 4px max(16px, env(safe-area-inset-bottom))' : '12px 0 0' }}>
            <DiagramLegend linkStatuses={linkStatuses} />
            <DiagramAnnotations annotations={diagram.annotations} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CuratedDiagram({ diagram, compact = false }) {
  const [open, setOpen] = useState(false)
  const isMobile = useCompactViewport()
  const needsExpand = useMemo(() => diagramNeedsExpand(diagram), [diagram])

  if (!diagram?.nodes?.length) return null

  if (!needsExpand) {
    return <DiagramCard diagram={diagram} detail="full" compact={compact} isMobile={isMobile} />
  }

  return (
    <>
      <DiagramCard
        diagram={diagram}
        detail="preview"
        compact={compact}
        expandable
        ariaExpanded={open}
        onExpand={() => setOpen(true)}
        isMobile={isMobile}
      />
      {open && <DiagramExpandModal diagram={diagram} onClose={() => setOpen(false)} isMobile={isMobile} />}
    </>
  )
}
