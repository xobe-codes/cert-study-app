/** Gold debrief copy for CLI type-in skill questions (one per drilled objective). */
export const CLI_SKILL_GOLD = {
  '1.1-cli-0-show-a-summary-of-all-in': {
    explanation: '**`show ip interface brief`** is the first L3 sanity check — IP, method, and line protocol in one table.',
    examTip: 'Connectivity triage → **`show ip interface brief`** before deep `show interfaces`.',
  },
  '1.3-cli-0-show-interface-status-in': {
    explanation: '**`show interfaces status`** lists speed, duplex, VLAN, and **err-disabled** — faster than full counters for port health.',
    examTip: 'Port down / wrong VLAN → **`show interfaces status`** on the access switch.',
  },
  '1.4-cli-0-show-interface-error-cou': {
    explanation: '**`show interfaces counters errors`** isolates **CRC, runts, giants** — classic cable/duplex mismatch signals.',
    examTip: 'Flapping or slow link → check **error counters** before replacing routing config.',
  },
  '1.5-cli-0-show-dynamically-learned': {
    explanation: '**`show mac address-table dynamic`** ties a **MAC to a port** — essential for L2 reachability troubleshooting.',
    examTip: 'Host reachable on wrong VLAN? Verify **MAC learned on expected port**.',
  },
  '1.6-cli-0-enter-interface-configur': {
    explanation: 'From global config, **`interface gigabitethernet0/1`** (abbreviations OK) enters **interface configuration** mode.',
    examTip: 'Config sequence: **`conf t`** → **`interface …`** → L3/L2 commands.',
  },
  '1.8-cli-0-enable-ipv6-routing-on-t': {
    explanation: '**`ipv6 unicast-routing`** in global config enables the router to **forward IPv6** — required before routed v6 works.',
    examTip: 'IPv6 routes not forwarding? Confirm **`ipv6 unicast-routing`** first.',
  },
  '2.1-cli-0-create-vlan-20': {
    explanation: '**`vlan 20`** in global config creates VLAN 20 and enters **vlan config** mode for naming.',
    examTip: 'VLAN workflow: **`vlan <id>`** → **`name …`** → access port assignment.',
  },
  '2.2-cli-0-set-interface-gi0-1-to-t': {
    explanation: 'On a trunk-capable port, **`switchport mode trunk`** carries multiple VLANs with 802.1Q tags.',
    examTip: 'Inter-switch VLANs → **trunk** + **`allowed vlan`** list (and mind **native VLAN**).',
  },
  '2.3-cli-0-globally-disable-cdp-on-': {
    explanation: '**`no cdp run`** disables **CDP globally** — neighbor discovery stops on all interfaces unless re-enabled per port.',
    examTip: 'Disable discovery for security → **`no cdp run`** (global) vs **`no cdp enable`** (interface).',
  },
  '2.7-cli-0-show-switch-port-status-': {
    explanation: 'AP uplink issues often trace to **wrong mode/VLAN** — **`show interfaces status`** confirms access vs trunk and VLAN assignment.',
    examTip: 'WLAN client issues on wired side → verify **AP switch port mode + VLAN** before RF tuning.',
  },
  '2.8-cli-0-show-wlan-summary-ssid-p': {
    explanation: 'On a WLC, **`show wlan summary`** maps **WLAN ID → SSID, security, VLAN** — policy lives on the controller.',
    examTip: 'SSID missing or wrong VLAN → **`show wlan summary`** on the **WLC**, not only AP radio commands.',
  },
  '2.4-cli-0-on-interface-gi0-1-add-i': {
    explanation: '**`channel-group 1 mode active`** binds the port to **EtherChannel 1** using **LACP active** negotiation.',
    examTip: 'LACP pairing → **active/active** or **active/passive** — both ends must agree on mode.',
  },
  '3.3-cli-0-configure-a-static-route': {
    explanation: '**`ip route 192.168.30.0 255.255.255.0 10.0.0.2`** installs a static route via **next-hop** (or use exit interface where appropriate).',
    examTip: 'Static route syntax: **`ip route <net> <mask> <next-hop|interface>`**.',
  },
  '3.4-cli-0-enter-ospf-process-1-con': {
    explanation: '**`router ospf 1`** enters OSPF process **1** — process ID is **local**; areas must match for adjacency.',
    examTip: 'OSPF config: **`router ospf <pid>`** → **`network … area …`** under router config.',
  },
  '3.5-cli-0-on-interface-gi0-1-enabl': {
    explanation: '**`standby 1 ip 192.168.1.1`** enables **HSRP group 1** with virtual IP **192.168.1.1** on the interface.',
    examTip: 'FHRP on exams → **`standby <group> ip <vip>`**; clients use the **virtual IP**.',
  },
  '4.1-cli-0-mark-interface-gi0-0-as-': {
    explanation: '**`ip nat inside`** marks the **private/LAN** side — pair with **`ip nat outside`** on the public interface.',
    examTip: 'NAT direction matters: **inside** toward private hosts, **outside** toward Internet.',
  },
  '4.6-cli-0-create-a-dhcp-pool-named': {
    explanation: '**`ip dhcp pool LAN_POOL`** creates a named DHCP pool — then set **network, default-router, dns-server** inside pool config.',
    examTip: 'DHCP server: **`ip dhcp pool`** → **`network`** + **`default-router`**.',
  },
  '4.8-cli-0-set-the-domain-name-to-c': {
    explanation: '**`ip domain-name ccna.local`** sets the domain for **RSA key generation** and SSH host naming.',
    examTip: 'Before **`crypto key generate rsa`** → set **`ip domain-name`**.',
  },
  '5.3-cli-0-set-the-enable-secret-pa': {
    explanation: '**`enable secret ciscoenable`** stores the privileged password **hashed** — preferred over plaintext **`enable password`**. ',
    examTip: 'Privileged mode password → **`enable secret`** (encrypted) on CCNA.',
  },
  '5.5-cli-0-create-a-named-extended-': {
    explanation: '**`ip access-list extended BLOCK_TELNET`** creates a **named extended ACL** — match protocol/port near the source.',
    examTip: 'Extended ACL → **`ip access-list extended <name>`**; standard → **`standard`**. ',
  },
  '5.9-cli-0-show-wlan-security-setti': {
    explanation: '**`show wlan security 1`** verifies **WPA2-PSK / AES (CCMP)** for WLAN ID 1 — not WEP or TKIP.',
    examTip: 'WLAN security verify → **`show wlan security <wlan-id>`** on the WLC.',
  },
  '5.6-cli-0-on-an-access-port-enable': {
    explanation: '**`switchport port-security`** enables **MAC limiting** on an access port — interface must already be **access mode**.',
    examTip: 'Port security → access mode first, then **`switchport port-security`** + violation action.',
  },
}

export function goldCliReviewFor(questionId) {
  return CLI_SKILL_GOLD[questionId] || null
}
