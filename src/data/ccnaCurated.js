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
   REGISTRY + LOADER
   ------------------------------------------------------------------------- */
const CURATED = { [OBJ_32.objectiveId]: OBJ_32 }

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
