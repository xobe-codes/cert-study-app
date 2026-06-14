/** Auto-generated from domain packages — npm run compile:cku-traps */
export const CKU_TRAP_INDEX = {
  "CKU-ACL": [
    {
      "trap": "Forgetting the implicit deny.",
      "correction": "An ACL with only permits blocks everything else via the implicit deny any.",
      "source": "examTrap"
    },
    {
      "trap": "Misordering rules.",
      "correction": "First match wins — put specific rules before broad ones.",
      "source": "examTrap"
    },
    {
      "trap": "ACLs encrypt or deeply inspect traffic.",
      "correction": "ACLs filter by header fields (IP/protocol/port); they are not encryption or stateful firewalls.",
      "source": "misconception"
    },
    {
      "trap": "Rule order doesn’t matter.",
      "correction": "Order is critical — the first matching rule wins and the rest are skipped.",
      "source": "misconception"
    }
  ],
  "CKU-ACL-EXTENDED": [
    {
      "trap": "Placing extended ACLs near the destination.",
      "correction": "Place extended ACLs near the source to drop traffic early.",
      "source": "examTrap"
    }
  ],
  "CKU-ADMINISTRATIVE-DISTANCE": [
    {
      "trap": "Assuming the lowest AD route always wins.",
      "correction": "AD only decides among routes to the SAME prefix. A more-specific (longer) prefix always wins first, even with a higher AD.",
      "source": "examTrap"
    },
    {
      "trap": "Forgetting AD 255 behavior.",
      "correction": "A route with AD 255 is considered unusable and is never installed in the routing table.",
      "source": "examTrap"
    },
    {
      "trap": "AD and metric do the same job.",
      "correction": "AD chooses between routing SOURCES for the same prefix; metric ranks routes WITHIN one protocol.",
      "source": "misconception"
    }
  ],
  "CKU-AP-WLAN": [
    {
      "trap": "Calling an AP a router.",
      "correction": "An AP bridges wireless clients to the wired LAN; it does not perform inter-network routing.",
      "source": "examTrap"
    }
  ],
  "CKU-APIPA": [
    {
      "trap": "Treating 169.254.x.x as normal private DHCP address.",
      "correction": "169.254 is APIPA — indicates DHCP failure, not RFC 1918.",
      "source": "examTrap"
    },
    {
      "trap": "APIPA hosts can reach the Internet.",
      "correction": "Without a valid address/gateway/DHCP, Internet access fails until DHCP is restored.",
      "source": "misconception"
    }
  ],
  "CKU-BLOCK-SIZE": [
    {
      "trap": "Using the wrong octet for block size.",
      "correction": "Apply block size to the octet where the mask is neither 255 nor 0 (the interesting octet).",
      "source": "examTrap"
    },
    {
      "trap": "The block size is always in the 4th octet.",
      "correction": "It applies to whichever octet the mask splits — e.g. a /18 subnets in the 3rd octet.",
      "source": "misconception"
    }
  ],
  "CKU-CABLE-TYPES": [
    {
      "trap": "Always choosing crossover switch-to-switch.",
      "correction": "Modern auto-MDIX usually allows straight-through between switches.",
      "source": "examTrap"
    }
  ],
  "CKU-CAMPUS-TIER": [
    {
      "trap": "More tiers always mean faster networks.",
      "correction": "Tiers organize scale and policy; extra hops can add latency if over-engineered.",
      "source": "misconception"
    }
  ],
  "CKU-CIA-TRIAD": [
    {
      "trap": "Integrity = detecting CHANGES (hashing). NOT keeping data private.",
      "correction": "That is confidentiality. Integrity uses hashing to detect unauthorized modification.",
      "source": "examTrap"
    },
    {
      "trap": "A DDoS attack violates AVAILABILITY, not confidentiality or integrity.",
      "correction": "Availability is a security goal — DDoS exhausts resources so legitimate users cannot access services.",
      "source": "examTrap"
    },
    {
      "trap": "Integrity means keeping data private.",
      "correction": "Integrity detects unauthorized changes (hashing); confidentiality keeps data private (encryption).",
      "source": "misconception"
    }
  ],
  "CKU-CLOUD-ONPREM": [
    {
      "trap": "Cloud means no local network.",
      "correction": "Hybrid designs keep on-prem LAN/WAN while using cloud for apps or compute.",
      "source": "misconception"
    }
  ],
  "CKU-COLLISIONS": [
    {
      "trap": "Collisions are normal on all Ethernet links.",
      "correction": "Full-duplex switched links should have near-zero collisions.",
      "source": "misconception"
    }
  ],
  "CKU-COMMON-THREATS": [
    {
      "trap": "A DDoS attack violates AVAILABILITY, not confidentiality or integrity.",
      "correction": "Availability is a security goal — DDoS exhausts resources so legitimate users cannot access services.",
      "source": "examTrap"
    }
  ],
  "CKU-CONNECTED-LOCAL-ROUTES": [
    {
      "trap": "The L route is NOT a host route to a PC.",
      "correction": "L is the router own interface IP as a /32 — so the router processes packets addressed to itself.",
      "source": "examTrap"
    },
    {
      "trap": "The L route forwards traffic to end hosts.",
      "correction": "L routes exist only for the router own interface IPs — not for PCs or servers.",
      "source": "misconception"
    },
    {
      "trap": "Connected routes persist after an interface goes down.",
      "correction": "C and L routes are removed immediately when the interface fails.",
      "source": "misconception"
    }
  ],
  "CKU-CONTAINERS": [
    {
      "trap": "Saying containers include a full guest OS.",
      "correction": "Containers share the host kernel — only apps/libs are packaged.",
      "source": "examTrap"
    }
  ],
  "CKU-CRC": [
    {
      "trap": "CRC errors always mean replace the switch.",
      "correction": "Most CRC issues are cable, SFP, or duplex — not the switch ASIC.",
      "source": "misconception"
    }
  ],
  "CKU-DEFAULT-ROUTE": [
    {
      "trap": "Treating the default route as a normal match.",
      "correction": "0.0.0.0/0 is the least specific route (prefix length 0) and is used only when nothing more specific matches.",
      "source": "examTrap"
    },
    {
      "trap": "A default route guarantees connectivity.",
      "correction": "It only forwards traffic that matches nothing more specific; if the next hop is wrong or down, traffic still fails.",
      "source": "misconception"
    }
  ],
  "CKU-DNS-GW-ISSUES": [
    {
      "trap": "Blaming DNS when the gateway is wrong.",
      "correction": "If remote IPs fail, fix gateway/routing before DNS.",
      "source": "examTrap"
    }
  ],
  "CKU-DTP": [
    {
      "trap": "Leaving DTP on for untrusted ports.",
      "correction": "Disable DTP with switchport nonegotiate to prevent VLAN hopping.",
      "source": "examTrap"
    }
  ],
  "CKU-DUPLEX-MISMATCH": [
    {
      "trap": "Forcing full-duplex on one side only.",
      "correction": "Both ends must match — use auto-auto or identical manual settings.",
      "source": "examTrap"
    }
  ],
  "CKU-FIBER": [
    {
      "trap": "Using MM fiber for km-scale links.",
      "correction": "Long distance requires single-mode fiber and matching SM optics.",
      "source": "examTrap"
    },
    {
      "trap": "Fiber has no distance limit.",
      "correction": "SM has much longer reach than MM, but both have spec limits and need correct optics.",
      "source": "misconception"
    }
  ],
  "CKU-FIREWALL": [
    {
      "trap": "Firewalls and IPS are interchangeable.",
      "correction": "Firewalls enforce access policy; IPS focuses on threat detection/prevention — often deployed together.",
      "source": "misconception"
    }
  ],
  "CKU-FLOATING-STATIC": [
    {
      "trap": "A floating static needs AD HIGHER than the dynamic protocol.",
      "correction": "Setting AD 90 to back up OSPF (AD 110) would always be preferred — it becomes primary, not backup.",
      "source": "examTrap"
    }
  ],
  "CKU-FRAME-FLOODING": [
    {
      "trap": "Thinking switches broadcast every frame.",
      "correction": "Only unknown unicast, broadcast, and multicast frames are flooded; known unicast goes to one port.",
      "source": "examTrap"
    },
    {
      "trap": "Believing flooding can cross VLAN boundaries.",
      "correction": "Flooding is always confined to the frame's own VLAN.",
      "source": "examTrap"
    },
    {
      "trap": "Flooding means something is broken.",
      "correction": "Flooding unknown unicast/broadcast/multicast is normal, expected behavior — it is how a switch reaches devices it hasn't learned yet.",
      "source": "misconception"
    }
  ],
  "CKU-FRAME-FORWARDING": [
    {
      "trap": "Forgetting same-port source/destination frames are filtered, not forwarded.",
      "correction": "If both MACs map to the same ingress port, the switch does not forward the frame at all.",
      "source": "examTrap"
    }
  ],
  "CKU-HYPERVISOR": [
    {
      "trap": "Virtualization eliminates physical networks.",
      "correction": "VMs/containers still need virtual and physical switching/routing underneath.",
      "source": "misconception"
    },
    {
      "trap": "NFV and VMs are the same thing.",
      "correction": "NFV is a use case — virtualized network functions; VMs are one way to host them (containers another).",
      "source": "misconception"
    }
  ],
  "CKU-IF-ERRORS": [
    {
      "trap": "Assuming up/up means healthy link.",
      "correction": "Always check error counters — CRCs can climb while status stays up.",
      "source": "examTrap"
    }
  ],
  "CKU-IPCONFIG": [
    {
      "trap": "Ignoring 169.254.x.x in ipconfig.",
      "correction": "APIPA means DHCP failed — not a valid corporate address.",
      "source": "examTrap"
    },
    {
      "trap": "ipconfig renew fixes all network problems.",
      "correction": "renew requests DHCP again but cannot fix server, relay, or wrong static config.",
      "source": "misconception"
    }
  ],
  "CKU-IPV6-ADDRESSING": [
    {
      "trap": "IPv6 needs NAT like IPv4.",
      "correction": "IPv6’s huge space means hosts use globally unique addresses; NAT is generally unnecessary.",
      "source": "misconception"
    },
    {
      "trap": "An interface has only one IPv6 address.",
      "correction": "Interfaces normally have at least a link-local (FE80::) and a global address.",
      "source": "misconception"
    }
  ],
  "CKU-IPV6-LINK-LOCAL": [
    {
      "trap": "Confusing FE80 and FF02.",
      "correction": "FE80 = link-local unicast; FF02 = link-local multicast group.",
      "source": "examTrap"
    },
    {
      "trap": "Link-local addresses must be configured manually.",
      "correction": "Every IPv6 interface auto-generates an FE80:: link-local address.",
      "source": "misconception"
    },
    {
      "trap": "Global unicast is the only usable type on a router link.",
      "correction": "Routers often peer over link-local (FE80::) next hops for routing protocols.",
      "source": "misconception"
    }
  ],
  "CKU-IPV6-MULTICAST": [
    {
      "trap": "Looking for an IPv6 broadcast.",
      "correction": "There is none; multicast (FF00::/8) replaces broadcast.",
      "source": "examTrap"
    },
    {
      "trap": "Confusing FE80 and FF02.",
      "correction": "FE80 = link-local unicast; FF02 = link-local multicast group.",
      "source": "examTrap"
    },
    {
      "trap": "Anycast and multicast are the same.",
      "correction": "Multicast delivers to ALL group members; anycast delivers to the NEAREST one.",
      "source": "misconception"
    }
  ],
  "CKU-IPV6-SHORTENING": [
    {
      "trap": "Using :: twice.",
      "correction": "Only one :: per address is allowed.",
      "source": "examTrap"
    },
    {
      "trap": "Dropping trailing zeros in a hextet.",
      "correction": "Only leading zeros may be dropped (00a0 → a0, not a).",
      "source": "examTrap"
    },
    {
      "trap": "`::` represents exactly one zero hextet.",
      "correction": "`::` represents one or more contiguous all-zero hextets — as many as needed to total 8.",
      "source": "misconception"
    }
  ],
  "CKU-IPV6-SLAAC": [
    {
      "trap": "Expecting SLAAC on a non-/64 prefix.",
      "correction": "SLAAC requires a /64 prefix.",
      "source": "examTrap"
    }
  ],
  "CKU-IPV6-STATIC-ROUTE": [
    {
      "trap": "IPv6 static routes require `ipv6 unicast-routing` globally first.",
      "correction": "Without `ipv6 unicast-routing`, IPv6 static routes are not installed — a common exam gotcha.",
      "source": "examTrap"
    }
  ],
  "CKU-IPV6-UNIQUE-LOCAL": [
    {
      "trap": "Treating ULA as routable.",
      "correction": "FD00::/8 is private and should not be advertised to the internet.",
      "source": "examTrap"
    }
  ],
  "CKU-LONGEST-PREFIX-MATCH": [
    {
      "trap": "Assuming the lowest AD route always wins.",
      "correction": "AD only decides among routes to the SAME prefix. A more-specific (longer) prefix always wins first, even with a higher AD.",
      "source": "examTrap"
    },
    {
      "trap": "A lower metric can beat a more-specific route.",
      "correction": "Longest prefix match happens first and is absolute; AD and metric never override a more-specific matching route.",
      "source": "misconception"
    }
  ],
  "CKU-MAC-ADDRESS-TABLE": [
    {
      "trap": "A switch needs to know a device's IP address to forward frames to it.",
      "correction": "Switching is Layer 2 — only MAC addresses matter for the forwarding decision.",
      "source": "misconception"
    },
    {
      "trap": "The MAC address table is the same as an ARP table.",
      "correction": "The MAC address table (Layer 2, on switches) maps MAC→port; the ARP table (Layer 3, on routers/hosts) maps IP→MAC. They are different tables on different devices.",
      "source": "misconception"
    }
  ],
  "CKU-MAC-AGING": [
    {
      "trap": "Assuming the aging timer disconnects the device.",
      "correction": "Aging only removes the table entry; the device itself is unaffected and will be relearned on its next frame.",
      "source": "examTrap"
    }
  ],
  "CKU-METRIC": [
    {
      "trap": "Comparing metrics across routing protocols.",
      "correction": "Metrics are protocol-specific. Across protocols, AD decides; metric is never compared between OSPF and EIGRP, etc.",
      "source": "examTrap"
    },
    {
      "trap": "A lower metric can beat a more-specific route.",
      "correction": "Longest prefix match happens first and is absolute; AD and metric never override a more-specific matching route.",
      "source": "misconception"
    },
    {
      "trap": "AD and metric do the same job.",
      "correction": "AD chooses between routing SOURCES for the same prefix; metric ranks routes WITHIN one protocol.",
      "source": "misconception"
    }
  ],
  "CKU-NAT": [
    {
      "trap": "Expecting static NAT to serve many hosts.",
      "correction": "Static NAT is 1:1; use PAT/overload for many-to-one.",
      "source": "examTrap"
    },
    {
      "trap": "NAT provides security/encryption.",
      "correction": "NAT hides addresses but does not encrypt; it is not a security control by itself.",
      "source": "misconception"
    }
  ],
  "CKU-NAT-TERMS": [
    {
      "trap": "Forgetting the inside/outside interface tags.",
      "correction": "Without `ip nat inside`/`outside`, NAT translates nothing.",
      "source": "examTrap"
    },
    {
      "trap": "Mixing up inside local and inside global.",
      "correction": "Inside local = private host; inside global = its public mapping.",
      "source": "examTrap"
    }
  ],
  "CKU-NATIVE-VLAN": [
    {
      "trap": "Mismatched native VLANs.",
      "correction": "Native VLAN must match on both ends or traffic can leak (CDP warns).",
      "source": "examTrap"
    },
    {
      "trap": "Thinking all VLANs are tagged.",
      "correction": "The native VLAN is untagged; all others are tagged.",
      "source": "examTrap"
    }
  ],
  "CKU-NFV": [
    {
      "trap": "NFV and VMs are the same thing.",
      "correction": "NFV is a use case — virtualized network functions; VMs are one way to host them (containers another).",
      "source": "misconception"
    }
  ],
  "CKU-OSPF": [
    {
      "trap": "Using a subnet mask in the network statement.",
      "correction": "OSPF `network` uses a WILDCARD mask (0.0.0.255 for /24).",
      "source": "examTrap"
    }
  ],
  "CKU-OSPF-COST": [
    {
      "trap": "Assuming 1G and 10G have different OSPF cost by default.",
      "correction": "Default reference bandwidth (100 Mbps) caps cost at 1, making them equal — raise the reference bandwidth.",
      "source": "examTrap"
    },
    {
      "trap": "OSPF uses hop count like RIP.",
      "correction": "OSPF uses cost (bandwidth-based), not hop count.",
      "source": "misconception"
    },
    {
      "trap": "Higher OSPF cost is better.",
      "correction": "Lower cost is preferred — it represents a faster path.",
      "source": "misconception"
    }
  ],
  "CKU-OSPF-NEIGHBOR": [
    {
      "trap": "Expecting DR/BDR on point-to-point links.",
      "correction": "DR/BDR are only elected on multi-access (e.g. Ethernet) segments.",
      "source": "examTrap"
    }
  ],
  "CKU-PAT": [
    {
      "trap": "Every inside host needs its own public IP.",
      "correction": "PAT lets thousands of hosts share one public IP via ports.",
      "source": "misconception"
    }
  ],
  "CKU-PING-TRACE": [
    {
      "trap": "ping failure always means the remote host is down.",
      "correction": "Firewalls may block ICMP; also local misconfig can fail before the path is tested.",
      "source": "misconception"
    }
  ],
  "CKU-RFC1918": [
    {
      "trap": "Thinking 172.16.0.0/16 is the whole 172 private block.",
      "correction": "The private range is 172.16.0.0/12 (through 172.31.x.x).",
      "source": "examTrap"
    },
    {
      "trap": "Private addresses are secret/encrypted.",
      "correction": "Private means non-routable on the public Internet, not hidden from others on the same LAN.",
      "source": "misconception"
    }
  ],
  "CKU-ROOT-BRIDGE": [
    {
      "trap": "Highest priority becomes root.",
      "correction": "LOWEST Bridge ID (priority then MAC) becomes root.",
      "source": "examTrap"
    }
  ],
  "CKU-ROUTER": [
    {
      "trap": "More switches always mean better routing.",
      "correction": "Switches extend L2 domains; routing is an L3 function on routers or L3 switches.",
      "source": "misconception"
    }
  ],
  "CKU-ROUTING-TABLE-ENTRY": [
    {
      "trap": "In [AD/metric], AD comes FIRST.",
      "correction": "Many students read it backwards as [metric/AD]. AD is always the first number inside the brackets.",
      "source": "examTrap"
    }
  ],
  "CKU-SPINE-LEAF": [
    {
      "trap": "Calling spine-leaf a WAN topology.",
      "correction": "Spine-leaf is a data-center switching fabric, not a branch WAN pattern.",
      "source": "examTrap"
    }
  ],
  "CKU-STATIC-ROUTE-SYNTAX": [
    {
      "trap": "Exit-interface static routes are always preferred on Ethernet.",
      "correction": "Next-hop IP is preferred on multi-access segments to avoid ARP for every destination.",
      "source": "misconception"
    },
    {
      "trap": "A static route installs even if the next-hop is unreachable.",
      "correction": "Recursive lookup must succeed — the next-hop must be reachable via another route.",
      "source": "misconception"
    }
  ],
  "CKU-STP": [
    {
      "trap": "Confusing root and designated ports.",
      "correction": "Root port = best path to root (per switch); designated = forwarding port per segment.",
      "source": "examTrap"
    },
    {
      "trap": "STP load-balances across redundant links.",
      "correction": "Classic STP blocks redundant links (one active path); EtherChannel or per-VLAN roots are needed to use both.",
      "source": "misconception"
    },
    {
      "trap": "STP prevents routing loops.",
      "correction": "STP is Layer 2 only; routing loops are handled by L3 mechanisms (TTL, split horizon).",
      "source": "misconception"
    }
  ],
  "CKU-STP-PORTFAST": [
    {
      "trap": "PortFast on switch links.",
      "correction": "PortFast belongs only on access/host ports; on switch links it risks loops.",
      "source": "examTrap"
    }
  ],
  "CKU-SUBNET-MASK": [
    {
      "trap": "A bigger prefix (/27) means a bigger network.",
      "correction": "A larger prefix number means MORE network bits and FEWER hosts — a smaller subnet.",
      "source": "misconception"
    }
  ],
  "CKU-SUBNETTING": [
    {
      "trap": "Forgetting the “− 2” in the host formula.",
      "correction": "Usable hosts = 2^h − 2 because the network and broadcast addresses can’t be assigned.",
      "source": "examTrap"
    },
    {
      "trap": "Confusing subnets (2^b) with hosts (2^h − 2).",
      "correction": "Borrowed bits give the number of subnets; remaining host bits give hosts per subnet.",
      "source": "examTrap"
    },
    {
      "trap": "Assuming /31 and /32 are normal host subnets.",
      "correction": "/32 is a single host route; /31 is a special 2-address point-to-point (RFC 3021) with no broadcast.",
      "source": "examTrap"
    },
    {
      "trap": "You can assign the .0 or .255 address to a host.",
      "correction": "Within a subnet the all-0 host (network) and all-1 host (broadcast) are reserved.",
      "source": "misconception"
    }
  ],
  "CKU-SWITCH": [
    {
      "trap": "Expecting an L2 switch to route VLANs.",
      "correction": "Inter-VLAN routing requires an L3 device — router or L3 switch with SVIs.",
      "source": "examTrap"
    },
    {
      "trap": "More switches always mean better routing.",
      "correction": "Switches extend L2 domains; routing is an L3 function on routers or L3 switches.",
      "source": "misconception"
    }
  ],
  "CKU-TRUNKING": [
    {
      "trap": "A trunk is faster than an access port.",
      "correction": "A trunk simply carries multiple VLANs; speed depends on the physical link.",
      "source": "misconception"
    },
    {
      "trap": "802.1Q encapsulates the whole frame.",
      "correction": "802.1Q inserts a 4-byte tag into the existing frame; it does not wrap it.",
      "source": "misconception"
    }
  ],
  "CKU-UTP": [
    {
      "trap": "Higher Cat number means longer distance.",
      "correction": "All UTP Ethernet stays ~100 m; higher categories support higher bandwidth.",
      "source": "misconception"
    }
  ],
  "CKU-VLAN": [
    {
      "trap": "Thinking same-VLAN devices need a router.",
      "correction": "Same VLAN = same broadcast domain, no routing needed; only inter-VLAN does.",
      "source": "examTrap"
    },
    {
      "trap": "Leaving ports on VLAN 1.",
      "correction": "Best practice moves user traffic off VLAN 1 and changes the native VLAN.",
      "source": "examTrap"
    },
    {
      "trap": "Assigning a port to an uncreated VLAN.",
      "correction": "Create the VLAN first or the port may go inactive.",
      "source": "examTrap"
    },
    {
      "trap": "VLANs improve speed.",
      "correction": "VLANs segment broadcast domains for organization/security, not raw speed.",
      "source": "misconception"
    },
    {
      "trap": "A VLAN exists on only one switch.",
      "correction": "A VLAN can span many switches over trunks.",
      "source": "misconception"
    }
  ],
  "CKU-VRF": [
    {
      "trap": "Equating VRF with VLAN.",
      "correction": "VRF isolates L3 routing; VLAN isolates L2 broadcast domains.",
      "source": "examTrap"
    }
  ],
  "CKU-VULN-THREAT-EXPLOIT": [
    {
      "trap": "A vulnerability alone equals a breach.",
      "correction": "A threat and exploit are also required — vulnerability is only the weakness.",
      "source": "misconception"
    }
  ],
  "CKU-WAN-TOPO": [
    {
      "trap": "Assuming hub-and-spoke has automatic redundancy.",
      "correction": "The hub is a single point of failure unless spokes are dual-homed or meshed.",
      "source": "examTrap"
    }
  ],
  "CKU-WIFI-BANDS": [
    {
      "trap": "Using adjacent 2.4 GHz channels (e.g. 3 and 4).",
      "correction": "They overlap — stick to 1, 6, 11 for non-overlapping 20 MHz cells.",
      "source": "examTrap"
    },
    {
      "trap": "5 GHz always means faster for every client.",
      "correction": "Weak 5 GHz RSSI through walls may perform worse than stable 2.4 GHz.",
      "source": "misconception"
    }
  ],
  "CKU-WIFI-CHANNELS": [
    {
      "trap": "More AP power always fixes coverage.",
      "correction": "Higher power increases interference and sticky clients; proper placement and channel plan matter.",
      "source": "misconception"
    }
  ],
  "CKU-WILDCARD-MASK": [
    {
      "trap": "Using a subnet mask in an ACL.",
      "correction": "ACLs use WILDCARD masks (inverse): /24 → 0.0.0.255.",
      "source": "examTrap"
    }
  ],
  "CKU-WPA": [
    {
      "trap": "Choosing WEP for compatibility.",
      "correction": "WEP is insecure; use WPA2 minimum, WPA3 preferred.",
      "source": "examTrap"
    }
  ]
}
