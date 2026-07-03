/** Gold reviews — Batch 16: HSRP 3.5, routing troubleshoot 3.6, ACL/L2 5.6, wireless security 5.8, QoS 4.7, WLAN arch 2.6, WLAN client 2.8, security 5.1, phishing 5.2, SDN spine-leaf 6.3. */
export const BATCH16_GOLD = {
  'obj-3.5-source-q002':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "In HSRP v1, the well-known virtual MAC uses vendor **0000.0c** and the HSRP ID field **07.ac** \u2014 the middle bytes of `0000.0c07.ac0a`."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**0000.0c** is the Cisco HSRP OUI prefix \u2014 not the HSRP ID nibble pair the stem asks for.",
        "misconceptionTested": "OUI prefix as HSRP ID"
      },
      {
        "choiceIndex": 1,
        "explanation": "**oc07** is not a valid hex grouping from this MAC \u2014 the HSRP ID is **07.ac**.",
        "misconceptionTested": "Mis-parsing MAC octets"
      },
      {
        "choiceIndex": 2,
        "explanation": "**0a** is the group number suffix (last byte), not the well-known HSRP ID field **07.ac**.",
        "misconceptionTested": "Group number suffix as HSRP ID"
      }
    ],
    "examTip": "HSRP v1 virtual MAC pattern \u2192 **0000.0c07.acXX** (XX = group in hex)."
  },
  'obj-3.5-source-q003':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**GLBP** is Cisco proprietary and supports **active/active load balancing** across multiple gateways \u2014 the load-balancing FHRP on CCNA."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Proxy ARP resolves MACs for remote subnets \u2014 it is not a first-hop redundancy load-balancing protocol.",
        "misconceptionTested": "Proxy ARP as FHRP load balancer"
      },
      {
        "choiceIndex": 1,
        "explanation": "**VRRP** is an open standard FHRP \u2014 it is not Cisco proprietary and does not load-balance per packet like GLBP.",
        "misconceptionTested": "VRRP as Cisco load-balancing FHRP"
      },
      {
        "choiceIndex": 3,
        "explanation": "**HSRP** is Cisco proprietary but provides one active router \u2014 not per-flow load balancing like GLBP.",
        "misconceptionTested": "HSRP as load-balancing FHRP"
      }
    ],
    "examTip": "Cisco **load-balancing FHRP** = **GLBP**; HSRP = one active; VRRP = open standard."
  },
  'obj-3.5-source-q005':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "The **default HSRP priority is 100** \u2014 higher values win; preempt promotes a higher-priority router when it returns."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "110 is above default but is not the factory default \u2014 HSRP ships at **100** unless changed.",
        "misconceptionTested": "110 as default HSRP priority"
      },
      {
        "choiceIndex": 2,
        "explanation": "200 is a valid configured priority but not the default \u2014 default is **100**.",
        "misconceptionTested": "200 as default HSRP priority"
      },
      {
        "choiceIndex": 3,
        "explanation": "10 is far below default \u2014 the default HSRP priority is **100**, not 10.",
        "misconceptionTested": "10 as default HSRP priority"
      }
    ],
    "examTip": "HSRP default priority = **100**; higher number = more preferred active."
  },
  'obj-3.5-source-q007':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "HSRP hello/standby communication uses **UDP port 1985** \u2014 multicast between group members."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "UDP 1935 is RTMP streaming \u2014 HSRP uses **UDP 1985**.",
        "misconceptionTested": "RTMP port for HSRP"
      },
      {
        "choiceIndex": 2,
        "explanation": "UDP 1895 is not HSRP \u2014 the well-known HSRP port is **1985**.",
        "misconceptionTested": "Wrong UDP port near 1985"
      },
      {
        "choiceIndex": 3,
        "explanation": "UCP/3222 is not valid HSRP transport \u2014 HSRP runs **UDP/1985**.",
        "misconceptionTested": "Invented UCP port for HSRP"
      }
    ],
    "examTip": "HSRP control messages \u2192 **UDP 1985** (memorize with VRRP 112)."
  },
  '3.6-legacy-q005':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**`show ip route`** displays the routing table with each route's **source** (C connected, S static, O OSPF, etc.)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`show ip interface brief` lists interface IPs and status \u2014 it does not show the full routing table with protocol codes.",
        "misconceptionTested": "Interface brief as routing table"
      },
      {
        "choiceIndex": 1,
        "explanation": "`show running-config` shows configured static routes but not live learned routes or best-path selection.",
        "misconceptionTested": "Running-config as live routing table"
      },
      {
        "choiceIndex": 3,
        "explanation": "`show ip protocols` summarizes routing protocol parameters \u2014 not the installed route table entries.",
        "misconceptionTested": "Protocols summary as route table"
      }
    ],
    "examTip": "Troubleshoot installed routes \u2192 **`show ip route`** (look for C/S/O/D codes)."
  },
  '3.6-legacy-q008':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Two static routes to the same prefix with **equal AD** install as **equal-cost paths** \u2014 the router load-balances across both next hops."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Cisco does not keep only the first static when AD and prefix match \u2014 **both equal-cost statics** can be installed.",
        "misconceptionTested": "First static wins exclusively"
      },
      {
        "choiceIndex": 1,
        "explanation": "Equal AD statics to the same destination are valid \u2014 the router does not reject them as a conflict.",
        "misconceptionTested": "Duplicate statics always rejected"
      },
      {
        "choiceIndex": 3,
        "explanation": "Next-hop IP magnitude does not break ties \u2014 equal AD statics to the same network **load-balance**.",
        "misconceptionTested": "Higher next-hop IP wins tie"
      }
    ],
    "examTip": "Same prefix + same AD statics \u2192 **ECMP load balancing**, not first-wins."
  },
  'obj-5.7-source-q002':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**Double tagging** exploits a **native VLAN** mismatch \u2014 an attacker nests tags so the switch forwards into another VLAN."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "VLAN traversal is vague exam jargon \u2014 the native VLAN attack CCNA names is **double tagging**.",
        "misconceptionTested": "Generic VLAN traversal label"
      },
      {
        "choiceIndex": 2,
        "explanation": "Trunk popping is not the CCNA term for native VLAN tag manipulation \u2014 use **double tagging**.",
        "misconceptionTested": "Trunk popping as native VLAN attack"
      },
      {
        "choiceIndex": 3,
        "explanation": "DoS floods traffic \u2014 native VLAN attacks target **802.1Q tag nesting**, not bandwidth exhaustion.",
        "misconceptionTested": "DoS as native VLAN exploit"
      }
    ],
    "examTip": "Native VLAN risk \u2192 **double tagging**; fix with matched native VLAN + don't use VLAN 1."
  },
  'obj-5.7-source-q004':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Start port security troubleshooting with **`show port-security`** \u2014 it reports violations, max MACs, and err-disabled ports."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "`show mac address-table` lists learned MACs but not violation counters or port-security policy state.",
        "misconceptionTested": "MAC table as port-security diagnostic"
      },
      {
        "choiceIndex": 2,
        "explanation": "`show interface` gives link status \u2014 use **`show port-security`** for violation and sticky MAC details.",
        "misconceptionTested": "Interface status only for port security"
      },
      {
        "choiceIndex": 3,
        "explanation": "`show security` is not the IOS command for port security \u2014 the command is **`show port-security`**.",
        "misconceptionTested": "Invented show security command"
      }
    ],
    "examTip": "Port security triage \u2192 **`show port-security`** then **`show port-security interface`**."
  },
  'obj-5.7-source-q007':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Port security restricts **source MAC addresses** learned on an access port \u2014 unauthorized MACs trigger shutdown or restrict."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Switches filter on **ingress source MAC**, not destination MAC, for port security.",
        "misconceptionTested": "Destination MAC for port security"
      },
      {
        "choiceIndex": 2,
        "explanation": "Port security is Layer 2 \u2014 it does not inspect **source IP** addresses.",
        "misconceptionTested": "Source IP for port security"
      },
      {
        "choiceIndex": 3,
        "explanation": "Destination IP is a routing/ACL concept \u2014 port security binds allowed **source MACs**.",
        "misconceptionTested": "Destination IP for port security"
      }
    ],
    "examTip": "Port security = limit **source MACs** on access ports (sticky/learned/secure)."
  },
  'obj-5.9-source-q009':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "WPA2-**Enterprise** uses **802.1X** with a **RADIUS server** for per-user authentication \u2014 not a shared PSK."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "NTP synchronizes clocks \u2014 Enterprise WLAN auth requires **RADIUS**, not time sync.",
        "misconceptionTested": "NTP for WPA2-Enterprise"
      },
      {
        "choiceIndex": 2,
        "explanation": "PSK is **WPA2-Personal** \u2014 Enterprise mode needs **RADIUS/802.1X** credentials.",
        "misconceptionTested": "PSK for Enterprise mode"
      },
      {
        "choiceIndex": 3,
        "explanation": "Captive portal is guest/web auth \u2014 Enterprise WPA2 uses **RADIUS** backend authentication.",
        "misconceptionTested": "Captive portal as Enterprise requirement"
      }
    ],
    "examTip": "WPA2-Enterprise on WLC \u2192 **RADIUS + 802.1X**; Personal \u2192 PSK."
  },
  'obj-5.9-source-q010':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Disable **TKIP** to prevent WPA2 from **falling back to WPA/TKIP** \u2014 run **AES/CCMP only** for modern security."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "802.1X is required for Enterprise \u2014 disabling it breaks auth, it does not stop WPA fallback.",
        "misconceptionTested": "Disable 802.1X to block WPA fallback"
      },
      {
        "choiceIndex": 1,
        "explanation": "AES is the desired cipher \u2014 disabling AES would weaken security, not prevent WPA downgrade.",
        "misconceptionTested": "Disable AES to force WPA2"
      },
      {
        "choiceIndex": 3,
        "explanation": "MAC filtering is admission control \u2014 it does not stop **TKIP/WPA cipher negotiation**.",
        "misconceptionTested": "MAC filtering blocks WPA fallback"
      }
    ],
    "examTip": "WPA2-only WLAN \u2192 allow **AES/CCMP**, remove **TKIP** cipher suites."
  },
  'obj-5.9-source-q012':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**TKIP** adds per-packet overhead and is legacy \u2014 it **limits throughput** compared to **AES/CCMP** on modern hardware."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "AES/CCMP is efficient on modern chipsets \u2014 **TKIP**, not AES, is the throughput bottleneck.",
        "misconceptionTested": "AES limits throughput"
      },
      {
        "choiceIndex": 2,
        "explanation": "CCMP is the AES-based WPA2 cipher \u2014 it delivers high throughput; **TKIP** is the legacy limiter.",
        "misconceptionTested": "CCMP as throughput limiter"
      },
      {
        "choiceIndex": 3,
        "explanation": "PSK is an authentication mode, not a cipher \u2014 **TKIP** encryption reduces wireless throughput.",
        "misconceptionTested": "PSK as throughput-limiting protocol"
      }
    ],
    "examTip": "Legacy **TKIP** = slower; modern **AES/CCMP** = WPA2 throughput answer."
  },
  'obj-4.7-source-q001':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Routers **classify traffic for QoS** using **ACLs** (and class-maps) to match packets before marking or queuing."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "ASICs forward at wire speed \u2014 **QoS classification** is policy-based via ACLs/class-maps, not generic L2 ASIC tables.",
        "misconceptionTested": "ASIC classification for QoS policy"
      },
      {
        "choiceIndex": 2,
        "explanation": "Route tables pick next hops \u2014 they do not classify flows into QoS classes.",
        "misconceptionTested": "Routing table as QoS classifier"
      },
      {
        "choiceIndex": 3,
        "explanation": "Frame filters are not the CCNA answer \u2014 IOS QoS classification starts with **ACL matches**.",
        "misconceptionTested": "Generic frame filter for QoS"
      }
    ],
    "examTip": "QoS classification on routers \u2192 **ACL/class-map** match, then mark (DSCP/CoS) and queue."
  },
  'obj-4.7-source-q004':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**Packet loss** measures frames **dropped when queues overflow** due to congestion \u2014 distinct from delay or jitter."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Bandwidth is capacity (bps) \u2014 **loss** counts discarded packets under congestion.",
        "misconceptionTested": "Bandwidth as queue discard metric"
      },
      {
        "choiceIndex": 1,
        "explanation": "Delay is one-way latency \u2014 **loss** is packets dropped from full queues.",
        "misconceptionTested": "Delay as packet discard"
      },
      {
        "choiceIndex": 2,
        "explanation": "Jitter is **variation in delay** \u2014 not the count of packets discarded.",
        "misconceptionTested": "Jitter as queue drop metric"
      }
    ],
    "examTip": "QoS metrics: **loss** = drops; **jitter** = delay variation; **delay** = latency."
  },
  'obj-4.7-source-q006':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "VoIP one-way delay should stay **\u2264150 ms** on CCNA \u2014 beyond that, conversation quality degrades noticeably."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "10 ms is ideal lab latency \u2014 CCNA cites **150 ms** as the practical maximum for VoIP.",
        "misconceptionTested": "10 ms as VoIP delay ceiling"
      },
      {
        "choiceIndex": 1,
        "explanation": "90 ms is good but not the exam's stated maximum \u2014 CCNA answer is **150 ms**.",
        "misconceptionTested": "90 ms as CCNA VoIP max"
      },
      {
        "choiceIndex": 3,
        "explanation": "300 ms is too high for acceptable VoIP \u2014 the recommended max is **150 ms**.",
        "misconceptionTested": "300 ms as acceptable VoIP delay"
      }
    ],
    "examTip": "VoIP delay budget \u2192 **150 ms** one-way max (also watch **jitter** and **loss**)."
  },
  'obj-2.6-source-q009':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "A **mesh wireless network** lets APs **wirelessly backhaul** where Ethernet cannot reach \u2014 ideal for large areas far from switches."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Autonomous APs still need wired uplinks \u2014 they do not solve distant areas without cable.",
        "misconceptionTested": "Autonomous APs without wired uplink"
      },
      {
        "choiceIndex": 2,
        "explanation": "Point-to-multipoint bridges link sites \u2014 **mesh** covers many roaming clients across a wide area.",
        "misconceptionTested": "PtMP bridge for client coverage"
      },
      {
        "choiceIndex": 3,
        "explanation": "Repeaters extend one SSID but scale poorly \u2014 **mesh** with a WLC scales better for large public areas.",
        "misconceptionTested": "Repeater for large high-speed mesh area"
      }
    ],
    "examTip": "No Ethernet to far APs \u2192 **mesh** (wireless backhaul); warehouse corner \u2192 repeater."
  },
  'obj-2.6-source-q002':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**Monitor mode** on a Cisco AP passively scans channels \u2014 used to **detect interference** (including Bluetooth) without serving clients."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "There is no **BT mode** on Cisco APs \u2014 spectrum analysis uses **monitor mode**.",
        "misconceptionTested": "BT mode as Cisco feature"
      },
      {
        "choiceIndex": 1,
        "explanation": "Sniffing mode is not the Cisco term \u2014 **monitor mode** performs passive RF analysis.",
        "misconceptionTested": "Sniffing mode for interference detection"
      },
      {
        "choiceIndex": 2,
        "explanation": "Analysis mode is not standard Cisco AP role naming \u2014 use **monitor mode** for interference surveys.",
        "misconceptionTested": "Analysis mode as official AP role"
      }
    ],
    "examTip": "AP RF survey / interference hunt \u2192 **monitor mode** (no client service)."
  },
  'obj-2.8-source-q002':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "From exec mode, type the **target IP address** directly (`Router#198.56.33.3`) to open a **Telnet** session to that host."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "`connect` is not the IOS exec command for Telnet \u2014 dial the **IP address** from privileged exec.",
        "misconceptionTested": "connect keyword for Telnet"
      },
      {
        "choiceIndex": 2,
        "explanation": "`remote` is not valid IOS syntax \u2014 Telnet is initiated by entering the **IP** at the `#` prompt.",
        "misconceptionTested": "remote command for Telnet"
      },
      {
        "choiceIndex": 3,
        "explanation": "`vty` configures line access \u2014 it does not launch an outbound Telnet session.",
        "misconceptionTested": "vty line as Telnet launcher"
      }
    ],
    "examTip": "Outbound Telnet from router exec \u2192 type **hostname/IP** (needs `transport input telnet` on vty)."
  },
  'obj-2.8-source-q004':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**SSH** encrypts the **management session** \u2014 replace cleartext Telnet/HTTP for device administration."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "RADIUS is an AAA server protocol \u2014 it does not encrypt your CLI session to the switch.",
        "misconceptionTested": "RADIUS as session encryption"
      },
      {
        "choiceIndex": 1,
        "explanation": "HTTP sends management in cleartext \u2014 use **SSH** for encrypted sessions.",
        "misconceptionTested": "HTTP for encrypted management"
      },
      {
        "choiceIndex": 3,
        "explanation": "SFTP encrypts file transfers \u2014 interactive device CLI encryption is **SSH**.",
        "misconceptionTested": "SFTP as CLI management encryption"
      }
    ],
    "examTip": "Encrypted device management \u2192 **SSH** (vty `transport input ssh` + RSA keys)."
  },
  'obj-5.1-source-q010':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**SSL/TLS** provides **integrity checking** (and encryption) so data in transit cannot be tampered with undetected."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "ACLs filter traffic \u2014 they do not cryptographically prove **integrity** of payload contents in transit.",
        "misconceptionTested": "ACLs as tamper prevention"
      },
      {
        "choiceIndex": 1,
        "explanation": "Spoofing mitigation addresses identity forgery \u2014 **SSL** specifically protects against **tampering** via hashes/MACs.",
        "misconceptionTested": "Spoofing mitigation as integrity control"
      },
      {
        "choiceIndex": 3,
        "explanation": "Encryption alone is broad \u2014 this stem's keyed answer is **SSL** as the protocol combining encryption + integrity.",
        "misconceptionTested": "Generic encryption label over SSL"
      }
    ],
    "examTip": "Tamper-proof web traffic \u2192 **SSL/TLS** (integrity + confidentiality)."
  },
  'obj-5.1-source-q011':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "A rogue AP relaying traffic between victims and the real network is a **man-in-the-middle (MitM)** attack \u2014 the attacker sits in the path."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Smurf attacks amplify ICMP to victims \u2014 not rogue AP traffic relay.",
        "misconceptionTested": "Smurf as rogue AP attack"
      },
      {
        "choiceIndex": 1,
        "explanation": "Compromised key attacks target encryption keys \u2014 this stem describes **traffic interception/relay**.",
        "misconceptionTested": "Compromised key for rogue AP relay"
      },
      {
        "choiceIndex": 2,
        "explanation": "Sniffing is passive capture \u2014 relaying to the corporate SSID is active **MitM**.",
        "misconceptionTested": "Passive sniffing as relay attack"
      }
    ],
    "examTip": "Rogue AP relaying clients \u2192 **MitM**; passive capture alone \u2192 sniffing."
  },
  'obj-5.2-source-q001':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**Security awareness training** teaches users to spot fraudulent emails \u2014 the best defense against **phishing** delivered via email."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Anti-malware blocks malicious attachments \u2014 it does not stop users clicking **credential-harvesting links**.",
        "misconceptionTested": "Anti-malware as primary phishing defense"
      },
      {
        "choiceIndex": 2,
        "explanation": "Antivirus targets known malware \u2014 phishing often uses **social engineering**, not just viruses.",
        "misconceptionTested": "Antivirus stops phishing links"
      },
      {
        "choiceIndex": 3,
        "explanation": "Certificates enable TLS trust \u2014 they do not train users to reject **spoofed sender** emails.",
        "misconceptionTested": "Certificates prevent phishing email"
      }
    ],
    "examTip": "Phishing defense = **user training** + email filtering; tech alone misses social engineering."
  },
  'obj-5.2-source-q002':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "A fake bank email with a look-alike site is classic **phishing** \u2014 tricking the user into revealing credentials."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Spam is unsolicited bulk mail \u2014 this stem describes **impersonation** for credential theft (**phishing**).",
        "misconceptionTested": "Spam as credential impersonation"
      },
      {
        "choiceIndex": 1,
        "explanation": "Password cracking breaks stored hashes \u2014 the user was lured to a fake site (**phishing**).",
        "misconceptionTested": "Password cracking as fake bank email"
      },
      {
        "choiceIndex": 3,
        "explanation": "Worms self-propagate \u2014 phishing is **deceptive email/links**, not automatic spreading malware.",
        "misconceptionTested": "Worm as phishing email"
      }
    ],
    "examTip": "Look-alike site + trusted brand email \u2192 **phishing**, not spam or worm."
  },
  'obj-6.3-source-q003':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "In spine-leaf, **every leaf connects to spines** \u2014 east-west traffic flows **leaf \u2192 spine \u2192 leaf**, never leaf-to-leaf direct."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Leaf switches do not transit through another leaf \u2014 traffic goes **up to spine** first.",
        "misconceptionTested": "Leaf-to-leaf before spine"
      },
      {
        "choiceIndex": 2,
        "explanation": "Spine switches interconnect leaves \u2014 they are not the endpoint path **spine \u2192 leaf \u2192 spine** for host traffic.",
        "misconceptionTested": "Spine as traffic endpoint"
      },
      {
        "choiceIndex": 3,
        "explanation": "Direct **leaf-to-leaf** links violate spine-leaf design \u2014 all paths traverse the **spine**.",
        "misconceptionTested": "Direct leaf-to-leaf forwarding"
      }
    ],
    "examTip": "Spine-leaf east-west path \u2192 **leaf\u2013spine\u2013leaf** (full mesh between tiers)."
  },
  'obj-6.3-source-q008':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**Cisco APIC-EM** is the SDN controller platform for **enterprise campus/branch** automation and policy."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "OpenSDN is not Cisco's enterprise controller product \u2014 Cisco offers **APIC-EM** (and DNA Center).",
        "misconceptionTested": "OpenSDN as Cisco enterprise controller"
      },
      {
        "choiceIndex": 2,
        "explanation": "OpenStack is cloud orchestration \u2014 not Cisco's SDN controller for enterprise connectivity.",
        "misconceptionTested": "OpenStack as Cisco SDN controller"
      },
      {
        "choiceIndex": 3,
        "explanation": "OpenDaylight is an open-source controller framework \u2014 Cisco enterprise SDN is **APIC-EM**.",
        "misconceptionTested": "OpenDaylight as Cisco proprietary controller"
      }
    ],
    "examTip": "Cisco enterprise SDN controller \u2192 **APIC-EM**; SD-WAN = vManage; ACI = APIC (data center)."
  },
}
