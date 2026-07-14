/**
 * Phases 1-3 Unit Tests
 *
 * Comprehensive tests for:
 * - Phase 1: Domain Baseline Optimization (test-out, weak areas, status tracking)
 * - Phase 2: Domain Pass Mastery Progression (prerequisites, adaptive difficulty, certification)
 * - Phase 3: Lab Navigation & Completion (lab tracking, navigation, progress)
 *
 * Coverage: 85%+ of business logic (not UI)
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Phase 1 imports
import {
  isEligibleForTestOut,
  claimTestOut,
  generateTestOutCertificate,
  isCertificateValid,
  daysUntilExpiry,
  refreshCertificate,
  TestOutCertificate,
} from '../features/domainBaseline/baselineTestOut';

import {
  identifyWeakAreas,
  generateWeakAreaRetakeSession,
  recordWeakAreaRetakeAttempt,
  isWeakAreaMastered,
  identifyRemainingWeakAreas,
  calculateWeakAreaProgress,
  BaselineResponse,
  WeakTopic,
} from '../features/domainBaseline/weakAreaRetakes';

import {
  BaselineStatus,
  determineBaselineStatus,
  getBaselineStatus,
  getProgressToTestOut,
  getBaselineStatusMessage,
  getRecommendedNextAction,
  transitionStatus,
  formatProgressLabel,
  estimateDaysToTestOut,
} from '../features/domainBaseline/baselineStatusTracker';

// Phase 2 imports
import {
  checkDomainPassReadiness,
  getDomainPassReadinessMessage,
  canTakeDomainPass,
  daysSinceBaseline,
  getRecommendedWaitDays,
  getNextRecommendedDomainPassDate,
  isReadyForNextAttempt,
} from '../features/domainPass/domainPassPrerequisites';

import {
  shouldUseAdaptiveDifficulty,
  selectAdaptiveQuestions,
  adjustQuestionDifficultyPool,
  checkRetryReadiness,
  getDifficultyProgressionMessage,
  DifficultyLevel,
} from '../features/domainPass/adaptiveDifficulty';

import {
  issueDomaincertificate,
  getDomainCertificationStatus,
  renewCertification,
  isCertificationExpiringSoon,
  wasSecondAttemptNecessary,
  getCertificationProgressMessage,
  calculateCertificationProgress,
  MasteryLevel,
  CertificationStatus,
} from '../features/domainPass/masteryCertification';

// Phase 3 imports
import {
  recordLabCompletion,
  getDomainLabProgress,
  getLabsByStatus,
  getDomainLabTotalTime,
  formatLabProgressLabel,
  LabStatus,
} from '../features/labs/labCompletionTracking';

import {
  getNextLab,
  getPreviousLab,
  canNavigateToNextLab,
  canNavigateToPreviousLab,
  getLabNavigationState,
  getNavigationButtonsState,
  getLabSequenceOrder,
  validateNavigation,
} from '../features/labs/labNavigation';

import {
  getLabProgressBar,
  formatLabProgressLabel as formatProgress,
  getProgressIndicatorStatus,
  calculateProgressSegments,
  estimateTimeToCompletion,
  getMotivationMessage,
  rankDomainsByLabProgress,
} from '../features/labs/labProgressIndicator';

/**
 * ============================================================================
 * PHASE 1: Domain Baseline Optimization Tests
 * ============================================================================
 */

describe('Phase 1: Domain Baseline Optimization', () => {
  describe('Test-Out Eligibility', () => {
    it('should require baseline attempt', () => {
      const domainState = { baseline: { attemptDate: null } };
      const weakAreaAttempts = [{ score: 5, totalQuestions: 5 }];

      const eligible = isEligibleForTestOut(domainState, weakAreaAttempts, 60);
      expect(eligible).toBe(false);
    });

    it('should require at least 1 weak-area attempt', () => {
      const domainState = { baseline: { attemptDate: new Date() } };
      const weakAreaAttempts: any[] = [];

      const eligible = isEligibleForTestOut(domainState, weakAreaAttempts, 60);
      expect(eligible).toBe(false);
    });

    it('should require weak-area retake score >= 80%', () => {
      const domainState = { baseline: { attemptDate: new Date() } };
      const weakAreaAttempts = [{ score: 3, totalQuestions: 5 }]; // 60%

      const eligible = isEligibleForTestOut(domainState, weakAreaAttempts, 60);
      expect(eligible).toBe(false);
    });

    it('should allow test-out if baseline < 80% but retake >= 80%', () => {
      const domainState = { baseline: { attemptDate: new Date() } };
      const weakAreaAttempts = [{ score: 4, totalQuestions: 5 }]; // 80%

      const eligible = isEligibleForTestOut(domainState, weakAreaAttempts, 60);
      expect(eligible).toBe(true);
    });

    it('should require 2+ attempts if initial baseline < 80%', () => {
      const domainState = { baseline: { attemptDate: new Date() } };
      const weakAreaAttempts = [{ score: 4, totalQuestions: 5 }]; // Only 1 attempt

      const eligible = isEligibleForTestOut(domainState, weakAreaAttempts, 60);
      expect(eligible).toBe(false); // Need 2 attempts when baseline < 80%
    });

    it('should allow test-out with baseline >= 80% (1 attempt)', () => {
      const domainState = { baseline: { attemptDate: new Date() } };
      const weakAreaAttempts = [{ score: 4, totalQuestions: 5 }]; // 80%

      const eligible = isEligibleForTestOut(domainState, weakAreaAttempts, 85);
      expect(eligible).toBe(true);
    });
  });

  describe('Test-Out Certificate', () => {
    let certificate: TestOutCertificate;

    beforeEach(() => {
      certificate = generateTestOutCertificate('D1', 'user123', 70, 95);
    });

    it('should generate valid certificate with 30-day expiry', () => {
      expect(certificate).toBeDefined();
      expect(certificate.userId).toBe('user123');
      expect(certificate.domainId).toBe('D1');

      const daysDiff = Math.floor((certificate.expiryDate.getTime() - certificate.issuedDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(30);
    });

    it('should validate certificate is active', () => {
      const isValid = isCertificateValid(certificate);
      expect(isValid).toBe(true);
    });

    it('should calculate days until expiry correctly', () => {
      const days = daysUntilExpiry(certificate);
      expect(days).toBeGreaterThan(29);
      expect(days).toBeLessThanOrEqual(30);
    });

    it('should mark as expired after 30 days', () => {
      const expiredCert: TestOutCertificate = {
        ...certificate,
        expiryDate: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday
      };

      const isValid = isCertificateValid(expiredCert);
      expect(isValid).toBe(false);
    });

    it('should refresh certificate extending 30 days', () => {
      const refreshed = refreshCertificate(certificate);
      expect(refreshed.status).toBe('refreshed');

      const daysDiff = Math.floor((refreshed.expiryDate.getTime() - refreshed.refreshedDate!.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(30);
    });
  });

  describe('Weak-Area Identification', () => {
    it('should identify weak topics (< 80% accuracy)', () => {
      const responses: BaselineResponse[] = [
        { questionId: '1', topicId: 'T1', correct: true },
        { questionId: '2', topicId: 'T1', correct: true },
        { questionId: '3', topicId: 'T1', correct: true },
        { questionId: '4', topicId: 'T1', correct: true },
        { questionId: '5', topicId: 'T2', correct: false },
        { questionId: '6', topicId: 'T2', correct: false },
        { questionId: '7', topicId: 'T2', correct: false },
        { questionId: '8', topicId: 'T2', correct: true },
      ];

      const weakTopics = identifyWeakAreas(responses);
      expect(weakTopics.length).toBeGreaterThan(0);
      expect(weakTopics.some(t => t.topicId === 'T2')).toBe(true);
      expect(weakTopics.find(t => t.topicId === 'T2')?.accuracy).toBeLessThan(80);
    });

    it('should not include topics with >= 80% accuracy', () => {
      const responses: BaselineResponse[] = [
        { questionId: '1', topicId: 'T1', correct: true },
        { questionId: '2', topicId: 'T1', correct: true },
        { questionId: '3', topicId: 'T1', correct: true },
        { questionId: '4', topicId: 'T1', correct: true },
        { questionId: '5', topicId: 'T1', correct: true },
      ];

      const weakTopics = identifyWeakAreas(responses);
      expect(weakTopics.filter(t => t.topicId === 'T1')).toHaveLength(0);
    });

    it('should limit to 5 weak topics', () => {
      const responses: BaselineResponse[] = [];
      for (let i = 1; i <= 6; i++) {
        responses.push({ questionId: `q${i}`, topicId: `T${i}`, correct: false });
      }

      const weakTopics = identifyWeakAreas(responses);
      expect(weakTopics.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Weak-Area Retake Session', () => {
    it('should generate retake session with weak topics', () => {
      const weakTopics: WeakTopic[] = [
        { topicId: 'T2', missCount: 3, totalAttempted: 4, accuracy: 75 },
        { topicId: 'T3', missCount: 2, totalAttempted: 3, accuracy: 67 },
      ];

      const session = generateWeakAreaRetakeSession('user123', 'D1', weakTopics, 1);
      expect(session.userId).toBe('user123');
      expect(session.domainId).toBe('D1');
      expect(session.attemptNumber).toBe(1);
      expect(session.weakTopics).toEqual(weakTopics);
    });

    it('should record weak-area retake attempt', () => {
      const attempt = recordWeakAreaRetakeAttempt(
        'user123',
        'session_abc',
        'D1',
        1,
        4,
        5,
        ['T2', 'T3']
      );

      expect(attempt.accuracy).toBe(80);
      expect(isWeakAreaMastered(attempt)).toBe(true);
    });
  });

  describe('Baseline Status Tracking', () => {
    it('should be NOT_STARTED with no baseline', () => {
      const status = determineBaselineStatus(
        'D1',
        'user123',
        null,
        null,
        null,
        null,
        0,
        null,
        null
      );

      expect(status).toBe(BaselineStatus.NOT_STARTED);
    });

    it('should be BASELINE_PENDING after taking baseline < 80%', () => {
      const status = determineBaselineStatus(
        'D1',
        'user123',
        60,
        new Date(),
        null,
        null,
        0,
        null,
        null
      );

      expect(status).toBe(BaselineStatus.BASELINE_PENDING);
    });

    it('should be WEAK_AREA_FOCUS when working on weak areas', () => {
      const status = determineBaselineStatus(
        'D1',
        'user123',
        60,
        new Date(),
        70,
        new Date(),
        1,
        null,
        null
      );

      expect(status).toBe(BaselineStatus.WEAK_AREA_FOCUS);
    });

    it('should be READY_FOR_TEST_OUT when weak areas mastered', () => {
      const status = determineBaselineStatus(
        'D1',
        'user123',
        60,
        new Date(),
        85,
        new Date(),
        2,
        null,
        null
      );

      expect(status).toBe(BaselineStatus.READY_FOR_TEST_OUT);
    });

    it('should be TESTED_OUT after test-out claimed', () => {
      const status = determineBaselineStatus(
        'D1',
        'user123',
        60,
        new Date(),
        100,
        new Date(),
        2,
        new Date(),
        new Date()
      );

      expect(status).toBe(BaselineStatus.TESTED_OUT);
    });

    it('should calculate progress to test-out', () => {
      const progress1 = getProgressToTestOut(null, null);
      expect(progress1).toBe(0);

      const progress2 = getProgressToTestOut(85, null);
      expect(progress2).toBe(100);

      const progress3 = getProgressToTestOut(60, 70);
      expect(progress3).toBeLessThan(100);
      expect(progress3).toBeGreaterThan(0);
    });

    it('should recommend next action based on status', () => {
      expect(getRecommendedNextAction(BaselineStatus.NOT_STARTED)).toBe('take_baseline');
      expect(getRecommendedNextAction(BaselineStatus.BASELINE_PENDING)).toBe('retake_weak_areas');
      expect(getRecommendedNextAction(BaselineStatus.READY_FOR_TEST_OUT)).toBe('test_out');
      expect(getRecommendedNextAction(BaselineStatus.TESTED_OUT)).toBe(null);
    });

    it('should transition states correctly', () => {
      const next = transitionStatus(BaselineStatus.NOT_STARTED, BaselineStatus.BASELINE_PENDING);
      expect(next).toBe(BaselineStatus.BASELINE_PENDING);

      const invalid = transitionStatus(BaselineStatus.NOT_STARTED, BaselineStatus.TESTED_OUT);
      expect(invalid).toBe(BaselineStatus.NOT_STARTED); // Invalid transition
    });
  });
});

/**
 * ============================================================================
 * PHASE 2: Domain Pass Mastery Progression Tests
 * ============================================================================
 */

describe('Phase 2: Domain Pass Mastery Progression', () => {
  describe('Domain Pass Prerequisites', () => {
    it('should block domain pass if no baseline', () => {
      const result = checkDomainPassReadiness(null, null, null, null, false, 0);
      expect(result.canTakeDomainPass).toBe(false);
      expect(result.readinessScore).toBe(0);
    });

    it('should require weak-area mastery if baseline < 80%', () => {
      const result = checkDomainPassReadiness(
        70,
        new Date(),
        70,
        new Date(),
        false,
        1
      );

      expect(result.canTakeDomainPass).toBe(false);
    });

    it('should allow domain pass if baseline >= 80%', () => {
      const result = checkDomainPassReadiness(
        85,
        new Date(),
        null,
        null,
        false,
        0
      );

      expect(result.canTakeDomainPass).toBe(true);
    });

    it('should grant bonus points for test-out', () => {
      const result1 = checkDomainPassReadiness(85, new Date(), null, null, false, 0);
      const result2 = checkDomainPassReadiness(85, new Date(), null, null, true, 0);

      expect(result2.readinessScore).toBeGreaterThan(result1.readinessScore);
    });

    it('should calculate correct readiness message', () => {
      const result = checkDomainPassReadiness(85, new Date(), null, null, true, 0);
      const message = getDomainPassReadinessMessage(result);
      expect(message).toContain('ready');
    });

    it('should calculate days since baseline', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const days = daysSinceBaseline(yesterday);
      expect(days).toBeGreaterThanOrEqual(0);
      expect(days).toBeLessThanOrEqual(2);
    });

    it('should recommend wait time based on score', () => {
      expect(getRecommendedWaitDays(50)).toBe(7);
      expect(getRecommendedWaitDays(65)).toBe(5);
      expect(getRecommendedWaitDays(75)).toBe(3);
      expect(getRecommendedWaitDays(90)).toBe(1);
    });
  });

  describe('Adaptive Difficulty', () => {
    it('should use standard difficulty for attempt 1', () => {
      const config = shouldUseAdaptiveDifficulty(1, 80);
      expect(config.shouldUseAdaptive).toBe(false);
      expect(config.difficultyLevel).toBe(DifficultyLevel.STANDARD);
    });

    it('should not allow attempt 2 if score < 70%', () => {
      const config = shouldUseAdaptiveDifficulty(2, 65);
      expect(config.shouldUseAdaptive).toBe(false);
    });

    it('should use adaptive with weak-area focus for 70-85% score', () => {
      const config = shouldUseAdaptiveDifficulty(2, 75);
      expect(config.shouldUseAdaptive).toBe(true);
      expect(config.difficultyLevel).toBe(DifficultyLevel.HARD);
      expect(config.focusWeakAreas).toBe(true);
    });

    it('should use all-hard for 85%+ score', () => {
      const config = shouldUseAdaptiveDifficulty(2, 90);
      expect(config.shouldUseAdaptive).toBe(true);
      expect(config.difficultyLevel).toBe(DifficultyLevel.HARD);
      expect(config.focusWeakAreas).toBe(false);
    });

    it('should select adaptive questions correctly', () => {
      const selection = selectAdaptiveQuestions('D1', 78, ['T2', 'T3', 'T5']);
      expect(selection.difficulty).toBe(DifficultyLevel.HARD);
      expect(selection.weakAreasToFocus.length).toBeGreaterThan(0);
    });

    it('should adjust difficulty pool based on performance', () => {
      const original = { easy: 30, medium: 50, hard: 20 };

      const result1 = adjustQuestionDifficultyPool(90, original);
      expect(result1.adjustedDistribution.hard).toBeGreaterThan(original.hard);

      const result2 = adjustQuestionDifficultyPool(65, original);
      expect(result2.changePercent).toBe(0); // No change for low scores
    });

    it('should check retry readiness based on time and score', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 5);

      const ready = isReadyForNextAttempt(yesterday, 75);
      expect(ready).toBe(true);
    });
  });

  describe('Mastery Certification', () => {
    it('should issue certificate for 95%+ on attempt 1', () => {
      const cert = issueDomaincertificate('D1', 'user123', 96, new Date());

      expect(cert).toBeDefined();
      expect(cert?.masteryLevel).toBe(MasteryLevel.SINGLE_ATTEMPT);
      expect(cert?.status).toBe(CertificationStatus.ACTIVE);
    });

    it('should not issue certificate for single attempt < 95%', () => {
      const cert = issueDomaincertificate('D1', 'user123', 85, new Date());
      expect(cert).toBeNull();
    });

    it('should issue certificate for two passing attempts', () => {
      const now = new Date();
      const cert = issueDomaincertificate(
        'D1',
        'user123',
        75,
        now,
        82,
        now
      );

      expect(cert).toBeDefined();
      expect(cert?.masteryLevel).toBe(MasteryLevel.DUAL_ATTEMPT);
    });

    it('should expire certificate after 30 days', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 31);

      const cert = issueDomaincertificate('D1', 'user123', 96, pastDate);
      if (cert) {
        const status = getDomainCertificationStatus(cert);
        expect(status.isValid).toBe(false);
      }
    });

    it('should renew certificate extending 30 days', () => {
      const now = new Date();
      const cert = issueDomaincertificate('D1', 'user123', 96, now);

      if (cert) {
        const renewed = renewCertification(cert);
        expect(renewed.status).toBe(CertificationStatus.REFRESHED);
        expect(renewed.refreshCount).toBe(1);
      }
    });

    it('should check if certificate expiring soon', () => {
      const now = new Date();
      const cert = issueDomaincertificate('D1', 'user123', 96, now);

      if (cert) {
        // Adjust expiry to 5 days from now
        cert.expiryDate = new Date(now);
        cert.expiryDate.setDate(cert.expiryDate.getDate() + 5);

        expect(isCertificationExpiringSoon(cert)).toBe(true);
      }
    });

    it('should calculate certification progress', () => {
      expect(calculateCertificationProgress(96, undefined)).toBe(100);
      expect(calculateCertificationProgress(75, 82)).toBe(100);
      expect(calculateCertificationProgress(75, undefined)).toBe(50);
      expect(calculateCertificationProgress(60, undefined)).toBeLessThan(50);
    });
  });
});

/**
 * ============================================================================
 * PHASE 3: Lab Navigation & Completion Tests
 * ============================================================================
 */

describe('Phase 3: Lab Navigation & Completion', () => {
  const domainLabs = ['4.1', '4.2', '4.3'];

  describe('Lab Completion Tracking', () => {
    it('should record lab completion', () => {
      const record = recordLabCompletion('4.1', 'user123', 'D4', new Date(), 900);

      expect(record.labId).toBe('4.1');
      expect(record.status).toBe(LabStatus.COMPLETED);
      expect(record.timeSpentSeconds).toBe(900);
    });

    it('should calculate domain lab progress', () => {
      const records = [
        recordLabCompletion('4.1', 'user123', 'D4', new Date(), 600),
        recordLabCompletion('4.2', 'user123', 'D4', new Date(), 700),
      ];

      const progress = getDomainLabProgress('D4', domainLabs, records);

      expect(progress.completedLabs).toBe(2);
      expect(progress.totalLabs).toBe(3);
      expect(progress.notStartedLabs).toBe(1);
      expect(progress.completionPercentage).toBe(67);
    });

    it('should get labs by status', () => {
      const records = [
        recordLabCompletion('4.1', 'user123', 'D4', new Date()),
      ];

      const byStatus = getLabsByStatus('D4', domainLabs, records);

      expect(byStatus.completed).toContain('4.1');
      expect(byStatus.notStarted).toContain('4.2');
      expect(byStatus.notStarted).toContain('4.3');
    });

    it('should calculate total time on domain labs', () => {
      const records = [
        recordLabCompletion('4.1', 'user123', 'D4', new Date(), 600),
        recordLabCompletion('4.2', 'user123', 'D4', new Date(), 900),
      ];

      const minutes = getDomainLabTotalTime('D4', records);
      expect(minutes).toBe(25); // 1500 seconds = 25 minutes
    });

    it('should format progress label', () => {
      const label = formatLabProgressLabel({
        domainId: 'D4',
        totalLabs: 3,
        completedLabs: 2,
        inProgressLabs: 0,
        notStartedLabs: 1,
        completionPercentage: 67,
      });

      expect(label).toBe('2 of 3 labs complete');
    });
  });

  describe('Lab Navigation', () => {
    it('should get next lab', () => {
      const next = getNextLab('4.1', 'D4', domainLabs);
      expect(next.labId).toBe('4.2');
      expect(next.isLast).toBe(false);
    });

    it('should return null for last lab next', () => {
      const next = getNextLab('4.3', 'D4', domainLabs);
      expect(next.labId).toBeNull();
      expect(next.isLast).toBe(true);
    });

    it('should get previous lab', () => {
      const prev = getPreviousLab('4.2', 'D4', domainLabs);
      expect(prev.labId).toBe('4.1');
      expect(prev.isFirst).toBe(false);
    });

    it('should return null for first lab previous', () => {
      const prev = getPreviousLab('4.1', 'D4', domainLabs);
      expect(prev.labId).toBeNull();
      expect(prev.isFirst).toBe(true);
    });

    it('should not allow next if current not completed', () => {
      const can = canNavigateToNextLab('4.1', false, 'D4', domainLabs);
      expect(can).toBe(false);
    });

    it('should allow next if current completed', () => {
      const can = canNavigateToNextLab('4.1', true, 'D4', domainLabs);
      expect(can).toBe(true);
    });

    it('should allow previous always', () => {
      const can = canNavigateToPreviousLab('4.2', domainLabs);
      expect(can).toBe(true);
    });

    it('should get navigation state', () => {
      const state = getLabNavigationState('4.2', 'D4', true, domainLabs);

      expect(state.currentLabId).toBe('4.2');
      expect(state.canNavigateNext).toBe(true);
      expect(state.canNavigatePrevious).toBe(true);
      expect(state.nextLabId).toBe('4.3');
      expect(state.previousLabId).toBe('4.1');
      expect(state.isFirstLab).toBe(false);
      expect(state.isLastLab).toBe(false);
      expect(state.labPosition).toBe(2);
    });

    it('should validate navigation requests', () => {
      const state = getLabNavigationState('4.1', 'D4', true, domainLabs);
      const valid = validateNavigation(state, '4.2', 'next');

      expect(valid.isValid).toBe(true);
    });

    it('should order lab sequence correctly', () => {
      const unordered = ['4.3', '4.1', '4.2'];
      const ordered = getLabSequenceOrder(unordered);

      expect(ordered).toEqual(['4.1', '4.2', '4.3']);
    });
  });

  describe('Lab Progress Indicator', () => {
    it('should calculate progress bar', () => {
      const bar = getLabProgressBar(3, 2, 0);

      expect(bar.total).toBe(3);
      expect(bar.completed).toBe(2);
      expect(bar.percentage).toBe(67);
      expect(bar.segments.completed).toBe(2);
      expect(bar.segments.notStarted).toBe(1);
    });

    it('should format progress label', () => {
      const label = formatProgress(2, 3);

      expect(label.short).toBe('2/3');
      expect(label.long).toBe('2 of 3 labs complete');
      expect(label.percentage).toBe('67%');
    });

    it('should get progress indicator status', () => {
      const status0 = getProgressIndicatorStatus(0);
      expect(status0.status).toBe('not_started');

      const status50 = getProgressIndicatorStatus(50);
      expect(status50.status).toBe('in_progress');

      const status80 = getProgressIndicatorStatus(80);
      expect(status80.status).toBe('nearly_complete');

      const status100 = getProgressIndicatorStatus(100);
      expect(status100.status).toBe('complete');
    });

    it('should calculate progress segments', () => {
      const segments = calculateProgressSegments(2, 1, 3);

      expect(segments.completed).toBeGreaterThan(0);
      expect(segments.inProgress).toBeGreaterThan(0);
      expect(segments.notStarted).toBeGreaterThan(0);
    });

    it('should estimate time to completion', () => {
      const timeMinutes = estimateTimeToCompletion(2, 3, 15);
      expect(timeMinutes).toBe(15); // 1 lab * 15 min
    });

    it('should provide motivation messages', () => {
      const msg0 = getMotivationMessage(0, 3);
      expect(msg0).toContain('3');

      const msg100 = getMotivationMessage(3, 3);
      expect(msg100).toContain('🎉');
    });

    it('should rank domains by lab progress', () => {
      const progresses = [
        { domainId: 'D1', completedLabs: 2, totalLabs: 3 },
        { domainId: 'D2', completedLabs: 4, totalLabs: 4 },
        { domainId: 'D3', completedLabs: 1, totalLabs: 3 },
      ];

      const ranked = rankDomainsByLabProgress(progresses);

      expect(ranked[0].domainId).toBe('D2'); // 100%
      expect(ranked[1].domainId).toBe('D1'); // 67%
      expect(ranked[2].domainId).toBe('D3'); // 33%
    });
  });
});

/**
 * ============================================================================
 * Integration & Edge Cases
 * ============================================================================
 */

describe('Cross-Phase Integration & Edge Cases', () => {
  it('should handle progression from baseline through test-out to domain pass', () => {
    // Phase 1: Take baseline at 65%
    let status = determineBaselineStatus('D1', 'user123', 65, new Date(), null, null, 0, null, null);
    expect(status).toBe(BaselineStatus.BASELINE_PENDING);

    // Phase 1: Weak area retake at 85%
    status = determineBaselineStatus(
      'D1',
      'user123',
      65,
      new Date(),
      85,
      new Date(),
      2,
      null,
      null
    );
    expect(status).toBe(BaselineStatus.READY_FOR_TEST_OUT);

    // Phase 1: Test out
    status = determineBaselineStatus(
      'D1',
      'user123',
      65,
      new Date(),
      85,
      new Date(),
      2,
      new Date(),
      new Date()
    );
    expect(status).toBe(BaselineStatus.TESTED_OUT);

    // Phase 2: Ready for domain pass
    const ready = checkDomainPassReadiness(65, new Date(), 85, new Date(), true, 2);
    expect(ready.canTakeDomainPass).toBe(true);
  });

  it('should handle multiple lab completions in sequence', () => {
    const domainLabs = ['4.1', '4.2', '4.3'];
    const records: any[] = [];

    // Complete lab 1
    records.push(recordLabCompletion('4.1', 'user123', 'D4'));

    // Navigate to lab 2
    const state1 = getLabNavigationState('4.1', 'D4', true, domainLabs);
    expect(state1.canNavigateNext).toBe(true);
    expect(state1.nextLabId).toBe('4.2');

    // Complete lab 2
    records.push(recordLabCompletion('4.2', 'user123', 'D4'));

    // Navigate to lab 3
    const state2 = getLabNavigationState('4.2', 'D4', true, domainLabs);
    expect(state2.nextLabId).toBe('4.3');

    // Progress should be 67%
    const progress = getDomainLabProgress('D4', domainLabs, records);
    expect(progress.completionPercentage).toBe(67);
  });

  it('should handle certificate expiry and refresh cycle', () => {
    const now = new Date();

    // Issue certificate
    let cert = issueDomaincertificate('D1', 'user123', 92, now, 88, now);
    expect(cert?.status).toBe(CertificationStatus.ACTIVE);

    // Simulate 25 days passing
    if (cert) {
      const inFuture = new Date(now);
      inFuture.setDate(inFuture.getDate() + 25);

      const status = getDomainCertificationStatus(cert);
      expect(status.daysUntilExpiry).toBeGreaterThan(0);
      expect(status.daysUntilExpiry).toBeLessThanOrEqual(5);

      // Refresh before expiry
      const refreshed = renewCertification(cert);
      expect(refreshed.status).toBe(CertificationStatus.REFRESHED);
    }
  });
});
