/**
 * Contextual Handoffs (Phase 6)
 *
 * Suggests next action based on what user just completed.
 * Implements smart branching: "After quiz score 75%, try trap drill?"
 *
 * All functions are pure and testable.
 */

import { Recommendation, RecommendationPriority, RecommendationType, QuizResult } from './recommendationTypes';

/**
 * Determine next action after a quiz attempt
 *
 * Branching logic:
 * - Score < 70%: "Weak area needs focus, try trap drill"
 * - Score 70-85%: "Good effort, practice more with bank burn"
 * - Score 85%+: "Mastered! Ready for next objective or domain pass?"
 *
 * @param userId User ID
 * @param quizResult Quiz result data
 * @param allObjectivesInDomain Total objectives in this domain
 * @param masteredObjectivesCount How many are already mastered?
 * @returns Recommendation for next activity
 */
export function getNextActionAfterQuiz(
  userId: string,
  quizResult: QuizResult,
  allObjectivesInDomain: number = 10,
  masteredObjectivesCount: number = 3
): Recommendation | null {
  const now = new Date();
  const { score, objectiveId } = quizResult;

  // Score is very low - needs intense focus
  if (score < 50) {
    return {
      id: `rec_next_trap_drill_${objectiveId}_${Date.now()}`,
      userId,
      priority: RecommendationPriority.IMMEDIATE,
      type: RecommendationType.TRAP_DRILL,
      title: 'You Need a Trap Drill - Master the Patterns',
      description: `Your ${score}% score suggests you're missing key patterns in this objective. A trap drill will help you identify and fix them quickly.`,
      action: {
        type: 'start_activity',
        target: 'trap_drill',
        params: { objectiveId },
      },
      reasoning: `Low score (${score}%), trap patterns need focus`,
      confidence: 90,
      importance: 9,
      dismissible: false,
      createdAt: now,
    };
  }

  // Score is weak but not critical - encourage more practice
  if (score >= 50 && score < 70) {
    return {
      id: `rec_next_bank_burn_${objectiveId}_${Date.now()}`,
      userId,
      priority: RecommendationPriority.STRATEGIC,
      type: RecommendationType.BANK_BURN,
      title: 'Practice More Questions - Bank Burn This Objective',
      description: `You scored ${score}% - not bad, but let's get you above 75%. Burn 15-20 more questions to lock in this knowledge.`,
      action: {
        type: 'start_activity',
        target: 'bank_burn',
        params: { objectiveId, targetQuestions: 20 },
      },
      reasoning: `Moderate score (${score}%), bank burn for reinforcement`,
      confidence: 85,
      importance: 7,
      dismissible: true,
      createdAt: now,
    };
  }

  // Score is good - encourage moving on or mastery check
  if (score >= 70 && score < 85) {
    return {
      id: `rec_next_move_on_${objectiveId}_${Date.now()}`,
      userId,
      priority: RecommendationPriority.MAINTENANCE,
      type: RecommendationType.BANK_BURN,
      title: 'Good Work - One More Round to Lock It In',
      description: `Your ${score}% shows solid understanding. Do 10 more questions to get above 80%, then you can move to the next objective.`,
      action: {
        type: 'start_activity',
        target: 'bank_burn',
        params: { objectiveId, targetQuestions: 10 },
      },
      reasoning: `Good score (${score}%), reinforcement before moving on`,
      confidence: 80,
      importance: 5,
      dismissible: true,
      createdAt: now,
    };
  }

  // Score is excellent - suggest moving forward
  if (score >= 85) {
    // If all objectives mastered, suggest domain pass
    if (masteredObjectivesCount >= allObjectivesInDomain - 2) {
      return {
        id: `rec_next_domain_pass_${objectiveId}_${Date.now()}`,
        userId,
        priority: RecommendationPriority.STRATEGIC,
        type: RecommendationType.DOMAIN_PASS,
        title: 'Excellent! Ready for Domain Pass?',
        description: `You scored ${score}% and have mastered most objectives in this domain. Consider taking the domain pass to certify your knowledge.`,
        action: {
          type: 'show_modal',
          target: 'domain_pass_ready_check',
          params: { objectiveId },
        },
        reasoning: `High score (${score}%), most objectives mastered, ready for certification`,
        confidence: 88,
        importance: 8,
        dismissible: true,
        createdAt: now,
      };
    }

    // Otherwise, move to next objective
    return {
      id: `rec_next_objective_${objectiveId}_${Date.now()}`,
      userId,
      priority: RecommendationPriority.MAINTENANCE,
      type: RecommendationType.DOMAIN_BASELINE,
      title: 'Excellent Work! Move to the Next Objective',
      description: `${score}% is outstanding! You've mastered this objective. Move to the next one to keep building your knowledge.`,
      action: {
        type: 'navigate',
        target: '/objective/next',
        params: { previousObjectiveId: objectiveId },
      },
      reasoning: `High score (${score}%), objective mastered, proceed to next`,
      confidence: 92,
      importance: 6,
      dismissible: true,
      createdAt: now,
    };
  }

  return null;
}

/**
 * Determine next action after a domain baseline
 *
 * After baseline:
 * - Score 80%+: "Test out! Take domain pass"
 * - Score < 80%: "Focus on weak areas first"
 *
 * @param userId User ID
 * @param baselineScore Baseline score
 * @param domainId Domain ID
 * @param weakAreas Identified weak areas
 * @returns Recommendation for next activity
 */
export function getNextActionAfterBaseline(
  userId: string,
  baselineScore: number,
  domainId: string,
  weakAreas: string[]
): Recommendation {
  const now = new Date();

  if (baselineScore >= 80) {
    return {
      id: `rec_after_baseline_pass_${domainId}_${Date.now()}`,
      userId,
      priority: RecommendationPriority.IMMEDIATE,
      type: RecommendationType.DOMAIN_PASS,
      title: `Great Baseline! Ready to Test Out?`,
      description: `You scored ${baselineScore}% on the baseline. You can test out right now and earn domain certification. Or, polish weak areas first?`,
      action: {
        type: 'show_modal',
        target: 'test_out_confirmation',
        params: { domainId, baselineScore },
      },
      reasoning: `Strong baseline (${baselineScore}%), test out eligibility unlocked`,
      confidence: 90,
      importance: 8,
      dismissible: false,
      createdAt: now,
    };
  }

  // Score < 80% - focus on weak areas
  return {
    id: `rec_after_baseline_weak_${domainId}_${Date.now()}`,
    userId,
    priority: RecommendationPriority.STRATEGIC,
    type: RecommendationType.WEAK_AREA_FOCUS,
    title: 'Focus on Weak Areas Before Test-Out',
    description: `Your baseline was ${baselineScore}%. These ${weakAreas.length} weak areas need attention before you can test out: ${weakAreas.slice(0, 3).join(', ')}.`,
    action: {
      type: 'start_activity',
      target: 'weak_area_focus',
      params: { domainId, targetObjectives: weakAreas },
    },
    reasoning: `Baseline ${baselineScore}%, weak areas identified for focused study`,
    confidence: 85,
    importance: 8,
    dismissible: true,
    createdAt: now,
  };
}

/**
 * Determine next action after a domain pass attempt
 *
 * After domain pass:
 * - Passed: "Certified! Move to next domain or take mock exam?"
 * - Failed: "Retake in 5 days, focus on weak areas"
 *
 * @param userId User ID
 * @param passed Whether domain pass was passed
 * @param domainId Domain ID
 * @param score Domain pass score
 * @param attemptNumber Which attempt number is this?
 * @param weakAreas Weak areas from this attempt
 * @returns Recommendation for next activity
 */
export function getNextActionAfterDomainPass(
  userId: string,
  passed: boolean,
  domainId: string,
  score: number,
  attemptNumber: number = 1,
  weakAreas: string[] = []
): Recommendation {
  const now = new Date();

  if (passed) {
    return {
      id: `rec_after_domain_pass_success_${domainId}_${Date.now()}`,
      userId,
      priority: RecommendationPriority.STRATEGIC,
      type: RecommendationType.DOMAIN_PASS,
      title: 'Certified! What\'s Next?',
      description: `Congratulations! You earned domain certification with a ${score}%. Choose: move to the next domain, or take a mock exam to see overall readiness?`,
      action: {
        type: 'show_modal',
        target: 'post_certification_choice',
        params: { domainId, score },
      },
      reasoning: `Domain pass success (${score}%), next milestone selection`,
      confidence: 95,
      importance: 9,
      dismissible: false,
      createdAt: now,
    };
  }

  // Failed - schedule retake
  const retakeDate = new Date(now);
  retakeDate.setDate(retakeDate.getDate() + 5);

  return {
    id: `rec_after_domain_pass_fail_${domainId}_${Date.now()}`,
    userId,
    priority: RecommendationPriority.WARNING,
    type: RecommendationType.WEAK_AREA_FOCUS,
    title: `Domain Pass Failed - Retake in 5 Days`,
    description: `Your ${score}% on the domain pass was below passing (80%). Focus on these weak areas, then retake in 5 days.`,
    action: {
      type: 'start_activity',
      target: 'weak_area_focus',
      params: { domainId, targetObjectives: weakAreas, retakeDate: retakeDate.toISOString() },
    },
    reasoning: `Domain pass failed (${score}%), scheduled retry in 5 days`,
    confidence: 85,
    importance: 8,
    dismissible: true,
    dueDate: retakeDate,
    createdAt: now,
  };
}

/**
 * Determine next action after mock exam
 *
 * After mock exam:
 * - Score 80%+: "You're exam-ready! Final polish on weak domains?"
 * - Score 60-80%: "Good progress, focus on [weak domains] for 2 more weeks"
 * - Score < 60%: "Need more study time, here's your retake plan"
 *
 * @param userId User ID
 * @param mockExamScore Mock exam score
 * @param daysTillExam Days until real exam
 * @param weakDomains Domains that need work
 * @returns Recommendation for exam prep next steps
 */
export function getNextActionAfterMockExam(
  userId: string,
  mockExamScore: number,
  daysTillExam: number,
  weakDomains: string[]
): Recommendation {
  const now = new Date();

  if (mockExamScore >= 80) {
    return {
      id: `rec_after_mock_exam_ready_${Date.now()}`,
      userId,
      priority: RecommendationPriority.MAINTENANCE,
      type: RecommendationType.EXAM_READINESS,
      title: 'You\'re Exam-Ready! Final Polish Phase',
      description: `Your mock exam score is ${mockExamScore}%. You're in great shape for the real exam in ${daysTillExam} days. Polish these ${weakDomains.length} weak domains for maximum confidence.`,
      action: {
        type: 'show_modal',
        target: 'final_polish_plan',
        params: { weakDomains, daysTillExam, mockExamScore },
      },
      reasoning: `High mock exam score (${mockExamScore}%), final preparation phase`,
      confidence: 90,
      importance: 7,
      dismissible: true,
      createdAt: now,
    };
  }

  if (mockExamScore >= 60) {
    const weeksNeeded = Math.ceil((80 - mockExamScore) / 10);
    return {
      id: `rec_after_mock_exam_progress_${Date.now()}`,
      userId,
      priority: RecommendationPriority.STRATEGIC,
      type: RecommendationType.MOCK_EXAM,
      title: `Good Progress - ${weeksNeeded} More Weeks of Focused Study`,
      description: `Your mock exam score is ${mockExamScore}%. You're on track, but need ${weeksNeeded} more weeks of focused study (${daysTillExam} days remaining). Focus on: ${weakDomains.slice(0, 3).join(', ')}.`,
      action: {
        type: 'start_activity',
        target: 'weak_area_focus',
        params: { targetDomains: weakDomains, weeksRemaining: weeksNeeded },
      },
      reasoning: `Moderate mock score (${mockExamScore}%), ${weeksNeeded} weeks to exam-ready`,
      confidence: 80,
      importance: 8,
      dismissible: true,
      createdAt: now,
    };
  }

  // Low score
  return {
    id: `rec_after_mock_exam_low_${Date.now()}`,
    userId,
    priority: RecommendationPriority.WARNING,
    type: RecommendationType.MOCK_EXAM,
    title: `Mock Exam Score ${mockExamScore}% - You Need More Time`,
    description: `Your mock exam score suggests you need 4-6 more weeks of study. You have ${daysTillExam} days till the real exam. Consider rescheduling if possible, or prepare for a challenging exam attempt.`,
    action: {
      type: 'show_modal',
      target: 'exam_strategy',
      params: { mockExamScore, daysTillExam, weaksAreas: weakDomains },
    },
    reasoning: `Low mock score (${mockExamScore}%), significant study time remaining`,
    confidence: 75,
    importance: 9,
    dismissible: true,
    createdAt: now,
  };
}

/**
 * Smart handoff: suggest activity based on time available
 *
 * @param userId User ID
 * @param minutesAvailable Minutes user has to study
 * @param objectiveInProgress Current objective, if any
 * @param nextWeakArea Next weak area, if any
 * @returns Recommendation for best activity given time constraint
 */
export function suggestActivityByTimeAvailable(
  userId: string,
  minutesAvailable: number,
  objectiveInProgress?: string,
  nextWeakArea?: string
): Recommendation | null {
  const now = new Date();

  if (minutesAvailable < 5) {
    return null; // Too little time
  }

  if (minutesAvailable < 15) {
    // 5-15 min: Quick refresh drill
    return {
      id: `rec_activity_short_${Date.now()}`,
      userId,
      priority: RecommendationPriority.MAINTENANCE,
      type: RecommendationType.REFRESH_DRILL,
      title: `You Have ${minutesAvailable} Minutes - Quick Refresh`,
      description: `Not much time? Do a 5-10 minute quick refresh drill to keep your knowledge fresh.`,
      action: {
        type: 'start_activity',
        target: 'refresh_drill',
        params: { maxDurationMinutes: minutesAvailable - 2 },
      },
      reasoning: `Time available: ${minutesAvailable} minutes, quick refresh drill optimal`,
      confidence: 85,
      importance: 4,
      dismissible: true,
      createdAt: now,
    };
  }

  if (minutesAvailable < 30) {
    // 15-30 min: Trap drill or quiz
    return {
      id: `rec_activity_medium_${Date.now()}`,
      userId,
      priority: RecommendationPriority.MAINTENANCE,
      type: RecommendationType.TRAP_DRILL,
      title: `You Have ${minutesAvailable} Minutes - Trap Drill`,
      description: `${minutesAvailable} minutes is perfect for a focused trap drill. Identify and master tricky patterns.`,
      action: {
        type: 'start_activity',
        target: 'trap_drill',
        params: { maxDurationMinutes: minutesAvailable - 2, focusObjective: objectiveInProgress },
      },
      reasoning: `Time available: ${minutesAvailable} minutes, trap drill optimal duration`,
      confidence: 82,
      importance: 5,
      dismissible: true,
      createdAt: now,
    };
  }

  // 30+ min: Full quiz or bank burn
  return {
    id: `rec_activity_long_${Date.now()}`,
    userId,
    priority: RecommendationPriority.STRATEGIC,
    type: RecommendationType.BANK_BURN,
    title: `You Have ${minutesAvailable} Minutes - Bank Burn Session`,
    description: `You have solid time available. A bank burn session (20-25 questions) will really deepen your mastery.`,
    action: {
      type: 'start_activity',
      target: 'bank_burn',
      params: {
        maxDurationMinutes: minutesAvailable - 5,
        targetObjective: nextWeakArea || objectiveInProgress,
      },
    },
    reasoning: `Time available: ${minutesAvailable} minutes, bank burn optimal for depth`,
    confidence: 85,
    importance: 6,
    dismissible: true,
    createdAt: now,
  };
}
