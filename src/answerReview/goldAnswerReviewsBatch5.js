/** Gold reviews — Batch 5: scenario/sk/source depth toward 200 gold bar. */
export const BATCH5_GOLD = {
  '1.1-ts-device': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Layer 3 switches provide inter-VLAN routing at switching speed; hubs do not segment broadcasts."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Hub\" fails here because layer 3 switches provide inter-VLAN routing at switching speed; hubs do not segment broadcasts.",
        "misconceptionTested": "Applying \"Hub\" when the stem targets objective 1.1 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Wireless LAN controller only\" fails here because layer 3 switches provide inter-VLAN routing at switching speed; hubs do not segment broadcasts.",
        "misconceptionTested": "Applying \"Wireless LAN controller only\" when the stem targets objective 1.1 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Cable modem\" fails here because layer 3 switches provide inter-VLAN routing at switching speed; hubs do not segment broadcasts.",
        "misconceptionTested": "Applying \"Cable modem\" when the stem targets objective 1.1 specifics"
      }
    ],
    "examTip": "Fundamentals trap: verify **layer, address type, and cable counters** before blaming routing."
  },
  '1.10-ts-client': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "APIPA means the client failed DHCP — check automatic addressing and that the DHCP client service is active."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Default gateway manually set\" fails here because aPIPA means the client failed DHCP — check automatic addressing and that the DHCP client service is active.",
        "misconceptionTested": "Applying \"Default gateway manually set to \" when the stem targets objective 1.10 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"DNS suffix on the router\" fails here because aPIPA means the client failed DHCP — check automatic addressing and that the DHCP client service is active.",
        "misconceptionTested": "Applying \"DNS suffix on the router\" when the stem targets objective 1.10 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"OSPF neighbor state\" fails here because aPIPA means the client failed DHCP — check automatic addressing and that the DHCP client service is active.",
        "misconceptionTested": "Applying \"OSPF neighbor state\" when the stem targets objective 1.10 specifics"
      }
    ],
    "examTip": "Fundamentals trap: verify **layer, address type, and cable counters** before blaming routing."
  },
  '1.4-ts-cable': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Runts and CRC errors point to Layer 1/Layer 2 physical signaling problems, commonly bad cabling."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Speed mismatch only\" fails here because runts and CRC errors point to Layer 1/Layer 2 physical signaling problems, commonly bad cabling.",
        "misconceptionTested": "Applying \"Speed mismatch only\" when the stem targets objective 1.4 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Duplicate IP address\" fails here because runts and CRC errors point to Layer 1/Layer 2 physical signaling problems, commonly bad cabling.",
        "misconceptionTested": "Applying \"Duplicate IP address\" when the stem targets objective 1.4 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"STP blocking the port\" fails here because runts and CRC errors point to Layer 1/Layer 2 physical signaling problems, commonly bad cabling.",
        "misconceptionTested": "Applying \"STP blocking the port\" when the stem targets objective 1.4 specifics"
      }
    ],
    "examTip": "Fundamentals trap: verify **layer, address type, and cable counters** before blaming routing."
  },
  '1.6-ts-overlap': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "A /25 gateway does not align with /26 segments carved from the same block — hosts and SVI are in mismatched subnets."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Switch needs `ip routing` di\" fails here because a /25 gateway does not align with /26 segments carved from the same block — hosts and SVI are in mismatched subnets.",
        "misconceptionTested": "Applying \"Switch needs `ip routing` disabl\" when the stem targets objective 1.6 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Hosts need /24 masks\" fails here because a /25 gateway does not align with /26 segments carved from the same block — hosts and SVI are in mismatched subnets.",
        "misconceptionTested": "Applying \"Hosts need /24 masks\" when the stem targets objective 1.6 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Duplicate MAC addresses\" fails here because a /25 gateway does not align with /26 segments carved from the same block — hosts and SVI are in mismatched subnets.",
        "misconceptionTested": "Applying \"Duplicate MAC addresses\" when the stem targets objective 1.6 specifics"
      }
    ],
    "examTip": "Fundamentals trap: verify **layer, address type, and cable counters** before blaming routing."
  },
  '1.9-ts-addrtype': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Link-local addresses (fe80::/10) are required per interface for neighbor discovery on the segment."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Unique local (fc00::/7)\" fails here because link-local addresses (fe80::/10) are required per interface for neighbor discovery on the segment.",
        "misconceptionTested": "Applying \"Unique local (fc00::/7)\" when the stem targets objective 1.9 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Global unicast (2000::/3)\" fails here because link-local addresses (fe80::/10) are required per interface for neighbor discovery on the segment.",
        "misconceptionTested": "Applying \"Global unicast (2000::/3)\" when the stem targets objective 1.9 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Anycast\" fails here because link-local addresses (fe80::/10) are required per interface for neighbor discovery on the segment.",
        "misconceptionTested": "Applying \"Anycast\" when the stem targets objective 1.9 specifics"
      }
    ],
    "examTip": "Fundamentals trap: verify **layer, address type, and cable counters** before blaming routing."
  },
  '2.3-sk-cdp-holdtime': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "The hold-time (default 180 s) is how long a switch keeps a neighbor entry without hearing an update — three advertisement intervals of silence triggers removal."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"The neighbor entry is remove\" fails here because the hold-time (default 180 s) is how long a switch keeps a neighbor entry without hearing an update — three advertisement intervals of silence triggers removal.",
        "misconceptionTested": "Applying \"The neighbor entry is removed im\" when the stem targets objective 2.3 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"CDP disables itself on the i\" fails here because the hold-time (default 180 s) is how long a switch keeps a neighbor entry without hearing an update — three advertisement intervals of silence triggers removal.",
        "misconceptionTested": "Applying \"CDP disables itself on the inter\" when the stem targets objective 2.3 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"The hold-time resets to 60 s\" fails here because the hold-time (default 180 s) is how long a switch keeps a neighbor entry without hearing an update — three advertisement intervals of silence triggers removal.",
        "misconceptionTested": "Applying \"The hold-time resets to 60 secon\" when the stem targets objective 2.3 specifics"
      }
    ],
    "examTip": "Access trap: **VLAN/trunk/native** and **wireless join** issues beat random protocol tweaks."
  },
  '2.3-sk-lldp-txrx': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Unlike CDP, IOS lets you disable LLDP transmit or receive independently per interface. Re-enabling lldp transmit (and lldp receive) on Gi0/1 restores neighbor discovery."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"LLDP requires CDP to also be\" fails here because unlike CDP, IOS lets you disable LLDP transmit or receive independently per interface. Re-enabling lldp transmit (and lldp receive) on Gi0/1 restores neighbor discovery.",
        "misconceptionTested": "Applying \"LLDP requires CDP to also be ena\" when the stem targets objective 2.3 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"LLDP is only supported on ro\" fails here because unlike CDP, IOS lets you disable LLDP transmit or receive independently per interface. Re-enabling lldp transmit (and lldp receive) on Gi0/1 restores neighbor discovery.",
        "misconceptionTested": "Applying \"LLDP is only supported on router\" when the stem targets objective 2.3 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"The neighbor needs `no lldp \" fails here because unlike CDP, IOS lets you disable LLDP transmit or receive independently per interface. Re-enabling lldp transmit (and lldp receive) on Gi0/1 restores neighbor discovery.",
        "misconceptionTested": "Applying \"The neighbor needs `no lldp rece\" when the stem targets objective 2.3 specifics"
      }
    ],
    "examTip": "Access trap: **VLAN/trunk/native** and **wireless join** issues beat random protocol tweaks."
  },
  '2.4-sk-lacp-load': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "show etherchannel load-balance reveals the hashing method (e.g., src-mac, dst-ip). The default is src-mac; port-channel load-balance changes it."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"`show interfaces port-channe\" fails here because show etherchannel load-balance reveals the hashing method (e.g., src-mac, dst-ip). The default is src-mac; port-channel load-balance changes it.",
        "misconceptionTested": "Applying \"`show interfaces port-channel 1 \" when the stem targets objective 2.4 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"`show lacp counters`\" fails here because show etherchannel load-balance reveals the hashing method (e.g., src-mac, dst-ip). The default is src-mac; port-channel load-balance changes it.",
        "misconceptionTested": "Applying \"`show lacp counters`\" when the stem targets objective 2.4 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"`show spanning-tree portchan\" fails here because show etherchannel load-balance reveals the hashing method (e.g., src-mac, dst-ip). The default is src-mac; port-channel load-balance changes it.",
        "misconceptionTested": "Applying \"`show spanning-tree portchannel`\" when the stem targets objective 2.4 specifics"
      }
    ],
    "examTip": "Access trap: **VLAN/trunk/native** and **wireless join** issues beat random protocol tweaks."
  },
  '2.4-sk-lacp-modes': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "on forces the channel without any protocol; active/passive expect LACP PDUs. Mismatching on with active prevents the bundle from forming — both sides must use the same negotiation method (both on, or LACP on both)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Yes — `active` always negoti\" fails here because on forces the channel without any protocol; active/passive expect LACP PDUs. Mismatching on with active prevents the bundle from forming — both sides must use the same negotiation method (both on, or LACP on both).",
        "misconceptionTested": "Applying \"Yes — `active` always negotiates\" when the stem targets objective 2.4 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Yes — LACP `active` falls ba\" fails here because on forces the channel without any protocol; active/passive expect LACP PDUs. Mismatching on with active prevents the bundle from forming — both sides must use the same negotiation method (both on, or LACP on both).",
        "misconceptionTested": "Applying \"Yes — LACP `active` falls back t\" when the stem targets objective 2.4 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"No — both sides must be `act\" fails here because on forces the channel without any protocol; active/passive expect LACP PDUs. Mismatching on with active prevents the bundle from forming — both sides must use the same negotiation method (both on, or LACP on both).",
        "misconceptionTested": "Applying \"No — both sides must be `active`\" when the stem targets objective 2.4 specifics"
      }
    ],
    "examTip": "Access trap: **VLAN/trunk/native** and **wireless join** issues beat random protocol tweaks."
  },
  '2.6-sk-autonomous-vs-lightweight': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Autonomous APs run a full IOS image and are configured individually. Lightweight APs offload control-plane functions (config, firmware, RF management) to a WLC via CAPWAP — enabling centralized management at scale."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Lightweight APs can only run\" fails here because autonomous APs run a full IOS image and are configured individually. Lightweight APs offload control-plane functions (config, firmware, RF management) to a WLC via CAPWAP — enabling centralized management at scale.",
        "misconceptionTested": "Applying \"Lightweight APs can only run 2.4\" when the stem targets objective 2.6 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Autonomous APs use CAPWAP; l\" fails here because autonomous APs run a full IOS image and are configured individually. Lightweight APs offload control-plane functions (config, firmware, RF management) to a WLC via CAPWAP — enabling centralized management at scale.",
        "misconceptionTested": "Applying \"Autonomous APs use CAPWAP; light\" when the stem targets objective 2.6 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Lightweight APs have more fl\" fails here because autonomous APs run a full IOS image and are configured individually. Lightweight APs offload control-plane functions (config, firmware, RF management) to a WLC via CAPWAP — enabling centralized management at scale.",
        "misconceptionTested": "Applying \"Lightweight APs have more flash \" when the stem targets objective 2.6 specifics"
      }
    ],
    "examTip": "Access trap: **VLAN/trunk/native** and **wireless join** issues beat random protocol tweaks."
  },
  '2.6-sk-capwap-arch': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Split MAC splits 802.11 duties: the AP handles real-time RF functions (beacons, probes, ACKs, retransmissions). The WLC handles slower security, authentication, and mobility decisions — reducing AP complexity and enabling centralized policy."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Beacon transmission and prob\" fails here because split MAC splits 802.11 duties: the AP handles real-time RF functions (beacons, probes, ACKs, retransmissions). The WLC handles slower security, authentication, and mobility decisions — reducing AP complexity and enabling centralized policy.",
        "misconceptionTested": "Applying \"Beacon transmission and probe re\" when the stem targets objective 2.6 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Physical RF transmit/receive\" fails here because split MAC splits 802.11 duties: the AP handles real-time RF functions (beacons, probes, ACKs, retransmissions). The WLC handles slower security, authentication, and mobility decisions — reducing AP complexity and enabling centralized policy.",
        "misconceptionTested": "Applying \"Physical RF transmit/receive on \" when the stem targets objective 2.6 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"ACK and retransmission at th\" fails here because split MAC splits 802.11 duties: the AP handles real-time RF functions (beacons, probes, ACKs, retransmissions). The WLC handles slower security, authentication, and mobility decisions — reducing AP complexity and enabling centralized policy.",
        "misconceptionTested": "Applying \"ACK and retransmission at the 80\" when the stem targets objective 2.6 specifics"
      }
    ],
    "examTip": "Access trap: **VLAN/trunk/native** and **wireless join** issues beat random protocol tweaks."
  },
  '2.6-sk-local-vs-monitor': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Local (or connected) mode is the standard mode where an AP serves clients. Monitor mode dedicates the AP to passive RF scanning — ideal for IDS/rogue detection — but it cannot serve any client traffic."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Monitor mode serves one SSID\" fails here because local (or connected) mode is the standard mode where an AP serves clients. Monitor mode dedicates the AP to passive RF scanning — ideal for IDS/rogue detection — but it cannot serve any client traffic.",
        "misconceptionTested": "Applying \"Monitor mode serves one SSID whi\" when the stem targets objective 2.6 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Local mode requires a WLC; m\" fails here because local (or connected) mode is the standard mode where an AP serves clients. Monitor mode dedicates the AP to passive RF scanning — ideal for IDS/rogue detection — but it cannot serve any client traffic.",
        "misconceptionTested": "Applying \"Local mode requires a WLC; monit\" when the stem targets objective 2.6 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Monitor mode is used for mes\" fails here because local (or connected) mode is the standard mode where an AP serves clients. Monitor mode dedicates the AP to passive RF scanning — ideal for IDS/rogue detection — but it cannot serve any client traffic.",
        "misconceptionTested": "Applying \"Monitor mode is used for mesh ba\" when the stem targets objective 2.6 specifics"
      }
    ],
    "examTip": "Access trap: **VLAN/trunk/native** and **wireless join** issues beat random protocol tweaks."
  },
  '2.7-sk-capwap-ports': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "CAPWAP control channel (UDP 5246) carries AP configuration, firmware, and state messages. CAPWAP data channel (UDP 5247) tunnels 802.11 client data frames to the WLC in centralized mode. Firewalls between APs and the WLC must permit both ports."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"UDP 69 (TFTP for images) and\" fails here because cAPWAP control channel (UDP 5246) carries AP configuration, firmware, and state messages. CAPWAP data channel (UDP 5247) tunnels 802.11 client data frames to the WLC in centralized mode. Firewalls between APs and the WLC must permit both ports.",
        "misconceptionTested": "Applying \"UDP 69 (TFTP for images) and UDP\" when the stem targets objective 2.7 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"UDP 4500 (IKE NAT-T) and UDP\" fails here because cAPWAP control channel (UDP 5246) carries AP configuration, firmware, and state messages. CAPWAP data channel (UDP 5247) tunnels 802.11 client data frames to the WLC in centralized mode. Firewalls between APs and the WLC must permit both ports.",
        "misconceptionTested": "Applying \"UDP 4500 (IKE NAT-T) and UDP 500\" when the stem targets objective 2.7 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"UDP 1812 (RADIUS auth) and U\" fails here because cAPWAP control channel (UDP 5246) carries AP configuration, firmware, and state messages. CAPWAP data channel (UDP 5247) tunnels 802.11 client data frames to the WLC in centralized mode. Firewalls between APs and the WLC must permit both ports.",
        "misconceptionTested": "Applying \"UDP 1812 (RADIUS auth) and UDP 1\" when the stem targets objective 2.7 specifics"
      }
    ],
    "examTip": "Access trap: **VLAN/trunk/native** and **wireless join** issues beat random protocol tweaks."
  },
  '2.7-sk-poe': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "PoE (802.3af) and PoE+ (802.3at) eliminate the need for a separate power outlet at each AP location. A single Cat5e/Cat6 cable from a PoE-capable switch delivers both data and power — simplifying physical installation especially in ceilings and walls."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"PoE doubles the throughput o\" fails here because poE (802.3af) and PoE+ (802.3at) eliminate the need for a separate power outlet at each AP location. A single Cat5e/Cat6 cable from a PoE-capable switch delivers both data and power — simplifying physical installation especially in ceilings and walls.",
        "misconceptionTested": "Applying \"PoE doubles the throughput of th\" when the stem targets objective 2.7 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"PoE is required for CAPWAP t\" fails here because poE (802.3af) and PoE+ (802.3at) eliminate the need for a separate power outlet at each AP location. A single Cat5e/Cat6 cable from a PoE-capable switch delivers both data and power — simplifying physical installation especially in ceilings and walls.",
        "misconceptionTested": "Applying \"PoE is required for CAPWAP tunne\" when the stem targets objective 2.7 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"APs require PoE+ only when s\" fails here because poE (802.3af) and PoE+ (802.3at) eliminate the need for a separate power outlet at each AP location. A single Cat5e/Cat6 cable from a PoE-capable switch delivers both data and power — simplifying physical installation especially in ceilings and walls.",
        "misconceptionTested": "Applying \"APs require PoE+ only when servi\" when the stem targets objective 2.7 specifics"
      }
    ],
    "examTip": "Access trap: **VLAN/trunk/native** and **wireless join** issues beat random protocol tweaks."
  },
  '2.8-sk-channel-overlap': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "2.4 GHz has only three non-overlapping channels: 1, 6, and 11 (in North America). Channel 8 overlaps both 6 and 11, causing co-channel and adjacent-channel interference. Move the third AP to channel 11."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"The APs should all use the s\" fails here because 2.4 GHz has only three non-overlapping channels: 1, 6, and 11 (in North America). Channel 8 overlaps both 6 and 11, causing co-channel and adjacent-channel interference. Move the third AP to channel 11.",
        "misconceptionTested": "Applying \"The APs should all use the same \" when the stem targets objective 2.8 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Three APs is too many for 2.\" fails here because 2.4 GHz has only three non-overlapping channels: 1, 6, and 11 (in North America). Channel 8 overlaps both 6 and 11, causing co-channel and adjacent-channel interference. Move the third AP to channel 11.",
        "misconceptionTested": "Applying \"Three APs is too many for 2.4 GH\" when the stem targets objective 2.8 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Channel 1 and 6 are adjacent\" fails here because 2.4 GHz has only three non-overlapping channels: 1, 6, and 11 (in North America). Channel 8 overlaps both 6 and 11, causing co-channel and adjacent-channel interference. Move the third AP to channel 11.",
        "misconceptionTested": "Applying \"Channel 1 and 6 are adjacent and\" when the stem targets objective 2.8 specifics"
      }
    ],
    "examTip": "Access trap: **VLAN/trunk/native** and **wireless join** issues beat random protocol tweaks."
  },
  '2.8-sk-wpa2-vs-wpa3': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "WPA3-Personal uses SAE (Dragonfly handshake) which provides forward secrecy and eliminates offline brute-force of captured handshakes — WPA2-PSK 4-way handshakes can be captured and attacked offline."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"WPA3 uses TKIP instead of AE\" fails here because wPA3-Personal uses SAE (Dragonfly handshake) which provides forward secrecy and eliminates offline brute-force of captured handshakes — WPA2-PSK 4-way handshakes can be captured and attacked offline.",
        "misconceptionTested": "Applying \"WPA3 uses TKIP instead of AES fo\" when the stem targets objective 2.8 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"WPA3 requires a RADIUS serve\" fails here because wPA3-Personal uses SAE (Dragonfly handshake) which provides forward secrecy and eliminates offline brute-force of captured handshakes — WPA2-PSK 4-way handshakes can be captured and attacked offline.",
        "misconceptionTested": "Applying \"WPA3 requires a RADIUS server ev\" when the stem targets objective 2.8 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"WPA3 eliminates the need for\" fails here because wPA3-Personal uses SAE (Dragonfly handshake) which provides forward secrecy and eliminates offline brute-force of captured handshakes — WPA2-PSK 4-way handshakes can be captured and attacked offline.",
        "misconceptionTested": "Applying \"WPA3 eliminates the need for a p\" when the stem targets objective 2.8 specifics"
      }
    ],
    "examTip": "Access trap: **VLAN/trunk/native** and **wireless join** issues beat random protocol tweaks."
  },
  '3.1-sk-ad-bracket': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "The bracket is always [AD/metric]. 110 is OSPF administrative distance; 20 is the OSPF path cost."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "\"OSPF path cost (metric)\" fails here because the bracket is always [AD/metric]. 110 is OSPF administrative distance; 20 is the OSPF path cost.",
        "misconceptionTested": "Applying \"OSPF path cost (metric)\" when the stem targets objective 3.1 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Hop count to destination\" fails here because the bracket is always [AD/metric]. 110 is OSPF administrative distance; 20 is the OSPF path cost.",
        "misconceptionTested": "Applying \"Hop count to destination\" when the stem targets objective 3.1 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Bandwidth in Mbps\" fails here because the bracket is always [AD/metric]. 110 is OSPF administrative distance; 20 is the OSPF path cost.",
        "misconceptionTested": "Applying \"Bandwidth in Mbps\" when the stem targets objective 3.1 specifics"
      }
    ],
    "examTip": "Routing trap: read **`show ip route` brackets** — code, AD, metric — before changing config."
  },
  '3.1-sk-c-vs-l': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "C 192.168.1.0/24 matches any host in the subnet. L 192.168.1.1/32 is the router's own address — used to receive traffic sent directly to R1."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"C = backup, L = primary path\" fails here because c 192.168.1.0/24 matches any host in the subnet. L 192.168.1.1/32 is the router's own address — used to receive traffic sent directly to R1.",
        "misconceptionTested": "Applying \"C = backup, L = primary path\" when the stem targets objective 3.1 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"C = IPv4, L = IPv6 link-loca\" fails here because c 192.168.1.0/24 matches any host in the subnet. L 192.168.1.1/32 is the router's own address — used to receive traffic sent directly to R1.",
        "misconceptionTested": "Applying \"C = IPv4, L = IPv6 link-local\" when the stem targets objective 3.1 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"C = dynamic, L = static\" fails here because c 192.168.1.0/24 matches any host in the subnet. L 192.168.1.1/32 is the router's own address — used to receive traffic sent directly to R1.",
        "misconceptionTested": "Applying \"C = dynamic, L = static\" when the stem targets objective 3.1 specifics"
      }
    ],
    "examTip": "Routing trap: read **`show ip route` brackets** — code, AD, metric — before changing config."
  },
  '3.1-sk-local-route': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "L = local. IOS automatically installs a /32 host route for each interface IP so the router can receive packets addressed directly to it."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "\"A LISP remote endpoint route\" fails here because l = local. IOS automatically installs a /32 host route for each interface IP so the router can receive packets addressed directly to it.",
        "misconceptionTested": "Applying \"A LISP remote endpoint route\" when the stem targets objective 3.1 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"An LACP-learned Layer 2 path\" fails here because l = local. IOS automatically installs a /32 host route for each interface IP so the router can receive packets addressed directly to it.",
        "misconceptionTested": "Applying \"An LACP-learned Layer 2 path\" when the stem targets objective 3.1 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"A link-local IPv6 address\" fails here because l = local. IOS automatically installs a /32 host route for each interface IP so the router can receive packets addressed directly to it.",
        "misconceptionTested": "Applying \"A link-local IPv6 address\" when the stem targets objective 3.1 specifics"
      }
    ],
    "examTip": "Routing trap: read **`show ip route` brackets** — code, AD, metric — before changing config."
  },
  '3.5-ts-vip-unreachable': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Hosts ARP for the virtual IP; the Active router must have the VIP configured on the LAN interface and respond with the HSRP virtual MAC (0000.0c07.acxx)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Disable GLBP on the segment \" fails here because hosts ARP for the virtual IP; the Active router must have the VIP configured on the LAN interface and respond with the HSRP virtual MAC (0000.0c07.acxx).",
        "misconceptionTested": "Applying \"Disable GLBP on the segment — it\" when the stem targets objective 3.5 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Increase HSRP hello interval\" fails here because hosts ARP for the virtual IP; the Active router must have the VIP configured on the LAN interface and respond with the HSRP virtual MAC (0000.0c07.acxx).",
        "misconceptionTested": "Applying \"Increase HSRP hello interval to \" when the stem targets objective 3.5 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Move the VIP to a loopback i\" fails here because hosts ARP for the virtual IP; the Active router must have the VIP configured on the LAN interface and respond with the HSRP virtual MAC (0000.0c07.acxx).",
        "misconceptionTested": "Applying \"Move the VIP to a loopback inter\" when the stem targets objective 3.5 specifics"
      }
    ],
    "examTip": "Routing trap: read **`show ip route` brackets** — code, AD, metric — before changing config."
  },
  '4.3-sk-dhcp-dora': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "DORA: Client broadcasts Discover → server unicasts/broadcasts Offer → client broadcasts Request (choosing the offer) → server sends Acknowledge confirming the lease. Understanding this flow is essential for troubleshooting DHCP failures."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Define, Obtain, Reserve, Ass\" fails here because dORA: Client broadcasts Discover → server unicasts/broadcasts Offer → client broadcasts Request (choosing the offer) → server sends Acknowledge confirming the lease. Understanding this flow is essential for troubleshooting DHCP failures.",
        "misconceptionTested": "Applying \"Define, Obtain, Reserve, Assign \" when the stem targets objective 4.3 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Discover, Offer, Release, Ac\" fails here because dORA: Client broadcasts Discover → server unicasts/broadcasts Offer → client broadcasts Request (choosing the offer) → server sends Acknowledge confirming the lease. Understanding this flow is essential for troubleshooting DHCP failures.",
        "misconceptionTested": "Applying \"Discover, Offer, Release, Acknow\" when the stem targets objective 4.3 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Dynamic, On-demand, Routed, \" fails here because dORA: Client broadcasts Discover → server unicasts/broadcasts Offer → client broadcasts Request (choosing the offer) → server sends Acknowledge confirming the lease. Understanding this flow is essential for troubleshooting DHCP failures.",
        "misconceptionTested": "Applying \"Dynamic, On-demand, Routed, Allo\" when the stem targets objective 4.3 specifics"
      }
    ],
    "examTip": "Services trap: **DHCP/DNS/QoS** failures are often placement or relay — not “server is down.”"
  },
  '4.3-sk-dhcp-relay': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "ip helper-address on the SVI converts client broadcast DHCP Discover messages into unicast packets forwarded to the DHCP server. Without it, broadcasts never leave the local subnet. The command is placed on the interface closest to the client, not the server."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"`ip dhcp relay 10.0.0.5` und\" fails here because ip helper-address on the SVI converts client broadcast DHCP Discover messages into unicast packets forwarded to the DHCP server. Without it, broadcasts never leave the local subnet. The command is placed on the interface closest to the client, not the server.",
        "misconceptionTested": "Applying \"`ip dhcp relay 10.0.0.5` under i\" when the stem targets objective 4.3 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"`ip dhcp-server 10.0.0.5` gl\" fails here because ip helper-address on the SVI converts client broadcast DHCP Discover messages into unicast packets forwarded to the DHCP server. Without it, broadcasts never leave the local subnet. The command is placed on the interface closest to the client, not the server.",
        "misconceptionTested": "Applying \"`ip dhcp-server 10.0.0.5` global\" when the stem targets objective 4.3 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"`ip dhcp pool VLAN20` with `\" fails here because ip helper-address on the SVI converts client broadcast DHCP Discover messages into unicast packets forwarded to the DHCP server. Without it, broadcasts never leave the local subnet. The command is placed on the interface closest to the client, not the server.",
        "misconceptionTested": "Applying \"`ip dhcp pool VLAN20` with `serv\" when the stem targets objective 4.3 specifics"
      }
    ],
    "examTip": "Services trap: **DHCP/DNS/QoS** failures are often placement or relay — not “server is down.”"
  },
  '4.3-sk-dns-record': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "A records map hostnames to IPv4 addresses; AAAA records map to IPv6. MX is for mail routing, PTR for reverse lookup (IP→name), and CNAME creates aliases that ultimately resolve to an A/AAAA record."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"MX record — mail exchanger f\" fails here because a records map hostnames to IPv4 addresses; AAAA records map to IPv6. MX is for mail routing, PTR for reverse lookup (IP→name), and CNAME creates aliases that ultimately resolve to an A/AAAA record.",
        "misconceptionTested": "Applying \"MX record — mail exchanger for t\" when the stem targets objective 4.3 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"PTR record — reverse DNS loo\" fails here because a records map hostnames to IPv4 addresses; AAAA records map to IPv6. MX is for mail routing, PTR for reverse lookup (IP→name), and CNAME creates aliases that ultimately resolve to an A/AAAA record.",
        "misconceptionTested": "Applying \"PTR record — reverse DNS lookup\" when the stem targets objective 4.3 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"CNAME record — canonical nam\" fails here because a records map hostnames to IPv4 addresses; AAAA records map to IPv6. MX is for mail routing, PTR for reverse lookup (IP→name), and CNAME creates aliases that ultimately resolve to an A/AAAA record.",
        "misconceptionTested": "Applying \"CNAME record — canonical name al\" when the stem targets objective 4.3 specifics"
      }
    ],
    "examTip": "Services trap: **DHCP/DNS/QoS** failures are often placement or relay — not “server is down.”"
  },
  '4.5-ts-syslog': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Severity 4 = warnings; many deployments log ≥4 to syslog while filtering noisy debug (7)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Level 7 (Debug)\" fails here because severity 4 = warnings; many deployments log ≥4 to syslog while filtering noisy debug (7).",
        "misconceptionTested": "Applying \"Level 7 (Debug)\" when the stem targets objective 4.5 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Level 0 (Emergency only)\" fails here because severity 4 = warnings; many deployments log ≥4 to syslog while filtering noisy debug (7).",
        "misconceptionTested": "Applying \"Level 0 (Emergency only)\" when the stem targets objective 4.5 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Level 2 (Critical only)\" fails here because severity 4 = warnings; many deployments log ≥4 to syslog while filtering noisy debug (7).",
        "misconceptionTested": "Applying \"Level 2 (Critical only)\" when the stem targets objective 4.5 specifics"
      }
    ],
    "examTip": "Services trap: **DHCP/DNS/QoS** failures are often placement or relay — not “server is down.”"
  },
  '4.7-sk-af-drop': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "In AFxy, x = class (1–4, higher = more preferred class) and y = drop precedence (1–3, higher = dropped sooner under congestion). AF32 (drop precedence 2) is dropped more aggressively than AF31 (drop precedence 1) within the same class 3."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Yes — lower AF class number \" fails here because in AFxy, x = class (1–4, higher = more preferred class) and y = drop precedence (1–3, higher = dropped sooner under congestion). AF32 (drop precedence 2) is dropped more aggressively than AF31 (drop precedence 1) within the same class 3.",
        "misconceptionTested": "Applying \"Yes — lower AF class number mean\" when the stem targets objective 4.7 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Yes — AF31 is dropped first \" fails here because in AFxy, x = class (1–4, higher = more preferred class) and y = drop precedence (1–3, higher = dropped sooner under congestion). AF32 (drop precedence 2) is dropped more aggressively than AF31 (drop precedence 1) within the same class 3.",
        "misconceptionTested": "Applying \"Yes — AF31 is dropped first beca\" when the stem targets objective 4.7 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"No — all AF packets have equ\" fails here because in AFxy, x = class (1–4, higher = more preferred class) and y = drop precedence (1–3, higher = dropped sooner under congestion). AF32 (drop precedence 2) is dropped more aggressively than AF31 (drop precedence 1) within the same class 3.",
        "misconceptionTested": "Applying \"No — all AF packets have equal d\" when the stem targets objective 4.7 specifics"
      }
    ],
    "examTip": "Services trap: **DHCP/DNS/QoS** failures are often placement or relay — not “server is down.”"
  },
  '4.7-sk-classification': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Mark traffic at ingress (access switch or first trusted boundary) so all downstream devices can apply PHB based on the DSCP mark without re-classifying. Re-marking deep in the network wastes CPU and misses early queuing decisions."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Only at the WAN edge router \" fails here because mark traffic at ingress (access switch or first trusted boundary) so all downstream devices can apply PHB based on the DSCP mark without re-classifying. Re-marking deep in the network wastes CPU and misses early queuing decisions.",
        "misconceptionTested": "Applying \"Only at the WAN edge router just\" when the stem targets objective 4.7 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"At the core layer where band\" fails here because mark traffic at ingress (access switch or first trusted boundary) so all downstream devices can apply PHB based on the DSCP mark without re-classifying. Re-marking deep in the network wastes CPU and misses early queuing decisions.",
        "misconceptionTested": "Applying \"At the core layer where bandwidt\" when the stem targets objective 4.7 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Only on the destination devi\" fails here because mark traffic at ingress (access switch or first trusted boundary) so all downstream devices can apply PHB based on the DSCP mark without re-classifying. Re-marking deep in the network wastes CPU and misses early queuing decisions.",
        "misconceptionTested": "Applying \"Only on the destination device a\" when the stem targets objective 4.7 specifics"
      }
    ],
    "examTip": "Services trap: **DHCP/DNS/QoS** failures are often placement or relay — not “server is down.”"
  },
  '4.7-sk-dscp-ef': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "EF (Expedited Forwarding) uses DSCP 46 (binary 101110). It maps to IP Precedence 5 and receives priority queuing for low-latency, low-jitter treatment — the correct marking for VoIP RTP streams."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"40\" fails here because eF (Expedited Forwarding) uses DSCP 46 (binary 101110). It maps to IP Precedence 5 and receives priority queuing for low-latency, low-jitter treatment — the correct marking for VoIP RTP streams.",
        "misconceptionTested": "Applying \"40\" when the stem targets objective 4.7 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"34\" fails here because eF (Expedited Forwarding) uses DSCP 46 (binary 101110). It maps to IP Precedence 5 and receives priority queuing for low-latency, low-jitter treatment — the correct marking for VoIP RTP streams.",
        "misconceptionTested": "Applying \"34\" when the stem targets objective 4.7 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"0\" fails here because eF (Expedited Forwarding) uses DSCP 46 (binary 101110). It maps to IP Precedence 5 and receives priority queuing for low-latency, low-jitter treatment — the correct marking for VoIP RTP streams.",
        "misconceptionTested": "Applying \"0\" when the stem targets objective 4.7 specifics"
      }
    ],
    "examTip": "Services trap: **DHCP/DNS/QoS** failures are often placement or relay — not “server is down.”"
  },
  '4.7-sk-priority-starvation': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Priority (LLQ/PQ) queues are serviced first — if they never empty, other queues starve. The fix is to police voice to a defined rate (e.g., 128 kbps) so bursts cannot monopolize bandwidth while still getting the lowest delay."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Congestion collapse — mitiga\" fails here because priority (LLQ/PQ) queues are serviced first — if they never empty, other queues starve. The fix is to police voice to a defined rate (e.g., 128 kbps) so bursts cannot monopolize bandwidth while still getting the lowest delay.",
        "misconceptionTested": "Applying \"Congestion collapse — mitigated \" when the stem targets objective 4.7 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Tail drop — mitigated by ena\" fails here because priority (LLQ/PQ) queues are serviced first — if they never empty, other queues starve. The fix is to police voice to a defined rate (e.g., 128 kbps) so bursts cannot monopolize bandwidth while still getting the lowest delay.",
        "misconceptionTested": "Applying \"Tail drop — mitigated by enablin\" when the stem targets objective 4.7 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Head-of-line blocking — miti\" fails here because priority (LLQ/PQ) queues are serviced first — if they never empty, other queues starve. The fix is to police voice to a defined rate (e.g., 128 kbps) so bursts cannot monopolize bandwidth while still getting the lowest delay.",
        "misconceptionTested": "Applying \"Head-of-line blocking — mitigate\" when the stem targets objective 4.7 specifics"
      }
    ],
    "examTip": "Services trap: **DHCP/DNS/QoS** failures are often placement or relay — not “server is down.”"
  },
  '4.9-sk-ftp-auth': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "TFTP has no authentication mechanism — it is open by design. FTP requires username and password. SCP (Secure Copy) uses SSH credentials for encrypted, authenticated transfer. On Cisco IOS: copy ftp://user:pass@server/image.bin flash:"
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"TFTP with the `username` key\" fails here because tFTP has no authentication mechanism — it is open by design. FTP requires username and password. SCP (Secure Copy) uses SSH credentials for encrypted, authenticated transfer. On Cisco IOS: copy ftp://user:pass@server/image.bin flash:",
        "misconceptionTested": "Applying \"TFTP with the `username` keyword\" when the stem targets objective 4.9 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"HTTP PUT with no authenticat\" fails here because tFTP has no authentication mechanism — it is open by design. FTP requires username and password. SCP (Secure Copy) uses SSH credentials for encrypted, authenticated transfer. On Cisco IOS: copy ftp://user:pass@server/image.bin flash:",
        "misconceptionTested": "Applying \"HTTP PUT with no authentication \" when the stem targets objective 4.9 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"SNMP v3 write community for \" fails here because tFTP has no authentication mechanism — it is open by design. FTP requires username and password. SCP (Secure Copy) uses SSH credentials for encrypted, authenticated transfer. On Cisco IOS: copy ftp://user:pass@server/image.bin flash:",
        "misconceptionTested": "Applying \"SNMP v3 write community for file\" when the stem targets objective 4.9 specifics"
      }
    ],
    "examTip": "Services trap: **DHCP/DNS/QoS** failures are often placement or relay — not “server is down.”"
  },
  '4.9-sk-ftp-modes': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "In active FTP, the server initiates the data connection back to the client — problematic through NAT/firewalls that block unsolicited inbound connections. In passive FTP, the client initiates both control (port 21) and data connections, working naturally with NAT."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Passive mode uses UDP instea\" fails here because in active FTP, the server initiates the data connection back to the client — problematic through NAT/firewalls that block unsolicited inbound connections. In passive FTP, the client initiates both control (port 21) and data connections, working naturally with NAT.",
        "misconceptionTested": "Applying \"Passive mode uses UDP instead of\" when the stem targets objective 4.9 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Passive mode forces the serv\" fails here because in active FTP, the server initiates the data connection back to the client — problematic through NAT/firewalls that block unsolicited inbound connections. In passive FTP, the client initiates both control (port 21) and data connections, working naturally with NAT.",
        "misconceptionTested": "Applying \"Passive mode forces the server t\" when the stem targets objective 4.9 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Passive mode encrypts the da\" fails here because in active FTP, the server initiates the data connection back to the client — problematic through NAT/firewalls that block unsolicited inbound connections. In passive FTP, the client initiates both control (port 21) and data connections, working naturally with NAT.",
        "misconceptionTested": "Applying \"Passive mode encrypts the data c\" when the stem targets objective 4.9 specifics"
      }
    ],
    "examTip": "Services trap: **DHCP/DNS/QoS** failures are often placement or relay — not “server is down.”"
  },
  '4.9-sk-ios-copy': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "The IOS copy command syntax is copy <source> <destination>. For TFTP to flash: copy tftp: flash: (IOS prompts for server and filename) or the inline URL form shown. Reversing source/destination would copy FROM flash TO the TFTP server — a backup, not an upgrade."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"`copy flash: tftp://10.0.0.1\" fails here because the IOS copy command syntax is copy <source> <destination>. For TFTP to flash: copy tftp: flash: (IOS prompts for server and filename) or the inline URL form shown. Reversing source/destination would copy FROM flash TO the TFTP server — a backup, not an upgrade.",
        "misconceptionTested": "Applying \"`copy flash: tftp://10.0.0.100/c\" when the stem targets objective 4.9 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"`download tftp 10.0.0.100 c2\" fails here because the IOS copy command syntax is copy <source> <destination>. For TFTP to flash: copy tftp: flash: (IOS prompts for server and filename) or the inline URL form shown. Reversing source/destination would copy FROM flash TO the TFTP server — a backup, not an upgrade.",
        "misconceptionTested": "Applying \"`download tftp 10.0.0.100 c2900-\" when the stem targets objective 4.9 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"`transfer ios tftp 10.0.0.10\" fails here because the IOS copy command syntax is copy <source> <destination>. For TFTP to flash: copy tftp: flash: (IOS prompts for server and filename) or the inline URL form shown. Reversing source/destination would copy FROM flash TO the TFTP server — a backup, not an upgrade.",
        "misconceptionTested": "Applying \"`transfer ios tftp 10.0.0.100 c2\" when the stem targets objective 4.9 specifics"
      }
    ],
    "examTip": "Services trap: **DHCP/DNS/QoS** failures are often placement or relay — not “server is down.”"
  },
  '4.9-sk-tftp-port': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "TFTP uses UDP (not TCP) on port 69. UDP is used for simplicity and low overhead — TFTP implements its own basic reliability with acknowledgments. The lack of TCP means no connection setup or encryption, which is why TFTP is only appropriate on trusted LAN segments."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"TCP port 21\" fails here because tFTP uses UDP (not TCP) on port 69. UDP is used for simplicity and low overhead — TFTP implements its own basic reliability with acknowledgments. The lack of TCP means no connection setup or encryption, which is why TFTP is only appropriate on trusted LAN segments.",
        "misconceptionTested": "Applying \"TCP port 21\" when the stem targets objective 4.9 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"TCP port 69\" fails here because tFTP uses UDP (not TCP) on port 69. UDP is used for simplicity and low overhead — TFTP implements its own basic reliability with acknowledgments. The lack of TCP means no connection setup or encryption, which is why TFTP is only appropriate on trusted LAN segments.",
        "misconceptionTested": "Applying \"TCP port 69\" when the stem targets objective 4.9 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"UDP port 21\" fails here because tFTP uses UDP (not TCP) on port 69. UDP is used for simplicity and low overhead — TFTP implements its own basic reliability with acknowledgments. The lack of TCP means no connection setup or encryption, which is why TFTP is only appropriate on trusted LAN segments.",
        "misconceptionTested": "Applying \"UDP port 21\" when the stem targets objective 4.9 specifics"
      }
    ],
    "examTip": "Services trap: **DHCP/DNS/QoS** failures are often placement or relay — not “server is down.”"
  },
  '5.2-sk-phishing': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Phishing is the most common social engineering attack vector. Unlike technical exploits, it targets people. Security awareness training is the primary countermeasure — technical controls alone (spam filters, MFA) reduce but cannot eliminate risk."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Denial of Service — flooding\" fails here because phishing is the most common social engineering attack vector. Unlike technical exploits, it targets people. Security awareness training is the primary countermeasure — technical controls alone (spam filters, MFA) reduce but cannot eliminate risk.",
        "misconceptionTested": "Applying \"Denial of Service — flooding net\" when the stem targets objective 5.2 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Man-in-the-middle — intercep\" fails here because phishing is the most common social engineering attack vector. Unlike technical exploits, it targets people. Security awareness training is the primary countermeasure — technical controls alone (spam filters, MFA) reduce but cannot eliminate risk.",
        "misconceptionTested": "Applying \"Man-in-the-middle — intercepting\" when the stem targets objective 5.2 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"SQL injection — inserting ma\" fails here because phishing is the most common social engineering attack vector. Unlike technical exploits, it targets people. Security awareness training is the primary countermeasure — technical controls alone (spam filters, MFA) reduce but cannot eliminate risk.",
        "misconceptionTested": "Applying \"SQL injection — inserting malici\" when the stem targets objective 5.2 specifics"
      }
    ],
    "examTip": "Security trap: **ACL order, implicit deny, AAA separation** — authentication ≠ authorization."
  },
  '5.2-sk-policy-elements': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Security programs include written policies (AUP, data classification, password) and procedures (Incident Response Plan). The AUP defines what users may do; the IRP provides the step-by-step response to violations. Technical controls enforce policy, but the written documents define the legal and operational framework."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"The spanning-tree configurat\" fails here because security programs include written policies (AUP, data classification, password) and procedures (Incident Response Plan). The AUP defines what users may do; the IRP provides the step-by-step response to violations. Technical controls enforce policy, but the written documents define the legal and operational framework.",
        "misconceptionTested": "Applying \"The spanning-tree configuration \" when the stem targets objective 5.2 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"The NAT overload table showi\" fails here because security programs include written policies (AUP, data classification, password) and procedures (Incident Response Plan). The AUP defines what users may do; the IRP provides the step-by-step response to violations. Technical controls enforce policy, but the written documents define the legal and operational framework.",
        "misconceptionTested": "Applying \"The NAT overload table showing t\" when the stem targets objective 5.2 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"The DHCP lease log confirmin\" fails here because security programs include written policies (AUP, data classification, password) and procedures (Incident Response Plan). The AUP defines what users may do; the IRP provides the step-by-step response to violations. Technical controls enforce policy, but the written documents define the legal and operational framework.",
        "misconceptionTested": "Applying \"The DHCP lease log confirming th\" when the stem targets objective 5.2 specifics"
      }
    ],
    "examTip": "Security trap: **ACL order, implicit deny, AAA separation** — authentication ≠ authorization."
  },
  '5.2-sk-siem': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "A SIEM aggregates syslog, firewall, IDS/IPS, and AAA logs centrally, correlates events across sources, and triggers alerts. Individual firewalls and IPS sensors provide point-in-time protection but cannot detect multi-stage attacks spanning devices without a SIEM."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"IPS (Intrusion Prevention Sy\" fails here because a SIEM aggregates syslog, firewall, IDS/IPS, and AAA logs centrally, correlates events across sources, and triggers alerts. Individual firewalls and IPS sensors provide point-in-time protection but cannot detect multi-stage attacks spanning devices without a SIEM.",
        "misconceptionTested": "Applying \"IPS (Intrusion Prevention System\" when the stem targets objective 5.2 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"AAA server for authenticatio\" fails here because a SIEM aggregates syslog, firewall, IDS/IPS, and AAA logs centrally, correlates events across sources, and triggers alerts. Individual firewalls and IPS sensors provide point-in-time protection but cannot detect multi-stage attacks spanning devices without a SIEM.",
        "misconceptionTested": "Applying \"AAA server for authentication co\" when the stem targets objective 5.2 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Firewall ACL with deny-all d\" fails here because a SIEM aggregates syslog, firewall, IDS/IPS, and AAA logs centrally, correlates events across sources, and triggers alerts. Individual firewalls and IPS sensors provide point-in-time protection but cannot detect multi-stage attacks spanning devices without a SIEM.",
        "misconceptionTested": "Applying \"Firewall ACL with deny-all defau\" when the stem targets objective 5.2 specifics"
      }
    ],
    "examTip": "Security trap: **ACL order, implicit deny, AAA separation** — authentication ≠ authorization."
  },
  '5.2-sk-vuln-vs-threat': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Risk = Threat × Vulnerability × Impact. A vulnerability (e.g., unpatched software) + a threat (e.g., exploit kit) = risk. Security programs reduce risk by patching vulnerabilities, monitoring for threats, and limiting impact through segmentation and controls."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Threat is a weakness; vulner\" fails here because risk = Threat × Vulnerability × Impact. A vulnerability (e.g., unpatched software) + a threat (e.g., exploit kit) = risk. Security programs reduce risk by patching vulnerabilities, monitoring for threats, and limiting impact through segmentation and controls.",
        "misconceptionTested": "Applying \"Threat is a weakness; vulnerabil\" when the stem targets objective 5.2 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Risk and vulnerability are s\" fails here because risk = Threat × Vulnerability × Impact. A vulnerability (e.g., unpatched software) + a threat (e.g., exploit kit) = risk. Security programs reduce risk by patching vulnerabilities, monitoring for threats, and limiting impact through segmentation and controls.",
        "misconceptionTested": "Applying \"Risk and vulnerability are synon\" when the stem targets objective 5.2 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Vulnerability is an attack; \" fails here because risk = Threat × Vulnerability × Impact. A vulnerability (e.g., unpatched software) + a threat (e.g., exploit kit) = risk. Security programs reduce risk by patching vulnerabilities, monitoring for threats, and limiting impact through segmentation and controls.",
        "misconceptionTested": "Applying \"Vulnerability is an attack; thre\" when the stem targets objective 5.2 specifics"
      }
    ],
    "examTip": "Security trap: **ACL order, implicit deny, AAA separation** — authentication ≠ authorization."
  },
  '5.5-ts-placement': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Extended ACLs filtering server-bound traffic should be applied outbound toward the destination."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Add permit ip any any above \" fails here because extended ACLs filtering server-bound traffic should be applied outbound toward the destination.",
        "misconceptionTested": "Applying \"Add permit ip any any above the \" when the stem targets objective 5.5 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Convert to a standard ACL on\" fails here because extended ACLs filtering server-bound traffic should be applied outbound toward the destination.",
        "misconceptionTested": "Applying \"Convert to a standard ACL on Gi0\" when the stem targets objective 5.5 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Apply the same ACL inbound o\" fails here because extended ACLs filtering server-bound traffic should be applied outbound toward the destination.",
        "misconceptionTested": "Applying \"Apply the same ACL inbound on Gi\" when the stem targets objective 5.5 specifics"
      }
    ],
    "examTip": "Security trap: **ACL order, implicit deny, AAA separation** — authentication ≠ authorization."
  },
  '5.7-sk-authen-vs-author': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Authentication verifies identity (who you are). Authorization determines permissions (what you may do). Successfully logging in does not grant all command privileges — a TACACS+ authorization policy or privilege level must permit show running-config."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Authentication — the usernam\" fails here because authentication verifies identity (who you are). Authorization determines permissions (what you may do). Successfully logging in does not grant all command privileges — a TACACS+ authorization policy or privilege level must permit show running-config.",
        "misconceptionTested": "Applying \"Authentication — the username/pa\" when the stem targets objective 5.7 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Accounting — the audit log f\" fails here because authentication verifies identity (who you are). Authorization determines permissions (what you may do). Successfully logging in does not grant all command privileges — a TACACS+ authorization policy or privilege level must permit show running-config.",
        "misconceptionTested": "Applying \"Accounting — the audit log flagg\" when the stem targets objective 5.7 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Neither — show commands are \" fails here because authentication verifies identity (who you are). Authorization determines permissions (what you may do). Successfully logging in does not grant all command privileges — a TACACS+ authorization policy or privilege level must permit show running-config.",
        "misconceptionTested": "Applying \"Neither — show commands are alwa\" when the stem targets objective 5.7 specifics"
      }
    ],
    "examTip": "Security trap: **ACL order, implicit deny, AAA separation** — authentication ≠ authorization."
  },
  '5.7-sk-local-fallback': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Method lists are tried in order: TACACS+ first, then local if the server is unreachable (not responding — not if authentication is explicitly rejected). This fallback ensures management access continues during AAA server outages — a critical design consideration."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"The login is denied immediat\" fails here because method lists are tried in order: TACACS+ first, then local if the server is unreachable (not responding — not if authentication is explicitly rejected). This fallback ensures management access continues during AAA server outages — a critical design consideration.",
        "misconceptionTested": "Applying \"The login is denied immediately \" when the stem targets objective 5.7 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"The router switches to RADIU\" fails here because method lists are tried in order: TACACS+ first, then local if the server is unreachable (not responding — not if authentication is explicitly rejected). This fallback ensures management access continues during AAA server outages — a critical design consideration.",
        "misconceptionTested": "Applying \"The router switches to RADIUS as\" when the stem targets objective 5.7 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"The enable secret is checked\" fails here because method lists are tried in order: TACACS+ first, then local if the server is unreachable (not responding — not if authentication is explicitly rejected). This fallback ensures management access continues during AAA server outages — a critical design consideration.",
        "misconceptionTested": "Applying \"The enable secret is checked ins\" when the stem targets objective 5.7 specifics"
      }
    ],
    "examTip": "Security trap: **ACL order, implicit deny, AAA separation** — authentication ≠ authorization."
  },
  '5.7-sk-radius-vs-tacacs': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Key differences: TACACS+ uses TCP 49 and encrypts the entire packet body; RADIUS uses UDP 1812/1813 and encrypts only the password. TACACS+ separates AA&A fully, making per-command authorization granular — preferred for device administration. RADIUS combines authen+author, preferred for network access (802.1X, VPN)."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"RADIUS uses TCP; TACACS+ use\" fails here because key differences: TACACS+ uses TCP 49 and encrypts the entire packet body; RADIUS uses UDP 1812/1813 and encrypts only the password. TACACS+ separates AA&A fully, making per-command authorization granular — preferred for device administration. RADIUS combines authen+author, preferred for network access (802.1X, VPN).",
        "misconceptionTested": "Applying \"RADIUS uses TCP; TACACS+ uses UD\" when the stem targets objective 5.7 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"TACACS+ encrypts only the pa\" fails here because key differences: TACACS+ uses TCP 49 and encrypts the entire packet body; RADIUS uses UDP 1812/1813 and encrypts only the password. TACACS+ separates AA&A fully, making per-command authorization granular — preferred for device administration. RADIUS combines authen+author, preferred for network access (802.1X, VPN).",
        "misconceptionTested": "Applying \"TACACS+ encrypts only the passwo\" when the stem targets objective 5.7 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Both protocols are identical\" fails here because key differences: TACACS+ uses TCP 49 and encrypts the entire packet body; RADIUS uses UDP 1812/1813 and encrypts only the password. TACACS+ separates AA&A fully, making per-command authorization granular — preferred for device administration. RADIUS combines authen+author, preferred for network access (802.1X, VPN).",
        "misconceptionTested": "Applying \"Both protocols are identical — t\" when the stem targets objective 5.7 specifics"
      }
    ],
    "examTip": "Security trap: **ACL order, implicit deny, AAA separation** — authentication ≠ authorization."
  },
  '5.9-scenario-vlan-map': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Each WLAN binds to a dynamic interface (VLAN). Wrong mapping places clients on the guest VLAN even with correct PSK."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"AP transmit power too high\" fails here because each WLAN binds to a dynamic interface (VLAN). Wrong mapping places clients on the guest VLAN even with correct PSK.",
        "misconceptionTested": "Applying \"AP transmit power too high\" when the stem targets objective 5.9 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"RADIUS shared secret expired\" fails here because each WLAN binds to a dynamic interface (VLAN). Wrong mapping places clients on the guest VLAN even with correct PSK.",
        "misconceptionTested": "Applying \"RADIUS shared secret expired\" when the stem targets objective 5.9 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"CAPWAP control path blocked\" fails here because each WLAN binds to a dynamic interface (VLAN). Wrong mapping places clients on the guest VLAN even with correct PSK.",
        "misconceptionTested": "Applying \"CAPWAP control path blocked\" when the stem targets objective 5.9 specifics"
      }
    ],
    "examTip": "Security trap: **ACL order, implicit deny, AAA separation** — authentication ≠ authorization."
  },
  '5.9-ts-psk-mismatch': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "PSK mismatch is the #1 WPA2-Personal failure — verify the exact key on the WLAN matches what users enter."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Clients must use WEP for thi\" fails here because pSK mismatch is the #1 WPA2-Personal failure — verify the exact key on the WLAN matches what users enter.",
        "misconceptionTested": "Applying \"Clients must use WEP for this SS\" when the stem targets objective 5.9 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"AP channel width must be 160\" fails here because pSK mismatch is the #1 WPA2-Personal failure — verify the exact key on the WLAN matches what users enter.",
        "misconceptionTested": "Applying \"AP channel width must be 160 MHz\" when the stem targets objective 5.9 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Disable AES — TKIP only is r\" fails here because pSK mismatch is the #1 WPA2-Personal failure — verify the exact key on the WLAN matches what users enter.",
        "misconceptionTested": "Applying \"Disable AES — TKIP only is requi\" when the stem targets objective 5.9 specifics"
      }
    ],
    "examTip": "Security trap: **ACL order, implicit deny, AAA separation** — authentication ≠ authorization."
  },
  '6.1-scenario-idempotent': {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Idempotent automation converges devices to desired state without duplicating config on re-run."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "\"Spanning-tree root guard\" fails here because idempotent automation converges devices to desired state without duplicating config on re-run.",
        "misconceptionTested": "Applying \"Spanning-tree root guard\" when the stem targets objective 6.1 specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"NAT overload\" fails here because idempotent automation converges devices to desired state without duplicating config on re-run.",
        "misconceptionTested": "Applying \"NAT overload\" when the stem targets objective 6.1 specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"HSRP preempt\" fails here because idempotent automation converges devices to desired state without duplicating config on re-run.",
        "misconceptionTested": "Applying \"HSRP preempt\" when the stem targets objective 6.1 specifics"
      }
    ],
    "examTip": "Automation trap: **idempotent, API-driven, controller-based** — not manual box-by-box CLI."
  },
  'obj-2.3-source-q001': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "LLDP is IEEE 802.1AB and provides standards-based neighbor discovery."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "\"CDP\" fails here because lLDP is IEEE 802.1AB and provides standards-based neighbor discovery.",
        "misconceptionTested": "Applying \"CDP\" when the stem targets objective ? specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"802.1b\" fails here because lLDP is IEEE 802.1AB and provides standards-based neighbor discovery.",
        "misconceptionTested": "Applying \"802.1b\" when the stem targets objective ? specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"802.1a\" fails here because lLDP is IEEE 802.1AB and provides standards-based neighbor discovery.",
        "misconceptionTested": "Applying \"802.1a\" when the stem targets objective ? specifics"
      }
    ],
    "examTip": "Fundamentals trap: verify **layer, address type, and cable counters** before blaming routing."
  },
  'obj-2.3-source-q002': {
    "correct": {
      "choiceIndex": 3,
      "explanation": "no cdp run disables CDP globally."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "\"Switch(config)#cdp disable\" fails here because no cdp run disables CDP globally.",
        "misconceptionTested": "Applying \"Switch(config)#cdp disable\" when the stem targets objective ? specifics"
      },
      {
        "choiceIndex": 1,
        "explanation": "\"Switch(config-if)#no cdp ena\" fails here because no cdp run disables CDP globally.",
        "misconceptionTested": "Applying \"Switch(config-if)#no cdp enable\" when the stem targets objective ? specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Switch(config)#no cdp\" fails here because no cdp run disables CDP globally.",
        "misconceptionTested": "Applying \"Switch(config)#no cdp\" when the stem targets objective ? specifics"
      }
    ],
    "examTip": "Fundamentals trap: verify **layer, address type, and cable counters** before blaming routing."
  },
  'obj-2.3-source-q003': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "CDP advertises every 60 seconds by default."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "\"Every 30 seconds\" fails here because cDP advertises every 60 seconds by default.",
        "misconceptionTested": "Applying \"Every 30 seconds\" when the stem targets objective ? specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Every 90 seconds\" fails here because cDP advertises every 60 seconds by default.",
        "misconceptionTested": "Applying \"Every 90 seconds\" when the stem targets objective ? specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Every 180 seconds\" fails here because cDP advertises every 60 seconds by default.",
        "misconceptionTested": "Applying \"Every 180 seconds\" when the stem targets objective ? specifics"
      }
    ],
    "examTip": "Fundamentals trap: verify **layer, address type, and cable counters** before blaming routing."
  },
  'obj-2.3-source-q004': {
    "correct": {
      "choiceIndex": 2,
      "explanation": "CDP is Cisco proprietary neighbor discovery."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "\"802.1ab\" fails here because cDP is Cisco proprietary neighbor discovery.",
        "misconceptionTested": "Applying \"802.1ab\" when the stem targets objective ? specifics"
      },
      {
        "choiceIndex": 1,
        "explanation": "\"LLDP\" fails here because cDP is Cisco proprietary neighbor discovery.",
        "misconceptionTested": "Applying \"LLDP\" when the stem targets objective ? specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"802.1a\" fails here because cDP is Cisco proprietary neighbor discovery.",
        "misconceptionTested": "Applying \"802.1a\" when the stem targets objective ? specifics"
      }
    ],
    "examTip": "Fundamentals trap: verify **layer, address type, and cable counters** before blaming routing."
  },
  'obj-2.3-source-q005': {
    "correct": {
      "choiceIndex": 3,
      "explanation": "CDP holdtime defaults to 180 seconds."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "\"30 seconds\" fails here because cDP holdtime defaults to 180 seconds.",
        "misconceptionTested": "Applying \"30 seconds\" when the stem targets objective ? specifics"
      },
      {
        "choiceIndex": 1,
        "explanation": "\"60 seconds\" fails here because cDP holdtime defaults to 180 seconds.",
        "misconceptionTested": "Applying \"60 seconds\" when the stem targets objective ? specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"90 seconds\" fails here because cDP holdtime defaults to 180 seconds.",
        "misconceptionTested": "Applying \"90 seconds\" when the stem targets objective ? specifics"
      }
    ],
    "examTip": "Fundamentals trap: verify **layer, address type, and cable counters** before blaming routing."
  },
  'obj-2.3-source-q006': {
    "correct": {
      "choiceIndex": 1,
      "explanation": "no cdp enable disables CDP on one interface."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "\"Switch(config)#cdp disable\" fails here because no cdp enable disables CDP on one interface.",
        "misconceptionTested": "Applying \"Switch(config)#cdp disable\" when the stem targets objective ? specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Switch(config)#no cdp\" fails here because no cdp enable disables CDP on one interface.",
        "misconceptionTested": "Applying \"Switch(config)#no cdp\" when the stem targets objective ? specifics"
      },
      {
        "choiceIndex": 3,
        "explanation": "\"Switch(config-if)#no cdp run\" fails here because no cdp enable disables CDP on one interface.",
        "misconceptionTested": "Applying \"Switch(config-if)#no cdp run\" when the stem targets objective ? specifics"
      }
    ],
    "examTip": "Fundamentals trap: verify **layer, address type, and cable counters** before blaming routing."
  },
  'obj-2.3-source-q007': {
    "correct": {
      "choiceIndex": 3,
      "explanation": "show cdp entry * gives detailed CDP neighbor information."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "\"Switch#sh cdp neighbors all\" fails here because show cdp entry * gives detailed CDP neighbor information.",
        "misconceptionTested": "Applying \"Switch#sh cdp neighbors all\" when the stem targets objective ? specifics"
      },
      {
        "choiceIndex": 1,
        "explanation": "\"Switch#sh cdp neighbors *\" fails here because show cdp entry * gives detailed CDP neighbor information.",
        "misconceptionTested": "Applying \"Switch#sh cdp neighbors *\" when the stem targets objective ? specifics"
      },
      {
        "choiceIndex": 2,
        "explanation": "\"Switch#sh cdp entries all\" fails here because show cdp entry * gives detailed CDP neighbor information.",
        "misconceptionTested": "Applying \"Switch#sh cdp entries all\" when the stem targets objective ? specifics"
      }
    ],
    "examTip": "Fundamentals trap: verify **layer, address type, and cable counters** before blaming routing."
  },
}
