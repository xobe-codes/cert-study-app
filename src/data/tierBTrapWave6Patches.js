/** Tier B trap wave 6 — +1 examTrap and +1 flashcard for fundamentals + automation objectives. */

export const TIER_B_TRAP_WAVE6_PATCHES = {
  '1.1': {
    examTraps: [
      { id: '1.1-w6-t1', trap: 'Switches and routers both operate at Layer 2.', correction: 'Switches forward on MAC (L2); routers forward on IP (L3) — know the default device role.', ckuIds: ['CKU-OSI'] },
    ],
    flashcards: [
      { id: '1.1-w6-f1', ckuId: 'CKU-OSI', front: 'PDU at each layer?', back: 'L2 frame, L3 packet, L4 segment — match device to layer before troubleshooting.' },
    ],
  },
  '1.5': {
    examTraps: [
      { id: '1.5-w6-t1', trap: 'UDP is always faster so TCP should never be used for video.', correction: 'Many video apps use TCP (HTTP/DASH) — UDP suits real-time VoIP where loss is tolerable.', ckuIds: ['CKU-TCP-UDP'] },
    ],
    flashcards: [
      { id: '1.5-w6-f1', ckuId: 'CKU-TCP-UDP', front: 'TCP vs UDP ports?', back: 'Both use 16-bit ports — difference is reliability/connection, not port numbering.' },
    ],
  },
  '1.6': {
    examTraps: [
      { id: '1.6-w6-t1', trap: 'IPv6 link-local addresses are routable across the internet.', correction: 'fe80::/10 is segment-local only — not forwarded by routers off-link.', ckuIds: ['CKU-IPV6'] },
    ],
    flashcards: [
      { id: '1.6-w6-f1', ckuId: 'CKU-IPV6', front: 'IPv6 shortened notation?', back: 'Drop leading zeros per hextet; :: once for longest zero run — e.g. 2001:db8::1.' },
    ],
  },
  '1.7': {
    examTraps: [
      { id: '1.7-w6-t1', trap: 'A /25 subnet always has 254 usable host addresses.', correction: '/25 = 128 addresses, 126 usable — host bits determine count, not classful assumptions.', ckuIds: ['CKU-SUBNETTING'] },
    ],
    flashcards: [
      { id: '1.7-w6-f1', ckuId: 'CKU-SUBNETTING', front: 'Usable hosts formula?', back: '2^host_bits − 2 (subtract network and broadcast) for IPv4 subnets.' },
    ],
  },
  '1.8': {
    examTraps: [
      { id: '1.8-w6-t1', trap: '5 GHz Wi-Fi always has longer range than 2.4 GHz.', correction: '5 GHz is shorter range/higher throughput; 2.4 GHz penetrates walls better.', ckuIds: ['CKU-WIRELESS-BANDS'] },
    ],
    flashcards: [
      { id: '1.8-w6-f1', ckuId: 'CKU-WIRELESS-BANDS', front: 'Non-overlapping 2.4 GHz channels?', back: '1, 6, 11 (in North America) — avoid adjacent channel overlap.' },
    ],
  },
  '1.9': {
    examTraps: [
      { id: '1.9-w6-t1', trap: 'Collapsed core means eliminating the distribution layer in all designs.', correction: 'Collapsed core merges distribution+core for smaller sites — large campus still uses three tiers.', ckuIds: ['CKU-ARCHITECTURE'] },
    ],
    flashcards: [
      { id: '1.9-w6-f1', ckuId: 'CKU-ARCHITECTURE', front: 'Access layer role?', back: 'End-user connectivity, port security, VLAN assignment — not WAN aggregation.' },
    ],
  },
  '5.11': {
    examTraps: [
      { id: '5.11-w6-t1', trap: 'Network segmentation only means creating more VLANs without ACLs.', correction: 'Segmentation requires enforcement — ACLs/firewall between zones, not VLAN labels alone.', ckuIds: ['CKU-SEGMENTATION'] },
    ],
    flashcards: [
      { id: '5.11-w6-f1', ckuId: 'CKU-SEGMENTATION', front: 'Zero-trust principle?', back: 'Never trust, always verify — least privilege per segment, not flat trusted LAN.' },
    ],
  },
  '6.2': {
    examTraps: [
      { id: '6.2-w6-t1', trap: 'The SDN control plane forwards user traffic at line rate.', correction: 'Control plane programs policy; data plane switches forward packets — separation of planes.', ckuIds: ['CKU-SDN-TRAD'] },
    ],
    flashcards: [
      { id: '6.2-w6-f1', ckuId: 'CKU-SDN-TRAD', front: 'Traditional vs SDN control?', back: 'Distributed per device vs centralized controller programming many devices.' },
    ],
  },
  '6.5': {
    examTraps: [
      { id: '6.5-w6-t1', trap: 'HTTP 404 means the server is down.', correction: '404 Not Found — resource path missing; server may be up (try 5xx for server errors).', ckuIds: ['CKU-REST'] },
    ],
    flashcards: [
      { id: '6.5-w6-f1', ckuId: 'CKU-REST', front: 'REST vs SOAP?', back: 'REST uses HTTP verbs + JSON/XML; SOAP is XML envelope over HTTP/SMTP — heavier.' },
    ],
  },
  '6.6': {
    examTraps: [
      { id: '6.6-w6-t1', trap: 'YAML playbooks and JSON configs are interchangeable syntax.', correction: 'Ansible playbooks use YAML; device APIs often return JSON — different formats, same automation goal.', ckuIds: ['CKU-JSON-ANSIBLE'] },
    ],
    flashcards: [
      { id: '6.6-w6-f1', ckuId: 'CKU-JSON-ANSIBLE', front: 'Ansible inventory defines?', back: 'Target hosts/groups playbooks run against — not the IOS image on flash.' },
    ],
  },
}
