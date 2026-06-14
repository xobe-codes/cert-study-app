import { describe, it, expect } from 'vitest'
import {
  formatStudyTime,
  getPhaseDuration,
  startBlock,
  tickBlock,
  advanceAfterFocus,
  createIdleState,
  hydrateStudyBlock,
} from '../studyBlock/studyBlockLogic.js'

describe('studyBlockLogic', () => {
  it('formats mm:ss with zero padding', () => {
    expect(formatStudyTime(125)).toBe('2:05')
    expect(formatStudyTime(0)).toBe('0:00')
  })

  it('returns pomodoro focus duration', () => {
    expect(getPhaseDuration('pomodoro', 'focus')).toBe(25 * 60)
    expect(getPhaseDuration('deepWork', 'focus')).toBe(90 * 60)
  })

  it('starts a focus block for an objective', () => {
    const next = startBlock(createIdleState(), { objectiveId: '1.1', mode: 'pomodoro' })
    expect(next.status).toBe('focus')
    expect(next.objectiveId).toBe('1.1')
    expect(next.remainingSec).toBe(25 * 60)
  })

  it('ticks down remaining seconds', () => {
    const started = startBlock(createIdleState(), { objectiveId: '1.1', mode: 'pomodoro', now: 1000 })
    const ticked = tickBlock({ ...started, updatedAt: 1000 }, 5000)
    expect(ticked.remainingSec).toBe(25 * 60 - 4)
  })

  it('moves pomodoro into break after focus completes', () => {
    const started = startBlock(createIdleState(), { objectiveId: '1.1', mode: 'pomodoro', now: 0 })
    const ended = tickBlock({ ...started, remainingSec: 0, updatedAt: 0 }, 1000)
    expect(ended.status).toBe('break')
    expect(ended.showCompleteCard).toBe(true)
  })

  it('completes deep work without break phase', () => {
    const started = startBlock(createIdleState(), { objectiveId: '2.1', mode: 'deepWork', now: 0 })
    const ended = advanceAfterFocus({ ...started, phaseDurationSec: 90 * 60, phaseElapsedSec: 90 * 60 }, 1)
    expect(ended.status).toBe('idle')
    expect(ended.showCompleteCard).toBe(true)
  })

  it('hydrates idle state from empty storage', () => {
    expect(hydrateStudyBlock(null).status).toBe('idle')
  })
})
