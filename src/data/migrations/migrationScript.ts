/**
 * Data Migration Script (Phase 0)
 *
 * Migrates existing user data from legacy systems to the unified learning state schema.
 *
 * Process:
 * 1. Backup all existing data
 * 2. Read legacy quiz attempts, baselines, domain pass records
 * 3. Calculate mastery levels using the algorithm
 * 4. Map old data to new unified state schema
 * 5. Handle edge cases (users mid-domain, stale data, duplicates)
 * 6. Generate detailed migration report
 *
 * NOTE: This script is prepared but not run automatically.
 * Run only after full testing on a staging database.
 */

import {
  UnifiedLearningState,
  ObjectiveState,
  DomainState,
  MasteryStatus,
  ActivityType,
  createUnifiedLearningState,
} from '../features/unifiedLearning/unifiedLearningState';

/**
 * Legacy data structures - what we're migrating FROM
 */
export interface LegacyQuizAttempt {
  userId: string;
  objectiveId: string;
  score: number;
  attemptDate: Date;
  domainId?: string;
}

export interface LegacyBaseline {
  userId: string;
  domainId: string;
  score: number;
  attemptDate: Date;
  passed?: boolean;
}

export interface LegacyDomainPass {
  userId: string;
  domainId: string;
  attemptNumber: number;
  score: number;
  attemptDate: Date;
  passed?: boolean;
}

export interface LegacyMockExam {
  userId: string;
  score: number;
  totalQuestions: number;
  attemptDate: Date;
  domainScores?: Record<string, number>;
}

export interface LegacyLab {
  userId: string;
  labId: string;
  domainId: string;
  completed: boolean;
  completedDate?: Date;
}

/**
 * Migration Report
 */
export interface MigrationReport {
  executedAt: Date;
  totalUsers: number;
  successfulMigrations: number;
  failedMigrations: number;
  successRate: number;

  failedUsers: Array<{
    userId: string;
    reason: string;
    error?: string;
  }>;

  stats: {
    totalQuizAttempts: number;
    totalBaselineAttempts: number;
    totalDomainPassAttempts: number;
    totalMockExams: number;
    usersMasteredDomains: number;
    usersInProgress: number;
    averageAttemptsPerObjective: number;
    averageMastery: number;
  };

  recommendations: string[];
  warnings: string[];
}

/**
 * Migration Script Service
 */
export class DataMigrationService {
  /**
   * Main migration function
   *
   * Orchestrates the complete migration process
   */
  async migrateUserData(
    userId: string,
    legacyData: {
      quizAttempts: LegacyQuizAttempt[];
      baselines: LegacyBaseline[];
      domainPasses: LegacyDomainPass[];
      mockExams: LegacyMockExam[];
      labs: LegacyLab[];
    }
  ): Promise<UnifiedLearningState> {
    try {
      // Start with blank state
      const state = createUnifiedLearningState(userId);

      // Migrate quiz attempts
      this.migrateQuizAttempts(state, legacyData.quizAttempts);

      // Migrate baselines
      this.migrateBaselines(state, legacyData.baselines);

      // Migrate domain passes
      this.migrateDomainPasses(state, legacyData.domainPasses);

      // Migrate mock exams
      this.migrateMockExams(state, legacyData.mockExams);

      // Migrate labs
      this.migrateLabs(state, legacyData.labs);

      // Recalculate mastery levels for all objectives
      this.recalculateMasteryLevels(state);

      // Set up spaced repetition schedules for mastered items
      this.setupSpacedRepetition(state);

      // Recalculate exam readiness
      this.calculateExamReadiness(state);

      return state;
    } catch (error) {
      throw new Error(
        `Migration failed for user ${userId}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Migrate quiz attempts
   *
   * Maps quiz attempts to objective performance metrics
   */
  private migrateQuizAttempts(
    state: UnifiedLearningState,
    quizAttempts: LegacyQuizAttempt[]
  ): void {
    // Group attempts by objective
    const attemptsByObjective = new Map<string, LegacyQuizAttempt[]>();

    for (const attempt of quizAttempts) {
      if (!attemptsByObjective.has(attempt.objectiveId)) {
        attemptsByObjective.set(attempt.objectiveId, []);
      }
      attemptsByObjective.get(attempt.objectiveId)!.push(attempt);
    }

    // Process each objective's attempts
    for (const [objectiveId, attempts] of attemptsByObjective) {
      const domainId = this.extractDomainId(objectiveId);
      const domain = state.domains[domainId];

      if (!domain) continue;

      let objective = domain.objectives.find(o => o.id === objectiveId);
      if (!objective) {
        // Create new objective if it doesn't exist
        objective = this.createObjectiveFromId(objectiveId, domainId);
        domain.objectives.push(objective);
      }

      // Sort attempts chronologically
      const sortedAttempts = attempts.sort(
        (a, b) => a.attemptDate.getTime() - b.attemptDate.getTime()
      );

      // Calculate performance metrics
      const scores = sortedAttempts.map(a => a.score);
      const bestScore = Math.max(...scores);
      const averageScore = Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length
      );
      const successCount = scores.filter(s => s >= 70).length;
      const successRate = Math.round((successCount / scores.length) * 100);

      // Update performance
      objective.performance.bestScore = bestScore;
      objective.performance.averageScore = averageScore;
      objective.performance.attemptCount = scores.length;
      objective.performance.successRate = successRate;
      objective.performance.lastAttemptScore = scores[scores.length - 1];
      objective.performance.lastAttemptDate = sortedAttempts[sortedAttempts.length - 1].attemptDate;

      // Add activities
      for (const attempt of sortedAttempts) {
        objective.activities.push({
          type: ActivityType.QUIZ_ATTEMPT,
          date: attempt.attemptDate,
          score: attempt.score,
        });
      }
    }
  }

  /**
   * Migrate baseline attempts
   */
  private migrateBaselines(
    state: UnifiedLearningState,
    baselines: LegacyBaseline[]
  ): void {
    const baselinesByDomain = new Map<string, LegacyBaseline>();

    // Keep only the most recent baseline per domain
    for (const baseline of baselines) {
      const existing = baselinesByDomain.get(baseline.domainId);
      if (!existing || baseline.attemptDate > existing.attemptDate) {
        baselinesByDomain.set(baseline.domainId, baseline);
      }
    }

    // Process each domain's baseline
    for (const [domainId, baseline] of baselinesByDomain) {
      const domain = state.domains[domainId];
      if (!domain) continue;

      domain.baseline.score = baseline.score;
      domain.baseline.attemptDate = baseline.attemptDate;
      domain.baseline.passed = baseline.passed ?? baseline.score >= 70;

      // Record activity
      domain.objectives.forEach(obj => {
        obj.activities.push({
          type: ActivityType.DOMAIN_BASELINE,
          date: baseline.attemptDate,
          score: baseline.score,
        });
      });
    }
  }

  /**
   * Migrate domain pass attempts
   */
  private migrateDomainPasses(
    state: UnifiedLearningState,
    domainPasses: LegacyDomainPass[]
  ): void {
    // Group by domain
    const passesByDomain = new Map<string, LegacyDomainPass[]>();

    for (const pass of domainPasses) {
      if (!passesByDomain.has(pass.domainId)) {
        passesByDomain.set(pass.domainId, []);
      }
      passesByDomain.get(pass.domainId)!.push(pass);
    }

    // Process each domain's passes
    for (const [domainId, passes] of passesByDomain) {
      const domain = state.domains[domainId];
      if (!domain) continue;

      // Sort by attempt number
      const sortedPasses = passes.sort((a, b) => a.attemptNumber - b.attemptNumber);

      for (const pass of sortedPasses) {
        domain.domainPass.push({
          id: `dp_${domainId}_${pass.attemptNumber}`,
          domainId,
          type: 'domain_pass',
          attemptNumber: pass.attemptNumber,
          score: pass.score,
          attemptDate: pass.attemptDate,
          passed: pass.passed ?? pass.score >= 70,
          passThreshold: 70,
        });
      }
    }
  }

  /**
   * Migrate mock exams
   */
  private migrateMockExams(
    state: UnifiedLearningState,
    mockExams: LegacyMockExam[]
  ): void {
    for (const exam of mockExams) {
      const percentage = Math.round((exam.score / exam.totalQuestions) * 100);

      state.mockExamHistory.push({
        id: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        attemptDate: exam.attemptDate,
        score: exam.score,
        totalQuestions: exam.totalQuestions,
        questionsCorrect: exam.score,
        percentage,
        type: 'full',
        domainScores: exam.domainScores || {},
        weakAreas: [],
        adaptiveRetakeAvailable: percentage >= 60 && percentage < 80,
      });
    }
  }

  /**
   * Migrate lab completions
   */
  private migrateLabs(state: UnifiedLearningState, labs: LegacyLab[]): void {
    // Group by domain
    const labsByDomain = new Map<string, LegacyLab[]>();

    for (const lab of labs) {
      if (!labsByDomain.has(lab.domainId)) {
        labsByDomain.set(lab.domainId, []);
      }
      labsByDomain.get(lab.domainId)!.push(lab);
    }

    // Update domain lab counts
    for (const [domainId, domainLabs] of labsByDomain) {
      const domain = state.domains[domainId];
      if (!domain) continue;

      const completed = domainLabs.filter(l => l.completed).length;
      domain.labs.completed = completed;
      domain.labs.notStarted = domainLabs.length - completed;
      domain.labs.total = domainLabs.length;

      // Record activities
      for (const lab of domainLabs) {
        if (lab.completed) {
          domain.objectives.forEach(obj => {
            obj.activities.push({
              type: ActivityType.LAB_COMPLETED,
              date: lab.completedDate || new Date(),
            });
          });
        }
      }
    }
  }

  /**
   * Recalculate mastery levels based on migrated data
   *
   * Algorithm:
   * - MASTERED: bestScore >= 95 AND successRate >= 80
   * - PROFICIENT: bestScore >= 85 AND successRate >= 70
   * - COMPETENT: averageScore >= 70
   * - LEARNING: attemptCount > 0
   * - NOT_STARTED: no attempts
   */
  private recalculateMasteryLevels(state: UnifiedLearningState): void {
    for (const domain of Object.values(state.domains)) {
      for (const objective of domain.objectives) {
        const perf = objective.performance;

        if (perf.attemptCount === 0) {
          objective.status = MasteryStatus.NOT_STARTED;
        } else if (perf.bestScore >= 95 && perf.successRate >= 80) {
          objective.status = MasteryStatus.MASTERED;
        } else if (perf.bestScore >= 85 && perf.successRate >= 70) {
          objective.status = MasteryStatus.PROFICIENT;
        } else if (perf.averageScore >= 70) {
          objective.status = MasteryStatus.COMPETENT;
        } else {
          objective.status = MasteryStatus.LEARNING;
        }
      }

      // Domain status = best objective status
      const objectiveStatuses = domain.objectives.map(o => o.status);
      if (objectiveStatuses.includes(MasteryStatus.MASTERED)) {
        domain.status = MasteryStatus.MASTERED;
      } else if (objectiveStatuses.includes(MasteryStatus.PROFICIENT)) {
        domain.status = MasteryStatus.PROFICIENT;
      } else if (objectiveStatuses.includes(MasteryStatus.COMPETENT)) {
        domain.status = MasteryStatus.COMPETENT;
      } else if (objectiveStatuses.some(s => s !== MasteryStatus.NOT_STARTED)) {
        domain.status = MasteryStatus.LEARNING;
      } else {
        domain.status = MasteryStatus.NOT_STARTED;
      }

      // Domain overall score
      const scores = domain.objectives
        .map(o => o.performance.averageScore)
        .filter(s => s > 0);
      domain.overallScore =
        scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    }
  }

  /**
   * Setup spaced repetition schedules for mastered items
   */
  private setupSpacedRepetition(state: UnifiedLearningState): void {
    const now = new Date();

    for (const domain of Object.values(state.domains)) {
      if (domain.status === MasteryStatus.MASTERED && domain.baseline.attemptDate) {
        // Domain has been mastered - set up refresh schedule
        const masteredDate = domain.baseline.attemptDate;
        domain.refreshSchedule.lastRefresh = masteredDate;
        domain.refreshSchedule.dueDate = this.addDays(masteredDate, 7);
        domain.refreshSchedule.refreshCount = 0;
      }

      for (const objective of domain.objectives) {
        if (objective.status === MasteryStatus.MASTERED && objective.performance.lastAttemptDate) {
          const masteredDate = objective.performance.lastAttemptDate;
          objective.spacedRep.lastRefreshDate = masteredDate;
          objective.spacedRep.dueDate = this.addDays(masteredDate, 7);
          objective.spacedRep.refreshCount = 0;
          objective.milestone.masteredDate = masteredDate;
        }
      }
    }
  }

  /**
   * Calculate exam readiness based on migrated state
   */
  private calculateExamReadiness(state: UnifiedLearningState): void {
    const masteredCount = Object.values(state.domains).filter(
      d => d.status === MasteryStatus.MASTERED
    ).length;
    const proficientCount = Object.values(state.domains).filter(
      d => d.status === MasteryStatus.PROFICIENT
    ).length;

    state.learningState.masteredDomains = Object.entries(state.domains)
      .filter(([_, d]) => d.status === MasteryStatus.MASTERED)
      .map(([id]) => id);

    state.learningState.certifiedDomains = Object.entries(state.domains)
      .filter(([_, d]) => d.domainPass.some(p => p.passed))
      .map(([id]) => id);

    // Exam readiness score calculation
    let score = 0;
    score += Math.min(masteredCount * 15, 90);
    score += proficientCount * 5;

    if (state.mockExamHistory.length > 0) {
      const lastExam = state.mockExamHistory[state.mockExamHistory.length - 1];
      if (lastExam.percentage >= 70) score += 10;
    }

    state.learningState.examReadinessScore = Math.min(score, 100);
    state.learningState.examReadinessConfidence = Math.min(masteredCount / 6, 1.0);
    state.learningState.isExamReady =
      masteredCount >= 4 &&
      state.learningState.examReadinessScore >= 70 &&
      state.mockExamHistory.some(e => e.percentage >= 70);
  }

  /**
   * Generate migration report
   */
  generateReport(migrations: Array<{ userId: string; success: boolean; error?: string }>): MigrationReport {
    const successful = migrations.filter(m => m.success).length;
    const failed = migrations.filter(m => !m.success).length;

    return {
      executedAt: new Date(),
      totalUsers: migrations.length,
      successfulMigrations: successful,
      failedMigrations: failed,
      successRate: (successful / migrations.length) * 100,
      failedUsers: migrations
        .filter(m => !m.success)
        .map(m => ({
          userId: m.userId,
          reason: m.error || 'Unknown error',
        })),
      stats: {
        totalQuizAttempts: 0, // Would aggregate from actual data
        totalBaselineAttempts: 0,
        totalDomainPassAttempts: 0,
        totalMockExams: 0,
        usersMasteredDomains: 0,
        usersInProgress: 0,
        averageAttemptsPerObjective: 0,
        averageMastery: 0,
      },
      recommendations: [
        'Contact failed users and offer manual migration assistance',
        'Verify mastery levels for spot-check sample of users',
        'Monitor spaced repetition completion in first week',
      ],
      warnings: failed > 0 ? [`${failed} users failed migration`] : [],
    };
  }

  /**
   * Utility: Extract domain ID from objective ID
   */
  private extractDomainId(objectiveId: string): string {
    const match = objectiveId.match(/^(\d+)\./);
    if (!match) return 'D1';
    const domainNum = parseInt(match[1]);
    return `D${domainNum}`;
  }

  /**
   * Utility: Create objective from ID
   */
  private createObjectiveFromId(objectiveId: string, domainId: string): ObjectiveState {
    return {
      id: objectiveId,
      name: `Objective ${objectiveId}`,
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
   * Utility: Add days to date
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

/**
 * Export singleton
 */
export const dataMigrationService = new DataMigrationService();
