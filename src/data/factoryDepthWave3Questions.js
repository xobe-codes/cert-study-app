/** Supplemental MC questions — Phase 1 Content Depth Wave 3 (thin objectives → ≥8 merged pool). */

export const FACTORY_DEPTH_WAVE3_QUESTIONS = {
  '2.3': [
    {
      "id": "obj-2.3-depth-q1",
      "question": "Default CDP advertisement and hold-time timers on Cisco IOS?",
      "choices": [
        "30 s / 90 s",
        "60 s / 180 s",
        "120 s / 360 s",
        "10 s / 30 s"
      ],
      "correctIndex": 1,
      "explanation": "CDP sends updates every 60 s; hold-time is 180 s (3× the interval).",
      "type": "definition",
      "difficulty": "easy",
      "concept": "cdp timers",
      "ckuIds": [
        "CKU-CDP"
      ]
    },
    {
      "id": "obj-2.3-depth-q2",
      "question": "Which command enables LLDP globally on a Cisco switch?",
      "choices": [
        "lldp enable",
        "lldp run",
        "cdp run",
        "no cdp run"
      ],
      "correctIndex": 1,
      "explanation": "`lldp run` enables IEEE 802.1AB neighbor discovery globally.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "lldp enable",
      "ckuIds": [
        "CKU-LLDP"
      ]
    },
    {
      "id": "obj-2.3-depth-q3",
      "question": "A multivendor campus requires standards-based L2 neighbor discovery. Which protocol should you enable?",
      "choices": [
        "CDP only",
        "LLDP",
        "OSPF",
        "VTP"
      ],
      "correctIndex": 1,
      "explanation": "LLDP is IEEE 802.1AB and works across vendors; CDP is Cisco-proprietary.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "multivendor discovery",
      "ckuIds": [
        "CKU-LLDP",
        "CKU-CDP"
      ]
    },
  ],
  '2.4': [
    {
      "id": "obj-2.4-depth-q1",
      "question": "Where should you assign the IP address for an EtherChannel bundle?",
      "choices": [
        "First member interface",
        "Port-channel interface",
        "Any member link",
        "VLAN 1 only"
      ],
      "correctIndex": 1,
      "explanation": "Logical Port-channel carries L3 config; members only have channel-group settings.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "port-channel ip",
      "ckuIds": [
        "CKU-ETHERCHANNEL"
      ]
    },
    {
      "id": "obj-2.4-depth-q2",
      "question": "Which LACP modes actively send PDUs to negotiate a bundle?",
      "choices": [
        "on and passive",
        "active and passive",
        "auto and desirable",
        "active and on"
      ],
      "correctIndex": 1,
      "explanation": "LACP active and passive negotiate; `on` forces bundling without negotiation.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "lacp modes",
      "ckuIds": [
        "CKU-LACP"
      ]
    },
    {
      "id": "obj-2.4-depth-q3",
      "question": "Switch A uses LACP active; Switch B must use which mode to form an EtherChannel?",
      "choices": [
        "PAgP desirable",
        "LACP passive or active",
        "LACP on only",
        "No channel-group needed"
      ],
      "correctIndex": 1,
      "explanation": "Both sides must use LACP with compatible modes — active/passive or active/active.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "lacp interop",
      "ckuIds": [
        "CKU-LACP",
        "CKU-ETHERCHANNEL"
      ]
    },
  ],
  '2.6': [
    {
      "id": "obj-2.6-depth-q1",
      "question": "Which AP type runs full IOS locally and does not require a WLC?",
      "choices": [
        "Lightweight AP",
        "Autonomous AP",
        "FlexConnect AP only",
        "Mesh root AP only"
      ],
      "correctIndex": 1,
      "explanation": "Autonomous (standalone) APs serve clients without a controller.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "autonomous ap",
      "ckuIds": [
        "CKU-WLAN-ARCH"
      ]
    },
    {
      "id": "obj-2.6-depth-q2",
      "question": "FlexConnect is best suited for which deployment?",
      "choices": [
        "Data center core",
        "Branch sites needing local switching with central management",
        "Home SOHO only",
        "Replacing all WLC functions"
      ],
      "correctIndex": 1,
      "explanation": "FlexConnect can switch locally at the AP and survive WAN loss to the WLC.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "flexconnect",
      "ckuIds": [
        "CKU-WLAN-ARCH"
      ]
    },
    {
      "id": "obj-2.6-depth-q3",
      "question": "Lightweight APs tunnel client data to the WLC in which default mode?",
      "choices": [
        "Local mode",
        "Sniffer mode",
        "Bridge mode",
        "Rogue detector"
      ],
      "correctIndex": 0,
      "explanation": "Local mode tunnels traffic to the WLC; FlexConnect can switch locally.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "local mode",
      "ckuIds": [
        "CKU-WLAN-ARCH"
      ]
    },
  ],
  '2.7': [
    {
      "id": "obj-2.7-depth-q1",
      "question": "CAPWAP control traffic between AP and WLC uses which UDP port?",
      "choices": [
        "5246",
        "5247",
        "69",
        "443"
      ],
      "correctIndex": 0,
      "explanation": "UDP 5246 is CAPWAP control; UDP 5247 is CAPWAP data.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "capwap ports",
      "ckuIds": [
        "CKU-WLAN-PHYS"
      ]
    },
    {
      "id": "obj-2.7-depth-q2",
      "question": "Enterprise ceiling APs typically receive power from the switch via:",
      "choices": [
        "PoE",
        "USB only",
        "External AC adapter only",
        "Battery backup"
      ],
      "correctIndex": 0,
      "explanation": "Most AP uplinks use PoE from the access switch.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "poe ap",
      "ckuIds": [
        "CKU-WLAN-PHYS"
      ]
    },
    {
      "id": "obj-2.7-depth-q3",
      "question": "An AP uplink must carry multiple VLANs for management and SSIDs. Which switchport mode fits?",
      "choices": [
        "Access with VLAN 1",
        "Trunk",
        "Dynamic auto only",
        "Shutdown"
      ],
      "correctIndex": 1,
      "explanation": "AP uplinks often use trunk to carry management and client VLANs.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "ap trunk",
      "ckuIds": [
        "CKU-WLAN-PHYS"
      ]
    },
  ],
  '2.8': [
    {
      "id": "obj-2.8-depth-q1",
      "question": "WPA2-Personal on CCNA expects which encryption?",
      "choices": [
        "WEP",
        "TKIP only",
        "AES (CCMP)",
        "RC4"
      ],
      "correctIndex": 2,
      "explanation": "WPA2-Personal uses AES/CCMP with a PSK passphrase.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "wpa2 aes",
      "ckuIds": [
        "CKU-WLAN-CLIENT"
      ]
    },
    {
      "id": "obj-2.8-depth-q2",
      "question": "Clients see the SSID but cannot get an IP address. After RF checks, what L3 item is most likely missing?",
      "choices": [
        "Change beacon interval",
        "WLAN VLAN/interface mapping and DHCP reachability",
        "Disable 2.4 GHz",
        "Increase transmit power only"
      ],
      "correctIndex": 1,
      "explanation": "SSID plus security is not enough — VLAN mapping and DHCP/DNS must work.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "wlan connectivity",
      "ckuIds": [
        "CKU-WLAN-CLIENT"
      ]
    },
    {
      "id": "obj-2.8-depth-q3",
      "question": "Dual-band SSIDs with the same name differ primarily in:",
      "choices": [
        "Encryption algorithm only",
        "Coverage, interference, and throughput per band",
        "Required PSK length",
        "CAPWAP tunnel count"
      ],
      "correctIndex": 1,
      "explanation": "2.4 GHz vs 5 GHz differ in range and performance; clients pick one band.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "dual band",
      "ckuIds": [
        "CKU-WLAN-CLIENT"
      ]
    },
  ],
  '3.5': [
    {
      "id": "obj-3.5-depth-q1",
      "question": "In HSRP, which router forwards traffic for the virtual IP?",
      "choices": [
        "Standby",
        "Active",
        "Listen",
        "Disabled"
      ],
      "correctIndex": 1,
      "explanation": "Active router forwards; Standby listens and takes over if Active fails.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "hsrp roles",
      "ckuIds": [
        "CKU-HSRP"
      ]
    },
    {
      "id": "obj-3.5-depth-q2",
      "question": "Default HSRP hello and hold timers are:",
      "choices": [
        "1 s / 3 s",
        "3 s / 10 s",
        "5 s / 15 s",
        "10 s / 30 s"
      ],
      "correctIndex": 1,
      "explanation": "Hello 3 s, hold 10 s — three missed hellos trigger failover.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "hsrp timers",
      "ckuIds": [
        "CKU-FHRP",
        "CKU-HSRP"
      ]
    },
    {
      "id": "obj-3.5-depth-q3",
      "question": "HSRP preempt allows what behavior?",
      "choices": [
        "Lower priority router stays Active forever",
        "Higher-priority router reclaims Active when it returns",
        "Virtual IP on multiple groups",
        "Disable standby election"
      ],
      "correctIndex": 1,
      "explanation": "Preempt lets the highest-priority router become Active when available.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "hsrp preempt",
      "ckuIds": [
        "CKU-HSRP"
      ]
    },
    {
      "id": "obj-3.5-depth-q4",
      "question": "Two routers show both as HSRP Active on the same LAN. First check?",
      "choices": [
        "Reload both routers",
        "Matching group number and virtual IP",
        "Disable CDP",
        "Change MAC aging"
      ],
      "correctIndex": 1,
      "explanation": "Mismatched group ID or virtual IP causes split Active — peers must match.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "hsrp split active",
      "ckuIds": [
        "CKU-HSRP"
      ]
    },
    {
      "id": "obj-3.5-depth-q5",
      "question": "Which FHRP is Cisco proprietary (not IEEE/VRRP)?",
      "choices": [
        "VRRP",
        "HSRP",
        "GLBP only on multivendor",
        "Proxy ARP"
      ],
      "correctIndex": 1,
      "explanation": "HSRP is Cisco-proprietary; VRRP is the open standard.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "fhrp compare",
      "ckuIds": [
        "CKU-FHRP",
        "CKU-HSRP"
      ]
    },
  ],
  '3.6': [
    {
      "id": "obj-3.6-depth-q1",
      "question": "Ping fails between two hosts. Recommended first three checks?",
      "choices": [
        "OSPF area ID, BGP AS, MPLS labels",
        "Interface up/up, ARP/neighbor, routing table entry",
        "DNS cache, browser proxy, Wi-Fi password",
        "SNMP community, syslog server, NTP stratum"
      ],
      "correctIndex": 1,
      "explanation": "Bottom-up: L1/L2 interface, L2 neighbor/ARP, then L3 routing.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "troubleshoot order",
      "ckuIds": [
        "CKU-ROUTE-TSHOOT"
      ]
    },
    {
      "id": "obj-3.6-depth-q2",
      "question": "A static route is configured but missing from `show ip route`. Most likely cause?",
      "choices": [
        "Wrong OSPF process ID",
        "Next-hop unreachable or exit interface down",
        "DNS failure",
        "SSH disabled"
      ],
      "correctIndex": 1,
      "explanation": "IOS drops static routes when next-hop is unreachable or interface is down.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "static route missing",
      "ckuIds": [
        "CKU-ROUTE-TSHOOT"
      ]
    },
    {
      "id": "obj-3.6-depth-q3",
      "question": "Ping fails despite a valid route — what else can block ICMP?",
      "choices": [
        "Only STP",
        "ACLs or firewalls filtering ICMP",
        "VTP revision",
        "EtherChannel mode"
      ],
      "correctIndex": 1,
      "explanation": "Valid routes do not guarantee ping success — ACLs may deny ICMP.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "acl blocks ping",
      "ckuIds": [
        "CKU-ROUTE-TSHOOT"
      ]
    },
    {
      "id": "obj-3.6-depth-q4",
      "question": "Intermittent connectivity with interface errors climbing. Check first:",
      "choices": [
        "NTP server",
        "Duplex/speed mismatch or bad cable",
        "DHCP pool size",
        "WPA2 PSK"
      ],
      "correctIndex": 1,
      "explanation": "L1/L2 errors (CRC, collisions) cause flapping before routing issues.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "l1 l2 errors",
      "ckuIds": [
        "CKU-ROUTE-TSHOOT"
      ]
    },
    {
      "id": "obj-3.6-depth-q5",
      "question": "Host reaches local subnet peers but not remote networks. Best next step?",
      "choices": [
        "Change SSID",
        "Verify default route or gateway of last resort",
        "Disable LLDP",
        "Enable PortFast on WAN"
      ],
      "correctIndex": 1,
      "explanation": "Local OK but remote fails often means missing default route or wrong gateway.",
      "type": "scenario",
      "difficulty": "easy",
      "concept": "default route",
      "ckuIds": [
        "CKU-ROUTE-TSHOOT"
      ]
    },
    {
      "id": "obj-3.6-depth-q6",
      "question": "Two-way OSPF neighbor but no learned routes. Check:",
      "choices": [
        "VTP domain",
        "Area/network mismatch or passive interface on link",
        "Telnet timeout",
        "PoE budget"
      ],
      "correctIndex": 1,
      "explanation": "Adjacency without routes — area mismatch, network statements, or passive intf.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "ospf no routes",
      "ckuIds": [
        "CKU-ROUTE-TSHOOT"
      ]
    },
    {
      "id": "obj-3.6-depth-q7",
      "question": "Adding a static route while the outbound interface is administratively down will:",
      "choices": [
        "Force the interface up",
        "Not install the route in the routing table",
        "Enable OSPF automatically",
        "Clear ARP cache"
      ],
      "correctIndex": 1,
      "explanation": "Fix interface status first — routes need up/up exit paths.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "interface down route",
      "ckuIds": [
        "CKU-ROUTE-TSHOOT"
      ]
    },
  ],
  '4.2': [
    {
      "id": "obj-4.2-depth-q1",
      "question": "NTP stratum 3 means the server is:",
      "choices": [
        "The atomic reference clock",
        "Three hops from the reference clock",
        "Unsynchronized",
        "Using manual `clock set` only"
      ],
      "correctIndex": 1,
      "explanation": "Stratum increases by one each hop from the reference; lower is closer.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "ntp stratum",
      "ckuIds": [
        "CKU-NTP"
      ]
    },
    {
      "id": "obj-4.2-depth-q2",
      "question": "Which transport does NTP use?",
      "choices": [
        "TCP 123",
        "UDP 123",
        "UDP 69",
        "TCP 443"
      ],
      "correctIndex": 1,
      "explanation": "NTP synchronizes over UDP port 123.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "ntp transport",
      "ckuIds": [
        "CKU-NTP"
      ]
    },
    {
      "id": "obj-4.2-depth-q3",
      "question": "`clock set` differs from NTP because:",
      "choices": [
        "NTP is manual one-time only",
        "`clock set` is one-time manual; NTP continuously syncs",
        "They are identical",
        "NTP requires SSH"
      ],
      "correctIndex": 1,
      "explanation": "Manual clock set drifts; NTP keeps time aligned to authoritative servers.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "clock set vs ntp",
      "ckuIds": [
        "CKU-NTP"
      ]
    },
    {
      "id": "obj-4.2-depth-q4",
      "question": "Syslog timestamps are unreliable without:",
      "choices": [
        "CDP",
        "NTP synchronization",
        "Port security",
        "VTP pruning"
      ],
      "correctIndex": 1,
      "explanation": "Correlating logs across devices requires synchronized clocks via NTP.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "ntp syslog",
      "ckuIds": [
        "CKU-NTP"
      ]
    },
    {
      "id": "obj-4.2-depth-q5",
      "question": "In `show ntp associations`, an asterisk (*) beside a server means:",
      "choices": [
        "Server unreachable",
        "Currently selected sync source",
        "Stratum 16 only",
        "ACL denied"
      ],
      "correctIndex": 1,
      "explanation": "* marks the peer selected for synchronization.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "ntp associations",
      "ckuIds": [
        "CKU-NTP"
      ]
    },
    {
      "id": "obj-4.2-depth-q6",
      "question": "Client stratum relative to its NTP server is typically:",
      "choices": [
        "Server stratum minus 1",
        "Server stratum plus 1",
        "Always 1",
        "Always 16"
      ],
      "correctIndex": 1,
      "explanation": "Each hop away from reference increments stratum by one.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "client stratum",
      "ckuIds": [
        "CKU-NTP"
      ]
    },
    {
      "id": "obj-4.2-depth-q7",
      "question": "Stratum 16 in NTP output indicates:",
      "choices": [
        "Best possible sync",
        "Unsynchronized clock",
        "GPS direct connection",
        "Leap second pending"
      ],
      "correctIndex": 1,
      "explanation": "Stratum 16 means not synchronized to any valid NTP source.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "stratum 16",
      "ckuIds": [
        "CKU-NTP"
      ]
    },
  ],
  '4.3': [
    {
      "id": "obj-4.3-depth-q1",
      "question": "Correct DHCP DORA sequence?",
      "choices": [
        "Offer, Discover, Ack, Request",
        "Discover, Offer, Request, Acknowledge",
        "Request, Discover, Offer, Ack",
        "Ack, Request, Offer, Discover"
      ],
      "correctIndex": 1,
      "explanation": "Client Discover → server Offer → client Request → server Acknowledge.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "dhcp dora",
      "ckuIds": [
        "CKU-DHCP"
      ]
    },
    {
      "id": "obj-4.3-depth-q2",
      "question": "How do DHCP clients learn DNS server addresses?",
      "choices": [
        "ARP reply",
        "DHCP option 6",
        "ICMP redirect",
        "SNMP trap"
      ],
      "correctIndex": 1,
      "explanation": "Option 6 delivers DNS server IP(s) in the DHCP lease.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "dhcp dns option",
      "ckuIds": [
        "CKU-DNS",
        "CKU-DHCP"
      ]
    },
    {
      "id": "obj-4.3-depth-q3",
      "question": "A host resolves names slowly but has IP connectivity. Check:",
      "choices": [
        "STP root bridge",
        "DNS server reachability and DHCP option 6",
        "EtherChannel load balance",
        "HSRP priority"
      ],
      "correctIndex": 1,
      "explanation": "DNS depends on correct server IPs from DHCP or static config.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "dns troubleshoot",
      "ckuIds": [
        "CKU-DNS"
      ]
    },
  ],
  '4.4': [
    {
      "id": "obj-4.4-depth-q1",
      "question": "SNMPv2c community strings are sent:",
      "choices": [
        "Encrypted with AES",
        "In clear text",
        "Only over SSH tunnel",
        "Hashed like enable secret"
      ],
      "correctIndex": 1,
      "explanation": "v2c has no encryption — use SNMPv3 for auth and privacy.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "snmpv2c security",
      "ckuIds": [
        "CKU-SNMP"
      ]
    },
    {
      "id": "obj-4.4-depth-q2",
      "question": "SNMP GET is initiated by:",
      "choices": [
        "Managed device (agent)",
        "Network management station",
        "DHCP server",
        "DNS resolver"
      ],
      "correctIndex": 1,
      "explanation": "Manager polls agents with GET/GET-NEXT; TRAPs are agent-initiated.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "snmp direction",
      "ckuIds": [
        "CKU-SNMP"
      ]
    },
    {
      "id": "obj-4.4-depth-q3",
      "question": "SNMP TRAPs are sent:",
      "choices": [
        "By manager to agent",
        "By agent to manager without polling",
        "Only on TCP 161",
        "Only during DHCP Discover"
      ],
      "correctIndex": 1,
      "explanation": "TRAP/INFORM alert the manager asynchronously.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "snmp trap",
      "ckuIds": [
        "CKU-SNMP"
      ]
    },
    {
      "id": "obj-4.4-depth-q4",
      "question": "Which SNMP version provides authentication and encryption?",
      "choices": [
        "SNMPv1",
        "SNMPv2c",
        "SNMPv3",
        "All versions equally"
      ],
      "correctIndex": 2,
      "explanation": "SNMPv3 adds user-based auth and privacy (encryption).",
      "type": "definition",
      "difficulty": "easy",
      "concept": "snmpv3",
      "ckuIds": [
        "CKU-SNMP"
      ]
    },
    {
      "id": "obj-4.4-depth-q5",
      "question": "OID in SNMP identifies:",
      "choices": [
        "MAC address of manager",
        "Managed object in the MIB tree",
        "VLAN ID",
        "OSPF router ID"
      ],
      "correctIndex": 1,
      "explanation": "Object identifiers label variables in the Management Information Base.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "snmp oid",
      "ckuIds": [
        "CKU-SNMP"
      ]
    },
    {
      "id": "obj-4.4-depth-q6",
      "question": "SNMP typically uses which ports?",
      "choices": [
        "UDP 161/162",
        "TCP 49/50",
        "UDP 69/70",
        "TCP 443 only"
      ],
      "correctIndex": 0,
      "explanation": "161 for agent queries; 162 often used for traps.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "snmp ports",
      "ckuIds": [
        "CKU-SNMP"
      ]
    },
    {
      "id": "obj-4.4-depth-q7",
      "question": "A monitoring server polls device CPU every 5 minutes using SNMP. Which operation?",
      "choices": [
        "TRAP only",
        "GET/GET-NEXT",
        "INFORM from agent only",
        "DHCP Offer"
      ],
      "correctIndex": 1,
      "explanation": "Scheduled polling uses manager-initiated GET operations.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "snmp poll",
      "ckuIds": [
        "CKU-SNMP"
      ]
    },
  ],
  '4.5': [
    {
      "id": "obj-4.5-depth-q1",
      "question": "Syslog severity 0 (emergency) compared to severity 7 (debug):",
      "choices": [
        "7 is more critical",
        "0 is most critical; lower number = more severe",
        "They are equal",
        "0 is informational only"
      ],
      "correctIndex": 1,
      "explanation": "Severity 0 emergency through 7 debug — lower is more urgent.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "syslog severity",
      "ckuIds": [
        "CKU-SYSLOG"
      ]
    },
    {
      "id": "obj-4.5-depth-q2",
      "question": "Reliable cross-device syslog correlation requires:",
      "choices": [
        "Matching hostnames only",
        "NTP-synchronized clocks",
        "Same SNMP community",
        "Identical IOS versions"
      ],
      "correctIndex": 1,
      "explanation": "Unsynced clocks make event timelines meaningless.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "syslog ntp",
      "ckuIds": [
        "CKU-SYSLOG"
      ]
    },
    {
      "id": "obj-4.5-depth-q3",
      "question": "Which syslog level is typical for interface up/down messages?",
      "choices": [
        "debug (7)",
        "notifications (5) or similar operational level",
        "emergency (0) only",
        "None — syslog ignores interfaces"
      ],
      "correctIndex": 1,
      "explanation": "Link changes are operational notifications, not emergencies.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "syslog levels",
      "ckuIds": [
        "CKU-SYSLOG"
      ]
    },
    {
      "id": "obj-4.5-depth-q4",
      "question": "Logging buffered stores messages where?",
      "choices": [
        "On remote syslog server only",
        "In device RAM (show logging)",
        "In flash permanently",
        "On DHCP server"
      ],
      "correctIndex": 1,
      "explanation": "Buffered logging keeps recent messages locally in RAM.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "logging buffered",
      "ckuIds": [
        "CKU-SYSLOG"
      ]
    },
    {
      "id": "obj-4.5-depth-q5",
      "question": "Sending syslog to a central server helps with:",
      "choices": [
        "Increasing link bandwidth",
        "Long-term retention and correlation",
        "Replacing NTP",
        "Encrypting SSH keys"
      ],
      "correctIndex": 1,
      "explanation": "Centralized logs aid auditing, troubleshooting, and compliance.",
      "type": "scenario",
      "difficulty": "easy",
      "concept": "syslog server",
      "ckuIds": [
        "CKU-SYSLOG"
      ]
    },
    {
      "id": "obj-4.5-depth-q6",
      "question": "Syslog facility identifies:",
      "choices": [
        "Router hostname",
        "Category/source of the message (e.g., auth, daemon)",
        "VLAN number",
        "OSPF cost"
      ],
      "correctIndex": 1,
      "explanation": "Facility classifies which subsystem generated the log.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "syslog facility",
      "ckuIds": [
        "CKU-SYSLOG"
      ]
    },
    {
      "id": "obj-4.5-depth-q7",
      "question": "If all syslog messages show the same timestamp from 1993, likely cause:",
      "choices": [
        "Perfect NTP sync",
        "Clock never set or NTP not configured",
        "Too many ACLs",
        "Port security shutdown"
      ],
      "correctIndex": 1,
      "explanation": "Default/unsynced clock shows stale time until NTP or manual set.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "bad timestamps",
      "ckuIds": [
        "CKU-SYSLOG"
      ]
    },
  ],
  '4.6': [
    {
      "id": "obj-4.6-depth-q1",
      "question": "Where is `ip helper-address` configured for DHCP relay?",
      "choices": [
        "DHCP server interface",
        "Router interface facing the client subnet",
        "Any loopback",
        "Switch VTP server"
      ],
      "correctIndex": 1,
      "explanation": "Helper-address goes on the client-facing L3 interface, not the server.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "helper placement",
      "ckuIds": [
        "CKU-DHCP-RELAY"
      ]
    },
    {
      "id": "obj-4.6-depth-q2",
      "question": "DHCP relay converts client broadcasts to:",
      "choices": [
        "Multicast to 224.0.0.1",
        "Unicast toward the configured server",
        "CDP updates",
        "SNMP traps"
      ],
      "correctIndex": 1,
      "explanation": "Relay forwards Discover/Request as unicast to the remote DHCP server.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "relay unicast",
      "ckuIds": [
        "CKU-DHCP-RELAY"
      ]
    },
    {
      "id": "obj-4.6-depth-q3",
      "question": "Clients on a remote subnet get APIPA 169.254.x.x. Check:",
      "choices": [
        "OSPF router ID",
        "Helper-address on client SVI and server reachability",
        "SSH version",
        "EtherChannel hash"
      ],
      "correctIndex": 1,
      "explanation": "No DHCP response — missing relay, wrong pool, or server unreachable.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "apipa relay",
      "ckuIds": [
        "CKU-DHCP-RELAY"
      ]
    },
    {
      "id": "obj-4.6-depth-q4",
      "question": "DHCP relay requires what between router and server?",
      "choices": [
        "Same broadcast domain only",
        "Routable IP path to the server",
        "Identical MAC addresses",
        "WEP encryption"
      ],
      "correctIndex": 1,
      "explanation": "Relay router must reach the server via L3 routing.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "relay routing",
      "ckuIds": [
        "CKU-DHCP-RELAY"
      ]
    },
    {
      "id": "obj-4.6-depth-q5",
      "question": "Which UDP ports does DHCP relay typically forward?",
      "choices": [
        "67 and 68",
        "443 and 80",
        "49 and 50",
        "161 and 162"
      ],
      "correctIndex": 0,
      "explanation": "DHCP uses UDP 67 (server) and 68 (client).",
      "type": "definition",
      "difficulty": "easy",
      "concept": "dhcp ports",
      "ckuIds": [
        "CKU-DHCP-RELAY"
      ]
    },
    {
      "id": "obj-4.6-depth-q6",
      "question": "Multiple VLANs need remote DHCP. You configure:",
      "choices": [
        "One helper per client-facing SVI that needs relay",
        "Helper only on server",
        "Helper on every switch access port",
        "No helper if router exists"
      ],
      "correctIndex": 0,
      "explanation": "Each client subnet interface that needs relay gets its own helper-address.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "multi vlan relay",
      "ckuIds": [
        "CKU-DHCP-RELAY"
      ]
    },
    {
      "id": "obj-4.6-depth-q7",
      "question": "Placing helper-address on the DHCP server side will:",
      "choices": [
        "Work correctly always",
        "Not relay client broadcasts from remote subnets",
        "Enable NAT automatically",
        "Disable DNS"
      ],
      "correctIndex": 1,
      "explanation": "Helper must face clients — server-side config does not catch client broadcasts.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "wrong helper side",
      "ckuIds": [
        "CKU-DHCP-RELAY"
      ]
    },
  ],
  '4.7': [
    {
      "id": "obj-4.7-depth-q1",
      "question": "QoS on a congested link primarily:",
      "choices": [
        "Creates additional bandwidth",
        "Prioritizes and manages existing bandwidth",
        "Disables queuing",
        "Replaces routing"
      ],
      "correctIndex": 1,
      "explanation": "QoS uses marking and queuing (PHB) — it does not add capacity.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "qos purpose",
      "ckuIds": [
        "CKU-QOS-PHB"
      ]
    },
    {
      "id": "obj-4.7-depth-q2",
      "question": "DSCP EF (Expedited Forwarding) decimal value is:",
      "choices": [
        "0",
        "46",
        "63",
        "255"
      ],
      "correctIndex": 1,
      "explanation": "EF = 46 — often mapped to strict priority queue for voice/video.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "dscp ef",
      "ckuIds": [
        "CKU-QOS-PHB"
      ]
    },
    {
      "id": "obj-4.7-depth-q3",
      "question": "Without QoS on a saturated WAN, traffic is typically:",
      "choices": [
        "Strict priority for all",
        "Best-effort FIFO",
        "Always dropped",
        "Encrypted automatically"
      ],
      "correctIndex": 1,
      "explanation": "Default is first-in-first-out best effort when congested.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "default qos",
      "ckuIds": [
        "CKU-QOS-PHB"
      ]
    },
  ],
  '4.8': [
    {
      "id": "obj-4.8-depth-q1",
      "question": "Before restricting VTY to SSH, you must:",
      "choices": [
        "Disable CDP",
        "Generate RSA keys (`crypto key generate rsa`) and set domain-name",
        "Enable Telnet",
        "Configure DHCP relay"
      ],
      "correctIndex": 1,
      "explanation": "SSH requires hostname/domain and RSA keys on Cisco IOS.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "ssh prerequisites",
      "ckuIds": [
        "CKU-SSH"
      ]
    },
    {
      "id": "obj-4.8-depth-q2",
      "question": "Telnet vs SSH for device management:",
      "choices": [
        "Telnet encrypts credentials",
        "SSH encrypts the session; Telnet is cleartext",
        "Both use UDP",
        "SSH requires no keys"
      ],
      "correctIndex": 1,
      "explanation": "CCNA expects SSH-only remote access — Telnet exposes passwords.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "telnet vs ssh",
      "ckuIds": [
        "CKU-SSH"
      ]
    },
    {
      "id": "obj-4.8-depth-q3",
      "question": "Which vty line command restricts inbound protocols to SSH?",
      "choices": [
        "transport input telnet",
        "transport input ssh",
        "login password only",
        "ip ssh version 1 only"
      ],
      "correctIndex": 1,
      "explanation": "`transport input ssh` blocks Telnet on vty lines.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "transport input ssh",
      "ckuIds": [
        "CKU-SSH"
      ]
    },
    {
      "id": "obj-4.8-depth-q4",
      "question": "SSH works but login fails for local user. Check:",
      "choices": [
        "OSPF network statement",
        "`login local` on vty and username configured",
        "VTP mode",
        "Port-channel mode"
      ],
      "correctIndex": 1,
      "explanation": "Local user auth needs username + `login local` on vty lines.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "login local",
      "ckuIds": [
        "CKU-SSH"
      ]
    },
    {
      "id": "obj-4.8-depth-q5",
      "question": "Default SSH version on modern IOS should be:",
      "choices": [
        "SSH v1 only",
        "SSH version 2",
        "Telnet preferred",
        "No version setting"
      ],
      "correctIndex": 1,
      "explanation": "Use SSH v2 — v1 is deprecated and insecure.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "ssh version",
      "ckuIds": [
        "CKU-SSH"
      ]
    },
    {
      "id": "obj-4.8-depth-q6",
      "question": "Crypto key generation fails until you configure:",
      "choices": [
        "NTP server",
        "IP domain-name",
        "SNMP community",
        "HSRP group"
      ],
      "correctIndex": 1,
      "explanation": "IOS requires domain-name before RSA key generation.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "domain name ssh",
      "ckuIds": [
        "CKU-SSH"
      ]
    },
    {
      "id": "obj-4.8-depth-q7",
      "question": "Verify SSH is enabled with:",
      "choices": [
        "show ip ssh",
        "show cdp neighbors",
        "show vlan brief",
        "show standby"
      ],
      "correctIndex": 0,
      "explanation": "`show ip ssh` confirms SSH v2 and key status.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "verify ssh",
      "ckuIds": [
        "CKU-SSH"
      ]
    },
  ],
  '4.10': [
    {
      "id": "obj-4.10-depth-q1",
      "question": "DNA Center compared to box-by-box CLI primarily adds:",
      "choices": [
        "Eliminates all local device CLI",
        "Centralized design, provisioning, and assurance",
        "Removes need for routing",
        "Disables SSH everywhere"
      ],
      "correctIndex": 1,
      "explanation": "Cloud/controller tools orchestrate at scale; CLI remains on devices.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "dna center",
      "ckuIds": [
        "CKU-MGMT-CLOUD"
      ]
    },
    {
      "id": "obj-4.10-depth-q2",
      "question": "Intent-based networking means:",
      "choices": [
        "Manual CLI on every change",
        "Declare desired outcome; controller translates to config",
        "Disable automation",
        "Use Telnet for speed"
      ],
      "correctIndex": 1,
      "explanation": "Intent policies map business goals to device configuration.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "intent based",
      "ckuIds": [
        "CKU-MGMT-CLOUD"
      ]
    },
    {
      "id": "obj-4.10-depth-q3",
      "question": "During WAN outage to cloud controller, engineers still need:",
      "choices": [
        "Only social media",
        "Console or local SSH to devices",
        "No access ever",
        "DHCP server reboot"
      ],
      "correctIndex": 1,
      "explanation": "Local out-of-band access remains critical when cloud is unreachable.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "local access",
      "ckuIds": [
        "CKU-MGMT-CLOUD"
      ]
    },
    {
      "id": "obj-4.10-depth-q4",
      "question": "On-box IOS CLI and DNA Center are:",
      "choices": [
        "Mutually exclusive",
        "Complementary — CLI for troubleshoot, DNA for orchestration",
        "Identical products",
        "Only for wireless"
      ],
      "correctIndex": 1,
      "explanation": "DNA orchestrates; IOS CLI still exists per device.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "cli vs cloud",
      "ckuIds": [
        "CKU-MGMT-CLOUD"
      ]
    },
    {
      "id": "obj-4.10-depth-q5",
      "question": "Cloud management improves operational consistency by:",
      "choices": [
        "Random config drift",
        "Templates and policy applied across many devices",
        "Removing VLANs",
        "Disabling logging"
      ],
      "correctIndex": 1,
      "explanation": "Central templates reduce one-off CLI errors at scale.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "cloud consistency",
      "ckuIds": [
        "CKU-MGMT-CLOUD"
      ]
    },
    {
      "id": "obj-4.10-depth-q6",
      "question": "Assurance/analytics in campus controllers helps:",
      "choices": [
        "Replace IP addressing",
        "Validate health and detect issues proactively",
        "Remove need for STP",
        "Disable PoE"
      ],
      "correctIndex": 1,
      "explanation": "Assurance monitors client experience and network health.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "assurance",
      "ckuIds": [
        "CKU-MGMT-CLOUD"
      ]
    },
    {
      "id": "obj-4.10-depth-q7",
      "question": "Local device management is preferred when:",
      "choices": [
        "Cloud is unreachable or for bootstrap/console recovery",
        "Never — cloud only",
        "Only on weekends",
        "Replacing all switches"
      ],
      "correctIndex": 0,
      "explanation": "Console/local CLI is the fallback during outages and initial setup.",
      "type": "scenario",
      "difficulty": "easy",
      "concept": "when local",
      "ckuIds": [
        "CKU-MGMT-CLOUD"
      ]
    },
  ],
  '5.2': [
    {
      "id": "obj-5.2-depth-q1",
      "question": "Security program three pillars are:",
      "choices": [
        "Only firewalls",
        "People, process, and technology",
        "VLANs, trunks, and STP",
        "DNS, DHCP, and NTP"
      ],
      "correctIndex": 1,
      "explanation": "Effective programs combine training, procedures, and technical controls.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "security pillars",
      "ckuIds": [
        "CKU-SECURITY-PROGRAM"
      ]
    },
    {
      "id": "obj-5.2-depth-q2",
      "question": "Physical security in a network program protects:",
      "choices": [
        "Only cloud APIs",
        "Consoles, racks, and cabling from unauthorized access",
        "Only wireless SSIDs",
        "OSPF LSAs"
      ],
      "correctIndex": 1,
      "explanation": "Physical access can bypass logical controls — secure equipment rooms.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "physical security",
      "ckuIds": [
        "CKU-SECURITY-PROGRAM"
      ]
    },
    {
      "id": "obj-5.2-depth-q3",
      "question": "Deploying ACLs alone is insufficient because:",
      "choices": [
        "ACLs never work",
        "A program also needs people training and incident response process",
        "ACLs replace AAA",
        "ACLs encrypt traffic"
      ],
      "correctIndex": 1,
      "explanation": "Technology is one layer — process and people complete the program.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "program not acl only",
      "ckuIds": [
        "CKU-SECURITY-PROGRAM"
      ]
    },
  ],
  '5.3': [
    {
      "id": "obj-5.3-depth-q1",
      "question": "Preferred command for enable password storage?",
      "choices": [
        "enable password",
        "enable secret",
        "password enable plain",
        "service password-recovery only"
      ],
      "correctIndex": 1,
      "explanation": "`enable secret` stores a hashed password; `enable password` is reversible.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "enable secret",
      "ckuIds": [
        "CKU-PRIVILEGE-LEVELS"
      ]
    },
    {
      "id": "obj-5.3-depth-q2",
      "question": "Secure remote vty access pattern includes:",
      "choices": [
        "Telnet + no login",
        "Local user, login local, transport input ssh, RSA keys",
        "Console only forever",
        "SNMP public community"
      ],
      "correctIndex": 1,
      "explanation": "Combine local/AAA auth with SSH transport and keys.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "secure vty",
      "ckuIds": [
        "CKU-CONSOLE-VTY"
      ]
    },
    {
      "id": "obj-5.3-depth-q3",
      "question": "Telnet with `login local` still fails CCNA security because:",
      "choices": [
        "Credentials traverse the network in clear text",
        "Local users do not exist",
        "SSH is slower only",
        "VTY lines cannot authenticate"
      ],
      "correctIndex": 0,
      "explanation": "Local auth does not encrypt Telnet sessions — use SSH.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "telnet insecure",
      "ckuIds": [
        "CKU-CONSOLE-VTY"
      ]
    },
    {
      "id": "obj-5.3-depth-q4",
      "question": "Console port should typically have:",
      "choices": [
        "No authentication",
        "Login/password or AAA authentication",
        "Open access for speed",
        "SSH only (no serial)"
      ],
      "correctIndex": 1,
      "explanation": "Physical console access should still require authentication.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "console auth",
      "ckuIds": [
        "CKU-CONSOLE-VTY"
      ]
    },
    {
      "id": "obj-5.3-depth-q5",
      "question": "Privilege level 15 allows:",
      "choices": [
        "Read-only show commands only",
        "Full exec (enable-equivalent) access",
        "No configuration mode",
        "Wireless client association"
      ],
      "correctIndex": 1,
      "explanation": "Level 15 is full privileged EXEC on Cisco IOS.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "privilege 15",
      "ckuIds": [
        "CKU-PRIVILEGE-LEVELS"
      ]
    },
    {
      "id": "obj-5.3-depth-q6",
      "question": "Which encrypts the password in the running config for local users?",
      "choices": [
        "username bob password bob123",
        "username bob secret bob123",
        "enable password bob123",
        "line vty 0 4 password bob123 only"
      ],
      "correctIndex": 1,
      "explanation": "`secret` hashes the password; plain `password` does not.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "username secret",
      "ckuIds": [
        "CKU-PRIVILEGE-LEVELS"
      ]
    },
    {
      "id": "obj-5.3-depth-q7",
      "question": "Restricting `transport input ssh` without keys generated causes:",
      "choices": [
        "Automatic key creation",
        "SSH sessions fail — generate RSA keys first",
        "Telnet still preferred",
        "OSPF adjacency loss"
      ],
      "correctIndex": 1,
      "explanation": "SSH requires crypto keys before vty can accept SSH connections.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "ssh keys required",
      "ckuIds": [
        "CKU-CONSOLE-VTY",
        "CKU-PRIVILEGE-LEVELS"
      ]
    },
  ],
  '5.4': [
    {
      "id": "obj-5.4-depth-q1",
      "question": "TACACS+ uses which transport and port?",
      "choices": [
        "UDP 1812",
        "TCP 49",
        "TCP 443 only",
        "UDP 69"
      ],
      "correctIndex": 1,
      "explanation": "TACACS+ is Cisco TCP/49 with separate AAA functions.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "tacacs port",
      "ckuIds": [
        "CKU-AAA-SERVERS"
      ]
    },
    {
      "id": "obj-5.4-depth-q2",
      "question": "RADIUS authentication typically uses:",
      "choices": [
        "TCP 49",
        "UDP 1812",
        "UDP 5246",
        "TCP 21"
      ],
      "correctIndex": 1,
      "explanation": "RADIUS auth uses UDP 1812 (accounting often 1813).",
      "type": "definition",
      "difficulty": "easy",
      "concept": "radius port",
      "ckuIds": [
        "CKU-AAA-SERVERS"
      ]
    },
    {
      "id": "obj-5.4-depth-q3",
      "question": "Per-command authorization on Cisco IOS is best with:",
      "choices": [
        "RADIUS only",
        "TACACS+ (separate auth/authorization/accounting)",
        "SNMPv2c",
        "CDP"
      ],
      "correctIndex": 1,
      "explanation": "TACACS+ can authorize each CLI command; RADIUS is coarser.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "command auth",
      "ckuIds": [
        "CKU-AAA-SERVERS"
      ]
    },
    {
      "id": "obj-5.4-depth-q4",
      "question": "AAA configuration order of operations conceptually:",
      "choices": [
        "Accounting → Auth → Authorization",
        "Authentication → Authorization → Accounting",
        "Authorization only",
        "NAT → ACL → AAA"
      ],
      "correctIndex": 1,
      "explanation": "Verify identity, decide permissions, then log activity.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "aaa order",
      "ckuIds": [
        "CKU-AAA-SERVERS"
      ]
    },
    {
      "id": "obj-5.4-depth-q5",
      "question": "Centralized login for many routers commonly uses:",
      "choices": [
        "Unique enable secret per device only",
        "TACACS+ or RADIUS server",
        "Telnet to VLAN 1",
        "WEP keys"
      ],
      "correctIndex": 1,
      "explanation": "AAA servers centralize credentials and authorization policy.",
      "type": "scenario",
      "difficulty": "easy",
      "concept": "centralized aaa",
      "ckuIds": [
        "CKU-AAA-SERVERS"
      ]
    },
    {
      "id": "obj-5.4-depth-q6",
      "question": "TACACS+ differs from RADIUS primarily because TACACS+:",
      "choices": [
        "Uses only UDP",
        "Separates authentication, authorization, and accounting on TCP",
        "Has no encryption options",
        "Only works on wireless"
      ],
      "correctIndex": 1,
      "explanation": "TACACS+ is TCP-based with granular AAA separation.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "tacacs vs radius",
      "ckuIds": [
        "CKU-AAA-SERVERS"
      ]
    },
    {
      "id": "obj-5.4-depth-q7",
      "question": "Accounting in AAA provides:",
      "choices": [
        "Encryption of all traffic",
        "Audit logs of user sessions and commands",
        "DHCP leases",
        "OSPF metrics"
      ],
      "correctIndex": 1,
      "explanation": "Accounting records who did what and when for compliance.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "aaa accounting",
      "ckuIds": [
        "CKU-AAA-SERVERS"
      ]
    },
  ],
  '5.6': [
    {
      "id": "obj-5.6-depth-q1",
      "question": "Port security violation mode that err-disables the port:",
      "choices": [
        "Protect",
        "Restrict",
        "Shutdown",
        "Permit all"
      ],
      "correctIndex": 2,
      "explanation": "Shutdown mode err-disables the interface on violation.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "port sec shutdown",
      "ckuIds": [
        "CKU-PORT-SECURITY"
      ]
    },
    {
      "id": "obj-5.6-depth-q2",
      "question": "DHCP snooping trusted ports are typically configured on:",
      "choices": [
        "All access ports",
        "Uplinks toward the legitimate DHCP server",
        "Console port",
        "Disabled VLANs only"
      ],
      "correctIndex": 1,
      "explanation": "Trusted uplinks allow server messages; untrusted access ports drop rogue offers.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "dhcp snooping trusted",
      "ckuIds": [
        "CKU-DHCP-SNOOPING"
      ]
    },
    {
      "id": "obj-5.6-depth-q3",
      "question": "Dynamic ARP Inspection (DAI) uses which table?",
      "choices": [
        "MAC address-table only",
        "DHCP snooping binding table",
        "OSPF LSDB",
        "NAT translation table"
      ],
      "correctIndex": 1,
      "explanation": "DAI validates ARP against DHCP snooping bindings on untrusted ports.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "dai binding",
      "ckuIds": [
        "CKU-DHCP-SNOOPING"
      ]
    },
    {
      "id": "obj-5.6-depth-q4",
      "question": "Port security `maximum` limits:",
      "choices": [
        "VLAN count",
        "Number of MAC addresses allowed on the port",
        "STP priority",
        "PoE wattage"
      ],
      "correctIndex": 1,
      "explanation": "Limits learned/sticky MACs — excess triggers violation action.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "port sec maximum",
      "ckuIds": [
        "CKU-PORT-SECURITY"
      ]
    },
    {
      "id": "obj-5.6-depth-q5",
      "question": "Rogue DHCP server on access VLAN — best L2 mitigation:",
      "choices": [
        "Disable STP",
        "Enable DHCP snooping with untrusted access ports",
        "Increase native VLAN",
        "Use Telnet"
      ],
      "correctIndex": 1,
      "explanation": "Snooping drops unauthorized DHCP offers on untrusted ports.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "rogue dhcp",
      "ckuIds": [
        "CKU-DHCP-SNOOPING"
      ]
    },
    {
      "id": "obj-5.6-depth-q6",
      "question": "Sticky MAC in port security:",
      "choices": [
        "Clears MAC table hourly",
        "Learns and saves allowed MAC in running config",
        "Disables encryption",
        "Enables OSPF"
      ],
      "correctIndex": 1,
      "explanation": "Sticky dynamically learns and can persist permitted MAC addresses.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "sticky mac",
      "ckuIds": [
        "CKU-PORT-SECURITY"
      ]
    },
    {
      "id": "obj-5.6-depth-q7",
      "question": "Protect vs Restrict violation modes differ because Restrict:",
      "choices": [
        "Allows unlimited MACs",
        "Drops traffic and increments SNMP/syslog counters",
        "Shuts down the switch",
        "Only works on trunks"
      ],
      "correctIndex": 1,
      "explanation": "Restrict drops and logs; Protect drops silently without syslog counter.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "protect vs restrict",
      "ckuIds": [
        "CKU-PORT-SECURITY"
      ]
    },
  ],
  '5.7': [
    {
      "id": "obj-5.7-depth-q1",
      "question": "Authentication in AAA answers:",
      "choices": [
        "What commands are allowed",
        "Who you are (identity verification)",
        "Audit trail only",
        "Which VLAN to assign"
      ],
      "correctIndex": 1,
      "explanation": "AuthN verifies identity before authorization decisions.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "authentication",
      "ckuIds": [
        "CKU-AAA-CONCEPTS"
      ]
    },
    {
      "id": "obj-5.7-depth-q2",
      "question": "Authorization in AAA determines:",
      "choices": [
        "Only password length",
        "What the authenticated user is permitted to do",
        "Syslog server IP",
        "NTP stratum"
      ],
      "correctIndex": 1,
      "explanation": "AuthZ defines permitted actions/commands after login.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "authorization",
      "ckuIds": [
        "CKU-AAA-CONCEPTS"
      ]
    },
    {
      "id": "obj-5.7-depth-q3",
      "question": "Accounting logs are used for:",
      "choices": [
        "Increasing bandwidth",
        "Audit and compliance tracking of sessions/commands",
        "DHCP pool sizing",
        "Wireless channel selection"
      ],
      "correctIndex": 1,
      "explanation": "Accounting records activity — not just failed logins.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "accounting audit",
      "ckuIds": [
        "CKU-AAA-CONCEPTS"
      ]
    },
  ],
  '5.8': [
    {
      "id": "obj-5.8-depth-q1",
      "question": "Enterprise WLAN encryption standard on CCNA is:",
      "choices": [
        "WEP",
        "WPA2-AES (CCMP) or WPA3",
        "Open authentication",
        "RC4 only"
      ],
      "correctIndex": 1,
      "explanation": "WEP is broken; use WPA2-AES or WPA3.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "wlan encryption",
      "ckuIds": [
        "CKU-WLAN-SEC"
      ]
    },
    {
      "id": "obj-5.8-depth-q2",
      "question": "WPA3-Personal improves key exchange using:",
      "choices": [
        "WEP IV",
        "SAE (Simultaneous Authentication of Equals)",
        "Telnet",
        "CDP"
      ],
      "correctIndex": 1,
      "explanation": "SAE strengthens PSK handshake vs WPA2.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "wpa3 sae",
      "ckuIds": [
        "CKU-WLAN-SEC"
      ]
    },
    {
      "id": "obj-5.8-depth-q3",
      "question": "WEP should not be used because:",
      "choices": [
        "It is too slow",
        "It is cryptographically broken and easily cracked",
        "It requires WPA3 hardware only",
        "It disables AES"
      ],
      "correctIndex": 1,
      "explanation": "WEP IV reuse makes it unsuitable for any production WLAN.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "wep broken",
      "ckuIds": [
        "CKU-WLAN-SEC"
      ]
    },
    {
      "id": "obj-5.8-depth-q4",
      "question": "802.1X enterprise WLAN authentication uses:",
      "choices": [
        "Shared PSK only",
        "RADIUS server for per-user auth",
        "SNMP community",
        "Static WEP keys"
      ],
      "correctIndex": 1,
      "explanation": "Enterprise mode uses 802.1X with RADIUS — distinct from WPA2-PSK.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "802.1x radius",
      "ckuIds": [
        "CKU-WLAN-SEC"
      ]
    },
    {
      "id": "obj-5.8-depth-q5",
      "question": "TKIP-only WLANs are discouraged because:",
      "choices": [
        "TKIP is faster than AES",
        "CCNA expects AES/CCMP for WPA2 — TKIP is legacy",
        "TKIP requires fiber",
        "TKIP disables SSID"
      ],
      "correctIndex": 1,
      "explanation": "AES/CCMP is the modern WPA2 encryption standard.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "tkip legacy",
      "ckuIds": [
        "CKU-WLAN-SEC"
      ]
    },
    {
      "id": "obj-5.8-depth-q6",
      "question": "Management frame protection helps prevent:",
      "choices": [
        "DHCP exhaustion",
        "Some deauth/disassoc attacks",
        "Cable breaks",
        "STP loops"
      ],
      "correctIndex": 1,
      "explanation": "802.11w protects management frames from spoofing.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "mgmt frame protection",
      "ckuIds": [
        "CKU-WLAN-SEC"
      ]
    },
    {
      "id": "obj-5.8-depth-q7",
      "question": "Guest WLAN best practice includes:",
      "choices": [
        "Same VLAN as servers",
        "Segmentation from internal resources",
        "Shared admin credentials",
        "WEP for compatibility"
      ],
      "correctIndex": 1,
      "explanation": "Guest traffic should be isolated from trusted corporate segments.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "guest segmentation",
      "ckuIds": [
        "CKU-WLAN-SEC"
      ]
    },
  ],
  '5.9': [
    {
      "id": "obj-5.9-depth-q1",
      "question": "What does the WPA2 4-way handshake accomplish?",
      "choices": [
        "Assigns DHCP address",
        "Derives unique per-session keys (PTK) from the PSK",
        "Enables CDP on AP",
        "Configures OSPF on WLC"
      ],
      "correctIndex": 1,
      "explanation": "Each session gets unique encryption keys derived from the shared passphrase.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "4-way handshake",
      "ckuIds": [
        "CKU-WPA2-PSK"
      ]
    },
  ],
  '5.10': [
    {
      "id": "obj-5.10-depth-q1",
      "question": "Site-to-site VPN connects:",
      "choices": [
        "Individual users to email",
        "Networks gateway-to-gateway",
        "Only wireless clients",
        "DNS servers only"
      ],
      "correctIndex": 1,
      "explanation": "Site-to-site links entire networks via VPN gateways.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "site to site",
      "ckuIds": [
        "CKU-VPN"
      ]
    },
    {
      "id": "obj-5.10-depth-q2",
      "question": "Remote-access VPN serves:",
      "choices": [
        "Branch routers only",
        "Individual users connecting to corporate network",
        "Only DHCP servers",
        "STP root bridges"
      ],
      "correctIndex": 1,
      "explanation": "Remote-access VPNs terminate user tunnels (client VPN).",
      "type": "definition",
      "difficulty": "easy",
      "concept": "remote access vpn",
      "ckuIds": [
        "CKU-VPN"
      ]
    },
    {
      "id": "obj-5.10-depth-q3",
      "question": "IPsec ESP primarily provides:",
      "choices": [
        "Only routing updates",
        "Confidentiality and integrity for payload",
        "DHCP relay",
        "VLAN tagging"
      ],
      "correctIndex": 1,
      "explanation": "ESP encrypts and authenticates packet payload.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "ipsec esp",
      "ckuIds": [
        "CKU-VPN"
      ]
    },
    {
      "id": "obj-5.10-depth-q4",
      "question": "AH in IPsec provides:",
      "choices": [
        "Payload encryption only",
        "Authentication and integrity without encrypting payload",
        "NAT overload",
        "Wireless association"
      ],
      "correctIndex": 1,
      "explanation": "Authentication Header verifies integrity; ESP adds encryption.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "ipsec ah",
      "ckuIds": [
        "CKU-VPN"
      ]
    },
    {
      "id": "obj-5.10-depth-q5",
      "question": "Split tunneling in remote-access VPN means:",
      "choices": [
        "All traffic forced through VPN",
        "Some traffic via VPN, other traffic direct to Internet",
        "No encryption used",
        "Only site-to-site allowed"
      ],
      "correctIndex": 1,
      "explanation": "Split tunnel sends corporate traffic through VPN; local browsing may go direct.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "split tunnel",
      "ckuIds": [
        "CKU-VPN"
      ]
    },
    {
      "id": "obj-5.10-depth-q6",
      "question": "VPN confidentiality primarily protects against:",
      "choices": [
        "Physical theft of switch",
        "Eavesdropping on traffic crossing untrusted networks",
        "STP misconfiguration",
        "Duplicate MAC on LAN"
      ],
      "correctIndex": 1,
      "explanation": "Encryption secures data traversing public/untrusted paths.",
      "type": "scenario",
      "difficulty": "easy",
      "concept": "vpn confidentiality",
      "ckuIds": [
        "CKU-VPN"
      ]
    },
    {
      "id": "obj-5.10-depth-q7",
      "question": "GRE tunnel without IPsec provides:",
      "choices": [
        "Encryption by default",
        "Encapsulation but no encryption — pair with IPsec for security",
        "DHCP snooping",
        "Automatic AAA"
      ],
      "correctIndex": 1,
      "explanation": "GRE wraps packets; add IPsec for confidentiality/integrity.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "gre vs ipsec",
      "ckuIds": [
        "CKU-VPN"
      ]
    },
  ],
  '5.11': [
    {
      "id": "obj-5.11-depth-q1",
      "question": "VLANs alone secure a network because:",
      "choices": [
        "They encrypt all traffic",
        "False — VLANs are L2 boundaries; routing/ACLs/firewalls still needed",
        "They replace firewalls",
        "They disable inter-VLAN routing"
      ],
      "correctIndex": 1,
      "explanation": "Segmentation requires L3 controls between VLANs.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "vlan not enough",
      "ckuIds": [
        "CKU-SEGMENTATION"
      ]
    },
    {
      "id": "obj-5.11-depth-q2",
      "question": "Micro-segmentation goal is to:",
      "choices": [
        "Use one flat VLAN",
        "Limit lateral movement by dividing trust zones",
        "Disable all ACLs",
        "Remove firewalls"
      ],
      "correctIndex": 1,
      "explanation": "Smaller trust zones contain breaches (VLANs, VRFs, firewalls).",
      "type": "definition",
      "difficulty": "medium",
      "concept": "micro segmentation",
      "ckuIds": [
        "CKU-SEGMENTATION"
      ]
    },
    {
      "id": "obj-5.11-depth-q3",
      "question": "DMZ segment typically hosts:",
      "choices": [
        "Internal domain controllers only",
        "Public-facing servers isolated from internal LAN",
        "Backup tapes only",
        "STP root switch"
      ],
      "correctIndex": 1,
      "explanation": "DMZ exposes services to untrusted networks with controlled access inward.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "dmz",
      "ckuIds": [
        "CKU-SEGMENTATION"
      ]
    },
    {
      "id": "obj-5.11-depth-q4",
      "question": "East-west traffic refers to:",
      "choices": [
        "Internet to firewall only",
        "Communication between systems inside the data center/campus",
        "Only wireless clients",
        "NTP to stratum 1"
      ],
      "correctIndex": 1,
      "explanation": "East-west is intra-datacenter; north-south is edge/internet.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "east west",
      "ckuIds": [
        "CKU-SEGMENTATION"
      ]
    },
    {
      "id": "obj-5.11-depth-q5",
      "question": "Zero trust networking emphasizes:",
      "choices": [
        "Trust all internal VLAN traffic",
        "Verify explicitly — never trust by network location alone",
        "Remove authentication",
        "Single flat network"
      ],
      "correctIndex": 1,
      "explanation": "Zero trust verifies every access regardless of segment.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "zero trust",
      "ckuIds": [
        "CKU-SEGMENTATION"
      ]
    },
    {
      "id": "obj-5.11-depth-q6",
      "question": "Placing servers and users in one VLAN without ACLs risks:",
      "choices": [
        "Nothing — VLANs fully isolate",
        "Lateral movement if one host is compromised",
        "Automatic encryption",
        "OSPF split horizon only"
      ],
      "correctIndex": 1,
      "explanation": "Same VLAN = same broadcast domain — hosts can reach each other at L2.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "flat vlan risk",
      "ckuIds": [
        "CKU-SEGMENTATION"
      ]
    },
    {
      "id": "obj-5.11-depth-q7",
      "question": "Firewall between internal segments provides:",
      "choices": [
        "Only PoE budgeting",
        "Policy enforcement between trust zones",
        "DHCP pool expansion",
        "CDP neighbor discovery"
      ],
      "correctIndex": 1,
      "explanation": "Firewalls filter and log traffic crossing segment boundaries.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "firewall segments",
      "ckuIds": [
        "CKU-SEGMENTATION"
      ]
    },
  ],
  '6.1': [
    {
      "id": "obj-6.1-depth-q1",
      "question": "Primary operational benefit of network automation:",
      "choices": [
        "Eliminates IP addressing",
        "Faster repeatable changes with fewer manual CLI errors",
        "Removes routing protocols",
        "Guarantees zero drift forever"
      ],
      "correctIndex": 1,
      "explanation": "Automation scales consistent deployment and reduces human error.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "automation benefit",
      "ckuIds": [
        "CKU-AUTOMATION"
      ]
    },
    {
      "id": "obj-6.1-depth-q2",
      "question": "After adopting Ansible for switches, engineers spend more time on:",
      "choices": [
        "Templates, validation, and automation maintenance",
        "Eliminating all show commands",
        "Ignoring VLAN design",
        "Removing change windows"
      ],
      "correctIndex": 0,
      "explanation": "Role shifts from repetitive CLI to code/templates and verification.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "role shift",
      "ckuIds": [
        "CKU-AUTOMATION"
      ]
    },
  ],
  '6.2': [
    {
      "id": "obj-6.2-depth-q1",
      "question": "Traditional vs SDN control plane:",
      "choices": [
        "Both always centralized",
        "Traditional: per-device; SDN: centralized controller",
        "SDN removes data plane from switches",
        "Traditional has no CLI"
      ],
      "correctIndex": 1,
      "explanation": "SDN centralizes control; data plane stays on devices.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "sdn control",
      "ckuIds": [
        "CKU-SDN-TRAD"
      ]
    },
    {
      "id": "obj-6.2-depth-q2",
      "question": "Data plane in SDN remains:",
      "choices": [
        "Only in the cloud",
        "Distributed on network devices forwarding traffic",
        "Removed entirely",
        "Only on laptops"
      ],
      "correctIndex": 1,
      "explanation": "SDN separates control; forwarding still happens on switches/routers.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "data plane sdn",
      "ckuIds": [
        "CKU-SDN-TRAD"
      ]
    },
    {
      "id": "obj-6.2-depth-q3",
      "question": "Centralized control plane benefit:",
      "choices": [
        "Random per-box policy drift",
        "Consistent policy and API-driven changes at scale",
        "No visibility",
        "Mandatory Telnet"
      ],
      "correctIndex": 1,
      "explanation": "Controller pushes uniform policy and offers programmatic access.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "centralized benefit",
      "ckuIds": [
        "CKU-SDN-TRAD"
      ]
    },
    {
      "id": "obj-6.2-depth-q4",
      "question": "Traditional network troubleshooting often starts with:",
      "choices": [
        "Only REST API",
        "Per-device CLI show commands",
        "Deleting all VLANs",
        "Disabling STP globally"
      ],
      "correctIndex": 1,
      "explanation": "Box-by-box CLI remains common in traditional ops.",
      "type": "scenario",
      "difficulty": "easy",
      "concept": "traditional troubleshoot",
      "ckuIds": [
        "CKU-SDN-TRAD"
      ]
    },
    {
      "id": "obj-6.2-depth-q5",
      "question": "Controller-based networking adds:",
      "choices": [
        "Less visibility",
        "Programmatic policy and centralized state",
        "No need for IP subnets",
        "Removal of all trunks"
      ],
      "correctIndex": 1,
      "explanation": "Controllers expose APIs and unified view of the network.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "controller benefits",
      "ckuIds": [
        "CKU-SDN-TRAD"
      ]
    },
    {
      "id": "obj-6.2-depth-q6",
      "question": "SDN does NOT mean:",
      "choices": [
        "APIs for network programmability",
        "Eliminating all local forwarding hardware",
        "Separation of control and data plane",
        "Central policy orchestration"
      ],
      "correctIndex": 1,
      "explanation": "Devices still forward — control is centralized, not forwarding removed.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "sdn misconception",
      "ckuIds": [
        "CKU-SDN-TRAD"
      ]
    },
    {
      "id": "obj-6.2-depth-q7",
      "question": "Hybrid operations may include:",
      "choices": [
        "Controllers plus CLI on devices for validation",
        "Controllers only — never CLI",
        "No automation ever",
        "Only wireless"
      ],
      "correctIndex": 0,
      "explanation": "Real deployments mix controller automation with device-level verification.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "hybrid ops",
      "ckuIds": [
        "CKU-SDN-TRAD"
      ]
    },
  ],
  '6.3': [
    {
      "id": "obj-6.3-depth-q1",
      "question": "Northbound API connects:",
      "choices": [
        "Controller to switches",
        "Applications to the controller",
        "AP to WLC only",
        "DHCP client to server"
      ],
      "correctIndex": 1,
      "explanation": "Northbound = apps/orchestration to controller.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "northbound",
      "ckuIds": [
        "CKU-SDN-ARCH"
      ]
    },
    {
      "id": "obj-6.3-depth-q2",
      "question": "Southbound API connects:",
      "choices": [
        "Apps to controller",
        "Controller to network devices",
        "User to web browser only",
        "DNS to client"
      ],
      "correctIndex": 1,
      "explanation": "Southbound = controller to infrastructure (NETCONF, CLI, OpenFlow).",
      "type": "definition",
      "difficulty": "easy",
      "concept": "southbound",
      "ckuIds": [
        "CKU-SDN-ARCH"
      ]
    },
    {
      "id": "obj-6.3-depth-q3",
      "question": "OpenFlow is:",
      "choices": [
        "The only southbound option",
        "One southbound protocol — others include NETCONF and CLI",
        "A northbound REST API only",
        "A routing protocol"
      ],
      "correctIndex": 1,
      "explanation": "Southbound has multiple options; OpenFlow is one.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "openflow",
      "ckuIds": [
        "CKU-SDN-ARCH"
      ]
    },
    {
      "id": "obj-6.3-depth-q4",
      "question": "SDN separates:",
      "choices": [
        "DNS and DHCP",
        "Control plane (controller) from data plane (device forwarding)",
        "TCP and UDP",
        "IPv4 and IPv6 only"
      ],
      "correctIndex": 1,
      "explanation": "Core SDN architecture split — control centralized, data distributed.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "plane separation",
      "ckuIds": [
        "CKU-SDN-ARCH"
      ]
    },
    {
      "id": "obj-6.3-depth-q5",
      "question": "Application layer in SDN talks to controller via:",
      "choices": [
        "Southbound OpenFlow only",
        "Northbound REST/API interfaces",
        "Console cable",
        "WEP keys"
      ],
      "correctIndex": 1,
      "explanation": "Business apps use northbound APIs on the controller.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "app layer",
      "ckuIds": [
        "CKU-SDN-ARCH"
      ]
    },
    {
      "id": "obj-6.3-depth-q6",
      "question": "NETCONF as southbound typically uses:",
      "choices": [
        "UDP 69",
        "SSH/TCP for structured config (often XML/YANG)",
        "ICMP only",
        "Telnet exclusively"
      ],
      "correctIndex": 1,
      "explanation": "NETCONF provides structured configuration over secure transport.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "netconf",
      "ckuIds": [
        "CKU-SDN-ARCH"
      ]
    },
    {
      "id": "obj-6.3-depth-q7",
      "question": "Underlay network in SDN carries:",
      "choices": [
        "Only guest Wi-Fi",
        "IP connectivity between controllers and devices",
        "Only syslog",
        "No traffic"
      ],
      "correctIndex": 1,
      "explanation": "Underlay provides reachability for control/management plane.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "underlay",
      "ckuIds": [
        "CKU-SDN-ARCH"
      ]
    },
  ],
  '6.4': [
    {
      "id": "obj-6.4-depth-q1",
      "question": "DNA Center compared to traditional CLI campus management adds:",
      "choices": [
        "No local device access ever",
        "Centralized design, provisioning, assurance, image management",
        "Removal of all routing",
        "Mandatory WEP"
      ],
      "correctIndex": 1,
      "explanation": "DNA orchestrates lifecycle; CLI still on each device.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "dna vs cli",
      "ckuIds": [
        "CKU-DNA"
      ]
    },
    {
      "id": "obj-6.4-depth-q2",
      "question": "Intent-based networking in DNA means:",
      "choices": [
        "Manual box-by-box only",
        "Declare desired outcome; system translates to device config",
        "Disable templates",
        "Telnet preferred"
      ],
      "correctIndex": 1,
      "explanation": "Intent policies drive automated configuration.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "intent dna",
      "ckuIds": [
        "CKU-DNA"
      ]
    },
    {
      "id": "obj-6.4-depth-q3",
      "question": "DNA assurance helps engineers:",
      "choices": [
        "Ignore client issues",
        "Monitor health and troubleshoot with contextual analytics",
        "Remove VLANs",
        "Disable PoE"
      ],
      "correctIndex": 1,
      "explanation": "Assurance correlates client and network telemetry.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "dna assurance",
      "ckuIds": [
        "CKU-DNA"
      ]
    },
    {
      "id": "obj-6.4-depth-q4",
      "question": "DNA Center does NOT replace:",
      "choices": [
        "All IOS CLI on devices for every task",
        "Image management",
        "Template-based provisioning",
        "Network design workflows"
      ],
      "correctIndex": 0,
      "explanation": "Engineers still use CLI locally for many troubleshooting tasks.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "cli still needed",
      "ckuIds": [
        "CKU-DNA"
      ]
    },
    {
      "id": "obj-6.4-depth-q5",
      "question": "Software-defined access in campus context refers to:",
      "choices": [
        "Removing all switches",
        "Policy-based automated campus fabric/segmentation",
        "Only DNS automation",
        "Disabling AAA"
      ],
      "correctIndex": 1,
      "explanation": "SD-Access automates policy and segmentation in campus.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "sd access",
      "ckuIds": [
        "CKU-DNA"
      ]
    },
    {
      "id": "obj-6.4-depth-q6",
      "question": "Traditional campus changes often require:",
      "choices": [
        "Only REST POST once",
        "Per-device configuration and verification",
        "No testing",
        "Deleting STP"
      ],
      "correctIndex": 1,
      "explanation": "Traditional ops = repetitive CLI on many boxes.",
      "type": "scenario",
      "difficulty": "easy",
      "concept": "traditional campus",
      "ckuIds": [
        "CKU-DNA"
      ]
    },
    {
      "id": "obj-6.4-depth-q7",
      "question": "DNA image management benefit:",
      "choices": [
        "Random IOS versions per switch",
        "Consistent controlled software updates across devices",
        "No rollback possible",
        "Removes SSH"
      ],
      "correctIndex": 1,
      "explanation": "Central image repo and upgrade workflows reduce drift.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "image management",
      "ckuIds": [
        "CKU-DNA"
      ]
    },
  ],
  '6.5': [
    {
      "id": "obj-6.5-depth-q1",
      "question": "REST is considered stateless because:",
      "choices": [
        "Server stores session between requests",
        "Each HTTP request contains complete context; server holds no session state",
        "It uses only UDP",
        "It requires Telnet"
      ],
      "correctIndex": 1,
      "explanation": "Stateless — no server-side session between calls.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "rest stateless",
      "ckuIds": [
        "CKU-REST"
      ]
    },
    {
      "id": "obj-6.5-depth-q2",
      "question": "HTTP GET in REST typically:",
      "choices": [
        "Creates a resource",
        "Reads/retrieves a resource",
        "Deletes all data",
        "Always sends passwords"
      ],
      "correctIndex": 1,
      "explanation": "GET is read-only and idempotent.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "http get",
      "ckuIds": [
        "CKU-REST"
      ]
    },
    {
      "id": "obj-6.5-depth-q3",
      "question": "HTTP POST is used to:",
      "choices": [
        "Read configuration only",
        "Create a resource or submit data (may have side effects)",
        "Always idempotent delete",
        "Replace DNS"
      ],
      "correctIndex": 1,
      "explanation": "POST creates — not guaranteed idempotent.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "http post",
      "ckuIds": [
        "CKU-REST"
      ]
    },
    {
      "id": "obj-6.5-depth-q4",
      "question": "HTTP 404 means:",
      "choices": [
        "Created successfully",
        "Resource not found",
        "Unauthorized",
        "Server error"
      ],
      "correctIndex": 1,
      "explanation": "404 Not Found — URI/resource does not exist.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "http 404",
      "ckuIds": [
        "CKU-REST"
      ]
    },
    {
      "id": "obj-6.5-depth-q5",
      "question": "HTTP 401 indicates:",
      "choices": [
        "OK",
        "Authentication required or failed",
        "Bad syntax only",
        "Resource moved permanently"
      ],
      "correctIndex": 1,
      "explanation": "401 Unauthorized — credentials missing or invalid.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "http 401",
      "ckuIds": [
        "CKU-REST"
      ]
    },
    {
      "id": "obj-6.5-depth-q6",
      "question": "Which methods are idempotent?",
      "choices": [
        "POST only",
        "GET, PUT, DELETE (not POST)",
        "All methods equally",
        "None"
      ],
      "correctIndex": 1,
      "explanation": "Repeating GET/PUT/DELETE should not change outcome; POST may create duplicates.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "idempotent",
      "ckuIds": [
        "CKU-REST"
      ]
    },
    {
      "id": "obj-6.5-depth-q7",
      "question": "REST APIs commonly exchange data formatted as:",
      "choices": [
        "Binary only",
        "JSON or XML over HTTP/HTTPS",
        "SNMP v1 only",
        "Morse code"
      ],
      "correctIndex": 1,
      "explanation": "REST uses HTTP with JSON/XML payloads.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "rest data format",
      "ckuIds": [
        "CKU-REST"
      ]
    },
  ],
  '6.6': [
    {
      "id": "obj-6.6-depth-q1",
      "question": "Valid JSON data types include:",
      "choices": [
        "Comments and functions",
        "Objects, arrays, strings, numbers, booleans, null",
        "Only XML tags",
        "MAC addresses only"
      ],
      "correctIndex": 1,
      "explanation": "JSON has no comments — standard types only.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "json types",
      "ckuIds": [
        "CKU-JSON-ANSIBLE"
      ]
    },
    {
      "id": "obj-6.6-depth-q2",
      "question": "Ansible manages network devices using:",
      "choices": [
        "Mandatory agent on each router",
        "Agentless SSH/NETCONF from control node",
        "Only Telnet",
        "CDP updates"
      ],
      "correctIndex": 1,
      "explanation": "Ansible is agentless — connects from control machine.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "ansible agentless",
      "ckuIds": [
        "CKU-JSON-ANSIBLE"
      ]
    },
    {
      "id": "obj-6.6-depth-q3",
      "question": "JSON objects are delimited by:",
      "choices": [
        "Square brackets []",
        "Curly braces {}",
        "Angle brackets <>",
        "Parentheses only"
      ],
      "correctIndex": 1,
      "explanation": "Objects use {}; arrays use [].",
      "type": "definition",
      "difficulty": "easy",
      "concept": "json syntax",
      "ckuIds": [
        "CKU-JSON-ANSIBLE"
      ]
    },
    {
      "id": "obj-6.6-depth-q4",
      "question": "Ansible playbooks are commonly written in:",
      "choices": [
        "Binary hex only",
        "YAML",
        "WEP keys",
        "SNMP MIBs"
      ],
      "correctIndex": 1,
      "explanation": "Playbooks use YAML; modules return JSON.",
      "type": "definition",
      "difficulty": "easy",
      "concept": "ansible yaml",
      "ckuIds": [
        "CKU-JSON-ANSIBLE"
      ]
    },
    {
      "id": "obj-6.6-depth-q5",
      "question": "Puppet/Chef often differ from Ansible because they:",
      "choices": [
        "Never use agents",
        "May use agent pull model to a master",
        "Only work on DNS",
        "Replace IP routing"
      ],
      "correctIndex": 1,
      "explanation": "Ansible push/agentless vs agent-based pull in Puppet/Chef.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "config tools compare",
      "ckuIds": [
        "CKU-JSON-ANSIBLE"
      ]
    },
    {
      "id": "obj-6.6-depth-q6",
      "question": "Invalid JSON example:",
      "choices": [
        "{\"name\":\"router1\"}",
        "{key: value}",
        "[\"a\",\"b\"]",
        "null"
      ],
      "correctIndex": 1,
      "explanation": "JSON keys and string values must use double quotes.",
      "type": "definition",
      "difficulty": "medium",
      "concept": "invalid json",
      "ckuIds": [
        "CKU-JSON-ANSIBLE"
      ]
    },
    {
      "id": "obj-6.6-depth-q7",
      "question": "Configuration management goal is to:",
      "choices": [
        "Increase manual drift",
        "Maintain desired state consistently across devices",
        "Disable version control",
        "Remove all templates"
      ],
      "correctIndex": 1,
      "explanation": "IaC/tools enforce repeatable desired configuration.",
      "type": "scenario",
      "difficulty": "medium",
      "concept": "config management",
      "ckuIds": [
        "CKU-JSON-ANSIBLE"
      ]
    },
  ],
}
