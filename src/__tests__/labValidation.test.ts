/**
 * Lab CLI Validation Engine Tests
 * 50+ comprehensive tests for Phase 1 MVP
 * Tests command normalizer, output validators, state comparison, and sequence validation
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeCliCommand,
  resolveAbbreviations,
  generateCommandVariants,
  commandMatches,
  parseCommand,
  validateCommandStructure,
} from '../features/labs/commandNormalizer';
import {
  validateVlanExists,
  validateInterfaceConfigured,
  validateOSPFNeighbor,
  validateNATTranslation,
  validateRouteExists,
  validateOutputContains,
  validateInterfaceEnabled,
  validateAccessListExists,
  validateMacAddressTableHasEntries,
} from '../features/labs/outputValidators';
import {
  compareStates,
  hasStateChanged,
  extractConfigValue,
  validateConfigChanged,
  validateMultipleStates,
} from '../features/labs/stateValidator';
import {
  trackCommandOrder,
  validateSequence,
  getVlanTrunkSequence,
  getOspfSequence,
  getNatSequence,
  detectCommonMistakes,
  analyzeCommandTiming,
} from '../features/labs/sequenceValidator';

// ============================================================================
// COMMAND NORMALIZER TESTS (10+ tests)
// ============================================================================

describe('Command Normalizer', () => {
  describe('normalizeCliCommand', () => {
    it('trims whitespace from command', () => {
      expect(normalizeCliCommand('  configure terminal  ')).toBe('configure terminal');
    });

    it('converts to lowercase', () => {
      expect(normalizeCliCommand('CONFIGURE TERMINAL')).toBe('configure terminal');
      expect(normalizeCliCommand('Show IP Route')).toBe('show ip route');
    });

    it('collapses multiple spaces', () => {
      expect(normalizeCliCommand('conf   t')).toBe('conf t');
      expect(normalizeCliCommand('  show   ip   route  ')).toBe('show ip route');
    });

    it('handles empty and null input', () => {
      expect(normalizeCliCommand('')).toBe('');
      expect(normalizeCliCommand(null)).toBe('');
      expect(normalizeCliCommand(undefined)).toBe('');
    });

    it('preserves VLAN numbers', () => {
      expect(normalizeCliCommand('vlan 10')).toBe('vlan 10');
      expect(normalizeCliCommand('VLAN 100')).toBe('vlan 100');
    });

    it('preserves interface notation', () => {
      expect(normalizeCliCommand('interface Gi0/1')).toBe('interface gi0/1');
      expect(normalizeCliCommand('interface   FastEthernet0/0')).toBe(
        'interface fastethernet0/0'
      );
    });

    it('preserves IP addresses', () => {
      expect(normalizeCliCommand('ip address 192.168.1.1 255.255.255.0')).toBe(
        'ip address 192.168.1.1 255.255.255.0'
      );
    });
  });

  describe('resolveAbbreviations', () => {
    it('resolves configure terminal abbreviations', () => {
      expect(resolveAbbreviations('conf t')).toBe('configure terminal');
      expect(resolveAbbreviations('config t')).toBe('configure terminal');
      expect(resolveAbbreviations('configure terminal')).toBe('configure terminal');
    });

    it('resolves interface abbreviations', () => {
      expect(resolveAbbreviations('int gi0/1')).toBe('interface gigabitethernet0/1');
      expect(resolveAbbreviations('interface fa0/0')).toBe(
        'interface fastethernet0/0'
      );
    });

    it('resolves exit abbreviations', () => {
      expect(resolveAbbreviations('ex')).toBe('exit');
      expect(resolveAbbreviations('exit')).toBe('exit');
    });

    it('resolves show command abbreviations', () => {
      expect(resolveAbbreviations('sh ip rou')).toBe('show ip route');
      expect(resolveAbbreviations('show ip route')).toBe('show ip route');
    });

    it('resolves no shutdown abbreviations', () => {
      expect(resolveAbbreviations('no sh')).toBe('no shutdown');
      expect(resolveAbbreviations('no shut')).toBe('no shutdown');
    });

    it('resolves switchport abbreviations', () => {
      expect(resolveAbbreviations('sw mo t')).toBe('switchport mode trunk');
      expect(resolveAbbreviations('sw mo a')).toBe('switchport mode access');
    });
  });

  describe('commandMatches', () => {
    it('matches exact normalized commands', () => {
      expect(commandMatches('configure terminal', 'configure terminal')).toBe(true);
      expect(commandMatches('exit', 'exit')).toBe(true);
    });

    it('matches case-insensitive commands', () => {
      expect(commandMatches('CONFIGURE TERMINAL', 'configure terminal')).toBe(true);
      expect(commandMatches('Configure Terminal', 'CONFIGURE TERMINAL')).toBe(true);
    });

    it('matches abbreviated commands', () => {
      expect(commandMatches('conf t', 'configure terminal')).toBe(true);
      expect(commandMatches('config t', 'configure terminal')).toBe(true);
      expect(commandMatches('int gi0/0', 'interface gi0/0')).toBe(true);
    });

    it('matches interface shorthand', () => {
      expect(commandMatches('gi0/1', 'gigabitethernet0/1')).toBe(true);
      expect(commandMatches('fa0/0', 'fastethernet0/0')).toBe(true);
    });

    it('returns false for unrelated commands', () => {
      expect(commandMatches('configure terminal', 'show version')).toBe(false);
      expect(commandMatches('enable', 'disable')).toBe(false);
    });

    it('handles show commands with filters', () => {
      expect(commandMatches('show ip route ospf', 'show ip route')).toBe(true);
      expect(commandMatches('show ip route', 'show ip route ospf')).toBe(true);
    });

    it('handles null input gracefully', () => {
      expect(commandMatches(null, 'configure terminal')).toBe(false);
      expect(commandMatches('', 'configure terminal')).toBe(false);
    });
  });

  describe('parseCommand', () => {
    it('extracts interface from command', () => {
      const parsed = parseCommand('interface gi0/1');
      expect(parsed.interface).toBe('gi0/1');
    });

    it('extracts IP address from command', () => {
      const parsed = parseCommand('ip address 192.168.1.1 255.255.255.0');
      expect(parsed.ipAddress).toBe('192.168.1.1');
    });

    it('extracts keywords', () => {
      const parsed = parseCommand('configure terminal');
      expect(parsed.keywords).toContain('configure');
      expect(parsed.keywords).toContain('terminal');
    });
  });

  describe('validateCommandStructure', () => {
    it('accepts valid commands', () => {
      expect(validateCommandStructure('configure terminal')).toBeNull();
      expect(validateCommandStructure('interface gi0/1')).toBeNull();
    });

    it('rejects empty commands', () => {
      expect(validateCommandStructure('')).not.toBeNull();
    });

    it('validates IP address format', () => {
      expect(validateCommandStructure('ip address 192.168.1.1 255.255.255.0')).toBeNull();
      expect(validateCommandStructure('ip address 256.1.1.1 255.255.255.0')).not.toBeNull();
    });
  });
});

// ============================================================================
// OUTPUT VALIDATORS TESTS (15+ tests)
// ============================================================================

describe('Output Validators', () => {
  describe('validateVlanExists', () => {
    it('detects VLAN in output', () => {
      const output = `
        VLAN Name                             Status    Ports
        ---- -------------------------------- --------- -------------------------------
        1    default                          active    Gi0/0, Gi0/1
        10   Data                             active    Gi0/2
      `;
      const result = validateVlanExists(output, 10);
      expect(result.passed).toBe(true);
    });

    it('detects VLAN by name', () => {
      const output = `
        10   Data                             active    Gi0/2
      `;
      const result = validateVlanExists(output, 10, 'Data');
      expect(result.passed).toBe(true);
    });

    it('detects missing VLAN', () => {
      const output = `VLAN 1 exists`;
      const result = validateVlanExists(output, 10);
      expect(result.passed).toBe(false);
    });

    it('handles empty output', () => {
      const result = validateVlanExists('', 10);
      expect(result.passed).toBe(false);
    });
  });

  describe('validateInterfaceConfigured', () => {
    it('detects configured interface', () => {
      const output = `
        GigabitEthernet0/1 is up, line protocol is up
          Internet address is 192.168.1.1 255.255.255.0
      `;
      const result = validateInterfaceConfigured(output, 'Gi0/1', {
        ip: '192.168.1.1',
        status: 'up',
      });
      expect(result.passed).toBe(true);
    });

    it('detects interface without IP', () => {
      const output = `GigabitEthernet0/1 is up, line protocol is up`;
      const result = validateInterfaceConfigured(output, 'Gi0/1', { ip: '192.168.1.1' });
      expect(result.passed).toBe(false);
    });

    it('detects shutdown interface', () => {
      const output = `GigabitEthernet0/1 is administratively down`;
      const result = validateInterfaceConfigured(output, 'Gi0/1', { status: 'up' });
      expect(result.passed).toBe(false);
    });
  });

  describe('validateOSPFNeighbor', () => {
    it('detects OSPF neighbors', () => {
      const output = `
        Neighbor ID     Pri   State           Dead Time   Address         Interface
        10.0.0.2          1   FULL/DR         39          10.0.0.2        Gi0/1
      `;
      const result = validateOSPFNeighbor(output, '10.0.0.2', 'FULL');
      expect(result.passed).toBe(true);
    });

    it('detects OSPF neighbor in wrong state', () => {
      const output = `
        10.0.0.2          1   INIT            39          10.0.0.2        Gi0/1
      `;
      const result = validateOSPFNeighbor(output, '10.0.0.2', 'FULL');
      expect(result.passed).toBe(false);
    });

    it('detects missing OSPF neighbor', () => {
      const output = `Neighbor ID     Pri   State`;
      const result = validateOSPFNeighbor(output, '10.0.0.2');
      expect(result.passed).toBe(false);
    });

    it('detects any OSPF neighbor', () => {
      const output = `
        10.0.0.2          1   FULL/DR         39          10.0.0.2        Gi0/1
      `;
      const result = validateOSPFNeighbor(output);
      expect(result.passed).toBe(true);
    });
  });

  describe('validateNATTranslation', () => {
    it('detects active NAT translations', () => {
      const output = `
        Pro Inside global      Inside local       Outside local      Outside global
        tcp 203.0.113.1:1024   10.0.0.1:1024      10.0.0.2:80        10.0.0.2:80
      `;
      const result = validateNATTranslation(output);
      expect(result.passed).toBe(true);
    });

    it('detects missing NAT translations', () => {
      const output = `Pro Inside global`;
      const result = validateNATTranslation(output);
      expect(result.passed).toBe(false);
    });
  });

  describe('validateRouteExists', () => {
    it('detects route in routing table', () => {
      const output = `
        O 192.168.1.0/24 [110/20] via 10.0.0.2, 00:05:23, Gi0/0
      `;
      const result = validateRouteExists(output, '192.168.1.0/24', 'ospf');
      expect(result.passed).toBe(true);
    });

    it('detects connected route', () => {
      const output = `C 10.0.0.0/24 is directly connected, Gi0/0`;
      const result = validateRouteExists(output, '10.0.0.0/24', 'connected');
      expect(result.passed).toBe(true);
    });

    it('detects missing route', () => {
      const output = `O 192.168.1.0/24`;
      const result = validateRouteExists(output, '172.16.0.0/24');
      expect(result.passed).toBe(false);
    });
  });

  describe('validateOutputContains', () => {
    it('finds single keyword', () => {
      const output = 'This is test output with keyword';
      const result = validateOutputContains(output, 'keyword');
      expect(result.passed).toBe(true);
    });

    it('finds multiple keywords', () => {
      const output = 'VLAN 10 is active and configured';
      const result = validateOutputContains(output, ['VLAN', 'active', 'configured']);
      expect(result.passed).toBe(true);
    });

    it('detects missing keyword', () => {
      const output = 'Output without the word';
      const result = validateOutputContains(output, 'missing', true);
      expect(result.passed).toBe(false);
    });
  });

  describe('validateInterfaceEnabled', () => {
    it('detects enabled interface', () => {
      const output = `GigabitEthernet0/1 is up, line protocol is up`;
      const result = validateInterfaceEnabled(output, 'Gi0/1');
      expect(result.passed).toBe(true);
    });

    it('detects shutdown interface', () => {
      const output = `GigabitEthernet0/1 is administratively down`;
      const result = validateInterfaceEnabled(output, 'Gi0/1');
      expect(result.passed).toBe(false);
    });
  });

  describe('validateAccessListExists', () => {
    it('detects access list', () => {
      const output = `
        Standard IP access list 1
            10 permit 10.0.0.0 0.0.0.255
      `;
      const result = validateAccessListExists(output, 1, true);
      expect(result.passed).toBe(true);
    });

    it('detects missing access list', () => {
      const output = `Standard IP access list 2`;
      const result = validateAccessListExists(output, 1);
      expect(result.passed).toBe(false);
    });
  });

  describe('validateMacAddressTableHasEntries', () => {
    it('detects MAC address table entries', () => {
      const output = `
        Mac Address Table
        -------------------------------------------
        Vlan    Mac Address       Type        Ports
        ----    -----------       --------    -----
        1       aabb.ccdd.eeff    DYNAMIC     Gi0/1
        1       0011.2233.4455    DYNAMIC     Gi0/2
      `;
      const result = validateMacAddressTableHasEntries(output, 2);
      expect(result.passed).toBe(true);
    });

    it('detects when MAC table is empty', () => {
      const output = `Mac Address Table\nVlan    Mac Address`;
      const result = validateMacAddressTableHasEntries(output, 1);
      expect(result.passed).toBe(false);
    });
  });
});

// ============================================================================
// STATE VALIDATOR TESTS (10+ tests)
// ============================================================================

describe('State Validators', () => {
  describe('compareStates', () => {
    it('detects added VLAN', () => {
      const before = `1 default active`;
      const after = `1 default active
10 Data active`;
      const result = compareStates(before, after, ['vlan']);
      expect(result.changed).toBe(true);
      expect(result.changes.some((c) => c.category === 'vlan')).toBe(true);
    });

    it('detects interface status change', () => {
      const before = `Gi0/1 is administratively down`;
      const after = `Gi0/1 is up, line protocol is up`;
      const result = compareStates(before, after, ['interface']);
      expect(result.changed).toBe(true);
    });

    it('detects no changes', () => {
      const output = `VLAN 1 default`;
      const result = compareStates(output, output, []);
      expect(result.changed).toBe(false);
    });

    it('validates expected changes', () => {
      const before = ``;
      const after = `OSPF neighbor 10.0.0.2 FULL`;
      const result = compareStates(before, after, ['ospf']);
      expect(result.validationPassed).toBe(true);
    });

    it('fails when expected changes missing', () => {
      const before = ``;
      const after = `Interface added`;
      const result = compareStates(before, after, ['route', 'vlan']);
      expect(result.validationPassed).toBe(false);
      expect(result.expectedMissing.length).toBeGreaterThan(0);
    });
  });

  describe('hasStateChanged', () => {
    it('detects state changes', () => {
      const before = `VLAN 1`;
      const after = `VLAN 1\nVLAN 10`;
      expect(hasStateChanged(before, after)).toBe(true);
    });

    it('detects no changes', () => {
      const output = `VLAN 1`;
      expect(hasStateChanged(output, output)).toBe(false);
    });
  });

  describe('validateConfigChanged', () => {
    it('detects config value change', () => {
      const before = `IP address 10.0.0.1`;
      const after = `IP address 192.168.1.1`;
      const pattern = /IP address (\S+)/;
      const result = validateConfigChanged(before, after, pattern);
      expect(result.changed).toBe(true);
      expect(result.validationPassed).toBe(true);
    });

    it('detects unchanged config', () => {
      const output = `IP address 10.0.0.1`;
      const pattern = /IP address (\S+)/;
      const result = validateConfigChanged(output, output, pattern);
      expect(result.changed).toBe(false);
    });
  });

  describe('validateMultipleStates', () => {
    it('validates multiple state comparisons', () => {
      const result = validateMultipleStates([
        {
          before: `1 default`,
          after: `1 default
10 Data`,
          expectedChanges: ['vlan'],
        },
        {
          before: `Gi0/1 is administratively down`,
          after: `Gi0/1 is up`,
          expectedChanges: ['interface'],
        },
      ]);
      expect(result.validationPassed).toBe(true);
    });
  });
});

// ============================================================================
// SEQUENCE VALIDATOR TESTS (15+ tests)
// ============================================================================

describe('Sequence Validators', () => {
  describe('trackCommandOrder', () => {
    it('normalizes and tracks commands', () => {
      const commands = ['  CONFIGURE TERMINAL  ', 'exit', '  SHOW IP ROUTE  '];
      const tracked = trackCommandOrder(commands);
      expect(tracked).toEqual(['configure terminal', 'exit', 'show ip route']);
    });

    it('filters empty commands', () => {
      const commands = ['conf t', '', '  ', 'exit'];
      const tracked = trackCommandOrder(commands);
      expect(tracked.length).toBe(2);
    });
  });

  describe('validateSequence', () => {
    it('validates correct sequence', () => {
      const required = getVlanTrunkSequence();
      const executed = [
        'configure terminal',
        'vlan 10',
        'exit',
        'interface gi0/1',
        'switchport mode trunk',
        'switchport trunk allowed vlan 10',
        'no shutdown',
        'exit',
        'show interfaces trunk',
      ];
      const result = validateSequence(required, executed);
      expect(result.valid).toBe(true);
      expect(result.outOfOrder.length).toBe(0);
    });

    it('detects out-of-order commands', () => {
      const required = getVlanTrunkSequence();
      const executed = [
        'configure terminal',
        'interface gi0/1',
        'switchport mode trunk',
        'vlan 10', // VLAN after interface - wrong order
      ];
      const result = validateSequence(required, executed);
      expect(result.valid).toBe(false);
      expect(result.outOfOrder.length).toBeGreaterThan(0);
    });

    it('detects missing required commands', () => {
      const required = getVlanTrunkSequence();
      const executed = ['configure terminal', 'exit'];
      const result = validateSequence(required, executed);
      expect(result.valid).toBe(false);
      expect(result.missingRequired.length).toBeGreaterThan(0);
    });

    it('allows optional commands to be skipped', () => {
      const required = [
        { command: 'configure terminal', optional: false },
        { command: 'interface gi0/1', optional: false },
        { command: 'exit', optional: true },
      ];
      const executed = ['configure terminal', 'interface gi0/1'];
      const result = validateSequence(required, executed);
      expect(result.valid).toBe(true);
    });

    it('handles abbreviations in sequence', () => {
      const required = [
        { command: 'configure terminal', optional: false },
        { command: 'exit', optional: false },
      ];
      const executed = ['conf t', 'ex'];
      const result = validateSequence(required, executed);
      expect(result.valid).toBe(true);
    });

    it('handles regex patterns in sequence', () => {
      const required = [
        { command: 'vlan \\d+', isPattern: true, optional: false },
        { command: 'exit', optional: false },
      ];
      const executed = ['vlan 10', 'exit'];
      const result = validateSequence(required, executed);
      expect(result.valid).toBe(true);
    });
  });

  describe('OSPF sequence', () => {
    it('validates OSPF configuration sequence', () => {
      const required = getOspfSequence();
      const executed = [
        'configure terminal',
        'router ospf 1',
        'network 10.0.0.0 0.0.0.255 area 0',
        'exit',
        'exit',
        'show ip ospf neighbor',
      ];
      const result = validateSequence(required, executed);
      expect(result.valid).toBe(true);
    });
  });

  describe('NAT sequence', () => {
    it('validates NAT configuration sequence', () => {
      // Minimal NAT configuration sequence for testing
      const required = [
        { command: 'configure terminal', optional: false },
        { command: 'interface', optional: false },
        { command: 'ip nat', optional: false },
        { command: 'access-list', optional: false },
      ];
      const executed = [
        'configure terminal',
        'interface gi0/0',
        'ip nat inside',
        'ip nat outside',
        'access-list 1 permit 10.0.0.0',
      ];
      const result = validateSequence(required, executed);
      expect(result.valid).toBe(true);
    });
  });

  describe('detectCommonMistakes', () => {
    it('detects shutdown before IP address', () => {
      const commands = [
        'configure terminal',
        'interface gi0/0',
        'shutdown',
        'ip address 10.0.0.1 255.255.255.0',
      ];
      const mistakes = detectCommonMistakes(commands);
      expect(mistakes.some((m) => m.mistake.includes('Shutdown configured before IP'))).toBe(true);
    });

    it('detects show command in config mode', () => {
      const commands = ['configure terminal', 'show ip route', 'exit'];
      const mistakes = detectCommonMistakes(commands);
      expect(
        mistakes.some((m) => m.mistake.includes('Show command executed in config mode'))
      ).toBe(true);
    });

    it('detects no shutdown before interface', () => {
      const commands = ['configure terminal', 'no shutdown', 'interface gi0/0'];
      const mistakes = detectCommonMistakes(commands);
      expect(
        mistakes.some((m) => m.mistake.includes('No shutdown before interface'))
      ).toBe(true);
    });

    it('returns empty array for correct sequence', () => {
      const commands = [
        'configure terminal',
        'interface gi0/0',
        'ip address 10.0.0.1 255.255.255.0',
        'no shutdown',
        'exit',
      ];
      const mistakes = detectCommonMistakes(commands);
      expect(mistakes.length).toBe(0);
    });
  });

  describe('analyzeCommandTiming', () => {
    it('detects normal command timing', () => {
      const commands = ['cmd1', 'cmd2', 'cmd3'];
      const timestamps = [1000, 6000, 12000]; // 5s and 6s intervals - normal
      const result = analyzeCommandTiming(commands, timestamps);
      expect(result.suspicious).toBe(false);
    });

    it('detects suspiciously fast commands', () => {
      const commands = ['cmd1', 'cmd2', 'cmd3', 'cmd4', 'cmd5'];
      const timestamps = [1000, 1050, 1100, 1150, 1200]; // 50ms intervals - too fast
      const result = analyzeCommandTiming(commands, timestamps);
      expect(result.suspicious).toBe(true);
    });

    it('detects perfect timing (too uniform)', () => {
      const commands = ['cmd1', 'cmd2', 'cmd3', 'cmd4'];
      const timestamps = [1000, 6000, 11000, 16000]; // Perfect 5s intervals
      const result = analyzeCommandTiming(commands, timestamps);
      expect(result.suspicious).toBe(true);
    });

    it('handles insufficient data', () => {
      const commands = ['cmd1'];
      const timestamps = [1000];
      const result = analyzeCommandTiming(commands, timestamps);
      expect(result.suspicious).toBe(false);
    });
  });
});

// ============================================================================
// INTEGRATION TESTS (Real-world scenarios)
// ============================================================================

describe('Integration Tests - Real Lab Scenarios', () => {
  it('validates complete VLAN trunk lab', () => {
    // Simulate user commands
    const commands = [
      'configure terminal',
      'vlan 10',
      'name Data',
      'exit',
      'interface gi0/1',
      'switchport mode trunk',
      'switchport trunk allowed vlan 10',
      'no shutdown',
      'exit',
      'show interfaces trunk',
    ];

    // Validate sequence
    const seqResult = validateSequence(getVlanTrunkSequence(), commands);
    expect(seqResult.valid).toBe(true);

    // Validate VLAN exists in show vlan output
    const vlanOutput = `
      VLAN Name                             Status    Ports
      ---- -------------------------------- --------- ----------
      1    default                          active    Gi0/0
      10   Data                             active    Gi0/1
    `;

    const vlanResult = validateVlanExists(vlanOutput, 10, 'Data');
    expect(vlanResult.passed).toBe(true);

    // Validate interface is configured in show interfaces output
    const interfaceOutput = `
      GigabitEthernet0/1 is up, line protocol is up
      Internet address is 10.0.0.1 255.255.255.0
      MTU 1500 bytes, BW 1000000 Kbit/sec
    `;

    const intfResult = validateInterfaceConfigured(interfaceOutput, 'Gi0/1', { status: 'up' });
    expect(intfResult.passed).toBe(true);
  });

  it('validates OSPF neighbor establishment', () => {
    const commands = [
      'configure terminal',
      'router ospf 1',
      'network 10.0.0.0 0.0.0.255 area 0',
      'exit',
      'exit',
      'show ip ospf neighbor',
    ];

    const seqResult = validateSequence(getOspfSequence(), commands);
    expect(seqResult.valid).toBe(true);

    const neighborOutput = `
      Neighbor ID     Pri   State           Dead Time   Address         Interface
      10.0.0.2          1   FULL/DR         39          10.0.0.2        Gi0/1
    `;

    const ospfResult = validateOSPFNeighbor(neighborOutput, '10.0.0.2', 'FULL');
    expect(ospfResult.passed).toBe(true);
  });

  it('detects configuration that actually worked', () => {
    const before = `show vlan brief
      VLAN Name                             Status    Ports
      ---- -------------------------------- --------- --------
      1    default                          active    Gi0/0, Gi0/1`;

    const after = `show vlan brief
      VLAN Name                             Status    Ports
      ---- -------------------------------- --------- --------
      1    default                          active    Gi0/0
      10   Data                             active    Gi0/1`;

    const result = compareStates(before, after, ['vlan']);
    expect(result.changed).toBe(true);
    expect(result.validationPassed).toBe(true);
  });
});
