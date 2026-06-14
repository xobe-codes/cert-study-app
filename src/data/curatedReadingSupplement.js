/**
 * Curated reading supplements for objectives not yet in the main CURATED map.
 * Adds static Explain-tab content (no AI) for high-weight topics.
 */

const BLUEPRINT = 'Cisco CCNA 200-301 v1.1 Exam Topics'

function shell({ objectiveId, domainId, title, ckus, reading, examTraps = [], commands = [], glossary = [] }) {
  const diagram = {
    id: `DIAG-${objectiveId}-overview`,
    title: `${title} overview`,
    type: 'concept',
    nodes: [
      { id: 'n1', label: title, type: 'process', x: 30, y: 50 },
      { id: 'n2', label: 'CCNA exam', type: 'process', x: 70, y: 50 },
    ],
    links: [{ id: 'l1', source: 'n1', target: 'n2', label: 'objective' }],
    annotations: [reading.definition.slice(0, 120)],
    sourceRefs: reading.sourceRefs,
  }
  const packetFlow = {
    id: `PF-${objectiveId}`,
    title: `${title} flow`,
    ckuIds: reading.ckuIds,
    steps: [{ id: 's1', order: 1, title: 'Review', action: reading.keyPoints[0] || reading.definition, successState: 'learned' }],
    sourceRefs: reading.sourceRefs,
  }
  return {
    objectiveId, domainId, title, ckus, reading,
    questions: [], flashcards: [], commands, glossary, mnemonics: [],
    examTraps, misconceptions: [], diagram, packetFlow,
  }
}

const SRC = (chapter) => [{ sourceName: BLUEPRINT, chapter, confidence: 1 }]

export const READING_SUPPLEMENTS = {
  '2.3': shell({
    objectiveId: '2.3', domainId: 'access', title: 'Describe Layer 2 discovery protocols',
    ckus: [
      { id: 'CKU-CDP', title: 'Cisco Discovery Protocol (CDP)', summary: 'Cisco-proprietary L2 protocol that advertises device ID, IP, platform, and connected port every 60s (default). Enabled by default on Cisco gear.', aliases: ['CDP'], tags: ['l2', 'discovery'], sourceRefs: SRC('2.3.a') },
      { id: 'CKU-LLDP', title: 'Link Layer Discovery Protocol (LLDP)', summary: 'IEEE 802.1AB standard neighbor discovery — vendor-neutral alternative to CDP. Enabled with `lldp run`.', aliases: ['LLDP', '802.1AB'], tags: ['l2', 'discovery'], sourceRefs: SRC('2.3.b') },
    ],
    reading: {
      id: 'READ-2.3', ckuIds: ['CKU-CDP', 'CKU-LLDP'], estimatedReadMinutes: 5,
      tiers: {
        beginner: 'Discovery protocols let directly connected Cisco (or standards-based) devices learn who their neighbors are — hostname, IP, and which port connects where — without routing.',
        intermediate: 'CDP is Cisco-proprietary and on by default; it floods updates every 60 seconds and is disabled per interface with `no cdp enable`. LLDP is the IEEE 802.1AB standard (`lldp run`) for multivendor environments. Use `show cdp neighbors detail` or `show lldp neighbors detail` to troubleshoot cabling and document topology.',
        examReady: 'CDP = Cisco L2 discovery (default enabled, 60s timer, `show cdp neighbors [detail]`, disable with `no cdp enable`). LLDP = IEEE 802.1AB (`lldp run`, `show lldp neighbors`). Both reveal Device ID, IP, platform, local/remote port. CDP is not routable — only directly connected neighbors.',
      },
      definition: '**CDP** (Cisco) and **LLDP** (IEEE) are Layer 2 discovery protocols that advertise neighbor identity, IP, and port connectivity on directly attached links.',
      keyPoints: ['CDP: Cisco proprietary, enabled by default, 60s updates.', 'LLDP: IEEE 802.1AB, `lldp run` to enable.', '`show cdp neighbors detail` shows connected port mapping.', 'Disable CDP on untrusted edge ports for security.'],
      realWorld: 'CDP is invaluable for physical troubleshooting — if a port shows the wrong neighbor, the cable or patch panel is wrong.',
      commonMistakes: ['Thinking CDP works through a router — it is L2 only.', 'Forgetting LLDP for multivendor links.'],
      related: ['2.4 EtherChannel', '2.5 STP'],
      advanced: 'CDP can leak topology; disable on Internet-facing interfaces.',
      sourceRefs: SRC('2.3'),
    },
    commands: [
      { id: '2.3-cmd1', command: 'show cdp neighbors detail', mode: 'privileged EXEC', purpose: 'Display CDP neighbor table with port-level detail.', example: 'Switch# show cdp neighbors detail', ckuIds: ['CKU-CDP'] },
    ],
    glossary: [{ id: '2.3-g1', term: 'CDP', definition: 'Cisco Discovery Protocol — L2 neighbor advertisement.', ckuIds: ['CKU-CDP'] }],
  }),

  '2.4': shell({
    objectiveId: '2.4', domainId: 'access', title: 'Configure and verify EtherChannel (LACP)',
    ckus: [
      { id: 'CKU-ETHERCHANNEL', title: 'EtherChannel / Port Channel', summary: 'Bundles 2–8 parallel links into one logical interface (Po) for bandwidth aggregation and STP treats it as a single link.', aliases: ['port channel', 'link aggregation'], tags: ['etherchannel'], sourceRefs: SRC('2.4') },
      { id: 'CKU-LACP', title: 'LACP (802.3ad)', summary: 'Link Aggregation Control Protocol — standards-based negotiation (`channel-group X mode active/passive`). PAgP is Cisco-proprietary (`desirable/auto`).', aliases: ['802.3ad'], tags: ['lacp'], sourceRefs: SRC('2.4') },
    ],
    reading: {
      id: 'READ-2.4', ckuIds: ['CKU-ETHERCHANNEL', 'CKU-LACP'], estimatedReadMinutes: 6,
      tiers: {
        beginner: 'EtherChannel combines multiple physical switch links into one faster logical link so STP does not block the extras.',
        intermediate: 'Configure matching `channel-group` on each physical interface, then assign VLANs/IP to the resulting Port-channel interface. LACP (`mode active`) is the standards-based option; both sides must agree on mode. Load balancing uses hashes of MAC/IP.',
        examReady: 'EtherChannel = 2–8 links → one Port-channel (Po). LACP: `channel-group N mode active|passive` (802.3ad). PAgP: `mode desirable|auto`. Config must match: same speed/duplex/VLAN trunk mode. Assign IP/VLANs to `interface Port-channel N`, not individual members. Verify: `show etherchannel summary`, `show interfaces port-channel`.',
      },
      definition: '**EtherChannel** bundles parallel links into a **Port-channel**; **LACP** (802.3ad) negotiates aggregation with `channel-group <n> mode active`.',
      keyPoints: ['2–8 member links per channel.', 'LACP active/passive; PAgP desirable/auto (Cisco).', 'Configure SVI/IP on Port-channel, not members.', 'Mismatched settings prevent formation.'],
      realWorld: 'Always use LACP between Cisco and third-party switches.',
      commonMistakes: ['Configuring IP on physical members instead of Port-channel.', 'Mixing LACP and PAgP modes.'],
      related: ['2.5 STP'],
      advanced: 'LACP max 8 links; reference bandwidth for routing is per physical link unless bundled.',
      sourceRefs: SRC('2.4'),
    },
  }),

  '3.5': shell({
    objectiveId: '3.5', domainId: 'connectivity', title: 'Describe first-hop redundancy protocols',
    ckus: [
      { id: 'CKU-FHRP', title: 'First Hop Redundancy Protocol', summary: 'Virtual default gateway shared by two+ routers so hosts keep connectivity if one router fails.', aliases: ['FHRP', 'default gateway redundancy'], tags: ['hsrp', 'redundancy'], sourceRefs: SRC('3.5') },
      { id: 'CKU-HSRP', title: 'HSRP', summary: 'Cisco FHRP: virtual IP/MAC, Active/Standby routers, hello 3s, hold 10s, priority 0–255, preempt optional.', aliases: ['Hot Standby Router Protocol'], tags: ['hsrp'], sourceRefs: SRC('3.5') },
    ],
    reading: {
      id: 'READ-3.5', ckuIds: ['CKU-FHRP', 'CKU-HSRP'], estimatedReadMinutes: 6,
      tiers: {
        beginner: 'FHRPs let two routers share one virtual gateway IP so PCs never need to change their default gateway when a router fails.',
        intermediate: 'HSRP elects Active (forwards) and Standby routers using priority and preempt. Configure `standby <group> ip <vip>` on LAN interfaces. Optional `standby <group> track` reduces priority when an uplink fails.',
        examReady: 'FHRP = shared virtual gateway (HSRP/VRRP/GLBP). HSRP: `standby <g> ip <vip>`, priority (higher wins), preempt, virtual MAC 0000.0c07.ac0a (group 10). Timers default 3/10s. `show standby brief`. Track uplink: `standby <g> track <interface>`.',
      },
      definition: '**FHRP** provides a **virtual default gateway**; **HSRP** is Cisco\'s Active/Standby implementation with configurable priority and interface tracking.',
      keyPoints: ['Virtual IP shared by redundant routers.', 'HSRP: higher priority = Active (with preempt).', '`standby <g> track` for uplink failure detection.', 'Default timers hello 3s / hold 10s.'],
      realWorld: 'Match HSRP hello/hold timers on both routers; tracking ISP serial links is common.',
      commonMistakes: ['Different VIP or group numbers on peers.', 'Forgetting preempt when using priority.'],
      related: ['3.1 Routing table', '3.3 Static routing'],
      advanced: 'VRRP (standard) and GLBP (Cisco load-balancing) are alternatives.',
      sourceRefs: SRC('3.5'),
    },
    examTraps: [{ id: '3.5-t1', trap: 'Confusing HSRP Active with DR in OSPF.', correction: 'HSRP Active forwards traffic for the virtual IP; unrelated to OSPF DR.', ckuIds: ['CKU-HSRP'] }],
  }),

  '4.2': shell({
    objectiveId: '4.2', domainId: 'services', title: 'Configure and verify NTP',
    ckus: [
      { id: 'CKU-NTP', title: 'Network Time Protocol', summary: 'Synchronizes device clocks to an authoritative time source. Stratum 1 = atomic/GPS; client stratum = server stratum + 1.', aliases: ['NTP'], tags: ['ntp', 'time'], sourceRefs: SRC('4.2') },
    ],
    reading: {
      id: 'READ-4.2', ckuIds: ['CKU-NTP'], estimatedReadMinutes: 4,
      tiers: {
        beginner: 'Accurate device clocks matter for log timestamps and certificates. NTP syncs router and switch clocks to trusted time sources on the network.',
        intermediate: 'A device acts as an NTP client toward one or more servers. Stratum tells you how many hops from the reference clock — lower is closer. Set the local timezone for display; verify sync before trusting syslog times.',
        examReady: 'Expect stratum basics, client vs manual clock set, and why time sync matters for syslog — not a full NTP architecture deep dive.',
      },
      bigTakeaway: 'NTP keeps device clocks aligned so logs and security events can be trusted.',
      definition: '**NTP** synchronizes network device clocks to stratum-ranked time sources for consistent logging and authentication.',
      keyPoints: ['`ntp server <ip>` — client toward server.', 'Stratum increases each hop from reference.', '`clock timezone` for local display.', 'Accurate time required for syslog correlation.'],
      realWorld: 'Use at least two NTP servers for redundancy.',
      commonMistakes: ['Setting timezone but not configuring an NTP server.', 'Confusing `clock set` (manual) with NTP sync.'],
      related: ['4.5 Syslog'],
      advanced: 'NTPv4 uses UDP/123; authentication optional with `ntp authenticate`.',
      sourceRefs: SRC('4.2'),
    },
  }),

  '4.3': shell({
    objectiveId: '4.3', domainId: 'services', title: 'Describe DHCP and DNS within the network',
    ckus: [
      { id: 'CKU-DHCP', title: 'DHCP (DORA)', summary: 'Dynamic Host Configuration Protocol assigns IP, mask, gateway, DNS via Discover/Offer/Request/Acknowledge.', aliases: ['DORA'], tags: ['dhcp'], sourceRefs: SRC('4.3') },
      { id: 'CKU-DNS', title: 'DNS', summary: 'Resolves names to IPs; DHCP option 6 can push DNS server addresses to clients.', aliases: ['domain name system'], tags: ['dns'], sourceRefs: SRC('4.3') },
    ],
    reading: {
      id: 'READ-4.3', ckuIds: ['CKU-DHCP', 'CKU-DNS'], estimatedReadMinutes: 5,
      tiers: {
        beginner: 'DHCP automatically gives devices an IP address, mask, default gateway, and DNS server. DNS translates names like www.example.com into IP addresses browsers can reach.',
        intermediate: 'DHCP follows a simple four-step exchange so clients learn their address and options. DNS resolves hostnames hierarchically — DHCP often hands clients the DNS server to use.',
        examReady: 'Know DORA at a high level, that DHCP can deliver gateway and DNS options, and that relays forward requests across subnets — details live in Key Points.',
      },
      bigTakeaway: 'DHCP assigns addressing; DNS resolves names — they usually work together on the network.',
      definition: '**DHCP** automates host addressing (DORA); **DNS** resolves hostnames — often delivered together via DHCP options.',
      keyPoints: ['DORA process for dynamic addressing.', 'Option 3 = default gateway, option 6 = DNS.', '`ip helper-address` for DHCP relay.', 'DNS uses UDP port 53.'],
      realWorld: 'Place DHCP relay on each VLAN without a local server.',
      commonMistakes: ['Forgetting helper-address on the client subnet interface.', 'Confusing DHCP snooping (security) with DHCP operation.'],
      related: ['4.6 DHCP relay'],
      advanced: 'DHCP reservations bind MAC to fixed IP.',
      sourceRefs: SRC('4.3'),
    },
  }),

  '4.5': shell({
    objectiveId: '4.5', domainId: 'services', title: 'Describe syslog features',
    ckus: [
      { id: 'CKU-SYSLOG', title: 'Syslog', summary: 'Standard logging to console, buffer, or remote collector. Severity 0 (emergency) to 7 (debug).', aliases: ['logging'], tags: ['syslog', 'monitoring'], sourceRefs: SRC('4.5') },
    ],
    reading: {
      id: 'READ-4.5', ckuIds: ['CKU-SYSLOG'], estimatedReadMinutes: 4,
      tiers: {
        beginner: 'Syslog sends router and switch log messages to a central server so you can search events and spot problems across the network.',
        intermediate: 'Devices can log locally and forward copies to a remote collector. Severity levels rank urgency — lower numbers mean more critical. Accurate timestamps require clocks synced with NTP.',
        examReady: 'Recognize severity scale direction, remote logging purpose, and why NTP matters for correlation — command syntax is in Key Points.',
      },
      bigTakeaway: 'Syslog centralizes device events by severity so operators can monitor and troubleshoot at scale.',
      definition: '**Syslog** forwards device messages by **severity level** to local buffer or remote collectors for operations and security monitoring.',
      keyPoints: ['Levels 0–7; lower = more critical.', '`logging trap` filters remote severity.', 'NTP required for meaningful timestamps.', '`show logging` displays local buffer.'],
      realWorld: 'Send level informational and above to SIEM; debug only temporarily.',
      commonMistakes: ['Sending debug (7) to remote server in production.', 'No NTP → useless timestamps.'],
      related: ['4.2 NTP', '4.4 SNMP'],
      advanced: 'Syslog uses UDP/514 traditionally.',
      sourceRefs: SRC('4.5'),
    },
  }),

  '4.6': shell({
    objectiveId: '4.6', domainId: 'services', title: 'Configure and verify DHCP client and relay',
    ckus: [
      { id: 'CKU-DHCP-RELAY', title: 'DHCP Relay (ip helper-address)', summary: 'Forwards DHCP broadcasts from a client VLAN to a remote DHCP server by converting broadcast to unicast toward the server.', aliases: ['ip helper-address'], tags: ['dhcp', 'relay'], sourceRefs: SRC('4.6') },
    ],
    reading: {
      id: 'READ-4.6', ckuIds: ['CKU-DHCP-RELAY'], estimatedReadMinutes: 4,
      tiers: {
        beginner: 'When the DHCP server sits on a different subnet than clients, a router relays their broadcast requests to reach it.',
        intermediate: 'Configure relay on the interface facing the client subnet. The router converts the broadcast into a unicast toward the server, then returns the offer to the client.',
        examReady: 'Know when relay is required (remote server), which interface gets the helper, and that this is a common CCNA troubleshooting scenario.',
      },
      bigTakeaway: 'DHCP relay forwards client requests to a remote server when no DHCP server is on the local subnet.',
      definition: '**DHCP relay** (`ip helper-address`) forwards client DHCP broadcasts to a remote server across subnets.',
      keyPoints: ['Required when DHCP server is remote.', 'Configured on router interface facing clients.', 'Converts broadcast → unicast to server.', 'Part of IP Services exam troubleshooting.'],
      realWorld: 'One central DHCP server can serve many VLANs via relays.',
      commonMistakes: ['Placing helper-address on wrong interface.', 'No route back to DHCP server.'],
      related: ['4.3 DHCP/DNS'],
      advanced: '`ip forward-protocol udp` can limit which UDP ports are relayed.',
      sourceRefs: SRC('4.6'),
    },
  }),

  '5.2': shell({
    objectiveId: '5.2', domainId: 'security', title: 'Describe security program elements',
    ckus: [
      { id: 'CKU-SECURITY-PROGRAM', title: 'Security Program Elements', summary: 'User awareness training, physical access control, incident response, and risk assessment form a layered security program beyond technology alone.', aliases: ['security policy'], tags: ['security'], sourceRefs: SRC('5.2') },
    ],
    reading: {
      id: 'READ-5.2', ckuIds: ['CKU-SECURITY-PROGRAM'], estimatedReadMinutes: 4,
      tiers: {
        beginner: 'A security program combines people, processes, and technology — not just firewalls.',
        intermediate: 'Elements: security policy, user training (phishing awareness), physical security, incident response plan, risk assessment, and change management.',
        examReady: 'CCNA focuses on: user awareness/training, physical access control, incident response, risk assessment, and maintaining security policies. Technology (ACLs, 802.1X) supports but does not replace these.',
      },
      definition: 'A **security program** layers **people, process, and technology** controls including training, physical security, and incident response.',
      keyPoints: ['User awareness reduces social engineering risk.', 'Physical security protects assets.', 'Incident response = detect, contain, recover.', 'Risk assessment prioritizes controls.'],
      realWorld: 'Annual phishing simulations are standard enterprise practice.',
      commonMistakes: ['Assuming ACLs alone constitute a security program.'],
      related: ['5.1 Security concepts'],
      advanced: 'Frameworks like NIST CSF organize identify/protect/detect/respond/recover.',
      sourceRefs: SRC('5.2'),
    },
  }),

  '5.3': shell({
    objectiveId: '5.3', domainId: 'security', title: 'Configure local device access control',
    ckus: [
      { id: 'CKU-CONSOLE-VTY', title: 'Console and VTY Access', summary: 'Console = local serial/USB; VTY = remote Telnet/SSH lines. Secure with passwords, `login local`, and `transport input ssh`.', aliases: ['line vty', 'line console'], tags: ['access'], sourceRefs: SRC('5.3') },
      { id: 'CKU-PRIVILEGE-LEVELS', title: 'Privilege Levels', summary: 'Level 1 = user EXEC, level 15 = privileged EXEC (enable). `privilege exec level` can delegate specific commands.', aliases: ['enable secret'], tags: ['privilege'], sourceRefs: SRC('5.3') },
    ],
    reading: {
      id: 'READ-5.3', ckuIds: ['CKU-CONSOLE-VTY', 'CKU-PRIVILEGE-LEVELS'], estimatedReadMinutes: 5,
      tiers: {
        beginner: 'Protect device management with passwords on console and VTY lines, and use SSH instead of Telnet.',
        intermediate: '`username X secret Y` + `login local` on lines. `transport input ssh` restricts VTY to SSH. `enable secret` hashes privileged password. `service password-encryption` obfuscates clear-text passwords in config.',
        examReady: 'Local auth: `username <name> secret <pw>`, `line vty 0 15` → `login local` → `transport input ssh`. Console: `line console 0` → `password` or `login local`. Privilege: user EXEC=1, privileged=15. `enable secret` preferred over `enable password`.',
      },
      definition: '**Local access control** secures **console/VTY** lines with local user accounts, encrypted secrets, and SSH-only remote management.',
      keyPoints: ['`username secret` + `login local` on VTY.', '`transport input ssh` — disable Telnet.', '`enable secret` for privileged mode.', 'Console and VTY secured separately.'],
      realWorld: 'Always configure SSH crypto keys (`crypto key generate rsa`) before restricting transport.',
      commonMistakes: ['`transport input ssh` without generating RSA keys.', 'Using `enable password` instead of `enable secret`.'],
      related: ['5.8 AAA', '4.8 SSH'],
      advanced: '`ip access-class` can restrict which IPs may SSH.',
      sourceRefs: SRC('5.3'),
    },
  }),

  '5.6': shell({
    objectiveId: '5.6', domainId: 'security', title: 'Configure Layer 2 security features',
    ckus: [
      { id: 'CKU-PORT-SECURITY', title: 'Port Security', summary: 'Limits MAC addresses learned on access ports; violation modes protect/shutdown/restrict.', aliases: ['port security'], tags: ['l2', 'security'], sourceRefs: SRC('5.6') },
      { id: 'CKU-DHCP-SNOOPING', title: 'DHCP Snooping', summary: 'Builds binding table of IP-MAC-port; drops rogue DHCP offers on untrusted ports.', aliases: ['dhcp snooping'], tags: ['l2', 'security'], sourceRefs: SRC('5.6') },
    ],
    reading: {
      id: 'READ-5.6', ckuIds: ['CKU-PORT-SECURITY', 'CKU-DHCP-SNOOPING'], estimatedReadMinutes: 6,
      tiers: {
        beginner: 'L2 security stops rogue devices and DHCP servers from harming the LAN.',
        intermediate: 'Port security: `switchport port-security`, `maximum`, sticky MAC, violation shutdown. DHCP snooping: trusted uplinks, untrusted access ports, builds binding table used by DAI/IPSG.',
        examReady: 'Port security on access ports: `switchport mode access` → `switchport port-security` → `maximum 1` → `violation shutdown`. Sticky learns MAC. Recovery: `shutdown`/`no shutdown`. DHCP snooping: `ip dhcp snooping`, trusted on router/uplink, untrusted on user ports.',
      },
      definition: '**Port security** restricts MAC learning on access ports; **DHCP snooping** blocks rogue DHCP servers and feeds **DAI/IPSG** binding tables.',
      keyPoints: ['Port security: limit MACs, violation shutdown common.', 'Sticky MAC survives reload.', 'DHCP snooping: trusted vs untrusted ports.', 'Err-disabled port needs bounce after violation.'],
      realWorld: 'Combine port-security sticky with DHCP snooping on access switches.',
      commonMistakes: ['Port security on trunk ports.', 'Not marking uplink as trusted for DHCP snooping.'],
      related: ['5.5 ACLs', '2.5 STP'],
      advanced: 'DAI validates ARP against DHCP snooping bindings.',
      sourceRefs: SRC('5.6'),
    },
    examTraps: [{ id: '5.6-t1', trap: 'Port security works on trunk ports.', correction: 'Configure port security on access ports (`switchport mode access`).', ckuIds: ['CKU-PORT-SECURITY'] }],
  }),
}

export const READING_SUPPLEMENT_IDS = Object.keys(READING_SUPPLEMENTS)
