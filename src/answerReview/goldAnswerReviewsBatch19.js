/** Gold reviews — Batch 19: FHRP 3.5 q14+, REST APIs 6.5, config mgmt 6.6, L2 security 5.7, CDP 2.3. */
export const BATCH19_GOLD = {
  'obj-3.5-source-q014':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "The **active virtual gateway (AVG)** answers ARP for the VIP with a **virtual forwarder (AVF) MAC** \u2014 GLBP load-balances by handing out different forwarder MACs."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Active router** is HSRP terminology \u2014 GLBP uses **AVG/AVF** roles, not active/standby.",
        "misconceptionTested": "HSRP active router role applied to GLBP"
      },
      {
        "choiceIndex": 1,
        "explanation": "The AVG does not return the **physical router MAC** \u2014 it returns an **AVF virtual MAC** for load sharing.",
        "misconceptionTested": "Physical router MAC as GLBP ARP response"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Tracking requests** adjust priority \u2014 ARP responses come from the **AVG with AVF MACs**.",
        "misconceptionTested": "Virtual router tracking as GLBP ARP handler"
      }
    ],
    "examTip": "GLBP roles: **AVG** (VIP/ARP) + **AVF** (forwards) \u2014 not HSRP active/standby."
  },
  'obj-3.5-source-q015':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "The **AVG** is the router with the **highest priority**; ties break to the **highest IP address** on the interface."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Lowest priority** loses the AVG election \u2014 GLBP picks the **highest** priority.",
        "misconceptionTested": "Lowest priority wins GLBP AVG"
      },
      {
        "choiceIndex": 1,
        "explanation": "Highest priority alone is incomplete \u2014 Cisco breaks ties with the **highest IP address**.",
        "misconceptionTested": "Priority-only AVG election without IP tie-break"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Lowest priority and lowest IP** is the opposite of GLBP AVG election rules.",
        "misconceptionTested": "Lowest priority and IP as AVG winner"
      }
    ],
    "examTip": "GLBP AVG election: **highest priority** \u2192 tie = **highest IP**."
  },
  'obj-3.5-source-q016':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "GLBP supports up to **4 active virtual forwarders (AVFs)** per group for load balancing."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**2** AVFs is below the GLBP maximum \u2014 Cisco allows **4** forwarders per group.",
        "misconceptionTested": "Two AVFs as GLBP maximum"
      },
      {
        "choiceIndex": 2,
        "explanation": "**16** exceeds the standard GLBP AVF limit \u2014 the keyed maximum is **4**.",
        "misconceptionTested": "Sixteen AVFs as GLBP group max"
      },
      {
        "choiceIndex": 3,
        "explanation": "**1,024** is far above the GLBP AVF ceiling \u2014 memorize **4 AVFs** per group.",
        "misconceptionTested": "1024 AVFs as GLBP limit"
      }
    ],
    "examTip": "GLBP load share: up to **4 AVFs** + 1 AVG per group."
  },
  'obj-3.5-source-q017':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Raise HSRP priority above peers with **`standby <group> priority <value>`** under the interface \u2014 e.g., **150** beats default **100**."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Priority **70** is below the default **100** \u2014 it would not win active router election.",
        "misconceptionTested": "Sub-default priority to become active"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`hsrp`** is not valid IOS syntax \u2014 HSRP uses the **`standby`** interface command.",
        "misconceptionTested": "hsrp keyword instead of standby"
      },
      {
        "choiceIndex": 3,
        "explanation": "Both wrong syntax (**hsrp**) and low priority (**90**) \u2014 use **`standby 1 priority 150`**.",
        "misconceptionTested": "hsrp command with insufficient priority"
      }
    ],
    "examTip": "HSRP priority: default **100**, higher wins \u2014 syntax is **`standby <n> priority <n>`**."
  },
  'obj-3.5-source-q018':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "HSRPv2 supports up to **4,096 groups** \u2014 a major increase over HSRPv1's **256**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**255** is the HSRPv1 group-number ceiling \u2014 HSRPv2 raises the limit to **4,096**.",
        "misconceptionTested": "HSRPv1 max groups as HSRPv2 answer"
      },
      {
        "choiceIndex": 1,
        "explanation": "**256** is the HSRPv1 maximum \u2014 HSRPv2 allows **4,096** groups.",
        "misconceptionTested": "256 as HSRPv2 group max"
      },
      {
        "choiceIndex": 2,
        "explanation": "**1,024** is still below the HSRPv2 maximum \u2014 the keyed answer is **4,096**.",
        "misconceptionTested": "1024 as HSRPv2 group max"
      }
    ],
    "examTip": "HSRP group limits: **v1 = 256** (0\u2013255) | **v2 = 4096**."
  },
  'obj-3.5-source-q019':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "MAC **0000.0c9f.fXXX** uses the HSRPv2 OUI **0000.0c9f.f** \u2014 v1 used **0000.0c07.acXX**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "HSRPv1 virtual MAC starts **0000.0c07.ac** \u2014 **0000.0c9f.f** indicates **HSRPv2**.",
        "misconceptionTested": "HSRPv1 MAC OUI for 0000.0c9f.f address"
      },
      {
        "choiceIndex": 1,
        "explanation": "GLBP uses **0007.b400** OUI \u2014 **0000.0c9f.f** is the **HSRPv2** virtual MAC prefix.",
        "misconceptionTested": "GLBP MAC OUI for HSRPv2 address"
      },
      {
        "choiceIndex": 3,
        "explanation": "VRRP virtual MAC is **0000.5e00.01XX** \u2014 **0000.0c9f.f** is Cisco **HSRPv2**.",
        "misconceptionTested": "VRRP MAC for HSRPv2 OUI"
      }
    ],
    "examTip": "FHRP MAC prefixes: **HSRPv1 0000.0c07.ac** | **HSRPv2 0000.0c9f.f** | **GLBP 0007.b400** | **VRRP 0000.5e00.01**."
  },
  'obj-3.5-source-q020':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**Preemption** lets a higher-priority router **take over active role** when it comes online \u2014 without it, the incumbent stays active."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Per-packet load balancing is **GLBP** \u2014 preemption governs **active-router re-election**.",
        "misconceptionTested": "Preemption as load-balancing feature"
      },
      {
        "choiceIndex": 1,
        "explanation": "Watching upstream interfaces is **HSRP tracking** \u2014 preemption is about **priority-based takeover**.",
        "misconceptionTested": "Interface tracking as preemption definition"
      },
      {
        "choiceIndex": 2,
        "explanation": "HSRP elects by **priority first**, IP as tiebreaker \u2014 preemption respects priority, it does not ignore it.",
        "misconceptionTested": "Preemption ignores priority for IP-only election"
      }
    ],
    "examTip": "Enable preemption: **`standby <n> preempt`** \u2014 higher priority router can reclaim active role."
  },
  'obj-3.5-source-q021':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Spread active load by using **one HSRP group per VLAN** and **alternating priorities above 100** so different routers are active per VLAN."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "HSRPv2 adds features but does not **load-balance** \u2014 use **multiple groups with staggered priorities**.",
        "misconceptionTested": "HSRPv2 alone as load-balancing method"
      },
      {
        "choiceIndex": 2,
        "explanation": "**PPPoE** is WAN dial/encapsulation \u2014 it does not distribute HSRP active roles.",
        "misconceptionTested": "PPPoE as HSRP load distribution"
      },
      {
        "choiceIndex": 3,
        "explanation": "Only **one router is active** per HSRP group \u2014 you cannot make all routers active in the same group.",
        "misconceptionTested": "All routers active in one HSRP group"
      }
    ],
    "examTip": "HSRP load spread trick: **per-VLAN groups** + **alternating priorities**; true LB \u2192 **GLBP**."
  },
  'obj-3.5-source-q022':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**`show standby`** displays HSRP group state, active/standby roles, timers, and virtual IP on the router."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`show hsrp`** is not valid IOS \u2014 the verification command is **`show standby`**.",
        "misconceptionTested": "show hsrp as valid verify command"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`show ip standby`** is not standard syntax \u2014 use **`show standby`** for HSRP state.",
        "misconceptionTested": "show ip standby as HSRP verify command"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`show ip hsrp`** is not a Cisco command \u2014 HSRP status is **`show standby`**.",
        "misconceptionTested": "show ip hsrp as verify command"
      }
    ],
    "examTip": "HSRP verify: **`show standby`** [brief | interface] \u2014 not `show hsrp`."
  },
  'obj-6.5-source-q002':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**SNMP** exposes a structured management interface (MIB/OIDs) similar to an API for polling device data programmatically."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**CLI** is human-oriented \u2014 SNMP is the structured **machine-readable** retrieval interface.",
        "misconceptionTested": "CLI as API-like retrieval interface"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Syslog** pushes log messages \u2014 it does not provide structured GET-style data retrieval like SNMP.",
        "misconceptionTested": "Syslog as API-like data retrieval"
      },
      {
        "choiceIndex": 3,
        "explanation": "**SSH** secures remote shell access \u2014 SNMP is the classic **poll/read API-like** management protocol.",
        "misconceptionTested": "SSH as structured retrieval API"
      }
    ],
    "examTip": "Legacy API-like mgmt: **SNMP GET/WALK**; modern: **REST/RESTCONF/NETCONF**."
  },
  'obj-6.5-source-q003':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**NETCONF** (RFC 6241) is the modern XML/RPC replacement for SNMP-style configuration and state retrieval."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**Syslog** sends events \u2014 it is not an SNMP replacement for structured device management.",
        "misconceptionTested": "Syslog as SNMP replacement"
      },
      {
        "choiceIndex": 2,
        "explanation": "**REST** is an architectural style \u2014 **NETCONF** is the IETF protocol positioned to replace SNMP.",
        "misconceptionTested": "Generic REST as SNMP replacement protocol"
      },
      {
        "choiceIndex": 3,
        "explanation": "**SSH** provides secure transport \u2014 **NETCONF** is the management protocol built for automation.",
        "misconceptionTested": "SSH alone as SNMP replacement"
      }
    ],
    "examTip": "SNMP successor stack: **NETCONF** + **YANG** (+ **RESTCONF** over HTTPS)."
  },
  'obj-6.5-source-q004':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**NETCONF** uses **YANG** data models to define configuration and operational state in a structured tree."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**REST** may carry JSON/XML but **YANG** is the standard data model paired with **NETCONF/RESTCONF**.",
        "misconceptionTested": "REST as YANG-carrying protocol"
      },
      {
        "choiceIndex": 2,
        "explanation": "**SNMP** uses **MIB/OIDs**, not YANG \u2014 YANG pairs with **NETCONF**.",
        "misconceptionTested": "SNMP as YANG protocol"
      },
      {
        "choiceIndex": 3,
        "explanation": "**YAML** is a file format for playbooks \u2014 **YANG** is the modeled schema for NETCONF.",
        "misconceptionTested": "YAML as YANG data model protocol"
      }
    ],
    "examTip": "YANG = **data model language**; transported by **NETCONF** (XML) or **RESTCONF** (HTTP/JSON)."
  },
  'obj-6.5-source-q005':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**RESTCONF** uses **HTTPS** with REST verbs to configure and read YANG-modeled data on network devices."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**NETCONF** typically runs over **SSH** (XML RPC) \u2014 HTTPS REST is **RESTCONF**.",
        "misconceptionTested": "NETCONF as HTTPS REST protocol"
      },
      {
        "choiceIndex": 2,
        "explanation": "**SNMP** uses UDP 161/162 \u2014 programmatic HTTPS config is **RESTCONF**.",
        "misconceptionTested": "SNMP as HTTPS config protocol"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Syslog** is UDP 514 logging \u2014 not an HTTPS configuration API.",
        "misconceptionTested": "Syslog as HTTPS config protocol"
      }
    ],
    "examTip": "HTTPS + YANG + REST verbs \u2192 **RESTCONF**; SSH + XML RPC \u2192 **NETCONF**."
  },
  'obj-6.5-source-q006':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "REST APIs operate over **HTTP/HTTPS** \u2014 resources are addressed with URLs and manipulated with HTTP verbs."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**SNMP** is UDP-based polling \u2014 REST rides on **HTTP**.",
        "misconceptionTested": "SNMP as REST transport"
      },
      {
        "choiceIndex": 2,
        "explanation": "**SNTP** is time sync \u2014 REST uses **HTTP** as its application protocol.",
        "misconceptionTested": "SNTP as REST protocol"
      },
      {
        "choiceIndex": 3,
        "explanation": "**SOAP** is a different web-service style \u2014 CCNA REST APIs use **HTTP**, not SOAP envelopes.",
        "misconceptionTested": "SOAP as default REST protocol"
      }
    ],
    "examTip": "REST on CCNA = **HTTP/HTTPS** + verbs (GET/POST/PUT/PATCH/DELETE) + status codes."
  },
  'obj-6.6-source-q002':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**Ansible** playbooks and inventory files are written in human-readable **YAML**."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**DNA Center** is a controller platform \u2014 it is not the YAML-based config-mgmt tool in the stem.",
        "misconceptionTested": "DNA Center as YAML config tool"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Chef** recipes use **Ruby** \u2014 YAML playbooks are **Ansible's** format.",
        "misconceptionTested": "Chef as YAML-based tool"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Puppet** manifests use a **Puppet DSL** \u2014 **Ansible** stores config in **YAML**.",
        "misconceptionTested": "Puppet as YAML config store"
      }
    ],
    "examTip": "Config formats: **Ansible = YAML** | **Chef = Ruby recipes** | **Puppet = manifest DSL**."
  },
  'obj-6.6-source-q003':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "The **inventory** file lists managed hosts, groups, and connection variables \u2014 Ansible needs it to know **where** to connect."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "A **playbook** defines **tasks** to run \u2014 connection targets come from the **inventory**.",
        "misconceptionTested": "Playbook as connection definition"
      },
      {
        "choiceIndex": 1,
        "explanation": "**Settings** (ansible.cfg) tune defaults \u2014 host connection info lives in **inventory**.",
        "misconceptionTested": "Settings file as host connection list"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Modules** perform actions \u2014 the **inventory** supplies the host list and connection params.",
        "misconceptionTested": "Modules as connection inventory"
      }
    ],
    "examTip": "Ansible flow: **inventory** (hosts) \u2192 **playbook** (tasks) \u2192 **modules** (actions)."
  },
  'obj-6.6-source-q004':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**Ansible** is **agentless** \u2014 it pushes config over SSH/NETCONF without installing a persistent agent on targets."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**Puppet** requires a **Puppet agent** on managed nodes \u2014 not agentless.",
        "misconceptionTested": "Puppet as agentless tool"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Chef** uses a **Chef client agent** on each node \u2014 Ansible does not.",
        "misconceptionTested": "Chef as agentless tool"
      },
      {
        "choiceIndex": 3,
        "explanation": "**DNA Center** is a management platform \u2014 the agentless config tool here is **Ansible**.",
        "misconceptionTested": "DNA Center as agentless config answer"
      }
    ],
    "examTip": "Agentless \u2192 **Ansible**; agent-based \u2192 **Chef/Puppet** clients on nodes."
  },
  'obj-6.6-source-q005':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "A Puppet **manifest** (.pp) declares the **desired configuration** for managed hosts."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "The **agent** enforces policy \u2014 the **manifest** holds the configuration declarations.",
        "misconceptionTested": "Puppet agent as config container"
      },
      {
        "choiceIndex": 2,
        "explanation": "A **class** groups resources inside a manifest \u2014 the top-level config file type is **manifest**.",
        "misconceptionTested": "Class as primary Puppet config file"
      },
      {
        "choiceIndex": 3,
        "explanation": "A **module** bundles manifests/templates \u2014 individual host config is declared in **manifests**.",
        "misconceptionTested": "Module as manifest equivalent"
      }
    ],
    "examTip": "Puppet: **manifest** = desired state | **module** = reusable bundle | **agent** = enforcer."
  },
  'obj-6.6-source-q006':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "A Chef **recipe** is the instruction set that configures a node \u2014 recipes live inside **cookbooks**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "A **cookbook** **contains** recipes \u2014 the step-by-step instructions themselves are **recipes**.",
        "misconceptionTested": "Cookbook as instruction set vs container"
      },
      {
        "choiceIndex": 1,
        "explanation": "**Crock Pot** is a distractor \u2014 Chef uses **recipes** for node configuration steps.",
        "misconceptionTested": "Crock Pot as Chef component"
      },
      {
        "choiceIndex": 3,
        "explanation": "A **Chef node** is the managed device \u2014 configuration instructions are **recipes**.",
        "misconceptionTested": "Chef node as instruction container"
      }
    ],
    "examTip": "Chef hierarchy: **cookbook** \u2192 **recipes** \u2192 applied by **chef-client** on nodes."
  },
  'obj-5.7-source-q003':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Mark an uplink as trusted with **`ip dhcp snooping trust`** under the **interface** \u2014 DHCP servers/offers are allowed on trusted ports."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Missing **`ip`** keyword \u2014 correct syntax is **`ip dhcp snooping trust`**.",
        "misconceptionTested": "dhcp snooping trust without ip keyword"
      },
      {
        "choiceIndex": 2,
        "explanation": "Trust is an **interface-level** command \u2014 not configured from global config with interface keyword appended.",
        "misconceptionTested": "Global config trust syntax"
      },
      {
        "choiceIndex": 3,
        "explanation": "Omitting **`snooping`** \u2014 the command is **`ip dhcp snooping trust`**, not `ip dhcp trust`.",
        "misconceptionTested": "ip dhcp trust without snooping"
      }
    ],
    "examTip": "DHCP snooping: **untrusted** access ports (clients) | **trusted** uplinks toward real DHCP servers."
  },
  'obj-5.7-source-q005':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Port security** limits/learns MAC addresses on an access port \u2014 blocking rogue **WAPs** plugged into the wall jack."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Dynamic VLANs** assign VLAN membership \u2014 they do not stop unauthorized devices on a fixed access port.",
        "misconceptionTested": "Dynamic VLAN as rogue AP prevention"
      },
      {
        "choiceIndex": 2,
        "explanation": "**ACLs** filter traffic \u2014 they do not prevent a new **L2 device** from connecting at the port.",
        "misconceptionTested": "ACL as port device restriction"
      },
      {
        "choiceIndex": 3,
        "explanation": "**VLAN pruning** limits trunk VLANs \u2014 it does not secure an **access port** against rogue gear.",
        "misconceptionTested": "VLAN pruning as access-port security"
      }
    ],
    "examTip": "Rogue device on access port \u2192 **port security** (MAC limit/sticky/learned)."
  },
  'obj-5.7-source-q006':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Port security** restricts which **source MAC addresses** may use a switch port \u2014 stopping unauthorized WAPs."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**ACLs** operate at Layer 3/4 \u2014 port-level device restriction is **port security**.",
        "misconceptionTested": "ACL as L2 device restriction"
      },
      {
        "choiceIndex": 2,
        "explanation": "**WEP** is a wireless encryption standard \u2014 wired port restriction uses **port security**.",
        "misconceptionTested": "WEP as wired port security"
      },
      {
        "choiceIndex": 3,
        "explanation": "Static MAC table entries alone are manual \u2014 **port security** automates restrict/learn/violation actions.",
        "misconceptionTested": "Static CAM entry as port security feature"
      }
    ],
    "examTip": "Port security = **Layer 2**, **source MAC** limit, violation modes (protect/restrict/shutdown)."
  },
  'obj-5.7-source-q009':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Default **`switchport port-security`** allows **1 MAC address** until you raise **`switchport port-security maximum`**."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**2 MACs** is not the default \u2014 Cisco defaults to **1** secure MAC per port.",
        "misconceptionTested": "Two MACs as port-security default"
      },
      {
        "choiceIndex": 2,
        "explanation": "**0 MACs** would block all traffic \u2014 default is **1** learned/secure MAC.",
        "misconceptionTested": "Zero MACs as default maximum"
      },
      {
        "choiceIndex": 3,
        "explanation": "**10 MACs** requires explicit config \u2014 default maximum is **1**.",
        "misconceptionTested": "Ten MACs as port-security default"
      }
    ],
    "examTip": "Port-security defaults: **max 1 MAC**, violation **shutdown**, sticky off until configured."
  },
  'obj-5.7-source-q010':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Port security operates at **Layer 2** \u2014 it inspects **source MAC addresses** on Ethernet frames."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Layer 0** is not an OSI layer used for port security \u2014 the feature is **Layer 2**.",
        "misconceptionTested": "Layer 0 as port security layer"
      },
      {
        "choiceIndex": 1,
        "explanation": "**Layer 1** is physical signaling \u2014 MAC learning/filtering is **Layer 2**.",
        "misconceptionTested": "Layer 1 as port security layer"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Layer 3** uses IP addresses \u2014 port security filters **MAC addresses at L2**.",
        "misconceptionTested": "Layer 3 as port security layer"
      }
    ],
    "examTip": "Port security = **L2 MAC** control; ACLs = **L3/L4** filtering."
  },
  'obj-2.3-source-q015':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**`show cdp interface`** lists interfaces where **CDP is enabled** and their CDP parameters."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`show cdp`** displays **neighbor details** \u2014 interface CDP status uses **`show cdp interface`**.",
        "misconceptionTested": "show cdp as interface CDP status command"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`show interface`** gives L1/L2 stats \u2014 CDP-specific interface info is **`show cdp interface`**.",
        "misconceptionTested": "Generic show interface for CDP advertising"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`show interface cdp`** reverses the keywords \u2014 correct syntax is **`show cdp interface`**.",
        "misconceptionTested": "Reversed show interface cdp syntax"
      }
    ],
    "examTip": "CDP verify: **`show cdp neighbors`** (who) | **`show cdp interface`** (which ports run CDP)."
  },
}
