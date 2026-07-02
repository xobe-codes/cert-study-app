/** Gold reviews — Batch 11: Wireless 2.6–2.8 + DHCP/DNS/SNMP 4.3–4.4. */
export const BATCH11_GOLD = {
  'obj-2.6-source-q003': {
    "correct": {
      "choiceIndex": 2,
      "explanation": "IBSS (Independent Basic Service Set) is ad hoc wireless — clients connect peer-to-peer without an AP or WLAN infrastructure."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "BSS is a single AP serving clients — it requires infrastructure (an access point), not ad hoc peer mode.",
        "misconceptionTested": "Choosing BSS for infrastructure-free wireless"
      },
      {
        "choiceIndex": 1,
        "explanation": "ESS is multiple APs under one logical network — still infrastructure-based, not ad hoc IBSS.",
        "misconceptionTested": "Selecting ESS for peer-to-peer wireless"
      },
      {
        "choiceIndex": 3,
        "explanation": "DS (Distribution System) is the wired backbone linking APs — not a client connection mode without infrastructure.",
        "misconceptionTested": "Confusing distribution system with ad hoc mode"
      }
    ],
    "examTip": "No AP/infrastructure → **IBSS** (ad hoc); BSS/ESS need access points."
  },
  'obj-2.6-source-q004': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Non-root wireless devices (clients, repeaters in client role) associate with root devices (APs or root bridges) — they do not peer with each other as roots."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Non-root devices do not connect to other non-root devices in standard bridge/repeater topologies — they uplink to a root AP or bridge.",
        "misconceptionTested": "Expecting non-root to non-root peering"
      },
      {
        "choiceIndex": 2,
        "explanation": "Root devices serve as the central point — two root bridges do not connect root-to-root in typical point-to-multipoint designs.",
        "misconceptionTested": "Allowing root-to-root wireless links"
      },
      {
        "choiceIndex": 3,
        "explanation": "Repeaters operate as non-root clients of a root AP — they extend coverage but are not classified as root devices.",
        "misconceptionTested": "Labeling repeaters as root devices"
      }
    ],
    "examTip": "Wireless hierarchy: **non-root** associates **up** to **root** AP/bridge — not root-to-root."
  },
  'obj-2.6-source-q005': {
    "correct": {
      "choiceIndex": 3,
      "explanation": "Autonomous (standalone) APs run full IOS locally and can serve clients without a wireless LAN controller."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Lightweight APs depend on a WLC for control and configuration — they cannot operate independently in lightweight mode.",
        "misconceptionTested": "Expecting lightweight APs to run standalone"
      },
      {
        "choiceIndex": 1,
        "explanation": "A WLC is the controller, not an access point — it manages APs but does not replace an autonomous AP role.",
        "misconceptionTested": "Selecting WLC as independently operating WAP"
      },
      {
        "choiceIndex": 2,
        "explanation": "Mesh APs in a controller-based design still require WLC management — they are not the autonomous standalone model.",
        "misconceptionTested": "Treating mesh AP as autonomous standalone"
      }
    ],
    "examTip": "Standalone operation → **autonomous AP**; lightweight APs need a **WLC**."
  },
  'obj-2.6-source-q006': {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Point-to-multipoint wireless bridges connect multiple nearby buildings (non-root sites) to one central root location across short outdoor links."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Point-to-point links only two endpoints — three buildings to one hub needs point-to-multipoint, not a single P2P span.",
        "misconceptionTested": "Using point-to-point for one-to-many building links"
      },
      {
        "choiceIndex": 1,
        "explanation": "Mesh networks self-form multi-hop coverage for clients — building-to-central backhaul is classic point-to-multipoint bridging.",
        "misconceptionTested": "Choosing mesh for fixed building backhaul"
      },
      {
        "choiceIndex": 3,
        "explanation": "Autonomous WLANs serve indoor clients — outdoor building interconnection uses wireless bridge modes, not autonomous AP service.",
        "misconceptionTested": "Deploying autonomous WLAN for building backhaul"
      }
    ],
    "examTip": "Several buildings → **one central** site = **point-to-multipoint** wireless bridge."
  },
  'obj-2.6-source-q008': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Lightweight (LWAPP/CAPWAP) APs require a wireless LAN controller for control, configuration, and firmware — they cannot run lightweight mode alone."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "BSS is a wireless service set topology term — not an AP type that requires a controller.",
        "misconceptionTested": "Selecting BSS as controller-dependent AP type"
      },
      {
        "choiceIndex": 2,
        "explanation": "Wireless bridges can be autonomous or controller-based — the stem asks specifically for AP type requiring a WLC (lightweight).",
        "misconceptionTested": "Answering bridges when lightweight AP is asked"
      },
      {
        "choiceIndex": 3,
        "explanation": "Autonomous APs operate independently with local IOS — they do not require a WLC.",
        "misconceptionTested": "Expecting autonomous AP to need WLC"
      }
    ],
    "examTip": "**Lightweight AP** = must join a **WLC**; autonomous AP runs standalone."
  },
  'obj-2.6-source-q010': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Local mode tunnels client data traffic to the WLC over CAPWAP — centralized switching at the controller."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "FlexConnect (formerly H-REAP) can switch client traffic locally at the AP — Local mode tunnels data to the WLC, not FlexConnect.",
        "misconceptionTested": "Assigning CAPWAP data tunnel to FlexConnect"
      },
      {
        "choiceIndex": 2,
        "explanation": "Local mode centralizes switching at the WLC — VLAN switching at the WAP describes FlexConnect/local switching, not Local mode.",
        "misconceptionTested": "Crediting Local mode with AP-side VLAN switching"
      },
      {
        "choiceIndex": 3,
        "explanation": "FlexConnect allows local switching at the AP when WAN links are constrained — VLAN switching at the WLC describes Local mode behavior.",
        "misconceptionTested": "Swapping FlexConnect and Local mode roles"
      }
    ],
    "examTip": "**Local mode** = client data **CAPWAP-tunneled to WLC**; **FlexConnect** can switch locally."
  },
  'obj-2.6-depth-q1': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Autonomous APs run full IOS locally and serve clients without joining a wireless LAN controller."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Lightweight APs are CAPWAP-managed by a WLC — they do not run standalone full IOS for client service.",
        "misconceptionTested": "Choosing lightweight AP for standalone IOS"
      },
      {
        "choiceIndex": 2,
        "explanation": "FlexConnect is a lightweight AP operating mode on a WLC — it still requires a controller, unlike autonomous APs.",
        "misconceptionTested": "Treating FlexConnect as WLC-free deployment"
      },
      {
        "choiceIndex": 3,
        "explanation": "Mesh root APs are part of controller-based mesh designs — autonomous standalone is a different architecture.",
        "misconceptionTested": "Selecting mesh root for autonomous standalone"
      }
    ],
    "examTip": "Full local IOS, no WLC → **autonomous AP**; FlexConnect/lightweight need **WLC**."
  },
  'obj-2.7-source-q001': {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Bundle the two Gigabit Ethernet links into an EtherChannel/LAG between router and WLC to aggregate bandwidth beyond a single 1 Gbps uplink."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Routers and WLCs support link aggregation — EtherChannel/LAG is the standard way to combine multiple physical links.",
        "misconceptionTested": "Believing routers cannot aggregate uplinks"
      },
      {
        "choiceIndex": 1,
        "explanation": "RIP is a routing protocol for route exchange — it does not bond physical interfaces or increase Layer 2 bandwidth.",
        "misconceptionTested": "Using routing protocol for link aggregation"
      },
      {
        "choiceIndex": 3,
        "explanation": "Inter-VLAN routing on the WLC does not multiply uplink throughput — more physical bandwidth needs port bundling.",
        "misconceptionTested": "Expecting inter-VLAN routing to add bandwidth"
      }
    ],
    "examTip": "More router↔WLC bandwidth → **EtherChannel/LAG** on spare GigE ports."
  },
  'obj-2.7-source-q002': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "A WLC trunk port carries multiple VLANs (voice, data, management) tagged to the controller — access mode only allows one VLAN."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Access ports carry a single VLAN — multiple segments (voice + data) require a trunk to the WLC.",
        "misconceptionTested": "Using access port for multi-VLAN WLC uplink"
      },
      {
        "choiceIndex": 2,
        "explanation": "Voice VLAN is an access-port feature for phones — the WLC uplink itself should be a trunk carrying all required VLANs.",
        "misconceptionTested": "Configuring voice port instead of WLC trunk"
      },
      {
        "choiceIndex": 3,
        "explanation": "Routed switch ports terminate Layer 3 on the switch — WLC connectivity for multiple client VLANs uses Layer 2 trunks.",
        "misconceptionTested": "Using routed port for WLC multi-VLAN trunk"
      }
    ],
    "examTip": "WLC needs **voice + data VLANs** → configure switch port as **trunk**."
  },
  'obj-2.7-source-q003': {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Cisco WLCs use LAG (Link Aggregation) for port bundling — on non-Cisco switches research their LAG/static EtherChannel equivalent, not LACP/PAgP negotiation with the WLC."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "LACP is IEEE negotiation used between Cisco switches — WLC LAG does not use LACP; it uses static LAG bundling.",
        "misconceptionTested": "Applying LACP to WLC port bundling"
      },
      {
        "choiceIndex": 1,
        "explanation": "PAgP is Cisco proprietary between switches — WLC to switch aggregation uses LAG, not PAgP.",
        "misconceptionTested": "Using PAgP for WLC link aggregation"
      },
      {
        "choiceIndex": 3,
        "explanation": "PortChannel is Cisco switch terminology for the bundle — the non-Cisco side needs LAG/EtherChannel support researched generically as LAG.",
        "misconceptionTested": "Naming Cisco PortChannel instead of cross-vendor LAG"
      }
    ],
    "examTip": "WLC port bundling = **LAG** (static) — not **LACP/PAgP** negotiation."
  },
  'obj-2.7-depth-q1': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "CAPWAP control traffic between lightweight AP and WLC uses UDP port 5246 — UDP 5247 carries CAPWAP data."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "UDP 5247 is CAPWAP **data** tunnel traffic — control/management uses UDP **5246**.",
        "misconceptionTested": "Swapping CAPWAP control and data ports"
      },
      {
        "choiceIndex": 2,
        "explanation": "UDP 69 is TFTP — firmware may use TFTP separately, but CAPWAP control is UDP 5246.",
        "misconceptionTested": "Confusing TFTP port with CAPWAP control"
      },
      {
        "choiceIndex": 3,
        "explanation": "TCP/UDP 443 is HTTPS — CAPWAP control is UDP 5246, not TLS on 443.",
        "misconceptionTested": "Expecting CAPWAP over HTTPS port"
      }
    ],
    "examTip": "CAPWAP ports: **5246 = control**, **5247 = data** (both UDP)."
  },
  'obj-2.7-depth-q2': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Enterprise ceiling APs are typically powered by PoE (802.3af/at/bt) from the access switch — no separate AC outlet needed."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "USB power is not how enterprise ceiling APs are deployed — PoE from the switch is the standard install method.",
        "misconceptionTested": "Expecting USB-only AP power in enterprise"
      },
      {
        "choiceIndex": 2,
        "explanation": "Some SOHO APs use AC adapters — enterprise ceiling mounts rely on PoE from the wiring closet switch.",
        "misconceptionTested": "Choosing external AC for ceiling enterprise AP"
      },
      {
        "choiceIndex": 3,
        "explanation": "Battery backup protects power source continuity — APs still receive primary power via PoE from the switch.",
        "misconceptionTested": "Selecting battery as primary AP power method"
      }
    ],
    "examTip": "Ceiling AP uplink → **PoE** from access switch (802.3af/at); verify wattage budget."
  },
  'obj-2.7-source-q004': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "WLC LAG load-balances traffic across bundled links using a hash of source/destination addresses — not round-robin or FIFO."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Round robin is not how WLC LAG distributes frames — Cisco WLC LAG uses hash-based load balancing per flow.",
        "misconceptionTested": "Expecting round-robin LAG on WLC"
      },
      {
        "choiceIndex": 2,
        "explanation": "FIFO is queuing order — LAG load distribution uses hashing, not first-in-first-out across member links.",
        "misconceptionTested": "Confusing queue discipline with LAG hashing"
      },
      {
        "choiceIndex": 3,
        "explanation": "Spill-and-fill fills one link before using the next — WLC LAG hashes flows across all members simultaneously.",
        "misconceptionTested": "Using spill-and-fill for WLC LAG"
      }
    ],
    "examTip": "WLC **LAG** load balance = **hash-based** (src/dst), not round-robin."
  },
  'obj-2.7-source-q007': {
    "correct": {
      "choiceIndex": 2,
      "explanation": "Controller-based AP switch ports are configured as trunks — they carry management, multiple client VLANs, and sometimes native VLAN for AP management."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Access mode allows only one VLAN — lightweight APs need a trunk to carry multiple WLAN VLANs to the WLC.",
        "misconceptionTested": "Using access port for WLC-managed AP"
      },
      {
        "choiceIndex": 1,
        "explanation": "Wireless port is not standard Cisco switch port terminology — AP uplinks use trunk (or LAG trunk) configuration.",
        "misconceptionTested": "Inventing wireless port type for AP uplink"
      },
      {
        "choiceIndex": 3,
        "explanation": "LAG bundles links but each member is still a trunk — the stem asks port mode for a new WAP, which is trunk before optional LAG.",
        "misconceptionTested": "Choosing LAG instead of trunk mode for AP port"
      }
    ],
    "examTip": "Lightweight AP switch port → **trunk** (multiple VLANs to WLC)."
  },
  'obj-2.8-source-q001': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Telnet provides terminal emulation over TCP — remote CLI access to routers and switches (insecure; SSH preferred)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "SNMP is network management polling/traps — it does not provide interactive terminal emulation.",
        "misconceptionTested": "Using SNMP for terminal emulation"
      },
      {
        "choiceIndex": 2,
        "explanation": "HTTP serves web pages — it is not a CLI terminal emulation protocol like Telnet or SSH.",
        "misconceptionTested": "Selecting HTTP for terminal access"
      },
      {
        "choiceIndex": 3,
        "explanation": "TFTP transfers files on UDP 69 — it does not offer interactive terminal sessions.",
        "misconceptionTested": "Confusing TFTP file transfer with terminal emulation"
      }
    ],
    "examTip": "Terminal emulation over network → **Telnet** (legacy) or **SSH** (secure)."
  },
  'obj-2.8-source-q006': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "WAP debug output appears on the console port by default — connect a serial console cable for real-time debug messages."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "SSH provides remote management — debug output defaults to console unless explicitly redirected to logging.",
        "misconceptionTested": "Expecting SSH as default debug display"
      },
      {
        "choiceIndex": 2,
        "explanation": "Syslog server receives forwarded logs if configured — default debug display is local console, not remote logging.",
        "misconceptionTested": "Assuming debug goes to logging server by default"
      },
      {
        "choiceIndex": 3,
        "explanation": "Local flash stores configs and images — debug messages stream to console, not flash storage by default.",
        "misconceptionTested": "Expecting debug stored in local flash"
      }
    ],
    "examTip": "AP/router debug → watch **console** by default; redirect with `logging` if needed."
  },
  'obj-2.9-source-q001': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "An SSID name can be up to 32 characters — the IEEE 802.11 standard limit for the SSID field."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "16 characters is below the maximum — 802.11 allows SSIDs up to 32 characters.",
        "misconceptionTested": "Underestimating SSID length limit"
      },
      {
        "choiceIndex": 2,
        "explanation": "48 characters exceeds the 802.11 SSID field — maximum is 32 characters.",
        "misconceptionTested": "Overestimating SSID to 48 characters"
      },
      {
        "choiceIndex": 3,
        "explanation": "64 characters is double the allowed SSID length — memorize **32** for CCNA.",
        "misconceptionTested": "Confusing SSID limit with 64-bit WPA key"
      }
    ],
    "examTip": "SSID max length = **32 characters** (802.11); WPA2-PSK passphrase is separate."
  },
  'obj-2.9-source-q004': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "WPAN (Wireless Personal Area Network) covers short range (~10–30 feet) — Bluetooth and similar personal devices."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "WLAN is a local area wireless network (building/campus scale) — not a 30-foot personal bubble.",
        "misconceptionTested": "Labeling short-range personal network as WLAN"
      },
      {
        "choiceIndex": 2,
        "explanation": "WMAN is metropolitan-scale wireless (city coverage) — far larger than 30 feet.",
        "misconceptionTested": "Selecting metropolitan WMAN for 30-foot network"
      },
      {
        "choiceIndex": 3,
        "explanation": "WWAN is wide-area cellular/mobile — not a small personal wireless network.",
        "misconceptionTested": "Confusing WWAN with personal short-range"
      }
    ],
    "examTip": "Short personal range (~30 ft) → **WPAN**; building = **WLAN**; city = **WMAN**."
  },
  'obj-2.8-depth-q1': {
    "correct": {
      "choiceIndex": 2,
      "explanation": "WPA2-Personal uses AES (CCMP) encryption with a pre-shared key passphrase — the CCNA expectation for WPA2-PSK."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "WEP is obsolete and broken — WPA2-Personal requires AES/CCMP, not WEP.",
        "misconceptionTested": "Selecting WEP for WPA2-Personal"
      },
      {
        "choiceIndex": 1,
        "explanation": "TKIP was WPA1-era — WPA2 mandates AES (CCMP); TKIP-only is not WPA2-Personal encryption.",
        "misconceptionTested": "Answering TKIP-only for WPA2"
      },
      {
        "choiceIndex": 3,
        "explanation": "RC4 was used by WEP and early TKIP — WPA2-Personal uses AES block cipher (CCMP).",
        "misconceptionTested": "Associating RC4 stream cipher with WPA2"
      }
    ],
    "examTip": "WPA2-Personal (PSK) → **AES/CCMP** encryption; WEP/TKIP are legacy."
  },
  'obj-2.8-depth-q3': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Same SSID on 2.4 GHz and 5 GHz differs in coverage, interference, and throughput — clients choose one band; encryption can match on both."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Dual-band SSIDs often use the same encryption (e.g., WPA2-AES on both) — the primary difference is RF band characteristics.",
        "misconceptionTested": "Claiming encryption is the only band difference"
      },
      {
        "choiceIndex": 2,
        "explanation": "PSK/passphrase length is a security policy choice — not what fundamentally distinguishes 2.4 vs 5 GHz bands.",
        "misconceptionTested": "Tying PSK length to band selection"
      },
      {
        "choiceIndex": 3,
        "explanation": "CAPWAP tunnels are per-AP to WLC — dual-band SSIDs do not double CAPWAP tunnel count by band name alone.",
        "misconceptionTested": "Linking dual-band SSID to CAPWAP tunnel count"
      }
    ],
    "examTip": "Same SSID, two bands → **range vs speed/interference** (2.4 GHz vs 5 GHz)."
  },
  'obj-4.3-source-q002': {
    "correct": {
      "choiceIndex": 2,
      "explanation": "PTR records map an IPv4 address to an FQDN (reverse DNS) — forward name-to-IP uses A records."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "A records map hostname to IPv4 address (forward DNS) — IP-to-FQDN reverse lookup uses PTR in in-addr.arpa zones.",
        "misconceptionTested": "Using A record for reverse IP-to-name lookup"
      },
      {
        "choiceIndex": 1,
        "explanation": "CNAME is an alias pointing one name to another hostname — it does not perform IP-to-FQDN reverse resolution.",
        "misconceptionTested": "Selecting CNAME for reverse DNS"
      },
      {
        "choiceIndex": 3,
        "explanation": "AAAA records map hostname to IPv6 — reverse IPv4-to-FQDN uses PTR, not AAAA.",
        "misconceptionTested": "Confusing AAAA with IPv4 reverse PTR"
      }
    ],
    "examTip": "IP → name = **PTR** (reverse); name → IP = **A** (forward)."
  },
  'obj-4.3-source-q005': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "A records hold the IPv4 address for a hostname — the primary forward DNS mapping for IPv4 hosts."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "CNAME creates an alias to another DNS name — it does not directly store the IPv4 address.",
        "misconceptionTested": "Using CNAME to store IPv4 address"
      },
      {
        "choiceIndex": 2,
        "explanation": "PTR records map IP to hostname (reverse DNS) — forward hostname-to-IPv4 uses A records.",
        "misconceptionTested": "Selecting PTR for forward IPv4 lookup"
      },
      {
        "choiceIndex": 3,
        "explanation": "AAAA records store IPv6 addresses — IPv4 hostname resolution uses A records.",
        "misconceptionTested": "Choosing AAAA for IPv4 hostname mapping"
      }
    ],
    "examTip": "Hostname → **IPv4** = **A record**; IPv6 = **AAAA**; reverse = **PTR**."
  },
  'obj-4.3-depth-q1': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "DHCP DORA: client **D**iscover → server **O**ffer → client **R**equest → server **A**cknowledge."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Offer before Discover reverses the exchange — the client always broadcasts Discover first.",
        "misconceptionTested": "Starting DORA with server Offer"
      },
      {
        "choiceIndex": 2,
        "explanation": "Request before Discover skips the initial client broadcast — Discover must precede Offer.",
        "misconceptionTested": "Placing Request before Discover"
      },
      {
        "choiceIndex": 3,
        "explanation": "Acknowledge from the client is wrong — DHCPACK is the server's final step after client Request.",
        "misconceptionTested": "Beginning sequence with server Acknowledge"
      }
    ],
    "examTip": "DHCP DORA: **D**iscover → **O**ffer → **R**equest → **A**ck (client starts, server finishes)."
  },
  'obj-4.4-source-q004': {
    "correct": {
      "choiceIndex": 3,
      "explanation": "SNMP trap messages are unsolicited alerts sent from the agent to the NMS when an event occurs (e.g., interface down)."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Get-request is polled by the NMS — traps are agent-initiated without a prior poll when link state changes.",
        "misconceptionTested": "Using Get-request for unsolicited interface-down alert"
      },
      {
        "choiceIndex": 1,
        "explanation": "Get-response replies to a Get-request — interface-down notification is an autonomous trap, not a poll response.",
        "misconceptionTested": "Selecting Get-response for agent-initiated alert"
      },
      {
        "choiceIndex": 2,
        "explanation": "Set-request writes a value from the NMS — link-down events generate traps, not Set operations.",
        "misconceptionTested": "Expecting Set-request for link-down notification"
      }
    ],
    "examTip": "Agent pushes event to NMS without poll → **SNMP trap** (or inform with ack)."
  },
  'obj-4.4-depth-q4': {
    "correct": {
      "choiceIndex": 2,
      "explanation": "SNMPv3 provides user-based authentication and privacy (encryption) — v1 and v2c use only community strings in cleartext."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "SNMPv1 has no encryption and weak security — only cleartext community strings.",
        "misconceptionTested": "Expecting encryption from SNMPv1"
      },
      {
        "choiceIndex": 1,
        "explanation": "SNMPv2c adds 64-bit counters but still sends community strings in cleartext — no encryption.",
        "misconceptionTested": "Believing v2c provides encryption"
      },
      {
        "choiceIndex": 3,
        "explanation": "v1/v2c lack privacy — only SNMPv3 adds authNoPriv or authPriv security levels.",
        "misconceptionTested": "Claiming all SNMP versions encrypt equally"
      }
    ],
    "examTip": "SNMP security: **v3** = auth + encryption; **v1/v2c** = cleartext community."
  },
}
