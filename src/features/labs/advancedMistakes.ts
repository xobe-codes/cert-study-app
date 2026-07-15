/**
 * Advanced Mistake Pattern Detection (Phase 3)
 *
 * Detects 8+ advanced networking configuration mistakes
 * beyond basic CLI errors. Focuses on real-world misconfigurations
 * that cause connectivity issues, performance problems, and security gaps.
 */

export enum AdvancedMistakeType {
  ROUTING_LOOP = 'routing_loop',
  MTU_MISMATCH = 'mtu_mismatch',
  HELLO_TIMER_MISMATCH = 'hello_timer_mismatch',
  ACL_BLOCKS_TRAFFIC = 'acl_blocks_traffic',
  NAT_CONFLICT = 'nat_conflict',
  SUBNET_CONFLICT = 'subnet_conflict',
  CONFIG_INCOMPLETE = 'config_incomplete',
  UNEXPECTED_SHUTDOWN = 'unexpected_shutdown',
  COST_MISMATCH = 'cost_mismatch',
  DEAD_INTERVAL_MISMATCH = 'dead_interval_mismatch',
}

export interface AdvancedMistake {
  type: AdvancedMistakeType;
  severity: 'critical' | 'high' | 'medium';
  title: string;
  problemDescription: string; // What's the real-world impact?
  whyItHappens: string; // Educational explanation
  detectionMethod: string; // How to identify this
  suggestedFix: string; // The solution with commands
  commonMisconception: string; // What users typically misunderstand
  relatedLab?: string;
}

export interface AdvancedMistakeContext {
  labId: string;
  deviceState: Record<string, any>;
  commands: string[];
  showOutput: Record<string, string>; // Map of "show" commands to outputs
  userInputs: string[];
  timestamp?: Date;
}

/**
 * Detect routing loops (conflicting routes pointing to each other)
 */
export function detectRoutingLoop(context: AdvancedMistakeContext): AdvancedMistake | null {
  const routeOutput = context.showOutput['show ip route'] || '';
  const ospfOutput = context.showOutput['show ip ospf'] || '';

  // Check for multiple routes to same destination with wrong priorities
  const hasConflictingRoutes =
    routeOutput.includes('0 via') &&
    routeOutput.includes('110 via') &&
    routeOutput.match(/via.*via/); // Multiple routes shown

  if (hasConflictingRoutes) {
    return {
      type: AdvancedMistakeType.ROUTING_LOOP,
      severity: 'critical',
      title: 'Potential Routing Loop Detected',
      problemDescription: 'Traffic could loop between routers infinitely, causing packet loss and high latency.',
      whyItHappens: 'Conflicting static and dynamic routes, or incorrect OSPF costs, cause routers to send packets back and forth.',
      detectionMethod: 'Multiple equal-cost routes to same destination, or static route conflicting with OSPF route.',
      suggestedFix: `
Review your routing configuration:
1. Check OSPF costs: show ip ospf interface
   - Verify bandwidth matches reality
   - Formula: cost = 100,000,000 / bandwidth
2. Check static routes: show ip route static
   - Remove conflicting static routes
3. Verify interface bandwidth: show interfaces gi0/1 | include BW
   - Ensure BW values match actual link speed

Example fix:
interface gi0/1
  bandwidth 1000000 (for 1Gbps link)
  exit
`,
      commonMisconception: 'Users often assume "more routes is better" for redundancy, but equal-cost multipath needs careful tuning.',
      relatedLab: 'OSPF_ADJACENCY',
    };
  }

  return null;
}

/**
 * Detect MTU mismatches between interfaces
 */
export function detectMtuMismatch(context: AdvancedMistakeContext): AdvancedMistake | null {
  const interfaceOutput = context.showOutput['show interfaces'] || '';

  // Look for interfaces with different MTU values
  const gi01Match = interfaceOutput.match(/Gi0\/1[\s\S]*?MTU\s+(\d+)/);
  const gi02Match = interfaceOutput.match(/Gi0\/2[\s\S]*?MTU\s+(\d+)/);

  if (gi01Match && gi02Match) {
    const mtu1 = parseInt(gi01Match[1]);
    const mtu2 = parseInt(gi02Match[1]);

    if (mtu1 !== mtu2) {
      return {
        type: AdvancedMistakeType.MTU_MISMATCH,
        severity: 'high',
        title: `MTU Mismatch: Gi0/1 (${mtu1}) vs Gi0/2 (${mtu2})`,
        problemDescription: 'Packets larger than the smallest MTU will be fragmented or dropped, reducing throughput.',
        whyItHappens: 'When interfaces in a path have different MTU sizes, the limiting interface (smallest MTU) determines maximum packet size.',
        detectionMethod: 'Compare MTU values across interfaces: show interfaces | include "MTU"',
        suggestedFix: `
1. Identify the smallest MTU needed across your path
2. Set all interfaces to match:

interface gi0/1
  mtu 1500
  exit

interface gi0/2
  mtu 1500
  exit

3. Verify: show interfaces | include "MTU"
`,
        commonMisconception: 'Many think default MTU (1500) is optimal everywhere. Some links need different values for efficiency.',
        relatedLab: 'CONNECTIVITY_LABS',
      };
    }
  }

  return null;
}

/**
 * Detect OSPF hello timer mismatches
 */
export function detectHelloTimerMismatch(context: AdvancedMistakeContext): AdvancedMistake | null {
  const neighborOutput = context.showOutput['show ip ospf neighbor'] || '';
  const interfaceOutput = context.showOutput['show ip ospf interface'] || '';

  // Check if neighbor stuck in INIT/EXSTART (usually timer issue)
  const neighborInInit = neighborOutput.includes('INIT') || neighborOutput.includes('EXSTART');

  // Check interface timer settings
  const helloTimerMatch = interfaceOutput.match(/Hello intervals? is (\d+)/i);
  const deadTimerMatch = interfaceOutput.match(/Dead interval is (\d+)/i);

  if (neighborInInit && helloTimerMatch && deadTimerMatch) {
    const helloInterval = parseInt(helloTimerMatch[1]);
    const deadInterval = parseInt(deadTimerMatch[1]);

    // Dead interval should be 4x hello interval
    if (deadInterval !== helloInterval * 4) {
      return {
        type: AdvancedMistakeType.HELLO_TIMER_MISMATCH,
        severity: 'critical',
        title: 'OSPF Timer Mismatch: Neighbors Not Forming Adjacency',
        problemDescription: 'Neighbors fail to establish OSPF adjacency because hello timers don\'t match, preventing route exchange.',
        whyItHappens: 'OSPF neighbors must have identical hello and dead interval timers. If they differ, neighbors never become adjacent.',
        detectionMethod: 'show ip ospf neighbor (stuck in DOWN, INIT, or EXSTART) OR show ip ospf interface (compare timer values)',
        suggestedFix: `
On both routers (must match exactly):

interface gi0/1
  ip ospf hello-interval 10
  ip ospf dead-interval 40
  exit

Then verify:
show ip ospf interface gi0/1 | include "Hello\\|Dead"
show ip ospf neighbor (should show FULL state)

Default values:
- Hello: 10 seconds (30 on non-broadcast)
- Dead: 40 seconds (120 on non-broadcast)
`,
        commonMisconception: 'Users assume timers are negotiated automatically. They must match manually on both sides.',
        relatedLab: 'OSPF_ADJACENCY',
      };
    }
  }

  return null;
}

/**
 * Detect ACL misconfiguration blocking required traffic
 */
export function detectAclBlocksTraffic(context: AdvancedMistakeContext): AdvancedMistake | null {
  const aclOutput = context.showOutput['show access-lists'] || '';
  const showRunOutput = context.showOutput['show running-config'] || '';

  // Look for ACL that might be blocking traffic
  const hasImplicitDeny = !aclOutput.includes('permit any any') &&
                         aclOutput.includes('deny ip any any');

  // Check if ACL is applied inbound or outbound
  const aclApplied = showRunOutput.match(/ip access-group (\d+) (in|out)/);

  if (hasImplicitDeny && aclApplied) {
    const aclNumber = aclApplied[1];
    const direction = aclApplied[2];

    // Check if there's a permit statement for the required network
    const hasPermitStatement = aclOutput.includes('permit') &&
                              aclOutput.includes('10.0.0.0') ||
                              aclOutput.includes('192.168.1.0');

    if (!hasPermitStatement) {
      return {
        type: AdvancedMistakeType.ACL_BLOCKS_TRAFFIC,
        severity: 'critical',
        title: `ACL ${aclNumber} (${direction}) May Be Blocking Traffic`,
        problemDescription: 'ACL applied to interface has implicit deny at end, blocking traffic that should be permitted.',
        whyItHappens: 'ACLs have implicit deny at the end. If no permit statement matches traffic, it gets dropped.',
        detectionMethod: 'show access-lists (look for missing permits) OR traceroute/ping failures with ACL applied.',
        suggestedFix: `
1. Review what traffic should be allowed:
   show access-lists ${aclNumber}

2. Add permit statements for required subnets (BEFORE deny):
   show running-config | include "access-list"

3. Recommended structure:
   access-list 101 permit ip 10.0.0.0 0.0.0.255 any
   access-list 101 permit ip 192.168.1.0 0.0.0.255 any
   access-list 101 deny ip any any (implicit, but document it)

4. Apply to interface:
   interface gi0/0
   ip access-group 101 in
   exit

5. Verify with: ping 10.0.0.1 (should work now)
`,
        commonMisconception: 'ACLs use "first match wins" logic. Users forget about implicit deny and block traffic unintentionally.',
        relatedLab: 'NAT_PAT_LAB',
      };
    }
  }

  return null;
}

/**
 * Detect NAT configuration conflicts
 */
export function detectNatConflict(context: AdvancedMistakeContext): AdvancedMistake | null {
  const natOutput = context.showOutput['show ip nat translations'] || '';
  const configOutput = context.showOutput['show running-config'] || '';

  // Check for multiple NAT rules pointing to same interface
  const natRules = configOutput.match(/ip nat inside source.*interface/g) || [];
  const hasMultipleRules = natRules.length > 1;

  // Check for overlapping network ranges
  const aclOutput = configOutput.match(/access-list \d+ permit ip (\d+\.\d+\.\d+\.\d+) (\d+\.\d+\.\d+\.\d+)/g) || [];

  if (hasMultipleRules || aclOutput.length > 1) {
    return {
      type: AdvancedMistakeType.NAT_CONFLICT,
      severity: 'high',
      title: 'NAT Configuration May Have Conflicts',
      problemDescription: 'Multiple NAT rules or overlapping ACLs cause some traffic to be translated unpredictably.',
      whyItHappens: 'NAT translates private IPs to public. Multiple rules can create conflicts where traffic goes different routes.',
      detectionMethod: 'show running-config | include "ip nat" (look for multiple rules) OR show ip nat translations (verify flows)',
        suggestedFix: `
1. Review all NAT rules:
   show ip nat statistics
   show ip nat translations

2. Standard configuration (one inside, one outside network):
   interface gi0/0
   ip nat inside
   exit

   interface gi0/1
   ip nat outside
   exit

   access-list 1 permit 10.0.0.0 0.0.0.255
   ip nat inside source list 1 interface gi0/1 overload

3. Clear conflicting entries:
   clear ip nat translations
   debug ip nat (to see translations in real-time)

4. Verify: ping 8.8.8.8 from inside network (should resolve)
`,
        commonMisconception: 'Users think they need multiple NAT rules for different subnets. Usually one rule with proper ACL covers all.',
        relatedLab: 'NAT_PAT_LAB',
      };
    }

  return null;
}

/**
 * Detect subnet conflicts (duplicate/overlapping subnets)
 */
export function detectSubnetConflict(context: AdvancedMistakeContext): AdvancedMistake | null {
  const interfaceOutput = context.showOutput['show interfaces'] || '';
  const configOutput = context.showOutput['show running-config'] || '';

  // Extract all configured IPs
  const ips = configOutput.match(/ip address (\d+\.\d+\.\d+\.\d+) (\d+\.\d+\.\d+\.\d+)/g) || [];

  // Check for duplicate subnets
  const subnets = new Set<string>();
  let hasDuplicate = false;

  for (const ip of ips) {
    // Simple check - just look for duplicate third octet (10.0.x)
    const match = ip.match(/(\d+\.\d+\.\d+)/);
    if (match) {
      const subnet = match[1];
      if (subnets.has(subnet)) {
        hasDuplicate = true;
        break;
      }
      subnets.add(subnet);
    }
  }

  if (hasDuplicate) {
    return {
      type: AdvancedMistakeType.SUBNET_CONFLICT,
      severity: 'critical',
      title: 'Duplicate Subnet Detected',
      problemDescription: 'Two interfaces configured with the same or overlapping subnets, causing routing confusion and host conflicts.',
      whyItHappens: 'When IP addresses overlap, routers don\'t know which interface owns the subnet, causing packets to be misrouted.',
      detectionMethod: 'show running-config | include "ip address" (look for duplicates) OR show ip route (look for conflicting routes)',
      suggestedFix: `
1. List all configured IPs:
   show running-config | include "ip address"

2. Identify the duplicate/overlapping subnets

3. Assign unique subnets to each interface:
   interface gi0/0
   ip address 10.0.1.1 255.255.255.0
   exit

   interface gi0/1
   ip address 10.0.2.1 255.255.255.0
   exit

4. Update any network statements or ACLs:
   show running-config | include network
   (update OSPF network statements if needed)

5. Verify:
   show interfaces | include "Internet address"
`,
      commonMisconception: 'Users assume routers handle overlapping subnets gracefully. They don\'t—routing is ambiguous.',
      relatedLab: 'OSPF_ADJACENCY',
    };
  }

  return null;
}

/**
 * Detect incomplete configuration (missing required steps)
 */
export function detectConfigIncomplete(context: AdvancedMistakeContext): AdvancedMistake | null {
  const configOutput = context.showOutput['show running-config'] || '';
  const ospfOutput = context.showOutput['show ip ospf'] || '';

  const hasRouterOspf = configOutput.includes('router ospf');
  const hasNetworkStatement = configOutput.includes('network') && configOutput.includes('area');

  // Check if OSPF is partially configured - router ospf exists but no network statements
  if (hasRouterOspf && !hasNetworkStatement) {
    return {
      type: AdvancedMistakeType.CONFIG_INCOMPLETE,
      severity: 'high',
      title: 'OSPF Configuration Incomplete',
      problemDescription: 'OSPF process is enabled but no networks are being advertised. Neighbors won\'t be discovered.',
      whyItHappens: 'OSPF requires both "router ospf X" AND "network X.X.X.X X.X.X.X area X" to be useful.',
      detectionMethod: 'show running-config (has router ospf but no network) OR show ip ospf (says "No neighbors")',
      suggestedFix: `
1. Check current OSPF config:
   show running-config | section ospf

2. Add network statements for each interface:
   configure terminal
   router ospf 1
   network 10.0.0.0 0.0.0.255 area 0
   network 192.168.1.0 0.0.0.255 area 0
   exit
   exit

3. Verify neighbors appear:
   show ip ospf neighbor (should show neighbors in FULL state)

4. Verify routes are learned:
   show ip route ospf
`,
      commonMisconception: 'Users enable OSPF process but forget to advertise networks. They expect routes to magically appear.',
      relatedLab: 'OSPF_ADJACENCY',
    };
  }

  return null;
}

/**
 * Detect unexpected interface shutdown issues
 */
export function detectUnexpectedShutdown(context: AdvancedMistakeContext): AdvancedMistake | null {
  const interfaceOutput = context.showOutput['show interfaces'] || '';

  // Look for interfaces that are down/down
  const downInterfaces = interfaceOutput.match(/(\w+\d+\/\d+)\s+is (down)/gi) || [];

  if (downInterfaces.length > 0) {
    const interfaceName = downInterfaces[0].split(/\s+/)[0];

    return {
      type: AdvancedMistakeType.UNEXPECTED_SHUTDOWN,
      severity: 'high',
      title: `Interface ${interfaceName} is Down`,
      problemDescription: 'Interface status is down, blocking all traffic through that interface.',
      whyItHappens: 'Interface is in shutdown state (explicitly configured) or failed due to hardware/cable issue.',
      detectionMethod: 'show interfaces (look for "is down, line protocol is down")',
      suggestedFix: `
1. Check interface status:
   show interfaces ${interfaceName}

2. If it says "administratively down", enable it:
   configure terminal
   interface ${interfaceName}
   no shutdown
   exit
   exit

3. If it says "down (line protocol down)", check physical connection:
   - Verify cable is connected
   - Check with: show interfaces ${interfaceName} | include "Media"

4. Verify it's now up:
   show interfaces ${interfaceName} | include "is "
`,
      commonMisconception: 'Users forget that Cisco devices have interfaces shutdown by default. "no shutdown" is required.',
      relatedLab: 'CONNECTIVITY_LABS',
    };
  }

  return null;
}

/**
 * Detect OSPF cost mismatches affecting route selection
 */
export function detectCostMismatch(context: AdvancedMistakeContext): AdvancedMistake | null {
  const costOutput = context.showOutput['show ip ospf interface brief'] || '';
  const routeOutput = context.showOutput['show ip route ospf'] || '';

  // Look for interfaces with unexpected cost values
  if (costOutput.includes('Cost') && !costOutput.includes('1000')) {
    // Costs are typically 1 (Gi), 1000 (E0), etc. Others indicate misconfiguration
    const hasSuspiciousCost = costOutput.match(/Cost\s+(\d+)/g);

    if (hasSuspiciousCost) {
      return {
        type: AdvancedMistakeType.COST_MISMATCH,
        severity: 'medium',
        title: 'OSPF Cost Values May Be Incorrect',
        problemDescription: 'OSPF routes may not follow the intended path due to unexpected cost values.',
        whyItHappens: 'OSPF cost is calculated from interface bandwidth. Non-default bandwidth causes wrong costs.',
        detectionMethod: 'show ip ospf interface brief (check Cost column) OR show ip route ospf (verify path taken)',
        suggestedFix: `
1. Check current costs:
   show ip ospf interface brief | include Cost

2. Check interface bandwidth:
   show interfaces gi0/1 | include "BW"

3. If bandwidth is wrong, fix it (doesn't affect real speed, just OSPF cost):
   interface gi0/1
   bandwidth 1000000  (for 1Gbps link, cost will be 100,000,000/1,000,000 = 100)
   exit

4. Verify new cost calculated:
   show ip ospf interface gi0/1 | include Cost

5. Routes should recalculate:
   show ip route ospf (should show expected paths)
`,
        commonMisconception: 'Changing "bandwidth" doesn\'t affect actual interface speed—only OSPF cost calculation.',
        relatedLab: 'OSPF_ADJACENCY',
      };
    }
  }

  return null;
}

/**
 * Detect OSPF dead interval mismatch (different from hello timer)
 */
export function detectDeadIntervalMismatch(context: AdvancedMistakeContext): AdvancedMistake | null {
  const neighborOutput = context.showOutput['show ip ospf neighbor'] || '';
  const interfaceOutput = context.showOutput['show ip ospf interface'] || '';

  // Similar to hello timer mismatch but specifically for dead interval
  if (neighborOutput.includes('EXSTART')) {
    return {
      type: AdvancedMistakeType.DEAD_INTERVAL_MISMATCH,
      severity: 'critical',
      title: 'OSPF Dead Interval Mismatch',
      problemDescription: 'Neighbors stuck in EXSTART/EXCHANGE state because dead interval values don\'t match.',
      whyItHappens: 'Dead interval must match on both routers. If set differently, neighbors can\'t complete adjacency.',
      detectionMethod: 'show ip ospf neighbor (stuck in EXSTART) OR show ip ospf interface (check Dead interval value)',
      suggestedFix: `
Standard dead interval = 4 × hello interval

Examples:
- Gi/E interfaces (hello 10s): dead interval = 40s
- Serial links (hello 30s): dead interval = 120s
- NBMA networks: often hello 30s, dead 120s

On both neighbors (MUST MATCH):
interface gi0/0
  ip ospf hello-interval 10
  ip ospf dead-interval 40
  exit

Verify:
show ip ospf interface gi0/0 | include "Hello\\|Dead"
show ip ospf neighbor (should eventually reach FULL)
`,
      commonMisconception: 'Users often set hello and dead intervals independently. Dead should always be 4× hello.',
      relatedLab: 'OSPF_ADJACENCY',
    };
  }

  return null;
}

/**
 * Main function to run all advanced detectors
 */
export function detectAdvancedMistakes(context: AdvancedMistakeContext): AdvancedMistake[] {
  const mistakes: AdvancedMistake[] = [];

  const detectors = [
    () => detectRoutingLoop(context),
    () => detectMtuMismatch(context),
    () => detectHelloTimerMismatch(context),
    () => detectAclBlocksTraffic(context),
    () => detectNatConflict(context),
    () => detectSubnetConflict(context),
    () => detectConfigIncomplete(context),
    () => detectUnexpectedShutdown(context),
    () => detectCostMismatch(context),
    () => detectDeadIntervalMismatch(context),
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
 * Get severity score for prioritizing feedback
 */
export function getSeverityScore(mistake: AdvancedMistake): number {
  const scoreMap = {
    critical: 100,
    high: 50,
    medium: 20,
  };
  return scoreMap[mistake.severity];
}

/**
 * Sort mistakes by severity (critical first)
 */
export function sortBysSeverity(mistakes: AdvancedMistake[]): AdvancedMistake[] {
  return mistakes.sort((a, b) => getSeverityScore(b) - getSeverityScore(a));
}
