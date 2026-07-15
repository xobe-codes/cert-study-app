/**
 * Lab Badges System (Phase 4A)
 *
 * Gamification through difficulty badges that reward:
 * - Efficiency (few attempts)
 * - Speed (fast completion)
 * - Thoroughness (all checkpoints)
 * - Perfection (first try)
 * - Creativity (unconventional solutions)
 * - Introspection (own mistake identification)
 */

export type BadgeType =
  | 'master'
  | 'speedRunner'
  | 'learningMode'
  | 'perfectFirst'
  | 'problemSolver'
  | 'mistakeHunter'

export interface Badge {
  id: string // Unique badge ID: 'master-vlan-trunk-lab'
  type: BadgeType
  labId: string
  userId: string
  earnedAt: Date
  metadata: {
    timeTaken?: number // milliseconds
    attempts?: number
    hintsUsed?: number
    checkpointsCompleted?: number
    totalCheckpoints?: number
    mistakesIdentified?: number
    percentileRank?: number
  }
}

export interface BadgeDisplay {
  type: BadgeType
  icon: string // emoji or icon identifier
  title: string
  description: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  condition: string // Human-readable earning condition
}

export interface LabResult {
  labId: string
  userId: string
  completedAt: Date
  timeTakenSeconds: number
  attempts: number
  checkpointsCompleted: number
  totalCheckpoints: number
  hintsUsed: number
  mistakesIdentified: number
  percentileRank?: number // User's rank vs peers (0-100)
  commandsTyped: number
  errorCount: number
}

/**
 * Calculate which badges user earned for this lab completion
 *
 * @param labResult - Lab completion result
 * @param medianCompletionTime - Median completion time in seconds (for speed comparison)
 * @returns Array of earned badges
 */
export function calculateBadges(
  labResult: LabResult,
  medianCompletionTime: number = 300
): Badge[] {
  const badges: Badge[] = []
  const baseId = `${labResult.labId}-${labResult.userId}`

  // MASTER badge: All checkpoints, < 3 attempts, < 10 hints, reasonable time
  if (
    labResult.checkpointsCompleted === labResult.totalCheckpoints &&
    labResult.attempts < 3 &&
    labResult.hintsUsed < 10
  ) {
    badges.push({
      id: `master-${baseId}`,
      type: 'master',
      labId: labResult.labId,
      userId: labResult.userId,
      earnedAt: labResult.completedAt,
      metadata: {
        attempts: labResult.attempts,
        hintsUsed: labResult.hintsUsed,
        checkpointsCompleted: labResult.checkpointsCompleted,
        timeTaken: labResult.timeTakenSeconds * 1000,
      },
    })
  }

  // SPEED RUNNER badge: Complete in < 50% of median time
  const speedThreshold = medianCompletionTime * 0.5
  if (
    labResult.timeTakenSeconds < speedThreshold &&
    labResult.checkpointsCompleted === labResult.totalCheckpoints
  ) {
    badges.push({
      id: `speedRunner-${baseId}`,
      type: 'speedRunner',
      labId: labResult.labId,
      userId: labResult.userId,
      earnedAt: labResult.completedAt,
      metadata: {
        timeTaken: labResult.timeTakenSeconds * 1000,
        percentileRank: 95, // Top 5%
      },
    })
  }

  // LEARNING MODE badge: All checkpoints with hints (shows persistence)
  if (
    labResult.checkpointsCompleted === labResult.totalCheckpoints &&
    labResult.hintsUsed > 0 &&
    labResult.attempts >= 2
  ) {
    badges.push({
      id: `learningMode-${baseId}`,
      type: 'learningMode',
      labId: labResult.labId,
      userId: labResult.userId,
      earnedAt: labResult.completedAt,
      metadata: {
        attempts: labResult.attempts,
        hintsUsed: labResult.hintsUsed,
        checkpointsCompleted: labResult.checkpointsCompleted,
      },
    })
  }

  // PERFECT FIRST badge: Pass all checkpoints on first attempt
  if (labResult.attempts === 1 && labResult.errorCount === 0) {
    badges.push({
      id: `perfectFirst-${baseId}`,
      type: 'perfectFirst',
      labId: labResult.labId,
      userId: labResult.userId,
      earnedAt: labResult.completedAt,
      metadata: {
        checkpointsCompleted: labResult.checkpointsCompleted,
        timeTaken: labResult.timeTakenSeconds * 1000,
      },
    })
  }

  // PROBLEM SOLVER badge: Unconventional solution path or high error recovery
  if (labResult.errorCount > 5 && labResult.checkpointsCompleted === labResult.totalCheckpoints) {
    badges.push({
      id: `problemSolver-${baseId}`,
      type: 'problemSolver',
      labId: labResult.labId,
      userId: labResult.userId,
      earnedAt: labResult.completedAt,
      metadata: {
        errorCount: labResult.errorCount,
        attempts: labResult.attempts,
      },
    })
  }

  // MISTAKE HUNTER badge: Identified and fixed multiple mistakes
  if (labResult.mistakesIdentified >= 3) {
    badges.push({
      id: `mistakeHunter-${baseId}`,
      type: 'mistakeHunter',
      labId: labResult.labId,
      userId: labResult.userId,
      earnedAt: labResult.completedAt,
      metadata: {
        mistakesIdentified: labResult.mistakesIdentified,
      },
    })
  }

  return badges
}

/**
 * Get display information for a badge
 *
 * @param badge - Badge to display
 * @returns Display information including icon, title, description
 */
export function getBadgeDisplay(badge: Badge): BadgeDisplay {
  const displays: Record<BadgeType, BadgeDisplay> = {
    master: {
      type: 'master',
      icon: '👑',
      title: 'Master',
      description: 'Completed all checkpoints with minimal attempts and hints',
      rarity: 'epic',
      condition: 'All checkpoints + <3 attempts + <10 hints',
    },
    speedRunner: {
      type: 'speedRunner',
      icon: '⚡',
      title: 'Speed Runner',
      description: 'Completed the lab in less than 50% of the median time',
      rarity: 'epic',
      condition: 'Time < 50% of median',
    },
    learningMode: {
      type: 'learningMode',
      icon: '📚',
      title: 'Learning Mode',
      description: 'Completed all checkpoints while making effective use of hints',
      rarity: 'uncommon',
      condition: 'All checkpoints + used hints + multiple attempts',
    },
    perfectFirst: {
      type: 'perfectFirst',
      icon: '💯',
      title: 'Perfect First',
      description: 'Passed all checkpoints on the first attempt with no errors',
      rarity: 'legendary',
      condition: 'First attempt + zero errors',
    },
    problemSolver: {
      type: 'problemSolver',
      icon: '🧩',
      title: 'Problem Solver',
      description: 'Overcame multiple errors to successfully complete the lab',
      rarity: 'rare',
      condition: '5+ errors overcome',
    },
    mistakeHunter: {
      type: 'mistakeHunter',
      icon: '🔍',
      title: 'Mistake Hunter',
      description: 'Identified and corrected multiple mistakes during the lab',
      rarity: 'uncommon',
      condition: '3+ mistakes identified',
    },
  }

  return displays[badge.type]
}

/**
 * Get all available badge types
 *
 * @returns Array of all possible badge displays
 */
export function getAllBadgeTypes(): BadgeDisplay[] {
  const types: BadgeType[] = [
    'master',
    'speedRunner',
    'learningMode',
    'perfectFirst',
    'problemSolver',
    'mistakeHunter',
  ]
  return types.map((type) => {
    const badge: Badge = {
      id: type,
      type,
      labId: 'unknown',
      userId: 'unknown',
      earnedAt: new Date(),
      metadata: {},
    }
    return getBadgeDisplay(badge)
  })
}

/**
 * Compare badge rarity scores
 *
 * @param badge1 - First badge to compare
 * @param badge2 - Second badge to compare
 * @returns -1 if badge1 is less rare, 0 if equal, 1 if badge1 is rarer
 */
export function compareBadgeRarity(display1: BadgeDisplay, display2: BadgeDisplay): number {
  const rarityRank: Record<string, number> = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
  }
  return rarityRank[display1.rarity] - rarityRank[display2.rarity]
}

/**
 * Calculate user's badge collection statistics
 *
 * @param badges - Array of user's badges
 * @returns Statistics about badge collection
 */
export function calculateBadgeStats(badges: Badge[]) {
  const typeCount: Record<BadgeType, number> = {
    master: 0,
    speedRunner: 0,
    learningMode: 0,
    perfectFirst: 0,
    problemSolver: 0,
    mistakeHunter: 0,
  }

  badges.forEach((badge) => {
    typeCount[badge.type]++
  })

  const rarityCount: Record<string, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  }

  badges.forEach((badge) => {
    const display = getBadgeDisplay(badge)
    rarityCount[display.rarity]++
  })

  return {
    totalBadges: badges.length,
    byType: typeCount,
    byRarity: rarityCount,
    uniqueTypes: Object.values(typeCount).filter((count) => count > 0).length,
  }
}

/**
 * Filter badges by type
 *
 * @param badges - Array of badges
 * @param type - Badge type to filter by
 * @returns Filtered badges
 */
export function filterBadgesByType(badges: Badge[], type: BadgeType): Badge[] {
  return badges.filter((badge) => badge.type === type)
}

/**
 * Sort badges by rarity (highest first)
 *
 * @param badges - Array of badges
 * @returns Sorted badges
 */
export function sortBadgesByRarity(badges: Badge[]): Badge[] {
  return [...badges].sort((a, b) => {
    const displayA = getBadgeDisplay(a)
    const displayB = getBadgeDisplay(b)
    return compareBadgeRarity(displayB, displayA)
  })
}
