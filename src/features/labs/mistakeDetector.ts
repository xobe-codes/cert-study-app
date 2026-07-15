/**
 * Common Mistake Detection for Labs (Phase 1B)
 *
 * Detects 10+ common mistakes in CLI commands and device configuration
 * Provides actionable feedback to help users learn and correct
 * Tracks mistake patterns to identify knowledge gaps
 */

export enum MistakeType {
  INTERFACE_SHUTDOWN = 'interface_shutdown',
  CONFIG_MODE_STUCK = 'config_mode_stuck',
  WRONG_INTERFACE = 'wrong_interface',
  BAD_SUBNET = 'bad_subnet',
  SEQUENCE_VIOLATION = 'sequence_violation',
  INCOMPLETE_COMMAND = 'incomplete_command',
  CASE_SENSITIVITY_ISSUE = 'case_sensitivity_issue',
  VLAN_NOT_CREATED = 'vlan_not_created',
  MISSING_NO_SHUTDOWN = 'missing_no_shutdown',
  WRONG_MODE = 'wrong_mode',
  ABBREVIATED_WRONG = 'abbreviated_wrong',
  MASK_FORMAT_WRONG = 'mask_format_wrong',
}

export interface Mistake {
  type: MistakeType;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  explanation: string;
  userAction: string;
  suggestedFix: string;
  learnMore?: string;
}

export interface DetectionContext {
  currentMode?: 'user' | 'config' | 'interface' | 'router' | 'acl'; // Current CLI mode
  commandTyped: string;
  previousCommands?: string[];
  deviceState?: Record<string, any>;
  requiredInterface?: string;
  requiredSubnet?: string;
}

/**
 * Normalize interface name for matching
 */
function normalizeInterfaceName(ifaceName: string): string {
  return ifaceName
    .toLowerCase()
    .replace(/gigabitethernet/g, 'gi')
    .replace(/fastethernet/g, 'fa')
    .replace(/ethernet/g, 'e');
}

/**
 * Detect if interface is shutdown when it shouldn't be
 */
export function detectInterfaceShutdown(
  output: string,
  interfaceName: string
): Mistake | null {
  // Normalize both the interface name and output for matching
  const normalizedName = normalizeInterfaceName(interfaceName);
  const normalizedOutput = normalizeInterfaceName(output);
  
  // Check if shutdown appears with the interface (in any form)
  if (normalizedOutput.includes(normalizedName) && normalizedOutput.toLowerCase().includes('shutdown')) {
    return {
      type: MistakeType.INTERFACE_SHUTDOWN,
      severity: 'critical',
      title: `Interface ${interfaceName} is shutdown`,
      explanation: 'The interface exists but is disabled. You must enable it.',
      userAction: 'Go back to interface config and use "no shutdown"',
      suggestedFix: `
interface ${interfaceName}
no shutdown
exit
`,
      learnMore: 'Cisco devices ship with all interfaces shutdown by default for safety.',
    };
  }

  return null;
}

/**
 * Detect if user is stuck in config mode when trying to run show command
 */
export function detectConfigModeStuck(
  context: DetectionContext
): Mistake | null {
  if (context.currentMode !== 'config') return null;

  const showCommands = ['show', 'display', 'ping', 'traceroute', 'telnet'];
  const isShowCommand = showCommands.some((cmd) =>
    context.commandTyped.toLowerCase().startsWith(cmd)
  );

  if (isShowCommand) {
    return {
      type: MistakeType.CONFIG_MODE_STUCK,
      severity: 'warning',
      title: 'Still in config mode',
      explanation:
        'Show commands only work from user/enable mode, not from configuration mode.',
      userAction: 'Exit config mode first',
      suggestedFix: `
exit
${context.commandTyped}
`,
      learnMore: 'Use "exit" or "end" to leave config mode. "end" goes directly to enable mode.',
    };
  }

  return null;
}

/**
 * Detect if user typed wrong interface
 */
export function detectWrongInterface(
  context: DetectionContext
): Mistake | null {
  if (!context.requiredInterface) return null;

  const required = context.requiredInterface.toLowerCase();
  const typed = context.commandTyped.toLowerCase();

  // Extract interface from command (e.g., "interface Gi0/1" → "gi0/1")
  const interfaceMatch = typed.match(/interface\s+(\S+)/);
  if (!interfaceMatch) return null;

  const typedInterface = interfaceMatch[1].toLowerCase();

  // Normalize comparison (Gi0/1 vs gigabitethernet0/1)
  const normalizedRequired = normalizeInterfaceName(required);
  const normalizedTyped = normalizeInterfaceName(typedInterface);

  if (normalizedRequired !== normalizedTyped) {
    return {
      type: MistakeType.WRONG_INTERFACE,
      severity: 'critical',
      title: `Wrong interface: typed ${typedInterface}, should be ${context.requiredInterface}`,
      explanation: `This lab uses ${context.requiredInterface}. You typed ${typedInterface}.`,
      userAction: 'Exit back to config mode and go to the correct interface',
      suggestedFix: `
exit
interface ${context.requiredInterface}
(continue configuration)
`,
      learnMore: 'Double-check the lab requirements before configuring.',
    };
  }

  return null;
}

/**
 * Detect if subnet/ACL subnet is wrong
 */
export function detectBadSubnet(context: DetectionContext): Mistake | null {
  if (!context.requiredSubnet) return null;

  const subnetMatch = context.commandTyped.match(/(\d+\.\d+\.\d+\.\d+)\s+(\d+\.\d+\.\d+\.\d+)/);
  if (!subnetMatch) return null;

  const [, typedSubnet, typedMask] = subnetMatch;

  if (typedSubnet !== context.requiredSubnet) {
    return {
      type: MistakeType.BAD_SUBNET,
      severity: 'critical',
      title: `Wrong subnet: typed ${typedSubnet}, should be ${context.requiredSubnet}`,
      explanation: `You typed subnet ${typedSubnet} but this lab requires ${context.requiredSubnet}.`,
      userAction: 'Correct the network statement or ACL to use the right subnet',
      suggestedFix: `
(Your current command): ${context.commandTyped}
(Should be): ${context.commandTyped.replace(typedSubnet, context.requiredSubnet)}
`,
      learnMore: 'Network statements and ACLs are strict about subnet addresses.',
    };
  }

  return null;
}

/**
 * Detect if commands are out of sequence
 */
export function detectSequenceViolation(
  context: DetectionContext
): Mistake | null {
  if (!context.previousCommands || context.previousCommands.length === 0) return null;

  const prevCmds = context.previousCommands.map((c) => c.toLowerCase());

  // Check for attempting to enable interface before setting IP
  if (
    context.commandTyped.toLowerCase().includes('no shutdown') &&
    !prevCmds.some((c) => c.includes('ip address'))
  ) {
    return {
      type: MistakeType.SEQUENCE_VIOLATION,
      severity: 'warning',
      title: 'Wrong order: enabling interface before setting IP',
      explanation:
        'You should set the IP address BEFORE running "no shutdown". Order matters.',
      userAction: 'Undo this step, set IP address first, then enable with "no shutdown"',
      suggestedFix: `
(Correct order):
1. ip address 10.0.0.1 255.255.255.0
2. no shutdown
`,
      learnMore: 'Some configurations require specific ordering. Always configure then enable.',
    };
  }

  // Check for VLAN on trunk before VLAN created
  if (
    context.commandTyped.toLowerCase().includes('switchport trunk allowed vlan') &&
    !prevCmds.some((c) => c.includes('vlan '))
  ) {
    return {
      type: MistakeType.SEQUENCE_VIOLATION,
      severity: 'critical',
      title: "Can't add VLAN to trunk before creating VLAN",
      explanation: 'The VLAN must exist before you can allow it on a trunk.',
      userAction: 'Go back and create the VLAN first, then configure the trunk',
      suggestedFix: `
(First):
configure terminal
vlan 10
exit

(Then):
interface Gi0/1
switchport trunk allowed vlan 10
`,
      learnMore: 'Always create network objects before referencing them in config.',
    };
  }

  return null;
}

/**
 * Detect incomplete commands
 */
export function detectIncompleteCommand(context: DetectionContext): Mistake | null {
  const cmd = context.commandTyped.toLowerCase().trim();

  // Commands that need arguments
  const needsArgument: Record<string, string> = {
    'interface ': 'interface name (e.g., Gi0/1)',
    'vlan ': 'VLAN ID (e.g., 10)',
    'ip address ': 'IP and subnet mask (e.g., 10.0.0.1 255.255.255.0)',
    'router ospf ': 'process ID (e.g., 1)',
    'network ': 'network and wildcard (e.g., 10.0.0.0 0.0.0.255 area 0)',
  };

  for (const [prefix, requirement] of Object.entries(needsArgument)) {
    if (cmd === prefix.trim()) {
      return {
        type: MistakeType.INCOMPLETE_COMMAND,
        severity: 'warning',
        title: `Incomplete command: ${prefix.trim()}`,
        explanation: `The command "${prefix.trim()}" requires an argument: ${requirement}`,
        userAction: 'Complete the command with the required argument',
        suggestedFix: `${prefix}${requirement}`,
        learnMore: `Context: ${requirement}`,
      };
    }
  }

  return null;
}

/**
 * Detect if using abbreviation incorrectly
 */
export function detectAbbreviatedWrong(context: DetectionContext): Mistake | null {
  const cmd = context.commandTyped.toLowerCase();

  // Some abbreviations are valid, some are not
  const validAbbreviations = ['conf t', 'config t', 'int', 'no shut', 'ex'];
  const invalidAbbreviations: Record<string, string> = {
    'sh ip r': 'Use "show ip route" (not abbreviated)',
    'show v': 'Use "show vlan brief" (more complete)',
  };

  for (const [invalid, correct] of Object.entries(invalidAbbreviations)) {
    if (cmd.includes(invalid)) {
      return {
        type: MistakeType.ABBREVIATED_WRONG,
        severity: 'info',
        title: `Abbreviation won't work: ${invalid}`,
        explanation: `Cisco CLI doesn't recognize "${invalid}". Use the full or standard abbreviation.`,
        userAction: 'Type the correct command',
        suggestedFix: correct,
        learnMore: 'Some abbreviations work, some don\'t. When in doubt, use the full command.',
      };
    }
  }

  return null;
}

/**
 * Detect subnet mask format issues
 */
export function detectMaskFormatWrong(context: DetectionContext): Mistake | null {
  const cmd = context.commandTyped.toLowerCase();

  // Check for /24 format when it should be dotted decimal
  if (cmd.includes('ip address') && cmd.includes('/')) {
    return {
      type: MistakeType.MASK_FORMAT_WRONG,
      severity: 'warning',
      title: 'Use dotted-decimal mask, not CIDR',
      explanation:
        'Cisco IOS uses dotted-decimal format (255.255.255.0), not CIDR notation (/24).',
      userAction: 'Convert the CIDR notation to dotted-decimal format',
      suggestedFix: `
/24 = 255.255.255.0
/16 = 255.255.0.0
/8  = 255.0.0.0
(Use full format: ip address 10.0.0.1 255.255.255.0)
`,
      learnMore: 'Some network tools use CIDR; IOS uses dotted-decimal for traditional configs.',
    };
  }

  return null;
}

/**
 * Main detection function - run all detectors
 */
export function detectMistakes(context: DetectionContext): Mistake[] {
  const mistakes: Mistake[] = [];

  const detectors = [
    () => detectConfigModeStuck(context),
    () => detectWrongInterface(context),
    () => detectBadSubnet(context),
    () => detectSequenceViolation(context),
    () => detectIncompleteCommand(context),
    () => detectAbbreviatedWrong(context),
    () => detectMaskFormatWrong(context),
  ];

  for (const detector of detectors) {
    const mistake = detector();
    if (mistake) {
      mistakes.push(mistake);
    }
  }

  return mistakes;
}

/**
 * Get formatted feedback for a mistake
 */
export function getMistakeFeedback(mistake: Mistake): {
  title: string;
  explanation: string;
  fix: string;
  severity: string;
} {
  return {
    title: mistake.title,
    explanation: mistake.explanation,
    fix: mistake.suggestedFix,
    severity: mistake.severity,
  };
}

/**
 * Track mistake for analytics
 */
export interface MistakeRecord {
  userId: string;
  labId: string;
  checkpointId: string;
  mistakeType: MistakeType;
  timestamp: Date;
  corrected: boolean; // Did they fix it after feedback?
  attemptNumber: number;
}

/**
 * Get most common mistakes for a lab
 */
export function getMostCommonMistakes(
  records: MistakeRecord[],
  limit: number = 5
): Array<{
  type: MistakeType;
  count: number;
  correctionRate: number;
}> {
  const mistakeCounts = new Map<MistakeType, { count: number; corrected: number }>();

  for (const record of records) {
    if (!mistakeCounts.has(record.mistakeType)) {
      mistakeCounts.set(record.mistakeType, { count: 0, corrected: 0 });
    }
    const counts = mistakeCounts.get(record.mistakeType)!;
    counts.count++;
    if (record.corrected) counts.corrected++;
  }

  return Array.from(mistakeCounts.entries())
    .map(([type, { count, corrected }]) => ({
      type,
      count,
      correctionRate: count > 0 ? corrected / count : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Identify knowledge gap from mistakes
 */
export function identifyKnowledgeGap(
  records: MistakeRecord[]
): {
  topGap: MistakeType | null;
  gaps: MistakeType[];
  recommendation: string;
} {
  const commonMistakes = getMostCommonMistakes(records, 10);

  if (commonMistakes.length === 0) {
    return {
      topGap: null,
      gaps: [],
      recommendation: 'No knowledge gaps detected.',
    };
  }

  const topGap = commonMistakes[0].type;
  const gaps = commonMistakes.map((m) => m.type);

  let recommendation = '';
  switch (topGap) {
    case MistakeType.CONFIG_MODE_STUCK:
      recommendation = 'Review CLI navigation (user mode, config mode, enable mode)';
      break;
    case MistakeType.SEQUENCE_VIOLATION:
      recommendation = 'Review the correct order for configuration steps';
      break;
    case MistakeType.MISSING_NO_SHUTDOWN:
      recommendation = 'Remember: after configuring, enable with "no shutdown"';
      break;
    case MistakeType.WRONG_INTERFACE:
      recommendation = 'Double-check interface names in lab requirements';
      break;
    case MistakeType.BAD_SUBNET:
      recommendation = 'Review subnet addressing and network statements';
      break;
  }

  return {
    topGap,
    gaps,
    recommendation,
  };
}
