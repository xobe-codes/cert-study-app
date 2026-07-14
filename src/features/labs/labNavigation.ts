/**
 * Lab Navigation (Phase 3)
 *
 * Handles logic for:
 * - Moving between labs within a domain
 * - Enforcing that users complete current lab before moving to next
 * - Calculating previous/next lab in sequence
 * - Managing lab navigation state
 */

export interface LabNavigationState {
  currentLabId: string;
  domainId: string;
  canNavigateNext: boolean;
  canNavigatePrevious: boolean;
  nextLabId: string | null;
  previousLabId: string | null;
  isFirstLab: boolean;
  isLastLab: boolean;
  labPosition: number; // e.g., 1 of 3
  totalLabsInDomain: number;
}

/**
 * Get next lab in the domain sequence
 *
 * Returns: {labId: string | null, isLast: boolean}
 */
export function getNextLab(
  currentLabId: string,
  domainId: string,
  allLabsInDomain: string[] // Ordered list of lab IDs in domain
): { labId: string | null; isLast: boolean } {
  const currentIndex = allLabsInDomain.findIndex(id => id === currentLabId);

  if (currentIndex === -1 || currentIndex === allLabsInDomain.length - 1) {
    // Already on last lab or lab not found
    return { labId: null, isLast: true };
  }

  const nextIndex = currentIndex + 1;
  const isLast = nextIndex === allLabsInDomain.length - 1;

  return {
    labId: allLabsInDomain[nextIndex],
    isLast,
  };
}

/**
 * Get previous lab in the domain sequence
 *
 * Returns: {labId: string | null, isFirst: boolean}
 */
export function getPreviousLab(
  currentLabId: string,
  domainId: string,
  allLabsInDomain: string[] // Ordered list of lab IDs in domain
): { labId: string | null; isFirst: boolean } {
  const currentIndex = allLabsInDomain.findIndex(id => id === currentLabId);

  if (currentIndex <= 0) {
    // Already on first lab or lab not found
    return { labId: null, isFirst: true };
  }

  const prevIndex = currentIndex - 1;
  const isFirst = prevIndex === 0;

  return {
    labId: allLabsInDomain[prevIndex],
    isFirst,
  };
}

/**
 * Check if user can navigate to next lab
 *
 * Rules:
 * - Must be on a lab in the same domain
 * - Current lab must be completed
 * - Must not be on last lab
 *
 * Returns: boolean
 */
export function canNavigateToNextLab(
  currentLabId: string,
  currentLabCompleted: boolean,
  domainId: string,
  allLabsInDomain: string[]
): boolean {
  // Must be completed to move next
  if (!currentLabCompleted) {
    return false;
  }

  // Must not be on last lab
  const currentIndex = allLabsInDomain.findIndex(id => id === currentLabId);
  if (currentIndex === -1 || currentIndex === allLabsInDomain.length - 1) {
    return false;
  }

  return true;
}

/**
 * Check if user can navigate to previous lab
 *
 * Rules:
 * - Must be on a lab in the same domain
 * - Must not be on first lab
 * - Can always go back (even if current not completed)
 *
 * Returns: boolean
 */
export function canNavigateToPreviousLab(
  currentLabId: string,
  allLabsInDomain: string[]
): boolean {
  const currentIndex = allLabsInDomain.findIndex(id => id === currentLabId);

  // Must not be on first lab
  if (currentIndex <= 0) {
    return false;
  }

  return true;
}

/**
 * Get navigation state for current lab
 *
 * Returns: LabNavigationState
 */
export function getLabNavigationState(
  currentLabId: string,
  domainId: string,
  currentLabCompleted: boolean,
  allLabsInDomain: string[]
): LabNavigationState {
  const currentIndex = allLabsInDomain.findIndex(id => id === currentLabId);
  const nextResult = getNextLab(currentLabId, domainId, allLabsInDomain);
  const prevResult = getPreviousLab(currentLabId, domainId, allLabsInDomain);

  const canNext = canNavigateToNextLab(currentLabId, currentLabCompleted, domainId, allLabsInDomain);
  const canPrev = canNavigateToPreviousLab(currentLabId, allLabsInDomain);

  return {
    currentLabId,
    domainId,
    canNavigateNext: canNext,
    canNavigatePrevious: canPrev,
    nextLabId: nextResult.labId,
    previousLabId: prevResult.labId,
    isFirstLab: currentIndex === 0,
    isLastLab: currentIndex === allLabsInDomain.length - 1,
    labPosition: currentIndex + 1,
    totalLabsInDomain: allLabsInDomain.length,
  };
}

/**
 * Get navigation buttons state
 *
 * Returns: {nextButtonLabel: string, previousButtonLabel: string, ...}
 */
export function getNavigationButtonsState(
  navigationState: LabNavigationState
): {
  nextButtonLabel: string;
  nextButtonEnabled: boolean;
  nextButtonAction: string | null;
  previousButtonLabel: string;
  previousButtonEnabled: boolean;
  previousButtonAction: string | null;
  progressLabel: string;
} {
  let nextLabel = 'Next Lab';
  let nextAction = navigationState.nextLabId;

  if (navigationState.isLastLab) {
    nextLabel = 'View All Labs';
    nextAction = null; // Different action
  }

  if (!navigationState.canNavigateNext) {
    nextLabel = 'Complete lab to continue';
    nextAction = null;
  }

  return {
    nextButtonLabel: nextLabel,
    nextButtonEnabled: navigationState.canNavigateNext,
    nextButtonAction: nextAction,
    previousButtonLabel: 'Previous Lab',
    previousButtonEnabled: navigationState.canNavigatePrevious,
    previousButtonAction: navigationState.previousLabId,
    progressLabel: `${navigationState.labPosition} of ${navigationState.totalLabsInDomain}`,
  };
}

/**
 * Calculate lab sequence order from lab IDs
 *
 * Assumes lab IDs follow pattern like "4.1", "4.2", "4.3", etc.
 *
 * Returns: string[] (sorted)
 */
export function getLabSequenceOrder(labIds: string[]): string[] {
  return labIds.sort((a, b) => {
    // Split by "." to handle 4.1 vs 4.2 etc
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aNum = aParts[i] || 0;
      const bNum = bParts[i] || 0;

      if (aNum !== bNum) {
        return aNum - bNum;
      }
    }

    return 0;
  });
}

/**
 * Format navigation message for user
 *
 * Returns: string
 */
export function getNavigationMessage(navigationState: LabNavigationState, currentLabCompleted: boolean): string {
  if (!currentLabCompleted) {
    return `Complete this lab to unlock the next one (${navigationState.labPosition} of ${navigationState.totalLabsInDomain})`;
  }

  if (navigationState.isLastLab) {
    return `You've completed the last lab in this domain! (${navigationState.labPosition} of ${navigationState.totalLabsInDomain})`;
  }

  return `Ready to move to the next lab? (${navigationState.labPosition} of ${navigationState.totalLabsInDomain})`;
}

/**
 * Validate navigation request
 *
 * Returns: {isValid: boolean, reason?: string}
 */
export function validateNavigation(
  navigationState: LabNavigationState,
  targetLabId: string,
  direction: 'next' | 'previous'
): { isValid: boolean; reason?: string } {
  if (direction === 'next') {
    if (!navigationState.canNavigateNext) {
      return { isValid: false, reason: 'Complete current lab first' };
    }

    if (navigationState.nextLabId !== targetLabId) {
      return { isValid: false, reason: 'Invalid next lab' };
    }
  } else if (direction === 'previous') {
    if (!navigationState.canNavigatePrevious) {
      return { isValid: false, reason: 'Cannot go back further' };
    }

    if (navigationState.previousLabId !== targetLabId) {
      return { isValid: false, reason: 'Invalid previous lab' };
    }
  }

  return { isValid: true };
}
