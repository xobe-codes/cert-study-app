/**
 * Contextual Feedback System (Phase 3)
 *
 * Provides intelligent, context-aware error messages and guidance
 * Every error includes:
 * - WHY it happened (root cause)
 * - HOW to fix it (step-by-step commands)
 * - WHAT they misunderstood (common misconception)
 */

import { Mistake } from './mistakeDetector';
import { AdvancedMistake } from './advancedMistakes';

export interface LabContext {
  labId: string;
  labName: string;
  currentStep: number;
  totalSteps: number;
  labDifficulty: 'easy' | 'medium' | 'hard';
  userExperienceLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface EnhancedFeedback {
  isError: boolean;
  severity: 'info' | 'warning' | 'critical';
  mainMessage: string;
  explanation: string; // The "why"
  solution: string; // The "how"
  commonMisconception?: string;
  relatedConcept?: string;
  suggestedReading?: string;
  nextStep?: string;
}

/**
 * Enhance a basic mistake with contextual information
 */
export function enhanceBasicMistakeMessage(
  mistake: Mistake,
  context: LabContext
): EnhancedFeedback {
  const explanation = getExplanationForMistake(mistake);
  const solution = getSolutionForMistake(mistake, context);
  const misconception = getMisconceptionForMistake(mistake);

  return {
    isError: mistake.severity !== 'info',
    severity: mistake.severity as any,
    mainMessage: mistake.title,
    explanation,
    solution,
    commonMisconception: misconception,
    relatedConcept: getRelatedConcept(mistake),
    suggestedReading: getSuggestedReading(mistake),
    nextStep: getNextStep(mistake, context),
  };
}

/**
 * Enhance advanced mistake with contextual information
 */
export function enhanceAdvancedMistakeMessage(
  mistake: AdvancedMistake,
  context: LabContext
): EnhancedFeedback {
  return {
    isError: mistake.severity !== 'medium',
    severity: mistake.severity as any,
    mainMessage: mistake.title,
    explanation: mistake.whyItHappens,
    solution: mistake.suggestedFix,
    commonMisconception: mistake.commonMisconception,
    relatedConcept: mistake.type,
    suggestedReading: `Chapter 3: ${capitalize(mistake.type.replace(/_/g, ' '))}`,
    nextStep: getNextStepForAdvanced(mistake, context),
  };
}

/**
 * Get explanation for why a basic mistake occurred
 */
function getExplanationForMistake(mistake: Mistake): string {
  const explanations: Record<string, string> = {
    interface_shutdown: 'Cisco devices ship with all interfaces in shutdown state by default for safety. After configuring an interface, you must explicitly enable it with "no shutdown".',
    config_mode_stuck: 'Show commands only work from user mode (>) or enable mode (#), not from configuration mode. Configuration mode (config)# is for entering settings, not viewing output.',
    wrong_interface: 'The lab requires a specific interface. Using the wrong interface means your configuration is on the wrong port and won\'t achieve the lab goal.',
    bad_subnet: 'OSPF network statements and ACLs use exact subnet matching. If you type the wrong subnet, that part of your network won\'t be included.',
    sequence_violation: 'CLI configuration sometimes requires specific ordering. Setting up in the wrong order can cause configuration to fail or be ignored.',
    incomplete_command: 'This command is incomplete and Cisco CLI is waiting for more arguments. The device won\'t process partial commands.',
    case_sensitivity_issue: 'While Cisco commands are usually case-insensitive, certain values (like variable names) might not be.',
    vlan_not_created: 'VLAN doesn\'t exist. You must create the VLAN globally before you can reference it on a trunk.',
    missing_no_shutdown: 'After configuring an interface, it\'s still shutdown. The "no shutdown" command is required to activate the interface.',
    wrong_mode: 'Different configuration modes (global, interface, router) have different available commands. You\'re in the wrong mode for this command.',
    abbreviated_wrong: 'This abbreviation isn\'t recognized by Cisco IOS. Some abbreviations work, some don\'t—if unsure, use the full command.',
    mask_format_wrong: 'Cisco IOS uses dotted-decimal subnet mask format (255.255.255.0), not CIDR notation (/24). Convert before entering.',
  };

  return explanations[mistake.type] || mistake.explanation;
}

/**
 * Get step-by-step solution for a mistake
 */
function getSolutionForMistake(mistake: Mistake, context: LabContext): string {
  // For beginners, provide more detailed steps
  const isBeginnerContext = context.userExperienceLevel === 'beginner';

  let solution = mistake.suggestedFix;

  if (isBeginnerContext) {
    solution = `Follow these steps:

${solution}

After typing these commands:
1. Press Enter after each line
2. Type "exit" or "end" to leave config mode
3. Verify with the appropriate "show" command`;
  }

  return solution;
}

/**
 * Get the common misconception related to a mistake
 */
function getMisconceptionForMistake(mistake: Mistake): string {
  const misconceptions: Record<string, string> = {
    config_mode_stuck: 'Misconception: "I can run any command from any mode." Reality: Show commands are view-only and only work from user/enable mode.',
    interface_shutdown: 'Misconception: "After configuring, the interface should work." Reality: Configuration without "no shutdown" leaves the interface disabled.',
    sequence_violation: 'Misconception: "Order doesn\'t matter—I can configure in any order." Reality: Some steps have dependencies (e.g., create VLAN before adding to trunk).',
    wrong_interface: 'Misconception: "All interfaces are basically the same." Reality: Different interfaces have different roles—using the wrong one defeats the lab goal.',
    bad_subnet: 'Misconception: "Any subnet in that range should work." Reality: OSPF and ACL subnets must be exact matches.',
    incomplete_command: 'Misconception: "Cisco should figure out what I mean." Reality: Commands are strict about required arguments.',
    abbreviated_wrong: 'Misconception: "Abbreviations always work in Cisco." Reality: Only standard abbreviations are recognized.',
  };

  return misconceptions[mistake.type] || '';
}

/**
 * Get related networking concept for context
 */
function getRelatedConcept(mistake: Mistake): string {
  const concepts: Record<string, string> = {
    interface_shutdown: 'Interface States & Enabling',
    config_mode_stuck: 'CLI Mode Navigation',
    wrong_interface: 'Interface Naming & Numbering',
    bad_subnet: 'Subnetting & Network Masks',
    sequence_violation: 'Configuration Ordering & Dependencies',
    missing_no_shutdown: 'Interface Administration',
    wrong_mode: 'CLI Hierarchies',
    vlan_not_created: 'VLAN Management',
  };

  return concepts[mistake.type] || 'Cisco CLI Fundamentals';
}

/**
 * Get suggested reading/reference
 */
function getSuggestedReading(mistake: Mistake): string {
  const readings: Record<string, string> = {
    interface_shutdown: 'CCNA Guide Chapter 2: Interface Configuration',
    config_mode_stuck: 'CCNA Guide Chapter 1: CLI Fundamentals',
    wrong_interface: 'CCNA Guide Chapter 1: Interface Notation & Numbering',
    bad_subnet: 'CCNA Guide Chapter 4: IP Addressing & Subnetting',
    sequence_violation: 'CCNA Guide Chapter 2: Configuration Order',
    vlan_not_created: 'CCNA Guide Chapter 5: VLANs',
    missing_no_shutdown: 'CCNA Guide Chapter 2: Interface Enable/Disable',
  };

  return readings[mistake.type] || 'CCNA Study Guide';
}

/**
 * Get next step after fixing a mistake
 */
function getNextStep(mistake: Mistake, context: LabContext): string {
  if (context.currentStep >= context.totalSteps) {
    return 'You\'ve completed all steps! Run "show" commands to verify your configuration.';
  }

  const stepSuggestions: Record<string, string> = {
    interface_shutdown: `After enabling the interface, move to step ${context.currentStep + 1}: Verify the interface is active with "show interfaces brief"`,
    config_mode_stuck: `Exit config mode first, then proceed to step ${context.currentStep + 1}`,
    missing_no_shutdown: `After enabling, verify with "show interfaces" then move to step ${context.currentStep + 1}`,
  };

  return stepSuggestions[mistake.type] || `Proceed to step ${context.currentStep + 1}`;
}

/**
 * Get next step for advanced mistakes
 */
function getNextStepForAdvanced(mistake: AdvancedMistake, context: LabContext): string {
  return `After fixing this issue, verify the solution with the appropriate "show" command and move to step ${context.currentStep + 1}`;
}

/**
 * Format feedback for display to user
 */
export function formatFeedbackForDisplay(feedback: EnhancedFeedback): string {
  let output = '';

  // Main message (bold in most UIs)
  output += `${feedback.mainMessage}\n\n`;

  // Explanation
  output += `Why: ${feedback.explanation}\n\n`;

  // Solution
  output += `Fix:\n${feedback.solution}\n`;

  // Common misconception (if present)
  if (feedback.commonMisconception) {
    output += `\nCommon Misconception:\n${feedback.commonMisconception}\n`;
  }

  // Related concept
  if (feedback.relatedConcept) {
    output += `\nLearn more: ${feedback.relatedConcept}\n`;
  }

  // Next step
  if (feedback.nextStep) {
    output += `\nNext: ${feedback.nextStep}\n`;
  }

  return output;
}

/**
 * Get briefformat feedback (for quick display)
 */
export function getBriefFeedback(feedback: EnhancedFeedback): {
  title: string;
  mainPoint: string;
  quickFix: string;
} {
  // Extract first line of solution for quick fix
  const quickFix = feedback.solution.split('\n')[0];

  return {
    title: feedback.mainMessage,
    mainPoint: feedback.explanation,
    quickFix,
  };
}

/**
 * Aggregate multiple errors into cohesive feedback
 */
export function aggregateMultipleErrors(
  mistakes: (Mistake | AdvancedMistake)[],
  context: LabContext
): EnhancedFeedback[] {
  const feedbacks: EnhancedFeedback[] = [];

  for (const mistake of mistakes) {
    if ('problemDescription' in mistake) {
      // It's an AdvancedMistake
      feedbacks.push(enhanceAdvancedMistakeMessage(mistake as AdvancedMistake, context));
    } else {
      // It's a Mistake
      feedbacks.push(enhanceBasicMistakeMessage(mistake as Mistake, context));
    }
  }

  // Sort by severity
  return feedbacks.sort((a, b) => {
    const severityMap = { critical: 3, warning: 2, info: 1, high: 3, medium: 2 };
    return (severityMap[b.severity as any] || 0) - (severityMap[a.severity as any] || 0);
  });
}

/**
 * Generate adaptive feedback based on error pattern
 */
export function generateAdaptiveFeedback(
  mistakes: (Mistake | AdvancedMistake)[],
  context: LabContext,
  attemptNumber: number
): string {
  // On first attempt, be more gentle
  if (attemptNumber === 1) {
    return 'Take your time understanding the error. This is a learning moment!';
  }

  // On second attempt, be more direct
  if (attemptNumber === 2) {
    return 'Let\'s try to fix this systematically. Review the suggested steps.';
  }

  // On third+ attempt, offer extra help
  if (attemptNumber >= 3) {
    return `You\'ve tried ${attemptNumber} times. Consider reviewing the related concepts in the study guide, or ask for a hint.`;
  }

  return '';
}

/**
 * Helper function to capitalize words
 */
function capitalize(str: string): string {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Create a feedback session tracker
 */
export interface FeedbackSession {
  labId: string;
  startTime: Date;
  mistakes: Array<{
    type: string;
    count: number;
    lastOccurrence: Date;
  }>;
  totalAttempts: number;
  mistakesFixed: string[];
}

/**
 * Track feedback for analytics
 */
export function trackFeedbackSession(session: FeedbackSession, mistakeType: string): FeedbackSession {
  const existing = session.mistakes.find((m) => m.type === mistakeType);

  if (existing) {
    existing.count++;
    existing.lastOccurrence = new Date();
  } else {
    session.mistakes.push({
      type: mistakeType,
      count: 1,
      lastOccurrence: new Date(),
    });
  }

  return session;
}

/**
 * Get learning insights from feedback session
 */
export function getLearningInsights(session: FeedbackSession): {
  topMistakes: Array<{ type: string; count: number }>;
  mostCommonConcept: string;
  recommendedFocus: string;
} {
  const topMistakes = session.mistakes
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const mostCommonConcept = topMistakes[0]?.type || 'unknown';

  const recommendations: Record<string, string> = {
    interface_shutdown: 'Review interface state commands (show interfaces)',
    config_mode_stuck: 'Practice navigating between CLI modes',
    wrong_interface: 'Study interface naming conventions',
    bad_subnet: 'Review subnetting and CIDR notation',
  };

  const recommendedFocus = recommendations[mostCommonConcept] || 'Review CLI fundamentals';

  return {
    topMistakes,
    mostCommonConcept,
    recommendedFocus,
  };
}
