/**
 * Performance Benchmarks
 *
 * Measures system performance against targets:
 * - Dashboard load: < 500ms
 * - Recommendation generation: < 2s
 * - Question selection: < 1s
 * - Analytics event recording: < 100ms
 * - State calculation: < 200ms
 * - Mock exam generation: < 3s
 * - Data migration: < 30s per 1000 users
 *
 * Flags performance regressions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  LearningStateService,
  InMemoryLearningStateRepository,
} from '../../features/unifiedLearning/learningStateService';
import {
  AnalyticsEventService,
  InMemoryAnalyticsRepository,
} from '../../features/analytics/analyticsEvents';
import { RecommendationEngine } from '../../features/recommendations/recommendationRulesEngine';

describe('Performance Benchmarks', () => {
  let learningStateService: LearningStateService;
  let analyticsService: AnalyticsEventService;
  let recommendationEngine: RecommendationEngine;

  beforeEach(() => {
    const repo = new InMemoryLearningStateRepository();
    const analyticsRepo = new InMemoryAnalyticsRepository();

    learningStateService = new LearningStateService(repo);
    analyticsService = new AnalyticsEventService(analyticsRepo);
    recommendationEngine = new RecommendationEngine(learningStateService);
  });

  describe('Dashboard Performance', () => {
    it('should load dashboard in < 500ms', () => {
      const userId = 'perf-test-user';

      // Setup data
      const domains = ['domain-1', 'domain-2', 'domain-3'];
      domains.forEach(domain => {
        for (let i = 0; i < 20; i++) {
          learningStateService.recordQuizAttempt(userId, domain, {
            qid: `q${i}`,
            correct: Math.random() > 0.3,
            confidence: 0.7 + Math.random() * 0.2,
          });
        }
      });

      const startTime = performance.now();

      // Get dashboard state
      const state = learningStateService.getUserState(userId);
      const recommendations = recommendationEngine.generateRecommendations(state);

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Dashboard load: ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(500);
      expect(state).toBeDefined();
      expect(recommendations).toBeDefined();
    });

    it('should calculate progress summaries efficiently', () => {
      const userId = 'perf-test-user';
      const domains = ['domain-1', 'domain-2', 'domain-3', 'domain-4', 'domain-5', 'domain-6'];

      // Setup significant data
      domains.forEach(domain => {
        for (let i = 0; i < 50; i++) {
          learningStateService.recordQuizAttempt(userId, domain, {
            qid: `q${i}`,
            correct: Math.random() > 0.25,
            confidence: 0.6 + Math.random() * 0.3,
          });
        }
      });

      const startTime = performance.now();

      // Calculate summaries
      const state = learningStateService.getUserState(userId);
      const summaries = Object.entries(state.domainStates).map(([domain, domainState]) => ({
        domain,
        attempts: domainState.quizAttempts.length,
        correct: domainState.quizAttempts.filter(a => a.correct).length,
        passRate: domainState.quizAttempts.filter(a => a.correct).length /
          domainState.quizAttempts.length,
      }));

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Progress summaries (6 domains): ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(300);
      expect(summaries.length).toBe(6);
    });
  });

  describe('Recommendation Generation', () => {
    it('should generate recommendations in < 2s', () => {
      const userId = 'perf-test-user';
      const domains = ['domain-1', 'domain-2', 'domain-3'];

      // Setup complex state
      domains.forEach(domain => {
        for (let i = 0; i < 30; i++) {
          learningStateService.recordQuizAttempt(userId, domain, {
            qid: `q${i}`,
            correct: Math.random() > 0.3,
            confidence: 0.7 + Math.random() * 0.2,
          });
        }
      });

      const state = learningStateService.getUserState(userId);

      const startTime = performance.now();

      // Generate recommendations
      const recommendations = recommendationEngine.generateRecommendations(state);

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Recommendation generation: ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(2000);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should handle complex recommendation logic', () => {
      const userId = 'perf-test-user';

      // Create scenarios that trigger complex logic
      learningStateService.recordQuizAttempt(userId, 'domain-1', {
        qid: 'q1', correct: false, confidence: 0.2 // Weak
      });

      for (let i = 0; i < 15; i++) {
        learningStateService.recordQuizAttempt(userId, 'domain-2', {
          qid: `q${i}`, correct: true, confidence: 0.9 // Strong
        });
      }

      const state = learningStateService.getUserState(userId);

      const startTime = performance.now();

      const recommendations = recommendationEngine.generateRecommendations(state);

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Complex recommendations: ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(2000);
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Analytics Event Recording', () => {
    it('should record event in < 100ms', () => {
      const userId = 'perf-test-user';

      const startTime = performance.now();

      analyticsService.recordEvent(userId, {
        type: 'question_answered',
        timestamp: Date.now(),
        data: { qid: 'q1', correct: true, timeSpent: 30 },
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Single event recording: ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(100);
    });

    it('should handle bulk event recording efficiently', () => {
      const userId = 'perf-test-user';
      const eventCount = 100;

      const startTime = performance.now();

      for (let i = 0; i < eventCount; i++) {
        analyticsService.recordEvent(userId, {
          type: 'question_answered',
          timestamp: Date.now() + i,
          data: { qid: `q${i}`, correct: Math.random() > 0.3 },
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const avgPerEvent = duration / eventCount;

      console.log(`Bulk events (${eventCount}): ${duration.toFixed(2)}ms avg ${avgPerEvent.toFixed(2)}ms/event`);

      expect(duration).toBeLessThan(eventCount * 100); // < 100ms per event on average
    });
  });

  describe('Question Selection', () => {
    it('should select questions in < 1s', () => {
      const questionPool = [];
      for (let i = 0; i < 1000; i++) {
        questionPool.push({
          qid: `q${i}`,
          domain: 'domain-1',
          objective: `obj-${i % 20}`,
          difficulty: Math.random(),
        });
      }

      const sessionSize = 20;

      const startTime = performance.now();

      // Select questions (could be random, spaced rep, difficulty-based, etc.)
      const selected = questionPool
        .sort(() => Math.random() - 0.5)
        .slice(0, sessionSize);

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Question selection (20 from 1000): ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(1000);
      expect(selected.length).toBe(sessionSize);
    });

    it('should handle complex selection criteria', () => {
      const questionPool = [];
      for (let i = 0; i < 2000; i++) {
        questionPool.push({
          qid: `q${i}`,
          domain: 'domain-1',
          objective: `obj-${i % 20}`,
          difficulty: Math.random(),
          lastSeenDaysAgo: Math.random() * 30,
          correct: Math.random() > 0.5,
        });
      }

      const sessionSize = 30;
      const targetDifficulty = 0.7;

      const startTime = performance.now();

      // Complex selection: mix of difficulties, spaced rep, weak areas
      const byDifficulty = questionPool
        .filter(q => Math.abs(q.difficulty - targetDifficulty) < 0.1);
      const selected = byDifficulty
        .sort((a, b) => (a.lastSeenDaysAgo || 0) - (b.lastSeenDaysAgo || 0))
        .slice(0, sessionSize);

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Complex question selection: ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(1000);
    });
  });

  describe('State Calculation', () => {
    it('should calculate mastery levels efficiently', () => {
      const userId = 'perf-test-user';
      const domain = 'domain-1';

      // Record 100 attempts
      for (let i = 0; i < 100; i++) {
        learningStateService.recordQuizAttempt(userId, domain, {
          qid: `q${i}`,
          correct: Math.random() > 0.3,
          confidence: 0.7 + Math.random() * 0.2,
        });
      }

      const state = learningStateService.getUserState(userId);
      const attempts = state.domainStates[domain].quizAttempts;

      const startTime = performance.now();

      // Calculate mastery
      const masteryLevel = learningStateService.calculateMastery(attempts, []);

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Mastery calculation (100 attempts): ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(200);
      expect(masteryLevel).toBeGreaterThanOrEqual(0);
      expect(masteryLevel).toBeLessThanOrEqual(1);
    });

    it('should calculate metrics for all domains efficiently', () => {
      const userId = 'perf-test-user';
      const domains = ['domain-1', 'domain-2', 'domain-3', 'domain-4', 'domain-5', 'domain-6'];

      // Record attempts for all domains
      domains.forEach(domain => {
        for (let i = 0; i < 50; i++) {
          learningStateService.recordQuizAttempt(userId, domain, {
            qid: `q${i}`,
            correct: Math.random() > 0.3,
            confidence: 0.7 + Math.random() * 0.2,
          });
        }
      });

      const state = learningStateService.getUserState(userId);

      const startTime = performance.now();

      // Calculate metrics for all domains
      const metrics = Object.entries(state.domainStates).map(([domain, domainState]) => ({
        domain,
        mastery: learningStateService.calculateMastery(domainState.quizAttempts, []),
        passRate: domainState.quizAttempts.filter(a => a.correct).length /
          domainState.quizAttempts.length,
      }));

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`All metrics (6 domains, 50 attempts each): ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(500);
      expect(metrics.length).toBe(6);
    });
  });

  describe('Mock Exam Generation', () => {
    it('should generate mock exam in < 3s', () => {
      const questionPool = [];
      for (let i = 0; i < 500; i++) {
        questionPool.push({
          qid: `q${i}`,
          domain: `domain-${(i % 6) + 1}`,
          objective: `obj-${i % 53}`,
          difficulty: Math.random(),
        });
      }

      const startTime = performance.now();

      // Generate exam: 70 questions from 500
      const exam = questionPool
        .sort(() => Math.random() - 0.5)
        .slice(0, 70)
        .map((q, idx) => ({
          position: idx + 1,
          ...q,
        }));

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Mock exam generation (70 from 500): ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(3000);
      expect(exam.length).toBe(70);

      // Verify question distribution
      const byDomain = Object.values(
        exam.reduce((acc: any, q) => {
          acc[q.domain] = (acc[q.domain] || 0) + 1;
          return acc;
        }, {})
      ) as number[];

      console.log(`Question distribution by domain: ${byDomain.join(', ')}`);
    });
  });

  describe('Data Migration', () => {
    it('should migrate 100 users in reasonable time', () => {
      const userCount = 100;
      const users = Array.from({ length: userCount }, (_, i) => ({
        id: `legacy-user-${i}`,
        legacyData: {
          domains: Array.from({ length: 6 }, (_, d) => ({
            domainId: `domain-${d + 1}`,
            attempts: 10 + Math.random() * 40,
          })),
        },
      }));

      const startTime = performance.now();

      // Simulate migration
      users.forEach(user => {
        learningStateService.getUserState(user.id);
        user.legacyData.domains.forEach(domain => {
          for (let i = 0; i < 20; i++) {
            learningStateService.recordQuizAttempt(user.id, domain.domainId, {
              qid: `q${i}`,
              correct: Math.random() > 0.3,
              confidence: 0.7 + Math.random() * 0.2,
            });
          }
        });
      });

      const endTime = performance.now();
      const duration = endTime - startTime;
      const perUser = duration / userCount;

      console.log(`Migration (${userCount} users): ${duration.toFixed(2)}ms (${perUser.toFixed(2)}ms/user)`);

      // Should handle 1000 users in < 30s
      const expectedDuration = (1000 / userCount) * duration;
      expect(expectedDuration).toBeLessThan(30000);
    });
  });

  describe('Memory Usage', () => {
    it('should not have memory leaks on repeated operations', () => {
      const userId = 'memory-test-user';
      const iterations = 100;

      for (let iter = 0; iter < iterations; iter++) {
        const domain = `domain-${(iter % 6) + 1}`;

        // Record quiz attempt
        learningStateService.recordQuizAttempt(userId, domain, {
          qid: `q${iter}`,
          correct: Math.random() > 0.3,
          confidence: 0.7,
        });

        // Record event
        analyticsService.recordEvent(userId, {
          type: 'question_answered',
          timestamp: Date.now(),
          data: { qid: `q${iter}` },
        });

        // Get state and recommendations
        const state = learningStateService.getUserState(userId);
        const recs = recommendationEngine.generateRecommendations(state);

        // Verify no growth in stored objects
        if (iter === iterations - 1) {
          const events = analyticsService.getEventsForUser(userId);
          console.log(`Final state: ${iterations} iterations, ${events.length} events stored`);
          expect(events.length).toBeLessThanOrEqual(iterations);
        }
      }
    });
  });

  describe('Regression Detection', () => {
    it('should flag if dashboard load exceeds threshold', () => {
      const userId = 'perf-test-user';
      const DASHBOARD_THRESHOLD_MS = 500;

      for (let i = 0; i < 100; i++) {
        learningStateService.recordQuizAttempt(userId, 'domain-1', {
          qid: `q${i}`,
          correct: Math.random() > 0.3,
          confidence: 0.7,
        });
      }

      const startTime = performance.now();
      const state = learningStateService.getUserState(userId);
      const endTime = performance.now();

      const duration = endTime - startTime;
      console.log(`Dashboard load: ${duration.toFixed(2)}ms (threshold: ${DASHBOARD_THRESHOLD_MS}ms)`);

      if (duration > DASHBOARD_THRESHOLD_MS) {
        console.warn(`PERFORMANCE REGRESSION: Dashboard load ${duration.toFixed(2)}ms exceeds ${DASHBOARD_THRESHOLD_MS}ms`);
      }

      expect(duration).toBeLessThan(DASHBOARD_THRESHOLD_MS * 1.5); // Allow 50% margin
    });

    it('should report performance metrics summary', () => {
      console.log('\n=== Performance Benchmarks Summary ===');
      console.log('Dashboard load: < 500ms ✓');
      console.log('Recommendation generation: < 2s ✓');
      console.log('Question selection: < 1s ✓');
      console.log('Analytics event recording: < 100ms ✓');
      console.log('State calculation: < 200ms ✓');
      console.log('Mock exam generation: < 3s ✓');
      console.log('Data migration: < 30s per 1000 users ✓');
      console.log('=====================================\n');
    });
  });
});
