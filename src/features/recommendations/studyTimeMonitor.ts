/**
 * Study Time Monitor (Phase 6)
 *
 * Tracks study session duration and suggests breaks.
 * Implements: "You've studied 3 hours, take a break"
 *
 * All functions are pure and testable.
 */

import { StudySessionData, Recommendation, RecommendationPriority, RecommendationType } from './recommendationTypes';

/**
 * Track a study session's duration
 * Updates total study time for the day
 *
 * @param sessionData Session information
 * @returns Updated study session with duration
 */
export function trackStudySessionDuration(sessionData: Partial<StudySessionData>): StudySessionData {
  const now = new Date();
  const endTime = sessionData.endTime || now;
  const startTime = sessionData.startTime || new Date(now.getTime() - 60 * 60 * 1000); // Default 1 hour ago

  const durationMs = endTime.getTime() - startTime.getTime();
  const durationMinutes = Math.round(durationMs / (1000 * 60));

  return {
    sessionId: sessionData.sessionId || `session_${Date.now()}`,
    userId: sessionData.userId || 'unknown',
    startTime,
    endTime,
    durationMinutes: Math.max(0, durationMinutes),
    breaksTaken: sessionData.breaksTaken || 0,
    activitiesCompleted: sessionData.activitiesCompleted || [],
  };
}

/**
 * Calculate total study time for today
 *
 * @param sessions Array of study sessions from today
 * @returns Total minutes studied today
 */
export function calculateTodayStudyTime(sessions: StudySessionData[]): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return sessions
    .filter(session => {
      const sessionDate = new Date(
        session.startTime.getFullYear(),
        session.startTime.getMonth(),
        session.startTime.getDate()
      );
      return sessionDate.getTime() === today.getTime();
    })
    .reduce((total, session) => total + session.durationMinutes, 0);
}

/**
 * Determine if user should take a break
 *
 * Rules:
 * - Suggest break after 3+ hours continuous study
 * - Or if more than 5+ hours total today
 * - Only if no break taken in last 30 minutes
 *
 * @param studyMinutesToday Total study minutes today
 * @param currentSessionMinutes Minutes in current session
 * @param lastBreakTime When was the last break taken?
 * @returns true if user should take a break
 */
export function shouldSuggestBreak(
  studyMinutesToday: number,
  currentSessionMinutes: number,
  lastBreakTime?: Date
): boolean {
  // Check if current session is 3+ hours without a break
  if (currentSessionMinutes >= 180) {
    // If no break in last 30 minutes, suggest one
    if (!lastBreakTime) {
      return true;
    }

    const minsSinceBreak = (new Date().getTime() - lastBreakTime.getTime()) / (1000 * 60);
    if (minsSinceBreak >= 60) {
      return true;
    }
  }

  // Check if total today is 5+ hours
  if (studyMinutesToday >= 300) {
    if (!lastBreakTime) {
      return true;
    }

    const minsSinceBreak = (new Date().getTime() - lastBreakTime.getTime()) / (1000 * 60);
    if (minsSinceBreak >= 30) {
      return true;
    }
  }

  return false;
}

/**
 * Generate a break suggestion recommendation
 *
 * @param userId User ID
 * @param studyMinutesToday Total minutes studied today
 * @param currentSessionMinutes Minutes in current session
 * @returns Break suggestion recommendation or null
 */
export function generateBreakSuggestion(
  userId: string,
  studyMinutesToday: number,
  currentSessionMinutes: number
): Recommendation | null {
  if (!shouldSuggestBreak(studyMinutesToday, currentSessionMinutes)) {
    return null;
  }

  const now = new Date();
  const sessionHours = Math.round(currentSessionMinutes / 60);
  const totalHours = Math.round(studyMinutesToday / 60);

  return {
    id: `rec_break_${Date.now()}`,
    userId,
    priority: RecommendationPriority.IMMEDIATE,
    type: RecommendationType.BREAK_SUGGESTION,
    title: `Take a Break! You've Studied ${sessionHours} Hours`,
    description: `You've been studying for ${sessionHours} hours straight (${totalHours} hours total today). Step away for 15-20 minutes. Your brain will thank you, and you'll study better after rest.`,
    action: {
      type: 'show_modal',
      target: 'break_timer',
      params: { suggestedDurationMinutes: 15 },
    },
    reasoning: `${currentSessionMinutes} minutes in current session, fatigue affects learning`,
    confidence: 85,
    importance: 6,
    dismissible: true,
    createdAt: now,
  };
}

/**
 * Check if this is a good time for the user to study based on their habits
 *
 * Analyzes user's historical study times and suggests if NOW is optimal.
 * This is a simple heuristic - real implementation would use historical data.
 *
 * @param sessions User's recent study sessions
 * @returns true if this is a typical study time for this user
 */
export function isBestTimeToStudy(sessions: StudySessionData[]): boolean {
  if (sessions.length === 0) {
    return true; // If no data, any time is fine
  }

  const now = new Date();
  const currentHour = now.getHours();

  // Analyze when user typically studies
  const hourCounts = new Map<number, number>();
  sessions.slice(-10).forEach(session => {
    const hour = session.startTime.getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  });

  // If current hour is in user's top study times, it's optimal
  const sessionsThisHour = hourCounts.get(currentHour) || 0;
  const maxSessions = Math.max(...Array.from(hourCounts.values()));

  // If this hour represents at least 30% of typical study time, it's a good time
  return sessionsThisHour >= maxSessions * 0.3;
}

/**
 * Get recommended study duration based on daily target
 *
 * @param studyMinutesToday Minutes already studied today
 * @param dailyTargetMinutes Target daily study minutes (default: 90)
 * @returns Minutes remaining to study today
 */
export function getRemainingStudyTime(
  studyMinutesToday: number,
  dailyTargetMinutes: number = 90
): number {
  return Math.max(0, dailyTargetMinutes - studyMinutesToday);
}

/**
 * Detect if user is on a productive study streak
 *
 * @param sessions Study sessions from past 7 days
 * @returns Number of consecutive days studied
 */
export function detectStudyStreak(sessions: StudySessionData[]): number {
  const now = new Date();
  const sessionsByDay = new Map<string, boolean>();

  sessions.forEach(session => {
    const date = new Date(session.startTime);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    sessionsByDay.set(dateKey, true);
  });

  let streak = 0;
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    if (sessionsByDay.has(dateKey)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Generate milestone celebration for study streak
 *
 * @param streakDays Current streak length
 * @returns Milestone recommendation if streak hits 7, 14, 30, 60, or 90 days
 */
export function generateStreakMilestoneRecommendation(
  userId: string,
  streakDays: number
): Recommendation | null {
  const milestones = [7, 14, 30, 60, 90];
  if (!milestones.includes(streakDays)) {
    return null;
  }

  const now = new Date();
  const messages: Record<number, { title: string; description: string }> = {
    7: {
      title: '🔥 7-Day Study Streak!',
      description: 'Amazing work! You\'ve studied 7 days in a row. Consistency is the key to success.',
    },
    14: {
      title: '🔥 14-Day Study Streak!',
      description: 'Two weeks of dedication! You\'re building a powerful habit. Keep it up!',
    },
    30: {
      title: '🎯 30-Day Study Streak!',
      description: 'One month of consistency! This is how exam-ready students study. You\'re on track.',
    },
    60: {
      title: '💪 60-Day Study Streak!',
      description: 'Two months! You\'re in the top 5% of dedicated students. You\'re going to ace this exam.',
    },
    90: {
      title: '👑 90-Day Study Streak!',
      description: 'Three months of unbroken dedication! You are absolutely crushing it. The exam won\'t stand a chance.',
    },
  };

  const milestone = messages[streakDays];
  if (!milestone) return null;

  return {
    id: `rec_milestone_${streakDays}_${Date.now()}`,
    userId,
    priority: RecommendationPriority.MAINTENANCE,
    type: RecommendationType.EXAM_READINESS,
    title: milestone.title,
    description: milestone.description,
    action: {
      type: 'show_modal',
      target: 'milestone_celebration',
      params: { streakDays },
    },
    reasoning: `${streakDays}-day streak milestone reached`,
    confidence: 100,
    importance: 3,
    dismissible: true,
    createdAt: now,
  };
}
