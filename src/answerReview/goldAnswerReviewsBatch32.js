/** Gold reviews — Batch 32: polish remaining short/high-traffic debriefs (40 entries). */
export const BATCH32_GOLD = {
  "1.6-c-q4": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**/26** blocks are 64 addresses. Host **.100** falls in **172.16.0.64–.127**, so the subnet is **172.16.0.64**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**172.16.0.0/26** only covers **.0–.63**. Host **.100** is above that range.",
        "misconceptionTested": "First subnet for every host"
      },
      {
        "choiceIndex": 2,
        "explanation": "**172.16.0.96** is not a /26 boundary (boundaries are .0, .64, .128…). .100 belongs in the **.64** block.",
        "misconceptionTested": "Non-boundary as network"
      },
      {
        "choiceIndex": 3,
        "explanation": "**172.16.0.128/26** starts at .128 — host **.100** is below that, in the **.64** subnet.",
        "misconceptionTested": "Next block for current host"
      }
    ],
    "examTip": "Find subnet: floor host octet to the **/26** block size (**64**)."
  },
  "5.5-c-q6": {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Classic **standard** numbered ACLs use **1–99** (and expanded 1300–1999)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**100–199** is the classic **extended** ACL range, not standard.",
        "misconceptionTested": "Extended range as standard"
      },
      {
        "choiceIndex": 2,
        "explanation": "**200–299** is not the primary CCNA standard ACL number range — use **1–99**.",
        "misconceptionTested": "Wrong ACL number block"
      },
      {
        "choiceIndex": 3,
        "explanation": "Expanded numbers exist, but the exam default for standard is still **1–99** (not “1300–2699 only”).",
        "misconceptionTested": "Expanded-only as standard"
      }
    ],
    "examTip": "Standard ACL = **1–99**; extended = **100–199**."
  },
  "1.8-c-q5": {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Modified EUI-64 inserts **FFFE** in the middle of the 48-bit MAC, then flips the U/L bit."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**FF00** is not the EUI-64 pad — the inserted 16 bits are **FFFE**.",
        "misconceptionTested": "FF00 as EUI-64 insert"
      },
      {
        "choiceIndex": 2,
        "explanation": "**FFFF** is not inserted — use **FFFE** between the MAC halves.",
        "misconceptionTested": "FFFF as EUI-64 insert"
      },
      {
        "choiceIndex": 3,
        "explanation": "**FE80** is the link-local prefix — not the value inserted into a MAC for EUI-64.",
        "misconceptionTested": "Link-local as EUI-64 insert"
      }
    ],
    "examTip": "EUI-64: split MAC → insert **FFFE** → flip U/L bit."
  },
  "1.5-c-q4": {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Cisco switches age MAC table entries after **300 seconds** by default."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**30 s** is not the MAC aging default — IOS defaults to **300 s**.",
        "misconceptionTested": "30s MAC aging"
      },
      {
        "choiceIndex": 1,
        "explanation": "**60 s** is the CDP hello default — MAC aging defaults to **300 s**.",
        "misconceptionTested": "CDP timer as MAC aging"
      },
      {
        "choiceIndex": 3,
        "explanation": "**3600 s** (1 hour) is far longer than the default **300 s** MAC aging timer.",
        "misconceptionTested": "1-hour MAC aging default"
      }
    ],
    "examTip": "MAC aging default = **300 s** (`mac address-table aging-time`)."
  },
  "1.8-c-q4": {
    "correct": {
      "choiceIndex": 2,
      "explanation": "IPv6 LAN subnets are almost always **/64** — 64-bit network + 64-bit interface ID."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**/24** is IPv4 thinking — IPv6 LANs use **/64**, not /24.",
        "misconceptionTested": "IPv4 /24 on IPv6 LAN"
      },
      {
        "choiceIndex": 1,
        "explanation": "**/48** is a common **site** allocation — individual LANs are carved as **/64**.",
        "misconceptionTested": "Site /48 as LAN prefix"
      },
      {
        "choiceIndex": 3,
        "explanation": "**/128** is a single host address — not a typical LAN subnet prefix.",
        "misconceptionTested": "/128 as LAN prefix"
      }
    ],
    "examTip": "IPv6 LAN default = **/64**."
  },
  "1.9-c-q6": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Anycast** uses the same address on multiple nodes; traffic goes to the **nearest** (routing metric)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Multicast** is one-to-many simultaneous delivery — anycast is one-to-nearest of identical addresses.",
        "misconceptionTested": "Multicast as anycast"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Link-local** is FE80::/10 scope — it does not mean “nearest of several servers.”",
        "misconceptionTested": "Link-local as anycast"
      },
      {
        "choiceIndex": 3,
        "explanation": "IPv6 has **no broadcast** — nearest-of-identical is **anycast**, not broadcast.",
        "misconceptionTested": "Broadcast on IPv6"
      }
    ],
    "examTip": "Same address, nearest node = **anycast**."
  },
  "1.6-c-q12": {
    "correct": {
      "choiceIndex": 0,
      "explanation": "200 hosts need ≥202 addresses → **/24** (254 usable) is the smallest common mask that fits."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**/25** provides only **126** usable hosts — not enough for 200.",
        "misconceptionTested": "/25 for 200 hosts"
      },
      {
        "choiceIndex": 2,
        "explanation": "**/23** works (510 usable) but is **larger** than needed — the question asks the **smallest** that fits.",
        "misconceptionTested": "Oversized /23"
      },
      {
        "choiceIndex": 3,
        "explanation": "**/26** allows only **62** usable hosts — far too small for 200.",
        "misconceptionTested": "/26 for 200 hosts"
      }
    ],
    "examTip": "200 hosts → need ≥202 addresses → smallest common fit = **/24**."
  },
  "3.4-c-q3": {
    "correct": {
      "choiceIndex": 0,
      "explanation": "With default reference bandwidth (100 Mbps), a **100 Mbps** link has OSPF cost **1**."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Cost **10** matches **10 Mbps** at default ref-bw — **100 Mbps** is cost **1**.",
        "misconceptionTested": "10M cost on 100M link"
      },
      {
        "choiceIndex": 2,
        "explanation": "Cost **100** is far too high for a 100 Mbps link with default reference bandwidth.",
        "misconceptionTested": "Cost equals Mbps"
      },
      {
        "choiceIndex": 3,
        "explanation": "**64** is not the default OSPF cost for 100 Mbps — default is **1**.",
        "misconceptionTested": "Invented cost 64"
      }
    ],
    "examTip": "Default ref-bw → **100M = cost 1**, **10M = cost 10**."
  },
  "2.1-c-q8": {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Create a VLAN in VLAN config mode with **`vlan 30`** (then optionally `name …`)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**`switchport access vlan 30`** assigns a port to VLAN 30 — it does not define the VLAN database entry as the create step.",
        "misconceptionTested": "Access assign as create"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`create vlan 30`** is not valid Cisco IOS syntax — use **`vlan 30`**.",
        "misconceptionTested": "Invented create vlan"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`ip vlan 30`** is invalid — VLANs are Layer 2 database objects, not IP commands.",
        "misconceptionTested": "IP vlan invent"
      }
    ],
    "examTip": "Create VLAN → **`vlan 30`** → assign ports with **`switchport access vlan 30`**."
  },
  "1.6-c-q7": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Borrowing **3** bits creates **2³ = 8** subnets (CCNA uses 2^borrowed)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**6** comes from legacy “subtract 2 subnets” classful math — modern CCNA counts **2^borrowed = 8**.",
        "misconceptionTested": "Legacy subnet subtract"
      },
      {
        "choiceIndex": 2,
        "explanation": "**16** subnets need **4** borrowed bits (2⁴ = 16) — borrowing **3** bits yields **8**.",
        "misconceptionTested": "4 bits for 3 borrowed"
      },
      {
        "choiceIndex": 3,
        "explanation": "**3** is the number of bits borrowed — subnet count is **2³ = 8**.",
        "misconceptionTested": "Bits as subnet count"
      }
    ],
    "examTip": "Subnets created = **2^(borrowed bits)**."
  },
  "1.8-c-q10": {
    "correct": {
      "choiceIndex": 2,
      "explanation": "A **/64** prefix leaves **64 bits** for the interface ID (128 − 64)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**32**-bit interface IDs are not the standard /64 LAN design — interface ID is **64** bits.",
        "misconceptionTested": "32-bit IID on /64"
      },
      {
        "choiceIndex": 1,
        "explanation": "**48** bits would imply a /80 prefix — standard LANs use **/64** → **64**-bit IID.",
        "misconceptionTested": "48-bit IID on /64"
      },
      {
        "choiceIndex": 3,
        "explanation": "**128** bits is the whole address — /64 splits network vs host **evenly** (64/64).",
        "misconceptionTested": "Full address as IID"
      }
    ],
    "examTip": "/64 → **64-bit** network + **64-bit** interface ID."
  },
  "5.5-c-q5": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Wildcard for a /24 is the inverse of 255.255.255.0 → **0.0.0.255**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**255.255.255.0** is the **subnet mask**, not the ACL wildcard for that /24.",
        "misconceptionTested": "Mask as wildcard"
      },
      {
        "choiceIndex": 2,
        "explanation": "**0.0.0.0** matches a **single host** — not every address in the /24.",
        "misconceptionTested": "Host wildcard for /24"
      },
      {
        "choiceIndex": 3,
        "explanation": "**255.255.255.255** matches **any** address — far broader than exactly one /24.",
        "misconceptionTested": "Any-match as /24 wildcard"
      }
    ],
    "examTip": "/24 ACL wildcard = **0.0.0.255** (invert the mask)."
  },
  "1.6-c-q5": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Need ≥30 usable → **/27** gives exactly **30** usable with the fewest wasted addresses."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**/26** gives 62 usable — works but **wastes more** than /27 for only 30 hosts.",
        "misconceptionTested": "Larger than needed /26"
      },
      {
        "choiceIndex": 2,
        "explanation": "**/28** only allows **14** usable hosts — not enough for 30.",
        "misconceptionTested": "/28 for 30 hosts"
      },
      {
        "choiceIndex": 3,
        "explanation": "**/29** allows only **6** usable hosts — far too small for 30.",
        "misconceptionTested": "/29 for 30 hosts"
      }
    ],
    "examTip": "Need N hosts → smallest prefix with 2^h−2 ≥ N; **/27 = 30** usable."
  },
  "1.3-c-q4": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "SFP fiber modules commonly use **LC** connectors (SC on older gear)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**RJ-45** is copper Ethernet — pluggable **fiber** SFPs use connectors like **LC**.",
        "misconceptionTested": "RJ-45 on fiber SFP"
      },
      {
        "choiceIndex": 2,
        "explanation": "**DB-9** is a serial/console connector — not an SFP optical interface.",
        "misconceptionTested": "DB-9 as SFP"
      },
      {
        "choiceIndex": 3,
        "explanation": "**USB-C** is not used on standard Cisco SFP optical modules — use **LC** (or SC).",
        "misconceptionTested": "USB-C as SFP"
      }
    ],
    "examTip": "SFP connectors: **LC** (common) | **SC** (older)."
  },
  "1.8-c-q8": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Within a hextet, only **leading** zeros may be dropped (`00a0` → `a0`)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Trailing** zeros inside a hextet are significant — only **leading** zeros may drop.",
        "misconceptionTested": "Trailing zero drop"
      },
      {
        "choiceIndex": 2,
        "explanation": "You cannot strip **all** zeros from a non-zero hextet — `a0` must keep its value.",
        "misconceptionTested": "Strip all zeros"
      },
      {
        "choiceIndex": 3,
        "explanation": "IPv6 shortening **does** allow dropping leading zeros per hextet (and one `::`).",
        "misconceptionTested": "No shortening allowed"
      }
    ],
    "examTip": "Per-hextet: drop **leading** zeros only."
  },
  "1.8-c-q2": {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Drop leading zeros and compress the longest zero run once → **2001:db8::1**."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Only **one** `::` is allowed — `:::` is invalid syntax.",
        "misconceptionTested": "Triple colon"
      },
      {
        "choiceIndex": 2,
        "explanation": "`::` may appear **only once** — you cannot split zero compression into two places.",
        "misconceptionTested": "Two :: groups"
      },
      {
        "choiceIndex": 3,
        "explanation": "**2001::db8::1** uses two `::` groups — illegal; compress the longest zero run once.",
        "misconceptionTested": "Double :: with db8"
      }
    ],
    "examTip": "IPv6 shorten: drop leading zeros; **one `::` per address**."
  },
  "3.2-c-q10": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "In `[110/30]`, **110** is administrative distance and **30** is the protocol metric (OSPF cost)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Order is **[AD/metric]** — not metric then AD. **110** is AD, **30** is metric.",
        "misconceptionTested": "Reversed AD/metric"
      },
      {
        "choiceIndex": 2,
        "explanation": "Neither bracket value is a **prefix** — they are **AD and metric**.",
        "misconceptionTested": "Prefix in brackets"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Hop count** is RIP — OSPF uses **cost**; brackets are still **AD/metric**.",
        "misconceptionTested": "Hop count for OSPF"
      }
    ],
    "examTip": "Brackets = **[administrative distance / protocol metric]**."
  },
  "1.11-c-q5": {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**802.11ax** is marketed as **Wi‑Fi 6**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Wi‑Fi 3 maps to older 802.11g-era branding — **ax** is **Wi‑Fi 6**.",
        "misconceptionTested": "Wi-Fi 3 for ax"
      },
      {
        "choiceIndex": 1,
        "explanation": "Wi‑Fi 4 is **802.11n** — ax is two generations newer (**Wi‑Fi 6**).",
        "misconceptionTested": "Wi-Fi 4 for ax"
      },
      {
        "choiceIndex": 2,
        "explanation": "Wi‑Fi 5 is **802.11ac** — **802.11ax** is the next generation, marketed as **Wi‑Fi 6**.",
        "misconceptionTested": "Wi-Fi 5 for ax"
      }
    ],
    "examTip": "**n=Wi‑Fi 4**, **ac=Wi‑Fi 5**, **ax=Wi‑Fi 6**."
  },
  "2.2-c-q2": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "The 802.1Q tag adds **4 bytes** (TPID + PCP/DEI + VLAN ID)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**2 bytes** is too small — 802.1Q inserts a full **4-byte** tag.",
        "misconceptionTested": "2-byte 802.1Q"
      },
      {
        "choiceIndex": 2,
        "explanation": "**8 bytes** is not the 802.1Q tag size — the tag is exactly **4 bytes**.",
        "misconceptionTested": "8-byte 802.1Q"
      },
      {
        "choiceIndex": 3,
        "explanation": "**12 bytes** is not 802.1Q — the VLAN tag is **4 bytes**.",
        "misconceptionTested": "12-byte 802.1Q"
      }
    ],
    "examTip": "802.1Q tag = **4 bytes**; native VLAN frames are **untagged**."
  },
  "3.2-c-q3": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Same prefix: **lowest AD wins**. Static **AD 1** beats OSPF **AD 110** regardless of metric."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "OSPF’s **higher AD (110)** loses to static — metric is not compared across protocols here.",
        "misconceptionTested": "Metric before AD"
      },
      {
        "choiceIndex": 2,
        "explanation": "Only **one** best route per prefix is installed in the RIB — not both.",
        "misconceptionTested": "Install both routes"
      },
      {
        "choiceIndex": 3,
        "explanation": "**AD** breaks the tie **before** metric when sources differ — no metric tie-break needed.",
        "misconceptionTested": "Metric tie across protocols"
      }
    ],
    "examTip": "Selection: **longest prefix** → **lowest AD** → **lowest metric** (same protocol)."
  },
  "1.6-c-q3": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**192.168.10.0/26** spans .0–.63 → broadcast is **192.168.10.63**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**.255** is the broadcast of a **/24**, not this **/26** block.",
        "misconceptionTested": "/24 broadcast on /26"
      },
      {
        "choiceIndex": 2,
        "explanation": "**.127** is the broadcast of **192.168.10.64/26**, not .0/26.",
        "misconceptionTested": "Next block broadcast"
      },
      {
        "choiceIndex": 3,
        "explanation": "**.64** is the **network** of the next /26 — not the broadcast of .0/26.",
        "misconceptionTested": "Next network as broadcast"
      }
    ],
    "examTip": "/26 block = 64 → broadcast = network + 63."
  },
  "1.4-c-q6": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Runts** are undersized Ethernet frames (below the 64-byte minimum)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Oversized** frames are **giants** — runts are **too small**.",
        "misconceptionTested": "Giant as runt"
      },
      {
        "choiceIndex": 2,
        "explanation": "Runts are a **size** classification — not limited to broadcast frames.",
        "misconceptionTested": "Runt = broadcast only"
      },
      {
        "choiceIndex": 3,
        "explanation": "Encryption does not define runts — runts are frames **below minimum length**.",
        "misconceptionTested": "Encrypted as runt"
      }
    ],
    "examTip": "**Runt** <64 B | normal 64–1518 | **giant** >MTU."
  },
  "1.11-c-q2": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**5 GHz** typically offers **more channels and higher throughput** but **shorter range** than 2.4 GHz."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "5 GHz has **shorter** range than 2.4 GHz — higher frequency attenuates faster through walls.",
        "misconceptionTested": "5 GHz longer range"
      },
      {
        "choiceIndex": 2,
        "explanation": "5 GHz supports **WPA2/WPA3** — encryption is not limited to 2.4 GHz.",
        "misconceptionTested": "No encryption on 5 GHz"
      },
      {
        "choiceIndex": 3,
        "explanation": "**WEP** is deprecated on **both** bands — not a 5 GHz-only limitation.",
        "misconceptionTested": "WEP-only 5 GHz"
      }
    ],
    "examTip": "2.4 = **range**; 5 GHz = **speed + channels**."
  },
  "1.4-c-q8": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "CRC errors beside power lines point to **EMI on copper** — move/shield the cable."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Wrong subnet** breaks IP reachability — it does not increment **physical CRC** counters.",
        "misconceptionTested": "Subnet as CRC cause"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Missing default route** is Layer 3 — CRC is a **Layer 1/2** integrity symptom.",
        "misconceptionTested": "Route as CRC cause"
      },
      {
        "choiceIndex": 3,
        "explanation": "**WPA3** is wireless security — copper CRC with power-line proximity is **cabling/EMI**.",
        "misconceptionTested": "WPA3 as copper CRC"
      }
    ],
    "examTip": "Copper: keep away from **power lines**; use **shielded** cable if unavoidable."
  },
  "5.5-c-q8": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Apply an ACL on an interface with **`ip access-group 100 in`** (or `out`)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`access-list 100 in`** is not valid interface apply syntax — use **`ip access-group`**.",
        "misconceptionTested": "access-list as apply"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`ip access-list`** defines/edits the ACL — **`ip access-group`** applies it to an interface.",
        "misconceptionTested": "Define vs apply ACL"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`apply acl`** is not Cisco IOS syntax — use **`ip access-group <num> in|out`**.",
        "misconceptionTested": "Invented apply acl"
      }
    ],
    "examTip": "Apply ACL → **`ip access-group <num> in|out`**."
  },
  "1.7-c-q7": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**False** — APIPA is **169.254.0.0/16**, which is **not** RFC 1918 (10/8, 172.16/12, 192.168/16)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "APIPA **169.254/16** is link-local autoconfig — **not** the same as RFC 1918 **192.168/16**.",
        "misconceptionTested": "APIPA equals RFC 1918"
      }
    ],
    "examTip": "APIPA **169.254/16** ≠ RFC 1918 private ranges."
  },
  "1.8-c-q3": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**False** — an IPv6 address may use **`::` at most once**; twice makes it ambiguous."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Using **`::` twice** makes the address ambiguous/invalid — only one zero-compression is allowed.",
        "misconceptionTested": "Two :: allowed"
      }
    ],
    "examTip": "One **`::`** max per IPv6 address."
  },
  "1.6-c-q6": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**/30** has 4 addresses − network − broadcast = **2** usable hosts (classic P2P)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**1** usable is not the classic /30 count — /30 provides **two** assignable addresses.",
        "misconceptionTested": "1 usable on /30"
      },
      {
        "choiceIndex": 2,
        "explanation": "**4** is the **total** address count — usable hosts are **2** after subtracting network/broadcast.",
        "misconceptionTested": "Total as usable"
      },
      {
        "choiceIndex": 3,
        "explanation": "**/30** always has usable hosts in classic counting — **/31** is the special P2P case.",
        "misconceptionTested": "0 usable on /30"
      }
    ],
    "examTip": "/30 WAN link → **2 usable** hosts."
  },
  "1.8-c-q9": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**`show ipv6 interface brief`** summarizes IPv6 addresses and interface status."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`show ip interface brief`** is the **IPv4** summary — use the **ipv6** variant.",
        "misconceptionTested": "IPv4 brief for IPv6"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`show ipv6 route`** shows the routing table, not the interface address summary.",
        "misconceptionTested": "Route table for IF brief"
      },
      {
        "choiceIndex": 3,
        "explanation": "Running-config shows lines of config — **brief** is faster for address/status checks.",
        "misconceptionTested": "Running-config for brief"
      }
    ],
    "examTip": "IPv6 IF summary → **`show ipv6 interface brief`**."
  },
  "1.8-c-q6": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Building an address from an RA prefix + self-generated interface ID is **SLAAC**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**DHCPv6** is server-assigned addressing — not RA-only autoconfig from a prefix.",
        "misconceptionTested": "DHCPv6 as SLAAC"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Static** is manually configured — SLAAC derives the address from the RA prefix.",
        "misconceptionTested": "Static as SLAAC"
      },
      {
        "choiceIndex": 3,
        "explanation": "**NAT66** translates between IPv6 networks — unrelated to address autoconfiguration.",
        "misconceptionTested": "NAT66 as SLAAC"
      }
    ],
    "examTip": "RA prefix + self-built host ID = **SLAAC**."
  },
  "2.1-c-q5": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "VLAN 1 is the **default VLAN** and the **default native VLAN** on many Cisco platforms."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Any VLAN can be routed via an SVI — VLAN 1 is not uniquely “the only routable VLAN.”",
        "misconceptionTested": "Only VLAN 1 routable"
      },
      {
        "choiceIndex": 2,
        "explanation": "VLAN 1 **carries traffic** by default — it is not disabled.",
        "misconceptionTested": "VLAN 1 cannot carry traffic"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Voice VLAN** is a separate feature — VLAN 1 is the default **data** VLAN.",
        "misconceptionTested": "VLAN 1 as voice"
      }
    ],
    "examTip": "Change **native VLAN** off VLAN 1 on trunks for security."
  },
  "3.4-c-q7": {
    "correct": {
      "choiceIndex": 3,
      "explanation": "A healthy OSPF adjacency for exchanging LSAs settles in **Full**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Init** is early neighbor discovery — adjacency is not complete.",
        "misconceptionTested": "Init as healthy final"
      },
      {
        "choiceIndex": 1,
        "explanation": "**2-Way** can be normal for DROthers on multi-access — fully adjacent neighbors reach **Full**.",
        "misconceptionTested": "2-Way as Full"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Exchange** is mid-database sync — complete adjacency is **Full**.",
        "misconceptionTested": "Exchange as final"
      }
    ],
    "examTip": "OSPF: Down → Init → 2-Way → ExStart → Exchange → Loading → **Full**."
  },
  "1.1-c-q6": {
    "correct": {
      "choiceIndex": 2,
      "explanation": "An **employee laptop** is a classic **endpoint** (user/client device at the edge)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "A **web server** is infrastructure/service — endpoints are typically user/client devices.",
        "misconceptionTested": "Server as endpoint"
      },
      {
        "choiceIndex": 1,
        "explanation": "**DNS** is a network service — not an end-user endpoint device.",
        "misconceptionTested": "DNS as endpoint"
      },
      {
        "choiceIndex": 3,
        "explanation": "A **core router** is infrastructure — endpoints are clients like PCs and phones.",
        "misconceptionTested": "Core router as endpoint"
      }
    ],
    "examTip": "Endpoint = **user/client device** (laptop, phone) — not core routers/services."
  },
  "5.5-c-q9": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "ACLs use **first match wins** — a broad **permit** above a specific **deny** matches first."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Deny rules **do** work — **order** decides which ACE matches first.",
        "misconceptionTested": "ACLs ignore deny"
      },
      {
        "choiceIndex": 2,
        "explanation": "Wildcards define match scope — they do not override **top-down first-match** order.",
        "misconceptionTested": "Wildcard fixes order"
      },
      {
        "choiceIndex": 3,
        "explanation": "An unapplied ACL filters nothing — here the issue is **permit before deny** order.",
        "misconceptionTested": "Unapplied as order issue"
      }
    ],
    "examTip": "Put **specific denies before broad permits** — first match wins."
  },
  "5.5-c-q4": {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**Extended** ACLs (match src+dst+port) should sit **close to the source**."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Close to **destination** is the rule for **standard** ACLs (source-only matching).",
        "misconceptionTested": "Extended near destination"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Root bridge** is STP terminology — unrelated to ACL placement.",
        "misconceptionTested": "Root bridge for ACL"
      },
      {
        "choiceIndex": 3,
        "explanation": "DHCP server location does not set extended ACL filter placement.",
        "misconceptionTested": "DHCP for ACL place"
      }
    ],
    "examTip": "Extended → **near source**; standard → **near destination**."
  },
  "1.10-c-q7": {
    "correct": {
      "choiceIndex": 0,
      "explanation": "On Linux, **`ip route`** shows the routing table including the default gateway."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**`show vlan brief`** is **Cisco IOS** — not a Linux host command.",
        "misconceptionTested": "IOS on Linux"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`ifconfig`** shows interface addresses — not the full routing table with gateway.",
        "misconceptionTested": "ifconfig as route table"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`debug ip routing`** is IOS troubleshooting — Linux uses **`ip route`**.",
        "misconceptionTested": "IOS debug on Linux"
      }
    ],
    "examTip": "Linux routing: **`ip route`** | **`route -n`**."
  },
  "1.3-c-q7": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "SFPs provide **flexible, hot-swappable media** on a port (change optic, not the chassis port)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "SFP changes **port media** — it does not increase **CPU speed**.",
        "misconceptionTested": "SFP as CPU boost"
      },
      {
        "choiceIndex": 2,
        "explanation": "SFP is a **physical-layer** module — it does not replace **Spanning Tree**.",
        "misconceptionTested": "SFP replaces STP"
      },
      {
        "choiceIndex": 3,
        "explanation": "SFP carries L1/L2 signals — **encryption** is a higher-layer function.",
        "misconceptionTested": "SFP encrypts"
      }
    ],
    "examTip": "SFP/SFP+ = **pluggable optics** — swap module for distance/speed."
  },
  "1.4-c-q5": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Rising CRCs on one link → first check/replace **cable** and verify **speed/duplex**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Reload** is a last resort — physical CRC issues need **cable/duplex** checks first.",
        "misconceptionTested": "Reload first for CRC"
      },
      {
        "choiceIndex": 2,
        "explanation": "**VLAN** misconfig causes connectivity issues — CRC points to **physical layer**.",
        "misconceptionTested": "VLAN for CRC"
      },
      {
        "choiceIndex": 3,
        "explanation": "**OSPF** is routing — CRC is a **Layer 1/2** integrity error.",
        "misconceptionTested": "OSPF for CRC"
      }
    ],
    "examTip": "CRC order: **cable** → **duplex** → optics → hardware."
  },
  "1.3-c-q5": {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**Cat6a** supports **10 Gbps** at **100 m** (exam pairing)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**100 Mbps** is older Cat5 territory — Cat6a targets **10 Gbps** at 100 m.",
        "misconceptionTested": "100M for Cat6a"
      },
      {
        "choiceIndex": 1,
        "explanation": "**1 Gbps** is common on Cat5e/Cat6 — Cat6a is the **10G** copper standard at 100 m.",
        "misconceptionTested": "1G for Cat6a"
      },
      {
        "choiceIndex": 3,
        "explanation": "**40 Gbps** over UTP at 100 m is not the Cat6a exam pairing — **10 Gbps** is.",
        "misconceptionTested": "40G for Cat6a"
      }
    ],
    "examTip": "Cat6a @ 100 m → **10 Gbps**. Cat5e → 1 Gbps."
  },
  "1.12-c-q6": {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Each VM typically includes its **own guest OS** and **virtual NICs**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "A **container image** is lightweight — VMs bundle a **full guest operating system**.",
        "misconceptionTested": "Container as VM"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Shared kernel** describes **containers** — each VM has its **own guest kernel/OS**.",
        "misconceptionTested": "Shared kernel VMs"
      },
      {
        "choiceIndex": 3,
        "explanation": "VMs almost always have at least one **vNIC** for network connectivity.",
        "misconceptionTested": "VM with no NIC"
      }
    ],
    "examTip": "VM = **guest OS + vNIC**; containers share the host kernel."
  }
}
