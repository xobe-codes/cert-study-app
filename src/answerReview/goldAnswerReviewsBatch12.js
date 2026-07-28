/** Gold reviews — Batch 12: Subnetting 1.6 + NAT 4.1 + Security 5.1. */
export const BATCH12_GOLD = {
  '1.6-c-q2':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "A /27 leaves 5 host bits (32\u221227). Block size = 2^5 = **32** addresses per subnet."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "16 is the block size for /28 (4 host bits), not /27.",
        "misconceptionTested": "Confusing /27 block size with /28"
      },
      {
        "choiceIndex": 2,
        "explanation": "64 is the block size for /26 (6 host bits), not /27.",
        "misconceptionTested": "Using /26 block size for a /27 mask"
      },
      {
        "choiceIndex": 3,
        "explanation": "8 is the block size for /29 (3 host bits), not /27.",
        "misconceptionTested": "Undersizing /27 block to 8"
      }
    ],
    "examTip": "/27 \u2192 5 host bits \u2192 block size **32** (memorize 128/64/32/16/8 for /25\u2013/29)."
  },
  '1.6-c-q3':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "192.168.10.0/26 spans 64 addresses (.0\u2013.63). Broadcast is the last address: **192.168.10.63**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": ".255 is the broadcast of a /24, not a /26 within 192.168.10.0.",
        "misconceptionTested": "Applying /24 broadcast to a /26"
      },
      {
        "choiceIndex": 2,
        "explanation": ".127 is the broadcast of 192.168.10.64/26, not 192.168.10.0/26.",
        "misconceptionTested": "Off-by-one subnet boundary"
      },
      {
        "choiceIndex": 3,
        "explanation": ".64 is the network address of the next /26, not the broadcast of .0/26.",
        "misconceptionTested": "Confusing next network with broadcast"
      }
    ],
    "examTip": "/26 block = 64 \u2192 broadcast = network + block size \u2212 1."
  },
  '1.6-c-q4':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "172.16.0.100 falls in the 172.16.0.64\u2013172.16.0.127 /26 range \u2014 subnet ID **172.16.0.64**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "172.16.0.0/26 covers .0\u2013.63; .100 is above that range.",
        "misconceptionTested": "Assigning host to wrong /26 block"
      },
      {
        "choiceIndex": 2,
        "explanation": "172.16.0.96/26 starts at .96; .100 is in the .64 block.",
        "misconceptionTested": "Starting subnet at wrong multiple of 64"
      },
      {
        "choiceIndex": 3,
        "explanation": "172.16.0.128/26 begins at .128; .100 is below that.",
        "misconceptionTested": "Overshooting to next /26 network"
      }
    ],
    "examTip": "Find subnet: divide host octet by block size (64 for /26) and floor to the boundary."
  },
  '1.6-c-q5':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "/27 gives 2^5\u22122 = **30** usable hosts \u2014 the smallest standard mask that fits 30 hosts without wasting a full /26 (62 usable)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "/26 provides 62 usable hosts \u2014 works but wastes more addresses than /27 for only 30 hosts.",
        "misconceptionTested": "Oversizing mask when smaller subnet fits"
      },
      {
        "choiceIndex": 2,
        "explanation": "/28 only allows 14 usable hosts \u2014 not enough for 30.",
        "misconceptionTested": "Undersizing host capacity"
      },
      {
        "choiceIndex": 3,
        "explanation": "/29 allows only 6 usable hosts \u2014 far too small for 30.",
        "misconceptionTested": "Choosing point-to-point mask for LAN"
      }
    ],
    "examTip": "Need N hosts \u2192 smallest prefix where 2^hostbits\u22122 \u2265 N; /27 = 30 usable."
  },
  '1.6-c-q6':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "/30 has 2 host bits \u2192 2^2 = 4 total, minus network and broadcast = **2 usable** hosts (typical WAN link)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "1 usable host would be /31 in some designs \u2014 /30 provides two assignable addresses.",
        "misconceptionTested": "Undercounting /30 usable hosts"
      },
      {
        "choiceIndex": 2,
        "explanation": "4 is the total addresses in the subnet, not usable hosts.",
        "misconceptionTested": "Counting total addresses instead of usable"
      },
      {
        "choiceIndex": 3,
        "explanation": "/30 always has hosts; /31 is the special case with 0 usable in classic counting.",
        "misconceptionTested": "Believing /30 has no usable hosts"
      }
    ],
    "examTip": "/30 WAN link: **2 usable** hosts (.1 and .2 in a .0/30)."
  },
  '1.6-c-q7':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Borrowing 3 bits from host portion creates 2^3 = **8** subnets (classic formula when all borrowed bits used)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "6 subnets would require subtracting reserved subnets in legacy classful math \u2014 CCNA uses 2^borrowed.",
        "misconceptionTested": "Subtracting 2 from subnet count incorrectly"
      },
      {
        "choiceIndex": 2,
        "explanation": "16 subnets needs 4 borrowed bits (2^4), not 3.",
        "misconceptionTested": "Doubling borrowed bits"
      },
      {
        "choiceIndex": 3,
        "explanation": "3 is the number of bits borrowed, not the subnet count.",
        "misconceptionTested": "Confusing borrowed bits with subnet count"
      }
    ],
    "examTip": "Subnets created = **2^(borrowed bits)** unless question states otherwise."
  },
  '1.6-c-q8':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "255.255.255.240 = 11111111.11111111.11111111.11110000 \u2192 **28** network bits = **/28**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "/26 mask ends in .192 (11100000), not .240.",
        "misconceptionTested": "Misreading last octet 240"
      },
      {
        "choiceIndex": 1,
        "explanation": "/27 mask ends in .224 (11100000), not .240 (11110000).",
        "misconceptionTested": "Confusing /27 with /28"
      },
      {
        "choiceIndex": 3,
        "explanation": "/29 mask ends in .248 (11111000), not .240.",
        "misconceptionTested": "Confusing /28 with /29"
      }
    ],
    "examTip": "Last octet .240 = 11110000 \u2192 **/28** (four network bits in last octet)."
  },
  '1.6-c-q9':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "10.0.0.0/29 has 8 addresses (.0\u2013.7). Usable hosts: **10.0.0.1 \u2013 10.0.0.6** (exclude network .0 and broadcast .7)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": ".7 is the broadcast address \u2014 not assignable to a host.",
        "misconceptionTested": "Including broadcast in host range"
      },
      {
        "choiceIndex": 2,
        "explanation": ".0 is the network address \u2014 hosts start at .1.",
        "misconceptionTested": "Including network address as host"
      },
      {
        "choiceIndex": 3,
        "explanation": ".14 would be in 10.0.0.8/29, not 10.0.0.0/29.",
        "misconceptionTested": "Spanning into next /29 block"
      }
    ],
    "examTip": "/29 usable range: first host = network+1, last host = broadcast\u22121."
  },
  '1.6-c-q10':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "/26 means 26 network bits in a classful view of a /24 \u2014 **6 host bits** remain in the last octet (32\u221226=6)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "26 is the prefix length (network bits total), not host bits.",
        "misconceptionTested": "Using CIDR number as host bits"
      },
      {
        "choiceIndex": 2,
        "explanation": "8 host bits would be a /24, not /26.",
        "misconceptionTested": "Confusing /24 host bits with /26"
      },
      {
        "choiceIndex": 3,
        "explanation": "4 host bits corresponds to /28, not /26.",
        "misconceptionTested": "Undershooting host bits for /26"
      }
    ],
    "examTip": "Host bits in last octet = 32 \u2212 prefix (for /24-based subnets): /26 \u2192 **6** host bits."
  },
  '1.6-c-q11':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Network and broadcast addresses are reserved \u2014 they cannot be assigned to end hosts."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Assigning network/broadcast to hosts breaks subnet semantics and causes conflicts.",
        "misconceptionTested": "Believing all addresses in range are usable"
      }
    ],
    "examTip": "Usable hosts = total \u2212 **2** (network + broadcast) except special /31 cases."
  },
  '1.6-c-q12':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "200 hosts need 2^8\u22122 = 254 usable minimum \u2192 **/24** (8 host bits). /25 only gives 126 usable."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "/25 provides only 126 usable hosts \u2014 insufficient for 200.",
        "misconceptionTested": "Undersizing for 200 hosts"
      },
      {
        "choiceIndex": 2,
        "explanation": "/23 is larger than needed (510 usable) \u2014 question asks smallest standard mask that fits.",
        "misconceptionTested": "Oversizing when /24 suffices"
      },
      {
        "choiceIndex": 3,
        "explanation": "/26 allows only 62 usable hosts.",
        "misconceptionTested": "Severely undersizing mask"
      }
    ],
    "examTip": "200 hosts \u2192 need \u2265202 addresses \u2192 **/24** is smallest common mask that fits."
  },
  '4.1-c-q8':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "PAT (overload) multiplexes many inside hosts on one public IP using unique source **port numbers**."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Without port translation, multiple hosts cannot share one public IP simultaneously \u2014 that is PAT's role.",
        "misconceptionTested": "Denying port role in PAT"
      }
    ],
    "examTip": "PAT = one public IP + many hosts distinguished by **ports**."
  },
  '4.1-q2':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Inside local is the private address as the host sees it \u2014 typically the LAN host (192.168.1.2 Host A)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "192.168.1.1 is the inside router interface, not the host's inside local address.",
        "misconceptionTested": "Confusing router inside interface with host"
      },
      {
        "choiceIndex": 2,
        "explanation": "179.43.44.1 is a public/outside-side address on the WAN, not inside local.",
        "misconceptionTested": "Labeling WAN address as inside local"
      },
      {
        "choiceIndex": 3,
        "explanation": "198.23.53.3 is an outside global server, not the inside local host.",
        "misconceptionTested": "Mixing outside global with inside local"
      }
    ],
    "examTip": "Inside **local** = private host address before NAT."
  },
  '4.1-q3':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Inside global is the public address representing the inside host after translation \u2014 Router A S0/0 (179.43.44.1) in the exhibit."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "192.168.1.2 is inside local, not the global representation.",
        "misconceptionTested": "Using private address as inside global"
      },
      {
        "choiceIndex": 1,
        "explanation": "Gi0/0 is the inside interface IP, not necessarily the translated global address.",
        "misconceptionTested": "Confusing inside interface with inside global"
      },
      {
        "choiceIndex": 3,
        "explanation": "198.23.53.3 is an outside destination, not inside global.",
        "misconceptionTested": "Selecting outside server as inside global"
      }
    ],
    "examTip": "Inside **global** = public address seen by the outside world for an inside host."
  },
  '4.1-q4':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "Outside global is the public address of the remote host as seen on the Internet \u2014 the web server 198.23.53.3."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Host A is inside local, not an outside global address.",
        "misconceptionTested": "Inside host labeled as outside global"
      },
      {
        "choiceIndex": 1,
        "explanation": "Router inside interface is not the outside global destination.",
        "misconceptionTested": "Router LAN IP as outside global"
      },
      {
        "choiceIndex": 2,
        "explanation": "179.43.44.1 is the NAT router's public side \u2014 inside global for outbound, not the remote server.",
        "misconceptionTested": "NAT router WAN IP as destination outside global"
      }
    ],
    "examTip": "Outside **global** = real public address of the remote host on the Internet."
  },
  '4.1-q5':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "`show ip nat translations` displays active NAT entries (inside/outside local/global mappings)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "IOS syntax requires `show ip nat translations` \u2014 not `show nat translations`.",
        "misconceptionTested": "Omitting ip keyword in show command"
      },
      {
        "choiceIndex": 2,
        "explanation": "`debug ip nat` is realtime debug, not the standard show command for the table.",
        "misconceptionTested": "Using debug instead of show"
      },
      {
        "choiceIndex": 3,
        "explanation": "`show translations nat` is invalid IOS syntax.",
        "misconceptionTested": "Inventing show command word order"
      }
    ],
    "examTip": "View NAT table \u2192 **`show ip nat translations`**."
  },
  '4.1-q6':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "`show ip nat statistics` summarizes active translations, hits/misses, and NAT resource usage."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Translations command lists entries, not the overview counters/statistics.",
        "misconceptionTested": "Using translations for summary stats"
      },
      {
        "choiceIndex": 1,
        "explanation": "There is no standard `show ip nat summary` on IOS \u2014 use statistics.",
        "misconceptionTested": "Inventing summary command"
      },
      {
        "choiceIndex": 2,
        "explanation": "`show ip nat status` is not the standard statistics overview command.",
        "misconceptionTested": "Confusing status with statistics"
      }
    ],
    "examTip": "NAT counters/overview \u2192 **`show ip nat statistics`**."
  },
  '4.1-q7':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Static NAT: `ip nat inside source static <inside-local> <inside-global>` maps one private host to one public IP."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Missing `ip nat` keyword \u2014 IOS requires `ip nat inside source static`.",
        "misconceptionTested": "Omitting ip nat prefix"
      },
      {
        "choiceIndex": 2,
        "explanation": "`ip nat static` is not valid syntax \u2014 use `inside source static`.",
        "misconceptionTested": "Wrong static NAT syntax"
      },
      {
        "choiceIndex": 3,
        "explanation": "Order is inside source static, not source static alone without inside.",
        "misconceptionTested": "Reversed inside/source keywords"
      }
    ],
    "examTip": "Static NAT: **`ip nat inside source static <local> <global>`**."
  },
  '4.1-q8':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Pool for 179.43.44.0/28: use `.2` through `.14` with netmask `255.255.255.240`; `.1` is already assigned and `.15` is broadcast."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Pool syntax uses start/end addresses and netmask \u2014 not CIDR slash in pool command.",
        "misconceptionTested": "Using CIDR in ip nat pool"
      },
      {
        "choiceIndex": 1,
        "explanation": "/28 netmask is 255.255.255.240, not 255.255.255.0.",
        "misconceptionTested": "Wrong netmask for /28 block"
      },
      {
        "choiceIndex": 3,
        "explanation": "Start address and netmask must match the owned /28 block \u2014 .0 mask is invalid for a /28 pool.",
        "misconceptionTested": "Mismatched pool range and mask"
      }
    ],
    "examTip": "Dynamic pool: **`ip nat pool <name> <start> <end> netmask <mask>`**."
  },
  '4.1-q10':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "`clear ip nat translation *` removes all dynamic (and static if specified) entries from the translation table."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`no ip nat translation` is not the clear command syntax.",
        "misconceptionTested": "Using no instead of clear"
      },
      {
        "choiceIndex": 1,
        "explanation": "Clear requires `translation` and usually `*` for all entries.",
        "misconceptionTested": "Incomplete clear syntax"
      },
      {
        "choiceIndex": 3,
        "explanation": "`clear ip nat` without translation/* is incomplete.",
        "misconceptionTested": "Truncated clear command"
      }
    ],
    "examTip": "Flush NAT table \u2192 **`clear ip nat translation *`**."
  },
  '4.1-q11':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "`debug ip nat` shows real-time NAT translation events (use sparingly in production)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`show ip translations` is invalid \u2014 use show ip nat translations or debug.",
        "misconceptionTested": "Invalid show command"
      },
      {
        "choiceIndex": 2,
        "explanation": "`debug ip translations` is not standard IOS NAT debug syntax.",
        "misconceptionTested": "Wrong debug keyword"
      },
      {
        "choiceIndex": 3,
        "explanation": "`show ip nat` alone is incomplete for realtime events \u2014 debug is required.",
        "misconceptionTested": "Expecting show for realtime debug"
      }
    ],
    "examTip": "Realtime NAT events \u2192 **`debug ip nat`** (remember `undebug all`)."
  },
  '4.1-q12':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "PAT requires ACL + pool (often single IP) + **`overload`** keyword: `ip nat inside source list 1 pool EntPool overload`."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Missing `overload` \u2014 without it, dynamic NAT assigns one pool address per host, not port multiplexing.",
        "misconceptionTested": "Forgetting overload for PAT"
      },
      {
        "choiceIndex": 1,
        "explanation": "Syntax must be `ip nat inside source list` \u2014 not `ip nat source pool` alone.",
        "misconceptionTested": "Wrong PAT command structure"
      },
      {
        "choiceIndex": 3,
        "explanation": "No overload keyword means dynamic NAT, not PAT on a single public IP.",
        "misconceptionTested": "Pool without overload on one IP"
      }
    ],
    "examTip": "PAT on one public IP \u2192 add **`overload`** to inside source list pool."
  },
  '5.1-q2':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Hashing detects whether file contents changed \u2014 protecting **integrity** (unauthorized modification)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Confidentiality is about secrecy \u2014 hashing does not encrypt or hide data.",
        "misconceptionTested": "Confusing hash with encryption"
      },
      {
        "choiceIndex": 1,
        "explanation": "Availability is uptime/access \u2014 hashing does not ensure service is reachable.",
        "misconceptionTested": "Mapping integrity control to availability"
      },
      {
        "choiceIndex": 3,
        "explanation": "Non-repudiation often uses digital signatures, not hashes alone.",
        "misconceptionTested": "Equating hash with non-repudiation"
      }
    ],
    "examTip": "Detect tampering \u2192 **integrity**; hide data \u2192 confidentiality."
  },
  '5.1-q4':   {
    "correct": {
      "choiceIndex": 3,
      "explanation": "**Ransomware** encrypts victim files and demands payment for the decryption key."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Viruses attach to files and spread when executed \u2014 they do not typically demand ransom for decryption.",
        "misconceptionTested": "Labeling virus as ransomware"
      },
      {
        "choiceIndex": 1,
        "explanation": "Worms self-replicate across networks \u2014 encryption-for-ransom is ransomware's hallmark.",
        "misconceptionTested": "Confusing worm with ransomware"
      },
      {
        "choiceIndex": 2,
        "explanation": "Trojans disguise as legitimate software \u2014 ransom encryption is a separate ransomware behavior.",
        "misconceptionTested": "Trojan vs ransomware"
      }
    ],
    "examTip": "Encrypt files + demand payment = **ransomware**."
  },
  '5.1-q7':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Layering firewalls, training, AV, and segmentation is **defense in depth** \u2014 multiple independent controls."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "MFA verifies identity with multiple factors \u2014 not the same as layered security controls.",
        "misconceptionTested": "Confusing defense in depth with MFA"
      },
      {
        "choiceIndex": 2,
        "explanation": "Zero trust is a model of continuous verification \u2014 related but not the definition of layered controls.",
        "misconceptionTested": "Equating with zero trust"
      },
      {
        "choiceIndex": 3,
        "explanation": "AAA is authentication, authorization, accounting \u2014 not multi-layer defense strategy.",
        "misconceptionTested": "AAA vs defense in depth"
      }
    ],
    "examTip": "Multiple security layers \u2192 **defense in depth**."
  },
}
