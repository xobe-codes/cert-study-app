/** Tier B trap wave 5 — +1 examTrap and +1 flashcard for objectives still at thin trap coverage. */

export const TIER_B_TRAP_WAVE5_PATCHES = {
  '2.6': {
    examTraps: [
      { id: '2.6-w5-t3', trap: 'Autonomous APs join a WLC via CAPWAP.', correction: 'Autonomous (standalone) APs do not join a WLC — lightweight/flex APs use CAPWAP to a controller.', ckuIds: ['CKU-WLAN-ARCH'] },
    ],
    flashcards: [
      { id: '2.6-w5-f3', ckuId: 'CKU-WLAN-ARCH', front: 'Lightweight AP control path?', back: 'CAPWAP tunnel to WLC — config and SSIDs pushed from controller.' },
    ],
  },
  '2.8': {
    examTraps: [
      { id: '2.8-w5-t3', trap: 'WPA3-Personal is the CCNA default for all legacy questions.', correction: 'CCNA 200-301 still emphasizes WPA2-Personal (AES/PSK) — know WPA2 exam language first.', ckuIds: ['CKU-WLAN-CLIENT'] },
    ],
    flashcards: [
      { id: '2.8-w5-f3', ckuId: 'CKU-WLAN-CLIENT', front: 'WLAN client association failure — check?', back: 'SSID, security policy (WPA2-AES), VLAN mapping, and signal/RSSI.' },
    ],
  },
  '3.5': {
    examTraps: [
      { id: '3.5-w5-t3', trap: 'VRRP and HSRP use the same virtual MAC format.', correction: 'HSRP uses 0000.0c07.acxx; VRRP uses 0000.5e00.01xx — different vendor patterns.', ckuIds: ['CKU-HSRP'] },
    ],
    flashcards: [
      { id: '3.5-w5-f3', ckuId: 'CKU-HSRP', front: 'HSRP preempt does what?', back: 'Higher-priority router takes Active when it comes back online.' },
    ],
  },
  '3.6': {
    examTraps: [
      { id: '3.6-w5-t3', trap: 'Administrative distance picks the forwarding path for different prefix lengths.', correction: 'Longest match forwards; AD only breaks ties when installing the same prefix.', ckuIds: ['CKU-ROUTE-TROUBLESHOOT'] },
    ],
    flashcards: [
      { id: '3.6-w5-f3', ckuId: 'CKU-ROUTE-TROUBLESHOOT', front: 'Host reaches subnet but not internet?', back: 'Check default route / gateway of last resort first.' },
    ],
  },
  '4.6': {
    examTraps: [
      { id: '4.6-w5-t3', trap: 'ip helper-address belongs on the DHCP server interface.', correction: 'Helper goes on the client-facing router interface — relays broadcasts to the server.', ckuIds: ['CKU-DHCP-RELAY'] },
    ],
    flashcards: [
      { id: '4.6-w5-f3', ckuId: 'CKU-DHCP-RELAY', front: 'Verify DHCP relay working?', back: '`show ip dhcp binding` on server; `debug ip dhcp server packet` in lab.' },
    ],
  },
  '4.7': {
    examTraps: [
      { id: '4.7-w5-t3', trap: 'DSCP EF is 34 decimal.', correction: 'EF = DSCP 46 decimal — expedited forwarding for voice/video.', ckuIds: ['CKU-QOS-PHB'] },
    ],
    flashcards: [
      { id: '4.7-w5-f3', ckuId: 'CKU-QOS-PHB', front: 'LLQ is used for?', back: 'Strict priority queue — low latency for voice (often EF marked).' },
    ],
  },
  '4.8': {
    examTraps: [
      { id: '4.8-w5-t3', trap: 'transport input telnet ssh allows both securely.', correction: 'Telnet is cleartext — secure remote admin uses `transport input ssh` only.', ckuIds: ['CKU-SSH'] },
    ],
    flashcards: [
      { id: '4.8-w5-f3', ckuId: 'CKU-SSH', front: 'SSH v2 requires?', back: 'RSA keys (`crypto key generate rsa`) + `ip domain-name` + `transport input ssh`.' },
    ],
  },
  '5.3': {
    examTraps: [
      { id: '5.3-w5-t3', trap: 'service password-encryption reverses all passwords in show run.', correction: 'It encrypts Type 7 passwords in config — `secret` passwords use stronger hashing separately.', ckuIds: ['CKU-DEVICE-ACCESS'] },
    ],
    flashcards: [
      { id: '5.3-w5-f3', ckuId: 'CKU-DEVICE-ACCESS', front: 'Secure local user password command?', back: '`username name secret password` — preferred over `password`.' },
    ],
  },
  '5.6': {
    examTraps: [
      { id: '5.6-w5-t3', trap: 'Port-security restrict mode shuts down the port.', correction: 'Restrict drops offending traffic and logs — shutdown mode err-disables the interface.', ckuIds: ['CKU-PORT-SECURITY'] },
    ],
    flashcards: [
      { id: '5.6-w5-f3', ckuId: 'CKU-PORT-SECURITY', front: 'Recover err-disabled port-security port?', back: 'Fix violation cause, then `shutdown` + `no shutdown` on interface.' },
    ],
  },
  '5.10': {
    examTraps: [
      { id: '5.10-w5-t3', trap: 'GRE and IPsec are interchangeable terms.', correction: 'GRE is encapsulation; IPsec provides encryption — often used together but distinct.', ckuIds: ['CKU-VPN'] },
    ],
    flashcards: [
      { id: '5.10-w5-f3', ckuId: 'CKU-VPN', front: 'Remote-access vs site-to-site VPN?', back: 'Remote-access: client to head-end. Site-to-site: gateway to gateway.' },
    ],
  },
}
