/**
 * Lab Gamification Tests (Phase 4)
 *
 * 30+ comprehensive tests for:
 * - Badge calculation and display
 * - Leaderboard ranking
 * - Anomaly detection
 * - Polish & UX features
 * - Dashboard integration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// ==================== Badge System Tests ====================
import {
  calculateBadges,
  getBadgeDisplay,
  getAllBadgeTypes,
  compareBadgeRarity,
  calculateBadgeStats,
  filterBadgesByType,
  sortBadgesByRarity,
  Badge,
  LabResult,
  BadgeType,
} from '../features/labs/labBadges'

describe('Badge System', () => {
  let testLabResult: LabResult

  beforeEach(() => {
    testLabResult = {
      labId: 'vlan-trunk-lab',
      userId: 'user1',
      completedAt: new Date(),
      timeTakenSeconds: 300,
      attempts: 1,
      checkpointsCompleted: 5,
      totalCheckpoints: 5,
      hintsUsed: 0,
      mistakesIdentified: 0,
      commandsTyped: 20,
      errorCount: 0,
    }
  })

  // Master Badge Tests
  it('should award Master badge for perfect execution', () => {
    testLabResult.attempts = 2
    testLabResult.hintsUsed = 5

    const badges = calculateBadges(testLabResult)
    const masterBadge = badges.find((b) => b.type === 'master')

    expect(masterBadge).toBeDefined()
    expect(masterBadge?.metadata.attempts).toBe(2)
  })

  it('should NOT award Master badge if attempts exceed 3', () => {
    testLabResult.attempts = 4

    const badges = calculateBadges(testLabResult)
    const masterBadge = badges.find((b) => b.type === 'master')

    expect(masterBadge).toBeUndefined()
  })

  it('should NOT award Master badge if not all checkpoints completed', () => {
    testLabResult.checkpointsCompleted = 4
    testLabResult.totalCheckpoints = 5

    const badges = calculateBadges(testLabResult)
    const masterBadge = badges.find((b) => b.type === 'master')

    expect(masterBadge).toBeUndefined()
  })

  // Speed Runner Badge Tests
  it('should award Speed Runner badge for fast completion', () => {
    const medianTime = 600
    testLabResult.timeTakenSeconds = 250 // Less than 50% of median

    const badges = calculateBadges(testLabResult, medianTime)
    const speedBadge = badges.find((b) => b.type === 'speedRunner')

    expect(speedBadge).toBeDefined()
    expect(speedBadge?.metadata.percentileRank).toBe(95)
  })

  it('should NOT award Speed Runner if not all checkpoints completed', () => {
    const medianTime = 600
    testLabResult.timeTakenSeconds = 250
    testLabResult.checkpointsCompleted = 3

    const badges = calculateBadges(testLabResult, medianTime)
    const speedBadge = badges.find((b) => b.type === 'speedRunner')

    expect(speedBadge).toBeUndefined()
  })

  // Learning Mode Badge Tests
  it('should award Learning Mode badge for persistent learning', () => {
    testLabResult.hintsUsed = 5
    testLabResult.attempts = 3

    const badges = calculateBadges(testLabResult)
    const learningBadge = badges.find((b) => b.type === 'learningMode')

    expect(learningBadge).toBeDefined()
  })

  it('should NOT award Learning Mode with zero attempts', () => {
    testLabResult.hintsUsed = 5
    testLabResult.attempts = 1

    const badges = calculateBadges(testLabResult)
    const learningBadge = badges.find((b) => b.type === 'learningMode')

    expect(learningBadge).toBeUndefined()
  })

  // Perfect First Try Badge Tests
  it('should award Perfect First badge for first try with no errors', () => {
    testLabResult.attempts = 1
    testLabResult.errorCount = 0

    const badges = calculateBadges(testLabResult)
    const perfectBadge = badges.find((b) => b.type === 'perfectFirst')

    expect(perfectBadge).toBeDefined()
    expect(perfectBadge?.metadata.checkpointsCompleted).toBe(5)
  })

  it('should NOT award Perfect First if errors occurred', () => {
    testLabResult.attempts = 1
    testLabResult.errorCount = 1

    const badges = calculateBadges(testLabResult)
    const perfectBadge = badges.find((b) => b.type === 'perfectFirst')

    expect(perfectBadge).toBeUndefined()
  })

  // Problem Solver Badge Tests
  it('should award Problem Solver badge for overcoming errors', () => {
    testLabResult.errorCount = 7
    testLabResult.checkpointsCompleted = 5

    const badges = calculateBadges(testLabResult)
    const solverBadge = badges.find((b) => b.type === 'problemSolver')

    expect(solverBadge).toBeDefined()
  })

  it('should NOT award Problem Solver if incomplete', () => {
    testLabResult.errorCount = 7
    testLabResult.checkpointsCompleted = 3

    const badges = calculateBadges(testLabResult)
    const solverBadge = badges.find((b) => b.type === 'problemSolver')

    expect(solverBadge).toBeUndefined()
  })

  // Mistake Hunter Badge Tests
  it('should award Mistake Hunter badge for identifying mistakes', () => {
    testLabResult.mistakesIdentified = 4

    const badges = calculateBadges(testLabResult)
    const hunterBadge = badges.find((b) => b.type === 'mistakeHunter')

    expect(hunterBadge).toBeDefined()
    expect(hunterBadge?.metadata.mistakesIdentified).toBe(4)
  })

  it('should NOT award Mistake Hunter with insufficient mistakes', () => {
    testLabResult.mistakesIdentified = 2

    const badges = calculateBadges(testLabResult)
    const hunterBadge = badges.find((b) => b.type === 'mistakeHunter')

    expect(hunterBadge).toBeUndefined()
  })

  // Badge Display Tests
  it('should return proper display for each badge type', () => {
    const badge: Badge = {
      id: 'master-test',
      type: 'master',
      labId: 'test-lab',
      userId: 'user1',
      earnedAt: new Date(),
      metadata: {},
    }

    const display = getBadgeDisplay(badge)

    expect(display.title).toBe('Master')
    expect(display.icon).toBe('👑')
    expect(display.rarity).toBe('epic')
    expect(display.condition).toContain('<3 attempts')
  })

  it('should get all available badge types', () => {
    const allBadges = getAllBadgeTypes()

    expect(allBadges).toHaveLength(6)
    expect(allBadges.map((b) => b.type)).toContain('master')
    expect(allBadges.map((b) => b.type)).toContain('speedRunner')
    expect(allBadges.map((b) => b.type)).toContain('perfectFirst')
  })

  // Badge Sorting Tests
  it('should sort badges by rarity', () => {
    const badges: Badge[] = [
      {
        id: '1',
        type: 'learningMode',
        labId: 'test',
        userId: 'user1',
        earnedAt: new Date(),
        metadata: {},
      },
      {
        id: '2',
        type: 'perfectFirst',
        labId: 'test',
        userId: 'user1',
        earnedAt: new Date(),
        metadata: {},
      },
      {
        id: '3',
        type: 'master',
        labId: 'test',
        userId: 'user1',
        earnedAt: new Date(),
        metadata: {},
      },
    ]

    const sorted = sortBadgesByRarity(badges)

    expect(sorted[0].type).toBe('perfectFirst') // legendary (highest)
    expect(sorted[1].type).toBe('master') // epic
    expect(sorted[2].type).toBe('learningMode') // uncommon
  })

  // Badge Statistics Tests
  it('should calculate badge statistics correctly', () => {
    const badges: Badge[] = [
      {
        id: '1',
        type: 'master',
        labId: 'test1',
        userId: 'user1',
        earnedAt: new Date(),
        metadata: {},
      },
      {
        id: '2',
        type: 'master',
        labId: 'test2',
        userId: 'user1',
        earnedAt: new Date(),
        metadata: {},
      },
      {
        id: '3',
        type: 'speedRunner',
        labId: 'test3',
        userId: 'user1',
        earnedAt: new Date(),
        metadata: {},
      },
    ]

    const stats = calculateBadgeStats(badges)

    expect(stats.totalBadges).toBe(3)
    expect(stats.byType.master).toBe(2)
    expect(stats.byType.speedRunner).toBe(1)
    expect(stats.uniqueTypes).toBe(2)
  })

  // Badge Filtering Tests
  it('should filter badges by type', () => {
    const badges: Badge[] = [
      {
        id: '1',
        type: 'master',
        labId: 'test',
        userId: 'user1',
        earnedAt: new Date(),
        metadata: {},
      },
      {
        id: '2',
        type: 'speedRunner',
        labId: 'test',
        userId: 'user1',
        earnedAt: new Date(),
        metadata: {},
      },
    ]

    const filtered = filterBadgesByType(badges, 'master')

    expect(filtered).toHaveLength(1)
    expect(filtered[0].type).toBe('master')
  })
})

// ==================== Leaderboard Tests ====================
import {
  recordLabCompletion,
  getUserRanking,
  getLabLeaderboards,
  detectAnomalies,
  detectImpossiblvFastCompletion,
  detectStatisticalOutlier,
  detectCopyPastePattern,
  getLabAnomalies,
  getUserAnomalies,
  LabCompletionStats,
  CompletionPattern,
} from '../features/labs/labLeaderboard'

describe('Leaderboard System', () => {
  let testStats: LabCompletionStats

  beforeEach(() => {
    testStats = {
      userId: 'user1',
      labId: 'vlan-trunk-lab',
      completedAt: new Date(),
      timeTakenSeconds: 300,
      attempts: 2,
      score: 95,
      checkpointsCompleted: 5,
      totalCheckpoints: 5,
      hintsUsed: 2,
      perfectFirstTry: false,
      mistakesIdentified: 1,
    }
  })

  // Recording Tests
  it('should record lab completion', () => {
    recordLabCompletion(testStats)

    const ranking = getUserRanking('user1', 'vlan-trunk-lab', 'score')
    expect(ranking).not.toBeNull()
    expect(ranking?.userId).toBe('user1')
  })

  // Ranking Tests
  it('should get user ranking for speed (fastest)', () => {
    const stat1 = { ...testStats, userId: 'user1', timeTakenSeconds: 300 }
    const stat2 = { ...testStats, userId: 'user2', timeTakenSeconds: 200 }
    const stat3 = { ...testStats, userId: 'user3', timeTakenSeconds: 400 }

    recordLabCompletion(stat1)
    recordLabCompletion(stat2)
    recordLabCompletion(stat3)

    const ranking = getUserRanking('user2', 'vlan-trunk-lab', 'time')

    expect(ranking?.rank).toBe(1) // user2 is fastest
    expect(ranking?.percentile).toBe(66)
  })

  it('should get user ranking for attempts', () => {
    const stat1 = { ...testStats, userId: 'user1', attempts: 3 }
    const stat2 = { ...testStats, userId: 'user2', attempts: 1 }

    recordLabCompletion(stat1)
    recordLabCompletion(stat2)

    const ranking = getUserRanking('user2', 'vlan-trunk-lab', 'attempts')

    expect(ranking?.rank).toBe(1) // user2 has fewest attempts
  })

  it('should get user ranking for score', () => {
    const stat1 = { ...testStats, userId: 'user1', score: 80 }
    const stat2 = { ...testStats, userId: 'user2', score: 95 }

    recordLabCompletion(stat1)
    recordLabCompletion(stat2)

    const ranking = getUserRanking('user2', 'vlan-trunk-lab', 'score')

    expect(ranking?.rank).toBe(1) // user2 has highest score
  })

  it('should return null for non-existent user', () => {
    recordLabCompletion(testStats)

    const ranking = getUserRanking('nonexistent', 'vlan-trunk-lab', 'score')

    expect(ranking).toBeNull()
  })

  // Leaderboard Generation Tests
  it('should generate leaderboards', () => {
    const stat1 = { ...testStats, userId: 'user1', score: 90 }
    const stat2 = { ...testStats, userId: 'user2', score: 95 }

    recordLabCompletion(stat1)
    recordLabCompletion(stat2)

    const boards = getLabLeaderboards('vlan-trunk-lab')

    expect(boards.fastest).toBeDefined()
    expect(boards.fewest_attempts).toBeDefined()
    expect(boards.highest_score).toBeDefined()
    expect(boards.highest_score.rankings.length).toBeGreaterThan(0)
  })

  // Anomaly Detection Tests
  it('should detect impossibly fast completion', () => {
    // Record some baseline completions
    for (let i = 0; i < 10; i++) {
      recordLabCompletion({
        ...testStats,
        userId: `user${i}`,
        timeTakenSeconds: 500 + i * 50,
      })
    }

    // Try to record impossibly fast time
    const suspiciousStats: LabCompletionStats = {
      ...testStats,
      userId: 'cheater',
      timeTakenSeconds: 10, // 10 seconds is <10% of median
    }

    const anomalies = detectAnomalies(suspiciousStats)

    expect(anomalies.length).toBeGreaterThan(0)
    const timingAnomaly = anomalies.find((a) => a.anomalyType === 'impossibly_fast')
    expect(timingAnomaly).toBeDefined()
    expect(timingAnomaly?.severity).toBe('high')
  })

  it('should NOT flag reasonable fast times as anomalies', () => {
    for (let i = 0; i < 10; i++) {
      recordLabCompletion({
        ...testStats,
        userId: `user${i}`,
        timeTakenSeconds: 500 + i * 50,
      })
    }

    const fastButReasonable: LabCompletionStats = {
      ...testStats,
      userId: 'user11',
      timeTakenSeconds: 300,
    }

    const anomalies = detectAnomalies(fastButReasonable)
    const timingAnomaly = anomalies.find((a) => a.anomalyType === 'impossibly_fast')

    expect(timingAnomaly).toBeUndefined()
  })

  it('should detect statistical outliers', () => {
    const stat1 = {
      ...testStats,
      userId: 'user1',
      perfectFirstTry: true,
      score: 100,
      attempts: 1,
      hintsUsed: 0,
    }

    recordLabCompletion(stat1)

    // Record several attempts by same user
    for (let i = 0; i < 5; i++) {
      recordLabCompletion({
        ...testStats,
        userId: 'user1',
        attempts: 2 + i,
      })
    }

    // Now try perfect first again
    const secondPerfect = {
      ...testStats,
      userId: 'user1',
      perfectFirstTry: true,
      score: 100,
      attempts: 1,
      hintsUsed: 0,
    }

    const anomalies = detectAnomalies(secondPerfect)
    const outlierAnomaly = anomalies.find((a) => a.anomalyType === 'statistical_outlier')

    expect(outlierAnomaly).toBeDefined()
    expect(outlierAnomaly?.severity).toBe('medium')
  })
})

// ==================== Polish & UX Tests ====================
import {
  getEncouragementMessage,
  determineEncouragementLevel,
  getCelebrationAnimation,
  getKeyboardShortcuts,
  initializeSessionState,
  recordCommandInHistory,
  getPreviousCommand,
  getNextCommand,
  searchCommandHistory,
  getSessionStats,
  shouldRecommendBreak,
  getBreakRecommendationMessage,
} from '../features/labs/labPolish'

describe('Lab Polish & UX', () => {
  // Encouragement Message Tests
  it('should provide start encouragement', () => {
    const msg = getEncouragementMessage('start')

    expect(msg.level).toBe('start')
    expect(msg.emoji).toBeTruthy()
    expect(msg.message).toBeTruthy()
  })

  it('should provide struggle encouragement', () => {
    const msg = getEncouragementMessage('struggle', 1, 5, 3, 2)

    expect(msg.level).toBe('struggle')
    expect(['motivational', 'technical', 'contextual']).toContain(msg.category)
  })

  it('should provide progress encouragement', () => {
    const msg = getEncouragementMessage('progress', 3, 5)

    expect(msg.level).toBe('progress')
    expect(msg.message).toContain('3')
  })

  it('should provide nearing encouragement', () => {
    const msg = getEncouragementMessage('nearing', 4, 5)

    expect(msg.level).toBe('nearing')
    expect(['🔥', '💪', '🏁']).toContain(msg.emoji)
  })

  it('should provide victory encouragement', () => {
    const msg = getEncouragementMessage('victory')

    expect(msg.level).toBe('victory')
    expect(msg.emoji).toBe('🎉')
  })

  // Encouragement Level Determination Tests
  it('should determine start level', () => {
    const level = determineEncouragementLevel(1, 5, false, false)
    expect(level).toBe('start')
  })

  it('should determine progress level', () => {
    const level = determineEncouragementLevel(2, 5, false, false)
    expect(level).toBe('progress')
  })

  it('should determine nearing level', () => {
    const level = determineEncouragementLevel(4, 5, false, false)
    expect(level).toBe('nearing')
  })

  it('should determine victory level', () => {
    const level = determineEncouragementLevel(5, 5, true, false)
    expect(level).toBe('victory')
  })

  it('should prioritize struggle over other levels', () => {
    const level = determineEncouragementLevel(3, 5, false, true)
    expect(level).toBe('struggle')
  })

  // Celebration Animation Tests
  it('should get checkpoint celebration animation', () => {
    const animation = getCelebrationAnimation('checkpoint')

    expect(animation.type).toBe('confetti')
    expect(animation.duration).toBe(2000)
    expect(animation.sound).toBe(true)
  })

  it('should get lab celebration animation', () => {
    const animation = getCelebrationAnimation('lab')

    expect(animation.type).toBe('fireworks')
    expect(animation.duration).toBe(3000)
  })

  it('should get badge celebration animation', () => {
    const animation = getCelebrationAnimation('badge')

    expect(animation.type).toBe('sparkle')
    expect(animation.duration).toBe(2500)
  })

  // Keyboard Shortcuts Tests
  it('should get keyboard shortcuts list', () => {
    const shortcuts = getKeyboardShortcuts()

    expect(shortcuts.length).toBeGreaterThan(0)
    expect(shortcuts.map((s) => s.action)).toContain('history_previous')
    expect(shortcuts.map((s) => s.action)).toContain('show_hint')
    expect(shortcuts.map((s) => s.action)).toContain('clear_screen')
  })

  // Session State Tests
  it('should initialize session state', () => {
    const session = initializeSessionState('lab1', 'user1')

    expect(session.labId).toBe('lab1')
    expect(session.userId).toBe('user1')
    expect(session.commandHistory).toHaveLength(0)
    expect(session.autosaveEnabled).toBe(true)
  })

  // Command History Tests
  it('should record command in history', () => {
    const session = initializeSessionState('lab1', 'user1')
    const updated = recordCommandInHistory(session, 'configure terminal', true, 'output')

    expect(updated.commandHistory).toHaveLength(1)
    expect(updated.commandHistory[0].command).toBe('configure terminal')
    expect(updated.commandHistory[0].success).toBe(true)
  })

  it('should get session stats', () => {
    let session = initializeSessionState('lab1', 'user1')
    session = recordCommandInHistory(session, 'cmd1', true)
    session = recordCommandInHistory(session, 'cmd2', false)
    session = recordCommandInHistory(session, 'cmd3', true)

    const stats = getSessionStats(session)

    expect(stats.totalCommands).toBe(3)
    expect(stats.successfulCommands).toBe(2)
    expect(stats.failedCommands).toBe(1)
    expect(stats.successRate).toBe(66)
  })

  it('should search command history', () => {
    let session = initializeSessionState('lab1', 'user1')
    session = recordCommandInHistory(session, 'configure terminal', true)
    session = recordCommandInHistory(session, 'interface gi0/1', true)
    session = recordCommandInHistory(session, 'show ip route', true)

    const results = searchCommandHistory(session, 'show')

    expect(results).toHaveLength(1)
    expect(results[0].command).toBe('show ip route')
  })

  // Break Recommendation Tests
  it('should recommend break after many failures', () => {
    let session = initializeSessionState('lab1', 'user1')

    // Add 8 failures in a row
    for (let i = 0; i < 8; i++) {
      session = recordCommandInHistory(session, `cmd${i}`, false)
    }
    // Add 2 successes
    for (let i = 0; i < 2; i++) {
      session = recordCommandInHistory(session, `cmd${i + 8}`, true)
    }

    const shouldBreak = shouldRecommendBreak(session)

    expect(shouldBreak).toBe(true)
  })

  it('should NOT recommend break after few failures', () => {
    let session = initializeSessionState('lab1', 'user1')

    // Add 2 failures
    session = recordCommandInHistory(session, 'cmd1', false)
    session = recordCommandInHistory(session, 'cmd2', false)

    const shouldBreak = shouldRecommendBreak(session)

    expect(shouldBreak).toBe(false)
  })

  it('should get break recommendation message', () => {
    const msg = getBreakRecommendationMessage()

    expect(msg).toBeTruthy()
  })
})

describe('Badge Rarity Comparison', () => {
  it('should compare badge rarities correctly', () => {
    const badge1 = getBadgeDisplay({
      id: '1',
      type: 'master',
      labId: 'test',
      userId: 'user1',
      earnedAt: new Date(),
      metadata: {},
    })
    const badge2 = getBadgeDisplay({
      id: '2',
      type: 'learningMode',
      labId: 'test',
      userId: 'user1',
      earnedAt: new Date(),
      metadata: {},
    })

    const comparison = compareBadgeRarity(badge1, badge2)

    expect(comparison).toBeGreaterThan(0) // master is rarer than learningMode
  })
})
