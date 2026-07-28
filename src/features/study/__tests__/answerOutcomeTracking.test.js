import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  logEvent: vi.fn(),
  recordAnswerSample: vi.fn(),
}))

vi.mock('../../../eventLog.js', () => ({ logEvent: mocks.logEvent }))
vi.mock('../answerFluency.js', () => ({
  FLUENCY: { fluent: 'fluent', fragile: 'fragile', sticky: 'sticky' },
  recordAnswerSample: mocks.recordAnswerSample,
}))

import { recordAnswerOutcome } from '../answerOutcome.js'

describe('recordAnswerOutcome tracking contract', () => {
  beforeEach(() => {
    mocks.logEvent.mockClear()
    mocks.recordAnswerSample.mockClear()
  })

  it('records one domain-owned event with the canonical submitted indexes', async () => {
    await recordAnswerOutcome({
      objectiveId: '1.6',
      questionId: 'obj-1.6-source-q001',
      correct: false,
      latencyMs: 12_000,
      selectedIndexes: [1, 3],
      responseType: 'multi',
    })

    expect(mocks.logEvent).toHaveBeenCalledTimes(1)
    expect(mocks.logEvent).toHaveBeenCalledWith('user_answered_question', expect.objectContaining({
      schemaVersion: 2,
      surface: 'practice',
      responseType: 'multi',
      domainId: 'fundamentals',
      objectiveId: '1.6',
      questionId: 'obj-1.6-source-q001',
      correct: false,
      selectedIndexes: [1, 3],
    }))
  })
})
