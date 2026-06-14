import React, { useId } from 'react'
import { COLORS } from '../ui/appTheme.js'

const PAD = { top: 18, right: 12, bottom: 28, left: 36 }

function niceTicks(max, count = 4) {
  const step = Math.max(1, Math.ceil(max / count))
  const ticks = []
  for (let v = 0; v <= max; v += step) ticks.push(v)
  if (ticks[ticks.length - 1] < max) ticks.push(max)
  return ticks
}

export default function StatsComboChart({
  points = [],
  barMax = 10,
  lineMax = 100,
  height = 200,
  barLabel = 'Questions',
  lineLabel = 'Readiness',
  referenceLine = 70,
}) {
  const gid = useId().replace(/:/g, '')
  const width = 360
  const innerW = width - PAD.left - PAD.right
  const innerH = height - PAD.top - PAD.bottom

  if (!points.length) {
    return (
      <div className="stats-combo-chart stats-combo-chart--empty" style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid }}>Study activity will appear here</span>
      </div>
    )
  }

  const n = points.length
  const slot = innerW / n
  const barW = Math.min(28, slot * 0.55)

  const barTicks = niceTicks(barMax, 3)
  const lineTicks = [0, 25, 50, 75, 100]

  const yBar = v => PAD.top + innerH - (v / barMax) * innerH
  const yLine = v => PAD.top + innerH - (v / lineMax) * innerH
  const xCenter = i => PAD.left + slot * i + slot / 2

  const linePts = points
    .map((p, i) => (p.line != null ? `${xCenter(i)},${yLine(p.line)}` : null))
    .filter(Boolean)

  const refY = yLine(referenceLine)

  return (
    <svg
      className="stats-combo-chart"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label={`${lineLabel} and ${barLabel} over time`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={`${gid}-bar`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={COLORS.purpleM} />
          <stop offset="100%" stopColor={COLORS.mint} stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`${gid}-line`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={COLORS.purpleGlow} />
          <stop offset="100%" stopColor={COLORS.brandGlow} />
        </linearGradient>
      </defs>

      {lineTicks.map(t => (
        <g key={`grid-${t}`}>
          <line
            x1={PAD.left}
            y1={yLine(t)}
            x2={width - PAD.right}
            y2={yLine(t)}
            stroke={COLORS.border}
            strokeWidth="1"
            opacity="0.45"
          />
          <text
            x={PAD.left - 6}
            y={yLine(t) + 4}
            textAnchor="end"
            fontSize="9"
            fill={COLORS.silverDim}
            fontFamily="inherit"
          >
            {t}
          </text>
        </g>
      ))}

      {referenceLine != null && (
        <line
          x1={PAD.left}
          y1={refY}
          x2={width - PAD.right}
          y2={refY}
          stroke={COLORS.mint}
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.55"
        />
      )}

      {points.map((p, i) => {
        if (!p.bar) return null
        const h = (p.bar / barMax) * innerH
        const x = xCenter(i) - barW / 2
        const y = PAD.top + innerH - h
        return (
          <rect
            key={`bar-${p.day}`}
            x={x}
            y={y}
            width={barW}
            height={Math.max(2, h)}
            rx={barW / 2}
            fill={`url(#${gid}-bar)`}
            opacity={0.88}
          />
        )
      })}

      {linePts.length >= 2 && (
        <polyline
          points={linePts.join(' ')}
          fill="none"
          stroke={`url(#${gid}-line)`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {points.map((p, i) => {
        if (p.line == null) return null
        return (
          <circle
            key={`dot-${p.day}`}
            cx={xCenter(i)}
            cy={yLine(p.line)}
            r="4"
            fill={COLORS.card}
            stroke={COLORS.purpleGlow}
            strokeWidth="2"
          />
        )
      })}

      {points.map((p, i) => {
        if (p.mock == null) return null
        return (
          <circle
            key={`mock-${p.day}`}
            cx={xCenter(i)}
            cy={yLine(p.mock)}
            r="5.5"
            fill={COLORS.brand}
            stroke={COLORS.silver}
            strokeWidth="1.5"
          />
        )
      })}

      {points.map((p, i) => {
        const show = i === 0 || i === n - 1 || (n <= 7)
        if (!show) return null
        const label = new Date(p.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        return (
          <text
            key={`x-${p.day}`}
            x={xCenter(i)}
            y={height - 8}
            textAnchor="middle"
            fontSize="9"
            fill={COLORS.silverMid}
            fontFamily="inherit"
          >
            {label}
          </text>
        )
      })}

      <text x={PAD.left} y={12} fontSize="9" fill={COLORS.silverMid} fontFamily="inherit">{lineLabel} %</text>
      <text x={width - PAD.right} y={12} textAnchor="end" fontSize="9" fill={COLORS.silverMid} fontFamily="inherit">{barLabel}</text>
    </svg>
  )
}
