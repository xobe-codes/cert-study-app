/**
 * Analytics Events Schema (Phase 0)
 *
 * Defines all analytics event types and the event recording system.
 * Events are the audit trail for understanding user behavior, feature usage,
 * and learning outcomes.
 */

/**
 * Core event types - what happened in the app
 */
export enum AnalyticsEventType {
  // Quiz and Practice
  QUESTION_ATTEMPTED = 'question_attempted',
  QUIZ_COMPLETED = 'quiz_completed',
  QUIZ_RETAKEN = 'quiz_retaken',

  // Mastery Achievements
  OBJECTIVE_MASTERED = 'objective_mastered',
  DOMAIN_MASTERED = 'domain_mastered',
  BASELINE_TAKEN = 'baseline_taken',
  BASELINE_PASSED = 'baseline_passed',
  TEST_OUT_CLAIMED = 'test_out_claimed',

  // Domain Pass
  DOMAIN_PASS_STARTED = 'domain_pass_started',
  DOMAIN_PASS_COMPLETED = 'domain_pass_completed',
  DOMAIN_PASS_PASSED = 'domain_pass_passed',
  DOMAIN_PASS_FAILED = 'domain_pass_failed',
  DOMAIN_CERTIFIED = 'domain_certified',

  // Mock Exams
  MOCK_EXAM_STARTED = 'mock_exam_started',
  MOCK_EXAM_COMPLETED = 'mock_exam_completed',
  MOCK_EXAM_PASSED = 'mock_exam_passed',
  MOCK_EXAM_FAILED = 'mock_exam_failed',

  // Labs
  LAB_STARTED = 'lab_started',
  LAB_COMPLETED = 'lab_completed',

  // Drills and Practice
  TRAP_DRILL_STARTED = 'trap_drill_started',
  TRAP_DRILL_COMPLETED = 'trap_drill_completed',
  BANK_BURN_STARTED = 'bank_burn_started',
  BANK_BURN_COMPLETED = 'bank_burn_completed',

  // Spaced Repetition
  REFRESH_DRILL_STARTED = 'refresh_drill_started',
  REFRESH_DRILL_COMPLETED = 'refresh_drill_completed',

  // Lessons
  LESSON_STARTED = 'lesson_started',
  LESSON_COMPLETED = 'lesson_completed',

  // Navigation and UI
  FEATURE_ACCESSED = 'feature_accessed',
  RECOMMENDATION_VIEWED = 'recommendation_viewed',
  RECOMMENDATION_ACTED_ON = 'recommendation_acted_on',
  RECOMMENDATION_DISMISSED = 'recommendation_dismissed',

  // Learning Journey
  STUDY_SESSION_STARTED = 'study_session_started',
  STUDY_SESSION_ENDED = 'study_session_ended',
  STREAK_MILESTONE = 'streak_milestone',
  DAILY_GOAL_ACHIEVED = 'daily_goal_achieved',

  // Errors and Issues
  QUIZ_ERROR = 'quiz_error',
  EXAM_ERROR = 'exam_error',
  MIGRATION_COMPLETED = 'migration_completed',
  MIGRATION_FAILED = 'migration_failed',
}

/**
 * Base analytics event structure
 */
export interface AnalyticsEvent {
  id: string;                                // Unique event ID
  type: AnalyticsEventType;                  // What happened
  userId: string;                            // Who did it
  timestamp: Date;                           // When
  sessionId: string;                         // Study session ID

  // Context
  targetType?: 'objective' | 'domain' | 'exam' | 'lab';  // What was affected
  targetId?: string;                         // E.g., objective ID, domain ID

  // Outcome
  success?: boolean;                         // Did the action succeed?
  score?: number;                            // If applicable: 0-100
  duration?: number;                         // Duration in milliseconds

  // Metadata
  metadata?: Record<string, any>;
  source?: 'web' | 'mobile' | 'api';
}

/**
 * Question/Quiz Attempt Event
 */
export interface QuestionAttemptedEvent extends AnalyticsEvent {
  type: AnalyticsEventType.QUESTION_ATTEMPTED;
  targetId: string;                          // Question ID
  questionContent?: {
    objectiveId: string;
    domain: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  };
  attempt?: {
    correct: boolean;
    score?: number;
    confidence?: 'easy' | 'medium' | 'hard';
  };
  timeTakenMs?: number;
}

/**
 * Quiz Completed Event
 */
export interface QuizCompletedEvent extends AnalyticsEvent {
  type: AnalyticsEventType.QUIZ_COMPLETED;
  targetId: string;                          // Objective ID
  score: number;                             // 0-100
  totalQuestions: number;
  questionsCorrect: number;
  duration: number;                          // milliseconds
  attemptNumber?: number;
  isPassing?: boolean;                       // Did user meet passing threshold?
  weakAreas?: string[];
}

/**
 * Baseline Taken Event
 */
export interface BaselineTakenEvent extends AnalyticsEvent {
  type: AnalyticsEventType.BASELINE_TAKEN;
  targetId: string;                          // Domain ID (D1-D6)
  score: number;                             // 0-100
  totalQuestions: number;
  questionsCorrect: number;
  duration: number;
  isPassing?: boolean;
  canTestOut?: boolean;                      // Can user test out?
  weakAreas?: string[];
}

/**
 * Domain Pass Attempt Event
 */
export interface DomainPassEvent extends AnalyticsEvent {
  type: AnalyticsEventType.DOMAIN_PASS_COMPLETED;
  targetId: string;                          // Domain ID
  attemptNumber: number;
  score: number;                             // 0-100
  totalQuestions: number;
  questionsCorrect: number;
  duration: number;
  passed: boolean;
  weakAreas?: string[];
  nextRetryDate?: Date;
}

/**
 * Objective Mastered Event
 */
export interface ObjectiveMasteredEvent extends AnalyticsEvent {
  type: AnalyticsEventType.OBJECTIVE_MASTERED;
  targetId: string;                          // Objective ID
  targetType: 'objective';
  masteryScore: number;                      // Final mastery score
  daysSinceStart: number;
  totalAttempts: number;
  bestScore: number;
  averageScore: number;
}

/**
 * Domain Mastered Event
 */
export interface DomainMasteredEvent extends AnalyticsEvent {
  type: AnalyticsEventType.DOMAIN_MASTERED;
  targetId: string;                          // Domain ID
  targetType: 'domain';
  masteryScore: number;                      // Domain average score
  daysSinceStart: number;
  objectivesMastered: number;
  totalObjectives: number;
  baselineScore?: number;
  domainPassScore?: number;
  certificationDate: Date;
}

/**
 * Mock Exam Completed Event
 */
export interface MockExamCompletedEvent extends AnalyticsEvent {
  type: AnalyticsEventType.MOCK_EXAM_COMPLETED;
  score: number;                             // 0-100
  totalQuestions: number;
  questionsCorrect: number;
  duration: number;
  examType: 'full' | 'partial' | 'adaptive_retake';

  // Per-domain breakdown
  domainScores?: Record<string, number>;
  weakDomains?: string[];

  passed?: boolean;
  confidenceForRealExam?: number;            // 0-100
  nextRecommendedRetakeDate?: Date;
}

/**
 * Lab Completed Event
 */
export interface LabCompletedEvent extends AnalyticsEvent {
  type: AnalyticsEventType.LAB_COMPLETED;
  targetId: string;                          // Lab ID
  targetType: 'lab';
  labName?: string;
  duration: number;
  success: boolean;
  score?: number;                            // If scored
}

/**
 * Drill/Practice Event (Trap Drill, Bank Burn)
 */
export interface DrillCompletedEvent extends AnalyticsEvent {
  type: AnalyticsEventType.TRAP_DRILL_COMPLETED | AnalyticsEventType.BANK_BURN_COMPLETED;
  targetId: string;                          // Objective ID
  questionsAttempted: number;
  questionsCorrect: number;
  score: number;                             // 0-100
  duration: number;
  focusTopics?: string[];
}

/**
 * Study Session Event
 */
export interface StudySessionEvent extends AnalyticsEvent {
  type: AnalyticsEventType.STUDY_SESSION_STARTED | AnalyticsEventType.STUDY_SESSION_ENDED;
  sessionId: string;
  startTime?: Date;
  endTime?: Date;
  durationMinutes?: number;
  activitiesCompleted?: number;
}

/**
 * Recommendation Event
 */
export interface RecommendationEvent extends AnalyticsEvent {
  type:
    | AnalyticsEventType.RECOMMENDATION_VIEWED
    | AnalyticsEventType.RECOMMENDATION_ACTED_ON
    | AnalyticsEventType.RECOMMENDATION_DISMISSED;
  recommendationId: string;
  recommendationType?: string;
  recommendationPriority?: string;
  dismissalReason?: string;
}

/**
 * Streak Milestone Event
 */
export interface StreakMilestoneEvent extends AnalyticsEvent {
  type: AnalyticsEventType.STREAK_MILESTONE;
  streakDays: number;
  milestone: 'day_7' | 'day_14' | 'day_30' | 'day_60' | 'day_90';
}

/**
 * Union type of all event types
 */
export type AnalyticsEventUnion =
  | QuestionAttemptedEvent
  | QuizCompletedEvent
  | BaselineTakenEvent
  | DomainPassEvent
  | ObjectiveMasteredEvent
  | DomainMasteredEvent
  | MockExamCompletedEvent
  | LabCompletedEvent
  | DrillCompletedEvent
  | StudySessionEvent
  | RecommendationEvent
  | StreakMilestoneEvent
  | AnalyticsEvent;

/**
 * Analytics Event Repository - handles event storage
 */
export interface IAnalyticsEventRepository {
  recordEvent(event: AnalyticsEventUnion): Promise<string>;  // Returns event ID
  getEventsByUser(userId: string, limit?: number): Promise<AnalyticsEventUnion[]>;
  getEventsByType(eventType: AnalyticsEventType, limit?: number): Promise<AnalyticsEventUnion[]>;
  getEventsByDateRange(startDate: Date, endDate: Date): Promise<AnalyticsEventUnion[]>;
}

/**
 * In-Memory Analytics Event Repository (for Phase 0)
 */
export class InMemoryAnalyticsRepository implements IAnalyticsEventRepository {
  private events: AnalyticsEventUnion[] = [];
  private eventIdCounter = 0;

  async recordEvent(event: AnalyticsEventUnion): Promise<string> {
    const eventWithId = {
      ...event,
      id: event.id || `evt_${++this.eventIdCounter}_${Date.now()}`,
    };
    this.events.push(eventWithId);
    return eventWithId.id;
  }

  async getEventsByUser(userId: string, limit = 100): Promise<AnalyticsEventUnion[]> {
    return this.events
      .filter(e => e.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getEventsByType(
    eventType: AnalyticsEventType,
    limit = 100
  ): Promise<AnalyticsEventUnion[]> {
    return this.events
      .filter(e => e.type === eventType)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<AnalyticsEventUnion[]> {
    return this.events.filter(
      e => e.timestamp >= startDate && e.timestamp <= endDate
    );
  }
}

/**
 * Analytics Event Service
 */
export class AnalyticsEventService {
  constructor(private repository: IAnalyticsEventRepository) {}

  /**
   * Record a question attempt
   */
  async recordQuestionAttempted(
    userId: string,
    questionId: string,
    objectiveId: string,
    correct: boolean,
    timeTakenMs?: number,
    sessionId?: string
  ): Promise<string> {
    const event: QuestionAttemptedEvent = {
      id: '',
      type: AnalyticsEventType.QUESTION_ATTEMPTED,
      userId,
      targetId: questionId,
      timestamp: new Date(),
      sessionId: sessionId || '',
      attempt: { correct, score: correct ? 100 : 0 },
      timeTakenMs,
      metadata: { objectiveId },
    };
    return this.repository.recordEvent(event);
  }

  /**
   * Record quiz completion
   */
  async recordQuizCompleted(
    userId: string,
    objectiveId: string,
    score: number,
    totalQuestions: number,
    questionsCorrect: number,
    duration: number,
    sessionId?: string
  ): Promise<string> {
    const event: QuizCompletedEvent = {
      id: '',
      type: AnalyticsEventType.QUIZ_COMPLETED,
      userId,
      targetId: objectiveId,
      score,
      totalQuestions,
      questionsCorrect,
      duration,
      timestamp: new Date(),
      sessionId: sessionId || '',
    };
    return this.repository.recordEvent(event);
  }

  /**
   * Record baseline taken
   */
  async recordBaselineTaken(
    userId: string,
    domainId: string,
    score: number,
    totalQuestions: number,
    questionsCorrect: number,
    duration: number,
    sessionId?: string
  ): Promise<string> {
    const event: BaselineTakenEvent = {
      id: '',
      type: AnalyticsEventType.BASELINE_TAKEN,
      userId,
      targetId: domainId,
      score,
      totalQuestions,
      questionsCorrect,
      duration,
      timestamp: new Date(),
      sessionId: sessionId || '',
    };
    return this.repository.recordEvent(event);
  }

  /**
   * Record domain pass attempt
   */
  async recordDomainPassAttempt(
    userId: string,
    domainId: string,
    attemptNumber: number,
    score: number,
    totalQuestions: number,
    questionsCorrect: number,
    duration: number,
    passed: boolean,
    sessionId?: string
  ): Promise<string> {
    const event: DomainPassEvent = {
      id: '',
      type: AnalyticsEventType.DOMAIN_PASS_COMPLETED,
      userId,
      targetId: domainId,
      attemptNumber,
      score,
      totalQuestions,
      questionsCorrect,
      duration,
      passed,
      timestamp: new Date(),
      sessionId: sessionId || '',
    };
    return this.repository.recordEvent(event);
  }

  /**
   * Record objective mastered
   */
  async recordObjectiveMastered(
    userId: string,
    objectiveId: string,
    masteryScore: number,
    daysSinceStart: number,
    totalAttempts: number,
    bestScore: number,
    averageScore: number
  ): Promise<string> {
    const event: ObjectiveMasteredEvent = {
      id: '',
      type: AnalyticsEventType.OBJECTIVE_MASTERED,
      userId,
      targetId: objectiveId,
      targetType: 'objective',
      timestamp: new Date(),
      sessionId: '',
      masteryScore,
      daysSinceStart,
      totalAttempts,
      bestScore,
      averageScore,
    };
    return this.repository.recordEvent(event);
  }

  /**
   * Record domain mastered
   */
  async recordDomainMastered(
    userId: string,
    domainId: string,
    masteryScore: number,
    daysSinceStart: number,
    objectivesMastered: number,
    totalObjectives: number,
    baselineScore?: number,
    domainPassScore?: number
  ): Promise<string> {
    const event: DomainMasteredEvent = {
      id: '',
      type: AnalyticsEventType.DOMAIN_MASTERED,
      userId,
      targetId: domainId,
      targetType: 'domain',
      timestamp: new Date(),
      sessionId: '',
      masteryScore,
      daysSinceStart,
      objectivesMastered,
      totalObjectives,
      baselineScore,
      domainPassScore,
      certificationDate: new Date(),
    };
    return this.repository.recordEvent(event);
  }

  /**
   * Record mock exam completed
   */
  async recordMockExamCompleted(
    userId: string,
    score: number,
    totalQuestions: number,
    questionsCorrect: number,
    duration: number,
    examType: 'full' | 'partial' | 'adaptive_retake' = 'full',
    sessionId?: string
  ): Promise<string> {
    const event: MockExamCompletedEvent = {
      id: '',
      type: AnalyticsEventType.MOCK_EXAM_COMPLETED,
      userId,
      score,
      totalQuestions,
      questionsCorrect,
      duration,
      examType,
      timestamp: new Date(),
      sessionId: sessionId || '',
    };
    return this.repository.recordEvent(event);
  }

  /**
   * Record lab completion
   */
  async recordLabCompleted(
    userId: string,
    labId: string,
    duration: number,
    success: boolean,
    sessionId?: string
  ): Promise<string> {
    const event: LabCompletedEvent = {
      id: '',
      type: AnalyticsEventType.LAB_COMPLETED,
      userId,
      targetId: labId,
      targetType: 'lab',
      duration,
      success,
      timestamp: new Date(),
      sessionId: sessionId || '',
    };
    return this.repository.recordEvent(event);
  }

  /**
   * Record drill completion
   */
  async recordDrillCompleted(
    userId: string,
    objectiveId: string,
    questionsAttempted: number,
    questionsCorrect: number,
    duration: number,
    drillType: 'trap' | 'bank_burn',
    sessionId?: string
  ): Promise<string> {
    const event: DrillCompletedEvent = {
      id: '',
      type:
        drillType === 'trap'
          ? AnalyticsEventType.TRAP_DRILL_COMPLETED
          : AnalyticsEventType.BANK_BURN_COMPLETED,
      userId,
      targetId: objectiveId,
      questionsAttempted,
      questionsCorrect,
      score: Math.round((questionsCorrect / questionsAttempted) * 100),
      duration,
      timestamp: new Date(),
      sessionId: sessionId || '',
    };
    return this.repository.recordEvent(event);
  }

  /**
   * Get events for a user
   */
  async getEventsByUser(userId: string, limit?: number): Promise<AnalyticsEventUnion[]> {
    return this.repository.getEventsByUser(userId, limit);
  }

  /**
   * Get events of a specific type
   */
  async getEventsByType(
    eventType: AnalyticsEventType,
    limit?: number
  ): Promise<AnalyticsEventUnion[]> {
    return this.repository.getEventsByType(eventType, limit);
  }
}

/**
 * Export singleton instance
 */
export const analyticsEventService = new AnalyticsEventService(
  new InMemoryAnalyticsRepository()
);
