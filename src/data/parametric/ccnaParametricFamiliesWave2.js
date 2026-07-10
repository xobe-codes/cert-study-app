/**
 * Parametric wave 2 — thin objectives + CKU gaps (clone + parametric).
 * Complements ccnaParametricFamilies.js (wave 1).
 */

const WIFI_CHANNELS_24 = [1, 6, 11]
const WIFI_CHANNELS_5 = [36, 40, 44, 48, 149, 153]
const RFC1918 = [
  { cidr: '10.0.0.0/8', label: 'Class A private' },
  { cidr: '172.16.0.0/12', label: 'Class B private block' },
  { cidr: '192.168.0.0/16', label: 'Class C private' },
]
const IPV6_TYPES = [
  { key: 'gua', prefix: '2000::/3', name: 'global unicast' },
  { key: 'll', prefix: 'FE80::/10', name: 'link-local' },
  { key: 'ula', prefix: 'FC00::/7', name: 'unique local' },
  { key: 'mcast', prefix: 'FF00::/8', name: 'multicast' },
]
const SNMP_VERSIONS = [
  { v: 'v2c', trait: 'community strings, no encryption' },
  { v: 'v3', trait: 'user-based auth and optional privacy (encryption)' },
]
const QOS_MARKS = [
  { name: 'EF', use: 'low-latency voice (expedited forwarding)' },
  { name: 'AF41', use: 'assured forwarding video/class' },
  { name: 'CS0 / BE', use: 'best-effort default traffic' },
  { name: 'CS6', use: 'network control (routing protocols)' },
]
const VPN_TYPES = [
  { key: 's2s', label: 'site-to-site IPsec', trait: 'gateway-to-gateway encrypted tunnel' },
  { key: 'ra', label: 'remote-access VPN', trait: 'client-to-gateway for teleworkers' },
  { key: 'ssl', label: 'SSL/TLS client VPN', trait: 'often browser or AnyConnect over 443' },
  { key: 'dmvpn', label: 'DMVPN', trait: 'hub-and-spoke with dynamic spoke tunnels' },
]
const AAA_PORTS = [
  { proto: 'RADIUS', auth: 1812, acct: 1813 },
  { proto: 'TACACS+', auth: 49, acct: 49 },
]
const LACP_MODES = [
  { mode: 'active', meaning: 'initiates LACP negotiation' },
  { mode: 'passive', meaning: 'responds to LACP but does not initiate' },
]
const EC_GROUPS = [1, 2, 5, 10]
const DHCP_HELPERS = [
  { if: 'Gi0/0', server: '10.1.1.10' },
  { if: 'Gi0/1', server: '192.168.100.5' },
  { if: 'Vlan10', server: '172.16.1.20' },
]
const SSH_STEPS = [
  { step: 'hostname', cmd: 'hostname R1', why: 'RSA key label needs a hostname' },
  { step: 'domain', cmd: 'ip domain-name lab.local', why: 'domain name completes the key label' },
  { step: 'key', cmd: 'crypto key generate rsa', why: 'generates the SSH RSA key pair' },
  { step: 'vty', cmd: 'transport input ssh', why: 'allows SSH on VTY lines' },
]
const WPA_MODES = [
  { mode: 'WPA2-PSK', trait: 'pre-shared key, personal mode' },
  { mode: 'WPA2-Enterprise', trait: '802.1X / RADIUS authentication' },
  { mode: 'WPA3-SAE', trait: 'stronger personal handshake than PSK' },
]
const TOPOLOGIES = [
  { name: 'three-tier campus', trait: 'access, distribution, and core layers' },
  { name: 'spine-leaf', trait: 'every leaf connects to every spine; east-west friendly' },
  { name: 'hub-and-spoke WAN', trait: 'branch sites connect through a central hub' },
  { name: 'full mesh', trait: 'every site has a direct link to every other site' },
]
const VIRTUALIZATION = [
  { term: 'Type 1 hypervisor', meaning: 'runs directly on hardware (bare metal)' },
  { term: 'Type 2 hypervisor', meaning: 'runs on top of a host OS' },
  { term: 'container', meaning: 'shares the host kernel; lighter than a full VM' },
  { term: 'VRF', meaning: 'virtual routing/forwarding instance on one device' },
]
const TFTP_FTP = [
  { proto: 'TFTP', port: 69, trait: 'UDP, simple, often for IOS images/configs' },
  { proto: 'FTP', port: 21, trait: 'TCP control; data on a separate connection' },
]
const CLOUD_MGMT = [
  { model: 'on-prem controller', trait: 'WLC/DNA appliances you own and operate' },
  { model: 'cloud-managed', trait: 'devices phone home to a vendor cloud dashboard' },
  { model: 'hybrid', trait: 'local control plane with cloud visibility/ops' },
]
const SECURITY_PROGRAM = [
  { element: 'user awareness training', why: 'reduces phishing and social-engineering success' },
  { element: 'physical access control', why: 'stops unauthorized console/rack access' },
  { element: 'change control', why: 'documents and approves production changes' },
  { element: 'incident response plan', why: 'defines roles when a breach is detected' },
]
const SEGMENTATION = [
  { method: 'VLANs', effect: 'Layer 2 broadcast domain separation' },
  { method: 'VRFs', effect: 'separate routing tables on one box' },
  { method: 'firewalls / ACLs', effect: 'Layer 3/4 policy between segments' },
  { method: 'private VLANs', effect: 'isolate ports within the same VLAN' },
]
const L2_SEC = [
  { feature: 'port security', cmd: 'switchport port-security', purpose: 'limit MACs on an access port' },
  { feature: 'DHCP snooping', cmd: 'ip dhcp snooping', purpose: 'block rogue DHCP servers' },
  { feature: 'Dynamic ARP Inspection', cmd: 'ip arp inspection', purpose: 'validate ARP using the snooping binding table' },
  { feature: 'BPDU Guard', cmd: 'spanning-tree bpduguard enable', purpose: 'err-disable if a BPDU arrives on an edge port' },
]
const ROUTE_TSHOOT = [
  { symptom: 'ping fails to remote subnet; show ip route missing the prefix', fix: 'check routing protocol adjacency / static route' },
  { symptom: 'wrong next hop installed for a prefix', fix: 'compare AD and longest-match; remove competing route' },
  { symptom: 'OSPF neighbors stuck in 2-WAY on broadcast', fix: 'normal for DROTHER; check if DR/BDR election is wrong' },
  { symptom: 'static route present but traffic blackholes', fix: 'verify next-hop reachability and outbound interface state' },
]
const WLAN_ARCH = [
  { arch: 'autonomous AP', trait: 'each AP configured individually' },
  { arch: 'lightweight AP + WLC', trait: 'CAPWAP to central controller' },
  { arch: 'cloud-managed AP', trait: 'APs managed from vendor cloud' },
]
const IF_ERRORS = [
  { counter: 'CRC / FCS errors', cause: 'bad cable, duplex mismatch, or damaged NIC' },
  { counter: 'runts', cause: 'frames smaller than 64 bytes — often collisions or bad NIC' },
  { counter: 'giants', cause: 'frames larger than max — duplex/MTU issues' },
  { counter: 'input errors rising with CRC', cause: 'Layer 1 problem on that interface' },
]
const IPV6_ADDR_FORMS = [
  { id: 'db8-1', compact: '2001:db8:0:0:0:0:0:1', best: '2001:db8::1' },
  { id: 'db8-padded', compact: '2001:0db8:0000:0000:0000:0000:0000:0001', best: '2001:db8::1' },
  { id: 'fe80-1', compact: 'fe80:0000:0000:0000:0000:0000:0000:0001', best: 'fe80::1' },
]

function four(correct, ...wrongs) {
  const choices = [correct, ...wrongs].slice(0, 4)
  while (choices.length < 4) choices.push(`Distractor ${choices.length}`)
  return { choices, correctIndex: 0 }
}

export const CCNA_PARAMETRIC_FAMILIES_WAVE2 = [
  // ── 1.2 topologies ──────────────────────────────────────────────────────
  {
    id: '1.2-topo-clones',
    kind: 'clone',
    objectiveId: '1.2',
    idPrefix: 'obj-1.2-param-topo',
    concept: 'topology architectures',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-TOPOLOGY', 'CKU-CAMPUS-TIER'],
    clones: TOPOLOGIES,
    paramKey: p => p.name.replace(/\W+/g, '-').slice(0, 28),
    build: ({ name, trait }) => ({
      question: `Which description best matches a ${name} design?`,
      ...four(trait, 'Only Layer 1 hubs with no switching', 'OSPF area 0 is banned', 'VLANs cannot be used'),
      explanation: `${name}: ${trait}.`,
    }),
  },

  // ── 1.4 interface errors ────────────────────────────────────────────────
  {
    id: '1.4-error-clones',
    kind: 'clone',
    objectiveId: '1.4',
    idPrefix: 'obj-1.4-param-err',
    concept: 'interface error counters',
    type: 'troubleshooting',
    difficulty: 'medium',
    ckuIds: ['CKU-INTERFACE-ERRORS', 'CKU-CRC'],
    clones: IF_ERRORS,
    paramKey: p => p.counter.replace(/\W+/g, '-').slice(0, 24),
    build: ({ counter, cause }) => ({
      question: `Interface counters show rising ${counter}. What is the most likely cause?`,
      ...four(cause, 'Missing default route only', 'Wrong OSPF process ID only', 'VTP domain name mismatch only'),
      explanation: `${counter} usually points to ${cause}.`,
    }),
  },

  // ── 1.7 RFC1918 ─────────────────────────────────────────────────────────
  {
    id: '1.7-rfc1918',
    kind: 'parametric',
    objectiveId: '1.7',
    idPrefix: 'obj-1.7-param-rfc',
    concept: 'RFC1918 private ranges',
    type: 'definition',
    difficulty: 'easy',
    ckuIds: ['CKU-RFC1918', 'CKU-IPV4'],
    parameters: RFC1918,
    paramKey: p => p.cidr.replace(/\W+/g, ''),
    build: ({ cidr, label }) => ({
      question: `Which block is the ${label} RFC 1918 range?`,
      ...four(cidr, '100.64.0.0/10 only', '169.254.0.0/16', '224.0.0.0/4'),
      explanation: `${label} private addressing is ${cidr}.`,
    }),
  },
  {
    id: '1.7-apipa-clones',
    kind: 'clone',
    objectiveId: '1.7',
    idPrefix: 'obj-1.7-param-apipa',
    concept: 'APIPA / link-local IPv4',
    type: 'scenario',
    difficulty: 'medium',
    ckuIds: ['CKU-APIPA'],
    clones: [
      { host: 'PC-A', addr: '169.254.10.20' },
      { host: 'laptop', addr: '169.254.22.5' },
      { host: 'printer', addr: '169.254.100.8' },
    ],
    paramKey: p => p.host,
    build: ({ host, addr }) => ({
      question: `${host} has IPv4 address ${addr}. What does that usually mean?`,
      ...four(
        'DHCP failed — APIPA/link-local was self-assigned',
        'The host is a public Internet server',
        'OSPF elected this host as DR',
        'The address is RFC1918 Class A',
      ),
      explanation: `${addr} is in 169.254.0.0/16 (APIPA) — typically DHCP failure.`,
    }),
  },

  // ── 1.8 / 1.9 IPv6 ──────────────────────────────────────────────────────
  {
    id: '1.8-compress-clones',
    kind: 'clone',
    objectiveId: '1.8',
    idPrefix: 'obj-1.8-param-comp',
    concept: 'IPv6 compression',
    type: 'application',
    difficulty: 'medium',
    ckuIds: ['CKU-IPV6-SHORTENING', 'CKU-IPV6-ADDR'],
    clones: IPV6_ADDR_FORMS,
    paramKey: p => p.id,
    build: ({ compact, best }) => ({
      question: `What is the correctly compressed form of \`${compact}\`?`,
      ...four(best, compact.replace(/:0+/g, ':0'), '2001::db8::1', '::1 only'),
      explanation: `Leading zeros drop and the longest zero run becomes \`::\` → ${best}.`,
    }),
  },
  {
    id: '1.9-ipv6-types',
    kind: 'parametric',
    objectiveId: '1.9',
    idPrefix: 'obj-1.9-param-type',
    concept: 'IPv6 address types',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-IPV6-TYPES', 'CKU-IPV6-GLOBAL-UNICAST'],
    parameters: IPV6_TYPES,
    paramKey: p => p.key,
    build: ({ prefix, name }) => ({
      question: `Which IPv6 prefix identifies ${name} addresses?`,
      ...four(prefix, '127.0.0.0/8', '169.254.0.0/16', '240.0.0.0/4'),
      explanation: `IPv6 ${name} uses ${prefix}.`,
    }),
  },

  // ── 1.10 client IP verify ───────────────────────────────────────────────
  {
    id: '1.10-client-clones',
    kind: 'clone',
    objectiveId: '1.10',
    idPrefix: 'obj-1.10-param-client',
    concept: 'client IP verification',
    type: 'troubleshooting',
    difficulty: 'medium',
    ckuIds: ['CKU-IPCONFIG', 'CKU-DNS-GW-ISSUES'],
    clones: [
      { os: 'Windows', cmd: 'ipconfig /all', shows: 'address, mask, gateway, DNS' },
      { os: 'macOS/Linux', cmd: 'ifconfig or ip addr', shows: 'interface addresses and masks' },
      { os: 'any client', cmd: 'ping default gateway', shows: 'local L3 reachability to the router' },
      { os: 'any client', cmd: 'nslookup or dig', shows: 'DNS resolution path' },
    ],
    paramKey: (p, i) => `${p.os.replace(/\W+/g, '')}-${i}`,
    build: ({ os, cmd, shows }) => ({
      question: `On ${os}, which check best verifies ${shows}?`,
      ...four(cmd, 'show spanning-tree vlan 1', 'vtp password', 'channel-group 1 mode on'),
      explanation: `Use \`${cmd}\` on ${os} to verify ${shows}.`,
    }),
  },

  // ── 1.11 wireless principles ────────────────────────────────────────────
  {
    id: '1.11-channels-24',
    kind: 'parametric',
    objectiveId: '1.11',
    idPrefix: 'obj-1.11-param-ch24',
    concept: '2.4 GHz non-overlapping channels',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-WIFI-CHANNELS', 'CKU-WLAN'],
    parameters: WIFI_CHANNELS_24.map(ch => ({ ch })),
    paramKey: p => String(p.ch),
    build: ({ ch }) => ({
      question: `In the 2.4 GHz band (US), channel ${ch} is one of the standard non-overlapping set with which others?`,
      ...four(
        '1, 6, and 11',
        '2, 7, and 12 only',
        '36, 40, and 44 only',
        'Channels must be consecutive: 1,2,3',
      ),
      explanation: `Non-overlapping 2.4 GHz channels are 1, 6, and 11 (channel ${ch} is in that set).`,
    }),
  },
  {
    id: '1.11-channels-5',
    kind: 'parametric',
    objectiveId: '1.11',
    idPrefix: 'obj-1.11-param-ch5',
    concept: '5 GHz channel examples',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-WIFI-CHANNELS', 'CKU-WIFI-BANDS'],
    parameters: WIFI_CHANNELS_5.map(ch => ({ ch })),
    paramKey: p => String(p.ch),
    build: ({ ch }) => ({
      question: `Channel ${ch} is typically associated with which Wi-Fi band?`,
      ...four('5 GHz', '2.4 GHz only', 'Sub-1 GHz LoRa only', 'Infrared only'),
      explanation: `Channel ${ch} is a 5 GHz channel example (not the 1/6/11 2.4 GHz set).`,
    }),
  },

  // ── 1.12 virtualization ─────────────────────────────────────────────────
  {
    id: '1.12-virt-clones',
    kind: 'clone',
    objectiveId: '1.12',
    idPrefix: 'obj-1.12-param-virt',
    concept: 'virtualization fundamentals',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-VIRTUALIZATION', 'CKU-HYPERVISOR', 'CKU-NFV'],
    clones: VIRTUALIZATION,
    paramKey: p => p.term.replace(/\W+/g, '-').slice(0, 24),
    build: ({ term, meaning }) => ({
      question: `What best describes a ${term}?`,
      ...four(meaning, 'A Layer 2 STP role only', 'An OSPF LSA type', 'A syslog severity name'),
      explanation: `${term}: ${meaning}.`,
    }),
  },

  // ── 2.4 EtherChannel ────────────────────────────────────────────────────
  {
    id: '2.4-lacp-modes',
    kind: 'parametric',
    objectiveId: '2.4',
    idPrefix: 'obj-2.4-param-lacp',
    concept: 'LACP modes',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-LACP', 'CKU-ETHERCHANNEL'],
    parameters: LACP_MODES,
    paramKey: p => p.mode,
    build: ({ mode, meaning }) => ({
      question: `In EtherChannel, LACP mode "${mode}" means:`,
      ...four(meaning, 'Forces ON with no negotiation protocol', 'Disables the port permanently', 'Enables VTP pruning only'),
      explanation: `LACP ${mode}: ${meaning}.`,
    }),
  },
  {
    id: '2.4-channel-group',
    kind: 'parametric',
    objectiveId: '2.4',
    idPrefix: 'obj-2.4-param-cg',
    concept: 'channel-group configuration',
    type: 'application',
    difficulty: 'medium',
    ckuIds: ['CKU-ETHERCHANNEL', 'CKU-LACP'],
    parameters: EC_GROUPS.map(g => ({ g })),
    paramKey: p => String(p.g),
    build: ({ g }) => ({
      question: `Which interface command adds a port to EtherChannel group ${g} using LACP active?`,
      ...four(
        `channel-group ${g} mode active`,
        `channel-group ${g} mode on`,
        `lacp group ${g} force`,
        `switchport mode channel ${g}`,
      ),
      explanation: `\`channel-group ${g} mode active\` places the interface in Po${g} with LACP active.`,
    }),
  },

  // ── 2.6 / 2.7 / 2.8 WLAN ────────────────────────────────────────────────
  {
    id: '2.6-wlan-arch',
    kind: 'clone',
    objectiveId: '2.6',
    idPrefix: 'obj-2.6-param-arch',
    concept: 'wireless architectures',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-WLAN-ARCH', 'CKU-WLC'],
    clones: WLAN_ARCH,
    paramKey: p => p.arch.replace(/\W+/g, '-').slice(0, 24),
    build: ({ arch, trait }) => ({
      question: `Which trait best matches a ${arch}?`,
      ...four(trait, 'Requires Frame Relay maps', 'Disables all SSIDs permanently', 'Uses only Telnet to APs'),
      explanation: `${arch}: ${trait}.`,
    }),
  },
  {
    id: '2.7-wlan-phys',
    kind: 'clone',
    objectiveId: '2.7',
    idPrefix: 'obj-2.7-param-phys',
    concept: 'AP physical infrastructure',
    type: 'scenario',
    difficulty: 'medium',
    ckuIds: ['CKU-WLAN-PHYS'],
    clones: [
      { need: 'PoE for the AP', cmd: 'show power inline' },
      { need: 'correct access/trunk + VLAN on the AP uplink', cmd: 'show interfaces status' },
      { need: 'CDP/LLDP neighbor toward the AP', cmd: 'show cdp neighbors / show lldp neighbors' },
    ],
    paramKey: p => p.need.replace(/\W+/g, '-').slice(0, 28),
    build: ({ need, cmd }) => ({
      question: `You need to verify ${need}. Which check is most appropriate?`,
      ...four(cmd, 'show ip ospf database', 'show vlan brief only for QoS marks', 'crypto key generate rsa'),
      explanation: `To verify ${need}, use ${cmd}.`,
    }),
  },
  {
    id: '2.8-wlan-client',
    kind: 'clone',
    objectiveId: '2.8',
    idPrefix: 'obj-2.8-param-client',
    concept: 'WLAN client connectivity',
    type: 'troubleshooting',
    difficulty: 'medium',
    ckuIds: ['CKU-WLAN-CLIENT'],
    clones: [
      { issue: 'client associates but gets no IP', next: 'check DHCP scope / relay / WLAN VLAN mapping' },
      { issue: 'client cannot see the SSID', next: 'verify WLAN enabled and broadcast settings on WLC' },
      { issue: 'client connects to wrong VLAN', next: 'check SSID-to-VLAN / interface group mapping' },
      { issue: 'AP is up but clients fail 802.1X', next: 'verify RADIUS server reachability and shared secret' },
    ],
    paramKey: p => p.issue.replace(/\W+/g, '-').slice(0, 28),
    build: ({ issue, next }) => ({
      question: `Wireless symptom: ${issue}. What should you check next?`,
      ...four(next, 'Disable STP globally', 'Change native VLAN randomly', 'Remove all static routes'),
      explanation: `If ${issue}, next: ${next}.`,
    }),
  },

  // ── 3.6 routing troubleshoot ────────────────────────────────────────────
  {
    id: '3.6-route-tshoot',
    kind: 'clone',
    objectiveId: '3.6',
    idPrefix: 'obj-3.6-param-ts',
    concept: 'routing troubleshooting',
    type: 'troubleshooting',
    difficulty: 'hard',
    ckuIds: ['CKU-ROUTE-TSHOOT', 'CKU-TROUBLESHOOT'],
    clones: ROUTE_TSHOOT,
    paramKey: p => p.symptom.replace(/\W+/g, '-').slice(0, 28),
    build: ({ symptom, fix }) => ({
      question: `Symptom: ${symptom}. Best next action?`,
      ...four(fix, 'Erase the startup-config immediately', 'Shut all interfaces', 'Disable CDP only'),
      explanation: `${symptom} → ${fix}.`,
    }),
  },

  // ── 4.4 SNMP ────────────────────────────────────────────────────────────
  {
    id: '4.4-snmp-ver',
    kind: 'parametric',
    objectiveId: '4.4',
    idPrefix: 'obj-4.4-param-snmp',
    concept: 'SNMP versions',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-SNMP'],
    parameters: SNMP_VERSIONS,
    paramKey: p => p.v,
    build: ({ v, trait }) => ({
      question: `SNMP ${v} is best described as:`,
      ...four(trait, 'A Layer 2 loop-prevention protocol', 'An EtherChannel load-balance method', 'A NAT translation type'),
      explanation: `SNMP ${v}: ${trait}.`,
    }),
  },
  {
    id: '4.4-snmp-ops',
    kind: 'clone',
    objectiveId: '4.4',
    idPrefix: 'obj-4.4-param-op',
    concept: 'SNMP operations',
    type: 'definition',
    difficulty: 'easy',
    ckuIds: ['CKU-SNMP'],
    clones: [
      { op: 'Get', meaning: 'NMS polls a single OID value from the agent' },
      { op: 'GetNext / GetBulk', meaning: 'NMS walks tables efficiently' },
      { op: 'Set', meaning: 'NMS writes a value to a writable OID' },
      { op: 'Trap / Inform', meaning: 'agent notifies the NMS of an event' },
    ],
    paramKey: p => p.op.replace(/\W+/g, ''),
    build: ({ op, meaning }) => ({
      question: `In SNMP, what does a ${op} operation do?`,
      ...four(meaning, 'Forms an OSPF adjacency', 'Creates a VLAN', 'Compresses an IPv6 address'),
      explanation: `SNMP ${op}: ${meaning}.`,
    }),
  },

  // ── 4.6 DHCP relay ──────────────────────────────────────────────────────
  {
    id: '4.6-helper',
    kind: 'parametric',
    objectiveId: '4.6',
    idPrefix: 'obj-4.6-param-helper',
    concept: 'DHCP relay helper',
    type: 'application',
    difficulty: 'medium',
    ckuIds: ['CKU-DHCP-RELAY'],
    parameters: DHCP_HELPERS,
    paramKey: p => `${p.if}-${p.server}`.replace(/\W+/g, ''),
    build: ({ if: intf, server }) => ({
      question: `Which command on ${intf} relays DHCP to server ${server}?`,
      ...four(
        `ip helper-address ${server}`,
        `ip dhcp pool ${server}`,
        `ip route ${server} 255.255.255.255 null0`,
        `helper-address dhcp ${intf}`,
      ),
      explanation: `\`ip helper-address ${server}\` on ${intf} forwards DHCP broadcasts to the server.`,
    }),
  },

  // ── 4.7 QoS ─────────────────────────────────────────────────────────────
  {
    id: '4.7-qos-phb',
    kind: 'parametric',
    objectiveId: '4.7',
    idPrefix: 'obj-4.7-param-phb',
    concept: 'QoS PHB markings',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-QOS-PHB', 'CKU-QOS'],
    parameters: QOS_MARKS,
    paramKey: p => p.name.replace(/\W+/g, ''),
    build: ({ name, use }) => ({
      question: `Which traffic class is ${name} commonly used for?`,
      ...four(use, 'Spanning Tree root election only', 'VTP version negotiation', 'CDP timer tuning only'),
      explanation: `${name} PHB/marking is commonly used for ${use}.`,
    }),
  },

  // ── 4.8 remote access / SSH ─────────────────────────────────────────────
  {
    id: '4.8-ssh-steps',
    kind: 'clone',
    objectiveId: '4.8',
    idPrefix: 'obj-4.8-param-ssh',
    concept: 'SSH device setup',
    type: 'application',
    difficulty: 'medium',
    ckuIds: ['CKU-SSH'],
    clones: SSH_STEPS,
    paramKey: p => p.step,
    build: ({ step, cmd, why }) => ({
      question: `When hardening remote access with SSH, why run \`${cmd}\` (${step})?`,
      ...four(why, 'It enables OSPF area 0', 'It creates VLAN 1', 'It disables all routing'),
      explanation: `\`${cmd}\`: ${why}.`,
    }),
  },

  // ── 4.9 TFTP/FTP ────────────────────────────────────────────────────────
  {
    id: '4.9-tftp-ftp',
    kind: 'parametric',
    objectiveId: '4.9',
    idPrefix: 'obj-4.9-param-xfer',
    concept: 'TFTP vs FTP',
    type: 'definition',
    difficulty: 'easy',
    ckuIds: ['CKU-TFTP-FTP'],
    parameters: TFTP_FTP,
    paramKey: p => p.proto.toLowerCase(),
    build: ({ proto, port, trait }) => ({
      question: `${proto} (port ${port}) is best described as:`,
      ...four(trait, 'An IGP metric type', 'A wireless encryption cipher', 'A STP port role'),
      explanation: `${proto} uses port ${port}: ${trait}.`,
    }),
  },

  // ── 4.10 cloud vs local mgmt ────────────────────────────────────────────
  {
    id: '4.10-mgmt-models',
    kind: 'clone',
    objectiveId: '4.10',
    idPrefix: 'obj-4.10-param-mgmt',
    concept: 'device management models',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-MGMT-CLOUD', 'CKU-CLOUD-MGMT'],
    clones: CLOUD_MGMT,
    paramKey: p => p.model.replace(/\W+/g, '-').slice(0, 24),
    build: ({ model, trait }) => ({
      question: `What characterizes ${model} device management?`,
      ...four(trait, 'Requires Frame Relay DLCI maps', 'Disables SNMP forever', 'Uses only RIP v1'),
      explanation: `${model}: ${trait}.`,
    }),
  },

  // ── 5.2 security program ────────────────────────────────────────────────
  {
    id: '5.2-sec-program',
    kind: 'clone',
    objectiveId: '5.2',
    idPrefix: 'obj-5.2-param-prog',
    concept: 'security program elements',
    type: 'definition',
    difficulty: 'easy',
    ckuIds: ['CKU-SECURITY-PROGRAM'],
    clones: SECURITY_PROGRAM,
    paramKey: p => p.element.replace(/\W+/g, '-').slice(0, 28),
    build: ({ element, why }) => ({
      question: `Why is "${element}" part of a security program?`,
      ...four(why, 'It replaces the need for passwords', 'It disables all firewalls', 'It is only a Layer 1 cable standard'),
      explanation: `${element}: ${why}.`,
    }),
  },

  // ── 5.4 AAA ─────────────────────────────────────────────────────────────
  {
    id: '5.4-aaa-ports',
    kind: 'parametric',
    objectiveId: '5.4',
    idPrefix: 'obj-5.4-param-aaa',
    concept: 'AAA server ports',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-AAA-SERVERS', 'CKU-AAA'],
    parameters: AAA_PORTS,
    paramKey: p => p.proto.replace(/\W+/g, '').toLowerCase(),
    build: ({ proto, auth, acct }) => ({
      question: `Which ports does ${proto} commonly use for authentication / accounting?`,
      ...four(
        auth === acct ? `${auth} (both)` : `${auth} / ${acct}`,
        '22 / 23',
        '80 / 443',
        '179 / 110',
      ),
      explanation: `${proto} commonly uses ${auth === acct ? `TCP ${auth}` : `${auth}/${acct}`}.`,
    }),
  },
  {
    id: '5.4-aaa-clones',
    kind: 'clone',
    objectiveId: '5.4',
    idPrefix: 'obj-5.4-param-model',
    concept: 'AAA model',
    type: 'definition',
    difficulty: 'easy',
    ckuIds: ['CKU-AAA'],
    clones: [
      { letter: 'Authentication', meaning: 'who you are (identity)' },
      { letter: 'Authorization', meaning: 'what you are allowed to do' },
      { letter: 'Accounting', meaning: 'what you did (logging/audit)' },
    ],
    paramKey: p => p.letter.toLowerCase().replace(/\W+/g, '-'),
    build: ({ letter, meaning }) => ({
      question: `In AAA, ${letter} means:`,
      ...four(meaning, 'Spanning Tree port role', 'NAT inside list only', 'VTP mode server only'),
      explanation: `${letter}: ${meaning}.`,
    }),
  },

  // ── 5.6 L2 security ─────────────────────────────────────────────────────
  {
    id: '5.6-l2-sec',
    kind: 'clone',
    objectiveId: '5.6',
    idPrefix: 'obj-5.6-param-l2',
    concept: 'Layer 2 security features',
    type: 'application',
    difficulty: 'medium',
    ckuIds: ['CKU-PORT-SECURITY', 'CKU-DHCP-SNOOPING', 'CKU-BPDU-GUARD'],
    clones: L2_SEC,
    paramKey: p => p.feature.replace(/\W+/g, '-').slice(0, 24),
    build: ({ feature, cmd, purpose }) => ({
      question: `Which feature (${feature}) is used to ${purpose}?`,
      ...four(
        `\`${cmd}\` / ${feature}`,
        'ip route 0.0.0.0 0.0.0.0 null0 only',
        'passive-interface default only',
        'banner motd only',
      ),
      explanation: `${feature} (\`${cmd}\`): ${purpose}.`,
    }),
  },

  // ── 5.8 / 5.9 wireless security ─────────────────────────────────────────
  {
    id: '5.8-wpa-modes',
    kind: 'parametric',
    objectiveId: '5.8',
    idPrefix: 'obj-5.8-param-wpa',
    concept: 'wireless security protocols',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-WLAN-SEC', 'CKU-WLAN-SECURITY'],
    parameters: WPA_MODES,
    paramKey: p => p.mode.replace(/\W+/g, ''),
    build: ({ mode, trait }) => ({
      question: `${mode} is best described as:`,
      ...four(trait, 'An OSPF network type', 'A syslog facility', 'A NAT pool type'),
      explanation: `${mode}: ${trait}.`,
    }),
  },
  {
    id: '5.9-wpa2-psk',
    kind: 'clone',
    objectiveId: '5.9',
    idPrefix: 'obj-5.9-param-psk',
    concept: 'WPA2-PSK WLAN config',
    type: 'scenario',
    difficulty: 'medium',
    ckuIds: ['CKU-WPA2-PSK', 'CKU-WLAN-SECURITY'],
    clones: [
      { ssid: 'CORP-WIFI', key: 'Str0ngKey!' },
      { ssid: 'GUEST', key: 'Welcome123' },
      { ssid: 'LAB-SSID', key: 'LabOnly#1' },
    ],
    paramKey: p => p.ssid.toLowerCase(),
    build: ({ ssid, key }) => ({
      question: `Configuring WLAN "${ssid}" with WPA2-PSK, what must match on AP/WLC and clients?`,
      ...four(
        `The pre-shared key (e.g. related to "${key}") and SSID security settings`,
        'Only the OSPF process ID',
        'Only the VTP password',
        'Only the native VLAN on every trunk worldwide',
      ),
      explanation: `WPA2-PSK for ${ssid} requires matching PSK and WLAN security settings on infrastructure and clients.`,
    }),
  },

  // ── 5.10 VPN types ──────────────────────────────────────────────────────
  {
    id: '5.10-vpn-types',
    kind: 'parametric',
    objectiveId: '5.10',
    idPrefix: 'obj-5.10-param-vpn',
    concept: 'VPN types',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-VPN'],
    parameters: VPN_TYPES,
    paramKey: p => p.key,
    build: ({ label, trait }) => ({
      question: `A ${label} is best described as:`,
      ...four(trait, 'A Layer 2 access VLAN only', 'An STP port state', 'A DHCP option code'),
      explanation: `${label}: ${trait}.`,
    }),
  },

  // ── 5.11 segmentation ───────────────────────────────────────────────────
  {
    id: '5.11-segment',
    kind: 'clone',
    objectiveId: '5.11',
    idPrefix: 'obj-5.11-param-seg',
    concept: 'network segmentation',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-SEGMENTATION', 'CKU-SECURITY-PROGRAM'],
    clones: SEGMENTATION,
    paramKey: p => p.method.replace(/\W+/g, '-').slice(0, 24),
    build: ({ method, effect }) => ({
      question: `How do ${method} help network security segmentation?`,
      ...four(effect, 'They replace the need for any passwords', 'They disable Syslog', 'They force all traffic to HTTP'),
      explanation: `${method}: ${effect}.`,
    }),
  },

  // ── 6.4 DNA / controller ────────────────────────────────────────────────
  {
    id: '6.4-dna-clones',
    kind: 'clone',
    objectiveId: '6.4',
    idPrefix: 'obj-6.4-param-dna',
    concept: 'controller-based vs traditional',
    type: 'definition',
    difficulty: 'medium',
    ckuIds: ['CKU-DNA'],
    clones: [
      { q: 'Traditional campus management typically means:', a: 'Per-device CLI/SNMP configuration' },
      { q: 'Controller-based (e.g. Cisco DNA Center) management emphasizes:', a: 'Centralized policy, assurance, and automation' },
      { q: 'A benefit of controller-based management vs box-by-box CLI is:', a: 'Consistent intent applied across many devices' },
      { q: 'Southbound from a campus controller toward devices often uses:', a: 'Device protocols/APIs (e.g. NETCONF/RESTCONF/SSH)' },
    ],
    paramKey: p => p.a.replace(/\W+/g, '-').slice(0, 28),
    build: ({ q, a }) => ({
      question: q,
      ...four(a, 'Disabling all routing protocols', 'Removing AAA entirely', 'Using hubs instead of switches'),
      explanation: a,
    }),
  },
]
