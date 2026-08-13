export const LESSON_ALIGNMENT_WAVE12_PATCHES = {
  "1.1": {
    "reading": {
      "tiers": {
        "beginner": "Network components (routers, switches, firewalls, APs, controllers) shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "1.2": {
    "reading": {
      "tiers": {
        "beginner": "Network topology architectures shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "1.7": {
    "reading": {
      "bigTakeaway": "Master Describe private IPv4 addressing: know the behavior, the exam trap, and how to verify it."
    }
  },
  "1.10": {
    "reading": {
      "tiers": {
        "beginner": "Verify IP parameters for client OS shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "1.11": {
    "reading": {
      "tiers": {
        "beginner": "Describe wireless principles shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "1.12": {
    "reading": {
      "tiers": {
        "beginner": "Explain virtualization fundamentals shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "2.1": {
    "reading": {
      "bigTakeaway": "Master Configure and verify VLANs: know the behavior, the exam trap, and how to verify it."
    }
  },
  "2.2": {
    "reading": {
      "bigTakeaway": "Master Configure and verify interswitch connectivity (trunking): know the behavior, the exam trap, and how to verify it."
    }
  },
  "2.3": {
    "flashcards": [
      {
        "id": "2.3-align-f1",
        "ckuId": "CKU-LAYER2-DISCOVERY",
        "front": "What should you remember about Layer2 Discovery?",
        "back": "**Exam cue:** CDP neighbor detail (SwitchB): Device ID: SwitchB Entry address(es): IP 192.168.1.2 Platform: cisco WS-C2960, Capabilities: Switch Interface: Gigabit… **Key response:** Switch B interface Gi0/2 connects to Switch A.. **Why:** The Interface field shows the local port receiving CDP (Gi0/2 on this switch) — it connects to the neighbor's Port ID (Gi0/1 on SwitchB)."
      },
      {
        "id": "2.3-align-f2",
        "ckuId": "CKU-CDP-INTERFACE",
        "front": "What should you remember about Cdp Interface?",
        "back": "**Exam cue:** You have a layer 2 connection to your ISP. You want to make sure that you do not send information on the capabilities of your switch, but you don’t w… **Key response:** Switch(config-if)#no cdp enable. **Why:** no cdp enable on the ISP-facing interface stops CDP advertisements on that link only — CDP remains active on other ports."
      },
      {
        "id": "2.3-align-f3",
        "ckuId": "CKU-CDP-HOLDTIME",
        "front": "What should you remember about Cdp Holdtime?",
        "back": "**Exam cue:** What is the default value of the CDP holddown timer for CDP entries? **Key response:** 180 seconds. **Why:** CDP holdtime defaults to 180 seconds."
      },
      {
        "id": "2.3-align-f4",
        "ckuId": "CKU-CDP-OUTPUT-INTERPRETATION",
        "front": "What should you remember about Cdp Output Interpretation?",
        "back": "**Exam cue:** CDP neighbor detail (SwitchB): Device ID: SwitchB Entry address(es): IP 192.168.1.2 Platform: cisco WS-C2960, Capabilities: Switch Interface: Gigabit… **Key response:** Switch B interface Gi0/2 connects to Switch A.. **Why:** The Interface field shows the local port receiving CDP (Gi0/2 on this switch) — it connects to the neighbor's Port ID (Gi0/1 on SwitchB)."
      },
      {
        "id": "2.3-align-f5",
        "ckuId": "CKU-CDP-TIMER",
        "front": "What should you remember about Cdp Timer?",
        "back": "**Exam cue:** How often are CDP frames sent out of the device by default? **Key response:** Every 60 seconds. **Why:** CDP advertises every 60 seconds by default."
      },
      {
        "id": "2.3-align-f6",
        "ckuId": "CKU-IEEE-802.1AB",
        "front": "What should you remember about Ieee 802.1ab?",
        "back": "**Exam cue:** Which protocol is an IEEE standard that collects information from neighboring devices on their identity and capabilities? **Key response:** LLDP. **Why:** LLDP (IEEE 802.1AB) is the vendor-neutral neighbor discovery standard — CDP is Cisco-proprietary."
      },
      {
        "id": "2.3-align-f7",
        "ckuId": "CKU-LLDP-HOLDTIME",
        "front": "What should you remember about Lldp Holdtime?",
        "back": "**Exam cue:** What is the default value of the LLDP holddown timer for entries? **Key response:** 120 seconds. **Why:** LLDP neighbor entries expire after a default holdtime of 120 seconds if no fresh advertisement is received."
      },
      {
        "id": "2.3-align-f8",
        "ckuId": "CKU-LLDP-MED",
        "front": "What should you remember about Lldp Med?",
        "back": "**Exam cue:** You have several non-Cisco IP phones and you want to allow automatic power adjustments on the Cisco Power over an Ethernet (PoE) switch. **Key response:** Switch(config)#lldp run. **Why:** LLDP-MED for non-Cisco phones requires global lldp run from configuration mode so the switch can negotiate power and capabilities."
      },
      {
        "id": "2.3-align-f9",
        "ckuId": "CKU-LLDP-TIMER",
        "front": "What should you remember about Lldp Timer?",
        "back": "**Exam cue:** What is the default LLDP advertisement interval? **Key response:** 30 seconds. **Why:** LLDP sends neighbor advertisements every 30 seconds by default — faster than CDP's 60-second interval."
      },
      {
        "id": "2.3-align-f10",
        "ckuId": "CKU-LLDP-TRANSMIT",
        "front": "What should you remember about Lldp Transmit?",
        "back": "**Exam cue:** You want to disable LLDP from sending advertisements on a single interface. Which command will you use? **Key response:** Switch(config-if)#no lldp transmit. **Why:** no lldp transmit on the interface stops outgoing LLDP advertisements on that port while leaving LLDP active elsewhere."
      },
      {
        "id": "2.3-align-f11",
        "ckuId": "CKU-NO-CDP-RUN",
        "front": "What should you remember about No Cdp Run?",
        "back": "**Exam cue:** You want to turn off CDP on a switch. Which command would you enter? **Key response:** Switch(config)#no cdp run. **Why:** no cdp run disables CDP globally (global config — not interface mode)."
      },
      {
        "id": "2.3-align-f12",
        "ckuId": "CKU-SHOW-CDP-INTERFACE",
        "front": "What should you remember about Show Cdp Interface?",
        "back": "**Exam cue:** Which command will show the interfaces that CDP is advertising on? **Key response:** Switch#show cdp interface. **Why:** show cdp interface lists interfaces where CDP is enabled and their CDP parameters."
      },
      {
        "id": "2.3-align-f13",
        "ckuId": "CKU-SHOW-CDP-NEIGHBORS-DETAIL",
        "front": "What should you remember about Show Cdp Neighbors Detail?",
        "back": "**Exam cue:** Which command gives information that’s identical to the output of the show cdp neighbors detail command? **Key response:** Switch#sh cdp entry *. **Why:** show cdp entry * gives detailed CDP neighbor information."
      },
      {
        "id": "2.3-align-f14",
        "ckuId": "CKU-SHOW-LLDP-NEIGHBORS",
        "front": "What should you remember about Show Lldp Neighbors?",
        "back": "**Exam cue:** Which command will allow you to see LLDP devices connected to a switch? **Key response:** Switch#show lldp neighbor detail. **Why:** show lldp neighbor detail displays LLDP-discovered neighbors, capabilities, and connected interfaces."
      }
    ],
    "reading": {
      "tiers": {
        "beginner": "Configure and verify Layer 2 discovery protocols (CDP/LLDP) shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "2.4": {
    "flashcards": [
      {
        "id": "2.4-align-f1",
        "ckuId": "CKU-PAGP",
        "front": "What should you remember about Pagp?",
        "back": "**Exam cue:** What is the maximum number of interfaces that can be aggregated with EtherChannel and LACP? **Key response:** 16 interfaces. **Why:** LACP supports up to 16 interfaces per bundle (8 active + 8 hot-standby)."
      },
      {
        "id": "2.4-align-f2",
        "ckuId": "CKU-ETHERCHANNEL-MAX-LINKS",
        "front": "What should you remember about Etherchannel Max Links?",
        "back": "**Exam cue:** What is the maximum number of interfaces that can be aggregated with EtherChannel and LACP? **Key response:** 16 interfaces. **Why:** LACP supports up to 16 interfaces per bundle (8 active + 8 hot-standby)."
      },
      {
        "id": "2.4-align-f3",
        "ckuId": "CKU-ON-MODE",
        "front": "What should you remember about On Mode?",
        "back": "**Exam cue:** Which mode forces the aggregation of links without the use of a control protocol? **Key response:** On mode. **Why:** Channel-group mode on forces the bundle without LACP or PAgP — both sides must match on."
      },
      {
        "id": "2.4-align-f4",
        "ckuId": "CKU-ACTIVE-MODE",
        "front": "What should you remember about Active Mode?",
        "back": "**Exam cue:** You want to configure two switches so that LACP is used between the switches. Which mode should you use on both sides to force LACP? **Key response:** Active mode on both sides. **Why:** LACP requires at least one side in active mode to start negotiation — active on both sides guarantees LACP forms."
      },
      {
        "id": "2.4-align-f5",
        "ckuId": "CKU-ACTIVE-PASSIVE",
        "front": "What should you remember about Active Passive?",
        "back": "**Exam cue:** What is the effect of configuring a port channel with one side set to passive mode and the other side set to active mode? **Key response:** The channel group will use LACP.. **Why:** Passive + active on both sides forms an LACP (802.3ad) EtherChannel — passive waits, active initiates."
      },
      {
        "id": "2.4-align-f6",
        "ckuId": "CKU-NON-CISCO",
        "front": "What should you remember about Non Cisco?",
        "back": "**Exam cue:** You need to form an EtherChannel between a VMware ESXi host and the switch. Which negotiation protocol will you choose? **Key response:** LACP. **Why:** LACP (802.3ad) is the IEEE standard — VMware ESXi and third-party hosts require LACP, not Cisco PAgP."
      },
      {
        "id": "2.4-align-f7",
        "ckuId": "CKU-PAGP-TIMER",
        "front": "What should you remember about Pagp Timer?",
        "back": "**Exam cue:** How often does PAgP send messages to control the status of the links in the bundle? **Key response:** Every 30 seconds. **Why:** PAgP sends control messages every 30 seconds to maintain bundle status."
      },
      {
        "id": "2.4-align-f8",
        "ckuId": "CKU-PASSIVE-PASSIVE",
        "front": "What should you remember about Passive Passive?",
        "back": "**Exam cue:** What is the effect of configuring a port channel with one side set to passive mode and the other side set to passive mode? **Key response:** The channel group will not be formed.. **Why:** LACP passive on both sides means neither initiates — no PDUs are exchanged, so the port channel never forms."
      },
      {
        "id": "2.4-align-f9",
        "ckuId": "CKU-SAME-SPEED-DUPLEX",
        "front": "What should you remember about Same Speed Duplex?",
        "back": "**Exam cue:** You have a switch with 2 gigabit interface ports and 48 FastEthernet ports and are using PAgP. What is the highest bandwidth you can achieve? **Key response:** 2 Gb/s. **Why:** EtherChannel members must match speed and duplex — only the two gigabit ports can bundle, giving 2 Gb/s aggregate with PAgP."
      },
      {
        "id": "2.4-align-f10",
        "ckuId": "CKU-SHOW-ETHERCHANNEL",
        "front": "What should you remember about Show Etherchannel?",
        "back": "**Exam cue:** Which command is used to verify the negotiation protocol for a port channel? **Key response:** Switch#show etherchannel. **Why:** show etherchannel displays protocol (LACP/PAgP), port state, and bundle summary."
      }
    ],
    "reading": {
      "bigTakeaway": "Master Configure and verify EtherChannel (LACP): know the behavior, the exam trap, and how to verify it.",
      "tiers": {
        "beginner": "Configure and verify EtherChannel (LACP) shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "2.5": {
    "flashcards": [
      {
        "id": "2.5-align-f1",
        "ckuId": "CKU-RAPID-PVST",
        "front": "What should you remember about Rapid Pvst?",
        "back": "**Exam cue:** What is the IEEE specification for Spanning Tree Protocol (STP)? **Key response:** 802.1D. **Why:** Classic STP is IEEE 802.1D — the original spanning-tree standard (convergence ~30–50 s)."
      },
      {
        "id": "2.5-align-f2",
        "ckuId": "CKU-RSTP",
        "front": "What should you remember about Rstp?",
        "back": "**Exam cue:** What is the IEEE specification for Spanning Tree Protocol (STP)? **Key response:** 802.1D. **Why:** Classic STP is IEEE 802.1D — the original spanning-tree standard (convergence ~30–50 s)."
      },
      {
        "id": "2.5-align-f3",
        "ckuId": "CKU-BPDU-GUARD",
        "front": "What should you remember about Bpdu Guard?",
        "back": "**Exam cue:** Which feature will protect a switch immediately if it sees another switch’s advertisement? **Key response:** BPDU Guard. **Why:** BPDU Guard err-disables the port immediately upon receiving a BPDU — protects against rogue switches."
      },
      {
        "id": "2.5-align-f4",
        "ckuId": "CKU-PORTFAST",
        "front": "What should you remember about Portfast?",
        "back": "**Exam cue:** You receive a call that when computers boot up, they display an error message stating that they cannot reach a domain controller. **Key response:** SwitchA(config-if)#spanning-tree portfast. **Why:** Enable PortFast on the specific access interface with spanning-tree portfast — speeds edge port to forwarding so DHCP/domain join is not delayed by STP convergence."
      },
      {
        "id": "2.5-align-f5",
        "ckuId": "CKU-ERRDISABLE",
        "front": "What should you remember about Errdisable?",
        "back": "**Exam cue:** You have BPDU Guard configured on an interface. What happens if a BPDU is advertised on the interface? **Key response:** The interface will become err-disabled.. **Why:** BPDU Guard places the port in err-disabled state upon receiving a BPDU — requires manual recovery or errdisable recovery timer."
      },
      {
        "id": "2.5-align-f6",
        "ckuId": "CKU-LAYER2-LOOPS",
        "front": "What should you remember about Layer2 Loops?",
        "back": "**Exam cue:** What will happen if you plug a hub into two ports on the same switch configured with PortFast on all the interfaces? **Key response:** You will create a temporary switching loop.. **Why:** A hub connected to two PortFast ports creates a temporary L2 loop — both ports forward simultaneously until STP detects and blocks."
      },
      {
        "id": "2.5-align-f7",
        "ckuId": "CKU-SHOW-SPANNING-TREE-INTERFACE",
        "front": "What should you remember about Show Spanning Tree Interface?",
        "back": "**Exam cue:** Which command will show you if a port has been configured for PortFast mode? **Key response:** Switch#show spanning-tree interface fa 0/1. **Why:** show spanning-tree interface fa 0/1 shows per-port STP detail including PortFast status."
      }
    ]
  },
  "2.6": {
    "flashcards": [
      {
        "id": "2.6-align-f1",
        "ckuId": "CKU-AUTONOMOUS-AP",
        "front": "What is an autonomous AP?",
        "back": "A standalone AP with local configuration and local switching — no CAPWAP dependency on a WLC."
      },
      {
        "id": "2.6-align-f2",
        "ckuId": "CKU-LIGHTWEIGHT-AP",
        "front": "What is a lightweight AP?",
        "back": "An AP that joins a WLC over CAPWAP; the controller manages WLAN policy/RF (and often client data in Local mode)."
      },
      {
        "id": "2.6-align-f3",
        "ckuId": "CKU-WIRELESS-ARCHITECTURES",
        "front": "Autonomous vs controller-based WLAN?",
        "back": "Autonomous = per-AP control. Controller-based = lightweight APs + WLC (CAPWAP) for centralized policy and scale."
      },
      {
        "id": "2.6-align-f4",
        "ckuId": "CKU-WLC",
        "front": "What should you remember about Wlc?",
        "back": "**Exam cue:** You require a density of 100 wireless clients in a relatively small area. Which design would be optimal? **Key response:** Lightweight WAPs with a WLC. **Why:** High client density in a small area needs lightweight APs with centralized RF management from a WLC — optimal for scale and control."
      },
      {
        "id": "2.6-align-f5",
        "ckuId": "CKU-FLEXCONNECT",
        "front": "FlexConnect vs Local mode?",
        "back": "Local mode central-switches client data at the WLC. FlexConnect can switch client data locally at the AP/branch (useful for WAN-edge sites)."
      },
      {
        "id": "2.6-align-f6",
        "ckuId": "CKU-IBSS",
        "front": "What should you remember about Ibss?",
        "back": "**Exam cue:** Which wireless mode allows for a network connection without a wireless infrastructure in place? **Key response:** IBSS. **Why:** IBSS (Independent Basic Service Set) is ad hoc wireless — clients connect peer-to-peer without an AP or WLAN infrastructure."
      },
      {
        "id": "2.6-align-f7",
        "ckuId": "CKU-LOCAL-MODE",
        "front": "What does Local mode do with client data?",
        "back": "Tunnels client data to the WLC over CAPWAP for centralized switching at the controller."
      },
      {
        "id": "2.6-align-f8",
        "ckuId": "CKU-MESH",
        "front": "What should you remember about Mesh?",
        "back": "**Exam cue:** You need to cover a large public area with high speed wireless coverage. Many of the areas are too far away from the wired switching equipment. **Key response:** Mesh wireless network. **Why:** A mesh wireless network lets APs wirelessly backhaul where Ethernet cannot reach — ideal for large areas far from switches."
      },
      {
        "id": "2.6-align-f9",
        "ckuId": "CKU-MONITOR-MODE",
        "front": "What should you remember about Monitor Mode?",
        "back": "**Exam cue:** Which mode will allow a Cisco AP to detect interference of Bluetooth devices? **Key response:** Monitor mode. **Why:** Monitor mode lets the AP scan channels for interference (Bluetooth, rogue APs) without serving client traffic."
      },
      {
        "id": "2.6-align-f10",
        "ckuId": "CKU-POINT-TO-MULTIPOINT-BRIDGE",
        "front": "What should you remember about Point To Multipoint Bridge?",
        "back": "**Exam cue:** You have three buildings that are separated by a number of public roads but have a relatively close proximity to each other. **Key response:** Point-to-multipoint wireless bridge. **Why:** Point-to-multipoint wireless bridges connect multiple nearby buildings (non-root sites) to one central root location across short outdoor links."
      },
      {
        "id": "2.6-align-f11",
        "ckuId": "CKU-REPEATER",
        "front": "What should you remember about Repeater?",
        "back": "**Exam cue:** A customer complains that their wireless network drops signal when they are performing inventory in the back of their warehouse. **Key response:** Wireless repeater. **Why:** A wireless repeater extends coverage in a small warehouse dead zone at low cost — acceptable when density and throughput needs are modest."
      },
      {
        "id": "2.6-align-f12",
        "ckuId": "CKU-ROOT-NONROOT",
        "front": "What should you remember about Root Nonroot?",
        "back": "**Exam cue:** Which statement is correct about root and non-root wireless devices? **Key response:** Non-root devices can connect to root devices.. **Why:** Non-root wireless devices (clients, repeaters in client role) associate with root devices (APs or root bridges) — they do not peer with each other as roots."
      }
    ],
    "reading": {
      "bigTakeaway": "Know autonomous vs lightweight (CAPWAP to WLC), Local vs FlexConnect switching, and specialty AP modes (Monitor, Sniffer, Rogue Detector, Bridge/Mesh).",
      "definition": "Cisco WLAN architectures place either full control on each AP (autonomous) or centralize control on a Wireless LAN Controller (WLC) with lightweight APs joined by CAPWAP.",
      "tiers": {
        "beginner": "Autonomous APs are standalone — each AP is configured and switched locally. Lightweight APs join a WLC over CAPWAP; the controller owns WLAN policy, RF, and usually client data switching in Local mode.",
        "intermediate": "Local mode tunnels client data to the WLC (central switching). FlexConnect can switch client data locally at the AP/branch when the CAPWAP tunnel is up or in standalone failover — useful at remote sites. Cloud-managed (e.g. Meraki) APs are managed from a dashboard rather than an on-prem WLC.",
        "examReady": "Match the mode to the job: Monitor (scan/interference, no clients), Sniffer (capture), Rogue Detector, SE-Connect, Bridge/Mesh for wireless backhaul. Density and RF coordination favor lightweight APs + WLC over many autonomous APs."
      },
      "keyPoints": [
        "Autonomous = per-AP config; Lightweight = CAPWAP join to WLC.",
        "Local mode = central data switching at WLC; FlexConnect can switch locally at the branch.",
        "Specialty modes (Monitor/Sniffer/Rogue) trade client service for visibility."
      ],
      "related": [
        "2.7 Physical infrastructure connections of WLAN components",
        "2.8 Configure WLAN components for client connectivity",
        "5.8 Describe wireless security protocols"
      ]
    }
  },
  "2.7": {
    "flashcards": [
      {
        "id": "2.7-align-f1",
        "ckuId": "CKU-AP-CONNECTIONS",
        "front": "What should you remember about Ap Connections?",
        "back": "**Exam cue:** You have been asked by your manager to configure a port for a new WAP to be installed for your WLC. How should you configure the port? **Key response:** Trunk port. **Why:** Controller-based AP switch ports are configured as trunks — they carry management, multiple client VLANs, and sometimes native VLAN for AP management."
      },
      {
        "id": "2.7-align-f2",
        "ckuId": "CKU-TRUNK-PORTS",
        "front": "What should you remember about Trunk Ports?",
        "back": "**Exam cue:** You have been asked by your manager to configure a port for a new WAP to be installed for your WLC. How should you configure the port? **Key response:** Trunk port. **Why:** Controller-based AP switch ports are configured as trunks — they carry management, multiple client VLANs, and sometimes native VLAN for AP management."
      },
      {
        "id": "2.7-align-f3",
        "ckuId": "CKU-WLC-CONNECTIONS",
        "front": "What should you remember about Wlc Connections?",
        "back": "**Exam cue:** You have been asked by your manager to configure a port for a new WAP to be installed for your WLC. How should you configure the port? **Key response:** Trunk port. **Why:** Controller-based AP switch ports are configured as trunks — they carry management, multiple client VLANs, and sometimes native VLAN for AP management."
      },
      {
        "id": "2.7-align-f4",
        "ckuId": "CKU-WLC-LAG",
        "front": "What should you remember about Wlc Lag?",
        "back": "**Exam cue:** You need more bandwidth to your wireless controller from the router. Currently you have one Gigabit Ethernet connection in use and both your router a… **Key response:** Bundle both Gigabit Ethernet connections in an EtherChannel.. **Why:** EtherChannel bundles parallel links into one logical L2 path — adds bandwidth between router and controller switch."
      },
      {
        "id": "2.7-align-f5",
        "ckuId": "CKU-WLC-TRUNK-PORT",
        "front": "What should you remember about Wlc Trunk Port?",
        "back": "**Exam cue:** You currently have a WLC with only two physical access ports. One port is used for guest network access and the other port is used for your business… **Key response:** Convert one of the current access ports to a trunk.. **Why:** Convert an access port to a trunk — allows multiple VLANs (departments) over one physical link to the WLC."
      },
      {
        "id": "2.7-align-f6",
        "ckuId": "CKU-AP-TRUNK-PORT",
        "front": "What should you remember about Ap Trunk Port?",
        "back": "**Exam cue:** You have been asked by your manager to configure a port for a new WAP to be installed for your WLC. How should you configure the port? **Key response:** Trunk port. **Why:** Controller-based AP switch ports are configured as trunks — they carry management, multiple client VLANs, and sometimes native VLAN for AP management."
      },
      {
        "id": "2.7-align-f7",
        "ckuId": "CKU-ETHERCHANNEL",
        "front": "What should you remember about EtherChannel / Port Channel?",
        "back": "**Bundles 2–8 parallel links into one logical interface (Po) for bandwidth aggregation and STP treats it as a single link**."
      },
      {
        "id": "2.7-align-f8",
        "ckuId": "CKU-LAG-LOAD-BALANCING",
        "front": "What should you remember about Lag Load Balancing?",
        "back": "**Exam cue:** How is traffic load-balanced from a WLC to a switch using LAG? **Key response:** Hash based. **Why:** WLC LAG load-balances traffic across bundled links using a hash of source/destination addresses — not round-robin or FIFO."
      }
    ],
    "reading": {
      "bigTakeaway": "APs and WLCs need the right switchport mode, VLANs, PoE budget, and (often) LAG/EtherChannel — cabling mistakes break join and client VLANs.",
      "definition": "WLAN physical connectivity covers how APs and WLCs attach to the wired campus: access vs trunk ports, management/native VLAN, power (PoE/PoE+), and optional link aggregation to the controller.",
      "tiers": {
        "beginner": "A lightweight AP usually sits on a switch port that can carry the AP management VLAN and, depending on mode, client VLANs. Controllers need enough bandwidth and often a trunk into the distribution/core so multiple SSIDs map to multiple VLANs.",
        "intermediate": "Many designs trunk the AP port (or use an access port for AP management with FlexConnect local switching on client VLANs). WLC ports facing the network are commonly trunks; LAG/EtherChannel can aggregate multiple GE links for capacity and redundancy. Check PoE budget so APs do not brown out.",
        "examReady": "Map the ask: new AP → usually trunk (or access + FlexConnect VLAN design); need more WLC bandwidth → EtherChannel/LAG; multiple departments on one physical WLC link → trunk. Blueprint-adjacent: PoE budget and LLDP-MED power negotiation."
      },
      "keyPoints": [
        "AP/WLC switchports must carry the right VLANs (trunk vs access depends on design/mode).",
        "LAG/EtherChannel aggregates WLC uplinks; STP treats the bundle as one link.",
        "PoE budget and cable category matter as much as SSID config."
      ],
      "related": [
        "2.2 Trunking / interswitch connectivity",
        "2.4 EtherChannel (LACP)",
        "2.6 Cisco wireless architectures and AP modes",
        "2.8 WLAN client connectivity"
      ]
    }
  },
  "2.8": {
    "flashcards": [
      {
        "id": "2.8-align-f1",
        "ckuId": "CKU-WIRELESS-LAN",
        "front": "What should you remember about Wireless Lan?",
        "back": "**Exam cue:** You need to set up a WLAN for connectivity to send and receive large files to roaming clients. The WLAN will exist with other WLAN traffic. **Key response:** Bronze. **Why:** Large file transfer is bulk/background traffic — Bronze (best effort, no priority) is appropriate alongside other WLANs."
      },
      {
        "id": "2.8-align-f2",
        "ckuId": "CKU-WLAN-GUI",
        "front": "What should you remember about Wlan Gui?",
        "back": "**Exam cue:** You need to set up a WLAN for connectivity to send and receive large files to roaming clients. The WLAN will exist with other WLAN traffic. **Key response:** Bronze. **Why:** Large file transfer is bulk/background traffic — Bronze (best effort, no priority) is appropriate alongside other WLANs."
      },
      {
        "id": "2.8-align-f3",
        "ckuId": "CKU-MANAGEMENT-ACCESS",
        "front": "What should you remember about Management Access?",
        "back": "**Exam cue:** You need to make a Telnet connection to a remote router from a router you are configuring. Which command will allow you to do this? **Key response:** Router#198.56.33.3. **Why:** From exec mode, type the target IP address directly (Router#198.56.33.3) to open a Telnet session to that host."
      },
      {
        "id": "2.8-align-f4",
        "ckuId": "CKU-REMOTE-ACCESS",
        "front": "What should you remember about Remote Access?",
        "back": "**Exam cue:** You need to make a Telnet connection to a remote router from a router you are configuring. Which command will allow you to do this? **Key response:** Router#198.56.33.3. **Why:** From exec mode, type the target IP address directly (Router#198.56.33.3) to open a Telnet session to that host."
      },
      {
        "id": "2.8-align-f5",
        "ckuId": "CKU-SSH",
        "front": "What should you remember about SSH Remote Access?",
        "back": "**SSH remote access: hostname + ip domain-name, crypto key generate rsa, username secret, line vty transport input ssh login local**. Disable Telnet. show ip ssh to verify."
      },
      {
        "id": "2.8-align-f6",
        "ckuId": "CKU-CONSOLE",
        "front": "What should you remember about Console?",
        "back": "**Exam cue:** You are setting up an autonomous WAP for the first time. How must you connect to the device? **Key response:** Console. **Why:** First-time autonomous AP setup typically uses the console — no IP or credentials exist yet for SSH/HTTPS/Telnet."
      },
      {
        "id": "2.8-align-f7",
        "ckuId": "CKU-QOS-PROFILES",
        "front": "What should you remember about Qos Profiles?",
        "back": "**Exam cue:** You need to set up a WLAN for connectivity to send and receive large files to roaming clients. The WLAN will exist with other WLAN traffic. **Key response:** Bronze. **Why:** Large file transfer is bulk/background traffic — Bronze (best effort, no priority) is appropriate alongside other WLANs."
      },
      {
        "id": "2.8-align-f8",
        "ckuId": "CKU-802.11E",
        "front": "What should you remember about 802.11e?",
        "back": "**Exam cue:** Which IEEE specification defines WLAN QoS for wireless data? **Key response:** 802.11e. **Why:** 802.11e defines QoS enhancements for wireless LANs (WMM — Wi-Fi Multimedia)."
      },
      {
        "id": "2.8-align-f9",
        "ckuId": "CKU-802.11K",
        "front": "What should you remember about 802.11k?",
        "back": "**Exam cue:** Which protocol should be enabled on a WLAN to allow a client device to download a list of neighboring WAPs? **Key response:** 802.11k. **Why:** 802.11k provides neighbor AP reports — clients use them to make faster roaming decisions."
      },
      {
        "id": "2.8-align-f10",
        "ckuId": "CKU-802.1X",
        "front": "What should you remember about 802.1x?",
        "back": "**Exam cue:** Which type of security can be implemented on a WLAN that requires the host PC to present a certificate before being allowed onto the wireless network? **Key response:** 802.1X. **Why:** 802.1X requires the client to present a certificate (or credentials via EAP) before network access — per-user authentication."
      },
      {
        "id": "2.8-align-f11",
        "ckuId": "CKU-AES",
        "front": "What should you remember about Aes?",
        "back": "**Exam cue:** Which management method can use Advanced Encryption Standard (AES) encryption for encryption of user credentials and session data? **Key response:** SSH. **Why:** SSH supports AES encryption for the full session (credentials + data) — Telnet sends everything cleartext."
      },
      {
        "id": "2.8-align-f12",
        "ckuId": "CKU-ASYMMETRIC-ENCRYPTION",
        "front": "What should you remember about Asymmetric Encryption?",
        "back": "**Exam cue:** Which technology is used to facilitate encryption for the SSH protocol? **Key response:** Asymmetrical encryption. **Why:** SSH uses asymmetric encryption (RSA/ECDSA key exchange) to establish the secure tunnel, then symmetric for session data."
      },
      {
        "id": "2.8-align-f13",
        "ckuId": "CKU-AUTONOMOUS-AP",
        "front": "What should you remember about Autonomous Ap?",
        "back": "**Exam cue:** Which statement is correct about Flex Connect mode versus Local mode? **Key response:** Local mode creates a CAPWAP tunnel to the WLC to transport data.. **Why:** Local mode tunnels client data traffic to the WLC over CAPWAP — centralized switching at the controller."
      },
      {
        "id": "2.8-align-f14",
        "ckuId": "CKU-CERTIFICATES",
        "front": "What should you remember about Certificates?",
        "back": "**Exam cue:** What does a digital certificate actually prove, and who vouches for it? **Key response:** A certificate binds a public key to an identity and is signed by a trusted Certificate Authority (CA). **Why:** Presenting a certificate (e.g. in 802.1X EAP-TLS or HTTPS) lets a device or user prove its identity cryptographically, without sending a shared secret over the network — the CA's signature is what the other side trusts."
      },
      {
        "id": "2.8-align-f15",
        "ckuId": "CKU-CONSOLE-SPEED",
        "front": "What should you remember about Console Speed?",
        "back": "**Exam cue:** What is the connection speed for console access to Cisco equipment? **Key response:** 9600 baud. **Why:** Cisco console port defaults to 9600 baud (bits per second signaling rate)."
      },
      {
        "id": "2.8-align-f16",
        "ckuId": "CKU-MAC-FILTERING",
        "front": "What should you remember about Mac Filtering?",
        "back": "**Exam cue:** You are creating a WLAN in the GUI of the WLC. You need to make sure that only corporate hosts can connect to the newly formed WLAN. **Key response:** Use MAC filtering. **Why:** MAC filtering allows only approved corporate MAC addresses to associate — restricts WLAN access to known devices."
      },
      {
        "id": "2.8-align-f17",
        "ckuId": "CKU-PLATINUM",
        "front": "What should you remember about Platinum?",
        "back": "**Exam cue:** You are planning to implement wireless VoIP phones in your wireless network. Which QoS profile should you associate with the wireless network for the… **Key response:** Platinum. **Why:** VoIP needs the highest QoS priority — Platinum profile on Cisco WLC gives EF/voice treatment."
      },
      {
        "id": "2.8-align-f18",
        "ckuId": "CKU-QOS-TRUST-BOUNDARY",
        "front": "What should you remember about Qos Trust Boundary?",
        "back": "**Exam cue:** What is the definition of a trust boundary in relation to QoS? **Key response:** A trust boundary is where the network begins to trust the QoS markings from devices.. **Why:** A trust boundary is where the network begins trusting QoS markings from devices — beyond it, markings may be re-written."
      },
      {
        "id": "2.8-align-f19",
        "ckuId": "CKU-RADIUS",
        "front": "What should you remember about Radius?",
        "back": "**Exam cue:** How does RADIUS differ from TACACS+ in what it encrypts and how it structures AAA? **Key response:** RADIUS encrypts only the password in the access-request packet and combines authentication and authorization into a single response, using UDP ports 1812/1813. **Why:** RADIUS is built for network access (802.1X, VPN, wireless) rather than device administration — it does not separate authentication, authorization, and accounting into distinct steps the way TACACS+ does, and only the password is encrypted, not the full packet."
      },
      {
        "id": "2.8-align-f20",
        "ckuId": "CKU-TACACS",
        "front": "What should you remember about Tacacs?",
        "back": "**Exam cue:** Which of the following best describes why an enterprise would choose TACACS+ over RADIUS for managing administrative access to network infrastructure… **Key response:** TACACS+ separates authentication, authorization, and accounting into distinct processes and supports per-comm…. **Why:** TACACS+ separates auth/authz/accounting and supports per-command authorization — ideal for device admin."
      },
      {
        "id": "2.8-align-f21",
        "ckuId": "CKU-TCP-49",
        "front": "What should you remember about Tcp 49?",
        "back": "**Exam cue:** Which port and protocol does TACACS+ use? **Key response:** TCP/49. **Why:** TACACS+ uses TCP port 49 — separates authentication, authorization, and accounting (Cisco AAA)."
      },
      {
        "id": "2.8-align-f22",
        "ckuId": "CKU-VLAN-SEGMENTATION",
        "front": "What should you remember about Vlan Segmentation?",
        "back": "**Exam cue:** You are running a WLC for a WLAN. You want to allow for guests to be segmented to the guest VLAN. **Key response:** Two SSIDs, one configured to the production VLAN and another configured to the guest VLAN. **Why:** Simplest segmentation: two SSIDs — one mapped to production VLAN, one to guest VLAN. Clients associate to the appropriate SSID."
      },
      {
        "id": "2.8-align-f23",
        "ckuId": "CKU-WLAN-STATUS",
        "front": "What should you remember about Wlan Status?",
        "back": "**Exam cue:** WLC WLAN summary — MaintDept: Profile Name: MaintDept Status: Disabled Radio Policy: All Multicast VLAN: Disabled Broadcast SSID: Disabled WLC WLAN s… **Key response:** Enable the status. **Why:** WLAN status is Disabled — enable the WLAN so maintenance users can associate."
      },
      {
        "id": "2.8-align-f24",
        "ckuId": "CKU-WMAN",
        "front": "What should you remember about Wman?",
        "back": "**Exam cue:** You company has been contracted to implement a 802.11 wireless system for a small town. Which type of implementation is this considered? **Key response:** WMAN. **Why:** A wireless system covering a town is a WMAN (Wireless Metropolitan Area Network)."
      },
      {
        "id": "2.8-align-f25",
        "ckuId": "CKU-WPA2-PSK",
        "front": "What should you remember about WPA2-PSK WLAN?",
        "back": "**WPA2-PSK WLAN: WLC WLAN with WPA2-AES, PSK passphrase, VLAN mapping**. 4-way handshake derives per-session keys."
      },
      {
        "id": "2.8-align-f26",
        "ckuId": "CKU-WPAN",
        "front": "What should you remember about Wpan?",
        "back": "**Exam cue:** What is the term for a small wireless network that does not extend past 30 feet? **Key response:** WPAN. **Why:** WPAN (Wireless Personal Area Network) covers short range (~10–30 feet) — Bluetooth and similar personal devices."
      }
    ],
    "reading": {
      "bigTakeaway": "Client connectivity is SSID → security (PSK or 802.1X) → VLAN/interface → enable the WLAN — then associate, authenticate, and DHCP.",
      "definition": "Configuring WLAN client connectivity means creating a WLAN/SSID on the WLC (or AP), mapping it to a VLAN/interface, choosing WPA2/WPA3 Personal or Enterprise, applying QoS/radio policy, and enabling the WLAN so clients can join.",
      "tiers": {
        "beginner": "Clients need an SSID, a password or 802.1X method, and an IP from DHCP on the VLAN that SSID maps to. If the WLAN status is Disabled, users cannot associate even when RF looks fine.",
        "intermediate": "On a WLC: create WLAN, set SSID, map to dynamic interface/VLAN, choose WPA2-AES PSK or Enterprise (RADIUS/EAP), set QoS profile (Platinum/Gold/Silver/Bronze), and enable. Broadcast SSID and radio policy control discoverability and bands.",
        "examReady": "Disabled WLAN status is a classic trap. Guest vs corporate = separate SSIDs/VLANs. WPA2-PSK is Personal; Enterprise needs RADIUS. QoS: voice→Platinum, video→Gold, best-effort bulk→Bronze/Silver."
      },
      "keyPoints": [
        "SSID + security profile + VLAN mapping + enabled status = client path.",
        "WPA2/WPA3 Personal = PSK; Enterprise = 802.1X/RADIUS/EAP.",
        "Verify association, authentication, then DHCP on the mapped VLAN."
      ],
      "related": [
        "2.6 Wireless architectures and AP modes",
        "2.7 WLAN physical connections",
        "5.8 Wireless security protocols",
        "5.9 Configure WLAN using WPA2 PSK"
      ]
    }
  },
  "3.1": {
    "flashcards": [
      {
        "id": "3.1-align-f1",
        "ckuId": "CKU-PREFIX",
        "front": "What should you remember about Prefix?",
        "back": "**Exam cue:** You review a routing table and see a route marked with S*. Which type of route is this? **Key response:** Default route. **Why:** S* marks a candidate default route — the asterisk flags the gateway of last resort, not a generic static prefix."
      },
      {
        "id": "3.1-align-f2",
        "ckuId": "CKU-ROUTE-CODE",
        "front": "What should you remember about Route Code?",
        "back": "**Exam cue:** You review a routing table and see a route marked with S*. Which type of route is this? **Key response:** Default route. **Why:** S* marks a candidate default route — the asterisk flags the gateway of last resort, not a generic static prefix."
      },
      {
        "id": "3.1-align-f3",
        "ckuId": "CKU-DR-BDR",
        "front": "What should you remember about Dr Bdr?",
        "back": "**Exam cue:** Routing table excerpt: C 192.168.1.0/26 is directly connected, Serial0/0 S 192.168.1.0/24 [1/0] via 172.16.1.100 O 192.168.1.128/25 [110/10] via 172.… **Key response:** The exit interface Serial 0/0. **Why:** The routing table shows next hop via Serial 0/0 for that destination — traffic exits that interface."
      },
      {
        "id": "3.1-align-f4",
        "ckuId": "CKU-ROUTE-STATEMENT",
        "front": "What should you remember about Route Statement?",
        "back": "**Exam cue:** Which command will allow you to verify routes line by line in a subset of the general route statement? **Key response:** Router#show ip route 160.45.23.0 255.255.255.0 longer- prefixes. **Why:** show ip route <prefix> <mask> longer-prefixes filters to show all more-specific routes within that range."
      },
      {
        "id": "3.1-align-f5",
        "ckuId": "CKU-METRIC",
        "front": "What should you remember about Routing Protocol Metric?",
        "back": "**A value a routing protocol assigns to a route to rank paths**. Metrics are only comparable WITHIN the same protocol (OSPF cost vs EIGRP composite are not comparable); AD decides between protocols first, then metric brea…"
      },
      {
        "id": "3.1-align-f6",
        "ckuId": "CKU-SHOW-IP-ROUTE",
        "front": "What should you remember about Show Ip Route?",
        "back": "**Exam cue:** Which command displays the router's current routing table, including the source (static, connected, or routing protocol) of each route? **Key response:** show ip route. **Why:** show ip route displays the routing table with each route's source (C connected, S static, O OSPF, etc.)."
      },
      {
        "id": "3.1-align-f7",
        "ckuId": "CKU-DEFAULT-ROUTE",
        "front": "What should you remember about Default Route (Gateway of Last Resort)?",
        "back": "**The route 0.0.0.0/0** (::/0 for IPv6) with prefix length 0 — it matches every destination but is the LEAST specific, so longest-prefix-match only uses it when no more-specific route matches."
      },
      {
        "id": "3.1-align-f8",
        "ckuId": "CKU-EIGRP",
        "front": "What should you remember about Eigrp?",
        "back": "**Exam cue:** What is the AD of internal EIGRP? **Key response:** 90. **Why:** Internal EIGRP routes use administrative distance 90 — more trusted than OSPF (110) and RIP (120)."
      },
      {
        "id": "3.1-align-f9",
        "ckuId": "CKU-BANDWIDTH",
        "front": "What should you remember about Bandwidth?",
        "back": "**Exam cue:** Which must be configured so that EIGRP can calculate the best route? **Key response:** Bandwidth. **Why:** EIGRP composite metric uses bandwidth (and delay by default) — bandwidth must be set correctly for accurate path selection."
      },
      {
        "id": "3.1-align-f10",
        "ckuId": "CKU-NETWORK-MASK",
        "front": "What should you remember about Network Mask?",
        "back": "**Exam cue:** Which is true of a host route in the routing table? **Key response:** A host route is a specific route with a netmask of /32 for a specific host.. **Why:** A host route is a /32 entry for one specific host address — longest possible prefix match."
      },
      {
        "id": "3.1-align-f11",
        "ckuId": "CKU-NEXT-HOP",
        "front": "What should you remember about Next Hop?",
        "back": "**Exam cue:** Routing table excerpt: C 192.168.1.0/26 is directly connected, Serial0/0 S 192.168.1.0/24 [1/0] via 172.16.1.100 O 192.168.1.128/25 [110/10] via 172.… **Key response:** The exit interface Serial 0/0. **Why:** The routing table shows next hop via Serial 0/0 for that destination — traffic exits that interface."
      },
      {
        "id": "3.1-align-f12",
        "ckuId": "CKU-OSPFV2",
        "front": "What should you remember about Ospfv2?",
        "back": "**Exam cue:** A network has two routers, R1 and R2, both running OSPF. R1's routing table is missing a network that R2 advertises. **Key response:** show ip ospf neighbor. **Why:** show ip ospf neighbor shows the state of OSPF adjacencies (e.g., FULL). If R1 and R2 have not formed a FULL adjacency, R1 will not receive R2 routes."
      },
      {
        "id": "3.1-align-f13",
        "ckuId": "CKU-RIP",
        "front": "What should you remember about Rip?",
        "back": "**Exam cue:** What is the AD of RIP? **Key response:** AD of 120. **Why:** RIP (v1/v2) uses administrative distance 120 — less preferred than OSPF (110) or EIGRP (90)."
      },
      {
        "id": "3.1-align-f14",
        "ckuId": "CKU-STATIC-ROUTE",
        "front": "What should you remember about Static Route?",
        "back": "**Exam cue:** Two static routes are configured for the same destination network with the same administrative distance: one via 10.0.0.1 and one via 10.0.0.2. **Key response:** Both routes are installed for equal-cost load balancing. **Why:** Two static routes to the same prefix with equal AD install as equal-cost paths — the router load-balances across both next hops."
      },
      {
        "id": "3.1-align-f15",
        "ckuId": "CKU-LOCAL-ROUTE",
        "front": "What should you remember about Local Route?",
        "back": "**Exam cue:** What type of route is the destination of 0.0.0.0/0? **Key response:** Default route. **Why:** 0.0.0.0/0 is the default route — matches any destination when no more-specific route exists."
      },
      {
        "id": "3.1-align-f16",
        "ckuId": "CKU-ARP",
        "front": "What should you remember about Arp?",
        "back": "**Exam cue:** What is the relevance of the default gateway address on a host that is transmitting to a destination for the first time? **Key response:** The host sends an ARP packet for the default gateway when the destination is remote.. **Why:** For a remote destination, the host ARP-resolves the default gateway's MAC — IP stays the final destination."
      },
      {
        "id": "3.1-align-f17",
        "ckuId": "CKU-HSRP",
        "front": "What should you remember about HSRP?",
        "back": "**Cisco FHRP: virtual IP/MAC, Active/Standby routers, hello 3s, hold 10s, priority 0–255, preempt optional**."
      },
      {
        "id": "3.1-align-f18",
        "ckuId": "CKU-OSPF-COST",
        "front": "What should you remember about OSPF Cost (Metric)?",
        "back": "**OSPF metric = reference bandwidth (default 100 Mbps) ÷ interface bandwidth; lower cost is preferred**. Total path cost sums interface costs."
      },
      {
        "id": "3.1-align-f19",
        "ckuId": "CKU-STATIC-DEFAULT-ROUTE",
        "front": "What should you remember about Static Default Route?",
        "back": "**Exam cue:** You review a routing table and see a route marked with S*. Which type of route is this? **Key response:** Default route. **Why:** S* marks a candidate default route — the asterisk flags the gateway of last resort, not a generic static prefix."
      }
    ]
  },
  "3.2": {
    "flashcards": [
      {
        "id": "3.2-align-f1",
        "ckuId": "CKU-FORWARDING-DECISION",
        "front": "What should you remember about Forwarding Decision?",
        "back": "**Exam cue:** What role does ICMP take in the routing of a packet? **Key response:** ICMP is used when routes are not reachable.. **Why:** ICMP reports delivery problems — e.g. destination unreachable when no route exists or host is down."
      },
      {
        "id": "3.2-align-f2",
        "ckuId": "CKU-DR-BDR",
        "front": "What should you remember about Dr Bdr?",
        "back": "**Exam cue:** Routing table excerpt: C 192.168.1.0/26 is directly connected, Serial0/0 S 192.168.1.0/24 [1/0] via 172.16.1.100 O 192.168.1.128/25 [110/10] via 172.… **Key response:** The exit interface Serial 0/0. **Why:** The routing table shows next hop via Serial 0/0 for that destination — traffic exits that interface."
      },
      {
        "id": "3.2-align-f3",
        "ckuId": "CKU-ARP",
        "front": "What should you remember about Arp?",
        "back": "**Exam cue:** What is the relevance of the default gateway address on a host that is transmitting to a destination for the first time? **Key response:** The host sends an ARP packet for the default gateway when the destination is remote.. **Why:** For a remote destination, the host ARP-resolves the default gateway's MAC — IP stays the final destination."
      },
      {
        "id": "3.2-align-f4",
        "ckuId": "CKU-ICMP",
        "front": "What should you remember about Icmp?",
        "back": "**Exam cue:** What role does ICMP take in the routing of a packet? **Key response:** ICMP is used when routes are not reachable.. **Why:** ICMP reports delivery problems — e.g. destination unreachable when no route exists or host is down."
      },
      {
        "id": "3.2-align-f5",
        "ckuId": "CKU-NETWORK-MASK",
        "front": "What should you remember about Network Mask?",
        "back": "**Exam cue:** Which is true of a host route in the routing table? **Key response:** A host route is a specific route with a netmask of /32 for a specific host.. **Why:** A host route is a /32 entry for one specific host address — longest possible prefix match."
      },
      {
        "id": "3.2-align-f6",
        "ckuId": "CKU-NEXT-HOP",
        "front": "What should you remember about Next Hop?",
        "back": "**Exam cue:** Routing table excerpt: C 192.168.1.0/26 is directly connected, Serial0/0 S 192.168.1.0/24 [1/0] via 172.16.1.100 O 192.168.1.128/25 [110/10] via 172.… **Key response:** The exit interface Serial 0/0. **Why:** The routing table shows next hop via Serial 0/0 for that destination — traffic exits that interface."
      },
      {
        "id": "3.2-align-f7",
        "ckuId": "CKU-PING",
        "front": "What should you remember about Ping?",
        "back": "**Exam cue:** How is a route selected when the route table contains overlapping destination prefixes? **Key response:** The route with the longest matching prefix is selected.. **Why:** When prefixes overlap, the router picks the longest matching prefix (most specific netmask)."
      },
      {
        "id": "3.2-align-f8",
        "ckuId": "CKU-IPV6-STATIC-ROUTE",
        "front": "What should you remember about IPv6 Static Route Syntax?",
        "back": "**ipv6 route <prefix>/<length> {<next-hop-ipv6> | <exit-interface>}**. IPv6 default: ipv6 route ::/0 <next-hop>. Requires ipv6 unicast-routing globally."
      },
      {
        "id": "3.2-align-f9",
        "ckuId": "CKU-LOCAL-ROUTE",
        "front": "What should you remember about Local Route?",
        "back": "**Exam cue:** What type of route is the destination of 0.0.0.0/0? **Key response:** Default route. **Why:** 0.0.0.0/0 is the default route — matches any destination when no more-specific route exists."
      },
      {
        "id": "3.2-align-f10",
        "ckuId": "CKU-PREFIX",
        "front": "What should you remember about Prefix?",
        "back": "**Exam cue:** You review a routing table and see a route marked with S*. Which type of route is this? **Key response:** Default route. **Why:** S* marks a candidate default route — the asterisk flags the gateway of last resort, not a generic static prefix."
      },
      {
        "id": "3.2-align-f11",
        "ckuId": "CKU-RIP",
        "front": "What should you remember about Rip?",
        "back": "**Exam cue:** What is the AD of RIP? **Key response:** AD of 120. **Why:** RIP (v1/v2) uses administrative distance 120 — less preferred than OSPF (110) or EIGRP (90)."
      },
      {
        "id": "3.2-align-f12",
        "ckuId": "CKU-SHOW-IP-ROUTE",
        "front": "What should you remember about Show Ip Route?",
        "back": "**Exam cue:** Which command displays the router's current routing table, including the source (static, connected, or routing protocol) of each route? **Key response:** show ip route. **Why:** show ip route displays the routing table with each route's source (C connected, S static, O OSPF, etc.)."
      },
      {
        "id": "3.2-align-f13",
        "ckuId": "CKU-CEF",
        "front": "What should you remember about Cef?",
        "back": "**Exam cue:** Which command would allow you to see the next hop information for CEF? **Key response:** Router#show ip cef. **Why:** show ip cef displays the CEF Forwarding Information Base — prefixes with next-hop adjacencies."
      },
      {
        "id": "3.2-align-f14",
        "ckuId": "CKU-EIGRP",
        "front": "What should you remember about Eigrp?",
        "back": "**Exam cue:** What is the AD of internal EIGRP? **Key response:** 90. **Why:** Internal EIGRP routes use administrative distance 90 — more trusted than OSPF (110) and RIP (120)."
      },
      {
        "id": "3.2-align-f15",
        "ckuId": "CKU-HSRP",
        "front": "What should you remember about HSRP?",
        "back": "**Cisco FHRP: virtual IP/MAC, Active/Standby routers, hello 3s, hold 10s, priority 0–255, preempt optional**."
      },
      {
        "id": "3.2-align-f16",
        "ckuId": "CKU-OSPF-COST",
        "front": "What should you remember about OSPF Cost (Metric)?",
        "back": "**OSPF metric = reference bandwidth (default 100 Mbps) ÷ interface bandwidth; lower cost is preferred**. Total path cost sums interface costs."
      },
      {
        "id": "3.2-align-f17",
        "ckuId": "CKU-OSPFV2",
        "front": "What should you remember about Ospfv2?",
        "back": "**Exam cue:** A network has two routers, R1 and R2, both running OSPF. R1's routing table is missing a network that R2 advertises. **Key response:** show ip ospf neighbor. **Why:** show ip ospf neighbor shows the state of OSPF adjacencies (e.g., FULL). If R1 and R2 have not formed a FULL adjacency, R1 will not receive R2 routes."
      }
    ],
    "reading": {
      "bigTakeaway": "Routers forward by longest-prefix match in the routing table; verify the matched route, next-hop, and exit interface.",
      "definition": "Default forwarding uses the routing table: match the destination to the longest prefix, then send out the next-hop or exit interface for that route.",
      "tiers": {
        "beginner": "When a router receives a packet, it looks at the destination IP and picks the best matching route in its table — usually the most specific (longest) prefix. If nothing matches, it uses a default route (0.0.0.0/0) if one exists.",
        "intermediate": "Forwarding decision: longest-prefix match wins over AD when prefixes differ. When two sources offer the same prefix, lower administrative distance wins. Confirm with show ip route, then ping/traceroute from the correct source interface.",
        "examReady": "Forwarding order: longest prefix match first; then AD for the same prefix; then metric within one protocol. Exam trap: confusing AD with metric or with longest-match. Verify: show ip route <dest> — read code, [AD/metric], via/next-hop, and exit interface."
      },
      "keyPoints": [
        "Longest matching prefix selects the route used for forwarding.",
        "Same prefix from multiple sources → lowest administrative distance wins.",
        "Verify with show ip route, then test reachability with ping/traceroute."
      ],
      "related": [
        "3.1 Interpret the components of a routing table",
        "3.3 Configure and verify IPv4 and IPv6 static routing",
        "3.4 Configure and verify single-area OSPFv2"
      ]
    }
  },
  "3.3": {
    "flashcards": [
      {
        "id": "3.3-align-f1",
        "ckuId": "CKU-IPV4-STATIC-ROUTE",
        "front": "What should you remember about Ipv4 Static Route?",
        "back": "**Exam cue:** You need to create a route for 205.34.54.85/29 with the next hop being 205.34.55.2. Which command would create this route? **Key response:** Router(config)#ip route 205.34.54.85 255.255.255.248 205.34.55.2. **Why:** /29 = 255.255.255.248 — static route syntax: ip route <network> <mask> <next-hop>."
      },
      {
        "id": "3.3-align-f2",
        "ckuId": "CKU-DEFAULT-ROUTE",
        "front": "What should you remember about Default Route (Gateway of Last Resort)?",
        "back": "**The route 0.0.0.0/0** (::/0 for IPv6) with prefix length 0 — it matches every destination but is the LEAST specific, so longest-prefix-match only uses it when no more-specific route matches."
      },
      {
        "id": "3.3-align-f3",
        "ckuId": "CKU-DR-BDR",
        "front": "What should you remember about Dr Bdr?",
        "back": "**Exam cue:** Routing table excerpt: C 192.168.1.0/26 is directly connected, Serial0/0 S 192.168.1.0/24 [1/0] via 172.16.1.100 O 192.168.1.128/25 [110/10] via 172.… **Key response:** The exit interface Serial 0/0. **Why:** The routing table shows next hop via Serial 0/0 for that destination — traffic exits that interface."
      },
      {
        "id": "3.3-align-f4",
        "ckuId": "CKU-RIP",
        "front": "What should you remember about Rip?",
        "back": "**Exam cue:** What is the AD of RIP? **Key response:** AD of 120. **Why:** RIP (v1/v2) uses administrative distance 120 — less preferred than OSPF (110) or EIGRP (90)."
      },
      {
        "id": "3.3-align-f5",
        "ckuId": "CKU-OSPFV2",
        "front": "What should you remember about Ospfv2?",
        "back": "**Exam cue:** A network has two routers, R1 and R2, both running OSPF. R1's routing table is missing a network that R2 advertises. **Key response:** show ip ospf neighbor. **Why:** show ip ospf neighbor shows the state of OSPF adjacencies (e.g., FULL). If R1 and R2 have not formed a FULL adjacency, R1 will not receive R2 routes."
      },
      {
        "id": "3.3-align-f6",
        "ckuId": "CKU-ROUTE-STATEMENT",
        "front": "What should you remember about Route Statement?",
        "back": "**Exam cue:** Which command will allow you to verify routes line by line in a subset of the general route statement? **Key response:** Router#show ip route 160.45.23.0 255.255.255.0 longer- prefixes. **Why:** show ip route <prefix> <mask> longer-prefixes filters to show all more-specific routes within that range."
      },
      {
        "id": "3.3-align-f7",
        "ckuId": "CKU-SHOW-IP-ROUTE",
        "front": "What should you remember about Show Ip Route?",
        "back": "**Exam cue:** Which command displays the router's current routing table, including the source (static, connected, or routing protocol) of each route? **Key response:** show ip route. **Why:** show ip route displays the routing table with each route's source (C connected, S static, O OSPF, etc.)."
      },
      {
        "id": "3.3-align-f8",
        "ckuId": "CKU-BANDWIDTH",
        "front": "What should you remember about Bandwidth?",
        "back": "**Exam cue:** Which must be configured so that EIGRP can calculate the best route? **Key response:** Bandwidth. **Why:** EIGRP composite metric uses bandwidth (and delay by default) — bandwidth must be set correctly for accurate path selection."
      },
      {
        "id": "3.3-align-f9",
        "ckuId": "CKU-EIGRP",
        "front": "What should you remember about Eigrp?",
        "back": "**Exam cue:** What is the AD of internal EIGRP? **Key response:** 90. **Why:** Internal EIGRP routes use administrative distance 90 — more trusted than OSPF (110) and RIP (120)."
      },
      {
        "id": "3.3-align-f10",
        "ckuId": "CKU-ARP",
        "front": "What should you remember about Arp?",
        "back": "**Exam cue:** What is the relevance of the default gateway address on a host that is transmitting to a destination for the first time? **Key response:** The host sends an ARP packet for the default gateway when the destination is remote.. **Why:** For a remote destination, the host ARP-resolves the default gateway's MAC — IP stays the final destination."
      },
      {
        "id": "3.3-align-f11",
        "ckuId": "CKU-ICMP",
        "front": "What should you remember about Icmp?",
        "back": "**Exam cue:** What role does ICMP take in the routing of a packet? **Key response:** ICMP is used when routes are not reachable.. **Why:** ICMP reports delivery problems — e.g. destination unreachable when no route exists or host is down."
      },
      {
        "id": "3.3-align-f12",
        "ckuId": "CKU-PING",
        "front": "What should you remember about Ping?",
        "back": "**Exam cue:** How is a route selected when the route table contains overlapping destination prefixes? **Key response:** The route with the longest matching prefix is selected.. **Why:** When prefixes overlap, the router picks the longest matching prefix (most specific netmask)."
      },
      {
        "id": "3.3-align-f13",
        "ckuId": "CKU-LOCAL-ROUTE",
        "front": "What should you remember about Local Route?",
        "back": "**Exam cue:** What type of route is the destination of 0.0.0.0/0? **Key response:** Default route. **Why:** 0.0.0.0/0 is the default route — matches any destination when no more-specific route exists."
      },
      {
        "id": "3.3-align-f14",
        "ckuId": "CKU-NEXT-HOP",
        "front": "What should you remember about Next Hop?",
        "back": "**Exam cue:** Routing table excerpt: C 192.168.1.0/26 is directly connected, Serial0/0 S 192.168.1.0/24 [1/0] via 172.16.1.100 O 192.168.1.128/25 [110/10] via 172.… **Key response:** The exit interface Serial 0/0. **Why:** The routing table shows next hop via Serial 0/0 for that destination — traffic exits that interface."
      }
    ]
  },
  "3.4": {
    "flashcards": [
      {
        "id": "3.4-align-f1",
        "ckuId": "CKU-DR-BDR",
        "front": "What should you remember about Dr Bdr?",
        "back": "**Exam cue:** Routing table excerpt: C 192.168.1.0/26 is directly connected, Serial0/0 S 192.168.1.0/24 [1/0] via 172.16.1.100 O 192.168.1.128/25 [110/10] via 172.… **Key response:** The exit interface Serial 0/0. **Why:** The routing table shows next hop via Serial 0/0 for that destination — traffic exits that interface."
      },
      {
        "id": "3.4-align-f2",
        "ckuId": "CKU-OSPF-NEIGHBORSHIP",
        "front": "What should you remember about Ospf Neighborship?",
        "back": "**Exam cue:** Which multicast address is used by OSPF for neighbor discovery? **Key response:** 224.0.0.5. **Why:** OSPF routers send hellos to 224.0.0.5 (AllSPFRouters) for neighbor discovery on broadcast segments."
      },
      {
        "id": "3.4-align-f3",
        "ckuId": "CKU-OSPF-HELLO",
        "front": "What should you remember about Ospf Hello?",
        "back": "**Exam cue:** In which database can you see all of the routers discovered in the OSPF network in which hello packets were sent and acknowledged? **Key response:** The neighborship database. **Why:** Hello packets establish/maintain neighbor relationships — view them with show ip ospf neighbor (the neighborship table)."
      },
      {
        "id": "3.4-align-f4",
        "ckuId": "CKU-DEFAULT-ROUTE",
        "front": "What should you remember about Default Route (Gateway of Last Resort)?",
        "back": "**The route 0.0.0.0/0** (::/0 for IPv6) with prefix length 0 — it matches every destination but is the LEAST specific, so longest-prefix-match only uses it when no more-specific route matches."
      },
      {
        "id": "3.4-align-f5",
        "ckuId": "CKU-PRIORITY",
        "front": "What should you remember about Priority?",
        "back": "**Exam cue:** How is a DR elected for OSPF? **Key response:** The DR is elected by the highest priority and highest RID in the same area.. **Why:** DR election: highest OSPF priority wins; tie-break highest RID — election is per segment within an area."
      },
      {
        "id": "3.4-align-f6",
        "ckuId": "CKU-BANDWIDTH",
        "front": "What should you remember about Bandwidth?",
        "back": "**Exam cue:** Which must be configured so that EIGRP can calculate the best route? **Key response:** Bandwidth. **Why:** EIGRP composite metric uses bandwidth (and delay by default) — bandwidth must be set correctly for accurate path selection."
      },
      {
        "id": "3.4-align-f7",
        "ckuId": "CKU-PASSIVE-INTERFACE",
        "front": "What should you remember about Passive Interface?",
        "back": "**Exam cue:** You are running OSPF on a router. One of the interfaces, Gi0/1, connects to your ISP. **Key response:** Router(config-router)#passive-interface gigabitethernet 0/1. **Why:** Stop OSPF hellos on ISP-facing intf: router ospf 1 → passive-interface gigabitethernet 0/1 — process-level command."
      },
      {
        "id": "3.4-align-f8",
        "ckuId": "CKU-EIGRP",
        "front": "What should you remember about Eigrp?",
        "back": "**Exam cue:** What is the AD of internal EIGRP? **Key response:** 90. **Why:** Internal EIGRP routes use administrative distance 90 — more trusted than OSPF (110) and RIP (120)."
      },
      {
        "id": "3.4-align-f9",
        "ckuId": "CKU-NETWORK-MASK",
        "front": "What should you remember about Network Mask?",
        "back": "**Exam cue:** Which is true of a host route in the routing table? **Key response:** A host route is a specific route with a netmask of /32 for a specific host.. **Why:** A host route is a /32 entry for one specific host address — longest possible prefix match."
      },
      {
        "id": "3.4-align-f10",
        "ckuId": "CKU-RIP",
        "front": "What should you remember about Rip?",
        "back": "**Exam cue:** What is the AD of RIP? **Key response:** AD of 120. **Why:** RIP (v1/v2) uses administrative distance 120 — less preferred than OSPF (110) or EIGRP (90)."
      },
      {
        "id": "3.4-align-f11",
        "ckuId": "CKU-METRIC",
        "front": "What should you remember about Routing Protocol Metric?",
        "back": "**A value a routing protocol assigns to a route to rank paths**. Metrics are only comparable WITHIN the same protocol (OSPF cost vs EIGRP composite are not comparable); AD decides between protocols first, then metric brea…"
      },
      {
        "id": "3.4-align-f12",
        "ckuId": "CKU-SHOW-IP-ROUTE",
        "front": "What should you remember about Show Ip Route?",
        "back": "**Exam cue:** Which command displays the router's current routing table, including the source (static, connected, or routing protocol) of each route? **Key response:** show ip route. **Why:** show ip route displays the routing table with each route's source (C connected, S static, O OSPF, etc.)."
      },
      {
        "id": "3.4-align-f13",
        "ckuId": "CKU-STATIC-ROUTE",
        "front": "What should you remember about Static Route?",
        "back": "**Exam cue:** Two static routes are configured for the same destination network with the same administrative distance: one via 10.0.0.1 and one via 10.0.0.2. **Key response:** Both routes are installed for equal-cost load balancing. **Why:** Two static routes to the same prefix with equal AD install as equal-cost paths — the router load-balances across both next hops."
      },
      {
        "id": "3.4-align-f14",
        "ckuId": "CKU-WILDCARD-MASK",
        "front": "What should you remember about Wildcard Mask?",
        "back": "**The inverse of a subnet mask used in ACLs: 0 = must match, 1 = don’t care**. /24 → 0.0.0.255."
      }
    ]
  },
  "3.5": {
    "flashcards": [
      {
        "id": "3.5-align-f1",
        "ckuId": "CKU-VRRP",
        "front": "What should you remember about Vrrp?",
        "back": "**Exam cue:** Which protocol is an IEEE standard that is supported openly as a first hop redundancy protocol (FHRP)? **Key response:** VRRP. **Why:** VRRP (RFC 5798) is the open IEEE/IETF standard FHRP — HSRP and GLBP are Cisco-proprietary alternatives."
      },
      {
        "id": "3.5-align-f2",
        "ckuId": "CKU-DR-BDR",
        "front": "What should you remember about Dr Bdr?",
        "back": "**Exam cue:** Routing table excerpt: C 192.168.1.0/26 is directly connected, Serial0/0 S 192.168.1.0/24 [1/0] via 172.16.1.100 O 192.168.1.128/25 [110/10] via 172.… **Key response:** The exit interface Serial 0/0. **Why:** The routing table shows next hop via Serial 0/0 for that destination — traffic exits that interface."
      },
      {
        "id": "3.5-align-f3",
        "ckuId": "CKU-GLBP",
        "front": "What should you remember about Glbp?",
        "back": "**Exam cue:** Which protocol is an IEEE standard that is supported openly as a first hop redundancy protocol (FHRP)? **Key response:** VRRP. **Why:** VRRP (RFC 5798) is the open IEEE/IETF standard FHRP — HSRP and GLBP are Cisco-proprietary alternatives."
      },
      {
        "id": "3.5-align-f4",
        "ckuId": "CKU-PRIORITY",
        "front": "What should you remember about Priority?",
        "back": "**Exam cue:** How is a DR elected for OSPF? **Key response:** The DR is elected by the highest priority and highest RID in the same area.. **Why:** DR election: highest OSPF priority wins; tie-break highest RID — election is per segment within an area."
      },
      {
        "id": "3.5-align-f5",
        "ckuId": "CKU-DEFAULT-ROUTE",
        "front": "What should you remember about Default Route (Gateway of Last Resort)?",
        "back": "**The route 0.0.0.0/0** (::/0 for IPv6) with prefix length 0 — it matches every destination but is the LEAST specific, so longest-prefix-match only uses it when no more-specific route matches."
      },
      {
        "id": "3.5-align-f6",
        "ckuId": "CKU-OSPF-HELLO",
        "front": "What should you remember about Ospf Hello?",
        "back": "**Exam cue:** In which database can you see all of the routers discovered in the OSPF network in which hello packets were sent and acknowledged? **Key response:** The neighborship database. **Why:** Hello packets establish/maintain neighbor relationships — view them with show ip ospf neighbor (the neighborship table)."
      },
      {
        "id": "3.5-align-f7",
        "ckuId": "CKU-PREEMPTION",
        "front": "What should you remember about Preemption?",
        "back": "**Exam cue:** What is the definition of preemption for HSRP? **Key response:** When a standby router comes online, it allows for a re-election of the active router.. **Why:** Preemption lets a higher-priority router take over active role when it comes online — without it, the incumbent stays active."
      },
      {
        "id": "3.5-align-f8",
        "ckuId": "CKU-ARP",
        "front": "What should you remember about Arp?",
        "back": "**Exam cue:** What is the relevance of the default gateway address on a host that is transmitting to a destination for the first time? **Key response:** The host sends an ARP packet for the default gateway when the destination is remote.. **Why:** For a remote destination, the host ARP-resolves the default gateway's MAC — IP stays the final destination."
      },
      {
        "id": "3.5-align-f9",
        "ckuId": "CKU-IPV6-STATIC-ROUTE",
        "front": "What should you remember about IPv6 Static Route Syntax?",
        "back": "**ipv6 route <prefix>/<length> {<next-hop-ipv6> | <exit-interface>}**. IPv6 default: ipv6 route ::/0 <next-hop>. Requires ipv6 unicast-routing globally."
      }
    ],
    "reading": {
      "bigTakeaway": "HSRP/VRRP/GLBP give hosts a virtual default gateway so a standby router can take over if the active fails.",
      "definition": "First-hop redundancy protocols (HSRP, VRRP, GLBP) present a shared virtual IP/MAC as the default gateway so end hosts keep connectivity when the active router fails.",
      "tiers": {
        "beginner": "Hosts use a default gateway. FHRPs let two or more routers share one virtual gateway IP so if the active router dies, a standby takes over without reconfiguring every PC.",
        "intermediate": "HSRP is Cisco-proprietary (active/standby). VRRP is the open standard. GLBP can load-balance across multiple forwarders. Key knobs: priority, preemption, and the virtual IP on the LAN.",
        "examReady": "Know who is Active vs Standby, when preemption matters, and that hosts ARP for the virtual MAC — not each physical router IP. Verify with show standby / show vrrp."
      },
      "keyPoints": [
        "FHRP = shared virtual default gateway for hosts.",
        "HSRP (Cisco) vs VRRP (open); GLBP can load-balance.",
        "Priority + preemption decide who becomes active; verify with show standby."
      ],
      "related": [
        "3.1 Interpret the components of a routing table",
        "3.3 Configure and verify IPv4 and IPv6 static routing",
        "1.10 Verify IP parameters for client OS"
      ]
    }
  },
  "3.6": {
    "flashcards": [
      {
        "id": "3.6-align-f1",
        "ckuId": "CKU-ROUTING-TROUBLESHOOTING",
        "front": "What should you remember about Routing Troubleshooting?",
        "back": "**Exam cue:** An administrator configures `ip route 0.0.0.0 0.0.0.0 203.0.113.1` on an edge router but hosts still cannot reach the internet, even though show ip r… **Key response:** 203.0.113.1 itself may be unreachable, or NAT is not configured for the internal hosts. **Why:** A default route being present in the table does not guarantee end-to-end reachability. Common remaining causes are an unreachable next hop or missing NAT/PAT translation for internal private addresses."
      },
      {
        "id": "3.6-align-f2",
        "ckuId": "CKU-STATIC-ROUTE",
        "front": "What should you remember about Static Route?",
        "back": "**Exam cue:** Two static routes are configured for the same destination network with the same administrative distance: one via 10.0.0.1 and one via 10.0.0.2. **Key response:** Both routes are installed for equal-cost load balancing. **Why:** Two static routes to the same prefix with equal AD install as equal-cost paths — the router load-balances across both next hops."
      },
      {
        "id": "3.6-align-f3",
        "ckuId": "CKU-ADMINISTRATIVE-DISTANCE",
        "front": "What should you remember about Administrative Distance?",
        "back": "**A measure of how trustworthy a routing source is (lower = more trusted)**. Used to choose between routes to the SAME prefix learned from DIFFERENT sources. An AD of 255 means the route is never installed."
      },
      {
        "id": "3.6-align-f4",
        "ckuId": "CKU-ROUTE-TABLE",
        "front": "What should you remember about Route Table?",
        "back": "**Exam cue:** A static route's exit interface goes down. What happens to that static route in the routing table? **Key response:** It is removed from the routing table until the interface comes back up. **Why:** A static route depends on its exit interface (or a reachable next hop) being up. If the interface goes down, the route is removed from the routing table until reachability is restored."
      },
      {
        "id": "3.6-align-f5",
        "ckuId": "CKU-DEFAULT-GATEWAY",
        "front": "What should you remember about Default Gateway?",
        "back": "**Exam cue:** A host can ping devices on its local subnet but cannot reach any remote subnets, including the internet. The host's IP and subnet mask are correct. **Key response:** The host is missing a default gateway, or the gateway is misconfigured. **Why:** Local-subnet connectivity working but remote connectivity failing is the classic symptom of a missing or incorrect default gateway."
      },
      {
        "id": "3.6-align-f6",
        "ckuId": "CKU-DEFAULT-ROUTE",
        "front": "What should you remember about Default Route (Gateway of Last Resort)?",
        "back": "**The route 0.0.0.0/0** (::/0 for IPv6) with prefix length 0 — it matches every destination but is the LEAST specific, so longest-prefix-match only uses it when no more-specific route matches."
      },
      {
        "id": "3.6-align-f7",
        "ckuId": "CKU-FLOATING-STATIC",
        "front": "What should you remember about Floating Static Route?",
        "back": "**A static route with an AD higher than the primary dynamic route** (e.g. AD 130 to back up OSPF AD 110). Not installed while the primary route is present; rises in when the primary fails."
      },
      {
        "id": "3.6-align-f8",
        "ckuId": "CKU-INTERFACE-STATUS",
        "front": "What should you remember about Interface Status?",
        "back": "**Exam cue:** show ip route shows a correct entry for a remote network via a directly connected neighbor, but pings to that neighbor's interface fail. **Key response:** Layer 1/2 status of the connecting link (interface up/up, cabling, duplex). **Why:** Routing table can be correct while L1/L2 is broken — ping the directly connected neighbor fails: check cable, up/up, speed/duplex first."
      },
      {
        "id": "3.6-align-f9",
        "ckuId": "CKU-LOAD-BALANCING",
        "front": "What should you remember about Load Balancing?",
        "back": "**Exam cue:** Two static routes are configured for the same destination network with the same administrative distance: one via 10.0.0.1 and one via 10.0.0.2. **Key response:** Both routes are installed for equal-cost load balancing. **Why:** Two static routes to the same prefix with equal AD install as equal-cost paths — the router load-balances across both next hops."
      },
      {
        "id": "3.6-align-f10",
        "ckuId": "CKU-NETWORK-ADDRESS-TRANSLATION",
        "front": "What should you remember about Network Address Translation?",
        "back": "**Exam cue:** An administrator configures `ip route 0.0.0.0 0.0.0.0 203.0.113.1` on an edge router but hosts still cannot reach the internet, even though show ip r… **Key response:** 203.0.113.1 itself may be unreachable, or NAT is not configured for the internal hosts. **Why:** A default route being present in the table does not guarantee end-to-end reachability. Common remaining causes are an unreachable next hop or missing NAT/PAT translation for internal private addresses."
      },
      {
        "id": "3.6-align-f11",
        "ckuId": "CKU-OSPF-NEIGHBOR",
        "front": "What should you remember about OSPF Neighbors & RID?",
        "back": "**Neighbors must match area, subnet/mask, hello/dead timers, and authentication**. Router ID = highest loopback IP, else highest active interface IP, or set manually."
      },
      {
        "id": "3.6-align-f12",
        "ckuId": "CKU-OSPFV2",
        "front": "What should you remember about Ospfv2?",
        "back": "**Exam cue:** A network has two routers, R1 and R2, both running OSPF. R1's routing table is missing a network that R2 advertises. **Key response:** show ip ospf neighbor. **Why:** show ip ospf neighbor shows the state of OSPF adjacencies (e.g., FULL). If R1 and R2 have not formed a FULL adjacency, R1 will not receive R2 routes."
      },
      {
        "id": "3.6-align-f13",
        "ckuId": "CKU-RECURSIVE-LOOKUP",
        "front": "What should you remember about Recursive Lookup?",
        "back": "**Exam cue:** A static route is configured pointing to a next-hop IP address rather than an exit interface. **Key response:** A recursive lookup to find the exit interface for the next-hop IP. **Why:** A next-hop (recursive) static route requires the router to look up the routing table again to determine which interface reaches the next-hop IP."
      },
      {
        "id": "3.6-align-f14",
        "ckuId": "CKU-ROUTE-SELECTION",
        "front": "What should you remember about Route Selection?",
        "back": "**Exam cue:** A router has a static route to 192.168.30.0/24 (administrative distance 1) and an OSPF-learned route to the same network (administrative distance 110… **Key response:** The static route, because it has the lower administrative distance. **Why:** When multiple sources offer a route to the same destination, the router prefers the route with the lowest administrative distance. A static route (AD 1) beats OSPF (AD 110)."
      },
      {
        "id": "3.6-align-f15",
        "ckuId": "CKU-SHOW-IP-ROUTE",
        "front": "What should you remember about Show Ip Route?",
        "back": "**Exam cue:** Which command displays the router's current routing table, including the source (static, connected, or routing protocol) of each route? **Key response:** show ip route. **Why:** show ip route displays the routing table with each route's source (C connected, S static, O OSPF, etc.)."
      }
    ],
    "reading": {
      "bigTakeaway": "Routing troubleshooting is layered: confirm the interface is up, the expected route is installed, the next-hop is reachable, then test path and return path.",
      "definition": "Troubleshoot routing by verifying Layer 1/2 (interface up/up), Layer 3 (correct connected/static/OSPF routes and next-hop), adjacency health when using OSPF, and end-to-end path with ping/traceroute — including return-path and NAT issues at the edge.",
      "tiers": {
        "beginner": "If traffic does not reach a remote network, start simple: Is the interface up? Is there a route? Can you ping the next hop? A missing default route or wrong gateway is a common cause when local pings work but remote fails.",
        "intermediate": "Common causes: interface down, wrong static next-hop/exit interface, OSPF area/timer/auth/passive mismatches, ACLs blocking routing or data traffic, and asymmetric return paths. Use show ip interface brief, show ip route, show ip ospf neighbor, traceroute, and ping.",
        "examReady": "Do not treat OSPF 2-Way alone as proof of failure on multi-access — DROTHERs often stay 2-Way; Full is with DR/BDR. Separate AD vs metric, connected (C) vs local (L) vs static (S), and verify longest-match before blaming the protocol."
      },
      "keyPoints": [
        "Check interface status and addressing before blaming the routing protocol.",
        "Confirm the expected prefix is in show ip route with the right code and next-hop.",
        "For OSPF: verify neighbor state (2-Way can be normal for DROTHER), area, network statements, and passive-interface.",
        "Use ping/traceroute (and source interface) to find where the path breaks; consider return path and NAT at the edge."
      ],
      "related": [
        "3.1 Interpret the components of a routing table",
        "3.3 Configure and verify IPv4 and IPv6 static routing",
        "3.4 Configure and verify single-area OSPFv2"
      ]
    }
  },
  "4.1": {
    "flashcards": [
      {
        "id": "4.1-align-f1",
        "ckuId": "CKU-INSIDE-SOURCE-NAT",
        "front": "What should you remember about Inside Source Nat?",
        "back": "**Exam cue:** Which method will allow you to use RFC 1918 addresses for Internet requests? **Key response:** NAT. **Why:** NAT translates private RFC 1918 addresses to routable public addresses so inside hosts can reach the Internet."
      },
      {
        "id": "4.1-align-f2",
        "ckuId": "CKU-STATIC-NAT",
        "front": "What should you remember about Static Nat?",
        "back": "**Exam cue:** Which method will allow you to use RFC 1918 addresses for Internet requests? **Key response:** NAT. **Why:** NAT translates private RFC 1918 addresses to routable public addresses so inside hosts can reach the Internet."
      },
      {
        "id": "4.1-align-f3",
        "ckuId": "CKU-NAT-TRANSLATIONS",
        "front": "What should you remember about Nat Translations?",
        "back": "**Exam cue:** Which command can view the NAT translations active on the router? **Key response:** Router#show ip nat translations. **Why:** show ip nat translations displays active NAT translation entries — inside/outside local and global address mappings."
      },
      {
        "id": "4.1-align-f4",
        "ckuId": "CKU-DYNAMIC-NAT",
        "front": "What should you remember about Dynamic Nat?",
        "back": "**Exam cue:** NAT topology: - Host A (inside local): 192.168.1.2 on LAN - Router A Gi0/0 (192.168.1.1): ip nat inside - Router A S0/0 (inside global): 179.43.44. **Key response:** RouterA(config)#ip nat pool EntPool 179.43.44.1 179.43.44.15 netmask 255.255.255.240. **Why:** Pool for the owned 179.43.44.0/28 uses netmask 255.255.255.240 — not a /24 mask."
      },
      {
        "id": "4.1-align-f5",
        "ckuId": "CKU-NAT-INSIDE-GLOBAL",
        "front": "What should you remember about Nat Inside Global?",
        "back": "**Exam cue:** NAT topology: - Host A (inside local): 192.168.1.2 on LAN - Router A Gi0/0 (192.168.1.1): ip nat inside - Router A S0/0 (inside global): 179.43.44. **Key response:** 179.43.44.1 Router A S0/0. **Why:** Inside global is the public address representing an inside host to the outside world — here 179.43.44.1 on Router A S0/0."
      },
      {
        "id": "4.1-align-f6",
        "ckuId": "CKU-NAT-INSIDE-LOCAL",
        "front": "What should you remember about Nat Inside Local?",
        "back": "**Exam cue:** NAT topology: - Host A (inside local): 192.168.1.2 on LAN - Router A Gi0/0 (192.168.1.1): ip nat inside - Router A S0/0 (inside global): 179.43.44. **Key response:** 192.168.1.2 Host A. **Why:** Inside local is the private address as configured on the host inside the network — Host A at 192.168.1.2."
      },
      {
        "id": "4.1-align-f7",
        "ckuId": "CKU-NAT-OUTSIDE-GLOBAL",
        "front": "What should you remember about Nat Outside Global?",
        "back": "**Exam cue:** NAT topology: - Host A (inside local): 192.168.1.2 on LAN - Router A Gi0/0 (192.168.1.1): ip nat inside - Router A S0/0 (inside global): 179.43.44. **Key response:** 198.23.53.3 web server. **Why:** Outside global is the Internet-routable address of the remote server as seen by the inside network — 198.23.53.3."
      },
      {
        "id": "4.1-align-f8",
        "ckuId": "CKU-NAT-POOL",
        "front": "What should you remember about Nat Pool?",
        "back": "**Exam cue:** NAT topology: - Host A (inside local): 192.168.1.2 on LAN - Router A Gi0/0 (192.168.1.1): ip nat inside - Router A S0/0 (inside global): 179.43.44. **Key response:** RouterA(config)#ip nat pool EntPool 179.43.44.1 179.43.44.15 netmask 255.255.255.240. **Why:** Pool for the owned 179.43.44.0/28 uses netmask 255.255.255.240 — not a /24 mask."
      },
      {
        "id": "4.1-align-f9",
        "ckuId": "CKU-NETWORK-TIME-PROTOCOL",
        "front": "What should you remember about Network Time Protocol?",
        "back": "**Exam cue:** NAT topology: - Host A (inside local): 192.168.1.2 on LAN - Router A Gi0/0 (192.168.1.1): ip nat inside - Router A S0/0 (inside global): 179.43.44. **Key response:** RouterA(config)#ip nat pool EntPool 179.43.44.1 179.43.44.15 netmask 255.255.255.240. **Why:** Pool for the owned 179.43.44.0/28 uses netmask 255.255.255.240 — not a /24 mask."
      },
      {
        "id": "4.1-align-f10",
        "ckuId": "CKU-SNMP-VIEW",
        "front": "What should you remember about Snmp View?",
        "back": "**Exam cue:** Which command can view the NAT translations active on the router? **Key response:** Router#show ip nat translations. **Why:** show ip nat translations displays active NAT translation entries — inside/outside local and global address mappings."
      },
      {
        "id": "4.1-align-f11",
        "ckuId": "CKU-SNMP-INFORM",
        "front": "What should you remember about Snmp Inform?",
        "back": "**Exam cue:** Which command display an overview of the current number of active NAT translations on the router, as well as other overview information? **Key response:** Router#show ip nat statistics. **Why:** show ip nat statistics summarizes translation counts, hits/misses, and NAT configuration overview — not every individual entry."
      }
    ],
    "reading": {
      "tiers": {
        "beginner": "Configure and verify inside source NAT shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "4.2": {
    "flashcards": [
      {
        "id": "4.2-align-f1",
        "ckuId": "CKU-NTP-CLIENT",
        "front": "What should you remember about Ntp Client?",
        "back": "**Exam cue:** Which command allow your router to synchronize with a time source of 129.6.15.28? **Key response:** Router(config)#ntp server 129.6.15.28. **Why:** NTP server is configured in global config mode: ntp server 129.6.15.28 — synchronizes router clock to the stratum source."
      },
      {
        "id": "4.2-align-f2",
        "ckuId": "CKU-NTP-SERVER",
        "front": "What should you remember about Ntp Server?",
        "back": "**Exam cue:** Which command allow your router to synchronize with a time source of 129.6.15.28? **Key response:** Router(config)#ntp server 129.6.15.28. **Why:** NTP server is configured in global config mode: ntp server 129.6.15.28 — synchronizes router clock to the stratum source."
      },
      {
        "id": "4.2-align-f3",
        "ckuId": "CKU-CLOCK",
        "front": "What should you remember about Clock?",
        "back": "**Exam cue:** Which command configures the router or switch to trust its internal time clock? **Key response:** Router(config)#ntp master. **Why:** ntp master configures the device to act as an authoritative NTP time source using its system clock."
      },
      {
        "id": "4.2-align-f4",
        "ckuId": "CKU-NTP-SOURCE",
        "front": "What should you remember about Ntp Source?",
        "back": "**Exam cue:** You are configuring NTP on your switch. You want to configure the switch so if any interface fails, NTP will still be available. **Key response:** Loopback interface. **Why:** A loopback interface stays up even if physical interfaces fail — NTP source binding remains reachable."
      },
      {
        "id": "4.2-align-f5",
        "ckuId": "CKU-SNMP-VIEW",
        "front": "What should you remember about Snmp View?",
        "back": "**Exam cue:** Which command can view the NAT translations active on the router? **Key response:** Router#show ip nat translations. **Why:** show ip nat translations displays active NAT translation entries — inside/outside local and global address mappings."
      },
      {
        "id": "4.2-align-f6",
        "ckuId": "CKU-CLOCK-TIMEZONE",
        "front": "What should you remember about Clock Timezone?",
        "back": "**Exam cue:** Which command sets the time zone of a router for Pacific Standard Time? **Key response:** Router(config)#clock timezone pst -8 0. **Why:** clock timezone pst -8 0 sets Pacific Standard Time — offset -8 hours, no DST offset (second value 0)."
      },
      {
        "id": "4.2-align-f7",
        "ckuId": "CKU-DOMAIN-NAME-SYSTEM",
        "front": "What should you remember about Domain Name System?",
        "back": "**Exam cue:** Which is a best practice for setting up NTP? **Key response:** Always configure the time source to a DNS address.. **Why:** Use a DNS hostname for the NTP server — if the server's IP changes, devices follow the name without reconfiguration."
      }
    ],
    "reading": {
      "tiers": {
        "beginner": "Configure and verify NTP shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "4.3": {
    "flashcards": [
      {
        "id": "4.3-align-f1",
        "ckuId": "CKU-DNS-A-RECORD",
        "front": "What should you remember about Dns A Record?",
        "back": "**Exam cue:** Which statement is correct about reverse lookups? **Key response:** A reverse lookup is the resolution of an IP address to FQDN.. **Why:** Reverse DNS resolves an IP address to an FQDN — forward DNS maps names to addresses."
      },
      {
        "id": "4.3-align-f2",
        "ckuId": "CKU-DNS-REVERSE-LOOKUP",
        "front": "What should you remember about Dns Reverse Lookup?",
        "back": "**Exam cue:** Which statement is correct about reverse lookups? **Key response:** A reverse lookup is the resolution of an IP address to FQDN.. **Why:** Reverse DNS resolves an IP address to an FQDN — forward DNS maps names to addresses."
      },
      {
        "id": "4.3-align-f3",
        "ckuId": "CKU-DNS-RECORD",
        "front": "What should you remember about Dns Record?",
        "back": "**Exam cue:** Which record type is used for an IPv4 address mapping to FQDN for DNS queries? **Key response:** The PTR record. **Why:** PTR records map an IPv4 address to an FQDN (reverse DNS) — forward name-to-IP uses A records."
      },
      {
        "id": "4.3-align-f4",
        "ckuId": "CKU-HOSTNAME",
        "front": "What should you remember about Hostname?",
        "back": "**Exam cue:** What gets appended to hostname queries for DNS resolution? **Key response:** The DNS domain name. **Why:** IOS appends the configured DNS domain name to unqualified hostnames before querying — ip domain-name."
      },
      {
        "id": "4.3-align-f5",
        "ckuId": "CKU-DHCP-LEASE",
        "front": "What should you remember about Dhcp Lease?",
        "back": "**Exam cue:** At what point of the lease time will the client ask for a renewal of the IP address from the DHCP server? **Key response:** One-half of the lease. **Why:** Clients begin renewal at 50% (T1) of lease time — unicast DHCPREQUEST to the leasing server."
      },
      {
        "id": "4.3-align-f6",
        "ckuId": "CKU-DHCP-ACK",
        "front": "What should you remember about Dhcp Ack?",
        "back": "**Exam cue:** Which message is sent from the DHCP client to the DHCP server to confirm the offer of an IP address? **Key response:** Acknowledgment. **Why:** After receiving an Offer, the client sends DHCPACK-bound DHCP Request, then ACK confirms the lease (DORA: Discover, Offer, Request, Acknowledgment)."
      },
      {
        "id": "4.3-align-f7",
        "ckuId": "CKU-DHCP-DISCOVER",
        "front": "What should you remember about Dhcp Discover?",
        "back": "**Exam cue:** Which message is sent from the DHCP client to the DHCP server to confirm the offer of an IP address? **Key response:** Acknowledgment. **Why:** After receiving an Offer, the client sends DHCPACK-bound DHCP Request, then ACK confirms the lease (DORA: Discover, Offer, Request, Acknowledgment)."
      },
      {
        "id": "4.3-align-f8",
        "ckuId": "CKU-DHCP-OFFER",
        "front": "What should you remember about Dhcp Offer?",
        "back": "**Exam cue:** Which message is sent from the DHCP client to the DHCP server to confirm the offer of an IP address? **Key response:** Acknowledgment. **Why:** After receiving an Offer, the client sends DHCPACK-bound DHCP Request, then ACK confirms the lease (DORA: Discover, Offer, Request, Acknowledgment)."
      },
      {
        "id": "4.3-align-f9",
        "ckuId": "CKU-DNS-TTL",
        "front": "What should you remember about Dns Ttl?",
        "back": "**Exam cue:** What limits the amount of time that a DNS entry is available in the DNS cache? **Key response:** TTL. **Why:** TTL (Time To Live) on DNS records limits how long resolvers cache an entry before re-querying."
      },
      {
        "id": "4.3-align-f10",
        "ckuId": "CKU-DOMAIN-NAME",
        "front": "What should you remember about Domain Name?",
        "back": "**Exam cue:** What gets appended to hostname queries for DNS resolution? **Key response:** The DNS domain name. **Why:** IOS appends the configured DNS domain name to unqualified hostnames before querying — ip domain-name."
      },
      {
        "id": "4.3-align-f11",
        "ckuId": "CKU-NAT-POOL",
        "front": "What should you remember about Nat Pool?",
        "back": "**Exam cue:** NAT topology: - Host A (inside local): 192.168.1.2 on LAN - Router A Gi0/0 (192.168.1.1): ip nat inside - Router A S0/0 (inside global): 179.43.44. **Key response:** RouterA(config)#ip nat pool EntPool 179.43.44.1 179.43.44.15 netmask 255.255.255.240. **Why:** Pool for the owned 179.43.44.0/28 uses netmask 255.255.255.240 — not a /24 mask."
      },
      {
        "id": "4.3-align-f12",
        "ckuId": "CKU-TRANSPORT-INPUT",
        "front": "What should you remember about Transport Input?",
        "back": "**Exam cue:** Which transport protocol does DHCP use? **Key response:** UDP. **Why:** DHCP uses UDP — client to server on 67, server to client on 68."
      }
    ],
    "reading": {
      "tiers": {
        "beginner": "Explain the role of DHCP and DNS shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "4.4": {
    "flashcards": [
      {
        "id": "4.4-align-f1",
        "ckuId": "CKU-MIB",
        "front": "What should you remember about Mib?",
        "back": "**Exam cue:** Which version of SNMP offers authentication and encryption? **Key response:** SNMP version 3. **Why:** SNMPv3 adds authentication and encryption (priv) — v1/v2c rely on community strings in cleartext."
      },
      {
        "id": "4.4-align-f2",
        "ckuId": "CKU-SNMPV3",
        "front": "What should you remember about Snmpv3?",
        "back": "**Exam cue:** Which version of SNMP offers authentication and encryption? **Key response:** SNMP version 3. **Why:** SNMPv3 adds authentication and encryption (priv) — v1/v2c rely on community strings in cleartext."
      },
      {
        "id": "4.4-align-f3",
        "ckuId": "CKU-COMMUNITY-STRING",
        "front": "What should you remember about Community String?",
        "back": "**Exam cue:** Identify the database of variables that SNMP uses to allow for collection of data? **Key response:** Management information base. **Why:** The MIB (Management Information Base) is SNMP's structured database of managed objects."
      },
      {
        "id": "4.4-align-f4",
        "ckuId": "CKU-SNMP-INFORM",
        "front": "What should you remember about Snmp Inform?",
        "back": "**Exam cue:** Which command display an overview of the current number of active NAT translations on the router, as well as other overview information? **Key response:** Router#show ip nat statistics. **Why:** show ip nat statistics summarizes translation counts, hits/misses, and NAT configuration overview — not every individual entry."
      },
      {
        "id": "4.4-align-f5",
        "ckuId": "CKU-SNMP-TRAP",
        "front": "What should you remember about Snmp Trap?",
        "back": "**Exam cue:** What type of SNMP message is sent to a network management station when an interface goes down? **Key response:** Trap message. **Why:** SNMP trap messages are unsolicited alerts sent from the agent to the NMS when an event occurs (e.g., interface down)."
      },
      {
        "id": "4.4-align-f6",
        "ckuId": "CKU-OID",
        "front": "What should you remember about Oid?",
        "back": "**Exam cue:** Identify the database of variables that SNMP uses to allow for collection of data? **Key response:** Management information base. **Why:** The MIB (Management Information Base) is SNMP's structured database of managed objects."
      },
      {
        "id": "4.4-align-f7",
        "ckuId": "CKU-DHCP-ACK",
        "front": "What should you remember about Dhcp Ack?",
        "back": "**Exam cue:** Which message is sent from the DHCP client to the DHCP server to confirm the offer of an IP address? **Key response:** Acknowledgment. **Why:** After receiving an Offer, the client sends DHCPACK-bound DHCP Request, then ACK confirms the lease (DORA: Discover, Offer, Request, Acknowledgment)."
      },
      {
        "id": "4.4-align-f8",
        "ckuId": "CKU-DHCP-OFFER",
        "front": "What should you remember about Dhcp Offer?",
        "back": "**Exam cue:** Which message is sent from the DHCP client to the DHCP server to confirm the offer of an IP address? **Key response:** Acknowledgment. **Why:** After receiving an Offer, the client sends DHCPACK-bound DHCP Request, then ACK confirms the lease (DORA: Discover, Offer, Request, Acknowledgment)."
      },
      {
        "id": "4.4-align-f9",
        "ckuId": "CKU-SNMP-VIEW",
        "front": "What should you remember about Snmp View?",
        "back": "**Exam cue:** Which command can view the NAT translations active on the router? **Key response:** Router#show ip nat translations. **Why:** show ip nat translations displays active NAT translation entries — inside/outside local and global address mappings."
      },
      {
        "id": "4.4-align-f10",
        "ckuId": "CKU-SYSLOG",
        "front": "What should you remember about Syslog?",
        "back": "**Standard logging to console, buffer, or remote collector**. Severity 0 (emergency) to 7 (debug)."
      }
    ],
    "reading": {
      "tiers": {
        "beginner": "Explain the function of SNMP shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "4.5": {
    "flashcards": [
      {
        "id": "4.5-align-f1",
        "ckuId": "CKU-SYSLOG-SEVERITY",
        "front": "What should you remember about Syslog Severity?",
        "back": "**Exam cue:** Which protocol and port number does syslog use? **Key response:** UDP/514. **Why:** Syslog ships log messages to a collector on UDP/514 (unreliable but low overhead)."
      },
      {
        "id": "4.5-align-f2",
        "ckuId": "CKU-SYSLOG-UDP-514",
        "front": "What should you remember about Syslog Udp 514?",
        "back": "**Exam cue:** Which protocol and port number does syslog use? **Key response:** UDP/514. **Why:** Syslog ships log messages to a collector on UDP/514 (unreliable but low overhead)."
      },
      {
        "id": "4.5-align-f3",
        "ckuId": "CKU-LOGGING-CONSOLE",
        "front": "What should you remember about Logging Console?",
        "back": "**Exam cue:** Which command limit console logging to the severity level of alerts? **Key response:** Router(config)#logging console 0. **Why:** Router(config)#logging console <level> sets console severity in global config — this bank keys logging console 0; logging console 1 is the alerts threshold on live IOS."
      },
      {
        "id": "4.5-align-f4",
        "ckuId": "CKU-SYSLOG-DEBUGGING",
        "front": "What should you remember about Syslog Debugging?",
        "back": "**Exam cue:** Which command configure the severity level of syslog events that will be sent to the syslog server for debugging? **Key response:** Router(config)#logging trap debugging. **Why:** Send debugging-level syslog to the server with logging trap debugging — sets the remote severity threshold."
      },
      {
        "id": "4.5-align-f5",
        "ckuId": "CKU-LOGGING-BUFFERED",
        "front": "What should you remember about Logging Buffered?",
        "back": "**Exam cue:** Which command configure logging stored in RAM to include only logs with a severity level of emergencies and alerts? **Key response:** Switch(config)#logging buffered 1. **Why:** logging buffered 1 stores emergencies (0) and alerts (1) in RAM — level 1 caps at alerts severity."
      },
      {
        "id": "4.5-align-f6",
        "ckuId": "CKU-SNMP-INFORM",
        "front": "What should you remember about Snmp Inform?",
        "back": "**Exam cue:** Which command display an overview of the current number of active NAT translations on the router, as well as other overview information? **Key response:** Router#show ip nat statistics. **Why:** show ip nat statistics summarizes translation counts, hits/misses, and NAT configuration overview — not every individual entry."
      },
      {
        "id": "4.5-align-f7",
        "ckuId": "CKU-SNMP-TRAP",
        "front": "What should you remember about Snmp Trap?",
        "back": "**Exam cue:** What type of SNMP message is sent to a network management station when an interface goes down? **Key response:** Trap message. **Why:** SNMP trap messages are unsolicited alerts sent from the agent to the NMS when an event occurs (e.g., interface down)."
      },
      {
        "id": "4.5-align-f8",
        "ckuId": "CKU-LOGGING-TIMESTAMPS",
        "front": "What should you remember about Logging Timestamps?",
        "back": "**Exam cue:** Which command send logging with time stamps rather than sequence numbers? **Key response:** Switch(config)#service timestamps log datetime. **Why:** Enable log timestamps with service timestamps log datetime — replaces sequence numbers with date/time."
      },
      {
        "id": "4.5-align-f9",
        "ckuId": "CKU-NETWORK-ADDRESS-TRANSLATION",
        "front": "What should you remember about Network Address Translation?",
        "back": "**Exam cue:** An administrator configures `ip route 0.0.0.0 0.0.0.0 203.0.113.1` on an edge router but hosts still cannot reach the internet, even though show ip r… **Key response:** 203.0.113.1 itself may be unreachable, or NAT is not configured for the internal hosts. **Why:** A default route being present in the table does not guarantee end-to-end reachability. Common remaining causes are an unreachable next hop or missing NAT/PAT translation for internal private addresses."
      }
    ],
    "reading": {
      "tiers": {
        "beginner": "Describe the use of syslog features shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "4.6": {
    "flashcards": [
      {
        "id": "4.6-align-f1",
        "ckuId": "CKU-DHCP-CLIENT",
        "front": "What should you remember about Dhcp Client?",
        "back": "**Exam cue:** Which command can verify the active DHCP server that has assigned an IP address to the router? **Key response:** Router#show dhcp lease. **Why:** show dhcp lease on a DHCP client router displays the active lease from the server that assigned the address."
      },
      {
        "id": "4.6-align-f2",
        "ckuId": "CKU-IP-HELPER-ADDRESS",
        "front": "What should you remember about Ip Helper Address?",
        "back": "**Exam cue:** Which command can verify the active DHCP server that has assigned an IP address to the router? **Key response:** Router#show dhcp lease. **Why:** show dhcp lease on a DHCP client router displays the active lease from the server that assigned the address."
      },
      {
        "id": "4.6-align-f3",
        "ckuId": "CKU-DHCP-LEASE",
        "front": "What should you remember about Dhcp Lease?",
        "back": "**Exam cue:** At what point of the lease time will the client ask for a renewal of the IP address from the DHCP server? **Key response:** One-half of the lease. **Why:** Clients begin renewal at 50% (T1) of lease time — unicast DHCPREQUEST to the leasing server."
      },
      {
        "id": "4.6-align-f4",
        "ckuId": "CKU-DHCPV6",
        "front": "What should you remember about Dhcpv6?",
        "back": "**Exam cue:** Identify DHCPv6 used for when a network is configured for Stateless Address Autoconfiguration (SLAAC)? **Key response:** Configuration of clients with IPv6 options. **Why:** With SLAAC, hosts self-assign addresses — DHCPv6 delivers options (DNS, domain name) without assigning the address."
      },
      {
        "id": "4.6-align-f5",
        "ckuId": "CKU-DHCP-OFFER",
        "front": "What should you remember about Dhcp Offer?",
        "back": "**Exam cue:** Which message is sent from the DHCP client to the DHCP server to confirm the offer of an IP address? **Key response:** Acknowledgment. **Why:** After receiving an Offer, the client sends DHCPACK-bound DHCP Request, then ACK confirms the lease (DORA: Discover, Offer, Request, Acknowledgment)."
      },
      {
        "id": "4.6-align-f6",
        "ckuId": "CKU-GIADDR",
        "front": "What should you remember about Giaddr?",
        "back": "**Exam cue:** Which DHCP field helps a DHCP server decide which scope to serve to the DHCP relay agent? **Key response:** GIADDR. **Why:** GIADDR (Gateway IP Address) in the DHCP request tells the server which subnet/scope the client is on via the relay agent."
      },
      {
        "id": "4.6-align-f7",
        "ckuId": "CKU-NETWORK-ADDRESS-TRANSLATION",
        "front": "What should you remember about Network Address Translation?",
        "back": "**Exam cue:** An administrator configures `ip route 0.0.0.0 0.0.0.0 203.0.113.1` on an edge router but hosts still cannot reach the internet, even though show ip r… **Key response:** 203.0.113.1 itself may be unreachable, or NAT is not configured for the internal hosts. **Why:** A default route being present in the table does not guarantee end-to-end reachability. Common remaining causes are an unreachable next hop or missing NAT/PAT translation for internal private addresses."
      }
    ],
    "reading": {
      "tiers": {
        "beginner": "Configure and verify DHCP client and relay shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "4.7": {
    "flashcards": [
      {
        "id": "4.7-align-f1",
        "ckuId": "CKU-CLASSIFICATION",
        "front": "What should you remember about Classification?",
        "back": "**Exam cue:** How do routers classify traffic for QoS? **Key response:** Access control lists. **Why:** Routers classify traffic for QoS using ACLs (and class-maps) to match packets before marking or queuing."
      },
      {
        "id": "4.7-align-f2",
        "ckuId": "CKU-MARKING",
        "front": "What should you remember about Marking?",
        "back": "**Exam cue:** How do routers classify traffic for QoS? **Key response:** Access control lists. **Why:** Routers classify traffic for QoS using ACLs (and class-maps) to match packets before marking or queuing."
      },
      {
        "id": "4.7-align-f3",
        "ckuId": "CKU-QUEUING",
        "front": "What should you remember about Queuing?",
        "back": "**Exam cue:** Identify the measurement of packets discarded due to congestion of queues? **Key response:** Loss. **Why:** Packet loss measures frames dropped when queues overflow due to congestion — distinct from delay or jitter."
      },
      {
        "id": "4.7-align-f4",
        "ckuId": "CKU-JITTER",
        "front": "What should you remember about Jitter?",
        "back": "**Exam cue:** Which measurement describes the variation of consecutive packet time from source to destination? **Key response:** Jitter. **Why:** Jitter measures variation in inter-packet delay — critical for voice and video QoS."
      },
      {
        "id": "4.7-align-f5",
        "ckuId": "CKU-CBWFQ",
        "front": "What should you remember about Cbwfq?",
        "back": "**Exam cue:** Which QoS queue has priority over all other queues in the scheduler? **Key response:** LLQ. **Why:** LLQ (Low Latency Queuing) gives a strict-priority queue that always drains before other CBWFQ classes."
      },
      {
        "id": "4.7-align-f6",
        "ckuId": "CKU-CONGESTION",
        "front": "What should you remember about Congestion?",
        "back": "**Exam cue:** Identify the measurement of packets discarded due to congestion of queues? **Key response:** Loss. **Why:** Packet loss measures frames dropped when queues overflow due to congestion — distinct from delay or jitter."
      },
      {
        "id": "4.7-align-f7",
        "ckuId": "CKU-LLQ",
        "front": "What should you remember about Llq?",
        "back": "**Exam cue:** Which QoS queue has priority over all other queues in the scheduler? **Key response:** LLQ. **Why:** LLQ (Low Latency Queuing) gives a strict-priority queue that always drains before other CBWFQ classes."
      },
      {
        "id": "4.7-align-f8",
        "ckuId": "CKU-POLICING",
        "front": "What should you remember about Policing?",
        "back": "**Exam cue:** Which method helps combat queue starvation for QoS queuing? **Key response:** Policing. **Why:** Policing drops excess traffic at the rate limit — prevents one class from monopolizing queue capacity (starvation)."
      },
      {
        "id": "4.7-align-f9",
        "ckuId": "CKU-DSCP",
        "front": "What should you remember about Dscp?",
        "back": "**Exam cue:** Which DSCP marking has the highest priority? **Key response:** DSCP EF 46. **Why:** EF (46) is Expedited Forwarding — the highest-priority DSCP class for real-time traffic like VoIP."
      },
      {
        "id": "4.7-align-f10",
        "ckuId": "CKU-NETWORK-ADDRESS-TRANSLATION",
        "front": "What should you remember about Network Address Translation?",
        "back": "**Exam cue:** An administrator configures `ip route 0.0.0.0 0.0.0.0 203.0.113.1` on an edge router but hosts still cannot reach the internet, even though show ip r… **Key response:** 203.0.113.1 itself may be unreachable, or NAT is not configured for the internal hosts. **Why:** A default route being present in the table does not guarantee end-to-end reachability. Common remaining causes are an unreachable next hop or missing NAT/PAT translation for internal private addresses."
      },
      {
        "id": "4.7-align-f11",
        "ckuId": "CKU-OID",
        "front": "What should you remember about Oid?",
        "back": "**Exam cue:** Identify the database of variables that SNMP uses to allow for collection of data? **Key response:** Management information base. **Why:** The MIB (Management Information Base) is SNMP's structured database of managed objects."
      },
      {
        "id": "4.7-align-f12",
        "ckuId": "CKU-PORT-ADDRESS-TRANSLATION",
        "front": "What should you remember about Port Address Translation?",
        "back": "**Exam cue:** Many home devices share a single public IP. Which NAT type is this? **Key response:** PAT (overload). **Why:** PAT (NAT overload) maps many inside private hosts to one public IP using unique source ports."
      },
      {
        "id": "4.7-align-f13",
        "ckuId": "CKU-SHAPING",
        "front": "What should you remember about Shaping?",
        "back": "**Exam cue:** Which statement is correct about shaping of traffic for QoS? **Key response:** Shaping holds packets in the queue over the configured bit rate to cause delay.. **Why:** Shaping buffers excess packets above the CIR — introduces delay to smooth output to the contracted rate."
      },
      {
        "id": "4.7-align-f14",
        "ckuId": "CKU-TAIL-DROP",
        "front": "What should you remember about Tail Drop?",
        "back": "**Exam cue:** How do congestion avoidance tools help to prevent tail drop? **Key response:** When the queue depth is above the minimum threshold, a percentage of TCP packets are dropped.. **Why:** WRED randomly drops TCP packets when queue depth exceeds the minimum threshold — signals congestion before tail drop."
      }
    ],
    "reading": {
      "tiers": {
        "beginner": "Explain QoS forwarding per-hop behavior shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      },
      "keyPoints": [
        "QoS per-hop behavior: Classification/marking (DSCP/CoS), queuing (LLQ for voice), shaping vs policing, WRED congestion avoidance",
        "Trust boundaries define where markings are honored.",
        "Remember the exam-facing behavior for Explain QoS forwarding per-hop behavior (p"
      ]
    }
  },
  "4.8": {
    "flashcards": [
      {
        "id": "4.8-align-f1",
        "ckuId": "CKU-DOMAIN-NAME",
        "front": "What should you remember about Domain Name?",
        "back": "**Exam cue:** What gets appended to hostname queries for DNS resolution? **Key response:** The DNS domain name. **Why:** IOS appends the configured DNS domain name to unqualified hostnames before querying — ip domain-name."
      },
      {
        "id": "4.8-align-f2",
        "ckuId": "CKU-HOSTNAME",
        "front": "What should you remember about Hostname?",
        "back": "**Exam cue:** What gets appended to hostname queries for DNS resolution? **Key response:** The DNS domain name. **Why:** IOS appends the configured DNS domain name to unqualified hostnames before querying — ip domain-name."
      },
      {
        "id": "4.8-align-f3",
        "ckuId": "CKU-REMOTE-ACCESS",
        "front": "What should you remember about Remote Access?",
        "back": "**Exam cue:** You need to make a Telnet connection to a remote router from a router you are configuring. Which command will allow you to do this? **Key response:** Router#198.56.33.3. **Why:** From exec mode, type the target IP address directly (Router#198.56.33.3) to open a Telnet session to that host."
      },
      {
        "id": "4.8-align-f4",
        "ckuId": "CKU-LOCAL-USERNAME",
        "front": "What should you remember about Local Username?",
        "back": "**Exam cue:** Which command configure a local user for SSH access? **Key response:** Router(config)#username user1 password Password20!. **Why:** username <name> password <secret> creates a local user database entry for login authentication."
      },
      {
        "id": "4.8-align-f5",
        "ckuId": "CKU-BANNERS",
        "front": "What should you remember about Banners?",
        "back": "**Exam cue:** Which banner will be displayed first when a user connects to a Cisco device via SSH? **Key response:** Login banner. **Why:** The login banner (banner login) displays first when a user connects — before authentication prompts."
      },
      {
        "id": "4.8-align-f6",
        "ckuId": "CKU-CRYPTO-KEY-GENERATE-RSA",
        "front": "What should you remember about Crypto Key Generate Rsa?",
        "back": "**Exam cue:** Which command generate the encryption keys for SSH? **Key response:** Router(config)#crypto key generate rsa. **Why:** crypto key generate rsa in global config creates the RSA key pair used by SSH."
      },
      {
        "id": "4.8-align-f7",
        "ckuId": "CKU-DNS-RECORD",
        "front": "What should you remember about Dns Record?",
        "back": "**Exam cue:** Which record type is used for an IPv4 address mapping to FQDN for DNS queries? **Key response:** The PTR record. **Why:** PTR records map an IPv4 address to an FQDN (reverse DNS) — forward name-to-IP uses A records."
      },
      {
        "id": "4.8-align-f8",
        "ckuId": "CKU-DOMAIN-NAME-SYSTEM",
        "front": "What should you remember about Domain Name System?",
        "back": "**Exam cue:** Which is a best practice for setting up NTP? **Key response:** Always configure the time source to a DNS address.. **Why:** Use a DNS hostname for the NTP server — if the server's IP changes, devices follow the name without reconfiguration."
      },
      {
        "id": "4.8-align-f9",
        "ckuId": "CKU-LOGIN-LOCAL",
        "front": "What should you remember about Login Local?",
        "back": "**Exam cue:** You want to turn on local authentication so that a user must supply a username and password when managing the switch. **Key response:** Switch(config-line)#login local. **Why:** login local under line vty tells SSH/Telnet to authenticate against the local username database."
      },
      {
        "id": "4.8-align-f10",
        "ckuId": "CKU-NETWORK-ADDRESS-TRANSLATION",
        "front": "What should you remember about Network Address Translation?",
        "back": "**Exam cue:** An administrator configures `ip route 0.0.0.0 0.0.0.0 203.0.113.1` on an edge router but hosts still cannot reach the internet, even though show ip r… **Key response:** 203.0.113.1 itself may be unreachable, or NAT is not configured for the internal hosts. **Why:** A default route being present in the table does not guarantee end-to-end reachability. Common remaining causes are an unreachable next hop or missing NAT/PAT translation for internal private addresses."
      },
      {
        "id": "4.8-align-f11",
        "ckuId": "CKU-TRANSPORT-INPUT",
        "front": "What should you remember about Transport Input?",
        "back": "**Exam cue:** Which transport protocol does DHCP use? **Key response:** UDP. **Why:** DHCP uses UDP — client to server on 67, server to client on 68."
      }
    ],
    "reading": {
      "tiers": {
        "beginner": "Configure network devices for remote access using SSH shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "4.9": {
    "flashcards": [
      {
        "id": "4.9-align-f1",
        "ckuId": "CKU-COPY-TFTP-RUNNING-CONFIG",
        "front": "What should you remember about Copy Tftp Running Config?",
        "back": "**Exam cue:** Which command restore configuration to the running-config for a device from a server? **Key response:** Switch#copy tftp: running-config. **Why:** copy tftp: running-config restores a saved config from TFTP directly into running-config."
      },
      {
        "id": "4.9-align-f2",
        "ckuId": "CKU-FTP",
        "front": "What should you remember about Ftp?",
        "back": "**Exam cue:** Which command restore configuration to the running-config for a device from a server? **Key response:** Switch#copy tftp: running-config. **Why:** copy tftp: running-config restores a saved config from TFTP directly into running-config."
      },
      {
        "id": "4.9-align-f3",
        "ckuId": "CKU-FLASH",
        "front": "What should you remember about Flash?",
        "back": "**Exam cue:** Which command begin the upgrade of an IOS from a TFTP server? **Key response:** Switch#copy tftp flash. **Why:** copy tftp flash (privileged EXEC) downloads the IOS image from TFTP into flash — the standard upgrade starting command."
      },
      {
        "id": "4.9-align-f4",
        "ckuId": "CKU-BOOT-SYSTEM-TFTP",
        "front": "What should you remember about Boot System Tftp?",
        "back": "**Exam cue:** Which command can boot a router from a TFTP server for the image of c2900-universalk9-mz.SPA.151-4.M4.bin on the TFTP server of 192.168.1.2? **Key response:** Router(config)#boot system c2900-universalk9-mz.SPA.151-4.M4.bin tftp://192.168.1.2. **Why:** boot system tftp://192.168.1.2 c2900-universalk9-mz.SPA.151-4.M4.bin — image filename before the TFTP URL in global config."
      },
      {
        "id": "4.9-align-f5",
        "ckuId": "CKU-CRYPTO-KEY-GENERATE-RSA",
        "front": "What should you remember about Crypto Key Generate Rsa?",
        "back": "**Exam cue:** Which command generate the encryption keys for SSH? **Key response:** Router(config)#crypto key generate rsa. **Why:** crypto key generate rsa in global config creates the RSA key pair used by SSH."
      },
      {
        "id": "4.9-align-f6",
        "ckuId": "CKU-LOCAL-USERNAME",
        "front": "What should you remember about Local Username?",
        "back": "**Exam cue:** Which command configure a local user for SSH access? **Key response:** Router(config)#username user1 password Password20!. **Why:** username <name> password <secret> creates a local user database entry for login authentication."
      },
      {
        "id": "4.9-align-f7",
        "ckuId": "CKU-ROMMON",
        "front": "What should you remember about Rommon?",
        "back": "**Exam cue:** You’re upgrading the flash memory on a 2900 router with a brand-new flash card. What needs to be done to restore the IOS? **Key response:** The router will boot into the ROMMON, and from there you will need to TFTP download the IOS.. **Why:** A blank flash card leaves no valid IOS — the router boots to ROMMON and you TFTP-download the image."
      },
      {
        "id": "4.9-align-f8",
        "ckuId": "CKU-RUNNING-CONFIG",
        "front": "What should you remember about Running Config?",
        "back": "**Exam cue:** Which command restore configuration to the running-config for a device from a server? **Key response:** Switch#copy tftp: running-config. **Why:** copy tftp: running-config restores a saved config from TFTP directly into running-config."
      }
    ],
    "reading": {
      "tiers": {
        "beginner": "Describe TFTP and FTP capabilities shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      },
      "keyPoints": [
        "TFTP (UDP/69) and FTP (TCP/20-21) transfer IOS images and configs",
        "TFTP is simple/unauthenticated; FTP adds auth but neither encrypts — use SFTP for security.",
        "Remember the exam-facing behavior for Describe TFTP and FTP capabilities (point "
      ]
    }
  },
  "4.10": {
    "flashcards": [
      {
        "id": "4.10-align-f1",
        "ckuId": "CKU-CLOUD-MANAGEMENT",
        "front": "What should you remember about Cloud Management?",
        "back": "**Exam cue:** An organization's cloud-managed access points lose connectivity to the cloud dashboard during an ISP outage at headquarters. **Key response:** The APs typically continue forwarding existing traffic (data plane unaffected), but configuration changes and…. **Why:** Cloud-managed APs usually keep forwarding locally (data plane) but lose dashboard management, config push, and analytics until WAN returns."
      },
      {
        "id": "4.10-align-f2",
        "ckuId": "CKU-LOCAL-MANAGEMENT",
        "front": "What should you remember about Local Management?",
        "back": "**Exam cue:** What is the primary management-architecture difference between a traditional on-premises managed network and a cloud-managed network (e.g. **Key response:** Cloud-managed devices send configuration and telemetry to a vendor-hosted dashboard accessed over the interne…. **Why:** Cloud-managed gear phones home to a vendor-hosted dashboard over the internet — config and telemetry centralize off-box."
      },
      {
        "id": "4.10-align-f3",
        "ckuId": "CKU-SINGLE-PANE-OF-GLASS",
        "front": "What should you remember about Single Pane Of Glass?",
        "back": "**Exam cue:** An engineer says, \"Our network uses a single pane of glass for management.\" What does this phrase mean? **Key response:** A single user interface or dashboard provides visibility and control over the entire network's devices and si…. **Why:** Single pane of glass = one dashboard/UI for visibility and control across all devices and sites."
      },
      {
        "id": "4.10-align-f4",
        "ckuId": "CKU-CONTROL-PLANE",
        "front": "What should you remember about Control Plane?",
        "back": "**Exam cue:** An organization's cloud-managed access points lose connectivity to the cloud dashboard during an ISP outage at headquarters. **Key response:** The APs typically continue forwarding existing traffic (data plane unaffected), but configuration changes and…. **Why:** Cloud-managed APs usually keep forwarding locally (data plane) but lose dashboard management, config push, and analytics until WAN returns."
      },
      {
        "id": "4.10-align-f5",
        "ckuId": "CKU-DATA-PLANE",
        "front": "What should you remember about Data Plane?",
        "back": "**Exam cue:** An organization's cloud-managed access points lose connectivity to the cloud dashboard during an ISP outage at headquarters. **Key response:** The APs typically continue forwarding existing traffic (data plane unaffected), but configuration changes and…. **Why:** Cloud-managed APs usually keep forwarding locally (data plane) but lose dashboard management, config push, and analytics until WAN returns."
      },
      {
        "id": "4.10-align-f6",
        "ckuId": "CKU-DATA-SOVEREIGNTY",
        "front": "What should you remember about Data Sovereignty?",
        "back": "**Exam cue:** From a security/compliance standpoint, what is a common reason an organization might prefer local (on-premises) device management over cloud-based ma… **Key response:** Management traffic and configuration data stay entirely within the organization's own network rather than tra…. **Why:** Local management keeps config and management traffic inside the org network — no third-party cloud transit."
      },
      {
        "id": "4.10-align-f7",
        "ckuId": "CKU-DNA-CENTER",
        "front": "What should you remember about Dna Center?",
        "back": "**Exam cue:** Which statement correctly contrasts Cisco DNA Center with Cisco Meraki dashboard in terms of deployment model? **Key response:** DNA Center is typically deployed on-premises (or as a private cloud) as a local controller, while Meraki is a…. **Why:** DNA Center is typically on-premises/private cloud; Meraki is a vendor-hosted cloud dashboard."
      },
      {
        "id": "4.10-align-f8",
        "ckuId": "CKU-LIFECYCLE-MANAGEMENT",
        "front": "What should you remember about Lifecycle Management?",
        "back": "**Exam cue:** A cloud-managed network platform automatically pushes firmware updates to all devices in an organization on a scheduled maintenance window from the v… **Key response:** Centralized, automated lifecycle management across the fleet from a single cloud platform. **Why:** Scheduled cloud-pushed firmware across the fleet = centralized automated lifecycle management."
      },
      {
        "id": "4.10-align-f9",
        "ckuId": "CKU-ZERO-TOUCH-PROVISIONING",
        "front": "What should you remember about Zero Touch Provisioning?",
        "back": "**Exam cue:** Which of the following is a typical advantage of cloud-based device management over traditional local management? **Key response:** Zero-touch provisioning — new devices can be shipped to a site and automatically pull their configuration fro…. **Why:** Zero-touch provisioning (ZTP) lets new devices auto-pull config from the cloud on first boot — no console visit required."
      }
    ],
    "reading": {
      "tiers": {
        "beginner": "Compare local and cloud-based device management shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      },
      "keyPoints": [
        "Local vs cloud management: On-prem CLI/controllers vs cloud dashboards (Meraki, DNA Center)",
        "Cloud simplifies multi-site ops but needs internet and trust in provider.",
        "Remember the exam-facing behavior for Compare local and cloud-based device manag"
      ]
    }
  },
  "5.1": {
    "flashcards": [
      {
        "id": "5.1-align-f1",
        "ckuId": "CKU-THREATS",
        "front": "What should you remember about Threats?",
        "back": "**Exam cue:** Which term describes the outside of the corporate firewall? **Key response:** Perimeter. **Why:** The perimeter is the outer security boundary — where external traffic meets the corporate network."
      },
      {
        "id": "5.1-align-f2",
        "ckuId": "CKU-VULNERABILITIES",
        "front": "What should you remember about Vulnerabilities?",
        "back": "**Exam cue:** Which term describes the outside of the corporate firewall? **Key response:** Perimeter. **Why:** The perimeter is the outer security boundary — where external traffic meets the corporate network."
      },
      {
        "id": "5.1-align-f3",
        "ckuId": "CKU-PERIMETER",
        "front": "What should you remember about Perimeter?",
        "back": "**Exam cue:** Which term describes the outside of the corporate firewall? **Key response:** Perimeter. **Why:** The perimeter is the outer security boundary — where external traffic meets the corporate network."
      },
      {
        "id": "5.1-align-f4",
        "ckuId": "CKU-SPOOFING",
        "front": "What should you remember about Spoofing?",
        "back": "**Exam cue:** Which is a common attack method used to overwhelm services with traffic from multiple Internet sources? **Key response:** Distributed denial of service. **Why:** Distributed denial of service (DDoS) floods a target from many coordinated Internet sources — overwhelming services at scale."
      },
      {
        "id": "5.1-align-f5",
        "ckuId": "CKU-DMZ",
        "front": "What should you remember about Dmz?",
        "back": "**Exam cue:** What is the purpose of a DMZ (demilitarized zone) in network design? **Key response:** To host externally-facing services (e.g., web/email servers) in a buffer zone, isolated from the internal net…. **Why:** A DMZ hosts internet-facing services in a buffer zone — reachable from outside but isolated from the internal LAN."
      },
      {
        "id": "5.1-align-f6",
        "ckuId": "CKU-DOS",
        "front": "What should you remember about Dos?",
        "back": "**Exam cue:** Which is a common attack method used to overwhelm services with traffic from multiple Internet sources? **Key response:** Distributed denial of service. **Why:** Distributed denial of service (DDoS) floods a target from many coordinated Internet sources — overwhelming services at scale."
      },
      {
        "id": "5.1-align-f7",
        "ckuId": "CKU-IDS",
        "front": "What should you remember about Ids?",
        "back": "**Exam cue:** Which type of device can prevent an intrusion on your network? **Key response:** IPS. **Why:** IPS (Intrusion Prevention System) detects and actively blocks malicious traffic inline — prevention, not just detection."
      },
      {
        "id": "5.1-align-f8",
        "ckuId": "CKU-IPS",
        "front": "What should you remember about Ips?",
        "back": "**Exam cue:** Which type of device can prevent an intrusion on your network? **Key response:** IPS. **Why:** IPS (Intrusion Prevention System) detects and actively blocks malicious traffic inline — prevention, not just detection."
      },
      {
        "id": "5.1-align-f9",
        "ckuId": "CKU-ACL",
        "front": "What should you remember about Access Control Lists?",
        "back": "**Ordered rules that permit/deny traffic by criteria**. Processed top-down, first match wins, with an implicit deny-all at the end."
      },
      {
        "id": "5.1-align-f10",
        "ckuId": "CKU-MITM",
        "front": "What should you remember about Mitm?",
        "back": "**Exam cue:** A rogue wireless access point (WAP) is created with the same SSID as the corporate SSID. **Key response:** Man in the middle attack. **Why:** A rogue AP relaying traffic between victims and the real network is a man-in-the-middle (MitM) attack — the attacker sits in the path."
      },
      {
        "id": "5.1-align-f11",
        "ckuId": "CKU-WLAN-SSID",
        "front": "What should you remember about Wlan Ssid?",
        "back": "**Exam cue:** You need to set up a WLAN for connectivity to send and receive large files to roaming clients. The WLAN will exist with other WLAN traffic. **Key response:** Bronze. **Why:** Large file transfer is bulk/background traffic — Bronze (best effort, no priority) is appropriate alongside other WLANs."
      }
    ]
  },
  "5.2": {
    "flashcards": [
      {
        "id": "5.2-align-f1",
        "ckuId": "CKU-TRAINING",
        "front": "What should you remember about Training?",
        "back": "**Exam cue:** What can protect users from a phishing attack that is sent via email? **Key response:** Training. **Why:** Security awareness training teaches users to spot fraudulent emails — the best defense against phishing delivered via email."
      },
      {
        "id": "5.2-align-f2",
        "ckuId": "CKU-USER-AWARENESS",
        "front": "What should you remember about User Awareness?",
        "back": "**Exam cue:** What can protect users from a phishing attack that is sent via email? **Key response:** Training. **Why:** Security awareness training teaches users to spot fraudulent emails — the best defense against phishing delivered via email."
      },
      {
        "id": "5.2-align-f3",
        "ckuId": "CKU-PHISHING",
        "front": "What should you remember about Phishing?",
        "back": "**Exam cue:** What can protect users from a phishing attack that is sent via email? **Key response:** Training. **Why:** Security awareness training teaches users to spot fraudulent emails — the best defense against phishing delivered via email."
      },
      {
        "id": "5.2-align-f4",
        "ckuId": "CKU-PASSWORD",
        "front": "What should you remember about Password?",
        "back": "**Exam cue:** A user has brought an email to your attention that is not from his bank, but it looks like his bank’s website when he clicks on the link. **Key response:** Phishing. **Why:** A fake bank email with a look-alike site is classic phishing — tricking the user into revealing credentials."
      },
      {
        "id": "5.2-align-f5",
        "ckuId": "CKU-TAILGATING",
        "front": "What should you remember about Tailgating?",
        "back": "**Exam cue:** Which form of social engineering is nothing more than looking over someone’s shoulder while they enter or view sensitive information? **Key response:** Shoulder surfing. **Why:** Shoulder surfing is watching someone type or read sensitive data over their shoulder — no technology required."
      },
      {
        "id": "5.2-align-f6",
        "ckuId": "CKU-AUTH-TOKEN",
        "front": "What should you remember about Auth Token?",
        "back": "**Exam cue:** Several office-level users have administrative privileges on the network. Which of the following is the easiest to implement to immediately add secur… **Key response:** Least privilege. **Why:** Least privilege — remove unnecessary admin rights from office users — is the fastest policy win with no new hardware."
      },
      {
        "id": "5.2-align-f7",
        "ckuId": "CKU-IDS",
        "front": "What should you remember about Ids?",
        "back": "**Exam cue:** Which type of device can prevent an intrusion on your network? **Key response:** IPS. **Why:** IPS (Intrusion Prevention System) detects and actively blocks malicious traffic inline — prevention, not just detection."
      },
      {
        "id": "5.2-align-f8",
        "ckuId": "CKU-LEAST-PRIVILEGE",
        "front": "What should you remember about Least Privilege?",
        "back": "**Exam cue:** Several office-level users have administrative privileges on the network. Which of the following is the easiest to implement to immediately add secur… **Key response:** Least privilege. **Why:** Least privilege — remove unnecessary admin rights from office users — is the fastest policy win with no new hardware."
      },
      {
        "id": "5.2-align-f9",
        "ckuId": "CKU-MANTRAP",
        "front": "What should you remember about Mantrap?",
        "back": "**Exam cue:** Identify a method for stopping tailgating? **Key response:** Mantraps. **Why:** Mantraps (two-door access control) physically prevent tailgating — only one person passes at a time."
      },
      {
        "id": "5.2-align-f10",
        "ckuId": "CKU-SHOULDER-SURFING",
        "front": "What should you remember about Shoulder Surfing?",
        "back": "**Exam cue:** Which form of social engineering is nothing more than looking over someone’s shoulder while they enter or view sensitive information? **Key response:** Shoulder surfing. **Why:** Shoulder surfing is watching someone type or read sensitive data over their shoulder — no technology required."
      },
      {
        "id": "5.2-align-f11",
        "ckuId": "CKU-TOKENS",
        "front": "What should you remember about Tokens?",
        "back": "**Exam cue:** Several office-level users have administrative privileges on the network. Which of the following is the easiest to implement to immediately add secur… **Key response:** Least privilege. **Why:** Least privilege — remove unnecessary admin rights from office users — is the fastest policy win with no new hardware."
      },
      {
        "id": "5.2-align-f12",
        "ckuId": "CKU-WLAN-SSID",
        "front": "What should you remember about Wlan Ssid?",
        "back": "**Exam cue:** You need to set up a WLAN for connectivity to send and receive large files to roaming clients. The WLAN will exist with other WLAN traffic. **Key response:** Bronze. **Why:** Large file transfer is bulk/background traffic — Bronze (best effort, no priority) is appropriate alongside other WLANs."
      }
    ],
    "reading": {
      "bigTakeaway": "Master Describe security program elements: know the behavior, the exam trap, and how to verify it.",
      "tiers": {
        "beginner": "Describe security program elements shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "5.3": {
    "flashcards": [
      {
        "id": "5.3-align-f1",
        "ckuId": "CKU-LINE-PASSWORD",
        "front": "What should you remember about Line Password?",
        "back": "**Exam cue:** Which command configure the enable password for a router or switch? **Key response:** Router(config)#enable secret Password20!. **Why:** enable secret stores the privileged EXEC password as a one-way hash — preferred over cleartext enable password."
      },
      {
        "id": "5.3-align-f2",
        "ckuId": "CKU-LOCAL-DEVICE-ACCESS",
        "front": "What should you remember about Local Device Access?",
        "back": "**Exam cue:** Which command configure the enable password for a router or switch? **Key response:** Router(config)#enable secret Password20!. **Why:** enable secret stores the privileged EXEC password as a one-way hash — preferred over cleartext enable password."
      },
      {
        "id": "5.3-align-f3",
        "ckuId": "CKU-PASSWORD",
        "front": "What should you remember about Password?",
        "back": "**Exam cue:** A user has brought an email to your attention that is not from his bank, but it looks like his bank’s website when he clicks on the link. **Key response:** Phishing. **Why:** A fake bank email with a look-alike site is classic phishing — tricking the user into revealing credentials."
      },
      {
        "id": "5.3-align-f4",
        "ckuId": "CKU-SSH",
        "front": "What should you remember about SSH Remote Access?",
        "back": "**SSH remote access: hostname + ip domain-name, crypto key generate rsa, username secret, line vty transport input ssh login local**. Disable Telnet. show ip ssh to verify."
      },
      {
        "id": "5.3-align-f5",
        "ckuId": "CKU-PASSWORD-COMPLEXITY",
        "front": "What should you remember about Password Complexity?",
        "back": "**Exam cue:** Your company provides medical data to doctors from a worldwide database. Because of the sensitive nature of the data, it’s imperative that authentica… **Key response:** Token. **Why:** One-time tokens (OTP/HOTP/TOTP) expire after use or a short time window — ideal for session-bound medical data access."
      },
      {
        "id": "5.3-align-f6",
        "ckuId": "CKU-PASSWORD-ENCRYPTION",
        "front": "What should you remember about Password Encryption?",
        "back": "**Exam cue:** Your company provides medical data to doctors from a worldwide database. Because of the sensitive nature of the data, it’s imperative that authentica… **Key response:** Token. **Why:** One-time tokens (OTP/HOTP/TOTP) expire after use or a short time window — ideal for session-bound medical data access."
      },
      {
        "id": "5.3-align-f7",
        "ckuId": "CKU-PASSWORD-POLICY",
        "front": "What should you remember about Password Policy?",
        "back": "**Exam cue:** Your company provides medical data to doctors from a worldwide database. Because of the sensitive nature of the data, it’s imperative that authentica… **Key response:** Token. **Why:** One-time tokens (OTP/HOTP/TOTP) expire after use or a short time window — ideal for session-bound medical data access."
      },
      {
        "id": "5.3-align-f8",
        "ckuId": "CKU-REMOTE-ACCESS",
        "front": "What should you remember about Remote Access?",
        "back": "**Exam cue:** You need to make a Telnet connection to a remote router from a router you are configuring. Which command will allow you to do this? **Key response:** Router#198.56.33.3. **Why:** From exec mode, type the target IP address directly (Router#198.56.33.3) to open a Telnet session to that host."
      },
      {
        "id": "5.3-align-f9",
        "ckuId": "CKU-VTY-LINES",
        "front": "What should you remember about Vty Lines?",
        "back": "**Exam cue:** You need to set the login password for Telnet. Which command you type first? **Key response:** Switch(config)#line vty 0 5. **Why:** Telnet/SSH login passwords are configured under line vty 0 15 (or 0 4 on older platforms) — start there before password/login."
      },
      {
        "id": "5.3-align-f10",
        "ckuId": "CKU-ACL",
        "front": "What should you remember about Access Control Lists?",
        "back": "**Ordered rules that permit/deny traffic by criteria**. Processed top-down, first match wins, with an implicit deny-all at the end."
      },
      {
        "id": "5.3-align-f11",
        "ckuId": "CKU-SMART-CARDS",
        "front": "What should you remember about Smart Cards?",
        "back": "**Exam cue:** Your company provides medical data to doctors from a worldwide database. Because of the sensitive nature of the data, it’s imperative that authentica… **Key response:** Token. **Why:** One-time tokens (OTP/HOTP/TOTP) expire after use or a short time window — ideal for session-bound medical data access."
      },
      {
        "id": "5.3-align-f12",
        "ckuId": "CKU-AAA",
        "front": "What should you remember about Aaa?",
        "back": "**Exam cue:** Which AAA component would be used to determine whether an authenticated user is permitted to enter privileged EXEC mode or run specific configuration… **Key response:** Authorization. **Why:** Authorization determines what an authenticated user can do — privileged EXEC access, command levels."
      },
      {
        "id": "5.3-align-f13",
        "ckuId": "CKU-AUTH-TOKEN",
        "front": "What should you remember about Auth Token?",
        "back": "**Exam cue:** Several office-level users have administrative privileges on the network. Which of the following is the easiest to implement to immediately add secur… **Key response:** Least privilege. **Why:** Least privilege — remove unnecessary admin rights from office users — is the fastest policy win with no new hardware."
      },
      {
        "id": "5.3-align-f14",
        "ckuId": "CKU-CRYPTO-KEY-GENERATE-RSA",
        "front": "What should you remember about Crypto Key Generate Rsa?",
        "back": "**Exam cue:** Which command generate the encryption keys for SSH? **Key response:** Router(config)#crypto key generate rsa. **Why:** crypto key generate rsa in global config creates the RSA key pair used by SSH."
      },
      {
        "id": "5.3-align-f15",
        "ckuId": "CKU-LOGIN-LOCAL",
        "front": "What should you remember about Login Local?",
        "back": "**Exam cue:** You want to turn on local authentication so that a user must supply a username and password when managing the switch. **Key response:** Switch(config-line)#login local. **Why:** login local under line vty tells SSH/Telnet to authenticate against the local username database."
      },
      {
        "id": "5.3-align-f16",
        "ckuId": "CKU-PHISHING",
        "front": "What should you remember about Phishing?",
        "back": "**Exam cue:** What can protect users from a phishing attack that is sent via email? **Key response:** Training. **Why:** Security awareness training teaches users to spot fraudulent emails — the best defense against phishing delivered via email."
      },
      {
        "id": "5.3-align-f17",
        "ckuId": "CKU-RADIUS",
        "front": "What should you remember about Radius?",
        "back": "**Exam cue:** How does RADIUS differ from TACACS+ in what it encrypts and how it structures AAA? **Key response:** RADIUS encrypts only the password in the access-request packet and combines authentication and authorization into a single response, using UDP ports 1812/1813. **Why:** RADIUS is built for network access (802.1X, VPN, wireless) rather than device administration — it does not separate authentication, authorization, and accounting into distinct steps the way TACACS+ does, and only the password is encrypted, not the full packet."
      },
      {
        "id": "5.3-align-f18",
        "ckuId": "CKU-SCRYPT",
        "front": "What should you remember about Scrypt?",
        "back": "**Exam cue:** During a recent external security audit, it was determined that your enable password should be secured with SHA-256 scrypt. **Key response:** Switch(config)#enable algorithm-type scrypt secret Password20!. **Why:** enable algorithm-type scrypt secret <pwd> sets enable password using SHA-256 scrypt — strongest IOS password storage."
      },
      {
        "id": "5.3-align-f19",
        "ckuId": "CKU-TOKENS",
        "front": "What should you remember about Tokens?",
        "back": "**Exam cue:** Several office-level users have administrative privileges on the network. Which of the following is the easiest to implement to immediately add secur… **Key response:** Least privilege. **Why:** Least privilege — remove unnecessary admin rights from office users — is the fastest policy win with no new hardware."
      }
    ],
    "reading": {
      "bigTakeaway": "Master Configure and verify device access control: know the behavior, the exam trap, and how to verify it.",
      "tiers": {
        "beginner": "Configure and verify device access control shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "5.4": {
    "flashcards": [
      {
        "id": "5.4-align-f1",
        "ckuId": "CKU-TACACS",
        "front": "What should you remember about Tacacs?",
        "back": "**Exam cue:** Which of the following best describes why an enterprise would choose TACACS+ over RADIUS for managing administrative access to network infrastructure… **Key response:** TACACS+ separates authentication, authorization, and accounting into distinct processes and supports per-comm…. **Why:** TACACS+ separates auth/authz/accounting and supports per-command authorization — ideal for device admin."
      },
      {
        "id": "5.4-align-f2",
        "ckuId": "CKU-RADIUS",
        "front": "What should you remember about Radius?",
        "back": "**Exam cue:** How does RADIUS differ from TACACS+ in what it encrypts and how it structures AAA? **Key response:** RADIUS encrypts only the password in the access-request packet and combines authentication and authorization into a single response, using UDP ports 1812/1813. **Why:** RADIUS is built for network access (802.1X, VPN, wireless) rather than device administration — it does not separate authentication, authorization, and accounting into distinct steps the way TACACS+ does, and only the password is encrypted, not the full packet."
      },
      {
        "id": "5.4-align-f3",
        "ckuId": "CKU-AAA-COMPARISON",
        "front": "What should you remember about Aaa Comparison?",
        "back": "**Exam cue:** Contrast RADIUS and TACACS+ across protocol, encryption, and AAA structure. **Key response:** TACACS+ (TCP/49) separates authentication, authorization, and accounting into distinct processes, encrypts the whole packet, and supports per-command authorization for device administration; RADIUS (UDP 1812/1813) combines authentication and authorization into one response, encrypts only the password, and is used for network access (802.1X, VPN, wireless). **Why:** Pick TACACS+ for admin AAA on the devices themselves; pick RADIUS for authenticating users/devices trying to get onto the network."
      },
      {
        "id": "5.4-align-f4",
        "ckuId": "CKU-AAA-CONFIG",
        "front": "What should you remember about Aaa Config?",
        "back": "**Exam cue:** A switch is configured with: aaa authentication login default group tacacs+ local. What does this configuration mean? **Key response:** The switch will attempt TACACS+ authentication first, and fall back to the local username/password database i…. **Why:** aaa authentication login default group tacacs+ local — try TACACS+ first, fall back to local database if unreachable."
      },
      {
        "id": "5.4-align-f5",
        "ckuId": "CKU-AAA-PORTS",
        "front": "What should you remember about Aaa Ports?",
        "back": "**Exam cue:** Which ports does RADIUS use by default for authentication/authorization and accounting (modern standard)? **Key response:** UDP 1812 (authentication/authorization) and UDP 1813 (accounting). **Why:** RADIUS: UDP 1812 (auth/authorization) and UDP 1813 (accounting) — modern IANA standard."
      },
      {
        "id": "5.4-align-f6",
        "ckuId": "CKU-ACCOUNTING",
        "front": "What should you remember about Accounting?",
        "back": "**Exam cue:** An organization wants a detailed log of every configuration command each administrator runs on network devices, for audit purposes. **Key response:** Accounting. **Why:** Accounting tracks and logs what an authenticated and authorized user actually does — including command-level logging — which is exactly what command auditing requires."
      },
      {
        "id": "5.4-align-f7",
        "ckuId": "CKU-AUTHORIZATION",
        "front": "What should you remember about Authorization?",
        "back": "**Exam cue:** Which AAA component would be used to determine whether an authenticated user is permitted to enter privileged EXEC mode or run specific configuration… **Key response:** Authorization. **Why:** Authorization determines what an authenticated user can do — privileged EXEC access, command levels."
      },
      {
        "id": "5.4-align-f8",
        "ckuId": "CKU-AAA-NEW-MODEL",
        "front": "What should you remember about Aaa New Model?",
        "back": "**Exam cue:** Which command is required on a Cisco IOS device before any AAA authentication, authorization, or accounting commands can take effect? **Key response:** aaa new-model. **Why:** aaa new-model is the global configuration command that enables the AAA access-control model on the device."
      },
      {
        "id": "5.4-align-f9",
        "ckuId": "CKU-AAA-TROUBLESHOOTING",
        "front": "What should you remember about Aaa Troubleshooting?",
        "back": "**Exam cue:** A network device is configured to use TACACS+ for authentication, but all login attempts fail with the TACACS+ server reachable on the network. **Key response:** The shared secret keys must match exactly (including case) between the device and the TACACS+ server — this m…. **Why:** Shared secrets must match exactly — case-sensitive mismatch (Cisco123 vs cisco123) causes auth failure."
      },
      {
        "id": "5.4-align-f10",
        "ckuId": "CKU-AUTHENTICATION",
        "front": "What should you remember about Authentication?",
        "back": "**Exam cue:** What do the three letters in \"AAA\" stand for in the context of network security? **Key response:** Authentication, Authorization, Accounting. **Why:** AAA = Authentication (identity), Authorization (permissions), Accounting (logging/auditing of actions)."
      },
      {
        "id": "5.4-align-f11",
        "ckuId": "CKU-METHOD-LIST",
        "front": "What should you remember about Method List?",
        "back": "**Exam cue:** A switch is configured with: aaa authentication login default group tacacs+ local. What does this configuration mean? **Key response:** The switch will attempt TACACS+ authentication first, and fall back to the local username/password database i…. **Why:** aaa authentication login default group tacacs+ local — try TACACS+ first, fall back to local database if unreachable."
      }
    ],
    "reading": {
      "bigTakeaway": "Master Configure and verify AAA with TACACS+/RADIUS: know the behavior, the exam trap, and how to verify it.",
      "tiers": {
        "beginner": "Configure and verify AAA with TACACS+/RADIUS shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "5.5": {
    "flashcards": [
      {
        "id": "5.5-align-f1",
        "ckuId": "CKU-SSH",
        "front": "What should you remember about SSH Remote Access?",
        "back": "**SSH remote access: hostname + ip domain-name, crypto key generate rsa, username secret, line vty transport input ssh login local**. Disable Telnet. show ip ssh to verify."
      }
    ]
  },
  "5.6": {
    "flashcards": [
      {
        "id": "5.6-align-f1",
        "ckuId": "CKU-STICKY-MAC",
        "front": "What should you remember about Sticky Mac?",
        "back": "**Exam cue:** You have been tasked to secure ports with port security. You need to make sure that only the computers installed can access the network. **Key response:** Sticky port security. **Why:** Sticky learning saves MACs to running-config — least admin after PCs are already installed."
      },
      {
        "id": "5.6-align-f2",
        "ckuId": "CKU-ERRDISABLE",
        "front": "What should you remember about Errdisable?",
        "back": "**Exam cue:** You have BPDU Guard configured on an interface. What happens if a BPDU is advertised on the interface? **Key response:** The interface will become err-disabled.. **Why:** BPDU Guard places the port in err-disabled state upon receiving a BPDU — requires manual recovery or errdisable recovery timer."
      },
      {
        "id": "5.6-align-f3",
        "ckuId": "CKU-ACL",
        "front": "What should you remember about Access Control Lists?",
        "back": "**Ordered rules that permit/deny traffic by criteria**. Processed top-down, first match wins, with an implicit deny-all at the end."
      },
      {
        "id": "5.6-align-f4",
        "ckuId": "CKU-CRYPTO-KEY-GENERATE-RSA",
        "front": "What should you remember about Crypto Key Generate Rsa?",
        "back": "**Exam cue:** Which command generate the encryption keys for SSH? **Key response:** Router(config)#crypto key generate rsa. **Why:** crypto key generate rsa in global config creates the RSA key pair used by SSH."
      },
      {
        "id": "5.6-align-f5",
        "ckuId": "CKU-DOS",
        "front": "What should you remember about Dos?",
        "back": "**Exam cue:** Which is a common attack method used to overwhelm services with traffic from multiple Internet sources? **Key response:** Distributed denial of service. **Why:** Distributed denial of service (DDoS) floods a target from many coordinated Internet sources — overwhelming services at scale."
      },
      {
        "id": "5.6-align-f6",
        "ckuId": "CKU-SNMP",
        "front": "What should you remember about SNMP Operations?",
        "back": "**SNMP: Manager, agent, MIB, OID**. Polling (Get) and traps/informs. v1/v2c use community strings; v3 adds auth and encryption."
      }
    ],
    "reading": {
      "bigTakeaway": "Master Configure Layer 2 security features: know the behavior, the exam trap, and how to verify it.",
      "tiers": {
        "beginner": "Configure Layer 2 security features shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "5.7": {
    "flashcards": [
      {
        "id": "5.7-align-f1",
        "ckuId": "CKU-AUTHENTICATION",
        "front": "What should you remember about Authentication?",
        "back": "**Exam cue:** What do the three letters in \"AAA\" stand for in the context of network security? **Key response:** Authentication, Authorization, Accounting. **Why:** AAA = Authentication (identity), Authorization (permissions), Accounting (logging/auditing of actions)."
      },
      {
        "id": "5.7-align-f2",
        "ckuId": "CKU-AUTHORIZATION",
        "front": "What should you remember about Authorization?",
        "back": "**Exam cue:** Which AAA component would be used to determine whether an authenticated user is permitted to enter privileged EXEC mode or run specific configuration… **Key response:** Authorization. **Why:** Authorization determines what an authenticated user can do — privileged EXEC access, command levels."
      },
      {
        "id": "5.7-align-f3",
        "ckuId": "CKU-802.1X",
        "front": "What should you remember about 802.1x?",
        "back": "**Exam cue:** Which type of security can be implemented on a WLAN that requires the host PC to present a certificate before being allowed onto the wireless network? **Key response:** 802.1X. **Why:** 802.1X requires the client to present a certificate (or credentials via EAP) before network access — per-user authentication."
      },
      {
        "id": "5.7-align-f4",
        "ckuId": "CKU-RADIUS",
        "front": "What should you remember about Radius?",
        "back": "**Exam cue:** How does RADIUS differ from TACACS+ in what it encrypts and how it structures AAA? **Key response:** RADIUS encrypts only the password in the access-request packet and combines authentication and authorization into a single response, using UDP ports 1812/1813. **Why:** RADIUS is built for network access (802.1X, VPN, wireless) rather than device administration — it does not separate authentication, authorization, and accounting into distinct steps the way TACACS+ does, and only the password is encrypted, not the full packet."
      },
      {
        "id": "5.7-align-f5",
        "ckuId": "CKU-SUPPLICANT",
        "front": "What should you remember about Supplicant?",
        "back": "**Exam cue:** Identify the end device that sends credentials for 802.1X called? **Key response:** Supplicant. **Why:** The supplicant is the end device (PC/phone) that presents credentials."
      },
      {
        "id": "5.7-align-f6",
        "ckuId": "CKU-AUTHENTICATOR",
        "front": "What should you remember about Authenticator?",
        "back": "**Exam cue:** Identify the end device that sends credentials for 802.1X called? **Key response:** Supplicant. **Why:** The supplicant is the end device (PC/phone) that presents credentials."
      },
      {
        "id": "5.7-align-f7",
        "ckuId": "CKU-EAP",
        "front": "What should you remember about Eap?",
        "back": "**Exam cue:** What protocol does the supplicant communicate to the authenticator for 802.1X? **Key response:** 802.1X EAP. **Why:** Supplicant ↔ authenticator use EAP over LAN (802.1X/EAPoL) — not raw TCP/UDP."
      },
      {
        "id": "5.7-align-f8",
        "ckuId": "CKU-TACACS",
        "front": "What should you remember about Tacacs?",
        "back": "**Exam cue:** Which of the following best describes why an enterprise would choose TACACS+ over RADIUS for managing administrative access to network infrastructure… **Key response:** TACACS+ separates authentication, authorization, and accounting into distinct processes and supports per-comm…. **Why:** TACACS+ separates auth/authz/accounting and supports per-command authorization — ideal for device admin."
      },
      {
        "id": "5.7-align-f9",
        "ckuId": "CKU-ACL",
        "front": "What should you remember about Access Control Lists?",
        "back": "**Ordered rules that permit/deny traffic by criteria**. Processed top-down, first match wins, with an implicit deny-all at the end."
      },
      {
        "id": "5.7-align-f10",
        "ckuId": "CKU-ENABLE-SECRET",
        "front": "What should you remember about Enable Secret?",
        "back": "**Exam cue:** Which command configure the enable password for a router or switch? **Key response:** Router(config)#enable secret Password20!. **Why:** enable secret stores the privileged EXEC password as a one-way hash — preferred over cleartext enable password."
      },
      {
        "id": "5.7-align-f11",
        "ckuId": "CKU-IPS",
        "front": "What should you remember about Ips?",
        "back": "**Exam cue:** Which type of device can prevent an intrusion on your network? **Key response:** IPS. **Why:** IPS (Intrusion Prevention System) detects and actively blocks malicious traffic inline — prevention, not just detection."
      },
      {
        "id": "5.7-align-f12",
        "ckuId": "CKU-IPSEC",
        "front": "What should you remember about Ipsec?",
        "back": "**Exam cue:** Which protocol is used by 802.1X for supplicant to authenticator and authenticator to authentication server? **Key response:** EAP. **Why:** EAP carries authentication between supplicant↔authenticator and authenticator↔AAA server."
      },
      {
        "id": "5.7-align-f13",
        "ckuId": "CKU-PASSWORD",
        "front": "What should you remember about Password?",
        "back": "**Exam cue:** A user has brought an email to your attention that is not from his bank, but it looks like his bank’s website when he clicks on the link. **Key response:** Phishing. **Why:** A fake bank email with a look-alike site is classic phishing — tricking the user into revealing credentials."
      },
      {
        "id": "5.7-align-f14",
        "ckuId": "CKU-REMOTE-ACCESS",
        "front": "What should you remember about Remote Access?",
        "back": "**Exam cue:** You need to make a Telnet connection to a remote router from a router you are configuring. Which command will allow you to do this? **Key response:** Router#198.56.33.3. **Why:** From exec mode, type the target IP address directly (Router#198.56.33.3) to open a Telnet session to that host."
      }
    ],
    "reading": {
      "tiers": {
        "beginner": "Compare authentication, authorization, accounting shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "5.8": {
    "flashcards": [
      {
        "id": "5.8-align-f1",
        "ckuId": "CKU-WIRELESS-SECURITY",
        "front": "What should you remember about Wireless Security?",
        "back": "**Exam cue:** Matilda is interested in securing her SOHO wireless network. What should she do to be assured that only her devices can join her wireless network? **Key response:** Enable WPA2. **Why:** WPA2 with a passphrase authenticates and encrypts joins; MAC filtering is spoofable and is not strong assurance."
      },
      {
        "id": "5.8-align-f2",
        "ckuId": "CKU-WPA",
        "front": "What should you remember about Wireless Encryption (WPA2/WPA3)?",
        "back": "**WEP is broken**. WPA2 uses AES/CCMP. WPA3 strengthens key exchange with SAE and is the recommended choice for new deployments."
      },
      {
        "id": "5.8-align-f3",
        "ckuId": "CKU-WPA2",
        "front": "What should you remember about Wpa2?",
        "back": "**Exam cue:** Matilda is interested in securing her SOHO wireless network. What should she do to be assured that only her devices can join her wireless network? **Key response:** Enable WPA2. **Why:** WPA2 with a passphrase authenticates and encrypts joins; MAC filtering is spoofable and is not strong assurance."
      },
      {
        "id": "5.8-align-f4",
        "ckuId": "CKU-AES-CCMP",
        "front": "What should you remember about Aes Ccmp?",
        "back": "**Exam cue:** Which mechanism in WPA prevents the altering and replay of data packets? **Key response:** MIC. **Why:** MIC in WPA detects tampered/replayed frames — integrity separate from AES encryption."
      },
      {
        "id": "5.8-align-f5",
        "ckuId": "CKU-TKIP",
        "front": "What should you remember about Tkip?",
        "back": "**Exam cue:** Which mechanism in WPA prevents the altering and replay of data packets? **Key response:** MIC. **Why:** MIC in WPA detects tampered/replayed frames — integrity separate from AES encryption."
      },
      {
        "id": "5.8-align-f6",
        "ckuId": "CKU-PSK",
        "front": "What should you remember about Psk?",
        "back": "**Exam cue:** Which is a requirement of WPA2-Enterprise? **Key response:** RADIUS/EAP (802.1X) infrastructure. **Why:** WPA2-Enterprise uses 802.1X with RADIUS/EAP for per-user auth — not a shared PSK. Certificates appear with some EAP types, but RADIUS/EAP is the CCNA key idea."
      },
      {
        "id": "5.8-align-f7",
        "ckuId": "CKU-WPA3",
        "front": "What should you remember about Wpa3?",
        "back": "**Exam cue:** Which security mode does WPA3-Enterprise use that offers the highest level of security? **Key response:** 192-bit. **Why:** WPA3-Enterprise optional 192-bit security mode (GCMP-256) is the highest strength option in the blueprint."
      },
      {
        "id": "5.8-align-f8",
        "ckuId": "CKU-802.1X",
        "front": "What should you remember about 802.1x?",
        "back": "**Exam cue:** Which type of security can be implemented on a WLAN that requires the host PC to present a certificate before being allowed onto the wireless network? **Key response:** 802.1X. **Why:** 802.1X requires the client to present a certificate (or credentials via EAP) before network access — per-user authentication."
      },
      {
        "id": "5.8-align-f9",
        "ckuId": "CKU-CONTROLLER-BASED-NETWORKING",
        "front": "What should you remember about Controller Based Networking?",
        "back": "**Exam cue:** When configuring WPA2-Enterprise mode on a wireless LAN controller, what must be configured? **Key response:** RADIUS server. **Why:** WPA2-Enterprise uses 802.1X with a RADIUS server for per-user authentication — not a shared PSK."
      },
      {
        "id": "5.8-align-f10",
        "ckuId": "CKU-PORT-SECURITY",
        "front": "What should you remember about Port Security?",
        "back": "**Limits MAC addresses learned on access ports; violation modes protect/shutdown/restrict**."
      },
      {
        "id": "5.8-align-f11",
        "ckuId": "CKU-RADIUS",
        "front": "What should you remember about Radius?",
        "back": "**Exam cue:** How does RADIUS differ from TACACS+ in what it encrypts and how it structures AAA? **Key response:** RADIUS encrypts only the password in the access-request packet and combines authentication and authorization into a single response, using UDP ports 1812/1813. **Why:** RADIUS is built for network access (802.1X, VPN, wireless) rather than device administration — it does not separate authentication, authorization, and accounting into distinct steps the way TACACS+ does, and only the password is encrypted, not the full packet."
      },
      {
        "id": "5.8-align-f12",
        "ckuId": "CKU-WLAN-SSID",
        "front": "What should you remember about Wlan Ssid?",
        "back": "**Exam cue:** You need to set up a WLAN for connectivity to send and receive large files to roaming clients. The WLAN will exist with other WLAN traffic. **Key response:** Bronze. **Why:** Large file transfer is bulk/background traffic — Bronze (best effort, no priority) is appropriate alongside other WLANs."
      }
    ],
    "reading": {
      "bigTakeaway": "Master Describe wireless security protocols: know the behavior, the exam trap, and how to verify it.",
      "tiers": {
        "beginner": "Describe wireless security protocols shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "5.9": {
    "flashcards": [
      {
        "id": "5.9-align-f1",
        "ckuId": "CKU-WLAN-STATUS",
        "front": "What should you remember about Wlan Status?",
        "back": "**Exam cue:** WLC WLAN summary — MaintDept: Profile Name: MaintDept Status: Disabled Radio Policy: All Multicast VLAN: Disabled Broadcast SSID: Disabled WLC WLAN s… **Key response:** Enable the status. **Why:** WLAN status is Disabled — enable the WLAN so maintenance users can associate."
      },
      {
        "id": "5.9-align-f2",
        "ckuId": "CKU-WLC-GUI-WLAN",
        "front": "What should you remember about Wlc Gui Wlan?",
        "back": "**Exam cue:** After configuring a WLAN, your users complain that they do not see the SSID. What could be wrong? **Key response:** Status is disabled.. **Why:** If the WLAN status is disabled (admin down), clients will not see or join the SSID regardless of other settings."
      },
      {
        "id": "5.9-align-f3",
        "ckuId": "CKU-WPA",
        "front": "What should you remember about Wireless Encryption (WPA2/WPA3)?",
        "back": "**WEP is broken**. WPA2 uses AES/CCMP. WPA3 strengthens key exchange with SAE and is the recommended choice for new deployments."
      },
      {
        "id": "5.9-align-f4",
        "ckuId": "CKU-WPA2",
        "front": "What should you remember about Wpa2?",
        "back": "**Exam cue:** Matilda is interested in securing her SOHO wireless network. What should she do to be assured that only her devices can join her wireless network? **Key response:** Enable WPA2. **Why:** WPA2 with a passphrase authenticates and encrypts joins; MAC filtering is spoofable and is not strong assurance."
      },
      {
        "id": "5.9-align-f5",
        "ckuId": "CKU-AES-CCMP",
        "front": "What should you remember about Aes Ccmp?",
        "back": "**Exam cue:** Which mechanism in WPA prevents the altering and replay of data packets? **Key response:** MIC. **Why:** MIC in WPA detects tampered/replayed frames — integrity separate from AES encryption."
      },
      {
        "id": "5.9-align-f6",
        "ckuId": "CKU-PSK",
        "front": "What should you remember about Psk?",
        "back": "**Exam cue:** Which is a requirement of WPA2-Enterprise? **Key response:** RADIUS/EAP (802.1X) infrastructure. **Why:** WPA2-Enterprise uses 802.1X with RADIUS/EAP for per-user auth — not a shared PSK. Certificates appear with some EAP types, but RADIUS/EAP is the CCNA key idea."
      },
      {
        "id": "5.9-align-f7",
        "ckuId": "CKU-TKIP",
        "front": "What should you remember about Tkip?",
        "back": "**Exam cue:** Which mechanism in WPA prevents the altering and replay of data packets? **Key response:** MIC. **Why:** MIC in WPA detects tampered/replayed frames — integrity separate from AES encryption."
      },
      {
        "id": "5.9-align-f8",
        "ckuId": "CKU-WLAN-SSID",
        "front": "What should you remember about Wlan Ssid?",
        "back": "**Exam cue:** You need to set up a WLAN for connectivity to send and receive large files to roaming clients. The WLAN will exist with other WLAN traffic. **Key response:** Bronze. **Why:** Large file transfer is bulk/background traffic — Bronze (best effort, no priority) is appropriate alongside other WLANs."
      },
      {
        "id": "5.9-align-f9",
        "ckuId": "CKU-WPA3",
        "front": "What should you remember about Wpa3?",
        "back": "**Exam cue:** Which security mode does WPA3-Enterprise use that offers the highest level of security? **Key response:** 192-bit. **Why:** WPA3-Enterprise optional 192-bit security mode (GCMP-256) is the highest strength option in the blueprint."
      }
    ],
    "reading": {
      "tiers": {
        "beginner": "Configure WLAN using WPA2 PSK shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      },
      "keyPoints": [
        "WPA2-PSK WLAN: WLC WLAN with WPA2-AES, PSK passphrase, VLAN mapping",
        "4-way handshake derives per-session keys.",
        "Remember the exam-facing behavior for Configure WLAN using WPA2 PSK (point 3)."
      ]
    }
  },
  "5.10": {
    "flashcards": [
      {
        "id": "5.10-align-f1",
        "ckuId": "CKU-GRE",
        "front": "What should you remember about Gre?",
        "back": "**Exam cue:** Which statement is correct about Generic Routing Encapsulation (GRE) tunnels? **Key response:** GRE provides packet-in-packet encapsulation.. **Why:** GRE wraps an inner IP packet inside an outer IP header — classic packet-in-packet tunnel encapsulation."
      },
      {
        "id": "5.10-align-f2",
        "ckuId": "CKU-IPSEC",
        "front": "What should you remember about Ipsec?",
        "back": "**Exam cue:** Which protocol is used by 802.1X for supplicant to authenticator and authenticator to authentication server? **Key response:** EAP. **Why:** EAP carries authentication between supplicant↔authenticator and authenticator↔AAA server."
      },
      {
        "id": "5.10-align-f3",
        "ckuId": "CKU-IPS",
        "front": "What should you remember about Ips?",
        "back": "**Exam cue:** Which type of device can prevent an intrusion on your network? **Key response:** IPS. **Why:** IPS (Intrusion Prevention System) detects and actively blocks malicious traffic inline — prevention, not just detection."
      },
      {
        "id": "5.10-align-f4",
        "ckuId": "CKU-ESP",
        "front": "What should you remember about Esp?",
        "back": "**Exam cue:** Which protocol does IPsec use to encrypt data packets? **Key response:** ESP. **Why:** ESP (Encapsulating Security Payload) encrypts IPsec data packets — AH provides integrity without encryption."
      },
      {
        "id": "5.10-align-f5",
        "ckuId": "CKU-NHRP",
        "front": "What should you remember about Nhrp?",
        "back": "**Exam cue:** Which protocol helps resolve and direct traffic for DMVPN connections? **Key response:** NHRP. **Why:** NHRP (Next Hop Resolution Protocol) registers spokes and resolves NBMA next hops for DMVPN tunnels."
      }
    ],
    "reading": {
      "tiers": {
        "beginner": "Differentiate types of VPN and security concepts shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "5.11": {
    "flashcards": [
      {
        "id": "5.11-align-f1",
        "ckuId": "CKU-VLAN",
        "front": "What should you remember about VLAN?",
        "back": "**A logical Layer 2 broadcast domain**. Devices in the same VLAN communicate at L2 regardless of physical location; different VLANs require a router/L3 switch."
      },
      {
        "id": "5.11-align-f2",
        "ckuId": "CKU-LATERAL-MOVEMENT",
        "front": "What should you remember about Lateral Movement?",
        "back": "**Exam cue:** Ransomware infects a single workstation on a flat, unsegmented network with no internal access controls. **Key response:** The ransomware can more easily spread to other hosts and servers, since there are no internal boundaries rest…. **Why:** On a flat network, there are no internal boundaries to stop malware from reaching other hosts/servers once it's inside. Segmentation (VLANs, ACLs, firewalls between zones) contains the spread to the originating segment."
      },
      {
        "id": "5.11-align-f3",
        "ckuId": "CKU-ZERO-TRUST",
        "front": "What should you remember about Zero Trust?",
        "back": "**Exam cue:** Which statement best summarizes the \"zero trust\" principle as it relates to network segmentation? **Key response:** No device or user is implicitly trusted based on network location alone — every access request is verified, r…. **Why:** Zero trust rejects trusted-inside/untrusted-outside — every access request is verified regardless of network location."
      },
      {
        "id": "5.11-align-f4",
        "ckuId": "CKU-ACL",
        "front": "What should you remember about Access Control Lists?",
        "back": "**Ordered rules that permit/deny traffic by criteria**. Processed top-down, first match wins, with an implicit deny-all at the end."
      },
      {
        "id": "5.11-align-f5",
        "ckuId": "CKU-DMZ",
        "front": "What should you remember about Dmz?",
        "back": "**Exam cue:** What is the purpose of a DMZ (demilitarized zone) in network design? **Key response:** To host externally-facing services (e.g., web/email servers) in a buffer zone, isolated from the internal net…. **Why:** A DMZ hosts internet-facing services in a buffer zone — reachable from outside but isolated from the internal LAN."
      },
      {
        "id": "5.11-align-f6",
        "ckuId": "CKU-GUEST-NETWORK",
        "front": "What should you remember about Guest Network?",
        "back": "**Exam cue:** A company provides a guest Wi-Fi network for visitors. From a segmentation standpoint, what is the recommended design? **Key response:** Place guest traffic on a separate VLAN/subnet with restricted or no access to internal corporate resources, t…. **Why:** Guest traffic should be segmented onto its own VLAN/subnet with policies that block or heavily restrict access to internal resources, isolating untrusted guest devices from the corporate network."
      },
      {
        "id": "5.11-align-f7",
        "ckuId": "CKU-MICROSEGMENTATION",
        "front": "What should you remember about Microsegmentation?",
        "back": "**Exam cue:** How does microsegmentation differ from traditional VLAN-based segmentation? **Key response:** Microsegmentation applies granular security policies down to the individual workload or application level, of…. **Why:** Microsegmentation enforces policy per workload/application — often with overlays or host firewalls beyond coarse VLANs."
      },
      {
        "id": "5.11-align-f8",
        "ckuId": "CKU-OUT-OF-BAND-MANAGEMENT",
        "front": "What should you remember about Out Of Band Management?",
        "back": "**Exam cue:** An organization separates its network management traffic (SSH, SNMP, syslog to network devices) onto a dedicated out-of-band management VLAN, inacces… **Key response:** It reduces the attack surface for network device management interfaces by isolating them from general user/en…. **Why:** An out-of-band management network isolates administrative access to infrastructure devices from general user traffic, significantly reducing the attack surface — a compromised user device can't directly reach management interface…"
      },
      {
        "id": "5.11-align-f9",
        "ckuId": "CKU-VOICE-VLAN",
        "front": "What should you remember about Voice VLAN?",
        "back": "**A second VLAN on an access port for IP phones, so voice and data traffic are separated on the same physical port**."
      }
    ],
    "reading": {
      "bigTakeaway": "Master Describe security concepts of network segmentation: know the behavior, the exam trap, and how to verify it.",
      "tiers": {
        "beginner": "Describe security concepts of network segmentation shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      },
      "keyPoints": [
        "Network segmentation: Zones limit blast radius",
        "Stateful firewalls, NGFW with DPI/IPS, microsegmentation for workload-level policy.",
        "Remember the exam-facing behavior for Describe security concepts of network segm"
      ]
    }
  },
  "6.1": {
    "flashcards": [
      {
        "id": "6.1-align-f1",
        "ckuId": "CKU-HUMAN-ERROR-REDUCTION",
        "front": "What should you remember about Human Error Reduction?",
        "back": "**Exam cue:** Which is a reason to automate a process for the configuration of several routers? **Key response:** To create an outcome that can be reproduced. **Why:** Automation gives a repeatable, reproducible outcome — same intent across many devices reduces drift."
      },
      {
        "id": "6.1-align-f2",
        "ckuId": "CKU-NETWORK-AUTOMATION",
        "front": "What should you remember about Network Automation?",
        "back": "**Exam cue:** Which is a reason to automate a process for the configuration of several routers? **Key response:** To create an outcome that can be reproduced. **Why:** Automation gives a repeatable, reproducible outcome — same intent across many devices reduces drift."
      },
      {
        "id": "6.1-align-f3",
        "ckuId": "CKU-AGILE",
        "front": "What should you remember about Agile?",
        "back": "**Exam cue:** Which management methodology is commonly used by developers for network automation? **Key response:** Lean and Agile. **Why:** Lean and Agile emphasize iterative delivery — the methodology developers use alongside automation for network changes."
      },
      {
        "id": "6.1-align-f4",
        "ckuId": "CKU-DEVOPS",
        "front": "What should you remember about Devops?",
        "back": "**Exam cue:** Identify the term that is used to describe the framework responsible for assisting in network automation? **Key response:** DevOps. **Why:** DevOps blends development and operations practices — the framework CCNA ties to network automation and CI/CD for infrastructure."
      },
      {
        "id": "6.1-align-f5",
        "ckuId": "CKU-ESP",
        "front": "What should you remember about Esp?",
        "back": "**Exam cue:** Which protocol does IPsec use to encrypt data packets? **Key response:** ESP. **Why:** ESP (Encapsulating Security Payload) encrypts IPsec data packets — AH provides integrity without encryption."
      },
      {
        "id": "6.1-align-f6",
        "ckuId": "CKU-PYTHON-AUTOMATION",
        "front": "What should you remember about Python Automation?",
        "back": "**Exam cue:** You need to configure a new static route on the existing 20 routers. Which is the best way to do this? **Key response:** Create a Python script to configure each router.. **Why:** At scale (20 routers), a Python script (Ansible, Netmiko, etc.) is repeatable, auditable, and far faster than manual paste."
      }
    ],
    "reading": {
      "tiers": {
        "beginner": "Explain how automation impacts network management shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  },
  "6.2": {
    "flashcards": [
      {
        "id": "6.2-align-f1",
        "ckuId": "CKU-CENTRALIZED-CONTROL-PLANE",
        "front": "What should you remember about Centralized Control Plane?",
        "back": "**Exam cue:** Which is a benefit of controller-based networking? **Key response:** Increased security. **Why:** Centralized controller policy can enforce consistent security/QoS — a cited benefit of controller-based networking."
      },
      {
        "id": "6.2-align-f2",
        "ckuId": "CKU-CONTROLLER-BASED-NETWORKING",
        "front": "What should you remember about Controller Based Networking?",
        "back": "**Exam cue:** When configuring WPA2-Enterprise mode on a wireless LAN controller, what must be configured? **Key response:** RADIUS server. **Why:** WPA2-Enterprise uses 802.1X with a RADIUS server for per-user authentication — not a shared PSK."
      },
      {
        "id": "6.2-align-f3",
        "ckuId": "CKU-SNMP",
        "front": "What should you remember about SNMP Operations?",
        "back": "**SNMP: Manager, agent, MIB, OID**. Polling (Get) and traps/informs. v1/v2c use community strings; v3 adds auth and encryption."
      },
      {
        "id": "6.2-align-f4",
        "ckuId": "CKU-CONTROL-PLANE",
        "front": "What should you remember about Control Plane?",
        "back": "**Exam cue:** An organization's cloud-managed access points lose connectivity to the cloud dashboard during an ISP outage at headquarters. **Key response:** The APs typically continue forwarding existing traffic (data plane unaffected), but configuration changes and…. **Why:** Cloud-managed APs usually keep forwarding locally (data plane) but lose dashboard management, config push, and analytics until WAN returns."
      },
      {
        "id": "6.2-align-f5",
        "ckuId": "CKU-DATA-PLANE",
        "front": "What should you remember about Data Plane?",
        "back": "**Exam cue:** An organization's cloud-managed access points lose connectivity to the cloud dashboard during an ISP outage at headquarters. **Key response:** The APs typically continue forwarding existing traffic (data plane unaffected), but configuration changes and…. **Why:** Cloud-managed APs usually keep forwarding locally (data plane) but lose dashboard management, config push, and analytics until WAN returns."
      },
      {
        "id": "6.2-align-f6",
        "ckuId": "CKU-DNA-PROVISION",
        "front": "What should you remember about Dna Provision?",
        "back": "**Exam cue:** Which is a potential disadvantage with controller-based networking? **Key response:** Maturity. **Why:** Maturity — SDN/controller platforms are newer with evolving features compared to decades of traditional CLI ops."
      },
      {
        "id": "6.2-align-f7",
        "ckuId": "CKU-ESP",
        "front": "What should you remember about Esp?",
        "back": "**Exam cue:** Which protocol does IPsec use to encrypt data packets? **Key response:** ESP. **Why:** ESP (Encapsulating Security Payload) encrypts IPsec data packets — AH provides integrity without encryption."
      },
      {
        "id": "6.2-align-f8",
        "ckuId": "CKU-GRE",
        "front": "What should you remember about Gre?",
        "back": "**Exam cue:** Which statement is correct about Generic Routing Encapsulation (GRE) tunnels? **Key response:** GRE provides packet-in-packet encapsulation.. **Why:** GRE wraps an inner IP packet inside an outer IP header — classic packet-in-packet tunnel encapsulation."
      },
      {
        "id": "6.2-align-f9",
        "ckuId": "CKU-RESTCONF",
        "front": "What should you remember about Restconf?",
        "back": "**Exam cue:** Which method for configuration is used with Cisco Prime Infrastructure? **Key response:** SNMP. **Why:** Cisco Prime Infrastructure uses SNMP (and other methods) for device configuration/monitoring."
      },
      {
        "id": "6.2-align-f10",
        "ckuId": "CKU-SD-WAN",
        "front": "What should you remember about Sd Wan?",
        "back": "**Exam cue:** Which term is used with controller-based networking that combines multiple sites to act as one single network? **Key response:** SD-WAN. **Why:** SD-WAN overlays multiple sites into one managed fabric — controller-based WAN with centralized policy."
      },
      {
        "id": "6.2-align-f11",
        "ckuId": "CKU-VPN",
        "front": "What should you remember about VPN Types?",
        "back": "**VPN types: Site-to-site (network-to-network IPsec) vs remote-access (client VPN)**. IPsec: encryption, integrity, IKE negotiations. SSL VPN uses HTTPS ports."
      }
    ],
    "reading": {
      "tiers": {
        "beginner": "Compare traditional networks with controller-based networking shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      },
      "keyPoints": [
        "Traditional vs controller-based: Distributed control plane per device vs centralized SDN controller (DNA Center, APIC-EM) pushing policy to data-plane devices.",
        "Controller-based: policy and overlay come from the controller; devices keep a local data plane.",
        "Traditional: each box runs its own control plane — no single intent source."
      ]
    }
  },
  "6.3": {
    "flashcards": [
      {
        "id": "6.3-align-f1",
        "ckuId": "CKU-CONTROL-PLANE",
        "front": "What should you remember about Control Plane?",
        "back": "**Exam cue:** An organization's cloud-managed access points lose connectivity to the cloud dashboard during an ISP outage at headquarters. **Key response:** The APs typically continue forwarding existing traffic (data plane unaffected), but configuration changes and…. **Why:** Cloud-managed APs usually keep forwarding locally (data plane) but lose dashboard management, config push, and analytics until WAN returns."
      },
      {
        "id": "6.3-align-f2",
        "ckuId": "CKU-SDN-ARCHITECTURE",
        "front": "What should you remember about Sdn Architecture?",
        "back": "**Exam cue:** Which type of architecture is used with controller-based networks? **Key response:** Spine/Leaf. **Why:** Controller-based SDN campus/data-center fabrics commonly use spine-leaf (Clos) topology for equal-cost multipath east-west traffic."
      },
      {
        "id": "6.3-align-f3",
        "ckuId": "CKU-SPINE-LEAF",
        "front": "What should you remember about Spine-Leaf (Clos)?",
        "back": "**Data-center fabric where every leaf switch connects to every spine switch — predictable, low-latency, non-blocking east-west traffic**."
      },
      {
        "id": "6.3-align-f4",
        "ckuId": "CKU-MANAGEMENT-PLANE",
        "front": "What should you remember about Management Plane?",
        "back": "**Exam cue:** Which statement is correct about the SDN controller? **Key response:** The SDN controller replaces the control plane of the SDN.. **Why:** The SDN controller replaces the distributed control plane — devices forward (data plane) per controller policy."
      },
      {
        "id": "6.3-align-f5",
        "ckuId": "CKU-DATA-PLANE",
        "front": "What should you remember about Data Plane?",
        "back": "**Exam cue:** An organization's cloud-managed access points lose connectivity to the cloud dashboard during an ISP outage at headquarters. **Key response:** The APs typically continue forwarding existing traffic (data plane unaffected), but configuration changes and…. **Why:** Cloud-managed APs usually keep forwarding locally (data plane) but lose dashboard management, config push, and analytics until WAN returns."
      },
      {
        "id": "6.3-align-f6",
        "ckuId": "CKU-CONTROLLER-BASED-NETWORKING",
        "front": "What should you remember about Controller Based Networking?",
        "back": "**Exam cue:** When configuring WPA2-Enterprise mode on a wireless LAN controller, what must be configured? **Key response:** RADIUS server. **Why:** WPA2-Enterprise uses 802.1X with a RADIUS server for per-user authentication — not a shared PSK."
      },
      {
        "id": "6.3-align-f7",
        "ckuId": "CKU-API",
        "front": "What should you remember about Api?",
        "back": "**Exam cue:** Which current Cisco SDN solution is data center focused? **Key response:** Cisco ACI. **Why:** Cisco ACI is the data-center SDN fabric (APIC + spine-leaf) — distinct from campus APIC-EM or SD-WAN."
      },
      {
        "id": "6.3-align-f8",
        "ckuId": "CKU-ECMP",
        "front": "What should you remember about Ecmp?",
        "back": "**Exam cue:** Which WAN technology uses the overlay to connect remote offices? **Key response:** DMVPN. **Why:** DMVPN builds a dynamic VPN overlay over IP transport connecting remote sites."
      },
      {
        "id": "6.3-align-f9",
        "ckuId": "CKU-NORTHBOUND-API",
        "front": "What should you remember about Northbound Api?",
        "back": "**Exam cue:** Which is used for communication directly to the SDN devices in the network? **Key response:** The southbound interface (SBI). **Why:** The southbound interface (SBI) talks down to switches/routers — OpenFlow, NETCONF, etc."
      },
      {
        "id": "6.3-align-f10",
        "ckuId": "CKU-OVERLAY",
        "front": "What should you remember about Overlay?",
        "back": "**Exam cue:** Which component of an SDN is where the MTU is set? **Key response:** Underlay. **Why:** MTU is configured on the underlay physical/tunnel transport — not overlay logical networks."
      },
      {
        "id": "6.3-align-f11",
        "ckuId": "CKU-SD-WAN",
        "front": "What should you remember about Sd Wan?",
        "back": "**Exam cue:** Which term is used with controller-based networking that combines multiple sites to act as one single network? **Key response:** SD-WAN. **Why:** SD-WAN overlays multiple sites into one managed fabric — controller-based WAN with centralized policy."
      },
      {
        "id": "6.3-align-f12",
        "ckuId": "CKU-SNMP",
        "front": "What should you remember about SNMP Operations?",
        "back": "**SNMP: Manager, agent, MIB, OID**. Polling (Get) and traps/informs. v1/v2c use community strings; v3 adds auth and encryption."
      },
      {
        "id": "6.3-align-f13",
        "ckuId": "CKU-SOUTHBOUND-API",
        "front": "What should you remember about Southbound Api?",
        "back": "**Exam cue:** Which is used for communication directly to the SDN devices in the network? **Key response:** The southbound interface (SBI). **Why:** The southbound interface (SBI) talks down to switches/routers — OpenFlow, NETCONF, etc."
      },
      {
        "id": "6.3-align-f14",
        "ckuId": "CKU-VPN",
        "front": "What should you remember about VPN Types?",
        "back": "**VPN types: Site-to-site (network-to-network IPsec) vs remote-access (client VPN)**. IPsec: encryption, integrity, IKE negotiations. SSL VPN uses HTTPS ports."
      },
      {
        "id": "6.3-align-f15",
        "ckuId": "CKU-VXLAN",
        "front": "What should you remember about Vxlan?",
        "back": "**Exam cue:** Which WAN technology uses the overlay to connect remote offices? **Key response:** DMVPN. **Why:** DMVPN builds a dynamic VPN overlay over IP transport connecting remote sites."
      },
      {
        "id": "6.3-align-f16",
        "ckuId": "CKU-ACL",
        "front": "What should you remember about Access Control Lists?",
        "back": "**Ordered rules that permit/deny traffic by criteria**. Processed top-down, first match wins, with an implicit deny-all at the end."
      },
      {
        "id": "6.3-align-f17",
        "ckuId": "CKU-DNA-PLATFORM",
        "front": "What should you remember about Dna Platform?",
        "back": "**Exam cue:** Which platform is Cisco’s SDN controller offering for enterprise connectivity? **Key response:** APIC-EM. **Why:** Cisco APIC-EM is the SDN controller platform for enterprise campus/branch automation and policy."
      },
      {
        "id": "6.3-align-f18",
        "ckuId": "CKU-ESP",
        "front": "What should you remember about Esp?",
        "back": "**Exam cue:** Which protocol does IPsec use to encrypt data packets? **Key response:** ESP. **Why:** ESP (Encapsulating Security Payload) encrypts IPsec data packets — AH provides integrity without encryption."
      },
      {
        "id": "6.3-align-f19",
        "ckuId": "CKU-UNDERLAY",
        "front": "What should you remember about Underlay?",
        "back": "**Exam cue:** Which component of an SDN is where the MTU is set? **Key response:** Underlay. **Why:** MTU is configured on the underlay physical/tunnel transport — not overlay logical networks."
      }
    ],
    "reading": {
      "tiers": {
        "beginner": "Describe controller-based and software defined architectures shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      },
      "keyPoints": [
        "SDN architectures: Northbound APIs (REST to apps), southbound (NETCONF/OpenFlow to devices)",
        "Control plane centralized; data plane distributed.",
        "Remember the exam-facing behavior for Describe controller-based and software def"
      ]
    }
  },
  "6.4": {
    "flashcards": [
      {
        "id": "6.4-align-f1",
        "ckuId": "CKU-APIC-EM",
        "front": "What should you remember about Apic Em?",
        "back": "**Exam cue:** Which product is a replacement for APIC-EM? **Key response:** Cisco DNA Center. **Why:** Cisco DNA Center replaced APIC-EM as the campus SDN controller with automation, assurance, and fabric management."
      },
      {
        "id": "6.4-align-f2",
        "ckuId": "CKU-CISCO-DNA-CENTER",
        "front": "What should you remember about Cisco Dna Center?",
        "back": "**Exam cue:** Which product is a replacement for APIC-EM? **Key response:** Cisco DNA Center. **Why:** Cisco DNA Center replaced APIC-EM as the campus SDN controller with automation, assurance, and fabric management."
      },
      {
        "id": "6.4-align-f3",
        "ckuId": "CKU-DNA-ASSURANCE",
        "front": "What should you remember about Dna Assurance?",
        "back": "**Exam cue:** Which product is a replacement for APIC-EM? **Key response:** Cisco DNA Center. **Why:** Cisco DNA Center replaced APIC-EM as the campus SDN controller with automation, assurance, and fabric management."
      },
      {
        "id": "6.4-align-f4",
        "ckuId": "CKU-DNA-PLATFORM",
        "front": "What should you remember about Dna Platform?",
        "back": "**Exam cue:** Which platform is Cisco’s SDN controller offering for enterprise connectivity? **Key response:** APIC-EM. **Why:** Cisco APIC-EM is the SDN controller platform for enterprise campus/branch automation and policy."
      },
      {
        "id": "6.4-align-f5",
        "ckuId": "CKU-DNA-PROVISION",
        "front": "What should you remember about Dna Provision?",
        "back": "**Exam cue:** Which is a potential disadvantage with controller-based networking? **Key response:** Maturity. **Why:** Maturity — SDN/controller platforms are newer with evolving features compared to decades of traditional CLI ops."
      },
      {
        "id": "6.4-align-f6",
        "ckuId": "CKU-INVENTORY",
        "front": "What should you remember about Inventory?",
        "back": "**Exam cue:** Which protocol is not used by the DNA discovery process for reading the inventory of a network device? **Key response:** OpenFlow. **Why:** OpenFlow programs forwarding in SDN data planes — DNA Center discovery uses SSH/HTTPS/NETCONF, not OpenFlow for inventory."
      },
      {
        "id": "6.4-align-f7",
        "ckuId": "CKU-API",
        "front": "What should you remember about Api?",
        "back": "**Exam cue:** Which current Cisco SDN solution is data center focused? **Key response:** Cisco ACI. **Why:** Cisco ACI is the data-center SDN fabric (APIC + spine-leaf) — distinct from campus APIC-EM or SD-WAN."
      },
      {
        "id": "6.4-align-f8",
        "ckuId": "CKU-PYTHON-AUTOMATION",
        "front": "What should you remember about Python Automation?",
        "back": "**Exam cue:** You need to configure a new static route on the existing 20 routers. Which is the best way to do this? **Key response:** Create a Python script to configure each router.. **Why:** At scale (20 routers), a Python script (Ansible, Netmiko, etc.) is repeatable, auditable, and far faster than manual paste."
      },
      {
        "id": "6.4-align-f9",
        "ckuId": "CKU-SSH",
        "front": "What should you remember about SSH Remote Access?",
        "back": "**SSH remote access: hostname + ip domain-name, crypto key generate rsa, username secret, line vty transport input ssh login local**. Disable Telnet. show ip ssh to verify."
      },
      {
        "id": "6.4-align-f10",
        "ckuId": "CKU-AAA",
        "front": "What should you remember about Aaa?",
        "back": "**Exam cue:** Which AAA component would be used to determine whether an authenticated user is permitted to enter privileged EXEC mode or run specific configuration… **Key response:** Authorization. **Why:** Authorization determines what an authenticated user can do — privileged EXEC access, command levels."
      },
      {
        "id": "6.4-align-f11",
        "ckuId": "CKU-HTTP",
        "front": "What should you remember about Http?",
        "back": "**Exam cue:** Which protocol is not used by the DNA discovery process for reading the inventory of a network device? **Key response:** OpenFlow. **Why:** OpenFlow programs forwarding in SDN data planes — DNA Center discovery uses SSH/HTTPS/NETCONF, not OpenFlow for inventory."
      },
      {
        "id": "6.4-align-f12",
        "ckuId": "CKU-NETCONF",
        "front": "What should you remember about Netconf?",
        "back": "**Exam cue:** Which protocol is not used by the DNA discovery process for reading the inventory of a network device? **Key response:** OpenFlow. **Why:** OpenFlow programs forwarding in SDN data planes — DNA Center discovery uses SSH/HTTPS/NETCONF, not OpenFlow for inventory."
      },
      {
        "id": "6.4-align-f13",
        "ckuId": "CKU-OVERLAY",
        "front": "What should you remember about Overlay?",
        "back": "**Exam cue:** Which component of an SDN is where the MTU is set? **Key response:** Underlay. **Why:** MTU is configured on the underlay physical/tunnel transport — not overlay logical networks."
      },
      {
        "id": "6.4-align-f14",
        "ckuId": "CKU-SD-ACCESS",
        "front": "What should you remember about Sd Access?",
        "back": "**Exam cue:** Identify the Cisco DNA Center feature that automates the fabric of the underlay and overlay of the network? **Key response:** SD-Access. **Why:** SD-Access automates underlay + overlay fabric (LISP/VXLAN control)."
      },
      {
        "id": "6.4-align-f15",
        "ckuId": "CKU-SD-WAN",
        "front": "What should you remember about Sd Wan?",
        "back": "**Exam cue:** Which term is used with controller-based networking that combines multiple sites to act as one single network? **Key response:** SD-WAN. **Why:** SD-WAN overlays multiple sites into one managed fabric — controller-based WAN with centralized policy."
      },
      {
        "id": "6.4-align-f16",
        "ckuId": "CKU-SNMP",
        "front": "What should you remember about SNMP Operations?",
        "back": "**SNMP: Manager, agent, MIB, OID**. Polling (Get) and traps/informs. v1/v2c use community strings; v3 adds auth and encryption."
      },
      {
        "id": "6.4-align-f17",
        "ckuId": "CKU-UNDERLAY",
        "front": "What should you remember about Underlay?",
        "back": "**Exam cue:** Which component of an SDN is where the MTU is set? **Key response:** Underlay. **Why:** MTU is configured on the underlay physical/tunnel transport — not overlay logical networks."
      },
      {
        "id": "6.4-align-f18",
        "ckuId": "CKU-WLC",
        "front": "What should you remember about Wlc?",
        "back": "**Exam cue:** You require a density of 100 wireless clients in a relatively small area. Which design would be optimal? **Key response:** Lightweight WAPs with a WLC. **Why:** High client density in a small area needs lightweight APs with centralized RF management from a WLC — optimal for scale and control."
      }
    ],
    "reading": {
      "tiers": {
        "beginner": "Compare traditional campus management with Cisco DNA Center shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      },
      "keyPoints": [
        "DNA Center vs traditional: Centralized design, policy, provisioning, assurance, image management, intent-based networking vs box-by-box CLI.",
        "DNA Center workflows: inventory → design → policy → provision → assurance.",
        "Traditional campus: SNMP/CLI per device; no shared fabric intent."
      ]
    }
  },
  "6.5": {
    "flashcards": [
      {
        "id": "6.5-align-f1",
        "ckuId": "CKU-CRUD",
        "front": "What should you remember about Crud?",
        "back": "**Exam cue:** You are creating a network automation script to configure a network device. What should you research to identify what can be controlled with your scr… **Key response:** API reference. **Why:** Device API reference documents objects, methods, and parameters your script can call."
      },
      {
        "id": "6.5-align-f2",
        "ckuId": "CKU-HTTP-VERBS",
        "front": "What should you remember about Http Verbs?",
        "back": "**Exam cue:** You are creating a network automation script to configure a network device. What should you research to identify what can be controlled with your scr… **Key response:** API reference. **Why:** Device API reference documents objects, methods, and parameters your script can call."
      },
      {
        "id": "6.5-align-f3",
        "ckuId": "CKU-API",
        "front": "What should you remember about Api?",
        "back": "**Exam cue:** Which current Cisco SDN solution is data center focused? **Key response:** Cisco ACI. **Why:** Cisco ACI is the data-center SDN fabric (APIC + spine-leaf) — distinct from campus APIC-EM or SD-WAN."
      },
      {
        "id": "6.5-align-f4",
        "ckuId": "CKU-SNMP",
        "front": "What should you remember about SNMP Operations?",
        "back": "**SNMP: Manager, agent, MIB, OID**. Polling (Get) and traps/informs. v1/v2c use community strings; v3 adds auth and encryption."
      },
      {
        "id": "6.5-align-f5",
        "ckuId": "CKU-AUTH-TOKEN",
        "front": "What should you remember about Auth Token?",
        "back": "**Exam cue:** Several office-level users have administrative privileges on the network. Which of the following is the easiest to implement to immediately add secur… **Key response:** Least privilege. **Why:** Least privilege — remove unnecessary admin rights from office users — is the fastest policy win with no new hardware."
      },
      {
        "id": "6.5-align-f6",
        "ckuId": "CKU-CISCO-DNA-CENTER",
        "front": "What should you remember about Cisco Dna Center?",
        "back": "**Exam cue:** Which product is a replacement for APIC-EM? **Key response:** Cisco DNA Center. **Why:** Cisco DNA Center replaced APIC-EM as the campus SDN controller with automation, assurance, and fabric management."
      },
      {
        "id": "6.5-align-f7",
        "ckuId": "CKU-HTTP",
        "front": "What should you remember about Http?",
        "back": "**Exam cue:** Which protocol is not used by the DNA discovery process for reading the inventory of a network device? **Key response:** OpenFlow. **Why:** OpenFlow programs forwarding in SDN data planes — DNA Center discovery uses SSH/HTTPS/NETCONF, not OpenFlow for inventory."
      },
      {
        "id": "6.5-align-f8",
        "ckuId": "CKU-TOKENS",
        "front": "What should you remember about Tokens?",
        "back": "**Exam cue:** Several office-level users have administrative privileges on the network. Which of the following is the easiest to implement to immediately add secur… **Key response:** Least privilege. **Why:** Least privilege — remove unnecessary admin rights from office users — is the fastest policy win with no new hardware."
      },
      {
        "id": "6.5-align-f9",
        "ckuId": "CKU-CONTROLLER-BASED-NETWORKING",
        "front": "What should you remember about Controller Based Networking?",
        "back": "**Exam cue:** When configuring WPA2-Enterprise mode on a wireless LAN controller, what must be configured? **Key response:** RADIUS server. **Why:** WPA2-Enterprise uses 802.1X with a RADIUS server for per-user authentication — not a shared PSK."
      },
      {
        "id": "6.5-align-f10",
        "ckuId": "CKU-NETCONF",
        "front": "What should you remember about Netconf?",
        "back": "**Exam cue:** Which protocol is not used by the DNA discovery process for reading the inventory of a network device? **Key response:** OpenFlow. **Why:** OpenFlow programs forwarding in SDN data planes — DNA Center discovery uses SSH/HTTPS/NETCONF, not OpenFlow for inventory."
      },
      {
        "id": "6.5-align-f11",
        "ckuId": "CKU-SDN",
        "front": "What should you remember about Sdn?",
        "back": "**Exam cue:** Which is a benefit of controller-based networking? **Key response:** Increased security. **Why:** Centralized controller policy can enforce consistent security/QoS — a cited benefit of controller-based networking."
      },
      {
        "id": "6.5-align-f12",
        "ckuId": "CKU-YANG",
        "front": "What should you remember about Yang?",
        "back": "**Exam cue:** Which protocol uses the YANG data model? **Key response:** NETCONF. **Why:** NETCONF uses YANG data models to define configuration and operational state in a structured tree."
      },
      {
        "id": "6.5-align-f13",
        "ckuId": "CKU-AUTOMATION",
        "front": "What should you remember about Network Automation Impact?",
        "back": "**Automation impact: Scripts/APIs (Ansible, Python) replace per-device CLI — faster, consistent, fewer errors**. Infrastructure as Code for networks."
      },
      {
        "id": "6.5-align-f14",
        "ckuId": "CKU-PASSWORD",
        "front": "What should you remember about Password?",
        "back": "**Exam cue:** A user has brought an email to your attention that is not from his bank, but it looks like his bank’s website when he clicks on the link. **Key response:** Phishing. **Why:** A fake bank email with a look-alike site is classic phishing — tricking the user into revealing credentials."
      },
      {
        "id": "6.5-align-f15",
        "ckuId": "CKU-SSH",
        "front": "What should you remember about SSH Remote Access?",
        "back": "**SSH remote access: hostname + ip domain-name, crypto key generate rsa, username secret, line vty transport input ssh login local**. Disable Telnet. show ip ssh to verify."
      },
      {
        "id": "6.5-align-f16",
        "ckuId": "CKU-YAML",
        "front": "What should you remember about Yaml?",
        "back": "**Exam cue:** Which protocol uses the YANG data model? **Key response:** NETCONF. **Why:** NETCONF uses YANG data models to define configuration and operational state in a structured tree."
      },
      {
        "id": "6.5-align-f17",
        "ckuId": "CKU-AAA",
        "front": "What should you remember about Aaa?",
        "back": "**Exam cue:** Which AAA component would be used to determine whether an authenticated user is permitted to enter privileged EXEC mode or run specific configuration… **Key response:** Authorization. **Why:** Authorization determines what an authenticated user can do — privileged EXEC access, command levels."
      },
      {
        "id": "6.5-align-f18",
        "ckuId": "CKU-BASE64",
        "front": "What should you remember about Base64?",
        "back": "**Exam cue:** Which encoding method is used to transmit the username and password to obtain the X-Auth-Token from the Cisco DNA Center? **Key response:** Base64. **Why:** HTTP Basic auth encodes username:password with Base64 before placing it in the Authorization header."
      },
      {
        "id": "6.5-align-f19",
        "ckuId": "CKU-CRYPTO-KEY-GENERATE-RSA",
        "front": "What should you remember about Crypto Key Generate Rsa?",
        "back": "**Exam cue:** Which command generate the encryption keys for SSH? **Key response:** Router(config)#crypto key generate rsa. **Why:** crypto key generate rsa in global config creates the RSA key pair used by SSH."
      },
      {
        "id": "6.5-align-f20",
        "ckuId": "CKU-ESP",
        "front": "What should you remember about Esp?",
        "back": "**Exam cue:** Which protocol does IPsec use to encrypt data packets? **Key response:** ESP. **Why:** ESP (Encapsulating Security Payload) encrypts IPsec data packets — AH provides integrity without encryption."
      },
      {
        "id": "6.5-align-f21",
        "ckuId": "CKU-JSON",
        "front": "What should you remember about Json?",
        "back": "**Exam cue:** Which is a RESTCONF content type that is used with a RESTCONF request? **Key response:** application/yang-data+json. **Why:** RESTCONF uses IETF content types like application/yang-data+json — not generic application/json alone."
      },
      {
        "id": "6.5-align-f22",
        "ckuId": "CKU-NORTHBOUND-API",
        "front": "What should you remember about Northbound Api?",
        "back": "**Exam cue:** Which is used for communication directly to the SDN devices in the network? **Key response:** The southbound interface (SBI). **Why:** The southbound interface (SBI) talks down to switches/routers — OpenFlow, NETCONF, etc."
      },
      {
        "id": "6.5-align-f23",
        "ckuId": "CKU-SOUTHBOUND-API",
        "front": "What should you remember about Southbound Api?",
        "back": "**Exam cue:** Which is used for communication directly to the SDN devices in the network? **Key response:** The southbound interface (SBI). **Why:** The southbound interface (SBI) talks down to switches/routers — OpenFlow, NETCONF, etc."
      }
    ],
    "reading": {
      "tiers": {
        "beginner": "Describe characteristics of REST-based APIs shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      },
      "keyPoints": [
        "REST APIs: HTTP GET/POST/PUT/DELETE on resource URLs; JSON payloads; stateless; common codes 200/201/400/401/404/500.",
        "CRUD maps to verbs: Create=POST, Read=GET, Update=PUT/PATCH, Delete=DELETE.",
        "Auth usually uses tokens or basic auth — 401 means credentials failed."
      ]
    }
  },
  "6.6": {
    "flashcards": [
      {
        "id": "6.6-align-f1",
        "ckuId": "CKU-ANSIBLE",
        "front": "What should you remember about Ansible?",
        "back": "**Exam cue:** Which function does Ansible, Chef, and Puppet perform in the network? **Key response:** Configuration management. **Why:** Ansible, Chef, and Puppet are configuration management tools — declarative/automated device config at scale."
      },
      {
        "id": "6.6-align-f2",
        "ckuId": "CKU-CONFIGURATION-MANAGEMENT",
        "front": "What should you remember about Configuration Management?",
        "back": "**Exam cue:** Which function does Ansible, Chef, and Puppet perform in the network? **Key response:** Configuration management. **Why:** Ansible, Chef, and Puppet are configuration management tools — declarative/automated device config at scale."
      },
      {
        "id": "6.6-align-f3",
        "ckuId": "CKU-PUPPET",
        "front": "What should you remember about Puppet?",
        "back": "**Exam cue:** Which function does Ansible, Chef, and Puppet perform in the network? **Key response:** Configuration management. **Why:** Ansible, Chef, and Puppet are configuration management tools — declarative/automated device config at scale."
      },
      {
        "id": "6.6-align-f4",
        "ckuId": "CKU-YAML",
        "front": "What should you remember about Yaml?",
        "back": "**Exam cue:** Which protocol uses the YANG data model? **Key response:** NETCONF. **Why:** NETCONF uses YANG data models to define configuration and operational state in a structured tree."
      },
      {
        "id": "6.6-align-f5",
        "ckuId": "CKU-XML",
        "front": "What should you remember about Xml?",
        "back": "**Exam cue:** Which format must a custom Ansible module be written in? **Key response:** JSON. **Why:** Custom Ansible modules are written in Python — extends Ansible's task library."
      },
      {
        "id": "6.6-align-f6",
        "ckuId": "CKU-CHEF",
        "front": "What should you remember about Chef?",
        "back": "**Exam cue:** Which function does Ansible, Chef, and Puppet perform in the network? **Key response:** Configuration management. **Why:** Ansible, Chef, and Puppet are configuration management tools — declarative/automated device config at scale."
      },
      {
        "id": "6.6-align-f7",
        "ckuId": "CKU-CISCO-DNA-CENTER",
        "front": "What should you remember about Cisco Dna Center?",
        "back": "**Exam cue:** Which product is a replacement for APIC-EM? **Key response:** Cisco DNA Center. **Why:** Cisco DNA Center replaced APIC-EM as the campus SDN controller with automation, assurance, and fabric management."
      },
      {
        "id": "6.6-align-f8",
        "ckuId": "CKU-API",
        "front": "What should you remember about Api?",
        "back": "**Exam cue:** Which current Cisco SDN solution is data center focused? **Key response:** Cisco ACI. **Why:** Cisco ACI is the data-center SDN fabric (APIC + spine-leaf) — distinct from campus APIC-EM or SD-WAN."
      },
      {
        "id": "6.6-align-f9",
        "ckuId": "CKU-COOKBOOK",
        "front": "What should you remember about Cookbook?",
        "back": "**Exam cue:** Which Chef component contains the set of instructions to configure a node? **Key response:** Recipe. **Why:** A Chef recipe is the instruction set that configures a node — recipes live inside cookbooks."
      },
      {
        "id": "6.6-align-f10",
        "ckuId": "CKU-PLAYBOOK",
        "front": "What should you remember about Playbook?",
        "back": "**Exam cue:** Which component in an Ansible setup defines the connection information so that Ansible can perform configuration management? **Key response:** Inventory. **Why:** The inventory file lists managed hosts, groups, and connection variables — Ansible needs it to know where to connect."
      },
      {
        "id": "6.6-align-f11",
        "ckuId": "CKU-ESP",
        "front": "What should you remember about Esp?",
        "back": "**Exam cue:** Which protocol does IPsec use to encrypt data packets? **Key response:** ESP. **Why:** ESP (Encapsulating Security Payload) encrypts IPsec data packets — AH provides integrity without encryption."
      },
      {
        "id": "6.6-align-f12",
        "ckuId": "CKU-IDEMPOTENCE",
        "front": "What should you remember about Idempotence?",
        "back": "**Exam cue:** Which is a correct statement about configuration management? **Key response:** IaC solutions prevent drift with Idempotence.. **Why:** Infrastructure as Code tools enforce desired state with idempotence — reruns correct drift."
      },
      {
        "id": "6.6-align-f13",
        "ckuId": "CKU-INVENTORY",
        "front": "What should you remember about Inventory?",
        "back": "**Exam cue:** Which protocol is not used by the DNA discovery process for reading the inventory of a network device? **Key response:** OpenFlow. **Why:** OpenFlow programs forwarding in SDN data planes — DNA Center discovery uses SSH/HTTPS/NETCONF, not OpenFlow for inventory."
      },
      {
        "id": "6.6-align-f14",
        "ckuId": "CKU-MANIFEST",
        "front": "What should you remember about Manifest?",
        "back": "**Exam cue:** Which Puppet component contains the configuration for the managed hosts? **Key response:** Manifest. **Why:** A Puppet manifest (.pp) declares the desired configuration for managed hosts."
      },
      {
        "id": "6.6-align-f15",
        "ckuId": "CKU-PYTHON-AUTOMATION",
        "front": "What should you remember about Python Automation?",
        "back": "**Exam cue:** You need to configure a new static route on the existing 20 routers. Which is the best way to do this? **Key response:** Create a Python script to configure each router.. **Why:** At scale (20 routers), a Python script (Ansible, Netmiko, etc.) is repeatable, auditable, and far faster than manual paste."
      },
      {
        "id": "6.6-align-f16",
        "ckuId": "CKU-RECIPE",
        "front": "What should you remember about Recipe?",
        "back": "**Exam cue:** Which Chef component contains the set of instructions to configure a node? **Key response:** Recipe. **Why:** A Chef recipe is the instruction set that configures a node — recipes live inside cookbooks."
      }
    ],
    "reading": {
      "tiers": {
        "beginner": "Interpret JSON data and configuration management tools shows up on the exam as a practical decision, not a vocabulary quiz. In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept. Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology."
      }
    }
  }
}
