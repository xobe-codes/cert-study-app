/** Tier B trap wave 8 — +1 examTrap and +1 flashcard for objectives not in waves 4–7. */

export const TIER_B_TRAP_WAVE8_PATCHES = {
  '1.10': {
    examTraps: [
      { id: '1.10-w8-t1', trap: 'Private IPv4 addresses are routable on the public Internet without NAT.', correction: 'RFC 1918 space (10/8, 172.16/12, 192.168/16) is not globally routable — NAT or proxy required for Internet access.', ckuIds: ['CKU-PRIVATE-IP'] },
    ],
    flashcards: [
      { id: '1.10-w8-f1', ckuId: 'CKU-PRIVATE-IP', front: 'RFC 1918 blocks?', back: '10.0.0.0/8 · 172.16.0.0/12 · 192.168.0.0/16 — use NAT at the edge.' },
    ],
  },
  '2.7': {
    examTraps: [
      { id: '2.7-w8-t1', trap: 'Changing the native VLAN on one trunk end is harmless if VLAN IDs match elsewhere.', correction: 'Native VLAN must match on both trunk ends — mismatch causes silent mis-tagging and hard-to-spot leaks.', ckuIds: ['CKU-NATIVE-VLAN'] },
    ],
    flashcards: [
      { id: '2.7-w8-f1', ckuId: 'CKU-NATIVE-VLAN', front: 'Native VLAN on trunk?', back: 'Untagged frames ride the native VLAN — both sides must agree (show interfaces trunk).' },
    ],
  },
  '3.2': {
    examTraps: [
      { id: '3.2-w8-t1', trap: 'A static route with only an exit interface works on all link types without a next-hop.', correction: 'Point-to-point links can use exit interface; multi-access (Ethernet) needs next-hop IP for ARP resolution.', ckuIds: ['CKU-STATIC-ROUTE'] },
    ],
    flashcards: [
      { id: '3.2-w8-f1', ckuId: 'CKU-STATIC-ROUTE', front: 'Static route syntax?', back: 'ip route <net> <mask> {next-hop | exit-intf [next-hop]} — serial P2P can omit next-hop.' },
    ],
  },
  '4.4': {
    examTraps: [
      { id: '4.4-w8-t1', trap: 'SNMPv2c community strings are encrypted on the wire.', correction: 'Community strings are sent in clear text — use SNMPv3 (authPriv) for encryption and integrity.', ckuIds: ['CKU-SNMP'] },
    ],
    flashcards: [
      { id: '4.4-w8-f1', ckuId: 'CKU-SNMP', front: 'SNMP versions on CCNA?', back: 'v2c = community (clear); v3 = user + auth/priv — prefer v3 in production.' },
    ],
  },
  '4.5': {
    examTraps: [
      { id: '4.5-w8-t1', trap: 'Syslog severity 0 is the least urgent message level.', correction: 'Severity 0 = Emergency (most critical); 7 = Debug (least urgent). Lower number = higher urgency.', ckuIds: ['CKU-SYSLOG'] },
    ],
    flashcards: [
      { id: '4.5-w8-f1', ckuId: 'CKU-SYSLOG', front: 'Syslog severity scale?', back: '0 Emerg → 7 Debug — logging trap level filters messages at and below that urgency.' },
    ],
  },
  '4.9': {
    examTraps: [
      { id: '4.9-w8-t1', trap: 'TFTP uses TCP port 69 for reliable file transfer.', correction: 'TFTP is UDP-based (port 69) — no TCP session; less overhead but no retransmission guarantee like FTP/SFTP.', ckuIds: ['CKU-TFTP'] },
    ],
    flashcards: [
      { id: '4.9-w8-f1', ckuId: 'CKU-TFTP', front: 'TFTP vs FTP?', back: 'TFTP = UDP/69, simple, no auth — common for IOS image copy on LAN; FTP/SFTP for secure transfers.' },
    ],
  },
  '5.4': {
    examTraps: [
      { id: '5.4-w8-t1', trap: 'Standard ACLs should be placed close to the destination to filter traffic early.', correction: 'Standard ACLs (source only) go **close to destination**; extended ACLs go **close to source** — placement is exam-critical.', ckuIds: ['CKU-ACL-PLACEMENT'] },
    ],
    flashcards: [
      { id: '5.4-w8-f1', ckuId: 'CKU-ACL-PLACEMENT', front: 'ACL placement rule?', back: 'Standard → near **destination** | Extended → near **source**.' },
    ],
  },
  '5.7': {
    examTraps: [
      { id: '5.7-w8-t1', trap: 'Port security sticky MACs survive reload without saving config.', correction: 'Sticky learned MACs stay in running config — **`copy run start`** (or write mem) required to survive reload.', ckuIds: ['CKU-PORTSEC'] },
    ],
    flashcards: [
      { id: '5.7-w8-f1', ckuId: 'CKU-PORTSEC', front: 'Port security violation modes?', back: 'protect (drop) · restrict (drop + log) · shutdown (err-disable port).' },
    ],
  },
  '6.1': {
    examTraps: [
      { id: '6.1-w8-t1', trap: 'Automation means replacing all CLI with Python on every device immediately.', correction: 'CCNA automation = APIs/NetConf/RESTCONF + templates — often augments CLI; start with repeatable tasks (config backup, VLAN deploy).', ckuIds: ['CKU-AUTOMATION'] },
    ],
    flashcards: [
      { id: '6.1-w8-f1', ckuId: 'CKU-AUTOMATION', front: 'Southbound vs northbound API?', back: 'Southbound = controller→device (NetConf); Northbound = app→controller (REST API).' },
    ],
  },
  '6.3': {
    examTraps: [
      { id: '6.3-w8-t1', trap: 'JSON uses Python-style True/False/None literals.', correction: 'JSON requires lowercase **true/false/null** — invalid JSON breaks REST API parsers and Ansible templates.', ckuIds: ['CKU-JSON'] },
    ],
    flashcards: [
      { id: '6.3-w8-f1', ckuId: 'CKU-JSON', front: 'JSON data types?', back: 'string, number, boolean, null, array [], object {} — keys must be double-quoted.' },
    ],
  },
}
