/** Gold reviews — Batch 15: WLAN 5.9, automation 6.1, SDN 6.2, NTP 4.2, EtherChannel 2.4, device access 5.3. */
export const BATCH15_GOLD = {
  'obj-5.9-depth-q1':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "The WPA2 **4-way handshake** derives a unique **PTK** (Pairwise Transient Key) per session from the PSK \u2014 enabling encrypted unicast between client and AP."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "DHCP assigns IP addresses \u2014 the 4-way handshake is Layer 2 wireless key negotiation, not address assignment.",
        "misconceptionTested": "Confusing key exchange with DHCP"
      },
      {
        "choiceIndex": 2,
        "explanation": "CDP is a Cisco Layer 2 discovery protocol \u2014 unrelated to WPA2 authentication.",
        "misconceptionTested": "Mixing CDP with wireless security"
      },
      {
        "choiceIndex": 3,
        "explanation": "OSPF is a routing protocol \u2014 the 4-way handshake does not configure routing on a WLC.",
        "misconceptionTested": "Routing protocol in WPA2 handshake"
      }
    ],
    "examTip": "WPA2 4-way handshake \u2192 **PTK** from PSK for encrypted client\u2013AP traffic."
  },
  '5.9-en-q1':   {
    "correct": {
      "choiceIndex": 2,
      "explanation": "WPA2-PSK on CCNA expects **AES (CCMP)** \u2014 the modern, strong encryption standard for WPA2."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "WEP is broken and deprecated \u2014 WPA2 uses AES, not WEP.",
        "misconceptionTested": "WEP as WPA2 encryption"
      },
      {
        "choiceIndex": 1,
        "explanation": "TKIP was WPA1-era; WPA2 standard encryption is **AES (CCMP)**.",
        "misconceptionTested": "TKIP-only for WPA2"
      },
      {
        "choiceIndex": 3,
        "explanation": "RC4 underpinned WEP \u2014 WPA2-PSK uses AES-CCMP.",
        "misconceptionTested": "RC4 cipher for WPA2"
      }
    ],
    "examTip": "WPA2 = **AES (CCMP)**; WEP/TKIP are legacy."
  },
  '5.9-en-q2':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "WPA2-PSK passphrases must be **8\u201363 ASCII characters** \u2014 the valid PSK length range on CCNA."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Fewer than 8 characters is too short \u2014 WPA2-PSK requires a minimum of 8.",
        "misconceptionTested": "Too-short PSK accepted"
      },
      {
        "choiceIndex": 2,
        "explanation": "64 hex digits is a raw 256-bit key format \u2014 passphrases are 8\u201363 characters, not exactly 64 hex.",
        "misconceptionTested": "64-hex as passphrase length"
      },
      {
        "choiceIndex": 3,
        "explanation": "WPA2-PSK enforces a minimum length \u2014 open/no minimum is not valid.",
        "misconceptionTested": "No minimum PSK length"
      }
    ],
    "examTip": "WPA2-PSK passphrase = **8\u201363 characters**."
  },
  '5.9-def-psk':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "WPA2-Personal (**PSK**) requires a **pre-shared key** configured on the WLAN security policy \u2014 all clients use the same passphrase."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Per-user 802.1X certificates describe **WPA2-Enterprise**, not Personal/PSK mode.",
        "misconceptionTested": "Enterprise certs for PSK mode"
      },
      {
        "choiceIndex": 2,
        "explanation": "RADIUS is used with 802.1X Enterprise \u2014 PSK mode uses a shared key, not per-user RADIUS credentials.",
        "misconceptionTested": "RADIUS-only for WPA2-Personal"
      },
      {
        "choiceIndex": 3,
        "explanation": "Open + captive portal is a different authentication model \u2014 PSK requires a configured shared key.",
        "misconceptionTested": "Open auth as WPA2-Personal"
      }
    ],
    "examTip": "WPA2-**Personal** = one **PSK** on the WLAN; Enterprise = 802.1X/RADIUS."
  },
  '6.1-en-q1':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Network automation delivers **faster, repeatable changes** with **fewer manual CLI errors** \u2014 the primary operational benefit on CCNA."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Automation does not remove the need for IP addressing plans \u2014 it executes planned changes consistently.",
        "misconceptionTested": "Automation replaces IP planning"
      },
      {
        "choiceIndex": 2,
        "explanation": "Routing protocols are still required \u2014 automation configures devices, it does not replace protocols.",
        "misconceptionTested": "Automation eliminates routing protocols"
      },
      {
        "choiceIndex": 3,
        "explanation": "Drift can still occur if automation is not maintained \u2014 automation reduces errors but does not guarantee zero drift forever.",
        "misconceptionTested": "Perfect zero-drift guarantee"
      }
    ],
    "examTip": "Automation ops win = **speed + repeatability + fewer typos**."
  },
  '6.1-en-q2':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "**Infrastructure as Code (IaC)** means device config is defined in **versioned templates/playbooks** instead of one-off manual CLI on each box."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "IaC is about how config is defined and deployed \u2014 not replacing all hardware with VMs only.",
        "misconceptionTested": "IaC equals full virtualization"
      },
      {
        "choiceIndex": 2,
        "explanation": "Automation typically uses SSH/API \u2014 IaC does not mean disabling remote management.",
        "misconceptionTested": "IaC means console-only access"
      },
      {
        "choiceIndex": 3,
        "explanation": "IaC applies to on-prem and cloud \u2014 it is not limited to cloud-only routing.",
        "misconceptionTested": "IaC only in cloud routing"
      }
    ],
    "examTip": "IaC = config as **versioned code** (Ansible, templates), not ad-hoc CLI."
  },
  '6.1-en-q3':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "With Ansible, teams spend **more time writing/maintaining automation** and **less box-by-box CLI** \u2014 the operational shift CCNA expects."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Automation does not remove the need to understand VLANs and routing \u2014 it executes what engineers design.",
        "misconceptionTested": "Automation removes L2/L3 knowledge"
      },
      {
        "choiceIndex": 2,
        "explanation": "Change windows and validation still matter \u2014 automated deploys still need testing and approval.",
        "misconceptionTested": "No change control with automation"
      },
      {
        "choiceIndex": 3,
        "explanation": "`show` commands remain essential for troubleshooting \u2014 automation does not replace verification.",
        "misconceptionTested": "Eliminating show commands"
      }
    ],
    "examTip": "Ansible shift: **less per-device CLI**, more playbook maintenance."
  },
  '6.1-design-auto':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Automation most directly improves operations through **repeatable, faster changes** with **fewer manual errors**."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "IP addressing design is still required \u2014 automation applies the plan, it does not replace it.",
        "misconceptionTested": "Automation removes IP planning"
      },
      {
        "choiceIndex": 2,
        "explanation": "Physical cabling is still needed \u2014 automation configures devices, not physical plant.",
        "misconceptionTested": "Automation eliminates cabling"
      },
      {
        "choiceIndex": 3,
        "explanation": "No solution guarantees zero outages \u2014 automation reduces human error but cannot promise perfection.",
        "misconceptionTested": "Zero-outage guarantee from automation"
      }
    ],
    "examTip": "Ops benefit of automation = **consistent, fast deploys** \u2014 not magic uptime."
  },
  '6.1-def-rest':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "Cisco DNA Center and IOS XE REST APIs most commonly exchange data as **JSON** \u2014 the standard REST payload format."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "REST APIs use structured text (JSON/XML) over HTTP \u2014 not proprietary Layer 2 frames.",
        "misconceptionTested": "Binary frames over REST"
      },
      {
        "choiceIndex": 2,
        "explanation": "HTML is for web pages \u2014 programmatic APIs return JSON (or XML), not HTML-only responses.",
        "misconceptionTested": "HTML as API data format"
      },
      {
        "choiceIndex": 3,
        "explanation": "SNMP traps are asynchronous notifications \u2014 REST API calls use request/response with JSON bodies.",
        "misconceptionTested": "SNMP traps as REST payload"
      }
    ],
    "examTip": "Cisco REST/DNA Center \u2192 expect **JSON** request/response bodies."
  },
  'obj-6.2-depth-q3':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "A **centralized control plane** enables **consistent policy** and **API-driven changes at scale** across the network."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Centralization reduces per-box policy drift \u2014 it does not cause random inconsistency.",
        "misconceptionTested": "Central control increases drift"
      },
      {
        "choiceIndex": 2,
        "explanation": "SDN controllers improve visibility \u2014 centralized state is a key benefit.",
        "misconceptionTested": "Central control removes visibility"
      },
      {
        "choiceIndex": 3,
        "explanation": "Telnet is insecure and unrelated \u2014 SDN uses APIs, not mandatory Telnet.",
        "misconceptionTested": "SDN requires Telnet"
      }
    ],
    "examTip": "Central control plane \u2192 **one policy brain**, API push to many devices."
  },
  'obj-6.2-depth-q5':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Controller-based networking adds **programmatic policy** and **centralized state** \u2014 the hallmark of SDN operations."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Controllers increase visibility into network state \u2014 they do not reduce it.",
        "misconceptionTested": "Controller reduces visibility"
      },
      {
        "choiceIndex": 2,
        "explanation": "IP subnets are still fundamental \u2014 SDN orchestrates policy, it does not remove addressing.",
        "misconceptionTested": "SDN eliminates IP subnets"
      },
      {
        "choiceIndex": 3,
        "explanation": "Trunks are still needed for VLAN transport \u2014 SDN does not remove Layer 2 trunking.",
        "misconceptionTested": "SDN removes all trunks"
      }
    ],
    "examTip": "Controller-based = **central policy + programmatic APIs**."
  },
  'obj-6.2-depth-q6':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "SDN does **not** mean eliminating all **local forwarding hardware** \u2014 data-plane switches still forward packets locally."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "APIs for programmability are a core SDN feature \u2014 this is what SDN does mean.",
        "misconceptionTested": "Denying APIs as SDN feature"
      },
      {
        "choiceIndex": 2,
        "explanation": "Control/data plane separation is the SDN model \u2014 this is what SDN does mean.",
        "misconceptionTested": "Denying plane separation as SDN"
      },
      {
        "choiceIndex": 3,
        "explanation": "Central policy orchestration is SDN \u2014 this is what SDN does mean.",
        "misconceptionTested": "Denying orchestration as SDN"
      }
    ],
    "examTip": "SDN separates **control** (controller) from **forwarding** (switches still forward)."
  },
  '6.2-design-sdn':   {
    "correct": {
      "choiceIndex": 0,
      "explanation": "In controller-based networking, the **control plane** resides **centrally on the SDN controller** \u2014 not independently on every device."
    },
    "incorrect": [
      {
        "choiceIndex": 1,
        "explanation": "Traditional per-switch CLI keeps control distributed \u2014 SDN centralizes it on the controller.",
        "misconceptionTested": "Control plane only on access switches"
      },
      {
        "choiceIndex": 2,
        "explanation": "DNS resolves names \u2014 it is not the SDN control plane.",
        "misconceptionTested": "DNS as control plane"
      },
      {
        "choiceIndex": 3,
        "explanation": "SDN separates control from data plane \u2014 control is not removed; it moves to the controller.",
        "misconceptionTested": "No control plane in SDN"
      }
    ],
    "examTip": "SDN control plane \u2192 **central controller**; data plane stays on switches."
  },
  'obj-4.2-depth-q1':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "NTP **stratum 3** means the server is **three hops** from the reference clock (stratum 0) \u2014 each sync level adds one stratum."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Stratum 0 is the reference clock itself \u2014 stratum 3 is three levels removed.",
        "misconceptionTested": "Stratum 3 as atomic reference"
      },
      {
        "choiceIndex": 2,
        "explanation": "Stratum 16 indicates unsynchronized \u2014 stratum 3 is a valid, synced server.",
        "misconceptionTested": "Stratum 3 as unsynchronized"
      },
      {
        "choiceIndex": 3,
        "explanation": "Manual `clock set` is not NTP synchronization \u2014 stratum reflects NTP hierarchy distance.",
        "misconceptionTested": "Manual clock set as stratum meaning"
      }
    ],
    "examTip": "Stratum = **hops from reference**; lower is closer (stratum 1 = direct to ref)."
  },
  'obj-4.2-depth-q2':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "NTP uses **UDP port 123** \u2014 connectionless time synchronization."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "NTP is UDP-based, not TCP \u2014 port 123 over UDP.",
        "misconceptionTested": "NTP over TCP 123"
      },
      {
        "choiceIndex": 2,
        "explanation": "UDP 69 is TFTP \u2014 NTP is UDP 123.",
        "misconceptionTested": "TFTP port for NTP"
      },
      {
        "choiceIndex": 3,
        "explanation": "TCP 443 is HTTPS \u2014 NTP does not use TLS port 443.",
        "misconceptionTested": "HTTPS port for NTP"
      }
    ],
    "examTip": "NTP = **UDP 123** (not TCP)."
  },
  'obj-4.2-depth-q3':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**`clock set`** is a **one-time manual** time set; **NTP continuously synchronizes** the clock to authoritative servers."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "NTP is ongoing synchronization \u2014 `clock set` is the manual one-time approach.",
        "misconceptionTested": "NTP as manual one-time only"
      },
      {
        "choiceIndex": 2,
        "explanation": "They serve different purposes \u2014 manual set vs automatic ongoing sync.",
        "misconceptionTested": "clock set identical to NTP"
      },
      {
        "choiceIndex": 3,
        "explanation": "NTP does not require SSH \u2014 it uses UDP 123 to NTP servers.",
        "misconceptionTested": "SSH required for NTP"
      }
    ],
    "examTip": "`clock set` = **manual once**; NTP = **ongoing sync**."
  },
  'obj-4.2-depth-q5':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "An asterisk (*) in **`show ntp associations`** marks the **currently selected sync source** \u2014 the server in use."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Unreachable servers show differently \u2014 * marks the active sync peer.",
        "misconceptionTested": "Asterisk means unreachable"
      },
      {
        "choiceIndex": 2,
        "explanation": "Stratum 16 means unsynchronized \u2014 * indicates the chosen server, not stratum 16.",
        "misconceptionTested": "Asterisk as stratum 16"
      },
      {
        "choiceIndex": 3,
        "explanation": "ACL denial is unrelated to the * marker in NTP associations output.",
        "misconceptionTested": "ACL denied shown as asterisk"
      }
    ],
    "examTip": "`*` in NTP associations = **current sync source**."
  },
  'obj-4.2-depth-q6':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "A client's stratum is typically **server stratum plus 1** \u2014 each hop down the hierarchy increments stratum."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Stratum increases (worsens) downstream \u2014 client is server stratum **+1**, not minus 1.",
        "misconceptionTested": "Client stratum minus one"
      },
      {
        "choiceIndex": 2,
        "explanation": "Stratum 1 is only for servers directly synced to reference \u2014 clients inherit higher stratum.",
        "misconceptionTested": "Client always stratum 1"
      },
      {
        "choiceIndex": 3,
        "explanation": "Stratum 16 means unsynchronized \u2014 a synced client is server stratum + 1.",
        "misconceptionTested": "Synced client as stratum 16"
      }
    ],
    "examTip": "Downstream NTP client stratum = **upstream stratum + 1**."
  },
  'obj-4.2-depth-q7':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Stratum 16** in NTP output means an **unsynchronized clock** \u2014 no valid time source."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Stratum 1 is closest to reference \u2014 16 is the worst (unsynced), not best.",
        "misconceptionTested": "Stratum 16 as best sync"
      },
      {
        "choiceIndex": 2,
        "explanation": "GPS direct would be low stratum \u2014 16 indicates no synchronization.",
        "misconceptionTested": "Stratum 16 as GPS direct"
      },
      {
        "choiceIndex": 3,
        "explanation": "Leap seconds are a separate NTP concept \u2014 stratum 16 specifically means unsynchronized.",
        "misconceptionTested": "Stratum 16 as leap second"
      }
    ],
    "examTip": "Stratum **16** = **unsynchronized** (no valid NTP source)."
  },
  'obj-2.4-depth-q1':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Assign the Layer 3 address on the **port-channel interface** \u2014 the logical bundle, not individual member links."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Member interfaces should not carry the routed IP \u2014 use the port-channel interface.",
        "misconceptionTested": "IP on first member link"
      },
      {
        "choiceIndex": 2,
        "explanation": "IP on any member causes inconsistency \u2014 only the port-channel gets the address.",
        "misconceptionTested": "IP on any member interface"
      },
      {
        "choiceIndex": 3,
        "explanation": "VLAN 1 is unrelated \u2014 routed EtherChannel IPs go on the port-channel interface.",
        "misconceptionTested": "VLAN 1 only for bundle IP"
      }
    ],
    "examTip": "Routed EtherChannel IP \u2192 **`interface Port-channel N`**, not members."
  },
  'obj-2.4-depth-q2':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Active** and **passive** LACP modes exchange PDUs \u2014 active initiates, passive responds when it receives LACP frames."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`on` is static EtherChannel (no LACP PDUs) \u2014 not LACP negotiation.",
        "misconceptionTested": "on mode sends LACP PDUs"
      },
      {
        "choiceIndex": 2,
        "explanation": "`auto` and `desirable` are PAgP modes \u2014 not IEEE 802.3ad LACP.",
        "misconceptionTested": "PAgP modes as LACP"
      },
      {
        "choiceIndex": 3,
        "explanation": "`on` does not send LACP PDUs \u2014 only active/passive use LACP negotiation.",
        "misconceptionTested": "active and on both LACP"
      }
    ],
    "examTip": "LACP PDUs: **active** (initiates) + **passive** (responds); `on` = no LACP."
  },
  'obj-5.3-depth-q2':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "Secure remote vty access: **local user**, **`login local`**, **`transport input ssh`**, and **RSA keys** for SSH."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Telnet sends credentials in cleartext \u2014 never combine with no login for secure access.",
        "misconceptionTested": "Telnet without login as secure"
      },
      {
        "choiceIndex": 2,
        "explanation": "Console-only blocks remote management \u2014 vty SSH is required for secure remote admin.",
        "misconceptionTested": "Console only for remote access"
      },
      {
        "choiceIndex": 3,
        "explanation": "SNMP community strings are not vty login \u2014 use SSH with local/AAA authentication.",
        "misconceptionTested": "SNMP community for vty security"
      }
    ],
    "examTip": "Secure vty = **SSH + local/AAA login + crypto key generate rsa**."
  },
  'obj-5.3-depth-q4':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "The **console port** should have **login/password or AAA authentication** \u2014 physical access still needs protection."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Unauthenticated console is a security risk \u2014 always require login on console.",
        "misconceptionTested": "Open console for convenience"
      },
      {
        "choiceIndex": 2,
        "explanation": "Open console access is not acceptable \u2014 authenticate even on serial.",
        "misconceptionTested": "Open access for troubleshooting speed"
      },
      {
        "choiceIndex": 3,
        "explanation": "SSH applies to vty lines \u2014 console uses serial login/password or AAA, not SSH.",
        "misconceptionTested": "SSH on console port"
      }
    ],
    "examTip": "Console line \u2192 **`login`** + password or **AAA** \u2014 never leave open."
  },
  'obj-5.3-depth-q5':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "**Privilege level 15** grants **full exec access** \u2014 equivalent to enable mode / full administrator."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "Level 1 is user EXEC (limited show) \u2014 level 15 is full privileged access.",
        "misconceptionTested": "Level 15 as read-only"
      },
      {
        "choiceIndex": 2,
        "explanation": "Level 15 includes configuration mode access \u2014 it is the highest standard privilege.",
        "misconceptionTested": "Level 15 blocks config mode"
      },
      {
        "choiceIndex": 3,
        "explanation": "Wireless client association is unrelated to IOS privilege levels.",
        "misconceptionTested": "Privilege level for WLAN clients"
      }
    ],
    "examTip": "Privilege **15** = **enable/full admin**; level 1 = user EXEC."
  },
  'obj-5.3-depth-q6':   {
    "correct": {
      "choiceIndex": 1,
      "explanation": "`username bob **secret** bob123` stores an **encrypted** password in running config \u2014 preferred over `password`."
    },
    "incorrect": [
      {
        "choiceIndex": 0,
        "explanation": "`username bob password` may show reversible encoding \u2014 `secret` uses strong MD5/SHA encryption.",
        "misconceptionTested": "password keyword encrypts like secret"
      },
      {
        "choiceIndex": 2,
        "explanation": "`enable password` protects enable mode \u2014 local user passwords use `username ... secret`.",
        "misconceptionTested": "enable password for local users"
      },
      {
        "choiceIndex": 3,
        "explanation": "Line vty password alone does not create an encrypted local user account.",
        "misconceptionTested": "vty line password as local user secret"
      }
    ],
    "examTip": "Local user encrypted password \u2192 **`username name secret password`**."
  },
}
