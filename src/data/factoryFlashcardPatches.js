/** Flashcard enrichment for Tier C factory objectives (zero native flashcards). */

export const FACTORY_FLASHCARD_PATCHES = {
  '2.3': {
    flashcards: [
      { id: '2.3-f1', ckuId: 'CKU-CDP', front: 'Default CDP timers?', back: 'Advertisement every 60 s; hold-time 180 s (3× interval).' },
      { id: '2.3-f2', ckuId: 'CKU-LLDP', front: 'Enable LLDP globally on Cisco IOS?', back: '`lldp run` — then verify with `show lldp neighbors`.' },
    ],
  },
  '2.4': {
    flashcards: [
      { id: '2.4-f1', ckuId: 'CKU-LACP', front: 'LACP modes that negotiate?', back: '`active` and `passive` — both sides must use LACP (not `on`).' },
      { id: '2.4-f2', ckuId: 'CKU-ETHERCHANNEL', front: 'Where do you assign IP/VLAN on an EtherChannel?', back: 'On the Port-channel interface — not on individual member links.' },
    ],
  },
  '2.6': {
    flashcards: [
      { id: '2.6-f1', ckuId: 'CKU-WLAN-ARCH', front: 'Lightweight vs Autonomous AP?', back: 'Lightweight: CAPWAP to WLC, no local config. Autonomous: standalone IOS on AP.' },
      { id: '2.6-f2', ckuId: 'CKU-WLAN-ARCH', front: 'FlexConnect use case?', back: 'Branch sites — local switching at AP with central WLC management; survives WAN loss.' },
    ],
  },
  '2.7': {
    flashcards: [
      { id: '2.7-f1', ckuId: 'CKU-WLAN-PHYS', front: 'Typical AP uplink to switch?', back: 'Trunk or access VLAN for management + client SSID traffic; PoE from switch.' },
      { id: '2.7-f2', ckuId: 'CKU-WLAN-PHYS', front: 'CAPWAP control/data ports?', back: 'UDP 5246 (control), UDP 5247 (data) between AP and WLC.' },
    ],
  },
  '2.8': {
    flashcards: [
      { id: '2.8-f1', ckuId: 'CKU-WLAN-CLIENT', front: 'WPA2-Personal encryption on CCNA?', back: 'WPA2 with AES (CCMP) and PSK passphrase.' },
      { id: '2.8-f2', ckuId: 'CKU-WLAN-CLIENT', front: 'SSID alone enough for connectivity?', back: 'No — need security profile, VLAN/interface mapping, and DHCP/DNS reachability.' },
    ],
  },
  '3.5': {
    flashcards: [
      { id: '3.5-f1', ckuId: 'CKU-HSRP', front: 'HSRP Active vs Standby?', back: 'Active forwards for virtual IP; Standby listens. Higher priority wins; preempt reclaims Active.' },
      { id: '3.5-f2', ckuId: 'CKU-FHRP', front: 'Default HSRP hello/hold timers?', back: 'Hello 3 s, hold 10 s (3 missed hellos → role change).' },
    ],
  },
  '3.6': {
    flashcards: [
      { id: '3.6-f1', ckuId: 'CKU-ROUTE-TSHOOT', front: 'Ping fails — first three checks?', back: 'Interface up/up → ARP/neighbor → routing table entry for destination.' },
      { id: '3.6-f2', ckuId: 'CKU-ROUTE-TSHOOT', front: 'Static route in config but not in table?', back: 'Next-hop unreachable or exit interface down — IOS drops the route.' },
    ],
  },
  '4.2': {
    flashcards: [
      { id: '4.2-f1', ckuId: 'CKU-NTP', front: 'NTP stratum meaning?', back: 'Lower stratum = closer to reference clock. Client stratum = server stratum + 1.' },
      { id: '4.2-f2', ckuId: 'CKU-NTP', front: '`clock set` vs NTP?', back: '`clock set` is manual one-time; NTP continuously syncs to authoritative servers.' },
    ],
  },
  '4.3': {
    flashcards: [
      { id: '4.3-f1', ckuId: 'CKU-DHCP', front: 'DHCP DORA order?', back: 'Discover (client) → Offer (server) → Request (client) → Acknowledge (server).' },
      { id: '4.3-f2', ckuId: 'CKU-DNS', front: 'How do clients learn DNS server?', back: 'DHCP option 6 delivers DNS server IP(s) with the lease.' },
    ],
  },
  '4.4': {
    flashcards: [
      { id: '4.4-f1', ckuId: 'CKU-SNMP', front: 'SNMPv2c security caveat?', back: 'Community strings sent in clear text — use SNMPv3 for auth/encryption.' },
      { id: '4.4-f2', ckuId: 'CKU-SNMP', front: 'SNMP GET vs TRAP direction?', back: 'GET/GET-NEXT: manager polls agent. TRAP/INFORM: agent alerts manager.' },
    ],
  },
  '4.5': {
    flashcards: [
      { id: '4.5-f1', ckuId: 'CKU-SYSLOG', front: 'Syslog severity scale?', back: '0 emergency (most critical) through 7 debug — lower number = more severe.' },
      { id: '4.5-f2', ckuId: 'CKU-SYSLOG', front: 'Reliable syslog timestamps require?', back: 'NTP sync first — unsynced clocks break cross-device correlation.' },
    ],
  },
  '4.6': {
    flashcards: [
      { id: '4.6-f1', ckuId: 'CKU-DHCP-RELAY', front: 'Where does `ip helper-address` go?', back: 'On the router interface facing the client subnet — not on the DHCP server.' },
      { id: '4.6-f2', ckuId: 'CKU-DHCP-RELAY', front: 'What does DHCP relay do?', back: 'Forwards client DHCP broadcasts to a remote server as unicast; returns replies to client.' },
    ],
  },
  '4.7': {
    flashcards: [
      { id: '4.7-f1', ckuId: 'CKU-QOS-PHB', front: 'Does QoS create bandwidth?', back: 'No — it prioritizes/manages existing bandwidth via marking and queuing (PHB).' },
      { id: '4.7-f2', ckuId: 'CKU-QOS-PHB', front: 'DSCP EF value?', back: 'EF = 46 (decimal) — expedited forwarding for voice/video; often strict priority queue.' },
    ],
  },
  '4.8': {
    flashcards: [
      { id: '4.8-f1', ckuId: 'CKU-SSH', front: 'SSH prerequisite on Cisco IOS?', back: 'Hostname + domain-name, then `crypto key generate rsa`; restrict VTY with `transport input ssh`.' },
      { id: '4.8-f2', ckuId: 'CKU-SSH', front: 'Telnet vs SSH for management?', back: 'Telnet cleartext credentials; SSH encrypts session — CCNA expects SSH-only remote access.' },
    ],
  },
  '4.9': {
    flashcards: [
      { id: '4.9-f1', ckuId: 'CKU-TFTP-FTP', front: 'TFTP transport and port?', back: 'UDP port 69, connectionless, no authentication — common for IOS copy to/from flash.' },
      { id: '4.9-f2', ckuId: 'CKU-TFTP-FTP', front: 'FTP vs TFTP for IOS backup?', back: 'FTP uses TCP/21 + data channel and can require login; TFTP is simpler but less secure.' },
    ],
  },
  '4.10': {
    flashcards: [
      { id: '4.10-f1', ckuId: 'CKU-MGMT-CLOUD', front: 'Cloud controller vs local CLI?', back: 'DNA Center adds orchestration/assurance; IOS CLI remains on each device for troubleshooting.' },
      { id: '4.10-f2', ckuId: 'CKU-MGMT-CLOUD', front: 'Intent-based networking?', back: 'Declare desired outcome; controller translates to device config and validates compliance.' },
    ],
  },
  '5.2': {
    flashcards: [
      { id: '5.2-f1', ckuId: 'CKU-SECURITY-PROGRAM', front: 'Security program three pillars?', back: 'People (training), process (IRP/AUP), technology (ACLs, AAA, segmentation).' },
      { id: '5.2-f2', ckuId: 'CKU-SECURITY-PROGRAM', front: 'Physical security in network program?', back: 'Protect consoles, racks, cabling — unauthorized physical access bypasses logical controls.' },
    ],
  },
  '5.3': {
    flashcards: [
      { id: '5.3-f1', ckuId: 'CKU-PRIVILEGE-LEVELS', front: '`enable secret` vs `enable password`?', back: 'Secret is hashed in config; password is reversible plaintext — always use secret.' },
      { id: '5.3-f2', ckuId: 'CKU-CONSOLE-VTY', front: 'Secure VTY access pattern?', back: 'Local user + `login local` + `transport input ssh` + RSA keys generated.' },
    ],
  },
  '5.4': {
    flashcards: [
      { id: '5.4-f1', ckuId: 'CKU-AAA-SERVERS', front: 'TACACS+ vs RADIUS ports?', back: 'TACACS+ TCP/49 (Cisco, separates AAA). RADIUS UDP/1812 authentication.' },
      { id: '5.4-f2', ckuId: 'CKU-AAA-SERVERS', front: 'Per-command authorization — TACACS+ or RADIUS?', back: 'TACACS+ — separates auth, authorization, accounting; better for granular CLI auth.' },
    ],
  },
  '5.6': {
    flashcards: [
      { id: '5.6-f1', ckuId: 'CKU-PORT-SECURITY', front: 'Port security violation modes?', back: 'Protect (drop), Restrict (drop + log), Shutdown (err-disable port).' },
      { id: '5.6-f2', ckuId: 'CKU-DHCP-SNOOPING', front: 'DHCP snooping trusted port?', back: 'Uplink toward legitimate DHCP server — untrusted access ports drop rogue offers.' },
    ],
  },
  '5.7': {
    flashcards: [
      { id: '5.7-f1', ckuId: 'CKU-AAA-CONCEPTS', front: 'AAA order of operations?', back: 'Authentication (who) → Authorization (what allowed) → Accounting (audit log).' },
      { id: '5.7-f2', ckuId: 'CKU-AAA-CONCEPTS', front: 'Authentication vs Authorization?', back: 'AuthN verifies identity; AuthZ decides permitted commands/actions after login.' },
    ],
  },
  '5.8': {
    flashcards: [
      { id: '5.8-f1', ckuId: 'CKU-WLAN-SEC', front: 'Enterprise WLAN encryption standard?', back: 'WPA2-AES (CCMP) or WPA3 — never WEP in production.' },
      { id: '5.8-f2', ckuId: 'CKU-WLAN-SEC', front: 'WPA3-Personal improvement?', back: 'SAE (Simultaneous Authentication of Equals) — stronger key exchange vs WPA2-PSK.' },
    ],
  },
  '5.10': {
    flashcards: [
      { id: '5.10-f1', ckuId: 'CKU-VPN', front: 'Site-to-site vs remote-access VPN?', back: 'Site-to-site: gateway-to-gateway connects networks. Remote-access: individual user to network.' },
      { id: '5.10-f2', ckuId: 'CKU-VPN', front: 'IPsec provides?', back: 'Confidentiality (ESP encrypt), integrity/authentication (AH or ESP), anti-replay.' },
    ],
  },
  '5.11': {
    flashcards: [
      { id: '5.11-f1', ckuId: 'CKU-SEGMENTATION', front: 'VLANs alone secure a network?', back: 'No — VLANs are L2 boundaries; routing/ACLs/firewalls still needed between segments.' },
      { id: '5.11-f2', ckuId: 'CKU-SEGMENTATION', front: 'Micro-segmentation goal?', back: 'Limit lateral movement by dividing trust zones (VLANs, VRFs, firewalls per segment).' },
    ],
  },
}
