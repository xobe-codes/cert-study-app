/**
 * Progressive Difficulty System (Phase 3)
 *
 * Adapts lab difficulty based on user performance
 * - Easy labs: max 2 mistakes allowed, full hints available
 * - Medium labs: max 1 mistake allowed, limited hints
 * - Hard labs: no mistakes (strict mode), minimal hints
 *
 * Difficulty can increase/decrease based on performance
 */

export type LabDifficulty = 'easy' | 'medium' | 'hard';

export interface DifficultySettings {
  maxMistakes: number; // Number of mistakes before lab fails
  maxHintLevel: number; // Max hint level available (1-3)
  timeLimit?: number; // Minutes to complete lab
  partialCreditAllowed: boolean; // Can submit with partial checkpoint completion?
  strictMode: boolean; // Fail on first configuration error?
  allowRetry: boolean; // Can retry after failure?
}

export interface DifficultyConfig {
  easy: DifficultySettings;
  medium: DifficultySettings;
  hard: DifficultySettings;
}

/**
 * Standard difficulty configurations
 */
export const DEFAULT_DIFFICULTY_CONFIG: DifficultyConfig = {
  easy: {
    maxMistakes: 2,
    maxHintLevel: 3,
    timeLimit: 60,
    partialCreditAllowed: true,
    strictMode: false,
    allowRetry: true,
  },
  medium: {
    maxMistakes: 1,
    maxHintLevel: 2,
    timeLimit: 45,
    partialCreditAllowed: false,
    strictMode: false,
    allowRetry: true,
  },
  hard: {
    maxMistakes: 0,
    maxHintLevel: 1,
    timeLimit: 30,
    partialCreditAllowed: false,
    strictMode: true,
    allowRetry: false, // One shot
  },
};

export interface LabAttempt {
  labId: string;
  difficulty: LabDifficulty;
  startTime: Date;
  endTime?: Date;
  mistakes: number;
  hintsUsed: number;
  checkpointsPassed: number;
  totalCheckpoints: number;
  passed: boolean;
  timeSpent?: number; // minutes
}

export interface UserProfile {
  userId: string;
  labsCompleted: number;
  totalAttempts: number;
  averageAccuracy: number; // 0-100 based on mistake rate
  successRate: number; // % of attempts that passed
  preferredDifficulty: LabDifficulty;
  performanceByDifficulty: {
    easy: { attempts: number; passed: number };
    medium: { attempts: number; passed: number };
    hard: { attempts: number; passed: number };
  };
}

/**
 * Get difficulty settings for a specific difficulty level
 */
export function getDifficultySettings(difficulty: LabDifficulty): DifficultySettings {
  return DEFAULT_DIFFICULTY_CONFIG[difficulty];
}

/**
 * Check if a mistake should fail the lab based on difficulty
 */
export function shouldFailOnMistake(
  currentMistakes: number,
  difficulty: LabDifficulty
): boolean {
  const settings = getDifficultySettings(difficulty);
  return currentMistakes >= settings.maxMistakes;
}

/**
 * Get maximum hint level based on difficulty
 */
export function getMaxHintLevel(difficulty: LabDifficulty): number {
  return getDifficultySettings(difficulty).maxHintLevel;
}

/**
 * Evaluate lab performance and suggest difficulty adjustment
 */
export function evaluatePerformance(attempt: LabAttempt): {
  passed: boolean;
  accuracy: number;
  earnedPoints: number;
  suggestion: 'increase' | 'maintain' | 'decrease';
  reason: string;
} {
  const accuracy = Math.max(0, 100 - attempt.mistakes * 25);
  const earnedPoints = attempt.checkpointsPassed * 10;

  let suggestion: 'increase' | 'maintain' | 'decrease' = 'maintain';
  let reason = '';

  if (attempt.passed) {
    if (attempt.difficulty === 'easy') {
      if (accuracy >= 90 && attempt.hintsUsed === 0) {
        suggestion = 'increase';
        reason = 'You completed without mistakes or hints. Try medium difficulty.';
      } else if (accuracy >= 80 && attempt.hintsUsed <= 1) {
        suggestion = 'increase';
        reason = 'Strong performance. You\'re ready for medium difficulty.';
      }
    } else if (attempt.difficulty === 'medium') {
      if (accuracy >= 95 && attempt.hintsUsed === 0) {
        suggestion = 'increase';
        reason = 'Perfect performance on medium. Challenge yourself with hard mode.';
      } else if (accuracy < 70) {
        suggestion = 'decrease';
        reason = 'Consider practicing more on easy mode before attempting medium again.';
      }
    } else if (attempt.difficulty === 'hard') {
      if (accuracy < 90) {
        suggestion = 'decrease';
        reason = 'Hard mode is challenging. Build confidence on medium before returning.';
      }
    }
  } else {
    // Lab failed
    if (attempt.difficulty === 'easy') {
      reason = 'Review the concepts and try again on easy mode.';
    } else if (attempt.difficulty === 'medium') {
      suggestion = 'decrease';
      reason = 'Consider practicing on easy mode before attempting medium again.';
    } else if (attempt.difficulty === 'hard') {
      suggestion = 'decrease';
      reason = 'Hard mode requires mastery. Build confidence on medium first.';
    }
  }

  return {
    passed: attempt.passed,
    accuracy,
    earnedPoints,
    suggestion,
    reason,
  };
}

/**
 * Recommend difficulty for next attempt based on history
 */
export function recommendDifficulty(userProfile: UserProfile): LabDifficulty {
  const { easy, medium, hard } = userProfile.performanceByDifficulty;

  // Calculate success rates for each difficulty
  const easySuccessRate = easy.attempts > 0 ? easy.passed / easy.attempts : 0;
  const mediumSuccessRate = medium.attempts > 0 ? medium.passed / medium.attempts : 0;
  const hardSuccessRate = hard.attempts > 0 ? hard.passed / hard.attempts : 0;

  // If never attempted, start with easy
  if (userProfile.totalAttempts === 0) {
    return 'easy';
  }

  // If haven't tried medium, progress to medium after easy success
  if (medium.attempts === 0 && easySuccessRate >= 0.8) {
    return 'medium';
  }

  // If haven't tried hard, progress to hard after medium success
  if (hard.attempts === 0 && mediumSuccessRate >= 0.8) {
    return 'hard';
  }

  // If struggling with current difficulty (< 50% success), drop down
  if (userProfile.successRate < 0.5) {
    if (userProfile.preferredDifficulty === 'hard') return 'medium';
    if (userProfile.preferredDifficulty === 'medium') return 'easy';
  }

  // If dominating current difficulty (> 90% success), move up
  if (userProfile.successRate > 0.9) {
    if (userProfile.preferredDifficulty === 'easy') return 'medium';
    if (userProfile.preferredDifficulty === 'medium') return 'hard';
  }

  // Maintain current difficulty
  return userProfile.preferredDifficulty;
}

/**
 * Calculate lab score with difficulty multiplier
 */
export function calculateLabScore(
  attempt: LabAttempt,
  config: DifficultyConfig = DEFAULT_DIFFICULTY_CONFIG
): number {
  let baseScore = attempt.checkpointsPassed * 10; // 10 points per checkpoint
  let timeBonus = 0;
  let accuracyBonus = 0;
  let difficultyMultiplier = 1;

  const settings = config[attempt.difficulty];

  // Time bonus: complete faster than time limit
  if (attempt.timeSpent && settings.timeLimit) {
    const timePercentage = attempt.timeSpent / settings.timeLimit;
    if (timePercentage < 0.5) timeBonus = 25; // Completed in <50% of time limit
    else if (timePercentage < 0.75) timeBonus = 15;
    else if (timePercentage < 1.0) timeBonus = 5;
  }

  // Accuracy bonus: minimal mistakes
  const accuracyPercentage = Math.max(0, 100 - attempt.mistakes * 25);
  if (accuracyPercentage >= 95) accuracyBonus = 30;
  else if (accuracyPercentage >= 85) accuracyBonus = 20;
  else if (accuracyPercentage >= 75) accuracyBonus = 10;

  // Difficulty multiplier
  if (attempt.difficulty === 'medium') difficultyMultiplier = 1.25;
  else if (attempt.difficulty === 'hard') difficultyMultiplier = 1.5;

  // Hint penalty: fewer hints = better score
  const hintPenalty = attempt.hintsUsed * 5;

  const totalScore = Math.max(0, (baseScore + timeBonus + accuracyBonus - hintPenalty) * difficultyMultiplier);

  return Math.round(totalScore);
}

/**
 * Get progress indicator text based on checkpoint completion
 */
export function getProgressIndicator(passed: number, total: number, difficulty: LabDifficulty): string {
  const percentage = (passed / total) * 100;

  if (difficulty === 'easy') {
    if (percentage >= 75) return 'Great progress! Keep going.';
    if (percentage >= 50) return 'Good start. Continue with next checkpoint.';
    return 'Let\'s begin. One checkpoint at a time.';
  } else if (difficulty === 'medium') {
    if (percentage >= 75) return 'Excellent! Almost there.';
    if (percentage >= 50) return 'Halfway through. Stay focused.';
    return 'Getting started. Each step matters.';
  } else {
    // hard
    if (percentage >= 75) return 'Outstanding. Finish strong.';
    if (percentage >= 50) return 'Halfway there. No margin for error.';
    return 'Precision required. Proceed carefully.';
  }
}

/**
 * Determine if user can skip this difficulty level
 */
export function canSkipDifficulty(
  currentDifficulty: LabDifficulty,
  userProfile: UserProfile,
  requiredSuccessRate: number = 0.9
): boolean {
  if (currentDifficulty === 'easy') {
    const { passed, attempts } = userProfile.performanceByDifficulty.easy;
    return attempts > 0 && passed / attempts >= requiredSuccessRate;
  }

  if (currentDifficulty === 'medium') {
    const { passed, attempts } = userProfile.performanceByDifficulty.medium;
    return attempts > 0 && passed / attempts >= requiredSuccessRate;
  }

  return false;
}

/**
 * Estimate time to complete based on difficulty and user history
 */
export function estimateTimeToComplete(
  labId: string,
  difficulty: LabDifficulty,
  userProfile: UserProfile
): number {
  const settings = getDifficultySettings(difficulty);
  let baseTime = settings.timeLimit || 30;

  // Adjust based on user's success rate
  if (userProfile.successRate > 0.9) {
    baseTime *= 0.75; // Fast learner
  } else if (userProfile.successRate < 0.5) {
    baseTime *= 1.5; // Needs more time
  }

  return Math.round(baseTime);
}

/**
 * Create adaptive checkpoint requirements based on difficulty
 */
export function getCheckpointRequirements(difficulty: LabDifficulty): {
  mustPass: number; // Min checkpoints that must pass to complete lab
  totalCheckpoints: number;
  partialCreditPercent: number; // % of points available for partial completion
} {
  const requirements = {
    easy: {
      mustPass: Math.ceil(0.75), // Must pass 75% of checkpoints
      totalCheckpoints: 4,
      partialCreditPercent: 50, // Can get 50% credit if partial
    },
    medium: {
      mustPass: 4, // Must pass all
      totalCheckpoints: 4,
      partialCreditPercent: 0, // No partial credit
    },
    hard: {
      mustPass: 4, // Must pass all
      totalCheckpoints: 4,
      partialCreditPercent: 0, // No partial credit
    },
  };

  return requirements[difficulty];
}

/**
 * Track performance trends and detect plateauing
 */
export function detectPlateauing(userProfile: UserProfile): {
  isPlateauing: boolean;
  reason: string;
  suggestion: string;
} {
  const { totalAttempts, successRate, performanceByDifficulty } = userProfile;

  // Need at least 5 attempts to detect trends
  if (totalAttempts < 5) {
    return {
      isPlateauing: false,
      reason: 'Not enough data yet',
      suggestion: 'Keep practicing to see performance trends.',
    };
  }

  // Check if stuck on same difficulty
  const currentDiff = userProfile.preferredDifficulty;
  const perfOnCurrent = performanceByDifficulty[currentDiff];

  if (perfOnCurrent.attempts >= 5 && perfOnCurrent.passed / perfOnCurrent.attempts < 0.6) {
    return {
      isPlateauing: true,
      reason: `Struggling on ${currentDiff} difficulty for too long.`,
      suggestion: `Try dropping down to ${currentDiff === 'hard' ? 'medium' : 'easy'} difficulty to rebuild confidence.`,
    };
  }

  if (successRate > 0.95 && totalAttempts > 10) {
    return {
      isPlateauing: true,
      reason: 'Dominating all labs—may need harder challenges.',
      suggestion: 'Consider hard difficulty mode or advanced topics.',
    };
  }

  return {
    isPlateauing: false,
    reason: 'Making good progress',
    suggestion: 'Keep practicing at your current pace.',
  };
}

/**
 * Get motivational message based on performance
 */
export function getMotivationalMessage(userProfile: UserProfile, lastAttempt?: LabAttempt): string {
  if (!lastAttempt) {
    if (userProfile.labsCompleted === 0) {
      return 'Welcome! Start with easy mode to learn the fundamentals.';
    }
    return `You've completed ${userProfile.labsCompleted} labs. Keep going!`;
  }

  if (lastAttempt.passed) {
    if (lastAttempt.difficulty === 'hard' && lastAttempt.mistakes === 0) {
      return 'Perfect! You\'ve mastered this lab.';
    }
    if (lastAttempt.difficulty === 'easy' && userProfile.successRate > 0.8) {
      return 'Great progress! Ready to challenge yourself with medium difficulty?';
    }
    return 'Excellent work! You\'re getting better every time.';
  } else {
    if (lastAttempt.difficulty === 'hard') {
      return 'Hard mode is tough! Drop back to medium and build confidence.';
    }
    return 'Don\'t worry, you\'ll get it next time! Review the concepts and try again.';
  }
}

/**
 * Determine badge earned based on performance
 */
export function getBadgeEarned(attempt: LabAttempt): string | null {
  if (!attempt.passed) return null;

  if (attempt.difficulty === 'hard' && attempt.mistakes === 0) {
    return 'master'; // Perfect hard attempt
  }

  if (attempt.difficulty === 'hard') {
    return 'warrior'; // Completed hard
  }

  if (attempt.difficulty === 'medium' && attempt.mistakes === 0) {
    return 'sharpshooter'; // Perfect medium
  }

  if (attempt.difficulty === 'easy' && attempt.mistakes === 0 && attempt.hintsUsed === 0) {
    return 'speedrunner'; // Perfect easy with no help
  }

  return null; // No badge for standard completion
}
