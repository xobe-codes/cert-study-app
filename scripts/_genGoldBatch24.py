#!/usr/bin/env python3
"""Gold batch 24 — static routing 3.3 q22+, OSPF 3.4 q33+. Run: python3 scripts/_genGoldBatch24.py"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HAND = {
  "obj-3.3-source-q022": {
    "correct": {"choiceIndex": 0, "explanation": "A **link light** means L1 is up, but **`shutdown`** leaves the interface **administratively down** — no IP/connected route appears until **`no shutdown`**."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Speed mismatch causes errors/perf issues — the IP would still appear if the interface is **up/up** and addressed.", "misconceptionTested": "Speed mismatch hides connected route"},
      {"choiceIndex": 2, "explanation": "Bandwidth is a routing metric setting — it does not prevent a **connected route** from appearing.", "misconceptionTested": "Bandwidth setting blocks connected route"},
      {"choiceIndex": 3, "explanation": "Running config drives the RIB — **`copy run start`** affects **startup**, not whether an **up/up** addressed interface gets a connected route.", "misconceptionTested": "Save required for connected route"},
    ],
    "examTip": "No connected route but link LED on → check **`show ip interface brief`** for **admin down** (`shutdown`).",
  },
  "obj-3.3-source-q023": {
    "correct": {"choiceIndex": 2, "explanation": "Static routes send **no routing protocol updates** — **zero periodic router-to-router traffic** vs OSPF/EIGRP/RIP hellos/updates."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Static routes require **manual** adds/changes per prefix — not “easy” at scale.", "misconceptionTested": "Static routing easy to add networks at scale"},
      {"choiceIndex": 1, "explanation": "Large networks with statics are **hard to maintain** — every change is manual.", "misconceptionTested": "Static routing suited for large networks"},
      {"choiceIndex": 3, "explanation": "Any admin can configure statics — that is not a unique **benefit**; security/control is separate.", "misconceptionTested": "Any admin config as static routing benefit"},
    ],
    "examTip": "Static routing win = **no routing protocol overhead** | Loss = **manual updates** when topology changes.",
  },
  "obj-3.3-source-q024": {
    "correct": {"choiceIndex": 2, "explanation": "Static routes live in **startup/running config** — they are **not** stored in Flash like IOS images."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "RAM holds the **active RIB** at runtime — **persistent** static config is in **startup config**.", "misconceptionTested": "Static routes stored only in RAM"},
      {"choiceIndex": 1, "explanation": "Flash stores IOS/files — **route statements** are configuration, not Flash content.", "misconceptionTested": "Static routes in Flash"},
      {"choiceIndex": 3, "explanation": "**Routing database** is vague — CCNA answer is **startup configuration** (and running until reload).", "misconceptionTested": "Generic routing database storage"},
    ],
    "examTip": "Statics = **config** (`show running-config | section ip route`) — dynamic learned routes also in RAM RIB.",
  },
  "obj-3.3-source-q025": {
    "correct": {"choiceIndex": 2, "explanation": "**`192.168.0.0 255.255.240.0`** summarizes **192.168.1.0/24** and **192.168.2.0/24** without covering all of **192.168.0.0/16**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`/16` mask** covers **all 192.168.0.0/16** — too broad for just two /24s.", "misconceptionTested": "/16 summary for two /24 networks"},
      {"choiceIndex": 1, "explanation": "**255.255.255.0** is a **/24** — cannot summarize two distinct /24s in one statement.", "misconceptionTested": "/24 mask for two /24 prefixes"},
      {"choiceIndex": 3, "explanation": "**255.255.0.240** is an invalid/ nonsensical mask for this summarization task.", "misconceptionTested": "Invalid subnet mask in static route"},
    ],
    "examTip": "Summarize contiguous subnets → find **longest common prefix** — here **/20 (255.255.240.0)** covers .1 and .2 /24 blocks.",
  },
  "obj-3.3-source-q026": {
    "correct": {"choiceIndex": 1, "explanation": "A **floating static** (higher **AD**) via a **second interface** becomes active when the **primary interface/path fails**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "AD does not “fix” a bad route to the same destination — **interface down** triggers failover, not AD alone.", "misconceptionTested": "AD alone fixes failed routing"},
      {"choiceIndex": 2, "explanation": "IOS does not load-balance statics by **traffic volume** — second route is **backup**, not utilization-based.", "misconceptionTested": "Traffic-based static failover"},
      {"choiceIndex": 3, "explanation": "A second static does not **break routing loops** — loops need topology/protocol fixes.", "misconceptionTested": "Backup static overcomes routing loop"},
    ],
    "examTip": "Floating static = **same prefix, higher AD, alternate next-hop/intf** — installs when primary disappears.",
  },
  "obj-3.3-source-q027": {
    "correct": {"choiceIndex": 0, "explanation": "IOS adds a **host /32** route for the configured address — **`208.43.34.17/32`** on **Serial 0/0/0** (display may show connected/local codes)."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**208.43.34.24/29** is not the host route for **.17/29** — IOS installs **/32** for the configured IP.", "misconceptionTested": "Network /29 route instead of host /32"},
      {"choiceIndex": 2, "explanation": "**208.43.34.8/29** is the **network** prefix — the keyed table line for the configured IP is the **/32 host** entry.", "misconceptionTested": "Subnet network route as primary host entry"},
      {"choiceIndex": 3, "explanation": "**208.43.34.17/29** is invalid host prefix length — configured /29 address gets **/32 local** route.", "misconceptionTested": "/29 host route in RIB"},
    ],
    "examTip": "Interface IP → **connected network** + **local /32** for the exact address — read `show ip route` codes **C** and **L**.",
  },
  "obj-3.3-source-q028": {
    "correct": {"choiceIndex": 3, "explanation": "**192.168.4.0/24** is **directly connected (C)** on **Gi0/1** — fully routable without a next-hop."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**172.30.0.0/16** is static via **10.1.1.1** — routable **if** next-hop resolves; stem asks which is clearly routable (connected wins).", "misconceptionTested": "Static route preferred over connected"},
      {"choiceIndex": 1, "explanation": "**192.168.128.0/24** shows **(unreachable next-hop)** — **not** usable for forwarding.", "misconceptionTested": "Static with unreachable next-hop still routable"},
      {"choiceIndex": 2, "explanation": "**192.168.0.0/16** on **Vlan1** is connected but stem’s best “routable” answer keyed to **192.168.4.0/24** — read table carefully.", "misconceptionTested": "Choosing broader connected over specific /24"},
    ],
    "examTip": "**Unreachable next-hop** = static not usable | **Connected (C)** = always forward out local interface.",
  },
  "obj-3.3-source-q029": {
    "correct": {"choiceIndex": 3, "explanation": "On **NBMA/serial**, use **exit interface** toward Network A: **`ip route 198.44.4.0 255.255.255.0 Serial 0/1`** (link toward A)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "IOS static routes use **dotted-decimal mask**, not **CIDR `/24`** in **`ip route`**.", "misconceptionTested": "CIDR notation in ip route"},
      {"choiceIndex": 1, "explanation": "**198.55.4.10** is on the **wrong side** of Router B — next hop must be toward Router A on the correct serial.", "misconceptionTested": "Wrong next-hop IP on serial link"},
      {"choiceIndex": 2, "explanation": "**Serial 0/0** may not be the interface toward Network A per topology — use **S0/1** toward A.", "misconceptionTested": "Wrong exit interface for static route"},
    ],
    "examTip": "Serial static → often **`ip route <net> <mask> <interface>`** when no NBMA next-hop IP is given.",
  },
  "obj-3.3-source-q030": {
    "correct": {"choiceIndex": 0, "explanation": "**194.22.34.54/28** belongs to **194.22.34.48/28** network — connected route shows that **/28 prefix** on the interface."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**194.22.34.64/28** is the **next** /28 block — .54 falls in **.48/28**.", "misconceptionTested": "Wrong /28 network boundary"},
      {"choiceIndex": 2, "explanation": "**194.22.34.54/28** is not a valid **network** route line — IOS shows **network /28** + **host /32**.", "misconceptionTested": "Host address as /28 network route"},
      {"choiceIndex": 3, "explanation": "**194.22.34.32/28** is the prior subnet — .54 is in **.48–.63** range.", "misconceptionTested": "Misaligned /28 subnet for .54"},
    ],
    "examTip": "/28 boundaries: increment **16** in last octet — .48, .64, .80… — place .54 in **.48/28**.",
  },
  "obj-3.3-source-q031": {
    "correct": {"choiceIndex": 2, "explanation": "IPv6 default static route: **`ipv6 route ::/0 serial 0/0`** — **`::/0`** is the all-zeros prefix."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`ip route 0.0.0.0`** is **IPv4** syntax — IPv6 needs **`ipv6 route ::/0`**.", "misconceptionTested": "IPv4 default route for IPv6"},
      {"choiceIndex": 1, "explanation": "**`ipv6 route 0.0.0.0`** mixes IPv4 zeros with **`ipv6 route`** — invalid.", "misconceptionTested": "IPv4 address in ipv6 route command"},
      {"choiceIndex": 3, "explanation": "**`ip route ::/0`** uses wrong address family keyword — must be **`ipv6 route`**.", "misconceptionTested": "ip route keyword for IPv6 default"},
    ],
    "examTip": "IPv6 default = **`ipv6 route ::/0 <next-hop|interface>`** | IPv4 default = **`ip route 0.0.0.0 0.0.0.0 …`**.",
  },
  "obj-3.3-source-q032": {
    "correct": {"choiceIndex": 1, "explanation": "IPv6 static with prefix: **`ipv6 route fc00:0:0:1::/64 serial 0/0/0`** — include **`/64`** and **`ipv6 route`**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`ip route`** is IPv4 — IPv6 prefixes need **`ipv6 route`**.", "misconceptionTested": "ip route for IPv6 prefix"},
      {"choiceIndex": 2, "explanation": "Wrong address family and interface shorthand — use **`ipv6 route …/64 serial 0/0/0`**.", "misconceptionTested": "IPv4 ip route with /64"},
      {"choiceIndex": 3, "explanation": "Missing **prefix length (/64)** on the IPv6 prefix — IOS static needs **`network/prefix`**.", "misconceptionTested": "IPv6 static route without prefix length"},
    ],
    "examTip": "IPv6 static format: **`ipv6 route <prefix/len> <next-hop|interface>`** — always include prefix length.",
  },
  "obj-3.3-source-q033": {
    "correct": {"choiceIndex": 0, "explanation": "Two equal-cost statics to **192.168.5.0/24** — IOS uses **first listed** next-hop **192.168.4.2** for **192.168.5.6**."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**192.168.4.5** is the **second** static — equal metrics use **first route in table** unless ECMP configured.", "misconceptionTested": "Second static preferred over first"},
      {"choiceIndex": 2, "explanation": "**Serial 0/0/1** does not appear in the routing table excerpt — forward via **192.168.4.2**.", "misconceptionTested": "Invented exit interface"},
      {"choiceIndex": 3, "explanation": "**Serial 0/2/0** is not in the table — destination matches **192.168.5.0/24 static via .4.2**.", "misconceptionTested": "Wrong interface not in RIB"},
    ],
    "examTip": "Duplicate statics same AD/metric → **top entry wins** unless **`ip route` ECMP** / **`maximum-paths`** applies.",
  },
  "obj-3.3-source-q034": {
    "correct": {"choiceIndex": 2, "explanation": "**Default routing** (`0.0.0.0/0` or `::/0`) is a **special case of static routing** — manually configured catch-all."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**OSPF** is a **dynamic** link-state protocol — not static.", "misconceptionTested": "OSPF classified as static routing"},
      {"choiceIndex": 1, "explanation": "**EIGRP** is **dynamic** advanced distance vector — not static.", "misconceptionTested": "EIGRP classified as static routing"},
      {"choiceIndex": 3, "explanation": "**RIP** is **dynamic** distance vector — not static.", "misconceptionTested": "RIP classified as static routing"},
    ],
    "examTip": "Static family = **specific prefixes + default route** | Dynamic = **OSPF/EIGRP/RIP** with updates.",
  },
  "obj-3.3-source-q035": {
    "correct": {"choiceIndex": 1, "explanation": "Statics expose **only what you configure** — no surprise routes from neighbors → **predictable, controlled** forwarding (exam “secure” wording)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Statics have **more** admin overhead at scale — every change is manual.", "misconceptionTested": "Less overhead with static routing"},
      {"choiceIndex": 2, "explanation": "Resiliency needs **redundant paths/floating statics** — not automatic like dynamic protocols.", "misconceptionTested": "Automatic resiliency from static routing alone"},
      {"choiceIndex": 3, "explanation": "Large networks do **not** scale cleanly with static-only designs.", "misconceptionTested": "Static routing extremely scalable"},
    ],
    "examTip": "Static “advantage” stems often = **control/predictability** or **no protocol traffic** — not scalability.",
  },
  "obj-3.3-source-q036": {
    "correct": {"choiceIndex": 3, "explanation": "**Static routing** sends **zero periodic updates** — lowest protocol bandwidth overhead."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**RIP** broadcasts/multicasts **periodic updates** — higher overhead than static.", "misconceptionTested": "RIP lowest bandwidth overhead"},
      {"choiceIndex": 1, "explanation": "**OSPF** sends **hellos + LSAs** — ongoing traffic vs static.", "misconceptionTested": "OSPF lowest bandwidth overhead"},
      {"choiceIndex": 2, "explanation": "**EIGRP** sends **hello/updates** — more overhead than no protocol.", "misconceptionTested": "EIGRP lowest bandwidth overhead"},
    ],
    "examTip": "Lowest routing overhead = **static (none)** → then protocol-specific intervals (RIP 30s, OSPF hellos, etc.).",
  },
  "obj-3.3-source-q037": {
    "correct": {"choiceIndex": 3, "explanation": "**Static routes** do not auto-adapt — admin must **remove/replace** when a path fails (unless floating static backup exists)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Dynamic routing** reconverges automatically — no manual intervention for each failure.", "misconceptionTested": "Dynamic routing needs manual fix per failure"},
      {"choiceIndex": 1, "explanation": "**Connected routes** appear/disappear with **interface state** — not manual static edits.", "misconceptionTested": "Connected routes need admin intervention"},
      {"choiceIndex": 2, "explanation": "**Default routing** is still **static** if manually configured — same manual failure behavior.", "misconceptionTested": "Default routing auto-heals without admin"},
    ],
    "examTip": "Manual intervention on failure = **static** | Auto reconvergence = **dynamic IGP**.",
  },
  "obj-3.3-source-q038": {
    "correct": {"choiceIndex": 2, "explanation": "Filter RIB to statics only: **`show ip route static`** — valid **`show ip route`** keyword."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show static routes`** is not valid IOS syntax.", "misconceptionTested": "Invented show static routes command"},
      {"choiceIndex": 1, "explanation": "**`show ip static routes`** is invalid — use **`show ip route static`**.", "misconceptionTested": "Invented show ip static routes command"},
      {"choiceIndex": 3, "explanation": "**`show ip routes`** shows **all** routes — does not filter static-only.", "misconceptionTested": "Full table for static-only filter"},
    ],
    "examTip": "Route filters: **`show ip route static|connected|ospf|rip`** — protocol keyword after **`route`**.",
  },
  "obj-3.3-source-q039": {
    "correct": {"choiceIndex": 2, "explanation": "With **`/64`** on the interface, IOS derives connected network **`2000:db8:4400:2300::/64`** for that link."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Network ID is **`…2300::/64`**, not truncated **`2000:0db8::`** without the /64 host portion.", "misconceptionTested": "Truncated IPv6 network ID"},
      {"choiceIndex": 1, "explanation": "Address is on **Serial 0/1** configured — not a /128 on wrong interface name in option.", "misconceptionTested": "Wrong interface and /128 host route"},
      {"choiceIndex": 3, "explanation": "Malformed expanded address — IOS compresses to **`2000:db8:4400:2300::/64`** network.", "misconceptionTested": "Incorrect IPv6 network notation"},
    ],
    "examTip": "IPv6 **`/64` on interface** → connected **`network::/64`** in **`show ipv6 route`**.",
  },
  "obj-3.3-source-q040": {
    "correct": {"choiceIndex": 1, "explanation": "**Link-local (fe80::/10)** addresses are **not installed as global routes** in the RIB — they stay on-link."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Multicast (**ff00::/8**) behavior differs — stem’s **fe80::** is **link-local**, not multicast.", "misconceptionTested": "Multicast addresses in RIB discussion"},
      {"choiceIndex": 2, "explanation": "Multiple addresses/routes can coexist — not limited to one route per interface.", "misconceptionTested": "Single route per interface limit"},
      {"choiceIndex": 3, "explanation": "IPv6 has **no broadcast** — fe80 is **link-local**, not broadcast.", "misconceptionTested": "Broadcast addresses in IPv6 RIB"},
    ],
    "examTip": "Link-local **fe80::** = per-interface, not globally routed | Global **2001:db8::/64** → connected route.",
  },
  "obj-3.3-source-q041": {
    "correct": {"choiceIndex": 2, "explanation": "**`ipv6 address autoconfig default`** on the LAN interface advertises **default route** to hosts via RA (SLAAC + default)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`ipv6 address default`** is incomplete/invalid syntax for host Internet access.", "misconceptionTested": "Invalid ipv6 address default syntax"},
      {"choiceIndex": 1, "explanation": "**`ip route ::/0`** is **IPv4 command family** — use **`ipv6`** features for IPv6 LAN default.", "misconceptionTested": "ip route for IPv6 default on router LAN"},
      {"choiceIndex": 3, "explanation": "**`ipv6 address slaac`** alone may not set **default** — **`autoconfig default`** adds default RA flag.", "misconceptionTested": "SLAAC without default router advertisement"},
    ],
    "examTip": "IPv6 LAN Internet for hosts → router **`ipv6 route ::/0`** uplink + **`ipv6 address autoconfig default`** on LAN.",
  },
  "obj-3.3-source-q042": {
    "correct": {"choiceIndex": 2, "explanation": "IPv4 default static route: **`ip route 0.0.0.0 0.0.0.0 192.168.2.6`** — zero network + zero mask."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`ip default-network`** marks a **candidate default** for redistribution — different from static **`0.0.0.0/0`**.", "misconceptionTested": "default-network as static default route"},
      {"choiceIndex": 1, "explanation": "**`ip route default-gateway`** is invalid — **`default-gateway`** is for hosts/L3-switch management.", "misconceptionTested": "default-gateway in ip route syntax"},
      {"choiceIndex": 3, "explanation": "Mask must be **`0.0.0.0`**, not **`255.255.255.255`**, for a default route.", "misconceptionTested": "Host mask on default route"},
    ],
    "examTip": "Default static = **`0.0.0.0 0.0.0.0 <next-hop>`** — do not confuse with **`ip default-network`**.",
  },
  "obj-3.3-source-q043": {
    "correct": {"choiceIndex": 3, "explanation": "Filter RIB to RIP learned routes: **`show ip route rip`**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show ip rip`** shows **protocol status**, not filtered RIB entries only.", "misconceptionTested": "show ip rip for RIB filter"},
      {"choiceIndex": 1, "explanation": "**`show ip route`** shows **all** routes — no RIP-only filter.", "misconceptionTested": "Full table for RIP-only view"},
      {"choiceIndex": 2, "explanation": "**`show ip rip route`** is not standard IOS — use **`show ip route rip`**.", "misconceptionTested": "Invented show ip rip route command"},
    ],
    "examTip": "**`show ip route <connected|static|ospf|rip|eigrp>`** — same pattern for every source.",
  },
  "obj-3.4-source-q033": {
    "correct": {"choiceIndex": 1, "explanation": "Stop OSPF hellos on ISP-facing intf: **`router ospf 1` → `passive-interface gigabitethernet 0/1`** — process-level command."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`passive-interface`** under **`config-if`** is wrong context — configure under **`router ospf`**.", "misconceptionTested": "passive-interface in interface config mode"},
      {"choiceIndex": 2, "explanation": "**`passive-interface`** is not a global **`config`** command — belongs under **`router ospf`**.", "misconceptionTested": "passive-interface at global config"},
      {"choiceIndex": 3, "explanation": "**`passive-interface default`** makes **all** interfaces passive except those explicitly activated — overkill vs single ISP intf.", "misconceptionTested": "passive-interface default for one ISP link"},
    ],
    "examTip": "OSPF passive = **`router ospf` → `passive-interface <intf>`** — no hellos, still advertises subnet.",
  },
  "obj-3.4-source-q034": {
    "correct": {"choiceIndex": 2, "explanation": "**`show ip ospf interface`** lists OSPF-enabled interfaces, **hello/dead timers**, and area — verifies hello source."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show interfaces`** is L1/L2 — no OSPF hello/timer detail.", "misconceptionTested": "Generic show interfaces for OSPF hellos"},
      {"choiceIndex": 1, "explanation": "**`show ip routes`** is the **RIB** — does not show OSPF hello interfaces.", "misconceptionTested": "Routing table for OSPF hello verify"},
      {"choiceIndex": 3, "explanation": "**`show ip ospf brief`** is not standard IOS — use **`show ip ospf interface`**.", "misconceptionTested": "Invented show ip ospf brief command"},
    ],
    "examTip": "OSPF intf timers/hellos = **`show ip ospf interface`** | Neighbors = **`show ip ospf neighbor`**.",
  },
  "obj-3.4-source-q035": {
    "correct": {"choiceIndex": 3, "explanation": "Static OSPF RID override: **`router ospf 1` → `router-id 192.168.1.5`** — beats loopback/interface order."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Physical **Fa0/1 IP** can influence RID but **`router-id`** under OSPF **overrides** all.", "misconceptionTested": "Physical interface IP as static RID override"},
      {"choiceIndex": 1, "explanation": "Loopback IP is a common RID source — still **`router-id`** command is the explicit override.", "misconceptionTested": "Loopback config alone as override keyword"},
      {"choiceIndex": 2, "explanation": "**`rid`** is invalid — IOS uses **`router-id <dotted-decimal>`** under **`router ospf`**.", "misconceptionTested": "rid keyword instead of router-id"},
    ],
    "examTip": "OSPF RID priority: **`router-id` (manual)** > highest loopback > highest active interface IP.",
  },
}

assert len(HAND) == 25, len(HAND)

def fmt_entry(id_, rev):
    body = json.dumps(rev, indent=2)
    indented = "\n".join("  " + line if line else line for line in body.splitlines())
    return f"  '{id_}': {indented},"

lines = [
    "/** Gold reviews — Batch 24: static routing 3.3 q22+, OSPF 3.4 q33+. */",
    "export const BATCH24_GOLD = {",
]
for id_, rev in HAND.items():
    lines.append(fmt_entry(id_, rev))
lines.append("}")
lines.append("")

out = ROOT / "src/answerReview/goldAnswerReviewsBatch24.js"
out.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {len(HAND)} entries to {out.relative_to(ROOT)}")
