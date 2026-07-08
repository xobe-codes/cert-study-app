/** Gold review wave 15 — skill/design stems that previously fell back to generator debriefs. */
export const WAVE15_SKILL_DESIGN_GOLD = {
  '1.12-design-virt': {
    correct: {
      choiceIndex: 0,
      explanation: '**NFV** runs firewalls, routers, and other functions as **software on commodity servers** instead of dedicated appliances.',
    },
    incorrect: [
      { choiceIndex: 1, explanation: 'NFV still needs **physical fabric and cabling** — it virtualizes the *function*, not the wires.', misconceptionTested: 'NFV eliminates cabling' },
      { choiceIndex: 2, explanation: 'NFV does not collapse **L3 into L2** — routing/services still exist, just as VMs/containers.', misconceptionTested: 'NFV replaces routing with switching' },
      { choiceIndex: 3, explanation: 'IP addressing remains mandatory — NFV does not remove **Layer 3 identity**.', misconceptionTested: 'NFV removes IP' },
    ],
    examTip: 'NFV = **network functions as software** on COTS servers (not appliance hardware lock-in).',
  },
  '2.6-design-wlc': {
    correct: {
      choiceIndex: 0,
      explanation: '**FlexConnect** keeps **local switching** at the branch while a central **WLC** still manages SSIDs/policy — WAN dropouts do not blackhole all client traffic.',
    },
    incorrect: [
      { choiceIndex: 1, explanation: 'Mesh without Ethernet is a different AP mode family — **FlexConnect** assumes a local LAN for client switching.', misconceptionTested: 'FlexConnect = mesh-only' },
      { choiceIndex: 2, explanation: '**Sniffer/monitor** modes survey RF — they do not provide FlexConnect local switching for clients.', misconceptionTested: 'FlexConnect confused with sniffer' },
      { choiceIndex: 3, explanation: 'OOB management without SSIDs is not FlexConnect — FlexConnect exists to serve **client WLANs** locally.', misconceptionTested: 'FlexConnect as management-only' },
    ],
    examTip: 'Branch + central WLC + local data path → **FlexConnect**.',
  },
  '4.4-design-snmp': {
    correct: {
      choiceIndex: 0,
      explanation: 'The **SNMP agent** on the managed device owns MIBs and originates **traps/informs** toward the NMS.',
    },
    incorrect: [
      { choiceIndex: 1, explanation: 'The **manager/NMS** receives traps — it does not originate device traps for itself.', misconceptionTested: 'Manager sends traps' },
      { choiceIndex: 2, explanation: '**Syslog** is a separate telemetry path — SNMP traps come from the **agent**.', misconceptionTested: 'Syslog as SNMP agent' },
      { choiceIndex: 3, explanation: '**DHCP relay** forwards broadcasts — unrelated to SNMP trap generation.', misconceptionTested: 'Relay as SNMP source' },
    ],
    examTip: 'Agent on device → traps/informs → **NMS/manager**.',
  },
  '4.9-design-tftp': {
    correct: {
      choiceIndex: 0,
      explanation: '**TFTP** is lightweight UDP with **no authentication** — classic for reachable LAN IOS image copy on exams.',
    },
    incorrect: [
      { choiceIndex: 1, explanation: '**HTTPS with pinning** adds TLS/auth overhead — the stem asked for minimal overhead without auth.', misconceptionTested: 'HTTPS for no-auth backup' },
      { choiceIndex: 2, explanation: '**SCP** is secure and authenticated — heavier than the “no auth / low overhead” requirement.', misconceptionTested: 'SCP as lightest option' },
      { choiceIndex: 3, explanation: '**SNMP set** is for MIB writes — not the standard IOS image transfer method.', misconceptionTested: 'SNMP for image backup' },
    ],
    examTip: 'LAN image copy, simple/no auth → **TFTP** (know insecurity trade-off).',
  },
  '4.10-design-cloud': {
    correct: {
      choiceIndex: 0,
      explanation: 'Cloud/controller management adds **reachability dependence** — if cloud/path fails, central policy push and monitoring degrade.',
    },
    incorrect: [
      { choiceIndex: 1, explanation: 'Devices still need **management addressing** — cloud does not remove IP identity.', misconceptionTested: 'Cloud removes device IPs' },
      { choiceIndex: 2, explanation: '**Credentials/secrets** remain required — cloud does not eliminate authentication.', misconceptionTested: 'Cloud removes passwords' },
      { choiceIndex: 3, explanation: 'Cloud helps consistency but does **not guarantee zero drift** without process/tools.', misconceptionTested: 'Cloud guarantees no drift' },
    ],
    examTip: 'Cloud-managed trade-off = **controller/cloud reachability** dependency.',
  },
  '5.8-design-wpa': {
    correct: {
      choiceIndex: 0,
      explanation: '**WPA2-Enterprise** uses **802.1X/EAP** so each user authenticates individually via RADIUS.',
    },
    incorrect: [
      { choiceIndex: 1, explanation: '**WPA2-Personal/PSK** shares one passphrase — not per-user 802.1X.', misconceptionTested: 'PSK as enterprise auth' },
      { choiceIndex: 2, explanation: '**Open SSID** has no crypto/auth suitable for enterprise users.', misconceptionTested: 'Open as enterprise' },
      { choiceIndex: 3, explanation: '**WEP** is obsolete and weak — not modern enterprise 802.1X.', misconceptionTested: 'WEP as enterprise' },
    ],
    examTip: 'Per-user wireless auth → **WPA2/WPA3-Enterprise (802.1X)**.',
  },
  '5.10-design-vpn': {
    correct: {
      choiceIndex: 0,
      explanation: '**Site-to-site IPsec** encrypts traffic between **gateway routers/firewalls** for branch↔HQ connectivity.',
    },
    incorrect: [
      { choiceIndex: 1, explanation: '**SSL VPN portals** typically serve **remote-access users**, not always-on site gateways.', misconceptionTested: 'SSL portal as site-to-site' },
      { choiceIndex: 2, explanation: '**GRE without encryption** tunnels but does not meet confidentiality by itself.', misconceptionTested: 'GRE alone as secure VPN' },
      { choiceIndex: 3, explanation: '**Telnet reverse proxy** is not a site-to-site VPN design.', misconceptionTested: 'Telnet as VPN' },
    ],
    examTip: 'Branch↔HQ always-on crypto → **site-to-site IPsec**.',
  },
  '5.11-design-segment': {
    correct: {
      choiceIndex: 0,
      explanation: 'Segmentation **contains blast radius** — compromise in one VLAN/VRF/zone cannot freely traverse the whole LAN.',
    },
    incorrect: [
      { choiceIndex: 1, explanation: 'Segmentation does not remove **routing** — it structures where routing/policy apply.', misconceptionTested: 'Segmentation kills routing' },
      { choiceIndex: 2, explanation: 'Larger broadcast domains **increase** exposure — opposite of segmentation goals.', misconceptionTested: 'Bigger broadcast = safer' },
      { choiceIndex: 3, explanation: 'Segmentation often **increases** need for ACLs/firewalls between zones — it does not remove them.', misconceptionTested: 'Segmentation removes ACLs' },
    ],
    examTip: 'Segmentation goal = **limit lateral movement / blast radius**.',
  },
  '6.4-design-dna': {
    correct: {
      choiceIndex: 0,
      explanation: '**DNA Center** adds **intent/templates, assurance, and centralized lifecycle** versus per-box CLI staffing.',
    },
    incorrect: [
      { choiceIndex: 1, explanation: 'Devices still run **IOS-XE images** — DNA does not delete the need for images.', misconceptionTested: 'DNA removes IOS images' },
      { choiceIndex: 2, explanation: 'VLANs remain part of campus design — DNA does not abolish them.', misconceptionTested: 'DNA eliminates VLANs' },
      { choiceIndex: 3, explanation: 'DNA still rides **IP/TCP** underlays — it is not a proprietary L3 replacement.', misconceptionTested: 'DNA replaces TCP/IP' },
    ],
    examTip: 'DNA value = **central intent + assurance**, not “no more networking basics”.',
  },
  '6.5-design-rest': {
    correct: {
      choiceIndex: 0,
      explanation: 'REST exposes resources over **stateless HTTP** verbs (**GET/POST/PUT/DELETE**) — common for controller APIs.',
    },
    incorrect: [
      { choiceIndex: 1, explanation: 'REST is HTTP/JSON oriented — not a proprietary always-on binary-only socket model.', misconceptionTested: 'REST is binary-only' },
      { choiceIndex: 2, explanation: '**SNMPv1** is legacy monitoring — REST controllers use HTTP APIs, not SNMP exclusive.', misconceptionTested: 'REST requires SNMPv1' },
      { choiceIndex: 3, explanation: 'Console remains a break-glass path — REST exists for **remote programmable** changes.', misconceptionTested: 'REST requires console only' },
    ],
    examTip: 'Controller REST = **stateless HTTP methods** on resources.',
  },
}
