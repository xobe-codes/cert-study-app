/** Gold reviews — Batch 14: MAC 1.5, private IP 1.7, IPv6 1.9, OSPF 3.4. */
export const BATCH14_GOLD = {
  '1.5-c-q1':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "The switch learns **source MAC** on ingress \u2014 the sender's address in the frame header."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Destination MAC is used for forwarding lookup, not for learning the table entry.",
        "misconceptionTested": "Recording destination instead of source"
      },
      {
        "choiceIndex": 2,
        "explanation": "Only the source MAC of received frames is learned \u2014 not both per frame.",
        "misconceptionTested": "Learning both MACs per frame"
      },
      {
        "choiceIndex": 3,
        "explanation": "MAC learning is Layer 2 \u2014 switches do not learn from IP headers.",
        "misconceptionTested": "IP-based MAC learning"
      }
    ],
    "examTip": "Learn on **ingress source MAC** + VLAN + port."
  },
  '1.5-c-q4':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Default dynamic MAC aging time on Cisco switches is **300 seconds** (5 minutes)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "30 s is not the default \u2014 CDP uses 60 s, not the MAC table.",
        "misconceptionTested": "Confusing CDP timer with MAC aging"
      },
      {
        "choiceIndex": 1,
        "explanation": "60 s is CDP default advertisement \u2014 MAC aging is 300 s.",
        "misconceptionTested": "Using 60 s MAC default"
      },
      {
        "choiceIndex": 3,
        "explanation": "3600 s (1 hour) is far longer than the IOS default of 300 s.",
        "misconceptionTested": "One-hour MAC aging default"
      }
    ],
    "examTip": "MAC aging default = **300 s**; change with `mac address-table aging-time`."
  },
  '1.5-c-q6':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Layer 2 broadcast MAC is **FFFF.FFFF.FFFF** \u2014 flooded within the VLAN."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "All zeros is not the Ethernet broadcast address.",
        "misconceptionTested": "Zero MAC as broadcast"
      },
      {
        "choiceIndex": 2,
        "explanation": "FFFF.FFFF.0000 is not the standard broadcast.",
        "misconceptionTested": "Partial FFFF broadcast"
      },
      {
        "choiceIndex": 3,
        "explanation": "AAAA.AAAA.AAAA is not a reserved broadcast MAC.",
        "misconceptionTested": "Invented broadcast MAC"
      }
    ],
    "examTip": "L2 broadcast = **FFFF.FFFF.FFFF**."
  },
  '1.5-c-q7':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**False** \u2014 flooding stays within the same VLAN; frames are not sent to ports in other VLANs."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Cross-VLAN flooding would break VLAN isolation \u2014 switches flood only in the ingress VLAN.",
        "misconceptionTested": "Flood across VLANs"
      }
    ],
    "examTip": "Flood/filter scope = **same VLAN only**."
  },
  '1.5-c-q8':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**`show mac address-table`** displays dynamic and static CAM entries."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`show ip interface brief` is Layer 3 \u2014 not the MAC table.",
        "misconceptionTested": "L3 show for MAC table"
      },
      {
        "choiceIndex": 2,
        "explanation": "`show vlan brief` lists VLANs \u2014 not MAC mappings.",
        "misconceptionTested": "VLAN brief for MAC addresses"
      },
      {
        "choiceIndex": 3,
        "explanation": "`show cdp neighbors` is discovery \u2014 not MAC learning table.",
        "misconceptionTested": "CDP for MAC table"
      }
    ],
    "examTip": "MAC table \u2192 **`show mac address-table`**."
  },
  '1.5-c-q9':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Static CAM entry: **`mac address-table static <mac> vlan <id> interface <intf>`**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`aging-time 0` disables aging globally \u2014 does not add a static entry.",
        "misconceptionTested": "Aging-time for static MAC"
      },
      {
        "choiceIndex": 2,
        "explanation": "`switchport mode static` is not valid for MAC pinning.",
        "misconceptionTested": "Switchport mode static"
      },
      {
        "choiceIndex": 3,
        "explanation": "`arp static` is ARP cache \u2014 not switch MAC table.",
        "misconceptionTested": "ARP for CAM static"
      }
    ],
    "examTip": "Pin MAC \u2192 **`mac address-table static`**."
  },
  '1.5-c-q12':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Switches forward known unicast to **one port** using the CAM table; hubs **repeat** out every port (collision domain)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Hubs and switches behave very differently at Layer 2.",
        "misconceptionTested": "Hub equals switch"
      },
      {
        "choiceIndex": 2,
        "explanation": "Hubs do not build MAC tables \u2014 switches do.",
        "misconceptionTested": "Hub uses CAM"
      },
      {
        "choiceIndex": 3,
        "explanation": "Switches operate at Layer 2 for Ethernet framing \u2014 not only Layer 3.",
        "misconceptionTested": "Switch is L3 only"
      }
    ],
    "examTip": "Switch = **intelligent flood/filter**; hub = **repeat all ports**."
  },
  '1.7-c-q2':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "10.0.0.0/8 is **RFC 1918 private** \u2014 not routed on the public Internet."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "10.0.0.0/8 is private, not public routable space.",
        "misconceptionTested": "10/8 as public"
      },
      {
        "choiceIndex": 2,
        "explanation": "Multicast uses 224.0.0.0/4 \u2014 10/8 is unicast private.",
        "misconceptionTested": "Private block as multicast"
      },
      {
        "choiceIndex": 3,
        "explanation": "APIPA is 169.254.0.0/16 \u2014 not 10/8.",
        "misconceptionTested": "10/8 as APIPA"
      }
    ],
    "examTip": "RFC 1918: **10/8**, **172.16/12**, **192.168/16**."
  },
  '1.7-c-q3':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "172.20.5.10 falls in **172.16.0.0/12** \u2014 private address space."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "172.16\u2013172.31 are private \u2014 not public-only.",
        "misconceptionTested": "172.x always public"
      },
      {
        "choiceIndex": 2,
        "explanation": "DHCP assignment does not change RFC 1918 classification.",
        "misconceptionTested": "DHCP makes public"
      },
      {
        "choiceIndex": 3,
        "explanation": "This is IPv4 private \u2014 not IPv6-only.",
        "misconceptionTested": "IPv6-only private"
      }
    ],
    "examTip": "172.16.0.0\u2013172.31.255.255 = **private /12**."
  },
  '1.7-c-q4':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "169.254.x.x is **APIPA** \u2014 host self-assigned when **DHCP fails**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Successful DHCP yields a proper lease \u2014 not link-local APIPA.",
        "misconceptionTested": "APIPA as successful DHCP"
      },
      {
        "choiceIndex": 2,
        "explanation": "Static public IP would not be 169.254.x.x.",
        "misconceptionTested": "Static public APIPA range"
      },
      {
        "choiceIndex": 3,
        "explanation": "DNS flush does not assign 169.254 addresses.",
        "misconceptionTested": "DNS causing APIPA"
      }
    ],
    "examTip": "169.254.x.x = **no DHCP lease** (APIPA)."
  },
  '1.7-c-q5':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Private addresses are **not globally unique** \u2014 **NAT** translates them for Internet access."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Length is not the issue \u2014 routability on the public Internet is.",
        "misconceptionTested": "Too short for Internet"
      },
      {
        "choiceIndex": 2,
        "explanation": "Private IPv4 is widespread \u2014 not IPv6-only.",
        "misconceptionTested": "Private requires IPv6"
      },
      {
        "choiceIndex": 3,
        "explanation": "Firewalls filter \u2014 NAT solves non-unique private addressing.",
        "misconceptionTested": "Firewall blocks all IPv4"
      }
    ],
    "examTip": "Private hosts reach Internet via **NAT/PAT**."
  },
  '1.7-c-q6':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**198.51.100.50** is in TEST-NET documentation/public space \u2014 not RFC 1918."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "10.1.1.1 is private RFC 1918.",
        "misconceptionTested": "10.x as public"
      },
      {
        "choiceIndex": 1,
        "explanation": "172.16.1.1 is private RFC 1918.",
        "misconceptionTested": "172.16 as public"
      },
      {
        "choiceIndex": 3,
        "explanation": "192.168.1.1 is private RFC 1918.",
        "misconceptionTested": "192.168 as public"
      }
    ],
    "examTip": "Know the three **private** ranges vs public routable."
  },
  '1.7-c-q7':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**False** \u2014 APIPA is 169.254.0.0/16, separate from 192.168.0.0/16 private space."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "APIPA and RFC 1918 192.168.x.x are different ranges.",
        "misconceptionTested": "APIPA in 192.168"
      }
    ],
    "examTip": "APIPA **169.254/16** \u2260 RFC 1918 **192.168/16**."
  },
  '1.7-c-q8':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Many LAN hosts sharing one ISP address uses **NAT/PAT** overload."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "STP prevents loops \u2014 unrelated to address sharing.",
        "misconceptionTested": "STP for NAT"
      },
      {
        "choiceIndex": 2,
        "explanation": "VTP is VLAN trunking \u2014 not Internet address sharing.",
        "misconceptionTested": "VTP for public IP sharing"
      },
      {
        "choiceIndex": 3,
        "explanation": "LLDP is discovery \u2014 not NAT.",
        "misconceptionTested": "LLDP for address sharing"
      }
    ],
    "examTip": "One public IP, many LAN hosts = **PAT**."
  },
  '1.7-design-rfc1918':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**10.50.1.100** is RFC 1918 private \u2014 safe for internal LAN without global uniqueness."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "8.8.8.8 is public DNS \u2014 globally routable.",
        "misconceptionTested": "Public DNS as LAN private"
      },
      {
        "choiceIndex": 2,
        "explanation": "203.0.113.x is documentation/public TEST-NET \u2014 not corporate private use.",
        "misconceptionTested": "TEST-NET as internal LAN"
      },
      {
        "choiceIndex": 3,
        "explanation": "169.254.x.x is APIPA link-local \u2014 not intentional corporate addressing.",
        "misconceptionTested": "APIPA for designed LAN"
      }
    ],
    "examTip": "Corporate LAN \u2192 pick from **10/8, 172.16/12, 192.168/16**."
  },
  '1.9-c-q2':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "IPv6 link-local addresses begin with **FE80::/10**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "FF02::/16 is multicast \u2014 not link-local unicast.",
        "misconceptionTested": "Multicast prefix as link-local"
      },
      {
        "choiceIndex": 1,
        "explanation": "2001::/32 is global unicast space.",
        "misconceptionTested": "Global as link-local"
      },
      {
        "choiceIndex": 3,
        "explanation": "FD00::/8 is unique local (ULA) \u2014 not FE80 link-local.",
        "misconceptionTested": "ULA as link-local"
      }
    ],
    "examTip": "Link-local starts **FE80**."
  },
  '1.9-c-q3':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**FD00::/8** is IPv6 unique local (RFC 4193) \u2014 analogous to private IPv4."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "2000::/3 is global unicast allocation.",
        "misconceptionTested": "Global as ULA"
      },
      {
        "choiceIndex": 2,
        "explanation": "FE80::/10 is link-local \u2014 not site-private ULA.",
        "misconceptionTested": "Link-local as ULA"
      },
      {
        "choiceIndex": 3,
        "explanation": "FF00::/8 is multicast.",
        "misconceptionTested": "Multicast as private IPv6"
      }
    ],
    "examTip": "IPv6 private-like = **FD00::/8** ULA."
  },
  '1.9-c-q4':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**FF02::2** is all-routers on the local link multicast group."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "FF02::1 is all-nodes \u2014 every host, not routers only.",
        "misconceptionTested": "All-nodes as all-routers"
      },
      {
        "choiceIndex": 2,
        "explanation": "FF02::5 is OSPFv3 \u2014 not generic all-routers.",
        "misconceptionTested": "OSPF multicast as all-routers"
      },
      {
        "choiceIndex": 3,
        "explanation": "224.0.0.2 is IPv4 multicast \u2014 question is IPv6.",
        "misconceptionTested": "IPv4 multicast answer"
      }
    ],
    "examTip": "All routers link-local = **FF02::2**."
  },
  '1.9-c-q5':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**False** \u2014 IPv6 uses **multicast** instead of broadcast; there is no IPv6 broadcast address."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "IPv6 eliminated broadcast \u2014 uses solicited-node and other multicast groups.",
        "misconceptionTested": "IPv6 has broadcast"
      }
    ],
    "examTip": "IPv6: **no broadcast** \u2014 use multicast."
  },
  '1.9-c-q6':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Same address on multiple nodes with nearest delivery is **anycast**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Multicast is one-to-many \u2014 anycast is one-to-nearest of identical addresses.",
        "misconceptionTested": "Multicast as anycast"
      },
      {
        "choiceIndex": 2,
        "explanation": "Link-local is FE80::/10 scope \u2014 not anycast semantics.",
        "misconceptionTested": "Link-local as anycast"
      },
      {
        "choiceIndex": 3,
        "explanation": "IPv6 has no broadcast.",
        "misconceptionTested": "Broadcast as anycast"
      }
    ],
    "examTip": "One address, nearest node = **anycast**."
  },
  '1.9-c-q7':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Link-local **FE80::** addresses are valid **only on the local link** \u2014 not routable remotely."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "FE80 is not Internet-routable.",
        "misconceptionTested": "Link-local across Internet"
      },
      {
        "choiceIndex": 2,
        "explanation": "All IPv6 hosts use link-local \u2014 not router-only.",
        "misconceptionTested": "FE80 router-only"
      },
      {
        "choiceIndex": 3,
        "explanation": "Link-local does not require NAT66.",
        "misconceptionTested": "NAT66 required for FE80"
      }
    ],
    "examTip": "**FE80** = local segment only."
  },
  '1.9-c-q8':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Every IPv6 node joins **FF02::1** (all-nodes link-local multicast)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "FF02::2 is all-routers \u2014 hosts join all-nodes too.",
        "misconceptionTested": "All-routers as every host"
      },
      {
        "choiceIndex": 2,
        "explanation": "FE80::1 is not the all-nodes multicast group.",
        "misconceptionTested": "FE80::1 as all-nodes"
      },
      {
        "choiceIndex": 3,
        "explanation": "2000::/3 is global unicast \u2014 not mandatory multicast membership.",
        "misconceptionTested": "Global as all-nodes"
      }
    ],
    "examTip": "All IPv6 hosts \u2192 **FF02::1**."
  },
  '3.4-c-q2':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "OSPF administrative distance default is **110**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "90 is EIGRP internal AD \u2014 not OSPF.",
        "misconceptionTested": "EIGRP AD for OSPF"
      },
      {
        "choiceIndex": 1,
        "explanation": "100 is BGP on some platforms \u2014 OSPF is 110.",
        "misconceptionTested": "100 as OSPF AD"
      },
      {
        "choiceIndex": 3,
        "explanation": "120 is RIP \u2014 OSPF is more trustworthy at 110.",
        "misconceptionTested": "RIP AD for OSPF"
      }
    ],
    "examTip": "AD: **110** OSPF, **90** EIGRP, **120** RIP."
  },
  '3.4-c-q3':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Default OSPF reference bandwidth makes **100 Mbps cost = 1** (cost = ref_bw / interface_bw)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Cost 10 would imply 10 Mbps with default reference \u2014 100 Mbps is cost 1.",
        "misconceptionTested": "Cost 10 on 100M"
      },
      {
        "choiceIndex": 2,
        "explanation": "Cost 100 is far too high for 100 Mbps default ref.",
        "misconceptionTested": "Cost 100 on 100M"
      },
      {
        "choiceIndex": 3,
        "explanation": "64 is not the default 100 Mbps OSPF cost.",
        "misconceptionTested": "Cost 64 default"
      }
    ],
    "examTip": "Default ref-bw \u2192 **100M = cost 1**, 10M = cost 10."
  },
  '3.4-c-q4':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Router ID: **highest loopback IP**; if none, **highest active interface IP**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Router ID is highest, not lowest interface IP.",
        "misconceptionTested": "Lowest IP as RID"
      },
      {
        "choiceIndex": 2,
        "explanation": "RID is an IP address \u2014 not MAC-based.",
        "misconceptionTested": "MAC as Router ID"
      },
      {
        "choiceIndex": 3,
        "explanation": "0.0.0.0 is invalid \u2014 IOS picks highest loopback/active IP.",
        "misconceptionTested": "Default RID 0.0.0.0"
      }
    ],
    "examTip": "OSPF RID = **highest loopback**, else **highest active if IP**."
  },
}
