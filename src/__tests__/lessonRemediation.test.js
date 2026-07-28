import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ logEvent: vi.fn() }))
vi.mock('../eventLog.js', () => ({ logEvent: mocks.logEvent }))

import { beginLessonRemediation, consumeLessonRemediation } from '../lesson/lessonRemediation.js'

describe('exact lesson remediation handoff', () => {
  beforeEach(() => {
    sessionStorage.clear()
    mocks.logEvent.mockClear()
  })

  it('preserves question, objective, CKU, surface, and exact lesson anchor', () => {
    const token = beginLessonRemediation({ questionId: 'q1', objectiveId: '3.1', domainId: 'connectivity', ckuIds: ['CKU-ROUTE'], surface: 'practice' })
    expect(token.lessonAnchor).toBe('lesson-3-1-concept-cku-route')
    expect(consumeLessonRemediation('3.1')).toEqual(token)
    expect(mocks.logEvent).toHaveBeenCalledWith('user_opened_lesson_remediation', token)
  })

  it('does not consume a handoff from another objective', () => {
    beginLessonRemediation({ questionId: 'q1', objectiveId: '3.1' })
    expect(consumeLessonRemediation('3.2')).toBeNull()
    expect(consumeLessonRemediation('3.1')?.questionId).toBe('q1')
  })
})
