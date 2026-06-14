import React, { useEffect, useRef, useState } from 'react'

const PASSES = 3
const PASS_DURATION_MS = 18000

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return undefined
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}

/**
 * Static text when it fits; otherwise a slow right-to-left marquee (3 passes, stops at start).
 * Respects prefers-reduced-motion — ellipsis + native title tooltip instead.
 */
export default function OverflowMarquee({
  text,
  passes = PASSES,
  passDurationMs = PASS_DURATION_MS,
  style,
  className,
}) {
  const containerRef = useRef(null)
  const textRef = useRef(null)
  const [overflowPx, setOverflowPx] = useState(0)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const container = containerRef.current
    const label = textRef.current
    if (!container || !label) return undefined

    const measure = () => {
      const distance = Math.max(0, label.scrollWidth - container.clientWidth)
      setOverflowPx(distance)
    }

    measure()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    ro?.observe(container)
    ro?.observe(label)
    window.addEventListener('resize', measure)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [text])

  const shouldAnimate = overflowPx > 4 && !prefersReducedMotion
  const durationSec = (passes * passDurationMs) / 1000

  return (
    <div
      ref={containerRef}
      className={className}
      title={text}
      style={{
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        ...style,
      }}
    >
      <span
        ref={textRef}
        className={shouldAnimate ? 'ccna-overflow-marquee__track' : undefined}
        style={{
          display: 'inline-block',
          whiteSpace: 'nowrap',
          ...(shouldAnimate ? {
            '--ccna-marquee-distance': `${overflowPx}px`,
            animationDuration: `${durationSec}s`,
          } : {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          }),
        }}
      >
        {text}
      </span>
    </div>
  )
}
