/**
 * Output Generator - Creates realistic Cisco IOS command output based on device state
 * Matches real IOS output format exactly for validation testing
 */

import { Device, InterfaceState, OSPFNeighbor } from './deviceState';

// ============================================================================
// SHOW VLAN OUTPUT
// ============================================================================

export function showVlanBrief(device: Device): string {
  let output = 'VLAN Name                             Status    Ports\n';
  output += '---- -------------------------------- --------- ----------------------------\n';

  for (const vlan of Object.values(device.vlans)) {
    const vlanId = String(vlan.id).padEnd(4);
    const name = vlan.name.substring(0, 32).padEnd(32);
    const status = vlan.status.padEnd(9);
    const ports = (vlan.interfaces || []).join(',').substring(0, 28);
    output += `${vlanId} ${name} ${status} ${ports}\n`;
  }

  return output;
}

export function showVlan(device: Device): string {
  let output = 'VLAN Name                             Status    Ports\n';
  output += '---- -------------------------------- --------- ----------------------------\n';

  for (const vlan of Object.values(device.vlans)) {
    const vlanId = String(vlan.id).padEnd(4);
    const name = vlan.name.substring(0, 32).padEnd(32);
    const status = vlan.status.padEnd(9);
    const ports = (vlan.interfaces || []).join(',').substring(0, 28);
    output += `${vlanId} ${name} ${status} ${ports}\n`;
  }

  // Add VLAN details
  output += '\nVLAN Type  SAID       MTU   Parent RingNo BridgeNo Stp  BrdgMode Trans1 Trans2\n';
  output +=
    '---- ----- ---------- ----- ------ ------ -------- ---- -------- ------ ------\n';

  for (const vlan of Object.values(device.vlans)) {
    const vlanId = String(vlan.id).padEnd(4);
    const type = 'enet'.padEnd(5);
    const said = `10${String(vlan.id).padStart(5, '0')}`.padEnd(10);
    const mtu = '1500'.padEnd(5);
    output += `${vlanId} ${type} ${said} ${mtu}\n`;
  }

  return output;
}

// ============================================================================
// SHOW INTERFACES OUTPUT
// ============================================================================

export function showInterface(device: Device, interfaceName: string): string {
  const normalized = interfaceName.toLowerCase();
  const iface = device.interfaces[normalized];
  if (!iface) {
    return `% Invalid input detected at '^' marker.`;
  }

  let output = `${normalized} is ${iface.status}, line protocol is ${iface.protocol}\n`;
  output += `  Hardware is Gigabit Ethernet, address is 0200.3333.4444\n`;
  output += `  Internet address is`;

  if (iface.ip && iface.mask) {
    output += ` ${iface.ip}/${maskToCIDR(iface.mask)}\n`;
    output += `  MTU ${iface.mtu} bytes, BW ${iface.bandwidth} Kbit/sec, DLY ${iface.delay || 100} usec,\n`;
    output += `     reliability 255/255, txload 1/255, rxload 1/255\n`;
  } else {
    output += ' not set\n';
    output += `  MTU ${iface.mtu} bytes, BW ${iface.bandwidth} Kbit/sec, DLY ${iface.delay || 100} usec,\n`;
    output += `     reliability 255/255, txload 1/255, rxload 1/255\n`;
  }

  output += `  Encapsulation ARPA, loopback not set\n`;

  if (iface.switchportMode) {
    output += `  Switchport: Enabled\n`;
    output += `  Administrative Mode: ${iface.switchportMode}\n`;
    output += `  Operational Mode: ${iface.switchportMode}\n`;

    if (iface.switchportMode === 'access') {
      output += `  Access Mode VLAN: ${iface.accessVlan || 1}\n`;
    } else {
      output += `  Trunking Native Mode VLAN: ${iface.trunkNativeVlan || 1}\n`;
      output += `  Trunking VLANs Enabled: ${(iface.trunkAllowedVlans || [1]).join(',')}\n`;
    }
  }

  if (iface.description) {
    output += `  Description: ${iface.description}\n`;
  }

  output += `  Last input 00:00:05, output 00:00:05, output hang never\n`;
  output += `  Last clearing of "show interface" counters never\n`;
  output += `  Input queue: 0/75/0/0 (size/max/drops/flushes); Total output drops: 0\n`;
  output += `  Queueing strategy: fifo\n`;
  output += `  Output queue: 0/40 (size/max)\n`;
  output += `     5 minute input rate 0 bits/sec, 0 packets/sec\n`;
  output += `     5 minute output rate 0 bits/sec, 0 packets/sec\n`;
  output += `        0 packets input, 0 bytes, 0 no buffer\n`;
  output += `        Received 0 broadcasts (0 multicasts)\n`;
  output += `        0 runts, 0 giants, 0 throttles\n`;
  output += `        0 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored, 0 abort\n`;
  output += `        0 packets output, 0 bytes, 0 underruns\n`;
  output += `        0 output errors, 0 collisions, 0 interface resets\n`;

  return output;
}

export function showInterfacesSummary(device: Device): string {
  let output = 'Interface              IP-Address      Status                Protocol\n';
  for (const [key, iface] of Object.entries(device.interfaces)) {
    const name = key.padEnd(22);
    const ip = (iface.ip || '').padEnd(15);
    const status = (iface.status === 'administratively down' ? 'admin down' : iface.status)
      .padEnd(20);
    const protocol = iface.protocol;
    output += `${name}${ip}${status}${protocol}\n`;
  }
  return output;
}

// ============================================================================
// SHOW IP ROUTE OUTPUT
// ============================================================================

export function showIpRoute(device: Device): string {
  let output = 'Codes: C - connected, S - static, R - RIP, M - mobile, B - BGP\n';
  output += '       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area\n';
  output += '       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2\n';
  output += '       E1 - OSPF external type 1, E2 - OSPF external type 2\n';
  output += '       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2\n';
  output += '       ia - IS-IS inter area, * - candidate default, U - per-user static route\n';
  output += '       o - ODR, P - periodic downloaded static route\n';
  output += '\nGateway of last resort is not set\n\n';

  // Connected routes
  for (const [key, iface] of Object.entries(device.interfaces)) {
    if (iface.ip && iface.mask && iface.status === 'up') {
      const network = calculateNetwork(iface.ip, iface.mask);
      const cidr = maskToCIDR(iface.mask);
      output += `C       ${network}/${cidr} is directly connected, ${key}\n`;
    }
  }

  // OSPF routes
  for (const route of device.routing.routes) {
    if (route.protocol === 'O') {
      output += `O       ${route.destination}/${maskToCIDR(route.mask)} [${route.distance}/${route.metric}] via ${route.nextHop}, 00:05:30, ${route.interface}\n`;
    }
  }

  return output;
}

// ============================================================================
// SHOW IP OSPF NEIGHBOR OUTPUT
// ============================================================================

export function showIpOspfNeighbor(device: Device): string {
  if (!device.ospf.enabled) {
    return '% OSPF routing process is not enabled\n';
  }

  let output = 'Neighbor ID     Pri   State           Dead Time   Address         Interface\n';

  if (device.ospf.neighbors.length === 0) {
    return output;
  }

  for (const neighbor of device.ospf.neighbors) {
    const routerId = neighbor.routerId.padEnd(15);
    const pri = String(neighbor.priority || 1).padEnd(5);
    const state = neighbor.state.padEnd(15);
    const deadTime = formatDeadTime(neighbor.deadTime || 40);
    const address = (neighbor.address || '').padEnd(15);
    const iface = neighbor.interface || '';
    output += `${routerId} ${pri} ${state} ${deadTime} ${address} ${iface}\n`;
  }

  return output;
}

// ============================================================================
// SHOW INTERFACES TRUNK OUTPUT
// ============================================================================

export function showInterfacesTrunk(device: Device): string {
  let output = 'Port        Mode       Encapsulation  Status        Native vlan\n';
  output += '----------- ---------- --------------- ------------- -----------\n';

  let found = false;
  for (const [key, iface] of Object.entries(device.interfaces)) {
    if (iface.switchportMode === 'trunk') {
      found = true;
      const port = key.padEnd(11);
      const mode = 'trunk'.padEnd(10);
      const encap = '802.1q'.padEnd(15);
      const status = (iface.status === 'up' ? 'trunking' : 'not trunking').padEnd(13);
      const nativeVlan = String(iface.trunkNativeVlan || 1);
      output += `${port} ${mode} ${encap} ${status} ${nativeVlan}\n`;
    }
  }

  if (found) {
    output += '\nPort        Vlans allowed on trunk\n';
    output += '----------- -----------------------\n';

    for (const [key, iface] of Object.entries(device.interfaces)) {
      if (iface.switchportMode === 'trunk' && iface.trunkAllowedVlans) {
        const port = key.padEnd(11);
        const vlans = iface.trunkAllowedVlans.join(',');
        output += `${port} ${vlans}\n`;
      }
    }
  }

  return output;
}

// ============================================================================
// SHOW IP NAT TRANSLATIONS OUTPUT
// ============================================================================

export function showIpNatTranslations(device: Device): string {
  if (!device.nat.enabled) {
    return '% NAT is not enabled\n';
  }

  let output = 'Pro Inside global      Inside local       Outside local      Outside global\n';
  output += '--- --------------- --------------- --------------- ---------------\n';

  // No active translations for this simulation
  return output;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function maskToCIDR(mask: string): number {
  const parts = mask.split('.').map(Number);
  let cidr = 0;
  for (const part of parts) {
    // Count set bits (1s) in the octet
    let bits = part;
    while (bits > 0) {
      cidr += bits & 1;
      bits >>= 1;
    }
  }
  return cidr;
}

function calculateNetwork(ip: string, mask: string): string {
  const ipParts = ip.split('.').map(Number);
  const maskParts = mask.split('.').map(Number);

  const network = ipParts.map((part, i) => part & maskParts[i]).join('.');
  return network;
}

function formatDeadTime(deadTime: number): string {
  const seconds = deadTime % 60;
  const mins = Math.floor(deadTime / 60);

  if (mins === 0) {
    return `${String(seconds).padEnd(11)}s`;
  }

  return `00:${String(mins).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`.padEnd(11);
}

// ============================================================================
// COMPLEX OUTPUT GENERATORS
// ============================================================================

export function showRunningConfig(device: Device): string {
  let output = 'Building configuration...\n\n';
  output += `Current configuration : ${Math.floor(Math.random() * 5000) + 1000} bytes\n`;
  output += '!\n';
  output += `hostname ${device.hostname}\n`;
  output += '!\n';

  // VLANs
  for (const vlan of Object.values(device.vlans)) {
    if (vlan.id !== 1) {
      output += `vlan ${vlan.id}\n`;
      output += ` name ${vlan.name}\n`;
    }
  }

  output += '!\n';

  // Interfaces
  for (const iface of Object.values(device.interfaces)) {
    output += `interface ${iface.name}\n`;

    if (iface.description) {
      output += ` description ${iface.description}\n`;
    }

    if (iface.switchportMode) {
      output += ` switchport mode ${iface.switchportMode}\n`;

      if (iface.switchportMode === 'access' && iface.accessVlan) {
        output += ` switchport access vlan ${iface.accessVlan}\n`;
      } else if (iface.switchportMode === 'trunk' && iface.trunkAllowedVlans) {
        output += ` switchport trunk allowed vlan ${iface.trunkAllowedVlans.join(',')}\n`;
      }
    }

    if (iface.ip && iface.mask) {
      output += ` ip address ${iface.ip} ${iface.mask}\n`;
    }

    if (iface.isNatInside) {
      output += ` ip nat inside\n`;
    }

    if (iface.isNatOutside) {
      output += ` ip nat outside\n`;
    }

    if (iface.status === 'up') {
      output += ` no shutdown\n`;
    } else {
      output += ` shutdown\n`;
    }

    output += '!\n';
  }

  // OSPF
  if (device.ospf.enabled && device.ospf.area0) {
    output += `router ospf ${device.ospf.processId}\n`;
    for (const network of device.ospf.area0.networks) {
      output += ` network ${network} area 0\n`;
    }
    output += '!\n';
  }

  // NAT
  if (device.nat.enabled) {
    for (const acl of device.nat.accessLists) {
      for (const entry of acl.entries) {
        output += `access-list ${acl.id} ${entry.action} ${entry.protocol} ${entry.source}`;
        if (entry.wildcard) {
          output += ` ${entry.wildcard}`;
        }
        output += '\n';
      }
    }

    for (const rule of device.nat.rules) {
      if (rule.type === 'dynamic-overload') {
        output += `ip nat inside source list ${rule.accessListId} interface ${rule.interface} overload\n`;
      }
    }

    output += '!\n';
  }

  output += 'end\n';
  return output;
}

export function showIpOspfProcess(device: Device): string {
  if (!device.ospf.enabled) {
    return '% OSPF routing process is not enabled\n';
  }

  let output = `Routing Process "ospf ${device.ospf.processId}" with ID ${device.ospf.routerId || '0.0.0.1'}\n`;
  output += 'Start time: 00:00:00.000, Time elapsed: 05:30:45\n';
  output += 'Supports only single TOS(TOS0) routes\n';
  output += 'Supports opaque LSA\n';
  output += `Number of areas in this router is 1. 1 Normal 0 Stub 0 Nssa\n`;
  output += 'External LSA count: 0\n';
  output += 'External opaque LSA count: 0\n';
  output += 'Non-Stop Routing is not enabled\n';

  if (device.ospf.area0) {
    output += '\n Area BACKBONE(0)\n';
    output += `    Number of interfaces in this area is ${Object.keys(device.ospf.interfaces || {}).length}\n`;
    output += `    Area has ${device.ospf.neighbors.length} fully adjacent neighbors\n`;
  }

  return output;
}

/**
 * Generate complete device information summary
 */
export function showVersion(device: Device): string {
  let output = 'Cisco IOS Software, Catalyst L3 Switch Software (CAT3750E_LANBASE), Version 12.2(58)SE2\n';
  output += 'Copyright (c) 1986-2011 by Cisco Systems, Inc.\n';
  output += `System uptime is 5 weeks, 3 days, 2 hours, 15 minutes\n`;
  output += `System restarted at Thu Jul 14 10:30:20 UTC 2026\n`;
  output += `System image file is "flash:cat3750e_lanbase-tar.122-58.SE2.tar"\n`;
  output += `Last reload reason: Reload Command\n`;
  output += `License Level: lanbase\n`;
  output += `License Type: Perpetual Right-to-Use\n`;
  output += `Next reload license Level: lanbase\n`;
  output += `Processor board ID JAB1234567890ABC\n`;
  output += `2 Virtual Ethernet interfaces\n`;
  output += `52 Gigabit Ethernet interfaces\n`;
  output += `Model Number                    : WS-C3750X-48TS-S\n`;
  output += `System Serial Number            : CAT1234567890\n`;
  output += `Configuration register is 0x2102\n`;
  return output;
}
