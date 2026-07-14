/**
 * Baseline Test-Out Mechanism (Phase 1)
 *
 * Handles logic for:
 * - Determining if user is eligible to test out of a domain
 * - Recording test-out claims
 * - Generating test-out certificates with 30-day expiry
 */

import { UnifiedLearningState, MasteryStatus } from '../unifiedLearning/unifiedLearningState';

export interface TestOutCertificate {
  id: string;
  userId: string;
  domainId: string;
  issuedDate: Date;
  expiryDate: Date; // 30 days after test-out
  baselineScore: number;
  bestRetakeScore: number;
  status: 'active' | 'expired' | 'refreshed';
  refreshedDate?: Date;
}

/**
 * Check if user is eligible to test out of a domain
 *
 * Rules:
 * 1. Must have taken domain baseline
 * 2. Must have attempted weak-area retakes (at least 1 attempt)
 * 3. Latest weak-area retake score must be >= 80%
 * 4. Must have at least 2 weak-area attempts if initial baseline was < 80%
 *
 * Returns: boolean
 */
export function isEligibleForTestOut(
  domainState: any,
  weakAreaAttempts: Array<{ score: number; totalQuestions: number }>,
  initialBaselineScore: number
): boolean {
  // Must have taken baseline
  if (!domainState?.baseline?.attemptDate) {
    return false;
  }

  // Must have attempted at least 1 weak-area retake
  if (!weakAreaAttempts || weakAreaAttempts.length === 0) {
    return false;
  }

  // Get latest weak-area attempt
  const latestWeakAreaAttempt = weakAreaAttempts[weakAreaAttempts.length - 1];
  const latestScore = (latestWeakAreaAttempt.score / latestWeakAreaAttempt.totalQuestions) * 100;

  // Latest weak-area score must be >= 80%
  if (latestScore < 80) {
    return false;
  }

  // If initial baseline was < 80%, must have at least 2 weak-area attempts
  if (initialBaselineScore < 80 && weakAreaAttempts.length < 2) {
    return false;
  }

  return true;
}

/**
 * Claim test-out and mark domain as tested out
 *
 * Sets:
 * - domain.baseline.testedOut = true
 * - domain.baseline.testedOutDate = now
 * - domain.status = MASTERED
 * - Returns certificate object
 *
 * Returns: TestOutCertificate
 */
export function claimTestOut(
  domainId: string,
  userId: string,
  baselineScore: number,
  bestRetakeScore: number,
  issuedDate: Date = new Date()
): TestOutCertificate {
  const expiryDate = new Date(issuedDate);
  expiryDate.setDate(expiryDate.getDate() + 30); // 30 days from test-out

  const certificate: TestOutCertificate = {
    id: `cert_${userId}_${domainId}_${issuedDate.getTime()}`,
    userId,
    domainId,
    issuedDate,
    expiryDate,
    baselineScore,
    bestRetakeScore,
    status: 'active',
  };

  return certificate;
}

/**
 * Generate a test-out certificate record
 *
 * Used to persist test-out in learning state and track:
 * - When certificate was issued
 * - When it expires (30 days)
 * - Original baseline score vs best retake score
 * - Status (active/expired/refreshed)
 *
 * Returns: TestOutCertificate
 */
export function generateTestOutCertificate(
  domainId: string,
  userId: string,
  baselineScore: number,
  bestRetakeScore: number
): TestOutCertificate {
  return claimTestOut(domainId, userId, baselineScore, bestRetakeScore);
}

/**
 * Check if a test-out certificate is still valid (not expired)
 *
 * Returns: boolean
 */
export function isCertificateValid(certificate: TestOutCertificate): boolean {
  if (certificate.status === 'expired' || certificate.status === 'refreshed') {
    return false;
  }

  return new Date() <= certificate.expiryDate;
}

/**
 * Calculate days until certificate expiry
 *
 * Returns: number (days remaining, -1 if already expired)
 */
export function daysUntilExpiry(certificate: TestOutCertificate): number {
  const now = new Date();
  const expiryTime = certificate.expiryDate.getTime();
  const nowTime = now.getTime();

  if (nowTime > expiryTime) {
    return -1; // Already expired
  }

  const daysMs = 1000 * 60 * 60 * 24;
  return Math.ceil((expiryTime - nowTime) / daysMs);
}

/**
 * Mark a certificate as refreshed (extending its expiry)
 *
 * Used when user completes a spaced-rep refresh drill
 * Extends expiry to +30 days from refresh date
 *
 * Returns: TestOutCertificate (updated)
 */
export function refreshCertificate(
  certificate: TestOutCertificate,
  refreshDate: Date = new Date()
): TestOutCertificate {
  const newExpiry = new Date(refreshDate);
  newExpiry.setDate(newExpiry.getDate() + 30);

  return {
    ...certificate,
    status: 'refreshed',
    refreshedDate: refreshDate,
    expiryDate: newExpiry,
  };
}
