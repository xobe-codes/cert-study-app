/**
 * Phase 6 Unit Tests
 *
 * Comprehensive test suite for the Adaptive Recommendations Engine:
 * - Recommendation generation and prioritization
 * - Refresh drill detection
 * - Warning generation
 * - Study waste prevention
 * - Study time tracking and break suggestions
 * - Contextual handoffs
 * - Recommendation persistence and metrics
 * - Integration tests
 *
 * Target: 85%+ coverage
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateRecommendations,
  checkRefreshDueRecommendations,
  checkNextStepRecommendations,
  checkWarningRecommendations,
  checkStudyWasteRecommendations,
  checkExamReadinessRecommendations,
  checkMaintenanceRecommendations,
} from '../features/recommendations/recommendationRulesEngine';
import {
  trackStudySessionDuration,
  calculateTodayStudyTime,
  shouldSuggestBreak,
  generateBreakSuggestion,
  isBestTimeToStudy,
  getRemainingStudyTime,
  detectStudyStreak,
  generateStreakMilestoneRecommendation,
} from '../features/recommendations/studyTimeMonitor';
import {
  detectRetestOfMastered,
  generateRetestWarning,
  suggestAlternativeStudy,
  trackOverstudyPattern,
  generateOverstudyWarning,
  calculateOpportunityCost,
  isOverfocusingOnOneDomain,
  findOverfocusedDomain,
  generateDiversificationRecommendation,
} from '../features/recommendations/studyWastePrevention';
import {
  getNextActionAfterQuiz,
  getNextActionAfterBaseline,
  getNextActionAfterDomainPass,
  getNextActionAfterMockExam,
  suggestActivityByTimeAvailable,
} from '../features/recommendations/contextualHandoffs';
import {
  InMemoryRecommendationRepository,
  RecommendationPersistenceService,
} from '../features/recommendations/recommendationPersistence';
import {
  Recommendation,
  RecommendationPriority,
  RecommendationType,
  LearningContext,
  DomainRecommendationContext,
  StudySessionData,
  MasteryOverview,
  QuizResult,
} from '../features/recommendations/recommendationTypes';

/**
 * Helper: Create mock learning context
 */
function createMockLearningContext(overrides?: Partial<LearningContext>): LearningContext {
  const now = new Date();
  return {
    userId: 'test_user_123',
    totalStudyMinutesToday: 90,
    domainStatuses: {
      D1: {
        domainId: 'D1',
        domainName: 'Domain 1',
        baselineStatus: 'TESTED_OUT',
        baselineScore: 85,
        weakAreas: [],
        lastActivityDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        daysSinceActivity: 2,
        readinessPercentage: 95,
        priority: 'medium',
      },
      D2: {
        domainId: 'D2',
        domainName: 'Domain 2',
        baselineStatus: 'NOT_STARTED',
        baselineScore: null,
        weakAreas: [],
        lastActivityDate: undefined,
        daysSinceActivity: 30,
        readinessPercentage: 0,
        priority: 'high',
      },
      D3: {
        domainId: 'D3',
        domainName: 'Domain 3',
        baselineStatus: 'WEAK_AREA_FOCUS',
        baselineScore: 75,
        weakAreas: ['obj_3_1', 'obj_3_2'],
        lastActivityDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        daysSinceActivity: 5,
        readinessPercentage: 70,
        priority: 'high',
      },
    },
    mockExamScore: undefined,
    mockExamDueDate: undefined,
    estimatedReadinessPercentage: 65,
    daysTillExam: 60,
    currentStreak: 5,
    lastStudyDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    knowledgeDecayRisk: false,
    ...overrides,
  };
}

/**
 * ============================================================================
 * Test Suite: Recommendation Generation & Prioritization
 * ============================================================================
 */

describe('Recommendation Generation & Prioritization', () => {
  it('should generate recommendations sorted by priority', () => {
    const context = createMockLearningContext();
    const recs = generateRecommendations('user_123', context);

    expect(recs.length).toBeGreaterThan(0);

    // Check that recommendations are sorted by priority
    const priorityOrder = {
      [RecommendationPriority.IMMEDIATE]: 0,
      [RecommendationPriority.WARNING]: 1,
      [RecommendationPriority.STRATEGIC]: 2,
      [RecommendationPriority.MAINTENANCE]: 3,
    };

    for (let i = 0; i < recs.length - 1; i++) {
      expect(priorityOrder[recs[i].priority]).toBeLessThanOrEqual(priorityOrder[recs[i + 1].priority]);
    }
  });

  it('should not generate more than 3 immediate recommendations at once', () => {
    const context = createMockLearningContext();
    const recs = generateRecommendations('user_123', context);

    const immediateRecs = recs.filter(r => r.priority === RecommendationPriority.IMMEDIATE);
    expect(immediateRecs.length).toBeLessThanOrEqual(3);
  });

  it('should include reasoning and confidence scores', () => {
    const context = createMockLearningContext();
    const recs = generateRecommendations('user_123', context);

    recs.forEach(rec => {
      expect(rec.reasoning).toBeDefined();
      expect(rec.reasoning.length).toBeGreaterThan(0);
      expect(rec.confidence).toBeGreaterThanOrEqual(0);
      expect(rec.confidence).toBeLessThanOrEqual(100);
    });
  });

  it('should filter by options (include/exclude maintenance)', () => {
    const context = createMockLearningContext();

    const recsWithMaintenance = generateRecommendations('user_123', context, {
      includeMaintenanceRecommendations: true,
    });

    const recsWithoutMaintenance = generateRecommendations('user_123', context, {
      includeMaintenanceRecommendations: false,
    });

    const maintenanceInWith = recsWithMaintenance.some(
      r => r.priority === RecommendationPriority.MAINTENANCE
    );
    const maintenanceInWithout = recsWithoutMaintenance.some(
      r => r.priority === RecommendationPriority.MAINTENANCE
    );

    expect(maintenanceInWith).toBe(true);
    expect(maintenanceInWithout).toBe(false);
  });
});

/**
 * ============================================================================
 * Test Suite: Refresh Drill Recommendations
 * ============================================================================
 */

describe('Refresh Drill Recommendations', () => {
  it('should recommend refresh drill for tested-out domain with first refresh', () => {
    const context = createMockLearningContext({
      domainStatuses: {
        D1: {
          domainId: 'D1',
          domainName: 'Domain 1',
          baselineStatus: 'TESTED_OUT',
          baselineScore: 85,
          weakAreas: [],
          lastActivityDate: undefined, // No refresh yet
          daysSinceActivity: 0,
          readinessPercentage: 95,
          priority: 'medium',
        },
      },
    });

    const recs = checkRefreshDueRecommendations('user_123', context, new Date());
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].type).toBe(RecommendationType.REFRESH_DRILL);
    expect(recs[0].title).toContain('Refresh Available Now');
  });

  it('should recommend refresh drill on spaced repetition schedule (Day 1, 3, 7, 30)', () => {
    const now = new Date();

    // Test Day 3
    const dayThreeDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const context = createMockLearningContext({
      domainStatuses: {
        D1: {
          domainId: 'D1',
          domainName: 'Domain 1',
          baselineStatus: 'TESTED_OUT',
          baselineScore: 85,
          weakAreas: [],
          lastActivityDate: dayThreeDate,
          daysSinceActivity: 3,
          readinessPercentage: 95,
          priority: 'medium',
        },
      },
    });

    const recs = checkRefreshDueRecommendations('user_123', context, now);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].title).toContain('Day 3');
  });

  it('should not recommend refresh drill if not yet due', () => {
    const now = new Date();
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    const context = createMockLearningContext({
      domainStatuses: {
        D1: {
          domainId: 'D1',
          domainName: 'Domain 1',
          baselineStatus: 'TESTED_OUT',
          baselineScore: 85,
          weakAreas: [],
          lastActivityDate: sixHoursAgo,
          daysSinceActivity: 0,
          readinessPercentage: 95,
          priority: 'medium',
        },
      },
    });

    const recs = checkRefreshDueRecommendations('user_123', context, now);
    expect(recs.length).toBe(0);
  });
});

/**
 * ============================================================================
 * Test Suite: Next Step Recommendations
 * ============================================================================
 */

describe('Next Step Recommendations (Domain Pass Readiness)', () => {
  it('should recommend domain pass when baseline 80%+ with no weak areas', () => {
    const context = createMockLearningContext({
      domainStatuses: {
        D1: {
          domainId: 'D1',
          domainName: 'Domain 1',
          baselineStatus: 'READY_FOR_TEST_OUT',
          baselineScore: 82,
          weakAreas: [],
          lastActivityDate: new Date(),
          daysSinceActivity: 1,
          readinessPercentage: 85,
          priority: 'medium',
        },
      },
    });

    const recs = checkNextStepRecommendations('user_123', context, new Date());
    const domainPassRec = recs.find(r => r.type === RecommendationType.DOMAIN_PASS);

    expect(domainPassRec).toBeDefined();
    expect(domainPassRec?.priority).toBe(RecommendationPriority.IMMEDIATE);
  });

  it('should recommend baseline for domains not started', () => {
    const context = createMockLearningContext({
      domainStatuses: {
        D2: {
          domainId: 'D2',
          domainName: 'Domain 2',
          baselineStatus: 'NOT_STARTED',
          baselineScore: null,
          weakAreas: [],
          lastActivityDate: undefined,
          daysSinceActivity: 30,
          readinessPercentage: 0,
          priority: 'high',
        },
      },
    });

    const recs = checkNextStepRecommendations('user_123', context, new Date());
    const baselineRec = recs.find(r => r.type === RecommendationType.DOMAIN_BASELINE);

    expect(baselineRec).toBeDefined();
    expect(baselineRec?.priority).toBe(RecommendationPriority.STRATEGIC);
  });

  it('should not recommend domain pass if weak areas exist', () => {
    const context = createMockLearningContext({
      domainStatuses: {
        D3: {
          domainId: 'D3',
          domainName: 'Domain 3',
          baselineStatus: 'WEAK_AREA_FOCUS',
          baselineScore: 80,
          weakAreas: ['obj_1', 'obj_2'], // Still has weak areas
          lastActivityDate: new Date(),
          daysSinceActivity: 1,
          readinessPercentage: 75,
          priority: 'high',
        },
      },
    });

    const recs = checkNextStepRecommendations('user_123', context, new Date());
    const domainPassRec = recs.find(r => r.type === RecommendationType.DOMAIN_PASS);

    expect(domainPassRec).toBeUndefined();
  });
});

/**
 * ============================================================================
 * Test Suite: Warning Recommendations
 * ============================================================================
 */

describe('Warning Recommendations', () => {
  it('should warn if domain behind schedule (no baseline in 3 weeks)', () => {
    const now = new Date();
    const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);

    const context = createMockLearningContext({
      daysTillExam: 30, // Exam in 30 days
      domainStatuses: {
        D2: {
          domainId: 'D2',
          domainName: 'Domain 2',
          baselineStatus: 'NOT_STARTED',
          baselineScore: null,
          weakAreas: [],
          lastActivityDate: threeWeeksAgo,
          daysSinceActivity: 21,
          readinessPercentage: 0,
          priority: 'high',
        },
      },
    });

    const recs = checkWarningRecommendations('user_123', context, now);
    const warningRec = recs.find(r => r.priority === RecommendationPriority.WARNING);

    expect(warningRec).toBeDefined();
    expect(warningRec?.title).toContain('Behind Schedule');
  });

  it('should warn if knowledge decay risk (90+ days since activity)', () => {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const context = createMockLearningContext({
      domainStatuses: {
        D1: {
          domainId: 'D1',
          domainName: 'Domain 1',
          baselineStatus: 'TESTED_OUT',
          baselineScore: 85,
          weakAreas: [],
          lastActivityDate: ninetyDaysAgo,
          daysSinceActivity: 90,
          readinessPercentage: 95,
          priority: 'medium',
        },
      },
    });

    const recs = checkWarningRecommendations('user_123', context, now);
    const decayWarning = recs.find(r => r.title?.includes('Knowledge Decay'));

    expect(decayWarning).toBeDefined();
  });

  it('should warn if mock exam in 3 days and not ready', () => {
    const now = new Date();
    const examDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const context = createMockLearningContext({
      mockExamDueDate: examDate,
      mockExamScore: 60,
      estimatedReadinessPercentage: 65, // Below 75%
    });

    const recs = checkWarningRecommendations('user_123', context, now);
    const examWarning = recs.find(r => r.title?.includes('Mock Exam'));

    expect(examWarning).toBeDefined();
    expect(examWarning?.priority).toBe(RecommendationPriority.WARNING);
  });
});

/**
 * ============================================================================
 * Test Suite: Study Waste Prevention
 * ============================================================================
 */

describe('Study Waste Prevention', () => {
  it('should detect retest of mastered objective (95%+ and recent attempt)', () => {
    const masteryOverview: MasteryOverview = {
      userId: 'user_123',
      masteredObjectives: ['obj_1'],
      masteredDomains: [],
      overStudiedAreas: [],
      weakAreas: [],
      focusAreas: [],
    };

    const recentAttempt = new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago

    const isWaste = detectRetestOfMastered('obj_1', masteryOverview, recentAttempt);
    expect(isWaste).toBe(true);
  });

  it('should not flag retest as waste if more than 7 days since last attempt', () => {
    const masteryOverview: MasteryOverview = {
      userId: 'user_123',
      masteredObjectives: ['obj_1'],
      masteredDomains: [],
      overStudiedAreas: [],
      weakAreas: [],
      focusAreas: [],
    };

    const oldAttempt = new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago

    const isWaste = detectRetestOfMastered('obj_1', masteryOverview, oldAttempt);
    expect(isWaste).toBe(false);
  });

  it('should generate retest warning with alternative suggestions', () => {
    const warning = generateRetestWarning(
      'user_123',
      'obj_1',
      'Network Basics',
      95,
      ['obj_2', 'obj_3']
    );

    expect(warning.type).toBe(RecommendationType.MASTERY_DETECTED);
    expect(warning.title).toContain('Mastered');
    expect(warning.title).toContain('95%');
    expect(warning.description).toContain('weak areas');
  });

  it('should detect overstudy pattern (10+ attempts in 14 days)', () => {
    const attempts = Array.from({ length: 12 }, (_, i) => ({
      attemptDate: new Date(new Date().getTime() - i * 24 * 60 * 60 * 1000),
      score: 80 + Math.random() * 15,
    }));

    const isOverstudying = trackOverstudyPattern('obj_1', attempts);
    expect(isOverstudying).toBe(true);
  });

  it('should suggest alternative study when mastery detected', () => {
    const masteryOverview: MasteryOverview = {
      userId: 'user_123',
      masteredObjectives: ['obj_1', 'obj_2'],
      masteredDomains: [],
      overStudiedAreas: [],
      weakAreas: ['obj_3'],
      focusAreas: ['obj_3'],
    };

    const domainStatus: DomainRecommendationContext = {
      domainId: 'D1',
      domainName: 'Domain 1',
      baselineStatus: 'WEAK_AREA_FOCUS',
      baselineScore: 80,
      weakAreas: ['obj_3'],
      lastActivityDate: new Date(),
      daysSinceActivity: 1,
      readinessPercentage: 75,
      priority: 'high',
    };

    const suggestion = suggestAlternativeStudy('user_123', masteryOverview, domainStatus);

    expect(suggestion).toBeDefined();
    expect(suggestion?.type).toBe(RecommendationType.WEAK_AREA_FOCUS);
  });

  it('should detect overfocusing on one domain (70%+ of study time)', () => {
    const studyTime = {
      D1: 180, // 180 minutes
      D2: 60,  // 60 minutes
      D3: 10,  // 10 minutes
      // Total: 250 minutes, D1 is 72%
    };

    const isOverfocused = isOverfocusingOnOneDomain(studyTime, 70);
    expect(isOverfocused).toBe(true);
  });

  it('should find the overfocused domain', () => {
    const studyTime = {
      D1: 180,
      D2: 60,
      D3: 10,
    };

    const domain = findOverfocusedDomain(studyTime);
    expect(domain).toBe('D1');
  });

  it('should calculate opportunity cost of retesting', () => {
    const cost = calculateOpportunityCost(95, 65, 30);

    expect(cost.costOfRetesting).toBeLessThan(cost.benefitOfFocusingOnWeakArea);
  });
});

/**
 * ============================================================================
 * Test Suite: Study Time Monitoring
 * ============================================================================
 */

describe('Study Time Monitoring', () => {
  it('should track study session duration', () => {
    const startTime = new Date(new Date().getTime() - 90 * 60 * 1000); // 90 min ago
    const session = trackStudySessionDuration({
      userId: 'user_123',
      startTime,
      endTime: new Date(),
    });

    expect(session.durationMinutes).toBeGreaterThan(85);
    expect(session.durationMinutes).toBeLessThan(95);
  });

  it('should calculate total study time for today', () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const sessions: StudySessionData[] = [
      {
        sessionId: 'sess_1',
        userId: 'user_123',
        startTime: new Date(today.getTime() + 1 * 60 * 60 * 1000), // Today, 1 AM
        endTime: new Date(today.getTime() + 1.5 * 60 * 60 * 1000),
        durationMinutes: 30,
        breaksTaken: 0,
        activitiesCompleted: [],
      },
      {
        sessionId: 'sess_2',
        userId: 'user_123',
        startTime: new Date(today.getTime() + 3 * 60 * 60 * 1000), // Today, 3 AM
        endTime: new Date(today.getTime() + 4 * 60 * 60 * 1000),
        durationMinutes: 60,
        breaksTaken: 0,
        activitiesCompleted: [],
      },
      {
        sessionId: 'sess_3',
        userId: 'user_123',
        startTime: new Date(yesterday.getTime() + 2 * 60 * 60 * 1000), // Yesterday
        endTime: new Date(yesterday.getTime() + 3 * 60 * 60 * 1000),
        durationMinutes: 60,
        breaksTaken: 0,
        activitiesCompleted: [],
      },
    ];

    const total = calculateTodayStudyTime(sessions);
    expect(total).toBe(90); // Only today's sessions (30 + 60)
  });

  it('should suggest break after 3+ hours of study', () => {
    const shouldBreak = shouldSuggestBreak(180, 180); // 3 hours session, 3 hours today
    expect(shouldBreak).toBe(true);
  });

  it('should suggest break if total today is 5+ hours', () => {
    const shouldBreak = shouldSuggestBreak(300, 60); // 5 hours total, 1 hour current
    expect(shouldBreak).toBe(true);
  });

  it('should not suggest break if study time is low', () => {
    const shouldBreak = shouldSuggestBreak(60, 30); // 1 hour today
    expect(shouldBreak).toBe(false);
  });

  it('should generate break suggestion recommendation', () => {
    const rec = generateBreakSuggestion('user_123', 180, 180);

    expect(rec).toBeDefined();
    expect(rec?.type).toBe(RecommendationType.BREAK_SUGGESTION);
    expect(rec?.title).toContain('3 Hours');
  });

  it('should detect study streak correctly', () => {
    const now = new Date();
    const sessions: StudySessionData[] = [];

    // Create sessions for 5 consecutive days
    for (let i = 4; i >= 0; i--) {
      sessions.push({
        sessionId: `sess_${i}`,
        userId: 'user_123',
        startTime: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - i * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        durationMinutes: 60,
        breaksTaken: 0,
        activitiesCompleted: [],
      });
    }

    const streak = detectStudyStreak(sessions);
    expect(streak).toBe(5);
  });

  it('should generate streak milestone recommendation at 7 days', () => {
    const rec = generateStreakMilestoneRecommendation('user_123', 7);

    expect(rec).toBeDefined();
    expect(rec?.title).toContain('7-Day');
  });

  it('should return null for non-milestone streak', () => {
    const rec = generateStreakMilestoneRecommendation('user_123', 5);
    expect(rec).toBeNull();
  });

  it('should calculate remaining study time', () => {
    const remaining = getRemainingStudyTime(60, 90);
    expect(remaining).toBe(30);
  });
});

/**
 * ============================================================================
 * Test Suite: Contextual Handoffs
 * ============================================================================
 */

describe('Contextual Handoffs', () => {
  it('should recommend trap drill after low quiz score (< 50%)', () => {
    const quizResult: QuizResult = {
      objectiveId: 'obj_1',
      score: 40,
      totalQuestions: 20,
      correctAnswers: 8,
      durationSeconds: 600,
      timestamp: new Date(),
    };

    const rec = getNextActionAfterQuiz('user_123', quizResult, 10, 2);

    expect(rec?.type).toBe(RecommendationType.TRAP_DRILL);
    expect(rec?.priority).toBe(RecommendationPriority.IMMEDIATE);
  });

  it('should recommend bank burn after moderate quiz score (50-70%)', () => {
    const quizResult: QuizResult = {
      objectiveId: 'obj_1',
      score: 65,
      totalQuestions: 20,
      correctAnswers: 13,
      durationSeconds: 600,
      timestamp: new Date(),
    };

    const rec = getNextActionAfterQuiz('user_123', quizResult, 10, 2);

    expect(rec?.type).toBe(RecommendationType.BANK_BURN);
    expect(rec?.priority).toBe(RecommendationPriority.STRATEGIC);
  });

  it('should recommend domain pass after excellent quiz score (85%+)', () => {
    const quizResult: QuizResult = {
      objectiveId: 'obj_1',
      score: 90,
      totalQuestions: 20,
      correctAnswers: 18,
      durationSeconds: 600,
      timestamp: new Date(),
    };

    const rec = getNextActionAfterQuiz('user_123', quizResult, 10, 9); // 9 of 10 mastered

    expect(rec?.type).toBe(RecommendationType.DOMAIN_PASS);
  });

  it('should guide action after baseline based on score', () => {
    const recGood = getNextActionAfterBaseline('user_123', 82, 'D1', []);
    expect(recGood.type).toBe(RecommendationType.DOMAIN_PASS);
    expect(recGood.priority).toBe(RecommendationPriority.IMMEDIATE);

    const recWeak = getNextActionAfterBaseline('user_123', 70, 'D1', ['obj_1', 'obj_2']);
    expect(recWeak.type).toBe(RecommendationType.WEAK_AREA_FOCUS);
    expect(recWeak.priority).toBe(RecommendationPriority.STRATEGIC);
  });

  it('should guide action after domain pass success', () => {
    const rec = getNextActionAfterDomainPass('user_123', true, 'D1', 85, 1);

    expect(rec.type).toBe(RecommendationType.DOMAIN_PASS);
    expect(rec.title).toContain('Certified');
  });

  it('should guide action after domain pass failure with retry date', () => {
    const rec = getNextActionAfterDomainPass('user_123', false, 'D1', 75, 1, ['obj_1', 'obj_2']);

    expect(rec.type).toBe(RecommendationType.WEAK_AREA_FOCUS);
    expect(rec.priority).toBe(RecommendationPriority.WARNING);
    expect(rec.dueDate).toBeDefined();
  });

  it('should guide action after mock exam based on score', () => {
    const recHigh = getNextActionAfterMockExam('user_123', 82, 30, ['D2']);
    expect(recHigh.type).toBe(RecommendationType.EXAM_READINESS);

    const recMedium = getNextActionAfterMockExam('user_123', 72, 30, ['D2', 'D3']);
    expect(recMedium.type).toBe(RecommendationType.MOCK_EXAM);

    const recLow = getNextActionAfterMockExam('user_123', 45, 30, ['D1', 'D2', 'D3']);
    expect(recLow.priority).toBe(RecommendationPriority.WARNING);
  });

  it('should suggest activity based on available time', () => {
    const shortRec = suggestActivityByTimeAvailable('user_123', 10);
    expect(shortRec?.type).toBe(RecommendationType.REFRESH_DRILL);

    const mediumRec = suggestActivityByTimeAvailable('user_123', 20);
    expect(mediumRec?.type).toBe(RecommendationType.TRAP_DRILL);

    const longRec = suggestActivityByTimeAvailable('user_123', 60);
    expect(longRec?.type).toBe(RecommendationType.BANK_BURN);
  });
});

/**
 * ============================================================================
 * Test Suite: Recommendation Persistence
 * ============================================================================
 */

describe('Recommendation Persistence', () => {
  let repository: InMemoryRecommendationRepository;
  let service: RecommendationPersistenceService;

  beforeEach(() => {
    repository = new InMemoryRecommendationRepository();
    service = new RecommendationPersistenceService(repository);
  });

  it('should save and retrieve recommendations', async () => {
    const rec: Recommendation = {
      id: 'rec_1',
      userId: 'user_123',
      priority: RecommendationPriority.IMMEDIATE,
      type: RecommendationType.DOMAIN_PASS,
      title: 'Test',
      description: 'Test description',
      action: { type: 'navigate', target: '/home' },
      reasoning: 'test',
      confidence: 90,
      importance: 8,
      dismissible: true,
      createdAt: new Date(),
    };

    await service.saveRecommendation(rec);
    const active = await service.getActiveRecommendations('user_123');

    expect(active.length).toBe(1);
    expect(active[0].id).toBe('rec_1');
  });

  it('should dismiss recommendations', async () => {
    const rec: Recommendation = {
      id: 'rec_1',
      userId: 'user_123',
      priority: RecommendationPriority.IMMEDIATE,
      type: RecommendationType.DOMAIN_PASS,
      title: 'Test',
      description: 'Test',
      action: { type: 'navigate', target: '/home' },
      reasoning: 'test',
      confidence: 90,
      importance: 8,
      dismissible: true,
      createdAt: new Date(),
    };

    await service.saveRecommendation(rec);
    await service.dismissRecommendation('rec_1', 'user_dismissed');

    const active = await service.getActiveRecommendations('user_123');
    expect(active.length).toBe(0);
  });

  it('should track recommendation actions', async () => {
    const rec: Recommendation = {
      id: 'rec_1',
      userId: 'user_123',
      priority: RecommendationPriority.IMMEDIATE,
      type: RecommendationType.DOMAIN_PASS,
      title: 'Test',
      description: 'Test',
      action: { type: 'navigate', target: '/home' },
      reasoning: 'test',
      confidence: 90,
      importance: 8,
      dismissible: true,
      createdAt: new Date(),
    };

    await service.saveRecommendation(rec);
    await service.markAsActioned('rec_1');

    const all = await service.getAllRecommendations('user_123');
    expect(all[0].actedAt).toBeDefined();
  });

  it('should calculate recommendation effectiveness', async () => {
    const rec1: Recommendation = {
      id: 'rec_1',
      userId: 'user_123',
      priority: RecommendationPriority.IMMEDIATE,
      type: RecommendationType.DOMAIN_PASS,
      title: 'Test 1',
      description: 'Test',
      action: { type: 'navigate', target: '/home' },
      reasoning: 'test',
      confidence: 90,
      importance: 8,
      dismissible: true,
      createdAt: new Date(),
      actedAt: new Date(), // User acted
    };

    const rec2: Recommendation = {
      id: 'rec_2',
      userId: 'user_123',
      priority: RecommendationPriority.IMMEDIATE,
      type: RecommendationType.DOMAIN_PASS,
      title: 'Test 2',
      description: 'Test',
      action: { type: 'navigate', target: '/home' },
      reasoning: 'test',
      confidence: 90,
      importance: 8,
      dismissible: true,
      createdAt: new Date(),
    };

    await service.saveRecommendation(rec1);
    await service.saveRecommendation(rec2);

    const effectiveness = await service.calculateEffectiveness('user_123');
    expect(effectiveness.actionRate).toBe(50); // 1 acted, 1 dismissed/ignored
  });

  it('should get recommendations by type', async () => {
    const rec1: Recommendation = {
      id: 'rec_1',
      userId: 'user_123',
      priority: RecommendationPriority.IMMEDIATE,
      type: RecommendationType.DOMAIN_PASS,
      title: 'Test 1',
      description: 'Test',
      action: { type: 'navigate', target: '/home' },
      reasoning: 'test',
      confidence: 90,
      importance: 8,
      dismissible: true,
      createdAt: new Date(),
    };

    const rec2: Recommendation = {
      id: 'rec_2',
      userId: 'user_123',
      priority: RecommendationPriority.IMMEDIATE,
      type: RecommendationType.REFRESH_DRILL,
      title: 'Test 2',
      description: 'Test',
      action: { type: 'navigate', target: '/home' },
      reasoning: 'test',
      confidence: 90,
      importance: 8,
      dismissible: true,
      createdAt: new Date(),
    };

    await service.saveRecommendation(rec1);
    await service.saveRecommendation(rec2);

    const passMeRecs = await service.getRecommendationsByType('user_123', RecommendationType.DOMAIN_PASS);
    expect(passMeRecs.length).toBe(1);
    expect(passMeRecs[0].type).toBe(RecommendationType.DOMAIN_PASS);
  });
});

/**
 * ============================================================================
 * Test Suite: Integration Tests
 * ============================================================================
 */

describe('Integration Tests', () => {
  it('should handle complete user learning journey', () => {
    // Step 1: Fresh start
    let context = createMockLearningContext({
      domainStatuses: {
        D1: {
          domainId: 'D1',
          domainName: 'Domain 1',
          baselineStatus: 'NOT_STARTED',
          baselineScore: null,
          weakAreas: [],
          lastActivityDate: undefined,
          daysSinceActivity: 0,
          readinessPercentage: 0,
          priority: 'high',
        },
      },
    });

    let recs = generateRecommendations('user_123', context);
    let baselineRec = recs.find(r => r.type === RecommendationType.DOMAIN_BASELINE);
    expect(baselineRec).toBeDefined();

    // Step 2: After baseline
    context = createMockLearningContext({
      domainStatuses: {
        D1: {
          domainId: 'D1',
          domainName: 'Domain 1',
          baselineStatus: 'WEAK_AREA_FOCUS',
          baselineScore: 75,
          weakAreas: ['obj_1', 'obj_2'],
          lastActivityDate: new Date(),
          daysSinceActivity: 0,
          readinessPercentage: 60,
          priority: 'high',
        },
      },
    });

    recs = generateRecommendations('user_123', context);
    // Should recommend weak area focus or domain pass if ready
    expect(recs.length).toBeGreaterThan(0);

    // Step 3: After weak area improvement
    context = createMockLearningContext({
      domainStatuses: {
        D1: {
          domainId: 'D1',
          domainName: 'Domain 1',
          baselineStatus: 'READY_FOR_TEST_OUT',
          baselineScore: 80,
          weakAreas: [],
          lastActivityDate: new Date(),
          daysSinceActivity: 1,
          readinessPercentage: 85,
          priority: 'high',
        },
      },
    });

    recs = generateRecommendations('user_123', context);
    const domainPassRec = recs.find(r => r.type === RecommendationType.DOMAIN_PASS);
    expect(domainPassRec).toBeDefined();

    // Step 4: After domain pass success
    context = createMockLearningContext({
      domainStatuses: {
        D1: {
          domainId: 'D1',
          domainName: 'Domain 1',
          baselineStatus: 'TESTED_OUT',
          baselineScore: 85,
          weakAreas: [],
          lastActivityDate: new Date(),
          daysSinceActivity: 1,
          readinessPercentage: 95,
          priority: 'medium',
        },
      },
    });

    recs = generateRecommendations('user_123', context);
    // Should recommend refresh drills
    expect(recs.length).toBeGreaterThan(0);
  });

  it('should handle multiple domains with varying progress', () => {
    const context = createMockLearningContext({
      domainStatuses: {
        D1: {
          domainId: 'D1',
          domainName: 'Domain 1',
          baselineStatus: 'TESTED_OUT',
          baselineScore: 90,
          weakAreas: [],
          lastActivityDate: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000),
          daysSinceActivity: 1,
          readinessPercentage: 95,
          priority: 'low',
        },
        D2: {
          domainId: 'D2',
          domainName: 'Domain 2',
          baselineStatus: 'WEAK_AREA_FOCUS',
          baselineScore: 70,
          weakAreas: ['obj_1'],
          lastActivityDate: new Date(),
          daysSinceActivity: 0,
          readinessPercentage: 70,
          priority: 'high',
        },
        D3: {
          domainId: 'D3',
          domainName: 'Domain 3',
          baselineStatus: 'NOT_STARTED',
          baselineScore: null,
          weakAreas: [],
          lastActivityDate: undefined,
          daysSinceActivity: 21,
          readinessPercentage: 0,
          priority: 'critical',
        },
      },
    });

    const recs = generateRecommendations('user_123', context);

    // Should have recommendations for all domains
    expect(recs.length).toBeGreaterThan(0);

    // Immediate priorities should be first
    const immediateRecs = recs.filter(r => r.priority === RecommendationPriority.IMMEDIATE);
    const warningRecs = recs.filter(r => r.priority === RecommendationPriority.WARNING);

    expect(immediateRecs.length + warningRecs.length).toBeGreaterThan(0);
  });

  it('should rank exam-focused recommendations appropriately when exam is near', () => {
    const context = createMockLearningContext({
      daysTillExam: 14, // Very close
      estimatedReadinessPercentage: 65,
      mockExamDueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week away
      mockExamScore: 60,
      domainStatuses: {
        D1: {
          domainId: 'D1',
          domainName: 'Domain 1',
          baselineStatus: 'TESTED_OUT',
          baselineScore: 85,
          weakAreas: [],
          lastActivityDate: new Date(),
          daysSinceActivity: 0,
          readinessPercentage: 90,
          priority: 'low',
        },
        D2: {
          domainId: 'D2',
          domainName: 'Domain 2',
          baselineStatus: 'WEAK_AREA_FOCUS',
          baselineScore: 70,
          weakAreas: ['obj_1', 'obj_2'],
          lastActivityDate: new Date(),
          daysSinceActivity: 1,
          readinessPercentage: 65,
          priority: 'critical',
        },
      },
    });

    const recs = generateRecommendations('user_123', context);

    // Should prioritize exam readiness and weak areas
    const examOrWarningRecs = recs.filter(
      r => r.type === RecommendationType.EXAM_READINESS || r.priority === RecommendationPriority.WARNING
    );

    expect(examOrWarningRecs.length).toBeGreaterThan(0);
  });
});
