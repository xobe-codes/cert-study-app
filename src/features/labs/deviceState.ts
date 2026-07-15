/**
 * Device State Model - TypeScript interfaces and utilities for network device simulation
 * Implements mock network simulator for CCNA labs (Phase 2 - Strategy 3B)
 */

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export type InterfaceStatus = 'up' | 'down' | 'administratively down';
export type InterfaceProtocol = 'up' | 'down';
export type DeviceType = 'router' | 'switch';
export type OSPFState = 'DOWN' | 'INIT' | 'EXSTART' | 'EXCHANGE' | 'LOADING' | 'FULL';
export type VlanStatus = 'active' | 'suspended';

/**
 * Interface State - Represents a single interface (Gi0/1, Fa0/0, etc.)
 */
export interface InterfaceState {
  name: string;
  status: InterfaceStatus;
  protocol: InterfaceProtocol;
  ip?: string;
  mask?: string;
  description?: string;
  mtu?: number;
  bandwidth?: number;
  delay?: number;
  reliability?: number;
  load?: number;
  speedBps?: string;
  duplexMode?: 'auto' | 'full' | 'half';
  // Switch-specific
  switchportMode?: 'access' | 'trunk';
  accessVlan?: number;
  trunkNativeVlan?: number;
  trunkAllowedVlans?: number[];
  // Layer 3 settings
  isNatInside?: boolean;
  isNatOutside?: boolean;
}

/**
 * VLAN Configuration
 */
export interface VlanConfig {
  id: number;
  name: string;
  status: VlanStatus;
  interfaces?: string[]; // interfaces in this VLAN (access mode)
}

/**
 * OSPF Neighbor - represents adjacent OSPF router
 */
export interface OSPFNeighbor {
  routerId: string;
  area: number;
  state: OSPFState;
  deadTime?: number;
  address?: string;
  interface?: string;
  priority?: number;
  lastUpdate?: number;
}

/**
 * OSPF Process Configuration
 */
export interface OSPFConfig {
  processId: number;
  routerId?: string;
  enabled: boolean;
  area0?: {
    networks: string[]; // network statements like "10.0.0.0 0.0.0.255"
  };
  neighbors: OSPFNeighbor[];
  interfaces?: {
    [name: string]: {
      area: number;
      helloInterval?: number;
      deadInterval?: number;
      passive?: boolean;
    };
  };
}

/**
 * NAT Rule - for NAT/PAT configuration
 */
export interface NATRule {
  id: string;
  type: 'static' | 'dynamic' | 'dynamic-overload'; // PAT is dynamic-overload
  insideLocal?: string;
  insideGlobal?: string;
  outsideLocal?: string;
  outsideGlobal?: string;
  accessListId?: number;
  interface?: string;
  protocol?: 'tcp' | 'udp' | 'ip';
}

/**
 * Access Control List
 */
export interface ACL {
  id: number;
  name?: string;
  entries: {
    action: 'permit' | 'deny';
    protocol: string; // ip, tcp, udp, icmp, etc.
    source: string; // IP or "any"
    wildcard?: string;
    destination?: string;
    destWildcard?: string;
    port?: number;
  }[];
}

/**
 * Routing Table Entry
 */
export interface Route {
  destination: string;
  mask: string;
  nextHop: string;
  distance: number;
  metric: number;
  protocol: 'C' | 'S' | 'D' | 'O' | 'B' | 'R'; // Connected, Static, EIGRP, OSPF, BGP, RIP
  via?: string;
  interface?: string;
  timestamp?: number;
}

/**
 * Main Device State Object
 */
export interface Device {
  // Basic identity
  hostname: string;
  type: DeviceType;
  osVersion?: string;
  serialNumber?: string;

  // Interfaces
  interfaces: {
    [name: string]: InterfaceState;
  };

  // VLANs (primarily for switches)
  vlans: {
    [id: number]: VlanConfig;
  };

  // OSPF routing
  ospf: OSPFConfig;

  // NAT/PAT
  nat: {
    enabled: boolean;
    rules: NATRule[];
    accessLists: ACL[];
  };

  // Routing
  routing: {
    routes: Route[];
    rip?: {
      enabled: boolean;
      version: 1 | 2;
      networks: string[];
    };
    eigrp?: {
      enabled: boolean;
      asn: number;
      networks: string[];
      neighbors: string[];
    };
  };

  // Configuration mode tracking
  configMode?: 'user' | 'privileged' | 'global-config' | 'interface-config' | 'router-config';
  currentInterface?: string;
  currentRouter?: string;

  // Timestamp for state tracking
  lastModified: number;
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new device with default configuration
 */
export function createDevice(type: DeviceType, hostname: string = 'Router1'): Device {
  return {
    hostname,
    type,
    osVersion: 'Cisco IOS Software, C3750 Software, Version 12.2(58)SE2',
    serialNumber: 'ABC123DEF456',

    interfaces: {
      'gi0/1': {
        name: 'Gi0/1',
        status: 'down',
        protocol: 'down',
        description: 'Gigabit Ethernet 0/1',
        mtu: 1500,
        bandwidth: 1000000,
        duplexMode: 'auto',
        speedBps: '1000000000',
      },
      'gi0/2': {
        name: 'Gi0/2',
        status: 'down',
        protocol: 'down',
        description: 'Gigabit Ethernet 0/2',
        mtu: 1500,
        bandwidth: 1000000,
        duplexMode: 'auto',
        speedBps: '1000000000',
      },
      'fa0/0': {
        name: 'Fa0/0',
        status: 'down',
        protocol: 'down',
        description: 'Fast Ethernet 0/0',
        mtu: 1500,
        bandwidth: 100000,
        duplexMode: 'auto',
        speedBps: '100000000',
      },
    },

    vlans: {
      1: {
        id: 1,
        name: 'default',
        status: 'active',
        interfaces: [],
      },
    },

    ospf: {
      processId: 1,
      enabled: false,
      neighbors: [],
      interfaces: {},
    },

    nat: {
      enabled: false,
      rules: [],
      accessLists: [],
    },

    routing: {
      routes: [],
    },

    configMode: 'user',
    lastModified: Date.now(),
  };
}

/**
 * Clone a device for before/after state comparison
 */
export function cloneDevice(device: Device): Device {
  return JSON.parse(JSON.stringify(device));
}

/**
 * Get device state as serializable JSON for comparison
 */
export function getDeviceState(device: Device): string {
  return JSON.stringify({
    hostname: device.hostname,
    interfaces: device.interfaces,
    vlans: device.vlans,
    ospf: device.ospf,
    nat: device.nat,
    routing: device.routing,
  });
}

/**
 * Extract specific configuration value for comparison
 */
export function getConfigValue(
  device: Device,
  path: string
): string | number | boolean | object | undefined {
  const parts = path.split('.');
  let current: any = device;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

/**
 * Update device configuration at specified path
 */
export function setConfigValue(device: Device, path: string, value: any): void {
  const parts = path.split('.');
  let current: any = device;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
  device.lastModified = Date.now();
}

/**
 * Check if interface exists on device
 */
export function interfaceExists(device: Device, interfaceName: string): boolean {
  return interfaceName in device.interfaces;
}

/**
 * Check if VLAN exists
 */
export function vlanExists(device: Device, vlanId: number): boolean {
  return vlanId in device.vlans;
}

/**
 * Get or create interface
 */
export function getOrCreateInterface(device: Device, interfaceName: string): InterfaceState {
  const normalized = interfaceName.toLowerCase();
  if (!device.interfaces[normalized]) {
    device.interfaces[normalized] = {
      name: normalized,
      status: 'down',
      protocol: 'down',
      mtu: 1500,
    };
  }
  return device.interfaces[normalized];
}

/**
 * Get or create VLAN
 */
export function getOrCreateVlan(device: Device, vlanId: number, name?: string): VlanConfig {
  if (!device.vlans[vlanId]) {
    device.vlans[vlanId] = {
      id: vlanId,
      name: name || `VLAN${String(vlanId).padStart(4, '0')}`,
      status: 'active',
      interfaces: [],
    };
  }
  return device.vlans[vlanId];
}

/**
 * Calculate route cost based on interface bandwidth
 */
export function calculateCost(bandwidthBps: number): number {
  // OSPF cost = reference bandwidth / interface bandwidth
  const referenceBandwidth = 100000000; // 100 Mbps
  return Math.round(referenceBandwidth / bandwidthBps);
}

/**
 * Normalize interface name (handle abbreviations and full names)
 */
export function normalizeInterfaceName(name: string): string {
  const lowerName = name.toLowerCase();

  // Convert full names to abbreviations
  if (lowerName.startsWith('gigabitethernet')) {
    return lowerName.replace('gigabitethernet', 'gi');
  }
  if (lowerName.startsWith('fastethernet')) {
    return lowerName.replace('fastethernet', 'fa');
  }
  if (lowerName.startsWith('ethernet')) {
    return lowerName.replace('ethernet', 'eth');
  }
  if (lowerName.startsWith('serial')) {
    return lowerName.replace('serial', 'se');
  }

  return lowerName;
}
