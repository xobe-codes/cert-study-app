/**
 * Skill-balanced questions — ordering (drag-drop) + supplemental troubleshooting.
 * Merged into getCuratedQuestions() for zero-API quiz banks.
 */
import { SKILL_QUESTIONS_EXTENDED } from './ccnaSkillQuestionsExtended.js'
import { applyAnswerReviewToQuestion } from '../answerReviewLogic.js'

function mergeSkillMaps(base, ext) {
  const out = { ...base }
  for (const [id, qs] of Object.entries(ext)) {
    out[id] = [...(out[id] || []), ...qs]
  }
  return out
}

const SKILL_QUESTIONS_CORE = {
  '1.6': [
    {
      id: '1.6-order-vlsm',
      type: 'ordering',
      skill: 'design',
      difficulty: 'hard',
      concept: 'VLSM allocation order',
      question: 'You are subnetting `192.168.10.0/24`. Put these design steps in the correct order (largest requirement first).',
      orderItems: [
        'List each subnet requirement and sort largest host count first',
        'Assign the first subnet from the top of the address block',
        'Move to the next free address block for the next-largest subnet',
        'Verify no subnet ranges overlap before assigning interfaces',
      ],
      explanation: 'VLSM design always allocates largest subnets first from the contiguous free space to avoid overlap.',
    },
  ],
  '2.1': [
    {
      id: '2.1-order-vlan',
      type: 'ordering',
      skill: 'implement',
      difficulty: 'medium',
      concept: 'VLAN access port setup',
      question: 'Put these steps in the correct order to place interface Fa0/5 into VLAN 20 as an access port.',
      orderItems: [
        'vlan 20',
        'name SALES',
        'interface fa0/5',
        'switchport mode access',
        'switchport access vlan 20',
      ],
      explanation: 'Create/name the VLAN globally, enter the interface, set access mode, then assign the VLAN.',
    },
  ],
  '2.2': [
    {
      id: '2.2-order-trunk',
      type: 'ordering',
      skill: 'implement',
      difficulty: 'medium',
      concept: '802.1Q trunk setup',
      question: 'Order the steps to configure a secure trunk between two switches.',
      orderItems: [
        'interface gi0/1',
        'switchport trunk encapsulation dot1q',
        'switchport mode trunk',
        'switchport trunk allowed vlan 10,20',
        'switchport trunk native vlan 99',
      ],
      explanation: 'Enter the interface, set encapsulation (if needed), trunk mode, restrict allowed VLANs, then set native VLAN.',
    },
  ],
  '3.3': [
    {
      id: '3.3-order-ts',
      type: 'ordering',
      skill: 'troubleshoot',
      difficulty: 'medium',
      concept: 'Layered troubleshooting',
      question: 'A remote subnet is unreachable. Order the troubleshooting steps from bottom-up (OSI practical order).',
      orderItems: [
        'Verify interface status on local router (`show ip interface brief`)',
        'Confirm a routing table entry exists for the destination (`show ip route`)',
        'Ping the next-hop or gateway for that route',
        'Trace the path toward the destination (`traceroute`)',
      ],
      explanation: 'Start local (interface), then routing table, then next-hop reachability, then path beyond.',
    },
  ],
  '3.4': [
    {
      id: '3.4-order-ospf',
      type: 'ordering',
      skill: 'implement',
      difficulty: 'medium',
      concept: 'OSPF single-area config',
      question: 'Put these OSPFv2 configuration steps in the correct order on a router.',
      orderItems: [
        'router ospf 1',
        'router-id 1.1.1.1',
        'network 10.0.0.0 0.0.0.255 area 0',
        'no shutdown on participating interfaces',
      ],
      explanation: 'Enable the OSPF process, set router-id inside OSPF config, advertise networks into area 0, ensure interfaces are up.',
    },
    {
      id: '3.4-ts-area',
      type: 'troubleshooting',
      skill: 'troubleshoot',
      difficulty: 'hard',
      concept: 'OSPF adjacency',
      question: 'R1 and R2 are connected on `10.0.12.0/30`. R1 shows:\n`show ip ospf neighbor` — empty\nR2 has `network 10.0.12.0 0.0.0.3 area 1`\nWhat is the most likely cause?',
      choices: [
        'Mismatched OSPF area ID on the shared link',
        'Duplicate router-id on both routers',
        'Interface shutdown on R1 only',
        'Missing default route',
      ],
      correctIndex: 0,
      explanation: 'OSPF requires the same area on both sides of the link; area 0 vs area 1 prevents adjacency.',
    },
  ],
  '3.5': [
    {
      id: '3.5-order-hsrp',
      type: 'ordering',
      skill: 'implement',
      difficulty: 'medium',
      concept: 'HSRP configuration',
      question: 'Order the steps to make R1 the preferred active HSRP gateway on Gi0/0 (group 1, VIP 192.168.1.1).',
      orderItems: [
        'interface gi0/0',
        'ip address 192.168.1.2 255.255.255.0',
        'standby 1 ip 192.168.1.1',
        'standby 1 priority 150',
        'standby 1 preempt',
      ],
      explanation: 'Interface IP first, then virtual IP, raise priority above default 100, enable preempt so R1 reclaims Active after recovery.',
    },
  ],
  '4.6': [
    {
      id: '4.6-order-dhcp',
      type: 'ordering',
      skill: 'implement',
      difficulty: 'medium',
      concept: 'DHCP relay path',
      question: 'Order the events when a remote PC receives DHCP via a relay agent.',
      orderItems: [
        'PC sends DHCPDISCOVER broadcast on its local LAN',
        'Router receives broadcast on client interface and unicasts to server (helper-address)',
        'DHCP server offers an IP address',
        'Relay forwards the offer back to the PC',
      ],
      explanation: 'Discover is broadcast locally; relay converts to unicast toward the server; offer returns through the relay.',
    },
  ],
  '4.8': [
    {
      id: '4.8-order-ssh',
      type: 'ordering',
      skill: 'implement',
      difficulty: 'medium',
      concept: 'SSH setup',
      question: 'Put these IOS steps in the correct order to enable SSH-only VTY access with local login.',
      orderItems: [
        'ip domain-name ccna.local',
        'crypto key generate rsa modulus 2048',
        'username admin privilege 15 secret <password>',
        'line vty 0 4',
        'login local',
        'transport input ssh',
      ],
      explanation: 'Domain name before RSA keys; local user before `login local`; restrict VTY to SSH last.',
    },
  ],
  '5.5': [
    {
      id: '5.5-order-acl',
      type: 'ordering',
      skill: 'implement',
      difficulty: 'hard',
      concept: 'Extended ACL workflow',
      question: 'Order the steps to create and apply a named extended ACL that permits HTTP/HTTPS from LAN to servers.',
      orderItems: [
        'ip access-list extended WEB_TO_SRV',
        'permit tcp 192.168.1.0 0.0.0.255 10.0.0.0 0.0.0.255 eq 80',
        'permit tcp 192.168.1.0 0.0.0.255 10.0.0.0 0.0.0.255 eq 443',
        'deny ip any any',
        'interface gi0/0',
        'ip access-group WEB_TO_SRV in',
      ],
      explanation: 'Build ACEs in order (specific permits, explicit deny for clarity), then apply inbound close to source.',
    },
    {
      id: '5.5-ts-placement',
      type: 'troubleshooting',
      skill: 'troubleshoot',
      difficulty: 'hard',
      concept: 'ACL placement',
      question: 'An extended ACL on R1 Gi0/0 **inbound** blocks return traffic from servers to PCs, but outbound requests work. What design fix is best?',
      choices: [
        'Move the extended ACL outbound on Gi0/1 toward servers',
        'Add permit ip any any above the deny',
        'Convert to a standard ACL on Gi0/2',
        'Apply the same ACL inbound on Gi0/1 and Gi0/0',
      ],
      correctIndex: 0,
      explanation: 'Extended ACLs filtering server-bound traffic should be applied outbound toward the destination.',
    },
  ],
  '5.6': [
    {
      id: '5.6-order-dai',
      type: 'ordering',
      skill: 'implement',
      difficulty: 'hard',
      concept: 'DAI prerequisites',
      question: 'Order the steps to deploy Dynamic ARP Inspection correctly on a VLAN.',
      orderItems: [
        'ip dhcp snooping',
        'ip dhcp snooping vlan 10',
        'ip dhcp snooping trust on uplink to DHCP server',
        'ip arp inspection vlan 10',
        'ip arp inspection trust on validated host/uplink ports',
      ],
      explanation: 'DHCP Snooping must build bindings before DAI can validate ARP; trust only server/uplink and known-good ports.',
    },
  ],
  '2.5': [
    {
      id: '2.5-order-stp',
      type: 'ordering',
      skill: 'design',
      difficulty: 'medium',
      concept: 'STP root placement',
      question: 'Order the design decisions when planning STP root placement in a campus LAN.',
      orderItems: [
        'Identify the core/distribution switch that should be the logical center',
        'Lower bridge priority on the chosen root (or use `root primary`)',
        'Confirm blocked ports are on redundant edge links, not access uplinks',
        'Verify primary paths align with desired traffic flow',
      ],
      explanation: 'Root should sit at the stable core; priority influences election; verify blocked ports match the intended topology.',
    },
  ],
  '1.2': [
    {
      id: '1.2-order-tier',
      type: 'ordering',
      skill: 'design',
      difficulty: 'medium',
      concept: 'Three-tier hierarchy',
      question: 'Order these layers from user-facing edge to WAN/core aggregation (top-down design flow).',
      orderItems: [
        'Access layer — connects end devices',
        'Distribution layer — policy, routing between access blocks',
        'Core layer — high-speed backbone between distribution blocks',
      ],
      explanation: 'Classic campus design flows access → distribution → core as traffic aggregates toward the backbone.',
    },
  ],
  '3.2': [
    {
      id: '3.2-order-forward',
      type: 'ordering',
      skill: 'troubleshoot',
      difficulty: 'medium',
      concept: 'Router forwarding lookup',
      question: 'Order the steps a router takes to forward a packet to `10.50.1.20` (default process).',
      orderItems: [
        'Decrement TTL and recompute L3 checksum',
        'Longest-prefix match lookup in the routing table',
        'Identify the outgoing interface and next-hop from the matched route',
        'Rewrite L2 destination (ARP/ND) and transmit on the egress interface',
      ],
      explanation: 'Lookup precedes egress rewrite; TTL decrement happens during the forward decision on the router.',
    },
  ],
  '4.3': [
    {
      id: '4.3-ts-dns',
      type: 'troubleshooting',
      skill: 'troubleshoot',
      difficulty: 'medium',
      concept: 'DNS resolution failure',
      question: 'Users can ping `8.8.8.8` but browsing fails. `nslookup www.example.com` times out. `show ip dhcp binding` shows clients received DNS `0.0.0.0`. What is the most likely fix?',
      choices: [
        'Add `dns-server 8.8.8.8` (or internal DNS) to the DHCP pool',
        'Enable `ip domain-lookup` on the router',
        'Increase the DHCP lease time',
        'Add a static route to 8.8.8.8',
      ],
      correctIndex: 0,
      explanation: 'Reachability works but name resolution fails — clients were never given a valid DNS server in DHCP.',
    },
  ],
  '5.7': [
    {
      id: '5.7-order-aaa',
      type: 'ordering',
      skill: 'implement',
      difficulty: 'medium',
      concept: 'AAA login flow',
      question: 'Order the AAA phases when a user logs into a router via VTY.',
      orderItems: [
        'Authentication — verify username/password',
        'Authorization — determine permitted privilege level/commands',
        'Accounting — log session start, commands, and stop time',
      ],
      explanation: 'AAA always runs authenticate first, then authorize what they may do, then account for what they did.',
    },
  ],
}

export const SKILL_QUESTIONS = mergeSkillMaps(SKILL_QUESTIONS_CORE, SKILL_QUESTIONS_EXTENDED)

export function getSkillQuestions(objectiveId) {
  return (SKILL_QUESTIONS[objectiveId] || []).map(q =>
    applyAnswerReviewToQuestion({ ...q, objectiveId }),
  )
}

export function allSkillQuestions() {
  return Object.entries(SKILL_QUESTIONS).flatMap(([objectiveId, qs]) =>
    qs.map(q => applyAnswerReviewToQuestion({ ...q, objectiveId })),
  )
}
