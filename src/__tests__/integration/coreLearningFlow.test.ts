/**
 * Integration Test: Core Learning Flow
 *
 * Tests the complete user learning flow:
 * 1. User starts with a quiz
 * 2. Quiz attempt is recorded
 * 3. Performance metrics are calculated
 * 4. Mastery level is updated
 * 5. Spaced repetition schedules are managed
 *
 * This test verifies the in-memory flow before D1 integration.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  MasteryStatus,
  createUnifiedLearningState,
  ActivityType,
} from '../../features/unifiedLearning/unifiedLearningState';
import { DataMigrationService } from '../../data/migrations/migrationScript';

describe('Core Learning Flow - Quiz to Mastery', () => {
  let migrationService: DataMigrationService;

  beforeEach(() => {
    migrationService = new DataMigrationService();
  });

  describe('Single Quiz Attempt', () => {
    it('should record quiz attempt and calculate initial metrics', async () => {
      const userId = 'learner_001';

      // First quiz attempt
      const legacyQuizAttempts = [
        {
          userId,
          objectiveId: '1.1',
          score: 68,
          attemptDate: new Date('2024-07-10'),
          domainId: 'D1',
        },
      ];

      const state = await migrationService.migrateUserData(userId, {
        quizAttempts: legacyQuizAttempts,
        baselines: [],
        domainPasses: [],
        mockExams: [],
        labs: [],
      });

      const obj = state.domains.D1.objectives.find((o) => o.id === '1.1');
      expect(obj).toBeDefined();
      expect(obj?.status).toBe(MasteryStatus.LEARNING);
      expect(obj?.performance.attemptCount).toBe(1);
      expect(obj?.performance.lastAttemptScore).toBe(68);
      expect(obj?.performance.bestScore).toBe(68);
      expect(obj?.performance.averageScore).toBe(68);
      expect(obj?.performance.successRate).toBe(0); // 68 < 70, didn't pass
      expect(obj?.activities.length).toBe(1);
      expect(obj?.activities[0].type).toBe(ActivityType.QUIZ_ATTEMPT);
    });

    it('should NOT set spaced rep for non-mastered content', async () => {
      const userId = 'learner_002';

      const legacyQuizAttempts = [
        {
          userId,
          objectiveId: '1.2',
          score: 72,
          attemptDate: new Date('2024-07-10'),
          domainId: 'D1',
        },
      ];

      const state = await migrationService.migrateUserData(userId, {
        quizAttempts: legacyQuizAttempts,
        baselines: [],
        domainPasses: [],
        mockExams: [],
        labs: [],
      });

      const obj = state.domains.D1.objectives.find((o) => o.id === '1.2');
      expect(obj?.status).toBe(MasteryStatus.COMPETENT);
      expect(obj?.spacedRep.dueDate).toBeNull();
      expect(obj?.spacedRep.refreshCount).toBe(0);
    });
  });

  describe('Multiple Quiz Attempts - Learning Progression', () => {
    it('should track progression from LEARNING to COMPETENT', async () => {
      const userId = 'learner_003';

      // Simulate 4 attempts over time
      const legacyQuizAttempts = [
        { userId, objectiveId: '2.1', score: 65, attemptDate: new Date('2024-07-01'), domainId: 'D2' },
        { userId, objectiveId: '2.1', score: 70, attemptDate: new Date('2024-07-03'), domainId: 'D2' },
        { userId, objectiveId: '2.1', score: 75, attemptDate: new Date('2024-07-05'), domainId: 'D2' },
        { userId, objectiveId: '2.1', score: 80, attemptDate: new Date('2024-07-07'), domainId: 'D2' },
      ];

      const state = await migrationService.migrateUserData(userId, {
        quizAttempts: legacyQuizAttempts,
        baselines: [],
        domainPasses: [],
        mockExams: [],
        labs: [],
      });

      const obj = state.domains.D2.objectives.find((o) => o.id === '2.1');
      expect(obj?.status).toBe(MasteryStatus.COMPETENT);
      expect(obj?.performance.attemptCount).toBe(4);
      expect(obj?.performance.lastAttemptScore).toBe(80);
      expect(obj?.performance.bestScore).toBe(80);
      expect(obj?.performance.averageScore).toBe(73); // (65+70+75+80)/4 = 72.5 -> rounded to 73
      expect(obj?.performance.successRate).toBe(75); // 3 out of 4 passed (70, 75, 80)

      // Should have 4 activities logged
      expect(obj?.activities.length).toBe(4);
      obj?.activities.forEach((act) => {
        expect(act.type).toBe(ActivityType.QUIZ_ATTEMPT);
      });
    });

    it('should track progression to PROFICIENT', async () => {
      const userId = 'learner_004';

      const legacyQuizAttempts = [
        { userId, objectiveId: '3.2', score: 70, attemptDate: new Date('2024-07-01'), domainId: 'D3' },
        { userId, objectiveId: '3.2', score: 78, attemptDate: new Date('2024-07-03'), domainId: 'D3' },
        { userId, objectiveId: '3.2', score: 85, attemptDate: new Date('2024-07-05'), domainId: 'D3' },
        { userId, objectiveId: '3.2', score: 88, attemptDate: new Date('2024-07-07'), domainId: 'D3' },
      ];

      const state = await migrationService.migrateUserData(userId, {
        quizAttempts: legacyQuizAttempts,
        baselines: [],
        domainPasses: [],
        mockExams: [],
        labs: [],
      });

      const obj = state.domains.D3.objectives.find((o) => o.id === '3.2');
      expect(obj?.status).toBe(MasteryStatus.PROFICIENT);
      expect(obj?.performance.bestScore).toBe(88);
      expect(obj?.performance.successRate).toBe(100); // All >= 70
    });

    it('should track progression to MASTERED', async () => {
      const userId = 'learner_005';
      const masteredDate = new Date('2024-07-10');

      const legacyQuizAttempts = [
        { userId, objectiveId: '4.3', score: 78, attemptDate: new Date('2024-07-01'), domainId: 'D4' },
        { userId, objectiveId: '4.3', score: 85, attemptDate: new Date('2024-07-03'), domainId: 'D4' },
        { userId, objectiveId: '4.3', score: 92, attemptDate: new Date('2024-07-05'), domainId: 'D4' },
        { userId, objectiveId: '4.3', score: 96, attemptDate: masteredDate, domainId: 'D4' },
      ];

      const state = await migrationService.migrateUserData(userId, {
        quizAttempts: legacyQuizAttempts,
        baselines: [],
        domainPasses: [],
        mockExams: [],
        labs: [],
      });

      const obj = state.domains.D4.objectives.find((o) => o.id === '4.3');
      expect(obj?.status).toBe(MasteryStatus.MASTERED);
      expect(obj?.performance.bestScore).toBe(96);
      expect(obj?.performance.successRate).toBe(100);
      expect(obj?.milestone.masteredDate).toEqual(masteredDate);
    });
  });

  describe('Spaced Repetition for Mastered Content', () => {
    it('should schedule 7-day refresh for mastered objective', async () => {
      const userId = 'learner_006';
      const masteredDate = new Date('2024-07-10');

      const legacyQuizAttempts = [
        { userId, objectiveId: '5.1', score: 88, attemptDate: new Date('2024-07-01'), domainId: 'D5' },
        { userId, objectiveId: '5.1', score: 94, attemptDate: new Date('2024-07-05'), domainId: 'D5' },
        { userId, objectiveId: '5.1', score: 97, attemptDate: masteredDate, domainId: 'D5' },
      ];

      const state = await migrationService.migrateUserData(userId, {
        quizAttempts: legacyQuizAttempts,
        baselines: [],
        domainPasses: [],
        mockExams: [],
        labs: [],
      });

      const obj = state.domains.D5.objectives.find((o) => o.id === '5.1');
      expect(obj?.status).toBe(MasteryStatus.MASTERED);
      expect(obj?.spacedRep.dueDate).toBeDefined();
      expect(obj?.spacedRep.lastRefreshDate).toEqual(masteredDate);
      expect(obj?.spacedRep.refreshCount).toBe(0);

      // Verify 7-day interval
      const expectedDueDate = new Date(masteredDate);
      expectedDueDate.setDate(expectedDueDate.getDate() + 7);
      const daysUntilDue =
        (obj!.spacedRep.dueDate!.getTime() - masteredDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(Math.abs(daysUntilDue - 7)).toBeLessThan(0.1);
    });

    it('should set refresh count to 0 for newly mastered items', async () => {
      const userId = 'learner_007';

      const legacyQuizAttempts = [
        { userId, objectiveId: '6.2', score: 95, attemptDate: new Date('2024-07-08'), domainId: 'D6' },
        { userId, objectiveId: '6.2', score: 96, attemptDate: new Date('2024-07-10'), domainId: 'D6' },
      ];

      const state = await migrationService.migrateUserData(userId, {
        quizAttempts: legacyQuizAttempts,
        baselines: [],
        domainPasses: [],
        mockExams: [],
        labs: [],
      });

      const obj = state.domains.D6.objectives.find((o) => o.id === '6.2');
      expect(obj?.spacedRep.refreshCount).toBe(0);
    });
  });

  describe('Baseline + Domain Pass Flow', () => {
    it('should record baseline attempt before domain pass', async () => {
      const userId = 'learner_008';

      const legacyBaselines = [
        {
          userId,
          domainId: 'D1',
          score: 60,
          attemptDate: new Date('2024-06-30'),
          passed: false,
        },
      ];

      const legacyDomainPasses = [
        {
          userId,
          domainId: 'D1',
          attemptNumber: 1,
          score: 72,
          attemptDate: new Date('2024-07-15'),
          passed: true,
        },
      ];

      const state = await migrationService.migrateUserData(userId, {
        quizAttempts: [],
        baselines: legacyBaselines,
        domainPasses: legacyDomainPasses,
        mockExams: [],
        labs: [],
      });

      expect(state.domains.D1.baseline.score).toBe(60);
      expect(state.domains.D1.baseline.passed).toBe(false);
      expect(state.domains.D1.domainPass.length).toBe(1);
      expect(state.domains.D1.domainPass[0].score).toBe(72);
      expect(state.domains.D1.domainPass[0].passed).toBe(true);
      expect(state.learningState.certifiedDomains).toContain('D1');
    });

    it('should track multiple domain pass attempts', async () => {
      const userId = 'learner_009';

      const legacyDomainPasses = [
        {
          userId,
          domainId: 'D2',
          attemptNumber: 1,
          score: 68,
          attemptDate: new Date('2024-07-10'),
          passed: false,
        },
        {
          userId,
          domainId: 'D2',
          attemptNumber: 2,
          score: 71,
          attemptDate: new Date('2024-07-17'),
          passed: true,
        },
      ];

      const state = await migrationService.migrateUserData(userId, {
        quizAttempts: [],
        baselines: [],
        domainPasses: legacyDomainPasses,
        mockExams: [],
        labs: [],
      });

      expect(state.domains.D2.domainPass.length).toBe(2);
      expect(state.domains.D2.domainPass[0].attemptNumber).toBe(1);
      expect(state.domains.D2.domainPass[0].passed).toBe(false);
      expect(state.domains.D2.domainPass[1].attemptNumber).toBe(2);
      expect(state.domains.D2.domainPass[1].passed).toBe(true);
    });
  });

  describe('Mock Exam Integration', () => {
    it('should record mock exam attempt with domain breakdown', async () => {
      const userId = 'learner_010';

      const legacyMockExams = [
        {
          userId,
          score: 108,
          totalQuestions: 150,
          attemptDate: new Date('2024-07-18'),
          domainScores: {
            D1: 90,
            D2: 88,
            D3: 85,
            D4: 72,
            D5: 68,
            D6: 65,
          },
        },
      ];

      const state = await migrationService.migrateUserData(userId, {
        quizAttempts: [],
        baselines: [],
        domainPasses: [],
        mockExams: legacyMockExams,
        labs: [],
      });

      expect(state.mockExamHistory.length).toBe(1);
      const exam = state.mockExamHistory[0];
      expect(exam.percentage).toBe(72); // 108/150 = 72%
      expect(exam.domainScores.D1).toBe(90);
      expect(exam.domainScores.D6).toBe(65);
      expect(exam.adaptiveRetakeAvailable).toBe(true); // 60 <= 72 < 80
    });

    it('should not allow adaptive retake for scores >= 80%', async () => {
      const userId = 'learner_011';

      const legacyMockExams = [
        {
          userId,
          score: 120,
          totalQuestions: 150,
          attemptDate: new Date('2024-07-20'),
          domainScores: { D1: 95, D2: 92, D3: 88, D4: 85, D5: 80, D6: 78 },
        },
      ];

      const state = await migrationService.migrateUserData(userId, {
        quizAttempts: [],
        baselines: [],
        domainPasses: [],
        mockExams: legacyMockExams,
        labs: [],
      });

      const exam = state.mockExamHistory[0];
      expect(exam.percentage).toBe(80);
      expect(exam.adaptiveRetakeAvailable).toBe(false); // 80% is not in 60-80 range
    });
  });

  describe('Lab Completion Tracking', () => {
    it('should track lab completion progress', async () => {
      const userId = 'learner_012';

      const legacyLabs = [
        { userId, labId: 'lab_1', domainId: 'D3', completed: true, completedDate: new Date('2024-07-08') },
        { userId, labId: 'lab_2', domainId: 'D3', completed: true, completedDate: new Date('2024-07-10') },
        { userId, labId: 'lab_3', domainId: 'D3', completed: false, completedDate: undefined },
      ];

      const state = await migrationService.migrateUserData(userId, {
        quizAttempts: [],
        baselines: [],
        domainPasses: [],
        mockExams: [],
        labs: legacyLabs,
      });

      expect(state.domains.D3.labs.total).toBe(3);
      expect(state.domains.D3.labs.completed).toBe(2);
      expect(state.domains.D3.labs.notStarted).toBe(1);
    });
  });

  describe('Domain-Level Mastery Status', () => {
    it('should aggregate objective statuses to domain status', async () => {
      const userId = 'learner_013';

      const legacyQuizAttempts = [
        { userId, objectiveId: '1.1', score: 95, attemptDate: new Date('2024-07-10'), domainId: 'D1' },
        { userId, objectiveId: '1.1', score: 96, attemptDate: new Date('2024-07-05'), domainId: 'D1' },
        { userId, objectiveId: '1.2', score: 78, attemptDate: new Date('2024-07-10'), domainId: 'D1' },
      ];

      const state = await migrationService.migrateUserData(userId, {
        quizAttempts: legacyQuizAttempts,
        baselines: [],
        domainPasses: [],
        mockExams: [],
        labs: [],
      });

      // Domain status should reflect best objective (MASTERED > PROFICIENT > COMPETENT > LEARNING > NOT_STARTED)
      expect(state.domains.D1.status).toBe(MasteryStatus.MASTERED);
      expect(state.domains.D1.overallScore).toBeGreaterThan(0);
    });
  });

  describe('Study Activity Log', () => {
    it('should maintain chronological activity log', async () => {
      const userId = 'learner_014';
      const date1 = new Date('2024-07-01T10:00:00');
      const date2 = new Date('2024-07-02T14:30:00');
      const date3 = new Date('2024-07-03T16:45:00');

      const legacyQuizAttempts = [
        { userId, objectiveId: '2.3', score: 65, attemptDate: date1, domainId: 'D2' },
        { userId, objectiveId: '2.3', score: 75, attemptDate: date2, domainId: 'D2' },
        { userId, objectiveId: '2.3', score: 85, attemptDate: date3, domainId: 'D2' },
      ];

      const state = await migrationService.migrateUserData(userId, {
        quizAttempts: legacyQuizAttempts,
        baselines: [],
        domainPasses: [],
        mockExams: [],
        labs: [],
      });

      const obj = state.domains.D2.objectives.find((o) => o.id === '2.3');
      expect(obj?.activities.length).toBe(3);
      expect(obj?.activities[0].date).toEqual(date1);
      expect(obj?.activities[0].score).toBe(65);
      expect(obj?.activities[1].date).toEqual(date2);
      expect(obj?.activities[1].score).toBe(75);
      expect(obj?.activities[2].date).toEqual(date3);
      expect(obj?.activities[2].score).toBe(85);
    });
  });
});
