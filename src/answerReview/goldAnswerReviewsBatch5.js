/** Gold reviews — Batch 5: scenario/sk/source depth toward 200 gold bar. */
export const BATCH5_GOLD = {
  '1.1-ts-device': {
    correct: {
      choiceIndex: 0,
      explanation: 'Layer 3 switches provide inter-VLAN routing at switching speed; hubs do not segment broadcasts.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'A hub repeats every frame to all ports — it cannot segment broadcast domains or route between VLANs at line rate as the stem requires.',
        misconceptionTested: 'Choosing a legacy L1 repeater for inter-VLAN routing',
      },
      {
        choiceIndex: 2,
        explanation: 'A WLC manages wireless APs and SSIDs — it does not replace a Layer 3 switch for wired VLAN segmentation and inter-VLAN forwarding.',
        misconceptionTested: 'Confusing wireless controller role with L3 switching',
      },
      {
        choiceIndex: 3,
        explanation: 'A cable modem terminates ISP broadband — it is not the campus device that segments VLANs and routes between them at switching speed.',
        misconceptionTested: 'Picking WAN CPE for branch LAN segmentation',
      },
    ],
    examTip: 'Inter-VLAN at line rate → **Layer 3 switch**. Hubs do not segment broadcasts.',
  },
  '1.10-ts-client': {
    correct: {
      choiceIndex: 0,
      explanation: 'APIPA means the client failed DHCP — check automatic addressing and that the DHCP client service is active.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'APIPA (169.254.x.x) appears when DHCP fails — manually setting a 169.254 gateway does not fix a client that never obtained a lease from DHCP.',
        misconceptionTested: 'Treating APIPA as a valid manual gateway fix',
      },
      {
        choiceIndex: 2,
        explanation: 'DNS suffix configuration on a router affects name resolution — it does not explain why the Windows client self-assigned a 169.254 APIPA address.',
        misconceptionTested: 'Blaming DNS when the symptom is DHCP failure',
      },
      {
        choiceIndex: 3,
        explanation: 'OSPF neighbor state is a routing protocol concern on routers — a Windows PC showing APIPA needs DHCP client troubleshooting, not OSPF.',
        misconceptionTested: 'Jumping to routing protocol checks on an APIPA host',
      },
    ],
    examTip: '**169.254.x.x (APIPA)** → DHCP failed. Verify client service and automatic IP first.',
  },
  '1.4-ts-cable': {
    correct: {
      choiceIndex: 0,
      explanation: 'Runts and CRC errors point to Layer 1/Layer 2 physical signaling problems, commonly bad cabling.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Speed mismatch can cause errors, but excessive runts and CRC counters on a flapping link strongly indicate damaged pairs or connectors — a physical Layer 1 problem.',
        misconceptionTested: 'Attributing CRC/runts to duplex/speed only',
      },
      {
        choiceIndex: 2,
        explanation: 'Duplicate IP addresses cause ARP conflicts and intermittent connectivity — they do not produce runt frames and CRC errors on the interface counters.',
        misconceptionTested: 'Mapping IP conflict symptoms to L1 frame errors',
      },
      {
        choiceIndex: 3,
        explanation: 'STP blocking puts a port into discarding — it does not cause up/down flapping with runt and CRC error counters climbing on the physical interface.',
        misconceptionTested: 'Blaming spanning-tree for physical CRC errors',
      },
    ],
    examTip: '**Runts + CRC errors** on a flapping link → bad cable/connector before IP or STP.',
  },
  '1.6-ts-overlap': {
    correct: {
      choiceIndex: 0,
      explanation: 'A /25 gateway does not align with /26 segments carved from the same block — hosts and SVI are in mismatched subnets.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Disabling `ip routing` would stop inter-VLAN routing entirely — the problem is the SVI mask (/25) splitting two /26 host ranges into different subnets than the PCs.',
        misconceptionTested: 'Disabling routing instead of fixing subnet alignment',
      },
      {
        choiceIndex: 2,
        explanation: 'The hosts already have correct /26 masks for their VLAN — widening to /24 would not fix the SVI using /25, which places the gateway in a different subnet boundary.',
        misconceptionTested: 'Changing host masks when the SVI prefix is wrong',
      },
      {
        choiceIndex: 3,
        explanation: 'Duplicate MAC addresses cause switching table instability — they do not explain why two /26 hosts cannot reach each other when the SVI is configured /25.',
        misconceptionTested: 'Blaming MAC duplication for subnet mismatch',
      },
    ],
    examTip: 'Hosts /26 but SVI /25 → **gateway in wrong subnet**. Align masks before routing tweaks.',
  },
  '1.9-ts-addrtype': {
    correct: {
      choiceIndex: 0,
      explanation: 'Link-local addresses (fe80::/10) are required per interface for neighbor discovery on the segment.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Unique local (fc00::/7) addresses are routable within an organization — they are not the mandatory per-link address used for IPv6 neighbor discovery on every interface.',
        misconceptionTested: 'Confusing ULA with link-local ND requirement',
      },
      {
        choiceIndex: 2,
        explanation: 'Global unicast (2000::/3) provides Internet-routable addressing — ND on the local segment always uses link-local fe80::/10, not global unicast.',
        misconceptionTested: 'Expecting global unicast for on-link ND',
      },
      {
        choiceIndex: 3,
        explanation: 'Anycast delivers to the nearest instance of an address — it is not the address type every host must have exactly one of for neighbor discovery on the local link.',
        misconceptionTested: 'Mixing anycast delivery with link-local ND',
      },
    ],
    examTip: 'IPv6 ND on every interface → **link-local fe80::/10**, not global or ULA.',
  },
  '2.3-sk-cdp-holdtime': {
    correct: {
      choiceIndex: 0,
      explanation: 'The hold-time (default 180 s) is how long a switch keeps a neighbor entry without hearing an update — three advertisement intervals of silence triggers removal.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'CDP does not purge a neighbor after one missed 60-second advertisement — the hold-time (180 s) must expire before the entry is removed.',
        misconceptionTested: 'Expecting immediate CDP neighbor timeout',
      },
      {
        choiceIndex: 2,
        explanation: 'A silent neighbor does not cause CDP to disable itself on the local interface — the entry simply ages out after the hold-time expires.',
        misconceptionTested: 'Believing CDP auto-disables on missed updates',
      },
      {
        choiceIndex: 3,
        explanation: 'The hold-time does not reset to match the 60-second advertisement interval — it stays at 180 seconds (three times the timer) until manually changed.',
        misconceptionTested: 'Confusing hold-time with advertisement interval',
      },
    ],
    examTip: 'CDP default: **advertise 60 s, hold-time 180 s** — three missed ads before removal.',
  },
  '2.3-sk-lldp-txrx': {
    correct: {
      choiceIndex: 0,
      explanation: 'Unlike CDP, IOS lets you disable LLDP transmit or receive independently per interface. Re-enabling lldp transmit (and lldp receive) on Gi0/1 restores neighbor discovery.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'LLDP operates independently of CDP — you do not need CDP enabled for LLDP neighbor discovery when `lldp run` is already active globally.',
        misconceptionTested: 'Assuming LLDP depends on CDP being enabled',
      },
      {
        choiceIndex: 2,
        explanation: 'LLDP works on switch ports as well as router interfaces — the stem shows a switch Gi0/1 with `lldp transmit` disabled, which blocks outbound LLDP on that port.',
        misconceptionTested: 'Believing LLDP is router-only',
      },
      {
        choiceIndex: 3,
        explanation: 'The problem is local TX disabled on Gi0/1 — removing `no lldp receive` on the neighbor would not fix a port that is not transmitting LLDP advertisements.',
        misconceptionTested: 'Fixing receive on peer when local transmit is off',
      },
    ],
    examTip: 'No LLDP neighbors with TX disabled → **`lldp transmit`** on that interface (LLDP is TX/RX independent).',
  },
  '2.4-sk-lacp-load': {
    correct: {
      choiceIndex: 0,
      explanation: 'show etherchannel load-balance reveals the hashing method (e.g., src-mac, dst-ip). The default is src-mac; port-channel load-balance changes it.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '`show interfaces port-channel 1 balance` is not valid IOS syntax — EtherChannel load-balancing method is displayed with `show etherchannel load-balance`.',
        misconceptionTested: 'Inventing a port-channel balance show command',
      },
      {
        choiceIndex: 2,
        explanation: '`show lacp counters` reports LACP PDU statistics — it does not reveal which hashing algorithm (src-mac, dst-ip, etc.) is used for load distribution.',
        misconceptionTested: 'Using LACP counters for load-balance method',
      },
      {
        choiceIndex: 3,
        explanation: '`show spanning-tree portchannel` displays STP state for the bundle — it has no information about EtherChannel load-balancing hash method.',
        misconceptionTested: 'Mixing STP port-channel output with load-balance',
      },
    ],
    examTip: 'EtherChannel hash method → **`show etherchannel load-balance`**, not LACP counters or STP.',
  },
  '2.4-sk-lacp-modes': {
    correct: {
      choiceIndex: 0,
      explanation: 'on forces the channel without any protocol; active/passive expect LACP PDUs. Mismatching on with active prevents the bundle from forming — both sides must use the same negotiation method (both on, or LACP on both).',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'LACP `active` expects LACP PDUs from the peer — `on` mode sends no LACP at all, so `active` cannot negotiate a channel with a statically forced `on` port.',
        misconceptionTested: 'Believing active negotiates with static on mode',
      },
      {
        choiceIndex: 2,
        explanation: 'LACP `active` does not fall back to static bundling when the peer uses `on` — protocol mismatch means no EtherChannel forms until both sides match.',
        misconceptionTested: 'Expecting LACP fallback to static on',
      },
      {
        choiceIndex: 3,
        explanation: 'Both sides do not need to be `active` — `active`/`passive` is a valid LACP pair. The failure here is `active` paired with `on`, not passive vs active.',
        misconceptionTested: 'Requiring both active when passive would work',
      },
    ],
    examTip: '**`on` + `active` = no bundle**. Match negotiation: both `on` or both LACP (active/passive).',
  },
  '2.6-sk-autonomous-vs-lightweight': {
    correct: {
      choiceIndex: 0,
      explanation: 'Autonomous APs run a full IOS image and are configured individually. Lightweight APs offload control-plane functions (config, firmware, RF management) to a WLC via CAPWAP — enabling centralized management at scale.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Both autonomous and lightweight APs can operate on 2.4 GHz and 5 GHz — the architectural difference is centralized WLC control vs standalone local configuration.',
        misconceptionTested: 'Equating lightweight APs with 2.4 GHz-only hardware',
      },
      {
        choiceIndex: 2,
        explanation: 'CAPWAP is used by lightweight APs to reach the WLC — autonomous APs are configured locally and do not depend on CAPWAP for control-plane offload.',
        misconceptionTested: 'Reversing which AP mode uses CAPWAP',
      },
      {
        choiceIndex: 3,
        explanation: 'Lightweight APs have thinner firmware because the WLC holds configuration and RF policy — they do not carry more flash for a full IOS image like autonomous APs.',
        misconceptionTested: 'Assuming lightweight APs store full IOS locally',
      },
    ],
    examTip: '**Autonomous** = local IOS config. **Lightweight** = WLC + CAPWAP centralized control.',
  },
  '2.6-sk-capwap-arch': {
    correct: {
      choiceIndex: 0,
      explanation: 'Split MAC splits 802.11 duties: the AP handles real-time RF functions (beacons, probes, ACKs, retransmissions). The WLC handles slower security, authentication, and mobility decisions — reducing AP complexity and enabling centralized policy.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Beacon transmission and probe responses are time-critical RF tasks handled at the AP — the WLC does not replace the AP for on-air frame transmission in split-MAC.',
        misconceptionTested: 'Moving beacon/probe duties to the WLC',
      },
      {
        choiceIndex: 2,
        explanation: 'Physical RF transmit and receive must occur at the antenna on the AP — the WLC is remote and cannot perform the actual 802.11 radio functions.',
        misconceptionTested: 'Expecting WLC to handle physical RF TX/RX',
      },
      {
        choiceIndex: 3,
        explanation: 'ACK and MAC-layer retransmissions are real-time duties kept on the lightweight AP — authentication and roaming policy are what move to the WLC in split-MAC.',
        misconceptionTested: 'Offloading MAC retransmissions to the WLC',
      },
    ],
    examTip: 'Split-MAC: **AP = RF real-time** (beacons, ACKs). **WLC = auth, roaming, policy**.',
  },
  '2.6-sk-local-vs-monitor': {
    correct: {
      choiceIndex: 0,
      explanation: 'Local (or connected) mode is the standard mode where an AP serves clients. Monitor mode dedicates the AP to passive RF scanning — ideal for IDS/rogue detection — but it cannot serve any client traffic.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Monitor mode does not serve any SSID — it passively scans channels for rogues. Local mode is the mode that serves client WLAN traffic.',
        misconceptionTested: 'Believing monitor mode still serves one SSID',
      },
      {
        choiceIndex: 2,
        explanation: 'Both local and monitor mode lightweight APs require a WLC — monitor is not an autonomous-only operating mode for client service.',
        misconceptionTested: 'Confusing monitor mode with autonomous operation',
      },
      {
        choiceIndex: 3,
        explanation: 'Mesh backhaul uses mesh AP modes — monitor mode is dedicated to RF scanning and rogue detection, not mesh point-to-point links.',
        misconceptionTested: 'Equating monitor mode with mesh backhaul',
      },
    ],
    examTip: '**Local mode** serves clients. **Monitor mode** scans only — no client associations.',
  },
  '2.7-sk-capwap-ports': {
    correct: {
      choiceIndex: 0,
      explanation: 'CAPWAP control channel (UDP 5246) carries AP configuration, firmware, and state messages. CAPWAP data channel (UDP 5247) tunnels 802.11 client data frames to the WLC in centralized mode. Firewalls between APs and the WLC must permit both ports.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'UDP 69 (TFTP) and UDP 161 (SNMP) are used for image download and management polling — CAPWAP tunnels use UDP 5246 for control and UDP 5247 for data between AP and WLC.',
        misconceptionTested: 'Confusing TFTP/SNMP ports with CAPWAP',
      },
      {
        choiceIndex: 2,
        explanation: 'UDP 4500 and UDP 500 are IKE/IPsec VPN ports — CAPWAP AP-to-WLC communication uses UDP 5246/5247, not ISAKMP or NAT-T.',
        misconceptionTested: 'Mapping VPN ports to CAPWAP channels',
      },
      {
        choiceIndex: 3,
        explanation: 'UDP 1812/1813 are RADIUS authentication and accounting — CAPWAP control/data channels are UDP 5246 and 5247, separate from AAA traffic.',
        misconceptionTested: 'Using RADIUS ports for CAPWAP tunneling',
      },
    ],
    examTip: 'CAPWAP firewall rule: permit **UDP 5246 (control)** and **UDP 5247 (data)**.',
  },
  '2.7-sk-poe': {
    correct: {
      choiceIndex: 0,
      explanation: 'PoE (802.3af) and PoE+ (802.3at) eliminate the need for a separate power outlet at each AP location. A single Cat5e/Cat6 cable from a PoE-capable switch delivers both data and power — simplifying physical installation especially in ceilings and walls.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'PoE delivers electrical power over Ethernet pairs — it does not double data throughput on the uplink to the access point.',
        misconceptionTested: 'Believing PoE increases Ethernet bandwidth',
      },
      {
        choiceIndex: 2,
        explanation: 'CAPWAP encryption is independent of PoE — power over Ethernet is a physical-layer convenience for mounting APs, not a requirement for tunnel security.',
        misconceptionTested: 'Linking CAPWAP encryption to PoE requirement',
      },
      {
        choiceIndex: 3,
        explanation: 'PoE vs PoE+ depends on AP power draw (dual-radio, external antennas), not on client count thresholds like 50 simultaneous associations.',
        misconceptionTested: 'Tying PoE+ requirement to client count',
      },
    ],
    examTip: 'PoE value: **one cable for data + power** at ceiling/wall AP mounts — not throughput.',
  },
  '2.8-sk-channel-overlap': {
    correct: {
      choiceIndex: 0,
      explanation: '2.4 GHz has only three non-overlapping channels: 1, 6, and 11 (in North America). Channel 8 overlaps both 6 and 11, causing co-channel and adjacent-channel interference. Move the third AP to channel 11.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Putting all three APs on the same 2.4 GHz channel creates heavy co-channel interference — the fix is using non-overlapping channels 1, 6, and 11, not one shared channel.',
        misconceptionTested: 'Using one channel to improve dense 2.4 GHz roaming',
      },
      {
        choiceIndex: 2,
        explanation: 'Three APs are normal in a dense office when placed on non-overlapping channels — the problem is channel 8 overlapping 6 and 11, not the AP count itself.',
        misconceptionTested: 'Removing APs instead of fixing channel plan',
      },
      {
        choiceIndex: 3,
        explanation: 'Channels 1 and 6 are non-overlapping in the 2.4 GHz plan — channel 8 is the outlier that overlaps both 6 and 11 and causes the intermittent drops.',
        misconceptionTested: 'Believing 1 and 6 cannot coexist in one area',
      },
    ],
    examTip: '2.4 GHz non-overlap: **1, 6, 11 only**. Channel 8 overlaps 6 and 11.',
  },
  '2.8-sk-wpa2-vs-wpa3': {
    correct: {
      choiceIndex: 0,
      explanation: 'WPA3-Personal uses SAE (Dragonfly handshake) which provides forward secrecy and eliminates offline brute-force of captured handshakes — WPA2-PSK 4-way handshakes can be captured and attacked offline.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'WPA3 still uses AES (CCMP/GCMP) for encryption — it replaces the WPA2-PSK 4-way handshake with SAE, not TKIP, which is deprecated and insecure.',
        misconceptionTested: 'Believing WPA3 reverts to TKIP encryption',
      },
      {
        choiceIndex: 2,
        explanation: 'WPA3-Personal (SAE) works without a RADIUS server — enterprise WPA3-Enterprise uses 802.1X, but personal mode is passphrase-based like WPA2-PSK.',
        misconceptionTested: 'Requiring RADIUS for WPA3-Personal',
      },
      {
        choiceIndex: 3,
        explanation: 'WPA3-Personal still uses a passphrase via SAE — it strengthens the handshake against offline attacks but does not eliminate the need for a shared key.',
        misconceptionTested: 'Expecting certificate-only auth in WPA3-Personal',
      },
    ],
    examTip: 'WPA3-Personal upgrade: **SAE handshake** stops offline PSK brute-force — still uses AES.',
  },
  '3.1-sk-ad-bracket': {
    correct: {
      choiceIndex: 1,
      explanation: 'The bracket is always [AD/metric]. 110 is OSPF administrative distance; 20 is the OSPF path cost.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'The OSPF metric (cost) is the second number in the bracket — 20 is the path cost; 110 is the administrative distance that precedes it.',
        misconceptionTested: 'Swapping AD with OSPF metric in brackets',
      },
      {
        choiceIndex: 2,
        explanation: 'Hop count is RIP\'s metric — OSPF uses cumulative interface cost, shown as the second bracket value (20), not hop count.',
        misconceptionTested: 'Reading hop count into OSPF route brackets',
      },
      {
        choiceIndex: 3,
        explanation: 'Bandwidth in Mbps is not displayed in the [110/20] bracket — 110 is administrative distance and 20 is OSPF cost derived from interface bandwidth.',
        misconceptionTested: 'Interpreting bracket as bandwidth value',
      },
    ],
    examTip: '`show ip route` bracket = **[AD/metric]**. OSPF AD is **110**; cost follows the slash.',
  },
  '3.1-sk-c-vs-l': {
    correct: {
      choiceIndex: 0,
      explanation: 'C 192.168.1.0/24 matches any host in the subnet. L 192.168.1.1/32 is the router\'s own address — used to receive traffic sent directly to R1.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'C and L are not primary/backup paths — C is the connected subnet route and L is the host-specific /32 for the router\'s own interface IP.',
        misconceptionTested: 'Treating C/L as failover route preference',
      },
      {
        choiceIndex: 2,
        explanation: 'Both C and L entries are IPv4 connected routes in `show ip route` — L is not an IPv6 link-local route code.',
        misconceptionTested: 'Mapping L code to IPv6 link-local',
      },
      {
        choiceIndex: 3,
        explanation: 'C and L are automatically installed connected routes — neither is a dynamic protocol route or a manually configured static route.',
        misconceptionTested: 'Labeling C dynamic and L static',
      },
    ],
    examTip: '**C** = connected subnet (/24). **L** = local host /32 for the router\'s own IP.',
  },
  '3.1-sk-local-route': {
    correct: {
      choiceIndex: 1,
      explanation: 'L = local. IOS automatically installs a /32 host route for each interface IP so the router can receive packets addressed directly to it.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'LISP uses different route codes — the L code in `show ip route` is a /32 local host route for the router\'s own interface address.',
        misconceptionTested: 'Confusing L route code with LISP',
      },
      {
        choiceIndex: 2,
        explanation: 'LACP is a Layer 2 bundling protocol — the L routing code has nothing to do with EtherChannel or switch port aggregation.',
        misconceptionTested: 'Associating L code with LACP Layer 2',
      },
      {
        choiceIndex: 3,
        explanation: 'Link-local IPv6 addresses use fe80::/10 on interfaces — the L code in the IPv4 routing table is a /32 host route for the router itself.',
        misconceptionTested: 'Mixing IPv6 link-local with L route code',
      },
    ],
    examTip: 'Route code **L** = **local /32** for the router\'s own interface IP address.',
  },
  '3.5-ts-vip-unreachable': {
    correct: {
      choiceIndex: 0,
      explanation: 'Hosts ARP for the virtual IP; the Active router must have the VIP configured on the LAN interface and respond with the HSRP virtual MAC (0000.0c07.acxx).',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'GLBP and HSRP are separate FHRP protocols — disabling GLBP does not fix incomplete ARP for an HSRP VIP when `standby 1 ip` or virtual MAC response is missing.',
        misconceptionTested: 'Blaming GLBP for an HSRP VIP ARP failure',
      },
      {
        choiceIndex: 2,
        explanation: 'Shortening the HSRP hello interval changes failover timing — it does not make the Active router respond to ARP for 10.1.1.1 when PCs show incomplete ARP.',
        misconceptionTested: 'Tuning hello timers instead of VIP/ARP config',
      },
      {
        choiceIndex: 3,
        explanation: 'HSRP VIP must live on the LAN SVI where hosts reside — moving the VIP to a loopback alone does not provide L2 ARP response on the segment PCs use.',
        misconceptionTested: 'Placing HSRP VIP on loopback for LAN hosts',
      },
    ],
    examTip: 'Incomplete ARP for HSRP VIP → verify **`standby ip` on LAN SVI** and virtual MAC response.',
  },
  '4.3-sk-dhcp-dora': {
    correct: {
      choiceIndex: 0,
      explanation: 'DORA: Client broadcasts Discover → server unicasts/broadcasts Offer → client broadcasts Request (choosing the offer) → server sends Acknowledge confirming the lease. Understanding this flow is essential for troubleshooting DHCP failures.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '"Define, Obtain, Reserve, Assign" is not the DHCP client-server exchange — DORA specifically maps to Discover, Offer, Request, and Acknowledge messages.',
        misconceptionTested: 'Inventing alternate DORA word definitions',
      },
      {
        choiceIndex: 2,
        explanation: 'Release is a separate DHCP message sent when a client gives up a lease — it is not part of the initial DORA acquisition sequence.',
        misconceptionTested: 'Including Release in the DORA lease acquisition',
      },
      {
        choiceIndex: 3,
        explanation: '"Dynamic, On-demand, Routed, Allocated" does not describe the four DHCP messages — DORA refers to the Discover/Offer/Request/Acknowledge packet flow.',
        misconceptionTested: 'Expanding DORA as generic address terminology',
      },
    ],
    examTip: 'DHCP **DORA**: **Discover → Offer → Request → Acknowledge** — Release is separate.',
  },
  '4.3-sk-dhcp-relay': {
    correct: {
      choiceIndex: 0,
      explanation: 'ip helper-address on the SVI converts client broadcast DHCP Discover messages into unicast packets forwarded to the DHCP server. Without it, broadcasts never leave the local subnet. The command is placed on the interface closest to the client, not the server.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '`ip dhcp relay` is not valid IOS syntax — the correct command on interface Vlan20 is `ip helper-address 10.0.0.5` to forward DHCP broadcasts to the remote server.',
        misconceptionTested: 'Using nonexistent ip dhcp relay command',
      },
      {
        choiceIndex: 2,
        explanation: '`ip dhcp-server` is not a global IOS command for relay — DHCP relay is configured per-client-facing interface with `ip helper-address`.',
        misconceptionTested: 'Configuring relay globally with dhcp-server',
      },
      {
        choiceIndex: 3,
        explanation: '`ip dhcp pool VLAN20` defines a local DHCP scope on the router — it does not relay client broadcasts to an external server at 10.0.0.5 on another subnet.',
        misconceptionTested: 'Creating a local pool instead of relay helper',
      },
    ],
    examTip: 'Remote DHCP server → **`ip helper-address <server>`** on the client-facing SVI.',
  },
  '4.3-sk-dns-record': {
    correct: {
      choiceIndex: 0,
      explanation: 'A records map hostnames to IPv4 addresses; AAAA records map to IPv6. MX is for mail routing, PTR for reverse lookup (IP→name), and CNAME creates aliases that ultimately resolve to an A/AAAA record.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'MX records point to mail exchangers for a domain — they do not provide the forward hostname-to-IP mapping that lets a browser resolve www.example.com.',
        misconceptionTested: 'Using MX for forward hostname resolution',
      },
      {
        choiceIndex: 2,
        explanation: 'PTR records perform reverse DNS (IP to name) — the browser needs a forward A or AAAA record to resolve a hostname to an IP address.',
        misconceptionTested: 'Confusing PTR reverse lookup with forward A record',
      },
      {
        choiceIndex: 3,
        explanation: 'CNAME creates an alias to another hostname — it does not directly hold the IP; resolution still requires the target\'s A or AAAA record.',
        misconceptionTested: 'Picking CNAME when direct A/AAAA mapping is needed',
      },
    ],
    examTip: 'Hostname → IP: **A record (IPv4)** or **AAAA (IPv6)**. MX/PTR/CNAME serve other roles.',
  },
  '4.5-ts-syslog': {
    correct: {
      choiceIndex: 0,
      explanation: 'Severity 4 = warnings; many deployments log ≥4 to syslog while filtering noisy debug (7).',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Level 7 (Debug) captures every diagnostic message — it is far more verbose than warnings and would flood the syslog server with debug lines the stem wants to avoid.',
        misconceptionTested: 'Selecting debug level for warning-only forwarding',
      },
      {
        choiceIndex: 2,
        explanation: 'Level 0 (Emergency) only captures the most critical system-down events — it would miss warning-level interface bounce messages at severity 4.',
        misconceptionTested: 'Using emergency-only threshold for warnings',
      },
      {
        choiceIndex: 3,
        explanation: 'Level 2 (Critical) is below warnings in the syslog scale — severity 4 (Warning) is the level that captures warning events, not critical-only filtering.',
        misconceptionTested: 'Confusing critical (2) with warning (4) severity',
      },
    ],
    examTip: 'Syslog **Warning = severity 4**. Default remote logging often uses **≥4**, not debug (7).',
  },
  '4.7-sk-af-drop': {
    correct: {
      choiceIndex: 0,
      explanation: 'In AFxy, x = class (1–4, higher = more preferred class) and y = drop precedence (1–3, higher = dropped sooner under congestion). AF32 (drop precedence 2) is dropped more aggressively than AF31 (drop precedence 1) within the same class 3.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'The first digit (class) indicates forwarding preference — the third digit (drop precedence) determines drop order within the same class, and AF32\'s higher y means more aggressive drop than AF31.',
        misconceptionTested: 'Reversing AF class vs drop-precedence meaning',
      },
      {
        choiceIndex: 2,
        explanation: 'AF31 and AF32 are both class 3 — AF31 is not dropped first because "class 3 is lower than class 4"; within class 3, AF32 (y=2) drops before AF31 (y=1).',
        misconceptionTested: 'Comparing AF class numbers across different classes',
      },
      {
        choiceIndex: 3,
        explanation: 'AF markings do have differentiated drop precedence via the second digit — saying all AF packets drop equally ignores the y value that sets drop priority within each class.',
        misconceptionTested: 'Believing all AF PHBs share identical drop probability',
      },
    ],
    examTip: 'AFxy: **x = class**, **y = drop precedence** (higher y = dropped sooner). AF32 drops before AF31.',
  },
  '4.7-sk-classification': {
    correct: {
      choiceIndex: 0,
      explanation: 'Mark traffic at ingress (access switch or first trusted boundary) so all downstream devices can apply PHB based on the DSCP mark without re-classifying. Re-marking deep in the network wastes CPU and misses early queuing decisions.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Marking only at the WAN edge means upstream hops cannot queue based on DSCP — classification should happen closest to the traffic source at the access layer.',
        misconceptionTested: 'Delaying classification until WAN egress',
      },
      {
        choiceIndex: 2,
        explanation: 'The core has abundant bandwidth but traffic is already mixed — marking at the core is too late to trust edge classification and misses access-layer queuing.',
        misconceptionTested: 'Classifying at high-bandwidth core instead of edge',
      },
      {
        choiceIndex: 3,
        explanation: 'The destination device receives traffic after QoS decisions are needed — marking must occur on ingress before congestion points, not at the receiver.',
        misconceptionTested: 'Marking at destination after transit',
      },
    ],
    examTip: 'QoS marking: **as close to the source as possible** (access layer / first trusted hop).',
  },
  '4.7-sk-dscp-ef': {
    correct: {
      choiceIndex: 0,
      explanation: 'EF (Expedited Forwarding) uses DSCP 46 (binary 101110). It maps to IP Precedence 5 and receives priority queuing for low-latency, low-jitter treatment — the correct marking for VoIP RTP streams.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'DSCP 40 is AF42 (Assured Forwarding class 4, drop precedence 2) — VoIP voice traffic uses EF at DSCP 46 for strict priority queuing, not AF42.',
        misconceptionTested: 'Confusing AF42 (40) with EF (46) for voice',
      },
      {
        choiceIndex: 2,
        explanation: 'DSCP 34 maps to AF41 — it is an Assured Forwarding PHB, not Expedited Forwarding. EF for VoIP is specifically DSCP 46.',
        misconceptionTested: 'Using AF41 (34) instead of EF for VoIP',
      },
      {
        choiceIndex: 3,
        explanation: 'DSCP 0 is Best Effort (default) — it provides no priority treatment. VoIP RTP should be marked EF (46) for low-latency queuing.',
        misconceptionTested: 'Leaving voice at default Best Effort DSCP 0',
      },
    ],
    examTip: 'VoIP RTP marking: **DSCP EF = 46** (not 40, 34, or 0 Best Effort).',
  },
  '4.7-sk-priority-starvation': {
    correct: {
      choiceIndex: 0,
      explanation: 'Priority (LLQ/PQ) queues are serviced first — if they never empty, other queues starve. The fix is to police voice to a defined rate (e.g., 128 kbps) so bursts cannot monopolize bandwidth while still getting the lowest delay.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Congestion collapse is a TCP-wide throughput collapse phenomenon — bulk data stopping completely during voice bursts in a strict priority queue is queue starvation, fixed by policing the priority queue.',
        misconceptionTested: 'Labeling LLQ starvation as congestion collapse',
      },
      {
        choiceIndex: 2,
        explanation: 'WRED applies to non-priority queues to drop TCP early — it is not used on the strict priority (LLQ) voice queue and does not fix priority-induced starvation.',
        misconceptionTested: 'Applying WRED to the strict priority queue',
      },
      {
        choiceIndex: 3,
        explanation: 'Head-of-line blocking occurs in FIFO queues when a large packet delays smaller ones — the voice-burst scenario is priority starvation from an unpoliced LLQ, not HOL blocking.',
        misconceptionTested: 'Confusing HOL blocking with LLQ starvation',
      },
    ],
    examTip: 'LLQ voice starving data → **police the priority queue** to a max bandwidth cap.',
  },
  '4.9-sk-ftp-auth': {
    correct: {
      choiceIndex: 0,
      explanation: 'TFTP has no authentication mechanism — it is open by design. FTP requires username and password. SCP (Secure Copy) uses SSH credentials for encrypted, authenticated transfer. On Cisco IOS: copy ftp://user:pass@server/image.bin flash:',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'TFTP has no username keyword or authentication support — a server requiring credentials needs FTP or SCP, not TFTP with extra keywords.',
        misconceptionTested: 'Believing TFTP supports username authentication',
      },
      {
        choiceIndex: 2,
        explanation: 'HTTP PUT may support auth in some implementations, but Cisco IOS image copy for authenticated transfer uses FTP or SCP — not unauthenticated HTTP PUT.',
        misconceptionTested: 'Using HTTP PUT for authenticated IOS image copy',
      },
      {
        choiceIndex: 3,
        explanation: 'SNMP manages devices and MIB objects — it is not a file transfer protocol for copying IOS images with username/password authentication.',
        misconceptionTested: 'Using SNMP write for authenticated file transfer',
      },
    ],
    examTip: 'Authenticated IOS copy → **FTP or SCP**. TFTP has **no authentication**.',
  },
  '4.9-sk-ftp-modes': {
    correct: {
      choiceIndex: 0,
      explanation: 'In active FTP, the server initiates the data connection back to the client — problematic through NAT/firewalls that block unsolicited inbound connections. In passive FTP, the client initiates both control (port 21) and data connections, working naturally with NAT.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Passive FTP still uses TCP for both control and data channels — it does not switch to UDP, and NAT friendliness comes from the client initiating all connections.',
        misconceptionTested: 'Believing passive FTP uses UDP through NAT',
      },
      {
        choiceIndex: 2,
        explanation: 'Port 21 is always the FTP control channel — in passive mode the server advertises a random high port for data, not port 21 for the data transfer itself.',
        misconceptionTested: 'Expecting data channel on port 21 in passive mode',
      },
      {
        choiceIndex: 3,
        explanation: 'Passive mode does not encrypt the data channel — it changes connection direction so the client connects inbound to the server\'s data port, fixing NAT traversal without encryption.',
        misconceptionTested: 'Assuming passive mode adds data-channel encryption',
      },
    ],
    examTip: 'FTP behind NAT: **passive mode** — client initiates both control and data TCP connections.',
  },
  '4.9-sk-ios-copy': {
    correct: {
      choiceIndex: 0,
      explanation: 'The IOS copy command syntax is copy <source> <destination>. For TFTP to flash: copy tftp: flash: (IOS prompts for server and filename) or the inline URL form shown. Reversing source/destination would copy FROM flash TO the TFTP server — a backup, not an upgrade.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '`copy flash: tftp://...` reverses source and destination — that uploads the image from flash to the TFTP server (backup), not downloading the new image into flash.',
        misconceptionTested: 'Reversing copy source/destination for upgrade',
      },
      {
        choiceIndex: 2,
        explanation: '`download tftp` is not valid Cisco IOS syntax — image transfers use `copy tftp: flash:` or the URL form with TFTP as source and flash as destination.',
        misconceptionTested: 'Using nonexistent download tftp command',
      },
      {
        choiceIndex: 3,
        explanation: '`transfer ios tftp` is not a recognized IOS command — the standard syntax is `copy <source> <destination>` with tftp as source and flash as destination.',
        misconceptionTested: 'Inventing transfer ios syntax for TFTP copy',
      },
    ],
    examTip: 'IOS upgrade: **`copy tftp: flash:`** (TFTP = source). Reversed = backup to server.',
  },
  '4.9-sk-tftp-port': {
    correct: {
      choiceIndex: 0,
      explanation: 'TFTP uses UDP (not TCP) on port 69. UDP is used for simplicity and low overhead — TFTP implements its own basic reliability with acknowledgments. The lack of TCP means no connection setup or encryption, which is why TFTP is only appropriate on trusted LAN segments.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'TCP port 21 is FTP control — TFTP uses connectionless UDP on port 69, not TCP port 21.',
        misconceptionTested: 'Confusing FTP TCP port 21 with TFTP',
      },
      {
        choiceIndex: 2,
        explanation: 'TFTP does use port 69, but it runs over UDP — TCP port 69 is incorrect because TFTP is not a TCP-based protocol.',
        misconceptionTested: 'Getting port right but transport wrong (TCP 69)',
      },
      {
        choiceIndex: 3,
        explanation: 'UDP port 21 is not assigned to TFTP — TFTP\'s well-known port is UDP 69; UDP 21 has no standard TFTP role.',
        misconceptionTested: 'Swapping TFTP port 69 with UDP 21',
      },
    ],
    examTip: 'TFTP = **UDP port 69**. Not TCP, not port 21 (that is FTP control).',
  },
  '5.2-sk-phishing': {
    correct: {
      choiceIndex: 0,
      explanation: 'Phishing is the most common social engineering attack vector. Unlike technical exploits, it targets people. Security awareness training is the primary countermeasure — technical controls alone (spam filters, MFA) reduce but cannot eliminate risk.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Denial of Service floods network resources to cause outages — it does not use deceptive emails appearing legitimate to steal credentials from individual users.',
        misconceptionTested: 'Confusing volumetric DoS with credential-stealing email',
      },
      {
        choiceIndex: 2,
        explanation: 'Man-in-the-middle intercepts traffic between parties on the network — phishing specifically targets users via deceptive email, not inline packet interception.',
        misconceptionTested: 'Equating MITM interception with email social engineering',
      },
      {
        choiceIndex: 3,
        explanation: 'SQL injection inserts malicious commands into web application database queries — it does not involve sending deceptive emails to trick users into revealing credentials.',
        misconceptionTested: 'Mixing web app SQLi with email-based phishing',
      },
    ],
    examTip: 'Deceptive email stealing credentials → **phishing** (social engineering, not DoS/MITM/SQLi).',
  },
  '5.2-sk-policy-elements': {
    correct: {
      choiceIndex: 0,
      explanation: 'Security programs include written policies (AUP, data classification, password) and procedures (Incident Response Plan). The AUP defines what users may do; the IRP provides the step-by-step response to violations. Technical controls enforce policy, but the written documents define the legal and operational framework.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Spanning-tree configuration prevents Layer 2 loops — it does not define organizational response procedures or consequences for unauthorized software violations.',
        misconceptionTested: 'Citing STP config as security program documentation',
      },
      {
        choiceIndex: 2,
        explanation: 'NAT overload tables map inside local addresses to public IPs — they do not document acceptable use policies or incident response steps for security violations.',
        misconceptionTested: 'Confusing NAT state table with security policy docs',
      },
      {
        choiceIndex: 3,
        explanation: 'DHCP lease logs record IP assignments — they do not define the expected security response or consequences when an employee runs unauthorized software.',
        misconceptionTested: 'Using DHCP logs as incident response documentation',
      },
    ],
    examTip: 'Policy violation response → **AUP** (rules) + **IRP** (remediation steps), not STP/NAT/DHCP.',
  },
  '5.2-sk-siem': {
    correct: {
      choiceIndex: 0,
      explanation: 'A SIEM aggregates syslog, firewall, IDS/IPS, and AAA logs centrally, correlates events across sources, and triggers alerts. Individual firewalls and IPS sensors provide point-in-time protection but cannot detect multi-stage attacks spanning devices without a SIEM.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'An IPS blocks threats inline on one interface — it does not aggregate logs from multiple devices and correlate cross-source patterns like a SIEM does.',
        misconceptionTested: 'Equating per-interface IPS with centralized log correlation',
      },
      {
        choiceIndex: 2,
        explanation: 'An AAA server authenticates and authorizes users — it does not collect firewall, IDS, and syslog events from multiple devices for pattern-based alerting.',
        misconceptionTested: 'Using AAA server as log aggregation platform',
      },
      {
        choiceIndex: 3,
        explanation: 'A firewall ACL with implicit deny blocks traffic at one point — it does not correlate events across the network or generate alerts from multi-device log analysis.',
        misconceptionTested: 'Treating ACL deny-all as SIEM-equivalent monitoring',
      },
    ],
    examTip: 'Multi-device log correlation + alerts → **SIEM**, not IPS/AAA/ACL alone.',
  },
  '5.2-sk-vuln-vs-threat': {
    correct: {
      choiceIndex: 0,
      explanation: 'Risk = Threat × Vulnerability × Impact. A vulnerability (e.g., unpatched software) + a threat (e.g., exploit kit) = risk. Security programs reduce risk by patching vulnerabilities, monitoring for threats, and limiting impact through segmentation and controls.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'The definitions are reversed — a vulnerability is the weakness (unpatched software) and a threat is the potential event or actor that exploits it, not the other way around.',
        misconceptionTested: 'Swapping vulnerability and threat definitions',
      },
      {
        choiceIndex: 2,
        explanation: 'Risk, vulnerability, and threat are distinct — risk combines likelihood and impact of exploitation; vulnerability is not a synonym for risk, and threat is not the mitigation control.',
        misconceptionTested: 'Treating risk and vulnerability as interchangeable',
      },
      {
        choiceIndex: 3,
        explanation: 'A vulnerability is a weakness, not the attack itself — a threat actor exploits vulnerabilities, and patches (not VLANs alone) are mitigations that reduce risk.',
        misconceptionTested: 'Defining vulnerability as the attack and patch as threat',
      },
    ],
    examTip: '**Vulnerability** = weakness. **Threat** = potential exploit. **Risk** = likelihood × impact.',
  },
  '5.5-ts-placement': {
    correct: {
      choiceIndex: 0,
      explanation: 'Extended ACLs filtering server-bound traffic should be applied outbound toward the destination.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Adding `permit ip any any` above the deny defeats the security policy — the real issue is ACL placement inbound on Gi0/0 blocking return traffic instead of filtering outbound toward servers.',
        misconceptionTested: 'Opening ACL with permit any instead of relocating it',
      },
      {
        choiceIndex: 2,
        explanation: 'Standard ACLs filter only on source address and belong near the destination — converting to standard on Gi0/2 does not fix extended ACL placement blocking server return traffic inbound on Gi0/0.',
        misconceptionTested: 'Converting to standard ACL instead of fixing placement',
      },
      {
        choiceIndex: 3,
        explanation: 'Applying the same ACL inbound on both interfaces doubles the filtering problem — move the extended ACL outbound on Gi0/1 toward servers so return traffic is not blocked on the PC-facing interface.',
        misconceptionTested: 'Duplicating inbound ACL instead of outbound toward destination',
      },
    ],
    examTip: 'Extended ACL blocking server **return** traffic → move **outbound toward destination**, not inbound on source.',
  },
  '5.7-sk-authen-vs-author': {
    correct: {
      choiceIndex: 0,
      explanation: 'Authentication verifies identity (who you are). Authorization determines permissions (what you may do). Successfully logging in does not grant all command privileges — a TACACS+ authorization policy or privilege level must permit show running-config.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Authentication succeeded — the engineer logged in. Being denied `show running-config` is an authorization failure because the TACACS+ policy or privilege level does not permit that command.',
        misconceptionTested: 'Blaming authentication when login already succeeded',
      },
      {
        choiceIndex: 2,
        explanation: 'Accounting records what commands were attempted or executed — it does not block commands. The denial is authorization deciding the engineer lacks permission for show running-config.',
        misconceptionTested: 'Confusing accounting audit with command denial',
      },
      {
        choiceIndex: 3,
        explanation: 'Show commands are not universally permitted after login — AAA authorization or privilege levels can restrict which commands an authenticated user may execute.',
        misconceptionTested: 'Assuming all show commands allowed post-login',
      },
    ],
    examTip: 'Logged in but command denied → **authorization** failed, not authentication.',
  },
  '5.7-sk-local-fallback': {
    correct: {
      choiceIndex: 0,
      explanation: 'Method lists are tried in order: TACACS+ first, then local if the server is unreachable (not responding — not if authentication is explicitly rejected). This fallback ensures management access continues during AAA server outages — a critical design consideration.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'The method list includes `local` as fallback — when TACACS+ is unreachable (not responding), IOS tries the local username database rather than denying login immediately.',
        misconceptionTested: 'Denying login when AAA server is unreachable',
      },
      {
        choiceIndex: 2,
        explanation: 'RADIUS is not in this method list (`group tacacs+ local`) — unreachable TACACS+ falls back to local usernames, not to an unconfigured RADIUS server.',
        misconceptionTested: 'Expecting automatic RADIUS fallback',
      },
      {
        choiceIndex: 3,
        explanation: 'The enable secret is for privilege escalation, not login authentication fallback — the `local` keyword refers to the local username database defined with `username` commands.',
        misconceptionTested: 'Confusing enable secret with local auth fallback',
      },
    ],
    examTip: '`aaa authentication ... group tacacs+ local` → **local fallback** when TACACS+ unreachable.',
  },
  '5.7-sk-radius-vs-tacacs': {
    correct: {
      choiceIndex: 0,
      explanation: 'Key differences: TACACS+ uses TCP 49 and encrypts the entire packet body; RADIUS uses UDP 1812/1813 and encrypts only the password. TACACS+ separates AA&A fully, making per-command authorization granular — preferred for device administration. RADIUS combines authen+author, preferred for network access (802.1X, VPN).',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'The transport protocols are reversed — RADIUS uses UDP 1812/1813, while TACACS+ uses TCP port 49 for reliable device administration AAA.',
        misconceptionTested: 'Swapping RADIUS/TACACS+ transport protocols',
      },
      {
        choiceIndex: 2,
        explanation: 'TACACS+ encrypts the entire packet body for confidentiality — RADIUS encrypts only the password field, leaving other attributes visible.',
        misconceptionTested: 'Reversing which protocol encrypts the full packet',
      },
      {
        choiceIndex: 3,
        explanation: 'RADIUS and TACACS+ differ in transport, encryption scope, and AA&A separation — they are not interchangeable protocols differing only by vendor implementation.',
        misconceptionTested: 'Treating RADIUS and TACACS+ as identical protocols',
      },
    ],
    examTip: 'Device admin AAA → **TACACS+ (TCP 49, full encrypt, per-command)**. Network access → **RADIUS**.',
  },
  '5.9-scenario-vlan-map': {
    correct: {
      choiceIndex: 0,
      explanation: 'Each WLAN binds to a dynamic interface (VLAN). Wrong mapping places clients on the guest VLAN even with correct PSK.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'High transmit power affects coverage and cell size — it does not change which VLAN/subnet DHCP assigns when the WLAN is mapped to the wrong dynamic interface.',
        misconceptionTested: 'Blaming TX power for wrong VLAN DHCP assignment',
      },
      {
        choiceIndex: 2,
        explanation: 'An expired RADIUS shared secret would break 802.1X authentication — WPA2-PSK clients getting guest VLAN IPs indicates WLAN-to-VLAN interface mapping error, not RADIUS.',
        misconceptionTested: 'Suspecting RADIUS on a PSK VLAN mapping issue',
      },
      {
        choiceIndex: 3,
        explanation: 'A blocked CAPWAP control path would prevent AP join entirely — clients associating and getting guest IPs means CAPWAP works but the WLAN VLAN mapping is wrong.',
        misconceptionTested: 'Blaming CAPWAP when clients associate but get wrong subnet',
      },
    ],
    examTip: 'Correct SSID/PSK but **wrong IP subnet** → check **WLAN → dynamic interface/VLAN** mapping.',
  },
  '5.9-ts-psk-mismatch': {
    correct: {
      choiceIndex: 0,
      explanation: 'PSK mismatch is the #1 WPA2-Personal failure — verify the exact key on the WLAN matches what users enter.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'The WLAN uses WPA2-PSK — clients do not need WEP, which is deprecated and incompatible with the configured WPA2-Personal security policy.',
        misconceptionTested: 'Downgrading to WEP on a WPA2-PSK WLAN',
      },
      {
        choiceIndex: 2,
        explanation: '160 MHz channel width affects throughput and compatibility — it does not cause "incorrect password" errors when the PSK typed does not match the WLAN key.',
        misconceptionTested: 'Blaming channel width for PSK authentication failure',
      },
      {
        choiceIndex: 3,
        explanation: 'WPA2-Personal requires AES (CCMP) — disabling AES for TKIP-only would break the WLAN security profile, not fix a passphrase mismatch error.',
        misconceptionTested: 'Switching to TKIP-only to fix incorrect password',
      },
    ],
    examTip: '"Incorrect password" on WPA2-PSK → **PSK mismatch** on WLAN, not WEP/channel/AES swap.',
  },
  '6.1-scenario-idempotent': {
    correct: {
      choiceIndex: 0,
      explanation: 'Idempotent automation converges devices to desired state without duplicating config on re-run.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Spanning-tree root guard prevents a port from becoming a root port — it has nothing to do with an Ansible playbook producing no changes on a second run.',
        misconceptionTested: 'Confusing STP root guard with automation idempotency',
      },
      {
        choiceIndex: 2,
        explanation: 'NAT overload (PAT) maps many inside addresses to one public IP — it is unrelated to configuration management producing identical state on repeated playbook runs.',
        misconceptionTested: 'Mapping NAT overload to idempotent automation',
      },
      {
        choiceIndex: 3,
        explanation: 'HSRP preempt controls which router becomes active after recovery — it does not describe automation that safely re-runs without unintended duplicate configuration.',
        misconceptionTested: 'Using HSRP preempt as idempotency example',
      },
    ],
    examTip: 'Second playbook run, no drift → **idempotency**. Converge to desired state safely.',
  },
  'obj-2.3-source-q001': {
    correct: {
      choiceIndex: 1,
      explanation: 'LLDP is IEEE 802.1AB and provides standards-based neighbor discovery.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'CDP is Cisco proprietary — the stem asks for an IEEE standard protocol for neighbor identity and capabilities, which is LLDP (802.1AB), not CDP.',
        misconceptionTested: 'Picking Cisco-only CDP for IEEE standard requirement',
      },
      {
        choiceIndex: 2,
        explanation: '802.1b is not the IEEE neighbor discovery standard — LLDP is defined in IEEE 802.1AB for collecting neighbor device information.',
        misconceptionTested: 'Selecting nonexistent 802.1b as discovery standard',
      },
      {
        choiceIndex: 3,
        explanation: '802.1a is not LLDP — IEEE 802.1AB defines Link Layer Discovery Protocol for standards-based neighbor information exchange.',
        misconceptionTested: 'Confusing 802.1a with 802.1AB LLDP standard',
      },
    ],
    examTip: 'IEEE neighbor discovery standard → **LLDP (802.1AB)**, not Cisco CDP.',
  },
  'obj-2.3-source-q002': {
    correct: {
      choiceIndex: 3,
      explanation: 'no cdp run disables CDP globally.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '`cdp disable` is not valid IOS syntax — the global command to turn off CDP on the entire switch is `no cdp run` in global configuration mode.',
        misconceptionTested: 'Using invalid cdp disable global command',
      },
      {
        choiceIndex: 1,
        explanation: '`no cdp enable` under an interface disables CDP on that port only — the stem asks to turn off CDP on the whole switch, which requires global `no cdp run`.',
        misconceptionTested: 'Using per-interface disable for global CDP off',
      },
      {
        choiceIndex: 2,
        explanation: '`no cdp` alone is incomplete IOS syntax — the recognized global command is `no cdp run` to disable CDP switch-wide.',
        misconceptionTested: 'Using incomplete no cdp without run keyword',
      },
    ],
    examTip: 'Disable CDP globally → **`no cdp run`**. Per-port → **`no cdp enable`** on interface.',
  },
  'obj-2.3-source-q003': {
    correct: {
      choiceIndex: 1,
      explanation: 'CDP advertises every 60 seconds by default.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'CDP default timer is 60 seconds, not 30 — advertisements are sent once per minute unless changed with `cdp timer`.',
        misconceptionTested: 'Confusing 30-second interval with CDP default',
      },
      {
        choiceIndex: 2,
        explanation: '90 seconds is not the default CDP advertisement interval — IOS sends CDP updates every 60 seconds by default.',
        misconceptionTested: 'Selecting 90 seconds as CDP timer default',
      },
      {
        choiceIndex: 3,
        explanation: '180 seconds is the default CDP hold-time, not the advertisement interval — frames are sent every 60 seconds, and neighbors are held for 180 seconds of silence.',
        misconceptionTested: 'Confusing CDP hold-time (180 s) with timer (60 s)',
      },
    ],
    examTip: 'CDP defaults: **timer 60 s**, **hold-time 180 s** — do not swap them.',
  },
  'obj-2.3-source-q004': {
    correct: {
      choiceIndex: 2,
      explanation: 'CDP is Cisco proprietary neighbor discovery.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '802.1ab is the IEEE standard number for LLDP — the stem asks for the Cisco proprietary protocol, which is CDP.',
        misconceptionTested: 'Picking IEEE 802.1ab when Cisco proprietary asked',
      },
      {
        choiceIndex: 1,
        explanation: 'LLDP is the IEEE standards-based neighbor protocol — CDP is the Cisco proprietary equivalent that only works between Cisco devices.',
        misconceptionTested: 'Selecting LLDP for Cisco proprietary requirement',
      },
      {
        choiceIndex: 3,
        explanation: '802.1a is not Cisco CDP — CDP is Cisco\'s proprietary Layer 2 protocol for neighbor identity and capabilities discovery.',
        misconceptionTested: 'Confusing 802.1a standard with Cisco CDP',
      },
    ],
    examTip: 'Cisco proprietary neighbor discovery → **CDP**. Multivendor → **LLDP**.',
  },
  'obj-2.3-source-q005': {
    correct: {
      choiceIndex: 3,
      explanation: 'CDP holdtime defaults to 180 seconds.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '30 seconds is not the default CDP hold-time — IOS keeps neighbor entries for 180 seconds without updates before removing them.',
        misconceptionTested: 'Underestimating default CDP hold-time',
      },
      {
        choiceIndex: 1,
        explanation: '60 seconds is the default CDP advertisement timer, not the hold-time — entries persist for 180 seconds (three missed advertisements) before aging out.',
        misconceptionTested: 'Using advertisement timer as hold-time default',
      },
      {
        choiceIndex: 2,
        explanation: '90 seconds is not the default CDP hold-time — the factory default is 180 seconds, three times the 60-second advertisement interval.',
        misconceptionTested: 'Selecting 90 s as CDP hold-time default',
      },
    ],
    examTip: 'CDP **hold-time default = 180 s** (3× the 60 s advertisement timer).',
  },
  'obj-2.3-source-q006': {
    correct: {
      choiceIndex: 1,
      explanation: 'no cdp enable disables CDP on one interface.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '`cdp disable` in global config is invalid syntax — per-interface CDP shutdown uses `no cdp enable` under the specific interface, not a global `cdp disable`.',
        misconceptionTested: 'Using invalid global cdp disable for one interface',
      },
      {
        choiceIndex: 2,
        explanation: '`no cdp` in global config is incomplete — disabling CDP on a single interface requires interface-level `no cdp enable`, not an ambiguous global command.',
        misconceptionTested: 'Using incomplete global no cdp for per-interface off',
      },
      {
        choiceIndex: 3,
        explanation: '`no cdp run` under an interface is not valid — `no cdp run` is a global command; per-interface disable is `no cdp enable` in interface configuration mode.',
        misconceptionTested: 'Placing global no cdp run on interface',
      },
    ],
    examTip: 'CDP off **one interface** → **`no cdp enable`** under that interface.',
  },
  'obj-2.3-source-q007': {
    correct: {
      choiceIndex: 3,
      explanation: 'show cdp entry * gives detailed CDP neighbor information.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '`show cdp neighbors all` is not the IOS command that mirrors detail output — use `show cdp entry *` for the same detailed neighbor information.',
        misconceptionTested: 'Using nonexistent show cdp neighbors all',
      },
      {
        choiceIndex: 1,
        explanation: '`show cdp neighbors *` is invalid syntax — the asterisk wildcard for detailed entries belongs to `show cdp entry *`, not the neighbors summary command.',
        misconceptionTested: 'Appending wildcard to neighbors instead of entry',
      },
      {
        choiceIndex: 2,
        explanation: '`show cdp entries all` is not valid IOS syntax — the correct equivalent to `show cdp neighbors detail` is `show cdp entry *`.',
        misconceptionTested: 'Using plural entries all instead of entry *',
      },
    ],
    examTip: 'CDP detail equivalent → **`show cdp entry *`** (same output as neighbors detail).',
  },
}
