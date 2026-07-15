/**
 * Output Pattern Validators - Validate CLI show command output
 * Checks if device output contains expected patterns/keywords
 * Enables detection of successful configuration without full state simulation
 */

export interface ValidationResult {
  passed: boolean;
  reason: string;
  details?: Record<string, any>;
}

/**
 * Validate that a VLAN exists in show vlan output
 * Checks for VLAN ID and optionally VLAN name
 */
export function validateVlanExists(
  output: string,
  vlanId: number,
  vlanName?: string
): ValidationResult {
  if (!output) {
    return {
      passed: false,
      reason: 'No output provided',
    };
  }

  // Match VLAN ID at start of line (possibly with leading whitespace)
  const vlanPattern = new RegExp(`^\\s*${vlanId}\\b`, 'm');

  if (!vlanPattern.test(output)) {
    return {
      passed: false,
      reason: `VLAN ${vlanId} not found in output`,
      details: {
        vlanId,
        outputLength: output.length,
      },
    };
  }

  // If VLAN name provided, verify it exists on same line
  if (vlanName) {
    const vlanLinePattern = new RegExp(`^\\s*${vlanId}\\s+.*${vlanName}`, 'im');
    if (!vlanLinePattern.test(output)) {
      return {
        passed: false,
        reason: `VLAN ${vlanId} found but name "${vlanName}" not found`,
        details: { vlanId, expectedName: vlanName },
      };
    }
  }

  return {
    passed: true,
    reason: `VLAN ${vlanId} verified in output`,
    details: { vlanId, vlanName },
  };
}

/**
 * Validate that an interface is configured with specific properties
 * Checks for: status (up/down), IP address, protocol
 */
export function validateInterfaceConfigured(
  output: string,
  interfaceName: string,
  options?: {
    ip?: string;
    subnet?: string;
    status?: 'up' | 'down';
    protocol?: 'up' | 'down';
  }
): ValidationResult {
  if (!output) {
    return {
      passed: false,
      reason: 'No output provided',
    };
  }

  // Normalize interface name and create pattern for multiple formats
  const normalized = interfaceName.toLowerCase();
  const ifaceAliases = [
    normalized,
    normalized.replace(/gi/g, 'gigabitethernet'),
    normalized.replace(/fa/g, 'fastethernet'),
    interfaceName, // Original case
    interfaceName.toUpperCase(),
  ];

  // Check if interface appears in output with any name variant
  let ifaceFound = false;
  for (const alias of ifaceAliases) {
    if (output.toLowerCase().includes(alias.toLowerCase())) {
      ifaceFound = true;
      break;
    }
  }

  if (!ifaceFound) {
    return {
      passed: false,
      reason: `Interface ${interfaceName} not found in output`,
      details: { interfaceName },
    };
  }

  // Check for IP address if specified
  if (options?.ip) {
    const ipPattern = new RegExp(`Internet address is|${options.ip}`, 'i');
    if (!ipPattern.test(output)) {
      return {
        passed: false,
        reason: `Interface ${interfaceName} found but IP ${options.ip} not configured`,
        details: { interfaceName, expectedIp: options.ip },
      };
    }
  }

  // Check status if specified
  if (options?.status) {
    const statusPattern =
      options.status === 'up'
        ? /is up.*line protocol is up|administratively up/i
        : /administratively down|line protocol is down/i;

    if (!statusPattern.test(output)) {
      return {
        passed: false,
        reason: `Interface status mismatch (expected ${options.status})`,
        details: { interfaceName, expectedStatus: options.status },
      };
    }
  }

  return {
    passed: true,
    reason: `Interface ${interfaceName} verified`,
    details: { interfaceName, options },
  };
}

/**
 * Validate OSPF neighbor relationships
 * Checks for neighbor router IDs, adjacency states (FULL, EXSTART, etc.)
 */
export function validateOSPFNeighbor(
  output: string,
  neighborId?: string,
  state?: string
): ValidationResult {
  if (!output) {
    return {
      passed: false,
      reason: 'No output provided',
    };
  }

  // Check if OSPF neighbor output exists (not empty/error)
  if (output.toLowerCase().includes('error') || output.match(/^%/m)) {
    return {
      passed: false,
      reason: 'OSPF neighbor query failed',
    };
  }

  // If no specific neighbor requested, just check that output has neighbor data
  if (!neighborId) {
    // Look for IP address pattern or OSPF state keywords indicating neighbors exist
    const hasNeighbors =
      /\d+\.\d+\.\d+\.\d+|FULL|EXSTART|LOADING|TWO_WAY|INIT|neighbor/i.test(output);
    if (!hasNeighbors) {
      return {
        passed: false,
        reason: 'No OSPF neighbors found',
      };
    }
    return {
      passed: true,
      reason: 'OSPF neighbors present',
    };
  }

  // Check for specific neighbor ID
  const neighborPattern = new RegExp(`\\b${neighborId.replace(/\./g, '\\.')}\\b`, 'i');
  if (!neighborPattern.test(output)) {
    return {
      passed: false,
      reason: `OSPF neighbor ${neighborId} not found`,
      details: { neighborId },
    };
  }

  // Check for specific state if provided
  if (state) {
    // Extract neighbor line and check state
    const neighborLines = output.split('\n');
    const neighborLine = neighborLines.find((line) => line.includes(neighborId));

    if (neighborLine) {
      const stateUpperCase = state.toUpperCase();
      if (!neighborLine.toUpperCase().includes(stateUpperCase)) {
        return {
          passed: false,
          reason: `OSPF neighbor ${neighborId} found but state is not ${state}`,
          details: { neighborId, expectedState: state, neighborLine },
        };
      }
    }
  }

  return {
    passed: true,
    reason: `OSPF neighbor ${neighborId || 'all'} verified`,
    details: { neighborId, state },
  };
}

/**
 * Validate NAT translations are active
 * Checks for at least one active NAT translation in show ip nat translations
 */
export function validateNATTranslation(output: string): ValidationResult {
  if (!output) {
    return {
      passed: false,
      reason: 'No output provided',
    };
  }

  // Look for NAT translation entries
  // Format: "Pro Inside global      Inside local       Outside local      Outside global"
  const hasTranslations = /pro\s+inside|inside global|translation|pro|tcp|udp/i.test(output);

  if (!hasTranslations) {
    return {
      passed: false,
      reason: 'No NAT translations found in output',
    };
  }

  // Check for actual translation entries (not just headers)
  const hasEntries = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/m.test(output);
  if (!hasEntries) {
    return {
      passed: false,
      reason: 'NAT translation table present but no active translations',
    };
  }

  return {
    passed: true,
    reason: 'NAT translations verified',
  };
}

/**
 * Validate a route exists in routing table
 * Checks for specific subnet/prefix with protocol type
 */
export function validateRouteExists(
  output: string,
  subnet: string,
  protocol?: string
): ValidationResult {
  if (!output) {
    return {
      passed: false,
      reason: 'No output provided',
    };
  }

  // Normalize subnet notation (handle both /24 and 255.255.255.0 formats)
  const subnetPatterns = [
    new RegExp(`\\b${subnet}\\b`), // Exact CIDR notation
    new RegExp(subnet.replace(/\//g, '\\s')), // Space-separated subnet
  ];

  let foundSubnet = false;
  for (const pattern of subnetPatterns) {
    if (pattern.test(output)) {
      foundSubnet = true;
      break;
    }
  }

  if (!foundSubnet) {
    return {
      passed: false,
      reason: `Route ${subnet} not found in routing table`,
      details: { subnet },
    };
  }

  // Check protocol if specified
  if (protocol) {
    const protocolMap: Record<string, string> = {
      connected: 'C',
      static: 'S',
      ospf: 'O',
      rip: 'R',
      bgp: 'B',
      eigrp: 'D',
      isis: 'i',
    };

    const protocolCode = protocolMap[protocol.toLowerCase()] || protocol.toUpperCase();
    const protocolPattern = new RegExp(`${protocolCode}\\s+${subnet}|${protocol}.*${subnet}`, 'i');

    if (!protocolPattern.test(output)) {
      return {
        passed: false,
        reason: `Route ${subnet} found but not via ${protocol}`,
        details: { subnet, protocol },
      };
    }
  }

  return {
    passed: true,
    reason: `Route ${subnet} verified`,
    details: { subnet, protocol },
  };
}

/**
 * Validate specific output keywords exist
 * General-purpose validator for any keyword search
 */
export function validateOutputContains(
  output: string,
  keywords: string | string[],
  allRequired: boolean = true
): ValidationResult {
  if (!output) {
    return {
      passed: false,
      reason: 'No output provided',
    };
  }

  const keywordArray = Array.isArray(keywords) ? keywords : [keywords];
  const found: string[] = [];
  const missing: string[] = [];

  for (const keyword of keywordArray) {
    const keywordPattern = new RegExp(`\\b${keyword}\\b`, 'i');
    if (keywordPattern.test(output)) {
      found.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  if (allRequired && missing.length > 0) {
    return {
      passed: false,
      reason: `Missing required keywords: ${missing.join(', ')}`,
      details: { found, missing, allRequired },
    };
  }

  if (!allRequired && found.length === 0) {
    return {
      passed: false,
      reason: `No matching keywords found`,
      details: { searched: keywordArray },
    };
  }

  return {
    passed: true,
    reason: allRequired
      ? `All keywords found: ${found.join(', ')}`
      : `Found keywords: ${found.join(', ')}`,
    details: { found, missing },
  };
}

/**
 * Validate interface is in "no shutdown" state (enabled)
 * Checks administrative and line protocol status
 */
export function validateInterfaceEnabled(
  output: string,
  interfaceName: string
): ValidationResult {
  const configResult = validateInterfaceConfigured(output, interfaceName, {
    status: 'up',
  });

  if (!configResult.passed) {
    return {
      passed: false,
      reason: `Interface ${interfaceName} is not enabled (shutdown or line protocol down)`,
      details: { interfaceName },
    };
  }

  return {
    passed: true,
    reason: `Interface ${interfaceName} is enabled and operational`,
    details: { interfaceName },
  };
}

/**
 * Validate that an access list exists with specific permit/deny entries
 */
export function validateAccessListExists(
  output: string,
  aclNumber: number,
  expectedPermit?: boolean
): ValidationResult {
  if (!output) {
    return {
      passed: false,
      reason: 'No output provided',
    };
  }

  // Look for ACL header
  const aclPattern = new RegExp(
    `Standard IP access list ${aclNumber}|access list ${aclNumber}`,
    'i'
  );

  if (!aclPattern.test(output)) {
    return {
      passed: false,
      reason: `Access list ${aclNumber} not found`,
      details: { aclNumber },
    };
  }

  // Check for permit/deny if specified
  if (expectedPermit !== undefined) {
    const action = expectedPermit ? 'permit' : 'deny';
    const actionPattern = new RegExp(action, 'i');

    if (!actionPattern.test(output)) {
      return {
        passed: false,
        reason: `Access list ${aclNumber} found but no ${action} rules`,
        details: { aclNumber, expectedAction: action },
      };
    }
  }

  return {
    passed: true,
    reason: `Access list ${aclNumber} verified`,
    details: { aclNumber, expectedPermit },
  };
}

/**
 * Validate MAC address table has entries
 * Checks for VLAN, MAC address, interface format
 */
export function validateMacAddressTableHasEntries(
  output: string,
  minEntries: number = 1
): ValidationResult {
  if (!output) {
    return {
      passed: false,
      reason: 'No output provided',
    };
  }

  // Look for MAC address table header
  if (!output.match(/mac address.*table|mac.*address|^Vlan/im)) {
    return {
      passed: false,
      reason: 'Invalid MAC address table format',
    };
  }

  // Count MAC address entries (format: XX:XX:XX:XX:XX:XX or XXXX.XXXX.XXXX)
  const macPattern = /([0-9a-f]{2}:){5}[0-9a-f]{2}|([0-9a-f]{4}\.){2}[0-9a-f]{4}/gim;
  const entries = output.match(macPattern) || [];

  if (entries.length < minEntries) {
    return {
      passed: false,
      reason: `MAC table has ${entries.length} entries, expected at least ${minEntries}`,
      details: { found: entries.length, required: minEntries },
    };
  }

  return {
    passed: true,
    reason: `MAC table verified with ${entries.length} entries`,
    details: { entryCount: entries.length, minRequired: minEntries },
  };
}
