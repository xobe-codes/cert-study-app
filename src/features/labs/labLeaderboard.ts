/**
 * Lab Leaderboard & Anomaly Detection (Phase 4B)
 *
 * Tracks per-lab statistics and detects suspicious activity:
 * - Ranking users by completion time, attempts, and score
 * - Flagging impossibly fast completions
 * - Detecting copy-paste patterns
 * - Comparing user performance to peers
 */

export interface LabCompletionStats {
  userId: string
  labId: string
  completedAt: Date
  timeTakenSeconds: number
  attempts: number
  score: number // 0-100
  checkpointsCompleted: number
  totalCheckpoints: number
  hintsUsed: number
  perfectFirstTry: boolean
  mistakesIdentified: number
}

export interface UserLabRanking {
  rank: number // 1 = best
  userId: string
  percentile: number // 0-100, where 100 = best
  statistic: 'time' | 'attempts' | 'score'
  value: number
}

export interface LabLeaderboard {
  labId: string
  statistic: 'fastest' | 'fewest_attempts' | 'highest_score'
  rankings: UserLabRanking[]
  medianTime: number
  medianAttempts: number
  averageScore: number
  totalCompletions: number
}

export interface AnomalyReport {
  userId: string
  labId: string
  anomalyType: 'impossibly_fast' | 'copy_paste_pattern' | 'statistical_outlier'
  severity: 'low' | 'medium' | 'high'
  details: Record<string, any>
  flaggedAt: Date
  resolved: boolean
}

export interface CompletionPattern {
  userId: string
  commandSequence: string[]
  timingPattern: number[] // Time between commands in ms
  isIdentical: boolean // Matches another user's pattern exactly
  matchedWithUserId?: string
  similarity: number // 0-1, where 1 = identical
}

// In-memory storage (would be database in production)
const leaderboards: Map<string, LabCompletionStats[]> = new Map()
const anomalyReports: Map<string, AnomalyReport[]> = new Map()

/**
 * Record a lab completion with full statistics
 *
 * @param stats - Lab completion statistics
 */
export function recordLabCompletion(stats: LabCompletionStats): void {
  const key = stats.labId
  if (!leaderboards.has(key)) {
    leaderboards.set(key, [])
  }
  leaderboards.get(key)!.push(stats)

  // Check for anomalies after recording
  checkForAnomalies(stats)
}

/**
 * Get user's ranking for a specific lab
 *
 * @param userId - User ID
 * @param labId - Lab ID
 * @param statistic - Which statistic to rank by
 * @returns User's ranking info
 */
export function getUserRanking(
  userId: string,
  labId: string,
  statistic: 'time' | 'attempts' | 'score' = 'score'
): UserLabRanking | null {
  const completions = leaderboards.get(labId) || []
  const userCompletion = completions.find((c) => c.userId === userId)

  if (!userCompletion) {
    return null
  }

  const values: number[] = []
  completions.forEach((c) => {
    switch (statistic) {
      case 'time':
        values.push(c.timeTakenSeconds)
        break
      case 'attempts':
        values.push(c.attempts)
        break
      case 'score':
        values.push(c.score)
        break
    }
  })

  const userValue = getUserStatisticValue(userCompletion, statistic)

  // Sort based on statistic (lower is better for time/attempts, higher for score)
  const isLowerBetter = statistic !== 'score'
  const sortedValues = [...values].sort((a, b) => (isLowerBetter ? a - b : b - a))

  const rank = sortedValues.indexOf(userValue) + 1
  const percentile = Math.round(((completions.length - rank) / completions.length) * 100)

  return {
    rank,
    userId,
    percentile,
    statistic,
    value: userValue,
  }
}

/**
 * Get leaderboard for a lab (top 10 for each statistic)
 *
 * @param labId - Lab ID
 * @returns Leaderboards for all statistics
 */
export function getLabLeaderboards(labId: string): {
  fastest: LabLeaderboard
  fewest_attempts: LabLeaderboard
  highest_score: LabLeaderboard
} {
  const completions = leaderboards.get(labId) || []

  if (completions.length === 0) {
    return {
      fastest: createEmptyLeaderboard(labId, 'fastest'),
      fewest_attempts: createEmptyLeaderboard(labId, 'fewest_attempts'),
      highest_score: createEmptyLeaderboard(labId, 'highest_score'),
    }
  }

  return {
    fastest: createLeaderboard(completions, labId, 'fastest'),
    fewest_attempts: createLeaderboard(completions, labId, 'fewest_attempts'),
    highest_score: createLeaderboard(completions, labId, 'highest_score'),
  }
}

/**
 * Detect suspicious activity for a lab completion
 *
 * @param stats - Lab completion statistics
 * @returns Array of anomaly reports if suspicious patterns detected
 */
export function detectAnomalies(stats: LabCompletionStats): AnomalyReport[] {
  const anomalies: AnomalyReport[] = []

  // Check for impossibly fast completions
  const timingAnomaly = detectImpossiblvFastCompletion(stats)
  if (timingAnomaly) {
    anomalies.push(timingAnomaly)
  }

  // Check for statistical outliers
  const outlierAnomaly = detectStatisticalOutlier(stats)
  if (outlierAnomaly) {
    anomalies.push(outlierAnomaly)
  }

  return anomalies
}

/**
 * Detect if completion time is impossibly fast (< 10% of median)
 *
 * @param stats - Lab completion statistics
 * @returns Anomaly report if detected
 */
export function detectImpossiblvFastCompletion(stats: LabCompletionStats): AnomalyReport | null {
  const completions = leaderboards.get(stats.labId) || []

  if (completions.length < 5) {
    return null // Need enough data to establish baseline
  }

  const times = completions.map((c) => c.timeTakenSeconds).sort((a, b) => a - b)
  const median = times[Math.floor(times.length / 2)]
  const threshold = median * 0.1

  if (stats.timeTakenSeconds < threshold) {
    return {
      userId: stats.userId,
      labId: stats.labId,
      anomalyType: 'impossibly_fast',
      severity: 'high',
      details: {
        timeTakenSeconds: stats.timeTakenSeconds,
        medianTime: median,
        threshold,
        percentOfMedian: (stats.timeTakenSeconds / median) * 100,
      },
      flaggedAt: new Date(),
      resolved: false,
    }
  }

  return null
}

/**
 * Detect statistical outliers (perfect scores with unusual patterns)
 *
 * @param stats - Lab completion statistics
 * @returns Anomaly report if detected
 */
export function detectStatisticalOutlier(stats: LabCompletionStats): AnomalyReport | null {
  // Perfect first-try with impossibly low error count and perfect score
  if (stats.perfectFirstTry && stats.score === 100 && stats.attempts === 1 && stats.hintsUsed === 0) {
    // Check if this is consistent with their history
    const completions = leaderboards.get(stats.labId) || []
    const userCompletions = completions.filter((c) => c.userId === stats.userId)

    // If user typically needs multiple attempts, this is suspicious
    if (userCompletions.length > 0) {
      const avgAttempts =
        userCompletions.reduce((sum, c) => sum + c.attempts, 0) / userCompletions.length
      if (avgAttempts > 2 && stats.attempts === 1) {
        return {
          userId: stats.userId,
          labId: stats.labId,
          anomalyType: 'statistical_outlier',
          severity: 'medium',
          details: {
            userAvgAttempts: avgAttempts,
            thisAttempt: stats.attempts,
            score: stats.score,
            perfectFirstTry: stats.perfectFirstTry,
          },
          flaggedAt: new Date(),
          resolved: false,
        }
      }
    }
  }

  return null
}

/**
 * Detect similar command sequences between users (copy-paste detection)
 *
 * @param pattern1 - First user's command pattern
 * @param pattern2 - Second user's command pattern
 * @returns Similarity score (0-1)
 */
export function detectCopyPastePattern(pattern1: CompletionPattern, pattern2: CompletionPattern): number {
  const seq1 = pattern1.commandSequence
  const seq2 = pattern2.commandSequence

  // If sequences are identical, it's definitely suspicious
  if (seq1.length === seq2.length && seq1.every((cmd, idx) => cmd === seq2[idx])) {
    return 1.0
  }

  // Calculate Levenshtein distance for similarity
  const distance = levenshteinDistance(seq1.join(' '), seq2.join(' '))
  const maxLength = Math.max(seq1.join(' ').length, seq2.join(' ').length)

  return Math.max(0, 1 - distance / maxLength)
}

/**
 * Calculate Levenshtein distance between two strings
 *
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Distance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * Get all anomaly reports for a lab
 *
 * @param labId - Lab ID
 * @returns Array of anomaly reports
 */
export function getLabAnomalies(labId: string): AnomalyReport[] {
  return anomalyReports.get(labId) || []
}

/**
 * Get anomaly reports for a specific user
 *
 * @param userId - User ID
 * @returns Array of anomaly reports
 */
export function getUserAnomalies(userId: string): AnomalyReport[] {
  const allAnomalies: AnomalyReport[] = []
  anomalyReports.forEach((reports) => {
    allAnomalies.push(...reports.filter((r) => r.userId === userId))
  })
  return allAnomalies
}

/**
 * Resolve an anomaly report
 *
 * @param labId - Lab ID
 * @param anomalyIndex - Index of anomaly to resolve
 * @param resolved - Whether issue was confirmed
 */
export function resolveAnomaly(labId: string, anomalyIndex: number, resolved: boolean): void {
  const reports = anomalyReports.get(labId) || []
  if (reports[anomalyIndex]) {
    reports[anomalyIndex].resolved = resolved
  }
}

// ==================== Internal Helpers ====================

function getUserStatisticValue(completion: LabCompletionStats, statistic: string): number {
  switch (statistic) {
    case 'time':
      return completion.timeTakenSeconds
    case 'attempts':
      return completion.attempts
    case 'score':
      return completion.score
    default:
      return 0
  }
}

function createLeaderboard(
  completions: LabCompletionStats[],
  labId: string,
  statistic: 'fastest' | 'fewest_attempts' | 'highest_score'
): LabLeaderboard {
  let sortKey: 'timeTakenSeconds' | 'attempts' | 'score'
  let isAscending = true

  switch (statistic) {
    case 'fastest':
      sortKey = 'timeTakenSeconds'
      isAscending = true
      break
    case 'fewest_attempts':
      sortKey = 'attempts'
      isAscending = true
      break
    case 'highest_score':
      sortKey = 'score'
      isAscending = false
      break
  }

  const sorted = [...completions].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey]
    return isAscending ? diff : -diff
  })

  const rankings = sorted.slice(0, 10).map((completion, idx) => ({
    rank: idx + 1,
    userId: completion.userId,
    percentile: Math.round(((completions.length - idx - 1) / completions.length) * 100),
    statistic: statistic === 'fastest' ? 'time' : statistic === 'fewest_attempts' ? 'attempts' : 'score',
    value:
      statistic === 'fastest'
        ? completion.timeTakenSeconds
        : statistic === 'fewest_attempts'
          ? completion.attempts
          : completion.score,
  }))

  const times = completions.map((c) => c.timeTakenSeconds).sort((a, b) => a - b)
  const attempts = completions.map((c) => c.attempts).sort((a, b) => a - b)
  const scores = completions.map((c) => c.score).sort((a, b) => b - a)

  return {
    labId,
    statistic,
    rankings,
    medianTime: times[Math.floor(times.length / 2)],
    medianAttempts: attempts[Math.floor(attempts.length / 2)],
    averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    totalCompletions: completions.length,
  }
}

function createEmptyLeaderboard(
  labId: string,
  statistic: 'fastest' | 'fewest_attempts' | 'highest_score'
): LabLeaderboard {
  return {
    labId,
    statistic,
    rankings: [],
    medianTime: 0,
    medianAttempts: 0,
    averageScore: 0,
    totalCompletions: 0,
  }
}

function checkForAnomalies(stats: LabCompletionStats): void {
  const anomalies = detectAnomalies(stats)
  if (anomalies.length > 0) {
    const key = stats.labId
    if (!anomalyReports.has(key)) {
      anomalyReports.set(key, [])
    }
    anomalyReports.get(key)!.push(...anomalies)
  }
}
