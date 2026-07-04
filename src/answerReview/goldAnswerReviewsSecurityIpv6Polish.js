/** Gold review polish — security, IPv6, routing, automation stems (debrief depth). */
export const SECURITY_IPV6_POLISH_GOLD = {
  'obj-5.3-source-q001': {
    correct: {
      choiceIndex: 2,
      explanation: '**enable secret** stores the privileged EXEC password as a one-way hash — preferred over cleartext **enable password**.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '**password enable** is invalid syntax — privileged password uses **enable secret** or **enable password**.', misconceptionTested: 'Invented password subcommand order' },
      { choiceIndex: 1, explanation: '**enable Password20!** misses the **secret** keyword — IOS expects **enable secret** for hashed storage.', misconceptionTested: 'Omitting secret keyword' },
      { choiceIndex: 3, explanation: '**secret enable** reverses the keyword order — correct form is **enable secret**.', misconceptionTested: 'Reversed enable/secret tokens' },
    ],
    examTip: 'Privileged mode → **enable secret** (hashed). Line/login passwords are separate.',
  },
  'obj-5.4-source-q002': {
    correct: {
      choiceIndex: 1,
      explanation: '**service password-encryption** obfuscates remaining cleartext passwords in **show run** — does not replace **enable secret** hashing.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '**password encryption** is not global service syntax — use **service password-encryption**.', misconceptionTested: 'Wrong global encryption command' },
      { choiceIndex: 2, explanation: '**service encryption** is incomplete — the IOS command is **service password-encryption**.', misconceptionTested: 'Truncated service command' },
      { choiceIndex: 3, explanation: '**password-encryption service** reverses tokens — memorize **service password-encryption**.', misconceptionTested: 'Reversed service keywords' },
    ],
    examTip: 'Cleartext in show run → **service password-encryption**. Best practice: **enable secret** + SSH.',
  },
  'obj-5.6-source-q008': {
    correct: {
      choiceIndex: 2,
      explanation: '**/12** in 172.16.0.0/12 locks the first **12 bits** — wildcard **0.15.255.255** (0=match, 1=ignore).',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '**255.240.0.0** is a **subnet mask** — ACLs use **wildcard** (inverse logic).', misconceptionTested: 'Subnet mask in ACL wildcard field' },
      { choiceIndex: 1, explanation: '**0.0.240.255** does not match a /12 boundary — /12 needs **0.15.255.255**.', misconceptionTested: 'Wrong wildcard for /12' },
      { choiceIndex: 3, explanation: '**255.3.0.0** is not the inverse of a /12 mask — recalc from prefix length.', misconceptionTested: 'Random wildcard guess' },
    ],
    examTip: 'Wildcard = inverse of mask: /12 → **0.15.255.255** for 172.16.0.0/12.',
  },
  'obj-5.10-source-q002': {
    correct: {
      choiceIndex: 0,
      explanation: 'WPA2-PSK WLANs use **one PSK** per SSID (hex or ASCII passphrase) — not multiple concurrent keys.',
    },
    incorrect: [
      { choiceIndex: 1, explanation: 'Cisco WLC does not assign separate hex **and** ASCII PSKs simultaneously for one WLAN.', misconceptionTested: 'Dual PSK types per SSID' },
      { choiceIndex: 2, explanation: 'Four PSKs is not standard WPA2-PSK personal — one shared key per WLAN.', misconceptionTested: 'Multiple PSK slots' },
      { choiceIndex: 3, explanation: 'PSK count is limited — enterprise uses **802.1X**, not unlimited PSKs.', misconceptionTested: 'Unlimited PSK on personal WLAN' },
    ],
    examTip: 'WPA2 personal = **one PSK** per SSID. Enterprise = **802.1X/RADIUS**.',
  },
  'obj-5.1-source-q002': {
    correct: {
      choiceIndex: 0,
      explanation: '**DMZ** hosts public services (web/DNS) behind a firewall — more exposed than internal, more protected than open Internet.',
    },
    incorrect: [
      { choiceIndex: 1, explanation: '**Perimeter** is the boundary concept — the named zone for semi-trusted servers is **DMZ**.', misconceptionTested: 'Perimeter label vs DMZ zone' },
      { choiceIndex: 2, explanation: '**Internal** is trusted LAN — DMZ is intentionally reachable from outside.', misconceptionTested: 'Internal zone for public servers' },
      { choiceIndex: 3, explanation: '**Trusted** describes high-trust segments — DMZ is lower trust than internal.', misconceptionTested: 'Trusted for Internet-facing subnet' },
    ],
    examTip: 'Public servers behind firewall → **DMZ** (semi-trusted).',
  },
  'obj-5.7-source-q002': {
    correct: {
      choiceIndex: 0,
      explanation: '**Double tagging** exploits **native VLAN** — attacker tags twice to hop VLANs on misconfigured trunks.',
    },
    incorrect: [
      { choiceIndex: 1, explanation: '**VLAN traversal** is vague — CCNA names **double tagging** on native VLAN.', misconceptionTested: 'Generic traversal term' },
      { choiceIndex: 2, explanation: '**Trunk popping** is not the standard CCNA attack name — use **double tagging**.', misconceptionTested: 'Invented attack name' },
      { choiceIndex: 3, explanation: 'DoS is possible but the stem targets **native VLAN VLAN-hopping** — **double tagging**.', misconceptionTested: 'DoS instead of VLAN hop' },
    ],
    examTip: 'Native VLAN attack → **double tagging**. Mitigate: unique native VLAN, do not use VLAN 1.',
  },
  '1.9-c-q1': {
    correct: {
      choiceIndex: 1,
      explanation: '**2000::/3** is global unicast (public IPv6) — routable on the Internet.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '**FE80::/10** is **link-local** — not routed beyond the segment.', misconceptionTested: 'Link-local as global' },
      { choiceIndex: 2, explanation: '**FC00::/7** is **unique local** (private) — like RFC1918, not public global.', misconceptionTested: 'ULA as global unicast' },
      { choiceIndex: 3, explanation: '**FF00::/8** is **multicast** — not unicast host addressing.', misconceptionTested: 'Multicast range as unicast' },
    ],
    examTip: 'Global unicast → **2000::/3**. Link-local → **fe80::/10**. ULA → **fc00::/7**.',
  },
  '1.8-c-q1': {
    correct: {
      choiceIndex: 2,
      explanation: 'IPv6 addresses are **128 bits** (8 hextets × 16 bits) — four times longer than 32-bit IPv4.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '**32 bits** is **IPv4** length — IPv6 is **128 bits**.', misconceptionTested: 'IPv4 length on IPv6 stem' },
      { choiceIndex: 1, explanation: '**64 bits** is often a host/interface portion (EUI-64) — full address is **128 bits**.', misconceptionTested: 'Interface ID length as full address' },
      { choiceIndex: 3, explanation: '**256 bits** is not used for IPv6 addresses on CCNA.', misconceptionTested: 'Doubling 128 incorrectly' },
    ],
    examTip: 'IPv6 = **128-bit** addresses. IPv4 = **32-bit**.',
  },
  'obj-3.3-source-q004': {
    correct: {
      choiceIndex: 2,
      explanation: '**Static routes** are manual per-prefix — operational burden grows quickly as sites and prefixes multiply.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: '**RIP** scales better than manual statics in growing networks — still limited, but not per-prefix CLI.', misconceptionTested: 'RIP as highest admin burden' },
      { choiceIndex: 1, explanation: '**OSPF** auto-learns topology — static routing is the manual choice that scales poorly.', misconceptionTested: 'OSPF as manual per-link config' },
      { choiceIndex: 3, explanation: 'A single **default route** is one static — stem asks which technique grows with every new subnet.', misconceptionTested: 'Default route as only static pain' },
    ],
    examTip: 'Manual per-network routes → **static**. Large networks → **OSPF/EIGRP**.',
  },
  'obj-6.2-source-q001': {
    correct: {
      choiceIndex: 0,
      explanation: 'Centralized **controller policy** can enforce consistent security/QoS — a cited benefit of controller-based networking.',
    },
    incorrect: [
      { choiceIndex: 1, explanation: 'Controllers do not magically remove **all** problems — they centralize control, not eliminate faults.', misconceptionTested: 'Zero problems claim' },
      { choiceIndex: 2, explanation: 'Throughput depends on hardware paths — SDN benefit is **policy/automation**, not automatic bandwidth.', misconceptionTested: 'SDN equals faster links' },
      { choiceIndex: 3, explanation: 'SDN adds a **control layer** — can reduce touch complexity, not increase it as a benefit.', misconceptionTested: 'Complexity as benefit' },
    ],
    examTip: 'Controller benefits: **centralized policy**, automation, consistent config — data plane still forwards locally.',
  },
  'obj-6.5-source-q001': {
    correct: {
      choiceIndex: 1,
      explanation: 'Automation scripts need the device **API reference** (RESTCONF/NETCONF/YANG) — what objects and methods exist.',
    },
    incorrect: [
      { choiceIndex: 0, explanation: 'GUI layout does not document programmable **API endpoints** for scripts.', misconceptionTested: 'UI layout as API doc' },
      { choiceIndex: 2, explanation: 'IOS **source code** is not published to customers — use **API/YANG models**.', misconceptionTested: 'Source code research' },
      { choiceIndex: 3, explanation: 'Storage internals are irrelevant — identify controllable objects via **API reference**.', misconceptionTested: 'Storage schema over API' },
    ],
    examTip: 'Script against device → read **API reference** + YANG models (RESTCONF/NETCONF).',
  },
}
