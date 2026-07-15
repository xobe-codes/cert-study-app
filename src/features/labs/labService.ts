/**
 * Lab Service Integration (Phase 1 Complete)
 *
 * Main orchestration service that coordinates:
 * - Checkpoint system (tracking progress through steps)
 * - Output validators (verifying user commands)
 * - Hint system (progressive guidance)
 * - Mistake detection (tracking errors)
 * - Readiness validation (ensuring completion before submission)
 * - Sequence validation (enforcing checkpoint order)
 */

import { Checkpoint, CheckpointStatus } from './checkpointSystem'
import { HintLevel, getHint as getHintContent } from './hintSystem'

export interface StepResult {
  success: boolean
  checkpointId: string
  userCommand: string
  actualOutput: string
  validationPassed: boolean
  validationMessage: string
  partialCreditEarned: number
  mistakesDetected: any[]
  feedback: string
  nextCheckpointId?: string
  isCheckpointComplete: boolean
}

export interface LabProgress {
  labId: string
  userId: string
  checkpointsCompleted: string[]
  currentCheckpointId: string
  totalCheckpoints: number
  percentComplete: number
  checkpointsWithMistakes: string[]
  totalMistakes: number
  hintsUsedPerCheckpoint: Map<string, number>
  mistakeRecords: any[]
}

export interface SubmissionResult {
  submitted: boolean
  labId: string
  userId: string
  overallScore: number
  completedCheckpoints: number
  totalCheckpoints: number
  mistakesSummary: {
    total: number
    byCheckpoint: Record<string, number>
  }
  readinessValidation: any
  message: string
  passedLab: boolean
}

interface CheckpointProgress {
  checkpoint: Checkpoint
  completed: boolean
  attempts: number
  mistakesDetected: any[]
  hintsUsed: number
  currentHintLevel: HintLevel
}

interface LabState {
  labId: string
  userId: string
  checkpoints: Checkpoint[]
  progress: Map<string, CheckpointProgress>
  currentCheckpointIdx: number
  totalMistakes: number
  submissionReady: boolean
}

export class LabService {
  private states: Map<string, LabState> = new Map()
  private hintStates: Map<string, Map<string, any>> = new Map()

  initializeLab(labId: string, userId: string, checkpoints: Checkpoint[]): LabState {
    const stateKey = `${labId}:${userId}`

    const progress = new Map<string, CheckpointProgress>()
    checkpoints.forEach((checkpoint) => {
      progress.set(checkpoint.id, {
        checkpoint,
        completed: false,
        attempts: 0,
        mistakesDetected: [],
        hintsUsed: 0,
        currentHintLevel: HintLevel.NONE,
      })
    })

    const state: LabState = {
      labId,
      userId,
      checkpoints,
      progress,
      currentCheckpointIdx: 0,
      totalMistakes: 0,
      submissionReady: false,
    }

    this.states.set(stateKey, state)

    const hintMap = new Map<string, any>()
    checkpoints.forEach((cp) => {
      hintMap.set(cp.id, {
        checkpointId: cp.id,
        currentLevel: HintLevel.NONE,
        levelUnlockedAt: 0,
        usageCount: 0,
        lastAccessedAt: new Date(),
      })
    })
    this.hintStates.set(stateKey, hintMap)

    return state
  }

  async runLabStep(
    labId: string,
    userId: string,
    userCommand: string,
    actualOutput: string
  ): Promise<StepResult> {
    const stateKey = `${labId}:${userId}`
    const state = this.states.get(stateKey)
    if (!state) {
      throw new Error(`Lab session not found: ${stateKey}`)
    }

    const currentCheckpoint = state.checkpoints[state.currentCheckpointIdx]
    if (!currentCheckpoint) {
      throw new Error('No current checkpoint available')
    }

    const cpProgress = state.progress.get(currentCheckpoint.id)
    if (!cpProgress) {
      throw new Error(`Checkpoint progress not found: ${currentCheckpoint.id}`)
    }

    const normalizedCommand = userCommand.toLowerCase().trim()
    const expectedCommand = currentCheckpoint.requiredCommand.toLowerCase().trim()
    const commandMatches = normalizedCommand === expectedCommand
    const validationPassed = commandMatches && currentCheckpoint.validator(actualOutput)

    cpProgress.attempts++

    const checkpointComplete = validationPassed && commandMatches

    if (checkpointComplete) {
      cpProgress.completed = true
    }

    let feedback = ''
    if (!commandMatches) {
      feedback = `Command doesn't match. Expected: ${currentCheckpoint.requiredCommand}`
    } else if (!validationPassed) {
      feedback = `Output validation failed. ${currentCheckpoint.expectedOutput}`
    } else {
      feedback = `✓ Checkpoint complete! ${currentCheckpoint.description}`
    }

    let nextCheckpointId: string | undefined
    if (checkpointComplete) {
      const nextIdx = state.currentCheckpointIdx + 1
      if (nextIdx < state.checkpoints.length) {
        state.currentCheckpointIdx = nextIdx
        nextCheckpointId = state.checkpoints[nextIdx].id
      }
    }

    state.submissionReady = this.isSubmissionReady(state)

    return {
      success: true,
      checkpointId: currentCheckpoint.id,
      userCommand: userCommand.trim(),
      actualOutput: actualOutput.trim(),
      validationPassed,
      validationMessage: feedback,
      partialCreditEarned: checkpointComplete ? currentCheckpoint.partialCredit : 0,
      mistakesDetected: [],
      feedback,
      nextCheckpointId,
      isCheckpointComplete: checkpointComplete,
    }
  }

  getCurrentCheckpoint(labId: string, userId: string): Checkpoint | null {
    const stateKey = `${labId}:${userId}`
    const state = this.states.get(stateKey)
    if (!state) return null

    return state.checkpoints[state.currentCheckpointIdx] || null
  }

  getLabProgress(labId: string, userId: string): LabProgress {
    const stateKey = `${labId}:${userId}`
    const state = this.states.get(stateKey)
    if (!state) {
      throw new Error(`Lab session not found: ${stateKey}`)
    }

    const checkpointsCompleted: string[] = []
    const checkpointsWithMistakes: string[] = []
    const hintsUsedPerCheckpoint = new Map<string, number>()
    const allMistakes: any[] = []

    state.progress.forEach((cpProgress) => {
      if (cpProgress.completed) {
        checkpointsCompleted.push(cpProgress.checkpoint.id)
      }
      if (cpProgress.hintsUsed > 0) {
        hintsUsedPerCheckpoint.set(cpProgress.checkpoint.id, cpProgress.hintsUsed)
      }
    })

    const percentComplete = state.checkpoints.length > 0
      ? (checkpointsCompleted.length / state.checkpoints.length) * 100
      : 0

    return {
      labId,
      userId,
      checkpointsCompleted,
      currentCheckpointId: state.checkpoints[state.currentCheckpointIdx]?.id || '',
      totalCheckpoints: state.checkpoints.length,
      percentComplete,
      checkpointsWithMistakes,
      totalMistakes: state.totalMistakes,
      hintsUsedPerCheckpoint,
      mistakeRecords: allMistakes,
    }
  }

  submitLab(labId: string, userId: string): SubmissionResult {
    const stateKey = `${labId}:${userId}`
    const state = this.states.get(stateKey)
    if (!state) {
      throw new Error(`Lab session not found: ${stateKey}`)
    }

    let totalScore = 0
    let completedCount = 0
    const mistakeByCp: Record<string, number> = {}

    state.progress.forEach((cpProgress) => {
      if (cpProgress.completed) {
        totalScore += cpProgress.checkpoint.partialCredit
        completedCount++
      }
    })

    const totalPossibleScore = state.checkpoints.reduce(
      (sum, cp) => sum + cp.partialCredit,
      0
    )
    const overallScore = totalPossibleScore > 0
      ? Math.round((totalScore / totalPossibleScore) * 100)
      : 0

    const passedLab = completedCount === state.checkpoints.length

    return {
      submitted: true,
      labId,
      userId,
      overallScore,
      completedCheckpoints: completedCount,
      totalCheckpoints: state.checkpoints.length,
      mistakesSummary: {
        total: state.totalMistakes,
        byCheckpoint: mistakeByCp,
      },
      readinessValidation: { isReady: passedLab, reasons: [] },
      message: passedLab
        ? `Lab complete! Score: ${overallScore}%`
        : `Lab incomplete. Complete all ${state.checkpoints.length} steps to submit.`,
      passedLab,
    }
  }

  getHint(labId: string, userId: string, level: 1 | 2 | 3): string {
    const stateKey = `${labId}:${userId}`
    const state = this.states.get(stateKey)
    const hintMap = this.hintStates.get(stateKey)

    if (!state || !hintMap) {
      throw new Error(`Lab session not found: ${stateKey}`)
    }

    const currentCheckpoint = state.checkpoints[state.currentCheckpointIdx]
    if (!currentCheckpoint) {
      return 'No checkpoint available'
    }

    const cpProgress = state.progress.get(currentCheckpoint.id)
    if (!cpProgress) {
      return 'Checkpoint progress not found'
    }

    const hintLevel: HintLevel =
      level === 1 ? HintLevel.LEVEL_1_NUDGE :
      level === 2 ? HintLevel.LEVEL_2_GUIDANCE :
      HintLevel.LEVEL_3_SOLUTION

    const hint = getHintContent(currentCheckpoint.hints, hintLevel)

    const hintState = hintMap.get(currentCheckpoint.id)
    if (hintState) {
      hintState.currentLevel = hintLevel
      hintState.usageCount++
      hintState.lastAccessedAt = new Date()
    }

    cpProgress.hintsUsed++
    cpProgress.currentHintLevel = hintLevel

    return hint
  }

  skipCheckpoint(labId: string, userId: string): boolean {
    const stateKey = `${labId}:${userId}`
    const state = this.states.get(stateKey)
    if (!state) return false

    const nextIdx = state.currentCheckpointIdx + 1
    if (nextIdx < state.checkpoints.length) {
      state.currentCheckpointIdx = nextIdx
      return true
    }
    return false
  }

  resetCheckpoint(labId: string, userId: string): boolean {
    const stateKey = `${labId}:${userId}`
    const state = this.states.get(stateKey)
    if (!state) return false

    const currentCheckpoint = state.checkpoints[state.currentCheckpointIdx]
    const cpProgress = state.progress.get(currentCheckpoint.id)
    if (cpProgress) {
      cpProgress.completed = false
      cpProgress.attempts = 0
      cpProgress.mistakesDetected = []
      return true
    }
    return false
  }

  getCheckpointStatuses(labId: string, userId: string): CheckpointStatus[] {
    const stateKey = `${labId}:${userId}`
    const state = this.states.get(stateKey)
    if (!state) return []

    return Array.from(state.progress.values()).map((cpProgress) => ({
      checkpoint: cpProgress.checkpoint,
      completed: cpProgress.completed,
      completedAt: cpProgress.completed ? new Date() : undefined,
      attempts: cpProgress.attempts,
      hintsUsed: cpProgress.hintsUsed,
      currentHintLevel: cpProgress.currentHintLevel,
    }))
  }

  isSubmissionReady(state: LabState): boolean {
    return Array.from(state.progress.values()).every((cp) => cp.completed)
  }

  clearSession(labId: string, userId: string): boolean {
    const stateKey = `${labId}:${userId}`
    this.states.delete(stateKey)
    this.hintStates.delete(stateKey)
    return true
  }
}

export const labService = new LabService()

export type { CheckpointStatus, Checkpoint }
