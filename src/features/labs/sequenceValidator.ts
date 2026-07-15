/**
 * Sequence Validator - Validates command execution order
 * Some configs require specific ordering (e.g., create VLAN before adding to trunk)
 */

export interface CommandSequenceStep {
  command: string; // Full command or pattern to match
  description?: string;
  optional?: boolean; // If true, missing is allowed
  isPattern?: boolean; // If true, use as regex pattern
}

export interface SequenceValidationResult {
  valid: boolean;
  executedCommands: string[];
  missingRequired: CommandSequenceStep[];
  outOfOrder: { command: string; expectedBefore: string }[];
  summary: string;
}

/**
 * Track command execution order
 * Returns a list of normalized commands in order
 */
export function trackCommandOrder(commands: string[]): string[] {
  return commands
    .filter((cmd) => Boolean(cmd && cmd.trim()))
    .map((cmd) => cmd.toLowerCase().trim());
}

/**
 * Validate that commands were executed in required order
 * Can handle both strict sequence and optional commands
 */
export function validateSequence(
  requiredSequence: CommandSequenceStep[],
  executedCommands: string[]
): SequenceValidationResult {
  const executed = trackCommandOrder(executedCommands);
  const missingRequired: CommandSequenceStep[] = [];
  const outOfOrder: { command: string; expectedBefore: string }[] = [];

  // Track position of required commands
  const requiredPositions: { step: CommandSequenceStep; index: number }[] = [];

  for (const requiredStep of requiredSequence) {
    if (requiredStep.optional) {
      continue; // Skip optional commands for now
    }

    let found = false;
    for (let i = 0; i < executed.length; i++) {
      if (commandMatches(executed[i], requiredStep)) {
        requiredPositions.push({
          step: requiredStep,
          index: i,
        });
        found = true;
        break;
      }
    }

    if (!found) {
      missingRequired.push(requiredStep);
    }
  }

  // Check if commands are in correct order
  for (let i = 0; i < requiredPositions.length - 1; i++) {
    const current = requiredPositions[i];
    const next = requiredPositions[i + 1];

    if (current.index > next.index) {
      outOfOrder.push({
        command: next.step.command,
        expectedBefore: current.step.command,
      });
    }
  }

  const valid = missingRequired.length === 0 && outOfOrder.length === 0;

  return {
    valid,
    executedCommands: executed,
    missingRequired,
    outOfOrder,
    summary: generateSequenceSummary(valid, missingRequired, outOfOrder),
  };
}

/**
 * Check if executed command matches a required step
 */
function commandMatches(executed: string, requiredStep: CommandSequenceStep): boolean {
  const normalized = executed.toLowerCase().trim();
  const required = requiredStep.command.toLowerCase().trim();

  if (requiredStep.isPattern) {
    try {
      const regex = new RegExp(requiredStep.command, 'i');
      return regex.test(normalized);
    } catch {
      return false;
    }
  }

  // Exact match
  if (normalized === required) {
    return true;
  }

  // Substring match (for show commands with filters)
  if (normalized.includes(required) || required.includes(normalized)) {
    return true;
  }

  // Abbreviation handling
  const expandedNorm = expandAbbreviations(normalized);
  const expandedReq = expandAbbreviations(required);
  if (expandedNorm === expandedReq) {
    return true;
  }

  // Check if either expanded version contains the other
  if (expandedNorm.includes(expandedReq) || expandedReq.includes(expandedNorm)) {
    return true;
  }

  return false;
}

/**
 * Simple abbreviation expansion for matching
 */
function expandAbbreviations(cmd: string): string {
  const abbreviations: Record<string, string> = {
    'conf t': 'configure terminal',
    'config t': 'configure terminal',
    'int': 'interface',
    'sh': 'show',
    'exit': 'exit',
    'no sh': 'no shutdown',
    'sw mo': 'switchport mode',
  };

  let expanded = cmd;
  for (const [abbr, full] of Object.entries(abbreviations)) {
    if (expanded === abbr) {
      expanded = full;
      break;
    }
  }

  return expanded;
}

/**
 * Generate human-readable summary of sequence validation
 */
function generateSequenceSummary(
  valid: boolean,
  missingRequired: CommandSequenceStep[],
  outOfOrder: { command: string; expectedBefore: string }[]
): string {
  if (valid) {
    return 'All commands executed in correct sequence';
  }

  const issues: string[] = [];

  if (missingRequired.length > 0) {
    issues.push(`Missing ${missingRequired.length} required command(s)`);
  }

  if (outOfOrder.length > 0) {
    issues.push(`${outOfOrder.length} command(s) out of order`);
  }

  return issues.join('; ');
}

/**
 * Common VLAN trunk configuration sequence
 */
export function getVlanTrunkSequence(): CommandSequenceStep[] {
  return [
    { command: 'configure terminal', description: 'Enter config mode' },
    { command: 'vlan \\d+', isPattern: true, description: 'Create VLAN' },
    { command: 'exit', description: 'Exit VLAN config', optional: true },
    { command: 'interface gi\\d/\\d', isPattern: true, description: 'Select interface' },
    { command: 'switchport mode trunk', description: 'Set to trunk mode' },
    { command: 'switchport trunk allowed vlan', description: 'Allow VLAN on trunk' },
    { command: 'no shutdown', description: 'Enable interface', optional: true },
    { command: 'exit', description: 'Exit interface config', optional: true },
    { command: 'show interfaces trunk', description: 'Verify trunk' },
  ];
}

/**
 * Common OSPF configuration sequence
 */
export function getOspfSequence(): CommandSequenceStep[] {
  return [
    { command: 'configure terminal', description: 'Enter config mode' },
    { command: 'router ospf \\d+', isPattern: true, description: 'Start OSPF process' },
    { command: 'network', description: 'Advertise networks' },
    { command: 'area', description: 'Specify area', optional: true },
    { command: 'exit', description: 'Exit router config', optional: true },
    { command: 'show ip ospf neighbor', description: 'Verify adjacency' },
  ];
}

/**
 * Common NAT configuration sequence
 */
export function getNatSequence(): CommandSequenceStep[] {
  return [
    { command: 'configure terminal', description: 'Enter config mode' },
    { command: 'interface gi\\d/\\d', isPattern: true, description: 'Select inside interface' },
    { command: 'ip nat inside', description: 'Mark as inside' },
    { command: 'exit', description: 'Exit interface config', optional: true },
    { command: 'interface gi\\d/\\d', isPattern: true, description: 'Select outside interface' },
    { command: 'ip nat outside', description: 'Mark as outside' },
    { command: 'exit', description: 'Exit interface config', optional: true },
    { command: 'ip nat inside source', description: 'Configure NAT rule' },
    { command: 'access-list', description: 'Create ACL for inside traffic' },
  ];
}

/**
 * Check for common ordering mistakes
 */
export function detectCommonMistakes(
  executedCommands: string[]
): { mistake: string; description: string }[] {
  const executed = trackCommandOrder(executedCommands);
  const mistakes: { mistake: string; description: string }[] = [];

  // Mistake 1: shutdown before ip address
  const shutdownIdx = executed.findIndex((cmd) => cmd.includes('shutdown'));
  const ipIdx = executed.findIndex((cmd) => cmd.includes('ip address') || cmd.includes('ip addr'));
  if (shutdownIdx !== -1 && ipIdx !== -1 && shutdownIdx < ipIdx) {
    mistakes.push({
      mistake: 'Shutdown configured before IP address',
      description: 'Configure IP address before disabling interface',
    });
  }

  // Mistake 2: no shutdown in wrong context (not in interface config)
  const noShutIdx = executed.findIndex((cmd) => cmd.includes('no shutdown'));
  const intIdx = executed.findIndex((cmd) => cmd.includes('interface'));
  if (noShutIdx !== -1 && intIdx !== -1 && noShutIdx < intIdx) {
    mistakes.push({
      mistake: 'No shutdown before interface selection',
      description: 'Select interface before executing "no shutdown"',
    });
  }

  // Mistake 3: vlan config after exiting config mode
  const exitAllIdx = executed.findIndex((cmd) => cmd === 'exit' || cmd === 'end');
  const vlanIdx = executed.findIndex((cmd) => cmd.match(/^vlan \d+/));
  if (exitAllIdx !== -1 && vlanIdx !== -1 && exitAllIdx < vlanIdx) {
    mistakes.push({
      mistake: 'VLAN configured after exiting config mode',
      description: 'Enter configure terminal before VLAN commands',
    });
  }

  // Mistake 4: show commands in config mode
  const confIdx = executed.findIndex((cmd) => cmd === 'configure terminal');
  const showIdx = executed.findIndex((cmd) => cmd.startsWith('show'));
  if (confIdx !== -1 && showIdx !== -1 && confIdx < showIdx) {
    const configEndIdx = executed.findIndex(
      (cmd, i) => i > confIdx && (cmd === 'exit' || cmd === 'end')
    );
    if (configEndIdx === -1 || configEndIdx > showIdx) {
      mistakes.push({
        mistake: 'Show command executed in config mode',
        description: 'Exit config mode (exit or end) before running show commands',
      });
    }
  }

  // Mistake 5: ACL before access-list number
  const aclIdx = executed.findIndex((cmd) => cmd.includes('access-list'));
  const aclNoIdx = executed.findIndex((cmd) => cmd.match(/access-list \d+/));
  if (aclIdx !== -1 && aclNoIdx === -1) {
    mistakes.push({
      mistake: 'Access-list configured without number',
      description: 'Use format: access-list <number> permit/deny <subnet>',
    });
  }

  return mistakes;
}

/**
 * Analyze command timing to detect suspicious patterns
 */
export interface CommandTiming {
  command: string;
  timeMs: number;
  interval: number; // time since previous command
}

export function analyzeCommandTiming(
  commands: string[],
  timestamps: number[]
): { suspicious: boolean; reason: string; avgInterval: number } {
  if (commands.length !== timestamps.length || commands.length < 2) {
    return {
      suspicious: false,
      reason: 'Insufficient data for timing analysis',
      avgInterval: 0,
    };
  }

  const intervals: number[] = [];
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i - 1]);
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const minInterval = Math.min(...intervals);

  // Suspicious if average interval < 1 second (100ms) or min < 50ms
  if (avgInterval < 1000 || minInterval < 100) {
    return {
      suspicious: true,
      reason: `Suspiciously fast command execution: ${avgInterval.toFixed(0)}ms average`,
      avgInterval,
    };
  }

  // Suspicious if all intervals exactly the same (too uniform)
  const maxInterval = Math.max(...intervals);
  if (maxInterval - minInterval < 100) {
    return {
      suspicious: true,
      reason: 'Commands executed at perfect intervals (possible automation)',
      avgInterval,
    };
  }

  return {
    suspicious: false,
    reason: 'Command timing appears normal',
    avgInterval,
  };
}
