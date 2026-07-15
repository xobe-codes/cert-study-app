/**
 * Device State Simulator - Comprehensive Tests (Phase 2)
 * 40+ tests for device creation, command simulation, output generation
 * Tests realistic scenarios and error handling
 */

import { describe, it, expect, beforeEach } from 'vitest';

import {
  createDevice,
  cloneDevice,
  getDeviceState,
  Device,
  getConfigValue,
  setConfigValue,
  interfaceExists,
  vlanExists,
  getOrCreateInterface,
  getOrCreateVlan,
  normalizeInterfaceName,
  calculateCost,
} from '../features/labs/deviceState';

import { executeCommand, executeCommands, CommandResult } from '../features/labs/commandSimulator';

import {
  showVlanBrief,
  showInterface,
  showInterfacesSummary,
  showIpRoute,
  showIpOspfNeighbor,
  showInterfacesTrunk,
  showIpNatTranslations,
  showRunningConfig,
} from '../features/labs/outputGenerator';

// ============================================================================
// DEVICE STATE CREATION & MANAGEMENT TESTS (10 tests)
// ============================================================================

describe('Device State Model', () => {
  let device: Device;

  beforeEach(() => {
    device = createDevice('router', 'TestRouter');
  });

  it('creates a router with default configuration', () => {
    expect(device.hostname).toBe('TestRouter');
    expect(device.type).toBe('router');
    expect(device.configMode).toBe('user');
    expect(device.ospf.enabled).toBe(false);
    expect(device.nat.enabled).toBe(false);
  });

  it('creates a switch device type', () => {
    const sw = createDevice('switch', 'TestSwitch');
    expect(sw.type).toBe('switch');
    expect(sw.vlans[1]).toBeDefined();
    expect(sw.vlans[1].name).toBe('default');
  });

  it('initializes with default interfaces', () => {
    expect(device.interfaces['gi0/1']).toBeDefined();
    expect(device.interfaces['gi0/2']).toBeDefined();
    expect(device.interfaces['fa0/0']).toBeDefined();
  });

  it('initializes with default VLAN 1', () => {
    expect(device.vlans[1]).toBeDefined();
    expect(device.vlans[1].name).toBe('default');
    expect(device.vlans[1].status).toBe('active');
  });

  it('clones device state correctly', () => {
    device.vlans[10] = {
      id: 10,
      name: 'Data',
      status: 'active',
      interfaces: [],
    };

    const cloned = cloneDevice(device);
    cloned.vlans[10].name = 'Modified';

    expect(device.vlans[10].name).toBe('Data');
    expect(cloned.vlans[10].name).toBe('Modified');
  });

  it('gets device state as JSON string', () => {
    const state = getDeviceState(device);
    expect(typeof state).toBe('string');

    const parsed = JSON.parse(state);
    expect(parsed.hostname).toBe('TestRouter');
    expect(parsed.vlans[1]).toBeDefined();
    expect(parsed.ospf).toBeDefined();
  });

  it('gets config values by path', () => {
    device.interfaces['gi0/1'].ip = '10.0.0.1';
    const ip = getConfigValue(device, 'interfaces.gi0/1.ip');
    expect(ip).toBe('10.0.0.1');
  });

  it('sets config values by path', () => {
    setConfigValue(device, 'interfaces.gi0/1.ip', '192.168.1.1');
    expect(device.interfaces['gi0/1'].ip).toBe('192.168.1.1');
  });

  it('checks interface existence', () => {
    expect(interfaceExists(device, 'gi0/1')).toBe(true);
    expect(interfaceExists(device, 'gi0/99')).toBe(false);
  });

  it('checks VLAN existence', () => {
    expect(vlanExists(device, 1)).toBe(true);
    expect(vlanExists(device, 999)).toBe(false);
  });
});

// ============================================================================
// INTERFACE NORMALIZATION TESTS (5 tests)
// ============================================================================

describe('Interface Normalization', () => {
  it('normalizes GigabitEthernet to gi', () => {
    expect(normalizeInterfaceName('GigabitEthernet0/1')).toBe('gi0/1');
    expect(normalizeInterfaceName('Gi0/1')).toBe('gi0/1');
  });

  it('normalizes FastEthernet to fa', () => {
    expect(normalizeInterfaceName('FastEthernet0/0')).toBe('fa0/0');
    expect(normalizeInterfaceName('Fa0/0')).toBe('fa0/0');
  });

  it('normalizes Serial to se', () => {
    expect(normalizeInterfaceName('Serial0/0')).toBe('se0/0');
    expect(normalizeInterfaceName('Se0/0')).toBe('se0/0');
  });

  it('handles lowercase input', () => {
    expect(normalizeInterfaceName('gi0/1')).toBe('gi0/1');
    expect(normalizeInterfaceName('fa0/0')).toBe('fa0/0');
  });

  it('returns unknown interface types as-is', () => {
    const result = normalizeInterfaceName('Unknown0/0');
    expect(result).toBe('unknown0/0');
  });
});

// ============================================================================
// COMMAND EXECUTION TESTS (15 tests)
// ============================================================================

describe('Command Execution - Configuration Mode', () => {
  let device: Device;

  beforeEach(() => {
    device = createDevice('router', 'Router1');
  });

  it('enters configuration mode', () => {
    const result = executeCommand(device, 'configure terminal');
    expect(result.success).toBe(true);
    expect(device.configMode).toBe('global-config');
  });

  it('rejects config commands outside config mode', () => {
    device.configMode = 'user'; // Start in user mode
    const result = executeCommand(device, 'vlan 10');
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('INVALID_MODE');
  });

  it('exits configuration mode', () => {
    device.configMode = 'global-config';
    const result = executeCommand(device, 'exit');
    expect(result.success).toBe(true);
    expect(device.configMode).toBe('privileged');
  });

  it('creates VLAN with valid ID', () => {
    device.configMode = 'global-config';
    const result = executeCommand(device, 'vlan 10');
    expect(result.success).toBe(true);
    expect(device.vlans[10]).toBeDefined();
    expect(device.configMode).toBe('vlan-config');
  });

  it('rejects VLAN with invalid ID', () => {
    device.configMode = 'global-config';
    const result = executeCommand(device, 'vlan 5000');
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('INVALID_VLAN_ID');
  });

  it('enters interface config mode', () => {
    device.configMode = 'global-config';
    const result = executeCommand(device, 'interface gi0/1');
    expect(result.success).toBe(true);
    expect(device.configMode).toBe('interface-config');
    expect(device.currentInterface).toBe('gi0/1');
  });

  it('enables OSPF process', () => {
    device.configMode = 'global-config';
    const result = executeCommand(device, 'router ospf 1');
    expect(result.success).toBe(true);
    expect(device.ospf.enabled).toBe(true);
    expect(device.ospf.processId).toBe(1);
    expect(device.configMode).toBe('router-config');
  });
});

describe('Command Execution - Interface Configuration', () => {
  let device: Device;

  beforeEach(() => {
    device = createDevice('router', 'Router1');
    device.configMode = 'global-config';
    executeCommand(device, 'interface gi0/1');
  });

  it('configures IP address on interface', () => {
    const result = executeCommand(device, 'ip address 10.0.0.1 255.255.255.0');
    expect(result.success).toBe(true);
    expect(device.interfaces['gi0/1'].ip).toBe('10.0.0.1');
    expect(device.interfaces['gi0/1'].mask).toBe('255.255.255.0');
  });

  it('enables interface with no shutdown', () => {
    const result = executeCommand(device, 'no shutdown');
    expect(result.success).toBe(true);
    expect(device.interfaces['gi0/1'].status).toBe('up');
    expect(device.interfaces['gi0/1'].protocol).toBe('up');
  });

  it('shuts down interface', () => {
    executeCommand(device, 'no shutdown');
    const result = executeCommand(device, 'shutdown');
    expect(result.success).toBe(true);
    expect(device.interfaces['gi0/1'].status).toBe('administratively down');
  });

  it('sets interface description', () => {
    const result = executeCommand(device, 'description Link to Core');
    expect(result.success).toBe(true);
    expect(device.interfaces['gi0/1'].description).toBe('Link to Core');
  });

  it('configures interface as trunk', () => {
    const result = executeCommand(device, 'switchport mode trunk');
    expect(result.success).toBe(true);
    expect(device.interfaces['gi0/1'].switchportMode).toBe('trunk');
  });

  it('configures interface as access', () => {
    const result = executeCommand(device, 'switchport mode access');
    expect(result.success).toBe(true);
    expect(device.interfaces['gi0/1'].switchportMode).toBe('access');
  });
});

describe('Command Execution - OSPF Configuration', () => {
  let device: Device;

  beforeEach(() => {
    device = createDevice('router', 'Router1');
    device.configMode = 'global-config';
    executeCommand(device, 'router ospf 1');
  });

  it('adds network statement to OSPF', () => {
    const result = executeCommand(device, 'network 10.0.0.0 0.0.0.255 area 0');
    expect(result.success).toBe(true);
    expect(device.ospf.area0?.networks).toContain('10.0.0.0 0.0.0.255');
  });

  it('adds multiple network statements', () => {
    executeCommand(device, 'network 10.0.0.0 0.0.0.255 area 0');
    const result = executeCommand(device, 'network 192.168.1.0 0.0.0.255 area 0');
    expect(result.success).toBe(true);
    expect(device.ospf.area0?.networks).toHaveLength(2);
  });

  it('rejects invalid network statement', () => {
    const result = executeCommand(device, 'network 10.0.0.0');
    expect(result.success).toBe(false);
  });
});

describe('Command Execution - NAT Configuration', () => {
  let device: Device;

  beforeEach(() => {
    device = createDevice('router', 'Router1');
    device.configMode = 'global-config';

    // Create interface first
    executeCommand(device, 'interface gi0/1');
    executeCommand(device, 'no shutdown');
    device.configMode = 'global-config';

    // Create ACL
    executeCommand(device, 'access-list 1 permit 10.0.0.0 0.0.0.255');
  });

  it('creates ACL entry', () => {
    const result = executeCommand(device, 'access-list 1 permit 10.0.0.0 0.0.0.255');
    expect(result.success).toBe(true);
    expect(device.nat.accessLists).toHaveLength(1);
    expect(device.nat.accessLists[0].id).toBe(1);
  });

  it('configures PAT with valid ACL', () => {
    const result = executeCommand(device, 'ip nat inside source list 1 interface gi0/1 overload');
    expect(result.success).toBe(true);
    expect(device.nat.enabled).toBe(true);
    expect(device.nat.rules).toHaveLength(1);
  });

  it('rejects PAT with non-existent ACL', () => {
    const result = executeCommand(device, 'ip nat inside source list 99 interface gi0/1 overload');
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('ACL_NOT_FOUND');
  });

  it('rejects PAT with non-existent interface', () => {
    const result = executeCommand(device, 'ip nat inside source list 1 interface gi0/99 overload');
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('INTERFACE_NOT_FOUND');
  });
});

// ============================================================================
// SHOW COMMAND OUTPUT TESTS (8 tests)
// ============================================================================

describe('Show Command Output Generation', () => {
  let device: Device;

  beforeEach(() => {
    device = createDevice('router', 'Router1');
  });

  it('generates show vlan brief output', () => {
    device.vlans[10] = {
      id: 10,
      name: 'Data',
      status: 'active',
      interfaces: [],
    };

    const output = showVlanBrief(device);
    expect(output).toContain('VLAN Name');
    expect(output).toContain('10');
    expect(output).toContain('Data');
    expect(output).toContain('active');
  });

  it('generates show interface output', () => {
    device.interfaces['gi0/1'].ip = '10.0.0.1';
    device.interfaces['gi0/1'].mask = '255.255.255.0';
    device.interfaces['gi0/1'].status = 'up';
    device.interfaces['gi0/1'].protocol = 'up';

    const output = showInterface(device, 'gi0/1');
    expect(output).toContain('gi0/1 is up');
    expect(output).toContain('10.0.0.1');
  });

  it('generates show interfaces summary', () => {
    device.interfaces['gi0/1'].ip = '192.168.1.1';
    device.interfaces['gi0/1'].status = 'up';
    device.interfaces['gi0/1'].protocol = 'up';

    const output = showInterfacesSummary(device);
    expect(output).toContain('Interface');
    expect(output).toContain('gi0/1');
    expect(output).toContain('192.168.1.1');
  });

  it('generates show ip route output', () => {
    device.interfaces['gi0/1'].ip = '10.0.0.1';
    device.interfaces['gi0/1'].mask = '255.255.255.0';
    device.interfaces['gi0/1'].status = 'up';

    const output = showIpRoute(device);
    expect(output).toContain('Codes:');
    expect(output).toContain('10.0.0.0/24');
    expect(output).toContain('gi0/1');
  });

  it('generates show ip ospf neighbor output when OSPF not enabled', () => {
    const output = showIpOspfNeighbor(device);
    expect(output).toContain('% OSPF routing process is not enabled');
  });

  it('generates show ip ospf neighbor with neighbors', () => {
    device.ospf.enabled = true;
    device.ospf.neighbors.push({
      routerId: '10.0.0.2',
      area: 0,
      state: 'FULL',
      interface: 'gi0/1',
      address: '10.0.0.2',
    });

    const output = showIpOspfNeighbor(device);
    expect(output).toContain('10.0.0.2');
    expect(output).toContain('FULL');
    expect(output).toContain('gi0/1');
  });

  it('generates show interfaces trunk output', () => {
    device.interfaces['gi0/1'].switchportMode = 'trunk';
    device.interfaces['gi0/1'].trunkAllowedVlans = [1, 10, 20];
    device.interfaces['gi0/1'].status = 'up';

    const output = showInterfacesTrunk(device);
    expect(output).toContain('trunking');
    expect(output).toContain('gi0/1');
    expect(output).toContain('1,10,20');
  });

  it('generates show ip nat translations output', () => {
    device.nat.enabled = true;
    const output = showIpNatTranslations(device);
    expect(output).toContain('Pro Inside global');
  });
});

// ============================================================================
// REALISTIC SCENARIO TESTS (10 tests)
// ============================================================================

describe('Realistic Lab Scenarios', () => {
  it('VLAN Trunk Lab: Full workflow', () => {
    const device = createDevice('switch', 'Switch1');
    const before = cloneDevice(device);

    // Step 1: Create VLAN
    device.configMode = 'global-config';
    let result = executeCommand(device, 'vlan 10');
    expect(result.success).toBe(true);

    // Step 2: Configure trunk interface
    device.configMode = 'global-config';
    result = executeCommand(device, 'interface gi0/1');
    expect(result.success).toBe(true);

    result = executeCommand(device, 'switchport mode trunk');
    expect(result.success).toBe(true);

    result = executeCommand(device, 'switchport trunk allowed vlan 10');
    expect(result.success).toBe(true);

    result = executeCommand(device, 'no shutdown');
    expect(result.success).toBe(true);

    // Verify state changed
    expect(getDeviceState(device)).not.toBe(getDeviceState(before));
    expect(device.interfaces['gi0/1'].switchportMode).toBe('trunk');
    expect(device.vlans[10]).toBeDefined();
  });

  it('OSPF Lab: Adjacency establishment', () => {
    const device = createDevice('router', 'Router1');

    // Configure OSPF
    device.configMode = 'global-config';
    executeCommand(device, 'router ospf 1');
    executeCommand(device, 'network 10.0.0.0 0.0.0.255 area 0');

    // Configure interface
    device.configMode = 'global-config';
    executeCommand(device, 'interface gi0/1');
    executeCommand(device, 'ip address 10.0.0.1 255.255.255.0');
    executeCommand(device, 'no shutdown');

    // Simulate neighbor discovery
    device.ospf.neighbors.push({
      routerId: '10.0.0.2',
      area: 0,
      state: 'FULL',
      interface: 'gi0/1',
      address: '10.0.0.2',
      priority: 128,
    });

    // Verify configuration
    expect(device.ospf.enabled).toBe(true);
    expect(device.ospf.area0?.networks).toContain('10.0.0.0 0.0.0.255');
    expect(device.ospf.neighbors).toHaveLength(1);

    // Verify output
    const output = showIpOspfNeighbor(device);
    expect(output).toContain('10.0.0.2');
    expect(output).toContain('FULL');
  });

  it('NAT Lab: PAT configuration', () => {
    const device = createDevice('router', 'Router1');

    device.configMode = 'global-config';

    // Create inside interface
    executeCommand(device, 'interface gi0/1');
    executeCommand(device, 'ip address 10.0.0.1 255.255.255.0');
    executeCommand(device, 'ip nat inside');
    executeCommand(device, 'no shutdown');

    // Create outside interface
    device.configMode = 'global-config';
    executeCommand(device, 'interface gi0/2');
    executeCommand(device, 'ip address 203.0.113.1 255.255.255.0');
    executeCommand(device, 'ip nat outside');
    executeCommand(device, 'no shutdown');

    // Configure ACL
    device.configMode = 'global-config';
    executeCommand(device, 'access-list 1 permit 10.0.0.0 0.0.0.255');

    // Configure PAT
    device.configMode = 'global-config';
    const result = executeCommand(device, 'ip nat inside source list 1 interface gi0/2 overload');

    expect(result.success).toBe(true);
    expect(device.nat.enabled).toBe(true);
    expect(device.interfaces['gi0/1'].isNatInside).toBe(true);
    expect(device.interfaces['gi0/2'].isNatOutside).toBe(true);
  });

  it('Before/After State Comparison: VLAN creation', () => {
    const device = createDevice('switch', 'Switch1');
    const before = cloneDevice(device);

    // Create VLAN
    device.configMode = 'global-config';
    executeCommand(device, 'vlan 10');
    device.vlans[10].name = 'Data';

    // Get states
    const beforeState = getDeviceState(before);
    const afterState = getDeviceState(device);

    expect(beforeState).not.toBe(afterState);

    const beforeObj = JSON.parse(beforeState);
    const afterObj = JSON.parse(afterState);

    expect(beforeObj.vlans['10']).toBeUndefined();
    expect(afterObj.vlans['10']).toBeDefined();
  });

  it('Multiple command execution', () => {
    const device = createDevice('router', 'Router1');

    const commands = [
      'enable',
      'configure terminal',
      'router ospf 1',
      'network 10.0.0.0 0.0.0.255 area 0',
      'exit',
      'configure terminal', // Re-enter config mode
      'interface gi0/1',
      'ip address 10.0.0.1 255.255.255.0',
      'no shutdown',
      'exit',
      'exit',
    ];

    const results = executeCommands(device, commands);

    expect(results).toHaveLength(commands.length);
    // Check that all commands succeeded
    const failures = results.filter((r) => !r.success);
    if (failures.length > 0) {
      console.log('Failed commands:', failures);
    }
    expect(results.every((r) => r.success)).toBe(true);
    expect(device.ospf.enabled).toBe(true);
    expect(device.interfaces['gi0/1'].ip).toBe('10.0.0.1');
  });

  it('Error handling: Wrong mode for command', () => {
    const device = createDevice('router', 'Router1');
    device.configMode = 'user';

    const result = executeCommand(device, 'vlan 10');
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('INVALID_MODE');
  });

  it('Error handling: Non-existent VLAN reference', () => {
    const device = createDevice('switch', 'Switch1');
    device.configMode = 'global-config';
    executeCommand(device, 'interface gi0/1');

    const result = executeCommand(device, 'switchport access vlan 999');
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('VLAN_NOT_FOUND');
  });

  it('Trunk VLAN validation', () => {
    const device = createDevice('switch', 'Switch1');
    device.configMode = 'global-config';

    // Create VLANs
    executeCommand(device, 'vlan 10');
    device.configMode = 'global-config';
    executeCommand(device, 'vlan 20');

    // Configure trunk
    device.configMode = 'global-config';
    executeCommand(device, 'interface gi0/1');
    executeCommand(device, 'switchport mode trunk');

    // Add valid VLANs to trunk
    const result = executeCommand(device, 'switchport trunk allowed vlan 10,20');
    expect(result.success).toBe(true);
    expect(device.interfaces['gi0/1'].trunkAllowedVlans).toContain(10);
    expect(device.interfaces['gi0/1'].trunkAllowedVlans).toContain(20);
  });

  it('Running config generation', () => {
    const device = createDevice('router', 'Router1');

    device.configMode = 'global-config';
    executeCommand(device, 'interface gi0/1');
    executeCommand(device, 'ip address 10.0.0.1 255.255.255.0');
    executeCommand(device, 'no shutdown');

    device.configMode = 'global-config';
    executeCommand(device, 'router ospf 1');
    executeCommand(device, 'network 10.0.0.0 0.0.0.255 area 0');

    const config = showRunningConfig(device);
    expect(config).toContain('hostname Router1');
    expect(config).toContain('router ospf 1');
    expect(config).toContain('10.0.0.1');
  });
});

// ============================================================================
// EDGE CASES & ERROR CONDITIONS (5 tests)
// ============================================================================

describe('Edge Cases and Error Conditions', () => {
  let device: Device;

  beforeEach(() => {
    device = createDevice('router', 'Router1');
  });

  it('handles unknown commands gracefully', () => {
    device.configMode = 'global-config';
    const result = executeCommand(device, 'banana hammock');
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('UNKNOWN_COMMAND');
  });

  it('rejects invalid VLAN IDs', () => {
    device.configMode = 'global-config';
    expect(executeCommand(device, 'vlan 0').success).toBe(false);
    expect(executeCommand(device, 'vlan 4095').success).toBe(false);
    expect(executeCommand(device, 'vlan 5000').success).toBe(false);
  });

  it('handles empty/whitespace commands', () => {
    device.configMode = 'global-config';
    expect(executeCommand(device, '').success).toBe(false);
    expect(executeCommand(device, '   ').success).toBe(false);
  });

  it('normalizes case and spacing in commands', () => {
    device.configMode = 'global-config';

    // These should all succeed and be treated as identical
    expect(executeCommand(device, 'CONFIGURE TERMINAL').success).toBe(true);
    device.configMode = 'user';

    expect(executeCommand(device, 'configure  terminal').success).toBe(true);
    device.configMode = 'user';

    expect(executeCommand(device, 'Configure Terminal').success).toBe(true);
  });

  it('calculates interface costs correctly', () => {
    const cost1Gbps = calculateCost(1000000000); // 1 Gbps
    const cost100Mbps = calculateCost(100000000); // 100 Mbps
    const cost10Mbps = calculateCost(10000000); // 10 Mbps

    expect(cost1Gbps).toBeLessThan(cost100Mbps);
    expect(cost100Mbps).toBeLessThan(cost10Mbps);
    expect(cost100Mbps).toBe(1); // Reference bandwidth / 100Mbps = 1
  });
});
