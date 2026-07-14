/**
 * Recommendation Persistence & Metrics (Phase 6)
 *
 * Handles:
 * - Saving recommendations to storage
 * - Tracking dismissals and actions
 * - Recording metrics for A/B testing
 * - Filtering active recommendations
 *
 * All functions work with a repository interface for testability.
 */

import { Recommendation, RecommendationMetrics } from './recommendationTypes';

/**
 * Repository interface for persisting recommendations
 */
export interface IRecommendationRepository {
  saveRecommendation(recommendation: Recommendation): Promise<void>;
  getRecommendation(recommendationId: string): Promise<Recommendation | null>;
  getActiveRecommendations(userId: string): Promise<Recommendation[]>;
  getAllRecommendations(userId: string): Promise<Recommendation[]>;
  updateRecommendation(recommendation: Recommendation): Promise<void>;
  dismissRecommendation(recommendationId: string, reason?: string): Promise<void>;
  recordAction(recommendationId: string): Promise<void>;
}

/**
 * In-memory repository for Phase 6 testing
 */
export class InMemoryRecommendationRepository implements IRecommendationRepository {
  private recommendations = new Map<string, Recommendation>();
  private metrics = new Map<string, RecommendationMetrics>();

  async saveRecommendation(recommendation: Recommendation): Promise<void> {
    this.recommendations.set(recommendation.id, recommendation);

    // Initialize metrics if not exists
    if (!this.metrics.has(recommendation.id)) {
      this.metrics.set(recommendation.id, {
        recommendationId: recommendation.id,
        userId: recommendation.userId,
        showCount: 1,
        dismissCount: 0,
        actionCount: 0,
        actionRate: 0,
        lastShownAt: new Date(),
      });
    }
  }

  async getRecommendation(recommendationId: string): Promise<Recommendation | null> {
    return this.recommendations.get(recommendationId) || null;
  }

  async getActiveRecommendations(userId: string): Promise<Recommendation[]> {
    const recommendations = Array.from(this.recommendations.values())
      .filter(rec => rec.userId === userId && !rec.dismissedAt && !rec.actedAt)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Update show count for metrics
    recommendations.forEach(rec => {
      const metrics = this.metrics.get(rec.id);
      if (metrics) {
        metrics.showCount++;
        metrics.lastShownAt = new Date();
      }
    });

    return recommendations;
  }

  async getAllRecommendations(userId: string): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values())
      .filter(rec => rec.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateRecommendation(recommendation: Recommendation): Promise<void> {
    this.recommendations.set(recommendation.id, recommendation);
  }

  async dismissRecommendation(recommendationId: string, reason?: string): Promise<void> {
    const recommendation = this.recommendations.get(recommendationId);
    if (recommendation) {
      recommendation.dismissedAt = new Date();
      recommendation.metadata = {
        ...recommendation.metadata,
        dismissalReason: reason,
      };
      this.recommendations.set(recommendationId, recommendation);

      // Update metrics
      const metrics = this.metrics.get(recommendationId);
      if (metrics) {
        metrics.dismissCount++;
      }
    }
  }

  async recordAction(recommendationId: string): Promise<void> {
    const recommendation = this.recommendations.get(recommendationId);
    if (recommendation) {
      recommendation.actedAt = new Date();
      this.recommendations.set(recommendationId, recommendation);

      // Update metrics
      const metrics = this.metrics.get(recommendationId);
      if (metrics) {
        metrics.actionCount++;
        metrics.lastActedAt = new Date();
        metrics.actionRate = metrics.showCount > 0 ? (metrics.actionCount / metrics.showCount) * 100 : 0;
      }
    }
  }

  getMetrics(recommendationId: string): RecommendationMetrics | null {
    return this.metrics.get(recommendationId) || null;
  }

  getAllMetrics(): RecommendationMetrics[] {
    return Array.from(this.metrics.values());
  }
}

/**
 * Recommendation Persistence Service
 *
 * Handles all persistence operations
 */
export class RecommendationPersistenceService {
  constructor(private repository: IRecommendationRepository) {}

  /**
   * Save a recommendation to persistence
   */
  async saveRecommendation(recommendation: Recommendation): Promise<void> {
    if (!recommendation.id) {
      recommendation.id = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    await this.repository.saveRecommendation(recommendation);
  }

  /**
   * Get active (not dismissed, not acted) recommendations for user
   */
  async getActiveRecommendations(userId: string): Promise<Recommendation[]> {
    return this.repository.getActiveRecommendations(userId);
  }

  /**
   * Get all recommendations for user (history)
   */
  async getAllRecommendations(userId: string): Promise<Recommendation[]> {
    return this.repository.getAllRecommendations(userId);
  }

  /**
   * User dismissed a recommendation
   */
  async dismissRecommendation(recommendationId: string, reason?: string): Promise<void> {
    await this.repository.dismissRecommendation(recommendationId, reason);
  }

  /**
   * User acted on a recommendation (clicked through)
   */
  async recordAction(recommendationId: string): Promise<void> {
    await this.repository.recordAction(recommendationId);
  }

  /**
   * Mark recommendation as actioned (user followed the recommendation)
   */
  async markAsActioned(recommendationId: string): Promise<void> {
    const rec = await this.repository.getRecommendation(recommendationId);
    if (rec) {
      rec.actedAt = new Date();
      await this.repository.updateRecommendation(rec);
      await this.repository.recordAction(recommendationId);
    }
  }

  /**
   * Get recommendations that haven't been shown recently
   *
   * Don't spam users - wait at least 24 hours before showing same type again
   */
  async getRecommendationsNotShownRecently(
    userId: string,
    hoursSinceLastShow: number = 24
  ): Promise<Recommendation[]> {
    const all = await this.repository.getAllRecommendations(userId);
    const now = new Date();
    const cutoff = new Date(now.getTime() - hoursSinceLastShow * 60 * 60 * 1000);

    return all.filter(rec => {
      // Show if never shown before
      if (!rec.metadata?.lastShownAt) {
        return true;
      }

      // Show if last shown more than X hours ago
      const lastShow = new Date(rec.metadata.lastShownAt);
      return lastShow < cutoff;
    });
  }

  /**
   * Get recommendations of a specific type for user
   */
  async getRecommendationsByType(userId: string, type: string): Promise<Recommendation[]> {
    const all = await this.repository.getAllRecommendations(userId);
    return all.filter(rec => rec.type === type);
  }

  /**
   * Filter recommendations by dismissed status
   */
  async getUndismissedRecommendations(userId: string): Promise<Recommendation[]> {
    const all = await this.repository.getAllRecommendations(userId);
    return all.filter(rec => !rec.dismissedAt);
  }

  /**
   * Get recommendation dismissal history
   */
  async getDismissalHistory(userId: string): Promise<Array<{ id: string; reason?: string; dismissedAt: Date }>> {
    const all = await this.repository.getAllRecommendations(userId);
    return all
      .filter(rec => rec.dismissedAt)
      .map(rec => ({
        id: rec.id,
        reason: rec.metadata?.dismissalReason,
        dismissedAt: rec.dismissedAt!,
      }));
  }

  /**
   * Calculate recommendation effectiveness metrics
   */
  async calculateEffectiveness(userId: string): Promise<{ actionRate: number; avgDismissal: number }> {
    const all = await this.repository.getAllRecommendations(userId);

    if (all.length === 0) {
      return { actionRate: 0, avgDismissal: 0 };
    }

    const acted = all.filter(rec => rec.actedAt).length;
    const dismissed = all.filter(rec => rec.dismissedAt).length;

    return {
      actionRate: Math.round((acted / all.length) * 100),
      avgDismissal: Math.round((dismissed / all.length) * 100),
    };
  }

  /**
   * Log recommendation metrics for A/B testing
   */
  async logRecommendationMetrics(
    recommendationId: string,
    actionTaken: boolean,
    dismissed: boolean,
    userEngagementTime?: number
  ): Promise<void> {
    if (actionTaken) {
      await this.recordAction(recommendationId);
    } else if (dismissed) {
      await this.dismissRecommendation(recommendationId, 'user_dismissed');
    }

    // In a real system, send to analytics service
    // For now, metrics are stored in repository
  }

  /**
   * Get recommendations expiring soon (have dueDate approaching)
   */
  async getExpiringRecommendations(userId: string, hoursUntilExpiry: number = 24): Promise<Recommendation[]> {
    const all = await this.repository.getActiveRecommendations(userId);
    const now = new Date();
    const expiryCutoff = new Date(now.getTime() + hoursUntilExpiry * 60 * 60 * 1000);

    return all.filter(rec => rec.dueDate && rec.dueDate < expiryCutoff);
  }

  /**
   * Archive old recommendations (older than X days)
   */
  async archiveOldRecommendations(userId: string, daysOld: number = 30): Promise<number> {
    const all = await this.repository.getAllRecommendations(userId);
    const cutoff = new Date(new Date().getTime() - daysOld * 24 * 60 * 60 * 1000);

    let archived = 0;
    for (const rec of all) {
      if (rec.createdAt < cutoff && (rec.dismissedAt || rec.actedAt)) {
        // Mark as archived in metadata
        rec.metadata = {
          ...rec.metadata,
          archived: true,
          archivedAt: new Date(),
        };
        await this.repository.updateRecommendation(rec);
        archived++;
      }
    }

    return archived;
  }
}

/**
 * Export singleton for use throughout app
 */
export const recommendationRepository = new InMemoryRecommendationRepository();
export const recommendationPersistenceService = new RecommendationPersistenceService(recommendationRepository);
