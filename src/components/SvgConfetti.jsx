import React, { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'

const CONFETTI_COLORS = ['#EE4540', '#C72B40', '#7F1437', '#f06a65', '#d4f7d4', '#fcd980', '#baf0fa', '#fde8e8']

function buildPieces(count = 42) {
  return Array.from({ length: count }, (_, id) => {
    const shape = id % 3
    const size = 7 + (id * 17 % 9)
    return {
      id,
      shape,
      color: CONFETTI_COLORS[id % CONFETTI_COLORS.length],
      left: `${4 + (id * 23 % 92)}%`,
      delay: `${(id % 12) * 0.04}s`,
      duration: `${1.05 + (id % 7) * 0.12}s`,
      drift: `${-48 + (id * 31 % 96)}px`,
      spin: `${180 + (id * 47 % 540)}deg`,
      size,
    }
  })
}

function ConfettiPiece({ piece }) {
  const { shape, color, size } = piece
  const s = size

  if (shape === 1) {
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden>
        <circle cx={s / 2} cy={s / 2} r={s / 2.4} fill={color} />
      </svg>
    )
  }

  if (shape === 2) {
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden>
        <polygon points={`${s / 2},1 ${s - 1},${s - 1} 1,${s - 1}`} fill={color} />
      </svg>
    )
  }

  return (
    <svg width={s * 1.2} height={s * 0.65} viewBox="0 0 12 7" aria-hidden>
      <rect x="0" y="0" width="12" height="7" rx="1" fill={color} />
    </svg>
  )
}

export default function SvgConfetti({ active, onComplete, durationMs = 2200 }) {
  const pieces = useMemo(() => buildPieces(), [])
  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches,
    [],
  )

  useEffect(() => {
    if (!active) return undefined
    if (reducedMotion) {
      onComplete?.()
      return undefined
    }
    const timer = setTimeout(() => onComplete?.(), durationMs)
    return () => clearTimeout(timer)
  }, [active, durationMs, onComplete, reducedMotion])

  if (!active || reducedMotion || typeof document === 'undefined') return null

  return createPortal(
    <div className="svg-confetti-layer" aria-hidden="true">
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="svg-confetti-piece"
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            '--confetti-drift': piece.drift,
            '--confetti-spin': piece.spin,
          }}
        >
          <ConfettiPiece piece={piece} />
        </div>
      ))}
    </div>,
    document.body,
  )
}
