/** Gold reviews — Batch 3: fundamentals depth (domain 1) toward 100+ gold bar. */
export const BATCH3_GOLD = {
  '1.1-c-q1': {
    correct: {
      choiceIndex: 2,
      explanation: 'Routers examine IP headers and make forwarding decisions — that is Layer 3 (Network).',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'Layer 1 handles bits on the wire — routers do not primarily operate at the physical layer.', misconceptionTested: 'Confusing physical signaling with routing' },
      { choiceIndex: 1, explanation: 'Layer 2 switches use MAC tables — routers break broadcast domains and route by IP at Layer 3.', misconceptionTested: 'Assigning switch behavior to a router' },
      { choiceIndex: 3, explanation: 'Layer 7 is application services (HTTP, DNS apps) — routers forward packets using Layer 3 addresses, not app data.', misconceptionTested: 'Equating routing with application-layer services' },
    ],
    examTip: 'Router = **Layer 3**. Switch = **Layer 2**. Firewall can span L3–L7.',
  },
  '1.1-c-q2': {
    correct: {
      choiceIndex: 1,
      explanation: 'A Layer 2 switch forwards frames using the source-learned MAC address table (CAM).',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'Routing tables belong to Layer 3 devices — switches forward within a VLAN using MACs, not IP routes.', misconceptionTested: 'Expecting a switch to route by IP' },
      { choiceIndex: 2, explanation: 'DNS resolves names — it is not used for Ethernet frame forwarding decisions.', misconceptionTested: 'Dragging name resolution into L2 forwarding' },
      { choiceIndex: 3, explanation: 'ACLs filter traffic — they do not replace the MAC table for basic frame switching.', misconceptionTested: 'Confusing security policy with switching mechanism' },
    ],
    examTip: 'Switch forwards with **MAC table**. Router forwards with **routing table**.',
  },
  '1.1-c-q4': {
    correct: {
      choiceIndex: 1,
      explanation: 'NGFW adds stateful inspection and application awareness beyond simple static ACL permit/deny.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'Packet filters and NGFWs handle more than UDP — the differentiator is stateful/app-aware inspection, not protocol choice.', misconceptionTested: 'Reducing firewall scope to one protocol' },
      { choiceIndex: 2, explanation: 'Firewalls enforce policy — they do not replace switches in a campus design.', misconceptionTested: 'Confusing security appliance with switching role' },
      { choiceIndex: 3, explanation: 'NGFWs operate well above Layer 1 — they inspect flows and applications across multiple layers.', misconceptionTested: 'Placing advanced firewall at physical layer only' },
    ],
    examTip: 'Basic ACL = static permit/deny. **NGFW = stateful + application-aware**.',
  },
  '1.1-c-q5': {
    correct: {
      choiceIndex: 1,
      explanation: 'Lightweight APs discover and register with a Wireless LAN Controller (WLC) for centralized config and policy.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'DNS resolves names — AP join uses CAPWAP/LWAPP discovery to find the WLC, not DNS registration.', misconceptionTested: 'Using DNS as AP join mechanism' },
      { choiceIndex: 2, explanation: 'APs may traverse routers to reach a WLC, but the WLC — not the core router alone — owns AP management.', misconceptionTested: 'Assigning AP control to core router only' },
      { choiceIndex: 3, explanation: 'DHCP relay helps clients get IPs — AP join is a separate WLC discovery/registration process.', misconceptionTested: 'Confusing client DHCP relay with AP join' },
    ],
    examTip: 'Lightweight AP → discovers and joins **WLC** for centralized wireless control.',
  },
  '1.1-c-q6': {
    correct: {
      choiceIndex: 2,
      explanation: 'An endpoint is a user device at the edge — an employee laptop is a classic endpoint example.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'A web server is infrastructure/service — endpoints are typically user/client devices at the network edge.', misconceptionTested: 'Labeling servers as endpoints in CCNA context' },
      { choiceIndex: 1, explanation: 'DNS is a network service — not an end-user endpoint device.', misconceptionTested: 'Treating a service as an endpoint' },
      { choiceIndex: 3, explanation: 'Core routers are infrastructure — endpoints are client devices like PCs, phones, and laptops.', misconceptionTested: 'Calling network infrastructure an endpoint' },
    ],
    examTip: 'Endpoint = **user/client device** (laptop, phone). Not core routers or services.',
  },
  '1.1-c-q8': {
    correct: {
      choiceIndex: 0,
      explanation: 'True — a WLC centralizes AP configuration, RF policy, and client management for lightweight APs.',
    },
    incorrect: [
      { choiceIndex: 1, explanation: 'False is wrong here — lightweight APs depend on a WLC; they do not run full standalone policy independently.', misconceptionTested: 'Believing lightweight APs are fully autonomous' },
    ],
    examTip: 'Lightweight AP + **WLC** = centralized wireless control. Autonomous AP = local config.',
  },
  '1.2-c-q1': {
    correct: {
      choiceIndex: 2,
      explanation: 'The access tier connects end-user devices — PCs, phones, and access ports on switches/APs.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'Core provides high-speed backbone between distribution blocks — not direct end-user attachment.', misconceptionTested: 'Connecting users at the core tier' },
      { choiceIndex: 1, explanation: 'Distribution aggregates access switches and applies policy — users connect at access, not distribution.', misconceptionTested: 'Placing user ports in distribution tier' },
      { choiceIndex: 3, explanation: 'Spine is a data-center fabric term — campus three-tier uses access/distribution/core.', misconceptionTested: 'Mixing DC spine-leaf with campus access tier' },
    ],
    examTip: 'Campus three-tier: **Access** = users. Distribution = policy/aggregation. Core = backbone.',
  },
  '1.2-c-q2': {
    correct: {
      choiceIndex: 1,
      explanation: 'Spine-leaf provides full bisection bandwidth for east-west (server-to-server) traffic in data centers.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'SOHO Wi-Fi uses a single AP/router — not a multi-spine fabric design.', misconceptionTested: 'Applying DC fabric to home Wi-Fi' },
      { choiceIndex: 2, explanation: 'Dial-up WAN is legacy remote access — unrelated to spine-leaf DC switching.', misconceptionTested: 'Confusing WAN dial-up with DC architecture' },
      { choiceIndex: 3, explanation: 'Home gaming does not require spine-leaf — that architecture targets scalable DC east-west traffic.', misconceptionTested: 'Using DC design for consumer gaming' },
    ],
    examTip: 'Spine-leaf = **data center east-west** scalability. Campus = access/distribution/core.',
  },
  '1.2-c-q3': {
    correct: {
      choiceIndex: 1,
      explanation: 'All branches home through headquarters — classic hub-and-spoke WAN topology.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'Full mesh connects every site to every other site — not all traffic through one HQ hub.', misconceptionTested: 'Confusing hub-spoke with full mesh' },
      { choiceIndex: 2, explanation: 'Spine-leaf is a data-center L2/L3 fabric — not the branch WAN pattern described.', misconceptionTested: 'Applying DC fabric to branch WAN' },
      { choiceIndex: 3, explanation: 'Point-to-point is one link between two sites — ten branches via HQ is hub-and-spoke.', misconceptionTested: 'Calling multi-branch HQ model point-to-point only' },
    ],
    examTip: 'All branches → **HQ** = **hub-and-spoke**. Every site ↔ every site = full mesh.',
  },
  '1.2-c-q4': {
    correct: {
      choiceIndex: 1,
      explanation: 'Full mesh needs n(n−1)/2 links — cost and complexity explode as sites grow.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'Full mesh maximizes redundancy — the trade-off is cost/complexity, not lack of redundancy.', misconceptionTested: 'Believing mesh removes redundancy' },
      { choiceIndex: 2, explanation: 'Mesh works over various transports — it is not limited to fiber only.', misconceptionTested: 'Restricting mesh to one media type' },
      { choiceIndex: 3, explanation: 'Routing still runs over mesh links — mesh describes topology, not elimination of routing.', misconceptionTested: 'Thinking mesh removes routing protocols' },
    ],
    examTip: 'Full mesh = **max redundancy, max cost**. Hub-spoke = cheaper, single point at hub.',
  },
  '1.2-c-q5': {
    correct: {
      choiceIndex: 1,
      explanation: 'Collapsed core merges distribution and core into two tiers: collapsed core + access.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'One tier would be a flat network — collapsed core still has access and a combined core/distribution layer.', misconceptionTested: 'Calling collapsed core a single-tier design' },
      { choiceIndex: 2, explanation: 'Four tiers exceed standard collapsed-core models — collapsed means fewer tiers than classic three-tier.', misconceptionTested: 'Adding extra tiers to collapsed design' },
      { choiceIndex: 3, explanation: 'Five tiers is not a standard campus model — collapsed core reduces to two functional tiers.', misconceptionTested: 'Inventing non-standard tier count' },
    ],
    examTip: 'Collapsed core = **2 tiers** (access + collapsed core/distribution). Classic = 3 tiers.',
  },
  '1.3-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'Copper UTP Ethernet is limited to **100 meters** per segment per TIA/Ethernet standards.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '10 m is far below the standard UTP limit — 100 m is the exam reference length.', misconceptionTested: 'Underestimating UTP segment length' },
      { choiceIndex: 2, explanation: '500 m applies to some fiber or legacy specs — not standard copper UTP at 100 m.', misconceptionTested: 'Using fiber distance for copper UTP' },
      { choiceIndex: 3, explanation: '1 km is fiber territory — copper UTP max is 100 m for exam purposes.', misconceptionTested: 'Confusing fiber reach with copper UTP' },
    ],
    examTip: 'Copper UTP Ethernet segment = **100 m**. Know this cold.',
  },
  '1.3-c-q2': {
    correct: {
      choiceIndex: 1,
      explanation: 'PC (MDI) to switch (MDIX) uses a straight-through cable — like devices need crossover without auto-MDIX.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'Crossover is for like-to-like (switch-switch, PC-PC) on legacy gear without auto-MDIX.', misconceptionTested: 'Using crossover for PC-to-switch' },
      { choiceIndex: 2, explanation: 'Console rollover is for out-of-band management — not LAN data between PC and switch.', misconceptionTested: 'Confusing console cable with Ethernet patch' },
      { choiceIndex: 3, explanation: 'Fiber SM is a different media — the question asks typical copper PC-to-switch cabling.', misconceptionTested: 'Answering fiber when copper patch is required' },
    ],
    examTip: 'PC → switch = **straight-through**. Like → like (no auto-MDIX) = **crossover**.',
  },
  '1.3-c-q5': {
    correct: {
      choiceIndex: 2,
      explanation: 'Cat6a supports 10GBASE-T at 100 m — the exam associates Cat6a with 10 Gbps at standard distance.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '100 Mbps is Cat5e territory — Cat6a targets much higher speeds.', misconceptionTested: 'Downgrading Cat6a to Fast Ethernet speed' },
      { choiceIndex: 1, explanation: '1 Gbps is common on Cat5e/Cat6 — Cat6a is the 10G copper standard at 100 m.', misconceptionTested: 'Stopping at 1 Gbps for Cat6a' },
      { choiceIndex: 3, explanation: '40 Gbps over copper UTP at 100 m is not the Cat6a exam pairing — 10 Gbps is.', misconceptionTested: 'Jumping to 40G on UTP for Cat6a' },
    ],
    examTip: 'Cat6a @ 100 m → **10 Gbps**. Cat5e → 1 Gbps.',
  },
  '1.3-c-q6': {
    correct: {
      choiceIndex: 1,
      explanation: 'Switch-to-switch (like devices) without auto-MDIX requires a crossover cable.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'Straight-through connects unlike devices (PC-switch) — two switches need crossover on legacy hardware.', misconceptionTested: 'Straight-through between two switches' },
      { choiceIndex: 2, explanation: 'Console cable is for management port — not inter-switch Ethernet trunk links.', misconceptionTested: 'Using console cable for switch interconnect' },
      { choiceIndex: 3, explanation: 'Serial DCE/DTE is WAN router links — not Ethernet switch-to-switch.', misconceptionTested: 'Confusing WAN serial with Ethernet crossover' },
    ],
    examTip: 'Switch ↔ switch (no auto-MDIX) = **crossover**. Modern gear often auto-MDIX.',
  },
  '1.4-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'CRC errors indicate frames arrived corrupted — bad cable, duplex mismatch, or physical layer issues.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'Correct routing is Layer 3 — CRC is a Layer 2 frame integrity check on the wire.', misconceptionTested: 'Attributing CRC to routing success' },
      { choiceIndex: 2, explanation: 'DNS failures affect name resolution — they do not increment interface CRC counters.', misconceptionTested: 'Blaming DNS for L2 CRC errors' },
      { choiceIndex: 3, explanation: 'Valid VLAN tagging is normal — CRC errors mean damaged or misaligned frames, not proper 802.1Q.', misconceptionTested: 'Equating VLAN tags with CRC failures' },
    ],
    examTip: 'Rising **CRC errors** → check cable, duplex, and physical layer first.',
  },
  '1.4-c-q2': {
    correct: {
      choiceIndex: 1,
      explanation: '`show interfaces counters errors` (or `show interfaces`) displays CRC, runts, giants, and collisions.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '`show ip route` lists Layer 3 paths — not interface error counters.', misconceptionTested: 'Using routing table for L2 error stats' },
      { choiceIndex: 2, explanation: '`show vlan brief` lists VLAN membership — not CRC or collision counts.', misconceptionTested: 'Checking VLAN brief for physical errors' },
      { choiceIndex: 3, explanation: '`show version` shows IOS and uptime — not per-interface error counters.', misconceptionTested: 'Using show version for CRC diagnostics' },
    ],
    examTip: 'Physical/L2 errors → **`show interfaces`** or **`show interfaces counters errors**.',
  },
  '1.6-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: '/26 = 64 addresses − 2 (network + broadcast) = **62 usable hosts**.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '64 is total addresses in the block — subtract network and broadcast for usable hosts.', misconceptionTested: 'Forgetting to subtract network and broadcast' },
      { choiceIndex: 2, explanation: '30 usable hosts is a /27 (/32−2=30) — /26 gives 62.', misconceptionTested: 'Confusing /27 host count with /26' },
      { choiceIndex: 3, explanation: '126 usable is a /25 — /26 is half that size.', misconceptionTested: 'Using /25 math for a /26 prefix' },
    ],
    examTip: 'Usable hosts = **2^(32−prefix) − 2**. /26 → 62 usable.',
  },
  '1.7-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: '192.168.0.0/16 is RFC 1918 private space — not routable on the public Internet.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '8.8.8.0/24 is public Google DNS space — not private RFC 1918.', misconceptionTested: 'Labeling public space as private' },
      { choiceIndex: 2, explanation: '203.0.113.0/24 is TEST-NET documentation space — not RFC 1918 private.', misconceptionTested: 'Confusing documentation blocks with RFC 1918' },
      { choiceIndex: 3, explanation: '169.254.0.0/16 is APIPA link-local — not RFC 1918 private (10/8, 172.16/12, 192.168/16).', misconceptionTested: 'Mixing APIPA with RFC 1918 private' },
    ],
    examTip: 'RFC 1918 private: **10.0.0.0/8**, **172.16.0.0/12**, **192.168.0.0/16**.',
  },
  '1.8-c-q1': {
    correct: {
      choiceIndex: 2,
      explanation: 'IPv6 addresses are **128 bits** — four times longer than 32-bit IPv4.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '32 bits is IPv4 address length — IPv6 is 128 bits.', misconceptionTested: 'Using IPv4 bit length for IPv6' },
      { choiceIndex: 1, explanation: '64 bits is a common prefix or interface ID slice — full IPv6 address is 128 bits.', misconceptionTested: 'Confusing /64 prefix with full address size' },
      { choiceIndex: 3, explanation: '256 bits is not a standard IP address size on CCNA — IPv6 is 128 bits.', misconceptionTested: 'Inventing non-standard address length' },
    ],
    examTip: 'IPv4 = **32 bits**. IPv6 = **128 bits**.',
  },
  '1.9-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: '2000::/3 is the IPv6 global unicast range — publicly routable addresses.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'FE80::/10 is link-local — not globally routable public unicast.', misconceptionTested: 'Confusing link-local with global unicast' },
      { choiceIndex: 2, explanation: 'FC00::/7 is unique local (ULA) — private-like, not global public unicast.', misconceptionTested: 'Mixing ULA with global unicast' },
      { choiceIndex: 3, explanation: 'FF00::/8 is multicast — not unicast public addressing.', misconceptionTested: 'Selecting multicast range for unicast question' },
    ],
    examTip: 'Global unicast = **2000::/3**. Link-local = **FE80::/10**. ULA = **FC00::/7**.',
  },
  '1.10-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: '`ipconfig /all` on Windows shows IP address, subnet mask, default gateway, and DNS servers.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '`netstat` shows connections and listening ports — not full IP configuration.', misconceptionTested: 'Using netstat for IP config dump' },
      { choiceIndex: 2, explanation: '`arp -a` shows MAC/IP bindings — not mask, gateway, or DNS.', misconceptionTested: 'Checking ARP table for DHCP parameters' },
      { choiceIndex: 3, explanation: '`route print` shows routing table — combine with ipconfig for full host troubleshooting.', misconceptionTested: 'Relying on route print alone for IP config' },
    ],
    examTip: 'Windows host IP check → **`ipconfig /all`**. Linux → **`ip addr`**.',
  },
  '1.10-c-q3': {
    correct: {
      choiceIndex: 1,
      explanation: 'IP ping works but name fails — DNS resolution is broken while Layer 3 routing to the IP is fine.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'Cable CRC would affect IP ping too — here 203.0.113.1 succeeds, isolating DNS.', misconceptionTested: 'Blaming physical errors when IP ping works' },
      { choiceIndex: 2, explanation: 'Missing mask would break same-subnet logic — successful IP ping to Internet target points to DNS.', misconceptionTested: 'Suspecting mask when IP reachability works' },
      { choiceIndex: 3, explanation: 'STP loops cause broadcast storms — they do not selectively break DNS while IP ping succeeds.', misconceptionTested: 'Dragging STP into selective DNS failure' },
    ],
    examTip: 'Ping **IP works**, ping **name fails** → **DNS** first.',
  },
  '1.11-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'In 2.4 GHz, channels 1, 6, and 11 are non-overlapping in common 20 MHz planning.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'Channels 1, 2, 3 overlap — only 1, 6, 11 avoid overlap in typical US planning.', misconceptionTested: 'Using adjacent overlapping channels' },
      { choiceIndex: 2, explanation: '6, 7, 8 overlap each other — not the standard non-overlapping set.', misconceptionTested: 'Picking overlapping mid-band channels' },
      { choiceIndex: 3, explanation: 'Channel 13 is region-dependent — exam default non-overlapping set is 1, 6, 11.', misconceptionTested: 'Region-specific channels on generic exam question' },
    ],
    examTip: '2.4 GHz non-overlapping (exam default): **1, 6, 11**.',
  },
  '1.12-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'VMware ESXi runs directly on bare metal — a Type 1 hypervisor.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'Workstation runs on top of Windows — Type 2 (hosted) hypervisor, not bare-metal Type 1.', misconceptionTested: 'Classifying hosted hypervisor as Type 1' },
      { choiceIndex: 2, explanation: 'Docker Desktop is container tooling on a host OS — not a bare-metal hypervisor.', misconceptionTested: 'Equating containers with Type 1 hypervisor' },
      { choiceIndex: 3, explanation: 'A physical router forwards packets — it is not a hypervisor.', misconceptionTested: 'Confusing network hardware with virtualization' },
    ],
    examTip: 'Type 1 = **bare metal** (ESXi, Hyper-V on hardware). Type 2 = **runs on OS** (Workstation).',
  },
}
