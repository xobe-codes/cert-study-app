/** Gold reviews — Batch 8: Network Access + IP Services domains 2 & 4. */
export const BATCH8_GOLD = {
  '2.1-c-q3': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Access mode plus `switchport access vlan 10` assigns the port to VLAN 10 as an untagged access port."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`switchport trunk vlan 10` is not valid access-port syntax — trunks carry tagged VLANs; access ports use `switchport mode access` and `switchport access vlan`.",
        "misconceptionTested": "Using trunk commands to assign an access VLAN"
      },
      {
        "choiceIndex": 2,
        "explanation": "`vlan 10` creates the VLAN in the VLAN database — it does not assign a physical interface to VLAN 10.",
        "misconceptionTested": "Confusing VLAN creation with port assignment"
      },
      {
        "choiceIndex": 3,
        "explanation": "`switchport voice vlan` is for Cisco IP phone auxiliary VLAN tagging — not the command pair for a standard data access port in VLAN 10.",
        "misconceptionTested": "Using voice VLAN command for standard access assignment"
      }
    ],
    "examTip": "Access port → **`switchport mode access`** + **`switchport access vlan <id>`**."
  },
  '2.2-c-q5': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "`switchport mode trunk` forces the port to operate as an 802.1Q trunk regardless of DTP negotiation."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`switchport mode access` keeps the port in access mode — it will not carry multiple VLANs as a trunk.",
        "misconceptionTested": "Selecting access mode when trunk is required"
      },
      {
        "choiceIndex": 2,
        "explanation": "`switchport trunk allowed vlan` filters which VLANs cross the trunk — it does not change the port to trunk mode by itself.",
        "misconceptionTested": "Believing allowed-VLAN command sets trunk mode"
      },
      {
        "choiceIndex": 3,
        "explanation": "`switchport nonegotiate` disables DTP but does not force trunk — you still need `switchport mode trunk` (or dynamic desirable/auto).",
        "misconceptionTested": "Equating nonegotiate with forcing trunk mode"
      }
    ],
    "examTip": "Force trunk → **`switchport mode trunk`** (then tune allowed/native VLANs)."
  },
  '2.2-c-q6': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "`switchport nonegotiate` stops DTP from sending negotiation frames — the port stays in whatever mode you configured manually."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`no dtp` is not standard IOS trunk syntax — DTP is disabled per interface with `switchport nonegotiate`.",
        "misconceptionTested": "Inventing global no dtp command"
      },
      {
        "choiceIndex": 2,
        "explanation": "`switchport mode dynamic` participates in DTP negotiation — it does not disable auto-negotiation.",
        "misconceptionTested": "Using dynamic mode to stop DTP"
      },
      {
        "choiceIndex": 3,
        "explanation": "`no switchport trunk` is not the command to disable DTP — use `switchport nonegotiate` on the interface.",
        "misconceptionTested": "Negating switchport trunk instead of nonegotiate"
      }
    ],
    "examTip": "Disable DTP on a trunk → **`switchport nonegotiate`** after setting the mode."
  },
  '2.2-c-q7': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "`show interfaces trunk` lists trunking status, native VLAN, and allowed VLANs per trunk interface."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`show vlan brief` lists VLAN IDs and port assignments — it does not show trunk encapsulation, native VLAN, or allowed lists.",
        "misconceptionTested": "Using VLAN brief for trunk operational detail"
      },
      {
        "choiceIndex": 2,
        "explanation": "`show ip interface brief` summarizes Layer 3 status — trunk mode and allowed VLANs are Layer 2 trunk parameters.",
        "misconceptionTested": "Checking IP brief for trunk VLAN details"
      },
      {
        "choiceIndex": 3,
        "explanation": "`show cdp neighbors` discovers adjacent devices — it does not report 802.1Q trunk configuration.",
        "misconceptionTested": "Using CDP neighbors for trunk verification"
      }
    ],
    "examTip": "Verify trunk/native/allowed → **`show interfaces trunk`**."
  },
  '2.5-c-q2': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "STP elects the root bridge with the lowest Bridge ID — priority (default 32768) plus switch MAC address."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Highest priority does not win — STP prefers the **lowest** Bridge ID (priority + MAC).",
        "misconceptionTested": "Believing highest priority becomes root"
      },
      {
        "choiceIndex": 2,
        "explanation": "MAC alone is not the sole criterion — Bridge ID combines configurable priority with the system MAC.",
        "misconceptionTested": "Selecting highest MAC as root tie-break only"
      },
      {
        "choiceIndex": 3,
        "explanation": "CPU speed is irrelevant to STP root election — Bridge ID determines the root.",
        "misconceptionTested": "Expecting fastest switch to become root"
      }
    ],
    "examTip": "Root bridge = **lowest Bridge ID** (priority + MAC)."
  },
  '2.5-c-q4': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Each non-root switch selects exactly one root port — the best path toward the root bridge."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Designated ports face away from the root on each segment — only one root port per non-root switch points toward the root.",
        "misconceptionTested": "Confusing designated port with root port role"
      },
      {
        "choiceIndex": 2,
        "explanation": "Blocking is a port state, not the single best-path port role toward the root — that role is root port.",
        "misconceptionTested": "Naming blocking as the toward-root port type"
      },
      {
        "choiceIndex": 3,
        "explanation": "Trunk is an interface mode — STP port roles are root, designated, alternate, or backup.",
        "misconceptionTested": "Equating trunk mode with STP root port"
      }
    ],
    "examTip": "Non-root switch → **one root port** (best path to root)."
  },
  '2.5-c-q5': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "PortFast skips listening/learning on access ports connected to end hosts — never on switch-to-switch trunks."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Trunks interconnect switches — PortFast on uplinks risks temporary loops if BPDUs are missed; keep PortFast on edge access ports only.",
        "misconceptionTested": "Enabling PortFast on switch trunks"
      },
      {
        "choiceIndex": 2,
        "explanation": "Router uplinks are not the classic PortFast use case — Cisco guidance targets access ports to PCs, phones, and servers.",
        "misconceptionTested": "Defaulting PortFast to router uplinks"
      },
      {
        "choiceIndex": 3,
        "explanation": "PortFast on every port including trunks is unsafe — STP needs normal transitions on inter-switch links.",
        "misconceptionTested": "Applying PortFast globally including trunks"
      }
    ],
    "examTip": "PortFast → **access ports to end devices**; pair with **BPDU Guard** on edges."
  },
  '2.5-c-q7': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Modern Cisco switches default to Rapid PVST+ — per-VLAN rapid spanning tree (802.1w behavior)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "802.1D is classic STP — Cisco defaults to Rapid PVST+, not legacy 802.1D-only mode.",
        "misconceptionTested": "Assuming default is original 802.1D"
      },
      {
        "choiceIndex": 2,
        "explanation": "MST (802.1s) maps multiple VLANs to instances — it is not the factory default on most Catalyst platforms.",
        "misconceptionTested": "Believing MST is the Cisco default"
      },
      {
        "choiceIndex": 3,
        "explanation": "PVST (non-rapid) is older per-VLAN STP — current IOS defaults to Rapid PVST+.",
        "misconceptionTested": "Selecting classic PVST as default"
      }
    ],
    "examTip": "Cisco default STP mode → **Rapid PVST+**."
  },
  'obj-2.3-source-q009': {
    "correct": {
      "choiceIndex": 2,
      "explanation": "`show lldp neighbor detail` displays LLDP-discovered neighbors, capabilities, and connected interfaces."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`show lldp` alone is incomplete syntax on many platforms — neighbor detail is the standard verification command.",
        "misconceptionTested": "Using bare show lldp without neighbor keyword"
      },
      {
        "choiceIndex": 1,
        "explanation": "`show lldp devices` is not standard IOS — use `show lldp neighbors` or `show lldp neighbor detail`.",
        "misconceptionTested": "Inventing show lldp devices command"
      },
      {
        "choiceIndex": 3,
        "explanation": "`show cdp neighbor detail` reports Cisco CDP neighbors — LLDP is the IEEE multi-vendor discovery protocol.",
        "misconceptionTested": "Verifying LLDP with CDP show command"
      }
    ],
    "examTip": "LLDP neighbors → **`show lldp neighbor detail`** (enable with `lldp run` first)."
  },
  'obj-2.4-source-q004': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "LACP (802.3ad) is the IEEE standard link aggregation protocol — PAgP is Cisco proprietary."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "802.1Q is VLAN trunk encapsulation — not a link aggregation negotiation protocol.",
        "misconceptionTested": "Confusing 802.1Q tagging with EtherChannel negotiation"
      },
      {
        "choiceIndex": 2,
        "explanation": "PAgP is Cisco proprietary — the IEEE standard for EtherChannel negotiation is LACP (802.3ad).",
        "misconceptionTested": "Selecting PAgP as the IEEE standard"
      },
      {
        "choiceIndex": 3,
        "explanation": "802.1X is port-based network access control — unrelated to bundling physical links.",
        "misconceptionTested": "Equating 802.1X with link aggregation"
      }
    ],
    "examTip": "IEEE EtherChannel protocol → **LACP (802.3ad)**; Cisco-only → **PAgP**."
  },
  'obj-2.4-source-q007': {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Channel-group mode **on** forces the bundle without LACP or PAgP — both sides must match **on**."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "LACP uses active/passive negotiation — **on** mode bypasses LACP entirely.",
        "misconceptionTested": "Calling forced bundle LACP off mode"
      },
      {
        "choiceIndex": 1,
        "explanation": "PAgP uses desirable/auto — **on** mode does not use PAgP at all.",
        "misconceptionTested": "Labeling on mode as PAgP off"
      },
      {
        "choiceIndex": 3,
        "explanation": "802.3ad is LACP — **on** mode forms an unconditional static port-channel without control protocol.",
        "misconceptionTested": "Equating on mode with 802.3ad LACP"
      }
    ],
    "examTip": "No negotiation protocol → **`channel-group <n> mode on`** on **both** ends."
  },
  'obj-2.4-source-q015': {
    "correct": {
      "choiceIndex": 3,
      "explanation": "When both sides use mode **on**, IOS forms an unconditional port-channel without LACP or PAgP packets."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "PAgP requires desirable/auto modes — dual **on** does not send PAgP hellos.",
        "misconceptionTested": "Expecting PAgP with both sides in on mode"
      },
      {
        "choiceIndex": 1,
        "explanation": "Matching **on** mode on both switches forms the bundle — mismatched modes fail, not matching on/on.",
        "misconceptionTested": "Believing on/on prevents channel formation"
      },
      {
        "choiceIndex": 2,
        "explanation": "LACP requires active/passive — **on/on** is static bundling without LACP.",
        "misconceptionTested": "Expecting LACP when both sides are on"
      }
    ],
    "examTip": "Both ends **`mode on`** → **static port-channel** (no LACP/PAgP)."
  },
  'obj-2.6-source-q002': {
    "correct": {
      "choiceIndex": 3,
      "explanation": "Monitor mode dedicates the AP radio to scanning (including Bluetooth/Wi-Fi interference) without serving clients."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "BT mode is not a Cisco AP operating mode — monitor mode performs spectrum and interference analysis.",
        "misconceptionTested": "Inventing BT mode for interference detection"
      },
      {
        "choiceIndex": 1,
        "explanation": "Sniffer mode captures frames for analysis — monitor mode is the WLC-driven scan role for RF interference.",
        "misconceptionTested": "Confusing sniffer with monitor mode"
      },
      {
        "choiceIndex": 2,
        "explanation": "Analysis mode is not standard AP role naming — Cisco uses **monitor** for dedicated scanning.",
        "misconceptionTested": "Selecting generic analysis mode label"
      }
    ],
    "examTip": "Detect RF/Bluetooth interference → AP in **monitor mode** (no client service)."
  },
  'obj-2.9-source-q011': {
    "correct": {
      "choiceIndex": 2,
      "explanation": "WPA2-PSK with AES (CCMP) is the shown profile — pre-shared key with AES encryption."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "WEP is obsolete — the profile explicitly shows WPA2 with AES, not WEP.",
        "misconceptionTested": "Choosing WEP when WPA2-AES is configured"
      },
      {
        "choiceIndex": 1,
        "explanation": "WPA (TKIP) is older than WPA2 — the WLAN summary lists WPA2 security policy.",
        "misconceptionTested": "Downgrading WPA2 profile to original WPA"
      },
      {
        "choiceIndex": 3,
        "explanation": "Open authentication has no PSK — this WLAN uses WPA2 with PSK key management.",
        "misconceptionTested": "Selecting open auth on a WPA2-PSK WLAN"
      }
    ],
    "examTip": "WLC WLAN **WPA2 + PSK + AES** = **WPA2-Personal** (not WEP/Open)."
  },
  '4.1-c-q7': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "`show ip nat translations` displays active inside/outside address mappings currently in the NAT table."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`show ip route` lists routing table entries — NAT translations live in the NAT table, not the RIB.",
        "misconceptionTested": "Using routing table for NAT translation verification"
      },
      {
        "choiceIndex": 2,
        "explanation": "Running-config shows configured NAT policies — active live translations require `show ip nat translations`.",
        "misconceptionTested": "Checking running-config for active translation state"
      },
      {
        "choiceIndex": 3,
        "explanation": "`show ip nat inside` is not standard verification syntax — use `show ip nat translations` for the translation table.",
        "misconceptionTested": "Inventing show ip nat inside command"
      }
    ],
    "examTip": "Active NAT entries → **`show ip nat translations`**."
  },
  '4.1-c-q5': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "`ip nat inside source list 1 interface g0/0 overload` enables PAT using the outside interface address."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Static NAT maps one inside to one outside — PAT needs `overload` on an interface or pool.",
        "misconceptionTested": "Using static syntax for many-to-one PAT"
      },
      {
        "choiceIndex": 2,
        "explanation": "A NAT pool supports dynamic NAT — PAT overload typically uses the outside interface keyword with `overload`.",
        "misconceptionTested": "Expecting pool alone to provide PAT"
      },
      {
        "choiceIndex": 3,
        "explanation": "Outside source NAT reverses direction — inside hosts sharing one public IP use inside source with overload.",
        "misconceptionTested": "Configuring outside source for inside PAT"
      }
    ],
    "examTip": "PAT to outside interface → **`ip nat inside source list <acl> interface <if> overload`**."
  },
  '4.1-c-q6': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Inside local is the host private address as known on the internal network before translation."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Inside global is the translated public address as seen externally — not the private address inside the LAN.",
        "misconceptionTested": "Swapping inside local with inside global"
      },
      {
        "choiceIndex": 2,
        "explanation": "Outside global is the remote public address — inside local refers to the internal host private IP.",
        "misconceptionTested": "Labeling remote public as inside local"
      },
      {
        "choiceIndex": 3,
        "explanation": "Outside local is how the internal network sees an outside address — not the host private IP.",
        "misconceptionTested": "Confusing outside local with host private address"
      }
    ],
    "examTip": "NAT naming: **inside local** = private IP **before** translation on the LAN."
  },
  'obj-4.2-source-q002': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "`ntp master` configures the device to act as an authoritative NTP time source using its system clock."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`ntp server` points to an upstream NTP peer — it does not declare this device as the master clock.",
        "misconceptionTested": "Using ntp server to become time master"
      },
      {
        "choiceIndex": 2,
        "explanation": "`ntp clock source` is not standard syntax for designating the local device as master.",
        "misconceptionTested": "Inventing ntp clock source command"
      },
      {
        "choiceIndex": 3,
        "explanation": "`ntp trusted` marks peers as trusted for ACL purposes — it does not make the router the master clock.",
        "misconceptionTested": "Confusing ntp trusted with ntp master"
      }
    ],
    "examTip": "Device is the time authority → **`ntp master`** (after setting clock or syncing once)."
  },
  'obj-4.3-source-q001': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Reverse DNS resolves an IP address to an FQDN — forward DNS maps names to addresses."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Forwarding to another DNS server is recursion/referral — reverse lookup specifically means IP-to-name resolution.",
        "misconceptionTested": "Defining reverse lookup as server referral"
      },
      {
        "choiceIndex": 2,
        "explanation": "Answering without recursion describes an authoritative response — reverse lookup is about query direction (IP → name).",
        "misconceptionTested": "Equating reverse with non-recursive answer"
      },
      {
        "choiceIndex": 3,
        "explanation": "FQDN-to-IP is forward DNS (A/AAAA records) — reverse uses PTR in in-addr.arpa zones.",
        "misconceptionTested": "Swapping forward and reverse DNS definitions"
      }
    ],
    "examTip": "Reverse DNS = **IP → FQDN** (PTR); forward = **name → IP**."
  },
  'obj-4.4-source-q001': {
    "correct": {
      "choiceIndex": 3,
      "explanation": "SNMPv3 adds authentication and encryption (priv) — v1/v2c rely on community strings in cleartext."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "SNMPv1 has no encryption or strong authentication — community strings are sent in clear text.",
        "misconceptionTested": "Expecting SNMPv1 to provide encryption"
      },
      {
        "choiceIndex": 1,
        "explanation": "SNMPv2e is not a standard version — v2c improved operations but still uses communities without encryption.",
        "misconceptionTested": "Selecting nonstandard v2e for security"
      },
      {
        "choiceIndex": 2,
        "explanation": "SNMPv2c adds 64-bit counters but still uses community strings — only v3 offers authPriv security.",
        "misconceptionTested": "Believing v2c community strings are encrypted"
      }
    ],
    "examTip": "SNMP with **auth + encryption** → **SNMPv3** (not v1/v2c communities)."
  },
  'obj-4.5-source-q003': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "`logging trap 4` sends severity 0–4 (emergency through warning) to the syslog server — warnings are level 4."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`logging server 4` treats 4 as an IP octet or invalid server syntax — trap level uses `logging trap <severity>`.",
        "misconceptionTested": "Using logging server with severity number as address"
      },
      {
        "choiceIndex": 2,
        "explanation": "Severity 5 is notice — warnings are level 4; trap 5 would exclude some warnings depending on interpretation.",
        "misconceptionTested": "Setting trap level 5 when warnings are level 4"
      },
      {
        "choiceIndex": 3,
        "explanation": "`logging server 5` is not the trap-severity command — configure the server IP separately, then `logging trap 4`.",
        "misconceptionTested": "Confusing syslog server IP with trap severity"
      }
    ],
    "examTip": "Send warnings and above → **`logging trap 4`** (0=emerg … 4=warning)."
  },
  'obj-4.6-source-q002': {
    "correct": {
      "choiceIndex": 2,
      "explanation": "The DHCP Offer is sent from the server MAC as the Layer 2 source — L3 may still be broadcast until the client has an IP."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "During DORA the client often has no IP yet — Offer is frequently broadcast at Layer 3, not unicast to client IP.",
        "misconceptionTested": "Expecting unicast L3 Offer before client has address"
      },
      {
        "choiceIndex": 1,
        "explanation": "Layer 2 destination is often broadcast (ff:ff:ff:ff:ff:ff) because the client may not have bound the offered IP yet.",
        "misconceptionTested": "Assuming Offer is always unicast to client MAC"
      },
      {
        "choiceIndex": 3,
        "explanation": "The Layer 3 source is the server address — link-local is not the standard Offer source on IPv4 DHCP.",
        "misconceptionTested": "Claiming Offer L3 source is client link-local"
      }
    ],
    "examTip": "DHCP Offer → **server MAC as L2 source**; L2 dest often **broadcast** pre-ACK."
  },
  'obj-4.7-source-q002': {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Jitter measures variation in inter-packet delay — critical for voice and video QoS."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Bandwidth is capacity (bits per second) — not the time variation between consecutive packets.",
        "misconceptionTested": "Confusing bandwidth with delay variation"
      },
      {
        "choiceIndex": 1,
        "explanation": "Delay is one-way latency — jitter is the **change** in delay between packets.",
        "misconceptionTested": "Equating constant delay with jitter"
      },
      {
        "choiceIndex": 3,
        "explanation": "Packet loss is dropped packets — jitter specifically tracks delay inconsistency.",
        "misconceptionTested": "Selecting loss for delay variation metric"
      }
    ],
    "examTip": "Voice/video QoS watch **jitter** — variation in **packet arrival timing**."
  },
  'obj-4.7-source-q003': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "CoS (3 bits) lives in the 802.1Q tag — it is a Layer 2 marking present only on tagged Ethernet frames."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Layer 3 marking uses IP DSCP/ToS — CoS is the 802.1Q priority field at Layer 2.",
        "misconceptionTested": "Placing CoS at Layer 3 with DSCP"
      },
      {
        "choiceIndex": 2,
        "explanation": "CoS does not survive end-to-end across an IP cloud unchanged — it is a LAN 802.1Q field remapped at trust boundaries.",
        "misconceptionTested": "Believing CoS persists end-to-end over WAN"
      },
      {
        "choiceIndex": 3,
        "explanation": "CoS is 3 bits (0–7) — DSCP is 6 bits in the IP header.",
        "misconceptionTested": "Confusing 6-bit DSCP with 3-bit CoS"
      }
    ],
    "examTip": "CoS = **3-bit 802.1Q tag**; DSCP = **6-bit IP** marking."
  },
  'obj-4.8-source-q003': {
    "correct": {
      "choiceIndex": 2,
      "explanation": "`transport input ssh telnet` under line vty allows SSH with Telnet fallback — configure after generating keys for SSH."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`login ssh telnet` is not valid global config — transport protocols are set under `line vty`.",
        "misconceptionTested": "Configuring transport at global config"
      },
      {
        "choiceIndex": 1,
        "explanation": "`login` controls authentication method — allowed protocols are set with `transport input` on the line.",
        "misconceptionTested": "Using login instead of transport input"
      },
      {
        "choiceIndex": 3,
        "explanation": "`transport input` must be under `config-line` — global `config#transport` is wrong context.",
        "misconceptionTested": "Setting transport input at wrong config level"
      }
    ],
    "examTip": "VTY: **`transport input ssh telnet`** under **`line vty`** (after `ip domain-name` + crypto key)."
  },
}
