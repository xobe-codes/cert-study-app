/** Gold reviews — Batch 27: routing table 3.1, packet forwarding/ARP/ICMP 3.2, OSPF 3.4, NTP 4.2 (50 entries). */
export const BATCH27_GOLD = {
  'obj-3.1-source-q019':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "OSPF cost = **10\u2078 / bandwidth (bps)** \u2014 e.g. 100 Mbps \u2192 cost **1**, 10 Mbps \u2192 cost **10**."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Bandwidth + delay + reliability + load is the **EIGRP composite metric** \u2014 OSPF uses **cost = 10\u2078/bandwidth** only.",
        "misconceptionTested": "EIGRP metric formula applied to OSPF"
      },
      {
        "choiceIndex": 2,
        "explanation": "**K-values** tune EIGRP metric weights \u2014 OSPF has no K-metrics.",
        "misconceptionTested": "K-metrics in OSPF"
      },
      {
        "choiceIndex": 3,
        "explanation": "Raw bandwidth alone is not the metric \u2014 IOS converts it to **cost** via **10\u2078/bandwidth**.",
        "misconceptionTested": "Bandwidth as direct OSPF metric"
      }
    ],
    "examTip": "OSPF cost = **10\u2078 \u00f7 interface bandwidth (bps)** | 100M=1, 10M=10, 1.544M\u224864."
  },
  'obj-3.1-source-q020':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**[110/1]** = AD **110** (OSPF) and metric **1** \u2014 cost 1 means a **100 Mbps** link (10\u2078/10\u2078)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Metric **1** = 100 Mbps, not 10 Mbps \u2014 10 Mbps would show metric **10**.",
        "misconceptionTested": "OSPF metric 1 as 10 Mbps link"
      },
      {
        "choiceIndex": 2,
        "explanation": "AD and metric are **reversed** \u2014 format is **[AD/metric]**, so 110 is AD, 1 is metric.",
        "misconceptionTested": "AD and metric swapped in bracket notation"
      },
      {
        "choiceIndex": 3,
        "explanation": "Metric **1** corresponds to **100 Mbps**, not 1 Gbps \u2014 1 Gbps would be cost **0** (treated as 1).",
        "misconceptionTested": "OSPF metric 1 as 1 Gbps"
      }
    ],
    "examTip": "`show ip route` bracket = **[AD/metric]** | OSPF AD=110 | Cost 1 = 100M, 10 = 10M."
  },
  'obj-3.1-source-q021':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**0.0.0.0/0** is the **default route** \u2014 matches any destination when no more-specific route exists."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "A **local route** is a /32 for an interface IP (L in table) \u2014 not 0.0.0.0/0.",
        "misconceptionTested": "Default route as local route"
      },
      {
        "choiceIndex": 1,
        "explanation": "Default routes can be **static or dynamic** \u2014 0.0.0.0/0 is not exclusively dynamic.",
        "misconceptionTested": "0.0.0.0/0 as dynamic-only route type"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Loopback** is an interface type \u2014 0.0.0.0/0 is a **catch-all default** prefix.",
        "misconceptionTested": "Default route as loopback route"
      }
    ],
    "examTip": "Default route = **0.0.0.0/0** (IPv4) or **::/0** (IPv6) \u2014 gateway of last resort."
  },
  'obj-3.1-source-q022':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "A **host route** is a **/32** entry for one specific host address \u2014 longest possible prefix match."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "The **default route** (0.0.0.0/0) is the last-resort match \u2014 not a host route.",
        "misconceptionTested": "Host route as default route"
      },
      {
        "choiceIndex": 1,
        "explanation": "Host routes are **configured or learned** \u2014 the table does not auto-discover every destination host.",
        "misconceptionTested": "Routing table auto-creates host routes"
      },
      {
        "choiceIndex": 3,
        "explanation": "**HSRP** provides gateway redundancy \u2014 it does not populate host routes in the RIB.",
        "misconceptionTested": "HSRP populates host routes"
      }
    ],
    "examTip": "Host route = **/32** (one IP) | Often seen as `L` (local) or static `192.168.1.5/32`."
  },
  'obj-3.1-source-q023':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "The **routing protocol code** (C, S, O, D, R\u2026) in the first column shows **how the route was learned**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Prefix/mask identifies the **destination network** \u2014 not the learning source.",
        "misconceptionTested": "Prefix as route source identifier"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Metric** ranks paths within one protocol \u2014 code letter shows the **source/protocol**.",
        "misconceptionTested": "Metric as route source identifier"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Next hop** is where to forward \u2014 the **code letter** (C/S/O/D) shows origin.",
        "misconceptionTested": "Next hop as route source identifier"
      }
    ],
    "examTip": "Route codes: **C**=connected, **S**=static, **O**=OSPF, **D**=EIGRP, **R**=RIP, **L**=local."
  },
  'obj-3.1-source-q024':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "A **host** ANDs its subnet mask with the destination IP to decide if the target is **on-link or remote**."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Routers use the **routing table** (longest match) \u2014 hosts use mask ANDing for local vs remote.",
        "misconceptionTested": "Router uses subnet mask like a host"
      },
      {
        "choiceIndex": 2,
        "explanation": "Routers route by **longest prefix match** in the RIB \u2014 they don't AND their own mask per packet.",
        "misconceptionTested": "Router ANDs its mask when forwarding"
      },
      {
        "choiceIndex": 3,
        "explanation": "The destination host checks its **own IP**, not the packet's mask field \u2014 mask is not in the IP header.",
        "misconceptionTested": "Destination checks packet subnet mask"
      }
    ],
    "examTip": "Host local/remote test: **(dest IP AND mask) == (my IP AND mask)** \u2192 local; else use default gateway."
  },
  'obj-3.1-source-q025':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "IOS 15 installs a **local route** (/32) for each configured interface IP \u2014 shown with **L** code."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "\"IP address route\" is not a Cisco term \u2014 IOS calls it a **local route**.",
        "misconceptionTested": "Invented IP address route term"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Dynamic routes** come from routing protocols \u2014 interface IPs create **connected/local** routes.",
        "misconceptionTested": "Interface IP as dynamic route"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Static routes** are manually configured \u2014 interface IPs auto-generate **connected + local** entries.",
        "misconceptionTested": "Interface IP as static route"
      }
    ],
    "examTip": "Interface IP \u2192 **C** (connected network) + **L** (local /32 host route) in `show ip route`."
  },
  'obj-3.1-source-q026':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "For a **remote** destination, the host **ARP-resolves the default gateway's MAC** \u2014 IP stays the final destination."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "The **destination IP is never replaced** with the gateway \u2014 only the **L2 MAC** changes to the gateway.",
        "misconceptionTested": "Destination IP replaced with gateway"
      },
      {
        "choiceIndex": 1,
        "explanation": "The host does not broadcast **data packets** to the gateway \u2014 it sends a **unicast ARP request** for the gateway MAC.",
        "misconceptionTested": "Remote traffic sent via broadcast to gateway"
      },
      {
        "choiceIndex": 3,
        "explanation": "IP is **connectionless** \u2014 no dedicated connection is created with the default gateway.",
        "misconceptionTested": "Dedicated connection to default gateway"
      }
    ],
    "examTip": "Remote send: IP = **final host** | MAC = **default gateway** (after ARP) | Local send: MAC = destination host."
  },
  'obj-3.1-source-q027':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**`show ip route`** displays the IPv4 routing table \u2014 prefixes, next hops, AD/metric, and codes."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**`show route`** is not valid IOS \u2014 use **`show ip route`** or **`show ipv6 route`**.",
        "misconceptionTested": "Invented show route command"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`show route table`** does not exist \u2014 correct command is **`show ip route`**.",
        "misconceptionTested": "Invented show route table command"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`show routes`** is not valid \u2014 IOS uses **`show ip route`**.",
        "misconceptionTested": "Plural show routes command"
      }
    ],
    "examTip": "IPv4 RIB: **`show ip route`** | IPv6 RIB: **`show ipv6 route`** | Summary: add **`summary`**."
  },
  'obj-3.2-source-q001':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**ICMP** reports delivery problems \u2014 e.g. **destination unreachable** when no route exists or host is down."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Routing tables are built by **routing protocols or static config** \u2014 ICMP does not populate routes.",
        "misconceptionTested": "ICMP populates routing table"
      },
      {
        "choiceIndex": 2,
        "explanation": "ICMP does not **maintain** the routing table \u2014 protocols like OSPF/EIGRP do.",
        "misconceptionTested": "ICMP maintains routing table"
      },
      {
        "choiceIndex": 3,
        "explanation": "ICMP provides **on-demand diagnostics** (ping/traceroute) \u2014 not continuous path monitoring.",
        "misconceptionTested": "ICMP continuous path diagnosis"
      }
    ],
    "examTip": "ICMP role in routing: **error reporting** (unreachable, TTL exceeded) + **diagnostics** (ping/traceroute)."
  },
  'obj-3.2-source-q002':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "When prefixes overlap, the router picks the **longest matching prefix** (most specific netmask)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Lowest metric** breaks ties **within the same prefix length** \u2014 longest match decides first.",
        "misconceptionTested": "Metric before longest prefix match"
      },
      {
        "choiceIndex": 2,
        "explanation": "The route with **highest AD** loses \u2014 lowest AD wins when sources compete.",
        "misconceptionTested": "Highest AD selected"
      },
      {
        "choiceIndex": 3,
        "explanation": "**AD** resolves competing routes from **different sources** for the same prefix \u2014 longest match comes first.",
        "misconceptionTested": "AD before longest prefix match"
      }
    ],
    "examTip": "Route selection order: **1) longest prefix match \u2192 2) lowest AD \u2192 3) lowest metric**."
  },
  'obj-3.2-source-q003':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**Static default** (AD **1**) beats **RIP default** (AD **120**) \u2014 lowest AD wins for the same prefix."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Higher AD is **less trusted** \u2014 static (1) always beats RIP (120).",
        "misconceptionTested": "Highest AD wins default route"
      },
      {
        "choiceIndex": 2,
        "explanation": "Both are default routes (0.0.0.0/0) \u2014 **AD** decides, not metric, when sources differ.",
        "misconceptionTested": "Metric decides between protocol sources"
      },
      {
        "choiceIndex": 3,
        "explanation": "RIP's AD **120** loses to static's **1** \u2014 the static route is installed.",
        "misconceptionTested": "Dynamic route always wins over static"
      }
    ],
    "examTip": "Same prefix, different sources \u2192 **lowest AD wins** | Static=1 beats RIP=120 every time."
  },
  'obj-3.2-source-q004':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "A **host route** is a **/32** entry pointing to one specific host \u2014 the most specific possible match."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**0.0.0.0/0** is the default (last-resort) route \u2014 not a host-specific /32.",
        "misconceptionTested": "Host route as catch-all default"
      },
      {
        "choiceIndex": 1,
        "explanation": "Routers don't auto-create routes for every host they see \u2014 host routes are **configured or protocol-learned**.",
        "misconceptionTested": "Auto-discovered host routes"
      },
      {
        "choiceIndex": 3,
        "explanation": "**HSRP/VRRP** provides redundant gateways \u2014 they don't install /32 host routes.",
        "misconceptionTested": "HSRP creates host routes"
      }
    ],
    "examTip": "Host route = **/32** for one IP | Longest match always beats broader prefixes."
  },
  'obj-3.2-source-q005':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "The **protocol code** (C, S, O, D, R\u2026) in column one identifies **where/how** the route was learned."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Prefix and mask define the **destination** \u2014 not the learning source.",
        "misconceptionTested": "Prefix identifies route source"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Metric** compares paths within one protocol \u2014 the **code letter** shows the source.",
        "misconceptionTested": "Metric identifies route source"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Next hop** is the forward target \u2014 origin is shown by the **route code**.",
        "misconceptionTested": "Next hop identifies route source"
      }
    ],
    "examTip": "Read `show ip route` left-to-right: **code \u2192 prefix \u2192 [AD/metric] \u2192 next-hop/interface**."
  },
  'obj-3.2-source-q006':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Routers forward based on the **destination IP address** \u2014 longest prefix match in the routing table."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Source IP** is not used for forwarding decisions \u2014 destination IP drives the lookup.",
        "misconceptionTested": "Source IP for routing decision"
      },
      {
        "choiceIndex": 2,
        "explanation": "**TTL** is decremented per hop but does not select the outbound interface or next hop.",
        "misconceptionTested": "TTL as routing criteria"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Destination MAC** is L2 \u2014 routers route using **L3 destination IP**.",
        "misconceptionTested": "Destination MAC for routing"
      }
    ],
    "examTip": "L3 routing decision = **destination IP** \u2192 RIB lookup \u2192 rewrite L2 MAC for next hop."
  },
  'obj-3.2-source-q007':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**Static routes** require an administrator to manually configure prefixes and next hops."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Link-state** (OSPF/IS-IS) is **dynamic** \u2014 routers exchange LSAs automatically.",
        "misconceptionTested": "Link-state as admin-configured"
      },
      {
        "choiceIndex": 1,
        "explanation": "**Distance-vector** (RIP/EIGRP) is **dynamic** \u2014 protocols build tables without per-route manual entry.",
        "misconceptionTested": "Distance-vector as admin-configured"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Dynamic routing** adapts automatically \u2014 static is the one needing **manual intervention**.",
        "misconceptionTested": "Dynamic routing requires admin per route"
      }
    ],
    "examTip": "Static = **admin configures** | Dynamic = **protocol learns** | Connected = **auto from interfaces**."
  },
  'obj-3.2-source-q008':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Hosts **AND the subnet mask** with the destination IP to determine if the target is on the **local subnet**."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Routers use the **routing table** (prefix lookup) \u2014 mask ANDing is a **host** operation.",
        "misconceptionTested": "Router uses mask ANDing like host"
      },
      {
        "choiceIndex": 2,
        "explanation": "Routers match **destination IP to route prefixes** \u2014 they don't apply their interface mask per packet.",
        "misconceptionTested": "Router ANDs its mask when routing"
      },
      {
        "choiceIndex": 3,
        "explanation": "Subnet mask is **not carried in the IP packet** \u2014 receiving hosts don't check a mask field.",
        "misconceptionTested": "Destination verifies packet subnet mask"
      }
    ],
    "examTip": "Host: mask ANDing \u2192 local vs remote | Router: **longest prefix match** in RIB."
  },
  'obj-3.2-source-q009':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**ARP** resolves the destination host's **MAC address** when the target is on the local subnet."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**IGMP** manages multicast group membership \u2014 not L2 address resolution.",
        "misconceptionTested": "IGMP for local MAC resolution"
      },
      {
        "choiceIndex": 1,
        "explanation": "**RARP** maps MAC \u2192 IP (reverse) \u2014 modern networks use **ARP** (IP \u2192 MAC).",
        "misconceptionTested": "RARP for forward MAC lookup"
      },
      {
        "choiceIndex": 3,
        "explanation": "**ICMP** is L3 diagnostics/errors \u2014 **ARP** handles L2 address resolution on local segments.",
        "misconceptionTested": "ICMP for MAC resolution"
      }
    ],
    "examTip": "Local delivery: **ARP** (IP\u2192MAC) | Remote delivery: ARP the **default gateway** MAC."
  },
  'obj-3.2-source-q010':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "For remote destinations, the host sets the frame's **destination MAC to the router's MAC** (default gateway)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "The **destination IP never changes** on the host \u2014 only the **MAC** is rewritten to the gateway.",
        "misconceptionTested": "Destination IP changed to router"
      },
      {
        "choiceIndex": 1,
        "explanation": "Using the **destination host's MAC** only works for **local** subnets \u2014 remote needs the **router's MAC**.",
        "misconceptionTested": "Remote traffic uses destination host MAC"
      },
      {
        "choiceIndex": 3,
        "explanation": "The **source IP** stays the sending host \u2014 it is not changed to the router's address.",
        "misconceptionTested": "Source IP changed to router"
      }
    ],
    "examTip": "Remote packet from host: **dest IP = final host** | **dest MAC = default gateway**."
  },
  'obj-3.2-source-q011':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Every router **decrements TTL by 1** \u2014 at zero, the packet is dropped and **ICMP TTL exceeded** is sent."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "The destination IP is **preserved** end-to-end \u2014 routers don't rewrite it to \"original destination\".",
        "misconceptionTested": "Router rewrites destination IP"
      },
      {
        "choiceIndex": 2,
        "explanation": "The router **rewrites source MAC** to its egress interface \u2014 it does not restore the original source MAC.",
        "misconceptionTested": "Source MAC restored to original"
      },
      {
        "choiceIndex": 3,
        "explanation": "TTL decrement is the key router action \u2014 not all three statements are true.",
        "misconceptionTested": "All router hop actions combined"
      }
    ],
    "examTip": "Router hop: **TTL\u22121** | **rewrite L2 MACs** | **L3 IPs unchanged** (except NAT)."
  },
  'obj-3.2-source-q012':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Local delivery: the host ARPs the destination and sets **destination MAC = destination host's MAC**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "The destination IP is **never** changed to the router for local traffic \u2014 it stays the target host.",
        "misconceptionTested": "Local traffic changes dest IP to router"
      },
      {
        "choiceIndex": 2,
        "explanation": "Using the **router's MAC** is for **remote** traffic \u2014 local uses the **destination host's MAC**.",
        "misconceptionTested": "Local traffic uses router MAC"
      },
      {
        "choiceIndex": 3,
        "explanation": "The **source IP** remains the sending host \u2014 routers don't change it.",
        "misconceptionTested": "Source IP changed to router on local send"
      }
    ],
    "examTip": "Local: MAC = **destination host** | Remote: MAC = **default gateway** | IP always = final destination."
  },
  'obj-3.2-source-q013':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Host ANDs **its own subnet mask** with the destination IP and compares to its network address."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Hosts don't maintain a full **routing table** \u2014 they use mask ANDing + default gateway.",
        "misconceptionTested": "Host routing table lookup"
      },
      {
        "choiceIndex": 2,
        "explanation": "The host uses **its own mask**, not the destination's (unknown) mask \u2014 AND with **local mask**.",
        "misconceptionTested": "Destination subnet mask used for ANDing"
      },
      {
        "choiceIndex": 3,
        "explanation": "**ICMP** does not verify local vs remote \u2014 the host uses **subnet mask ANDing**.",
        "misconceptionTested": "ICMP verifies local network"
      }
    ],
    "examTip": "Local test: **(dest IP AND my mask) == (my IP AND my mask)** \u2192 on-link; else use gateway."
  },
  'obj-3.2-source-q014':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**CEF (Cisco Express Forwarding)** is the default modern forwarding path \u2014 FIB + adjacency table for hardware-speed lookups."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Process switching** is the slowest legacy path \u2014 CPU handles every packet.",
        "misconceptionTested": "Process switching as current default"
      },
      {
        "choiceIndex": 1,
        "explanation": "**Fast switching** (route cache) was replaced by **CEF** on modern IOS.",
        "misconceptionTested": "Fast switching as current default"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Intelligent packet forwarding\" is not a Cisco forwarding mechanism \u2014 **CEF** is.",
        "misconceptionTested": "Invented intelligent forwarding term"
      }
    ],
    "examTip": "Forwarding evolution: process \u2192 fast \u2192 **CEF** | Verify: **`show ip cef`** / **`show ip route`**."
  },
  'obj-3.2-source-q015':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "At each router hop, L2 headers are **rewritten** (new source/dest MAC) \u2014 called **frame rewrite**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**IP routing** is the L3 process \u2014 L2 header changes per hop are **frame rewrite**.",
        "misconceptionTested": "IP routing as L2 hop process name"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Packet hopping\" is not the CCNA term \u2014 the L2 process is **frame rewrite**.",
        "misconceptionTested": "Invented packet hopping term"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Packet switching** is generic \u2014 Cisco specifically calls L2 header replacement **frame rewrite**.",
        "misconceptionTested": "Packet switching as frame rewrite term"
      }
    ],
    "examTip": "Each router hop: L3 IP unchanged \u2192 **rewrite L2 MACs** (frame rewrite) \u2192 forward."
  },
  'obj-3.2-source-q016':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "ARP requests use a **broadcast** destination MAC (**ff:ff:ff:ff:ff:ff**) \u2014 who-has on the local segment."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "The **router's MAC** is used for **remote** traffic frames \u2014 ARP requests are **broadcast**.",
        "misconceptionTested": "ARP request unicast to router"
      },
      {
        "choiceIndex": 1,
        "explanation": "The host doesn't know the target MAC yet \u2014 that's why it sends a **broadcast** ARP.",
        "misconceptionTested": "ARP request unicast to host"
      },
      {
        "choiceIndex": 3,
        "explanation": "ARP uses **broadcast**, not multicast \u2014 all hosts on the segment see the request.",
        "misconceptionTested": "ARP as multicast"
      }
    ],
    "examTip": "ARP request frame: **broadcast MAC** | ARP reply: **unicast** back to requester."
  },
  'obj-3.2-source-q017':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "The **ARP cache** stores recent IP\u2192MAC mappings \u2014 avoids repeating ARP for every packet."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**IP multicasting** is for group delivery \u2014 not ARP rate limiting.",
        "misconceptionTested": "IP multicast limits ARP"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Frame casting\" is not a real mechanism \u2014 **ARP cache** reduces broadcast ARP.",
        "misconceptionTested": "Invented frame casting term"
      },
      {
        "choiceIndex": 3,
        "explanation": "There is no **IP cache** for MAC resolution \u2014 the **ARP cache** serves that role.",
        "misconceptionTested": "IP cache for ARP limiting"
      }
    ],
    "examTip": "ARP cache: default **240s** (4 min) on Cisco | **`show ip arp`** to inspect."
  },
  'obj-3.2-source-q018':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "The router **strips the L2 frame**, reads the **destination IP**, looks up the route, then re-encapsulates."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Routers only accept frames destined to **their own MAC** (or broadcast) \u2014 not all frames.",
        "misconceptionTested": "Router accepts all incoming frames"
      },
      {
        "choiceIndex": 2,
        "explanation": "The router **must decapsulate** to read the IP header \u2014 can't route from L2 alone.",
        "misconceptionTested": "Route without decapsulation"
      },
      {
        "choiceIndex": 3,
        "explanation": "Routing decisions use **destination IP** (L3) \u2014 source MAC is rewritten, not used for lookup.",
        "misconceptionTested": "Route by source MAC address"
      }
    ],
    "examTip": "Router ingress: check **dest MAC = me** \u2192 decap \u2192 **dest IP lookup** \u2192 rewrite MAC \u2192 forward."
  },
  'obj-3.2-source-q019':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**`show ip arp`** displays the ARP cache \u2014 IP addresses mapped to MAC addresses and age timers."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`show arp`** is incomplete on IOS \u2014 the full command is **`show ip arp`**.",
        "misconceptionTested": "Truncated show arp command"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`show arp table`** is not valid IOS syntax.",
        "misconceptionTested": "Invented show arp table command"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`show arp cache`** does not exist \u2014 use **`show ip arp`**.",
        "misconceptionTested": "Invented show arp cache command"
      }
    ],
    "examTip": "ARP verify: **`show ip arp`** | Clear: **`clear arp-cache`** | Age default **240s**."
  },
  'obj-3.2-source-q020':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Default ARP cache entry timeout on Cisco devices is **240 seconds** (4 minutes)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**180 seconds** (3 min) is not the Cisco default \u2014 it's **240 seconds**.",
        "misconceptionTested": "180-second ARP timeout"
      },
      {
        "choiceIndex": 2,
        "explanation": "**300 seconds** (5 min) is a common Windows default \u2014 Cisco IOS uses **240s**.",
        "misconceptionTested": "300-second ARP timeout on Cisco"
      },
      {
        "choiceIndex": 3,
        "explanation": "**600 seconds** (10 min) is too long \u2014 Cisco default is **240s**.",
        "misconceptionTested": "600-second ARP timeout"
      }
    ],
    "examTip": "Cisco ARP cache default: **240s** | Windows often **120\u2013300s** \u2014 know Cisco for the exam."
  },
  'obj-3.2-source-q021':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "After route lookup, the router **rewrites the destination MAC** to the **next-hop device's MAC**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "TTL **decreases** by 1 per hop \u2014 it does not increase.",
        "misconceptionTested": "TTL increases per router hop"
      },
      {
        "choiceIndex": 2,
        "explanation": "Routers inspect the **IP header** (L3) for routing \u2014 not transport layer for destination network.",
        "misconceptionTested": "Transport layer checked for dest network"
      },
      {
        "choiceIndex": 3,
        "explanation": "The **destination IP stays the same** \u2014 the router changes the **MAC**, not the IP.",
        "misconceptionTested": "Router attaches next-hop IP to packet"
      }
    ],
    "examTip": "Router rewrite: **dest MAC = next hop** | **dest IP = unchanged** | **TTL \u2212 1**."
  },
  'obj-3.2-source-q022':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**ICMP** provides connectivity testing \u2014 **ping** and **traceroute** use ICMP echo and TTL-exceeded messages."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**IGMP** manages multicast groups \u2014 not route connectivity testing.",
        "misconceptionTested": "IGMP for route testing"
      },
      {
        "choiceIndex": 1,
        "explanation": "**RARP** resolves MAC\u2192IP \u2014 obsolete; **ICMP** tests reachability.",
        "misconceptionTested": "RARP for connectivity testing"
      },
      {
        "choiceIndex": 2,
        "explanation": "**ARP** resolves IP\u2192MAC on local segments \u2014 **ICMP** tests end-to-end connectivity.",
        "misconceptionTested": "ARP for route connectivity"
      }
    ],
    "examTip": "Connectivity test: **ping** (ICMP echo) | Path trace: **traceroute** (ICMP TTL exceeded)."
  },
  'obj-3.2-source-q023':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "No matching route \u2192 router drops the packet and sends **ICMP Destination Unreachable** (network/host unreachable)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Cisco routers send **ICMP unreachable** \u2014 they don't silently discard without notification.",
        "misconceptionTested": "Silent discard on no route"
      },
      {
        "choiceIndex": 1,
        "explanation": "The router **drops** the packet and sends ICMP \u2014 it doesn't just set TTL to 0 in the forwarded packet.",
        "misconceptionTested": "TTL set to 0 instead of ICMP unreachable"
      },
      {
        "choiceIndex": 2,
        "explanation": "Packets are **not sent back** to the source as data \u2014 an **ICMP error message** is generated.",
        "misconceptionTested": "Original packet returned to source"
      }
    ],
    "examTip": "No route: **drop + ICMP Type 3** (destination unreachable) | Code 0=network, 1=host."
  },
  'obj-3.2-source-q024':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "A **routing loop** causes packets to **circulate endlessly** among routers \u2014 never reaching the destination."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Packets exiting one interface and returning on another describes **asymmetric routing**, not a loop.",
        "misconceptionTested": "Asymmetric routing as routing loop"
      },
      {
        "choiceIndex": 2,
        "explanation": "TTL expiry prevents infinite loops but describes the **symptom** \u2014 the loop is the **circular forwarding**.",
        "misconceptionTested": "TTL expiry as definition of routing loop"
      },
      {
        "choiceIndex": 3,
        "explanation": "An inefficient path is **suboptimal routing** \u2014 a loop means packets **never arrive**.",
        "misconceptionTested": "Suboptimal path as routing loop"
      }
    ],
    "examTip": "Routing loop signs: **TTL exceeded** ICMP, constant **hop count**, traceroute shows **repeating routers**."
  },
  'obj-3.2-source-q025':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Dynamic routes live in **RAM** (running routing table) \u2014 lost on reload unless saved to startup config."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**Flash** stores IOS image and files \u2014 not the active routing table.",
        "misconceptionTested": "Dynamic routes in flash"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Startup config** persists across reboots but dynamic routes are **relearned** \u2014 active table is in **RAM**.",
        "misconceptionTested": "Dynamic routes in startup config"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Running config** has static route commands \u2014 the **active RIB** with all routes is in **RAM**.",
        "misconceptionTested": "Dynamic routes only in running config"
      }
    ],
    "examTip": "Active RIB = **RAM** | Static route **commands** in running-config | Dynamic routes **rebuilt** on boot."
  },
  'obj-3.2-source-q026':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**`show ip cef`** displays the CEF Forwarding Information Base \u2014 prefixes with **next-hop adjacencies**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`show cef`** alone is incomplete \u2014 use **`show ip cef`** for IPv4 CEF table.",
        "misconceptionTested": "Truncated show cef command"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`show cef nop`** is not a standard IOS command.",
        "misconceptionTested": "Invented show cef nop command"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`show cef route`** is not valid \u2014 use **`show ip cef [prefix]`**.",
        "misconceptionTested": "Invented show cef route command"
      }
    ],
    "examTip": "CEF verify: **`show ip cef`** (FIB) | **`show adjacency`** (L2 rewrite info) | **`show ip route`** (RIB)."
  },
  'obj-3.2-source-q027':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "At each hop, the **destination MAC** is rewritten to the next-hop MAC \u2014 **destination IP stays constant**."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**Destination IP** is preserved end-to-end \u2014 only L2 addresses change per hop.",
        "misconceptionTested": "Destination IP changes per hop"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Source IP** remains the original sender throughout the path (without NAT).",
        "misconceptionTested": "Source IP changes per hop"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Internal routes\" is not a packet field \u2014 **MAC addresses** change at each router.",
        "misconceptionTested": "Internal routes change during routing"
      }
    ],
    "examTip": "End-to-end constant: **source IP + dest IP** | Changes each hop: **source MAC + dest MAC**."
  },
  'obj-3.2-source-q028':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "No matching route and no default \u2192 router **drops the packet** and may send **ICMP unreachable**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Routers don't **flood** unknown destinations \u2014 that's a switch/bridge behavior.",
        "misconceptionTested": "Flood on no matching route"
      },
      {
        "choiceIndex": 1,
        "explanation": "Routers don't **multicast** unknown packets to other routers \u2014 they drop them.",
        "misconceptionTested": "Multicast to other routers on no route"
      },
      {
        "choiceIndex": 3,
        "explanation": "The original packet is **not returned** \u2014 an **ICMP error** may be sent to the source.",
        "misconceptionTested": "Return original packet to source"
      }
    ],
    "examTip": "No match + no default = **drop** (+ ICMP unreachable) | Not flood, not bounce back data."
  },
  'obj-3.2-source-q029':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "When interfaces are configured with IPs, **connected routes** appear automatically \u2014 no extra config needed."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Default routing** requires explicit configuration of a default route \u2014 not automatic.",
        "misconceptionTested": "Default routing automatic"
      },
      {
        "choiceIndex": 1,
        "explanation": "**Dynamic routes** require enabling a routing protocol \u2014 not automatic on boot.",
        "misconceptionTested": "Dynamic routes automatic by default"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Static routes** must be manually configured \u2014 only **connected** routes are automatic.",
        "misconceptionTested": "Static routes automatic"
      }
    ],
    "examTip": "Automatic routes: **connected (C)** + **local (L)** from interface IPs | Everything else needs config."
  },
  'obj-3.2-source-q030':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "IPv6 default route: **`ipv6 route ::/0 s0/0`** \u2014 `::/0` is the all-zeros IPv6 prefix."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`ip route`** is IPv4 syntax \u2014 IPv6 uses **`ipv6 route`**.",
        "misconceptionTested": "ip route for IPv6 default"
      },
      {
        "choiceIndex": 1,
        "explanation": "IPv6 prefix is **`::/0`**, not `0.0.0.0/0` \u2014 that's IPv4 notation.",
        "misconceptionTested": "IPv4 prefix in ipv6 route command"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`ipv6 unicast-route`** is not valid IOS \u2014 use **`ipv6 route ::/0 <interface>`**.",
        "misconceptionTested": "Invented ipv6 unicast-route command"
      }
    ],
    "examTip": "IPv6 default: **`ipv6 route ::/0 <next-hop or interface>`** | IPv4: **`ip route 0.0.0.0 0.0.0.0`**."
  },
  'obj-3.2-source-q031':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**RIPng**, **OSPFv3**, and **EIGRPv6** all support IPv6 dynamic routing."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**RIPng** alone is correct but incomplete \u2014 **OSPFv3** and **EIGRPv6** also support IPv6.",
        "misconceptionTested": "Only RIPng supports IPv6"
      },
      {
        "choiceIndex": 1,
        "explanation": "**OSPFv3** alone is correct but incomplete \u2014 **RIPng** and **EIGRPv6** also work.",
        "misconceptionTested": "Only OSPFv3 supports IPv6"
      },
      {
        "choiceIndex": 2,
        "explanation": "**EIGRPv6** alone is correct but incomplete \u2014 all three major protocols have IPv6 versions.",
        "misconceptionTested": "Only EIGRPv6 supports IPv6"
      }
    ],
    "examTip": "IPv6 IGPs: **RIPng** | **OSPFv3** (new process, same concepts) | **EIGRPv6** (address-family)."
  },
  'obj-3.2-source-q032':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**`show ipv6 route`** displays only the IPv6 routing table \u2014 separate from IPv4."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`show route`** is not valid IOS syntax.",
        "misconceptionTested": "Invented show route command"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`show ip route`** shows **IPv4 only** \u2014 IPv6 needs **`show ipv6 route`**.",
        "misconceptionTested": "show ip route for IPv6 table"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`show route ipv6`** reverses the syntax \u2014 correct is **`show ipv6 route`**.",
        "misconceptionTested": "Reversed show route ipv6 syntax"
      }
    ],
    "examTip": "IPv4: **`show ip route`** | IPv6: **`show ipv6 route`** | Both: run each separately."
  },
  'obj-3.2-source-q033':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "For remote traffic, the host must **ARP-resolve the default gateway's MAC** before sending the frame."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "The destination IP **always remains the final host** \u2014 never swapped with the gateway address.",
        "misconceptionTested": "Destination IP replaced with gateway"
      },
      {
        "choiceIndex": 1,
        "explanation": "Data packets go **unicast to the gateway MAC** \u2014 not broadcast to the gateway.",
        "misconceptionTested": "Broadcast remote packets to gateway"
      },
      {
        "choiceIndex": 3,
        "explanation": "IP is connectionless \u2014 no **dedicated connection** is established with the gateway.",
        "misconceptionTested": "Dedicated gateway connection for remote"
      }
    ],
    "examTip": "First remote packet: **ARP gateway** \u2192 set dest MAC = gateway \u2192 dest IP = remote host."
  },
  'obj-3.2-source-q034':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**`show ip route`** is the standard command to view the IPv4 routing table on Cisco IOS."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**`show route`** is not a valid Cisco command.",
        "misconceptionTested": "Invented show route command"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`show route table`** does not exist in IOS.",
        "misconceptionTested": "Invented show route table command"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`show routes`** (plural) is invalid \u2014 use **`show ip route`**.",
        "misconceptionTested": "Plural show routes command"
      }
    ],
    "examTip": "Routing table commands: **`show ip route`** (v4) | **`show ipv6 route`** (v6) | **`show ip route summary`**."
  },
  'obj-3.2-source-q035':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**ARP** bridges L3 routing to L2 delivery \u2014 resolves next-hop MAC so the frame can be forwarded."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**IGMP** handles multicast group membership \u2014 not L2 address resolution for routing.",
        "misconceptionTested": "IGMP facilitates packet routing"
      },
      {
        "choiceIndex": 1,
        "explanation": "**RARP** maps MAC\u2192IP (obsolete) \u2014 **ARP** maps IP\u2192MAC for frame delivery.",
        "misconceptionTested": "RARP facilitates packet routing"
      },
      {
        "choiceIndex": 3,
        "explanation": "**ICMP** reports errors and enables diagnostics \u2014 **ARP** enables actual L2 forwarding.",
        "misconceptionTested": "ICMP as primary routing facilitator"
      }
    ],
    "examTip": "Routing needs ARP at each hop: **IP route lookup \u2192 ARP next-hop MAC \u2192 frame rewrite \u2192 forward**."
  },
  'obj-3.2-source-q036':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**Ping** sends ICMP echo requests \u2014 a direct reachability test to a router or host."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**SNMP traps** are asynchronous alerts \u2014 not an active ICMP reachability check.",
        "misconceptionTested": "SNMP traps as router status check"
      },
      {
        "choiceIndex": 1,
        "explanation": "\"Notifications\" is vague \u2014 **ping** (ICMP echo) is the standard direct status check.",
        "misconceptionTested": "Generic notifications for router check"
      },
      {
        "choiceIndex": 3,
        "explanation": "**ARP** resolves MAC addresses \u2014 **ping** (ICMP) tests L3 reachability.",
        "misconceptionTested": "ARP as router status check"
      }
    ],
    "examTip": "Router reachability: **`ping <ip>`** (ICMP echo) | Extended: **`traceroute`** for hop-by-hop."
  },
  'obj-3.2-source-q037':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Cisco ping output: **`!`** = echo reply received (success) | **`.`** = timeout (no response)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "No response shows **`.`** (dots), not exclamation marks \u2014 **`!`** means success.",
        "misconceptionTested": "Exclamation marks mean no response"
      },
      {
        "choiceIndex": 1,
        "explanation": "Ping doesn't indicate **high vs low response time** with `!` \u2014 it only confirms **reply received**.",
        "misconceptionTested": "Exclamation marks indicate high latency"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`!`** confirms the host responded \u2014 it does not measure or display low response time.",
        "misconceptionTested": "Exclamation marks indicate low latency"
      }
    ],
    "examTip": "Ping symbols: **`!`** = success | **`.`** = timeout | **`U`** = unreachable | **`Q`** = source quench."
  },
  'obj-3.4-source-q062':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "On Frame Relay (NBMA), default hello is **30s** \u2014 mismatched timers (10 vs 30) **prevent adjacency formation**."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Multiple area IDs on one router is valid (ABR) \u2014 it doesn't block adjacency in the **same area**.",
        "misconceptionTested": "Multiple area IDs block adjacency"
      },
      {
        "choiceIndex": 2,
        "explanation": "Hello **10** on Router A is fine **if both sides match** \u2014 the problem is **mismatch**, not 10 alone.",
        "misconceptionTested": "Hello 10 always blocks adjacency"
      },
      {
        "choiceIndex": 3,
        "explanation": "Hello **10** on Router B is valid on broadcast \u2014 on Frame Relay both must be **30** (or both 10 if configured).",
        "misconceptionTested": "Hello 10 on one side always the problem"
      }
    ],
    "examTip": "OSPF adjacency needs: **matching area**, **hello/dead timers**, **subnet**, **auth** | NBMA default hello=**30s**."
  },
  'obj-3.4-source-q063':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "OSPF administrative distance is **110** \u2014 appears as **[110/metric]** in `show ip route`."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**90** is **EIGRP** internal AD \u2014 OSPF is **110**.",
        "misconceptionTested": "AD 90 for OSPF"
      },
      {
        "choiceIndex": 2,
        "explanation": "**120** is **RIP** AD \u2014 OSPF is more trusted at **110**.",
        "misconceptionTested": "AD 120 for OSPF"
      },
      {
        "choiceIndex": 3,
        "explanation": "**200** is not a standard IGP AD \u2014 OSPF = **110**.",
        "misconceptionTested": "AD 200 for OSPF"
      }
    ],
    "examTip": "AD ladder: Connected=0, Static=1, EIGRP=90, **OSPF=110**, IS-IS=115, RIP=120."
  },
  'obj-4.2-source-q003':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**`show clock detail`** reveals whether time is **NTP-synchronized** or manually set \u2014 shows source and stratum."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**`show ntp`** alone is incomplete \u2014 **`show clock detail`** confirms NTP sync status.",
        "misconceptionTested": "Truncated show ntp command"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`show time`** is not a valid Cisco IOS command.",
        "misconceptionTested": "Invented show time command"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`show time source`** does not exist \u2014 use **`show clock detail`**.",
        "misconceptionTested": "Invented show time source command"
      }
    ],
    "examTip": "NTP sync check: **`show clock detail`** (synced vs unsynced) | **`show ntp status`** for stratum."
  },
  'obj-4.2-source-q004':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**`show ntp associations detail`** shows configured NTP servers, reachability, stratum, and offset per peer."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`show clock detail`** shows local clock sync status \u2014 not per-server association details.",
        "misconceptionTested": "show clock detail for server associations"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`show ntp detail`** is not the standard command \u2014 use **`show ntp associations detail`**.",
        "misconceptionTested": "Invented show ntp detail command"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`show ntp skew`** is not valid IOS \u2014 server details are in **`show ntp associations detail`**.",
        "misconceptionTested": "Invented show ntp skew command"
      }
    ],
    "examTip": "NTP verify: **`show ntp associations`** (summary) | **`detail`** for per-server stratum/offset/reach."
  },
}
