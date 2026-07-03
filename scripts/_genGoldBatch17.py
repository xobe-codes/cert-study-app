#!/usr/bin/env python3
"""Gold batch 17 — HSRP 3.5, ACL 5.5, port security 5.6, QoS 4.7, VPN 5.10, automation 6.1, SDN 6.3, EtherChannel 2.4, DHCP 4.3, OSPF 3.4. Run: python3 scripts/_genGoldBatch17.py"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HAND = {
  "obj-3.5-source-q004": {
    "correct": {"choiceIndex": 2, "explanation": "In HSRP v1 virtual MAC **0000.0c07.ac01**, the last byte **01** is the group number in hex (group 1)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**0000.0c** is the Cisco HSRP OUI — not the group number field at the end of the MAC.", "misconceptionTested": "OUI prefix as HSRP group number"},
      {"choiceIndex": 1, "explanation": "**0c07** spans OUI and HSRP ID bytes — the group is the final octet **01**.", "misconceptionTested": "Mid-MAC bytes as group number"},
      {"choiceIndex": 3, "explanation": "**07.ac** is the well-known HSRP ID field — group number is the trailing byte **01**.", "misconceptionTested": "HSRP ID field as group number"},
    ],
    "examTip": "HSRP v1 MAC **0000.0c07.acXX** — **XX** (last byte) = group number in hex.",
  },
  "obj-3.5-source-q008": {
    "correct": {"choiceIndex": 1, "explanation": "HSRP elects **one active router** per group — the standby takes over only if the active fails or priority/preemption dictates."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Only **one** router is active at a time — all routers being active describes GLBP load-sharing, not HSRP.", "misconceptionTested": "All HSRP routers active simultaneously"},
      {"choiceIndex": 2, "explanation": "Hello packets are sent by **HSRP group members** (active/standby), not by the abstract virtual router entity.", "misconceptionTested": "Virtual router as hello sender"},
      {"choiceIndex": 3, "explanation": "HSRP provides **one active gateway** — per-packet load balancing is **GLBP**, not HSRP.", "misconceptionTested": "HSRP as load-balancing FHRP"},
    ],
    "examTip": "HSRP = **one active** + standby; GLBP = load balancing across AVFs.",
  },
  "obj-3.5-source-q011": {
    "correct": {"choiceIndex": 2, "explanation": "The standby promotes when **hold timer** expires — meaning hellos from the active were missed for the hold interval."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Hello timer governs how often hellos are sent — **hold timer** expiry triggers failover.", "misconceptionTested": "Hello timer as failover trigger"},
      {"choiceIndex": 1, "explanation": "There is no separate **standby timer** — HSRP uses hello and **hold** timers.", "misconceptionTested": "Invented standby timer name"},
      {"choiceIndex": 3, "explanation": "**Virtual timer** is not an HSRP timer — failover follows **hold timer** expiration.", "misconceptionTested": "Virtual timer as HSRP failover trigger"},
    ],
    "examTip": "HSRP timers: **hello** sends, **hold** expires → standby becomes active.",
  },
  "obj-5.6-source-q003": {
    "correct": {"choiceIndex": 2, "explanation": "Extended ACLs use numbered range **100–199** — they match source/destination, protocol, and ports."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**1–99** is the standard ACL range (source IP only) — extended lists start at **100**.", "misconceptionTested": "Standard range for extended ACL"},
      {"choiceIndex": 1, "explanation": "ACL ranges are not **1–100** — extended ACLs are **100–199**.", "misconceptionTested": "Off-by-one extended ACL range"},
      {"choiceIndex": 3, "explanation": "**100–200** is wrong — the extended numbered range ends at **199**.", "misconceptionTested": "Extended range ending at 200"},
    ],
    "examTip": "Numbered ACLs: **1–99/1300–1999** standard; **100–199/2000–2699** extended.",
  },
  "obj-5.6-source-q012": {
    "correct": {"choiceIndex": 1, "explanation": "**Extended ACLs** filter by protocol and port — required to block or permit a specific **application** like HTTP or SSH."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Standard ACLs match **source IP only** — they cannot filter by TCP/UDP port or application.", "misconceptionTested": "Standard ACL for port/application filter"},
      {"choiceIndex": 2, "explanation": "Dynamic ACLs use reflexive/temporary permits after auth — the stem asks for **application** filtering, which is extended.", "misconceptionTested": "Dynamic ACL for static app filter"},
      {"choiceIndex": 3, "explanation": "**Expanded** is not an IOS ACL type — use **extended** ACLs for protocol/port matching.", "misconceptionTested": "Expanded as ACL type for applications"},
    ],
    "examTip": "Filter by **port/protocol** → **extended** ACL; source IP only → **standard**.",
  },
  "obj-5.6-source-q024": {
    "correct": {"choiceIndex": 3, "explanation": "Apply an ACL to filter **inbound** traffic with **`ip access-group 198 in`** under the interface."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "`ip access-list 198 in` is invalid global syntax — ACLs attach with **`ip access-group`** on the interface.", "misconceptionTested": "Global ip access-list for interface filter"},
      {"choiceIndex": 1, "explanation": "`ip access-list 198 in` creates/edits the ACL — it does not **apply** it to the interface.", "misconceptionTested": "ACL definition command as apply command"},
      {"choiceIndex": 2, "explanation": "`ip access-class` restricts **VTY/management** logins — not data-plane filtering on a routed interface.", "misconceptionTested": "access-class for interface data filtering"},
    ],
    "examTip": "Filter traffic on an interface → **`ip access-group <num> in|out`** under `config-if`.",
  },
  "obj-5.7-source-q008": {
    "correct": {"choiceIndex": 2, "explanation": "Enable port security on an **access interface** with **`switchport port-security`** in interface configuration mode."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Port security is an **interface** feature — `switchport port-security` under global config is invalid.", "misconceptionTested": "Global config for port security enable"},
      {"choiceIndex": 1, "explanation": "`port-security enable` is not valid IOS syntax — use **`switchport port-security`** on the interface.", "misconceptionTested": "Invented port-security enable command"},
      {"choiceIndex": 3, "explanation": "The command namespace is **`switchport port-security`**, not standalone `port-security enable`.", "misconceptionTested": "Wrong command prefix for port security"},
    ],
    "examTip": "Port security checklist: access mode → **`switchport port-security`** → set max/violation.",
  },
  "obj-5.7-source-q014": {
    "correct": {"choiceIndex": 1, "explanation": "Default violation mode is **shutdown** — the port enters **err-disabled** when max secure MACs are exceeded."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Administrative shutdown is manual (`shutdown`) — violation shutdown is automatic **err-disable**.", "misconceptionTested": "Admin shutdown as default violation action"},
      {"choiceIndex": 2, "explanation": "**Restrict** drops traffic and logs — it is not the factory default; default is **shutdown**.", "misconceptionTested": "Restrict as default violation mode"},
      {"choiceIndex": 3, "explanation": "Restrict-with-logging describes **restrict** mode — default violation puts port in **err-disabled**.", "misconceptionTested": "Restrict+logging as default action"},
    ],
    "examTip": "Default port-security violation = **shutdown** (err-disable); use **`errdisable recovery`** to auto-heal.",
  },
  "obj-5.7-source-q017": {
    "correct": {"choiceIndex": 3, "explanation": "**`violation restrict`** drops unauthorized traffic, **logs** the event, but keeps the port **up** (unlike shutdown)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Shutdown** err-disables the port — the stem wants logging **without** disabling the interface.", "misconceptionTested": "Shutdown when restrict mode requested"},
      {"choiceIndex": 1, "explanation": "`switchport port-security restrict` is invalid syntax — the keyword is **`violation restrict`**.", "misconceptionTested": "Missing violation keyword in restrict command"},
      {"choiceIndex": 2, "explanation": "**Protect** silently drops traffic with **no log** — restrict adds logging while staying up.", "misconceptionTested": "Protect mode when logging required"},
    ],
    "examTip": "Port-security violations: **shutdown** (err-disable) | **restrict** (drop+log) | **protect** (drop, no log).",
  },
  "obj-4.7-source-q005": {
    "correct": {"choiceIndex": 1, "explanation": "**EF (46)** is Expedited Forwarding — the highest-priority DSCP class for real-time traffic like VoIP."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**AF43** is Assured Forwarding class 4, drop probability 3 — lower priority than **EF**.", "misconceptionTested": "High AF class beats EF"},
      {"choiceIndex": 2, "explanation": "**AF11** is low Assured Forwarding — far below **EF (46)** in priority.", "misconceptionTested": "Low AF as highest priority"},
      {"choiceIndex": 3, "explanation": "**AF00 (CS0)** is best-effort default marking — **EF** is the premium queue class.", "misconceptionTested": "Best-effort DSCP as highest priority"},
    ],
    "examTip": "Voice/real-time marking → **EF (46)**; bulk data → AF classes; default → **0/BE**.",
  },
  "obj-4.7-source-q007": {
    "correct": {"choiceIndex": 1, "explanation": "**LLQ (Low Latency Queuing)** gives a strict-priority queue that always drains before other CBWFQ classes."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**CBWFQ** provides weighted fair queues — LLQ adds a **strict priority** queue on top.", "misconceptionTested": "CBWFQ as strict priority scheduler"},
      {"choiceIndex": 2, "explanation": "**FIFO** has no priority classes — LLQ explicitly prioritizes delay-sensitive traffic.", "misconceptionTested": "FIFO as priority queuing"},
      {"choiceIndex": 3, "explanation": "**CIR** is a contracted rate metric — not a queuing scheduler with priority.", "misconceptionTested": "CIR as QoS queue type"},
    ],
    "examTip": "Strict priority for VoIP → **LLQ**; weighted sharing among classes → **CBWFQ**.",
  },
  "obj-5.5-source-q003": {
    "correct": {"choiceIndex": 2, "explanation": "GRE encapsulation uses IP protocol number **47** in the outer IP header."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Protocol **4** is IP-in-IP — GRE uses protocol **47**.", "misconceptionTested": "IP-in-IP protocol for GRE"},
      {"choiceIndex": 1, "explanation": "Protocol **43** is IPv6 routing header — GRE tunneling is **47**.", "misconceptionTested": "IPv6 routing header protocol for GRE"},
      {"choiceIndex": 3, "explanation": "Protocol **57** is SKIP — GRE's well-known number is **47**.", "misconceptionTested": "Protocol 57 as GRE"},
    ],
    "examTip": "GRE = IP proto **47**; ESP = **50**; AH = **51** — don't swap tunnel vs IPsec numbers.",
  },
  "obj-5.5-source-q010": {
    "correct": {"choiceIndex": 1, "explanation": "**NHRP (Next Hop Resolution Protocol)** registers spokes and resolves NBMA next hops for **DMVPN** tunnels."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**HSRP** is first-hop redundancy — DMVPN hub-spoke resolution uses **NHRP**.", "misconceptionTested": "HSRP for DMVPN resolution"},
      {"choiceIndex": 2, "explanation": "**ARP** resolves Layer 2 MACs on broadcast segments — NHRP maps tunnel endpoints over NBMA.", "misconceptionTested": "ARP for DMVPN next-hop resolution"},
      {"choiceIndex": 3, "explanation": "**GRE** encapsulates packets — **NHRP** resolves and registers DMVPN tunnel endpoints.", "misconceptionTested": "GRE as DMVPN resolution protocol"},
    ],
    "examTip": "DMVPN stack → **mGRE + IPsec + NHRP**; NHRP = hub/spoke registration and resolution.",
  },
  "obj-5.5-source-q016": {
    "correct": {"choiceIndex": 1, "explanation": "**ESP (Encapsulating Security Payload)** encrypts IPsec data packets — AH provides integrity without encryption."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**AH** authenticates headers but does not encrypt payload — encryption is **ESP**.", "misconceptionTested": "AH as IPsec encryption protocol"},
      {"choiceIndex": 2, "explanation": "**IKE** negotiates IPsec SAs — it does not encrypt user data packets (**ESP** does).", "misconceptionTested": "IKE as data encryption protocol"},
      {"choiceIndex": 3, "explanation": "**ISAKMP** is the key-exchange framework — packet encryption uses **ESP**.", "misconceptionTested": "ISAKMP as encryption protocol"},
    ],
    "examTip": "IPsec encryption → **ESP**; integrity-only → **AH**; key negotiation → **IKE/ISAKMP**.",
  },
  "obj-6.1-source-q004": {
    "correct": {"choiceIndex": 1, "explanation": "**DevOps** blends development and operations practices — the framework CCNA ties to **network automation** and CI/CD for infrastructure."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**NetOps** focuses on network operations tooling — the exam's automation culture term is **DevOps**.", "misconceptionTested": "NetOps as automation framework name"},
      {"choiceIndex": 2, "explanation": "**SysOps** is general systems administration — network automation aligns with **DevOps** practices.", "misconceptionTested": "SysOps as network automation framework"},
      {"choiceIndex": 3, "explanation": "**SecOps** is security operations — automation methodology in CCNA context is **DevOps**.", "misconceptionTested": "SecOps as automation framework"},
    ],
    "examTip": "Network automation culture → **DevOps** (Agile + automation); not NetOps/SecOps on CCNA stems.",
  },
  "obj-6.1-source-q005": {
    "correct": {"choiceIndex": 0, "explanation": "**Lean and Agile** emphasize iterative delivery — the methodology developers use alongside automation for network changes."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**Waterfall** is sequential with long release cycles — automation teams favor **Agile** iteration.", "misconceptionTested": "Waterfall for network automation"},
      {"choiceIndex": 2, "explanation": "**Kanban** is a workflow board method — CCNA pairs automation with **Lean and Agile** broadly.", "misconceptionTested": "Kanban as primary automation methodology"},
      {"choiceIndex": 3, "explanation": "**Scrum** is one Agile framework — the keyed answer is the broader **Lean and Agile** pairing.", "misconceptionTested": "Scrum alone as automation methodology"},
    ],
    "examTip": "Automation + rapid iteration → **Lean/Agile**; Waterfall = opposite of automation-friendly cadence.",
  },
  "obj-6.3-source-q004": {
    "correct": {"choiceIndex": 3, "explanation": "**Cisco ACI** is the data-center SDN fabric (APIC + spine-leaf) — distinct from campus APIC-EM or SD-WAN."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**APIC-EM** targets **enterprise campus/branch** SDN — data center SDN is **ACI**.", "misconceptionTested": "APIC-EM as data center SDN"},
      {"choiceIndex": 1, "explanation": "**OpenDaylight** is open-source controller code — Cisco DC SDN product is **ACI**.", "misconceptionTested": "OpenDaylight as Cisco DC solution"},
      {"choiceIndex": 2, "explanation": "**Cisco SD-WAN (vManage)** overlays WAN edges — data center fabric is **ACI**.", "misconceptionTested": "SD-WAN as data center SDN"},
    ],
    "examTip": "SDN map: **ACI** = DC | **APIC-EM/DNA** = campus | **vManage** = SD-WAN.",
  },
  "obj-6.3-source-q014": {
    "correct": {"choiceIndex": 1, "explanation": "The **southbound interface (SBI)** talks **down** to switches/routers — OpenFlow, NETCONF, etc."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**NBI** faces **applications** above the controller — device control uses **SBI** downward.", "misconceptionTested": "NBI for direct device communication"},
      {"choiceIndex": 2, "explanation": "The controller **core** orchestrates policy — programmatic device reach is the **SBI**.", "misconceptionTested": "Controller core as device API"},
      {"choiceIndex": 3, "explanation": "Apps on the controller use **NBI** — they do not directly push forwarding rules to devices.", "misconceptionTested": "Hosted apps as southbound path"},
    ],
    "examTip": "SDN directions: **NBI** = apps ↑ | **SBI** = devices ↓.",
  },
  "obj-2.4-source-q001": {
    "correct": {"choiceIndex": 1, "explanation": "EtherChannel with **PAgP** supports up to **8** active links in a port channel on Cisco platforms."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Two links can bundle but the **maximum** with PAgP is **8**, not 2.", "misconceptionTested": "Minimum links as maximum"},
      {"choiceIndex": 2, "explanation": "**16** exceeds the PAgP EtherChannel limit — Cisco caps at **8** member interfaces.", "misconceptionTested": "16 interfaces with PAgP"},
      {"choiceIndex": 3, "explanation": "Four links can aggregate but the exam maximum for PAgP EtherChannel is **8**.", "misconceptionTested": "4 as maximum PAgP bundle"},
    ],
    "examTip": "PAgP/LACP EtherChannel max = **8 links** (same speed/duplex, same VLAN settings).",
  },
  "obj-2.4-source-q009": {
    "correct": {"choiceIndex": 2, "explanation": "**PAgP (Port Aggregation Protocol)** is Cisco proprietary — LACP (802.3ad) is the open standard."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**LACP (802.3ad)** is IEEE open standard — Cisco proprietary negotiation is **PAgP**.", "misconceptionTested": "LACP as Cisco proprietary"},
      {"choiceIndex": 1, "explanation": "**802.1Q** is VLAN trunk tagging — link bundling negotiation is **PAgP** or LACP.", "misconceptionTested": "802.1Q as EtherChannel protocol"},
      {"choiceIndex": 3, "explanation": "**802.1ab** is LLDP neighbor discovery — not EtherChannel negotiation.", "misconceptionTested": "LLDP standard as EtherChannel protocol"},
    ],
    "examTip": "Cisco-only bundling → **PAgP** (` desirable`/`auto`); multi-vendor → **LACP** (`active`/`passive`).",
  },
  "obj-4.3-source-q007": {
    "correct": {"choiceIndex": 0, "explanation": "After receiving an Offer, the client sends **DHCPACK-bound DHCP Request**, then **ACK** confirms the lease (DORA: Discover, Offer, Request, **Acknowledgment**)."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**Discover** starts the process — confirmation of the offered address is the final **ACK**.", "misconceptionTested": "Discover as lease confirmation"},
      {"choiceIndex": 2, "explanation": "**Offer** is sent by the **server** — the client's confirm step is **ACK** after Request.", "misconceptionTested": "Offer as client confirmation message"},
      {"choiceIndex": 3, "explanation": "**Request** asks for the offered IP — the server replies with **ACK** to confirm the lease.", "misconceptionTested": "Request as final confirmation"},
    ],
    "examTip": "DORA order: **Discover → Offer → Request → Ack** — ACK is server confirmation to client.",
  },
  "obj-4.3-source-q008": {
    "correct": {"choiceIndex": 0, "explanation": "Initial **DHCPDISCOVER** is a **Layer 3 broadcast** (255.255.255.255) because the client has no IP yet."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "DHCP discover is not multicast — without an address the client must **broadcast**.", "misconceptionTested": "Multicast for initial DHCP discover"},
      {"choiceIndex": 2, "explanation": "**802.1Q** is VLAN tagging — DHCP discover uses **UDP broadcast** at Layer 3.", "misconceptionTested": "802.1Q as DHCP transport"},
      {"choiceIndex": 3, "explanation": "Unicast requires a known destination IP — pre-lease acquisition uses **broadcast**.", "misconceptionTested": "Unicast for initial DHCP discover"},
    ],
    "examTip": "No IP yet → DHCP **broadcast** discover; relay (`ip helper-address`) forwards to server.",
  },
  "obj-4.3-source-q009": {
    "correct": {"choiceIndex": 1, "explanation": "Clients begin renewal at **50% (T1)** of lease time — unicast DHCPREQUEST to the leasing server."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "One-quarter is before the standard renewal point — T1 renewal starts at **half** the lease.", "misconceptionTested": "25% as renewal timer"},
      {"choiceIndex": 2, "explanation": "**Seven-eighths (T2)** is rebinding if the original server is unreachable — first renewal is at **50%**.", "misconceptionTested": "T2 rebinding as first renewal"},
      {"choiceIndex": 3, "explanation": "Waiting until lease **expires** causes an outage — renewal at **50%** prevents lapse.", "misconceptionTested": "End-of-lease as renewal point"},
    ],
    "examTip": "DHCP lease timers: **T1 = 50%** renew to server | **T2 = 87.5%** rebind | expiry = drop.",
  },
  "obj-3.4-source-q008": {
    "correct": {"choiceIndex": 0, "explanation": "Multi-area OSPF requires a backbone — **Area 0** must exist and connect all non-backbone areas."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Area 1 is a non-backbone area — **Area 0** is mandatory for OSPF hierarchy.", "misconceptionTested": "User area as required backbone"},
      {"choiceIndex": 2, "explanation": "Area 10 is arbitrary — only **Area 0** is the required backbone.", "misconceptionTested": "High-numbered area as backbone"},
      {"choiceIndex": 3, "explanation": "Area 4 cannot replace the backbone — **Area 0** must be present.", "misconceptionTested": "Non-zero area as backbone substitute"},
    ],
    "examTip": "OSPF rule: all areas must touch **Area 0** (via ABR) — no Area 0 = broken design.",
  },
  "obj-3.4-source-q010": {
    "correct": {"choiceIndex": 1, "explanation": "OSPF routers send hellos to **224.0.0.5 (AllSPFRouters)** for neighbor discovery on broadcast segments."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**224.0.0.9** is RIP v2 — OSPF hellos use **224.0.0.5**.", "misconceptionTested": "RIP multicast for OSPF hellos"},
      {"choiceIndex": 2, "explanation": "**224.0.0.6 (AllDRouters)** is for DR/BDR communication — general discovery is **224.0.0.5**.", "misconceptionTested": "DR multicast as hello address"},
      {"choiceIndex": 3, "explanation": "**224.0.0.7** is not the OSPF hello group — use **224.0.0.5** for AllSPFRouters.", "misconceptionTested": "Wrong OSPF multicast address"},
    ],
    "examTip": "OSPF multicast: **224.0.0.5** = all SPF routers | **224.0.0.6** = DR/BDR only.",
  },
}

assert len(HAND) == 25, len(HAND)

def fmt_entry(id_, rev):
    body = json.dumps(rev, indent=2)
    indented = "\n".join("  " + line if line else line for line in body.splitlines())
    return f"  '{id_}': {indented},"

lines = [
    "/** Gold reviews — Batch 17: HSRP 3.5, ACL 5.5, port security 5.6, QoS 4.7, VPN 5.10, automation 6.1, SDN 6.3, EtherChannel 2.4, DHCP 4.3, OSPF 3.4. */",
    "export const BATCH17_GOLD = {",
]
for id_, rev in HAND.items():
    lines.append(fmt_entry(id_, rev))
lines.append("}")
lines.append("")

out = ROOT / "src/answerReview/goldAnswerReviewsBatch17.js"
out.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {len(HAND)} entries to {out.relative_to(ROOT)}")
