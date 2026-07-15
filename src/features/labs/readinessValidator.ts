/**
 * Lab Readiness Validator (Phase 1B)
 *
 * Validates whether a lab is complete and ready for submission
 * Generates checklist of missing steps
 * Tracks what needs to be done before marking lab as DONE
 */

import { CheckpointStatus } from './checkpointSystem';

export enum ReadinessStatus {
  NOT_READY = 'not_ready',
  PARTIALLY_READY = 'partially_ready',
  READY = 'ready',
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  reason?: string; // Why not completed (if incomplete)
  suggestedFix?: string; // How to complete
}

export interface LabReadiness {
  labId: string;
  status: ReadinessStatus;
  completionPercentage: number; // 0-100
  checklist: ChecklistItem[];
  blockedSteps: string[]; // Steps that can't be done yet
  missingSummary: string;
  canSubmit: boolean;
  suggestedNextSteps: string[];
}

export interface CompletionStatus {
  allCheckpointsComplete: boolean;
  allRequiredCommandsEntered: boolean;
  deviceStateValid: boolean;
  outputValidated: boolean;
  allCheckpointsReady: boolean;
}

/**
 * Check if all checkpoints are complete
 */
export function areAllCheckpointsComplete(statuses: CheckpointStatus[]): boolean {
  if (statuses.length === 0) return false;
  return statuses.every((s) => s.completed);
}

/**
 * Check if any checkpoints are still blocked
 */
export function hasBlockedCheckpoints(
  statuses: CheckpointStatus[],
  completedIds: string[]
): boolean {
  return statuses.some((status) => {
    if (status.completed) return false;
    const prereqs = status.checkpoint.prerequisiteCheckpoints || [];
    return prereqs.some((prereq) => !completedIds.includes(prereq));
  });
}

/**
 * Get list of incomplete steps
 */
export function getIncompleteSteps(
  statuses: CheckpointStatus[]
): Array<{
  title: string;
  reason: string;
  hint?: string;
  blocked: boolean;
}> {
  const completedIds = statuses
    .filter((s) => s.completed)
    .map((s) => s.checkpoint.id);

  const incomplete: Array<{
    title: string;
    reason: string;
    hint?: string;
    blocked: boolean;
  }> = [];

  for (const status of statuses) {
    if (status.completed) continue;

    const prereqs = status.checkpoint.prerequisiteCheckpoints || [];
    const blockedByPrereq = prereqs.some((p) => !completedIds.includes(p));

    if (blockedByPrereq) {
      const blockedBy = prereqs
        .filter((p) => !completedIds.includes(p))
        .map((p) => {
          const prereqStatus = statuses.find((s) => s.checkpoint.id === p);
          return prereqStatus?.checkpoint.title || p;
        });

      incomplete.push({
        title: status.checkpoint.title,
        reason: `Blocked by: ${blockedBy.join(', ')}`,
        blocked: true,
      });
    } else {
      incomplete.push({
        title: status.checkpoint.title,
        reason: `Not completed yet`,
        hint: status.checkpoint.hints.level1,
        blocked: false,
      });
    }
  }

  return incomplete;
}

/**
 * Check if lab can be submitted
 */
export function canSubmitLab(
  statuses: CheckpointStatus[],
  minimumCheckpointsRequired: number = -1 // -1 = all required
): {
  allowed: boolean;
  missingSteps: string[];
  completionPercentage: number;
  message: string;
} {
  const completed = statuses.filter((s) => s.completed).length;
  const total = statuses.length;
  const completionPercentage = Math.round((completed / total) * 100);

  // If -1, all must be complete
  const required = minimumCheckpointsRequired === -1 ? total : minimumCheckpointsRequired;

  const allowed = completed >= required;
  const missingSteps = statuses
    .filter((s) => !s.completed)
    .map((s) => s.checkpoint.title);

  let message = '';
  if (allowed) {
    message = `Lab complete! ${completionPercentage}% of checkpoints passed.`;
  } else {
    message = `Lab incomplete. ${completed}/${total} checkpoints passed (${completionPercentage}%).`;
  }

  return {
    allowed,
    missingSteps,
    completionPercentage,
    message,
  };
}

/**
 * Generate a completion checklist
 */
export function generateCompletionChecklist(
  statuses: CheckpointStatus[]
): ChecklistItem[] {
  const completedIds = statuses
    .filter((s) => s.completed)
    .map((s) => s.checkpoint.id);

  const checklist: ChecklistItem[] = statuses.map((status) => {
    const prereqs = status.checkpoint.prerequisiteCheckpoints || [];
    const blocked = prereqs.some((p) => !completedIds.includes(p));

    let reason = '';
    if (status.completed) {
      reason = `Completed at ${status.completedAt?.toLocaleTimeString()}`;
    } else if (blocked) {
      const blockedBy = prereqs
        .filter((p) => !completedIds.includes(p))
        .map((p) => {
          const prereqStatus = statuses.find((s) => s.checkpoint.id === p);
          return prereqStatus?.checkpoint.title || p;
        });
      reason = `Blocked by: ${blockedBy.join(', ')}`;
    } else {
      reason = `Not yet attempted (${status.attempts} attempts)`;
    }

    return {
      id: status.checkpoint.id,
      title: status.checkpoint.title,
      description: status.checkpoint.description,
      completed: status.completed,
      reason,
      suggestedFix: !status.completed ? status.checkpoint.hints.level3 : undefined,
    };
  });

  return checklist;
}

/**
 * Calculate lab readiness
 */
export function calculateLabReadiness(
  labId: string,
  statuses: CheckpointStatus[],
  minimumCompletionPercentage: number = 100
): LabReadiness {
  const completed = statuses.filter((s) => s.completed).length;
  const total = statuses.length;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 100;

  const checklist = generateCompletionChecklist(statuses);
  const incompleteSteps = getIncompleteSteps(statuses);
  const blockedSteps = incompleteSteps
    .filter((s) => s.blocked)
    .map((s) => s.title);

  const canSubmit =
    areAllCheckpointsComplete(statuses) &&
    completionPercentage >= minimumCompletionPercentage;

  let status: ReadinessStatus;
  if (completionPercentage === 100) {
    status = ReadinessStatus.READY;
  } else if (completionPercentage >= 50) {
    status = ReadinessStatus.PARTIALLY_READY;
  } else {
    status = ReadinessStatus.NOT_READY;
  }

  const missingSummary =
    incompleteSteps.length === 0
      ? 'All steps complete!'
      : `${incompleteSteps.length} step${incompleteSteps.length > 1 ? 's' : ''} remaining`;

  // Generate suggested next steps
  const suggestedNextSteps: string[] = [];
  for (const step of incompleteSteps) {
    if (!step.blocked) {
      suggestedNextSteps.push(step.title);
    }
  }

  // If blocked steps exist, prioritize unblocking them
  if (blockedSteps.length > 0 && suggestedNextSteps.length === 0) {
    suggestedNextSteps.push(`Complete: ${blockedSteps[0]}`);
  }

  return {
    labId,
    status,
    completionPercentage,
    checklist,
    blockedSteps,
    missingSummary,
    canSubmit,
    suggestedNextSteps,
  };
}

/**
 * Get human-readable readiness report
 */
export function getReadinessReport(readiness: LabReadiness): string {
  const lines: string[] = [];

  lines.push(`Lab Readiness Report: ${readiness.labId}`);
  lines.push(`Status: ${readiness.status.toUpperCase()}`);
  lines.push(`Completion: ${readiness.completionPercentage}%`);
  lines.push('');

  if (readiness.canSubmit) {
    lines.push('✓ Lab is ready to submit!');
  } else {
    lines.push('✗ Lab cannot be submitted yet');
    lines.push('');
    lines.push('Missing steps:');
    const incomplete = readiness.checklist.filter((c) => !c.completed);
    for (const item of incomplete) {
      const blocked = readiness.blockedSteps.includes(item.id);
      const prefix = blocked ? '[BLOCKED]' : '[ TODO ]';
      lines.push(`  ${prefix} ${item.title}`);
      if (item.reason) {
        lines.push(`         ${item.reason}`);
      }
    }

    if (readiness.suggestedNextSteps.length > 0) {
      lines.push('');
      lines.push('Next steps:');
      for (const step of readiness.suggestedNextSteps) {
        lines.push(`  → ${step}`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Identify what's preventing lab completion
 */
export function getCompletionBlockers(
  readiness: LabReadiness
): Array<{
  title: string;
  reason: string;
  howToUnblock: string;
}> {
  const blockers: Array<{
    title: string;
    reason: string;
    howToUnblock: string;
  }> = [];

  for (const blocked of readiness.blockedSteps) {
    const checklist = readiness.checklist.find((c) => c.id === blocked);
    if (checklist) {
      blockers.push({
        title: blocked,
        reason: checklist.reason || 'Unknown',
        howToUnblock: checklist.suggestedFix || 'See hints for this step',
      });
    }
  }

  return blockers;
}

/**
 * Provide encouragement based on progress
 */
export function getEncouragement(completionPercentage: number): string {
  if (completionPercentage === 100) {
    return "Perfect! You've completed all checkpoints!";
  }
  if (completionPercentage >= 80) {
    return "You're almost there! Just a few more steps.";
  }
  if (completionPercentage >= 50) {
    return 'Great progress! You\'re halfway done.';
  }
  if (completionPercentage >= 25) {
    return "You're on the right track. Keep going!";
  }
  return 'You just started. Take it one step at a time!';
}

/**
 * Check if user should retry a checkpoint
 */
export function shouldRetryCheckpoint(
  status: CheckpointStatus,
  maxAttemptsBeforeHint: number = 3
): {
  shouldRetry: boolean;
  message: string;
  action: 'continue' | 'show_hint' | 'take_break' | 'review_concept';
} {
  if (status.completed) {
    return {
      shouldRetry: false,
      message: 'This checkpoint is already complete!',
      action: 'continue',
    };
  }

  if (status.attempts === 0) {
    return {
      shouldRetry: true,
      message: 'Give this step a try!',
      action: 'continue',
    };
  }

  if (status.attempts < maxAttemptsBeforeHint) {
    return {
      shouldRetry: true,
      message: `You've attempted this ${status.attempts} time(s). Try again!`,
      action: 'continue',
    };
  }

  if (status.currentHintLevel < 3 && status.attempts < maxAttemptsBeforeHint + 3) {
    return {
      shouldRetry: true,
      message: 'Want help? Get a hint before trying again.',
      action: 'show_hint',
    };
  }

  if (status.attempts >= 10) {
    return {
      shouldRetry: false,
      message: "You've tried many times. Consider reviewing the concept or taking a break.",
      action: 'review_concept',
    };
  }

  return {
    shouldRetry: true,
    message: 'Keep trying! You can do it.',
    action: 'continue',
  };
}
