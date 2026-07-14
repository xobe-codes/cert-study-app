/**
 * Recommendation Rules Engine (Phase 6)
 *
 * Core logic for generating adaptive recommendations based on user learning state.
 * Implements rules for:
 * - Refresh drill timing
 * - Domain pass readiness
 * - Warning detection
 * - Study waste prevention
 * - Exam readiness assessment
 *
 * All functions are pure and testable.
 */

import {
  Recommendation,
  RecommendationPriority,
  RecommendationType,
  LearningContext,
  DomainRecommendationContext,
  ExamReadinessEstimate,
  GeneratedRecommendations,
  RecommendationGenerationOptions,
} from './recommendationTypes';

/**
 * Main entry point - generate all applicable recommendations for a user
 *
 * Returns sorted array of recommendations by priority.
 * Implementation of: "D1 refresh available now" + "Ready for D3 domain pass" + warnings
 *
 * @param userId User ID
 * @param context Current learning context
 * @param options Generation options
 * @returns Array of recommendations sorted by priority (immediate first)
 */
export function generateRecommendations(
  userId: string,
  context: LearningContext,
  options: RecommendationGenerationOptions = {}
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const now = new Date();

  // 1. Check for refresh drills that are due TODAY (immediate)
  const refreshDrillRecs = checkRefreshDueRecommendations(userId, context, now);
  recommendations.push(...refreshDrillRecs);

  // 2. Check for domain pass readiness (immediate/strategic)
  const domainPassRecs = checkNextStepRecommendations(userId, context, now);
  recommendations.push(...domainPassRecs);

  // 3. Check for warnings (knowledge decay, behind schedule)
  const warningRecs = checkWarningRecommendations(userId, context, now);
  recommendations.push(...warningRecs);

  // 4. Check for study waste (re-studying mastered topics)
  const wastePrevRecs = checkStudyWasteRecommendations(userId, context, now);
  recommendations.push(...wastePrevRecs);

  // 5. Check exam readiness and provide strategic guidance
  const examReadinessRecs = checkExamReadinessRecommendations(userId, context, now);
  recommendations.push(...examReadinessRecs);

  // 6. Optional: maintenance recommendations (skip if includeMaintenanceRecommendations is false)
  if (options.includeMaintenanceRecommendations !== false) {
    const maintenanceRecs = checkMaintenanceRecommendations(userId, context, now);
    recommendations.push(...maintenanceRecs);
  }

  // Sort by priority (immediate → strategic → maintenance → warning)
  const priorityOrder = {
    [RecommendationPriority.IMMEDIATE]: 0,
    [RecommendationPriority.WARNING]: 1,
    [RecommendationPriority.STRATEGIC]: 2,
    [RecommendationPriority.MAINTENANCE]: 3,
  };

  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Limit immediate recommendations to prevent spam (max 3 at once)
  const immediateRecs = recommendations.filter(r => r.priority === RecommendationPriority.IMMEDIATE);
  if (immediateRecs.length > 3) {
    // Keep only 3 most important immediate recommendations
    const sorted = immediateRecs
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 3);
    const others = recommendations.filter(r => r.priority !== RecommendationPriority.IMMEDIATE);
    return [...sorted, ...others];
  }

  return recommendations;
}

/**
 * Check for refresh drills that are due TODAY
 *
 * Rule: If domain was tested out, refresh drill becomes available after:
 * - Day 1: immediately available
 * - Day 3: available again
 * - Day 7: available again
 * - Day 30: available again (for long-term maintenance)
 *
 * @returns Recommendations for refresh drills due today (immediate priority)
 */
export function checkRefreshDueRecommendations(
  userId: string,
  context: LearningContext,
  now: Date
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  let recCount = 0;

  Object.values(context.domainStatuses).forEach(domain => {
    if (recCount >= 2) return; // Limit to 2 refresh recommendations at once

    // Only for domains that are tested out
    if (domain.baselineStatus !== 'TESTED_OUT' && domain.baselineStatus !== 'STALE') {
      return;
    }

    // Calculate when last refresh drill was done
    if (!domain.lastActivityDate) {
      // First refresh ever - make it available immediately
      recommendations.push({
        id: `rec_refresh_${domain.domainId}_${Date.now()}`,
        userId,
        priority: RecommendationPriority.IMMEDIATE,
        type: RecommendationType.REFRESH_DRILL,
        title: `${domain.domainName} Refresh Available Now`,
        description: `You tested out of ${domain.domainName}. Do a quick 5-10 minute refresh to maintain mastery.`,
        action: {
          type: 'start_activity',
          target: 'refresh_drill',
          params: { domainId: domain.domainId },
        },
        reasoning:
          'Spaced repetition: first refresh drill now available to lock in knowledge after test-out',
        confidence: 95,
        importance: 8,
        dismissible: true,
        createdAt: now,
      });
      recCount++;
      return;
    }

    const daysSinceRefresh = Math.floor(
      (now.getTime() - domain.lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check if refresh is due (Day 1, 3, 7, or 30)
    const refreshSchedule = [1, 3, 7, 30];
    const refreshDue = refreshSchedule.some(
      day => daysSinceRefresh >= day && daysSinceRefresh <= day + 0.5
    );

    if (refreshDue) {
      recommendations.push({
        id: `rec_refresh_${domain.domainId}_${Date.now()}`,
        userId,
        priority: RecommendationPriority.IMMEDIATE,
        type: RecommendationType.REFRESH_DRILL,
        title: `${domain.domainName} Refresh Available Now (Day ${daysSinceRefresh})`,
        description: `${domain.domainName} refresh is due today to maintain your mastery. You'll retain knowledge better with spaced repetition.`,
        action: {
          type: 'start_activity',
          target: 'refresh_drill',
          params: { domainId: domain.domainId },
        },
        reasoning: `Spaced repetition: ${daysSinceRefresh} days since last activity, refresh optimal now`,
        confidence: 90,
        importance: 7,
        dismissible: true,
        createdAt: now,
      });
      recCount++;
    }
  });

  return recommendations;
}

/**
 * Check for next step recommendations
 *
 * Rules:
 * - If baseline >= 80% and weak areas fixed: ready for domain pass (immediate)
 * - If domain baseline not started: start baseline (strategic)
 * - If domain is stale (60+ days): restart or refresh (warning)
 *
 * @returns Recommendations for domain progression (strategic/immediate priority)
 */
export function checkNextStepRecommendations(
  userId: string,
  context: LearningContext,
  now: Date
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  Object.values(context.domainStatuses).forEach(domain => {
    // Ready for domain pass if baseline >= 80% and weak areas addressed
    if (
      domain.baselineScore !== null &&
      domain.baselineScore >= 80 &&
      domain.weakAreas.length === 0
    ) {
      recommendations.push({
        id: `rec_domain_pass_${domain.domainId}_${Date.now()}`,
        userId,
        priority: RecommendationPriority.IMMEDIATE,
        type: RecommendationType.DOMAIN_PASS,
        title: `Ready for ${domain.domainName} Domain Pass`,
        description: `You've mastered the weak areas in ${domain.domainName}. Ready to take the domain pass and earn certification?`,
        action: {
          type: 'start_activity',
          target: 'domain_pass',
          params: { domainId: domain.domainId },
        },
        reasoning: 'Baseline score 80%+, all weak areas addressed, ready to attempt certification',
        confidence: 92,
        importance: 9,
        dismissible: false,
        createdAt: now,
      });
      return;
    }

    // Not started - suggest starting baseline
    if (domain.baselineStatus === 'NOT_STARTED') {
      recommendations.push({
        id: `rec_start_baseline_${domain.domainId}_${Date.now()}`,
        userId,
        priority: RecommendationPriority.STRATEGIC,
        type: RecommendationType.DOMAIN_BASELINE,
        title: `Start ${domain.domainName} Baseline`,
        description: `Ready to assess your ${domain.domainName} knowledge? Take a 20-minute baseline to see what you already know.`,
        action: {
          type: 'start_activity',
          target: 'domain_baseline',
          params: { domainId: domain.domainId },
        },
        reasoning: 'Domain progression: baseline not started, next step in study plan',
        confidence: 85,
        importance: 7,
        dismissible: true,
        createdAt: now,
      });
    }
  });

  return recommendations;
}

/**
 * Check for warning recommendations
 *
 * Rules:
 * - Domain behind schedule (no baseline in 3 weeks): warning
 * - Knowledge decay risk (90+ days since activity): warning
 * - Mock exam in 3 days and not ready (< 75% estimated): warning
 *
 * @returns Recommendations for issues to address (warning priority)
 */
export function checkWarningRecommendations(
  userId: string,
  context: LearningContext,
  now: Date
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  Object.values(context.domainStatuses).forEach(domain => {
    // Check if behind schedule (no baseline started in 3 weeks)
    const daysSinceActivity = domain.daysSinceActivity;
    if (
      domain.baselineStatus === 'NOT_STARTED' &&
      daysSinceActivity >= 21 &&
      context.daysTillExam &&
      context.daysTillExam > 7
    ) {
      recommendations.push({
        id: `rec_warn_behind_schedule_${domain.domainId}_${Date.now()}`,
        userId,
        priority: RecommendationPriority.WARNING,
        type: RecommendationType.DOMAIN_BASELINE,
        title: `${domain.domainName} Behind Schedule`,
        description: `You haven't started ${domain.domainName} baseline yet (${daysSinceActivity} days). You should prioritize this domain to stay on track.`,
        action: {
          type: 'start_activity',
          target: 'domain_baseline',
          params: { domainId: domain.domainId },
        },
        reasoning: `Domain progression risk: ${daysSinceActivity} days without action, ${context.daysTillExam} days till exam`,
        confidence: 80,
        importance: 8,
        dismissible: true,
        createdAt: now,
      });
    }

    // Check for knowledge decay (90+ days without activity)
    if (daysSinceActivity >= 90 && domain.baselineStatus !== 'NOT_STARTED') {
      recommendations.push({
        id: `rec_warn_knowledge_decay_${domain.domainId}_${Date.now()}`,
        userId,
        priority: RecommendationPriority.WARNING,
        type: RecommendationType.REFRESH_DRILL,
        title: `${domain.domainName} Knowledge Decay Risk`,
        description: `It's been ${daysSinceActivity} days since you studied ${domain.domainName}. Knowledge decay is setting in. Do a refresh drill to restore your mastery.`,
        action: {
          type: 'start_activity',
          target: 'refresh_drill',
          params: { domainId: domain.domainId },
        },
        reasoning: `Knowledge decay risk: ${daysSinceActivity} days since last activity`,
        confidence: 85,
        importance: 6,
        dismissible: true,
        createdAt: now,
      });
    }
  });

  // Check mock exam readiness
  if (
    context.mockExamDueDate &&
    context.mockExamScore !== undefined &&
    context.estimatedReadinessPercentage < 75
  ) {
    const daysUntilExam = Math.floor(
      (context.mockExamDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExam <= 3 && daysUntilExam > 0) {
      recommendations.push({
        id: `rec_warn_mock_exam_not_ready_${Date.now()}`,
        userId,
        priority: RecommendationPriority.WARNING,
        type: RecommendationType.MOCK_EXAM,
        title: 'Mock Exam in 3 Days - Not Ready',
        description: `Your mock exam is in ${daysUntilExam} days and you're only ${context.estimatedReadinessPercentage}% ready. Focus intensely on weak areas: ${context.domainStatuses[Object.keys(context.domainStatuses)[0]]?.weakAreas?.join(', ') || 'unknown'}.`,
        action: {
          type: 'show_modal',
          target: 'exam_readiness_check',
        },
        reasoning: `Mock exam in ${daysUntilExam} days, readiness at ${context.estimatedReadinessPercentage}%`,
        confidence: 85,
        importance: 9,
        dismissible: true,
        createdAt: now,
      });
    }
  }

  return recommendations;
}

/**
 * Check for study waste recommendations
 *
 * Rules:
 * - If user is about to re-quiz a mastered topic (95%+): intercept with recommendation
 * - If user has been re-studying the same domain repeatedly: suggest moving on
 * - If user has completed all objectives in a domain: suggest domain pass
 *
 * @returns Recommendations for preventing wasted study time (immediate priority)
 */
export function checkStudyWasteRecommendations(
  userId: string,
  context: LearningContext,
  now: Date
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  Object.values(context.domainStatuses).forEach(domain => {
    // If readiness is 95%+ but not yet at domain pass - check for waste
    if (
      domain.readinessPercentage >= 95 &&
      domain.baselineStatus !== 'TESTED_OUT' &&
      domain.baselineStatus !== 'STALE'
    ) {
      // User has likely mastered all weak areas, should move to domain pass
      recommendations.push({
        id: `rec_stop_waste_${domain.domainId}_${Date.now()}`,
        userId,
        priority: RecommendationPriority.IMMEDIATE,
        type: RecommendationType.MASTERY_DETECTED,
        title: `Stop Re-studying ${domain.domainName} - You've Mastered It`,
        description: `You've mastered all weak areas in ${domain.domainName} (${domain.readinessPercentage}% ready). Stop drilling and take the domain pass instead.`,
        action: {
          type: 'start_activity',
          target: 'domain_pass',
          params: { domainId: domain.domainId },
        },
        reasoning: `Mastery detected: ${domain.readinessPercentage}% readiness, wasting time on additional drills`,
        confidence: 88,
        importance: 8,
        dismissible: false,
        createdAt: now,
      });
    }
  });

  return recommendations;
}

/**
 * Check exam readiness and provide strategic guidance
 *
 * Rules:
 * - If < 60% ready: "You need 6+ weeks at current pace"
 * - If 60-80% ready: "You're on track for [date]"
 * - If 80%+ ready: "You're exam-ready, focus on weak domains"
 *
 * @returns Recommendations for exam preparation (strategic/maintenance priority)
 */
export function checkExamReadinessRecommendations(
  userId: string,
  context: LearningContext,
  now: Date
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (context.estimatedReadinessPercentage < 60) {
    const weeksNeeded = Math.ceil((60 - context.estimatedReadinessPercentage) / 10);

    recommendations.push({
      id: `rec_exam_readiness_low_${Date.now()}`,
      userId,
      priority: RecommendationPriority.STRATEGIC,
      type: RecommendationType.EXAM_READINESS,
      title: `You Need ${weeksNeeded}+ Weeks to Be Exam-Ready`,
      description: `At your current study pace, you'll be exam-ready in ${weeksNeeded} weeks. Focus on weak domains: ${Object.values(context.domainStatuses)
        .filter(d => d.priority === 'high' || d.priority === 'critical')
        .map(d => d.domainName)
        .join(', ')}.`,
      action: {
        type: 'show_modal',
        target: 'study_plan',
      },
      reasoning: `Readiness at ${context.estimatedReadinessPercentage}%, estimated ${weeksNeeded} weeks needed`,
      confidence: 75,
      importance: 8,
      dismissible: true,
      createdAt: now,
    });
  } else if (context.estimatedReadinessPercentage >= 80) {
    const weakDomains = Object.values(context.domainStatuses)
      .filter(d => d.readinessPercentage < 85)
      .map(d => d.domainName);

    if (weakDomains.length > 0) {
      recommendations.push({
        id: `rec_exam_readiness_high_${Date.now()}`,
        userId,
        priority: RecommendationPriority.MAINTENANCE,
        type: RecommendationType.EXAM_READINESS,
        title: 'You\'re Exam-Ready - Polish Weak Spots',
        description: `You're ${context.estimatedReadinessPercentage}% ready! Polish these weak domains: ${weakDomains.join(', ')}.`,
        action: {
          type: 'show_modal',
          target: 'final_prep',
        },
        reasoning: `High readiness (${context.estimatedReadinessPercentage}%), final polish needed`,
        confidence: 88,
        importance: 6,
        dismissible: true,
        createdAt: now,
      });
    }
  }

  return recommendations;
}

/**
 * Optional maintenance recommendations
 *
 * Low-priority recommendations that are helpful but not urgent
 * - "Do another bank burn on domain X"
 * - "Try a trap drill to master tricky patterns"
 *
 * @returns Optional maintenance recommendations (maintenance priority)
 */
export function checkMaintenanceRecommendations(
  userId: string,
  context: LearningContext,
  now: Date
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Suggest bank burn for domains that are 70-85% ready (good for reinforcement)
  Object.values(context.domainStatuses).forEach(domain => {
    if (
      domain.readinessPercentage >= 70 &&
      domain.readinessPercentage < 85 &&
      domain.baselineStatus !== 'NOT_STARTED'
    ) {
      recommendations.push({
        id: `rec_bank_burn_${domain.domainId}_${Date.now()}`,
        userId,
        priority: RecommendationPriority.MAINTENANCE,
        type: RecommendationType.BANK_BURN,
        title: `Optional: Deep Dive ${domain.domainName} with Bank Burn`,
        description: `Want to reinforce your ${domain.domainName} knowledge? Bank burn 20-30 questions to solidify weak patterns.`,
        action: {
          type: 'start_activity',
          target: 'bank_burn',
          params: { domainId: domain.domainId },
        },
        reasoning: `${domain.readinessPercentage}% readiness, bank burn helps lock in knowledge`,
        confidence: 70,
        importance: 4,
        dismissible: true,
        createdAt: now,
      });
    }

    // Suggest trap drill for weak areas
    if (domain.weakAreas.length > 0 && domain.weakAreas.length <= 3) {
      recommendations.push({
        id: `rec_trap_drill_${domain.domainId}_${Date.now()}`,
        userId,
        priority: RecommendationPriority.MAINTENANCE,
        type: RecommendationType.TRAP_DRILL,
        title: `Master ${domain.domainName} Trap Questions`,
        description: `These ${domain.domainName} concepts trip up test-takers. Do a trap drill to master the patterns.`,
        action: {
          type: 'start_activity',
          target: 'trap_drill',
          params: { domainId: domain.domainId, weakAreas: domain.weakAreas },
        },
        reasoning: `${domain.weakAreas.length} weak areas remain, trap drill targets tricky patterns`,
        confidence: 75,
        importance: 5,
        dismissible: true,
        createdAt: now,
      });
    }
  });

  return recommendations;
}
