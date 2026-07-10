/** Gold reviews — Batch 31: hand polish of 40 short/high-traffic debriefs. */
export const BATCH31_GOLD = {
  "obj-4.5-source-q001": {
    "correct": {
      "choiceIndex": 3,
      "explanation": "Syslog sends event messages to a collector on **UDP/514** — connectionless and low overhead."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**UDP/161** is SNMP polling (get/set), not syslog. Syslog uses **UDP/514**.",
        "misconceptionTested": "SNMP poll port mistaken for syslog"
      },
      {
        "choiceIndex": 1,
        "explanation": "**TCP/162** is wrong on both counts — SNMP traps use **UDP/162**, and syslog is **UDP/514**.",
        "misconceptionTested": "SNMP trap port + TCP for syslog"
      },
      {
        "choiceIndex": 2,
        "explanation": "**UDP/162** is the SNMP trap destination port. Syslog traffic uses **UDP/514**.",
        "misconceptionTested": "SNMP trap port for syslog"
      }
    ],
    "examTip": "Syslog **514/udp** · SNMP poll **161/udp** · SNMP traps **162/udp**."
  },
  "3.1-q1": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "In `show ip route`, code **O** means the route was learned via **OSPF**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Connected routes use code **C**, not O. O is reserved for OSPF.",
        "misconceptionTested": "O means connected"
      },
      {
        "choiceIndex": 2,
        "explanation": "Static routes use code **S**. O always means OSPF-learned.",
        "misconceptionTested": "O means static"
      },
      {
        "choiceIndex": 3,
        "explanation": "EIGRP uses code **D** (for DUAL). Code **O** is OSPF-only — do not mix the two.",
        "misconceptionTested": "O means EIGRP"
      }
    ],
    "examTip": "Route codes: **C** connected · **S** static · **O** OSPF · **D** EIGRP."
  },
  "1.8-c-q1": {
    "correct": {
      "choiceIndex": 2,
      "explanation": "An IPv6 address is **128 bits** (eight 16-bit hextets) — four times the 32-bit IPv4 length."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**32** bits is the IPv4 address length — IPv6 addresses are **128** bits.",
        "misconceptionTested": "IPv4 length on IPv6 stem"
      },
      {
        "choiceIndex": 1,
        "explanation": "**64** bits is a common IPv6 interface-ID /64 host portion — the full address is still **128** bits.",
        "misconceptionTested": "Interface ID length as full address"
      },
      {
        "choiceIndex": 3,
        "explanation": "**256** bits is not an IP address size — IPv6 is fixed at **128** bits.",
        "misconceptionTested": "Doubling 128 incorrectly"
      }
    ],
    "examTip": "IPv6 = **128-bit** addresses. IPv4 = **32-bit**."
  },
  "1.9-c-q1": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**2000::/3** is the IPv6 global unicast range used for publicly routable addresses."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**FE80::/10** is link-local — valid only on the local segment, not global unicast.",
        "misconceptionTested": "Confusing link-local with global unicast"
      },
      {
        "choiceIndex": 2,
        "explanation": "**FC00::/7** (often **FD00::/8**) is unique local (ULA) — private site addressing, not global unicast.",
        "misconceptionTested": "Mixing ULA with global unicast"
      },
      {
        "choiceIndex": 3,
        "explanation": "**FF00::/8** is multicast space — not unicast addressing.",
        "misconceptionTested": "Selecting multicast range for unicast question"
      }
    ],
    "examTip": "Global unicast = **2000::/3**. Link-local = **FE80::/10**. ULA = **FC00::/7**."
  },
  "1.6-c-q1": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "A **/26** leaves 6 host bits → 2⁶ = 64 addresses − network − broadcast = **62** usable hosts."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**64** is the total address count (2⁶), not usable hosts — subtract network and broadcast → **62**.",
        "misconceptionTested": "Forgetting to subtract network/broadcast"
      },
      {
        "choiceIndex": 2,
        "explanation": "**30** usable hosts is a **/27** (5 host bits), not /26.",
        "misconceptionTested": "Wrong prefix → host count"
      },
      {
        "choiceIndex": 3,
        "explanation": "**126** usable hosts is a **/25**. /26 is always **62**.",
        "misconceptionTested": "Off-by-prefix host math"
      }
    ],
    "examTip": "Usable hosts = 2^(32−prefix) − 2. /26 → **62**."
  },
  "2.1-c-q1": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "A VLAN is a **logical broadcast domain** — frames flood within the VLAN unless filtered by a router/SVI."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "A **collision domain** is per switch port (full duplex). VLANs group broadcast scope, not collisions.",
        "misconceptionTested": "Equating VLAN with collision domain"
      },
      {
        "choiceIndex": 2,
        "explanation": "A VLAN is not a physical cable — it is a logical grouping that can span many ports and switches.",
        "misconceptionTested": "Treating VLAN as physical media"
      },
      {
        "choiceIndex": 3,
        "explanation": "Routing protocols exchange routes between networks; a VLAN itself is an L2 broadcast domain.",
        "misconceptionTested": "Calling a VLAN a routing protocol"
      }
    ],
    "examTip": "VLAN = **broadcast domain**. Router (or SVI) needed between VLANs."
  },
  "5.5-c-q1": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "ACL entries are checked **top-down**; the **first match** wins and processing stops."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "ACLs are never processed bottom-up — order in the list is top-to-bottom.",
        "misconceptionTested": "Bottom-up ACL processing"
      },
      {
        "choiceIndex": 2,
        "explanation": "IOS does **not** auto-sort by specificity — you must place more specific lines above broader ones.",
        "misconceptionTested": "Assuming automatic most-specific-first"
      },
      {
        "choiceIndex": 3,
        "explanation": "ACL evaluation is deterministic **top-down**, first match wins — never random.",
        "misconceptionTested": "Random ACL matching"
      }
    ],
    "examTip": "ACL order trap → **first match wins**. Place explicit permits before catch-all deny."
  },
  "obj-5.1-source-q001": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "The **perimeter** is the outside edge of the corporate firewall facing untrusted networks."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "A **DMZ** is a semi-trusted zone for public servers — usually inside the perimeter, not the outside itself.",
        "misconceptionTested": "DMZ vs perimeter"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Internal** describes the trusted LAN behind the firewall, not the outside.",
        "misconceptionTested": "Internal for outside edge"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Trusted** refers to inside/corporate networks — the outside of the firewall is untrusted perimeter.",
        "misconceptionTested": "Trusted for outside firewall"
      }
    ],
    "examTip": "Outside firewall → **perimeter**. Public servers → **DMZ** inside it."
  },
  "1.12-c-q1": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**VMware ESXi** is a Type 1 (bare-metal) hypervisor that runs directly on hardware."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**VMware Workstation** is Type 2 — it runs as an application on a host OS (Windows/Linux/macOS).",
        "misconceptionTested": "Type 2 labeled as Type 1"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Docker Desktop** is container tooling on a host OS, not a bare-metal Type 1 hypervisor.",
        "misconceptionTested": "Containers as Type 1 hypervisor"
      },
      {
        "choiceIndex": 3,
        "explanation": "A physical router is network hardware — not a hypervisor that hosts VMs.",
        "misconceptionTested": "Router as hypervisor"
      }
    ],
    "examTip": "Type 1 = **bare metal** (ESXi). Type 2 = **runs on OS** (Workstation)."
  },
  "1.7-c-q1": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**192.168.50.0/24** falls in RFC 1918 private space (**192.168.0.0/16**)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**8.8.8.0/24** is public Google DNS space — not RFC 1918 private.",
        "misconceptionTested": "Public DNS range as private"
      },
      {
        "choiceIndex": 2,
        "explanation": "**203.0.113.0/24** is documentation (TEST-NET-3), not RFC 1918 private LAN space.",
        "misconceptionTested": "Documentation range as private"
      },
      {
        "choiceIndex": 3,
        "explanation": "**169.254.0.0/16** is APIPA/link-local, not RFC 1918 private addressing.",
        "misconceptionTested": "APIPA as RFC 1918"
      }
    ],
    "examTip": "RFC 1918: **10.0.0.0/8**, **172.16.0.0/12**, **192.168.0.0/16**."
  },
  "obj-2.3-source-q001": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**LLDP** (IEEE 802.1AB) is the standards-based neighbor discovery protocol for identity and capabilities."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**CDP** is Cisco-proprietary neighbor discovery — not the IEEE multi-vendor standard.",
        "misconceptionTested": "CDP as IEEE standard"
      },
      {
        "choiceIndex": 2,
        "explanation": "**802.1b** is not the neighbor-discovery standard — LLDP is **802.1AB**.",
        "misconceptionTested": "Wrong 802.1 letter for LLDP"
      },
      {
        "choiceIndex": 3,
        "explanation": "**802.1a** is not LLDP. IEEE neighbor discovery is **802.1AB (LLDP)**.",
        "misconceptionTested": "802.1a for neighbor discovery"
      }
    ],
    "examTip": "Multi-vendor neighbor discovery → **LLDP**. Cisco-only → **CDP**."
  },
  "1.10-c-q1": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**`ipconfig /all`** shows Windows IP, mask, gateway, DNS, and DHCP details in one view."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`netstat`** shows sockets/connections — not the host IP/mask/gateway/DNS summary.",
        "misconceptionTested": "netstat for IP config"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`arp -a`** shows the ARP cache (IP→MAC), not full IP/DNS configuration.",
        "misconceptionTested": "ARP cache for IP config"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`route print`** shows the routing table only — use **`ipconfig /all`** for address and DNS.",
        "misconceptionTested": "route print for full IP config"
      }
    ],
    "examTip": "Windows host IP check → **`ipconfig /all`**. Linux → **`ip addr`**."
  },
  "obj-5.6-source-q008": {
    "correct": {
      "choiceIndex": 2,
      "explanation": "For **172.16.0.0/12**, the wildcard is the inverse of 255.240.0.0 → **0.15.255.255**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**255.240.0.0** is the subnet mask for /12, not the wildcard. Wildcard = **0.15.255.255**.",
        "misconceptionTested": "Using subnet mask as wildcard"
      },
      {
        "choiceIndex": 1,
        "explanation": "**0.0.240.255** does not invert 255.240.0.0 — correct wildcard for /12 is **0.15.255.255**.",
        "misconceptionTested": "Scrambled wildcard octets"
      },
      {
        "choiceIndex": 3,
        "explanation": "**255.3.0.0** is neither a valid /12 mask nor its inverse wildcard.",
        "misconceptionTested": "Invented mask/wildcard"
      }
    ],
    "examTip": "Wildcard = inverse of mask. /12 → **0.15.255.255** for 172.16.0.0/12."
  },
  "4.1-c-q1": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "NAT **maps private (inside local) addresses to public (inside global)** so internal hosts can reach the Internet."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Encryption protects confidentiality — NAT performs address translation, not ciphering.",
        "misconceptionTested": "Equating NAT with encryption"
      },
      {
        "choiceIndex": 2,
        "explanation": "Inter-VLAN routing is an L3 switching/routing function — NAT translates addresses, it does not create VLANs.",
        "misconceptionTested": "NAT as inter-VLAN routing"
      },
      {
        "choiceIndex": 3,
        "explanation": "DHCP assigns addresses from a pool — NAT translates existing addresses at the edge.",
        "misconceptionTested": "NAT as DHCP"
      }
    ],
    "examTip": "Private inside → **NAT** → public outside. PAT overloads one public IP."
  },
  "1.11-c-q1": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "In 2.4 GHz planning, the classic non-overlapping channels are **1, 6, and 11**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**1, 2, 3** overlap heavily — adjacent channels share spectrum and cause interference.",
        "misconceptionTested": "Adjacent channels as non-overlapping"
      },
      {
        "choiceIndex": 2,
        "explanation": "**6, 7, 8** are adjacent and overlap — use **1, 6, 11** instead.",
        "misconceptionTested": "Clustered mid-band channels"
      },
      {
        "choiceIndex": 3,
        "explanation": "**11, 12, 13** are not the exam-default non-overlapping set, and 12/13 are region-restricted.",
        "misconceptionTested": "Region-only channels as universal plan"
      }
    ],
    "examTip": "2.4 GHz non-overlapping (exam default): **1, 6, 11**."
  },
  "obj-2.4-source-q001": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "EtherChannel with PAgP (or LACP) supports up to **8** member interfaces in a bundle."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**2** interfaces can form a channel, but the maximum is **8**, not 2.",
        "misconceptionTested": "Min members as max"
      },
      {
        "choiceIndex": 2,
        "explanation": "**16** exceeds the standard EtherChannel member limit of **8** links.",
        "misconceptionTested": "Overstating EtherChannel max"
      },
      {
        "choiceIndex": 3,
        "explanation": "**4** is below the maximum — PAgP/LACP allow up to **8** members.",
        "misconceptionTested": "Understating EtherChannel max"
      }
    ],
    "examTip": "PAgP/LACP EtherChannel max = **8** links (same speed/duplex/VLAN settings)."
  },
  "1.3-c-q1": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Copper UTP Ethernet segments are limited to **100 m** end-to-end (including patch cords)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**10 m** is far too short — the standard copper Ethernet limit is **100 m**.",
        "misconceptionTested": "Undersized copper length"
      },
      {
        "choiceIndex": 2,
        "explanation": "**500 m** exceeds copper UTP limits — that distance needs fiber.",
        "misconceptionTested": "Fiber distance on copper stem"
      },
      {
        "choiceIndex": 3,
        "explanation": "**1 km** is fiber territory — copper UTP Ethernet max is **100 m**.",
        "misconceptionTested": "Kilometer copper run"
      }
    ],
    "examTip": "Copper UTP Ethernet segment = **100 m**."
  },
  "1.9-c-q3": {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Unique local addresses commonly use **FD00::/8** (within FC00::/7) — IPv6’s private site space."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**2000::/3** is global unicast (public), not the private ULA range.",
        "misconceptionTested": "Global unicast as private"
      },
      {
        "choiceIndex": 2,
        "explanation": "**FE80::/10** is link-local — one link only, not site-wide private addressing.",
        "misconceptionTested": "Link-local as ULA"
      },
      {
        "choiceIndex": 3,
        "explanation": "**FF00::/8** is multicast — ULA private space is **FD00::/8**.",
        "misconceptionTested": "Multicast as private unicast"
      }
    ],
    "examTip": "IPv6 private-like (ULA) = **FD00::/8** (FC00::/7)."
  },
  "1.7-c-q8": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**NAT/PAT** lets many private hosts share one (or few) public IP(s) toward the ISP."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**STP** prevents L2 loops — it does not translate private addresses to a public IP.",
        "misconceptionTested": "STP for address sharing"
      },
      {
        "choiceIndex": 2,
        "explanation": "**VTP** propagates VLAN databases — unrelated to sharing one public IP.",
        "misconceptionTested": "VTP for NAT"
      },
      {
        "choiceIndex": 3,
        "explanation": "**LLDP** discovers neighbors — it does not perform address translation.",
        "misconceptionTested": "LLDP for NAT"
      }
    ],
    "examTip": "One public IP, many LAN hosts = **PAT** (NAT overload)."
  },
  "1.7-c-q6": {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**198.51.100.50** is in TEST-NET-2 documentation space and is treated as public/non-RFC1918 — not in 10/8, 172.16/12, or 192.168/16."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**10.1.1.1** is RFC 1918 private (**10.0.0.0/8**), not Internet-routable public.",
        "misconceptionTested": "Private 10/8 as public"
      },
      {
        "choiceIndex": 1,
        "explanation": "**172.16.1.1** is RFC 1918 private (**172.16.0.0/12**).",
        "misconceptionTested": "Private 172.16/12 as public"
      },
      {
        "choiceIndex": 3,
        "explanation": "**192.168.1.1** is RFC 1918 private (**192.168.0.0/16**).",
        "misconceptionTested": "Private 192.168/16 as public"
      }
    ],
    "examTip": "Private = **10/8**, **172.16/12**, **192.168/16**. Anything else is not RFC 1918."
  },
  "1.9-c-q7": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Link-local (**FE80::/10**) addresses are valid **only on the local link** — never forwarded off-segment."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Link-local is not Internet-routable — routers do not forward FE80:: traffic across links.",
        "misconceptionTested": "Link-local across the Internet"
      },
      {
        "choiceIndex": 2,
        "explanation": "Hosts and routers both use link-local — it is not router-only.",
        "misconceptionTested": "Link-local routers only"
      },
      {
        "choiceIndex": 3,
        "explanation": "Link-local does not require NAT — scope is the local segment by design.",
        "misconceptionTested": "Link-local needs NAT"
      }
    ],
    "examTip": "**FE80::/10** = local segment only — never routed."
  },
  "1.8-c-q7": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Global command **`ipv6 unicast-routing`** enables the router to forward IPv6 packets."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`ipv6 routing`** is not valid IOS syntax — the command is **`ipv6 unicast-routing`**.",
        "misconceptionTested": "Missing unicast keyword"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`ip routing v6`** is invented — IPv6 forwarding uses **`ipv6 unicast-routing`**.",
        "misconceptionTested": "Invented ip routing v6"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`enable ipv6`** is not the Cisco global enable for IPv6 routing.",
        "misconceptionTested": "Invented enable ipv6"
      }
    ],
    "examTip": "Router IPv6 forwarding → **`ipv6 unicast-routing`**."
  },
  "1.9-c-q2": {
    "correct": {
      "choiceIndex": 2,
      "explanation": "IPv6 link-local addresses begin with **FE80** (FE80::/10)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**FF02** prefixes are link-local **multicast**, not unicast link-local addresses.",
        "misconceptionTested": "Multicast prefix as link-local unicast"
      },
      {
        "choiceIndex": 1,
        "explanation": "**2001** is within global unicast space — link-local starts **FE80**.",
        "misconceptionTested": "Global unicast as link-local"
      },
      {
        "choiceIndex": 3,
        "explanation": "**FD00** is unique local (ULA) — link-local is **FE80**.",
        "misconceptionTested": "ULA as link-local"
      }
    ],
    "examTip": "Link-local unicast starts **FE80**. Multicast often **FF02**."
  },
  "1.7-c-q2": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**10.0.0.0/8** is RFC 1918 **private** space — not advertised as public Internet routes."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "10/8 is explicitly private — ISPs should not route it as public space.",
        "misconceptionTested": "10/8 as public"
      },
      {
        "choiceIndex": 2,
        "explanation": "Multicast uses **224.0.0.0/4**, not the RFC 1918 **10.0.0.0/8** private block.",
        "misconceptionTested": "10/8 as multicast"
      },
      {
        "choiceIndex": 3,
        "explanation": "APIPA is **169.254.0.0/16**, not the 10.0.0.0/8 private block.",
        "misconceptionTested": "10/8 as APIPA"
      }
    ],
    "examTip": "RFC 1918: **10/8**, **172.16/12**, **192.168/16**."
  },
  "3.4-c-q2": {
    "correct": {
      "choiceIndex": 2,
      "explanation": "OSPF’s default administrative distance is **110**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**90** is EIGRP (internal) administrative distance — OSPF defaults to **110**.",
        "misconceptionTested": "EIGRP AD for OSPF"
      },
      {
        "choiceIndex": 1,
        "explanation": "**100** is IGRP’s historic AD — OSPF defaults to **110**.",
        "misconceptionTested": "IGRP AD for OSPF"
      },
      {
        "choiceIndex": 3,
        "explanation": "**120** is RIP’s administrative distance — OSPF defaults to **110**.",
        "misconceptionTested": "RIP AD for OSPF"
      }
    ],
    "examTip": "AD: EIGRP **90** · OSPF **110** · RIP **120**."
  },
  "1.6-c-q10": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Host bits = 32 − prefix. For **/26**, 32 − 26 = **6** host bits."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**26** is the prefix length itself, not the host-bit count.",
        "misconceptionTested": "Prefix length as host bits"
      },
      {
        "choiceIndex": 2,
        "explanation": "**8** host bits belong to a **/24**. A **/26** has **6** host bits (32−26).",
        "misconceptionTested": "/24 host bits on /26"
      },
      {
        "choiceIndex": 3,
        "explanation": "**4** host bits belong to a **/28**. A **/26** has **6** host bits (32−26).",
        "misconceptionTested": "/28 host bits on /26"
      }
    ],
    "examTip": "Host bits = **32 − prefix**. /26 → **6** host bits."
  },
  "1.7-c-q3": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**172.20.5.10** sits inside **172.16.0.0–172.31.255.255** (RFC 1918 **/12**), so it is private."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "172.20.x.x is within the private 172.16/12 block — it is not public-only.",
        "misconceptionTested": "Private 172.20 as public"
      },
      {
        "choiceIndex": 2,
        "explanation": "Private vs public is defined by RFC 1918 ranges, not by whether DHCP assigned the address.",
        "misconceptionTested": "DHCP decides private/public"
      },
      {
        "choiceIndex": 3,
        "explanation": "This is an IPv4 RFC 1918 question — IPv6 is irrelevant here.",
        "misconceptionTested": "IPv6 required for private IPv4"
      }
    ],
    "examTip": "172.16.0.0–172.31.255.255 = **private /12**."
  },
  "3.4-c-q4": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "If unset, OSPF picks the **highest loopback IP**, else the **highest IP on an active interface**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "OSPF prefers the **highest** IP, not the lowest, when auto-selecting the router ID.",
        "misconceptionTested": "Lowest IP as OSPF RID"
      },
      {
        "choiceIndex": 2,
        "explanation": "OSPF router ID is an IPv4-format value from interface/loopback IPs — not the MAC address.",
        "misconceptionTested": "MAC as OSPF RID"
      },
      {
        "choiceIndex": 3,
        "explanation": "**0.0.0.0** is not a valid auto-selected OSPF router ID.",
        "misconceptionTested": "Zero RID default"
      }
    ],
    "examTip": "OSPF RID = **highest loopback**, else **highest active interface IP**."
  },
  "1.7-c-q4": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**169.254.x.x** is APIPA — Windows assigns it when **DHCP fails** and no lease is obtained."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "A successful DHCP lease yields a pool address (often 10/172/192.168), not 169.254.",
        "misconceptionTested": "APIPA as successful DHCP"
      },
      {
        "choiceIndex": 2,
        "explanation": "169.254 is link-local APIPA, not a configured static public IP.",
        "misconceptionTested": "APIPA as static public"
      },
      {
        "choiceIndex": 3,
        "explanation": "Flushing DNS cache does not change the host IP to 169.254 — that signals DHCP failure.",
        "misconceptionTested": "DNS flush causes APIPA"
      }
    ],
    "examTip": "169.254.x.x = **no DHCP lease** (APIPA)."
  },
  "1.6-c-q8": {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Mask **255.255.255.240** has four 1-bits in the last octet (11110000) → prefix **/28**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**/26** is mask 255.255.255.192 — mask .240 is prefix **/28**.",
        "misconceptionTested": "/26 for .240 mask"
      },
      {
        "choiceIndex": 1,
        "explanation": "**/27** is mask 255.255.255.224 — mask .240 is prefix **/28**.",
        "misconceptionTested": "/27 for .240 mask"
      },
      {
        "choiceIndex": 3,
        "explanation": "**/29** is mask 255.255.255.248 — mask .240 is prefix **/28**.",
        "misconceptionTested": "/29 for .240 mask"
      }
    ],
    "examTip": "Last octet .240 = 11110000 → **/28**."
  },
  "1.5-c-q12": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "A switch **forwards known unicast to one port**; a hub **repeats every frame out every other port**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Switches and hubs do **not** behave identically — switches learn MACs and filter/flood selectively.",
        "misconceptionTested": "Switch equals hub"
      },
      {
        "choiceIndex": 2,
        "explanation": "Hubs have **no** MAC table; switches do. This option reverses the truth.",
        "misconceptionTested": "Hub has MAC table"
      },
      {
        "choiceIndex": 3,
        "explanation": "Classic Ethernet switches forward at **Layer 2**; Layer 3 is routing/SVI behavior.",
        "misconceptionTested": "Switch only at L3"
      }
    ],
    "examTip": "Switch = **intelligent flood/filter**; hub = **repeat all ports**."
  },
  "1.7-c-q5": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Private addresses are **not globally unique** and are **not routed on the public Internet**, so NAT is required to reach the Internet."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Address length is the same (32-bit IPv4) — the issue is routing policy/uniqueness, not length.",
        "misconceptionTested": "Private too short"
      },
      {
        "choiceIndex": 2,
        "explanation": "RFC 1918 private addresses are IPv4 — this is not an IPv6-only rule.",
        "misconceptionTested": "Private is IPv6 only"
      },
      {
        "choiceIndex": 3,
        "explanation": "Firewalls may filter traffic, but the fundamental reason is that private space is not publicly routed.",
        "misconceptionTested": "Firewall blocks all IPv4"
      }
    ],
    "examTip": "Private hosts reach the Internet via **NAT/PAT**."
  },
  "1.9-c-q4": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**FF02::2** is the all-routers multicast address on a link."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**FF02::1** is all-nodes (every IPv6 host), not all-routers.",
        "misconceptionTested": "All-nodes for all-routers"
      },
      {
        "choiceIndex": 2,
        "explanation": "**FF02::5** is OSPFv3 all-SPF-routers — not the generic all-routers group.",
        "misconceptionTested": "OSPFv3 group as all-routers"
      },
      {
        "choiceIndex": 3,
        "explanation": "**224.0.0.2** is IPv4 all-routers multicast — this stem asks for IPv6.",
        "misconceptionTested": "IPv4 multicast on IPv6 stem"
      }
    ],
    "examTip": "All routers link-local = **FF02::2**. All nodes = **FF02::1**."
  },
  "1.6-c-q9": {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**/29** has 8 addresses: network **10.0.0.0**, usable **.1–.6**, broadcast **.7**."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**.7** is the **/29** broadcast address — usable hosts stop at **.6**.",
        "misconceptionTested": "Including broadcast in usable range"
      },
      {
        "choiceIndex": 2,
        "explanation": "**.0–.7** includes network and broadcast — usable is **.1–.6** only.",
        "misconceptionTested": "Full block as usable"
      },
      {
        "choiceIndex": 3,
        "explanation": "**.1–.14** is a **/28** usable range — **/29** usable is **.1–.6** only.",
        "misconceptionTested": "/28 range on /29 stem"
      }
    ],
    "examTip": "/29 usable: first = network+1, last = broadcast−1 → **.1–.6**."
  },
  "1.5-c-q6": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Layer 2 broadcast MAC is **FFFF.FFFF.FFFF** (all bits set)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**0000.0000.0000** is not used as the Ethernet broadcast address.",
        "misconceptionTested": "All-zero as L2 broadcast"
      },
      {
        "choiceIndex": 2,
        "explanation": "**0000.0000.FFFF** is not all-ones — L2 broadcast is **FFFF.FFFF.FFFF**.",
        "misconceptionTested": "Partial FFFF as broadcast"
      },
      {
        "choiceIndex": 3,
        "explanation": "**AAAA.AAAA.AAAA** is an ordinary unicast-looking pattern — broadcast is all F.",
        "misconceptionTested": "AAAA as broadcast"
      }
    ],
    "examTip": "L2 broadcast = **FFFF.FFFF.FFFF**."
  },
  "1.9-c-q8": {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Every IPv6 host joins **FF02::1** (all-nodes) on each link."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**FF02::2** is all-routers — hosts that are not routers do not need that group.",
        "misconceptionTested": "All-routers for every host"
      },
      {
        "choiceIndex": 2,
        "explanation": "**FE80::1** is a link-local unicast address, not a multicast group every host joins.",
        "misconceptionTested": "Link-local unicast as multicast group"
      },
      {
        "choiceIndex": 3,
        "explanation": "**2000::1** is a global unicast example — not a mandatory multicast join.",
        "misconceptionTested": "Global unicast as all-nodes"
      }
    ],
    "examTip": "All IPv6 hosts → **FF02::1**."
  },
  "3.2-c-q4": {
    "correct": {
      "choiceIndex": 0,
      "explanation": "A **connected** route has administrative distance **0** — best possible, beats static and dynamic."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**1** is the default AD for a **static** route, not connected.",
        "misconceptionTested": "Static AD for connected"
      },
      {
        "choiceIndex": 2,
        "explanation": "**110** is OSPF’s AD — a connected route always has AD **0**.",
        "misconceptionTested": "OSPF AD for connected"
      },
      {
        "choiceIndex": 3,
        "explanation": "**120** is RIP’s AD — a connected route always has AD **0**.",
        "misconceptionTested": "RIP AD for connected"
      }
    ],
    "examTip": "Connected = AD **0** (always preferred over static/dynamic)."
  },
  "1.5-c-q8": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**`show mac address-table`** displays the switch CAM/MAC forwarding table."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`show ip interface brief`** shows L3 interface status/IPs — not the MAC table.",
        "misconceptionTested": "IP brief for MAC table"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`show vlan brief`** lists VLANs and access ports — not learned MACs.",
        "misconceptionTested": "VLAN brief for MAC table"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`show cdp neighbors`** shows CDP neighbors — not the MAC address table.",
        "misconceptionTested": "CDP for MAC table"
      }
    ],
    "examTip": "MAC table → **`show mac address-table`**."
  },
  "1.5-c-q9": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Pin a permanent MAC with **`mac address-table static <mac> vlan <id> interface <intf>`**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`mac address-table aging-time 0`** disables aging globally — it does not add a static entry.",
        "misconceptionTested": "Aging-time as static MAC"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`switchport mode static`** is not valid IOS — port modes are access/trunk/dynamic.",
        "misconceptionTested": "Invented switchport mode static"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`arp … static`** manipulates the ARP cache (L3), not the L2 MAC address table.",
        "misconceptionTested": "Static ARP for MAC table"
      }
    ],
    "examTip": "Pin MAC → **`mac address-table static`**."
  },
  "1.6-c-q2": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**/27** (255.255.255.224) has block size **32** in the last octet (256 − 224)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**16** is the block size for **/28** (.240) — **/27** uses block size **32**.",
        "misconceptionTested": "/28 block on /27"
      },
      {
        "choiceIndex": 2,
        "explanation": "**64** is the block size for **/26** (.192) — **/27** uses block size **32**.",
        "misconceptionTested": "/26 block on /27"
      },
      {
        "choiceIndex": 3,
        "explanation": "**8** is the block size for **/29** (.248) — **/27** uses block size **32**.",
        "misconceptionTested": "/29 block on /27"
      }
    ],
    "examTip": "/27 → block size **32** (128/64/32/16/8 for /25–/29)."
  }
}
