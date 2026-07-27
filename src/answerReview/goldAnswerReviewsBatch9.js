/** Gold reviews — Batch 9: fundamentals/routing/automation domains 1, 3, 6. */
export const BATCH9_GOLD = {
  'obj-1.12-depth-wave4-q1': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Containers share the host OS kernel and isolate processes with namespaces/cgroups — lighter than booting a full guest OS per workload."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Booting a full guest OS kernel per container is the VM model — containers reuse the host kernel.",
        "misconceptionTested": "Equating containers with full guest OS instances"
      },
      {
        "choiceIndex": 2,
        "explanation": "Containers can attach to virtual bridges and overlay networks — kernel sharing does not remove L2/L3 connectivity.",
        "misconceptionTested": "Believing containers cannot participate in virtual networks"
      },
      {
        "choiceIndex": 3,
        "explanation": "VMs emulate hardware and run separate OS copies — they are typically heavier than containers on the same host.",
        "misconceptionTested": "Assuming VMs are always lighter than containers"
      }
    ],
    "examTip": "Containers = **shared host kernel**; VMs = **separate guest OS** per instance."
  },
  'obj-1.2-depth-wave4-q1': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "The distribution tier aggregates access switches and applies inter-VLAN routing, ACLs, and QoS policy between campus layers."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Access tier connects end devices — it does not aggregate multiple access blocks or enforce inter-VLAN policy at scale.",
        "misconceptionTested": "Placing aggregation and policy at the access tier"
      },
      {
        "choiceIndex": 2,
        "explanation": "Core provides high-speed backbone transport — distribution sits between access and core for policy and aggregation.",
        "misconceptionTested": "Assigning access aggregation solely to the core"
      },
      {
        "choiceIndex": 3,
        "explanation": "Spine is a data-center fabric term — classic three-tier campus uses access, distribution, and core.",
        "misconceptionTested": "Using spine tier label in three-tier campus design"
      }
    ],
    "examTip": "Campus three-tier: **access** (end hosts) → **distribution** (policy/aggregation) → **core** (backbone)."
  },
  'obj-1.9-depth-wave4-q1': {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Unique local IPv6 addresses use the FC00::/7 prefix (commonly FD00::/8 with a random 40-bit global ID) — private and not globally routable."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "2000::/3 is global unicast space routable on the public Internet — ULA is private addressing.",
        "misconceptionTested": "Selecting global unicast prefix for ULA"
      },
      {
        "choiceIndex": 1,
        "explanation": "FE80::/10 is link-local — valid only on a single link, not site-wide private addressing like ULA.",
        "misconceptionTested": "Confusing link-local with unique local addressing"
      },
      {
        "choiceIndex": 3,
        "explanation": "FF02::/16 is multicast scope — ULA uses FC00::/7 for private site addressing.",
        "misconceptionTested": "Choosing multicast prefix for ULA question"
      }
    ],
    "examTip": "IPv6 ULA = **FC00::/7** (often **FD00::/8**); link-local = **FE80::/10**."
  },
  '1.10-c-q4': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Traceroute (tracert on Windows) lists each router hop and round-trip time toward the destination — a path-discovery tool."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "MAC address tables live on switches — traceroute probes Layer 3 hops with TTL-expired ICMP/time-exceeded responses.",
        "misconceptionTested": "Expecting traceroute to show switch CAM tables"
      },
      {
        "choiceIndex": 2,
        "explanation": "DHCP lease time comes from `ipconfig /all` or `show ip dhcp binding` — not from traceroute.",
        "misconceptionTested": "Using traceroute for DHCP lease information"
      },
      {
        "choiceIndex": 3,
        "explanation": "Wi-Fi channel is a wireless RF setting — traceroute traces the routed IP path, not RF parameters.",
        "misconceptionTested": "Linking traceroute output to Wi-Fi channel selection"
      }
    ],
    "examTip": "**tracert/traceroute** → hop-by-hop **Layer 3 path** and latency per router."
  },
  '1.12-c-q4': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "VRF (Virtual Routing and Forwarding) creates multiple isolated routing/forwarding tables on one physical router."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Wireless encryption (WPA/WPA2/WPA3) secures 802.11 frames — VRF segments Layer 3 routing instances.",
        "misconceptionTested": "Equating VRF with WLAN encryption"
      },
      {
        "choiceIndex": 2,
        "explanation": "Fiber transceivers are physical Layer 1 optics — VRF is a control/data-plane virtualization feature.",
        "misconceptionTested": "Assigning transceiver support to VRF"
      },
      {
        "choiceIndex": 3,
        "explanation": "DHCP redundancy uses multiple servers or failover mechanisms — VRF isolates routing tables, not DHCP HA by itself.",
        "misconceptionTested": "Expecting VRF to provide DHCP server redundancy"
      }
    ],
    "examTip": "VRF = **separate routing tables** on one router — like virtual routers sharing hardware."
  },
  '1.11-c-q3': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "WPA3 replaces WPA2-PSK four-way handshake with SAE (Simultaneous Authentication of Equals) for stronger password-based authentication."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "WEP is deprecated and broken — WPA3 moves forward with SAE, not WEP compatibility.",
        "misconceptionTested": "Believing WPA3 restores WEP compatibility"
      },
      {
        "choiceIndex": 2,
        "explanation": "Open networks have no encryption — WPA3 strengthens authenticated networks; it does not promote open SSIDs.",
        "misconceptionTested": "Associating WPA3 with open unsecured networks"
      },
      {
        "choiceIndex": 3,
        "explanation": "WPA3 still uses AES encryption — it improves the key exchange (SAE), not by removing AES.",
        "misconceptionTested": "Thinking WPA3 removes AES encryption"
      }
    ],
    "examTip": "WPA3 headline upgrade: **SAE handshake** replaces WPA2-PSK four-way exchange."
  },
  '1.11-c-q5': {
    "correct": {
      "choiceIndex": 3,
      "explanation": "IEEE 802.11ax is marketed as Wi-Fi 6 — higher efficiency (OFDMA, MU-MIMO) than 802.11ac (Wi-Fi 5)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Wi-Fi 3 maps to 802.11g-era branding — 802.11ax is Wi-Fi 6.",
        "misconceptionTested": "Mislabeling 802.11ax as Wi-Fi 3"
      },
      {
        "choiceIndex": 1,
        "explanation": "Wi-Fi 4 is 802.11n — 802.11ax is two generations newer (Wi-Fi 6).",
        "misconceptionTested": "Mapping 802.11ax to Wi-Fi 4 (802.11n)"
      },
      {
        "choiceIndex": 2,
        "explanation": "Wi-Fi 5 is 802.11ac — 802.11ax is Wi-Fi 6 with OFDMA and target wake time improvements.",
        "misconceptionTested": "Confusing 802.11ac Wi-Fi 5 with 802.11ax"
      }
    ],
    "examTip": "802.11 naming: **n=Wi-Fi 4**, **ac=Wi-Fi 5**, **ax=Wi-Fi 6**."
  },
  '1.12-c-q2': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Type 2 (hosted) hypervisors install as an application on top of a host OS — e.g. VMware Workstation on Windows."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Bare-metal-only describes Type 1 hypervisors (ESXi, Hyper-V on server) — Type 2 runs on a host operating system.",
        "misconceptionTested": "Labeling Type 2 as bare-metal hypervisor"
      },
      {
        "choiceIndex": 2,
        "explanation": "Containers are not hypervisors — Type 2 hypervisors run VMs as guest OS instances above the host OS.",
        "misconceptionTested": "Placing Type 2 hypervisor inside a container only"
      },
      {
        "choiceIndex": 3,
        "explanation": "Type 2 hypervisors exist to run VMs — they require a host OS and create virtual machines on top of it.",
        "misconceptionTested": "Believing Type 2 hypervisors run without VMs"
      }
    ],
    "examTip": "Type 1 = **bare metal**; Type 2 = **hosted on a desktop/server OS**."
  },
  'obj-3.5-depth-q2': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Default HSRP timers are hello 3 seconds and hold 10 seconds — three missed hellos trigger active/standby failover."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "1 s / 3 s is too aggressive for default HSRP — Cisco default is hello 3 s, hold 10 s.",
        "misconceptionTested": "Using sub-second default HSRP timers"
      },
      {
        "choiceIndex": 2,
        "explanation": "5 s / 15 s is not the default pair — memorize **3 s hello, 10 s hold** for stock HSRP.",
        "misconceptionTested": "Selecting 5/15 as default HSRP timers"
      },
      {
        "choiceIndex": 3,
        "explanation": "10 s / 30 s would slow failover significantly — default hold is 10 s, not 30 s.",
        "misconceptionTested": "Confusing extended timers with HSRP defaults"
      }
    ],
    "examTip": "HSRP defaults: **hello 3 s**, **hold 10 s** (≈3 missed hellos)."
  },
  'obj-3.5-depth-q5': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "HSRP is Cisco-proprietary — VRRP (RFC 5798) is the open IEEE-standard first-hop redundancy protocol."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "VRRP is the vendor-neutral standard — HSRP is Cisco-only.",
        "misconceptionTested": "Naming VRRP as Cisco proprietary"
      },
      {
        "choiceIndex": 2,
        "explanation": "GLBP is also Cisco-proprietary — the question asks which is not IEEE/VRRP; HSRP fits that proprietary slot.",
        "misconceptionTested": "Mischaracterizing GLBP multivendor availability"
      },
      {
        "choiceIndex": 3,
        "explanation": "Proxy ARP answers ARP on behalf of remote subnets — it is not a first-hop redundancy protocol like HSRP/VRRP.",
        "misconceptionTested": "Listing proxy ARP as an FHRP"
      }
    ],
    "examTip": "FHRP brands: **HSRP/GLBP = Cisco**; **VRRP = open standard**."
  },
  'obj-3.1-source-q002': {
    "correct": {
      "choiceIndex": 2,
      "explanation": "In `[110/20]`, the value after the slash is the routing protocol **metric** (20 for OSPF cost here) — AD is before the slash."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Administrative distance is the first number inside the brackets (**110** for OSPF) — the post-slash value is metric.",
        "misconceptionTested": "Reading post-slash value as administrative distance"
      },
      {
        "choiceIndex": 1,
        "explanation": "The leading route code (**O**) identifies the protocol — the bracketed numbers are AD and metric, not protocol ID.",
        "misconceptionTested": "Interpreting bracket digits as protocol identifier"
      },
      {
        "choiceIndex": 3,
        "explanation": "Route position in the table is not encoded in `[AD/metric]` — that tuple is trust and cost for the prefix.",
        "misconceptionTested": "Treating bracket values as table row index"
      }
    ],
    "examTip": "`show ip route` brackets: **[AD / metric]** — slash separates trust from protocol cost."
  },
  'obj-3.1-source-q009': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "A manually configured static route has default administrative distance **1** — more trusted than dynamic protocols except connected (0)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "AD 0 is reserved for directly connected networks — static routes default to 1.",
        "misconceptionTested": "Assigning connected AD to static routes"
      },
      {
        "choiceIndex": 2,
        "explanation": "AD 2 is not the static default — Cisco static routes use AD 1 unless overridden.",
        "misconceptionTested": "Selecting AD 2 for static routes"
      },
      {
        "choiceIndex": 3,
        "explanation": "AD 255 marks an unusable route — static defaults to 1, the most trusted non-connected source.",
        "misconceptionTested": "Believing static routes use AD 255"
      }
    ],
    "examTip": "Static route default **AD = 1**; connected = **0**; EIGRP internal = **90**; OSPF = **110**; RIP = **120**."
  },
  'obj-3.1-source-q010': {
    "correct": {
      "choiceIndex": 3,
      "explanation": "RIP (v1/v2) uses administrative distance **120** — less preferred than OSPF (110) or EIGRP (90)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "AD 90 belongs to internal EIGRP — RIP is 120.",
        "misconceptionTested": "Confusing EIGRP AD with RIP"
      },
      {
        "choiceIndex": 1,
        "explanation": "AD 100 is not RIP — it is not a standard Cisco AD for these common IGPs.",
        "misconceptionTested": "Selecting nonstandard AD 100 for RIP"
      },
      {
        "choiceIndex": 2,
        "explanation": "AD 110 is OSPF — RIP sits lower in the trust order at 120.",
        "misconceptionTested": "Assigning OSPF AD to RIP"
      }
    ],
    "examTip": "Memorize the ladder: **connected 0 → static 1 → EIGRP 90 → OSPF 110 → RIP 120**."
  },
  'obj-3.1-source-q012': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Directly connected routes have administrative distance **0** — the most trusted source in the routing table."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "AD 1 is the default for static routes — connected interfaces are more trusted at 0.",
        "misconceptionTested": "Equating connected AD with static route AD"
      },
      {
        "choiceIndex": 2,
        "explanation": "AD 5 is not used for connected routes on Cisco IOS — connected is always 0.",
        "misconceptionTested": "Inventing AD 5 for connected networks"
      },
      {
        "choiceIndex": 3,
        "explanation": "Connected networks absolutely have an AD — it is 0, the lowest (best) value.",
        "misconceptionTested": "Believing connected routes lack administrative distance"
      }
    ],
    "examTip": "Connected = **AD 0** — always wins over static or dynamic unless overridden by policy."
  },
  'obj-3.1-source-q013': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Internal EIGRP routes use administrative distance **90** — more trusted than OSPF (110) and RIP (120)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "AD 100 is not internal EIGRP — EIGRP summary/external routes may differ, but internal is 90.",
        "misconceptionTested": "Selecting AD 100 for internal EIGRP"
      },
      {
        "choiceIndex": 2,
        "explanation": "AD 110 is OSPF — internal EIGRP is more trusted at 90.",
        "misconceptionTested": "Assigning OSPF AD to EIGRP"
      },
      {
        "choiceIndex": 3,
        "explanation": "AD 120 is RIP — EIGRP internal routes are preferred at 90.",
        "misconceptionTested": "Confusing RIP AD with EIGRP"
      }
    ],
    "examTip": "EIGRP internal **AD 90**; external/summary EIGRP routes use **170** — know both."
  },
  'obj-3.1-source-q017': {
    "correct": {
      "choiceIndex": 2,
      "explanation": "When multiple protocols advertise the same prefix, the router installs the route with the **lowest administrative distance** — metric breaks ties only within one protocol."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Lower AD wins, not higher — highest AD would be least trusted and discarded first.",
        "misconceptionTested": "Choosing highest AD across protocols"
      },
      {
        "choiceIndex": 1,
        "explanation": "Lowest metric applies after AD selects the protocol — cross-protocol decisions use AD first.",
        "misconceptionTested": "Comparing metrics before administrative distance"
      },
      {
        "choiceIndex": 3,
        "explanation": "Highest metric is worst within a protocol — cross-protocol selection is AD-driven, not highest metric.",
        "misconceptionTested": "Selecting highest metric across protocols"
      }
    ],
    "examTip": "Cross-protocol tie: **lowest AD** wins; **metric** only compares routes from the **same** protocol."
  },
  'obj-6.1-depth-q1': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Automation delivers repeatable, API/template-driven changes faster than manual per-device CLI — reducing copy-paste errors at scale."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Automation still requires IP addressing plans — it does not eliminate subnets or host assignments.",
        "misconceptionTested": "Expecting automation to remove IP addressing"
      },
      {
        "choiceIndex": 2,
        "explanation": "Routing protocols still run in automated networks — automation changes how config is deployed, not whether OSPF/EIGRP exist.",
        "misconceptionTested": "Believing automation removes dynamic routing"
      },
      {
        "choiceIndex": 3,
        "explanation": "Drift can still occur without governance — automation improves consistency but does not guarantee zero drift forever.",
        "misconceptionTested": "Assuming automation permanently eliminates config drift"
      }
    ],
    "examTip": "Automation value = **repeatable, scalable changes** with fewer manual CLI mistakes."
  },
  'obj-6.2-depth-q1': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Traditional networks distribute control plane logic per device; SDN centralizes control in a controller while devices forward traffic."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Traditional control is distributed — each router/switch runs its own routing/switching control plane locally.",
        "misconceptionTested": "Believing traditional control is always centralized"
      },
      {
        "choiceIndex": 2,
        "explanation": "SDN separates control from data plane — it does not remove forwarding hardware from switches.",
        "misconceptionTested": "Thinking SDN eliminates the data plane on switches"
      },
      {
        "choiceIndex": 3,
        "explanation": "Traditional devices absolutely have CLI — SDN adds programmatic control, not the absence of CLI.",
        "misconceptionTested": "Claiming traditional networks lack CLI"
      }
    ],
    "examTip": "SDN split: **centralized control** + **distributed data plane** on devices."
  },
  'obj-6.2-depth-q2': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "The data plane stays distributed on network devices — ASICs and forwarding tables still switch/route packets locally."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Forwarding is not cloud-only — switches and routers still perform line-rate data-plane work on premises.",
        "misconceptionTested": "Restricting SDN data plane to cloud only"
      },
      {
        "choiceIndex": 2,
        "explanation": "Removing the data plane entirely would stop packet forwarding — SDN only centralizes control decisions.",
        "misconceptionTested": "Believing SDN removes all local forwarding"
      },
      {
        "choiceIndex": 3,
        "explanation": "Laptops are not the data plane — switches/routers forward traffic; the controller programs them.",
        "misconceptionTested": "Placing data plane only on end-user laptops"
      }
    ],
    "examTip": "Data plane = **local forwarding** on switches/routers; controller = **policy brain**."
  },
  'obj-6.3-depth-q1': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Northbound APIs face applications and orchestration tools above the controller — business intent flows downward through the controller."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Controller-to-switch communication is **southbound** — northbound is apps/orchestration to the controller.",
        "misconceptionTested": "Reversing northbound and southbound direction"
      },
      {
        "choiceIndex": 2,
        "explanation": "AP-to-WLC is wireless control/management — SDN northbound is between apps and the network controller.",
        "misconceptionTested": "Mapping CAPWAP AP-WLC link to northbound API"
      },
      {
        "choiceIndex": 3,
        "explanation": "DHCP client-server is an infrastructure service — northbound APIs are programmatic interfaces into the SDN controller.",
        "misconceptionTested": "Equating DHCP with northbound API"
      }
    ],
    "examTip": "Northbound = **apps → controller**; southbound = **controller → devices**."
  },
  'obj-6.3-depth-q2': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Southbound APIs connect the controller to infrastructure — NETCONF, OpenFlow, CLI, or SNMP to program forwarding devices."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Apps-to-controller is northbound — southbound pushes policy down to switches and routers.",
        "misconceptionTested": "Labeling app-controller link as southbound"
      },
      {
        "choiceIndex": 2,
        "explanation": "Browser-to-user is not an SDN southbound API — southbound targets network elements from the controller.",
        "misconceptionTested": "Confusing user web session with southbound API"
      },
      {
        "choiceIndex": 3,
        "explanation": "DNS client resolution is unrelated — southbound is controller-to-device programmability.",
        "misconceptionTested": "Naming DNS client flow as southbound API"
      }
    ],
    "examTip": "Southbound examples: **NETCONF**, **OpenFlow**, **CLI** from controller to gear."
  },
  'obj-6.4-depth-q2': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Intent-based networking lets engineers declare the desired outcome (policy, segmentation, connectivity) — DNA Center translates intent into device configuration."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Manual box-by-box CLI is the opposite of intent-based automation — DNA maps business intent to templates and policies.",
        "misconceptionTested": "Defining intent-based as manual per-device CLI"
      },
      {
        "choiceIndex": 2,
        "explanation": "Templates enable intent translation — disabling them would block automated provisioning.",
        "misconceptionTested": "Believing intent-based networking disables templates"
      },
      {
        "choiceIndex": 3,
        "explanation": "Telnet is insecure and not a DNA design goal — intent-based uses APIs and secure management.",
        "misconceptionTested": "Associating intent-based networking with Telnet preference"
      }
    ],
    "examTip": "DNA intent = state **what you want**; controller figures out **device config**."
  },
  'obj-6.5-depth-q2': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "HTTP GET retrieves a representation of a resource — read-only, safe, and idempotent in REST design."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Creating resources is typically POST (or PUT with a known URI) — GET must not create side effects.",
        "misconceptionTested": "Using GET to create resources"
      },
      {
        "choiceIndex": 2,
        "explanation": "DELETE removes a resource — GET only reads existing data.",
        "misconceptionTested": "Expecting GET to delete data"
      },
      {
        "choiceIndex": 3,
        "explanation": "Credentials belong in headers or token flows — GET should not be described as always sending passwords in the URL/body.",
        "misconceptionTested": "Believing GET always transmits passwords"
      }
    ],
    "examTip": "REST verbs: **GET = read** (safe/idempotent); **POST = create** (may repeat side effects)."
  },
  'obj-6.5-depth-q6': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "GET, PUT, and DELETE are idempotent — repeating the same request should not change state beyond the first effect; POST may create duplicates."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "POST is **not** idempotent — submitting the same POST twice can create two resources.",
        "misconceptionTested": "Calling POST idempotent"
      },
      {
        "choiceIndex": 2,
        "explanation": "POST differs from GET/PUT/DELETE — not all HTTP methods share idempotency.",
        "misconceptionTested": "Treating every HTTP method as equally idempotent"
      },
      {
        "choiceIndex": 3,
        "explanation": "Several methods are idempotent by REST convention — GET/PUT/DELETE qualify; POST does not.",
        "misconceptionTested": "Denying idempotency for any HTTP method"
      }
    ],
    "examTip": "Idempotent: **GET, PUT, DELETE** — safe to retry; **POST** can duplicate creates."
  },
  'obj-6.6-depth-q2': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Ansible is agentless — the control node connects over SSH or NETCONF to push modules/playbooks without installing a permanent agent on devices."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Ansible deliberately avoids mandatory per-device agents — it uses SSH/NETCONF from the control node.",
        "misconceptionTested": "Expecting a required Ansible agent on each router"
      },
      {
        "choiceIndex": 2,
        "explanation": "Telnet is insecure and not Ansible’s primary transport — SSH/NETCONF are standard.",
        "misconceptionTested": "Believing Ansible uses only Telnet"
      },
      {
        "choiceIndex": 3,
        "explanation": "CDP is a Layer 2 discovery protocol — Ansible automation uses SSH/API modules, not CDP updates.",
        "misconceptionTested": "Linking Ansible management to CDP"
      }
    ],
    "examTip": "Ansible = **agentless** automation via **SSH/NETCONF** from the control node."
  },
}
