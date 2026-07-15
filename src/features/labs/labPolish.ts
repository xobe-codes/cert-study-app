/**
 * Lab Polish & UX (Phase 4C)
 *
 * Enhancements for user experience:
 * - Contextual encouragement messages based on progress
 * - Celebration animations on completion
 * - Keyboard shortcuts for CLI navigation
 * - Command history navigation
 * - Auto-save checkpoint progress
 */

export type EncouragementLevel = 'start' | 'struggle' | 'progress' | 'nearing' | 'victory'

export interface EncouragementMessage {
  level: EncouragementLevel
  message: string
  emoji: string
  category: 'technical' | 'motivational' | 'contextual'
}

export interface KeyboardShortcut {
  key: string
  modifier?: string[] // ['ctrl', 'shift']
  action: string
  description: string
  enabled: boolean
}

export interface CommandHistoryEntry {
  command: string
  timestamp: Date
  success: boolean
  checkpointId?: string
  output?: string
}

export interface LabSessionState {
  labId: string
  userId: string
  sessionStarted: Date
  lastSaved: Date
  currentCheckpointId: string
  completedCheckpoints: string[]
  commandHistory: CommandHistoryEntry[]
  autosaveEnabled: boolean
  autosaveIntervalMs: number
}

/**
 * Get encouragement message based on progress
 */
export function getEncouragementMessage(
  level: EncouragementLevel,
  checkpointNumber: number = 1,
  totalCheckpoints: number = 1,
  attempts: number = 1,
  hintsUsed: number = 0
): EncouragementMessage {
  const messages: Record<EncouragementLevel, EncouragementMessage[]> = {
    start: [
      {
        level: 'start',
        message: 'Welcome to the lab! Take your time and follow the checkpoints.',
        emoji: '🚀',
        category: 'motivational',
      },
      {
        level: 'start',
        message: 'First checkpoint unlocked. You can do this!',
        emoji: '✨',
        category: 'motivational',
      },
      {
        level: 'start',
        message: 'Ready to configure? Type the command and validate your output.',
        emoji: '💻',
        category: 'technical',
      },
    ],
    struggle: [
      {
        level: 'struggle',
        message: 'That did not work. Check the hint or try again with a different approach.',
        emoji: '🤔',
        category: 'contextual',
      },
      {
        level: 'struggle',
        message: `Stuck? Level hints are available (${hintsUsed > 0 ? 'you already used one!' : 'try using one!'})`,
        emoji: '💡',
        category: 'technical',
      },
      {
        level: 'struggle',
        message: 'Every mistake is a learning opportunity. Review the error and try again.',
        emoji: '📖',
        category: 'motivational',
      },
      {
        level: 'struggle',
        message: 'Not quite right. Think about the CLI syntax - sometimes spacing matters.',
        emoji: '⚠️',
        category: 'technical',
      },
    ],
    progress: [
      {
        level: 'progress',
        message: `Great! ${checkpointNumber} of ${totalCheckpoints} checkpoints complete. Keep going!`,
        emoji: '📈',
        category: 'motivational',
      },
      {
        level: 'progress',
        message: 'You are on the right track! Next checkpoint awaits.',
        emoji: '✅',
        category: 'motivational',
      },
      {
        level: 'progress',
        message: 'Solid work! Your understanding is growing with each step.',
        emoji: '🎯',
        category: 'motivational',
      },
      {
        level: 'progress',
        message: `Halfway there! ${totalCheckpoints - checkpointNumber} more checkpoint(s) to master.`,
        emoji: '⚡',
        category: 'motivational',
      },
    ],
    nearing: [
      {
        level: 'nearing',
        message: 'Almost there! Just a few checkpoints left. Push through!',
        emoji: '🔥',
        category: 'motivational',
      },
      {
        level: 'nearing',
        message: `Final stretch! ${totalCheckpoints - checkpointNumber} checkpoint(s) remaining.`,
        emoji: '💪',
        category: 'motivational',
      },
      {
        level: 'nearing',
        message: 'You are in the home stretch. Time to finish strong!',
        emoji: '🏁',
        category: 'motivational',
      },
    ],
    victory: [
      {
        level: 'victory',
        message: 'Lab complete! Congratulations on mastering this configuration.',
        emoji: '🎉',
        category: 'motivational',
      },
      {
        level: 'victory',
        message: 'Outstanding work! You successfully completed all checkpoints.',
        emoji: '👑',
        category: 'motivational',
      },
      {
        level: 'victory',
        message: 'Excellent! Your networking skills are growing. Well done!',
        emoji: '🌟',
        category: 'motivational',
      },
    ],
  }

  const categoryMessages = messages[level]
  return categoryMessages[Math.floor(Math.random() * categoryMessages.length)]
}

/**
 * Determine encouragement level based on progress
 */
export function determineEncouragementLevel(
  checkpointNumber: number,
  totalCheckpoints: number,
  isComplete: boolean,
  recentErrors: boolean = false
): EncouragementLevel {
  if (isComplete) return 'victory'

  const percentComplete = (checkpointNumber - 1) / totalCheckpoints

  if (recentErrors) return 'struggle'
  if (percentComplete >= 0.75) return 'nearing'
  if (percentComplete >= 0.25) return 'progress'

  return 'start'
}

/**
 * Get celebration animation configuration
 */
export function getCelebrationAnimation(
  achievementType: 'checkpoint' | 'lab' | 'badge' | 'milestone'
): {
  type: string
  duration: number
  particles: string
  sound: boolean
} {
  const animations: Record<string, any> = {
    checkpoint: {
      type: 'confetti',
      duration: 2000,
      particles: '🎊',
      sound: true,
    },
    lab: {
      type: 'fireworks',
      duration: 3000,
      particles: '🎆',
      sound: true,
    },
    badge: {
      type: 'sparkle',
      duration: 2500,
      particles: '✨',
      sound: true,
    },
    milestone: {
      type: 'rainbow',
      duration: 4000,
      particles: '🌈',
      sound: true,
    },
  }

  return animations[achievementType] || animations.checkpoint
}

/**
 * Define keyboard shortcuts for CLI terminal
 */
export function getKeyboardShortcuts(): KeyboardShortcut[] {
  return [
    {
      key: 'ArrowUp',
      action: 'history_previous',
      description: 'Show previous command from history',
      enabled: true,
    },
    {
      key: 'ArrowDown',
      action: 'history_next',
      description: 'Show next command from history',
      enabled: true,
    },
    {
      key: 'Tab',
      action: 'autocomplete',
      description: 'Autocomplete command',
      enabled: true,
    },
    {
      key: 'c',
      modifier: ['ctrl'],
      action: 'cancel_command',
      description: 'Cancel current command',
      enabled: true,
    },
    {
      key: 'l',
      modifier: ['ctrl'],
      action: 'clear_screen',
      description: 'Clear terminal screen',
      enabled: true,
    },
    {
      key: 'h',
      modifier: ['ctrl'],
      action: 'show_hint',
      description: 'Show hint for current checkpoint',
      enabled: true,
    },
    {
      key: '?',
      action: 'show_help',
      description: 'Show command reference',
      enabled: true,
    },
    {
      key: 's',
      modifier: ['ctrl'],
      action: 'save_progress',
      description: 'Save progress (auto-save is enabled)',
      enabled: true,
    },
  ]
}

/**
 * Initialize command history for a session
 */
export function initializeSessionState(labId: string, userId: string): LabSessionState {
  return {
    labId,
    userId,
    sessionStarted: new Date(),
    lastSaved: new Date(),
    currentCheckpointId: '',
    completedCheckpoints: [],
    commandHistory: [],
    autosaveEnabled: true,
    autosaveIntervalMs: 30000, // Auto-save every 30 seconds
  }
}

/**
 * Add command to history
 */
export function recordCommandInHistory(
  sessionState: LabSessionState,
  command: string,
  success: boolean,
  output?: string,
  checkpointId?: string
): LabSessionState {
  const entry: CommandHistoryEntry = {
    command,
    timestamp: new Date(),
    success,
    output,
    checkpointId,
  }

  return {
    ...sessionState,
    commandHistory: [...sessionState.commandHistory, entry],
  }
}

/**
 * Get previous command from history
 */
export function getPreviousCommand(
  sessionState: LabSessionState,
  currentIndex: number
): CommandHistoryEntry | null {
  const history = sessionState.commandHistory
  if (currentIndex <= 0 || history.length === 0) return null

  return history[history.length - currentIndex] || null
}

/**
 * Get next command from history
 */
export function getNextCommand(
  sessionState: LabSessionState,
  currentIndex: number
): CommandHistoryEntry | null {
  const history = sessionState.commandHistory
  if (currentIndex >= history.length - 1) return null

  return history[history.length - currentIndex] || null
}

/**
 * Search command history
 */
export function searchCommandHistory(
  sessionState: LabSessionState,
  query: string
): CommandHistoryEntry[] {
  return sessionState.commandHistory.filter((entry) =>
    entry.command.toLowerCase().includes(query.toLowerCase())
  )
}

/**
 * Auto-save session progress
 */
export function autoSaveProgress(sessionState: LabSessionState): LabSessionState {
  return {
    ...sessionState,
    lastSaved: new Date(),
  }
}

/**
 * Get session statistics for display
 */
export function getSessionStats(sessionState: LabSessionState) {
  const successfulCommands = sessionState.commandHistory.filter((c) => c.success).length
  const failedCommands = sessionState.commandHistory.filter((c) => !c.success).length
  const elapsedTime = new Date().getTime() - sessionState.sessionStarted.getTime()

  return {
    totalCommands: sessionState.commandHistory.length,
    successfulCommands,
    failedCommands,
    successRate:
      sessionState.commandHistory.length > 0
        ? Math.round((successfulCommands / sessionState.commandHistory.length) * 100)
        : 0,
    elapsedTimeSeconds: Math.floor(elapsedTime / 1000),
    checkpointsCompleted: sessionState.completedCheckpoints.length,
    lastSavedAgo: Math.floor((new Date().getTime() - sessionState.lastSaved.getTime()) / 1000),
  }
}

/**
 * Determine if user needs a break (many failures in a row)
 */
export function shouldRecommendBreak(sessionState: LabSessionState): boolean {
  const recentCommands = sessionState.commandHistory.slice(-10)

  if (recentCommands.length < 10) return false

  const recentFailures = recentCommands.filter((c) => !c.success).length

  // Recommend break if 8+ out of last 10 commands failed
  return recentFailures >= 8
}

/**
 * Get motivational message if user should take a break
 */
export function getBreakRecommendationMessage(): string {
  const messages = [
    'You have been working hard! 💪 Consider taking a 5-minute break to recharge.',
    'Many errors in a row? Breaks help! ☕ Step back and return refreshed.',
    'Time for a quick break? 🌟 Your brain will thank you!',
    'Having trouble? 🧘 A short break might help you see the problem differently.',
  ]

  return messages[Math.floor(Math.random() * messages.length)]
}
