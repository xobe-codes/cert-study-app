/**
 * Routing Table Decoder Challenge Mode (Phase 5A)
 *
 * Implements hint system with progressive difficulty:
 * - Hint 1: General nudge
 * - Hint 2: Specific guidance
 * - Hint 3: Full explanation
 *
 * Tracks hint usage for scoring (hints reduce score)
 */

export type HintLevel = 1 | 2 | 3;

export interface Hint {
  level: HintLevel;
  text: string;
  timestamp: Date;
}

export interface ProgressiveHints {
  level1: string; // General nudge
  level2: string; // Specific guidance
  level3: string; // Full explanation
}

export interface DecoderChallengeQuestion {
  id: string;
  scenario: string; // The routing table scenario
  question: string; // What to find/solve
  correctAnswer: string;
  hints: ProgressiveHints;
  difficulty: 'easy' | 'standard' | 'hard';
  domainId: string;
}

export interface ChallengeSession {
  id: string;
  userId: string;
  questionId: string;
  hintsRequested: HintLevel[];
  attempts: number;
  correctAnswer: string;
  userAnswer: string | null;
  isCorrect: boolean;
  accuracy: number; // 0-100 score
  completedAt: Date | null;
  timeTaken: number | null; // seconds
}

/**
 * Generate progressive hint set for a question
 * 3-level hint system with increasing detail
 *
 * @param question - The decoder question
 * @returns ProgressiveHints object with 3 levels
 */
export function generateProgressiveHints(
  question: DecoderChallengeQuestion
): ProgressiveHints {
  // This is a framework function - actual hints would be created by domain experts
  // For testing, we provide template hints based on scenario

  const scenario = question.scenario.toLowerCase();

  let hints: ProgressiveHints;

  if (scenario.includes('destination') || scenario.includes('subnet')) {
    hints = {
      level1:
        'Focus on which column determines the routing path. Think about the destination network.',
      level2:
        'Look at the CIDR notation and netmask. Which entry best matches the destination IP?',
      level3: `The correct answer identifies the most specific route that matches the destination. Use longest prefix matching.`,
    };
  } else if (scenario.includes('metric') || scenario.includes('cost')) {
    hints = {
      level1: 'Consider the cost or metric value. Lower metrics are preferred.',
      level2:
        'Look at the metric column and identify which route has the lowest cost to reach the destination.',
      level3: `Use the route with the lowest metric/cost as the tiebreaker when multiple routes match.`,
    };
  } else if (scenario.includes('next hop')) {
    hints = {
      level1: 'The next hop tells you where packets go first. Identify the correct forwarding interface.',
      level2:
        'Match the destination to the routing table entry, then follow the next hop.',
      level3: `Forward the packet to the next hop address specified in the matching routing table entry.`,
    };
  } else {
    hints = {
      level1: 'Review the routing table structure and identify relevant columns.',
      level2: 'Match the destination IP to the appropriate routing table entry.',
      level3: `${question.correctAnswer} is the correct answer. This route best handles the destination.`,
    };
  }

  return hints;
}

/**
 * Request a hint during challenge mode
 * Returns hint text and tracks hint usage for scoring
 *
 * @param session - ChallengeSession
 * @param hints - Available hints for the question
 * @param requestedLevel - Which hint level (1, 2, or 3)
 * @returns Updated session with hint recorded
 */
export function requestHint(
  session: ChallengeSession,
  hints: ProgressiveHints,
  requestedLevel: HintLevel
): { session: ChallengeSession; hintText: string } {
  // Don't show same hint twice
  if (session.hintsRequested.includes(requestedLevel)) {
    return {
      session,
      hintText: hints[`level${requestedLevel}` as keyof ProgressiveHints],
    };
  }

  const hintText = hints[`level${requestedLevel}` as keyof ProgressiveHints];

  return {
    session: {
      ...session,
      hintsRequested: [...session.hintsRequested, requestedLevel].sort(),
    },
    hintText,
  };
}

/**
 * Hide hints from display (challenge mode enabled)
 * User must request hints explicitly
 *
 * @param question - DecoderChallengeQuestion with hints
 * @returns Question object without hints displayed
 */
export function hideHintsForQuestion(
  question: DecoderChallengeQuestion
): Omit<DecoderChallengeQuestion, 'hints'> & {
  hintsAvailable: boolean;
} {
  const { hints, ...questionWithoutHints } = question;
  return {
    ...questionWithoutHints,
    hintsAvailable: true,
  };
}

/**
 * Create a new challenge session
 *
 * @param userId - User ID
 * @param question - The decoder question
 * @param sessionId - Optional session ID
 * @returns New ChallengeSession
 */
export function createChallengeSession(
  userId: string,
  question: DecoderChallengeQuestion,
  sessionId?: string
): ChallengeSession {
  return {
    id: sessionId || `challenge-${userId}-${Date.now()}`,
    userId,
    questionId: question.id,
    hintsRequested: [],
    attempts: 0,
    correctAnswer: question.correctAnswer,
    userAnswer: null,
    isCorrect: false,
    accuracy: 0,
    completedAt: null,
    timeTaken: null,
  };
}

/**
 * Submit an answer to a challenge question
 * Checks correctness and records the attempt
 *
 * @param session - ChallengeSession
 * @param userAnswer - User's answer
 * @param correctAnswer - The correct answer
 * @param timeTaken - Time spent on question (seconds)
 * @returns Updated session with result
 */
export function submitChallengeAnswer(
  session: ChallengeSession,
  userAnswer: string,
  correctAnswer: string,
  timeTaken: number
): ChallengeSession {
  const isCorrect = userAnswer.trim().toLowerCase() ===
    correctAnswer.trim().toLowerCase();

  return {
    ...session,
    userAnswer,
    isCorrect,
    attempts: session.attempts + 1,
    completedAt: isCorrect ? new Date() : null,
    timeTaken,
    accuracy: calculateAccuracyScore(
      session.attempts + 1,
      session.hintsRequested.length,
      isCorrect
    ),
  };
}

/**
 * Calculate accuracy score based on attempts and hints used
 * Scoring logic:
 * - No hints, first try: 100
 * - No hints, multiple tries: 80-90
 * - Hint 1 only: 70-80
 * - Hint 2 used: 60-70
 * - Hint 3 (full explanation): 50
 *
 * @param attempts - Number of attempts
 * @param hintsUsed - Number of hints revealed
 * @param isCorrect - Whether answer is correct
 * @returns Accuracy score (0-100)
 */
export function calculateAccuracyScore(
  attempts: number,
  hintsUsed: number,
  isCorrect: boolean = true
): number {
  if (!isCorrect) {
    return 0; // No score for incorrect answer
  }

  if (hintsUsed === 0) {
    if (attempts === 1) {
      return 100; // Perfect
    } else if (attempts === 2) {
      return 90; // One retry
    } else if (attempts === 3) {
      return 85; // Two retries
    } else {
      return Math.max(70, 100 - attempts * 5); // Declining score
    }
  } else if (hintsUsed === 1) {
    if (attempts === 1) {
      return 75; // One hint, first try
    } else {
      return Math.max(70, 75 - attempts * 2);
    }
  } else if (hintsUsed === 2) {
    if (attempts === 1) {
      return 65;
    } else {
      return Math.max(60, 65 - attempts * 2);
    }
  } else {
    // 3 or more hints (usually means all 3)
    return 50;
  }
}

/**
 * Rate performance based on accuracy score
 * Returns star rating (1-5)
 *
 * @param accuracyScore - Score from calculateAccuracyScore
 * @returns Star rating 1-5
 */
export function ratePerformance(accuracyScore: number): number {
  if (accuracyScore >= 95) {
    return 5;
  } else if (accuracyScore >= 80) {
    return 4;
  } else if (accuracyScore >= 65) {
    return 3;
  } else if (accuracyScore >= 50) {
    return 2;
  } else {
    return 1;
  }
}

/**
 * Determine if user can proceed without using more hints
 * Used to decide when to unlock next level of hint
 *
 * @param session - ChallengeSession
 * @param maxHintsAllowed - Max hints for this difficulty (varies by difficulty)
 * @returns true if user can request next hint
 */
export function canRequestNextHint(
  session: ChallengeSession,
  maxHintsAllowed: number = 3
): boolean {
  return session.hintsRequested.length < maxHintsAllowed &&
    session.hintsRequested.length < 3;
}

/**
 * Get hint availability based on difficulty level
 * Hint policy varies by difficulty
 *
 * @param difficulty - Difficulty level
 * @returns Object with hint policies
 */
export function getHintPolicy(difficulty: 'easy' | 'standard' | 'hard'): {
  maxHints: number;
  availableOn: 'immediate' | 'after_wrong' | 'on_demand';
} {
  switch (difficulty) {
    case 'easy':
      return {
        maxHints: 3,
        availableOn: 'immediate', // All hints available from start
      };
    case 'standard':
      return {
        maxHints: 3,
        availableOn: 'after_wrong', // Hints only after wrong attempt
      };
    case 'hard':
      return {
        maxHints: 3,
        availableOn: 'on_demand', // User can request, but lose points
      };
  }
}
