/**
 * Lab Progress Indicator (Phase 3)
 *
 * Handles logic for:
 * - Calculating lab progress bars
 * - Formatting progress labels and percentages
 * - Determining progress color/status
 * - Generating progress summaries
 */

export interface LabProgressBar {
  completed: number;
  total: number;
  percentage: number; // 0-100
  segments: {
    completed: number;
    inProgress: number;
    notStarted: number;
  };
}

export interface ProgressLabelFormatted {
  short: string; // "2/4"
  long: string; // "2 of 4 labs complete"
  percentage: string; // "50%"
}

export interface ProgressIndicatorStatus {
  status: 'not_started' | 'in_progress' | 'nearly_complete' | 'complete';
  statusLabel: string;
  statusColor: string; // Hex or color name
  suggestedAction: string;
}

/**
 * Get lab progress bar data
 *
 * Returns: LabProgressBar
 */
export function getLabProgressBar(
  totalLabs: number,
  completedLabs: number,
  inProgressLabs: number
): LabProgressBar {
  const notStartedLabs = totalLabs - completedLabs - inProgressLabs;
  const percentage = totalLabs > 0 ? Math.round((completedLabs / totalLabs) * 100) : 0;

  return {
    completed: completedLabs,
    total: totalLabs,
    percentage,
    segments: {
      completed: completedLabs,
      inProgress: inProgressLabs,
      notStarted: notStartedLabs,
    },
  };
}

/**
 * Format lab progress label for display
 *
 * Returns: ProgressLabelFormatted
 */
export function formatLabProgressLabel(
  completedLabs: number,
  totalLabs: number
): ProgressLabelFormatted {
  const percentage = totalLabs > 0 ? Math.round((completedLabs / totalLabs) * 100) : 0;

  return {
    short: `${completedLabs}/${totalLabs}`,
    long: `${completedLabs} of ${totalLabs} labs complete`,
    percentage: `${percentage}%`,
  };
}

/**
 * Get progress indicator status and color
 *
 * Returns: ProgressIndicatorStatus
 */
export function getProgressIndicatorStatus(
  percentage: number
): ProgressIndicatorStatus {
  let status: 'not_started' | 'in_progress' | 'nearly_complete' | 'complete';
  let statusLabel: string;
  let statusColor: string;
  let suggestedAction: string;

  if (percentage === 0) {
    status = 'not_started';
    statusLabel = 'Not started';
    statusColor = '#cccccc'; // Gray
    suggestedAction = 'Start the first lab';
  } else if (percentage < 100) {
    if (percentage >= 75) {
      status = 'nearly_complete';
      statusLabel = 'Nearly complete';
      statusColor = '#ffa500'; // Orange
      suggestedAction = 'Complete the remaining labs';
    } else {
      status = 'in_progress';
      statusLabel = 'In progress';
      statusColor = '#0066cc'; // Blue
      suggestedAction = `Keep going! ${100 - percentage}% remaining`;
    }
  } else {
    status = 'complete';
    statusLabel = 'Complete';
    statusColor = '#00cc44'; // Green
    suggestedAction = 'All labs done!';
  }

  return {
    status,
    statusLabel,
    statusColor,
    suggestedAction,
  };
}

/**
 * Calculate progress segments for a progress bar (visual representation)
 *
 * Useful for stacked bar charts showing completed/in-progress/not-started
 *
 * Returns: {completed: number, inProgress: number, notStarted: number}
 */
export function calculateProgressSegments(
  completedLabs: number,
  inProgressLabs: number,
  totalLabs: number
): {
  completed: number;
  inProgress: number;
  notStarted: number;
} {
  const notStartedLabs = totalLabs - completedLabs - inProgressLabs;

  return {
    completed: Math.round((completedLabs / totalLabs) * 100),
    inProgress: Math.round((inProgressLabs / totalLabs) * 100),
    notStarted: Math.round((notStartedLabs / totalLabs) * 100),
  };
}

/**
 * Get detailed progress summary
 *
 * Returns: string (multi-line summary)
 */
export function getLabProgressSummary(
  completedLabs: number,
  inProgressLabs: number,
  totalLabs: number
): string {
  const notStartedLabs = totalLabs - completedLabs - inProgressLabs;
  const percentage = totalLabs > 0 ? Math.round((completedLabs / totalLabs) * 100) : 0;

  return `Lab Progress: ${completedLabs}/${totalLabs} completed (${percentage}%)
Completed: ${completedLabs}
In Progress: ${inProgressLabs}
Not Started: ${notStartedLabs}`;
}

/**
 * Estimate time to complete remaining labs
 *
 * Heuristic: Assume 15 minutes per lab on average
 *
 * Returns: number (minutes remaining)
 */
export function estimateTimeToCompletion(
  completedLabs: number,
  totalLabs: number,
  avgTimePerLabMinutes: number = 15
): number {
  const remainingLabs = totalLabs - completedLabs;
  return remainingLabs * avgTimePerLabMinutes;
}

/**
 * Get motivation message based on progress
 *
 * Returns: string
 */
export function getMotivationMessage(
  completedLabs: number,
  totalLabs: number
): string {
  const percentage = totalLabs > 0 ? Math.round((completedLabs / totalLabs) * 100) : 0;
  const remaining = totalLabs - completedLabs;

  if (percentage === 0) {
    return `Let's start! ${totalLabs} labs awaiting you.`;
  }

  if (percentage === 100) {
    return `🎉 All labs complete! You've mastered this domain!`;
  }

  if (percentage >= 75) {
    return `Almost there! Just ${remaining} more lab${remaining !== 1 ? 's' : ''} to go.`;
  }

  if (percentage >= 50) {
    return `Halfway through! You're doing great. ${remaining} labs left.`;
  }

  return `Nice start! ${remaining} more labs to complete.`;
}

/**
 * Compare progress across domains
 *
 * Useful for showing which domain is most complete
 *
 * Returns: Array sorted by completion percentage (highest first)
 */
export function rankDomainsByLabProgress(
  domainProgresses: Array<{
    domainId: string;
    completedLabs: number;
    totalLabs: number;
  }>
): Array<{
  domainId: string;
  percentage: number;
  completed: number;
  total: number;
  rank: number;
}> {
  const withPercentages = domainProgresses.map(d => ({
    domainId: d.domainId,
    percentage: d.totalLabs > 0 ? Math.round((d.completedLabs / d.totalLabs) * 100) : 0,
    completed: d.completedLabs,
    total: d.totalLabs,
    rank: 0,
  }));

  // Sort by percentage descending
  withPercentages.sort((a, b) => b.percentage - a.percentage);

  // Add ranks
  return withPercentages.map((d, index) => ({
    ...d,
    rank: index + 1,
  }));
}

/**
 * Format time estimate for display
 *
 * Returns: string (e.g., "45 minutes", "2 hours")
 */
export function formatTimeEstimate(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
}

/**
 * Get progress bar HTML/CSS class based on percentage
 *
 * Used for styling progress bars
 *
 * Returns: string (class name)
 */
export function getProgressBarClass(percentage: number): string {
  if (percentage === 0) return 'progress-not-started';
  if (percentage < 25) return 'progress-minimal';
  if (percentage < 50) return 'progress-quarter';
  if (percentage < 75) return 'progress-half';
  if (percentage < 100) return 'progress-mostly';
  return 'progress-complete';
}
