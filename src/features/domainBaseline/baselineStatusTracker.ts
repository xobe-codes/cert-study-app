/**
 * Baseline Status Tracker (Phase 1)
 *
 * Tracks the progression state of a domain baseline:
 * NOT_STARTED → BASELINE_PENDING → WEAK_AREA_FOCUS → READY_FOR_TEST_OUT → TESTED_OUT
 *
 * Provides functions to:
 * - Get current baseline status
 * - Transition states
 * - Calculate progress to test-out
 * - Determine next action
 */

export enum BaselineStatus {
  NOT_STARTED = 'NOT_STARTED',
  BASELINE_PENDING = 'BASELINE_PENDING', // Took baseline, waiting to retry or focus
  WEAK_AREA_FOCUS = 'WEAK_AREA_FOCUS', // Working on weak areas
  READY_FOR_TEST_OUT = 'READY_FOR_TEST_OUT', // Passed weak areas, can test out
  TESTED_OUT = 'TESTED_OUT', // Tested out, mastery achieved
  STALE = 'STALE', // 60+ days without refresh
}

export interface BaselineStatusData {
  domainId: string;
  userId: string;
  status: BaselineStatus;
  baselineScore: number | null;
  baselineAttemptDate: Date | null;
  bestRetakeScore: number | null;
  bestRetakeAttemptDate: Date | null;
  weakAreaAttemptCount: number;
  testedOutDate: Date | null;
  nextRefreshDate: Date | null;
  progressToTestOut: number; // 0-100
}

/**
 * Determine baseline status from domain state and history
 *
 * Logic:
 * - If no baseline: NOT_STARTED
 * - If baseline < 80%: BASELINE_PENDING
 * - If weak-area retake in progress or just started: WEAK_AREA_FOCUS
 * - If weak-area retake >= 80% and not tested out: READY_FOR_TEST_OUT
 * - If tested out: TESTED_OUT
 * - If tested out but > 60 days no refresh: STALE
 *
 * Returns: BaselineStatus
 */
export function determineBaselineStatus(
  domainId: string,
  userId: string,
  baselineScore: number | null,
  baselineAttemptDate: Date | null,
  bestRetakeScore: number | null,
  bestRetakeAttemptDate: Date | null,
  weakAreaAttemptCount: number,
  testedOutDate: Date | null,
  lastRefreshDate: Date | null
): BaselineStatus {
  // Not started
  if (baselineScore === null || baselineAttemptDate === null) {
    return BaselineStatus.NOT_STARTED;
  }

  // Already tested out
  if (testedOutDate !== null) {
    // Check if stale (60+ days without refresh)
    const lastActivityDate = lastRefreshDate || testedOutDate;
    const daysSinceActivity = Math.floor(
      (new Date().getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceActivity >= 60) {
      return BaselineStatus.STALE;
    }

    return BaselineStatus.TESTED_OUT;
  }

  // Baseline was < 80%, need weak-area focus
  if (baselineScore < 80) {
    // If weak-area retake >= 80%, ready to test out
    if (bestRetakeScore !== null && bestRetakeScore >= 80 && weakAreaAttemptCount >= 1) {
      return BaselineStatus.READY_FOR_TEST_OUT;
    }

    // Otherwise, in weak-area focus phase
    return BaselineStatus.WEAK_AREA_FOCUS;
  }

  // Baseline was >= 80%, ready to test out
  return BaselineStatus.READY_FOR_TEST_OUT;
}

/**
 * Get baseline status with detailed progress info
 *
 * Returns: BaselineStatusData
 */
export function getBaselineStatus(
  domainId: string,
  userId: string,
  baselineScore: number | null,
  baselineAttemptDate: Date | null,
  bestRetakeScore: number | null,
  bestRetakeAttemptDate: Date | null,
  weakAreaAttemptCount: number,
  testedOutDate: Date | null,
  nextRefreshDate: Date | null,
  progressToTestOut: number = 0
): BaselineStatusData {
  const status = determineBaselineStatus(
    domainId,
    userId,
    baselineScore,
    baselineAttemptDate,
    bestRetakeScore,
    bestRetakeAttemptDate,
    weakAreaAttemptCount,
    testedOutDate,
    nextRefreshDate
  );

  return {
    domainId,
    userId,
    status,
    baselineScore,
    baselineAttemptDate,
    bestRetakeScore,
    bestRetakeAttemptDate,
    weakAreaAttemptCount,
    testedOutDate,
    nextRefreshDate,
    progressToTestOut,
  };
}

/**
 * Calculate progress to test-out as a percentage (0-100)
 *
 * Logic:
 * - If baseline >= 80%: 100% (ready to test out)
 * - If baseline < 80% but no retakes yet: 0%
 * - If retake < 80%: (retakeScore / 80) * 100, capped at 99%
 * - If retake >= 80%: 100% (ready to test out)
 *
 * Returns: number (0-100)
 */
export function getProgressToTestOut(
  baselineScore: number | null,
  bestRetakeScore: number | null
): number {
  // Not started
  if (baselineScore === null) {
    return 0;
  }

  // Baseline >= 80%, already ready
  if (baselineScore >= 80) {
    return 100;
  }

  // Baseline < 80%, check retakes
  if (bestRetakeScore === null) {
    return 0; // No retakes yet
  }

  if (bestRetakeScore >= 80) {
    return 100; // Ready to test out
  }

  // Partial progress based on retake score
  const progress = Math.round((bestRetakeScore / 80) * 100);
  return Math.min(progress, 99); // Cap at 99% so not at 100% yet
}

/**
 * Get human-readable status message
 *
 * Returns: string
 */
export function getBaselineStatusMessage(status: BaselineStatus): string {
  const messages: Record<BaselineStatus, string> = {
    [BaselineStatus.NOT_STARTED]: 'Not started yet',
    [BaselineStatus.BASELINE_PENDING]: 'Take initial baseline to assess readiness',
    [BaselineStatus.WEAK_AREA_FOCUS]: 'Working on weak areas to build mastery',
    [BaselineStatus.READY_FOR_TEST_OUT]: 'Ready to test out of this domain',
    [BaselineStatus.TESTED_OUT]: 'Mastered and tested out',
    [BaselineStatus.STALE]: 'Mastery certificate stale, refresh recommended',
  };

  return messages[status] || 'Unknown status';
}

/**
 * Get recommended next action based on status
 *
 * Returns: string (action identifier like "take_baseline", "retake_weak_areas", "test_out")
 */
export function getRecommendedNextAction(
  status: BaselineStatus
): 'take_baseline' | 'retake_weak_areas' | 'test_out' | 'refresh' | 're_baseline' | null {
  const actions: Record<BaselineStatus, 'take_baseline' | 'retake_weak_areas' | 'test_out' | 'refresh' | 're_baseline' | null> = {
    [BaselineStatus.NOT_STARTED]: 'take_baseline',
    [BaselineStatus.BASELINE_PENDING]: 'retake_weak_areas',
    [BaselineStatus.WEAK_AREA_FOCUS]: 'retake_weak_areas',
    [BaselineStatus.READY_FOR_TEST_OUT]: 'test_out',
    [BaselineStatus.TESTED_OUT]: null, // No action needed, optional refresh
    [BaselineStatus.STALE]: 're_baseline',
  };

  return actions[status] || null;
}

/**
 * Transition status to next state
 *
 * Encodes valid state transitions:
 * NOT_STARTED → BASELINE_PENDING
 * BASELINE_PENDING → WEAK_AREA_FOCUS (if baseline < 80%)
 * BASELINE_PENDING → READY_FOR_TEST_OUT (if baseline >= 80%)
 * WEAK_AREA_FOCUS → READY_FOR_TEST_OUT
 * READY_FOR_TEST_OUT → TESTED_OUT
 * TESTED_OUT → STALE
 *
 * Returns: BaselineStatus
 */
export function transitionStatus(currentStatus: BaselineStatus, targetStatus: BaselineStatus): BaselineStatus {
  const validTransitions: Record<BaselineStatus, BaselineStatus[]> = {
    [BaselineStatus.NOT_STARTED]: [BaselineStatus.BASELINE_PENDING],
    [BaselineStatus.BASELINE_PENDING]: [BaselineStatus.WEAK_AREA_FOCUS, BaselineStatus.READY_FOR_TEST_OUT],
    [BaselineStatus.WEAK_AREA_FOCUS]: [BaselineStatus.READY_FOR_TEST_OUT, BaselineStatus.WEAK_AREA_FOCUS], // Can retry
    [BaselineStatus.READY_FOR_TEST_OUT]: [BaselineStatus.TESTED_OUT, BaselineStatus.WEAK_AREA_FOCUS], // Can go back to retry
    [BaselineStatus.TESTED_OUT]: [BaselineStatus.STALE, BaselineStatus.TESTED_OUT], // Stays tested out unless stale
    [BaselineStatus.STALE]: [BaselineStatus.BASELINE_PENDING], // Must re-baseline
  };

  if (validTransitions[currentStatus]?.includes(targetStatus)) {
    return targetStatus;
  }

  // If invalid, return current status
  return currentStatus;
}

/**
 * Format a progress label (e.g., "3 of 5 weak areas mastered")
 *
 * Returns: string
 */
export function formatProgressLabel(
  weakAreasMastered: number,
  totalWeakAreas: number
): string {
  if (totalWeakAreas === 0) {
    return 'No weak areas identified';
  }

  return `${weakAreasMastered} of ${totalWeakAreas} weak areas mastered`;
}

/**
 * Calculate estimated days to test-out based on current progress
 *
 * Heuristic:
 * - If < 50% progress: 5-7 days (need more study)
 * - If 50-80% progress: 2-3 days (close)
 * - If 80-100% progress: 1 day (ready now)
 *
 * Returns: number (days)
 */
export function estimateDaysToTestOut(progressPercent: number): number {
  if (progressPercent < 50) {
    return 5;
  }
  if (progressPercent < 80) {
    return 2;
  }
  return 1;
}
