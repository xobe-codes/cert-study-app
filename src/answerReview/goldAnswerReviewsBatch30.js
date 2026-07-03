/** Gold reviews — Batch 30: 4.9 stragglers, ACL 5.6, port security 5.7, AAA 5.8, SDN/automation 6.2–6.7 (105 entries). */
export const BATCH30_GOLD = {
  'obj-4.9-source-q002':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**`copy tftp flash`** (privileged EXEC) downloads the IOS image from TFTP into **flash** \u2014 the standard upgrade starting command."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**`copy tftp ios`** is invalid \u2014 the destination keyword is **`flash`**, not `ios`.",
        "misconceptionTested": "Invented ios destination for TFTP copy"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`copy tftp nvram`** targets startup-config storage \u2014 IOS images go to **flash**.",
        "misconceptionTested": "NVRAM as IOS image target"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`upgrade tftp flash`** is not valid IOS syntax \u2014 use **`copy tftp flash`**.",
        "misconceptionTested": "Invented upgrade command"
      }
    ],
    "examTip": "IOS upgrade: **`copy tftp flash`** \u2192 verify with **`show flash:`** \u2192 set boot system \u2192 reload."
  },
  'obj-4.9-source-q003':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**`boot system tftp://192.168.1.2 c2900-universalk9-mz.SPA.151-4.M4.bin`** \u2014 image filename **before** the TFTP URL in global config."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`boot tftp://`** is privileged EXEC syntax \u2014 boot commands belong in **global config**.",
        "misconceptionTested": "Exec-mode boot for TFTP image"
      },
      {
        "choiceIndex": 1,
        "explanation": "Missing **`system`** keyword \u2014 IOS uses **`boot system tftp://<server> <filename>`**.",
        "misconceptionTested": "boot without system keyword"
      },
      {
        "choiceIndex": 2,
        "explanation": "URL before filename reverses IOS argument order \u2014 **filename then location** on the `boot system` line.",
        "misconceptionTested": "Reversed boot system argument order"
      }
    ],
    "examTip": "Boot from TFTP: **`boot system tftp://<ip> <image.bin>`** in global config + **`copy tftp flash`** first."
  },
  'obj-4.9-source-q004':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "A **blank flash card** leaves no valid IOS \u2014 the router boots to **ROMMON** and you **TFTP-download** the image."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "New flash is **empty**, not pre-loaded with mini-IOS \u2014 you must recover via **ROMMON/TFTP**.",
        "misconceptionTested": "Mini-IOS always on new flash"
      },
      {
        "choiceIndex": 2,
        "explanation": "IOS **is stored on flash** \u2014 without an image the device cannot boot normally.",
        "misconceptionTested": "IOS not on flash card"
      },
      {
        "choiceIndex": 3,
        "explanation": "Formatting alone does not place an IOS image \u2014 you still need to **copy the image** to flash.",
        "misconceptionTested": "Format-only restores IOS"
      }
    ],
    "examTip": "Dead flash / blank card \u2192 **ROMMON** \u2192 set IP/TFTP vars \u2192 **`tftpdnld`** or **`copy tftp flash`**."
  },
  'obj-4.9-source-q005':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "FTP credentials use **two global commands**: **`ip ftp username USER`** and **`ip ftp password USERPASS`**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`password`** cannot appear on the same line as **`ip ftp username`** \u2014 split into two commands.",
        "misconceptionTested": "Combined username+password on one line"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`ftp USER password`** is not valid IOS global syntax.",
        "misconceptionTested": "Invented ftp global command"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`username`** creates local login accounts \u2014 FTP copy uses **`ip ftp username/password`**.",
        "misconceptionTested": "Local username for FTP client"
      }
    ],
    "examTip": "FTP backup: **`ip ftp username`** + **`ip ftp password`** \u2192 **`copy running-config ftp:`**."
  },
  'obj-5.6-source-q009':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**`ip access-list 20 192.168.1.0 0.0.0.255`** begins a **standard** ACL (1\u201399) blocking source **192.168.1.0/24** with wildcard **0.0.0.255**."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**`ip access-list 100`** starts an **extended** ACL \u2014 source-only filter needs standard range **1\u201399**.",
        "misconceptionTested": "Extended range for standard filter"
      },
      {
        "choiceIndex": 2,
        "explanation": "CIDR **`/24`** is not valid in IOS ACL lines \u2014 use **address + wildcard mask**.",
        "misconceptionTested": "CIDR notation in ACL"
      },
      {
        "choiceIndex": 3,
        "explanation": "Wildcard **255.255.255.0** is inverted \u2014 /24 uses **0.0.0.255**.",
        "misconceptionTested": "Subnet mask as wildcard"
      }
    ],
    "examTip": "ACL placement: **standard \u2192 near destination** | **extended \u2192 near source** | wildcard = inverse of subnet mask."
  },
  'obj-5.6-source-q010':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**0.0.0.0** with wildcard **255.255.255.255** matches **any address** \u2014 the 'any' keyword equivalent."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Broadcast is a **specific** address, not 0.0.0.0/255.255.255.255 match-all.",
        "misconceptionTested": "Wildcard pair as broadcast definition"
      },
      {
        "choiceIndex": 1,
        "explanation": "**0.0.0.0 255.255.255.255** matches every host \u2014 it does **not** match nothing.",
        "misconceptionTested": "Match-none wildcard pair"
      },
      {
        "choiceIndex": 2,
        "explanation": "Network address uses host bits **0** with subnet wildcard \u2014 not all-ones wildcard.",
        "misconceptionTested": "Network address wildcard confusion"
      }
    ],
    "examTip": "ACL placement: **standard \u2192 near destination** | **extended \u2192 near source** | wildcard = inverse of subnet mask."
  },
  'obj-5.6-source-q011':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "IOS ACL interface limits: **one direction**, **one protocol per application**, **one ACL per direction** \u2014 **all listed** are true."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "You can apply **in and out** on the same interface \u2014 but only **one ACL per direction**.",
        "misconceptionTested": "Single direction only misunderstood"
      },
      {
        "choiceIndex": 1,
        "explanation": "ACLs can filter **ip**, **tcp**, etc. \u2014 but each application binds **one** ACL per direction/protocol context.",
        "misconceptionTested": "Single protocol limit missed"
      },
      {
        "choiceIndex": 2,
        "explanation": "Multiple ACLs cannot stack on the same interface/direction \u2014 **all restrictions apply**.",
        "misconceptionTested": "Single ACL per port missed"
      }
    ],
    "examTip": "ACL placement: **standard \u2192 near destination** | **extended \u2192 near source** | wildcard = inverse of subnet mask."
  },
  'obj-5.6-source-q013':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**Expanded extended ACLs** use numbered range **2000\u20132699** (legacy expanded syntax)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**1000\u20131999** is not the extended expanded range.",
        "misconceptionTested": "Wrong thousand-range for extended expanded"
      },
      {
        "choiceIndex": 1,
        "explanation": "**1100\u20131299** is not a valid IOS ACL range.",
        "misconceptionTested": "Invented ACL range"
      },
      {
        "choiceIndex": 2,
        "explanation": "**1300\u20131999** is the **standard expanded** range, not extended.",
        "misconceptionTested": "Standard expanded range for extended"
      }
    ],
    "examTip": "ACL placement: **standard \u2192 near destination** | **extended \u2192 near source** | wildcard = inverse of subnet mask."
  },
  'obj-5.6-source-q014':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**192.168.1.0/25** = 128 hosts \u2014 wildcard **0.0.0.127** (invert subnet mask **255.255.255.128**)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**255.255.255.128** is the **subnet mask**, not the ACL wildcard.",
        "misconceptionTested": "Subnet mask used as wildcard"
      },
      {
        "choiceIndex": 1,
        "explanation": "**0.0.0.128** is invalid \u2014 wildcard bit 128 in last octet is wrong.",
        "misconceptionTested": "Invalid wildcard 0.0.0.128"
      },
      {
        "choiceIndex": 3,
        "explanation": "**0.0.0.63** matches /26 (64 hosts), not /25.",
        "misconceptionTested": "/26 wildcard for /25 network"
      }
    ],
    "examTip": "ACL placement: **standard \u2192 near destination** | **extended \u2192 near source** | wildcard = inverse of subnet mask."
  },
  'obj-5.6-source-q015':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**Named ACLs** let you **delete individual lines** (`no <seq>`) without removing the whole list."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Numbered ACLs require **`no access-list <num>`** to wipe entirely \u2014 cannot remove one line easily.",
        "misconceptionTested": "Standard ACL line delete"
      },
      {
        "choiceIndex": 1,
        "explanation": "Dynamic ACLs are reflexive \u2014 not about per-line editing.",
        "misconceptionTested": "Dynamic ACL for line edit"
      },
      {
        "choiceIndex": 2,
        "explanation": "Extended describes match criteria \u2014 **named** ACLs add line-level editability.",
        "misconceptionTested": "Extended type for line delete"
      }
    ],
    "examTip": "ACL placement: **standard \u2192 near destination** | **extended \u2192 near source** | wildcard = inverse of subnet mask."
  },
  'obj-5.6-source-q016':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Dynamic (lock-and-key)** ACLs open temporary permits **after user authentication** on the router."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Standard ACLs are static source filters \u2014 no login-triggered openings.",
        "misconceptionTested": "Standard ACL for auth-triggered open"
      },
      {
        "choiceIndex": 2,
        "explanation": "Extended ACLs filter traffic but don't authenticate users to open ports.",
        "misconceptionTested": "Extended ACL for login open"
      },
      {
        "choiceIndex": 3,
        "explanation": "Named is a format \u2014 dynamic/reflexive behavior requires **lock-and-key**.",
        "misconceptionTested": "Named ACL as dynamic"
      }
    ],
    "examTip": "ACL placement: **standard \u2192 near destination** | **extended \u2192 near source** | wildcard = inverse of subnet mask."
  },
  'obj-5.6-source-q017':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**`access-list 20 deny 172.16.0.0 0.255.255.255`** \u2014 standard ACL (1\u201399) matching a **source network**."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**180** is extended range with **udp** \u2014 standard ACLs cannot match ports.",
        "misconceptionTested": "Extended ACL numbered as standard"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Double `permit`** is invalid syntax.",
        "misconceptionTested": "Duplicate permit keyword"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`deny any 172.16.0.0`** reverses source/destination \u2014 standard ACLs match **source** only.",
        "misconceptionTested": "Standard ACL with any as source"
      }
    ],
    "examTip": "ACL placement: **standard \u2192 near destination** | **extended \u2192 near source** | wildcard = inverse of subnet mask."
  },
  'obj-5.6-source-q018':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**`access-list 5 permit host 192.168.1.5`** is shorthand for **192.168.1.5 0.0.0.0**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Host line still needs **`permit`** keyword \u2014 **`permit 192.168.1.5`** alone is incomplete.",
        "misconceptionTested": "Host permit without permit keyword"
      },
      {
        "choiceIndex": 1,
        "explanation": "CIDR **`/24`** is invalid in numbered ACL syntax.",
        "misconceptionTested": "CIDR in standard ACL"
      },
      {
        "choiceIndex": 3,
        "explanation": "**192.168.1.0 0.0.0.255** matches the whole subnet, not one host.",
        "misconceptionTested": "Subnet instead of host keyword"
      }
    ],
    "examTip": "ACL placement: **standard \u2192 near destination** | **extended \u2192 near source** | wildcard = inverse of subnet mask."
  },
  'obj-5.6-source-q019':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Deny **tcp/80** to the HR server, then **`permit ip any any`** \u2014 extended ACLs need **`ip`** protocol for the permit-any."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`permit any any`** is incomplete \u2014 use **`permit ip any any`** in extended ACLs.",
        "misconceptionTested": "permit any any without ip keyword"
      },
      {
        "choiceIndex": 2,
        "explanation": "Missing **`tcp`** on deny \u2014 port 80 filter requires **tcp** keyword.",
        "misconceptionTested": "Missing tcp on deny line"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`eq 80`** on the permit line wrongly limits the catch-all permit to HTTP only.",
        "misconceptionTested": "Port filter on permit any"
      }
    ],
    "examTip": "ACL placement: **standard \u2192 near destination** | **extended \u2192 near source** | wildcard = inverse of subnet mask."
  },
  'obj-5.6-source-q020':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**Standard ACLs** match **source IP address only** \u2014 no destination, protocol, or port."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Extended ACLs match source, destination, protocol, and ports.",
        "misconceptionTested": "Extended as source-only"
      },
      {
        "choiceIndex": 1,
        "explanation": "Named is a configuration style \u2014 can be standard or extended.",
        "misconceptionTested": "Named as source-only type"
      },
      {
        "choiceIndex": 2,
        "explanation": "Dynamic ACLs add temporal permits \u2014 still not 'source only' in the standard sense.",
        "misconceptionTested": "Dynamic as source-only"
      }
    ],
    "examTip": "ACL placement: **standard \u2192 near destination** | **extended \u2192 near source** | wildcard = inverse of subnet mask."
  },
  'obj-5.6-source-q021':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**`access-list 199 deny tcp any host 192.168.1.5 eq 22`** \u2014 extended ACL, **TCP port 22 (SSH)**, traffic **to** the server."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`deny ip ... eq 22`** \u2014 **`eq`** requires **tcp/udp**, not **`ip`**.",
        "misconceptionTested": "ip protocol with port operator"
      },
      {
        "choiceIndex": 1,
        "explanation": "Standard ACL **90** cannot match **eq 22** \u2014 need extended **100\u2013199**.",
        "misconceptionTested": "Standard ACL with port"
      },
      {
        "choiceIndex": 2,
        "explanation": "**eq 23** is Telnet \u2014 SSH is **port 22**.",
        "misconceptionTested": "Telnet port for SSH block"
      }
    ],
    "examTip": "ACL placement: **standard \u2192 near destination** | **extended \u2192 near source** | wildcard = inverse of subnet mask."
  },
  'obj-5.6-source-q022':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Blocking by **protocol and port (TCP/80)** requires an **extended ACL**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Standard ACLs cannot match **TCP port 80**.",
        "misconceptionTested": "Standard ACL for L4 filter"
      },
      {
        "choiceIndex": 1,
        "explanation": "Dynamic ACLs authenticate users \u2014 not static app filtering.",
        "misconceptionTested": "Dynamic for static web block"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Expanded** is not an IOS ACL category.",
        "misconceptionTested": "Expanded ACL type"
      }
    ],
    "examTip": "ACL placement: **standard \u2192 near destination** | **extended \u2192 near source** | wildcard = inverse of subnet mask."
  },
  'obj-5.6-source-q023':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**`access-list 143 permit tcp host 192.168.8.3 eq 80 any`** \u2014 valid extended syntax (100\u2013199) with **tcp/www**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "ACL **99** is standard \u2014 cannot use **`eq 443`**.",
        "misconceptionTested": "Standard ACL with port"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`deny any host ... eq 22`** has **`any`** in wrong position for standard/extended grammar.",
        "misconceptionTested": "Malformed deny any host"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`permit any host ... eq 22`** misorders keywords \u2014 destination **`host`** should follow protocol.",
        "misconceptionTested": "Malformed permit any host"
      }
    ],
    "examTip": "ACL placement: **standard \u2192 near destination** | **extended \u2192 near source** | wildcard = inverse of subnet mask."
  },
  'obj-5.6-source-q025':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "Apply ACL **2 outbound on Gi0/2** (HR-facing) \u2014 filters traffic **leaving** toward HR after routing decision."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Inbound on Gi0/0** filters users entering the router \u2014 wrong placement for HR-bound traffic.",
        "misconceptionTested": "ACL inbound on user interface"
      },
      {
        "choiceIndex": 1,
        "explanation": "**Outbound on Gi0/0** sends filtered traffic back to users \u2014 doesn't block toward HR.",
        "misconceptionTested": "ACL outbound on user interface"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Inbound on Gi0/2** filters HR replies \u2014 stem blocks **host\u2192HR** on outbound HR interface.",
        "misconceptionTested": "ACL inbound on HR interface"
      }
    ],
    "examTip": "ACL placement: **standard \u2192 near destination** | **extended \u2192 near source** | wildcard = inverse of subnet mask."
  },
  'obj-5.6-source-q026':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**`show ip access-list`** displays **all** IP ACLs with **sequence numbers** \u2014 including the named list shown."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`show access-list`** may omit IP-specific detail on some platforms \u2014 **`show ip access-list`** is the IP-focused command.",
        "misconceptionTested": "Non-IP show access-list variant"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`show ip access-list named_list`** works for one list \u2014 the keyed answer shows **all** lists with line numbers.",
        "misconceptionTested": "Named-only show when all lists keyed"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`show running-config`** may not show sequence numbers inline.",
        "misconceptionTested": "Running-config for seq numbers"
      }
    ],
    "examTip": "ACL placement: **standard \u2192 near destination** | **extended \u2192 near source** | wildcard = inverse of subnet mask."
  },
  'obj-5.6-source-q027':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Place **extended ACLs close to the source** \u2014 filter unwanted traffic before it crosses the network."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Standard ACLs go **close to destination** \u2014 extended near **source**.",
        "misconceptionTested": "Standard ACL at source"
      },
      {
        "choiceIndex": 2,
        "explanation": "Dynamic ACLs are placed per auth design \u2014 not the general placement rule.",
        "misconceptionTested": "Dynamic ACL placement rule"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Expanded** is not an ACL placement category.",
        "misconceptionTested": "Expanded ACL placement"
      }
    ],
    "examTip": "ACL placement: **standard \u2192 near destination** | **extended \u2192 near source** | wildcard = inverse of subnet mask."
  },
  'obj-5.6-source-q028':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**`ip access-list extended named_list`** enters named extended ACL configuration mode."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`allow`** is not IOS \u2014 use **`permit`/`deny`**.",
        "misconceptionTested": "allow keyword in ACL"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`ip access-list named_list`** omits **standard|extended** type keyword.",
        "misconceptionTested": "Missing extended keyword"
      },
      {
        "choiceIndex": 3,
        "explanation": "Cannot combine **number 101** with a name on one line.",
        "misconceptionTested": "Number and name combined"
      }
    ],
    "examTip": "ACL placement: **standard \u2192 near destination** | **extended \u2192 near source** | wildcard = inverse of subnet mask."
  },
  'obj-5.6-source-q029':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Place **standard ACLs close to the destination** \u2014 they only match source, so filter near where impact matters."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Extended ACLs belong near **source** \u2014 standard near **destination**.",
        "misconceptionTested": "Extended ACL at destination"
      },
      {
        "choiceIndex": 2,
        "explanation": "Dynamic ACLs follow auth/session design.",
        "misconceptionTested": "Dynamic ACL placement default"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Expanded** is not a placement type.",
        "misconceptionTested": "Expanded ACL at destination"
      }
    ],
    "examTip": "ACL placement: **standard \u2192 near destination** | **extended \u2192 near source** | wildcard = inverse of subnet mask."
  },
  'obj-5.7-source-q011':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Port security limits **MAC addresses** allowed on a switch port \u2014 stops unauthorized devices from connecting."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "VLAN assignment is **`switchport access vlan`** \u2014 not port security.",
        "misconceptionTested": "VLAN control via port security"
      },
      {
        "choiceIndex": 1,
        "explanation": "Port security is **Layer 2 MAC** control \u2014 not IP address filtering.",
        "misconceptionTested": "IP filtering via port security"
      },
      {
        "choiceIndex": 3,
        "explanation": "Port security does not authenticate **users** \u2014 it restricts **hardware MACs**.",
        "misconceptionTested": "User auth via port security"
      }
    ],
    "examTip": "Port security: access mode \u2192 **`switchport port-security`** \u2192 max MACs \u2192 violation mode \u2192 **`show port-security interface`**."
  },
  'obj-5.7-source-q012':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Port security suits **static** environments where known devices stay on assigned access ports."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Mobile/roaming users change MACs often \u2014 sticky helps but static MAC lists are high-maintenance.",
        "misconceptionTested": "Port security ideal for mobile"
      },
      {
        "choiceIndex": 1,
        "explanation": "Memory impact is modest \u2014 not the defining trade-off.",
        "misconceptionTested": "High memory as main drawback"
      },
      {
        "choiceIndex": 3,
        "explanation": "Violation **shutdown** can auto-recover with **errdisable recovery** \u2014 not always manual.",
        "misconceptionTested": "Always requires manual reset"
      }
    ],
    "examTip": "Port security: access mode \u2192 **`switchport port-security`** \u2192 max MACs \u2192 violation mode \u2192 **`show port-security interface`**."
  },
  'obj-5.7-source-q013':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Allow **2 secure MACs** \u2014 one for the **IP phone**, one for the **PC** behind the phone."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Phone + PC = **two** distinct MAC addresses on the same access port.",
        "misconceptionTested": "Single MAC for phone+PC"
      },
      {
        "choiceIndex": 2,
        "explanation": "Zero MACs would block all traffic \u2014 port security needs at least one.",
        "misconceptionTested": "Zero MAC allowance"
      },
      {
        "choiceIndex": 3,
        "explanation": "Ten is excessive \u2014 typical voice+data needs **2**.",
        "misconceptionTested": "Default max of 10"
      }
    ],
    "examTip": "Port security: access mode \u2192 **`switchport port-security`** \u2192 max MACs \u2192 violation mode \u2192 **`show port-security interface`**."
  },
  'obj-5.7-source-q015':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**`switchport mode access`** + **`switchport nonnegotiate`** + **`switchport port-security`** \u2014 dynamic trunk must become fixed **access**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`no switchport dynamic`** is not valid \u2014 use **`switchport mode access`**.",
        "misconceptionTested": "no switchport dynamic command"
      },
      {
        "choiceIndex": 1,
        "explanation": "Access mode alone may still negotiate DTP \u2014 add **`nonnegotiate`** on trunk-capable ports.",
        "misconceptionTested": "Access mode without nonnegotiate"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`no dynamic`** is invalid syntax \u2014 mode access + nonnegotiate fixes dynamic port error.",
        "misconceptionTested": "Invented no dynamic syntax"
      }
    ],
    "examTip": "Port security: access mode \u2192 **`switchport port-security`** \u2192 max MACs \u2192 violation mode \u2192 **`show port-security interface`**."
  },
  'obj-5.7-source-q016':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**`switchport port-security maximum 2`** sets the max secure MAC count to **2**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`switchport maximum`** omits **port-security** keyword.",
        "misconceptionTested": "switchport maximum without port-security"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`port-security maximum`** missing **`switchport`** prefix.",
        "misconceptionTested": "port-security without switchport"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`limit`** is not valid \u2014 IOS uses **`maximum`**.",
        "misconceptionTested": "limit instead of maximum"
      }
    ],
    "examTip": "Port security: access mode \u2192 **`switchport port-security`** \u2192 max MACs \u2192 violation mode \u2192 **`show port-security interface`**."
  },
  'obj-5.7-source-q018':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**`show port-security interface gi 2/13`** displays violation mode, max MACs, and status for that port."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Running-config shows config \u2014 not live **violation count/status**.",
        "misconceptionTested": "Running-config for violation status"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`details`** is not standard IOS syntax on all platforms.",
        "misconceptionTested": "Invented details keyword"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`show port-security gi`** omits **`interface`** keyword.",
        "misconceptionTested": "Missing interface keyword"
      }
    ],
    "examTip": "Port security: access mode \u2192 **`switchport port-security`** \u2192 max MACs \u2192 violation mode \u2192 **`show port-security interface`**."
  },
  'obj-5.7-source-q019':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**`violation shutdown`** err-disables the port \u2014 generates **SNMP linkDown/syslog** alerts when the port goes down."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**`restrict`** without proper syntax is invalid \u2014 use **`violation restrict`** for SNMP trap without shutdown.",
        "misconceptionTested": "restrict keyword alone"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`protect`** drops silently \u2014 no notification.",
        "misconceptionTested": "protect mode for notification"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`violation restrict`** logs but keeps port up \u2014 stem keyed on **shutdown** for trap via link state.",
        "misconceptionTested": "restrict vs shutdown trap semantics"
      }
    ],
    "examTip": "Port security: access mode \u2192 **`switchport port-security`** \u2192 max MACs \u2192 violation mode \u2192 **`show port-security interface`**."
  },
  'obj-5.7-source-q020':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**`violation protect`** drops unauthorized frames **without shutting down** the port and **without logging**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Shutdown** disables the port \u2014 opposite of 'without disabling'.",
        "misconceptionTested": "shutdown when port must stay up"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`restrict`** logs violations \u2014 stem wants **no logging**.",
        "misconceptionTested": "restrict when no logging wanted"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`violation restrict`** still logs \u2014 **protect** silently drops.",
        "misconceptionTested": "restrict logs violations"
      }
    ],
    "examTip": "Port security: access mode \u2192 **`switchport port-security`** \u2192 max MACs \u2192 violation mode \u2192 **`show port-security interface`**."
  },
  'obj-5.7-source-q021':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**`show port-security`** displays violation counts and secure port summary \u2014 includes logged violations."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`show violations`** is not valid IOS.",
        "misconceptionTested": "Invented show violations"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`show port-security violations`** is not standard syntax.",
        "misconceptionTested": "Invented violations subcommand"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`show psec`** is abbreviated incorrectly.",
        "misconceptionTested": "Abbreviated psec command"
      }
    ],
    "examTip": "Port security: access mode \u2192 **`switchport port-security`** \u2192 max MACs \u2192 violation mode \u2192 **`show port-security interface`**."
  },
  'obj-5.7-source-q022':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**Sticky** learning saves MACs to running-config \u2014 least admin after PCs are already installed."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Static requires manually typing each MAC \u2014 more admin.",
        "misconceptionTested": "Static for least admin"
      },
      {
        "choiceIndex": 1,
        "explanation": "Dynamic without sticky loses MACs on reload.",
        "misconceptionTested": "Dynamic without sticky persistence"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Time limit** is not a port-security mode.",
        "misconceptionTested": "Time limit port security"
      }
    ],
    "examTip": "Port security: access mode \u2192 **`switchport port-security`** \u2192 max MACs \u2192 violation mode \u2192 **`show port-security interface`**."
  },
  'obj-5.7-source-q023':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Secure-shutdown** with **violation count 1** means a **port-security violation** triggered err-disable \u2014 not admin shutdown."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Admin shutdown shows differently \u2014 **Secure-shutdown** indicates **violation**.",
        "misconceptionTested": "Admin shutdown vs violation"
      },
      {
        "choiceIndex": 2,
        "explanation": "Bad wiring causes physical issues \u2014 not **Secure-shutdown** state.",
        "misconceptionTested": "Wiring fault for secure-shutdown"
      },
      {
        "choiceIndex": 3,
        "explanation": "Trunk misconfig doesn't show **Violation Mode: Shutdown** with violation count.",
        "misconceptionTested": "Trunk mode for violation shutdown"
      }
    ],
    "examTip": "Port security: access mode \u2192 **`switchport port-security`** \u2192 max MACs \u2192 violation mode \u2192 **`show port-security interface`**."
  },
  'obj-5.7-source-q024':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**`switchport port-security mac-address sticky`** learns the first MAC(s) and **saves them** to config."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**`dynamic`** is not a valid mac-address keyword \u2014 use **sticky** or **static**.",
        "misconceptionTested": "dynamic mac-address keyword"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`static`** requires manual MAC entry \u2014 sticky **learns** the first.",
        "misconceptionTested": "static for auto-learn first MAC"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`learn`** is not valid IOS syntax.",
        "misconceptionTested": "learn keyword"
      }
    ],
    "examTip": "Port security: access mode \u2192 **`switchport port-security`** \u2192 max MACs \u2192 violation mode \u2192 **`show port-security interface`**."
  },
  'obj-5.7-source-q025':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "After fixing the violation, **`shutdown`** then **`no shutdown`** clears **err-disabled** state on the interface."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Removing port-security disables the feature \u2014 doesn't recover err-disable.",
        "misconceptionTested": "no port-security for err-disable"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`no shutdown`** alone may not clear err-disable from violation.",
        "misconceptionTested": "no shutdown alone for violation"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`no switchport port-security`** removes security \u2014 doesn't bounce err-disable.",
        "misconceptionTested": "Remove port-security instead of bounce"
      }
    ],
    "examTip": "Port security: access mode \u2192 **`switchport port-security`** \u2192 max MACs \u2192 violation mode \u2192 **`show port-security interface`**."
  },
  'obj-5.7-source-q026':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**`switchport port-security mac-address 0334.56f3.e4e4`** manually allows one specific MAC."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Sticky** learns dynamically \u2014 stem asks for **specific** MAC you configure.",
        "misconceptionTested": "Sticky for manual MAC"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`static`** keyword before MAC is wrong order \u2014 MAC follows **`mac-address`**.",
        "misconceptionTested": "static keyword before MAC"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`port-security static`** omits **mac-address** keyword.",
        "misconceptionTested": "Wrong command structure"
      }
    ],
    "examTip": "Port security: access mode \u2192 **`switchport port-security`** \u2192 max MACs \u2192 violation mode \u2192 **`show port-security interface`**."
  },
  'obj-5.7-source-q027':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**`show port-security`** produces the secure-port summary table with max/current MACs and violation counts."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`show port-security details`** is not standard table output.",
        "misconceptionTested": "details subcommand for summary table"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`show mac address-table secure`** shows CAM entries \u2014 not violation summary.",
        "misconceptionTested": "MAC table for port-security summary"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`show port-security address`** is not valid IOS.",
        "misconceptionTested": "Invented address subcommand"
      }
    ],
    "examTip": "Port security: access mode \u2192 **`switchport port-security`** \u2192 max MACs \u2192 violation mode \u2192 **`show port-security interface`**."
  },
  'obj-5.7-source-q028':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**`errdisable recovery cause psecure-violation`** (global) auto-recovers ports after sticky/shutdown violations."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**`clear err-disable`** is not a global clear command.",
        "misconceptionTested": "clear err-disable command"
      },
      {
        "choiceIndex": 1,
        "explanation": "**`clear switchport port-security`** doesn't exist.",
        "misconceptionTested": "clear switchport port-security"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`clear port-security violation`** is invalid \u2014 use **errdisable recovery**.",
        "misconceptionTested": "clear port-security violation"
      }
    ],
    "examTip": "Port security: access mode \u2192 **`switchport port-security`** \u2192 max MACs \u2192 violation mode \u2192 **`show port-security interface`**."
  },
  'obj-5.7-source-q029':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**`show running-config`** displays **sticky MAC addresses** written into the interface configuration."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "**`show port-security`** shows counts \u2014 not the sticky MAC entries in config.",
        "misconceptionTested": "Summary show for sticky MACs"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`show port-security details`** is non-standard.",
        "misconceptionTested": "details for sticky entries"
      },
      {
        "choiceIndex": 3,
        "explanation": "**`show port-security status`** is not valid IOS.",
        "misconceptionTested": "Invented status subcommand"
      }
    ],
    "examTip": "Port security: access mode \u2192 **`switchport port-security`** \u2192 max MACs \u2192 violation mode \u2192 **`show port-security interface`**."
  },
  'obj-5.8-source-q001':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**802.1X** provides **port-based network access control** \u2014 authenticate before granting network access."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**802.1Q** is VLAN tagging \u2014 not authentication.",
        "misconceptionTested": "802.1Q as NAC"
      },
      {
        "choiceIndex": 1,
        "explanation": "ACLs filter traffic \u2014 they don't authenticate users at connect time.",
        "misconceptionTested": "ACL as port authentication"
      },
      {
        "choiceIndex": 3,
        "explanation": "Firewall is a separate security boundary \u2014 802.1X is switch/port NAC.",
        "misconceptionTested": "Firewall as 802.1X"
      }
    ],
    "examTip": "802.1X roles: **supplicant** (client) \u2192 **authenticator** (switch) \u2192 **AAA/RADIUS** (server) | EAP carries auth."
  },
  'obj-5.8-source-q002':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "The **supplicant** is the end device (PC/phone) that **presents credentials**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Authenticator** is the switch controlling port access.",
        "misconceptionTested": "Authenticator as credential sender"
      },
      {
        "choiceIndex": 2,
        "explanation": "**AAA/RADIUS** validates credentials \u2014 supplicant **sends** them.",
        "misconceptionTested": "AAA server as supplicant"
      },
      {
        "choiceIndex": 3,
        "explanation": "RADIUS is the auth protocol/server role \u2014 not the credential sender.",
        "misconceptionTested": "RADIUS as supplicant"
      }
    ],
    "examTip": "802.1X roles: **supplicant** (client) \u2192 **authenticator** (switch) \u2192 **AAA/RADIUS** (server) | EAP carries auth."
  },
  'obj-5.8-source-q003':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "The **authenticator** is the **switch** (or WLC) that controls port access until auth succeeds."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Supplicant is the client device \u2014 switch is **authenticator**.",
        "misconceptionTested": "Supplicant as switch role"
      },
      {
        "choiceIndex": 2,
        "explanation": "AAA server validates \u2014 doesn't control the L2 port directly.",
        "misconceptionTested": "AAA as authenticator"
      },
      {
        "choiceIndex": 3,
        "explanation": "RADIUS is a protocol \u2014 authenticator is the **network device**.",
        "misconceptionTested": "RADIUS server as authenticator"
      }
    ],
    "examTip": "802.1X roles: **supplicant** (client) \u2192 **authenticator** (switch) \u2192 **AAA/RADIUS** (server) | EAP carries auth."
  },
  'obj-5.8-source-q004':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Supplicant \u2194 authenticator use **EAP over LAN (802.1X/EAPoL)** \u2014 not raw TCP/UDP."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "EAP frames are encapsulated at L2 \u2014 not standalone UDP/TCP.",
        "misconceptionTested": "UDP between supplicant and switch"
      },
      {
        "choiceIndex": 2,
        "explanation": "802.1X doesn't use TCP between supplicant and switch.",
        "misconceptionTested": "TCP for 802.1X"
      },
      {
        "choiceIndex": 3,
        "explanation": "IP is L3 \u2014 802.1X auth happens at **Layer 2** before IP.",
        "misconceptionTested": "IP protocol for 802.1X"
      }
    ],
    "examTip": "802.1X roles: **supplicant** (client) \u2192 **authenticator** (switch) \u2192 **AAA/RADIUS** (server) | EAP carries auth."
  },
  'obj-5.8-source-q005':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**EAP** carries authentication between supplicant\u2194authenticator and authenticator\u2194AAA server."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "802.1X headers are not a separate protocol \u2014 **EAP** is the payload.",
        "misconceptionTested": "802.1X headers as protocol name"
      },
      {
        "choiceIndex": 1,
        "explanation": "IPsec encrypts tunnels \u2014 not 802.1X port auth.",
        "misconceptionTested": "IPsec for 802.1X"
      },
      {
        "choiceIndex": 3,
        "explanation": "RADIUS **encapsulates EAP** to the server \u2014 EAP is the common method.",
        "misconceptionTested": "RADIUS replaces EAP entirely"
      }
    ],
    "examTip": "802.1X roles: **supplicant** (client) \u2192 **authenticator** (switch) \u2192 **AAA/RADIUS** (server) | EAP carries auth."
  },
  'obj-5.8-source-q006':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "The **supplicant** is the **device requesting network access** (workstation, phone, etc.)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Auth **server** validates \u2014 doesn't request access.",
        "misconceptionTested": "Auth server as supplicant"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Authenticator** controls the port \u2014 client is supplicant.",
        "misconceptionTested": "Authenticator as requesting device"
      },
      {
        "choiceIndex": 3,
        "explanation": "L3 gateway device is not the 802.1X supplicant role.",
        "misconceptionTested": "L3 device as supplicant"
      }
    ],
    "examTip": "802.1X roles: **supplicant** (client) \u2192 **authenticator** (switch) \u2192 **AAA/RADIUS** (server) | EAP carries auth."
  },
  'obj-5.8-source-q007':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "A **AAA server** (RADIUS/TACACS+) **centralizes authentication** for network devices and users."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Active Directory may back identities \u2014 but **AAA server** is the network auth service.",
        "misconceptionTested": "AD as AAA for all devices"
      },
      {
        "choiceIndex": 2,
        "explanation": "802.1X is a **protocol/framework** \u2014 not a server product.",
        "misconceptionTested": "802.1X as server type"
      },
      {
        "choiceIndex": 3,
        "explanation": "Terminal server provides console access \u2014 not centralized AAA.",
        "misconceptionTested": "Terminal server for AAA"
      }
    ],
    "examTip": "802.1X roles: **supplicant** (client) \u2192 **authenticator** (switch) \u2192 **AAA/RADIUS** (server) | EAP carries auth."
  },
  'obj-5.8-source-q008':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "RADIUS authentication uses **UDP port 1645** (legacy) / **1812** (IANA) \u2014 exam often cites **UDP/1645**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**1845** is not the RADIUS auth port.",
        "misconceptionTested": "Wrong UDP port 1845"
      },
      {
        "choiceIndex": 2,
        "explanation": "RADIUS uses **UDP**, not TCP, for authentication.",
        "misconceptionTested": "TCP for RADIUS auth"
      },
      {
        "choiceIndex": 3,
        "explanation": "**1911** is unrelated to RADIUS.",
        "misconceptionTested": "Wrong port 1911"
      }
    ],
    "examTip": "802.1X roles: **supplicant** (client) \u2192 **authenticator** (switch) \u2192 **AAA/RADIUS** (server) | EAP carries auth."
  },
  'obj-5.8-source-q009':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**TACACS+** secures **device administration** (Telnet/SSH/console) via AAA."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "802.1X is port-based NAC \u2014 not Telnet AAA protocol.",
        "misconceptionTested": "802.1X for Telnet AAA"
      },
      {
        "choiceIndex": 2,
        "explanation": "AD integrates with AAA \u2014 TACACS+ is the **Cisco admin auth** protocol.",
        "misconceptionTested": "AD as Telnet auth protocol"
      },
      {
        "choiceIndex": 3,
        "explanation": "EAP is used inside 802.1X \u2014 not directly for Telnet login.",
        "misconceptionTested": "EAP for Telnet"
      }
    ],
    "examTip": "802.1X roles: **supplicant** (client) \u2192 **authenticator** (switch) \u2192 **AAA/RADIUS** (server) | EAP carries auth."
  },
  'obj-5.8-source-q010':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**`aaa authentication login default group tacacs+ local`** \u2014 TACACS+ first, **local** database fallback."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Missing **`aaa authentication login default`** structure.",
        "misconceptionTested": "Missing aaa authentication structure"
      },
      {
        "choiceIndex": 2,
        "explanation": "**`aaa-authentication`** is invalid \u2014 hyphen breaks the command.",
        "misconceptionTested": "Hyphenated aaa-authentication"
      },
      {
        "choiceIndex": 3,
        "explanation": "Must include **`default`** keyword and **`group tacacs+`**.",
        "misconceptionTested": "Missing default keyword"
      }
    ],
    "examTip": "802.1X roles: **supplicant** (client) \u2192 **authenticator** (switch) \u2192 **AAA/RADIUS** (server) | EAP carries auth."
  },
  'obj-5.8-source-q011':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "With **`aaa authentication login default local`** but **no local user**, login **fails** \u2014 you're locked out of VTY."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Enable secret doesn't replace **login authentication** on VTY lines.",
        "misconceptionTested": "Enable secret as VTY login"
      },
      {
        "choiceIndex": 1,
        "explanation": "Console may still work \u2014 but configured **login default local** blocks without username.",
        "misconceptionTested": "Console unaffected so no lockout"
      },
      {
        "choiceIndex": 3,
        "explanation": "Without a local user, authentication **fails** \u2014 not 'nothing happens'.",
        "misconceptionTested": "No effect without username"
      }
    ],
    "examTip": "802.1X roles: **supplicant** (client) \u2192 **authenticator** (switch) \u2192 **AAA/RADIUS** (server) | EAP carries auth."
  },
  'obj-5.8-source-q012':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Discovering an incident **while reviewing logs** is **passive** detection \u2014 no active probe."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Active detection uses tools that **probe/generate** traffic or alerts in real time.",
        "misconceptionTested": "Active detection via log review"
      },
      {
        "choiceIndex": 2,
        "explanation": "Proactive implies prevention before incident \u2014 this is **after-the-fact** log review.",
        "misconceptionTested": "Proactive for log discovery"
      },
      {
        "choiceIndex": 3,
        "explanation": "Auditing is periodic review \u2014 **passive monitoring** of existing logs fits better.",
        "misconceptionTested": "Auditing vs passive confusion"
      }
    ],
    "examTip": "802.1X roles: **supplicant** (client) \u2192 **authenticator** (switch) \u2192 **AAA/RADIUS** (server) | EAP carries auth."
  },
  'obj-5.8-source-q013':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "RADIUS is an **authentication** (AAA) server \u2014 validates user/device credentials."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "DNS resolves names \u2014 not user authentication.",
        "misconceptionTested": "RADIUS as DNS"
      },
      {
        "choiceIndex": 1,
        "explanation": "Email server delivers mail.",
        "misconceptionTested": "RADIUS as email"
      },
      {
        "choiceIndex": 2,
        "explanation": "Proxy forwards traffic \u2014 RADIUS **authenticates**.",
        "misconceptionTested": "RADIUS as proxy"
      }
    ],
    "examTip": "802.1X roles: **supplicant** (client) \u2192 **authenticator** (switch) \u2192 **AAA/RADIUS** (server) | EAP carries auth."
  },
  'obj-6.2-source-q002':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Controller-based networking **centralizes the control plane** \u2014 devices execute policies from the controller."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Controllers can be **virtual or physical** \u2014 not always hardware appliances.",
        "misconceptionTested": "Hardware-only controllers"
      },
      {
        "choiceIndex": 2,
        "explanation": "Data plane stays **distributed** on switches \u2014 not centralized at controller.",
        "misconceptionTested": "Centralized data plane"
      },
      {
        "choiceIndex": 3,
        "explanation": "ASICs switch locally \u2014 control plane logic is centralized.",
        "misconceptionTested": "ASIC central switching"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.2-source-q004':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**Maturity** \u2014 SDN/controller platforms are newer with evolving features compared to decades of traditional CLI ops."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "SDN often improves **scalability** via automation \u2014 not a disadvantage.",
        "misconceptionTested": "Scalability as SDN disadvantage"
      },
      {
        "choiceIndex": 1,
        "explanation": "Centralized policy can **improve security** consistency.",
        "misconceptionTested": "Security as disadvantage"
      },
      {
        "choiceIndex": 3,
        "explanation": "Centralized provisioning is a **benefit**, not a disadvantage.",
        "misconceptionTested": "Centralized provisioning as disadvantage"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.2-source-q005':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "SDN controllers program **QoS policies** on switches \u2014 marking/queuing rules are control-plane policy pushed to devices."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "CPU utilization is monitoring \u2014 not a typical SDN policy object.",
        "misconceptionTested": "CPU as SDN QoS control"
      },
      {
        "choiceIndex": 1,
        "explanation": "Memory utilization is device health \u2014 not QoS policy.",
        "misconceptionTested": "Memory as SDN policy"
      },
      {
        "choiceIndex": 3,
        "explanation": "Forwarding tables are programmed \u2014 but **QoS** is the keyed control element in this stem.",
        "misconceptionTested": "Forwarding only not QoS"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.2-source-q006':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "SDN switches are **stateless for control/config** \u2014 forwarding rules come from the controller."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Data isn't switched at the controller \u2014 **local ASICs** forward.",
        "misconceptionTested": "Central controller switching all data"
      },
      {
        "choiceIndex": 2,
        "explanation": "Switches retain **some state** for forwarding \u2014 config brain is centralized.",
        "misconceptionTested": "Stateful config on every switch"
      },
      {
        "choiceIndex": 3,
        "explanation": "Flows have state \u2014 'stateless' refers to **control dependency**.",
        "misconceptionTested": "All traffic stateless"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.2-source-q007':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**SNMP** is the classic protocol for **centralized monitoring** of routers and switches."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Syslog collects messages \u2014 SNMP **polls metrics/MIBs**.",
        "misconceptionTested": "Syslog as SNMP replacement"
      },
      {
        "choiceIndex": 2,
        "explanation": "SDN is architecture \u2014 SNMP is the monitoring protocol.",
        "misconceptionTested": "SDN as monitoring protocol"
      },
      {
        "choiceIndex": 3,
        "explanation": "CDP is Layer 2 discovery \u2014 not centralized NMS monitoring.",
        "misconceptionTested": "CDP for NMS polling"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.2-source-q008':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "The **NMS (Network Management System)** aggregates SNMP polls, traps, and metrics."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Traps are **events** \u2014 NMS collects them.",
        "misconceptionTested": "Trap as aggregator"
      },
      {
        "choiceIndex": 1,
        "explanation": "SNMP **agent** runs on the device \u2014 NMS is central.",
        "misconceptionTested": "Agent as NMS"
      },
      {
        "choiceIndex": 2,
        "explanation": "Syslog server handles logs \u2014 NMS handles **SNMP**.",
        "misconceptionTested": "Syslog server as SNMP aggregator"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.2-source-q009':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**Cisco Prime Infrastructure** uses **SNMP** (and other methods) for device configuration/monitoring."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "CAPWAP is AP\u2194WLC \u2014 not Prime's core transport.",
        "misconceptionTested": "CAPWAP for Prime config"
      },
      {
        "choiceIndex": 2,
        "explanation": "LWAPP is legacy CAPWAP predecessor for wireless.",
        "misconceptionTested": "LWAPP for Prime"
      },
      {
        "choiceIndex": 3,
        "explanation": "RESTCONF is modern API \u2014 Prime traditionally leveraged **SNMP**.",
        "misconceptionTested": "RESTCONF as Prime primary"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.3-source-q009':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**STP** runs on the **control plane** \u2014 computes loop-free topology."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Data plane forwards frames \u2014 STP **doesn't forward user traffic**.",
        "misconceptionTested": "STP on data plane"
      },
      {
        "choiceIndex": 2,
        "explanation": "Management plane is SNMP/syslog \u2014 STP is **control**.",
        "misconceptionTested": "STP on management plane"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Switch plane** is not a standard model term.",
        "misconceptionTested": "Invented switch plane"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.3-source-q010':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**Syslog** delivers operational messages \u2014 **management plane** (OOB monitoring/alerting)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Data plane carries user packets \u2014 syslog is **control/management** traffic.",
        "misconceptionTested": "Syslog as data plane"
      },
      {
        "choiceIndex": 1,
        "explanation": "Control plane is routing protocols \u2014 syslog is **management**.",
        "misconceptionTested": "Syslog as control plane"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Switch plane** is not standard terminology.",
        "misconceptionTested": "Invented switch plane"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.3-source-q011':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**Routing/forwarding** of packets through a router is **data plane** (FIB/CEF forwarding)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Control plane builds routes \u2014 **forwarding** is data plane.",
        "misconceptionTested": "Control plane forwards packets"
      },
      {
        "choiceIndex": 2,
        "explanation": "Management plane is SNMP/syslog.",
        "misconceptionTested": "Management plane forwarding"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Routing plane** is not the standard three-plane model.",
        "misconceptionTested": "Routing plane term"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.3-source-q012':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Routing protocols (OSPF, EIGRP, BGP)** operate on the **control plane**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Data plane forwards \u2014 protocols **compute routes** in control plane.",
        "misconceptionTested": "Routing protocols on data plane"
      },
      {
        "choiceIndex": 2,
        "explanation": "Management plane is monitoring \u2014 not OSPF.",
        "misconceptionTested": "OSPF on management plane"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Routing plane** is non-standard \u2014 use **control plane**.",
        "misconceptionTested": "Routing plane terminology"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.3-source-q013':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**CDP** is a **management/discovery** protocol \u2014 neighbor visibility for operators."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "CDP doesn't forward user data \u2014 not **data plane**.",
        "misconceptionTested": "CDP as data plane"
      },
      {
        "choiceIndex": 1,
        "explanation": "CDP doesn't compute routes \u2014 not **control plane**.",
        "misconceptionTested": "CDP as control plane"
      },
      {
        "choiceIndex": 2,
        "explanation": "**Network plane** is not standard \u2014 CDP is **management**.",
        "misconceptionTested": "Network plane for CDP"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.3-source-q015':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "An **API** is a **defined interface** letting one program communicate with another."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "APIs are interfaces \u2014 not standalone transfer programs.",
        "misconceptionTested": "API as transfer program"
      },
      {
        "choiceIndex": 1,
        "explanation": "APIs aren't programming languages \u2014 they **expose capabilities**.",
        "misconceptionTested": "API as programming language"
      },
      {
        "choiceIndex": 3,
        "explanation": "APIs don't virtualize programs \u2014 they **standardize communication**.",
        "misconceptionTested": "API as virtualization"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.3-source-q016':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Applications talk to the SDN controller via the **northbound interface (NBI)** \u2014 REST/HTTP APIs."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "**Southbound** is controller\u2192devices (OpenFlow, NETCONF).",
        "misconceptionTested": "SBI for application traffic"
      },
      {
        "choiceIndex": 1,
        "explanation": "Controller core is internal \u2014 apps use **NBI**.",
        "misconceptionTested": "Controller core as app API"
      },
      {
        "choiceIndex": 3,
        "explanation": "SNMP is legacy monitoring \u2014 app automation uses **NBI APIs**.",
        "misconceptionTested": "SNMP as SDN app API"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.3-source-q017':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Moving packets to destinations is **data plane** forwarding."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Control plane **decides** routes \u2014 data plane **forwards**.",
        "misconceptionTested": "Control plane packet forwarding"
      },
      {
        "choiceIndex": 2,
        "explanation": "Management plane monitors \u2014 doesn't route packets.",
        "misconceptionTested": "Management plane routing"
      },
      {
        "choiceIndex": 3,
        "explanation": "**Routing plane** is non-standard.",
        "misconceptionTested": "Routing plane term"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.3-source-q018':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Leaf-spine **fabric** paths are typically **\u22643 hops** (host\u2192leaf\u2192spine\u2192leaf\u2192host)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "One hop can't reach remote leaves through spine.",
        "misconceptionTested": "Single hop fabric"
      },
      {
        "choiceIndex": 2,
        "explanation": "Four hops exceed typical **Clos** fabric design.",
        "misconceptionTested": "Four hops as fabric max"
      },
      {
        "choiceIndex": 3,
        "explanation": "Five hops exceed typical **Clos** fabric design.",
        "misconceptionTested": "Five hops as fabric max"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.3-source-q019':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**MTU** is configured on the **underlay** physical/tunnel transport \u2014 not overlay logical networks."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Overlay carries tenant semantics \u2014 **underlay** sets **MTU**.",
        "misconceptionTested": "Overlay MTU setting"
      },
      {
        "choiceIndex": 1,
        "explanation": "Tunnel endpoints sit in underlay \u2014 MTU is underlay concern.",
        "misconceptionTested": "Tunnel as MTU layer only"
      },
      {
        "choiceIndex": 2,
        "explanation": "Leaf switching doesn't define WAN MTU \u2014 **underlay** does.",
        "misconceptionTested": "Leaf as MTU config point"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.3-source-q021':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**DMVPN** builds a **dynamic VPN overlay** over IP transport connecting remote sites."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "VXLAN is DC L2 overlay \u2014 DMVPN is **WAN hub-spoke/mesh overlay**.",
        "misconceptionTested": "VXLAN for WAN offices"
      },
      {
        "choiceIndex": 2,
        "explanation": "VLAN is L2 segmentation \u2014 not WAN overlay VPN.",
        "misconceptionTested": "VLAN as WAN overlay"
      },
      {
        "choiceIndex": 3,
        "explanation": "ECMP is load-sharing \u2014 not overlay VPN technology.",
        "misconceptionTested": "ECMP as overlay VPN"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.3-source-q022':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**VXLAN** tunnels **Layer 2** frames over a **Layer 3** underlay (VNI overlay)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "ECMP is forwarding \u2014 not L2-over-L3 tunneling.",
        "misconceptionTested": "ECMP for L2 tunnel"
      },
      {
        "choiceIndex": 1,
        "explanation": "DMVPN is primarily L3 VPN \u2014 VXLAN is **L2 extension**.",
        "misconceptionTested": "DMVPN as L2 overlay"
      },
      {
        "choiceIndex": 3,
        "explanation": "EIGRP is routing \u2014 not L2 tunnel encapsulation.",
        "misconceptionTested": "EIGRP as L2 tunnel"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.3-source-q023':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**SNMP** operates on the **management plane** for monitoring and configuration."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "CDP is discovery \u2014 SNMP is the classic **management** poll/trap protocol.",
        "misconceptionTested": "CDP as management monitoring"
      },
      {
        "choiceIndex": 2,
        "explanation": "ICMP is diagnostic \u2014 not primary management plane ops.",
        "misconceptionTested": "ICMP as management plane"
      },
      {
        "choiceIndex": 3,
        "explanation": "VTP is L2 control \u2014 not management plane monitoring.",
        "misconceptionTested": "VTP as management"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.3-source-q024':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**ECMP** provides multiple equal-cost next hops \u2014 common in **leaf-spine** SDN fabrics."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "OSPF is a routing protocol \u2014 ECMP is the **forwarding** mechanism.",
        "misconceptionTested": "OSPF as next-hop forwarding"
      },
      {
        "choiceIndex": 2,
        "explanation": "MPLS is transport \u2014 leaf-spine uses **IP ECMP**.",
        "misconceptionTested": "MPLS as SDN fabric forwarding"
      },
      {
        "choiceIndex": 3,
        "explanation": "CLOS is topology name \u2014 **ECMP** is the forwarding feature.",
        "misconceptionTested": "CLOS as protocol"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.4-source-q004':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Plug and Play (PnP)** templates push **day-zero config** \u2014 DNS, NTP, AAA via profiles."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "IP-based access control is policy \u2014 not templated baseline config.",
        "misconceptionTested": "IP-based AC for DNS/NTP templates"
      },
      {
        "choiceIndex": 2,
        "explanation": "Group-based access is policy segmentation.",
        "misconceptionTested": "Group-based AC for baseline"
      },
      {
        "choiceIndex": 3,
        "explanation": "Assurance monitors health \u2014 PnP **provisions** devices.",
        "misconceptionTested": "Assurance for templating"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.4-source-q005':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**Provision** section includes **topology/site connectivity** views for how devices interconnect."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Assurance shows health/telemetry \u2014 topology discovery is **Provision/Design**.",
        "misconceptionTested": "Assurance for topology map"
      },
      {
        "choiceIndex": 2,
        "explanation": "Platform hosts APIs \u2014 not physical topology maps.",
        "misconceptionTested": "Platform for site map"
      },
      {
        "choiceIndex": 3,
        "explanation": "Policy defines access \u2014 not L2/L3 site maps.",
        "misconceptionTested": "Policy for connectivity map"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.4-source-q007':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**Provision** manages **device inventory** \u2014 routers, switches, APs, WLCs onboarding."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Policy defines access contracts \u2014 inventory is **Provision**.",
        "misconceptionTested": "Policy for inventory"
      },
      {
        "choiceIndex": 2,
        "explanation": "Design is hierarchical planning \u2014 live inventory is **Provision**.",
        "misconceptionTested": "Design for live inventory"
      },
      {
        "choiceIndex": 3,
        "explanation": "Assurance monitors \u2014 doesn't own inventory onboarding.",
        "misconceptionTested": "Assurance for device inventory"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.4-source-q008':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**Platform** section documents **APIs** for automation (including Python scripts to DNA Center)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Design is site/network hierarchy \u2014 not API docs.",
        "misconceptionTested": "Design for API docs"
      },
      {
        "choiceIndex": 1,
        "explanation": "Policy is SGT/access \u2014 not developer APIs.",
        "misconceptionTested": "Policy for REST APIs"
      },
      {
        "choiceIndex": 2,
        "explanation": "Provision onboards devices \u2014 **Platform** exposes **API catalog**.",
        "misconceptionTested": "Provision for API reference"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.4-source-q009':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**SD-Access** automates **underlay + overlay fabric** (LISP/VXLAN control)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Easy-QoS is QoS policy \u2014 not fabric automation.",
        "misconceptionTested": "Easy-QoS for fabric"
      },
      {
        "choiceIndex": 2,
        "explanation": "System 360 is analytics \u2014 not fabric build.",
        "misconceptionTested": "System 360 for fabric"
      },
      {
        "choiceIndex": 3,
        "explanation": "ISE is policy/identity \u2014 SD-Access builds the **fabric**.",
        "misconceptionTested": "ISE as fabric automation"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.4-source-q010':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**Prime Infrastructure** offers **configuration backup/archive** beyond DNA Center's focus areas."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "DNA Center Assurance also has maps \u2014 heat maps aren't Prime-exclusive in all releases.",
        "misconceptionTested": "Heat maps Prime-only"
      },
      {
        "choiceIndex": 1,
        "explanation": "Triangulation is wireless analytics \u2014 not the keyed differentiator.",
        "misconceptionTested": "Triangulation Prime-only"
      },
      {
        "choiceIndex": 3,
        "explanation": "Application health is DNA Assurance \u2014 **config backup** is Prime strength.",
        "misconceptionTested": "Application health Prime-only"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.4-source-q011':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "DNA Center discovery requires **SSH** and **SNMP** \u2014 both for CLI and MIB polling."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "SSH alone misses SNMP metrics/inventory details.",
        "misconceptionTested": "SSH only for discovery"
      },
      {
        "choiceIndex": 1,
        "explanation": "SNMP alone misses CLI reachability for many tasks.",
        "misconceptionTested": "SNMP only for discovery"
      },
      {
        "choiceIndex": 2,
        "explanation": "Logging alone doesn't discover devices \u2014 need **SSH + SNMP**.",
        "misconceptionTested": "Logging for discovery"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.5-source-q014':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "HTTP **500 Internal Server Error** \u2014 server-side failure; **restart the REST service** on the controller."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "500 is server error \u2014 client formatting won't fix **internal** failure.",
        "misconceptionTested": "Client format for 500"
      },
      {
        "choiceIndex": 1,
        "explanation": "401/403 need auth \u2014 **500** means server broke processing request.",
        "misconceptionTested": "Auth for 500"
      },
      {
        "choiceIndex": 2,
        "explanation": "**500 is not OK** \u2014 200 means success.",
        "misconceptionTested": "500 means OK"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.5-source-q015':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**RESTCONF/NETCONF** southbound configures **network devices** \u2014 DNA Center SBI to switches/routers."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Northbound is apps\u2192controller \u2014 RESTCONF to devices is **southbound**.",
        "misconceptionTested": "NBI for device RESTCONF"
      },
      {
        "choiceIndex": 1,
        "explanation": "East/west aren't standard DNA Center interface names.",
        "misconceptionTested": "Eastbound for RESTCONF"
      },
      {
        "choiceIndex": 2,
        "explanation": "Northbound uses REST APIs **to** the controller, not to devices.",
        "misconceptionTested": "Westbound for RESTCONF"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.5-source-q016':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "HTTP **status codes** return in the **response header** (e.g., `HTTP/1.1 200 OK`)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Body carries payload \u2014 **status line/code** is in the **header**.",
        "misconceptionTested": "Status in HTTP body"
      },
      {
        "choiceIndex": 2,
        "explanation": "Scripts parse headers \u2014 status isn't a script variable by default.",
        "misconceptionTested": "Status as script variable"
      },
      {
        "choiceIndex": 3,
        "explanation": "Status isn't a JSON data object \u2014 it's **HTTP metadata**.",
        "misconceptionTested": "Status as JSON object"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.5-source-q017':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**201 Created** confirms successful **POST** \u2014 resource was created."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "GET returns 200 with data \u2014 not 201.",
        "misconceptionTested": "GET returns 201"
      },
      {
        "choiceIndex": 2,
        "explanation": "PATCH updates \u2014 typically 200/204.",
        "misconceptionTested": "PATCH returns 201"
      },
      {
        "choiceIndex": 3,
        "explanation": "DELETE returns 200/204 \u2014 not 201.",
        "misconceptionTested": "DELETE returns 201"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.5-source-q018':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "URI query strings start with **`?`** \u2014 parameters follow as `?key=value&key2=value2`."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Backslash is path separator on Windows \u2014 not URI queries.",
        "misconceptionTested": "Backslash starts query string"
      },
      {
        "choiceIndex": 1,
        "explanation": "Forward slash separates path segments \u2014 **`?`** starts query.",
        "misconceptionTested": "Forward slash starts query"
      },
      {
        "choiceIndex": 3,
        "explanation": "**&** separates parameters \u2014 **`?`** starts the query string.",
        "misconceptionTested": "Ampersand starts query"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.5-source-q019':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**POST** creates a new resource on the server."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "GET reads \u2014 doesn't create.",
        "misconceptionTested": "GET for create"
      },
      {
        "choiceIndex": 1,
        "explanation": "**UPDATE** is not an HTTP verb \u2014 use PUT/PATCH.",
        "misconceptionTested": "UPDATE as HTTP verb"
      },
      {
        "choiceIndex": 3,
        "explanation": "PUT can create/update \u2014 stem asks **insert/create** \u2192 **POST**.",
        "misconceptionTested": "PUT as create verb in stem"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.5-source-q020':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**504 Gateway Timeout** \u2014 upstream/server didn't respond in time \u2014 request **timed out**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "400-level suggests client/param issues \u2014 **504** is timeout.",
        "misconceptionTested": "Missing params for 504"
      },
      {
        "choiceIndex": 2,
        "explanation": "403 is forbidden \u2014 not timeout.",
        "misconceptionTested": "403 for timeout"
      },
      {
        "choiceIndex": 3,
        "explanation": "503 is service unavailable \u2014 **504** specifically means **gateway timeout**.",
        "misconceptionTested": "503 vs 504 confusion"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.6-source-q014':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**Ansible** is agentless and ships with many **Cisco network modules** \u2014 easy device config."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Puppet/Chef need agents \u2014 Ansible uses **SSH/NETCONF**.",
        "misconceptionTested": "Puppet as easiest Cisco CM"
      },
      {
        "choiceIndex": 2,
        "explanation": "Python is a language \u2014 Ansible is the **CM tool**.",
        "misconceptionTested": "Python as CM utility"
      },
      {
        "choiceIndex": 3,
        "explanation": "Chef is viable but Ansible is the CCNA answer for Cisco ease.",
        "misconceptionTested": "Chef as easiest setup"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.6-source-q015':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**Knife** is Chef's **CLI tool** for managing cookbooks, nodes, and server interaction."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Bookshelf stores cookbooks \u2014 Knife is the **CLI**.",
        "misconceptionTested": "Knife as bookshelf storage"
      },
      {
        "choiceIndex": 1,
        "explanation": "Chef server stores config \u2014 Knife is the **client CLI**.",
        "misconceptionTested": "Knife as server config store"
      },
      {
        "choiceIndex": 3,
        "explanation": "Chef agent is **chef-client** on nodes \u2014 Knife is admin CLI.",
        "misconceptionTested": "Knife as node agent"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.6-source-q016':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**Infrastructure as Code** tools enforce desired state with **idempotence** \u2014 reruns correct drift."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "IaaS is cloud hosting \u2014 not config drift prevention.",
        "misconceptionTested": "IaaS for config drift"
      },
      {
        "choiceIndex": 1,
        "explanation": "NTP syncs time \u2014 doesn't prevent **config drift**.",
        "misconceptionTested": "NTP prevents drift"
      },
      {
        "choiceIndex": 3,
        "explanation": "Licensing varies \u2014 idempotence is the IaC principle.",
        "misconceptionTested": "Per-host licensing required"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.6-source-q017':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "**Ansible** is agentless (SSH only) \u2014 fastest lab setup vs Chef/Puppet agents."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Chef/Puppet need server + agents \u2014 heavier setup.",
        "misconceptionTested": "Chef easiest setup"
      },
      {
        "choiceIndex": 1,
        "explanation": "Puppet requires agent install.",
        "misconceptionTested": "Puppet easiest setup"
      },
      {
        "choiceIndex": 3,
        "explanation": "DNA Center is powerful \u2014 not the lightest CM lab setup.",
        "misconceptionTested": "DNA Center as lightest CM"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.6-source-q018':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Custom Ansible modules are written in **Python** \u2014 extends Ansible's task library."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "YAML writes playbooks \u2014 modules are **Python**.",
        "misconceptionTested": "YAML for custom modules"
      },
      {
        "choiceIndex": 1,
        "explanation": "CSV isn't module format.",
        "misconceptionTested": "CSV module format"
      },
      {
        "choiceIndex": 3,
        "explanation": "XML isn't the Ansible custom module language.",
        "misconceptionTested": "XML for Ansible modules"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.7-source-q001':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "YAML **mappings** (indented key: value pairs) define **key-value** structures."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Definition isn't a YAML element type.",
        "misconceptionTested": "Definition element"
      },
      {
        "choiceIndex": 2,
        "explanation": "Lists use dashes \u2014 mappings are **key-value**.",
        "misconceptionTested": "Lists for key-value"
      },
      {
        "choiceIndex": 3,
        "explanation": "Keys are part of mappings \u2014 **mapping** is the element name.",
        "misconceptionTested": "Keys element type"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.7-source-q002':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "YAML files often begin with **`---`** (three dashes) marking document start."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Hashbang `#!` denotes scripts \u2014 YAML uses **`---`**.",
        "misconceptionTested": "Hashbang for YAML"
      },
      {
        "choiceIndex": 2,
        "explanation": "Curly brackets indicate **JSON**.",
        "misconceptionTested": "Curly brackets for YAML"
      },
      {
        "choiceIndex": 3,
        "explanation": "Square brackets are JSON **arrays**.",
        "misconceptionTested": "Square brackets for YAML"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.7-source-q003':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**XML** uses tagged elements like HTML \u2014 hierarchical markup syntax."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "YAML is indentation-based \u2014 not HTML-like.",
        "misconceptionTested": "YAML resembles HTML"
      },
      {
        "choiceIndex": 1,
        "explanation": "JSON uses braces \u2014 not angle-bracket tags.",
        "misconceptionTested": "JSON resembles HTML"
      },
      {
        "choiceIndex": 2,
        "explanation": "CSV is flat columns \u2014 no nested tags.",
        "misconceptionTested": "CSV resembles HTML"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.7-source-q004':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**YAML** structure relies on **indentation/whitespace** \u2014 significant spaces define nesting."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "JSON uses braces/brackets \u2014 not whitespace significance.",
        "misconceptionTested": "JSON whitespace structure"
      },
      {
        "choiceIndex": 2,
        "explanation": "XML uses tags \u2014 not whitespace hierarchy.",
        "misconceptionTested": "XML whitespace structure"
      },
      {
        "choiceIndex": 3,
        "explanation": "CSV is delimiter-separated \u2014 not whitespace-nested.",
        "misconceptionTested": "CSV whitespace nesting"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.7-source-q005':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "JSON documents are **objects** wrapped in **`{ }` curly braces** at the top level."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Three dashes are **YAML**.",
        "misconceptionTested": "YAML dashes for JSON"
      },
      {
        "choiceIndex": 1,
        "explanation": "Square brackets start JSON **arrays** \u2014 objects use **`{`**.",
        "misconceptionTested": "Array bracket as JSON root"
      },
      {
        "choiceIndex": 2,
        "explanation": "Quotes appear inside values \u2014 file identity is **`{`** structure.",
        "misconceptionTested": "Quote as JSON identifier"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.7-source-q006':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Square brackets **`[`** in JSON denote an **array** \u2014 multiple values for that key."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Value follows after `:` for objects \u2014 `[` means **array of values**.",
        "misconceptionTested": "Bracket introduces single value"
      },
      {
        "choiceIndex": 2,
        "explanation": "Arrays use `[` `]` pairs \u2014 multiple entries under one key.",
        "misconceptionTested": "Bracket closes value"
      },
      {
        "choiceIndex": 3,
        "explanation": "Bracket doesn't mean unknown \u2014 it means **array**.",
        "misconceptionTested": "Unknown value from bracket"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.7-source-q007':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "The nested **`address`** object is **missing a closing `}`** before the final comma/brace."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Interface capitalization is fine in JSON strings.",
        "misconceptionTested": "Fa0/1 capitalization invalid"
      },
      {
        "choiceIndex": 1,
        "explanation": "Address is correctly an object `{}` \u2014 not needing `[]`.",
        "misconceptionTested": "address needs array"
      },
      {
        "choiceIndex": 3,
        "explanation": "Underscores in keys are valid \u2014 **brace mismatch** is the bug.",
        "misconceptionTested": "Nothing wrong in JSON"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.7-source-q008':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "JSON's **nested objects/arrays** enable hierarchical data \u2014 better for **programmatic APIs** than flat CSV."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "CSV can quote spaces \u2014 not the main JSON advantage.",
        "misconceptionTested": "JSON spaces in values vs CSV"
      },
      {
        "choiceIndex": 1,
        "explanation": "CSV doesn't natively do nested keys \u2014 JSON **hierarchy** wins.",
        "misconceptionTested": "Multiple values per CSV key"
      },
      {
        "choiceIndex": 2,
        "explanation": "Line-by-line reading isn't JSON's primary advantage.",
        "misconceptionTested": "Line-by-line as JSON advantage"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.7-source-q009':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Cisco DNA Center REST APIs return data in **JSON** format."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "XML is legacy on some systems \u2014 DNA Center APIs are **JSON**.",
        "misconceptionTested": "XML DNA Center default"
      },
      {
        "choiceIndex": 2,
        "explanation": "CSV isn't API response format.",
        "misconceptionTested": "CSV API response"
      },
      {
        "choiceIndex": 3,
        "explanation": "YAML may configure Ansible \u2014 API responses are **JSON**.",
        "misconceptionTested": "YAML API response"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.7-source-q010':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Inside the `routes` array, objects must be separate \u2014 need **`]`** or `},{` between route entries; missing **comma/bracket** structure."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Comma after `routes` array isn't the core issue \u2014 **objects inside array** are malformed.",
        "misconceptionTested": "Comma after routes key only"
      },
      {
        "choiceIndex": 2,
        "explanation": "Underscores in keys are valid JSON.",
        "misconceptionTested": "Underscore invalid in JSON"
      },
      {
        "choiceIndex": 3,
        "explanation": "JSON is invalid \u2014 missing delimiter between array objects.",
        "misconceptionTested": "Valid JSON exhibit"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.7-source-q011':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "Nested arrays for IP addresses are **valid JSON** \u2014 no syntax error in the exhibit."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Trailing commas aren't present after defaultgw \u2014 structure is valid.",
        "misconceptionTested": "Missing comma after defaultgw"
      },
      {
        "choiceIndex": 1,
        "explanation": "Second IP doesn't require separate subnet mask key \u2014 valid nesting.",
        "misconceptionTested": "Missing subnet for second IP"
      },
      {
        "choiceIndex": 2,
        "explanation": "Underscores in `subnet_mask` are legal JSON keys.",
        "misconceptionTested": "Underscore illegal"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
  'obj-6.7-source-q012':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "The `ipaddress` array is **missing a closing `]`** before `subnet_mask` begins."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "defaultgw comma isn't the first syntax break \u2014 **unclosed array** is.",
        "misconceptionTested": "Comma after defaultgw primary issue"
      },
      {
        "choiceIndex": 2,
        "explanation": "Underscores are valid in JSON keys.",
        "misconceptionTested": "Underscore invalid"
      },
      {
        "choiceIndex": 3,
        "explanation": "JSON is malformed \u2014 bracket not closed.",
        "misconceptionTested": "Valid JSON exhibit"
      }
    ],
    "examTip": "SDN planes: **data** = forward | **control** = routing protocols/STP | **management** = SNMP/syslog/CDP."
  },
}
