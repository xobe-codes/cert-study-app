/**
 * Mastery Certification (Phase 2)
 *
 * Handles logic for:
 * - Issuing domain mastery certificates after passing domain pass
 * - Tracking certification status and expiry (30 days)
 * - Refreshing/renewing certifications
 * - Determining mastery levels (single attempt vs dual attempt)
 */

export enum MasteryLevel {
  SINGLE_ATTEMPT = 'single_attempt', // Passed with 95%+ on attempt 1
  DUAL_ATTEMPT = 'dual_attempt', // Passed with 2 attempts
  PROVISIONAL = 'provisional', // Passed but needs confirmation
}

export enum CertificationStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  REFRESHED = 'refreshed',
}

export interface DomainMasteryCertificate {
  id: string;
  userId: string;
  domainId: string;

  // Certification details
  certifiedDate: Date;
  expiryDate: Date; // 30 days from certification
  masteryLevel: MasteryLevel;
  status: CertificationStatus;

  // Attempt history
  firstAttemptScore: number;
  firstAttemptDate: Date;
  secondAttemptScore?: number;
  secondAttemptDate?: Date;

  // Maintenance
  lastRefreshDate?: Date;
  refreshCount: number;

  // Metadata
  issuedBy?: string; // e.g., "system", "admin"
  notes?: string;
}

/**
 * Issue a domain mastery certificate after domain pass
 *
 * Rules for mastery level:
 * - 95%+ on attempt 1: SINGLE_ATTEMPT mastery (certified immediately)
 * - 85-94% on attempt 1: PROVISIONAL (needs attempt 2)
 * - 70-84% on attempt 1: PROVISIONAL (needs attempt 2)
 * - <70% on attempt 1: Not eligible, keep studying
 *
 * Rules for dual-attempt mastery:
 * - Attempt 1: 70-84%, Attempt 2: 80%+: DUAL_ATTEMPT mastery
 * - Attempt 1: 85-94%, Attempt 2: any: DUAL_ATTEMPT mastery
 *
 * Returns: DomainMasteryCertificate | null
 */
export function issueDomaincertificate(
  domainId: string,
  userId: string,
  firstAttemptScore: number,
  firstAttemptDate: Date,
  secondAttemptScore?: number,
  secondAttemptDate?: Date
): DomainMasteryCertificate | null {
  // Single attempt certification (95%+ on first try)
  if (firstAttemptScore >= 95 && secondAttemptScore === undefined) {
    const expiryDate = new Date(firstAttemptDate);
    expiryDate.setDate(expiryDate.getDate() + 30);

    return {
      id: `cert_${userId}_${domainId}_${firstAttemptDate.getTime()}`,
      userId,
      domainId,
      certifiedDate: firstAttemptDate,
      expiryDate,
      masteryLevel: MasteryLevel.SINGLE_ATTEMPT,
      status: CertificationStatus.ACTIVE,
      firstAttemptScore,
      firstAttemptDate,
      refreshCount: 0,
    };
  }

  // Dual attempt certification
  if (secondAttemptScore !== undefined && secondAttemptDate !== undefined) {
    // Both attempts must be passing (70%+)
    if (firstAttemptScore >= 70 && secondAttemptScore >= 70) {
      const expiryDate = new Date(secondAttemptDate);
      expiryDate.setDate(expiryDate.getDate() + 30);

      return {
        id: `cert_${userId}_${domainId}_${secondAttemptDate.getTime()}`,
        userId,
        domainId,
        certifiedDate: secondAttemptDate,
        expiryDate,
        masteryLevel: MasteryLevel.DUAL_ATTEMPT,
        status: CertificationStatus.ACTIVE,
        firstAttemptScore,
        firstAttemptDate,
        secondAttemptScore,
        secondAttemptDate,
        refreshCount: 0,
      };
    }
  }

  // Not eligible for certification yet
  return null;
}

/**
 * Get certification status for a domain
 *
 * Returns: {status: CertificationStatus, daysUntilExpiry: number}
 */
export function getDomainCertificationStatus(
  certificate: DomainMasteryCertificate | null
): {
  status: CertificationStatus;
  daysUntilExpiry: number;
  isValid: boolean;
} {
  if (!certificate) {
    return {
      status: CertificationStatus.EXPIRED,
      daysUntilExpiry: -1,
      isValid: false,
    };
  }

  const now = new Date();
  const expiryTime = certificate.expiryDate.getTime();
  const nowTime = now.getTime();

  if (nowTime > expiryTime) {
    return {
      status: CertificationStatus.EXPIRED,
      daysUntilExpiry: -1,
      isValid: false,
    };
  }

  const daysMs = 1000 * 60 * 60 * 24;
  const daysRemaining = Math.ceil((expiryTime - nowTime) / daysMs);

  return {
    status: certificate.status,
    daysUntilExpiry: daysRemaining,
    isValid: certificate.status === CertificationStatus.ACTIVE,
  };
}

/**
 * Renew/refresh a certification (extends expiry to +30 days)
 *
 * Returns: DomainMasteryCertificate (updated)
 */
export function renewCertification(
  certificate: DomainMasteryCertificate,
  refreshDate: Date = new Date()
): DomainMasteryCertificate {
  const newExpiry = new Date(refreshDate);
  newExpiry.setDate(newExpiry.getDate() + 30);

  return {
    ...certificate,
    status: CertificationStatus.REFRESHED,
    lastRefreshDate: refreshDate,
    refreshCount: certificate.refreshCount + 1,
    expiryDate: newExpiry,
  };
}

/**
 * Check if certification is expiring soon (< 7 days)
 *
 * Returns: boolean
 */
export function isCertificationExpiringSoon(certificate: DomainMasteryCertificate): boolean {
  const now = new Date();
  const daysUntilExpiry = Math.floor(
    (certificate.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
}

/**
 * Determine if attempt 2 was necessary for certification
 *
 * Returns: boolean (true if second attempt was required and completed)
 */
export function wasSecondAttemptNecessary(
  firstAttemptScore: number,
  secondAttemptScore?: number
): boolean {
  // If first attempt >= 95%, second attempt not necessary
  if (firstAttemptScore >= 95) {
    return false;
  }

  // If first attempt 70-94% and second attempt taken, it was necessary
  if (firstAttemptScore >= 70 && secondAttemptScore !== undefined) {
    return true;
  }

  // First attempt < 70%, second attempt would be necessary
  return firstAttemptScore < 70 && secondAttemptScore !== undefined;
}

/**
 * Get certification progress message
 *
 * Returns: string
 */
export function getCertificationProgressMessage(
  firstAttemptScore: number,
  secondAttemptScore?: number
): string {
  if (firstAttemptScore >= 95) {
    return `✓ CERTIFIED! Mastered on first attempt with ${firstAttemptScore}%.`;
  }

  if (secondAttemptScore !== undefined) {
    if (secondAttemptScore >= firstAttemptScore) {
      return `✓ CERTIFIED! Improved from ${firstAttemptScore}% to ${secondAttemptScore}% on second attempt.`;
    } else {
      return `✓ CERTIFIED! Confirmed mastery: Attempt 1: ${firstAttemptScore}%, Attempt 2: ${secondAttemptScore}%.`;
    }
  }

  if (firstAttemptScore >= 85) {
    return `✓ CERTIFIED! Strong pass on first attempt. Ready for domain mastery.`;
  }

  if (firstAttemptScore >= 70) {
    return `Solid pass (${firstAttemptScore}%). One more attempt recommended to confirm mastery.`;
  }

  return `Score ${firstAttemptScore}% needs improvement. Focus on weak areas and try again.`;
}

/**
 * Format certification details for display
 *
 * Returns: object with formatted strings
 */
export function formatCertificateForDisplay(
  certificate: DomainMasteryCertificate
): {
  title: string;
  masteryLevel: string;
  scores: string;
  validity: string;
  expiryMessage: string;
} {
  const masteryText =
    certificate.masteryLevel === MasteryLevel.SINGLE_ATTEMPT
      ? 'Single-Attempt Mastery'
      : 'Dual-Attempt Mastery';

  const scores =
    certificate.secondAttemptScore !== undefined
      ? `Attempt 1: ${certificate.firstAttemptScore}%, Attempt 2: ${certificate.secondAttemptScore}%`
      : `Single Attempt: ${certificate.firstAttemptScore}%`;

  const now = new Date();
  const isExpired = now > certificate.expiryDate;
  const daysRemaining = Math.ceil(
    (certificate.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const validity = isExpired ? 'EXPIRED' : `${daysRemaining} days remaining`;

  const expiryMessage = isExpired
    ? 'Refresh or retake to maintain certification'
    : `Expires ${certificate.expiryDate.toLocaleDateString()}`;

  return {
    title: `${certificate.domainId} - Domain Mastery Certificate`,
    masteryLevel: masteryText,
    scores,
    validity,
    expiryMessage,
  };
}

/**
 * Calculate certification completion percentage (for progress bar)
 *
 * Rules:
 * - After attempt 1 >= 70%: 50% complete
 * - After attempt 2 >= 70%: 100% complete
 * - After single attempt >= 95%: 100% complete
 *
 * Returns: number (0-100)
 */
export function calculateCertificationProgress(
  firstAttemptScore: number,
  secondAttemptScore?: number
): number {
  if (firstAttemptScore >= 95) {
    return 100; // Single attempt mastery
  }

  if (firstAttemptScore >= 70) {
    if (secondAttemptScore !== undefined && secondAttemptScore >= 70) {
      return 100; // Dual attempt mastery
    }
    return 50; // One passing attempt, needs second
  }

  // Below 70%, not on track
  return Math.min(Math.round((firstAttemptScore / 70) * 50), 49); // Max 49% if below 70%
}
