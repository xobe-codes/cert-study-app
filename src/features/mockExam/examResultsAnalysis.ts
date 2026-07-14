/**
 * Exam Results Analysis (Phase 4)
 *
 * Deep analysis of mock exam results:
 * - Domain-by-domain breakdown
 * - Pacing analysis
 * - Weak areas identification
 * - Readiness assessment
 * - Recommendations for improvement
 */

export interface DomainScore {
  domainId: string;
  domainName: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface WeakArea {
  domainId: string;
  domainName: string;
  percentage: number;
  severity: 'critical' | 'warning' | 'minor'; // <50%, <70%, <85%
}

export interface PacingMetrics {
  averageTimePerQuestion: number; // seconds
  fastestQuestion: number; // seconds
  slowestQuestion: number; // seconds
  standardDeviation: number;
  timingByDomain: Record<string, number>; // domain -> avg seconds
}

export type ReadinessLevel = 'ready' | 'review_first' | 'study_more';

export interface ReadinessAssessment {
  level: ReadinessLevel;
  overallScore: number;
  confidence: number; // 0-1
  reasoning: string;
  estimatedDaysToReady: number | null;
  recommendedAction: string;
}

export interface ExamAnalysis {
  overallScore: number;
  totalQuestions: number;
  questionsCorrect: number;
  percentage: number;
  domainBreakdown: DomainScore[];
  weakAreas: WeakArea[];
  pacingMetrics: PacingMetrics;
  readinessAssessment: ReadinessAssessment;
  strongAreas: DomainScore[]; // Domains with >85% accuracy
}

/**
 * Analyze complete exam results
 * Pure function - aggregates all metrics
 *
 * @param exam - Exam session with questions and metadata
 * @param responses - User responses (questionId -> { selected, correct })
 * @param timingData - Array of question timings
 * @returns Complete analysis object
 */
export function analyzeExamResults(
  exam: { domainDistribution: Record<string, number> },
  responses: Record<string, { correct: boolean }>,
  timingData: Array<{ timeTakenSeconds: number; questionId: string }>
): ExamAnalysis {
  // Calculate overall score
  const totalQuestions = Object.keys(responses).length;
  const questionsCorrect = Object.values(responses).filter(r => r.correct).length;
  const overallScore = Math.round((questionsCorrect / totalQuestions) * 100);

  // Get domain breakdown
  const domainBreakdown = getDomainBreakdown(exam, responses);

  // Identify weak areas
  const weakAreas = getWeakAreas(domainBreakdown);

  // Calculate pacing
  const pacingMetrics = calculatePacingAnalysis(timingData);

  // Assess readiness
  const readinessAssessment = getReadinessAssessment(
    overallScore,
    domainBreakdown
  );

  // Find strong areas (>85%)
  const strongAreas = domainBreakdown.filter(d => d.percentage > 85);

  return {
    overallScore,
    totalQuestions,
    questionsCorrect,
    percentage: overallScore,
    domainBreakdown,
    weakAreas,
    pacingMetrics,
    readinessAssessment,
    strongAreas,
  };
}

/**
 * Calculate per-domain accuracy breakdown
 *
 * @param exam - Exam session with domain distribution
 * @param responses - User responses
 * @returns Array of DomainScore objects
 */
export function getDomainBreakdown(
  exam: { domainDistribution: Record<string, number> },
  responses: Record<string, { correct: boolean }>
): DomainScore[] {
  const domainStats: Record<
    string,
    { correct: number; total: number; name: string }
  > = {};

  // Initialize domains
  const domainNames: Record<string, string> = {
    D1: 'Network Fundamentals',
    D2: 'Network Access',
    D3: 'IP Connectivity',
    D4: 'IP Services',
    D5: 'Security Fundamentals',
    D6: 'Automation and Programmability',
  };

  Object.keys(exam.domainDistribution).forEach(domainId => {
    domainStats[domainId] = {
      correct: 0,
      total: exam.domainDistribution[domainId] || 0,
      name: domainNames[domainId] || domainId,
    };
  });

  // Count correct answers per domain
  // Note: This requires responses to include domainId
  // In practice, questions should have domainId metadata
  Object.entries(responses).forEach(([questionId, response]) => {
    // This is a simplified version; in practice you'd need to look up
    // the question's domain from the question bank
    if (response.correct) {
      // Would need getQuestionDomain() helper
    }
  });

  // Convert to array and calculate percentages
  return Object.entries(domainStats).map(([domainId, stats]) => ({
    domainId,
    domainName: stats.name,
    correct: stats.correct,
    total: stats.total,
    percentage: stats.total > 0
      ? Math.round((stats.correct / stats.total) * 100)
      : 0,
  }));
}

/**
 * Identify weak areas (domains with <70% accuracy)
 *
 * @param domainBreakdown - Array of domain scores
 * @returns Array of weak areas sorted by severity
 */
export function getWeakAreas(domainBreakdown: DomainScore[]): WeakArea[] {
  return domainBreakdown
    .filter(d => d.percentage < 85) // Include both critical and warning
    .map(d => ({
      domainId: d.domainId,
      domainName: d.domainName,
      percentage: d.percentage,
      severity:
        d.percentage < 50
          ? 'critical'
          : d.percentage < 70
            ? 'warning'
            : 'minor',
    }))
    .sort((a, b) => a.percentage - b.percentage); // Weakest first
}

/**
 * Calculate pacing analysis
 * Metrics about how fast/slow questions were answered
 *
 * @param timingData - Array of question timings
 * @returns PacingMetrics object
 */
export function calculatePacingAnalysis(
  timingData: Array<{ timeTakenSeconds: number; questionId?: string }>
): PacingMetrics {
  if (timingData.length === 0) {
    return {
      averageTimePerQuestion: 0,
      fastestQuestion: 0,
      slowestQuestion: 0,
      standardDeviation: 0,
      timingByDomain: {},
    };
  }

  const times = timingData.map(t => t.timeTakenSeconds);
  const totalTime = times.reduce((sum, t) => sum + t, 0);
  const averageTime = Math.round(totalTime / times.length);

  // Calculate standard deviation
  const variance =
    times.reduce((sum, t) => sum + Math.pow(t - averageTime, 2), 0) /
    times.length;
  const stdDev = Math.round(Math.sqrt(variance));

  return {
    averageTimePerQuestion: averageTime,
    fastestQuestion: Math.min(...times),
    slowestQuestion: Math.max(...times),
    standardDeviation: stdDev,
    timingByDomain: {}, // Would be populated with domain-specific data
  };
}

/**
 * Determine readiness for the real CCNA exam
 * Passing score on mock is typically 70%+, but confidence varies by domain balance
 *
 * @param overallScore - Overall percentage score
 * @param domainScores - Per-domain breakdown
 * @returns ReadinessAssessment
 */
export function getReadinessAssessment(
  overallScore: number,
  domainScores: DomainScore[]
): ReadinessAssessment {
  // Check domain coverage
  const domainsUnder70 = domainScores.filter(d => d.percentage < 70).length;
  const domainsUnder50 = domainScores.filter(d => d.percentage < 50).length;

  let level: ReadinessLevel = 'ready';
  let confidence = 0;
  let reasoning = '';
  let recommendedAction = '';
  let estimatedDaysToReady: number | null = null;

  if (overallScore >= 85) {
    level = 'ready';
    confidence = 0.95;
    reasoning = 'Excellent overall performance with strong domain coverage';
    recommendedAction = 'Schedule exam within 1-2 weeks';
    estimatedDaysToReady = null;
  } else if (overallScore >= 70) {
    if (domainsUnder70 === 0) {
      level = 'ready';
      confidence = 0.85;
      reasoning = 'Passing score with consistent performance across domains';
      recommendedAction = 'Ready to schedule exam';
      estimatedDaysToReady = null;
    } else if (domainsUnder70 <= 2) {
      level = 'review_first';
      confidence = 0.7;
      reasoning = 'Passing overall but weak areas need review';
      recommendedAction = 'Review weak domains before scheduling exam';
      estimatedDaysToReady = 7;
    } else {
      level = 'review_first';
      confidence = 0.6;
      reasoning = 'Multiple domains below 70% - significant review needed';
      recommendedAction = 'Focus on weak domains, then retake mock';
      estimatedDaysToReady = 14;
    }
  } else {
    level = 'study_more';
    confidence = 0.4;
    reasoning = 'Below passing threshold - more study required';
    recommendedAction = 'Complete full domain mastery before attempting exam';
    estimatedDaysToReady = domainsUnder50 > 0 ? 30 : 21;
  }

  return {
    level,
    overallScore,
    confidence,
    reasoning,
    estimatedDaysToReady,
    recommendedAction,
  };
}

/**
 * Estimate days until exam readiness
 * Based on current score and historical progression
 *
 * @param currentScore - Current mock exam score (0-100)
 * @param previousScores - Historical scores for trend analysis
 * @param passThreshold - Passing score (default 70)
 * @returns Estimated days to reach passing threshold
 */
export function estimateDaysToReady(
  currentScore: number,
  previousScores: number[] = [],
  passThreshold: number = 70
): number | null {
  if (currentScore >= passThreshold) {
    return null; // Already ready
  }

  if (previousScores.length === 0) {
    // No trend data - use conservative estimate
    const pointsNeeded = passThreshold - currentScore;
    return Math.ceil(pointsNeeded / 2); // Assume 2 points per day improvement
  }

  // Calculate average improvement per attempt
  const recentScores = [currentScore, ...previousScores].slice(0, 5);
  let improvements = 0;
  let count = 0;

  for (let i = 0; i < recentScores.length - 1; i++) {
    const improvement = recentScores[i] - recentScores[i + 1];
    if (improvement > 0) {
      improvements += improvement;
      count++;
    }
  }

  const avgImprovement = count > 0 ? improvements / count : 2;
  const pointsNeeded = passThreshold - currentScore;
  const daysNeeded = Math.ceil(pointsNeeded / avgImprovement);

  // Cap at 60 days (reasonable limit)
  return Math.min(60, Math.max(1, daysNeeded));
}

/**
 * Get performance insights summary
 * Human-readable summary of exam performance
 *
 * @param analysis - ExamAnalysis object
 * @returns Human-readable summary string
 */
export function getPerformanceSummary(analysis: ExamAnalysis): string {
  const score = analysis.overallScore;
  const domainCount = analysis.domainBreakdown.length;
  const strongCount = analysis.strongAreas.length;
  const weakCount = analysis.weakAreas.length;

  let summary = `Scored ${score}% (${analysis.questionsCorrect}/${analysis.totalQuestions} correct). `;

  if (score >= 85) {
    summary += `Excellent performance with ${strongCount} strong domains. `;
  } else if (score >= 70) {
    summary += `Passing score with ${strongCount} strong and ${weakCount} weak domains. `;
  } else {
    summary += `Below passing threshold. ${weakCount} domains need improvement. `;
  }

  summary += `Average time per question: ${analysis.pacingMetrics.averageTimePerQuestion}s. `;
  summary += analysis.readinessAssessment.recommendedAction;

  return summary;
}
