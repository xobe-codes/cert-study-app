/** Tier B trap wave 4 — +1 examTrap and +1 flashcard for objectives at 2 traps in coverage matrix. */

export const TIER_B_TRAP_WAVE4_PATCHES = {
  '2.3': {
    examTraps: [
      { id: '2.3-w4-t3', trap: 'Disabling CDP breaks IP routing on the router.', correction: 'CDP is Layer 2 neighbor discovery only — routing uses IP and routing protocols, not CDP.', ckuIds: ['CKU-CDP'] },
    ],
    flashcards: [
      { id: '2.3-w4-f3', ckuId: 'CKU-CDP', front: 'CDP Layer and scope?', back: 'Layer 2 Cisco-proprietary — directly connected neighbors on the same link only.' },
    ],
  },
  '2.4': {
    examTraps: [
      { id: '2.4-w4-t3', trap: 'EtherChannel load-balances per packet by default on all platforms.', correction: 'Load distribution uses a hash of addresses/ports — flows stay on one member link; not round-robin per packet.', ckuIds: ['CKU-ETHERCHANNEL'] },
    ],
    flashcards: [
      { id: '2.4-w4-f3', ckuId: 'CKU-ETHERCHANNEL', front: 'Minimum matching settings for a Port-channel?', back: 'Same speed, duplex, VLAN/trunk config, and channel-group number on all member ports.' },
    ],
  },
  '4.2': {
    examTraps: [
      { id: '4.2-w4-t3', trap: 'NTP client stratum 0 is more authoritative than stratum 1.', correction: 'Stratum 0 is the reference clock (not advertised); lower non-zero stratum = closer to the source.', ckuIds: ['CKU-NTP'] },
    ],
    flashcards: [
      { id: '4.2-w4-f3', ckuId: 'CKU-NTP', front: 'Verify NTP sync on Cisco IOS?', back: '`show ntp status` — look for synchronized and stratum.' },
    ],
  },
  '4.3': {
    examTraps: [
      { id: '4.3-w4-t3', trap: 'DHCP lease renewal requires a full DORA exchange.', correction: 'Renewal (T1) is unicast to the original server; rebinding (T2) may broadcast if the server moved.', ckuIds: ['CKU-DHCP'] },
    ],
    flashcards: [
      { id: '4.3-w4-f3', ckuId: 'CKU-DHCP', front: 'DHCP option 3 delivers?', back: 'Default gateway (router) IP address to the client.' },
    ],
  },
  '5.1': {
    examTraps: [
      { id: '5.1-w4-t3', trap: 'Encryption protects integrity; hashing protects confidentiality.', correction: 'Encryption protects confidentiality; hashing detects unauthorized changes (integrity).', ckuIds: ['CKU-CIA-TRIAD'] },
    ],
    flashcards: [
      { id: '5.1-w4-f7', ckuId: 'CKU-MITIGATION-TECHNIQUES', front: 'Primary mitigation for phishing?', back: 'User security awareness training — social engineering targets people first.' },
    ],
  },
  '5.2': {
    examTraps: [
      { id: '5.2-w4-t3', trap: 'Incident response is optional once firewalls are deployed.', correction: 'Process (IRP, change control, AUP) is a core program pillar — technology alone is insufficient.', ckuIds: ['CKU-SECURITY-PROGRAM'] },
    ],
    flashcards: [
      { id: '5.2-w4-f3', ckuId: 'CKU-SECURITY-PROGRAM', front: 'Change management in a security program?', back: 'Documented approval, testing, and rollback for config changes — reduces outages and misconfig risk.' },
    ],
  },
  '5.8': {
    examTraps: [
      { id: '5.8-w4-t3', trap: 'Open authentication SSIDs are secure when hidden.', correction: 'Hidden SSIDs are not encryption — open WLANs send traffic in cleartext regardless of broadcast name.', ckuIds: ['CKU-WLAN-SEC'] },
    ],
    flashcards: [
      { id: '5.8-w4-f3', ckuId: 'CKU-WLAN-SEC', front: '802.1X enterprise WLAN auth?', back: 'Per-user credentials via RADIUS — distinct from WPA2/3-Personal PSK.' },
    ],
  },
  '6.2': {
    examTraps: [
      { id: '6.2-w4-t2', trap: 'Controller-based networking eliminates distributed forwarding.', correction: 'Data plane forwarding stays on switches/routers; the controller centralizes control-plane decisions.', ckuIds: ['CKU-SDN-TRAD'] },
    ],
    flashcards: [
      { id: '6.2-w4-f3', ckuId: 'CKU-SDN-TRAD', front: 'Traditional vs SDN control plane?', back: 'Traditional: per-device CLI config. SDN: centralized controller pushes policy via southbound APIs.' },
    ],
  },
  '6.4': {
    examTraps: [
      { id: '6.4-w4-t2', trap: 'DNA Center assurance replaces `show` commands entirely.', correction: 'Assurance adds telemetry and health scores; engineers still verify with CLI for deep troubleshooting.', ckuIds: ['CKU-DNA'] },
    ],
    flashcards: [
      { id: '6.4-w4-f3', ckuId: 'CKU-DNA', front: 'DNA Center assurance value?', back: 'Proactive health checks, client/service issues, and guided remediation from centralized telemetry.' },
    ],
  },
  '6.5': {
    examTraps: [
      { id: '6.5-w4-t3', trap: 'PUT and PATCH are interchangeable for partial updates.', correction: 'PUT typically replaces the full resource; PATCH applies partial updates — semantics differ on APIs.', ckuIds: ['CKU-REST'] },
    ],
    flashcards: [
      { id: '6.5-w4-f3', ckuId: 'CKU-REST', front: 'REST statelessness means?', back: 'Each HTTP request carries complete context — server does not retain session state between calls.' },
    ],
  },
}
