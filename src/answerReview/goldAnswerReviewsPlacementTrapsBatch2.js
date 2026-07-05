/** Gold debrief polish — placement trap stems batch 2 (remaining blueprint traps). */
export const PLACEMENT_TRAP_GOLD_BATCH2 = {
  '1.1-c-q1': {
    correct: { choiceIndex: 2, explanation: 'Routers examine IP headers and make forwarding decisions — that is Layer 3 (Network).' },
    incorrect: [
      { choiceIndex: 0, explanation: 'Layer 1 handles bits on the wire — routers do not primarily operate at the physical layer.', misconceptionTested: 'Confusing physical signaling with routing' },
      { choiceIndex: 1, explanation: 'Layer 2 switches use MAC tables — routers break broadcast domains and route by IP at Layer 3.', misconceptionTested: 'Assigning switch behavior to a router' },
      { choiceIndex: 3, explanation: 'Layer 7 is application services (HTTP, DNS apps) — routers forward packets using Layer 3 addresses, not app data.', misconceptionTested: 'Equating routing with application-layer services' },
    ],
    examTip: 'Router = **Layer 3**. Switch = **Layer 2**. Firewall can span L3–L7.',
  },
  '1.2-c-q1': {
    correct: { choiceIndex: 2, explanation: 'The access tier connects end-user devices — PCs, phones, and access ports on switches/APs.' },
    incorrect: [
      { choiceIndex: 0, explanation: 'Core provides high-speed backbone between distribution blocks — not direct end-user attachment.', misconceptionTested: 'Connecting users at the core tier' },
      { choiceIndex: 1, explanation: 'Distribution aggregates access switches and applies policy — users connect at access, not distribution.', misconceptionTested: 'Placing user ports in distribution tier' },
      { choiceIndex: 3, explanation: 'Spine is a data-center fabric term — campus three-tier uses access/distribution/core.', misconceptionTested: 'Mixing DC spine-leaf with campus access tier' },
    ],
    examTip: 'Campus three-tier: **Access** = users. Distribution = policy/aggregation. Core = backbone.',
  },
  '1.3-c-q1': {
    correct: { choiceIndex: 1, explanation: 'Copper UTP Ethernet is limited to **100 meters** per segment per TIA/Ethernet standards.' },
    incorrect: [
      { choiceIndex: 0, explanation: '10 m is far below the standard UTP limit — 100 m is the exam reference length.', misconceptionTested: 'Underestimating UTP segment length' },
      { choiceIndex: 2, explanation: '500 m applies to some fiber or legacy specs — not standard copper UTP at 100 m.', misconceptionTested: 'Using fiber distance for copper UTP' },
      { choiceIndex: 3, explanation: '1 km is fiber territory — copper UTP max is 100 m for exam purposes.', misconceptionTested: 'Confusing fiber reach with copper UTP' },
    ],
    examTip: 'Copper UTP Ethernet segment = **100 m**. Know this cold.',
  },
  '1.4-c-q1': {
    correct: { choiceIndex: 1, explanation: 'CRC errors indicate frames arrived corrupted — bad cable, duplex mismatch, or physical layer issues.' },
    incorrect: [
      { choiceIndex: 0, explanation: 'Correct routing is Layer 3 — CRC is a Layer 2 frame integrity check on the wire.', misconceptionTested: 'Attributing CRC to routing success' },
      { choiceIndex: 2, explanation: 'DNS failures affect name resolution — they do not increment interface CRC counters.', misconceptionTested: 'Blaming DNS for L2 CRC errors' },
      { choiceIndex: 3, explanation: 'Valid VLAN tagging is normal — CRC errors mean damaged or misaligned frames, not proper 802.1Q.', misconceptionTested: 'Equating VLAN tags with CRC failures' },
    ],
    examTip: 'Rising **CRC errors** → check cable, duplex, and physical layer first.',
  },
  '1.7-c-q1': {
    correct: { choiceIndex: 1, explanation: '192.168.0.0/16 is RFC 1918 private space — not routable on the public Internet.' },
    incorrect: [
      { choiceIndex: 0, explanation: '8.8.8.0/24 is public Google DNS space — not private RFC 1918.', misconceptionTested: 'Labeling public space as private' },
      { choiceIndex: 2, explanation: '203.0.113.0/24 is TEST-NET documentation space — not RFC 1918 private.', misconceptionTested: 'Confusing documentation blocks with RFC 1918' },
      { choiceIndex: 3, explanation: '169.254.0.0/16 is APIPA link-local — not RFC 1918 private (10/8, 172.16/12, 192.168/16).', misconceptionTested: 'Mixing APIPA with RFC 1918 private' },
    ],
    examTip: 'RFC 1918 private: **10.0.0.0/8**, **172.16.0.0/12**, **192.168.0.0/16**.',
  },
  '1.8-c-q1': {
    correct: { choiceIndex: 2, explanation: 'IPv6 addresses are **128 bits** (8 hextets × 16 bits) — four times longer than 32-bit IPv4.' },
    incorrect: [
      { choiceIndex: 0, explanation: '**32 bits** is **IPv4** length — IPv6 is **128 bits**.', misconceptionTested: 'IPv4 length on IPv6 stem' },
      { choiceIndex: 1, explanation: '**64 bits** is often a host/interface portion (EUI-64) — full address is **128 bits**.', misconceptionTested: 'Interface ID length as full address' },
      { choiceIndex: 3, explanation: '**256 bits** is not used for IPv6 addresses on CCNA.', misconceptionTested: 'Doubling 128 incorrectly' },
    ],
    examTip: 'IPv6 = **128-bit** addresses. IPv4 = **32-bit**.',
  },
  '2.2-c-q1': {
    correct: { choiceIndex: 1, explanation: 'A trunk tags frames with 802.1Q VLAN IDs so multiple VLANs cross one inter-switch link.' },
    incorrect: [
      { choiceIndex: 0, explanation: 'Access ports carry a single VLAN untagged — trunks carry many VLANs with tags.', misconceptionTested: 'Describing access-port behavior on a trunk question' },
      { choiceIndex: 2, explanation: 'PC-to-switch links are access ports — trunks connect switches (or switch to router-on-a-stick).', misconceptionTested: 'Using end-host access link for trunk definition' },
      { choiceIndex: 3, explanation: 'Routing between VLANs needs a Layer 3 device — trunks extend Layer 2 VLANs across links, not route them.', misconceptionTested: 'Expecting trunk to route between VLANs' },
    ],
    examTip: 'Trunk = **802.1Q tags** on inter-switch links; **native VLAN must match** both ends.',
  },
  'obj-2.4-source-q001': {
    correct: { choiceIndex: 1, explanation: 'EtherChannel with **PAgP** supports up to **8** active links in a port channel on Cisco platforms.' },
    incorrect: [
      { choiceIndex: 0, explanation: 'Two links can bundle but the **maximum** with PAgP is **8**, not 2.', misconceptionTested: 'Minimum links as maximum' },
      { choiceIndex: 2, explanation: '**16** exceeds the PAgP EtherChannel limit — Cisco caps at **8** member interfaces.', misconceptionTested: '16 interfaces with PAgP' },
      { choiceIndex: 3, explanation: 'Four links can aggregate but the exam maximum for PAgP EtherChannel is **8**.', misconceptionTested: '4 as maximum PAgP bundle' },
    ],
    examTip: 'PAgP/LACP EtherChannel max = **8 links** (same speed/duplex, same VLAN settings).',
  },
  '2.5-c-q1': {
    correct: { choiceIndex: 1, explanation: 'STP blocks redundant Layer 2 paths so frames cannot loop endlessly through a switched topology.' },
    incorrect: [
      { choiceIndex: 0, explanation: 'Routing loops are a Layer 3 problem (TTL, routing protocol convergence) — STP operates at Layer 2 on switches.', misconceptionTested: 'Applying STP to Layer 3 routing loops' },
      { choiceIndex: 2, explanation: 'IP conflicts are addressed by DHCP snooping, DAI, or manual assignment — STP does not detect duplicate IPs.', misconceptionTested: 'Expecting STP to fix IP addressing conflicts' },
      { choiceIndex: 3, explanation: 'DNS resolution speed is unrelated — STP prevents broadcast/multicast storms from physical switching loops.', misconceptionTested: 'Dragging unrelated services into STP purpose' },
    ],
    examTip: 'STP: **blocking** prevents L2 loops — not “drop all user traffic” on a forwarding port.',
  },
  'obj-2.6-source-q001': {
    correct: { choiceIndex: 1, explanation: 'High client density in a small area needs lightweight APs with centralized RF management from a WLC — optimal for scale and control.' },
    incorrect: [
      { choiceIndex: 0, explanation: 'Autonomous APs lack centralized RF coordination — managing 100 clients in a tight area is harder without WLC-driven channel/power planning.', misconceptionTested: 'Choosing autonomous APs for high-density centralized design' },
      { choiceIndex: 2, explanation: 'Autonomous without WLC removes centralized management — poor fit for dense deployments needing coordinated RF.', misconceptionTested: 'Deploying standalone autonomous APs at high density' },
      { choiceIndex: 3, explanation: 'Lightweight APs require a WLC for control and config — they cannot operate in lightweight mode without one.', misconceptionTested: 'Using lightweight APs with no controller' },
    ],
    examTip: 'High density + small area → **lightweight APs + WLC** for RF and client management.',
  },
  'obj-2.7-source-q001': {
    correct: { choiceIndex: 2, explanation: '**EtherChannel** bundles parallel links into one logical L2 path — adds bandwidth between router and controller switch.' },
    incorrect: [
      { choiceIndex: 0, explanation: 'Routers can use **L3 port-channels** or routed EtherChannel — multiple links can be aggregated.', misconceptionTested: 'Cannot aggregate router links' },
      { choiceIndex: 1, explanation: 'RIP is a routing protocol — it does not bond physical interfaces for bandwidth.', misconceptionTested: 'Routing protocol as link bonding' },
      { choiceIndex: 3, explanation: 'Inter-VLAN routing is L3 — the stem asks for **more bandwidth** on parallel Gig links (L2 bundle).', misconceptionTested: 'L3 routing instead of link aggregation' },
    ],
    examTip: 'More bandwidth between two switches/routers → **EtherChannel/port-channel**.',
  },
  'obj-2.8-source-q001': {
    correct: { choiceIndex: 1, explanation: 'Telnet provides terminal emulation over TCP — remote CLI access to routers and switches (insecure; SSH preferred).' },
    incorrect: [
      { choiceIndex: 0, explanation: 'SNMP is network management polling/traps — it does not provide interactive terminal emulation.', misconceptionTested: 'Using SNMP for terminal emulation' },
      { choiceIndex: 2, explanation: 'HTTP serves web pages — it is not a CLI terminal emulation protocol like Telnet or SSH.', misconceptionTested: 'Selecting HTTP for terminal access' },
      { choiceIndex: 3, explanation: 'TFTP transfers files on UDP 69 — it does not offer interactive terminal sessions.', misconceptionTested: 'Confusing TFTP file transfer with terminal emulation' },
    ],
    examTip: 'Terminal emulation over network → **Telnet** (legacy) or **SSH** (secure).',
  },
  '3.2-c-q1': {
    correct: { choiceIndex: 1, explanation: '10.1.1.10 matches both prefixes, but /26 is longer (more specific) — longest prefix match selects the /26 via R3.' },
    incorrect: [
      { choiceIndex: 0, explanation: '/24 is less specific than /26 when both match the destination. Longest prefix match always wins before metric or AD.', misconceptionTested: 'Picking the shorter prefix when both match' },
      { choiceIndex: 2, explanation: 'Metric only breaks ties between routes to the same prefix learned the same way — it does not override longest prefix match.', misconceptionTested: 'Using metric before longest prefix match' },
      { choiceIndex: 3, explanation: 'ECMP load-balancing requires equal-cost routes to the same prefix — here two different prefix lengths compete, and LPM picks one.', misconceptionTested: 'Expecting load balance across different prefix lengths' },
    ],
    examTip: 'Forwarding order: **longest prefix match** first, then **lowest AD**, then **best metric**.',
  },
  '3.3-q1': {
    correct: { choiceIndex: 0, explanation: '`ip route 172.16.0.0 255.255.0.0 10.0.0.1` — network, dotted-decimal mask (/16 = 255.255.0.0), next-hop.' },
    incorrect: [
      { choiceIndex: 1, explanation: '0.0.255.255 is a wildcard mask syntax used in ACLs — static routes require a subnet mask, not a wildcard.', misconceptionTested: 'Using ACL wildcard mask in static route command' },
      { choiceIndex: 2, explanation: 'Cisco IOS uses `ip route`, not `static route`, and CIDR slash notation is not valid in classic IOS static route syntax.', misconceptionTested: 'Inventing non-IOS static route syntax' },
      { choiceIndex: 3, explanation: '`ip static-route` is not valid IOS — the command is `ip route <network> <mask> <next-hop>`.', misconceptionTested: 'Misspelling the ip route command' },
    ],
    examTip: 'Static route: **ip route** + network + **subnet mask** + next-hop or exit interface.',
  },
  'obj-3.5-source-q001': {
    correct: { choiceIndex: 1, explanation: 'VRRP (RFC 5798) is the open IEEE/IETF standard FHRP — HSRP and GLBP are Cisco-proprietary alternatives.' },
    incorrect: [
      { choiceIndex: 0, explanation: 'Proxy ARP answers ARP on behalf of remote subnets — it is not a first-hop redundancy protocol with virtual IP/MAC.', misconceptionTested: 'Substituting Proxy ARP for FHRP' },
      { choiceIndex: 2, explanation: 'GLBP is Cisco proprietary load-sharing FHRP — the stem asks for the openly standardized protocol (VRRP).', misconceptionTested: 'Picking Cisco GLBP when IEEE standard is required' },
      { choiceIndex: 3, explanation: 'HSRP is widely deployed but Cisco-proprietary — VRRP is the multi-vendor IEEE-aligned FHRP.', misconceptionTested: 'Selecting HSRP instead of open standard VRRP' },
    ],
    examTip: 'Open standard FHRP → **VRRP**. Cisco-only → **HSRP** or **GLBP**.',
  },
  '3.6-legacy-q001': {
    correct: { choiceIndex: 1, explanation: 'When multiple sources offer a route to the same destination, the router prefers the route with the lowest administrative distance. A static route (AD 1) beats OSPF (AD 110).' },
    incorrect: [
      { choiceIndex: 0, explanation: 'Dynamic does not automatically win — IOS compares administrative distance first. Static AD 1 beats OSPF AD 110 for the same prefix.', misconceptionTested: 'Preferring dynamic OSPF over static regardless of AD' },
      { choiceIndex: 2, explanation: 'IOS installs one best route per prefix — equal-cost load balancing requires identical AD and metric, not static plus OSPF to the same net.', misconceptionTested: 'Expecting both static and OSPF installed for load balance' },
      { choiceIndex: 3, explanation: 'Competing routes are normal — the router picks the lowest AD route; it does not flag a conflict when static beats OSPF.', misconceptionTested: 'Believing duplicate sources create a routing conflict error' },
    ],
    examTip: 'Same prefix, multiple sources → lowest **AD** wins.',
  },
  'obj-4.2-source-q001': {
    correct: { choiceIndex: 0, explanation: 'NTP server is configured in global config mode: `ntp server 129.6.15.28` — synchronizes router clock to the stratum source.' },
    incorrect: [
      { choiceIndex: 1, explanation: 'NTP server is not an exec-mode command — configuration belongs under `configure terminal`.', misconceptionTested: 'NTP server in privileged exec instead of config mode' },
      { choiceIndex: 2, explanation: '`ntp client` is not the IOS command to point at an NTP server — use `ntp server <ip>`.', misconceptionTested: 'Inventing ntp client syntax' },
      { choiceIndex: 3, explanation: 'Exec-mode `ntp client` is invalid — NTP peers/servers are defined in configuration mode.', misconceptionTested: 'Exec-mode NTP configuration' },
    ],
    examTip: 'NTP: **`ntp server <ip>`** in **global config**. Verify with **`show ntp associations`**.',
  },
  'obj-4.3-source-q001': {
    correct: { choiceIndex: 1, explanation: 'Reverse DNS resolves an IP address to an FQDN — forward DNS maps names to addresses.' },
    incorrect: [
      { choiceIndex: 0, explanation: 'Forwarding to another DNS server is recursion/referral — reverse lookup specifically means IP-to-name resolution.', misconceptionTested: 'Defining reverse lookup as server referral' },
      { choiceIndex: 2, explanation: 'Answering without recursion describes an authoritative response — reverse lookup is about query direction (IP → name).', misconceptionTested: 'Equating reverse with non-recursive answer' },
      { choiceIndex: 3, explanation: 'FQDN-to-IP is forward DNS (A/AAAA records) — reverse uses PTR in in-addr.arpa zones.', misconceptionTested: 'Swapping forward and reverse DNS definitions' },
    ],
    examTip: 'Reverse DNS = **IP → FQDN** (PTR); forward = **name → IP**.',
  },
  'obj-4.4-source-q001': {
    correct: { choiceIndex: 3, explanation: 'SNMPv3 adds authentication and encryption (priv) — v1/v2c rely on community strings in cleartext.' },
    incorrect: [
      { choiceIndex: 0, explanation: 'SNMPv1 has no encryption or strong authentication — community strings are sent in clear text.', misconceptionTested: 'Expecting SNMPv1 to provide encryption' },
      { choiceIndex: 1, explanation: 'SNMPv2e is not a standard version — v2c improved operations but still uses communities without encryption.', misconceptionTested: 'Selecting nonstandard v2e for security' },
      { choiceIndex: 2, explanation: 'SNMPv2c adds 64-bit counters but still uses community strings — only v3 offers authPriv security.', misconceptionTested: 'Believing v2c community strings are encrypted' },
    ],
    examTip: 'SNMP with **auth + encryption** → **SNMPv3** (not v1/v2c communities).',
  },
  'obj-4.6-source-q001': {
    correct: { choiceIndex: 0, explanation: '`show dhcp lease` on a DHCP client router displays the active lease from the server that assigned the address.' },
    incorrect: [
      { choiceIndex: 1, explanation: '`show ip dhcp lease` is for routers acting as DHCP **servers** — a client router uses `show dhcp lease`.', misconceptionTested: 'Using server-side show command on a DHCP client' },
      { choiceIndex: 2, explanation: '`show ip lease` is not the standard IOS client verification command — `show dhcp lease` is.', misconceptionTested: 'Inventing show command syntax' },
      { choiceIndex: 3, explanation: '`show ip interface` confirms interface status/IP but does not detail the DHCP server and lease timers like `show dhcp lease`.', misconceptionTested: 'Substituting interface status for DHCP lease details' },
    ],
    examTip: 'Client router lease check → **show dhcp lease**. Server pool → **show ip dhcp binding**.',
  },
  'obj-4.7-source-q001': {
    correct: { choiceIndex: 0, explanation: 'Routers **classify traffic for QoS** using **ACLs** (and class-maps) to match packets before marking or queuing.' },
    incorrect: [
      { choiceIndex: 1, explanation: 'ASICs forward at wire speed — **QoS classification** is policy-based via ACLs/class-maps, not generic L2 ASIC tables.', misconceptionTested: 'ASIC classification for QoS policy' },
      { choiceIndex: 2, explanation: 'Route tables pick next hops — they do not classify flows into QoS classes.', misconceptionTested: 'Routing table as QoS classifier' },
      { choiceIndex: 3, explanation: 'Frame filters are not the CCNA answer — IOS QoS classification starts with **ACL matches**.', misconceptionTested: 'Generic frame filter for QoS' },
    ],
    examTip: 'QoS classification on routers → **ACL/class-map** match, then mark (DSCP/CoS) and queue.',
  },
  'obj-4.8-source-q001': {
    correct: { choiceIndex: 1, explanation: 'SSH RSA key generation requires **`ip domain-name`** (with hostname set) — the FQDN labels the key pair.' },
    incorrect: [
      { choiceIndex: 0, explanation: 'Accurate **clock/NTP** helps certificate validation but **hostname + domain-name** are required before **`crypto key generate rsa`**.', misconceptionTested: 'Time/date as only SSH key prerequisite' },
      { choiceIndex: 2, explanation: 'Key **modulus size** is specified during generation — not a separate prerequisite step.', misconceptionTested: 'Key strength as separate prerequisite' },
      { choiceIndex: 3, explanation: 'No **key repository** config exists — set **hostname** and **`ip domain-name`** first.', misconceptionTested: 'Key repository prerequisite' },
    ],
    examTip: 'SSH key prep: **`hostname R1`** → **`ip domain-name lab.local`** → **`crypto key generate rsa`**.',
  },
  'obj-5.3-source-q001': {
    correct: { choiceIndex: 2, explanation: '**enable secret** stores the privileged EXEC password as a one-way hash — preferred over cleartext **enable password**.' },
    incorrect: [
      { choiceIndex: 0, explanation: '**password enable** is invalid syntax — privileged password uses **enable secret** or **enable password**.', misconceptionTested: 'Invented password subcommand order' },
      { choiceIndex: 1, explanation: '**enable Password20!** misses the **secret** keyword — IOS expects **enable secret** for hashed storage.', misconceptionTested: 'Omitting secret keyword' },
      { choiceIndex: 3, explanation: '**secret enable** reverses the keyword order — correct form is **enable secret**.', misconceptionTested: 'Reversed enable/secret tokens' },
    ],
    examTip: 'Privileged mode → **enable secret** (hashed). Line/login passwords are separate.',
  },
  'obj-5.5-source-q004': {
    correct: { choiceIndex: 2, explanation: 'Without a route to the remote tunnel endpoint (203.0.113.2), the GRE tunnel cannot come up — the underlay must be reachable first.' },
    incorrect: [
      { choiceIndex: 0, explanation: 'The comment explicitly states no route to the remote endpoint — GRE requires reachable tunnel destination in the routing table.', misconceptionTested: 'Ignoring missing underlay route to tunnel endpoint' },
      { choiceIndex: 1, explanation: 'The destination IP may be correct — the failure is that no routing entry reaches that network, making the tunnel unroutable.', misconceptionTested: 'Blaming wrong destination when underlay routing is missing' },
      { choiceIndex: 3, explanation: 'Serial interfaces on different subnets is normal for a point-to-point WAN — the issue is no route to 203.0.113.0/peer endpoint.', misconceptionTested: 'Flagging P2P addressing when underlay route is absent' },
    ],
    examTip: 'GRE tunnel up requires **reachable tunnel destination** in routing table (underlay first).',
  },
  'obj-5.7-source-q002': {
    correct: { choiceIndex: 0, explanation: '**Double tagging** exploits **native VLAN** — attacker tags twice to hop VLANs on misconfigured trunks.' },
    incorrect: [
      { choiceIndex: 1, explanation: '**VLAN traversal** is vague — CCNA names **double tagging** on native VLAN.', misconceptionTested: 'Generic traversal term' },
      { choiceIndex: 2, explanation: '**Trunk popping** is not the standard CCNA attack name — use **double tagging**.', misconceptionTested: 'Invented attack name' },
      { choiceIndex: 3, explanation: 'DoS is possible but the stem targets **native VLAN VLAN-hopping** — **double tagging**.', misconceptionTested: 'DoS instead of VLAN hop' },
    ],
    examTip: 'Native VLAN attack → **double tagging**. Mitigate: unique native VLAN, do not use VLAN 1.',
  },
  '5.11-legacy-q001': {
    correct: { choiceIndex: 1, explanation: 'Segmentation divides a network into smaller zones with controlled boundaries, restricting lateral movement after compromise.' },
    incorrect: [
      { choiceIndex: 0, explanation: 'Segmentation controls blast radius — it does not increase total bandwidth available to every device.', misconceptionTested: 'Choosing bandwidth gain as primary segmentation benefit' },
      { choiceIndex: 2, explanation: 'Segmentation complements firewalls — it does not eliminate the need for policy enforcement between zones.', misconceptionTested: 'Believing segmentation removes firewall need' },
      { choiceIndex: 3, explanation: 'VLANs segment broadcast domains but do not automatically encrypt traffic — encryption requires explicit protocols.', misconceptionTested: 'Expecting automatic encryption from segmentation' },
    ],
    examTip: 'Segmentation limits **lateral movement** after breach.',
  },
  'obj-6.2-source-q001': {
    correct: { choiceIndex: 0, explanation: 'Centralized **controller policy** can enforce consistent security/QoS — a cited benefit of controller-based networking.' },
    incorrect: [
      { choiceIndex: 1, explanation: 'Controllers do not magically remove **all** problems — they centralize control, not eliminate faults.', misconceptionTested: 'Zero problems claim' },
      { choiceIndex: 2, explanation: 'Throughput depends on hardware paths — SDN benefit is **policy/automation**, not automatic bandwidth.', misconceptionTested: 'SDN equals faster links' },
      { choiceIndex: 3, explanation: 'SDN adds a **control layer** — can reduce touch complexity, not increase it as a benefit.', misconceptionTested: 'Complexity as benefit' },
    ],
    examTip: 'Controller benefits: **centralized policy**, automation, consistent config — data plane still forwards locally.',
  },
  'obj-6.3-source-q001': {
    correct: { choiceIndex: 1, explanation: 'Controller-based SDN campus/data-center fabrics commonly use **spine-leaf** (Clos) topology for equal-cost multipath east-west traffic.' },
    incorrect: [
      { choiceIndex: 0, explanation: 'Three-tier (access-distribution-core) is classic hierarchical — modern controller fabrics favor spine-leaf for scale and ECMP.', misconceptionTested: 'Applying legacy three-tier to SDN fabric' },
      { choiceIndex: 2, explanation: 'Collapsed core merges distribution/core — spine-leaf is the distinct SDN fabric pattern tested here.', misconceptionTested: 'Confusing collapsed core with spine-leaf' },
      { choiceIndex: 3, explanation: 'SAN fabric is storage networking (FC/FCoE) — not the IP Ethernet architecture for controller-based LANs.', misconceptionTested: 'Dragging storage fabric into SDN campus question' },
    ],
    examTip: 'Controller/SDN fabric → **spine-leaf**. Legacy campus → three-tier.',
  },
  'obj-6.4-source-q001': {
    correct: { choiceIndex: 2, explanation: 'Cisco DNA Center replaced APIC-EM as the campus SDN controller with automation, assurance, and fabric management.' },
    incorrect: [
      { choiceIndex: 0, explanation: 'OpenFlow is a southbound protocol spec — not a replacement management platform for APIC-EM.', misconceptionTested: 'OpenFlow as APIC-EM successor product' },
      { choiceIndex: 1, explanation: 'Prime Infrastructure is legacy NMS — DNA Center is the modern APIC-EM replacement for intent-based campus automation.', misconceptionTested: 'Prime as APIC-EM replacement' },
      { choiceIndex: 3, explanation: 'SD-WAN (vManage) targets WAN edge — not the campus controller role APIC-EM held.', misconceptionTested: 'SD-WAN controller as APIC-EM replacement' },
    ],
    examTip: 'APIC-EM successor → **Cisco DNA Center** for campus automation and assurance.',
  },
  'obj-6.6-source-q001': {
    correct: { choiceIndex: 1, explanation: '**Ansible, Chef, and Puppet** are **configuration management** tools — declarative/automated device config at scale.' },
    incorrect: [
      { choiceIndex: 0, explanation: 'An **NMS** monitors/polls — config management tools **push desired state** to devices.', misconceptionTested: 'NMS role for Ansible/Chef/Puppet' },
      { choiceIndex: 2, explanation: '**SDN** separates control/data planes — these tools automate **configuration**, not SDN architecture.', misconceptionTested: 'SDN as config management function' },
      { choiceIndex: 3, explanation: '**Centralized logging** is syslog/SIEM — Ansible/Chef/Puppet manage **configuration state**.', misconceptionTested: 'Logging as config management' },
    ],
    examTip: 'Config management trio: **Ansible** (agentless) | **Chef/Puppet** (agent-based) — all enforce desired config.',
  },
}
