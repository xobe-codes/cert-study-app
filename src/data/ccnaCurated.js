/* =========================================================================
   CURATED CCNA CONTENT — static, source-grounded learning data.
   Phase 19 + Pilot A (Objective 3.2: "Determine how a router makes a
   forwarding decision by default").

   This is the AUTHORITATIVE source for any objective it covers. The app
   prefers this static content and only falls back to AI generation for
   objectives NOT present here (hybrid model). Nothing here is generated at
   runtime — it ships in the bundle, so there is zero AI cost or latency for
   curated objectives.

   Content is original/paraphrased from the cited sources (no verbatim copying)
   and grounded in the Cisco 200-301 v1.1 blueprint. Every record carries
   sourceRefs for auditability. Schemas are documented with JSDoc (no TS).

   @typedef {{ sourceName: string, chapter?: string, page?: string, confidence: number, notes?: string }} SourceRef
   ========================================================================= */

// Short source identifiers reused across records.
export const CURATED_SOURCES = {
  blueprint: 'Cisco CCNA 200-301 v1.1 Exam Topics',
  certVol1: 'Cisco Press CCNA 200-301 Official Cert Guide, Vol 1 (Odom)',
  jeremy: "Jeremy's IT Lab — CCNA 200-301 Notes",
}

/* -------------------------------------------------------------------------
   OBJECTIVE 3.2 — router forwarding decision by default
   Sub-objectives: 3.2.a longest prefix match · 3.2.b administrative distance
   · 3.2.c routing protocol metric
   ------------------------------------------------------------------------- */
const OBJ_32 = {
  objectiveId: '3.2',
  domainId: 'connectivity',
  title: 'Determine how a router makes a forwarding decision by default',

  // ---- Canonical Knowledge Units (reusable concept atoms) ----
  ckus: [
    {
      id: 'CKU-LONGEST-PREFIX-MATCH',
      title: 'Longest Prefix Match',
      summary: 'When several routes match a packet’s destination, the router uses the route with the most specific (longest) prefix length, regardless of administrative distance or metric.',
      aliases: ['most specific route', 'LPM', 'longest match'],
      tags: ['routing', 'forwarding', 'route-selection'],
      prerequisiteCkuIds: ['CKU-SUBNETTING', 'CKU-ROUTING-TABLE'],
      relatedCkuIds: ['CKU-ADMINISTRATIVE-DISTANCE', 'CKU-DEFAULT-ROUTE'],
      sourceRefs: [
        { sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 16 — IP Forwarding with the Longest Prefix Match', confidence: 0.95 },
        { sourceName: CURATED_SOURCES.blueprint, chapter: '3.2.a', confidence: 1 },
      ],
    },
    {
      id: 'CKU-ADMINISTRATIVE-DISTANCE',
      title: 'Administrative Distance',
      summary: 'A measure of how trustworthy a routing source is (lower = more trusted). Used to choose between routes to the SAME prefix learned from DIFFERENT sources. An AD of 255 means the route is never installed.',
      aliases: ['AD', 'trustworthiness'],
      tags: ['routing', 'route-selection', 'administrative-distance'],
      prerequisiteCkuIds: ['CKU-ROUTING-TABLE'],
      relatedCkuIds: ['CKU-METRIC', 'CKU-LONGEST-PREFIX-MATCH'],
      sourceRefs: [
        { sourceName: CURATED_SOURCES.jeremy, chapter: 'Administrative Distance', confidence: 0.95 },
        { sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 16 — Administrative Distance', confidence: 0.95 },
        { sourceName: CURATED_SOURCES.blueprint, chapter: '3.2.b', confidence: 1 },
      ],
    },
    {
      id: 'CKU-METRIC',
      title: 'Routing Protocol Metric',
      summary: 'A value a routing protocol assigns to a route to rank paths. Metrics are only comparable WITHIN the same protocol (OSPF cost vs EIGRP composite are not comparable); AD decides between protocols first, then metric breaks ties within one.',
      aliases: ['cost', 'route metric'],
      tags: ['routing', 'route-selection', 'metric'],
      prerequisiteCkuIds: ['CKU-ADMINISTRATIVE-DISTANCE'],
      relatedCkuIds: ['CKU-ADMINISTRATIVE-DISTANCE'],
      sourceRefs: [
        { sourceName: CURATED_SOURCES.jeremy, chapter: 'Metric vs Administrative Distance', confidence: 0.95 },
        { sourceName: CURATED_SOURCES.blueprint, chapter: '3.2.c', confidence: 1 },
      ],
    },
    {
      id: 'CKU-DEFAULT-ROUTE',
      title: 'Default Route (Gateway of Last Resort)',
      summary: 'The route 0.0.0.0/0 (::/0 for IPv6) with prefix length 0 — it matches every destination but is the LEAST specific, so longest-prefix-match only uses it when no more-specific route matches.',
      aliases: ['gateway of last resort', '0.0.0.0/0', 'quad-zero route'],
      tags: ['routing', 'default-route', 'forwarding'],
      prerequisiteCkuIds: ['CKU-LONGEST-PREFIX-MATCH'],
      relatedCkuIds: ['CKU-LONGEST-PREFIX-MATCH'],
      sourceRefs: [
        { sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 16 — Static Default Routes', confidence: 0.9 },
        { sourceName: CURATED_SOURCES.blueprint, chapter: '3.3.a (related)', confidence: 0.8, notes: 'Default route is configured under 3.3 but is central to the 3.2 forwarding decision.' },
      ],
    },
  ],

  // ---- Reading (3 depth tiers + the app's structured block shape) ----
  reading: {
    id: 'READ-3.2',
    ckuIds: ['CKU-LONGEST-PREFIX-MATCH', 'CKU-ADMINISTRATIVE-DISTANCE', 'CKU-METRIC', 'CKU-DEFAULT-ROUTE'],
    estimatedReadMinutes: 6,
    tiers: {
      beginner: 'When a packet arrives, the router looks at the destination IP and checks its routing table for a matching network. If more than one entry matches, it picks the most specific one — the one that pins down the most bits of the address. If two sources (say a static route and OSPF) both offer a route to the exact same network, the router trusts the one with the lower administrative distance. If it is still tied within one routing protocol, the lower metric wins.',
      intermediate: 'A router makes its default forwarding decision in a strict order. (1) Longest prefix match: among all routes whose network/prefix the destination falls inside, the route with the longest prefix length is chosen — this happens FIRST and overrides everything else. (2) Administrative distance: AD only matters when comparing routes to the SAME prefix that were learned from DIFFERENT sources; the lower AD (more trusted source) is installed in the routing table. (3) Metric: when the same routing protocol offers multiple routes to the same prefix, the protocol’s metric breaks the tie (lower is better). A default route (0.0.0.0/0) has prefix length 0, so it is the absolute last resort.',
      examReady: 'Default forwarding logic, in order: longest prefix match → administrative distance → metric. Longest prefix match is the packet-forwarding decision: the router always forwards using the matching route with the longest prefix length, full stop — AD and metric do NOT override a more-specific route. AD and metric instead govern which routes get INSTALLED in the routing table in the first place: when two sources advertise the identical prefix, the lower AD wins (Connected 0, Static 1, EIGRP 90, OSPF 110, RIP 120, External EIGRP 170, 255 = never installed). Metric only compares routes from the same protocol and is not comparable across protocols. The default route 0.0.0.0/0 (the gateway of last resort) matches everything but, at prefix length 0, is the least specific match and is used only when nothing more specific matches. If no route matches and no default exists, the packet is dropped.',
    },
    // App-native structured blocks (render through the existing renderer).
    definition: 'By default a router forwards each packet using **longest prefix match** — the matching route with the most specific (longest) prefix. Administrative distance and metric decide which routes are installed in the table, not which matching route is used for a given packet.',
    keyPoints: [
      'Order: longest prefix match → administrative distance → metric.',
      'Longest prefix match picks the MOST specific matching route and is never overridden by AD/metric.',
      'Administrative distance compares the SAME prefix from DIFFERENT sources — lower is more trusted.',
      'Default AD: Connected `0`, Static `1`, EIGRP `90`, OSPF `110`, RIP `120`, External EIGRP `170`, `255` = never installed.',
      'Metric compares routes within the SAME routing protocol only — never across protocols.',
      'Default route `0.0.0.0/0` matches everything but is least specific (used last).',
    ],
    realWorld: 'On `show ip route`, the two numbers in brackets like `[110/20]` are `[AD/metric]`. A floating static route is a static route given a deliberately high AD (e.g. `ip route 10.0.0.0 255.0.0.0 10.1.1.1 130`) so it stays out of the table until the preferred OSPF/EIGRP route disappears.',
    commonMistakes: [
      'Thinking a lower AD can beat a more-specific (longer-prefix) route — it cannot; longest prefix match wins first.',
      'Comparing an OSPF metric to an EIGRP metric — metrics are only comparable within one protocol.',
      'Assuming the default route is used when a more-specific route also matches — it is the last resort only.',
    ],
    related: ['3.1 Routing table components', '3.3 Static routing (default/floating)', '3.4 OSPFv2'],
    advanced: 'AD is configurable per-protocol and per-static-route; this is exactly how floating static backups are built. A route with AD 255 is considered unusable and is not installed at all. Connected and local (`L`, /32) routes are added automatically when an interface is up/up.',
    sourceRefs: [
      { sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 16', confidence: 0.95 },
      { sourceName: CURATED_SOURCES.jeremy, chapter: 'Administrative Distance / Metric', confidence: 0.95 },
    ],
  },

  // ---- Original practice questions (seed the quiz bank; no API used) ----
  questions: [
    { id: '3.2-c-q1', concept: 'longest prefix match', type: 'scenario', difficulty: 'medium',
      question: 'A router has routes to `10.1.1.0/24` via R2 and `10.1.1.0/26` via R3. A packet is destined for `10.1.1.10`. Which route is used?',
      choices: ['The /24 via R2', 'The /26 via R3', 'Whichever has the lower metric', 'Both, load-balanced'],
      correctIndex: 1, explanation: '10.1.1.10 falls inside both, but /26 is the longer (more specific) prefix, so longest prefix match selects it.', ckuIds: ['CKU-LONGEST-PREFIX-MATCH'] },
    { id: '3.2-c-q2', concept: 'route selection order', type: 'definition', difficulty: 'medium',
      question: 'In what order does a router apply these by default when forwarding?',
      choices: ['Metric → AD → longest prefix', 'Longest prefix match → administrative distance → metric', 'AD → metric → longest prefix', 'Longest prefix → metric → AD'],
      correctIndex: 1, explanation: 'Longest prefix match decides which route forwards the packet; AD then metric decide which routes get installed for a given prefix.', ckuIds: ['CKU-LONGEST-PREFIX-MATCH', 'CKU-ADMINISTRATIVE-DISTANCE', 'CKU-METRIC'] },
    { id: '3.2-c-q3', concept: 'administrative distance', type: 'definition', difficulty: 'easy',
      question: 'Two sources advertise a route to the exact same prefix: OSPF (AD 110) and a static route (AD 1). Which is installed?',
      choices: ['OSPF, lower metric', 'The static route, lower AD', 'Both', 'Neither until the tie is broken by metric'],
      correctIndex: 1, explanation: 'For the same prefix from different sources, the lower administrative distance wins. Static (1) beats OSPF (110).', ckuIds: ['CKU-ADMINISTRATIVE-DISTANCE'] },
    { id: '3.2-c-q4', concept: 'administrative distance values', type: 'definition', difficulty: 'medium',
      question: 'What is the default administrative distance of a connected route?',
      choices: ['0', '1', '110', '120'], correctIndex: 0,
      explanation: 'Connected routes have AD 0 — the most trusted source. Static is 1, EIGRP 90, OSPF 110, RIP 120.', ckuIds: ['CKU-ADMINISTRATIVE-DISTANCE'] },
    { id: '3.2-c-q5', concept: 'administrative distance 255', type: 'application', difficulty: 'hard',
      question: 'A route is learned with an administrative distance of 255. What happens?',
      choices: ['It becomes the preferred route', 'It is installed only if no metric exists', 'It is never installed in the routing table', 'It is installed but never used'],
      correctIndex: 2, explanation: 'AD 255 means the source is considered untrustworthy; the route is not installed at all.', ckuIds: ['CKU-ADMINISTRATIVE-DISTANCE'] },
    { id: '3.2-c-q6', concept: 'metric scope', type: 'true-false', difficulty: 'medium',
      question: 'True or False: A router can directly compare an OSPF metric to an EIGRP metric to pick the better route.',
      choices: ['True', 'False'], correctIndex: 1,
      explanation: 'False. Metrics are only comparable within the same routing protocol. Across protocols, administrative distance decides.', ckuIds: ['CKU-METRIC', 'CKU-ADMINISTRATIVE-DISTANCE'] },
    { id: '3.2-c-q7', concept: 'metric tie-break', type: 'scenario', difficulty: 'medium',
      question: 'OSPF learns two routes to `192.168.5.0/24`, one with cost 10 and one with cost 20. Which is installed (assuming no other differences)?',
      choices: ['Cost 20', 'Cost 10', 'Both (equal-cost only if equal)', 'Neither — AD must differ'],
      correctIndex: 1, explanation: 'Within one protocol, the lower metric (OSPF cost 10) wins.', ckuIds: ['CKU-METRIC'] },
    { id: '3.2-c-q8', concept: 'default route specificity', type: 'scenario', difficulty: 'medium',
      question: 'A router has `0.0.0.0/0` via R1 and `172.16.0.0/16` via R2. A packet is destined for `172.16.4.9`. Which route forwards it?',
      choices: ['The default route via R1', 'The /16 via R2', 'Whichever has lower AD', 'It is dropped'],
      correctIndex: 1, explanation: 'The /16 matches and is far more specific than the /0 default route, so longest prefix match uses the /16.', ckuIds: ['CKU-DEFAULT-ROUTE', 'CKU-LONGEST-PREFIX-MATCH'] },
    { id: '3.2-c-q9', concept: 'no match no default', type: 'application', difficulty: 'easy',
      question: 'A packet’s destination matches no route and there is no default route. What does the router do?',
      choices: ['Floods it out all interfaces', 'Drops the packet', 'Sends it to the lowest-AD route', 'Queues it until a route appears'],
      correctIndex: 1, explanation: 'With no matching route and no default route, the router drops the packet (and may send an ICMP unreachable).', ckuIds: ['CKU-DEFAULT-ROUTE'] },
    { id: '3.2-c-q10', concept: 'show ip route brackets', type: 'application', difficulty: 'medium',
      question: 'In `show ip route`, an entry reads `O 10.2.2.0/24 [110/30]`. What do `110` and `30` represent?',
      choices: ['Metric and AD', 'AD and metric', 'Prefix and metric', 'Cost and hop count'],
      correctIndex: 1, explanation: 'The bracketed pair is `[administrative distance / metric]` — here AD 110 (OSPF) and metric 30.', ckuIds: ['CKU-ADMINISTRATIVE-DISTANCE', 'CKU-METRIC'] },
    { id: '3.2-c-q11', concept: 'floating static', type: 'troubleshooting', difficulty: 'hard',
      question: 'You want a static backup route used only if OSPF (AD 110) loses its route to `10.0.0.0/8`. The config shows `ip route 10.0.0.0 255.0.0.0 10.1.1.1`. Why is the backup active even while OSPF is up?',
      choices: ['Static AD (1) is lower than OSPF (110), so static is always preferred', 'OSPF metric is too high', 'The mask is wrong', 'Default routes override static'],
      correctIndex: 0, explanation: 'A plain static route has AD 1, beating OSPF’s 110, so it is always installed. Add a higher AD (e.g. `... 10.1.1.1 130`) to make it a floating static backup.', ckuIds: ['CKU-ADMINISTRATIVE-DISTANCE'] },
    { id: '3.2-c-q12', concept: 'connected vs static vs dynamic', type: 'definition', difficulty: 'easy',
      question: 'Rank these by default trust (most trusted first): static, OSPF, connected.',
      choices: ['OSPF, static, connected', 'Connected, static, OSPF', 'Static, connected, OSPF', 'Connected, OSPF, static'],
      correctIndex: 1, explanation: 'By AD: connected 0 (most trusted), static 1, OSPF 110.', ckuIds: ['CKU-ADMINISTRATIVE-DISTANCE'] },
  ],

  // ---- Flashcards (front/back self-test) ----
  flashcards: [
    { id: '3.2-f1', ckuId: 'CKU-LONGEST-PREFIX-MATCH', front: 'Which matching route does a router use to forward a packet?', back: 'The one with the longest (most specific) prefix length — longest prefix match. AD/metric never override this.' },
    { id: '3.2-f2', ckuId: 'CKU-ADMINISTRATIVE-DISTANCE', front: 'What does administrative distance compare?', back: 'Routes to the SAME prefix from DIFFERENT sources. Lower AD = more trusted = installed.' },
    { id: '3.2-f3', ckuId: 'CKU-ADMINISTRATIVE-DISTANCE', front: 'Default AD: Connected / Static / EIGRP / OSPF / RIP?', back: '0 / 1 / 90 / 110 / 120 (External EIGRP 170; 255 = never installed).' },
    { id: '3.2-f4', ckuId: 'CKU-METRIC', front: 'When is a routing metric used, and what is its scope?', back: 'To break ties between routes to the same prefix WITHIN one routing protocol. Not comparable across protocols.' },
    { id: '3.2-f5', ckuId: 'CKU-DEFAULT-ROUTE', front: 'Why is 0.0.0.0/0 the “last resort”?', back: 'It matches every destination but has prefix length 0 — the least specific match, so it is used only when nothing more specific matches.' },
    { id: '3.2-f6', ckuId: 'CKU-ADMINISTRATIVE-DISTANCE', front: 'In `[110/30]` from show ip route, which is which?', back: '[administrative distance / metric] → AD 110, metric 30.' },
    { id: '3.2-f7', ckuId: 'CKU-ADMINISTRATIVE-DISTANCE', front: 'What is a floating static route?', back: 'A static route given a higher-than-default AD so it stays out of the table until the preferred dynamic route is lost.' },
    { id: '3.2-f8', ckuId: 'CKU-LONGEST-PREFIX-MATCH', front: 'Forwarding decision order (default)?', back: 'Longest prefix match → administrative distance → metric.' },
  ],

  // ---- Commands ----
  commands: [
    { id: '3.2-cmd1', command: 'show ip route', mode: 'privileged EXEC', purpose: 'Display the IPv4 routing table, including source code, [AD/metric], next hop, and interface.', example: 'R1# show ip route', ckuIds: ['CKU-LONGEST-PREFIX-MATCH', 'CKU-ADMINISTRATIVE-DISTANCE'] },
    { id: '3.2-cmd2', command: 'show ip route <subnet>', mode: 'privileged EXEC', purpose: 'Show details for a specific route, listing the administrative distance and metric plainly.', example: 'R1# show ip route 10.2.2.0', ckuIds: ['CKU-ADMINISTRATIVE-DISTANCE', 'CKU-METRIC'] },
    { id: '3.2-cmd3', command: 'ip route <net> <mask> <next-hop> [AD]', mode: 'global config', purpose: 'Configure a static route; the optional trailing AD creates a floating static backup.', example: 'R1(config)# ip route 10.0.0.0 255.0.0.0 10.1.1.1 130', ckuIds: ['CKU-ADMINISTRATIVE-DISTANCE', 'CKU-DEFAULT-ROUTE'] },
  ],

  // ---- Glossary ----
  glossary: [
    { id: '3.2-g1', term: 'Longest prefix match', definition: 'The rule that a router forwards using the matching route with the most specific (longest) prefix length.', ckuIds: ['CKU-LONGEST-PREFIX-MATCH'] },
    { id: '3.2-g2', term: 'Administrative distance (AD)', definition: 'A 0–255 trust rating for a routing source; lower is preferred. 255 means the route is never installed.', ckuIds: ['CKU-ADMINISTRATIVE-DISTANCE'] },
    { id: '3.2-g3', term: 'Metric', definition: 'A routing protocol’s measure of how good a route is; only comparable within the same protocol.', ckuIds: ['CKU-METRIC'] },
    { id: '3.2-g4', term: 'Default route', definition: 'The 0.0.0.0/0 route (gateway of last resort) that matches any destination but is the least specific.', ckuIds: ['CKU-DEFAULT-ROUTE'] },
    { id: '3.2-g5', term: 'Floating static route', definition: 'A static route with a raised AD so it activates only when the preferred dynamic route is lost.', ckuIds: ['CKU-ADMINISTRATIVE-DISTANCE'] },
    { id: '3.2-g6', term: 'Gateway of last resort', definition: 'The router’s chosen default route, used when no more-specific route matches.', ckuIds: ['CKU-DEFAULT-ROUTE'] },
  ],

  // ---- Mnemonics ----
  mnemonics: [
    { id: '3.2-m1', title: 'AD default values', mnemonic: '0-1-90-110-120 → Connected, Static, EIGRP, OSPF, RIP', explanation: 'Walk the trust ladder lowest-to-highest: Connected 0, Static 1, EIGRP 90, OSPF 110, RIP 120. External EIGRP 170, and 255 = “never.”', ckuIds: ['CKU-ADMINISTRATIVE-DISTANCE'] },
    { id: '3.2-m2', title: 'Decision order', mnemonic: '“Prefix Picks, Distance Decides, Metric Mediates.”', explanation: 'Longest Prefix match picks the route to use; Administrative Distance decides between sources; Metric mediates ties within one protocol.', ckuIds: ['CKU-LONGEST-PREFIX-MATCH', 'CKU-ADMINISTRATIVE-DISTANCE', 'CKU-METRIC'] },
  ],

  // ---- Exam traps ----
  examTraps: [
    { id: '3.2-t1', trap: 'Assuming the lowest AD route always wins.', correction: 'AD only decides among routes to the SAME prefix. A more-specific (longer) prefix always wins first, even with a higher AD.', ckuIds: ['CKU-LONGEST-PREFIX-MATCH', 'CKU-ADMINISTRATIVE-DISTANCE'] },
    { id: '3.2-t2', trap: 'Comparing metrics across routing protocols.', correction: 'Metrics are protocol-specific. Across protocols, AD decides; metric is never compared between OSPF and EIGRP, etc.', ckuIds: ['CKU-METRIC'] },
    { id: '3.2-t3', trap: 'Treating the default route as a normal match.', correction: '0.0.0.0/0 is the least specific route (prefix length 0) and is used only when nothing more specific matches.', ckuIds: ['CKU-DEFAULT-ROUTE'] },
    { id: '3.2-t4', trap: 'Forgetting AD 255 behavior.', correction: 'A route with AD 255 is considered unusable and is never installed in the routing table.', ckuIds: ['CKU-ADMINISTRATIVE-DISTANCE'] },
  ],

  // ---- Misconceptions ----
  misconceptions: [
    { id: '3.2-x1', misconception: 'A lower metric can beat a more-specific route.', reality: 'Longest prefix match happens first and is absolute; AD and metric never override a more-specific matching route.', example: 'A /26 route is used over a /24 route for an address in both, even if the /24 has a better metric.', ckuIds: ['CKU-LONGEST-PREFIX-MATCH', 'CKU-METRIC'] },
    { id: '3.2-x2', misconception: 'AD and metric do the same job.', reality: 'AD chooses between routing SOURCES for the same prefix; metric ranks routes WITHIN one protocol.', example: 'Static (AD 1) beats OSPF (AD 110) regardless of OSPF’s metric.', ckuIds: ['CKU-ADMINISTRATIVE-DISTANCE', 'CKU-METRIC'] },
    { id: '3.2-x3', misconception: 'A default route guarantees connectivity.', reality: 'It only forwards traffic that matches nothing more specific; if the next hop is wrong or down, traffic still fails.', example: 'A `0.0.0.0/0` pointing at a dead link drops everything not otherwise routed.', ckuIds: ['CKU-DEFAULT-ROUTE'] },
  ],

  // ---- Diagram (rendered by the local SVG renderer; nodes use 0..100 coords) ----
  diagram: {
    id: 'DIAG-3.2-lpm',
    title: 'Longest prefix match decision',
    type: 'process',
    ckuIds: ['CKU-LONGEST-PREFIX-MATCH', 'CKU-ADMINISTRATIVE-DISTANCE'],
    nodes: [
      { id: 'pkt', label: 'Packet → 10.1.1.10', type: 'process', x: 50, y: 8 },
      { id: 'r24', label: '10.1.1.0/24 via R2', type: 'subnet', x: 22, y: 48 },
      { id: 'r26', label: '10.1.1.0/26 via R3', type: 'subnet', x: 78, y: 48 },
      { id: 'win', label: 'Use /26 (longest prefix)', type: 'router', x: 78, y: 88, status: 'highlighted' },
    ],
    links: [
      { id: 'l1', source: 'pkt', target: 'r24', label: 'matches', status: 'normal' },
      { id: 'l2', source: 'pkt', target: 'r26', label: 'matches', status: 'normal' },
      { id: 'l3', source: 'r26', target: 'win', label: 'more specific', status: 'forwarding' },
    ],
    annotations: ['Both routes match 10.1.1.10.', 'The longer prefix (/26) is more specific and wins — AD/metric are not consulted here.'],
    sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 16', confidence: 0.9 }],
  },

  // ---- Packet/process flow ----
  packetFlow: {
    id: 'FLOW-3.2-forwarding',
    title: 'Default forwarding decision',
    ckuIds: ['CKU-LONGEST-PREFIX-MATCH', 'CKU-ADMINISTRATIVE-DISTANCE', 'CKU-METRIC'],
    diagramId: 'DIAG-3.2-lpm',
    steps: [
      { id: 's1', order: 1, title: 'Match candidates', action: 'Find every route whose prefix contains the destination IP.', successState: 'matched' },
      { id: 's2', order: 2, title: 'Longest prefix match', action: 'Among matches, select the route with the longest prefix length.', successState: 'matched' },
      { id: 's3', order: 3, title: '(Install-time) AD', action: 'If two sources offered the SAME prefix, the lower-AD source was installed.', successState: 'matched' },
      { id: 's4', order: 4, title: '(Install-time) Metric', action: 'If one protocol offered several routes to that prefix, the lower metric was installed.', successState: 'matched' },
      { id: 's5', order: 5, title: 'Forward or drop', action: 'Forward out the chosen route’s interface to its next hop; if nothing matched and no default exists, drop.', successState: 'forwarded' },
    ],
  },
}

/* -------------------------------------------------------------------------
   OBJECTIVE 1.6 — Configure and verify IPv4 addressing and subnetting
   ------------------------------------------------------------------------- */
const OBJ_16 = {
  objectiveId: '1.6',
  domainId: 'fundamentals',
  title: 'Configure and verify IPv4 addressing and subnetting',
  ckus: [
    { id: 'CKU-IPV4-ADDRESSING', title: 'IPv4 Addressing', summary: 'A 32-bit address written as four dotted-decimal octets, paired with a subnet mask that splits it into a network portion and a host portion.', aliases: ['IPv4', 'dotted decimal'], tags: ['ipv4', 'addressing'], prerequisiteCkuIds: ['CKU-BINARY'], relatedCkuIds: ['CKU-SUBNET-MASK', 'CKU-SUBNETTING'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'IPv4 Addressing', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.6', confidence: 1 }] },
    { id: 'CKU-SUBNET-MASK', title: 'Subnet Mask', summary: 'A 32-bit value of contiguous 1s (network) then 0s (host). The prefix length (/n, CIDR) counts the 1s. Common masks: /24=255.255.255.0, /26=…192, /27=…224, /30=…252.', aliases: ['mask', 'CIDR', 'prefix length'], tags: ['mask', 'cidr'], prerequisiteCkuIds: ['CKU-IPV4-ADDRESSING'], relatedCkuIds: ['CKU-SUBNETTING', 'CKU-BLOCK-SIZE'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 13 — Analyzing Subnet Masks', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.6', confidence: 1 }] },
    { id: 'CKU-SUBNETTING', title: 'Subnetting', summary: 'Borrowing host bits to create more, smaller networks. Hosts per subnet = 2^h − 2 (network + broadcast unusable); number of subnets = 2^(borrowed bits).', aliases: ['subnet', 'subnetwork'], tags: ['subnetting', 'ipv4'], prerequisiteCkuIds: ['CKU-SUBNET-MASK'], relatedCkuIds: ['CKU-BLOCK-SIZE'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 11-14', confidence: 0.95 }, { sourceName: CURATED_SOURCES.jeremy, chapter: 'Subnetting', confidence: 0.95 }] },
    { id: 'CKU-BLOCK-SIZE', title: 'Block Size (Magic Number)', summary: 'Block size = 256 − (the interesting mask octet). Subnet boundaries are multiples of the block size; it gives the network address, broadcast, and usable range fast.', aliases: ['magic number', 'increment'], tags: ['subnetting', 'shortcut'], prerequisiteCkuIds: ['CKU-SUBNETTING'], relatedCkuIds: ['CKU-SUBNETTING'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Block Size method', confidence: 0.95 }] },
  ],
  reading: {
    id: 'READ-1.6', ckuIds: ['CKU-IPV4-ADDRESSING', 'CKU-SUBNET-MASK', 'CKU-SUBNETTING', 'CKU-BLOCK-SIZE'], estimatedReadMinutes: 8,
    tiers: {
      beginner: 'An IPv4 address has 32 bits, shown as four numbers 0–255 (like 192.168.1.10). A subnet mask decides which part is the “network” and which is the “host.” Subnetting just means splitting one network into several smaller ones by moving the dividing line. In every subnet, the first address (all host bits 0) is the network ID and the last (all host bits 1) is the broadcast — neither can be given to a device.',
      intermediate: 'The mask is 32 bits: 1s mark the network, 0s mark the host, written as /n (CIDR). Hosts per subnet = 2^h − 2 where h is the number of host bits (you subtract the network and broadcast addresses). To subnet, you borrow bits from the host side: borrowing b bits makes 2^b subnets, each smaller. The fastest way to find boundaries is the block size = 256 − the interesting mask octet; subnets start at multiples of that block size.',
      examReady: 'IPv4 = 32 bits / 4 octets + a mask of contiguous 1s (network) then 0s (host); the prefix /n is the count of 1s. Hosts/subnet = 2^h − 2 (h = host bits; network and broadcast are unusable). Subnets from borrowing b bits = 2^b. Block size (magic number) = 256 − interesting-octet mask value; subnet network IDs are multiples of the block size in that octet. For any address: network = host bits all 0, broadcast = host bits all 1, usable range = everything between. Examples: /26 (`255.255.255.192`) → block 64, 4 subnets (.0/.64/.128/.192), 62 hosts each; /30 (`255.255.255.252`) → block 4, 2 hosts (point-to-point links); /27 (`255.255.255.224`) → block 32, 30 hosts.',
    },
    definition: 'An IPv4 address is **32 bits** split by a **subnet mask** into network + host portions. **Subnetting** borrows host bits to make more, smaller networks; **block size** (`256 − mask octet`) locates subnet boundaries instantly.',
    keyPoints: [
      'Hosts per subnet = `2^h − 2` (h = host bits; network + broadcast are unusable).',
      'Number of subnets when borrowing b bits = `2^b`.',
      'Block size = `256 − interesting mask octet`; subnets start at multiples of it.',
      'Network address = host bits all 0; broadcast = host bits all 1; usable = in between.',
      'Common masks: `/24`=…0, `/26`=…192, `/27`=…224, `/28`=…240, `/30`=…252.',
      '`/30` gives 2 usable hosts — ideal for point-to-point router links.',
    ],
    realWorld: 'On a router, `ip address 192.168.1.1 255.255.255.0` sets an interface address + mask; `show ip interface brief` confirms it. Connected (`C`) and local (`L`, /32) routes appear automatically once the interface is up/up.',
    commonMistakes: [
      'Forgetting to subtract 2 for the network and broadcast addresses.',
      'Assigning the network or broadcast address to a host.',
      'Mixing up number-of-subnets (2^b) with hosts-per-subnet (2^h − 2).',
      'Using the wrong octet for the block size on /8–/16 masks.',
    ],
    related: ['1.7 Private IPv4', '1.8 IPv6 addressing', '3.1 Routing table'],
    advanced: 'VLSM (variable-length subnet masks) applies different masks to different subnets so each is sized to its host count, conserving addresses — e.g. /30 for WAN links and /26 for user LANs in the same network. Always allocate largest subnets first.',
    sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 11-14 + App N (VLSM)', confidence: 0.95 }, { sourceName: CURATED_SOURCES.jeremy, chapter: 'Subnetting', confidence: 0.9 }],
  },
  questions: [
    { id: '1.6-c-q1', concept: 'hosts per subnet', type: 'application', difficulty: 'easy', question: 'How many usable host addresses are in a `/26` subnet?', choices: ['64', '62', '30', '126'], correctIndex: 1, explanation: '/26 has 6 host bits → 2^6 − 2 = 62 usable hosts.', ckuIds: ['CKU-SUBNETTING'] },
    { id: '1.6-c-q2', concept: 'block size', type: 'application', difficulty: 'medium', question: 'What is the block size for a `/27` mask (`255.255.255.224`)?', choices: ['16', '32', '64', '8'], correctIndex: 1, explanation: 'Block size = 256 − 224 = 32.', ckuIds: ['CKU-BLOCK-SIZE'] },
    { id: '1.6-c-q3', concept: 'broadcast address', type: 'scenario', difficulty: 'medium', question: 'What is the broadcast address of `192.168.10.0/26`?', choices: ['192.168.10.255', '192.168.10.63', '192.168.10.127', '192.168.10.64'], correctIndex: 1, explanation: 'Block 64 → first subnet is .0–.63, so broadcast = .63.', ckuIds: ['CKU-BLOCK-SIZE', 'CKU-SUBNETTING'] },
    { id: '1.6-c-q4', concept: 'find the subnet', type: 'scenario', difficulty: 'hard', question: 'Which subnet does host `172.16.0.100/26` belong to?', choices: ['172.16.0.0', '172.16.0.64', '172.16.0.96', '172.16.0.128'], correctIndex: 1, explanation: 'Block 64 → boundaries .0/.64/.128/.192; 100 falls in .64–.127, so the subnet is 172.16.0.64.', ckuIds: ['CKU-BLOCK-SIZE'] },
    { id: '1.6-c-q5', concept: 'mask for host count', type: 'application', difficulty: 'medium', question: 'Which mask provides at least 30 usable hosts with the fewest addresses wasted?', choices: ['/26', '/27', '/28', '/29'], correctIndex: 1, explanation: '/27 → 2^5 − 2 = 30 usable hosts exactly.', ckuIds: ['CKU-SUBNETTING'] },
    { id: '1.6-c-q6', concept: 'point-to-point', type: 'definition', difficulty: 'easy', question: 'How many usable hosts does a `/30` subnet provide?', choices: ['1', '2', '4', '0'], correctIndex: 1, explanation: '/30 → 2^2 − 2 = 2 usable hosts — perfect for a router-to-router link.', ckuIds: ['CKU-SUBNETTING'] },
    { id: '1.6-c-q7', concept: 'number of subnets', type: 'application', difficulty: 'medium', question: 'Borrowing 3 host bits from a `/24`, how many subnets do you create?', choices: ['6', '8', '16', '3'], correctIndex: 1, explanation: 'Number of subnets = 2^(borrowed bits) = 2^3 = 8.', ckuIds: ['CKU-SUBNETTING'] },
    { id: '1.6-c-q8', concept: 'CIDR conversion', type: 'definition', difficulty: 'easy', question: 'What is the CIDR prefix for the mask `255.255.255.240`?', choices: ['/26', '/27', '/28', '/29'], correctIndex: 2, explanation: '240 = 11110000 → 4 bits in the last octet; 24 + 4 = /28.', ckuIds: ['CKU-SUBNET-MASK'] },
    { id: '1.6-c-q9', concept: 'usable range', type: 'scenario', difficulty: 'hard', question: 'What is the usable host range of `10.0.0.0/29`?', choices: ['10.0.0.1 – 10.0.0.6', '10.0.0.1 – 10.0.0.7', '10.0.0.0 – 10.0.0.7', '10.0.0.1 – 10.0.0.14'], correctIndex: 0, explanation: 'Block 8 → network .0, broadcast .7, usable .1–.6.', ckuIds: ['CKU-BLOCK-SIZE', 'CKU-SUBNETTING'] },
    { id: '1.6-c-q10', concept: 'network/host bits', type: 'definition', difficulty: 'easy', question: 'How many host bits are in a `/26` address?', choices: ['26', '6', '8', '4'], correctIndex: 1, explanation: '32 − 26 = 6 host bits.', ckuIds: ['CKU-SUBNET-MASK'] },
    { id: '1.6-c-q11', concept: 'reserved addresses', type: 'true-false', difficulty: 'easy', question: 'True or False: The network and broadcast addresses of a subnet can be assigned to hosts.', choices: ['True', 'False'], correctIndex: 1, explanation: 'False — both are reserved, which is why hosts = 2^h − 2.', ckuIds: ['CKU-SUBNETTING'] },
    { id: '1.6-c-q12', concept: 'mask selection', type: 'application', difficulty: 'medium', question: 'A LAN needs 200 hosts. What is the smallest standard mask that fits?', choices: ['/24', '/25', '/23', '/26'], correctIndex: 0, explanation: '/24 → 2^8 − 2 = 254 usable, the smallest mask that holds 200 hosts (/25 gives only 126).', ckuIds: ['CKU-SUBNETTING'] },
  ],
  flashcards: [
    { id: '1.6-f1', ckuId: 'CKU-SUBNETTING', front: 'Formula for usable hosts per subnet?', back: '2^h − 2, where h = host bits (subtract network + broadcast).' },
    { id: '1.6-f2', ckuId: 'CKU-SUBNETTING', front: 'Formula for number of subnets when borrowing b bits?', back: '2^b.' },
    { id: '1.6-f3', ckuId: 'CKU-BLOCK-SIZE', front: 'How do you find the block size (magic number)?', back: '256 − the interesting mask octet. Subnets start at multiples of it.' },
    { id: '1.6-f4', ckuId: 'CKU-SUBNETTING', front: 'Network vs broadcast address of a subnet?', back: 'Network = host bits all 0 (first); broadcast = host bits all 1 (last).' },
    { id: '1.6-f5', ckuId: 'CKU-SUBNET-MASK', front: 'Masks for /26, /27, /28, /30?', back: '255.255.255.192 / .224 / .240 / .252.' },
    { id: '1.6-f6', ckuId: 'CKU-SUBNETTING', front: 'Hosts in /30, /29, /28, /27?', back: '2, 6, 14, 30.' },
    { id: '1.6-f7', ckuId: 'CKU-SUBNETTING', front: 'Why use a /30?', back: '2 usable hosts — exactly right for a point-to-point router link.' },
    { id: '1.6-f8', ckuId: 'CKU-SUBNET-MASK', front: 'What does the CIDR /n mean?', back: 'The number of network (1) bits in the mask, counted from the left.' },
  ],
  commands: [
    { id: '1.6-cmd1', command: 'ip address <ip> <mask>', mode: 'interface config', purpose: 'Assign an IPv4 address and subnet mask to an interface.', example: 'R1(config-if)# ip address 192.168.1.1 255.255.255.0', ckuIds: ['CKU-IPV4-ADDRESSING', 'CKU-SUBNET-MASK'] },
    { id: '1.6-cmd2', command: 'show ip interface brief', mode: 'privileged EXEC', purpose: 'List interfaces with their IP address and up/down status.', example: 'R1# show ip interface brief', ckuIds: ['CKU-IPV4-ADDRESSING'] },
    { id: '1.6-cmd3', command: 'show ip route connected', mode: 'privileged EXEC', purpose: 'Show the connected/local routes created from interface addressing.', example: 'R1# show ip route connected', ckuIds: ['CKU-SUBNETTING'] },
  ],
  glossary: [
    { id: '1.6-g1', term: 'Subnet mask', definition: '32-bit value of contiguous 1s (network) then 0s (host) that divides an IPv4 address.', ckuIds: ['CKU-SUBNET-MASK'] },
    { id: '1.6-g2', term: 'CIDR / prefix length', definition: 'The /n notation giving the number of network bits in the mask.', ckuIds: ['CKU-SUBNET-MASK'] },
    { id: '1.6-g3', term: 'Block size', definition: '256 minus the interesting mask octet; the increment between subnet boundaries.', ckuIds: ['CKU-BLOCK-SIZE'] },
    { id: '1.6-g4', term: 'Network address', definition: 'The first address of a subnet (host bits all 0); identifies the subnet, not a host.', ckuIds: ['CKU-SUBNETTING'] },
    { id: '1.6-g5', term: 'Broadcast address', definition: 'The last address of a subnet (host bits all 1); reaches all hosts in the subnet.', ckuIds: ['CKU-SUBNETTING'] },
    { id: '1.6-g6', term: 'VLSM', definition: 'Variable-Length Subnet Masking — using different masks per subnet to match each subnet’s size.', ckuIds: ['CKU-SUBNETTING'] },
  ],
  mnemonics: [
    { id: '1.6-m1', title: 'Block size', mnemonic: '“256 minus mask = jump.”', explanation: 'Subtract the interesting mask octet from 256 to get the block size; subnet IDs jump by that amount.', ckuIds: ['CKU-BLOCK-SIZE'] },
    { id: '1.6-m2', title: 'Powers of 2', mnemonic: '1, 2, 4, 8, 16, 32, 64, 128', explanation: 'Memorize the powers of 2 left-to-right; mask octet values are 128, 192, 224, 240, 248, 252, 254, 255.', ckuIds: ['CKU-SUBNET-MASK'] },
  ],
  examTraps: [
    { id: '1.6-t1', trap: 'Forgetting the “− 2” in the host formula.', correction: 'Usable hosts = 2^h − 2 because the network and broadcast addresses can’t be assigned.', ckuIds: ['CKU-SUBNETTING'] },
    { id: '1.6-t2', trap: 'Confusing subnets (2^b) with hosts (2^h − 2).', correction: 'Borrowed bits give the number of subnets; remaining host bits give hosts per subnet.', ckuIds: ['CKU-SUBNETTING'] },
    { id: '1.6-t3', trap: 'Using the wrong octet for block size.', correction: 'Apply block size to the octet where the mask is neither 255 nor 0 (the interesting octet).', ckuIds: ['CKU-BLOCK-SIZE'] },
    { id: '1.6-t4', trap: 'Assuming /31 and /32 are normal host subnets.', correction: '/32 is a single host route; /31 is a special 2-address point-to-point (RFC 3021) with no broadcast.', ckuIds: ['CKU-SUBNETTING'] },
  ],
  misconceptions: [
    { id: '1.6-x1', misconception: 'A bigger prefix (/27) means a bigger network.', reality: 'A larger prefix number means MORE network bits and FEWER hosts — a smaller subnet.', example: '/24 has 254 hosts; /27 has only 30.', ckuIds: ['CKU-SUBNET-MASK'] },
    { id: '1.6-x2', misconception: 'You can assign the .0 or .255 address to a host.', reality: 'Within a subnet the all-0 host (network) and all-1 host (broadcast) are reserved.', example: 'In 192.168.1.0/24, .0 and .255 are not assignable.', ckuIds: ['CKU-SUBNETTING'] },
    { id: '1.6-x3', misconception: 'The block size is always in the 4th octet.', reality: 'It applies to whichever octet the mask splits — e.g. a /18 subnets in the 3rd octet.', example: '/18 = 255.255.192.0 → block 64 in the third octet.', ckuIds: ['CKU-BLOCK-SIZE'] },
  ],
  diagram: {
    id: 'DIAG-1.6-subnets', title: 'A /26 splits a /24 into four', type: 'process', ckuIds: ['CKU-SUBNETTING', 'CKU-BLOCK-SIZE'],
    nodes: [
      { id: 'net', label: '192.168.1.0 /24', type: 'subnet', x: 50, y: 10 },
      { id: 's0', label: '.0–.63 (/26)', type: 'subnet', x: 18, y: 60 },
      { id: 's1', label: '.64–.127', type: 'subnet', x: 39, y: 60 },
      { id: 's2', label: '.128–.191', type: 'subnet', x: 61, y: 60 },
      { id: 's3', label: '.192–.255', type: 'router', x: 82, y: 60, status: 'highlighted' },
    ],
    links: [
      { id: 'b0', source: 'net', target: 's0', label: 'block 64' }, { id: 'b1', source: 'net', target: 's1' },
      { id: 'b2', source: 'net', target: 's2' }, { id: 'b3', source: 'net', target: 's3' },
    ],
    annotations: ['/26 borrows 2 bits → 4 subnets, block size 64.', 'Each subnet: 62 usable hosts (.1–.62 in the first).'],
    sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 14', confidence: 0.9 }],
  },
  packetFlow: {
    id: 'FLOW-1.6-findsubnet', title: 'Find an address’s subnet', ckuIds: ['CKU-BLOCK-SIZE', 'CKU-SUBNETTING'], diagramId: 'DIAG-1.6-subnets',
    steps: [
      { id: 's1', order: 1, title: 'Block size', action: 'Compute 256 − interesting mask octet.', successState: 'matched' },
      { id: 's2', order: 2, title: 'Find boundary', action: 'Round the address’s octet down to the nearest multiple of the block size = network address.', successState: 'matched' },
      { id: 's3', order: 3, title: 'Broadcast', action: 'Add block size − 1 to the network octet = broadcast address.', successState: 'matched' },
      { id: 's4', order: 4, title: 'Usable range', action: 'Everything between network+1 and broadcast−1 is assignable.', successState: 'forwarded' },
    ],
  },
}

/* -------------------------------------------------------------------------
   OBJECTIVE 1.5 — Compare TCP to UDP
   ------------------------------------------------------------------------- */
const OBJ_15 = {
  objectiveId: '1.5',
  domainId: 'fundamentals',
  title: 'Compare TCP to UDP',
  ckus: [
    { id: 'CKU-TCP', title: 'TCP (Transmission Control Protocol)', summary: 'A connection-oriented Layer 4 protocol that provides reliability (acknowledgements + retransmission), sequencing, and flow control. IP protocol number 6.', aliases: ['Transmission Control Protocol'], tags: ['transport', 'tcp', 'layer4'], prerequisiteCkuIds: ['CKU-PORT-NUMBERS'], relatedCkuIds: ['CKU-UDP', 'CKU-TCP-HANDSHAKE'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'TCP and UDP (Layer 4)', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.5', confidence: 1 }] },
    { id: 'CKU-UDP', title: 'UDP (User Datagram Protocol)', summary: 'A connectionless, best-effort Layer 4 protocol with no acknowledgements, sequencing, or flow control — only a checksum for error detection. Low overhead, low latency. IP protocol number 17.', aliases: ['User Datagram Protocol'], tags: ['transport', 'udp', 'layer4'], prerequisiteCkuIds: ['CKU-PORT-NUMBERS'], relatedCkuIds: ['CKU-TCP'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'UDP', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.5', confidence: 1 }] },
    { id: 'CKU-PORT-NUMBERS', title: 'Port Numbers', summary: 'Layer 4 addresses (0–65535) identifying the application/service. Well-known 0–1023, registered 1024–49151, ephemeral 49152–65535. A socket = IP + port.', aliases: ['ports', 'sockets', 'layer 4 addressing'], tags: ['ports', 'transport'], prerequisiteCkuIds: [], relatedCkuIds: ['CKU-TCP', 'CKU-UDP'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Port Numbers (IANA)', confidence: 0.95 }] },
    { id: 'CKU-TCP-HANDSHAKE', title: 'TCP Three-Way Handshake', summary: 'How TCP establishes a connection before data: SYN → SYN-ACK → ACK. Connection teardown uses FIN/ACK exchanges.', aliases: ['3-way handshake', 'SYN SYN-ACK ACK'], tags: ['tcp', 'connection'], prerequisiteCkuIds: ['CKU-TCP'], relatedCkuIds: ['CKU-TCP'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 5 — Connection Establishment', confidence: 0.9 }] },
  ],
  reading: {
    id: 'READ-1.5', ckuIds: ['CKU-TCP', 'CKU-UDP', 'CKU-PORT-NUMBERS', 'CKU-TCP-HANDSHAKE'], estimatedReadMinutes: 6,
    tiers: {
      beginner: 'TCP and UDP are the two Layer 4 (transport) protocols. TCP is careful: it sets up a connection first, numbers the data, and makes sure everything arrives — re-sending anything lost. UDP just fires the data off without setup or guarantees (“best effort”). TCP is great for things that must be exact (web pages, files); UDP is great for things that must be fast (voice, video, DNS). Both use port numbers to label which application the data is for.',
      intermediate: 'TCP is connection-oriented: a three-way handshake (SYN → SYN-ACK → ACK) sets up the session before any data. It provides reliability (every segment is acknowledged; unacknowledged segments are retransmitted), sequencing (sequence numbers reorder out-of-order segments), and flow control (the window size lets the receiver throttle the sender). UDP is connectionless and best-effort — no handshake, no acknowledgements, no sequencing, no flow control — just a checksum for error detection, which makes it lighter and faster. Ports (0–65535) identify the application: well-known 0–1023, registered 1024–49151, ephemeral 49152–65535.',
      examReady: 'TCP = connection-oriented, reliable (ACK + retransmit), sequenced, flow-controlled (window size); IP protocol 6; three-way handshake SYN → SYN-ACK → ACK. UDP = connectionless, best-effort, no ACK/sequencing/flow-control, checksum only; IP protocol 17; lower overhead → preferred for real-time voice/video and simple query/response (DNS, DHCP, TFTP, SNMP). Ports: well-known 0–1023, registered 1024–49151, ephemeral/dynamic 49152–65535. Know common ports: FTP `20/21`, SSH `22`, Telnet `23`, SMTP `25`, DNS `53`, DHCP `67/68`, TFTP `69`, HTTP `80`, HTTPS `443`, SNMP `161`, Syslog `514`, NTP `123`. DNS and some others use UDP by default but can fall back to TCP.',
    },
    definition: 'TCP and UDP are the two Layer 4 protocols. **TCP** is connection-oriented and **reliable** (handshake, acknowledgements, sequencing, flow control). **UDP** is connectionless and **best-effort** (no guarantees, just a checksum) — lighter and faster. Both use **port numbers** to identify the application.',
    keyPoints: [
      'TCP: connection-oriented, reliable, sequenced, flow-controlled. IP protocol `6`.',
      'UDP: connectionless, best-effort, checksum only — low overhead. IP protocol `17`.',
      'TCP handshake: `SYN` → `SYN-ACK` → `ACK`.',
      'Port ranges: well-known `0–1023`, registered `1024–49151`, ephemeral `49152–65535`.',
      'UDP preferred for real-time (voice/video) and simple query/response (DNS, DHCP, TFTP).',
      'Reliability ≠ security — TCP is reliable but not encrypted.',
    ],
    realWorld: 'A web download uses TCP `443` (HTTPS) so no bytes are lost; a VoIP call uses UDP because re-sending a late voice packet is useless — better to drop it. `show ip access-lists` and ACLs match on TCP/UDP port numbers to permit/deny specific apps.',
    commonMistakes: [
      'Saying UDP has “no error checking” — it has a checksum; it just has no recovery.',
      'Thinking TCP reliability means TCP is secure (it is not — that is TLS).',
      'Forgetting DNS uses UDP/53 by default (TCP/53 for large/zone transfers).',
      'Confusing Layer 4 port numbers with physical switch ports.',
    ],
    related: ['1.13 Switching', '4.3 DHCP/DNS', '5.5 ACLs (match ports)'],
    advanced: 'TCP flow control uses a sliding window; the receiver advertises a window size that grows/shrinks to match its buffer. TCP also does congestion control (slow start). The IPv4 header’s Protocol field (6 or 17) tells the receiver which Layer 4 header follows.',
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'TCP and UDP (Layer 4)', confidence: 0.95 }, { sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 5', confidence: 0.9 }],
  },
  questions: [
    { id: '1.5-c-q1', concept: 'reliability', type: 'definition', difficulty: 'easy', question: 'Which Layer 4 protocol is connection-oriented and reliable?', choices: ['UDP', 'TCP', 'IP', 'ICMP'], correctIndex: 1, explanation: 'TCP establishes a connection and guarantees delivery via acknowledgements and retransmission.', ckuIds: ['CKU-TCP'] },
    { id: '1.5-c-q2', concept: 'three-way handshake', type: 'scenario', difficulty: 'medium', question: 'What is the correct order of the TCP three-way handshake?', choices: ['ACK → SYN → SYN-ACK', 'SYN → ACK → SYN-ACK', 'SYN → SYN-ACK → ACK', 'SYN-ACK → SYN → ACK'], correctIndex: 2, explanation: 'The initiator sends SYN, the receiver replies SYN-ACK, the initiator confirms with ACK.', ckuIds: ['CKU-TCP-HANDSHAKE'] },
    { id: '1.5-c-q3', concept: 'best-effort', type: 'definition', difficulty: 'easy', question: 'Which protocol is connectionless and best-effort?', choices: ['TCP', 'UDP', 'HTTP', 'FTP'], correctIndex: 1, explanation: 'UDP sends data without a connection or guarantees of delivery.', ckuIds: ['CKU-UDP'] },
    { id: '1.5-c-q4', concept: 'port ranges', type: 'definition', difficulty: 'medium', question: 'What is the well-known port range?', choices: ['0–1023', '1024–49151', '49152–65535', '0–255'], correctIndex: 0, explanation: 'Well-known ports are 0–1023 (e.g. HTTP 80, HTTPS 443).', ckuIds: ['CKU-PORT-NUMBERS'] },
    { id: '1.5-c-q5', concept: 'application choice', type: 'scenario', difficulty: 'medium', question: 'A real-time VoIP call would most likely use which protocol, and why?', choices: ['TCP, for guaranteed delivery', 'UDP, for low latency and overhead', 'TCP, for sequencing', 'UDP, because it encrypts voice'], correctIndex: 1, explanation: 'Voice favors UDP — retransmitting late audio is useless, so low latency matters more than reliability.', ckuIds: ['CKU-UDP'] },
    { id: '1.5-c-q6', concept: 'IP protocol numbers', type: 'application', difficulty: 'hard', question: 'In the IPv4 header, which Protocol values indicate TCP and UDP?', choices: ['1 and 2', '6 and 17', '80 and 443', '17 and 6 reversed', ], correctIndex: 1, explanation: 'TCP = 6, UDP = 17 in the IPv4 Protocol field.', ckuIds: ['CKU-TCP', 'CKU-UDP'] },
    { id: '1.5-c-q7', concept: 'sequencing', type: 'definition', difficulty: 'easy', question: 'Which TCP feature reorders segments that arrive out of order?', choices: ['Flow control', 'Sequencing (sequence numbers)', 'Checksum', 'Windowing'], correctIndex: 1, explanation: 'Sequence numbers let the receiver reassemble segments in the right order.', ckuIds: ['CKU-TCP'] },
    { id: '1.5-c-q8', concept: 'common ports', type: 'definition', difficulty: 'easy', question: 'What port does HTTPS use?', choices: ['80', '22', '443', '53'], correctIndex: 2, explanation: 'HTTPS uses TCP port 443; HTTP uses 80.', ckuIds: ['CKU-PORT-NUMBERS'] },
    { id: '1.5-c-q9', concept: 'flow control', type: 'definition', difficulty: 'medium', question: 'Which TCP mechanism lets the receiver throttle the sender’s rate?', choices: ['Sequencing', 'Flow control (window size)', 'Checksum', 'Handshake'], correctIndex: 1, explanation: 'The advertised window size implements flow control.', ckuIds: ['CKU-TCP'] },
    { id: '1.5-c-q10', concept: 'UDP checksum', type: 'true-false', difficulty: 'medium', question: 'True or False: UDP performs no error detection at all.', choices: ['True', 'False'], correctIndex: 1, explanation: 'False — UDP has a checksum for error detection; it just cannot recover (retransmit) lost data.', ckuIds: ['CKU-UDP'] },
    { id: '1.5-c-q11', concept: 'DNS transport', type: 'scenario', difficulty: 'medium', question: 'Which statement about DNS transport is correct?', choices: ['DNS only uses TCP', 'DNS only uses UDP', 'DNS uses UDP/53 by default and TCP/53 for large responses/zone transfers', 'DNS uses port 80'], correctIndex: 2, explanation: 'DNS defaults to UDP/53 but falls back to TCP/53 for large messages and zone transfers.', ckuIds: ['CKU-PORT-NUMBERS', 'CKU-UDP'] },
    { id: '1.5-c-q12', concept: 'reliability vs security', type: 'true-false', difficulty: 'easy', question: 'True or False: Because TCP is reliable, the data it carries is also encrypted/secure.', choices: ['True', 'False'], correctIndex: 1, explanation: 'False — reliability (delivery) and security (encryption) are different; TLS provides encryption, not TCP.', ckuIds: ['CKU-TCP'] },
  ],
  flashcards: [
    { id: '1.5-f1', ckuId: 'CKU-TCP', front: 'Four services TCP provides that UDP does not?', back: 'Connection setup (handshake), reliability (ACK + retransmit), sequencing, flow control.' },
    { id: '1.5-f2', ckuId: 'CKU-TCP-HANDSHAKE', front: 'TCP three-way handshake?', back: 'SYN → SYN-ACK → ACK.' },
    { id: '1.5-f3', ckuId: 'CKU-UDP', front: 'What does UDP provide?', back: 'Best-effort delivery + a checksum (error detection). No connection, ACK, sequencing, or flow control.' },
    { id: '1.5-f4', ckuId: 'CKU-TCP', front: 'IP protocol numbers for TCP and UDP?', back: 'TCP = 6, UDP = 17.' },
    { id: '1.5-f5', ckuId: 'CKU-PORT-NUMBERS', front: 'Three port ranges?', back: 'Well-known 0–1023, registered 1024–49151, ephemeral 49152–65535.' },
    { id: '1.5-f6', ckuId: 'CKU-PORT-NUMBERS', front: 'Ports: SSH, Telnet, DNS, HTTP, HTTPS?', back: '22, 23, 53, 80, 443.' },
    { id: '1.5-f7', ckuId: 'CKU-PORT-NUMBERS', front: 'Ports: FTP, TFTP, DHCP, SNMP, Syslog?', back: 'FTP 20/21, TFTP 69, DHCP 67/68, SNMP 161, Syslog 514.' },
    { id: '1.5-f8', ckuId: 'CKU-UDP', front: 'When is UDP preferred over TCP?', back: 'Real-time voice/video and simple query/response (DNS, DHCP, TFTP) — low latency/overhead.' },
  ],
  commands: [
    { id: '1.5-cmd1', command: 'show ip access-lists', mode: 'privileged EXEC', purpose: 'Display ACLs, which match on TCP/UDP protocol and port numbers.', example: 'R1# show ip access-lists', ckuIds: ['CKU-PORT-NUMBERS'] },
    { id: '1.5-cmd2', command: 'netstat -an', mode: 'device cli', purpose: 'On a host, list active TCP/UDP connections and listening ports.', example: 'C:\\> netstat -an', ckuIds: ['CKU-TCP', 'CKU-PORT-NUMBERS'] },
    { id: '1.5-cmd3', command: 'access-list 100 permit tcp any any eq 443', mode: 'global config', purpose: 'Example extended-ACL line matching a TCP destination port (HTTPS).', example: 'R1(config)# access-list 100 permit tcp any any eq 443', ckuIds: ['CKU-TCP', 'CKU-PORT-NUMBERS'] },
  ],
  glossary: [
    { id: '1.5-g1', term: 'TCP', definition: 'Connection-oriented, reliable Layer 4 protocol (handshake, ACK, sequencing, flow control); IP protocol 6.', ckuIds: ['CKU-TCP'] },
    { id: '1.5-g2', term: 'UDP', definition: 'Connectionless, best-effort Layer 4 protocol with only a checksum; IP protocol 17.', ckuIds: ['CKU-UDP'] },
    { id: '1.5-g3', term: 'Three-way handshake', definition: 'TCP connection setup: SYN, SYN-ACK, ACK.', ckuIds: ['CKU-TCP-HANDSHAKE'] },
    { id: '1.5-g4', term: 'Port number', definition: 'A 0–65535 Layer 4 address identifying the application/service.', ckuIds: ['CKU-PORT-NUMBERS'] },
    { id: '1.5-g5', term: 'Socket', definition: 'The combination of an IP address and a port number.', ckuIds: ['CKU-PORT-NUMBERS'] },
    { id: '1.5-g6', term: 'Flow control', definition: 'TCP’s use of window size to let the receiver pace the sender.', ckuIds: ['CKU-TCP'] },
  ],
  mnemonics: [
    { id: '1.5-m1', title: 'Handshake', mnemonic: '“SYN, SYN-ACK, ACK.”', explanation: 'Three steps to open a TCP connection — say it as a rhythm.', ckuIds: ['CKU-TCP-HANDSHAKE'] },
    { id: '1.5-m2', title: 'TCP vs UDP', mnemonic: 'TCP = Telephone Call (set up first), UDP = Unaddressed Drop-off (just send).', explanation: 'A call needs a connection and confirmation (TCP); a flyer dropped in a mailbox is best-effort (UDP).', ckuIds: ['CKU-TCP', 'CKU-UDP'] },
  ],
  examTraps: [
    { id: '1.5-t1', trap: 'Saying UDP has no error checking.', correction: 'UDP has a checksum for error DETECTION; it just has no recovery/retransmission.', ckuIds: ['CKU-UDP'] },
    { id: '1.5-t2', trap: 'Equating TCP reliability with security.', correction: 'Reliable delivery ≠ encryption. TLS/IPsec provide security; TCP does not.', ckuIds: ['CKU-TCP'] },
    { id: '1.5-t3', trap: 'Assuming DNS is TCP.', correction: 'DNS uses UDP/53 by default, TCP/53 for large responses and zone transfers.', ckuIds: ['CKU-PORT-NUMBERS'] },
    { id: '1.5-t4', trap: 'Mixing Layer 4 ports with switch ports.', correction: 'Port numbers are Layer 4 application addresses, not physical interfaces.', ckuIds: ['CKU-PORT-NUMBERS'] },
  ],
  misconceptions: [
    { id: '1.5-x1', misconception: 'UDP is “bad” because it is unreliable.', reality: 'UDP is ideal when speed beats guaranteed delivery — voice, video, DNS, DHCP all rely on it.', example: 'Re-sending a late voice packet would arrive too late to be useful.', ckuIds: ['CKU-UDP'] },
    { id: '1.5-x2', misconception: 'TCP and UDP can use the same port for different apps without conflict.', reality: 'TCP/80 and UDP/80 are independent, but within one protocol a listening port maps to one service.', example: 'DNS listens on UDP/53 and TCP/53 separately.', ckuIds: ['CKU-PORT-NUMBERS'] },
    { id: '1.5-x3', misconception: 'The handshake transfers application data.', reality: 'The SYN/SYN-ACK/ACK only establishes the connection; data flows after it completes.', example: 'A web page’s bytes start after the handshake finishes.', ckuIds: ['CKU-TCP-HANDSHAKE'] },
  ],
  diagram: {
    id: 'DIAG-1.5-handshake', title: 'TCP three-way handshake', type: 'process', ckuIds: ['CKU-TCP-HANDSHAKE'],
    nodes: [
      { id: 'c', label: 'Client', type: 'pc', x: 20, y: 50 },
      { id: 'syn', label: '1. SYN →', type: 'process', x: 50, y: 18 },
      { id: 'sa', label: '2. ← SYN-ACK', type: 'process', x: 50, y: 50 },
      { id: 'ack', label: '3. ACK →', type: 'process', x: 50, y: 82, status: 'highlighted' },
      { id: 's', label: 'Server', type: 'server', x: 80, y: 50 },
    ],
    links: [
      { id: 'l1', source: 'c', target: 'syn', status: 'forwarding' }, { id: 'l2', source: 'syn', target: 's' },
      { id: 'l3', source: 's', target: 'sa' }, { id: 'l4', source: 'sa', target: 'c' },
      { id: 'l5', source: 'c', target: 'ack', status: 'forwarding' }, { id: 'l6', source: 'ack', target: 's' },
    ],
    annotations: ['Connection is established only after all three messages.', 'Data transfer begins after the ACK.'],
    sourceRefs: [{ sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 5', confidence: 0.9 }],
  },
  packetFlow: {
    id: 'FLOW-1.5-handshake', title: 'Opening a TCP connection', ckuIds: ['CKU-TCP-HANDSHAKE', 'CKU-TCP'], diagramId: 'DIAG-1.5-handshake',
    steps: [
      { id: 's1', order: 1, title: 'SYN', action: 'Client sends SYN with its initial sequence number.', successState: 'forwarded' },
      { id: 's2', order: 2, title: 'SYN-ACK', action: 'Server replies SYN-ACK, acknowledging and sending its own sequence number.', successState: 'forwarded' },
      { id: 's3', order: 3, title: 'ACK', action: 'Client ACKs the server’s sequence number; the connection is established.', successState: 'matched' },
      { id: 's4', order: 4, title: 'Data', action: 'Application data flows reliably, acknowledged and sequenced.', successState: 'forwarded' },
    ],
  },
}

/* -------------------------------------------------------------------------
   REGISTRY + LOADER
   ------------------------------------------------------------------------- */
const CURATED = { [OBJ_32.objectiveId]: OBJ_32, [OBJ_16.objectiveId]: OBJ_16, [OBJ_15.objectiveId]: OBJ_15 }

/** Objective IDs that have curated static content (the rest fall back to AI). */
export const curatedObjectiveIds = new Set(Object.keys(CURATED))
export function hasCurated(objectiveId) { return curatedObjectiveIds.has(objectiveId) }
export function getCurated(objectiveId) { return CURATED[objectiveId] || null }

/** Curated questions reshaped to the app's quiz-bank question shape. */
export function getCuratedQuestions(objectiveId) {
  const o = CURATED[objectiveId]
  if (!o) return []
  return o.questions.map(q => ({
    question: q.question, choices: q.choices, correctIndex: q.correctIndex,
    explanation: q.explanation, type: q.type, difficulty: q.difficulty, concept: q.concept,
  }))
}

/* -------------------------------------------------------------------------
   RUNTIME VALIDATOR — enforces the pilot's definition-of-done. Returns
   { ok, errors[] }. Pure; safe to run on load in dev or from a script.
   ------------------------------------------------------------------------- */
export function validateCurated() {
  const errors = []
  const seenIds = new Set()
  const dup = (id, where) => { if (!id) errors.push(`${where}: missing id`); else if (seenIds.has(id)) errors.push(`duplicate id "${id}" (${where})`); else seenIds.add(id) }
  const okSrcRefs = (refs, where) => {
    if (!Array.isArray(refs) || refs.length === 0) { errors.push(`${where}: no sourceRefs`); return }
    refs.forEach((r, i) => { if (!r.sourceName) errors.push(`${where}: sourceRef[${i}] missing sourceName`); if (typeof r.confidence !== 'number') errors.push(`${where}: sourceRef[${i}] missing confidence`) })
  }

  for (const obj of Object.values(CURATED)) {
    const ckuIds = new Set(obj.ckus.map(c => c.id))
    if (!obj.objectiveId) errors.push('objective missing objectiveId')

    obj.ckus.forEach(c => { dup(c.id, 'cku'); if (!c.summary) errors.push(`cku ${c.id}: empty summary`); okSrcRefs(c.sourceRefs, `cku ${c.id}`) })

    const r = obj.reading
    dup(r.id, 'reading')
    if (!r.ckuIds?.length) errors.push(`reading ${r.id}: no CKUs`)
    r.ckuIds.forEach(id => { if (!ckuIds.has(id)) errors.push(`reading ${r.id}: unknown CKU ${id}`) })
    if (!r.tiers?.beginner || !r.tiers?.intermediate || !r.tiers?.examReady) errors.push(`reading ${r.id}: missing a depth tier`)
    if (!r.definition) errors.push(`reading ${r.id}: empty definition`)
    okSrcRefs(r.sourceRefs, `reading ${r.id}`)

    obj.questions.forEach(q => {
      dup(q.id, 'question')
      if (!q.ckuIds?.length) errors.push(`question ${q.id}: no CKUs`)
      if (!Array.isArray(q.choices) || q.choices.length < 2) errors.push(`question ${q.id}: needs >=2 choices`)
      if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex >= q.choices.length) errors.push(`question ${q.id}: bad correctIndex`)
      if (!q.explanation) errors.push(`question ${q.id}: empty explanation`)
    })

    obj.flashcards.forEach(f => { dup(f.id, 'flashcard'); if (!f.front || !f.back) errors.push(`flashcard ${f.id}: missing front/back`) })
    obj.commands.forEach(c => { dup(c.id, 'command'); if (!c.purpose) errors.push(`command ${c.id}: missing purpose`) })
    obj.glossary.forEach(g => { dup(g.id, 'glossary'); if (!g.definition) errors.push(`glossary ${g.id}: empty definition`) })
    obj.mnemonics.forEach(m => dup(m.id, 'mnemonic'))
    obj.examTraps.forEach(t => { dup(t.id, 'examTrap'); if (!t.correction) errors.push(`examTrap ${t.id}: empty correction`) })
    obj.misconceptions.forEach(x => { dup(x.id, 'misconception'); if (!x.reality) errors.push(`misconception ${x.id}: empty reality`) })

    const d = obj.diagram
    dup(d.id, 'diagram')
    if (!d.nodes?.length || !d.links?.length) errors.push(`diagram ${d.id}: needs nodes and links`)
    d.links.forEach(l => { const ids = new Set(d.nodes.map(n => n.id)); if (!ids.has(l.source) || !ids.has(l.target)) errors.push(`diagram ${d.id}: link ${l.id} references unknown node`) })

    const pf = obj.packetFlow
    dup(pf.id, 'packetFlow')
    if (!pf.steps?.length) errors.push(`packetFlow ${pf.id}: no steps`)
    pf.steps.forEach((s, i) => { if (s.order !== i + 1) errors.push(`packetFlow ${pf.id}: steps not ordered at ${s.id}`) })
  }

  return { ok: errors.length === 0, errors }
}
