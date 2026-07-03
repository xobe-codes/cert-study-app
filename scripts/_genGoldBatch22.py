#!/usr/bin/env python3
"""Gold batch 22 — OSPF 3.4 q13+, STP 2.5 q9+, static routing 3.3 q8+. Run: python3 scripts/_genGoldBatch22.py"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HAND = {
  "obj-3.4-source-q013": {
    "correct": {"choiceIndex": 1, "explanation": "Cisco OSPF **router ID** is the **highest active IP** on the router (loopback preferred over physical when both exist) unless **`router-id`** is manually set."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Loopback **lowest** IP is wrong — OSPF picks the **highest** loopback IP, not the lowest.", "misconceptionTested": "Lowest loopback IP as OSPF RID"},
      {"choiceIndex": 2, "explanation": "**Lowest** IP on the router is incorrect — RID selection favors the **highest** active/loopback address.", "misconceptionTested": "Lowest IP as OSPF router ID"},
      {"choiceIndex": 3, "explanation": "OSPF **RID is a 32-bit value formatted like an IP** — it is **not** derived from a MAC address.", "misconceptionTested": "MAC address as OSPF router ID"},
    ],
    "examTip": "RID order: **`router-id`** → **highest loopback** → **highest interface IP**.",
  },
  "obj-3.4-source-q014": {
    "correct": {"choiceIndex": 2, "explanation": "An OSPF **link** is a **routed interface** (network statement or **`network … area`**) participating in the OSPF process — the unit that generates LSAs."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Two routers in OSPF form a **neighbor/adjacency** — a **link** is the **local interface** in the process, not the peer relationship.", "misconceptionTested": "OSPF link as neighbor relationship"},
      {"choiceIndex": 1, "explanation": "Sharing an **area ID** defines membership — the **link** itself is the **interface enabled for OSPF**.", "misconceptionTested": "Area ID match as OSPF link definition"},
      {"choiceIndex": 3, "explanation": "**AS number** is a BGP concept — OSPF links are **interfaces**, not AS identifiers.", "misconceptionTested": "AS number as OSPF link definition"},
    ],
    "examTip": "OSPF **link** = **interface in the OSPF process**. Neighbor = router on the other end.",
  },
  "obj-3.4-source-q015": {
    "correct": {"choiceIndex": 1, "explanation": "On a **broadcast LAN**, routers form **FULL adjacencies with the DR/BDR** — the DR maintains adjacency with **every neighbor on that segment/area**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "On multi-access LANs, **DROthers** stay at **2-WAY** with each other — not every pair gets FULL like on a point-to-point link.", "misconceptionTested": "Full adjacency between all routers on LAN"},
      {"choiceIndex": 2, "explanation": "Adjacency scope is **OSPF area/segment**, not the entire **autonomous system** — AS is BGP terminology.", "misconceptionTested": "DR adjacency across entire AS"},
      {"choiceIndex": 3, "explanation": "DR does not adjacency to **every router in the area** — only **neighbors on the same multi-access link**.", "misconceptionTested": "DR adjacency to all area routers"},
    ],
    "examTip": "Broadcast LAN: **DR ↔ all neighbors FULL** | DROther ↔ DROther **2-WAY** only.",
  },
  "obj-3.4-source-q016": {
    "correct": {"choiceIndex": 3, "explanation": "DR election: **highest OSPF priority** wins; tie-break **highest RID** — election is **per segment within an area**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "DR election is **per multi-access segment**, not **AS-wide** — and **lowest** priority does not win.", "misconceptionTested": "DR elected AS-wide by highest priority"},
      {"choiceIndex": 1, "explanation": "**Lowest priority** loses — higher **`ip ospf priority`** wins; RID breaks ties.", "misconceptionTested": "Lowest OSPF priority wins DR election"},
      {"choiceIndex": 2, "explanation": "Both **lowest priority** and **lowest RID** are wrong — DR wants **highest** of each.", "misconceptionTested": "Lowest priority and lowest RID for DR"},
    ],
    "examTip": "DR/BDR pick: **priority (high wins)** → **RID (high wins)** on the **same subnet**.",
  },
  "obj-3.4-source-q017": {
    "correct": {"choiceIndex": 1, "explanation": "**Hello packets** establish/maintain **neighbor relationships** — view them with **`show ip ospf neighbor`** (the neighborship table)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "The **routing table** holds **best paths** — hello/neighbor state lives in the **neighbor table**, not RIB.", "misconceptionTested": "Routing table as OSPF neighbor list"},
      {"choiceIndex": 2, "explanation": "**Topological database** is another name for the **LSDB** (link-state) — neighbors are tracked separately.", "misconceptionTested": "Topological DB as hello neighbor list"},
      {"choiceIndex": 3, "explanation": "The **LSDB** stores **LSAs/topology** — **hellos/neighbors** are in the **neighbor table**.", "misconceptionTested": "LSDB as OSPF neighbor database"},
    ],
    "examTip": "Neighbors = **`show ip ospf neighbor`** | Topology = **LSDB** (`show ip ospf database`).",
  },
  "obj-3.4-source-q018": {
    "correct": {"choiceIndex": 2, "explanation": "**OSPF areas** (especially **Area 0** backbone + summarization at ABRs) limit LSDB size — the primary **scalability** tool."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Autonomous systems** are a **BGP** boundary concept — OSPF scales with **areas**, not AS numbers.", "misconceptionTested": "OSPF AS numbers for scalability"},
      {"choiceIndex": 1, "explanation": "**Process ID** is local to the router (like a label) — it does **not** scale the OSPF domain.", "misconceptionTested": "OSPF process ID for scalability"},
      {"choiceIndex": 3, "explanation": "**RID** uniquely identifies a router — it does **not** provide hierarchical **scalability** like areas.", "misconceptionTested": "Router ID as OSPF scalability mechanism"},
    ],
    "examTip": "OSPF scale lever = **multi-area design** + **summarization at ABRs**.",
  },
  "obj-3.4-source-q019": {
    "correct": {"choiceIndex": 3, "explanation": "A **LAN (Ethernet)** is OSPF **broadcast/multi-access** — triggers **DR/BDR** election."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**X.25** is legacy **WAN packet-switching** — typically **NBMA/non-broadcast**, not broadcast LAN.", "misconceptionTested": "X.25 as OSPF broadcast network"},
      {"choiceIndex": 1, "explanation": "**Frame Relay** is **NBMA/multi-access** — OSPF treats it differently from Ethernet broadcast.", "misconceptionTested": "Frame Relay as broadcast multi-access"},
      {"choiceIndex": 2, "explanation": "**ATM** WAN links are **not classic Ethernet broadcast** — CCNA broadcast example = **LAN**.", "misconceptionTested": "ATM as OSPF broadcast network type"},
    ],
    "examTip": "OSPF network types: **Broadcast** = LAN | **Point-to-point** = serial/HDLC/PPP | **NBMA** = Frame Relay.",
  },
  "obj-3.4-source-q020": {
    "correct": {"choiceIndex": 2, "explanation": "**224.0.0.6 (AllDRouters)** — DR/BDR send LSAs to this group; DROthers listen here for updates from DR."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**224.0.0.9** is **RIP v2** multicast — not OSPF.", "misconceptionTested": "224.0.0.9 as OSPF DR multicast"},
      {"choiceIndex": 1, "explanation": "**224.0.0.5 (AllSPFRouters)** is for **hellos/general OSPF** — DR-specific updates use **224.0.0.6**.", "misconceptionTested": "AllSPFRouters as DR adjacency multicast"},
      {"choiceIndex": 3, "explanation": "**224.0.0.7** is not a standard OSPF group on CCNA — memorize **.5** and **.6**.", "misconceptionTested": "224.0.0.7 as OSPF multicast address"},
    ],
    "examTip": "OSPF multicast: **224.0.0.5** = AllSPFRouters | **224.0.0.6** = AllDRouters.",
  },
  "obj-3.4-source-q021": {
    "correct": {"choiceIndex": 0, "explanation": "**`router ospf 20`** enters OSPF config and sets **process ID 20** — local to the router, can differ per device."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**Area** is configured with **`network … area X`** or **`area X`** under interface — not the number after **`router ospf`**.", "misconceptionTested": "OSPF number as area ID"},
      {"choiceIndex": 2, "explanation": "OSPF has **no autonomous-system number** like BGP — **20** is the **process ID**.", "misconceptionTested": "OSPF number as autonomous system"},
      {"choiceIndex": 3, "explanation": "**Cost** is set per interface (**`ip ospf cost`**) or via reference bandwidth — not by **`router ospf 20`**.", "misconceptionTested": "OSPF number as interface cost"},
    ],
    "examTip": "**Process ID** = label on **`router ospf <id>`** — must match only on **the same router** (multiple processes).",
  },
  "obj-3.4-source-q022": {
    "correct": {"choiceIndex": 1, "explanation": "**`show interface`** displays **bandwidth** (used in OSPF cost calc) — **`show ip ospf interface`** shows OSPF cost but bandwidth comes from interface stats."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show ospf`** is incomplete IOS syntax — use **`show ip ospf`** for process info, not raw bandwidth.", "misconceptionTested": "show ospf as bandwidth verify command"},
      {"choiceIndex": 2, "explanation": "**Running-config** shows **`bandwidth`** command if set — **`show interface`** is the direct verify for **operational bandwidth**.", "misconceptionTested": "show running-config as primary bandwidth check"},
      {"choiceIndex": 3, "explanation": "**`show ip ospf interface`** shows **OSPF cost/timers** — stem asks specifically for **interface bandwidth** → **`show interface`**.", "misconceptionTested": "show ip ospf interface for raw bandwidth"},
    ],
    "examTip": "Bandwidth verify = **`show interface <int>`** | OSPF cost verify = **`show ip ospf interface <int>`**.",
  },
  "obj-2.5-source-q009": {
    "correct": {"choiceIndex": 1, "explanation": "**CST (802.1Q)** runs **one spanning-tree instance** for **all VLANs** — **single root bridge** for the whole bridged network."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Per-VLAN root** is **PVST+/Rapid PVST+** behavior — **CST** shares **one** tree.", "misconceptionTested": "CST electing root per VLAN"},
      {"choiceIndex": 2, "explanation": "CST uses **802.1D timers** — convergence is **not immediate** (RSTP/802.1w is faster).", "misconceptionTested": "CST immediate convergence"},
      {"choiceIndex": 3, "explanation": "Large networks usually prefer **MST or per-VLAN STP** — CST's single tree **does not scale** VLAN load-balancing.", "misconceptionTested": "CST as best for large networks"},
    ],
    "examTip": "CST = **one STP for all VLANs** | PVST+ = **one STP per VLAN**.",
  },
  "obj-2.5-source-q010": {
    "correct": {"choiceIndex": 1, "explanation": "**RSTP (802.1w)** interoperates with **classic STP (802.1D)** — legacy switches can coexist while rapid switches use faster transitions."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "STP domains have **one root bridge** per instance — RSTP does **not** allow multiple roots.", "misconceptionTested": "RSTP allowing multiple root bridges"},
      {"choiceIndex": 2, "explanation": "**~50 seconds** is **802.1D STP** convergence — RSTP reconverges in **seconds or less**.", "misconceptionTested": "RSTP 50-second convergence time"},
      {"choiceIndex": 3, "explanation": "RSTP collapses to **three port states** (discarding/learning/forwarding) — not **five** like classic STP.", "misconceptionTested": "RSTP five port states"},
    ],
    "examTip": "RSTP = **802.1w**, **3 states**, **backward compatible** with 802.1D BPDUs.",
  },
  "obj-2.5-source-q011": {
    "correct": {"choiceIndex": 1, "explanation": "When a port transitions, the **local switch** sends **TCN BPDUs** toward the **root** — each bridge participates in propagating topology change."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "The **root bridge** receives/forwards TCNs but **does not solely sense** all link changes — **each switch** detects local events.", "misconceptionTested": "Root bridge alone senses topology changes"},
      {"choiceIndex": 2, "explanation": "STP is **not polled** — switches exchange **BPDUs** event-driven, no root-bridge polling.", "misconceptionTested": "Root bridge polling switches for changes"},
      {"choiceIndex": 3, "explanation": "Switches do **not poll the root** — they **originate TCNs** when local ports change state.", "misconceptionTested": "Switches polling root bridge for changes"},
    ],
    "examTip": "TCN flow: **detecting switch → root** → root sets **TC flag** → MAC aging shortened.",
  },
  "obj-2.5-source-q012": {
    "correct": {"choiceIndex": 1, "explanation": "**802.1w (RSTP)** is the IEEE rapid spanning-tree standard — Cisco **Rapid PVST+** implements 802.1w **per VLAN**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**802.1X** is **port-based access control** — not spanning tree.", "misconceptionTested": "802.1X as RSTP standard"},
      {"choiceIndex": 2, "explanation": "**802.1D** is **classic STP** — RSTP is **802.1w**.", "misconceptionTested": "802.1D as RSTP replacement standard"},
      {"choiceIndex": 3, "explanation": "**802.1s** is **MST** — multiple spanning trees, not plain RSTP.", "misconceptionTested": "802.1s as RSTP standard"},
    ],
    "examTip": "802.1w = **RSTP** | Cisco per-VLAN RSTP = **Rapid PVST+**.",
  },
  "obj-2.5-source-q013": {
    "correct": {"choiceIndex": 1, "explanation": "Equal **bridge priority** → lowest **MAC address** wins root — **0011.03ae.d8aa** is numerically lowest among the choices."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**0081.023a.b433** is **higher** than 0011.03ae.d8aa — root election prefers **lowest** MAC on tie.", "misconceptionTested": "Higher MAC wins root bridge tie-break"},
      {"choiceIndex": 2, "explanation": "**0041.0611.1112** loses the tie-break — not the lowest bridge ID/MAC.", "misconceptionTested": "Wrong MAC selected on priority tie"},
      {"choiceIndex": 3, "explanation": "**0021.02fa.bdfc** is not the lowest — compare hex MACs left-to-right.", "misconceptionTested": "Incorrect MAC comparison for root election"},
    ],
    "examTip": "Root bridge ID = **priority + MAC** — **lowest wins** (priority first, then MAC).",
  },
  "obj-2.5-source-q014": {
    "correct": {"choiceIndex": 3, "explanation": "Modern Cisco Catalyst switches default to **Rapid PVST+** — **802.1w per VLAN** with rapid convergence."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**802.1D** is classic STP — Cisco default today is **Rapid PVST+**, not plain 802.1D.", "misconceptionTested": "802.1D as default Cisco STP mode"},
      {"choiceIndex": 1, "explanation": "**802.1w** is the IEEE standard — Cisco default **mode name** is **Rapid PVST+** (per-VLAN implementation).", "misconceptionTested": "802.1w alone as Cisco default mode name"},
      {"choiceIndex": 2, "explanation": "**PVST+** uses **802.1D** timers — default on current platforms is **Rapid PVST+** (802.1w).", "misconceptionTested": "PVST+ as current default STP mode"},
    ],
    "examTip": "Cisco default STP = **Rapid PVST+** (`spanning-tree mode rapid-pvst`).",
  },
  "obj-2.5-source-q015": {
    "correct": {"choiceIndex": 3, "explanation": "An **alternate port** is a **backup root port** — receives superior BPDUs from **another switch** and replaces the **root port** if it fails."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Alternate ports hear BPDUs from **other switches**, not **another port on the same switch** — and they backup **root port**, not designated.", "misconceptionTested": "Alternate port from same-switch port"},
      {"choiceIndex": 1, "explanation": "Alternate is **root-port backup**, not **designated-port replacement** — designated backup is **backup port**.", "misconceptionTested": "Alternate port replacing designated port"},
      {"choiceIndex": 2, "explanation": "Alternate ports stay in **discarding/blocking** until needed — they are **not always forwarding**.", "misconceptionTested": "Alternate port always forwarding"},
    ],
    "examTip": "RSTP roles: **Root port** + **Alternate** (backup) | **Designated** + **Backup** (segment backup).",
  },
  "obj-2.5-source-q016": {
    "correct": {"choiceIndex": 2, "explanation": "Root bridge = **lowest bridge ID** = **lowest configured priority** (default 32768); tie-break **lowest switch MAC**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "STP does **not** use **IP addresses** — bridge ID combines **priority + MAC**; **lowest** wins, not highest.", "misconceptionTested": "Highest IP and priority for root bridge"},
      {"choiceIndex": 1, "explanation": "**IP address** is irrelevant to STP root election — and **lowest**, not arbitrary IP logic, applies to bridge ID.", "misconceptionTested": "Lowest IP address for root bridge election"},
      {"choiceIndex": 3, "explanation": "**Highest MAC** loses — STP root election prefers **lowest** bridge ID/MAC.", "misconceptionTested": "Highest MAC address wins root bridge"},
    ],
    "examTip": "STP root = **lowest bridge priority** → **lowest MAC**. OSPF DR = **highest** priority/RID.",
  },
  "obj-3.3-source-q008": {
    "correct": {"choiceIndex": 3, "explanation": "When an interface is **up/up**, IOS **automatically installs connected routes** — no admin config required."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Default routes** must be **configured or learned** — they are not automatic on boot.", "misconceptionTested": "Default routing automatic by default"},
      {"choiceIndex": 1, "explanation": "**Dynamic protocols** (OSPF/EIGRP/RIP) require **explicit configuration** — not automatic.", "misconceptionTested": "Dynamic routes automatic without config"},
      {"choiceIndex": 2, "explanation": "**Static routes** are **manually entered** — only **connected** routes appear automatically.", "misconceptionTested": "Static routes automatic on router"},
    ],
    "examTip": "Route types: **Connected** = auto | **Static** = manual | **Dynamic** = protocol.",
  },
  "obj-3.3-source-q009": {
    "correct": {"choiceIndex": 3, "explanation": "IPv6 default route: **`ipv6 route ::/0 s0/0`** — **`::/0`** is all-zeros prefix; exit interface **s0/0**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`ip route`** is **IPv4** syntax — IPv6 needs **`ipv6 route`** with **`::/0`**.", "misconceptionTested": "ip route for IPv6 default"},
      {"choiceIndex": 1, "explanation": "**`0.0.0.0/0`** is IPv4 notation — IPv6 default is **`::/0`**, not dotted decimal.", "misconceptionTested": "IPv4 prefix in ipv6 route command"},
      {"choiceIndex": 2, "explanation": "**`ipv6 unicast-route`** is invalid — routing uses **`ipv6 route`**; unicast-routing is a **global enable**.", "misconceptionTested": "ipv6 unicast-route as static route syntax"},
    ],
    "examTip": "IPv6 default: **`ipv6 route ::/0 <next-hop|interface>`** — enable **`ipv6 unicast-routing`** first.",
  },
  "obj-3.3-source-q010": {
    "correct": {"choiceIndex": 3, "explanation": "CCNA IPv6 IGPs: **RIPng**, **OSPFv3**, and **EIGRP for IPv6** — all three support IPv6 routing."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**RIPng** alone is incomplete — **OSPFv3** and **EIGRPv6** also run on IPv6.", "misconceptionTested": "RIPng as only IPv6 dynamic protocol"},
      {"choiceIndex": 1, "explanation": "**OSPFv3** is valid but not the only option — **RIPng** and **EIGRPv6** qualify too.", "misconceptionTested": "OSPFv3 as sole IPv6 routing protocol"},
      {"choiceIndex": 2, "explanation": "**EIGRPv6** works on IPv6 but so do **RIPng** and **OSPFv3** — answer is **all of the above**.", "misconceptionTested": "EIGRPv6 as only IPv6 dynamic protocol"},
    ],
    "examTip": "IPv6 dynamic trio on CCNA: **RIPng | OSPFv3 | EIGRPv6**.",
  },
  "obj-3.3-source-q011": {
    "correct": {"choiceIndex": 2, "explanation": "**`show ipv6 route`** displays **only the IPv6 RIB** — the standard verify for IPv6 prefixes."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show route`** is not valid IOS syntax — use **`show ip route`** or **`show ipv6 route`**.", "misconceptionTested": "show route as valid IOS command"},
      {"choiceIndex": 1, "explanation": "**`show ip route`** shows **IPv4 only** — IPv6 table needs **`show ipv6 route`**.", "misconceptionTested": "show ip route for IPv6 table"},
      {"choiceIndex": 3, "explanation": "**`show route ipv6`** reverses the keywords — correct form is **`show ipv6 route`**.", "misconceptionTested": "Reversed show route ipv6 syntax"},
    ],
    "examTip": "RIB verify: **IPv4** = `show ip route` | **IPv6** = `show ipv6 route`.",
  },
  "obj-3.3-source-q012": {
    "correct": {"choiceIndex": 2, "explanation": "Remote destination → host ARPs for **default gateway's MAC** (L2 next hop) while keeping the **original destination IP** in the packet."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "The host **does not replace** the destination IP with the gateway — IP stays remote; **L2 frame** targets gateway MAC.", "misconceptionTested": "Replacing destination IP with gateway IP"},
      {"choiceIndex": 1, "explanation": "Hosts **unicast** to the resolved gateway MAC — they do **not broadcast** remote packets to the gateway.", "misconceptionTested": "Broadcast to default gateway for remote traffic"},
      {"choiceIndex": 3, "explanation": "No **dedicated connection** is built — IP sends datagrams; host only needs **gateway MAC via ARP**.", "misconceptionTested": "Dedicated connection to default gateway"},
    ],
    "examTip": "Remote host send: **IP dst = remote** | **ARP/MAC dst = default gateway**.",
  },
  "obj-3.3-source-q013": {
    "correct": {"choiceIndex": 0, "explanation": "**`show ip route`** is the standard command to display the **IPv4 routing table** on Cisco IOS."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**`show route`** is not valid — IOS uses **`show ip route`** for IPv4 RIB.", "misconceptionTested": "show route as routing table command"},
      {"choiceIndex": 2, "explanation": "**`show route table`** is invented syntax — correct command is **`show ip route`**.", "misconceptionTested": "show route table as IOS command"},
      {"choiceIndex": 3, "explanation": "**`show routes`** (plural) is not IOS — the verified command is **`show ip route`**.", "misconceptionTested": "show routes plural syntax"},
    ],
    "examTip": "Routing table: **`show ip route`** (IPv4) | **`show ipv6 route`** (IPv6).",
  },
  "obj-3.3-source-q014": {
    "correct": {"choiceIndex": 2, "explanation": "**ARP** maps **IP → MAC** so routers/hosts can **forward frames** to the correct **Layer 2 next hop** — essential for routed delivery."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**IGMP** manages **multicast group membership** — not next-hop L2 resolution for routing.", "misconceptionTested": "IGMP as routing facilitation protocol"},
      {"choiceIndex": 1, "explanation": "**RARP** resolves **MAC → IP** (legacy) — routing facilitation uses **ARP** (IP → MAC).", "misconceptionTested": "RARP as forward-path resolution"},
      {"choiceIndex": 3, "explanation": "**ICMP** sends **errors/diagnostics** (ping/unreachable) — **ARP** provides the **L2 address** needed to forward.", "misconceptionTested": "ICMP as routing facilitation vs ARP"},
    ],
    "examTip": "Next-hop forward needs **ARP** (IPv4) or **NDP** (IPv6) — not ICMP.",
  },
}

assert len(HAND) == 25, len(HAND)

def fmt_entry(id_, rev):
    body = json.dumps(rev, indent=2)
    indented = "\n".join("  " + line if line else line for line in body.splitlines())
    return f"  '{id_}': {indented},"

lines = [
    "/** Gold reviews — Batch 22: OSPF 3.4 q13+, STP 2.5 q9+, static routing 3.3 q8+. */",
    "export const BATCH22_GOLD = {",
]
for id_, rev in HAND.items():
    lines.append(fmt_entry(id_, rev))
lines.append("}")
lines.append("")

out = ROOT / "src/answerReview/goldAnswerReviewsBatch22.js"
out.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {len(HAND)} entries to {out.relative_to(ROOT)}")
