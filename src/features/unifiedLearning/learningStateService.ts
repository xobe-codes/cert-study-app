/**
 * Learning State Service (Phase 0)
 *
 * Core service for managing unified learning state.
 * Provides functions to:
 * - Fetch and update learning state
 * - Calculate mastery levels
 * - Record study activities
 * - Update domain milestones
 * - Manage spaced repetition schedules
 */

import {
  UnifiedLearningState,
  DomainState,
  ObjectiveState,
  MasteryStatus,
  ActivityType,
  PerformanceMetrics,
  StudyActivity,
  createUnifiedLearningState,
  validateMasteryScore,
  validateDate,
} from './unifiedLearningState';

/**
 * Learning State Repository - handles data access
 * In real implementation, this would connect to a database
 */
export interface ILearningStateRepository {
  getLearningState(userId: string): Promise<UnifiedLearningState | null>;
  saveLearningState(state: UnifiedLearningState): Promise<void>;
  getObjectivePerformance(userId: string, objectiveId: string): Promise<PerformanceMetrics | null>;
  saveObjectivePerformance(userId: string, objectiveId: string, metrics: PerformanceMetrics): Promise<void>;
}

/**
 * Mock repository for Phase 0 - can be replaced with real database
 */
export class InMemoryLearningStateRepository implements ILearningStateRepository {
  private store = new Map<string, UnifiedLearningState>();

  async getLearningState(userId: string): Promise<UnifiedLearningState | null> {
    return this.store.get(userId) || null;
  }

  async saveLearningState(state: UnifiedLearningState): Promise<void> {
    this.store.set(state.userId, state);
  }

  async getObjectivePerformance(
    userId: string,
    objectiveId: string
  ): Promise<PerformanceMetrics | null> {
    const state = await this.getLearningState(userId);
    if (!state) return null;

    for (const domain of Object.values(state.domains)) {
      const objective = domain.objectives.find(o => o.id === objectiveId);
      if (objective) {
        return objective.performance;
      }
    }
    return null;
  }

  async saveObjectivePerformance(
    userId: string,
    objectiveId: string,
    metrics: PerformanceMetrics
  ): Promise<void> {
    const state = await this.getLearningState(userId);
    if (!state) return;

    for (const domain of Object.values(state.domains)) {
      const objective = domain.objectives.find(o => o.id === objectiveId);
      if (objective) {
        objective.performance = metrics;
        objective.updatedAt = new Date();
        state.updatedAt = new Date();
        await this.saveLearningState(state);
        return;
      }
    }
  }
}

/**
 * Learning State Service
 *
 * Main service for learning state operations
 */
export class LearningStateService {
  constructor(private repository: ILearningStateRepository) {}

  /**
   * Get current learning state for a user
   * Creates blank state if user is new
   */
  async getLearningState(userId: string): Promise<UnifiedLearningState> {
    let state = await this.repository.getLearningState(userId);
    if (!state) {
      state = createUnifiedLearningState(userId);
      await this.repository.saveLearningState(state);
    }
    return state;
  }

  /**
   * Calculate mastery level based on performance history
   *
   * Algorithm:
   * - MASTERED: bestScore >= 95% AND (baseline passed OR domain pass passed)
   * - PROFICIENT: (bestScore >= 85% AND baseline passed) OR (avg >= 85%)
   * - COMPETENT: avg >= 70% OR baseline passed
   * - LEARNING: attemptCount > 0 AND avg < 70%
   * - NOT_STARTED: no attempts
   */
  calculateMasteryLevel(performance: PerformanceMetrics): MasteryStatus {
    if (performance.attemptCount === 0) {
      return MasteryStatus.NOT_STARTED;
    }

    if (performance.bestScore >= 95 && performance.successRate >= 80) {
      return MasteryStatus.MASTERED;
    }

    if (performance.bestScore >= 85 && performance.successRate >= 70) {
      return MasteryStatus.PROFICIENT;
    }

    if (performance.averageScore >= 70) {
      return MasteryStatus.COMPETENT;
    }

    if (performance.averageScore >= 50) {
      return MasteryStatus.LEARNING;
    }

    return MasteryStatus.LEARNING;
  }

  /**
   * Update objective performance with a new quiz attempt
   *
   * Updates:
   * - Latest score and date
   * - Best score (all-time)
   * - Attempt count
   * - Average score
   * - Success rate (% of passing attempts >= 70%)
   * - Mastery status
   */
  async updateObjectivePerformance(
    userId: string,
    objectiveId: string,
    quizScore: number,
    attemptDate: Date = new Date()
  ): Promise<PerformanceMetrics> {
    if (!validateMasteryScore(quizScore)) {
      throw new Error(`Invalid quiz score: ${quizScore}. Must be 0-100.`);
    }

    if (!validateDate(attemptDate)) {
      throw new Error(`Invalid attempt date: ${attemptDate}`);
    }

    const state = await this.getLearningState(userId);
    let objective: ObjectiveState | undefined;

    // Find objective across domains
    for (const domain of Object.values(state.domains)) {
      objective = domain.objectives.find(o => o.id === objectiveId);
      if (objective) break;
    }

    if (!objective) {
      throw new Error(`Objective not found: ${objectiveId}`);
    }

    // Update performance metrics
    const updated = objective.performance;
    updated.attemptCount += 1;
    updated.lastAttemptScore = quizScore;
    updated.lastAttemptDate = attemptDate;
    updated.bestScore = Math.max(updated.bestScore, quizScore);

    // Recalculate average
    const newSum = (updated.averageScore * (updated.attemptCount - 1)) + quizScore;
    updated.averageScore = Math.round(newSum / updated.attemptCount);

    // Recalculate success rate (% of attempts >= 70%)
    const successCount = updated.successRate > 0
      ? Math.round(((updated.attemptCount - 1) * updated.successRate / 100)) + (quizScore >= 70 ? 1 : 0)
      : (quizScore >= 70 ? 1 : 0);
    updated.successRate = Math.round((successCount / updated.attemptCount) * 100);

    // Update mastery status
    objective.status = this.calculateMasteryLevel(updated);

    // Record activity
    objective.activities.push({
      type: ActivityType.QUIZ_ATTEMPT,
      date: attemptDate,
      score: quizScore,
    });

    objective.updatedAt = new Date();
    state.updatedAt = new Date();

    await this.repository.saveLearningState(state);
    return updated;
  }

  /**
   * Record a bank burn drill activity
   */
  async recordBankBurnActivity(
    userId: string,
    objectiveId: string,
    questionsAttempted: number,
    questionsCorrect: number,
    durationMinutes: number
  ): Promise<void> {
    const state = await this.getLearningState(userId);
    let objective: ObjectiveState | undefined;

    for (const domain of Object.values(state.domains)) {
      objective = domain.objectives.find(o => o.id === objectiveId);
      if (objective) break;
    }

    if (!objective) {
      throw new Error(`Objective not found: ${objectiveId}`);
    }

    const score = Math.round((questionsCorrect / questionsAttempted) * 100);

    objective.activities.push({
      type: ActivityType.BANK_BURN,
      date: new Date(),
      score,
      questionsAttempted,
      questionsCorrect,
      duration: durationMinutes,
    });

    objective.updatedAt = new Date();
    state.updatedAt = new Date();

    await this.repository.saveLearningState(state);
  }

  /**
   * Record a lesson completion
   */
  async recordLessonCompletion(
    userId: string,
    objectiveId: string,
    durationMinutes: number
  ): Promise<void> {
    const state = await this.getLearningState(userId);
    let objective: ObjectiveState | undefined;

    for (const domain of Object.values(state.domains)) {
      objective = domain.objectives.find(o => o.id === objectiveId);
      if (objective) break;
    }

    if (!objective) {
      throw new Error(`Objective not found: ${objectiveId}`);
    }

    objective.activities.push({
      type: ActivityType.LESSON_COMPLETED,
      date: new Date(),
      duration: durationMinutes,
    });

    objective.updatedAt = new Date();
    state.updatedAt = new Date();

    await this.repository.saveLearningState(state);
  }

  /**
   * Mark a domain as mastered and update refresh schedule
   *
   * When a user passes the domain pass test or tests out via baseline,
   * we mark the domain as MASTERED and initiate spaced repetition.
   */
  async markDomainMastered(
    userId: string,
    domainId: string,
    certificationDate: Date = new Date()
  ): Promise<DomainState> {
    if (!validateDate(certificationDate)) {
      throw new Error(`Invalid certification date: ${certificationDate}`);
    }

    const state = await this.getLearningState(userId);
    const domain = state.domains[domainId];

    if (!domain) {
      throw new Error(`Domain not found: ${domainId}`);
    }

    // Mark domain and all objectives as MASTERED
    domain.status = MasteryStatus.MASTERED;
    domain.refreshSchedule.dueDate = this.getNextRefreshDate(certificationDate, 7);
    domain.refreshSchedule.lastRefresh = certificationDate;

    for (const objective of domain.objectives) {
      objective.status = MasteryStatus.MASTERED;
      objective.milestone.masteredDate = certificationDate;
      objective.milestone.certificationDate = certificationDate;
      objective.spacedRep.dueDate = this.getNextRefreshDate(certificationDate, 7);
      objective.spacedRep.lastRefreshDate = certificationDate;
      objective.updatedAt = new Date();
    }

    // Add to mastered domains list if not already there
    if (!state.learningState.masteredDomains.includes(domainId)) {
      state.learningState.masteredDomains.push(domainId);
    }

    // Add to certified domains list
    if (!state.learningState.certifiedDomains.includes(domainId)) {
      state.learningState.certifiedDomains.push(domainId);
    }

    domain.updatedAt = new Date();
    state.updatedAt = new Date();

    await this.repository.saveLearningState(state);
    return domain;
  }

  /**
   * Calculate next refresh date based on mastery date
   *
   * Spaced repetition schedule:
   * - Day 7: First refresh (confirm fresh)
   * - Day 30: Second refresh (long-term memory)
   * - Day 60: Third refresh (maintenance)
   * - After 90 days: Mark as STALE (recommend re-baseline)
   */
  getNextRefreshDate(masteredDate: Date, daysSinceLastRefresh: number = 0): Date {
    const now = new Date();
    const daysSinceMastery = Math.floor(
      (now.getTime() - masteredDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Determine which refresh phase we're in
    if (daysSinceMastery < 7) {
      // First refresh - 7 days after mastery
      return this.addDays(masteredDate, 7);
    } else if (daysSinceMastery < 30) {
      // Second refresh - 30 days after mastery
      return this.addDays(masteredDate, 30);
    } else if (daysSinceMastery < 60) {
      // Third refresh - 60 days after mastery
      return this.addDays(masteredDate, 60);
    } else {
      // Maintenance refreshes every 30 days after day 60
      const daysSinceLastRefreshDate = new Date();
      return this.addDays(daysSinceLastRefreshDate, 30);
    }
  }

  /**
   * Update spaced repetition schedule - mark a refresh as completed
   */
  async completeSpacedRepRefresh(
    userId: string,
    objectiveId: string
  ): Promise<void> {
    const state = await this.getLearningState(userId);
    let objective: ObjectiveState | undefined;

    for (const domain of Object.values(state.domains)) {
      objective = domain.objectives.find(o => o.id === objectiveId);
      if (objective) break;
    }

    if (!objective) {
      throw new Error(`Objective not found: ${objectiveId}`);
    }

    const today = new Date();
    objective.spacedRep.lastRefreshDate = today;
    objective.spacedRep.refreshCount += 1;
    objective.spacedRep.dueDate = this.getNextRefreshDate(today);

    // Record refresh activity
    objective.activities.push({
      type: ActivityType.REFRESH_DRILL,
      date: today,
    });

    objective.updatedAt = new Date();
    state.updatedAt = new Date();

    await this.repository.saveLearningState(state);
  }

  /**
   * Check if a domain needs refreshing (spaced rep due)
   */
  async isRefreshDue(userId: string, domainId: string): Promise<boolean> {
    const state = await this.getLearningState(userId);
    const domain = state.domains[domainId];

    if (!domain || domain.status !== MasteryStatus.MASTERED) {
      return false;
    }

    if (!domain.refreshSchedule.dueDate) {
      return false;
    }

    return new Date() >= domain.refreshSchedule.dueDate;
  }

  /**
   * Get all domains needing refresh
   */
  async getDomainsNeedingRefresh(userId: string): Promise<DomainState[]> {
    const state = await this.getLearningState(userId);
    const needsRefresh: DomainState[] = [];

    for (const domain of Object.values(state.domains)) {
      if (await this.isRefreshDue(userId, domain.id)) {
        needsRefresh.push(domain);
      }
    }

    return needsRefresh;
  }

  /**
   * Check if knowledge has become stale (90+ days since mastery without refresh)
   */
  checkIfStale(masteredDate: Date | null, lastRefreshDate: Date | null): boolean {
    if (!masteredDate) return false;

    const refreshDate = lastRefreshDate || masteredDate;
    const daysSinceRefresh = Math.floor(
      (new Date().getTime() - refreshDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceRefresh >= 90;
  }

  /**
   * Update stale objectives to STALE status
   */
  async updateStaleStatus(userId: string): Promise<void> {
    const state = await this.getLearningState(userId);

    for (const domain of Object.values(state.domains)) {
      for (const objective of domain.objectives) {
        if (objective.milestone.masteredDate) {
          const isStale = this.checkIfStale(
            objective.milestone.masteredDate,
            objective.spacedRep.lastRefreshDate
          );
          if (isStale && objective.status !== MasteryStatus.STALE) {
            objective.status = MasteryStatus.STALE;
            objective.updatedAt = new Date();
          }
        }
      }
    }

    state.updatedAt = new Date();
    await this.repository.saveLearningState(state);
  }

  /**
   * Get learning summary for a domain
   */
  async getDomainSummary(userId: string, domainId: string): Promise<DomainState | null> {
    const state = await this.getLearningState(userId);
    return state.domains[domainId] || null;
  }

  /**
   * Recalculate exam readiness score (0-100)
   *
   * Formula:
   * - Each mastered domain: +15 points (6 domains max = 90)
   * - Each certified domain: +3 bonus
   * - Mock exam 70%+: +10 points
   * - Total: 0-100 with diminishing returns
   */
  async calculateExamReadinessScore(userId: string): Promise<number> {
    const state = await this.getLearningState(userId);

    let score = 0;

    // Mastered domains (15 points each)
    score += Math.min(state.learningState.masteredDomains.length * 15, 90);

    // Certified domains bonus (3 points each)
    score += Math.min(state.learningState.certifiedDomains.length * 3, 18);

    // Mock exam performance (10 points if 70%+)
    if (state.mockExamHistory.length > 0) {
      const lastMockExam = state.mockExamHistory[state.mockExamHistory.length - 1];
      if (lastMockExam.percentage >= 70) {
        score += 10;
      }
    }

    return Math.min(Math.round(score), 100);
  }

  /**
   * Utility: add days to a date
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

/**
 * Export singleton instance (can be replaced with dependency injection)
 */
export const learningStateService = new LearningStateService(
  new InMemoryLearningStateRepository()
);
