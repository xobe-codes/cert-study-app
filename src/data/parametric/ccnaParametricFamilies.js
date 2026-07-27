/**
 * Bank-wide parametric + pattern-clone families.
 * Subnetting is one family among many — AD, ports, VLANs, STP, OSPF, HSRP, syslog, security, automation.
 */
import {
  dottedMaskFromPrefix,
  usableHostsForPrefix,
  blockSizeForPrefix,
} from './parametricEngine.js'

const PREFIXES_HOSTS = [24, 25, 26, 27, 28, 29, 30]
const PREFIXES_BLOCK = [25, 26, 27, 28, 29, 30]
const PREFIXES_MASK = [24, 25, 26, 27, 28, 29, 30]

const AD_SOURCES = [
  { key: 'connected', label: 'a directly connected interface', ad: 0 },
  { key: 'static', label: 'a static route', ad: 1 },
  { key: 'ebgp', label: 'eBGP', ad: 20 },
  { key: 'eigrp', label: 'internal EIGRP', ad: 90 },
  { key: 'ospf', label: 'OSPF', ad: 110 },
  { key: 'rip', label: 'RIP', ad: 120 },
  { key: 'ibgp', label: 'iBGP', ad: 200 },
]

const WELL_KNOWN_PORTS = [
  { key: 'ftp-data', proto: 'TCP', port: 20, service: 'FTP data' },
  { key: 'ftp', proto: 'TCP', port: 21, service: 'FTP control' },
  { key: 'ssh', proto: 'TCP', port: 22, service: 'SSH' },
  { key: 'telnet', proto: 'TCP', port: 23, service: 'Telnet' },
  { key: 'smtp', proto: 'TCP', port: 25, service: 'SMTP' },
  { key: 'dns-udp', proto: 'UDP', port: 53, service: 'DNS' },
  { key: 'dhcp-server', proto: 'UDP', port: 67, service: 'DHCP server' },
  { key: 'dhcp-client', proto: 'UDP', port: 68, service: 'DHCP client' },
  { key: 'http', proto: 'TCP', port: 80, service: 'HTTP' },
  { key: 'pop3', proto: 'TCP', port: 110, service: 'POP3' },
  { key: 'imap', proto: 'TCP', port: 143, service: 'IMAP' },
  { key: 'snmp', proto: 'UDP', port: 161, service: 'SNMP' },
  { key: 'https', proto: 'TCP', port: 443, service: 'HTTPS' },
  { key: 'syslog', proto: 'UDP', port: 514, service: 'Syslog' },
]

const SYSLOG_LEVELS = [
  { level: 0, name: 'emergencies' },
  { level: 1, name: 'alerts' },
  { level: 2, name: 'critical' },
  { level: 3, name: 'errors' },
  { level: 4, name: 'warnings' },
  { level: 5, name: 'notifications' },
  { level: 6, name: 'informational' },
  { level: 7, name: 'debugging' },
]

const VLAN_PAIRS = [
  { a: 10, b: 20 },
  { a: 30, b: 40 },
  { a: 50, b: 60 },
  { a: 100, b: 200 },
  { a: 12, b: 34 },
]

const ACCESS_VLANS = [10, 20, 30, 40, 50, 100, 200]
const HSRP_PRIORITIES = [100, 110, 120, 150, 200]
const STP_PRIORITIES = [0, 4096, 8192, 16384, 24576, 32768]
const OSPF_AREAS = [0, 1, 2, 10, 51]
const PORT_SEC_MAX = [1, 2, 3, 5]

function distractorHosts(prefix) {
  const correct = usableHostsForPrefix(prefix)
  const raw = 2 ** (32 - prefix)
  const adj = prefix < 30 ? usableHostsForPrefix(prefix + 1) : usableHostsForPrefix(prefix - 1)
  const set = new Set([String(correct)])
  const choices = [String(correct)]
  for (const n of [raw, adj, raw - 1, correct + 2, Math.max(0, correct - 2)]) {
    const s = String(n)
    if (!set.has(s)) {
      set.add(s)
      choices.push(s)
    }
    if (choices.length === 4) break
  }
  while (choices.length < 4) choices.push(String(900 + choices.length))
  return choices
}

function distractorBlock(prefix) {
  const correct = blockSizeForPrefix(prefix)
  const choices = [String(correct)]
  const set = new Set(choices)
  for (const n of [correct * 2, correct / 2, 256 - correct, usableHostsForPrefix(prefix)].filter(x => x && x > 0)) {
    const s = String(n)
    if (!set.has(s)) {
      set.add(s)
      choices.push(s)
    }
    if (choices.length === 4) break
  }
  while (choices.length < 4) choices.push(String(16 * choices.length))
  return choices
}

function distractorMask(prefix) {
  const correct = dottedMaskFromPrefix(prefix)
  const choices = [correct]
  const set = new Set(choices)
  for (const p of [prefix - 1, prefix + 1, prefix - 2, 24, 30].filter(p => p >= 8 && p <= 30 && p !== prefix)) {
    const m = dottedMaskFromPrefix(p)
    if (!set.has(m)) {
      set.add(m)
      choices.push(m)
    }
    if (choices.length === 4) break
  }
  return choices
}

function distractorAd(correct) {
  const pool = [0, 1, 20, 90, 110, 120, 200, 255, 5]
  const choices = [String(correct)]
  const set = new Set(choices)
  for (const n of pool) {
    const s = String(n)
    if (!set.has(s)) {
      set.add(s)
      choices.push(s)
    }
    if (choices.length === 4) break
  }
  return choices
}

function distractorPort(correct) {
  const pool = WELL_KNOWN_PORTS.map(p => p.port)
  const choices = [String(correct)]
  const set = new Set(choices)
  for (const n of pool) {
    const s = String(n)
    if (!set.has(s)) {
      set.add(s)
      choices.push(s)
    }
    if (choices.length === 4) break
  }
  return choices
}

/** @type {import('./parametricEngine.js').expandFamily extends Function} */
export const CCNA_PARAMETRIC_FAMILIES = [
  // ── 1.6 Subnetting parametric ───────────────────────────────────────────
  {
    id: '1.6-usable-hosts',
    kind: 'parametric',
    objectiveId: '1.6',
    idPrefix: 'obj-1.6-param-hosts',
    concept: 'usable hosts by prefix',
    type: 'application',
    difficulty: 'medium',
    ckuIds: ['CKU-SUBNETTING'],
    parameters: PREFIXES_HOSTS.map(prefix => ({ prefix })),
    paramKey: p => String(p.prefix),
    build: ({ prefix }) => {
      const correct = String(usableHostsForPrefix(prefix))
      const choices = distractorHosts(prefix)
      return {
        question: `How many usable host addresses are in a \`/${prefix}\` subnet?`,
        choices,
        correctIndex: choices.indexOf(correct),
        explanation: `/${prefix} has ${32 - prefix} host bits → 2^${32 - prefix} − 2 = ${correct} usable hosts (network and broadcast reserved).`,
      }
    },
  },
  {
    id: '1.6-block-size',
    kind: 'parametric',
    objectiveId: '1.6',
    idPrefix: 'obj-1.6-param-block',
    concept: 'block size by prefix',
    type: 'application',
    difficulty: 'medium',
    ckuIds: ['CKU-BLOCK-SIZE'],
    parameters: PREFIXES_BLOCK.map(prefix => ({ prefix })),
    paramKey: p => String(p.prefix),
    build: ({ prefix }) => {
      const correct = String(blockSizeForPrefix(prefix))
      const mask = dottedMaskFromPrefix(prefix)
      const choices = distractorBlock(prefix)
      return {
        question: `What is the block size for a \`/${prefix}\` mask (\`${mask}\`)?`,
        choices,
        correctIndex: choices.indexOf(correct),
        explanation: `/${prefix} → last-octet mask ${mask.split('.').pop()}; block size = 256 − ${mask.split('.').pop()} = ${correct}.`,
      }
    },
  },
  {
    id: '1.6-dotted-mask',
    kind: 'parametric',
    objectiveId: '1.6',
    idPrefix: 'obj-1.6-param-mask',
    concept: 'CIDR to dotted mask',
    type: 'definition',
    difficulty: 'easy',
    ckuIds: ['CKU-SUBNET-MASK'],
    parameters: PREFIXES_MASK.map(prefix => ({ prefix })),
    paramKey: p => String(p.prefix),
    build: ({ prefix }) => {
      const correct = dottedMaskFromPrefix(prefix)
      const choices = distractorMask(prefix)
      return {
        question: `What is the dotted-decimal subnet mask for \`/${prefix}\`?`,
        choices,
        correctIndex: choices.indexOf(correct),
        explanation: `/${prefix} sets ${prefix} network bits → mask ${correct}.`,
      }
    },
  },
  {
    id: '1.6-host-bits',
    kind: 'parametric',
    objectiveId: '1.6',
    idPrefix: 'obj-1.6-param-hostbits',
    concept: 'host bits by prefix',
    type: 'definition',
    difficulty: 'easy',
    ckuIds: ['CKU-SUBNET-MASK'],
    parameters: PREFIXES_HOSTS.map(prefix => ({ prefix })),
    paramKey: p => String(p.prefix),
    build: ({ prefix }) => {
      const correct = String(32 - prefix)
      const pool = [
        String(prefix),
        String(32 - prefix + 1),
        String(8),
        String(16),
        String(Math.max(1, prefix - 8)),
        String(Math.max(1, 32 - prefix - 1)),
        String(4),
        String(12),
      ]
      const distractors = []
      for (const c of pool) {
        if (c === correct || distractors.includes(c)) continue
        distractors.push(c)
        if (distractors.length === 3) break
      }
      const choices = [correct, ...distractors]
      return {
        question: `How many host bits are in a \`/${prefix}\` address?`,
        choices,
        correctIndex: 0,
        explanation: `Host bits = 32 − ${prefix} = ${correct}.`,
      }
    },
  },

  // ── 3.1 / 3.2 Administrative distance ───────────────────────────────────
  {
    id: '3.1-default-ad',
    kind: 'parametric',
    objectiveId: '3.1',
    idPrefix: 'obj-3.1-param-ad',
    concept: 'default administrative distance',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-AD'],
    parameters: AD_SOURCES,
    paramKey: p => p.key,
    build: ({ label, ad }) => {
      const choices = distractorAd(ad)
      return {
        question: `What is the default administrative distance of ${label}?`,
        choices,
        correctIndex: choices.indexOf(String(ad)),
        explanation: `Cisco default AD for ${label} is ${ad} (lower AD is preferred when prefix length ties).`,
      }
    },
  },
  {
    id: '3.2-ad-winner-clones',
    kind: 'clone',
    objectiveId: '3.2',
    idPrefix: 'obj-3.2-param-adwin',
    concept: 'lower AD wins',
    type: 'scenario',
    difficulty: 'medium',
    ckuIds: ['CKU-AD', 'CKU-ROUTE-SELECT'],
    clones: [
      { a: 'OSPF (AD 110)', b: 'EIGRP (AD 90)', win: 'EIGRP', why: '90 < 110' },
      { a: 'RIP (AD 120)', b: 'OSPF (AD 110)', win: 'OSPF', why: '110 < 120' },
      { a: 'eBGP (AD 20)', b: 'OSPF (AD 110)', win: 'eBGP', why: '20 < 110' },
      { a: 'static (AD 1)', b: 'OSPF (AD 110)', win: 'static', why: '1 < 110' },
      { a: 'iBGP (AD 200)', b: 'RIP (AD 120)', win: 'RIP', why: '120 < 200' },
      { a: 'EIGRP (AD 90)', b: 'static (AD 1)', win: 'static', why: '1 < 90' },
    ],
    paramKey: (p, i) => `${p.win.toLowerCase()}-${i ?? p.a.slice(0, 3)}`,
    build: ({ a, b, win, why }) => ({
      question: `Two equal-length routes exist: ${a} and ${b}. Which is installed in the routing table?`,
      choices: [
        `${win} — lower AD wins`,
        'The higher AD source — more trustworthy',
        'Load-balance both automatically',
        'Neither — metrics must match first',
      ],
      correctIndex: 0,
      explanation: `Same prefix length → lowest AD wins (${why}). Metrics are compared only within the same source.`,
    }),
  },

  // ── 1.5 / 4.x well-known ports ──────────────────────────────────────────
  {
    id: '1.5-well-known-ports',
    kind: 'parametric',
    objectiveId: '1.5',
    idPrefix: 'obj-1.5-param-port',
    concept: 'well-known port numbers',
    type: 'definition',
    difficulty: 'easy',
    ckuIds: ['CKU-PORT-NUMBERS'],
    parameters: WELL_KNOWN_PORTS,
    paramKey: p => p.key,
    build: ({ proto, port, service }) => {
      const choices = distractorPort(port)
      return {
        question: `Which port does ${service} commonly use (${proto})?`,
        choices,
        correctIndex: choices.indexOf(String(port)),
        explanation: `${service} uses ${proto} port ${port}.`,
      }
    },
  },

  // ── 2.1 VLAN pattern clones ─────────────────────────────────────────────
  {
    id: '2.1-intervlan-need-l3',
    kind: 'clone',
    objectiveId: '2.1',
    idPrefix: 'obj-2.1-param-intervlan',
    concept: 'inter-VLAN routing required',
    type: 'scenario',
    difficulty: 'easy',
    ckuIds: ['CKU-VLAN', 'CKU-INTER-VLAN'],
    clones: VLAN_PAIRS,
    paramKey: p => `${p.a}-${p.b}`,
    build: ({ a, b }) => ({
      question: `PC-A in VLAN ${a} cannot ping PC-B in VLAN ${b} on the same switched campus. What is required?`,
      choices: [
        'A router or Layer 3 switch (inter-VLAN routing)',
        'A longer STP forward delay',
        'Identical native VLANs only — no router needed',
        'Disable VTP on all switches',
      ],
      correctIndex: 0,
      explanation: `Different VLANs are separate L2 domains; traffic between VLAN ${a} and VLAN ${b} needs L3 routing (SVI or router-on-a-stick).`,
    }),
  },
  {
    id: '2.1-access-vlan-assign',
    kind: 'clone',
    objectiveId: '2.1',
    idPrefix: 'obj-2.1-param-access',
    concept: 'access VLAN assignment',
    type: 'application',
    difficulty: 'easy',
    ckuIds: ['CKU-ACCESS-PORT'],
    clones: ACCESS_VLANS.map(vlan => ({ vlan })),
    paramKey: p => String(p.vlan),
    build: ({ vlan }) => ({
      question: `Which command pair puts an interface in VLAN ${vlan} as an access port?`,
      choices: [
        `switchport mode access / switchport access vlan ${vlan}`,
        `switchport mode trunk / switchport trunk allowed vlan ${vlan}`,
        `vlan ${vlan} / no shutdown only`,
        `switchport access vlan ${vlan + 1} / switchport mode dynamic auto`,
      ],
      correctIndex: 0,
      explanation: `Access mode + \`switchport access vlan ${vlan}\` assigns the port to VLAN ${vlan}.`,
    }),
  },

  // ── 2.4 / 2.5 STP parametric + clones ───────────────────────────────────
  {
    id: '2.5-bridge-priority',
    kind: 'parametric',
    objectiveId: '2.5',
    idPrefix: 'obj-2.5-param-prio',
    concept: 'STP bridge priority values',
    type: 'application',
    difficulty: 'medium',
    ckuIds: ['CKU-STP-ROOT'],
    parameters: STP_PRIORITIES.map(priority => ({ priority })),
    paramKey: p => String(p.priority),
    build: ({ priority }) => {
      const higher = Math.min(61440, priority + 4096)
      return {
        question: `A switch is configured with STP bridge priority ${priority}. Which statement is true?`,
        choices: [
          priority === 32768
            ? 'That is the Cisco default bridge priority'
            : `Priority ${priority} is lower than the default 32768, so this switch is more likely to become root`,
          'Bridge priority is ignored when MAC addresses differ',
          `Priority ${higher} always beats ${priority}`,
          'Priority only applies to RSTP, not PVST+',
        ],
        correctIndex: 0,
        explanation: priority === 32768
          ? 'Default STP bridge priority is 32768; lower priority (in steps of 4096) wins root election.'
          : `Lower bridge priority wins. ${priority} is preferred over the default 32768 (and over ${higher}). Steps are typically 4096.`,
        difficulty: priority === 32768 ? 'easy' : 'medium',
      }
    },
  },
  {
    id: '2.5-root-primary-clones',
    kind: 'clone',
    objectiveId: '2.5',
    idPrefix: 'obj-2.5-param-root',
    concept: 'STP root primary per VLAN',
    type: 'application',
    difficulty: 'medium',
    ckuIds: ['CKU-STP-ROOT'],
    clones: [10, 20, 30, 100, 200].map(vlan => ({ vlan })),
    paramKey: p => String(p.vlan),
    build: ({ vlan }) => ({
      question: `Which command makes this switch the preferred STP root for VLAN ${vlan}?`,
      choices: [
        `spanning-tree vlan ${vlan} root primary`,
        `spanning-tree vlan ${vlan} priority 61440`,
        `vtp vlan ${vlan} root`,
        `switchport mode root vlan ${vlan}`,
      ],
      correctIndex: 0,
      explanation: `\`spanning-tree vlan ${vlan} root primary\` lowers priority so this switch wins root for VLAN ${vlan}.`,
    }),
  },

  // ── 3.4 OSPF clones ─────────────────────────────────────────────────────
  {
    id: '3.4-ospf-area-clones',
    kind: 'clone',
    objectiveId: '3.4',
    idPrefix: 'obj-3.4-param-area',
    concept: 'OSPF area membership',
    type: 'scenario',
    difficulty: 'medium',
    ckuIds: ['CKU-OSPF-AREA'],
    clones: OSPF_AREAS.map(area => ({ area })),
    paramKey: p => String(p.area),
    build: ({ area }) => ({
      question: area === 0
        ? 'Which OSPF area must all other areas connect to in a single-area or multi-area design backbone?'
        : `An interface is placed in OSPF area ${area}. Which statement is correct?`,
      choices: area === 0
        ? [
            'Area 0 (backbone)',
            'Area 1 only',
            'Any non-zero area can be the backbone',
            'Area 51 is reserved as backbone',
          ]
        : [
            `It forms adjacencies only with neighbors also in area ${area} (same area)`,
            'It automatically becomes an ASBR',
            'Area number must equal the process ID',
            'Hello packets are flooded into every area',
          ],
      correctIndex: 0,
      explanation: area === 0
        ? 'OSPF backbone is area 0; other areas attach via ABRs to area 0.'
        : `OSPF neighbors must share the same area ID; area ${area} peers only with area ${area} on that link.`,
    }),
  },
  {
    id: '3.4-ospf-timers-clones',
    kind: 'clone',
    objectiveId: '3.4',
    idPrefix: 'obj-3.4-param-timers',
    concept: 'OSPF hello/dead defaults',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-OSPF-TIMERS'],
    clones: [
      { net: 'Broadcast multi-access', hello: 10, dead: 40 },
      { net: 'Point-to-point', hello: 10, dead: 40 },
      { net: 'Non-broadcast (NBMA) default', hello: 30, dead: 120 },
    ],
    paramKey: p => p.net.toLowerCase().replace(/\W+/g, '-'),
    build: ({ net, hello, dead }) => ({
      question: `On an OSPF ${net} network type, what are the default Hello and Dead intervals (seconds)?`,
      choices: [
        `${hello} / ${dead}`,
        '5 / 20',
        '60 / 180',
        '1 / 4',
      ],
      correctIndex: 0,
      explanation: `Default OSPF Hello/Dead on ${net} is ${hello}/${dead}. Mismatched timers prevent adjacency.`,
    }),
  },

  // ── 3.5 HSRP parametric ─────────────────────────────────────────────────
  {
    id: '3.5-hsrp-priority',
    kind: 'parametric',
    objectiveId: '3.5',
    idPrefix: 'obj-3.5-param-hsrp',
    concept: 'HSRP priority',
    type: 'scenario',
    difficulty: 'medium',
    ckuIds: ['CKU-HSRP'],
    parameters: HSRP_PRIORITIES.map(priority => ({ priority })),
    paramKey: p => String(p.priority),
    build: ({ priority }) => {
      const other = priority === 100 ? 90 : 100
      const wins = priority >= other
      return {
        question: `HSRP router A has priority ${priority}; router B has priority ${other}. With default preempt behavior assumed for the higher priority router, which becomes active?`,
        choices: [
          wins ? `Router A (priority ${priority})` : `Router B (priority ${other})`,
          'Both stay active and load-share by default',
          'The router with the higher IP always wins regardless of priority',
          'Neither — HSRP ignores priority until a failure',
        ],
        correctIndex: 0,
        explanation: `Higher HSRP priority wins active role (${Math.max(priority, other)} beats ${Math.min(priority, other)}). Default priority is 100.`,
      }
    },
  },

  // ── 4.1–4.5 services ────────────────────────────────────────────────────
  {
    id: '4.1-nat-clones',
    kind: 'clone',
    objectiveId: '4.1',
    idPrefix: 'obj-4.1-param-nat',
    concept: 'NAT overload pattern',
    type: 'scenario',
    difficulty: 'medium',
    ckuIds: ['CKU-NAT'],
    clones: [
      { inside: '10.0.0.0/8', outside: '203.0.113.5' },
      { inside: '192.168.1.0/24', outside: '198.51.100.10' },
      { inside: '172.16.0.0/12', outside: '203.0.113.50' },
    ],
    paramKey: p => p.inside.replace(/\W+/g, ''),
    build: ({ inside, outside }) => ({
      question: `Many hosts in ${inside} share public IP ${outside} for Internet access. Which NAT method fits?`,
      choices: [
        'PAT / NAT overload',
        'Static one-to-one only',
        'NAT64 exclusively',
        'No NAT — RFC1918 is globally routable',
      ],
      correctIndex: 0,
      explanation: `Many private addresses (${inside}) → one public (${outside}) uses PAT (NAT overload) with port translation.`,
    }),
  },
  {
    id: '4.2-ntp-stratum-clones',
    kind: 'clone',
    objectiveId: '4.2',
    idPrefix: 'obj-4.2-param-ntp',
    concept: 'NTP stratum preference',
    type: 'scenario',
    difficulty: 'medium',
    ckuIds: ['CKU-NTP'],
    clones: [
      { a: 1, b: 3 },
      { a: 2, b: 4 },
      { a: 1, b: 5 },
    ],
    paramKey: p => `${p.a}-vs-${p.b}`,
    build: ({ a, b }) => ({
      question: `A router learns NTP from a stratum-${a} server and a stratum-${b} server. Which is preferred (all else equal)?`,
      choices: [
        `Stratum ${a} (lower stratum is closer to the reference clock)`,
        `Stratum ${b} (higher stratum is more accurate)`,
        'Neither — NTP ignores stratum',
        'The server with the higher IP address',
      ],
      correctIndex: 0,
      explanation: `Lower NTP stratum is preferred. Stratum ${a} beats stratum ${b}.`,
    }),
  },
  {
    id: '4.3-dhcp-ports',
    kind: 'clone',
    objectiveId: '4.3',
    idPrefix: 'obj-4.3-param-dhcp',
    concept: 'DHCP UDP ports',
    type: 'definition',
    difficulty: 'easy',
    ckuIds: ['CKU-DHCP'],
    clones: [
      { role: 'server', port: 67 },
      { role: 'client', port: 68 },
    ],
    paramKey: p => p.role,
    build: ({ role, port }) => ({
      question: `Which UDP port does a DHCP ${role} use?`,
      choices: distractorPort(port),
      correctIndex: 0,
      explanation: `DHCP ${role} uses UDP port ${port} (server 67 / client 68).`,
      // fix correctIndex after distractorPort — recompute below via engine shuffle; set properly:
    }),
  },
  {
    id: '4.5-syslog-severity',
    kind: 'parametric',
    objectiveId: '4.5',
    idPrefix: 'obj-4.5-param-syslog',
    concept: 'syslog severity levels',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-SYSLOG'],
    parameters: SYSLOG_LEVELS,
    paramKey: p => String(p.level),
    build: ({ level, name }) => {
      const choices = [
        String(level),
        String((level + 1) % 8),
        String((level + 3) % 8),
        String((level + 5) % 8),
      ]
      return {
        question: `What is the Cisco syslog severity number for "${name}"?`,
        choices,
        correctIndex: 0,
        explanation: `Syslog severity ${level} = ${name} (0 most severe … 7 debugging).`,
      }
    },
  },
  {
    id: '4.5-syslog-name-from-level',
    kind: 'parametric',
    objectiveId: '4.5',
    idPrefix: 'obj-4.5-param-syslogname',
    concept: 'syslog severity names',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-SYSLOG'],
    parameters: SYSLOG_LEVELS,
    paramKey: p => `name-${p.level}`,
    build: ({ level, name }) => {
      const others = SYSLOG_LEVELS.filter(s => s.level !== level).slice(0, 3).map(s => s.name)
      const choices = [name, ...others]
      return {
        question: `Syslog severity level ${level} corresponds to which name?`,
        choices,
        correctIndex: 0,
        explanation: `Level ${level} is "${name}" on the Cisco syslog severity scale (0–7).`,
      }
    },
  },

  // ── 5.x security clones ─────────────────────────────────────────────────
  {
    id: '5.3-port-security-max',
    kind: 'parametric',
    objectiveId: '5.3',
    idPrefix: 'obj-5.3-param-psec',
    concept: 'port security maximum',
    type: 'application',
    difficulty: 'medium',
    ckuIds: ['CKU-PORT-SECURITY'],
    parameters: PORT_SEC_MAX.map(max => ({ max })),
    paramKey: p => String(p.max),
    build: ({ max }) => ({
      question: `Which command limits a switch port to ${max} secure MAC address${max === 1 ? '' : 'es'}?`,
      choices: [
        `switchport port-security maximum ${max}`,
        `switchport port-security mac-limit ${max}`,
        `mac address-table limit ${max}`,
        `switchport mode access maximum ${max}`,
      ],
      correctIndex: 0,
      explanation: `\`switchport port-security maximum ${max}\` caps learned/configured secure MACs on that port.`,
    }),
  },
  {
    id: '5.5-acl-wildcard-clones',
    kind: 'clone',
    objectiveId: '5.5',
    idPrefix: 'obj-5.5-param-wc',
    concept: 'ACL wildcard mask',
    type: 'application',
    difficulty: 'hard',
    ckuIds: ['CKU-ACL'],
    clones: [
      { net: '192.168.10.0', mask: '0.0.0.255', meaning: '/24' },
      { net: '10.1.1.0', mask: '0.0.0.31', meaning: '/27' },
      { net: '172.16.0.0', mask: '0.0.255.255', meaning: '/16' },
      { net: '192.168.0.0', mask: '0.0.0.63', meaning: '/26' },
    ],
    paramKey: p => p.mask.replace(/\./g, ''),
    build: ({ net, mask, meaning }) => ({
      question: `In a standard ACL, which wildcard mask matches the ${meaning} network ${net}?`,
      choices: [
        mask,
        mask.split('.').map(o => 255 - Number(o)).join('.'),
        '255.255.255.255',
        '0.0.0.0',
      ],
      correctIndex: 0,
      explanation: `Wildcard ${mask} matches ${net} ${meaning} (inverse of the subnet mask bits in that range).`,
    }),
  },
  {
    id: '5.7-vpn-clones',
    kind: 'clone',
    objectiveId: '5.7',
    idPrefix: 'obj-5.7-param-vpn',
    concept: 'site-to-site VPN traits',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-VPN'],
    clones: [
      { focus: 'confidentiality', answer: 'Encryption (e.g. IPsec ESP)', wrong: 'VTP pruning' },
      { focus: 'integrity', answer: 'Hashing / HMAC', wrong: 'NAT overload alone' },
      { focus: 'remote-access vs site-to-site', answer: 'Remote-access is typically client-to-gateway; site-to-site is gateway-to-gateway', wrong: 'They are identical in topology' },
    ],
    paramKey: p => p.focus.replace(/\W+/g, '-'),
    build: ({ focus, answer, wrong }) => ({
      question: `For IPsec VPNs, which option best addresses ${focus}?`,
      choices: [
        answer,
        wrong,
        'Spanning Tree root guard',
        'CDP version 2 only',
      ],
      correctIndex: 0,
      explanation: `${answer} is the mechanism tied to ${focus} in VPN design.`,
    }),
  },

  // ── 6.x automation clones ───────────────────────────────────────────────
  {
    id: '6.1-rest-verbs',
    kind: 'clone',
    objectiveId: '6.1',
    idPrefix: 'obj-6.1-param-rest',
    concept: 'REST HTTP verbs',
    type: 'definition',
    difficulty: 'easy',
    ckuIds: ['CKU-REST'],
    clones: [
      { verb: 'GET', use: 'retrieve a resource' },
      { verb: 'POST', use: 'create a resource' },
      { verb: 'PUT', use: 'replace/update a resource' },
      { verb: 'DELETE', use: 'remove a resource' },
      { verb: 'PATCH', use: 'partially update a resource' },
    ],
    paramKey: p => p.verb.toLowerCase(),
    build: ({ verb, use }) => {
      const distractors = ['OPTIONS', 'TRACE', 'CONNECT', 'HEAD'].filter(v => v !== verb).slice(0, 3)
      const choices = [verb, ...distractors]
      return {
        question: `In a REST API, which HTTP method is typically used to ${use}?`,
        choices,
        correctIndex: 0,
        explanation: `HTTP ${verb} is the conventional REST verb to ${use}.`,
      }
    },
  },
  {
    id: '6.2-data-formats',
    kind: 'clone',
    objectiveId: '6.2',
    idPrefix: 'obj-6.2-param-format',
    concept: 'data serialization formats',
    type: 'definition',
    difficulty: 'easy',
    ckuIds: ['CKU-JSON-XML-YAML'],
    clones: [
      { format: 'JSON', trait: 'uses braces/brackets and is common in REST bodies' },
      { format: 'XML', trait: 'uses nested tags and is verbose' },
      { format: 'YAML', trait: 'is indentation-sensitive and common in Ansible' },
    ],
    paramKey: p => p.format.toLowerCase(),
    build: ({ format, trait }) => ({
      question: `Which data format ${trait}?`,
      choices: [format, 'CSV only', 'BGP NLRI', 'STP BPDU'],
      correctIndex: 0,
      explanation: `${format} ${trait}.`,
    }),
  },
  {
    id: '6.3-model-driven',
    kind: 'clone',
    objectiveId: '6.3',
    idPrefix: 'obj-6.3-param-mdt',
    concept: 'model-driven telemetry / YANG',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-YANG', 'CKU-NETCONF'],
    clones: [
      { q: 'Which modeling language describes network device configuration structure for NETCONF/RESTCONF?', a: 'YANG', w: ['OSPF', 'VTP', 'LLDP'] },
      { q: 'Which protocol commonly uses XML payloads over SSH for device configuration?', a: 'NETCONF', w: ['FTP', 'VTP', 'STP'] },
      { q: 'Which protocol exposes YANG models over HTTP with JSON/XML?', a: 'RESTCONF', w: ['Telnet', 'CDP', 'DTP'] },
    ],
    paramKey: p => p.a.toLowerCase(),
    build: ({ q, a, w }) => ({
      question: q,
      choices: [a, ...w],
      correctIndex: 0,
      explanation: `${a} is the correct technology for that model-driven role.`,
    }),
  },
  {
    id: '6.5-controller-planes',
    kind: 'clone',
    objectiveId: '6.5',
    idPrefix: 'obj-6.5-param-plane',
    concept: 'northbound vs southbound',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-SDN'],
    clones: [
      { plane: 'northbound', meaning: 'controller APIs toward applications/orchestration' },
      { plane: 'southbound', meaning: 'controller protocols toward network devices' },
    ],
    paramKey: p => p.plane,
    build: ({ plane, meaning }) => ({
      question: `In SDN, the ${plane} interface is best described as:`,
      choices: [
        meaning,
        plane === 'northbound' ? 'OpenFlow only toward switches' : 'REST APIs toward ITSM portals only',
        'Spanning Tree toward access ports',
        'VTP toward VLANs',
      ],
      correctIndex: 0,
      explanation: `The ${plane} interface: ${meaning}.`,
    }),
  },
  {
    id: '6.6-ansible-clones',
    kind: 'clone',
    objectiveId: '6.6',
    idPrefix: 'obj-6.6-param-ansible',
    concept: 'Ansible traits',
    type: 'definition',
    difficulty: 'easy',
    ckuIds: ['CKU-JSON-ANSIBLE'],
    clones: [
      { q: 'Ansible typically connects to network devices using which model?', a: 'Agentless push over SSH/API', w: ['Agent pull every 30s', 'Proprietary Layer 2 flooding', 'SMTP only'] },
      { q: 'Ansible playbooks are commonly written in which format?', a: 'YAML', w: ['OSPF LSAs', 'Binary .exe', 'STP BPDUs'] },
      { q: 'Compared with Puppet/Chef, Ansible is often described as:', a: 'Agentless', w: ['Always requires a local agent', 'Layer 2 only', 'A routing protocol'] },
    ],
    paramKey: (p, i) => `a${i ?? 0}`,
    build: ({ q, a, w }) => ({
      question: q,
      choices: [a, ...w],
      correctIndex: 0,
      explanation: `${a} — that is the Ansible trait this item is testing.`,
    }),
  },

  // ── Extra pattern clones across fundamentals ────────────────────────────
  {
    id: '1.1-collision-clones',
    kind: 'clone',
    objectiveId: '1.1',
    idPrefix: 'obj-1.1-param-collision',
    concept: 'collision domains',
    type: 'scenario',
    difficulty: 'easy',
    ckuIds: ['CKU-COLLISIONS', 'CKU-SWITCH'],
    clones: [
      { device: '24-port Layer 2 switch', domains: '24 (one per port)' },
      { device: '8-port hub', domains: '1 shared domain' },
      { device: '16-port switch with 2 hubs daisy-chained on ports', domains: 'still one collision domain per switch port; hubs share within their segment' },
    ],
    paramKey: (p, i) => `c${i ?? 0}`,
    build: ({ device, domains }) => ({
      question: `How do collision domains work on a ${device}?`,
      choices: [
        domains,
        'One collision domain for the entire campus always',
        'Collision domains equal VLANs only',
        'Routers create one collision domain per AS',
      ],
      correctIndex: 0,
      explanation: `On a ${device}: ${domains}. Switches split collision domains per port; hubs share one.`,
    }),
  },
  {
    id: '1.3-cable-clones',
    kind: 'clone',
    objectiveId: '1.3',
    idPrefix: 'obj-1.3-param-cable',
    concept: 'UTP cable choice',
    type: 'scenario',
    difficulty: 'medium',
    ckuIds: ['CKU-UTP'],
    clones: [
      { a: 'PC', b: 'switch', cable: 'Straight-through' },
      { a: 'router', b: 'switch', cable: 'Straight-through' },
      { a: 'switch', b: 'switch', cable: 'Crossover (if auto-MDIX disabled)' },
      { a: 'router', b: 'router', cable: 'Crossover (if auto-MDIX disabled)' },
    ],
    paramKey: p => `${p.a}-${p.b}`.replace(/\s+/g, ''),
    build: ({ a, b, cable }) => ({
      question: `With auto-MDIX disabled, which cable connects a ${a} to a ${b}?`,
      choices: [
        cable,
        cable.startsWith('Straight') ? 'Crossover' : 'Straight-through',
        'Console rollover only',
        'Fiber SM only — copper will not link',
      ],
      correctIndex: 0,
      explanation: `${a}-to-${b}: ${cable}.`,
    }),
  },
  {
    id: '2.2-trunk-clones',
    kind: 'clone',
    objectiveId: '2.2',
    idPrefix: 'obj-2.2-param-trunk',
    concept: 'trunk allowed VLANs',
    type: 'application',
    difficulty: 'medium',
    ckuIds: ['CKU-TRUNK'],
    clones: [
      { vlans: '10,20,30' },
      { vlans: '100,200' },
      { vlans: '5,15,25,35' },
    ],
    paramKey: p => p.vlans.replace(/,/g, '-'),
    build: ({ vlans }) => ({
      question: `Which command restricts a trunk to VLANs ${vlans}?`,
      choices: [
        `switchport trunk allowed vlan ${vlans}`,
        `switchport access vlan ${vlans}`,
        `vlan ${vlans} trunk enable`,
        `vtp allowed ${vlans}`,
      ],
      correctIndex: 0,
      explanation: `\`switchport trunk allowed vlan ${vlans}\` limits tagged VLANs on the trunk.`,
    }),
  },
  {
    id: '2.3-native-vlan-clones',
    kind: 'clone',
    objectiveId: '2.3',
    idPrefix: 'obj-2.3-param-native',
    concept: 'native VLAN mismatch',
    type: 'troubleshooting',
    difficulty: 'medium',
    ckuIds: ['CKU-NATIVE-VLAN'],
    clones: [
      { a: 1, b: 99 },
      { a: 10, b: 20 },
      { a: 100, b: 200 },
    ],
    paramKey: p => `${p.a}-${p.b}`,
    build: ({ a, b }) => ({
      question: `Switch A native VLAN is ${a}; Switch B native VLAN is ${b} on the same 802.1Q link. What is the risk?`,
      choices: [
        'Native VLAN mismatch — untagged frames can leak between VLANs / security issue',
        'OSPF will form two adjacencies',
        'The trunk cannot pass any tagged frames',
        'STP is disabled automatically',
      ],
      correctIndex: 0,
      explanation: `Native VLANs must match. ${a} vs ${b} causes untagged-frame mismatch and is a common exam trap.`,
    }),
  },
  {
    id: '3.3-static-route-clones',
    kind: 'clone',
    objectiveId: '3.3',
    idPrefix: 'obj-3.3-param-static',
    concept: 'static route syntax pattern',
    type: 'application',
    difficulty: 'medium',
    ckuIds: ['CKU-STATIC-ROUTE'],
    clones: [
      { dst: '10.1.1.0', mask: '255.255.255.0', nh: '192.0.2.1' },
      { dst: '172.16.0.0', mask: '255.255.0.0', nh: '203.0.113.1' },
      { dst: '192.168.50.0', mask: '255.255.255.128', nh: '198.51.100.1' },
    ],
    paramKey: p => p.dst.replace(/\./g, ''),
    build: ({ dst, mask, nh }) => ({
      question: `Which command adds a static route to ${dst} ${mask} via next hop ${nh}?`,
      choices: [
        `ip route ${dst} ${mask} ${nh}`,
        `ip default-network ${dst}`,
        `route static ${dst} ${nh}`,
        `ip route ${nh} ${mask} ${dst}`,
      ],
      correctIndex: 0,
      explanation: `\`ip route ${dst} ${mask} ${nh}\` installs the static route.`,
    }),
  },
  {
    id: '5.1-security-concepts',
    kind: 'clone',
    objectiveId: '5.1',
    idPrefix: 'obj-5.1-param-cia',
    concept: 'CIA triad',
    type: 'definition',
    difficulty: 'easy',
    ckuIds: ['CKU-SECURITY-CONCEPTS'],
    clones: [
      { pillar: 'confidentiality', means: 'Encryption / access control so data is not disclosed' },
      { pillar: 'integrity', means: 'Hashing / signatures so data is not altered undetected' },
      { pillar: 'availability', means: 'Redundancy / DoS protections so services stay reachable' },
    ],
    paramKey: p => p.pillar,
    build: ({ pillar, means }) => ({
      question: `In the CIA triad, what does ${pillar} primarily protect?`,
      choices: [
        means,
        'Only Layer 1 cable length',
        'STP root election only',
        'VTP domain names only',
      ],
      correctIndex: 0,
      explanation: means,
    }),
  },
]

// Fix DHCP family correctIndex (distractorPort puts correct first only if we set index after)
const dhcpFamily = CCNA_PARAMETRIC_FAMILIES.find(f => f.id === '4.3-dhcp-ports')
if (dhcpFamily) {
  dhcpFamily.build = ({ role, port }) => {
    const choices = distractorPort(port)
    return {
      question: `Which UDP port does a DHCP ${role} use?`,
      choices,
      correctIndex: choices.indexOf(String(port)),
      explanation: `DHCP ${role} uses UDP port ${port} (server 67 / client 68).`,
    }
  }
}

// Fix AD-winner paramKey to be unique
const adWin = CCNA_PARAMETRIC_FAMILIES.find(f => f.id === '3.2-ad-winner-clones')
if (adWin) {
  adWin.paramKey = p => `${p.win}-${p.why}`.replace(/\W+/g, '').slice(0, 24)
}

// Fix clone paramKeys that used index incorrectly
for (const f of CCNA_PARAMETRIC_FAMILIES) {
  if (f.id === '6.6-ansible-clones') {
    f.paramKey = p => p.a.toLowerCase().replace(/\W+/g, '-').slice(0, 28)
  }
  if (f.id === '1.1-collision-clones') {
    f.paramKey = p => p.device.toLowerCase().replace(/\W+/g, '-').slice(0, 28)
  }
}
