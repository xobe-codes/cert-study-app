/** Gold reviews — Batch 13: Security 5.1, ACLs 5.5, IPv6 1.8, routing 3.1. */
export const BATCH13_GOLD = {
  '5.1-q3':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "A **vulnerability** is a weakness (unpatched flaw) that can be exploited \u2014 the server has the flaw before any attack occurs."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "A threat is a potential danger or attacker capability \u2014 not the flaw in the server itself.",
        "misconceptionTested": "Confusing threat with vulnerability"
      },
      {
        "choiceIndex": 1,
        "explanation": "An exploit is the attack technique or code that takes advantage of a vulnerability.",
        "misconceptionTested": "Labeling the flaw as the exploit"
      },
      {
        "choiceIndex": 3,
        "explanation": "Risk combines likelihood and impact \u2014 vulnerability is the underlying weakness.",
        "misconceptionTested": "Equating risk with vulnerability"
      }
    ],
    "examTip": "Flaw in the system = **vulnerability**; attack method = **exploit**."
  },
  '5.1-q5':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Fraudulent email tricking users into revealing credentials is **phishing** \u2014 a social-engineering attack."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Worms self-replicate across networks \u2014 phishing targets humans via deceptive messages.",
        "misconceptionTested": "Classifying email fraud as worm"
      },
      {
        "choiceIndex": 2,
        "explanation": "DoS floods a service to deny availability \u2014 phishing steals credentials via deception.",
        "misconceptionTested": "Confusing phishing with DoS"
      },
      {
        "choiceIndex": 3,
        "explanation": "IP spoofing falsifies source addresses \u2014 phishing uses fake sender identity in email content.",
        "misconceptionTested": "Mixing spoofing with phishing"
      }
    ],
    "examTip": "Fake IT email + credential harvest = **phishing**."
  },
  '5.1-q6':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Flooding a site until it cannot serve users violates **availability** \u2014 the A in CIA."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Confidentiality is unauthorized disclosure \u2014 DoS does not primarily expose data.",
        "misconceptionTested": "Mapping DoS to confidentiality"
      },
      {
        "choiceIndex": 1,
        "explanation": "Integrity is unauthorized modification \u2014 DoS blocks access rather than altering data.",
        "misconceptionTested": "Mapping DoS to integrity"
      },
      {
        "choiceIndex": 3,
        "explanation": "Authentication verifies identity \u2014 availability is about reachable services.",
        "misconceptionTested": "Confusing authentication with availability"
      }
    ],
    "examTip": "Service down / flooded = **availability** violation."
  },
  '5.1-q8':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Intercepting and reading or altering traffic between two parties without their knowledge is a **man-in-the-middle (MITM)** attack."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "DoS denies service \u2014 MITM sits between endpoints to eavesdrop or modify.",
        "misconceptionTested": "Confusing MITM with DoS"
      },
      {
        "choiceIndex": 2,
        "explanation": "IP spoofing forges source IP \u2014 MITM actively relays or alters a session between hosts.",
        "misconceptionTested": "Equating spoofing with MITM"
      },
      {
        "choiceIndex": 3,
        "explanation": "Replay resends captured packets \u2014 MITM is live interception on the path.",
        "misconceptionTested": "Confusing replay with MITM"
      }
    ],
    "examTip": "Hidden intermediary reading/changing traffic = **MITM**."
  },
  '5.1-q9':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Worms** self-propagate across networks without attaching to a host file \u2014 unlike viruses."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Viruses need a host file or user action to spread \u2014 worms spread autonomously.",
        "misconceptionTested": "Calling self-replicating network malware a virus"
      },
      {
        "choiceIndex": 2,
        "explanation": "Spyware covertly monitors activity \u2014 it does not necessarily self-replicate network-wide.",
        "misconceptionTested": "Labeling worm as spyware"
      },
      {
        "choiceIndex": 3,
        "explanation": "Adware displays ads \u2014 not the hallmark of autonomous network replication.",
        "misconceptionTested": "Confusing adware with worm"
      }
    ],
    "examTip": "Self-replicates without host file = **worm**."
  },
  '5.1-q10':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Phishing and social engineering target human judgment \u2014 **security awareness training** is the most effective mitigation."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Firewalls cannot stop a user from clicking a malicious link in email.",
        "misconceptionTested": "Expecting firewalls to stop phishing clicks"
      },
      {
        "choiceIndex": 1,
        "explanation": "Antivirus may miss credential-harvest sites \u2014 training addresses the human vector.",
        "misconceptionTested": "Relying on AV for social engineering"
      },
      {
        "choiceIndex": 3,
        "explanation": "Encryption protects data in transit \u2014 it does not teach users to spot fraudulent email.",
        "misconceptionTested": "Encryption as phishing primary defense"
      }
    ],
    "examTip": "Social engineering \u2192 train users first."
  },
  '5.5-c-q2':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Every Cisco ACL has an **implicit deny any** at the end \u2014 unmatched traffic is dropped."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Without the implicit deny, unmatched traffic would be permitted \u2014 IOS denies by default at ACL end.",
        "misconceptionTested": "Believing ACLs permit by default"
      }
    ],
    "examTip": "No match at bottom of ACL \u2192 **implicit deny all**."
  },
  '5.5-c-q4':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Place **extended ACLs close to the source** \u2014 filter unwanted traffic before it crosses the network."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Close to destination is the rule for **standard** ACLs (source-only matching).",
        "misconceptionTested": "Extended ACL at destination"
      },
      {
        "choiceIndex": 2,
        "explanation": "Root bridge is STP terminology \u2014 unrelated to ACL placement.",
        "misconceptionTested": "Inventing root bridge ACL rule"
      },
      {
        "choiceIndex": 3,
        "explanation": "DHCP server placement does not determine extended ACL filter location.",
        "misconceptionTested": "ACL placement on DHCP server"
      }
    ],
    "examTip": "Extended ACL \u2192 **near source**; standard ACL \u2192 **near destination**."
  },
  '5.5-c-q5':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "For 192.168.1.0/24, wildcard **0.0.0.255** matches the entire /24 (care bits on last octet only)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "255.255.255.0 is a subnet mask, not the wildcard for a /24 host match.",
        "misconceptionTested": "Using subnet mask as wildcard"
      },
      {
        "choiceIndex": 2,
        "explanation": "0.0.0.0 matches one host only \u2014 not the full /24.",
        "misconceptionTested": "Host wildcard for entire network"
      },
      {
        "choiceIndex": 3,
        "explanation": "255.255.255.255 matches any address \u2014 too broad for exactly one /24.",
        "misconceptionTested": "Any-any wildcard for specific /24"
      }
    ],
    "examTip": "/24 ACL wildcard = **0.0.0.255** (invert the mask)."
  },
  '5.5-c-q6':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Standard ACL numbers are **1\u201399** (and extended 100\u2013199) on CCNA \u2014 standard matches source IP only."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "100\u2013199 is the classic range for **extended** ACLs.",
        "misconceptionTested": "Extended range labeled standard"
      },
      {
        "choiceIndex": 2,
        "explanation": "200\u2013299 is not the primary CCNA standard ACL range.",
        "misconceptionTested": "Invented ACL number range"
      },
      {
        "choiceIndex": 3,
        "explanation": "1300\u20132699 are expanded ACL numbers \u2014 standard is 1\u201399.",
        "misconceptionTested": "Expanded range as only standard"
      }
    ],
    "examTip": "Standard ACL = **1\u201399**; extended = **100\u2013199**."
  },
  '5.5-c-q7':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Extended** ACLs match source/destination IP, protocol, and port \u2014 standard ACLs match source IP only."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Standard ACLs can match source IP \u2014 extended adds destination, protocol, and ports.",
        "misconceptionTested": "Thinking only extended matches source"
      },
      {
        "choiceIndex": 2,
        "explanation": "ACLs filter traffic \u2014 they are not applied by interface name in the ACE itself.",
        "misconceptionTested": "Interface name in ACE"
      },
      {
        "choiceIndex": 3,
        "explanation": "VLAN filtering uses different mechanisms \u2014 extended ACLs match L3/L4 fields.",
        "misconceptionTested": "VLAN ID in standard vs extended"
      }
    ],
    "examTip": "Need port/protocol filter \u2192 **extended** ACL."
  },
  '5.5-c-q8':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Apply with **`ip access-group 100 in`** (or `out`) under interface configuration."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`access-list 100 in` is not valid interface syntax \u2014 use `ip access-group`.",
        "misconceptionTested": "Wrong apply command"
      },
      {
        "choiceIndex": 2,
        "explanation": "`ip access-list` defines/edits the ACL \u2014 `ip access-group` applies it.",
        "misconceptionTested": "Defining instead of applying ACL"
      },
      {
        "choiceIndex": 3,
        "explanation": "`apply acl` is not Cisco IOS syntax.",
        "misconceptionTested": "Invented apply syntax"
      }
    ],
    "examTip": "Apply ACL on interface \u2192 **`ip access-group <num> in|out`**."
  },
  '5.5-c-q9':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "ACLs use **first match wins** \u2014 a broad permit above a specific deny never reaches the deny line."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Deny rules work \u2014 order determines which ACE matches first.",
        "misconceptionTested": "ACLs ignore deny"
      },
      {
        "choiceIndex": 2,
        "explanation": "Wildcard masks define match scope \u2014 order still governs which ACE hits.",
        "misconceptionTested": "Wildcard fixes order problem"
      },
      {
        "choiceIndex": 3,
        "explanation": "An unapplied ACL filters nothing \u2014 here the permit matches before deny due to order.",
        "misconceptionTested": "Unapplied ACL as reason deny fails"
      }
    ],
    "examTip": "Put **specific denies before broad permits** \u2014 first match wins."
  },
  '1.8-c-q2':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Compress consecutive zero hextets once: **2001:db8::1** (leading zeros in db8 also dropped)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Only one `::` is allowed per address \u2014 `:::` is invalid.",
        "misconceptionTested": "Triple colon compression"
      },
      {
        "choiceIndex": 2,
        "explanation": "`::` may appear only once \u2014 cannot split zeros in two places.",
        "misconceptionTested": "Multiple :: segments"
      },
      {
        "choiceIndex": 3,
        "explanation": "Compress the longest zero run in the middle \u2014 not `2001::db8::1` with two :: groups.",
        "misconceptionTested": "Double :: in shortened form"
      }
    ],
    "examTip": "IPv6 shorten: drop leading zeros; **one `::` per address**."
  },
  '1.8-c-q3':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**False** \u2014 `::` can represent contiguous zeros only **once** in a single IPv6 address."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Using `::` twice makes the address ambiguous/invalid.",
        "misconceptionTested": "Allowing multiple :: compressions"
      }
    ],
    "examTip": "One `::` max per IPv6 address."
  },
  '1.8-c-q4':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "IPv6 LANs typically use a **/64** prefix \u2014 64-bit interface ID (SLAAC/EUI-64)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "/24 is IPv4 thinking \u2014 IPv6 subnets are usually /64 on LANs.",
        "misconceptionTested": "IPv4 /24 on IPv6 LAN"
      },
      {
        "choiceIndex": 1,
        "explanation": "/48 is often a site allocation \u2014 LAN subnets are carved as /64.",
        "misconceptionTested": "Site prefix as LAN length"
      },
      {
        "choiceIndex": 3,
        "explanation": "/128 is a single host address \u2014 not a typical LAN prefix.",
        "misconceptionTested": "Host mask for LAN"
      }
    ],
    "examTip": "IPv6 LAN default = **/64**."
  },
  '1.8-c-q5':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Modified EUI-64 inserts **FFFE** in the middle of the 48-bit MAC to build a 64-bit interface ID."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "FF00 is not the EUI-64 insertion pattern \u2014 use FFFE.",
        "misconceptionTested": "Wrong EUI-64 insert"
      },
      {
        "choiceIndex": 2,
        "explanation": "FFFF is not inserted \u2014 FFFE is the standard 16-bit pad.",
        "misconceptionTested": "FFFF pad in EUI-64"
      },
      {
        "choiceIndex": 3,
        "explanation": "FE80 is link-local prefix space \u2014 not the MAC-to-EUI-64 insert.",
        "misconceptionTested": "FE80 as EUI-64 insert"
      }
    ],
    "examTip": "EUI-64: split MAC, insert **FFFE**, flip U/L bit."
  },
  '1.8-c-q6':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**SLAAC** (Stateless Address Autoconfiguration) builds an address from RA prefix + interface ID."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "DHCPv6 is stateful/stateless server assignment \u2014 not RA-only autoconfig from prefix.",
        "misconceptionTested": "SLAAC vs DHCPv6"
      },
      {
        "choiceIndex": 2,
        "explanation": "Static is manually configured \u2014 not derived from RA alone.",
        "misconceptionTested": "Static as SLAAC"
      },
      {
        "choiceIndex": 3,
        "explanation": "NAT66 translates between IPv6 networks \u2014 unrelated to address autoconfig.",
        "misconceptionTested": "NAT66 as autoconfig"
      }
    ],
    "examTip": "RA prefix + self-built host ID = **SLAAC**."
  },
  '1.8-c-q7':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Globally enable IPv6 routing with **`ipv6 unicast-routing`**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`ipv6 routing` is not the standard global IOS command.",
        "misconceptionTested": "Wrong global IPv6 command"
      },
      {
        "choiceIndex": 2,
        "explanation": "`ip routing v6` is invalid syntax.",
        "misconceptionTested": "Invented ip routing v6"
      },
      {
        "choiceIndex": 3,
        "explanation": "`enable ipv6` is not the router global config command.",
        "misconceptionTested": "enable ipv6 typo"
      }
    ],
    "examTip": "Router IPv6 forwarding \u2192 **`ipv6 unicast-routing`**."
  },
  '1.8-c-q8':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Shorten hextets by removing **leading zeros** \u2014 `00a0` becomes `a0`."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Trailing zeros inside a hextet are significant \u2014 only leading zeros drop.",
        "misconceptionTested": "Stripping trailing zeros in hextet"
      },
      {
        "choiceIndex": 2,
        "explanation": "Cannot remove all zeros in a non-zero hextet \u2014 `a0` keeps the value.",
        "misconceptionTested": "Deleting required digits"
      },
      {
        "choiceIndex": 3,
        "explanation": "IPv6 shortening rules allow leading zero compression.",
        "misconceptionTested": "No shortening allowed"
      }
    ],
    "examTip": "Per-hextet: drop **leading** zeros only."
  },
  '1.8-c-q9':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**`show ipv6 interface brief`** lists IPv6 addresses and interface status."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`show ip interface brief` is IPv4 \u2014 use the ipv6 variant.",
        "misconceptionTested": "IPv4 show for IPv6 addresses"
      },
      {
        "choiceIndex": 2,
        "explanation": "`show ipv6 route` shows the routing table, not interface address summary.",
        "misconceptionTested": "Route table instead of interfaces"
      },
      {
        "choiceIndex": 3,
        "explanation": "Running config shows config lines \u2014 brief summary is faster for addresses/status.",
        "misconceptionTested": "run-config as brief status"
      }
    ],
    "examTip": "IPv6 IF summary \u2192 **`show ipv6 interface brief`**."
  },
  '1.8-c-q10':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "/64 leaves **64 bits** for the interface ID (128 \u2212 64 = 64)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "32-bit interface IDs are not used in standard /64 LAN design.",
        "misconceptionTested": "32-bit interface ID"
      },
      {
        "choiceIndex": 1,
        "explanation": "48 bits would imply a /80 prefix \u2014 LANs use /64.",
        "misconceptionTested": "48-bit interface ID on /64"
      },
      {
        "choiceIndex": 3,
        "explanation": "128 bits would be the entire address \u2014 /64 splits network vs host evenly.",
        "misconceptionTested": "Full 128 as interface ID"
      }
    ],
    "examTip": "/64 \u2192 **64-bit** network + **64-bit** interface ID."
  },
  '3.1-q3':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Adding 192.168.1.1/24 installs **C** 192.168.1.0/24 (connected subnet) and **L** 192.168.1.1/32 (local host route)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "S is static \u2014 connected/local are automatic when the interface is up.",
        "misconceptionTested": "Static codes for connected install"
      },
      {
        "choiceIndex": 2,
        "explanation": "O is OSPF \u2014 these routes are connected/local, not learned.",
        "misconceptionTested": "OSPF code on interface bring-up"
      },
      {
        "choiceIndex": 3,
        "explanation": "Both C and L routes are installed \u2014 L is the /32 host route.",
        "misconceptionTested": "Connected only without local"
      }
    ],
    "examTip": "Interface up \u2192 **C** (subnet) + **L** (/32 local)."
  },
  '3.1-q4':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "The **L** /32 route ensures packets destined to the router's own interface IP are delivered locally."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Subnet hosts use the **C** connected route \u2014 L is for the router's own IP.",
        "misconceptionTested": "L route for subnet hosts"
      },
      {
        "choiceIndex": 2,
        "explanation": "L is not a backup \u2014 it serves a distinct purpose for local delivery.",
        "misconceptionTested": "L as backup connected"
      },
      {
        "choiceIndex": 3,
        "explanation": "Default gateway is a separate concept \u2014 L handles traffic to this router's address.",
        "misconceptionTested": "L marks default gateway"
      }
    ],
    "examTip": "**L** /32 = traffic to **this router's interface IP**."
  },
  '3.1-q5':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "EIGRP routes show source code **D** in the routing table."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "E is EGP (legacy) \u2014 not EIGRP on modern IOS tables.",
        "misconceptionTested": "E as EIGRP"
      },
      {
        "choiceIndex": 2,
        "explanation": "O is OSPF \u2014 EIGRP uses D.",
        "misconceptionTested": "O as EIGRP"
      },
      {
        "choiceIndex": 3,
        "explanation": "R is RIP \u2014 EIGRP is D.",
        "misconceptionTested": "R as EIGRP"
      }
    ],
    "examTip": "Memorize: **O**=OSPF, **D**=EIGRP, **R**=RIP."
  },
}
