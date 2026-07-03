#!/usr/bin/env python3
"""Gold batch 21 — OSPF 3.4 q1+, STP 2.5 q1+, static routing 3.3 q1+. Run: python3 scripts/_genGoldBatch21.py"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HAND = {
  "obj-3.4-source-q001": {
    "correct": {"choiceIndex": 1, "explanation": "**OSPF** is a true **link-state** IGP — routers flood LSAs and run SPF; RIP/EIGRP (hybrid) and BGP are not pure link-state."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**RIP** is **distance-vector** — periodic route advertisements, not synchronized link-state databases.", "misconceptionTested": "RIP as link-state protocol"},
      {"choiceIndex": 2, "explanation": "**EIGRP** is an **advanced distance-vector** (DUAL) protocol — not a link-state protocol like OSPF.", "misconceptionTested": "EIGRP as link-state protocol"},
      {"choiceIndex": 3, "explanation": "**BGP** is a **path-vector** exterior gateway protocol — OSPF is the CCNA link-state example.", "misconceptionTested": "BGP as link-state IGP"},
    ],
    "examTip": "Link-state on CCNA = **OSPF** (LSAs + SPF). Distance-vector = **RIP**. Path-vector = **BGP**.",
  },
  "obj-3.4-source-q002": {
    "correct": {"choiceIndex": 2, "explanation": "**OSPF** uses **Dijkstra's SPF algorithm** on the link-state database to compute shortest paths."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**RIP** uses **hop count** and Bellman-Ford-style updates — not Dijkstra SPF.", "misconceptionTested": "RIP using Dijkstra SPF"},
      {"choiceIndex": 1, "explanation": "**EIGRP** uses **DUAL**, not Dijkstra — OSPF is the protocol tied to SPF/Dijkstra on CCNA.", "misconceptionTested": "EIGRP using Dijkstra algorithm"},
      {"choiceIndex": 3, "explanation": "**BGP** selects paths with **path attributes** — Dijkstra SPF belongs to **OSPF**.", "misconceptionTested": "BGP using Dijkstra routing algorithm"},
    ],
    "examTip": "Dijkstra/SPF ↔ **OSPF**. DUAL ↔ **EIGRP**. Hop count ↔ **RIP**.",
  },
  "obj-3.4-source-q003": {
    "correct": {"choiceIndex": 0, "explanation": "Each router builds its **own synchronized topology view** from LSAs — SPF yields a loop-free tree because everyone shares the same map."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Routers do not share one physical database file — each maintains its **own** LSDB built from **flooded LSAs**.", "misconceptionTested": "Single shared topology database file"},
      {"choiceIndex": 2, "explanation": "The LSDB stores **link-state advertisements**, not a simple list of all routers — SPF runs on link topology.", "misconceptionTested": "Link-state DB as router list only"},
      {"choiceIndex": 3, "explanation": "Multiple equal-cost paths can exist, but **loop freedom** comes from **common topology + SPF**, not ECMP alone.", "misconceptionTested": "ECMP as reason link-state avoids loops"},
    ],
    "examTip": "Link-state loop avoidance: **same topology map** on every router → **SPF** builds loop-free paths.",
  },
  "obj-3.4-source-q004": {
    "correct": {"choiceIndex": 3, "explanation": "Link-state protocols send **triggered updates** when topology changes — faster convergence than periodic full-vector exchanges."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Hop count** is a **distance-vector** metric (RIP) — OSPF uses **cost/bandwidth**.", "misconceptionTested": "Hop count as link-state metric"},
      {"choiceIndex": 1, "explanation": "CIDR/VLSM support is true for OSPF but is **not unique** to link-state — the keyed advantage here is **triggered updates**.", "misconceptionTested": "CIDR/VLSM as exclusive link-state advantage"},
      {"choiceIndex": 2, "explanation": "OSPF is **CPU/RAM intensive** (LSDB + SPF) — it is not the low-resource protocol choice.", "misconceptionTested": "OSPF as low CPU/RAM protocol"},
    ],
    "examTip": "Link-state pros: **fast triggered updates**, accurate topology. Cons: **more CPU/RAM** than static/RIP.",
  },
  "obj-3.4-source-q005": {
    "correct": {"choiceIndex": 2, "explanation": "**OSPF** scales in **large hierarchical** networks via **areas** and a backbone — designed for enterprise/global designs."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Tiny 3-router nets rarely need OSPF overhead — **static routes** are often enough.", "misconceptionTested": "OSPF for very small networks"},
      {"choiceIndex": 1, "explanation": "Limited RAM/CPU favors **static or RIP** — OSPF's LSDB/SPF cost is higher.", "misconceptionTested": "OSPF on resource-constrained routers"},
      {"choiceIndex": 3, "explanation": "OSPF has **more complexity** (areas, LSAs, DR/BDR) — not ideal when admins lack training.", "misconceptionTested": "OSPF for untrained admin teams"},
    ],
    "examTip": "OSPF sweet spot: **medium-to-large hierarchical** networks with trained staff.",
  },
  "obj-3.4-source-q006": {
    "correct": {"choiceIndex": 1, "explanation": "**OSPF** is a **nonproprietary IGP** (IETF) — EIGRP is Cisco-proprietary; BGP/EGP are exterior protocols."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**EGP** is legacy **exterior** gateway — not a modern interior IGP like OSPF.", "misconceptionTested": "EGP as interior nonproprietary IGP"},
      {"choiceIndex": 2, "explanation": "**EIGRP** is **Cisco proprietary** (even if partially opened) — OSPF is the open IGP answer.", "misconceptionTested": "EIGRP as nonproprietary IGP"},
      {"choiceIndex": 3, "explanation": "**BGP** is the **EGP** for inter-AS routing — not an interior gateway protocol.", "misconceptionTested": "BGP as interior nonproprietary IGP"},
    ],
    "examTip": "Open IGP = **OSPF**. Cisco IGP = **EIGRP**. Inter-AS = **BGP**.",
  },
  "obj-3.4-source-q007": {
    "correct": {"choiceIndex": 1, "explanation": "Within one company, **OSPF** handles multiple sites/admin units via **areas** and summarization — still one IGP domain."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**BGP** is for **different autonomous systems** (providers, Internet) — intra-company IGP is **OSPF/EIGRP**.", "misconceptionTested": "BGP for same-company site routing"},
      {"choiceIndex": 2, "explanation": "**RIPv2** works but **does not scale** across many sites like OSPF areas do.", "misconceptionTested": "RIPv2 for multi-site enterprise"},
      {"choiceIndex": 3, "explanation": "**EGP** is obsolete exterior routing — modern interior choice is **OSPF**.", "misconceptionTested": "EGP for enterprise multi-site"},
    ],
    "examTip": "Same org, many sites → **OSPF areas**. Different AS/ISP policy → **BGP**.",
  },
  "obj-3.4-source-q009": {
    "correct": {"choiceIndex": 2, "explanation": "Router A between **Area 0** and **external networks** is an **ASBR** (Autonomous System Boundary Router) — redistributes external routes."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**ABR** connects **OSPF areas** to the backbone — A is facing **external** networks, not just another area.", "misconceptionTested": "ABR role for external redistribution"},
      {"choiceIndex": 1, "explanation": "**Autonomous system router** is not standard OSPF terminology — use **ASBR** for external injection.", "misconceptionTested": "Invented autonomous system router term"},
      {"choiceIndex": 3, "explanation": "**Area backup router** is not an OSPF role — external boundary = **ASBR**.", "misconceptionTested": "Area backup router as OSPF role"},
    ],
    "examTip": "OSPF roles: **ABR** = area ↔ Area 0 | **ASBR** = OSPF ↔ external (EIGRP, static, etc.).",
  },
  "obj-3.4-source-q011": {
    "correct": {"choiceIndex": 0, "explanation": "Routers connecting **non-zero areas to Area 0** are **ABRs** (Area Border Routers) — they summarize between areas."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**Autonomous system routers** is not OSPF role vocabulary — inter-area connectors are **ABRs**.", "misconceptionTested": "Autonomous system router for area borders"},
      {"choiceIndex": 2, "explanation": "**ASBR** redistributes **external** routes — C/D/E connect **areas**, not the Internet.", "misconceptionTested": "ASBR for multi-area backbone attachment"},
      {"choiceIndex": 3, "explanation": "**Area backup router** is not a defined OSPF function — **ABR** is the correct term.", "misconceptionTested": "Area backup router as inter-area role"},
    ],
    "examTip": "Memorize: **ABR** sits on **Area 0 border** | **ASBR** touches **external** routes.",
  },
  "obj-3.4-source-q012": {
    "correct": {"choiceIndex": 3, "explanation": "OSPF sends **event-triggered** LSU updates when topology changes — not periodic full-table broadcasts like RIP."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "OSPF is **link-state**, not distance-vector — it floods **LSAs**, not hop-count vectors.", "misconceptionTested": "OSPF as distance-vector protocol"},
      {"choiceIndex": 1, "explanation": "OSPF **does not auto-summarize** at classful boundaries by default — summarization is manual at **ABRs**.", "misconceptionTested": "OSPF default auto-summarization"},
      {"choiceIndex": 2, "explanation": "OSPF uses **multicast** (224.0.0.5/6) for hellos/updates — it does not **broadcast** routing tables.", "misconceptionTested": "OSPF broadcasts routing table updates"},
    ],
    "examTip": "OSPF updates: **triggered LSAs** on change | hellos on **224.0.0.5** (AllSPFRouters).",
  },
  "obj-2.5-source-q001": {
    "correct": {"choiceIndex": 2, "explanation": "Classic **STP** is IEEE **802.1D** — the original spanning-tree standard (convergence ~30–50 s)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**802.1X** is **port-based network access control** (authentication) — not spanning tree.", "misconceptionTested": "802.1X as STP standard"},
      {"choiceIndex": 1, "explanation": "**802.1w** is **RSTP** (rapid STP) — 802.1D is classic STP.", "misconceptionTested": "802.1w as classic STP spec"},
      {"choiceIndex": 3, "explanation": "**802.1s** is **MST** (Multiple Spanning Tree) — classic STP = **802.1D**.", "misconceptionTested": "802.1s as classic STP spec"},
    ],
    "examTip": "STP standards map: **802.1D** = STP | **802.1w** = RSTP | **802.1s** = MST.",
  },
  "obj-2.5-source-q002": {
    "correct": {"choiceIndex": 1, "explanation": "STP is **distributed** — every switch runs the algorithm locally and builds its own STP topology view from **BPDUs**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "No **central** STP controller — each switch independently processes BPDUs and elects root/roles.", "misconceptionTested": "Central switch runs STP for all"},
      {"choiceIndex": 2, "explanation": "STP is **Layer 2** — it does not use **routing protocols** to detect switching loops.", "misconceptionTested": "Routing protocols for STP loop detection"},
      {"choiceIndex": 3, "explanation": "The **MAC table** forwards frames — STP logic uses **BPDUs**, not MAC learning, to block loops.", "misconceptionTested": "MAC table as STP loop detector"},
    ],
    "examTip": "STP = **per-switch** BPDU processing → elect root → assign port roles/states.",
  },
  "obj-2.5-source-q003": {
    "correct": {"choiceIndex": 0, "explanation": "STP watches **BPDUs** on ports — duplicate root/path info on multiple interfaces signals a potential **L2 loop**."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "STP does **not** monitor user **data frames** for loops — control plane uses **BPDUs** only.", "misconceptionTested": "STP monitors normal traffic frames"},
      {"choiceIndex": 2, "explanation": "**CDP** is neighbor discovery — STP loop detection relies on **BPDUs**, not CDP.", "misconceptionTested": "CDP frames for STP loop detection"},
      {"choiceIndex": 3, "explanation": "Access ports in the same VLAN do not define STP loop detection — **BPDU exchange** between bridges does.", "misconceptionTested": "Access port VLAN membership as STP monitor"},
    ],
    "examTip": "STP control plane = **BPDUs**. Data frames are forwarded separately by the MAC table.",
  },
  "obj-2.5-source-q004": {
    "correct": {"choiceIndex": 1, "explanation": "**RSTP** is IEEE **802.1w** — rapid reconvergence (typically sub-second to a few seconds)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**802.1X** is **network access control**, not rapid spanning tree.", "misconceptionTested": "802.1X as RSTP standard"},
      {"choiceIndex": 2, "explanation": "**802.1D** is **classic STP** — RSTP is the newer **802.1w**.", "misconceptionTested": "802.1D as RSTP spec"},
      {"choiceIndex": 3, "explanation": "**802.1s** is **MST** — RSTP alone is **802.1w**.", "misconceptionTested": "802.1s as RSTP spec"},
    ],
    "examTip": "RSTP = **802.1w**. Cisco per-VLAN rapid STP = **Rapid PVST+**.",
  },
  "obj-2.5-source-q005": {
    "correct": {"choiceIndex": 3, "explanation": "**Link cost** is a **numeric value tied to link speed** (higher bandwidth → lower cost in modern STP)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "STP cost is **not latency** — it is derived from **port speed** (bandwidth-based cost).", "misconceptionTested": "Link cost as latency metric"},
      {"choiceIndex": 1, "explanation": "Summing ports to root is **path cost**, not the per-link cost definition.", "misconceptionTested": "Path cost definition as link cost"},
      {"choiceIndex": 2, "explanation": "STP cost is a **technical metric**, not a monetary value.", "misconceptionTested": "Monetary cost for STP link cost"},
    ],
    "examTip": "Per-port **link cost** (speed) → summed into **path cost** to root bridge.",
  },
  "obj-2.5-source-q006": {
    "correct": {"choiceIndex": 1, "explanation": "**Path cost** is the **sum of link costs** along the path to the **root bridge** — lowest wins root port election."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Path cost is not **latency** — it is accumulated **STP port costs** to the root.", "misconceptionTested": "Path cost as latency"},
      {"choiceIndex": 2, "explanation": "STP metrics are not monetary — path cost is the **numeric sum** of link costs.", "misconceptionTested": "Monetary path cost"},
      {"choiceIndex": 3, "explanation": "A single link's speed-based value is **link cost** — **path cost** adds all hops to root.", "misconceptionTested": "Link cost definition as path cost"},
    ],
    "examTip": "Root port pick: **lowest path cost** to root → tie-break port ID.",
  },
  "obj-2.5-source-q007": {
    "correct": {"choiceIndex": 1, "explanation": "**PVST+** is Cisco's **per-VLAN** spanning tree on **802.1D** — separate STP instance per VLAN."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**802.1w** is the **IEEE RSTP** standard — Cisco per-VLAN on 802.1D is **PVST+**.", "misconceptionTested": "802.1w as Cisco per-VLAN 802.1D enhancement"},
      {"choiceIndex": 2, "explanation": "**CST** runs **one** spanning tree for all VLANs — not separate instances per VLAN.", "misconceptionTested": "CST as per-VLAN STP"},
      {"choiceIndex": 3, "explanation": "**RSTP** is IEEE rapid STP — Cisco per-VLAN on 802.1D = **PVST+**, not plain RSTP.", "misconceptionTested": "RSTP as per-VLAN 802.1D enhancement"},
    ],
    "examTip": "Cisco STP flavors: **PVST+** (802.1D/VLAN) | **Rapid PVST+** (802.1w/VLAN) | **MST** (802.1s).",
  },
  "obj-2.5-source-q008": {
    "correct": {"choiceIndex": 0, "explanation": "**Rapid PVST+** is Cisco's **per-VLAN RSTP** (802.1w) — fast convergence with one instance per VLAN."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**PVST+** uses **802.1D** timers — Rapid PVST+ adds **802.1w** rapid behavior per VLAN.", "misconceptionTested": "PVST+ as 802.1w per-VLAN enhancement"},
      {"choiceIndex": 2, "explanation": "**CST** is a **single** spanning tree — not per-VLAN 802.1w.", "misconceptionTested": "CST as rapid per-VLAN STP"},
      {"choiceIndex": 3, "explanation": "**RSTP+** is not the Cisco per-VLAN product name — correct term is **Rapid PVST+**.", "misconceptionTested": "RSTP+ as Cisco per-VLAN protocol name"},
    ],
    "examTip": "802.1w + per-VLAN on Cisco = **Rapid PVST+** (default on modern Catalyst).",
  },
  "obj-3.3-source-q001": {
    "correct": {"choiceIndex": 1, "explanation": "**/29 = 255.255.255.248** — static route syntax: **`ip route <network> <mask> <next-hop>`**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "IOS static routes use **dotted-decimal mask**, not **CIDR slash** notation in the `ip route` command.", "misconceptionTested": "CIDR slash in ip route command"},
      {"choiceIndex": 2, "explanation": "**255.255.255.240** is a **/28** mask — /29 requires **255.255.255.248**.", "misconceptionTested": "/29 mask as 255.255.255.240"},
      {"choiceIndex": 3, "explanation": "Network and next-hop are **reversed** — destination prefix first, then mask, then **205.34.55.2**.", "misconceptionTested": "Next-hop and network reversed in static route"},
    ],
    "examTip": "Static route template: **`ip route <net> <mask> <next-hop|exit-intf>`** — convert /29 → **255.255.255.248**.",
  },
  "obj-3.3-source-q002": {
    "correct": {"choiceIndex": 2, "explanation": "**Static routes** are **manually configured** by the administrator — no protocol learns them automatically."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Link-state** (OSPF) updates **dynamically** — admin intervention is for design, not per-route typing.", "misconceptionTested": "Link-state as admin-configured per route"},
      {"choiceIndex": 1, "explanation": "**Distance-vector** protocols learn routes automatically — static routing needs **manual** `ip route` lines.", "misconceptionTested": "Distance-vector requiring manual routes"},
      {"choiceIndex": 3, "explanation": "**Dynamic routing** adapts automatically — only **static** routes need explicit admin configuration.", "misconceptionTested": "Dynamic routing as admin-intervention type"},
    ],
    "examTip": "Static = **you type it**. Dynamic = **protocol learns and adapts**.",
  },
  "obj-3.3-source-q003": {
    "correct": {"choiceIndex": 0, "explanation": "**Dynamic routing** reconverges when links fail — protocols advertise alternate paths without manual edits."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**Connected** routes appear when interfaces come up but do **not** find remote paths around failures.", "misconceptionTested": "Connected routes as failover mechanism"},
      {"choiceIndex": 2, "explanation": "A **default route** is still **static** unless learned dynamically — it won't auto-fix missing specifics.", "misconceptionTested": "Default route as self-healing routing"},
      {"choiceIndex": 3, "explanation": "**Static routes** stay until you remove them — no automatic reaction to downstream failures.", "misconceptionTested": "Static routing auto-adapting on failure"},
    ],
    "examTip": "Need automatic failover to remote nets → **dynamic IGP** (OSPF/EIGRP), not static alone.",
  },
  "obj-3.3-source-q004": {
    "correct": {"choiceIndex": 2, "explanation": "**Static routing** scales poorly — every new subnet needs a **manual route** on each router."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**RIP** auto-learns networks — config time grows slower than typing every static on every router.", "misconceptionTested": "RIP as highest manual config burden"},
      {"choiceIndex": 1, "explanation": "**OSPF** advertises networks automatically — static routing bears the **per-prefix** admin cost.", "misconceptionTested": "OSPF as most manual to scale"},
      {"choiceIndex": 3, "explanation": "One **default route** is simple — the stem asks which technique grows **with every new network** (static).", "misconceptionTested": "Default route as scaling config burden"},
    ],
    "examTip": "Large growing networks → avoid **full-mesh static**; use **dynamic** or careful summarization.",
  },
  "obj-3.3-source-q005": {
    "correct": {"choiceIndex": 3, "explanation": "A single **default static route** uses **minimal RAM** — one entry vs. full dynamic topology tables."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**RIP** maintains periodic updates and multiple entries — more RAM than one default static.", "misconceptionTested": "RIP as lowest RAM routing"},
      {"choiceIndex": 1, "explanation": "**OSPF** stores an **LSDB** — significantly more RAM than a lone default route.", "misconceptionTested": "OSPF as lowest RAM option"},
      {"choiceIndex": 2, "explanation": "Many **static routes** can consume RAM — but one **default route** is the leanest answer here.", "misconceptionTested": "All static routing as lowest RAM without default context"},
    ],
    "examTip": "Smallest routing memory footprint: **one default static** → everything else via gateway.",
  },
  "obj-3.3-source-q006": {
    "correct": {"choiceIndex": 2, "explanation": "**RIP** sends **periodic full updates** with simple hop-count logic — lowest protocol **overhead** on CCNA."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**BGP** is heavy (policies, large tables) — far more overhead than RIP.", "misconceptionTested": "BGP as lowest overhead IGP"},
      {"choiceIndex": 1, "explanation": "**OSPF** floods LSAs and runs SPF — more CPU/bandwidth overhead than **RIP**.", "misconceptionTested": "OSPF as lowest overhead dynamic protocol"},
      {"choiceIndex": 3, "explanation": "**EIGRP** (DUAL, partial updates) is still richer than **RIP's** simple periodic vectors.", "misconceptionTested": "EIGRP as lowest overhead protocol"},
    ],
    "examTip": "Lowest dynamic overhead = **RIP** (but poor scale). Best scale = **OSPF/EIGRP**.",
  },
  "obj-3.3-source-q007": {
    "correct": {"choiceIndex": 0, "explanation": "**Dynamic protocols** automatically find **alternate paths** when routes fail — key resiliency advantage over static."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Dynamic protocols maintain **routing tables and updates** — they typically use **more RAM**, not less.", "misconceptionTested": "Dynamic routing lowers RAM usage"},
      {"choiceIndex": 2, "explanation": "SPF/DUAL calculations and updates consume **CPU** — dynamic is not the low-CPU choice.", "misconceptionTested": "Dynamic routing lowers CPU usage"},
      {"choiceIndex": 3, "explanation": "Periodic/flooded updates use **more bandwidth** than a few static lines — resiliency trades overhead.", "misconceptionTested": "Dynamic routing uses less bandwidth"},
    ],
    "examTip": "Dynamic routing trade: **more resources** in exchange for **automatic failover**.",
  },
}

assert len(HAND) == 25, len(HAND)

def fmt_entry(id_, rev):
    body = json.dumps(rev, indent=2)
    indented = "\n".join("  " + line if line else line for line in body.splitlines())
    return f"  '{id_}': {indented},"

lines = [
    "/** Gold reviews — Batch 21: OSPF 3.4 q1+, STP 2.5 q1+, static routing 3.3 q1+. */",
    "export const BATCH21_GOLD = {",
]
for id_, rev in HAND.items():
    lines.append(fmt_entry(id_, rev))
lines.append("}")
lines.append("")

out = ROOT / "src/answerReview/goldAnswerReviewsBatch21.js"
out.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {len(HAND)} entries to {out.relative_to(ROOT)}")
