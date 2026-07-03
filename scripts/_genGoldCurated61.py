#!/usr/bin/env python3
"""Gold curated 61 — hand-authored reviews for remaining clean-bank curated questions. Run: python3 scripts/_genGoldCurated61.py"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HAND = {
  # === 1.10 Linux CLI ===
  "1.10-c-q7": {
    "correct": {"choiceIndex": 0, "explanation": "**`ip route`** (or **`route -n`**) displays the Linux routing table including the **default gateway**."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**`show vlan brief`** is **Cisco IOS** — not a Linux command.", "misconceptionTested": "IOS show command on Linux"},
      {"choiceIndex": 2, "explanation": "**`ifconfig`** shows interface addresses — not the full **routing table** with gateway.", "misconceptionTested": "ifconfig for routing table"},
      {"choiceIndex": 3, "explanation": "**`debug ip routing`** is IOS troubleshooting — Linux uses **`ip route`**.", "misconceptionTested": "IOS debug on Linux"},
    ],
    "examTip": "Linux routing: **`ip route`** | **`route -n`** — default gateway appears as **default via <gw>**.",
  },
  # === 1.11 WLAN fundamentals ===
  "1.11-c-q2": {
    "correct": {"choiceIndex": 1, "explanation": "**5 GHz** offers **more non-overlapping channels** and **higher throughput** but **shorter range** than 2.4 GHz."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "5 GHz has **shorter** range than 2.4 GHz — higher frequency attenuates faster through walls.", "misconceptionTested": "5 GHz longer range than 2.4"},
      {"choiceIndex": 2, "explanation": "5 GHz supports **WPA2/WPA3** — encryption is not limited to 2.4 GHz.", "misconceptionTested": "5 GHz lacks encryption"},
      {"choiceIndex": 3, "explanation": "**WEP** is deprecated on **both** bands — not a 5 GHz limitation.", "misconceptionTested": "5 GHz only supports WEP"},
    ],
    "examTip": "2.4 GHz = **range + penetration** | 5 GHz = **speed + channels** — use both in dual-band APs.",
  },
  "1.11-c-q4": {
    "correct": {"choiceIndex": 1, "explanation": "**False** — **WEP** is cryptographically broken and **never acceptable** in modern enterprise WLANs."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**True** is wrong — WEP is **deprecated**; enterprise uses **WPA2-Enterprise** or **WPA3**.", "misconceptionTested": "WEP acceptable in enterprise"},
    ],
    "examTip": "WLAN security ladder: **WEP (broken)** → **WPA2-PSK/Enterprise** → **WPA3** — never deploy WEP.",
  },
  "1.11-c-q6": {
    "correct": {"choiceIndex": 1, "explanation": "The **SSID** is the **wireless network name** clients see when scanning for networks."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "The **PSK/passphrase** is the encryption key — **SSID** is the broadcast **network name**.", "misconceptionTested": "SSID equals encryption key"},
      {"choiceIndex": 2, "explanation": "The **BSSID** is the AP's **radio MAC** — SSID is a human-readable **name**.", "misconceptionTested": "SSID is AP MAC"},
      {"choiceIndex": 3, "explanation": "SSID can map to a VLAN but is **not** the VLAN ID itself — it's the **WLAN identifier**.", "misconceptionTested": "SSID equals VLAN ID"},
    ],
    "examTip": "SSID = **network name** | BSSID = **AP MAC** | PSK = **pre-shared key**.",
  },
  "1.11-c-q7": {
    "correct": {"choiceIndex": 1, "explanation": "Wider channels (**40 MHz** vs **20 MHz**) allow **higher throughput** but consume **more spectrum** and reduce available channels."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Wider channels **increase** potential throughput — they don't reduce it.", "misconceptionTested": "Wider channel reduces throughput"},
      {"choiceIndex": 2, "explanation": "Wider channels can **increase** interference overlap — they don't eliminate interference.", "misconceptionTested": "Wide channels eliminate interference"},
      {"choiceIndex": 3, "explanation": "Channel width is independent of band — **5 GHz** still supports 40/80 MHz widths.", "misconceptionTested": "40 MHz disables 5 GHz"},
    ],
    "examTip": "Channel width trade-off: **20 MHz** = more channels, less overlap | **40/80 MHz** = more speed, fewer channels.",
  },
  "1.11-c-q8": {
    "correct": {"choiceIndex": 1, "explanation": "**RSSI** (Received Signal Strength Indicator) measures **received signal strength** at the client or AP."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Routing table size is unrelated — RSSI is a **wireless signal** metric.", "misconceptionTested": "RSSI as routing metric"},
      {"choiceIndex": 2, "explanation": "**DNS latency** measures name resolution — RSSI is **RF signal level**.", "misconceptionTested": "RSSI as DNS latency"},
      {"choiceIndex": 3, "explanation": "**NAT port count** tracks translations — RSSI is **dBm signal strength**.", "misconceptionTested": "RSSI as NAT metric"},
    ],
    "examTip": "RSSI in **dBm**: closer to **0** = stronger | **-70 dBm** usable | **-80 dBm** weak.",
  },
  # === 1.12 Virtualization / NFV ===
  "1.12-c-q3": {
    "correct": {"choiceIndex": 1, "explanation": "Containers **share the host OS kernel** — VMs each run a **full guest OS**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Full guest OS per instance** describes **VMs**, not lightweight containers.", "misconceptionTested": "Containers include full guest OS"},
      {"choiceIndex": 2, "explanation": "Containers run extensively on **Linux** (Docker, containerd) — they don't require VMs.", "misconceptionTested": "Containers cannot run on Linux"},
      {"choiceIndex": 3, "explanation": "Containers virtualize **workloads** — they don't replace **physical switches**.", "misconceptionTested": "Containers replace switches"},
    ],
    "examTip": "VM = **hypervisor + guest OS** | Container = **shared kernel + isolated processes**.",
  },
  "1.12-c-q5": {
    "correct": {"choiceIndex": 1, "explanation": "**NFV** runs network functions (firewall, router, load balancer) as **software on commodity hardware** instead of dedicated appliances."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "NFV virtualizes **network services** — it doesn't replace DNS with VLANs.", "misconceptionTested": "NFV replaces DNS with VLANs"},
      {"choiceIndex": 2, "explanation": "NFV **complements** physical routing — it doesn't eliminate all routers.", "misconceptionTested": "NFV eliminates all routers"},
      {"choiceIndex": 3, "explanation": "WEP is WLAN security — unrelated to **Network Function Virtualization**.", "misconceptionTested": "NFV uses WEP"},
    ],
    "examTip": "NFV = **virtual firewall/router/LB** on x86 | SDN = **centralized control plane** — often deployed together.",
  },
  "1.12-c-q6": {
    "correct": {"choiceIndex": 1, "explanation": "Each **VM** includes its **own guest OS** and **virtual NICs** — fully isolated from other VMs."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "A **container image** is lightweight — VMs bundle a **full operating system**.", "misconceptionTested": "VM is only a container image"},
      {"choiceIndex": 2, "explanation": "**Shared kernel** describes **containers** — each VM has its **own kernel** (guest OS).", "misconceptionTested": "VMs share kernel"},
      {"choiceIndex": 3, "explanation": "VMs always have at least one **vNIC** for network connectivity.", "misconceptionTested": "VM has no network interface"},
    ],
    "examTip": "Type 1 hypervisor (ESXi) vs Type 2 (Workstation) — both host VMs with **guest OS + vNIC**.",
  },
  "1.12-c-q7": {
    "correct": {"choiceIndex": 1, "explanation": "**False** — **VRF** isolates **routing tables** (Layer 3); **VLAN** isolates **broadcast domains** (Layer 2)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**True** is wrong — VRF and VLAN solve **different layers** of isolation.", "misconceptionTested": "VRF and VLAN same isolation type"},
    ],
    "examTip": "VLAN = **L2 broadcast domain** | VRF = **L3 routing instance** — complementary, not interchangeable.",
  },
  "1.12-c-q8": {
    "correct": {"choiceIndex": 1, "explanation": "**Docker** is the leading platform for **container packaging and deployment**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Type 1 hypervisors** (ESXi, Hyper-V) run **VMs** — Docker runs **containers**.", "misconceptionTested": "Docker is a Type 1 hypervisor"},
      {"choiceIndex": 2, "explanation": "**WPA3** is wireless security — Docker is **container orchestration**.", "misconceptionTested": "Docker related to WPA3"},
      {"choiceIndex": 3, "explanation": "**Spanning Tree** prevents L2 loops — Docker is **application containerization**.", "misconceptionTested": "Docker related to STP"},
    ],
    "examTip": "Docker/Kubernetes = **containers** | VMware/Hyper-V = **VMs** — different virtualization models.",
  },
  # === 1.2 Network architectures ===
  "1.2-c-q6": {
    "correct": {"choiceIndex": 1, "explanation": "A single wireless router providing **NAT, DHCP, and Wi‑Fi** is classic **SOHO** (small office/home office)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Core datacenter** uses redundant spine-leaf, not a single consumer router.", "misconceptionTested": "SOHO as core datacenter"},
      {"choiceIndex": 2, "explanation": "**Full mesh WAN** connects every site to every other site — not a home router.", "misconceptionTested": "SOHO as full mesh WAN"},
      {"choiceIndex": 3, "explanation": "**Spine-leaf fabric** is datacenter switching — SOHO is one integrated gateway.", "misconceptionTested": "SOHO as spine fabric"},
    ],
    "examTip": "SOHO = **all-in-one gateway** (NAT + DHCP + Wi‑Fi) | Enterprise = **layered, redundant** design.",
  },
  "1.2-c-q7": {
    "correct": {"choiceIndex": 2, "explanation": "**IaaS** — customer manages the **OS and apps**; provider supplies **compute, storage, and network** hardware."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**SaaS** — provider manages **everything** including the application (e.g., Office 365).", "misconceptionTested": "SaaS customer manages OS"},
      {"choiceIndex": 1, "explanation": "**PaaS** — provider manages **OS/runtime**; customer deploys **code** only.", "misconceptionTested": "PaaS customer manages OS"},
      {"choiceIndex": 3, "explanation": "**On-prem** means customer owns **all** hardware — not a cloud model.", "misconceptionTested": "On-prem as cloud model"},
    ],
    "examTip": "Cloud stack: **IaaS** (you manage OS) → **PaaS** (you manage code) → **SaaS** (you use app).",
  },
  "1.2-c-q8": {
    "correct": {"choiceIndex": 0, "explanation": "**True** — in **spine-leaf**, every **leaf** connects to **every spine** for equal-cost paths."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**False** is wrong — full mesh between leaf and spine is the **defining** spine-leaf trait.", "misconceptionTested": "Spine-leaf partial connectivity"},
    ],
    "examTip": "Spine-leaf: **leaves** = access/aggregation | **spines** = core — every leaf ↔ every spine.",
  },
  # === 1.3 Cabling / SFP ===
  "1.3-c-q3": {
    "correct": {"choiceIndex": 1, "explanation": "**Single-mode** (yellow jacket) uses a **narrow core** for **long-distance** WAN links (km range)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Multimode** (orange/aqua) is for **shorter** campus runs — not long-haul WAN.", "misconceptionTested": "Multimode for long WAN"},
      {"choiceIndex": 2, "explanation": "**Cat5 copper** is twisted-pair Ethernet — not fiber for long-distance WAN.", "misconceptionTested": "Copper for long WAN fiber"},
      {"choiceIndex": 3, "explanation": "**Coax** is legacy broadband/cable — WAN fiber uses **single-mode**.", "misconceptionTested": "Coax for long WAN"},
    ],
    "examTip": "Fiber: **multimode** (orange, short) | **single-mode** (yellow, long) — match transceiver to cable.",
  },
  "1.3-c-q4": {
    "correct": {"choiceIndex": 1, "explanation": "**LC** (Lucent Connector) is the **dominant SFP/SFP+** fiber connector — small form factor."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**RJ-45** is copper Ethernet — SFP modules use **fiber connectors** like LC.", "misconceptionTested": "RJ-45 on SFP"},
      {"choiceIndex": 2, "explanation": "**DB-9** is a serial/console connector — not SFP media.", "misconceptionTested": "DB-9 on SFP"},
      {"choiceIndex": 3, "explanation": "**USB-C** is not used on standard Cisco SFP modules.", "misconceptionTested": "USB-C on SFP"},
    ],
    "examTip": "SFP connectors: **LC** (most common) | **SC** (older) — always verify module + cable pairing.",
  },
  "1.3-c-q7": {
    "correct": {"choiceIndex": 1, "explanation": "**SFP** modules provide **hot-swappable, flexible media** — swap fiber/copper without replacing the switch port."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "SFP affects **port media** — it doesn't change **CPU speed**.", "misconceptionTested": "SFP increases CPU speed"},
      {"choiceIndex": 2, "explanation": "SFP is a **physical layer** module — it doesn't replace **Spanning Tree**.", "misconceptionTested": "SFP replaces STP"},
      {"choiceIndex": 3, "explanation": "SFP carries **Layer 1/2** signals — encryption is a **higher-layer** function.", "misconceptionTested": "SFP encrypts traffic"},
    ],
    "examTip": "SFP/SFP+ = **pluggable optics** — change distance/speed by swapping the module, not the port.",
  },
  "1.3-c-q8": {
    "correct": {"choiceIndex": 0, "explanation": "**True** — **multimode** fiber is commonly **orange** (OM1/OM2) or **aqua** (OM3/OM4) jacketed."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**False** is wrong — color coding helps identify **multimode** vs **single-mode** (yellow).", "misconceptionTested": "Multimode not color-coded"},
    ],
    "examTip": "Fiber colors: **orange/aqua** = multimode | **yellow** = single-mode — verify before connecting.",
  },
  # === 1.4 Duplex / errors ===
  "1.4-c-q3": {
    "correct": {"choiceIndex": 1, "explanation": "**Duplex mismatch** (switch forced **full**, PC **half**) causes **late collisions, CRC errors**, and **slow performance**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Duplex mismatch usually still has **link up** — performance degrades rather than total loss.", "misconceptionTested": "Duplex mismatch kills link entirely"},
      {"choiceIndex": 2, "explanation": "Mismatch **halves** effective throughput — it doesn't double speed.", "misconceptionTested": "Duplex mismatch doubles speed"},
      {"choiceIndex": 3, "explanation": "**STP blocking** is a spanning-tree state — unrelated to duplex negotiation.", "misconceptionTested": "Duplex mismatch causes STP blocking"},
    ],
    "examTip": "Duplex mismatch symptom: **CRC + late collisions** on one link — fix: **auto-auto** or **match both sides**.",
  },
  "1.4-c-q4": {
    "correct": {"choiceIndex": 1, "explanation": "On **full-duplex** access ports, **collisions** indicate **duplex mismatch** or **misconfiguration** — collisions should be near zero."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Full-duplex eliminates **collision domain** issues — sustained collisions are **abnormal**.", "misconceptionTested": "Collisions normal on full-duplex"},
      {"choiceIndex": 2, "explanation": "**OSPF adjacency** is Layer 3 — collisions are **Layer 1/2** physical.", "misconceptionTested": "OSPF causes collisions"},
      {"choiceIndex": 3, "explanation": "**DHCP renewal** is Layer 3 addressing — not a collision cause.", "misconceptionTested": "DHCP renewal causes collisions"},
    ],
    "examTip": "Full-duplex = **no collisions expected** — if counters climb, check **speed/duplex** on both ends.",
  },
  "1.4-c-q5": {
    "correct": {"choiceIndex": 1, "explanation": "First step for **CRC errors**: **check/replace cable** and **verify speed/duplex** match on both ends."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Reload** is a last resort — physical layer issues need **cable/duplex** checks first.", "misconceptionTested": "Reload first for CRC errors"},
      {"choiceIndex": 2, "explanation": "**VLAN** misconfig causes connectivity issues — CRC errors point to **physical layer**.", "misconceptionTested": "Change VLAN for CRC errors"},
      {"choiceIndex": 3, "explanation": "**OSPF** is routing — CRC is a **Layer 1/2** integrity error.", "misconceptionTested": "Enable OSPF for CRC errors"},
    ],
    "examTip": "CRC troubleshooting order: **cable** → **duplex** → **SFP/optics** → **replace hardware**.",
  },
  "1.4-c-q6": {
    "correct": {"choiceIndex": 1, "explanation": "**Runt frames** are **undersized** — below the **64-byte minimum** Ethernet frame size."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Oversized** frames are **giants** — runts are **too small**.", "misconceptionTested": "Runts are oversized"},
      {"choiceIndex": 2, "explanation": "Runts are a **size** issue — not limited to **broadcast** frames.", "misconceptionTested": "Runts are broadcast only"},
      {"choiceIndex": 3, "explanation": "Encryption doesn't change **frame size classification** — runts are below minimum length.", "misconceptionTested": "Runts are encrypted frames"},
    ],
    "examTip": "Ethernet size: **runt** (<64 B) | **normal** (64–1518 B) | **giant** (>MTU) — often cable/duplex related.",
  },
  "1.4-c-q7": {
    "correct": {"choiceIndex": 0, "explanation": "**True** — an interface can show **up/up** while still accumulating **CRC errors** from a bad cable or EMI."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**False** is wrong — link status and **error counters** are independent metrics.", "misconceptionTested": "up/up means no CRC errors"},
    ],
    "examTip": "Always check **`show interfaces`** error counters — **up/up** doesn't mean **clean**.",
  },
  "1.4-c-q8": {
    "correct": {"choiceIndex": 1, "explanation": "Cable parallel to **power lines** causes **EMI** (electromagnetic interference) on **copper**, producing CRC errors."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Wrong subnet** causes IP reachability failure — not **physical CRC** errors.", "misconceptionTested": "Subnet mismatch causes CRC"},
      {"choiceIndex": 2, "explanation": "**Missing default route** is Layer 3 — CRC is **Layer 1/2 physical**.", "misconceptionTested": "Default route missing causes CRC"},
      {"choiceIndex": 3, "explanation": "**WPA3** is wireless security — CRC on copper is **cabling/EMI**.", "misconceptionTested": "WPA3 misconfig causes CRC"},
    ],
    "examTip": "Copper best practice: run **away from power lines** and **fluorescent ballasts** — use **shielded** cable if unavoidable.",
  },
  # === 2.1 VLANs ===
  "2.1-c-q4": {
    "correct": {"choiceIndex": 1, "explanation": "**`show vlan brief`** lists **VLAN IDs** and their **port assignments**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show interfaces trunk`** shows **trunk ports and allowed VLANs** — not access port assignments.", "misconceptionTested": "trunk command for access VLAN map"},
      {"choiceIndex": 2, "explanation": "**`show ip route`** is Layer 3 routing — VLAN assignment is Layer 2.", "misconceptionTested": "ip route for VLAN ports"},
      {"choiceIndex": 3, "explanation": "**`show mac address-table`** maps **MACs to ports** — not VLAN membership.", "misconceptionTested": "MAC table for VLAN assignment"},
    ],
    "examTip": "VLAN verify: **`show vlan brief`** (access) | **`show interfaces trunk`** (trunks).",
  },
  "2.1-c-q5": {
    "correct": {"choiceIndex": 1, "explanation": "**VLAN 1** is the **default VLAN** and the **default native VLAN** on trunks."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Any VLAN can be **routed** via an SVI — VLAN 1 isn't uniquely routable.", "misconceptionTested": "VLAN 1 only routable VLAN"},
      {"choiceIndex": 2, "explanation": "VLAN 1 **carries traffic** by default — it's not disabled.", "misconceptionTested": "VLAN 1 cannot carry traffic"},
      {"choiceIndex": 3, "explanation": "The **voice VLAN** is a separate concept — VLAN 1 is the **default data VLAN**.", "misconceptionTested": "VLAN 1 is voice VLAN"},
    ],
    "examTip": "Security: change **native VLAN** off VLAN 1 on trunks — **`switchport trunk native vlan <id>`** both ends.",
  },
  "2.1-c-q7": {
    "correct": {"choiceIndex": 0, "explanation": "**True** — same VLAN on two switches communicates at **Layer 2** when a **trunk** carries that VLAN."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**False** is wrong — 802.1Q trunks extend VLANs across switches.", "misconceptionTested": "VLANs cannot span switches"},
    ],
    "examTip": "Inter-switch same VLAN = **trunk** with VLAN allowed | Inter-VLAN = **router or L3 switch SVI**.",
  },
  "2.1-c-q8": {
    "correct": {"choiceIndex": 0, "explanation": "**`vlan 30`** in **global config** creates VLAN 30 in the VLAN database."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**`switchport access vlan 30`** **assigns** a port — it doesn't **create** the VLAN (though it may auto-create on some platforms).", "misconceptionTested": "access vlan creates VLAN globally"},
      {"choiceIndex": 2, "explanation": "**`create vlan 30`** is not valid IOS syntax.", "misconceptionTested": "create vlan command"},
      {"choiceIndex": 3, "explanation": "**`ip vlan 30`** is invalid — VLANs are Layer 2, not IP commands.", "misconceptionTested": "ip vlan command"},
    ],
    "examTip": "VLAN workflow: **`vlan 30`** → **`name SALES`** → **`interface fa0/1`** → **`switchport access vlan 30`**.",
  },
  # === 2.2 Trunking ===
  "2.2-c-q2": {
    "correct": {"choiceIndex": 1, "explanation": "The **802.1Q tag** is **4 bytes** inserted into the Ethernet frame."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**2 bytes** is too small — 802.1Q adds **4 bytes** (TPID + PCP/DEI + VLAN ID).", "misconceptionTested": "802.1Q tag is 2 bytes"},
      {"choiceIndex": 2, "explanation": "**8 bytes** describes something else — 802.1Q is exactly **4 bytes**.", "misconceptionTested": "802.1Q tag is 8 bytes"},
      {"choiceIndex": 3, "explanation": "**12 bytes** is not the 802.1Q tag size — it's **4 bytes**.", "misconceptionTested": "802.1Q tag is 12 bytes"},
    ],
    "examTip": "802.1Q frame: **DA + SA + 4-byte tag + Type/Len + Data + FCS** — native VLAN frames are **untagged**.",
  },
  "2.2-c-q8": {
    "correct": {"choiceIndex": 1, "explanation": "**`switchport trunk allowed vlan 10,20`** restricts the trunk to **only VLANs 10 and 20**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`switchport access vlan`** sets an **access** port — not trunk allowed list.", "misconceptionTested": "access vlan on trunk limit"},
      {"choiceIndex": 2, "explanation": "**`vlan 10,20`** creates VLANs — doesn't filter a **trunk allowed list**.", "misconceptionTested": "vlan command limits trunk"},
      {"choiceIndex": 3, "explanation": "**`switchport trunk native vlan 10`** sets the **untagged VLAN** — not the allowed list.", "misconceptionTested": "native vlan limits allowed VLANs"},
    ],
    "examTip": "Trunk pruning: **`switchport trunk allowed vlan add 30`** — verify with **`show interfaces trunk`**.",
  },
  # === 2.5 STP ===
  "2.5-c-q8": {
    "correct": {"choiceIndex": 0, "explanation": "**`spanning-tree vlan 1 root primary`** lowers bridge priority to make this switch the **root for VLAN 1**."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**`spanning-tree portfast`** speeds **access port** transition — doesn't affect **root election**.", "misconceptionTested": "portfast makes switch root"},
      {"choiceIndex": 2, "explanation": "**`spanning-tree bpduguard enable`** protects access ports — not root bridge selection.", "misconceptionTested": "bpduguard for root election"},
      {"choiceIndex": 3, "explanation": "**`switchport mode trunk`** configures trunking — not STP root priority.", "misconceptionTested": "trunk mode for root bridge"},
    ],
    "examTip": "Root bridge: lowest **bridge priority** wins — **`spanning-tree vlan X root primary`** sets 24576.",
  },
  # === 3.1 Routing table basics ===
  "3.1-q7": {
    "correct": {"choiceIndex": 1, "explanation": "A **static route** has default **administrative distance 1** — more trusted than dynamic protocols."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**AD 0** is reserved for **connected** routes — static is **1**.", "misconceptionTested": "Static AD is 0"},
      {"choiceIndex": 2, "explanation": "**90** is **EIGRP** administrative distance — static is **1**.", "misconceptionTested": "Static AD is 90"},
      {"choiceIndex": 3, "explanation": "**110** is **OSPF** — static routes default to **AD 1**.", "misconceptionTested": "Static AD is 110"},
    ],
    "examTip": "AD recall: **connected 0** | **static 1** | **EIGRP 90** | **OSPF 110** | **RIP 120**.",
  },
  "3.1-q8": {
    "correct": {"choiceIndex": 1, "explanation": "**307200** is the **EIGRP composite metric** — **[AD/metric]** format in the routing table."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**90** (in brackets) is the **administrative distance** — **307200** is the **metric**.", "misconceptionTested": "Metric value is AD"},
      {"choiceIndex": 2, "explanation": "**OSPF cost** appears on **O** routes — this is an **D** (EIGRP) entry.", "misconceptionTested": "EIGRP metric as OSPF cost"},
      {"choiceIndex": 3, "explanation": "**Hop count** is RIP's metric — EIGRP uses a **composite** (bandwidth + delay).", "misconceptionTested": "EIGRP metric as hop count"},
    ],
    "examTip": "Route format: **`D net [90/307200]`** — bracket = **[AD/metric]**.",
  },
  "3.1-q9": {
    "correct": {"choiceIndex": 0, "explanation": "**Gateway of last resort** means a **default route** (**0.0.0.0/0**) is installed."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "A default route means the router **can** forward unknown destinations — not that it reaches nothing.", "misconceptionTested": "Default route means unreachable"},
      {"choiceIndex": 2, "explanation": "**DHCP server** role is unrelated to **gateway of last resort**.", "misconceptionTested": "Default route means DHCP server"},
      {"choiceIndex": 3, "explanation": "**OSPF DR** election is neighbor-related — not default routing.", "misconceptionTested": "Default route means OSPF DR"},
    ],
    "examTip": "Default route: **`S* 0.0.0.0/0`** or **`O*E2 0.0.0.0/0`** — asterisk marks **candidate default**.",
  },
  "3.1-q10": {
    "correct": {"choiceIndex": 1, "explanation": "The **asterisk (*)** marks the **best match** route or a **candidate default** route."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Unreachable routes don't appear as active entries — * means **preferred/default candidate**.", "misconceptionTested": "Asterisk means unreachable"},
      {"choiceIndex": 2, "explanation": "Route age is shown in the **time column** — not by the asterisk.", "misconceptionTested": "Asterisk means old route"},
      {"choiceIndex": 3, "explanation": "All installed routes are **active** — * indicates **default/best** status.", "misconceptionTested": "Asterisk means manual activation needed"},
    ],
    "examTip": "**`*`** next to static default = **gateway of last resort is using this route**.",
  },
  # === 3.2 Administrative distance ===
  "3.2-c-q3": {
    "correct": {"choiceIndex": 1, "explanation": "The **static route (AD 1)** wins over **OSPF (AD 110)** — lower AD is preferred for the same prefix."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "OSPF has a **higher AD (110)** — it loses to static **regardless of metric**.", "misconceptionTested": "OSPF wins static on metric"},
      {"choiceIndex": 2, "explanation": "Only **one** best route per prefix is installed — not both.", "misconceptionTested": "Both routes installed"},
      {"choiceIndex": 3, "explanation": "AD breaks the tie **before** metric comparison across protocols.", "misconceptionTested": "Metric tiebreak across protocols"},
    ],
    "examTip": "Route selection: **longest prefix** → **lowest AD** → **lowest metric** (same protocol only).",
  },
  "3.2-c-q4": {
    "correct": {"choiceIndex": 0, "explanation": "**Connected routes** have administrative distance **0** — most trusted."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**AD 1** is **static** routes — connected is **0**.", "misconceptionTested": "Connected AD is 1"},
      {"choiceIndex": 2, "explanation": "**110** is **OSPF** — connected routes are **0**.", "misconceptionTested": "Connected AD is 110"},
      {"choiceIndex": 3, "explanation": "**120** is **RIP** — connected is always **0**.", "misconceptionTested": "Connected AD is 120"},
    ],
    "examTip": "Connected = **directly attached interface** → AD **0**, always beats static/dynamic.",
  },
  "3.2-c-q5": {
    "correct": {"choiceIndex": 2, "explanation": "AD **255** means the route is **unusable** — IOS **never installs** it in the routing table."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "AD 255 is the **worst** possible — it's **discarded**, not preferred.", "misconceptionTested": "AD 255 is preferred"},
      {"choiceIndex": 1, "explanation": "AD 255 routes are **rejected outright** — not installed conditionally.", "misconceptionTested": "AD 255 installed without metric"},
      {"choiceIndex": 3, "explanation": "If not installed, the route is **never used** — AD 255 is a **blackhole** value.", "misconceptionTested": "AD 255 installed but unused"},
    ],
    "examTip": "Floating static backup: set AD **> primary** (e.g., **130** behind OSPF **110**) — not 255 unless discarding.",
  },
  "3.2-c-q6": {
    "correct": {"choiceIndex": 1, "explanation": "**False** — OSPF **cost** and EIGRP **composite metric** use **different scales** — only compare within the same protocol."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**True** is wrong — cross-protocol selection uses **AD first**, not metric comparison.", "misconceptionTested": "Cross-protocol metric comparison"},
    ],
    "examTip": "Never compare **OSPF cost** to **EIGRP metric** — AD decides between protocols; metric decides within one.",
  },
  "3.2-c-q9": {
    "correct": {"choiceIndex": 1, "explanation": "No matching route and **no default** → router **drops the packet** (sends ICMP unreachable if enabled)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Routers don't **flood** like switches — unknown destinations are **dropped**, not flooded.", "misconceptionTested": "Router floods unknown destinations"},
      {"choiceIndex": 2, "explanation": "Without a match, there's **no route** to use — lowest AD doesn't apply.", "misconceptionTested": "Send to lowest AD route"},
      {"choiceIndex": 3, "explanation": "Routers don't **queue** packets waiting for routes — they **drop** immediately.", "misconceptionTested": "Queue until route appears"},
    ],
    "examTip": "No route + no default = **packet dropped** — install **`ip route 0.0.0.0 0.0.0.0 <gw>`** for catch-all.",
  },
  "3.2-c-q10": {
    "correct": {"choiceIndex": 1, "explanation": "In **`O 10.2.2.0/24 [110/30]`**, **110** is **AD** and **30** is the **OSPF cost metric**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Order is **[AD/metric]** — **110** is AD, **30** is metric, not reversed.", "misconceptionTested": "Metric before AD in brackets"},
      {"choiceIndex": 2, "explanation": "Neither value is a **prefix** — they're **AD and metric**.", "misconceptionTested": "Bracket values are prefix and metric"},
      {"choiceIndex": 3, "explanation": "**Hop count** is RIP — OSPF uses **cost** (110/30 = AD/cost).", "misconceptionTested": "OSPF bracket shows cost and hops"},
    ],
    "examTip": "Always read brackets as **[administrative distance / protocol metric]**.",
  },
  # === 3.3 Static routes ===
  "3.3-q2": {
    "correct": {"choiceIndex": 1, "explanation": "**`ip route 0.0.0.0 0.0.0.0 203.0.113.1`** — network **0.0.0.0** mask **0.0.0.0** is the IPv4 default route."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**255.255.255.255** is a **host mask** — default route uses **0.0.0.0** mask.", "misconceptionTested": "Host mask for default route"},
      {"choiceIndex": 2, "explanation": "**`ip route default`** is not valid IOS syntax.", "misconceptionTested": "ip route default keyword"},
      {"choiceIndex": 3, "explanation": "**`ip default-route`** is not standard IOS — use **`ip route 0.0.0.0 0.0.0.0`**.", "misconceptionTested": "ip default-route command"},
    ],
    "examTip": "IPv4 default: **`ip route 0.0.0.0 0.0.0.0 <next-hop>`** or **`ip route 0.0.0.0 0.0.0.0 <int> <next-hop>`**.",
  },
  "3.3-q3": {
    "correct": {"choiceIndex": 1, "explanation": "Floating static: set AD **higher than OSPF (110)** — **`ip route ... 130`** installs only when OSPF fails."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**AD 90** is **lower than OSPF (110)** — static would **override** OSPF, not float as backup.", "misconceptionTested": "AD 90 as floating backup"},
      {"choiceIndex": 2, "explanation": "No AD suffix defaults to **1** — beats OSPF immediately, not a backup.", "misconceptionTested": "Default AD static as backup"},
      {"choiceIndex": 3, "explanation": "**AD 1** is the static default — it **always wins** over OSPF, not a floating backup.", "misconceptionTested": "AD 1 as floating backup"},
    ],
    "examTip": "Floating static: AD **> active protocol** — OSPF primary **110** → backup static **130**.",
  },
  "3.3-q5": {
    "correct": {"choiceIndex": 1, "explanation": "**`ipv6 route 2001:db8:1::/48 2001:db8::1`** — prefix length in CIDR notation with IPv6 next-hop."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`ip route`** is **IPv4** syntax — IPv6 needs **`ipv6 route`**.", "misconceptionTested": "ip route for IPv6"},
      {"choiceIndex": 2, "explanation": "**`ipv6 static-route`** is not valid IOS syntax.", "misconceptionTested": "ipv6 static-route command"},
      {"choiceIndex": 3, "explanation": "Space before **/48** is invalid — prefix and length are **`2001:db8:1::/48`**.", "misconceptionTested": "Space before IPv6 prefix length"},
    ],
    "examTip": "IPv6 static: **`ipv6 route <prefix/len> <next-hop>`** | default: **`ipv6 route ::/0 <next-hop>`**.",
  },
  "3.3-q6": {
    "correct": {"choiceIndex": 1, "explanation": "**`ipv6 route ::/0 <next-hop>`** is the IPv6 **default route** — equivalent to **0.0.0.0/0**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**ff00::/8** is **multicast** space — not a default route.", "misconceptionTested": "Multicast prefix as default"},
      {"choiceIndex": 2, "explanation": "**0::0/0** is non-standard notation — IOS uses **`::/0`**.", "misconceptionTested": "0::0/0 as default"},
      {"choiceIndex": 3, "explanation": "**`ipv6 default-gateway`** is a **host** command — routers use **`ipv6 route ::/0`**.", "misconceptionTested": "default-gateway on router"},
    ],
    "examTip": "IPv6 default = **`::/0`** (all zeros prefix) — appears as **`S ::/0`** in **`show ipv6 route`**.",
  },
  "3.3-q7": {
    "correct": {"choiceIndex": 1, "explanation": "**`show ip route static`** filters the routing table to **static routes only**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show ip route`** shows **all** routes — use **`static`** keyword to filter.", "misconceptionTested": "show ip route shows static only"},
      {"choiceIndex": 2, "explanation": "Running config may include other sections — **`show ip route static`** is the direct filter.", "misconceptionTested": "running-config section for static only"},
      {"choiceIndex": 3, "explanation": "**`show ip protocols`** shows **dynamic protocol** status — not static routes.", "misconceptionTested": "ip protocols for static routes"},
    ],
    "examTip": "Route filters: **`show ip route static`** | **`connected`** | **`ospf`** | **`summary`**.",
  },
  # === 3.4 OSPF ===
  "3.4-c-q5": {
    "correct": {"choiceIndex": 1, "explanation": "**Hello/dead timer mismatch** or **area mismatch** prevents OSPF adjacency formation."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Hostname** differences don't block OSPF — timers and area must match.", "misconceptionTested": "Hostname mismatch blocks OSPF"},
      {"choiceIndex": 2, "explanation": "**SNMP community** strings don't affect OSPF neighbor relationships.", "misconceptionTested": "SNMP string mismatch blocks OSPF"},
      {"choiceIndex": 3, "explanation": "**Login banners** are cosmetic — OSPF needs matching **area, subnet, timers, and network type**.", "misconceptionTested": "Banner mismatch blocks OSPF"},
    ],
    "examTip": "OSPF won't neighbor: **area** | **hello/dead** | **subnet mask** | **auth** | **stub/NSSA** flags.",
  },
  "3.4-c-q6": {
    "correct": {"choiceIndex": 1, "explanation": "**`network 10.0.0.0 0.0.0.255 area 0`** — wildcard mask **0.0.0.255** matches the /24."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**255.255.255.0** is a **subnet mask** — OSPF **`network`** uses a **wildcard mask**.", "misconceptionTested": "Subnet mask in OSPF network statement"},
      {"choiceIndex": 2, "explanation": "**`ospf network`** is not valid syntax for advertising prefixes.", "misconceptionTested": "ospf network command"},
      {"choiceIndex": 3, "explanation": "**`advertise`** is not an IOS OSPF command — use **`network ... area`**.", "misconceptionTested": "advertise command for OSPF"},
    ],
    "examTip": "OSPF network: **`network <ip> <wildcard> area <id>`** — wildcard = inverse of subnet mask.",
  },
  "3.4-c-q7": {
    "correct": {"choiceIndex": 3, "explanation": "A healthy OSPF adjacency reaches **Full** state — LSDB synchronized, routes exchanged."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Init** is early discovery — adjacency hasn't formed yet.", "misconceptionTested": "Init as final OSPF state"},
      {"choiceIndex": 1, "explanation": "**2-Way** is normal on **broadcast multi-access** for DROther routers — not fully adjacent.", "misconceptionTested": "2-Way as fully adjacent"},
      {"choiceIndex": 2, "explanation": "**Exchange** is mid-sync — must reach **Full** for complete adjacency.", "misconceptionTested": "Exchange as final state"},
    ],
    "examTip": "OSPF states: **Down → Init → 2-Way → ExStart → Exchange → Loading → Full**.",
  },
  "3.4-c-q8": {
    "correct": {"choiceIndex": 1, "explanation": "**`passive-interface`** advertises the network but **suppresses OSPF hellos** — no neighbor on that interface."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "The network is still **advertised** into OSPF — only **hellos** are stopped.", "misconceptionTested": "passive-interface stops advertising"},
      {"choiceIndex": 2, "explanation": "The interface stays **up** — OSPF just doesn't send/receive **hellos** on it.", "misconceptionTested": "passive-interface shuts interface"},
      {"choiceIndex": 3, "explanation": "**DR election** is unrelated — passive prevents **neighbor formation** entirely.", "misconceptionTested": "passive-interface forces DR election"},
    ],
    "examTip": "Use **`passive-interface default`** + **`no passive-interface <uplink>`** to secure user-facing ports.",
  },
  # === 4.10 Cloud / local management ===
  "4.10-legacy-q006": {
    "correct": {"choiceIndex": 1, "explanation": "Local management keeps **config and management traffic inside the org network** — no third-party cloud transit."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Local isn't **always faster** — the driver is **data sovereignty and compliance**, not speed.", "misconceptionTested": "Local always faster"},
      {"choiceIndex": 2, "explanation": "Both models require **trained administrators** — local doesn't eliminate training.", "misconceptionTested": "Local needs no training"},
      {"choiceIndex": 3, "explanation": "Local management doesn't **automatically encrypt user data** — that's a separate security control.", "misconceptionTested": "Local auto-encrypts user data"},
    ],
    "examTip": "Local vs cloud: **compliance/sovereignty** favors on-prem | **scale/automation** favors cloud.",
  },
  "4.10-legacy-q007": {
    "correct": {"choiceIndex": 0, "explanation": "Traditional local management uses **per-device CLI, SNMP, or on-site controllers** — often site-by-site access."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**Vendor global cloud push** describes **cloud-managed** — not traditional local.", "misconceptionTested": "Cloud push as local management"},
      {"choiceIndex": 2, "explanation": "**Automatic fleet firmware** from vendor cloud is **cloud-managed** lifecycle.", "misconceptionTested": "Auto firmware as local management"},
      {"choiceIndex": 3, "explanation": "Local management doesn't require **WAN to every branch** — on-site access works.", "misconceptionTested": "WAN required for local management"},
    ],
    "examTip": "Local = **CLI per box** or **on-prem NMS** | Cloud = **Meraki/DNA Center SaaS** dashboard.",
  },
  "4.10-legacy-q008": {
    "correct": {"choiceIndex": 1, "explanation": "Scheduled **cloud-pushed firmware** across the fleet = **centralized automated lifecycle management**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**CLI scripting** is manual/local — not automated cloud fleet updates.", "misconceptionTested": "CLI scripting as cloud lifecycle"},
      {"choiceIndex": 2, "explanation": "**Per-device TFTP** is manual — cloud platforms push **centrally scheduled** updates.", "misconceptionTested": "Manual TFTP as cloud lifecycle"},
      {"choiceIndex": 3, "explanation": "**VLAN trunking** is Layer 2 config — not firmware lifecycle management.", "misconceptionTested": "VLAN trunking as lifecycle"},
    ],
    "examTip": "Cloud management wins: **firmware orchestration**, **template config**, **multi-site visibility**.",
  },
  "4.10-legacy-q009": {
    "correct": {"choiceIndex": 1, "explanation": "**Single pane of glass** = one **dashboard/UI** for visibility and control across all devices and sites."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "It's a **software concept** — not a physical shared management cable.", "misconceptionTested": "Physical cable single pane"},
      {"choiceIndex": 2, "explanation": "Multiple admin accounts can exist — **single pane** refers to the **unified UI**, not user count.", "misconceptionTested": "Single admin account"},
      {"choiceIndex": 3, "explanation": "Devices can be **geographically distributed** — one dashboard still unifies them.", "misconceptionTested": "Same rack required"},
    ],
    "examTip": "Single pane of glass = **unified NMS/dashboard** (Meraki, DNAC, Prime) — one view, many sites.",
  },
  # === 5.4 AAA / TACACS+ / RADIUS ===
  "5.4-legacy-q002": {
    "correct": {"choiceIndex": 1, "explanation": "**TACACS+** uses **TCP port 49** — connection-oriented, reliable delivery."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**UDP 1812** is **RADIUS authentication** — TACACS+ is **TCP 49**.", "misconceptionTested": "TACACS+ on UDP 1812"},
      {"choiceIndex": 2, "explanation": "TACACS+ is **TCP-based**, not UDP — port **49**.", "misconceptionTested": "TACACS+ on UDP 49"},
      {"choiceIndex": 3, "explanation": "**TCP 1812** is not TACACS+ — that's RADIUS territory.", "misconceptionTested": "TACACS+ on TCP 1812"},
    ],
    "examTip": "Ports: **TACACS+ TCP 49** | **RADIUS UDP 1812/1813** — TCP vs UDP is an exam favorite.",
  },
  "5.4-legacy-q003": {
    "correct": {"choiceIndex": 1, "explanation": "**RADIUS**: **UDP 1812** (auth/authorization) and **UDP 1813** (accounting) — modern IANA standard."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**TCP 49/50** is not RADIUS — that's **TACACS+** territory.", "misconceptionTested": "RADIUS on TCP 49/50"},
      {"choiceIndex": 2, "explanation": "RADIUS uses **UDP**, not TCP — **1812/1813**.", "misconceptionTested": "RADIUS on TCP"},
      {"choiceIndex": 3, "explanation": "**UDP 161/162** is **SNMP** — RADIUS is **1812/1813**.", "misconceptionTested": "RADIUS on SNMP ports"},
    ],
    "examTip": "Legacy RADIUS used **1645/1646** — exam default is **1812/1813** unless stem says otherwise.",
  },
  "5.4-legacy-q004": {
    "correct": {"choiceIndex": 1, "explanation": "**TACACS+** encrypts the **entire packet body**; **RADIUS** encrypts **only the password** in the Access-Request."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "This reverses the protocols — **TACACS+** gets full-body encryption, not RADIUS.", "misconceptionTested": "Reversed TACACS/RADIUS encryption"},
      {"choiceIndex": 2, "explanation": "Both support encryption — TACACS+ is **stronger** (full body vs password only).", "misconceptionTested": "Neither protocol encrypts"},
      {"choiceIndex": 3, "explanation": "Encryption scope **differs** — TACACS+ is **full body**, RADIUS is **password-only**.", "misconceptionTested": "Identical encryption models"},
    ],
    "examTip": "TACACS+ = **encrypt everything** (better for device admin) | RADIUS = **password field only**.",
  },
  "5.4-legacy-q006": {
    "correct": {"choiceIndex": 1, "explanation": "**`aaa authentication login default group tacacs+ local`** — try **TACACS+ first**, **fall back to local** database if unreachable."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`local`** keyword provides fallback — login isn't denied if TACACS+ fails.", "misconceptionTested": "No fallback with local keyword"},
      {"choiceIndex": 2, "explanation": "Order is **TACACS+ then local** — not local first.", "misconceptionTested": "Local before TACACS+"},
      {"choiceIndex": 3, "explanation": "This works with **TACACS+ only** — RADIUS isn't required for this login method list.", "misconceptionTested": "Requires RADIUS configured"},
    ],
    "examTip": "AAA method list order matters: **`group tacacs+ local`** = server first, **local backup**.",
  },
  "5.4-legacy-q007": {
    "correct": {"choiceIndex": 1, "explanation": "Shared secrets must **match exactly** — **case-sensitive** mismatch (**Cisco123** vs **cisco123**) causes auth failure."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "TACACS+ **requires** a shared secret — it's the foundation of server trust.", "misconceptionTested": "TACACS+ no shared secret"},
      {"choiceIndex": 2, "explanation": "Protocol choice isn't the issue — the **key mismatch** is.", "misconceptionTested": "Switch to RADIUS fix"},
      {"choiceIndex": 3, "explanation": "Keys must be **identical** on both sides — not intentionally different.", "misconceptionTested": "Keys must differ per side"},
    ],
    "examTip": "TACACS+ debug: **`test aaa group tacacs+ <user> <pass> legacy`** — verify **key + server reachability**.",
  },
  "5.4-legacy-q008": {
    "correct": {"choiceIndex": 1, "explanation": "**Authorization** determines **what an authenticated user can do** — privileged EXEC access, command levels."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Authentication** verifies **identity** (who you are) — not command permissions.", "misconceptionTested": "Authentication for command permissions"},
      {"choiceIndex": 2, "explanation": "**Accounting** **logs** what was done — doesn't **permit/deny** commands.", "misconceptionTested": "Accounting for command permissions"},
      {"choiceIndex": 3, "explanation": "**Auditing** isn't a formal AAA component — **Authorization** controls access.", "misconceptionTested": "Auditing as AAA component"},
    ],
    "examTip": "AAA: **Authentication** (who) | **Authorization** (what allowed) | **Accounting** (what happened).",
  },
  "5.4-legacy-q010": {
    "correct": {"choiceIndex": 1, "explanation": "**TACACS+** separates **auth/authz/accounting** and supports **per-command authorization** — ideal for **device admin**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "RADIUS **can** authenticate — TACACS+ wins on **granular command authorization**.", "misconceptionTested": "RADIUS cannot authenticate"},
      {"choiceIndex": 2, "explanation": "**Wireless client auth** typically uses **RADIUS** — TACACS+ targets **infrastructure admin**.", "misconceptionTested": "TACACS+ required for wireless"},
      {"choiceIndex": 3, "explanation": "Bandwidth isn't the deciding factor — **per-command authz** is.", "misconceptionTested": "TACACS+ bandwidth advantage"},
    ],
    "examTip": "Device admin → **TACACS+** | Wireless/802.1X/NAS → **RADIUS** — know which AAA fits.",
  },
}

assert len(HAND) == 61, f"Expected 61, got {len(HAND)}"

def fmt_entry(id_, rev):
    body = json.dumps(rev, indent=2)
    indented = "\n".join("  " + line if line else line for line in body.splitlines())
    return f"  '{id_}': {indented},"

lines = [
    "/** Gold reviews — Curated 61: remaining clean-bank curated questions (61 entries). */",
    "export const CURATED61_GOLD = {",
]
for id_, rev in HAND.items():
    lines.append(fmt_entry(id_, rev))
lines.append("}")
lines.append("")

out = ROOT / "src/answerReview/goldAnswerReviewsCurated61.js"
out.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {len(HAND)} entries to {out.relative_to(ROOT)}")
