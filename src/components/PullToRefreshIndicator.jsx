import React from 'react'
import { pullProgress, ptrPhaseLabel } from '../ui/pullToRefreshLogic.js'

/** Accessible pull-to-refresh affordance above scroll content. */
export default function PullToRefreshIndicator({ phase, pull, reduceMotion = false }) {
  const visible = phase === 'pulling' || phase === 'refreshing' || phase === 'done'
  const progress = pullProgress(pull)
  const rotate = Math.round(progress * 320)

  return (
    <div
      className={[
        'pull-refresh-host',
        visible ? 'pull-refresh-host--visible' : '',
        phase === 'refreshing' ? 'pull-refresh-host--refreshing' : '',
        phase === 'pulling' ? 'pull-refresh-host--pulling' : '',
      ].filter(Boolean).join(' ')}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-ptr-phase={phase}
      data-ptr-pull={Math.round(pull)}
    >
      <div
        className="pull-refresh-host__icon"
        style={phase === 'pulling' && !reduceMotion ? { '--ptr-rotate': `${rotate}deg` } : undefined}
        aria-hidden="true"
      />
      <span>{ptrPhaseLabel(phase)}</span>
    </div>
  )
}
