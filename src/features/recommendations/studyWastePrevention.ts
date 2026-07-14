/**
 * Study Waste Prevention (Phase 6)
 *
 * Detects and prevents users from wasting time re-studying mastered topics.
 * Implements: "You already scored 95% on this. Focus on D4 instead."
 *
 * All functions are pure and testable.
 */

import {
  Recommendation,
  RecommendationPriority,
  RecommendationType,
  MasteryOverview,
  DomainRecommendationContext,
} from './recommendationTypes';

/**
 * Detect if user is about to re-test a mastered objective
 *
 * Rule: If user has 95%+ on this objective AND took quiz in last 7 days,
 * they're wasting time re-studying.
 *
 * @param objectiveId Objective being attempted
 * @param masteryOverview User's mastery data
 * @param recentAttemptDate When was the last attempt?
 * @returns true if this is a waste of time (mastered and recently tested)
 */
export function detectRetestOfMastered(
  objectiveId: string,
  masteryOverview: MasteryOverview,
  recentAttemptDate?: Date
): boolean {
  // Check if objective is in mastered list
  if (!masteryOverview.masteredObjectives.includes(objectiveId)) {
    return false;
  }

  // If recently attempted (within 7 days), it's likely a waste
  if (recentAttemptDate) {
    const daysSinceAttempt = Math.floor(
      (new Date().getTime() - recentAttemptDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceAttempt <= 7;
  }

  return true; // Mastered and being re-attempted = waste
}

/**
 * Generate recommendation to stop re-studying mastered topic
 *
 * @param userId User ID
 * @param objectiveId Objective ID being re-studied
 * @param objectiveName Objective name
 * @param masteryScore Current mastery score (e.g., 95)
 * @param weakAreas User's actual weak areas to focus on instead
 * @returns Waste prevention recommendation
 */
export function generateRetestWarning(
  userId: string,
  objectiveId: string,
  objectiveName: string,
  masteryScore: number,
  weakAreas: string[]
): Recommendation {
  const now = new Date();
  let focusTarget = 'domain_pass';

  if (weakAreas.length > 0) {
    focusTarget = 'weak_area_focus';
  }

  return {
    id: `rec_stop_retest_${objectiveId}_${Date.now()}`,
    userId,
    priority: RecommendationPriority.IMMEDIATE,
    type: RecommendationType.MASTERY_DETECTED,
    title: `You've Mastered "${objectiveName}" (${masteryScore}%) - Stop Re-quizzing`,
    description: `You already scored ${masteryScore}% on this objective. Re-studying it wastes time. Focus on the ${weakAreas.length} weak areas instead: ${weakAreas.slice(0, 3).join(', ')}.`,
    action: {
      type: 'start_activity',
      target: focusTarget,
      params: { weakAreas, masteryObjectiveId: objectiveId },
    },
    reasoning: `Mastery at ${masteryScore}%, re-test detected as waste of study time`,
    confidence: 92,
    importance: 8,
    dismissible: false,
    createdAt: now,
  };
}

/**
 * Suggest alternative study activities for mastered area
 *
 * If user has mastered an objective, redirect to:
 * - Next weak objective in same domain
 * - Next domain baseline
 * - Domain pass attempt
 *
 * @param userId User ID
 * @param masteryOverview User's mastery state
 * @param domainStatus Current domain status
 * @returns Recommendation for better study activity
 */
export function suggestAlternativeStudy(
  userId: string,
  masteryOverview: MasteryOverview,
  domainStatus: DomainRecommendationContext
): Recommendation | null {
  const now = new Date();

  // If there are weak areas in this domain, focus there first
  if (domainStatus.weakAreas.length > 0) {
    return {
      id: `rec_focus_weak_${domainStatus.domainId}_${Date.now()}`,
      userId,
      priority: RecommendationPriority.STRATEGIC,
      type: RecommendationType.WEAK_AREA_FOCUS,
      title: `Focus on ${domainStatus.domainName} Weak Areas Instead`,
      description: `You've mastered many objectives, but these ${domainStatus.weakAreas.length} areas still need work. Let's focus there for better exam prep.`,
      action: {
        type: 'start_activity',
        target: 'weak_area_focus',
        params: {
          domainId: domainStatus.domainId,
          targetObjectives: domainStatus.weakAreas,
        },
      },
      reasoning: `Mastery detected, ${domainStatus.weakAreas.length} weak areas remain in domain`,
      confidence: 88,
      importance: 8,
      dismissible: true,
      createdAt: now,
    };
  }

  // If this domain is 90%+ ready, suggest domain pass
  if (domainStatus.readinessPercentage >= 90 && domainStatus.baselineStatus !== 'TESTED_OUT') {
    return {
      id: `rec_domain_pass_ready_${domainStatus.domainId}_${Date.now()}`,
      userId,
      priority: RecommendationPriority.STRATEGIC,
      type: RecommendationType.DOMAIN_PASS,
      title: `Take ${domainStatus.domainName} Domain Pass - You're Ready!`,
      description: `You've mastered this domain. Stop drilling and attempt the domain pass to earn certification.`,
      action: {
        type: 'start_activity',
        target: 'domain_pass',
        params: { domainId: domainStatus.domainId },
      },
      reasoning: `Domain readiness at ${domainStatus.readinessPercentage}%, ready for certification attempt`,
      confidence: 85,
      importance: 8,
      dismissible: false,
      createdAt: now,
    };
  }

  return null;
}

/**
 * Detect if user is in an overstudy pattern
 *
 * Pattern: User has done 10+ quiz attempts on same objective in 2 weeks
 *
 * @param objectiveId Objective ID
 * @param recentAttempts Recent quiz attempts on this objective
 * @returns true if overstudy pattern detected
 */
export function trackOverstudyPattern(
  objectiveId: string,
  recentAttempts: Array<{ attemptDate: Date; score: number }>
): boolean {
  if (recentAttempts.length < 10) {
    return false;
  }

  // Check if 10+ attempts within 14 days
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const attemptsInWindow = recentAttempts.filter(a => a.attemptDate >= twoWeeksAgo);
  return attemptsInWindow.length >= 10;
}

/**
 * Generate recommendation to break overstudy cycle
 *
 * @param userId User ID
 * @param objectiveId Objective being overstu
died
 * @param objectiveName Objective name
 * @param attemptCount Number of attempts
 * @returns Overstudy warning recommendation
 */
export function generateOverstudyWarning(
  userId: string,
  objectiveId: string,
  objectiveName: string,
  attemptCount: number
): Recommendation {
  const now = new Date();

  return {
    id: `rec_overstudy_${objectiveId}_${Date.now()}`,
    userId,
    priority: RecommendationPriority.WARNING,
    type: RecommendationType.MASTERY_DETECTED,
    title: `You're Over-drilling "${objectiveName}" (${attemptCount} Attempts)`,
    description: `${attemptCount} quiz attempts on this objective in 2 weeks is diminishing returns. Spaced repetition works better. Move on to other domains and come back in a few days.`,
    action: {
      type: 'navigate',
      target: '/home',
    },
    reasoning: `Overstudy pattern: ${attemptCount} attempts in 14 days, diminishing returns detected`,
    confidence: 80,
    importance: 7,
    dismissible: true,
    createdAt: now,
  };
}

/**
 * Calculate opportunity cost of re-studying a mastered objective
 *
 * Estimates how much exam readiness could be improved by studying
 * weak areas instead of re-drilling mastered content.
 *
 * @param objectiveMasteryScore Score on the objective (e.g., 95)
 * @param weakAreaMasteryScore Score on weak area (e.g., 65)
 * @param timeToSpend Minutes available to study
 * @returns Estimated readiness improvement from studying weak areas vs mastered
 */
export function calculateOpportunityCost(
  objectiveMasteryScore: number,
  weakAreaMasteryScore: number,
  timeToSpend: number
): { costOfRetesting: number; benefitOfFocusingOnWeakArea: number } {
  // Assume 1 minute of study improves score by 0.1 points
  // But benefit is higher for weak areas (1 minute = 0.2 improvement)
  // because there's more room to grow

  const costOfRetesting = objectiveMasteryScore * 0.001 * timeToSpend; // Minimal improvement
  const benefitOfFocusingOnWeakArea = weakAreaMasteryScore === 0 ? 10 : 20 / (100 - weakAreaMasteryScore);

  return {
    costOfRetesting: Math.round(costOfRetesting),
    benefitOfFocusingOnWeakArea: Math.round(benefitOfFocusingOnWeakArea * timeToSpend * 0.1),
  };
}

/**
 * Check if user is spending too much time on one domain
 *
 * @param domainStudyDays Recent study sessions by domain
 * @param threshold Minimum percentage (default: 70)
 * @returns true if user is spending 70%+ of time on one domain
 */
export function isOverfocusingOnOneDomain(
  domainStudyDays: Record<string, number>,
  threshold: number = 70
): boolean {
  const totalMinutes = Object.values(domainStudyDays).reduce((sum, mins) => sum + mins, 0);
  if (totalMinutes === 0) return false;

  const maxDomainMinutes = Math.max(...Object.values(domainStudyDays));
  const percentageOnMax = (maxDomainMinutes / totalMinutes) * 100;

  return percentageOnMax >= threshold;
}

/**
 * Find the domain user is overfocusing on
 *
 * @param domainStudyDays Recent study sessions by domain
 * @returns Domain name or null if balanced
 */
export function findOverfocusedDomain(domainStudyDays: Record<string, number>): string | null {
  if (!isOverfocusingOnOneDomain(domainStudyDays)) {
    return null;
  }

  const maxDomain = Object.entries(domainStudyDays).reduce((prev, [domain, minutes]) =>
    minutes > (prev[1] || 0) ? [domain, minutes] : prev
  );

  return maxDomain[0] || null;
}

/**
 * Generate recommendation to diversify study
 *
 * @param userId User ID
 * @param overfocusedDomain Domain being overstudied
 * @param neglectedDomains Domains not getting enough attention
 * @returns Diversification recommendation
 */
export function generateDiversificationRecommendation(
  userId: string,
  overfocusedDomain: string,
  neglectedDomains: string[]
): Recommendation {
  const now = new Date();

  return {
    id: `rec_diversify_${overfocusedDomain}_${Date.now()}`,
    userId,
    priority: RecommendationPriority.STRATEGIC,
    type: RecommendationType.NEXT_DOMAIN,
    title: `Diversify Your Study - You're Over-focusing on ${overfocusedDomain}`,
    description: `You've spent a lot of time on ${overfocusedDomain}. Time to balance with other domains: ${neglectedDomains.slice(0, 2).join(', ')}. Breadth of knowledge matters for the exam.`,
    action: {
      type: 'start_activity',
      target: 'domain_baseline',
      params: { domainId: neglectedDomains[0] },
    },
    reasoning: `Study diversity: 70%+ of time on one domain, other domains neglected`,
    confidence: 75,
    importance: 6,
    dismissible: true,
    createdAt: now,
  };
}
