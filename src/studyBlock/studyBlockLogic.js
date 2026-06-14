import { COMPLETION_THRESHOLD, DEFAULT_STUDY_BLOCK_MODE, getModeConfig } from './studyBlockConfig.js'

export function formatStudyTime(totalSec) {
  const sec = Math.max(0, Math.ceil(totalSec))
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function getPhaseDuration(modeId, phase, cycleIndex = 0) {
  const mode = getModeConfig(modeId)
  if (phase === 'focus') return mode.focusSec
  if (phase === 'break') {
    const useLong = mode.cyclesBeforeLong
      && mode.longBreakSec
      && cycleIndex > 0
      && cycleIndex % mode.cyclesBeforeLong === 0
    return useLong ? mode.longBreakSec : mode.breakSec
  }
  return 0
}

export function createIdleState(prefs = {}) {
  return {
    status: 'idle',
    mode: prefs.mode || DEFAULT_STUDY_BLOCK_MODE,
    phase: null,
    remainingSec: 0,
    phaseDurationSec: 0,
    phaseElapsedSec: 0,
    objectiveId: null,
    cycleIndex: 0,
    pausedReason: null,
    showCompleteCard: false,
    lastCompletedObjectiveId: null,
    updatedAt: Date.now(),
  }
}

export function startBlock(state, { mode, objectiveId, now = Date.now() }) {
  const modeId = mode || state.mode || DEFAULT_STUDY_BLOCK_MODE
  const duration = getPhaseDuration(modeId, 'focus', 0)
  return {
    ...state,
    status: 'focus',
    mode: modeId,
    phase: 'focus',
    remainingSec: duration,
    phaseDurationSec: duration,
    phaseElapsedSec: 0,
    objectiveId: objectiveId || state.objectiveId,
    cycleIndex: 0,
    pausedReason: null,
    showCompleteCard: false,
    updatedAt: now,
  }
}

export function pauseBlock(state, reason = 'user', now = Date.now()) {
  if (state.status !== 'focus' && state.status !== 'break') return state
  return { ...state, status: 'paused', pausedReason: reason, updatedAt: now }
}

export function resumeBlock(state, now = Date.now()) {
  if (state.status !== 'paused' || !state.phase) return state
  return { ...state, status: state.phase, pausedReason: null, updatedAt: now }
}

export function stopBlock(state, now = Date.now()) {
  return { ...createIdleState({ mode: state.mode }), updatedAt: now }
}

export function dismissCompleteCard(state, now = Date.now()) {
  return { ...state, showCompleteCard: false, updatedAt: now }
}

export function skipBreak(state, now = Date.now()) {
  if (state.status !== 'break') return state
  const duration = getPhaseDuration(state.mode, 'focus', state.cycleIndex)
  return {
    ...state,
    status: 'focus',
    phase: 'focus',
    remainingSec: duration,
    phaseDurationSec: duration,
    phaseElapsedSec: 0,
    showCompleteCard: false,
    pausedReason: null,
    updatedAt: now,
  }
}

export function advanceAfterFocus(state, now = Date.now()) {
  const mode = getModeConfig(state.mode)
  if (mode.id === 'deepWork') {
    return {
      ...state,
      status: 'idle',
      phase: null,
      remainingSec: 0,
      phaseDurationSec: state.phaseDurationSec,
      phaseElapsedSec: state.phaseDurationSec,
      showCompleteCard: true,
      lastCompletedObjectiveId: state.objectiveId,
      pausedReason: null,
      updatedAt: now,
    }
  }
  const nextCycle = state.cycleIndex + 1
  const breakDuration = getPhaseDuration(state.mode, 'break', nextCycle)
  return {
    ...state,
    status: 'break',
    phase: 'break',
    remainingSec: breakDuration,
    phaseDurationSec: breakDuration,
    phaseElapsedSec: 0,
    cycleIndex: nextCycle,
    showCompleteCard: true,
    lastCompletedObjectiveId: state.objectiveId,
    pausedReason: null,
    updatedAt: now,
  }
}

export function advanceAfterBreak(state, now = Date.now()) {
  const duration = getPhaseDuration(state.mode, 'focus', state.cycleIndex)
  return {
    ...state,
    status: 'focus',
    phase: 'focus',
    remainingSec: duration,
    phaseDurationSec: duration,
    phaseElapsedSec: 0,
    showCompleteCard: false,
    pausedReason: null,
    updatedAt: now,
  }
}

export function tickBlock(state, now = Date.now()) {
  if (state.status !== 'focus' && state.status !== 'break') return state
  const elapsed = Math.max(0, (now - state.updatedAt) / 1000)
  if (elapsed < 1) return state

  const remainingSec = Math.max(0, state.remainingSec - elapsed)
  const phaseElapsedSec = state.phaseElapsedSec + elapsed

  if (remainingSec > 0) {
    return {
      ...state,
      remainingSec,
      phaseElapsedSec,
      updatedAt: now,
    }
  }

  const ended = { ...state, remainingSec: 0, phaseElapsedSec: state.phaseDurationSec, updatedAt: now }
  if (state.phase === 'focus') return advanceAfterFocus(ended, now)
  return advanceAfterBreak(ended, now)
}

export function shouldCreditBlock(state) {
  if (!state.phaseDurationSec) return false
  return state.phaseElapsedSec / state.phaseDurationSec >= COMPLETION_THRESHOLD
}

export function hydrateStudyBlock(raw) {
  if (!raw || typeof raw !== 'object') return createIdleState()
  const base = createIdleState({ mode: raw.mode })
  const merged = { ...base, ...raw, updatedAt: Date.now() }
  if (merged.status === 'focus' || merged.status === 'break') {
    return tickBlock(merged, Date.now())
  }
  if (merged.status === 'paused') return merged
  return createIdleState({ mode: merged.mode })
}

export function serializeStudyBlock(state) {
  const {
    status, mode, phase, remainingSec, phaseDurationSec, phaseElapsedSec,
    objectiveId, cycleIndex, pausedReason, showCompleteCard, lastCompletedObjectiveId,
  } = state
  return {
    status, mode, phase, remainingSec, phaseDurationSec, phaseElapsedSec,
    objectiveId, cycleIndex, pausedReason, showCompleteCard, lastCompletedObjectiveId,
    updatedAt: Date.now(),
  }
}
