/* =========================================================================
   CURATED CCNA CONTENT — Domain 1 objectives not yet in ccnaCurated.js
   Objectives: 1.1, 1.2, 1.3, 1.4, 1.7, 1.10, 1.11, 1.12
   ========================================================================= */

const CURATED_SOURCES = {
  blueprint: 'Cisco CCNA 200-301 v1.1 Exam Topics',
  certVol1: 'Cisco Press CCNA 200-301 Official Cert Guide, Vol 1 (Odom)',
  jeremy: "Jeremy's IT Lab — CCNA 200-301 Notes",
}

/* -------------------------------------------------------------------------
   OBJECTIVE 1.1 — Network components
   ------------------------------------------------------------------------- */
export const OBJ_11 = {
  objectiveId: '1.1',
  domainId: 'fundamentals',
  title: 'Network components (routers, switches, firewalls, APs, controllers)',
  ckus: [
    { id: 'CKU-ROUTER', title: 'Router', summary: 'A Layer 3 device that forwards packets between networks/subnets using its routing table. Connects different IP networks and is the default gateway for many LANs.', aliases: ['L3 router', 'gateway router'], tags: ['router', 'layer3', 'routing'], prerequisiteCkuIds: [], relatedCkuIds: ['CKU-SWITCH', 'CKU-FIREWALL'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Network Devices — Routers', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.1', confidence: 1 }] },
    { id: 'CKU-SWITCH', title: 'Switch (L2 and L3)', summary: 'L2 switches forward frames using the MAC address table within a VLAN. L3 switches also route between VLANs via SVIs without a separate router.', aliases: ['L2 switch', 'L3 switch', 'MLS'], tags: ['switch', 'layer2', 'layer3'], prerequisiteCkuIds: [], relatedCkuIds: ['CKU-ROUTER', 'CKU-AP-WLAN'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Network Devices — Switches', confidence: 0.95 }, { sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 2 — Network Devices', confidence: 0.9 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.1', confidence: 1 }] },
    { id: 'CKU-FIREWALL', title: 'Next-Generation Firewall (NGFW)', summary: 'Performs stateful packet filtering and application-aware inspection. Often integrates IPS/IDS to detect and block malicious traffic inline or via out-of-band analysis.', aliases: ['NGFW', 'stateful firewall'], tags: ['security', 'firewall'], prerequisiteCkuIds: [], relatedCkuIds: ['CKU-ROUTER'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Network Devices — Firewalls', confidence: 0.9 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.1', confidence: 1 }] },
    { id: 'CKU-AP-WLAN', title: 'Access Point and Controller', summary: 'APs bridge wireless clients to the wired LAN — autonomous (standalone) or lightweight (WLC-managed). Controllers (WLC, DNA Center) centralize config, monitoring, and policy for many APs.', aliases: ['WAP', 'WLC', 'wireless controller'], tags: ['wireless', 'wlan', 'management'], prerequisiteCkuIds: ['CKU-SWITCH'], relatedCkuIds: ['CKU-SWITCH'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Wireless — AP Modes', confidence: 0.9 }, { sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 2 — Controllers', confidence: 0.85 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.1', confidence: 1 }] },
  ],
  reading: {
    id: 'READ-1.1', ckuIds: ['CKU-ROUTER', 'CKU-SWITCH', 'CKU-FIREWALL', 'CKU-AP-WLAN'], estimatedReadMinutes: 7,
    tiers: {
      beginner: 'Every network is built from a few key device types. Routers connect different networks at Layer 3. Switches connect devices inside one LAN at Layer 2 (or route between VLANs if they are Layer 3 switches). Firewalls filter traffic for security. Access points give Wi‑Fi clients a path to the wired network. Controllers manage many APs (or other devices) from one place. Endpoints are PCs, phones, and IoT; servers provide services like DNS and web hosting.',
      intermediate: 'Routers use routing tables to forward IP packets between subnets — they are the default gateway for LANs. L2 switches learn MAC addresses and forward frames within a broadcast domain; L3 switches add SVIs to route between VLANs without an external router. NGFWs do stateful filtering plus application-aware inspection, often with integrated IPS/IDS. APs bridge 802.11 clients to Ethernet — autonomous (standalone) or lightweight (WLC-managed). Controllers (WLC, DNA Center) push config and policy to many devices. Endpoints consume services; servers (DNS, DHCP, web) serve clients.',
      examReady: 'Know each device’s OSI layer and role: **Router** — L3, inter-network forwarding via routing table, default gateway. **L2 switch** — MAC table, same-VLAN forwarding. **L3 switch** — L2 + inter-VLAN routing via SVIs. **NGFW** — stateful + app-aware filtering, IPS/IDS inline or OOB. **AP** — wireless-to-wired bridge; autonomous vs lightweight (WLC). **Controller** — centralized config/monitoring (WLC for WLAN, DNA Center for automation). **Endpoint** — client device (PC, phone, IoT). **Server** — provides network services (DNS, DHCP, file, web). Exam items often ask which device belongs at a boundary vs inside a LAN.',
    },
    definition: 'A modern network combines **routers** (L3 inter-network), **switches** (L2/L3 LAN), **firewalls** (security enforcement), **access points** (wireless access), and **controllers** (centralized management), with **endpoints** and **servers** at the edge.',
    keyPoints: [
      'Router = Layer 3, routing table, connects subnets.',
      'L2 switch = MAC table, same broadcast domain.',
      'L3 switch = switching + SVI-based inter-VLAN routing.',
      'NGFW = stateful + application-aware filtering, often with IPS/IDS.',
      'AP bridges wireless to wired; lightweight APs need a WLC.',
      'Controllers centralize config and monitoring for many devices.',
    ],
    realWorld: 'A branch office might use an L3 switch for user VLANs, a router for WAN, an NGFW at the edge, and lightweight APs registered to a WLC. DNS/DHCP run on servers; laptops and phones are endpoints.',
    commonMistakes: [
      'Using a router where an L2 switch suffices inside a flat LAN.',
      'Expecting an L2 switch to route between VLANs without an L3 device.',
      'Confusing an AP with a router — APs bridge wireless clients to the wired LAN.',
      'Treating IPS and firewall as the same — IPS detects/blocks threats; firewall enforces policy.',
    ],
    related: ['1.2 Topology', '1.5 Switching', '2.6 Wireless architectures', '5.x Security'],
    advanced: 'SD-Access and DNA Center blur traditional roles by automating fabric underlay/overlay, but the exam still tests classic device functions at each layer.',
    sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 2 — Network Devices', confidence: 0.9 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.1', confidence: 1 }],
  },
  questions: [
    { id: '1.1-c-q1', concept: 'router layer', type: 'definition', difficulty: 'easy', question: 'At which OSI layer does a router primarily operate?', choices: ['Layer 1', 'Layer 2', 'Layer 3', 'Layer 7'], correctIndex: 2, explanation: 'Routers forward packets based on IP addresses — Layer 3.', ckuIds: ['CKU-ROUTER'] },
    { id: '1.1-c-q2', concept: 'switch function', type: 'definition', difficulty: 'easy', question: 'What does a Layer 2 switch use to forward frames?', choices: ['Routing table', 'MAC address table', 'DNS cache', 'ACL list'], correctIndex: 1, explanation: 'L2 switches forward using the MAC address (CAM) table.', ckuIds: ['CKU-SWITCH'] },
    { id: '1.1-c-q3', concept: 'l3 switch', type: 'scenario', difficulty: 'medium', question: 'You need to route between VLAN 10 and VLAN 20 on one campus switch without an external router. Which device feature applies?', choices: ['Port mirroring', 'SVI on a Layer 3 switch', 'Spanning Tree', 'EtherChannel'], correctIndex: 1, explanation: 'An L3 switch uses SVIs to route between VLANs locally.', ckuIds: ['CKU-SWITCH'] },
    { id: '1.1-c-q4', concept: 'firewall', type: 'definition', difficulty: 'medium', question: 'What distinguishes a next-generation firewall from a basic packet filter?', choices: ['It only blocks UDP', 'Stateful and application-aware inspection', 'It replaces switches', 'It operates only at Layer 1'], correctIndex: 1, explanation: 'NGFWs track connection state and inspect applications, not just IP/port.', ckuIds: ['CKU-FIREWALL'] },
    { id: '1.1-c-q5', concept: 'lightweight ap', type: 'scenario', difficulty: 'medium', question: 'A lightweight AP cannot join the network until it discovers and registers with a…', choices: ['DNS server', 'Wireless LAN controller (WLC)', 'Core router only', 'DHCP relay'], correctIndex: 1, explanation: 'Lightweight APs are managed by a WLC; they do not run full standalone config.', ckuIds: ['CKU-AP-WLAN'] },
    { id: '1.1-c-q6', concept: 'endpoint vs server', type: 'definition', difficulty: 'easy', question: 'Which is an example of an endpoint?', choices: ['Web server', 'DNS server', 'Employee laptop', 'Core router'], correctIndex: 2, explanation: 'Endpoints are client devices like PCs, phones, and IoT — not infrastructure providing services.', ckuIds: ['CKU-ROUTER'] },
    { id: '1.1-c-q7', concept: 'default gateway', type: 'scenario', difficulty: 'medium', question: 'A PC sends traffic to a remote subnet. Which device typically receives it first?', choices: ['The access switch only', 'The default gateway (router or L3 switch SVI)', 'The WLC', 'The DNS server'], correctIndex: 1, explanation: 'Off-subnet traffic goes to the configured default gateway — usually a router or L3 switch.', ckuIds: ['CKU-ROUTER'] },
    { id: '1.1-c-q8', concept: 'controller role', type: 'true-false', difficulty: 'easy', question: 'True or False: A wireless LAN controller centralizes AP configuration and policy.', choices: ['True', 'False'], correctIndex: 0, explanation: 'True — WLCs manage lightweight APs from a central point.', ckuIds: ['CKU-AP-WLAN'] },
  ],
  flashcards: [
    { id: '1.1-f1', ckuId: 'CKU-ROUTER', front: 'Router — layer and job?', back: 'Layer 3; forwards packets between networks using the routing table.' },
    { id: '1.1-f2', ckuId: 'CKU-SWITCH', front: 'L2 switch forwarding basis?', back: 'MAC address table; same VLAN/broadcast domain.' },
    { id: '1.1-f3', ckuId: 'CKU-SWITCH', front: 'How does an L3 switch route between VLANs?', back: 'Switch Virtual Interfaces (SVIs) — no separate router required.' },
    { id: '1.1-f4', ckuId: 'CKU-FIREWALL', front: 'NGFW beyond basic filtering?', back: 'Stateful + application-aware inspection; often integrated IPS/IDS.' },
    { id: '1.1-f5', ckuId: 'CKU-AP-WLAN', front: 'Autonomous vs lightweight AP?', back: 'Autonomous = standalone config; lightweight = managed by a WLC.' },
    { id: '1.1-f6', ckuId: 'CKU-AP-WLAN', front: 'Examples of network controllers?', back: 'WLC (wireless), Cisco DNA Center (campus automation).' },
  ],
  commands: [
    { id: '1.1-cmd1', command: 'show ip route', mode: 'privileged EXEC', purpose: 'Display the router routing table (L3 forwarding decisions).', example: 'R1# show ip route', ckuIds: ['CKU-ROUTER'] },
    { id: '1.1-cmd2', command: 'show mac address-table', mode: 'privileged EXEC', purpose: 'Show L2 switch MAC-to-port mappings.', example: 'SW1# show mac address-table', ckuIds: ['CKU-SWITCH'] },
    { id: '1.1-cmd3', command: 'show wireless summary', mode: 'privileged EXEC', purpose: 'On a WLC, summarize registered APs and WLAN status.', example: 'WLC# show wireless summary', ckuIds: ['CKU-AP-WLAN'] },
  ],
  glossary: [
    { id: '1.1-g1', term: 'Default gateway', definition: 'The L3 device (router or SVI) a host uses to reach other subnets.', ckuIds: ['CKU-ROUTER'] },
    { id: '1.1-g2', term: 'SVI', definition: 'Switch Virtual Interface — a routed VLAN interface on an L3 switch.', ckuIds: ['CKU-SWITCH'] },
    { id: '1.1-g3', term: 'IPS/IDS', definition: 'Intrusion Prevention/Detection System — identifies and blocks malicious traffic.', ckuIds: ['CKU-FIREWALL'] },
  ],
  mnemonics: [
    { id: '1.1-m1', title: 'Device layers', mnemonic: '“Switch at 2, route at 3.”', explanation: 'L2 switches forward frames; routers (and L3 switches) route packets.', ckuIds: ['CKU-SWITCH', 'CKU-ROUTER'] },
  ],
  examTraps: [
    { id: '1.1-t1', trap: 'Calling an AP a router.', correction: 'An AP bridges wireless clients to the wired LAN; it does not perform inter-network routing.', ckuIds: ['CKU-AP-WLAN'] },
    { id: '1.1-t2', trap: 'Expecting an L2 switch to route VLANs.', correction: 'Inter-VLAN routing requires an L3 device — router or L3 switch with SVIs.', ckuIds: ['CKU-SWITCH'] },
  ],
  misconceptions: [
    { id: '1.1-x1', misconception: 'More switches always mean better routing.', reality: 'Switches extend L2 domains; routing is an L3 function on routers or L3 switches.', example: 'Ten L2 switches in one VLAN still need one gateway for off-subnet traffic.', ckuIds: ['CKU-ROUTER', 'CKU-SWITCH'] },
    { id: '1.1-x2', misconception: 'Firewalls and IPS are interchangeable.', reality: 'Firewalls enforce access policy; IPS focuses on threat detection/prevention — often deployed together.', example: 'An NGFW may integrate both, but they serve different primary roles.', ckuIds: ['CKU-FIREWALL'] },
  ],
  diagram: {
    id: 'DIAG-1.1-devices', title: 'Typical enterprise device roles', type: 'topology', ckuIds: ['CKU-ROUTER', 'CKU-SWITCH', 'CKU-AP-WLAN'],
    nodes: [
      { id: 'fw', label: 'NGFW', type: 'firewall', x: 50, y: 12 },
      { id: 'rtr', label: 'Router', type: 'router', x: 50, y: 32 },
      { id: 'sw', label: 'L3 Switch', type: 'switch', x: 50, y: 52 },
      { id: 'ap', label: 'Lightweight AP', type: 'ap', x: 25, y: 78 },
      { id: 'pc', label: 'Endpoint PC', type: 'pc', x: 75, y: 78 },
      { id: 'srv', label: 'Server (DNS/DHCP)', type: 'server', x: 50, y: 92 },
    ],
    links: [
      { id: 'l1', source: 'fw', target: 'rtr', label: 'WAN edge' },
      { id: 'l2', source: 'rtr', target: 'sw', label: 'L3 boundary' },
      { id: 'l3', source: 'sw', target: 'ap', label: 'PoE trunk' },
      { id: 'l4', source: 'sw', target: 'pc', label: 'access VLAN' },
      { id: 'l5', source: 'sw', target: 'srv', label: 'server VLAN' },
    ],
    annotations: ['Router/L3 switch = default gateway.', 'AP bridges wireless; WLC manages lightweight APs (not shown).'],
    sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 2', confidence: 0.85 }],
  },
  packetFlow: {
    id: 'FLOW-1.1-offsubnet', title: 'Endpoint to remote subnet via gateway', ckuIds: ['CKU-ROUTER', 'CKU-SWITCH'], diagramId: 'DIAG-1.1-devices',
    steps: [
      { id: 's1', order: 1, title: 'Host sends', action: 'PC sends an IP packet destined for a remote subnet to its default gateway MAC (router/SVI).', successState: 'forwarded' },
      { id: 's2', order: 2, title: 'Switch forwards', action: 'L2 switch delivers the frame to the gateway port using the MAC table.', successState: 'forwarded' },
      { id: 's3', order: 3, title: 'Router routes', action: 'Router decapsulates, looks up the routing table, and forwards toward the destination network.', successState: 'forwarded' },
    ],
  },
}

/* -------------------------------------------------------------------------
   OBJECTIVE 1.2 — Network topology architectures
   ------------------------------------------------------------------------- */
export const OBJ_12 = {
  objectiveId: '1.2',
  domainId: 'fundamentals',
  title: 'Network topology architectures',
  ckus: [
    { id: 'CKU-CAMPUS-TIER', title: 'Campus Tiered Design', summary: 'Classic three-tier: Access (end devices), Distribution (aggregation, policy, routing boundary), Core (high-speed backbone). Two-tier collapses distribution and core for smaller sites.', aliases: ['three-tier', 'hierarchical design'], tags: ['topology', 'campus'], prerequisiteCkuIds: [], relatedCkuIds: ['CKU-SPINE-LEAF'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Network Topologies', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.2', confidence: 1 }] },
    { id: 'CKU-SPINE-LEAF', title: 'Spine-Leaf (Clos)', summary: 'Data-center fabric where every leaf switch connects to every spine switch — predictable, low-latency, non-blocking east-west traffic.', aliases: ['Clos fabric', 'leaf-spine'], tags: ['topology', 'datacenter'], prerequisiteCkuIds: ['CKU-CAMPUS-TIER'], relatedCkuIds: ['CKU-CAMPUS-TIER'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 2 — Data Center', confidence: 0.9 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.2', confidence: 1 }] },
    { id: 'CKU-WAN-TOPO', title: 'WAN Topologies', summary: 'Hub-and-spoke routes all sites through a central hub (cost-effective). Full mesh connects every site directly (redundant, expensive). Dual-homed adds backup links.', aliases: ['hub-spoke', 'full mesh'], tags: ['wan', 'topology'], prerequisiteCkuIds: [], relatedCkuIds: ['CKU-CLOUD-ONPREM'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'WAN Topologies', confidence: 0.9 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.2', confidence: 1 }] },
    { id: 'CKU-CLOUD-ONPREM', title: 'SOHO, On-Prem vs Cloud', summary: 'SOHO networks are small flat LANs, often one combo router/AP. On-prem = owned/managed locally. Cloud delivers compute/storage as IaaS/PaaS/SaaS with shared responsibility between provider and customer.', aliases: ['cloud computing', 'SOHO', 'hybrid cloud'], tags: ['cloud', 'deployment', 'soho'], prerequisiteCkuIds: [], relatedCkuIds: ['CKU-CAMPUS-TIER'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Cloud vs On-Prem', confidence: 0.85 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.2', confidence: 1 }] },
  ],
  reading: {
    id: 'READ-1.2', ckuIds: ['CKU-CAMPUS-TIER', 'CKU-SPINE-LEAF', 'CKU-WAN-TOPO', 'CKU-CLOUD-ONPREM'], estimatedReadMinutes: 7,
    tiers: {
      beginner: 'Networks are organized in patterns called topologies. A campus often has access switches for users, distribution for combining links and policy, and a fast core backbone — or just two tiers in smaller buildings. Data centers use spine-leaf: every server switch (leaf) connects to every spine for even paths. WANs can be hub-and-spoke (all traffic through one site) or mesh (every site talks directly). Home/SOHO networks are small and flat. Cloud moves servers off-site; on-prem keeps them local — both can coexist.',
      intermediate: 'Three-tier campus: Access connects endpoints; Distribution aggregates access layers and is the routing/policy boundary; Core provides high-speed non-blocking transport. Two-tier (collapsed core) merges distribution+core for mid-size sites. Spine-leaf in data centers gives predictable latency — each leaf uplinks to all spines, avoiding oversubscription for east-west VM traffic. WAN hub-and-spoke is cheap but the hub is a single point; full mesh is resilient but costly. SOHO = flat LAN + combo gateway/AP. Cloud models: IaaS (you manage OS/apps), PaaS (you manage apps), SaaS (you use the app) — shared responsibility with the provider.',
      examReady: 'Match architecture to use case: **Campus 3-tier** — Access / Distribution / Core; **2-tier** — collapsed core for smaller campuses. **Spine-leaf** — DC fabric, every leaf ↔ every spine, non-blocking east-west. **WAN hub-and-spoke** — remote sites via central hub (cheap, hub dependency); **full mesh** — all sites interconnected (expensive, resilient); **dual-homed** — redundant uplinks. **SOHO** — small flat network, often integrated router/firewall/AP. **On-prem vs cloud** — local ownership vs IaaS/PaaS/SaaS with shared responsibility. Exam questions often contrast spine-leaf vs traditional tiered or hub-spoke vs mesh trade-offs.',
    },
    definition: '**Topology architecture** describes how devices interconnect — campus tiers (access/distribution/core), **spine-leaf** fabrics for data centers, **WAN** patterns (hub-spoke, mesh), **SOHO** simplicity, and **on-prem vs cloud** deployment models.',
    keyPoints: [
      'Access = endpoints; Distribution = aggregation + policy; Core = fast backbone.',
      'Two-tier campus collapses distribution and core.',
      'Spine-leaf: every leaf connects to every spine — predictable DC scaling.',
      'Hub-and-spoke WAN = central hub; full mesh = all-to-all (costly).',
      'SOHO = small flat network, often one combo device.',
      'Cloud: IaaS / PaaS / SaaS with shared responsibility.',
    ],
    realWorld: 'A retail chain uses hub-and-spoke WAN to a HQ data center; the HQ DC uses spine-leaf for server racks. Branch stores run SOHO-style gear; HR SaaS runs in the cloud while POS stays on-prem.',
    commonMistakes: [
      'Using spine-leaf terminology for a traditional campus three-tier design.',
      'Assuming hub-and-spoke provides site-to-site redundancy without dual-homed links.',
      'Thinking “cloud” means no on-prem network — hybrid is common.',
      'Placing policy at the core instead of distribution in tiered campus design.',
    ],
    related: ['1.1 Network components', '3.x Routing', '4.x Cloud services'],
    advanced: 'SD-Access fabric overlays automate policy in campus; still conceptually maps to tiered underlay with controller-based segmentation.',
    sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 2 — Network Architectures', confidence: 0.9 }],
  },
  questions: [
    { id: '1.2-c-q1', concept: 'access tier', type: 'definition', difficulty: 'easy', question: 'In a three-tier campus design, which tier connects end-user devices?', choices: ['Core', 'Distribution', 'Access', 'Spine'], correctIndex: 2, explanation: 'Access switches connect PCs, phones, and APs.', ckuIds: ['CKU-CAMPUS-TIER'] },
    { id: '1.2-c-q2', concept: 'spine-leaf', type: 'definition', difficulty: 'medium', question: 'Spine-leaf architecture is primarily used for…', choices: ['SOHO Wi‑Fi', 'Data center east-west traffic', 'Dial-up WAN', 'Home gaming'], correctIndex: 1, explanation: 'Spine-leaf fabrics optimize predictable, scalable traffic between servers in data centers.', ckuIds: ['CKU-SPINE-LEAF'] },
    { id: '1.2-c-q3', concept: 'hub-spoke', type: 'scenario', difficulty: 'medium', question: 'Ten branch offices send all WAN traffic through headquarters. Which topology is this?', choices: ['Full mesh', 'Hub-and-spoke', 'Spine-leaf', 'Point-to-point only'], correctIndex: 1, explanation: 'All spokes via one hub = hub-and-spoke.', ckuIds: ['CKU-WAN-TOPO'] },
    { id: '1.2-c-q4', concept: 'full mesh', type: 'definition', difficulty: 'medium', question: 'What is the main trade-off of a full-mesh WAN?', choices: ['No redundancy', 'High cost/complexity for many links', 'Only works with fiber', 'Eliminates routing'], correctIndex: 1, explanation: 'Full mesh connects every site to every other — resilient but expensive.', ckuIds: ['CKU-WAN-TOPO'] },
    { id: '1.2-c-q5', concept: 'two-tier', type: 'definition', difficulty: 'easy', question: 'A collapsed core campus design has how many tiers?', choices: ['One', 'Two', 'Four', 'Five'], correctIndex: 1, explanation: 'Two-tier merges distribution and core — access + collapsed distribution/core.', ckuIds: ['CKU-CAMPUS-TIER'] },
    { id: '1.2-c-q6', concept: 'soho', type: 'scenario', difficulty: 'easy', question: 'A home user has one wireless router providing NAT, DHCP, and Wi‑Fi. This is typical of…', choices: ['Core datacenter', 'SOHO', 'Full mesh WAN', 'Spine fabric'], correctIndex: 1, explanation: 'Small office/home office networks are simple, often one integrated gateway.', ckuIds: ['CKU-CLOUD-ONPREM'] },
    { id: '1.2-c-q7', concept: 'cloud model', type: 'definition', difficulty: 'medium', question: 'In which cloud model does the customer manage the operating system but not the physical hardware?', choices: ['SaaS', 'PaaS', 'IaaS', 'On-prem only'], correctIndex: 2, explanation: 'IaaS provides VMs/infrastructure; the customer manages OS and above.', ckuIds: ['CKU-CLOUD-ONPREM'] },
    { id: '1.2-c-q8', concept: 'spine connectivity', type: 'true-false', difficulty: 'medium', question: 'True or False: In spine-leaf, each leaf switch connects to every spine switch.', choices: ['True', 'False'], correctIndex: 0, explanation: 'True — full mesh between leaves and spines is the defining property.', ckuIds: ['CKU-SPINE-LEAF'] },
  ],
  flashcards: [
    { id: '1.2-f1', ckuId: 'CKU-CAMPUS-TIER', front: 'Three campus tiers?', back: 'Access (end devices), Distribution (aggregation/policy), Core (backbone).' },
    { id: '1.2-f2', ckuId: 'CKU-SPINE-LEAF', front: 'Spine-leaf used where?', back: 'Data centers — every leaf uplinks to all spines for predictable scaling.' },
    { id: '1.2-f3', ckuId: 'CKU-WAN-TOPO', front: 'Hub-and-spoke vs full mesh?', back: 'Hub-spoke = cheap, hub dependency; full mesh = all sites linked, costly.' },
    { id: '1.2-f4', ckuId: 'CKU-CLOUD-ONPREM', front: 'SOHO characteristics?', back: 'Small flat network; often one combo router/AP with NAT and DHCP.' },
    { id: '1.2-f5', ckuId: 'CKU-CLOUD-ONPREM', front: 'IaaS vs SaaS — who manages the app?', back: 'IaaS: you manage OS/apps; SaaS: provider manages everything — you use the app.' },
  ],
  commands: [
    { id: '1.2-cmd1', command: 'show cdp neighbors', mode: 'privileged EXEC', purpose: 'Discover physical neighbor topology on Cisco devices.', example: 'SW1# show cdp neighbors detail', ckuIds: ['CKU-CAMPUS-TIER'] },
    { id: '1.2-cmd2', command: 'show ip interface brief', mode: 'privileged EXEC', purpose: 'Summarize interface IPs — useful when mapping WAN hub-spoke links.', example: 'R1# show ip interface brief', ckuIds: ['CKU-WAN-TOPO'] },
  ],
  glossary: [
    { id: '1.2-g1', term: 'Collapsed core', definition: 'Two-tier campus design merging distribution and core layers.', ckuIds: ['CKU-CAMPUS-TIER'] },
    { id: '1.2-g2', term: 'East-west traffic', definition: 'Server-to-server traffic within a data center (vs north-south to clients).', ckuIds: ['CKU-SPINE-LEAF'] },
    { id: '1.2-g3', term: 'Shared responsibility', definition: 'Cloud model dividing security/ops duties between provider and customer.', ckuIds: ['CKU-CLOUD-ONPREM'] },
  ],
  mnemonics: [
    { id: '1.2-m1', title: 'Campus tiers', mnemonic: '“ADC — Access, Distribution, Core.”', explanation: 'Bottom to top in classic three-tier campus design.', ckuIds: ['CKU-CAMPUS-TIER'] },
  ],
  examTraps: [
    { id: '1.2-t1', trap: 'Calling spine-leaf a WAN topology.', correction: 'Spine-leaf is a data-center switching fabric, not a branch WAN pattern.', ckuIds: ['CKU-SPINE-LEAF'] },
    { id: '1.2-t2', trap: 'Assuming hub-and-spoke has automatic redundancy.', correction: 'The hub is a single point of failure unless spokes are dual-homed or meshed.', ckuIds: ['CKU-WAN-TOPO'] },
  ],
  misconceptions: [
    { id: '1.2-x1', misconception: 'Cloud means no local network.', reality: 'Hybrid designs keep on-prem LAN/WAN while using cloud for apps or compute.', example: 'Office LAN on-prem + Microsoft 365 SaaS.', ckuIds: ['CKU-CLOUD-ONPREM'] },
    { id: '1.2-x2', misconception: 'More tiers always mean faster networks.', reality: 'Tiers organize scale and policy; extra hops can add latency if over-engineered.', example: 'SOHO needs one tier, not three.', ckuIds: ['CKU-CAMPUS-TIER'] },
  ],
  diagram: {
    id: 'DIAG-1.2-topologies', title: 'Campus tier vs spine-leaf', type: 'topology', ckuIds: ['CKU-CAMPUS-TIER', 'CKU-SPINE-LEAF'],
    nodes: [
      { id: 'core', label: 'Core', type: 'router', x: 25, y: 15 },
      { id: 'dist', label: 'Distribution', type: 'switch', x: 25, y: 40 },
      { id: 'acc', label: 'Access', type: 'switch', x: 25, y: 65 },
      { id: 'sp1', label: 'Spine', type: 'switch', x: 72, y: 25 },
      { id: 'sp2', label: 'Spine', type: 'switch', x: 88, y: 25 },
      { id: 'lf1', label: 'Leaf', type: 'switch', x: 72, y: 60 },
      { id: 'lf2', label: 'Leaf', type: 'switch', x: 88, y: 60 },
    ],
    links: [
      { id: 'c1', source: 'core', target: 'dist' }, { id: 'c2', source: 'dist', target: 'acc' },
      { id: 's1', source: 'sp1', target: 'lf1' }, { id: 's2', source: 'sp1', target: 'lf2' },
      { id: 's3', source: 'sp2', target: 'lf1' }, { id: 's4', source: 'sp2', target: 'lf2' },
    ],
    annotations: ['Left: tiered campus (ADC).', 'Right: each leaf ↔ every spine.'],
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Topologies', confidence: 0.85 }],
  },
  packetFlow: {
    id: 'FLOW-1.2-hubspoke', title: 'Branch traffic via WAN hub', ckuIds: ['CKU-WAN-TOPO'], diagramId: 'DIAG-1.2-topologies',
    steps: [
      { id: 's1', order: 1, title: 'Branch sends', action: 'Remote site sends traffic destined for another branch or HQ service.', successState: 'forwarded' },
      { id: 's2', order: 2, title: 'Via hub', action: 'In hub-and-spoke, traffic traverses the central hub router first.', successState: 'forwarded' },
      { id: 's3', order: 3, title: 'Hub forwards', action: 'Hub routes the packet toward the destination spoke or HQ server.', successState: 'forwarded' },
    ],
  },
}

/* -------------------------------------------------------------------------
   OBJECTIVE 1.3 — Physical interface and cabling types
   ------------------------------------------------------------------------- */
export const OBJ_13 = {
  objectiveId: '1.3',
  domainId: 'fundamentals',
  title: 'Physical interface and cabling types',
  ckus: [
    { id: 'CKU-UTP', title: 'Copper UTP (Cat5e/6/6a)', summary: 'Unshielded twisted-pair copper with RJ-45 connectors. Max ~100 m per segment. Cat6a supports 10 Gbps. Straight-through connects unlike devices; crossover for like devices (legacy — auto-MDIX common).', aliases: ['Ethernet copper', 'RJ-45'], tags: ['cabling', 'copper'], prerequisiteCkuIds: [], relatedCkuIds: ['CKU-FIBER', 'CKU-SFP'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Cabling — Copper', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.3', confidence: 1 }] },
    { id: 'CKU-FIBER', title: 'Fiber Optic (SM vs MM)', summary: 'Single-mode (yellow, laser, long distance, smaller core) vs multimode (orange/aqua, LED/laser, shorter runs, larger core). Connectors include LC, SC, ST.', aliases: ['single-mode', 'multimode'], tags: ['cabling', 'fiber'], prerequisiteCkuIds: [], relatedCkuIds: ['CKU-UTP', 'CKU-SFP'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 2 — Cabling', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.3', confidence: 1 }] },
    { id: 'CKU-CABLE-TYPES', title: 'Straight-Through vs Crossover', summary: 'Straight-through: pinouts match (TX→RX on unlike devices — PC to switch). Crossover swaps pairs for like devices (switch-to-switch on older gear). Modern NICs often auto-MDIX.', aliases: ['T568A/B', 'auto-MDIX'], tags: ['cabling', 'pinout'], prerequisiteCkuIds: ['CKU-UTP'], relatedCkuIds: ['CKU-UTP'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Cable Types', confidence: 0.9 }] },
    { id: 'CKU-SFP', title: 'SFP / SFP+ Transceiver', summary: 'Hot-swappable modular transceivers in switch/router ports — copper or fiber media, enabling flexible uplinks without replacing the whole device.', aliases: ['GBIC successor', 'mini-GBIC'], tags: ['transceiver', 'modular'], prerequisiteCkuIds: ['CKU-FIBER'], relatedCkuIds: ['CKU-FIBER', 'CKU-UTP'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 2 — SFP', confidence: 0.85 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.3', confidence: 1 }] },
  ],
  reading: {
    id: 'READ-1.3', ckuIds: ['CKU-UTP', 'CKU-FIBER', 'CKU-CABLE-TYPES', 'CKU-SFP'], estimatedReadMinutes: 6,
    tiers: {
      beginner: 'Ethernet runs over copper cables (UTP) with RJ-45 plugs or over glass/plastic fiber. Copper is cheap and fine for short runs up to about 100 meters. Fiber goes much farther and is immune to electrical interference. You pick straight-through cables for PC-to-switch links and crossover for switch-to-switch on old gear — modern ports often auto-fix the wiring. SFP modules let you plug copper or fiber into the same switch slot.',
      intermediate: 'UTP categories (Cat5e, Cat6, Cat6a) define bandwidth and crosstalk performance — Cat6a handles 10G to 100 m. T568A/B pinouts define pair order; straight-through uses the same standard both ends; crossover swaps transmit/receive pairs. Fiber: single-mode (yellow, 9 µm core, laser, km-scale) vs multimode (orange/aqua, 50/62.5 µm, hundreds of meters). LC is common on SFPs. Choose media by distance, speed, environment, and cost.',
      examReady: '**Copper UTP** — RJ-45, 100 m max, Cat5e/6/6a (10G on 6a). **Straight-through** — unlike devices (PC↔switch, router↔switch); **crossover** — like devices (switch↔switch, PC↔PC legacy); **auto-MDIX** auto-corrects. **Fiber SM** — yellow, long haul, laser; **MM** — orange/aqua, campus/building, shorter. Connectors: LC, SC, ST. **SFP/SFP+** — modular transceivers for copper or fiber uplinks. Selection criteria: distance, bandwidth, EMI, cost.',
    },
    definition: 'Physical connectivity uses **copper UTP** (RJ-45, 100 m) or **fiber** (SM for distance, MM for shorter high-speed runs), with **straight-through/crossover** pinouts and **SFP** modules for flexible media on switches.',
    keyPoints: [
      'UTP max ~100 m; Cat6a supports 10 Gbps.',
      'Straight-through = unlike devices; crossover = like devices (legacy).',
      'SM fiber = long distance/yellow; MM = shorter/orange-aqua.',
      'LC connector common on SFP modules.',
      'SFP/SFP+ = hot-swappable copper or fiber transceivers.',
    ],
    realWorld: 'Access switches use copper to desks; building uplinks use fiber SFPs. A wrong cable type (crossover where straight-through is needed) shows link-down until auto-MDIX fixes it or you swap cables.',
    commonMistakes: [
      'Using multimode fiber for multi-kilometer spans — SM is required.',
      'Exceeding 100 m on copper without a repeater or fiber.',
      'Mixing SM fiber with MM optics — they are not interchangeable.',
      'Assuming crossover is always needed between switches (auto-MDIX).',
    ],
    related: ['1.4 Cable issues', '2.7 WLAN physical connections'],
    advanced: 'BiDi SFPs use one fiber strand with different wavelengths; still need matching optics on both ends.',
    sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 2 — Cabling', confidence: 0.9 }],
  },
  questions: [
    { id: '1.3-c-q1', concept: 'utp distance', type: 'definition', difficulty: 'easy', question: 'What is the maximum recommended length for a copper UTP Ethernet segment?', choices: ['10 m', '100 m', '500 m', '1 km'], correctIndex: 1, explanation: 'UTP Ethernet is limited to about 100 meters per segment.', ckuIds: ['CKU-UTP'] },
    { id: '1.3-c-q2', concept: 'straight-through', type: 'scenario', difficulty: 'easy', question: 'Which cable type connects a PC to a switch?', choices: ['Crossover', 'Straight-through', 'Console rollover', 'Fiber SM only'], correctIndex: 1, explanation: 'PC-to-switch is unlike devices — straight-through.', ckuIds: ['CKU-CABLE-TYPES'] },
    { id: '1.3-c-q3', concept: 'sm vs mm', type: 'definition', difficulty: 'medium', question: 'Which fiber type is typically used for long-distance WAN links?', choices: ['Multimode orange', 'Single-mode yellow', 'Copper Cat5', 'Coax'], correctIndex: 1, explanation: 'Single-mode fiber (often yellow) supports long laser-based runs.', ckuIds: ['CKU-FIBER'] },
    { id: '1.3-c-q4', concept: 'connector', type: 'definition', difficulty: 'medium', question: 'Which connector is commonly found on SFP modules?', choices: ['RJ-45', 'LC', 'DB-9', 'USB-C'], correctIndex: 1, explanation: 'LC is the dominant fiber connector on SFP/SFP+ transceivers.', ckuIds: ['CKU-SFP', 'CKU-FIBER'] },
    { id: '1.3-c-q5', concept: 'cat6a', type: 'definition', difficulty: 'medium', question: 'Cat6a UTP is associated with which speed at 100 m?', choices: ['100 Mbps', '1 Gbps', '10 Gbps', '40 Gbps'], correctIndex: 2, explanation: 'Cat6a is rated for 10 Gbps at 100 m.', ckuIds: ['CKU-UTP'] },
    { id: '1.3-c-q6', concept: 'crossover', type: 'scenario', difficulty: 'medium', question: 'Two legacy switches without auto-MDIX need which cable?', choices: ['Straight-through', 'Crossover', 'Console', 'Serial DCE'], correctIndex: 1, explanation: 'Like devices historically required crossover to swap TX/RX pairs.', ckuIds: ['CKU-CABLE-TYPES'] },
    { id: '1.3-c-q7', concept: 'sfp purpose', type: 'definition', difficulty: 'easy', question: 'What is the primary benefit of SFP modules?', choices: ['Increase CPU speed', 'Flexible hot-swappable media on a port', 'Replace STP', 'Encrypt traffic'], correctIndex: 1, explanation: 'SFPs let you choose copper or fiber media per port without changing the switch.', ckuIds: ['CKU-SFP'] },
    { id: '1.3-c-q8', concept: 'mm color', type: 'true-false', difficulty: 'easy', question: 'True or False: Multimode fiber is often orange or aqua jacketed.', choices: ['True', 'False'], correctIndex: 0, explanation: 'True — MM is commonly orange (OM2) or aqua (OM3/OM4); SM is often yellow.', ckuIds: ['CKU-FIBER'] },
  ],
  flashcards: [
    { id: '1.3-f1', ckuId: 'CKU-UTP', front: 'UTP max distance and common connector?', back: '~100 m; RJ-45.' },
    { id: '1.3-f2', ckuId: 'CKU-CABLE-TYPES', front: 'Straight-through vs crossover?', back: 'Straight = unlike devices; crossover = like devices (legacy).' },
    { id: '1.3-f3', ckuId: 'CKU-FIBER', front: 'SM vs MM — distance and color?', back: 'SM = yellow, long haul; MM = orange/aqua, shorter campus runs.' },
    { id: '1.3-f4', ckuId: 'CKU-SFP', front: 'What is an SFP?', back: 'Hot-swappable transceiver — copper or fiber in a modular switch port.' },
    { id: '1.3-f5', ckuId: 'CKU-UTP', front: 'Cat6a speed at 100 m?', back: '10 Gbps.' },
  ],
  commands: [
    { id: '1.3-cmd1', command: 'show interfaces status', mode: 'privileged EXEC', purpose: 'See port speed, duplex, and media type on a switch.', example: 'SW1# show interfaces status', ckuIds: ['CKU-UTP'] },
    { id: '1.3-cmd2', command: 'show interfaces transceiver', mode: 'privileged EXEC', purpose: 'Display SFP/SFP+ module type and optical levels.', example: 'SW1# show interfaces transceiver', ckuIds: ['CKU-SFP'] },
  ],
  glossary: [
    { id: '1.3-g1', term: 'Auto-MDIX', definition: 'Automatic crossover detection — modern ports adjust for straight or crossover cables.', ckuIds: ['CKU-CABLE-TYPES'] },
    { id: '1.3-g2', term: 'Single-mode fiber', definition: 'Fiber with a small core for long-distance laser transmission.', ckuIds: ['CKU-FIBER'] },
    { id: '1.3-g3', term: 'Multimode fiber', definition: 'Fiber with a larger core for shorter high-speed campus links.', ckuIds: ['CKU-FIBER'] },
  ],
  mnemonics: [
    { id: '1.3-m1', title: 'Fiber colors', mnemonic: '“Yellow goes far (SM); orange/aqua stays near (MM).”', explanation: 'Visual jacket colors often distinguish SM vs MM in the exam.', ckuIds: ['CKU-FIBER'] },
  ],
  examTraps: [
    { id: '1.3-t1', trap: 'Using MM fiber for km-scale links.', correction: 'Long distance requires single-mode fiber and matching SM optics.', ckuIds: ['CKU-FIBER'] },
    { id: '1.3-t2', trap: 'Always choosing crossover switch-to-switch.', correction: 'Modern auto-MDIX usually allows straight-through between switches.', ckuIds: ['CKU-CABLE-TYPES'] },
  ],
  misconceptions: [
    { id: '1.3-x1', misconception: 'Fiber has no distance limit.', reality: 'SM has much longer reach than MM, but both have spec limits and need correct optics.', example: 'OM4 MM may reach ~400 m at 10G depending on grade.', ckuIds: ['CKU-FIBER'] },
    { id: '1.3-x2', misconception: 'Higher Cat number means longer distance.', reality: 'All UTP Ethernet stays ~100 m; higher categories support higher bandwidth.', example: 'Cat6a = 10G at 100 m, not 1 km.', ckuIds: ['CKU-UTP'] },
  ],
  diagram: {
    id: 'DIAG-1.3-cabling', title: 'Copper vs fiber selection', type: 'topology', ckuIds: ['CKU-UTP', 'CKU-FIBER', 'CKU-SFP'],
    nodes: [
      { id: 'pc', label: 'PC (RJ-45)', type: 'pc', x: 15, y: 50 },
      { id: 'sw', label: 'Access Switch', type: 'switch', x: 40, y: 50 },
      { id: 'sfp', label: 'SFP uplink', type: 'process', x: 65, y: 35, status: 'highlighted' },
      { id: 'core', label: 'Core Switch', type: 'switch', x: 88, y: 50 },
      { id: 'fiber', label: 'SM Fiber (long)', type: 'subnet', x: 76, y: 15 },
    ],
    links: [
      { id: 'l1', source: 'pc', target: 'sw', label: 'UTP 100m' },
      { id: 'l2', source: 'sw', target: 'sfp', label: 'SFP slot' },
      { id: 'l3', source: 'sfp', target: 'core', label: 'fiber' },
      { id: 'l4', source: 'fiber', target: 'core', label: 'WAN/building' },
    ],
    annotations: ['Copper to the desk; fiber between buildings.', 'Match SM/MM and connector type on both ends.'],
    sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 2', confidence: 0.85 }],
  },
  packetFlow: {
    id: 'FLOW-1.3-media', title: 'Frame across copper then fiber uplink', ckuIds: ['CKU-UTP', 'CKU-SFP'], diagramId: 'DIAG-1.3-cabling',
    steps: [
      { id: 's1', order: 1, title: 'Copper ingress', action: 'PC sends an Ethernet frame over UTP to the access switch.', successState: 'forwarded' },
      { id: 's2', order: 2, title: 'Switch forwards', action: 'Access switch forwards the frame toward the uplink SFP port.', successState: 'forwarded' },
      { id: 's3', order: 3, title: 'Fiber uplink', action: 'SFP converts electrical signal to optical (or copper on SFP-RJ45) toward the core.', successState: 'forwarded' },
    ],
  },
}

/* -------------------------------------------------------------------------
   OBJECTIVE 1.4 — Identify interface and cable issues
   ------------------------------------------------------------------------- */
export const OBJ_14 = {
  objectiveId: '1.4',
  domainId: 'fundamentals',
  title: 'Identify interface and cable issues',
  ckus: [
    { id: 'CKU-IF-ERRORS', title: 'Interface Error Counters', summary: 'show interfaces (or show interfaces counters errors) reveals input/output errors, CRC, runts, giants, and collisions — symptoms of physical or duplex problems.', aliases: ['interface statistics', 'error counters'], tags: ['troubleshooting', 'layer1'], prerequisiteCkuIds: ['CKU-UTP'], relatedCkuIds: ['CKU-DUPLEX-MISMATCH', 'CKU-CRC'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Troubleshooting Layer 1', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.4', confidence: 1 }] },
    { id: 'CKU-CRC', title: 'CRC Errors', summary: 'Cyclic redundancy check failures indicate corrupted frames — often bad cable, loose connector, EMI, or duplex mismatch.', aliases: ['FCS errors'], tags: ['errors', 'layer1'], prerequisiteCkuIds: ['CKU-IF-ERRORS'], relatedCkuIds: ['CKU-DUPLEX-MISMATCH'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 2 — Troubleshooting', confidence: 0.9 }] },
    { id: 'CKU-DUPLEX-MISMATCH', title: 'Duplex Mismatch', summary: 'One side half-duplex, other full-duplex causes late collisions, CRC errors, and slow/intermittent connectivity — common when one end is auto and the other forced.', aliases: ['speed/duplex mismatch'], tags: ['duplex', 'troubleshooting'], prerequisiteCkuIds: ['CKU-IF-ERRORS'], relatedCkuIds: ['CKU-CRC'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Duplex Mismatch', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.4', confidence: 1 }] },
    { id: 'CKU-COLLISIONS', title: 'Collisions (Half-Duplex)', summary: 'Excessive collisions occur on half-duplex links when two devices transmit simultaneously. Rare on modern full-duplex switched ports except with duplex mismatch.', aliases: ['late collisions'], tags: ['half-duplex', 'errors'], prerequisiteCkuIds: ['CKU-DUPLEX-MISMATCH'], relatedCkuIds: ['CKU-DUPLEX-MISMATCH'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Collisions', confidence: 0.9 }] },
  ],
  reading: {
    id: 'READ-1.4', ckuIds: ['CKU-IF-ERRORS', 'CKU-CRC', 'CKU-DUPLEX-MISMATCH', 'CKU-COLLISIONS'], estimatedReadMinutes: 6,
    tiers: {
      beginner: 'When a link is slow or flapping, check the physical layer first. Commands like show interfaces reveal error counters. CRC errors mean damaged frames — often a bad cable or interference. Collisions happen when two devices talk at once on half-duplex. A duplex mismatch (one side full, one half) causes both CRC errors and collisions even though the link shows “up.”',
      intermediate: 'Use `show interfaces <int>` or `show interfaces counters errors` for input errors, output errors, CRC, runts, giants, and collisions. Rising CRCs point to L1/L2 issues: faulty cable, dirty fiber, EMI, or duplex mismatch. Duplex mismatch: one end forced full-duplex while the other negotiates half — symptoms include slow throughput and increasing CRC/late collisions. On modern switched full-duplex links, collisions should be near zero; any sustained collisions suggest misconfiguration.',
      examReady: 'Troubleshoot L1/L2 with **`show interfaces`** / **`show interfaces counters errors`**. **CRC** = frame corruption (bad cable, connector, EMI, duplex mismatch). **Collisions/late collisions** = half-duplex contention or duplex mismatch on a link that should be full-duplex. **Runts/giants** = undersized/oversized frames (often bad NIC or misconfig). Fix: replace cable, clean connectors, match **speed/duplex** (prefer auto-auto or both forced identically), verify SFP compatibility. Link up/down flapping may be separate from error counters — check both status and errors.',
    },
    definition: 'Interface and cable issues surface as **error counters** — especially **CRC**, **collisions**, and **input errors** — often caused by faulty media, EMI, or **duplex/speed mismatch**.',
    keyPoints: [
      'Verify with show interfaces / show interfaces counters errors.',
      'CRC errors → cable, connector, EMI, or duplex mismatch.',
      'Collisions on modern switched ports → suspect duplex mismatch.',
      'Match speed and duplex on both ends (auto-auto is fine).',
      'Runts/giants indicate malformed frame sizes.',
    ],
    realWorld: 'A user reports “slow network” on one port; show interfaces Gi0/5 shows thousands of CRCs — the patch cable was damaged. Replacing it cleared errors immediately.',
    commonMistakes: [
      'Ignoring error counters when the link status is “up/up”.',
      'Forcing full-duplex on one side while leaving the other on auto half.',
      'Chasing Layer 3 routing when CRCs indicate Layer 1.',
      'Replacing a switch when the SFP or fiber patch is the fault.',
    ],
    related: ['1.3 Cabling', '1.5 Switching', '3.6 Troubleshooting routing'],
    advanced: 'Micro-bursts can cause output drops without CRCs — use counters over time, not a single snapshot.',
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Layer 1 Troubleshooting', confidence: 0.9 }],
  },
  questions: [
    { id: '1.4-c-q1', concept: 'crc meaning', type: 'definition', difficulty: 'easy', question: 'CRC errors on an interface most often indicate…', choices: ['Correct routing', 'Frame corruption on the wire', 'DNS failure', 'Valid VLAN tagging'], correctIndex: 1, explanation: 'CRC failures mean the frame checksum failed — physical or duplex problems.', ckuIds: ['CKU-CRC'] },
    { id: '1.4-c-q2', concept: 'verify command', type: 'application', difficulty: 'easy', question: 'Which command best shows interface CRC and collision counters?', choices: ['show ip route', 'show interfaces counters errors', 'show vlan brief', 'show version'], correctIndex: 1, explanation: 'show interfaces counters errors focuses on L1/L2 error statistics.', ckuIds: ['CKU-IF-ERRORS'] },
    { id: '1.4-c-q3', concept: 'duplex mismatch', type: 'scenario', difficulty: 'medium', question: 'Switch port forced full-duplex; PC auto-negotiates half-duplex. Expected symptom?', choices: ['No connectivity at all', 'Slow performance with CRC and late collisions', 'Double speed', 'STP blocking'], correctIndex: 1, explanation: 'Duplex mismatch causes errors and poor throughput while link may stay up.', ckuIds: ['CKU-DUPLEX-MISMATCH'] },
    { id: '1.4-c-q4', concept: 'collisions', type: 'definition', difficulty: 'medium', question: 'On a modern full-duplex switch access port, sustained collisions suggest…', choices: ['Normal operation', 'Duplex mismatch or misconfiguration', 'OSPF adjacency', 'DHCP renewal'], correctIndex: 1, explanation: 'Full-duplex switched ports should not collide — suspect mismatch or bad media.', ckuIds: ['CKU-COLLISIONS'] },
    { id: '1.4-c-q5', concept: 'fix order', type: 'troubleshooting', difficulty: 'medium', question: 'First step when CRC errors increment on one link?', choices: ['Reload the router', 'Check/replace cable and verify speed/duplex', 'Change VLAN', 'Enable OSPF'], correctIndex: 1, explanation: 'Physical layer and speed/duplex alignment are the first checks for CRCs.', ckuIds: ['CKU-CRC', 'CKU-DUPLEX-MISMATCH'] },
    { id: '1.4-c-q6', concept: 'runts', type: 'definition', difficulty: 'hard', question: 'Runt frames are…', choices: ['Oversized frames', 'Undersized frames below minimum Ethernet size', 'Broadcast frames only', 'Encrypted frames'], correctIndex: 1, explanation: 'Runts are frames smaller than the minimum valid Ethernet size.', ckuIds: ['CKU-IF-ERRORS'] },
    { id: '1.4-c-q7', concept: 'link up errors', type: 'true-false', difficulty: 'easy', question: 'True or False: An interface can show up/up while still accumulating CRC errors.', choices: ['True', 'False'], correctIndex: 0, explanation: 'True — link status does not guarantee error-free transmission.', ckuIds: ['CKU-IF-ERRORS'] },
    { id: '1.4-c-q8', concept: 'emi', type: 'scenario', difficulty: 'medium', question: 'CRC errors appear only on a cable running parallel to power lines. Likely cause?', choices: ['Wrong IP subnet', 'Electromagnetic interference on copper', 'Missing default route', 'WPA3 misconfig'], correctIndex: 1, explanation: 'EMI corrupts electrical signals on UTP — reroute cable or use shielded/fiber media.', ckuIds: ['CKU-CRC'] },
  ],
  flashcards: [
    { id: '1.4-f1', ckuId: 'CKU-CRC', front: 'CRC errors usually mean?', back: 'Corrupted frames — bad cable, connector, EMI, or duplex mismatch.' },
    { id: '1.4-f2', ckuId: 'CKU-DUPLEX-MISMATCH', front: 'Duplex mismatch symptoms?', back: 'Slow link, rising CRC and late collisions while status may stay up.' },
    { id: '1.4-f3', ckuId: 'CKU-IF-ERRORS', front: 'Command for error counters?', back: 'show interfaces counters errors (or show interfaces <int>).' },
    { id: '1.4-f4', ckuId: 'CKU-COLLISIONS', front: 'Collisions on full-duplex switch port?', back: 'Abnormal — check duplex mismatch or faulty hardware.' },
    { id: '1.4-f5', ckuId: 'CKU-DUPLEX-MISMATCH', front: 'Best practice for speed/duplex?', back: 'Auto on both ends, or identically forced on both — never mixed.' },
  ],
  commands: [
    { id: '1.4-cmd1', command: 'show interfaces counters errors', mode: 'privileged EXEC', purpose: 'Display CRC, input, output, and other interface error counters.', example: 'SW1# show interfaces counters errors', ckuIds: ['CKU-IF-ERRORS'] },
    { id: '1.4-cmd2', command: 'show interfaces <interface>', mode: 'privileged EXEC', purpose: 'Detailed status including errors, speed, and duplex for one port.', example: 'SW1# show interfaces gigabitethernet0/1', ckuIds: ['CKU-IF-ERRORS', 'CKU-DUPLEX-MISMATCH'] },
    { id: '1.4-cmd3', command: 'speed auto / duplex auto', mode: 'interface config', purpose: 'Enable auto-negotiation for speed and duplex on both ends.', example: 'SW1(config-if)# duplex auto', ckuIds: ['CKU-DUPLEX-MISMATCH'] },
  ],
  glossary: [
    { id: '1.4-g1', term: 'CRC error', definition: 'Frame failed the cyclic redundancy check — indicates corruption in transit.', ckuIds: ['CKU-CRC'] },
    { id: '1.4-g2', term: 'Late collision', definition: 'Collision detected after the slot time — classic duplex mismatch symptom.', ckuIds: ['CKU-COLLISIONS'] },
    { id: '1.4-g3', term: 'Auto-negotiation', definition: 'Process where linked devices agree on highest common speed and duplex.', ckuIds: ['CKU-DUPLEX-MISMATCH'] },
  ],
  mnemonics: [
    { id: '1.4-m1', title: 'CRC causes', mnemonic: '“Cable, RF, Collision-duplex.”', explanation: 'CRCs often trace to bad Cable, EMI (RF interference), or duplex/Collision issues.', ckuIds: ['CKU-CRC'] },
  ],
  examTraps: [
    { id: '1.4-t1', trap: 'Assuming up/up means healthy link.', correction: 'Always check error counters — CRCs can climb while status stays up.', ckuIds: ['CKU-IF-ERRORS'] },
    { id: '1.4-t2', trap: 'Forcing full-duplex on one side only.', correction: 'Both ends must match — use auto-auto or identical manual settings.', ckuIds: ['CKU-DUPLEX-MISMATCH'] },
  ],
  misconceptions: [
    { id: '1.4-x1', misconception: 'Collisions are normal on all Ethernet links.', reality: 'Full-duplex switched links should have near-zero collisions.', example: 'Persistent collisions on Gi0/1 → investigate duplex, not “busy network.”', ckuIds: ['CKU-COLLISIONS'] },
    { id: '1.4-x2', misconception: 'CRC errors always mean replace the switch.', reality: 'Most CRC issues are cable, SFP, or duplex — not the switch ASIC.', example: 'Swap patch cable before RMA on the switch.', ckuIds: ['CKU-CRC'] },
  ],
  diagram: {
    id: 'DIAG-1.4-errors', title: 'Duplex mismatch error path', type: 'process', ckuIds: ['CKU-DUPLEX-MISMATCH', 'CKU-CRC'],
    nodes: [
      { id: 'sw', label: 'Switch (full)', type: 'switch', x: 25, y: 40, status: 'highlighted' },
      { id: 'pc', label: 'PC (half auto)', type: 'pc', x: 75, y: 40 },
      { id: 'crc', label: 'CRC ++', type: 'process', x: 50, y: 70, status: 'error' },
      { id: 'col', label: 'Late collisions', type: 'process', x: 50, y: 88, status: 'error' },
    ],
    links: [
      { id: 'l1', source: 'sw', target: 'pc', label: 'same cable' },
      { id: 'l2', source: 'pc', target: 'crc', label: 'corrupt frames' },
      { id: 'l3', source: 'crc', target: 'col', label: 'symptom chain' },
    ],
    annotations: ['Link may show up/up.', 'Fix: match speed/duplex or replace bad cable.'],
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Duplex', confidence: 0.85 }],
  },
  packetFlow: {
    id: 'FLOW-1.4-crc', title: 'Frame corrupted by bad media', ckuIds: ['CKU-CRC', 'CKU-IF-ERRORS'], diagramId: 'DIAG-1.4-errors',
    steps: [
      { id: 's1', order: 1, title: 'Transmit', action: 'Device sends a valid Ethernet frame onto the link.', successState: 'forwarded' },
      { id: 's2', order: 2, title: 'Corruption', action: 'Noise, bad cable, or duplex mismatch corrupts bits in transit.', successState: 'dropped' },
      { id: 's3', order: 3, title: 'CRC fail', action: 'Receiver drops the frame and increments the CRC error counter.', successState: 'dropped' },
    ],
  },
}

/* -------------------------------------------------------------------------
   OBJECTIVE 1.7 — Describe private IPv4 addressing
   ------------------------------------------------------------------------- */
export const OBJ_17 = {
  objectiveId: '1.7',
  domainId: 'fundamentals',
  title: 'Describe private IPv4 addressing',
  ckus: [
    { id: 'CKU-RFC1918', title: 'RFC 1918 Private Address Space', summary: 'Three private IPv4 ranges not routable on the public Internet: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. Used inside organizations with NAT for Internet access.', aliases: ['private IP', 'RFC1918'], tags: ['ipv4', 'private'], prerequisiteCkuIds: [], relatedCkuIds: ['CKU-PUBLIC-PRIVATE', 'CKU-APIPA'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 11 — Private Addressing', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.7', confidence: 1 }] },
    { id: 'CKU-PUBLIC-PRIVATE', title: 'Public vs Private IPv4', summary: 'Public addresses are globally unique and Internet-routable. Private addresses are reused internally and must be translated (NAT) to reach the Internet.', aliases: ['global vs private'], tags: ['ipv4', 'nat'], prerequisiteCkuIds: ['CKU-RFC1918'], relatedCkuIds: ['CKU-RFC1918'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Public vs Private', confidence: 0.95 }] },
    { id: 'CKU-APIPA', title: 'APIPA (169.254.0.0/16)', summary: 'Automatic Private IP Addressing — when DHCP fails, Windows (and others) self-assigns 169.254.x.x link-local address. Indicates no DHCP lease; limited local communication only.', aliases: ['link-local IPv4', '169.254'], tags: ['dhcp', 'troubleshooting'], prerequisiteCkuIds: ['CKU-RFC1918'], relatedCkuIds: ['CKU-PUBLIC-PRIVATE'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'APIPA', confidence: 0.9 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.7', confidence: 1 }] },
  ],
  reading: {
    id: 'READ-1.7', ckuIds: ['CKU-RFC1918', 'CKU-PUBLIC-PRIVATE', 'CKU-APIPA'], estimatedReadMinutes: 5,
    tiers: {
      beginner: 'Not every IP address can go on the Internet. Private addresses (like 192.168.1.x) are free to reuse inside homes and companies. Three official ranges exist: 10.x.x.x, 172.16–31.x.x, and 192.168.x.x. When your PC cannot get DHCP, it may assign itself a 169.254.x.x address — that means “I could not reach a DHCP server.” Public addresses are unique worldwide and used on the Internet, often after NAT translates your private address.',
      intermediate: 'RFC 1918 defines private space: 10.0.0.0/8, 172.16.0.0/12 (172.16.0.0–172.31.255.255), 192.168.0.0/16. These are not forwarded by Internet routers — organizations use NAT/PAT at the edge to share one or few public IPs. Public addresses are assigned by registries/ISPs and must be unique globally. APIPA (169.254.0.0/16) is self-assigned when DHCP fails — host can talk link-local but not reach other subnets or the Internet normally.',
      examReady: '**RFC 1918 private ranges**: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` — not Internet-routable; **NAT** at the boundary. **Public** = globally unique, ISP-assigned, Internet-routable. **APIPA** = `169.254.0.0/16` — DHCP failure self-assign; troubleshooting signal (check DHCP server, relay, VLAN). Know which range a given address falls into and whether it can traverse the public Internet without translation.',
    },
    definition: '**Private IPv4** (RFC 1918) addresses are reused internally and require **NAT** for Internet access; **public** addresses are globally unique; **APIPA** (`169.254.x.x`) indicates DHCP failure.',
    keyPoints: [
      '10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 = RFC 1918 private.',
      'Private addresses are not routed on the public Internet.',
      'NAT translates private → public at the network edge.',
      'APIPA 169.254.0.0/16 = DHCP failed, link-local only.',
      'Public IPs are globally unique and ISP-assigned.',
    ],
    realWorld: 'Home routers use 192.168.x.x LANs and NAT to one public ISP address. A laptop showing 169.254.x.x after joining Wi‑Fi usually means DHCP is broken or blocked.',
    commonMistakes: [
      'Thinking 169.254.x.x is RFC 1918 private space — it is APIPA/link-local.',
      'Using public IPs internally without justification (wastes routable space).',
      'Forgetting 172.16.0.0/12 spans 172.16–172.31, not just 172.16.0.0/16.',
      'Assuming private hosts reach the Internet without NAT.',
    ],
    related: ['1.6 Subnetting', '1.10 Client IP verify', '4.1 NAT'],
    advanced: 'Carrier-grade NAT (CGN) uses RFC 6598 shared address space (100.64.0.0/10) — outside CCNA core but explains double-NAT at ISPs.',
    sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 11', confidence: 0.95 }],
  },
  questions: [
    { id: '1.7-c-q1', concept: 'rfc1918 ranges', type: 'definition', difficulty: 'easy', question: 'Which is an RFC 1918 private network?', choices: ['8.8.8.0/24', '192.168.50.0/24', '203.0.113.0/24', '169.254.1.0/24'], correctIndex: 1, explanation: '192.168.0.0/16 is one of the three RFC 1918 ranges.', ckuIds: ['CKU-RFC1918'] },
    { id: '1.7-c-q2', concept: '10 range', type: 'definition', difficulty: 'easy', question: 'The 10.0.0.0/8 block is…', choices: ['Public routable space', 'Private non-Internet-routable space', 'Multicast only', 'APIPA'], correctIndex: 1, explanation: '10.0.0.0/8 is private per RFC 1918.', ckuIds: ['CKU-RFC1918'] },
    { id: '1.7-c-q3', concept: '172 range', type: 'application', difficulty: 'medium', question: 'Is 172.20.5.10 a private address?', choices: ['No — public only', 'Yes — within 172.16.0.0/12', 'Only if DHCP assigns it', 'Only on IPv6'], correctIndex: 1, explanation: '172.16.0.0–172.31.255.255 is the 172.16.0.0/12 private range.', ckuIds: ['CKU-RFC1918'] },
    { id: '1.7-c-q4', concept: 'apipa', type: 'scenario', difficulty: 'medium', question: 'A Windows PC shows IP 169.254.88.3. What is the most likely cause?', choices: ['Successful DHCP lease', 'DHCP failure / no lease obtained', 'Static public IP configured', 'DNS cache flush'], correctIndex: 1, explanation: '169.254.x.x is APIPA — self-assigned when DHCP fails.', ckuIds: ['CKU-APIPA'] },
    { id: '1.7-c-q5', concept: 'public private', type: 'definition', difficulty: 'medium', question: 'Why must private addresses use NAT to reach the Internet?', choices: ['They are too short', 'They are not globally unique and are not routed publicly', 'They are IPv6 only', 'Firewalls block all IPv4'], correctIndex: 1, explanation: 'Private space is reused and non-routable on the Internet — NAT maps to a public address.', ckuIds: ['CKU-PUBLIC-PRIVATE'] },
    { id: '1.7-c-q6', concept: 'identify public', type: 'application', difficulty: 'easy', question: 'Which address is public (Internet-routable)?', choices: ['10.1.1.1', '172.16.1.1', '198.51.100.50', '192.168.1.1'], correctIndex: 2, explanation: '198.51.100.0/24 is documentation/public space — not RFC 1918 private.', ckuIds: ['CKU-PUBLIC-PRIVATE'] },
    { id: '1.7-c-q7', concept: 'apipa scope', type: 'true-false', difficulty: 'easy', question: 'True or False: APIPA addresses are in the same RFC 1918 private ranges as 192.168.x.x.', choices: ['True', 'False'], correctIndex: 1, explanation: 'False — APIPA uses 169.254.0.0/16, separate from RFC 1918.', ckuIds: ['CKU-APIPA'] },
    { id: '1.7-c-q8', concept: 'nat role', type: 'scenario', difficulty: 'medium', question: 'Many PCs on 192.168.1.0/24 share one ISP public IP. Which technology enables this?', choices: ['STP', 'NAT/PAT', 'VTP', 'LLDP'], correctIndex: 1, explanation: 'NAT (often PAT) translates many private addresses to one or few public IPs.', ckuIds: ['CKU-PUBLIC-PRIVATE'] },
  ],
  flashcards: [
    { id: '1.7-f1', ckuId: 'CKU-RFC1918', front: 'Three RFC 1918 private ranges?', back: '10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.' },
    { id: '1.7-f2', ckuId: 'CKU-APIPA', front: 'APIPA range and meaning?', back: '169.254.0.0/16 — DHCP failed, self-assigned link-local.' },
    { id: '1.7-f3', ckuId: 'CKU-PUBLIC-PRIVATE', front: 'Public vs private — routable on Internet?', back: 'Public yes (unique); private no (needs NAT).' },
    { id: '1.7-f4', ckuId: 'CKU-RFC1918', front: '172.16.0.0/12 covers which octets?', back: '172.16.0.0 through 172.31.255.255.' },
    { id: '1.7-f5', ckuId: 'CKU-PUBLIC-PRIVATE', front: 'Why NAT at the edge?', back: 'Translate many private hosts to one/few public IPs for Internet access.' },
  ],
  commands: [
    { id: '1.7-cmd1', command: 'ipconfig', mode: 'Windows CLI', purpose: 'View client IPv4 address — spot private vs APIPA ranges.', example: 'C:\\> ipconfig', ckuIds: ['CKU-APIPA', 'CKU-RFC1918'] },
    { id: '1.7-cmd2', command: 'show ip nat translations', mode: 'privileged EXEC', purpose: 'Verify NAT mapping private inside addresses to public outside.', example: 'R1# show ip nat translations', ckuIds: ['CKU-PUBLIC-PRIVATE'] },
  ],
  glossary: [
    { id: '1.7-g1', term: 'RFC 1918', definition: 'Standard defining private IPv4 address space for internal networks.', ckuIds: ['CKU-RFC1918'] },
    { id: '1.7-g2', term: 'APIPA', definition: 'Automatic self-assigned 169.254.x.x address when DHCP is unavailable.', ckuIds: ['CKU-APIPA'] },
    { id: '1.7-g3', term: 'NAT', definition: 'Network Address Translation — maps private addresses to public for Internet access.', ckuIds: ['CKU-PUBLIC-PRIVATE'] },
  ],
  mnemonics: [
    { id: '1.7-m1', title: 'RFC 1918 ranges', mnemonic: '“10 / 172.16–31 / 192.168.”', explanation: 'Memorize the three private blocks for quick exam classification.', ckuIds: ['CKU-RFC1918'] },
  ],
  examTraps: [
    { id: '1.7-t1', trap: 'Treating 169.254.x.x as normal private DHCP address.', correction: '169.254 is APIPA — indicates DHCP failure, not RFC 1918.', ckuIds: ['CKU-APIPA'] },
    { id: '1.7-t2', trap: 'Thinking 172.16.0.0/16 is the whole 172 private block.', correction: 'The private range is 172.16.0.0/12 (through 172.31.x.x).', ckuIds: ['CKU-RFC1918'] },
  ],
  misconceptions: [
    { id: '1.7-x1', misconception: 'Private addresses are secret/encrypted.', reality: 'Private means non-routable on the public Internet, not hidden from others on the same LAN.', example: '192.168.1.10 is visible to all hosts on that subnet.', ckuIds: ['CKU-RFC1918'] },
    { id: '1.7-x2', misconception: 'APIPA hosts can reach the Internet.', reality: 'Without a valid address/gateway/DHCP, Internet access fails until DHCP is restored.', example: '169.254.x.x PC cannot NAT through a router without proper config.', ckuIds: ['CKU-APIPA'] },
  ],
  diagram: {
    id: 'DIAG-1.7-private', title: 'Private LAN to public Internet via NAT', type: 'topology', ckuIds: ['CKU-RFC1918', 'CKU-PUBLIC-PRIVATE'],
    nodes: [
      { id: 'pc1', label: '192.168.1.10', type: 'pc', x: 20, y: 70 },
      { id: 'pc2', label: '192.168.1.11', type: 'pc', x: 40, y: 70 },
      { id: 'rtr', label: 'NAT Router', type: 'router', x: 50, y: 45, status: 'highlighted' },
      { id: 'isp', label: 'Public 203.0.113.5', type: 'cloud', x: 80, y: 45 },
      { id: 'web', label: 'Internet server', type: 'server', x: 80, y: 75 },
    ],
    links: [
      { id: 'l1', source: 'pc1', target: 'rtr', label: 'private' },
      { id: 'l2', source: 'pc2', target: 'rtr', label: 'private' },
      { id: 'l3', source: 'rtr', target: 'isp', label: 'NAT' },
      { id: 'l4', source: 'isp', target: 'web', label: 'public route' },
    ],
    annotations: ['RFC 1918 inside; public outside.', '169.254.x.x = no DHCP (APIPA), not shown here.'],
    sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 11', confidence: 0.9 }],
  },
  packetFlow: {
    id: 'FLOW-1.7-nat', title: 'Private host reaches public server', ckuIds: ['CKU-PUBLIC-PRIVATE', 'CKU-RFC1918'], diagramId: 'DIAG-1.7-private',
    steps: [
      { id: 's1', order: 1, title: 'Private source', action: 'PC 192.168.1.10 sends packet to a public destination via default gateway.', successState: 'forwarded' },
      { id: 's2', order: 2, title: 'NAT translate', action: 'Edge router replaces source IP with its public address (PAT may also change port).', successState: 'matched' },
      { id: 's3', order: 3, title: 'Internet forward', action: 'Packet traverses the Internet with a routable public source address.', successState: 'forwarded' },
    ],
  },
}

/* -------------------------------------------------------------------------
   OBJECTIVE 1.10 — Verify IP parameters for client OS
   ------------------------------------------------------------------------- */
export const OBJ_110 = {
  objectiveId: '1.10',
  domainId: 'fundamentals',
  title: 'Verify IP parameters for client OS',
  ckus: [
    { id: 'CKU-IPCONFIG', title: 'Client IP Verification (ipconfig / ip)', summary: 'Windows ipconfig /all shows IP, mask, gateway, DNS, MAC, and DHCP lease. Linux/macOS use ip addr, ip route, and resolv.conf for the same parameters.', aliases: ['ifconfig', 'ip addr'], tags: ['client', 'troubleshooting'], prerequisiteCkuIds: [], relatedCkuIds: ['CKU-PING-TRACE', 'CKU-DNS-GW-ISSUES'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Client Troubleshooting', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.10', confidence: 1 }] },
    { id: 'CKU-PING-TRACE', title: 'Ping and Traceroute', summary: 'ping tests reachability (ICMP). traceroute/tracert shows the hop-by-hop path to isolate where connectivity fails.', aliases: ['tracert', 'path analysis'], tags: ['icmp', 'troubleshooting'], prerequisiteCkuIds: ['CKU-IPCONFIG'], relatedCkuIds: ['CKU-DNS-GW-ISSUES'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 1 — Troubleshooting', confidence: 0.9 }] },
    { id: 'CKU-DNS-GW-ISSUES', title: 'Gateway and DNS Issues', summary: 'Wrong/missing default gateway → local subnet works, remote fails. Wrong DNS → IP works but names fail. Duplicate IP or wrong mask breaks local reachability.', aliases: ['default gateway', 'name resolution'], tags: ['troubleshooting', 'dhcp'], prerequisiteCkuIds: ['CKU-IPCONFIG'], relatedCkuIds: ['CKU-PING-TRACE'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'IP Parameters', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.10', confidence: 1 }] },
  ],
  reading: {
    id: 'READ-1.10', ckuIds: ['CKU-IPCONFIG', 'CKU-PING-TRACE', 'CKU-DNS-GW-ISSUES'], estimatedReadMinutes: 6,
    tiers: {
      beginner: 'When a PC cannot get online, check its IP settings first. On Windows, ipconfig /all shows address, mask, gateway, and DNS. ping tells you if something responds. tracert shows each router hop along the way. If you can ping an IP but not a website name, DNS is suspect. If you can ping your neighbor but not anything outside the subnet, check the default gateway.',
      intermediate: 'Verify four parameters: IP address, subnet mask, default gateway, DNS server(s). Windows: `ipconfig /all`; Linux/macOS: `ip addr`, `ip route`, `/etc/resolv.conf` or `scutil --dns`. `ping <ip>` tests L3 reachability; `tracert`/`traceroute` locates the failing hop. Symptom map: local OK / remote fail → gateway; IP OK / name fail → DNS; 169.254.x.x → DHCP; duplicate IP → intermittent drops; wrong mask → partial local failure.',
      examReady: 'Client verify workflow: (1) **ipconfig /all** (Win) or **ip addr** + **ip route** (Linux) — confirm IP/mask/gateway/DNS/DHCP. (2) **ping** default gateway → ping remote IP (e.g. 8.8.8.8) → **ping name** (tests DNS). (3) **tracert/traceroute** if ping fails mid-path. Common faults: **missing/wrong gateway** (local yes, remote no), **bad DNS** (IP yes, name no), **APIPA 169.254** (DHCP), **duplicate IP**, **wrong mask**. **nslookup/dig** tests DNS directly.',
    },
    definition: 'Verify client connectivity by checking **IP, mask, gateway, and DNS**, then using **ping** and **traceroute** to isolate **gateway vs DNS vs path** failures.',
    keyPoints: [
      'ipconfig /all — Windows IP parameters and DHCP lease.',
      'ip addr / ip route — Linux/macOS equivalent.',
      'ping gateway first, then remote IP, then hostname.',
      'Wrong gateway → local works, remote fails.',
      'Wrong DNS → IPs work, names fail.',
      '169.254.x.x = DHCP failure (APIPA).',
    ],
    realWorld: 'User “can’t open websites” but ping 8.8.8.8 works — DNS server in ipconfig points to an old decommissioned IP; fixing DNS resolves it.',
    commonMistakes: [
      'Pinging a hostname first when IP reachability is unknown.',
      'Ignoring subnet mask when hosts “same VLAN” cannot talk.',
      'Assuming DHCP always means settings are correct — wrong scope options happen.',
      'Using tracert before confirming local IP/gateway are valid.',
    ],
    related: ['1.7 Private addressing', '4.3 DHCP and DNS'],
    advanced: 'Split tunnel VPNs can send DNS to corporate servers — symptoms mimic “names fail for internal hosts only.”',
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Client Troubleshooting', confidence: 0.9 }],
  },
  questions: [
    { id: '1.10-c-q1', concept: 'ipconfig', type: 'application', difficulty: 'easy', question: 'Which Windows command shows IP address, mask, gateway, and DNS?', choices: ['netstat', 'ipconfig /all', 'arp -a', 'route print only'], correctIndex: 1, explanation: 'ipconfig /all displays full IPv4/IPv6 client parameters.', ckuIds: ['CKU-IPCONFIG'] },
    { id: '1.10-c-q2', concept: 'gateway symptom', type: 'scenario', difficulty: 'medium', question: 'A PC pings another host on the same /24 but cannot ping 8.8.8.8. Most likely issue?', choices: ['DNS server', 'Default gateway', 'Wrong VLAN on switch', 'WPA3'], correctIndex: 1, explanation: 'Same-subnet works but off-subnet fails → check default gateway.', ckuIds: ['CKU-DNS-GW-ISSUES'] },
    { id: '1.10-c-q3', concept: 'dns symptom', type: 'scenario', difficulty: 'medium', question: 'ping 203.0.113.1 succeeds but ping www.example.com fails. Likely cause?', choices: ['Cable CRC errors', 'DNS resolution failure', 'Missing subnet mask', 'STP loop'], correctIndex: 1, explanation: 'IP works but names fail — troubleshoot DNS settings or server.', ckuIds: ['CKU-DNS-GW-ISSUES'] },
    { id: '1.10-c-q4', concept: 'tracert', type: 'definition', difficulty: 'easy', question: 'What does tracert (traceroute) show?', choices: ['MAC address table', 'Hop-by-hop path to a destination', 'DHCP lease time only', 'Wi‑Fi channel'], correctIndex: 1, explanation: 'Traceroute reveals each router hop toward the destination.', ckuIds: ['CKU-PING-TRACE'] },
    { id: '1.10-c-q5', concept: 'apipa client', type: 'scenario', difficulty: 'medium', question: 'ipconfig shows 169.254.10.5. What should you check first?', choices: ['OSPF neighbor table', 'DHCP server/reachability', 'Fiber SM/MM type', 'VTP domain'], correctIndex: 1, explanation: '169.254.x.x means DHCP failed — verify DHCP service, relay, and VLAN.', ckuIds: ['CKU-DNS-GW-ISSUES', 'CKU-IPCONFIG'] },
    { id: '1.10-c-q6', concept: 'ping order', type: 'troubleshooting', difficulty: 'medium', question: 'Best initial ping sequence for Internet troubleshooting?', choices: ['Hostname → random IP', 'Gateway → remote IP → hostname', 'Broadcast → multicast', 'Loopback only'], correctIndex: 1, explanation: 'Test gateway, then known public IP, then DNS name to isolate layer.', ckuIds: ['CKU-PING-TRACE'] },
    { id: '1.10-c-q7', concept: 'linux verify', type: 'application', difficulty: 'medium', question: 'On Linux, which command shows the routing table including default gateway?', choices: ['ip route', 'show vlan brief', 'ifconfig only', 'debug ip routing'], correctIndex: 0, explanation: 'ip route displays routes and the default gateway.', ckuIds: ['CKU-IPCONFIG'] },
    { id: '1.10-c-q8', concept: 'duplicate ip', type: 'scenario', difficulty: 'hard', question: 'Two PCs intermittently lose connectivity with ARP warnings. Suspect…', choices: ['Duplicate IP address', 'Correct DNS', 'Full-duplex on both ends', 'Valid DHCP lease'], correctIndex: 0, explanation: 'Duplicate IPs cause ARP conflicts and flaky connectivity.', ckuIds: ['CKU-DNS-GW-ISSUES'] },
  ],
  flashcards: [
    { id: '1.10-f1', ckuId: 'CKU-IPCONFIG', front: 'Windows command for full IP settings?', back: 'ipconfig /all.' },
    { id: '1.10-f2', ckuId: 'CKU-DNS-GW-ISSUES', front: 'Local OK, remote fail — check what?', back: 'Default gateway (and routing beyond).' },
    { id: '1.10-f3', ckuId: 'CKU-DNS-GW-ISSUES', front: 'IP ping OK, name ping fail — check what?', back: 'DNS server settings / resolution.' },
    { id: '1.10-f4', ckuId: 'CKU-PING-TRACE', front: 'tracert purpose?', back: 'Shows each hop — locates where path fails.' },
    { id: '1.10-f5', ckuId: 'CKU-IPCONFIG', front: 'Linux show IP and routes?', back: 'ip addr and ip route.' },
  ],
  commands: [
    { id: '1.10-cmd1', command: 'ipconfig /all', mode: 'Windows CLI', purpose: 'Display IP, mask, gateway, DNS, MAC, and DHCP info.', example: 'C:\\> ipconfig /all', ckuIds: ['CKU-IPCONFIG'] },
    { id: '1.10-cmd2', command: 'ping / tracert', mode: 'Windows CLI', purpose: 'Test reachability and trace the path to a destination.', example: 'C:\\> tracert 8.8.8.8', ckuIds: ['CKU-PING-TRACE'] },
    { id: '1.10-cmd3', command: 'nslookup', mode: 'Windows/Linux CLI', purpose: 'Query DNS directly to test name resolution.', example: 'C:\\> nslookup www.example.com', ckuIds: ['CKU-DNS-GW-ISSUES'] },
  ],
  glossary: [
    { id: '1.10-g1', term: 'Default gateway', definition: 'The router IP a host uses to reach destinations outside its subnet.', ckuIds: ['CKU-DNS-GW-ISSUES'] },
    { id: '1.10-g2', term: 'Traceroute', definition: 'Tool listing each router hop toward a destination.', ckuIds: ['CKU-PING-TRACE'] },
    { id: '1.10-g3', term: 'DHCP lease', definition: 'Temporary assignment of IP parameters from a DHCP server.', ckuIds: ['CKU-IPCONFIG'] },
  ],
  mnemonics: [
    { id: '1.10-m1', title: 'Troubleshoot order', mnemonic: '“Gateway, IP, Name.”', explanation: 'Ping gateway, then remote IP, then hostname to isolate L3 vs DNS.', ckuIds: ['CKU-PING-TRACE', 'CKU-DNS-GW-ISSUES'] },
  ],
  examTraps: [
    { id: '1.10-t1', trap: 'Blaming DNS when the gateway is wrong.', correction: 'If remote IPs fail, fix gateway/routing before DNS.', ckuIds: ['CKU-DNS-GW-ISSUES'] },
    { id: '1.10-t2', trap: 'Ignoring 169.254.x.x in ipconfig.', correction: 'APIPA means DHCP failed — not a valid corporate address.', ckuIds: ['CKU-IPCONFIG'] },
  ],
  misconceptions: [
    { id: '1.10-x1', misconception: 'ping failure always means the remote host is down.', reality: 'Firewalls may block ICMP; also local misconfig can fail before the path is tested.', example: 'Wrong mask prevents reaching local gateway — ping never leaves the host correctly.', ckuIds: ['CKU-PING-TRACE'] },
    { id: '1.10-x2', misconception: 'ipconfig renew fixes all network problems.', reality: 'renew requests DHCP again but cannot fix server, relay, or wrong static config.', example: 'Broken DHCP scope still assigns wrong gateway after renew.', ckuIds: ['CKU-IPCONFIG'] },
  ],
  diagram: {
    id: 'DIAG-1.10-troubleshoot', title: 'Client troubleshooting decision tree', type: 'process', ckuIds: ['CKU-DNS-GW-ISSUES', 'CKU-PING-TRACE'],
    nodes: [
      { id: 'start', label: 'ipconfig /all', type: 'process', x: 50, y: 10 },
      { id: 'gw', label: 'Ping gateway', type: 'process', x: 25, y: 40 },
      { id: 'rip', label: 'Ping remote IP', type: 'process', x: 50, y: 40 },
      { id: 'dns', label: 'Ping hostname', type: 'process', x: 75, y: 40 },
      { id: 'fixgw', label: 'Fix gateway/DHCP', type: 'pc', x: 15, y: 75, status: 'highlighted' },
      { id: 'fixrt', label: 'Fix routing/path', type: 'router', x: 50, y: 75 },
      { id: 'fixdns', label: 'Fix DNS', type: 'server', x: 85, y: 75 },
    ],
    links: [
      { id: 'l1', source: 'start', target: 'gw' }, { id: 'l2', source: 'start', target: 'rip' }, { id: 'l3', source: 'start', target: 'dns' },
      { id: 'l4', source: 'gw', target: 'fixgw', label: 'fail' }, { id: 'l5', source: 'rip', target: 'fixrt', label: 'fail' }, { id: 'l6', source: 'dns', target: 'fixdns', label: 'fail' },
    ],
    annotations: ['Work left to right: L2/L3 params → gateway → Internet IP → DNS name.'],
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Troubleshooting', confidence: 0.85 }],
  },
  packetFlow: {
    id: 'FLOW-1.10-dnsfail', title: 'Symptom isolation — DNS failure', ckuIds: ['CKU-DNS-GW-ISSUES', 'CKU-PING-TRACE'], diagramId: 'DIAG-1.10-troubleshoot',
    steps: [
      { id: 's1', order: 1, title: 'Ping IP', action: 'ping 203.0.113.1 succeeds — L3 path and gateway OK.', successState: 'forwarded' },
      { id: 's2', order: 2, title: 'Ping name', action: 'ping www.example.com fails — name cannot resolve.', successState: 'dropped' },
      { id: 's3', order: 3, title: 'Fix DNS', action: 'Verify DNS server in ipconfig; test with nslookup; correct DHCP/static DNS.', successState: 'learned' },
    ],
  },
}

/* -------------------------------------------------------------------------
   OBJECTIVE 1.11 — Describe wireless principles
   ------------------------------------------------------------------------- */
export const OBJ_111 = {
  objectiveId: '1.11',
  domainId: 'fundamentals',
  title: 'Describe wireless principles',
  ckus: [
    { id: 'CKU-WIFI-BANDS', title: '2.4 GHz vs 5 GHz', summary: '2.4 GHz: longer range, more interference, only three non-overlapping channels (1, 6, 11). 5 GHz: shorter range, many channels, less interference, higher throughput.', aliases: ['dual-band', 'RF bands'], tags: ['wireless', 'rf'], prerequisiteCkuIds: [], relatedCkuIds: ['CKU-80211-STANDARDS', 'CKU-WIFI-CHANNELS'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Wireless Fundamentals', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.11', confidence: 1 }] },
    { id: 'CKU-80211-STANDARDS', title: '802.11 Standards (Wi‑Fi 4/5/6)', summary: '802.11 a/b/g/n/ac/ax — increasing speed and efficiency. ax (Wi‑Fi 6) adds OFDMA and better dense-client performance. SSID identifies the wireless network name.', aliases: ['Wi-Fi 6', '802.11ax'], tags: ['wireless', 'standards'], prerequisiteCkuIds: ['CKU-WIFI-BANDS'], relatedCkuIds: ['CKU-WPA'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 2 — Wireless', confidence: 0.9 }] },
    { id: 'CKU-WPA', title: 'Wireless Encryption (WPA2/WPA3)', summary: 'WEP is broken. WPA2 uses AES/CCMP. WPA3 strengthens key exchange with SAE and is the recommended choice for new deployments.', aliases: ['WPA2-PSK', 'WPA3-SAE'], tags: ['wireless', 'security'], prerequisiteCkuIds: [], relatedCkuIds: ['CKU-80211-STANDARDS'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Wireless Security', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.11', confidence: 1 }] },
    { id: 'CKU-WIFI-CHANNELS', title: 'Channels and Channel Width', summary: 'Each band uses channels; wider channel width (20/40/80 MHz) increases speed but reduces non-overlapping options. RSSI measures signal strength; interference and attenuation affect coverage.', aliases: ['RSSI', 'channel width'], tags: ['wireless', 'rf'], prerequisiteCkuIds: ['CKU-WIFI-BANDS'], relatedCkuIds: ['CKU-WIFI-BANDS'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'RF Concepts', confidence: 0.9 }] },
  ],
  reading: {
    id: 'READ-1.11', ckuIds: ['CKU-WIFI-BANDS', 'CKU-80211-STANDARDS', 'CKU-WPA', 'CKU-WIFI-CHANNELS'], estimatedReadMinutes: 7,
    tiers: {
      beginner: 'Wi‑Fi uses radio waves in two main bands: 2.4 GHz reaches farther but is crowded (use channels 1, 6, or 11 to avoid overlap). 5 GHz is faster with more channels but shorter range. Standards like 802.11n/ac/ax (Wi‑Fi 4/5/6) get faster over time. The network name is the SSID. Protect it with WPA2 or WPA3 — never WEP. Signal strength (RSSI) and obstacles affect how well clients connect.',
      intermediate: '2.4 GHz: 3 non-overlapping 20 MHz channels (1, 6, 11); more interference from Bluetooth/microwaves. 5 GHz: many channels, less interference, supports 40/80 MHz widths for higher throughput but fewer non-overlapping choices at wide width. 802.11ax (Wi‑Fi 6) improves efficiency in dense environments. Encryption: WEP broken; WPA2-AES/CCMP common; WPA3-SAE strongest for new networks. RSSI indicates signal; attenuation (walls) and co-channel interference reduce performance.',
      examReady: '**Bands**: 2.4 GHz — range + interference, channels **1/6/11** non-overlapping; 5 GHz — speed + more channels, shorter range. **Standards**: a/b/g/n/ac/**ax** (Wi‑Fi 4/5/6). **SSID** = network name. **Security**: WEP obsolete; **WPA2 (AES/CCMP)**; **WPA3 (SAE)** preferred. **Channel width** 20/40/80 MHz — wider = faster, fewer non-overlapping channels. **RSSI** = signal strength; **interference/attenuation** affect SNR and throughput. Match band/channel plan to environment (office dense → 5 GHz/ax; IoT far → 2.4 GHz).',
    },
    definition: 'Wireless LANs use **2.4 vs 5 GHz** bands, **802.11 standards**, **SSID** identification, **WPA2/WPA3** encryption, and **channel/width/RSSI** planning for coverage and performance.',
    keyPoints: [
      '2.4 GHz: channels 1, 6, 11 non-overlapping; longer range, more interference.',
      '5 GHz: more channels, higher speed, shorter range.',
      '802.11ax = Wi‑Fi 6; WPA3 (SAE) strongest encryption for new nets.',
      'WEP is broken — do not use.',
      'Wider channel width = higher throughput, fewer non-overlapping channels.',
      'RSSI, interference, and attenuation drive coverage design.',
    ],
    realWorld: 'An office on channel 6 with neighboring APs also on 6 suffers co-channel interference — moving to 1/11 or 5 GHz improves throughput without new hardware.',
    commonMistakes: [
      'Using overlapping 2.4 GHz channels (e.g. 1 and 3).',
      'Enabling WEP for “legacy compatibility.”',
      'Using 80 MHz width everywhere in 2.4 GHz (not supported — width mainly applies to 5 GHz).',
      'Ignoring RSSI — clients far from AP associate but perform poorly.',
    ],
    related: ['1.1 APs and controllers', '2.6 Wireless architectures', '2.8 WLAN config'],
    advanced: '6 GHz (Wi‑Fi 6E) extends clean spectrum in some regions — know 2.4/5 GHz for CCNA core exam.',
    sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 2 — Wireless', confidence: 0.9 }],
  },
  questions: [
    { id: '1.11-c-q1', concept: '2.4 channels', type: 'definition', difficulty: 'easy', question: 'Which 2.4 GHz channels are non-overlapping in common planning?', choices: ['1, 2, 3', '1, 6, 11', '6, 7, 8', '11, 12, 13 only in all regions'], correctIndex: 1, explanation: 'Channels 1, 6, and 11 are the standard non-overlapping set in 2.4 GHz.', ckuIds: ['CKU-WIFI-BANDS'] },
    { id: '1.11-c-q2', concept: '5ghz advantage', type: 'definition', difficulty: 'easy', question: '5 GHz Wi‑Fi typically offers…', choices: ['Longer range than 2.4 with fewer channels', 'More channels and higher throughput but shorter range', 'No encryption support', 'Only WEP'], correctIndex: 1, explanation: '5 GHz has more spectrum and speed; 2.4 GHz penetrates farther.', ckuIds: ['CKU-WIFI-BANDS'] },
    { id: '1.11-c-q3', concept: 'wpa3', type: 'definition', difficulty: 'medium', question: 'WPA3 improves on WPA2 primarily with…', choices: ['WEP compatibility', 'SAE key exchange (stronger handshake)', 'Open unsecured networks', 'Removing AES'], correctIndex: 1, explanation: 'WPA3 uses SAE for more robust authentication vs WPA2-PSK.', ckuIds: ['CKU-WPA'] },
    { id: '1.11-c-q4', concept: 'wep', type: 'true-false', difficulty: 'easy', question: 'True or False: WEP is acceptable for modern enterprise WLANs.', choices: ['True', 'False'], correctIndex: 1, explanation: 'False — WEP is cryptographically broken.', ckuIds: ['CKU-WPA'] },
    { id: '1.11-c-q5', concept: '80211ax', type: 'definition', difficulty: 'medium', question: '802.11ax is also known as…', choices: ['Wi‑Fi 3', 'Wi‑Fi 4', 'Wi‑Fi 5', 'Wi‑Fi 6'], correctIndex: 3, explanation: '802.11ax = Wi‑Fi 6 (802.11ac = Wi‑Fi 5, 802.11n = Wi‑Fi 4).', ckuIds: ['CKU-80211-STANDARDS'] },
    { id: '1.11-c-q6', concept: 'ssid', type: 'definition', difficulty: 'easy', question: 'The SSID is…', choices: ['The encryption key', 'The wireless network name', 'The MAC of the AP', 'The VLAN ID only'], correctIndex: 1, explanation: 'SSID identifies the WLAN broadcast by the AP.', ckuIds: ['CKU-80211-STANDARDS'] },
    { id: '1.11-c-q7', concept: 'channel width', type: 'scenario', difficulty: 'medium', question: 'Doubling channel width from 20 MHz to 40 MHz generally…', choices: ['Reduces throughput', 'Increases potential throughput but uses more spectrum', 'Eliminates interference', 'Disables 5 GHz'], correctIndex: 1, explanation: 'Wider channels carry more data but reduce the number of non-overlapping channels.', ckuIds: ['CKU-WIFI-CHANNELS'] },
    { id: '1.11-c-q8', concept: 'rssi', type: 'definition', difficulty: 'medium', question: 'RSSI indicates…', choices: ['Routing table size', 'Received signal strength', 'DNS latency', 'NAT port count'], correctIndex: 1, explanation: 'RSSI measures how strongly the client hears the AP (and vice versa).', ckuIds: ['CKU-WIFI-CHANNELS'] },
  ],
  flashcards: [
    { id: '1.11-f1', ckuId: 'CKU-WIFI-BANDS', front: '2.4 GHz non-overlapping channels?', back: '1, 6, 11 (in 20 MHz planning).' },
    { id: '1.11-f2', ckuId: 'CKU-WIFI-BANDS', front: '2.4 vs 5 GHz trade-off?', back: '2.4 = range/interference; 5 = speed/more channels/shorter range.' },
    { id: '1.11-f3', ckuId: 'CKU-WPA', front: 'WEP / WPA2 / WPA3 — use which today?', back: 'WEP broken; WPA2-AES common; WPA3-SAE best for new deployments.' },
    { id: '1.11-f4', ckuId: 'CKU-80211-STANDARDS', front: '802.11ax marketing name?', back: 'Wi‑Fi 6.' },
    { id: '1.11-f5', ckuId: 'CKU-WIFI-CHANNELS', front: 'Wider channel width effect?', back: 'Higher throughput, fewer non-overlapping channels.' },
  ],
  commands: [
    { id: '1.11-cmd1', command: 'show wlan summary', mode: 'WLC privileged EXEC', purpose: 'Summarize WLANs/SSIDs and status on a controller.', example: 'WLC# show wlan summary', ckuIds: ['CKU-80211-STANDARDS'] },
    { id: '1.11-cmd2', command: 'show dot11 associations', mode: 'AP/WLC privileged EXEC', purpose: 'View associated clients and RSSI/signal data.', example: 'AP# show dot11 associations all-client', ckuIds: ['CKU-WIFI-CHANNELS'] },
  ],
  glossary: [
    { id: '1.11-g1', term: 'SSID', definition: 'Service Set Identifier — the human-readable wireless network name.', ckuIds: ['CKU-80211-STANDARDS'] },
    { id: '1.11-g2', term: 'Attenuation', definition: 'Loss of RF signal strength caused by distance and obstacles.', ckuIds: ['CKU-WIFI-CHANNELS'] },
    { id: '1.11-g3', term: 'CCMP/AES', definition: 'Encryption used by WPA2 for confidential WLAN data.', ckuIds: ['CKU-WPA'] },
  ],
  mnemonics: [
    { id: '1.11-m1', title: '2.4 GHz channels', mnemonic: '“1-6-11, stay in heaven.”', explanation: 'The three non-overlapping 2.4 GHz channels used in North America planning.', ckuIds: ['CKU-WIFI-BANDS'] },
  ],
  examTraps: [
    { id: '1.11-t1', trap: 'Using adjacent 2.4 GHz channels (e.g. 3 and 4).', correction: 'They overlap — stick to 1, 6, 11 for non-overlapping 20 MHz cells.', ckuIds: ['CKU-WIFI-BANDS'] },
    { id: '1.11-t2', trap: 'Choosing WEP for compatibility.', correction: 'WEP is insecure; use WPA2 minimum, WPA3 preferred.', ckuIds: ['CKU-WPA'] },
  ],
  misconceptions: [
    { id: '1.11-x1', misconception: 'More AP power always fixes coverage.', reality: 'Higher power increases interference and sticky clients; proper placement and channel plan matter.', example: 'Two APs on same channel at max power collide instead of cooperate.', ckuIds: ['CKU-WIFI-CHANNELS'] },
    { id: '1.11-x2', misconception: '5 GHz always means faster for every client.', reality: 'Weak 5 GHz RSSI through walls may perform worse than stable 2.4 GHz.', example: 'Far edge of building may need 2.4 GHz or additional APs.', ckuIds: ['CKU-WIFI-BANDS'] },
  ],
  diagram: {
    id: 'DIAG-1.11-bands', title: '2.4 GHz channel plan vs 5 GHz', type: 'process', ckuIds: ['CKU-WIFI-BANDS', 'CKU-WIFI-CHANNELS'],
    nodes: [
      { id: 'ap1', label: 'AP ch1', type: 'ap', x: 20, y: 30 },
      { id: 'ap2', label: 'AP ch6', type: 'ap', x: 50, y: 30, status: 'highlighted' },
      { id: 'ap3', label: 'AP ch11', type: 'ap', x: 80, y: 30 },
      { id: 'five', label: '5 GHz — many channels', type: 'cloud', x: 50, y: 70 },
    ],
    links: [
      { id: 'l1', source: 'ap1', target: 'ap2', label: 'no overlap' },
      { id: 'l2', source: 'ap2', target: 'ap3', label: 'no overlap' },
      { id: 'l3', source: 'ap2', target: 'five', label: 'dual-band AP' },
    ],
    annotations: ['2.4 GHz: use 1/6/11.', '5 GHz: wider channels, shorter range.'],
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Wireless', confidence: 0.85 }],
  },
  packetFlow: {
    id: 'FLOW-1.11-assoc', title: 'Client associates to WPA2 WLAN', ckuIds: ['CKU-WPA', 'CKU-80211-STANDARDS'], diagramId: 'DIAG-1.11-bands',
    steps: [
      { id: 's1', order: 1, title: 'Probe/beacon', action: 'Client hears SSID beacons and selects AP on chosen band/channel.', successState: 'matched' },
      { id: 's2', order: 2, title: '4-way handshake', action: 'WPA2 4-way handshake derives AES keys using PSK or 802.1X.', successState: 'matched' },
      { id: 's3', order: 3, title: 'Data encrypted', action: 'Client sends IP traffic over encrypted 802.11 frames to the AP.', successState: 'forwarded' },
    ],
  },
}

/* -------------------------------------------------------------------------
   OBJECTIVE 1.12 — Explain virtualization fundamentals
   ------------------------------------------------------------------------- */
export const OBJ_112 = {
  objectiveId: '1.12',
  domainId: 'fundamentals',
  title: 'Explain virtualization fundamentals',
  ckus: [
    { id: 'CKU-HYPERVISOR', title: 'Hypervisor (Type 1 vs Type 2)', summary: 'Type 1 (bare metal, e.g. ESXi) runs directly on hardware. Type 2 (hosted, e.g. VMware Workstation) runs on top of a host OS. Each VM has its own guest OS and virtual NICs/switches.', aliases: ['bare-metal hypervisor', 'hosted hypervisor'], tags: ['virtualization', 'vm'], prerequisiteCkuIds: [], relatedCkuIds: ['CKU-CONTAINERS', 'CKU-NFV'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Virtualization', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.12', confidence: 1 }] },
    { id: 'CKU-CONTAINERS', title: 'Containers', summary: 'Virtualize at the OS level — share the host kernel. Lighter and faster to start than VMs; package an app and its dependencies (e.g. Docker).', aliases: ['Docker', 'containerization'], tags: ['virtualization', 'containers'], prerequisiteCkuIds: ['CKU-HYPERVISOR'], relatedCkuIds: ['CKU-HYPERVISOR'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 2 — Virtualization', confidence: 0.9 }] },
    { id: 'CKU-VRF', title: 'VRF (Virtual Routing and Forwarding)', summary: 'Creates multiple isolated routing tables on one physical router — same as logical routers for different tenants or services without separate hardware.', aliases: ['VRF-lite', 'multi-tenant routing'], tags: ['routing', 'virtualization'], prerequisiteCkuIds: [], relatedCkuIds: ['CKU-NFV'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'VRF', confidence: 0.85 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.12', confidence: 1 }] },
    { id: 'CKU-NFV', title: 'Network Function Virtualization (NFV)', summary: 'Runs network services (firewall, router, load balancer) as software on general-purpose hardware instead of dedicated appliances.', aliases: ['vRouter', 'vFW'], tags: ['nfv', 'virtualization'], prerequisiteCkuIds: ['CKU-HYPERVISOR'], relatedCkuIds: ['CKU-VRF', 'CKU-CONTAINERS'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.blueprint, chapter: '1.12', confidence: 1 }] },
  ],
  reading: {
    id: 'READ-1.12', ckuIds: ['CKU-HYPERVISOR', 'CKU-CONTAINERS', 'CKU-VRF', 'CKU-NFV'], estimatedReadMinutes: 6,
    tiers: {
      beginner: 'Virtualization lets you run many logical systems on one physical machine. A hypervisor creates virtual machines (VMs), each with its own operating system. Type 1 hypervisors sit directly on the hardware (like ESXi in a data center); Type 2 runs as an app on your laptop OS. Containers are lighter — they share one OS kernel and pack just an app and its libraries. VRF splits one router into several routing tables. NFV means running firewalls and routers as software instead of buying separate boxes.',
      intermediate: 'Hypervisor Type 1 (bare metal) = production data centers — ESXi, Hyper-V on hardware. Type 2 (hosted) = labs/desktops — VMware Workstation on Windows. VMs include virtual NICs connected to virtual switches. Containers (Docker) start fast and share the host kernel — not a full guest OS per app. VRF-lite on Cisco routers isolates routing tables for multi-tenant or management separation. NFV deploys vRouter/vFW/vLB on x86 servers, replacing dedicated appliances with scalable software.',
      examReady: '**Hypervisor**: Type **1** = bare metal (ESXi) — DC production; Type **2** = hosted on OS (Workstation) — lab/dev. **VM** = full guest OS + vNIC/vSwitch. **Containers** = OS-level isolation, shared kernel, fast deploy (Docker). **VRF** = multiple routing tables on one router (tenant isolation). **NFV** = network functions (firewall, router, LB) as software on commodity hardware. Contrast VM (strong isolation, heavier) vs container (lighter, shared kernel). VRF is routing virtualization; NFV is service virtualization.',
    },
    definition: '**Virtualization** spans **hypervisor VMs** (Type 1/2), lightweight **containers**, routing isolation with **VRF**, and **NFV** software replacing dedicated network appliances.',
    keyPoints: [
      'Type 1 hypervisor = bare metal (ESXi); Type 2 = hosted (Workstation).',
      'Each VM has its own OS and virtual NICs.',
      'Containers share the host kernel — faster/lighter than VMs.',
      'VRF = multiple isolated routing tables on one router.',
      'NFV = firewall/router/LB as software on x86 hardware.',
    ],
    realWorld: 'A service provider runs ESXi clusters for customer VMs, Docker for microservices, VRF for customer routing separation, and a vFW NFV chain for edge security — all on the same hardware fleet.',
    commonMistakes: [
      'Calling containers “mini VMs” with separate kernels — they share one kernel.',
      'Using Type 2 hypervisors for large production DCs (Type 1 preferred).',
      'Confusing VRF with VLAN — VRF isolates routing tables; VLAN isolates L2.',
      'Thinking NFV eliminates the need for physical networking — underlay still required.',
    ],
    related: ['1.1 Network components', '1.2 Cloud vs on-prem', '3.x Routing'],
    advanced: 'Kubernetes orchestrates containers at scale; NFV MANO manages virtual network functions — beyond CCNA config but explains industry direction.',
    sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 2 — Virtualization', confidence: 0.9 }],
  },
  questions: [
    { id: '1.12-c-q1', concept: 'type1', type: 'definition', difficulty: 'easy', question: 'Which is a Type 1 (bare-metal) hypervisor?', choices: ['VMware Workstation on Windows', 'VMware ESXi', 'Docker Desktop only', 'A physical router'], correctIndex: 1, explanation: 'ESXi runs directly on hardware without a host OS underneath.', ckuIds: ['CKU-HYPERVISOR'] },
    { id: '1.12-c-q2', concept: 'type2', type: 'definition', difficulty: 'easy', question: 'A Type 2 hypervisor runs…', choices: ['Directly on bare metal only', 'On top of a host operating system', 'Inside a container only', 'Without any VMs'], correctIndex: 1, explanation: 'Type 2 is hosted — e.g. Workstation on Windows/macOS.', ckuIds: ['CKU-HYPERVISOR'] },
    { id: '1.12-c-q3', concept: 'containers', type: 'definition', difficulty: 'medium', question: 'Containers differ from VMs because containers…', choices: ['Include a full guest OS each', 'Share the host OS kernel', 'Cannot run on Linux', 'Replace physical switches'], correctIndex: 1, explanation: 'Containers isolate processes but share one kernel — lighter than full VMs.', ckuIds: ['CKU-CONTAINERS'] },
    { id: '1.12-c-q4', concept: 'vrf', type: 'definition', difficulty: 'medium', question: 'VRF on a router provides…', choices: ['Wireless encryption', 'Multiple isolated routing tables', 'Fiber transceiver support', 'DHCP server redundancy'], correctIndex: 1, explanation: 'VRF creates separate routing/forwarding instances on one device.', ckuIds: ['CKU-VRF'] },
    { id: '1.12-c-q5', concept: 'nfv', type: 'definition', difficulty: 'medium', question: 'NFV (Network Function Virtualization) means…', choices: ['Replacing DNS with VLANs', 'Running network services as software on general hardware', 'Eliminating all routers', 'Using only WEP'], correctIndex: 1, explanation: 'NFV virtualizes functions like firewall and router as software.', ckuIds: ['CKU-NFV'] },
    { id: '1.12-c-q6', concept: 'vm components', type: 'scenario', difficulty: 'medium', question: 'Each virtual machine typically includes…', choices: ['Only a container image', 'Its own guest OS and virtual NICs', 'Shared kernel with all other VMs', 'No network interface'], correctIndex: 1, explanation: 'VMs are full guests with virtual hardware including vNICs.', ckuIds: ['CKU-HYPERVISOR'] },
    { id: '1.12-c-q7', concept: 'vrf vs vlan', type: 'true-false', difficulty: 'hard', question: 'True or False: VRF and VLAN provide the same type of isolation.', choices: ['True', 'False'], correctIndex: 1, explanation: 'False — VLAN = L2 broadcast domain; VRF = L3 routing table isolation.', ckuIds: ['CKU-VRF'] },
    { id: '1.12-c-q8', concept: 'docker', type: 'definition', difficulty: 'easy', question: 'Docker is commonly associated with…', choices: ['Type 1 hypervisors', 'Container packaging and deployment', 'WPA3', 'Spanning Tree'], correctIndex: 1, explanation: 'Docker packages apps into containers sharing the host kernel.', ckuIds: ['CKU-CONTAINERS'] },
  ],
  flashcards: [
    { id: '1.12-f1', ckuId: 'CKU-HYPERVISOR', front: 'Type 1 vs Type 2 hypervisor?', back: 'Type 1 = bare metal (ESXi); Type 2 = hosted on OS (Workstation).' },
    { id: '1.12-f2', ckuId: 'CKU-CONTAINERS', front: 'Container vs VM — kernel?', back: 'Containers share host kernel; each VM has its own guest OS.' },
    { id: '1.12-f3', ckuId: 'CKU-VRF', front: 'What does VRF provide?', back: 'Multiple isolated routing tables on one physical router.' },
    { id: '1.12-f4', ckuId: 'CKU-NFV', front: 'NFV in one sentence?', back: 'Network functions (FW, router, LB) as software on commodity hardware.' },
    { id: '1.12-f5', ckuId: 'CKU-HYPERVISOR', front: 'Example Type 1 hypervisor?', back: 'VMware ESXi (runs directly on server hardware).' },
  ],
  commands: [
    { id: '1.12-cmd1', command: 'show ip route vrf <name>', mode: 'privileged EXEC', purpose: 'Display routing table for a specific VRF instance.', example: 'R1# show ip route vrf CUSTOMER_A', ckuIds: ['CKU-VRF'] },
    { id: '1.12-cmd2', command: 'docker ps', mode: 'Linux shell', purpose: 'List running containers on a Docker host.', example: '$ docker ps', ckuIds: ['CKU-CONTAINERS'] },
  ],
  glossary: [
    { id: '1.12-g1', term: 'Hypervisor', definition: 'Software/firmware that creates and runs virtual machines on hardware.', ckuIds: ['CKU-HYPERVISOR'] },
    { id: '1.12-g2', term: 'VRF-lite', definition: 'Cisco VRF without MPLS — separate routing tables on one router.', ckuIds: ['CKU-VRF'] },
    { id: '1.12-g3', term: 'NFV', definition: 'Deploying network services as virtualized software instead of dedicated appliances.', ckuIds: ['CKU-NFV'] },
  ],
  mnemonics: [
    { id: '1.12-m1', title: 'Hypervisor types', mnemonic: '“Type 1 touches metal; Type 2 sits on the OS.”', explanation: 'Type 1 = bare metal; Type 2 = hosted hypervisor.', ckuIds: ['CKU-HYPERVISOR'] },
  ],
  examTraps: [
    { id: '1.12-t1', trap: 'Saying containers include a full guest OS.', correction: 'Containers share the host kernel — only apps/libs are packaged.', ckuIds: ['CKU-CONTAINERS'] },
    { id: '1.12-t2', trap: 'Equating VRF with VLAN.', correction: 'VRF isolates L3 routing; VLAN isolates L2 broadcast domains.', ckuIds: ['CKU-VRF'] },
  ],
  misconceptions: [
    { id: '1.12-x1', misconception: 'Virtualization eliminates physical networks.', reality: 'VMs/containers still need virtual and physical switching/routing underneath.', example: 'vSwitch uplinks to physical top-of-rack switch.', ckuIds: ['CKU-HYPERVISOR'] },
    { id: '1.12-x2', misconception: 'NFV and VMs are the same thing.', reality: 'NFV is a use case — virtualized network functions; VMs are one way to host them (containers another).', example: 'vFW may run as a VM or container on NFV infrastructure.', ckuIds: ['CKU-NFV', 'CKU-HYPERVISOR'] },
  ],
  diagram: {
    id: 'DIAG-1.12-virt', title: 'Hypervisor, containers, and VRF', type: 'topology', ckuIds: ['CKU-HYPERVISOR', 'CKU-CONTAINERS', 'CKU-VRF'],
    nodes: [
      { id: 'hw', label: 'Physical server', type: 'server', x: 50, y: 12 },
      { id: 'hv', label: 'Type 1 hypervisor', type: 'process', x: 50, y: 30, status: 'highlighted' },
      { id: 'vm1', label: 'VM (guest OS)', type: 'pc', x: 25, y: 55 },
      { id: 'vm2', label: 'VM (guest OS)', type: 'pc', x: 50, y: 55 },
      { id: 'ctr', label: 'Containers (shared kernel)', type: 'process', x: 75, y: 55 },
      { id: 'vrf', label: 'Router VRF A / B', type: 'router', x: 50, y: 82 },
    ],
    links: [
      { id: 'l1', source: 'hw', target: 'hv' },
      { id: 'l2', source: 'hv', target: 'vm1' }, { id: 'l3', source: 'hv', target: 'vm2' },
      { id: 'l4', source: 'hv', target: 'ctr' },
      { id: 'l5', source: 'vm2', target: 'vrf', label: 'vNIC' },
    ],
    annotations: ['VMs = full OS each.', 'Containers = lighter, shared kernel.', 'VRF = logical routing separation.'],
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Virtualization', confidence: 0.85 }],
  },
  packetFlow: {
    id: 'FLOW-1.12-vrf', title: 'Packet stays inside a VRF', ckuIds: ['CKU-VRF'], diagramId: 'DIAG-1.12-virt',
    steps: [
      { id: 's1', order: 1, title: 'Ingress VRF', action: 'Packet arrives an interface assigned to VRF CUSTOMER_A.', successState: 'matched' },
      { id: 's2', order: 2, title: 'Lookup', action: 'Router consults only the CUSTOMER_A routing table.', successState: 'matched' },
      { id: 's3', order: 3, title: 'Forward/isolate', action: 'Packet forwarded within VRF A — no leakage to VRF B routes.', successState: 'forwarded' },
    ],
  },
}
