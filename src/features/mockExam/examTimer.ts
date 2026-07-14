/**
 * Exam Timer (Phase 4)
 *
 * Manages exam timing: start, pause, resume, auto-submit on timeout.
 * Tracks per-question timing for pacing analysis.
 *
 * Time Limits:
 * - Quick exam: 45 minutes (2700 seconds)
 * - Full exam: 120 minutes (7200 seconds)
 */

export interface QuestionTiming {
  questionId: string;
  timeTakenSeconds: number;
  attemptNumber: number; // 1st, 2nd, etc.
  timestamp: Date;
}

export interface ExamTimerState {
  examType: 'full' | 'quick';
  startTime: Date;
  endTime: Date | null;
  pausedAt: Date | null;
  totalPausedSeconds: number;
  timeLimit: number; // in seconds
  questionTimings: QuestionTiming[];
  isRunning: boolean;
}

/**
 * Create a new exam timer
 *
 * @param examType - 'full' (120 min) or 'quick' (45 min)
 * @returns ExamTimerState initialized at current time
 */
export function createExamTimer(examType: 'full' | 'quick'): ExamTimerState {
  const timeLimit = examType === 'full' ? 120 * 60 : 45 * 60; // convert minutes to seconds

  return {
    examType,
    startTime: new Date(),
    endTime: null,
    pausedAt: null,
    totalPausedSeconds: 0,
    timeLimit,
    questionTimings: [],
    isRunning: true,
  };
}

/**
 * Get the number of seconds remaining in the exam
 * Returns 0 if time is up
 *
 * @param timer - ExamTimerState
 * @param currentTime - Current timestamp (defaults to now)
 * @returns Seconds remaining (0 if time is up)
 */
export function getTimeRemaining(
  timer: ExamTimerState,
  currentTime: Date = new Date()
): number {
  if (timer.endTime) {
    return 0; // Exam already ended
  }

  // Calculate elapsed time
  let elapsed = (currentTime.getTime() - timer.startTime.getTime()) / 1000; // convert ms to seconds
  elapsed -= timer.totalPausedSeconds;

  const remaining = Math.max(0, timer.timeLimit - elapsed);
  return Math.round(remaining);
}

/**
 * Get the percentage of time used (0-100)
 *
 * @param timer - ExamTimerState
 * @param currentTime - Current timestamp
 * @returns Percentage of time used (0-100)
 */
export function getTimeUsagePercentage(
  timer: ExamTimerState,
  currentTime: Date = new Date()
): number {
  const remaining = getTimeRemaining(timer, currentTime);
  const used = timer.timeLimit - remaining;
  return Math.round((used / timer.timeLimit) * 100);
}

/**
 * Format remaining time as MM:SS
 *
 * @param timer - ExamTimerState
 * @param currentTime - Current timestamp
 * @returns Formatted string like "45:30"
 */
export function formatTimeRemaining(
  timer: ExamTimerState,
  currentTime: Date = new Date()
): string {
  const remaining = getTimeRemaining(timer, currentTime);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Pause the exam timer
 * Tracks when paused to exclude pause time from elapsed time
 *
 * @param timer - ExamTimerState to pause
 * @param pauseTime - When paused (defaults to now)
 * @returns Updated timer state
 */
export function pauseExam(
  timer: ExamTimerState,
  pauseTime: Date = new Date()
): ExamTimerState {
  if (!timer.isRunning || timer.pausedAt) {
    return timer; // Already paused or not running
  }

  return {
    ...timer,
    pausedAt: pauseTime,
    isRunning: false,
  };
}

/**
 * Resume the exam timer after a pause
 * Adds the paused duration to total paused time
 *
 * @param timer - ExamTimerState to resume
 * @param resumeTime - When resumed (defaults to now)
 * @returns Updated timer state
 */
export function resumeExam(
  timer: ExamTimerState,
  resumeTime: Date = new Date()
): ExamTimerState {
  if (timer.isRunning || !timer.pausedAt) {
    return timer; // Already running or wasn't paused
  }

  const pausedDuration =
    (resumeTime.getTime() - timer.pausedAt.getTime()) / 1000;

  return {
    ...timer,
    pausedAt: null,
    totalPausedSeconds: timer.totalPausedSeconds + pausedDuration,
    isRunning: true,
  };
}

/**
 * Record the time taken to answer a question
 *
 * @param timer - ExamTimerState
 * @param questionId - ID of the question answered
 * @param timeTakenSeconds - How long it took to answer
 * @param attemptNumber - Which attempt (1st, 2nd, etc.) - defaults to 1
 * @returns Updated timer with the timing recorded
 */
export function trackQuestionTiming(
  timer: ExamTimerState,
  questionId: string,
  timeTakenSeconds: number,
  attemptNumber: number = 1
): ExamTimerState {
  const timing: QuestionTiming = {
    questionId,
    timeTakenSeconds: Math.max(0, timeTakenSeconds),
    attemptNumber,
    timestamp: new Date(),
  };

  return {
    ...timer,
    questionTimings: [...timer.questionTimings, timing],
  };
}

/**
 * Submit exam (mark as ended)
 *
 * @param timer - ExamTimerState
 * @param submitTime - When submitted (defaults to now)
 * @returns Updated timer with end time
 */
export function submitExam(
  timer: ExamTimerState,
  submitTime: Date = new Date()
): ExamTimerState {
  return {
    ...timer,
    endTime: submitTime,
    isRunning: false,
  };
}

/**
 * Calculate average time spent per question
 *
 * @param timer - ExamTimerState
 * @returns Seconds per question (average)
 */
export function calculateAverageTimePerQuestion(timer: ExamTimerState): number {
  if (timer.questionTimings.length === 0) {
    return 0;
  }

  const totalTime = timer.questionTimings.reduce(
    (sum, t) => sum + t.timeTakenSeconds,
    0
  );

  return Math.round(totalTime / timer.questionTimings.length);
}

/**
 * Calculate pacing analysis
 * Returns average time per question and total questions attempted
 *
 * @param totalTimeSeconds - Total time spent
 * @param questionCount - Number of questions
 * @returns Average seconds per question
 */
export function calculateAveragePacePerQuestion(
  totalTimeSeconds: number,
  questionCount: number
): number {
  if (questionCount <= 0) {
    return 0;
  }

  return Math.round(totalTimeSeconds / questionCount);
}

/**
 * Get timing breakdown by domain
 *
 * @param timer - ExamTimerState
 * @param getQuestionDomain - Function to get domain ID for a question
 * @returns Object with domain -> average time mapping
 */
export function getTimingByDomain(
  timer: ExamTimerState,
  getQuestionDomain: (questionId: string) => string | null
): Record<string, number> {
  const domainTimings: Record<string, { total: number; count: number }> = {};

  timer.questionTimings.forEach(timing => {
    const domain = getQuestionDomain(timing.questionId);
    if (domain) {
      if (!domainTimings[domain]) {
        domainTimings[domain] = { total: 0, count: 0 };
      }
      domainTimings[domain].total += timing.timeTakenSeconds;
      domainTimings[domain].count += 1;
    }
  });

  const averages: Record<string, number> = {};
  Object.entries(domainTimings).forEach(([domain, data]) => {
    averages[domain] = Math.round(data.total / data.count);
  });

  return averages;
}

/**
 * Get questions that took the longest (for analysis)
 *
 * @param timer - ExamTimerState
 * @param limit - Max number to return (default 10)
 * @returns Array of question timings sorted by duration (longest first)
 */
export function getSlowestQuestions(
  timer: ExamTimerState,
  limit: number = 10
): QuestionTiming[] {
  return [...timer.questionTimings]
    .sort((a, b) => b.timeTakenSeconds - a.timeTakenSeconds)
    .slice(0, limit);
}

/**
 * Check if exam is over (time limit reached)
 *
 * @param timer - ExamTimerState
 * @param currentTime - Current timestamp
 * @returns true if time is up
 */
export function isTimeUp(
  timer: ExamTimerState,
  currentTime: Date = new Date()
): boolean {
  return getTimeRemaining(timer, currentTime) <= 0;
}

/**
 * Get total elapsed time (excluding paused time)
 *
 * @param timer - ExamTimerState
 * @param currentTime - Current timestamp
 * @returns Seconds elapsed (excluding pause time)
 */
export function getTotalElapsedTime(
  timer: ExamTimerState,
  currentTime: Date = new Date()
): number {
  let elapsed = (currentTime.getTime() - timer.startTime.getTime()) / 1000;
  elapsed -= timer.totalPausedSeconds;

  if (timer.pausedAt) {
    // Currently paused, subtract time since pause
    elapsed -= (currentTime.getTime() - timer.pausedAt.getTime()) / 1000;
  }

  return Math.round(Math.max(0, elapsed));
}
