/**
 * Routing Table Decoder Difficulty Levels (Phase 5A)
 *
 * Three difficulty tiers with different question complexity:
 * - Easy: 2-3 routes, simple prefixes, hints available
 * - Standard: 3-4 routes, mixed complexity, hints after wrong
 * - Hard: 4-5 routes, complex scenarios, on-demand hints only
 */

export type DifficultyLevel = 'easy' | 'standard' | 'hard';

export interface DifficultySpec {
  level: DifficultyLevel;
  minRoutes: number;
  maxRoutes: number;
  avgComplexity: number; // 1-10 scale
  hintPolicy: 'immediate' | 'after_wrong' | 'on_demand';
  maxHints: number;
  timeLimit: number; // seconds
  description: string;
}

export interface SelectableQuestion {
  id: string;
  difficulty: DifficultyLevel;
  complexity: number; // 1-10
  routeCount: number;
  hasSubnetting: boolean;
  hasMetrics: boolean;
  hasNextHop: boolean;
  domainId: string;
}

/**
 * Get difficulty specification
 *
 * @param difficulty - Difficulty level
 * @returns DifficultySpec with rules for this level
 */
export function getDifficultySpec(difficulty: DifficultyLevel): DifficultySpec {
  switch (difficulty) {
    case 'easy':
      return {
        level: 'easy',
        minRoutes: 2,
        maxRoutes: 3,
        avgComplexity: 2,
        hintPolicy: 'immediate',
        maxHints: 3,
        timeLimit: 120, // 2 minutes per question
        description: 'Simple scenarios with 2-3 routes, all hints available',
      };

    case 'standard':
      return {
        level: 'standard',
        minRoutes: 3,
        maxRoutes: 4,
        avgComplexity: 5,
        hintPolicy: 'after_wrong',
        maxHints: 3,
        timeLimit: 90, // 1.5 minutes per question
        description:
          'Mixed complexity with 3-4 routes, hints after wrong attempt',
      };

    case 'hard':
      return {
        level: 'hard',
        minRoutes: 4,
        maxRoutes: 5,
        avgComplexity: 8,
        hintPolicy: 'on_demand',
        maxHints: 3,
        timeLimit: 60, // 1 minute per question
        description:
          'Complex scenarios with 4-5 routes, on-demand hints only',
      };
  }
}

/**
 * Select difficulty level for a user
 * Can be user-selected or recommended based on performance
 *
 * @param userPreference - User's selected difficulty (optional)
 * @param performanceHistory - Recent scores (optional)
 * @returns Recommended difficulty level
 */
export function selectDifficultyLevel(
  userPreference?: DifficultyLevel,
  performanceHistory?: number[]
): DifficultyLevel {
  // Explicit user preference takes priority
  if (userPreference) {
    return userPreference;
  }

  // No performance history - default to standard
  if (!performanceHistory || performanceHistory.length === 0) {
    return 'standard';
  }

  // Calculate average performance
  const avgScore =
    performanceHistory.reduce((a, b) => a + b, 0) /
    performanceHistory.length;

  if (avgScore >= 85) {
    return 'hard'; // Strong performance - challenge user
  } else if (avgScore >= 65) {
    return 'standard'; // Adequate performance - maintain
  } else {
    return 'easy'; // Struggling - simplify
  }
}

/**
 * Filter question pool by difficulty
 *
 * @param allQuestions - All available questions
 * @param difficulty - Target difficulty
 * @returns Questions matching the difficulty level
 */
export function filterQuestionsByDifficulty(
  allQuestions: SelectableQuestion[],
  difficulty: DifficultyLevel
): SelectableQuestion[] {
  const spec = getDifficultySpec(difficulty);

  return allQuestions.filter(q => {
    // Match difficulty enum
    if (q.difficulty !== difficulty) {
      return false;
    }

    // Check route count is in acceptable range
    if (q.routeCount < spec.minRoutes || q.routeCount > spec.maxRoutes) {
      return false;
    }

    // Check complexity aligns
    if (
      Math.abs(q.complexity - spec.avgComplexity) > 3
    ) {
      return false; // Allow ±3 complexity deviation
    }

    return true;
  });
}

/**
 * Generate questions for a specific difficulty
 * Randomly selects from pool matching difficulty criteria
 *
 * @param difficulty - Target difficulty
 * @param questionPool - All available questions
 * @param count - How many to generate (default 1)
 * @returns Array of difficulty-matched questions
 */
export function generateQuestionByDifficulty(
  difficulty: DifficultyLevel,
  questionPool: SelectableQuestion[],
  count: number = 1
): SelectableQuestion[] {
  const filtered = filterQuestionsByDifficulty(questionPool, difficulty);

  if (filtered.length === 0) {
    return [];
  }

  // Shuffle and select
  const shuffled = [...filtered];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Suggest difficulty progression based on user performance
 *
 * @param currentDifficulty - Current difficulty level
 * @param lastScore - Score from last question
 * @param performanceHistory - Recent scores
 * @returns Suggested next difficulty
 */
export function suggestDifficultyProgression(
  currentDifficulty: DifficultyLevel,
  lastScore: number,
  performanceHistory: number[] = []
): DifficultyLevel {
  const allScores = [...performanceHistory, lastScore];
  const avgScore =
    allScores.reduce((a, b) => a + b, 0) / allScores.length;

  if (currentDifficulty === 'easy') {
    if (avgScore >= 80 && allScores.length >= 3) {
      return 'standard'; // Progress to standard
    }
  } else if (currentDifficulty === 'standard') {
    if (avgScore >= 85 && allScores.length >= 5) {
      return 'hard'; // Progress to hard
    } else if (avgScore < 65 && allScores.length >= 3) {
      return 'easy'; // Regress to easy
    }
  } else {
    // hard
    if (avgScore < 60 && allScores.length >= 5) {
      return 'standard'; // Regress to standard
    }
  }

  return currentDifficulty; // Stay at current
}

/**
 * Get description of difficulty level for user
 *
 * @param difficulty - Difficulty level
 * @returns Human-readable description
 */
export function getDifficultyDescription(difficulty: DifficultyLevel): string {
  const spec = getDifficultySpec(difficulty);
  return spec.description;
}

/**
 * Get time limit for a difficulty level
 *
 * @param difficulty - Difficulty level
 * @returns Time limit in seconds
 */
export function getTimeLimit(difficulty: DifficultyLevel): number {
  return getDifficultySpec(difficulty).timeLimit;
}

/**
 * Validate if a question matches difficulty criteria
 *
 * @param question - Question to validate
 * @param difficulty - Expected difficulty
 * @returns true if question meets criteria
 */
export function validateQuestionDifficulty(
  question: SelectableQuestion,
  difficulty: DifficultyLevel
): boolean {
  const spec = getDifficultySpec(difficulty);

  return (
    question.difficulty === difficulty &&
    question.routeCount >= spec.minRoutes &&
    question.routeCount <= spec.maxRoutes &&
    Math.abs(question.complexity - spec.avgComplexity) <= 4
  );
}

/**
 * Get difficulty color for UI (for visual representation)
 *
 * @param difficulty - Difficulty level
 * @returns CSS color or color code
 */
export function getDifficultyColor(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case 'easy':
      return '#4CAF50'; // Green
    case 'standard':
      return '#FF9800'; // Orange
    case 'hard':
      return '#F44336'; // Red
  }
}

/**
 * Get difficulty emoji
 *
 * @param difficulty - Difficulty level
 * @returns Emoji representation
 */
export function getDifficultyEmoji(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case 'easy':
      return '⭐';
    case 'standard':
      return '⭐⭐';
    case 'hard':
      return '⭐⭐⭐';
  }
}
