/**
 * Recommendation Types & Interfaces (Phase 6)
 *
 * Defines the data structures and enums for the adaptive recommendations engine.
 * Supports different recommendation types, priorities, and tracking metrics.
 */

/**
 * Recommendation priority levels
 * Determines how urgently the user should act on this
 */
export enum RecommendationPriority {
  IMMEDIATE = 'immediate',      // Time-sensitive, act today
  STRATEGIC = 'strategic',      // Important for progress, act this week
  MAINTENANCE = 'maintenance',  // Helpful but not urgent, optional
  WARNING = 'warning',          // Risk if not addressed soon
}

/**
 * Recommendation types - what kind of action is recommended
 */
export enum RecommendationType {
  DOMAIN_BASELINE = 'domain_baseline',       // Start domain baseline
  DOMAIN_PASS = 'domain_pass',               // Ready for domain pass
  MOCK_EXAM = 'mock_exam',                   // Prepare for/take mock exam
  TRAP_DRILL = 'trap_drill',                 // Focus on trap question patterns
  BANK_BURN = 'bank_burn',                   // Comprehensive question drilling
  REFRESH_DRILL = 'refresh_drill',           // Spaced repetition refresh
  WEAK_AREA_FOCUS = 'weak_area_focus',       // Retake specific weak areas
  BREAK_SUGGESTION = 'break_suggestion',     // Take a study break
  MASTERY_DETECTED = 'mastery_detected',     // Move on from mastered topic
  EXAM_READINESS = 'exam_readiness',         // Overall readiness assessment
  NEXT_DOMAIN = 'next_domain',               // Start next domain
}

/**
 * Main Recommendation interface
 * Represents a single actionable recommendation for a user
 */
export interface Recommendation {
  id: string;                              // Unique recommendation ID
  userId: string;                          // User this recommendation is for
  priority: RecommendationPriority;        // How urgent
  type: RecommendationType;                // What kind of action
  title: string;                           // Short title (e.g., "D1 Refresh Available Now")
  description: string;                     // Detailed explanation
  action: RecommendationAction;            // What to do next
  reasoning: string;                       // Why we're recommending this
  confidence: number;                      // 0-100, how confident we are
  dueDate?: Date;                          // When this should be done
  importance: number;                      // 1-10 scale of importance
  dismissible: boolean;                    // Can user dismiss this?
  metadata?: Record<string, any>;          // Additional context
  createdAt: Date;                         // When recommendation was generated
  dismissedAt?: Date;                      // When/if user dismissed it
  actedAt?: Date;                          // When/if user acted on it
}

/**
 * Action to take when user clicks recommendation
 * Directs to a specific feature or activity
 */
export interface RecommendationAction {
  type: 'navigate' | 'start_activity' | 'show_modal' | 'open_settings';
  target: string;                          // Route, activity ID, etc.
  params?: Record<string, any>;            // Extra parameters
}

/**
 * Recommendation metrics for tracking effectiveness
 * Used for A/B testing and understanding which recommendations drive action
 */
export interface RecommendationMetrics {
  recommendationId: string;
  userId: string;
  showCount: number;                       // How many times was this shown?
  dismissCount: number;                    // How many times was this dismissed?
  actionCount: number;                     // How many times did user act on it?
  avgTimeToAction?: number;                // Average time (seconds) before acting
  actionRate: number;                      // Percentage of shows → actions
  lastShownAt?: Date;
  lastActedAt?: Date;
}

/**
 * Study time tracking for break suggestions
 */
export interface StudySessionData {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  durationMinutes: number;
  breaksTaken: number;
  activitiesCompleted: string[];           // Activity IDs done during session
}

/**
 * User learning context for generating recommendations
 * Aggregated data about user's current state
 */
export interface LearningContext {
  userId: string;
  totalStudyMinutesToday: number;
  domainStatuses: Record<string, DomainRecommendationContext>;
  mockExamScore?: number;
  mockExamDueDate?: Date;
  estimatedReadinessPercentage: number;    // 0-100
  daysTillExam?: number;
  currentStreak: number;                   // Days studied in a row
  lastStudyDate: Date;
  knowledgeDecayRisk: boolean;              // Any domains with knowledge decay?
}

/**
 * Context about a specific domain for recommendations
 */
export interface DomainRecommendationContext {
  domainId: string;
  domainName: string;
  baselineStatus: string;                  // NOT_STARTED, PENDING, READY, TESTED_OUT, STALE
  baselineScore?: number;
  weakAreas: string[];                     // Objective IDs that are weak
  lastActivityDate?: Date;
  daysSinceActivity: number;
  readinessPercentage: number;             // 0-100
  priority: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Quiz score result for contextual handoffs
 */
export interface QuizResult {
  objectiveId: string;
  score: number;                           // 0-100
  totalQuestions: number;
  correctAnswers: number;
  durationSeconds: number;
  timestamp: Date;
  previousBestScore?: number;
}

/**
 * Exam readiness estimate
 */
export interface ExamReadinessEstimate {
  estimatedScore: number;                  // 0-100
  confidence: number;                      // 0-100, how confident in estimate
  weeksNeeded: number;                     // Weeks to reach 80%+ readiness
  weakDomains: string[];                   // Domains to focus on
  strengths: string[];                     // Strong domains
  recommendedDailyMinutes: number;         // Suggested daily study time
}

/**
 * User mastery overview for waste prevention
 */
export interface MasteryOverview {
  userId: string;
  masteredObjectives: string[];            // Objectives at 95%+ mastery
  masteredDomains: string[];                // Domains fully certified
  overStudiedAreas: string[];               // Areas user re-studies despite mastery
  weakAreas: string[];                     // Objectives below 70%
  focusAreas: string[];                    // Recommended areas to study
}

/**
 * Recommendation generation options
 */
export interface RecommendationGenerationOptions {
  includeMaintenanceRecommendations?: boolean;  // Include optional/maintenance items
  maxRecommendations?: number;                  // Max immediate recommendations to return
  filterByPriority?: RecommendationPriority;
  includeMetadata?: boolean;
}

/**
 * Response from recommendation engine
 */
export interface GeneratedRecommendations {
  recommendations: Recommendation[];
  context: LearningContext;
  generatedAt: Date;
  nextGenerationTime?: Date;               // Recommended time for next check
}
