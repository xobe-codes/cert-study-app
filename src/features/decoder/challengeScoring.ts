/**
 * Challenge Mode Scoring (Phase 5A)
 *
 * Scoring algorithm for routing table decoder challenge mode:
 * - Base score calculated from attempts and hints
 * - Performance rating (1-5 stars)
 * - Streak tracking
 * - Leaderboard support
 */

export interface QuestionScore {
  questionId: string;
  accuracy: number; // 0-100
  starRating: number; // 1-5
  hintsUsed: number;
  attempts: number;
  timeTaken: number; // seconds
  isCorrect: boolean;
  timestamp: Date;
}

export interface SessionScore {
  sessionId: string;
  totalQuestions: number;
  questionsCorrect: number;
  averageAccuracy: number; // Mean of all question accuracies
  sessionStars: number; // Sum of star ratings
  totalHintsUsed: number;
  totalTime: number; // seconds
  difficultyLevel: string;
  streak: number; // Consecutive correct answers
  maxStreak: number;
  performanceRating: 'excellent' | 'good' | 'fair' | 'poor';
  timestamp: Date;
}

/**
 * Calculate accuracy score for a single question
 * Considers attempts, hints, and correctness
 *
 * @param attempts - Number of attempts
 * @param hintsShown - Number of hints revealed
 * @param isCorrect - Whether answer is correct
 * @returns Score 0-100
 */
export function calculateAccuracyScore(
  attempts: number,
  hintsShown: number,
  isCorrect: boolean = true
): number {
  if (!isCorrect) {
    return 0;
  }

  if (hintsShown === 0) {
    // No hints used - best scoring
    if (attempts === 1) {
      return 100; // Perfect
    } else if (attempts === 2) {
      return 90;
    } else if (attempts === 3) {
      return 80;
    } else {
      return Math.max(50, 100 - attempts * 5);
    }
  } else if (hintsShown === 1) {
    // One hint shown
    if (attempts === 1) {
      return 80;
    } else if (attempts === 2) {
      return 75;
    } else {
      return Math.max(60, 80 - attempts * 3);
    }
  } else if (hintsShown === 2) {
    // Two hints shown
    if (attempts === 1) {
      return 70;
    } else if (attempts === 2) {
      return 65;
    } else {
      return Math.max(50, 70 - attempts * 3);
    }
  } else {
    // Three or more hints (usually full explanation shown)
    return 50;
  }
}

/**
 * Rate performance with 1-5 star system
 *
 * @param accuracy - Accuracy score (0-100)
 * @returns Star rating 1-5
 */
export function ratePerformance(accuracy: number): number {
  if (accuracy >= 95) {
    return 5;
  } else if (accuracy >= 80) {
    return 4;
  } else if (accuracy >= 65) {
    return 3;
  } else if (accuracy >= 50) {
    return 2;
  } else {
    return 1;
  }
}

/**
 * Create a question score record
 *
 * @param questionId - Question ID
 * @param attempts - Number of attempts
 * @param hintsUsed - Number of hints shown
 * @param isCorrect - Whether answer is correct
 * @param timeTaken - Time spent on question (seconds)
 * @returns QuestionScore object
 */
export function createQuestionScore(
  questionId: string,
  attempts: number,
  hintsUsed: number,
  isCorrect: boolean,
  timeTaken: number
): QuestionScore {
  const accuracy = calculateAccuracyScore(attempts, hintsUsed, isCorrect);
  const stars = ratePerformance(accuracy);

  return {
    questionId,
    accuracy,
    starRating: stars,
    hintsUsed,
    attempts,
    timeTaken,
    isCorrect,
    timestamp: new Date(),
  };
}

/**
 * Calculate session score from individual question scores
 *
 * @param sessionId - Session ID
 * @param questionScores - Array of QuestionScore objects
 * @param difficultyLevel - Difficulty level ('easy', 'standard', 'hard')
 * @returns SessionScore with aggregated metrics
 */
export function calculateSessionScore(
  sessionId: string,
  questionScores: QuestionScore[],
  difficultyLevel: string = 'standard'
): SessionScore {
  if (questionScores.length === 0) {
    return {
      sessionId,
      totalQuestions: 0,
      questionsCorrect: 0,
      averageAccuracy: 0,
      sessionStars: 0,
      totalHintsUsed: 0,
      totalTime: 0,
      difficultyLevel,
      streak: 0,
      maxStreak: 0,
      performanceRating: 'poor',
      timestamp: new Date(),
    };
  }

  const questionsCorrect = questionScores.filter(q => q.isCorrect).length;
  const averageAccuracy = Math.round(
    questionScores.reduce((sum, q) => sum + q.accuracy, 0) /
      questionScores.length
  );
  const sessionStars = questionScores.reduce((sum, q) => sum + q.starRating, 0);
  const totalHintsUsed = questionScores.reduce((sum, q) => sum + q.hintsUsed, 0);
  const totalTime = questionScores.reduce((sum, q) => sum + q.timeTaken, 0);

  // Calculate streaks
  let streak = 0;
  let maxStreak = 0;
  for (const score of questionScores) {
    if (score.isCorrect) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 0;
    }
  }

  // Determine performance rating
  let performanceRating: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
  if (averageAccuracy >= 85) {
    performanceRating = 'excellent';
  } else if (averageAccuracy >= 70) {
    performanceRating = 'good';
  } else if (averageAccuracy >= 50) {
    performanceRating = 'fair';
  }

  return {
    sessionId,
    totalQuestions: questionScores.length,
    questionsCorrect,
    averageAccuracy,
    sessionStars,
    totalHintsUsed,
    totalTime,
    difficultyLevel,
    streak,
    maxStreak,
    performanceRating,
    timestamp: new Date(),
  };
}

/**
 * Get performance rating description
 *
 * @param rating - Performance rating
 * @returns Human-readable description
 */
export function getPerformanceRatingDescription(
  rating: 'excellent' | 'good' | 'fair' | 'poor'
): string {
  switch (rating) {
    case 'excellent':
      return 'Excellent! You mastered this challenge.';
    case 'good':
      return 'Good performance! Keep practicing.';
    case 'fair':
      return 'Fair performance. Review hints and try again.';
    case 'poor':
      return 'Needs improvement. Study the material more.';
  }
}

/**
 * Calculate streak bonus multiplier
 * Rewards consecutive correct answers with score boost
 *
 * @param currentStreak - Current consecutive correct count
 * @returns Multiplier to apply to score (1.0 = no bonus)
 */
export function getStreakBonusMultiplier(currentStreak: number): number {
  if (currentStreak < 3) {
    return 1.0;
  } else if (currentStreak < 5) {
    return 1.1; // 10% bonus
  } else if (currentStreak < 10) {
    return 1.2; // 20% bonus
  } else {
    return 1.3; // 30% bonus max
  }
}

/**
 * Apply streak bonus to a score
 *
 * @param baseScore - Base score without bonus
 * @param streak - Current streak
 * @returns Final score with bonus applied
 */
export function applyStreakBonus(baseScore: number, streak: number): number {
  const multiplier = getStreakBonusMultiplier(streak);
  return Math.min(100, Math.round(baseScore * multiplier));
}

/**
 * Compare two session scores
 * Returns -1 if first is better, 0 if equal, 1 if second is better
 *
 * @param session1 - First session score
 * @param session2 - Second session score
 * @returns Comparison result for sorting
 */
export function compareSessionScores(
  session1: SessionScore,
  session2: SessionScore
): number {
  // Compare by average accuracy first
  if (session1.averageAccuracy !== session2.averageAccuracy) {
    return session2.averageAccuracy - session1.averageAccuracy;
  }

  // Then by session stars
  if (session1.sessionStars !== session2.sessionStars) {
    return session2.sessionStars - session1.sessionStars;
  }

  // Then by percentage correct
  const percent1 =
    (session1.questionsCorrect / session1.totalQuestions) * 100;
  const percent2 =
    (session2.questionsCorrect / session2.totalQuestions) * 100;

  return percent2 - percent1;
}

/**
 * Get leaderboard position (mock data)
 * In production, would query from database
 *
 * @param score - Current session score
 * @param allScores - All historical scores
 * @returns Position on leaderboard (1-indexed)
 */
export function getLeaderboardPosition(
  score: SessionScore,
  allScores: SessionScore[]
): number {
  const sorted = [...allScores].sort((a, b) => compareSessionScores(a, b));
  return sorted.findIndex(s => s.sessionId === score.sessionId) + 1;
}

/**
 * Format score for display
 *
 * @param score - SessionScore
 * @returns Human-readable score string
 */
export function formatScoreForDisplay(score: SessionScore): string {
  const starString = '⭐'.repeat(Math.round(score.sessionStars / 5)); // Normalize to display stars
  const percentage = Math.round(
    (score.questionsCorrect / score.totalQuestions) * 100
  );

  return `${percentage}% | ${score.questionsCorrect}/${score.totalQuestions} correct | ${starString}`;
}

/**
 * Calculate points earned (for gamification)
 * Can be used in leaderboards or progression systems
 *
 * @param score - SessionScore
 * @returns Points earned (0-1000)
 */
export function calculatePointsEarned(score: SessionScore): number {
  // Base calculation: 100 points per correct question
  let points = score.questionsCorrect * 100;

  // Bonus for average accuracy
  if (score.averageAccuracy >= 90) {
    points += 100; // 90%+ accuracy bonus
  } else if (score.averageAccuracy >= 75) {
    points += 50;
  }

  // Bonus for no hints
  if (score.totalHintsUsed === 0) {
    points += 50;
  }

  // Streak bonus
  if (score.maxStreak >= 5) {
    points += 50;
  }

  // Difficulty bonus
  if (score.difficultyLevel === 'hard') {
    points = Math.round(points * 1.5);
  } else if (score.difficultyLevel === 'easy') {
    points = Math.round(points * 0.75);
  }

  // Cap at 1000
  return Math.min(1000, points);
}
