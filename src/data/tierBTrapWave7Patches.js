/** Tier B trap wave 7 — +1 examTrap and +1 flashcard for routing/L2/NAT/ACL gaps. */

export const TIER_B_TRAP_WAVE7_PATCHES = {
  '2.1': {
    examTraps: [
      { id: '2.1-w7-t1', trap: 'A switch increases the size of a single collision domain.', correction: 'Each switch port is its own collision domain — hubs share one domain across all ports.', ckuIds: ['CKU-COLLISION'] },
    ],
    flashcards: [
      { id: '2.1-w7-f1', ckuId: 'CKU-COLLISION', front: 'Collision vs broadcast domain?', back: 'Switch port = collision domain; VLAN = broadcast domain boundary.' },
    ],
  },
  '2.2': {
    examTraps: [
      { id: '2.2-w7-t1', trap: 'Auto-negotiation always picks the best speed so duplex never mismatches.', correction: 'Auto can settle half on one side, full on the other — verify with show interfaces.', ckuIds: ['CKU-DUPLEX'] },
    ],
    flashcards: [
      { id: '2.2-w7-f1', ckuId: 'CKU-DUPLEX', front: 'Duplex mismatch symptom?', back: 'Late collisions, slow throughput, CRC errors — fix both ends to same duplex.' },
    ],
  },
  '2.5': {
    examTraps: [
      { id: '2.5-w7-t1', trap: 'STP blocks all redundant links permanently.', correction: 'STP blocks redundant paths to prevent loops — one forwarding path per VLAN, others blocked not deleted.', ckuIds: ['CKU-STP-ROOT'] },
    ],
    flashcards: [
      { id: '2.5-w7-f1', ckuId: 'CKU-STP-ROOT', front: 'STP port states order?', back: 'Blocking → Listening → Learning → Forwarding (Disabled if err-disabled).' },
    ],
  },
  '3.1': {
    examTraps: [
      { id: '3.1-w7-t1', trap: 'Administrative distance and metric are the same thing.', correction: 'AD picks between protocols (lower wins); metric ranks routes within one protocol.', ckuIds: ['CKU-ROUTING-TABLE'] },
    ],
    flashcards: [
      { id: '3.1-w7-f1', ckuId: 'CKU-ROUTING-TABLE', front: 'Default AD values?', back: 'Connected 0, static 1, OSPF 110, EIGRP 90 internal — lower is more trusted.' },
    ],
  },
  '3.4': {
    examTraps: [
      { id: '3.4-w7-t1', trap: 'OSPF passive-interface stops hellos on all interfaces including point-to-point WAN.', correction: 'Passive suppresses hellos on matching interfaces — use on LANs with no OSPF peers, not where neighbors are required.', ckuIds: ['CKU-OSPF-NETWORK'] },
    ],
    flashcards: [
      { id: '3.4-w7-f1', ckuId: 'CKU-OSPF-NETWORK', front: 'OSPF neighbor state FULL?', back: 'Full = databases synchronized — stuck in ExStart/Exchange often MTU or subnet mismatch.' },
    ],
  },
  '4.1': {
    examTraps: [
      { id: '4.1-w7-t1', trap: 'NAT inside/outside labels refer to physical cable direction only.', correction: 'Inside/outside are logical roles — inside = addresses translated; outside = global pool/Internet side.', ckuIds: ['CKU-NAT-PAT'] },
    ],
    flashcards: [
      { id: '4.1-w7-f1', ckuId: 'CKU-NAT-PAT', front: 'PAT vs static NAT?', back: 'PAT (overload) = many→one with ports; static NAT = one-to-one fixed mapping.' },
    ],
  },
  '5.5': {
    examTraps: [
      { id: '5.5-w7-t1', trap: 'Standard ACLs can filter by source and destination IP.', correction: 'Standard ACLs match source only — extended ACLs match source, destination, and ports.', ckuIds: ['CKU-ACL-PLACEMENT'] },
    ],
    flashcards: [
      { id: '5.5-w7-f1', ckuId: 'CKU-ACL-PLACEMENT', front: 'ACL numbering ranges?', back: '1–99/1300–1999 standard; 100–199/2000–2699 extended — named ACLs preferred.' },
    ],
  },
  '3.3': {
    examTraps: [
      { id: '3.3-w7-t1', trap: 'A floating static route with AD 250 will beat OSPF (AD 110).', correction: 'Lower AD wins — floating static uses higher AD as backup, not primary.', ckuIds: ['CKU-STATIC-ROUTE'] },
    ],
    flashcards: [
      { id: '3.3-w7-f1', ckuId: 'CKU-STATIC-ROUTE', front: 'Static route next-hop vs exit-intf?', back: 'Point-to-point: exit interface OK; multi-access needs next-hop IP for ARP resolution.' },
    ],
  },
  '5.3': {
    examTraps: [
      { id: '5.3-w7-t1', trap: 'DHCP snooping trusts all ports by default.', correction: 'Untrusted by default — only uplinks to legitimate DHCP servers are trusted.', ckuIds: ['CKU-DHCP-SNOOP'] },
    ],
    flashcards: [
      { id: '5.3-w7-f1', ckuId: 'CKU-DHCP-SNOOP', front: 'DHCP snooping + DAI?', back: 'Snooping builds binding table; DAI validates ARP against bindings — both need trusted uplinks.' },
    ],
  },
  '5.6': {
    examTraps: [
      { id: '5.6-w7-t1', trap: 'Port security violation restrict shuts down the port immediately.', correction: 'restrict drops offending traffic but stays up; shutdown err-disables the port.', ckuIds: ['CKU-PORTSEC'] },
    ],
    flashcards: [
      { id: '5.6-w7-f1', ckuId: 'CKU-PORTSEC', front: 'Port security sticky?', back: 'sticky learns MACs dynamically and saves to running config — survives reload if saved.' },
    ],
  },
}
