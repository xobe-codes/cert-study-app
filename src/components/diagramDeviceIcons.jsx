import React from 'react'

/** Native SVG device glyphs as <g> children (16×16 design space). */
export function DiagramDeviceIconG({ type, color, cx, cy, size = 14 }) {
  const s = size / 16
  const common = {
    fill: 'none',
    stroke: color,
    strokeWidth: 1.4,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
  const wrap = (children) => (
    <g transform={`translate(${cx - size / 2}, ${cy - size / 2}) scale(${s})`}>{children}</g>
  )

  switch (type) {
    case 'router':
      return wrap(
        <>
          <rect x="2" y="5" width="12" height="7" rx="1.5" {...common} />
          <circle cx="5" cy="8.5" r="1" fill={color} stroke="none" />
          <circle cx="8" cy="8.5" r="1" fill={color} stroke="none" />
          <circle cx="11" cy="8.5" r="1" fill={color} stroke="none" />
          <path d="M4 5V3.5M12 5V3.5M4 3.5h2M10 3.5h2" {...common} />
        </>,
      )
    case 'switch':
      return wrap(
        <>
          <rect x="1.5" y="4" width="13" height="8" rx="1.2" {...common} />
          <path d="M4 7h2M7 7h2M10 7h2M4 10h2M7 10h2M10 10h2" {...common} />
        </>,
      )
    case 'pc':
      return wrap(
        <>
          <rect x="2" y="2.5" width="12" height="8" rx="1" {...common} />
          <path d="M6 12.5h4M8 10.5v2" {...common} />
        </>,
      )
    case 'server':
      return wrap(
        <>
          <rect x="3" y="2" width="10" height="3.5" rx="0.8" {...common} />
          <rect x="3" y="6.25" width="10" height="3.5" rx="0.8" {...common} />
          <rect x="3" y="10.5" width="10" height="3.5" rx="0.8" {...common} />
          <circle cx="5.2" cy="3.75" r="0.6" fill={color} stroke="none" />
          <circle cx="5.2" cy="8" r="0.6" fill={color} stroke="none" />
          <circle cx="5.2" cy="12.25" r="0.6" fill={color} stroke="none" />
        </>,
      )
    case 'firewall':
      return wrap(
        <>
          <path d="M8 2 L13 4.5 V8.5 C13 11.5 10.5 13.5 8 14.5 C5.5 13.5 3 11.5 3 8.5 V4.5 Z" {...common} />
          <path d="M8 6.5v4M6.5 8.5h3" {...common} />
        </>,
      )
    case 'cloud':
      return wrap(
        <path d="M5 11.5h7.5a2.5 2.5 0 0 0 .2-5 3.2 3.2 0 0 0-6.1-1.2A2.4 2.4 0 0 0 5 11.5z" {...common} />,
      )
    case 'attacker':
      return wrap(
        <>
          <path d="M8 2.5 L14 13.5 H2 Z" {...common} />
          <path d="M8 6.5v3.5M8 11.5v.5" {...common} />
        </>,
      )
    case 'process':
      return wrap(
        <>
          <circle cx="8" cy="8" r="5.5" {...common} />
          <path d="M8 5.5v5M5.5 8h5" {...common} />
        </>,
      )
    case 'subnet':
      return wrap(
        <path d="M8 2 L13.5 5.5 V11.5 L8 15 L2.5 11.5 V5.5 Z" {...common} />,
      )
    case 'highlight':
      return wrap(
        <>
          <circle cx="8" cy="8" r="5.5" {...common} />
          <path d="M8 5.5v5M5.5 8h5" {...common} />
        </>,
      )
    default:
      return wrap(<circle cx="8" cy="8" r="5" {...common} />)
  }
}

export function diagramFontSizes({ expanded, compact, isPreview, isMobile, density }) {
  if (expanded) {
    return { node: isMobile ? 11.5 : 10, link: isMobile ? 9.5 : 8, icon: isMobile ? 15 : 14 }
  }
  if (compact || isPreview) {
    return { node: isMobile ? 10 : 8.5, link: isMobile ? 9 : 7.5, icon: isMobile ? 14 : 12 }
  }
  const dense = density > 5
  return {
    node: isMobile ? (dense ? 10 : 11) : (dense ? 8.5 : 9),
    link: isMobile ? 9 : 7.5,
    icon: isMobile ? 14 : 12,
  }
}

export function shouldShowLinkLabel(link, { detail, linkCount }) {
  if (!link?.label) return false
  if (detail === 'full') return true
  if (link.priority || link.important) return true
  if (link.status === 'blocked' || link.status === 'dropped') return true
  return linkCount <= 3
}

export function diagramCanvasSize({ expanded, compact, isPreview, isMobile, isLandscape, spanX, spanY }) {
  let W
  if (expanded) W = isMobile ? (isLandscape ? 520 : 390) : 520
  else W = isMobile ? (isLandscape ? 420 : 360) : 360
  const H = Math.round(W * (spanY / spanX) * (isLandscape ? 0.55 : 0.72))
  let clampH
  if (expanded) {
    clampH = Math.min(Math.max(H, isMobile ? (isLandscape ? 200 : 280) : 200), isMobile ? (isLandscape ? 340 : 560) : 420)
  } else if (compact || isPreview) {
    clampH = Math.min(Math.max(H, isMobile ? 200 : 130), isMobile ? (isLandscape ? 200 : 260) : 160)
  } else {
    clampH = Math.min(Math.max(H, isMobile ? 180 : 130), isMobile ? (isLandscape ? 240 : 320) : 240)
  }
  return { W, H: clampH }
}
