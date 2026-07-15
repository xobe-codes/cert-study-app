/**
 * State Validator - Detects changes between before/after CLI outputs
 * Enables validation that configuration actually changed something
 */

export interface StateChange {
  type: 'added' | 'removed' | 'modified';
  category: string; // 'vlan', 'interface', 'route', 'neighbor', etc.
  details: string;
}

export interface StateComparisonResult {
  changed: boolean;
  changes: StateChange[];
  expectedMissing: string[];
  validationPassed: boolean;
  summary: string;
}

/**
 * Extract key elements from a show command output
 * Returns normalized set of relevant lines for comparison
 */
function extractOutputElements(output: string): Set<string> {
  if (!output) return new Set();

  const elements = new Set<string>();

  // Split by lines and filter out noise
  const lines = output
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      // Skip empty lines, dashes, headers
      if (!line) return false;
      if (line.match(/^-+$/)) return false;
      if (line.match(/^[a-zA-Z\s]+$/)) return false; // likely header
      return true;
    });

  lines.forEach((line) => {
    // Normalize whitespace within lines
    const normalized = line.replace(/\s+/g, ' ');
    elements.add(normalized);
  });

  return elements;
}

/**
 * Compare before/after outputs and identify what changed
 * Matches against expected changes to validate configuration worked
 */
export function compareStates(
  beforeOutput: string,
  afterOutput: string,
  expectedChanges: string[]
): StateComparisonResult {
  const before = extractOutputElements(beforeOutput);
  const after = extractOutputElements(afterOutput);

  const changes: StateChange[] = [];
  const addedLines = new Set<string>();
  const removedLines = new Set<string>();

  // Detect added lines
  after.forEach((line) => {
    if (!before.has(line)) {
      addedLines.add(line);
    }
  });

  // Detect removed lines
  before.forEach((line) => {
    if (!after.has(line)) {
      removedLines.add(line);
    }
  });

  // Categorize changes
  addedLines.forEach((line) => {
    const change = categorizeChange(line, 'added');
    if (change) changes.push(change);
  });

  removedLines.forEach((line) => {
    const change = categorizeChange(line, 'removed');
    if (change) changes.push(change);
  });

  // Validate expected changes occurred
  const expectedMissing = validateExpectedChanges(changes, expectedChanges);
  const validationPassed = expectedMissing.length === 0;

  return {
    changed: changes.length > 0,
    changes,
    expectedMissing,
    validationPassed,
    summary: generateSummary(changes, validationPassed),
  };
}

/**
 * Categorize a line of output as a specific change
 */
function categorizeChange(line: string, type: 'added' | 'removed'): StateChange | null {
  // VLAN detection (match lines starting with VLAN number, with optional status/ports)
  // Example: "10 Data active Gi0/1" or "10 Data active Ports..."
  const vlanMatch = line.match(/^(\d{1,4})\s+([a-zA-Z0-9\-_]+)(\s+\w+)?/);
  if (vlanMatch && parseInt(vlanMatch[1]) <= 4095) {
    // Valid VLAN ID range is 1-4095
    return {
      type,
      category: 'vlan',
      details: `VLAN ${vlanMatch[1]} (${vlanMatch[2]})`,
    };
  }

  // Interface status detection
  if (/^\s*(Gi|Fa|Eth|Loopback|Vlan|Port-channel)[\d/]+\s+(is|administratively)/.test(line)) {
    const ifaceMatch = line.match(/^(\s*\S+)\s+/);
    if (ifaceMatch) {
      const status = line.includes('up') ? 'up' : 'down';
      return {
        type,
        category: 'interface',
        details: `${ifaceMatch[1]} is ${status}`,
      };
    }
  }

  // IP address configuration
  if (/Internet address is|ip address/.test(line)) {
    return {
      type,
      category: 'ip_config',
      details: line,
    };
  }

  // OSPF neighbor detection
  if (/\d+\s+\d+\.\d+\.\d+\.\d+\s+(FULL|EXSTART|LOADING|TWO_WAY|INIT)/.test(line)) {
    return {
      type,
      category: 'ospf_neighbor',
      details: line,
    };
  }

  // Route detection
  if (/^[OCS]\s+\d+\.\d+\.\d+\.\d+\/\d+/.test(line)) {
    const routeMatch = line.match(/^([OCS])\s+([\d.\/]+)/);
    if (routeMatch) {
      const protocols: Record<string, string> = {
        O: 'OSPF',
        C: 'Connected',
        S: 'Static',
      };
      return {
        type,
        category: 'route',
        details: `${protocols[routeMatch[1]]} route ${routeMatch[2]}`,
      };
    }
  }

  // NAT translation detection
  if (/Pro\s+Inside\s+global|tcp|udp/.test(line)) {
    return {
      type,
      category: 'nat_translation',
      details: line,
    };
  }

  // Access list detection
  if (/^(permit|deny)\s+/.test(line)) {
    return {
      type,
      category: 'acl_rule',
      details: line,
    };
  }

  // Port security detection
  if (/Port Security|Maximum MAC Addresses/.test(line)) {
    return {
      type,
      category: 'port_security',
      details: line,
    };
  }

  // Generic line if we can't categorize but it looks important
  if (line.length > 10) {
    return {
      type,
      category: 'other',
      details: line,
    };
  }

  return null;
}

/**
 * Check if expected changes actually occurred
 */
function validateExpectedChanges(
  actualChanges: StateChange[],
  expectedChanges: string[]
): string[] {
  if (expectedChanges.length === 0) {
    return [];
  }

  const missing: string[] = [];

  for (const expected of expectedChanges) {
    const found = actualChanges.some((change) => {
      // Check if expected string is in category or details
      const searchStr = expected.toLowerCase();
      return (
        change.category.toLowerCase().includes(searchStr) ||
        change.details.toLowerCase().includes(searchStr)
      );
    });

    if (!found) {
      missing.push(expected);
    }
  }

  return missing;
}

/**
 * Generate human-readable summary of changes
 */
function generateSummary(changes: StateChange[], validationPassed: boolean): string {
  if (changes.length === 0) {
    return 'No changes detected between before and after states';
  }

  // Group by type
  const byType = new Map<string, number>();
  changes.forEach((change) => {
    const count = byType.get(change.type) || 0;
    byType.set(change.type, count + 1);
  });

  const parts = Array.from(byType.entries())
    .map(([type, count]) => `${count} ${type}`)
    .join(', ');

  const status = validationPassed ? 'Validation PASSED' : 'Validation FAILED';
  return `${parts} - ${status}`;
}

/**
 * Simplified state comparison - just check if output changed at all
 */
export function hasStateChanged(beforeOutput: string, afterOutput: string): boolean {
  const before = extractOutputElements(beforeOutput);
  const after = extractOutputElements(afterOutput);

  return before.size !== after.size || !areElementsSame(before, after);
}

/**
 * Helper to compare two element sets
 */
function areElementsSame(set1: Set<string>, set2: Set<string>): boolean {
  if (set1.size !== set2.size) return false;

  for (const element of set1) {
    if (!set2.has(element)) {
      return false;
    }
  }

  return true;
}

/**
 * Extract specific data from output for before/after comparison
 * Useful for matching specific config values changed
 */
export function extractConfigValue(
  output: string,
  pattern: RegExp
): string | null {
  const match = output.match(pattern);
  return match ? match[1] : null;
}

/**
 * Validate that a specific configuration value changed from before to after
 */
export function validateConfigChanged(
  beforeOutput: string,
  afterOutput: string,
  pattern: RegExp,
  shouldExistAfter: boolean = true
): StateComparisonResult {
  const beforeValue = extractConfigValue(beforeOutput, pattern);
  const afterValue = extractConfigValue(afterOutput, pattern);

  const changed = beforeValue !== afterValue;

  if (shouldExistAfter && !afterValue) {
    return {
      changed: false,
      changes: [],
      expectedMissing: ['Expected value not found in after state'],
      validationPassed: false,
      summary: 'Configuration change validation FAILED: value missing in after state',
    };
  }

  if (!changed) {
    return {
      changed: false,
      changes: [],
      expectedMissing: ['Configuration value unchanged'],
      validationPassed: false,
      summary: `Configuration change validation FAILED: value unchanged (${beforeValue})`,
    };
  }

  return {
    changed: true,
    changes: [
      {
        type: 'modified',
        category: 'config_value',
        details: `Changed from "${beforeValue}" to "${afterValue}"`,
      },
    ],
    expectedMissing: [],
    validationPassed: true,
    summary: `Configuration change PASSED: ${beforeValue} → ${afterValue}`,
  };
}

/**
 * Bulk state validation - compare multiple before/after pairs
 */
export function validateMultipleStates(
  stateComparisons: Array<{
    before: string;
    after: string;
    expectedChanges: string[];
  }>
): StateComparisonResult {
  const allChanges: StateChange[] = [];
  let allValid = true;
  const allMissing: string[] = [];

  for (const comparison of stateComparisons) {
    const result = compareStates(
      comparison.before,
      comparison.after,
      comparison.expectedChanges
    );

    allChanges.push(...result.changes);
    allMissing.push(...result.expectedMissing);

    if (!result.validationPassed) {
      allValid = false;
    }
  }

  return {
    changed: allChanges.length > 0,
    changes: allChanges,
    expectedMissing: allMissing,
    validationPassed: allValid,
    summary: allValid
      ? `All ${stateComparisons.length} state comparisons PASSED`
      : `State comparison validation FAILED: ${allMissing.length} expected changes missing`,
  };
}
