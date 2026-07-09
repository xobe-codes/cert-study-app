import React, { forwardRef, useCallback, useMemo, useRef, useState } from 'react'
import PullToRefreshIndicator from './PullToRefreshIndicator.jsx'
import { usePullToRefresh } from '../ui/usePullToRefresh.js'
import { useEdgeSwipeBack } from '../ui/useEdgeSwipeBack.js'
import { haptic } from '../ui/feedbackHelpers.jsx'

/**
 * @param {{
 *   children: React.ReactNode,
 *   scroll?: boolean,
 *   innerClassName?: string,
 *   pullRefresh?: { onRefresh?: () => Promise<void>|void, enabled?: boolean, reduceMotion?: boolean },
 *   edgeBack?: { onEdgeBack?: () => void, enabled?: boolean, reduceMotion?: boolean },
 * }} props
 */
const RouteShell = forwardRef(function RouteShell(
  { children, scroll = true, innerClassName = '', pullRefresh = null, edgeBack = null },
  ref,
) {
  const [gestureEl, setGestureEl] = useState(null)
  const gestureNodeRef = useRef(null)
  const mergeGestureRef = useCallback((node) => {
    if (gestureNodeRef.current !== node) {
      gestureNodeRef.current = node
      setGestureEl(node)
    }
    if (scroll && typeof ref === 'function') ref(node)
    else if (scroll && ref) ref.current = node
  }, [ref, scroll])

  const mergeFillRef = useCallback((node) => {
    if (!scroll) {
      if (gestureNodeRef.current !== node) {
        gestureNodeRef.current = node
        setGestureEl(node)
      }
    }
    if (!scroll && typeof ref === 'function') ref(node)
    else if (!scroll && ref) ref.current = node
  }, [ref, scroll])

  const ptrEnabled = Boolean(scroll && pullRefresh?.onRefresh && pullRefresh?.enabled !== false)
  const edgeEnabled = Boolean(edgeBack?.onEdgeBack && edgeBack?.enabled !== false)

  const { phase, pull, pullTransform } = usePullToRefresh({
    scrollEl: scroll ? gestureEl : null,
    onRefresh: pullRefresh?.onRefresh,
    enabled: ptrEnabled,
    reduceMotion: pullRefresh?.reduceMotion,
    onHaptic: haptic,
  })

  const { edgeTransform, edgeDragging } = useEdgeSwipeBack({
    scrollEl: gestureEl,
    onEdgeBack: edgeBack?.onEdgeBack,
    enabled: edgeEnabled,
    reduceMotion: edgeBack?.reduceMotion,
    onHaptic: haptic,
  })

  const scrollStyle = useMemo(() => {
    const ty = ptrEnabled && pullTransform > 0 ? Math.round(pullTransform) : 0
    const tx = edgeEnabled && edgeTransform > 0 ? Math.round(edgeTransform) : 0
    if (ty === 0 && tx === 0) return undefined
    const parts = []
    if (tx) parts.push(`translateX(${tx}px)`)
    if (ty) parts.push(`translateY(${ty}px)`)
    return { transform: parts.join(' ') }
  }, [ptrEnabled, pullTransform, edgeEnabled, edgeTransform])

  const scrollClass = [
    'route-scroll',
    'internal-scroll',
    ptrEnabled ? 'route-scroll--ptr-shift' : '',
    edgeEnabled ? 'route-scroll--edge-shift' : '',
    phase === 'pulling' ? 'route-scroll--ptr-dragging' : '',
    edgeDragging ? 'route-scroll--edge-dragging' : '',
  ].filter(Boolean).join(' ')

  const shellClass = [
    'route-shell',
    'site-column',
    ptrEnabled ? 'route-shell--ptr' : '',
    edgeEnabled ? 'route-shell--edge-back' : '',
  ].filter(Boolean).join(' ')

  if (!scroll) {
    return (
      <div className={`${shellClass} route-shell--fill`} ref={mergeFillRef} style={scrollStyle}>
        <div className={`route-inner ccna-container page-fill ${innerClassName}`.trim()}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className={shellClass}>
      {ptrEnabled && (
        <PullToRefreshIndicator
          phase={phase}
          pull={pull}
          reduceMotion={pullRefresh?.reduceMotion}
        />
      )}
      <div className={scrollClass} ref={mergeGestureRef} style={scrollStyle}>
        <div className={`route-inner ccna-container ccna-view ${innerClassName}`.trim()}>
          {children}
        </div>
      </div>
    </div>
  )
})

export default RouteShell
