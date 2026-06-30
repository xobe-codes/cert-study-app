/** ASAP-pass scenario gold reviews — hand-authored distractor debriefs. */
export const ASAP_SCENARIO_GOLD = {
  '1.5-c-q2': {
    correct: {
      choiceIndex: 2,
      explanation: 'A known unicast destination is forwarded out only the one port it is mapped to.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Flooding is for unknown destinations. This frame has a known MAC mapped to another port — forward it out that single port only.',
        misconceptionTested: 'Applying unknown-unicast flood behavior to a known CAM entry',
      },
      {
        choiceIndex: 1,
        explanation: 'Switches do not drop known unicast frames by default. With a valid CAM entry, the switch forwards out the mapped egress port.',
        misconceptionTested: 'Assuming the switch discards traffic it could forward',
      },
      {
        choiceIndex: 3,
        explanation: 'Broadcast/multicast flood within a VLAN is different from known unicast forwarding — this is a mapped unicast, not a broadcast decision.',
        misconceptionTested: 'Confusing broadcast flood with known unicast forwarding',
      },
    ],
    examTip: 'Known MAC in CAM → one egress port. Unknown MAC → flood (same VLAN, except ingress).',
  },
  '1.5-c-q5': {
    correct: {
      choiceIndex: 2,
      explanation: 'If source and destination MAC map to the same ingress port, the switch filters (does not forward) the frame.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'There is no other port to forward to — both hosts share the hubbed segment on one switch port, so the frame stays local.',
        misconceptionTested: 'Expecting the switch to forward when source and destination share one port',
      },
      {
        choiceIndex: 1,
        explanation: 'Flooding sends frames to other ports in the VLAN. Same-port traffic never leaves the ingress port.',
        misconceptionTested: 'Using unknown-unicast flood logic on same-port traffic',
      },
      {
        choiceIndex: 3,
        explanation: 'Same-port frames are filtered, not errors. The switch simply does not retransmit what already arrived on that port.',
        misconceptionTested: 'Treating normal same-port behavior as a fault',
      },
    ],
    examTip: 'Same ingress port for source and destination → filter (do not forward).',
  },
  '1.5-c-q10': {
    correct: {
      choiceIndex: 1,
      explanation: 'Until the switch learns the server\'s source MAC, frames addressed to it are unknown unicast and get flooded.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'The switch can still deliver the frame — it floods unknown unicast within the VLAN so the new host can reply and be learned.',
        misconceptionTested: 'Believing an unlearned MAC blocks all delivery',
      },
      {
        choiceIndex: 2,
        explanation: 'Unknown unicast is normal switch behavior, not an error log event. The frame is flooded, not dropped.',
        misconceptionTested: 'Assuming unknown destination means drop/filter',
      },
      {
        choiceIndex: 3,
        explanation: 'Hosts ARP for IP; switches forward Ethernet frames by MAC. The switch floods the frame — it does not originate ARP for the server.',
        misconceptionTested: 'Expecting the switch to ARP before Layer 2 forwarding',
      },
    ],
    examTip: 'Brand-new host, no CAM entry yet → unknown unicast flood until the server sends a frame.',
  },
  '1.5-c-q11': {
    correct: {
      choiceIndex: 2,
      explanation: 'Learning is continuous — the new frame from port 5 updates/relearns the mapping; the stale port-1 entry ages out.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'CAM entries are not permanent. The laptop\'s next frame from port 5 relearns the MAC; the old port-1 mapping ages out or is replaced.',
        misconceptionTested: 'Assuming MAC table entries never move between ports',
      },
      {
        choiceIndex: 1,
        explanation: 'The switch does not flush the entire table on one move — only the affected entry is updated or aged.',
        misconceptionTested: 'Overreacting to a single host move with a full table wipe',
      },
      {
        choiceIndex: 3,
        explanation: 'Port moves are normal; the switch learns from incoming frames — it does not err-disable the new port.',
        misconceptionTested: 'Confusing learning updates with port security shutdown',
      },
    ],
    examTip: 'Move a host → next frame relearns MAC-to-port; stale entry ages out.',
  },
  'obj-2.4-source-q011': {
    correct: {
      choiceIndex: 0,
      explanation: 'LACP requires at least one side in active mode to start negotiation — active on both sides guarantees LACP forms.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Passive on both sides waits forever — neither side initiates LACP. You need active on at least one side (both active is fine).',
        misconceptionTested: 'Expecting passive/passive to negotiate LACP',
      },
      {
        choiceIndex: 2,
        explanation: 'Auto is PAgP terminology, not LACP. This stem asks specifically for LACP between switches.',
        misconceptionTested: 'Mixing PAgP modes with LACP',
      },
      {
        choiceIndex: 3,
        explanation: 'Desirable is also PAgP — not IEEE 802.3ad LACP. Use channel-group mode active/passive for LACP.',
        misconceptionTested: 'Selecting Cisco PAgP modes on an LACP question',
      },
    ],
    examTip: 'LACP = active/passive. PAgP = desirable/auto. Passive + passive never forms a bundle.',
  },
  'obj-5.9-source-q009': {
    correct: {
      choiceIndex: 1,
      explanation: 'WPA2-Enterprise uses 802.1X — the WLC or AP must reach a RADIUS server for user authentication.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'NTP keeps clocks synchronized — it is not required to enable WPA2-Enterprise 802.1X authentication.',
        misconceptionTested: 'Confusing time sync with enterprise WLAN auth',
      },
      {
        choiceIndex: 2,
        explanation: 'PSK is for WPA2-Personal. Enterprise mode uses per-user credentials validated by RADIUS, not one shared key.',
        misconceptionTested: 'Applying personal WPA2 (PSK) to an enterprise deployment',
      },
      {
        choiceIndex: 3,
        explanation: 'Captive portal is guest/web auth flow — not the core requirement for standard WPA2-Enterprise 802.1X.',
        misconceptionTested: 'Substituting guest portal auth for 802.1X enterprise',
      },
    ],
    examTip: 'WPA2-Enterprise → 802.1X + RADIUS. WPA2-Personal → PSK.',
  },
  'obj-5.9-source-q010': {
    correct: {
      choiceIndex: 2,
      explanation: 'TKIP enables WPA/WPA2 mixed or legacy fallback. Disable TKIP to enforce AES-only WPA2.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: '802.1X is the authentication framework — disabling it breaks enterprise auth; it does not control WPA vs WPA2 cipher fallback.',
        misconceptionTested: 'Disabling auth instead of legacy cipher suites',
      },
      {
        choiceIndex: 1,
        explanation: 'AES (CCMP) is what you want to keep — it is the modern WPA2 cipher, not the legacy fallback.',
        misconceptionTested: 'Removing the strong cipher instead of TKIP',
      },
      {
        choiceIndex: 3,
        explanation: 'MAC filtering is a separate layer-2 allow list — it does not prevent WPA falling back to older ciphers.',
        misconceptionTested: 'Using MAC filter as a WPA2 hardening control',
      },
    ],
    examTip: 'WPA2-only (no WPA fallback) → allow AES/CCMP, disable TKIP.',
  },
  'obj-5.9-source-q012': {
    correct: {
      choiceIndex: 1,
      explanation: 'TKIP uses older RC4-based processing and caps throughput on modern radios — AES/CCMP achieves higher rates.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'AES (CCMP) is the modern WPA2 cipher and supports high throughput on current hardware.',
        misconceptionTested: 'Blaming AES for throughput limits',
      },
      {
        choiceIndex: 2,
        explanation: 'CCMP is the AES-based cipher for WPA2 — it is not the legacy bottleneck.',
        misconceptionTested: 'Treating CCMP as legacy like TKIP',
      },
      {
        choiceIndex: 3,
        explanation: 'PSK is an authentication mode (personal vs enterprise), not a cipher that throttles throughput like TKIP.',
        misconceptionTested: 'Confusing PSK auth mode with cipher performance',
      },
    ],
    examTip: 'Throughput exam trap: TKIP = legacy/slower. Prefer WPA2-AES (CCMP).',
  },
  'obj-5.10-source-q001': {
    correct: {
      choiceIndex: 3,
      explanation: 'If the WLAN status is disabled (admin down), clients will not see or join the SSID regardless of other settings.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'SSID beaconing enabled is required for visibility — this choice says it is already enabled, so it is not the problem described.',
        misconceptionTested: 'Picking a healthy setting as the fault',
      },
      {
        choiceIndex: 1,
        explanation: 'Multicast settings affect delivery of multicast traffic — they do not typically hide the SSID from clients.',
        misconceptionTested: 'Blaming multicast for SSID invisibility',
      },
      {
        choiceIndex: 2,
        explanation: 'Radio policy set to all bands should still advertise the SSID — disabled WLAN status is the direct block.',
        misconceptionTested: 'Over-focusing on band policy when the WLAN is admin-down',
      },
    ],
    examTip: 'SSID not visible → check WLAN enabled status first, then beacon/hide SSID settings.',
  },
  'obj-5.10-source-q002': {
    correct: {
      choiceIndex: 0,
      explanation: 'A WPA2-Personal WLAN uses one PSK at a time — either hex or ASCII format, not multiple concurrent keys.',
    },
    incorrect: [
      {
        choiceIndex: 1,
        explanation: 'Cisco WLC WPA2-Personal does not provision separate hex and ASCII PSKs simultaneously — one active key only.',
        misconceptionTested: 'Assuming dual hex+ASCII keys on one WLAN',
      },
      {
        choiceIndex: 2,
        explanation: 'There is not a pool of four PSKs per WLAN — personal mode is one shared key for all clients.',
        misconceptionTested: 'Expecting multiple rotating PSK slots like enterprise policies',
      },
      {
        choiceIndex: 3,
        explanation: 'PSK count is limited by design — not unlimited keys on a single WPA2-Personal SSID.',
        misconceptionTested: 'Treating PSK like per-user enterprise credentials',
      },
    ],
    examTip: 'WPA2-Personal = one PSK (hex OR ASCII). Enterprise = per-user via RADIUS.',
  },
  'obj-5.10-source-q003': {
    correct: {
      choiceIndex: 3,
      explanation: 'WPA2 with AES (CCMP) is the strongest common WPA2 cipher — avoid TKIP/RC4 legacy options.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'WPA-AES is first-generation WPA — WPA2-AES is the stronger, current standard for new deployments.',
        misconceptionTested: 'Stopping at WPA instead of WPA2',
      },
      {
        choiceIndex: 1,
        explanation: 'WPA2-TKIP keeps legacy cipher support — AES/CCMP is stronger and preferred for highest security.',
        misconceptionTested: 'Choosing TKIP under a WPA2 SSID for "security"',
      },
      {
        choiceIndex: 2,
        explanation: 'RC4-based options are legacy — WPA2-AES (CCMP) is the exam answer for strongest WPA2 cipher.',
        misconceptionTested: 'Selecting deprecated RC4 ciphers',
      },
    ],
    examTip: 'Highest WPA2 security → WPA2-AES (CCMP). Disable TKIP when hardening.',
  },
  'obj-5.10-source-q004': {
    correct: {
      choiceIndex: 1,
      explanation: 'WPA2-Personal (PSK) minimizes infrastructure — no RADIUS — while still using modern WPA2 security for a small site.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'WPA-Enterprise requires RADIUS and more infrastructure — opposite of minimizing backend services.',
        misconceptionTested: 'Choosing enterprise auth when minimal infra is required',
      },
      {
        choiceIndex: 2,
        explanation: 'WPA3-Enterprise also needs RADIUS and newer hardware — more complex than WPA2-Personal for a minimal setup.',
        misconceptionTested: 'Over-engineering with WPA3-Enterprise for minimal infra',
      },
      {
        choiceIndex: 3,
        explanation: 'Original WPA-Personal is older than WPA2-Personal — the stem asks for modern security with minimal infrastructure.',
        misconceptionTested: 'Reverting to WPA instead of WPA2-Personal',
      },
    ],
    examTip: 'Small site, minimal infra, shared key OK → WPA2-Personal. Enterprise/users → WPA2-Enterprise + RADIUS.',
  },
  'obj-6.1-source-q002': {
    correct: {
      choiceIndex: 2,
      explanation: 'At scale (20 routers), a Python script (Ansible, Netmiko, etc.) is repeatable, auditable, and far faster than manual paste.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Manual copy/paste across 20 devices is error-prone and does not scale — automation is the network engineer approach.',
        misconceptionTested: 'Treating repetitive CLI as a manual-only task',
      },
      {
        choiceIndex: 1,
        explanation: 'Spreadsheets do not execute or validate IOS — they are worse than purpose-built automation for device config.',
        misconceptionTested: 'Using office tools instead of network automation',
      },
      {
        choiceIndex: 3,
        explanation: 'Two people checking manual work still scales linearly with device count — scripts reduce time and human error.',
        misconceptionTested: 'Doubling manual labor instead of automating',
      },
    ],
    examTip: 'Many devices, same change → script/API (Python/Ansible), not manual CLI paste.',
  },
  'obj-6.1-source-q006': {
    correct: {
      choiceIndex: 3,
      explanation: 'After production release, monitor outcomes — logs, metrics, alerts — to catch regressions and validate the automation.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Testing belongs before production release — post-release focus shifts to monitoring live behavior.',
        misconceptionTested: 'Running test phase after go-live',
      },
      {
        choiceIndex: 1,
        explanation: 'Building is complete once deployed — the lifecycle step after release is operations/monitoring.',
        misconceptionTested: 'Confusing build phase with post-deploy ops',
      },
      {
        choiceIndex: 2,
        explanation: 'Planning happens upfront — after release you observe whether the change met intent in production.',
        misconceptionTested: 'Re-planning instead of monitoring outcomes',
      },
    ],
    examTip: 'Automation lifecycle: plan → build → test → deploy → monitor.',
  },
  '3.3-q4': {
    correct: {
      choiceIndex: 1,
      explanation: 'A static route requires its next-hop to be reachable via another routing table entry. If not reachable, the static is not installed.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'Static routes do not require OSPF — they install when the next-hop is reachable, regardless of dynamic protocol.',
        misconceptionTested: 'Believing static routes depend on OSPF',
      },
      {
        choiceIndex: 2,
        explanation: 'Exit-interface-only statics are valid on point-to-point links — the issue here is an unreachable next-hop subnet.',
        misconceptionTested: 'Misdiagnosing as exit-interface requirement',
      },
      {
        choiceIndex: 3,
        explanation: 'The mask is fine — the static fails recursive lookup because the next-hop network is disconnected/unreachable.',
        misconceptionTested: 'Blaming subnet mask instead of next-hop reachability',
      },
    ],
    examTip: 'Static missing from table → check next-hop reachability first (recursive lookup).',
  },
  '3.3-q8': {
    correct: {
      choiceIndex: 1,
      explanation: 'On Ethernet without a next-hop IP, the router treats every destination as directly connected and ARP-resolves each one — inefficient on multi-access segments.',
    },
    incorrect: [
      {
        choiceIndex: 0,
        explanation: 'The route typically stays in the table — the problem is inefficient ARP behavior, not disappearance.',
        misconceptionTested: 'Expecting the route to vanish instead of ARP inefficiency',
      },
      {
        choiceIndex: 2,
        explanation: 'Administrative distance 255 means unusable — a normal exit-interface static uses AD 1, not 255.',
        misconceptionTested: 'Confusing AD 255 with exit-interface statics',
      },
      {
        choiceIndex: 3,
        explanation: 'OSPF does not resolve static next-hops — the router ARP-requests each destination on the multi-access segment.',
        misconceptionTested: 'Expecting OSPF to fix static ARP behavior',
      },
    ],
    examTip: 'Multi-access Ethernet static → use next-hop IP, not exit interface only (avoids ARP for every destination).',
  },
}
