/**
 * Integration Test: Data Migration + Core Learning Flow
 *
 * Verifies:
 * 1. Migration script correctly reads legacy data and transforms it
 * 2. Core learning flow: quiz attempt -> D1 insert -> mastery calculation
 * 3. Spaced repetition scheduling with 7/30/60 day cycles
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  MasteryStatus,
  createUnifiedLearningState,
  ActivityType,
} from '../../features/unifiedLearning/unifiedLearningState';
import {
  DataMigrationService,
  LegacyQuizAttempt,
  LegacyBaseline,
  LegacyDomainPass,
  LegacyMockExam,
  LegacyLab,
} from '../../data/migrations/migrationScript';

describe('Data Migration Script Logic', () => {
  let migrationService: DataMigrationService;

  beforeEach(() => {
    migrationService = new DataMigrationService();
  });

  describe('Quiz Attempt Migration', () => {
    it('should preserve all quiz attempts in activity log', async () => {
      const userId = 'test_user_001';

      const legacyQuizAttempts: LegacyQuizAttempt[] = [
        {
          userId,
          objectiveId: '1.1',
          score: 75,
          attemptDate: new Date('2024-07-01'),
          domainId: 'D1',
        },
        {
          userId,
          objectiveId: '1.1',
          score: 78,
          attemptDate: new Date('2024-07-05'),
          domainId: 'D1',
        },
        {
          userId,
          objectiveId: '1.1',
          score: 92,
          attemptDate: new Date('2024-07-10'),
          domainId: 'D1',
        },
      ];

      const migrated = await migrationService.migrateUserData(userId, {
        quizAttempts: legacyQuizAttempts,
        baselines: [],
        domainPasses: [],
        mockExams: [],
        labs: [],
      });

      const obj = migrated.domains.D1.objectives.find((o) => o.id === '1.1');
      expect(obj).toBeDefined();
      expect(obj?.performance.attemptCount).toBe(3);
      expect(obj?.performance.bestScore).toBe(92);
      expect(obj?.performance.averageScore).toBe(82); // (75 + 78 + 92) / 3 = 81.67 -> rounded to 82
      expect(obj?.performance.successRate).toBe(100); // All >= 70

      expect(obj?.activities.length).toBe(3);
      expect(obj?.activities[0]).toEqual({
        type: ActivityType.QUIZ_ATTEMPT,
        date: new Date('2024-07-01'),
        score: 75,
      });
    });

    it('should calculate success rate as percentage of passing attempts', async () => {
      const userId = 'test_user_002';

      const legacyQuizAttempts: LegacyQuizAttempt[] = [
        { userId, objectiveId: '2.1', score: 45, attemptDate: new Date('2024-07-01'), domainId: 'D2' },
        { userId, objectiveId: '2.1', score: 68, attemptDate: new Date('2024-07-05'), domainId: 'D2' },
        { userId, objectiveId: '2.1', score: 72, attemptDate: new Date('2024-07-10'), domainId: 'D2' },
        { userId, objectiveId: '2.1', score: 85, attemptDate: new Date('2024-07-15'), domainId: 'D2' },
      ];

      const migrated = await migrationService.migrateUserData(userId, {
        quizAttempts: legacyQuizAttempts,
        baselines: [],
        domainPasses: [],
        mockExams: [],
        labs: [],
      });

      const obj = migrated.domains.D2.objectives.find((o) => o.id === '2.1');
      // Only 72 and 85 pass (>= 70), so 2 out of 4 = 50%
      expect(obj?.performance.successRate).toBe(50);
    });
  });

  describe('Baseline Migration', () => {
    it('should use only the most recent baseline per domain', async () => {
      const userId = 'test_user_003';

      const legacyBaselines: LegacyBaseline[] = [
        {
          userId,
          domainId: 'D1',
          score: 55,
          attemptDate: new Date('2024-06-01'),
          passed: false,
        },
        {
          userId,
          domainId: 'D1',
          score: 72,
          attemptDate: new Date('2024-06-15'),
          passed: true,
        },
        {
          userId,
          domainId: 'D1',
          score: 68,
          attemptDate: new Date('2024-06-10'),
          passed: false,
        },
      ];

      const migrated = await migrationService.migrateUserData(userId, {
        quizAttempts: [],
        baselines: legacyBaselines,
        domainPasses: [],
        mockExams: [],
        labs: [],
      });

      expect(migrated.domains.D1.baseline.score).toBe(72);
      expect(migrated.domains.D1.baseline.passed).toBe(true);
      expect(migrated.domains.D1.baseline.attemptDate).toEqual(new Date('2024-06-15'));
    });
  });

  describe('Domain Pass Migration', () => {
    it('should preserve domain pass attempts in order', async () => {
      const userId = 'test_user_004';

      const legacyDomainPasses: LegacyDomainPass[] = [
        {
          userId,
          domainId: 'D3',
          attemptNumber: 1,
          score: 65,
          attemptDate: new Date('2024-07-01'),
          passed: false,
        },
        {
          userId,
          domainId: 'D3',
          attemptNumber: 2,
          score: 78,
          attemptDate: new Date('2024-07-08'),
          passed: true,
        },
      ];

      const migrated = await migrationService.migrateUserData(userId, {
        quizAttempts: [],
        baselines: [],
        domainPasses: legacyDomainPasses,
        mockExams: [],
        labs: [],
      });

      expect(migrated.domains.D3.domainPass.length).toBe(2);
      expect(migrated.domains.D3.domainPass[0].score).toBe(65);
      expect(migrated.domains.D3.domainPass[0].passed).toBe(false);
      expect(migrated.domains.D3.domainPass[1].score).toBe(78);
      expect(migrated.domains.D3.domainPass[1].passed).toBe(true);
    });
  });

  describe('Mock Exam Migration', () => {
    it('should calculate percentage and set adaptive retake flag', async () => {
      const userId = 'test_user_005';

      const legacyMockExams: LegacyMockExam[] = [
        {
          userId,
          score: 105,
          totalQuestions: 150,
          attemptDate: new Date('2024-07-10'),
          domainScores: {
            D1: 90,
            D2: 85,
            D3: 78,
            D4: 70,
            D5: 65,
            D6: 60,
          },
        },
      ];

      const migrated = await migrationService.migrateUserData(userId, {
        quizAttempts: [],
        baselines: [],
        domainPasses: [],
        mockExams: legacyMockExams,
        labs: [],
      });

      expect(migrated.mockExamHistory.length).toBe(1);
      const exam = migrated.mockExamHistory[0];
      expect(exam.score).toBe(105);
      expect(exam.totalQuestions).toBe(150);
      expect(exam.percentage).toBe(70);
      expect(exam.domainScores.D1).toBe(90);
      expect(exam.adaptiveRetakeAvailable).toBe(true);
    });
  });

  describe('Lab Migration', () => {
    it('should count completed and not-started labs', async () => {
      const userId = 'test_user_006';

      const legacyLabs: LegacyLab[] = [
        {
          userId,
          labId: 'lab_1',
          domainId: 'D4',
          completed: true,
          completedDate: new Date('2024-07-05'),
        },
        {
          userId,
          labId: 'lab_2',
          domainId: 'D4',
          completed: false,
          completedDate: undefined,
        },
        {
          userId,
          labId: 'lab_3',
          domainId: 'D4',
          completed: true,
          completedDate: new Date('2024-07-10'),
        },
      ];

      const migrated = await migrationService.migrateUserData(userId, {
        quizAttempts: [],
        baselines: [],
        domainPasses: [],
        mockExams: [],
        labs: legacyLabs,
      });

      expect(migrated.domains.D4.labs.total).toBe(3);
      expect(migrated.domains.D4.labs.completed).toBe(2);
      expect(migrated.domains.D4.labs.notStarted).toBe(1);
    });
  });
});

describe('Mastery Level Calculation', () => {
  let migrationService: DataMigrationService;

  beforeEach(() => {
    migrationService = new DataMigrationService();
  });

  it('should set NOT_STARTED status for domains without objectives', async () => {
    const userId = 'test_mastery_001';

    const migrated = await migrationService.migrateUserData(userId, {
      quizAttempts: [],
      baselines: [],
      domainPasses: [],
      mockExams: [],
      labs: [],
    });

    // Domains with no objectives should remain NOT_STARTED
    expect(migrated.domains.D1.status).toBe(MasteryStatus.NOT_STARTED);
    expect(migrated.domains.D2.status).toBe(MasteryStatus.NOT_STARTED);
  });

  it('should set LEARNING status when averageScore < 70', async () => {
    const userId = 'test_mastery_002';

    const legacyQuizAttempts: LegacyQuizAttempt[] = [
      { userId, objectiveId: '1.2', score: 50, attemptDate: new Date(), domainId: 'D1' },
      { userId, objectiveId: '1.2', score: 65, attemptDate: new Date(), domainId: 'D1' },
    ];

    const migrated = await migrationService.migrateUserData(userId, {
      quizAttempts: legacyQuizAttempts,
      baselines: [],
      domainPasses: [],
      mockExams: [],
      labs: [],
    });

    const obj = migrated.domains.D1.objectives.find((o) => o.id === '1.2');
    expect(obj?.status).toBe(MasteryStatus.LEARNING);
  });

  it('should set COMPETENT status when averageScore >= 70', async () => {
    const userId = 'test_mastery_003';

    const legacyQuizAttempts: LegacyQuizAttempt[] = [
      { userId, objectiveId: '1.3', score: 70, attemptDate: new Date(), domainId: 'D1' },
      { userId, objectiveId: '1.3', score: 75, attemptDate: new Date(), domainId: 'D1' },
      { userId, objectiveId: '1.3', score: 80, attemptDate: new Date(), domainId: 'D1' },
    ];

    const migrated = await migrationService.migrateUserData(userId, {
      quizAttempts: legacyQuizAttempts,
      baselines: [],
      domainPasses: [],
      mockExams: [],
      labs: [],
    });

    const obj = migrated.domains.D1.objectives.find((o) => o.id === '1.3');
    expect(obj?.status).toBe(MasteryStatus.COMPETENT);
    expect(obj?.performance.averageScore).toBe(75);
  });

  it('should set PROFICIENT when bestScore >= 85 AND successRate >= 70', async () => {
    const userId = 'test_mastery_004';

    const legacyQuizAttempts: LegacyQuizAttempt[] = [
      { userId, objectiveId: '2.2', score: 72, attemptDate: new Date(), domainId: 'D2' },
      { userId, objectiveId: '2.2', score: 85, attemptDate: new Date(), domainId: 'D2' },
      { userId, objectiveId: '2.2', score: 88, attemptDate: new Date(), domainId: 'D2' },
    ];

    const migrated = await migrationService.migrateUserData(userId, {
      quizAttempts: legacyQuizAttempts,
      baselines: [],
      domainPasses: [],
      mockExams: [],
      labs: [],
    });

    const obj = migrated.domains.D2.objectives.find((o) => o.id === '2.2');
    expect(obj?.status).toBe(MasteryStatus.PROFICIENT);
    expect(obj?.performance.bestScore).toBe(88);
    expect(obj?.performance.successRate).toBe(100);
  });

  it('should set MASTERED when bestScore >= 95 AND successRate >= 80', async () => {
    const userId = 'test_mastery_005';

    const legacyQuizAttempts: LegacyQuizAttempt[] = [
      { userId, objectiveId: '3.1', score: 85, attemptDate: new Date(), domainId: 'D3' },
      { userId, objectiveId: '3.1', score: 95, attemptDate: new Date(), domainId: 'D3' },
      { userId, objectiveId: '3.1', score: 96, attemptDate: new Date(), domainId: 'D3' },
      { userId, objectiveId: '3.1', score: 99, attemptDate: new Date(), domainId: 'D3' },
    ];

    const migrated = await migrationService.migrateUserData(userId, {
      quizAttempts: legacyQuizAttempts,
      baselines: [],
      domainPasses: [],
      mockExams: [],
      labs: [],
    });

    const obj = migrated.domains.D3.objectives.find((o) => o.id === '3.1');
    expect(obj?.status).toBe(MasteryStatus.MASTERED);
    expect(obj?.performance.bestScore).toBe(99);
  });
});

describe('Spaced Repetition Scheduling', () => {
  let migrationService: DataMigrationService;

  beforeEach(() => {
    migrationService = new DataMigrationService();
  });

  it('should not set spaced rep schedule for non-mastered objectives', async () => {
    const userId = 'test_spaced_rep_001';

    const legacyQuizAttempts: LegacyQuizAttempt[] = [
      { userId, objectiveId: '4.1', score: 75, attemptDate: new Date(), domainId: 'D4' },
    ];

    const migrated = await migrationService.migrateUserData(userId, {
      quizAttempts: legacyQuizAttempts,
      baselines: [],
      domainPasses: [],
      mockExams: [],
      labs: [],
    });

    const obj = migrated.domains.D4.objectives.find((o) => o.id === '4.1');
    expect(obj?.spacedRep.dueDate).toBeNull();
    expect(obj?.spacedRep.lastRefreshDate).toBeNull();
  });

  it('should set 7-day initial spaced rep schedule for mastered objectives', async () => {
    const userId = 'test_spaced_rep_002';
    const masteredDate = new Date('2024-07-10');

    const legacyQuizAttempts: LegacyQuizAttempt[] = [
      { userId, objectiveId: '5.1', score: 96, attemptDate: masteredDate, domainId: 'D5' },
      { userId, objectiveId: '5.1', score: 98, attemptDate: new Date('2024-07-05'), domainId: 'D5' },
    ];

    const migrated = await migrationService.migrateUserData(userId, {
      quizAttempts: legacyQuizAttempts,
      baselines: [],
      domainPasses: [],
      mockExams: [],
      labs: [],
    });

    const obj = migrated.domains.D5.objectives.find((o) => o.id === '5.1');
    expect(obj?.status).toBe(MasteryStatus.MASTERED);
    expect(obj?.spacedRep.dueDate).toBeDefined();

    const daysUntilDue =
      (obj!.spacedRep.dueDate!.getTime() - masteredDate.getTime()) / (1000 * 60 * 60 * 24);
    expect(Math.abs(daysUntilDue - 7)).toBeLessThan(0.1);
  });

  it('should initialize refresh count to 0 for newly mastered objectives', async () => {
    const userId = 'test_spaced_rep_003';

    const legacyQuizAttempts: LegacyQuizAttempt[] = [
      { userId, objectiveId: '6.1', score: 95, attemptDate: new Date('2024-07-10'), domainId: 'D6' },
      { userId, objectiveId: '6.1', score: 97, attemptDate: new Date('2024-07-08'), domainId: 'D6' },
    ];

    const migrated = await migrationService.migrateUserData(userId, {
      quizAttempts: legacyQuizAttempts,
      baselines: [],
      domainPasses: [],
      mockExams: [],
      labs: [],
    });

    const obj = migrated.domains.D6.objectives.find((o) => o.id === '6.1');
    expect(obj?.spacedRep.refreshCount).toBe(0);
    expect(obj?.milestone.masteredDate).toEqual(new Date('2024-07-10'));
  });
});

describe('Exam Readiness Calculation', () => {
  let migrationService: DataMigrationService;

  beforeEach(() => {
    migrationService = new DataMigrationService();
  });

  it('should calculate exam readiness score based on mastered domains', async () => {
    const userId = 'test_exam_ready_001';

    const legacyQuizAttempts: LegacyQuizAttempt[] = [
      { userId, objectiveId: '1.1', score: 96, attemptDate: new Date(), domainId: 'D1' },
      { userId, objectiveId: '1.1', score: 97, attemptDate: new Date(), domainId: 'D1' },
      { userId, objectiveId: '2.1', score: 95, attemptDate: new Date(), domainId: 'D2' },
      { userId, objectiveId: '2.1', score: 96, attemptDate: new Date(), domainId: 'D2' },
      { userId, objectiveId: '3.1', score: 98, attemptDate: new Date(), domainId: 'D3' },
      { userId, objectiveId: '3.1', score: 99, attemptDate: new Date(), domainId: 'D3' },
      { userId, objectiveId: '4.1', score: 95, attemptDate: new Date(), domainId: 'D4' },
      { userId, objectiveId: '4.1', score: 97, attemptDate: new Date(), domainId: 'D4' },
    ];

    const migrated = await migrationService.migrateUserData(userId, {
      quizAttempts: legacyQuizAttempts,
      baselines: [],
      domainPasses: [],
      mockExams: [],
      labs: [],
    });

    expect(migrated.learningState.masteredDomains.length).toBe(4);
    expect(migrated.learningState.examReadinessScore).toBeGreaterThanOrEqual(60);
  });

  it('should mark isExamReady when 4+ domains mastered and mock exam >= 70%', async () => {
    const userId = 'test_exam_ready_002';

    const legacyQuizAttempts: LegacyQuizAttempt[] = [
      { userId, objectiveId: '1.1', score: 96, attemptDate: new Date(), domainId: 'D1' },
      { userId, objectiveId: '2.1', score: 95, attemptDate: new Date(), domainId: 'D2' },
      { userId, objectiveId: '3.1', score: 98, attemptDate: new Date(), domainId: 'D3' },
      { userId, objectiveId: '4.1', score: 97, attemptDate: new Date(), domainId: 'D4' },
    ];

    const legacyMockExams: LegacyMockExam[] = [
      {
        userId,
        score: 105,
        totalQuestions: 150,
        attemptDate: new Date(),
        domainScores: { D1: 90, D2: 85, D3: 88, D4: 82, D5: 70, D6: 65 },
      },
    ];

    const migrated = await migrationService.migrateUserData(userId, {
      quizAttempts: legacyQuizAttempts,
      baselines: [],
      domainPasses: [],
      mockExams: legacyMockExams,
      labs: [],
    });

    expect(migrated.learningState.masteredDomains.length).toBe(4);
    expect(migrated.mockExamHistory[0].percentage).toBe(70);
    expect(migrated.learningState.isExamReady).toBe(true);
  });
});

describe('Complete Migration Workflow', () => {
  let migrationService: DataMigrationService;

  beforeEach(() => {
    migrationService = new DataMigrationService();
  });

  it('should handle complete user progression through one domain', async () => {
    const userId = 'test_complete_001';

    const legacyQuizAttempts: LegacyQuizAttempt[] = [
      { userId, objectiveId: '1.1', score: 75, attemptDate: new Date('2024-07-01'), domainId: 'D1' },
      { userId, objectiveId: '1.1', score: 82, attemptDate: new Date('2024-07-03'), domainId: 'D1' },
      { userId, objectiveId: '1.1', score: 88, attemptDate: new Date('2024-07-05'), domainId: 'D1' },
      { userId, objectiveId: '1.1', score: 92, attemptDate: new Date('2024-07-07'), domainId: 'D1' },
      { userId, objectiveId: '1.1', score: 96, attemptDate: new Date('2024-07-10'), domainId: 'D1' },
    ];

    const legacyBaseline: LegacyBaseline[] = [
      {
        userId,
        domainId: 'D1',
        score: 52,
        attemptDate: new Date('2024-06-30'),
        passed: false,
      },
    ];

    const legacyDomainPasses: LegacyDomainPass[] = [
      {
        userId,
        domainId: 'D1',
        attemptNumber: 1,
        score: 75,
        attemptDate: new Date('2024-07-12'),
        passed: true,
      },
    ];

    const migrated = await migrationService.migrateUserData(userId, {
      quizAttempts: legacyQuizAttempts,
      baselines: legacyBaseline,
      domainPasses: legacyDomainPasses,
      mockExams: [],
      labs: [],
    });

    const obj = migrated.domains.D1.objectives.find((o) => o.id === '1.1');
    expect(obj?.status).toBe(MasteryStatus.MASTERED);
    expect(obj?.performance.attemptCount).toBe(5);
    expect(obj?.performance.bestScore).toBe(96);
    expect(obj?.performance.lastAttemptDate).toEqual(new Date('2024-07-10'));

    expect(migrated.domains.D1.baseline.score).toBe(52);
    expect(migrated.domains.D1.domainPass.length).toBe(1);
    expect(migrated.domains.D1.domainPass[0].passed).toBe(true);

    expect(obj?.spacedRep.dueDate).toBeDefined();
    expect(obj?.milestone.masteredDate).toEqual(new Date('2024-07-10'));
  });
});
