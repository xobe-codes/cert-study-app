/**
 * Weak-Area Retakes (Phase 1)
 *
 * Handles logic for:
 * - Identifying weak topics from baseline responses
 * - Generating focused weak-area retake sessions (5 questions)
 * - Recording weak-area attempt performance
 * - Calculating weak-area mastery status
 */

export interface BaselineResponse {
  questionId: string;
  topicId: string;
  correct: boolean;
  userAnswer?: string;
  correctAnswer?: string;
}

export interface WeakTopic {
  topicId: string;
  missCount: number;
  totalAttempted: number;
  accuracy: number; // 0-100
}

export interface WeakAreaRetakeSession {
  id: string;
  userId: string;
  domainId: string;
  attemptNumber: number;
  weakTopics: WeakTopic[];
  selectedQuestionIds: string[];
  createdDate: Date;
}

export interface WeakAreaRetakeAttempt {
  sessionId: string;
  userId: string;
  domainId: string;
  attemptNumber: number;
  score: number;
  totalQuestions: number;
  accuracy: number; // 0-100
  attemptDate: Date;
  weakTopicsAddressed: string[];
}

/**
 * Identify weak areas from baseline responses
 *
 * Rules:
 * - A topic is weak if accuracy < 80% on it
 * - Requires at least 1 question attempted on that topic
 * - Return up to 5 weak topics (sorted by miss count desc)
 *
 * Returns: WeakTopic[]
 */
export function identifyWeakAreas(
  baselineResponses: BaselineResponse[]
): WeakTopic[] {
  // Group responses by topic
  const topicStats: Record<string, { missCount: number; totalAttempted: number }> = {};

  for (const response of baselineResponses) {
    if (!topicStats[response.topicId]) {
      topicStats[response.topicId] = { missCount: 0, totalAttempted: 0 };
    }

    topicStats[response.topicId].totalAttempted += 1;
    if (!response.correct) {
      topicStats[response.topicId].missCount += 1;
    }
  }

  // Convert to WeakTopic array and filter for weak areas (< 80% accuracy)
  const weakTopics: WeakTopic[] = Object.entries(topicStats)
    .map(([topicId, stats]) => ({
      topicId,
      missCount: stats.missCount,
      totalAttempted: stats.totalAttempted,
      accuracy: Math.round(((stats.totalAttempted - stats.missCount) / stats.totalAttempted) * 100),
    }))
    .filter(topic => topic.accuracy < 80)
    .sort((a, b) => b.missCount - a.missCount)
    .slice(0, 5); // Max 5 weak topics

  return weakTopics;
}

/**
 * Generate a weak-area retake session
 *
 * Creates a session for the user to retake questions on weak areas
 * - Questions are selected from weak topics
 * - Total questions: 5 (one per weak topic if possible, else duplicates)
 * - Questions should be DIFFERENT from baseline questions (if possible)
 *
 * Note: This is a specification function; actual question selection
 * depends on question pool. Implementation would accept a question pool.
 *
 * Returns: WeakAreaRetakeSession
 */
export function generateWeakAreaRetakeSession(
  userId: string,
  domainId: string,
  weakTopics: WeakTopic[],
  attemptNumber: number = 1
): WeakAreaRetakeSession {
  // In production, this would select questions from the question pool
  // For now, we just structure the session
  const selectedQuestionIds: string[] = [];

  // Placeholder: would be populated by actual question selection logic
  // const questionsPerTopic = Math.ceil(5 / weakTopics.length);
  // for (const topic of weakTopics) {
  //   const topicQuestions = questionPool
  //     .filter(q => q.topicId === topic.topicId && !baselineQuestionIds.includes(q.id))
  //     .slice(0, questionsPerTopic);
  //   selectedQuestionIds.push(...topicQuestions.map(q => q.id));
  // }
  // selectedQuestionIds.length should be capped at 5

  const session: WeakAreaRetakeSession = {
    id: `retake_${userId}_${domainId}_${Date.now()}`,
    userId,
    domainId,
    attemptNumber,
    weakTopics,
    selectedQuestionIds: selectedQuestionIds.slice(0, 5), // Max 5 questions
    createdDate: new Date(),
  };

  return session;
}

/**
 * Record a weak-area retake attempt
 *
 * Tracks:
 * - Score achieved on the retake
 * - Which weak topics were addressed
 * - Date of attempt
 *
 * Returns: WeakAreaRetakeAttempt
 */
export function recordWeakAreaRetakeAttempt(
  userId: string,
  sessionId: string,
  domainId: string,
  attemptNumber: number,
  score: number,
  totalQuestions: number,
  weakTopicsAddressed: string[] = []
): WeakAreaRetakeAttempt {
  const accuracy = Math.round((score / totalQuestions) * 100);

  const attempt: WeakAreaRetakeAttempt = {
    sessionId,
    userId,
    domainId,
    attemptNumber,
    score,
    totalQuestions,
    accuracy,
    attemptDate: new Date(),
    weakTopicsAddressed,
  };

  return attempt;
}

/**
 * Check if weak-area retake is showing mastery (≥ 80%)
 *
 * Returns: boolean
 */
export function isWeakAreaMastered(attempt: WeakAreaRetakeAttempt): boolean {
  return attempt.accuracy >= 80;
}

/**
 * Get weak areas still needing work after a retake attempt
 *
 * Compares response accuracy on weak topics to original baseline performance
 * Returns topics where accuracy improved < 15 percentage points
 *
 * Returns: WeakTopic[]
 */
export function identifyRemainingWeakAreas(
  retakeResponses: BaselineResponse[],
  originalWeakTopics: WeakTopic[]
): WeakTopic[] {
  // Re-analyze responses to get current accuracy
  const currentStats: Record<string, { missCount: number; totalAttempted: number }> = {};

  for (const response of retakeResponses) {
    if (!currentStats[response.topicId]) {
      currentStats[response.topicId] = { missCount: 0, totalAttempted: 0 };
    }

    currentStats[response.topicId].totalAttempted += 1;
    if (!response.correct) {
      currentStats[response.topicId].missCount += 1;
    }
  }

  // Filter for topics that still haven't improved enough
  const remaining: WeakTopic[] = [];

  for (const topic of originalWeakTopics) {
    if (currentStats[topic.topicId]) {
      const currentAccuracy = Math.round(
        ((currentStats[topic.topicId].totalAttempted - currentStats[topic.topicId].missCount) /
          currentStats[topic.topicId].totalAttempted) *
          100
      );

      // If improvement is < 15%, still weak
      if (currentAccuracy - topic.accuracy < 15) {
        remaining.push({
          topicId: topic.topicId,
          missCount: currentStats[topic.topicId].missCount,
          totalAttempted: currentStats[topic.topicId].totalAttempted,
          accuracy: currentAccuracy,
        });
      }
    } else {
      // Topic wasn't in retake, assume still weak
      remaining.push(topic);
    }
  }

  return remaining.sort((a, b) => b.missCount - a.missCount);
}

/**
 * Calculate mastery progress (percentage of weak areas improved to 80%+)
 *
 * Returns: {improved: number, total: number, percentage: number}
 */
export function calculateWeakAreaProgress(
  originalWeakTopics: WeakTopic[],
  currentWeakTopics: WeakTopic[]
): { improved: number; total: number; percentage: number } {
  const total = originalWeakTopics.length;
  const improved = total - currentWeakTopics.length;
  const percentage = total > 0 ? Math.round((improved / total) * 100) : 0;

  return { improved, total, percentage };
}
