/**
 * Domain Pass Prerequisites (Phase 2)
 *
 * Handles logic for:
 * - Checking if user is ready for domain pass based on baseline status
 * - Calculating readiness score (0-100)
 * - Providing user-friendly readiness messages
 * - Gating domain pass behind prerequisites
 */

export interface ReadinessCheckResult {
  canTakeDomainPass: boolean;
  readinessScore: number; // 0-100
  message: string; // User-friendly message
  requirementsMet: {
    baselineTaken: boolean;
    weakAreasFocused: boolean;
    testedOut: boolean;
  };
  missingRequirements: string[]; // What user needs to do next
  timeRecommendation?: string; // e.g., "Ready now" or "Come back in 5 days"
}

/**
 * Check if user is ready to take domain pass
 *
 * Rules:
 * 1. Must have taken baseline (any score)
 * 2. If baseline < 80%, must have weak-area retake >= 80%
 * 3. If baseline >= 80%, can proceed (but test-out preferred first)
 * 4. Must have tested out baseline (or have >= 80% baseline/retake)
 *
 * Returns: ReadinessCheckResult
 */
export function checkDomainPassReadiness(
  baselineScore: number | null,
  baselineAttemptDate: Date | null,
  bestRetakeScore: number | null,
  bestRetakeAttemptDate: Date | null,
  testedOut: boolean,
  weakAreaAttemptCount: number
): ReadinessCheckResult {
  const requirementsMet = {
    baselineTaken: baselineScore !== null && baselineAttemptDate !== null,
    weakAreasFocused: false,
    testedOut: testedOut,
  };

  const missingRequirements: string[] = [];
  let readinessScore = 0;

  // Requirement 1: Baseline taken
  if (!requirementsMet.baselineTaken) {
    missingRequirements.push('Take domain baseline');
    return {
      canTakeDomainPass: false,
      readinessScore: 0,
      message: 'Take the domain baseline first to assess your readiness.',
      requirementsMet,
      missingRequirements,
    };
  }

  readinessScore += 40; // Baseline taken = 40 points

  // Requirement 2: If baseline < 80%, need weak-area focus
  if (baselineScore! < 80) {
    if (bestRetakeScore === null || bestRetakeScore < 80 || weakAreaAttemptCount === 0) {
      missingRequirements.push('Master weak areas in domain baseline');
      return {
        canTakeDomainPass: false,
        readinessScore,
        message:
          'Complete at least one weak-area retake with 80%+ to prepare for domain pass.',
        requirementsMet,
        missingRequirements,
        timeRecommendation: '3-5 days of focused study',
      };
    }

    // Weak areas addressed
    requirementsMet.weakAreasFocused = true;
    readinessScore += 30; // Weak areas fixed = +30 points
  } else {
    // Baseline >= 80%, weak areas already good
    requirementsMet.weakAreasFocused = true;
    readinessScore += 30;
  }

  // Requirement 3: Prefer test-out but not strictly required
  if (testedOut) {
    requirementsMet.testedOut = true;
    readinessScore += 30; // Test-out = +30 points
  } else {
    // Not tested out yet, but not a blocker if baseline >= 80%
    readinessScore += 10; // Partial credit
  }

  // Ready to take domain pass
  return {
    canTakeDomainPass: true,
    readinessScore: Math.min(readinessScore, 100),
    message: 'You\'re ready to take the domain pass. Good luck!',
    requirementsMet,
    missingRequirements: [],
    timeRecommendation: 'Ready now',
  };
}

/**
 * Get a more detailed readiness message with guidance
 *
 * Returns: string (multi-line user guidance)
 */
export function getDomainPassReadinessMessage(result: ReadinessCheckResult): string {
  if (result.canTakeDomainPass) {
    return `✓ You're ready to take the domain pass!\n\nYour preparation:\n✓ Baseline completed\n✓ Weak areas addressed\n${
      result.requirementsMet.testedOut ? '✓ Tested out of baseline' : '⚠ Consider testing out of baseline first'
    }\n\nTime recommendation: ${result.timeRecommendation || 'Ready now'}`;
  }

  if (result.missingRequirements.length > 0) {
    const requirements = result.missingRequirements.map(r => `• ${r}`).join('\n');
    return `You're not quite ready yet:\n\n${requirements}\n\nTime recommendation: ${
      result.timeRecommendation || 'Come back when ready'
    }`;
  }

  return 'Please complete your domain baseline first.';
}

/**
 * Gate function - returns true if user can take domain pass
 *
 * Used to conditionally show/hide domain pass CTA
 *
 * Returns: boolean
 */
export function canTakeDomainPass(
  baselineScore: number | null,
  baselineAttemptDate: Date | null,
  bestRetakeScore: number | null,
  bestRetakeAttemptDate: Date | null,
  testedOut: boolean,
  weakAreaAttemptCount: number
): boolean {
  const result = checkDomainPassReadiness(
    baselineScore,
    baselineAttemptDate,
    bestRetakeScore,
    bestRetakeAttemptDate,
    testedOut,
    weakAreaAttemptCount
  );

  return result.canTakeDomainPass;
}

/**
 * Calculate time since baseline was completed
 *
 * Used to determine if user has had time to study weak areas
 *
 * Returns: number (days)
 */
export function daysSinceBaseline(baselineAttemptDate: Date | null): number {
  if (!baselineAttemptDate) {
    return -1;
  }

  const now = new Date();
  const daysSinceAttempt = Math.floor(
    (now.getTime() - baselineAttemptDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceAttempt;
}

/**
 * Calculate time since last weak-area attempt
 *
 * Used to determine if enough study time has passed for second domain pass
 *
 * Returns: number (days)
 */
export function daysSinceLastWeakAreaAttempt(bestRetakeAttemptDate: Date | null): number {
  if (!bestRetakeAttemptDate) {
    return -1;
  }

  const now = new Date();
  const daysSinceAttempt = Math.floor(
    (now.getTime() - bestRetakeAttemptDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceAttempt;
}

/**
 * Get recommended wait time before next domain pass
 *
 * Rules:
 * - If first attempt < 60%: 7 days (study more)
 * - If first attempt 60-70%: 5 days (moderate study)
 * - If first attempt 70-85%: 3 days (light study)
 * - If first attempt 85%+: 1 day (ready to retake)
 *
 * Returns: number (days to wait)
 */
export function getRecommendedWaitDays(firstAttemptScore: number): number {
  if (firstAttemptScore < 60) {
    return 7;
  }
  if (firstAttemptScore < 70) {
    return 5;
  }
  if (firstAttemptScore < 85) {
    return 3;
  }
  return 1;
}

/**
 * Get next recommended domain pass date
 *
 * Returns: Date
 */
export function getNextRecommendedDomainPassDate(
  lastAttemptDate: Date | null,
  lastAttemptScore: number | null
): Date {
  if (!lastAttemptDate || lastAttemptScore === null) {
    return new Date(); // Ready now
  }

  const waitDays = getRecommendedWaitDays(lastAttemptScore);
  const nextDate = new Date(lastAttemptDate);
  nextDate.setDate(nextDate.getDate() + waitDays);

  return nextDate;
}

/**
 * Check if enough time has passed since last attempt
 *
 * Returns: boolean
 */
export function isReadyForNextAttempt(
  lastAttemptDate: Date | null,
  lastAttemptScore: number | null
): boolean {
  if (!lastAttemptDate || lastAttemptScore === null) {
    return true;
  }

  const nextDate = getNextRecommendedDomainPassDate(lastAttemptDate, lastAttemptScore);
  return new Date() >= nextDate;
}
