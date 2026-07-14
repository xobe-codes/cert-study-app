/**
 * Unified Learning State Schema (Phase 0: Foundation)
 *
 * This file defines the complete data model for the unified adaptive learning system.
 * It represents the single source of truth for all learning progress, activity history,
 * and learning recommendations across all domains and features.
 */

/**
 * Mastery Status Lifecycle
 *
 * NOT_STARTED → LEARNING → COMPETENT → PROFICIENT → MASTERED → REFRESHING → STALE
 *
 * Defines the progression of mastery for any objective, domain, or concept.
 */
export enum MasteryStatus {
  NOT_STARTED = 'NOT_STARTED',      // 0% - no activity
  LEARNING = 'LEARNING',             // 1-70% - active learning phase
  COMPETENT = 'COMPETENT',           // 70-85% - good understanding
  PROFICIENT = 'PROFICIENT',         // 85-95% - strong mastery
  MASTERED = 'MASTERED',             // 95%+ - tested/certified
  REFRESHING = 'REFRESHING',         // maintaining mastery via spaced rep
  STALE = 'STALE',                   // 90+ days since mastery (decay risk)
}

/**
 * Priority levels for recommendations
 */
export enum RecommendationPriority {
  IMMEDIATE = 'immediate',      // Do this now (critical path)
  STRATEGIC = 'strategic',      // Do this soon (optimization)
  MAINTENANCE = 'maintenance',  // Background activity (optional)
  WARNING = 'warning',          // Fix this (at-risk item)
}

/**
 * Recommendation types - what action to take
 */
export enum RecommendationType {
  DOMAIN_BASELINE = 'domain_baseline',
  DOMAIN_PASS = 'domain_pass',
  MOCK_EXAM = 'mock_exam',
  TRAP_DRILL = 'trap_drill',
  BANK_BURN = 'bank_burn',
  REFRESH_DRILL = 'refresh_drill',
  RETAKE_QUIZ = 'retake_quiz',
  WEAK_AREA_FOCUS = 'weak_area_focus',
  FULL_MOCK_EXAM = 'full_mock_exam',
  MOVE_TO_NEXT_DOMAIN = 'move_to_next_domain',
  TAKE_BREAK = 'take_break',
}

/**
 * Study Activity Type - tracks all learning interactions
 */
export enum ActivityType {
  LESSON_COMPLETED = 'lesson_completed',
  QUIZ_ATTEMPT = 'quiz_attempt',
  BANK_BURN = 'bank_burn',
  TRAP_DRILL = 'trap_drill',
  DOMAIN_BASELINE = 'domain_baseline',
  DOMAIN_PASS = 'domain_pass',
  MOCK_EXAM = 'mock_exam',
  LAB_COMPLETED = 'lab_completed',
  TEST_OUT_CLAIMED = 'test_out_claimed',
  REFRESH_DRILL = 'refresh_drill',
}

/**
 * Performance metrics for an objective
 */
export interface PerformanceMetrics {
  lastAttemptScore: number | null;  // Most recent score (0-100)
  lastAttemptDate: Date | null;     // When last attempted
  bestScore: number;                 // Highest score ever
  attemptCount: number;              // Total attempts
  averageScore: number;              // Mean of all attempts
  successRate: number;               // Percentage of passing attempts
}

/**
 * Study activity record - tracks individual learning interactions
 */
export interface StudyActivity {
  type: ActivityType;
  date: Date;
  score?: number;                    // 0-100 if applicable
  duration?: number;                 // minutes spent
  questionsAttempted?: number;
  questionsCorrect?: number;
  metadata?: Record<string, any>;    // Extra context
}

/**
 * Mastery milestone - tracks when objectives/domains reach major milestones
 */
export interface MasteryMilestone {
  masteredDate: Date | null;         // When status reached MASTERED
  testedOutDate: Date | null;        // When test-out occurred (if applicable)
  certificationDate: Date | null;    // When official certificate issued
  certificationLevel?: string;       // e.g., "objective", "domain", "mock_exam_passed"
}

/**
 * Spaced repetition schedule for maintaining mastery
 */
export interface SpacedRepetitionSchedule {
  dueDate: Date | null;              // Next scheduled refresh date
  lastRefreshDate: Date | null;      // When last refreshed
  refreshCount: number;              // Number of times refreshed
  schedule?: 'day7' | 'day30' | 'day60';  // Current phase
}

/**
 * Individual objective state - the atomic unit of learning progress
 */
export interface ObjectiveState {
  id: string;                        // e.g., "1.1", "2.3", "3.5a"
  name: string;                      // Human-readable objective name
  domainId: string;                  // Parent domain (D1-D6)

  // Current status
  status: MasteryStatus;

  // Performance history
  performance: PerformanceMetrics;

  // Activity log - chronological record of all interactions
  activities: StudyActivity[];

  // Mastery tracking
  milestone: MasteryMilestone;

  // Spaced repetition
  spacedRep: SpacedRepetitionSchedule;

  // Weak areas identified from quizzes/exams
  weakTopics: string[];              // e.g., ["1.1-subnetting", "1.1-CIDR-notation"]
  weakCount: number;                 // Number of distinct weak areas

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Domain mastery milestone records (baseline, domain pass, labs)
 */
export interface DomainMilestone {
  id: string;
  domainId: string;
  type: 'baseline' | 'domain_pass' | 'lab' | 'mock_exam_partial';

  attemptNumber?: number;            // For domain pass attempts
  score: number;                     // 0-100
  totalQuestions?: number;
  questionsCorrect?: number;
  attemptDate: Date;

  passed: boolean;                   // Did they pass this attempt?
  passThreshold?: number;            // Minimum score needed

  weakAreas?: string[];              // Topics that were weak
  timeSpentMinutes?: number;
}

/**
 * Domain-level state - aggregation of its objectives
 */
export interface DomainState {
  id: string;                        // D1-D6
  name: string;                      // e.g., "Network Fundamentals"

  // Aggregated status
  status: MasteryStatus;
  overallScore: number;              // Aggregate of all objectives

  // Sub-objectives (1.1-1.11, etc.)
  objectives: ObjectiveState[];

  // Baseline attempt
  baseline: {
    score: number | null;
    attemptDate: Date | null;
    passed: boolean;
    testedOut: boolean;
    testedOutDate: Date | null;
  };

  // Domain pass attempts
  domainPass: DomainMilestone[];

  // Lab progress
  labs: {
    total: number;
    completed: number;
    notStarted: number;
    inProgress: number;
  };

  // Refresh schedule
  refreshSchedule: {
    dueDate: Date | null;
    lastRefresh: Date | null;
    nextRefreshDate: Date | null;
    refreshCount: number;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Recommendation for the learner
 */
export interface Recommendation {
  id: string;
  priority: RecommendationPriority;
  type: RecommendationType;

  // Display
  title: string;
  description: string;

  // Action
  action: {
    target: string;                  // What feature/domain to navigate to
    params?: Record<string, any>;
  };

  // Context
  reasoning: string;                 // Why this recommendation? e.g., "score_trajectory"
  confidence: number;                // 0-1 confidence in recommendation
  estimatedTimeMinutes?: number;

  // Lifecycle
  dueDate?: Date;
  importance: number;                // 1-10 scale
  dismissed: boolean;
  dismissedAt?: Date;
  dismissedReason?: string;

  autoGenerated: boolean;
  createdAt: Date;
}

/**
 * Mock exam record with domain breakdown
 */
export interface MockExamResult {
  id: string;
  attemptDate: Date;

  // Score
  score: number;                     // 0-100
  totalQuestions: number;
  questionsCorrect: number;
  percentage: number;                // score / totalQuestions

  // Details
  type: 'full' | 'partial' | 'adaptive_retake';
  timeSpentMinutes?: number;

  // Per-domain breakdown
  domainScores: Record<string, number>;  // { D1: 95, D2: 92, D3: 88, ... }

  // Analysis
  weakAreas: string[];               // Domains/topics that need work
  adaptiveRetakeAvailable: boolean;
  nextRecommendedRetakeDate?: Date;

  // Metadata
  sessionId?: string;
}

/**
 * Analytics/engagement metrics
 */
export interface AnalyticsMetrics {
  totalStudyMinutes: number;
  sessionsCompleted: number;
  averageSessionLengthMinutes: number;

  // Engagement streaks
  longestStreakDays: number;         // Consecutive study days
  currentStreakDays: number;
  lastStudyDate: Date | null;

  // Learning progress
  topicsStudied: number;
  conceptsMastered: number;
  averageMasteryTime: number;        // days from start to mastery

  // Efficiency
  studyEfficiencyScore: number;      // 0-100 based on learning rate
  timeToMastery: Record<string, number>;  // Per-domain: average days
}

/**
 * Global learning state - the unified root state for a user
 */
export interface UnifiedLearningState {
  userId: string;

  // When was this state last updated?
  lastUpdated: Date;

  // === OVERALL PROGRESS ===

  learningState: {
    examReadinessScore: number;      // 0-100
    examReadinessConfidence: number; // 0-1
    masteredDomains: string[];       // ["D1", "D2", "D3"]
    certifiedDomains: string[];      // ["D1", "D2", "D3"] (passed domain pass)
    estimatedExamReadyDate: Date | null;
    isExamReady: boolean;
    daysUntilExamReady: number | null;
  };

  // === PER-DOMAIN STATE (D1-D6) ===

  domains: Record<string, DomainState>;  // Key: "D1", "D2", etc.

  // === RECOMMENDATIONS ===

  recommendations: Recommendation[];

  // === STUDY ANALYTICS ===

  analytics: AnalyticsMetrics;

  // === SPACED REPETITION QUEUE ===

  spacedRepetitionQueue: Array<{
    domainId: string;
    objectiveId?: string;
    dueDate: Date;
    type: 'objective_refresh' | 'domain_refresh' | 'baseline_refresh';
    daysSinceMastery: number;
    priority: number;
  }>;

  // === MOCK EXAM HISTORY ===

  mockExamHistory: MockExamResult[];

  // === METADATA ===

  createdAt: Date;
  updatedAt: Date;
  version: string;                   // Schema version for migrations
}

/**
 * Learner profile summary - snapshot of current state
 */
export interface LearnerProfileSummary {
  userId: string;
  examReadinessScore: number;
  masteredDomains: number;
  allDomainsProgress: Array<{
    domainId: string;
    name: string;
    status: MasteryStatus;
    score: number;
    progressPercent: number;
  }>;
  recommendations: Recommendation[];
  nextSteps: string[];
  lastActivityDate: Date | null;
  currentStreak: number;
}

/**
 * Validation helper - ensures mastery score is valid
 */
export function validateMasteryScore(score: number): boolean {
  return score >= 0 && score <= 100 && Number.isFinite(score);
}

/**
 * Validation helper - checks if mastery status is valid
 */
export function isValidMasteryStatus(status: string): status is MasteryStatus {
  return Object.values(MasteryStatus).includes(status as MasteryStatus);
}

/**
 * Validation helper - ensures date is valid
 */
export function validateDate(date: Date | null | undefined): boolean {
  if (!date) return true;  // null/undefined is acceptable
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Factory function - create blank objective state
 */
export function createObjectiveState(
  id: string,
  name: string,
  domainId: string
): ObjectiveState {
  return {
    id,
    name,
    domainId,
    status: MasteryStatus.NOT_STARTED,
    performance: {
      lastAttemptScore: null,
      lastAttemptDate: null,
      bestScore: 0,
      attemptCount: 0,
      averageScore: 0,
      successRate: 0,
    },
    activities: [],
    milestone: {
      masteredDate: null,
      testedOutDate: null,
      certificationDate: null,
    },
    spacedRep: {
      dueDate: null,
      lastRefreshDate: null,
      refreshCount: 0,
    },
    weakTopics: [],
    weakCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Factory function - create blank domain state
 */
export function createDomainState(
  id: string,
  name: string,
  objectives: ObjectiveState[] = []
): DomainState {
  return {
    id,
    name,
    status: MasteryStatus.NOT_STARTED,
    overallScore: 0,
    objectives,
    baseline: {
      score: null,
      attemptDate: null,
      passed: false,
      testedOut: false,
      testedOutDate: null,
    },
    domainPass: [],
    labs: {
      total: 0,
      completed: 0,
      notStarted: 0,
      inProgress: 0,
    },
    refreshSchedule: {
      dueDate: null,
      lastRefresh: null,
      nextRefreshDate: null,
      refreshCount: 0,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Factory function - create blank learning state for new user
 */
export function createUnifiedLearningState(userId: string): UnifiedLearningState {
  return {
    userId,
    lastUpdated: new Date(),
    learningState: {
      examReadinessScore: 0,
      examReadinessConfidence: 0,
      masteredDomains: [],
      certifiedDomains: [],
      estimatedExamReadyDate: null,
      isExamReady: false,
      daysUntilExamReady: null,
    },
    domains: {
      D1: createDomainState('D1', 'Network Fundamentals'),
      D2: createDomainState('D2', 'Network Access'),
      D3: createDomainState('D3', 'IP Connectivity'),
      D4: createDomainState('D4', 'IP Services'),
      D5: createDomainState('D5', 'Security Fundamentals'),
      D6: createDomainState('D6', 'Automation and Programmability'),
    },
    recommendations: [],
    analytics: {
      totalStudyMinutes: 0,
      sessionsCompleted: 0,
      averageSessionLengthMinutes: 0,
      longestStreakDays: 0,
      currentStreakDays: 0,
      lastStudyDate: null,
      topicsStudied: 0,
      conceptsMastered: 0,
      averageMasteryTime: 0,
      studyEfficiencyScore: 0,
      timeToMastery: {},
    },
    spacedRepetitionQueue: [],
    mockExamHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0.0',
  };
}
