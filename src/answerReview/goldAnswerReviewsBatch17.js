/** Gold reviews — Batch 17: HSRP 3.5, ACL 5.5, port security 5.6, QoS 4.7, VPN 5.10, automation 6.1, SDN 6.3, EtherChannel 2.4, DHCP 4.3, OSPF 3.4. */
export const BATCH17_GOLD = {
  'obj-3.5-source-q004':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "In HSRP v1 virtual MAC **0000.0c07.ac01**, the last byte **01** is the group number in hex (group 1)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**0000.0c** is the Cisco HSRP OUI \u2014 not the group number field at the end of the MAC.",
        "misconceptionTested": "OUI prefix as HSRP group number"
      },
      {
        "choiceIndex": 1,
        "explanation": "**0c07** spans OUI and HSRP ID bytes \u2014 the group is the final octet **01**.",
        "misconceptionTested": "Mid-MAC bytes as group number"
      },
      {
        "choiceIndex": 3,
        "explanation": "**07.ac** is the well-known HSRP ID field \u2014 group number is the trailing byte **01**.",
        "misconceptionTested": "HSRP ID field as group number"
      }
    ],
    "examTip": "HSRP v1 MAC **0000.0c07.acXX** \u2014 **XX** (last byte) = group number in hex."
  },
  'obj-3.5-source-q008':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "HSRP elects **one active router** per group \u2014 the standby takes over only if the active fails or priority/preemption dictates."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Only **one** router is active at a time \u2014 all routers being active describes GLBP load-sharing, not HSRP.",
        "misconceptionTested": "All HSRP routers active simultaneously"
      },
      {
        "choiceIndex": 2,
        "explanation": "Hello packets are sent by **HSRP group members** (active/standby), not by the abstract virtual router entity.",
        "misconceptionTested": "Virtual router as hello sender"
      },
      {
        "choiceIndex": 3,
        "explanation": "HSRP provides **one active gateway** \u2014 per-packet load balancing is **GLBP**, not HSRP.",
        "misconceptionTested": "HSRP as load-balancing FHRP"
      }
    ],
    "examTip": "HSRP = **one active** + standby; GLBP = load balancing across AVFs."
  },
  'obj-3.5-source-q011':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "The standby promotes when **hold timer** expires \u2014 meaning hellos from the active were missed for the hold interval."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Hello timer governs how often hellos are sent \u2014 **hold timer** expiry triggers failover.",
        "misconceptionTested": "Hello timer as failover trigger"
      },
      {
        "choiceIndex": 1,
        "explanation": "There is no separate **standby timer** \u2014 HSRP uses hello and **hold** timers.",
        "misconceptionTested": "Invented standby timer name"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Virtual timer** is not an HSRP timer \u2014 failover follows **hold timer** expiration.",
        "misconceptionTested": "Virtual timer as HSRP failover trigger"
      }
    ],
    "examTip": "HSRP timers: **hello** sends, **hold** expires \u2192 standby becomes active."
  },
  'obj-5.6-source-q003':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Extended ACLs use numbered range **100\u2013199** \u2014 they match source/destination, protocol, and ports."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**1\u201399** is the standard ACL range (source IP only) \u2014 extended lists start at **100**.",
        "misconceptionTested": "Standard range for extended ACL"
      },
      {
        "choiceIndex": 1,
        "explanation": "ACL ranges are not **1\u2013100** \u2014 extended ACLs are **100\u2013199**.",
        "misconceptionTested": "Off-by-one extended ACL range"
      },
      {
        "choiceIndex": 3,
        "explanation": "**100\u2013200** is wrong \u2014 the extended numbered range ends at **199**.",
        "misconceptionTested": "Extended range ending at 200"
      }
    ],
    "examTip": "Numbered ACLs: **1\u201399/1300\u20131999** standard; **100\u2013199/2000\u20132699** extended."
  },
  'obj-5.6-source-q012':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Extended ACLs** filter by protocol and port \u2014 required to block or permit a specific **application** like HTTP or SSH."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Standard ACLs match **source IP only** \u2014 they cannot filter by TCP/UDP port or application.",
        "misconceptionTested": "Standard ACL for port/application filter"
      },
      {
        "choiceIndex": 2,
        "explanation": "Dynamic ACLs use reflexive/temporary permits after auth \u2014 the stem asks for **application** filtering, which is extended.",
        "misconceptionTested": "Dynamic ACL for static app filter"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Expanded** is not an IOS ACL type \u2014 use **extended** ACLs for protocol/port matching.",
        "misconceptionTested": "Expanded as ACL type for applications"
      }
    ],
    "examTip": "Filter by **port/protocol** \u2192 **extended** ACL; source IP only \u2192 **standard**."
  },
  'obj-5.6-source-q024':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "Apply an ACL to filter **inbound** traffic with **`ip access-group 198 in`** under the interface."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`ip access-list 198 in` is invalid global syntax \u2014 ACLs attach with **`ip access-group`** on the interface.",
        "misconceptionTested": "Global ip access-list for interface filter"
      },
      {
        "choiceIndex": 1,
        "explanation": "`ip access-list 198 in` creates/edits the ACL \u2014 it does not **apply** it to the interface.",
        "misconceptionTested": "ACL definition command as apply command"
      },
      {
        "choiceIndex": 2,
        "explanation": "`ip access-class` restricts **VTY/management** logins \u2014 not data-plane filtering on a routed interface.",
        "misconceptionTested": "access-class for interface data filtering"
      }
    ],
    "examTip": "Filter traffic on an interface \u2192 **`ip access-group <num> in|out`** under `config-if`."
  },
  'obj-5.7-source-q008':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Enable port security on an **access interface** with **`switchport port-security`** in interface configuration mode."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Port security is an **interface** feature \u2014 `switchport port-security` under global config is invalid.",
        "misconceptionTested": "Global config for port security enable"
      },
      {
        "choiceIndex": 1,
        "explanation": "`port-security enable` is not valid IOS syntax \u2014 use **`switchport port-security`** on the interface.",
        "misconceptionTested": "Invented port-security enable command"
      },
      {
        "choiceIndex": 3,
        "explanation": "The command namespace is **`switchport port-security`**, not standalone `port-security enable`.",
        "misconceptionTested": "Wrong command prefix for port security"
      }
    ],
    "examTip": "Port security checklist: access mode \u2192 **`switchport port-security`** \u2192 set max/violation."
  },
  'obj-5.7-source-q014':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Default violation mode is **shutdown** \u2014 the port enters **err-disabled** when max secure MACs are exceeded."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Administrative shutdown is manual (`shutdown`) \u2014 violation shutdown is automatic **err-disable**.",
        "misconceptionTested": "Admin shutdown as default violation action"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Restrict** drops traffic and logs \u2014 it is not the factory default; default is **shutdown**.",
        "misconceptionTested": "Restrict as default violation mode"
      },
      {
        "choiceIndex": 3,
        "explanation": "Restrict-with-logging describes **restrict** mode \u2014 default violation puts port in **err-disabled**.",
        "misconceptionTested": "Restrict+logging as default action"
      }
    ],
    "examTip": "Default port-security violation = **shutdown** (err-disable); use **`errdisable recovery`** to auto-heal."
  },
  'obj-5.7-source-q017':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**`violation restrict`** drops unauthorized traffic, **logs** the event, but keeps the port **up** (unlike shutdown)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Shutdown** err-disables the port \u2014 the stem wants logging **without** disabling the interface.",
        "misconceptionTested": "Shutdown when restrict mode requested"
      },
      {
        "choiceIndex": 1,
        "explanation": "`switchport port-security restrict` is invalid syntax \u2014 the keyword is **`violation restrict`**.",
        "misconceptionTested": "Missing violation keyword in restrict command"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Protect** silently drops traffic with **no log** \u2014 restrict adds logging while staying up.",
        "misconceptionTested": "Protect mode when logging required"
      }
    ],
    "examTip": "Port-security violations: **shutdown** (err-disable) | **restrict** (drop+log) | **protect** (drop, no log)."
  },
  'obj-4.7-source-q005':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**EF (46)** is Expedited Forwarding \u2014 the highest-priority DSCP class for real-time traffic like VoIP."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**AF43** is Assured Forwarding class 4, drop probability 3 \u2014 lower priority than **EF**.",
        "misconceptionTested": "High AF class beats EF"
      },
      {
        "choiceIndex": 2,
        "explanation": "**AF11** is low Assured Forwarding \u2014 far below **EF (46)** in priority.",
        "misconceptionTested": "Low AF as highest priority"
      },
      {
        "choiceIndex": 3,
        "explanation": "**AF00 (CS0)** is best-effort default marking \u2014 **EF** is the premium queue class.",
        "misconceptionTested": "Best-effort DSCP as highest priority"
      }
    ],
    "examTip": "Voice/real-time marking \u2192 **EF (46)**; bulk data \u2192 AF classes; default \u2192 **0/BE**."
  },
  'obj-4.7-source-q007':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**LLQ (Low Latency Queuing)** gives a strict-priority queue that always drains before other CBWFQ classes."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**CBWFQ** provides weighted fair queues \u2014 LLQ adds a **strict priority** queue on top.",
        "misconceptionTested": "CBWFQ as strict priority scheduler"
      },
      {
        "choiceIndex": 2,
        "explanation": "**FIFO** has no priority classes \u2014 LLQ explicitly prioritizes delay-sensitive traffic.",
        "misconceptionTested": "FIFO as priority queuing"
      },
      {
        "choiceIndex": 3,
        "explanation": "**CIR** is a contracted rate metric \u2014 not a queuing scheduler with priority.",
        "misconceptionTested": "CIR as QoS queue type"
      }
    ],
    "examTip": "Strict priority for VoIP \u2192 **LLQ**; weighted sharing among classes \u2192 **CBWFQ**."
  },
  'obj-5.5-source-q003':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "GRE encapsulation uses IP protocol number **47** in the outer IP header."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Protocol **4** is IP-in-IP \u2014 GRE uses protocol **47**.",
        "misconceptionTested": "IP-in-IP protocol for GRE"
      },
      {
        "choiceIndex": 1,
        "explanation": "Protocol **43** is IPv6 routing header \u2014 GRE tunneling is **47**.",
        "misconceptionTested": "IPv6 routing header protocol for GRE"
      },
      {
        "choiceIndex": 3,
        "explanation": "Protocol **57** is SKIP \u2014 GRE's well-known number is **47**.",
        "misconceptionTested": "Protocol 57 as GRE"
      }
    ],
    "examTip": "GRE = IP proto **47**; ESP = **50**; AH = **51** \u2014 don't swap tunnel vs IPsec numbers."
  },
  'obj-5.5-source-q010':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**NHRP (Next Hop Resolution Protocol)** registers spokes and resolves NBMA next hops for **DMVPN** tunnels."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**HSRP** is first-hop redundancy \u2014 DMVPN hub-spoke resolution uses **NHRP**.",
        "misconceptionTested": "HSRP for DMVPN resolution"
      },
      {
        "choiceIndex": 2,
        "explanation": "**ARP** resolves Layer 2 MACs on broadcast segments \u2014 NHRP maps tunnel endpoints over NBMA.",
        "misconceptionTested": "ARP for DMVPN next-hop resolution"
      },
      {
        "choiceIndex": 3,
        "explanation": "**GRE** encapsulates packets \u2014 **NHRP** resolves and registers DMVPN tunnel endpoints.",
        "misconceptionTested": "GRE as DMVPN resolution protocol"
      }
    ],
    "examTip": "DMVPN stack \u2192 **mGRE + IPsec + NHRP**; NHRP = hub/spoke registration and resolution."
  },
  'obj-5.5-source-q016':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**ESP (Encapsulating Security Payload)** encrypts IPsec data packets \u2014 AH provides integrity without encryption."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**AH** authenticates headers but does not encrypt payload \u2014 encryption is **ESP**.",
        "misconceptionTested": "AH as IPsec encryption protocol"
      },
      {
        "choiceIndex": 2,
        "explanation": "**IKE** negotiates IPsec SAs \u2014 it does not encrypt user data packets (**ESP** does).",
        "misconceptionTested": "IKE as data encryption protocol"
      },
      {
        "choiceIndex": 3,
        "explanation": "**ISAKMP** is the key-exchange framework \u2014 packet encryption uses **ESP**.",
        "misconceptionTested": "ISAKMP as encryption protocol"
      }
    ],
    "examTip": "IPsec encryption \u2192 **ESP**; integrity-only \u2192 **AH**; key negotiation \u2192 **IKE/ISAKMP**."
  },
  'obj-6.1-source-q004':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**DevOps** blends development and operations practices \u2014 the framework CCNA ties to **network automation** and CI/CD for infrastructure."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**NetOps** focuses on network operations tooling \u2014 the exam's automation culture term is **DevOps**.",
        "misconceptionTested": "NetOps as automation framework name"
      },
      {
        "choiceIndex": 2,
        "explanation": "**SysOps** is general systems administration \u2014 network automation aligns with **DevOps** practices.",
        "misconceptionTested": "SysOps as network automation framework"
      },
      {
        "choiceIndex": 3,
        "explanation": "**SecOps** is security operations \u2014 automation methodology in CCNA context is **DevOps**.",
        "misconceptionTested": "SecOps as automation framework"
      }
    ],
    "examTip": "Network automation culture \u2192 **DevOps** (Agile + automation); not NetOps/SecOps on CCNA stems."
  },
  'obj-6.1-source-q005':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**Lean and Agile** emphasize iterative delivery \u2014 the methodology developers use alongside automation for network changes."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**Waterfall** is sequential with long release cycles \u2014 automation teams favor **Agile** iteration.",
        "misconceptionTested": "Waterfall for network automation"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Kanban** is a workflow board method \u2014 CCNA pairs automation with **Lean and Agile** broadly.",
        "misconceptionTested": "Kanban as primary automation methodology"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Scrum** is one Agile framework \u2014 the keyed answer is the broader **Lean and Agile** pairing.",
        "misconceptionTested": "Scrum alone as automation methodology"
      }
    ],
    "examTip": "Automation + rapid iteration \u2192 **Lean/Agile**; Waterfall = opposite of automation-friendly cadence."
  },
  'obj-6.3-source-q004':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**Cisco ACI** is the data-center SDN fabric (APIC + spine-leaf) \u2014 distinct from campus APIC-EM or SD-WAN."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**APIC-EM** targets **enterprise campus/branch** SDN \u2014 data center SDN is **ACI**.",
        "misconceptionTested": "APIC-EM as data center SDN"
      },
      {
        "choiceIndex": 1,
        "explanation": "**OpenDaylight** is open-source controller code \u2014 Cisco DC SDN product is **ACI**.",
        "misconceptionTested": "OpenDaylight as Cisco DC solution"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Cisco SD-WAN (vManage)** overlays WAN edges \u2014 data center fabric is **ACI**.",
        "misconceptionTested": "SD-WAN as data center SDN"
      }
    ],
    "examTip": "SDN map: **ACI** = DC | **APIC-EM/DNA** = campus | **vManage** = SD-WAN."
  },
  'obj-6.3-source-q014':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "The **southbound interface (SBI)** talks **down** to switches/routers \u2014 OpenFlow, NETCONF, etc."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**NBI** faces **applications** above the controller \u2014 device control uses **SBI** downward.",
        "misconceptionTested": "NBI for direct device communication"
      },
      {
        "choiceIndex": 2,
        "explanation": "The controller **core** orchestrates policy \u2014 programmatic device reach is the **SBI**.",
        "misconceptionTested": "Controller core as device API"
      },
      {
        "choiceIndex": 3,
        "explanation": "Apps on the controller use **NBI** \u2014 they do not directly push forwarding rules to devices.",
        "misconceptionTested": "Hosted apps as southbound path"
      }
    ],
    "examTip": "SDN directions: **NBI** = apps \u2191 | **SBI** = devices \u2193."
  },
  'obj-2.4-source-q001':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "EtherChannel with **PAgP** supports up to **8** active links in a port channel on Cisco platforms."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Two links can bundle but the **maximum** with PAgP is **8**, not 2.",
        "misconceptionTested": "Minimum links as maximum"
      },
      {
        "choiceIndex": 2,
        "explanation": "**16** exceeds the PAgP EtherChannel limit \u2014 Cisco caps at **8** member interfaces.",
        "misconceptionTested": "16 interfaces with PAgP"
      },
      {
        "choiceIndex": 3,
        "explanation": "Four links can aggregate but the exam maximum for PAgP EtherChannel is **8**.",
        "misconceptionTested": "4 as maximum PAgP bundle"
      }
    ],
    "examTip": "PAgP/LACP EtherChannel max = **8 links** (same speed/duplex, same VLAN settings)."
  },
  'obj-2.4-source-q009':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**PAgP (Port Aggregation Protocol)** is Cisco proprietary \u2014 LACP (802.3ad) is the open standard."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**LACP (802.3ad)** is IEEE open standard \u2014 Cisco proprietary negotiation is **PAgP**.",
        "misconceptionTested": "LACP as Cisco proprietary"
      },
      {
        "choiceIndex": 1,
        "explanation": "**802.1Q** is VLAN trunk tagging \u2014 link bundling negotiation is **PAgP** or LACP.",
        "misconceptionTested": "802.1Q as EtherChannel protocol"
      },
      {
        "choiceIndex": 3,
        "explanation": "**802.1ab** is LLDP neighbor discovery \u2014 not EtherChannel negotiation.",
        "misconceptionTested": "LLDP standard as EtherChannel protocol"
      }
    ],
    "examTip": "Cisco-only bundling \u2192 **PAgP** (` desirable`/`auto`); multi-vendor \u2192 **LACP** (`active`/`passive`)."
  },
  'obj-4.3-source-q007':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "After receiving an Offer, the client sends **DHCPACK-bound DHCP Request**, then **ACK** confirms the lease (DORA: Discover, Offer, Request, **Acknowledgment**)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**Discover** starts the process \u2014 confirmation of the offered address is the final **ACK**.",
        "misconceptionTested": "Discover as lease confirmation"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Offer** is sent by the **server** \u2014 the client's confirm step is **ACK** after Request.",
        "misconceptionTested": "Offer as client confirmation message"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Request** asks for the offered IP \u2014 the server replies with **ACK** to confirm the lease.",
        "misconceptionTested": "Request as final confirmation"
      }
    ],
    "examTip": "DORA order: **Discover \u2192 Offer \u2192 Request \u2192 Ack** \u2014 ACK is server confirmation to client."
  },
  'obj-4.3-source-q008':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Initial **DHCPDISCOVER** is a **Layer 3 broadcast** (255.255.255.255) because the client has no IP yet."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "DHCP discover is not multicast \u2014 without an address the client must **broadcast**.",
        "misconceptionTested": "Multicast for initial DHCP discover"
      },
      {
        "choiceIndex": 2,
        "explanation": "**802.1Q** is VLAN tagging \u2014 DHCP discover uses **UDP broadcast** at Layer 3.",
        "misconceptionTested": "802.1Q as DHCP transport"
      },
      {
        "choiceIndex": 3,
        "explanation": "Unicast requires a known destination IP \u2014 pre-lease acquisition uses **broadcast**.",
        "misconceptionTested": "Unicast for initial DHCP discover"
      }
    ],
    "examTip": "No IP yet \u2192 DHCP **broadcast** discover; relay (`ip helper-address`) forwards to server."
  },
  'obj-4.3-source-q009':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Clients begin renewal at **50% (T1)** of lease time \u2014 unicast DHCPREQUEST to the leasing server."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "One-quarter is before the standard renewal point \u2014 T1 renewal starts at **half** the lease.",
        "misconceptionTested": "25% as renewal timer"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Seven-eighths (T2)** is rebinding if the original server is unreachable \u2014 first renewal is at **50%**.",
        "misconceptionTested": "T2 rebinding as first renewal"
      },
      {
        "choiceIndex": 3,
        "explanation": "Waiting until lease **expires** causes an outage \u2014 renewal at **50%** prevents lapse.",
        "misconceptionTested": "End-of-lease as renewal point"
      }
    ],
    "examTip": "DHCP lease timers: **T1 = 50%** renew to server | **T2 = 87.5%** rebind | expiry = drop."
  },
  'obj-3.4-source-q008':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Multi-area OSPF requires a backbone \u2014 **Area 0** must exist and connect all non-backbone areas."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Area 1 is a non-backbone area \u2014 **Area 0** is mandatory for OSPF hierarchy.",
        "misconceptionTested": "User area as required backbone"
      },
      {
        "choiceIndex": 2,
        "explanation": "Area 10 is arbitrary \u2014 only **Area 0** is the required backbone.",
        "misconceptionTested": "High-numbered area as backbone"
      },
      {
        "choiceIndex": 3,
        "explanation": "Area 4 cannot replace the backbone \u2014 **Area 0** must be present.",
        "misconceptionTested": "Non-zero area as backbone substitute"
      }
    ],
    "examTip": "OSPF rule: all areas must touch **Area 0** (via ABR) \u2014 no Area 0 = broken design."
  },
  'obj-3.4-source-q010':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "OSPF routers send hellos to **224.0.0.5 (AllSPFRouters)** for neighbor discovery on broadcast segments."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**224.0.0.9** is RIP v2 \u2014 OSPF hellos use **224.0.0.5**.",
        "misconceptionTested": "RIP multicast for OSPF hellos"
      },
      {
        "choiceIndex": 2,
        "explanation": "**224.0.0.6 (AllDRouters)** is for DR/BDR communication \u2014 general discovery is **224.0.0.5**.",
        "misconceptionTested": "DR multicast as hello address"
      },
      {
        "choiceIndex": 3,
        "explanation": "**224.0.0.7** is not the OSPF hello group \u2014 use **224.0.0.5** for AllSPFRouters.",
        "misconceptionTested": "Wrong OSPF multicast address"
      }
    ],
    "examTip": "OSPF multicast: **224.0.0.5** = all SPF routers | **224.0.0.6** = DR/BDR only."
  },
}
