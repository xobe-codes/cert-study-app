import { describe, expect, it } from 'vitest'
import { dedupeLearningEvents, normalizeLearningEvent, reconcileLearningMetrics } from '../features/metrics/learningMetrics.js'

describe('unified learning metrics', () => {
  it('normalizes legacy events without losing canonical ownership', () => {
    const event = normalizeLearningEvent({ type: 'user_answered_question', at: 10, objectiveId: '3.1', questionId: 'q1' })
    expect(event.domainId).toBe('connectivity')
    expect(event.eventId).toContain('legacy-10')
    expect(event.contentVersion).toBe('legacy')
  })

  it('deduplicates offline retries by event id', () => {
    const repeated = { eventId: 'same', type: 'user_answered_question', at: 10, questionId: 'q1' }
    expect(dedupeLearningEvents([repeated, repeated])).toHaveLength(1)
  })

  it('reconciles question, lab, lesson, and remediation totals', () => {
    const metrics = reconcileLearningMetrics([
      { eventId: 'q1-a', type: 'user_answered_question', at: 1, surface: 'practice', questionId: 'q1', objectiveId: '3.1', correct: false },
      { eventId: 'q1-b', type: 'user_answered_question', at: 2, surface: 'practice', questionId: 'q1', objectiveId: '3.1', correct: true },
      { eventId: 'q2', type: 'user_answered_question', at: 3, surface: 'practice', questionId: 'q2', objectiveId: '3.1', correct: true },
      { eventId: 'unknown', type: 'user_answered_question', at: 4, questionId: 'q3', objectiveId: '3.1', unknown: true },
      { eventId: 'lab-start', type: 'user_started_lab', at: 5, labId: 'LAB-1', objectiveId: '3.1' },
      { eventId: 'cp1', type: 'user_attempted_lab_checkpoint', at: 6, labId: 'LAB-1', checkpointId: 'task-1', accepted: false },
      { eventId: 'cp2', type: 'user_attempted_lab_checkpoint', at: 7, labId: 'LAB-1', checkpointId: 'task-1', accepted: true },
      { eventId: 'lab-done', type: 'user_completed_lab', at: 8, labId: 'LAB-1', objectiveId: '3.1' },
      { eventId: 'lesson', type: 'user_viewed_lesson_section', at: 9, lessonAnchor: 'lesson-3-1-concept-cku-route' },
      { eventId: 'remediate', type: 'user_opened_lab_remediation', at: 10, labId: 'LAB-1' },
      { eventId: 'bad', type: 'user_answered_question', at: 11, questionId: 'bad', correct: false, quarantined: true },
    ])
    expect(metrics.questions).toMatchObject({ attempts: 3, correct: 2, accuracy: 67, firstTryAccuracy: 50, unknown: 1 })
    expect(metrics.labs).toMatchObject({ starts: 1, checkpointAttempts: 2, checkpointSuccesses: 1, checkpointAccuracy: 50, completions: 1, completionRate: 100 })
    expect(metrics.lessons.uniqueAnchorsViewed).toBe(1)
    expect(metrics.remediation.opens).toBe(1)
    expect(metrics.excludedEvents).toBe(1)
  })

  it('uses insufficient-data nulls instead of fabricated percentages', () => {
    const metrics = reconcileLearningMetrics([])
    expect(metrics.questions.accuracy).toBeNull()
    expect(metrics.labs.completionRate).toBeNull()
  })
})
