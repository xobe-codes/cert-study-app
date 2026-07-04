/** Gold review polish — high-traffic WLAN + automation stems (debrief depth). */
export const WLAN_AUTOMATION_POLISH_GOLD = {
  'obj-6.3-source-q005': {
    correct: {
      choiceIndex: 1,
      explanation: '**Southbound** APIs (NETCONF/RESTCONF) push configuration from controller to devices — that is how SDN programs the network.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'Northbound APIs face applications/orchestration — they do not program ASICs directly.', misconceptionTested: 'Swapping northbound and southbound' },
      { choiceIndex: 2, explanation: 'SNMP is legacy monitoring — SDN southbound is model-driven config (YANG/NETCONF), not SNMP SETs.', misconceptionTested: 'Using SNMP as SDN southbound' },
      { choiceIndex: 3, explanation: 'CDP discovers neighbors — unrelated to controller-to-device configuration.', misconceptionTested: 'Discovery protocol as SDN API' },
    ],
    examTip: 'Northbound = apps → controller. Southbound = controller → devices (NETCONF/RESTCONF/OpenFlow).',
  },
  'obj-6.4-source-q003': {
    correct: {
      choiceIndex: 2,
      explanation: 'DNA Center **Assurance** correlates client/onboarding/health events — wired and wireless — for troubleshooting.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'Design is planning — Assurance is ongoing health/telemetry, not initial site survey.', misconceptionTested: 'Confusing design with assurance' },
      { choiceIndex: 1, explanation: 'Provision deploys policy — Assurance monitors outcomes after deploy.', misconceptionTested: 'Provision vs assurance' },
      { choiceIndex: 3, explanation: 'Licensing portal is commercial — not the Assurance analytics pane.', misconceptionTested: 'License UI as assurance' },
    ],
    examTip: 'DNA Assurance = **health analytics** post-deploy (clients, onboarding, QoE).',
  },
  'obj-2.6-source-q002': {
    correct: {
      choiceIndex: 3,
      explanation: '**Monitor mode** lets the AP scan channels for interference (Bluetooth, rogue APs) without serving client traffic.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'BT mode is not a standard Cisco AP RF survey mode — use **monitor** for spectrum/interference analysis.', misconceptionTested: 'Invented AP mode name' },
      { choiceIndex: 1, explanation: 'Sniffing mode is not the CCNA term — **monitor mode** is used for dedicated scanning.', misconceptionTested: 'Generic sniffing label' },
      { choiceIndex: 2, explanation: 'Analysis mode is vague — Cisco lightweight APs use **monitor mode** for site survey/interference.', misconceptionTested: 'Analysis vs monitor naming' },
    ],
    examTip: 'RF survey / interference → AP **monitor mode** (no client service on that radio).',
  },
  'obj-2.7-source-q001': {
    correct: {
      choiceIndex: 2,
      explanation: '**EtherChannel** bundles parallel links into one logical L2 path — adds bandwidth between router and controller switch.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'Routers can use **L3 port-channels** or routed EtherChannel — multiple links can be aggregated.', misconceptionTested: 'Cannot aggregate router links' },
      { choiceIndex: 1, explanation: 'RIP is a routing protocol — it does not bond physical interfaces for bandwidth.', misconceptionTested: 'Routing protocol as link bonding' },
      { choiceIndex: 3, explanation: 'Inter-VLAN routing is L3 — the stem asks for **more bandwidth** on parallel Gig links (L2 bundle).', misconceptionTested: 'L3 routing instead of link aggregation' },
    ],
    examTip: 'More bandwidth between two switches/routers → **EtherChannel/port-channel**.',
  },
  'obj-5.9-source-q003': {
    correct: {
      choiceIndex: 1,
      explanation: '**MIC** in WPA detects tampered/replayed frames — integrity separate from AES encryption.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'TKIP mixes keys — MIC is the integrity check that catches replays.', misconceptionTested: 'TKIP vs MIC role' },
      { choiceIndex: 2, explanation: 'AES-CCMP provides confidentiality in WPA2 — MIC is the WPA-era integrity mechanism.', misconceptionTested: 'AES when MIC asked' },
      { choiceIndex: 3, explanation: 'CRC is Ethernet FCS — not wireless frame integrity control.', misconceptionTested: 'Ethernet CRC on Wi-Fi' },
    ],
    examTip: 'WPA integrity/replay → **MIC**. WPA2 confidentiality → **AES-CCMP**.',
  },
  'obj-6.5-source-q003': {
    correct: {
      choiceIndex: 0,
      explanation: '**NETCONF** (often with YANG models) is the modern model-driven replacement for SNMP-style polling for config/state.',
    },
    incorrect: [
      { choiceIndex: 1, explanation: '**Syslog** exports events — it does not replace SNMP for structured device management APIs.', misconceptionTested: 'Syslog as SNMP replacement' },
      { choiceIndex: 2, explanation: '**REST** is an architectural style — NETCONF is the named SNMP successor in automation discussions.', misconceptionTested: 'REST label without NETCONF' },
      { choiceIndex: 3, explanation: '**SSH** provides secure CLI — not a structured management protocol like NETCONF.', misconceptionTested: 'SSH as management protocol' },
    ],
    examTip: 'SNMP successor on exams → **NETCONF** (+ YANG). RESTCONF combines REST + NETCONF ideas.',
  },
  'obj-6.6-source-q004': {
    correct: {
      choiceIndex: 0,
      explanation: '**Ansible** is **agentless** — pushes playbooks over SSH/WinRM without a persistent agent on Linux targets.',
    },
    incorrect: [
      { choiceIndex: 1, explanation: '**Puppet** requires a **Puppet agent** on managed nodes — not agentless.', misconceptionTested: 'Puppet as agentless tool' },
      { choiceIndex: 2, explanation: '**Chef** uses a **Chef client agent** on each node — Ansible does not.', misconceptionTested: 'Chef as agentless tool' },
      { choiceIndex: 3, explanation: '**DNA Center** is a management platform — the agentless config tool here is **Ansible**.', misconceptionTested: 'DNA Center as agentless config answer' },
    ],
    examTip: 'Agentless → **Ansible**. Agent-based → **Chef/Puppet** clients on nodes.',
  },
  'obj-2.8-source-q003': {
    correct: {
      choiceIndex: 3,
      explanation: '**TACACS+** uses **TCP port 49** — separates authentication, authorization, and accounting (Cisco AAA).',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'UDP/69 is **TFTP** — not TACACS+.', misconceptionTested: 'TFTP port for AAA' },
      { choiceIndex: 1, explanation: 'TCP/74 is not the TACACS+ port — memorize **49/TCP**.', misconceptionTested: 'Wrong TCP port' },
      { choiceIndex: 2, explanation: 'UDP/47 is not TACACS+ — RADIUS uses **UDP 1812/1813**.', misconceptionTested: 'RADIUS port for TACACS+' },
    ],
    examTip: 'TACACS+ → **TCP/49**. RADIUS → **UDP/1812** (auth) / **1813** (acct).',
  },
}
