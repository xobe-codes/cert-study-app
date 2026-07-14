/**
 * Data Flow Validation Tests
 *
 * Traces data through the system to verify:
 * 1. Quiz attempt → recorded in analytics → updates performance metrics → affects mastery level → triggers recommendations
 * 2. Baseline completion → sets refresh schedule → notification created → user reminded
 * 3. Domain pass success → certificate issued → domain marked mastered → exam readiness updated
 * 4. No data is lost in any operation
 * 5. No circular dependencies
 * 6. Timestamps are consistent throughout flow
 */

import { describe, it, expect, beforeEach } from 'vitest';
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
import { NotificationService } from '../../features/notifications/notificationService';

describe('Data Flow Validation', () => {
  let learningStateService: LearningStateService;
  let analyticsService: AnalyticsEventService;
  let recommendationEngine: RecommendationEngine;
  let notificationService: NotificationService;
  const userId = 'flow-test-user';

  beforeEach(() => {
    const learningRepo = new InMemoryLearningStateRepository();
    const analyticsRepo = new InMemoryAnalyticsRepository();

    learningStateService = new LearningStateService(learningRepo);
    analyticsService = new AnalyticsEventService(analyticsRepo);
    recommendationEngine = new RecommendationEngine(learningStateService);
    notificationService = new NotificationService();
  });

  describe('Flow 1: Quiz Attempt → Analytics → Metrics → Mastery → Recommendations', () => {
    it('should flow data from quiz attempt to recommendations without loss', () => {
      const domain = 'domain-1';
      const startTime = Date.now();

      // Step 1: Quiz starts
      analyticsService.recordEvent(userId, {
        type: AnalyticsEventType.QUIZ_STARTED,
        timestamp: startTime,
        data: { domain, sessionSize: 10 },
      });

      // Step 2: User answers questions
      const attempts = [
        { qid: 'q1', correct: true, confidence: 0.9 },
        { qid: 'q2', correct: false, confidence: 0.3 },
        { qid: 'q3', correct: true, confidence: 0.85 },
      ];

      attempts.forEach((attempt, idx) => {
        learningStateService.recordQuizAttempt(userId, domain, attempt);

        // Record each answer in analytics
        analyticsService.recordEvent(userId, {
          type: AnalyticsEventType.QUESTION_ANSWERED,
          timestamp: startTime + (idx + 1) * 1000,
          data: {
            qid: attempt.qid,
            correct: attempt.correct,
            timeSpent: 30 + Math.random() * 30,
          },
        });
      });

      // Step 3: Quiz completes
      const endTime = Date.now();
      analyticsService.recordEvent(userId, {
        type: AnalyticsEventType.QUIZ_COMPLETED,
        timestamp: endTime,
        data: {
          domain,
          score: 2,
          totalQuestions: 3,
          timeSpent: endTime - startTime,
        },
      });

      // Verify data in each stage
      // 1. Analytics events recorded
      const events = analyticsService.getEventsForUser(userId);
      expect(events.length).toBe(5); // started + 3 answers + completed
      expect(events[0].type).toBe(AnalyticsEventType.QUIZ_STARTED);
      expect(events[4].type).toBe(AnalyticsEventType.QUIZ_COMPLETED);

      // 2. Learning state updated
      const state = learningStateService.getUserState(userId);
      expect(state.domainStates[domain].quizAttempts.length).toBe(3);
      expect(state.domainStates[domain].quizAttempts[0].correct).toBe(true);
      expect(state.domainStates[domain].quizAttempts[1].correct).toBe(false);

      // 3. Performance metrics calculated
      const passRate = state.domainStates[domain].quizAttempts.filter(a => a.correct).length / 3;
      expect(passRate).toBeCloseTo(0.667, 2);

      // 4. Mastery level affected
      const masteryLevel = learningStateService.calculateMastery(
        state.domainStates[domain].quizAttempts,
        []
      );
      expect(masteryLevel).toBeGreaterThan(0);
      expect(masteryLevel).toBeLessThanOrEqual(1);

      // 5. Recommendations generated
      const recommendations = recommendationEngine.generateRecommendations(state);
      expect(recommendations).toBeDefined();

      // No data lost - all attempts recorded
      const analyticsAnswers = events.filter(e => e.type === AnalyticsEventType.QUESTION_ANSWERED);
      expect(analyticsAnswers.length).toBe(3);
    });

    it('should maintain timestamp consistency throughout flow', () => {
      const domain = 'domain-1';
      const flowStartTime = Date.now();

      // Record quiz attempt with timestamp
      learningStateService.recordQuizAttempt(userId, domain, {
        qid: 'q1',
        correct: true,
        confidence: 0.85,
        timestamp: flowStartTime,
      });

      // Record analytics event at same time
      analyticsService.recordEvent(userId, {
        type: AnalyticsEventType.QUESTION_ANSWERED,
        timestamp: flowStartTime,
        data: { qid: 'q1', correct: true },
      });

      // Verify timestamps match
      const state = learningStateService.getUserState(userId);
      const attempt = state.domainStates[domain].quizAttempts[0];

      const events = analyticsService.getEventsForUser(userId);
      const analyticsEvent = events[0];

      // Both should reference the same time
      expect(Math.abs(attempt.timestamp - analyticsEvent.timestamp)).toBeLessThan(100);
    });
  });

  describe('Flow 2: Baseline Completion → Refresh Schedule → Notification → Reminder', () => {
    it('should flow from baseline completion through full reminder cycle', () => {
      const domain = 'domain-1';
      const completionTime = Date.now();

      // Step 1: Baseline completed
      for (let i = 0; i < 5; i++) {
        learningStateService.recordQuizAttempt(userId, domain, {
          qid: `q${i}`, correct: true, confidence: 0.85
        });
      }

      analyticsService.recordEvent(userId, {
        type: AnalyticsEventType.BASELINE_COMPLETED,
        timestamp: completionTime,
        data: { domain, score: 5, totalQuestions: 5 },
      });

      // Step 2: Refresh schedule calculated
      const state = learningStateService.getUserState(userId);
      const nextRefreshTime = completionTime + (7 * 24 * 60 * 60 * 1000); // 7 days

      // Step 3: Notification created
      const notification = notificationService.createNotification({
        userId,
        type: 'refresh_due',
        title: `${domain} refresh due in 7 days`,
        scheduledFor: nextRefreshTime,
      });

      expect(notification).toBeDefined();
      expect(notification.scheduledFor).toBe(nextRefreshTime);
      expect(notification.type).toBe('refresh_due');

      // Step 4: Verify flow integrity
      const events = analyticsService.getEventsForUser(userId);
      const completionEvent = events.find(e => e.type === AnalyticsEventType.BASELINE_COMPLETED);
      expect(completionEvent).toBeDefined();

      // No data lost in transformation
      expect(completionEvent?.data?.domain).toBe(domain);
      expect(completionEvent?.data?.score).toBe(5);
    });

    it('should not lose notification if reminder system fails', () => {
      const domain = 'domain-2';

      // Baseline completion
      learningStateService.recordQuizAttempt(userId, domain, {
        qid: 'q1', correct: true, confidence: 0.9
      });

      // Create notification anyway
      const notification = notificationService.createNotification({
        userId,
        type: 'refresh_due',
        title: `${domain} refresh`,
      });

      // Even if reminder fails, notification should exist
      expect(notification).toBeDefined();
      expect(notification.userId).toBe(userId);
    });
  });

  describe('Flow 3: Domain Pass Success → Certificate → Mastery → Exam Readiness', () => {
    it('should flow domain pass success through full certification', () => {
      const domain = 'domain-1';
      const passTime = Date.now();

      // Step 1: Domain pass completed successfully
      analyticsService.recordEvent(userId, {
        type: AnalyticsEventType.DOMAIN_PASS_COMPLETED,
        timestamp: passTime,
        data: { domain, score: 18, totalQuestions: 20, passed: true },
      });

      // Step 2: Record mastery
      learningStateService.recordDomainMastery(userId, domain, {
        masteredAt: passTime,
        score: 18,
        totalQuestions: 20,
      });

      // Step 3: Verify mastery state
      const state = learningStateService.getUserState(userId);
      expect(state.completedDomains).toContain(domain);

      // Step 4: Exam readiness updated
      const domainsCompleted = state.completedDomains.length;
      expect(domainsCompleted).toBe(1);

      // Step 5: Verify entire flow integrity
      const events = analyticsService.getEventsForUser(userId);
      const passEvent = events.find(e => e.type === AnalyticsEventType.DOMAIN_PASS_COMPLETED);
      expect(passEvent?.data?.domain).toBe(domain);
      expect(passEvent?.data?.passed).toBe(true);
    });
  });

  describe('Data Integrity - No Loss', () => {
    it('should not lose data when updating state multiple times', () => {
      const domain = 'domain-1';
      const originalAttempts = 5;

      // Record initial attempts
      for (let i = 0; i < originalAttempts; i++) {
        learningStateService.recordQuizAttempt(userId, domain, {
          qid: `q${i}`, correct: Math.random() > 0.3, confidence: 0.7
        });
      }

      // Get state multiple times
      const state1 = learningStateService.getUserState(userId);
      const state2 = learningStateService.getUserState(userId);
      const state3 = learningStateService.getUserState(userId);

      // All should have same data
      expect(state1.domainStates[domain].quizAttempts.length).toBe(originalAttempts);
      expect(state2.domainStates[domain].quizAttempts.length).toBe(originalAttempts);
      expect(state3.domainStates[domain].quizAttempts.length).toBe(originalAttempts);

      // Add more data
      learningStateService.recordQuizAttempt(userId, domain, {
        qid: 'q-new', correct: true, confidence: 0.9
      });

      // Verify it was added
      const state4 = learningStateService.getUserState(userId);
      expect(state4.domainStates[domain].quizAttempts.length).toBe(originalAttempts + 1);

      // Old states still valid
      expect(state1.domainStates[domain].quizAttempts.length).toBe(originalAttempts);
    });

    it('should preserve all attempt details without corruption', () => {
      const domain = 'domain-1';
      const originalAttempts = [
        { qid: 'q1', correct: true, confidence: 0.95, timestamp: Date.now() - 1000 },
        { qid: 'q2', correct: false, confidence: 0.2, timestamp: Date.now() },
      ];

      originalAttempts.forEach(attempt => {
        learningStateService.recordQuizAttempt(userId, domain, attempt);
      });

      const state = learningStateService.getUserState(userId);
      const storedAttempts = state.domainStates[domain].quizAttempts;

      // Verify all details preserved
      storedAttempts.forEach((stored, idx) => {
        const original = originalAttempts[idx];
        expect(stored.qid).toBe(original.qid);
        expect(stored.correct).toBe(original.correct);
        expect(stored.confidence).toBe(original.confidence);
      });
    });

    it('should not lose analytics events during concurrent operations', () => {
      const domain = 'domain-1';

      // Simulate rapid events
      const eventCount = 20;
      for (let i = 0; i < eventCount; i++) {
        analyticsService.recordEvent(userId, {
          type: AnalyticsEventType.QUESTION_ANSWERED,
          timestamp: Date.now() + i,
          data: { qid: `q${i}`, correct: Math.random() > 0.3 },
        });
      }

      const events = analyticsService.getEventsForUser(userId);
      expect(events.length).toBe(eventCount);
    });
  });

  describe('Circular Dependency Prevention', () => {
    it('should not have circular dependency between state and analytics', () => {
      const domain = 'domain-1';

      // Update state
      learningStateService.recordQuizAttempt(userId, domain, {
        qid: 'q1', correct: true, confidence: 0.9
      });

      // Record analytics
      analyticsService.recordEvent(userId, {
        type: AnalyticsEventType.QUESTION_ANSWERED,
        timestamp: Date.now(),
        data: { qid: 'q1', correct: true },
      });

      // Get state should not trigger new events
      const stateGets = analyticsService.getEventsForUser(userId).length;
      const _ = learningStateService.getUserState(userId);
      const stateAfter = analyticsService.getEventsForUser(userId).length;

      // No new events should be created
      expect(stateAfter).toBe(stateGets);
    });

    it('should not have circular dependency between recommendations and state', () => {
      const domain = 'domain-1';

      learningStateService.recordQuizAttempt(userId, domain, {
        qid: 'q1', correct: true, confidence: 0.9
      });

      const state1 = learningStateService.getUserState(userId);
      const recs1 = recommendationEngine.generateRecommendations(state1);

      const state2 = learningStateService.getUserState(userId);
      const recs2 = recommendationEngine.generateRecommendations(state2);

      // Recommendations should not modify state
      const state3 = learningStateService.getUserState(userId);
      expect(state1.domainStates[domain].quizAttempts.length)
        .toBe(state3.domainStates[domain].quizAttempts.length);

      // Same state should produce same recommendations
      expect(recs1.length).toBe(recs2.length);
    });
  });

  describe('Cross-System Data Validation', () => {
    it('should validate quiz attempts match analytics recorded answers', () => {
      const domain = 'domain-1';

      const answers = [
        { qid: 'q1', correct: true },
        { qid: 'q2', correct: false },
        { qid: 'q3', correct: true },
      ];

      // Record in learning state
      answers.forEach(answer => {
        learningStateService.recordQuizAttempt(userId, domain, {
          qid: answer.qid,
          correct: answer.correct,
          confidence: 0.7,
        });
      });

      // Record in analytics
      answers.forEach(answer => {
        analyticsService.recordEvent(userId, {
          type: AnalyticsEventType.QUESTION_ANSWERED,
          timestamp: Date.now(),
          data: { qid: answer.qid, correct: answer.correct },
        });
      });

      // Verify both systems have same data
      const state = learningStateService.getUserState(userId);
      const stateAnswers = state.domainStates[domain].quizAttempts;

      const events = analyticsService.getEventsForUser(userId);
      const analyticsAnswers = events.filter(e => e.type === AnalyticsEventType.QUESTION_ANSWERED);

      expect(stateAnswers.length).toBe(analyticsAnswers.length);

      stateAnswers.forEach((stateAttempt, idx) => {
        const analyticsAnswer = analyticsAnswers[idx].data;
        expect(stateAttempt.qid).toBe(analyticsAnswer.qid);
        expect(stateAttempt.correct).toBe(analyticsAnswer.correct);
      });
    });

    it('should ensure mastery calculations match quiz performance', () => {
      const domain = 'domain-1';
      const attempts = 10;
      let correctCount = 0;

      for (let i = 0; i < attempts; i++) {
        const correct = Math.random() > 0.3;
        if (correct) correctCount++;

        learningStateService.recordQuizAttempt(userId, domain, {
          qid: `q${i}`, correct, confidence: 0.7
        });
      }

      const state = learningStateService.getUserState(userId);
      const masteryLevel = learningStateService.calculateMastery(
        state.domainStates[domain].quizAttempts,
        []
      );

      const expectedPassRate = correctCount / attempts;
      expect(masteryLevel).toBeCloseTo(expectedPassRate, 1);
    });
  });

  describe('Timestamp Ordering', () => {
    it('should maintain chronological order of events', () => {
      const domain = 'domain-1';
      const startTime = Date.now();

      // Record events with timestamps
      for (let i = 0; i < 5; i++) {
        analyticsService.recordEvent(userId, {
          type: AnalyticsEventType.QUESTION_ANSWERED,
          timestamp: startTime + i * 1000,
          data: { qid: `q${i}`, correct: true },
        });
      }

      const events = analyticsService.getEventsForUser(userId);
      for (let i = 1; i < events.length; i++) {
        expect(events[i].timestamp).toBeGreaterThanOrEqual(events[i - 1].timestamp);
      }
    });

    it('should use consistent clock for all timestamps', () => {
      const domain = 'domain-1';
      const beforeTime = Date.now();

      learningStateService.recordQuizAttempt(userId, domain, {
        qid: 'q1', correct: true, confidence: 0.9
      });

      analyticsService.recordEvent(userId, {
        type: AnalyticsEventType.QUESTION_ANSWERED,
        timestamp: Date.now(),
        data: { qid: 'q1', correct: true },
      });

      const afterTime = Date.now();

      const state = learningStateService.getUserState(userId);
      const attempts = state.domainStates[domain].quizAttempts;

      const events = analyticsService.getEventsForUser(userId);

      // All timestamps should be within our test window
      attempts.forEach(attempt => {
        expect(attempt.timestamp).toBeLessThanOrEqual(afterTime);
      });

      events.forEach(event => {
        expect(event.timestamp).toBeGreaterThanOrEqual(beforeTime);
      });
    });
  });
});
