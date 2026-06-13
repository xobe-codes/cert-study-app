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

import { IMPORTED_QUESTIONS } from './ccnaQuestionImports.js'
import { SUPPLEMENTAL_QUESTIONS } from './ccnaQuestionSupplemental.js'
import { getSkillQuestions } from './ccnaSkillQuestions.js'
import {
  OBJ_11, OBJ_12, OBJ_13, OBJ_14, OBJ_17, OBJ_110, OBJ_111, OBJ_112,
} from './ccnaCuratedDomain1Rest.js'

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
   OBJECTIVE 1.5 — Switching concepts (MAC table, frame forwarding)
   ------------------------------------------------------------------------- */
const OBJ_15 = {
  objectiveId: '1.5',
  domainId: 'fundamentals',
  title: 'Switching concepts (MAC table, frame forwarding)',
  ckus: [
    { id: 'CKU-MAC-ADDRESS-TABLE', title: 'MAC Address Table (CAM Table)', summary: 'A switch keeps a table mapping learned source MAC addresses (and VLAN) to the port they were heard on. It is the basis for every forwarding decision a switch makes.', aliases: ['CAM table', 'content-addressable memory table', 'bridging table'], tags: ['switching', 'layer2', 'mac'], prerequisiteCkuIds: [], relatedCkuIds: ['CKU-MAC-LEARNING', 'CKU-FRAME-FORWARDING'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Switching — MAC Address Table', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.5', confidence: 1 }] },
    { id: 'CKU-MAC-LEARNING', title: 'MAC Address Learning', summary: 'For every frame received, the switch reads the SOURCE MAC address and the port it arrived on, then adds or refreshes that mapping in the MAC address table.', aliases: ['source address learning', 'dynamic learning'], tags: ['switching', 'learning'], prerequisiteCkuIds: ['CKU-MAC-ADDRESS-TABLE'], relatedCkuIds: ['CKU-MAC-ADDRESS-TABLE', 'CKU-MAC-AGING'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Switching — Learning', confidence: 0.95 }] },
    { id: 'CKU-MAC-AGING', title: 'MAC Address Table Aging', summary: 'Dynamically learned entries are removed if no frame from that MAC is seen before the aging timer expires — 300 seconds by default on Cisco switches. Keeps the table accurate as devices move or disconnect.', aliases: ['aging timer', 'mac aging-time'], tags: ['switching', 'aging'], prerequisiteCkuIds: ['CKU-MAC-LEARNING'], relatedCkuIds: ['CKU-MAC-LEARNING'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Switching — Aging', confidence: 0.9 }] },
    { id: 'CKU-FRAME-FORWARDING', title: 'Frame Forwarding Decision (Known Unicast)', summary: 'After learning, the switch looks up the DESTINATION MAC. If it matches an entry, the frame is forwarded out only that port (or filtered/dropped if the destination is on the same port the frame arrived on).', aliases: ['known unicast forwarding', 'filtering'], tags: ['switching', 'forwarding'], prerequisiteCkuIds: ['CKU-MAC-ADDRESS-TABLE'], relatedCkuIds: ['CKU-MAC-ADDRESS-TABLE', 'CKU-FRAME-FLOODING'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Switching — Forwarding', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.5', confidence: 1 }] },
    { id: 'CKU-FRAME-FLOODING', title: 'Flooding (Unknown Unicast, Broadcast, Multicast)', summary: 'If the destination MAC is not in the table (unknown unicast), or the frame is a broadcast (FFFF.FFFF.FFFF) or multicast, the switch floods it out every port in the same VLAN except the one it arrived on.', aliases: ['unknown unicast', 'broadcast flooding', 'BUM traffic'], tags: ['switching', 'flooding'], prerequisiteCkuIds: ['CKU-FRAME-FORWARDING'], relatedCkuIds: ['CKU-FRAME-FORWARDING'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Switching — Flooding', confidence: 0.9 }] },
  ],
  reading: {
    id: 'READ-1.5', ckuIds: ['CKU-MAC-ADDRESS-TABLE', 'CKU-MAC-LEARNING', 'CKU-MAC-AGING', 'CKU-FRAME-FORWARDING', 'CKU-FRAME-FLOODING'], estimatedReadMinutes: 6,
    tiers: {
      beginner: 'A switch builds a "phonebook" called the MAC address table that maps device MAC addresses to the switch port they are connected to. It fills this in by watching where frames come FROM (source learning). When a frame arrives, the switch checks its phonebook for the destination — if it finds a match, it sends the frame out only that one port. If it does not find a match (or the frame is a broadcast), it sends the frame out every other port, just to be safe.',
      intermediate: 'On every incoming frame, the switch performs source-address learning: it records the source MAC address + VLAN + ingress port in the MAC address table (dynamically learned entries age out after 300 seconds of inactivity by default). It then makes a forwarding decision based on the destination MAC: if the destination is a KNOWN unicast address in the table, the frame is forwarded out only that port (or filtered/dropped if it maps to the same port the frame arrived on — the devices are on the same segment). If the destination is an UNKNOWN unicast, a broadcast (FFFF.FFFF.FFFF), or a multicast, the switch FLOODS the frame out all other ports in the same VLAN.',
      examReady: 'Switch frame-forwarding logic = learn, then forward/flood/filter. **Learn**: record source MAC + VLAN + ingress port; dynamic entries age out (default `300` seconds, configurable with `mac address-table aging-time`). **Forward** (known unicast): destination MAC is in the table → send out that one port only. **Filter**: destination MAC maps to the SAME port the frame arrived on → drop (source and destination already share that segment). **Flood** (unknown unicast / broadcast / multicast — "BUM" traffic): send out every port in the VLAN except the ingress port. Verify with `show mac address-table` / `show mac address-table dynamic`; clear with `clear mac address-table dynamic`; configure static entries with `mac address-table static <mac> vlan <id> interface <intf>`.',
    },
    definition: 'A switch learns which MAC addresses live off which ports by reading the **source MAC** of every frame into its **MAC address table**. It then forwards frames based on the **destination MAC**: known unicast → out one port; unknown unicast, broadcast, or multicast → **flood** out all ports in the VLAN except the one it arrived on.',
    keyPoints: [
      'Learning: source MAC + VLAN + ingress port → MAC address table.',
      'Dynamic entries age out after `300` seconds by default (no traffic seen).',
      'Known unicast destination → forward out that one port only.',
      'Same-port match → filter/drop (sender and receiver already share that link).',
      'Unknown unicast, broadcast, multicast → flood out all ports in the VLAN except the source port.',
      'Flooding is per-VLAN — it never crosses into another VLAN.',
    ],
    realWorld: 'When a PC first sends traffic, the switch immediately learns its MAC on that port. The very first frame to a brand-new device on the network is flooded (unknown unicast) — once that device replies, its MAC is learned too and future frames to it are forwarded directly, no more flooding.',
    commonMistakes: [
      'Thinking a switch "broadcasts everything" — only unknown unicast/broadcast/multicast frames are flooded; known unicast is forwarded to one port.',
      'Forgetting flooding is bounded by the VLAN — a switch never floods a frame into a different VLAN.',
      'Confusing the aging timer with a "lease" — it just removes inactive entries, it does not block the device.',
      'Assuming `show mac address-table` only shows dynamic entries — it also shows static and system entries.',
    ],
    related: ['2.1 VLANs (table is per-VLAN)', '2.5 STP (prevents loops that would melt down flooding)', '5.6 Port security (limits learned MACs per port)'],
    advanced: 'Because flooding sends a frame out every port in a VLAN, a Layer 2 loop (no STP) causes flooded frames to circulate forever, multiplying exponentially — this is why STP (2.5) exists. CAM table exhaustion attacks fill the table with fake MACs so the switch is forced to flood all traffic, which port security (5.6) defends against by limiting learned MACs per port.',
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Switching Concepts', confidence: 0.95 }, { sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 4 — Ethernet LANs', confidence: 0.9 }],
  },
  questions: [
    { id: '1.5-c-q1', concept: 'mac learning', type: 'definition', difficulty: 'easy', question: 'When a switch learns a MAC address, which address does it record — source or destination?', choices: ['Destination MAC of the frame', 'Source MAC of the frame', 'Both source and destination', 'Neither — only IP addresses'], correctIndex: 1, explanation: 'Switches learn by reading the SOURCE MAC address and the port it arrived on.', ckuIds: ['CKU-MAC-LEARNING'] },
    { id: '1.5-c-q2', concept: 'forwarding decision', type: 'scenario', difficulty: 'medium', question: 'A frame arrives whose destination MAC IS in the MAC address table, mapped to a different port than it arrived on. What does the switch do?', choices: ['Flood it out all ports', 'Drop the frame', 'Forward it out only the mapped port', 'Broadcast it within the VLAN'], correctIndex: 2, explanation: 'A known unicast destination is forwarded out only the one port it is mapped to.', ckuIds: ['CKU-FRAME-FORWARDING'] },
    { id: '1.5-c-q3', concept: 'flooding', type: 'definition', difficulty: 'easy', question: 'What does a switch do with a frame whose destination MAC is NOT in its MAC address table?', choices: ['Drops it', 'Sends it back to the source', 'Floods it out all ports in the VLAN except the source port', 'Sends it to the default gateway'], correctIndex: 2, explanation: 'Unknown unicast frames are flooded out every port in the same VLAN except the ingress port.', ckuIds: ['CKU-FRAME-FLOODING'] },
    { id: '1.5-c-q4', concept: 'aging timer', type: 'definition', difficulty: 'medium', question: 'What is the default MAC address table aging time on a Cisco switch?', choices: ['30 seconds', '60 seconds', '300 seconds', '3600 seconds'], correctIndex: 2, explanation: 'The default aging time is 300 seconds (5 minutes) of inactivity.', ckuIds: ['CKU-MAC-AGING'] },
    { id: '1.5-c-q5', concept: 'filtering', type: 'scenario', difficulty: 'hard', question: 'PC-A and PC-B are both connected to the same switch port via a hub. PC-A sends a frame to PC-B. What does the switch do?', choices: ['Forwards it out a different port', 'Floods it everywhere', 'Filters it — does not forward, since both are on the same port', 'Drops it as an error'], correctIndex: 2, explanation: 'If source and destination MAC map to the same ingress port, the switch filters (does not forward) the frame.', ckuIds: ['CKU-FRAME-FORWARDING'] },
    { id: '1.5-c-q6', concept: 'broadcast', type: 'definition', difficulty: 'easy', question: 'What MAC address represents a Layer 2 broadcast?', choices: ['0000.0000.0000', 'FFFF.FFFF.FFFF', '0000.0000.FFFF', 'AAAA.AAAA.AAAA'], correctIndex: 1, explanation: 'FFFF.FFFF.FFFF is the Ethernet broadcast address; switches always flood broadcasts within the VLAN.', ckuIds: ['CKU-FRAME-FLOODING'] },
    { id: '1.5-c-q7', concept: 'flooding scope', type: 'true-false', difficulty: 'medium', question: 'True or False: A switch may flood a frame out a port that is in a different VLAN than the frame.', choices: ['True', 'False'], correctIndex: 1, explanation: 'False — flooding is scoped per-VLAN; a frame is never flooded into a different VLAN.', ckuIds: ['CKU-FRAME-FLOODING'] },
    { id: '1.5-c-q8', concept: 'verify table', type: 'application', difficulty: 'easy', question: 'Which command displays the switch MAC address table?', choices: ['show ip interface brief', 'show mac address-table', 'show vlan brief', 'show cdp neighbors'], correctIndex: 1, explanation: '`show mac address-table` lists learned (and static) MAC-to-port mappings.', ckuIds: ['CKU-MAC-ADDRESS-TABLE'] },
    { id: '1.5-c-q9', concept: 'static entries', type: 'application', difficulty: 'medium', question: 'How do you add a permanent (non-aging) MAC address entry to the table?', choices: ['mac address-table aging-time 0', 'mac address-table static <mac> vlan <id> interface <intf>', 'switchport mode static', 'arp <mac> static'], correctIndex: 1, explanation: '`mac address-table static` manually binds a MAC to a VLAN and interface; it does not age out.', ckuIds: ['CKU-MAC-ADDRESS-TABLE'] },
    { id: '1.5-c-q10', concept: 'first frame', type: 'scenario', difficulty: 'medium', question: 'A brand-new server is plugged in and immediately receives a request from PC-A before it has sent any traffic. How does the switch deliver that first frame?', choices: ['It cannot — the server is unknown', 'It floods the frame (unknown unicast) since the server\'s MAC isn\'t learned yet', 'It drops the frame and logs an error', 'It sends an ARP request first'], correctIndex: 1, explanation: 'Until the switch learns the server\'s source MAC, frames addressed to it are unknown unicast and get flooded.', ckuIds: ['CKU-FRAME-FLOODING', 'CKU-MAC-LEARNING'] },
    { id: '1.5-c-q11', concept: 'relearning after move', type: 'scenario', difficulty: 'hard', question: 'A laptop is unplugged from port 1 and plugged into port 5 of the same switch. What happens to the MAC address table?', choices: ['Nothing — the entry stays on port 1 forever', 'The switch immediately deletes all entries', 'The old port 1 entry ages out (or is overwritten) and a new entry for port 5 is learned from the laptop\'s next frame', 'The switch shuts down port 5'], correctIndex: 2, explanation: 'Learning is continuous — the new frame from port 5 updates/relearns the mapping; the stale port-1 entry ages out.', ckuIds: ['CKU-MAC-LEARNING', 'CKU-MAC-AGING'] },
    { id: '1.5-c-q12', concept: 'switch vs hub', type: 'definition', difficulty: 'medium', question: 'How does a switch\'s forwarding behavior differ from a hub\'s?', choices: ['They behave identically', 'A switch forwards known-unicast frames to only one port; a hub repeats every frame out every port', 'A hub uses a MAC address table; a switch does not', 'A switch only works at Layer 3'], correctIndex: 1, explanation: 'A hub is a simple repeater (everything out every port); a switch learns and forwards intelligently, only flooding when necessary.', ckuIds: ['CKU-FRAME-FORWARDING', 'CKU-FRAME-FLOODING'] },
  ],
  flashcards: [
    { id: '1.5-f1', ckuId: 'CKU-MAC-LEARNING', front: 'What does a switch learn from an incoming frame?', back: 'The SOURCE MAC address, VLAN, and the port it arrived on — stored in the MAC address table.' },
    { id: '1.5-f2', ckuId: 'CKU-MAC-AGING', front: 'Default MAC address table aging time?', back: '300 seconds (5 minutes) of inactivity.' },
    { id: '1.5-f3', ckuId: 'CKU-FRAME-FORWARDING', front: 'Known unicast destination — what does the switch do?', back: 'Forwards the frame out only the port mapped to that MAC.' },
    { id: '1.5-f4', ckuId: 'CKU-FRAME-FLOODING', front: 'What three frame types get flooded?', back: 'Unknown unicast, broadcast, and multicast ("BUM" traffic) — out all ports in the VLAN except the source port.' },
    { id: '1.5-f5', ckuId: 'CKU-FRAME-FORWARDING', front: 'When does a switch filter (not forward) a frame?', back: 'When the destination MAC maps to the SAME port the frame arrived on.' },
    { id: '1.5-f6', ckuId: 'CKU-MAC-ADDRESS-TABLE', front: 'Command to view the MAC address table?', back: 'show mac address-table (or show mac address-table dynamic).' },
    { id: '1.5-f7', ckuId: 'CKU-FRAME-FLOODING', front: 'Ethernet broadcast MAC address?', back: 'FFFF.FFFF.FFFF.' },
    { id: '1.5-f8', ckuId: 'CKU-FRAME-FLOODING', front: 'Does flooding ever cross VLANs?', back: 'No — flooding is always scoped to the frame\'s own VLAN.' },
  ],
  commands: [
    { id: '1.5-cmd1', command: 'show mac address-table', mode: 'privileged EXEC', purpose: 'Display the dynamic, static, and system MAC address table entries with VLAN and port.', example: 'Switch# show mac address-table', ckuIds: ['CKU-MAC-ADDRESS-TABLE'] },
    { id: '1.5-cmd2', command: 'mac address-table aging-time <seconds> [vlan <id>]', mode: 'global config', purpose: 'Change the aging timer from the default 300 seconds.', example: 'Switch(config)# mac address-table aging-time 600', ckuIds: ['CKU-MAC-AGING'] },
    { id: '1.5-cmd3', command: 'mac address-table static <mac> vlan <id> interface <intf>', mode: 'global config', purpose: 'Manually bind a MAC address to a VLAN and port — never ages out.', example: 'Switch(config)# mac address-table static 0011.2233.4455 vlan 10 interface gi0/1', ckuIds: ['CKU-MAC-ADDRESS-TABLE'] },
  ],
  glossary: [
    { id: '1.5-g1', term: 'MAC address table', definition: 'A switch\'s table of learned MAC-to-port (and VLAN) mappings, used to make forwarding decisions. Also called the CAM table.', ckuIds: ['CKU-MAC-ADDRESS-TABLE'] },
    { id: '1.5-g2', term: 'Learning', definition: 'Recording the source MAC, VLAN, and ingress port of every received frame into the MAC address table.', ckuIds: ['CKU-MAC-LEARNING'] },
    { id: '1.5-g3', term: 'Aging', definition: 'Removing a dynamically learned MAC entry after a period (default 300s) of no traffic from that address.', ckuIds: ['CKU-MAC-AGING'] },
    { id: '1.5-g4', term: 'Known unicast', definition: 'A frame whose destination MAC is present in the MAC address table — forwarded out one port only.', ckuIds: ['CKU-FRAME-FORWARDING'] },
    { id: '1.5-g5', term: 'Unknown unicast', definition: 'A unicast frame whose destination MAC is NOT in the table — flooded out all ports in the VLAN except the source.', ckuIds: ['CKU-FRAME-FLOODING'] },
    { id: '1.5-g6', term: 'Flooding', definition: 'Sending a frame out every port in a VLAN except the one it arrived on — used for unknown unicast, broadcast, and multicast.', ckuIds: ['CKU-FRAME-FLOODING'] },
  ],
  mnemonics: [
    { id: '1.5-m1', title: 'Learn, Forward, Flood, Filter', mnemonic: '"LFFF" — every frame: Learn the source, then Forward (known), Flood (unknown/broadcast/multicast), or Filter (same port).', explanation: 'Covers the complete switch decision process in order.', ckuIds: ['CKU-MAC-LEARNING', 'CKU-FRAME-FORWARDING', 'CKU-FRAME-FLOODING'] },
    { id: '1.5-m2', title: 'Source to learn, destination to send', mnemonic: 'A switch reads the SOURCE address to LEARN, and the DESTINATION address to decide where to SEND.', explanation: 'The two MAC fields in a frame serve two different jobs for a switch.', ckuIds: ['CKU-MAC-LEARNING', 'CKU-FRAME-FORWARDING'] },
  ],
  examTraps: [
    { id: '1.5-t1', trap: 'Thinking switches broadcast every frame.', correction: 'Only unknown unicast, broadcast, and multicast frames are flooded; known unicast goes to one port.', ckuIds: ['CKU-FRAME-FLOODING'] },
    { id: '1.5-t2', trap: 'Believing flooding can cross VLAN boundaries.', correction: 'Flooding is always confined to the frame\'s own VLAN.', ckuIds: ['CKU-FRAME-FLOODING'] },
    { id: '1.5-t3', trap: 'Assuming the aging timer disconnects the device.', correction: 'Aging only removes the table entry; the device itself is unaffected and will be relearned on its next frame.', ckuIds: ['CKU-MAC-AGING'] },
    { id: '1.5-t4', trap: 'Forgetting same-port source/destination frames are filtered, not forwarded.', correction: 'If both MACs map to the same ingress port, the switch does not forward the frame at all.', ckuIds: ['CKU-FRAME-FORWARDING'] },
  ],
  misconceptions: [
    { id: '1.5-x1', misconception: 'A switch needs to know a device\'s IP address to forward frames to it.', reality: 'Switching is Layer 2 — only MAC addresses matter for the forwarding decision.', example: 'Two PCs in the same VLAN communicate via MAC addresses alone; the switch never inspects IP.', ckuIds: ['CKU-MAC-ADDRESS-TABLE'] },
    { id: '1.5-x2', misconception: 'Flooding means something is broken.', reality: 'Flooding unknown unicast/broadcast/multicast is normal, expected behavior — it is how a switch reaches devices it hasn\'t learned yet.', example: 'The very first frame to any new device is always flooded.', ckuIds: ['CKU-FRAME-FLOODING'] },
    { id: '1.5-x3', misconception: 'The MAC address table is the same as an ARP table.', reality: 'The MAC address table (Layer 2, on switches) maps MAC→port; the ARP table (Layer 3, on routers/hosts) maps IP→MAC. They are different tables on different devices.', example: '`show mac address-table` vs `show arp`.', ckuIds: ['CKU-MAC-ADDRESS-TABLE'] },
  ],
  diagram: {
    id: 'DIAG-1.5-forwarding', title: 'Switch learning and forwarding', type: 'topology', ckuIds: ['CKU-MAC-LEARNING', 'CKU-FRAME-FORWARDING', 'CKU-FRAME-FLOODING'],
    nodes: [
      { id: 'pcA', label: 'PC-A (AAAA)', type: 'pc', x: 12, y: 50 },
      { id: 'sw', label: 'Switch — MAC table', type: 'switch', x: 50, y: 50, status: 'highlighted' },
      { id: 'pcB', label: 'PC-B (BBBB) — Fa0/2', type: 'pc', x: 88, y: 20 },
      { id: 'pcC', label: 'PC-C — Fa0/3', type: 'pc', x: 88, y: 80 },
    ],
    links: [
      { id: 'l1', source: 'pcA', target: 'sw', status: 'forwarding' },
      { id: 'l2', source: 'sw', target: 'pcB', status: 'forwarding' },
      { id: 'l3', source: 'sw', target: 'pcC' },
    ],
    annotations: ['PC-A sends a frame to PC-B (BBBB). The switch learns AAAA on Fa0/1.', 'BBBB is already in the table on Fa0/2 → forwarded out Fa0/2 only.', 'Fa0/3 (PC-C) does not receive the frame — known unicast, not flooded.'],
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Switching Concepts', confidence: 0.95 }],
  },
  packetFlow: {
    id: 'FLOW-1.5-forwarding', title: 'Switch frame-forwarding decision', ckuIds: ['CKU-MAC-LEARNING', 'CKU-FRAME-FORWARDING', 'CKU-FRAME-FLOODING'], diagramId: 'DIAG-1.5-forwarding',
    steps: [
      { id: 's1', order: 1, title: 'Learn', action: 'Switch reads the source MAC (AAAA) and ingress port (Fa0/1) and records/refreshes the MAC address table entry.', successState: 'matched' },
      { id: 's2', order: 2, title: 'Lookup', action: 'Switch looks up the destination MAC (BBBB) in the table.', successState: 'matched' },
      { id: 's3', order: 3, title: 'Forward (known unicast)', action: 'BBBB is mapped to Fa0/2 → frame is forwarded out Fa0/2 only.', successState: 'forwarded' },
      { id: 's4', order: 4, title: 'If unknown instead', action: 'If BBBB were not in the table, the switch would flood the frame out every port in the VLAN except Fa0/1 (including Fa0/3).', successState: 'forwarded' },
    ],
  },
}

/* -------------------------------------------------------------------------
   SUPPLEMENTAL — TCP vs UDP (not currently mapped to a blueprint objective;
   the app's 1.5 slot is "Switching concepts". Kept on the shelf in case the
   objective list is expanded to the full v1.1 blueprint later.)
   ------------------------------------------------------------------------- */
const SUPP_TCPUDP = {
  objectiveId: 'supp-tcp-udp',
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
   OBJECTIVE 1.8 — Configure and verify IPv6 addressing and prefix
   ------------------------------------------------------------------------- */
const OBJ_18 = {
  objectiveId: '1.8', domainId: 'fundamentals', title: 'Configure and verify IPv6 addressing and prefix',
  ckus: [
    { id: 'CKU-IPV6-ADDRESSING', title: 'IPv6 Addressing', summary: '128-bit address written as 8 groups of 4 hex digits separated by colons; the prefix length (usually /64) marks the network portion.', aliases: ['IPv6'], tags: ['ipv6', 'addressing'], prerequisiteCkuIds: [], relatedCkuIds: ['CKU-IPV6-SHORTENING', 'CKU-MODIFIED-EUI-64'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'IPv6', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.8', confidence: 1 }] },
    { id: 'CKU-IPV6-SHORTENING', title: 'IPv6 Abbreviation Rules', summary: 'Omit leading zeros in each group; replace ONE run of all-zero groups with :: (only once per address).', aliases: ['compression', '::'], tags: ['ipv6'], prerequisiteCkuIds: ['CKU-IPV6-ADDRESSING'], relatedCkuIds: ['CKU-IPV6-ADDRESSING'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'IPv6 shortening', confidence: 0.95 }] },
    { id: 'CKU-MODIFIED-EUI-64', title: 'Modified EUI-64', summary: 'Builds the 64-bit interface ID from a 48-bit MAC: split it, insert FFFE in the middle, and flip the 7th bit (U/L) of the first byte.', aliases: ['EUI-64'], tags: ['ipv6', 'slaac'], prerequisiteCkuIds: ['CKU-IPV6-ADDRESSING'], relatedCkuIds: ['CKU-IPV6-ADDRESSING'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'EUI-64', confidence: 0.9 }] },
    { id: 'CKU-IPV6-SLAAC', title: 'SLAAC', summary: 'Stateless Address Autoconfiguration: a host forms its own IPv6 address from the prefix in a Router Advertisement plus an interface ID (EUI-64 or random).', aliases: ['autoconfiguration', 'RA'], tags: ['ipv6'], prerequisiteCkuIds: ['CKU-IPV6-ADDRESSING'], relatedCkuIds: ['CKU-MODIFIED-EUI-64'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'SLAAC', confidence: 0.9 }] },
  ],
  reading: {
    id: 'READ-1.8', ckuIds: ['CKU-IPV6-ADDRESSING', 'CKU-IPV6-SHORTENING', 'CKU-MODIFIED-EUI-64', 'CKU-IPV6-SLAAC'], estimatedReadMinutes: 7,
    tiers: {
      beginner: 'IPv6 addresses are much bigger than IPv4 — 128 bits, written as eight blocks of hex separated by colons. Because they are long, you can shorten them: drop leading zeros in a block, and replace one run of all-zero blocks with “::”. The /64 at the end usually marks the network half. Hosts can even build their own address automatically (SLAAC) from information the router advertises.',
      intermediate: 'An IPv6 address is 128 bits = 8 hextets of 4 hex digits. Shortening rules: (1) remove leading zeros within each hextet; (2) replace one contiguous run of all-zero hextets with :: (only once). LANs almost always use a /64 prefix so the lower 64 bits are the interface ID. Hosts get addresses three ways: static, DHCPv6, or SLAAC (form the address from the RA prefix + an interface ID, which can be Modified EUI-64).',
      examReady: 'IPv6 = 128 bits, 8 hextets of 4 hex digits. Abbreviate by removing leading zeros per hextet and using `::` once for a run of all-zero hextets. Prefix length (e.g. `/64`) marks the network portion; /64 is standard for LANs to allow SLAAC/EUI-64. Three addressing methods: static, DHCPv6 (stateful), SLAAC (stateless, from the Router Advertisement prefix). Modified EUI-64: split the 48-bit MAC, insert `FFFE` in the middle, flip the 7th bit (U/L) of the first byte. Config: `ipv6 address 2001:db8::1/64` on an interface, with `ipv6 unicast-routing` enabled globally.',
    },
    definition: 'IPv6 addresses are **128 bits**, written as 8 hextets of hex. Abbreviate by dropping leading zeros and using `::` once. The prefix (usually `/64`) marks the network; hosts can self-configure via **SLAAC**.',
    keyPoints: [
      '128 bits = 8 hextets of 4 hex digits, colon-separated.',
      'Shorten: drop leading zeros per hextet; `::` replaces one run of all-zero hextets (once only).',
      'LAN prefix is almost always `/64`.',
      'Addressing: static, DHCPv6, or SLAAC (from the RA prefix).',
      'Modified EUI-64: insert `FFFE`, flip the 7th bit of the MAC’s first byte.',
      'Enable routing with `ipv6 unicast-routing`.',
    ],
    realWorld: 'Verify with `show ipv6 interface brief`; an interface typically shows a link-local (FE80::) AND a global (2001:…) address. `ipv6 address autoconfig` enables SLAAC on an interface.',
    commonMistakes: [
      'Using `::` more than once in an address (ambiguous — only allowed once).',
      'Removing trailing zeros (only LEADING zeros within a hextet may be dropped).',
      'Forgetting `ipv6 unicast-routing`, so the router won’t route IPv6.',
      'Assuming a LAN can use anything other than /64 with SLAAC.',
    ],
    related: ['1.9 IPv6 address types', '1.6 IPv4 subnetting'],
    advanced: 'SLAAC requires /64. The interface ID can be Modified EUI-64 (derived from MAC, so traceable) or a random/privacy value. Duplicate Address Detection (DAD) uses neighbor solicitation before an address is used.',
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'IPv6', confidence: 0.95 }],
  },
  questions: [
    { id: '1.8-c-q1', concept: 'address length', type: 'definition', difficulty: 'easy', question: 'How many bits is an IPv6 address?', choices: ['32', '64', '128', '256'], correctIndex: 2, explanation: 'IPv6 addresses are 128 bits (8 hextets of 16 bits).', ckuIds: ['CKU-IPV6-ADDRESSING'] },
    { id: '1.8-c-q2', concept: 'shortening', type: 'application', difficulty: 'medium', question: 'Which is the correct shortened form of `2001:0db8:0000:0000:0000:0000:0000:0001`?', choices: ['2001:db8::1', '2001:db8:::1', '2001:db8::0:1::', '2001::db8::1'], correctIndex: 0, explanation: 'Drop leading zeros and replace the single zero run with :: once → 2001:db8::1.', ckuIds: ['CKU-IPV6-SHORTENING'] },
    { id: '1.8-c-q3', concept: 'double colon rule', type: 'true-false', difficulty: 'medium', question: 'True or False: `::` can be used twice in one IPv6 address.', choices: ['True', 'False'], correctIndex: 1, explanation: 'False — `::` may appear only once, otherwise the number of zero groups is ambiguous.', ckuIds: ['CKU-IPV6-SHORTENING'] },
    { id: '1.8-c-q4', concept: 'LAN prefix', type: 'definition', difficulty: 'easy', question: 'What prefix length is standard for an IPv6 LAN?', choices: ['/24', '/48', '/64', '/128'], correctIndex: 2, explanation: '/64 is standard for LANs and is required for SLAAC/EUI-64.', ckuIds: ['CKU-IPV6-ADDRESSING'] },
    { id: '1.8-c-q5', concept: 'EUI-64', type: 'application', difficulty: 'hard', question: 'In Modified EUI-64, what is inserted into the middle of the 48-bit MAC?', choices: ['FFFE', 'FF00', 'FFFF', 'FE80'], correctIndex: 0, explanation: 'FFFE is inserted in the middle, and the 7th bit of the first byte is flipped.', ckuIds: ['CKU-MODIFIED-EUI-64'] },
    { id: '1.8-c-q6', concept: 'SLAAC', type: 'scenario', difficulty: 'medium', question: 'A host builds its own IPv6 address from a Router Advertisement prefix. What is this called?', choices: ['DHCPv6', 'SLAAC', 'Static', 'NAT66'], correctIndex: 1, explanation: 'SLAAC (Stateless Address Autoconfiguration) uses the RA prefix + an interface ID.', ckuIds: ['CKU-IPV6-SLAAC'] },
    { id: '1.8-c-q7', concept: 'enable routing', type: 'application', difficulty: 'medium', question: 'Which global command enables a Cisco router to route IPv6?', choices: ['ipv6 routing', 'ipv6 unicast-routing', 'ip routing v6', 'enable ipv6'], correctIndex: 1, explanation: '`ipv6 unicast-routing` must be enabled globally.', ckuIds: ['CKU-IPV6-ADDRESSING'] },
    { id: '1.8-c-q8', concept: 'zero compression', type: 'application', difficulty: 'medium', question: 'Which zeros may be removed when shortening a hextet like `00a0`?', choices: ['Trailing zeros', 'Leading zeros → a0', 'All zeros', 'None'], correctIndex: 1, explanation: 'Only leading zeros within a hextet may be dropped: 00a0 → a0.', ckuIds: ['CKU-IPV6-SHORTENING'] },
    { id: '1.8-c-q9', concept: 'verify', type: 'application', difficulty: 'easy', question: 'Which command shows IPv6 addresses and interface status?', choices: ['show ip interface brief', 'show ipv6 interface brief', 'show ipv6 route', 'show running-config'], correctIndex: 1, explanation: '`show ipv6 interface brief` lists IPv6 addresses (link-local + global) and status.', ckuIds: ['CKU-IPV6-ADDRESSING'] },
    { id: '1.8-c-q10', concept: 'interface ID size', type: 'definition', difficulty: 'medium', question: 'With a /64 prefix, how many bits are the interface ID?', choices: ['32', '48', '64', '128'], correctIndex: 2, explanation: '128 − 64 = 64 bits for the interface ID.', ckuIds: ['CKU-IPV6-ADDRESSING'] },
  ],
  flashcards: [
    { id: '1.8-f1', ckuId: 'CKU-IPV6-ADDRESSING', front: 'IPv6 address size and format?', back: '128 bits — 8 hextets of 4 hex digits, colon-separated.' },
    { id: '1.8-f2', ckuId: 'CKU-IPV6-SHORTENING', front: 'Two IPv6 shortening rules?', back: 'Drop leading zeros per hextet; replace ONE run of all-zero hextets with :: (once).' },
    { id: '1.8-f3', ckuId: 'CKU-IPV6-ADDRESSING', front: 'Standard LAN prefix length?', back: '/64.' },
    { id: '1.8-f4', ckuId: 'CKU-MODIFIED-EUI-64', front: 'Modified EUI-64 steps?', back: 'Split the MAC, insert FFFE in the middle, flip the 7th (U/L) bit of the first byte.' },
    { id: '1.8-f5', ckuId: 'CKU-IPV6-SLAAC', front: 'Three ways a host gets an IPv6 address?', back: 'Static, DHCPv6, SLAAC (from the RA prefix).' },
    { id: '1.8-f6', ckuId: 'CKU-IPV6-ADDRESSING', front: 'Command to enable IPv6 routing?', back: 'ipv6 unicast-routing (global config).' },
  ],
  commands: [
    { id: '1.8-cmd1', command: 'ipv6 unicast-routing', mode: 'global config', purpose: 'Enable IPv6 routing on the device.', example: 'R1(config)# ipv6 unicast-routing', ckuIds: ['CKU-IPV6-ADDRESSING'] },
    { id: '1.8-cmd2', command: 'ipv6 address <addr>/<len>', mode: 'interface config', purpose: 'Assign a global IPv6 address and prefix to an interface.', example: 'R1(config-if)# ipv6 address 2001:db8::1/64', ckuIds: ['CKU-IPV6-ADDRESSING'] },
    { id: '1.8-cmd3', command: 'show ipv6 interface brief', mode: 'privileged EXEC', purpose: 'List IPv6 addresses and interface status.', example: 'R1# show ipv6 interface brief', ckuIds: ['CKU-IPV6-ADDRESSING'] },
  ],
  glossary: [
    { id: '1.8-g1', term: 'Hextet', definition: 'One of the eight 16-bit (4-hex-digit) groups in an IPv6 address.', ckuIds: ['CKU-IPV6-ADDRESSING'] },
    { id: '1.8-g2', term: 'Prefix length', definition: 'The /n marking the network portion of an IPv6 address (usually /64 on LANs).', ckuIds: ['CKU-IPV6-ADDRESSING'] },
    { id: '1.8-g3', term: 'SLAAC', definition: 'Stateless Address Autoconfiguration — host forms its address from the RA prefix.', ckuIds: ['CKU-IPV6-SLAAC'] },
    { id: '1.8-g4', term: 'Modified EUI-64', definition: 'Method to derive a 64-bit interface ID from a 48-bit MAC (insert FFFE, flip U/L bit).', ckuIds: ['CKU-MODIFIED-EUI-64'] },
    { id: '1.8-g5', term: 'Interface ID', definition: 'The host portion (lower bits) of an IPv6 address, 64 bits with a /64 prefix.', ckuIds: ['CKU-IPV6-ADDRESSING'] },
  ],
  mnemonics: [
    { id: '1.8-m1', title: 'Compression', mnemonic: '“Leading gone, one double-colon.”', explanation: 'Drop leading zeros in each hextet; use :: only once for a zero run.', ckuIds: ['CKU-IPV6-SHORTENING'] },
    { id: '1.8-m2', title: 'EUI-64', mnemonic: 'Split, FFFE, Flip 7.', explanation: 'Split the MAC, insert FFFE, flip the 7th bit.', ckuIds: ['CKU-MODIFIED-EUI-64'] },
  ],
  examTraps: [
    { id: '1.8-t1', trap: 'Using :: twice.', correction: 'Only one :: per address is allowed.', ckuIds: ['CKU-IPV6-SHORTENING'] },
    { id: '1.8-t2', trap: 'Dropping trailing zeros in a hextet.', correction: 'Only leading zeros may be dropped (00a0 → a0, not a).', ckuIds: ['CKU-IPV6-SHORTENING'] },
    { id: '1.8-t3', trap: 'Expecting SLAAC on a non-/64 prefix.', correction: 'SLAAC requires a /64 prefix.', ckuIds: ['CKU-IPV6-SLAAC'] },
  ],
  misconceptions: [
    { id: '1.8-x1', misconception: 'IPv6 needs NAT like IPv4.', reality: 'IPv6’s huge space means hosts use globally unique addresses; NAT is generally unnecessary.', example: 'A LAN gets a /64 of globally routable addresses.', ckuIds: ['CKU-IPV6-ADDRESSING'] },
    { id: '1.8-x2', misconception: '`::` represents exactly one zero hextet.', reality: '`::` represents one or more contiguous all-zero hextets — as many as needed to total 8.', example: '2001:db8::1 expands the :: to five zero hextets.', ckuIds: ['CKU-IPV6-SHORTENING'] },
    { id: '1.8-x3', misconception: 'An interface has only one IPv6 address.', reality: 'Interfaces normally have at least a link-local (FE80::) and a global address.', example: 'show ipv6 interface brief lists both.', ckuIds: ['CKU-IPV6-ADDRESSING'] },
  ],
  diagram: {
    id: 'DIAG-1.8-eui64', title: 'Modified EUI-64', type: 'process', ckuIds: ['CKU-MODIFIED-EUI-64'],
    nodes: [
      { id: 'mac', label: 'MAC 48-bit', type: 'process', x: 50, y: 12 },
      { id: 'split', label: 'Split in half', type: 'process', x: 50, y: 40 },
      { id: 'ins', label: 'Insert FFFE', type: 'process', x: 50, y: 68 },
      { id: 'flip', label: 'Flip 7th bit → 64-bit ID', type: 'router', x: 50, y: 92, status: 'highlighted' },
    ],
    links: [
      { id: 'l1', source: 'mac', target: 'split' }, { id: 'l2', source: 'split', target: 'ins' }, { id: 'l3', source: 'ins', target: 'flip', status: 'forwarding' },
    ],
    annotations: ['48-bit MAC → 64-bit interface ID.', 'FFFE goes in the middle; the U/L (7th) bit is flipped.'],
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'EUI-64', confidence: 0.9 }],
  },
  packetFlow: {
    id: 'FLOW-1.8-slaac', title: 'SLAAC address formation', ckuIds: ['CKU-IPV6-SLAAC'], diagramId: 'DIAG-1.8-eui64',
    steps: [
      { id: 's1', order: 1, title: 'Router Solicitation', action: 'Host sends an RS asking for network info.', successState: 'forwarded' },
      { id: 's2', order: 2, title: 'Router Advertisement', action: 'Router replies with the /64 prefix.', successState: 'forwarded' },
      { id: 's3', order: 3, title: 'Build address', action: 'Host appends an interface ID (EUI-64 or random) to the prefix.', successState: 'learned' },
      { id: 's4', order: 4, title: 'DAD', action: 'Host runs Duplicate Address Detection, then uses the address.', successState: 'matched' },
    ],
  },
}

/* -------------------------------------------------------------------------
   OBJECTIVE 1.9 — Describe IPv6 address types
   ------------------------------------------------------------------------- */
const OBJ_19 = {
  objectiveId: '1.9', domainId: 'fundamentals', title: 'Describe IPv6 address types',
  ckus: [
    { id: 'CKU-IPV6-GLOBAL-UNICAST', title: 'Global Unicast (GUA)', summary: 'Publicly routable IPv6, like a public IPv4. Range 2000::/3.', aliases: ['GUA'], tags: ['ipv6', 'unicast'], prerequisiteCkuIds: ['CKU-IPV6-ADDRESSING'], relatedCkuIds: ['CKU-IPV6-LINK-LOCAL'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'IPv6 address types', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '1.9', confidence: 1 }] },
    { id: 'CKU-IPV6-UNIQUE-LOCAL', title: 'Unique Local (ULA)', summary: 'Private IPv6, like RFC1918. FC00::/7, in practice FD00::/8.', aliases: ['ULA'], tags: ['ipv6'], prerequisiteCkuIds: ['CKU-IPV6-ADDRESSING'], relatedCkuIds: ['CKU-IPV6-GLOBAL-UNICAST'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'ULA', confidence: 0.9 }] },
    { id: 'CKU-IPV6-LINK-LOCAL', title: 'Link-Local', summary: 'Auto-assigned on every IPv6 interface, used for on-link communication (neighbor discovery, routing protocols); never routed. FE80::/10.', aliases: ['FE80'], tags: ['ipv6'], prerequisiteCkuIds: ['CKU-IPV6-ADDRESSING'], relatedCkuIds: ['CKU-IPV6-GLOBAL-UNICAST'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Link-local', confidence: 0.95 }] },
    { id: 'CKU-IPV6-MULTICAST', title: 'Multicast & Anycast', summary: 'IPv6 has no broadcast; multicast (FF00::/8) replaces it — e.g. FF02::1 all nodes, FF02::2 all routers. Anycast = one address on several devices, routed to the nearest.', aliases: ['FF00', 'anycast'], tags: ['ipv6'], prerequisiteCkuIds: ['CKU-IPV6-ADDRESSING'], relatedCkuIds: ['CKU-IPV6-LINK-LOCAL'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Multicast/Anycast', confidence: 0.9 }] },
  ],
  reading: {
    id: 'READ-1.9', ckuIds: ['CKU-IPV6-GLOBAL-UNICAST', 'CKU-IPV6-UNIQUE-LOCAL', 'CKU-IPV6-LINK-LOCAL', 'CKU-IPV6-MULTICAST'], estimatedReadMinutes: 6,
    tiers: {
      beginner: 'IPv6 has a few address “flavors.” Global unicast is the public, internet-routable kind. Unique local is the private kind (like home/office IPv4 ranges). Link-local addresses start with FE80 and only work on the local link — every interface gets one automatically. There is no broadcast in IPv6; instead, multicast (starting FF) sends to a group, like “all routers.”',
      intermediate: 'Key IPv6 types: Global Unicast (2000::/3) — public, routable. Unique Local (FC00::/7, used as FD00::/8) — private, not internet-routable. Link-Local (FE80::/10) — auto-configured on every interface, used for neighbor discovery and routing-protocol peering, never forwarded off the link. Multicast (FF00::/8) replaces broadcast — well-known groups include FF02::1 (all nodes) and FF02::2 (all routers). Anycast assigns the same address to multiple devices; traffic goes to the nearest one.',
      examReady: 'Memorize the ranges: Global Unicast `2000::/3` (public), Unique Local `FC00::/7` (private, commonly `FD00::/8`), Link-Local `FE80::/10` (on-link only, every interface, used by NDP and routing protocols), Multicast `FF00::/8` (replaces broadcast: `FF02::1` all nodes, `FF02::2` all routers). Anycast = same address on multiple nodes, delivered to the nearest. IPv6 has NO broadcast. Link-local is mandatory and is the next-hop for many routing protocols.',
    },
    definition: 'IPv6 address types: **Global Unicast** `2000::/3` (public), **Unique Local** `FC00::/7`/`FD00::/8` (private), **Link-Local** `FE80::/10` (on-link only), **Multicast** `FF00::/8` (replaces broadcast). **Anycast** = nearest of many. No broadcast in IPv6.',
    keyPoints: [
      'Global Unicast `2000::/3` — public, routable (like public IPv4).',
      'Unique Local `FC00::/7` (use `FD00::/8`) — private (like RFC1918).',
      'Link-Local `FE80::/10` — auto, on-link only, never routed.',
      'Multicast `FF00::/8` replaces broadcast: `FF02::1` all nodes, `FF02::2` all routers.',
      'Anycast — one address on many devices; goes to the nearest.',
      'IPv6 has NO broadcast.',
    ],
    realWorld: 'Routing protocols (OSPFv3, EIGRPv6) peer using link-local (FE80::) next hops. `show ipv6 interface` shows the FE80:: link-local and joined multicast groups (e.g. FF02::1).',
    commonMistakes: [
      'Expecting an IPv6 broadcast address — there is none; multicast is used instead.',
      'Confusing FE80 (link-local) with FF02 (multicast).',
      'Thinking ULA (FD00) is internet-routable — it is private.',
    ],
    related: ['1.8 IPv6 addressing', '3.4 OSPF (uses link-local)'],
    advanced: 'Solicited-node multicast (FF02::1:FFxx:xxxx) is used by Neighbor Discovery instead of ARP. Every IPv6 host joins the all-nodes group FF02::1; routers also join FF02::2.',
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'IPv6 address types', confidence: 0.95 }],
  },
  questions: [
    { id: '1.9-c-q1', concept: 'global unicast', type: 'definition', difficulty: 'easy', question: 'Which range is IPv6 global unicast (public)?', choices: ['FE80::/10', '2000::/3', 'FC00::/7', 'FF00::/8'], correctIndex: 1, explanation: 'Global unicast = 2000::/3, the public/routable range.', ckuIds: ['CKU-IPV6-GLOBAL-UNICAST'] },
    { id: '1.9-c-q2', concept: 'link-local', type: 'definition', difficulty: 'easy', question: 'What does an IPv6 link-local address begin with?', choices: ['FF02', '2001', 'FE80', 'FD00'], correctIndex: 2, explanation: 'Link-local addresses are FE80::/10.', ckuIds: ['CKU-IPV6-LINK-LOCAL'] },
    { id: '1.9-c-q3', concept: 'unique local', type: 'definition', difficulty: 'medium', question: 'Which is the IPv6 “private” (RFC1918-like) range commonly used?', choices: ['FD00::/8', '2000::/3', 'FE80::/10', 'FF00::/8'], correctIndex: 0, explanation: 'Unique Local is FC00::/7, used in practice as FD00::/8.', ckuIds: ['CKU-IPV6-UNIQUE-LOCAL'] },
    { id: '1.9-c-q4', concept: 'multicast', type: 'definition', difficulty: 'medium', question: 'Which multicast address reaches all routers on a link?', choices: ['FF02::1', 'FF02::2', 'FF02::5', '224.0.0.2'], correctIndex: 1, explanation: 'FF02::2 = all routers; FF02::1 = all nodes.', ckuIds: ['CKU-IPV6-MULTICAST'] },
    { id: '1.9-c-q5', concept: 'no broadcast', type: 'true-false', difficulty: 'easy', question: 'True or False: IPv6 uses a broadcast address like IPv4.', choices: ['True', 'False'], correctIndex: 1, explanation: 'False — IPv6 has no broadcast; multicast (FF00::/8) replaces it.', ckuIds: ['CKU-IPV6-MULTICAST'] },
    { id: '1.9-c-q6', concept: 'anycast', type: 'scenario', difficulty: 'medium', question: 'The same IPv6 address is configured on several servers and traffic goes to the nearest. What type is this?', choices: ['Multicast', 'Anycast', 'Link-local', 'Broadcast'], correctIndex: 1, explanation: 'Anycast = one address on multiple devices, delivered to the nearest.', ckuIds: ['CKU-IPV6-MULTICAST'] },
    { id: '1.9-c-q7', concept: 'link-local scope', type: 'application', difficulty: 'medium', question: 'Where can a link-local (FE80::) address be used?', choices: ['Across the internet', 'Only on the local link', 'Only by routers', 'Only with NAT'], correctIndex: 1, explanation: 'Link-local is never routed off the local link.', ckuIds: ['CKU-IPV6-LINK-LOCAL'] },
    { id: '1.9-c-q8', concept: 'all nodes', type: 'definition', difficulty: 'easy', question: 'Which multicast group does every IPv6 host join?', choices: ['FF02::1 (all nodes)', 'FF02::2 (all routers)', 'FE80::1', '2000::1'], correctIndex: 0, explanation: 'All IPv6 hosts join FF02::1, the all-nodes group.', ckuIds: ['CKU-IPV6-MULTICAST'] },
  ],
  flashcards: [
    { id: '1.9-f1', ckuId: 'CKU-IPV6-GLOBAL-UNICAST', front: 'Global unicast range?', back: '2000::/3 (public, routable).' },
    { id: '1.9-f2', ckuId: 'CKU-IPV6-UNIQUE-LOCAL', front: 'Unique local range?', back: 'FC00::/7, used as FD00::/8 (private).' },
    { id: '1.9-f3', ckuId: 'CKU-IPV6-LINK-LOCAL', front: 'Link-local range and scope?', back: 'FE80::/10 — on-link only, auto-assigned, never routed.' },
    { id: '1.9-f4', ckuId: 'CKU-IPV6-MULTICAST', front: 'Multicast range + FF02::1 / FF02::2?', back: 'FF00::/8; FF02::1 = all nodes, FF02::2 = all routers.' },
    { id: '1.9-f5', ckuId: 'CKU-IPV6-MULTICAST', front: 'What replaces broadcast in IPv6?', back: 'Multicast — IPv6 has no broadcast.' },
    { id: '1.9-f6', ckuId: 'CKU-IPV6-MULTICAST', front: 'What is anycast?', back: 'One address on multiple devices; traffic goes to the nearest.' },
  ],
  commands: [
    { id: '1.9-cmd1', command: 'show ipv6 interface', mode: 'privileged EXEC', purpose: 'Show an interface’s link-local, global addresses, and joined multicast groups.', example: 'R1# show ipv6 interface g0/0', ckuIds: ['CKU-IPV6-LINK-LOCAL', 'CKU-IPV6-MULTICAST'] },
    { id: '1.9-cmd2', command: 'show ipv6 neighbors', mode: 'privileged EXEC', purpose: 'Display the IPv6 neighbor (NDP) table — the IPv6 equivalent of the ARP table.', example: 'R1# show ipv6 neighbors', ckuIds: ['CKU-IPV6-LINK-LOCAL'] },
  ],
  glossary: [
    { id: '1.9-g1', term: 'Global unicast', definition: 'Public, internet-routable IPv6 address (2000::/3).', ckuIds: ['CKU-IPV6-GLOBAL-UNICAST'] },
    { id: '1.9-g2', term: 'Unique local', definition: 'Private IPv6 (FC00::/7, used as FD00::/8).', ckuIds: ['CKU-IPV6-UNIQUE-LOCAL'] },
    { id: '1.9-g3', term: 'Link-local', definition: 'Auto-assigned FE80::/10 address used only on the local link.', ckuIds: ['CKU-IPV6-LINK-LOCAL'] },
    { id: '1.9-g4', term: 'Anycast', definition: 'One address on multiple nodes; delivered to the nearest.', ckuIds: ['CKU-IPV6-MULTICAST'] },
    { id: '1.9-g5', term: 'Solicited-node multicast', definition: 'FF02::1:FFxx:xxxx group used by Neighbor Discovery in place of ARP.', ckuIds: ['CKU-IPV6-MULTICAST'] },
  ],
  mnemonics: [
    { id: '1.9-m1', title: 'Prefixes', mnemonic: '2=public, FD=private, FE80=local, FF=multicast.', explanation: 'Match the leading hex to the type.', ckuIds: ['CKU-IPV6-GLOBAL-UNICAST', 'CKU-IPV6-LINK-LOCAL', 'CKU-IPV6-MULTICAST'] },
    { id: '1.9-m2', title: 'FF02', mnemonic: 'FF02::1 one=nodes, FF02::2 two=routers.', explanation: 'The number after :: matches “1 = all nodes, 2 = all routers.”', ckuIds: ['CKU-IPV6-MULTICAST'] },
  ],
  examTraps: [
    { id: '1.9-t1', trap: 'Looking for an IPv6 broadcast.', correction: 'There is none; multicast (FF00::/8) replaces broadcast.', ckuIds: ['CKU-IPV6-MULTICAST'] },
    { id: '1.9-t2', trap: 'Confusing FE80 and FF02.', correction: 'FE80 = link-local unicast; FF02 = link-local multicast group.', ckuIds: ['CKU-IPV6-LINK-LOCAL', 'CKU-IPV6-MULTICAST'] },
    { id: '1.9-t3', trap: 'Treating ULA as routable.', correction: 'FD00::/8 is private and should not be advertised to the internet.', ckuIds: ['CKU-IPV6-UNIQUE-LOCAL'] },
  ],
  misconceptions: [
    { id: '1.9-x1', misconception: 'Link-local addresses must be configured manually.', reality: 'Every IPv6 interface auto-generates an FE80:: link-local address.', example: 'It appears even with no global address set.', ckuIds: ['CKU-IPV6-LINK-LOCAL'] },
    { id: '1.9-x2', misconception: 'Anycast and multicast are the same.', reality: 'Multicast delivers to ALL group members; anycast delivers to the NEAREST one.', example: 'DNS root servers use anycast.', ckuIds: ['CKU-IPV6-MULTICAST'] },
    { id: '1.9-x3', misconception: 'Global unicast is the only usable type on a router link.', reality: 'Routers often peer over link-local (FE80::) next hops for routing protocols.', example: 'OSPFv3 neighbors use link-local addresses.', ckuIds: ['CKU-IPV6-LINK-LOCAL'] },
  ],
  diagram: {
    id: 'DIAG-1.9-types', title: 'IPv6 address type map', type: 'comparison', ckuIds: ['CKU-IPV6-GLOBAL-UNICAST', 'CKU-IPV6-LINK-LOCAL', 'CKU-IPV6-MULTICAST'],
    nodes: [
      { id: 'g', label: '2000::/3 Global', type: 'subnet', x: 22, y: 30 },
      { id: 'u', label: 'FD00::/8 ULA', type: 'subnet', x: 22, y: 75 },
      { id: 'l', label: 'FE80::/10 Link-local', type: 'process', x: 60, y: 30 },
      { id: 'm', label: 'FF00::/8 Multicast', type: 'process', x: 60, y: 75 },
    ],
    links: [
      { id: 'l1', source: 'g', target: 'l', label: 'unicast' }, { id: 'l2', source: 'u', target: 'g', label: 'private/public' }, { id: 'l3', source: 'm', target: 'l', label: 'no broadcast' },
    ],
    annotations: ['2 = public, FD = private, FE80 = on-link, FF = multicast.', 'No broadcast in IPv6.'],
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'IPv6 types', confidence: 0.9 }],
  },
  packetFlow: {
    id: 'FLOW-1.9-nd', title: 'Neighbor Discovery (ARP replacement)', ckuIds: ['CKU-IPV6-MULTICAST', 'CKU-IPV6-LINK-LOCAL'], diagramId: 'DIAG-1.9-types',
    steps: [
      { id: 's1', order: 1, title: 'Neighbor Solicitation', action: 'Host sends NS to the solicited-node multicast for the target.', successState: 'forwarded' },
      { id: 's2', order: 2, title: 'Neighbor Advertisement', action: 'Target replies with its link-layer address.', successState: 'forwarded' },
      { id: 's3', order: 3, title: 'Cache', action: 'Host stores the mapping in the neighbor table.', successState: 'learned' },
    ],
  },
}

/* -------------------------------------------------------------------------
   OBJECTIVE 2.1 — Configure and verify VLANs spanning multiple switches
   ------------------------------------------------------------------------- */
const OBJ_21 = {
  objectiveId: '2.1', domainId: 'access', title: 'Configure and verify VLANs (normal range) spanning multiple switches',
  ckus: [
    { id: 'CKU-VLAN', title: 'VLAN', summary: 'A logical Layer 2 broadcast domain. Devices in the same VLAN communicate at L2 regardless of physical location; different VLANs require a router/L3 switch.', aliases: ['virtual LAN'], tags: ['vlan', 'switching'], prerequisiteCkuIds: ['CKU-BROADCAST-DOMAIN'], relatedCkuIds: ['CKU-ACCESS-PORT', 'CKU-TRUNKING'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'VLANs', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '2.1', confidence: 1 }] },
    { id: 'CKU-ACCESS-PORT', title: 'Access Port', summary: 'A switchport that belongs to exactly one VLAN and carries untagged traffic for an end device.', aliases: ['access mode'], tags: ['vlan'], prerequisiteCkuIds: ['CKU-VLAN'], relatedCkuIds: ['CKU-VLAN'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Access ports', confidence: 0.9 }] },
    { id: 'CKU-VOICE-VLAN', title: 'Voice VLAN', summary: 'A second VLAN on an access port for IP phones, so voice and data traffic are separated on the same physical port.', aliases: ['voice vlan'], tags: ['vlan', 'voice'], prerequisiteCkuIds: ['CKU-ACCESS-PORT'], relatedCkuIds: ['CKU-ACCESS-PORT'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Voice VLAN', confidence: 0.85 }] },
  ],
  reading: {
    id: 'READ-2.1', ckuIds: ['CKU-VLAN', 'CKU-ACCESS-PORT', 'CKU-VOICE-VLAN'], estimatedReadMinutes: 6,
    tiers: {
      beginner: 'A VLAN lets one physical switch act like several separate switches. Ports put in VLAN 10 can talk to each other; ports in VLAN 20 are a separate group. To let VLAN 10 talk to VLAN 20 you need a router. You assign a normal end-device port to a VLAN by making it an “access” port.',
      intermediate: 'A VLAN is a logical broadcast domain. You create one with `vlan <id>` (and name it), then assign access ports with `switchport mode access` + `switchport access vlan <id>`. Devices in the same VLAN reach each other at Layer 2 across multiple switches (via trunks); devices in different VLANs need a Layer 3 device. VLAN 1 is the default for all ports — best practice is to move user traffic off VLAN 1. An IP phone can use a voice VLAN alongside the data VLAN on one port.',
      examReady: 'VLAN = logical broadcast domain. Create: `vlan 10` → `name SALES`. Assign an access port: `switchport mode access` + `switchport access vlan 10`. Verify with `show vlan brief`. Inter-VLAN traffic needs a router or L3 switch (SVI / router-on-a-stick). VLAN 1 is the default VLAN AND default native VLAN — best practice is to not use it for user data. Voice VLAN: `switchport voice vlan 20` puts phone traffic in a separate VLAN on the same access port. Normal range = 1–1005; extended = 1006–4094.',
    },
    definition: 'A **VLAN** is a logical Layer 2 broadcast domain. Same-VLAN devices talk at L2 (even across switches via trunks); **different VLANs need a router/L3 switch**. End-device ports are **access ports** assigned to one VLAN.',
    keyPoints: [
      'Create: `vlan <id>` then `name <name>`.',
      'Assign access port: `switchport mode access` + `switchport access vlan <id>`.',
      'Same VLAN = same broadcast domain; inter-VLAN needs L3.',
      'Verify with `show vlan brief`.',
      'VLAN 1 = default VLAN and default native VLAN — avoid for user traffic.',
      'Voice VLAN carries phone traffic separately on an access port.',
    ],
    realWorld: 'A trunk carries multiple VLANs between switches, so VLAN 10 can span the building. `show vlan brief` confirms port-to-VLAN mapping; a missing VLAN assignment is a top cause of “host can’t reach anyone.”',
    commonMistakes: [
      'Assigning a port to a VLAN that hasn’t been created (it may go inactive).',
      'Leaving user traffic on VLAN 1.',
      'Expecting two VLANs to talk without a router/L3 switch.',
      'Forgetting `switchport mode access` so the port may negotiate a trunk.',
    ],
    related: ['2.2 Trunking', '3.x Inter-VLAN routing', '1.13 Switching'],
    advanced: 'Normal-range VLANs (1–1005) are stored in vlan.dat; extended (1006–4094) require certain VTP modes. A port in a deleted VLAN goes inactive until the VLAN exists again.',
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'VLANs', confidence: 0.95 }],
  },
  questions: [
    { id: '2.1-c-q1', concept: 'vlan definition', type: 'definition', difficulty: 'easy', question: 'A VLAN is best described as a…', choices: ['Collision domain', 'Logical broadcast domain', 'Physical cable', 'Routing protocol'], correctIndex: 1, explanation: 'A VLAN is a logical broadcast domain at Layer 2.', ckuIds: ['CKU-VLAN'] },
    { id: '2.1-c-q2', concept: 'inter-vlan', type: 'scenario', difficulty: 'medium', question: 'Hosts in VLAN 10 cannot reach hosts in VLAN 20. What is required?', choices: ['Another switch', 'A router or L3 switch', 'A longer cable', 'A trunk between the two hosts'], correctIndex: 1, explanation: 'Traffic between VLANs must be routed by a Layer 3 device.', ckuIds: ['CKU-VLAN'] },
    { id: '2.1-c-q3', concept: 'access port config', type: 'application', difficulty: 'medium', question: 'Which commands assign a port to VLAN 10 as an access port?', choices: ['switchport trunk vlan 10', 'switchport mode access / switchport access vlan 10', 'vlan 10 / no shutdown', 'switchport voice vlan 10'], correctIndex: 1, explanation: 'Set the mode to access, then assign the VLAN.', ckuIds: ['CKU-ACCESS-PORT'] },
    { id: '2.1-c-q4', concept: 'verify', type: 'application', difficulty: 'easy', question: 'Which command shows VLAN-to-port assignments?', choices: ['show interfaces trunk', 'show vlan brief', 'show ip route', 'show mac address-table'], correctIndex: 1, explanation: '`show vlan brief` lists VLANs and their assigned ports.', ckuIds: ['CKU-VLAN'] },
    { id: '2.1-c-q5', concept: 'default vlan', type: 'definition', difficulty: 'medium', question: 'What is special about VLAN 1 by default?', choices: ['It is the only routable VLAN', 'It is the default VLAN and default native VLAN', 'It cannot carry traffic', 'It is the voice VLAN'], correctIndex: 1, explanation: 'VLAN 1 is the default VLAN for all ports and the default native VLAN; best practice avoids it for user data.', ckuIds: ['CKU-VLAN'] },
    { id: '2.1-c-q6', concept: 'voice vlan', type: 'scenario', difficulty: 'medium', question: 'An IP phone and a PC share one switchport. How are their traffic types separated?', choices: ['Two access VLANs are impossible', 'A data VLAN + a voice VLAN on the port', 'A trunk to the phone', 'Port security'], correctIndex: 1, explanation: 'The access (data) VLAN plus a voice VLAN separate PC and phone traffic on one port.', ckuIds: ['CKU-VOICE-VLAN'] },
    { id: '2.1-c-q7', concept: 'same vlan reach', type: 'true-false', difficulty: 'easy', question: 'True or False: Devices in the same VLAN on two different switches can communicate at Layer 2 (given a trunk).', choices: ['True', 'False'], correctIndex: 0, explanation: 'True — a trunk lets a VLAN span switches at Layer 2.', ckuIds: ['CKU-VLAN'] },
    { id: '2.1-c-q8', concept: 'create vlan', type: 'application', difficulty: 'easy', question: 'Which command creates VLAN 30?', choices: ['vlan 30', 'switchport access vlan 30', 'create vlan 30', 'ip vlan 30'], correctIndex: 0, explanation: '`vlan 30` in global config creates the VLAN.', ckuIds: ['CKU-VLAN'] },
  ],
  flashcards: [
    { id: '2.1-f1', ckuId: 'CKU-VLAN', front: 'What is a VLAN?', back: 'A logical Layer 2 broadcast domain; inter-VLAN traffic needs a router/L3 switch.' },
    { id: '2.1-f2', ckuId: 'CKU-ACCESS-PORT', front: 'Commands to make an access port in VLAN 10?', back: 'switchport mode access / switchport access vlan 10.' },
    { id: '2.1-f3', ckuId: 'CKU-VLAN', front: 'Command to verify VLAN/port assignments?', back: 'show vlan brief.' },
    { id: '2.1-f4', ckuId: 'CKU-VLAN', front: 'What is special about VLAN 1?', back: 'Default VLAN + default native VLAN; avoid for user traffic.' },
    { id: '2.1-f5', ckuId: 'CKU-VOICE-VLAN', front: 'Voice VLAN purpose?', back: 'Separates IP-phone traffic from PC data on the same access port.' },
    { id: '2.1-f6', ckuId: 'CKU-VLAN', front: 'Normal vs extended VLAN ranges?', back: 'Normal 1–1005; extended 1006–4094.' },
  ],
  commands: [
    { id: '2.1-cmd1', command: 'vlan <id>', mode: 'global config', purpose: 'Create a VLAN (then name it).', example: 'SW1(config)# vlan 10', ckuIds: ['CKU-VLAN'] },
    { id: '2.1-cmd2', command: 'switchport access vlan <id>', mode: 'interface config', purpose: 'Assign an access port to a VLAN.', example: 'SW1(config-if)# switchport access vlan 10', ckuIds: ['CKU-ACCESS-PORT'] },
    { id: '2.1-cmd3', command: 'show vlan brief', mode: 'privileged EXEC', purpose: 'Display VLANs and their assigned ports.', example: 'SW1# show vlan brief', ckuIds: ['CKU-VLAN'] },
  ],
  glossary: [
    { id: '2.1-g1', term: 'VLAN', definition: 'A logical Layer 2 broadcast domain configured on switches.', ckuIds: ['CKU-VLAN'] },
    { id: '2.1-g2', term: 'Access port', definition: 'A switchport in one VLAN carrying untagged end-device traffic.', ckuIds: ['CKU-ACCESS-PORT'] },
    { id: '2.1-g3', term: 'Native VLAN', definition: 'The untagged VLAN on a trunk; VLAN 1 by default.', ckuIds: ['CKU-VLAN'] },
    { id: '2.1-g4', term: 'Voice VLAN', definition: 'A separate VLAN for IP-phone traffic on an access port.', ckuIds: ['CKU-VOICE-VLAN'] },
  ],
  mnemonics: [
    { id: '2.1-m1', title: 'Access port', mnemonic: '“Mode access, then access vlan.”', explanation: 'Two commands in order: set mode, then assign the VLAN.', ckuIds: ['CKU-ACCESS-PORT'] },
  ],
  examTraps: [
    { id: '2.1-t1', trap: 'Thinking same-VLAN devices need a router.', correction: 'Same VLAN = same broadcast domain, no routing needed; only inter-VLAN does.', ckuIds: ['CKU-VLAN'] },
    { id: '2.1-t2', trap: 'Leaving ports on VLAN 1.', correction: 'Best practice moves user traffic off VLAN 1 and changes the native VLAN.', ckuIds: ['CKU-VLAN'] },
    { id: '2.1-t3', trap: 'Assigning a port to an uncreated VLAN.', correction: 'Create the VLAN first or the port may go inactive.', ckuIds: ['CKU-VLAN'] },
  ],
  misconceptions: [
    { id: '2.1-x1', misconception: 'VLANs improve speed.', reality: 'VLANs segment broadcast domains for organization/security, not raw speed.', example: 'Smaller broadcast domains reduce flooding but don’t increase link rate.', ckuIds: ['CKU-VLAN'] },
    { id: '2.1-x2', misconception: 'A VLAN exists on only one switch.', reality: 'A VLAN can span many switches over trunks.', example: 'VLAN 10 on SW1 and SW2 is one broadcast domain via a trunk.', ckuIds: ['CKU-VLAN'] },
  ],
  diagram: {
    id: 'DIAG-2.1-vlans', title: 'VLAN segmentation', type: 'topology', ckuIds: ['CKU-VLAN'],
    nodes: [
      { id: 'sw', label: 'Switch', type: 'switch', x: 50, y: 25 },
      { id: 'v10a', label: 'PC VLAN10', type: 'pc', x: 20, y: 78 },
      { id: 'v10b', label: 'PC VLAN10', type: 'pc', x: 45, y: 78, status: 'highlighted' },
      { id: 'v20', label: 'PC VLAN20', type: 'pc', x: 78, y: 78 },
    ],
    links: [
      { id: 'l1', source: 'sw', target: 'v10a', label: 'vlan10' }, { id: 'l2', source: 'sw', target: 'v10b', label: 'vlan10', status: 'forwarding' }, { id: 'l3', source: 'sw', target: 'v20', label: 'vlan20' },
    ],
    annotations: ['VLAN10 hosts talk directly (L2).', 'VLAN10 ↔ VLAN20 needs a router/L3 switch.'],
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'VLANs', confidence: 0.9 }],
  },
  packetFlow: {
    id: 'FLOW-2.1-samevlan', title: 'Same-VLAN frame forwarding', ckuIds: ['CKU-VLAN'], diagramId: 'DIAG-2.1-vlans',
    steps: [
      { id: 's1', order: 1, title: 'Frame in', action: 'PC in VLAN10 sends a frame to another VLAN10 host.', successState: 'forwarded' },
      { id: 's2', order: 2, title: 'VLAN check', action: 'Switch keeps the frame within VLAN10’s broadcast domain.', successState: 'matched' },
      { id: 's3', order: 3, title: 'Forward', action: 'Frame is delivered out the destination’s VLAN10 port (no routing).', successState: 'forwarded' },
    ],
  },
}

/* -------------------------------------------------------------------------
   OBJECTIVE 2.2 — Configure and verify interswitch connectivity (trunking)
   ------------------------------------------------------------------------- */
const OBJ_22 = {
  objectiveId: '2.2', domainId: 'access', title: 'Configure and verify interswitch connectivity (trunking)',
  ckus: [
    { id: 'CKU-TRUNKING', title: 'Trunking (802.1Q)', summary: 'A trunk carries traffic for multiple VLANs between switches using 802.1Q tagging — a 4-byte tag (12-bit VLAN ID) added to each frame.', aliases: ['802.1Q', 'dot1q', 'tagging'], tags: ['trunk', 'vlan'], prerequisiteCkuIds: ['CKU-VLAN'], relatedCkuIds: ['CKU-NATIVE-VLAN', 'CKU-DTP'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Trunking', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '2.2', confidence: 1 }] },
    { id: 'CKU-NATIVE-VLAN', title: 'Native VLAN', summary: 'The one VLAN whose frames cross an 802.1Q trunk UNtagged. Must match on both ends (default VLAN 1) or you get a native VLAN mismatch.', aliases: ['untagged vlan'], tags: ['trunk'], prerequisiteCkuIds: ['CKU-TRUNKING'], relatedCkuIds: ['CKU-TRUNKING'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Native VLAN', confidence: 0.9 }] },
    { id: 'CKU-DTP', title: 'DTP', summary: 'Dynamic Trunking Protocol auto-negotiates trunk vs access; often disabled for security with `switchport nonegotiate`.', aliases: ['dynamic trunking'], tags: ['trunk', 'security'], prerequisiteCkuIds: ['CKU-TRUNKING'], relatedCkuIds: ['CKU-TRUNKING'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'DTP', confidence: 0.85 }] },
  ],
  reading: {
    id: 'READ-2.2', ckuIds: ['CKU-TRUNKING', 'CKU-NATIVE-VLAN', 'CKU-DTP'], estimatedReadMinutes: 6,
    tiers: {
      beginner: 'When two switches need to carry several VLANs over a single link between them, that link is a “trunk.” To keep VLANs separate, the switch adds a small tag to each frame saying which VLAN it belongs to. One VLAN — the “native” VLAN — is sent without a tag, and both ends must agree on which one it is.',
      intermediate: 'A trunk uses 802.1Q to tag frames with their VLAN ID (a 4-byte tag) so multiple VLANs share one link. Configure with `switchport mode trunk`; restrict VLANs with `switchport trunk allowed vlan <list>`; set the untagged native VLAN with `switchport trunk native vlan <id>` (must match both ends). DTP can auto-form trunks but is commonly disabled (`switchport nonegotiate`) to prevent VLAN-hopping. Verify with `show interfaces trunk`.',
      examReady: 'Trunk = 802.1Q-tagged link carrying multiple VLANs between switches. Config: `switchport mode trunk`, optionally `switchport trunk allowed vlan 10,20`, and `switchport trunk native vlan 99`. The native VLAN crosses UNtagged and must match on both ends (mismatch → CDP warning, traffic leakage). 802.1Q tag = 4 bytes inserted into the Ethernet frame, holding the 12-bit VLAN ID (so 4094 usable VLANs). DTP auto-negotiates trunking; disable with `switchport nonegotiate` for security. Verify: `show interfaces trunk` (mode, native VLAN, allowed/active VLANs).',
    },
    definition: 'A **trunk** carries multiple VLANs between switches using **802.1Q** tagging (a 4-byte tag with the VLAN ID). One **native VLAN** crosses **untagged** and must match on both ends.',
    keyPoints: [
      'Config: `switchport mode trunk`.',
      '802.1Q tag = 4 bytes, 12-bit VLAN ID (up to 4094 VLANs).',
      'Native VLAN is untagged; must match both ends (default VLAN 1).',
      'Restrict VLANs with `switchport trunk allowed vlan <list>`.',
      'DTP auto-negotiates trunks; disable with `switchport nonegotiate`.',
      'Verify with `show interfaces trunk`.',
    ],
    realWorld: 'A native-VLAN mismatch shows up as a CDP error and can leak traffic between VLANs. Pruning the allowed VLAN list limits broadcast scope and is a security best practice.',
    commonMistakes: [
      'Native VLAN mismatch between the two trunk ends.',
      'Leaving the native VLAN as 1 (security risk).',
      'Allowing all VLANs on a trunk that only needs a few.',
      'Relying on DTP auto-negotiation on untrusted links.',
    ],
    related: ['2.1 VLANs', '2.5 STP', 'Inter-VLAN routing'],
    advanced: 'ISL is the legacy Cisco trunking protocol; 802.1Q is the standard and the only one on the exam in practice. A double-tagging attack abuses the native VLAN — hence the advice to use a dedicated, unused native VLAN.',
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Trunking', confidence: 0.95 }],
  },
  questions: [
    { id: '2.2-c-q1', concept: 'trunk purpose', type: 'definition', difficulty: 'easy', question: 'What does a trunk link do?', choices: ['Carries one VLAN only', 'Carries multiple VLANs between switches', 'Connects a PC to a switch', 'Routes between VLANs'], correctIndex: 1, explanation: 'A trunk carries traffic for multiple VLANs between switches using 802.1Q.', ckuIds: ['CKU-TRUNKING'] },
    { id: '2.2-c-q2', concept: 'tag size', type: 'definition', difficulty: 'medium', question: 'How big is the 802.1Q tag added to a frame?', choices: ['2 bytes', '4 bytes', '8 bytes', '12 bytes'], correctIndex: 1, explanation: 'The 802.1Q tag is 4 bytes and contains the 12-bit VLAN ID.', ckuIds: ['CKU-TRUNKING'] },
    { id: '2.2-c-q3', concept: 'native vlan', type: 'scenario', difficulty: 'medium', question: 'On an 802.1Q trunk, how is the native VLAN’s traffic sent?', choices: ['Double-tagged', 'Tagged', 'Untagged', 'Dropped'], correctIndex: 2, explanation: 'Native VLAN frames cross the trunk untagged.', ckuIds: ['CKU-NATIVE-VLAN'] },
    { id: '2.2-c-q4', concept: 'native mismatch', type: 'troubleshooting', difficulty: 'hard', question: 'Two trunked switches log a native VLAN mismatch. What is the likely effect?', choices: ['Trunk speed drops', 'Traffic from those VLANs can leak/merge', 'All VLANs stop', 'Nothing — it is cosmetic'], correctIndex: 1, explanation: 'A native VLAN mismatch can merge the two native VLANs’ traffic and triggers a CDP warning.', ckuIds: ['CKU-NATIVE-VLAN'] },
    { id: '2.2-c-q5', concept: 'config trunk', type: 'application', difficulty: 'easy', question: 'Which command forces a port to trunk?', choices: ['switchport mode access', 'switchport mode trunk', 'switchport trunk allowed vlan', 'switchport nonegotiate'], correctIndex: 1, explanation: '`switchport mode trunk` sets the port to trunking.', ckuIds: ['CKU-TRUNKING'] },
    { id: '2.2-c-q6', concept: 'DTP security', type: 'application', difficulty: 'medium', question: 'Which command disables DTP auto-negotiation on a port?', choices: ['no dtp', 'switchport nonegotiate', 'switchport mode dynamic', 'no switchport trunk'], correctIndex: 1, explanation: '`switchport nonegotiate` stops DTP, a hardening best practice.', ckuIds: ['CKU-DTP'] },
    { id: '2.2-c-q7', concept: 'verify trunk', type: 'application', difficulty: 'easy', question: 'Which command shows trunk mode, native VLAN, and allowed VLANs?', choices: ['show vlan brief', 'show interfaces trunk', 'show ip interface brief', 'show cdp neighbors'], correctIndex: 1, explanation: '`show interfaces trunk` lists trunking details.', ckuIds: ['CKU-TRUNKING'] },
    { id: '2.2-c-q8', concept: 'allowed vlans', type: 'application', difficulty: 'medium', question: 'Which command limits a trunk to VLANs 10 and 20?', choices: ['switchport access vlan 10,20', 'switchport trunk allowed vlan 10,20', 'vlan 10,20', 'switchport trunk native vlan 10'], correctIndex: 1, explanation: '`switchport trunk allowed vlan 10,20` prunes the trunk.', ckuIds: ['CKU-TRUNKING'] },
  ],
  flashcards: [
    { id: '2.2-f1', ckuId: 'CKU-TRUNKING', front: 'What is a trunk and what protocol tags it?', back: 'A link carrying multiple VLANs between switches; 802.1Q tags frames with the VLAN ID.' },
    { id: '2.2-f2', ckuId: 'CKU-TRUNKING', front: 'Size and content of the 802.1Q tag?', back: '4 bytes, including the 12-bit VLAN ID.' },
    { id: '2.2-f3', ckuId: 'CKU-NATIVE-VLAN', front: 'How is the native VLAN carried, and what must match?', back: 'Untagged; the native VLAN ID must match on both trunk ends.' },
    { id: '2.2-f4', ckuId: 'CKU-TRUNKING', front: 'Command to verify trunks?', back: 'show interfaces trunk.' },
    { id: '2.2-f5', ckuId: 'CKU-DTP', front: 'How do you disable DTP?', back: 'switchport nonegotiate.' },
    { id: '2.2-f6', ckuId: 'CKU-TRUNKING', front: 'Command to restrict allowed VLANs on a trunk?', back: 'switchport trunk allowed vlan <list>.' },
  ],
  commands: [
    { id: '2.2-cmd1', command: 'switchport mode trunk', mode: 'interface config', purpose: 'Configure the port as an 802.1Q trunk.', example: 'SW1(config-if)# switchport mode trunk', ckuIds: ['CKU-TRUNKING'] },
    { id: '2.2-cmd2', command: 'switchport trunk native vlan <id>', mode: 'interface config', purpose: 'Set the untagged native VLAN (match both ends).', example: 'SW1(config-if)# switchport trunk native vlan 99', ckuIds: ['CKU-NATIVE-VLAN'] },
    { id: '2.2-cmd3', command: 'show interfaces trunk', mode: 'privileged EXEC', purpose: 'Show trunk mode, native VLAN, and allowed/active VLANs.', example: 'SW1# show interfaces trunk', ckuIds: ['CKU-TRUNKING'] },
  ],
  glossary: [
    { id: '2.2-g1', term: 'Trunk', definition: 'A switch link carrying multiple VLANs using 802.1Q tagging.', ckuIds: ['CKU-TRUNKING'] },
    { id: '2.2-g2', term: '802.1Q', definition: 'The IEEE VLAN tagging standard; inserts a 4-byte tag with the VLAN ID.', ckuIds: ['CKU-TRUNKING'] },
    { id: '2.2-g3', term: 'Native VLAN', definition: 'The VLAN sent untagged on a trunk; must match both ends.', ckuIds: ['CKU-NATIVE-VLAN'] },
    { id: '2.2-g4', term: 'DTP', definition: 'Dynamic Trunking Protocol; auto-negotiates trunk/access.', ckuIds: ['CKU-DTP'] },
  ],
  mnemonics: [
    { id: '2.2-m1', title: 'Native = naked', mnemonic: 'Native VLAN travels “naked” (untagged).', explanation: 'The native VLAN is the one frame type sent without an 802.1Q tag.', ckuIds: ['CKU-NATIVE-VLAN'] },
  ],
  examTraps: [
    { id: '2.2-t1', trap: 'Mismatched native VLANs.', correction: 'Native VLAN must match on both ends or traffic can leak (CDP warns).', ckuIds: ['CKU-NATIVE-VLAN'] },
    { id: '2.2-t2', trap: 'Thinking all VLANs are tagged.', correction: 'The native VLAN is untagged; all others are tagged.', ckuIds: ['CKU-NATIVE-VLAN'] },
    { id: '2.2-t3', trap: 'Leaving DTP on for untrusted ports.', correction: 'Disable DTP with switchport nonegotiate to prevent VLAN hopping.', ckuIds: ['CKU-DTP'] },
  ],
  misconceptions: [
    { id: '2.2-x1', misconception: 'A trunk is faster than an access port.', reality: 'A trunk simply carries multiple VLANs; speed depends on the physical link.', example: 'A 1G trunk and 1G access port have the same link rate.', ckuIds: ['CKU-TRUNKING'] },
    { id: '2.2-x2', misconception: '802.1Q encapsulates the whole frame.', reality: '802.1Q inserts a 4-byte tag into the existing frame; it does not wrap it.', example: 'The tag sits after the source MAC.', ckuIds: ['CKU-TRUNKING'] },
  ],
  diagram: {
    id: 'DIAG-2.2-trunk', title: 'Trunk between switches', type: 'topology', ckuIds: ['CKU-TRUNKING'],
    nodes: [
      { id: 'sw1', label: 'SW1', type: 'switch', x: 25, y: 40 },
      { id: 'sw2', label: 'SW2', type: 'switch', x: 75, y: 40 },
      { id: 'v', label: 'VLAN 10,20,99', type: 'process', x: 50, y: 82 },
    ],
    links: [
      { id: 'l1', source: 'sw1', target: 'sw2', label: '802.1Q trunk', status: 'forwarding' }, { id: 'l2', source: 'v', target: 'sw1', label: 'tagged' }, { id: 'l3', source: 'v', target: 'sw2', label: 'tagged' },
    ],
    annotations: ['One link carries many VLANs, each frame tagged with its VLAN ID.', 'The native VLAN (99) crosses untagged.'],
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Trunking', confidence: 0.9 }],
  },
  packetFlow: {
    id: 'FLOW-2.2-tag', title: 'Tagging across a trunk', ckuIds: ['CKU-TRUNKING', 'CKU-NATIVE-VLAN'], diagramId: 'DIAG-2.2-trunk',
    steps: [
      { id: 's1', order: 1, title: 'Frame enters SW1', action: 'A VLAN10 frame arrives at SW1.', successState: 'forwarded' },
      { id: 's2', order: 2, title: 'Tag', action: 'SW1 inserts an 802.1Q tag with VLAN ID 10 before sending on the trunk.', successState: 'modified' },
      { id: 's3', order: 3, title: 'SW2 reads tag', action: 'SW2 reads the tag, removes it, and places the frame in VLAN10.', successState: 'matched' },
      { id: 's4', order: 4, title: 'Deliver', action: 'Frame is forwarded out a VLAN10 access port.', successState: 'forwarded' },
    ],
  },
}

/* -------------------------------------------------------------------------
   OBJECTIVE 2.5 — Interpret basic operations of Rapid PVST+ Spanning Tree
   ------------------------------------------------------------------------- */
const OBJ_25 = {
  objectiveId: '2.5', domainId: 'access', title: 'Interpret basic operations of Rapid PVST+ Spanning Tree Protocol',
  ckus: [
    { id: 'CKU-STP', title: 'Spanning Tree Protocol', summary: 'Prevents Layer 2 loops by blocking redundant switch paths, leaving one active path to the root bridge.', aliases: ['STP', '802.1D', 'spanning tree'], tags: ['stp', 'switching', 'loop-prevention'], prerequisiteCkuIds: ['CKU-TRUNKING'], relatedCkuIds: ['CKU-ROOT-BRIDGE', 'CKU-STP-PORTFAST'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'STP', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '2.5', confidence: 1 }] },
    { id: 'CKU-ROOT-BRIDGE', title: 'Root Bridge Election', summary: 'The switch with the lowest Bridge ID (priority + MAC) becomes root; all others find the lowest-cost path to it. Default priority 32768.', aliases: ['root election', 'bridge ID'], tags: ['stp'], prerequisiteCkuIds: ['CKU-STP'], relatedCkuIds: ['CKU-STP'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Root bridge', confidence: 0.9 }] },
    { id: 'CKU-STP-PORTFAST', title: 'PortFast & BPDU Guard', summary: 'PortFast skips listening/learning on access ports for fast host connectivity; BPDU Guard err-disables a PortFast port that receives a BPDU (rogue switch).', aliases: ['portfast', 'bpdu guard'], tags: ['stp', 'security'], prerequisiteCkuIds: ['CKU-STP'], relatedCkuIds: ['CKU-STP'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'PortFast/BPDU Guard', confidence: 0.9 }] },
  ],
  reading: {
    id: 'READ-2.5', ckuIds: ['CKU-STP', 'CKU-ROOT-BRIDGE', 'CKU-STP-PORTFAST'], estimatedReadMinutes: 7,
    tiers: {
      beginner: 'If you connect switches in a loop for redundancy, frames can circle forever and crash the network. Spanning Tree fixes this by automatically blocking the extra paths, leaving just one active route. If a link fails, it unblocks a backup path. One switch is elected the “root,” and every other switch keeps its best path toward it.',
      intermediate: 'STP prevents Layer 2 loops by electing a root bridge (lowest Bridge ID = priority + MAC) and blocking redundant links. Each non-root switch has one root port (best path to root) and each segment has one designated port; other ports block. Port roles/states converge so exactly one loop-free path exists. Rapid PVST+ (Cisco default) runs a per-VLAN rapid spanning tree that converges in seconds using proposal/agreement. PortFast on access ports skips the listening/learning delay; BPDU Guard shuts a PortFast port if it unexpectedly receives a BPDU.',
      examReady: 'STP (802.1D) blocks redundant L2 paths to prevent loops. Root bridge = lowest Bridge ID (priority + MAC); default priority 32768; lower wins (ties broken by lowest MAC). Roles: Root Port (one per non-root switch, lowest cost to root), Designated Port (one per segment, forwards), Non-Designated/Alternate (blocks). Path cost by speed (e.g. 10G=2, 1G=4, 100M=19, 10M=100). Rapid PVST+ = Cisco default, per-VLAN, states discarding/learning/forwarding, fast convergence via proposal/agreement. PortFast → access ports skip listening/learning; BPDU Guard → err-disables a PortFast port that receives a BPDU. Set root: `spanning-tree vlan 1 root primary` (or lower the priority). Verify: `show spanning-tree`.',
    },
    definition: 'STP prevents **Layer 2 loops** by blocking redundant paths, leaving one path to the **root bridge** (lowest Bridge ID). **Rapid PVST+** (Cisco default) converges in seconds. **PortFast/BPDU Guard** speed up and protect access ports.',
    keyPoints: [
      'Root bridge = lowest Bridge ID (priority + MAC); default priority `32768`.',
      'Roles: root port (per switch), designated port (per segment), others block.',
      'Lower path cost wins; cost by link speed (1G=`4`, 100M=`19`).',
      'Rapid PVST+ = Cisco default; states discarding/learning/forwarding.',
      'PortFast skips listening/learning on access ports.',
      'BPDU Guard err-disables a PortFast port that receives a BPDU.',
    ],
    realWorld: 'Lower a switch’s priority (`spanning-tree vlan 1 priority 4096`) to make it root deterministically. `show spanning-tree` reveals the root, port roles, and which ports are blocking — the first stop when redundant links misbehave.',
    commonMistakes: [
      'Assuming the highest-priority number wins (lowest BID wins).',
      'Enabling PortFast on a switch-to-switch link (loop risk).',
      'Forgetting BPDU Guard, leaving PortFast ports open to rogue switches.',
      'Confusing root port (toward root) with designated port (per segment).',
    ],
    related: ['2.2 Trunking', '2.4 EtherChannel', '1.13 Switching'],
    advanced: 'Rapid PVST+ uses proposal/agreement to converge without timers in most cases. Root Guard prevents a downstream switch from becoming root; Loop Guard protects against unidirectional link failures.',
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'STP', confidence: 0.95 }],
  },
  questions: [
    { id: '2.5-c-q1', concept: 'stp purpose', type: 'definition', difficulty: 'easy', question: 'What problem does STP solve?', choices: ['Routing loops', 'Layer 2 switching loops', 'IP address conflicts', 'Slow DNS'], correctIndex: 1, explanation: 'STP prevents Layer 2 loops by blocking redundant paths.', ckuIds: ['CKU-STP'] },
    { id: '2.5-c-q2', concept: 'root election', type: 'application', difficulty: 'medium', question: 'How is the root bridge chosen?', choices: ['Highest priority', 'Lowest Bridge ID (priority + MAC)', 'Highest MAC', 'Fastest CPU'], correctIndex: 1, explanation: 'The lowest Bridge ID (priority, then MAC) wins the root election.', ckuIds: ['CKU-ROOT-BRIDGE'] },
    { id: '2.5-c-q3', concept: 'default priority', type: 'definition', difficulty: 'medium', question: 'What is the default STP bridge priority?', choices: ['0', '4096', '32768', '65535'], correctIndex: 2, explanation: 'Default priority is 32768 (lower is preferred).', ckuIds: ['CKU-ROOT-BRIDGE'] },
    { id: '2.5-c-q4', concept: 'port roles', type: 'definition', difficulty: 'medium', question: 'Each non-root switch has exactly one of which port type toward the root?', choices: ['Designated port', 'Root port', 'Blocking port', 'Trunk port'], correctIndex: 1, explanation: 'Each non-root switch has one root port — its lowest-cost path to root.', ckuIds: ['CKU-STP'] },
    { id: '2.5-c-q5', concept: 'portfast', type: 'application', difficulty: 'medium', question: 'PortFast should be enabled on which ports?', choices: ['Switch-to-switch trunks', 'Access ports to end devices', 'Router uplinks', 'All ports'], correctIndex: 1, explanation: 'PortFast belongs on access ports to hosts; on switch links it risks loops.', ckuIds: ['CKU-STP-PORTFAST'] },
    { id: '2.5-c-q6', concept: 'bpdu guard', type: 'scenario', difficulty: 'hard', question: 'A PortFast access port receives a BPDU with BPDU Guard enabled. What happens?', choices: ['Port becomes root', 'Port is err-disabled (shut down)', 'BPDU is forwarded', 'Nothing'], correctIndex: 1, explanation: 'BPDU Guard err-disables the port, protecting against a rogue switch.', ckuIds: ['CKU-STP-PORTFAST'] },
    { id: '2.5-c-q7', concept: 'rapid pvst', type: 'definition', difficulty: 'medium', question: 'What is the Cisco default spanning-tree mode?', choices: ['802.1D', 'Rapid PVST+', 'MST', 'PVST'], correctIndex: 1, explanation: 'Rapid PVST+ is the Cisco default — per-VLAN rapid spanning tree.', ckuIds: ['CKU-STP'] },
    { id: '2.5-c-q8', concept: 'set root', type: 'application', difficulty: 'medium', question: 'Which command makes a switch the root for VLAN 1 by lowering its priority?', choices: ['spanning-tree vlan 1 root primary', 'spanning-tree portfast', 'spanning-tree bpduguard enable', 'switchport mode trunk'], correctIndex: 0, explanation: '`spanning-tree vlan 1 root primary` lowers the priority so this switch becomes root.', ckuIds: ['CKU-ROOT-BRIDGE'] },
  ],
  flashcards: [
    { id: '2.5-f1', ckuId: 'CKU-STP', front: 'What does STP do?', back: 'Blocks redundant L2 paths to prevent switching loops; unblocks on failure.' },
    { id: '2.5-f2', ckuId: 'CKU-ROOT-BRIDGE', front: 'How is the root bridge elected?', back: 'Lowest Bridge ID = priority (default 32768) then MAC.' },
    { id: '2.5-f3', ckuId: 'CKU-STP', front: 'Three STP port roles?', back: 'Root port (per switch), designated port (per segment), blocking/alternate.' },
    { id: '2.5-f4', ckuId: 'CKU-STP-PORTFAST', front: 'What does PortFast do?', back: 'Skips listening/learning so access ports forward immediately.' },
    { id: '2.5-f5', ckuId: 'CKU-STP-PORTFAST', front: 'What does BPDU Guard do?', back: 'Err-disables a PortFast port that receives a BPDU (rogue switch protection).' },
    { id: '2.5-f6', ckuId: 'CKU-STP', front: 'Cisco default STP mode + verify command?', back: 'Rapid PVST+; show spanning-tree.' },
  ],
  commands: [
    { id: '2.5-cmd1', command: 'show spanning-tree', mode: 'privileged EXEC', purpose: 'Show the root bridge, port roles/states, and costs.', example: 'SW1# show spanning-tree vlan 1', ckuIds: ['CKU-STP', 'CKU-ROOT-BRIDGE'] },
    { id: '2.5-cmd2', command: 'spanning-tree vlan <id> root primary', mode: 'global config', purpose: 'Lower priority so this switch becomes the root for a VLAN.', example: 'SW1(config)# spanning-tree vlan 1 root primary', ckuIds: ['CKU-ROOT-BRIDGE'] },
    { id: '2.5-cmd3', command: 'spanning-tree portfast', mode: 'interface config', purpose: 'Enable PortFast on an access port.', example: 'SW1(config-if)# spanning-tree portfast', ckuIds: ['CKU-STP-PORTFAST'] },
  ],
  glossary: [
    { id: '2.5-g1', term: 'Spanning Tree Protocol', definition: 'L2 protocol that blocks redundant paths to prevent loops.', ckuIds: ['CKU-STP'] },
    { id: '2.5-g2', term: 'Root bridge', definition: 'The switch with the lowest Bridge ID; reference point of the tree.', ckuIds: ['CKU-ROOT-BRIDGE'] },
    { id: '2.5-g3', term: 'Root port', definition: 'A non-root switch’s lowest-cost port toward the root.', ckuIds: ['CKU-STP'] },
    { id: '2.5-g4', term: 'PortFast', definition: 'Feature letting access ports skip listening/learning.', ckuIds: ['CKU-STP-PORTFAST'] },
    { id: '2.5-g5', term: 'BPDU Guard', definition: 'Err-disables a PortFast port that receives a BPDU.', ckuIds: ['CKU-STP-PORTFAST'] },
  ],
  mnemonics: [
    { id: '2.5-m1', title: 'Lowest wins', mnemonic: 'Lowest Bridge ID = Root.', explanation: 'Priority first (default 32768), then MAC — lowest is root.', ckuIds: ['CKU-ROOT-BRIDGE'] },
  ],
  examTraps: [
    { id: '2.5-t1', trap: 'Highest priority becomes root.', correction: 'LOWEST Bridge ID (priority then MAC) becomes root.', ckuIds: ['CKU-ROOT-BRIDGE'] },
    { id: '2.5-t2', trap: 'PortFast on switch links.', correction: 'PortFast belongs only on access/host ports; on switch links it risks loops.', ckuIds: ['CKU-STP-PORTFAST'] },
    { id: '2.5-t3', trap: 'Confusing root and designated ports.', correction: 'Root port = best path to root (per switch); designated = forwarding port per segment.', ckuIds: ['CKU-STP'] },
  ],
  misconceptions: [
    { id: '2.5-x1', misconception: 'STP load-balances across redundant links.', reality: 'Classic STP blocks redundant links (one active path); EtherChannel or per-VLAN roots are needed to use both.', example: 'A blocked link carries no data until the primary fails.', ckuIds: ['CKU-STP'] },
    { id: '2.5-x2', misconception: 'STP prevents routing loops.', reality: 'STP is Layer 2 only; routing loops are handled by L3 mechanisms (TTL, split horizon).', example: 'STP has no effect on IP routing.', ckuIds: ['CKU-STP'] },
  ],
  diagram: {
    id: 'DIAG-2.5-stp', title: 'STP blocks one redundant path', type: 'topology', ckuIds: ['CKU-STP', 'CKU-ROOT-BRIDGE'],
    nodes: [
      { id: 'root', label: 'Root (lowest BID)', type: 'switch', x: 50, y: 15, status: 'highlighted' },
      { id: 'a', label: 'SW-A', type: 'switch', x: 22, y: 70 },
      { id: 'b', label: 'SW-B', type: 'switch', x: 78, y: 70 },
    ],
    links: [
      { id: 'l1', source: 'root', target: 'a', label: 'forwarding', status: 'forwarding' }, { id: 'l2', source: 'root', target: 'b', label: 'forwarding', status: 'forwarding' }, { id: 'l3', source: 'a', target: 'b', label: 'BLOCKED', status: 'blocked' },
    ],
    annotations: ['Both links to root forward.', 'The A–B link is blocked to break the loop.'],
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'STP', confidence: 0.9 }],
  },
  packetFlow: {
    id: 'FLOW-2.5-converge', title: 'STP convergence', ckuIds: ['CKU-STP', 'CKU-ROOT-BRIDGE'], diagramId: 'DIAG-2.5-stp',
    steps: [
      { id: 's1', order: 1, title: 'Elect root', action: 'Switches exchange BPDUs; lowest Bridge ID becomes root.', successState: 'matched' },
      { id: 's2', order: 2, title: 'Choose root ports', action: 'Each non-root switch picks its lowest-cost port to root.', successState: 'matched' },
      { id: 's3', order: 3, title: 'Choose designated', action: 'Each segment elects one designated (forwarding) port.', successState: 'matched' },
      { id: 's4', order: 4, title: 'Block the rest', action: 'Remaining ports block, leaving a single loop-free tree.', successState: 'dropped' },
    ],
  },
}

/* -------------------------------------------------------------------------
   OBJECTIVE 3.4 — Configure and verify single area OSPFv2
   ------------------------------------------------------------------------- */
const OBJ_34 = {
  objectiveId: '3.4', domainId: 'connectivity', title: 'Configure and verify single area OSPFv2',
  ckus: [
    { id: 'CKU-OSPF', title: 'OSPFv2', summary: 'A link-state IGP: routers flood LSAs to build an identical LSDB per area, then run SPF (Dijkstra) to compute shortest paths. AD 110.', aliases: ['OSPF', 'open shortest path first'], tags: ['ospf', 'routing'], prerequisiteCkuIds: ['CKU-ROUTING-TABLE'], relatedCkuIds: ['CKU-OSPF-COST', 'CKU-OSPF-NEIGHBOR'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'OSPF', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '3.4', confidence: 1 }] },
    { id: 'CKU-OSPF-COST', title: 'OSPF Cost (Metric)', summary: 'OSPF metric = reference bandwidth (default 100 Mbps) ÷ interface bandwidth; lower cost is preferred. Total path cost sums interface costs.', aliases: ['ospf metric', 'cost'], tags: ['ospf', 'metric'], prerequisiteCkuIds: ['CKU-OSPF'], relatedCkuIds: ['CKU-OSPF'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'OSPF cost', confidence: 0.9 }] },
    { id: 'CKU-OSPF-NEIGHBOR', title: 'OSPF Neighbors & RID', summary: 'Neighbors must match area, subnet/mask, hello/dead timers, and authentication. Router ID = highest loopback IP, else highest active interface IP, or set manually.', aliases: ['adjacency', 'router id', 'DR/BDR'], tags: ['ospf', 'neighbor'], prerequisiteCkuIds: ['CKU-OSPF'], relatedCkuIds: ['CKU-OSPF'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'OSPF neighbors', confidence: 0.9 }] },
  ],
  reading: {
    id: 'READ-3.4', ckuIds: ['CKU-OSPF', 'CKU-OSPF-COST', 'CKU-OSPF-NEIGHBOR'], estimatedReadMinutes: 9,
    tiers: {
      beginner: 'OSPF is a routing protocol that lets routers learn paths automatically. Each router tells the others about its links; together they build the same “map” of the network and each calculates the shortest path to every destination. Routers that share a link become “neighbors” and exchange this information. The “cost” of a path is based on link speed — faster links cost less, so OSPF prefers them.',
      intermediate: 'OSPF is a link-state IGP. Routers flood Link-State Advertisements (LSAs) to build an identical link-state database (LSDB) within an area, then run the SPF (Dijkstra) algorithm to find the lowest-cost path to each prefix. Configure with `router ospf <process-id>` then `network <addr> <wildcard> area 0` (or `ip ospf <pid> area 0` on the interface). The Router ID is the highest loopback IP, else the highest active interface IP, or set with `router-id`. Cost = reference bandwidth ÷ interface bandwidth (lower wins). Neighbors must agree on area, subnet, timers, and auth to reach Full adjacency. `passive-interface` stops hellos toward LAN hosts.',
      examReady: 'OSPFv2 = link-state IGP, AD `110`, metric = reference-bw (default 100 Mbps) ÷ interface bandwidth (lower cost wins; total = sum of egress interface costs). Config: `router ospf 1` → `network 10.0.0.0 0.0.0.255 area 0` (wildcard mask) or interface `ip ospf 1 area 0`. Router ID: highest loopback IP → highest active interface IP → manual `router-id`. Adjacency requires matching area, subnet/mask, hello/dead timers (default 10/40 on broadcast), and authentication; states Down→Init→2-Way→ExStart→Exchange→Loading→Full. On multi-access links a DR/BDR are elected (highest priority, then highest RID). `passive-interface` advertises a network but sends no hellos. Verify: `show ip ospf neighbor`, `show ip route ospf`.',
    },
    definition: 'OSPFv2 is a **link-state IGP** (AD `110`): routers flood **LSAs** into a shared **LSDB**, then run **SPF** to pick lowest-**cost** paths. Cost = reference-bw ÷ interface-bw. Neighbors must match area, subnet, timers, and auth.',
    keyPoints: [
      'Link-state; AD `110`; metric = reference-bw (100 Mbps) ÷ interface-bw (lower wins).',
      'Config: `router ospf 1` → `network <addr> <wildcard> area 0`.',
      'Router ID: highest loopback → highest active IP → manual `router-id`.',
      'Adjacency needs matching area, subnet/mask, hello/dead timers, auth.',
      'Neighbor states end at `Full`; DR/BDR elected on multi-access links.',
      '`passive-interface` advertises a network but stops hellos.',
    ],
    realWorld: 'Set loopbacks or a manual `router-id` for stable IDs. Default reference bandwidth treats 1G and 10G as equal cost — raise it with `auto-cost reference-bandwidth` on all routers. `show ip ospf neighbor` is the first troubleshooting stop (stuck in Init = one-way hellos; never forming = timer/subnet/area mismatch).',
    commonMistakes: [
      'Wrong wildcard mask in the `network` statement.',
      'Mismatched hello/dead timers, area, or subnet preventing adjacency.',
      'Forgetting that default reference bandwidth makes 1G+ links equal cost.',
      'Expecting a DR/BDR on point-to-point links (there isn’t one).',
    ],
    related: ['3.1 Routing table', '3.2 Forwarding decision', '3.3 Static routing'],
    advanced: 'Single-area OSPF uses area 0. The DR reduces LSA flooding on multi-access segments by being the central point; BDR is the backup. Priority 0 means a router never becomes DR.',
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'OSPF', confidence: 0.95 }, { sourceName: CURATED_SOURCES.certVol1, chapter: 'Ch 19-21', confidence: 0.9 }],
  },
  questions: [
    { id: '3.4-c-q1', concept: 'protocol type', type: 'definition', difficulty: 'easy', question: 'What type of routing protocol is OSPF?', choices: ['Distance vector', 'Link-state', 'Path vector', 'Static'], correctIndex: 1, explanation: 'OSPF is a link-state IGP using LSAs and SPF.', ckuIds: ['CKU-OSPF'] },
    { id: '3.4-c-q2', concept: 'administrative distance', type: 'definition', difficulty: 'easy', question: 'What is OSPF’s default administrative distance?', choices: ['90', '100', '110', '120'], correctIndex: 2, explanation: 'OSPF AD is 110.', ckuIds: ['CKU-OSPF'] },
    { id: '3.4-c-q3', concept: 'cost formula', type: 'application', difficulty: 'hard', question: 'With default settings, what is the OSPF cost of a 100 Mbps link?', choices: ['1', '10', '100', '64'], correctIndex: 0, explanation: 'Cost = 100 Mbps reference ÷ 100 Mbps = 1.', ckuIds: ['CKU-OSPF-COST'] },
    { id: '3.4-c-q4', concept: 'router id', type: 'application', difficulty: 'medium', question: 'How is the OSPF Router ID selected if not set manually?', choices: ['Lowest interface IP', 'Highest loopback IP, else highest active interface IP', 'MAC address', 'Always 0.0.0.0'], correctIndex: 1, explanation: 'Highest loopback IP wins; otherwise the highest active interface IP.', ckuIds: ['CKU-OSPF-NEIGHBOR'] },
    { id: '3.4-c-q5', concept: 'adjacency requirements', type: 'troubleshooting', difficulty: 'hard', question: 'Two OSPF routers won’t form an adjacency. Which mismatch is a likely cause?', choices: ['Different hostnames', 'Different hello/dead timers or area', 'Different SNMP strings', 'Different banners'], correctIndex: 1, explanation: 'Area, subnet/mask, hello/dead timers, and auth must match to form an adjacency.', ckuIds: ['CKU-OSPF-NEIGHBOR'] },
    { id: '3.4-c-q6', concept: 'config network', type: 'application', difficulty: 'medium', question: 'Which command advertises 10.0.0.0/24 into OSPF area 0?', choices: ['network 10.0.0.0 255.255.255.0 area 0', 'network 10.0.0.0 0.0.0.255 area 0', 'ospf network 10.0.0.0/24', 'advertise 10.0.0.0 area 0'], correctIndex: 1, explanation: 'OSPF `network` uses a wildcard mask: 0.0.0.255 for a /24.', ckuIds: ['CKU-OSPF'] },
    { id: '3.4-c-q7', concept: 'full state', type: 'definition', difficulty: 'medium', question: 'A healthy OSPF neighbor relationship settles in which state?', choices: ['Init', '2-Way', 'Exchange', 'Full'], correctIndex: 3, explanation: 'Adjacent neighbors reach the Full state.', ckuIds: ['CKU-OSPF-NEIGHBOR'] },
    { id: '3.4-c-q8', concept: 'passive interface', type: 'application', difficulty: 'medium', question: 'What does `passive-interface` do in OSPF?', choices: ['Stops advertising the network', 'Advertises the network but sends no hellos', 'Disables the interface', 'Forces DR election'], correctIndex: 1, explanation: 'A passive interface is still advertised but sends no OSPF hellos (e.g. toward LAN hosts).', ckuIds: ['CKU-OSPF-NEIGHBOR'] },
    { id: '3.4-c-q9', concept: 'DR election', type: 'scenario', difficulty: 'medium', question: 'On a multi-access Ethernet segment, how is the DR elected?', choices: ['Lowest IP', 'Highest OSPF priority, then highest Router ID', 'Lowest MAC', 'First to boot only'], correctIndex: 1, explanation: 'Highest priority wins; ties break on highest Router ID. Priority 0 never becomes DR.', ckuIds: ['CKU-OSPF-NEIGHBOR'] },
  ],
  flashcards: [
    { id: '3.4-f1', ckuId: 'CKU-OSPF', front: 'OSPF type and AD?', back: 'Link-state IGP; administrative distance 110.' },
    { id: '3.4-f2', ckuId: 'CKU-OSPF-COST', front: 'OSPF cost formula?', back: 'Reference bandwidth (default 100 Mbps) ÷ interface bandwidth; lower cost wins.' },
    { id: '3.4-f3', ckuId: 'CKU-OSPF-NEIGHBOR', front: 'Router ID selection order?', back: 'Highest loopback IP → highest active interface IP → manual router-id.' },
    { id: '3.4-f4', ckuId: 'CKU-OSPF-NEIGHBOR', front: 'What must match to form an adjacency?', back: 'Area, subnet/mask, hello/dead timers, authentication.' },
    { id: '3.4-f5', ckuId: 'CKU-OSPF', front: 'Command to advertise a /24 into area 0?', back: 'network <addr> 0.0.0.255 area 0 (wildcard mask).' },
    { id: '3.4-f6', ckuId: 'CKU-OSPF-NEIGHBOR', front: 'Final neighbor state + verify command?', back: 'Full; show ip ospf neighbor.' },
  ],
  commands: [
    { id: '3.4-cmd1', command: 'router ospf <pid>', mode: 'global config', purpose: 'Enter OSPF configuration for a process.', example: 'R1(config)# router ospf 1', ckuIds: ['CKU-OSPF'] },
    { id: '3.4-cmd2', command: 'network <addr> <wildcard> area <id>', mode: 'router config', purpose: 'Advertise matching interfaces into an OSPF area.', example: 'R1(config-router)# network 10.0.0.0 0.0.0.255 area 0', ckuIds: ['CKU-OSPF'] },
    { id: '3.4-cmd3', command: 'show ip ospf neighbor', mode: 'privileged EXEC', purpose: 'Show OSPF neighbors and their adjacency state.', example: 'R1# show ip ospf neighbor', ckuIds: ['CKU-OSPF-NEIGHBOR'] },
  ],
  glossary: [
    { id: '3.4-g1', term: 'OSPF', definition: 'Open Shortest Path First — a link-state interior gateway protocol (AD 110).', ckuIds: ['CKU-OSPF'] },
    { id: '3.4-g2', term: 'LSA / LSDB', definition: 'Link-State Advertisement; the database of LSAs all routers in an area share.', ckuIds: ['CKU-OSPF'] },
    { id: '3.4-g3', term: 'OSPF cost', definition: 'Metric = reference bandwidth ÷ interface bandwidth; lower is preferred.', ckuIds: ['CKU-OSPF-COST'] },
    { id: '3.4-g4', term: 'Router ID', definition: 'A 32-bit ID for an OSPF router (highest loopback, else interface IP, or manual).', ckuIds: ['CKU-OSPF-NEIGHBOR'] },
    { id: '3.4-g5', term: 'DR/BDR', definition: 'Designated/Backup Designated Router that reduce LSA flooding on multi-access links.', ckuIds: ['CKU-OSPF-NEIGHBOR'] },
  ],
  mnemonics: [
    { id: '3.4-m1', title: 'Neighbor match', mnemonic: 'A-S-T-A: Area, Subnet, Timers, Auth.', explanation: 'Four things that must match to form an OSPF adjacency.', ckuIds: ['CKU-OSPF-NEIGHBOR'] },
    { id: '3.4-m2', title: 'Cost', mnemonic: 'Reference ÷ Bandwidth.', explanation: 'OSPF cost = reference bandwidth divided by interface bandwidth.', ckuIds: ['CKU-OSPF-COST'] },
  ],
  examTraps: [
    { id: '3.4-t1', trap: 'Using a subnet mask in the network statement.', correction: 'OSPF `network` uses a WILDCARD mask (0.0.0.255 for /24).', ckuIds: ['CKU-OSPF'] },
    { id: '3.4-t2', trap: 'Assuming 1G and 10G have different OSPF cost by default.', correction: 'Default reference bandwidth (100 Mbps) caps cost at 1, making them equal — raise the reference bandwidth.', ckuIds: ['CKU-OSPF-COST'] },
    { id: '3.4-t3', trap: 'Expecting DR/BDR on point-to-point links.', correction: 'DR/BDR are only elected on multi-access (e.g. Ethernet) segments.', ckuIds: ['CKU-OSPF-NEIGHBOR'] },
  ],
  misconceptions: [
    { id: '3.4-x1', misconception: 'OSPF uses hop count like RIP.', reality: 'OSPF uses cost (bandwidth-based), not hop count.', example: 'A 2-hop fast path can beat a 1-hop slow path.', ckuIds: ['CKU-OSPF-COST'] },
    { id: '3.4-x2', misconception: 'Higher OSPF cost is better.', reality: 'Lower cost is preferred — it represents a faster path.', example: 'A 1G link (cost 1 by default) beats a slower link.', ckuIds: ['CKU-OSPF-COST'] },
  ],
  diagram: {
    id: 'DIAG-3.4-ospf', title: 'OSPF picks the lowest-cost path', type: 'topology', ckuIds: ['CKU-OSPF', 'CKU-OSPF-COST'],
    nodes: [
      { id: 'r1', label: 'R1', type: 'router', x: 18, y: 50 },
      { id: 'r2', label: 'R2', type: 'router', x: 50, y: 18 },
      { id: 'r3', label: 'R3', type: 'router', x: 50, y: 82 },
      { id: 'dst', label: 'Dest', type: 'subnet', x: 82, y: 50, status: 'highlighted' },
    ],
    links: [
      { id: 'l1', source: 'r1', target: 'r2', label: 'cost 1', status: 'forwarding' }, { id: 'l2', source: 'r2', target: 'dst', label: 'cost 1', status: 'forwarding' },
      { id: 'l3', source: 'r1', target: 'r3', label: 'cost 10' }, { id: 'l4', source: 'r3', target: 'dst', label: 'cost 10' },
    ],
    annotations: ['Top path total cost = 2; bottom = 20.', 'OSPF installs the lowest-cost (top) path.'],
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'OSPF', confidence: 0.9 }],
  },
  packetFlow: {
    id: 'FLOW-3.4-adjacency', title: 'Forming an OSPF adjacency', ckuIds: ['CKU-OSPF-NEIGHBOR'], diagramId: 'DIAG-3.4-ospf',
    steps: [
      { id: 's1', order: 1, title: 'Hello', action: 'Routers send hellos; matching parameters reach 2-Way.', successState: 'matched' },
      { id: 's2', order: 2, title: 'Exchange', action: 'Neighbors exchange database descriptions (ExStart/Exchange).', successState: 'learned' },
      { id: 's3', order: 3, title: 'Loading', action: 'Each requests missing LSAs to sync the LSDB.', successState: 'learned' },
      { id: 's4', order: 4, title: 'Full', action: 'LSDBs match; adjacency is Full and SPF runs.', successState: 'matched' },
    ],
  },
}

/* -------------------------------------------------------------------------
   OBJECTIVE 4.1 — Configure and verify inside source NAT (static, pool, PAT)
   ------------------------------------------------------------------------- */
const OBJ_41 = {
  objectiveId: '4.1', domainId: 'services', title: 'Configure and verify inside source NAT using static and pools',
  ckus: [
    { id: 'CKU-NAT', title: 'NAT', summary: 'Network Address Translation maps private (inside local) IPs to public (inside global) IPs so internal hosts can reach the internet.', aliases: ['network address translation'], tags: ['nat', 'services'], prerequisiteCkuIds: ['CKU-PRIVATE-IPV4'], relatedCkuIds: ['CKU-PAT', 'CKU-NAT-TERMS'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'NAT', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '4.1', confidence: 1 }] },
    { id: 'CKU-PAT', title: 'PAT (NAT Overload)', summary: 'Maps many inside addresses to ONE public IP using different source port numbers — the common home/SOHO method.', aliases: ['overload', 'port address translation'], tags: ['nat', 'pat'], prerequisiteCkuIds: ['CKU-NAT'], relatedCkuIds: ['CKU-NAT'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'PAT', confidence: 0.9 }] },
    { id: 'CKU-NAT-TERMS', title: 'NAT Inside/Outside Terminology', summary: 'Inside local = private host IP; inside global = its translated public IP; outside global = the public destination. Mark interfaces `ip nat inside`/`outside`.', aliases: ['inside local', 'inside global'], tags: ['nat'], prerequisiteCkuIds: ['CKU-NAT'], relatedCkuIds: ['CKU-NAT'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'NAT terms', confidence: 0.9 }] },
  ],
  reading: {
    id: 'READ-4.1', ckuIds: ['CKU-NAT', 'CKU-PAT', 'CKU-NAT-TERMS'], estimatedReadMinutes: 7,
    tiers: {
      beginner: 'Private IP addresses (like 192.168.x.x) can’t travel on the internet, so a router swaps them for a public address on the way out — that’s NAT. At home, one public address is shared by every device using different port numbers; that flavor is called PAT (or “overload”). The router remembers each translation so replies come back to the right device.',
      intermediate: 'NAT translates inside local (private) addresses to inside global (public) addresses. Static NAT is a fixed one-to-one mapping (for servers); dynamic NAT draws from a pool of public addresses; PAT (overload) maps many private hosts to one public IP using unique source ports — the typical SOHO setup. You mark the internal interface `ip nat inside` and the internet-facing one `ip nat outside`, then define what to translate (often an ACL). Verify with `show ip nat translations`.',
      examReady: 'NAT maps inside local ↔ inside global. Types: Static (`ip nat inside source static <local> <global>` — permanent 1:1, for servers); Dynamic (`ip nat pool` + `ip nat inside source list <ACL> pool <name>`); PAT/overload (`ip nat inside source list <ACL> interface <if> overload` — many-to-one via ports). Mark interfaces `ip nat inside` / `ip nat outside`. Terms: inside local (private host), inside global (its public mapping), outside local/global (the destination). Verify: `show ip nat translations`, `show ip nat statistics`.',
    },
    definition: '**NAT** maps private **inside local** IPs to public **inside global** IPs. **PAT (overload)** shares one public IP across many hosts using ports. Interfaces are marked `ip nat inside` / `ip nat outside`.',
    keyPoints: [
      'Static NAT = permanent 1:1 (servers): `ip nat inside source static <local> <global>`.',
      'Dynamic NAT = pool of public addresses.',
      'PAT/overload = many→one via source ports (home/SOHO).',
      'Mark interfaces `ip nat inside` and `ip nat outside`.',
      'Inside local = private host; inside global = its public address.',
      'Verify: `show ip nat translations`, `show ip nat statistics`.',
    ],
    realWorld: 'A home router uses PAT so dozens of devices share one ISP address. A web server uses static NAT so it always has the same public IP. Forgetting the `inside`/`outside` interface tags is the #1 reason NAT “does nothing.”',
    commonMistakes: [
      'Not marking interfaces `ip nat inside`/`outside`.',
      'ACL doesn’t match the intended inside hosts.',
      'Expecting static NAT to overload (it’s 1:1).',
      'Confusing inside local with inside global.',
    ],
    related: ['1.7 Private IPv4', '5.5 ACLs (define NAT traffic)'],
    advanced: 'PAT tracks translations by the tuple of inside global IP + port, allowing ~65k simultaneous sessions per public IP. NAT breaks end-to-end addressing, which is one reason IPv6 (with its huge space) avoids it.',
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'NAT', confidence: 0.95 }],
  },
  questions: [
    { id: '4.1-c-q1', concept: 'nat purpose', type: 'definition', difficulty: 'easy', question: 'What does NAT primarily do?', choices: ['Encrypts traffic', 'Maps private IPs to public IPs', 'Routes between VLANs', 'Assigns DHCP addresses'], correctIndex: 1, explanation: 'NAT maps inside local (private) to inside global (public) addresses.', ckuIds: ['CKU-NAT'] },
    { id: '4.1-c-q2', concept: 'pat', type: 'scenario', difficulty: 'medium', question: 'Many home devices share a single public IP. Which NAT type is this?', choices: ['Static NAT', 'Dynamic NAT', 'PAT (overload)', 'No NAT'], correctIndex: 2, explanation: 'PAT/overload maps many inside hosts to one public IP using ports.', ckuIds: ['CKU-PAT'] },
    { id: '4.1-c-q3', concept: 'static nat', type: 'application', difficulty: 'medium', question: 'Which command creates a permanent 1:1 mapping for a server?', choices: ['ip nat inside source static 192.168.1.10 203.0.113.10', 'ip nat pool', 'ip nat inside source list 1 interface g0/0 overload', 'ip nat outside'], correctIndex: 0, explanation: 'Static NAT uses `ip nat inside source static <local> <global>`.', ckuIds: ['CKU-NAT'] },
    { id: '4.1-c-q4', concept: 'interface tags', type: 'troubleshooting', difficulty: 'hard', question: 'NAT is configured but nothing is translated. What is most often missing?', choices: ['A default route', 'The ip nat inside / ip nat outside interface tags', 'A loopback', 'DNS'], correctIndex: 1, explanation: 'Interfaces must be marked `ip nat inside` and `ip nat outside`.', ckuIds: ['CKU-NAT-TERMS'] },
    { id: '4.1-c-q5', concept: 'overload command', type: 'application', difficulty: 'hard', question: 'Which command configures PAT to the outside interface?', choices: ['ip nat inside source list 1 interface g0/0 overload', 'ip nat inside source static', 'ip nat pool MYPOOL', 'ip nat outside source list 1'], correctIndex: 0, explanation: 'PAT: `ip nat inside source list <ACL> interface <if> overload`.', ckuIds: ['CKU-PAT'] },
    { id: '4.1-c-q6', concept: 'terminology', type: 'definition', difficulty: 'medium', question: 'A host’s private address as seen inside the network is called its…', choices: ['Inside global', 'Inside local', 'Outside global', 'Outside local'], correctIndex: 1, explanation: 'Inside local = the private address of an inside host.', ckuIds: ['CKU-NAT-TERMS'] },
    { id: '4.1-c-q7', concept: 'verify', type: 'application', difficulty: 'easy', question: 'Which command shows active NAT translations?', choices: ['show ip route', 'show ip nat translations', 'show running-config', 'show ip nat inside'], correctIndex: 1, explanation: '`show ip nat translations` lists the current mappings.', ckuIds: ['CKU-NAT'] },
    { id: '4.1-c-q8', concept: 'pat ports', type: 'true-false', difficulty: 'medium', question: 'True or False: PAT distinguishes multiple inside hosts behind one public IP using port numbers.', choices: ['True', 'False'], correctIndex: 0, explanation: 'True — PAT tracks translations by inside global IP + port.', ckuIds: ['CKU-PAT'] },
    { id: '4.1-q1', concept: 'nat', type: 'scenario', difficulty: 'easy', question: 'Which method will allow you to use RFC 1918 addresses for Internet requests?', choices: ['CIDR', 'Classful addressing', 'NAT', 'VPN'], correctIndex: 2, explanation: 'The source maps this item to answer C. The correct selection is: NAT', ckuIds: ['CKU-NAT'] },
    { id: '4.1-q2', concept: 'nat', type: 'application', difficulty: 'hard', question: 'Using the referenced source exhibit, what is the inside local IP address?', choices: ['192.168.1.2 Host A', '192.168.1.1 Router A Gi0/0', '179.43.44.1 Router A S0/0', '198.23.53.3 web server'], correctIndex: 0, explanation: 'The source maps this item to answer A. The correct selection is: 192.168.1.2 Host A', ckuIds: ['CKU-NAT'] },
    { id: '4.1-q3', concept: 'nat', type: 'application', difficulty: 'hard', question: 'Using the referenced source exhibit, what is the inside global IP address?', choices: ['192.168.1.2 Host A', '192.168.1.1 Router A Gi0/0', '179.43.44.1 Router A S0/0', '198.23.53.3 web server'], correctIndex: 2, explanation: 'The source maps this item to answer C. The correct selection is: 179.43.44.1 Router A S0/0', ckuIds: ['CKU-NAT'] },
    { id: '4.1-q4', concept: 'nat', type: 'application', difficulty: 'hard', question: 'Using the referenced source exhibit, what is the outside global IP address?', choices: ['192.168.1.2 Host A', '192.168.1.1 Router A Gi0/0', '179.43.44.1 Router A S0/0', '198.23.53.3 web server'], correctIndex: 3, explanation: 'The source maps this item to answer D. The correct selection is: 198.23.53.3 web server', ckuIds: ['CKU-NAT'] },
    { id: '4.1-q5', concept: 'nat', type: 'application', difficulty: 'medium', question: 'Which command can view the NAT translations active on the router?', choices: ['Router#show ip nat translations', 'Router#show nat translations', 'Router#debug ip nat translations', 'Router#show translations nat'], correctIndex: 0, explanation: 'The source maps this item to answer A. The correct selection is: Router#show ip nat translations', ckuIds: ['CKU-NAT'] },
    { id: '4.1-q6', concept: 'nat', type: 'application', difficulty: 'medium', question: 'Which command display an overview of the current number of active NAT translations on the router, as well as other overview information?', choices: ['Router#show ip nat translations', 'Router#show ip nat summary', 'Router#show ip nat status', 'Router#show ip nat statistics'], correctIndex: 3, explanation: 'The source maps this item to answer D. The correct selection is: Router#show ip nat statistics', ckuIds: ['CKU-NAT'] },
    { id: '4.1-q7', concept: 'nat', type: 'application', difficulty: 'hard', question: 'Using the referenced source exhibit, which command will configure static NAT for the internal web server?', choices: ['RouterA(config)#ip nat inside source static 192.168.1.3 179.43.44.1', 'RouterA(config)#nat source static 192.168.1.3 179.43.44.1', 'RouterA(config)#ip nat static 192.168.1.3 179.43.44.1', 'RouterA(config)#ip nat source static 192.168.1.3 179.43.44.1'], correctIndex: 0, explanation: 'The source maps this item to answer A. The correct selection is: RouterA(config)#ip nat inside source static 192.168.1.3 179.43.44.1', ckuIds: ['CKU-NAT'] },
    { id: '4.1-q8', concept: 'nat', type: 'application', difficulty: 'hard', question: 'Using the referenced source exhibit, the enterprise owns the address block of 179.43.44.0/28. Which command create a NAT pool for Dynamic NAT?', choices: ['RouterA(config)#ip nat pool EntPool 179.43.44.0/28', 'RouterA(config)#ip pool EntPool 179.43.44.2 179.43.44.15 netmask 255.255.255.0', 'RouterA(config)#ip nat pool EntPool 179.43.44.1 179.43.44.15 netmask 255.255.255.240', 'RouterA(config)#ip nat pool EntPool 179.43.44.2 179.43.44.15 netmask 255.255.255.0'], correctIndex: 3, explanation: 'The source maps this item to answer D. The correct selection is: RouterA(config)#ip nat pool EntPool 179.43.44.2 179.43.44.15 netmask 255.255.255.0', ckuIds: ['CKU-NAT'] },
    { id: '4.1-q9', concept: 'nat', type: 'scenario', difficulty: 'medium', question: 'When configuring dynamic NAT, why must you configure an access list?', choices: ['The access list allows incoming access from outside global addresses.', 'The access list allows outgoing access from inside local addresses.', 'The access list allows outgoing access from outside local addresses.', 'The access list allows outgoing access from inside global addresses.'], correctIndex: 1, explanation: 'The source maps this item to answer B. The correct selection is: The access list allows outgoing access from inside local addresses.', ckuIds: ['CKU-NAT'] },
    { id: '4.1-q10', concept: 'nat', type: 'application', difficulty: 'medium', question: 'Which command wipe out all current NAT translations in the NAT table?', choices: ['Router#no ip nat translation', 'Router#clear ip nat translation', 'Router#clear ip nat translation *', 'Router#clear ip nat'], correctIndex: 2, explanation: 'The source maps this item to answer C. The correct selection is: Router#clear ip nat translation *', ckuIds: ['CKU-NAT'] },
    { id: '4.1-q11', concept: 'nat', type: 'application', difficulty: 'medium', question: 'Which command can see real-time network address translations?', choices: ['Router#show ip translations', 'Router#debug ip nat', 'Router#debug ip translations', 'Router#show ip nat'], correctIndex: 1, explanation: 'The source maps this item to answer B. The correct selection is: Router#debug ip nat', ckuIds: ['CKU-NAT'] },
    { id: '4.1-q12', concept: 'nat', type: 'application', difficulty: 'hard', question: 'Using the referenced source exhibit, which command will configure Port Address Translation?', choices: ['RouterA(config)#access-list 1 permit 192.168.1.0 0.0.0.255 RouterA(config)#ip nat pool EntPool 179.43.44.1 179.43.44.1 RouterA(config)#ip nat inside source list 1 pool EntPool', 'RouterA(config)#ip nat pool EntPool 179.43.44.1 179.43.44.1 netmask 255.255.255.0 RouterA(config)#ip nat source pool EntPool', 'RouterA(config)#access-list 1 permit 192.168.1.0 0.0.0.255 RouterA(config)#ip nat pool EntPool 179.43.44.1 179.43.44.1 netmask 255.255.255.0 RouterA(config)#ip nat inside source list 1 pool EntPool overload', 'RouterA(config)#access-list 1 permit 192.168.1.0 0.0.0.255 RouterA(config)#ip nat pool EntPool 179.43.44.1 179.43.44.1 netmask 255.255.255.0 RouterA(config)#ip nat inside source list 1 pool EntPool'], correctIndex: 2, explanation: 'The source maps this item to answer C. The correct selection is: RouterA(config)#access-list 1 permit 192.168.1.0 0.0.0.255 RouterA(config)#ip nat pool EntPool 179.43.44.1 179.43.44.1 netmask 255.255.255.0 RouterA(config)#ip nat inside source list 1 pool EntPool...', ckuIds: ['CKU-NAT', 'CKU-PAT'] },
  ],
  flashcards: [
    { id: '4.1-f1', ckuId: 'CKU-NAT', front: 'What does NAT map?', back: 'Inside local (private) ↔ inside global (public) addresses.' },
    { id: '4.1-f2', ckuId: 'CKU-PAT', front: 'What is PAT / overload?', back: 'Many inside hosts → one public IP using unique source ports.' },
    { id: '4.1-f3', ckuId: 'CKU-NAT', front: 'Static NAT command?', back: 'ip nat inside source static <local> <global>.' },
    { id: '4.1-f4', ckuId: 'CKU-PAT', front: 'PAT command to the outside interface?', back: 'ip nat inside source list <ACL> interface <if> overload.' },
    { id: '4.1-f5', ckuId: 'CKU-NAT-TERMS', front: 'Interface tags for NAT?', back: 'ip nat inside (private side) and ip nat outside (public side).' },
    { id: '4.1-f6', ckuId: 'CKU-NAT', front: 'Verify NAT commands?', back: 'show ip nat translations; show ip nat statistics.' },
  ],
  commands: [
    { id: '4.1-cmd1', command: 'ip nat inside source static <local> <global>', mode: 'global config', purpose: 'Create a permanent one-to-one NAT mapping.', example: 'R1(config)# ip nat inside source static 192.168.1.10 203.0.113.10', ckuIds: ['CKU-NAT'] },
    { id: '4.1-cmd2', command: 'ip nat inside source list <acl> interface <if> overload', mode: 'global config', purpose: 'Configure PAT (overload) to the outside interface.', example: 'R1(config)# ip nat inside source list 1 interface g0/0 overload', ckuIds: ['CKU-PAT'] },
    { id: '4.1-cmd3', command: 'show ip nat translations', mode: 'privileged EXEC', purpose: 'Display current NAT translations.', example: 'R1# show ip nat translations', ckuIds: ['CKU-NAT'] },
  ],
  glossary: [
    { id: '4.1-g1', term: 'NAT', definition: 'Network Address Translation — maps private to public IP addresses.', ckuIds: ['CKU-NAT'] },
    { id: '4.1-g2', term: 'PAT', definition: 'Port Address Translation (NAT overload) — many hosts share one public IP via ports.', ckuIds: ['CKU-PAT'] },
    { id: '4.1-g3', term: 'Inside local', definition: 'The private IP of an inside host.', ckuIds: ['CKU-NAT-TERMS'] },
    { id: '4.1-g4', term: 'Inside global', definition: 'The public IP an inside host is translated to.', ckuIds: ['CKU-NAT-TERMS'] },
  ],
  mnemonics: [
    { id: '4.1-m1', title: 'Overload = ports', mnemonic: 'Overload shares one IP with many ports.', explanation: 'PAT multiplexes hosts behind one public IP using source ports.', ckuIds: ['CKU-PAT'] },
  ],
  examTraps: [
    { id: '4.1-t1', trap: 'Forgetting the inside/outside interface tags.', correction: 'Without `ip nat inside`/`outside`, NAT translates nothing.', ckuIds: ['CKU-NAT-TERMS'] },
    { id: '4.1-t2', trap: 'Mixing up inside local and inside global.', correction: 'Inside local = private host; inside global = its public mapping.', ckuIds: ['CKU-NAT-TERMS'] },
    { id: '4.1-t3', trap: 'Expecting static NAT to serve many hosts.', correction: 'Static NAT is 1:1; use PAT/overload for many-to-one.', ckuIds: ['CKU-NAT'] },
  ],
  misconceptions: [
    { id: '4.1-x1', misconception: 'NAT provides security/encryption.', reality: 'NAT hides addresses but does not encrypt; it is not a security control by itself.', example: 'Traffic is still cleartext after translation.', ckuIds: ['CKU-NAT'] },
    { id: '4.1-x2', misconception: 'Every inside host needs its own public IP.', reality: 'PAT lets thousands of hosts share one public IP via ports.', example: 'A home network uses a single ISP address.', ckuIds: ['CKU-PAT'] },
  ],
  diagram: {
    id: 'DIAG-4.1-pat', title: 'PAT shares one public IP', type: 'topology', ckuIds: ['CKU-PAT', 'CKU-NAT-TERMS'],
    nodes: [
      { id: 'h1', label: '192.168.1.10', type: 'pc', x: 16, y: 28 },
      { id: 'h2', label: '192.168.1.11', type: 'pc', x: 16, y: 72 },
      { id: 'r', label: 'R1 NAT (overload)', type: 'router', x: 52, y: 50 },
      { id: 'net', label: '203.0.113.1 → Internet', type: 'cloud', x: 85, y: 50, status: 'highlighted' },
    ],
    links: [
      { id: 'l1', source: 'h1', target: 'r', label: ':1025' }, { id: 'l2', source: 'h2', target: 'r', label: ':1026' }, { id: 'l3', source: 'r', target: 'net', label: 'one public IP', status: 'forwarding' },
    ],
    annotations: ['Both hosts share 203.0.113.1, distinguished by source port.', 'Inside local → inside global translation tracked per port.'],
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'PAT', confidence: 0.9 }],
  },
  packetFlow: {
    id: 'FLOW-4.1-pat', title: 'PAT translation', ckuIds: ['CKU-PAT'], diagramId: 'DIAG-4.1-pat',
    steps: [
      { id: 's1', order: 1, title: 'Packet out', action: 'Inside host sends to the internet with its private source IP.', successState: 'forwarded' },
      { id: 's2', order: 2, title: 'Translate', action: 'Router rewrites the source to the public IP + a unique port; records the mapping.', successState: 'modified' },
      { id: 's3', order: 3, title: 'Reply', action: 'Return traffic hits the public IP + port.', successState: 'matched' },
      { id: 's4', order: 4, title: 'Reverse', action: 'Router maps it back to the original inside host.', successState: 'forwarded' },
    ],
  },
}

/* -------------------------------------------------------------------------
   OBJECTIVE 5.5 — Configure and verify Layer 2/3 access control lists
   ------------------------------------------------------------------------- */
const OBJ_55 = {
  objectiveId: '5.5', domainId: 'security', title: 'Configure and verify access control lists',
  ckus: [
    { id: 'CKU-ACL', title: 'Access Control Lists', summary: 'Ordered rules that permit/deny traffic by criteria. Processed top-down, first match wins, with an implicit deny-all at the end.', aliases: ['ACL', 'access-list'], tags: ['acl', 'security', 'filtering'], prerequisiteCkuIds: ['CKU-WILDCARD-MASK'], relatedCkuIds: ['CKU-ACL-STANDARD', 'CKU-ACL-EXTENDED'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'ACLs', confidence: 0.95 }, { sourceName: CURATED_SOURCES.blueprint, chapter: '5.5', confidence: 1 }] },
    { id: 'CKU-ACL-STANDARD', title: 'Standard ACL', summary: 'Matches SOURCE IP only (numbered 1–99/1300–1999). Place close to the destination.', aliases: ['standard access-list'], tags: ['acl'], prerequisiteCkuIds: ['CKU-ACL'], relatedCkuIds: ['CKU-ACL-EXTENDED'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Standard ACL', confidence: 0.9 }] },
    { id: 'CKU-ACL-EXTENDED', title: 'Extended ACL', summary: 'Matches source + destination IP, protocol, and ports (numbered 100–199/2000–2699 or named). Place close to the source.', aliases: ['extended access-list'], tags: ['acl'], prerequisiteCkuIds: ['CKU-ACL'], relatedCkuIds: ['CKU-ACL-STANDARD'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Extended ACL', confidence: 0.9 }] },
    { id: 'CKU-WILDCARD-MASK', title: 'Wildcard Mask', summary: 'The inverse of a subnet mask used in ACLs: 0 = must match, 1 = don’t care. /24 → 0.0.0.255.', aliases: ['inverse mask'], tags: ['acl', 'wildcard'], prerequisiteCkuIds: [], relatedCkuIds: ['CKU-ACL'],
      sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'Wildcard masks', confidence: 0.9 }] },
  ],
  reading: {
    id: 'READ-5.5', ckuIds: ['CKU-ACL', 'CKU-ACL-STANDARD', 'CKU-ACL-EXTENDED', 'CKU-WILDCARD-MASK'], estimatedReadMinutes: 8,
    tiers: {
      beginner: 'An ACL is a list of permit/deny rules a router checks against traffic. It reads the list top to bottom and stops at the first rule that matches. Anything not matched is denied by a hidden rule at the end. Standard ACLs only look at WHERE traffic came from; extended ACLs can also look at where it’s going and which application (port).',
      intermediate: 'ACLs filter traffic by criteria, processed top-down with first-match-wins and an implicit `deny any` at the end. Standard ACLs (1–99/1300–1999) match source IP only — place them close to the destination. Extended ACLs (100–199/2000–2699 or named) match source/destination IP, protocol, and ports — place them close to the source to drop unwanted traffic early. ACLs use wildcard masks (inverse of subnet masks: 0 = match, 1 = ignore). Apply to an interface with `ip access-group <name|number> in|out`.',
      examReady: 'ACL = ordered permit/deny rules; top-down, first match wins, implicit `deny any` at the end (so an all-deny ACL blocks everything). Standard (1–99/1300–1999): source IP only → place near the DESTINATION. Extended (100–199/2000–2699 / named): source+dest IP, protocol, ports → place near the SOURCE. Wildcard mask = inverse subnet mask (0 match / 1 don’t-care; host = 0.0.0.0, any = 255.255.255.255). Apply: `ip access-group 100 in` on an interface. Named ACLs allow editing by sequence number. Verify: `show access-lists`, `show ip interface`.',
    },
    definition: 'An **ACL** is an ordered list of permit/deny rules: **top-down, first match wins**, with an **implicit deny-all** at the end. **Standard** = source only (place near destination); **Extended** = source/dest/protocol/ports (place near source). ACLs use **wildcard masks**.',
    keyPoints: [
      'Top-down, first-match-wins, implicit `deny any` at the end.',
      'Standard (1–99): source IP only → place near the destination.',
      'Extended (100–199): src/dst IP, protocol, ports → place near the source.',
      'Wildcard mask = inverse subnet mask (`0`=match, `1`=ignore).',
      'Apply: `ip access-group <name|num> in|out` on an interface.',
      'Host = `0.0.0.0`; any = `255.255.255.255` (or the keyword `any`).',
    ],
    realWorld: 'Because of the implicit deny, an ACL with only `permit` lines silently blocks everything else — always confirm needed traffic is permitted. Named ACLs let you insert/remove a single line by sequence number without rewriting the whole list.',
    commonMistakes: [
      'Forgetting the implicit `deny any` at the end.',
      'Placing an extended ACL far from the source (wastes bandwidth).',
      'Using a subnet mask instead of a wildcard mask.',
      'Wrong rule order — a broad permit above a specific deny is never reached.',
    ],
    related: ['1.6 Subnetting (wildcards)', '4.1 NAT (ACL defines traffic)', '5.3 Device access (vty access-class)'],
    advanced: 'Apply an ACL to vty lines with `access-class` to restrict management access. Extended ACLs can match TCP flags (e.g. `established`). Order matters: most-specific rules first.',
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'ACLs', confidence: 0.95 }],
  },
  questions: [
    { id: '5.5-c-q1', concept: 'processing order', type: 'definition', difficulty: 'easy', question: 'How are ACL entries processed?', choices: ['Bottom-up', 'Top-down, first match wins', 'Most-specific first automatically', 'Randomly'], correctIndex: 1, explanation: 'ACLs are read top-down and stop at the first match.', ckuIds: ['CKU-ACL'] },
    { id: '5.5-c-q2', concept: 'implicit deny', type: 'true-false', difficulty: 'easy', question: 'True or False: An ACL has an implicit deny-all at the end.', choices: ['True', 'False'], correctIndex: 0, explanation: 'True — anything not explicitly permitted is denied.', ckuIds: ['CKU-ACL'] },
    { id: '5.5-c-q3', concept: 'standard placement', type: 'application', difficulty: 'medium', question: 'Where should a standard ACL be placed?', choices: ['Close to the source', 'Close to the destination', 'On every interface', 'Only on trunks'], correctIndex: 1, explanation: 'Standard ACLs match source only, so place them near the destination to avoid over-blocking.', ckuIds: ['CKU-ACL-STANDARD'] },
    { id: '5.5-c-q4', concept: 'extended placement', type: 'application', difficulty: 'medium', question: 'Where should an extended ACL be placed?', choices: ['Close to the source', 'Close to the destination', 'On the root bridge', 'On the DHCP server'], correctIndex: 0, explanation: 'Extended ACLs are specific, so place near the source to drop traffic early.', ckuIds: ['CKU-ACL-EXTENDED'] },
    { id: '5.5-c-q5', concept: 'wildcard mask', type: 'application', difficulty: 'hard', question: 'What wildcard mask matches exactly the /24 network 192.168.1.0?', choices: ['255.255.255.0', '0.0.0.255', '0.0.0.0', '255.255.255.255'], correctIndex: 1, explanation: 'Wildcard = inverse subnet mask; /24 → 0.0.0.255.', ckuIds: ['CKU-WILDCARD-MASK'] },
    { id: '5.5-c-q6', concept: 'standard range', type: 'definition', difficulty: 'medium', question: 'Which number range is a standard ACL?', choices: ['1–99', '100–199', '200–299', '1300–2699 only'], correctIndex: 0, explanation: 'Standard ACLs are 1–99 (and 1300–1999).', ckuIds: ['CKU-ACL-STANDARD'] },
    { id: '5.5-c-q7', concept: 'extended match', type: 'definition', difficulty: 'medium', question: 'What can an extended ACL match that a standard ACL cannot?', choices: ['Source IP', 'Destination IP, protocol, and port', 'Interface name', 'VLAN ID'], correctIndex: 1, explanation: 'Extended ACLs match source+destination IP, protocol, and ports.', ckuIds: ['CKU-ACL-EXTENDED'] },
    { id: '5.5-c-q8', concept: 'apply acl', type: 'application', difficulty: 'medium', question: 'Which command applies ACL 100 inbound on an interface?', choices: ['access-list 100 in', 'ip access-group 100 in', 'ip access-list 100 inbound', 'apply acl 100 in'], correctIndex: 1, explanation: '`ip access-group 100 in` applies the ACL to the interface.', ckuIds: ['CKU-ACL'] },
    { id: '5.5-c-q9', concept: 'order matters', type: 'troubleshooting', difficulty: 'hard', question: 'A specific `deny` never takes effect because a broad `permit` sits above it. Why?', choices: ['ACLs ignore deny rules', 'First match wins — the permit matches first', 'Deny rules need a wildcard', 'The ACL is not applied'], correctIndex: 1, explanation: 'Top-down first-match means the earlier broad permit matches before the specific deny.', ckuIds: ['CKU-ACL'] },
  ],
  flashcards: [
    { id: '5.5-f1', ckuId: 'CKU-ACL', front: 'How are ACLs processed?', back: 'Top-down, first match wins, with an implicit deny-all at the end.' },
    { id: '5.5-f2', ckuId: 'CKU-ACL-STANDARD', front: 'Standard ACL: matches what, placed where?', back: 'Source IP only; place near the destination. Numbers 1–99/1300–1999.' },
    { id: '5.5-f3', ckuId: 'CKU-ACL-EXTENDED', front: 'Extended ACL: matches what, placed where?', back: 'Src/dst IP, protocol, ports; place near the source. Numbers 100–199/2000–2699.' },
    { id: '5.5-f4', ckuId: 'CKU-WILDCARD-MASK', front: 'What is a wildcard mask?', back: 'Inverse subnet mask: 0 = must match, 1 = don’t care. /24 → 0.0.0.255.' },
    { id: '5.5-f5', ckuId: 'CKU-ACL', front: 'Command to apply an ACL to an interface?', back: 'ip access-group <name|number> in|out.' },
    { id: '5.5-f6', ckuId: 'CKU-WILDCARD-MASK', front: 'Wildcard for a single host? For any?', back: 'Host = 0.0.0.0; any = 255.255.255.255 (or keyword any).' },
  ],
  commands: [
    { id: '5.5-cmd1', command: 'access-list <1-99> permit <src> <wildcard>', mode: 'global config', purpose: 'Create a numbered standard ACL entry (source only).', example: 'R1(config)# access-list 10 permit 192.168.1.0 0.0.0.255', ckuIds: ['CKU-ACL-STANDARD'] },
    { id: '5.5-cmd2', command: 'ip access-group <name|num> in|out', mode: 'interface config', purpose: 'Apply an ACL to an interface in a direction.', example: 'R1(config-if)# ip access-group 100 in', ckuIds: ['CKU-ACL'] },
    { id: '5.5-cmd3', command: 'show access-lists', mode: 'privileged EXEC', purpose: 'Display ACLs with hit counts.', example: 'R1# show access-lists', ckuIds: ['CKU-ACL'] },
  ],
  glossary: [
    { id: '5.5-g1', term: 'ACL', definition: 'Access Control List — ordered permit/deny rules for filtering traffic.', ckuIds: ['CKU-ACL'] },
    { id: '5.5-g2', term: 'Standard ACL', definition: 'Matches source IP only; placed near the destination.', ckuIds: ['CKU-ACL-STANDARD'] },
    { id: '5.5-g3', term: 'Extended ACL', definition: 'Matches src/dst IP, protocol, and ports; placed near the source.', ckuIds: ['CKU-ACL-EXTENDED'] },
    { id: '5.5-g4', term: 'Wildcard mask', definition: 'Inverse subnet mask used in ACLs (0 = match, 1 = ignore).', ckuIds: ['CKU-WILDCARD-MASK'] },
    { id: '5.5-g5', term: 'Implicit deny', definition: 'The unseen deny-all rule at the end of every ACL.', ckuIds: ['CKU-ACL'] },
  ],
  mnemonics: [
    { id: '5.5-m1', title: 'Placement', mnemonic: 'Standard = near Destination; Extended = near Source.', explanation: 'Standard/destination and Extended/source — place each where it limits damage.', ckuIds: ['CKU-ACL-STANDARD', 'CKU-ACL-EXTENDED'] },
    { id: '5.5-m2', title: 'Wildcard', mnemonic: '0 = match, 1 = ignore.', explanation: 'Opposite of a subnet mask.', ckuIds: ['CKU-WILDCARD-MASK'] },
  ],
  examTraps: [
    { id: '5.5-t1', trap: 'Forgetting the implicit deny.', correction: 'An ACL with only permits blocks everything else via the implicit deny any.', ckuIds: ['CKU-ACL'] },
    { id: '5.5-t2', trap: 'Using a subnet mask in an ACL.', correction: 'ACLs use WILDCARD masks (inverse): /24 → 0.0.0.255.', ckuIds: ['CKU-WILDCARD-MASK'] },
    { id: '5.5-t3', trap: 'Misordering rules.', correction: 'First match wins — put specific rules before broad ones.', ckuIds: ['CKU-ACL'] },
    { id: '5.5-t4', trap: 'Placing extended ACLs near the destination.', correction: 'Place extended ACLs near the source to drop traffic early.', ckuIds: ['CKU-ACL-EXTENDED'] },
  ],
  misconceptions: [
    { id: '5.5-x1', misconception: 'ACLs encrypt or deeply inspect traffic.', reality: 'ACLs filter by header fields (IP/protocol/port); they are not encryption or stateful firewalls.', example: 'An ACL permits TCP/443 but does not inspect the TLS payload.', ckuIds: ['CKU-ACL'] },
    { id: '5.5-x2', misconception: 'Rule order doesn’t matter.', reality: 'Order is critical — the first matching rule wins and the rest are skipped.', example: 'A broad permit above a specific deny makes the deny dead.', ckuIds: ['CKU-ACL'] },
  ],
  diagram: {
    id: 'DIAG-5.5-acl', title: 'ACL first-match processing', type: 'process', ckuIds: ['CKU-ACL'],
    nodes: [
      { id: 'pkt', label: 'Packet', type: 'process', x: 50, y: 10 },
      { id: 'r1', label: 'Rule 1 match?', type: 'process', x: 50, y: 38 },
      { id: 'permit', label: 'Permit/Deny (stop)', type: 'router', x: 22, y: 70, status: 'highlighted' },
      { id: 'deny', label: 'Implicit deny any', type: 'process', x: 78, y: 70, status: 'error' },
    ],
    links: [
      { id: 'l1', source: 'pkt', target: 'r1' }, { id: 'l2', source: 'r1', target: 'permit', label: 'match', status: 'forwarding' }, { id: 'l3', source: 'r1', target: 'deny', label: 'no match → end', status: 'dropped' },
    ],
    annotations: ['First matching rule decides and processing stops.', 'No match anywhere → implicit deny any.'],
    sourceRefs: [{ sourceName: CURATED_SOURCES.jeremy, chapter: 'ACLs', confidence: 0.9 }],
  },
  packetFlow: {
    id: 'FLOW-5.5-acl', title: 'Evaluating a packet against an ACL', ckuIds: ['CKU-ACL'], diagramId: 'DIAG-5.5-acl',
    steps: [
      { id: 's1', order: 1, title: 'Top of list', action: 'Start at the first ACL entry.', successState: 'matched' },
      { id: 's2', order: 2, title: 'Compare', action: 'Check the packet against the entry’s criteria.', successState: 'matched' },
      { id: 's3', order: 3, title: 'First match', action: 'On a match, apply permit/deny and STOP.', successState: 'matched' },
      { id: 's4', order: 4, title: 'Implicit deny', action: 'If no entry matched, the implicit deny any drops it.', successState: 'dropped' },
    ],
  },
}

/* -------------------------------------------------------------------------
   SUPPLEMENTAL — Multi-area OSPF (out of CCNA 200-301 v1.1 single-area scope;
   shelved from QB 3.4 import per PROJECT_LOG item 6 Theme A / item 8.)
   ------------------------------------------------------------------------- */
const SUPP_OSPF_MULTIAREA = {
  objectiveId: 'supp-ospf-multiarea',
  domainId: 'connectivity',
  title: 'Multi-area OSPF (beyond CCNA single-area scope)',
  shelvedReason: 'CCNA 200-301 v1.1 objective 3.4 covers single-area OSPFv2 only. These 12 QB questions are about ABRs, area 0, and hierarchical multi-area design — held for a possible future objective, not served under app 3.4.',
  sourceQbObjectiveId: '3.4',
  questions: SUPPLEMENTAL_QUESTIONS['supp-ospf-multiarea'] || [],
}

/* -------------------------------------------------------------------------
   REGISTRY + LOADER
   ------------------------------------------------------------------------- */
export const SUPPLEMENTAL = {
  [SUPP_TCPUDP.objectiveId]: SUPP_TCPUDP,
  [SUPP_OSPF_MULTIAREA.objectiveId]: SUPP_OSPF_MULTIAREA,
}

/* =========================================================================
   OBJECTIVE 3.1 — Interpret the components of a routing table
   ========================================================================= */
const OBJ_31 = {
  objectiveId: '3.1',
  domainId: 'connectivity',
  title: 'Interpret the components of a routing table',
  ckus: [
    { id: 'CKU-ROUTING-TABLE-ENTRY', title: 'Routing Table Entry Structure', summary: 'Each entry shows: source code (C/S/O/D/R/B), destination prefix, [AD/metric] in brackets, next-hop IP, outgoing interface, and age timer for dynamic routes.', aliases: ['routing entry'], tags: ['routing', 'routing-table'], sourceRefs: [{ sourceName: 'Cisco CCNA 200-301 v1.1 Exam Topics', chapter: '3.1', confidence: 1 }] },
    { id: 'CKU-ROUTE-SOURCE-CODES', title: 'Route Source Codes', summary: 'C=connected AD 0, L=local /32 AD 0, S=static AD 1, O=OSPF AD 110, D=EIGRP AD 90, R=RIP AD 120, B=BGP. The code tells you how the router learned the route.', aliases: ['route codes', 'source codes'], tags: ['routing', 'routing-table'], sourceRefs: [{ sourceName: 'Cisco CCNA 200-301 v1.1 Exam Topics', chapter: '3.1', confidence: 1 }] },
    { id: 'CKU-CONNECTED-LOCAL-ROUTES', title: 'Connected and Local Routes', summary: 'When an interface is up/up with an IP, the router auto-installs: a C route to the subnet and an L /32 for the router own interface IP. Both have AD 0 and are removed when the interface fails.', aliases: ['connected route', 'local route', 'C route', 'L route'], tags: ['routing', 'connected', 'local'], sourceRefs: [{ sourceName: 'Cisco CCNA 200-301 v1.1 Exam Topics', chapter: '3.1', confidence: 1 }] },
  ],
  reading: {
    id: 'READ-3.1',
    ckuIds: ['CKU-ROUTING-TABLE-ENTRY', 'CKU-ROUTE-SOURCE-CODES', 'CKU-CONNECTED-LOCAL-ROUTES'],
    estimatedReadMinutes: 5,
    tiers: {
      beginner: 'The routing table is a list of destinations the router knows how to reach. Each row shows how the router learned the route (a letter code like C for connected, S for static, O for OSPF), the destination network, the next router to forward to (next-hop IP), and which interface to exit. When you set up an IP address on an interface it is automatically added.',
      intermediate: 'Each routing table entry contains: a source code, the destination network/prefix in CIDR notation, the [AD/metric] pair in brackets, the next-hop IP and outgoing interface, and an age timer for dynamic routes. Connected (C) routes and local (L) /32 routes are added automatically when an interface reaches up/up state; they have AD 0 and disappear if the interface fails. The longest prefix match rule selects which route is used for a given packet.',
      examReady: 'Entry anatomy: O 192.168.2.0/24 [110/20] via 10.1.1.1, 00:01:23, Gi0/0 means: O=OSPF source, /24 destination, AD=110 metric=20, next-hop 10.1.1.1, age 1m23s, exit Gi0/0. Source codes: C=connected AD 0, L=local /32 AD 0, S=static AD 1, O=OSPF AD 110, D=EIGRP AD 90, R=RIP AD 120, B=BGP. When an interface comes up/up with an IP, the router installs both a C route (subnet) and an L route (exact /32 for the router own interface IP). These vanish when the interface goes down. An asterisk (*) marks the best candidate. The "gateway of last resort" at the top shows the default route.',
    },
    definition: 'A routing table entry records the **destination prefix**, source **code** (C/L/S/O/D/R/B), **[AD/metric]** trustworthiness/cost pair, **next-hop** IP or exit interface, and age.',
    keyPoints: [
      'Source codes: `C`=connected (AD 0), `L`=local /32 (AD 0), `S`=static (AD 1), `O`=OSPF (110), `D`=EIGRP (90), `R`=RIP (120).',
      'Brackets `[AD/metric]` — e.g. `[110/20]` = AD 110, metric 20. AD comes first.',
      'When Gi0/1 comes up with an IP, C and L routes auto-install; both removed if interface fails.',
      'The L route is a /32 for the router own interface IP — lets the router process traffic addressed to itself.',
      'An asterisk (*) marks the best current match for a prefix or the candidate default route.',
    ],
    realWorld: 'Run `show ip route`. The header shows the gateway of last resort. A line like `O 10.2.0.0/24 [110/2] via 10.0.0.1, 00:05:10, Gi0/1` means OSPF learned this, AD 110, cost 2, forward to 10.0.0.1 out Gi0/1, updated 5 min ago.',
    commonMistakes: [
      'Confusing the L (/32) route for a host route to a PC — it is the router own interface address.',
      'Thinking [AD/metric] is [metric/AD] — it is always AD first, metric second.',
      'Forgetting that connected routes disappear when the interface goes down.',
    ],
    related: ['3.2 Forwarding decision (longest prefix match, AD, metric)', '3.3 Static routing', '3.4 OSPFv2'],
    advanced: 'Run `show ip route summary` for counts by type. For IPv6 use `show ipv6 route`. Local (L) routes for the router own IPs are essential so the router responds to pings and SSH targeted at itself.',
    sourceRefs: [{ sourceName: 'Cisco CCNA 200-301 v1.1 Exam Topics', chapter: '3.1', confidence: 1 }],
  },
  questions: [
    { id: '3.1-q1', concept: 'route source codes', type: 'definition', difficulty: 'easy',
      question: 'In `show ip route`, what does the source code `O` represent?',
      choices: ['Connected route', 'OSPF-learned route', 'Static route', 'EIGRP-learned route'],
      correctIndex: 1, explanation: 'O = OSPF. C = connected, S = static, D = EIGRP.', ckuIds: ['CKU-ROUTE-SOURCE-CODES'] },
    { id: '3.1-q2', concept: 'AD/metric brackets', type: 'application', difficulty: 'medium',
      question: 'A routing entry shows `[110/20]`. What does 110 represent?',
      choices: ['The metric', 'The administrative distance', 'The OSPF cost', 'The hop count'],
      correctIndex: 1, explanation: 'Format is [AD/metric]. 110 is the administrative distance (OSPF), 20 is the metric (OSPF cost).', ckuIds: ['CKU-ROUTING-TABLE-ENTRY'] },
    { id: '3.1-q3', concept: 'connected and local routes', type: 'definition', difficulty: 'easy',
      question: 'When an interface comes up with IP 192.168.1.1/24, which two routes are auto-installed?',
      choices: ['C 192.168.1.0/24 and L 192.168.1.1/32', 'S 192.168.1.0/24 and C 192.168.1.1/32', 'O 192.168.1.0/24 and C 192.168.1.1/24', 'C 192.168.1.0/24 only'],
      correctIndex: 0, explanation: 'A connected (C) route to the subnet and a local (L) /32 for the router own interface IP are both auto-installed at AD 0.', ckuIds: ['CKU-CONNECTED-LOCAL-ROUTES'] },
    { id: '3.1-q4', concept: 'L route purpose', type: 'definition', difficulty: 'medium',
      question: 'What is the purpose of the L (local) /32 route in the routing table?',
      choices: ['It routes traffic to hosts on the subnet', 'It allows the router to process packets destined for its own interface IP', 'It is a backup for the connected route', 'It marks the default gateway'],
      correctIndex: 1, explanation: 'The L /32 lets the router recognize and process packets addressed directly to its own interface IP (e.g. for SSH or ping to the router itself).', ckuIds: ['CKU-CONNECTED-LOCAL-ROUTES'] },
    { id: '3.1-q5', concept: 'EIGRP code', type: 'definition', difficulty: 'medium',
      question: 'Which source code indicates a route learned via EIGRP?',
      choices: ['E', 'D', 'O', 'R'],
      correctIndex: 1, explanation: 'D = EIGRP (Diffusing Update Algorithm). O = OSPF, R = RIP, B = BGP.', ckuIds: ['CKU-ROUTE-SOURCE-CODES'] },
    { id: '3.1-q6', concept: 'connected route removal', type: 'scenario', difficulty: 'medium',
      question: 'Interface Gi0/1 goes down. What happens to its connected route?',
      choices: ['Marked with *, indicating preferred', 'Stays with an age timer', 'Removed from the routing table', 'Converts to a static route'],
      correctIndex: 2, explanation: 'Connected and local routes are removed when the interface fails. They cannot be reached directly anymore.', ckuIds: ['CKU-CONNECTED-LOCAL-ROUTES'] },
    { id: '3.1-q7', concept: 'static AD', type: 'definition', difficulty: 'easy',
      question: 'What is the default administrative distance of a static route?',
      choices: ['0', '1', '90', '110'],
      correctIndex: 1, explanation: 'Static routes have AD 1 by default — one higher than connected (0) but lower than any dynamic protocol.', ckuIds: ['CKU-ROUTE-SOURCE-CODES'] },
    { id: '3.1-q8', concept: 'show ip route interpretation', type: 'application', difficulty: 'hard',
      question: 'A route reads: `D 172.16.0.0/16 [90/307200] via 10.0.0.2, 00:10:00, Gi0/0`. What is 307200?',
      choices: ['Administrative distance', 'EIGRP composite metric', 'OSPF cost', 'Hop count'],
      correctIndex: 1, explanation: 'D = EIGRP. [90/307200] = [AD/metric]. 307200 is the EIGRP composite metric (bandwidth + delay). AD is 90.', ckuIds: ['CKU-ROUTING-TABLE-ENTRY', 'CKU-ROUTE-SOURCE-CODES'] },
    { id: '3.1-q9', concept: 'gateway of last resort', type: 'definition', difficulty: 'medium',
      question: 'The top of `show ip route` shows "Gateway of last resort is 203.0.113.1". What does this indicate?',
      choices: ['A default route is installed', 'The router cannot reach any network', 'The router is a DHCP server', 'OSPF elected a DR'],
      correctIndex: 0, explanation: 'The gateway of last resort message means a default route (0.0.0.0/0) is installed, pointing to 203.0.113.1.', ckuIds: ['CKU-ROUTING-TABLE-ENTRY'] },
    { id: '3.1-q10', concept: 'asterisk in routing table', type: 'definition', difficulty: 'hard',
      question: 'An asterisk (*) next to a routing entry indicates what?',
      choices: ['The route is unreachable', 'It is the best match or candidate default', 'The route is more than 24 hours old', 'The route requires manual activation'],
      correctIndex: 1, explanation: 'An asterisk marks the route as the best path for that prefix or indicates it as the candidate default route (for the gateway of last resort).', ckuIds: ['CKU-ROUTING-TABLE-ENTRY'] },
  ],
  flashcards: [
    { id: '3.1-f1', ckuId: 'CKU-ROUTE-SOURCE-CODES', front: 'Route source code C in `show ip route`?', back: 'Connected — auto-installed when an interface is up/up. AD 0.' },
    { id: '3.1-f2', ckuId: 'CKU-ROUTE-SOURCE-CODES', front: 'Route source code L in `show ip route`?', back: 'Local — a /32 for the router own interface IP. AD 0. Used to process traffic destined for the router itself.' },
    { id: '3.1-f3', ckuId: 'CKU-ROUTE-SOURCE-CODES', front: 'CCNA route codes: C / L / S / O / D / R?', back: 'C=connected, L=local, S=static, O=OSPF, D=EIGRP, R=RIP (B=BGP, i=IS-IS).' },
    { id: '3.1-f4', ckuId: 'CKU-ROUTING-TABLE-ENTRY', front: 'What do `[110/20]` mean in a routing entry?', back: '[AD/metric] — AD 110 (OSPF), metric (cost) 20.' },
    { id: '3.1-f5', ckuId: 'CKU-CONNECTED-LOCAL-ROUTES', front: 'Two routes auto-added when Gi0/1 comes up with 10.1.1.1/24?', back: 'C 10.1.1.0/24 (connected subnet) and L 10.1.1.1/32 (local). Both removed if interface fails.' },
    { id: '3.1-f6', ckuId: 'CKU-ROUTING-TABLE-ENTRY', front: 'Gateway of last resort in `show ip route`?', back: 'The next-hop for the default route (0.0.0.0/0) — used when no more-specific route matches.' },
  ],
  diagram: {
    id: 'DIAG-3.1-routing-table', title: 'Routing Table Entry Anatomy',
    type: 'table',
    nodes: [
      { id: 'code', label: 'O', type: 'highlight', x: 5, y: 50, note: 'Source code (O=OSPF)' },
      { id: 'prefix', label: '192.168.2.0/24', type: 'process', x: 25, y: 50, note: 'Destination prefix' },
      { id: 'admetric', label: '[110/20]', type: 'highlight', x: 50, y: 50, note: '[AD/metric]' },
      { id: 'nexthop', label: 'via 10.1.1.1', type: 'process', x: 70, y: 50, note: 'Next-hop IP' },
      { id: 'iface', label: 'Gi0/0', type: 'router', x: 88, y: 50, note: 'Exit interface' },
    ],
    links: [
      { id: 'l1', source: 'code', target: 'prefix', label: '' },
      { id: 'l2', source: 'prefix', target: 'admetric', label: '' },
      { id: 'l3', source: 'admetric', target: 'nexthop', label: '' },
      { id: 'l4', source: 'nexthop', target: 'iface', label: '' },
    ],
    annotations: ['O=OSPF, [110/20]=[AD/metric]', 'C and L routes have no [AD/metric] shown — they are always AD 0', 'L routes are /32 for the router own IPs'],
    sourceRefs: [{ sourceName: 'Cisco CCNA 200-301 v1.1 Exam Topics', chapter: '3.1', confidence: 1 }],
  },
  examTraps: [
    { id: '3.1-trap1', trap: 'The L route is NOT a host route to a PC. It is the router own interface IP as a /32 — so the router processes packets addressed to itself.' },
    { id: '3.1-trap2', trap: 'In [AD/metric], AD comes FIRST. Many students read it backwards as [metric/AD].' },
  ],
}

/* =========================================================================
   OBJECTIVE 3.3 — Configure and verify IPv4 and IPv6 static routing
   ========================================================================= */
const OBJ_33 = {
  objectiveId: '3.3',
  domainId: 'connectivity',
  title: 'Configure and verify IPv4 and IPv6 static routing',
  ckus: [
    { id: 'CKU-STATIC-ROUTE-SYNTAX', title: 'IPv4 Static Route Syntax', summary: 'ip route <dest-network> <subnet-mask> {<next-hop-ip> | <exit-interface>} [AD]. Using a next-hop IP is preferred over exit-interface alone on multi-access Ethernet segments.', aliases: ['static route', 'ip route command'], tags: ['routing', 'static'], sourceRefs: [{ sourceName: 'Cisco CCNA 200-301 v1.1 Exam Topics', chapter: '3.3', confidence: 1 }] },
    { id: 'CKU-DEFAULT-STATIC-ROUTE', title: 'Default Static Route', summary: 'ip route 0.0.0.0 0.0.0.0 <next-hop> creates the gateway of last resort. Matches any destination when no more-specific route exists. Common on stub/edge routers connected to ISPs.', aliases: ['default route', '0.0.0.0/0', 'quad-zero'], tags: ['routing', 'static', 'default-route'], sourceRefs: [{ sourceName: 'Cisco CCNA 200-301 v1.1 Exam Topics', chapter: '3.3', confidence: 1 }] },
    { id: 'CKU-FLOATING-STATIC', title: 'Floating Static Route', summary: 'A static route with an AD higher than the primary dynamic route (e.g. AD 130 to back up OSPF AD 110). Not installed while the primary route is present; rises in when the primary fails.', aliases: ['floating static', 'backup route', 'higher AD static'], tags: ['routing', 'static', 'redundancy'], sourceRefs: [{ sourceName: 'Cisco CCNA 200-301 v1.1 Exam Topics', chapter: '3.3', confidence: 1 }] },
    { id: 'CKU-IPV6-STATIC-ROUTE', title: 'IPv6 Static Route Syntax', summary: 'ipv6 route <prefix>/<length> {<next-hop-ipv6> | <exit-interface>}. IPv6 default: ipv6 route ::/0 <next-hop>. Requires ipv6 unicast-routing globally.', aliases: ['ipv6 route', 'IPv6 static'], tags: ['routing', 'static', 'ipv6'], sourceRefs: [{ sourceName: 'Cisco CCNA 200-301 v1.1 Exam Topics', chapter: '3.3', confidence: 1 }] },
  ],
  reading: {
    id: 'READ-3.3',
    ckuIds: ['CKU-STATIC-ROUTE-SYNTAX', 'CKU-DEFAULT-STATIC-ROUTE', 'CKU-FLOATING-STATIC', 'CKU-IPV6-STATIC-ROUTE'],
    estimatedReadMinutes: 6,
    tiers: {
      beginner: 'A static route tells the router "to reach network X, forward to Y". They are simple to set up but must be manually updated when the network changes. Use `ip route` with a destination network, its mask, and the next-hop address. A default static route is a catch-all used when no other route matches.',
      intermediate: 'Syntax: `ip route <destination-network> <subnet-mask> <next-hop-ip-or-interface>`. Prefer next-hop IP over exit-interface on Ethernet so the router does not ARP for every destination. Default static: `ip route 0.0.0.0 0.0.0.0 <next-hop>`. Floating static: add AD > primary protocol AD (e.g. 130 for OSPF backup) — only installs when OSPF route disappears. IPv6: `ipv6 unicast-routing` first, then `ipv6 route <prefix>/<len> <next-hop>`, default is `ipv6 route ::/0 <next-hop>`. Verify: `show ip route static`, `ping`.',
      examReady: 'IPv4 static: `ip route 10.0.0.0 255.255.255.0 192.168.1.1` — installs S 10.0.0.0/24 [1/0] via 192.168.1.1. Default static: `ip route 0.0.0.0 0.0.0.0 203.0.113.1`. Floating static: `ip route 10.0.0.0 255.255.255.0 192.168.2.1 130` — AD 130 stays out while OSPF (AD 110) is active; installed when OSPF loses the route. Recursive lookup: next-hop IP must itself be in the routing table (via connected or other route) or the static is not installed. IPv6: `ipv6 unicast-routing` required first, then `ipv6 route 2001:db8::/32 2001:db8::1`, default `ipv6 route ::/0 <next-hop>`. Verify: `show ip route static`, `show ipv6 route static`, `ping`.',
    },
    definition: 'A **static route** is a manually configured forwarding entry. Syntax: `ip route <network> <mask> {<next-hop> | <interface>}`. A **default** uses 0.0.0.0/0. A **floating** static adds a higher AD to serve as a dynamic-route backup.',
    keyPoints: [
      '`ip route 0.0.0.0 0.0.0.0 <next-hop>` — default route, gateway of last resort.',
      'Floating static: set AD > primary protocol AD so it only installs when the primary route fails.',
      'IPv6: enable `ipv6 unicast-routing` first; then `ipv6 route <prefix>/<len> <next-hop>`.',
      'Recursive lookup: the next-hop IP must be reachable or the static route is not installed.',
      'Verify with `show ip route static` and ping from the correct source interface.',
    ],
    realWorld: 'On a branch router: `ip route 0.0.0.0 0.0.0.0 203.0.113.1` points all internet traffic to the ISP. For a floating backup: `ip route 0.0.0.0 0.0.0.0 198.51.100.1 130` — AD 130 beats OSPF is wrong (130>110 means OSPF wins). Wait — 130 > 110 so OSPF (lower AD) stays preferred. Only when OSPF disappears does the floating static at AD 130 install.',
    commonMistakes: [
      'Using exit interface without next-hop IP on Ethernet — the router ARP-resolves every destination IP inefficiently.',
      'Setting a floating static AD lower than the dynamic protocol AD — it becomes primary, not a backup.',
      'Forgetting `ipv6 unicast-routing` before IPv6 static routes.',
    ],
    related: ['3.1 Routing table (where static routes appear as S)', '3.2 Forwarding decision (AD, longest prefix)', '3.4 OSPFv2'],
    advanced: 'Recursive static: the router looks up the next-hop in its own table — if that fails the static is not installed. Use `show ip route 10.0.0.0` to check if a specific prefix is installed.',
    sourceRefs: [{ sourceName: 'Cisco CCNA 200-301 v1.1 Exam Topics', chapter: '3.3', confidence: 1 }],
  },
  questions: [
    { id: '3.3-q1', concept: 'static route syntax', type: 'application', difficulty: 'easy',
      question: 'Which command adds a static route to 172.16.0.0/16 via next-hop 10.0.0.1?',
      choices: ['ip route 172.16.0.0 255.255.0.0 10.0.0.1', 'ip route 172.16.0.0 0.0.255.255 10.0.0.1', 'static route 172.16.0.0/16 10.0.0.1', 'ip static-route 172.16.0.0 255.255.0.0 10.0.0.1'],
      correctIndex: 0, explanation: 'ip route <network> <subnet-mask> <next-hop>. /16 = 255.255.0.0.', ckuIds: ['CKU-STATIC-ROUTE-SYNTAX'] },
    { id: '3.3-q2', concept: 'default static route', type: 'definition', difficulty: 'easy',
      question: 'Which command creates a default static route via 203.0.113.1?',
      choices: ['ip route 0.0.0.0 255.255.255.255 203.0.113.1', 'ip route 0.0.0.0 0.0.0.0 203.0.113.1', 'ip route default 203.0.113.1', 'ip default-route 203.0.113.1'],
      correctIndex: 1, explanation: 'Default static route: destination 0.0.0.0 mask 0.0.0.0 (/0) matches all traffic.', ckuIds: ['CKU-DEFAULT-STATIC-ROUTE'] },
    { id: '3.3-q3', concept: 'floating static', type: 'definition', difficulty: 'medium',
      question: 'OSPF (AD 110) is primary. Which config makes a static route a floating backup?',
      choices: ['ip route 10.0.0.0 255.0.0.0 192.168.2.1 90', 'ip route 10.0.0.0 255.0.0.0 192.168.2.1 130', 'ip route 10.0.0.0 255.0.0.0 192.168.2.1', 'ip route 10.0.0.0 255.0.0.0 192.168.2.1 1'],
      correctIndex: 1, explanation: 'AD 130 is higher than OSPF AD 110, so the static is only installed when OSPF loses the route. AD 90 would always beat OSPF.', ckuIds: ['CKU-FLOATING-STATIC'] },
    { id: '3.3-q4', concept: 'recursive lookup', type: 'scenario', difficulty: 'hard',
      question: 'A static route is configured but not in `show ip route`. The next-hop is in a disconnected subnet. Why?',
      choices: ['Static routes require OSPF to advertise them', 'The next-hop must be reachable — recursive lookup fails', 'Static routes must use exit interface only', 'The mask is incompatible'],
      correctIndex: 1, explanation: 'A static route requires its next-hop to be reachable via another routing table entry. If not reachable, the static is not installed.', ckuIds: ['CKU-STATIC-ROUTE-SYNTAX'] },
    { id: '3.3-q5', concept: 'IPv6 static route', type: 'application', difficulty: 'medium',
      question: 'Which command configures a static IPv6 route to 2001:db8:1::/48 via 2001:db8::1?',
      choices: ['ip route 2001:db8:1::/48 2001:db8::1', 'ipv6 route 2001:db8:1::/48 2001:db8::1', 'ipv6 static-route 2001:db8:1::/48 nexthop 2001:db8::1', 'ipv6 route 2001:db8:1:: /48 2001:db8::1'],
      correctIndex: 1, explanation: 'IPv6 static: `ipv6 route <prefix>/<len> <next-hop>`. Requires `ipv6 unicast-routing` globally.', ckuIds: ['CKU-IPV6-STATIC-ROUTE'] },
    { id: '3.3-q6', concept: 'IPv6 default route', type: 'definition', difficulty: 'medium',
      question: 'What is the IPv6 equivalent of `ip route 0.0.0.0 0.0.0.0 <next-hop>`?',
      choices: ['ipv6 route ff00::/8 <next-hop>', 'ipv6 route ::/0 <next-hop>', 'ipv6 route 0::0/0 <next-hop>', 'ipv6 default-gateway <next-hop>'],
      correctIndex: 1, explanation: 'IPv6 default route is ::/0 (prefix length 0 matches everything).', ckuIds: ['CKU-IPV6-STATIC-ROUTE', 'CKU-DEFAULT-STATIC-ROUTE'] },
    { id: '3.3-q7', concept: 'verify static routes', type: 'application', difficulty: 'easy',
      question: 'Which command shows only static routes in the routing table?',
      choices: ['show ip route', 'show ip route static', 'show running-config | section route', 'show ip protocols'],
      correctIndex: 1, explanation: '`show ip route static` filters to entries with source code S.', ckuIds: ['CKU-STATIC-ROUTE-SYNTAX'] },
    { id: '3.3-q8', concept: 'exit interface vs next-hop', type: 'scenario', difficulty: 'hard',
      question: 'A static route uses only an exit interface (Gi0/0) on a multi-access Ethernet. What is the issue?',
      choices: ['The route disappears from the table', 'The router ARP-resolves every destination individually, wasting resources', 'The route has AD 255', 'The router uses OSPF to resolve the path'],
      correctIndex: 1, explanation: 'On Ethernet without a next-hop IP, the router treats every destination as directly connected and ARP-resolves each one — inefficient on multi-access segments.', ckuIds: ['CKU-STATIC-ROUTE-SYNTAX'] },
  ],
  flashcards: [
    { id: '3.3-f1', ckuId: 'CKU-STATIC-ROUTE-SYNTAX', front: 'IPv4 static route to 10.1.0.0/24 via 192.168.1.1?', back: '`ip route 10.1.0.0 255.255.255.0 192.168.1.1`' },
    { id: '3.3-f2', ckuId: 'CKU-DEFAULT-STATIC-ROUTE', front: 'Default static route via 203.0.113.1?', back: '`ip route 0.0.0.0 0.0.0.0 203.0.113.1` — sets the gateway of last resort.' },
    { id: '3.3-f3', ckuId: 'CKU-FLOATING-STATIC', front: 'How to make a static backup for OSPF (AD 110)?', back: 'Set AD higher than 110: `ip route ... <next-hop> 130` — installed only when OSPF loses the route.' },
    { id: '3.3-f4', ckuId: 'CKU-IPV6-STATIC-ROUTE', front: 'IPv6 default static route?', back: '`ipv6 route ::/0 <next-hop>` (after `ipv6 unicast-routing`).' },
    { id: '3.3-f5', ckuId: 'CKU-STATIC-ROUTE-SYNTAX', front: 'Static not in routing table — most likely reason?', back: 'Next-hop is not reachable (recursive lookup failed). No connected route to the next-hop subnet.' },
  ],
  diagram: {
    id: 'DIAG-3.3-static-routing', title: 'Static vs Floating Static Route',
    type: 'network',
    nodes: [
      { id: 'r1', label: 'R1', type: 'router', x: 15, y: 50 },
      { id: 'r2', label: 'R2 (OSPF AD 110)', type: 'router', x: 50, y: 25, note: 'preferred' },
      { id: 'r3', label: 'R3 (Static AD 130)', type: 'router', x: 50, y: 75, note: 'floating backup' },
      { id: 'dst', label: '10.0.0.0/24', type: 'cloud', x: 85, y: 50 },
    ],
    links: [
      { id: 'l1', source: 'r1', target: 'r2', label: 'OSPF AD 110', status: 'forwarding' },
      { id: 'l2', source: 'r1', target: 'r3', label: 'Static AD 130', status: 'standby' },
      { id: 'l3', source: 'r2', target: 'dst', label: '', status: 'forwarding' },
      { id: 'l4', source: 'r3', target: 'dst', label: '', status: 'standby' },
    ],
    annotations: ['Floating static (AD 130) only installs if OSPF (AD 110) route disappears', 'ip route 10.0.0.0 255.255.255.0 <R3-ip> 130'],
    sourceRefs: [{ sourceName: 'Cisco CCNA 200-301 v1.1 Exam Topics', chapter: '3.3', confidence: 1 }],
  },
  examTraps: [
    { id: '3.3-trap1', trap: 'A floating static needs AD HIGHER than the dynamic protocol. Setting AD 90 to back up OSPF (AD 110) would always be preferred — it is the primary, not the backup.' },
    { id: '3.3-trap2', trap: 'IPv6 static routes require `ipv6 unicast-routing` globally first — forgetting this is a common exam mistake.' },
  ],
}

/* =========================================================================
   OBJECTIVE 5.1 — Explain key security concepts
   ========================================================================= */
const OBJ_51 = {
  objectiveId: '5.1',
  domainId: 'security',
  title: 'Explain key security concepts',
  ckus: [
    { id: 'CKU-CIA-TRIAD', title: 'CIA Triad', summary: 'Confidentiality (encryption, access control), Integrity (hashing/checksums detect unauthorized changes), Availability (redundancy, DDoS mitigation). Every security control maps to one or more of these goals.', aliases: ['CIA', 'confidentiality integrity availability'], tags: ['security', 'cia-triad'], sourceRefs: [{ sourceName: 'Cisco CCNA 200-301 v1.1 Exam Topics', chapter: '5.1', confidence: 1 }] },
    { id: 'CKU-VULN-THREAT-EXPLOIT', title: 'Vulnerability, Threat, Exploit', summary: 'Vulnerability = a weakness (unpatched software, misconfiguration). Threat = a potential danger that could exploit a vulnerability. Exploit = the actual code/method used. Risk = likelihood x impact.', aliases: ['vulnerability', 'threat', 'exploit', 'risk'], tags: ['security', 'definitions'], sourceRefs: [{ sourceName: 'Cisco CCNA 200-301 v1.1 Exam Topics', chapter: '5.1', confidence: 1 }] },
    { id: 'CKU-COMMON-THREATS', title: 'Common Network Threats', summary: 'Malware (virus, worm, Trojan, ransomware), Phishing/social engineering, DoS/DDoS (overwhelm availability), Man-in-the-middle (intercept/modify traffic), Spoofing (fake IP/MAC), Password attacks (brute force, dictionary).', aliases: ['malware', 'phishing', 'DoS', 'DDoS', 'MITM', 'social engineering'], tags: ['security', 'threats'], sourceRefs: [{ sourceName: 'Cisco CCNA 200-301 v1.1 Exam Topics', chapter: '5.1', confidence: 1 }] },
    { id: 'CKU-MITIGATION-TECHNIQUES', title: 'Mitigation Techniques', summary: 'Patching removes known vulnerabilities. Firewalls/ACLs filter traffic. Network segmentation limits blast radius. End-user security awareness training addresses social engineering. Defense in depth = multiple overlapping controls.', aliases: ['mitigation', 'defense in depth', 'layered security'], tags: ['security', 'mitigation'], sourceRefs: [{ sourceName: 'Cisco CCNA 200-301 v1.1 Exam Topics', chapter: '5.1', confidence: 1 }] },
  ],
  reading: {
    id: 'READ-5.1',
    ckuIds: ['CKU-CIA-TRIAD', 'CKU-VULN-THREAT-EXPLOIT', 'CKU-COMMON-THREATS', 'CKU-MITIGATION-TECHNIQUES'],
    estimatedReadMinutes: 5,
    tiers: {
      beginner: 'Network security has three goals: keep data private (confidentiality), ensure it is not changed without detection (integrity), and keep systems running (availability) — called the CIA triad. Common threats include ransomware, phishing emails, and floods that take a network offline. Defenses include patching software, firewalls, and training users.',
      intermediate: 'CIA triad: Confidentiality = encrypt data and restrict access; Integrity = use hashing (MD5, SHA) to detect unauthorized changes; Availability = redundancy, DDoS protection. Key terminology: vulnerability (weakness — unpatched OS), threat (potential danger), exploit (actual attack code), risk (likelihood x impact). Malware types: virus (file-attached, requires user action to spread), worm (self-propagates without files), Trojan (appears legitimate), ransomware (encrypts and demands payment). Social engineering: phishing (email), vishing (voice), smishing (SMS). DoS/DDoS floods exhaust resources. MITM intercepts/alters traffic. Spoofing fakes source identity.',
      examReady: 'CIA: Confidentiality = encryption (AES, RSA), access control; Integrity = hashing (SHA-256, MD5 deprecated); Availability = FHRP redundancy, DDoS mitigation. Vulnerability vs threat vs exploit: gap vs actor/event vs weapon. Malware: virus (needs host file), worm (self-replicating, no file), Trojan (disguised), ransomware (encrypts + demands payment). Social engineering: phishing/vishing/smishing/tailgating. DoS = single attacker; DDoS = distributed botnet. MITM intercepts and possibly modifies traffic — stopped by encryption (TLS) and certificate validation. Spoofing: IP spoofing (fake src IP), ARP spoofing (fake MAC), DNS spoofing (fake resolution). Mitigations: patching, NGFW, ACLs, port security, DHCP snooping, DAI, AAA, segmentation, user training. Defense in depth = multiple layers.',
    },
    definition: 'The **CIA triad** (Confidentiality, Integrity, Availability) frames all security decisions. A **vulnerability** is a weakness; a **threat** is the potential to exploit it; an **exploit** is the actual attack. Defense in depth uses multiple overlapping controls.',
    keyPoints: [
      'CIA: **C**=encryption+access control, **I**=hashing (integrity of data), **A**=redundancy+DDoS (keep systems running).',
      'Vulnerability (gap) vs threat (potential danger) vs exploit (actual attack) — know the distinction.',
      'Malware: virus (file), worm (no file, self-replicates), Trojan (disguised), ransomware (encrypts+demands payment).',
      'Social engineering / phishing = exploiting human trust — the most common initial attack vector.',
      'Defense in depth: layer multiple controls so no single failure is catastrophic.',
    ],
    realWorld: 'A ransomware attack chain: vulnerability (unpatched OS) + threat (ransomware group) + exploit (phishing email attachment) = breach. Mitigations: patch the OS, train users to spot phishing, back up data offline, segment the network to limit spread.',
    commonMistakes: [
      'Confusing integrity with access control. Integrity = detecting unauthorized CHANGES (hashing). Confidentiality = keeping data private.',
      'Thinking a vulnerability alone = a breach. It needs a threat + exploit to become a real risk.',
      'Forgetting availability is a security goal — DDoS attacks violate it without touching confidentiality or integrity.',
    ],
    related: ['5.2 Security program elements (training, physical)', '5.3 Device access control', '5.5 ACLs (enforce confidentiality)'],
    advanced: 'Zero-day = exploit for an unknown or unpatched vulnerability. APT (advanced persistent threat) = sophisticated, long-term attacker. Insider threats come from trusted users. Tailgating = physical social engineering (following someone through a door).',
    sourceRefs: [{ sourceName: 'Cisco CCNA 200-301 v1.1 Exam Topics', chapter: '5.1', confidence: 1 }],
  },
  questions: [
    { id: '5.1-q1', concept: 'CIA triad confidentiality', type: 'definition', difficulty: 'easy',
      question: 'Encryption of data in transit primarily supports which CIA triad element?',
      choices: ['Availability', 'Integrity', 'Confidentiality', 'Authentication'],
      correctIndex: 2, explanation: 'Encryption protects confidentiality. Integrity is addressed by hashing; availability by redundancy.', ckuIds: ['CKU-CIA-TRIAD'] },
    { id: '5.1-q2', concept: 'CIA triad integrity', type: 'definition', difficulty: 'medium',
      question: 'Hashing a file to detect unauthorized modifications primarily addresses which CIA element?',
      choices: ['Confidentiality', 'Availability', 'Integrity', 'Non-repudiation'],
      correctIndex: 2, explanation: 'Integrity ensures data has not been altered without detection. Hashing creates a fingerprint — if the hash changes, the data was modified.', ckuIds: ['CKU-CIA-TRIAD'] },
    { id: '5.1-q3', concept: 'vulnerability definition', type: 'definition', difficulty: 'medium',
      question: 'An unpatched web server running software with a known security flaw is best described as a:',
      choices: ['Threat', 'Exploit', 'Vulnerability', 'Risk'],
      correctIndex: 2, explanation: 'A vulnerability is a weakness (unpatched software). A threat is a potential danger. An exploit is the actual attack.', ckuIds: ['CKU-VULN-THREAT-EXPLOIT'] },
    { id: '5.1-q4', concept: 'ransomware', type: 'definition', difficulty: 'medium',
      question: 'Which malware type encrypts files and demands payment for the decryption key?',
      choices: ['Virus', 'Worm', 'Trojan', 'Ransomware'],
      correctIndex: 3, explanation: 'Ransomware encrypts files and demands a ransom. A virus attaches to files; a worm self-propagates; a Trojan disguises itself as legitimate software.', ckuIds: ['CKU-COMMON-THREATS'] },
    { id: '5.1-q5', concept: 'phishing', type: 'definition', difficulty: 'easy',
      question: 'An attacker sends a fraudulent email appearing to be from IT, asking users to click a link and enter credentials. This is:',
      choices: ['A worm attack', 'Phishing', 'A DoS attack', 'IP spoofing'],
      correctIndex: 1, explanation: 'Phishing is social engineering via deceptive email to trick users into revealing credentials or clicking malicious links.', ckuIds: ['CKU-COMMON-THREATS'] },
    { id: '5.1-q6', concept: 'DDoS and availability', type: 'application', difficulty: 'medium',
      question: 'A website is flooded with millions of requests from a botnet, making it unavailable. Which CIA element is violated?',
      choices: ['Confidentiality', 'Integrity', 'Availability', 'Authentication'],
      correctIndex: 2, explanation: 'A DDoS attack violates availability — legitimate users cannot access services because resources are exhausted.', ckuIds: ['CKU-CIA-TRIAD', 'CKU-COMMON-THREATS'] },
    { id: '5.1-q7', concept: 'defense in depth', type: 'definition', difficulty: 'medium',
      question: 'Using firewalls, user training, antivirus, and network segmentation together is called:',
      choices: ['Multi-factor authentication', 'Defense in depth', 'Zero-trust networking', 'AAA framework'],
      correctIndex: 1, explanation: 'Defense in depth uses multiple overlapping controls so that if one layer fails, others still protect. No single control is sufficient.', ckuIds: ['CKU-MITIGATION-TECHNIQUES'] },
    { id: '5.1-q8', concept: 'MITM', type: 'definition', difficulty: 'medium',
      question: 'An attacker intercepts traffic between two hosts and reads (or modifies) it without either host knowing. This is:',
      choices: ['A DoS attack', 'A man-in-the-middle attack', 'IP spoofing', 'A replay attack'],
      correctIndex: 1, explanation: 'A man-in-the-middle (MITM) attack positions the attacker between two communicating parties to eavesdrop or alter traffic. TLS encryption mitigates this.', ckuIds: ['CKU-COMMON-THREATS'] },
    { id: '5.1-q9', concept: 'worm vs virus', type: 'definition', difficulty: 'medium',
      question: 'Which malware self-replicates across networks WITHOUT needing to attach to an existing file?',
      choices: ['Virus', 'Worm', 'Spyware', 'Adware'],
      correctIndex: 1, explanation: 'A worm self-propagates without a host file — it spreads by exploiting vulnerabilities. A virus requires attaching to a file.', ckuIds: ['CKU-COMMON-THREATS'] },
    { id: '5.1-q10', concept: 'social engineering mitigation', type: 'application', difficulty: 'easy',
      question: 'The most effective mitigation against phishing and social engineering is:',
      choices: ['Firewalls', 'Antivirus software', 'User security awareness training', 'Encryption'],
      correctIndex: 2, explanation: 'Social engineering exploits human trust. User security awareness training is the primary defense — teaching people to recognize and report suspicious emails and requests.', ckuIds: ['CKU-MITIGATION-TECHNIQUES', 'CKU-COMMON-THREATS'] },
  ],
  flashcards: [
    { id: '5.1-f1', ckuId: 'CKU-CIA-TRIAD', front: 'CIA triad — what does each letter stand for?', back: 'C=Confidentiality (encryption, access control), I=Integrity (hashing), A=Availability (redundancy, DDoS protection).' },
    { id: '5.1-f2', ckuId: 'CKU-CIA-TRIAD', front: 'Which CIA element does hashing protect?', back: 'Integrity — a hash detects unauthorized changes. Encryption protects confidentiality; redundancy protects availability.' },
    { id: '5.1-f3', ckuId: 'CKU-VULN-THREAT-EXPLOIT', front: 'Vulnerability vs threat vs exploit?', back: 'Vulnerability = weakness. Threat = potential danger. Exploit = actual attack method. Risk = likelihood x impact.' },
    { id: '5.1-f4', ckuId: 'CKU-COMMON-THREATS', front: 'Virus vs worm vs Trojan?', back: 'Virus = needs a host file. Worm = self-propagates without file. Trojan = disguised. Ransomware = encrypts + demands payment.' },
    { id: '5.1-f5', ckuId: 'CKU-COMMON-THREATS', front: 'What is phishing?', back: 'Social engineering via deceptive email to steal credentials or deliver malware. Vishing=voice, smishing=SMS.' },
    { id: '5.1-f6', ckuId: 'CKU-MITIGATION-TECHNIQUES', front: 'What is defense in depth?', back: 'Multiple overlapping security layers (firewall + ACL + training + endpoint protection) so a single failure does not compromise everything.' },
  ],
  diagram: {
    id: 'DIAG-5.1-cia-triad', title: 'CIA Triad',
    type: 'process',
    nodes: [
      { id: 'c', label: 'Confidentiality', type: 'highlight', x: 20, y: 25, note: 'Encryption, access control' },
      { id: 'i', label: 'Integrity', type: 'highlight', x: 80, y: 25, note: 'Hashing, checksums' },
      { id: 'a', label: 'Availability', type: 'highlight', x: 50, y: 80, note: 'Redundancy, DDoS protection' },
      { id: 'cia', label: 'CIA Triad', type: 'process', x: 50, y: 48 },
    ],
    links: [
      { id: 'l1', source: 'c', target: 'cia', label: '' },
      { id: 'l2', source: 'i', target: 'cia', label: '' },
      { id: 'l3', source: 'a', target: 'cia', label: '' },
    ],
    annotations: ['C: keep data private from unauthorized parties', 'I: detect unauthorized changes (hashing)', 'A: keep systems running (redundancy, uptime)'],
    sourceRefs: [{ sourceName: 'Cisco CCNA 200-301 v1.1 Exam Topics', chapter: '5.1', confidence: 1 }],
  },
  examTraps: [
    { id: '5.1-trap1', trap: 'Integrity = detecting CHANGES (hashing). NOT keeping data private (that is confidentiality). Do not mix them up.' },
    { id: '5.1-trap2', trap: 'A DDoS attack violates AVAILABILITY, not confidentiality or integrity. Availability is a security goal, not just an uptime concern.' },
  ],
}

const CURATED = {
  [OBJ_11.objectiveId]: OBJ_11, [OBJ_12.objectiveId]: OBJ_12, [OBJ_13.objectiveId]: OBJ_13, [OBJ_14.objectiveId]: OBJ_14,
  [OBJ_17.objectiveId]: OBJ_17, [OBJ_110.objectiveId]: OBJ_110, [OBJ_111.objectiveId]: OBJ_111, [OBJ_112.objectiveId]: OBJ_112,
  [OBJ_32.objectiveId]: OBJ_32, [OBJ_16.objectiveId]: OBJ_16, [OBJ_15.objectiveId]: OBJ_15,
  [OBJ_18.objectiveId]: OBJ_18, [OBJ_19.objectiveId]: OBJ_19, [OBJ_21.objectiveId]: OBJ_21, [OBJ_22.objectiveId]: OBJ_22,
  [OBJ_25.objectiveId]: OBJ_25, [OBJ_34.objectiveId]: OBJ_34, [OBJ_41.objectiveId]: OBJ_41, [OBJ_55.objectiveId]: OBJ_55,
  [OBJ_31.objectiveId]: OBJ_31, [OBJ_33.objectiveId]: OBJ_33, [OBJ_51.objectiveId]: OBJ_51,
}

/** Objective IDs that have ANY curated static content (reading and/or questions). */
export const curatedObjectiveIds = new Set(Object.keys(CURATED))
export function hasCurated(objectiveId) { return curatedObjectiveIds.has(objectiveId) }
export function getCurated(objectiveId) { return CURATED[objectiveId] || null }

/** True if this objective has a curated reading (source-grounded explanation, no AI). */
export function hasCuratedReading(objectiveId) { return !!CURATED[objectiveId]?.reading }

/** True if this objective has curated (static, zero-API) questions, hand-curated or bulk-imported. */
export function hasCuratedQuestions(objectiveId) {
  return (CURATED[objectiveId]?.questions?.length || 0) > 0 || (IMPORTED_QUESTIONS[objectiveId]?.length || 0) > 0
}

/** Curated + bulk-imported questions reshaped to the app's quiz-bank question shape. */
export function getCuratedQuestions(objectiveId) {
  const o = CURATED[objectiveId]
  const hand = (o?.questions || []).map(q => ({
    question: q.question, choices: q.choices, correctIndex: q.correctIndex,
    explanation: q.explanation, type: q.type, difficulty: q.difficulty, concept: q.concept,
    skill: q.skill, orderItems: q.orderItems, id: q.id,
  }))
  const imported = IMPORTED_QUESTIONS[objectiveId] || []
  const skill = getSkillQuestions(objectiveId)
  return hand.concat(imported, skill)
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
