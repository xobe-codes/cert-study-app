import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'

/* =========================================================================
   DESIGN TOKENS
   ========================================================================= */
// Semantic color system — each token carries one cognitive meaning and is
// defined for BOTH themes. Components consume `COLORS.x` which resolves to a
// CSS custom property (`var(--ccna-x)`), so flipping `data-theme` on the root
// re-themes the whole app instantly without re-rendering. Semantic roles:
//   sky = LEARN (definition/focus) · amber = KEY (must-remember) ·
//   rose = WARNING (mistakes/errors) · mint = SUCCESS (correct/mastery) ·
//   purple = APPLIED (real-world/scenario) · silver = NEUTRAL (meta/sources)
// Hue tokens flip their text/dim/border values per theme so e.g. `mint` is a
// light green on dark and a dark green on light — always readable (WCAG AA+).
const PALETTES = {
  dark: {
    bg: '#07080d', surface: '#0d0e18', card: '#111220', cardHover: '#161728',
    border: '#1e2035', borderGlow: '#2e2050',
    purple: '#7c3aed', purpleM: '#9333ea', purpleGlow: '#c084fc', purpleDim: '#2d1f5e',
    mint: '#d4f7d4', mintDim: '#1a3320', mintBorder: '#3a6640',
    sky: '#baf0fa', skyDim: '#0d2a35', skyBorder: '#1a5060',
    blush: '#fde8e8', blushDim: '#2a1520', blushBorder: '#5a2530',
    rose: '#e0a0a0', roseDim: '#2a1010', roseBorder: '#7a3535',
    amber: '#fcd980', amberDim: '#2a2410', amberBorder: '#6b5618',
    silver: '#d9d9d9', silverMid: '#8a8fa8', silverDim: '#3a3f55',
    glowA: '#2d1f5e88', glowB: '#0d2a3588', focus: '#c084fc55', shimmerLine: '#ffffff22',
  },
  light: {
    bg: '#eef0f6', surface: '#e6e9f2', card: '#ffffff', cardHover: '#f4f6fb',
    border: '#d5d9e6', borderGlow: '#b3a3e6',
    purple: '#6d28d9', purpleM: '#7c3aed', purpleGlow: '#6d28d9', purpleDim: '#ece9fb',
    mint: '#1f7a35', mintDim: '#e4f3df', mintBorder: '#86bf57',
    sky: '#0e5aa0', skyDim: '#e1f0fb', skyBorder: '#8cc0ec',
    blush: '#9a3b3b', blushDim: '#fdeaea', blushBorder: '#f0b0b0',
    rose: '#a32d2d', roseDim: '#fcebeb', roseBorder: '#ef9595',
    amber: '#8a5208', amberDim: '#fbeedb', amberBorder: '#eaa53a',
    silver: '#1e2130', silverMid: '#5b6178', silverDim: '#c4c8d8',
    glowA: '#dcd6f7aa', glowB: '#dcebfaaa', focus: '#6d28d955', shimmerLine: '#00000014',
  },
}
const COLOR_KEYS = Object.keys(PALETTES.dark)
const COLORS = Object.fromEntries(COLOR_KEYS.map(k => [k, `var(--ccna-${k})`]))
// CSS that publishes each palette under its [data-theme] selector.
const THEME_CSS = Object.entries(PALETTES)
  .map(([name, p]) => `[data-theme="${name}"]{${Object.entries(p).map(([k, v]) => `--ccna-${k}:${v};`).join('')}}`)
  .join('\n')

/* =========================================================================
   BOOK_REF — condensed notes grounded on Jeremy's IT Lab CCNA course,
   one entry per exam objective. Used to ground AI explanations & quizzes.
   ========================================================================= */
const BOOK_REF = {
  '1.1': `Network components: Routers forward packets between networks/subnets using the routing table and operate at L3. L2/L3 switches forward frames based on the MAC address table; L3 switches can also route between VLANs via SVIs. Next-gen firewalls (NGFW) do stateful filtering plus app-aware inspection, IPS/IDS detect and block malicious traffic inline or out-of-band. Access points (APs) bridge wireless clients to the wired LAN — autonomous (standalone) or lightweight (managed by a WLC). Controllers (WLC, Cisco DNA Center) centralize config, monitoring and policy for many devices. Endpoints are end-user devices (PCs, phones, IoT). Servers provide services (DNS, DHCP, web, file) to clients on the network.`,
  '1.2': `Topology architectures: Two/three-tier campus design — Access (end devices connect), Distribution (aggregation, policy, routing boundary), Core (high-speed backbone, no policy). Two-tier (collapsed core) merges distribution+core for smaller sites. Spine-leaf (Clos) is used in data centers — every leaf connects to every spine, predictable low-latency, non-blocking. WAN topologies: hub-and-spoke (cheap, all traffic via hub), full mesh (direct site-to-site, costly), dual-homed for redundancy. SOHO networks are small flat networks, often a single router/AP combo. On-prem vs cloud: on-prem = owned/managed locally; cloud = compute/storage as a service (IaaS/PaaS/SaaS) with shared responsibility.`,
  '1.3': `Physical interfaces & cabling: Copper UTP (Cat5e/6/6a) uses RJ-45, max 100m, supports up to 10Gbps (Cat6a). Straight-through cables connect different device types (PC-switch); crossover connects like devices (older gear — modern NICs auto-MDIX). Fiber: single-mode (yellow, laser, long distance, smaller core) vs multimode (orange/aqua, LED/laser, shorter distance, larger core). Connectors: LC, SC, ST. SFP/SFP+ are modular transceivers for switches supporting copper or fiber. Choose cabling based on distance, bandwidth and cost.`,
  '1.4': `Interface & cable issues: Check 'show interfaces' for status (up/up = good), input/output errors, CRC errors (often bad cabling or duplex mismatch), collisions/late collisions (duplex mismatch on shared/half-duplex links), runts/giants (frame size problems). Duplex mismatch — one side full, other half — causes late collisions and poor performance; both sides should match (auto-negotiate or both fixed). Speed mismatch typically prevents the link from coming up. 'show interfaces status' gives a quick speed/duplex/VLAN summary across all ports.`,
  '1.5': `Switching concepts: Switches build a MAC address table by recording the source MAC + ingress port of every frame received. To forward, the switch checks the destination MAC: if known, frame is forwarded only out that port; if unknown (or broadcast/multicast), the frame is flooded out all ports except the one it arrived on. MAC entries age out after the aging timer (default 300s) if not refreshed. This dynamic learning lets switches build efficient forwarding paths without manual config.`,
  '1.6': `IPv4 addressing & subnetting: An IPv4 address is 32 bits, written as 4 octets (dotted decimal), paired with a subnet mask that splits it into network + host portions. CIDR notation (/24 etc.) shows how many bits are network bits. To subnet: borrow bits from the host portion to create more, smaller networks. Key formulas — number of subnets = 2^(borrowed bits), hosts per subnet = 2^(remaining host bits) - 2 (network + broadcast addresses are unusable). Always find the block size (256 - last non-zero octet of mask) to quickly find subnet boundaries, network address, broadcast address, and usable range.`,
  '1.7': `Private IPv4 addressing (RFC 1918): 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 are not routable on the public internet — used inside private networks and translated via NAT/PAT to access the internet. APIPA (169.254.0.0/16) is self-assigned when DHCP fails. Public addresses are globally unique and assigned by IANA/RIRs. Private addressing conserves the limited IPv4 address space and adds a layer of obscurity (not security) for internal hosts.`,
  '1.8': `IPv6 addressing & prefix: IPv6 addresses are 128 bits, written as 8 groups of 4 hex digits separated by colons. Rules to shorten: omit leading zeros in each group, and replace one contiguous run of all-zero groups with '::' (only once per address). Prefix length (e.g. /64) indicates the network portion, almost always /64 for LANs to allow SLAAC/EUI-64. Static config, DHCPv6, and SLAAC (Stateless Address Autoconfiguration using router advertisements) are the three ways hosts get IPv6 addresses.`,
  '1.9': `IPv6 address types: Global unicast (2000::/3) — publicly routable, like public IPv4. Unique local (FC00::/7, typically FD00::/8) — private, like RFC1918. Link-local (FE80::/10) — auto-assigned on every interface, used for on-link communication (neighbor discovery, routing protocols), never routed. Multicast (FF00::/8) replaces broadcast — e.g. FF02::1 (all nodes), FF02::2 (all routers). Anycast — same address on multiple devices, traffic goes to the nearest one. Modified EUI-64 builds the interface ID from the 48-bit MAC: split it, insert FFFE in the middle, and flip the 7th bit of the first byte (U/L bit).`,
  '1.10': `Verify IP parameters on client OS: Windows — 'ipconfig /all' shows IP, mask, gateway, DNS, MAC, DHCP lease info. macOS/Linux — 'ifconfig' or 'ip addr', 'ip route', '/etc/resolv.conf' for DNS. Use 'ping' to test reachability, 'traceroute'/'tracert' to see the path, 'nslookup'/'dig' to test DNS resolution. Common issues: wrong/missing default gateway (can reach local subnet but not beyond), wrong DNS (names fail but IPs work), duplicate IP, wrong subnet mask (can't reach some local hosts).`,
  '1.11': `Wireless principles: 2.4GHz (longer range, more interference, only 3 non-overlapping channels — 1,6,11) vs 5GHz (shorter range, more channels, less interference, faster). 802.11 standards: a/b/g/n/ac/ax (Wi-Fi 4/5/6) — increasing speed and efficiency. SSID identifies the wireless network. Encryption: WEP (broken), WPA, WPA2 (AES/CCMP), WPA3 (SAE, strongest). RF concepts: channel, channel width (20/40/80MHz — wider = faster but fewer non-overlapping channels), signal strength (RSSI), interference and attenuation affect coverage and throughput.`,
  '1.12': `Virtualization fundamentals: A hypervisor runs virtual machines (VMs) — Type 1 (bare metal, e.g. ESXi, runs directly on hardware) vs Type 2 (hosted, e.g. VMware Workstation, runs on top of an OS). Each VM has its own OS and virtual NICs/switches. Containers (e.g. Docker) virtualize at the OS level — share the host kernel, lighter and faster to start than VMs, package an app + dependencies. VRF (Virtual Routing and Forwarding) creates multiple isolated routing tables on one router. Network function virtualization (NFV) runs network services (firewall, router) as software on general-purpose hardware.`,

  '2.1': `VLANs: A VLAN is a logical broadcast domain — devices in the same VLAN can communicate at L2 regardless of physical location; devices in different VLANs need a router/L3 switch to communicate. Configure with 'vlan <id>' then 'name <name>' in global config, then assign access ports with 'switchport mode access' + 'switchport access vlan <id>'. VLAN 1 is the default VLAN for all ports and also the default native VLAN — best practice is to change the native VLAN and avoid using VLAN 1 for user traffic. 'show vlan brief' verifies VLAN-to-port assignments.`,
  '2.2': `Interswitch connectivity (trunking): A trunk carries traffic for multiple VLANs between switches using 802.1Q tagging, which inserts a 4-byte tag (including 12-bit VLAN ID) into the Ethernet frame. Configure with 'switchport mode trunk' and optionally 'switchport trunk allowed vlan <list>' to restrict VLANs, and 'switchport trunk native vlan <id>' to set the native (untagged) VLAN — must match on both ends or you get a native VLAN mismatch (CDP warning). DTP (Dynamic Trunking Protocol) can auto-negotiate trunks but is often disabled for security ('switchport nonegotiate').`,
  '2.3': `L2 discovery protocols: CDP (Cisco Discovery Protocol) is Cisco-proprietary, enabled by default, sends periodic multicast advertisements with device ID, platform, capabilities, port ID, and IP address — view with 'show cdp neighbors' / 'show cdp neighbors detail'. LLDP is the open-standard equivalent, must be enabled with 'lldp run', viewed with 'show lldp neighbors'. Both are useful for topology discovery and troubleshooting but should be disabled on ports facing untrusted networks for security.`,
  '2.4': `EtherChannel: Bundles 2-8 physical links into one logical link for increased bandwidth and redundancy — STP treats it as a single link, avoiding blocked redundant ports. Negotiation protocols: LACP (open standard, IEEE 802.3ad — modes 'active'/'passive', at least one side must be active) and PAGP (Cisco proprietary — modes 'desirable'/'auto'). Configure each member interface with 'channel-group <n> mode active' (LACP) — creates a Port-channel interface. All member ports must match in speed, duplex, VLAN/trunk config, and STP settings or the channel won't form. Verify with 'show etherchannel summary'.`,
  '2.5': `Spanning Tree Protocol (STP): Prevents L2 loops in networks with redundant switch links by blocking redundant paths. Elects a root bridge (lowest bridge ID = priority + MAC); all other switches calculate the lowest-cost path to the root. Port roles: Root port (best path to root, one per non-root switch), Designated port (best path on a segment, forwards), Blocking/Alternate port (does not forward, prevents loop). Port states: blocking → listening → learning → forwarding (with timers ~50s total for original 802.1D). Rapid PVST+ (Cisco default) uses port roles/states (discarding/learning/forwarding) and converges in seconds via proposal/agreement (sync). PortFast skips listening/learning on access ports for fast host connectivity; BPDU Guard shuts down a PortFast port if it receives a BPDU (rogue switch protection).`,
  '2.6': `Cisco wireless architectures: Autonomous APs are standalone, individually configured/managed — fine for very small deployments. Lightweight APs (LWAPs) tunnel control (and often data) traffic to a Wireless LAN Controller (WLC) using CAPWAP — centralizes config, RF management, roaming, and security policy. Cloud-based architecture (e.g. Meraki) manages APs via a cloud dashboard, no on-prem controller needed. AP modes: Local (normal client access), Monitor (RF scanning only, no client traffic), FlexConnect (can switch traffic locally if WLC connection is lost — used at branch sites), Sniffer, Bridge/Mesh (wireless backhaul between APs).`,
  '2.7': `Physical WLAN infrastructure: APs connect to switches via Ethernet (often Power over Ethernet — PoE/PoE+ supplies power over the same cable, avoiding separate power runs). The WLC connects to the wired network and APs register to it over CAPWAP tunnels (control plane always encrypted, data plane optionally). Antennas: omnidirectional (360° coverage, typical for indoor APs) vs directional (focused coverage, e.g. for long hallways or point-to-point bridges). AP placement considers coverage overlap (~15-20%), interference sources, and physical obstructions (walls, metal).`,
  '2.8': `WLAN client connectivity configuration: On a WLC/cloud controller, create a WLAN (SSID), map it to a VLAN (interface), and set security — Personal (WPA2/WPA3-PSK, shared passphrase) for home/small office, or Enterprise (WPA2/WPA3-Enterprise, 802.1X with a RADIUS server) for per-user authentication in larger orgs. Also configure broadcast settings (SSID broadcast on/off), QoS profile, and band selection (2.4/5GHz). Clients associate by scanning for the SSID, authenticating (PSK handshake or 802.1X/EAP), then receive an IP via DHCP on the mapped VLAN.`,

  '3.1': `Routing table components: Each entry shows the destination network/prefix, the routing protocol source code (C=connected, S=static, O=OSPF, D=EIGRP, R=RIP, B=BGP), administrative distance and metric (shown as [AD/metric]), the next-hop IP address, and the outgoing interface. Connected routes (C) and local routes (L, the exact interface address) are added automatically when an interface is up/up with an IP. The router prefers the route with the lowest AD when multiple sources advertise the same network; among routes from the same source, the lowest metric wins.`,
  '3.2': `Forwarding decision: For each packet, the router compares the destination IP against the routing table and uses longest prefix match — the route with the most specific (longest) matching prefix wins, regardless of AD/metric (those only matter when comparing routes to the SAME prefix length... actually they matter for selecting among routes of equal prefix length). If no match exists and there's no default route (0.0.0.0/0), the packet is dropped and an ICMP 'destination unreachable' may be sent. If a match is found, the router forwards out the associated interface to the next hop (re-encapsulating the L2 frame with the next hop's MAC, found via ARP/ND).`,
  '3.3': `Static routing: Configure with 'ip route <destination-network> <subnet-mask> <next-hop-IP-or-exit-interface>'. A default static route ('ip route 0.0.0.0 0.0.0.0 <next-hop>') matches all traffic with no more specific match — common for stub/edge routers connecting to an ISP. For IPv6: 'ipv6 route <prefix>/<length> <next-hop>'. Floating static routes use a higher administrative distance than the primary route so they're only used as backup if the primary fails. Static routes are simple and low-overhead but don't adapt to topology changes — must be manually updated.`,
  '3.4': `Single-area OSPFv2: A link-state protocol — routers exchange Link State Advertisements (LSAs) to build an identical link-state database (LSDB) per area, then run SPF (Dijkstra) to compute the shortest path tree. Configure with 'router ospf <process-id>' then 'network <network> <wildcard-mask> area <area-id>' (or use 'ip ospf <process> area <id>' on the interface in newer IOS). Router ID (RID) is chosen from highest loopback IP, else highest active interface IP, or set manually with 'router-id'. Neighbors must match: area ID, subnet/mask, hello/dead timers, area type, and authentication to form an adjacency (states: Down→Init→2-Way→ExStart→Exchange→Loading→Full). Cost = reference bandwidth (default 100Mbps) / interface bandwidth — lower cost = preferred path. Passive-interface stops hellos out an interface (e.g. toward LAN hosts) while still advertising the network.`,
  '3.5': `First Hop Redundancy Protocols (FHRP): Provide a virtual default gateway IP/MAC shared by 2+ routers so hosts always have a gateway even if one router fails. HSRP (Cisco proprietary) — one Active router forwards traffic, one Standby is ready to take over; priority (default 100, higher wins) determines Active, preempt allows a higher-priority router to reclaim Active status. VRRP (open standard) — similar concept, terms 'Master'/'Backup'. GLBP (Cisco) adds load balancing — multiple routers can actively forward using different virtual MACs for the same virtual IP. All use a virtual IP configured as the hosts' default gateway.`,
  '3.6': `Troubleshooting routing issues: Common causes of missing routes — interface down/down (check cabling, 'no shutdown'), mismatched routing protocol parameters (area ID, AS number, timers, authentication for dynamic protocols), incorrect static route (wrong next-hop/exit interface, typo in network/mask), ACL blocking routing protocol traffic, or asymmetric routing causing return traffic to take a different path (can break stateful firewalls). Useful commands: 'show ip route' (is the route present and from the expected source?), 'show ip protocols', 'show ip ospf neighbor' (adjacency state), 'traceroute' (where does the path break), 'ping' with extended options to test from a specific source interface.`,

  '4.1': `NAT: Network Address Translation maps private IPs to public IPs. Static NAT — one-to-one permanent mapping ('ip nat inside source static <inside-local> <inside-global>'), used for servers needing a consistent public IP. Dynamic NAT — maps inside addresses to a pool of public addresses on a first-come basis ('ip nat pool ...' + 'ip nat inside source list <ACL> pool <name>'). PAT (NAT overload) — maps many inside addresses to one public IP using different port numbers ('ip nat inside source list <ACL> interface <if> overload') — most common in home/SOHO routers. Mark interfaces with 'ip nat inside'/'ip nat outside'. Verify with 'show ip nat translations' and 'show ip nat statistics'.`,
  '4.2': `NTP (Network Time Protocol): Synchronizes device clocks to a reference time source — critical for accurate logging/troubleshooting (correlating syslog timestamps across devices) and for protocols requiring time sync (certificates, Kerberos). Configure a client with 'ntp server <ip>'; configure a device to act as a server/master with 'ntp master <stratum>'. Stratum number indicates distance from the authoritative time source (stratum 0 = atomic/GPS clock; stratum 1 = directly connected to stratum 0). Verify with 'show ntp associations' and 'show ntp status' (look for 'synchronized').`,
  '4.3': `DHCP and DNS: DHCP automatically assigns IP config (address, mask, gateway, DNS) to clients via DORA — Discover (client broadcast), Offer (server), Request (client), Acknowledge (server). DHCP relay ('ip helper-address <dhcp-server-ip>' on the client-facing interface) forwards DHCP broadcasts as unicast to a remote DHCP server across subnets. DNS resolves human-readable names to IP addresses using a hierarchical, distributed database (root → TLD → authoritative servers); clients query a configured DNS server (recursive resolver) which may cache results. Both are essential — DHCP for addressing, DNS for name resolution.`,
  '4.4': `SNMP (Simple Network Management Protocol): Allows a network management station (NMS) to monitor and (with write access) configure devices. Components: Manager (NMS), Agent (runs on managed device), MIB (Management Information Base — structured data the agent exposes), OID (specific object identifier within the MIB). SNMP can poll (Manager requests data via Get) or devices can send unsolicited Traps/Informs (alert on events, e.g. interface down). Versions: v1/v2c use plaintext community strings (read-only/read-write) — weak security; v3 adds authentication and encryption (recommended).`,
  '4.5': `Syslog: A standard for logging system messages to a central server. Severity levels 0-7: 0 Emergency, 1 Alert, 2 Critical, 3 Error, 4 Warning, 5 Notice, 6 Informational, 7 Debug (mnemonic: 'Every Awesome Cisco Engineer Will Need Icecream Daily'). Configure with 'logging host <ip>' and 'logging trap <level>' to set the minimum severity sent. Centralizing logs lets admins correlate events across many devices, retain history beyond a device's local buffer, and trigger alerting. 'show logging' views the local buffer and current config.`,
  '4.6': `DHCP client/relay configuration: Enable a router/switch interface as a DHCP client with 'ip address dhcp' (commonly on an ISP-facing interface). Configure a Cisco device as a DHCP server with 'ip dhcp pool <name>', then 'network <subnet> <mask>', 'default-router <gw>', 'dns-server <ip>', 'lease <days>'; exclude reserved addresses with 'ip dhcp excluded-address' (global config). For clients on a different subnet than the DHCP server, configure 'ip helper-address <dhcp-server-ip>' on the client-side interface so the router relays (unicasts) the broadcast DHCP request to the server.`,
  '4.7': `QoS forwarding per-hop behavior: QoS manages bandwidth, delay, jitter, and loss for traffic, especially important for voice/video. Per-hop behaviors: Classification & marking (identify traffic type and tag it — e.g. DSCP/CoS values), Queuing (when congestion occurs, place packets into different queues based on priority — e.g. low-latency queue for voice), Shaping/Policing (shaping buffers/delays excess traffic to smooth it; policing drops or remarks excess traffic immediately to enforce a rate), Congestion avoidance (e.g. WRED — proactively drop packets before queues fill to prevent TCP global synchronization). Trust boundaries determine where in the network markings are accepted vs. re-classified.`,
  '4.8': `Remote access via SSH: SSH provides encrypted remote CLI access (replacing insecure Telnet). To configure: set hostname and 'ip domain-name <domain>' (required to generate keys), generate RSA keys with 'crypto key generate rsa' (1024+ bits, 2048 recommended), create local user accounts ('username <user> privilege <n> secret <pass>'), then on the vty lines: 'transport input ssh', 'login local' (or AAA), and optionally 'ip ssh version 2'. Verify with 'show ip ssh' and test by connecting with an SSH client. Telnet should be disabled ('no transport input telnet' or just 'transport input ssh').`,
  '4.9': `TFTP and FTP: Both transfer files to/from network devices (IOS images, configuration backups). TFTP (UDP/69) — simple, no authentication, no encryption, used heavily for IOS upgrades and config backup/restore via 'copy running-config tftp' / 'copy tftp flash'. FTP (TCP/20-21) — supports authentication (username/password) and is more reliable (TCP) but still unencrypted (use SFTP/FTPS for security). Both are commonly used with tools like Cisco's TFTP server software during device provisioning, password recovery, or IOS upgrades.`,
  '4.10': `Local vs cloud-based device management: Local/on-prem management (e.g. CLI via console/SSH, or an on-prem controller like a WLC) requires local infrastructure, gives full control, but doesn't scale easily across many sites. Cloud-based management (e.g. Meraki dashboard, Cisco DNA Center cloud-tethered) centralizes config, monitoring, and updates for distributed sites from anywhere via a web portal/API, simplifies multi-site deployments and provides analytics, but depends on internet connectivity to the cloud service and introduces a third-party trust/data consideration. Many modern deployments use a hybrid approach.`,

  '5.1': `Key security concepts: A vulnerability is a weakness (e.g. unpatched software). A threat is a potential danger that could exploit a vulnerability. An exploit is the actual mechanism/code used to take advantage of a vulnerability. Mitigation techniques (patching, firewalls, ACLs, segmentation) reduce risk. CIA triad — Confidentiality (encryption, access control — only authorized parties see data), Integrity (hashing/checksums — data isn't altered undetected), Availability (redundancy, DDoS protection — systems stay up and accessible). Common threats: malware (viruses, worms, trojans, ransomware), social engineering (phishing), DoS/DDoS, man-in-the-middle, spoofing.`,
  '5.2': `Security program elements: User awareness/training programs teach employees to recognize phishing, social engineering, and follow security policy — humans are often the weakest link. Physical access control (badge readers, locks, mantraps, cameras) prevents unauthorized physical access to facilities and equipment — critical because physical access often defeats logical security entirely. Together with technical controls, these form a layered ('defense in depth') security program addressing people, process, and technology.`,
  '5.3': `Device access control (local): Set an enable secret ('enable secret <pass>', encrypted with stronger hashing than 'enable password'). Configure local user accounts ('username <user> secret <pass>') for AAA/login local. On console ('line con 0') and vty ('line vty 0 15') lines, set 'login' (require password) or 'login local' (require username+password from local DB) plus 'password <pass>' if not using local accounts. 'service password-encryption' weakly obfuscates plaintext passwords in the running-config. Always remove default/blank passwords and limit vty access (e.g. via ACL with 'access-class').`,
  '5.4': `AAA with TACACS+/RADIUS: AAA = Authentication (who are you), Authorization (what can you do), Accounting (what did you do — logging). TACACS+ (Cisco proprietary, TCP/49) encrypts the entire packet and separates AAA functions — commonly used for device administration (CLI access control). RADIUS (open standard, UDP 1812/1813) only encrypts the password in the packet, combines authentication+authorization — commonly used for network access (802.1X, VPN, wireless). Configure with 'aaa new-model', define server group(s) with 'tacacs server'/'radius server', then apply via 'aaa authentication login' method lists to lines.`,
  '5.5': `Access Control Lists (ACLs): Filter traffic based on criteria (source/dest IP, protocol, port). Standard ACLs (numbered 1-99/1300-1999) match source IP only — place close to the destination. Extended ACLs (100-199/2000-2699, or named) match source/dest IP, protocol, port — place close to the source. Processed top-down, first match wins, implicit 'deny all' at the end. Apply to an interface with 'ip access-group <name/number> in|out'. Named ACLs allow easier editing (insert/remove specific lines by sequence number). Wildcard masks are inverse of subnet masks (0 = must match, 1 = don't care).`,
  '5.6': `Layer 2 security features: Port security limits the number/identity of MAC addresses allowed on an access port ('switchport port-security', 'maximum <n>', 'mac-address sticky', violation modes: protect/restrict/shutdown — shutdown err-disables the port). DHCP snooping builds a trusted binding table of IP-to-MAC-to-port from DHCP transactions on trusted ports (uplinks), blocks DHCP server responses on untrusted (access) ports — prevents rogue DHCP servers. Dynamic ARP Inspection (DAI) uses the DHCP snooping binding table to validate ARP packets on untrusted ports, dropping ARP replies that don't match — prevents ARP spoofing/poisoning attacks.`,
  '5.7': `Authentication, authorization, accounting concepts: Authentication verifies identity (something you know/have/are — password, token, biometric; multi-factor authentication combines 2+ of these). Authorization determines what an authenticated user is permitted to do (privilege levels, command authorization via TACACS+). Accounting logs what actions were taken and when — used for auditing, billing, and forensic investigation. These three work together: a user authenticates (proves identity), is authorized (granted appropriate access), and their actions are accounted for (recorded).`,
  '5.8': `Wireless security protocols: WEP (deprecated — uses weak RC4 with static keys, easily cracked). WPA introduced TKIP (improved over WEP but still weak, deprecated). WPA2 uses AES-CCMP — strong encryption, current minimum standard; modes are Personal (PSK — shared passphrase) and Enterprise (802.1X/EAP with RADIUS — per-user credentials). WPA3 improves further: SAE (Simultaneous Authentication of Equals) replaces PSK's 4-way handshake to resist offline dictionary attacks, mandatory PMF (Protected Management Frames) to prevent deauth attacks, and stronger encryption (192-bit suite for Enterprise).`,
  '5.9': `WLAN configuration with WPA2-PSK: On the WLC/controller, create the WLAN/SSID, set Layer 2 security to WPA2 with AES, choose Authentication Key Management = PSK, and configure the shared passphrase (8-63 chars). Map the WLAN to the appropriate VLAN/interface for IP addressing. Clients connect by selecting the SSID and entering the passphrase, which is used in a 4-way handshake to derive unique per-session encryption keys (Pairwise Transient Key) — even though the passphrase is shared, each client's traffic is encrypted with different derived keys.`,
  '5.10': `VPN types and security: A VPN creates an encrypted tunnel over an untrusted network (e.g. internet). Site-to-site VPN connects two networks/routers permanently (e.g. IPsec tunnel between branch and HQ) — transparent to end users. Remote-access VPN connects an individual client to a network (e.g. AnyConnect/SSL VPN, or IPsec client) — used by remote workers. IPsec provides confidentiality (encryption — AES), integrity (hashing — SHA), authentication (pre-shared key or certificates), uses IKE to negotiate security associations. SSL/TLS VPNs work over standard HTTPS ports, easier through firewalls, often clientless (browser-based) for limited access.`,
  '5.11': `Network segmentation security concepts: Segmentation divides a network into smaller zones to limit the blast radius of a breach and enforce policy between zones. Firewalls (stateful — track connection state, only allow return traffic for established sessions) sit at segment boundaries. NGFWs add deep packet inspection, application awareness, integrated IPS, and identity-based policy. Microsegmentation (common in data centers/cloud) applies granular policy down to the individual workload/VM level, often via software-defined networking, so even devices in the 'same' network segment can't talk unless explicitly allowed — limits lateral movement by attackers.`,

  '6.1': `Impact of automation on network management: Traditional network management is manual — engineers log into each device's CLI individually to make changes, which is slow, error-prone, and doesn't scale. Automation uses scripts/tools (Ansible, Python, APIs) to apply consistent configuration across many devices simultaneously, reduces human error, speeds up deployment, and enables self-service/on-demand provisioning. It shifts the network engineer's role toward writing/maintaining automation code and templates rather than manual box-by-box CLI configuration — sometimes called 'Infrastructure as Code' for networking.`,
  '6.2': `Traditional vs controller-based networking: Traditional networking — each device makes its own independent control-plane decisions (distributed control plane), configured device-by-device via CLI. Controller-based (SDN) — separates the control plane from the data plane; a centralized controller (e.g. Cisco DNA Center, APIC-EM) makes decisions and pushes configuration/policy to devices (which retain only the data plane — forwarding). Benefits: centralized visibility and management, consistent policy enforcement, faster changes via APIs/automation, abstraction of underlying complexity from the network operator.`,
  '6.3': `Controller-based / SDN architectures: Northbound APIs let applications/controllers communicate with software above them (e.g. a GUI or orchestration tool talking to the controller) — typically REST/JSON. Southbound APIs/protocols let the controller communicate with and configure network devices below it — e.g. NETCONF, OpenFlow, CLI/SNMP. The control plane (path decisions) is centralized in the controller; the data plane (actually forwarding packets) remains distributed across devices. This separation allows centralized policy/management while devices still forward traffic at line rate.`,
  '6.4': `Traditional campus management vs Cisco DNA Center: Traditional — device-by-device CLI configuration, manual tracking of inventory/compliance, reactive troubleshooting. Cisco DNA Center — a controller providing centralized design, policy, provisioning, and assurance (analytics/telemetry) for the whole campus from one dashboard; supports automation workflows, software image management across devices, and AI-driven network insights/troubleshooting. It exposes Intent-based Networking — admins declare desired outcomes (intent) and DNA Center translates that into device-specific configuration and continuously verifies compliance.`,
  '6.5': `REST-based APIs: REST (Representational State Transfer) is an architectural style for APIs over HTTP. Uses standard HTTP methods: GET (retrieve), POST (create), PUT/PATCH (update), DELETE (remove), applied to resources identified by URLs (e.g. /api/v1/devices/1). Common response codes: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error. Data is typically exchanged as JSON. RESTful APIs are stateless — each request contains all info needed, the server doesn't retain client session state between requests.`,
  '6.6': `JSON and configuration management: JSON (JavaScript Object Notation) represents data as key-value pairs ({"key": "value"}), arrays ([ ]), strings, numbers, booleans, and null — used heavily by REST APIs for both requests and responses; readable by both humans and machines. Configuration management tools automate device configuration: Ansible (agentless, uses SSH, configs written in YAML 'playbooks'), Puppet and Chef (agent-based, use a pull model where devices check in with a master server). All let engineers define desired device state in code/templates and apply it consistently across many devices — key to network automation (6.1).`,
}

/* =========================================================================
   DOMAINS — 6 domains, 53 objectives, with official exam weights
   ========================================================================= */
const DOMAINS = [
  {
    id: 'fundamentals', name: 'Network Fundamentals', accent: 'mint', weight: 20,
    objectives: [
      { id: '1.1', title: 'Network components (routers, switches, firewalls, APs, controllers)' },
      { id: '1.2', title: 'Network topology architectures' },
      { id: '1.3', title: 'Physical interface and cabling types' },
      { id: '1.4', title: 'Identify interface and cable issues' },
      { id: '1.5', title: 'Switching concepts (MAC table, frame forwarding)' },
      { id: '1.6', title: 'Configure and verify IPv4 addressing and subnetting' },
      { id: '1.7', title: 'Describe private IPv4 addressing' },
      { id: '1.8', title: 'Configure and verify IPv6 addressing and prefix' },
      { id: '1.9', title: 'Compare IPv6 address types' },
      { id: '1.10', title: 'Verify IP parameters for client OS' },
      { id: '1.11', title: 'Describe wireless principles' },
      { id: '1.12', title: 'Explain virtualization fundamentals' },
    ],
  },
  {
    id: 'access', name: 'Network Access', accent: 'purple', weight: 20,
    objectives: [
      { id: '2.1', title: 'Configure and verify VLANs' },
      { id: '2.2', title: 'Configure and verify interswitch connectivity (trunking)' },
      { id: '2.3', title: 'Configure and verify Layer 2 discovery protocols (CDP/LLDP)' },
      { id: '2.4', title: 'Configure and verify EtherChannel (LACP)' },
      { id: '2.5', title: 'Describe Spanning Tree Protocol concepts' },
      { id: '2.6', title: 'Compare Cisco wireless architectures and AP modes' },
      { id: '2.7', title: 'Describe physical infrastructure connections of WLAN components' },
      { id: '2.8', title: 'Configure WLAN components for client connectivity' },
    ],
  },
  {
    id: 'connectivity', name: 'IP Connectivity', accent: 'blush', weight: 25,
    objectives: [
      { id: '3.1', title: 'Interpret the components of a routing table' },
      { id: '3.2', title: 'Determine how a router makes a forwarding decision by default' },
      { id: '3.3', title: 'Configure and verify IPv4 and IPv6 static routing' },
      { id: '3.4', title: 'Configure and verify single area OSPFv2' },
      { id: '3.5', title: 'Describe and configure first hop redundancy protocols (HSRP)' },
      { id: '3.6', title: 'Troubleshoot routing issues' },
    ],
  },
  {
    id: 'services', name: 'IP Services', accent: 'sky', weight: 10,
    objectives: [
      { id: '4.1', title: 'Configure and verify inside source NAT' },
      { id: '4.2', title: 'Configure and verify NTP' },
      { id: '4.3', title: 'Explain the role of DHCP and DNS' },
      { id: '4.4', title: 'Explain the function of SNMP' },
      { id: '4.5', title: 'Describe the use of syslog features' },
      { id: '4.6', title: 'Configure and verify DHCP client and relay' },
      { id: '4.7', title: 'Explain QoS forwarding per-hop behavior' },
      { id: '4.8', title: 'Configure network devices for remote access using SSH' },
      { id: '4.9', title: 'Describe TFTP and FTP capabilities' },
      { id: '4.10', title: 'Compare local and cloud-based device management' },
    ],
  },
  {
    id: 'security', name: 'Security Fundamentals', accent: 'rose', weight: 15,
    objectives: [
      { id: '5.1', title: 'Define key security concepts' },
      { id: '5.2', title: 'Describe security program elements' },
      { id: '5.3', title: 'Configure and verify device access control' },
      { id: '5.4', title: 'Configure and verify AAA with TACACS+/RADIUS' },
      { id: '5.5', title: 'Configure and verify access control lists' },
      { id: '5.6', title: 'Configure Layer 2 security features' },
      { id: '5.7', title: 'Compare authentication, authorization, accounting' },
      { id: '5.8', title: 'Describe wireless security protocols' },
      { id: '5.9', title: 'Configure WLAN using WPA2 PSK' },
      { id: '5.10', title: 'Differentiate types of VPN and security concepts' },
      { id: '5.11', title: 'Describe security concepts of network segmentation' },
    ],
  },
  {
    id: 'automation', name: 'Automation & Programmability', accent: 'silver', weight: 10,
    objectives: [
      { id: '6.1', title: 'Explain how automation impacts network management' },
      { id: '6.2', title: 'Compare traditional networks with controller-based networking' },
      { id: '6.3', title: 'Describe controller-based and software defined architectures' },
      { id: '6.4', title: 'Compare traditional campus management with Cisco DNA Center' },
      { id: '6.5', title: 'Describe characteristics of REST-based APIs' },
      { id: '6.6', title: 'Interpret JSON data and configuration management tools' },
    ],
  },
]

const ALL_OBJECTIVES = DOMAINS.flatMap(d => d.objectives.map(o => ({ ...o, domainId: d.id, domainName: d.name, accent: d.accent })))

/* =========================================================================
   COMMAND_DRILLS — CLI config drills for 14 config-heavy objectives
   Each step: { prompt, answer, hint }. answer may be an array of acceptable
   strings (case-insensitive, whitespace-normalized match).
   ========================================================================= */
const COMMAND_DRILLS = {
  '1.6': [
    { prompt: 'Enter interface configuration mode for GigabitEthernet0/1', answer: ['interface gigabitethernet0/1', 'interface gi0/1', 'int g0/1'], hint: "Use 'interface' followed by the interface name." },
    { prompt: 'Assign the IP address 192.168.10.1 with subnet mask 255.255.255.0', answer: ['ip address 192.168.10.1 255.255.255.0'], hint: "ip address <address> <mask>" },
    { prompt: 'Enable the interface (bring it up)', answer: ['no shutdown', 'no shut'], hint: 'Interfaces are shut down by default.' },
  ],
  '1.8': [
    { prompt: 'Enable IPv6 routing on the device', answer: ['ipv6 unicast-routing'], hint: 'Global config command, required to forward IPv6.' },
    { prompt: 'On interface Gi0/1, configure IPv6 address 2001:db8:acad:1::1/64', answer: ['ipv6 address 2001:db8:acad:1::1/64'], hint: 'ipv6 address <address>/<prefix-length>' },
    { prompt: 'Enable the interface to use a link-local address automatically generated via EUI-64, in addition to the global address', answer: ['ipv6 enable'], hint: 'This command alone generates only a link-local address.' },
  ],
  '2.1': [
    { prompt: 'Create VLAN 20', answer: ['vlan 20'], hint: 'Global config command.' },
    { prompt: 'Name VLAN 20 "SALES"', answer: ['name sales', 'name SALES'], hint: 'Entered while inside VLAN config mode.' },
    { prompt: 'On interface Fa0/5, set it as an access port', answer: ['switchport mode access'], hint: 'switchport mode <mode>' },
    { prompt: 'Assign Fa0/5 to VLAN 20', answer: ['switchport access vlan 20'], hint: 'switchport access vlan <id>' },
  ],
  '2.2': [
    { prompt: 'Set interface Gi0/1 to trunk mode', answer: ['switchport mode trunk'], hint: 'switchport mode <mode>' },
    { prompt: 'Set the native VLAN on this trunk to 99', answer: ['switchport trunk native vlan 99'], hint: 'switchport trunk native vlan <id>' },
    { prompt: 'Restrict the trunk to allow only VLANs 10, 20, and 99', answer: ['switchport trunk allowed vlan 10,20,99', 'switchport trunk allowed vlan 10, 20, 99'], hint: 'switchport trunk allowed vlan <list> (comma separated, no spaces needed)' },
  ],
  '2.3': [
    { prompt: 'Globally disable CDP on the device', answer: ['no cdp run'], hint: 'CDP is enabled by default; this is a global config command.' },
    { prompt: 'Re-enable CDP globally', answer: ['cdp run'], hint: 'Opposite of the previous command.' },
    { prompt: 'On a single interface, disable CDP only on that port', answer: ['no cdp enable'], hint: 'Interface-level command (note: different keyword than the global one).' },
    { prompt: 'Globally enable LLDP', answer: ['lldp run'], hint: 'LLDP is disabled by default, unlike CDP.' },
  ],
  '2.4': [
    { prompt: 'On interface Gi0/1, add it to EtherChannel group 1 using LACP active mode', answer: ['channel-group 1 mode active'], hint: 'channel-group <number> mode <active|passive|desirable|auto>' },
    { prompt: 'On interface Gi0/2, add it to the same EtherChannel group 1 using LACP active mode', answer: ['channel-group 1 mode active'], hint: 'Same command on the second member interface.' },
    { prompt: 'Verify the EtherChannel status and member ports', answer: ['show etherchannel summary'], hint: 'show etherchannel <option>' },
  ],
  '3.3': [
    { prompt: 'Configure a static route to network 192.168.30.0/24 via next-hop 10.0.0.2', answer: ['ip route 192.168.30.0 255.255.255.0 10.0.0.2'], hint: 'ip route <network> <mask> <next-hop>' },
    { prompt: 'Configure a default static route pointing to next-hop 203.0.113.1', answer: ['ip route 0.0.0.0 0.0.0.0 203.0.113.1'], hint: 'A default route matches all destinations.' },
    { prompt: 'Configure a static IPv6 route to 2001:db8:acad:2::/64 via next-hop 2001:db8:acad:1::2', answer: ['ipv6 route 2001:db8:acad:2::/64 2001:db8:acad:1::2'], hint: 'ipv6 route <prefix>/<length> <next-hop>' },
  ],
  '3.4': [
    { prompt: 'Enter OSPF process 1 configuration mode', answer: ['router ospf 1'], hint: 'Global config command, process ID is locally significant.' },
    { prompt: 'Advertise network 10.0.0.0/24 into OSPF area 0 using a wildcard mask', answer: ['network 10.0.0.0 0.0.0.255 area 0'], hint: 'network <address> <wildcard-mask> area <area-id>' },
    { prompt: 'Set the router ID to 1.1.1.1', answer: ['router-id 1.1.1.1'], hint: 'Entered inside router ospf config mode.' },
    { prompt: 'Verify OSPF neighbor adjacencies', answer: ['show ip ospf neighbor'], hint: 'show ip ospf <option>' },
  ],
  '3.5': [
    { prompt: 'On interface Gi0/1, enable HSRP group 1 with virtual IP 192.168.1.1', answer: ['standby 1 ip 192.168.1.1'], hint: 'standby <group> ip <virtual-ip>' },
    { prompt: 'Set this router\'s HSRP priority to 150 for group 1', answer: ['standby 1 priority 150'], hint: 'standby <group> priority <value> (default is 100)' },
    { prompt: 'Enable preemption for HSRP group 1', answer: ['standby 1 preempt'], hint: 'standby <group> preempt' },
  ],
  '4.6': [
    { prompt: 'Create a DHCP pool named LAN_POOL', answer: ['ip dhcp pool LAN_POOL', 'ip dhcp pool lan_pool'], hint: 'Global config command.' },
    { prompt: 'Set the pool network to 192.168.1.0/24', answer: ['network 192.168.1.0 255.255.255.0'], hint: 'network <network> <mask>, entered inside the DHCP pool.' },
    { prompt: 'Set the default gateway for clients to 192.168.1.1', answer: ['default-router 192.168.1.1'], hint: 'default-router <ip>' },
    { prompt: 'On the router interface facing remote clients, relay DHCP requests to server 10.0.0.5', answer: ['ip helper-address 10.0.0.5'], hint: 'Interface-level command.' },
  ],
  '4.8': [
    { prompt: 'Set the domain name to ccna.local (required before generating SSH keys)', answer: ['ip domain-name ccna.local'], hint: 'Global config command.' },
    { prompt: 'Generate RSA keys with a modulus of 2048 bits', answer: ['crypto key generate rsa modulus 2048', 'crypto key generate rsa'], hint: 'crypto key generate rsa modulus <bits>' },
    { prompt: 'On the vty lines, allow only SSH for incoming connections', answer: ['transport input ssh'], hint: 'Entered inside line vty configuration.' },
    { prompt: 'Configure the vty lines to authenticate using the local user database', answer: ['login local'], hint: 'login local' },
  ],
  '5.3': [
    { prompt: 'Set the enable secret password to "ciscoenable"', answer: ['enable secret ciscoenable'], hint: 'enable secret <password> (encrypted, preferred over enable password)' },
    { prompt: 'Create a local user "admin" with privilege level 15 and secret "adminpass"', answer: ['username admin privilege 15 secret adminpass'], hint: 'username <name> privilege <level> secret <password>' },
    { prompt: 'On the console line, require login using the local user database', answer: ['login local'], hint: 'Entered inside line con 0 configuration.' },
  ],
  '5.5': [
    { prompt: 'Create a named extended ACL called "BLOCK_TELNET"', answer: ['ip access-list extended BLOCK_TELNET', 'ip access-list extended block_telnet'], hint: 'ip access-list extended <name>' },
    { prompt: 'Add a line denying TCP traffic from any source to any destination on port 23 (Telnet)', answer: ['deny tcp any any eq 23', 'deny tcp any any eq telnet'], hint: 'deny tcp <source> <destination> eq <port>' },
    { prompt: 'Add a line permitting all other IP traffic', answer: ['permit ip any any'], hint: 'There is an implicit deny at the end, so this is needed to allow everything else.' },
    { prompt: 'Apply this ACL inbound on interface Gi0/0', answer: ['ip access-group BLOCK_TELNET in', 'ip access-group block_telnet in'], hint: 'ip access-group <name> in|out, entered on the interface.' },
  ],
  '5.6': [
    { prompt: 'On an access port, enable port security', answer: ['switchport port-security'], hint: 'Interface must already be in access mode.' },
    { prompt: 'Set the maximum number of secure MAC addresses to 2', answer: ['switchport port-security maximum 2'], hint: 'switchport port-security maximum <number>' },
    { prompt: 'Configure sticky learning of MAC addresses', answer: ['switchport port-security mac-address sticky'], hint: 'switchport port-security mac-address sticky' },
    { prompt: 'Set the violation action to shutdown the port', answer: ['switchport port-security violation shutdown'], hint: 'switchport port-security violation <protect|restrict|shutdown> (shutdown is default)' },
  ],
}

/* =========================================================================
   ANTHROPIC API HELPER
   ========================================================================= */
const API_URL = 'https://api.anthropic.com/v1/messages'
const PROXY_URL = '/api/claude'
// Model tiers: cheap/mechanical generation runs on Haiku, reasoning-heavy work
// (explanations, quizzes, tutor) on Sonnet. Routing per task keeps cost down.
const MODELS = { smart: 'claude-sonnet-4-6', fast: 'claude-haiku-4-5' }
const MODEL = MODELS.smart

// Wraps a system string as a cacheable block so a stable prefix can be reused
// across calls (prompt caching). Used where the context is large/repeated
// (tutor turns, mock-exam domain notes).
function cachedSystem(text) {
  return [{ type: 'text', text, cache_control: { type: 'ephemeral' } }]
}

// In production we call our same-origin Cloudflare Pages Function, which holds
// the API key server-side. During local `npm run dev` (no Function running) we
// fall back to a direct browser call using the local .env key, so dev still works.
const DEV_DIRECT = import.meta.env.DEV && !!import.meta.env.VITE_ANTHROPIC_API_KEY
function claudeFetch(body) {
  if (DEV_DIRECT) {
    return fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body),
    })
  }
  return fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/* ---- Token usage + cost telemetry (local; no network) ---- */
// $ per 1M tokens. Cache reads are ~0.1x input; cache writes ~1.25x.
const PRICING = {
  'claude-sonnet-4-6': { in: 3, out: 15 },
  'claude-haiku-4-5': { in: 1, out: 5 },
  default: { in: 3, out: 15 },
}
function estimateCost(model, u = {}) {
  const r = PRICING[model] || PRICING.default
  const input = u.input_tokens || 0
  const cacheRead = u.cache_read_input_tokens || 0
  const cacheWrite = u.cache_creation_input_tokens || 0
  const output = u.output_tokens || 0
  return (input * r.in + cacheRead * r.in * 0.1 + cacheWrite * r.in * 1.25 + output * r.out) / 1e6
}
// Fire-and-forget: accumulate per-feature / per-model token + cost totals.
async function logUsage(feature, model, u) {
  try {
    if (!u) return
    const store = (await window.storage.getItem(STORAGE_KEYS.usage)) || { since: Date.now(), calls: 0, input: 0, output: 0, costUSD: 0, byFeature: {}, byModel: {} }
    const cost = estimateCost(model, u)
    const inTok = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0)
    const out = u.output_tokens || 0
    store.calls += 1; store.input += inTok; store.output += out; store.costUSD += cost
    const bump = (map, key) => {
      const e = map[key] || { calls: 0, input: 0, output: 0, costUSD: 0 }
      e.calls += 1; e.input += inTok; e.output += out; e.costUSD += cost
      map[key] = e
    }
    bump(store.byFeature, feature || 'other')
    bump(store.byModel, model || 'unknown')
    await window.storage.setItem(STORAGE_KEYS.usage, store)
  } catch { /* telemetry must never break the app */ }
}

// Core request loop: tries up to (1 + retries) times with 800ms / 1600ms backoff
// (+jitter), retrying network errors and 429/5xx/529. Returns the parsed
// response object. Throws an Error with a user-facing message on failure.
async function callClaude(body, retries = 2, feature = 'other') {
  const delays = [800, 1600]
  const wait = (ms) => new Promise(r => setTimeout(r, ms + Math.floor(Math.random() * 200)))
  let lastError = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await claudeFetch(body)

      if (!res.ok) {
        let detail = ''
        try { detail = (await res.json())?.error?.message || '' } catch { /* body wasn't JSON */ }
        // Retry on rate limit, overloaded (529), or server errors.
        if (res.status === 429 || res.status === 529 || res.status >= 500) {
          lastError = new Error(`Claude API error ${res.status}${detail ? `: ${detail}` : ''}`)
          if (attempt < retries) { await wait(delays[attempt] || 1600); continue }
          throw lastError
        }
        throw new Error(`Claude API error ${res.status}${detail ? `: ${detail}` : ' — check your API key and request.'}`)
      }

      const data = await res.json()
      if (data?.usage) logUsage(feature, body.model, data.usage)
      return data
    } catch (err) {
      lastError = err
      const isNetworkError = err instanceof TypeError || /failed to fetch|network/i.test(err.message || '')
      if (isNetworkError && attempt < retries) { await wait(delays[attempt] || 1600); continue }
      if (isNetworkError) {
        throw new Error('Network error: could not reach the Claude API. Check your internet connection (this is common on flaky mobile/LTE connections) and try again.')
      }
      throw err
    }
  }
  throw lastError || new Error('Unknown error contacting Claude API.')
}

// Text completion. `model` lets callers pick a tier (defaults to Sonnet).
async function askClaude({ system, messages, max_tokens = 1000, model = MODEL, retries = 2, feature = 'other' }) {
  const data = await callClaude({ model, max_tokens, system, messages }, retries, feature)
  const text = data?.content?.find(b => b.type === 'text')?.text
  if (!text) throw new Error('Claude API returned an empty response.')
  return text
}

// Structured output via a forced tool call: Claude must return data matching
// `schema`, so we get a guaranteed-shaped object instead of parsing JSON out of
// prose. Eliminates the whole "unexpected format" failure class.
async function askClaudeJSON({ system, messages, max_tokens = 1500, model = MODEL, schema, toolName = 'emit_result', retries = 2, feature = 'other' }) {
  const tool = { name: toolName, description: 'Return the result as structured data.', input_schema: schema }
  const data = await callClaude({
    model, max_tokens, system, messages,
    tools: [tool], tool_choice: { type: 'tool', name: toolName },
  }, retries, feature)
  const block = data?.content?.find(b => b.type === 'tool_use')
  if (!block || !block.input) throw new Error('Claude returned no structured result. Please try again.')
  return block.input
}

// Streaming text completion — for long tutor replies, shows tokens as they
// arrive instead of one long wait. `onDelta(textChunk)` fires per chunk;
// resolves with the full text once the stream ends. Falls back to a plain
// error (no retry loop) since a partial stream can't be cleanly retried.
async function askClaudeStream({ system, messages, max_tokens = 1000, model = MODEL, feature = 'other', onDelta }) {
  const res = await claudeFetch({ model, max_tokens, system, messages, stream: true })
  if (!res.ok) {
    let detail = ''
    try { detail = (await res.json())?.error?.message || '' } catch { /* not JSON */ }
    throw new Error(`Claude API error ${res.status}${detail ? `: ${detail}` : ''}`)
  }
  if (!res.body) {
    // Environment doesn't support streaming responses — fall back to one shot.
    return askClaude({ system, messages, max_tokens, model, feature })
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let text = ''
  const usage = {}

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() // keep any partial line for the next chunk
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      let evt
      try { evt = JSON.parse(line.slice(6)) } catch { continue }
      if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
        text += evt.delta.text
        onDelta?.(evt.delta.text)
      } else if (evt.type === 'message_start' && evt.message?.usage) {
        Object.assign(usage, evt.message.usage)
      } else if (evt.type === 'message_delta' && evt.usage) {
        Object.assign(usage, evt.usage)
      } else if (evt.type === 'error') {
        throw new Error(`Claude API error: ${evt.error?.message || 'stream error'}`)
      }
    }
  }
  if (Object.keys(usage).length) logUsage(feature, model, usage)
  if (!text) throw new Error('Claude API returned an empty response.')
  return text
}

/* ---- JSON Schemas for structured generation ---- */
const QUIZ_SCHEMA = {
  type: 'object', required: ['questions'],
  properties: { questions: { type: 'array', items: {
    type: 'object', required: ['question', 'choices', 'correctIndex', 'explanation', 'type', 'difficulty'],
    properties: {
      question: { type: 'string' },
      choices: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 4 },
      correctIndex: { type: 'integer', minimum: 0, maximum: 3 },
      explanation: { type: 'string' },
      type: { type: 'string', enum: ['definition', 'scenario', 'application', 'true-false', 'troubleshooting'] },
      difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
      concept: { type: 'string' },
    },
  } } },
}
const MOCK_SCHEMA = {
  type: 'object', required: ['questions'],
  properties: { questions: { type: 'array', items: {
    type: 'object', required: ['objectiveId', 'question', 'choices', 'correctIndex', 'explanation'],
    properties: {
      objectiveId: { type: 'string' },
      question: { type: 'string' },
      choices: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
      correctIndex: { type: 'integer', minimum: 0, maximum: 3 },
      explanation: { type: 'string' },
    },
  } } },
}
const TERMS_SCHEMA = {
  type: 'object', required: ['cards'],
  properties: { cards: { type: 'array', items: {
    type: 'object', required: ['term', 'detail'],
    properties: { term: { type: 'string' }, detail: { type: 'string' } },
  } } },
}
const VISUAL_SCHEMA = {
  type: 'object', required: ['type', 'title'],
  properties: {
    type: { type: 'string', enum: ['command_sequence', 'comparison', 'layer_stack', 'flow'] },
    title: { type: 'string' },
    steps: { type: 'array', items: { type: 'string' } },
    layers: { type: 'array', items: { type: 'object', required: ['label'], properties: { label: { type: 'string' }, note: { type: 'string' } } } },
    left: { type: 'object', properties: { label: { type: 'string' }, points: { type: 'array', items: { type: 'string' } } } },
    right: { type: 'object', properties: { label: { type: 'string' }, points: { type: 'array', items: { type: 'string' } } } },
  },
}

// Lightweight reachability check for the offline banner — does not consume
// significant tokens, just confirms the API endpoint responds.
async function checkApiReachable() {
  try {
    const res = await claudeFetch({ model: MODELS.fast, max_tokens: 1, messages: [{ role: 'user', content: 'hi' }] })
    // Any HTTP response (even an error like 400/401) means the network path works.
    return res.status !== 0
  } catch {
    return false
  }
}

/* =========================================================================
   PERSISTENCE — all reads/writes go through window.storage
   ========================================================================= */
const STORAGE_KEYS = {
  progress: 'ccna_progress_v1',
  missed: 'ccna_missed_v1',
  streak: 'ccna_streak_v1',
  quizBank: 'ccna_quiz_bank_v1',
  visualCache: 'ccna_visual_cache_v1',
  events: 'ccna_events_v1',
  cliStats: 'ccna_cli_stats_v1',
  syncCode: 'ccna_sync_code_v1',
  syncLast: 'ccna_sync_last_v1',
  usage: 'ccna_usage_v1',
  tutorChat: 'ccna_tutor_chat_v1',
  theme: 'ccna_theme_v1',
}

// progress shape: { [objectiveId]: { status: 'unseen'|'in_progress'|'mastered', quizScores: [{score,total,date}], lastSeen } }
async function loadProgress() {
  const stored = await window.storage.getItem(STORAGE_KEYS.progress)
  return stored || {}
}
async function saveProgress(progress) {
  await window.storage.setItem(STORAGE_KEYS.progress, progress)
}

// missed shape: [{ objectiveId, question, choices, correctIndex, explanation, addedAt }]
async function loadMissed() {
  const stored = await window.storage.getItem(STORAGE_KEYS.missed)
  return stored || []
}
async function saveMissed(missed) {
  await window.storage.setItem(STORAGE_KEYS.missed, missed)
}

// streak shape: { count, lastStudyDate (YYYY-MM-DD) }
async function loadStreak() {
  const stored = await window.storage.getItem(STORAGE_KEYS.streak)
  return stored || { count: 0, lastStudyDate: null }
}
async function saveStreak(streak) {
  await window.storage.setItem(STORAGE_KEYS.streak, streak)
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}
function daysBetween(a, b) {
  const ms = new Date(b) - new Date(a)
  return Math.round(ms / 86400000)
}
// Call whenever the user does study activity. Returns the updated streak.
async function bumpStreak() {
  const streak = await loadStreak()
  const today = todayStr()
  if (streak.lastStudyDate === today) return streak
  if (streak.lastStudyDate) {
    const diff = daysBetween(streak.lastStudyDate, today)
    if (diff === 1) streak.count += 1
    else if (diff > 1) streak.count = 1
    else streak.count = streak.count || 1
  } else {
    streak.count = 1
  }
  streak.lastStudyDate = today
  await saveStreak(streak)
  return streak
}

/* =========================================================================
   QUIZ BANK — generate-once, reuse-often. Questions are stored permanently
   per objective so review sessions cost zero API calls. We only call the API
   when the bank is too small or the learner explicitly asks for fresh ones.
   bank shape: { [objectiveId]: [{ id, question, choices, correctIndex,
                 explanation, ratings:[{value,at}], attempts:[{correct,at}] }] }
   ========================================================================= */
const QUIZ_BANK_MIN = 5   // questions needed before we can run a no-API session
const QUIZ_SESSION_SIZE = 5

async function loadQuizBank() {
  return (await window.storage.getItem(STORAGE_KEYS.quizBank)) || {}
}
async function saveQuizBank(bank) {
  await window.storage.setItem(STORAGE_KEYS.quizBank, bank)
}
function normalizeQuestionText(q) {
  return (q || '').trim().toLowerCase().replace(/\s+/g, ' ')
}
// Adds new questions to an objective's bank, skipping duplicates. Returns the
// updated full bank object (caller persists it).
function mergeIntoBank(bank, objectiveId, questions) {
  const existing = bank[objectiveId] || []
  const seen = new Set(existing.map(q => normalizeQuestionText(q.question)))
  let counter = existing.length
  const added = questions
    .filter(q => q && q.question && !seen.has(normalizeQuestionText(q.question)))
    .map(q => ({
      id: `${objectiveId}-${Date.now()}-${counter++}`,
      question: q.question,
      choices: q.choices,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      ratings: [],
      attempts: [],
    }))
  bank[objectiveId] = [...existing, ...added]
  return bank
}
// Picks up to QUIZ_SESSION_SIZE questions, prioritising those the learner has
// never answered, rated hard, or previously missed (deterministic spaced
// repetition over the stored bank — no API call).
//
// `accuracy` (0..1, recent quiz accuracy for this objective, or null if
// unknown) adaptively nudges the difficulty mix: a learner who's been doing
// well gets pulled toward harder questions (less time on mastered easy
// material); a struggling learner gets pulled toward easier/medium ones. This
// only breaks near-ties in review priority — never-seen or just-missed
// questions are still reviewed first regardless of difficulty.
function pickReviewSet(banked, accuracy = null) {
  const priority = (q) => {
    const lastRating = q.ratings.length ? q.ratings[q.ratings.length - 1].value : null
    const lastAttempt = q.attempts.length ? q.attempts[q.attempts.length - 1] : null
    if (q.attempts.length === 0) return 0                       // never seen — first
    if (lastAttempt && !lastAttempt.correct) return 1           // last attempt wrong
    if (lastRating === 'hard' || lastRating === 'practice') return 2
    if (lastRating === 'medium') return 3
    return 4                                                    // easy / confident — last
  }
  const diffBias = accuracy == null ? {}
    : accuracy >= 0.8 ? { easy: 0.35, medium: 0, hard: -0.35 }   // doing well — favor harder
    : accuracy < 0.5 ? { easy: -0.35, medium: 0, hard: 0.35 }    // struggling — favor easier
    : {}
  // Select by review priority (adaptively biased), then present easy -> hard within the session.
  const diffRank = { easy: 0, medium: 1, hard: 2 }
  return [...banked]
    .map(q => ({ q, p: priority(q) + (diffBias[q.difficulty] ?? 0), j: Math.random() }))
    .sort((a, b) => a.p - b.p || a.j - b.j)
    .slice(0, QUIZ_SESSION_SIZE)
    .sort((a, b) => (diffRank[a.q.difficulty] ?? 1) - (diffRank[b.q.difficulty] ?? 1))
    .map(x => x.q)
}
// Records an attempt + optional confidence rating against a banked question.
// `schedule` gates spaced-repetition: a question only joins the review queue
// once its section has cleared the mastery gate (see enableSectionReview).
// Reviewing material the learner doesn't yet understand just reinforces
// confusion, so until the gate opens we record attempts but assign no schedule.
async function recordQuizResult(objectiveId, questionId, { correct, rating, schedule = true } = {}) {
  const bank = await loadQuizBank()
  const list = bank[objectiveId]
  if (!list) return
  const q = list.find(x => x.id === questionId)
  if (!q) return
  if (typeof correct === 'boolean') {
    q.attempts.push({ correct, at: Date.now() })
    if (schedule) q.srs = nextSrs(q.srs, correct) // advance spaced-repetition schedule
  }
  if (rating) q.ratings.push({ value: rating, at: Date.now() })
  await saveQuizBank(bank)
}

/* =========================================================================
   SPACED REPETITION — expanding fixed-ladder scheduler grounded in the
   forgetting curve. Each answered question carries a schedule so it returns
   for review on the right day, across sessions and devices (synced). All local.
   srs shape: { due (ts), interval (days), reps (consecutiveCorrect),
                lapses, intervalIndex }
   ========================================================================= */
const DAY_MS = 86400000
// Expanding intervals (days): 2d → 1wk → 2wk → 1mo → 2mo (maintenance).
const SRS_LADDER = [2, 7, 14, 30, 60]
const MASTERY_GATE = 0.7 // section accuracy required before reviews schedule
function nextSrs(prev, correct) {
  const s = prev || { reps: 0, lapses: 0 }
  let reps = s.reps || 0
  let lapses = s.lapses || 0
  if (correct) {
    reps += 1                       // advance to the next, longer interval
  } else {
    reps = 0                        // lapse: reset to the 2-day interval + flag
    lapses += 1
  }
  const intervalIndex = Math.min(Math.max(reps - 1, 0), SRS_LADDER.length - 1)
  const interval = SRS_LADDER[intervalIndex]
  return { interval, reps, lapses, intervalIndex, due: Date.now() + interval * DAY_MS }
}
// Mastery gate: once a learner clears MASTERY_GATE on a section, its already-
// answered questions enter the review queue (seeded from their last attempt).
// Mirrors seedTestedOutReview but for the normal "studied + passed" path.
async function enableSectionReview(objectiveId) {
  const bank = await loadQuizBank()
  const list = bank[objectiveId]
  if (!list) return
  let changed = false
  list.forEach(q => {
    if ((q.attempts?.length || 0) > 0 && !q.srs) {
      q.srs = nextSrs(undefined, q.attempts[q.attempts.length - 1].correct)
      changed = true
    }
  })
  if (changed) await saveQuizBank(bank)
}
// All banked questions due for review now (scheduled + seen), across every
// objective. Returned INTERLEAVED: round-robin across sections so similar
// concepts never sit adjacent — forcing discrimination strengthens recall.
async function loadDueQuestions(limit = 20) {
  const bank = await loadQuizBank()
  const now = Date.now()
  const bySection = {}
  for (const objectiveId of Object.keys(bank)) {
    for (const q of bank[objectiveId]) {
      if (!q.srs || (q.attempts?.length || 0) === 0) continue
      if ((q.srs.due ?? 0) <= now) {
        (bySection[objectiveId] ||= []).push({ ...q, objectiveId, dueAt: q.srs.due ?? 0 })
      }
    }
  }
  // Within a section: soonest-due first, but float troubleshooting items that
  // have reached a longer interval (index >= 2) to the front — at maintenance
  // distances they're the best probe of durable, transferable understanding.
  const lateTs = (q) => (q.type === 'troubleshooting' && (q.srs?.intervalIndex || 0) >= 2) ? 0 : 1
  const queues = Object.values(bySection)
    .map(arr => arr.sort((a, b) => lateTs(a) - lateTs(b) || a.dueAt - b.dueAt))
    .sort(() => Math.random() - 0.5)
  const interleaved = []
  let added = true
  while (added && interleaved.length < limit) {
    added = false
    for (const queue of queues) {
      if (queue.length) { interleaved.push(queue.shift()); added = true; if (interleaved.length >= limit) break }
    }
  }
  return interleaved
}
async function countDueQuestions() {
  const bank = await loadQuizBank()
  const now = Date.now()
  let n = 0
  for (const objectiveId of Object.keys(bank)) {
    for (const q of bank[objectiveId]) {
      if (q.srs && (q.attempts?.length || 0) > 0 && (q.srs.due ?? 0) <= now) n++
    }
  }
  return n
}

/* ---- Retention health: per-section state derived from each question's
   spaced-repetition schedule + lapses. Strong (all items in long intervals) /
   Fading (due soon or lightly lapsed) / Study (multiple lapses → revisit the
   Explain page). Weak deliberately maps to the blue "study" color, never red. */
function sectionRetention(list) {
  const scheduled = (list || []).filter(q => q.srs && (q.attempts?.length || 0) > 0)
  if (scheduled.length === 0) return null
  const now = Date.now()
  const dueNow = scheduled.filter(q => (q.srs.due ?? 0) <= now).length
  const heavyLapse = scheduled.filter(q => (q.srs.lapses || 0) >= 2).length
  const inLong = scheduled.filter(q => (q.srs.intervalIndex || 0) >= 2).length
  let state
  if (heavyLapse >= 2 || heavyLapse / scheduled.length >= 0.34) state = 'weak'
  else if (inLong === scheduled.length && dueNow === 0) state = 'strong'
  else state = 'fading'
  return { count: scheduled.length, dueNow, heavyLapse, inLong, state }
}
async function loadRetentionHealth() {
  const bank = await loadQuizBank()
  const rows = []
  for (const objectiveId of Object.keys(bank)) {
    const r = sectionRetention(bank[objectiveId])
    if (!r) continue
    const o = ALL_OBJECTIVES.find(x => x.id === objectiveId)
    if (!o) continue
    rows.push({ ...r, id: objectiveId, title: o.title, objective: o })
  }
  // Surface the most at-risk sections first: weak, then fading, then strong.
  const order = { weak: 0, fading: 1, strong: 2 }
  return rows.sort((a, b) => order[a.state] - order[b.state] || b.dueNow - a.dueNow)
}
const RETENTION_META = {
  strong: { accent: 'mint', label: 'STRONG', icon: '🛡️', note: () => 'All items in long intervals' },
  fading: { accent: 'amber', label: 'FADING', icon: '⏳', note: (r) => r.dueNow > 0 ? `${r.dueNow} item${r.dueNow === 1 ? '' : 's'} due soon` : 'Building strength' },
  weak: { accent: 'sky', label: 'STUDY', icon: '📘', note: () => 'Multiple lapses — revisit Explain first' },
}

/* =========================================================================
   EVENT LOG — lightweight, append-only behaviour stream (capped). Feeds the
   mastery engine and tutor without any AI calls. Business logic only.
   ========================================================================= */
const EVENT_LOG_CAP = 600
async function logEvent(type, payload = {}) {
  try {
    const events = (await window.storage.getItem(STORAGE_KEYS.events)) || []
    events.push({ type, at: Date.now(), ...payload })
    const trimmed = events.length > EVENT_LOG_CAP ? events.slice(-EVENT_LOG_CAP) : events
    await window.storage.setItem(STORAGE_KEYS.events, trimmed)
  } catch {
    // logging must never break the study flow
  }
}

/* =========================================================================
   MASTERY ENGINE — deterministic, multi-factor (not a single percentage).
   Combines recent quiz accuracy with learner confidence so a topic is only
   "mastered" when the learner is both accurate AND confident.
   ========================================================================= */
const RATING_CONFIDENCE = { easy: 1, medium: 0.6, hard: 0.3, practice: 0.1 }
// Returns { score: 0..1, mastered: boolean } from a progress entry.
function computeMastery(entry) {
  if (!entry) return { score: 0, mastered: false }
  const scores = entry.quizScores || []
  if (scores.length === 0) return { score: 0, mastered: false }
  // accuracy: weight recent sessions more (last 3)
  const recent = scores.slice(-3)
  const acc = recent.reduce((s, r) => s + (r.score / Math.max(r.total, 1)), 0) / recent.length
  // confidence: average of stored confidence ratings, default neutral 0.6
  const ratings = entry.confidenceRatings || []
  const conf = ratings.length
    ? ratings.reduce((s, r) => s + (RATING_CONFIDENCE[r] ?? 0.6), 0) / ratings.length
    : 0.6
  const score = acc * 0.7 + conf * 0.3
  // mastered requires strong accuracy, decent confidence, and at least one full session
  const mastered = acc >= 0.8 && conf >= 0.5 && recent.some(r => r.total >= 3)
  return { score, mastered }
}
// Separate accuracy vs confidence (for the confidence-vs-accuracy quadrant).
function masteryBreakdown(entry) {
  const scores = entry?.quizScores || []
  if (scores.length === 0) return { acc: 0, conf: 0, has: false }
  const recent = scores.slice(-3)
  const acc = recent.reduce((s, r) => s + (r.score / Math.max(r.total, 1)), 0) / recent.length
  const ratings = entry.confidenceRatings || []
  const conf = ratings.length
    ? ratings.reduce((s, r) => s + (RATING_CONFIDENCE[r] ?? 0.6), 0) / ratings.length
    : 0.6
  return { acc, conf, has: true }
}

/* =========================================================================
   CROSS-DEVICE SYNC  — shareable code + D1 (via /api/sync). The bundle holds
   the user-specific learning data; merges are deterministic and convergent so
   syncing the same code on two devices ends with both holding the union.
   ========================================================================= */
const SYNC_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function generateSyncCode() {
  let s = ''
  for (let i = 0; i < 16; i++) {
    if (i && i % 4 === 0) s += '-'
    s += SYNC_CODE_ALPHABET[Math.floor(Math.random() * SYNC_CODE_ALPHABET.length)]
  }
  return s
}

async function loadSyncBundle() {
  const [progress, missed, quizBank, cliStats, streak] = await Promise.all([
    window.storage.getItem(STORAGE_KEYS.progress),
    window.storage.getItem(STORAGE_KEYS.missed),
    window.storage.getItem(STORAGE_KEYS.quizBank),
    window.storage.getItem(STORAGE_KEYS.cliStats),
    window.storage.getItem(STORAGE_KEYS.streak),
  ])
  return {
    progress: progress || {}, missed: missed || [], quizBank: quizBank || {},
    cliStats: cliStats || {}, streak: streak || { count: 0, lastStudyDate: null },
  }
}
async function saveSyncBundle(b) {
  await Promise.all([
    window.storage.setItem(STORAGE_KEYS.progress, b.progress),
    window.storage.setItem(STORAGE_KEYS.missed, b.missed),
    window.storage.setItem(STORAGE_KEYS.quizBank, b.quizBank),
    window.storage.setItem(STORAGE_KEYS.cliStats, b.cliStats),
    window.storage.setItem(STORAGE_KEYS.streak, b.streak),
  ])
}

// Merge a single progress entry: union quiz sessions by date, keep the richer
// confidence history, recompute mastery from the merged data.
function mergeProgressEntry(a, b) {
  if (!a) return b
  if (!b) return a
  const byDate = {}
  ;[...(a.quizScores || []), ...(b.quizScores || [])].forEach(s => { byDate[s.date] = s })
  const quizScores = Object.values(byDate).sort((x, y) => x.date - y.date)
  const confidenceRatings = ((a.confidenceRatings || []).length >= (b.confidenceRatings || []).length ? a.confidenceRatings : b.confidenceRatings) || []
  const { score, mastered } = computeMastery({ quizScores, confidenceRatings })
  return {
    status: mastered ? 'mastered' : (quizScores.length ? 'in_progress' : (a.status || b.status || 'unseen')),
    quizScores, confidenceRatings, masteryScore: score,
    lastSeen: Math.max(a.lastSeen || 0, b.lastSeen || 0),
  }
}
function mergeProgress(a = {}, b = {}) {
  const out = { ...a }
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    out[id] = mergeProgressEntry(a[id], b[id])
  }
  return out
}
function mergeMissed(a = [], b = []) {
  const seen = new Set()
  const out = []
  ;[...a, ...b].forEach(m => {
    const k = `${m.objectiveId}::${m.question}`
    if (!seen.has(k)) { seen.add(k); out.push(m) }
  })
  return out
}
function mergeQuizBank(a = {}, b = {}) {
  const out = {}
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const map = {}
    ;[...(a[id] || []), ...(b[id] || [])].forEach(q => {
      const k = normalizeQuestionText(q.question)
      // keep the copy with more recorded attempts (more learner history)
      if (!map[k] || (q.attempts?.length || 0) > (map[k].attempts?.length || 0)) map[k] = q
    })
    out[id] = Object.values(map)
  }
  return out
}
function mergeCliStats(a = {}, b = {}) {
  const out = { ...a }
  for (const id of Object.keys(b)) {
    if (!out[id] || (b[id].updatedAt || 0) > (out[id].updatedAt || 0)) out[id] = b[id]
  }
  return out
}
function mergeStreak(a = { count: 0 }, b = { count: 0 }) {
  const ad = a?.lastStudyDate || '', bd = b?.lastStudyDate || ''
  if (bd > ad) return b
  if (ad > bd) return a
  return (b?.count || 0) > (a?.count || 0) ? b : a
}
function mergeSyncData(local, remote = {}) {
  return {
    progress: mergeProgress(local.progress, remote.progress || {}),
    missed: mergeMissed(local.missed, remote.missed || []),
    quizBank: mergeQuizBank(local.quizBank, remote.quizBank || {}),
    cliStats: mergeCliStats(local.cliStats, remote.cliStats || {}),
    streak: mergeStreak(local.streak, remote.streak || { count: 0, lastStudyDate: null }),
  }
}

async function pullSync(code) {
  const res = await fetch(`/api/sync?code=${encodeURIComponent(code)}`)
  if (!res.ok) throw new Error(`Sync server error ${res.status}`)
  const j = await res.json()
  return j.data || null
}
async function pushSync(code, data) {
  const res = await fetch('/api/sync', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ code, data }),
  })
  if (!res.ok) throw new Error(`Sync server error ${res.status}`)
  return res.json()
}

/* =========================================================================
   LEARNER SUMMARY + LOCAL RECOMMENDATION ENGINE
   Deterministic analysis of progress + event log + missed bank. Produces both
   the "For You" suggestion cards and the behaviour context the AI tutor reads.
   No AI and no network — recommendations are business logic, generated locally.
   ========================================================================= */
function daysSinceTs(ts) {
  return ts ? Math.floor((Date.now() - ts) / 86400000) : null
}
async function buildLearnerSummary(progress, missed = []) {
  const events = (await window.storage.getItem(STORAGE_KEYS.events)) || []

  const perObjective = ALL_OBJECTIVES.map(o => {
    const p = progress[o.id]
    const status = p?.status || 'unseen'
    const { score } = computeMastery(p)
    const ratings = (p?.confidenceRatings || []).slice(-4)
    const hardCount = ratings.filter(r => r === 'hard' || r === 'practice').length
    return {
      ...o,
      status,
      mastery: score,
      hardCount,
      attempts: (p?.quizScores || []).length,
      daysSince: daysSinceTs(p?.lastSeen),
    }
  })

  const missedByObj = {}
  missed.forEach(m => { missedByObj[m.objectiveId] = (missedByObj[m.objectiveId] || 0) + 1 })

  const domainStats = DOMAINS.map(d => {
    const objs = perObjective.filter(o => o.domainId === d.id)
    const mastered = objs.filter(o => o.status === 'mastered').length
    const avg = objs.reduce((s, o) => s + o.mastery, 0) / Math.max(objs.length, 1)
    return { id: d.id, name: d.name, weight: d.weight, mastered, total: objs.length, avg }
  })

  const recentTopics = [...new Set(
    events.filter(e => e.type === 'user_viewed_topic').slice(-10).map(e => e.objectiveId).reverse()
  )].slice(0, 4)

  return { perObjective, missedByObj, domainStats, recentTopics }
}

// Suggestion-card descriptors. Each card is fully actionable and distinct from
// normal content (reference: contextual recommendation cards).
function generateLocalSuggestions(summary) {
  const { perObjective, missedByObj } = summary
  const cards = []
  const used = new Set()
  const add = (card) => {
    const id = card.objective?.id
    if (id && used.has(id)) return
    if (id) used.add(id)
    cards.push(card)
  }
  const inProgress = perObjective.filter(o => o.status === 'in_progress' && o.attempts > 0)

  // 1. Weakest active topic
  const weakest = [...inProgress].sort((a, b) => a.mastery - b.mastery)[0]
  if (weakest && weakest.mastery < 0.6) {
    add({
      key: 'weak', chip: 'WEAK SPOT', accent: 'rose', objective: weakest, tab: 'Explain',
      title: `${weakest.id} ${weakest.title}`,
      body: `Your weakest active topic at ${Math.round(weakest.mastery * 100)}% mastery. A focused review will move the needle most.`,
    })
  }

  // 2. Low confidence on a topic that has a hands-on CLI lab
  const cliStruggle = [...inProgress]
    .filter(o => o.hardCount >= 2 && COMMAND_DRILLS[o.id])
    .sort((a, b) => b.hardCount - a.hardCount)[0]
  if (cliStruggle) {
    add({
      key: 'cli', chip: 'HANDS-ON', accent: 'sky', objective: cliStruggle, tab: 'CLI Drill',
      title: `${cliStruggle.id} ${cliStruggle.title}`,
      body: `You rated several questions here tough. Reinforce it with the CLI drill — muscle memory beats re-reading.`,
    })
  }

  // 3. A topic that's close to mastered — worth locking in
  const near = [...inProgress]
    .filter(o => o.mastery >= 0.6 && o.mastery < 0.85)
    .sort((a, b) => b.mastery - a.mastery)[0]
  if (near) {
    add({
      key: 'near', chip: 'ALMOST THERE', accent: 'mint', objective: near, tab: 'Quiz',
      title: `${near.id} ${near.title}`,
      body: `Nearly mastered at ${Math.round(near.mastery * 100)}%. One more quiz set from your bank could lock it in.`,
    })
  }

  // 4. A concept you keep missing
  const missedTop = Object.entries(missedByObj).sort((a, b) => b[1] - a[1])[0]
  if (missedTop && missedTop[1] >= 2) {
    const o = perObjective.find(x => x.id === missedTop[0])
    if (o) {
      add({
        key: 'missed', chip: 'RECURRING MISS', accent: 'rose', objective: o, tab: 'Quiz',
        title: `${o.id} ${o.title}`,
        body: `You've missed ${missedTop[1]} questions here. Re-quiz from the bank — wrong answers come back first.`,
      })
    }
  }

  // 5. Spaced repetition — a mastered topic going stale
  const stale = perObjective
    .filter(o => o.status === 'mastered' && o.daysSince != null && o.daysSince >= 7)
    .sort((a, b) => b.daysSince - a.daysSince)[0]
  if (stale) {
    add({
      key: 'stale', chip: 'REVIEW', accent: 'purple', objective: stale, tab: 'Quiz',
      title: `${stale.id} ${stale.title}`,
      body: `Mastered but not reviewed in ${stale.daysSince} days. A quick pass keeps retention from slipping.`,
    })
  }

  // Fallback for a brand-new learner
  if (cards.length === 0) {
    const first = perObjective.find(o => o.status === 'unseen') || perObjective[0]
    if (first) {
      add({
        key: 'start', chip: 'START HERE', accent: 'purple', objective: first, tab: 'Explain',
        title: `${first.id} ${first.title}`,
        body: `New here? Begin with the fundamentals and build from the ground up.`,
      })
    }
  }

  return cards.slice(0, 3)
}

// Compact behaviour context for the tutor's system prompt (string block).
function summarizeForTutor(summary) {
  const { perObjective, domainStats, missedByObj, recentTopics } = summary
  const weak = [...perObjective]
    .filter(o => o.status !== 'mastered' && o.attempts > 0)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 5)
    .map(o => `${o.id} ${o.title} (${Math.round(o.mastery * 100)}%${o.hardCount >= 2 ? ', low confidence' : ''})`)
  const masteredCount = perObjective.filter(o => o.status === 'mastered').length
  const domains = domainStats
    .map(d => `${d.name}: ${Math.round(d.avg * 100)}% avg, ${d.mastered}/${d.total} mastered`)
    .join('; ')
  const missedConcepts = Object.entries(missedByObj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id, n]) => {
      const o = ALL_OBJECTIVES.find(x => x.id === id)
      return `${id} ${o ? o.title : ''} (missed ${n})`
    })
  const recent = recentTopics
    .map(id => { const o = ALL_OBJECTIVES.find(x => x.id === id); return o ? `${id} ${o.title}` : id })

  return [
    `Objectives mastered so far: ${masteredCount} of ${ALL_OBJECTIVES.length}.`,
    `Per-domain mastery — ${domains}.`,
    `Weakest active objectives: ${weak.length ? weak.join('; ') : 'none yet'}.`,
    `Most frequently missed: ${missedConcepts.length ? missedConcepts.join('; ') : 'none recorded'}.`,
    `Recently studied: ${recent.length ? recent.join('; ') : 'nothing yet this session'}.`,
  ].join('\n')
}

/* =========================================================================
   SUBNETTING PROBLEM GENERATOR
   ========================================================================= */
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function ipToOctets(ip) { return ip.split('.').map(Number) }
function octetsToIp(o) { return o.join('.') }
function maskFromCidr(cidr) {
  const bits = '1'.repeat(cidr) + '0'.repeat(32 - cidr)
  return [0, 8, 16, 24].map(i => parseInt(bits.slice(i, i + 8), 2))
}
function cidrFromMask(mask) {
  return mask.reduce((acc, o) => acc + o.toString(2).split('1').length - 1, 0)
}

// Generates a random "given an IP and CIDR, find network/broadcast/range/etc" problem
function generateSubnetProblem() {
  const cidr = randInt(2, 30)
  const octets = [randInt(1, 223), randInt(0, 255), randInt(0, 255), randInt(1, 254)]
  const ip = octetsToIp(octets)
  const mask = maskFromCidr(cidr)

  const networkOctets = octets.map((o, i) => o & mask[i])
  const wildcard = mask.map(m => 255 - m)
  const broadcastOctets = networkOctets.map((o, i) => o | wildcard[i])

  const hostBits = 32 - cidr
  const totalHosts = Math.pow(2, hostBits)
  const usableHosts = hostBits >= 1 ? Math.max(totalHosts - 2, 0) : 0

  const firstUsable = [...networkOctets]
  const lastUsable = [...broadcastOctets]
  if (hostBits >= 1) {
    firstUsable[3] += 1
    lastUsable[3] -= 1
  }

  // block size = 256 - interesting octet of mask (find first non-255 octet)
  let blockSizeOctetIndex = mask.findIndex(m => m !== 255 && m !== 0)
  if (blockSizeOctetIndex === -1) blockSizeOctetIndex = cidr === 32 ? 3 : 0
  const blockSize = 256 - mask[blockSizeOctetIndex]

  return {
    type: 'subnet',
    ip,
    cidr,
    mask: octetsToIp(mask),
    network: octetsToIp(networkOctets),
    broadcast: octetsToIp(broadcastOctets),
    firstUsable: hostBits >= 1 ? octetsToIp(firstUsable) : null,
    lastUsable: hostBits >= 1 ? octetsToIp(lastUsable) : null,
    usableHosts,
    totalHosts,
    blockSize,
    blockSizeOctetIndex,
    steps: [
      `Block size = 256 - ${mask[blockSizeOctetIndex]} (octet ${blockSizeOctetIndex + 1} of the mask) = ${blockSize}`,
      `Network address: round octet ${blockSizeOctetIndex + 1} of ${ip} down to the nearest multiple of ${blockSize} → ${octetsToIp(networkOctets)}`,
      `Broadcast address: add (block size - 1) = ${blockSize - 1} to octet ${blockSizeOctetIndex + 1} of the network address, set octets after it to 255 → ${octetsToIp(broadcastOctets)}`,
      hostBits >= 1
        ? `Usable host range: ${octetsToIp(firstUsable)} - ${octetsToIp(lastUsable)} (${usableHosts} usable hosts = 2^${hostBits} - 2)`
        : `/${cidr} has no usable hosts (point-to-point or host route).`,
    ],
  }
}

// VLSM: given a base network and a list of required host counts, allocate
// subnets in descending order of size (largest-first allocation).
function generateVLSMProblem() {
  const baseCidr = 24
  const octets = [randInt(1, 223), randInt(0, 255), randInt(0, 255), 0]
  const baseNetwork = octetsToIp(octets)

  // Generate 3-4 requirements that fit within a /24 (max 254 usable)
  const numReqs = randInt(3, 4)
  const reqs = []
  let remaining = 200
  for (let i = 0; i < numReqs; i++) {
    const maxForThis = Math.floor(remaining / (numReqs - i)) || 2
    const hosts = randInt(2, Math.max(2, Math.min(maxForThis, 60)))
    reqs.push({ name: `Subnet ${String.fromCharCode(65 + i)}`, hostsNeeded: hosts })
    remaining -= hosts
  }
  // sort largest first for allocation (this is the "answer order")
  const sorted = [...reqs].sort((a, b) => b.hostsNeeded - a.hostsNeeded)

  let cursor = ipToOctets(baseNetwork)
  const allocations = sorted.map(req => {
    // smallest CIDR that fits hostsNeeded + 2 (network + broadcast)
    let hostBits = 1
    while (Math.pow(2, hostBits) - 2 < req.hostsNeeded) hostBits++
    const cidr = 32 - hostBits
    const blockSize = Math.pow(2, hostBits)
    const mask = maskFromCidr(cidr)

    const network = [...cursor]
    const broadcastOctets = network.map((o, i) => o | (255 - mask[i]))
    const firstUsable = [...network]; firstUsable[3] += 1
    const lastUsable = [...broadcastOctets]; lastUsable[3] -= 1

    const allocation = {
      name: req.name,
      hostsNeeded: req.hostsNeeded,
      cidr,
      mask: octetsToIp(mask),
      network: octetsToIp(network),
      broadcast: octetsToIp(broadcastOctets),
      firstUsable: octetsToIp(firstUsable),
      lastUsable: octetsToIp(lastUsable),
      usableHosts: blockSize - 2,
      blockSize,
    }

    // advance cursor by blockSize (32-bit addition on the 4th octet, carrying)
    let val = cursor[0] * 16777216 + cursor[1] * 65536 + cursor[2] * 256 + cursor[3]
    val += blockSize
    cursor = [
      (val >>> 24) & 255,
      (val >>> 16) & 255,
      (val >>> 8) & 255,
      val & 255,
    ]

    return allocation
  })

  return {
    type: 'vlsm',
    baseNetwork: `${baseNetwork}/${baseCidr}`,
    requirements: reqs,
    allocations,
  }
}

/* =========================================================================
   MOCK EXAM — domain-weighted question selection
   ========================================================================= */
const MOCK_EXAM_QUESTION_COUNT = 30
const MOCK_EXAM_DURATION_MIN = 120

// Returns one entry per domain with how many of the 30 questions should come
// from it, weighted by that domain's exam percentage (last domain absorbs
// any rounding remainder so the total is always MOCK_EXAM_QUESTION_COUNT).
function buildMockExamDomainCounts() {
  const counts = []
  let allocated = 0
  DOMAINS.forEach((domain, idx) => {
    let count
    if (idx === DOMAINS.length - 1) {
      count = MOCK_EXAM_QUESTION_COUNT - allocated
    } else {
      count = Math.round((domain.weight / 100) * MOCK_EXAM_QUESTION_COUNT)
      allocated += count
    }
    counts.push({ domain, count })
  })
  return counts
}

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/* =========================================================================
   SHARED STYLE HELPERS & SMALL UI PIECES
   ========================================================================= */
function accentColors(accent) {
  switch (accent) {
    case 'mint': return { dim: COLORS.mintDim, border: COLORS.mintBorder, text: COLORS.mint }
    case 'sky': return { dim: COLORS.skyDim, border: COLORS.skyBorder, text: COLORS.sky }
    case 'amber': return { dim: COLORS.amberDim, border: COLORS.amberBorder, text: COLORS.amber }
    case 'blush': return { dim: COLORS.blushDim, border: COLORS.blushBorder, text: COLORS.blush }
    case 'rose': return { dim: COLORS.roseDim, border: COLORS.roseBorder, text: COLORS.rose }
    case 'silver': return { dim: COLORS.silverDim, border: COLORS.silverDim, text: COLORS.silver }
    case 'purple':
    default: return { dim: COLORS.purpleDim, border: COLORS.purpleDim, text: COLORS.purpleGlow }
  }
}

const styles = {
  page: { minHeight: '100vh', background: COLORS.bg, color: COLORS.silver, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', paddingBottom: 32 },
  container: { maxWidth: 640, margin: '0 auto', padding: '16px 16px 40px' },
  card: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 4px 16px #00000033' },
  cardHover: { background: COLORS.cardHover },
  h1: { fontSize: 22, fontWeight: 700, color: COLORS.silver, margin: '4px 0 4px' },
  h2: { fontSize: 17, fontWeight: 600, color: COLORS.silver, margin: '0 0 8px' },
  small: { fontSize: 13, color: COLORS.silverMid },
  primaryBtn: {
    background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleM})`,
    color: '#fff', border: 'none', borderRadius: 12, padding: '12px 18px',
    fontSize: 15, fontWeight: 600, minHeight: 44, cursor: 'pointer', width: '100%',
  },
  secondaryBtn: {
    background: COLORS.card, color: COLORS.silver, border: `1px solid ${COLORS.border}`,
    borderRadius: 12, padding: '12px 18px', fontSize: 15, fontWeight: 600, minHeight: 44, cursor: 'pointer', width: '100%',
  },
  input: {
    width: '100%', boxSizing: 'border-box', background: COLORS.surface, color: COLORS.silver,
    border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '12px 14px', fontSize: 15,
    minHeight: 44, fontFamily: 'inherit',
  },
  pill: (accent) => {
    const c = accentColors(accent)
    return { display: 'inline-block', background: c.dim, border: `1px solid ${c.border}`, color: c.text, borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 600 }
  },
  tabBar: { display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' },
  tabBtn: (active) => ({
    flex: '1 1 auto', minHeight: 44, borderRadius: 10, border: `1px solid ${active ? COLORS.purpleGlow : COLORS.border}`,
    background: active ? COLORS.purpleDim : COLORS.surface, color: active ? COLORS.purpleGlow : COLORS.silverMid,
    fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '10px 8px',
  }),
  backBtn: { background: 'none', border: 'none', color: COLORS.silverMid, fontSize: 15, cursor: 'pointer', padding: '10px 0', minHeight: 44, display: 'flex', alignItems: 'center', gap: 6 },
}

function StatusDot({ status }) {
  const color = status === 'mastered' ? COLORS.mint : status === 'in_progress' ? COLORS.purpleGlow : COLORS.silverDim
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 999, background: color, marginRight: 8, flexShrink: 0 }} />
}

function StatusLabel({ status }) {
  const map = { mastered: 'Mastered', in_progress: 'In Progress', unseen: 'Not Started' }
  const color = status === 'mastered' ? COLORS.mint : status === 'in_progress' ? COLORS.purpleGlow : COLORS.silverMid
  return <span style={{ fontSize: 12, color, fontWeight: 600 }}>{map[status] || 'Not Started'}</span>
}

function Spinner({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', color: COLORS.sky }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%',
        border: `2px solid ${COLORS.skyBorder}`, borderTopColor: COLORS.sky,
        animation: 'ccna-spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: 14 }}>{label || 'Asking Claude...'}</span>
      <style>{`@keyframes ccna-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function ErrorBox({ message, onRetry }) {
  return (
    <div style={{ background: COLORS.roseDim, border: `1px solid ${COLORS.roseBorder}`, borderRadius: 12, padding: 14, marginTop: 10 }}>
      <div style={{ color: COLORS.rose, fontSize: 14, marginBottom: onRetry ? 10 : 0 }}>{message}</div>
      {onRetry && (
        <button style={{ ...styles.secondaryBtn, width: 'auto', padding: '8px 16px', minHeight: 40 }} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

/* =========================================================================
   PROGRESS PRIMITIVES — local, data-driven, no API. Every bar is fed real
   learner numbers by its caller and carries a clear label.
   ========================================================================= */
function clamp01(n) { return Math.max(0, Math.min(1, isFinite(n) ? n : 0)) }

// Animates 0 -> target with easeOutCubic. Respects reduced-motion by snapping.
function useCountUp(target, ms = 700) {
  const [n, setN] = useState(target)
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  useEffect(() => {
    if (prefersReduced) { setN(target); return }
    let raf, start
    const tick = t => {
      start ??= t
      const p = Math.min((t - start) / ms, 1)
      setN(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms, prefersReduced])
  return n
}

// Skeleton placeholder block (shimmer). width/height accept any CSS length.
function Skeleton({ width = '100%', height = 14, style }) {
  return <div className="ccna-skeleton" style={{ width, height, marginBottom: 8, ...style }} />
}

// Short haptic pulse on supported devices (mobile). Silent no-op elsewhere.
function haptic(pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern) } catch { /* unsupported */ }
}

// Lightweight, dependency-free confetti burst (used on mastery). Self-cleans.
function celebrate() {
  if (typeof document === 'undefined') return
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const colors = ['#7c3aed', '#c084fc', '#baf0fa', '#d4f7d4', '#fde8e8']
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999'
  canvas.width = window.innerWidth; canvas.height = window.innerHeight
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  const N = 110
  const parts = Array.from({ length: N }, () => ({
    x: canvas.width / 2, y: canvas.height * 0.35,
    vx: (Math.random() - 0.5) * 14, vy: Math.random() * -12 - 4,
    s: Math.random() * 5 + 3, c: colors[(Math.random() * colors.length) | 0],
    rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4, life: 1,
  }))
  const start = performance.now()
  function frame(t) {
    const elapsed = t - start
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    parts.forEach(p => {
      p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life = 1 - elapsed / 1300
      ctx.save(); ctx.globalAlpha = Math.max(0, p.life); ctx.translate(p.x, p.y); ctx.rotate(p.rot)
      ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 1.6); ctx.restore()
    })
    if (elapsed < 1300) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}

// Labeled linear completion/strength bar — gradient fill + subtle shimmer.
function ProgressBar({ value, max = 1, label, sublabel, accent = 'purple', height = 8 }) {
  const pct = clamp01(max ? value / max : 0)
  const c = accentColors(accent)
  return (
    <div style={{ marginBottom: 10 }}>
      {(label || sublabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4, gap: 8 }}>
          {label && <span style={{ fontSize: 12, color: COLORS.silver }}>{label}</span>}
          {sublabel && <span style={{ fontSize: 12, color: c.text, fontWeight: 600, whiteSpace: 'nowrap' }}>{sublabel}</span>}
        </div>
      )}
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 999, height, overflow: 'hidden' }}>
        <div className="ccna-shimmer" style={{ width: `${pct * 100}%`, height: '100%', background: `linear-gradient(90deg, ${c.border}, ${c.text})`, borderRadius: 999, transition: 'width .5s ease' }} />
      </div>
    </div>
  )
}

// Circular mastery ring — gradient stroke + glow + animated count-up.
function ProgressRing({ value, size = 72, stroke = 7, accent = 'purple', caption }) {
  const pct = clamp01(value)
  const shown = useCountUp(pct, 800)
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const c = accentColors(accent)
  const gid = `ring-${accent}`
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={c.border} /><stop offset="100%" stopColor={c.text} />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={COLORS.border} strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={circ * (1 - shown)} strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ filter: `drop-shadow(0 0 5px ${c.text}77)` }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: size * 0.26, fontWeight: 700, color: COLORS.silver }}>{Math.round(shown * 100)}%</span>
        </div>
      </div>
      {caption && <span style={{ fontSize: 11, color: COLORS.silverMid, textAlign: 'center' }}>{caption}</span>}
    </div>
  )
}

// Segmented requirement bar (e.g. offline unlock: N of 4 assets ready).
function SegmentedBar({ segments, accent = 'mint' }) {
  const c = accentColors(accent)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {segments.map((s, i) => (
        <div key={i} title={s.label} style={{
          flex: 1, height: 6, borderRadius: 3,
          background: s.done ? c.text : COLORS.surface,
          border: `1px solid ${s.done ? c.border : COLORS.border}`,
        }} />
      ))}
    </div>
  )
}

/* =========================================================================
   EXPLAIN TAB
   ========================================================================= */
const EXPLAIN_CACHE_KEY = 'ccna_explain_cache_v2' // v2: structured sections (was prose)
const EXPLAIN_PROMPT_SYSTEM = `You are a CCNA 200-301 tutor. Use the provided reference notes as your primary source. If the notes don't fully cover something a CCNA candidate needs, fill the gap with accurate, exam-relevant CCNA 200-301 knowledge — but never contradict the reference notes. Produce a clear, layered explanation in the requested structured fields. Keep each field tight and scannable: short sentences, plain language. The "advanced" field holds deeper detail a learner can skip on first pass.${''}
- definition: 1-2 sentence plain-language answer to "what is this?"
- keyPoints: 3-5 of the most testable core facts (short phrases)
- realWorld: 1-2 sentences of practical/exam/lab context
- commonMistakes: 2-3 things students typically confuse or get wrong
- related: 2-4 prerequisite or follow-on topics (short labels)
- advanced: optional deeper detail (1-3 sentences), or omit if not needed`
const EXPLAIN_SCHEMA = {
  type: 'object',
  required: ['definition', 'keyPoints', 'commonMistakes'],
  properties: {
    definition: { type: 'string' },
    keyPoints: { type: 'array', items: { type: 'string' } },
    realWorld: { type: 'string' },
    commonMistakes: { type: 'array', items: { type: 'string' } },
    related: { type: 'array', items: { type: 'string' } },
    advanced: { type: 'string' },
  },
}

/* =========================================================================
   SOURCES — verifiable only. We cite the authoritative Cisco exam blueprint
   (objective id/title) and named reference works. No AI-invented page numbers.
   Lives here as exam-level config so it generalises to other certifications.
   ========================================================================= */
const EXAM_SOURCES = {
  examName: 'CCNA 200-301',
  blueprintUrl: 'https://learningnetwork.cisco.com/s/ccna-exam-topics',
  references: [
    { title: 'CCNA 200-301 Official Cert Guide (Vol 1 & 2)', author: 'Wendell Odom', publisher: 'Cisco Press' },
  ],
}

/* =========================================================================
   PRE-ASSESSMENT — test out of a section before studying it.
   ========================================================================= */
const PREASSESS_CACHE_KEY = 'ccna_preassess_v1'
const PREASSESS_PROMPT_SYSTEM = `You are a CCNA 200-301 assessment writer. Using the reference notes as your primary source (supplement with accurate CCNA knowledge consistent with them), write 6 multiple-choice questions that test whether a learner already knows this section's core concepts. Cover distinct sub-concepts so a wrong answer pinpoints a specific gap. Tag each question with the short sub-concept it tests.`
const PREASSESS_SCHEMA = {
  type: 'object', required: ['questions'],
  properties: { questions: { type: 'array', items: {
    type: 'object', required: ['question', 'choices', 'correctIndex', 'explanation', 'concept'],
    properties: {
      question: { type: 'string' },
      choices: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
      correctIndex: { type: 'integer', minimum: 0, maximum: 3 },
      explanation: { type: 'string' },
      concept: { type: 'string' },
    },
  } } },
}

/* =========================================================================
   KEY TERMS CAROUSEL — horizontal "flash card" pockets of must-know terms
   ========================================================================= */
const TERMS_CACHE_KEY = 'ccna_terms_cache_v1'
const TERMS_PROMPT_SYSTEM = `You are a CCNA 200-301 study aid generator. Use the provided reference notes as your primary source; where the notes don't fully cover a detail a CCNA candidate needs, fill the gap with accurate CCNA 200-301 knowledge consistent with the notes. Produce 6-8 key-term flashcards for this objective — the most exam-relevant terms, acronyms, commands, or concepts to know cold.

Respond with ONLY valid JSON (no markdown fences, no commentary), in this exact shape:
{"cards":[{"term":"...","detail":"..."}]}

"term": a short label, max ~4 words (a word, acronym, command, or short phrase).
"detail": 1-2 short sentences with the key fact, definition, or syntax.`

function KeyTermsCarousel({ objective }) {
  const [cards, setCards] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [flipped, setFlipped] = useState(() => new Set())

  const fetchTerms = useCallback(async (force) => {
    setLoading(true)
    setError(null)
    try {
      if (!force) {
        const cache = (await window.storage.getItem(TERMS_CACHE_KEY)) || {}
        if (cache[objective.id]) {
          setCards(cache[objective.id])
          setLoading(false)
          return
        }
      }
      const refNotes = BOOK_REF[objective.id] || ''
      const data = await askClaudeJSON({
        system: TERMS_PROMPT_SYSTEM,
        messages: [{
          role: 'user',
          content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}\n\nGenerate key-term flashcards for this objective.`,
        }],
        max_tokens: 700,
        model: MODELS.fast,
        schema: TERMS_SCHEMA,
        toolName: 'emit_terms',
        feature: 'terms',
      })
      const list = data.cards || []
      if (list.length === 0) throw new Error('Claude returned no flashcards.')
      setCards(list)
      const cache = (await window.storage.getItem(TERMS_CACHE_KEY)) || {}
      cache[objective.id] = list
      await window.storage.setItem(TERMS_CACHE_KEY, cache)
    } catch (err) {
      setError(err.message.includes('JSON') ? 'Claude returned an unexpected format. Please try again.' : err.message)
    } finally {
      setLoading(false)
    }
  }, [objective.id, objective.title])

  useEffect(() => {
    setCards(null)
    setError(null)
    setFlipped(new Set())
    fetchTerms(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objective.id])

  const toggleFlip = (idx) => {
    setFlipped(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  if (loading) return <Spinner label="Pulling key terms..." />
  if (error) return <ErrorBox message={error} onRetry={() => fetchTerms(true)} />
  if (!cards) return null

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ ...styles.small, fontWeight: 600 }}>Key terms — tap a card to flip</div>
        <button
          style={{ background: 'none', border: 'none', color: COLORS.silverMid, fontSize: 12, cursor: 'pointer', padding: '4px 0', minHeight: 32 }}
          onClick={() => fetchTerms(true)}
        >
          Refresh
        </button>
      </div>
      <div style={{
        display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6,
        scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
      }}>
        {cards.map((c, idx) => {
          const isFlipped = flipped.has(idx)
          return (
            <button
              key={idx}
              onClick={() => toggleFlip(idx)}
              style={{
                flex: '0 0 auto', width: 168, minHeight: 110, scrollSnapAlign: 'start',
                background: isFlipped ? COLORS.skyDim : COLORS.purpleDim,
                border: `1px solid ${isFlipped ? COLORS.skyBorder : COLORS.borderGlow}`,
                borderRadius: 12, padding: 12, textAlign: 'left', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6,
                fontFamily: 'inherit', color: COLORS.silver,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: isFlipped ? COLORS.sky : COLORS.purpleGlow }}>
                {c.term}
              </div>
              {isFlipped ? (
                <div style={{ fontSize: 12, lineHeight: 1.4, color: COLORS.silver }}>{c.detail}</div>
              ) : (
                <div style={{ fontSize: 11, color: COLORS.silverMid }}>Tap to reveal</div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* =========================================================================
   VISUAL AID — structured data is generated by the AI ONCE and cached; the
   app renders it locally from reusable templates, so re-viewing a diagram
   never costs an API call. Supported template types:
     command_sequence: { type, title, steps:[string] }
     comparison:       { type, title, left:{label,points:[]}, right:{label,points:[]} }
     layer_stack:      { type, title, layers:[{label,note}] }   (top -> bottom)
     flow:             { type, title, steps:[string] }          (left -> right)
   ========================================================================= */
const VISUAL_CACHE_KEY = STORAGE_KEYS.visualCache
const VISUAL_PROMPT_SYSTEM = `You are a CCNA 200-301 visual-aid designer. Produce ONE minimalistic visual aid that teaches the core of this objective at a glance. Choose the single template type that best fits the concept. Use the provided reference notes as your primary source; you may add accurate CCNA 200-301 detail consistent with the notes.

Respond with ONLY valid JSON (no markdown fences, no commentary) using EXACTLY ONE of these shapes:
- A CLI/config or ordered procedure:
  {"type":"command_sequence","title":"...","steps":["...","..."]}
- Two things contrasted:
  {"type":"comparison","title":"...","left":{"label":"...","points":["..."]},"right":{"label":"...","points":["..."]}}
- A layered model or stack (order top to bottom):
  {"type":"layer_stack","title":"...","layers":[{"label":"...","note":"..."}]}
- A process or packet/decision flow (order first to last):
  {"type":"flow","title":"...","steps":["...","..."]}

Keep it tight: 3-6 steps/points/layers, each a short phrase. Pick the type that genuinely matches the concept (e.g. command_sequence for config tasks, comparison for A-vs-B topics, layer_stack for models, flow for processes like DORA or STP states).`

function VisualBadge({ children, accent }) {
  const c = accent || COLORS.purpleGlow
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 22, height: 22, borderRadius: 6, fontSize: 11, fontWeight: 700,
      background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: c, padding: '0 6px',
    }}>{children}</span>
  )
}

// Pure, local renderer — no network, no AI. Just turns the cached spec into UI.
function VisualAidRender({ spec }) {
  if (!spec || !spec.type) return null
  const frame = { ...styles.card, border: `1px solid ${COLORS.skyBorder}`, background: COLORS.skyDim }
  const titleStyle = { fontSize: 13, fontWeight: 700, color: COLORS.sky, marginBottom: 12, letterSpacing: 0.2 }

  if (spec.type === 'command_sequence' || spec.type === 'flow') {
    const horizontal = spec.type === 'flow'
    const steps = spec.steps || []
    return (
      <div style={frame}>
        <div style={titleStyle}>{spec.title}</div>
        <div style={{ display: 'flex', flexDirection: horizontal ? 'row' : 'column', flexWrap: horizontal ? 'wrap' : 'nowrap', gap: 8, alignItems: horizontal ? 'stretch' : 'stretch' }}>
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, flex: horizontal ? '1 1 auto' : 'none',
                background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '8px 10px',
              }}>
                <VisualBadge accent={COLORS.sky}>{i + 1}</VisualBadge>
                <span style={{ fontSize: 13, color: COLORS.silver, fontFamily: horizontal ? 'inherit' : 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ alignSelf: 'center', color: COLORS.silverMid, fontSize: 14, lineHeight: 1 }}>
                  {horizontal ? '→' : '↓'}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  if (spec.type === 'comparison') {
    const col = (side, accent, dim, border) => (
      <div style={{ flex: '1 1 0', minWidth: 0, background: dim, border: `1px solid ${border}`, borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: accent, marginBottom: 8 }}>{side?.label}</div>
        {(side?.points || []).map((p, i) => (
          <div key={i} style={{ fontSize: 12, color: COLORS.silver, lineHeight: 1.45, marginBottom: 4, display: 'flex', gap: 6 }}>
            <span style={{ color: accent }}>•</span><span>{p}</span>
          </div>
        ))}
      </div>
    )
    return (
      <div style={frame}>
        <div style={titleStyle}>{spec.title}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {col(spec.left, COLORS.mint, COLORS.mintDim, COLORS.mintBorder)}
          {col(spec.right, COLORS.purpleGlow, COLORS.purpleDim, COLORS.borderGlow)}
        </div>
      </div>
    )
  }

  if (spec.type === 'layer_stack') {
    const layers = spec.layers || []
    return (
      <div style={frame}>
        <div style={titleStyle}>{spec.title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {layers.map((l, i) => (
            <div key={i} style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8,
              padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <VisualBadge accent={COLORS.purpleGlow}>{layers.length - i}</VisualBadge>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.silver }}>{l.label}</div>
                {l.note && <div style={{ fontSize: 11, color: COLORS.silverMid, lineHeight: 1.4 }}>{l.note}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

function VisualAidTab({ objective }) {
  const [spec, setSpec] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchVisual = useCallback(async (force) => {
    setLoading(true)
    setError(null)
    try {
      if (!force) {
        const cache = (await window.storage.getItem(VISUAL_CACHE_KEY)) || {}
        if (cache[objective.id]) {
          setSpec(cache[objective.id])
          setLoading(false)
          logEvent('user_viewed_visual_aid', { objectiveId: objective.id, cached: true })
          return
        }
      }
      const refNotes = BOOK_REF[objective.id] || ''
      const data = await askClaudeJSON({
        system: VISUAL_PROMPT_SYSTEM,
        messages: [{
          role: 'user',
          content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}\n\nDesign one visual aid for this objective.`,
        }],
        max_tokens: 700,
        model: MODELS.fast,
        schema: VISUAL_SCHEMA,
        toolName: 'emit_visual',
        feature: 'visual',
      })
      if (!data || !data.type) throw new Error('Claude returned an unexpected format. Please try again.')
      setSpec(data)
      const cache = (await window.storage.getItem(VISUAL_CACHE_KEY)) || {}
      cache[objective.id] = data
      await window.storage.setItem(VISUAL_CACHE_KEY, cache)
      logEvent('user_viewed_visual_aid', { objectiveId: objective.id, cached: false, type: data.type })
    } catch (err) {
      setError(err.message.includes('JSON') ? 'Claude returned an unexpected format. Please try again.' : err.message)
    } finally {
      setLoading(false)
    }
  }, [objective.id, objective.title])

  useEffect(() => {
    setSpec(null)
    setError(null)
    fetchVisual(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objective.id])

  return (
    <div>
      {loading && <Spinner label="Building visual aid..." />}
      {error && <ErrorBox message={error} onRetry={() => fetchVisual(true)} />}
      {spec && !loading && <VisualAidRender spec={spec} />}
      {!loading && (
        <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={() => fetchVisual(true)}>
          Regenerate visual
        </button>
      )}
    </div>
  )
}

// Tested-out topics still re-surface in spaced repetition: add the
// pre-assessment questions to the quiz bank with an SRS review due in ~7 days.
async function seedTestedOutReview(objectiveId, questions) {
  let bank = await loadQuizBank()
  bank = mergeIntoBank(bank, objectiveId, questions)
  const now = Date.now()
  const incoming = new Set(questions.map(q => normalizeQuestionText(q.question)))
  bank[objectiveId].forEach(q => {
    if (incoming.has(normalizeQuestionText(q.question)) && (q.attempts?.length || 0) === 0) {
      q.attempts = [{ correct: true, at: now }]
      // Tested out → seed at the 1-week interval (ladder index 1).
      q.srs = { interval: SRS_LADDER[1], reps: 2, lapses: 0, intervalIndex: 1, due: now + SRS_LADDER[1] * DAY_MS }
    }
  })
  await saveQuizBank(bank)
}

/* ---- Pre-assessment: test out of a section before studying it ---- */
function PreAssessment({ objective, onTestedOut, onStudy }) {
  const [phase, setPhase] = useState('intro') // intro | loading | active | result | error
  const [error, setError] = useState(null)
  const [questions, setQuestions] = useState([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [results, setResults] = useState([]) // { concept, correct }

  const start = useCallback(async () => {
    setPhase('loading'); setError(null)
    try {
      const cache = (await window.storage.getItem(PREASSESS_CACHE_KEY)) || {}
      let qs = cache[objective.id]
      if (!qs) {
        const refNotes = BOOK_REF[objective.id] || ''
        const data = await askClaudeJSON({
          system: PREASSESS_PROMPT_SYSTEM,
          messages: [{ role: 'user', content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}\n\nWrite the pre-assessment.` }],
          max_tokens: 1800, model: MODELS.fast, schema: PREASSESS_SCHEMA, toolName: 'emit_preassessment', feature: 'preassess',
        })
        qs = data.questions || []
        if (qs.length === 0) throw new Error('Could not build a pre-assessment.')
        cache[objective.id] = qs
        await window.storage.setItem(PREASSESS_CACHE_KEY, cache)
      }
      setQuestions(qs); setIdx(0); setSelected(null); setRevealed(false); setResults([])
      setPhase('active')
      logEvent('user_started_preassessment', { objectiveId: objective.id })
    } catch (err) {
      setError(err.message); setPhase('error')
    }
  }, [objective.id, objective.title])

  function answer(i) {
    if (revealed) return
    const q = questions[idx]
    const correct = i === q.correctIndex
    haptic(correct ? 15 : [10, 40, 10])
    setSelected(i); setRevealed(true)
    setResults(r => [...r, { concept: q.concept, correct }])
  }
  function next() {
    if (idx + 1 >= questions.length) { setPhase('result'); return }
    setIdx(i => i + 1); setSelected(null); setRevealed(false)
  }

  if (phase === 'intro') {
    return (
      <div style={{ ...styles.card, border: `1px solid ${COLORS.skyBorder}`, background: COLORS.skyDim }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.sky, marginBottom: 6 }}>📋 PRE-ASSESSMENT</div>
        <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>Already know this section? Take a quick 6-question check — score 85%+ and you can skip straight ahead.</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={styles.primaryBtn} onClick={start}>Test out</button>
          <button style={styles.secondaryBtn} onClick={onStudy}>Study it</button>
        </div>
      </div>
    )
  }
  if (phase === 'loading') return <div style={{ ...styles.card, border: `1px solid ${COLORS.skyBorder}`, background: COLORS.skyDim }}><Skeleton width="50%" height={16} /><Skeleton width="100%" /><Skeleton width="90%" /></div>
  if (phase === 'error') return <ErrorBox message={error} onRetry={start} />

  if (phase === 'result') {
    const correct = results.filter(r => r.correct).length
    const pct = correct / results.length
    const missed = [...new Set(results.filter(r => !r.correct).map(r => r.concept).filter(Boolean))]
    const tier = pct >= 0.85 ? 'ready' : pct >= 0.6 ? 'partial' : 'study'
    // Score → color: green (ready/skip) · amber (partial knowledge) · neutral
    // blue (needs study). Never red for a low score — that demotivates rather
    // than guides; red is reserved for actual errors/warnings.
    const accent = tier === 'ready' ? { c: COLORS.mint, dim: COLORS.mintDim, b: COLORS.mintBorder } : tier === 'partial' ? { c: COLORS.amber, dim: COLORS.amberDim, b: COLORS.amberBorder } : { c: COLORS.sky, dim: COLORS.skyDim, b: COLORS.skyBorder }
    return (
      <div style={{ ...styles.card, border: `1px solid ${accent.b}`, background: accent.dim }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: accent.c }}>{correct}/{results.length} · {Math.round(pct * 100)}%</div>
        <div style={{ fontSize: 14, fontWeight: 600, margin: '4px 0 8px' }}>
          {tier === 'ready' ? "You're ready — you can skip this section." : tier === 'partial' ? 'You know some of this.' : 'Recommend studying this section first.'}
        </div>
        {missed.length > 0 && (
          <div style={{ ...styles.small, marginBottom: 12 }}>Review these: {missed.map(m => <span key={m} style={{ ...styles.pill('amber'), fontSize: 11, marginRight: 4, display: 'inline-block', marginBottom: 4 }}>{m}</span>)}</div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          {tier === 'ready'
            ? <><button style={styles.primaryBtn} onClick={() => onTestedOut(questions, pct)}>Skip section</button><button style={styles.secondaryBtn} onClick={onStudy}>Review anyway</button></>
            : <button style={styles.primaryBtn} onClick={onStudy}>{tier === 'partial' ? 'Review weak areas' : 'Start lesson'}</button>}
        </div>
      </div>
    )
  }

  // active
  const q = questions[idx]
  const isCorrect = revealed && selected === q.correctIndex
  return (
    <div>
      <div style={{ ...styles.small, marginBottom: 8 }}>Pre-assessment · {idx + 1} of {questions.length}</div>
      <div style={styles.card}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, lineHeight: 1.5 }}>{q.question}</div>
        {q.choices.map((choice, i) => {
          let bg = COLORS.surface, border = COLORS.border, color = COLORS.silver
          if (revealed) {
            if (i === q.correctIndex) { bg = COLORS.mintDim; border = COLORS.mintBorder; color = COLORS.mint }
            else if (i === selected) { bg = COLORS.roseDim; border = COLORS.roseBorder; color = COLORS.rose }
          }
          return <button key={i} onClick={() => answer(i)} style={{ display: 'block', width: '100%', textAlign: 'left', minHeight: 44, marginBottom: 8, background: bg, border: `1px solid ${border}`, color, borderRadius: 10, padding: '12px 14px', fontSize: 14, cursor: revealed ? 'default' : 'pointer', lineHeight: 1.4 }}>{choice}</button>
        })}
        {revealed && <div style={{ marginTop: 8, padding: 12, borderRadius: 10, background: isCorrect ? COLORS.mintDim : COLORS.roseDim, border: `1px solid ${isCorrect ? COLORS.mintBorder : COLORS.roseBorder}`, fontSize: 13, lineHeight: 1.5 }}>{q.explanation}</div>}
      </div>
      {revealed && <button style={styles.primaryBtn} onClick={next}>{idx + 1 >= questions.length ? 'See result' : 'Next'}</button>}
    </div>
  )
}

/* ---- Structured explanation renderer (progressive disclosure) ---- */
function ExplainBlock({ icon, title, accent, children, collapsible, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  const c = accentColors(accent)
  return (
    <div style={{ borderLeft: `3px solid ${c.text}`, background: COLORS.card, borderRadius: 6, padding: '10px 12px', marginBottom: 8, boxShadow: '0 2px 10px #00000022' }}>
      <button
        onClick={() => collapsible && setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', padding: 0, cursor: collapsible ? 'pointer' : 'default', color: c.text }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>{icon} {title}</span>
        {collapsible && <span style={{ fontSize: 13, color: COLORS.silverMid }}>{open ? '−' : '+'}</span>}
      </button>
      {open && <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.55, color: COLORS.silver }}>{children}</div>}
    </div>
  )
}
// Renders `inline code` segments (CLI commands, keywords) in monospace.
function RichText({ text }) {
  if (text == null) return null
  const parts = String(text).split(/`([^`]+)`/)
  return parts.map((p, i) => i % 2 === 1
    ? <code key={i} style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 5, padding: '1px 5px', fontSize: 13, color: COLORS.sky }}>{p}</code>
    : <span key={i}>{p}</span>)
}
function Bullets({ items }) {
  return <ul style={{ margin: 0, paddingLeft: 18 }}>{(items || []).map((t, i) => <li key={i} style={{ marginBottom: 4 }}><RichText text={t} /></li>)}</ul>
}
function StructuredExplanation({ data }) {
  return (
    <div className="ccna-stagger">
      <ExplainBlock icon="🎯" title="DEFINITION" accent="sky"><RichText text={data.definition} /></ExplainBlock>
      <ExplainBlock icon="📌" title="KEY POINTS" accent="amber"><Bullets items={data.keyPoints} /></ExplainBlock>
      <ExplainBlock icon="⚠️" title="COMMON MISTAKES" accent="rose"><Bullets items={data.commonMistakes} /></ExplainBlock>
      {data.realWorld && <ExplainBlock icon="🔧" title="REAL-WORLD APPLICATION" accent="purple" collapsible defaultOpen={false}><RichText text={data.realWorld} /></ExplainBlock>}
      {data.advanced && <ExplainBlock icon="🧬" title="ADVANCED DETAILS" accent="silver" collapsible defaultOpen={false}><RichText text={data.advanced} /></ExplainBlock>}
      {data.related?.length > 0 && <ExplainBlock icon="🔗" title="RELATED CONCEPTS" accent="sky" collapsible defaultOpen={false}><Bullets items={data.related} /></ExplainBlock>}
    </div>
  )
}

/* ---- Sources panel (verifiable only) ---- */
function SourcesPanel({ objective }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ ...styles.card, padding: 12, marginTop: 4 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: COLORS.silver }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.silverMid }}>📚 SOURCES</span>
        <span style={{ fontSize: 13, color: COLORS.silverMid }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.5, color: COLORS.silverMid }}>
          <div style={{ marginBottom: 8 }}>
            <a href={EXAM_SOURCES.blueprintUrl} target="_blank" rel="noreferrer" style={{ color: COLORS.sky, textDecoration: 'none' }}>
              {EXAM_SOURCES.examName} exam topic {objective.id} — {objective.title}
            </a>
            <div>Official Cisco exam blueprint (authoritative).</div>
          </div>
          {EXAM_SOURCES.references.map((r, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <span style={{ color: COLORS.silver }}>{r.title}</span> — {r.author}, {r.publisher}.
              <div>Covers: {objective.domainName}.</div>
            </div>
          ))}
          <div style={{ marginTop: 6, fontSize: 11, color: COLORS.silverDim }}>Explanations and key terms are AI study aids grounded in these sources — verify command syntax against official docs.</div>
        </div>
      )}
    </div>
  )
}

function ExplainTab({ objective, progress, onUpdateProgress }) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [recalled, setRecalled] = useState(false) // retrieval-practice gate
  const [stage, setStage] = useState('assess') // assess | lesson — pre-assessment gates the lesson
  const testedOut = !!progress?.[objective.id]?.testedOut

  useEffect(() => {
    setRecalled(false)
    setStage(progress?.[objective.id]?.testedOut ? 'lesson' : 'assess')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objective.id])

  const adjustments = useMemo(() => ({}), [])
  const fetchExplanation = useCallback(async (force, adjust) => {
    setLoading(true)
    setError(null)
    try {
      const cacheKey = adjust ? `${objective.id}::${adjust}` : objective.id
      if (!force) {
        const cache = (await window.storage.getItem(EXPLAIN_CACHE_KEY)) || {}
        if (cache[cacheKey]) { setContent(cache[cacheKey]); setLoading(false); return }
      }
      const refNotes = BOOK_REF[objective.id] || ''
      const adjustNote = adjust ? `\n\nThe learner found a previous explanation "${adjust}". Rewrite accordingly.` : ''
      const data = await askClaudeJSON({
        system: EXPLAIN_PROMPT_SYSTEM,
        messages: [{ role: 'user', content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}${adjustNote}\n\nExplain this objective for a CCNA candidate.` }],
        max_tokens: 1100, schema: EXPLAIN_SCHEMA, toolName: 'emit_explanation', feature: 'explain',
      })
      setContent(data)
      const cache = (await window.storage.getItem(EXPLAIN_CACHE_KEY)) || {}
      cache[cacheKey] = data
      await window.storage.setItem(EXPLAIN_CACHE_KEY, cache)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [objective.id, objective.title])

  // Fetch the lesson once the learner enters the lesson stage.
  useEffect(() => {
    if (stage !== 'lesson') return
    setContent(null); setError(null)
    fetchExplanation(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, objective.id])

  async function handleTestedOut(questions, pct) {
    onUpdateProgress?.(objective.id, { testedOut: true, lastSeen: Date.now() })
    await seedTestedOutReview(objective.id, questions)
    logEvent('user_tested_out', { objectiveId: objective.id, score: pct })
    setStage('lesson') // show the material; it's marked known + scheduled for review
  }

  // Pre-assessment stage
  if (stage === 'assess' && !testedOut) {
    return (
      <div>
        <KeyTermsCarousel objective={objective} />
        <PreAssessment objective={objective} onTestedOut={handleTestedOut} onStudy={() => setStage('lesson')} />
      </div>
    )
  }

  // Lesson stage
  return (
    <div>
      {testedOut && <div style={{ ...styles.pill('mint'), fontSize: 11, marginBottom: 10, display: 'inline-block' }}>✓ Tested out — scheduled for review</div>}
      <KeyTermsCarousel objective={objective} />

      {!recalled && !error && (
        <div style={{ ...styles.card, border: `1px solid ${COLORS.purpleGlow}`, background: COLORS.purpleDim }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.purpleGlow, marginBottom: 6 }}>🧠 RECALL FIRST</div>
          <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>
            Before you read it: what do you already know about <strong>{objective.title}</strong>? Try to explain it to yourself — a rough attempt strengthens memory far more than re-reading.
          </div>
          <button style={styles.primaryBtn} onClick={() => setRecalled(true)}>Reveal explanation</button>
        </div>
      )}

      {recalled && loading && (
        <div>
          <Skeleton width="50%" height={16} style={{ marginBottom: 10 }} />
          <Skeleton width="100%" height={48} /><Skeleton width="100%" height={48} /><Skeleton width="100%" height={48} />
        </div>
      )}
      {error && <ErrorBox message={error} onRetry={() => { setRecalled(true); fetchExplanation(true) }} />}
      {recalled && content && !loading && (
        <>
          <StructuredExplanation data={content} />
          <SourcesPanel objective={objective} />
          <AdjustExplanation onAdjust={(a) => fetchExplanation(true, a)} />
        </>
      )}
    </div>
  )
}

/* ---- Adjust explanation (replaces generic regenerate) ---- */
const ADJUST_OPTIONS = [
  { value: 'too technical — simplify the language', label: 'Too technical' },
  { value: 'too broad — go deeper into details', label: 'Too broad' },
  { value: 'too abstract — add real-world examples', label: 'Too abstract' },
  { value: 'too fast-paced — break down each step', label: 'Too fast' },
  { value: 'too theoretical — add hands-on/lab scenarios', label: 'Too theoretical' },
]
function AdjustExplanation({ onAdjust }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginTop: 8 }}>
      <button style={styles.secondaryBtn} onClick={() => setOpen(o => !o)}>Adjust explanation</button>
      {open && (
        <div style={{ marginTop: 8 }}>
          <div style={{ ...styles.small, marginBottom: 6 }}>This explanation is…</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ADJUST_OPTIONS.map(o => (
              <button key={o.value} onClick={() => { setOpen(false); onAdjust(o.value) }} style={{ flex: '1 1 auto', minHeight: 40, borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.silver, fontSize: 12, fontWeight: 600, padding: '8px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>{o.label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* =========================================================================
   QUIZ TAB
   ========================================================================= */
const QUIZ_PROMPT_SYSTEM = `You are a CCNA 200-301 quiz generator. Use the provided reference notes as your primary source; where the notes don't cover a detail needed for a good question, you may draw on accurate broader CCNA 200-301 knowledge consistent with the notes. Write questions at genuine CCNA exam difficulty.

Mix the question types across the set:
- definition/recall (2): test knowing a fact or term
- scenario-based (2-3): a short situation the learner must reason about
- application (1-2): apply a concept to solve something
- true-false on a common misconception (1): give exactly two choices ["True","False"]
- troubleshooting (2-3): a realistic fault scenario where the learner diagnoses the MOST LIKELY cause

For troubleshooting questions, write them the way a network engineer actually troubleshoots: describe a concrete symptom (e.g. "Hosts on VLAN 20 can't reach their gateway"), include a short relevant config or "show" snippet inline using backticks for commands/output, then ask for the most likely cause. Use specific but VARIED surface details (interface names, IPs, VLAN IDs, subnet masks) so regenerated questions test the same underlying principle without being memorizable by pattern. The correct answer must be deducible from the snippet + reference notes; the distractors should be plausible real mistakes.

Spread difficulty from easy to hard. Tag each question with its type, difficulty (easy/medium/hard), and the short sub-concept it tests. Each question's explanation should be 1-2 sentences on why the correct answer is right. Most questions have 4 choices; true-false questions have exactly 2.`

// Small type + difficulty badges shown above a question (mixed-type quizzes).
const TYPE_LABEL = { definition: 'Definition', scenario: 'Scenario', application: 'Application', 'true-false': 'True / False', troubleshooting: 'Troubleshooting' }
function QuestionMeta({ q }) {
  if (!q || (!q.type && !q.difficulty)) return null
  // easy = green (approachable) · medium = blue (learning) · hard = amber
  // (heads-up). Red stays reserved for wrong answers, never for difficulty.
  const dAccent = q.difficulty === 'hard' ? 'amber' : q.difficulty === 'medium' ? 'sky' : 'mint'
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
      {q.difficulty && <span style={{ ...styles.pill(dAccent), fontSize: 10 }}>{q.difficulty.toUpperCase()}</span>}
      {q.type && <span style={{ ...styles.pill(q.type === 'troubleshooting' ? 'sky' : 'silver'), fontSize: 10 }}>{TYPE_LABEL[q.type] || q.type}</span>}
      {q.concept && <span style={{ fontSize: 11, color: COLORS.silverMid, alignSelf: 'center' }}>{q.concept}</span>}
    </div>
  )
}

// "Explain my mistake" — on-demand, cached, personalized to the SPECIFIC wrong
// choice the learner picked (not just the generic explanation). Cheap model,
// short output, cached per question+choice so it's never paid for twice.
const MISTAKE_CACHE_KEY = 'ccna_mistake_cache_v1'
const MISTAKE_PROMPT_SYSTEM = `You are a CCNA 200-301 tutor helping a student understand a mistake they just made on a practice question. You'll be given the question, all answer choices, the correct answer, the general explanation, and the choice the student picked instead.

In 2-3 short sentences: (1) name the likely misconception behind picking that specific wrong choice, and (2) clarify the distinction that makes the correct choice right. Be specific to THEIR choice, not generic. Stay strictly within CCNA 200-301 facts already implied by the question/explanation — do not introduce new facts.`

async function explainMistake({ question, choices, correctIndex, selectedIndex, explanation }) {
  return askClaude({
    system: MISTAKE_PROMPT_SYSTEM,
    messages: [{
      role: 'user',
      content: `Question: ${question}\nChoices: ${choices.map((c, i) => `${i === correctIndex ? '[CORRECT] ' : ''}${c}`).join(' | ')}\nGeneral explanation: ${explanation || '(none provided)'}\nStudent picked: "${choices[selectedIndex]}"\n\nWhy did the student likely pick that, and what's the key distinction?`,
    }],
    max_tokens: 220,
    model: MODELS.fast,
    feature: 'mistake',
  })
}

function ExplainMistake({ cacheKey, question, choices, correctIndex, selectedIndex, explanation }) {
  const [phase, setPhase] = useState('idle') // idle | loading | done | error
  const [text, setText] = useState(null)
  const [error, setError] = useState(null)

  if (selectedIndex == null || selectedIndex === correctIndex) return null

  async function reveal() {
    setPhase('loading')
    try {
      const cache = (await window.storage.getItem(MISTAKE_CACHE_KEY)) || {}
      if (cache[cacheKey]) { setText(cache[cacheKey]); setPhase('done'); return }
      const reply = await explainMistake({ question, choices, correctIndex, selectedIndex, explanation })
      cache[cacheKey] = reply
      await window.storage.setItem(MISTAKE_CACHE_KEY, cache)
      setText(reply)
      setPhase('done')
    } catch (err) {
      setError(err.message)
      setPhase('error')
    }
  }

  if (phase === 'idle') {
    return <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={reveal}>🤔 Why did I pick that?</button>
  }
  if (phase === 'loading') return <Spinner label="Looking at your answer..." />
  if (phase === 'error') return <ErrorBox message={error} onRetry={reveal} />
  return (
    <div style={{ marginTop: 8, padding: 12, borderRadius: 10, background: COLORS.purpleDim, border: `1px solid ${COLORS.borderGlow}` }}>
      <div style={{ fontWeight: 700, color: COLORS.purpleGlow, marginBottom: 4, fontSize: 12 }}>ABOUT YOUR ANSWER</div>
      <div style={{ fontSize: 13, lineHeight: 1.5 }}><RichText text={text} /></div>
    </div>
  )
}

const CONFIDENCE_OPTIONS = [
  { value: 'easy', label: 'Easy', accent: COLORS.mint, dim: COLORS.mintDim, border: COLORS.mintBorder },
  { value: 'medium', label: 'Medium', accent: COLORS.sky, dim: COLORS.skyDim, border: COLORS.skyBorder },
  { value: 'hard', label: 'Hard', accent: COLORS.purpleGlow, dim: COLORS.purpleDim, border: COLORS.borderGlow },
  { value: 'practice', label: 'Need practice', accent: COLORS.rose, dim: COLORS.roseDim, border: COLORS.roseBorder },
]

function QuizTab({ objective, progress, missed, onMissed, onScoreSaved }) {
  const [phase, setPhase] = useState('idle') // idle | loading | active | done | error
  const [error, setError] = useState(null)
  const [queue, setQueue] = useState([]) // remaining questions
  const [current, setCurrent] = useState(null)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [rating, setRating] = useState(null) // confidence rating for the current question
  const [stats, setStats] = useState({ correct: 0, total: 0, missedCount: 0 })
  const [sourceLabel, setSourceLabel] = useState(null) // where this session's questions came from
  const sessionRatings = useRef([])
  const [bankSize, setBankSize] = useState(0)

  // Keep the idle screen honest about how many questions are stored locally.
  const refreshBankSize = useCallback(async () => {
    const bank = await loadQuizBank()
    setBankSize((bank[objective.id] || []).length)
  }, [objective.id])

  // forceNew=true always generates a fresh set via the API and adds it to the
  // bank. Otherwise we reuse stored questions whenever the bank is big enough,
  // which means review sessions cost zero API calls.
  const startQuiz = useCallback(async (forceNew) => {
    setError(null)
    sessionRatings.current = []
    try {
      let bank = await loadQuizBank()
      let banked = bank[objective.id] || []
      let usedApi = false

      if (forceNew || banked.length < QUIZ_BANK_MIN) {
        setPhase('loading')
        const refNotes = BOOK_REF[objective.id] || ''
        // Personalize: tell the generator which sub-concepts this learner has
        // actually gotten wrong on this objective, so the new batch leans
        // toward their real weak spots instead of a generic spread.
        const weakConcepts = [...new Set(
          (missed || []).filter(m => m.objectiveId === objective.id && m.concept).map(m => m.concept)
        )].slice(-5)
        const weakNote = weakConcepts.length
          ? `\n\nThis learner has previously gotten questions wrong on these sub-concepts: ${weakConcepts.join(', ')}. Include extra questions targeting these specifically (still cover the full objective).`
          : ''
        const data = await askClaudeJSON({
          system: QUIZ_PROMPT_SYSTEM,
          messages: [{
            role: 'user',
            content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}${weakNote}\n\nGenerate 8 multiple-choice questions for this objective.`,
          }],
          max_tokens: 2200,
          model: MODELS.fast,
          schema: QUIZ_SCHEMA,
          toolName: 'emit_quiz',
          feature: 'quiz',
        })
        const fresh = data.questions || []
        if (fresh.length === 0 && banked.length === 0) throw new Error('Claude returned no questions.')
        bank = mergeIntoBank(bank, objective.id, fresh)
        await saveQuizBank(bank)
        banked = bank[objective.id]
        usedApi = true
      }

      const breakdown = masteryBreakdown(progress?.[objective.id])
      const set = pickReviewSet(banked, breakdown.has ? breakdown.acc : null)
      if (set.length === 0) throw new Error('No questions available for this objective yet.')
      setBankSize(banked.length)
      setSourceLabel(usedApi ? 'Freshly generated · added to your bank' : `From your saved bank of ${banked.length} · no API used`)
      setQueue(set.slice(1))
      setCurrent(set[0])
      setSelected(null)
      setRevealed(false)
      setRating(null)
      setStats({ correct: 0, total: 0, missedCount: 0 })
      setPhase('active')
      logEvent('user_started_quiz', { objectiveId: objective.id, source: usedApi ? 'fresh' : 'bank', size: set.length })
    } catch (err) {
      setError(err.message.includes('JSON') ? 'Claude returned an unexpected format. Please try again.' : err.message)
      setPhase('error')
    }
  }, [objective.id, objective.title, progress, missed])

  useEffect(() => {
    setPhase('idle')
    setQueue([])
    setCurrent(null)
    setSelected(null)
    setRevealed(false)
    setRating(null)
    sessionRatings.current = []
    refreshBankSize()
  }, [objective.id, refreshBankSize])

  function selectAnswer(idx) {
    if (revealed) return
    setSelected(idx)
    setRevealed(true)
    const correct = idx === current.correctIndex
    haptic(correct ? 15 : [10, 40, 10])
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1, missedCount: s.missedCount + (correct ? 0 : 1) }))
    // Only schedule reviews once the section has cleared the mastery gate.
    if (current.id) recordQuizResult(objective.id, current.id, { correct, schedule: !!progress?.[objective.id]?.reviewEligible })
    logEvent('user_answered_question', { objectiveId: objective.id, questionId: current.id, correct })
    if (!correct) {
      onMissed({
        objectiveId: objective.id,
        question: current.question,
        choices: current.choices,
        correctIndex: current.correctIndex,
        selectedIndex: idx,
        explanation: current.explanation,
        concept: current.concept,
        addedAt: Date.now(),
      })
      // spaced repetition: re-queue this question once more later in the session
      setQueue(q => [...q, current])
    }
  }

  function rate(value) {
    setRating(value)
    sessionRatings.current.push(value)
    if (current.id) recordQuizResult(objective.id, current.id, { rating: value })
    logEvent('user_rated_question_difficulty', { objectiveId: objective.id, questionId: current.id, rating: value })
  }

  function next() {
    if (queue.length === 0) {
      setPhase('done')
      onScoreSaved({ ...stats, ratings: [...sessionRatings.current] })
      return
    }
    setCurrent(queue[0])
    setQueue(q => q.slice(1))
    setSelected(null)
    setRevealed(false)
    setRating(null)
  }

  if (phase === 'idle') {
    const hasBank = bankSize >= QUIZ_BANK_MIN
    return (
      <div>
        <p style={styles.small}>
          {hasBank
            ? `${bankSize} questions saved for this objective. Review sessions reuse them — no API call. Wrong answers and "Need practice" ratings come back first.`
            : 'Generate a question bank for this objective. Questions are stored so future reviews cost nothing.'}
        </p>
        <button style={styles.primaryBtn} onClick={() => startQuiz(false)}>{hasBank ? 'Review from bank' : 'Build question bank'}</button>
        {hasBank && (
          <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={() => startQuiz(true)}>Generate new questions</button>
        )}
      </div>
    )
  }
  if (phase === 'loading') return <Spinner label="Generating quiz questions..." />
  if (phase === 'error') return <ErrorBox message={error} onRetry={() => startQuiz(false)} />
  if (phase === 'done') {
    return (
      <div style={styles.card}>
        <h2 style={styles.h2}>Quiz complete</h2>
        <p style={{ fontSize: 28, fontWeight: 700, color: COLORS.mint, margin: '4px 0' }}>{stats.correct} / {stats.total}</p>
        <p style={styles.small}>{stats.missedCount} answer{stats.missedCount === 1 ? '' : 's'} missed and saved for review.</p>
        <button style={{ ...styles.primaryBtn, marginTop: 10 }} onClick={() => startQuiz(false)}>Review again from bank</button>
        <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={() => startQuiz(true)}>Generate new questions</button>
      </div>
    )
  }

  // active
  const isCorrect = revealed && selected === current.correctIndex
  return (
    <div>
      <div style={{ ...styles.small, marginBottom: 4 }}>Question {stats.total + 1}{queue.length > 0 ? ` · ${queue.length} remaining` : ''}</div>
      {sourceLabel && <div style={{ fontSize: 11, color: COLORS.silverMid, marginBottom: 8 }}>{sourceLabel}</div>}
      <div style={styles.card}>
        <QuestionMeta q={current} />
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, lineHeight: 1.5 }}><RichText text={current.question} /></div>
        {current.choices.map((choice, idx) => {
          let bg = COLORS.surface, border = COLORS.border, color = COLORS.silver
          if (revealed) {
            if (idx === current.correctIndex) { bg = COLORS.mintDim; border = COLORS.mintBorder; color = COLORS.mint }
            else if (idx === selected) { bg = COLORS.roseDim; border = COLORS.roseBorder; color = COLORS.rose }
          }
          return (
            <button
              key={idx}
              onClick={() => selectAnswer(idx)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', minHeight: 44, marginBottom: 8,
                background: bg, border: `1px solid ${border}`, color, borderRadius: 10,
                padding: '12px 14px', fontSize: 14, cursor: revealed ? 'default' : 'pointer', lineHeight: 1.4,
              }}
            >
              {choice}
            </button>
          )
        })}
        {revealed && (
          <div style={{ marginTop: 8, padding: 12, borderRadius: 10, background: isCorrect ? COLORS.mintDim : COLORS.roseDim, border: `1px solid ${isCorrect ? COLORS.mintBorder : COLORS.roseBorder}` }}>
            <div style={{ fontWeight: 700, color: isCorrect ? COLORS.mint : COLORS.rose, marginBottom: 4, fontSize: 13 }}>
              {isCorrect ? 'Correct' : 'Incorrect'}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>{current.explanation}</div>
            {!isCorrect && (
              <ExplainMistake
                cacheKey={`${current.id || normalizeQuestionText(current.question)}::${selected}`}
                question={current.question} choices={current.choices}
                correctIndex={current.correctIndex} selectedIndex={selected}
                explanation={current.explanation}
              />
            )}
          </div>
        )}
      </div>
      {revealed && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ ...styles.small, marginBottom: 6 }}>How confident did you feel?</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CONFIDENCE_OPTIONS.map(opt => {
              const active = rating === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => rate(opt.value)}
                  style={{
                    flex: '1 1 auto', minHeight: 40, borderRadius: 10, cursor: 'pointer',
                    background: active ? opt.dim : COLORS.surface,
                    border: `1px solid ${active ? opt.border : COLORS.border}`,
                    color: active ? opt.accent : COLORS.silverMid,
                    fontSize: 12, fontWeight: 600, padding: '8px 6px', fontFamily: 'inherit',
                  }}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
      {revealed && <button style={styles.primaryBtn} onClick={next}>{queue.length === 0 ? 'Finish' : 'Next question'}</button>}
    </div>
  )
}

/* =========================================================================
   CLI DRILL TAB
   ========================================================================= */
function normalizeCmd(s) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

/* =========================================================================
   CISCO IOS SIMULATOR ENGINE  (Phase 5)
   Deterministic, local, mode-aware command validation — NO AI in the path.
   Reuses COMMAND_DRILLS as lab objectives. Tracks modes, gives wrong-mode and
   syntax feedback, renders show-command output from static knowledge, and
   records CLI skill metrics for the metrics dashboard.
   ========================================================================= */

// Prompt suffix per CLI mode.
const CLI_MODE_PROMPT = {
  user: '>',
  priv: '#',
  config: '(config)#',
  'config-if': '(config-if)#',
  'config-vlan': '(config-vlan)#',
  'config-line': '(config-line)#',
  'config-router': '(config-router)#',
  'config-dhcp': '(dhcp-config)#',
  'config-acl': '(config-ext-nacl)#',
}
// Human label for guidance when the learner is in the wrong mode.
const CLI_MODE_HINT = {
  priv: "privileged EXEC mode — type 'enable'",
  config: "global config — type 'configure terminal'",
  'config-if': "interface config — e.g. 'interface gi0/1'",
  'config-vlan': "VLAN config — e.g. 'vlan 20'",
  'config-line': "line config — e.g. 'line vty 0 4'",
  'config-router': "router config — e.g. 'router ospf 1'",
  'config-dhcp': "DHCP pool config — e.g. 'ip dhcp pool LAN'",
  'config-acl': "named ACL config — e.g. 'ip access-list extended NAME'",
}

// Static show-command output, rendered deterministically (no API).
const CLI_SHOW_OUTPUT = {
  'show etherchannel summary': `Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
Number of channel-groups in use: 1
Number of aggregators:           1

Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------
1      Po1(SU)         LACP      Gi0/1(P)   Gi0/2(P)`,
  'show ip ospf neighbor': `Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           1   FULL/DR         00:00:38    10.0.0.2        GigabitEthernet0/0`,
  'show vlan brief': `VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/2, Gi0/3
20   SALES                            active    Fa0/5`,
  'show ip interface brief': `Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/1     192.168.10.1    YES manual up                    up`,
}

// Recognized mode-navigation commands. Returns the new mode (or null if this
// input is not a navigation command), plus the modes it is allowed from.
function cliNavTarget(norm) {
  if (/^(enable|en)$/.test(norm)) return { to: 'priv', from: ['user', 'priv'] }
  if (/^disable$/.test(norm)) return { to: 'user', from: ['priv'] }
  if (/^(configure terminal|conf t|config t|configure t|conf terminal)$/.test(norm)) return { to: 'config', from: ['priv'] }
  if (/^(interface|int) /.test(norm)) return { to: 'config-if', from: ['config', 'config-if'] }
  if (/^vlan \d+$/.test(norm)) return { to: 'config-vlan', from: ['config', 'config-vlan'] }
  if (/^line /.test(norm)) return { to: 'config-line', from: ['config', 'config-line'] }
  if (/^router \w+/.test(norm)) return { to: 'config-router', from: ['config', 'config-router'] }
  if (/^ip dhcp pool /.test(norm)) return { to: 'config-dhcp', from: ['config', 'config-dhcp'] }
  if (/^ip access-list /.test(norm)) return { to: 'config-acl', from: ['config', 'config-acl'] }
  return null
}
// exit pops one level; end/Ctrl-Z jumps to priv from any config mode.
function cliExitTarget(norm, mode) {
  if (/^(end)$/.test(norm)) return mode.startsWith('config') ? 'priv' : mode
  if (/^(exit)$/.test(norm)) {
    if (mode === 'config') return 'priv'
    if (mode === 'priv') return 'user'
    if (mode.startsWith('config-')) return 'config'
    return mode
  }
  return null
}

// Infers which mode a given objective command must be issued from. Used to give
// wrong-mode feedback. Mode-changing objectives (interface/vlan/router/...) are
// issued from global config.
function cliRequiredMode(norm) {
  if (/^show /.test(norm)) return 'priv'
  if (cliNavTarget(norm)) {
    if (/^(enable|en|disable)$/.test(norm)) return 'user'
    if (/^(configure terminal|conf t|config t|configure t|conf terminal)$/.test(norm)) return 'priv'
    return 'config' // interface/vlan/line/router/dhcp/acl are entered from global config
  }
  if (/^name /.test(norm)) return 'config-vlan'
  if (/ area /.test(norm) || /^router-id /.test(norm)) return 'config-router'
  if (/^default-router /.test(norm) || (/^network /.test(norm) && !/ area /.test(norm))) return 'config-dhcp'
  if (/^(transport input |login local$|login$)/.test(norm)) return 'config-line'
  if (/^(deny |permit )/.test(norm)) return 'config-acl'
  if (/^(ip address |no shut|ipv6 address |ipv6 enable|switchport|channel-group |standby |no cdp enable|ip helper-address |ip access-group )/.test(norm)) return 'config-if'
  return 'config' // global-config commands (ip route, cdp run, enable secret, etc.)
}

/* ---- CLI skill metrics (local, feeds the future dashboard) ---- */
async function loadCliStats() {
  return (await window.storage.getItem(STORAGE_KEYS.cliStats)) || {}
}
async function recordCliLabResult(objectiveId, patch) {
  const all = await loadCliStats()
  const prev = all[objectiveId] || { runs: 0, bestScore: 0, lastScore: 0, commandsEntered: 0, syntaxErrors: 0, wrongModeErrors: 0, hintsUsed: 0, completedObjectives: 0, totalObjectives: 0 }
  const merged = {
    ...prev,
    runs: prev.runs + (patch.completed ? 1 : 0),
    bestScore: Math.max(prev.bestScore, patch.score ?? 0),
    lastScore: patch.score ?? prev.lastScore,
    commandsEntered: prev.commandsEntered + (patch.commandsEntered || 0),
    syntaxErrors: prev.syntaxErrors + (patch.syntaxErrors || 0),
    wrongModeErrors: prev.wrongModeErrors + (patch.wrongModeErrors || 0),
    hintsUsed: prev.hintsUsed + (patch.hintsUsed || 0),
    completedObjectives: Math.max(prev.completedObjectives, patch.completedObjectives || 0),
    totalObjectives: patch.totalObjectives || prev.totalObjectives,
    updatedAt: Date.now(),
  }
  all[objectiveId] = merged
  await window.storage.setItem(STORAGE_KEYS.cliStats, all)
}

// Picks a realistic device hostname for the lab.
function cliHostname(objectiveId) {
  const switchObjs = ['2.1', '2.2', '2.3', '2.4', '5.6']
  return switchObjs.includes(objectiveId) ? 'Switch' : 'Router'
}

// Interactive, mode-aware Cisco IOS simulator. The objectives come from
// COMMAND_DRILLS; the learner types real commands into a persistent terminal
// and the engine validates them deterministically (no AI). Free-form: any
// remaining objective whose command + mode match is completed.
function CLIDrillTab({ objective }) {
  const drills = COMMAND_DRILLS[objective.id] || []
  const host = cliHostname(objective.id)

  const [mode, setMode] = useState('user')
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([]) // { text, kind }
  const [statuses, setStatuses] = useState(() => drills.map(() => false))
  const [hintIdx, setHintIdx] = useState(null)
  const [done, setDone] = useState(false)
  const counters = useRef({ commandsEntered: 0, syntaxErrors: 0, wrongModeErrors: 0, hintsUsed: 0 })
  const scrollRef = useRef(null)

  const reset = useCallback(() => {
    setMode('user'); setInput(''); setHistory([]); setStatuses(drills.map(() => false))
    setHintIdx(null); setDone(false)
    counters.current = { commandsEntered: 0, syntaxErrors: 0, wrongModeErrors: 0, hintsUsed: 0 }
  }, [drills])

  useEffect(() => { reset() }, [objective.id, reset])
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [history])

  if (drills.length === 0) {
    return <p style={styles.small}>No CLI lab is defined for this objective.</p>
  }

  const push = (lines, kind) => {
    const arr = Array.isArray(lines) ? lines : [lines]
    setHistory(h => [...h, ...arr.map(text => ({ text, kind }))])
  }

  function findObjective(norm) {
    for (let i = 0; i < drills.length; i++) {
      if (statuses[i]) continue
      if (drills[i].answer.map(normalizeCmd).includes(norm)) return i
    }
    return -1
  }

  function completeObjective(i, nextStatuses) {
    nextStatuses[i] = true
    push(`% Objective complete: ${drills[i].prompt}`, 'ok')
    logEvent('user_entered_cli_command', { objectiveId: objective.id, ok: true })
    const allDone = nextStatuses.every(Boolean)
    if (allDone) {
      const completedCount = nextStatuses.filter(Boolean).length
      const score = Math.round((completedCount / drills.length) * 100)
      push(`% Lab complete — ${completedCount}/${drills.length} objectives. Score: ${score}%`, 'ok')
      setDone(true)
      recordCliLabResult(objective.id, {
        completed: true, score,
        completedObjectives: completedCount, totalObjectives: drills.length,
        ...counters.current,
      })
      logEvent('user_completed_cli_lab', { objectiveId: objective.id, score })
    }
  }

  function submit() {
    const raw = input.trim()
    if (!raw) return
    const norm = normalizeCmd(raw)
    push(`${host}${CLI_MODE_PROMPT[mode]} ${raw}`, 'cmd')
    setInput('')
    counters.current.commandsEntered += 1

    // 0. local help
    if (norm === 'hint') {
      const nextIdx = statuses.findIndex(s => !s)
      if (nextIdx >= 0) { setHintIdx(nextIdx); counters.current.hintsUsed += 1; push(`Hint: ${drills[nextIdx].hint}`, 'out') }
      return
    }
    if (norm === '?') { push('Type IOS commands. Navigate modes with enable, configure terminal, interface, exit, end.', 'out'); return }

    // 1. exit / end navigation (never an objective)
    const exitTo = cliExitTarget(norm, mode)
    if (exitTo !== null && (norm === 'exit' || norm === 'end')) { setMode(exitTo); return }

    // 2. does this command satisfy a remaining objective?
    const matchIdx = findObjective(norm)
    const nav = cliNavTarget(norm)
    if (matchIdx >= 0) {
      const req = cliRequiredMode(norm)
      const modeOk = nav ? nav.from.includes(mode) : mode === req
      if (modeOk) {
        const next = [...statuses]
        if (nav) setMode(nav.to) // mode-changing objective (interface/vlan/router/…)
        completeObjective(matchIdx, next)
        setStatuses(next)
      } else {
        counters.current.wrongModeErrors += 1
        push(`% Wrong mode. That command belongs in ${CLI_MODE_HINT[req] || req}.`, 'warn')
        logEvent('user_entered_cli_command', { objectiveId: objective.id, ok: false, reason: 'mode' })
      }
      return
    }

    // 3. navigation command that isn't itself an objective (enable, conf t, interface fa0/5, exit…)
    if (nav) {
      if (nav.from.includes(mode)) setMode(nav.to)
      else { counters.current.wrongModeErrors += 1; push(`% "${raw}" is not available from ${CLI_MODE_PROMPT[mode]}. ${CLI_MODE_HINT[nav.from[0]] || ''}`, 'warn') }
      return
    }

    // 4. exploratory show command
    if (/^show /.test(norm)) {
      if (mode !== 'priv' && mode !== 'config' && !mode.startsWith('config')) {
        counters.current.wrongModeErrors += 1
        push("% show commands run from privileged EXEC — type 'enable' first.", 'warn')
      } else if (CLI_SHOW_OUTPUT[norm]) {
        push(CLI_SHOW_OUTPUT[norm].split('\n'), 'out')
      } else {
        push('% Output not simulated for this show command in this lab.', 'info')
      }
      return
    }

    // 5. unrecognized / incomplete
    counters.current.syntaxErrors += 1
    const firstWord = norm.split(' ')[0]
    const near = drills.find((d, i) => !statuses[i] && normalizeCmd(d.answer[0]).split(' ')[0] === firstWord)
    if (near) push(`% Incomplete or incorrect syntax. Expected pattern: ${near.answer[0]}`, 'warn')
    else push('% Invalid input detected. Type "hint" for the next objective, or "?" for help.', 'warn')
    logEvent('user_entered_cli_command', { objectiveId: objective.id, ok: false, reason: 'syntax' })
  }

  const completed = statuses.filter(Boolean).length
  // The terminal pane is intentionally always-dark (emulates a real console),
  // so its text uses fixed light colors rather than theme tokens (which would
  // go dark — and invisible — in light mode).
  const lineColor = { cmd: '#d9d9d9', ok: '#d4f7d4', warn: '#e0a0a0', out: '#baf0fa', info: '#8a8fa8' }

  return (
    <div>
      <p style={{ ...styles.small, marginBottom: 10 }}>
        Interactive IOS lab. Type real commands — navigate with <code style={{ fontFamily: 'ui-monospace, monospace' }}>enable</code>, <code style={{ fontFamily: 'ui-monospace, monospace' }}>configure terminal</code>, <code style={{ fontFamily: 'ui-monospace, monospace' }}>interface …</code>, <code style={{ fontFamily: 'ui-monospace, monospace' }}>exit</code>. Type <code style={{ fontFamily: 'ui-monospace, monospace' }}>hint</code> anytime.
      </p>

      {/* Objective checklist */}
      <div style={{ ...styles.card, padding: 12 }}>
        <div style={{ ...styles.small, fontWeight: 700, marginBottom: 8 }}>Lab objectives · {completed}/{drills.length}</div>
        {drills.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '4px 0', borderBottom: i < drills.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
            <span style={{ color: statuses[i] ? COLORS.mint : COLORS.silverDim, fontSize: 13, marginTop: 1 }}>{statuses[i] ? '✓' : '○'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: statuses[i] ? COLORS.silverMid : COLORS.silver, lineHeight: 1.4, textDecoration: statuses[i] ? 'line-through' : 'none' }}>{d.prompt}</div>
              {hintIdx === i && <div style={{ fontSize: 12, color: COLORS.sky, marginTop: 2 }}>Hint: {d.hint}</div>}
            </div>
            {!statuses[i] && (
              <button
                onClick={() => { setHintIdx(i); counters.current.hintsUsed += 1 }}
                style={{ background: 'none', border: 'none', color: COLORS.silverMid, fontSize: 11, cursor: 'pointer', padding: '2px 4px', minHeight: 28 }}
              >Hint</button>
            )}
          </div>
        ))}
      </div>

      {/* Terminal */}
      <div
        ref={scrollRef}
        style={{
          background: '#05060a', border: `1px solid ${COLORS.border}`, borderRadius: 10,
          padding: 12, height: 240, overflowY: 'auto', marginBottom: 8,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12.5, lineHeight: 1.55,
        }}
      >
        {history.length === 0 && (
          <div style={{ color: '#6b7088' }}>{host} terminal ready. Type a command and press Enter.</div>
        )}
        {history.map((l, i) => (
          <div key={i} style={{ color: lineColor[l.kind] || '#d9d9d9', whiteSpace: 'pre-wrap' }}>{l.text}</div>
        ))}
      </div>

      {!done ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5, color: COLORS.silverMid, whiteSpace: 'nowrap' }}>{host}{CLI_MODE_PROMPT[mode]}</span>
          <input
            style={{ ...styles.input, flex: 1, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submit() }}
            placeholder="command…"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
      ) : (
        <button style={styles.primaryBtn} onClick={reset}>Restart lab</button>
      )}
    </div>
  )
}

/* =========================================================================
   SUBNETTING TAB
   ========================================================================= */
function SubnetField({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 12, color: COLORS.silverMid, marginBottom: 4 }}>{label}</div>
      <input style={{ ...styles.input, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
        value={value} onChange={onChange} placeholder={placeholder}
        autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="decimal" />
    </div>
  )
}

function SubnettingTab() {
  const [problem, setProblem] = useState(() => generateSubnetProblem())
  const [answers, setAnswers] = useState({ network: '', broadcast: '', firstUsable: '', lastUsable: '', usableHosts: '' })
  const [checked, setChecked] = useState(false)

  function newProblem() {
    setProblem(generateSubnetProblem())
    setAnswers({ network: '', broadcast: '', firstUsable: '', lastUsable: '', usableHosts: '' })
    setChecked(false)
  }

  function field(key) {
    return { value: answers[key], onChange: e => setAnswers(a => ({ ...a, [key]: e.target.value })) }
  }

  function isCorrect(key, expected) {
    if (!checked) return null
    const got = (answers[key] || '').trim()
    return got === String(expected ?? '')
  }

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.small}>Given:</div>
        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', marginTop: 4, marginBottom: 12 }}>
          {problem.ip} /{problem.cidr}
        </div>
        <SubnetField label="Network address" placeholder="x.x.x.x" {...field('network')} />
        <SubnetField label="Broadcast address" placeholder="x.x.x.x" {...field('broadcast')} />
        <SubnetField label="First usable host" placeholder="x.x.x.x or n/a" {...field('firstUsable')} />
        <SubnetField label="Last usable host" placeholder="x.x.x.x or n/a" {...field('lastUsable')} />
        <SubnetField label="Number of usable hosts" placeholder="0" {...field('usableHosts')} />

        {checked && (
          <div style={{ marginTop: 4, marginBottom: 4 }}>
            {[
              ['network', problem.network],
              ['broadcast', problem.broadcast],
              ['firstUsable', problem.firstUsable ?? 'n/a'],
              ['lastUsable', problem.lastUsable ?? 'n/a'],
              ['usableHosts', problem.usableHosts],
            ].map(([key, expected]) => {
              const ok = isCorrect(key, expected)
              return (
                <div key={key} style={{ fontSize: 13, color: ok ? COLORS.mint : COLORS.rose, marginBottom: 2 }}>
                  {ok ? '✓' : '✗'} {key}: expected {String(expected)}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {checked && (
        <div style={{ ...styles.card, background: COLORS.skyDim, border: `1px solid ${COLORS.skyBorder}` }}>
          <div style={styles.h2}>Step-by-step solution</div>
          <ol style={{ paddingLeft: 18, margin: 0, fontSize: 13, lineHeight: 1.7 }}>
            {problem.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {!checked && <button style={styles.primaryBtn} onClick={() => setChecked(true)}>Check answers</button>}
        <button style={checked ? styles.primaryBtn : styles.secondaryBtn} onClick={newProblem}>New problem</button>
      </div>
    </div>
  )
}
/* =========================================================================
   VLSM PRACTICE TAB
   ========================================================================= */
function VLSMTab() {
  const [problem, setProblem] = useState(() => generateVLSMProblem())
  const [answers, setAnswers] = useState({})
  const [checked, setChecked] = useState(false)

  function newProblem() {
    setProblem(generateVLSMProblem())
    setAnswers({})
    setChecked(false)
  }

  function setField(name, key, value) {
    setAnswers(a => ({ ...a, [`${name}_${key}`]: value }))
  }

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.small}>Base network: <strong style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', color: COLORS.silver }}>{problem.baseNetwork}</strong></div>
        <div style={{ ...styles.small, marginTop: 8, marginBottom: 4 }}>Allocate subnets in order, largest requirement first:</div>
        <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, lineHeight: 1.7 }}>
          {problem.requirements.map(r => (
            <li key={r.name}>{r.name}: {r.hostsNeeded} hosts needed</li>
          ))}
        </ul>
      </div>

      {problem.allocations.map((a, idx) => (
        <div key={a.name} style={styles.card}>
          <div style={{ ...styles.h2, fontSize: 15 }}>{idx + 1}. {a.name} ({a.hostsNeeded} hosts needed)</div>
          <SubnetField label="Network address" placeholder="x.x.x.x" value={answers[`${a.name}_network`] || ''} onChange={e => setField(a.name, 'network', e.target.value)} />
          <SubnetField label="CIDR (/n)" placeholder="/n" value={answers[`${a.name}_cidr`] || ''} onChange={e => setField(a.name, 'cidr', e.target.value)} />
          <SubnetField label="Broadcast address" placeholder="x.x.x.x" value={answers[`${a.name}_broadcast`] || ''} onChange={e => setField(a.name, 'broadcast', e.target.value)} />
          {checked && (
            <div style={{ marginTop: 4 }}>
              {[
                ['network', a.network], ['cidr', `/${a.cidr}`], ['broadcast', a.broadcast],
              ].map(([key, expected]) => {
                const got = (answers[`${a.name}_${key}`] || '').trim()
                const ok = got === String(expected)
                return (
                  <div key={key} style={{ fontSize: 13, color: ok ? COLORS.mint : COLORS.rose, marginBottom: 2 }}>
                    {ok ? '✓' : '✗'} {key}: expected {expected}
                  </div>
                )
              })}
              <div style={{ fontSize: 12, color: COLORS.silverMid, marginTop: 4 }}>
                Usable range: {a.firstUsable} - {a.lastUsable} ({a.usableHosts} usable hosts, block size {a.blockSize})
              </div>
            </div>
          )}
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8 }}>
        {!checked && <button style={styles.primaryBtn} onClick={() => setChecked(true)}>Check answers</button>}
        <button style={checked ? styles.primaryBtn : styles.secondaryBtn} onClick={newProblem}>New problem</button>
      </div>
    </div>
  )
}


/* =========================================================================
   OBJECTIVE SCREEN — Explain / Quiz / CLI Drill / Subnetting / VLSM tabs
   ========================================================================= */
function ObjectiveScreen({ objective, progress, apiOnline, offlineReady, packagingId, onPackage, onBack, onUpdateProgress, onMissed, missed }) {
  const tabs = useMemo(() => {
    const t = ['Explain', 'Visual', 'Quiz']
    if (COMMAND_DRILLS[objective.id]) t.push('CLI Drill')
    if (objective.id === '1.6') { t.push('Subnetting'); t.push('VLSM') }
    return t
  }, [objective.id])

  // Honor a deep-link tab hint (e.g. a "For You" card opening the CLI Drill tab).
  const initialTab = (objective.__initialTab && tabs.includes(objective.__initialTab)) ? objective.__initialTab : tabs[0]
  const [tab, setTab] = useState(initialTab)
  useEffect(() => { setTab(initialTab) }, [objective.id, tabs, initialTab])

  const status = progress[objective.id]?.status || 'unseen'
  const isOffline = offlineReady?.has(objective.id)
  const isPackaging = packagingId === objective.id

  function handleScoreSaved(stats) {
    const entry = progress[objective.id] || {}
    const newScores = [...(entry.quizScores || []), { score: stats.correct, total: stats.total, date: Date.now() }]
    const newRatings = [...(entry.confidenceRatings || []), ...(stats.ratings || [])].slice(-30)
    const { score: masteryScore, mastered } = computeMastery({ quizScores: newScores, confidenceRatings: newRatings })
    onUpdateProgress(objective.id, {
      status: mastered ? 'mastered' : 'in_progress',
      quizScores: newScores,
      confidenceRatings: newRatings,
      masteryScore,
      lastSeen: Date.now(),
    })
    logEvent('user_completed_quiz', { objectiveId: objective.id, correct: stats.correct, total: stats.total, masteryScore })
    // Mastery gate: once this session clears MASTERY_GATE, open the section for
    // spaced review and seed its answered questions into the queue (one-time).
    const sessionAcc = stats.total ? stats.correct / stats.total : 0
    if (sessionAcc >= MASTERY_GATE && !entry.reviewEligible) {
      enableSectionReview(objective.id)
      onUpdateProgress(objective.id, { reviewEligible: true })
    }
    // Celebrate a freshly-mastered topic (only on the transition, not repeats).
    if (mastered && status !== 'mastered') { celebrate(); haptic([12, 40, 12, 40, 18]) }
    // On reaching mastery, auto-package the topic for offline use (online only).
    if (mastered && !isOffline && apiOnline) onPackage?.(objective)
  }

  // Mark "in progress" the first time an objective is opened
  useEffect(() => {
    if (status === 'unseen') {
      onUpdateProgress(objective.id, { status: 'in_progress', lastSeen: Date.now() })
    } else {
      onUpdateProgress(objective.id, { lastSeen: Date.now() })
    }
    logEvent('user_viewed_topic', { objectiveId: objective.id })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objective.id])

  return (
    <div>
      <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <div style={{ marginBottom: 6 }}>
        <span style={styles.pill(objective.accent)}>{objective.id}</span>
        <span style={{ marginLeft: 8 }}><StatusLabel status={status} /></span>
      </div>
      <h1 style={styles.h1}>{objective.title}</h1>
      <div style={{ ...styles.small, marginBottom: 10 }}>{objective.domainName}</div>

      <div style={{ marginBottom: 14 }}>
        {isOffline ? (
          <span style={{ ...styles.pill('mint'), fontSize: 11 }}>⤓ Available offline</span>
        ) : isPackaging ? (
          <span style={{ ...styles.pill('sky'), fontSize: 11 }}>Downloading for offline…</span>
        ) : (
          <button
            onClick={() => onPackage?.(objective)}
            disabled={!apiOnline}
            style={{
              background: 'none', border: `1px solid ${COLORS.border}`, borderRadius: 999,
              color: apiOnline ? COLORS.silverMid : COLORS.silverDim, fontSize: 11, fontWeight: 600,
              padding: '4px 12px', minHeight: 32, cursor: apiOnline ? 'pointer' : 'default', fontFamily: 'inherit',
            }}
          >
            {apiOnline ? '⤓ Make available offline' : 'Offline — connect to download'}
          </button>
        )}
      </div>

      {(progress[objective.id]?.quizScores || []).length > 0 && (
        <ProgressBar
          value={computeMastery(progress[objective.id]).score}
          max={1}
          accent={objective.accent}
          label="Topic mastery"
          sublabel={`${Math.round(computeMastery(progress[objective.id]).score * 100)}%`}
          height={7}
        />
      )}

      <div style={styles.tabBar}>
        {tabs.map(t => (
          <button key={t} style={styles.tabBtn(tab === t)} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'Explain' && <ExplainTab objective={objective} progress={progress} onUpdateProgress={onUpdateProgress} />}
      {tab === 'Visual' && <VisualAidTab objective={objective} />}
      {tab === 'Quiz' && <QuizTab objective={objective} progress={progress} missed={missed} onMissed={onMissed} onScoreSaved={handleScoreSaved} />}
      {tab === 'CLI Drill' && <CLIDrillTab objective={objective} />}
      {tab === 'Subnetting' && <SubnettingTab />}
      {tab === 'VLSM' && <VLSMTab />}
    </div>
  )
}

/* =========================================================================
   OFFLINE PACKAGING
   Every AI asset (explanation, key terms, visual aid, quiz bank) is cached in
   window.storage. A topic is "offline-ready" once all four exist locally, after
   which it works with no network. Packaging pre-generates only what's missing
   (online required); re-viewing packaged content later costs zero API calls.
   ========================================================================= */
async function ensureExplanationCached(objective) {
  const cache = (await window.storage.getItem(EXPLAIN_CACHE_KEY)) || {}
  if (cache[objective.id]) return
  const refNotes = BOOK_REF[objective.id] || ''
  const data = await askClaudeJSON({
    system: EXPLAIN_PROMPT_SYSTEM,
    messages: [{ role: 'user', content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}\n\nExplain this objective for a CCNA candidate.` }],
    max_tokens: 1100, schema: EXPLAIN_SCHEMA, toolName: 'emit_explanation', feature: 'explain',
  })
  cache[objective.id] = data
  await window.storage.setItem(EXPLAIN_CACHE_KEY, cache)
}
async function ensureTermsCached(objective) {
  const cache = (await window.storage.getItem(TERMS_CACHE_KEY)) || {}
  if (cache[objective.id]) return
  const refNotes = BOOK_REF[objective.id] || ''
  const data = await askClaudeJSON({
    system: TERMS_PROMPT_SYSTEM,
    messages: [{ role: 'user', content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}\n\nGenerate key-term flashcards for this objective.` }],
    max_tokens: 700, model: MODELS.fast, schema: TERMS_SCHEMA, toolName: 'emit_terms', feature: 'terms',
  })
  if ((data.cards || []).length === 0) throw new Error('Could not generate key terms.')
  cache[objective.id] = data.cards
  await window.storage.setItem(TERMS_CACHE_KEY, cache)
}
async function ensureVisualCached(objective) {
  const cache = (await window.storage.getItem(VISUAL_CACHE_KEY)) || {}
  if (cache[objective.id]) return
  const refNotes = BOOK_REF[objective.id] || ''
  const data = await askClaudeJSON({
    system: VISUAL_PROMPT_SYSTEM,
    messages: [{ role: 'user', content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}\n\nDesign one visual aid for this objective.` }],
    max_tokens: 700, model: MODELS.fast, schema: VISUAL_SCHEMA, toolName: 'emit_visual', feature: 'visual',
  })
  if (!data || !data.type) throw new Error('Could not generate a visual aid.')
  cache[objective.id] = data
  await window.storage.setItem(VISUAL_CACHE_KEY, cache)
}
async function ensureQuizBankFilled(objective) {
  let bank = await loadQuizBank()
  if ((bank[objective.id] || []).length >= QUIZ_BANK_MIN) return
  const refNotes = BOOK_REF[objective.id] || ''
  const data = await askClaudeJSON({
    system: QUIZ_PROMPT_SYSTEM,
    messages: [{ role: 'user', content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}\n\nGenerate 8 multiple-choice questions for this objective.` }],
    max_tokens: 2200, model: MODELS.fast, schema: QUIZ_SCHEMA, toolName: 'emit_quiz', feature: 'quiz',
  })
  bank = mergeIntoBank(bank, objective.id, data.questions || [])
  await saveQuizBank(bank)
}
// Generates whatever is missing so the topic is fully usable offline.
async function packageObjectiveOffline(objective) {
  await ensureExplanationCached(objective)
  await ensureTermsCached(objective)
  await ensureVisualCached(objective)
  await ensureQuizBankFilled(objective)
  logEvent('user_packaged_offline', { objectiveId: objective.id })
}
// Returns the Set of objective ids whose four assets are all cached locally.
async function loadOfflineReadyIds() {
  const [ex, tm, vs, bank] = await Promise.all([
    window.storage.getItem(EXPLAIN_CACHE_KEY),
    window.storage.getItem(TERMS_CACHE_KEY),
    window.storage.getItem(VISUAL_CACHE_KEY),
    loadQuizBank(),
  ])
  const ids = ALL_OBJECTIVES.filter(o =>
    ex && ex[o.id] && tm && tm[o.id] && vs && vs[o.id] && (bank[o.id] || []).length >= QUIZ_BANK_MIN
  ).map(o => o.id)
  return new Set(ids)
}
// Per-objective offline asset checklist (for the unlock progress bars).
async function loadOfflineDetail() {
  const [ex, tm, vs, bank] = await Promise.all([
    window.storage.getItem(EXPLAIN_CACHE_KEY),
    window.storage.getItem(TERMS_CACHE_KEY),
    window.storage.getItem(VISUAL_CACHE_KEY),
    loadQuizBank(),
  ])
  const map = {}
  ALL_OBJECTIVES.forEach(o => {
    const reqs = [
      { label: 'Explanation', done: !!(ex && ex[o.id]) },
      { label: 'Key terms', done: !!(tm && tm[o.id]) },
      { label: 'Visual aid', done: !!(vs && vs[o.id]) },
      { label: 'Quiz bank', done: (bank[o.id] || []).length >= QUIZ_BANK_MIN },
    ]
    const count = reqs.filter(r => r.done).length
    map[o.id] = { reqs, count, ready: count === 4 }
  })
  return map
}

/* =========================================================================
   LEARNER METRICS DASHBOARD  (Phase 6)
   A separate command center. Every number and bar is computed locally from
   stored data (progress, events, quiz bank, CLI stats, offline caches).
   No API calls — works offline.
   ========================================================================= */
function quadrantOf(acc, conf) {
  if (acc >= 0.7 && conf >= 0.6) return 'strong'
  if (acc >= 0.7 && conf < 0.6) return 'reassure'
  if (acc < 0.7 && conf >= 0.6) return 'hidden'
  return 'priority'
}

function MetricsDashboard({ progress, missed, onBack, onSelectObjective }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [summary, cli, offlineDetail, usage, retention] = await Promise.all([
        buildLearnerSummary(progress, missed || []),
        loadCliStats(),
        loadOfflineDetail(),
        window.storage.getItem(STORAGE_KEYS.usage),
        loadRetentionHealth(),
      ])
      if (!cancelled) setData({ summary, cli, offlineDetail, usage, retention })
    })()
    return () => { cancelled = true }
  }, [progress, missed])

  if (!data) {
    return (
      <div>
        <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <Spinner label="Crunching your metrics..." />
      </div>
    )
  }

  const { summary, cli, offlineDetail, usage, retention } = data
  const objs = summary.perObjective
  const studied = objs.filter(o => o.attempts > 0)

  // ---- Mastery overview ----
  const overall = objs.reduce((s, o) => s + o.mastery, 0) / objs.length
  const masteredCount = objs.filter(o => o.status === 'mastered').length
  const offlineCount = Object.values(offlineDetail).filter(d => d.ready).length

  // ---- Weak areas ----
  const weak = [...studied].filter(o => o.status !== 'mastered').sort((a, b) => a.mastery - b.mastery).slice(0, 6)
  const missedTop = Object.entries(summary.missedByObj).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // ---- Confidence vs accuracy ----
  const quads = { strong: [], reassure: [], hidden: [], priority: [] }
  studied.forEach(o => {
    const { acc, conf, has } = masteryBreakdown(progress[o.id])
    if (has) quads[quadrantOf(acc, conf)].push({ ...o, acc, conf })
  })
  const avgAcc = studied.length ? studied.reduce((s, o) => s + masteryBreakdown(progress[o.id]).acc, 0) / studied.length : 0
  const avgConf = studied.length ? studied.reduce((s, o) => s + masteryBreakdown(progress[o.id]).conf, 0) / studied.length : 0

  // ---- CLI skills ----
  const cliRows = Object.entries(cli).map(([id, s]) => {
    const o = ALL_OBJECTIVES.find(x => x.id === id)
    return { id, title: o ? o.title : id, ...s }
  }).sort((a, b) => (b.bestScore || 0) - (a.bestScore || 0))
  const cliTotals = cliRows.reduce((t, r) => ({
    runs: t.runs + (r.runs || 0), syntax: t.syntax + (r.syntaxErrors || 0), mode: t.mode + (r.wrongModeErrors || 0),
  }), { runs: 0, syntax: 0, mode: 0 })

  // ---- Review readiness ----
  const reviewCards = generateLocalSuggestions(summary)

  // ---- Offline unlock progress (topics 1-3 of 4 done) ----
  const offlineInProgress = ALL_OBJECTIVES
    .map(o => ({ o, d: offlineDetail[o.id] }))
    .filter(x => x.d.count > 0 && !x.d.ready)
    .sort((a, b) => b.d.count - a.d.count)
    .slice(0, 5)

  const section = { ...styles.card }
  const sectionTitle = { fontSize: 13, fontWeight: 700, color: COLORS.silver, letterSpacing: 0.5, marginBottom: 12 }
  const open = (o) => onSelectObjective({ ...o, domainId: o.domainId, domainName: o.domainName, accent: o.accent })
  const quadCell = (key, label, accent, hint) => (
    <div style={{ flex: '1 1 45%', background: accentColors(accent).dim, border: `1px solid ${accentColors(accent).border}`, borderRadius: 10, padding: 10 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: accentColors(accent).text }}>{quads[key].length}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.silver }}>{label}</div>
      <div style={{ fontSize: 10, color: COLORS.silverMid, lineHeight: 1.3 }}>{hint}</div>
    </div>
  )

  return (
    <div>
      <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <h1 style={styles.h1}>Learner Metrics</h1>
      <div style={{ ...styles.small, marginBottom: 14 }}>Everything below is computed locally from your activity — no API calls.</div>

      {/* Mastery overview */}
      <div style={section}>
        <div style={sectionTitle}>MASTERY OVERVIEW</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <ProgressRing value={overall} size={84} accent="purple" caption="Course mastery" />
          <div style={{ flex: 1 }}>
            <div style={{ ...styles.small, marginBottom: 6 }}>{masteredCount}/{objs.length} objectives mastered · ⤓ {offlineCount} offline-ready</div>
            <ProgressBar value={masteredCount} max={objs.length} accent="mint" label="Mastered" sublabel={`${masteredCount}/${objs.length}`} height={7} />
            <ProgressBar value={studied.length} max={objs.length} accent="sky" label="Started" sublabel={`${studied.length}/${objs.length}`} height={7} />
          </div>
        </div>
        {summary.domainStats.map(d => (
          <ProgressBar key={d.id} value={d.avg} max={1} accent="purple" label={d.name} sublabel={`${Math.round(d.avg * 100)}% · ${d.mastered}/${d.total}`} height={6} />
        ))}
      </div>

      {/* Retention health — spaced-review state per section */}
      <div style={section}>
        <div style={sectionTitle}>RETENTION HEALTH</div>
        {retention.length === 0 ? (
          <div style={styles.small}>No sections in spaced review yet. Score ≥70% on a section's quiz and its questions start coming back on a forgetting-curve schedule — their retention state will show here.</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              {['strong', 'fading', 'weak'].map(st => {
                const n = retention.filter(r => r.state === st).length
                const m = RETENTION_META[st]
                const c = accentColors(m.accent)
                return (
                  <div key={st} style={{ flex: 1, textAlign: 'center', background: c.dim, border: `1px solid ${c.border}`, borderRadius: 10, padding: '8px 4px' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: c.text }}>{n}</div>
                    <div style={{ fontSize: 10, color: c.text, fontWeight: 600 }}>{m.icon} {m.label}</div>
                  </div>
                )
              })}
            </div>
            {retention.map(r => {
              const m = RETENTION_META[r.state]
              const c = accentColors(m.accent)
              return (
                <button key={r.id} onClick={() => open(r.objective)} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, textAlign: 'left', background: 'none', border: 'none', borderTop: `1px solid ${COLORS.border}`, cursor: 'pointer', padding: '10px 2px', fontFamily: 'inherit' }}>
                  <span style={{ fontSize: 18 }} aria-hidden="true">{m.icon}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: 13, color: COLORS.silver }}>{r.id} {r.title}</span>
                    <span style={{ display: 'block', fontSize: 11, color: COLORS.silverMid }}>{m.note(r)} · {r.count} item{r.count === 1 ? '' : 's'}</span>
                  </span>
                  <span style={{ ...styles.pill(m.accent), fontSize: 10 }}>{m.label}</span>
                </button>
              )
            })}
          </>
        )}
      </div>

      {/* Weak areas */}
      <div style={section}>
        <div style={sectionTitle}>WEAK AREAS — IMPROVEMENT MAP</div>
        {weak.length === 0 && <div style={styles.small}>Take a few quizzes and your weakest topics will surface here.</div>}
        {weak.map(o => (
          <button key={o.id} onClick={() => open(o)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 4, fontFamily: 'inherit' }}>
            <ProgressBar value={o.mastery} max={1} accent="rose" label={`${o.id} ${o.title}`} sublabel={`${Math.round(o.mastery * 100)}%`} height={7} />
          </button>
        ))}
        {missedTop.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ ...styles.small, fontWeight: 600, marginBottom: 4 }}>Most-missed concepts</div>
            {missedTop.map(([id, n]) => {
              const o = ALL_OBJECTIVES.find(x => x.id === id)
              return <div key={id} style={{ fontSize: 12, color: COLORS.silverMid, marginBottom: 2 }}>{id} {o ? o.title : ''} — <span style={{ color: COLORS.rose }}>missed {n}×</span></div>
            })}
          </div>
        )}
      </div>

      {/* Confidence vs accuracy */}
      <div style={section}>
        <div style={sectionTitle}>CONFIDENCE vs ACCURACY</div>
        <ProgressBar value={avgAcc} max={1} accent="sky" label="Avg accuracy" sublabel={`${Math.round(avgAcc * 100)}%`} height={7} />
        <ProgressBar value={avgConf} max={1} accent="mint" label="Avg confidence" sublabel={`${Math.round(avgConf * 100)}%`} height={7} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {quadCell('strong', 'Strong mastery', 'mint', 'High accuracy + confidence')}
          {quadCell('hidden', 'Hidden weakness', 'rose', 'Confident but inaccurate — priority')}
          {quadCell('reassure', 'Needs reassurance', 'sky', 'Accurate but unsure')}
          {quadCell('priority', 'Priority review', 'purple', 'Low accuracy + confidence')}
        </div>
        {quads.hidden.length > 0 && (
          <div style={{ ...styles.small, marginTop: 8, color: COLORS.rose }}>
            Hidden weakness: {quads.hidden.slice(0, 3).map(o => `${o.id}`).join(', ')} — you feel confident but accuracy is low. Re-quiz these.
          </div>
        )}
      </div>

      {/* CLI skills tracker */}
      <div style={section}>
        <div style={sectionTitle}>CISCO CLI SKILLS</div>
        {cliRows.length === 0 && <div style={styles.small}>Complete a CLI lab to start tracking command skills.</div>}
        {cliRows.map(r => (
          <ProgressBar key={r.id} value={(r.bestScore || 0) / 100} max={1} accent="sky" label={`${r.id} ${r.title}`} sublabel={`${r.bestScore || 0}%`} height={7} />
        ))}
        {cliRows.length > 0 && (
          <div style={{ ...styles.small, marginTop: 6 }}>
            {cliTotals.runs} lab{cliTotals.runs === 1 ? '' : 's'} completed · {cliTotals.syntax} syntax error{cliTotals.syntax === 1 ? '' : 's'} · {cliTotals.mode} wrong-mode error{cliTotals.mode === 1 ? '' : 's'}
          </div>
        )}
      </div>

      {/* Review readiness queue */}
      <div style={section}>
        <div style={sectionTitle}>REVIEW READINESS QUEUE</div>
        {reviewCards.length === 0 && <div style={styles.small}>You're all caught up. Start a new topic to populate your queue.</div>}
        {reviewCards.map(s => (
          <button key={s.key} onClick={() => onSelectObjective({ ...s.objective, __initialTab: s.tab })} style={{ display: 'block', width: '100%', textAlign: 'left', background: accentColors(s.accent).dim, border: `1px solid ${accentColors(s.accent).border}`, borderRadius: 10, padding: 10, marginBottom: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
            <span style={{ ...styles.pill(s.accent), fontSize: 10 }}>{s.chip}</span>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.silver, margin: '4px 0 2px' }}>{s.title}</div>
            <div style={{ ...styles.small, lineHeight: 1.4 }}>{s.body}</div>
          </button>
        ))}
      </div>

      {/* Offline unlock progress */}
      <div style={section}>
        <div style={sectionTitle}>OFFLINE UNLOCK PROGRESS</div>
        <div style={{ ...styles.small, marginBottom: 10 }}>{offlineCount} topic{offlineCount === 1 ? '' : 's'} fully offline-ready. Closest to unlocking:</div>
        {offlineInProgress.length === 0 && <div style={styles.small}>Open a topic's tabs (or tap "Make available offline") to start downloading assets.</div>}
        {offlineInProgress.map(({ o, d }) => (
          <div key={o.id} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: COLORS.silver }}>{o.id} {o.title}</span>
              <span style={{ fontSize: 12, color: COLORS.mint, fontWeight: 600 }}>{d.count} of 4</span>
            </div>
            <SegmentedBar segments={d.reqs} accent="mint" />
          </div>
        ))}
      </div>

      {/* AI usage & estimated cost */}
      <div style={section}>
        <div style={sectionTitle}>AI USAGE & ESTIMATED COST</div>
        {!usage || !usage.calls ? (
          <div style={styles.small}>No AI calls recorded yet. Generate an explanation or quiz to start tracking spend.</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.mint }}>${usage.costUSD.toFixed(3)}</div>
                <div style={styles.small}>estimated total</div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: COLORS.silver }}>{usage.calls}</div>
                <div style={styles.small}>API calls</div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: COLORS.silver }}>{Math.round((usage.input + usage.output) / 1000)}k</div>
                <div style={styles.small}>tokens</div>
              </div>
            </div>
            <div style={{ ...styles.small, fontWeight: 600, marginBottom: 4 }}>By feature</div>
            {Object.entries(usage.byFeature).sort((a, b) => b[1].costUSD - a[1].costUSD).map(([f, e]) => (
              <div key={f} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: COLORS.silverMid, marginBottom: 2 }}>
                <span>{f} · {e.calls} call{e.calls === 1 ? '' : 's'}</span>
                <span style={{ color: COLORS.sky }}>${e.costUSD.toFixed(3)}</span>
              </div>
            ))}
            <div style={{ ...styles.small, marginTop: 8, fontSize: 11 }}>Estimate based on public token pricing; cached/free reuse isn't billed.</div>
          </>
        )}
      </div>
    </div>
  )
}

/* =========================================================================
   REVIEW SESSION — spaced-repetition review of all questions due today,
   pulled across every objective. Answering advances each card's schedule.
   ========================================================================= */
const REVIEW_SESSION_CAP = 20
function ReviewSession({ onBack, onMissed, onDone, onOpenSection }) {
  const [phase, setPhase] = useState('loading') // loading | active | empty | done
  const [queue, setQueue] = useState([])
  const [current, setCurrent] = useState(null)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [stats, setStats] = useState({ correct: 0, total: 0 })
  const [total, setTotal] = useState(0)

  useEffect(() => {
    (async () => {
      const due = await loadDueQuestions(REVIEW_SESSION_CAP)
      if (due.length === 0) { setPhase('empty'); return }
      setTotal(due.length)
      setCurrent(due[0]); setQueue(due.slice(1)); setPhase('active')
    })()
  }, [])
  // ~30s per question, shown as a gentle expectation (never a backlog count).
  const estMin = Math.max(1, Math.round(total * 0.5))

  function answer(idx) {
    if (revealed) return
    const correct = idx === current.correctIndex
    setSelected(idx); setRevealed(true)
    haptic(correct ? 15 : [10, 40, 10])
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    recordQuizResult(current.objectiveId, current.id, { correct })
    logEvent('user_reviewed_concept', { objectiveId: current.objectiveId, questionId: current.id, correct })
    if (!correct) {
      onMissed({ objectiveId: current.objectiveId, question: current.question, choices: current.choices, correctIndex: current.correctIndex, selectedIndex: idx, explanation: current.explanation, concept: current.concept, addedAt: Date.now() })
    }
  }
  function next() {
    if (queue.length === 0) { setPhase('done'); onDone?.(); return }
    setCurrent(queue[0]); setQueue(q => q.slice(1)); setSelected(null); setRevealed(false)
  }

  if (phase === 'loading') return <div><button style={styles.backBtn} onClick={onBack}>‹ Back</button><Spinner label="Gathering your reviews..." /></div>
  if (phase === 'empty') {
    return (
      <div>
        <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <h1 style={styles.h1}>Daily Review</h1>
        <p style={styles.small}>Nothing due right now. Spaced repetition brings questions back on their schedule — take some quizzes and they'll reappear here over the coming days.</p>
      </div>
    )
  }
  if (phase === 'done') {
    return (
      <div>
        <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <div style={styles.card}>
          <h2 style={styles.h2}>Review complete</h2>
          <p style={{ fontSize: 28, fontWeight: 700, color: COLORS.mint, margin: '4px 0' }}>{stats.correct} / {stats.total}</p>
          <p style={styles.small}>Each question's next review has been rescheduled. Come back tomorrow for the next batch.</p>
          <button style={{ ...styles.primaryBtn, marginTop: 10 }} onClick={onBack}>Done</button>
        </div>
      </div>
    )
  }

  const isCorrect = revealed && selected === current.correctIndex
  const obj = ALL_OBJECTIVES.find(o => o.id === current.objectiveId)
  return (
    <div>
      <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <h1 style={{ ...styles.h1, margin: 0 }}>Daily Review</h1>
        <span style={styles.small}>{total - queue.length} of {total}</span>
      </div>
      <div style={{ ...styles.small, marginBottom: 8 }}>Mixed sections · retrieval practice{revealed ? '' : ' — answer before revealing'}</div>
      {obj && <div style={{ ...styles.small, marginBottom: 8 }}>{obj.id} {obj.title}</div>}
      <div style={styles.card}>
        <QuestionMeta q={current} />
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, lineHeight: 1.5 }}><RichText text={current.question} /></div>
        {current.choices.map((choice, idx) => {
          let bg = COLORS.surface, border = COLORS.border, color = COLORS.silver
          if (revealed) {
            if (idx === current.correctIndex) { bg = COLORS.mintDim; border = COLORS.mintBorder; color = COLORS.mint }
            else if (idx === selected) { bg = COLORS.roseDim; border = COLORS.roseBorder; color = COLORS.rose }
          }
          return (
            <button key={idx} onClick={() => answer(idx)} style={{ display: 'block', width: '100%', textAlign: 'left', minHeight: 44, marginBottom: 8, background: bg, border: `1px solid ${border}`, color, borderRadius: 10, padding: '12px 14px', fontSize: 14, cursor: revealed ? 'default' : 'pointer', lineHeight: 1.4 }}>
              {choice}
            </button>
          )
        })}
        {revealed && (
          <div style={{ marginTop: 8, padding: 12, borderRadius: 10, background: isCorrect ? COLORS.mintDim : COLORS.roseDim, border: `1px solid ${isCorrect ? COLORS.mintBorder : COLORS.roseBorder}` }}>
            <div style={{ fontWeight: 700, color: isCorrect ? COLORS.mint : COLORS.rose, marginBottom: 4, fontSize: 13 }}>{isCorrect ? 'Correct' : 'Incorrect'}</div>
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>{current.explanation}</div>
            {!isCorrect && (
              <ExplainMistake
                cacheKey={`${current.id || normalizeQuestionText(current.question)}::${selected}`}
                question={current.question} choices={current.choices}
                correctIndex={current.correctIndex} selectedIndex={selected}
                explanation={current.explanation}
              />
            )}
            {obj && (
              <button
                onClick={() => onOpenSection?.(obj)}
                style={{ marginTop: 10, background: 'none', border: 'none', color: COLORS.sky, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Review {obj.id} {obj.title} →
              </button>
            )}
          </div>
        )}
      </div>
      {revealed && <button style={styles.primaryBtn} onClick={next}>{queue.length === 0 ? 'Finish' : 'Next'}</button>}
    </div>
  )
}

/* =========================================================================
   HOME SCREEN
   ========================================================================= */
function HomeScreen({ progress, streak, missed, missedCount, dueCount, apiOnline, offlineReady, onSelectObjective, onOpenMock, onOpenMissed, onOpenTutor, onOpenExport, onOpenMetrics, onOpenSync, onOpenReview, syncOn }) {
  const [openDomain, setOpenDomain] = useState(null)
  const [suggestions, setSuggestions] = useState([])

  // Recompute the "For You" cards locally whenever progress or the missed bank
  // changes. Fully deterministic — no API call.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const summary = await buildLearnerSummary(progress, missed || [])
      if (!cancelled) setSuggestions(generateLocalSuggestions(summary))
    })()
    return () => { cancelled = true }
  }, [progress, missed])

  const totals = useMemo(() => {
    let mastered = 0, inProgress = 0
    ALL_OBJECTIVES.forEach(o => {
      const s = progress[o.id]?.status
      if (s === 'mastered') mastered++
      else if (s === 'in_progress') inProgress++
    })
    const overall = ALL_OBJECTIVES.reduce((s, o) => s + computeMastery(progress[o.id]).score, 0) / ALL_OBJECTIVES.length
    return { mastered, inProgress, total: ALL_OBJECTIVES.length, overall }
  }, [progress])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <h1 style={styles.h1} className="ccna-grad-text">CCNA 200-301</h1>
        {streak.count > 0 && (
          <div style={{ ...styles.pill('mint'), whiteSpace: 'nowrap', marginRight: 48 }}>🔥 {streak.count} day{streak.count === 1 ? '' : 's'}</div>
        )}
      </div>
      <div style={{ ...styles.small, marginBottom: 10 }}>
        {totals.mastered} mastered · {totals.inProgress} in progress · {totals.total - totals.mastered - totals.inProgress} not started
        {offlineReady?.size > 0 && <> · ⤓ {offlineReady.size} offline-ready</>}
      </div>
      <ProgressBar value={totals.overall} max={1} accent="purple" label="Course mastery" sublabel={`${Math.round(totals.overall * 100)}%`} height={9} />
      {dueCount > 0 && (() => {
        // Neutral, capped framing — never guilt-trip with a backlog count.
        const ready = Math.min(dueCount, REVIEW_SESSION_CAP)
        const estMin = Math.max(1, Math.round(ready * 0.5))
        return (
          <button
            className="ccna-hover"
            style={{ ...styles.primaryBtn, marginBottom: 8, background: COLORS.skyDim, border: `1px solid ${COLORS.skyBorder}`, color: COLORS.sky }}
            onClick={onOpenReview}
          >
            📅 Today's Review — {ready} ready · ~{estMin} min
          </button>
        )
      })()}
      <button style={{ ...styles.secondaryBtn, marginBottom: 16 }} onClick={onOpenMetrics}>📊 Learner Metrics</button>

      {suggestions.length > 0 && (
        <div style={{ marginBottom: 12 }} className="ccna-stagger">
          <div style={{ ...styles.small, fontWeight: 700, color: COLORS.silver, marginBottom: 8, letterSpacing: 0.5 }}>FOR YOU</div>
          {suggestions.map(s => {
            const c = accentColors(s.accent)
            return (
              <button
                key={s.key}
                className="ccna-hover"
                onClick={() => onSelectObjective({ ...s.objective, __initialTab: s.tab })}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                  background: c.dim, border: `1px solid ${c.border}`, borderRadius: 14, padding: 14, marginBottom: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ ...styles.pill(s.accent), fontSize: 11 }}>{s.chip}</span>
                  <span style={{ color: c.text, fontSize: 16, lineHeight: 1 }}>›</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.silver, marginBottom: 4, lineHeight: 1.4 }}>{s.title}</div>
                <div style={{ ...styles.small, lineHeight: 1.5 }}>{s.body}</div>
              </button>
            )
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button style={styles.primaryBtn} onClick={onOpenMock}>Mock Exam</button>
        <button style={styles.secondaryBtn} onClick={onOpenMissed}>Missed ({missedCount})</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button style={styles.secondaryBtn} onClick={onOpenTutor} disabled={!apiOnline}>AI Tutor Chat</button>
        <button style={styles.secondaryBtn} onClick={onOpenExport}>Export Reports</button>
      </div>
      <button style={{ ...styles.secondaryBtn, marginBottom: 16 }} onClick={onOpenSync}>☁ Sync across devices{syncOn ? ' ✓' : ''}</button>

      {DOMAINS.map(domain => {
        const isOpen = openDomain === domain.id
        const objs = domain.objectives
        const masteredCount = objs.filter(o => progress[o.id]?.status === 'mastered').length
        const accent = accentColors(domain.accent)
        return (
          <div key={domain.id} className="ccna-hover" style={styles.card}>
            <button
              onClick={() => setOpenDomain(isOpen ? null : domain.id)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', color: COLORS.silver, cursor: 'pointer', minHeight: 44, padding: 0, textAlign: 'left' }}
            >
              <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{domain.name}</div>
                <div style={{ ...styles.small, marginBottom: 6 }}>{domain.weight}% of exam · {masteredCount}/{objs.length} mastered</div>
                <ProgressBar value={masteredCount} max={objs.length} accent={domain.accent} height={5} />
              </div>
              <span style={{ ...styles.pill(domain.accent), flexShrink: 0 }}>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div style={{ marginTop: 10, borderTop: `1px solid ${COLORS.border}`, paddingTop: 8 }}>
                {objs.map(o => {
                  const status = progress[o.id]?.status || 'unseen'
                  return (
                    <button
                      key={o.id}
                      onClick={() => onSelectObjective({ ...o, domainId: domain.id, domainName: domain.name, accent: domain.accent })}
                      style={{ display: 'flex', alignItems: 'center', width: '100%', background: 'none', border: 'none', color: COLORS.silver, cursor: 'pointer', minHeight: 44, padding: '8px 0', textAlign: 'left', borderBottom: `1px solid ${COLORS.border}` }}
                    >
                      <StatusDot status={status} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13 }}>{o.id} {o.title}</div>
                      </div>
                      {offlineReady?.has(o.id) && <span style={{ color: COLORS.mint, fontSize: 13, marginLeft: 8, flexShrink: 0 }}>⤓</span>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* =========================================================================
   MISSED QUESTIONS REVIEW
   ========================================================================= */
function MissedReview({ missed, onBack, onRemove }) {
  const [revealedIdx, setRevealedIdx] = useState(null)

  if (missed.length === 0) {
    return (
      <div>
        <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <h1 style={styles.h1}>Missed Questions</h1>
        <p style={styles.small}>No missed questions saved. Nice work — they'll show up here whenever you answer a quiz question incorrectly.</p>
      </div>
    )
  }

  return (
    <div>
      <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <h1 style={styles.h1}>Missed Questions</h1>
      <p style={{ ...styles.small, marginBottom: 14 }}>{missed.length} question{missed.length === 1 ? '' : 's'} saved for review.</p>
      {missed.map((m, idx) => (
        <div key={idx} style={styles.card}>
          <div style={{ ...styles.small, marginBottom: 6 }}>{m.objectiveId}</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, lineHeight: 1.5 }}>{m.question}</div>
          {m.choices.map((c, ci) => {
            const isAnswer = ci === m.correctIndex
            const reveal = revealedIdx === idx
            return (
              <div key={ci} style={{
                padding: '10px 12px', borderRadius: 10, marginBottom: 6, fontSize: 13,
                background: reveal && isAnswer ? COLORS.mintDim : COLORS.surface,
                border: `1px solid ${reveal && isAnswer ? COLORS.mintBorder : COLORS.border}`,
                color: reveal && isAnswer ? COLORS.mint : COLORS.silver,
              }}>
                {c}
              </div>
            )
          })}
          {revealedIdx === idx ? (
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 13, color: COLORS.silverMid, marginBottom: 8, lineHeight: 1.5 }}>{m.explanation}</div>
              {m.selectedIndex != null && (
                <ExplainMistake
                  cacheKey={`${normalizeQuestionText(m.question)}::${m.selectedIndex}`}
                  question={m.question} choices={m.choices}
                  correctIndex={m.correctIndex} selectedIndex={m.selectedIndex}
                  explanation={m.explanation}
                />
              )}
              <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={() => onRemove(idx)}>Mark as reviewed (remove)</button>
            </div>
          ) : (
            <button style={{ ...styles.secondaryBtn, marginTop: 4 }} onClick={() => setRevealedIdx(idx)}>Show answer</button>
          )}
        </div>
      ))}
    </div>
  )
}

/* =========================================================================
   MOCK EXAM
   ========================================================================= */
const MOCK_EXAM_SYSTEM = `You are a CCNA 200-301 exam question generator. Ground every question strictly in the provided reference notes for each objective — do not introduce facts that contradict them. Generate multiple-choice questions (4 choices each, exactly one correct) at official CCNA exam difficulty, distributed across the listed objectives.

Respond with ONLY valid JSON (no markdown fences, no commentary), in this exact shape:
{"questions":[{"objectiveId":"x.x","question":"...","choices":["...","...","...","..."],"correctIndex":0,"explanation":"..."}]}`

function formatSeconds(total) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function MockExam({ onExit }) {
  const [phase, setPhase] = useState('intro') // intro | loading | active | done | error
  const [error, setError] = useState(null)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [responses, setResponses] = useState({}) // qIndex -> selectedIndex
  const [secondsLeft, setSecondsLeft] = useState(MOCK_EXAM_DURATION_MIN * 60)

  const start = useCallback(async () => {
    setPhase('loading')
    setError(null)
    try {
      const domainCounts = buildMockExamDomainCounts().filter(dc => dc.count > 0)
      const results = await Promise.all(domainCounts.map(async ({ domain, count }) => {
        const objectivesText = domain.objectives.map(o => `Objective ${o.id} — ${o.title}\n${BOOK_REF[o.id] || ''}`).join('\n\n')
        const data = await askClaudeJSON({
          system: cachedSystem(MOCK_EXAM_SYSTEM),
          messages: [{
            role: 'user',
            content: `Domain: ${domain.name}\n\n${objectivesText}\n\nGenerate ${count} multiple-choice questions total for this domain, spread across the objectives above. Tag each question with its objectiveId.`,
          }],
          max_tokens: 250 * count + 300,
          schema: MOCK_SCHEMA,
          toolName: 'emit_exam',
          feature: 'mock',
        })
        return (data.questions || []).slice(0, count)
      }))
      const all = shuffleArray(results.flat())
      if (all.length === 0) throw new Error('No questions were generated.')
      setQuestions(all)
      setResponses({})
      setCurrent(0)
      setSecondsLeft(MOCK_EXAM_DURATION_MIN * 60)
      setPhase('active')
    } catch (err) {
      setError(err.message.includes('JSON') ? 'Claude returned an unexpected format while building the exam. Please try again.' : err.message)
      setPhase('error')
    }
  }, [])

  // Countdown timer
  useEffect(() => {
    if (phase !== 'active') return
    const id = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(id)
          setPhase('done')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [phase])

  function selectChoice(idx) {
    setResponses(r => ({ ...r, [current]: idx }))
  }

  const report = useMemo(() => {
    if (phase !== 'done') return null
    const byDomain = {}
    DOMAINS.forEach(d => { byDomain[d.id] = { name: d.name, correct: 0, total: 0 } })
    let correct = 0
    questions.forEach((q, idx) => {
      const domainIdx = parseInt((q.objectiveId || '1.1').split('.')[0], 10) - 1
      const domain = DOMAINS[domainIdx] || DOMAINS[0]
      byDomain[domain.id].total++
      if (responses[idx] === q.correctIndex) {
        byDomain[domain.id].correct++
        correct++
      }
    })
    return { correct, total: questions.length, byDomain }
  }, [phase, questions, responses])

  if (phase === 'intro') {
    return (
      <div>
        <button style={styles.backBtn} onClick={onExit}>‹ Back</button>
        <h1 style={styles.h1}>Mock Exam</h1>
        <div style={styles.card}>
          <div style={{ fontSize: 14, lineHeight: 1.7 }}>
            <div>• {MOCK_EXAM_QUESTION_COUNT} questions, {MOCK_EXAM_DURATION_MIN} minute countdown</div>
            <div>• Weighted by official exam domain percentages</div>
            <div>• Score report broken down by domain at the end</div>
            <div>• Once started, the timer runs continuously — find a quiet 2 hours, or submit early</div>
          </div>
        </div>
        <button style={styles.primaryBtn} onClick={start}>Start Mock Exam</button>
      </div>
    )
  }
  if (phase === 'loading') return <Spinner label="Building your exam..." />
  if (phase === 'error') return <ErrorBox message={error} onRetry={start} />

  if (phase === 'done') {
    const pct = report.total > 0 ? Math.round((report.correct / report.total) * 100) : 0
    return (
      <div>
        <button style={styles.backBtn} onClick={onExit}>‹ Back to Home</button>
        <h1 style={styles.h1}>Exam Results</h1>
        <div style={styles.card}>
          <div style={{ fontSize: 32, fontWeight: 700, color: pct >= 70 ? COLORS.mint : COLORS.rose }}>{pct}%</div>
          <div style={styles.small}>{report.correct} / {report.total} correct</div>
        </div>
        <div style={styles.card}>
          <h2 style={styles.h2}>By Domain</h2>
          {DOMAINS.map(d => {
            const r = report.byDomain[d.id]
            if (!r || r.total === 0) return null
            const dpct = Math.round((r.correct / r.total) * 100)
            return (
              <div key={d.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>{d.name}</span>
                  <span style={{ color: dpct >= 70 ? COLORS.mint : COLORS.rose, fontWeight: 600 }}>{r.correct}/{r.total} ({dpct}%)</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: COLORS.surface, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${dpct}%`, background: dpct >= 70 ? COLORS.mint : COLORS.rose }} />
                </div>
              </div>
            )
          })}
        </div>
        <button style={styles.primaryBtn} onClick={start}>Retake mock exam</button>
      </div>
    )
  }

  // active
  const q = questions[current]
  const selected = responses[current]
  const answeredCount = Object.keys(responses).length
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={styles.small}>Question {current + 1} / {questions.length}</div>
        <div style={{ ...styles.pill(secondsLeft < 600 ? 'rose' : 'sky') }}>{formatSeconds(secondsLeft)}</div>
      </div>
      <div style={styles.card}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, lineHeight: 1.5 }}>{q.question}</div>
        {q.choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => selectChoice(idx)}
            style={{
              display: 'block', width: '100%', textAlign: 'left', minHeight: 44, marginBottom: 8,
              background: selected === idx ? COLORS.purpleDim : COLORS.surface,
              border: `1px solid ${selected === idx ? COLORS.purpleGlow : COLORS.border}`,
              color: COLORS.silver, borderRadius: 10, padding: '12px 14px', fontSize: 14, cursor: 'pointer', lineHeight: 1.4,
            }}
          >
            {choice}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button style={styles.secondaryBtn} disabled={current === 0} onClick={() => setCurrent(c => Math.max(0, c - 1))}>Previous</button>
        {current < questions.length - 1 ? (
          <button style={styles.primaryBtn} onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}>Next</button>
        ) : (
          <button style={styles.primaryBtn} onClick={() => setPhase('done')}>Submit Exam</button>
        )}
      </div>
      <div style={{ ...styles.small, textAlign: 'center' }}>{answeredCount} / {questions.length} answered</div>
      {current === questions.length - 1 ? null : (
        <button style={{ ...styles.secondaryBtn, marginTop: 8, background: 'none', border: 'none', color: COLORS.silverMid }} onClick={() => setPhase('done')}>
          Submit exam now
        </button>
      )}
    </div>
  )
}

/* =========================================================================
   PROGRESS EXPORT
   ========================================================================= */
/* =========================================================================
   EXPORT / REPORT SYSTEM  (Phase 9)
   A professional learning-report generator. Every report is built locally from
   stored data (progress, missed bank, quiz bank, CLI stats, events, offline
   caches) — no API calls. Each report has a builder that returns plain text.
   ========================================================================= */
const fmtPct = (n) => `${Math.round((n || 0) * 100)}%`
const rule = (t) => `${t}\n${'='.repeat(Math.max(t.length, 4))}`
function reportHeader(title) {
  return [rule(`CCNA 200-301 — ${title}`), `Generated: ${new Date().toLocaleString()}`, ''].join('\n')
}

// Builders receive a ctx assembled once by the modal.
function repStudentProgress(ctx) {
  const { progress, summary } = ctx
  const out = [reportHeader('Student Progress Report')]
  const overall = summary.perObjective.reduce((s, o) => s + o.mastery, 0) / summary.perObjective.length
  const mastered = summary.perObjective.filter(o => o.status === 'mastered').length
  out.push(`Overall mastery: ${fmtPct(overall)} · ${mastered}/${summary.perObjective.length} objectives mastered`, '')
  DOMAINS.forEach(d => {
    const ds = summary.domainStats.find(x => x.id === d.id)
    out.push(`${d.name} (${d.weight}% of exam) — ${fmtPct(ds.avg)} avg, ${ds.mastered}/${ds.total} mastered`)
    d.objectives.forEach(o => {
      const p = progress[o.id]
      const status = p?.status || 'unseen'
      const m = computeMastery(p).score
      let line = `  [${status === 'mastered' ? 'x' : ' '}] ${o.id} ${o.title} — ${status.replace('_', ' ')}`
      if (p?.quizScores?.length) line += ` · mastery ${fmtPct(m)} · ${p.quizScores.length} quiz session(s)`
      out.push(line)
    })
    out.push('')
  })
  return out.join('\n')
}

function repCertReadiness(ctx) {
  const { summary, cliStats } = ctx
  const rows = summary.perObjective
  const readiness = summary.domainStats.reduce((s, d) => s + (d.weight / 100) * d.avg, 0)
  const strong = rows.filter(o => o.mastery >= 0.85 || o.status === 'mastered')
  const needs = rows.filter(o => o.attempts > 0 && o.mastery < 0.7).sort((a, b) => a.mastery - b.mastery)
  const close = rows.filter(o => o.mastery >= 0.7 && o.mastery < 0.85 && o.status !== 'mastered')
  const unseen = rows.filter(o => o.status === 'unseen')
  const cliVals = Object.values(cliStats).map(s => s.bestScore || 0)
  const cliReady = cliVals.length ? Math.round(cliVals.reduce((a, b) => a + b, 0) / cliVals.length) : null

  const out = [reportHeader('Certification Readiness Report')]
  out.push(`Overall Readiness: ${fmtPct(readiness)}`, '')
  out.push('Quiz accuracy by domain:')
  summary.domainStats.forEach(d => out.push(`  - ${d.name}: ${fmtPct(d.avg)} (${d.mastered}/${d.total} mastered)`))
  out.push('', 'CLI readiness: ' + (cliReady != null ? `${cliReady}% across ${cliVals.length} lab(s)` : 'no CLI labs completed yet'))
  out.push('', 'Strong areas:')
  ;(strong.length ? strong : [{ id: '', title: 'none yet' }]).forEach(o => out.push(`  + ${o.id} ${o.title}`.trimEnd()))
  out.push('', 'Needs review (do NOT skip):')
  ;(needs.length ? needs : [{ id: '', title: 'none' }]).forEach(o => out.push(`  ! ${o.id} ${o.title}${o.mastery ? ` (${fmtPct(o.mastery)})` : ''}`.trimEnd()))
  out.push('', 'Close to mastery:')
  ;(close.length ? close : [{ id: '', title: 'none' }]).forEach(o => out.push(`  ~ ${o.id} ${o.title} (${fmtPct(o.mastery)})`.trimEnd()))
  if (unseen.length) { out.push('', `Not started (${unseen.length}):`); unseen.forEach(o => out.push(`  · ${o.id} ${o.title}`)) }
  out.push('', 'Final checklist:',
    `  [${readiness >= 0.85 ? 'x' : ' '}] Overall readiness >= 85%`,
    `  [${needs.length === 0 ? 'x' : ' '}] No topics below 70%`,
    `  [${unseen.length === 0 ? 'x' : ' '}] All objectives started`,
    `  [${cliReady != null && cliReady >= 70 ? 'x' : ' '}] CLI labs >= 70%`)
  return out.join('\n')
}

function repWeakAreas(ctx) {
  const { summary, progress } = ctx
  const rows = summary.perObjective.filter(o => o.attempts > 0)
  const weak = [...rows].filter(o => o.status !== 'mastered').sort((a, b) => a.mastery - b.mastery).slice(0, 12)
  const lowConf = rows.filter(o => o.hardCount >= 2)
  const hidden = rows.filter(o => { const b = masteryBreakdown(progress[o.id]); return b.has && b.acc < 0.7 && b.conf >= 0.6 })
  const missedTop = Object.entries(summary.missedByObj).sort((a, b) => b[1] - a[1])

  const out = [reportHeader('Weak Areas Report')]
  out.push('Lowest mastery (focus here first):')
  ;(weak.length ? weak : [{ id: '', title: 'none — great work' }]).forEach(o => out.push(`  - ${o.id} ${o.title}${o.mastery != null ? ` — ${fmtPct(o.mastery)}` : ''}`.trimEnd()))
  out.push('', 'Most-missed concepts:')
  ;(missedTop.length ? missedTop : [['', 0]]).forEach(([id, n]) => { const o = ALL_OBJECTIVES.find(x => x.id === id); out.push(`  - ${id} ${o ? o.title : ''}${n ? ` (missed ${n}x)` : ' none'}`.trimEnd()) })
  out.push('', 'Low confidence (rated Hard / Need practice):')
  ;(lowConf.length ? lowConf : [{ id: '', title: 'none' }]).forEach(o => out.push(`  - ${o.id} ${o.title}`.trimEnd()))
  out.push('', 'Hidden weakness (confident but inaccurate — priority):')
  ;(hidden.length ? hidden : [{ id: '', title: 'none' }]).forEach(o => out.push(`  - ${o.id} ${o.title}`.trimEnd()))
  return out.join('\n')
}

function repQuizPerformance(ctx) {
  const { progress, quizBank } = ctx
  const out = [reportHeader('Quiz Performance Report')]
  let any = false
  ALL_OBJECTIVES.forEach(o => {
    const p = progress[o.id]
    if (!p?.quizScores?.length) return
    any = true
    const first = p.quizScores[0], last = p.quizScores[p.quizScores.length - 1]
    const bestAcc = Math.max(...p.quizScores.map(s => s.score / Math.max(s.total, 1)))
    const bank = (quizBank[o.id] || []).length
    const ratings = p.confidenceRatings || []
    const conf = ratings.length ? `${ratings.filter(r => r === 'easy' || r === 'medium').length}/${ratings.length} confident` : 'no ratings'
    out.push(`${o.id} ${o.title}`)
    out.push(`  sessions: ${p.quizScores.length} · first ${first.score}/${first.total} -> last ${last.score}/${last.total} · best ${fmtPct(bestAcc)} · bank ${bank}Q · ${conf}`)
  })
  if (!any) out.push('No quizzes taken yet.')
  return out.join('\n')
}

function repCliLab(ctx) {
  const { cliStats } = ctx
  const out = [reportHeader('CLI Lab Report')]
  const entries = Object.entries(cliStats)
  if (entries.length === 0) { out.push('No CLI labs completed yet.'); return out.join('\n') }
  entries.sort((a, b) => (b[1].bestScore || 0) - (a[1].bestScore || 0)).forEach(([id, s]) => {
    const o = ALL_OBJECTIVES.find(x => x.id === id)
    out.push(`${id} ${o ? o.title : ''}`)
    out.push(`  best ${s.bestScore || 0}% · last ${s.lastScore || 0}% · runs ${s.runs || 0} · commands ${s.commandsEntered || 0} · syntax errors ${s.syntaxErrors || 0} · wrong-mode ${s.wrongModeErrors || 0} · hints ${s.hintsUsed || 0}`)
  })
  const tot = entries.reduce((t, [, s]) => ({ syntax: t.syntax + (s.syntaxErrors || 0), mode: t.mode + (s.wrongModeErrors || 0) }), { syntax: 0, mode: 0 })
  out.push('', `Totals: ${tot.syntax} syntax errors, ${tot.mode} wrong-mode errors across ${entries.length} lab(s).`)
  return out.join('\n')
}

function repMissedPacket(ctx) {
  const { missed } = ctx
  const out = [reportHeader('Missed-Question Review Packet')]
  if (!missed.length) { out.push('No missed questions — nothing to cram!'); return out.join('\n') }
  out.push(`${missed.length} question(s) to review. Cover the answers and quiz yourself.`, '')
  missed.forEach((m, i) => {
    const o = ALL_OBJECTIVES.find(x => x.id === m.objectiveId)
    out.push(`Q${i + 1}. [${m.objectiveId} ${o ? o.title : ''}]`)
    out.push(`  ${m.question}`)
    m.choices.forEach((c, ci) => out.push(`    ${String.fromCharCode(65 + ci)}. ${c}`))
    out.push(`  Answer: ${String.fromCharCode(65 + m.correctIndex)}. ${m.choices[m.correctIndex]}`)
    if (m.explanation) out.push(`  Why: ${m.explanation}`)
    out.push('')
  })
  return out.join('\n')
}

function repOfflineSummary(ctx) {
  const { offlineDetail } = ctx
  const out = [reportHeader('Offline Module Summary')]
  const ready = ALL_OBJECTIVES.filter(o => offlineDetail[o.id]?.ready)
  const partial = ALL_OBJECTIVES.filter(o => { const d = offlineDetail[o.id]; return d && d.count > 0 && !d.ready })
  out.push(`Offline-ready modules: ${ready.length}/${ALL_OBJECTIVES.length}`, '')
  out.push('Ready (works fully offline):')
  ;(ready.length ? ready : [{ id: '', title: 'none yet' }]).forEach(o => out.push(`  ⤓ ${o.id} ${o.title}`.trimEnd()))
  out.push('', 'In progress:')
  ;(partial.length ? partial : [{ id: '', title: 'none' }]).forEach(o => { const d = offlineDetail[o.id]; out.push(`  ${o.id} ${o.title} — ${d ? d.count : 0}/4 assets`.trimEnd()) })
  return out.join('\n')
}

function repOfflineStudyPacket(ctx) {
  const { offlineDetail, explainCache, termsCache, visualCache, quizBank } = ctx
  const out = [reportHeader('Offline Study Packet')]
  const ready = ALL_OBJECTIVES.filter(o => offlineDetail[o.id]?.ready)
  if (!ready.length) { out.push('No fully offline-ready modules yet. Master a topic (or tap "Make available offline") to build a packet.'); return out.join('\n') }
  ready.forEach(o => {
    out.push(rule(`${o.id} ${o.title}`))
    const ex = explainCache[o.id]
    if (ex && typeof ex === 'object') {
      if (ex.definition) out.push('', ex.definition)
      if (ex.keyPoints?.length) { out.push('', 'Key points:'); ex.keyPoints.forEach(p => out.push(`  • ${p}`)) }
      if (ex.commonMistakes?.length) { out.push('', 'Common mistakes:'); ex.commonMistakes.forEach(p => out.push(`  • ${p}`)) }
    } else if (ex) {
      out.push('', ex) // legacy prose
    }
    const terms = termsCache[o.id]
    if (terms?.length) { out.push('', 'Key terms:'); terms.forEach(t => out.push(`  • ${t.term}: ${t.detail}`)) }
    const v = visualCache[o.id]
    if (v) { out.push('', `Visual (${v.type}): ${v.title}`); (v.steps || v.layers || []).forEach((s, i) => out.push(`  ${i + 1}. ${typeof s === 'string' ? s : s.label}`)) }
    const bank = quizBank[o.id] || []
    if (bank.length) { out.push('', 'Practice questions:'); bank.forEach((q, i) => { out.push(`  ${i + 1}. ${q.question}`); out.push(`     Answer: ${q.choices[q.correctIndex]}`) }) }
    out.push('')
  })
  return out.join('\n')
}

function repProgressTimeline(ctx) {
  const { progress, streak } = ctx
  const out = [reportHeader('Progress Timeline')]
  out.push(`Current streak: ${streak?.count || 0} day(s)`, '')
  const items = []
  ALL_OBJECTIVES.forEach(o => {
    const p = progress[o.id]
    if (!p?.quizScores?.length) return
    const first = p.quizScores[0], last = p.quizScores[p.quizScores.length - 1]
    items.push({ o, first, last, delta: (last.score / Math.max(last.total, 1)) - (first.score / Math.max(first.total, 1)), date: first.date })
  })
  if (!items.length) { out.push('No timeline yet — take some quizzes to track growth.'); return out.join('\n') }
  items.sort((a, b) => a.date - b.date).forEach(it => {
    const d = new Date(it.first.date).toLocaleDateString()
    const arrow = it.delta > 0.01 ? `▲ +${fmtPct(it.delta)}` : it.delta < -0.01 ? `▼ ${fmtPct(it.delta)}` : '–'
    out.push(`${d}  ${it.o.id} ${it.o.title}: ${it.first.score}/${it.first.total} -> ${it.last.score}/${it.last.total}  ${arrow}`)
  })
  return out.join('\n')
}

function repInstructor(ctx) {
  const { summary, events } = ctx
  const out = [reportHeader('Instructor / Coach Report')]
  const overall = summary.perObjective.reduce((s, o) => s + o.mastery, 0) / summary.perObjective.length
  const mastered = summary.perObjective.filter(o => o.status === 'mastered').length
  const quizDone = events.filter(e => e.type === 'user_completed_quiz').length
  const cliDone = events.filter(e => e.type === 'user_completed_cli_lab').length
  out.push(`Overall mastery: ${fmtPct(overall)} · ${mastered}/${summary.perObjective.length} mastered`)
  out.push(`Engagement: ${quizDone} quiz session(s), ${cliDone} CLI lab(s) completed`, '')
  out.push('Per-domain:')
  summary.domainStats.forEach(d => out.push(`  - ${d.name}: ${fmtPct(d.avg)} (${d.mastered}/${d.total})`))
  const weak = [...summary.perObjective].filter(o => o.status !== 'mastered' && o.attempts > 0).sort((a, b) => a.mastery - b.mastery).slice(0, 6)
  out.push('', 'Recommended focus for next session:')
  ;(weak.length ? weak : [{ id: '', title: 'student is on track' }]).forEach(o => out.push(`  - ${o.id} ${o.title}`.trimEnd()))
  return out.join('\n')
}

function repFullPortfolio(ctx) {
  return [repStudentProgress(ctx), '', repCertReadiness(ctx), '', repWeakAreas(ctx), '', repCliLab(ctx), '', repProgressTimeline(ctx)].join('\n\n')
}

function repRawData(ctx) {
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    progress: ctx.progress,
    missed: ctx.missed,
    quizBank: ctx.quizBank,
    cliStats: ctx.cliStats,
    streak: ctx.streak,
    events: ctx.events,
  }, null, 2)
}

const REPORTS = [
  { key: 'progress', label: 'Student Progress', desc: 'Per-domain mastery checklist', ext: 'txt', build: repStudentProgress },
  { key: 'cert', label: 'Certification Readiness', desc: 'Are you exam-ready?', ext: 'txt', build: repCertReadiness },
  { key: 'weak', label: 'Weak Areas', desc: 'Focused improvement map', ext: 'txt', build: repWeakAreas },
  { key: 'quiz', label: 'Quiz Performance', desc: 'Accuracy & growth per topic', ext: 'txt', build: repQuizPerformance },
  { key: 'cli', label: 'CLI Lab Report', desc: 'Command skills & error trends', ext: 'txt', build: repCliLab },
  { key: 'missed', label: 'Missed-Question Packet', desc: 'Auto cram sheet', ext: 'txt', build: repMissedPacket },
  { key: 'offlineSum', label: 'Offline Module Summary', desc: 'What works offline', ext: 'txt', build: repOfflineSummary },
  { key: 'offlinePacket', label: 'Offline Study Packet', desc: 'Full self-contained notes', ext: 'txt', build: repOfflineStudyPacket },
  { key: 'timeline', label: 'Progress Timeline', desc: 'Growth over time', ext: 'txt', build: repProgressTimeline },
  { key: 'instructor', label: 'Instructor / Coach', desc: 'Summary for a mentor', ext: 'txt', build: repInstructor },
  { key: 'portfolio', label: 'Full Portfolio', desc: 'Everything combined', ext: 'txt', build: repFullPortfolio },
  { key: 'raw', label: 'Raw Data (JSON)', desc: 'Backup / transfer', ext: 'json', build: repRawData },
]

function ExportModal({ progress, missed, streak, onImport, onClose }) {
  const [ctx, setCtx] = useState(null)
  const [selected, setSelected] = useState('progress')
  const [copied, setCopied] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const fileRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text())
      if (!parsed || typeof parsed !== 'object' || (!parsed.progress && !parsed.quizBank && !parsed.missed)) {
        setImportMsg('That file does not look like a CCNA data export.')
      } else {
        await onImport(parsed)
        setImportMsg('Imported and merged ✓')
      }
    } catch {
      setImportMsg('Could not read that file (must be a valid JSON export).')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [summary, quizBank, cliStats, events, offlineDetail, explainCache, termsCache, visualCache] = await Promise.all([
        buildLearnerSummary(progress, missed || []),
        loadQuizBank(),
        loadCliStats(),
        window.storage.getItem(STORAGE_KEYS.events),
        loadOfflineDetail(),
        window.storage.getItem(EXPLAIN_CACHE_KEY),
        window.storage.getItem(TERMS_CACHE_KEY),
        window.storage.getItem(VISUAL_CACHE_KEY),
      ])
      if (!cancelled) setCtx({
        progress, missed: missed || [], streak, summary, quizBank, cliStats,
        events: events || [], offlineDetail,
        explainCache: explainCache || {}, termsCache: termsCache || {}, visualCache: visualCache || {},
      })
    })()
    return () => { cancelled = true }
  }, [progress, missed, streak])

  const report = REPORTS.find(r => r.key === selected)
  const text = useMemo(() => (ctx ? report.build(ctx) : ''), [ctx, report])

  async function copy() {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { setCopied(false) }
  }
  function download() {
    const blob = new Blob([text], { type: report.ext === 'json' ? 'application/json' : 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ccna-${report.key}-${todayStr()}.${report.ext}`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="ccna-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div className="ccna-sheet" style={{ ...styles.card, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px 16px 0 0', marginBottom: 0 }} onClick={e => e.stopPropagation()}>
        <h2 style={styles.h2}>Export Reports</h2>
        <p style={{ ...styles.small, marginBottom: 12 }}>All reports are generated locally from your saved data — no API, works offline.</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {REPORTS.map(r => {
            const active = r.key === selected
            return (
              <button
                key={r.key}
                onClick={() => setSelected(r.key)}
                title={r.desc}
                style={{
                  flex: '1 1 auto', minHeight: 40, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                  background: active ? COLORS.purpleDim : COLORS.surface,
                  border: `1px solid ${active ? COLORS.purpleGlow : COLORS.border}`,
                  color: active ? COLORS.purpleGlow : COLORS.silverMid,
                  fontSize: 12, fontWeight: 600, padding: '8px 10px', whiteSpace: 'nowrap',
                }}
              >{r.label}</button>
            )
          })}
        </div>

        <div style={{ ...styles.small, marginBottom: 6, color: COLORS.silverMid }}>{report.desc}</div>
        {!ctx ? (
          <Spinner label="Building report..." />
        ) : (
          <textarea
            readOnly
            value={text}
            style={{ ...styles.input, height: 260, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12, resize: 'vertical', whiteSpace: 'pre' }}
          />
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button style={styles.primaryBtn} onClick={copy} disabled={!ctx}>{copied ? 'Copied!' : 'Copy'}</button>
          <button style={styles.secondaryBtn} onClick={download} disabled={!ctx}>Download .{report.ext}</button>
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 14, paddingTop: 12 }}>
          <div style={{ ...styles.small, marginBottom: 6 }}>Restore from a backup — import a “Raw Data (JSON)” export. Your current data is merged in, never overwritten.</div>
          <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={handleFile} />
          <button style={styles.secondaryBtn} onClick={() => fileRef.current?.click()}>Import data (.json)</button>
          {importMsg && <div style={{ ...styles.small, marginTop: 6, color: importMsg.includes('✓') ? COLORS.mint : COLORS.rose }}>{importMsg}</div>}
        </div>

        <button style={{ ...styles.secondaryBtn, marginTop: 12, background: 'none', border: 'none', color: COLORS.silverMid }} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

/* =========================================================================
   SYNC MODAL — link devices with a shareable code
   ========================================================================= */
function SyncModal({ syncCode, lastSynced, busy, msg, online, onGenerate, onLink, onSyncNow, onUnlink, onClose }) {
  const [entry, setEntry] = useState('')
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    try { await navigator.clipboard.writeText(syncCode); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { setCopied(false) }
  }

  return (
    <div className="ccna-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div className="ccna-sheet" style={{ ...styles.card, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px 16px 0 0', marginBottom: 0 }} onClick={e => e.stopPropagation()}>
        <h2 style={styles.h2}>Cross-Device Sync</h2>
        <p style={{ ...styles.small, marginBottom: 12 }}>
          Sync progress, quiz banks, and CLI stats across your devices with one shared code. Your data merges — nothing is overwritten or lost.
        </p>

        {!online && (
          <div style={{ background: COLORS.roseDim, border: `1px solid ${COLORS.roseBorder}`, color: COLORS.rose, fontSize: 12, borderRadius: 10, padding: 10, marginBottom: 12 }}>
            You appear offline. Sync needs a connection (and only works on the deployed site, not local dev).
          </div>
        )}

        {syncCode ? (
          <>
            <div style={{ ...styles.small, marginBottom: 6 }}>Your sync code</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 16, letterSpacing: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '12px 14px', color: COLORS.sky }}>{syncCode}</div>
              <button style={{ ...styles.secondaryBtn, width: 'auto', padding: '0 16px' }} onClick={copyCode}>{copied ? 'Copied!' : 'Copy'}</button>
            </div>
            <p style={{ ...styles.small, marginBottom: 12 }}>On your other device: open Sync → “I have a code” → paste this. Then tap Sync now on both.</p>
            <button style={styles.primaryBtn} onClick={onSyncNow} disabled={busy || !online}>{busy ? 'Syncing…' : 'Sync now'}</button>
            <div style={{ ...styles.small, marginTop: 8, color: msg.includes('✓') ? COLORS.mint : COLORS.silverMid }}>
              {msg || (lastSynced ? `Last synced: ${new Date(lastSynced).toLocaleString()}` : 'Not synced yet.')}
            </div>
            <button style={{ ...styles.secondaryBtn, marginTop: 12, background: 'none', border: `1px solid ${COLORS.border}`, color: COLORS.silverMid }} onClick={onUnlink}>Unlink this device</button>
          </>
        ) : (
          <>
            <button style={styles.primaryBtn} onClick={onGenerate} disabled={!online}>Generate a sync code</button>
            <div style={{ textAlign: 'center', ...styles.small, margin: '12px 0' }}>— or —</div>
            <div style={{ ...styles.small, marginBottom: 6 }}>I have a code from another device</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={{ ...styles.input, flex: 1, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: 1 }}
                value={entry}
                onChange={e => setEntry(e.target.value.toUpperCase())}
                placeholder="ABCD-EFGH-JKLM-NPQR"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
              />
              <button style={{ ...styles.primaryBtn, width: 'auto', padding: '0 16px' }} onClick={() => entry.trim() && onLink(entry.trim())} disabled={!online || !entry.trim()}>Link</button>
            </div>
            {msg && <div style={{ ...styles.small, marginTop: 8, color: COLORS.rose }}>{msg}</div>}
          </>
        )}

        <button style={{ ...styles.secondaryBtn, marginTop: 12, background: 'none', border: 'none', color: COLORS.silverMid }} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

/* =========================================================================
   OFFLINE BANNER
   ========================================================================= */
function OfflineBanner() {
  return (
    <div style={{ background: COLORS.roseDim, borderBottom: `1px solid ${COLORS.roseBorder}`, color: COLORS.rose, fontSize: 13, textAlign: 'center', padding: '8px 12px' }}>
      Offline or API unreachable — AI explanations, quizzes & tutor chat won't work, but CLI drills and subnetting/VLSM practice still will.
    </div>
  )
}

/* =========================================================================
   AI TUTOR CHAT
   ========================================================================= */
// Builds the tutor's system prompt from the learner's ACTUAL recent behaviour
// (progress, ratings, missed bank, event log) rather than static numbers.
async function buildTutorSystemPrompt(progress, missed) {
  const summary = await buildLearnerSummary(progress, missed || [])
  const behaviour = summarizeForTutor(summary)

  return `You are a friendly, encouraging CCNA 200-301 tutor and study partner. The student originally failed the exam, weakest in Network Access and IP Connectivity, so keep those a priority when relevant.

Here is the student's CURRENT activity, computed from their actual study data:
${behaviour}

Use this to give specific, contextual advice — reference their weak objectives, recurring misses, and what they studied recently by name. When they ask "what should I study?", recommend from the weakest objectives and explain why. Keep answers conversational, encouraging, and focused on CCNA exam content. Ground technical explanations in standard CCNA 200-301 material. Keep responses reasonably concise (a few short paragraphs or a short list) unless the student asks for depth.

When you discuss a specific exam concept, end that part of your answer with the matching CCNA 200-301 exam topic number(s) in parentheses, e.g. "(exam topic 1.1)", so the student can open that objective's Explain tab and verify against the cited cert guide — don't invent numbers, only cite ones you're confident map to the official blueprint.`
}

function TutorChat({ progress, missed, onBack }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [restored, setRestored] = useState(false)
  const [streamingText, setStreamingText] = useState(null)
  const scrollRef = useRef(null)

  // Restore the conversation from a previous session, if any.
  useEffect(() => {
    (async () => {
      const saved = await window.storage.getItem(STORAGE_KEYS.tutorChat)
      if (saved && Array.isArray(saved) && saved.length) setMessages(saved)
      setRestored(true)
    })()
  }, [])

  // Persist after restore so we don't immediately overwrite saved history with [].
  useEffect(() => {
    if (!restored) return
    window.storage.setItem(STORAGE_KEYS.tutorChat, messages)
  }, [messages, restored])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading, streamingText])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setError(null)
    setStreamingText('')
    try {
      const system = await buildTutorSystemPrompt(progress, missed)
      let acc = ''
      const reply = await askClaudeStream({
        system: cachedSystem(system),
        messages: newMessages,
        max_tokens: 800,
        feature: 'tutor',
        onDelta: chunk => { acc += chunk; setStreamingText(acc) },
      })
      setMessages(m => [...m, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setStreamingText(null)
    }
  }

  function clearChat() {
    setMessages([])
    setError(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 32px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
        {messages.length > 0 && (
          <button style={{ ...styles.secondaryBtn, width: 'auto', minHeight: 36, padding: '6px 14px', fontSize: 12 }} onClick={clearChat}>Clear chat</button>
        )}
      </div>
      <h1 style={styles.h1}>AI Tutor Chat</h1>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', marginBottom: 10 }}>
        {messages.length === 0 && (
          <div style={{ ...styles.card, background: COLORS.skyDim, border: `1px solid ${COLORS.skyBorder}` }}>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              Hi! I know your scores and what you've mastered so far. Ask me anything — e.g. "Explain HSRP vs VRRP" or "What should I focus on this week?"
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            ...styles.card,
            background: m.role === 'user' ? COLORS.purpleDim : COLORS.skyDim,
            border: `1px solid ${m.role === 'user' ? COLORS.borderGlow : COLORS.skyBorder}`,
            whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.5,
          }}>
            <RichText text={m.content} />
          </div>
        ))}
        {loading && (
          streamingText ? (
            <div style={{ ...styles.card, background: COLORS.skyDim, border: `1px solid ${COLORS.skyBorder}`, whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.5 }}>
              <RichText text={streamingText} />
              <span className="ccna-pulse" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: COLORS.sky, marginLeft: 4 }} />
            </div>
          ) : (
            <Spinner label="Tutor is thinking..." />
          )
        )}
        {error && <ErrorBox message={error} onRetry={send} />}
        {messages.length > 0 && !loading && (
          <div style={{ fontSize: 11, color: COLORS.silverMid, lineHeight: 1.5, padding: '4px 2px' }}>
            Tutor answers are AI-generated study help. Verify exam objectives, command syntax, and key terms against the{' '}
            <a href={EXAM_SOURCES.blueprintUrl} target="_blank" rel="noreferrer" style={{ color: COLORS.sky, textDecoration: 'none' }}>{EXAM_SOURCES.examName} exam topics</a>
            {' '}and {EXAM_SOURCES.references.map(r => r.title).join(', ')} — open the matching objective's Explain tab for cited definitions.
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          style={{ ...styles.input, flex: 1 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send() }}
          placeholder="Ask the tutor..."
        />
        <button style={{ ...styles.primaryBtn, width: 'auto', padding: '12px 18px' }} onClick={send} disabled={loading}>Send</button>
      </div>
    </div>
  )
}

/* =========================================================================
   APP ROOT
   ========================================================================= */
export default function App() {
  const [view, setView] = useState('home') // home | objective | mock | missed | tutor | metrics
  const [selectedObjective, setSelectedObjective] = useState(null)
  const [progress, setProgress] = useState({})
  const [missed, setMissed] = useState([])
  const [streak, setStreak] = useState({ count: 0, lastStudyDate: null })
  const [apiOnline, setApiOnline] = useState(true)
  const [showExport, setShowExport] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [offlineReady, setOfflineReady] = useState(() => new Set())
  const [packagingId, setPackagingId] = useState(null) // objective id currently being packaged
  const [showSync, setShowSync] = useState(false)
  const [syncCode, setSyncCode] = useState(null)
  const [lastSynced, setLastSynced] = useState(null)
  const [syncBusy, setSyncBusy] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const [dueCount, setDueCount] = useState(0)
  const [theme, setTheme] = useState(() =>
    (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme')) || 'dark')

  // Flip the theme: update the root attribute (re-themes instantly via CSS
  // vars) and persist the choice. Available from a fixed control at all times.
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', next)
      window.storage.setItem(STORAGE_KEYS.theme, next)
      return next
    })
  }, [])

  useEffect(() => {
    (async () => {
      const [p, m, s, off, code, last, due] = await Promise.all([
        loadProgress(), loadMissed(), loadStreak(), loadOfflineReadyIds(),
        window.storage.getItem(STORAGE_KEYS.syncCode), window.storage.getItem(STORAGE_KEYS.syncLast),
        countDueQuestions(),
      ])
      setProgress(p)
      setMissed(m)
      setStreak(s)
      setOfflineReady(off)
      setSyncCode(code || null)
      setLastSynced(last || null)
      setDueCount(due)
      setLoaded(true)
      const updatedStreak = await bumpStreak()
      setStreak(updatedStreak)
    })()
  }, [])

  const refreshOffline = useCallback(async () => {
    setOfflineReady(await loadOfflineReadyIds())
  }, [])

  const refreshDue = useCallback(async () => {
    setDueCount(await countDueQuestions())
  }, [])

  // Recompute the due-review count whenever we land back on Home.
  useEffect(() => { if (view === 'home') refreshDue() }, [view, refreshDue])

  // Pull remote → merge with local → save → refresh UI → push merged back.
  // Deterministic and convergent, so it's safe to run on any device.
  const doSync = useCallback(async (code) => {
    const useCode = code || syncCode
    if (!useCode) return
    setSyncBusy(true); setSyncMsg('Syncing…')
    try {
      const local = await loadSyncBundle()
      const remote = await pullSync(useCode)
      const merged = mergeSyncData(local, remote || {})
      await saveSyncBundle(merged)
      setProgress(merged.progress)
      setMissed(merged.missed)
      setStreak(merged.streak)
      await pushSync(useCode, merged)
      const now = Date.now()
      await window.storage.setItem(STORAGE_KEYS.syncLast, now)
      setLastSynced(now)
      await refreshOffline()
      setSyncMsg('Synced ✓')
    } catch (e) {
      setSyncMsg(/failed to fetch/i.test(e.message) ? 'Could not reach the sync server (works on the deployed site only).' : e.message)
    } finally {
      setSyncBusy(false)
    }
  }, [syncCode, refreshOffline])

  const handleGenerateSync = useCallback(async () => {
    const code = generateSyncCode()
    await window.storage.setItem(STORAGE_KEYS.syncCode, code)
    setSyncCode(code)
    doSync(code)
  }, [doSync])

  const handleLinkSync = useCallback(async (code) => {
    await window.storage.setItem(STORAGE_KEYS.syncCode, code)
    setSyncCode(code)
    doSync(code)
  }, [doSync])

  const handleUnlinkSync = useCallback(async () => {
    await window.storage.removeItem(STORAGE_KEYS.syncCode)
    setSyncCode(null)
    setLastSynced(null)
    setSyncMsg('')
  }, [])

  // Restore a Raw Data export: merge it into local data (same safe merge as
  // sync — nothing is overwritten) and refresh the UI.
  const handleImport = useCallback(async (incoming) => {
    const local = await loadSyncBundle()
    const merged = mergeSyncData(local, incoming || {})
    await saveSyncBundle(merged)
    setProgress(merged.progress)
    setMissed(merged.missed)
    setStreak(merged.streak)
    await refreshOffline()
  }, [refreshOffline])

  // Auto-sync once on load if this device is already linked.
  useEffect(() => {
    if (loaded && syncCode) doSync(syncCode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded])

  // Pre-fetch every AI asset for a topic so it works offline. No-op when offline.
  // Returns true on success. Used both manually and automatically on mastery.
  const packageObjective = useCallback(async (objective) => {
    if (!apiOnline || !objective) return false
    if (offlineReady.has(objective.id)) return true
    setPackagingId(objective.id)
    try {
      await packageObjectiveOffline(objective)
      await refreshOffline()
      return true
    } catch {
      return false
    } finally {
      setPackagingId(null)
    }
  }, [apiOnline, offlineReady, refreshOffline])

  // Periodically check API reachability for the offline banner
  useEffect(() => {
    let cancelled = false
    async function check() {
      const online = await checkApiReachable()
      if (!cancelled) setApiOnline(online)
    }
    check()
    const id = setInterval(check, 60000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  const updateProgress = useCallback((objectiveId, patch) => {
    setProgress(prev => {
      const next = {
        ...prev,
        [objectiveId]: { status: 'unseen', quizScores: [], ...prev[objectiveId], ...patch },
      }
      saveProgress(next)
      return next
    })
  }, [])

  const handleMissed = useCallback((entry) => {
    setMissed(prev => {
      const next = [...prev, entry]
      saveMissed(next)
      return next
    })
  }, [])

  const removeMissed = useCallback((idx) => {
    setMissed(prev => {
      const next = prev.filter((_, i) => i !== idx)
      saveMissed(next)
      return next
    })
  }, [])

  function selectObjective(obj) {
    setSelectedObjective(obj)
    setView('objective')
  }

  if (!loaded) {
    return <div style={styles.page}><div style={styles.container}><Spinner label="Loading your progress..." /></div></div>
  }

  return (
    <div style={styles.page}>
      <style>{`
        ${THEME_CSS}
        * { -webkit-tap-highlight-color: transparent; }
        html { scroll-behavior: smooth; }
        body {
          background:
            radial-gradient(1100px 560px at 50% -12%, ${COLORS.glowA}, transparent 60%),
            radial-gradient(760px 460px at 100% 0%, ${COLORS.glowB}, transparent 55%),
            ${COLORS.bg};
          background-attachment: fixed;
          transition: background .25s ease;
        }
        button { transition: transform .12s ease, opacity .12s ease, box-shadow .12s ease; }
        button:active:not(:disabled) { transform: scale(0.97); }
        button:disabled { opacity: 0.5; cursor: default !important; }
        input:focus, textarea:focus { outline: none; box-shadow: 0 0 0 2px ${COLORS.focus}; }
        :focus-visible { outline: 2px solid ${COLORS.purpleGlow}; outline-offset: 2px; }
        * { scrollbar-width: thin; scrollbar-color: ${COLORS.silverDim} transparent; }
        *::-webkit-scrollbar { width: 8px; height: 8px; }
        *::-webkit-scrollbar-thumb { background: ${COLORS.silverDim}; border-radius: 8px; }
        *::-webkit-scrollbar-track { background: transparent; }
        .ccna-grad-text {
          background: linear-gradient(90deg, ${COLORS.purpleGlow}, ${COLORS.sky});
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        @media (hover: hover) {
          .ccna-hover { transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
          .ccna-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 30px #00000055; border-color: ${COLORS.borderGlow}; }
        }
        @keyframes ccna-shimmer { to { transform: translateX(100%); } }
        .ccna-shimmer { position: relative; overflow: hidden; }
        .ccna-shimmer::after {
          content:''; position:absolute; inset:0;
          background: linear-gradient(90deg, transparent, ${COLORS.shimmerLine}, transparent);
          transform: translateX(-100%); animation: ccna-shimmer 2.4s ease-in-out infinite;
        }
        @keyframes ccna-skel { to { background-position: -200% 0; } }
        .ccna-skeleton {
          background: linear-gradient(90deg, ${COLORS.card}, ${COLORS.cardHover}, ${COLORS.card});
          background-size: 200% 100%; animation: ccna-skel 1.3s ease-in-out infinite; border-radius: 8px;
        }
        @keyframes ccna-pulse { 0% { box-shadow: 0 0 0 0 currentColor; opacity:.7 } 100% { box-shadow: 0 0 0 10px transparent; opacity:1 } }
        .ccna-pulse { animation: ccna-pulse .45s ease-out; }
        @keyframes ccna-view-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .ccna-view { animation: ccna-view-in .28s ease both; }
        .ccna-stagger > * { animation: ccna-view-in .42s ease both; }
        ${[1,2,3,4,5,6,7,8].map(i => `.ccna-stagger > *:nth-child(${i}){animation-delay:${i*0.04}s}`).join('')}
        @keyframes ccna-overlay-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ccna-sheet-in { from { transform: translateY(100%); } to { transform: none; } }
        .ccna-overlay { animation: ccna-overlay-in .2s ease both; }
        .ccna-sheet { animation: ccna-sheet-in .3s cubic-bezier(.2,.8,.2,1) both; }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .ccna-view, .ccna-overlay, .ccna-sheet, .ccna-stagger > *, .ccna-shimmer::after, .ccna-skeleton, .ccna-pulse { animation: none; }
          button:active:not(:disabled) { transform: none; }
        }
      `}</style>
      <button
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        style={{
          position: 'fixed', top: 10, right: 12, zIndex: 200, width: 40, height: 40,
          borderRadius: 999, border: `1px solid ${COLORS.border}`, background: COLORS.card,
          color: COLORS.silver, fontSize: 18, cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px #00000033',
        }}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      {!apiOnline && <OfflineBanner />}
      <div style={styles.container}>
        <div className="ccna-view" key={view}>
        {view === 'home' && (
          <HomeScreen
            progress={progress}
            streak={streak}
            missed={missed}
            missedCount={missed.length}
            apiOnline={apiOnline}
            offlineReady={offlineReady}
            onSelectObjective={selectObjective}
            onOpenMock={() => setView('mock')}
            onOpenMissed={() => setView('missed')}
            onOpenTutor={() => setView('tutor')}
            onOpenExport={() => setShowExport(true)}
            onOpenMetrics={() => setView('metrics')}
            onOpenSync={() => setShowSync(true)}
            onOpenReview={() => setView('review')}
            dueCount={dueCount}
            syncOn={!!syncCode}
          />
        )}
        {view === 'objective' && selectedObjective && (
          <ObjectiveScreen
            objective={selectedObjective}
            progress={progress}
            apiOnline={apiOnline}
            offlineReady={offlineReady}
            packagingId={packagingId}
            onPackage={packageObjective}
            onBack={() => setView('home')}
            onUpdateProgress={updateProgress}
            onMissed={handleMissed}
            missed={missed}
          />
        )}
        {view === 'mock' && <MockExam onExit={() => setView('home')} />}
        {view === 'missed' && <MissedReview missed={missed} onBack={() => setView('home')} onRemove={removeMissed} />}
        {view === 'tutor' && <TutorChat progress={progress} missed={missed} onBack={() => setView('home')} />}
        {view === 'metrics' && <MetricsDashboard progress={progress} missed={missed} onBack={() => setView('home')} onSelectObjective={selectObjective} />}
        {view === 'review' && <ReviewSession onBack={() => setView('home')} onMissed={handleMissed} onDone={refreshDue} onOpenSection={selectObjective} />}
        </div>
      </div>
      {showExport && <ExportModal progress={progress} missed={missed} streak={streak} onImport={handleImport} onClose={() => setShowExport(false)} />}
      {showSync && (
        <SyncModal
          syncCode={syncCode}
          lastSynced={lastSynced}
          busy={syncBusy}
          msg={syncMsg}
          online={apiOnline}
          onGenerate={handleGenerateSync}
          onLink={handleLinkSync}
          onSyncNow={() => doSync()}
          onUnlink={handleUnlinkSync}
          onClose={() => setShowSync(false)}
        />
      )}
    </div>
  )
}
