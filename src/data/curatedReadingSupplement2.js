/**
 * Reading supplements batch 2 — remaining AI-dependent objectives.
 */
import { shell, SRC } from './curatedShell.js'

export const READING_SUPPLEMENTS_2 = {
  '2.6': shell({
    objectiveId: '2.6', domainId: 'access', title: 'Compare Cisco wireless architectures and AP modes',
    ckus: [
      { id: 'CKU-WLC-ARCH', title: 'Cisco Wireless Architectures', summary: 'Split-MAC: lightweight AP + WLC centralizes control. Autonomous: standalone AP runs full stack locally.', aliases: ['split-mac', 'lightweight'], tags: ['wireless'], sourceRefs: SRC('2.6') },
      { id: 'CKU-AP-MODES', title: 'AP Modes', summary: 'Local/FlexConnect/Sniffer/Monitor/Rogue Detector/Bridge — each changes where traffic is switched and what the AP monitors.', aliases: ['flexconnect', 'local mode'], tags: ['wireless'], sourceRefs: SRC('2.6') },
    ],
    reading: {
      id: 'READ-2.6', ckuIds: ['CKU-WLC-ARCH', 'CKU-AP-MODES'], estimatedReadMinutes: 6,
      tiers: {
        beginner: 'Cisco WLANs can run with a central Wireless LAN Controller (WLC) and lightweight APs, or with standalone autonomous APs.',
        intermediate: 'Split-MAC moves encryption, authentication, and roaming decisions to the WLC; APs tunnel or locally switch client traffic depending on mode (Local vs FlexConnect).',
        examReady: 'Centralized: CAPWAP tunnel to WLC, lightweight AP. Autonomous: full IOS on AP. AP modes: Local (central switching), FlexConnect (local switching at branch), Monitor/Sniffer/Rogue/Bridge for surveys and WIPS.',
      },
      definition: '**Cisco wireless** uses **lightweight APs + WLC** (split-MAC) or **autonomous APs**; **AP modes** define switching and monitoring behavior.',
      keyPoints: ['Lightweight AP needs WLC (CAPWAP).', 'FlexConnect = local switching at remote site.', 'Autonomous = no WLC required.', 'Monitor/Sniffer modes for surveys.'],
      realWorld: 'Enterprise campus = centralized WLC; branches often FlexConnect.',
      commonMistakes: ['Thinking all APs are autonomous.', 'Confusing FlexConnect with mesh bridge mode.'],
      related: ['2.7 WLAN cabling', '2.8 WLAN config'],
      advanced: 'Mobility groups allow WLC redundancy and roaming.',
      sourceRefs: SRC('2.6'),
    },
  }),

  '2.7': shell({
    objectiveId: '2.7', domainId: 'access', title: 'Describe physical infrastructure connections of WLAN components',
    ckus: [
      { id: 'CKU-WLAN-CABLING', title: 'WLAN Physical Connections', summary: 'APs connect via Ethernet (PoE) to access switches; WLCs sit on wired core/distribution.', aliases: ['PoE', 'AP uplink'], tags: ['wireless'], sourceRefs: SRC('2.7') },
    ],
    reading: {
      id: 'READ-2.7', ckuIds: ['CKU-WLAN-CABLING'], estimatedReadMinutes: 4,
      tiers: {
        beginner: 'Access points plug into switches with Ethernet; many use Power over Ethernet so no separate power brick is needed.',
        intermediate: 'AP → PoE access switch → distribution/core → WLC on wired network. CAPWAP control/data tunnels ride over the wired path.',
        examReady: 'AP uplink: Ethernet to access-layer switch, typically 802.3af/at PoE. WLC connects like any network appliance. VLANs/trunk carry client SSID traffic; management VLAN reaches WLC.',
      },
      definition: 'WLAN **APs connect via Ethernet/PoE** to access switches; **WLCs** connect on the wired campus network.',
      keyPoints: ['PoE powers most enterprise APs.', 'AP is an access-layer device.', 'Trunk/access VLANs carry SSID traffic.', 'WLC needs IP reachability from APs.'],
      realWorld: 'Verify PoE budget on switch stack before adding APs.',
      commonMistakes: ['Plugging AP into wrong VLAN without DHCP/management path.'],
      related: ['2.6 Architectures', '2.8 Client connectivity'],
      advanced: '802.3bt for high-power APs with multiple radios.',
      sourceRefs: SRC('2.7'),
    },
  }),

  '2.8': shell({
    objectiveId: '2.8', domainId: 'access', title: 'Configure WLAN components for client connectivity',
    ckus: [
      { id: 'CKU-SSID-SECURITY', title: 'SSID and WLAN Security', summary: 'SSID names the network; WPA2-Personal (PSK) or WPA2-Enterprise (802.1X) secures client association.', aliases: ['SSID', 'WPA2'], tags: ['wireless'], sourceRefs: SRC('2.8') },
    ],
    reading: {
      id: 'READ-2.8', ckuIds: ['CKU-SSID-SECURITY'], estimatedReadMinutes: 5,
      tiers: {
        beginner: 'Clients join a WLAN by SSID name and passphrase or certificate, depending on security policy.',
        intermediate: 'On WLC: create WLAN/SSID, map to VLAN, enable interface, assign security (WPA2-AES PSK or 802.1X). APs must register to WLC and have radios enabled.',
        examReady: 'WLAN must be **enabled**, bound to interface/VLAN, correct **radio policy**, and security (WPA2-AES). Troubleshoot: AP registered? SSID broadcast? VLAN/DHCP for clients?',
      },
      definition: 'Client **WLAN connectivity** requires enabled **SSID**, correct **VLAN/interface**, **security policy**, and **AP/WLC registration**.',
      keyPoints: ['SSID can be disabled — clients cannot join.', 'WPA2-AES is standard.', 'WLAN maps to VLAN for client subnet.', 'Check AP join to WLC.'],
      realWorld: 'Disabled WLAN status is a common post-maintenance outage cause.',
      commonMistakes: ['WLAN disabled after maintenance.', 'Wrong VLAN — clients get no IP.'],
      related: ['5.9 WPA2 PSK', '2.6 AP modes'],
      advanced: 'FlexConnect local switching affects DHCP placement.',
      sourceRefs: SRC('2.8'),
    },
  }),

  '3.6': shell({
    objectiveId: '3.6', domainId: 'connectivity', title: 'Troubleshoot routing issues',
    ckus: [
      { id: 'CKU-ROUTE-TSHOOT', title: 'Routing Troubleshooting', summary: 'Verify route presence, next-hop reachability, AD/metric, ACLs blocking control plane, and symmetric paths.', aliases: ['routing troubleshoot'], tags: ['routing'], sourceRefs: SRC('3.6') },
    ],
    reading: {
      id: 'READ-3.6', ckuIds: ['CKU-ROUTE-TSHOOT'], estimatedReadMinutes: 6,
      tiers: {
        beginner: 'When traffic fails, check: is there a route? Is the interface up? Can the router reach the next hop?',
        intermediate: 'Use `show ip route`, `ping`/`traceroute`, `show ip protocols`, `show ip ospf neighbor`. Common causes: interface down, wrong static, timer/area mismatch, ACL blocking OSPF.',
        examReady: 'Flow: `show ip route` → route missing? check interface/protocol config. Route present? ping next-hop, check ACLs, asymmetric routing. Floating static: verify AD. Default route: `0.0.0.0/0` or `::/0`.',
      },
      definition: '**Routing troubleshooting** verifies **route installation**, **next-hop reachability**, **protocol adjacency**, and **ACL/control-plane** blocks.',
      keyPoints: ['`show ip route` first.', 'Ping next-hop, not only far end.', 'OSPF: area, timers, subnet, auth.', 'Static: correct mask and exit interface.'],
      realWorld: 'Asymmetric routing breaks stateful firewalls.',
      commonMistakes: ['Ping destination without checking each hop.', 'Forgetting ACL on interface blocks OSPF.'],
      related: ['3.1 Routing table', '3.4 OSPF'],
      advanced: 'Recursive static needs resolving next-hop route.',
      sourceRefs: SRC('3.6'),
    },
    examTraps: [{ id: '3.6-t1', trap: 'Assuming dynamic routes always beat static.', correction: 'Lower AD wins — static AD 1 beats OSPF AD 110.', ckuIds: ['CKU-ROUTE-TSHOOT'] }],
  }),

  '4.4': shell({
    objectiveId: '4.4', domainId: 'services', title: 'Explain the function of SNMP',
    ckus: [
      { id: 'CKU-SNMP', title: 'SNMP', summary: 'Simple Network Management Protocol polls/monitors devices via MIB OIDs; v2c community strings; v3 adds auth/privacy.', aliases: ['MIB', 'OID'], tags: ['snmp'], sourceRefs: SRC('4.4') },
    ],
    reading: {
      id: 'READ-4.4', ckuIds: ['CKU-SNMP'], estimatedReadMinutes: 4,
      tiers: {
        beginner: 'SNMP lets a management server ask devices for stats and send traps when something breaks.',
        intermediate: 'Manager polls agents; MIB defines OIDs. Traps/informs are asynchronous alerts. SNMPv2c uses communities; v3 uses username/auth/priv.',
        examReady: 'SNMP agent on device, manager (NMS) polls UDP/161, traps to 162. `snmp-server community` (v2c) or SNMPv3 user groups. Read-only vs read-write community.',
      },
      definition: '**SNMP** collects **MIB/OID** metrics from agents and sends **traps** to network management systems.',
      keyPoints: ['UDP 161 poll, 162 traps.', 'MIB = metric catalog.', 'v2c community; v3 secure.', 'RO community for monitoring.'],
      realWorld: 'Never use RW community on internet-facing interfaces.',
      commonMistakes: ['Confusing SNMP with syslog.'],
      related: ['4.5 Syslog'],
      advanced: 'SNMPv3 authPriv = auth + encryption.',
      sourceRefs: SRC('4.4'),
    },
  }),

  '4.7': shell({
    objectiveId: '4.7', domainId: 'services', title: 'Explain QoS forwarding per-hop behavior',
    ckus: [
      { id: 'CKU-QOS-PHB', title: 'QoS PHB', summary: 'Classification + marking (CoS/DSCP) → queuing/scheduling → congestion management per hop.', aliases: ['DSCP', 'CoS', 'PHB'], tags: ['qos'], sourceRefs: SRC('4.7') },
    ],
    reading: {
      id: 'READ-4.7', ckuIds: ['CKU-QOS-PHB'], estimatedReadMinutes: 5,
      tiers: {
        beginner: 'QoS marks important traffic so routers/switches can queue voice/video ahead of bulk data.',
        intermediate: 'Classify/map to DSCP (L3) or CoS (L2). Trust boundary decides whether to accept markings. Queues: LLQ for voice, WFQ/CBWFQ for data.',
        examReady: 'PHB at each hop: **classify** → **mark** (DSCP/CoS) → **queue** (LLQ, priority) → **drop** (WRED). Trust boundary on ingress. Voice DSCP EF (46), CS5 for signaling.',
      },
      definition: '**QoS PHB** applies **classification, marking, queuing, and dropping** policies at each network hop.',
      keyPoints: ['Mark at trust boundary.', 'DSCP = L3, CoS = L2 (3 bits).', 'LLQ = priority queue for voice.', 'WRED mitigates TCP tail drop.'],
      realWorld: 'Mismatch trust boundaries = wrong priority end-to-end.',
      commonMistakes: ['Marking without queuing policy — no effect.'],
      related: ['2.8 WLAN QoS trust'],
      advanced: 'Policing vs shaping — policing drops excess.',
      sourceRefs: SRC('4.7'),
    },
  }),

  '4.8': shell({
    objectiveId: '4.8', domainId: 'services', title: 'Configure network devices for remote access using SSH',
    ckus: [
      { id: 'CKU-SSH-CONFIG', title: 'SSH Configuration', summary: 'Generate RSA keys, domain name, local user, `transport input ssh` on VTY, optional `ip ssh version 2`.', aliases: ['ssh'], tags: ['ssh'], sourceRefs: SRC('4.8') },
    ],
    reading: {
      id: 'READ-4.8', ckuIds: ['CKU-SSH-CONFIG'], estimatedReadMinutes: 5,
      tiers: {
        beginner: 'SSH encrypts remote CLI; Telnet is insecure and should be disabled.',
        intermediate: '`ip domain-name`, `crypto key generate rsa`, `username secret`, `line vty` → `login local` → `transport input ssh`.',
        examReady: 'SSH checklist: hostname + domain → RSA keys → `username` → `line vty 0 15` → `login local` → `transport input ssh` → `ip ssh version 2`. Verify: `show ip ssh`.',
      },
      definition: '**SSH** requires **RSA keys**, **local users**, and **VTY transport input ssh** for encrypted management.',
      keyPoints: ['Domain name required for RSA.', 'Disable Telnet on VTY.', '`username secret` not password.', 'SSH uses TCP 22.'],
      realWorld: 'ACL on VTY limits who can SSH.',
      commonMistakes: ['`transport input ssh` before generating keys.'],
      related: ['5.3 Device access'],
      advanced: 'SCP uses SSH subsystem for file copy.',
      sourceRefs: SRC('4.8'),
    },
  }),

  '4.9': shell({
    objectiveId: '4.9', domainId: 'services', title: 'Describe TFTP and FTP capabilities',
    ckus: [
      { id: 'CKU-TFTP-FTP', title: 'TFTP and FTP', summary: 'TFTP UDP/69 — simple firmware/config copy, no auth. FTP TCP/21 — authenticated file transfer.', aliases: ['tftp', 'ftp'], tags: ['file transfer'], sourceRefs: SRC('4.9') },
    ],
    reading: {
      id: 'READ-4.9', ckuIds: ['CKU-TFTP-FTP'], estimatedReadMinutes: 4,
      tiers: {
        beginner: 'Routers copy IOS images and configs to servers using TFTP or FTP.',
        intermediate: 'TFTP: UDP/69, no authentication, common for `copy flash: tftp:`. FTP: TCP/21, supports credentials.',
        examReady: 'TFTP = UDP 69, lightweight, no auth. FTP = TCP 21 (+ data channel), supports login. `copy running-config tftp:` / `copy tftp: flash:` for backup/upgrade.',
      },
      definition: '**TFTP** (UDP/69) and **FTP** (TCP/21) transfer **IOS images and configs** to/from network devices.',
      keyPoints: ['TFTP no auth — lab/trusted nets only.', 'FTP supports authentication.', '`copy` commands for backup/restore.', 'SCP/SFTP over SSH is more secure.'],
      realWorld: 'Use SCP in production instead of TFTP.',
      commonMistakes: ['TFTP across untrusted networks.'],
      related: ['4.8 SSH/SCP'],
      advanced: 'USB on some platforms for local copy.',
      sourceRefs: SRC('4.9'),
    },
  }),

  '4.10': shell({
    objectiveId: '4.10', domainId: 'services', title: 'Compare local and cloud-based device management',
    ckus: [
      { id: 'CKU-MGMT-CLOUD', title: 'Local vs Cloud Management', summary: 'Local = CLI per device; cloud = centralized dashboard (DNA Center, Meraki) with automation and telemetry.', aliases: ['dna center', 'meraki'], tags: ['management'], sourceRefs: SRC('4.10') },
    ],
    reading: {
      id: 'READ-4.10', ckuIds: ['CKU-MGMT-CLOUD'], estimatedReadMinutes: 4,
      tiers: {
        beginner: 'Local management logs into each box; cloud tools manage many devices from one web portal.',
        intermediate: 'On-prem NMS/SNMP/syslog vs cloud controllers (Meraki dashboard, DNA Center) with templates, monitoring, and API automation.',
        examReady: 'Local: SSH/CLI per device, manual consistency. Cloud: centralized provisioning, monitoring, analytics, subscription model, internet reachability required.',
      },
      definition: '**Local management** is per-device **CLI**; **cloud management** centralizes **provisioning, monitoring, and APIs**.',
      keyPoints: ['Cloud = scale + analytics.', 'Local = full control offline.', 'DNA Center on-prem controller option.', 'Meraki = cloud-native.'],
      realWorld: 'Hybrid: DNA Center on-prem with cloud analytics.',
      commonMistakes: ['Thinking cloud eliminates need for underlay IP connectivity.'],
      related: ['6.4 DNA Center'],
      advanced: 'Intent-based networking in DNA Center.',
      sourceRefs: SRC('4.10'),
    },
  }),

  '5.4': shell({
    objectiveId: '5.4', domainId: 'security', title: 'Configure and verify AAA with TACACS+/RADIUS',
    ckus: [
      { id: 'CKU-AAA-SERVERS', title: 'TACACS+ and RADIUS', summary: 'TACACS+ TCP/49 — separates auth/author/accounting, common for device admin. RADIUS UDP — common for network access (802.1X).', aliases: ['tacacs+', 'radius'], tags: ['aaa'], sourceRefs: SRC('5.4') },
    ],
    reading: {
      id: 'READ-5.4', ckuIds: ['CKU-AAA-SERVERS'], estimatedReadMinutes: 6,
      tiers: {
        beginner: 'AAA outsources login to a central server instead of only local usernames.',
        intermediate: '`aaa new-model`, define server, `aaa authentication login default group tacacs+ local`. TACACS+ for router admin; RADIUS for WLAN/VPN access.',
        examReady: 'TACACS+ TCP/49 — device admin, per-command authorization possible. RADIUS UDP/1812 auth, 1813 acct — 802.1X/WLAN. `aaa new-model` enables AAA. Fallback `local` if server down.',
      },
      definition: '**AAA** with **TACACS+** (device admin) or **RADIUS** (network access) centralizes authentication, authorization, and accounting.',
      keyPoints: ['`aaa new-model` required.', 'TACACS+ = Cisco device login.', 'RADIUS = WLAN/VPN/802.1X.', 'Always configure local fallback.'],
      realWorld: 'Separate ISE/RADIUS for users, TACACS for ops team.',
      commonMistakes: ['No local fallback — lockout if server fails.'],
      related: ['5.7 AAA concepts', '5.8 RADIUS ports'],
      advanced: 'ISE can do both profiling and auth.',
      sourceRefs: SRC('5.4'),
    },
  }),

  '5.7': shell({
    objectiveId: '5.7', domainId: 'security', title: 'Compare authentication, authorization, accounting',
    ckus: [
      { id: 'CKU-AAA-TRIPLE', title: 'Authentication, Authorization, Accounting', summary: 'Auth = who are you; Author = what may you do; Accounting = log what you did.', aliases: ['AAA'], tags: ['aaa'], sourceRefs: SRC('5.7') },
    ],
    reading: {
      id: 'READ-5.7', ckuIds: ['CKU-AAA-TRIPLE'], estimatedReadMinutes: 4,
      tiers: {
        beginner: 'AAA answers: who is logging in, what commands/networks they can use, and a record of their actions.',
        intermediate: 'Authentication validates credentials; authorization applies policy (shell profile, command set, VLAN); accounting sends start/stop records to server.',
        examReady: 'AAA: **Authentication** (identity), **Authorization** (permissions/policy), **Accounting** (audit logs). TACACS+ can split all three; RADIUS strong on auth/acct for network access.',
      },
      definition: '**AAA** = **Authentication** (identity), **Authorization** (permissions), **Accounting** (audit trail).',
      keyPoints: ['Auth ≠ authorization.', 'Accounting = compliance/forensics.', 'TACACS+ separates AAA functions.', 'RADIUS common for 802.1X.'],
      realWorld: 'Accounting logs who changed what on routers.',
      commonMistakes: ['Enabling auth without authorization policy.'],
      related: ['5.4 TACACS+/RADIUS'],
      advanced: 'CoA (Change of Authorization) for dynamic policy.',
      sourceRefs: SRC('5.7'),
    },
  }),

  '5.8': shell({
    objectiveId: '5.8', domainId: 'security', title: 'Describe wireless security protocols',
    ckus: [
      { id: 'CKU-WLAN-SEC', title: 'Wireless Security Protocols', summary: 'WEP (broken), WPA (TKIP), WPA2 (AES/CCMP), WPA3. Enterprise uses 802.1X; Personal uses PSK.', aliases: ['WPA2', 'WPA3', '802.1X'], tags: ['wireless', 'security'], sourceRefs: SRC('5.8') },
    ],
    reading: {
      id: 'READ-5.8', ckuIds: ['CKU-WLAN-SEC'], estimatedReadMinutes: 5,
      tiers: {
        beginner: 'Use WPA2 or WPA3 with AES — never WEP. Enterprise WLANs use usernames/certificates via 802.1X.',
        intermediate: 'WPA2-Personal = PSK; WPA2-Enterprise = 802.1X + RADIUS. TKIP is legacy; AES-CCMP is standard. WPA3 adds SAE for better PSK.',
        examReady: 'WEP obsolete. WPA2-AES (CCMP) minimum. WPA2-Enterprise = 802.1X + EAP + RADIUS. WPA3 improves open and PSK networks. TKIP lowers throughput — avoid.',
      },
      definition: 'Modern WLANs use **WPA2/WPA3 with AES**; **Enterprise** adds **802.1X**; **Personal** uses **PSK**.',
      keyPoints: ['WEP = never.', 'AES-CCMP preferred.', '802.1X = enterprise auth.', 'TKIP legacy only.'],
      realWorld: 'Rotate PSK when staff leave.',
      commonMistakes: ['WPA2-TKIP for new deployments.'],
      related: ['5.9 WPA2 PSK config'],
      advanced: 'OWE for encrypted open networks in WPA3.',
      sourceRefs: SRC('5.8'),
    },
  }),

  '5.9': shell({
    objectiveId: '5.9', domainId: 'security', title: 'Configure WLAN using WPA2 PSK',
    ckus: [
      { id: 'CKU-WPA2-PSK', title: 'WPA2-Personal (PSK)', summary: 'WLAN SSID + WPA2-AES + pre-shared key on WLC or autonomous AP GUI/CLI.', aliases: ['PSK', 'WPA2 personal'], tags: ['wireless'], sourceRefs: SRC('5.9') },
    ],
    reading: {
      id: 'READ-5.9', ckuIds: ['CKU-WPA2-PSK'], estimatedReadMinutes: 4,
      tiers: {
        beginner: 'WPA2-Personal uses one shared passphrase for all users on an SSID.',
        intermediate: 'On WLC GUI: WLAN → security WPA2 policy AES, PSK key. Bind WLAN to interface/VLAN; enable WLAN and AP radio.',
        examReady: 'WPA2-PSK: SSID enabled, **WPA2 + AES**, strong PSK, correct VLAN/DHCP. GUI path on WLC for WLAN security tab. Personal = no RADIUS required.',
      },
      definition: '**WPA2-PSK** secures a WLAN with a **shared AES-encrypted passphrase** on the SSID.',
      keyPoints: ['WPA2 + AES required.', 'PSK = pre-shared key.', 'WLAN must be enabled.', 'Map to VLAN with DHCP.'],
      realWorld: 'PSK suitable for small office; enterprise uses 802.1X.',
      commonMistakes: ['WPA2-TKIP selected by mistake.'],
      related: ['5.8 Wireless security', '2.8 WLAN connectivity'],
      advanced: 'PMF (802.11w) protects management frames.',
      sourceRefs: SRC('5.9'),
    },
  }),

  '5.10': shell({
    objectiveId: '5.10', domainId: 'security', title: 'Differentiate types of VPN and security concepts',
    ckus: [
      { id: 'CKU-VPN-TYPES', title: 'VPN Types', summary: 'Site-to-site IPsec connects networks; remote-access SSL/AnyConnect for road warriors; GRE is tunnel, not encryption alone.', aliases: ['ipsec', 'ssl vpn'], tags: ['vpn'], sourceRefs: SRC('5.10') },
    ],
    reading: {
      id: 'READ-5.10', ckuIds: ['CKU-VPN-TYPES'], estimatedReadMinutes: 5,
      tiers: {
        beginner: 'VPNs encrypt traffic over untrusted networks — site-to-site links branches; remote-access connects laptops.',
        intermediate: 'IPsec site-to-site with IKE phases, interesting traffic ACL, transform sets. SSL VPN for browser/client remote access. GRE adds tunnel header — pair with IPsec for security.',
        examReady: 'Site-to-site IPsec between gateways. Remote-access SSL/IPsec clients. GRE = tunnel protocol (not encryption by itself). DMVPN/FlexVPN beyond CCNA scope but GRE+IPsec concept appears.',
      },
      definition: '**Site-to-site IPsec** connects networks; **remote-access VPN** connects hosts; **GRE** provides tunneling often combined with **IPsec**.',
      keyPoints: ['IPsec = confidentiality/integrity.', 'GRE alone does not encrypt.', 'SSL VPN for remote users.', 'Interesting traffic ACL triggers IPsec.'],
      realWorld: 'Always pair GRE with IPsec on public internet.',
      commonMistakes: ['Thinking GRE alone is secure.'],
      related: ['5.5 ACLs for crypto ACL'],
      advanced: 'IKEv2 simplifies SA negotiation.',
      sourceRefs: SRC('5.10'),
    },
  }),

  '5.11': shell({
    objectiveId: '5.11', domainId: 'security', title: 'Describe security concepts of network segmentation',
    ckus: [
      { id: 'CKU-SEGMENTATION', title: 'Network Segmentation', summary: 'VLANs, VRFs, firewalls, and ACLs isolate blast radius; zero trust limits lateral movement.', aliases: ['microsegmentation'], tags: ['security'], sourceRefs: SRC('5.11') },
    ],
    reading: {
      id: 'READ-5.11', ckuIds: ['CKU-SEGMENTATION'], estimatedReadMinutes: 4,
      tiers: {
        beginner: 'Segmentation splits the network so a breach in one area cannot easily spread.',
        intermediate: 'VLANs for L2 separation, ACLs/firewalls for L3 policy between segments, DMZ for public services, management VLAN isolated.',
        examReady: 'Segmentation tools: **VLANs**, **VRFs**, **firewall zones**, **ACLs**. Principles: least privilege, deny by default between zones, separate management/data/IoT/guest.',
      },
      definition: '**Network segmentation** limits **blast radius** using **VLANs, firewalls, ACLs, and zones**.',
      keyPoints: ['Guest ≠ corporate VLAN.', 'DMZ for public servers.', 'ACLs enforce inter-VLAN policy.', 'Management plane isolated.'],
      realWorld: 'East-west firewalling in data centers.',
      commonMistakes: ['VLAN without L3 policy = segmentation theater.'],
      related: ['2.1 VLANs', '5.5 ACLs'],
      advanced: 'SD-Access macro/micro segmentation.',
      sourceRefs: SRC('5.11'),
    },
  }),

  '6.1': shell({
    objectiveId: '6.1', domainId: 'automation', title: 'Explain how automation impacts network management',
    ckus: [
      { id: 'CKU-AUTOMATION-IMPACT', title: 'Automation Impact', summary: 'Reduces manual CLI errors, speeds provisioning, enables consistency at scale via templates/APIs.', aliases: ['netdevops'], tags: ['automation'], sourceRefs: SRC('6.1') },
    ],
    reading: {
      id: 'READ-6.1', ckuIds: ['CKU-AUTOMATION-IMPACT'], estimatedReadMinutes: 4,
      tiers: {
        beginner: 'Automation replaces repetitive CLI with scripts and controllers so changes are faster and more consistent.',
        intermediate: 'Benefits: speed, repeatability, fewer typos, audit trail. Tools: Ansible, Python + APIs, DNA Center workflows.',
        examReady: 'Automation → faster provisioning, standardized configs, reduced human error, scalable changes, integration with CI/CD and monitoring.',
      },
      definition: '**Automation** improves **speed, consistency, and scale** while reducing **manual CLI errors** in network operations.',
      keyPoints: ['Templates over one-off CLI.', 'APIs enable orchestration.', 'Version-controlled desired state.', 'Frees engineers for design.'],
      realWorld: 'Start with read-only automation (audit) before push.',
      commonMistakes: ['Automating broken manual process without fixing design.'],
      related: ['6.5 REST APIs', '6.6 Ansible'],
      advanced: 'GitOps for network config review.',
      sourceRefs: SRC('6.1'),
    },
  }),

  '6.2': shell({
    objectiveId: '6.2', domainId: 'automation', title: 'Compare traditional networks with controller-based networking',
    ckus: [
      { id: 'CKU-CONTROLLER-BASED', title: 'Controller-Based Networking', summary: 'SDN separates control plane (controller) from data plane (switches), centralizing policy.', aliases: ['SDN', 'control plane'], tags: ['automation'], sourceRefs: SRC('6.2') },
    ],
    reading: {
      id: 'READ-6.2', ckuIds: ['CKU-CONTROLLER-BASED'], estimatedReadMinutes: 5,
      tiers: {
        beginner: 'Traditional: each device has its own brain. Controller-based: a central app tells switches how to forward.',
        intermediate: 'Southbound APIs (controller→devices), northbound (apps→controller). OpenFlow historic example; Cisco APIC-EM/DNA for enterprise.',
        examReady: 'Traditional = distributed control per device. Controller-based = centralized control plane, programmatic policy, southbound/northbound APIs, data plane still forwards.',
      },
      definition: '**Controller-based** networks centralize the **control plane** and expose **northbound APIs** for applications.',
      keyPoints: ['Control vs data plane separation.', 'Southbound = controller to device.', 'Northbound = apps to controller.', 'Policy as software.'],
      realWorld: 'DNA Center is on-prem controller for campus.',
      commonMistakes: ['Thinking controller replaces all data-plane forwarding.'],
      related: ['6.3 SDN architectures'],
      advanced: 'Intent-based = declare outcome, controller implements.',
      sourceRefs: SRC('6.2'),
    },
  }),

  '6.3': shell({
    objectiveId: '6.3', domainId: 'automation', title: 'Describe controller-based and software defined architectures',
    ckus: [
      { id: 'CKU-SDN-ARCH', title: 'SDN Architectures', summary: 'Underlay carries traffic; overlay (VXLAN) provides logical segmentation; controller programs both.', aliases: ['VXLAN', 'underlay'], tags: ['sdn'], sourceRefs: SRC('6.3') },
    ],
    reading: {
      id: 'READ-6.3', ckuIds: ['CKU-SDN-ARCH'], estimatedReadMinutes: 5,
      tiers: {
        beginner: 'SDN uses a controller to program switches; overlays like VXLAN build virtual networks on top of the physical underlay.',
        intermediate: 'Cisco ACI (data center spine-leaf + APIC), APIC-EM/DNA (enterprise). Fabric switching uses ECMP; spine-leaf non-blocking.',
        examReady: 'SDN: centralized control, underlay/overlay, VXLAN for L2 stretch. ACI = DC. APIC-EM/DNA Center = enterprise campus. Fabric path may use ECMP (3-hop spine-leaf typical).',
      },
      definition: '**SDN architectures** combine **underlay connectivity**, **overlay virtualization**, and a **controller** for policy.',
      keyPoints: ['Underlay = physical routing.', 'Overlay = VXLAN/VNI.', 'ACI for data center.', 'APIC-EM for enterprise.'],
      realWorld: 'Spine-leaf replaces 3-tier in modern DC.',
      commonMistakes: ['Confusing APIC with APIC-EM scope.'],
      related: ['6.4 DNA Center'],
      advanced: 'MP-BGP EVPN for VXLAN control plane.',
      sourceRefs: SRC('6.3'),
    },
  }),

  '6.4': shell({
    objectiveId: '6.4', domainId: 'automation', title: 'Compare traditional campus management with Cisco DNA Center',
    ckus: [
      { id: 'CKU-DNA-CENTER', title: 'Cisco DNA Center', summary: 'Intent-based campus controller: design, policy, provision, assurance from single GUI/API.', aliases: ['dna center'], tags: ['automation'], sourceRefs: SRC('6.4') },
    ],
    reading: {
      id: 'READ-6.4', ckuIds: ['CKU-DNA-CENTER'], estimatedReadMinutes: 4,
      tiers: {
        beginner: 'DNA Center is Cisco\'s dashboard to configure and monitor the whole campus instead of box-by-box CLI.',
        intermediate: 'Provides templates, SWIM, health dashboards, assurance analytics, REST APIs. On-prem appliance managing Catalyst switches/APs.',
        examReady: 'Traditional = per-device CLI, manual tracking. DNA Center = centralized design/policy/provisioning/assurance, image management, APIs, telemetry. Device config backup is a DNA feature vs basic CLI copy.',
      },
      definition: '**DNA Center** centralizes **campus design, policy, provisioning, and assurance** vs traditional per-device CLI.',
      keyPoints: ['Intent-based workflows.', 'Software image management.', 'Health/assurance dashboards.', 'REST API northbound.'],
      realWorld: 'Requires Cisco DNA licensing on devices.',
      commonMistakes: ['Expecting DNA to manage non-Cisco gear natively.'],
      related: ['4.10 Cloud management', '6.5 REST'],
      advanced: 'SD-Access fabric integration.',
      sourceRefs: SRC('6.4'),
    },
  }),

  '6.5': shell({
    objectiveId: '6.5', domainId: 'automation', title: 'Describe characteristics of REST-based APIs',
    ckus: [
      { id: 'CKU-REST-API', title: 'REST APIs', summary: 'HTTP methods on resources (URLs); stateless; JSON payloads; status codes 200/201/400/401/404.', aliases: ['REST', 'HTTP'], tags: ['api'], sourceRefs: SRC('6.5') },
    ],
    reading: {
      id: 'READ-6.5', ckuIds: ['CKU-REST-API'], estimatedReadMinutes: 5,
      tiers: {
        beginner: 'REST APIs let programs configure devices using standard web requests (GET, POST, PUT, DELETE).',
        intermediate: 'Resources identified by URI; JSON body; stateless requests. Common codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found.',
        examReady: 'REST over HTTP: GET=read, POST=create, PUT/PATCH=update, DELETE=remove. Stateless. JSON data. DNA Center southbound to devices, northbound to apps. RESTCONF uses REST for YANG models.',
      },
      definition: '**REST APIs** use **HTTP methods** on **resource URLs** with **JSON** payloads and standard **status codes**.',
      keyPoints: ['Stateless requests.', 'GET/POST/PUT/DELETE.', 'JSON most common.', '401 = auth failure.'],
      realWorld: 'Always use HTTPS in production APIs.',
      commonMistakes: ['Confusing REST with SOAP/XML-RPC.'],
      related: ['6.6 JSON', 'RESTCONF'],
      advanced: 'Southbound vs northbound API on controller.',
      sourceRefs: SRC('6.5'),
    },
  }),

  '6.6': shell({
    objectiveId: '6.6', domainId: 'automation', title: 'Interpret JSON data and configuration management tools',
    ckus: [
      { id: 'CKU-JSON', title: 'JSON', summary: 'Key-value pairs, arrays, objects; used by REST APIs. Validate brackets/quotes.', aliases: ['json'], tags: ['automation'], sourceRefs: SRC('6.6') },
      { id: 'CKU-ANSIBLE', title: 'Ansible', summary: 'Agentless automation using YAML playbooks over SSH; push model.', aliases: ['yaml', 'playbook'], tags: ['automation'], sourceRefs: SRC('6.6') },
    ],
    reading: {
      id: 'READ-6.6', ckuIds: ['CKU-JSON', 'CKU-ANSIBLE'], estimatedReadMinutes: 6,
      tiers: {
        beginner: 'JSON is how APIs send structured data. Ansible is a popular tool to push configs to many devices from YAML files.',
        intermediate: 'JSON: objects `{}`, arrays `[]`, key:"value". Syntax errors = missing comma/bracket. Ansible: inventory, playbooks, modules, no agent on network devices.',
        examReady: 'JSON rules: double quotes on keys/strings, commas between pairs, matched `{}` `[]`. Ansible = agentless, YAML playbooks, SSH. Puppet/Chef = agent pull model. RESTCONF returns JSON from YANG.',
      },
      definition: '**JSON** structures API data; **Ansible** automates config with **YAML playbooks** over SSH.',
      keyPoints: ['JSON syntax strict on commas/brackets.', 'Ansible agentless.', 'YAML for human-readable automation.', 'Puppet/Chef use agents.'],
      realWorld: 'Validate JSON with linter before API POST.',
      commonMistakes: ['Trailing commas invalid in JSON.', 'Underscores in keys are valid JSON.'],
      related: ['6.5 REST'],
      advanced: 'Custom Ansible modules return JSON to controller.',
      sourceRefs: SRC('6.6'),
    },
    examTraps: [{ id: '6.6-t1', trap: 'JSON allows trailing commas.', correction: 'Trailing commas are invalid in strict JSON.', ckuIds: ['CKU-JSON'] }],
  }),
}

export const READING_SUPPLEMENT_2_IDS = Object.keys(READING_SUPPLEMENTS_2)
