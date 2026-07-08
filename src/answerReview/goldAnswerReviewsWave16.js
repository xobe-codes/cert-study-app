/** Gold review wave 16 — skill/design stems with full structured debrief (whatItDoes + whyWrongHere). */
export const WAVE16_SKILL_DESIGN_GOLD = {
  '1.7-design-rfc1918': {
    correct: {
      choiceIndex: 0,
      explanation: '**10.50.1.100** sits in **10.0.0.0/8** — an **RFC 1918** private block reusable inside a corporate LAN without global Internet uniqueness.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '**8.8.8.8** is a **public, globally routable** address — not private LAN space.',
        whatItDoes: '**8.8.8.8** is Google Public DNS — a globally unique, Internet-routable IPv4 address.',
        whyWrongHere: 'The stem asks for an address usable **inside a corporate LAN without global uniqueness** — public DNS space fails that requirement.',
        misconceptionTested: 'Public DNS as LAN private',
      },
      {
        choiceIndex: 2,
        explanation: '**203.0.113.x** is **TEST-NET/documentation** space — not intentional corporate private addressing.',
        whatItDoes: '**203.0.113.0/24** is reserved documentation address space (RFC 5737) — publicly defined, not RFC 1918 private.',
        whyWrongHere: 'Corporate LAN private design uses **10/8, 172.16/12, or 192.168/16** — not documentation blocks.',
        misconceptionTested: 'TEST-NET as internal LAN',
      },
      {
        choiceIndex: 3,
        explanation: '**169.254.x.x** is **APIPA link-local** — self-assigned when DHCP fails, not designed corporate addressing.',
        whatItDoes: '**169.254.0.0/16** is link-local/APIPA — hosts self-assign when no DHCP server responds.',
        whyWrongHere: 'The stem asks for intentional corporate LAN addressing — APIPA is an automatic fallback, not a planned private scheme.',
        misconceptionTested: 'APIPA for designed LAN',
      },
    ],
    examTip: 'Corporate LAN private space → **10/8, 172.16/12, 192.168/16** (RFC 1918).',
  },
  '1.12-design-virt': {
    correct: {
      choiceIndex: 0,
      explanation: '**NFV** runs firewalls, routers, and other functions as **software on commodity servers** instead of dedicated appliances.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'NFV still needs **physical fabric and cabling** — it virtualizes the *function*, not the wires.',
        whatItDoes: 'Physical cabling and switching fabric still interconnect hosts, servers, and uplinks in every network design.',
        whyWrongHere: '**NFV** replaces dedicated appliances with **software instances** — it does not remove the need for physical connectivity.',
        misconceptionTested: 'NFV eliminates cabling',
      },
      {
        choiceIndex: 2,
        explanation: 'NFV does not collapse **L3 into L2** — routing/services still exist, just as VMs/containers.',
        whatItDoes: 'Layer 3 routing and Layer 2 switching remain distinct functions — virtualization hosts them as software, not as a protocol merge.',
        whyWrongHere: 'The stem asks for the **primary NFV operator benefit** — software on commodity hardware, not eliminating routing.',
        misconceptionTested: 'NFV replaces routing with switching',
      },
      {
        choiceIndex: 3,
        explanation: 'IP addressing remains mandatory — NFV does not remove **Layer 3 identity**.',
        whatItDoes: '**IP addressing** identifies endpoints and enables routing between virtual and physical networks.',
        whyWrongHere: 'Virtualized network functions still participate in **IP networks** — NFV changes deployment model, not the need for addresses.',
        misconceptionTested: 'NFV removes IP',
      },
    ],
    examTip: 'NFV = **network functions as software** on COTS servers (not appliance hardware lock-in).',
  },
  '2.4-sk-lacp-modes': {
    correct: {
      choiceIndex: 0,
      explanation: '**`on`** forces a static channel with **no LACP negotiation** — **`active`** expects LACP PDUs, so the modes mismatch and **no bundle forms**.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '**`active`** cannot negotiate with **`on`** — the peer sends no LACP PDUs.',
        whatItDoes: '**LACP `active`** initiates and responds to LACP protocol data units to form a negotiated EtherChannel.',
        whyWrongHere: '**`on`** uses no protocol — `active` always fails against a statically forced `on` port.',
        misconceptionTested: 'Believing active negotiates with static on mode',
      },
      {
        choiceIndex: 2,
        explanation: '**LACP does not fall back** to static bundling when the peer uses **`on`**.',
        whatItDoes: 'LACP modes (`active`/`passive`) require LACP PDUs on both sides to agree on member ports.',
        whyWrongHere: 'Protocol mismatch means **no EtherChannel** until both sides use the same method — `on`+`active` never auto-converts.',
        misconceptionTested: 'Expecting LACP fallback to static on',
      },
      {
        choiceIndex: 3,
        explanation: '**`active`/`passive`** is a valid LACP pair — the failure is **`active` paired with `on`**, not passive vs active.',
        whatItDoes: '**`active`/`passive`** is the standard LACP negotiation pairing — one side initiates, the other responds.',
        whyWrongHere: 'Both sides do not need to be `active` — the stem pairs **`active` with `on`**, which is the actual incompatibility.',
        misconceptionTested: 'Requiring both active when passive would work',
      },
    ],
    examTip: '**`on` + `active` = no bundle**. Match negotiation: both **`on`** or both **LACP** (`active`/`passive`).',
  },
  '2.6-design-wlc': {
    correct: {
      choiceIndex: 0,
      explanation: '**FlexConnect** keeps **local switching** at the branch while a central **WLC** still manages SSIDs/policy — WAN dropouts do not blackhole all client traffic.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '**Mesh backhaul** is a different AP mode family — **FlexConnect** assumes a local LAN for client switching.',
        whatItDoes: '**Mesh mode** uses wireless backhaul when no Ethernet uplink exists — APs relay traffic over RF links.',
        whyWrongHere: 'The stem describes **branch office with local switching + central WLC** — that is **FlexConnect**, not mesh-only.',
        misconceptionTested: 'FlexConnect = mesh-only',
      },
      {
        choiceIndex: 2,
        explanation: '**Sniffer/monitor** modes survey RF — they do not provide FlexConnect local switching for clients.',
        whatItDoes: '**Monitor/sniffer** modes passively scan channels for rogues and spectrum analysis — no client SSID service.',
        whyWrongHere: 'FlexConnect serves **client WLANs with local data switching** — monitor mode cannot associate clients.',
        misconceptionTested: 'FlexConnect confused with sniffer',
      },
      {
        choiceIndex: 3,
        explanation: '**OOB management** without SSIDs is not FlexConnect — FlexConnect exists to serve **client WLANs** locally.',
        whatItDoes: 'Out-of-band management provides device administration paths separate from user data traffic.',
        whyWrongHere: 'The stem asks which scenario **FlexConnect** fits — branches needing **local client switching** under central WLC policy.',
        misconceptionTested: 'FlexConnect as management-only',
      },
    ],
    examTip: 'Branch + central WLC + local data path → **FlexConnect**.',
  },
  '2.6-sk-autonomous-vs-lightweight': {
    correct: {
      choiceIndex: 0,
      explanation: '**Autonomous APs** run a full IOS image with **local config**; **lightweight APs** offload control to a **WLC via CAPWAP** for centralized management at scale.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Both AP types support **2.4 GHz and 5 GHz** — the difference is **centralized WLC control vs standalone config**.',
        whatItDoes: 'Modern autonomous and lightweight AP hardware typically supports **dual-band 802.11** operation.',
        whyWrongHere: 'The stem asks for the **key architectural difference** — WLC/CAPWAP centralization, not radio band support.',
        misconceptionTested: 'Equating lightweight APs with 2.4 GHz-only hardware',
      },
      {
        choiceIndex: 2,
        explanation: '**CAPWAP** is used by **lightweight APs** — autonomous APs are configured locally without WLC offload.',
        whatItDoes: '**CAPWAP** tunnels control and data between lightweight APs and a **WLC**.',
        whyWrongHere: 'The choice **reverses** which mode uses CAPWAP — autonomous APs do not depend on WLC control-plane offload.',
        misconceptionTested: 'Reversing which AP mode uses CAPWAP',
      },
      {
        choiceIndex: 3,
        explanation: '**Lightweight APs** carry thinner firmware — the **WLC** holds config and RF policy, not more local IOS flash.',
        whatItDoes: 'Lightweight APs run minimal firmware because **configuration, RF management, and policy** live on the WLC.',
        whyWrongHere: 'The stem contrasts architecture — lightweight APs have **less** local storage, not more flash for full IOS.',
        misconceptionTested: 'Assuming lightweight APs store full IOS locally',
      },
    ],
    examTip: '**Autonomous** = local IOS config. **Lightweight** = WLC + **CAPWAP** centralized control.',
  },
  '2.6-sk-capwap-arch': {
    correct: {
      choiceIndex: 0,
      explanation: 'In **split-MAC**, the **WLC** handles **802.1X/EAP, association policy, and roaming** — time-critical RF stays on the AP.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '**Beacons and probe responses** are time-critical RF tasks on the **AP** — not moved to the WLC in split-MAC.',
        whatItDoes: '**Beacon transmission** and **probe responses** are on-air 802.11 management frames sent by the AP radio.',
        whyWrongHere: 'Split-MAC keeps **real-time RF functions on the AP** — the WLC handles slower control-plane decisions.',
        misconceptionTested: 'Moving beacon/probe duties to the WLC',
      },
      {
        choiceIndex: 2,
        explanation: '**Physical RF TX/RX** must occur at the **AP antenna** — the remote WLC cannot transmit 802.11 frames.',
        whatItDoes: 'The AP radio performs **physical transmit and receive** on the wireless medium.',
        whyWrongHere: 'The stem asks what the **WLC** handles — RF at the antenna is always an **AP** responsibility in split-MAC.',
        misconceptionTested: 'Expecting WLC to handle physical RF TX/RX',
      },
      {
        choiceIndex: 3,
        explanation: '**ACK and MAC retransmissions** are real-time duties on the **AP** — auth and roaming policy move to the WLC.',
        whatItDoes: '**802.11 ACK** and **MAC-layer retransmissions** require microsecond timing at the radio.',
        whyWrongHere: 'Split-MAC offloads **authentication and mobility policy** to the WLC — not sub-millisecond MAC retransmissions.',
        misconceptionTested: 'Offloading MAC retransmissions to the WLC',
      },
    ],
    examTip: 'Split-MAC: **AP = RF real-time** (beacons, ACKs). **WLC = auth, roaming, policy**.',
  },
  '3.1-sk-longest-prefix': {
    correct: {
      choiceIndex: 1,
      explanation: '**Longest prefix match** wins first — **O 10.1.1.0/24** is more specific than **S 10.0.0.0/8** for destination **10.1.1.5**.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '**Administrative distance** breaks ties only among routes with the **same prefix length** — /8 loses to /24 here.',
        whatItDoes: '**AD** (static = 1, OSPF = 110) selects between competing routes to the **same prefix**.',
        whyWrongHere: 'For **10.1.1.5**, **/24 is more specific than /8** — LPM is evaluated before AD.',
        misconceptionTested: 'Applying AD before longest-prefix match',
      },
      {
        choiceIndex: 2,
        explanation: 'One route is clearly more specific — **/24** matches **10.1.1.5** with a longer mask than **/8**.',
        whatItDoes: 'Prefix length determines how many bits of the destination must match the route.',
        whyWrongHere: '**10.1.1.0/24** and **10.0.0.0/8** are not equally specific for **10.1.1.5** — /24 wins LPM.',
        misconceptionTested: 'Believing AD tie makes both routes equal',
      },
      {
        choiceIndex: 3,
        explanation: '**Install order** does not override LPM — forwarding uses **best match**, not first-installed route.',
        whatItDoes: 'The routing table may list routes in arbitrary order depending on protocol and convergence timing.',
        whyWrongHere: 'Cisco forwarding applies **longest prefix match first** — not whichever route appeared first in the table.',
        misconceptionTested: 'Using first-installed route instead of LPM',
      },
    ],
    examTip: 'Forwarding order: **longest prefix** → then **lowest AD** → then **best metric**.',
  },
  '4.3-sk-dhcp-relay': {
    correct: {
      choiceIndex: 0,
      explanation: '**`ip helper-address 10.0.0.5`** on **interface Vlan20** relays client **DHCP broadcasts** as unicast to the remote server.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '**`ip dhcp relay`** is not valid IOS syntax — use **`ip helper-address`** on the client-facing SVI.',
        whatItDoes: 'Cisco IOS uses **`ip helper-address <server>`** under the interface to forward UDP broadcasts (including DHCP).',
        whyWrongHere: 'The stem needs relay on **Vlan20** — `ip dhcp relay` is invented syntax, not a real IOS command.',
        misconceptionTested: 'Using nonexistent ip dhcp relay command',
      },
      {
        choiceIndex: 2,
        explanation: '**`ip dhcp-server`** is not a global relay command — relay is configured **per client-facing interface**.',
        whatItDoes: 'Global DHCP server configuration uses **`ip dhcp pool`** — relay is an interface-level helper, not a global dhcp-server directive.',
        whyWrongHere: 'Clients on **VLAN 20** need **`ip helper-address`** on **Vlan20**, not a global server stanza.',
        misconceptionTested: 'Configuring relay globally with dhcp-server',
      },
      {
        choiceIndex: 3,
        explanation: '**`ip dhcp pool VLAN20`** defines a **local scope** — it does not relay broadcasts to **10.0.0.5** on another subnet.',
        whatItDoes: '**`ip dhcp pool`** configures the router as a **local DHCP server** for a subnet.',
        whyWrongHere: 'The server lives at **10.0.0.5 off-subnet** — you need **relay**, not a local pool on the router.',
        misconceptionTested: 'Creating a local pool instead of relay helper',
      },
    ],
    examTip: 'Remote DHCP server → **`ip helper-address <server>`** on the **client-facing SVI**.',
  },
  '4.4-design-snmp': {
    correct: {
      choiceIndex: 0,
      explanation: 'The **SNMP agent** on the managed device owns MIBs and originates **traps/informs** toward the NMS.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'The **manager/NMS** receives traps — it does not originate device traps for itself.',
        whatItDoes: 'The **SNMP manager (NMS)** polls agents and receives traps/informs for monitoring and alerting.',
        whyWrongHere: 'The stem asks which component **originates traps from the managed device** — that is the **agent**, not the manager.',
        misconceptionTested: 'Manager sends traps',
      },
      {
        choiceIndex: 2,
        explanation: '**Syslog** is a separate telemetry path — SNMP traps come from the **agent**.',
        whatItDoes: '**Syslog** forwards timestamped log messages to a collector — a different protocol from SNMP.',
        whyWrongHere: 'SNMP trap generation is an **agent** function — syslog does not replace SNMP trap origination.',
        misconceptionTested: 'Syslog as SNMP agent',
      },
      {
        choiceIndex: 3,
        explanation: '**DHCP relay** forwards broadcasts — unrelated to SNMP trap generation.',
        whatItDoes: '**`ip helper-address`** relays DHCP and other UDP broadcasts to remote servers.',
        whyWrongHere: 'The question tests **SNMP components** — DHCP relay has no role in SNMP trap origination.',
        misconceptionTested: 'Relay as SNMP source',
      },
    ],
    examTip: 'Agent on device → traps/informs → **NMS/manager**.',
  },
  '4.9-design-tftp': {
    correct: {
      choiceIndex: 0,
      explanation: '**TFTP** is lightweight **UDP** with **no authentication** — classic for reachable LAN IOS image copy on exams.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '**HTTPS with pinning** adds TLS/auth overhead — the stem asked for minimal overhead without auth.',
        whatItDoes: '**HTTPS** provides encrypted transport with certificate validation — higher overhead than bare UDP.',
        whyWrongHere: 'Exam stems asking for **simple, no-auth LAN copy** point to **TFTP**, not TLS pinning.',
        misconceptionTested: 'HTTPS for no-auth backup',
      },
      {
        choiceIndex: 2,
        explanation: '**SCP** is secure and authenticated — heavier than the “no auth / low overhead” requirement.',
        whatItDoes: '**SCP** copies files over SSH with encryption and user authentication.',
        whyWrongHere: 'The stem emphasizes **low overhead and no authentication** — SCP adds both security and complexity.',
        misconceptionTested: 'SCP as lightest option',
      },
      {
        choiceIndex: 3,
        explanation: '**SNMP set** is for MIB writes — not the standard IOS image transfer method.',
        whatItDoes: '**SNMP SET** modifies MIB object values on managed devices — not bulk IOS image file transfer.',
        whyWrongHere: 'IOS image backup/restore uses **`copy` via TFTP/FTP/SCP** — not SNMP SET operations.',
        misconceptionTested: 'SNMP for image backup',
      },
    ],
    examTip: 'LAN image copy, simple/no auth → **TFTP** (know insecurity trade-off).',
  },
  '4.10-design-cloud': {
    correct: {
      choiceIndex: 0,
      explanation: 'Cloud/controller management adds **reachability dependence** — if cloud/path fails, central policy push and monitoring degrade.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Devices still need **management addressing** — cloud does not remove IP identity.',
        whatItDoes: 'Every managed device requires **IP reachability** (and often DNS) for cloud/controller communication.',
        whyWrongHere: 'The stem asks for a **primary trade-off** — cloud dependency, not elimination of device IPs.',
        misconceptionTested: 'Cloud removes device IPs',
      },
      {
        choiceIndex: 2,
        explanation: '**Credentials/secrets** remain required — cloud does not eliminate authentication.',
        whatItDoes: 'Cloud dashboards and device APIs still require **authentication tokens, API keys, or credentials**.',
        whyWrongHere: 'Centralized management changes *how* you authenticate — it does not remove the need for secrets.',
        misconceptionTested: 'Cloud removes passwords',
      },
      {
        choiceIndex: 3,
        explanation: 'Cloud helps consistency but does **not guarantee zero drift** without process/tools.',
        whatItDoes: 'Cloud controllers push **intended configuration** and provide assurance analytics.',
        whyWrongHere: 'Drift can still occur from manual changes or outages — the real trade-off is **cloud/path reachability**.',
        misconceptionTested: 'Cloud guarantees no drift',
      },
    ],
    examTip: 'Cloud-managed trade-off = **controller/cloud reachability** dependency.',
  },
  '5.2-design-program': {
    correct: {
      choiceIndex: 0,
      explanation: '**Defense-in-depth programs** combine **policy, user awareness training, and layered controls** — people and process matter as much as device configs.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '**One ACL on one router** is a single tactical control — not a full security program.',
        whatItDoes: 'An **ACL** filters traffic on one device — a valid technical control in isolation.',
        whyWrongHere: 'The stem asks for a **security program element** — governance and training, not one config line.',
        misconceptionTested: 'Equating one ACL with enterprise security program',
      },
      {
        choiceIndex: 2,
        explanation: '**Renaming a VLAN** is cosmetic — no policy, training, or layered defense involved.',
        whatItDoes: 'A **VLAN name** labels a broadcast domain for operator clarity.',
        whyWrongHere: 'Security programs include **policy, awareness, and process** — renaming VLANs is not program-level.',
        misconceptionTested: 'Cosmetic VLAN change as security program',
      },
      {
        choiceIndex: 3,
        explanation: '**Disabling CDP on one switch** is tactical hardening — not a program with policy and training.',
        whatItDoes: '**`no cdp enable`** on an interface stops CDP advertisements on that link.',
        whyWrongHere: 'A single switch hardening step lacks **program-wide policy and user education** the stem requires.',
        misconceptionTested: 'Single switch hardening as full program',
      },
    ],
    examTip: 'Security **program** = **policy + people + process + technology** — not one config line.',
  },
  '5.7-sk-radius-vs-tacacs': {
    correct: {
      choiceIndex: 0,
      explanation: '**TACACS+** uses **TCP 49**, encrypts the **full packet**, and **separates AA&A**; **RADIUS** uses **UDP 1812/1813** and combines auth+author — preferred for **802.1X/network access**.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Transport protocols are **reversed** — **RADIUS uses UDP**, **TACACS+ uses TCP 49**.',
        whatItDoes: '**RADIUS** traditionally uses **UDP 1812/1813**; **TACACS+** uses **TCP port 49** for reliable device admin AAA.',
        whyWrongHere: 'The choice swaps them — exam traps often test **which protocol uses which transport**.',
        misconceptionTested: 'Swapping RADIUS/TACACS+ transport protocols',
      },
      {
        choiceIndex: 2,
        explanation: '**TACACS+ encrypts the entire packet body** — **RADIUS encrypts only the password field**.',
        whatItDoes: '**TACACS+** encrypts the full payload for confidentiality; **RADIUS** leaves most attributes cleartext except the password.',
        whyWrongHere: 'The choice reverses encryption scope — a classic CCNA **RADIUS vs TACACS+** trap.',
        misconceptionTested: 'Reversing which protocol encrypts the full packet',
      },
      {
        choiceIndex: 3,
        explanation: '**RADIUS and TACACS+** differ in transport, encryption, and AA&A separation — not interchangeable vendor variants.',
        whatItDoes: 'Both are AAA protocols but with **different ports, encryption models, and authorization granularity**.',
        whyWrongHere: 'The stem asks for a **correct distinguishing statement** — they are architecturally different protocols.',
        misconceptionTested: 'Treating RADIUS and TACACS+ as identical protocols',
      },
    ],
    examTip: 'Device admin AAA → **TACACS+ (TCP 49, full encrypt, per-command)**. Network access → **RADIUS**.',
  },
  '5.8-design-wpa': {
    correct: {
      choiceIndex: 0,
      explanation: '**WPA2-Enterprise** uses **802.1X/EAP** so each user authenticates individually via **RADIUS**.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '**WPA2-Personal/PSK** shares one passphrase — not per-user **802.1X**.',
        whatItDoes: '**WPA2-Personal** uses a **pre-shared key** shared by all clients on the SSID.',
        whyWrongHere: 'Enterprise per-user authentication requires **802.1X/EAP** — PSK is one shared secret for everyone.',
        misconceptionTested: 'PSK as enterprise auth',
      },
      {
        choiceIndex: 2,
        explanation: '**Open SSID** has no crypto/auth suitable for enterprise users.',
        whatItDoes: 'An **open WLAN** allows association without encryption or user authentication.',
        whyWrongHere: 'Enterprise wireless security demands **individual user auth** — open networks provide none.',
        misconceptionTested: 'Open as enterprise',
      },
      {
        choiceIndex: 3,
        explanation: '**WEP** is obsolete and weak — not modern enterprise **802.1X**.',
        whatItDoes: '**WEP** uses static RC4 keys — broken and deprecated for years.',
        whyWrongHere: 'Modern enterprise WLANs use **WPA2/WPA3-Enterprise with 802.1X** — not legacy WEP.',
        misconceptionTested: 'WEP as enterprise',
      },
    ],
    examTip: 'Per-user wireless auth → **WPA2/WPA3-Enterprise (802.1X)**.',
  },
  '5.10-design-vpn': {
    correct: {
      choiceIndex: 0,
      explanation: '**Site-to-site IPsec** encrypts traffic between **gateway routers/firewalls** for branch↔HQ connectivity.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '**SSL VPN portals** typically serve **remote-access users**, not always-on site gateways.',
        whatItDoes: '**SSL VPN** gives individual users browser or client access to corporate resources.',
        whyWrongHere: 'The stem asks for **branch↔HQ site connectivity** — site-to-site IPsec between gateways fits, not user portals.',
        misconceptionTested: 'SSL portal as site-to-site',
      },
      {
        choiceIndex: 2,
        explanation: '**GRE without encryption** tunnels but does not meet confidentiality by itself.',
        whatItDoes: '**GRE** encapsulates packets in a tunnel — it provides no encryption on its own.',
        whyWrongHere: 'Secure site-to-site design needs **IPsec encryption** — GRE alone is not a confidentiality solution.',
        misconceptionTested: 'GRE alone as secure VPN',
      },
      {
        choiceIndex: 3,
        explanation: '**Telnet reverse proxy** is not a site-to-site VPN design.',
        whatItDoes: '**Telnet** provides cleartext remote terminal access — not WAN encryption between sites.',
        whyWrongHere: 'Site-to-site VPNs use **IPsec (or similar) between gateways** — not telnet proxies.',
        misconceptionTested: 'Telnet as VPN',
      },
    ],
    examTip: 'Branch↔HQ always-on crypto → **site-to-site IPsec**.',
  },
  '5.11-design-segment': {
    correct: {
      choiceIndex: 0,
      explanation: 'Segmentation **contains blast radius** — compromise in one VLAN/VRF/zone cannot freely traverse the whole LAN.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Segmentation does not remove **routing** — it structures where routing/policy apply.',
        whatItDoes: '**Inter-zone routing** and **ACLs/firewalls** still control traffic between segments.',
        whyWrongHere: 'Segmentation **isolates** zones — it does not eliminate the need for L3 paths between them.',
        misconceptionTested: 'Segmentation kills routing',
      },
      {
        choiceIndex: 2,
        explanation: 'Larger broadcast domains **increase** exposure — opposite of segmentation goals.',
        whatItDoes: 'A **single large VLAN** puts more hosts in one broadcast domain with shared L2 visibility.',
        whyWrongHere: 'Segmentation **shrinks** blast radius — merging broadcast domains works against that goal.',
        misconceptionTested: 'Bigger broadcast = safer',
      },
      {
        choiceIndex: 3,
        explanation: 'Segmentation often **increases** need for ACLs/firewalls between zones — it does not remove them.',
        whatItDoes: '**ACLs and firewalls** enforce policy at segment boundaries.',
        whyWrongHere: 'More segments mean **more boundary controls** — segmentation does not make ACLs unnecessary.',
        misconceptionTested: 'Segmentation removes ACLs',
      },
    ],
    examTip: 'Segmentation goal = **limit lateral movement / blast radius**.',
  },
  '6.1-design-auto': {
    correct: {
      choiceIndex: 0,
      explanation: 'Automation most directly improves operations through **repeatable, faster changes** with **fewer manual errors**.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '**IP addressing design** is still required — automation applies the plan, it does not replace it.',
        whatItDoes: '**IP addressing plans** define subnets, VLANs, and summarization before any tool pushes config.',
        whyWrongHere: 'The stem asks how automation improves **operations** — speed and consistency, not removing IP planning.',
        misconceptionTested: 'Automation removes IP planning',
      },
      {
        choiceIndex: 2,
        explanation: '**Physical cabling** is still needed — automation configures devices, not physical plant.',
        whatItDoes: 'Cables, optics, and patch panels form the **physical layer** every network depends on.',
        whyWrongHere: 'Automation targets **configuration and deployment** — it cannot eliminate physical infrastructure.',
        misconceptionTested: 'Automation eliminates cabling',
      },
      {
        choiceIndex: 3,
        explanation: 'No solution guarantees **zero outages** — automation reduces human error but cannot promise perfection.',
        whatItDoes: 'Automation tools (**Ansible, DNA Center, APIs**) converge devices to desired state faster and more consistently.',
        whyWrongHere: 'Ops benefit is **fewer errors and faster changes** — not a magic uptime guarantee.',
        misconceptionTested: 'Zero-outage guarantee from automation',
      },
    ],
    examTip: 'Ops benefit of automation = **consistent, fast deploys** — not magic uptime.',
  },
  '6.2-design-sdn': {
    correct: {
      choiceIndex: 0,
      explanation: 'In **controller-based networking**, the **control plane** resides **centrally on the SDN controller** — not independently on every device.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Traditional **per-switch CLI** keeps control distributed — SDN **centralizes** it on the controller.',
        whatItDoes: 'Classic networking runs **routing/switching control protocols** on each device independently.',
        whyWrongHere: 'The defining SDN shift is **centralized control** — not control isolated to every access switch alone.',
        misconceptionTested: 'Control plane only on access switches',
      },
      {
        choiceIndex: 2,
        explanation: '**DNS** resolves names — it is not the SDN control plane.',
        whatItDoes: '**DNS** maps hostnames to IP addresses for applications and users.',
        whyWrongHere: 'The control plane programs **forwarding behavior** — DNS is an application service, not SDN control.',
        misconceptionTested: 'DNS as control plane',
      },
      {
        choiceIndex: 3,
        explanation: 'SDN **separates** control from data plane — control is not removed; it **moves to the controller**.',
        whatItDoes: 'The **data plane** forwards frames/packets; the **control plane** decides how forwarding tables are built.',
        whyWrongHere: 'SDN relocates control intelligence — it does not eliminate the control plane entirely.',
        misconceptionTested: 'No control plane in SDN',
      },
    ],
    examTip: 'SDN control plane → **central controller**; data plane stays on switches.',
  },
  '6.4-design-dna': {
    correct: {
      choiceIndex: 0,
      explanation: '**DNA Center** adds **intent/templates, assurance, and centralized lifecycle** versus per-box CLI staffing.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Devices still run **IOS-XE images** — DNA does not delete the need for images.',
        whatItDoes: 'Switches and routers still require **IOS-XE (or equivalent) images** to operate.',
        whyWrongHere: 'DNA Center **manages** lifecycle and provisioning — it does not remove the need for device software.',
        misconceptionTested: 'DNA removes IOS images',
      },
      {
        choiceIndex: 2,
        explanation: '**VLANs** remain part of campus design — DNA does not abolish them.',
        whatItDoes: '**VLANs** segment broadcast domains and map to IP subnets in campus networks.',
        whyWrongHere: 'DNA templates **deploy** VLAN policy — they do not eliminate VLANs as a design concept.',
        misconceptionTested: 'DNA eliminates VLANs',
      },
      {
        choiceIndex: 3,
        explanation: 'DNA still rides **IP/TCP** underlays — it is not a proprietary L3 replacement.',
        whatItDoes: '**DNA Center** communicates with devices over **standard IP networks** using APIs and protocols.',
        whyWrongHere: 'Intent-based automation sits **on top of** TCP/IP — it does not replace the underlay.',
        misconceptionTested: 'DNA replaces TCP/IP',
      },
    ],
    examTip: 'DNA value = **central intent + assurance**, not “no more networking basics”.',
  },
  '6.5-design-rest': {
    correct: {
      choiceIndex: 0,
      explanation: '**REST** exposes resources over **stateless HTTP** verbs (**GET/POST/PUT/DELETE**) — common for controller APIs.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '**REST** is HTTP/JSON oriented — not a proprietary always-on binary-only socket model.',
        whatItDoes: '**REST APIs** use **HTTP methods** and typically **JSON** payloads over TCP port 443/80.',
        whyWrongHere: 'Controller automation APIs are **RESTful HTTP** — not a closed binary-only protocol.',
        misconceptionTested: 'REST is binary-only',
      },
      {
        choiceIndex: 2,
        explanation: '**SNMPv1** is legacy monitoring — REST controllers use **HTTP APIs**, not SNMP exclusive.',
        whatItDoes: '**SNMP** polls MIBs and receives traps — a monitoring protocol, not the primary DNA/IOS-XE automation API.',
        whyWrongHere: 'Modern controller automation is **REST over HTTPS** — SNMP is complementary, not a REST replacement.',
        misconceptionTested: 'REST requires SNMPv1',
      },
      {
        choiceIndex: 3,
        explanation: '**Console** remains a break-glass path — REST exists for **remote programmable** changes.',
        whatItDoes: '**Console access** provides out-of-band local CLI when the network is unreachable.',
        whyWrongHere: 'REST enables **programmatic remote management** — it does not require console-only access.',
        misconceptionTested: 'REST requires console only',
      },
    ],
    examTip: 'Controller REST = **stateless HTTP methods** on resources.',
  },
}
