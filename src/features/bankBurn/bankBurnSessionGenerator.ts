/**
 * Bank Burn Session Generator (Phase 5B)
 *
 * Creates customized bank burn practice sessions:
 * - Respects user-specified size (5, 10, 20, 50, or custom)
 * - Applies session options (shuffle, timer, hard-only, etc.)
 * - Tracks session metadata for analytics
 * - Supports domain-specific and mixed-domain sessions
 */

import {
  BankBurnOptions,
  applySessionOptions,
  getDefaultOptions,
} from './bankBurnOptions';

export interface BankBurnSession {
  id: string;
  userId: string;
  domainId?: string; // Optional: specific domain
  sessionSize: number; // How many questions
  questions: any[];
  options: BankBurnOptions;
  startTime: Date;
  endTime: Date | null;
  responses: Record<string, any>;
  completed: boolean;
  score: number | null;
  timeSpentSeconds: number | null;
}

/**
 * Generate a bank burn session with specified parameters
 *
 * @param userId - User ID
 * @param domainId - Domain to practice (or undefined for mixed)
 * @param size - Session size (5, 10, 20, 50, or custom)
 * @param questionPool - Questions available for this domain
 * @param options - Session options (shuffle, timer, etc.)
 * @param sessionId - Optional session ID
 * @returns BankBurnSession ready to start
 */
export function generateBankBurnSession(
  userId: string,
  domainId: string | undefined,
  size: number,
  questionPool: any[],
  options: BankBurnOptions = getDefaultOptions(),
  sessionId?: string
): BankBurnSession {
  // Validate and select questions
  const questions = sliceQuestionsForSession(questionPool, size);

  // Apply user options to the questions
  const configuredQuestions = applySessionOptions(questions, options);

  return {
    id: sessionId || `session-${userId}-${Date.now()}`,
    userId,
    domainId,
    sessionSize: size,
    questions: configuredQuestions,
    options,
    startTime: new Date(),
    endTime: null,
    responses: {},
    completed: false,
    score: null,
    timeSpentSeconds: null,
  };
}

/**
 * Slice N questions from a pool for the session
 * Handles shuffling based on options, filters hard-only if needed
 *
 * @param pool - Full question pool
 * @param size - Number of questions to select
 * @returns Array of selected questions
 */
export function sliceQuestionsForSession(
  pool: any[],
  size: number
): any[] {
  if (!Array.isArray(pool) || pool.length === 0) {
    return [];
  }

  // Don't request more than available
  const actualSize = Math.min(size, pool.length);

  if (actualSize === 0) {
    return [];
  }

  // If we need all questions, just return them
  if (actualSize >= pool.length) {
    return pool;
  }

  // Fisher-Yates shuffle and select first N
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, actualSize);
}

/**
 * Generate session from multiple domains (mixed practice)
 * Distributes questions across domains
 *
 * @param userId - User ID
 * @param size - Total session size
 * @param domainPools - Map of domainId -> questions
 * @param options - Session options
 * @param sessionId - Optional session ID
 * @returns BankBurnSession with mixed domain questions
 */
export function generateMixedDomainSession(
  userId: string,
  size: number,
  domainPools: Record<string, any[]>,
  options: BankBurnOptions = getDefaultOptions(),
  sessionId?: string
): BankBurnSession {
  // Calculate per-domain distribution
  const domainIds = Object.keys(domainPools);
  const domainsCount = domainIds.length;
  const questionsPerDomain = Math.floor(size / domainsCount);
  const remainder = size % domainsCount;

  const allQuestions: any[] = [];

  // Collect questions from each domain
  domainIds.forEach((domainId, index) => {
    const pool = domainPools[domainId];
    const questionCount =
      questionsPerDomain + (index < remainder ? 1 : 0);

    const selected = sliceQuestionsForSession(pool, questionCount);
    allQuestions.push(
      ...selected.map(q => ({
        ...q,
        domainId, // Tag with domain for analytics
      }))
    );
  });

  // Apply options
  const configuredQuestions = applySessionOptions(allQuestions, options);

  return {
    id: sessionId || `mixed-session-${userId}-${Date.now()}`,
    userId,
    sessionSize: size,
    questions: configuredQuestions,
    options,
    startTime: new Date(),
    endTime: null,
    responses: {},
    completed: false,
    score: null,
    timeSpentSeconds: null,
  };
}

/**
 * Record an answer response for a question in session
 *
 * @param session - BankBurnSession
 * @param questionId - Question ID
 * @param answer - User's answer
 * @param isCorrect - Whether answer is correct
 * @returns Updated session with response recorded
 */
export function recordSessionResponse(
  session: BankBurnSession,
  questionId: string,
  answer: any,
  isCorrect: boolean
): BankBurnSession {
  return {
    ...session,
    responses: {
      ...session.responses,
      [questionId]: {
        answer,
        isCorrect,
        timestamp: new Date(),
      },
    },
  };
}

/**
 * Mark session as completed
 * Calculates score and time spent
 *
 * @param session - BankBurnSession
 * @param endTime - End time (defaults to now)
 * @returns Updated session marked as complete
 */
export function completeSession(
  session: BankBurnSession,
  endTime: Date = new Date()
): BankBurnSession {
  const timeSpentSeconds = Math.round(
    (endTime.getTime() - session.startTime.getTime()) / 1000
  );

  // Calculate score
  const correctCount = Object.values(session.responses).filter(
    (r: any) => r.isCorrect
  ).length;
  const score = Math.round((correctCount / session.questions.length) * 100);

  return {
    ...session,
    endTime,
    completed: true,
    score,
    timeSpentSeconds,
  };
}

/**
 * Validate that session meets minimum requirements
 *
 * @param session - BankBurnSession to validate
 * @returns true if session is valid
 */
export function validateSession(session: BankBurnSession): boolean {
  // Must have questions
  if (!session.questions || session.questions.length === 0) {
    return false;
  }

  // Size must match questions loaded
  if (session.questions.length !== session.sessionSize) {
    return false;
  }

  // User ID required
  if (!session.userId) {
    return false;
  }

  return true;
}

/**
 * Get session statistics
 * Summary of performance metrics
 *
 * @param session - Completed BankBurnSession
 * @returns Statistics object
 */
export function getSessionStats(session: BankBurnSession): {
  score: number;
  questionCount: number;
  correctCount: number;
  accuracy: number;
  timeSpent: number; // seconds
  questionsPerMinute: number;
  estimatedTestTime: number; // minutes for full 100-question exam
} {
  const correctCount = Object.values(session.responses).filter(
    (r: any) => r.isCorrect
  ).length;

  const accuracy = session.questions.length > 0
    ? Math.round((correctCount / session.questions.length) * 100)
    : 0;

  const timeSpent = session.timeSpentSeconds || 0;
  const questionsPerMinute =
    timeSpent > 0 ? (session.questions.length / timeSpent) * 60 : 0;

  // Estimate full 100-question CCNA exam time
  const estimatedTestTime = questionsPerMinute > 0
    ? Math.round(100 / questionsPerMinute)
    : 0;

  return {
    score: session.score || 0,
    questionCount: session.questions.length,
    correctCount,
    accuracy,
    timeSpent,
    questionsPerMinute: Math.round(questionsPerMinute * 10) / 10,
    estimatedTestTime,
  };
}

/**
 * Compare two sessions
 * Returns which performed better
 *
 * @param session1 - First session
 * @param session2 - Second session
 * @returns -1 if session1 better, 0 if equal, 1 if session2 better
 */
export function compareSessions(
  session1: BankBurnSession,
  session2: BankBurnSession
): number {
  const score1 = session1.score || 0;
  const score2 = session2.score || 0;

  if (score1 !== score2) {
    return score2 - score1; // Higher score is better
  }

  // Tiebreaker: time taken (lower is better)
  const time1 = session1.timeSpentSeconds || Infinity;
  const time2 = session2.timeSpentSeconds || Infinity;

  return time1 - time2;
}

/**
 * Get recommendations based on session performance
 *
 * @param session - Completed BankBurnSession
 * @returns Array of recommendation strings
 */
export function getSessionRecommendations(session: BankBurnSession): string[] {
  const recommendations: string[] = [];
  const stats = getSessionStats(session);

  if (stats.score >= 85) {
    recommendations.push('Excellent! Progress to harder questions or next domain.');
  } else if (stats.score >= 70) {
    recommendations.push('Good! Review weak areas before moving forward.');
  } else {
    recommendations.push('Review material and retake this session.');
  }

  if (stats.questionsPerMinute < 0.5) {
    recommendations.push('Consider timing yourself to increase pace.');
  }

  if (Object.keys(session.responses).length < session.questions.length) {
    recommendations.push('Complete all questions in the session.');
  }

  return recommendations;
}

/**
 * Export session data for analysis or sharing
 *
 * @param session - BankBurnSession
 * @returns Exportable session object
 */
export function exportSessionData(session: BankBurnSession): any {
  return {
    id: session.id,
    userId: session.userId,
    domainId: session.domainId,
    sessionSize: session.sessionSize,
    startTime: session.startTime.toISOString(),
    endTime: session.endTime?.toISOString(),
    completed: session.completed,
    score: session.score,
    timeSpentSeconds: session.timeSpentSeconds,
    stats: getSessionStats(session),
    options: session.options,
  };
}
