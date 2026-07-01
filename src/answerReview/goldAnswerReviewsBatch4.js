/** Gold reviews — Batch 4: scenario/troubleshooting across domains 2–6. */
export const BATCH4_GOLD = {
  '2.1-ts-vlan': {
    correct: {
      choiceIndex: 0,
      explanation: 'Fa0/10 is in VLAN 20 but the gateway SVI lives in VLAN 10 — move the access port to VLAN 10 so the host shares the same broadcast domain as the gateway.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'A trunk carries multiple VLANs between switches — this is a single-host access port that simply needs the correct access VLAN assignment.',
        misconceptionTested: 'Using trunk config to fix a wrong access VLAN',
      },
      {
        choiceIndex: 2,
        explanation: 'OSPF on the SVI routes between VLANs — it does not fix a host placed in the wrong VLAN and unable to reach its own gateway.',
        misconceptionTested: 'Adding routing protocol when L2 VLAN membership is wrong',
      },
      {
        choiceIndex: 3,
        explanation: 'STP priority controls root bridge election — it has no effect on which VLAN an access port belongs to.',
        misconceptionTested: 'Dragging spanning-tree tuning into VLAN mismatch troubleshooting',
      },
    ],
    examTip: 'Cannot reach **own VLAN gateway** → verify **access VLAN matches SVI** before routing protocols.',
  },
  '2.3-sk-cdp-disable': {
    correct: {
      choiceIndex: 0,
      explanation: 'Disable CDP globally with `no cdp run`, then selectively re-enable trusted trunks with `cdp enable` per interface — explicit allow-list for uplinks only.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Leaving CDP running globally and disabling per-port is error-prone — one missed untrusted port still advertises topology to attackers.',
        misconceptionTested: 'Relying on per-port deny while CDP stays globally on',
      },
      {
        choiceIndex: 2,
        explanation: '`no cdp advertise-v2` changes TLV format — it does not stop CDP advertisements on untrusted interfaces.',
        misconceptionTested: 'Confusing CDP version setting with disabling discovery',
      },
      {
        choiceIndex: 3,
        explanation: '`cdp holdtime 0` is not a valid way to disable CDP on specific ports — holdtime controls how long neighbors cache entries.',
        misconceptionTested: 'Using holdtime tweak instead of disabling CDP',
      },
    ],
    examTip: 'Untrusted edge CDP off: **`no cdp run` globally**, then **`cdp enable`** only on trusted trunks.',
  },
  '2.3-sk-cdp-show-detail': {
    correct: {
      choiceIndex: 0,
      explanation: '`show cdp neighbors detail` adds management IP, platform, IOS version, native VLAN, and duplex — documentation fields absent from the brief summary.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Hold-time countdown is not the key differentiator — detail focuses on device identity and management reachability, not timer display.',
        misconceptionTested: 'Expecting timer output as the detail-only field',
      },
      {
        choiceIndex: 2,
        explanation: 'Neighbor MAC may appear in some outputs, but the exam distinction is management IP and software version for troubleshooting reachability.',
        misconceptionTested: 'Picking MAC when management IP is the tested detail field',
      },
      {
        choiceIndex: 3,
        explanation: 'STP port role is a spanning-tree concept — CDP detail does not report the neighbor STP role as its primary extra data.',
        misconceptionTested: 'Mixing STP state into CDP neighbor detail',
      },
    ],
    examTip: 'CDP **detail** = **mgmt IP + IOS version + platform** — use it for topology docs and reachability.',
  },
  'obj-2.3-depth-q3': {
    correct: {
      choiceIndex: 1,
      explanation: 'LLDP (IEEE 802.1AB) is standards-based and works across vendors — required for multivendor L2 neighbor discovery.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'CDP is Cisco-proprietary — it will not discover neighbors on non-Cisco gear in a multivendor campus.',
        misconceptionTested: 'Using Cisco-only CDP in multivendor design',
      },
      {
        choiceIndex: 2,
        explanation: 'OSPF is a Layer 3 routing protocol — it does not replace Layer 2 neighbor discovery on switch links.',
        misconceptionTested: 'Confusing L3 routing adjacency with L2 discovery',
      },
      {
        choiceIndex: 3,
        explanation: 'VTP synchronizes VLAN databases — it does not discover physical neighbors or their capabilities.',
        misconceptionTested: 'Assigning VLAN propagation to neighbor discovery',
      },
    ],
    examTip: 'Multivendor L2 discovery → **LLDP**. Cisco-only → CDP.',
  },
  'obj-2.4-source-q003': {
    correct: {
      choiceIndex: 0,
      explanation: 'EtherChannel members must match speed and duplex — only the two gigabit ports can bundle, giving 2 Gb/s aggregate with PAgP.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'You cannot mix FastEthernet and Gigabit in one channel group — 2.2 Gb/s is not achievable with mismatched port speeds.',
        misconceptionTested: 'Assuming mixed-speed ports aggregate together',
      },
      {
        choiceIndex: 2,
        explanation: '400 Mb/s would require bundling FastEthernet ports only — the question asks for highest bandwidth using PAgP across available ports.',
        misconceptionTested: 'Under-counting by ignoring the gigabit pair',
      },
      {
        choiceIndex: 3,
        explanation: '2.6 Gb/s implies mixing link speeds — EtherChannel requires homogeneous speed/duplex on all members.',
        misconceptionTested: 'Adding incompatible port speeds into one bundle',
      },
    ],
    examTip: 'EtherChannel rule: **same speed + duplex** on every member — no mixing FE and GE.',
  },
  'obj-2.4-source-q005': {
    correct: {
      choiceIndex: 1,
      explanation: 'LACP (802.3ad) is the IEEE standard — VMware ESXi and third-party hosts require LACP, not Cisco PAgP.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '"EtherChannel" is the feature name, not a negotiation protocol — you must pick LACP or PAgP explicitly.',
        misconceptionTested: 'Naming the feature instead of the negotiation protocol',
      },
      {
        choiceIndex: 2,
        explanation: '"Channel Group" describes the interface bundle — it is not the inter-vendor negotiation protocol.',
        misconceptionTested: 'Confusing bundle terminology with LACP/PAgP',
      },
      {
        choiceIndex: 3,
        explanation: 'PAgP is Cisco-proprietary — non-Cisco ESXi hosts will not negotiate PAgP successfully.',
        misconceptionTested: 'Using PAgP with non-Cisco endpoints',
      },
    ],
    examTip: 'Non-Cisco link aggregation → **LACP**. Cisco-to-Cisco can use **PAgP or LACP**.',
  },
  'obj-2.4-source-q014': {
    correct: {
      choiceIndex: 1,
      explanation: 'LACP passive on both sides means neither initiates — no PDUs are exchanged, so the port channel never forms.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'PAgP is a different protocol family — this scenario describes LACP passive/passive, not PAgP negotiation.',
        misconceptionTested: 'Switching to PAgP when LACP modes are specified',
      },
      {
        choiceIndex: 2,
        explanation: 'The channel does not form at all — passive/passive produces no LACP PDUs, so there is no bundle to "use LACP" on.',
        misconceptionTested: 'Believing passive/passive still negotiates LACP',
      },
      {
        choiceIndex: 3,
        explanation: '`mode on` forces a channel without negotiation — passive/passive is not unconditional and will not form.',
        misconceptionTested: 'Equating passive/passive with mode on',
      },
    ],
    examTip: 'LACP **passive + passive = no channel**. Need **active** on at least one side.',
  },
  '2.4-sk-lacp-ts': {
    correct: {
      choiceIndex: 0,
      explanation: 'EtherChannel suspends when member configs differ — Gi0/1 VLAN 10 vs Gi0/2 VLAN 20 causes `(SD)`; match both to the same VLAN.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Active/passive mode mismatch can block formation, but here the ports show suspended due to **config mismatch** (different VLANs), not LACP mode alone.',
        misconceptionTested: 'Blaming LACP mode when VLAN mismatch is the stated cause',
      },
      {
        choiceIndex: 2,
        explanation: 'MTU mismatch can break bundles on some platforms, but mismatched access VLANs are the direct cause shown in the scenario.',
        misconceptionTested: 'Jumping to MTU when VLAN parity is the trap',
      },
      {
        choiceIndex: 3,
        explanation: 'Recreating Po1 does not fix underlying member port config differences — align VLAN/trunk settings first.',
        misconceptionTested: 'Recreating bundle instead of matching member config',
      },
    ],
    examTip: 'Po `(SD)` suspended → check **identical VLAN/trunk/speed/duplex** on every member.',
  },
  '2.4-sk-lacp-stp': {
    correct: {
      choiceIndex: 0,
      explanation: 'STP treats the port-channel as one logical link — one STP port role for Po1, not per physical member inside the bundle.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'STP does not block individual member ports inside a formed EtherChannel — the bundle is one logical interface to STP.',
        misconceptionTested: 'Expecting STP to block half the physical ports in a bundle',
      },
      {
        choiceIndex: 2,
        explanation: 'STP is not auto-disabled on EtherChannel members — the bundle is simply seen as a single link.',
        misconceptionTested: 'Believing STP turns off inside port-channels',
      },
      {
        choiceIndex: 3,
        explanation: 'STP does not run a separate instance per physical port within Po1 — only the logical port-channel participates.',
        misconceptionTested: 'Treating each member as independent STP port',
      },
    ],
    examTip: 'EtherChannel to STP = **one logical link**. Load balance happens below STP view.',
  },
  'obj-2.4-depth-q3': {
    correct: {
      choiceIndex: 1,
      explanation: 'LACP active pairs with passive or active on the peer — both sides must use LACP, not PAgP.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'PAgP desirable cannot negotiate with LACP active — protocols must match on both ends.',
        misconceptionTested: 'Mixing PAgP and LACP on the same link',
      },
      {
        choiceIndex: 2,
        explanation: '`mode on` is static bundling without LACP — the question specifies LACP active on Switch A.',
        misconceptionTested: 'Using static on mode when LACP is required',
      },
      {
        choiceIndex: 3,
        explanation: 'A channel-group statement is required — you cannot form an EtherChannel without configuring both sides.',
        misconceptionTested: 'Assuming links auto-bundle without channel-group',
      },
    ],
    examTip: 'LACP active peer → other side **LACP passive or active**. Never mix **PAgP + LACP**.',
  },
  '2.5-c-q6': {
    correct: {
      choiceIndex: 1,
      explanation: 'BPDU Guard on a PortFast port err-disables the interface when any BPDU arrives — protects against rogue switches on access ports.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Receiving a BPDU does not make the port root — BPDU Guard shuts the port down immediately.',
        misconceptionTested: 'Expecting BPDU to trigger root election on access port',
      },
      {
        choiceIndex: 2,
        explanation: 'BPDU Guard blocks BPDUs by err-disabling the port — it does not forward them into the STP domain.',
        misconceptionTested: 'Believing BPDU Guard forwards BPDUs normally',
      },
      {
        choiceIndex: 3,
        explanation: 'A BPDU on a PortFast+BPDU Guard port triggers immediate err-disable — this is not a no-op.',
        misconceptionTested: 'Thinking PortFast ignores all BPDU handling',
      },
    ],
    examTip: 'PortFast + **BPDU Guard** + BPDU received → **err-disable** the port.',
  },
  'obj-2.5-source-q033': {
    correct: {
      choiceIndex: 3,
      explanation: 'Enable PortFast on the specific access interface with `spanning-tree portfast` — speeds edge port to forwarding so DHCP/domain join is not delayed by STP convergence.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '`no switchport spanning-tree` is invalid — you cannot disable STP per switchport with this syntax.',
        misconceptionTested: 'Inventing switchport-level STP disable command',
      },
      {
        choiceIndex: 1,
        explanation: 'PortFast is an interface subcommand — `switchport spanning-tree portfast` in global config is wrong context and syntax.',
        misconceptionTested: 'Configuring PortFast in wrong config mode',
      },
      {
        choiceIndex: 2,
        explanation: '`spanning-tree portfast default` enables PortFast globally for access ports — the stem asks for the interface-level command on a specific port.',
        misconceptionTested: 'Using global default when interface command is required',
      },
    ],
    examTip: 'Boot delay from STP on one access port → **`spanning-tree portfast`** under that **interface**.',
  },
  'obj-2.5-source-q036': {
    correct: {
      choiceIndex: 0,
      explanation: 'A hub connected to two PortFast ports creates a temporary L2 loop — both ports forward simultaneously until STP detects and blocks.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'STP eventually blocks a port — the loop is not permanent once BPDUs propagate and STP reconverges.',
        misconceptionTested: 'Believing PortFast prevents any loop recovery',
      },
      {
        choiceIndex: 2,
        explanation: 'BPDU Guard err-disables on BPDU receipt — a dumb hub does not send BPDUs, so err-disable from BPDU Guard is not the first effect here.',
        misconceptionTested: 'Expecting immediate err-disable from hub without BPDUs',
      },
      {
        choiceIndex: 3,
        explanation: 'STP may block one link after convergence, but the immediate effect is a temporary loop when both PortFast ports forward at once.',
        misconceptionTested: 'Skipping the temporary loop phase',
      },
    ],
    examTip: 'Hub into **two switch ports** = **loop risk**. PortFast speeds forward — does not remove loops.',
  },
  'obj-2.6-source-q001': {
    correct: {
      choiceIndex: 1,
      explanation: 'High client density in a small area needs lightweight APs with centralized RF management from a WLC — optimal for scale and control.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Autonomous APs lack centralized RF coordination — managing 100 clients in a tight area is harder without WLC-driven channel/power planning.',
        misconceptionTested: 'Choosing autonomous APs for high-density centralized design',
      },
      {
        choiceIndex: 2,
        explanation: 'Autonomous without WLC removes centralized management — poor fit for dense deployments needing coordinated RF.',
        misconceptionTested: 'Deploying standalone autonomous APs at high density',
      },
      {
        choiceIndex: 3,
        explanation: 'Lightweight APs require a WLC for control and config — they cannot operate in lightweight mode without one.',
        misconceptionTested: 'Using lightweight APs with no controller',
      },
    ],
    examTip: 'High density + small area → **lightweight APs + WLC** for RF and client management.',
  },
  'obj-2.6-source-q007': {
    correct: {
      choiceIndex: 3,
      explanation: 'A wireless repeater extends coverage in a small warehouse dead zone at low cost — acceptable when density and throughput needs are modest.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Wireless bridging connects two networks — overkill for extending coverage within one warehouse corner.',
        misconceptionTested: 'Using point-to-point bridge for local coverage gap',
      },
      {
        choiceIndex: 1,
        explanation: 'Mesh systems cost more than a simple repeater for a single small dead zone.',
        misconceptionTested: 'Over-engineering with mesh for minimal coverage need',
      },
      {
        choiceIndex: 2,
        explanation: 'Adding a WLC is expensive infrastructure — a repeater solves a small-area signal drop more cheaply.',
        misconceptionTested: 'Deploying full WLC stack for one coverage hole',
      },
    ],
    examTip: 'Small dead zone, **low cost** → **repeater**. High density → WLC + lightweight APs.',
  },
  '2.6-sk-sniffer-mode': {
    correct: {
      choiceIndex: 0,
      explanation: 'Sniffer mode dedicates the AP to capture raw 802.11 frames on a channel and forward them to Wireshark/AirPcap for analysis.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Monitor mode scans channels for RF metrics — it does not deliver full captures formatted for Wireshark like sniffer mode.',
        misconceptionTested: 'Confusing monitor mode with packet capture to Wireshark',
      },
      {
        choiceIndex: 2,
        explanation: 'FlexConnect is a data-plane forwarding model — it does not put the AP into dedicated 802.11 frame capture role.',
        misconceptionTested: 'Using FlexConnect debug instead of sniffer mode',
      },
      {
        choiceIndex: 3,
        explanation: 'SPAN on the wired uplink misses over-the-air 802.11 headers — sniffer mode captures wireless frames directly.',
        misconceptionTested: 'Expecting wired SPAN to replace wireless sniffer capture',
      },
    ],
    examTip: '802.11 frames to **Wireshark** → AP **sniffer mode** (SE-Connect on some platforms).',
  },
  '2.7-sk-ap-dhcp-fail': {
    correct: {
      choiceIndex: 0,
      explanation: 'The AP is in VLAN 10 but DHCP only serves VLAN 1 — without an IP (or option 43) the AP cannot begin CAPWAP discovery to the WLC.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Lightweight APs commonly use DHCP for management IP and WLC discovery — static IP is not required.',
        misconceptionTested: 'Believing APs cannot use DHCP',
      },
      {
        choiceIndex: 2,
        explanation: 'CDP on the AP is unrelated to CAPWAP tunnel formation — the break is no DHCP in the AP VLAN.',
        misconceptionTested: 'Blaming CDP for CAPWAP failure',
      },
      {
        choiceIndex: 3,
        explanation: 'VLAN 10 must be carried to the AP access port — pruning VLAN 10 would worsen reachability, not fix DHCP.',
        misconceptionTested: 'Pruning VLANs instead of providing DHCP relay/server',
      },
    ],
    examTip: 'AP no CAPWAP → verify **IP + option 43/DNS** in the AP VLAN (**helper-address** if server is remote).',
  },
  '2.7-sk-ap-uplink-trunk': {
    correct: {
      choiceIndex: 0,
      explanation: 'Multiple SSID-to-VLAN mappings with local switching require a trunk allowing VLANs 10, 20, 30 so the AP can tag client traffic per SSID.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'The switch must see tagged VLANs on the uplink — the AP does not hide all VLAN tagging inside an access port.',
        misconceptionTested: 'Using access mode when multiple VLANs egress the AP',
      },
      {
        choiceIndex: 2,
        explanation: 'A routed /30 uplink is not the standard AP access/trunk design for multi-SSID VLAN mapping.',
        misconceptionTested: 'Routed port for multi-VLAN wireless uplink',
      },
      {
        choiceIndex: 3,
        explanation: 'CAPWAP carries tunneled traffic in centralized mode, but local VLAN switching for multiple SSIDs needs trunk tagging on the wire.',
        misconceptionTested: 'Assuming CAPWAP alone carries all VLANs on access port',
      },
    ],
    examTip: 'Multi-SSID **local VLAN switching** → AP uplink = **trunk** with required VLANs allowed.',
  },
  'obj-2.8-source-q009': {
    correct: {
      choiceIndex: 2,
      explanation: 'First-time autonomous AP setup typically uses the **console** — no IP or credentials exist yet for SSH/HTTPS/Telnet.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'HTTPS requires network reachability and prior configuration — unavailable on initial out-of-box setup.',
        misconceptionTested: 'Using HTTPS before AP has management IP',
      },
      {
        choiceIndex: 1,
        explanation: 'SSH needs IP connectivity and credentials configured — not available on first boot before initial setup.',
        misconceptionTested: 'SSH on factory-default autonomous AP',
      },
      {
        choiceIndex: 3,
        explanation: 'Telnet is insecure and still requires network config — console is the initial provisioning path.',
        misconceptionTested: 'Telnet for first-time AP setup without L3 config',
      },
    ],
    examTip: 'Factory-default autonomous AP → **console** first. Then HTTPS/SSH after IP and creds.',
  },
  '2.8-sk-hidden-ssid': {
    correct: {
      choiceIndex: 0,
      explanation: 'Hidden SSID is security-through-obscurity — probing clients and passive captures still reveal the network name.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Determined attackers capture probe requests and association frames that contain the SSID — hiding broadcast does not block joins.',
        misconceptionTested: 'Treating hidden SSID as strong access control',
      },
      {
        choiceIndex: 2,
        explanation: 'The AP still transmits beacons (with blank or wildcard SSID) — it does not go silent on 802.11.',
        misconceptionTested: 'Believing hidden SSID stops all wireless transmission',
      },
      {
        choiceIndex: 3,
        explanation: 'WPA3 is encryption/authentication — unrelated to whether the SSID is broadcast or hidden.',
        misconceptionTested: 'Linking hidden SSID requirement to WPA3',
      },
    ],
    examTip: 'Hidden SSID ≠ real security. Use **WPA2/WPA3 + 802.1X** — not broadcast disable alone.',
  },
  '2.8-sk-wlan-interface': {
    correct: {
      choiceIndex: 0,
      explanation: 'A dynamic interface maps the WLAN to a VLAN/subnet — wireless clients get IPs from that VLAN via the wired infrastructure.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Dynamic interfaces are logical VLAN mappings — not dedicated physical WLC ports for throughput.',
        misconceptionTested: 'Confusing dynamic interface with physical port binding',
      },
      {
        choiceIndex: 2,
        explanation: 'CAPWAP control uses the management interface — dynamic interfaces carry client data VLAN mapping, not CAPWAP control separation.',
        misconceptionTested: 'Assigning CAPWAP control to dynamic interface purpose',
      },
      {
        choiceIndex: 3,
        explanation: 'AP groups restrict which APs serve a WLAN — dynamic interface defines which VLAN/subnet clients join.',
        misconceptionTested: 'Mixing AP group scope with VLAN mapping',
      },
    ],
    examTip: 'WLC **dynamic interface** = WLAN → **VLAN + subnet** for client addressing.',
  },
  'obj-2.9-source-q007': {
    correct: {
      choiceIndex: 2,
      explanation: 'MAC filtering allows only approved corporate MAC addresses to associate — restricts WLAN access to known devices.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Disabling SSID broadcast hides the name — it does not authenticate or restrict which hosts can connect.',
        misconceptionTested: 'Using hidden SSID as corporate-only access control',
      },
      {
        choiceIndex: 1,
        explanation: 'A shared PSK lets anyone with the password connect — it does not limit to corporate-owned devices.',
        misconceptionTested: 'PSK alone for corporate-only host restriction',
      },
      {
        choiceIndex: 3,
        explanation: 'LDAP enables user-based 802.1X authentication — the stem asks for corporate **host** restriction, which MAC filtering addresses directly.',
        misconceptionTested: 'Choosing LDAP when MAC allow-list is the simpler host filter',
      },
    ],
    examTip: 'Corporate **devices only** → **MAC filtering** (or 802.1X with cert). PSK ≠ device allow-list.',
  },
  '3.1-sk-longest-prefix': {
    correct: {
      choiceIndex: 1,
      explanation: 'Longest prefix match wins first — /24 is more specific than /8, so OSPF 10.1.1.0/24 is chosen for 10.1.1.5 regardless of lower static AD.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Administrative distance breaks ties only among routes with the **same prefix length** — /8 loses to /24 for 10.1.1.5.',
        misconceptionTested: 'Applying AD before longest-prefix match',
      },
      {
        choiceIndex: 2,
        explanation: 'One route is clearly more specific — /24 matches 10.1.1.5 with a longer mask than /8.',
        misconceptionTested: 'Believing AD tie makes both routes equal',
      },
      {
        choiceIndex: 3,
        explanation: 'Install order does not override longest-prefix — forwarding uses best match, not first-installed route.',
        misconceptionTested: 'Using first-installed route instead of LPM',
      },
    ],
    examTip: 'Forwarding order: **longest prefix** → then **lowest AD** → then **best metric**.',
  },
  '3.1-sk-default-route': {
    correct: {
      choiceIndex: 1,
      explanation: 'Gateway of last resort (0.0.0.0/0) forwards traffic only when no more-specific prefix exists in the routing table.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '10.0.0.0/8 traffic uses a more-specific route if one exists — default route is not the primary path for all 10.x traffic.',
        misconceptionTested: 'Treating default route as catch-all for entire 10/8',
      },
      {
        choiceIndex: 2,
        explanation: 'OSPF hellos are link-local control traffic — not forwarded via the default gateway entry.',
        misconceptionTested: 'Routing protocol control traffic through default route',
      },
      {
        choiceIndex: 3,
        explanation: 'Multicast uses its own routing (or flooding rules) — default route is for unicast with no LPM match.',
        misconceptionTested: 'Sending all multicast via default gateway',
      },
    ],
    examTip: '**0.0.0.0/0** = last resort when **no longer prefix** matches the destination.',
  },
  '3.1-ts-route-table': {
    correct: {
      choiceIndex: 0,
      explanation: '**O** in the routing table marks an OSPF intra-area route — brackets show [AD/cost], via is next-hop, last token is outgoing interface.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Static routes display **S** — this entry is learned OSPF, not statically configured.',
        misconceptionTested: 'Misreading O as static',
      },
      {
        choiceIndex: 2,
        explanation: 'Directly connected routes show **C** — this route has a next-hop via 192.168.1.2, not a connected network.',
        misconceptionTested: 'Confusing OSPF learned route with connected',
      },
      {
        choiceIndex: 3,
        explanation: 'EIGRP uses **D** — **O** is exclusively OSPF in Cisco IOS routing table codes.',
        misconceptionTested: 'Labeling OSPF route as EIGRP external',
      },
    ],
    examTip: 'Route codes: **C** connected, **S** static, **O** OSPF, **D** EIGRP. Read `[AD/metric]` next.',
  },
  'obj-3.1-source-q001': {
    correct: {
      choiceIndex: 1,
      explanation: '**S*** marks a candidate default route — the asterisk flags the gateway of last resort, not a generic static prefix.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Plain **S** is a static route — **S*** specifically indicates the default/static gateway of last resort entry.',
        misconceptionTested: 'Ignoring asterisk on static default route code',
      },
      {
        choiceIndex: 2,
        explanation: 'Dynamic routes use O, D, R, etc. — **S** is static; the * denotes default route candidacy.',
        misconceptionTested: 'Calling S* a dynamic route',
      },
      {
        choiceIndex: 3,
        explanation: 'OSPF routes show **O** — **S*** is static default, not OSPF.',
        misconceptionTested: 'Reading S* as OSPF',
      },
    ],
    examTip: '**S*** in routing table = **default route** candidate (gateway of last resort).',
  },
  'obj-3.3-source-q018': {
    correct: {
      choiceIndex: 1,
      explanation: '`ip default-gateway` on a **router** only affects the router own management traffic when IP routing is off — it does not populate the routing table for forwarded packets.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '`ip default-network` advertises a default candidate — it does not fix using default-gateway on a router that should use `ip route 0.0.0.0 0.0.0.0`.',
        misconceptionTested: 'Combining default-network with default-gateway on L3 router',
      },
      {
        choiceIndex: 2,
        explanation: 'Default-gateway is not for dynamic routing — it is for hosts or routers with IP routing disabled.',
        misconceptionTested: 'Expecting default-gateway to install dynamic routes',
      },
      {
        choiceIndex: 3,
        explanation: 'The gateway IP may be valid — the command itself is wrong context on a router doing packet forwarding.',
        misconceptionTested: 'Blaming wrong gateway IP when command scope is the issue',
      },
    ],
    examTip: 'Router forwarding traffic → **`ip route 0.0.0.0`**. **`ip default-gateway`** = host / routing-disabled router only.',
  },
  'obj-3.3-source-q020': {
    correct: {
      choiceIndex: 3,
      explanation: 'Configuring an IP on an interface creates a connected /prefix route, may add a local /32 host route, and triggers routing updates if dynamic protocols run.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'A /32 alone is incomplete — IOS also installs the connected network prefix for the subnet, not only host route.',
        misconceptionTested: 'Selecting only /32 when all effects apply',
      },
      {
        choiceIndex: 1,
        explanation: 'Summary routes are not auto-created from a single interface IP — connected and local routes are, plus updates if routing protocols active.',
        misconceptionTested: 'Expecting auto summary without full answer',
      },
      {
        choiceIndex: 2,
        explanation: 'Routing updates occur when dynamic routing is enabled — but connected route creation always happens; all listed effects apply together.',
        misconceptionTested: 'Picking partial effect when stem asks for complete picture',
      },
    ],
    examTip: 'Interface IP up → **connected route** (+ local host route). Dynamic IGP may **advertise** it.',
  },
  '3.4-c-q9': {
    correct: {
      choiceIndex: 1,
      explanation: 'DR election on multi-access segments: highest OSPF priority wins; tie-break is highest Router ID. Priority 0 never becomes DR.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Lowest IP is not the DR rule — OSPF uses **highest priority**, then **highest RID**.',
        misconceptionTested: 'Using lowest IP for DR election',
      },
      {
        choiceIndex: 2,
        explanation: 'MAC address plays no role in OSPF DR election — priority and Router ID decide.',
        misconceptionTested: 'Electing DR by MAC address',
      },
      {
        choiceIndex: 3,
        explanation: 'First boot order alone does not permanently determine DR — priority and RID decide when BDR/DR election runs.',
        misconceptionTested: 'Believing first router up stays DR forever',
      },
    ],
    examTip: 'OSPF DR: **highest priority** → tie **highest RID**. **Priority 0** = never DR/BDR.',
  },
  '3.4-ts-area': {
    correct: {
      choiceIndex: 0,
      explanation: 'R2 advertises the link in area 1 — if R1 uses a different area ID on 10.0.12.0/30, OSPF refuses adjacency and `show ip ospf neighbor` stays empty.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Duplicate router-id prevents adjacency but the stem shows explicit area mismatch (area 1 on R2) — check matching area first.',
        misconceptionTested: 'Jumping to duplicate RID when area mismatch is shown',
      },
      {
        choiceIndex: 2,
        explanation: 'Shutdown would show interface down — the scenario points to config mismatch (area ID), not admin down.',
        misconceptionTested: 'Interface shutdown when OSPF area mismatch is stated',
      },
      {
        choiceIndex: 3,
        explanation: 'Default route is unrelated to OSPF neighbor formation on a point-to-point /30 link.',
        misconceptionTested: 'Blaming missing default route for OSPF adjacency failure',
      },
    ],
    examTip: 'No OSPF neighbor → match **area ID**, **hello/dead timers**, **subnet**, **auth** on the link.',
  },
  'obj-3.4-source-q042': {
    correct: {
      choiceIndex: 2,
      explanation: 'OSPF hello/dead timers must match — Router A hello 30 vs Router B hello 10 prevents adjacency even on the same LAN and area.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'A static route between routers does not block OSPF adjacency on a shared LAN segment.',
        misconceptionTested: 'Blaming static route for OSPF neighbor failure',
      },
      {
        choiceIndex: 1,
        explanation: 'Multiple area IDs on one router is unusual but the explicit timer mismatch (30 vs 10) is the classic adjacency killer here.',
        misconceptionTested: 'Choosing multi-area config over clear timer mismatch',
      },
      {
        choiceIndex: 3,
        explanation: 'Router B hello 10 matches common default — Router A hello 30 is the mismatch; B alone is not the problem.',
        misconceptionTested: 'Flagging the router with default timer instead of the odd 30-second hello',
      },
    ],
    examTip: 'OSPF stuck in **INIT/EXSTART** → verify **hello and dead timers match** on both sides.',
  },
  '3.5-ts-wrong-active': {
    correct: {
      choiceIndex: 0,
      explanation: 'Without `standby 1 preempt` on the interface, R1 stays Standby even at priority 150 — the lower-priority router that came up first remains Active until it fails.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Mismatched group numbers prevent peering — both routers would not share the same HSRP group; the stem shows R1 simply not preempting.',
        misconceptionTested: 'Group mismatch when preempt is the stated priority issue',
      },
      {
        choiceIndex: 2,
        explanation: 'Wrong virtual IP would break both routers — the issue is R1 higher priority not taking over due to missing preempt.',
        misconceptionTested: 'VIP subnet error when preempt is the fix',
      },
      {
        choiceIndex: 3,
        explanation: 'Tracking is optional for interface failover — HSRP works without track; preempt is required for priority-based takeover after reboot.',
        misconceptionTested: 'Believing track is mandatory for HSRP Active role',
      },
    ],
    examTip: 'Higher HSRP priority but still Standby → add **`standby <grp> preempt`** on the interface.',
  },
  'obj-3.5-depth-q4': {
    correct: {
      choiceIndex: 1,
      explanation: 'Two Active routers on one LAN means split brain — first verify matching HSRP group number and identical virtual IP on both interfaces.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Reloading does not fix config mismatch — mismatched group or VIP will recreate dual Active after reboot.',
        misconceptionTested: 'Reloading instead of checking HSRP parameters',
      },
      {
        choiceIndex: 2,
        explanation: 'CDP does not cause dual Active — HSRP group/VIP mismatch or isolation does.',
        misconceptionTested: 'Disabling CDP for HSRP split-brain',
      },
      {
        choiceIndex: 3,
        explanation: 'MAC aging on switches does not create two HSRP Active routers — fix HSRP config first.',
        misconceptionTested: 'Tuning CAM aging for dual Active HSRP',
      },
    ],
    examTip: 'Dual HSRP Active → check **same group # + same virtual IP** on the shared LAN.',
  },
  '4.1-ts-nat': {
    correct: {
      choiceIndex: 0,
      explanation: 'NAT never translates without `ip nat inside` and `ip nat outside` on the correct interfaces — add inside on LAN (Gi0/0) and outside on ISP (Gi0/1).',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'CEF affects forwarding performance — it does not prevent NAT when inside/outside labels are missing.',
        misconceptionTested: 'Blaming CEF for empty NAT translation table',
      },
      {
        choiceIndex: 2,
        explanation: 'Changing ACL to deny would block traffic — the issue is interfaces not marked inside/outside, not ACL direction alone.',
        misconceptionTested: 'ACL deny focus when inside/outside is missing',
      },
      {
        choiceIndex: 3,
        explanation: 'Overload (PAT) is often required but removing it does not fix zero translations when inside/outside are unset.',
        misconceptionTested: 'Removing overload instead of labeling interfaces',
      },
    ],
    examTip: 'Empty NAT table → **`ip nat inside` / `ip nat outside`** on correct interfaces **first**.',
  },
  '4.3-ts-dns': {
    correct: {
      choiceIndex: 0,
      explanation: 'Clients got DNS 0.0.0.0 from DHCP — add a valid `dns-server` to the pool so name resolution works while IP ping still succeeds.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '`ip domain-lookup` on the router enables the router to resolve names — it does not push DNS to DHCP clients.',
        misconceptionTested: 'Router domain-lookup instead of DHCP dns-server option',
      },
      {
        choiceIndex: 2,
        explanation: 'Lease time affects how long bindings last — it does not fix invalid DNS server value 0.0.0.0.',
        misconceptionTested: 'Lease tuning for missing DNS server',
      },
      {
        choiceIndex: 3,
        explanation: 'Clients already reach 8.8.8.8 by IP — routing is fine; they lack a DNS server address in DHCP options.',
        misconceptionTested: 'Static route when DHCP omitted dns-server',
      },
    ],
    examTip: 'Ping IP works, names fail → check **DHCP dns-server** option on clients (`ipconfig /all`).',
  },
  '4.3-sk-dhcp-exhaust': {
    correct: {
      choiceIndex: 0,
      explanation: '200 bindings vs 50 live devices means stale leases — shorten lease time or clear old bindings so addresses return to the pool.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'DHCP bindings live in RAM/flash structures — pool exhaustion is lease accounting, not flash capacity.',
        misconceptionTested: 'Flash memory as DHCP pool exhaustion cause',
      },
      {
        choiceIndex: 2,
        explanation: 'DNS failure affects name resolution after lease — it does not block DHCP OFFER/ACK or consume all pool addresses.',
        misconceptionTested: 'DNS blocking DHCP address allocation',
      },
      {
        choiceIndex: 3,
        explanation: 'Excluded ranges reduce available addresses but 0 available with 200 bindings points to stale leases, not exclude mis-sizing alone.',
        misconceptionTested: 'Exclude range when stale bindings explain the gap',
      },
    ],
    examTip: 'Pool **0 available** but few live clients → **stale leases** — shorten lease or `clear ip dhcp binding *`.',
  },
  'obj-4.2-source-q001': {
    correct: {
      choiceIndex: 0,
      explanation: 'NTP server is configured in global config mode: `ntp server 129.6.15.28` — synchronizes router clock to the stratum source.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'NTP server is not an exec-mode command — configuration belongs under `configure terminal`.',
        misconceptionTested: 'NTP server in privileged exec instead of config mode',
      },
      {
        choiceIndex: 2,
        explanation: '`ntp client` is not the IOS command to point at an NTP server — use `ntp server <ip>`.',
        misconceptionTested: 'Inventing ntp client syntax',
      },
      {
        choiceIndex: 3,
        explanation: 'Exec-mode `ntp client` is invalid — NTP peers/servers are defined in configuration mode.',
        misconceptionTested: 'Exec-mode NTP configuration',
      },
    ],
    examTip: 'NTP: **`ntp server <ip>`** in **global config**. Verify with **`show ntp associations`**.',
  },
  'obj-4.6-source-q003': {
    correct: {
      choiceIndex: 3,
      explanation: 'DHCP relay on a router/L3 SVI uses `ip helper-address 10.10.1.101` under the **client-facing interface** to forward broadcasts to the server.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '`ip dhcp server` in global config is not the relay command — helper-address goes on the interface where clients sit.',
        misconceptionTested: 'Global dhcp server instead of interface helper-address',
      },
      {
        choiceIndex: 1,
        explanation: '`ip dhcp server` under interface is wrong syntax — relay uses `ip helper-address`.',
        misconceptionTested: 'Wrong interface DHCP command for relay',
      },
      {
        choiceIndex: 2,
        explanation: '`ip relay-agent` is not valid Cisco IOS syntax for DHCP relay — the command is `ip helper-address`.',
        misconceptionTested: 'Inventing relay-agent command name',
      },
    ],
    examTip: 'DHCP relay → **`ip helper-address <server>`** on the **client VLAN interface**.',
  },
  '5.2-design-program': {
    correct: {
      choiceIndex: 0,
      explanation: 'Defense-in-depth programs combine policy, training, and layered controls — people and process matter as much as device configs.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'One ACL on one router is a single control — not a full security program with governance and awareness.',
        misconceptionTested: 'Equating one ACL with enterprise security program',
      },
      {
        choiceIndex: 2,
        explanation: 'Renaming a VLAN does not constitute security program elements — no policy or user education involved.',
        misconceptionTested: 'Cosmetic VLAN change as security program',
      },
      {
        choiceIndex: 3,
        explanation: 'Disabling CDP on one switch is a tactical hardening step — not a program with policy and training.',
        misconceptionTested: 'Single switch hardening as full program',
      },
    ],
    examTip: 'Security **program** = **policy + people + process + technology** — not one config line.',
  },
  'obj-5.6-source-q001': {
    correct: {
      choiceIndex: 0,
      explanation: 'Standard numbered ACLs use range **1–99** (and 1300–1999 extended standard on some platforms) — classic CCNA answer is 1–99.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: '100 is not in the standard ACL range — standard stops at 99 in the classic numbering scheme.',
        misconceptionTested: 'Including 100 in standard ACL range',
      },
      {
        choiceIndex: 2,
        explanation: '100–199 is the **extended** ACL numbered range — not standard.',
        misconceptionTested: 'Confusing extended range with standard',
      },
      {
        choiceIndex: 3,
        explanation: '200 is outside both classic standard and extended ranges — standard is 1–99.',
        misconceptionTested: 'Off-by-range ACL numbering',
      },
    ],
    examTip: '**Standard ACL 1–99**. **Extended ACL 100–199**. Match range to ACL type.',
  },
  'obj-5.7-source-q001': {
    correct: {
      choiceIndex: 0,
      explanation: 'DHCP snooping inspects DHCP messages on **Layer 2 access ports** in the same VLAN — it cannot protect devices on routed-only ports without L2 visibility.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'The DHCP server is typically a dedicated server or router — snooping runs on switches between clients and server, not requiring server on the switch.',
        misconceptionTested: 'DHCP server must run on the L2 switch',
      },
      {
        choiceIndex: 2,
        explanation: 'Routed ports do not see client DHCP broadcasts the same way — snooping needs L2 switch ports in the VLAN.',
        misconceptionTested: 'DHCP snooping on L3 routed port',
      },
      {
        choiceIndex: 3,
        explanation: 'No dedicated monitor IP is required — snooping uses trusted/untrusted port roles and binding table.',
        misconceptionTested: 'Special monitor IP as DHCP snooping prerequisite',
      },
    ],
    examTip: 'DHCP snooping → **L2 switch access ports** in VLAN. Mark **trusted** uplinks to real server.',
  },
  '5.7-sk-accounting': {
    correct: {
      choiceIndex: 0,
      explanation: 'AAA **accounting** with `aaa accounting commands 15 default start-stop group tacacs+` logs each privilege-15 command with timestamps to TACACS+ for audit trails.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Authentication logs capture login/logout — not every command typed during the session.',
        misconceptionTested: 'Using authentication logs for per-command audit',
      },
      {
        choiceIndex: 2,
        explanation: 'Debug syslog is verbose and volatile — not a structured per-engineer command audit like AAA accounting to TACACS+.',
        misconceptionTested: 'Debug buffer as compliance-grade command logging',
      },
      {
        choiceIndex: 3,
        explanation: 'SNMP interface traps report link state — they do not record CLI commands engineers executed.',
        misconceptionTested: 'SNMP traps for CLI command audit',
      },
    ],
    examTip: 'Command audit trail → **AAA accounting** to **TACACS+**. Auth = who logged in; accounting = what they ran.',
  },
  'obj-6.1-source-q003': {
    correct: {
      choiceIndex: 2,
      explanation: 'Automation primary driver is reducing human error in repetitive changes — consistency and repeatability beat manual CLI typos.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Automation often increases change frequency safely — the goal is not fewer changes but fewer mistakes per change.',
        misconceptionTested: 'Equating automation with minimizing change count',
      },
      {
        choiceIndex: 1,
        explanation: 'Complexity may shift to tooling — the top motivator cited is error reduction, not abstract complication reduction.',
        misconceptionTested: 'Choosing complication reduction over human error',
      },
      {
        choiceIndex: 3,
        explanation: 'Planning still matters — automation saves execution time and errors, not necessarily upfront design time.',
        misconceptionTested: 'Planning time as primary automation driver',
      },
    ],
    examTip: 'Network automation #1 driver → **reduce human error** on repetitive, scalable changes.',
  },
  'obj-6.3-source-q002': {
    correct: {
      choiceIndex: 3,
      explanation: 'In spine-leaf, leaf switches connect hosts and uplink only to spines — leaf-to-leaf traffic hairpins through spines, never direct leaf links.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Leaf switches do not interconnect to other leafs — that breaks the spine-leaf model and defeats ECMP fabric design.',
        misconceptionTested: 'Leaf-to-leaf mesh in spine-leaf',
      },
      {
        choiceIndex: 1,
        explanation: 'Production fabrics use multiple spines for redundancy and bisection bandwidth — not a single spine only.',
        misconceptionTested: 'Single spine as spine-leaf rule',
      },
      {
        choiceIndex: 2,
        explanation: 'Spines aggregate leafs — hosts attach at the **leaf** tier, not the spine.',
        misconceptionTested: 'Hosts connecting directly to spine switches',
      },
    ],
    examTip: 'Spine-leaf: **hosts on leaf**, leafs connect **only to spines**, never leaf-to-leaf.',
  },
  'obj-6.4-source-q001': {
    correct: {
      choiceIndex: 2,
      explanation: 'Cisco DNA Center replaced APIC-EM as the campus SDN controller with automation, assurance, and fabric management.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'OpenFlow is a southbound protocol spec — not a replacement management platform for APIC-EM.',
        misconceptionTested: 'OpenFlow as APIC-EM successor product',
      },
      {
        choiceIndex: 1,
        explanation: 'Prime Infrastructure is legacy NMS — DNA Center is the modern APIC-EM replacement for intent-based campus automation.',
        misconceptionTested: 'Prime as APIC-EM replacement',
      },
      {
        choiceIndex: 3,
        explanation: 'SD-WAN (vManage) targets WAN edge — not the campus controller role APIC-EM held.',
        misconceptionTested: 'SD-WAN controller as APIC-EM replacement',
      },
    ],
    examTip: 'APIC-EM successor → **Cisco DNA Center** for campus automation and assurance.',
  },
  'obj-3.6-depth-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'Troubleshoot bottom-up: interface up/up, then ARP/L2 neighbor reachability, then routing table entry for the destination subnet.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'OSPF area, BGP AS, and MPLS labels are advanced — start with link status and basic L2/L3 reachability before IGP/BGP.',
        misconceptionTested: 'Jumping to BGP/MPLS before interface and ARP checks',
      },
      {
        choiceIndex: 2,
        explanation: 'DNS, browser proxy, and Wi-Fi password are upper-layer/client issues — verify L1/L2/L3 path first for IP ping failure.',
        misconceptionTested: 'Starting at application layer for basic ping failure',
      },
      {
        choiceIndex: 3,
        explanation: 'SNMP, syslog, and NTP are management services — they do not diagnose a failed host-to-host ping first.',
        misconceptionTested: 'Management plane checks before connectivity basics',
      },
    ],
    examTip: 'Ping fail troubleshooting order: **interface up/up** → **ARP/neighbor** → **route in table**.',
  },
  '3.6-legacy-q007': {
    correct: {
      choiceIndex: 1,
      explanation: 'Routing table can be correct while L1/L2 is broken — ping the directly connected neighbor fails: check cable, up/up, speed/duplex first.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'OSPF process ID mismatch does not explain failure to ping a directly connected neighbor interface — L1/L2 is first.',
        misconceptionTested: 'OSPF process when direct ping to next-hop fails',
      },
      {
        choiceIndex: 2,
        explanation: 'Hostname has no effect on IP reachability or routing — physical/link layer is the first check.',
        misconceptionTested: 'Hostname config for ping failure to adjacent router',
      },
      {
        choiceIndex: 3,
        explanation: 'NTP does not affect basic IP connectivity to a directly connected peer — verify interface and cabling.',
        misconceptionTested: 'NTP as first check for failed neighbor ping',
      },
    ],
    examTip: 'Good route but **cannot ping connected next-hop** → **L1/L2**: cable, **up/up**, speed/duplex.',
  },
}
