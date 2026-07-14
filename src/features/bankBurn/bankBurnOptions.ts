/**
 * Bank Burn Session Options (Phase 5B)
 *
 * Configurable options for bank burn sessions:
 * - Shuffle questions: Randomize order
 * - Show timer: Display countdown
 * - Hard questions only: Filter to difficult questions
 * - Strict mode: No hints/review until complete
 */

export interface BankBurnOptions {
  shuffleQuestions: boolean;
  showTimer: boolean;
  hardQuestionsOnly: boolean;
  strictMode: boolean;
  showExplanations: boolean;
  randomizeAnswerChoices: boolean;
  timerWarning: number; // seconds before timeout to warn
}

export interface SessionOptionsPreference {
  userId: string;
  defaultOptions: BankBurnOptions;
  lastUsedOptions: BankBurnOptions;
  lastUpdated: Date;
}

/**
 * Get default options for bank burn sessions
 * These are the recommended default settings
 *
 * @returns Default BankBurnOptions
 */
export function getDefaultOptions(): BankBurnOptions {
  return {
    shuffleQuestions: true,
    showTimer: true,
    hardQuestionsOnly: false,
    strictMode: false,
    showExplanations: true,
    randomizeAnswerChoices: true,
    timerWarning: 60, // Warn when 1 minute left
  };
}

/**
 * Get strict mode options (challenge configuration)
 * Maximum difficulty with no safety nets
 *
 * @returns BankBurnOptions optimized for challenge
 */
export function getStrictModeOptions(): BankBurnOptions {
  return {
    shuffleQuestions: true,
    showTimer: false, // No timer distractions
    hardQuestionsOnly: true,
    strictMode: true,
    showExplanations: false, // No explanations until review
    randomizeAnswerChoices: true,
    timerWarning: 0,
  };
}

/**
 * Get relaxed mode options (learning configuration)
 * Maximum support for learning
 *
 * @returns BankBurnOptions optimized for learning
 */
export function getRelaxedModeOptions(): BankBurnOptions {
  return {
    shuffleQuestions: false,
    showTimer: true,
    hardQuestionsOnly: false,
    strictMode: false,
    showExplanations: true,
    randomizeAnswerChoices: false, // Consistent for learning
    timerWarning: 120, // Generous warning
  };
}

/**
 * Apply session options to a question bank
 * Filters and configures questions based on options
 *
 * @param questions - Original question array
 * @param options - BankBurnOptions to apply
 * @returns Processed questions array
 */
export function applySessionOptions(
  questions: any[],
  options: BankBurnOptions
): any[] {
  let processed = [...questions];

  // Filter by difficulty if strict
  if (options.hardQuestionsOnly) {
    processed = processed.filter(q => {
      // Assume questions have a difficulty field
      return q.difficulty === 'hard' || q.difficulty === 'expert';
    });
  }

  // Shuffle if enabled
  if (options.shuffleQuestions) {
    processed = shuffleArray(processed);
  }

  // Randomize answer choices per question if enabled
  if (options.randomizeAnswerChoices) {
    processed = processed.map(q => {
      if (q.choices && Array.isArray(q.choices)) {
        return {
          ...q,
          choices: shuffleArray([...q.choices]),
        };
      }
      return q;
    });
  }

  // Hide explanations if strict mode
  if (!options.showExplanations && options.strictMode) {
    processed = processed.map(q => ({
      ...q,
      explanation: undefined, // Remove explanation field
    }));
  }

  return processed;
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * Pure function - doesn't mutate original
 *
 * @param array - Array to shuffle
 * @returns New shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Save session options preference for a user
 * Persists options across sessions
 *
 * @param userId - User ID
 * @param options - BankBurnOptions to save
 * @param currentPreference - Existing preference (if any)
 * @returns Updated SessionOptionsPreference
 */
export function saveSessionOptionsPreference(
  userId: string,
  options: BankBurnOptions,
  currentPreference?: SessionOptionsPreference
): SessionOptionsPreference {
  return {
    userId,
    defaultOptions: currentPreference?.defaultOptions || getDefaultOptions(),
    lastUsedOptions: options,
    lastUpdated: new Date(),
  };
}

/**
 * Load saved options preference
 * Returns last used options, or defaults if none saved
 *
 * @param userId - User ID
 * @param preference - Stored preference (if any)
 * @returns BankBurnOptions to use
 */
export function loadSessionOptionsPreference(
  userId: string,
  preference?: SessionOptionsPreference
): BankBurnOptions {
  if (!preference || !preference.lastUsedOptions) {
    return getDefaultOptions();
  }

  return preference.lastUsedOptions;
}

/**
 * Validate options object
 * Ensures all fields are properly set
 *
 * @param options - Options to validate
 * @returns true if options are valid
 */
export function validateOptions(options: any): options is BankBurnOptions {
  if (!options || typeof options !== 'object') {
    return false;
  }

  const required = [
    'shuffleQuestions',
    'showTimer',
    'hardQuestionsOnly',
    'strictMode',
    'showExplanations',
    'randomizeAnswerChoices',
  ];

  return required.every(
    field =>
      typeof options[field] === 'boolean' || field === 'timerWarning'
  );
}

/**
 * Merge partial options with defaults
 * Allows partial option updates
 *
 * @param userOptions - Partial options from user
 * @param defaults - Default options to merge with
 * @returns Merged complete options
 */
export function mergeOptions(
  userOptions: Partial<BankBurnOptions>,
  defaults: BankBurnOptions = getDefaultOptions()
): BankBurnOptions {
  return {
    ...defaults,
    ...userOptions,
  };
}

/**
 * Get option description for UI
 * Human-readable explanation of what each option does
 *
 * @returns Object mapping option keys to descriptions
 */
export function getOptionDescriptions(): Record<string, string> {
  return {
    shuffleQuestions: 'Randomize question order to prevent memorization',
    showTimer: 'Display countdown timer during session',
    hardQuestionsOnly: 'Include only difficult questions',
    strictMode: 'No hints or explanations until review',
    showExplanations: 'Display explanations for answers',
    randomizeAnswerChoices: 'Randomize answer choice order per question',
    timerWarning: 'Seconds before session timeout to show warning',
  };
}

/**
 * Check if options conflict with each other
 * Some options may not make sense together
 *
 * @param options - Options to check
 * @returns Array of conflict descriptions, empty if no conflicts
 */
export function checkOptionConflicts(options: BankBurnOptions): string[] {
  const conflicts: string[] = [];

  // Strict mode automatically implies certain settings
  if (options.strictMode) {
    if (options.showExplanations) {
      conflicts.push('Strict mode disables explanations');
    }
  }

  // Hard only requires enough questions
  // This check would need access to question count

  return conflicts;
}

/**
 * Create a custom options preset
 * Named configurations for common scenarios
 *
 * @param presetName - Name of preset
 * @returns Custom BankBurnOptions or null if unknown preset
 */
export function getCustomPreset(
  presetName:
    | 'default'
    | 'strict'
    | 'relaxed'
    | 'timed'
    | 'untimed'
    | 'hard_mode'
): BankBurnOptions | null {
  switch (presetName) {
    case 'default':
      return getDefaultOptions();
    case 'strict':
      return getStrictModeOptions();
    case 'relaxed':
      return getRelaxedModeOptions();
    case 'timed':
      return {
        ...getDefaultOptions(),
        showTimer: true,
      };
    case 'untimed':
      return {
        ...getDefaultOptions(),
        showTimer: false,
      };
    case 'hard_mode':
      return {
        ...getStrictModeOptions(),
        showTimer: true,
      };
    default:
      return null;
  }
}

/**
 * Create a default options preference for new user
 *
 * @param userId - User ID
 * @returns New SessionOptionsPreference
 */
export function createSessionOptionsPreference(
  userId: string
): SessionOptionsPreference {
  return {
    userId,
    defaultOptions: getDefaultOptions(),
    lastUsedOptions: getDefaultOptions(),
    lastUpdated: new Date(),
  };
}
