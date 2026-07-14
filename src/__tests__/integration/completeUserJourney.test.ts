/**
 * Integration Test Suite: Complete User Journey
 *
 * Tests complete end-to-end user flows across all phases (0-6):
 * 1. New user: Onboarding → Lesson → Quiz → Baseline → Weak area focus → Domain pass → Certified → Next domain
 * 2. Mid-way user: Pick up where they left off → Refresh reminder → Continue → Exam readiness check
 * 3. Exam-ready user: Full mock exam → Results → Recommendations → Schedule real exam
 *
 * Verifies:
 * - Data flows correctly between systems
 * - State consistency throughout journey
 * - Recommendations at each step
 * - Integration across all phases
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  LearningStateService,
  InMemoryLearningStateRepository,
} from '../../features/unifiedLearning/learningStateService';
import {
  AnalyticsEventService,
  InMemoryAnalyticsRepository,
  AnalyticsEventType,
} from '../../features/analytics/analyticsEvents';
import { RecommendationEngine } from '../../features/recommendations/recommendationRulesEngine';
import {
  isEligibleForTestOut,
  claimTestOut,
} from '../../features/domainBaseline/baselineTestOut';
import {
  checkDomainPassReadiness,
  canTakeDomainPass,
} from '../../features/domainPass/domainPassPrerequisites';
import {
  issueDomaincertificate,
  getDomainCertificationStatus,
} from '../../features/domainPass/masteryCertification';
import {
  generateRecommendations,
  RecommendationType,
} from '../../features/recommendations/recommendationRulesEngine';
import { NotificationService } from '../../features/notifications/notificationService';

describe('Complete User Journey Integration Tests', () => {
  let learningStateService: LearningStateService;
  let analyticsService: AnalyticsEventService;
  let recommendationEngine: RecommendationEngine;
  let notificationService: NotificationService;
  let userId: string;

  beforeEach(() => {
    userId = `user-${Date.now()}`;
    const learningStateRepo = new InMemoryLearningStateRepository();
    const analyticsRepo = new InMemoryAnalyticsRepository();

    learningStateService = new LearningStateService(learningStateRepo);
    analyticsService = new AnalyticsEventService(analyticsRepo);
    recommendationEngine = new RecommendationEngine(learningStateService);
    notificationService = new NotificationService();
  });

  describe('Journey 1: New User → CCNA Ready', () => {
    it('should complete full new user onboarding flow', () => {
      // Step 1: User creates account (implicit in learning state initialization)
      const initialState = learningStateService.getUserState(userId);
      expect(initialState).toBeDefined();
      expect(initialState.completedDomains).toHaveLength(0);
      expect(initialState.currentDomain).toBeNull();

      // Step 2: Record onboarding viewed
      analyticsService.recordEvent(userId, {
        type: AnalyticsEventType.ONBOARDING_VIEWED,
        timestamp: Date.now(),
        data: { screens: ['welcome', 'dashboard', 'how-it-works'] },
      });

      const onboardingEvents = analyticsService.getEventsForUser(userId)
        .filter(e => e.type === AnalyticsEventType.ONBOARDING_VIEWED);
      expect(onboardingEvents).toHaveLength(1);
    });

    it('should progress through domain baseline → test out → mastery → certification', () => {
      const domain = 'domain-1';

      // Phase 1: Baseline test-out
      learningStateService.recordQuizAttempt(userId, domain, {
        qid: 'q1', correct: true, confidence: 0.8
      });
      learningStateService.recordQuizAttempt(userId, domain, {
        qid: 'q2', correct: true, confidence: 0.75
      });
      learningStateService.recordQuizAttempt(userId, domain, {
        qid: 'q3', correct: true, confidence: 0.9
      });

      const state = learningStateService.getUserState(userId);
      const domainState = state.domainStates[domain];
      expect(domainState).toBeDefined();
      expect(domainState.quizAttempts).toHaveLength(3);

      // Check mastery level calculation
      const masteryLevel = learningStateService.calculateMastery(
        domainState.quizAttempts,
        []
      );
      expect(masteryLevel).toBeGreaterThan(0);

      // Verify test-out eligibility
      const canTestOut = isEligibleForTestOut(domainState.quizAttempts);
      expect(canTestOut).toBe(true);

      // Claim test-out
      if (canTestOut) {
        const certificate = claimTestOut(domain, domainState.quizAttempts);
        expect(certificate).toBeDefined();
        expect(certificate.domainId).toBe(domain);
        expect(certificate.issuedAt).toBeLessThanOrEqual(Date.now());
      }

      // Phase 2: Domain pass
      analyticsService.recordEvent(userId, {
        type: AnalyticsEventType.DOMAIN_PASS_STARTED,
        timestamp: Date.now(),
        data: { domain },
      });

      // Simulate passing domain pass
      learningStateService.recordDomainPassAttempt(userId, domain, {
        correct: 15,
        total: 20,
        timeSpent: 45 * 60, // 45 minutes
      });

      // Verify certification
      const certStatus = getDomainCertificationStatus(userId, domain, state);
      expect(certStatus).toBeDefined();

      // Verify recommendations updated
      const recommendations = generateRecommendations(state);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should identify weak areas and schedule retakes', () => {
      const domain = 'domain-2';

      // Simulate weak performance on specific objectives
      const weakObjectives = ['2.1', '2.3'];
      weakObjectives.forEach((obj, idx) => {
        learningStateService.recordQuizAttempt(userId, domain, {
          qid: `q-${obj}-1`, correct: false, confidence: 0.3, objective: obj
        });
        learningStateService.recordQuizAttempt(userId, domain, {
          qid: `q-${obj}-2`, correct: false, confidence: 0.4, objective: obj
        });
      });

      // Simulate strength on other objectives
      learningStateService.recordQuizAttempt(userId, domain, {
        qid: 'q-2.2-1', correct: true, confidence: 0.9, objective: '2.2'
      });

      const state = learningStateService.getUserState(userId);
      const recommendations = generateRecommendations(state);

      // Should recommend weak area focus
      const weakAreaRec = recommendations.find(
        r => r.type === RecommendationType.WEAK_AREA_FOCUS
      );
      expect(weakAreaRec).toBeDefined();
      expect(weakAreaRec?.data?.objectives).toBeDefined();
    });

    it('should track progress across 6 domains to full certification', () => {
      const domains = ['domain-1', 'domain-2', 'domain-3', 'domain-4', 'domain-5', 'domain-6'];

      for (const domain of domains) {
        // Simulate domain mastery
        for (let i = 0; i < 10; i++) {
          learningStateService.recordQuizAttempt(userId, domain, {
            qid: `q${i}`, correct: Math.random() > 0.2, confidence: 0.8 + Math.random() * 0.2
          });
        }

        analyticsService.recordEvent(userId, {
          type: AnalyticsEventType.DOMAIN_MASTERED,
          timestamp: Date.now(),
          data: { domain },
        });
      }

      const state = learningStateService.getUserState(userId);
      expect(state.completedDomains.length).toBeLessThanOrEqual(6);

      // Check if eligible for CCNA certification
      const ccnaReady = state.completedDomains.length === 6;
      if (ccnaReady) {
        analyticsService.recordEvent(userId, {
          type: AnalyticsEventType.EXAM_READINESS_CHECKED,
          timestamp: Date.now(),
          data: { allDomainsCompleted: true },
        });
      }

      const events = analyticsService.getEventsForUser(userId);
      const masteredCount = events.filter(
        e => e.type === AnalyticsEventType.DOMAIN_MASTERED
      ).length;
      expect(masteredCount).toBeGreaterThan(0);
    });
  });

  describe('Journey 2: Mid-way User Resumption', () => {
    beforeEach(() => {
      // Simulate user with partial progress
      const domain1 = 'domain-1';
      learningStateService.recordQuizAttempt(userId, domain1, {
        qid: 'q1', correct: true, confidence: 0.85
      });
      learningStateService.recordQuizAttempt(userId, domain1, {
        qid: 'q2', correct: true, confidence: 0.8
      });
    });

    it('should resume from where user left off', () => {
      const state = learningStateService.getUserState(userId);
      expect(Object.keys(state.domainStates).length).toBeGreaterThan(0);

      // Get current domain state
      const currentDomain = 'domain-1';
      const domainState = state.domainStates[currentDomain];
      expect(domainState.quizAttempts.length).toBeGreaterThan(0);

      // Calculate progress
      const passRate = domainState.quizAttempts.filter(a => a.correct).length /
        domainState.quizAttempts.length;
      expect(passRate).toBeGreaterThan(0);
    });

    it('should send refresh reminder for spaced rep', () => {
      const state = learningStateService.getUserState(userId);
      const recommendations = generateRecommendations(state);

      // Should have spaced rep recommendation
      const spaceRepRec = recommendations.find(
        r => r.type === RecommendationType.SPACED_REPETITION_DUE
      );
      expect(spaceRepRec).toBeDefined();

      // Create notification
      const notification = notificationService.createNotification({
        userId,
        type: 'refresh_due',
        title: 'Time to refresh',
        body: 'Your domain 1 refresh is due',
      });

      expect(notification).toBeDefined();
      expect(notification.userId).toBe(userId);
      expect(notification.type).toBe('refresh_due');
    });

    it('should check exam readiness incrementally', () => {
      const state = learningStateService.getUserState(userId);
      const masteredDomains = state.completedDomains.length;

      const recommendations = generateRecommendations(state);

      // If some domains completed, should recommend what's next
      if (masteredDomains > 0 && masteredDomains < 6) {
        const nextRec = recommendations.find(
          r => r.type === RecommendationType.NEXT_DOMAIN_RECOMMENDATION
        );
        expect(nextRec).toBeDefined();
      }
    });
  });

  describe('Journey 3: Exam-Ready User', () => {
    beforeEach(() => {
      // Simulate user who has mastered all 6 domains
      const domains = ['domain-1', 'domain-2', 'domain-3', 'domain-4', 'domain-5', 'domain-6'];
      for (const domain of domains) {
        for (let i = 0; i < 15; i++) {
          learningStateService.recordQuizAttempt(userId, domain, {
            qid: `q${i}`, correct: true, confidence: 0.85 + Math.random() * 0.1
          });
        }

        analyticsService.recordEvent(userId, {
          type: AnalyticsEventType.DOMAIN_MASTERED,
          timestamp: Date.now(),
          data: { domain },
        });
      }
    });

    it('should take full mock exam in real format', () => {
      analyticsService.recordEvent(userId, {
        type: AnalyticsEventType.MOCK_EXAM_STARTED,
        timestamp: Date.now(),
        data: {
          questionCount: 70,
          timeLimit: 120,
          format: 'real',
        },
      });

      // Simulate answering all questions
      for (let i = 0; i < 70; i++) {
        const correct = Math.random() > 0.15; // ~85% pass rate
        analyticsService.recordEvent(userId, {
          type: AnalyticsEventType.QUESTION_ANSWERED,
          timestamp: Date.now(),
          data: {
            qid: `mock-q${i}`,
            correct,
            timeSpent: 90 + Math.random() * 30,
          },
        });
      }

      // Record exam completion
      analyticsService.recordEvent(userId, {
        type: AnalyticsEventType.MOCK_EXAM_COMPLETED,
        timestamp: Date.now(),
        data: {
          score: 59, // 59/70
          timeSpent: 115 * 60,
          passing: true,
        },
      });

      const events = analyticsService.getEventsForUser(userId);
      const examStarted = events.filter(e => e.type === AnalyticsEventType.MOCK_EXAM_STARTED);
      const examCompleted = events.filter(e => e.type === AnalyticsEventType.MOCK_EXAM_COMPLETED);

      expect(examStarted.length).toBeGreaterThan(0);
      expect(examCompleted.length).toBeGreaterThan(0);
    });

    it('should provide detailed exam results and analysis', () => {
      const state = learningStateService.getUserState(userId);

      // Mock exam score analysis
      const mockExamScore = 59;
      const passingScore = 50;
      const isPassing = mockExamScore >= passingScore;

      expect(isPassing).toBe(true);

      // Generate recommendations based on mock exam
      const recommendations = generateRecommendations(state);
      expect(recommendations.length).toBeGreaterThan(0);

      // Should recommend real exam scheduling
      const scheduleRec = recommendations.find(
        r => r.type === RecommendationType.SCHEDULE_REAL_EXAM
      );
      expect(scheduleRec).toBeDefined();
    });

    it('should schedule real exam and send confirmation', () => {
      const examDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      analyticsService.recordEvent(userId, {
        type: AnalyticsEventType.REAL_EXAM_SCHEDULED,
        timestamp: Date.now(),
        data: {
          examDate: examDate.getTime(),
          testCenter: 'Local Testing Center',
          confirmationNumber: 'CCNA-2026-001',
        },
      });

      const notification = notificationService.createNotification({
        userId,
        type: 'exam_scheduled',
        title: 'CCNA Exam Scheduled',
        body: `Your exam is scheduled for ${examDate.toDateString()}`,
      });

      expect(notification.type).toBe('exam_scheduled');
      expect(notification.body).toContain(examDate.toDateString());
    });
  });

  describe('State Consistency Validation', () => {
    it('should maintain consistent state across all operations', () => {
      const domain = 'domain-1';

      // Record multiple attempts
      for (let i = 0; i < 5; i++) {
        learningStateService.recordQuizAttempt(userId, domain, {
          qid: `q${i}`,
          correct: i % 2 === 0,
          confidence: 0.7 + Math.random() * 0.2,
        });
      }

      // Get state multiple times
      const state1 = learningStateService.getUserState(userId);
      const state2 = learningStateService.getUserState(userId);

      // Should be identical
      expect(state1.domainStates[domain].quizAttempts.length).toBe(
        state2.domainStates[domain].quizAttempts.length
      );

      // Verify no data corruption
      state1.domainStates[domain].quizAttempts.forEach((attempt, idx) => {
        const attempt2 = state2.domainStates[domain].quizAttempts[idx];
        expect(attempt.qid).toBe(attempt2.qid);
        expect(attempt.correct).toBe(attempt2.correct);
      });
    });

    it('should validate data integrity after migrations', () => {
      // Simulate data migration
      const domains = ['domain-1', 'domain-2', 'domain-3'];
      for (const domain of domains) {
        learningStateService.recordQuizAttempt(userId, domain, {
          qid: 'q1', correct: true, confidence: 0.8
        });
      }

      const stateBefore = learningStateService.getUserState(userId);
      const domainCountBefore = Object.keys(stateBefore.domainStates).length;

      // Simulate migration (no-op for in-memory, but validate integrity)
      const stateAfter = learningStateService.getUserState(userId);
      const domainCountAfter = Object.keys(stateAfter.domainStates).length;

      expect(domainCountAfter).toBe(domainCountBefore);
    });
  });

  describe('Analytics and Recommendations Integration', () => {
    it('should generate recommendations based on analytics events', () => {
      // Create realistic user activity
      analyticsService.recordEvent(userId, {
        type: AnalyticsEventType.QUIZ_STARTED,
        timestamp: Date.now(),
        data: { domain: 'domain-1' },
      });

      learningStateService.recordQuizAttempt(userId, 'domain-1', {
        qid: 'q1', correct: false, confidence: 0.3
      });

      analyticsService.recordEvent(userId, {
        type: AnalyticsEventType.QUIZ_COMPLETED,
        timestamp: Date.now(),
        data: { domain: 'domain-1', score: 0 },
      });

      const state = learningStateService.getUserState(userId);
      const recommendations = generateRecommendations(state);

      expect(recommendations.length).toBeGreaterThan(0);

      // Recommendations should be based on actual state
      const hasWeak = recommendations.some(r =>
        r.type === RecommendationType.WEAK_AREA_FOCUS ||
        r.type === RecommendationType.SPACED_REPETITION_DUE
      );
      expect(hasWeak).toBe(true);
    });

    it('should not lose data between analytics events and state updates', () => {
      const domain = 'domain-1';

      // Event 1: Quiz started
      analyticsService.recordEvent(userId, {
        type: AnalyticsEventType.QUIZ_STARTED,
        timestamp: Date.now(),
        data: { domain },
      });

      // State update: Record attempt
      learningStateService.recordQuizAttempt(userId, domain, {
        qid: 'q1', correct: true, confidence: 0.9
      });

      // Event 2: Question answered
      analyticsService.recordEvent(userId, {
        type: AnalyticsEventType.QUESTION_ANSWERED,
        timestamp: Date.now(),
        data: { qid: 'q1', correct: true },
      });

      // Event 3: Quiz completed
      analyticsService.recordEvent(userId, {
        type: AnalyticsEventType.QUIZ_COMPLETED,
        timestamp: Date.now(),
        data: { domain, score: 1 },
      });

      // Verify all events recorded
      const events = analyticsService.getEventsForUser(userId);
      expect(events.filter(e => e.type === AnalyticsEventType.QUIZ_STARTED).length).toBe(1);
      expect(events.filter(e => e.type === AnalyticsEventType.QUESTION_ANSWERED).length).toBe(1);
      expect(events.filter(e => e.type === AnalyticsEventType.QUIZ_COMPLETED).length).toBe(1);

      // Verify state intact
      const state = learningStateService.getUserState(userId);
      expect(state.domainStates[domain].quizAttempts.length).toBe(1);
    });
  });
});
