/** Gold reviews — Batch 33: polish remaining short/high-traffic debriefs (40 entries). */
export const BATCH33_GOLD = {
  "1.4-c-q4": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "On full-duplex access ports, sustained collisions usually mean **duplex mismatch** or misconfiguration — not normal operation."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Full-duplex eliminates the shared collision domain — **sustained collisions are abnormal**, not normal.",
        "misconceptionTested": "Collisions normal on full-duplex"
      },
      {
        "choiceIndex": 2,
        "explanation": "**OSPF adjacency** is Layer 3 control-plane state — collisions are a **Layer 1/2** physical symptom.",
        "misconceptionTested": "OSPF as collision cause"
      },
      {
        "choiceIndex": 3,
        "explanation": "**DHCP renewal** is Layer 3 addressing — it does not generate Ethernet collision counters.",
        "misconceptionTested": "DHCP as collision cause"
      }
    ],
    "examTip": "Full-duplex = **no collisions expected** — climbing counters → check **speed/duplex** both ends."
  },
  "2.1-c-q7": {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**True** — the same VLAN on two switches can communicate at L2 when an **802.1Q trunk** carries that VLAN."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**False** is wrong — trunks **extend VLANs across switches** so same-VLAN hosts can talk at Layer 2.",
        "misconceptionTested": "VLANs cannot span switches"
      }
    ],
    "examTip": "Same VLAN across switches → **trunk** with VLAN allowed. Inter-VLAN → **router/SVI**."
  },
  "3.4-c-q6": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "OSPF **`network`** uses a **wildcard**: **`network 10.0.0.0 0.0.0.255 area 0`** for 10.0.0.0/24."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**255.255.255.0** is a **subnet mask** — the OSPF **`network`** statement requires a **wildcard mask**.",
        "misconceptionTested": "Subnet mask in OSPF network"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`ospf network …`** is not valid IOS syntax for enabling OSPF on interfaces/prefixes.",
        "misconceptionTested": "Invented ospf network"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`advertise`** is not an IOS OSPF command — use **`network <ip> <wildcard> area <id>`**.",
        "misconceptionTested": "Invented advertise command"
      }
    ],
    "examTip": "OSPF: **`network <ip> <wildcard> area <id>`** — wildcard = inverse of mask."
  },
  "1.3-c-q6": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Two legacy switches without auto-MDIX need a **crossover** Ethernet cable."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Straight-through** connects unlike devices (PC↔switch) — switch↔switch on legacy gear needs **crossover**.",
        "misconceptionTested": "Straight for switch-switch"
      },
      {
        "choiceIndex": 2,
        "explanation": "A **console** cable is for the management port — not inter-switch Ethernet data links.",
        "misconceptionTested": "Console for switch uplink"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Serial DCE/DTE** is for WAN serial links — not Ethernet switch-to-switch cabling.",
        "misconceptionTested": "Serial for Ethernet switches"
      }
    ],
    "examTip": "Switch ↔ switch (no auto-MDIX) = **crossover**. Modern gear often auto-MDIX."
  },
  "1.4-c-q2": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**`show interfaces counters errors`** (or `show interfaces`) surfaces CRC and collision counters."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`show ip route`** lists Layer 3 paths — not interface CRC/collision error counters.",
        "misconceptionTested": "Route table for errors"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`show vlan brief`** lists VLAN membership — not CRC or collision counts.",
        "misconceptionTested": "VLAN brief for errors"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`show version`** shows IOS/uptime — not per-interface physical error counters.",
        "misconceptionTested": "Version for errors"
      }
    ],
    "examTip": "Physical/L2 errors → **`show interfaces`** or **`show interfaces counters errors**."
  },
  "1.4-c-q3": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Forced full vs auto half typically yields **slow performance with CRC and late collisions**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Duplex mismatch usually keeps **link up** — you get degradation and errors, not total blackout.",
        "misconceptionTested": "Mismatch = no link"
      },
      {
        "choiceIndex": 2,
        "explanation": "Mismatch **hurts** throughput — it does not double speed.",
        "misconceptionTested": "Mismatch doubles speed"
      },
      {
        "choiceIndex": 3,
        "explanation": "**STP blocking** is a spanning-tree state — unrelated to duplex auto-negotiation failure.",
        "misconceptionTested": "STP as duplex symptom"
      }
    ],
    "examTip": "Duplex mismatch → **CRC + late collisions** — fix with **auto/auto** or match both sides."
  },
  "1.3-c-q3": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Long-distance WAN fiber typically uses **single-mode** (often yellow jacket)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Multimode** (orange/aqua) is for **shorter** campus runs — not long-haul WAN.",
        "misconceptionTested": "MMF for long WAN"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Cat5 copper** is twisted-pair Ethernet — not fiber for long-distance WAN.",
        "misconceptionTested": "Copper for long WAN fiber"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Coax** is legacy broadband/cable plant — WAN fiber uses **single-mode**.",
        "misconceptionTested": "Coax as WAN fiber"
      }
    ],
    "examTip": "Fiber: **MMF** short | **SMF** long — match transceiver to cable."
  },
  "2.1-c-q4": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**`show vlan brief`** lists VLANs and their **access-port** assignments."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`show interfaces trunk`** shows trunk ports and allowed VLANs — not access-port VLAN maps.",
        "misconceptionTested": "Trunk show for access assign"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`show ip route`** is Layer 3 routing — VLAN-to-port assignment is Layer 2.",
        "misconceptionTested": "Route for VLAN assign"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`show mac address-table`** maps MACs to ports — not the VLAN membership table.",
        "misconceptionTested": "MAC table for VLAN assign"
      }
    ],
    "examTip": "VLAN verify: **`show vlan brief`** (access) | **`show interfaces trunk`** (trunks)."
  },
  "3.4-c-q5": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "OSPF adjacency fails when **hello/dead timers** or **area** (among other params) mismatch."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Different **hostnames** do not block OSPF — timers, area, subnet, and auth must match.",
        "misconceptionTested": "Hostname blocks OSPF"
      },
      {
        "choiceIndex": 2,
        "explanation": "**SNMP community** strings do not affect OSPF neighbor formation.",
        "misconceptionTested": "SNMP blocks OSPF"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Login banners** are cosmetic — OSPF needs matching area, subnet, timers, and network type.",
        "misconceptionTested": "Banner blocks OSPF"
      }
    ],
    "examTip": "OSPF won’t neighbor: **area** | **hello/dead** | **mask** | **auth** | stub flags."
  },
  "1.2-c-q2": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Spine-leaf** is primarily a **data-center** fabric for scalable **east-west** traffic."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "SOHO Wi‑Fi uses a single AP/router — not a multi-spine leaf fabric design.",
        "misconceptionTested": "Spine-leaf for SOHO Wi-Fi"
      },
      {
        "choiceIndex": 2,
        "explanation": "Dial-up WAN is legacy remote access — unrelated to spine-leaf DC switching.",
        "misconceptionTested": "Spine-leaf for dial-up"
      },
      {
        "choiceIndex": 3,
        "explanation": "Home gaming does not require spine-leaf — that architecture targets scalable DC east-west traffic.",
        "misconceptionTested": "Spine-leaf for home gaming"
      }
    ],
    "examTip": "Spine-leaf = **DC east-west**. Campus = access/distribution/core."
  },
  "1.2-c-q4": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Full-mesh WAN trade-off is **high cost/complexity** from many site-to-site links."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Full mesh **maximizes** redundancy — the trade-off is cost/complexity, not lack of redundancy.",
        "misconceptionTested": "Mesh has no redundancy"
      },
      {
        "choiceIndex": 2,
        "explanation": "Mesh works over various transports — it is not limited to fiber only.",
        "misconceptionTested": "Mesh fiber-only"
      },
      {
        "choiceIndex": 3,
        "explanation": "Routing still runs over mesh links — mesh describes topology, not elimination of routing.",
        "misconceptionTested": "Mesh eliminates routing"
      }
    ],
    "examTip": "Full mesh = **max redundancy, max cost**. Hub-spoke = cheaper, hub SPOF."
  },
  "1.2-c-q7": {
    "correct": {
      "choiceIndex": 2,
      "explanation": "In **IaaS**, the customer manages the **OS** (and above) while the provider owns the physical hardware."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**SaaS** — provider manages the full stack including the application (e.g., Office 365).",
        "misconceptionTested": "SaaS as IaaS"
      },
      {
        "choiceIndex": 1,
        "explanation": "**PaaS** — provider manages OS/runtime; customer deploys **code** only.",
        "misconceptionTested": "PaaS as IaaS"
      },
      {
        "choiceIndex": 3,
        "explanation": "**On-prem** means the customer owns all hardware — not a cloud shared-responsibility model.",
        "misconceptionTested": "On-prem as IaaS"
      }
    ],
    "examTip": "Cloud: **IaaS** (you manage OS) → **PaaS** (code) → **SaaS** (use app)."
  },
  "3.2-c-q5": {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Administrative distance **255** means the route is **never installed** in the routing table."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "AD **255** is the **worst** value — routes are discarded, not preferred.",
        "misconceptionTested": "AD 255 preferred"
      },
      {
        "choiceIndex": 1,
        "explanation": "AD **255** routes are **rejected outright** — not installed when metrics are missing.",
        "misconceptionTested": "AD 255 conditional install"
      },
      {
        "choiceIndex": 3,
        "explanation": "If the route is not installed, it cannot be used — AD 255 is effectively a discard value.",
        "misconceptionTested": "AD 255 installed unused"
      }
    ],
    "examTip": "Floating static: AD **> primary** (e.g. 130 behind OSPF 110) — **255** discards."
  },
  "obj-6.6-source-q018": {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Custom Ansible modules are written in **Python** — that extends Ansible's task library."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**YAML** is for playbooks/inventories — custom modules are **Python**.",
        "misconceptionTested": "YAML as module format"
      },
      {
        "choiceIndex": 1,
        "explanation": "**CSV** is a flat data table format — not how Ansible custom modules are authored.",
        "misconceptionTested": "CSV as module format"
      },
      {
        "choiceIndex": 3,
        "explanation": "**XML** is a markup format for data exchange — Ansible custom modules are authored in **Python**, not XML.",
        "misconceptionTested": "XML as module format"
      }
    ],
    "examTip": "Ansible: playbooks = **YAML**; custom modules = **Python**."
  },
  "obj-6.7-source-q005": {
    "correct": {
      "choiceIndex": 3,
      "explanation": "A JSON **object** document typically begins with a **curly bracket `{`**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Three dashes (**`---`**) mark a **YAML** document start — not JSON.",
        "misconceptionTested": "YAML dashes as JSON"
      },
      {
        "choiceIndex": 1,
        "explanation": "Square brackets start a JSON **array** — object documents start with **`{`**.",
        "misconceptionTested": "Array as object start"
      },
      {
        "choiceIndex": 2,
        "explanation": "A double quote starts a **string value** — the document structure starts with **`{`** or `[`.",
        "misconceptionTested": "Quote as JSON start"
      }
    ],
    "examTip": "JSON object → **`{`**. YAML doc → often **`---`**."
  },
  "obj-5.8-source-q013": {
    "correct": {
      "choiceIndex": 3,
      "explanation": "A **RADIUS** server is an **authentication** (AAA) server for user/device access control."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**DNS** resolves names to addresses — it does not authenticate users like RADIUS.",
        "misconceptionTested": "DNS as RADIUS role"
      },
      {
        "choiceIndex": 1,
        "explanation": "An **email** server delivers mail — RADIUS provides **authentication/authorization**.",
        "misconceptionTested": "Email as RADIUS"
      },
      {
        "choiceIndex": 2,
        "explanation": "A **proxy** forwards client traffic — RADIUS **authenticates** against a user database.",
        "misconceptionTested": "Proxy as RADIUS"
      }
    ],
    "examTip": "802.1X: **supplicant** → **authenticator** (switch) → **RADIUS/AAA** server."
  },
  "obj-6.5-source-q019": {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**POST** is the HTTP verb used to **insert/create** a new resource."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**GET** reads/retrieves a resource — it does not create one.",
        "misconceptionTested": "GET creates"
      },
      {
        "choiceIndex": 1,
        "explanation": "**UPDATE** is not a standard HTTP verb — use **PUT/PATCH** for updates.",
        "misconceptionTested": "Invented UPDATE verb"
      },
      {
        "choiceIndex": 3,
        "explanation": "**PUT** can create/replace at a known URI — this stem’s create/insert answer is **POST**.",
        "misconceptionTested": "PUT as insert"
      }
    ],
    "examTip": "REST: **GET** read · **POST** create · **PUT/PATCH** update · **DELETE** remove."
  },
  "obj-6.6-source-q017": {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**Ansible** is typically the easiest CM utility to stand up (agentless SSH/API, YAML playbooks)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Chef** usually needs a server plus agents — heavier setup than agentless Ansible.",
        "misconceptionTested": "Chef easiest"
      },
      {
        "choiceIndex": 1,
        "explanation": "**Puppet** typically requires agent install and a master — more setup than Ansible.",
        "misconceptionTested": "Puppet easiest"
      },
      {
        "choiceIndex": 3,
        "explanation": "**DNA Center** is powerful enterprise automation — not the lightest CM lab setup.",
        "misconceptionTested": "DNA easiest CM"
      }
    ],
    "examTip": "Ansible = **agentless** + YAML — usually simplest CM start vs Puppet/Chef."
  },
  "obj-6.7-source-q009": {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Cisco DNA Center REST APIs return data in **JSON**."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**XML** appears on some legacy APIs — DNA Center REST responses are **JSON**.",
        "misconceptionTested": "XML DNA response"
      },
      {
        "choiceIndex": 2,
        "explanation": "**CSV** is a spreadsheet export format — not the DNA Center REST response body.",
        "misconceptionTested": "CSV DNA response"
      },
      {
        "choiceIndex": 3,
        "explanation": "**YAML** is common in Ansible configs — DNA Center API responses are **JSON**.",
        "misconceptionTested": "YAML DNA response"
      }
    ],
    "examTip": "DNA Center REST → **JSON** request/response bodies."
  },
  "obj-3.1-source-q016": {
    "correct": {
      "choiceIndex": 2,
      "explanation": "AD **90** = **EIGRP** (internal). EIGRP routes appear with [90/metric] in `show ip route`."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**IGRP** is wrong here: **IGRP** AD was 100 — and IGRP is deprecated/removed from modern IOS. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "AD 90 for IGRP"
      },
      {
        "choiceIndex": 1,
        "explanation": "**OSPF** is wrong here: **OSPF** AD is **110**, not 90. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "AD 90 for OSPF"
      },
      {
        "choiceIndex": 3,
        "explanation": "**RIP** is wrong here: **RIP** AD is **120** — much higher than 90. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "AD 90 for RIP"
      }
    ],
    "examTip": "AD quick ref: Connected=0, Static=1, EIGRP=**90**, OSPF=110, IS-IS=115, RIP=120."
  },
  "obj-5.8-source-q008": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "RADIUS authentication uses **UDP port 1645** (legacy) / **1812** (IANA) — exam often cites **UDP/1645**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**UDP/1845** is wrong here: **1845** is not the RADIUS auth port. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Wrong UDP port 1845"
      },
      {
        "choiceIndex": 2,
        "explanation": "**TCP/1645** is wrong here: RADIUS uses **UDP**, not TCP, for authentication. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "TCP for RADIUS auth"
      },
      {
        "choiceIndex": 3,
        "explanation": "**UDP/1911** is wrong here: **1911** is unrelated to RADIUS. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Wrong port 1911"
      }
    ],
    "examTip": "802.1X roles: **supplicant** (client) → **authenticator** (switch) → **AAA/RADIUS** (server) | EAP carries auth."
  },
  "obj-6.3-source-q011": {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**Routing/forwarding** of packets through a router is **data plane** (FIB/CEF forwarding)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**Control plane** is wrong here: Control plane builds routes — **forwarding** is data plane. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Control plane forwards packets"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Management plane** is wrong here: Management plane is SNMP/syslog. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Management plane forwarding"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Switch plane** is wrong here: **Routing plane** is not the standard three-plane model. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Routing plane term"
      }
    ],
    "examTip": "Planes: **data**=forward · **control**=routing/STP · **management**=SNMP/syslog."
  },
  "obj-2.8-source-q003": {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**TACACS+** uses **TCP port 49** — separates authentication, authorization, and accounting (Cisco AAA)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**UDP/69** is wrong here: UDP/69 is **TFTP** — not TACACS+. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "TFTP port for AAA"
      },
      {
        "choiceIndex": 1,
        "explanation": "**TCP/74** is wrong here: TCP/74 is not the TACACS+ port — memorize **49/TCP**. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Wrong TCP port"
      },
      {
        "choiceIndex": 2,
        "explanation": "**UDP/47** is wrong here: UDP/47 is not TACACS+ — RADIUS uses **UDP 1812/1813**. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "RADIUS port for TACACS+"
      }
    ],
    "examTip": "TACACS+ → **TCP/49**. RADIUS → **UDP/1812** (auth) / **1813** (acct)."
  },
  "obj-6.5-source-q017": {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**201 Created** confirms successful **POST** — resource was created."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**GET** is wrong here: GET returns 200 with data — not 201. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "GET returns 201"
      },
      {
        "choiceIndex": 2,
        "explanation": "**PATCH** is wrong here: PATCH updates — typically 200/204. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "PATCH returns 201"
      },
      {
        "choiceIndex": 3,
        "explanation": "**DELETE** is wrong here: DELETE returns 200/204 — not 201. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "DELETE returns 201"
      }
    ],
    "examTip": "REST: **GET** read · **POST** create · **PUT/PATCH** update · **DELETE**."
  },
  "obj-6.7-source-q002": {
    "correct": {
      "choiceIndex": 0,
      "explanation": "YAML files often begin with **`---`** (three dashes) marking document start."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**The file begins with a hashbang preprocessor.** is wrong here: Hashbang `#!` denotes scripts — YAML uses **`---`**. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Hashbang for YAML"
      },
      {
        "choiceIndex": 2,
        "explanation": "**The contents are contained between curly brackets.** is wrong here: Curly brackets indicate **JSON**. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Curly brackets for YAML"
      },
      {
        "choiceIndex": 3,
        "explanation": "**The contents are contained between square brackets.** is wrong here: Square brackets are JSON **arrays**. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Square brackets for YAML"
      }
    ],
    "examTip": "Structured data: **JSON** `{`/`[` · **YAML** indent/`---` · **XML** tags."
  },
  "obj-6.3-source-q017": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Moving packets to destinations is **data plane** forwarding."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Control plane** is wrong here: Control plane **decides** routes — data plane **forwards**. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Control plane packet forwarding"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Management plane** is wrong here: Management plane monitors — doesn't route packets. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Management plane routing"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Routing plane** is wrong here: **Routing plane** is non-standard. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Routing plane term"
      }
    ],
    "examTip": "Planes: **data**=forward · **control**=routing/STP · **management**=SNMP/syslog."
  },
  "obj-6.7-source-q012": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "The `ipaddress` array is **missing a closing `]`** before `subnet_mask` begins."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**The interface data is incorrect because it is missing a comma after defaultgw.** is wrong here: defaultgw comma isn't the first syntax break — **unclosed array** is. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Comma after defaultgw primary issue"
      },
      {
        "choiceIndex": 2,
        "explanation": "**The interface data is incorrect because it contains an illegal underscore character.** is wrong here: Underscores are valid in JSON keys. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Underscore invalid"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Nothing is wrong with the exhibit.** is wrong here: JSON is malformed — bracket not closed. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Valid JSON exhibit"
      }
    ],
    "examTip": "Structured data: **JSON** `{`/`[` · **YAML** indent/`---` · **XML** tags."
  },
  "obj-5.6-source-q029": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Place **standard ACLs close to the destination** — they only match source, so filter near where impact matters."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Extended** is wrong here: Extended ACLs belong near **source** — standard near **destination**. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Extended ACL at destination"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Dynamic** is wrong here: Dynamic ACLs follow auth/session design. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Dynamic ACL placement default"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Expanded** is wrong here: **Expanded** is not a placement type. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Expanded ACL at destination"
      }
    ],
    "examTip": "ACL placement: **standard → near destination** | **extended → near source** | wildcard = inverse of subnet mask."
  },
  "obj-6.7-source-q001": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "YAML **mappings** (indented key: value pairs) define **key-value** structures."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Definition** is wrong here: Definition isn't a YAML element type. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Definition element"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Lists** is wrong here: Lists use dashes — mappings are **key-value**. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Lists for key-value"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Keys** is wrong here: Keys are part of mappings — **mapping** is the element name. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Keys element type"
      }
    ],
    "examTip": "Structured data: **JSON** `{`/`[` · **YAML** indent/`---` · **XML** tags."
  },
  "obj-6.7-source-q003": {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**XML** uses tagged elements like HTML — hierarchical markup syntax."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**YAML** is wrong here: YAML is indentation-based — not HTML-like. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "YAML resembles HTML"
      },
      {
        "choiceIndex": 1,
        "explanation": "**JSON** is wrong here: JSON uses braces — not angle-bracket tags. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "JSON resembles HTML"
      },
      {
        "choiceIndex": 2,
        "explanation": "**CSV** is wrong here: CSV is flat columns — no nested tags. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "CSV resembles HTML"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  "obj-5.7-source-q021": {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**`show port-security`** displays violation counts and secure port summary — includes logged violations."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Switch#show violations** is wrong here: **`show violations`** is not valid IOS. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Invented show violations"
      },
      {
        "choiceIndex": 1,
        "explanation": "**Switch#show port-security violations** is wrong here: **`show port-security violations`** is not standard syntax. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Invented violations subcommand"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Switch#show psec violations** is wrong here: **`show psec`** is abbreviated incorrectly. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Abbreviated psec command"
      }
    ],
    "examTip": "Port security: access mode → **`switchport port-security`** → max MACs → violation mode → **`show port-security interface`**."
  },
  "obj-5.6-source-q022": {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Blocking by **protocol and port (TCP/80)** requires an **extended ACL**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Standard** is wrong here: Standard ACLs cannot match **TCP port 80**. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Standard ACL for L4 filter"
      },
      {
        "choiceIndex": 1,
        "explanation": "**Dynamic** is wrong here: Dynamic ACLs authenticate users — not static app filtering. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Dynamic for static web block"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Expanded** is wrong here: **Expanded** is not an IOS ACL category. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Expanded ACL type"
      }
    ],
    "examTip": "ACL placement: **standard → near destination** | **extended → near source** | wildcard = inverse of subnet mask."
  },
  "obj-6.2-source-q008": {
    "correct": {
      "choiceIndex": 3,
      "explanation": "The **NMS (Network Management System)** aggregates SNMP polls, traps, and metrics."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Trap** is wrong here: Traps are **events** — NMS collects them. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Trap as aggregator"
      },
      {
        "choiceIndex": 1,
        "explanation": "**SNMP agent** is wrong here: SNMP **agent** runs on the device — NMS is central. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Agent as NMS"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Syslog server** is wrong here: Syslog server handles logs — NMS handles **SNMP**. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Syslog server as SNMP aggregator"
      }
    ],
    "examTip": "Planes: **data**=forward · **control**=routing/STP · **management**=SNMP/syslog."
  },
  "obj-6.7-source-q004": {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**YAML** structure relies on **indentation/whitespace** — significant spaces define nesting."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**JSON** is wrong here: JSON uses braces/brackets — not whitespace significance. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "JSON whitespace structure"
      },
      {
        "choiceIndex": 2,
        "explanation": "**XML** is wrong here: XML uses tags — not whitespace hierarchy. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "XML whitespace structure"
      },
      {
        "choiceIndex": 3,
        "explanation": "**CSV** is wrong here: CSV is delimiter-separated — not whitespace-nested. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "CSV whitespace nesting"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  "obj-6.3-source-q012": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Routing protocols (OSPF, EIGRP, BGP)** operate on the **control plane**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Data plane** is wrong here: Data plane forwards — protocols **compute routes** in control plane. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Routing protocols on data plane"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Management plane** is wrong here: Management plane is monitoring — not OSPF. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "OSPF on management plane"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Routing plane** is wrong here: **Routing plane** is non-standard — use **control plane**. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Routing plane terminology"
      }
    ],
    "examTip": "Planes: **data**=forward · **control**=routing/STP · **management**=SNMP/syslog."
  },
  "obj-6.4-source-q004": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Plug and Play (PnP)** templates push **day-zero config** — DNS, NTP, AAA via profiles."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**IP-based access control** is wrong here: IP-based access control is policy — not templated baseline config. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "IP-based AC for DNS/NTP templates"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Group-based access control** is wrong here: Group-based access is policy segmentation. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Group-based AC for baseline"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Assurance** is wrong here: Assurance monitors health — PnP **provisions** devices. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Assurance for templating"
      }
    ],
    "examTip": "DNA Center: **Design/Policy/Provision/Assurance/Platform** — know which does what."
  },
  "obj-6.4-source-q008": {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**Platform** section documents **APIs** for automation (including Python scripts to DNA Center)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Design** is wrong here: Design is site/network hierarchy — not API docs. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Design for API docs"
      },
      {
        "choiceIndex": 1,
        "explanation": "**Policy** is wrong here: Policy is SGT/access — not developer APIs. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Policy for REST APIs"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Provision** is wrong here: Provision onboards devices — **Platform** exposes **API catalog**. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Provision for API reference"
      }
    ],
    "examTip": "DNA Center: **Design/Policy/Provision/Assurance/Platform** — know which does what."
  },
  "obj-5.6-source-q013": {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**Expanded extended ACLs** use numbered range **2000–2699** (legacy expanded syntax)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**1000 to 1999** is wrong here: **1000–1999** is not the extended expanded range. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Wrong thousand-range for extended expanded"
      },
      {
        "choiceIndex": 1,
        "explanation": "**1100 to 1299** is wrong here: **1100–1299** is not a valid IOS ACL range. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Invented ACL range"
      },
      {
        "choiceIndex": 2,
        "explanation": "**1300 to 1999** is wrong here: **1300–1999** is the **standard expanded** range, not extended. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Standard expanded range for extended"
      }
    ],
    "examTip": "ACL placement: **standard → near destination** | **extended → near source** | wildcard = inverse of subnet mask."
  },
  "obj-5.7-source-q022": {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**Sticky** learning saves MACs to running-config — least admin after PCs are already installed."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Static port security** is wrong here: Static requires manually typing each MAC — more admin. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Static for least admin"
      },
      {
        "choiceIndex": 1,
        "explanation": "**Dynamic port security** is wrong here: Dynamic without sticky loses MACs on reload. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Dynamic without sticky persistence"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Time limit port security** is wrong here: **Time limit** is not a port-security mode. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Time limit port security"
      }
    ],
    "examTip": "Port security: access mode → **`switchport port-security`** → max MACs → violation mode → **`show port-security interface`**."
  },
  "obj-6.4-source-q009": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**SD-Access** automates **underlay + overlay fabric** (LISP/VXLAN control)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Easy-QOS** is wrong here: Easy-QoS is QoS policy — not fabric automation. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "Easy-QoS for fabric"
      },
      {
        "choiceIndex": 2,
        "explanation": "**System 360** is wrong here: System 360 is analytics — not fabric build. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "System 360 for fabric"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Cisco ISE** is wrong here: ISE is policy/identity — SD-Access builds the **fabric**. The stem asks for the keyed correct behavior — this option answers a different mechanism.",
        "misconceptionTested": "ISE as fabric automation"
      }
    ],
    "examTip": "DNA Center: **Design/Policy/Provision/Assurance/Platform** — know which does what."
  }
}
