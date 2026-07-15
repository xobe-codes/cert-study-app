/**
 * Lab Checkpoint System (Phase 1B)
 *
 * Manages multi-step validation checkpoints for labs
 * Each checkpoint:
 * - Requires a specific CLI command
 * - Validates output against a pattern
 * - Has 3-level hints for guidance
 * - Awards partial credit on completion
 * - Tracks prerequisites (must complete step 1 before step 2)
 */

export interface CheckpointHints {
  level1: string; // Nudge - asks what they should do
  level2: string; // Guidance - tells them how
  level3: string; // Solution - shows exact command
}

export interface Checkpoint {
  id: string; // Unique ID: 'vlan-created', 'ospf-enabled', etc.
  stepNumber: number; // 1, 2, 3... for ordering
  title: string; // Display title: "VLAN 10 Created"
  description: string; // Full description of what to verify
  requiredCommand: string; // The show command to run: 'show vlan brief'
  validator: (output: string) => boolean; // Function that validates output
  expectedOutput: string; // Human-readable: "includes VLAN0010"
  hints: CheckpointHints; // 3-level hints
  partialCredit: number; // Points awarded if this checkpoint passes (0-100)
  prerequisiteCheckpoints?: string[]; // IDs of checkpoints that must pass first
}

export interface CheckpointResult {
  checkpointId: string;
  passed: boolean;
  timestamp: Date;
  userOutput?: string;
  validationDetails?: Record<string, any>;
  errorMessage?: string;
}

export interface CheckpointStatus {
  checkpoint: Checkpoint;
  completed: boolean;
  completedAt?: Date;
  attempts: number;
  hintsUsed: number;
  currentHintLevel: number; // 0=none, 1, 2, 3
  result?: CheckpointResult;
}

export interface LabCheckpoints {
  labId: string;
  checkpoints: Checkpoint[];
  description: string;
  totalPartialCredit: number; // Sum of all partialCredit values
}

/**
 * Create a new checkpoint with all required properties
 */
export function createCheckpoint(config: {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  requiredCommand: string;
  validator: (output: string) => boolean;
  expectedOutput: string;
  hints: CheckpointHints;
  partialCredit: number;
  prerequisiteCheckpoints?: string[];
}): Checkpoint {
  return {
    id: config.id,
    stepNumber: config.stepNumber,
    title: config.title,
    description: config.description,
    requiredCommand: config.requiredCommand,
    validator: config.validator,
    expectedOutput: config.expectedOutput,
    hints: config.hints,
    partialCredit: config.partialCredit,
    prerequisiteCheckpoints: config.prerequisiteCheckpoints || [],
  };
}

/**
 * Validate a checkpoint by running the validator against user output
 */
export function validateCheckpoint(
  checkpoint: Checkpoint,
  userOutput: string
): CheckpointResult {
  try {
    const passed = checkpoint.validator(userOutput);
    return {
      checkpointId: checkpoint.id,
      passed,
      timestamp: new Date(),
      userOutput,
      validationDetails: {
        command: checkpoint.requiredCommand,
        outputLength: userOutput?.length || 0,
      },
    };
  } catch (error) {
    return {
      checkpointId: checkpoint.id,
      passed: false,
      timestamp: new Date(),
      userOutput,
      errorMessage: error instanceof Error ? error.message : 'Validation failed',
    };
  }
}

/**
 * Initialize checkpoint status for a lab
 */
export function initializeCheckpointStatus(
  checkpoints: Checkpoint[]
): CheckpointStatus[] {
  return checkpoints.map((checkpoint) => ({
    checkpoint,
    completed: false,
    attempts: 0,
    hintsUsed: 0,
    currentHintLevel: 0,
  }));
}

/**
 * Update checkpoint status after validation attempt
 */
export function updateCheckpointStatus(
  status: CheckpointStatus,
  result: CheckpointResult,
  hintsUsedIncrement: number = 0
): CheckpointStatus {
  return {
    ...status,
    completed: status.completed || result.passed,
    completedAt: result.passed ? new Date() : status.completedAt,
    attempts: status.attempts + 1,
    hintsUsed: status.hintsUsed + hintsUsedIncrement,
    result,
  };
}

/**
 * Get checkpoint status for a specific lab
 * Returns array of all checkpoints with their completion status
 */
export function getCheckpointStatus(
  statuses: CheckpointStatus[]
): CheckpointStatus[] {
  return statuses.sort((a, b) => a.checkpoint.stepNumber - b.checkpoint.stepNumber);
}

/**
 * Check if a checkpoint is ready to attempt
 * Returns false if it has incomplete prerequisites
 */
export function isCheckpointReady(
  checkpoint: Checkpoint,
  completedCheckpointIds: string[]
): boolean {
  if (!checkpoint.prerequisiteCheckpoints || checkpoint.prerequisiteCheckpoints.length === 0) {
    return true;
  }

  // All prerequisite checkpoints must be completed
  return checkpoint.prerequisiteCheckpoints.every((prereqId) =>
    completedCheckpointIds.includes(prereqId)
  );
}

/**
 * Get all incomplete checkpoints that are ready to attempt
 */
export function getReadyCheckpoints(
  statuses: CheckpointStatus[]
): CheckpointStatus[] {
  const completedIds = statuses
    .filter((s) => s.completed)
    .map((s) => s.checkpoint.id);

  return statuses.filter((status) => {
    if (status.completed) return false;
    return isCheckpointReady(status.checkpoint, completedIds);
  });
}

/**
 * Get next checkpoint to work on
 */
export function getNextCheckpoint(
  statuses: CheckpointStatus[]
): CheckpointStatus | null {
  const ready = getReadyCheckpoints(statuses);
  if (ready.length === 0) return null;
  return ready[0]; // Next in step order
}

/**
 * Calculate total points earned from completed checkpoints
 */
export function calculateCheckpointScore(statuses: CheckpointStatus[]): number {
  return statuses
    .filter((s) => s.completed)
    .reduce((total, s) => total + s.checkpoint.partialCredit, 0);
}

/**
 * Calculate completion percentage
 */
export function calculateCheckpointCompletion(statuses: CheckpointStatus[]): number {
  if (statuses.length === 0) return 100;
  const completed = statuses.filter((s) => s.completed).length;
  return Math.round((completed / statuses.length) * 100);
}

/**
 * Get summary of checkpoint progress
 */
export function getCheckpointSummary(statuses: CheckpointStatus[]) {
  return {
    total: statuses.length,
    completed: statuses.filter((s) => s.completed).length,
    inProgress: statuses.filter((s) => !s.completed && s.attempts > 0).length,
    notStarted: statuses.filter((s) => !s.completed && s.attempts === 0).length,
    completionPercentage: calculateCheckpointCompletion(statuses),
    totalScore: calculateCheckpointScore(statuses),
    maxScore: statuses.reduce((total, s) => total + s.checkpoint.partialCredit, 0),
  };
}

/**
 * Find checkpoint by ID
 */
export function findCheckpoint(
  statuses: CheckpointStatus[],
  checkpointId: string
): CheckpointStatus | null {
  return statuses.find((s) => s.checkpoint.id === checkpointId) || null;
}

/**
 * Get checkpoints blocked by incomplete prerequisites
 */
export function getBlockedCheckpoints(
  statuses: CheckpointStatus[]
): CheckpointStatus[] {
  const completedIds = statuses
    .filter((s) => s.completed)
    .map((s) => s.checkpoint.id);

  return statuses.filter((status) => {
    if (status.completed) return false;
    return !isCheckpointReady(status.checkpoint, completedIds);
  });
}

/**
 * Create a lab checkpoint configuration with all necessary checkpoints
 */
export function createLabCheckpoints(
  labId: string,
  checkpoints: Checkpoint[]
): LabCheckpoints {
  const totalScore = checkpoints.reduce((sum, cp) => sum + cp.partialCredit, 0);
  return {
    labId,
    checkpoints: checkpoints.sort((a, b) => a.stepNumber - b.stepNumber),
    description: `Lab: ${labId}`,
    totalPartialCredit: totalScore,
  };
}
