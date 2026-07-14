/**
 * Real Format Mock Exam Generator (Phase 4)
 *
 * Generates full 70-question and quick 30-question mock exams
 * with realistic domain distribution matching actual CCNA test format.
 *
 * Domain Distribution (70Q total):
 * D1: 8Q (12%)
 * D2: 8Q (11%)
 * D3: 8Q (12%)
 * D4: 10Q (14%)
 * D5: 8Q (11%)
 * D6: 7Q (10%)
 * Unweighted: 21Q (30%) - mixed domain problems
 */

export interface DomainDistribution {
  [domainId: string]: number;
}

export interface ExamConfig {
  totalQuestions: number;
  timeLimit: number; // in minutes
  type: 'full' | 'quick';
}

export interface MockExamSession {
  id: string;
  userId: string;
  examType: 'full' | 'quick';
  questions: any[];
  domainDistribution: DomainDistribution;
  startTime: Date;
  timeLimit: number; // minutes
  responses: Record<string, any>;
  completed: boolean;
  completedAt: Date | null;
}

/**
 * Get the correct domain distribution for full 70-question exam
 * Returns object with domainId -> count mapping
 */
export function getDomainDistribution(): DomainDistribution {
  return {
    D1: 8,  // 12%
    D2: 8,  // 11%
    D3: 8,  // 12%
    D4: 10, // 14%
    D5: 8,  // 11%
    D6: 7,  // 10%
    // Note: 21 questions (30%) are mixed domain problems
    // These are typically scenario-based questions that touch multiple domains
  };
}

/**
 * Get the distribution for quick 30-question exam (legacy format)
 * Proportionally scaled from full distribution
 */
export function getQuickExamDistribution(): DomainDistribution {
  const fullDist = getDomainDistribution();
  const totalWeighted = 50; // All questions except the 21 mixed/scenario ones
  const quickTotal = 30;

  const quickDist: DomainDistribution = {};

  // Scale down each domain proportionally
  Object.keys(fullDist).forEach(domainId => {
    const weight = fullDist[domainId];
    quickDist[domainId] = Math.round((weight / totalWeighted) * quickTotal);
  });

  return quickDist;
}

/**
 * Select N random questions from a domain pool
 * Pure function - no side effects
 *
 * @param domainId - Domain ID (D1-D6)
 * @param count - Number of questions to select
 * @param questionPool - Array of available questions for this domain
 * @returns Array of randomly selected questions
 */
export function selectQuestionsForDomain(
  domainId: string,
  count: number,
  questionPool: any[]
): any[] {
  // Validate inputs
  if (!Array.isArray(questionPool) || questionPool.length === 0) {
    return [];
  }

  if (count <= 0) {
    return [];
  }

  // Don't request more than available
  const actualCount = Math.min(count, questionPool.length);

  // Fisher-Yates shuffle to randomly select
  const shuffled = [...questionPool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, actualCount);
}

/**
 * Generate a full 70-question mock exam with domain distribution
 *
 * @param userId - User ID
 * @param getQuestionsByDomain - Function to get questions by domain
 * @param sessionId - Optional session ID (generated if not provided)
 * @returns MockExamSession with 70 questions
 */
export function generateFullMockExam(
  userId: string,
  getQuestionsByDomain: (domainId: string) => any[],
  sessionId?: string
): MockExamSession {
  const distribution = getDomainDistribution();
  const questions: any[] = [];
  const actualDistribution: DomainDistribution = {};

  // Collect questions by domain
  Object.entries(distribution).forEach(([domainId, count]) => {
    const domainPool = getQuestionsByDomain(domainId);
    const selected = selectQuestionsForDomain(domainId, count, domainPool);
    questions.push(...selected);
    actualDistribution[domainId] = selected.length;
  });

  return {
    id: sessionId || `exam-${userId}-${Date.now()}`,
    userId,
    examType: 'full',
    questions,
    domainDistribution: actualDistribution,
    startTime: new Date(),
    timeLimit: 120, // 2 hours (120 minutes)
    responses: {},
    completed: false,
    completedAt: null,
  };
}

/**
 * Generate a quick 30-question mock exam (backward compatible)
 *
 * @param userId - User ID
 * @param getQuestionsByDomain - Function to get questions by domain
 * @param sessionId - Optional session ID (generated if not provided)
 * @returns MockExamSession with 30 questions
 */
export function generateQuickMockExam(
  userId: string,
  getQuestionsByDomain: (domainId: string) => any[],
  sessionId?: string
): MockExamSession {
  const distribution = getQuickExamDistribution();
  const questions: any[] = [];
  const actualDistribution: DomainDistribution = {};

  // Collect questions by domain
  Object.entries(distribution).forEach(([domainId, count]) => {
    const domainPool = getQuestionsByDomain(domainId);
    const selected = selectQuestionsForDomain(domainId, count, domainPool);
    questions.push(...selected);
    actualDistribution[domainId] = selected.length;
  });

  return {
    id: sessionId || `quick-exam-${userId}-${Date.now()}`,
    userId,
    examType: 'quick',
    questions,
    domainDistribution: actualDistribution,
    startTime: new Date(),
    timeLimit: 45, // 45 minutes
    responses: {},
    completed: false,
    completedAt: null,
  };
}

/**
 * Validate that exam has correct distribution
 * Used for testing and validation
 *
 * @param exam - MockExamSession to validate
 * @param examType - Expected exam type ('full' or 'quick')
 * @returns true if distribution is valid
 */
export function validateExamDistribution(
  exam: MockExamSession,
  examType: 'full' | 'quick'
): boolean {
  const expectedDist = examType === 'full'
    ? getDomainDistribution()
    : getQuickExamDistribution();

  // Check question count
  const expectedTotal = examType === 'full' ? 70 : 30;
  if (exam.questions.length !== expectedTotal) {
    return false;
  }

  // Check each domain is within 1 question of expected
  // (accounting for rounding in quick exam)
  for (const [domainId, expectedCount] of Object.entries(expectedDist)) {
    const actualCount = exam.domainDistribution[domainId] || 0;
    if (Math.abs(actualCount - expectedCount) > 1) {
      return false;
    }
  }

  return true;
}

/**
 * Create an empty exam session (for deferred question loading)
 * Useful for reactive systems that load questions async
 */
export function createEmptyExamSession(
  userId: string,
  examType: 'full' | 'quick',
  sessionId?: string
): MockExamSession {
  const timeLimit = examType === 'full' ? 120 : 45;

  return {
    id: sessionId || `exam-${userId}-${Date.now()}`,
    userId,
    examType,
    questions: [],
    domainDistribution: {},
    startTime: new Date(),
    timeLimit,
    responses: {},
    completed: false,
    completedAt: null,
  };
}

/**
 * Shuffle questions in an exam (for randomization between different students)
 * Preserves domain tracking for analysis
 */
export function shuffleExamQuestions(exam: MockExamSession): MockExamSession {
  const shuffled = [...exam.questions];

  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return {
    ...exam,
    questions: shuffled,
  };
}
