#!/usr/bin/env python3
"""Gold batch 28 — 50 reviews: NTP 4.2, DHCP 4.3, SNMP 4.4, syslog 4.5, DHCP relay/v6 4.6, QoS 4.7, SSH 4.8, config restore 4.9. Run: python3 scripts/_genGoldBatch28.py"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HAND = {
  # === NTP 4.2 ===
  "obj-4.2-source-q005": {
    "correct": {"choiceIndex": 3, "explanation": "NTP uses **UDP port 123** for time synchronization — not TCP and not SNMP (161) or TFTP (69)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**UDP/161** is **SNMP** — NTP is **UDP/123**.", "misconceptionTested": "SNMP port for NTP"},
      {"choiceIndex": 1, "explanation": "NTP is **UDP-based**, not TCP — and port **123**, not 161.", "misconceptionTested": "TCP transport for NTP"},
      {"choiceIndex": 2, "explanation": "**UDP/69** is **TFTP** — NTP uses **UDP/123**.", "misconceptionTested": "TFTP port for NTP"},
    ],
    "examTip": "NTP = **UDP/123** | SNMP = UDP/161 (agent) / UDP/162 (traps) | memorize the UDP service ports.",
  },
  "obj-4.2-source-q006": {
    "correct": {"choiceIndex": 2, "explanation": "**`debug ntp packets`** shows NTP packet exchange — confirms whether the device receives replies from the server."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show ntp`** alone is incomplete — use **`show ntp status`** or **`debug ntp packets`** for reachability.", "misconceptionTested": "Truncated show ntp for server response"},
      {"choiceIndex": 1, "explanation": "**`show ip ntp`** is not valid IOS — use **`show ntp status`** or **`debug ntp packets`**.", "misconceptionTested": "Invented show ip ntp command"},
      {"choiceIndex": 3, "explanation": "**`debug ntp messages`** logs event messages — **`debug ntp packets`** inspects actual NTP request/reply traffic.", "misconceptionTested": "NTP messages debug for packet exchange"},
    ],
    "examTip": "NTP troubleshoot: **`show ntp associations`** → **`show ntp status`** → **`debug ntp packets`** (disable debug when done).",
  },
  "obj-4.2-source-q007": {
    "correct": {"choiceIndex": 0, "explanation": "Use a **DNS hostname** for the NTP server — if the server's IP changes, devices follow the name without reconfiguration."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Pointing every device at one **public** server is fragile — use **internal stratum sources** or enterprise NTP hierarchy.", "misconceptionTested": "All devices to one public NTP server"},
      {"choiceIndex": 2, "explanation": "Different NTP servers per device causes **clock drift inconsistency** — synchronize to a **common stratum source**.", "misconceptionTested": "Per-device different NTP servers for redundancy"},
      {"choiceIndex": 3, "explanation": "Only **one authoritative source** should be master — end devices should be **NTP clients**, not masters.", "misconceptionTested": "Every device as NTP master"},
    ],
    "examTip": "NTP best practice: **DNS name** for the server + **hierarchical stratum** (client → internal server → public stratum-1).",
  },
  "obj-4.2-source-q008": {
    "correct": {"choiceIndex": 2, "explanation": "**`show ntp status`** displays clock offset, stratum, and **time drift** relative to the reference."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show ntp`** is incomplete — drift/offset details are in **`show ntp status`**.", "misconceptionTested": "Truncated show ntp for drift"},
      {"choiceIndex": 1, "explanation": "**`show ip ntp status`** is not valid IOS — use **`show ntp status`**.", "misconceptionTested": "Invented show ip ntp status command"},
      {"choiceIndex": 3, "explanation": "**`debug ntp drift`** does not exist — use **`show ntp status`** for offset/drift.", "misconceptionTested": "Invented debug ntp drift command"},
    ],
    "examTip": "NTP drift/offset: **`show ntp status`** | Per-peer detail: **`show ntp associations detail**`.",
  },
  "obj-4.2-source-q009": {
    "correct": {"choiceIndex": 1, "explanation": "**`clock timezone pst -8 0`** sets Pacific Standard Time — offset **-8** hours, no DST offset (second value **0**)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Timezone requires **numeric offset** — **`clock timezone pst -8 0`**, not a name alone.", "misconceptionTested": "Timezone name without offset"},
      {"choiceIndex": 2, "explanation": "**`timezone`** is not a valid global config command — use **`clock timezone`**.", "misconceptionTested": "Invented timezone command"},
      {"choiceIndex": 3, "explanation": "**`timezone pst -8`** is wrong syntax — IOS uses **`clock timezone <name> <offset-hours> <offset-minutes>`**.", "misconceptionTested": "Timezone without clock keyword"},
    ],
    "examTip": "Timezone: **`clock timezone EST -5 0`** | PST = **-8 0** | PDT adds DST offset in second field.",
  },
  "obj-4.2-source-q010": {
    "correct": {"choiceIndex": 2, "explanation": "A **loopback interface** stays up even if physical interfaces fail — NTP source binding remains reachable."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Tunnel** interfaces depend on underlying transport — not the stable NTP source choice.", "misconceptionTested": "Tunnel interface for NTP source"},
      {"choiceIndex": 1, "explanation": "**NTP interface** is not a Cisco interface type — use **loopback**.", "misconceptionTested": "Invented NTP interface type"},
      {"choiceIndex": 3, "explanation": "**SVI** ties NTP to a VLAN — if that VLAN's L3 path fails, NTP source may drop.", "misconceptionTested": "SVI over loopback for NTP resilience"},
    ],
    "examTip": "Stable NTP source: **`ntp source loopback0`** — loopback is always up if the router is reachable.",
  },
  "obj-4.2-source-q011": {
    "correct": {"choiceIndex": 0, "explanation": "**`ntp source loopback 0`** binds outbound NTP packets to **Loopback0** — survives physical interface failures."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**`ntp loopback 0`** is not valid syntax — use **`ntp source loopback 0`**.", "misconceptionTested": "ntp loopback without source keyword"},
      {"choiceIndex": 2, "explanation": "**`ntp master`** makes this device a time server — **`ntp source`** only sets the source interface.", "misconceptionTested": "ntp master for source binding"},
      {"choiceIndex": 3, "explanation": "**`ntp clock`** is not a valid command — source interface uses **`ntp source`**.", "misconceptionTested": "Invented ntp clock command"},
    ],
    "examTip": "NTP source: **`ntp source Loopback0`** in global config — pairs with a configured loopback IP.",
  },
  "obj-4.2-source-q012": {
    "correct": {"choiceIndex": 1, "explanation": "**`clock set`** runs in **privileged EXEC** (`Router#`) — format: **`hours:minutes:seconds day month year`**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`clock set`** is not a **config-mode** command — execute it from **privileged EXEC** (`#`).", "misconceptionTested": "clock set in config mode"},
      {"choiceIndex": 2, "explanation": "Month/day order is **`day month`** — **`1 august 2019`**, not `august 1 2019`.", "misconceptionTested": "Wrong clock set date field order"},
      {"choiceIndex": 3, "explanation": "Missing **`set`** keyword — correct syntax is **`clock set <time> <day> <month> <year>`**.", "misconceptionTested": "clock without set keyword"},
    ],
    "examTip": "Manual time: **`Router# clock set HH:MM:SS DD MONTH YYYY`** — required before SSH key generation if NTP is down.",
  },
  # === DHCP 4.3 ===
  "obj-4.3-source-q011": {
    "correct": {"choiceIndex": 0, "explanation": "DHCP uses **UDP** — client to server on **67**, server to client on **68**."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**ICMP** is for diagnostics (ping) — DHCP discovery/offer uses **UDP**.", "misconceptionTested": "ICMP transport for DHCP"},
      {"choiceIndex": 2, "explanation": "DHCP is **connectionless UDP**, not TCP — no three-way handshake for lease exchange.", "misconceptionTested": "TCP transport for DHCP"},
      {"choiceIndex": 3, "explanation": "**RARP** is obsolete for IP assignment — modern networks use **DHCP over UDP**.", "misconceptionTested": "RARP as current DHCP transport"},
    ],
    "examTip": "DHCP = **UDP/67** (server) + **UDP/68** (client) | IPv6 DHCP uses UDP **546/547**.",
  },
  "obj-4.3-source-q012": {
    "correct": {"choiceIndex": 1, "explanation": "On duplicate IP detection, IOS **removes the address from the DHCP pool** — prevents serving a conflicting lease."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Serving a known duplicate would cause **IP conflicts** — IOS pulls the address from the pool.", "misconceptionTested": "Serve duplicate IP anyway"},
      {"choiceIndex": 2, "explanation": "The DHCP **service keeps running** — only the conflicting address is excluded.", "misconceptionTested": "DHCP server halts on duplicate"},
      {"choiceIndex": 3, "explanation": "The address is **removed immediately**, not deferred for future use.", "misconceptionTested": "Duplicate IP served later"},
    ],
    "examTip": "DHCP duplicate: **`ip dhcp conflict logging`** + address removed from pool — check with **`show ip dhcp conflict`**.",
  },
  # === SNMP 4.4 ===
  "obj-4.4-source-q006": {
    "correct": {"choiceIndex": 3, "explanation": "**Inform** messages require an **acknowledgment** from the NMS — **traps** are unacknowledged fire-and-forget."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "SNMPv2c traps are **not encrypted** — security comes from ACLs and community strings.", "misconceptionTested": "SNMP traps always encrypted"},
      {"choiceIndex": 1, "explanation": "**Informs** use acknowledgments — that's the key difference from traps.", "misconceptionTested": "Inform messages lack acknowledgments"},
      {"choiceIndex": 2, "explanation": "**Traps** do **not** require acknowledgment — only **informs** do.", "misconceptionTested": "Traps always acknowledged"},
    ],
    "examTip": "Trap = **no ACK** (UDP/162) | Inform = **ACK required** — more reliable but more overhead.",
  },
  "obj-4.4-source-q007": {
    "correct": {"choiceIndex": 2, "explanation": "SNMPv2c uses **community strings** (like v1) — no encryption or per-user auth (that's **SNMPv3**)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Encryption** is an **SNMPv3** feature — v2c sends community strings in cleartext.", "misconceptionTested": "SNMPv2c encryption"},
      {"choiceIndex": 1, "explanation": "**User authentication** (auth/priv) is **SNMPv3** — v2c uses **community strings**.", "misconceptionTested": "SNMPv2c user authentication"},
      {"choiceIndex": 3, "explanation": "**Message integrity** with hashing is **SNMPv3** — v2c relies on community strings + ACLs.", "misconceptionTested": "SNMPv2c message integrity"},
    ],
    "examTip": "SNMP versions: **v1/v2c** = community string | **v3** = user + auth + priv (encryption).",
  },
  "obj-4.4-source-q008": {
    "correct": {"choiceIndex": 1, "explanation": "Apply an **ACL** to restrict which hosts can query SNMP — limits who reaches the agent on **UDP/161**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "SNMPv2c communities are **not encrypted** — ACLs filter **source IPs**, not encrypt strings.", "misconceptionTested": "Encrypted SNMP communities"},
      {"choiceIndex": 2, "explanation": "**SNMP callback security** is not a standard Cisco hardening method — use **ACLs** and SNMPv3.", "misconceptionTested": "SNMP callback security"},
      {"choiceIndex": 3, "explanation": "**SHA-256** is used in **SNMPv3 auth** — v2c agent hardening uses **ACLs** on the community.", "misconceptionTested": "SHA-256 with SNMPv2c agent"},
    ],
    "examTip": "SNMP harden: **ACL** on community + **`snmp-server community`** with **RO/RW** + prefer **SNMPv3**.",
  },
  "obj-4.4-source-q009": {
    "correct": {"choiceIndex": 2, "explanation": "**`snmp-server host <ip> version 2c <community>`** plus **`snmp-server enable traps`** sends v2c traps on failure."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Missing **`host`** keyword — traps need **`snmp-server host <ip> version 2c <community>`**.", "misconceptionTested": "snmp-server without host keyword"},
      {"choiceIndex": 1, "explanation": "A **community string** is required on the host line — **`version 2c <community>`**.", "misconceptionTested": "SNMP host without community string"},
      {"choiceIndex": 3, "explanation": "**`snmp contact trap`** is not valid IOS — use **`snmp-server host`** + **`enable traps`**.", "misconceptionTested": "Invented snmp contact trap command"},
    ],
    "examTip": "SNMP traps: **`snmp-server enable traps`** + **`snmp-server host <NMS-ip> version 2c <string>`**.",
  },
  "obj-4.4-source-q010": {
    "correct": {"choiceIndex": 2, "explanation": "SNMP **traps/informs** are sent to the NMS on **UDP port 162** — agents listen on **UDP/161**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**UDP/161** is the **agent** (query) port — traps/informs use **UDP/162**.", "misconceptionTested": "Trap port 161"},
      {"choiceIndex": 1, "explanation": "SNMP traps use **UDP**, not TCP — port **162**.", "misconceptionTested": "TCP transport for SNMP traps"},
      {"choiceIndex": 3, "explanation": "**UDP/514** is **syslog** — SNMP traps/informs use **UDP/162**.", "misconceptionTested": "Syslog port for SNMP traps"},
    ],
    "examTip": "SNMP ports: **161** = agent (GET) | **162** = traps/informs to NMS.",
  },
  "obj-4.4-source-q011": {
    "correct": {"choiceIndex": 2, "explanation": "**`show snmp host`** lists configured trap/inform destinations — NMS IP, version, and community."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show snmp`** is a summary — trap destinations are in **`show snmp host`**.", "misconceptionTested": "show snmp for trap destinations"},
      {"choiceIndex": 1, "explanation": "**`show snmp community`** shows RO/RW strings — not trap **host** targets.", "misconceptionTested": "Community show for trap hosts"},
      {"choiceIndex": 3, "explanation": "**`show snmp notifications`** is not valid IOS — use **`show snmp host`**.", "misconceptionTested": "Invented show snmp notifications command"},
    ],
    "examTip": "SNMP verify: **`show snmp`** (general) | **`show snmp host`** (trap targets) | **`show snmp user`** (v3).",
  },
  "obj-4.4-source-q012": {
    "correct": {"choiceIndex": 1, "explanation": "SNMPv3 OID restriction starts with a **view** — defines which MIB subtrees the group may access."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "The **group** binds a view to security level — create the **view** first.", "misconceptionTested": "SNMPv3 group before view"},
      {"choiceIndex": 2, "explanation": "The **user** is created after **view** and **group** — view defines allowed OIDs.", "misconceptionTested": "SNMPv3 user before view"},
      {"choiceIndex": 3, "explanation": "**Community strings** are SNMPv1/v2c — v3 uses **view → group → user**.", "misconceptionTested": "SNMPv3 community configuration"},
    ],
    "examTip": "SNMPv3 order: **view** (OID filter) → **group** (links view + security) → **user** (credentials).",
  },
  # === Syslog 4.5 ===
  "obj-4.5-source-q005": {
    "correct": {"choiceIndex": 0, "explanation": "**`Router(config)#logging console <level>`** sets console severity in **global config** — this bank keys **`logging console 0`**; **`logging console 1`** is the alerts threshold on live IOS."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Console logging is set in **global config**, not **config-line** — and **`logging level`** is not the console command.", "misconceptionTested": "Console logging in config-line"},
      {"choiceIndex": 2, "explanation": "**`logging console 7`** shows all severities including **debugging** — far too verbose for alerts-only.", "misconceptionTested": "Debug level for alerts-only console"},
      {"choiceIndex": 3, "explanation": "**`logging level`** under **config-line** does not control console syslog — use **`logging console`** globally.", "misconceptionTested": "Line-level logging level for console"},
    ],
    "examTip": "Syslog levels: **0=emergencies, 1=alerts** … **7=debugging** | Console: **`logging console 1`** for alerts+.",
  },
  "obj-4.5-source-q006": {
    "correct": {"choiceIndex": 0, "explanation": "**`logging buffered 1`** stores emergencies (0) and alerts (1) in RAM — level **1** caps at alerts severity."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**`logging 1`** is incomplete — buffered logs need **`logging buffered 1`**.", "misconceptionTested": "logging without buffered keyword"},
      {"choiceIndex": 2, "explanation": "Level **2** includes **critical** and below — too broad if you only want emergencies + alerts.", "misconceptionTested": "Buffered level 2 for emergencies and alerts only"},
      {"choiceIndex": 3, "explanation": "**`logging 2`** is not the buffered-RAM command — use **`logging buffered <level>`**.", "misconceptionTested": "logging 2 without buffered"},
    ],
    "examTip": "Buffered logs: **`logging buffered 6`** (common) | **`show logging`** to read RAM buffer.",
  },
  "obj-4.5-source-q007": {
    "correct": {"choiceIndex": 2, "explanation": "**`show history`** displays previously entered EXEC commands for the current session."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show commands`** is not valid IOS — command history is **`show history`**.", "misconceptionTested": "Invented show commands command"},
      {"choiceIndex": 1, "explanation": "**`show log`** displays **syslog messages**, not CLI command history.", "misconceptionTested": "Syslog log for CLI history"},
      {"choiceIndex": 3, "explanation": "**`show buffer`** is not the CLI history command — use **`show history`**.", "misconceptionTested": "show buffer for command history"},
    ],
    "examTip": "CLI history: **`show history`** | Larger history: **`terminal history size <n>`** under line config.",
  },
  "obj-4.5-source-q008": {
    "correct": {"choiceIndex": 1, "explanation": "**`logging trap informational`** (level 6) sends traps for severities **0–5** to the NMS — the least severe trapped is **notifications (5)**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Informational (6)** is the configured **ceiling** — traps sent are **more severe** (lower numbers), down to notifications (5).", "misconceptionTested": "Trap level equals highest severity sent"},
      {"choiceIndex": 2, "explanation": "**Warnings (4)** and below are trapped, but the **highest (least severe) trapped level** is **notifications (5)**.", "misconceptionTested": "Warnings as trap ceiling"},
      {"choiceIndex": 3, "explanation": "**Debugging (7)** is **more verbose** than informational — it would not be the trapped level here.", "misconceptionTested": "Debugging as trap result for informational config"},
    ],
    "examTip": "**`logging trap <level>`** sends traps for that level and **all more-severe** (lower numbers) — read the ceiling carefully.",
  },
  "obj-4.5-source-q009": {
    "correct": {"choiceIndex": 2, "explanation": "**`show processes cpu`** (or **`show processes cpu history`**) reports current and historical **CPU utilization**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`show cpu`** is not standard IOS — CPU stats are under **`show processes`**.", "misconceptionTested": "Invented show cpu command"},
      {"choiceIndex": 1, "explanation": "**`show cpu-stats`** is not valid — use **`show processes cpu`**.", "misconceptionTested": "Invented show cpu-stats command"},
      {"choiceIndex": 3, "explanation": "**`show environment`** reports hardware sensors — CPU load is **`show processes cpu`**.", "misconceptionTested": "Environment show for CPU utilization"},
    ],
    "examTip": "CPU check: **`show processes cpu`** | 5-sec / 1-min / 5-min averages | **`show memory`** for RAM.",
  },
  "obj-4.5-source-q010": {
    "correct": {"choiceIndex": 0, "explanation": "**`logging buffered`** stores syslog messages in the **router's RAM** (internal log buffer)."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**`logging internal`** is not valid IOS — RAM logging uses **`logging buffered`**.", "misconceptionTested": "Invented logging internal command"},
      {"choiceIndex": 2, "explanation": "**`logging ram`** is not the Cisco command — use **`logging buffered`**.", "misconceptionTested": "logging ram keyword"},
      {"choiceIndex": 3, "explanation": "**`logging console`** sends to the **terminal session** — **`logging buffered`** stores in RAM.", "misconceptionTested": "Console logging for RAM buffer"},
    ],
    "examTip": "Log destinations: **console** (terminal) | **buffered** (RAM) | **host** (remote syslog server).",
  },
  "obj-4.5-source-q011": {
    "correct": {"choiceIndex": 1, "explanation": "By default, Cisco devices send syslog to the **console** — other destinations require explicit config."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Remote syslog requires **`logging host`** — it is **not** the default destination.", "misconceptionTested": "Syslog server as default destination"},
      {"choiceIndex": 2, "explanation": "**TTY** lines are not the default syslog sink — **console** is.", "misconceptionTested": "TTY as default syslog destination"},
      {"choiceIndex": 3, "explanation": "**NVRAM** stores config, not live syslog — default logging goes to **console**.", "misconceptionTested": "NVRAM as default syslog destination"},
    ],
    "examTip": "Default syslog → **console** | Add **`logging buffered`** and **`logging host <ip>`** for RAM and remote.",
  },
  "obj-4.5-source-q012": {
    "correct": {"choiceIndex": 3, "explanation": "Default console logging severity is **debugging (7)** — all message levels appear until you lower the threshold."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Notification (5)** is not the default — factory default allows through **debugging (7)**.", "misconceptionTested": "Notification as default syslog level"},
      {"choiceIndex": 1, "explanation": "**Informational (6)** is not the default console threshold — default is **debugging (7)**.", "misconceptionTested": "Informational as default syslog level"},
      {"choiceIndex": 2, "explanation": "**Warning (4)** is more restrictive than the default — IOS defaults to **debugging (7)**.", "misconceptionTested": "Warning as default syslog level"},
    ],
    "examTip": "Default **`logging console`** = level **7 (debugging)** — tighten with **`logging console 6`** or lower in production.",
  },
  # === DHCP relay / v6 4.6 ===
  "obj-4.6-source-q004": {
    "correct": {"choiceIndex": 1, "explanation": "**GIADDR (Gateway IP Address)** in the DHCP request tells the server which **subnet/scope** the client is on via the relay agent."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**CIADDR** is the client's **current IP** (renew/rebind) — empty in initial DISCOVER.", "misconceptionTested": "CIADDR for scope selection"},
      {"choiceIndex": 2, "explanation": "**SIADDR** is the **next-server** IP (e.g. boot file server) — not the relay subnet hint.", "misconceptionTested": "SIADDR for DHCP scope"},
      {"choiceIndex": 3, "explanation": "**CHADDR** is the client's **hardware (MAC) address** — not the subnet identifier.", "misconceptionTested": "CHADDR for scope selection"},
    ],
    "examTip": "DHCP fields: **CHADDR**=MAC | **GIADDR**=relay interface IP (scope hint) | **CIADDR**=client IP on renew.",
  },
  "obj-4.6-source-q005": {
    "correct": {"choiceIndex": 3, "explanation": "Configure **`ip helper-address <dhcp-server>`** on **Router A Gi0/0** — the router facing the client subnet relays broadcasts to the remote server."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "A **second local DHCP server** is unnecessary — **ip helper-address** forwards to the existing server.", "misconceptionTested": "Second DHCP server instead of relay"},
      {"choiceIndex": 1, "explanation": "The relay goes on **Router A** (client-facing router), not an unrelated Router B.", "misconceptionTested": "Relay on wrong router"},
      {"choiceIndex": 2, "explanation": "DHCP relay is a **router L3** function — switches don't run **`ip helper-address`**.", "misconceptionTested": "DHCP relay on switch"},
    ],
    "examTip": "DHCP relay: **`ip helper-address <ip>`** on the **client-facing router interface** — forwards UDP/67 broadcasts.",
  },
  "obj-4.6-source-q006": {
    "correct": {"choiceIndex": 2, "explanation": "**`debug ip dhcp server packet`** shows DHCP server packet flow — use on the server or relay for relay-agent diagnosis."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`debug dhcp`** is too broad/nonstandard — IOS uses **`debug ip dhcp`** variants.", "misconceptionTested": "Generic debug dhcp command"},
      {"choiceIndex": 1, "explanation": "**`show ip dhcp detail`** is not the standard debug — use **`debug ip dhcp server packet`**.", "misconceptionTested": "Show command for DHCP relay debug"},
      {"choiceIndex": 3, "explanation": "**`debug ip dhcp`** alone is less specific — **`debug ip dhcp server packet`** targets relay/server packets.", "misconceptionTested": "Generic debug ip dhcp for relay packets"},
    ],
    "examTip": "DHCP debug: **`debug ip dhcp server events`** | **`debug ip dhcp server packet`** — always **`undebug all`** after.",
  },
  "obj-4.6-source-q007": {
    "correct": {"choiceIndex": 2, "explanation": "With **SLAAC**, hosts self-assign addresses — **DHCPv6** delivers **options** (DNS, domain name) without assigning the address."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**Stateful** DHCPv6 assigns addresses — SLAAC networks use DHCPv6 for **stateless options**.", "misconceptionTested": "Stateful DHCPv6 with SLAAC"},
      {"choiceIndex": 1, "explanation": "SLAAC derives the address from the **prefix + EUI-64** — DHCPv6 options don't supply the network ID for addressing.", "misconceptionTested": "DHCPv6 supplies network ID in SLAAC"},
      {"choiceIndex": 3, "explanation": "**Stateless** DHCPv6 in SLAAC means **no address lease** — only **options** are provided.", "misconceptionTested": "Stateless addressing via DHCPv6 in SLAAC"},
    ],
    "examTip": "SLAAC + DHCPv6 = **stateless** (options only) | **Stateful** DHCPv6 assigns full addresses.",
  },
  "obj-4.6-source-q008": {
    "correct": {"choiceIndex": 3, "explanation": "Clients **keep the leased IP until the full lease expires** — even if the server is down, until T1/T2 timers fail."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Addresses are **not revoked immediately** when the server fails — the lease timer still runs.", "misconceptionTested": "Immediate IP loss on server down"},
      {"choiceIndex": 1, "explanation": "Half-lease (**T1**) triggers **renewal**, not immediate loss — client keeps using the IP.", "misconceptionTested": "IP lost at half lease on server down"},
      {"choiceIndex": 2, "explanation": "Seven-eighths (**T2**) starts **rebind**, not relinquish — loss happens at **full lease expiry**.", "misconceptionTested": "IP lost at seven-eighths lease"},
    ],
    "examTip": "DHCP lease timers: **T1 = 50%** renew | **T2 = 87.5%** rebind | **100%** = lease expires.",
  },
  "obj-4.6-source-q009": {
    "correct": {"choiceIndex": 0, "explanation": "**Stateful DHCPv6** assigns both **network prefix and host interface ID** — full address management like DHCPv4."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "Default router info typically comes from **RA (SLAAC)** — stateful DHCPv6 focuses on **address assignment**.", "misconceptionTested": "Stateful DHCPv6 supplies default router"},
      {"choiceIndex": 2, "explanation": "DHCPv6 uses **multicast** (FF02::1:2), not IPv4-style **broadcasts**.", "misconceptionTested": "DHCPv6 uses broadcasts"},
      {"choiceIndex": 3, "explanation": "SLAAC uses **RA** for addresses — **stateful DHCPv6 replaces** SLAAC addressing, not works alongside it for the same host.", "misconceptionTested": "Stateful DHCPv6 works with SLAAC addressing"},
    ],
    "examTip": "Stateful DHCPv6: **`ipv6 dhcp pool`** + **`address dhcp`** on client — full address lease like DHCPv4.",
  },
  "obj-4.6-source-q010": {
    "correct": {"choiceIndex": 2, "explanation": "On the interface: **`ipv6 address dhcp`** — obtains a **stateful DHCPv6** address from the server."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`ipv6 address dhcp`** is an **interface** command, not global config with **`gi 0/0`**.", "misconceptionTested": "Global config ipv6 address dhcp"},
      {"choiceIndex": 1, "explanation": "Correct keyword is **`dhcp`**, not **`dhcpv6`** — enter under **`config-if`**.", "misconceptionTested": "dhcpv6 keyword on interface"},
      {"choiceIndex": 3, "explanation": "**`ipv6 address stateless`** is not the stateful command — use **`ipv6 address dhcp`**.", "misconceptionTested": "stateless keyword for stateful DHCPv6"},
    ],
    "examTip": "IPv6 addressing modes: **`autoconfig`** (SLAAC) | **`dhcp`** (stateful) | **`dhcp rapid-commit`** (faster stateful).",
  },
  "obj-4.6-source-q011": {
    "correct": {"choiceIndex": 2, "explanation": "Deleting a lease lets the server **offer that IP to another client** — the original holder may still use it until lease expiry → **duplicate IP risk**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "The server does **not** force the old client to release immediately — the client may still use the address.", "misconceptionTested": "Server forces immediate client release"},
      {"choiceIndex": 1, "explanation": "The original client does **not** auto-renew a deleted lease — it keeps using the IP until T1/T2/expiry.", "misconceptionTested": "Client immediately renews deleted lease"},
      {"choiceIndex": 3, "explanation": "The original client does **not** politely relinquish when another gets the same IP — **conflict** results.", "misconceptionTested": "Graceful relinquish on re-offer"},
    ],
    "examTip": "Never delete active leases casually — wait for **natural expiry** or confirm the client released the address.",
  },
  "obj-4.6-source-q012": {
    "correct": {"choiceIndex": 0, "explanation": "At **7/8 (87.5%)** of the lease, the client enters **REBIND** — broadcasts to any available DHCP server."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "At 7/8 the client **actively rebinds** — it does not passively retain without trying other servers.", "misconceptionTested": "No action at seven-eighths lease"},
      {"choiceIndex": 2, "explanation": "**Renewal (T1)** happens at **50%** of lease — 7/8 is **rebind**, not renew.", "misconceptionTested": "Renew at seven-eighths lease"},
      {"choiceIndex": 3, "explanation": "The client **rebinds** at 7/8 — it only **relinquishes** if the lease fully expires without success.", "misconceptionTested": "Relinquish IP at seven-eighths lease"},
    ],
    "examTip": "Lease timeline: **50% = RENEW** (to original server) | **87.5% = REBIND** (any server) | **100% = expire**.",
  },
  # === QoS 4.7 ===
  "obj-4.7-source-q008": {
    "correct": {"choiceIndex": 1, "explanation": "**Policing** drops excess traffic at the rate limit — prevents one class from **monopolizing** queue capacity (starvation)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**LLQ** provides strict priority queuing — it helps voice but doesn't **police** excess to prevent starvation alone.", "misconceptionTested": "LLQ as queue starvation prevention via policing"},
      {"choiceIndex": 2, "explanation": "**CBWFQ** fair-queues by class — **policing** enforces hard rate caps that prevent hogging.", "misconceptionTested": "CBWFQ as policing for starvation"},
      {"choiceIndex": 3, "explanation": "**FIFO** has no fairness mechanism — it worsens starvation risk, not combats it.", "misconceptionTested": "FIFO prevents queue starvation"},
    ],
    "examTip": "Queue starvation fix: **policing/shaping** rate limits + **LLQ** for latency-sensitive traffic.",
  },
  "obj-4.7-source-q009": {
    "correct": {"choiceIndex": 0, "explanation": "**Shaping** buffers excess packets **above the CIR** — introduces **delay** to smooth output to the contracted rate."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**Dropping** excess traffic is **policing** — shaping **queues** packets instead.", "misconceptionTested": "Shaping drops excess packets"},
      {"choiceIndex": 2, "explanation": "Shaping causes **consistent delay**, not **jitter** (delay variation) — jitter is variable arrival timing.", "misconceptionTested": "Shaping causes jitter"},
      {"choiceIndex": 3, "explanation": "Shaping **delays** packets in a queue — it does not actively **slow** individual packets mid-flight.", "misconceptionTested": "Shaping slows packets in queue"},
    ],
    "examTip": "Shaping = **buffer + delay** to meet rate | Policing = **drop** excess immediately.",
  },
  "obj-4.7-source-q010": {
    "correct": {"choiceIndex": 2, "explanation": "**CBWFQ (Class-Based Weighted Fair Queuing)** uses a **round-robin** scheduler across configured traffic classes."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**LLQ** adds a **strict priority** queue — not round-robin across all classes.", "misconceptionTested": "LLQ as round-robin scheduler"},
      {"choiceIndex": 1, "explanation": "**FIFO** is first-in-first-out — no weighted **round-robin** between classes.", "misconceptionTested": "FIFO as round-robin queuing"},
      {"choiceIndex": 3, "explanation": "**PQ (Priority Queuing)** serves high queues first — can starve lower queues, not round-robin.", "misconceptionTested": "Priority queuing as round-robin"},
    ],
    "examTip": "Queuing: **FIFO** (single queue) | **CBWFQ** (weighted round-robin) | **LLQ** (CBWFQ + strict priority).",
  },
  "obj-4.7-source-q011": {
    "correct": {"choiceIndex": 1, "explanation": "**Policing** **drops** packets exceeding the configured rate — enforces a hard traffic ceiling with **loss**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Holding packets to cause delay is **shaping** — policing **drops** instead of buffering.", "misconceptionTested": "Policing buffers for delay"},
      {"choiceIndex": 2, "explanation": "Policing causes **loss**, not **jitter** — dropped packets don't arrive late, they don't arrive.", "misconceptionTested": "Policing causes jitter"},
      {"choiceIndex": 3, "explanation": "Slowing packets in-queue is **shaping** — policing **discards** over-limit traffic.", "misconceptionTested": "Policing slows packets like shaping"},
    ],
    "examTip": "Policing = **drop** at token bucket limit | Shaping = **queue/delay** to average the rate.",
  },
  "obj-4.7-source-q012": {
    "correct": {"choiceIndex": 1, "explanation": "Policing enforces a **Committed Information Rate (CIR)** — traffic above CIR is dropped or remarked."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "LAN policing is possible but the primary exam use is enforcing **WAN provider CIR** contracts.", "misconceptionTested": "Policing only for LAN apps"},
      {"choiceIndex": 2, "explanation": "Policing limits **sustained rate (CIR)**, not specifically \"WAN apps\" — it's rate enforcement anywhere.", "misconceptionTested": "Policing only for WAN apps"},
      {"choiceIndex": 3, "explanation": "**Burst** is handled by **BC/BE** token buckets — policing maintains **CIR**, not burst rate alone.", "misconceptionTested": "Policing for burst rate only"},
    ],
    "examTip": "Policing terms: **CIR** = sustained rate | **BC** = normal burst | **BE** = excess burst.",
  },
  "obj-4.7-source-q013": {
    "correct": {"choiceIndex": 3, "explanation": "**WRED** randomly drops TCP packets when queue depth exceeds the **minimum threshold** — signals congestion before tail drop."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Drops occur when the queue is **filling** (above min threshold), not when **full**.", "misconceptionTested": "WRED drops only when queue full"},
      {"choiceIndex": 1, "explanation": "An **empty** queue needs no congestion avoidance — WRED acts as depth **rises**.", "misconceptionTested": "WRED drops on empty queue"},
      {"choiceIndex": 2, "explanation": "Below the **minimum threshold**, **no drops** occur — drops start **above** min threshold.", "misconceptionTested": "WRED drops below minimum threshold"},
    ],
    "examTip": "WRED thresholds: **below min** = no drop | **min–max** = increasing drop probability | **max** = tail drop.",
  },
  "obj-4.7-source-q014": {
    "correct": {"choiceIndex": 1, "explanation": "In Assured Forwarding, a **higher class number** (AF4x vs AF3x) gets **better drop precedence** — AF41 outranks AF31."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "AF3x is **lower** priority than AF4x — the first digit (class) determines queue preference.", "misconceptionTested": "AF31 better queue than AF41"},
      {"choiceIndex": 2, "explanation": "AF3x and AF4x are **different classes** — AF4x receives preferential treatment.", "misconceptionTested": "AF31 and AF41 equal priority"},
      {"choiceIndex": 3, "explanation": "Under congestion, **lower-class (AF3x) traffic is dropped first** — AF4x is protected more.", "misconceptionTested": "AF41 dropped before AF31"},
    ],
    "examTip": "AF format: **AFxy** — **x** = class (higher = better queue) | **y** = drop precedence (lower = less likely drop).",
  },
  # === SSH 4.8 ===
  "obj-4.8-source-q001": {
    "correct": {"choiceIndex": 1, "explanation": "SSH RSA key generation requires **`ip domain-name`** (with hostname set) — the FQDN labels the key pair."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Accurate **clock/NTP** helps certificate validation but **hostname + domain-name** are required before **`crypto key generate rsa`**.", "misconceptionTested": "Time/date as only SSH key prerequisite"},
      {"choiceIndex": 2, "explanation": "Key **modulus size** is specified during generation — not a separate prerequisite step.", "misconceptionTested": "Key strength as separate prerequisite"},
      {"choiceIndex": 3, "explanation": "No **key repository** config exists — set **hostname** and **`ip domain-name`** first.", "misconceptionTested": "Key repository prerequisite"},
    ],
    "examTip": "SSH key prep: **`hostname R1`** → **`ip domain-name lab.local`** → **`crypto key generate rsa`**.",
  },
  "obj-4.8-source-q002": {
    "correct": {"choiceIndex": 0, "explanation": "**`ip ssh version 2`** in global config forces **SSHv2** — more secure than SSHv1."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "SSH version is **global config**, not **config-line** — use **`ip ssh version 2`**.", "misconceptionTested": "SSH version under line config"},
      {"choiceIndex": 2, "explanation": "**`config-ssh`** is not a valid config mode — **`ip ssh version 2`** is global.", "misconceptionTested": "config-ssh mode for SSH version"},
      {"choiceIndex": 3, "explanation": "Correct syntax is **`ip ssh version 2`**, not **`ssh version 2`**.", "misconceptionTested": "ssh version without ip prefix"},
    ],
    "examTip": "SSH harden: **`ip ssh version 2`** + **`transport input ssh`** on vty lines + disable Telnet.",
  },
  "obj-4.8-source-q004": {
    "correct": {"choiceIndex": 3, "explanation": "Replace Telnet with SSH because SSH **encrypts** the entire management session — credentials and commands are protected."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Telnet has **no encryption** (not weak encryption) — all traffic is **cleartext**.", "misconceptionTested": "Telnet has weak encryption"},
      {"choiceIndex": 1, "explanation": "File copy uses **SCP/FTP/TFTP** — not the primary reason to replace Telnet with SSH.", "misconceptionTested": "SSH for file copy over Telnet replacement"},
      {"choiceIndex": 2, "explanation": "ACLs control **who connects** — SSH adds **encryption** regardless of ACL rules.", "misconceptionTested": "SSH eases ACL creation as main benefit"},
    ],
    "examTip": "Telnet = **cleartext TCP/23** | SSH = **encrypted TCP/22** — always prefer SSH on vty lines.",
  },
  "obj-4.8-source-q005": {
    "correct": {"choiceIndex": 1, "explanation": "SSHv2 requires RSA keys of at least **768 bits** (1024+ recommended) — shorter keys block v2 enablement."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Clock/NTP affects logs and certs — it does **not** block **`ip ssh version 2`** like key size does.", "misconceptionTested": "Time sync blocks SSHv2"},
      {"choiceIndex": 2, "explanation": "DNS is **not required** for SSHv2 — insufficient **RSA modulus** prevents v2.", "misconceptionTested": "DNS required for SSHv2"},
      {"choiceIndex": 3, "explanation": "No **DNS host record** is needed on the device — **key modulus ≥ 768** is the v2 requirement.", "misconceptionTested": "DNS host record for SSHv2"},
    ],
    "examTip": "SSHv2 key: **`crypto key generate rsa modulus 1024`** (or 2048) — v2 fails with tiny keys.",
  },
  "obj-4.8-source-q006": {
    "correct": {"choiceIndex": 0, "explanation": "**`username <name> password <secret>`** creates a **local user database** entry for login authentication."},
    "incorrect": [
      {"choiceIndex": 1, "explanation": "**`account`** is not valid IOS — local users use **`username`** in global config.", "misconceptionTested": "account submode for local user"},
      {"choiceIndex": 2, "explanation": "**`user`** alone is incomplete — correct syntax is **`username <name> password <pwd>`**.", "misconceptionTested": "user without username keyword"},
      {"choiceIndex": 3, "explanation": "**`user-account`** is not valid Cisco syntax — use **`username`**.", "misconceptionTested": "user-account command"},
    ],
    "examTip": "Local auth: **`username bob secret <pwd>`** (preferred over plaintext **`password`**) + **`login local`** on vty.",
  },
  "obj-4.8-source-q007": {
    "correct": {"choiceIndex": 1, "explanation": "**`crypto key generate rsa`** in global config creates the **RSA key pair** used by SSH."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "Keyword order is **`crypto key generate rsa`**, not **`generate crypto key rsa`**.", "misconceptionTested": "Wrong crypto key command word order"},
      {"choiceIndex": 2, "explanation": "**`crypto generate key rsa`** reverses the middle keywords — use **`crypto key generate rsa`**.", "misconceptionTested": "crypto generate key word order"},
      {"choiceIndex": 3, "explanation": "Key generation is **global config** (`Router(config)#`), not privileged EXEC alone.", "misconceptionTested": "RSA key generation in exec mode"},
    ],
    "examTip": "SSH keys: **`crypto key generate rsa`** → confirm with **`show ip ssh`**.",
  },
  "obj-4.8-source-q008": {
    "correct": {"choiceIndex": 3, "explanation": "**`login local`** under **line vty** tells SSH/Telnet to authenticate against the **local username database**."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`aaa new-model`** enables AAA framework — local-only auth uses **`login local`** on the line.", "misconceptionTested": "aaa new-model for simple local login"},
      {"choiceIndex": 1, "explanation": "**`local authentication`** is not a global command — use **`login local`** under **line vty**.", "misconceptionTested": "local authentication global command"},
      {"choiceIndex": 2, "explanation": "**`local authentication`** is not valid under **config-line** — the command is **`login local`**.", "misconceptionTested": "local authentication on line"},
    ],
    "examTip": "VTY auth chain: create **`username`** → **`line vty 0 4`** → **`login local`** → **`transport input ssh`**.",
  },
  "obj-4.8-source-q009": {
    "correct": {"choiceIndex": 1, "explanation": "The **login banner** (`banner login`) displays **first** when a user connects — before authentication prompts."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**MOTD** banner shows at more connection types but **login banner** precedes it for SSH login sequence per Cisco order.", "misconceptionTested": "MOTD always first on SSH"},
      {"choiceIndex": 2, "explanation": "**Exec banner** displays after successful login — not on initial connection.", "misconceptionTested": "Exec banner on connect"},
      {"choiceIndex": 3, "explanation": "**Incoming banner** is for reverse-Telnet lines — standard SSH uses **login** banner first.", "misconceptionTested": "Incoming banner for SSH"},
    ],
    "examTip": "Banner order on connect: **login** → credentials → **MOTD** (if set) → **exec** (after auth).",
  },
  # === Config restore 4.9 ===
  "obj-4.9-source-q001": {
    "correct": {"choiceIndex": 2, "explanation": "**`copy tftp: running-config`** restores a saved config from TFTP directly into **running-config** (merge/replace per IOS prompt)."},
    "incorrect": [
      {"choiceIndex": 0, "explanation": "**`archive tftp:`** manages configuration archives — standard restore uses **`copy tftp: running-config`**.", "misconceptionTested": "archive tftp for config restore"},
      {"choiceIndex": 1, "explanation": "**`restore tftp://...`** is not valid IOS — use interactive **`copy tftp: running-config`**.", "misconceptionTested": "restore tftp URL command"},
      {"choiceIndex": 3, "explanation": "**`copy server:`** is not the TFTP syntax — source is **`tftp:`** (or **`ftp:`**, **`scp:`**).", "misconceptionTested": "copy server keyword for TFTP"},
    ],
    "examTip": "Config restore: **`copy tftp: running-config`** (immediate) | **`copy tftp: startup-config`** (+ reload for boot).",
  },
}

assert len(HAND) == 50, f"Expected 50, got {len(HAND)}"

def fmt_entry(id_, rev):
    body = json.dumps(rev, indent=2)
    indented = "\n".join("  " + line if line else line for line in body.splitlines())
    return f"  '{id_}': {indented},"

lines = [
    "/** Gold reviews — Batch 28: NTP 4.2, DHCP 4.3, SNMP 4.4, syslog 4.5, DHCP relay/v6 4.6, QoS 4.7, SSH 4.8, config restore 4.9 (50 entries). */",
    "export const BATCH28_GOLD = {",
]
for id_, rev in HAND.items():
    lines.append(fmt_entry(id_, rev))
lines.append("}")
lines.append("")

out = ROOT / "src/answerReview/goldAnswerReviewsBatch28.js"
out.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {len(HAND)} entries to {out.relative_to(ROOT)}")
