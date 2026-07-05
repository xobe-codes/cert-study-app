/** Gold debrief polish — placement blueprint trap stems (fixed diagnostic misses). */
export const PLACEMENT_TRAP_GOLD = {
  '1.6-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: '**/26** leaves **6 host bits** → 2⁶ − 2 = **62** usable hosts (subtract network + broadcast).',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '**64** is 2⁶ total addresses — you must subtract network and broadcast → **62** usable.', misconceptionTested: 'Forgetting to subtract network/broadcast' },
      { choiceIndex: 2, explanation: '**30** fits a **/27**, not /26 — recount host bits after the prefix.', misconceptionTested: 'Wrong prefix → host count' },
      { choiceIndex: 3, explanation: '**126** is a **/25** host count — /26 is always **62** usable.', misconceptionTested: 'Off-by-prefix host math' },
    ],
    examTip: 'Usable hosts = 2^(32−prefix) − 2. /26 → **62**.',
  },
  '1.5-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'The switch learns from the **source MAC** on ingress — the sender of the frame.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'Destination MAC is who the frame is **for** — learning uses **source** on the port where the frame arrived.', misconceptionTested: 'Recording destination instead of source' },
      { choiceIndex: 2, explanation: 'Switches learn **one MAC per port entry** from the source address — not both addresses in the frame.', misconceptionTested: 'Learning both MACs' },
      { choiceIndex: 3, explanation: 'MAC learning is Layer 2 — IP addresses are not stored in the CAM table.', misconceptionTested: 'CAM table stores IP' },
    ],
    examTip: 'MAC learning → **source MAC** on the **ingress port**.',
  },
  '2.1-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'A **VLAN** is a **logical broadcast domain** — one VLAN = one broadcast boundary at Layer 2.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '**Collision domain** is legacy hub semantics — switches separate collisions per port; VLANs separate **broadcasts**.', misconceptionTested: 'VLAN = collision domain' },
      { choiceIndex: 2, explanation: 'VLANs are **logical**, not a physical cable type.', misconceptionTested: 'Physical media confusion' },
      { choiceIndex: 3, explanation: 'Routing protocols run at Layer 3 — VLANs segment Layer 2 broadcast domains.', misconceptionTested: 'L3 protocol for L2 segmentation' },
    ],
    examTip: 'VLAN = **broadcast domain**. Router (or SVI) needed between VLANs.',
  },
  'obj-2.3-source-q001': {
    correct: {
      choiceIndex: 1,
      explanation: '**LLDP** (IEEE 802.1AB) is the vendor-neutral neighbor discovery standard — CDP is Cisco-proprietary.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '**CDP** is Cisco-only — the stem asks for the **IEEE standard** → **LLDP**.', misconceptionTested: 'Cisco CDP on IEEE question' },
      { choiceIndex: 2, explanation: '**802.1b** is not the LLDP standard — use **802.1AB (LLDP)**.', misconceptionTested: 'Wrong 802.1 letter' },
      { choiceIndex: 3, explanation: '**802.1a** is unrelated — neighbor discovery IEEE standard is **LLDP**.', misconceptionTested: 'Invented 802.1 variant' },
    ],
    examTip: 'Multi-vendor neighbor discovery → **LLDP**. Cisco-only → **CDP**.',
  },
  '3.1-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'Routing table code **O** = **OSPF** (dynamic). **C** connected, **S** static, **D** EIGRP.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '**Connected** routes use code **C**, not **O**.', misconceptionTested: 'O means connected' },
      { choiceIndex: 2, explanation: '**Static** routes show **S** — **O** is OSPF.', misconceptionTested: 'O means static' },
      { choiceIndex: 3, explanation: '**EIGRP** uses **D** (dual) — **O** is exclusively OSPF in IOS tables.', misconceptionTested: 'O means EIGRP' },
    ],
    examTip: 'Codes: **C** connected · **S** static · **O** OSPF · **D** EIGRP.',
  },
  '3.4-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: '**OSPF** is a **link-state** IGP — routers share LSAs and build a common topology map (SPF).',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '**Distance vector** describes RIP/EIGRP-style updates — OSPF is **link-state**.', misconceptionTested: 'OSPF as distance vector' },
      { choiceIndex: 2, explanation: '**Path vector** is BGP (inter-AS) — OSPF is intra-domain **link-state**.', misconceptionTested: 'OSPF as path vector' },
      { choiceIndex: 3, explanation: '**Static** is admin-configured routes — OSPF is a **dynamic** routing protocol.', misconceptionTested: 'Dynamic protocol labeled static' },
    ],
    examTip: 'OSPF = **link-state** · RIP = distance vector · BGP = path vector.',
  },
  '4.1-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: '**NAT** translates **private ↔ public** addresses so internal hosts reach the Internet with routable addresses.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'Encryption is **IPsec/VPN** — NAT only changes addresses/port mappings.', misconceptionTested: 'NAT encrypts traffic' },
      { choiceIndex: 2, explanation: 'Inter-VLAN routing uses a **router/L3 switch** — NAT is address translation at the edge.', misconceptionTested: 'NAT routes VLANs' },
      { choiceIndex: 3, explanation: '**DHCP** assigns addresses — **NAT** rewrites them on the way out.', misconceptionTested: 'NAT vs DHCP' },
    ],
    examTip: 'Private inside → **NAT** → public outside. PAT overloads one public IP.',
  },
  'obj-4.5-source-q001': {
    correct: {
      choiceIndex: 3,
      explanation: '**Syslog** ships log messages to a collector on **UDP/514** (unreliable but low overhead).',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '**UDP/161** is **SNMP** polling — syslog is **UDP/514**.', misconceptionTested: 'SNMP port for syslog' },
      { choiceIndex: 1, explanation: '**TCP/162** is **SNMP traps** — syslog uses **UDP/514**.', misconceptionTested: 'SNMP trap port' },
      { choiceIndex: 2, explanation: '**UDP/162** is SNMP trap/inform — not syslog.', misconceptionTested: '162 for syslog' },
    ],
    examTip: 'Syslog **514/udp** · SNMP **161/udp** poll · traps **162**.',
  },
  'obj-5.1-source-q001': {
    correct: {
      choiceIndex: 1,
      explanation: 'The **perimeter** is the outer security boundary — where external traffic meets the corporate network.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '**DMZ** is a **zone inside** the perimeter for semi-trusted servers — not the outside edge itself.', misconceptionTested: 'DMZ = outside firewall' },
      { choiceIndex: 2, explanation: '**Internal** is trusted LAN **inside** the firewall.', misconceptionTested: 'Internal as outside' },
      { choiceIndex: 3, explanation: '**Trusted** describes high-trust segments — the stem asks for the **outside** boundary.', misconceptionTested: 'Trusted zone for Internet edge' },
    ],
    examTip: 'Outside firewall → **perimeter**. Public servers → **DMZ** inside it.',
  },
  '5.5-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: 'ACLs evaluate **top-down** — **first match wins**; implicit **deny any** at the end.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'ACLs are **not** bottom-up — order matters; put specific permits before broad denies.', misconceptionTested: 'Bottom-up ACL processing' },
      { choiceIndex: 2, explanation: 'IOS does **not** auto-sort by specificity — you must order lines correctly.', misconceptionTested: 'Auto most-specific-first' },
      { choiceIndex: 3, explanation: 'Evaluation is deterministic top-down — never random.', misconceptionTested: 'Random ACL match' },
    ],
    examTip: 'ACL order trap → **first match wins**. Place explicit permits before catch-all deny.',
  },
  'obj-5.6-source-q008': {
    correct: {
      choiceIndex: 2,
      explanation: '**/12** on 172.16.0.0 → wildcard **0.15.255.255** (0=must match, 1=don\'t care).',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '**255.240.0.0** is a **subnet mask** — ACL fields need **wildcard**, not mask.', misconceptionTested: 'Subnet mask in wildcard field' },
      { choiceIndex: 1, explanation: '**0.0.240.255** does not align to a /12 boundary — recalc from prefix length.', misconceptionTested: 'Wrong /12 wildcard' },
      { choiceIndex: 3, explanation: '**255.3.0.0** is not the inverse of /12 — use **0.15.255.255**.', misconceptionTested: 'Random wildcard guess' },
    ],
    examTip: 'Wildcard = inverse of mask. /12 → **0.15.255.255** for 172.16.0.0/12.',
  },
  'obj-6.1-source-q001': {
    correct: {
      choiceIndex: 1,
      explanation: 'Automation gives a **repeatable, reproducible** outcome — same intent across many devices reduces drift.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'Done well, automation **reduces** misconfiguration — the trap is choosing the negative outcome.', misconceptionTested: 'Automation increases errors' },
      { choiceIndex: 2, explanation: 'Vague benefit — CCNA wants **reproducible** deployments, not just “fewer problems”.', misconceptionTested: 'Generic “fewer problems”' },
      { choiceIndex: 3, explanation: '**Less work** can be true but is not the exam’s primary reason — **reproducibility** is.', misconceptionTested: 'Laziness over reproducibility' },
    ],
    examTip: 'Network automation → **consistent, reproducible** configs (IaC, templates, APIs).',
  },
  'obj-6.5-source-q001': {
    correct: {
      choiceIndex: 1,
      explanation: 'Device **API reference** documents objects, methods, and parameters your script can call.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'GUI layout does not define programmatic control — read the **API** docs.', misconceptionTested: 'UI layout for automation' },
      { choiceIndex: 2, explanation: 'You rarely need full **source code** — vendor **API/YANG/REST** references are authoritative.', misconceptionTested: 'Source code over API docs' },
      { choiceIndex: 3, explanation: 'Storage internals are irrelevant — automation targets published **APIs**.', misconceptionTested: 'Device storage research' },
    ],
    examTip: 'Automate via **RESTCONF/NETCONF/API** — start with the vendor **API reference**.',
  },
}
