#!/usr/bin/env python3
"""Gold batch 27 — 50 reviews: routing table 3.1, packet forwarding/ARP/ICMP 3.2, OSPF 3.4, NTP 4.2. Run: python3 scripts/_genGoldBatch27.py"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HAND = {
  # === Routing table 3.1 (finish) ===
  "obj-3.1-source-q019": {
    "correct": {"choiceIndex": 0, "explanation": "OSPF cost = **10⁸ / bandwidth (bps)** — e.g. 100 Mbps → cost **1**, 10 Mbps → cost **10**."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Bandwidth + delay + reliability + load is the **EIGRP composite metric** — OSPF uses **cost = 10⁸/bandwidth** only.", "misconceptionTested": "EIGRP metric formula applied to OSPF"},
      {"choiceIndex": 2, "explanation": "**K-values** tune EIGRP metric weights — OSPF has no K-metrics.", "misconceptionTested": "K-metrics in OSPF"},
      {"choiceIndex": 3, "explanation": "Raw bandwidth alone is not the metric — IOS converts it to **cost** via **10⁸/bandwidth**.", "misconceptionTested": "Bandwidth as direct OSPF metric"},
    ],
    "examTip": "OSPF cost = **10⁸ ÷ interface bandwidth (bps)** | 100M=1, 10M=10, 1.544M≈64.",
  },
  "obj-3.1-source-q020": {
    "correct": {"choiceIndex": 0, "explanation": "**[110/1]** = AD **110** (OSPF) and metric **1** — cost 1 means a **100 Mbps** link (10⁸/10⁸)."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Metric **1** = 100 Mbps, not 10 Mbps — 10 Mbps would show metric **10**.", "misconceptionTested": "OSPF metric 1 as 10 Mbps link"},
      {"choiceIndex": 2, "explanation": "AD and metric are **reversed** — format is **[AD/metric]**, so 110 is AD, 1 is metric.", "misconceptionTested": "AD and metric swapped in bracket notation"},
      {"choiceIndex": 3, "explanation": "Metric **1** corresponds to **100 Mbps**, not 1 Gbps — 1 Gbps would be cost **0** (treated as 1).", "misconceptionTested": "OSPF metric 1 as 1 Gbps"},
    ],
    "examTip": "`show ip route` bracket = **[AD/metric]** | OSPF AD=110 | Cost 1 = 100M, 10 = 10M.",
  },
  "obj-3.1-source-q021": {
    "correct": {"choiceIndex": 2, "explanation": "**0.0.0.0/0** is the **default route** — matches any destination when no more-specific route exists."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "A **local route** is a /32 for an interface IP (L in table) — not 0.0.0.0/0.", "misconceptionTested": "Default route as local route"},
      {"choiceIndex": 1, "explanation": "Default routes can be **static or dynamic** — 0.0.0.0/0 is not exclusively dynamic.", "misconceptionTested": "0.0.0.0/0 as dynamic-only route type"},
      {"choiceIndex": 3, "explanation": "**Loopback** is an interface type — 0.0.0.0/0 is a **catch-all default** prefix.", "misconceptionTested": "Default route as loopback route"},
    ],
    "examTip": "Default route = **0.0.0.0/0** (IPv4) or **::/0** (IPv6) — gateway of last resort.",
  },
  "obj-3.1-source-q022": {
    "correct": {"choiceIndex": 2, "explanation": "A **host route** is a **/32** entry for one specific host address — longest possible prefix match."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "The **default route** (0.0.0.0/0) is the last-resort match — not a host route.", "misconceptionTested": "Host route as default route"},
      {"choiceIndex": 1, "explanation": "Host routes are **configured or learned** — the table does not auto-discover every destination host.", "misconceptionTested": "Routing table auto-creates host routes"},
      {"choiceIndex": 3, "explanation": "**HSRP** provides gateway redundancy — it does not populate host routes in the RIB.", "misconceptionTested": "HSRP populates host routes"},
    ],
    "examTip": "Host route = **/32** (one IP) | Often seen as `L` (local) or static `192.168.1.5/32`.",
  },
  "obj-3.1-source-q023": {
    "correct": {"choiceIndex": 1, "explanation": "The **routing protocol code** (C, S, O, D, R…) in the first column shows **how the route was learned**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Prefix/mask identifies the **destination network** — not the learning source.", "misconceptionTested": "Prefix as route source identifier"},
      {"choiceIndex": 2, "explanation": "**Metric** ranks paths within one protocol — code letter shows the **source/protocol**.", "misconceptionTested": "Metric as route source identifier"},
      {"choiceIndex": 3, "explanation": "**Next hop** is where to forward — the **code letter** (C/S/O/D) shows origin.", "misconceptionTested": "Next hop as route source identifier"},
    ],
    "examTip": "Route codes: **C**=connected, **S**=static, **O**=OSPF, **D**=EIGRP, **R**=RIP, **L**=local.",
  },
  "obj-3.1-source-q024": {
    "correct": {"choiceIndex": 0, "explanation": "A **host** ANDs its subnet mask with the destination IP to decide if the target is **on-link or remote**."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Routers use the **routing table** (longest match) — hosts use mask ANDing for local vs remote.", "misconceptionTested": "Router uses subnet mask like a host"},
      {"choiceIndex": 2, "explanation": "Routers route by **longest prefix match** in the RIB — they don't AND their own mask per packet.", "misconceptionTested": "Router ANDs its mask when forwarding"},
      {"choiceIndex": 3, "explanation": "The destination host checks its **own IP**, not the packet's mask field — mask is not in the IP header.", "misconceptionTested": "Destination checks packet subnet mask"},
    ],
    "examTip": "Host local/remote test: **(dest IP AND mask) == (my IP AND mask)** → local; else use default gateway.",
  },
  "obj-3.1-source-q025": {
    "correct": {"choiceIndex": 1, "explanation": "IOS 15 installs a **local route** (/32) for each configured interface IP — shown with **L** code."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "\"IP address route\" is not a Cisco term — IOS calls it a **local route**.", "misconceptionTested": "Invented IP address route term"},
      {"choiceIndex": 2, "explanation": "**Dynamic routes** come from routing protocols — interface IPs create **connected/local** routes.", "misconceptionTested": "Interface IP as dynamic route"},
      {"choiceIndex": 3, "explanation": "**Static routes** are manually configured — interface IPs auto-generate **connected + local** entries.", "misconceptionTested": "Interface IP as static route"},
    ],
    "examTip": "Interface IP → **C** (connected network) + **L** (local /32 host route) in `show ip route`.",
  },
  "obj-3.1-source-q026": {
    "correct": {"choiceIndex": 2, "explanation": "For a **remote** destination, the host **ARP-resolves the default gateway's MAC** — IP stays the final destination."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "The **destination IP is never replaced** with the gateway — only the **L2 MAC** changes to the gateway.", "misconceptionTested": "Destination IP replaced with gateway"},
      {"choiceIndex": 1, "explanation": "The host does not broadcast **data packets** to the gateway — it sends a **unicast ARP request** for the gateway MAC.", "misconceptionTested": "Remote traffic sent via broadcast to gateway"},
      {"choiceIndex": 3, "explanation": "IP is **connectionless** — no dedicated connection is created with the default gateway.", "misconceptionTested": "Dedicated connection to default gateway"},
    ],
    "examTip": "Remote send: IP = **final host** | MAC = **default gateway** (after ARP) | Local send: MAC = destination host.",
  },
  "obj-3.1-source-q027": {
    "correct": {"choiceIndex": 0, "explanation": "**`show ip route`** displays the IPv4 routing table — prefixes, next hops, AD/metric, and codes."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**`show route`** is not valid IOS — use **`show ip route`** or **`show ipv6 route`**.", "misconceptionTested": "Invented show route command"},
      {"choiceIndex": 2, "explanation": "**`show route table`** does not exist — correct command is **`show ip route`**.", "misconceptionTested": "Invented show route table command"},
      {"choiceIndex": 3, "explanation": "**`show routes`** is not valid — IOS uses **`show ip route`**.", "misconceptionTested": "Plural show routes command"},
    ],
    "examTip": "IPv4 RIB: **`show ip route`** | IPv6 RIB: **`show ipv6 route`** | Summary: add **`summary`**.",
  },
  # === Packet forwarding / ARP / ICMP 3.2 ===
  "obj-3.2-source-q001": {
    "correct": {"choiceIndex": 1, "explanation": "**ICMP** reports delivery problems — e.g. **destination unreachable** when no route exists or host is down."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Routing tables are built by **routing protocols or static config** — ICMP does not populate routes.", "misconceptionTested": "ICMP populates routing table"},
      {"choiceIndex": 2, "explanation": "ICMP does not **maintain** the routing table — protocols like OSPF/EIGRP do.", "misconceptionTested": "ICMP maintains routing table"},
      {"choiceIndex": 3, "explanation": "ICMP provides **on-demand diagnostics** (ping/traceroute) — not continuous path monitoring.", "misconceptionTested": "ICMP continuous path diagnosis"},
    ],
    "examTip": "ICMP role in routing: **error reporting** (unreachable, TTL exceeded) + **diagnostics** (ping/traceroute).",
  },
  "obj-3.2-source-q002": {
    "correct": {"choiceIndex": 1, "explanation": "When prefixes overlap, the router picks the **longest matching prefix** (most specific netmask)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Lowest metric** breaks ties **within the same prefix length** — longest match decides first.", "misconceptionTested": "Metric before longest prefix match"},
      {"choiceIndex": 2, "explanation": "The route with **highest AD** loses — lowest AD wins when sources compete.", "misconceptionTested": "Highest AD selected"},
      {"choiceIndex": 3, "explanation": "**AD** resolves competing routes from **different sources** for the same prefix — longest match comes first.", "misconceptionTested": "AD before longest prefix match"},
    ],
    "examTip": "Route selection order: **1) longest prefix match → 2) lowest AD → 3) lowest metric**.",
  },
  "obj-3.2-source-q003": {
    "correct": {"choiceIndex": 0, "explanation": "**Static default** (AD **1**) beats **RIP default** (AD **120**) — lowest AD wins for the same prefix."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Higher AD is **less trusted** — static (1) always beats RIP (120).", "misconceptionTested": "Highest AD wins default route"},
      {"choiceIndex": 2, "explanation": "Both are default routes (0.0.0.0/0) — **AD** decides, not metric, when sources differ.", "misconceptionTested": "Metric decides between protocol sources"},
      {"choiceIndex": 3, "explanation": "RIP's AD **120** loses to static's **1** — the static route is installed.", "misconceptionTested": "Dynamic route always wins over static"},
    ],
    "examTip": "Same prefix, different sources → **lowest AD wins** | Static=1 beats RIP=120 every time.",
  },
  "obj-3.2-source-q004": {
    "correct": {"choiceIndex": 2, "explanation": "A **host route** is a **/32** entry pointing to one specific host — the most specific possible match."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**0.0.0.0/0** is the default (last-resort) route — not a host-specific /32.", "misconceptionTested": "Host route as catch-all default"},
      {"choiceIndex": 1, "explanation": "Routers don't auto-create routes for every host they see — host routes are **configured or protocol-learned**.", "misconceptionTested": "Auto-discovered host routes"},
      {"choiceIndex": 3, "explanation": "**HSRP/VRRP** provides redundant gateways — they don't install /32 host routes.", "misconceptionTested": "HSRP creates host routes"},
    ],
    "examTip": "Host route = **/32** for one IP | Longest match always beats broader prefixes.",
  },
  "obj-3.2-source-q005": {
    "correct": {"choiceIndex": 1, "explanation": "The **protocol code** (C, S, O, D, R…) in column one identifies **where/how** the route was learned."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Prefix and mask define the **destination** — not the learning source.", "misconceptionTested": "Prefix identifies route source"},
      {"choiceIndex": 2, "explanation": "**Metric** compares paths within one protocol — the **code letter** shows the source.", "misconceptionTested": "Metric identifies route source"},
      {"choiceIndex": 3, "explanation": "**Next hop** is the forward target — origin is shown by the **route code**.", "misconceptionTested": "Next hop identifies route source"},
    ],
    "examTip": "Read `show ip route` left-to-right: **code → prefix → [AD/metric] → next-hop/interface**.",
  },
  "obj-3.2-source-q006": {
    "correct": {"choiceIndex": 1, "explanation": "Routers forward based on the **destination IP address** — longest prefix match in the routing table."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Source IP** is not used for forwarding decisions — destination IP drives the lookup.", "misconceptionTested": "Source IP for routing decision"},
      {"choiceIndex": 2, "explanation": "**TTL** is decremented per hop but does not select the outbound interface or next hop.", "misconceptionTested": "TTL as routing criteria"},
      {"choiceIndex": 3, "explanation": "**Destination MAC** is L2 — routers route using **L3 destination IP**.", "misconceptionTested": "Destination MAC for routing"},
    ],
    "examTip": "L3 routing decision = **destination IP** → RIB lookup → rewrite L2 MAC for next hop.",
  },
  "obj-3.2-source-q007": {
    "correct": {"choiceIndex": 2, "explanation": "**Static routes** require an administrator to manually configure prefixes and next hops."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Link-state** (OSPF/IS-IS) is **dynamic** — routers exchange LSAs automatically.", "misconceptionTested": "Link-state as admin-configured"},
      {"choiceIndex": 1, "explanation": "**Distance-vector** (RIP/EIGRP) is **dynamic** — protocols build tables without per-route manual entry.", "misconceptionTested": "Distance-vector as admin-configured"},
      {"choiceIndex": 3, "explanation": "**Dynamic routing** adapts automatically — static is the one needing **manual intervention**.", "misconceptionTested": "Dynamic routing requires admin per route"},
    ],
    "examTip": "Static = **admin configures** | Dynamic = **protocol learns** | Connected = **auto from interfaces**.",
  },
  "obj-3.2-source-q008": {
    "correct": {"choiceIndex": 0, "explanation": "Hosts **AND the subnet mask** with the destination IP to determine if the target is on the **local subnet**."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Routers use the **routing table** (prefix lookup) — mask ANDing is a **host** operation.", "misconceptionTested": "Router uses mask ANDing like host"},
      {"choiceIndex": 2, "explanation": "Routers match **destination IP to route prefixes** — they don't apply their interface mask per packet.", "misconceptionTested": "Router ANDs its mask when routing"},
      {"choiceIndex": 3, "explanation": "Subnet mask is **not carried in the IP packet** — receiving hosts don't check a mask field.", "misconceptionTested": "Destination verifies packet subnet mask"},
    ],
    "examTip": "Host: mask ANDing → local vs remote | Router: **longest prefix match** in RIB.",
  },
  "obj-3.2-source-q009": {
    "correct": {"choiceIndex": 2, "explanation": "**ARP** resolves the destination host's **MAC address** when the target is on the local subnet."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**IGMP** manages multicast group membership — not L2 address resolution.", "misconceptionTested": "IGMP for local MAC resolution"},
      {"choiceIndex": 1, "explanation": "**RARP** maps MAC → IP (reverse) — modern networks use **ARP** (IP → MAC).", "misconceptionTested": "RARP for forward MAC lookup"},
      {"choiceIndex": 3, "explanation": "**ICMP** is L3 diagnostics/errors — **ARP** handles L2 address resolution on local segments.", "misconceptionTested": "ICMP for MAC resolution"},
    ],
    "examTip": "Local delivery: **ARP** (IP→MAC) | Remote delivery: ARP the **default gateway** MAC.",
  },
  "obj-3.2-source-q010": {
    "correct": {"choiceIndex": 2, "explanation": "For remote destinations, the host sets the frame's **destination MAC to the router's MAC** (default gateway)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "The **destination IP never changes** on the host — only the **MAC** is rewritten to the gateway.", "misconceptionTested": "Destination IP changed to router"},
      {"choiceIndex": 1, "explanation": "Using the **destination host's MAC** only works for **local** subnets — remote needs the **router's MAC**.", "misconceptionTested": "Remote traffic uses destination host MAC"},
      {"choiceIndex": 3, "explanation": "The **source IP** stays the sending host — it is not changed to the router's address.", "misconceptionTested": "Source IP changed to router"},
    ],
    "examTip": "Remote packet from host: **dest IP = final host** | **dest MAC = default gateway**.",
  },
  "obj-3.2-source-q011": {
    "correct": {"choiceIndex": 1, "explanation": "Every router **decrements TTL by 1** — at zero, the packet is dropped and **ICMP TTL exceeded** is sent."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "The destination IP is **preserved** end-to-end — routers don't rewrite it to \"original destination\".", "misconceptionTested": "Router rewrites destination IP"},
      {"choiceIndex": 2, "explanation": "The router **rewrites source MAC** to its egress interface — it does not restore the original source MAC.", "misconceptionTested": "Source MAC restored to original"},
      {"choiceIndex": 3, "explanation": "TTL decrement is the key router action — not all three statements are true.", "misconceptionTested": "All router hop actions combined"},
    ],
    "examTip": "Router hop: **TTL−1** | **rewrite L2 MACs** | **L3 IPs unchanged** (except NAT).",
  },
  "obj-3.2-source-q012": {
    "correct": {"choiceIndex": 1, "explanation": "Local delivery: the host ARPs the destination and sets **destination MAC = destination host's MAC**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "The destination IP is **never** changed to the router for local traffic — it stays the target host.", "misconceptionTested": "Local traffic changes dest IP to router"},
      {"choiceIndex": 2, "explanation": "Using the **router's MAC** is for **remote** traffic — local uses the **destination host's MAC**.", "misconceptionTested": "Local traffic uses router MAC"},
      {"choiceIndex": 3, "explanation": "The **source IP** remains the sending host — routers don't change it.", "misconceptionTested": "Source IP changed to router on local send"},
    ],
    "examTip": "Local: MAC = **destination host** | Remote: MAC = **default gateway** | IP always = final destination.",
  },
  "obj-3.2-source-q013": {
    "correct": {"choiceIndex": 1, "explanation": "Host ANDs **its own subnet mask** with the destination IP and compares to its network address."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Hosts don't maintain a full **routing table** — they use mask ANDing + default gateway.", "misconceptionTested": "Host routing table lookup"},
      {"choiceIndex": 2, "explanation": "The host uses **its own mask**, not the destination's (unknown) mask — AND with **local mask**.", "misconceptionTested": "Destination subnet mask used for ANDing"},
      {"choiceIndex": 3, "explanation": "**ICMP** does not verify local vs remote — the host uses **subnet mask ANDing**.", "misconceptionTested": "ICMP verifies local network"},
    ],
    "examTip": "Local test: **(dest IP AND my mask) == (my IP AND my mask)** → on-link; else use gateway.",
  },
  "obj-3.2-source-q014": {
    "correct": {"choiceIndex": 3, "explanation": "**CEF (Cisco Express Forwarding)** is the default modern forwarding path — FIB + adjacency table for hardware-speed lookups."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Process switching** is the slowest legacy path — CPU handles every packet.", "misconceptionTested": "Process switching as current default"},
      {"choiceIndex": 1, "explanation": "**Fast switching** (route cache) was replaced by **CEF** on modern IOS.", "misconceptionTested": "Fast switching as current default"},
      {"choiceIndex": 2, "explanation": "\"Intelligent packet forwarding\" is not a Cisco forwarding mechanism — **CEF** is.", "misconceptionTested": "Invented intelligent forwarding term"},
    ],
    "examTip": "Forwarding evolution: process → fast → **CEF** | Verify: **`show ip cef`** / **`show ip route`**.",
  },
  "obj-3.2-source-q015": {
    "correct": {"choiceIndex": 1, "explanation": "At each router hop, L2 headers are **rewritten** (new source/dest MAC) — called **frame rewrite**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**IP routing** is the L3 process — L2 header changes per hop are **frame rewrite**.", "misconceptionTested": "IP routing as L2 hop process name"},
      {"choiceIndex": 2, "explanation": "\"Packet hopping\" is not the CCNA term — the L2 process is **frame rewrite**.", "misconceptionTested": "Invented packet hopping term"},
      {"choiceIndex": 3, "explanation": "**Packet switching** is generic — Cisco specifically calls L2 header replacement **frame rewrite**.", "misconceptionTested": "Packet switching as frame rewrite term"},
    ],
    "examTip": "Each router hop: L3 IP unchanged → **rewrite L2 MACs** (frame rewrite) → forward.",
  },
  "obj-3.2-source-q016": {
    "correct": {"choiceIndex": 2, "explanation": "ARP requests use a **broadcast** destination MAC (**ff:ff:ff:ff:ff:ff**) — who-has on the local segment."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "The **router's MAC** is used for **remote** traffic frames — ARP requests are **broadcast**.", "misconceptionTested": "ARP request unicast to router"},
      {"choiceIndex": 1, "explanation": "The host doesn't know the target MAC yet — that's why it sends a **broadcast** ARP.", "misconceptionTested": "ARP request unicast to host"},
      {"choiceIndex": 3, "explanation": "ARP uses **broadcast**, not multicast — all hosts on the segment see the request.", "misconceptionTested": "ARP as multicast"},
    ],
    "examTip": "ARP request frame: **broadcast MAC** | ARP reply: **unicast** back to requester.",
  },
  "obj-3.2-source-q017": {
    "correct": {"choiceIndex": 0, "explanation": "The **ARP cache** stores recent IP→MAC mappings — avoids repeating ARP for every packet."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**IP multicasting** is for group delivery — not ARP rate limiting.", "misconceptionTested": "IP multicast limits ARP"},
      {"choiceIndex": 2, "explanation": "\"Frame casting\" is not a real mechanism — **ARP cache** reduces broadcast ARP.", "misconceptionTested": "Invented frame casting term"},
      {"choiceIndex": 3, "explanation": "There is no **IP cache** for MAC resolution — the **ARP cache** serves that role.", "misconceptionTested": "IP cache for ARP limiting"},
    ],
    "examTip": "ARP cache: default **240s** (4 min) on Cisco | **`show ip arp`** to inspect.",
  },
  "obj-3.2-source-q018": {
    "correct": {"choiceIndex": 1, "explanation": "The router **strips the L2 frame**, reads the **destination IP**, looks up the route, then re-encapsulates."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Routers only accept frames destined to **their own MAC** (or broadcast) — not all frames.", "misconceptionTested": "Router accepts all incoming frames"},
      {"choiceIndex": 2, "explanation": "The router **must decapsulate** to read the IP header — can't route from L2 alone.", "misconceptionTested": "Route without decapsulation"},
      {"choiceIndex": 3, "explanation": "Routing decisions use **destination IP** (L3) — source MAC is rewritten, not used for lookup.", "misconceptionTested": "Route by source MAC address"},
    ],
    "examTip": "Router ingress: check **dest MAC = me** → decap → **dest IP lookup** → rewrite MAC → forward.",
  },
  "obj-3.2-source-q019": {
    "correct": {"choiceIndex": 3, "explanation": "**`show ip arp`** displays the ARP cache — IP addresses mapped to MAC addresses and age timers."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show arp`** is incomplete on IOS — the full command is **`show ip arp`**.", "misconceptionTested": "Truncated show arp command"},
      {"choiceIndex": 1, "explanation": "**`show arp table`** is not valid IOS syntax.", "misconceptionTested": "Invented show arp table command"},
      {"choiceIndex": 2, "explanation": "**`show arp cache`** does not exist — use **`show ip arp`**.", "misconceptionTested": "Invented show arp cache command"},
    ],
    "examTip": "ARP verify: **`show ip arp`** | Clear: **`clear arp-cache`** | Age default **240s**.",
  },
  "obj-3.2-source-q020": {
    "correct": {"choiceIndex": 1, "explanation": "Default ARP cache entry timeout on Cisco devices is **240 seconds** (4 minutes)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**180 seconds** (3 min) is not the Cisco default — it's **240 seconds**.", "misconceptionTested": "180-second ARP timeout"},
      {"choiceIndex": 2, "explanation": "**300 seconds** (5 min) is a common Windows default — Cisco IOS uses **240s**.", "misconceptionTested": "300-second ARP timeout on Cisco"},
      {"choiceIndex": 3, "explanation": "**600 seconds** (10 min) is too long — Cisco default is **240s**.", "misconceptionTested": "600-second ARP timeout"},
    ],
    "examTip": "Cisco ARP cache default: **240s** | Windows often **120–300s** — know Cisco for the exam.",
  },
  "obj-3.2-source-q021": {
    "correct": {"choiceIndex": 1, "explanation": "After route lookup, the router **rewrites the destination MAC** to the **next-hop device's MAC**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "TTL **decreases** by 1 per hop — it does not increase.", "misconceptionTested": "TTL increases per router hop"},
      {"choiceIndex": 2, "explanation": "Routers inspect the **IP header** (L3) for routing — not transport layer for destination network.", "misconceptionTested": "Transport layer checked for dest network"},
      {"choiceIndex": 3, "explanation": "The **destination IP stays the same** — the router changes the **MAC**, not the IP.", "misconceptionTested": "Router attaches next-hop IP to packet"},
    ],
    "examTip": "Router rewrite: **dest MAC = next hop** | **dest IP = unchanged** | **TTL − 1**.",
  },
  "obj-3.2-source-q022": {
    "correct": {"choiceIndex": 3, "explanation": "**ICMP** provides connectivity testing — **ping** and **traceroute** use ICMP echo and TTL-exceeded messages."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**IGMP** manages multicast groups — not route connectivity testing.", "misconceptionTested": "IGMP for route testing"},
      {"choiceIndex": 1, "explanation": "**RARP** resolves MAC→IP — obsolete; **ICMP** tests reachability.", "misconceptionTested": "RARP for connectivity testing"},
      {"choiceIndex": 2, "explanation": "**ARP** resolves IP→MAC on local segments — **ICMP** tests end-to-end connectivity.", "misconceptionTested": "ARP for route connectivity"},
    ],
    "examTip": "Connectivity test: **ping** (ICMP echo) | Path trace: **traceroute** (ICMP TTL exceeded).",
  },
  "obj-3.2-source-q023": {
    "correct": {"choiceIndex": 3, "explanation": "No matching route → router drops the packet and sends **ICMP Destination Unreachable** (network/host unreachable)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Cisco routers send **ICMP unreachable** — they don't silently discard without notification.", "misconceptionTested": "Silent discard on no route"},
      {"choiceIndex": 1, "explanation": "The router **drops** the packet and sends ICMP — it doesn't just set TTL to 0 in the forwarded packet.", "misconceptionTested": "TTL set to 0 instead of ICMP unreachable"},
      {"choiceIndex": 2, "explanation": "Packets are **not sent back** to the source as data — an **ICMP error message** is generated.", "misconceptionTested": "Original packet returned to source"},
    ],
    "examTip": "No route: **drop + ICMP Type 3** (destination unreachable) | Code 0=network, 1=host.",
  },
  "obj-3.2-source-q024": {
    "correct": {"choiceIndex": 1, "explanation": "A **routing loop** causes packets to **circulate endlessly** among routers — never reaching the destination."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Packets exiting one interface and returning on another describes **asymmetric routing**, not a loop.", "misconceptionTested": "Asymmetric routing as routing loop"},
      {"choiceIndex": 2, "explanation": "TTL expiry prevents infinite loops but describes the **symptom** — the loop is the **circular forwarding**.", "misconceptionTested": "TTL expiry as definition of routing loop"},
      {"choiceIndex": 3, "explanation": "An inefficient path is **suboptimal routing** — a loop means packets **never arrive**.", "misconceptionTested": "Suboptimal path as routing loop"},
    ],
    "examTip": "Routing loop signs: **TTL exceeded** ICMP, constant **hop count**, traceroute shows **repeating routers**.",
  },
  "obj-3.2-source-q025": {
    "correct": {"choiceIndex": 0, "explanation": "Dynamic routes live in **RAM** (running routing table) — lost on reload unless saved to startup config."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**Flash** stores IOS image and files — not the active routing table.", "misconceptionTested": "Dynamic routes in flash"},
      {"choiceIndex": 2, "explanation": "**Startup config** persists across reboots but dynamic routes are **relearned** — active table is in **RAM**.", "misconceptionTested": "Dynamic routes in startup config"},
      {"choiceIndex": 3, "explanation": "**Running config** has static route commands — the **active RIB** with all routes is in **RAM**.", "misconceptionTested": "Dynamic routes only in running config"},
    ],
    "examTip": "Active RIB = **RAM** | Static route **commands** in running-config | Dynamic routes **rebuilt** on boot.",
  },
  "obj-3.2-source-q026": {
    "correct": {"choiceIndex": 1, "explanation": "**`show ip cef`** displays the CEF Forwarding Information Base — prefixes with **next-hop adjacencies**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show cef`** alone is incomplete — use **`show ip cef`** for IPv4 CEF table.", "misconceptionTested": "Truncated show cef command"},
      {"choiceIndex": 2, "explanation": "**`show cef nop`** is not a standard IOS command.", "misconceptionTested": "Invented show cef nop command"},
      {"choiceIndex": 3, "explanation": "**`show cef route`** is not valid — use **`show ip cef [prefix]`**.", "misconceptionTested": "Invented show cef route command"},
    ],
    "examTip": "CEF verify: **`show ip cef`** (FIB) | **`show adjacency`** (L2 rewrite info) | **`show ip route`** (RIB).",
  },
  "obj-3.2-source-q027": {
    "correct": {"choiceIndex": 0, "explanation": "At each hop, the **destination MAC** is rewritten to the next-hop MAC — **destination IP stays constant**."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**Destination IP** is preserved end-to-end — only L2 addresses change per hop.", "misconceptionTested": "Destination IP changes per hop"},
      {"choiceIndex": 2, "explanation": "**Source IP** remains the original sender throughout the path (without NAT).", "misconceptionTested": "Source IP changes per hop"},
      {"choiceIndex": 3, "explanation": "\"Internal routes\" is not a packet field — **MAC addresses** change at each router.", "misconceptionTested": "Internal routes change during routing"},
    ],
    "examTip": "End-to-end constant: **source IP + dest IP** | Changes each hop: **source MAC + dest MAC**.",
  },
  "obj-3.2-source-q028": {
    "correct": {"choiceIndex": 2, "explanation": "No matching route and no default → router **drops the packet** and may send **ICMP unreachable**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Routers don't **flood** unknown destinations — that's a switch/bridge behavior.", "misconceptionTested": "Flood on no matching route"},
      {"choiceIndex": 1, "explanation": "Routers don't **multicast** unknown packets to other routers — they drop them.", "misconceptionTested": "Multicast to other routers on no route"},
      {"choiceIndex": 3, "explanation": "The original packet is **not returned** — an **ICMP error** may be sent to the source.", "misconceptionTested": "Return original packet to source"},
    ],
    "examTip": "No match + no default = **drop** (+ ICMP unreachable) | Not flood, not bounce back data.",
  },
  "obj-3.2-source-q029": {
    "correct": {"choiceIndex": 3, "explanation": "When interfaces are configured with IPs, **connected routes** appear automatically — no extra config needed."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Default routing** requires explicit configuration of a default route — not automatic.", "misconceptionTested": "Default routing automatic"},
      {"choiceIndex": 1, "explanation": "**Dynamic routes** require enabling a routing protocol — not automatic on boot.", "misconceptionTested": "Dynamic routes automatic by default"},
      {"choiceIndex": 2, "explanation": "**Static routes** must be manually configured — only **connected** routes are automatic.", "misconceptionTested": "Static routes automatic"},
    ],
    "examTip": "Automatic routes: **connected (C)** + **local (L)** from interface IPs | Everything else needs config.",
  },
  "obj-3.2-source-q030": {
    "correct": {"choiceIndex": 3, "explanation": "IPv6 default route: **`ipv6 route ::/0 s0/0`** — `::/0` is the all-zeros IPv6 prefix."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`ip route`** is IPv4 syntax — IPv6 uses **`ipv6 route`**.", "misconceptionTested": "ip route for IPv6 default"},
      {"choiceIndex": 1, "explanation": "IPv6 prefix is **`::/0`**, not `0.0.0.0/0` — that's IPv4 notation.", "misconceptionTested": "IPv4 prefix in ipv6 route command"},
      {"choiceIndex": 2, "explanation": "**`ipv6 unicast-route`** is not valid IOS — use **`ipv6 route ::/0 <interface>`**.", "misconceptionTested": "Invented ipv6 unicast-route command"},
    ],
    "examTip": "IPv6 default: **`ipv6 route ::/0 <next-hop or interface>`** | IPv4: **`ip route 0.0.0.0 0.0.0.0`**.",
  },
  "obj-3.2-source-q031": {
    "correct": {"choiceIndex": 3, "explanation": "**RIPng**, **OSPFv3**, and **EIGRPv6** all support IPv6 dynamic routing."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**RIPng** alone is correct but incomplete — **OSPFv3** and **EIGRPv6** also support IPv6.", "misconceptionTested": "Only RIPng supports IPv6"},
      {"choiceIndex": 1, "explanation": "**OSPFv3** alone is correct but incomplete — **RIPng** and **EIGRPv6** also work.", "misconceptionTested": "Only OSPFv3 supports IPv6"},
      {"choiceIndex": 2, "explanation": "**EIGRPv6** alone is correct but incomplete — all three major protocols have IPv6 versions.", "misconceptionTested": "Only EIGRPv6 supports IPv6"},
    ],
    "examTip": "IPv6 IGPs: **RIPng** | **OSPFv3** (new process, same concepts) | **EIGRPv6** (address-family).",
  },
  "obj-3.2-source-q032": {
    "correct": {"choiceIndex": 2, "explanation": "**`show ipv6 route`** displays only the IPv6 routing table — separate from IPv4."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show route`** is not valid IOS syntax.", "misconceptionTested": "Invented show route command"},
      {"choiceIndex": 1, "explanation": "**`show ip route`** shows **IPv4 only** — IPv6 needs **`show ipv6 route`**.", "misconceptionTested": "show ip route for IPv6 table"},
      {"choiceIndex": 3, "explanation": "**`show route ipv6`** reverses the syntax — correct is **`show ipv6 route`**.", "misconceptionTested": "Reversed show route ipv6 syntax"},
    ],
    "examTip": "IPv4: **`show ip route`** | IPv6: **`show ipv6 route`** | Both: run each separately.",
  },
  "obj-3.2-source-q033": {
    "correct": {"choiceIndex": 2, "explanation": "For remote traffic, the host must **ARP-resolve the default gateway's MAC** before sending the frame."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "The destination IP **always remains the final host** — never swapped with the gateway address.", "misconceptionTested": "Destination IP replaced with gateway"},
      {"choiceIndex": 1, "explanation": "Data packets go **unicast to the gateway MAC** — not broadcast to the gateway.", "misconceptionTested": "Broadcast remote packets to gateway"},
      {"choiceIndex": 3, "explanation": "IP is connectionless — no **dedicated connection** is established with the gateway.", "misconceptionTested": "Dedicated gateway connection for remote"},
    ],
    "examTip": "First remote packet: **ARP gateway** → set dest MAC = gateway → dest IP = remote host.",
  },
  "obj-3.2-source-q034": {
    "correct": {"choiceIndex": 0, "explanation": "**`show ip route`** is the standard command to view the IPv4 routing table on Cisco IOS."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**`show route`** is not a valid Cisco command.", "misconceptionTested": "Invented show route command"},
      {"choiceIndex": 2, "explanation": "**`show route table`** does not exist in IOS.", "misconceptionTested": "Invented show route table command"},
      {"choiceIndex": 3, "explanation": "**`show routes`** (plural) is invalid — use **`show ip route`**.", "misconceptionTested": "Plural show routes command"},
    ],
    "examTip": "Routing table commands: **`show ip route`** (v4) | **`show ipv6 route`** (v6) | **`show ip route summary`**.",
  },
  "obj-3.2-source-q035": {
    "correct": {"choiceIndex": 2, "explanation": "**ARP** bridges L3 routing to L2 delivery — resolves next-hop MAC so the frame can be forwarded."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**IGMP** handles multicast group membership — not L2 address resolution for routing.", "misconceptionTested": "IGMP facilitates packet routing"},
      {"choiceIndex": 1, "explanation": "**RARP** maps MAC→IP (obsolete) — **ARP** maps IP→MAC for frame delivery.", "misconceptionTested": "RARP facilitates packet routing"},
      {"choiceIndex": 3, "explanation": "**ICMP** reports errors and enables diagnostics — **ARP** enables actual L2 forwarding.", "misconceptionTested": "ICMP as primary routing facilitator"},
    ],
    "examTip": "Routing needs ARP at each hop: **IP route lookup → ARP next-hop MAC → frame rewrite → forward**.",
  },
  "obj-3.2-source-q036": {
    "correct": {"choiceIndex": 2, "explanation": "**Ping** sends ICMP echo requests — a direct reachability test to a router or host."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**SNMP traps** are asynchronous alerts — not an active ICMP reachability check.", "misconceptionTested": "SNMP traps as router status check"},
      {"choiceIndex": 1, "explanation": "\"Notifications\" is vague — **ping** (ICMP echo) is the standard direct status check.", "misconceptionTested": "Generic notifications for router check"},
      {"choiceIndex": 3, "explanation": "**ARP** resolves MAC addresses — **ping** (ICMP) tests L3 reachability.", "misconceptionTested": "ARP as router status check"},
    ],
    "examTip": "Router reachability: **`ping <ip>`** (ICMP echo) | Extended: **`traceroute`** for hop-by-hop.",
  },
  "obj-3.2-source-q037": {
    "correct": {"choiceIndex": 2, "explanation": "Cisco ping output: **`!`** = echo reply received (success) | **`.`** = timeout (no response)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "No response shows **`.`** (dots), not exclamation marks — **`!`** means success.", "misconceptionTested": "Exclamation marks mean no response"},
      {"choiceIndex": 1, "explanation": "Ping doesn't indicate **high vs low response time** with `!` — it only confirms **reply received**.", "misconceptionTested": "Exclamation marks indicate high latency"},
      {"choiceIndex": 3, "explanation": "**`!`** confirms the host responded — it does not measure or display low response time.", "misconceptionTested": "Exclamation marks indicate low latency"},
    ],
    "examTip": "Ping symbols: **`!`** = success | **`.`** = timeout | **`U`** = unreachable | **`Q`** = source quench.",
  },
  # === OSPF 3.4 ===
  "obj-3.4-source-q062": {
    "correct": {"choiceIndex": 0, "explanation": "On Frame Relay (NBMA), default hello is **30s** — mismatched timers (10 vs 30) **prevent adjacency formation**."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Multiple area IDs on one router is valid (ABR) — it doesn't block adjacency in the **same area**.", "misconceptionTested": "Multiple area IDs block adjacency"},
      {"choiceIndex": 2, "explanation": "Hello **10** on Router A is fine **if both sides match** — the problem is **mismatch**, not 10 alone.", "misconceptionTested": "Hello 10 always blocks adjacency"},
      {"choiceIndex": 3, "explanation": "Hello **10** on Router B is valid on broadcast — on Frame Relay both must be **30** (or both 10 if configured).", "misconceptionTested": "Hello 10 on one side always the problem"},
    ],
    "examTip": "OSPF adjacency needs: **matching area**, **hello/dead timers**, **subnet**, **auth** | NBMA default hello=**30s**.",
  },
  "obj-3.4-source-q063": {
    "correct": {"choiceIndex": 1, "explanation": "OSPF administrative distance is **110** — appears as **[110/metric]** in `show ip route`."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**90** is **EIGRP** internal AD — OSPF is **110**.", "misconceptionTested": "AD 90 for OSPF"},
      {"choiceIndex": 2, "explanation": "**120** is **RIP** AD — OSPF is more trusted at **110**.", "misconceptionTested": "AD 120 for OSPF"},
      {"choiceIndex": 3, "explanation": "**200** is not a standard IGP AD — OSPF = **110**.", "misconceptionTested": "AD 200 for OSPF"},
    ],
    "examTip": "AD ladder: Connected=0, Static=1, EIGRP=90, **OSPF=110**, IS-IS=115, RIP=120.",
  },
  # === NTP 4.2 ===
  "obj-4.2-source-q003": {
    "correct": {"choiceIndex": 0, "explanation": "**`show clock detail`** reveals whether time is **NTP-synchronized** or manually set — shows source and stratum."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**`show ntp`** alone is incomplete — **`show clock detail`** confirms NTP sync status.", "misconceptionTested": "Truncated show ntp command"},
      {"choiceIndex": 2, "explanation": "**`show time`** is not a valid Cisco IOS command.", "misconceptionTested": "Invented show time command"},
      {"choiceIndex": 3, "explanation": "**`show time source`** does not exist — use **`show clock detail`**.", "misconceptionTested": "Invented show time source command"},
    ],
    "examTip": "NTP sync check: **`show clock detail`** (synced vs unsynced) | **`show ntp status`** for stratum.",
  },
  "obj-4.2-source-q004": {
    "correct": {"choiceIndex": 2, "explanation": "**`show ntp associations detail`** shows configured NTP servers, reachability, stratum, and offset per peer."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show clock detail`** shows local clock sync status — not per-server association details.", "misconceptionTested": "show clock detail for server associations"},
      {"choiceIndex": 1, "explanation": "**`show ntp detail`** is not the standard command — use **`show ntp associations detail`**.", "misconceptionTested": "Invented show ntp detail command"},
      {"choiceIndex": 3, "explanation": "**`show ntp skew`** is not valid IOS — server details are in **`show ntp associations detail`**.", "misconceptionTested": "Invented show ntp skew command"},
    ],
    "examTip": "NTP verify: **`show ntp associations`** (summary) | **`detail`** for per-server stratum/offset/reach.",
  },
}

assert len(HAND) == 50, f"Expected 50, got {len(HAND)}"

def fmt_entry(id_, rev):
    body = json.dumps(rev, indent=2)
    indented = "\n".join("  " + line if line else line for line in body.splitlines())
    return f"  '{id_}': {indented},"

lines = [
    "/** Gold reviews — Batch 27: routing table 3.1, packet forwarding/ARP/ICMP 3.2, OSPF 3.4, NTP 4.2 (50 entries). */",
    "export const BATCH27_GOLD = {",
]
for id_, rev in HAND.items():
    lines.append(fmt_entry(id_, rev))
lines.append("}")
lines.append("")

out = ROOT / "src/answerReview/goldAnswerReviewsBatch27.js"
out.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {len(HAND)} entries to {out.relative_to(ROOT)}")
