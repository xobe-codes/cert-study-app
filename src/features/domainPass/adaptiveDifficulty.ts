/**
 * Adaptive Difficulty for Domain Pass (Phase 2)
 *
 * Handles logic for:
 * - Determining if attempt 2 should use adaptive (harder) difficulty
 * - Selecting harder questions for strong performers
 * - Focusing on weak areas for moderate performers
 * - Adjusting question pool difficulty based on previous performance
 */

export enum DifficultyLevel {
  STANDARD = 'standard',
  HARD = 'hard',
}

export interface AdaptiveDifficultyConfig {
  attemptNumber: number;
  previousScore: number; // 0-100
  shouldUseAdaptive: boolean;
  difficultyLevel: DifficultyLevel;
  focusWeakAreas: boolean;
  recommendedQuestionCount: number;
  rationale: string;
}

/**
 * Determine if attempt 2 should use adaptive (harder) difficulty
 *
 * Rules:
 * - Attempt 1: Always standard difficulty
 * - Attempt 2+: Use adaptive if previous score >= 70%
 *   - If previous score >= 85%: Use HARD difficulty (all hard questions)
 *   - If previous score 70-85%: Use HARD difficulty but focus on weak areas
 *   - If previous score < 70%: Return false (not ready for attempt 2)
 *
 * Returns: AdaptiveDifficultyConfig
 */
export function shouldUseAdaptiveDifficulty(
  attemptNumber: number,
  previousScore: number
): AdaptiveDifficultyConfig {
  // First attempt always standard
  if (attemptNumber <= 1) {
    return {
      attemptNumber,
      previousScore,
      shouldUseAdaptive: false,
      difficultyLevel: DifficultyLevel.STANDARD,
      focusWeakAreas: false,
      recommendedQuestionCount: 20,
      rationale: 'First attempt uses standard difficulty baseline',
    };
  }

  // Below 70% - not ready for second attempt yet
  if (previousScore < 70) {
    return {
      attemptNumber,
      previousScore,
      shouldUseAdaptive: false,
      difficultyLevel: DifficultyLevel.STANDARD,
      focusWeakAreas: false,
      recommendedQuestionCount: 20,
      rationale: `Score ${previousScore}% is below passing threshold. Study weak areas first.`,
    };
  }

  // 70-85% - adaptive hard, focus on weak areas
  if (previousScore >= 70 && previousScore < 85) {
    return {
      attemptNumber,
      previousScore,
      shouldUseAdaptive: true,
      difficultyLevel: DifficultyLevel.HARD,
      focusWeakAreas: true,
      recommendedQuestionCount: 20,
      rationale: `Score ${previousScore}% shows solid mastery. Next attempt will focus on weak areas with harder questions.`,
    };
  }

  // 85%+ - all hard questions
  if (previousScore >= 85) {
    return {
      attemptNumber,
      previousScore,
      shouldUseAdaptive: true,
      difficultyLevel: DifficultyLevel.HARD,
      focusWeakAreas: false,
      recommendedQuestionCount: 20,
      rationale: `Score ${previousScore}% shows strong mastery. Next attempt will use harder questions to validate certification.`,
    };
  }

  // Fallback
  return {
    attemptNumber,
    previousScore,
    shouldUseAdaptive: false,
    difficultyLevel: DifficultyLevel.STANDARD,
    focusWeakAreas: false,
    recommendedQuestionCount: 20,
    rationale: 'Unable to determine adaptive strategy',
  };
}

/**
 * Select adaptive questions for second attempt based on previous performance
 *
 * Logic:
 * - If previous score >= 85%: Select all HARD questions (no weak-area focus)
 * - If previous score 70-85%: Select HARD questions + focus on weak-area topics
 * - If previous score < 70%: Return null (not ready for adaptive)
 *
 * Note: This function specifies the selection logic but assumes a question pool
 * exists. In implementation, would accept questionPool parameter.
 *
 * Returns: {difficulty: DifficultyLevel, weakAreasToFocus: string[], estimatedCount: number}
 */
export function selectAdaptiveQuestions(
  domainId: string,
  previousScore: number,
  weakAreaTopics: string[]
): {
  difficulty: DifficultyLevel;
  weakAreasToFocus: string[];
  estimatedCount: number;
  selectionStrategy: string;
} {
  // Below 70% - not ready
  if (previousScore < 70) {
    return {
      difficulty: DifficultyLevel.STANDARD,
      weakAreasToFocus: [],
      estimatedCount: 0,
      selectionStrategy: 'Not ready for adaptive attempt',
    };
  }

  // 70-85% - weak areas + hard
  if (previousScore < 85) {
    return {
      difficulty: DifficultyLevel.HARD,
      weakAreasToFocus: weakAreaTopics.slice(0, 3), // Focus on top 3 weak areas
      estimatedCount: 20,
      selectionStrategy: `Select 20 hard questions with focus on weak areas: ${weakAreaTopics.slice(0, 3).join(', ')}`,
    };
  }

  // 85%+ - all hard, no weak-area focus
  return {
    difficulty: DifficultyLevel.HARD,
    weakAreasToFocus: [],
    estimatedCount: 20,
    selectionStrategy: 'Select 20 hardest questions from full domain pool (no weak-area filtering)',
  };
}

/**
 * Adjust question pool difficulty based on user performance
 *
 * Returns: {originalDifficulty: string, adjustedDifficulty: string, changePercent: number}
 */
export function adjustQuestionDifficultyPool(
  previousScore: number,
  questionPoolDistribution: {
    easy: number; // percentage
    medium: number; // percentage
    hard: number; // percentage
  }
): {
  originalDistribution: { easy: number; medium: number; hard: number };
  adjustedDistribution: { easy: number; medium: number; hard: number };
  changePercent: number;
} {
  const original = { ...questionPoolDistribution };

  // If previous score high, skew toward hard
  if (previousScore >= 85) {
    return {
      originalDistribution: original,
      adjustedDistribution: {
        easy: Math.max(0, original.easy - 20),
        medium: Math.max(0, original.medium - 10),
        hard: Math.min(100, original.hard + 30),
      },
      changePercent: 30,
    };
  }

  // If previous score moderate, slight shift
  if (previousScore >= 70) {
    return {
      originalDistribution: original,
      adjustedDistribution: {
        easy: Math.max(0, original.easy - 10),
        medium: original.medium,
        hard: Math.min(100, original.hard + 10),
      },
      changePercent: 10,
    };
  }

  // Below 70%, keep standard distribution
  return {
    originalDistribution: original,
    adjustedDistribution: original,
    changePercent: 0,
  };
}

/**
 * Determine retry readiness based on time since last attempt and score
 *
 * Returns: {canRetry: boolean, daysRemaining: number, message: string}
 */
export function checkRetryReadiness(
  lastAttemptDate: Date | null,
  lastAttemptScore: number | null
): {
  canRetry: boolean;
  daysRemaining: number;
  message: string;
} {
  if (!lastAttemptDate || lastAttemptScore === null) {
    return {
      canRetry: true,
      daysRemaining: 0,
      message: 'Ready to attempt now',
    };
  }

  // Calculate required wait time
  let waitDays = 1; // Default minimum
  if (lastAttemptScore < 60) waitDays = 7;
  else if (lastAttemptScore < 70) waitDays = 5;
  else if (lastAttemptScore < 85) waitDays = 3;

  const nextDate = new Date(lastAttemptDate);
  nextDate.setDate(nextDate.getDate() + waitDays);

  const now = new Date();
  const daysRemaining = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    canRetry: daysRemaining <= 0,
    daysRemaining: Math.max(0, daysRemaining),
    message:
      daysRemaining <= 0
        ? 'Ready to retry now'
        : `Come back in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
  };
}

/**
 * Get difficulty progression message for user
 *
 * Returns: string (user-friendly explanation of what to expect)
 */
export function getDifficultyProgressionMessage(
  attemptNumber: number,
  previousScore: number
): string {
  if (attemptNumber === 1) {
    return 'This is your first attempt. Questions cover standard difficulty across all topics.';
  }

  if (previousScore < 70) {
    return `Your score of ${previousScore}% needs improvement. Focus on weak areas before attempting again.`;
  }

  if (previousScore < 85) {
    return `Nice score of ${previousScore}%! Your next attempt will include harder questions focused on topics you struggled with. This validates deeper mastery.`;
  }

  return `Excellent score of ${previousScore}%! Your next attempt will be harder across the board to confirm certification-level mastery.`;
}
