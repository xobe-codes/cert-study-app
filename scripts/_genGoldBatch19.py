#!/usr/bin/env python3
"""Gold batch 19 — FHRP 3.5 q14+, REST APIs 6.5, config mgmt 6.6, L2 security 5.7, CDP 2.3. Run: python3 scripts/_genGoldBatch19.py"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HAND = {
  "obj-3.5-source-q014": {
    "correct": {"choiceIndex": 2, "explanation": "The **active virtual gateway (AVG)** answers ARP for the VIP with a **virtual forwarder (AVF) MAC** — GLBP load-balances by handing out different forwarder MACs."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Active router** is HSRP terminology — GLBP uses **AVG/AVF** roles, not active/standby.", "misconceptionTested": "HSRP active router role applied to GLBP"},
      {"choiceIndex": 1, "explanation": "The AVG does not return the **physical router MAC** — it returns an **AVF virtual MAC** for load sharing.", "misconceptionTested": "Physical router MAC as GLBP ARP response"},
      {"choiceIndex": 3, "explanation": "**Tracking requests** adjust priority — ARP responses come from the **AVG with AVF MACs**.", "misconceptionTested": "Virtual router tracking as GLBP ARP handler"},
    ],
    "examTip": "GLBP roles: **AVG** (VIP/ARP) + **AVF** (forwards) — not HSRP active/standby.",
  },
  "obj-3.5-source-q015": {
    "correct": {"choiceIndex": 3, "explanation": "The **AVG** is the router with the **highest priority**; ties break to the **highest IP address** on the interface."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Lowest priority** loses the AVG election — GLBP picks the **highest** priority.", "misconceptionTested": "Lowest priority wins GLBP AVG"},
      {"choiceIndex": 1, "explanation": "Highest priority alone is incomplete — Cisco breaks ties with the **highest IP address**.", "misconceptionTested": "Priority-only AVG election without IP tie-break"},
      {"choiceIndex": 2, "explanation": "**Lowest priority and lowest IP** is the opposite of GLBP AVG election rules.", "misconceptionTested": "Lowest priority and IP as AVG winner"},
    ],
    "examTip": "GLBP AVG election: **highest priority** → tie = **highest IP**.",
  },
  "obj-3.5-source-q016": {
    "correct": {"choiceIndex": 1, "explanation": "GLBP supports up to **4 active virtual forwarders (AVFs)** per group for load balancing."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**2** AVFs is below the GLBP maximum — Cisco allows **4** forwarders per group.", "misconceptionTested": "Two AVFs as GLBP maximum"},
      {"choiceIndex": 2, "explanation": "**16** exceeds the standard GLBP AVF limit — the keyed maximum is **4**.", "misconceptionTested": "Sixteen AVFs as GLBP group max"},
      {"choiceIndex": 3, "explanation": "**1,024** is far above the GLBP AVF ceiling — memorize **4 AVFs** per group.", "misconceptionTested": "1024 AVFs as GLBP limit"},
    ],
    "examTip": "GLBP load share: up to **4 AVFs** + 1 AVG per group.",
  },
  "obj-3.5-source-q017": {
    "correct": {"choiceIndex": 0, "explanation": "Raise HSRP priority above peers with **`standby <group> priority <value>`** under the interface — e.g., **150** beats default **100**."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Priority **70** is below the default **100** — it would not win active router election.", "misconceptionTested": "Sub-default priority to become active"},
      {"choiceIndex": 2, "explanation": "**`hsrp`** is not valid IOS syntax — HSRP uses the **`standby`** interface command.", "misconceptionTested": "hsrp keyword instead of standby"},
      {"choiceIndex": 3, "explanation": "Both wrong syntax (**hsrp**) and low priority (**90**) — use **`standby 1 priority 150`**.", "misconceptionTested": "hsrp command with insufficient priority"},
    ],
    "examTip": "HSRP priority: default **100**, higher wins — syntax is **`standby <n> priority <n>`**.",
  },
  "obj-3.5-source-q018": {
    "correct": {"choiceIndex": 3, "explanation": "HSRPv2 supports up to **4,096 groups** — a major increase over HSRPv1's **256**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**255** is the HSRPv1 group-number ceiling — HSRPv2 raises the limit to **4,096**.", "misconceptionTested": "HSRPv1 max groups as HSRPv2 answer"},
      {"choiceIndex": 1, "explanation": "**256** is the HSRPv1 maximum — HSRPv2 allows **4,096** groups.", "misconceptionTested": "256 as HSRPv2 group max"},
      {"choiceIndex": 2, "explanation": "**1,024** is still below the HSRPv2 maximum — the keyed answer is **4,096**.", "misconceptionTested": "1024 as HSRPv2 group max"},
    ],
    "examTip": "HSRP group limits: **v1 = 256** (0–255) | **v2 = 4096**.",
  },
  "obj-3.5-source-q019": {
    "correct": {"choiceIndex": 2, "explanation": "MAC **0000.0c9f.fXXX** uses the HSRPv2 OUI **0000.0c9f.f** — v1 used **0000.0c07.acXX**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "HSRPv1 virtual MAC starts **0000.0c07.ac** — **0000.0c9f.f** indicates **HSRPv2**.", "misconceptionTested": "HSRPv1 MAC OUI for 0000.0c9f.f address"},
      {"choiceIndex": 1, "explanation": "GLBP uses **0007.b400** OUI — **0000.0c9f.f** is the **HSRPv2** virtual MAC prefix.", "misconceptionTested": "GLBP MAC OUI for HSRPv2 address"},
      {"choiceIndex": 3, "explanation": "VRRP virtual MAC is **0000.5e00.01XX** — **0000.0c9f.f** is Cisco **HSRPv2**.", "misconceptionTested": "VRRP MAC for HSRPv2 OUI"},
    ],
    "examTip": "FHRP MAC prefixes: **HSRPv1 0000.0c07.ac** | **HSRPv2 0000.0c9f.f** | **GLBP 0007.b400** | **VRRP 0000.5e00.01**.",
  },
  "obj-3.5-source-q020": {
    "correct": {"choiceIndex": 3, "explanation": "**Preemption** lets a higher-priority router **take over active role** when it comes online — without it, the incumbent stays active."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Per-packet load balancing is **GLBP** — preemption governs **active-router re-election**.", "misconceptionTested": "Preemption as load-balancing feature"},
      {"choiceIndex": 1, "explanation": "Watching upstream interfaces is **HSRP tracking** — preemption is about **priority-based takeover**.", "misconceptionTested": "Interface tracking as preemption definition"},
      {"choiceIndex": 2, "explanation": "HSRP elects by **priority first**, IP as tiebreaker — preemption respects priority, it does not ignore it.", "misconceptionTested": "Preemption ignores priority for IP-only election"},
    ],
    "examTip": "Enable preemption: **`standby <n> preempt`** — higher priority router can reclaim active role.",
  },
  "obj-3.5-source-q021": {
    "correct": {"choiceIndex": 1, "explanation": "Spread active load by using **one HSRP group per VLAN** and **alternating priorities above 100** so different routers are active per VLAN."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "HSRPv2 adds features but does not **load-balance** — use **multiple groups with staggered priorities**.", "misconceptionTested": "HSRPv2 alone as load-balancing method"},
      {"choiceIndex": 2, "explanation": "**PPPoE** is WAN dial/encapsulation — it does not distribute HSRP active roles.", "misconceptionTested": "PPPoE as HSRP load distribution"},
      {"choiceIndex": 3, "explanation": "Only **one router is active** per HSRP group — you cannot make all routers active in the same group.", "misconceptionTested": "All routers active in one HSRP group"},
    ],
    "examTip": "HSRP load spread trick: **per-VLAN groups** + **alternating priorities**; true LB → **GLBP**.",
  },
  "obj-3.5-source-q022": {
    "correct": {"choiceIndex": 2, "explanation": "**`show standby`** displays HSRP group state, active/standby roles, timers, and virtual IP on the router."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show hsrp`** is not valid IOS — the verification command is **`show standby`**.", "misconceptionTested": "show hsrp as valid verify command"},
      {"choiceIndex": 1, "explanation": "**`show ip standby`** is not standard syntax — use **`show standby`** for HSRP state.", "misconceptionTested": "show ip standby as HSRP verify command"},
      {"choiceIndex": 3, "explanation": "**`show ip hsrp`** is not a Cisco command — HSRP status is **`show standby`**.", "misconceptionTested": "show ip hsrp as verify command"},
    ],
    "examTip": "HSRP verify: **`show standby`** [brief | interface] — not `show hsrp`.",
  },
  "obj-6.5-source-q002": {
    "correct": {"choiceIndex": 1, "explanation": "**SNMP** exposes a structured management interface (MIB/OIDs) similar to an API for polling device data programmatically."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**CLI** is human-oriented — SNMP is the structured **machine-readable** retrieval interface.", "misconceptionTested": "CLI as API-like retrieval interface"},
      {"choiceIndex": 2, "explanation": "**Syslog** pushes log messages — it does not provide structured GET-style data retrieval like SNMP.", "misconceptionTested": "Syslog as API-like data retrieval"},
      {"choiceIndex": 3, "explanation": "**SSH** secures remote shell access — SNMP is the classic **poll/read API-like** management protocol.", "misconceptionTested": "SSH as structured retrieval API"},
    ],
    "examTip": "Legacy API-like mgmt: **SNMP GET/WALK**; modern: **REST/RESTCONF/NETCONF**.",
  },
  "obj-6.5-source-q003": {
    "correct": {"choiceIndex": 0, "explanation": "**NETCONF** (RFC 6241) is the modern XML/RPC replacement for SNMP-style configuration and state retrieval."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**Syslog** sends events — it is not an SNMP replacement for structured device management.", "misconceptionTested": "Syslog as SNMP replacement"},
      {"choiceIndex": 2, "explanation": "**REST** is an architectural style — **NETCONF** is the IETF protocol positioned to replace SNMP.", "misconceptionTested": "Generic REST as SNMP replacement protocol"},
      {"choiceIndex": 3, "explanation": "**SSH** provides secure transport — **NETCONF** is the management protocol built for automation.", "misconceptionTested": "SSH alone as SNMP replacement"},
    ],
    "examTip": "SNMP successor stack: **NETCONF** + **YANG** (+ **RESTCONF** over HTTPS).",
  },
  "obj-6.5-source-q004": {
    "correct": {"choiceIndex": 0, "explanation": "**NETCONF** uses **YANG** data models to define configuration and operational state in a structured tree."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**REST** may carry JSON/XML but **YANG** is the standard data model paired with **NETCONF/RESTCONF**.", "misconceptionTested": "REST as YANG-carrying protocol"},
      {"choiceIndex": 2, "explanation": "**SNMP** uses **MIB/OIDs**, not YANG — YANG pairs with **NETCONF**.", "misconceptionTested": "SNMP as YANG protocol"},
      {"choiceIndex": 3, "explanation": "**YAML** is a file format for playbooks — **YANG** is the modeled schema for NETCONF.", "misconceptionTested": "YAML as YANG data model protocol"},
    ],
    "examTip": "YANG = **data model language**; transported by **NETCONF** (XML) or **RESTCONF** (HTTP/JSON).",
  },
  "obj-6.5-source-q005": {
    "correct": {"choiceIndex": 1, "explanation": "**RESTCONF** uses **HTTPS** with REST verbs to configure and read YANG-modeled data on network devices."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**NETCONF** typically runs over **SSH** (XML RPC) — HTTPS REST is **RESTCONF**.", "misconceptionTested": "NETCONF as HTTPS REST protocol"},
      {"choiceIndex": 2, "explanation": "**SNMP** uses UDP 161/162 — programmatic HTTPS config is **RESTCONF**.", "misconceptionTested": "SNMP as HTTPS config protocol"},
      {"choiceIndex": 3, "explanation": "**Syslog** is UDP 514 logging — not an HTTPS configuration API.", "misconceptionTested": "Syslog as HTTPS config protocol"},
    ],
    "examTip": "HTTPS + YANG + REST verbs → **RESTCONF**; SSH + XML RPC → **NETCONF**.",
  },
  "obj-6.5-source-q006": {
    "correct": {"choiceIndex": 1, "explanation": "REST APIs operate over **HTTP/HTTPS** — resources are addressed with URLs and manipulated with HTTP verbs."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**SNMP** is UDP-based polling — REST rides on **HTTP**.", "misconceptionTested": "SNMP as REST transport"},
      {"choiceIndex": 2, "explanation": "**SNTP** is time sync — REST uses **HTTP** as its application protocol.", "misconceptionTested": "SNTP as REST protocol"},
      {"choiceIndex": 3, "explanation": "**SOAP** is a different web-service style — CCNA REST APIs use **HTTP**, not SOAP envelopes.", "misconceptionTested": "SOAP as default REST protocol"},
    ],
    "examTip": "REST on CCNA = **HTTP/HTTPS** + verbs (GET/POST/PUT/PATCH/DELETE) + status codes.",
  },
  "obj-6.6-source-q002": {
    "correct": {"choiceIndex": 0, "explanation": "**Ansible** playbooks and inventory files are written in human-readable **YAML**."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**DNA Center** is a controller platform — it is not the YAML-based config-mgmt tool in the stem.", "misconceptionTested": "DNA Center as YAML config tool"},
      {"choiceIndex": 2, "explanation": "**Chef** recipes use **Ruby** — YAML playbooks are **Ansible's** format.", "misconceptionTested": "Chef as YAML-based tool"},
      {"choiceIndex": 3, "explanation": "**Puppet** manifests use a **Puppet DSL** — **Ansible** stores config in **YAML**.", "misconceptionTested": "Puppet as YAML config store"},
    ],
    "examTip": "Config formats: **Ansible = YAML** | **Chef = Ruby recipes** | **Puppet = manifest DSL**.",
  },
  "obj-6.6-source-q003": {
    "correct": {"choiceIndex": 2, "explanation": "The **inventory** file lists managed hosts, groups, and connection variables — Ansible needs it to know **where** to connect."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "A **playbook** defines **tasks** to run — connection targets come from the **inventory**.", "misconceptionTested": "Playbook as connection definition"},
      {"choiceIndex": 1, "explanation": "**Settings** (ansible.cfg) tune defaults — host connection info lives in **inventory**.", "misconceptionTested": "Settings file as host connection list"},
      {"choiceIndex": 3, "explanation": "**Modules** perform actions — the **inventory** supplies the host list and connection params.", "misconceptionTested": "Modules as connection inventory"},
    ],
    "examTip": "Ansible flow: **inventory** (hosts) → **playbook** (tasks) → **modules** (actions).",
  },
  "obj-6.6-source-q004": {
    "correct": {"choiceIndex": 0, "explanation": "**Ansible** is **agentless** — it pushes config over SSH/NETCONF without installing a persistent agent on targets."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**Puppet** requires a **Puppet agent** on managed nodes — not agentless.", "misconceptionTested": "Puppet as agentless tool"},
      {"choiceIndex": 2, "explanation": "**Chef** uses a **Chef client agent** on each node — Ansible does not.", "misconceptionTested": "Chef as agentless tool"},
      {"choiceIndex": 3, "explanation": "**DNA Center** is a management platform — the agentless config tool here is **Ansible**.", "misconceptionTested": "DNA Center as agentless config answer"},
    ],
    "examTip": "Agentless → **Ansible**; agent-based → **Chef/Puppet** clients on nodes.",
  },
  "obj-6.6-source-q005": {
    "correct": {"choiceIndex": 0, "explanation": "A Puppet **manifest** (.pp) declares the **desired configuration** for managed hosts."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "The **agent** enforces policy — the **manifest** holds the configuration declarations.", "misconceptionTested": "Puppet agent as config container"},
      {"choiceIndex": 2, "explanation": "A **class** groups resources inside a manifest — the top-level config file type is **manifest**.", "misconceptionTested": "Class as primary Puppet config file"},
      {"choiceIndex": 3, "explanation": "A **module** bundles manifests/templates — individual host config is declared in **manifests**.", "misconceptionTested": "Module as manifest equivalent"},
    ],
    "examTip": "Puppet: **manifest** = desired state | **module** = reusable bundle | **agent** = enforcer.",
  },
  "obj-6.6-source-q006": {
    "correct": {"choiceIndex": 2, "explanation": "A Chef **recipe** is the instruction set that configures a node — recipes live inside **cookbooks**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "A **cookbook** **contains** recipes — the step-by-step instructions themselves are **recipes**.", "misconceptionTested": "Cookbook as instruction set vs container"},
      {"choiceIndex": 1, "explanation": "**Crock Pot** is a distractor — Chef uses **recipes** for node configuration steps.", "misconceptionTested": "Crock Pot as Chef component"},
      {"choiceIndex": 3, "explanation": "A **Chef node** is the managed device — configuration instructions are **recipes**.", "misconceptionTested": "Chef node as instruction container"},
    ],
    "examTip": "Chef hierarchy: **cookbook** → **recipes** → applied by **chef-client** on nodes.",
  },
  "obj-5.7-source-q003": {
    "correct": {"choiceIndex": 0, "explanation": "Mark an uplink as trusted with **`ip dhcp snooping trust`** under the **interface** — DHCP servers/offers are allowed on trusted ports."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Missing **`ip`** keyword — correct syntax is **`ip dhcp snooping trust`**.", "misconceptionTested": "dhcp snooping trust without ip keyword"},
      {"choiceIndex": 2, "explanation": "Trust is an **interface-level** command — not configured from global config with interface keyword appended.", "misconceptionTested": "Global config trust syntax"},
      {"choiceIndex": 3, "explanation": "Omitting **`snooping`** — the command is **`ip dhcp snooping trust`**, not `ip dhcp trust`.", "misconceptionTested": "ip dhcp trust without snooping"},
    ],
    "examTip": "DHCP snooping: **untrusted** access ports (clients) | **trusted** uplinks toward real DHCP servers.",
  },
  "obj-5.7-source-q005": {
    "correct": {"choiceIndex": 1, "explanation": "**Port security** limits/learns MAC addresses on an access port — blocking rogue **WAPs** plugged into the wall jack."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Dynamic VLANs** assign VLAN membership — they do not stop unauthorized devices on a fixed access port.", "misconceptionTested": "Dynamic VLAN as rogue AP prevention"},
      {"choiceIndex": 2, "explanation": "**ACLs** filter traffic — they do not prevent a new **L2 device** from connecting at the port.", "misconceptionTested": "ACL as port device restriction"},
      {"choiceIndex": 3, "explanation": "**VLAN pruning** limits trunk VLANs — it does not secure an **access port** against rogue gear.", "misconceptionTested": "VLAN pruning as access-port security"},
    ],
    "examTip": "Rogue device on access port → **port security** (MAC limit/sticky/learned).",
  },
  "obj-5.7-source-q006": {
    "correct": {"choiceIndex": 1, "explanation": "**Port security** restricts which **source MAC addresses** may use a switch port — stopping unauthorized WAPs."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**ACLs** operate at Layer 3/4 — port-level device restriction is **port security**.", "misconceptionTested": "ACL as L2 device restriction"},
      {"choiceIndex": 2, "explanation": "**WEP** is a wireless encryption standard — wired port restriction uses **port security**.", "misconceptionTested": "WEP as wired port security"},
      {"choiceIndex": 3, "explanation": "Static MAC table entries alone are manual — **port security** automates restrict/learn/violation actions.", "misconceptionTested": "Static CAM entry as port security feature"},
    ],
    "examTip": "Port security = **Layer 2**, **source MAC** limit, violation modes (protect/restrict/shutdown).",
  },
  "obj-5.7-source-q009": {
    "correct": {"choiceIndex": 0, "explanation": "Default **`switchport port-security`** allows **1 MAC address** until you raise **`switchport port-security maximum`**."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**2 MACs** is not the default — Cisco defaults to **1** secure MAC per port.", "misconceptionTested": "Two MACs as port-security default"},
      {"choiceIndex": 2, "explanation": "**0 MACs** would block all traffic — default is **1** learned/secure MAC.", "misconceptionTested": "Zero MACs as default maximum"},
      {"choiceIndex": 3, "explanation": "**10 MACs** requires explicit config — default maximum is **1**.", "misconceptionTested": "Ten MACs as port-security default"},
    ],
    "examTip": "Port-security defaults: **max 1 MAC**, violation **shutdown**, sticky off until configured.",
  },
  "obj-5.7-source-q010": {
    "correct": {"choiceIndex": 2, "explanation": "Port security operates at **Layer 2** — it inspects **source MAC addresses** on Ethernet frames."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Layer 0** is not an OSI layer used for port security — the feature is **Layer 2**.", "misconceptionTested": "Layer 0 as port security layer"},
      {"choiceIndex": 1, "explanation": "**Layer 1** is physical signaling — MAC learning/filtering is **Layer 2**.", "misconceptionTested": "Layer 1 as port security layer"},
      {"choiceIndex": 3, "explanation": "**Layer 3** uses IP addresses — port security filters **MAC addresses at L2**.", "misconceptionTested": "Layer 3 as port security layer"},
    ],
    "examTip": "Port security = **L2 MAC** control; ACLs = **L3/L4** filtering.",
  },
  "obj-2.3-source-q015": {
    "correct": {"choiceIndex": 1, "explanation": "**`show cdp interface`** lists interfaces where **CDP is enabled** and their CDP parameters."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show cdp`** displays **neighbor details** — interface CDP status uses **`show cdp interface`**.", "misconceptionTested": "show cdp as interface CDP status command"},
      {"choiceIndex": 2, "explanation": "**`show interface`** gives L1/L2 stats — CDP-specific interface info is **`show cdp interface`**.", "misconceptionTested": "Generic show interface for CDP advertising"},
      {"choiceIndex": 3, "explanation": "**`show interface cdp`** reverses the keywords — correct syntax is **`show cdp interface`**.", "misconceptionTested": "Reversed show interface cdp syntax"},
    ],
    "examTip": "CDP verify: **`show cdp neighbors`** (who) | **`show cdp interface`** (which ports run CDP).",
  },
}

assert len(HAND) == 25, len(HAND)

def fmt_entry(id_, rev):
    body = json.dumps(rev, indent=2)
    indented = "\n".join("  " + line if line else line for line in body.splitlines())
    return f"  '{id_}': {indented},"

lines = [
    "/** Gold reviews — Batch 19: FHRP 3.5 q14+, REST APIs 6.5, config mgmt 6.6, L2 security 5.7, CDP 2.3. */",
    "export const BATCH19_GOLD = {",
]
for id_, rev in HAND.items():
    lines.append(fmt_entry(id_, rev))
lines.append("}")
lines.append("")

out = ROOT / "src/answerReview/goldAnswerReviewsBatch19.js"
out.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {len(HAND)} entries to {out.relative_to(ROOT)}")
