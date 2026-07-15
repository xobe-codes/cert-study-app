/**
 * Hint System for Labs (Phase 1B)
 *
 * Provides progressive hints (3 levels) for each checkpoint
 * - Level 1: Nudge - asks probing question
 * - Level 2: Guidance - explains the concept/steps
 * - Level 3: Solution - shows exact command/syntax
 *
 * Tracks hint usage and escalates level after failed attempts
 */

export enum HintLevel {
  NONE = 0,
  LEVEL_1_NUDGE = 1,
  LEVEL_2_GUIDANCE = 2,
  LEVEL_3_SOLUTION = 3,
}

export interface HintUsageRecord {
  userId: string;
  checkpointId: string;
  level: HintLevel;
  timestamp: Date;
  attemptNumber: number; // Which attempt was this hint shown on
}

export interface HintState {
  checkpointId: string;
  currentLevel: HintLevel;
  levelUnlockedAt: number; // Timestamp when level 1 hint first shown
  usageCount: number; // Total times user requested a hint
  lastAccessedAt: Date;
}

export interface HintContent {
  level1: string;
  level2: string;
  level3: string;
  contextNote?: string; // Optional: why this step matters
}

/**
 * Get hint at specific level for a checkpoint
 */
export function getHint(hintContent: HintContent, level: HintLevel): string {
  switch (level) {
    case HintLevel.LEVEL_1_NUDGE:
      return hintContent.level1;
    case HintLevel.LEVEL_2_GUIDANCE:
      return hintContent.level2;
    case HintLevel.LEVEL_3_SOLUTION:
      return hintContent.level3;
    case HintLevel.NONE:
    default:
      return '';
  }
}

/**
 * Determine what hint level should be shown based on attempts
 * Generally: show level 1 on 2nd attempt, level 2 on 4th, level 3 on 6th
 */
export function getHintLevelForAttempts(attemptNumber: number): HintLevel {
  if (attemptNumber < 2) return HintLevel.NONE;
  if (attemptNumber < 4) return HintLevel.LEVEL_1_NUDGE;
  if (attemptNumber < 6) return HintLevel.LEVEL_2_GUIDANCE;
  return HintLevel.LEVEL_3_SOLUTION;
}

/**
 * Determine if hint should be automatically shown
 */
export function shouldShowHintAutomatically(
  attemptNumber: number,
  hintThreshold: number = 2
): boolean {
  return attemptNumber >= hintThreshold;
}

/**
 * Increment hint level when user asks for help
 */
export function incrementHintLevel(currentLevel: HintLevel): HintLevel {
  if (currentLevel === HintLevel.NONE) return HintLevel.LEVEL_1_NUDGE;
  if (currentLevel === HintLevel.LEVEL_1_NUDGE) return HintLevel.LEVEL_2_GUIDANCE;
  if (currentLevel === HintLevel.LEVEL_2_GUIDANCE) return HintLevel.LEVEL_3_SOLUTION;
  return HintLevel.LEVEL_3_SOLUTION; // Max level
}

/**
 * Initialize hint state for a checkpoint
 */
export function initializeHintState(checkpointId: string): HintState {
  return {
    checkpointId,
    currentLevel: HintLevel.NONE,
    levelUnlockedAt: 0,
    usageCount: 0,
    lastAccessedAt: new Date(),
  };
}

/**
 * Update hint state when hint is accessed
 */
export function updateHintState(
  state: HintState,
  newLevel: HintLevel
): HintState {
  return {
    ...state,
    currentLevel: newLevel,
    levelUnlockedAt: state.levelUnlockedAt === 0 ? Date.now() : state.levelUnlockedAt,
    usageCount: state.usageCount + 1,
    lastAccessedAt: new Date(),
  };
}

/**
 * Track hint usage for analytics
 */
export function recordHintUsage(
  userId: string,
  checkpointId: string,
  level: HintLevel,
  attemptNumber: number
): HintUsageRecord {
  return {
    userId,
    checkpointId,
    level,
    timestamp: new Date(),
    attemptNumber,
  };
}

/**
 * Determine if user is hint-dependent
 * (requested hints too frequently = might be concept confusion)
 */
export function isHintDependent(
  usageRecords: HintUsageRecord[],
  maxHintsPerCheckpoint: number = 3
): boolean {
  const uniqueCheckpoints = new Set(usageRecords.map((r) => r.checkpointId));
  for (const checkpointId of uniqueCheckpoints) {
    const hintsForCheckpoint = usageRecords.filter(
      (r) => r.checkpointId === checkpointId
    );
    if (hintsForCheckpoint.length > maxHintsPerCheckpoint) {
      return true;
    }
  }
  return false;
}

/**
 * Get hint escalation recommendation based on attempt count
 * Used to show hints automatically after X failures
 */
export function getHintEscalation(attemptNumber: number): {
  shouldShow: boolean;
  level: HintLevel;
  message: string;
} {
  if (attemptNumber === 2) {
    return {
      shouldShow: true,
      level: HintLevel.LEVEL_1_NUDGE,
      message: "Need help? Here's a nudge...",
    };
  }
  if (attemptNumber === 4) {
    return {
      shouldShow: true,
      level: HintLevel.LEVEL_2_GUIDANCE,
      message: 'Still stuck? Here\'s more guidance...',
    };
  }
  if (attemptNumber === 6) {
    return {
      shouldShow: true,
      level: HintLevel.LEVEL_3_SOLUTION,
      message: "Here's the exact command to run:",
    };
  }
  return {
    shouldShow: false,
    level: HintLevel.NONE,
    message: '',
  };
}

/**
 * Calculate hint effectiveness score
 * (Did they solve checkpoint quickly after getting hint?)
 */
export function calculateHintEffectiveness(
  attemptsBeforeHint: number,
  attemptsAfterHint: number,
  hintLevel: HintLevel
): number {
  // If they solved within 2 attempts of getting hint, it was effective
  if (attemptsAfterHint <= 2) {
    return Math.min(1.0, 1.0 - (hintLevel * 0.1)); // Lower level = more effective
  }
  // If they needed many attempts after hint, it was less effective
  return Math.max(0, 0.5 - (attemptsAfterHint * 0.1));
}

/**
 * Get next recommended action for stuck user
 */
export function getNextHintAction(
  currentLevel: HintLevel,
  attemptNumber: number,
  hintsUsed: number
): {
  action: 'show_hint' | 'encourage' | 'escalate' | 'offer_solution';
  level?: HintLevel;
  message: string;
} {
  if (hintsUsed >= 3 && currentLevel === HintLevel.LEVEL_3_SOLUTION) {
    return {
      action: 'offer_solution',
      message:
        "You've tried many times. Would you like to see the exact solution and move on?",
    };
  }

  if (currentLevel === HintLevel.LEVEL_3_SOLUTION && attemptNumber > 8) {
    return {
      action: 'escalate',
      message:
        "This step is challenging. Consider: 1) Review the concept, 2) Take a break, 3) Try a simpler lab first",
    };
  }

  if (currentLevel < HintLevel.LEVEL_3_SOLUTION) {
    return {
      action: 'show_hint',
      level: incrementHintLevel(currentLevel),
      message: 'Want a better hint?',
    };
  }

  return {
    action: 'encourage',
    message: "You're close! Try looking at the hint again and give it one more go.",
  };
}

/**
 * Create hint state map for all checkpoints
 */
export function createHintStateMap(
  checkpointIds: string[]
): Map<string, HintState> {
  const map = new Map<string, HintState>();
  for (const id of checkpointIds) {
    map.set(id, initializeHintState(id));
  }
  return map;
}

/**
 * Get hint usage summary
 */
export function getHintUsageSummary(records: HintUsageRecord[]) {
  return {
    totalHintsRequested: records.length,
    level1Used: records.filter((r) => r.level === HintLevel.LEVEL_1_NUDGE).length,
    level2Used: records.filter((r) => r.level === HintLevel.LEVEL_2_GUIDANCE).length,
    level3Used: records.filter((r) => r.level === HintLevel.LEVEL_3_SOLUTION).length,
    uniqueCheckpointsHinted: new Set(records.map((r) => r.checkpointId)).size,
    averageHintsPerCheckpoint:
      records.length / (new Set(records.map((r) => r.checkpointId)).size || 1),
  };
}

/**
 * Determine if checkpoint needs concept review
 * (Hint dependency suggests misunderstanding)
 */
export function shouldRecommendConceptReview(
  checkpointId: string,
  usageRecords: HintUsageRecord[]
): boolean {
  const hintsForCheckpoint = usageRecords.filter(
    (r) => r.checkpointId === checkpointId
  );
  // If more than 2 level-3 hints needed, concept likely unclear
  const level3Hints = hintsForCheckpoint.filter(
    (r) => r.level === HintLevel.LEVEL_3_SOLUTION
  );
  return level3Hints.length > 2;
}
