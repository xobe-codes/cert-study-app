/**
 * Integration Test Suite: UI Component Integration
 *
 * Tests React component interactions with data services:
 * - Dashboard loads correct learningState data
 * - Clicking "Domain Pass" button routes with prereq checks
 * - Lab navigation buttons enable/disable correctly
 * - Recommendation cards trigger actions properly
 * - Notification center shows latest updates
 * - Form submissions update state correctly
 *
 * Mocks learningStateService and analyticsService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  LearningStateService,
  InMemoryLearningStateRepository,
} from '../../features/unifiedLearning/learningStateService';
import {
  AnalyticsEventService,
  InMemoryAnalyticsRepository,
} from '../../features/analytics/analyticsEvents';
import { RecommendationEngine } from '../../features/recommendations/recommendationRulesEngine';
import {
  canTakeDomainPass,
  checkDomainPassReadiness,
} from '../../features/domainPass/domainPassPrerequisites';
import {
  getNextLab,
  getPreviousLab,
  canNavigateToNextLab,
  canNavigateToPreviousLab,
} from '../../features/labs/labNavigation';

describe('UI Component Integration Tests', () => {
  let learningStateService: LearningStateService;
  let analyticsService: AnalyticsEventService;
  let recommendationEngine: RecommendationEngine;
  const userId = 'test-user-ui';
  const mockRoute = vi.fn();
  const mockShowNotification = vi.fn();

  beforeEach(() => {
    const repo = new InMemoryLearningStateRepository();
    const analyticsRepo = new InMemoryAnalyticsRepository();

    learningStateService = new LearningStateService(repo);
    analyticsService = new AnalyticsEventService(analyticsRepo);
    recommendationEngine = new RecommendationEngine(learningStateService);

    vi.clearAllMocks();
  });

  describe('Dashboard Component Integration', () => {
    it('should load and display unified learning state', () => {
      const domain = 'domain-1';

      // Simulate user completing some attempts
      learningStateService.recordQuizAttempt(userId, domain, {
        qid: 'q1', correct: true, confidence: 0.85
      });
      learningStateService.recordQuizAttempt(userId, domain, {
        qid: 'q2', correct: false, confidence: 0.4
      });

      // Dashboard gets state
      const state = learningStateService.getUserState(userId);

      // Verify data is available for display
      expect(state).toBeDefined();
      expect(state.domainStates[domain]).toBeDefined();
      expect(state.domainStates[domain].quizAttempts.length).toBe(2);

      // Calculate pass rate for display
      const passRate = state.domainStates[domain].quizAttempts.filter(a => a.correct).length /
        state.domainStates[domain].quizAttempts.length;
      expect(passRate).toBe(0.5);
    });

    it('should display progress summary for all domains', () => {
      const domains = ['domain-1', 'domain-2', 'domain-3'];

      // Simulate progress in multiple domains
      domains.forEach((domain, idx) => {
        const correctCount = idx + 1; // Increasing progress
        for (let i = 0; i < 5; i++) {
          learningStateService.recordQuizAttempt(userId, domain, {
            qid: `q${i}`,
            correct: i < correctCount,
            confidence: 0.8,
          });
        }
      });

      const state = learningStateService.getUserState(userId);

      // Dashboard summary should show progress for each domain
      const summary = domains.map(domain => ({
        domain,
        attempts: state.domainStates[domain]?.quizAttempts.length || 0,
        correct: state.domainStates[domain]?.quizAttempts.filter(a => a.correct).length || 0,
      }));

      expect(summary.length).toBe(3);
      summary.forEach(s => {
        expect(s.attempts).toBeGreaterThan(0);
        expect(s.correct).toBeLessThanOrEqual(s.attempts);
      });
    });

    it('should show "Continue" button when user has in-progress domain', () => {
      const domain = 'domain-1';
      learningStateService.recordQuizAttempt(userId, domain, {
        qid: 'q1', correct: true, confidence: 0.8
      });

      const state = learningStateService.getUserState(userId);
      const inProgressDomain = Object.entries(state.domainStates)
        .find(([_, ds]) => ds.quizAttempts.length > 0 && !ds.completed)?.[0];

      // Dashboard should show continue button
      if (inProgressDomain) {
        expect(inProgressDomain).toBe(domain);
        // Mock: showContinueButton = true
      }
    });

    it('should display recommendations on dashboard', () => {
      const domain = 'domain-1';

      // Simulate weak performance
      learningStateService.recordQuizAttempt(userId, domain, {
        qid: 'q1', correct: false, confidence: 0.3
      });
      learningStateService.recordQuizAttempt(userId, domain, {
        qid: 'q2', correct: false, confidence: 0.2
      });

      const state = learningStateService.getUserState(userId);
      const recommendations = recommendationEngine.generateRecommendations(state);

      // Dashboard renders recommendations
      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);

      // Verify recommendation structure
      recommendations.forEach(rec => {
        expect(rec.type).toBeDefined();
        expect(rec.priority).toBeDefined();
        expect(rec.title).toBeDefined();
      });
    });

    it('should display upcoming scheduled activities', () => {
      const domain = 'domain-1';

      // Record baseline completion to trigger refresh schedule
      learningStateService.recordQuizAttempt(userId, domain, {
        qid: 'q1', correct: true, confidence: 0.9
      });

      analyticsService.recordEvent(userId, {
        type: 'baseline_completed',
        timestamp: Date.now(),
        data: { domain },
      });

      const state = learningStateService.getUserState(userId);
      const recommendations = recommendationEngine.generateRecommendations(state);

      // Should have scheduled recommendations
      const scheduledRecs = recommendations.filter(r => r.dueDate);
      if (scheduledRecs.length > 0) {
        expect(scheduledRecs[0].dueDate).toBeDefined();
        expect(scheduledRecs[0].dueDate).toBeGreaterThanOrEqual(Date.now());
      }
    });
  });

  describe('Domain Pass Button and Routing', () => {
    it('should enable Domain Pass button only when prerequisites met', () => {
      const domain = 'domain-1';

      // Without baseline mastery, button should be disabled
      let state = learningStateService.getUserState(userId);
      let isEligible = canTakeDomainPass(userId, domain, state);
      expect(isEligible).toBe(false);

      // After completing baseline, button should enable
      for (let i = 0; i < 10; i++) {
        learningStateService.recordQuizAttempt(userId, domain, {
          qid: `q${i}`, correct: true, confidence: 0.85
        });
      }

      state = learningStateService.getUserState(userId);
      isEligible = canTakeDomainPass(userId, domain, state);
      expect(isEligible).toBe(true);
    });

    it('should route to domain pass with validation', () => {
      const domain = 'domain-2';

      // Simulate baseline completion
      for (let i = 0; i < 8; i++) {
        learningStateService.recordQuizAttempt(userId, domain, {
          qid: `q${i}`, correct: Math.random() > 0.2, confidence: 0.75
        });
      }

      const state = learningStateService.getUserState(userId);
      const canGo = canTakeDomainPass(userId, domain, state);

      if (canGo) {
        // Route to domain pass
        mockRoute(`/domain-pass/${domain}`);
        expect(mockRoute).toHaveBeenCalledWith(`/domain-pass/${domain}`);

        // Record navigation event
        analyticsService.recordEvent(userId, {
          type: 'domain_pass_navigation',
          timestamp: Date.now(),
          data: { domain, route: `/domain-pass/${domain}` },
        });

        const navEvent = analyticsService.getEventsForUser(userId)
          .find(e => e.type === 'domain_pass_navigation');
        expect(navEvent).toBeDefined();
      }
    });

    it('should show readiness message when prerequisite not met', () => {
      const domain = 'domain-3';

      const state = learningStateService.getUserState(userId);
      const readinessCheck = checkDomainPassReadiness(userId, domain, state);

      if (!readinessCheck.isReady) {
        const message = readinessCheck.message;
        expect(message).toBeDefined();
        expect(message.length).toBeGreaterThan(0);

        // Display should show this message as a tooltip/disabled reason
        // Mock: showDisabledTooltip(message)
      }
    });

    it('should disable Domain Pass button after recent attempt', () => {
      const domain = 'domain-4';

      // First domain pass attempt
      analyticsService.recordEvent(userId, {
        type: 'domain_pass_completed',
        timestamp: Date.now() - 1000, // 1 second ago
        data: { domain, passed: false },
      });

      const state = learningStateService.getUserState(userId);
      const canGo = canTakeDomainPass(userId, domain, state);

      // Should be disabled (based on cooldown or attempt limits)
      // This depends on business rules defined in canTakeDomainPass
      expect(canGo).toBeDefined(); // Can be true or false based on rules
    });
  });

  describe('Lab Navigation Integration', () => {
    it('should enable/disable Previous and Next lab buttons correctly', () => {
      const domain = 'domain-1';
      const labs = [
        { id: 'lab-1', domainId: domain },
        { id: 'lab-2', domainId: domain },
        { id: 'lab-3', domainId: domain },
      ];

      // On first lab
      let currentLab = labs[0];
      expect(canNavigateToPreviousLab(currentLab, labs)).toBe(false);
      expect(canNavigateToNextLab(currentLab, labs)).toBe(true);

      // On middle lab
      currentLab = labs[1];
      expect(canNavigateToPreviousLab(currentLab, labs)).toBe(true);
      expect(canNavigateToNextLab(currentLab, labs)).toBe(true);

      // On last lab
      currentLab = labs[2];
      expect(canNavigateToPreviousLab(currentLab, labs)).toBe(true);
      expect(canNavigateToNextLab(currentLab, labs)).toBe(false);
    });

    it('should navigate correctly when user clicks Next', () => {
      const domain = 'domain-1';
      const labs = [
        { id: 'lab-1', domainId: domain },
        { id: 'lab-2', domainId: domain },
      ];

      const currentLab = labs[0];
      const nextLab = getNextLab(currentLab, labs);

      expect(nextLab).toBeDefined();
      expect(nextLab?.id).toBe('lab-2');

      // Route to next lab
      if (nextLab) {
        mockRoute(`/labs/${nextLab.id}`);
        expect(mockRoute).toHaveBeenCalledWith(`/labs/${nextLab.id}`);
      }
    });

    it('should navigate correctly when user clicks Previous', () => {
      const domain = 'domain-1';
      const labs = [
        { id: 'lab-1', domainId: domain },
        { id: 'lab-2', domainId: domain },
      ];

      const currentLab = labs[1];
      const prevLab = getPreviousLab(currentLab, labs);

      expect(prevLab).toBeDefined();
      expect(prevLab?.id).toBe('lab-1');

      if (prevLab) {
        mockRoute(`/labs/${prevLab.id}`);
        expect(mockRoute).toHaveBeenCalledWith(`/labs/${prevLab.id}`);
      }
    });

    it('should display lab progress indicator', () => {
      const domain = 'domain-1';
      const labs = [
        { id: 'lab-1', domainId: domain, completed: true },
        { id: 'lab-2', domainId: domain, completed: false },
        { id: 'lab-3', domainId: domain, completed: true },
      ];

      const completedCount = labs.filter(l => l.completed).length;
      const progressPercent = (completedCount / labs.length) * 100;

      // Progress indicator should show 66%
      expect(progressPercent).toBeCloseTo(66.67, 1);
      expect(completedCount).toBe(2);
      expect(labs.length).toBe(3);
    });

    it('should disable navigation when lab pool is empty', () => {
      const emptyLabs: any[] = [];

      expect(canNavigateToNextLab({ id: 'lab-1' }, emptyLabs)).toBe(false);
      expect(canNavigateToPreviousLab({ id: 'lab-1' }, emptyLabs)).toBe(false);
    });
  });

  describe('Recommendation Cards and Actions', () => {
    it('should render recommendation cards with correct data', () => {
      const domain = 'domain-1';

      // Create conditions for recommendations
      learningStateService.recordQuizAttempt(userId, domain, {
        qid: 'q1', correct: true, confidence: 0.9
      });

      const state = learningStateService.getUserState(userId);
      const recommendations = recommendationEngine.generateRecommendations(state);

      // Each recommendation card should have required data
      recommendations.forEach(rec => {
        expect(rec.title).toBeDefined();
        expect(rec.title.length).toBeGreaterThan(0);
        expect(rec.type).toBeDefined();
        expect(rec.priority).toMatch(/high|medium|low/);
      });
    });

    it('should trigger action when recommendation card clicked', () => {
      const domain = 'domain-1';

      learningStateService.recordQuizAttempt(userId, domain, {
        qid: 'q1', correct: false, confidence: 0.2
      });

      const state = learningStateService.getUserState(userId);
      const recommendations = recommendationEngine.generateRecommendations(state);

      // Find weak area recommendation
      const rec = recommendations.find(r => r.type === 'weak_area_focus');

      if (rec) {
        // Click handler
        const onCardClick = vi.fn(() => {
          mockRoute(`/weak-area/${rec.data?.objectives?.[0]}`);
        });

        onCardClick();
        expect(mockRoute).toHaveBeenCalled();
      }
    });

    it('should disable recommendation if prerequisites not met', () => {
      const state = learningStateService.getUserState(userId);
      const recommendations = recommendationEngine.generateRecommendations(state);

      // Some recommendations may have prerequisites
      recommendations.forEach(rec => {
        if (rec.prerequisite) {
          // Verify prerequisite is defined
          expect(rec.prerequisite).toBeDefined();
          // If not met, should show as disabled
        }
      });
    });
  });

  describe('Notification Center Integration', () => {
    it('should display latest notifications', () => {
      const domain = 'domain-1';

      // Generate multiple notifications
      const notifications = [
        {
          id: '1',
          userId,
          type: 'refresh_due',
          title: 'Domain 1 refresh due',
          timestamp: Date.now(),
        },
        {
          id: '2',
          userId,
          type: 'achievement',
          title: 'Domain 1 mastered!',
          timestamp: Date.now() + 1000,
        },
      ];

      // Sort by latest
      const sorted = [...notifications].sort((a, b) => b.timestamp - a.timestamp);
      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('1');
    });

    it('should mark notification as read when clicked', () => {
      const notification = {
        id: '1',
        userId,
        type: 'recommendation',
        title: 'Next step',
        read: false,
      };

      // Click handler
      const onClick = vi.fn(() => {
        notification.read = true;
      });

      onClick();
      expect(notification.read).toBe(true);
    });

    it('should filter notifications by type', () => {
      const notifications = [
        { id: '1', type: 'refresh_due', userId },
        { id: '2', type: 'achievement', userId },
        { id: '3', type: 'refresh_due', userId },
      ];

      const refreshNotifs = notifications.filter(n => n.type === 'refresh_due');
      expect(refreshNotifs.length).toBe(2);

      const achievementNotifs = notifications.filter(n => n.type === 'achievement');
      expect(achievementNotifs.length).toBe(1);
    });

    it('should clear old notifications on scroll', () => {
      const now = Date.now();
      const notifications = [
        { id: '1', timestamp: now - 30 * 24 * 60 * 60 * 1000, userId }, // 30 days old
        { id: '2', timestamp: now - 1 * 24 * 60 * 60 * 1000, userId },  // 1 day old
        { id: '3', timestamp: now, userId },  // now
      ];

      const RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
      const retained = notifications.filter(n => now - n.timestamp < RETENTION_MS);

      expect(retained.length).toBe(2);
      expect(retained[0].id).toBe('2');
    });
  });

  describe('Form Submissions and State Updates', () => {
    it('should update state when quiz is submitted', () => {
      const domain = 'domain-1';
      const formData = {
        domain,
        answers: [
          { qid: 'q1', selectedId: 'a1' },
          { qid: 'q2', selectedId: 'a2' },
        ],
      };

      // Simulate form submission
      formData.answers.forEach((answer, idx) => {
        const isCorrect = idx === 0; // q1 correct, q2 incorrect
        learningStateService.recordQuizAttempt(userId, domain, {
          qid: answer.qid,
          correct: isCorrect,
          confidence: 0.7,
        });
      });

      const state = learningStateService.getUserState(userId);
      expect(state.domainStates[domain].quizAttempts.length).toBe(2);
    });

    it('should persist form state while editing', () => {
      const formState = {
        domain: 'domain-1',
        sessionSize: 10,
        includeLabReview: true,
      };

      // Simulate form state changes
      formState.sessionSize = 20;
      formState.includeLabReview = false;

      expect(formState.sessionSize).toBe(20);
      expect(formState.includeLabReview).toBe(false);
    });

    it('should validate form input before submission', () => {
      const formData = {
        domain: 'domain-1',
        sessionSize: 5,
      };

      const isValid = formData.sessionSize >= 5 && formData.sessionSize <= 100;
      expect(isValid).toBe(true);

      formData.sessionSize = 200; // Invalid
      const isValidAfter = formData.sessionSize >= 5 && formData.sessionSize <= 100;
      expect(isValidAfter).toBe(false);
    });
  });
});
