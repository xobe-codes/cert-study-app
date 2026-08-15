import { describe, it, expect, vi } from 'vitest'
import { classifyFluency, takeLatencyMs, FLUENCY_FAST_MS, FLUENCY_SLOW_MS } from '../answerOutcome.js'
import { FLUENCY, isObjectiveFluentInStore, objectiveFluencyFromStore } from '../answerFluency.js'
import { handoffStudyFromWeakSignal, handoffPassFocusBatch, domainForObjectiveId } from '../batchHandoff.js'

describe('answerOutcome', () => {
  it('classifies unknown and misses as sticky', () => {
    expect(classifyFluency({ correct: false, unknown: true })).toBe(FLUENCY.sticky)
    expect(classifyFluency({ correct: false })).toBe(FLUENCY.sticky)
  })

  it('classifies fast correct as fluent and slow as fragile', () => {
    expect(classifyFluency({ correct: true, latencyMs: FLUENCY_FAST_MS })).toBe(FLUENCY.fluent)
    expect(classifyFluency({ correct: true, latencyMs: FLUENCY_SLOW_MS + 1 })).toBe(FLUENCY.fragile)
  })

  it('takeLatencyMs returns null without shownAt', () => {
    expect(takeLatencyMs(null)).toBeNull()
    const ms = takeLatencyMs(Date.now() - 100)
    expect(ms).toBeGreaterThanOrEqual(90)
  })
})

describe('answerFluency store helpers', () => {
  it('detects fluent leave-behind', () => {
    const store = {
      objectives: {
        '2.1': { fluent: 2, sticky: 0, lastTag: 'fluent' },
        '2.2': { sticky: 2, lastTag: 'sticky' },
      },
    }
    expect(isObjectiveFluentInStore(store, '2.1')).toBe(true)
    expect(objectiveFluencyFromStore(store, '2.2')).toBe(FLUENCY.sticky)
  })
})

describe('batchHandoff', () => {
  it('resolves domain for objective', () => {
    expect(domainForObjectiveId('2.1')?.id).toBeTruthy()
  })

  it('handoffStudyFromWeakSignal opens study handoff', () => {
    const onSelectObjective = vi.fn()
    handoffStudyFromWeakSignal('2.1', {
      missed: [{ objectiveId: '2.1' }],
      onSelectObjective,
    })
    expect(onSelectObjective).toHaveBeenCalled()
    const arg = onSelectObjective.mock.calls[0][0]
    expect(arg.id).toBeTruthy()
    expect(arg.__initialTab).toBe('Study')
  })

  it('handoffPassFocusBatch passes focusObjectiveIds', () => {
    const onOpenDomainPass = vi.fn()
    const domain = domainForObjectiveId('2.1')
    handoffPassFocusBatch(domain.id, {
      missed: [{ objectiveId: '2.1' }, { objectiveId: '2.2' }],
      onOpenDomainPass,
    })
    expect(onOpenDomainPass).toHaveBeenCalled()
    const arg = onOpenDomainPass.mock.calls[0][0]
    expect(arg.domainId).toBe(domain.id)
    expect(Array.isArray(arg.focusObjectiveIds)).toBe(true)
  })
})
