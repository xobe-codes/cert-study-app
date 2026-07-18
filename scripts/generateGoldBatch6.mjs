/**
 * Hand-authored gold batch 6 — ordering/scenario/troubleshooting domains 2–6.
 * Run: node scripts/generateGoldBatch6.mjs
 */
import { writeFileSync } from 'fs'
import { readFileSync } from 'fs'

const EXAM_TIPS = {
  '2': 'Access trap: **VLAN/trunk/native** and **wireless join** issues beat random protocol tweaks.',
  '3': 'Routing trap: read **`show ip route` brackets** — code, AD, metric — before changing config.',
  '4': 'Services trap: **DHCP/DNS/QoS** failures are often placement or relay — not “server is down.”',
  '5': 'Security trap: **ACL order, implicit deny, AAA separation** — authentication ≠ authorization.',
  '6': 'Automation trap: **idempotent, API-driven, controller-based** — not manual box-by-box CLI.',
}

/** Hand-authored gold reviews keyed by question id. */
const HAND = {
  'obj-2.6-depth-q2': {
    correct: {
      choiceIndex: 1,
      explanation: 'FlexConnect can switch locally at the AP and survive WAN loss to the WLC.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Data center core needs centralized switching and high throughput — FlexConnect targets branch survivability with local switching, not core aggregation.',
        misconceptionTested: 'Placing branch FlexConnect use case in the data center core',
      },
      {
        choiceIndex: 2,
        explanation: 'Home SOHO may use lightweight APs, but FlexConnect is specifically for enterprise branches that need local switching when the WAN to the WLC fails.',
        misconceptionTested: 'Equating FlexConnect with consumer SOHO Wi-Fi only',
      },
      {
        choiceIndex: 3,
        explanation: 'FlexConnect offloads local switching but still relies on the WLC for policy — it does not replace all WLC functions.',
        misconceptionTested: 'Believing FlexConnect eliminates the WLC entirely',
      },
    ],
  },
  'obj-2.7-depth-q3': {
    correct: {
      choiceIndex: 1,
      explanation: 'AP uplinks often use trunk to carry management and client VLANs.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Access mode carries one VLAN — an AP uplink serving multiple SSID VLANs plus management needs a trunk, not access with VLAN 1 only.',
        misconceptionTested: 'Using single-VLAN access for multi-VLAN AP uplink',
      },
      {
        choiceIndex: 2,
        explanation: 'Dynamic auto alone does not guarantee a trunk forms — the switchport must be configured as trunk (or negotiate trunk) to carry multiple VLANs reliably.',
        misconceptionTested: 'Relying on dynamic auto without explicit trunk intent',
      },
      {
        choiceIndex: 3,
        explanation: 'Shutting down the port disables all wireless service — the fix is correct trunk configuration, not disabling the uplink.',
        misconceptionTested: 'Choosing shutdown as a VLAN troubleshooting step',
      },
    ],
  },
  'obj-2.8-depth-q2': {
    correct: {
      choiceIndex: 1,
      explanation: 'SSID plus security is not enough — VLAN mapping and DHCP/DNS must work.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Beacon interval affects discovery timing — clients already see the SSID, so RF beacon tuning does not fix missing IP addresses.',
        misconceptionTested: 'Tuning RF beacons when L3 DHCP mapping is broken',
      },
      {
        choiceIndex: 2,
        explanation: 'Disabling 2.4 GHz changes band availability — it does not restore DHCP when VLAN/interface mapping is wrong.',
        misconceptionTested: 'Blaming band selection for DHCP failure after association',
      },
      {
        choiceIndex: 3,
        explanation: 'Transmit power affects coverage — associated clients without IPs point to VLAN/DHCP reachability, not insufficient RF power.',
        misconceptionTested: 'Increasing TX power to fix Layer 3 addressing',
      },
    ],
  },
  'obj-3.6-depth-q2': {
    correct: {
      choiceIndex: 1,
      explanation: 'IOS drops static routes when next-hop is unreachable or interface is down.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'OSPF process ID affects dynamic routing — a missing static route is usually next-hop or exit-interface reachability, not OSPF configuration.',
        misconceptionTested: 'Blaming OSPF process ID for a static route not installing',
      },
      {
        choiceIndex: 2,
        explanation: 'DNS resolves names — static route installation depends on Layer 3 reachability to the next-hop or up/up exit interface.',
        misconceptionTested: 'Dragging DNS into static route table troubleshooting',
      },
      {
        choiceIndex: 3,
        explanation: 'SSH governs management access — it does not determine whether IOS installs a static route in the routing table.',
        misconceptionTested: 'Confusing management protocol with route install logic',
      },
    ],
  },
  'obj-3.6-depth-q3': {
    correct: {
      choiceIndex: 1,
      explanation: 'Valid routes do not guarantee ping success — ACLs may deny ICMP.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'STP prevents Layer 2 loops — ping failure with a valid route is more often ACL or firewall filtering, not spanning tree.',
        misconceptionTested: 'Blaming STP for ICMP failure when routing exists',
      },
      {
        choiceIndex: 2,
        explanation: 'VTP revision tracks VLAN database changes — it does not block ICMP echo across routed paths.',
        misconceptionTested: 'Using VTP revision to explain ping failure',
      },
      {
        choiceIndex: 3,
        explanation: 'EtherChannel mode affects link bundling — it does not selectively deny ICMP when routes are present.',
        misconceptionTested: 'Expecting EtherChannel mode to block ping',
      },
    ],
  },
  'obj-3.6-depth-q4': {
    correct: {
      choiceIndex: 1,
      explanation: 'L1/L2 errors (CRC, collisions) cause flapping before routing issues.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'NTP synchronizes clocks — climbing interface errors with intermittent connectivity point to duplex/speed or cable problems first.',
        misconceptionTested: 'Checking NTP before physical/L2 error counters',
      },
      {
        choiceIndex: 2,
        explanation: 'DHCP pool size affects address assignment — CRC and collision errors are Layer 1/2 physical or duplex issues.',
        misconceptionTested: 'Blaming DHCP pool when interface error counters climb',
      },
      {
        choiceIndex: 3,
        explanation: 'WPA2 PSK is wireless security — wired interface errors with flapping links are not solved by Wi-Fi encryption settings.',
        misconceptionTested: 'Applying wireless security fix to wired L1/L2 errors',
      },
    ],
  },
  'obj-3.6-depth-q5': {
    correct: {
      choiceIndex: 1,
      explanation: 'Local OK but remote fails often means missing default route or wrong gateway.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'SSID is a wireless identifier — local subnet reachability with remote failure is a default route or gateway problem, not SSID naming.',
        misconceptionTested: 'Changing SSID to fix inter-subnet reachability',
      },
      {
        choiceIndex: 2,
        explanation: 'LLDP advertises neighbors — disabling it does not restore remote network reachability when the default route is missing.',
        misconceptionTested: 'Disabling LLDP instead of verifying default route',
      },
      {
        choiceIndex: 3,
        explanation: 'PortFast accelerates access-port STP convergence — it does not provide a gateway of last resort for remote networks.',
        misconceptionTested: 'Using PortFast on WAN to fix missing default route',
      },
    ],
  },
  'obj-3.6-depth-q6': {
    correct: {
      choiceIndex: 1,
      explanation: 'Adjacency without routes — area mismatch, network statements, or passive intf.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'VTP manages VLAN databases on switches — OSPF neighbors up without routes point to area or network statement mismatch, not VTP.',
        misconceptionTested: 'Checking VTP domain for missing OSPF routes',
      },
      {
        choiceIndex: 2,
        explanation: 'Telnet timeout is a management setting — OSPF route learning requires matching areas and non-passive interfaces on the link.',
        misconceptionTested: 'Blaming Telnet timeout for OSPF route absence',
      },
      {
        choiceIndex: 3,
        explanation: 'PoE budget powers devices — it does not prevent OSPF from advertising networks when adjacency is already formed.',
        misconceptionTested: 'Equating PoE budget with OSPF route propagation',
      },
    ],
  },
  'obj-3.6-depth-q7': {
    correct: {
      choiceIndex: 1,
      explanation: 'Fix interface status first — routes need up/up exit paths.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'A static route cannot force an administratively down interface up — IOS will not install the route until the exit path is operational.',
        misconceptionTested: 'Expecting static routes to bring interfaces up',
      },
      {
        choiceIndex: 2,
        explanation: 'Adding a static route does not automatically enable OSPF — routing protocol activation is separate from static route configuration.',
        misconceptionTested: 'Believing static routes auto-enable OSPF',
      },
      {
        choiceIndex: 3,
        explanation: 'Static route configuration does not clear the ARP cache — the route simply will not appear while the outbound interface is down.',
        misconceptionTested: 'Expecting route config to flush ARP',
      },
    ],
  },
  'obj-4.10-depth-q3': {
    correct: {
      choiceIndex: 1,
      explanation: 'Local out-of-band access remains critical when cloud is unreachable.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Social media is unrelated to network operations — engineers need console or local SSH when the cloud controller is unreachable.',
        misconceptionTested: 'Distractor unrelated to out-of-band recovery',
      },
      {
        choiceIndex: 2,
        explanation: 'Devices always need some recovery path — claiming no access ever ignores standard console/local fallback design.',
        misconceptionTested: 'Believing cloud-only ops need zero local access',
      },
      {
        choiceIndex: 3,
        explanation: 'Rebooting DHCP does not restore cloud management during a WAN outage — local console or SSH is the operational fallback.',
        misconceptionTested: 'Using DHCP reboot as cloud outage recovery',
      },
    ],
  },
  'obj-4.10-depth-q5': {
    correct: {
      choiceIndex: 1,
      explanation: 'Central templates reduce one-off CLI errors at scale.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Random config drift is what cloud templates prevent — consistency comes from policy applied uniformly, not ad-hoc changes.',
        misconceptionTested: 'Choosing drift as a benefit of cloud management',
      },
      {
        choiceIndex: 2,
        explanation: 'Cloud management does not remove VLANs — it standardizes VLAN and policy deployment across devices.',
        misconceptionTested: 'Believing cloud management eliminates VLAN design',
      },
      {
        choiceIndex: 3,
        explanation: 'Disabling logging reduces visibility — centralized management improves auditing and correlation, not log suppression.',
        misconceptionTested: 'Confusing management consistency with disabling logs',
      },
    ],
  },
  'obj-4.10-depth-q7': {
    correct: {
      choiceIndex: 0,
      explanation: 'Console/local CLI is the fallback during outages and initial setup.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Cloud-only management fails when internet or vendor cloud is unreachable — local access is required for bootstrap and outage recovery.',
        misconceptionTested: 'Insisting cloud-only with no local fallback',
      },
      {
        choiceIndex: 2,
        explanation: 'Local management is not limited to weekends — it is the standard fallback whenever cloud paths are unavailable.',
        misconceptionTested: 'Treating local CLI as a weekend-only option',
      },
      {
        choiceIndex: 3,
        explanation: 'Local management complements cloud — it does not mean replacing every switch with manual box-by-box-only forever.',
        misconceptionTested: 'Equating local fallback with abandoning all centralized tools',
      },
    ],
  },
  'obj-4.2-depth-q4': {
    correct: {
      choiceIndex: 1,
      explanation: 'Correlating logs across devices requires synchronized clocks via NTP.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'CDP discovers neighbors — unreliable syslog timestamps stem from unsynchronized clocks, not missing CDP.',
        misconceptionTested: 'Using CDP instead of NTP for log correlation',
      },
      {
        choiceIndex: 2,
        explanation: 'Port security limits MAC addresses — it does not align event timestamps across multiple devices.',
        misconceptionTested: 'Expecting port security to fix syslog timestamps',
      },
      {
        choiceIndex: 3,
        explanation: 'VTP pruning reduces unnecessary flood traffic — it does not synchronize clocks for cross-device log analysis.',
        misconceptionTested: 'Confusing VTP pruning with time synchronization',
      },
    ],
  },
  'obj-4.3-depth-q3': {
    correct: {
      choiceIndex: 1,
      explanation: 'DNS depends on correct server IPs from DHCP or static config.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'STP root bridge election is Layer 2 — slow name resolution with working IP connectivity points to DNS server reachability or DHCP option 6.',
        misconceptionTested: 'Checking STP root for DNS slowness',
      },
      {
        choiceIndex: 2,
        explanation: 'EtherChannel load balance affects traffic distribution — it does not cause slow DNS when IP pings succeed.',
        misconceptionTested: 'Blaming EtherChannel hash for DNS resolution delay',
      },
      {
        choiceIndex: 3,
        explanation: 'HSRP priority selects the active gateway — DNS slowness is a name-resolution service issue, not first-hop redundancy priority.',
        misconceptionTested: 'Adjusting HSRP priority to fix DNS',
      },
    ],
  },
  'obj-4.4-depth-q7': {
    correct: {
      choiceIndex: 1,
      explanation: 'Scheduled polling uses manager-initiated GET operations.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'SNMP TRAPs are agent-initiated alerts — scheduled 5-minute CPU polling is the manager pulling data with GET/GET-NEXT.',
        misconceptionTested: 'Confusing push TRAP with pull polling',
      },
      {
        choiceIndex: 2,
        explanation: 'INFORM is an acknowledged trap variant — proactive polling on a schedule uses GET, not INFORM from the agent.',
        misconceptionTested: 'Using INFORM for scheduled manager polling',
      },
      {
        choiceIndex: 3,
        explanation: 'DHCP Offer is part of address assignment — it has no role in SNMP CPU monitoring.',
        misconceptionTested: 'Mixing DHCP messages into SNMP operations',
      },
    ],
  },
  'obj-4.5-depth-q2': {
    correct: {
      choiceIndex: 1,
      explanation: 'Unsynced clocks make event timelines meaningless.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Matching hostnames helps identify devices — reliable cross-device correlation still requires NTP-synchronized timestamps.',
        misconceptionTested: 'Relying on hostnames alone for log correlation',
      },
      {
        choiceIndex: 2,
        explanation: 'SNMP community strings secure polling — they do not align syslog timestamps across devices.',
        misconceptionTested: 'Expecting SNMP community to sync clocks',
      },
      {
        choiceIndex: 3,
        explanation: 'Identical IOS versions are not required — synchronized clocks via NTP are what make syslog timelines trustworthy.',
        misconceptionTested: 'Requiring identical IOS for log correlation',
      },
    ],
  },
  'obj-4.5-depth-q5': {
    correct: {
      choiceIndex: 1,
      explanation: 'Centralized logs aid auditing, troubleshooting, and compliance.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Syslog forwarding stores events — it does not increase link bandwidth or throughput.',
        misconceptionTested: 'Expecting syslog to boost bandwidth',
      },
      {
        choiceIndex: 2,
        explanation: 'NTP synchronizes time — syslog servers complement NTP; they do not replace clock synchronization.',
        misconceptionTested: 'Believing syslog replaces NTP',
      },
      {
        choiceIndex: 3,
        explanation: 'SSH key management secures remote access — centralized syslog is unrelated to encrypting SSH keys.',
        misconceptionTested: 'Confusing syslog retention with SSH key encryption',
      },
    ],
  },
  'obj-4.5-depth-q7': {
    correct: {
      choiceIndex: 1,
      explanation: 'Default/unsynced clock shows stale time until NTP or manual set.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Perfect NTP sync would show accurate current time — identical 1993 timestamps mean the clock was never set or NTP is not working.',
        misconceptionTested: 'Choosing perfect sync when timestamps are clearly stale',
      },
      {
        choiceIndex: 2,
        explanation: 'ACLs filter traffic — they do not reset device clocks to factory default dates like 1993.',
        misconceptionTested: 'Blaming ACL count for unsynchronized clocks',
      },
      {
        choiceIndex: 3,
        explanation: 'Port security shutdown affects interface status — syslog timestamps stuck in 1993 indicate clock/NTP configuration, not port security.',
        misconceptionTested: 'Linking port security to bad syslog timestamps',
      },
    ],
  },
  'obj-4.6-depth-q3': {
    correct: {
      choiceIndex: 1,
      explanation: 'No DHCP response — missing relay, wrong pool, or server unreachable.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'OSPF router ID identifies the OSPF process — APIPA 169.254.x.x means the client received no DHCP offer, pointing to relay or server reachability.',
        misconceptionTested: 'Checking OSPF router ID for APIPA addresses',
      },
      {
        choiceIndex: 2,
        explanation: 'SSH version affects management encryption — it does not cause clients to self-assign APIPA when DHCP fails.',
        misconceptionTested: 'Blaming SSH version for DHCP failure',
      },
      {
        choiceIndex: 3,
        explanation: 'EtherChannel hash distributes flows — APIPA indicates no DHCP response, not load-balancing misconfiguration.',
        misconceptionTested: 'Using EtherChannel hash to explain APIPA',
      },
    ],
  },
  'obj-4.6-depth-q6': {
    correct: {
      choiceIndex: 0,
      explanation: 'Each client subnet interface that needs relay gets its own helper-address.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Helper on the server side does not receive client broadcasts from remote VLANs — configure helper on each client-facing SVI.',
        misconceptionTested: 'Placing ip helper-address only on the DHCP server',
      },
      {
        choiceIndex: 2,
        explanation: 'Access ports do not need helper-address — relay belongs on the Layer 3 interface (SVI) for each client subnet.',
        misconceptionTested: 'Configuring helper on every access port',
      },
      {
        choiceIndex: 3,
        explanation: 'A router between VLANs still needs ip helper-address on client SVIs to forward DHCP broadcasts to the remote server.',
        misconceptionTested: 'Skipping helper because a router exists',
      },
    ],
  },
  'obj-4.6-depth-q7': {
    correct: {
      choiceIndex: 1,
      explanation: 'Helper must face clients — server-side config does not catch client broadcasts.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Server-side helper does not intercept client DHCP DISCOVER broadcasts arriving on remote subnets — relay must be on the client gateway interface.',
        misconceptionTested: 'Believing server-side helper always works',
      },
      {
        choiceIndex: 2,
        explanation: 'ip helper-address relays DHCP — it does not automatically enable NAT for the subnet.',
        misconceptionTested: 'Expecting helper-address to enable NAT',
      },
      {
        choiceIndex: 3,
        explanation: 'DHCP relay and DNS are separate — misplacing helper does not disable DNS; it prevents DHCP relay from working.',
        misconceptionTested: 'Claiming wrong helper placement disables DNS',
      },
    ],
  },
  'obj-4.8-depth-q4': {
    correct: {
      choiceIndex: 1,
      explanation: 'Local user auth needs username + login local on vty lines.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'OSPF network statements advertise subnets — SSH login failure for a local user is fixed with `login local` and a configured username, not OSPF.',
        misconceptionTested: 'Using OSPF network statement for SSH login',
      },
      {
        choiceIndex: 2,
        explanation: 'VTP mode controls VLAN propagation — it does not authenticate SSH users on vty lines.',
        misconceptionTested: 'Checking VTP mode for local SSH login failure',
      },
      {
        choiceIndex: 3,
        explanation: 'Port-channel mode bundles links — local SSH authentication requires `login local` on vty plus username configuration.',
        misconceptionTested: 'Adjusting port-channel mode for SSH login',
      },
    ],
  },
  'obj-4.8-depth-q6': {
    correct: {
      choiceIndex: 1,
      explanation: 'IOS requires domain-name before RSA key generation.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'NTP synchronizes clocks — RSA key generation fails without `ip domain-name`, not because NTP is missing.',
        misconceptionTested: 'Configuring NTP before domain-name for SSH keys',
      },
      {
        choiceIndex: 2,
        explanation: 'SNMP community enables polling — crypto key generation specifically requires a domain name for the RSA key label.',
        misconceptionTested: 'Using SNMP community instead of domain-name for keys',
      },
      {
        choiceIndex: 3,
        explanation: 'HSRP group configures gateway redundancy — SSH RSA keys need `ip domain-name` before `crypto key generate rsa`.',
        misconceptionTested: 'Configuring HSRP group to fix crypto key generation',
      },
    ],
  },
  'obj-5.10-depth-q6': {
    correct: {
      choiceIndex: 1,
      explanation: 'Encryption secures data traversing public/untrusted paths.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Physical switch theft is a facility security issue — VPN confidentiality protects data in transit across untrusted networks.',
        misconceptionTested: 'Confusing physical theft with traffic eavesdropping',
      },
      {
        choiceIndex: 2,
        explanation: 'STP misconfiguration causes Layer 2 loops — VPN encryption does not prevent spanning-tree design errors.',
        misconceptionTested: 'Expecting VPN to fix STP misconfiguration',
      },
      {
        choiceIndex: 3,
        explanation: 'Duplicate MAC is a LAN issue — VPN confidentiality addresses eavesdropping on traffic crossing the internet or WAN.',
        misconceptionTested: 'Using VPN confidentiality against duplicate MAC',
      },
    ],
  },
  'obj-5.11-depth-q3': {
    correct: {
      choiceIndex: 1,
      explanation: 'DMZ exposes services to untrusted networks with controlled access inward.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Internal domain controllers belong on trusted LAN segments — DMZ hosts public-facing services isolated from the internal network.',
        misconceptionTested: 'Placing domain controllers in the DMZ by default',
      },
      {
        choiceIndex: 2,
        explanation: 'Backup tapes are offline storage — DMZ is a network zone for internet-accessible servers with restricted inward access.',
        misconceptionTested: 'Equating DMZ with backup media storage',
      },
      {
        choiceIndex: 3,
        explanation: 'STP root switch is a spanning-tree role — DMZ is a security segmentation zone for public-facing servers.',
        misconceptionTested: 'Confusing STP root placement with DMZ purpose',
      },
    ],
  },
  'obj-5.11-depth-q6': {
    correct: {
      choiceIndex: 1,
      explanation: 'Same VLAN = same broadcast domain — hosts can reach each other at L2.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'VLANs segment broadcast domains but hosts in the same VLAN communicate freely at Layer 2 without ACLs — compromise can spread laterally.',
        misconceptionTested: 'Believing same-VLAN hosts are fully isolated',
      },
      {
        choiceIndex: 2,
        explanation: 'Flat VLANs do not auto-encrypt traffic — encryption requires explicit protocols like IPsec or TLS.',
        misconceptionTested: 'Expecting automatic encryption in one VLAN',
      },
      {
        choiceIndex: 3,
        explanation: 'OSPF LSA flooding exchanges Layer 3 topology — it does not contain lateral movement within a flat VLAN.',
        misconceptionTested: 'Using OSPF flooding for L2 lateral movement',
      },
    ],
  },
  'obj-5.2-depth-q3': {
    correct: {
      choiceIndex: 1,
      explanation: 'Technology is one layer — process and people complete the program.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'ACLs work when correctly ordered — a security program also needs training, incident response, and governance beyond ACL deployment.',
        misconceptionTested: 'Claiming ACLs never work',
      },
      {
        choiceIndex: 2,
        explanation: 'ACLs filter traffic — AAA handles authentication and authorization. Neither replaces the other in a complete program.',
        misconceptionTested: 'Believing ACLs replace AAA entirely',
      },
      {
        choiceIndex: 3,
        explanation: 'ACLs permit or deny traffic — they do not encrypt payloads. Encryption requires IPsec, TLS, or similar.',
        misconceptionTested: 'Expecting ACLs to encrypt traffic',
      },
    ],
  },
  'obj-5.3-depth-q3': {
    correct: {
      choiceIndex: 0,
      explanation: 'Local auth does not encrypt Telnet sessions — use SSH.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Local users can exist and authenticate — the CCNA security failure is that Telnet sends credentials in cleartext regardless of `login local`.',
        misconceptionTested: 'Assuming local users cannot exist with Telnet',
      },
      {
        choiceIndex: 2,
        explanation: 'SSH may have overhead but the exam issue is confidentiality — Telnet exposes passwords on the wire even with local authentication.',
        misconceptionTested: 'Choosing SSH only for speed differences',
      },
      {
        choiceIndex: 3,
        explanation: 'VTY lines absolutely support authentication — Telnet with `login local` still fails security because traffic is unencrypted.',
        misconceptionTested: 'Believing VTY cannot authenticate local users',
      },
    ],
  },
  'obj-5.3-depth-q7': {
    correct: {
      choiceIndex: 1,
      explanation: 'SSH requires crypto keys before vty can accept SSH connections.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'IOS does not auto-generate RSA keys when you restrict vty to SSH — you must run `crypto key generate rsa` after setting domain-name.',
        misconceptionTested: 'Expecting automatic key creation on transport input ssh',
      },
      {
        choiceIndex: 2,
        explanation: 'Restricting `transport input ssh` blocks Telnet — without keys, SSH also fails, so generate keys before locking vty to SSH only.',
        misconceptionTested: 'Assuming Telnet remains available after ssh-only vty',
      },
      {
        choiceIndex: 3,
        explanation: 'OSPF adjacency is unrelated — SSH key generation is required for encrypted management, not routing neighbor formation.',
        misconceptionTested: 'Linking OSPF adjacency loss to SSH key requirement',
      },
    ],
  },
  'obj-5.4-depth-q5': {
    correct: {
      choiceIndex: 1,
      explanation: 'AAA servers centralize credentials and authorization policy.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Unique enable secrets per device do not scale or centralize login — TACACS+ or RADIUS provides one credential store for many routers.',
        misconceptionTested: 'Relying on per-device secrets for centralized login',
      },
      {
        choiceIndex: 2,
        explanation: 'Telnet to VLAN 1 is insecure and not centralized authentication — use AAA servers with SSH for scalable admin access.',
        misconceptionTested: 'Using cleartext Telnet for centralized login',
      },
      {
        choiceIndex: 3,
        explanation: 'WEP is obsolete wireless encryption — centralized router login uses TACACS+ or RADIUS, not Wi-Fi keys.',
        misconceptionTested: 'Applying WEP to router authentication',
      },
    ],
  },
  'obj-5.6-depth-q5': {
    correct: {
      choiceIndex: 1,
      explanation: 'Snooping drops unauthorized DHCP offers on untrusted ports.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Disabling STP risks Layer 2 loops — rogue DHCP is mitigated with DHCP snooping and untrusted port designation, not STP removal.',
        misconceptionTested: 'Disabling STP to stop rogue DHCP',
      },
      {
        choiceIndex: 2,
        explanation: 'Native VLAN mismatch causes trunk issues — it does not block unauthorized DHCP servers on access VLANs.',
        misconceptionTested: 'Changing native VLAN to stop rogue DHCP offers',
      },
      {
        choiceIndex: 3,
        explanation: 'Telnet is a management protocol — rogue DHCP mitigation is DHCP snooping with trusted uplinks and untrusted access ports.',
        misconceptionTested: 'Using Telnet as L2 DHCP attack mitigation',
      },
    ],
  },
  'obj-5.8-depth-q7': {
    correct: {
      choiceIndex: 1,
      explanation: 'Guest traffic should be isolated from trusted corporate segments.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Placing guests on the server VLAN exposes internal resources — guest WLANs need a separate VLAN with restricted inward access.',
        misconceptionTested: 'Sharing server VLAN with guest clients',
      },
      {
        choiceIndex: 2,
        explanation: 'Shared admin credentials violate least privilege — guest networks should use separate PSK or portal auth, not corporate admin accounts.',
        misconceptionTested: 'Sharing admin credentials on guest WLAN',
      },
      {
        choiceIndex: 3,
        explanation: 'WEP is broken encryption — guest best practice is segmentation plus modern WPA2/WPA3, not legacy WEP.',
        misconceptionTested: 'Choosing WEP for guest compatibility',
      },
    ],
  },
  'obj-6.1-depth-q2': {
    correct: {
      choiceIndex: 0,
      explanation: 'Role shifts from repetitive CLI to code/templates and verification.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Automation supplements CLI — engineers still use show commands for validation; Ansible shifts time toward templates and testing.',
        misconceptionTested: 'Believing automation eliminates all show commands',
      },
      {
        choiceIndex: 2,
        explanation: 'VLAN design remains essential — automation executes design; it does not remove the need for correct Layer 2 architecture.',
        misconceptionTested: 'Ignoring VLAN design after adopting Ansible',
      },
      {
        choiceIndex: 3,
        explanation: 'Change windows still matter for production — automation makes changes repeatable but does not remove controlled deployment practices.',
        misconceptionTested: 'Removing change windows because of automation',
      },
    ],
  },
  'obj-6.2-depth-q4': {
    correct: {
      choiceIndex: 1,
      explanation: 'Box-by-box CLI remains common in traditional ops.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'REST API is controller-era troubleshooting — traditional ops typically start with per-device `show` commands on the CLI.',
        misconceptionTested: 'Starting traditional troubleshoot with REST only',
      },
      {
        choiceIndex: 2,
        explanation: 'Deleting VLANs is destructive — traditional troubleshooting begins with show commands, not removing VLAN configuration.',
        misconceptionTested: 'Deleting VLANs as first troubleshooting step',
      },
      {
        choiceIndex: 3,
        explanation: 'Disabling STP globally risks loops — traditional CLI troubleshooting uses show commands, not turning off spanning tree.',
        misconceptionTested: 'Disabling STP globally as troubleshoot start',
      },
    ],
  },
  'obj-6.2-depth-q7': {
    correct: {
      choiceIndex: 0,
      explanation: 'Real deployments mix controller automation with device-level verification.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Controllers simplify policy but engineers still use CLI on devices for validation and edge cases — hybrid ops are normal.',
        misconceptionTested: 'Insisting controllers-only with zero CLI',
      },
      {
        choiceIndex: 2,
        explanation: 'Modern networks adopt automation — hybrid means controllers plus CLI verification, not zero automation ever.',
        misconceptionTested: 'Rejecting all automation in hybrid definition',
      },
      {
        choiceIndex: 3,
        explanation: 'Hybrid operations span wired and wireless — it is not limited to wireless-only management.',
        misconceptionTested: 'Limiting hybrid ops to wireless only',
      },
    ],
  },
  'obj-6.3-depth-q5': {
    correct: {
      choiceIndex: 1,
      explanation: 'Business apps use northbound APIs on the controller.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Southbound OpenFlow talks to switches — the application layer uses northbound REST/API interfaces toward the controller.',
        misconceptionTested: 'Confusing southbound OpenFlow with application layer',
      },
      {
        choiceIndex: 2,
        explanation: 'Console cable is out-of-band local access — SDN application layer communicates via northbound APIs, not serial console.',
        misconceptionTested: 'Using console cable for SDN application layer',
      },
      {
        choiceIndex: 3,
        explanation: 'WEP is wireless encryption — SDN application-to-controller communication uses northbound REST APIs.',
        misconceptionTested: 'Applying WEP to SDN northbound interface',
      },
    ],
  },
  'obj-6.4-depth-q4': {
    correct: {
      choiceIndex: 0,
      explanation: 'Engineers still use CLI locally for many troubleshooting tasks.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'DNA Center does provide image management — it does not replace every CLI task on devices.',
        misconceptionTested: 'Denying DNA Center image management capability',
      },
      {
        choiceIndex: 2,
        explanation: 'Template-based provisioning is a core DNA Center feature — local CLI is still needed for many troubleshoot scenarios.',
        misconceptionTested: 'Denying template provisioning in DNA Center',
      },
      {
        choiceIndex: 3,
        explanation: 'DNA Center supports design workflows — it complements but does not eliminate per-device CLI for all tasks.',
        misconceptionTested: 'Denying design workflows in DNA Center',
      },
    ],
  },
  'obj-6.4-depth-q6': {
    correct: {
      choiceIndex: 1,
      explanation: 'Traditional ops = repetitive CLI on many boxes.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'A single REST POST is controller-style change — traditional campus changes require configuring and verifying each device individually.',
        misconceptionTested: 'Equating traditional ops with one REST call',
      },
      {
        choiceIndex: 2,
        explanation: 'Production changes require testing — traditional campus ops still need per-device config and verification, not skipping tests.',
        misconceptionTested: 'Claiming traditional changes need no testing',
      },
      {
        choiceIndex: 3,
        explanation: 'Deleting STP is never standard practice — traditional changes mean box-by-box CLI, not disabling spanning tree globally.',
        misconceptionTested: 'Deleting STP as traditional campus change',
      },
    ],
  },
  'obj-6.6-depth-q7': {
    correct: {
      choiceIndex: 1,
      explanation: 'IaC/tools enforce repeatable desired configuration.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Configuration management reduces manual drift — the goal is consistent desired state, not increasing random changes.',
        misconceptionTested: 'Choosing increased drift as config management goal',
      },
      {
        choiceIndex: 2,
        explanation: 'Version control is central to IaC — disabling it undermines repeatable, auditable configuration management.',
        misconceptionTested: 'Disabling version control in config management',
      },
      {
        choiceIndex: 3,
        explanation: 'Templates enable consistency — removing templates works against maintaining desired state across devices.',
        misconceptionTested: 'Removing templates as config management goal',
      },
    ],
  },
  '3.6-legacy-q001': {
    correct: {
      choiceIndex: 1,
      explanation: 'When multiple sources offer a route to the same destination, the router prefers the route with the lowest administrative distance. A static route (AD 1) beats OSPF (AD 110).',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Dynamic does not automatically win — IOS compares administrative distance first. Static AD 1 beats OSPF AD 110 for the same prefix.',
        misconceptionTested: 'Preferring dynamic OSPF over static regardless of AD',
      },
      {
        choiceIndex: 2,
        explanation: 'IOS installs one best route per prefix — equal-cost load balancing requires identical AD and metric, not static plus OSPF to the same net.',
        misconceptionTested: 'Expecting both static and OSPF installed for load balance',
      },
      {
        choiceIndex: 3,
        explanation: 'Competing routes are normal — the router picks the lowest AD route; it does not flag a conflict when static beats OSPF.',
        misconceptionTested: 'Believing duplicate sources create a routing conflict error',
      },
    ],
  },
  '3.6-legacy-q006': {
    correct: {
      choiceIndex: 0,
      explanation: 'A floating static route is configured with a higher AD than the primary route so it stays out of the table (a backup) until the primary route disappears, at which point it becomes the best (and only) route.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Floating static uses higher AD, not lower metric — it activates only when the primary OSPF route is withdrawn from the table.',
        misconceptionTested: 'Using metric comparison for floating static activation',
      },
      {
        choiceIndex: 2,
        explanation: 'Floating static is a backup — it does not load-balance alongside OSPF while both exist; higher AD keeps it inactive until primary fails.',
        misconceptionTested: 'Expecting simultaneous OSPF and floating static load balance',
      },
      {
        choiceIndex: 3,
        explanation: 'Route selection is immediate when the primary disappears — no reboot is required for the floating static to become active.',
        misconceptionTested: 'Requiring reboot for floating static takeover',
      },
    ],
  },
  '4.1-q9': {
    correct: {
      choiceIndex: 1,
      explanation: 'The access list defines which inside local addresses are permitted to be translated by the NAT pool or PAT configuration.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Dynamic NAT ACLs identify inside local sources eligible for translation — they do not permit inbound access from outside global addresses.',
        misconceptionTested: 'Reversing inside/outside direction for NAT ACL',
      },
      {
        choiceIndex: 2,
        explanation: 'Outside local addresses are on the outside segment as seen locally — the NAT ACL matches inside local sources going out, not outside local.',
        misconceptionTested: 'Confusing outside local with inside local in NAT ACL',
      },
      {
        choiceIndex: 3,
        explanation: 'Inside global is the translated address — the ACL specifies which inside local hosts may use NAT, not inside global as the matched source.',
        misconceptionTested: 'Matching inside global instead of inside local in ACL',
      },
    ],
  },
  '4.10-legacy-q002': {
    correct: {
      choiceIndex: 1,
      explanation: 'Cloud-based management platforms are designed for exactly this scenario: centralized, single-pane-of-glass visibility and configuration across many geographically distributed sites without per-site VPN tunnels.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Console at each of 50 branches does not scale — cloud dashboard provides centralized monitor/configure without traveling to every site.',
        misconceptionTested: 'Choosing per-site console for multi-branch management',
      },
      {
        choiceIndex: 2,
        explanation: 'SNMPv1 polling is read-heavy and lacks unified push config — cloud platforms provide dashboard config plus monitoring across all branches.',
        misconceptionTested: 'Expecting SNMPv1 alone to replace cloud dashboard',
      },
      {
        choiceIndex: 3,
        explanation: 'Telnet to each device is insecure and unscalable — cloud management avoids per-site VPN and manual CLI on 50 branches.',
        misconceptionTested: 'Using Telnet per device for 50-site management',
      },
    ],
  },
  '4.10-legacy-q010': {
    correct: {
      choiceIndex: 1,
      explanation: 'Cloud management depends on internet connectivity to a vendor\'s dashboard. An air-gapped, highly regulated environment with no internet access is the classic case where local/on-premises management is required instead.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '500 retail stores needing uniform AP rollout fits cloud management — not the best case for traditional local-only management.',
        misconceptionTested: 'Choosing cloud-fit retail chain for local-only mgmt',
      },
      {
        choiceIndex: 2,
        explanation: 'Minimal on-site IT favors cloud — startups adding branches typically use cloud dashboard, not traditional local-only CLI.',
        misconceptionTested: 'Picking startup branch expansion for local management',
      },
      {
        choiceIndex: 3,
        explanation: '30-campus school district visibility is a cloud management use case — centralized dashboard beats box-by-box local CLI.',
        misconceptionTested: 'Choosing school district central visibility for local-only',
      },
    ],
  },
  '4.9-en-q2': {
    correct: {
      choiceIndex: 0,
      explanation: 'TFTP has no authentication; FTP and SCP support credentials for file transfer.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'TFTP cannot authenticate — copying IOS from a server requiring username/password needs FTP or SCP, not TFTP only.',
        misconceptionTested: 'Using TFTP when server requires credentials',
      },
      {
        choiceIndex: 2,
        explanation: 'SNMP GET retrieves MIB objects — it is not used to copy IOS image files with authentication.',
        misconceptionTested: 'Using SNMP GET for authenticated file copy',
      },
      {
        choiceIndex: 3,
        explanation: 'HTTP without auth cannot satisfy username/password requirements — use FTP or SCP for authenticated image copy.',
        misconceptionTested: 'Choosing unauthenticated HTTP for credentialed copy',
      },
    ],
  },
  '5.11-legacy-q005': {
    correct: {
      choiceIndex: 1,
      explanation: 'On a flat network, there are no internal boundaries to stop malware from reaching other hosts/servers once it\'s inside. Segmentation (VLANs, ACLs, firewalls between zones) contains the spread to the originating segment.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Segmentation limits lateral movement — impact on a flat network is worse because malware can reach any host without internal ACLs or zone boundaries.',
        misconceptionTested: 'Claiming segmentation has no effect on malware spread',
      },
      {
        choiceIndex: 2,
        explanation: 'Segmentation contains spread — it does not cause the initial infection. The flat network enables wider propagation after compromise.',
        misconceptionTested: 'Blaming segmentation for causing ransomware infection',
      },
      {
        choiceIndex: 3,
        explanation: 'Flat networks do not auto-isolate infected hosts — without segmentation, ransomware spreads more easily to peers and servers.',
        misconceptionTested: 'Believing flat networks auto-isolate infected hosts',
      },
    ],
  },
  '5.11-legacy-q008': {
    correct: {
      choiceIndex: 1,
      explanation: 'Guest traffic should be segmented onto its own VLAN/subnet with policies that block or heavily restrict access to internal resources, isolating untrusted guest devices from the corporate network.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Same VLAN as corporate devices lets guests reach internal resources — guest Wi-Fi must use a separate VLAN with restricted inward access.',
        misconceptionTested: 'Placing guests on corporate VLAN for simplicity',
      },
      {
        choiceIndex: 2,
        explanation: 'Disabling DHCP prevents address assignment but does not provide proper segmentation — guests need their own VLAN with internet-only or restricted policy.',
        misconceptionTested: 'Using DHCP disable instead of guest VLAN segmentation',
      },
      {
        choiceIndex: 3,
        explanation: 'VLAN priority (CoS) does not secure guest traffic — segmentation via separate VLAN and ACLs isolates guests from corporate resources.',
        misconceptionTested: 'Using VLAN priority instead of guest segmentation',
      },
    ],
  },
  '5.11-legacy-q010': {
    correct: {
      choiceIndex: 1,
      explanation: 'An out-of-band management network isolates administrative access to infrastructure devices from general user traffic, significantly reducing the attack surface — a compromised user device can\'t directly reach management interfaces.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'OOB management primarily improves security isolation — speed may be adequate on a dedicated VLAN but attack-surface reduction is the main goal.',
        misconceptionTested: 'Choosing speed as primary OOB segmentation benefit',
      },
      {
        choiceIndex: 2,
        explanation: 'Isolating management traffic does not remove AAA — administrative access still requires authentication and authorization on devices.',
        misconceptionTested: 'Believing OOB eliminates AAA requirement',
      },
      {
        choiceIndex: 3,
        explanation: 'OOB segmentation restricts user reachability to mgmt interfaces — it does not bypass authentication for management access.',
        misconceptionTested: 'Expecting users to bypass auth via OOB design',
      },
    ],
  },
  '5.4-legacy-q009': {
    correct: {
      choiceIndex: 2,
      explanation: 'Accounting tracks and logs what an authenticated and authorized user actually does — including command-level logging — which is exactly what command auditing requires.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Authentication verifies identity — audit logging of every command executed requires AAA accounting, not authentication alone.',
        misconceptionTested: 'Using authentication for command audit logging',
      },
      {
        choiceIndex: 1,
        explanation: 'Authorization controls what a user may do — accounting records what they actually did, which is required for command-level audit trails.',
        misconceptionTested: 'Confusing authorization with command accounting logs',
      },
      {
        choiceIndex: 3,
        explanation: 'Encryption protects data confidentiality — command auditing is provided by AAA accounting, not encryption.',
        misconceptionTested: 'Choosing encryption for command audit requirement',
      },
    ],
  },
  '5.9-en-q3': {
    correct: {
      choiceIndex: 1,
      explanation: 'SSID must map to the correct VLAN interface for DHCP scope.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'PSK mismatch prevents association — clients already associate but get the wrong subnet, pointing to WLAN VLAN/interface mapping.',
        misconceptionTested: 'Changing PSK when association succeeds with wrong subnet',
      },
      {
        choiceIndex: 2,
        explanation: 'Disabling 5 GHz changes band availability — wrong subnet after association is a VLAN mapping issue, not band selection.',
        misconceptionTested: 'Disabling 5 GHz to fix wrong DHCP subnet',
      },
      {
        choiceIndex: 3,
        explanation: 'Beacon interval affects discovery — associated clients on the wrong subnet need correct WLAN-to-VLAN interface mapping.',
        misconceptionTested: 'Tuning beacon interval for wrong subnet assignment',
      },
    ],
  },
}

const BATCH6_IDS = Object.keys(HAND)
if (BATCH6_IDS.length !== 50) {
  console.error(`Expected 50 entries, got ${BATCH6_IDS.length}`)
  process.exit(1)
}

const entries = {}
for (const id of BATCH6_IDS) {
  const rev = HAND[id]
  const domain = id.match(/^(\d)/)?.[1] || id.match(/obj-(\d)/)?.[1] || '4'
  entries[id] = {
    ...rev,
    examTip: EXAM_TIPS[domain] || EXAM_TIPS['4'],
  }
}

const lines = [
  '/** Gold reviews — Batch 6: ordering/scenario/troubleshooting domains 2–6. */',
  'export const BATCH6_GOLD = {',
]
for (const [id, rev] of Object.entries(entries)) {
  lines.push(`  '${id}': ${JSON.stringify(rev, null, 4).replace(/^/gm, '  ').trimStart()},`)
}
lines.push('}', '')

writeFileSync('src/answerReview/goldAnswerReviewsBatch6.js', lines.join('\n'))
console.error(`Wrote ${BATCH6_IDS.length} entries to goldAnswerReviewsBatch6.js`)
console.log(BATCH6_IDS.join('\n'))
