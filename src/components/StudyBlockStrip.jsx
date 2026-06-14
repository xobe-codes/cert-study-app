import React, { useEffect, useRef, useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { formatStudyTime } from '../studyBlock/studyBlockLogic.js'
import { useStudyBlock } from './StudyBlockProvider.jsx'

export default function StudyBlockStrip({ objectiveId }) {
  const { state, isActive, modes, start, pause, resume, stop, setMode } = useStudyBlock()
  const [showModes, setShowModes] = useState(false)
  const modesRef = useRef(null)

  useEffect(() => {
    if (!showModes) return undefined
    const close = (e) => {
      if (modesRef.current && !modesRef.current.contains(e.target)) setShowModes(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [showModes])

  const mode = modes[state.mode] || modes.pomodoro
  const onOtherObjective = isActive && state.objectiveId && state.objectiveId !== objectiveId

  function handlePrimary() {
    if (state.status === 'idle') {
      start(objectiveId)
      return
    }
    if (state.status === 'paused') {
      resume()
      return
    }
    pause()
  }

  const phaseLabel = state.status === 'break'
    ? 'Break'
    : state.status === 'paused'
      ? (state.pausedReason === 'hidden' ? 'Paused (tab hidden)' : 'Paused')
      : state.status === 'focus'
        ? mode.label
        : 'Study block'

  const timeLabel = isActive || state.status === 'paused'
    ? formatStudyTime(state.remainingSec)
    : formatStudyTime(mode.focusSec)

  const progress = state.phaseDurationSec
    ? Math.min(1, 1 - state.remainingSec / state.phaseDurationSec)
    : 0

  return (
    <div className="study-block-strip" ref={modesRef}>
      <button
        type="button"
        className={`study-block-chip${isActive ? ' study-block-chip--active' : ''}${state.status === 'break' ? ' study-block-chip--break' : ''}`}
        onClick={handlePrimary}
        aria-label={
          state.status === 'idle'
            ? `Start ${mode.label} study block`
            : state.status === 'paused'
              ? 'Resume study block'
              : 'Pause study block'
        }
        title={state.status === 'idle' ? `Start ${mode.shortLabel} block` : undefined}
      >
        {state.status === 'idle' && <span className="study-block-chip__play" aria-hidden="true">▶</span>}
        <span className="study-block-chip__time" style={{ fontVariantNumeric: 'tabular-nums' }}>{timeLabel}</span>
        {(isActive || state.status === 'paused') && (
          <span className="study-block-chip__phase">{phaseLabel}</span>
        )}
        {isActive && (
          <span
            className="study-block-chip__progress"
            style={{ transform: `scaleX(${progress})` }}
            aria-hidden="true"
          />
        )}
      </button>

      {state.status === 'idle' && (
        <button
          type="button"
          className="study-block-mode-btn"
          onClick={(e) => { e.stopPropagation(); setShowModes(v => !v) }}
          aria-label={`Study mode: ${mode.label}. Change mode`}
          aria-expanded={showModes}
        >
          {mode.shortLabel} ▾
        </button>
      )}

      {(isActive || state.status === 'paused') && (
        <button
          type="button"
          className="study-block-stop-btn"
          onClick={stop}
          aria-label="Stop study block"
        >
          Stop
        </button>
      )}

      {showModes && state.status === 'idle' && (
        <div className="study-block-mode-menu" role="menu">
          {Object.values(modes).map((m) => (
            <button
              key={m.id}
              type="button"
              role="menuitemradio"
              aria-checked={state.mode === m.id}
              className="study-block-mode-option"
              style={{
                background: state.mode === m.id ? COLORS.brandDim : COLORS.surface,
                color: COLORS.silver,
                border: `1px solid ${state.mode === m.id ? COLORS.brand : COLORS.border}`,
              }}
              onClick={() => { setMode(m.id); setShowModes(false) }}
            >
              <span style={{ fontWeight: 700 }}>{m.label}</span>
              <span style={{ ...styles.small, margin: 0 }}>{m.shortLabel}</span>
            </button>
          ))}
        </div>
      )}

      {onOtherObjective && (
        <span className="study-block-other-hint" style={{ ...styles.small, color: COLORS.amber }}>
          Block on {state.objectiveId}
        </span>
      )}
    </div>
  )
}
