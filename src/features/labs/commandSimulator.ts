/**
 * Command Simulator - Executes IOS commands and updates device state
 * Handles realistic command execution with state validation
 */

import {
  Device,
  InterfaceState,
  VlanConfig,
  OSPFNeighbor,
  OSPFState,
  getOrCreateInterface,
  getOrCreateVlan,
  interfaceExists,
  vlanExists,
  normalizeInterfaceName,
  calculateCost,
} from './deviceState';

// ============================================================================
// TYPES
// ============================================================================

export interface CommandResult {
  success: boolean;
  output: string;
  stateChanged: boolean;
  error?: string;
  errorCode?: string;
}

// ============================================================================
// COMMAND EXECUTION ENGINE
// ============================================================================

export class CommandSimulator {
  private device: Device;
  private originalCommand: string = '';

  constructor(device: Device) {
    this.device = device;
  }

  /**
   * Main command execution method
   */
  execute(command: string): CommandResult {
    this.originalCommand = command; // Store original for case-sensitive values
    const normalized = this.normalizeCommand(command);

    if (!normalized) {
      return {
        success: false,
        output: '',
        stateChanged: false,
      };
    }

    try {
      return this.executeCommand(normalized);
    } catch (error) {
      return {
        success: false,
        output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        stateChanged: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute command based on type
   */
  private executeCommand(command: string): CommandResult {
    // Configuration mode commands
    if (command === 'configure terminal' || command === 'config t') {
      this.device.configMode = 'global-config';
      return {
        success: true,
        output: '',
        stateChanged: false,
      };
    }

    if (command === 'exit' || command === 'end') {
      if (this.device.configMode?.includes('config')) {
        this.device.configMode = 'privileged';
      }
      return {
        success: true,
        output: '',
        stateChanged: false,
      };
    }

    // User must be in config mode for config commands
    if (
      command.startsWith('vlan ') ||
      command.startsWith('interface ') ||
      command.startsWith('router ospf') ||
      command.startsWith('ip nat')
    ) {
      if (!this.device.configMode?.includes('config')) {
        return {
          success: false,
          output: "% Invalid input detected at '^' marker.",
          stateChanged: false,
          error: 'Must be in configuration mode',
          errorCode: 'INVALID_MODE',
        };
      }
    }

    // VLAN commands
    if (command.startsWith('vlan ')) {
      return this.handleVlanCommand(command);
    }

    // Interface commands
    if (command.startsWith('interface ')) {
      return this.handleInterfaceCommand(command);
    }

    // OSPF commands
    if (command.startsWith('router ospf')) {
      return this.handleOSPFCommand(command);
    }

    // Network statement (in OSPF config)
    if (command.startsWith('network ')) {
      return this.handleNetworkStatement(command);
    }

    // Interface config mode commands
    if (this.device.configMode === 'interface-config') {
      return this.handleInterfaceConfig(command);
    }

    // OSPF config mode commands
    if (this.device.configMode === 'router-config') {
      return this.handleRouterConfig(command);
    }

    // Show commands (work in privileged or config mode)
    if (command.startsWith('show ')) {
      return this.handleShowCommand(command);
    }

    // Enable/disable commands
    if (command === 'enable') {
      this.device.configMode = 'privileged';
      return {
        success: true,
        output: 'Password:',
        stateChanged: false,
      };
    }

    // NAT commands
    if (command.startsWith('ip nat')) {
      return this.handleNATCommand(command);
    }

    // Access-list commands
    if (command.startsWith('access-list')) {
      return this.handleAccessList(command);
    }

    // Unknown command
    return {
      success: false,
      output: `% Unknown command or computer name, not confirmed.`,
      stateChanged: false,
      error: 'Unknown command',
      errorCode: 'UNKNOWN_COMMAND',
    };
  }

  /**
   * Handle VLAN commands
   */
  private handleVlanCommand(command: string): CommandResult {
    const match = command.match(/^vlan\s+(\d+)$/);
    if (!match) {
      return {
        success: false,
        output: '% Invalid input detected.',
        stateChanged: false,
      };
    }

    const vlanId = parseInt(match[1], 10);
    if (vlanId < 1 || vlanId > 4094) {
      return {
        success: false,
        output: '% VLAN ID out of range (1-4094)',
        stateChanged: false,
        error: 'VLAN ID out of range',
        errorCode: 'INVALID_VLAN_ID',
      };
    }

    const vlan = getOrCreateVlan(this.device, vlanId);
    this.device.configMode = 'vlan-config'; // Move to VLAN config mode
    return {
      success: true,
      output: '',
      stateChanged: !this.device.vlans[vlanId],
    };
  }

  /**
   * Handle interface commands
   */
  private handleInterfaceCommand(command: string): CommandResult {
    const match = command.match(/^interface\s+(\S+)$/);
    if (!match) {
      return {
        success: false,
        output: '% Invalid input detected.',
        stateChanged: false,
      };
    }

    const interfaceName = normalizeInterfaceName(match[1]);
    const iface = getOrCreateInterface(this.device, interfaceName);

    this.device.currentInterface = interfaceName;
    this.device.configMode = 'interface-config';

    return {
      success: true,
      output: '',
      stateChanged: false,
    };
  }

  /**
   * Handle OSPF router command
   */
  private handleOSPFCommand(command: string): CommandResult {
    const match = command.match(/^router ospf\s+(\d+)$/);
    if (!match) {
      return {
        success: false,
        output: '% Invalid input detected.',
        stateChanged: false,
      };
    }

    const processId = parseInt(match[1], 10);
    this.device.ospf.processId = processId;
    this.device.ospf.enabled = true;
    this.device.configMode = 'router-config';
    this.device.currentRouter = 'ospf';

    return {
      success: true,
      output: '',
      stateChanged: true,
    };
  }

  /**
   * Handle network statement in OSPF config
   */
  private handleNetworkStatement(command: string): CommandResult {
    if (this.device.configMode !== 'router-config' || this.device.currentRouter !== 'ospf') {
      return {
        success: false,
        output: '% Invalid input detected at "^" marker.',
        stateChanged: false,
        error: 'Not in router OSPF config mode',
        errorCode: 'WRONG_CONFIG_MODE',
      };
    }

    const match = command.match(/^network\s+(\S+)\s+(\S+)\s+area\s+(\d+)$/);
    if (!match) {
      return {
        success: false,
        output: '% Invalid input detected.',
        stateChanged: false,
      };
    }

    const network = match[1];
    const wildcard = match[2];
    const area = parseInt(match[3], 10);

    if (!this.device.ospf.area0) {
      this.device.ospf.area0 = { networks: [] };
    }

    const networkStatement = `${network} ${wildcard}`;
    const alreadyExists = this.device.ospf.area0.networks.includes(networkStatement);

    if (!alreadyExists) {
      this.device.ospf.area0.networks.push(networkStatement);
    }

    return {
      success: true,
      output: '',
      stateChanged: !alreadyExists,
    };
  }

  /**
   * Handle interface configuration commands
   */
  private handleInterfaceConfig(command: string): CommandResult {
    if (!this.device.currentInterface) {
      return {
        success: false,
        output: '% Invalid input detected.',
        stateChanged: false,
      };
    }

    const iface = this.device.interfaces[this.device.currentInterface];
    if (!iface) {
      return {
        success: false,
        output: `% Interface ${this.device.currentInterface} not found.`,
        stateChanged: false,
        error: 'Interface not found',
        errorCode: 'INTERFACE_NOT_FOUND',
      };
    }

    // IP address configuration
    const ipMatch = command.match(/^ip\s+address\s+(\S+)\s+(\S+)$/);
    if (ipMatch) {
      iface.ip = ipMatch[1];
      iface.mask = ipMatch[2];
      return {
        success: true,
        output: '',
        stateChanged: true,
      };
    }

    // No shutdown
    if (command === 'no shutdown') {
      iface.status = 'up';
      iface.protocol = 'up';
      return {
        success: true,
        output: '',
        stateChanged: true,
      };
    }

    // Shutdown
    if (command === 'shutdown') {
      iface.status = 'administratively down';
      iface.protocol = 'down';
      return {
        success: true,
        output: '',
        stateChanged: true,
      };
    }

    // Description (preserve original case for description value)
    if (command.startsWith('description ')) {
      // Extract description from original command to preserve case
      const descValue = this.originalCommand.substring(this.originalCommand.indexOf('description ') + 12).trim();
      iface.description = descValue;
      return {
        success: true,
        output: '',
        stateChanged: true,
      };
    }

    // Switchport mode
    const switchMatch = command.match(/^switchport\s+mode\s+(access|trunk)$/);
    if (switchMatch) {
      iface.switchportMode = switchMatch[1] as 'access' | 'trunk';
      return {
        success: true,
        output: '',
        stateChanged: true,
      };
    }

    // Switchport access VLAN
    const accessMatch = command.match(/^switchport\s+access\s+vlan\s+(\d+)$/);
    if (accessMatch) {
      const vlanId = parseInt(accessMatch[1], 10);
      if (!vlanExists(this.device, vlanId)) {
        return {
          success: false,
          output: `% VLAN ${vlanId} doesn't exist.`,
          stateChanged: false,
          error: 'VLAN does not exist',
          errorCode: 'VLAN_NOT_FOUND',
        };
      }
      iface.accessVlan = vlanId;
      return {
        success: true,
        output: '',
        stateChanged: true,
      };
    }

    // Switchport trunk allowed vlan
    const trunkMatch = command.match(/^switchport\s+trunk\s+allowed\s+vlan\s+(.+)$/);
    if (trunkMatch) {
      const vlanSpec = trunkMatch[1];
      const vlans = this.parseVlanList(vlanSpec);

      // Verify all VLANs exist
      for (const vlan of vlans) {
        if (!vlanExists(this.device, vlan)) {
          return {
            success: false,
            output: `% VLAN ${vlan} doesn't exist.`,
            stateChanged: false,
            error: 'VLAN does not exist',
            errorCode: 'VLAN_NOT_FOUND',
          };
        }
      }

      iface.trunkAllowedVlans = vlans;
      return {
        success: true,
        output: '',
        stateChanged: true,
      };
    }

    // IP NAT inside/outside
    if (command === 'ip nat inside') {
      iface.isNatInside = true;
      iface.isNatOutside = false;
      return {
        success: true,
        output: '',
        stateChanged: true,
      };
    }

    if (command === 'ip nat outside') {
      iface.isNatOutside = true;
      iface.isNatInside = false;
      return {
        success: true,
        output: '',
        stateChanged: true,
      };
    }

    return {
      success: false,
      output: '% Invalid input detected.',
      stateChanged: false,
    };
  }

  /**
   * Handle OSPF router configuration commands
   */
  private handleRouterConfig(command: string): CommandResult {
    // Network statement already handled separately
    if (command.startsWith('network ')) {
      return this.handleNetworkStatement(command);
    }

    return {
      success: false,
      output: '% Invalid input detected.',
      stateChanged: false,
    };
  }

  /**
   * Handle show commands
   */
  private handleShowCommand(command: string): CommandResult {
    // Show VLAN brief
    if (command === 'show vlan brief' || command === 'show vlan') {
      return {
        success: true,
        output: this.generateShowVlanBrief(),
        stateChanged: false,
      };
    }

    // Show interfaces
    if (command.startsWith('show interfaces')) {
      const match = command.match(/^show interfaces\s+(\S+)$/);
      if (match) {
        const ifaceName = normalizeInterfaceName(match[1]);
        if (!interfaceExists(this.device, ifaceName)) {
          return {
            success: false,
            output: `% Interface ${ifaceName} does not exist.`,
            stateChanged: false,
            error: 'Interface not found',
            errorCode: 'INTERFACE_NOT_FOUND',
          };
        }
        return {
          success: true,
          output: this.generateShowInterfaces(ifaceName),
          stateChanged: false,
        };
      }
      return {
        success: true,
        output: this.generateShowInterfacesSummary(),
        stateChanged: false,
      };
    }

    // Show IP route
    if (command === 'show ip route' || command === 'show ip route ospf') {
      return {
        success: true,
        output: this.generateShowIpRoute(),
        stateChanged: false,
      };
    }

    // Show IP OSPF neighbor
    if (command === 'show ip ospf neighbor' || command === 'show ospf neighbor') {
      if (!this.device.ospf.enabled) {
        return {
          success: true,
          output: '% OSPF routing process is not enabled.',
          stateChanged: false,
        };
      }
      return {
        success: true,
        output: this.generateShowOSPFNeighbor(),
        stateChanged: false,
      };
    }

    // Show interfaces trunk
    if (command === 'show interfaces trunk') {
      return {
        success: true,
        output: this.generateShowInterfacesTrunk(),
        stateChanged: false,
      };
    }

    // Show IP NAT translations
    if (command === 'show ip nat translations') {
      return {
        success: true,
        output: this.generateShowNATTranslations(),
        stateChanged: false,
      };
    }

    return {
      success: false,
      output: "% Invalid input detected at '^' marker.",
      stateChanged: false,
      error: 'Unknown show command',
      errorCode: 'UNKNOWN_COMMAND',
    };
  }

  /**
   * Handle NAT commands
   */
  private handleNATCommand(command: string): CommandResult {
    // IP nat inside source list X interface Y overload (PAT)
    const patMatch = command.match(
      /^ip\s+nat\s+inside\s+source\s+list\s+(\d+)\s+interface\s+(\S+)\s+overload$/
    );
    if (patMatch) {
      const aclId = parseInt(patMatch[1], 10);
      const interfaceName = normalizeInterfaceName(patMatch[2]);

      // Verify ACL exists
      const acl = this.device.nat.accessLists.find((a) => a.id === aclId);
      if (!acl) {
        return {
          success: false,
          output: `% Access-list ${aclId} doesn't exist.`,
          stateChanged: false,
          error: 'ACL not found',
          errorCode: 'ACL_NOT_FOUND',
        };
      }

      // Verify interface exists
      if (!interfaceExists(this.device, interfaceName)) {
        return {
          success: false,
          output: `% Interface ${interfaceName} doesn't exist.`,
          stateChanged: false,
          error: 'Interface not found',
          errorCode: 'INTERFACE_NOT_FOUND',
        };
      }

      this.device.nat.enabled = true;
      this.device.nat.rules.push({
        id: `pat-${aclId}-${interfaceName}`,
        type: 'dynamic-overload',
        accessListId: aclId,
        interface: interfaceName,
      });

      return {
        success: true,
        output: '',
        stateChanged: true,
      };
    }

    return {
      success: false,
      output: '% Invalid input detected.',
      stateChanged: false,
    };
  }

  /**
   * Handle access-list commands
   */
  private handleAccessList(command: string): CommandResult {
    const match = command.match(/^access-list\s+(\d+)\s+(permit|deny)\s+(\S+)\s+(\S+)(?:\s+(\S+))?$/);
    if (!match) {
      return {
        success: false,
        output: '% Invalid input detected.',
        stateChanged: false,
      };
    }

    const aclId = parseInt(match[1], 10);
    const action = match[2] as 'permit' | 'deny';
    const protocol = match[3];
    const source = match[4];
    const wildcard = match[5];

    let acl = this.device.nat.accessLists.find((a) => a.id === aclId);
    if (!acl) {
      acl = {
        id: aclId,
        entries: [],
      };
      this.device.nat.accessLists.push(acl);
    }

    acl.entries.push({
      action,
      protocol,
      source,
      wildcard,
    });

    return {
      success: true,
      output: '',
      stateChanged: true,
    };
  }

  // ============================================================================
  // OUTPUT GENERATORS (moved to separate module, but keep stubs here)
  // ============================================================================

  private generateShowVlanBrief(): string {
    let output = 'VLAN Name                             Status    Ports\n';
    output += '---- -------------------------------- --------- --------------------------\n';

    for (const vlan of Object.values(this.device.vlans)) {
      const vlanId = String(vlan.id).padEnd(4);
      const name = vlan.name.padEnd(32);
      const status = vlan.status.padEnd(9);
      const ports = (vlan.interfaces || []).join(',');
      output += `${vlanId} ${name} ${status} ${ports}\n`;
    }

    return output;
  }

  private generateShowInterfaces(ifaceName: string): string {
    const iface = this.device.interfaces[ifaceName];
    if (!iface) return '';

    let output = `${iface.name} is ${iface.status}, line protocol is ${iface.protocol}\n`;
    output += `  Hardware is Gigabit Ethernet, address is 0000.0000.0001\n`;
    if (iface.ip && iface.mask) {
      output += `  Internet address is ${iface.ip}/${this.maskToCIDR(iface.mask)}\n`;
    }
    output += `  MTU ${iface.mtu} bytes, BW ${iface.bandwidth} Kbit/sec\n`;
    return output;
  }

  private generateShowInterfacesSummary(): string {
    let output = 'Interface      IP-Address      Status                Protocol\n';
    for (const iface of Object.values(this.device.interfaces)) {
      const name = iface.name.padEnd(14);
      const ip = (iface.ip || '').padEnd(15);
      const status = iface.status.padEnd(20);
      const protocol = iface.protocol;
      output += `${name} ${ip} ${status} ${protocol}\n`;
    }
    return output;
  }

  private generateShowIpRoute(): string {
    let output = 'Codes: C - connected, S - static, D - EIGRP, O - OSPF, B - BGP\n';
    output += '\nGateway of last resort is not set\n\n';

    // Connected routes
    for (const iface of Object.values(this.device.interfaces)) {
      if (iface.ip && iface.mask && iface.status === 'up') {
        output += `C       ${iface.ip}/${this.maskToCIDR(iface.mask)} is directly connected, ${iface.name}\n`;
      }
    }

    // OSPF routes
    for (const route of this.device.routing.routes) {
      output += `O       ${route.destination}/${this.maskToCIDR(route.mask)} [${route.distance}/${route.metric}] via ${route.nextHop}, ${route.interface}\n`;
    }

    return output;
  }

  private generateShowOSPFNeighbor(): string {
    let output = 'Neighbor ID     Pri   State           Dead Time   Address         Interface\n';

    for (const neighbor of this.device.ospf.neighbors) {
      const routerId = neighbor.routerId.padEnd(15);
      const pri = String(neighbor.priority || 1).padEnd(5);
      const state = neighbor.state.padEnd(15);
      const deadTime = String(neighbor.deadTime || 40).padEnd(11);
      const address = (neighbor.address || '').padEnd(15);
      const iface = neighbor.interface || '';
      output += `${routerId} ${pri} ${state} ${deadTime} ${address} ${iface}\n`;
    }

    if (this.device.ospf.neighbors.length === 0) {
      return output;
    }

    return output;
  }

  private generateShowInterfacesTrunk(): string {
    let output = 'Port        Mode       Encapsulation  Status        Native vlan\n';
    output += '----------- ---------- --------------- ------------- -----------\n';

    for (const iface of Object.values(this.device.interfaces)) {
      if (iface.switchportMode === 'trunk') {
        const port = iface.name.padEnd(11);
        const mode = 'trunk'.padEnd(10);
        const encap = '802.1q'.padEnd(15);
        const status = (iface.status === 'up' ? 'trunking' : 'down').padEnd(13);
        const nativeVlan = String(iface.trunkNativeVlan || 1);
        output += `${port} ${mode} ${encap} ${status} ${nativeVlan}\n`;
      }
    }

    return output;
  }

  private generateShowNATTranslations(): string {
    let output = 'Pro Inside global      Inside local       Outside local      Outside global\n';
    output += '--- --------------- --------------- --------------- ---------------\n';

    if (this.device.nat.rules.length === 0) {
      return output;
    }

    // For now, return empty translations (would be populated by actual NAT activity)
    return output;
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  private normalizeCommand(command: string): string {
    return command
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  private maskToCIDR(mask: string): number {
    const parts = mask.split('.').map(Number);
    let cidr = 0;
    for (const part of parts) {
      cidr += Math.popcount(part);
    }
    return cidr;
  }

  private parseVlanList(spec: string): number[] {
    const vlans: number[] = [];
    const parts = spec.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map((s) => parseInt(s.trim(), 10));
        for (let i = start; i <= end; i++) {
          vlans.push(i);
        }
      } else {
        vlans.push(parseInt(trimmed, 10));
      }
    }

    return vlans.sort((a, b) => a - b);
  }
}

/**
 * Execute a single command on a device
 */
export function executeCommand(device: Device, command: string): CommandResult {
  const simulator = new CommandSimulator(device);
  return simulator.execute(command);
}

/**
 * Execute multiple commands sequentially
 */
export function executeCommands(device: Device, commands: string[]): CommandResult[] {
  const simulator = new CommandSimulator(device);
  return commands.map((cmd) => simulator.execute(cmd));
}
