/**
 * Phase 0 Unit Tests
 *
 * Tests for the Unified Learning State Foundation:
 * - Mastery level calculations
 * - Performance metrics tracking
 * - Spaced repetition scheduling
 * - Data migration algorithm
 * - Schema constraints
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  MasteryStatus,
  createUnifiedLearningState,
  createObjectiveState,
  createDomainState,
  PerformanceMetrics,
  validateMasteryScore,
  validateDate,
} from '../features/unifiedLearning/unifiedLearningState';
import {
  LearningStateService,
  InMemoryLearningStateRepository,
} from '../features/unifiedLearning/learningStateService';
import {
  AnalyticsEventService,
  InMemoryAnalyticsRepository,
  AnalyticsEventType,
} from '../features/analytics/analyticsEvents';
import { DataMigrationService } from '../data/migrations/migrationScript';

/**
 * ============================================================================
 * Test Suite: Mastery Level Calculations
 * ============================================================================
 */

describe('Mastery Level Calculations', () => {
  let service: LearningStateService;

  beforeEach(() => {
    const repo = new InMemoryLearningStateRepository();
    service = new LearningStateService(repo);
  });

  it('should return NOT_STARTED when no attempts', () => {
    const metrics: PerformanceMetrics = {
      lastAttemptScore: null,
      lastAttemptDate: null,
      bestScore: 0,
      attemptCount: 0,
      averageScore: 0,
      successRate: 0,
    };

    const status = service.calculateMasteryLevel(metrics);
    expect(status).toBe(MasteryStatus.NOT_STARTED);
  });

  it('should return LEARNING when attempts are below 70%', () => {
    const metrics: PerformanceMetrics = {
      lastAttemptScore: 60,
      lastAttemptDate: new Date(),
      bestScore: 65,
      attemptCount: 3,
      averageScore: 62,
      successRate: 0,
    };

    const status = service.calculateMasteryLevel(metrics);
    expect(status).toBe(MasteryStatus.LEARNING);
  });

  it('should return COMPETENT when average is 70-85%', () => {
    const metrics: PerformanceMetrics = {
      lastAttemptScore: 75,
      lastAttemptDate: new Date(),
      bestScore: 80,
      attemptCount: 3,
      averageScore: 75,
      successRate: 75,
    };

    const status = service.calculateMasteryLevel(metrics);
    expect(status).toBe(MasteryStatus.COMPETENT);
  });

  it('should return PROFICIENT when best is 85%+ and success rate is 70%+', () => {
    const metrics: PerformanceMetrics = {
      lastAttemptScore: 88,
      lastAttemptDate: new Date(),
      bestScore: 90,
      attemptCount: 4,
      averageScore: 85,
      successRate: 75,
    };

    const status = service.calculateMasteryLevel(metrics);
    expect(status).toBe(MasteryStatus.PROFICIENT);
  });

  it('should return MASTERED when best is 95%+ and success rate is 80%+', () => {
    const metrics: PerformanceMetrics = {
      lastAttemptScore: 95,
      lastAttemptDate: new Date(),
      bestScore: 98,
      attemptCount: 5,
      averageScore: 92,
      successRate: 100,
    };

    const status = service.calculateMasteryLevel(metrics);
    expect(status).toBe(MasteryStatus.MASTERED);
  });
});

/**
 * ============================================================================
 * Test Suite: Performance Metrics Tracking
 * ============================================================================
 */

describe('Performance Metrics Tracking', () => {
  let service: LearningStateService;

  beforeEach(async () => {
    const repo = new InMemoryLearningStateRepository();
    service = new LearningStateService(repo);

    // Create initial state with objectives
    const state = await service.getLearningState('test_user');
    state.domains.D1.objectives = [
      createObjectiveState('1.1', 'Network Fundamentals', 'D1'),
    ];
    await repo.saveLearningState(state);
  });

  it('should update performance metrics on quiz attempt', async () => {
    const metrics = await service.updateObjectivePerformance(
      'test_user',
      '1.1',
      75,
      new Date()
    );

    expect(metrics.attemptCount).toBe(1);
    expect(metrics.lastAttemptScore).toBe(75);
    expect(metrics.bestScore).toBe(75);
    expect(metrics.averageScore).toBe(75);
    expect(metrics.successRate).toBe(100);
  });

  it('should track multiple attempts correctly', async () => {
    await service.updateObjectivePerformance('test_user', '1.1', 60);
    await service.updateObjectivePerformance('test_user', '1.1', 70);
    const metrics = await service.updateObjectivePerformance('test_user', '1.1', 85);

    expect(metrics.attemptCount).toBe(3);
    expect(metrics.bestScore).toBe(85);
    expect(metrics.averageScore).toBe(71);  // (60 + 70 + 85) / 3
    expect(metrics.successRate).toBe(67);   // 2 passing out of 3
  });

  it('should reject invalid scores', async () => {
    await expect(
      service.updateObjectivePerformance('test_user', '1.1', 101)
    ).rejects.toThrow('Invalid quiz score');

    await expect(
      service.updateObjectivePerformance('test_user', '1.1', -5)
    ).rejects.toThrow('Invalid quiz score');
  });

  it('should handle only passing attempts for success rate', async () => {
    // Scenario: 1 pass, 2 fails
    await service.updateObjectivePerformance('test_user', '1.1', 50);
    await service.updateObjectivePerformance('test_user', '1.1', 85);  // passing
    const metrics = await service.updateObjectivePerformance('test_user', '1.1', 45);

    expect(metrics.attemptCount).toBe(3);
    expect(metrics.successRate).toBe(33);  // 1 passing out of 3
  });
});

/**
 * ============================================================================
 * Test Suite: Spaced Repetition Scheduling
 * ============================================================================
 */

describe('Spaced Repetition Scheduling', () => {
  let service: LearningStateService;

  beforeEach(async () => {
    const repo = new InMemoryLearningStateRepository();
    service = new LearningStateService(repo);

    const state = await service.getLearningState('test_user');
    state.domains.D1.objectives = [
      createObjectiveState('1.1', 'Network Fundamentals', 'D1'),
    ];
    await repo.saveLearningState(state);
  });

  it('should schedule 7-day refresh for newly mastered content', () => {
    const masteredDate = new Date();
    const nextRefresh = service.getNextRefreshDate(masteredDate, 0);

    const daysDiff = Math.floor((nextRefresh.getTime() - masteredDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(daysDiff).toBe(7);
  });

  it('should schedule 30-day refresh when 7+ days have passed', () => {
    const masteredDate = new Date();
    masteredDate.setDate(masteredDate.getDate() - 10);  // 10 days ago

    const nextRefresh = service.getNextRefreshDate(masteredDate, 7);
    const daysDiff = Math.floor((nextRefresh.getTime() - masteredDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(daysDiff).toBe(30);
  });

  it('should schedule 60-day refresh when 30+ days have passed', () => {
    const masteredDate = new Date();
    masteredDate.setDate(masteredDate.getDate() - 35);  // 35 days ago

    const nextRefresh = service.getNextRefreshDate(masteredDate, 30);
    const daysDiff = Math.floor((nextRefresh.getTime() - masteredDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(daysDiff).toBe(60);
  });
});

/**
 * ============================================================================
 * Test Suite: Domain Mastery
 * ============================================================================
 */

describe('Domain Mastery Tracking', () => {
  let service: LearningStateService;

  beforeEach(async () => {
    const repo = new InMemoryLearningStateRepository();
    service = new LearningStateService(repo);

    const state = await service.getLearningState('test_user');
    state.domains.D1.objectives = [
      createObjectiveState('1.1', 'Objective 1.1', 'D1'),
      createObjectiveState('1.2', 'Objective 1.2', 'D1'),
    ];
    await repo.saveLearningState(state);
  });

  it('should mark domain as MASTERED', async () => {
    const domain = await service.markDomainMastered('test_user', 'D1');

    expect(domain.status).toBe(MasteryStatus.MASTERED);
    expect(domain.refreshSchedule.dueDate).not.toBeNull();
  });

  it('should add to mastered domains list', async () => {
    const state = await service.getLearningState('test_user');
    expect(state.learningState.masteredDomains).toHaveLength(0);

    await service.markDomainMastered('test_user', 'D1');
    const updatedState = await service.getLearningState('test_user');

    expect(updatedState.learningState.masteredDomains).toContain('D1');
  });

  it('should mark all objectives as MASTERED', async () => {
    await service.markDomainMastered('test_user', 'D1');
    const state = await service.getLearningState('test_user');

    for (const objective of state.domains.D1.objectives) {
      expect(objective.status).toBe(MasteryStatus.MASTERED);
      expect(objective.milestone.masteredDate).not.toBeNull();
    }
  });
});

/**
 * ============================================================================
 * Test Suite: Stale Content Detection
 * ============================================================================
 */

describe('Stale Content Detection', () => {
  let service: LearningStateService;

  beforeEach(() => {
    const repo = new InMemoryLearningStateRepository();
    service = new LearningStateService(repo);
  });

  it('should detect stale content after 90 days without refresh', () => {
    const masteredDate = new Date();
    masteredDate.setDate(masteredDate.getDate() - 100);  // 100 days ago

    const isStale = service.checkIfStale(masteredDate, null);
    expect(isStale).toBe(true);
  });

  it('should not mark as stale if refreshed within 90 days', () => {
    const masteredDate = new Date();
    masteredDate.setDate(masteredDate.getDate() - 80);

    const refreshDate = new Date();
    refreshDate.setDate(refreshDate.getDate() - 10);

    const isStale = service.checkIfStale(masteredDate, refreshDate);
    expect(isStale).toBe(false);
  });

  it('should handle null mastered date', () => {
    const isStale = service.checkIfStale(null, null);
    expect(isStale).toBe(false);
  });
});

/**
 * ============================================================================
 * Test Suite: Analytics Events
 * ============================================================================
 */

describe('Analytics Event Recording', () => {
  let eventService: AnalyticsEventService;

  beforeEach(() => {
    const repo = new InMemoryAnalyticsRepository();
    eventService = new AnalyticsEventService(repo);
  });

  it('should record quiz completed event', async () => {
    const eventId = await eventService.recordQuizCompleted(
      'test_user',
      '1.1',
      85,
      10,
      8,
      300  // 5 minutes
    );

    expect(eventId).toBeTruthy();
  });

  it('should record objective mastered event', async () => {
    const eventId = await eventService.recordObjectiveMastered(
      'test_user',
      '1.1',
      95,
      15,
      4,
      98,
      88
    );

    expect(eventId).toBeTruthy();
  });

  it('should record domain mastered event', async () => {
    const eventId = await eventService.recordDomainMastered(
      'test_user',
      'D1',
      92,
      30,
      11,
      11,
      88,
      90
    );

    expect(eventId).toBeTruthy();
  });

  it('should retrieve events by user', async () => {
    await eventService.recordQuizCompleted('user1', '1.1', 75, 10, 7, 300);
    await eventService.recordQuizCompleted('user2', '1.1', 85, 10, 8, 300);

    const user1Events = await eventService.getEventsByUser('user1');
    expect(user1Events).toHaveLength(1);
    expect(user1Events[0].userId).toBe('user1');
  });

  it('should retrieve events by type', async () => {
    await eventService.recordQuizCompleted('user1', '1.1', 75, 10, 7, 300);
    await eventService.recordObjectiveMastered('user1', '1.1', 95, 15, 4, 98, 88);

    const quizEvents = await eventService.getEventsByType(AnalyticsEventType.QUIZ_COMPLETED);
    expect(quizEvents.length).toBeGreaterThanOrEqual(1);
  });
});

/**
 * ============================================================================
 * Test Suite: Data Migration
 * ============================================================================
 */

describe('Data Migration', () => {
  let migrationService: DataMigrationService;

  beforeEach(() => {
    migrationService = new DataMigrationService();
  });

  it('should migrate quiz attempts', async () => {
    const legacyData = {
      quizAttempts: [
        { userId: 'user1', objectiveId: '1.1', score: 70, attemptDate: new Date() },
        { userId: 'user1', objectiveId: '1.1', score: 80, attemptDate: new Date() },
        { userId: 'user1', objectiveId: '1.1', score: 90, attemptDate: new Date() },
      ],
      baselines: [],
      domainPasses: [],
      mockExams: [],
      labs: [],
    };

    const state = await migrationService.migrateUserData('user1', legacyData);

    const obj = state.domains.D1.objectives.find(o => o.id === '1.1');
    expect(obj?.performance.attemptCount).toBe(3);
    expect(obj?.performance.bestScore).toBe(90);
    expect(obj?.performance.averageScore).toBe(80);
  });

  it('should calculate correct mastery level after migration', async () => {
    const legacyData = {
      quizAttempts: [
        { userId: 'user1', objectiveId: '1.1', score: 95, attemptDate: new Date() },
        { userId: 'user1', objectiveId: '1.1', score: 98, attemptDate: new Date() },
      ],
      baselines: [{ userId: 'user1', domainId: 'D1', score: 88, attemptDate: new Date() }],
      domainPasses: [],
      mockExams: [],
      labs: [],
    };

    const state = await migrationService.migrateUserData('user1', legacyData);

    const obj = state.domains.D1.objectives.find(o => o.id === '1.1');
    expect(obj?.status).toBe(MasteryStatus.MASTERED);
  });

  it('should migrate mock exams', async () => {
    const legacyData = {
      quizAttempts: [],
      baselines: [],
      domainPasses: [],
      mockExams: [
        {
          userId: 'user1',
          score: 42,
          totalQuestions: 60,
          attemptDate: new Date(),
          domainScores: { D1: 95, D2: 92 },
        },
      ],
      labs: [],
    };

    const state = await migrationService.migrateUserData('user1', legacyData);

    expect(state.mockExamHistory).toHaveLength(1);
    expect(state.mockExamHistory[0].score).toBe(42);
    expect(state.mockExamHistory[0].totalQuestions).toBe(60);
  });

  it('should handle empty legacy data', async () => {
    const legacyData = {
      quizAttempts: [],
      baselines: [],
      domainPasses: [],
      mockExams: [],
      labs: [],
    };

    const state = await migrationService.migrateUserData('new_user', legacyData);

    expect(state.userId).toBe('new_user');
    expect(state.domains).toBeTruthy();
    expect(Object.keys(state.domains)).toHaveLength(6);
  });
});

/**
 * ============================================================================
 * Test Suite: Schema Validation
 * ============================================================================
 */

describe('Schema Validation', () => {
  it('should validate mastery scores', () => {
    expect(validateMasteryScore(0)).toBe(true);
    expect(validateMasteryScore(50)).toBe(true);
    expect(validateMasteryScore(100)).toBe(true);
    expect(validateMasteryScore(101)).toBe(false);
    expect(validateMasteryScore(-1)).toBe(false);
    expect(validateMasteryScore(NaN)).toBe(false);
  });

  it('should validate dates', () => {
    expect(validateDate(new Date())).toBe(true);
    expect(validateDate(null)).toBe(true);
    expect(validateDate(undefined)).toBe(true);
    expect(validateDate(new Date('invalid'))).toBe(false);
  });

  it('should create valid unified learning state', () => {
    const state = createUnifiedLearningState('test_user');

    expect(state.userId).toBe('test_user');
    expect(state.version).toBe('1.0.0');
    expect(Object.keys(state.domains)).toHaveLength(6);
    expect(state.learningState.masteredDomains).toEqual([]);
    expect(state.analytics.totalStudyMinutes).toBe(0);
  });

  it('should create valid objective state', () => {
    const objective = createObjectiveState('1.1', 'Test Objective', 'D1');

    expect(objective.id).toBe('1.1');
    expect(objective.name).toBe('Test Objective');
    expect(objective.status).toBe(MasteryStatus.NOT_STARTED);
    expect(objective.performance.attemptCount).toBe(0);
    expect(objective.activities).toEqual([]);
  });
});

/**
 * ============================================================================
 * Test Suite: Exam Readiness Calculation
 * ============================================================================
 */

describe('Exam Readiness Calculation', () => {
  let service: LearningStateService;

  beforeEach(async () => {
    const repo = new InMemoryLearningStateRepository();
    service = new LearningStateService(repo);
  });

  it('should calculate readiness score based on mastered domains', async () => {
    const state = await service.getLearningState('test_user');
    state.learningState.masteredDomains = ['D1', 'D2', 'D3'];

    await service.calculateExamReadinessScore('test_user');

    const updated = await service.getLearningState('test_user');
    expect(updated.learningState.examReadinessScore).toBeGreaterThan(0);
  });

  it('should return 0 for new users', async () => {
    const score = await service.calculateExamReadinessScore('new_user');
    expect(score).toBe(0);
  });

  it('should cap score at 100', async () => {
    const state = await service.getLearningState('test_user');
    // Artificially set high values
    state.learningState.masteredDomains = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'];

    const score = await service.calculateExamReadinessScore('test_user');
    expect(score).toBeLessThanOrEqual(100);
  });
});

/**
 * ============================================================================
 * Test Suite: Performance Metrics Edge Cases
 * ============================================================================
 */

describe('Performance Metrics Edge Cases', () => {
  let service: LearningStateService;

  beforeEach(async () => {
    const repo = new InMemoryLearningStateRepository();
    service = new LearningStateService(repo);

    const state = await service.getLearningState('test_user');
    state.domains.D1.objectives = [
      createObjectiveState('1.1', 'Test', 'D1'),
    ];
    await repo.saveLearningState(state);
  });

  it('should handle perfect score', async () => {
    const metrics = await service.updateObjectivePerformance('test_user', '1.1', 100);
    expect(metrics.bestScore).toBe(100);
    expect(metrics.averageScore).toBe(100);
  });

  it('should handle zero score', async () => {
    const metrics = await service.updateObjectivePerformance('test_user', '1.1', 0);
    expect(metrics.bestScore).toBe(0);
    expect(metrics.successRate).toBe(0);
  });

  it('should handle single attempt averaging', async () => {
    const metrics = await service.updateObjectivePerformance('test_user', '1.1', 72);
    expect(metrics.averageScore).toBe(72);
    expect(metrics.successRate).toBe(100);
  });
});
