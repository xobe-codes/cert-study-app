import React, { forwardRef, useCallback, useMemo, useRef, useState } from 'react'
import PullToRefreshIndicator from './PullToRefreshIndicator.jsx'
import { usePullToRefresh } from '../ui/usePullToRefresh.js'
import { haptic } from '../ui/feedbackHelpers.jsx'

/**
 * @param {{
 *   children: React.ReactNode,
 *   scroll?: boolean,
 *   innerClassName?: string,
 *   pullRefresh?: { onRefresh?: () => Promise<void>|void, enabled?: boolean, reduceMotion?: boolean },
 * }} props
 */
const RouteShell = forwardRef(function RouteShell(
  { children, scroll = true, innerClassName = '', pullRefresh = null },
  ref,
) {
  const [scrollEl, setScrollEl] = useState(null)
  const scrollNodeRef = useRef(null)
  const mergeScrollRef = useCallback((node) => {
    if (scrollNodeRef.current !== node) {
      scrollNodeRef.current = node
      setScrollEl(node)
    }
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }, [ref])

  const ptrEnabled = Boolean(scroll && pullRefresh?.onRefresh && pullRefresh?.enabled !== false)
  const { phase, pull, pullTransform } = usePullToRefresh({
    scrollEl,
    onRefresh: pullRefresh?.onRefresh,
    enabled: ptrEnabled,
    reduceMotion: pullRefresh?.reduceMotion,
    onHaptic: haptic,
  })

  const scrollStyle = useMemo(() => {
    if (!ptrEnabled || pullTransform <= 0) return undefined
    return { transform: `translateY(${Math.round(pullTransform)}px)` }
  }, [ptrEnabled, pullTransform])

  const scrollClass = [
    'route-scroll',
    'internal-scroll',
    ptrEnabled ? 'route-scroll--ptr-shift' : '',
    phase === 'pulling' ? 'route-scroll--ptr-dragging' : '',
  ].filter(Boolean).join(' ')

  if (!scroll) {
    return (
      <div className="route-shell route-shell--fill site-column">
        <div className={`route-inner ccna-container page-fill ${innerClassName}`.trim()}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className={`route-shell site-column${ptrEnabled ? ' route-shell--ptr' : ''}`}>
      {ptrEnabled && (
        <PullToRefreshIndicator
          phase={phase}
          pull={pull}
          reduceMotion={pullRefresh?.reduceMotion}
        />
      )}
      <div className={scrollClass} ref={mergeScrollRef} style={scrollStyle}>
        <div className={`route-inner ccna-container ccna-view ${innerClassName}`.trim()}>
          {children}
        </div>
      </div>
    </div>
  )
})

export default RouteShell
