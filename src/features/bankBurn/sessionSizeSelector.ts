/**
 * Bank Burn Session Size Selector (Phase 5B)
 *
 * Allows users to customize how many questions to study per session:
 * - Presets: 5 (quick), 10 (standard), 20 (deep), 50 (marathon)
 * - Custom: User-defined size (1 to max available)
 * - Persistence: Remembers user's last choice
 */

export type SessionSizePreset = 5 | 10 | 20 | 50;

export interface SessionSizeOption {
  size: number;
  label: string;
  description: string;
  estimatedTime: number; // minutes
  isPreset: boolean;
}

export interface SessionSizePreference {
  userId: string;
  lastSessionSize: number | null;
  preferredSessionSize: number | null;
  lastUsedDate: Date | null;
  usageHistory: number[]; // Last 10 sizes used
}

/**
 * Get available preset sizes
 * Returns the standard preset options
 *
 * @returns Array of preset sizes
 */
export function getPresetSizes(): SessionSizePreset[] {
  return [5, 10, 20, 50];
}

/**
 * Get available session size options for a domain
 * Returns presets plus ability to set custom size
 *
 * @param domainId - Domain ID to get available questions for
 * @param maxAvailable - Total questions available in domain
 * @returns Array of SessionSizeOption objects
 */
export function getAvailableSizes(
  domainId: string,
  maxAvailable: number = 100
): SessionSizeOption[] {
  const presets = getPresetSizes();
  const sizes: SessionSizeOption[] = [];

  // Add preset sizes that fit within available questions
  presets.forEach(size => {
    if (size <= maxAvailable) {
      sizes.push({
        size,
        label: `${size} Questions`,
        description: getSessionDescription(size),
        estimatedTime: estimateSessionTime(size),
        isPreset: true,
      });
    }
  });

  // Always offer custom option (if not already covered by presets)
  if (!presets.includes(maxAvailable as SessionSizePreset)) {
    sizes.push({
      size: maxAvailable,
      label: `${maxAvailable} Questions (All)`,
      description: `Study all ${maxAvailable} available questions`,
      estimatedTime: estimateSessionTime(maxAvailable),
      isPreset: false,
    });
  }

  return sizes;
}

/**
 * Get description for a session size
 * User-friendly explanation of the session
 *
 * @param size - Session size
 * @returns Description string
 */
export function getSessionDescription(size: number): string {
  if (size <= 5) {
    return 'Quick review session';
  } else if (size <= 10) {
    return 'Standard practice session';
  } else if (size <= 20) {
    return 'Deep dive learning session';
  } else if (size <= 50) {
    return 'Marathon study session';
  } else {
    return 'Extended mastery session';
  }
}

/**
 * Estimate time needed to complete a session
 * Assumes ~1-2 minutes per question average
 *
 * @param size - Session size (number of questions)
 * @returns Estimated time in minutes
 */
export function estimateSessionTime(size: number): number {
  // Conservative estimate: 1.5 minutes per question
  return Math.ceil(size * 1.5);
}

/**
 * Validate that custom size is within acceptable range
 *
 * @param size - Custom size to validate
 * @param maxAvailable - Maximum available questions
 * @param minSize - Minimum allowed size (default 1)
 * @returns true if size is valid
 */
export function validateCustomSize(
  size: number,
  maxAvailable: number,
  minSize: number = 1
): boolean {
  // Check type and range
  if (!Number.isInteger(size)) {
    return false;
  }

  if (size < minSize || size > maxAvailable) {
    return false;
  }

  return true;
}

/**
 * Parse custom size input from user
 * Handles string input and validates it
 *
 * @param input - User input (string or number)
 * @param maxAvailable - Maximum available questions
 * @returns Parsed size or null if invalid
 */
export function parseCustomSize(
  input: string | number,
  maxAvailable: number
): number | null {
  let size: number;

  if (typeof input === 'string') {
    size = parseInt(input, 10);
    if (isNaN(size)) {
      return null;
    }
  } else {
    size = input;
  }

  return validateCustomSize(size, maxAvailable) ? size : null;
}

/**
 * Save session size preference for a user
 * Records both the size and when it was used
 *
 * @param userId - User ID
 * @param size - Size to save as preference
 * @param preferences - Current preferences object (will be updated)
 * @returns Updated preferences
 */
export function saveSessionSizePreference(
  userId: string,
  size: number,
  preferences?: SessionSizePreference
): SessionSizePreference {
  const history = preferences?.usageHistory || [];

  // Add to history (keep last 10)
  const updatedHistory = [size, ...history].slice(0, 10);

  return {
    userId,
    lastSessionSize: size,
    preferredSessionSize: size,
    lastUsedDate: new Date(),
    usageHistory: updatedHistory,
  };
}

/**
 * Get the user's last session size
 * Defaults to standard (10) if no preference set
 *
 * @param userId - User ID
 * @param preferences - User's preferences (if available)
 * @returns Recommended size for next session
 */
export function getLastSessionSize(
  userId: string,
  preferences?: SessionSizePreference
): number {
  if (!preferences || !preferences.lastSessionSize) {
    return 10; // Default to standard
  }

  return preferences.lastSessionSize;
}

/**
 * Get most common session size in history
 * Shows what size user typically prefers
 *
 * @param preferences - User's preferences
 * @returns Most frequently used size
 */
export function getMostCommonSize(
  preferences?: SessionSizePreference
): number {
  if (!preferences || preferences.usageHistory.length === 0) {
    return 10; // Default
  }

  const history = preferences.usageHistory;
  const counts: Record<number, number> = {};

  history.forEach(size => {
    counts[size] = (counts[size] || 0) + 1;
  });

  let mostCommon = history[0];
  let maxCount = 0;

  Object.entries(counts).forEach(([size, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = parseInt(size, 10);
    }
  });

  return mostCommon;
}

/**
 * Suggest appropriate size based on available time
 *
 * @param minutesAvailable - Time the user has
 * @returns Suggested session size
 */
export function suggestSizeByTime(minutesAvailable: number): SessionSizePreset {
  // Assume 1.5 minutes per question
  let suggested = Math.floor(minutesAvailable / 1.5);

  // Round to nearest preset
  if (suggested <= 5) {
    return 5;
  } else if (suggested <= 10) {
    return 10;
  } else if (suggested <= 20) {
    return 20;
  } else {
    return 50;
  }
}

/**
 * Create a session size preference object for a new user
 *
 * @param userId - User ID
 * @returns New SessionSizePreference
 */
export function createSessionSizePreference(
  userId: string
): SessionSizePreference {
  return {
    userId,
    lastSessionSize: 10, // Default to standard
    preferredSessionSize: 10,
    lastUsedDate: null,
    usageHistory: [],
  };
}
