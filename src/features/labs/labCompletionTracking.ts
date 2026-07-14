/**
 * Lab Completion Tracking (Phase 3)
 *
 * Handles logic for:
 * - Recording lab completion status
 * - Tracking which labs are done, in progress, not started
 * - Calculating domain lab progress
 * - Managing lab completion history
 */

export enum LabStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface LabCompletionRecord {
  labId: string;
  userId: string;
  domainId: string;
  status: LabStatus;
  startedDate: Date | null;
  completedDate: Date | null;
  timeSpentSeconds: number; // Total time on lab
  attempts: number; // How many times user worked on it
}

export interface DomainLabProgress {
  domainId: string;
  totalLabs: number;
  completedLabs: number;
  inProgressLabs: number;
  notStartedLabs: number;
  completionPercentage: number; // 0-100
}

/**
 * Record a lab as started
 *
 * Returns: LabCompletionRecord
 */
export function recordLabStarted(
  labId: string,
  userId: string,
  domainId: string,
  startDate: Date = new Date()
): LabCompletionRecord {
  return {
    labId,
    userId,
    domainId,
    status: LabStatus.IN_PROGRESS,
    startedDate: startDate,
    completedDate: null,
    timeSpentSeconds: 0,
    attempts: 1,
  };
}

/**
 * Record a lab as completed
 *
 * Returns: LabCompletionRecord
 */
export function recordLabCompletion(
  labId: string,
  userId: string,
  domainId: string,
  completedDate: Date = new Date(),
  timeSpentSeconds: number = 0
): LabCompletionRecord {
  return {
    labId,
    userId,
    domainId,
    status: LabStatus.COMPLETED,
    startedDate: completedDate, // Or track separately if needed
    completedDate,
    timeSpentSeconds,
    attempts: 1,
  };
}

/**
 * Update lab completion record with time spent and attempts
 *
 * Returns: LabCompletionRecord
 */
export function updateLabProgress(
  record: LabCompletionRecord,
  additionalTimeSeconds: number,
  isCompleted: boolean = false
): LabCompletionRecord {
  return {
    ...record,
    timeSpentSeconds: record.timeSpentSeconds + additionalTimeSeconds,
    attempts: record.attempts + 1,
    status: isCompleted ? LabStatus.COMPLETED : LabStatus.IN_PROGRESS,
    completedDate: isCompleted ? new Date() : record.completedDate,
  };
}

/**
 * Get status of a specific lab
 *
 * Returns: LabStatus
 */
export function getLabStatus(
  labId: string,
  completionRecords: LabCompletionRecord[]
): LabStatus {
  const record = completionRecords.find(r => r.labId === labId);
  return record?.status || LabStatus.NOT_STARTED;
}

/**
 * Calculate domain lab progress
 *
 * Returns: DomainLabProgress
 */
export function getDomainLabProgress(
  domainId: string,
  allLabIds: string[], // All labs in domain
  completionRecords: LabCompletionRecord[]
): DomainLabProgress {
  const domainRecords = completionRecords.filter(r => r.domainId === domainId);

  let completedLabs = 0;
  let inProgressLabs = 0;
  let notStartedLabs = 0;

  for (const labId of allLabIds) {
    const record = domainRecords.find(r => r.labId === labId);

    if (!record) {
      notStartedLabs += 1;
    } else if (record.status === LabStatus.COMPLETED) {
      completedLabs += 1;
    } else if (record.status === LabStatus.IN_PROGRESS) {
      inProgressLabs += 1;
    }
  }

  const totalLabs = allLabIds.length;
  const completionPercentage = totalLabs > 0 ? Math.round((completedLabs / totalLabs) * 100) : 0;

  return {
    domainId,
    totalLabs,
    completedLabs,
    inProgressLabs,
    notStartedLabs,
    completionPercentage,
  };
}

/**
 * Get all labs by status
 *
 * Returns: {completed: string[], inProgress: string[], notStarted: string[]}
 */
export function getLabsByStatus(
  domainId: string,
  allLabIds: string[],
  completionRecords: LabCompletionRecord[]
): {
  completed: string[];
  inProgress: string[];
  notStarted: string[];
} {
  const completed: string[] = [];
  const inProgress: string[] = [];
  const notStarted: string[] = [];

  for (const labId of allLabIds) {
    const record = completionRecords.find(
      r => r.labId === labId && r.domainId === domainId
    );

    if (!record) {
      notStarted.push(labId);
    } else if (record.status === LabStatus.COMPLETED) {
      completed.push(labId);
    } else {
      inProgress.push(labId);
    }
  }

  return { completed, inProgress, notStarted };
}

/**
 * Check if a lab can be started (prerequisites met, etc.)
 *
 * For now, only check if already completed
 *
 * Returns: boolean
 */
export function canStartLab(
  labId: string,
  completionRecords: LabCompletionRecord[]
): boolean {
  // A lab can always be started/restarted unless we have other prerequisites
  // For MVP, always allow
  return true;
}

/**
 * Calculate total time spent on domain labs
 *
 * Returns: number (minutes)
 */
export function getDomainLabTotalTime(
  domainId: string,
  completionRecords: LabCompletionRecord[]
): number {
  const domainRecords = completionRecords.filter(r => r.domainId === domainId);
  const totalSeconds = domainRecords.reduce((sum, r) => sum + r.timeSpentSeconds, 0);
  return Math.round(totalSeconds / 60); // Convert to minutes
}

/**
 * Format lab progress label (e.g., "2 of 4 labs complete")
 *
 * Returns: string
 */
export function formatLabProgressLabel(progress: DomainLabProgress): string {
  return `${progress.completedLabs} of ${progress.totalLabs} labs complete`;
}

/**
 * Get badge/icon for lab status
 *
 * Returns: string (emoji or icon identifier)
 */
export function getLabStatusBadge(status: LabStatus): string {
  const badges: Record<LabStatus, string> = {
    [LabStatus.COMPLETED]: '✓',
    [LabStatus.IN_PROGRESS]: '⏱',
    [LabStatus.NOT_STARTED]: '⭕',
  };

  return badges[status] || '?';
}
