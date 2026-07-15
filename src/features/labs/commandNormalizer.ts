/**
 * Command Normalizer - Handles CLI command abbreviations and normalization
 * Converts IOS CLI variants (abbreviations, case, spacing) to canonical forms
 * References: Cisco IOS Command Reference
 */

/**
 * Abbreviation map for common IOS commands
 * Maps abbreviated forms to their full canonical versions
 */
export const IOS_ABBREVIATIONS: Record<string, string> = {
  // Basic navigation
  't': 'terminal',
  'conf': 'configure',
  'conf t': 'configure terminal',
  'config t': 'configure terminal',
  'ex': 'exit',

  // Interface - must come before single letter abbreviations
  'int': 'interface',
  'int gi': 'interface gigabitethernet',
  'int fa': 'interface fastethernet',
  'gi': 'gigabitethernet',
  'fa': 'fastethernet',
  'eth': 'ethernet',
  'e': 'ethernet',
  'se': 'serial',
  'lo': 'loopback',
  'vlan': 'vlan',

  // VLAN operations
  'sw': 'switchport',
  'sw mo': 'switchport mode',
  'sw mo t': 'switchport mode trunk',
  'sw mo a': 'switchport mode access',
  'sw tr a': 'switchport trunk allowed',

  // Interface control
  'shut': 'shutdown',
  'no shut': 'no shutdown',
  'no sh': 'no shutdown',

  // IP configuration
  'ip addr': 'ip address',
  'ip add': 'ip address',
  'no ip addr': 'no ip address',

  // Routing
  'sh ip': 'show ip',
  'sh ip rou': 'show ip route',
  'sh ip r': 'show ip route',
  'sh ip os': 'show ip ospf',
  'sh ip os n': 'show ip ospf neighbor',
  'sh ip os nei': 'show ip ospf neighbor',

  // OSPF
  'router os': 'router ospf',
  'net': 'network',
  'area': 'area',

  // NAT
  'ip nat': 'ip nat',
  'ip nat in': 'ip nat inside',
  'ip nat out': 'ip nat outside',
  'ip nat in s': 'ip nat inside source',
  'access-list': 'access-list',
  'acc': 'access-list',

  // Show commands
  'sh vlan': 'show vlan',
  'sh vlan b': 'show vlan brief',
  'sh int': 'show interfaces',
  'sh int t': 'show interfaces trunk',
  'sh int sw': 'show interfaces switchport',
  'sh mac': 'show mac-address-table',
  'sh arp': 'show arp',

  // Port security
  'port-security': 'switchport port-security',
  'port-sec': 'switchport port-security',
  'port-sec max': 'switchport port-security maximum',
  'port-sec mac': 'switchport port-security mac-address',
  'port-sec vio': 'switchport port-security violation',

  // DHCP Snooping
  'ip dhcp': 'ip dhcp',
  'ip dhcp snooping': 'ip dhcp snooping',
  'ip dhcp sn': 'ip dhcp snooping',

  // Help
  '?': 'help',
  'help': 'help',

  // Session
  'logout': 'logout',
  'exit all': 'exit all',
  'end': 'end',
};

/**
 * Interface abbreviations - common shorthand for interface types
 */
export const INTERFACE_ABBREVIATIONS: Record<string, string> = {
  'gi': 'GigabitEthernet',
  'ge': 'GigabitEthernet',
  'g': 'GigabitEthernet',
  'fa': 'FastEthernet',
  'fe': 'FastEthernet',
  'f': 'FastEthernet',
  'e': 'Ethernet',
  'eth': 'Ethernet',
  'se': 'Serial',
  's': 'Serial',
  'lo': 'Loopback',
  'vlan': 'Vlan',
  'v': 'Vlan',
  'port-channel': 'Port-channel',
  'po': 'Port-channel',
};

/**
 * Normalize a single CLI command string
 * - Trims whitespace
 * - Converts to lowercase
 * - Collapses multiple spaces
 * - Handles null/undefined gracefully
 */
export function normalizeCliCommand(input: string | null | undefined): string {
  if (!input) return '';

  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' '); // collapse multiple spaces to single
}

/**
 * Resolve abbreviations in a command to canonical form
 * Handles both full-command and partial abbreviations
 */
export function resolveAbbreviations(normalizedCmd: string): string {
  // First check for exact abbreviation matches in map
  if (IOS_ABBREVIATIONS[normalizedCmd]) {
    return IOS_ABBREVIATIONS[normalizedCmd];
  }

  const parts = normalizedCmd.split(' ');
  const expandedParts: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // Check if this part is an interface abbreviation like "gi0/1"
    const ifaceMatch = part.match(/^([a-z]+)([\d/]+)$/);
    if (ifaceMatch) {
      const abbr = ifaceMatch[1];
      const numPart = ifaceMatch[2];
      if (INTERFACE_ABBREVIATIONS[abbr]) {
        expandedParts.push(INTERFACE_ABBREVIATIONS[abbr].toLowerCase() + numPart);
        continue;
      }
    }

    // Check if part is a command abbreviation
    if (IOS_ABBREVIATIONS[part]) {
      expandedParts.push(IOS_ABBREVIATIONS[part]);
      continue;
    }

    expandedParts.push(part);
  }

  const expanded = expandedParts.join(' ');

  // Check if expanded version has a mapping
  if (IOS_ABBREVIATIONS[expanded]) {
    return IOS_ABBREVIATIONS[expanded];
  }

  return expanded;
}

/**
 * Generate command variants for flexible matching
 * Returns array of plausible forms user might type
 */
export function generateCommandVariants(canonicalCmd: string): string[] {
  const variants: Set<string> = new Set();
  variants.add(canonicalCmd);

  // Add all-lowercase version
  variants.add(canonicalCmd.toLowerCase());

  // Add versions with interface abbreviations
  for (const [abbr, full] of Object.entries(INTERFACE_ABBREVIATIONS)) {
    if (canonicalCmd.includes(full.toLowerCase())) {
      variants.add(canonicalCmd.replace(new RegExp(full.toLowerCase(), 'g'), abbr));
    }
  }

  // Add reverse abbreviations
  for (const [abbr, full] of Object.entries(IOS_ABBREVIATIONS)) {
    if (canonicalCmd.includes(full)) {
      variants.add(canonicalCmd.replace(new RegExp(full, 'g'), abbr));
    }
  }

  return Array.from(variants);
}

/**
 * Compare user input with expected command, accounting for:
 * - Case differences
 * - Spacing differences
 * - Abbreviations
 * - Interface shorthand
 */
export function commandMatches(userInput: string | null, expectedCmd: string): boolean {
  if (!userInput) return false;

  const normalized = normalizeCliCommand(userInput);
  const expected = normalizeCliCommand(expectedCmd);

  // Exact match after normalization
  if (normalized === expected) {
    return true;
  }

  // Resolve abbreviations and compare
  const resolved = resolveAbbreviations(normalized);
  const resolvedExpected = resolveAbbreviations(expected);

  if (resolved === resolvedExpected) {
    return true;
  }

  // Check if resolved version matches or is contained (for show commands with filters)
  if (resolvedExpected.startsWith('show')) {
    // For show commands, user might add filters
    // e.g., "show ip route ospf" contains "show ip route"
    return resolved.startsWith(resolvedExpected) || resolvedExpected.startsWith(resolved);
  }

  return false;
}

/**
 * Parse command into components: mode/keyword/value
 * Useful for validation that cares about specific parts
 */
export interface ParsedCommand {
  fullCommand: string;
  keywords: string[];
  value?: string;
  interface?: string;
  ipAddress?: string;
}

export function parseCommand(normalizedCmd: string): ParsedCommand {
  const parts = normalizedCmd.split(' ');
  const keywords: string[] = [];
  let interfaceMatch: string | undefined;
  let ipMatch: string | undefined;

  // Extract interface if present
  const interfacePattern = /^(gi|fa|e|lo|vlan|po)[\d/]+/i;
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;

  for (const part of parts) {
    if (interfacePattern.test(part)) {
      interfaceMatch = part;
    } else if (!ipMatch && ipPattern.test(part)) {
      // Only capture first IP address
      ipMatch = part;
    } else {
      keywords.push(part);
    }
  }

  return {
    fullCommand: normalizedCmd,
    keywords,
    interface: interfaceMatch,
    ipAddress: ipMatch,
  };
}

/**
 * Check if input is a valid CLI command structure
 * Returns null if valid, error message if invalid
 */
export function validateCommandStructure(normalizedCmd: string): string | null {
  if (!normalizedCmd) {
    return 'Empty command';
  }

  const parts = normalizedCmd.split(' ');

  // Check for common issues
  if (parts.some((p) => p.includes(';;'))) {
    return 'Invalid syntax: double semicolon';
  }

  // IP address validation
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  for (const part of parts) {
    if (part.includes('.') && /^\d+\.\d+/.test(part)) {
      if (!ipPattern.test(part)) {
        return `Invalid IP address format: ${part}`;
      }
      // Validate octets
      const octets = part.split('.').map(Number);
      if (octets.some((o) => o > 255)) {
        return `IP octet exceeds 255: ${part}`;
      }
    }
  }

  return null;
}
