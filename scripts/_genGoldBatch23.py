#!/usr/bin/env python3
"""Gold batch 23 — OSPF 3.4 q23+, STP 2.5 q17+, static routing 3.3 q15+. Run: python3 scripts/_genGoldBatch23.py"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HAND = {
  "obj-3.4-source-q023": {
    "correct": {"choiceIndex": 3, "explanation": "OSPF interface **cost** is set under the interface with **`ip ospf cost <value>`** — e.g. **`Router(config-if)#ip ospf cost 20000`**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`ip cost`** is not valid IOS OSPF syntax — the keyword **`ospf`** is required: **`ip ospf cost`**.", "misconceptionTested": "ip cost without ospf keyword"},
      {"choiceIndex": 1, "explanation": "**Cost is per-interface**, not global under **`config`** — enter **`interface`** mode first.", "misconceptionTested": "Global config ip ospf cost"},
      {"choiceIndex": 2, "explanation": "**`ip cost`** at global config is invalid — OSPF metric tuning belongs on the **interface**.", "misconceptionTested": "Global ip cost command"},
    ],
    "examTip": "OSPF cost override = **`interface` → `ip ospf cost <n>`** | Reference BW = **`router ospf` → `auto-cost reference-bandwidth`**.",
  },
  "obj-3.4-source-q024": {
    "correct": {"choiceIndex": 3, "explanation": "Enable OSPF with **`router ospf <process-id>`**, then **`network 192.168.1.0 0.0.0.255 area 0`** — wildcard mask + **`area 0`** required."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Missing **`area 0`** on the network statement — OSPF needs an **area** for each enabled network.", "misconceptionTested": "OSPF network without area keyword"},
      {"choiceIndex": 1, "explanation": "**`ospf 0`** is invalid — enter the process with **`router ospf <id>`** (process ID is local, not area 0).", "misconceptionTested": "ospf command without router keyword"},
      {"choiceIndex": 2, "explanation": "OSPF **`network`** uses a **wildcard mask** (**`0.0.0.255`**), not a subnet mask (**`255.255.255.0`**).", "misconceptionTested": "Subnet mask in OSPF network statement"},
    ],
    "examTip": "OSPF enable: **`router ospf 1`** → **`network <net> <wildcard> area <n>`** — wildcard = inverse of subnet mask.",
  },
  "obj-3.4-source-q025": {
    "correct": {"choiceIndex": 0, "explanation": "Cisco OSPF default **maximum-paths** for equal-cost load balancing is **4** routes."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**8** is not the OSPF default — default is **4** (configurable up to **32**).", "misconceptionTested": "8 as default OSPF equal-cost paths"},
      {"choiceIndex": 2, "explanation": "**16** exceeds the default — OSPF ships with **4** equal-cost paths unless changed.", "misconceptionTested": "16 as default OSPF equal-cost paths"},
      {"choiceIndex": 3, "explanation": "**32** is the **maximum** configurable, not the **default** equal-cost path count.", "misconceptionTested": "Maximum paths confused with default"},
    ],
    "examTip": "OSPF ECMP: **default 4** | **max 32** — change with **`maximum-paths`** under **`router ospf`**.",
  },
  "obj-3.4-source-q026": {
    "correct": {"choiceIndex": 2, "explanation": "**/27** = 32 hosts → wildcard **`0.0.0.31`** (32−1). OSPF **`network`** statement needs the **wildcard**, not subnet mask."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`255.255.224.0`** is a **subnet mask** (/19) — OSPF wants the **wildcard** inverse.", "misconceptionTested": "Subnet mask as OSPF wildcard"},
      {"choiceIndex": 1, "explanation": "**`0.0.32.255`** does not match a **/27** — /27 wildcard last octet = **31**.", "misconceptionTested": "Wrong wildcard for /27 prefix"},
      {"choiceIndex": 3, "explanation": "**`0.0.224.255`** is incorrect for **/27** — correct wildcard last octet is **31**.", "misconceptionTested": "Miscomputed /27 wildcard mask"},
    ],
    "examTip": "Wildcard last octet = **2^(32−prefix) − 1** — /27 → **31** | /28 → **15**.",
  },
  "obj-3.4-source-q027": {
    "correct": {"choiceIndex": 3, "explanation": "Change equal-cost path count under the OSPF process: **`Router(config-router)#maximum-paths 10`**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`ospf equal-cost`** is invented syntax — IOS uses **`maximum-paths`** under **`router ospf`**.", "misconceptionTested": "ospf equal-cost global command"},
      {"choiceIndex": 1, "explanation": "**`ospf equal-cost`** does not exist — and **`maximum-paths`** belongs under **`router ospf`**, not a fake **`ospf equal-cost`** sub-mode.", "misconceptionTested": "ospf equal-cost under router config"},
      {"choiceIndex": 2, "explanation": "**`maximum-paths`** must be under **`router ospf`** (**`config-router`**), not global **`config`**.", "misconceptionTested": "maximum-paths at global config"},
    ],
    "examTip": "**`router ospf 1`** → **`maximum-paths <1-32>`** — applies to OSPF ECMP install in RIB.",
  },
  "obj-3.4-source-q028": {
    "correct": {"choiceIndex": 3, "explanation": "Cisco OSPF supports up to **32** equal-cost paths via **`maximum-paths`** (default is **4**)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**4** is the **default**, not the **maximum** — OSPF can load-balance up to **32** paths.", "misconceptionTested": "Default paths confused with maximum"},
      {"choiceIndex": 1, "explanation": "**8** is neither default nor max — Cisco OSPF ECMP ceiling is **32**.", "misconceptionTested": "8 as OSPF maximum paths"},
      {"choiceIndex": 2, "explanation": "**16** is below the platform max — OSPF **`maximum-paths`** tops out at **32**.", "misconceptionTested": "16 as OSPF maximum paths"},
    ],
    "examTip": "OSPF ECMP ceiling = **32** | Default = **4** — same family as EIGRP **`maximum-paths`**.",
  },
  "obj-3.4-source-q029": {
    "correct": {"choiceIndex": 0, "explanation": "**`show ip ospf`** displays process info including the local **router ID (RID)**."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**`show ip interface`** shows interface IPs/status — RID verify is **`show ip ospf`**.", "misconceptionTested": "show ip interface for OSPF RID"},
      {"choiceIndex": 2, "explanation": "**`show ip ospf rid`** is not valid IOS syntax — use **`show ip ospf`**.", "misconceptionTested": "Invented show ip ospf rid command"},
      {"choiceIndex": 3, "explanation": "**`show ip ospf neighbor`** lists **adjacencies**, not the **local router ID**.", "misconceptionTested": "Neighbor table for local RID"},
    ],
    "examTip": "Local RID = **`show ip ospf`** | Neighbors = **`show ip ospf neighbor`** | Per-int OSPF = **`show ip ospf interface`**.",
  },
  "obj-3.4-source-q030": {
    "correct": {"choiceIndex": 2, "explanation": "**/28** = 16 addresses → OSPF wildcard **`0.0.0.15`** (16−1 in the host bits)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`0.0.0.16`** overshoots — /28 wildcard in last octet is **15**, not 16.", "misconceptionTested": "Wildcard 16 for /28 prefix"},
      {"choiceIndex": 1, "explanation": "**`255.255.255.240`** is the **subnet mask** for /28 — OSPF **`network`** needs the **wildcard** **`0.0.0.15`**.", "misconceptionTested": "Subnet mask as OSPF wildcard for /28"},
      {"choiceIndex": 3, "explanation": "**`0.0.0.240`** is not the /28 wildcard — correct value is **`0.0.0.15`**.", "misconceptionTested": "Miscomputed /28 wildcard mask"},
    ],
    "examTip": "/28 → mask **255.255.255.240** | wildcard **0.0.0.15** — memorize /28 pair for OSPF stems.",
  },
  "obj-3.4-source-q031": {
    "correct": {"choiceIndex": 0, "explanation": "**`show ip ospf neighbor`** lists OSPF neighbors and **adjacency state** (FULL, 2-WAY, etc.)."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**`show router adjacency`** is not IOS syntax — OSPF adjacency verify = **`show ip ospf neighbor`**.", "misconceptionTested": "Invented show router adjacency command"},
      {"choiceIndex": 2, "explanation": "**`show ip ospf`** shows **process/RID** — neighbor/adjacency table needs **`show ip ospf neighbor`**.", "misconceptionTested": "show ip ospf for adjacency verify"},
      {"choiceIndex": 3, "explanation": "**`show ip ospf router`** is invalid — neighbor relationships are in **`show ip ospf neighbor`**.", "misconceptionTested": "Invented show ip ospf router command"},
    ],
    "examTip": "Adjacency check = **`show ip ospf neighbor`** — look for **FULL/DR** state with remote RID.",
  },
  "obj-3.4-source-q032": {
    "correct": {"choiceIndex": 1, "explanation": "OSPF default **hello interval** on **broadcast/multi-access** (Ethernet) is **10 seconds** (dead = 40)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**5 seconds** is the default on **point-to-point/non-broadcast** — broadcast LAN default is **10**.", "misconceptionTested": "5-second hello on broadcast OSPF network"},
      {"choiceIndex": 2, "explanation": "**30 seconds** is not the OSPF hello default on broadcast — use **10** (dead **40**).", "misconceptionTested": "30-second OSPF hello on broadcast"},
      {"choiceIndex": 3, "explanation": "**60 seconds** is far too slow — broadcast OSPF hellos default to **10 s**.", "misconceptionTested": "60-second OSPF hello interval"},
    ],
    "examTip": "OSPF timers: **Broadcast** hello **10** dead **40** | **P2P** hello **5** dead **20** — must match on link.",
  },
  "obj-2.5-source-q017": {
    "correct": {"choiceIndex": 0, "explanation": "STP elects a **root bridge** as the **logical center** — all switches compute shortest path **to the root** for a loop-free tree."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "The root bridge does **not** make every forwarding decision — each switch picks **root/designated** ports locally from BPDUs.", "misconceptionTested": "Root bridge makes all forwarding decisions"},
      {"choiceIndex": 2, "explanation": "Each switch calculates **its own** port costs/paths — the root is the **reference point**, not the calculator for the whole network.", "misconceptionTested": "Root bridge calculates all port costs"},
      {"choiceIndex": 3, "explanation": "Switches compute **their own** best path to root — the root bridge is the **topology anchor**, not a central path calculator.", "misconceptionTested": "Root bridge calculates fastest paths for all switches"},
    ],
    "examTip": "Root bridge = **reference** for path cost — every other switch finds **best path TO root**.",
  },
  "obj-2.5-source-q018": {
    "correct": {"choiceIndex": 2, "explanation": "Classic STP bridge ID = **8 bytes**: **2-byte priority** + **6-byte switch MAC address**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Bridge ID is **8 bytes**, not 6 — and uses **MAC**, not **IP address**.", "misconceptionTested": "6-byte bridge ID with IP address"},
      {"choiceIndex": 1, "explanation": "**4-byte priority** is wrong for classic STP — priority field is **2 bytes** (plus MAC).", "misconceptionTested": "4-byte bridge priority with IP"},
      {"choiceIndex": 3, "explanation": "Bridge ID is **8 bytes total** and uses **MAC**, not **10 bytes** with IP.", "misconceptionTested": "10-byte bridge ID with IP address"},
    ],
    "examTip": "802.1D bridge ID = **priority (2 B) + MAC (6 B)** — **lowest** wins root election.",
  },
  "obj-2.5-source-q019": {
    "correct": {"choiceIndex": 0, "explanation": "**Designated port** = **lowest cost** on a **segment**, placed in **forwarding** — one DP per link toward the root."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Designated port wins with **lowest**, not **highest**, cost on the segment.", "misconceptionTested": "Highest cost designated port"},
      {"choiceIndex": 2, "explanation": "That describes a **root port** (lowest path cost **to root**) — designated is **per segment**, lowest cost **on segment**.", "misconceptionTested": "Root port definition as designated port"},
      {"choiceIndex": 3, "explanation": "Designated ports **forward** — and win on **lowest** segment cost, not highest path cost to root in blocking.", "misconceptionTested": "Blocking designated port with highest path cost"},
    ],
    "examTip": "**Root port** = best path **to root** (per switch) | **Designated** = best on **segment** (forwarding).",
  },
  "obj-2.5-source-q020": {
    "correct": {"choiceIndex": 0, "explanation": "Every **non-root** switch has exactly **one root port** — its best path toward the root bridge."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "The **root bridge** has **no root port** — it is the root. Other switches may have **zero** designated ports on some segments.", "misconceptionTested": "Root bridge must have designated port"},
      {"choiceIndex": 2, "explanation": "**Alternate ports** are optional backups — not every non-root switch is guaranteed one.", "misconceptionTested": "Mandatory alternate port on every non-root switch"},
      {"choiceIndex": 3, "explanation": "**Backup ports** are optional — root bridge never has a root port, and backup is not universal.", "misconceptionTested": "Mandatory backup port including root bridge"},
    ],
    "examTip": "Non-root switch: **1 root port** required | Root bridge: **0 root ports**.",
  },
  "obj-2.5-source-q021": {
    "correct": {"choiceIndex": 2, "explanation": "**Root port** = **lowest path cost to the root bridge**, placed in **forwarding** — one per non-root switch."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Lowest cost **to the segment** defines a **designated port** — root port is lowest cost **to the root**.", "misconceptionTested": "Root port as lowest segment cost"},
      {"choiceIndex": 1, "explanation": "Root port uses **lowest** path cost to root and **forwards** — not highest cost.", "misconceptionTested": "Highest segment cost as root port"},
      {"choiceIndex": 3, "explanation": "Root port is **forwarding** with **lowest** cost to root — not highest cost in blocking.", "misconceptionTested": "Blocking root port with highest path cost"},
    ],
    "examTip": "Root port question → look for **lowest path cost TO ROOT** + **forwarding**.",
  },
  "obj-2.5-source-q022": {
    "correct": {"choiceIndex": 0, "explanation": "**Designated port** = **lowest cost on the segment**, **forwarding** — carries traffic for that LAN segment."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Lowest path cost **to the root** describes a **root port**, not designated.", "misconceptionTested": "Root port definition as designated port"},
      {"choiceIndex": 2, "explanation": "Designated ports **forward** with **lowest segment cost** — not highest path cost in blocking.", "misconceptionTested": "Blocking port with highest path cost as designated"},
      {"choiceIndex": 3, "explanation": "Designated wins on **lowest** segment cost — **highest** cost does not become designated.", "misconceptionTested": "Highest segment cost as designated port"},
    ],
    "examTip": "Designated port stem → **lowest cost on segment** + **forwarding** (not path to root).",
  },
  "obj-2.5-source-q023": {
    "correct": {"choiceIndex": 2, "explanation": "PVST+ extends bridge ID: **4-bit priority + 12-bit VLAN (sys-id-ext) + 6-byte MAC** — per-VLAN root election."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Priority is **4 bits** (nibble), sys-id-ext is **12 bits** — not **4-byte / 12-byte** fields.", "misconceptionTested": "Byte-sized PVST+ bridge ID fields"},
      {"choiceIndex": 1, "explanation": "Garbled field sizes — PVST+ uses **4-bit priority + 12-bit VLAN ID extension + 6-byte MAC**.", "misconceptionTested": "Incorrect PVST+ bridge ID byte layout"},
      {"choiceIndex": 3, "explanation": "Bridge ID ends with **MAC address**, not **IP** — and field sizes are **bits**, not bytes for priority/sys-id.", "misconceptionTested": "IP address in PVST+ bridge ID"},
    ],
    "examTip": "PVST+ bridge ID = **priority nibble + VLAN sys-id-ext + MAC** — different root **per VLAN**.",
  },
  "obj-2.5-source-q024": {
    "correct": {"choiceIndex": 2, "explanation": "Default STP bridge priority on Cisco switches is **32768** (0x8000) before adding VLAN extension in PVST+."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**8192** is a valid **configured** priority step — not the **default**.", "misconceptionTested": "8192 as default bridge priority"},
      {"choiceIndex": 1, "explanation": "**16384** is half of default — Cisco default bridge priority is **32768**.", "misconceptionTested": "16384 as default bridge priority"},
      {"choiceIndex": 3, "explanation": "**65526** is not the default — standard default is **32768** (multiples of 4096 when setting).", "misconceptionTested": "65526 as default bridge priority"},
    ],
    "examTip": "Default STP priority = **32768** — lower value wins; set in **4096** increments on Cisco.",
  },
  "obj-3.3-source-q015": {
    "correct": {"choiceIndex": 2, "explanation": "**Ping** uses **ICMP echo request/reply** to test reachability — the direct check for whether a router responds."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**SNMP traps** are **asynchronous notifications** from managed devices — not an ICMP reachability test.", "misconceptionTested": "SNMP traps as ICMP router check"},
      {"choiceIndex": 1, "explanation": "**Notifications** is vague — the CCNA tool that uses **ICMP** for status is **ping**.", "misconceptionTested": "Generic notifications as ICMP check"},
      {"choiceIndex": 3, "explanation": "**ARP** resolves **IP → MAC** on a subnet — it does not ICMP-check remote router liveness.", "misconceptionTested": "ARP as router status check"},
    ],
    "examTip": "Reachability test = **ping (ICMP)** | L2 resolve = **ARP** | Management events = **SNMP**.",
  },
  "obj-3.3-source-q016": {
    "correct": {"choiceIndex": 2, "explanation": "Cisco **ping** output: **`!`** = echo reply received — **five `!`** means the distant router **is responding**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "No response shows **`.`** (timeout) — **`!`** means **success**, not failure.", "misconceptionTested": "Exclamation mark as ping failure"},
      {"choiceIndex": 1, "explanation": "**`!`** confirms reply only — **RTT** is shown separately in the summary, not by the symbol itself.", "misconceptionTested": "Exclamation mark indicates high latency"},
      {"choiceIndex": 3, "explanation": "**`!`** does not encode low vs high latency — it simply means **ICMP echo reply received**.", "misconceptionTested": "Exclamation mark indicates low latency"},
    ],
    "examTip": "Ping symbols: **`!`** = success | **`.`** = timeout | **`U`** = unreachable.",
  },
  "obj-3.3-source-q017": {
    "correct": {"choiceIndex": 1, "explanation": "IPv4 static route: **`ip route <network> <subnet-mask> <exit-intf>`** → **`ip route 192.168.4.0 255.255.255.0 serial 0/1`**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "IOS static routes use **dotted-decimal mask**, not **CIDR `/24`** syntax in **`ip route`**.", "misconceptionTested": "CIDR notation in ip route command"},
      {"choiceIndex": 2, "explanation": "Exit interface is specified **directly** — **`interface serial 0/1`** keyword is not used.", "misconceptionTested": "interface keyword in static route"},
      {"choiceIndex": 3, "explanation": "Malformed config mode — static routes are **`Router(config)#ip route …`**, not a **`config-rtr`** sub-mode.", "misconceptionTested": "Invalid config-rtr static route syntax"},
    ],
    "examTip": "**`ip route <net> <mask> <next-hop|interface>`** — mask is always **255.255.255.0** style, not `/24`.",
  },
  "obj-3.3-source-q018": {
    "correct": {"choiceIndex": 1, "explanation": "**`ip default-gateway`** on a **router** only affects **locally generated** (management) traffic when **IP routing is disabled** — it does **not** populate the **forwarding** RIB."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`ip default-network`** advertises a candidate default — it does not make **`default-gateway`** forward transit traffic.", "misconceptionTested": "default-network fixes default-gateway forwarding"},
      {"choiceIndex": 2, "explanation": "**`default-gateway`** is for **hosts** or **router management** — not a dynamic routing feature.", "misconceptionTested": "default-gateway for dynamic routing"},
      {"choiceIndex": 3, "explanation": "The gateway IP may be fine — the issue is using **`default-gateway`** instead of **`ip route 0.0.0.0 0.0.0.0`** for forwarded packets.", "misconceptionTested": "Wrong gateway IP as root cause"},
    ],
    "examTip": "Router transit default = **`ip route 0.0.0.0 0.0.0.0 <gw>`** | **`ip default-gateway`** = management/host behavior.",
  },
  "obj-3.3-source-q019": {
    "correct": {"choiceIndex": 2, "explanation": "Next hop must be **Router B's IP on the shared link** — **`192.168.2.2`** (B's Gi0/0 toward A), not A's own interface."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`serial 0/1`** is wrong interface — topology uses **Gi0/1**; static route needs correct **L3 next hop**.", "misconceptionTested": "Wrong exit interface in static route"},
      {"choiceIndex": 1, "explanation": "**192.168.2.1** is **Router A's own** Gi0/1 address — next hop must be the **peer** (**192.168.2.2**).", "misconceptionTested": "Own interface IP as next hop"},
      {"choiceIndex": 3, "explanation": "**192.168.3.1** is on **Network B** — unreachable until the route via **192.168.2.2** exists.", "misconceptionTested": "Remote network gateway as next hop"},
    ],
    "examTip": "Static route next hop = **directly connected peer IP** on the link toward the destination.",
  },
  "obj-3.3-source-q020": {
    "correct": {"choiceIndex": 3, "explanation": "Adding an IP to an interface creates a **connected route**, may add a **local /32**, and can trigger **dynamic routing updates** if protocols run — **all apply**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "A **/32 local** route alone is incomplete — IOS also installs the **connected network prefix**.", "misconceptionTested": "Only /32 route on interface IP config"},
      {"choiceIndex": 1, "explanation": "IOS does not auto-create a vague **summary** — it adds **connected** (and local host) routes.", "misconceptionTested": "Automatic summary route on interface IP"},
      {"choiceIndex": 2, "explanation": "Routing updates happen **only if** dynamic protocols are configured — but connected route always appears, so **all of the above** is best.", "misconceptionTested": "Dynamic updates without connected route"},
    ],
    "examTip": "Interface `ip address` → **connected route in RIB** + possible **local host route** + **IGP advertisement** if enabled.",
  },
  "obj-3.3-source-q021": {
    "correct": {"choiceIndex": 1, "explanation": "**`show ip interface brief`** lists each interface with **IP address**, status, and protocol — the standard IP verify command."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show ip`** alone is incomplete IOS syntax — use **`show ip interface brief`** or **`show ip route`**.", "misconceptionTested": "Truncated show ip command"},
      {"choiceIndex": 2, "explanation": "**`show interfaces`** shows L1/L2 detail and may include IP — **`show ip interface brief`** is the concise IP summary.", "misconceptionTested": "show interfaces as primary IP verify"},
      {"choiceIndex": 3, "explanation": "**`show ip brief`** is invalid — correct command is **`show ip interface brief`**.", "misconceptionTested": "Invented show ip brief command"},
    ],
    "examTip": "Interface IPs = **`show ip interface brief`** | Routing table = **`show ip route`**.",
  },
}

assert len(HAND) == 25, len(HAND)

def fmt_entry(id_, rev):
    body = json.dumps(rev, indent=2)
    indented = "\n".join("  " + line if line else line for line in body.splitlines())
    return f"  '{id_}': {indented},"

lines = [
    "/** Gold reviews — Batch 23: OSPF 3.4 q23+, STP 2.5 q17+, static routing 3.3 q15+. */",
    "export const BATCH23_GOLD = {",
]
for id_, rev in HAND.items():
    lines.append(fmt_entry(id_, rev))
lines.append("}")
lines.append("")

out = ROOT / "src/answerReview/goldAnswerReviewsBatch23.js"
out.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {len(HAND)} entries to {out.relative_to(ROOT)}")
