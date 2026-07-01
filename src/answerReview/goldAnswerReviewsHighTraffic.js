/** Gold reviews — high-traffic clean-bank questions (domains 2–6). */
export const HIGH_TRAFFIC_GOLD = {
  '3.2-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: '10.1.1.10 matches both prefixes, but /26 is longer (more specific) — longest prefix match selects the /26 via R3.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '/24 is less specific than /26 when both match the destination. Longest prefix match always wins before metric or AD.',
        misconceptionTested: 'Picking the shorter prefix when both match',
      },
      {
        choiceIndex: 2,
        explanation: 'Metric only breaks ties between routes to the same prefix learned the same way — it does not override longest prefix match.',
        misconceptionTested: 'Using metric before longest prefix match',
      },
      {
        choiceIndex: 3,
        explanation: 'ECMP load-balancing requires equal-cost routes to the same prefix — here two different prefix lengths compete, and LPM picks one.',
        misconceptionTested: 'Expecting load balance across different prefix lengths',
      },
    ],
    examTip: 'Forwarding order: **longest prefix match** first, then **lowest AD**, then **best metric**.',
  },
  '3.4-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'OSPF is a link-state IGP — routers flood LSAs and run SPF to build a synchronized topology map.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Distance-vector protocols (RIP, legacy EIGRP behavior) advertise routes to neighbors — OSPF exchanges link-state advertisements, not periodic route vectors.',
        misconceptionTested: 'Labeling OSPF as distance vector',
      },
      {
        choiceIndex: 2,
        explanation: 'Path-vector describes BGP between autonomous systems — OSPF is an interior gateway protocol within one AS.',
        misconceptionTested: 'Confusing IGP link-state with BGP path vector',
      },
      {
        choiceIndex: 3,
        explanation: 'Static routes are manually configured, not a dynamic routing protocol category — OSPF learns routes automatically.',
        misconceptionTested: 'Selecting static when asked for protocol type',
      },
    ],
    examTip: 'OSPF = **link-state** IGP (LSAs + SPF). RIP = distance vector. BGP = path vector.',
  },
  '4.1-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'NAT translates inside local (private) addresses to inside global (public) addresses so internal hosts reach the Internet.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Encryption protects confidentiality — NAT performs address translation, not cipher operations.',
        misconceptionTested: 'Equating NAT with encryption',
      },
      {
        choiceIndex: 2,
        explanation: 'Inter-VLAN routing uses a router or L3 switch — NAT maps addresses between private and public realms.',
        misconceptionTested: 'Using routing/VLAN logic for NAT purpose',
      },
      {
        choiceIndex: 3,
        explanation: 'DHCP assigns addresses dynamically — NAT rewrites source/destination IPs on packets crossing a boundary.',
        misconceptionTested: 'Confusing address assignment with address translation',
      },
    ],
    examTip: 'NAT fails silently without **inside/outside** — label interfaces before reading address types.',
  },
  '5.5-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'ACLs are evaluated top-down — the first matching line wins and processing stops.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'ACLs are not read bottom-up — order matters because an early permit or deny can block a later line from ever being reached.',
        misconceptionTested: 'Reversing ACL evaluation order',
      },
      {
        choiceIndex: 2,
        explanation: 'Cisco ACLs do not auto-sort by specificity — you must place more specific entries above general ones manually.',
        misconceptionTested: 'Expecting automatic most-specific-first sorting',
      },
      {
        choiceIndex: 3,
        explanation: 'ACL evaluation is deterministic top-down — not random or round-robin.',
        misconceptionTested: 'Guessing non-deterministic ACL behavior',
      },
    ],
    examTip: 'ACL: **first match wins**, implicit deny at end — order your lines deliberately.',
  },
  '3.2-c-q2': {
    correct: {
      choiceIndex: 1,
      explanation: 'When forwarding, longest prefix match picks the route; AD and metric matter when installing competing routes for the same prefix.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Metric does not come first — the router must find the best matching prefix before comparing metrics on equal routes.',
        misconceptionTested: 'Leading with metric instead of LPM',
      },
      {
        choiceIndex: 2,
        explanation: 'AD breaks ties between routes to the same prefix from different sources — it does not replace longest prefix match at forward time.',
        misconceptionTested: 'Putting AD ahead of longest prefix match',
      },
      {
        choiceIndex: 3,
        explanation: 'Longest prefix is first, but metric is not second at install time — AD decides between sources, then metric within one protocol.',
        misconceptionTested: 'Swapping AD and metric in the install order',
      },
    ],
    examTip: 'Forward: **LPM → AD → metric**. Do not swap LPM with either tie-breaker.',
  },
  '3.2-c-q12': {
    correct: {
      choiceIndex: 1,
      explanation: 'Default AD: connected 0, static 1, OSPF 110 — lower AD = more trusted when sources compete.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'OSPF (110) is least trusted of the three — connected (0) and static (1) beat OSPF when all offer the same prefix.',
        misconceptionTested: 'Ranking OSPF above connected/static',
      },
      {
        choiceIndex: 2,
        explanation: 'Static (1) is more trusted than OSPF but less than connected (0) — connected routes are always AD 0.',
        misconceptionTested: 'Placing static above connected',
      },
      {
        choiceIndex: 3,
        explanation: 'Connected beats static — connected AD is 0, static is 1. OSPF at 110 is last among these three.',
        misconceptionTested: 'Swapping connected and static trust order',
      },
    ],
    examTip: 'Memorize: **connected 0, static 1, OSPF 110** — compare AD between sources, metric within one protocol.',
  },
  '2.1-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'A VLAN segments a switch into separate Layer 2 broadcast domains — broadcasts stay within the VLAN.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Collision domains are separated by switches at half-duplex legacy hubs — VLANs define broadcast boundaries, not collision domains on modern full-duplex links.',
        misconceptionTested: 'Confusing broadcast domain with collision domain',
      },
      {
        choiceIndex: 2,
        explanation: 'A VLAN is logical software configuration — not a physical cable or port grouping by wiring alone.',
        misconceptionTested: 'Equating VLAN with physical media',
      },
      {
        choiceIndex: 3,
        explanation: 'Routing protocols operate at Layer 3 — VLANs are a Layer 2 segmentation feature.',
        misconceptionTested: 'Naming a routing protocol as VLAN definition',
      },
    ],
    examTip: 'Access port = **one VLAN**; a VLAN is a **logical broadcast domain**.',
  },
  '2.2-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'A trunk tags frames with 802.1Q VLAN IDs so multiple VLANs cross one inter-switch link.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Access ports carry a single VLAN untagged — trunks carry many VLANs with tags.',
        misconceptionTested: 'Describing access-port behavior on a trunk question',
      },
      {
        choiceIndex: 2,
        explanation: 'PC-to-switch links are access ports — trunks connect switches (or switch to router-on-a-stick).',
        misconceptionTested: 'Using end-host access link for trunk definition',
      },
      {
        choiceIndex: 3,
        explanation: 'Routing between VLANs needs a Layer 3 device — trunks extend Layer 2 VLANs across links, not route them.',
        misconceptionTested: 'Expecting trunk to route between VLANs',
      },
    ],
    examTip: 'Trunk = **802.1Q tags** on inter-switch links; **native VLAN must match** both ends.',
  },
  '2.5-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'STP blocks redundant Layer 2 paths so frames cannot loop endlessly through a switched topology.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Routing loops are a Layer 3 problem (TTL, routing protocol convergence) — STP operates at Layer 2 on switches.',
        misconceptionTested: 'Applying STP to Layer 3 routing loops',
      },
      {
        choiceIndex: 2,
        explanation: 'IP conflicts are addressed by DHCP snooping, DAI, or manual assignment — STP does not detect duplicate IPs.',
        misconceptionTested: 'Expecting STP to fix IP addressing conflicts',
      },
      {
        choiceIndex: 3,
        explanation: 'DNS resolution speed is unrelated — STP prevents broadcast/multicast storms from physical switching loops.',
        misconceptionTested: 'Dragging unrelated services into STP purpose',
      },
    ],
    examTip: 'STP: **blocking** prevents L2 loops — not “drop all user traffic” on a forwarding port.',
  },
  '2.1-c-q2': {
    correct: {
      choiceIndex: 1,
      explanation: 'VLAN 10 and VLAN 20 are separate broadcast domains — traffic between them must be routed by a router or Layer 3 switch.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Another switch alone extends the same VLANs — it does not provide Layer 3 routing between VLAN 10 and VLAN 20.',
        misconceptionTested: 'Adding L2 switch capacity instead of L3 routing',
      },
      {
        choiceIndex: 2,
        explanation: 'Cable length does not separate VLANs — the failure is missing inter-VLAN routing, not physical reach.',
        misconceptionTested: 'Blaming physical layer for inter-VLAN isolation',
      },
      {
        choiceIndex: 3,
        explanation: 'A trunk between hosts is not the fix — hosts use access ports; inter-VLAN traffic needs an SVI or router interface.',
        misconceptionTested: 'Trunking between end hosts instead of L3 routing',
      },
    ],
    examTip: 'Different VLANs on one campus switch → **SVI or router** for inter-VLAN routing.',
  },
  '3.1-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'In `show ip route`, O = OSPF-learned route. C = connected, S = static, D = EIGRP.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Connected routes show C (and L for local) — O is specifically OSPF, not directly connected subnets.',
        misconceptionTested: 'Confusing O with connected code',
      },
      {
        choiceIndex: 2,
        explanation: 'Static routes use S — O indicates the route was learned via OSPF adjacency.',
        misconceptionTested: 'Mixing static (S) with OSPF (O)',
      },
      {
        choiceIndex: 3,
        explanation: 'EIGRP routes display D (dual) — O is reserved for OSPF in Cisco routing tables.',
        misconceptionTested: 'Assigning EIGRP code to OSPF letter',
      },
    ],
    examTip: 'Route codes: **C** connected, **S** static, **O** OSPF, **D** EIGRP.',
  },
  '3.3-q1': {
    correct: {
      choiceIndex: 0,
      explanation: '`ip route 172.16.0.0 255.255.0.0 10.0.0.1` — network, dotted-decimal mask (/16 = 255.255.0.0), next-hop.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '0.0.255.255 is a wildcard mask syntax used in ACLs — static routes require a subnet mask, not a wildcard.',
        misconceptionTested: 'Using ACL wildcard mask in static route command',
      },
      {
        choiceIndex: 2,
        explanation: 'Cisco IOS uses `ip route`, not `static route`, and CIDR slash notation is not valid in classic IOS static route syntax.',
        misconceptionTested: 'Inventing non-IOS static route syntax',
      },
      {
        choiceIndex: 3,
        explanation: '`ip static-route` is not valid IOS — the command is `ip route <network> <mask> <next-hop>`.',
        misconceptionTested: 'Misspelling the ip route command',
      },
    ],
    examTip: 'Static route: **ip route** + network + **subnet mask** + next-hop or exit interface.',
  },
  '3.1-q6': {
    correct: {
      choiceIndex: 2,
      explanation: 'Connected (and local) routes disappear when the interface goes down — there is no longer a directly reachable path.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'The asterisk marks a preferred gateway of last resort in some displays — it does not keep a dead interface\'s connected route alive.',
        misconceptionTested: 'Expecting special marking to preserve dead connected routes',
      },
      {
        choiceIndex: 1,
        explanation: 'Connected routes are not aged like dynamic routes — they are removed immediately when the interface fails.',
        misconceptionTested: 'Expecting timer-based aging for connected routes',
      },
      {
        choiceIndex: 3,
        explanation: 'A failed interface does not auto-convert its subnet into a static route — the connected entry is simply withdrawn.',
        misconceptionTested: 'Assuming automatic static conversion on link down',
      },
    ],
    examTip: 'Interface down → **connected/local routes vanish** immediately from the RIB.',
  },
  'obj-3.5-source-q001': {
    correct: {
      choiceIndex: 1,
      explanation: 'VRRP (RFC 5798) is the open IEEE/IETF standard FHRP — HSRP and GLBP are Cisco-proprietary alternatives.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Proxy ARP answers ARP on behalf of remote subnets — it is not a first-hop redundancy protocol with virtual IP/MAC.',
        misconceptionTested: 'Substituting Proxy ARP for FHRP',
      },
      {
        choiceIndex: 2,
        explanation: 'GLBP is Cisco proprietary load-sharing FHRP — the stem asks for the openly standardized protocol (VRRP).',
        misconceptionTested: 'Picking Cisco GLBP when IEEE standard is required',
      },
      {
        choiceIndex: 3,
        explanation: 'HSRP is widely deployed but Cisco-proprietary — VRRP is the multi-vendor IEEE-aligned FHRP.',
        misconceptionTested: 'Selecting HSRP instead of open standard VRRP',
      },
    ],
    examTip: 'Open standard FHRP → **VRRP**. Cisco-only → **HSRP** or **GLBP**.',
  },
  '4.1-c-q2': {
    correct: {
      choiceIndex: 2,
      explanation: 'PAT (NAT overload) maps many inside private hosts to one public IP using unique source ports.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Static NAT is 1:1 permanent mapping — many home devices sharing one public IP needs port-based overload.',
        misconceptionTested: 'Using 1:1 static NAT for many-to-one scenario',
      },
      {
        choiceIndex: 1,
        explanation: 'Dynamic NAT pools one public IP per session but still exhausts the pool with many simultaneous hosts — PAT scales with ports.',
        misconceptionTested: 'Choosing dynamic pool when overload/PAT is required',
      },
      {
        choiceIndex: 3,
        explanation: 'Without NAT, private RFC1918 addresses cannot reach the public Internet from a typical home ISP setup.',
        misconceptionTested: 'Denying NAT in a classic SOHO sharing scenario',
      },
    ],
    examTip: 'Many inside → **one public IP** = **PAT/overload**, not static 1:1.',
  },
  'obj-4.3-source-q010': {
    correct: {
      choiceIndex: 2,
      explanation: 'The DHCP client must renew or release before lease expiry — lifecycle maintenance (renew/rebind/release) is client-driven.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'The server tracks lease database and offers addresses, but the client initiates renewal at 50%/87.5% timers — lifecycle action is client-side.',
        misconceptionTested: 'Assigning all lifecycle responsibility to the server',
      },
      {
        choiceIndex: 1,
        explanation: 'DHCP discover/request use broadcast; offer/ack are often unicast — it is not general multicast between client and server.',
        misconceptionTested: 'Claiming DHCP is multicast end-to-end',
      },
      {
        choiceIndex: 3,
        explanation: 'Leases are offered by the server — "negotiated" overstates client/server haggling; the keyed distinction here is who maintains renewal lifecycle.',
        misconceptionTested: 'Focusing on negotiation wording instead of client renewal duty',
      },
    ],
    examTip: 'DHCP **DORA** — client sends Discover/Request; client **renews** before lease expires.',
  },
  '4.1-c-q3': {
    correct: {
      choiceIndex: 0,
      explanation: '`ip nat inside source static 192.168.1.10 203.0.113.10` creates a permanent inside-local to inside-global 1:1 mapping.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '`ip nat pool` defines addresses for dynamic NAT — static 1:1 server publishing uses `inside source static`.',
        misconceptionTested: 'Using dynamic pool command for static server mapping',
      },
      {
        choiceIndex: 2,
        explanation: 'That overload line enables PAT for an ACL — static server publishing needs explicit local/global pair.',
        misconceptionTested: 'Applying PAT overload syntax to 1:1 static requirement',
      },
      {
        choiceIndex: 3,
        explanation: '`ip nat outside` only labels interface direction — it does not create the static translation entry.',
        misconceptionTested: 'Stopping at interface NAT label without translation rule',
      },
    ],
    examTip: 'Permanent server NAT → **ip nat inside source static** `<local> <global>`.',
  },
  'obj-4.6-source-q001': {
    correct: {
      choiceIndex: 0,
      explanation: '`show dhcp lease` on a DHCP client router displays the active lease from the server that assigned the address.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '`show ip dhcp lease` is for routers acting as DHCP **servers** — a client router uses `show dhcp lease`.',
        misconceptionTested: 'Using server-side show command on a DHCP client',
      },
      {
        choiceIndex: 2,
        explanation: '`show ip lease` is not the standard IOS client verification command — `show dhcp lease` is.',
        misconceptionTested: 'Inventing show command syntax',
      },
      {
        choiceIndex: 3,
        explanation: '`show ip interface` confirms interface status/IP but does not detail the DHCP server and lease timers like `show dhcp lease`.',
        misconceptionTested: 'Substituting interface status for DHCP lease details',
      },
    ],
    examTip: 'Client router lease check → **show dhcp lease**. Server pool → **show ip dhcp binding**.',
  },
  '5.4-legacy-q001': {
    correct: {
      choiceIndex: 0,
      explanation: 'AAA = Authentication (identity), Authorization (permissions), Accounting (logging/auditing of actions).',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Access/Audit/Administration is a plausible-sounding shuffle — Cisco AAA is specifically Authentication, Authorization, Accounting.',
        misconceptionTested: 'Memorizing wrong AAA expansion',
      },
      {
        choiceIndex: 2,
        explanation: 'Auditing and Availability are not the middle A — Authorization defines what an authenticated user may do.',
        misconceptionTested: 'Swapping Authorization with Auditing/Availability',
      },
      {
        choiceIndex: 3,
        explanation: 'Order matters: Authentication first, then Authorization, then Accounting — not Authorization/Access/Accounting.',
        misconceptionTested: 'Reordering the three A components',
      },
    ],
    examTip: 'AAA order: **Authentication → Authorization → Accounting** — match the stem verb.',
  },
  'obj-5.3-source-q002': {
    correct: {
      choiceIndex: 3,
      explanation: 'Telnet/SSH login passwords are configured under `line vty 0 15` (or 0 4 on older platforms) — start there before `password`/`login`.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Interface VLAN 1 configures SVI IP — not VTY line passwords for remote Telnet access.',
        misconceptionTested: 'Configuring SVI when VTY lines are needed',
      },
      {
        choiceIndex: 1,
        explanation: 'Console line secures local serial/console access — Telnet uses virtual terminal (VTY) lines.',
        misconceptionTested: 'Using console line for Telnet password',
      },
      {
        choiceIndex: 2,
        explanation: 'Auxiliary line is legacy dial/modem access — Telnet targets VTY lines, not aux.',
        misconceptionTested: 'Selecting aux line for Telnet configuration',
      },
    ],
    examTip: 'Remote login (Telnet/SSH) → **line vty** first. Console → **line console 0**.',
  },
  '5.1-q1': {
    correct: {
      choiceIndex: 2,
      explanation: 'Encryption protects confidentiality — ciphertext hides data from unauthorized readers in transit or at rest.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Availability ensures systems stay up — redundancy and failover address availability, not encryption.',
        misconceptionTested: 'Mapping encryption to availability',
      },
      {
        choiceIndex: 1,
        explanation: 'Integrity detects tampering — hashing and digital signatures address integrity; encryption hides content.',
        misconceptionTested: 'Confusing confidentiality with integrity',
      },
      {
        choiceIndex: 3,
        explanation: 'Authentication proves identity — encryption does not by itself verify who sent the data.',
        misconceptionTested: 'Equating encryption with authentication',
      },
    ],
    examTip: 'CIA: **Confidentiality** = encryption; **Integrity** = hash; **Availability** = redundancy.',
  },
  '5.5-c-q3': {
    correct: {
      choiceIndex: 1,
      explanation: 'Standard ACLs match source IP only — place them close to the destination so you do not accidentally filter traffic for other subnets earlier.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Near the source is correct for **extended** ACLs (match source and destination) — standard ACLs belong near the destination.',
        misconceptionTested: 'Applying extended ACL placement rule to standard ACL',
      },
      {
        choiceIndex: 2,
        explanation: 'ACLs are applied on specific interfaces where traffic enters or exits — not blindly on every interface.',
        misconceptionTested: 'Over-applying ACLs network-wide',
      },
      {
        choiceIndex: 3,
        explanation: 'Trunks carry multiple VLANs — ACL placement follows source/destination logic, not “trunks only”.',
        misconceptionTested: 'Restricting ACL placement to trunk interfaces',
      },
    ],
    examTip: 'Extended ACL → **near source**. Standard ACL → **near destination**.',
  },
  'obj-6.1-source-q001': {
    correct: {
      choiceIndex: 1,
      explanation: 'Automation (templates, IaC, scripts) produces repeatable, reproducible configs — same input yields the same outcome every time.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Automation reduces manual typos — it does not increase misconfiguration when templates are validated.',
        misconceptionTested: 'Assuming automation adds randomness/errors',
      },
      {
        choiceIndex: 2,
        explanation: 'Reproducibility is the primary exam answer — “decrease problems” is vague; templates explicitly enable identical redeployments.',
        misconceptionTested: 'Picking vague benefit over reproducibility',
      },
      {
        choiceIndex: 3,
        explanation: 'Less manual work is a side benefit — Cisco stems emphasize consistent, reproducible outcomes across many routers.',
        misconceptionTested: 'Choosing laziness over operational repeatability',
      },
    ],
    examTip: 'Network automation → **repeatable, reproducible** configs at scale.',
  },
  'obj-6.3-source-q001': {
    correct: {
      choiceIndex: 1,
      explanation: 'Controller-based SDN campus/data-center fabrics commonly use **spine-leaf** (Clos) topology for equal-cost multipath east-west traffic.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Three-tier (access-distribution-core) is classic hierarchical — modern controller fabrics favor spine-leaf for scale and ECMP.',
        misconceptionTested: 'Applying legacy three-tier to SDN fabric',
      },
      {
        choiceIndex: 2,
        explanation: 'Collapsed core merges distribution/core — spine-leaf is the distinct SDN fabric pattern tested here.',
        misconceptionTested: 'Confusing collapsed core with spine-leaf',
      },
      {
        choiceIndex: 3,
        explanation: 'SAN fabric is storage networking (FC/FCoE) — not the IP Ethernet architecture for controller-based LANs.',
        misconceptionTested: 'Dragging storage fabric into SDN campus question',
      },
    ],
    examTip: 'Controller/SDN fabric → **spine-leaf**. Legacy campus → three-tier.',
  },
  'obj-6.3-source-q005': {
    correct: {
      choiceIndex: 1,
      explanation: 'Cisco SD-WAN (Viptela) connects branch offices to applications over optimized WAN paths — built for ROBO direct app access.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'APIC-EM is legacy SDN management for enterprise LAN — not the branch WAN overlay for remote workers reaching apps.',
        misconceptionTested: 'Using campus SDN controller for WAN branch use case',
      },
      {
        choiceIndex: 2,
        explanation: 'Prime Infrastructure is traditional network management — not the SD-WAN overlay product for branch connectivity.',
        misconceptionTested: 'Selecting NMS instead of SD-WAN solution',
      },
      {
        choiceIndex: 3,
        explanation: 'OpenDaylight is an open SDN controller platform — Cisco SD-WAN is the branded branch/WAN answer on CCNA stems.',
        misconceptionTested: 'Picking generic open controller for Cisco ROBO scenario',
      },
    ],
    examTip: 'Branch offices need direct app access → **Cisco SD-WAN**, not campus APIC-EM.',
  },
}
